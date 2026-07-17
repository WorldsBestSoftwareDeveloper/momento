import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { getReplayConfig } from "@/lib/txline/replay-config";
import { WalletControl } from "@/components/wallet/wallet-control";

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
        <button className="icon-button" aria-label="Search" disabled><Search size={19} /></button>
        <button className="icon-button notification-button" aria-label="Notifications"><Bell size={18} /><i /></button>
        <WalletControl compact />
      </div>
    </header>
  );
}
