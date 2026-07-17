import { AppShell } from "@/components/shell/app-shell";
import { CreatorProfile } from "@/components/profile/creator-profile";
import { createMatchCreatorReward } from "@/lib/reward/config";
import { getReplayConfig } from "@/lib/txline/replay-config";
import { getDemoMatch } from "@/lib/txline/replay-fixture";

export default function ProfilePage() {
  const config = getReplayConfig();
  const reward = createMatchCreatorReward(getDemoMatch(config.fixtureId, config.mode, config.label));
  return <AppShell><div className="profile-page page-frame"><CreatorProfile reward={reward} /></div></AppShell>;
}
