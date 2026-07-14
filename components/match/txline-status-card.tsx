import { Radio, ShieldCheck } from "lucide-react";

export function TxlineStatusCard({ mode }: { mode: "live" | "cached" | "replay" }) {
  const isReplay = mode === "replay";
  return (
    <aside className="txline-status-card" aria-label="TxLINE data provenance">
      <span>Powered by <strong>TxLINE</strong></span>
      <div className={isReplay ? "is-replay" : "is-live"}><Radio size={13} /> {isReplay ? "Replay data" : "Live data"}</div>
      <p>Every match event is official, time-linked, and ready for fan reactions.</p>
      <span className="status-proof"><ShieldCheck size={14} /> Verified event feed</span>
    </aside>
  );
}
