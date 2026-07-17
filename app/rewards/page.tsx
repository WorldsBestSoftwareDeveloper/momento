"use client";

import { AppShell } from "@/components/shell/app-shell";
import { RewardsDashboard } from "@/components/reward/rewards-dashboard";
import { createMatchCreatorReward } from "@/lib/reward/config";
import { useCanonicalMatchState } from "@/lib/match/canonical-match-state";

export default function RewardsPage() {
  const { match } = useCanonicalMatchState();
  const reward = createMatchCreatorReward(match);
  return <AppShell><div className="rewards-page page-frame"><RewardsDashboard reward={reward} /></div></AppShell>;
}
