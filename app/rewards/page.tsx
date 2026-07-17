import { AppShell } from "@/components/shell/app-shell";
import { RewardsDashboard } from "@/components/reward/rewards-dashboard";
import { createMatchCreatorReward } from "@/lib/reward/config";
import { getReplayConfig } from "@/lib/txline/replay-config";
import { getDemoMatch } from "@/lib/txline/replay-fixture";

export default function RewardsPage() {
  const config = getReplayConfig();
  const reward = createMatchCreatorReward(getDemoMatch(config.fixtureId, config.mode, config.label));
  return <AppShell><div className="rewards-page page-frame"><RewardsDashboard reward={reward} /></div></AppShell>;
}
