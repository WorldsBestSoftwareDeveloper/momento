"use client";

import Link from "next/link";
import { ArrowRight, History, Radio, Sparkles } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { MatchScoreboard } from "@/components/match/match-scoreboard";
import { DataModeBadge } from "@/components/match/data-mode-badge";
import { useCanonicalMatchState } from "@/lib/match/canonical-match-state";

export default function HomePage() {
  const { match, mode, modeHref } = useCanonicalMatchState();

  return (
    <AppShell>
      <div className="home-page page-frame">
        <section className="home-intro">
          <div><DataModeBadge mode={mode} label={match.modeLabel} /><h1>Official events.<br /><span>Shared emotion.</span></h1><p>Momento transforms every official football event into a shared social experience where fans capture, champion and collectively decide the defining moment of every match.</p></div>
          <div className="intro-proof"><Sparkles /><strong>Capture the Moment.</strong><span>Champion It. Relive It.</span></div>
        </section>
        <section className="featured-match">
          <div className="featured-top"><div><span className="eyebrow">Featured match</span><h2>Enter the match room</h2></div><Radio size={20} /></div>
          <MatchScoreboard match={match} compact />
          <div className="featured-actions"><div><History /><span><strong>{mode === "replay" ? "Official archive ready" : match.statusLabel}</strong>{mode === "replay" ? "Seven chapters from the match timeline" : "Official match activity is updating live"}</span></div><Link href={modeHref(`/matches/${match.id}`)} className="primary-button">{mode === "replay" ? "Open Match Archive" : "Join Live Match"} <ArrowRight size={17} /></Link></div>
        </section>
        <section className="home-info-grid">
          <article><span>01</span><h3>Follow the official event</h3><p>Official TxLINE match updates keep every fan in sync.</p></article>
          <article><span>02</span><h3>Capture your reaction</h3><p>Attach a short fan-created Moment to the event that caused it.</p></article>
          <article><span>03</span><h3>Champion what mattered</h3><p>Celebrate the Moments you appreciate, or Support the one you believe should win.</p></article>
        </section>
      </div>
    </AppShell>
  );
}
