import Link from "next/link";
import { Suspense } from "react";
import { getReplayConfig } from "@/lib/txline/replay-config";
import { ModeAwareWalletControl } from "@/components/wallet/mode-aware-wallet-control";
import { GlobalSearch } from "@/components/search/global-search";

export function DesktopHeader() {
  const config = getReplayConfig();
  return (
    <header className="desktop-header">
      <Link href="/" className="wordmark" aria-label="Momento home">MOMENTO</Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <Link href="/">Home</Link>
        <Link href={`/matches/${config.matchId}`} className="is-active">Match</Link>
        <a href="#moments">Moments</a>
        <a href="#rankings">Rankings</a>
        <Link href="/rewards">Rewards</Link>
        <Link href="/treasury">Treasury</Link>
        <Link href="/profile">Profile</Link>
      </nav>
      <div className="header-actions">
        <GlobalSearch fixtureId={config.matchId} />
        <Suspense fallback={null}><ModeAwareWalletControl defaultMode={config.mode} compact /></Suspense>
      </div>
    </header>
  );
}
