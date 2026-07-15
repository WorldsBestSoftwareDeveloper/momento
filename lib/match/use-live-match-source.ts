"use client";

import { useEffect, useState } from "react";
import type { MatchExperienceDataset } from "./match-data-source";

export function useLiveMatchSource(dataset: MatchExperienceDataset) {
  const [match, setMatch] = useState(dataset.match);
  useEffect(() => { setMatch(dataset.match); }, [dataset.match]);
  useEffect(() => {
    if (dataset.sourceMode !== "live" || !dataset.liveTransport) return;
    const { snapshotUrl, streamUrl } = dataset.liveTransport;
    let active = true;
    let polling: ReturnType<typeof setInterval> | null = null;
    const refresh = async () => {
      try {
        const response = await fetch(snapshotUrl, { cache: "no-store" });
        if (response.ok && active) setMatch(await response.json());
      } catch { /* the existing verified snapshot remains visible */ }
    };
    const stream = new EventSource(streamUrl);
    stream.addEventListener("match", (event) => {
      try { if (active) setMatch(JSON.parse((event as MessageEvent).data)); } catch { /* ignore malformed proxy events */ }
    });
    stream.onerror = () => {
      if (!polling) polling = setInterval(refresh, 15_000);
    };
    stream.onopen = () => {
      if (polling) clearInterval(polling);
      polling = null;
    };
    return () => { active = false; stream.close(); if (polling) clearInterval(polling); };
  }, [dataset.liveTransport, dataset.sourceMode]);
  return match;
}

