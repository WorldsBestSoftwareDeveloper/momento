"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Gift, Home, Radio } from "lucide-react";
import { useCanonicalMatchState } from "@/lib/match/canonical-match-state";
import { ModeAwareWalletControl } from "@/components/wallet/mode-aware-wallet-control";
import { GlobalSearch } from "@/components/search/global-search";

export function MobileBottomNav() {
  const { match, mode, modeHref } = useCanonicalMatchState();
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <Link href={modeHref("/")}><Home /><span>Home</span></Link>
      <Link href={modeHref(`/matches/${match.id}`)}><Radio /><span>Match</span></Link>
      <GlobalSearch fixtureId={match.id} mobile />
      <Link href={modeHref("/rewards")}><Gift /><span>Rewards</span></Link>
      <Suspense fallback={<div className="mobile-wallet-slot is-hidden" aria-hidden="true" />}><ModeAwareWalletControl defaultMode={mode} compact iconOnly mobile /></Suspense>
    </nav>
  );
}
