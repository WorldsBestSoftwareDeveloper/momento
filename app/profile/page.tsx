"use client";

import { AppShell } from "@/components/shell/app-shell";
import { CreatorProfile } from "@/components/profile/creator-profile";
import { createMatchCreatorReward } from "@/lib/reward/config";
import { useCanonicalMatchState } from "@/lib/match/canonical-match-state";

export default function ProfilePage() {
  const { match } = useCanonicalMatchState();
  const reward = createMatchCreatorReward(match);
  return <AppShell><div className="profile-page page-frame"><CreatorProfile reward={reward} /></div></AppShell>;
}
