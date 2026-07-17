import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function readEnv() {
  return Object.fromEntries(readFileSync(".env.local", "utf8").split(/\r?\n/).filter((line) => line.includes("=")).map((line) => {
    const index = line.indexOf("="); return [line.slice(0, index), line.slice(index + 1).replace(/^['"]|['"]$/g, "")];
  }));
}

async function main() {
  const env = readEnv();
  const publisher = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const viewer = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const [publisherAuth, viewerAuth] = await Promise.all([publisher.auth.signInAnonymously(), viewer.auth.signInAnonymously()]);
  if (publisherAuth.error || !publisherAuth.data.user) throw new Error(`Publisher auth failed: ${publisherAuth.error?.message}`);
  if (viewerAuth.error || !viewerAuth.data.user) throw new Error(`Viewer auth failed: ${viewerAuth.error?.message}`);
  const momentId = crypto.randomUUID();
  const matchId = "france-spain-demo";
  const storagePath = `${publisherAuth.data.user.id}/${momentId}.mp4`;
  const file = readFileSync("public/demo/upload-placeholder.mp4");
  const uploaded = await publisher.storage.from("moments").upload(storagePath, file, { contentType: "video/mp4", upsert: false });
  if (uploaded.error) throw new Error(`Storage upload failed: ${uploaded.error.message}`);
  const publicUrl = publisher.storage.from("moments").getPublicUrl(storagePath).data.publicUrl;
  let channel: ReturnType<typeof viewer.channel> | null = null;
  try {
    const observed = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Second-client Moment Realtime event timed out.")), 15_000);
      channel = viewer.channel(`media-validation-${momentId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "moments", filter: `match_id=eq.${matchId}` }, (payload) => {
        if (payload.new.id === momentId) { clearTimeout(timeout); resolve(); }
      }).subscribe(async (status) => {
        if (status !== "SUBSCRIBED") return;
        const inserted = await publisher.from("moments").insert({ id: momentId, match_id: matchId, owner_id: publisherAuth.data.user!.id, title: "Media pipeline validation", description: "Two-client test", creator_name: "Validation Fan", creator_handle: "@validation", creator_initials: "VF", video_path: publicUrl, storage_path: storagePath, official_event_id: "evt-goal-spain", official_event_label: "58′ Goal • Spain", duration_seconds: 4, poster_tone: "blue", champion_count: 0, comment_count: 0, txline_verified: true });
        if (inserted.error) { clearTimeout(timeout); reject(new Error(`Moment persistence failed: ${inserted.error.message}`)); }
      });
    });
    await observed;
    const [row, playback] = await Promise.all([viewer.from("moments").select("video_path,storage_path").eq("id", momentId).single(), fetch(publicUrl)]);
    if (row.error || row.data.video_path !== publicUrl) throw new Error(`Second-client row mismatch: ${row.error?.message ?? "wrong URL"}`);
    if (!playback.ok || !playback.headers.get("content-type")?.includes("video/mp4") || (await playback.arrayBuffer()).byteLength !== file.byteLength) throw new Error("Public MP4 playback validation failed.");
    console.log(JSON.stringify({ storageUpload: "passed", publicPlayback: "passed", persistedUrl: "passed", secondClientQuery: "passed", realtime: "passed", bytes: file.byteLength, publicUrl }));
  } finally {
    if (channel) await viewer.removeChannel(channel);
    await publisher.from("moments").delete().eq("id", momentId);
    await publisher.storage.from("moments").remove([storagePath]);
  }
}

void main().then(() => process.exit(0)).catch((error) => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
