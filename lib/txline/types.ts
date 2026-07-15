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

export interface TxlineFixture {
  Ts?: number;
  StartTime: number;
  Competition: string;
  CompetitionId: number;
  FixtureGroupId: number;
  Participant1Id: number;
  Participant1: string;
  Participant2Id: number;
  Participant2: string;
  FixtureId: number;
  Participant1IsHome: boolean;
  GameState?: number;
  gameState?: number;
}

export interface TxlineSoccerPeriod {
  Goals?: number;
  YellowCards?: number;
  RedCards?: number;
  Corners?: number;
}

export interface TxlineScoreUpdate {
  fixtureId: number;
  gameState?: string | number;
  startTime?: number;
  participant1IsHome?: boolean;
  participant1Id?: number;
  participant2Id?: number;
  action?: string;
  id?: number | string;
  ts?: number;
  seq?: number;
  confirmed?: boolean;
  statusId?: number;
  statusSoccerId?: number;
  clock?: { running?: boolean; seconds?: number };
  scoreSoccer?: {
    Participant1?: { Total?: TxlineSoccerPeriod };
    Participant2?: { Total?: TxlineSoccerPeriod };
  };
  dataSoccer?: {
    Action?: string;
    Color?: string;
    Minutes?: number;
    Participant?: number;
    PlayerId?: number;
    PlayerInId?: number;
    PlayerOutId?: number;
    Type?: string;
    Outcome?: string;
    Goal?: boolean;
    YellowCard?: boolean;
    RedCard?: boolean;
    VAR?: boolean;
    StatusId?: number;
    New?: { Minutes?: number };
  };
  data?: Record<string, unknown>;
}

export class TxlineApiError extends Error {
  constructor(message: string, readonly status: number, readonly code: "UNAUTHORIZED" | "FORBIDDEN" | "NETWORK" | "UPSTREAM") { super(message); }
}
