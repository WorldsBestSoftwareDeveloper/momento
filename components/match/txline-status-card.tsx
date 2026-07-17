import { Radio, ShieldCheck } from "lucide-react";

export function TxlineStatusCard({ mode, verified = true }: { mode: "live" | "cached" | "replay"; verified?: boolean }) {
  const isReplay = mode === "replay";
  const isWaiting = mode === "cached";
  return (
    <aside className="txline-status-card" aria-label="TxLINE data provenance">
      <span>Powered by <strong>TxLINE</strong></span>
      <div className={isReplay ? "is-replay" : isWaiting ? "is-waiting" : "is-live"}><Radio size={13} /> {isReplay ? "Official archive" : isWaiting ? "Awaiting live update" : "Live feed"}</div>
      <p>{isReplay ? "Historical match events are time-linked and ready for fan reactions." : !verified ? "Official match coverage is reconnecting." : isWaiting ? "The live feed is ready for the next official match update." : "Every match event is official, time-linked, and ready for fan reactions."}</p>
      <span className="status-proof"><ShieldCheck size={14} /> {isReplay ? (verified ? "Verified TxLINE archive" : "Official match archive") : verified ? "Verified event feed" : "Verification pending"}</span>
    </aside>
  );
}
