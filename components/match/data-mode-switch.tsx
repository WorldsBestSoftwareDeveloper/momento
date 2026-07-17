"use client";

import Link from "next/link";
import { History, Radio } from "lucide-react";

export function DataModeSwitch({ matchId, mode }: { matchId: string; mode: "replay" | "live" }) {
  return <div className="data-mode-switch" aria-label="Match data source">
    <span><strong>Data source</strong><small>{mode === "replay" ? "Recorded TxLINE" : "Authenticated TxLINE"}</small></span>
    <div role="group" aria-label="Choose data mode">
      <Link className={mode === "replay" ? "is-active" : ""} href={`/matches/${matchId}?mode=replay`}><History /> Replay</Link>
      <Link className={mode === "live" ? "is-active" : ""} href={`/matches/${matchId}?mode=live`}><Radio /> Live</Link>
    </div>
  </div>;
}
