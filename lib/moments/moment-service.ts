import type { MomentView, OfficialEventView } from "@/lib/txline/replay-fixture";
import type { UploadedMedia } from "@/lib/upload/upload-service";

export interface CreateMomentInput {
  matchId: string;
  title: string;
  description?: string;
  durationSeconds: number;
  event: OfficialEventView;
  media: UploadedMedia;
}

export interface MomentService {
  create(input: CreateMomentInput): Promise<MomentView>;
}

export function validateMomentText(title: string, description: string): Record<string, string> {
  const errors: Record<string, string> = {};
  const cleanTitle = title.trim();
  if (cleanTitle.length < 3) errors.title = "Add a title with at least 3 characters.";
  if (cleanTitle.length > 60) errors.title = "Keep the title to 60 characters or fewer.";
  if (description.trim().length > 220) errors.description = "Keep the description to 220 characters or fewer.";
  return errors;
}

export const localMomentService: MomentService = {
  async create({ title, description, durationSeconds, event, media }) {
    await new Promise((resolve) => window.setTimeout(resolve, 280));
    const cleanDescription = description?.trim() ?? "";
    return {
      id: crypto.randomUUID(),
      creator: "You",
      handle: "@momento_fan",
      title: title.trim(),
      caption: cleanDescription,
      description: cleanDescription,
      eventId: event.id,
      eventLabel: `${event.minute} ${event.title} • ${event.team}`,
      durationSeconds: Math.max(1, Math.round(durationSeconds)),
      championCount: 0,
      videoPath: media.playbackUrl,
      posterTone: event.team.toLowerCase().includes("spain") ? "red" : "blue",
      initials: "YOU",
      rank: 1,
      createdAtLabel: "Just now",
      commentCount: 0,
      txlineVerified: true,
    };
  },
};

export async function createSupabaseMomentService(): Promise<MomentService> {
  const { getSupabaseBrowserClient } = await import("@/lib/supabase/client");
  const client = getSupabaseBrowserClient();
  if (!client) return localMomentService;
  return {
    async create(input) {
      let { data } = await client.auth.getSession();
      if (!data.session) {
        const auth = await client.auth.signInAnonymously();
        if (auth.error || !auth.data.session) throw auth.error ?? new Error("Anonymous publishing session unavailable.");
        data = { session: auth.data.session };
      }
      const id = crypto.randomUUID();
      const cleanDescription = input.description?.trim() ?? "";
      const row = {
        id, match_id: input.matchId, owner_id: data.session.user.id, title: input.title.trim(), description: cleanDescription,
        creator_name: "You", creator_handle: `@fan_${data.session.user.id.slice(0, 5)}`, creator_initials: "YOU",
        video_path: input.media.playbackUrl, storage_path: input.media.path, official_event_id: input.event.id,
        official_event_label: `${input.event.minute} ${input.event.title} • ${input.event.team}`,
        duration_seconds: Math.max(1, Math.round(input.durationSeconds)), poster_tone: input.event.team.toLowerCase().includes("spain") ? "red" : "blue",
        champion_count: 0, comment_count: 0, txline_verified: true,
      };
      const { data: saved, error } = await client.from("moments").insert(row).select().single();
      if (error) throw error;
      return mapStoredMoment(saved);
    },
  };
}

export function mapStoredMoment(row: Record<string, unknown>): MomentView {
  return {
    id: String(row.id), creator: String(row.creator_name), handle: String(row.creator_handle), title: String(row.title),
    caption: String(row.description ?? ""), description: String(row.description ?? ""), eventId: String(row.official_event_id),
    eventLabel: String(row.official_event_label), durationSeconds: Number(row.duration_seconds ?? 15), championCount: Number(row.champion_count ?? 0),
    videoPath: String(row.video_path), posterTone: (row.poster_tone === "red" || row.poster_tone === "violet" ? row.poster_tone : "blue"),
    initials: String(row.creator_initials), rank: Number(row.rank ?? 1), createdAtLabel: "Just now", commentCount: Number(row.comment_count ?? 0), txlineVerified: Boolean(row.txline_verified),
  };
}
