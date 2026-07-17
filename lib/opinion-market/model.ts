import type { MatchRoomView, MomentView } from "@/lib/txline/replay-fixture";

export const SUPPORT_LEVELS = [
  { level: 1, amountSol: 0.02, label: "Level 1" },
  { level: 2, amountSol: 0.05, label: "Level 2" },
  { level: 3, amountSol: 0.1, label: "Level 3" },
] as const;

export interface MomentMarketView {
  poolSol: number;
  supportProgress: number;
  creatorRewardSol: number;
  supporterRewardSol: number;
  reserveSol: number;
  state: "open" | "settled";
  timeRemaining: string;
}

export function calculateDistribution(poolSol: number) {
  const creatorRewardSol = Number((poolSol * 0.7).toFixed(6));
  const supporterRewardSol = Number((poolSol * 0.2).toFixed(6));
  const reserveSol = Number((poolSol - creatorRewardSol - supporterRewardSol).toFixed(6));
  return { creatorRewardSol, supporterRewardSol, reserveSol };
}

export function getMomentMarket(moment: MomentView, final = false): MomentMarketView {
  const poolSol = Number((moment.championCount * 0.02).toFixed(2));
  return {
    poolSol,
    supportProgress: Math.min(100, Math.round((moment.championCount / 1_500) * 100)),
    ...calculateDistribution(poolSol),
    state: final ? "settled" : "open",
    timeRemaining: final ? "Settled" : "6h support window",
  };
}

export function getMatchMarket(match: MatchRoomView) {
  const markets = match.moments.map((moment) => getMomentMarket(moment, match.state === "final"));
  const totalPoolSol = Number(markets.reduce((sum, market) => sum + market.poolSol, 0).toFixed(2));
  return {
    totalPoolSol,
    champions: match.championActions,
    activeMoments: match.moments.length,
    ...calculateDistribution(totalPoolSol),
    state: match.state === "final" ? "settled" as const : "open" as const,
  };
}
