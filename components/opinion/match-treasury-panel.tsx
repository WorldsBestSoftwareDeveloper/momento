"use client";
import Link from "next/link";
import { ArrowRight, Coins, ShieldCheck, Trophy, Users } from "lucide-react";
import { getMatchMarket } from "@/lib/opinion-market/model";
import type { MatchRoomView } from "@/lib/txline/replay-fixture";
import { useOpinionContributions } from "@/lib/opinion-market/contribution-store";

export function MatchTreasuryPanel({ match }: { match: MatchRoomView }) {
  const market = getMatchMarket(match);
  const { contributionSol } = useOpinionContributions(match.id);
  return <section className="match-treasury-panel">
    <div className="panel-title"><Coins /><div><strong>Match community pool</strong><span>{match.mode === "replay" ? "Deterministic replay treasury" : "Devnet opinion market"}</span></div></div>
    <strong className="pool-total">{(market.totalPoolSol + contributionSol).toFixed(2)} <small>SOL</small></strong>
    <div className="pool-stats"><span><Users />{market.champions.toLocaleString()} Champions</span><span><Trophy />{market.activeMoments} Moments</span></div>
    <div className="distribution-preview"><span><small>Creator</small><b>{market.creatorRewardSol.toFixed(2)}</b></span><span><small>Supporters</small><b>{market.supporterRewardSol.toFixed(2)}</b></span><span><small>Reserve</small><b>{market.reserveSol.toFixed(2)}</b></span></div>
    <div className={`settlement-state is-${market.state}`}><ShieldCheck />{market.state === "settled" ? "Settlement complete" : "Support closes 6h after full time"}</div>
    <Link href="/treasury">Treasury history <ArrowRight /></Link>
  </section>;
}
