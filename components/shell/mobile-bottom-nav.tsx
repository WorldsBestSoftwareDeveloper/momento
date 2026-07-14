import Link from "next/link";
import { CircleUserRound, Clapperboard, Home, Radio, Video } from "lucide-react";
import { getReplayConfig } from "@/lib/txline/replay-config";

export function MobileBottomNav() {
  const config = getReplayConfig();
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      <Link href="/"><Home /><span>Home</span></Link>
      <Link href={`/matches/${config.fixtureId}`}><Radio /><span>Live</span></Link>
      <button className="capture-nav" type="button" aria-label="Capture a Moment"><Video /><span>Capture</span></button>
      <a href="#moments"><Clapperboard /><span>Moments</span></a>
      <button type="button"><CircleUserRound /><span>Profile</span></button>
    </nav>
  );
}
