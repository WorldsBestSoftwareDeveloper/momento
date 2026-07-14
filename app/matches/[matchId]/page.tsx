import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { LiveMatchExperience } from "@/components/match/live-match-experience";
import { getReplayConfig } from "@/lib/txline/replay-config";
import { getDemoMatch } from "@/lib/txline/replay-fixture";

export default async function MatchPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const config = getReplayConfig();
  if (matchId !== config.fixtureId) notFound();
  const match = getDemoMatch(config.fixtureId, config.mode, config.label);

  return (
    <AppShell>
      <LiveMatchExperience initialMatch={match} />
    </AppShell>
  );
}
