import { Radio, ShieldCheck } from "lucide-react";

export function TxlineStatusCard({ mode, verified = true }: { mode: "live" | "cached" | "replay"; verified?: boolean }) {
  const isReplay = mode === "replay";
  const isWaiting = mode === "cached";
  return (
    <aside className="txline-status-card" aria-label="TxLINE data provenance">
      <span>Powered by <strong>TxLINE</strong></span>
      <div className={isReplay ? "is-replay" : isWaiting ? "is-waiting" : "is-live"}><Radio size={13} /> {isReplay ? "Replay data" : isWaiting ? "Awaiting snapshot" : "Live data"}</div>
      <p>{!verified ? "Connect TxLINE to refresh this normalized fallback with authenticated official records." : isWaiting ? "Live mode is ready and waiting for the next authenticated TxLINE snapshot." : "Every match event is official, time-linked, and ready for fan reactions."}</p>
      <span className="status-proof"><ShieldCheck size={14} /> {verified ? "Verified event feed" : "Verification pending"}</span>
    </aside>
  );
}
