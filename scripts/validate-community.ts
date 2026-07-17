import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function env() {
  return Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/).filter((line) => line.includes("=")).map((line) => {
    const index = line.indexOf("="); return [line.slice(0, index), line.slice(index + 1).replace(/^['"]|['"]$/g, "")];
  }));
}

async function main() {
  const config = env();
  const publisher = createClient(config.NEXT_PUBLIC_SUPABASE_URL, config.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const viewer = createClient(config.NEXT_PUBLIC_SUPABASE_URL, config.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const [owner, observer] = await Promise.all([publisher.auth.signInAnonymously(), viewer.auth.signInAnonymously()]);
  if (owner.error || !owner.data.user) throw owner.error ?? new Error("Publisher anonymous auth failed.");
  if (observer.error || !observer.data.user) throw observer.error ?? new Error("Viewer anonymous auth failed.");
  const momentId = `qa-community-${crypto.randomUUID()}`;
  const seeded = await publisher.from("moments").insert({ id: momentId, match_id: "france-spain-demo", owner_id: owner.data.user.id, title: "Community QA Moment", description: "Release validation", creator_name: "QA Fan", creator_handle: "@qa", creator_initials: "QA", video_path: "/demo/videos/reaction-01.mp4", official_event_id: "qa-goal", official_event_label: "58′ Goal • Spain", duration_seconds: 4, poster_tone: "blue", champion_count: 0, comment_count: 0, txline_verified: true });
  if (seeded.error) throw new Error(`Community seed failed: ${seeded.error.message}`);
  const events = new Set<string>();
  const channel = viewer.channel(`community-qa-${crypto.randomUUID()}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments", filter: `moment_id=eq.${momentId}` }, () => events.add("comment"))
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "champions", filter: `moment_id=eq.${momentId}` }, () => events.add("champion"));
  try {
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Community Realtime subscription timed out.")), 15_000);
      channel.subscribe(async (status) => {
        if (status !== "SUBSCRIBED") return;
        clearTimeout(timeout); resolve();
      });
    });
    const [comment, champion] = await Promise.all([
      publisher.from("comments").insert({ moment_id: momentId, author_id: owner.data.user.id, author_name: "QA Fan", author_handle: "@qa", author_initials: "QA", body: "Realtime community validation" }),
      publisher.from("champions").insert({ moment_id: momentId, user_id: owner.data.user.id }),
    ]);
    if (comment.error) throw new Error(`Comment persistence failed: ${comment.error.message}`);
    if (champion.error) throw new Error(`Champion persistence failed: ${champion.error.message}`);
    const custom = await publisher.from("opinion_contributions").insert({ match_id: "france-spain-demo", moment_id: momentId, user_id: owner.data.user.id, amount_lamports: 30_000_000, transaction_signature: `replay-qa-custom-${crypto.randomUUID()}`, mode: "replay" });
    if (custom.error) throw new Error(`Custom contribution persistence failed: ${custom.error.message}. Apply migration 202607170003_custom_contributions.sql.`);
    const deadline = Date.now() + 15_000;
    while (events.size < 2 && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 200));
    if (!events.has("comment") || !events.has("champion")) throw new Error(`Community Realtime events missing: ${[...events].join(",") || "none"}`);
    const duplicate = await publisher.from("champions").insert({ moment_id: momentId, user_id: owner.data.user.id });
    if (!duplicate.error) throw new Error("Duplicate Champion was accepted.");
    const [comments, champions] = await Promise.all([
      viewer.from("comments").select("id", { count: "exact", head: true }).eq("moment_id", momentId),
      viewer.from("champions").select("id", { count: "exact", head: true }).eq("moment_id", momentId),
    ]);
    if (comments.count !== 1 || champions.count !== 1) throw new Error(`Community counts mismatch: ${comments.count}/${champions.count}`);
    console.log(JSON.stringify({ comments: "passed", champions: "passed", duplicatePrevention: "passed", customContribution: "passed", realtime: "passed", secondClient: "passed" }));
  } finally {
    await viewer.removeChannel(channel);
    await publisher.from("moments").delete().eq("id", momentId);
  }
}

void main().then(() => process.exit(0)).catch((error) => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
