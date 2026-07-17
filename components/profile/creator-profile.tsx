"use client";

import Link from "next/link";
import { Award, Clapperboard, MessageCircle, Settings, Sparkles, Trophy, Wallet } from "lucide-react";
import { WalletControl } from "@/components/wallet/wallet-control";
import type { CreatorReward } from "@/lib/reward/types";
import { useCreatorReward } from "@/lib/reward/use-creator-reward";
import { shortWalletAddress } from "@/lib/wallet/config";
import { useOpinionContributions } from "@/lib/opinion-market/contribution-store";

export function CreatorProfile({ reward }: { reward: CreatorReward }) {
  const state = useCreatorReward(reward);
  const totalRewards = state.history.reduce((total, claim) => total + claim.amountSol, 0);
  const contributions = useOpinionContributions("france-spain-demo");
  return <div className="profile-layout">
    <section className="profile-hero"><div className="profile-avatar">LM</div><div><span className="eyebrow">Creator profile</span><h1>Leo Martin</h1><p>@leo_fra • Football reactions, captured together.</p></div><WalletControl /></section>
    <section className="profile-wallet-card"><div className="panel-title"><Wallet size={18} /><div><strong>Creator wallet</strong><span>Rewards only • social access stays open</span></div></div><div className="profile-wallet-value"><strong>{state.address ? shortWalletAddress(state.address, 6) : "No wallet connected"}</strong><span>{state.connected ? "Connected • Solana Devnet" : "Connect to unlock creator rewards"}</span></div></section>
    <section className="creator-stats"><article><Trophy /><span><strong>1</strong><small>Championed Moments</small></span></article><article><Award /><span><strong>{totalRewards.toFixed(2)} SOL</strong><small>SOL earned</small></span></article><article><Clapperboard /><span><strong>12</strong><small>Moments uploaded</small></span></article><article><Wallet /><span><strong>{contributions.contributionSol.toFixed(2)} SOL</strong><small>SOL contributed</small></span></article></section>
    <section className="profile-moments"><div className="section-heading"><div><span className="eyebrow">Creator highlights</span><h2>Defining Moments</h2></div><Link href="/rewards" className="secondary-button">View rewards</Link></div><article><span className="winner-chip"><Trophy size={13} /> Champion of the Match</span><h3>We knew it was coming.</h3><p>1,240 Champions • 58′ Goal • Spain</p></article></section>
    <section className="profile-detail-grid">
      <article><div className="panel-title"><MessageCircle /><div><strong>Comments</strong><span>Your conversation activity</span></div></div><strong className="profile-metric">18</strong><p>Comments shared across four defining Moments.</p><Link href="/matches/france-spain-demo#moments">Open discussions</Link></article>
      <article><div className="panel-title"><Sparkles /><div><strong>Activity timeline</strong><span>Your latest Momento activity</span></div></div><ol className="profile-timeline"><li><i /><span><strong>Championed “We knew it was coming.”</strong><small>France vs Spain • recently</small></span></li><li><i /><span><strong>Joined the match conversation</strong><small>Official TxLINE Goal event</small></span></li></ol></article>
      <article><div className="panel-title"><Award /><div><strong>Claim history</strong><span>Confirmed Devnet rewards</span></div></div>{state.history.length ? <div className="profile-claims">{state.history.slice(0, 3).map((claim) => <span key={`${claim.rewardId}-${claim.signature}`}><strong>{claim.amountSol.toFixed(2)} SOL</strong><small>{new Date(claim.claimedAt).toLocaleDateString()}</small></span>)}</div> : <p>No creator rewards claimed yet.</p>}<Link href="/rewards">View reward center</Link></article>
      <article id="profile-settings"><div className="panel-title"><Settings /><div><strong>Settings</strong><span>Account and wallet controls</span></div></div><p>Momento uses your connected wallet only for explicit Devnet transactions. Social access remains wallet-free.</p><WalletControl compact /></article>
    </section>
  </div>;
}
