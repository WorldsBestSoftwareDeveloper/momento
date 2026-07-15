import { TxlineClient } from "./client";
import type { TxlineFixture } from "./types";
import { requireTxlineConfig } from "./validation";

let fixtureCache: { expiresAt: number; value: TxlineFixture[] } | null = null;

function fixtureArray(payload: unknown): TxlineFixture[] {
  if (Array.isArray(payload)) return payload as TxlineFixture[];
  if (!payload || typeof payload !== "object") return [];
  const candidate = (payload as { data?: unknown; fixtures?: unknown }).data ?? (payload as { fixtures?: unknown }).fixtures;
  return Array.isArray(candidate) ? candidate as TxlineFixture[] : [];
}

export async function getFixtures(force = false) {
  if (!force && fixtureCache && fixtureCache.expiresAt > Date.now()) return fixtureCache.value;
  const config = requireTxlineConfig();
  const client = new TxlineClient(config);
  const startEpochDay = Math.floor(Date.now() / 86_400_000) - 14;
  const fixtures = fixtureArray(await client.get<unknown>(`fixtures/snapshot?startEpochDay=${startEpochDay}`, { next: { revalidate: 300 } }));
  fixtureCache = { value: fixtures, expiresAt: Date.now() + 5 * 60_000 };
  return fixtures;
}

export async function getFixture(fixtureId: string) {
  const fixtures = await getFixtures();
  return fixtures.find((fixture) => String(fixture.FixtureId) === fixtureId) ?? null;
}
