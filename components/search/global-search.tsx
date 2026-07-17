"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Search, UserRound, Video, X } from "lucide-react";
import { useCanonicalMatchState } from "@/lib/match/canonical-match-state";

export function GlobalSearch({ fixtureId, mobile = false }: { fixtureId: string; mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { match, modeHref } = useCanonicalMatchState();
  const normalized = query.trim().toLowerCase();
  const moments = normalized ? match.moments.filter((moment) => `${moment.title} ${moment.creator} ${moment.handle} ${moment.eventLabel}`.toLowerCase().includes(normalized)) : match.moments;
  const creators = Array.from(new Map(match.moments.filter((moment) => !normalized || `${moment.creator} ${moment.handle}`.toLowerCase().includes(normalized)).map((moment) => [moment.handle, moment])).values());
  const matchVisible = !normalized || `${match.competition} ${match.home.name} ${match.away.name}`.toLowerCase().includes(normalized);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    const keydown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", keydown);
    return () => { window.clearTimeout(timer); window.removeEventListener("keydown", keydown); document.body.style.overflow = previous; };
  }, [open]);
  const close = () => { setOpen(false); setQuery(""); };
  return <>
    <button type="button" className={mobile ? "mobile-search-button" : "icon-button"} aria-label="Search Momento" onClick={() => setOpen(true)}><Search />{mobile && <span>Search</span>}</button>
    {typeof document !== "undefined" && createPortal(<AnimatePresence>{open && <motion.div className="search-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && close()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.section className="search-dialog" role="dialog" aria-modal="true" aria-labelledby="search-title" initial={{ opacity: 0, y: -12, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: .99 }}>
        <header><div><span className="eyebrow">Find the defining Moment</span><h2 id="search-title">Search Momento</h2></div><button type="button" className="icon-button" onClick={close} aria-label="Close search"><X /></button></header>
        <label className="search-field"><Search /><input ref={inputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Moments, creators or matches" /><kbd>ESC</kbd></label>
        <div className="search-results" aria-live="polite">
          {matchVisible && <div className="search-group"><span>Match</span><Link href={modeHref(`/matches/${fixtureId}`)} onClick={close}><strong>{match.home.name} vs {match.away.name}</strong><small>{match.competition} • Open match room</small></Link></div>}
          {moments.length > 0 && <div className="search-group"><span>Moments</span>{moments.slice(0, 4).map((moment) => <Link href={modeHref(`/matches/${fixtureId}#moments`)} onClick={close} key={moment.id}><Video /><strong>{moment.title}</strong><small>{moment.creator} • {moment.eventLabel}</small></Link>)}</div>}
          {creators.length > 0 && <div className="search-group"><span>Creators</span>{creators.slice(0, 4).map((creator) => <Link href={creator.handle === "@leo_fra" ? modeHref("/profile") : modeHref(`/matches/${fixtureId}#moments`)} onClick={close} key={creator.handle}><UserRound /><strong>{creator.creator}</strong><small>{creator.handle}</small></Link>)}</div>}
          {!matchVisible && !moments.length && !creators.length && <div className="search-empty"><Search /><strong>No results yet</strong><span>Try a creator, a Moment title, France or Spain.</span></div>}
        </div>
      </motion.section>
    </motion.div>}</AnimatePresence>, document.body)}
  </>;
}
