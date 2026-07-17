import { calculateDistribution } from "@/lib/opinion-market/model";

export function SettlementExplainer({ compact = false }: { compact?: boolean }) {
  const distribution = calculateDistribution(1);
  return <section className={`settlement-explainer ${compact ? "is-compact" : ""}`} aria-labelledby={compact ? undefined : "settlement-explainer-title"}>
    <div><strong id={compact ? undefined : "settlement-explainer-title"}>How winners are decided</strong><span>Settlement after Final Whistle</span></div>
    <p><b>Winner</b> = #1 ranked Support Pool at Final Whistle</p>
    {!compact && <p>Champion count reflects popularity. Support determines settlement.</p>}
    <dl><div><dt>{distribution.creatorRewardSol * 100}%</dt><dd>Winning Creator</dd></div><div><dt>{distribution.supporterRewardSol * 100}%</dt><dd>Winning Supporters</dd></div><div><dt>{distribution.reserveSol * 100}%</dt><dd>Treasury Reserve</dd></div></dl>
  </section>;
}
