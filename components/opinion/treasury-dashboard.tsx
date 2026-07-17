import { ArrowDownLeft, ArrowUpRight, Coins, ShieldCheck, Trophy, Users } from "lucide-react";
import { getDemoMatch } from "@/lib/txline/replay-fixture";
import { getMatchMarket } from "@/lib/opinion-market/model";

export function TreasuryDashboard() {
  const match = getDemoMatch("france-spain-demo");
  const market = getMatchMarket({ ...match, state: "final" });
  const rows = [
    ["Champion contribution", "Leo's Moment", "+0.10 SOL", "in"],
    ["Champion contribution", "Paula's Moment", "+0.05 SOL", "in"],
    ["Creator distribution", "Leo Martin", `-${market.creatorRewardSol.toFixed(2)} SOL`, "out"],
    ["Supporter distribution", "Community draw", `-${market.supporterRewardSol.toFixed(2)} SOL`, "out"],
  ];
  return <div className="treasury-layout">
    <section className="treasury-hero"><div><span className="eyebrow"><Coins /> Community treasury</span><h1>The value behind the defining Moment.</h1><p>Transparent Devnet community pools, creator distributions and supporter rewards. Replay entries are deterministic demo records.</p></div><span className="mode-pill mode-replay">Demo Replay</span></section>
    <div className="treasury-stat-grid"><article><Coins /><span>Total pool</span><strong>{market.totalPoolSol.toFixed(2)} SOL</strong></article><article><Users /><span>Champions</span><strong>{market.champions.toLocaleString()}</strong></article><article><Trophy /><span>Winning creator</span><strong>Leo Martin</strong></article><article><ShieldCheck /><span>Settlement</span><strong>Complete</strong></article></div>
    <section className="treasury-history"><div className="section-heading"><div><span className="eyebrow">Public ledger</span><h2>Recent activity</h2></div></div>{rows.map(([title, detail, amount, direction], index) => <article key={`${title}-${index}`}><span className={`treasury-row-icon is-${direction}`}>{direction === "in" ? <ArrowDownLeft /> : <ArrowUpRight />}</span><div><strong>{title}</strong><small>{detail} • Demo Replay</small></div><b>{amount}</b><span className="confirmed-pill">Settled</span></article>)}</section>
  </div>;
}
