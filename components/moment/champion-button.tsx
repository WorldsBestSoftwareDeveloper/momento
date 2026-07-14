"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export function ChampionButton({ championed, count, busy, compact = false, onChampion }: { championed: boolean; count: number; busy?: boolean; compact?: boolean; onChampion: () => void }) {
  return (
    <motion.button
      type="button" className={`champion-button ${championed ? "is-championed" : ""} ${compact ? "is-compact" : ""}`}
      aria-pressed={championed} aria-label={`${championed ? "Remove Champion from" : "Champion"} this Moment`}
      disabled={busy} onClick={(event) => { event.stopPropagation(); onChampion(); }}
      whileTap={{ scale: .92 }} animate={championed ? { scale: [1, 1.14, 1] } : { scale: 1 }} transition={{ duration: .35 }}
    >
      <span className="champion-crest" aria-hidden="true"><Heart size={compact ? 17 : 19} fill={championed ? "currentColor" : "none"} /></span>
      {!compact && <span>Champion</span>}
      <strong>{count.toLocaleString()}</strong>
    </motion.button>
  );
}

