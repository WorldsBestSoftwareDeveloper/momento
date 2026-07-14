"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Radio } from "lucide-react";
import { MatchScoreboard } from "./match-scoreboard";
import { OfficialEventRail } from "./official-event-rail";
import { MomentumMeter } from "./momentum-meter";
import { MomentCard } from "@/components/moment/moment-card";
import { TxlineStatusCard } from "./txline-status-card";
import { MatchChatPreview } from "./match-chat-preview";
import { CaptureWindowBanner } from "./capture-window-banner";
import { ReplayControls } from "./replay-controls";
import { demoReplayBeats } from "@/lib/replay/replay-controller";
import { useReplayController } from "@/lib/replay/use-replay-controller";
import type { MatchRoomView } from "@/lib/txline/replay-fixture";

export function LiveMatchExperience({ initialMatch }: { initialMatch: MatchRoomView }) {
  const replay = useReplayController(initialMatch);
  const messages = replay.beat?.conversation ?? [];
  return (
    <div className="match-page page-frame">
      <div className="replay-disclosure"><Radio size={15} /><span><strong>{initialMatch.modeLabel}</strong> — official events are replayed through the same UI contract planned for live TxLINE data.</span></div>
      <ReplayControls cursor={replay.cursor} total={demoReplayBeats.length} running={replay.running} completed={replay.completed} beatLabel={replay.beat?.label ?? "Ready to begin"} onStart={replay.start} onNext={replay.next} onPause={replay.pause} onResume={replay.resume} onReset={replay.reset} onFinish={replay.finish} />
      <div className="match-hero-grid">
        <motion.div key={`${replay.match.home.score}-${replay.match.away.score}-${replay.match.minute}`} initial={{ opacity: .82 }} animate={{ opacity: 1 }} transition={{ duration: .18 }}><MatchScoreboard match={replay.match} /></motion.div>
        <TxlineStatusCard mode={replay.match.mode} />
      </div>
      <OfficialEventRail events={replay.visibleEvents} mode={replay.match.mode} />
      <AnimatePresence mode="wait">
        {replay.captureEvent && <motion.div key={replay.captureEvent.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .28 }}><CaptureWindowBanner event={replay.captureEvent} seconds={replay.captureSeconds} /></motion.div>}
      </AnimatePresence>
      <div className="match-content">
        <section className="moments-section" id="moments">
          <div className="section-heading"><div><span className="eyebrow">Fan-created content</span><h2>Fan reactions</h2></div><button className="sort-button" type="button">Most recent <ChevronDown size={15} /></button></div>
          <div className="moment-grid">{replay.match.moments.map((moment, index) => <MomentCard key={moment.id} moment={moment} featured={index === 0} />)}</div>
        </section>
        <div className="match-side-rail" id="rankings">
          <MomentumMeter match={replay.match} />
          <MatchChatPreview messages={messages} />
        </div>
      </div>
    </div>
  );
}
