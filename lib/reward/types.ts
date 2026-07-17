export type RewardClaimStatus = "available" | "sending" | "confirming" | "confirmed" | "failed";

export interface CreatorReward {
  id: string;
  matchId: string;
  momentId: string;
  creatorName: string;
  creatorHandle: string;
  momentTitle: string;
  championCount: number;
  amountSol: number;
  network: "devnet";
  eligibleWallet?: string;
}

export interface RewardClaim {
  rewardId: string;
  walletAddress: string;
  amountSol: number;
  network: "devnet";
  status: "confirmed";
  signature: string;
  claimedAt: string;
}

export interface RewardClaimRepository {
  list(walletAddress?: string): Promise<RewardClaim[]>;
  get(rewardId: string, walletAddress: string): Promise<RewardClaim | null>;
  save(claim: RewardClaim): Promise<void>;
}

export interface RewardTransactionResult {
  signature: string;
  confirmedAt: string;
}
