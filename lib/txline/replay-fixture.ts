import type { DataMode } from "./replay-config";

export type EventKind = "goal" | "save" | "yellow-card" | "red-card" | "var" | "substitution" | "phase";

export interface MatchTeamView {
  name: string;
  shortName: string;
  code: string;
  score: number;
  tone: "blue" | "red";
}

export interface OfficialEventView {
  id: string;
  minute: string;
  kind: EventKind;
  title: string;
  team: string;
  confirmed: boolean;
  active?: boolean;
}

export interface MomentView {
  id: string;
  creator: string;
  handle: string;
  title: string;
  caption: string;
  eventId: string;
  eventLabel: string;
  durationSeconds: number;
  championCount: number;
  videoPath: string;
  posterPath?: string;
  posterTone: "blue" | "red" | "violet";
  initials: string;
  rank: number;
  isWinner?: boolean;
  description?: string;
  createdAtLabel?: string;
  commentCount?: number;
  txlineVerified?: boolean;
}

export interface MatchRoomView {
  id: string;
  providerFixtureId: string;
  competition: string;
  stadium: string;
  state: "live" | "final";
  statusLabel: string;
  minute: string;
  mode: DataMode;
  modeLabel: string;
  txlineVerified: boolean;
  updatedAtLabel: string;
  home: MatchTeamView;
  away: MatchTeamView;
  events: OfficialEventView[];
  moments: MomentView[];
  leadingShare: number;
  championActions: number;
}

export function getDemoMatch(
  fixtureId: string,
  mode: DataMode = "replay",
  modeLabel = "Demo Replay • Recorded TxLINE Data",
): MatchRoomView {
  return {
    id: fixtureId,
    providerFixtureId: "pending-txline-fixture-id",
    competition: "World Cup Demo",
    stadium: "Demo match room",
    state: "live",
    statusLabel: "Second half",
    minute: "68′",
    mode,
    modeLabel,
    txlineVerified: false,
    updatedAtLabel: "Original event time • demo sequence",
    home: { name: "France", shortName: "France", code: "FRA", score: 1, tone: "blue" },
    away: { name: "Spain", shortName: "Spain", code: "ESP", score: 1, tone: "red" },
    events: [
      { id: "evt-kickoff", minute: "1′", kind: "phase", title: "Kickoff", team: "First half", confirmed: true },
      { id: "evt-goal-france", minute: "12′", kind: "goal", title: "Goal", team: "France", confirmed: true },
      { id: "evt-card-spain", minute: "33′", kind: "yellow-card", title: "Yellow card", team: "Spain", confirmed: true },
      { id: "evt-var", minute: "45+1′", kind: "var", title: "VAR check", team: "Spain penalty", confirmed: true },
      { id: "evt-sub-france", minute: "52′", kind: "substitution", title: "Substitution", team: "France", confirmed: true },
      { id: "evt-goal-spain", minute: "58′", kind: "goal", title: "Goal", team: "Spain", confirmed: true },
      { id: "evt-red-france", minute: "88′", kind: "red-card", title: "Red card", team: "France", confirmed: true },
      { id: "evt-final", minute: "FT", kind: "phase", title: "Full time", team: "Final whistle", confirmed: true },
    ],
    moments: [
      {
        id: "moment-leo",
        creator: "Leo Martin",
        handle: "@leo_fra",
        title: "We knew it was coming.",
        caption: "That goal changed everything.",
        eventId: "evt-goal-spain",
        eventLabel: "58′ Goal • Spain",
        durationSeconds: 4,
        championCount: 1240,
        videoPath: "/demo/videos/reaction-01.mp4",
        posterPath: "/demo/posters/moment-leo.png",
        posterTone: "blue",
        initials: "LM",
        rank: 1,
        isWinner: true,
        createdAtLabel: "2m ago",
        commentCount: 84,
        txlineVerified: false,
      },
      {
        id: "moment-paula",
        creator: "Paula Ruiz",
        handle: "@paula_mad",
        title: "I could not look away",
        caption: "Every second felt enormous.",
        eventId: "evt-var",
        eventLabel: "45+1′ VAR check",
        durationSeconds: 4,
        championCount: 980,
        videoPath: "/demo/videos/reaction-02.mp4",
        posterPath: "/demo/posters/moment-paula.png",
        posterTone: "red",
        initials: "PR",
        rank: 2,
        createdAtLabel: "5m ago",
        commentCount: 61,
        txlineVerified: false,
      },
      {
        id: "moment-theo",
        creator: "Theo Bernard",
        handle: "@theo_93",
        title: "Pure football emotion",
        caption: "This is why we watch together.",
        eventId: "evt-goal-france",
        eventLabel: "12′ Goal • France",
        durationSeconds: 4,
        championCount: 760,
        videoPath: "/demo/videos/reaction-03.mp4",
        posterPath: "/demo/posters/moment-theo.png",
        posterTone: "violet",
        initials: "TB",
        rank: 3,
        createdAtLabel: "8m ago",
        commentCount: 43,
        txlineVerified: false,
      },
      {
        id: "moment-chloe",
        creator: "Chloe Moreau",
        handle: "@chloe_fra",
        title: "That silence before the roar",
        caption: "The whole room held its breath.",
        eventId: "evt-sub-france",
        eventLabel: "52′ Substitution • France",
        durationSeconds: 4,
        championCount: 640,
        videoPath: "/demo/videos/reaction-04.mp4",
        posterPath: "/demo/posters/moment-chloe.png",
        posterTone: "blue",
        initials: "CM",
        rank: 4,
        createdAtLabel: "11m ago",
        commentCount: 28,
        txlineVerified: false,
      },
    ],
    leadingShare: 42,
    championActions: 2980,
  };
}
