import type { DataMode } from "./replay-config";

export type EventKind = "goal" | "save" | "card" | "var" | "phase";

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
  posterTone: "blue" | "red" | "violet";
  initials: string;
  rank: number;
  isWinner?: boolean;
}

export interface MatchRoomView {
  id: string;
  providerFixtureId: string;
  competition: string;
  stadium: string;
  state: "live" | "final";
  minute: string;
  mode: DataMode;
  modeLabel: string;
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
    minute: "68′",
    mode,
    modeLabel,
    updatedAtLabel: "Original event time • demo sequence",
    home: { name: "France", shortName: "France", code: "FRA", score: 1, tone: "blue" },
    away: { name: "Spain", shortName: "Spain", code: "ESP", score: 1, tone: "red" },
    events: [
      { id: "evt-goal-france", minute: "12′", kind: "goal", title: "Goal", team: "France", confirmed: true },
      { id: "evt-save-spain", minute: "27′", kind: "save", title: "Save", team: "Spain", confirmed: true },
      { id: "evt-card-spain", minute: "33′", kind: "card", title: "Yellow card", team: "Spain", confirmed: true },
      { id: "evt-var", minute: "45+1′", kind: "var", title: "VAR check", team: "Spain penalty", confirmed: true },
      { id: "evt-goal-spain", minute: "58′", kind: "goal", title: "Goal", team: "Spain", confirmed: true, active: true },
      { id: "evt-card-france", minute: "63′", kind: "card", title: "Yellow card", team: "France", confirmed: true },
      { id: "evt-live", minute: "68′", kind: "phase", title: "Live", team: "Second half", confirmed: true },
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
        durationSeconds: 15,
        championCount: 1240,
        videoPath: "/demo/reaction-france-01.mp4",
        posterTone: "blue",
        initials: "LM",
        rank: 1,
        isWinner: true,
      },
      {
        id: "moment-paula",
        creator: "Paula Ruiz",
        handle: "@paula_mad",
        title: "I could not look away",
        caption: "Every second felt enormous.",
        eventId: "evt-var",
        eventLabel: "45+1′ VAR check",
        durationSeconds: 12,
        championCount: 980,
        videoPath: "/demo/reaction-spain-01.mp4",
        posterTone: "red",
        initials: "PR",
        rank: 2,
      },
      {
        id: "moment-theo",
        creator: "Theo Bernard",
        handle: "@theo_93",
        title: "Pure football emotion",
        caption: "This is why we watch together.",
        eventId: "evt-goal-france",
        eventLabel: "12′ Goal • France",
        durationSeconds: 14,
        championCount: 760,
        videoPath: "/demo/reaction-neutral-01.mp4",
        posterTone: "violet",
        initials: "TB",
        rank: 3,
      },
      {
        id: "moment-chloe",
        creator: "Chloe Moreau",
        handle: "@chloe_fra",
        title: "That silence before the roar",
        caption: "The whole room held its breath.",
        eventId: "evt-save-spain",
        eventLabel: "27′ Save • Spain",
        durationSeconds: 11,
        championCount: 640,
        videoPath: "/demo/reaction-france-02.mp4",
        posterTone: "blue",
        initials: "CM",
        rank: 4,
      },
      {
        id: "moment-javi",
        creator: "Javi Ortega",
        handle: "@javi_esp",
        title: "This is our moment",
        caption: "One match, one shared memory.",
        eventId: "evt-goal-spain",
        eventLabel: "58′ Goal • Spain",
        durationSeconds: 15,
        championCount: 510,
        videoPath: "/demo/reaction-spain-02.mp4",
        posterTone: "red",
        initials: "JO",
        rank: 5,
      },
    ],
    leadingShare: 42,
    championActions: 2980,
  };
}
