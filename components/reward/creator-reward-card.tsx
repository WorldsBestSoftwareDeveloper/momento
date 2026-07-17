"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, CircleAlert, ExternalLink, Gift, LoaderCircle, Trophy, Wallet } from "lucide-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import type { CreatorReward } from "@/lib/reward/types";
import { rewardsEnabled } from "@/lib/reward/config";
import { useCreatorReward } from "@/lib/reward/use-creator-reward";
import { devnetExplorerUrl } from "@/lib/transactions/devnet-reward-source";
import { shortWalletAddress } from "@/lib/wallet/config";

function statusCopy(status: ReturnType<typeof useCreatorReward>["status"]) {
  if (status === "sending") return "Sending transaction…";
  if (status === "confirming") return "Waiting for confirmation…";
  if (status === "confirmed") return "Transaction Confirmed";
  if (status === "failed") return "Transaction failed";
  return "Reward Available";
}

export function CreatorRewardCard({ reward, compact = false, onClaimed, claimingAvailable = true }: { reward: CreatorReward; compact?: boolean; onClaimed?: () => void; claimingAvailable?: boolean }) {
  const state = useCreatorReward(reward);
  const { setVisible } = useWalletModal();
  const busy = state.status === "sending" || state.status === "confirming";
  const publicClaimEnabled = rewardsEnabled();
  const claim = async () => { try { await state.claimReward(); onClaimed?.(); } catch { /* inline recovery */ } };

  return <motion.section className={`creator-reward-card ${compact ? "is-compact" : ""}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .28 }}>
    <div className="reward-card-top"><span className="reward-trophy"><Trophy /></span><div><span className="eyebrow">Winning Moment</span><h3>{reward.momentTitle}</h3><p>{reward.creatorName} <span>{reward.creatorHandle}</span></p></div></div>
    <div className="reward-unlock"><div><Gift size={17} /><span><small>Creator reward</small><strong>{reward.amountSol} SOL</strong></span></div><span className={`reward-status status-${state.status}`}>{busy && <LoaderCircle size={13} />}{state.status === "confirmed" && <Check size={13} />}{state.status === "failed" && <CircleAlert size={13} />}{statusCopy(state.status)}</span></div>
    {state.address && <div className="reward-wallet-line"><Wallet size={14} /><span>{shortWalletAddress(state.address)}</span><b>Devnet</b></div>}
    {state.error && <div className="reward-error"><CircleAlert size={15} /><span>{state.error}</span><button type="button" onClick={state.retry}>Retry</button></div>}
    {!claimingAvailable ? <div className="reward-error"><CircleAlert size={15} /><span>Reward claiming is available after Live Match settlement.</span></div> : !publicClaimEnabled ? <div className="reward-error"><CircleAlert size={15} /><span>Reward claiming requires the treasury signer and is unavailable on this public deployment.</span></div> : state.claim ? <div className="reward-confirmed"><div><Check size={18} /><span><strong>Reward Claimed</strong><small>{new Date(state.claim.claimedAt).toLocaleString()}</small></span></div><a href={devnetExplorerUrl(state.claim.signature)} target="_blank" rel="noreferrer">Explorer <ExternalLink size={14} /></a></div> : !state.connected ? <button type="button" className="primary-button reward-claim-button" onClick={() => setVisible(true)}><Wallet size={17} />Connect Wallet to Claim</button> : !state.eligible ? <button type="button" className="secondary-button reward-claim-button" disabled>Winning creator wallet required</button> : <button type="button" className="primary-button reward-claim-button" onClick={() => void claim()} disabled={busy}>{busy ? <LoaderCircle className="spin" size={17} /> : <Gift size={17} />}{busy ? statusCopy(state.status) : "Claim Reward"}</button>}
    {!compact && <footer><span>Community selection remains off-chain.</span><Link href="/rewards">View reward history</Link></footer>}
  </motion.section>;
}
