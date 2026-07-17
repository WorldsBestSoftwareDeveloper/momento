"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock3, MessageCircle, Send, ShieldCheck, X } from "lucide-react";
import type { MomentView } from "@/lib/txline/replay-fixture";
import { useMomentCommunity } from "@/lib/community/use-moment-community";
import { LiveActivity } from "./live-activity";
import { MomentMarketSummary } from "@/components/opinion/moment-market-summary";
import { OpinionChampion } from "@/components/opinion/opinion-champion";
import { useOpinionContributions } from "@/lib/opinion-market/contribution-store";
import { SettlementExplainer } from "@/components/opinion/settlement-explainer";

function timeAgo(value: string) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return minutes < 60 ? `${minutes}m ago` : `${Math.floor(minutes / 60)}h ago`;
}

export function MomentDetail({ matchId, moment, mode, initialTime = 0, onClose }: { matchId: string; moment: MomentView; mode: "live" | "replay"; initialTime?: number; onClose: () => void }) {
  const { snapshot, comments, busy, error, toggleChampion, addComment } = useMomentCommunity(moment);
  const contributions = useOpinionContributions(matchId, moment.id);
  const [body, setBody] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const hasPlayableVideo = moment.videoPath.startsWith("blob:") || moment.videoPath.startsWith("http") || moment.videoPath.startsWith("/");
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [comments.length]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden"; window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [onClose]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!body.trim()) return;
    try { await addComment(body); setBody(""); setSubmitError(null); }
    catch (cause) { setSubmitError(cause instanceof Error ? cause.message : "Could not post your comment."); }
  };
  return <motion.div className="moment-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.section className="moment-detail" role="dialog" aria-modal="true" aria-labelledby="moment-detail-title" initial={{ opacity: 0, y: 20, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .99 }}>
      <button className="icon-button moment-detail-close" type="button" onClick={onClose} aria-label="Close discussion"><X /></button>
      <div className={`moment-detail-media poster-${moment.posterTone}`}>
        {hasPlayableVideo ? <video src={moment.videoPath} poster={moment.posterPath} playsInline muted loop controls autoPlay preload="metadata" onLoadedMetadata={(event) => { event.currentTarget.currentTime = initialTime; void event.currentTarget.play().catch(() => undefined); }} /> : <div className="moment-detail-poster" aria-label="Moment video unavailable"><div className="poster-orbit"><span>{moment.initials}</span></div></div>}
        <div className="moment-detail-shade" />
        <div className="moment-detail-overlay"><span className="event-chip">{moment.eventLabel}</span><h2 id="moment-detail-title">{moment.title}</h2><p>{moment.description ?? moment.caption}</p></div>
      </div>
      <div className="moment-discussion">
        <header className="discussion-header">
          <div className="avatar">{moment.initials}</div><div><strong>{moment.creator}</strong><span>{moment.handle} · <Clock3 size={11} /> {moment.createdAtLabel ?? "Now"}</span></div>
          <span className="verified-event-chip"><ShieldCheck size={11} /> TxLINE event</span>
        </header>
        <OpinionChampion matchId={matchId} momentId={moment.id} mode={mode} championed={snapshot.championed} count={snapshot.championCount} busy={busy} onChampion={toggleChampion} />
        <div className="moment-settlement-status"><span><small>Support Pool ranking</small><strong>#{moment.rank} • {moment.rank === 1 ? "Leading" : moment.rank === 2 ? "Runner-up" : "In contention"}</strong></span><span><small>Settlement status</small><strong>{moment.isWinner ? "Winning Moment" : "Open until Final Whistle"}</strong></span></div>
        <MomentMarketSummary matchId={matchId} moment={{ ...moment, championCount: snapshot.championCount }} mode={mode} final={moment.isWinner} />
        <SettlementExplainer />
        <section className="contribution-feed" aria-labelledby={`contributions-${moment.id}`}><div><strong id={`contributions-${moment.id}`}>Support history</strong><span>Settlement after Final Whistle</span></div>{contributions.rows.length ? contributions.rows.slice(0, 3).map((row) => <article key={row.id}><span><strong>Your Contribution</strong><small>{row.mode === "replay" ? "Historical community support" : "Confirmed Solana Devnet"}</small></span><b>{row.amountSol.toFixed(2)} SOL</b>{row.mode === "live" && <a href={`https://explorer.solana.com/tx/${row.signature}?cluster=devnet`} target="_blank" rel="noreferrer">Explorer</a>}</article>) : <p>No contributions yet. Support this Moment to join the pool.</p>}</section>
        <LiveActivity snapshot={snapshot} />
        <div className="discussion-title"><div><MessageCircle size={16} /><strong>Discussion</strong></div><span>{snapshot.commentCount.toLocaleString()} comments</span></div>
        <div className="comment-list" ref={listRef} aria-live="polite">
          {comments.length === 0 && <div className="comment-empty"><MessageCircle /><strong>Start the conversation</strong><span>Share what this reaction meant to you.</span></div>}
          <AnimatePresence initial={false}>{comments.map((comment, index) => <motion.article className="comment-row" key={comment.id} initial={index === comments.length - 1 ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }}>
            <div className="avatar">{comment.authorInitials}</div><div><p><strong>{comment.authorName}</strong><span>{comment.authorHandle} · {timeAgo(comment.createdAt)}</span></p><div>{comment.body}</div></div>
          </motion.article>)}</AnimatePresence>
        </div>
        {(error || submitError) && <p className="community-error">{submitError ?? error}</p>}
        <form className="comment-composer" onSubmit={submit}>
          <label htmlFor={`comment-${moment.id}`} className="sr-only">Add a comment</label>
          <input id={`comment-${moment.id}`} value={body} onChange={(event) => setBody(event.target.value)} maxLength={500} placeholder="Join this Moment's discussion…" />
          <button type="submit" disabled={busy || !body.trim()} aria-label="Post comment"><Send size={17} /></button>
        </form>
      </div>
    </motion.section>
  </motion.div>;
}
