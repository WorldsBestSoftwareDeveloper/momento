import Link from "next/link";
import { Suspense } from "react";
import { Gift, Home, Radio } from "lucide-react";
import { getReplayConfig } from "@/lib/txline/replay-config";
import { ModeAwareWalletControl } from "@/components/wallet/mode-aware-wallet-control";
import { GlobalSearch } from "@/components/search/global-search";

export function MobileBottomNav() {
  const config = getReplayConfig();
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <Link href="/"><Home /><span>Home</span></Link>
      <Link href={`/matches/${config.matchId}`}><Radio /><span>Match</span></Link>
      <GlobalSearch fixtureId={config.matchId} mobile />
      <Link href="/rewards"><Gift /><span>Rewards</span></Link>
      <Suspense fallback={<div className="mobile-wallet-slot is-hidden" aria-hidden="true" />}><ModeAwareWalletControl defaultMode={config.mode} compact iconOnly mobile /></Suspense>
    </nav>
  );
}
