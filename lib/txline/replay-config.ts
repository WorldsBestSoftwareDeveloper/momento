export type DataMode = "live" | "cached" | "replay";

export interface ReplayConfig {
  demoMode: boolean;
  matchId: string;
  mode: DataMode;
  label: string;
}

export const CANONICAL_MATCH_ID = "france-spain-demo";

export function getReplayConfig(): ReplayConfig {
  const demoMode = process.env.DEMO_MODE !== "false";

  return {
    demoMode,
    matchId: CANONICAL_MATCH_ID,
    mode: demoMode ? "replay" : "live",
    label: demoMode
      ? "Historical Replay • Official TxLINE Match Data"
      : "Live Match • Official TxLINE Feed",
  };
}
