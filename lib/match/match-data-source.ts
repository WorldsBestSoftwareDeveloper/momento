import { demoReplayBeats } from "@/lib/replay/demo-sequence";
import type { ReplayBeat, ReplayConversationMessage } from "@/lib/replay/types";
import { getReplayConfig, type DataMode } from "@/lib/txline/replay-config";
import { getDemoMatch, type MatchRoomView } from "@/lib/txline/replay-fixture";

export type MatchSourceMode = "replay" | "live";

export interface MatchExperienceDataset {
  sourceMode: MatchSourceMode;
  match: MatchRoomView;
  timeline: ReplayBeat[];
  autoAdvance: boolean;
  transportEnabled: boolean;
  disclosure: {
    label: string;
    detail: string;
  };
  conversation: ReplayConversationMessage[];
}

export function resolveMatchSourceMode(queryMode?: string): MatchSourceMode {
  if (queryMode === "replay" || queryMode === "live") return queryMode;
  return getReplayConfig().demoMode ? "replay" : "live";
}

function createReplayDataset(fixtureId: string): MatchExperienceDataset {
  const label = "Demo Replay • Recorded TxLINE Data";
  return {
    sourceMode: "replay",
    match: getDemoMatch(fixtureId, "replay", label),
    timeline: demoReplayBeats,
    autoAdvance: true,
    transportEnabled: true,
    disclosure: {
      label,
      detail: "Official events are replayed through the same normalized match pipeline used by live data.",
    },
    conversation: [],
  };
}

function createLiveDataset(fixtureId: string): MatchExperienceDataset {
  const dataMode: DataMode = "cached";
  const match = getDemoMatch(fixtureId, dataMode, "Live Mode • Awaiting TxLINE Snapshot");
  return {
    sourceMode: "live",
    match: {
      ...match,
      minute: "—",
      statusLabel: "Connecting to official data",
      updatedAtLabel: "Waiting for first TxLINE snapshot",
      home: { ...match.home, score: 0 },
      away: { ...match.away, score: 0 },
      events: [],
    },
    timeline: [],
    autoAdvance: false,
    transportEnabled: false,
    disclosure: {
      label: "Live Mode • TxLINE",
      detail: "Waiting for an authenticated official score snapshot. Recorded events are never presented as live.",
    },
    conversation: [],
  };
}

export function getMatchExperienceDataset(matchId: string, queryMode?: string): MatchExperienceDataset {
  const config = getReplayConfig();
  if (matchId !== config.fixtureId) throw new Error("MATCH_NOT_FOUND");
  return resolveMatchSourceMode(queryMode) === "replay" ? createReplayDataset(matchId) : createLiveDataset(matchId);
}
