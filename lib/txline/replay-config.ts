export type DataMode = "live" | "cached" | "replay";

export interface ReplayConfig {
  demoMode: boolean;
  fixtureId: string;
  mode: DataMode;
  label: string;
}

export function getReplayConfig(): ReplayConfig {
  const demoMode = process.env.DEMO_MODE !== "false";
  const fixtureId = process.env.DEMO_FIXTURE_ID?.trim() || "france-spain-demo";

  return {
    demoMode,
    fixtureId,
    mode: demoMode ? "replay" : "live",
    label: demoMode
      ? "Demo Replay • Recorded TxLINE Data"
      : "Live • Official TxLINE Data",
  };
}
