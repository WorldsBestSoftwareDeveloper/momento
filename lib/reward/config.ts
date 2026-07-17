import type { CreatorReward } from "./types";
import type { MatchRoomView } from "@/lib/txline/replay-fixture";

function rewardAmount() {
  const configured = Number(process.env.NEXT_PUBLIC_REWARD_AMOUNT_SOL ?? "0.25");
  return Number.isFinite(configured) && configured > 0 ? Math.min(configured, 1) : 0.25;
}

export function rewardsEnabled() {
  return process.env.NEXT_PUBLIC_REWARDS_ENABLED !== "false";
}

export function createDemoCreatorReward(input: Omit<CreatorReward, "amountSol" | "network" | "eligibleWallet">): CreatorReward {
  const eligibleWallet = process.env.NEXT_PUBLIC_REWARD_CREATOR_WALLET?.trim();
  return { ...input, amountSol: rewardAmount(), network: "devnet", eligibleWallet: eligibleWallet || undefined };
}

export function createMatchCreatorReward(match: MatchRoomView): CreatorReward {
  const winner = match.moments.find((moment) => moment.isWinner) ?? match.moments[0];
  return createDemoCreatorReward({
    id: `${match.providerFixtureId || match.id}:${winner.id}`,
    matchId: match.id,
    momentId: winner.id,
    creatorName: winner.creator,
    creatorHandle: winner.handle,
    momentTitle: winner.title,
    championCount: winner.championCount,
  });
}
