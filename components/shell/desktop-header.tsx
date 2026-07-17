"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useCanonicalMatchState } from "@/lib/match/canonical-match-state";
import { ModeAwareWalletControl } from "@/components/wallet/mode-aware-wallet-control";
import { GlobalSearch } from "@/components/search/global-search";

export function DesktopHeader() {
  const { match, mode, modeHref } = useCanonicalMatchState();
  return (
    <header className="desktop-header">
      <Link href={modeHref("/")} className="wordmark" aria-label="Momento home">MOMENTO</Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <Link href={modeHref("/")}>Home</Link>
        <Link href={modeHref(`/matches/${match.id}`)} className="is-active">Match</Link>
        <Link href={modeHref(`/matches/${match.id}#moments`)}>Moments</Link>
        <Link href={modeHref(`/matches/${match.id}#rankings`)}>Rankings</Link>
        <Link href={modeHref("/rewards")}>Rewards</Link>
        <Link href={modeHref("/treasury")}>Treasury</Link>
        <Link href={modeHref("/profile")}>Profile</Link>
      </nav>
      <div className="header-actions">
        <GlobalSearch fixtureId={match.id} />
        <Suspense fallback={null}><ModeAwareWalletControl defaultMode={mode} compact /></Suspense>
      </div>
    </header>
  );
}
