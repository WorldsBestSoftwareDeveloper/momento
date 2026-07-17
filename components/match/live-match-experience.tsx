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
import { ReplayControls } from "./replay-controls";
import { useReplayController } from "@/lib/replay/use-replay-controller";
import type { MatchRoomView, OfficialEventView } from "@/lib/txline/replay-fixture";
import type { MatchExperienceDataset } from "@/lib/match/match-data-source";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLiveMatchSource } from "@/lib/match/use-live-match-source";
import { useLiveCaptureWindow } from "@/lib/match/use-live-capture-window";
import { DataModeSwitch } from "./data-mode-switch";
import { MatchTreasuryPanel } from "@/components/opinion/match-treasury-panel";
import { DEMO_REPLAY_INTERVAL_MS } from "@/lib/replay/demo-sequence";

export function MatchExperience({ dataset }: { dataset: MatchExperienceDataset }) {
  const sourceMatch = useLiveMatchSource(dataset);
  const replay = useReplayController(sourceMatch, dataset.timeline, dataset.autoAdvance);
  const liveCapture = useLiveCaptureWindow(sourceMatch, dataset.sourceMode === "live");
  const captureEvent = replay.captureEvent ?? liveCapture.event;
  const captureSeconds = replay.captureEvent ? replay.captureSeconds : liveCapture.seconds;
  const [composerEvent, setComposerEvent] = useState<OfficialEventView | null>(null);
  const [publishedMoments, setPublishedMoments] = useState<MatchRoomView["moments"]>([]);
  const [livePresentationStep, setLivePresentationStep] = useState(0);
  useEffect(() => {
    if (dataset.sourceMode !== "live") { setLivePresentationStep(0); return; }
    setLivePresentationStep(0);
    const timer = window.setInterval(() => setLivePresentationStep((step) => {
      if (step >= 7) { window.clearInterval(timer); return step; }
      return step + 1;
    }), DEMO_REPLAY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [dataset.match.id, dataset.sourceMode]);
  const scheduledMomentIds = useMemo(() => dataset.sourceMode === "live" ? replay.match.moments.map((moment) => moment.id) : [], [dataset.sourceMode, replay.match.moments]);
  const revealedMoments = dataset.sourceMode === "live" ? replay.match.moments.slice(0, Math.min(livePresentationStep, replay.match.moments.length)) : replay.match.moments;
  const presentedMatch = useMemo(() => {
    const moments = [...publishedMoments, ...revealedMoments];
    const championActions = moments.reduce((total, moment) => total + moment.championCount, 0);
    const leadingShare = championActions && moments[0] ? Math.round((moments[0].championCount / championActions) * 100) : 0;
    return { ...replay.match, moments, championActions, leadingShare, state: dataset.sourceMode === "live" && livePresentationStep >= 7 ? "final" as const : replay.match.state };
  }, [dataset.sourceMode, livePresentationStep, publishedMoments, replay.match, revealedMoments]);
  const closeComposer = useCallback(() => setComposerEvent(null), []);
  const openComposer = (event: OfficialEventView) => { replay.pause(); setComposerEvent(event); };
  return (
    <div className="match-page page-frame">
      <DataModeSwitch matchId={dataset.match.id} mode={dataset.sourceMode} />
      <div className="replay-disclosure"><Radio size={15} /><span><strong>{dataset.disclosure.label}</strong> — {dataset.disclosure.detail}</span></div>
      {dataset.transportEnabled && <ReplayControls cursor={replay.cursor} total={dataset.timeline.length} running={replay.running} completed={replay.completed} beatLabel={replay.beat?.label ?? "Ready to begin"} onStart={replay.start} onNext={replay.next} onPause={replay.pause} onResume={replay.resume} onReset={replay.reset} onFinish={replay.finish} />}
      <div className="match-hero-grid">
        <motion.div key={`${replay.match.home.score}-${replay.match.away.score}-${replay.match.minute}`} initial={{ opacity: .82 }} animate={{ opacity: 1 }} transition={{ duration: .18 }}><MatchScoreboard match={replay.match} /></motion.div>
        <TxlineStatusCard mode={replay.match.mode} verified={replay.match.txlineVerified} />
      </div>
      <OfficialEventRail events={replay.visibleEvents} mode={replay.match.mode} verified={replay.match.txlineVerified} />
      <AnimatePresence mode="wait">
        {captureEvent && <motion.div key={captureEvent.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .28 }}><CaptureWindowBanner event={captureEvent} seconds={captureSeconds} onCapture={() => openComposer(captureEvent)} /></motion.div>}
      </AnimatePresence>
      <div className="match-content">
        <section className="moments-section" id="moments">
          <MomentFeed matchId={replay.match.id} moments={[...publishedMoments, ...replay.match.moments]} mode={dataset.sourceMode} scheduledMomentIds={scheduledMomentIds} visibleMomentIds={revealedMoments.map((moment) => moment.id)} />
        </section>
        <div className="match-side-rail" id="rankings">
          <MomentumMeter match={presentedMatch} />
          <MatchTreasuryPanel match={presentedMatch} />
        </div>
      </div>
      {composerEvent && <MomentComposer matchId={replay.match.id} event={composerEvent} open onClose={closeComposer} onPublished={(moment) => setPublishedMoments((current) => [moment, ...current])} />}
    </div>
  );
}
