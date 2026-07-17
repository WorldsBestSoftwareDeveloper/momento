"use client";

import { useEffect, useMemo, useState } from "react";
import type { MatchRoomView, OfficialEventView } from "@/lib/txline/replay-fixture";

function captureDuration(event: OfficialEventView) {
  return event.kind === "goal" ? 45 : 30;
}

export function useLiveCaptureWindow(match: MatchRoomView, enabled: boolean) {
  const latestEligibleEvent = useMemo(
    () => enabled ? match.events.findLast((event) => event.confirmed && event.kind !== "phase") ?? null : null,
    [enabled, match.events],
  );
  const [event, setEvent] = useState<OfficialEventView | null>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setEvent(latestEligibleEvent);
    setSeconds(latestEligibleEvent ? captureDuration(latestEligibleEvent) : 0);
  }, [latestEligibleEvent]);

  useEffect(() => {
    if (!event || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((current) => Math.max(0, current - 1)), 1_000);
    return () => window.clearInterval(timer);
  }, [event, seconds]);

  return { event: seconds > 0 ? event : null, seconds };
}
