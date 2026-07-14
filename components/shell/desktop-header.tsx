import Link from "next/link";
import { CircleUserRound, Radio, Search } from "lucide-react";
import { getReplayConfig } from "@/lib/txline/replay-config";

export function DesktopHeader() {
  const config = getReplayConfig();
  return (
    <header className="desktop-header">
      <Link href="/" className="wordmark" aria-label="Momento home">MOMENTO</Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <Link href="/">Home</Link>
        <Link href={`/matches/${config.fixtureId}`} className="is-active">Live</Link>
        <a href="#moments">Moments</a>
      </nav>
      <div className="header-actions">
        <button className="icon-button" aria-label="Search" disabled><Search size={19} /></button>
        <button className="data-button" type="button"><Radio size={16} /> Data status</button>
        <button className="icon-button" aria-label="Profile"><CircleUserRound size={22} /></button>
      </div>
    </header>
  );
}
