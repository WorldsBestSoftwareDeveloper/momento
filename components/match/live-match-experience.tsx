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
import { useCallback, useState } from "react";
import { useLiveMatchSource } from "@/lib/match/use-live-match-source";
import { useLiveCaptureWindow } from "@/lib/match/use-live-capture-window";
import { DataModeSwitch } from "./data-mode-switch";
import { MatchTreasuryPanel } from "@/components/opinion/match-treasury-panel";

export function MatchExperience({ dataset }: { dataset: MatchExperienceDataset }) {
  const sourceMatch = useLiveMatchSource(dataset);
  const replay = useReplayController(sourceMatch, dataset.timeline, dataset.autoAdvance);
  const liveCapture = useLiveCaptureWindow(sourceMatch, dataset.sourceMode === "live");
  const captureEvent = replay.captureEvent ?? liveCapture.event;
  const captureSeconds = replay.captureEvent ? replay.captureSeconds : liveCapture.seconds;
  const [composerEvent, setComposerEvent] = useState<OfficialEventView | null>(null);
  const [publishedMoments, setPublishedMoments] = useState<MatchRoomView["moments"]>([]);
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
          <MomentFeed matchId={replay.match.id} moments={[...publishedMoments, ...replay.match.moments]} mode={dataset.sourceMode} />
        </section>
        <div className="match-side-rail" id="rankings">
          <MomentumMeter match={replay.match} />
          <MatchTreasuryPanel match={replay.match} />
        </div>
      </div>
      {composerEvent && <MomentComposer matchId={replay.match.id} event={composerEvent} open onClose={closeComposer} onPublished={(moment) => setPublishedMoments((current) => [moment, ...current])} />}
    </div>
  );
}
