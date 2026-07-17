import type { RewardClaim, RewardClaimRepository } from "./types";

const STORAGE_KEY = "momento-reward-claims-v1";

function readClaims(): RewardClaim[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value as RewardClaim[] : [];
  } catch { return []; }
}

export class LocalRewardClaimRepository implements RewardClaimRepository {
  async list(walletAddress?: string) {
    const claims = readClaims();
    return walletAddress ? claims.filter((claim) => claim.walletAddress === walletAddress) : claims;
  }

  async get(rewardId: string, walletAddress: string) {
    return readClaims().find((claim) => claim.rewardId === rewardId && claim.walletAddress === walletAddress) ?? null;
  }

  async save(claim: RewardClaim) {
    if (typeof window === "undefined") return;
    const claims = readClaims().filter((item) => !(item.rewardId === claim.rewardId && item.walletAddress === claim.walletAddress));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([claim, ...claims].slice(0, 20)));
  }
}
