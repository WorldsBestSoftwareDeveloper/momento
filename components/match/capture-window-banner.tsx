"use client";

import { Video } from "lucide-react";
import type { OfficialEventView } from "@/lib/txline/replay-fixture";

export function CaptureWindowBanner({ event, seconds, onCapture }: { event: OfficialEventView; seconds: number; onCapture: () => void }) {
  const expired = seconds <= 0;
  return (
    <section className="capture-banner is-open" aria-live="polite">
      <div><span className="eyebrow">Capture your Moment • {expired ? "closed" : `${seconds}s remaining`}</span><strong>{event.minute} {event.title} • {event.team}</strong><p>Turn your reaction into part of this match&apos;s shared story.</p></div>
      <button type="button" className="primary-button" disabled={expired} onClick={onCapture}><Video size={18} /> Capture your Moment</button>
    </section>
  );
}
