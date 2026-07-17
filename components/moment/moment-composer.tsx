"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Film, ShieldCheck, Upload, X } from "lucide-react";
import { VideoPreview } from "./video-preview";
import { browserMediaService, type MediaPreview } from "@/lib/media/media-service";
import { createSupabaseMomentService, validateMomentText } from "@/lib/moments/moment-service";
import { createSupabaseUploadService, MAX_VIDEO_BYTES, MAX_VIDEO_SECONDS, validateVideoDuration, validateVideoFile } from "@/lib/upload/upload-service";
import type { MomentView, OfficialEventView } from "@/lib/txline/replay-fixture";

type ComposerStatus = "editing" | "uploading" | "publishing" | "success" | "error";

export function MomentComposer({ matchId, event, open, onClose, onPublished }: { matchId: string; event: OfficialEventView; open: boolean; onClose: () => void; onPublished: (moment: MomentView) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<MediaPreview | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ComposerStatus>("editing");
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [publishedMoment, setPublishedMoment] = useState<MomentView | null>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (keyboardEvent: KeyboardEvent) => keyboardEvent.key === "Escape" && status !== "uploading" && onClose();
    document.addEventListener("keydown", onKey);
    window.setTimeout(() => dialogRef.current?.focus(), 0);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = previousOverflow; previous?.focus(); };
  }, [open, onClose, status]);

  const resetMedia = () => {
    if (preview && status !== "success") browserMediaService.releasePreview(preview.url);
    setFile(null); setPreview(null); setProgress(0); setStatus("editing");
    setErrors((current) => ({ ...current, video: "" }));
    if (inputRef.current) inputRef.current.value = "";
  };

  const selectFile = async (nextFile?: File) => {
    if (!nextFile) return;
    const fileError = validateVideoFile(nextFile);
    if (fileError) { setErrors((current) => ({ ...current, video: fileError })); setStatus("error"); return; }
    if (preview) browserMediaService.releasePreview(preview.url);
    setErrors((current) => ({ ...current, video: "" }));
    setStatus("editing");
    try {
      const nextPreview = await browserMediaService.createPreview(nextFile);
      const durationError = validateVideoDuration(nextPreview.durationSeconds);
      if (durationError) {
        browserMediaService.releasePreview(nextPreview.url);
        setErrors((current) => ({ ...current, video: durationError }));
        setStatus("error");
        return;
      }
      setFile(nextFile); setPreview(nextPreview);
    } catch (error) {
      setErrors((current) => ({ ...current, video: error instanceof Error ? error.message : "This MP4 could not be previewed." }));
      setStatus("error");
    }
  };

  const selectDemoFile = async () => {
    try { await selectFile(await browserMediaService.getDemoFile()); }
    catch (error) { setErrors((current) => ({ ...current, video: error instanceof Error ? error.message : "The demo clip is unavailable." })); setStatus("error"); }
  };

  const publish = async () => {
    const textErrors = validateMomentText(title, description);
    if (!file || !preview) textErrors.video = "Choose an MP4 to publish.";
    setErrors(textErrors);
    if (Object.keys(textErrors).length > 0 || !file || !preview) { setStatus("error"); return; }
    try {
      setStatus("uploading"); setProgress(0);
      const uploadService = await createSupabaseUploadService();
      const media = await uploadService.upload({ file, previewUrl: preview.url, onProgress: setProgress });
      setStatus("publishing");
      const momentService = await createSupabaseMomentService();
      const moment = await momentService.create({ matchId, title, description, durationSeconds: preview.durationSeconds, event, media });
      setPublishedMoment(moment); setStatus("success"); onPublished(moment);
    } catch {
      setStatus("error"); setErrors((current) => ({ ...current, submit: "Your Moment could not be published. Your draft is safe—try again." }));
    }
  };

  const close = () => {
    if (status === "uploading" || status === "publishing") return;
    if (!publishedMoment && preview) browserMediaService.releasePreview(preview.url);
    onClose();
  };

  return <AnimatePresence>{open && <motion.div className="composer-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && close()}>
    <motion.div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="composer-title" className="moment-composer" initial={{ opacity: 0, y: 18, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .99 }} transition={{ duration: .28, ease: [.2,.8,.2,1] }}>
      {status === "success" && publishedMoment ? <div className="publish-success">
        <motion.div className="success-mark" initial={{ scale: .7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><Check size={30} /></motion.div>
        <span className="eyebrow">Moment published</span><h2>This match has your voice now.</h2>
        <p><strong>{publishedMoment.title}</strong> is now part of the shared story around {publishedMoment.eventLabel}.</p>
        <div className="success-event"><ShieldCheck size={17} /><span>Linked to official TxLINE event</span></div>
        <button type="button" className="primary-button" onClick={close}>See your Moment</button>
      </div> : <>
        <header className="composer-header"><div><span className="eyebrow">Capture your Moment</span><h2 id="composer-title">Make the reaction unforgettable.</h2><p>{event.minute} {event.title} • {event.team}</p></div><button type="button" className="icon-button" onClick={close} aria-label="Close Moment composer"><X /></button></header>
        <div className="composer-body">
          <div className="composer-media-column">
            <input ref={inputRef} className="visually-hidden" type="file" accept="video/mp4" onChange={(changeEvent) => selectFile(changeEvent.target.files?.[0])} />
            {preview ? <VideoPreview url={preview.url} durationSeconds={preview.durationSeconds} onRemove={resetMedia} onReplace={() => inputRef.current?.click()} /> : <><button type="button" className={`video-dropzone ${dragging ? "is-dragging" : ""} ${errors.video ? "has-error" : ""}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files[0]); }}>
              <span className="dropzone-icon"><Film /></span><strong>Drop your reaction here</strong><span>or choose an MP4 from your device</span><small>Up to {MAX_VIDEO_SECONDS} seconds • {MAX_VIDEO_BYTES / 1024 / 1024} MB</small>
            </button><button type="button" className="demo-clip-button" onClick={selectDemoFile}>Use 4-second demo clip</button></>}
            {errors.video && <p className="field-error">{errors.video}</p>}
            <p className="copyright-note"><ShieldCheck size={14} /> Upload only your own reaction—never broadcast match footage.</p>
          </div>
          <div className="composer-fields">
            <label>Title <span>{title.length}/60</span><input value={title} maxLength={60} placeholder="We knew it was coming." onChange={(event) => { setTitle(event.target.value); setErrors((current) => ({ ...current, title: "" })); }} aria-invalid={Boolean(errors.title)} /></label>
            {errors.title && <p className="field-error">{errors.title}</p>}
            <label>Description <span>Optional • {description.length}/220</span><textarea value={description} maxLength={220} placeholder="What made this moment stay with you?" onChange={(event) => { setDescription(event.target.value); setErrors((current) => ({ ...current, description: "" })); }} aria-invalid={Boolean(errors.description)} /></label>
            {errors.description && <p className="field-error">{errors.description}</p>}
            <div className="composer-event-proof"><ShieldCheck size={17} /><div><strong>{event.minute} {event.title}</strong><span>Official event context • TxLINE verified</span></div></div>
          </div>
        </div>
        {(status === "uploading" || status === "publishing") && <div className="upload-progress" aria-live="polite"><div><strong>{status === "publishing" ? "Publishing Moment…" : "Uploading your reaction…"}</strong><span>{status === "publishing" ? 100 : progress}%</span></div><div className="progress-track"><motion.i animate={{ width: `${status === "publishing" ? 100 : progress}%` }} /></div></div>}
        {errors.submit && <p className="submit-error">{errors.submit}</p>}
        <footer className="composer-footer"><button type="button" className="secondary-button" onClick={close}>Cancel</button><button type="button" className="primary-button" onClick={publish} disabled={status === "uploading" || status === "publishing"}><Upload size={17} /> {status === "uploading" ? "Uploading…" : status === "publishing" ? "Publishing…" : "Publish Moment"}</button></footer>
      </>}
    </motion.div>
  </motion.div>}</AnimatePresence>;
}
