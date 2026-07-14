"use client";

import { useRef, useState } from "react";
import { Upload, Video } from "lucide-react";
import type { OfficialEventView } from "@/lib/txline/replay-fixture";

export function CaptureWindowBanner({ event, seconds }: { event: OfficialEventView; seconds: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const expired = seconds <= 0;
  return (
    <section className="capture-banner is-open" aria-live="polite">
      <div><span className="eyebrow">Capture window • {expired ? "closed" : `${seconds}s remaining`}</span><strong>{event.minute} {event.title} • {event.team}</strong><p>{selectedName ? `${selectedName} selected for the upload flow.` : "Share your reaction to this official event."}</p></div>
      <input ref={inputRef} className="visually-hidden" type="file" accept="video/mp4" onChange={(event) => setSelectedName(event.target.files?.[0]?.name ?? null)} />
      <button type="button" className="primary-button" disabled={expired} onClick={() => inputRef.current?.click()}>{selectedName ? <Upload size={18} /> : <Video size={18} />} {selectedName ? "Change MP4" : "Upload reaction"}</button>
    </section>
  );
}
