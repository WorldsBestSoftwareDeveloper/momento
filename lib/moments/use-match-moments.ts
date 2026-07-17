"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mapStoredMoment } from "./moment-service";
import type { MomentView } from "@/lib/txline/replay-fixture";
export function useMatchMoments(matchId: string, seed: MomentView[]) {
  const [remote, setRemote] = useState<MomentView[]>([]);
  const refresh = useCallback(async () => { const client = getSupabaseBrowserClient(); if (!client) return; const { data, error } = await client.from("moments").select("*").eq("match_id", matchId).order("created_at", { ascending: false }); if (!error) setRemote((data ?? []).map(mapStoredMoment)); }, [matchId]);
  useEffect(() => { const client = getSupabaseBrowserClient(); if (!client) return; void refresh(); const channel = client.channel(`moments:${matchId}:${crypto.randomUUID()}`).on("postgres_changes", { event: "*", schema: "public", table: "moments", filter: `match_id=eq.${matchId}` }, () => void refresh()).subscribe(); return () => { void client.removeChannel(channel); }; }, [matchId, refresh]);
  return useMemo(() => {
    const seeded = new Map(seed.map((moment) => [moment.id, moment]));
    const unique = new Map<string, MomentView>();
    remote.filter((moment) => moment.id !== "moment-javi").forEach((moment) => {
      const original = seeded.get(moment.id);
      unique.set(moment.id, original ? { ...moment, videoPath: original.videoPath, posterPath: original.posterPath, durationSeconds: original.durationSeconds } : moment);
    });
    seed.forEach((moment) => { if (!unique.has(moment.id)) unique.set(moment.id, moment); });
    return [...unique.values()];
  }, [remote, seed]);
}
