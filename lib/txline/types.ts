export const TXLINE_DEVNET = {
  rpcUrl: "https://api.devnet.solana.com",
  apiOrigin: "https://txline-dev.txodds.com",
  programId: "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J",
  tokenMint: "4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG",
} as const;

export const TXLINE_FREE_TIER = {
  serviceLevelId: 1,
  durationWeeks: 4,
  selectedLeagues: [] as number[],
} as const;

export interface GuestAuthResponse {
  token: string;
}

export interface ActivationRequest {
  txSig: string;
  walletSignature: string;
  leagues: number[];
}

export interface ActivationResponse {
  token: string;
}

export interface TxlineCredentials {
  guestJwt: string;
  apiToken: string;
}

export interface TxlineClientOptions extends TxlineCredentials {
  apiOrigin?: string;
  fetchImpl?: typeof fetch;
}

export interface TxlineRequestOptions extends RequestInit {
  retryGuestAuth?: boolean;
}

export interface TxlineActivationConfig {
  rpcUrl: string;
  apiOrigin: string;
  walletPath: string;
  subscriptionTxSig?: string;
}
