"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import type { MatchRoomView } from "@/lib/txline/replay-fixture";
import type { ReplayBeat } from "./types";
import { buildReplayView, DEMO_REPLAY_INTERVAL_MS, initialReplayControllerState, replayReducer } from "./replay-controller";

export function useReplayController(initialMatch: MatchRoomView, timeline: ReplayBeat[], autoAdvance: boolean) {
  const [state, dispatch] = useReducer((current, action) => replayReducer(current, action, timeline), initialReplayControllerState);
  const [captureSeconds, setCaptureSeconds] = useState(0);
  const view = useMemo(() => buildReplayView(initialMatch, state, timeline), [initialMatch, state, timeline]);

  useEffect(() => {
    if (!autoAdvance || !state.running) return;
    const timer = window.setTimeout(() => dispatch({ type: "next" }), DEMO_REPLAY_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [autoAdvance, state.cursor, state.running]);

  useEffect(() => {
    setCaptureSeconds(view.beat?.captureSeconds ?? 0);
  }, [view.beat?.id, view.beat?.captureSeconds]);

  useEffect(() => {
    if (!state.running || !view.captureEvent || captureSeconds <= 0) return;
    const timer = window.setInterval(() => setCaptureSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [state.running, view.captureEvent, captureSeconds]);

  return {
    ...view,
    captureSeconds,
    start: () => dispatch({ type: "start" }),
    next: () => dispatch({ type: "next" }),
    pause: () => dispatch({ type: "pause" }),
    resume: () => dispatch({ type: "resume" }),
    reset: () => dispatch({ type: "reset" }),
    finish: () => dispatch({ type: "finish" }),
  };
}
