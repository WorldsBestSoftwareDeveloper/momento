import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { calculateDistribution, getMatchMarket, getMomentMarket } from "../lib/opinion-market/model";
import { getDemoMatch } from "../lib/txline/replay-fixture";

async function main() {
  const match = getDemoMatch("france-spain-demo");
  const distribution = calculateDistribution(123.45);
  const sum = Number((distribution.creatorRewardSol + distribution.supporterRewardSol + distribution.reserveSol).toFixed(6));
  if (sum !== 123.45) throw new Error(`Distribution sum mismatch: ${sum}`);
  if (getMomentMarket(match.moments[0], true).state !== "settled") throw new Error("Moment settlement did not lock.");
  if (getMatchMarket({ ...match, state: "final" }).state !== "settled") throw new Error("Match settlement did not lock.");

  if (!existsSync(".env.local")) throw new Error(".env.local is missing.");
  const env = Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/).filter((line) => line.includes("=")).map((line) => {
    const index = line.indexOf("=");
    return [line.slice(0, index), line.slice(index + 1).replace(/^['"]|['"]$/g, "")];
  }));
  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const result = await client.from("opinion_contributions").select("id", { head: true, count: "exact" });
  if (result.error) throw new Error(`Supabase opinion_contributions unavailable: ${result.error.message}`);
  const signature = process.argv[2];
  let realtime = "not-requested";
  if (signature) {
    const auth = await client.auth.signInAnonymously();
    if (auth.error || !auth.data.user) throw new Error(`Anonymous auth unavailable: ${auth.error?.message ?? "No user"}`);
    const moment = match.moments[0];
    const seeded = await client.from("moments").upsert({ id: moment.id, owner_id: auth.data.user.id, title: moment.title, description: moment.caption, creator_name: moment.creator, creator_handle: moment.handle, creator_initials: moment.initials, video_path: moment.videoPath, official_event_id: moment.eventId, official_event_label: moment.eventLabel, champion_count: moment.championCount, comment_count: moment.commentCount ?? 0 }, { onConflict: "id", ignoreDuplicates: true });
    if (seeded.error) throw new Error(`Moment seed unavailable: ${seeded.error.message}`);
    const persisted = await client.from("opinion_contributions").select("amount_lamports,transaction_signature").eq("transaction_signature", signature).single();
    if (persisted.error || persisted.data.amount_lamports !== 20_000_000) throw new Error(`Persisted contribution mismatch: ${persisted.error?.message ?? "wrong amount"}`);
    const realtimeSignature = `replay-qa-${crypto.randomUUID()}`;
    const observed = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Supabase Realtime contribution event timed out.")), 12_000);
      client.channel(`opinion-validation-${crypto.randomUUID()}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "opinion_contributions", filter: `match_id=eq.${match.id}` }, () => { clearTimeout(timeout); resolve(); }).subscribe(async (status) => {
        if (status !== "SUBSCRIBED") return;
        const inserted = await client.from("opinion_contributions").insert({ match_id: match.id, moment_id: moment.id, user_id: auth.data.user!.id, amount_lamports: 20_000_000, transaction_signature: realtimeSignature, mode: "replay" });
        if (inserted.error) { clearTimeout(timeout); reject(new Error(`Contribution persistence failed: ${inserted.error.message}`)); }
      });
    });
    await observed;
    realtime = "passed";
  }
  console.log(JSON.stringify({ poolMath: "passed", settlement: "passed", supabaseTable: "passed", realtime, contributionRows: result.count }));
  await client.removeAllChannels();
}

void main().then(() => process.exit(0)).catch((error) => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
