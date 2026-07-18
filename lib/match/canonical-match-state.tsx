"use client";

import { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { DEMO_REPLAY_INTERVAL_MS } from "@/lib/replay/demo-sequence";
import { CANONICAL_MATCH_ID } from "@/lib/txline/replay-config";
import { type MatchRoomView, type OfficialEventView } from "@/lib/txline/replay-fixture";

export type CanonicalMatchMode = "replay" | "live";

interface CanonicalMatchState {
  mode: CanonicalMatchMode;
  match: MatchRoomView;
  visibleEvents: OfficialEventView[];
  activeEvent: OfficialEventView | null;
  cursor: number;
  completed: boolean;
  registerSource: (match: MatchRoomView, mode: CanonicalMatchMode) => void;
  modeHref: (path: string) => string;
}

const CanonicalMatchContext = createContext<CanonicalMatchState | null>(null);

function archivedMatch(source: MatchRoomView): MatchRoomView {
  return {
    ...source,
    state: "final",
    statusLabel: "Full time",
    minute: "FT",
    mode: "replay",
    modeLabel: "Historical Replay • Official TxLINE Match Data",
    events: source.events.map((event) => ({ ...event, active: false })),
  };
}

const LIVE_LAST_CURSOR = 6;

function liveView(source: MatchRoomView, cursor: number) {
  const revealedMomentCount = Math.max(0, Math.min(cursor, 4));
  const moments = source.moments.slice(0, revealedMomentCount);
  const visibleEventCount = cursor === 0 ? 1 : Math.ceil((source.events.length * Math.min(cursor, 4)) / 4);
  const visibleEvents = source.events.slice(0, visibleEventCount).map((event, index, events) => ({ ...event, active: index === events.length - 1 }));
  const championActions = moments.reduce((total, moment) => total + moment.championCount, 0);
  const leadingCount = moments.length ? Math.max(...moments.map((moment) => moment.championCount)) : 0;
  const kickoff = cursor === 0;
  const settled = cursor >= LIVE_LAST_CURSOR;
  const latestEvent = visibleEvents.at(-1);
  const homeGoals = visibleEvents.filter((event) => event.kind === "goal" && event.team === source.home.name).length;
  const awayGoals = visibleEvents.filter((event) => event.kind === "goal" && event.team === source.away.name).length;
  const hasAuthenticatedEvents = source.txlineVerified && source.events.length > 0;
  const liveHomeScore = hasAuthenticatedEvents ? homeGoals : source.home.score;
  const liveAwayScore = hasAuthenticatedEvents ? awayGoals : source.away.score;
  return {
    match: {
      ...source,
      mode: "live" as const,
      modeLabel: "Live Match • Official TxLINE Feed",
      state: settled ? "final" as const : "live" as const,
      statusLabel: settled ? "Full time" : kickoff ? "Kickoff" : "Match in progress",
      minute: settled ? "FT" : kickoff ? "0′" : latestEvent?.minute ?? source.minute,
      home: { ...source.home, score: kickoff ? 0 : settled ? source.home.score : liveHomeScore },
      away: { ...source.away, score: kickoff ? 0 : settled ? source.away.score : liveAwayScore },
      events: visibleEvents,
      moments,
      championActions,
      leadingShare: championActions ? Math.round((leadingCount / championActions) * 100) : 0,
    },
    visibleEvents,
  };
}
function ModeQuerySync({ onMode }: { onMode: (mode: CanonicalMatchMode) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const queryMode = searchParams.get("mode");
    if (queryMode === "live" || queryMode === "replay") onMode(queryMode);
  }, [onMode, searchParams]);
  return null;
}

export function CanonicalMatchProvider({ children, defaultMode, initialReplayMatch, initialLiveMatch }: { children: ReactNode; defaultMode: CanonicalMatchMode; initialReplayMatch: MatchRoomView; initialLiveMatch: MatchRoomView }) {
  const [mode, setMode] = useState<CanonicalMatchMode>(defaultMode);
  const sourcesRef = useRef<Record<CanonicalMatchMode, MatchRoomView>>({ replay: { ...initialReplayMatch, id: CANONICAL_MATCH_ID }, live: { ...initialLiveMatch, id: CANONICAL_MATCH_ID } });
  const cursorRef = useRef(-1);
  const [cursor, setCursor] = useState(-1);
  const [match, setMatch] = useState<MatchRoomView>(() => defaultMode === "replay" ? archivedMatch(sourcesRef.current.replay) : liveView(sourcesRef.current.live, 0).match);

  const apply = useCallback((nextMode: CanonicalMatchMode, nextCursor: number) => {
    if (nextMode === "replay") {
      setMatch(archivedMatch(sourcesRef.current.replay));
      return;
    }
    setMatch(liveView(sourcesRef.current.live, nextCursor).match);
  }, []);

  useEffect(() => {
    const initialCursor = mode === "live" ? 0 : -1;
    cursorRef.current = initialCursor;
    setCursor(initialCursor);
    apply(mode, initialCursor);
    if (mode !== "live") return;
    const timer = window.setInterval(() => {
      const next = Math.min(cursorRef.current + 1, LIVE_LAST_CURSOR);
      cursorRef.current = next;
      setCursor(next);
      apply("live", next);
      if (next === LIVE_LAST_CURSOR) window.clearInterval(timer);
    }, DEMO_REPLAY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [apply, mode]);

  const registerSource = useCallback((source: MatchRoomView, sourceMode: CanonicalMatchMode) => {
    if (sourceMode !== mode) return;
    sourcesRef.current[sourceMode] = { ...source, id: CANONICAL_MATCH_ID };
    apply(mode, cursorRef.current);
  }, [apply, mode]);

  useEffect(() => {
    if (mode !== "live") return;
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/txline/match", { cache: "no-store" });
        if (response.ok && active) registerSource(await response.json(), "live");
      } catch { /* keep the most recent authenticated snapshot */ }
    };
    void refresh();
    const timer = window.setInterval(refresh, 15_000);
    return () => { active = false; window.clearInterval(timer); };
  }, [mode, registerSource]);

  const modeHref = useCallback((path: string) => {
    const [base, hash] = path.split("#");
    return `${base}?mode=${mode}${hash ? `#${hash}` : ""}`;
  }, [mode]);

  const visibleEvents = match.events;
  const activeEvent = visibleEvents.find((event) => event.active) ?? null;
  const value = useMemo(() => ({ mode, match, visibleEvents, activeEvent, cursor, completed: mode === "replay" || cursor === LIVE_LAST_CURSOR, registerSource, modeHref }), [activeEvent, cursor, match, mode, modeHref, registerSource, visibleEvents]);
  return <CanonicalMatchContext.Provider value={value}><Suspense fallback={null}><ModeQuerySync onMode={setMode} /></Suspense>{children}</CanonicalMatchContext.Provider>;
}

export function useCanonicalMatchState() {
  const value = useContext(CanonicalMatchContext);
  if (!value) throw new Error("useCanonicalMatchState must be used within CanonicalMatchProvider");
  return value;
}
