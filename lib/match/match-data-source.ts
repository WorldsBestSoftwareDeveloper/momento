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

function replayFallback(fixtureId: string, reason: string): MatchExperienceDataset {
  const match = getDemoMatch(fixtureId, "replay", "Demo Replay • Recorded TxLINE Data");
  return {
    sourceMode: "replay", match, timeline: demoReplayBeats, autoAdvance: true, transportEnabled: true,
    disclosure: {
      label: "Demo Replay • Recorded TxLINE Data",
      detail: `Bundled normalized recording is active (${reason}). Add TxLINE credentials to refresh it from fixture 18237038.`,
    },
    conversation: [],
  };
}

async function createReplayDataset(fixtureId: string): Promise<MatchExperienceDataset> {
  const config = getTxlineRuntimeConfig();
  if (!config.configured) return replayFallback(fixtureId, "TxLINE credentials are not configured");
  try {
    const replay = await loadTxlineReplay();
    return {
      sourceMode: "replay", match: replay.match, timeline: replay.timeline, autoAdvance: true, transportEnabled: true,
      disclosure: { label: "Demo Replay • Recorded TxLINE Data", detail: `Official TxLINE ${replay.source === "historical" ? "historical" : "score snapshot"} events loaded for fixture ${config.fixtureId}.` },
      conversation: [],
    };
  } catch (error) {
    return replayFallback(fixtureId, error instanceof Error ? error.message : "historical replay unavailable");
  }
}

function liveSetupDataset(fixtureId: string, detail: string): MatchExperienceDataset {
  const match = getDemoMatch(fixtureId, "cached", "Live Mode • TxLINE Setup Required");
  return {
    sourceMode: "live",
    match: { ...match, minute: "—", statusLabel: "TxLINE setup required", updatedAtLabel: "Add server-side TxLINE credentials", home: { ...match.home, score: 0 }, away: { ...match.away, score: 0 }, events: [] },
    timeline: [], autoAdvance: false, transportEnabled: false,
    disclosure: { label: "Live Mode • TxLINE Setup Required", detail }, conversation: [],
  };
}

async function createLiveDataset(fixtureId: string): Promise<MatchExperienceDataset> {
  const config = getTxlineRuntimeConfig();
  if (!config.configured) return replayFallback(fixtureId, "Live Mode requested without TxLINE credentials");
  try {
    const [fixture, updates] = await Promise.all([
      getFixture(config.fixtureId),
      getScoreSnapshot(config.fixtureId).catch(() => getHistoricalScores(config.fixtureId)),
    ]);
    if (!fixture) return liveSetupDataset(fixtureId, `No TxLINE fixture found for ${config.fixtureId}.`);
    const match = mapTxlineMatch(fixture, updates, "live");
    return {
      sourceMode: "live", match, timeline: [], autoAdvance: false, transportEnabled: false,
      liveTransport: { snapshotUrl: `/api/txline/match?fixtureId=${config.fixtureId}`, streamUrl: `/api/txline/stream?fixtureId=${config.fixtureId}` },
      disclosure: { label: "Live • Official TxLINE Data", detail: `Authenticated score snapshots and SSE updates for fixture ${config.fixtureId}.` }, conversation: [],
    };
  } catch (error) {
    return replayFallback(fixtureId, error instanceof Error ? `Live Mode unavailable: ${error.message}` : "Live Mode unavailable: TxLINE network request failed");
  }
}

export async function getMatchExperienceDataset(matchId: string, queryMode?: string): Promise<MatchExperienceDataset> {
  const config = getReplayConfig();
  if (matchId !== config.fixtureId) throw new Error("MATCH_NOT_FOUND");
  return resolveMatchSourceMode(queryMode) === "replay" ? createReplayDataset(matchId) : createLiveDataset(matchId);
}
