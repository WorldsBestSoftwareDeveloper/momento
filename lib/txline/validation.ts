import { TXLINE_DEVNET, type TxlineCredentials } from "./types";

export interface TxlineRuntimeConfig extends TxlineCredentials {
  apiOrigin: string;
  fixtureId: string;
  configured: boolean;
}

export function getTxlineRuntimeConfig(): TxlineRuntimeConfig {
  const guestJwt = process.env.TXLINE_GUEST_JWT?.trim() ?? "";
  const apiToken = process.env.TXLINE_API_TOKEN?.trim() ?? "";
  return {
    guestJwt,
    apiToken,
    apiOrigin: (process.env.TXLINE_API_ORIGIN?.trim() || TXLINE_DEVNET.apiOrigin).replace(/\/$/, ""),
    fixtureId: process.env.TXLINE_FIXTURE_ID?.trim() || "18237038",
    configured: Boolean(guestJwt && apiToken),
  };
}

export function requireTxlineConfig() {
  const config = getTxlineRuntimeConfig();
  if (!config.configured) throw new Error("TXLINE_NOT_CONFIGURED");
  if (!/^\d+$/.test(config.fixtureId)) throw new Error("TXLINE_FIXTURE_ID must be numeric.");
  return config;
}

export function assertFixtureId(value: string) {
  if (!/^\d{1,20}$/.test(value)) throw new Error("INVALID_FIXTURE_ID");
  return value;
}

