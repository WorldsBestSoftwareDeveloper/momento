import { NextRequest, NextResponse } from "next/server";
import { getFixture } from "@/lib/txline/fixtures";
import { mapTxlineMatch } from "@/lib/txline/mapper";
import { getHistoricalScores, getScoreSnapshot } from "@/lib/txline/scores";
import { assertFixtureId, getTxlineRuntimeConfig } from "@/lib/txline/validation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const config = getTxlineRuntimeConfig();
  if (!config.configured) return NextResponse.json({ error: "TXLINE_NOT_CONFIGURED", message: "Add TXLINE_GUEST_JWT and TXLINE_API_TOKEN to the server environment." }, { status: 503 });
  try {
    const fixtureId = assertFixtureId(request.nextUrl.searchParams.get("fixtureId") || config.fixtureId);
    const [fixture, updates] = await Promise.all([
      getFixture(fixtureId),
      getScoreSnapshot(fixtureId).catch(() => getHistoricalScores(fixtureId)),
    ]);
    if (!fixture) return NextResponse.json({ error: "NO_FIXTURE" }, { status: 404 });
    return NextResponse.json(mapTxlineMatch(fixture, updates, "live"), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: "TXLINE_UNAVAILABLE", message: error instanceof Error ? error.message : "Unknown TxLINE error" }, { status: 502 });
  }
}
