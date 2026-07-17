"use client";
import Link from "next/link";
import { ArrowRight, Coins } from "lucide-react";
import { getMatchMarket } from "@/lib/opinion-market/model";
import type { MatchRoomView } from "@/lib/txline/replay-fixture";
import { useOpinionContributions } from "@/lib/opinion-market/contribution-store";

export function MatchTreasuryPanel({ match }: { match: MatchRoomView }) {
  const market = getMatchMarket(match);
  const { contributionSol } = useOpinionContributions(match.id);
  return <section className="match-treasury-panel">
    <div className="panel-title"><Coins /><div><strong>{match.mode === "replay" ? "Historical community support" : "Support Pool"}</strong></div></div>
    <strong className="pool-total">{(market.totalPoolSol + contributionSol).toFixed(2)} <small>SOL</small></strong>
    <Link href="/treasury">View pool details <ArrowRight /></Link>
  </section>;
}
