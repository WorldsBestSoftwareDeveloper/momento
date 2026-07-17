"use client";
import { Clock3, Coins, TrendingUp } from "lucide-react";
import { getMomentMarket } from "@/lib/opinion-market/model";
import type { MomentView } from "@/lib/txline/replay-fixture";
import { useOpinionContributions } from "@/lib/opinion-market/contribution-store";

export function MomentMarketSummary({ matchId, moment, final = false, compact = false }: { matchId: string; moment: MomentView; final?: boolean; compact?: boolean }) {
  const { contributionSol } = useOpinionContributions(matchId, moment.id);
  const market = getMomentMarket(moment, final);
  const poolSol = market.poolSol + contributionSol;
  return <div className={`moment-market-summary ${compact ? "is-compact" : ""}`}>
    <div><Coins /><span><small>Community pool</small><strong>{poolSol.toFixed(2)} SOL</strong></span></div>
    <div><TrendingUp /><span><small>Support</small><strong>{market.supportProgress}%</strong></span></div>
    {!compact && <div><Clock3 /><span><small>Status</small><strong>{market.timeRemaining}</strong></span></div>}
    {!compact && <div className="support-progress" aria-label={`${market.supportProgress}% support progress`}><i style={{ width: `${market.supportProgress}%` }} /></div>}
  </div>;
}
