"use client";

import { createContext, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { buildReplayView } from "@/lib/replay/replay-controller";
import { DEMO_REPLAY_INTERVAL_MS, demoReplayBeats } from "@/lib/replay/demo-sequence";
import { CANONICAL_MATCH_ID } from "@/lib/txline/replay-config";
import { getDemoMatch, type MatchRoomView, type OfficialEventView } from "@/lib/txline/replay-fixture";

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

function liveView(source: MatchRoomView, cursor: number) {
  const view = buildReplayView(source, { cursor, running: cursor < demoReplayBeats.length - 1 }, demoReplayBeats);
  const visibleIds = new Set(view.visibleEvents.map((event) => event.id));
  const moments = view.match.moments.filter((moment) => visibleIds.has(moment.eventId));
  const championActions = moments.reduce((total, moment) => total + moment.championCount, 0);
  const leadingCount = moments.length ? Math.max(...moments.map((moment) => moment.championCount)) : 0;
  return {
    ...view,
    match: {
      ...view.match,
      mode: "live" as const,
      modeLabel: "Live Match • Official TxLINE Feed",
      events: view.visibleEvents,
      moments,
      championActions,
      leadingShare: championActions ? Math.round((leadingCount / championActions) * 100) : 0,
    },
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

export function CanonicalMatchProvider({ children, defaultMode }: { children: ReactNode; defaultMode: CanonicalMatchMode }) {
  const [mode, setMode] = useState<CanonicalMatchMode>(defaultMode);
  const sourceRef = useRef(getDemoMatch(CANONICAL_MATCH_ID));
  const cursorRef = useRef(-1);
  const [cursor, setCursor] = useState(-1);
  const [match, setMatch] = useState<MatchRoomView>(() => archivedMatch(sourceRef.current));

  const apply = useCallback((nextMode: CanonicalMatchMode, nextCursor: number) => {
    if (nextMode === "replay") {
      setMatch(archivedMatch(sourceRef.current));
      return;
    }
    setMatch(liveView(sourceRef.current, nextCursor).match);
  }, []);

  useEffect(() => {
    const initialCursor = mode === "live" ? 0 : demoReplayBeats.length - 1;
    cursorRef.current = initialCursor;
    setCursor(initialCursor);
    apply(mode, initialCursor);
    if (mode !== "live") return;
    const timer = window.setInterval(() => {
      const next = Math.min(cursorRef.current + 1, demoReplayBeats.length - 1);
      cursorRef.current = next;
      setCursor(next);
      apply("live", next);
      if (next === demoReplayBeats.length - 1) window.clearInterval(timer);
    }, DEMO_REPLAY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [apply, mode]);

  const registerSource = useCallback((source: MatchRoomView, sourceMode: CanonicalMatchMode) => {
    if (sourceMode !== mode) return;
    const archive = getDemoMatch(CANONICAL_MATCH_ID);
    const hasTimeline = source.events.some((event) => archive.events.some((archived) => archived.id === event.id));
    sourceRef.current = {
      ...source,
      id: CANONICAL_MATCH_ID,
      events: hasTimeline ? source.events : archive.events,
      moments: source.moments.length ? source.moments : archive.moments,
    };
    apply(mode, cursorRef.current);
  }, [apply, mode]);

  const modeHref = useCallback((path: string) => {
    const [base, hash] = path.split("#");
    return `${base}?mode=${mode}${hash ? `#${hash}` : ""}`;
  }, [mode]);

  const visibleEvents = mode === "replay" ? match.events : liveView(sourceRef.current, cursor).visibleEvents;
  const activeEvent = visibleEvents.find((event) => event.active) ?? null;
  const value = useMemo(() => ({ mode, match, visibleEvents, activeEvent, cursor, completed: mode === "replay" || cursor === demoReplayBeats.length - 1, registerSource, modeHref }), [activeEvent, cursor, match, mode, modeHref, registerSource, visibleEvents]);
  return <CanonicalMatchContext.Provider value={value}><Suspense fallback={null}><ModeQuerySync onMode={setMode} /></Suspense>{children}</CanonicalMatchContext.Provider>;
}

export function useCanonicalMatchState() {
  const value = useContext(CanonicalMatchContext);
  if (!value) throw new Error("useCanonicalMatchState must be used within CanonicalMatchProvider");
  return value;
}
