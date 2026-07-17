"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface OpinionContribution { id: string; matchId: string; momentId: string; amountSol: number; signature: string; mode: "live" | "replay"; createdAt: string }
const KEY = "momento-opinion-contributions-v1";
const EVENT = "momento:opinion-contribution";

function localList(): OpinionContribution[] { try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as OpinionContribution[]; } catch { return []; } }
function localSave(item: OpinionContribution) { const rows = localList(); if (!rows.some((row) => row.signature === item.signature)) localStorage.setItem(KEY, JSON.stringify([item, ...rows])); window.dispatchEvent(new Event(EVENT)); }

export async function recordContribution(input: Omit<OpinionContribution, "id" | "createdAt">) {
  const item: OpinionContribution = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  const client = getSupabaseBrowserClient();
  if (client) {
    let { data: session } = await client.auth.getSession();
    if (!session.session) {
      const auth = await client.auth.signInAnonymously();
      if (auth.error || !auth.data.session) {
        if (input.mode === "live") throw auth.error ?? new Error("Momento could not start a secure contribution session.");
      } else session = { session: auth.data.session };
    }
    const userId = session.session?.user.id;
    const { error } = await client.from("opinion_contributions").insert({ id: item.id, match_id: item.matchId, moment_id: item.momentId, user_id: userId, amount_lamports: Math.round(item.amountSol * 1_000_000_000), transaction_signature: item.signature, mode: item.mode });
    if (!error) { window.dispatchEvent(new Event(EVENT)); return item; }
    if (input.mode === "live") throw new Error(`The Devnet transfer was confirmed, but Momento could not sync it: ${error.message}`);
  }
  localSave(item); return item;
}

export function useOpinionContributions(matchId: string, momentId?: string) {
  const [rows, setRows] = useState<OpinionContribution[]>([]);
  const refresh = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (client) {
      let query = client.from("opinion_contributions").select("*").eq("match_id", matchId);
      if (momentId) query = query.eq("moment_id", momentId);
      const { data, error } = await query;
      if (!error) {
        const remote = (data ?? []).map((row) => ({ id: row.id, matchId: row.match_id, momentId: row.moment_id, amountSol: Number(row.amount_lamports) / 1_000_000_000, signature: row.transaction_signature, mode: row.mode, createdAt: row.created_at }));
        const local = localList().filter((row) => row.matchId === matchId && (!momentId || row.momentId === momentId));
        setRows([...remote, ...local.filter((item) => !remote.some((row) => row.signature === item.signature))]); return;
      }
    }
    setRows(localList().filter((row) => row.matchId === matchId && (!momentId || row.momentId === momentId)));
  }, [matchId, momentId]);
  useEffect(() => { void refresh(); const client = getSupabaseBrowserClient(); const handler = () => void refresh(); window.addEventListener(EVENT, handler); window.addEventListener("storage", handler); const channel = client?.channel(`opinion:${matchId}:${momentId ?? "all"}:${crypto.randomUUID()}`).on("postgres_changes", { event: "*", schema: "public", table: "opinion_contributions", filter: `match_id=eq.${matchId}` }, handler).subscribe(); return () => { window.removeEventListener(EVENT, handler); window.removeEventListener("storage", handler); if (client && channel) void client.removeChannel(channel); }; }, [matchId, momentId, refresh]);
  return { rows, contributionSol: Number(rows.reduce((sum, row) => sum + row.amountSol, 0).toFixed(6)), refresh };
}
