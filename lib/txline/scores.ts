import { TxlineClient } from "./client";
import type { TxlineScoreUpdate } from "./types";
import { assertFixtureId, requireTxlineConfig } from "./validation";

function client() { return new TxlineClient(requireTxlineConfig()); }

export function normalizeScoreUpdate(payload: unknown): TxlineScoreUpdate | null {
  if (!payload || typeof payload !== "object") return null;
  const raw = payload as Record<string, unknown>;
  const fixtureId = Number(raw.fixtureId ?? raw.FixtureId);
  if (!Number.isFinite(fixtureId)) return null;
  const data = (raw.dataSoccer ?? raw.Data) as TxlineScoreUpdate["dataSoccer"] | undefined;
  const rawClock = (raw.clock ?? raw.Clock) as Record<string, unknown> | undefined;
  return {
    fixtureId,
    gameState: (raw.gameState ?? raw.GameState) as string | number | undefined,
    startTime: Number(raw.startTime ?? raw.StartTime) || undefined,
    participant1IsHome: (raw.participant1IsHome ?? raw.Participant1IsHome) as boolean | undefined,
    participant1Id: Number(raw.participant1Id ?? raw.Participant1Id) || undefined,
    participant2Id: Number(raw.participant2Id ?? raw.Participant2Id) || undefined,
    action: String(raw.action ?? raw.Action ?? ""),
    id: (raw.id ?? raw.Id) as number | string | undefined,
    ts: Number(raw.ts ?? raw.Ts) || undefined,
    seq: Number(raw.seq ?? raw.Seq) || undefined,
    confirmed: (raw.confirmed ?? raw.Confirmed) as boolean | undefined,
    statusId: Number(raw.statusId ?? raw.StatusId) || undefined,
    statusSoccerId: Number(raw.statusSoccerId ?? raw.StatusSoccerId) || undefined,
    clock: rawClock ? { running: Boolean(rawClock.running ?? rawClock.Running), seconds: Number(rawClock.seconds ?? rawClock.Seconds) || 0 } : undefined,
    scoreSoccer: (raw.scoreSoccer ?? raw.Score) as TxlineScoreUpdate["scoreSoccer"],
    dataSoccer: data,
    data: data as Record<string, unknown> | undefined,
  };
}

function scoreArray(payload: unknown): TxlineScoreUpdate[] {
  if (Array.isArray(payload)) return payload.map(normalizeScoreUpdate).filter((update): update is TxlineScoreUpdate => Boolean(update));
  if (!payload || typeof payload !== "object") return [];
  const envelope = payload as { data?: unknown; scores?: unknown; updates?: unknown };
  const candidate = envelope.data ?? envelope.scores ?? envelope.updates;
  return Array.isArray(candidate) ? candidate.map(normalizeScoreUpdate).filter((update): update is TxlineScoreUpdate => Boolean(update)) : [];
}

export async function getScoreSnapshot(fixtureId: string) {
  return scoreArray(await client().get<unknown>(`scores/snapshot/${assertFixtureId(fixtureId)}`, { cache: "no-store" }));
}

export async function getHistoricalScores(fixtureId: string) {
  return scoreArray(await client().get<unknown>(`scores/historical/${assertFixtureId(fixtureId)}`, { cache: "no-store" }));
}
