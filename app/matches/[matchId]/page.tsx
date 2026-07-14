import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { MatchExperience } from "@/components/match/live-match-experience";
import { getMatchExperienceDataset } from "@/lib/match/match-data-source";

export default async function MatchPage({ params, searchParams }: { params: Promise<{ matchId: string }>; searchParams: Promise<{ mode?: string }> }) {
  const { matchId } = await params;
  const { mode } = await searchParams;
  let dataset;
  try { dataset = getMatchExperienceDataset(matchId, mode); }
  catch { notFound(); }

  return (
    <AppShell>
      <MatchExperience dataset={dataset} />
    </AppShell>
  );
}
