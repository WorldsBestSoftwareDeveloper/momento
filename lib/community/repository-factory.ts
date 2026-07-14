import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { LocalChampionRepository, LocalCommentRepository, LocalMomentRepository } from "./repositories/local-repositories";
import { SupabaseChampionRepository, SupabaseCommentRepository, SupabaseMomentRepository } from "./repositories/supabase-repositories";
import type { ChampionRepository, CommentRepository, CommunityUser, MomentRepository } from "./types";

interface CommunityRepositories {
  moment: MomentRepository;
  comment: CommentRepository;
  champion: ChampionRepository;
  user: CommunityUser;
  source: "local" | "supabase";
}

let repositories: Promise<CommunityRepositories> | null = null;

function localUser(): CommunityUser {
  let id = "demo-guest";
  if (typeof window !== "undefined") {
    id = window.localStorage.getItem("momento-community-user") ?? crypto.randomUUID();
    window.localStorage.setItem("momento-community-user", id);
  }
  return { id, name: "Guest Fan", handle: "@guestfan", initials: "GF" };
}

async function createRepositories(): Promise<CommunityRepositories> {
  const client = getSupabaseBrowserClient();
  if (client) {
    let { data } = await client.auth.getSession();
    if (!data.session) {
      const result = await client.auth.signInAnonymously();
      if (result.error) throw result.error;
      data = { session: result.data.session };
    }
    const id = data.session?.user.id;
    if (id) return {
      moment: new SupabaseMomentRepository(client), comment: new SupabaseCommentRepository(client), champion: new SupabaseChampionRepository(client),
      user: { id, name: "Guest Fan", handle: `@fan_${id.slice(0, 5)}`, initials: "GF" }, source: "supabase",
    };
  }
  return { moment: new LocalMomentRepository(), comment: new LocalCommentRepository(), champion: new LocalChampionRepository(), user: localUser(), source: "local" };
}

export function getCommunityRepositories() {
  repositories ??= createRepositories().catch(() => ({ moment: new LocalMomentRepository(), comment: new LocalCommentRepository(), champion: new LocalChampionRepository(), user: localUser(), source: "local" as const }));
  return repositories;
}

