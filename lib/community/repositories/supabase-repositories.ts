import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { ChampionRepository, CommentRepository, CommunityComment, CommunityMomentRecord, CommunityUser, MomentRepository } from "../types";

function mapComment(row: Record<string, unknown>): CommunityComment {
  return {
    id: String(row.id), momentId: String(row.moment_id), authorId: String(row.author_id),
    authorName: String(row.author_name), authorHandle: String(row.author_handle),
    authorInitials: String(row.author_initials), body: String(row.body), createdAt: String(row.created_at),
  };
}

function unsubscribe(client: SupabaseClient, channel: RealtimeChannel) {
  return () => { void client.removeChannel(channel); };
}

export class SupabaseMomentRepository implements MomentRepository {
  constructor(private readonly client: SupabaseClient) {}
  async ensure({ moment, ownerId }: CommunityMomentRecord) {
    const { error } = await this.client.from("moments").upsert({
      id: moment.id, owner_id: ownerId ?? null, title: moment.title, description: moment.description ?? moment.caption,
      creator_name: moment.creator, creator_handle: moment.handle, creator_initials: moment.initials,
      video_path: moment.videoPath, official_event_id: moment.eventId, official_event_label: moment.eventLabel,
      champion_count: moment.championCount, comment_count: moment.commentCount ?? 0,
    }, { onConflict: "id", ignoreDuplicates: true });
    if (error) throw error;
  }
}

export class SupabaseCommentRepository implements CommentRepository {
  constructor(private readonly client: SupabaseClient) {}
  async list(momentId: string) {
    const { data, error } = await this.client.from("comments").select("*").eq("moment_id", momentId).order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapComment);
  }
  async create(momentId: string, body: string, user: CommunityUser) {
    const { data, error } = await this.client.from("comments").insert({ moment_id: momentId, author_id: user.id, author_name: user.name, author_handle: user.handle, author_initials: user.initials, body }).select().single();
    if (error) throw error;
    return mapComment(data);
  }
  subscribe(momentId: string, listener: () => void) {
    const channel = this.client.channel(`comments:${momentId}:${crypto.randomUUID()}`).on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `moment_id=eq.${momentId}` }, listener).subscribe();
    return unsubscribe(this.client, channel);
  }
}

export class SupabaseChampionRepository implements ChampionRepository {
  constructor(private readonly client: SupabaseClient) {}
  private async count(momentId: string) {
    const { count, error } = await this.client.from("champions").select("id", { count: "exact", head: true }).eq("moment_id", momentId);
    if (error) throw error;
    const { data } = await this.client.from("moments").select("champion_count").eq("id", momentId).single();
    return Number(data?.champion_count ?? 0) + (count ?? 0);
  }
  async getState(momentId: string, userId: string) {
    const [{ data, error }, count] = await Promise.all([
      this.client.from("champions").select("id").eq("moment_id", momentId).eq("user_id", userId).maybeSingle(),
      this.count(momentId),
    ]);
    if (error) throw error;
    return { championed: Boolean(data), count };
  }
  async setChampion(momentId: string, userId: string, championed: boolean) {
    const query = championed
      ? this.client.from("champions").upsert({ moment_id: momentId, user_id: userId }, { onConflict: "moment_id,user_id", ignoreDuplicates: true })
      : this.client.from("champions").delete().eq("moment_id", momentId).eq("user_id", userId);
    const { error } = await query;
    if (error) throw error;
    return { championed, count: await this.count(momentId) };
  }
  subscribe(momentId: string, listener: () => void) {
    const channel = this.client.channel(`champions:${momentId}:${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "champions", filter: `moment_id=eq.${momentId}` }, listener)
      .subscribe((status) => {
        if (status === "SUBSCRIBED") listener();
      });
    return unsubscribe(this.client, channel);
  }
}
