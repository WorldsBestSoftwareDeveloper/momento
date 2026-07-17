import Link from "next/link";
import { Gift, Home, Radio, Video } from "lucide-react";
import { getReplayConfig } from "@/lib/txline/replay-config";
import { WalletControl } from "@/components/wallet/wallet-control";

export function MobileBottomNav() {
  const config = getReplayConfig();
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <Link href="/"><Home /><span>Home</span></Link>
      <Link href={`/matches/${config.fixtureId}`}><Radio /><span>Live</span></Link>
      <button className="capture-nav" type="button" aria-label="Capture a Moment"><Video /><span>Capture</span></button>
      <Link href="/rewards"><Gift /><span>Rewards</span></Link>
      <div className="mobile-wallet-slot"><WalletControl compact iconOnly /><span>Wallet</span></div>
    </nav>
  );
}
