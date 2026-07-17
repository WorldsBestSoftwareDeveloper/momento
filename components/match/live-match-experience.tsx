"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Radio } from "lucide-react";
import { MatchScoreboard } from "./match-scoreboard";
import { OfficialEventRail } from "./official-event-rail";
import { MomentumMeter } from "./momentum-meter";
import { MomentFeed } from "@/components/moment/moment-feed";
import { MomentComposer } from "@/components/moment/moment-composer";
import { TxlineStatusCard } from "./txline-status-card";
import { CaptureWindowBanner } from "./capture-window-banner";
import type { MatchRoomView, OfficialEventView } from "@/lib/txline/replay-fixture";
import type { MatchExperienceDataset } from "@/lib/match/match-data-source";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLiveMatchSource } from "@/lib/match/use-live-match-source";
import { DataModeSwitch } from "./data-mode-switch";
import { MatchTreasuryPanel } from "@/components/opinion/match-treasury-panel";
import { useCanonicalMatchState } from "@/lib/match/canonical-match-state";

export function MatchExperience({ dataset }: { dataset: MatchExperienceDataset }) {
  const sourceMatch = useLiveMatchSource(dataset);
  const { mode, match: canonicalMatch, visibleEvents, activeEvent, registerSource } = useCanonicalMatchState();
  const [composerEvent, setComposerEvent] = useState<OfficialEventView | null>(null);
  const [publishedMoments, setPublishedMoments] = useState<MatchRoomView["moments"]>([]);
  const [captureSeconds, setCaptureSeconds] = useState(0);

  useEffect(() => registerSource(sourceMatch, dataset.sourceMode), [registerSource, dataset.sourceMode, sourceMatch]);
  useEffect(() => {
    if (mode !== "live" || !activeEvent || activeEvent.kind === "phase") {
      setCaptureSeconds(0);
      return;
    }
    setCaptureSeconds(45);
    const timer = window.setInterval(() => setCaptureSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [activeEvent, mode]);

  const match = useMemo(() => ({ ...canonicalMatch, moments: [...publishedMoments, ...canonicalMatch.moments] }), [canonicalMatch, publishedMoments]);
  const captureEvent = mode === "live" && captureSeconds > 0 && activeEvent?.kind !== "phase" ? activeEvent : null;
  const closeComposer = useCallback(() => setComposerEvent(null), []);
  const openComposer = (event: OfficialEventView) => setComposerEvent(event);

  return (
    <div className="match-page page-frame">
      <DataModeSwitch matchId={match.id} mode={mode} />
      <div className="replay-disclosure"><Radio size={15} /><span><strong>{dataset.disclosure.label}</strong> — {mode === "replay" ? "The complete official timeline and historical community activity are available now." : "Official events unlock Moments and community activity as the match progresses."}</span></div>
      <div className="match-hero-grid">
        <motion.div key={`${match.home.score}-${match.away.score}-${match.minute}`} initial={{ opacity: .82 }} animate={{ opacity: 1 }} transition={{ duration: .18 }}><MatchScoreboard match={match} /></motion.div>
        <TxlineStatusCard mode={match.mode} verified={match.txlineVerified} />
      </div>
      <OfficialEventRail events={visibleEvents} mode={match.mode} verified={match.txlineVerified} />
      <AnimatePresence mode="wait">
        {captureEvent && <motion.div key={captureEvent.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .28 }}><CaptureWindowBanner event={captureEvent} seconds={captureSeconds} onCapture={() => openComposer(captureEvent)} /></motion.div>}
      </AnimatePresence>
      <div className="match-content">
        <section className="moments-section" id="moments">
          <MomentFeed matchId={match.id} moments={match.moments} mode={mode} scheduledMomentIds={sourceMatch.moments.map((moment) => moment.id)} visibleMomentIds={match.moments.map((moment) => moment.id)} />
        </section>
        <div className="match-side-rail" id="rankings">
          <MomentumMeter match={match} />
          <MatchTreasuryPanel match={match} />
        </div>
      </div>
      {composerEvent && <MomentComposer matchId={match.id} event={composerEvent} open onClose={closeComposer} onPublished={(moment) => setPublishedMoments((current) => [moment, ...current])} />}
    </div>
  );
}
