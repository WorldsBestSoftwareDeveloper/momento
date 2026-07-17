import Link from "next/link";
import { getReplayConfig } from "@/lib/txline/replay-config";
import { WalletControl } from "@/components/wallet/wallet-control";
import { GlobalSearch } from "@/components/search/global-search";

export function DesktopHeader() {
  const config = getReplayConfig();
  return (
    <header className="desktop-header">
      <Link href="/" className="wordmark" aria-label="Momento home">MOMENTO</Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <Link href="/">Home</Link>
        <Link href={`/matches/${config.fixtureId}`} className="is-active">Live</Link>
        <a href="#moments">Moments</a>
        <a href="#rankings">Rankings</a>
        <Link href="/rewards">Rewards</Link>
        <Link href="/treasury">Treasury</Link>
        <Link href="/profile">Profile</Link>
      </nav>
      <div className="header-actions">
        <GlobalSearch fixtureId={config.fixtureId} />
        <WalletControl compact />
      </div>
    </header>
  );
}
