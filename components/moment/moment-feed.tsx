"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MomentCard } from "./moment-card";
import type { MomentView } from "@/lib/txline/replay-fixture";

type FeedSort = "newest" | "trending" | "top";

export function MomentFeed({ moments }: { moments: MomentView[] }) {
  const [sort, setSort] = useState<FeedSort>("newest");
  const sorted = useMemo(() => [...moments].sort((a, b) => {
    if (sort === "top") return b.championCount - a.championCount;
    if (sort === "trending") return (b.championCount + (b.commentCount ?? 0) * 3) - (a.championCount + (a.commentCount ?? 0) * 3);
    if (a.createdAtLabel === "Just now") return -1;
    if (b.createdAtLabel === "Just now") return 1;
    return a.rank - b.rank;
  }), [moments, sort]);
  return <>
    <div className="section-heading"><div><span className="eyebrow">Fan-created content</span><h2>Fan reactions</h2></div><div className="feed-tabs" role="tablist" aria-label="Sort Moments">{(["newest","trending","top"] as FeedSort[]).map((option) => <button key={option} type="button" role="tab" aria-selected={sort === option} onClick={() => setSort(option)}>{option[0].toUpperCase() + option.slice(1)}</button>)}</div></div>
    <motion.div layout className="moment-grid">{sorted.map((moment, index) => <motion.div layout key={moment.id}><MomentCard moment={moment} featured={index === 0 && sort === "top"} /></motion.div>)}</motion.div>
  </>;
}
