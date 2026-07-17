"use client";

import Link from "next/link";
import { History, Radio } from "lucide-react";

export function DataModeSwitch({ matchId, mode }: { matchId: string; mode: "replay" | "live" }) {
  return <div className="data-mode-switch" aria-label="Match coverage selector">
    <span><strong>Match coverage</strong><small>{mode === "replay" ? "Official match archive" : "Official TxLINE feed"}</small></span>
    <div role="group" aria-label="Choose data mode">
      <Link className={mode === "replay" ? "is-active" : ""} href={`/matches/${matchId}?mode=replay`}><History /> Historical</Link>
      <Link className={mode === "live" ? "is-active" : ""} href={`/matches/${matchId}?mode=live`}><Radio /> Live Match</Link>
    </div>
  </div>;
}
