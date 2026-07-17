import { DEMO_REPLAY_INTERVAL_MS, demoReplayBeats } from "./demo-sequence";
import type { MatchRoomView } from "@/lib/txline/replay-fixture";
import type { ReplayViewState } from "./types";

export type ReplayAction =
  | { type: "start" }
  | { type: "next" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "reset" }
  | { type: "finish" };

export interface ReplayControllerState {
  cursor: number;
  running: boolean;
}

export const initialReplayControllerState: ReplayControllerState = { cursor: -1, running: false };

export function replayReducer(state: ReplayControllerState, action: ReplayAction, timeline = demoReplayBeats): ReplayControllerState {
  const last = timeline.length - 1;
  switch (action.type) {
    case "start": return state.cursor < 0 ? { cursor: 0, running: true } : { ...state, running: true };
    case "next": return { cursor: Math.min(state.cursor + 1, last), running: state.cursor + 1 < last };
    case "pause": return { ...state, running: false };
    case "resume": return state.cursor < last ? { ...state, running: true } : state;
    case "finish": return { cursor: last, running: false };
    case "reset": return initialReplayControllerState;
  }
}

export function buildReplayView(initialMatch: MatchRoomView, state: ReplayControllerState, timeline = demoReplayBeats): ReplayViewState {
  if (timeline.length === 0) {
    const activeEvent = initialMatch.events.find((event) => event.active) ?? null;
    return { cursor: -1, running: false, completed: false, beat: null, match: initialMatch, visibleEvents: initialMatch.events, captureEvent: activeEvent };
  }
  const beat = state.cursor >= 0 ? timeline[state.cursor] : null;
  const visibleIds = new Set(beat?.visibleEventIds ?? []);
  const visibleEvents = initialMatch.events
    .filter((event) => visibleIds.has(event.id))
    .map((event) => ({ ...event, active: event.id === beat?.activeEventId }));
  const captureEvent = visibleEvents.find((event) => event.id === beat?.captureEventId) ?? null;
  const moments = initialMatch.moments.map((moment, index) => ({ ...moment, championCount: moment.championCount + (beat?.championDeltas[index] ?? 0) }));
  const championActions = moments.reduce((total, moment) => total + moment.championCount, 0);
  const leadingCount = Math.max(...moments.map((moment) => moment.championCount));
  const leadingShare = championActions > 0 ? Math.round((leadingCount / championActions) * 100) : 0;
  const match: MatchRoomView = beat ? {
    ...initialMatch,
    minute: beat.minute,
    state: beat.isFinal ? "final" : "live",
    statusLabel: beat.statusLabel,
    home: { ...initialMatch.home, score: beat.score[0] },
    away: { ...initialMatch.away, score: beat.score[1] },
    moments,
    championActions,
    leadingShare,
  } : {
    ...initialMatch,
    minute: "—",
    state: "live",
    statusLabel: "Archive ready",
    home: { ...initialMatch.home, score: 0 },
    away: { ...initialMatch.away, score: 0 },
    moments,
    championActions,
    leadingShare,
  };

  return { cursor: state.cursor, running: state.running, completed: state.cursor === timeline.length - 1, beat, match, visibleEvents, captureEvent };
}

export { DEMO_REPLAY_INTERVAL_MS, demoReplayBeats };
