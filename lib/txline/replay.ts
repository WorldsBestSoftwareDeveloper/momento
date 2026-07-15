import { getFixture } from "./fixtures";
import { mapReplayBeats, mapTxlineMatch } from "./mapper";
import { getHistoricalScores, getScoreSnapshot } from "./scores";
import { requireTxlineConfig } from "./validation";

export async function loadTxlineReplay() {
  const { fixtureId } = requireTxlineConfig();
  const fixture = await getFixture(fixtureId);
  if (!fixture) throw new Error("TXLINE_FIXTURE_NOT_FOUND");
  let updates = await getHistoricalScores(fixtureId);
  let source: "historical" | "snapshot" = "historical";
  if (!updates.length) {
    updates = await getScoreSnapshot(fixtureId);
    source = "snapshot";
  }
  if (!updates.length) throw new Error("TXLINE_REPLAY_RECORDS_UNAVAILABLE");
  const match = mapTxlineMatch(fixture, updates, "replay");
  const timeline = mapReplayBeats(match, updates, fixture);
  if (!timeline.length) throw new Error("TXLINE_HISTORICAL_REPLAY_HAS_NO_SUPPORTED_EVENTS");
  const selectedIds = new Set(timeline.flatMap((beat) => beat.visibleEventIds));
  const replayMatch = { ...match, events: match.events.filter((event) => selectedIds.has(event.id)) };
  return { match: replayMatch, timeline, fixture, updates, source };
}
