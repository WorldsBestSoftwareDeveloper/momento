"use client";

import { ArrowDownLeft, ArrowUpRight, Coins, ShieldCheck, Trophy, Users } from "lucide-react";
import { useCanonicalMatchState } from "@/lib/match/canonical-match-state";
import { useOpinionContributions } from "@/lib/opinion-market/contribution-store";
import { getMatchMarket } from "@/lib/opinion-market/model";

export function TreasuryDashboard() {
  const { match, mode } = useCanonicalMatchState();
  const market = getMatchMarket(match);
  const { contributionSol } = useOpinionContributions(match.id);
  const displayedPool = market.totalPoolSol + contributionSol;
  const rows = [
    ["Support contribution", "Leo's Moment", "+0.10 SOL", "in"],
    ["Support contribution", "Paula's Moment", "+0.05 SOL", "in"],
    ["Creator distribution", "Leo Martin", `-${market.creatorRewardSol.toFixed(2)} SOL`, "out"],
    ["Supporter distribution", "Community draw", `-${market.supporterRewardSol.toFixed(2)} SOL`, "out"],
  ];
  return <div className="treasury-layout">
    <section className="treasury-hero"><div><span className="eyebrow"><Coins /> Community treasury</span><h1>The value behind the defining Moment.</h1><p>Transparent Support Pools, creator distributions and supporter rewards across live matches and official historical replays.</p></div><span className={`mode-pill mode-${mode}`}>{mode === "replay" ? "Official Match Archive" : "Live Match"}</span></section>
    <div className="treasury-stat-grid"><article><Coins /><span>Historical community support</span><strong>{displayedPool.toFixed(2)} SOL</strong></article><article><Users /><span>Champions</span><strong>{market.champions.toLocaleString()}</strong></article><article><Trophy /><span>Winning creator</span><strong>{match.moments.find((moment) => moment.isWinner)?.creator ?? match.moments[0]?.creator ?? "Awaiting result"}</strong></article><article><ShieldCheck /><span>Settlement</span><strong>{match.state === "final" ? "Complete" : "In progress"}</strong></article></div>
    <section className="treasury-history"><div className="section-heading"><div><span className="eyebrow">Public ledger</span><h2>Recent activity</h2></div></div>{rows.map(([title, detail, amount, direction], index) => <article key={`${title}-${index}`}><span className={`treasury-row-icon is-${direction}`}>{direction === "in" ? <ArrowDownLeft /> : <ArrowUpRight />}</span><div><strong>{title}</strong><small>{detail} • {mode === "replay" ? "Historical Replay" : "Live Match"}</small></div><b>{amount}</b><span className="confirmed-pill">Settled</span></article>)}</section>
  </div>;
}
