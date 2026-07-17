import { calculateDistribution } from "@/lib/opinion-market/model";

export function SettlementExplainer({ compact = false }: { compact?: boolean }) {
  const distribution = calculateDistribution(1);
  return <section className={`settlement-explainer ${compact ? "is-compact" : ""}`} aria-labelledby={compact ? undefined : "settlement-explainer-title"}>
    <div><strong id={compact ? undefined : "settlement-explainer-title"}>How winners are decided</strong><span>Settlement after Final Whistle</span></div>
    <p>The Moment with the highest Support Pool at settlement becomes the winning Moment.</p>
    {!compact && <p>Champion reflects community appreciation. Support determines financial settlement.</p>}
    <dl><div><dt>{distribution.creatorRewardSol * 100}%</dt><dd>Winning Creator</dd></div><div><dt>{distribution.supporterRewardSol * 100}%</dt><dd>Winning Supporters</dd></div><div><dt>{distribution.reserveSol * 100}%</dt><dd>Treasury Reserve</dd></div></dl>
  </section>;
}
