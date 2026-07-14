import Link from "next/link";
import { ArrowRight, History, Radio, Sparkles } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { MatchScoreboard } from "@/components/match/match-scoreboard";
import { DataModeBadge } from "@/components/match/data-mode-badge";
import { getReplayConfig } from "@/lib/txline/replay-config";
import { getDemoMatch } from "@/lib/txline/replay-fixture";

export default function HomePage() {
  const config = getReplayConfig();
  const match = getDemoMatch(config.fixtureId, config.mode, config.label);

  return (
    <AppShell>
      <div className="home-page page-frame">
        <section className="home-intro">
          <div><DataModeBadge mode={config.mode} label={config.label} /><h1>Official events.<br /><span>Shared emotion.</span></h1><p>Momento transforms every official football event into a shared social experience where fans capture, champion and collectively decide the defining moment of every match.</p></div>
          <div className="intro-proof"><Sparkles /><strong>Capture the Moment.</strong><span>Champion It. Relive It.</span></div>
        </section>
        <section className="featured-match">
          <div className="featured-top"><div><span className="eyebrow">Featured match</span><h2>Enter the live room</h2></div><Radio size={20} /></div>
          <MatchScoreboard match={match} compact />
          <div className="featured-actions"><div><History /><span><strong>Replay ready</strong>Seven deterministic demo beats</span></div><Link href={`/matches/${match.id}`} className="primary-button">Open match room <ArrowRight size={17} /></Link></div>
        </section>
        <section className="home-info-grid">
          <article><span>01</span><h3>Follow the official event</h3><p>TxLINE-shaped match facts establish the shared context.</p></article>
          <article><span>02</span><h3>Capture your reaction</h3><p>Attach a short fan-created Moment to the event that caused it.</p></article>
          <article><span>03</span><h3>Champion what mattered</h3><p>The community collectively chooses the defining Moment.</p></article>
        </section>
      </div>
    </AppShell>
  );
}
