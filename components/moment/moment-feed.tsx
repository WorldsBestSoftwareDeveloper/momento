"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Radio } from "lucide-react";
import { MomentCard } from "./moment-card";
import { MomentDetail } from "./moment-detail";
import type { MomentView } from "@/lib/txline/replay-fixture";
import { useMatchMoments } from "@/lib/moments/use-match-moments";

type FeedSort = "newest" | "trending" | "top";

export function MomentFeed({ matchId, moments, mode, scheduledMomentIds = [], visibleMomentIds = [] }: { matchId: string; moments: MomentView[]; mode: "live" | "replay"; scheduledMomentIds?: string[]; visibleMomentIds?: string[] }) {
  const [sort, setSort] = useState<FeedSort>("newest");
  const [selectedMoment, setSelectedMoment] = useState<{ moment: MomentView; startAt: number } | null>(null);
  const synchronizedMoments = useMatchMoments(matchId, moments);
  const visibleMoments = useMemo(() => {
    if (!scheduledMomentIds.length) return synchronizedMoments;
    const scheduled = new Set(scheduledMomentIds);
    const visible = new Set(visibleMomentIds);
    return synchronizedMoments.filter((moment) => !scheduled.has(moment.id) || visible.has(moment.id));
  }, [scheduledMomentIds, synchronizedMoments, visibleMomentIds]);
  const sorted = useMemo(() => [...visibleMoments].sort((a, b) => {
    if (sort === "top") return b.championCount - a.championCount;
    if (sort === "trending") return (b.championCount + (b.commentCount ?? 0) * 3) - (a.championCount + (a.commentCount ?? 0) * 3);
    if (a.createdAtLabel === "Just now") return -1;
    if (b.createdAtLabel === "Just now") return 1;
    return a.rank - b.rank;
  }), [sort, visibleMoments]);
  return <>
    <div className="section-heading"><div><span className="eyebrow">Fan-created content</span><h2>Fan reactions</h2></div><div className="feed-tabs" role="tablist" aria-label="Sort Moments">{(["newest","trending","top"] as FeedSort[]).map((option) => <button key={option} type="button" role="tab" aria-selected={sort === option} onClick={() => setSort(option)}>{option[0].toUpperCase() + option.slice(1)}</button>)}</div></div>
    {sorted.length ? <motion.div layout className="moment-grid">{sorted.map((moment, index) => <motion.div layout key={moment.id} initial={{ opacity: 0, y: 18, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .34, ease: [0.22, 1, 0.36, 1] }}><MomentCard matchId={matchId} moment={moment} mode={mode} featured={index === 0 && sort === "top"} onOpen={(startAt) => setSelectedMoment({ moment, startAt })} /></motion.div>)}</motion.div> : <motion.div className="reward-empty moment-feed-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Radio /><strong>Waiting for the first Moment</strong><p>Live community reactions will appear here as the match unfolds.</p></motion.div>}
    <AnimatePresence>{selectedMoment && <MomentDetail matchId={matchId} moment={selectedMoment.moment} mode={mode} initialTime={selectedMoment.startAt} onClose={() => setSelectedMoment(null)} />}</AnimatePresence>
  </>;
}
