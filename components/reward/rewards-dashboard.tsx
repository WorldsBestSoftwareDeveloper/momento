"use client";

import { Clock3, ExternalLink, ShieldCheck, Trophy, Wallet } from "lucide-react";
import { WalletControl } from "@/components/wallet/wallet-control";
import { CreatorRewardCard } from "./creator-reward-card";
import type { CreatorReward } from "@/lib/reward/types";
import { useCreatorReward } from "@/lib/reward/use-creator-reward";
import { devnetExplorerUrl } from "@/lib/transactions/devnet-reward-source";
import { shortWalletAddress } from "@/lib/wallet/config";

export function RewardsDashboard({ reward }: { reward: CreatorReward }) {
  const state = useCreatorReward(reward);
  return <div className="rewards-layout">
    <section className="rewards-hero"><div><span className="eyebrow"><Trophy size={14} /> Creator rewards</span><h1>Great reactions deserve a victory lap.</h1><p>Momento rewards the creator behind the match’s Winning Moment. Browsing, uploading, commenting and Champion actions never require a wallet.</p></div><WalletControl /></section>
    <div className="rewards-main-grid"><CreatorRewardCard reward={reward} onClaimed={() => void state.refresh()} />
      <aside className="reward-facts">
        <div className="panel-title"><ShieldCheck size={18} /><div><strong>Claim details</strong><span>Solana Devnet reward</span></div></div>
        <dl><div><dt>Reward amount</dt><dd>{reward.amountSol} SOL</dd></div><div><dt>Network</dt><dd>Solana Devnet</dd></div><div><dt>Wallet</dt><dd>{state.address ? shortWalletAddress(state.address) : "Not connected"}</dd></div><div><dt>Claim status</dt><dd>{state.claim ? "Claimed" : "Available"}</dd></div><div><dt>Latest claim</dt><dd>{state.claim ? new Date(state.claim.claimedAt).toLocaleDateString() : "—"}</dd></div></dl>
      </aside>
    </div>
    <section className="claim-history"><div className="section-heading"><div><span className="eyebrow">Public receipts</span><h2>Transaction history</h2></div><Clock3 /></div>
      {state.history.length ? <div className="claim-history-list">{state.history.map((claim) => <article key={`${claim.rewardId}-${claim.signature}`}><span className="history-icon"><Wallet /></span><div><strong>Winning Moment creator reward</strong><small>{new Date(claim.claimedAt).toLocaleString()} • {claim.amountSol} SOL</small></div><span className="confirmed-pill">Confirmed</span><a href={devnetExplorerUrl(claim.signature)} target="_blank" rel="noreferrer" aria-label="Open transaction in Solana Explorer"><ExternalLink /></a></article>)}</div> : <div className="reward-empty"><Clock3 /><strong>No claims yet</strong><p>Your confirmed Devnet reward receipts will appear here.</p></div>}
    </section>
  </div>;
}
