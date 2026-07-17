"use client";

import Link from "next/link";
import { Award, Clapperboard, Trophy, Wallet } from "lucide-react";
import { WalletControl } from "@/components/wallet/wallet-control";
import type { CreatorReward } from "@/lib/reward/types";
import { useCreatorReward } from "@/lib/reward/use-creator-reward";
import { shortWalletAddress } from "@/lib/wallet/config";

export function CreatorProfile({ reward }: { reward: CreatorReward }) {
  const state = useCreatorReward(reward);
  const totalRewards = state.history.reduce((total, claim) => total + claim.amountSol, 0);
  return <div className="profile-layout">
    <section className="profile-hero"><div className="profile-avatar">LM</div><div><span className="eyebrow">Creator profile</span><h1>Leo Martin</h1><p>@leo_fra • Football reactions, captured together.</p></div><WalletControl /></section>
    <section className="profile-wallet-card"><div className="panel-title"><Wallet size={18} /><div><strong>Creator wallet</strong><span>Rewards only • social access stays open</span></div></div><div className="profile-wallet-value"><strong>{state.address ? shortWalletAddress(state.address, 6) : "No wallet connected"}</strong><span>{state.connected ? "Connected • Solana Devnet" : "Connect to unlock creator rewards"}</span></div></section>
    <section className="creator-stats"><article><Trophy /><span><strong>1</strong><small>Champion wins</small></span></article><article><Award /><span><strong>{totalRewards.toFixed(2)} SOL</strong><small>Total rewards</small></span></article><article><Clapperboard /><span><strong>12</strong><small>Moments uploaded</small></span></article><article><span className="rate-ring">8%</span><span><strong>Champion rate</strong><small>1 of 12 Moments</small></span></article></section>
    <section className="profile-moments"><div className="section-heading"><div><span className="eyebrow">Creator highlights</span><h2>Defining Moments</h2></div><Link href="/rewards" className="secondary-button">View rewards</Link></div><article><span className="winner-chip"><Trophy size={13} /> Champion of the Match</span><h3>We knew it was coming.</h3><p>1,240 Champions • 58′ Goal • Spain</p></article></section>
  </div>;
}
