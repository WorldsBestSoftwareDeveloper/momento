import type { Connection } from "@solana/web3.js";
import { LocalRewardClaimRepository } from "@/lib/reward/local-reward-repository";
import type { CreatorReward, RewardClaim, RewardClaimRepository } from "@/lib/reward/types";
import { DevnetAirdropRewardSource, type RewardTransactionSource, type RewardTransactionStage } from "@/lib/transactions/devnet-reward-source";

export class RewardService {
  constructor(
    private readonly repository: RewardClaimRepository = new LocalRewardClaimRepository(),
    private readonly transactionSource: RewardTransactionSource = new DevnetAirdropRewardSource(),
  ) {}

  listClaims(walletAddress?: string) { return this.repository.list(walletAddress); }
  getClaim(rewardId: string, walletAddress: string) { return this.repository.get(rewardId, walletAddress); }

  async claim(reward: CreatorReward, walletAddress: string, connection: Connection, onStage: (stage: RewardTransactionStage) => void): Promise<RewardClaim> {
    if (reward.network !== "devnet") throw new Error("Momento rewards are Devnet-only.");
    if (reward.eligibleWallet && reward.eligibleWallet !== walletAddress) throw new Error("Connect the winning creator wallet to claim this reward.");
    const existing = await this.repository.get(reward.id, walletAddress);
    if (existing) return existing;
    const transaction = await this.transactionSource.claim(connection, walletAddress, reward.amountSol, onStage);
    const claim: RewardClaim = {
      rewardId: reward.id, walletAddress, amountSol: reward.amountSol, network: "devnet", status: "confirmed",
      signature: transaction.signature, claimedAt: transaction.confirmedAt,
    };
    await this.repository.save(claim);
    return claim;
  }
}

export const rewardService = new RewardService();
