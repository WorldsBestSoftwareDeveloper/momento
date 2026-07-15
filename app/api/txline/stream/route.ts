import { NextRequest } from "next/server";
import { getFixture } from "@/lib/txline/fixtures";
import { mapTxlineMatch } from "@/lib/txline/mapper";
import { getScoreSnapshot } from "@/lib/txline/scores";
import { streamScoreUpdates } from "@/lib/txline/stream";
import type { TxlineScoreUpdate } from "@/lib/txline/types";
import { assertFixtureId, getTxlineRuntimeConfig } from "@/lib/txline/validation";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const config = getTxlineRuntimeConfig();
  if (!config.configured) return new Response("TxLINE is not configured", { status: 503 });
  const fixtureId = assertFixtureId(request.nextUrl.searchParams.get("fixtureId") || config.fixtureId);
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      const send = (event: string, value: unknown) => controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(value)}\n\n`));
      const abort = new AbortController();
      request.signal.addEventListener("abort", () => abort.abort(), { once: true });
      try {
        const [fixture, initial] = await Promise.all([getFixture(fixtureId), getScoreSnapshot(fixtureId)]);
        if (!fixture) throw new Error("NO_FIXTURE");
        const updates: TxlineScoreUpdate[] = [...initial];
        send("match", mapTxlineMatch(fixture, updates, "live"));
        controller.enqueue(encoder.encode("retry: 3000\n\n"));
        for await (const update of streamScoreUpdates(abort.signal)) {
          if (String(update.fixtureId) !== fixtureId) continue;
          updates.push(update);
          if (updates.length > 250) updates.splice(0, updates.length - 250);
          send("match", mapTxlineMatch(fixture, updates, "live"));
        }
      } catch (error) {
        send("txline-error", { message: error instanceof Error ? error.message : "Stream disconnected" });
      } finally { controller.close(); }
    },
  });
  return new Response(body, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
}

