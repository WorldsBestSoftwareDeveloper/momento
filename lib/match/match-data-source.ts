import { demoReplayBeats } from "@/lib/replay/demo-sequence";
import type { ReplayBeat, ReplayConversationMessage } from "@/lib/replay/types";
import { getFixture } from "@/lib/txline/fixtures";
import { mapTxlineMatch } from "@/lib/txline/mapper";
import { loadTxlineReplay } from "@/lib/txline/replay";
import { getHistoricalScores, getScoreSnapshot } from "@/lib/txline/scores";
import { getReplayConfig } from "@/lib/txline/replay-config";
import { getDemoMatch, type MatchRoomView } from "@/lib/txline/replay-fixture";
import { getTxlineRuntimeConfig } from "@/lib/txline/validation";

export type MatchSourceMode = "replay" | "live";

export interface MatchExperienceDataset {
  sourceMode: MatchSourceMode;
  match: MatchRoomView;
  timeline: ReplayBeat[];
  autoAdvance: boolean;
  transportEnabled: boolean;
  liveTransport?: { snapshotUrl: string; streamUrl: string };
  disclosure: { label: string; detail: string };
  conversation: ReplayConversationMessage[];
}

export function resolveMatchSourceMode(queryMode?: string): MatchSourceMode {
  if (queryMode === "replay" || queryMode === "live") return queryMode;
  return getReplayConfig().demoMode ? "replay" : "live";
}

function replayFallback(fixtureId: string): MatchExperienceDataset {
  const match = getDemoMatch(fixtureId, "replay", "Historical Replay • Official TxLINE Match Data");
  return {
    sourceMode: "replay", match, timeline: demoReplayBeats, autoAdvance: true, transportEnabled: true,
    disclosure: {
      label: "Historical Replay • Official Match Archive",
      detail: "Follow the official match timeline, archived events and historical community activity.",
    },
    conversation: [],
  };
}

async function createReplayDataset(fixtureId: string): Promise<MatchExperienceDataset> {
  const config = getTxlineRuntimeConfig();
  if (!config.configured) return replayFallback(fixtureId);
  try {
    const replay = await loadTxlineReplay();
    return {
      sourceMode: "replay", match: { ...replay.match, id: fixtureId }, timeline: replay.timeline, autoAdvance: true, transportEnabled: true,
      disclosure: { label: "Historical Replay • Official TxLINE Match Data", detail: `Official TxLINE ${replay.source === "historical" ? "historical timeline" : "archived match snapshot"} loaded from the match archive.` },
      conversation: [],
    };
  } catch {
    return replayFallback(fixtureId);
  }
}

function liveSetupDataset(fixtureId: string, detail: string): MatchExperienceDataset {
  const match = getDemoMatch(fixtureId, "cached", "Live Match • Feed Temporarily Unavailable");
  return {
    sourceMode: "live",
    match: { ...match, minute: "—", statusLabel: "Live feed temporarily unavailable", updatedAtLabel: "Historical replay remains available", home: { ...match.home, score: 0 }, away: { ...match.away, score: 0 }, events: [] },
    timeline: [], autoAdvance: false, transportEnabled: false,
    disclosure: { label: "Live Match • Feed Temporarily Unavailable", detail }, conversation: [],
  };
}

async function createLiveDataset(fixtureId: string): Promise<MatchExperienceDataset> {
  const config = getTxlineRuntimeConfig();
  if (!config.configured) return liveSetupDataset(fixtureId, "Add TxLINE credentials to connect the official live feed. Historical Replay remains available.");
  try {
    const [fixture, updates] = await Promise.all([
      getFixture(config.fixtureId),
      getScoreSnapshot(config.fixtureId).catch(() => getHistoricalScores(config.fixtureId)),
    ]);
    if (!fixture) return liveSetupDataset(fixtureId, "Official live match coverage is not available yet. Historical Replay remains available.");
    const match = { ...mapTxlineMatch(fixture, updates, "live"), id: fixtureId };
    return {
      sourceMode: "live", match, timeline: [], autoAdvance: false, transportEnabled: false,
      liveTransport: { snapshotUrl: `/api/txline/match?fixtureId=${config.fixtureId}`, streamUrl: `/api/txline/stream?fixtureId=${config.fixtureId}` },
      disclosure: { label: "Live Match • Official TxLINE Feed", detail: "Official match updates and live community activity powered by TxLINE." }, conversation: [],
    };
  } catch {
    return liveSetupDataset(fixtureId, "Official live match coverage is reconnecting. Historical Replay remains available.");
  }
}

export async function getMatchExperienceDataset(matchId: string, queryMode?: string): Promise<MatchExperienceDataset> {
  const config = getReplayConfig();
  if (matchId !== config.matchId) throw new Error("MATCH_NOT_FOUND");
  return resolveMatchSourceMode(queryMode) === "replay" ? createReplayDataset(matchId) : createLiveDataset(matchId);
}
