import { notFound } from "next/navigation";
import { ChevronDown, Radio, Video } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { MatchScoreboard } from "@/components/match/match-scoreboard";
import { OfficialEventRail } from "@/components/match/official-event-rail";
import { MomentumMeter } from "@/components/match/momentum-meter";
import { MomentCard } from "@/components/moment/moment-card";
import { getReplayConfig } from "@/lib/txline/replay-config";
import { getDemoMatch } from "@/lib/txline/replay-fixture";

export default async function MatchPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const config = getReplayConfig();
  if (matchId !== config.fixtureId) notFound();
  const match = getDemoMatch(config.fixtureId, config.mode, config.label);

  return (
    <AppShell>
      <div className="match-page page-frame">
        {match.mode === "replay" && <div className="replay-disclosure"><Radio size={15} /><span><strong>{match.modeLabel}</strong> — official events are replayed through the same UI contract planned for live TxLINE data.</span></div>}
        <MatchScoreboard match={match} />
        <OfficialEventRail events={match.events} mode={match.mode} />
        <section className="capture-banner"><div><span className="eyebrow">Capture window</span><strong>58′ Goal • Spain</strong><p>Share your reaction to this official event.</p></div><button type="button" className="primary-button"><Video size={18} /> Capture this moment</button></section>
        <div className="match-content">
          <section className="moments-section" id="moments">
            <div className="section-heading"><div><span className="eyebrow">Fan-created content</span><h2>Fan reactions</h2></div><button className="sort-button" type="button">Most recent <ChevronDown size={15} /></button></div>
            <div className="moment-grid">{match.moments.map((moment, index) => <MomentCard key={moment.id} moment={moment} featured={index === 0} />)}</div>
          </section>
          <MomentumMeter match={match} />
        </div>
      </div>
    </AppShell>
  );
}
