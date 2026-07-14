"use client";

import { useCallback, useEffect, useState } from "react";
import type { MomentView } from "@/lib/txline/replay-fixture";
import { activityService, championService, commentService, type CommunityComment } from "./services";
import type { CommunitySnapshot } from "./types";

export function useMomentCommunity(moment: MomentView) {
  const [snapshot, setSnapshot] = useState<CommunitySnapshot>({
    momentId: moment.id, championCount: moment.championCount, commentCount: moment.commentCount ?? 0,
    watchingCount: 36 + moment.rank * 7, championed: false, lastComment: null,
  });
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [nextSnapshot, nextComments] = await Promise.all([activityService.getSnapshot(moment), commentService.list(moment)]);
      setSnapshot(nextSnapshot);
      setComments(nextComments);
      setError(null);
    } catch { setError("Community is reconnecting. Your demo data is still available."); }
  }, [moment]);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    void refresh();
    void activityService.subscribe(moment, () => { if (active) void refresh(); }).then((next) => {
      if (active) unsubscribe = next; else next();
    });
    return () => { active = false; unsubscribe(); };
  }, [moment, refresh]);

  const toggleChampion = async () => {
    if (busy) return;
    const previous = snapshot;
    const desired = !snapshot.championed;
    setBusy(true);
    setSnapshot((current) => ({ ...current, championed: desired, championCount: Math.max(0, current.championCount + (desired ? 1 : -1)) }));
    try {
      const result = await championService.setChampion(moment, desired);
      setSnapshot((current) => ({ ...current, championed: result.championed, championCount: result.count }));
    } catch {
      setSnapshot(previous);
      setError("Could not update your Champion. Try again.");
    } finally { setBusy(false); }
  };

  const addComment = async (body: string) => {
    setBusy(true);
    try { await commentService.create(moment, body); await refresh(); }
    finally { setBusy(false); }
  };

  return { snapshot, comments, busy, error, toggleChampion, addComment };
}

