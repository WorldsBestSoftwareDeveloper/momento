"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { rewardService } from "@/lib/services/reward-service";
import type { CreatorReward, RewardClaim, RewardClaimStatus } from "./types";

export function useCreatorReward(reward: CreatorReward) {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const address = publicKey?.toBase58() ?? null;
  const [claim, setClaim] = useState<RewardClaim | null>(null);
  const [history, setHistory] = useState<RewardClaim[]>([]);
  const [status, setStatus] = useState<RewardClaimStatus>("available");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [savedClaim, savedHistory] = await Promise.all([
      address ? rewardService.getClaim(reward.id, address) : Promise.resolve(null),
      rewardService.listClaims(address ?? undefined),
    ]);
    setClaim(savedClaim);
    setHistory(savedHistory);
    setStatus(savedClaim ? "confirmed" : "available");
  }, [address, reward.id]);

  useEffect(() => { void refresh(); }, [refresh]);

  const eligible = Boolean(address && (!reward.eligibleWallet || reward.eligibleWallet === address));
  const claimReward = async () => {
    if (!connected || !address) throw new Error("Connect a wallet to claim this creator reward.");
    setError(null);
    try {
      const saved = await rewardService.claim(reward, address, connection, (stage) => setStatus(stage));
      setClaim(saved); setStatus("confirmed"); await refresh();
      return saved;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "The reward transaction failed.";
      setStatus("failed"); setError(message); throw cause;
    }
  };

  return { address, connected, eligible, claim, history, status, error, claimReward, refresh, retry: () => { setStatus("available"); setError(null); } };
}
