import type { ReplayBeat } from "./types";

export const DEMO_REPLAY_INTERVAL_MS = 8000;

export const demoReplayBeats: ReplayBeat[] = [
  {
    id: "kickoff", label: "Kickoff", minute: "1′", statusLabel: "First half", score: [0, 0],
    visibleEventIds: ["evt-kickoff"], activeEventId: "evt-kickoff", captureEventId: null, captureSeconds: 0,
    championDeltas: [0, 0, 0, 0, 0],
    conversation: [{ id: "chat-1", author: "Amara", body: "Here we go. This atmosphere is unreal." }],
  },
  {
    id: "france-goal", label: "France goal", minute: "12′", statusLabel: "First half", score: [1, 0],
    visibleEventIds: ["evt-kickoff", "evt-goal-france"], activeEventId: "evt-goal-france", captureEventId: "evt-goal-france", captureSeconds: 45,
    championDeltas: [90, 12, 8, 4, 3],
    conversation: [{ id: "chat-2", author: "Nico", body: "What a finish. France struck first." }, { id: "chat-3", author: "Amara", body: "That reaction is going to be everywhere." }],
  },
  {
    id: "yellow-card", label: "Yellow card", minute: "33′", statusLabel: "First half", score: [1, 0],
    visibleEventIds: ["evt-kickoff", "evt-goal-france", "evt-card-spain"], activeEventId: "evt-card-spain", captureEventId: "evt-card-spain", captureSeconds: 30,
    championDeltas: [125, 28, 17, 11, 8],
    conversation: [{ id: "chat-4", author: "Sofia", body: "That challenge was always getting a card." }, { id: "chat-5", author: "Leo", body: "Spain need to settle down." }],
  },
  {
    id: "var-check", label: "VAR check", minute: "45+1′", statusLabel: "VAR review", score: [1, 0],
    visibleEventIds: ["evt-kickoff", "evt-goal-france", "evt-card-spain", "evt-var"], activeEventId: "evt-var", captureEventId: "evt-var", captureSeconds: 35,
    championDeltas: [155, 45, 28, 17, 13],
    conversation: [{ id: "chat-6", author: "Paula", body: "Nobody in the room is breathing." }, { id: "chat-7", author: "Theo", body: "That replay angle is so close." }],
  },
  {
    id: "substitution", label: "Substitution", minute: "52′", statusLabel: "Second half", score: [1, 0],
    visibleEventIds: ["evt-kickoff", "evt-goal-france", "evt-card-spain", "evt-var", "evt-sub-france"], activeEventId: "evt-sub-france", captureEventId: "evt-sub-france", captureSeconds: 25,
    championDeltas: [190, 64, 39, 26, 19],
    conversation: [{ id: "chat-8", author: "Nico", body: "Fresh legs for France. Big twenty minutes ahead." }, { id: "chat-9", author: "Amara", body: "This changes the shape completely." }],
  },
  {
    id: "spain-goal", label: "Spain goal", minute: "58′", statusLabel: "Second half", score: [1, 1],
    visibleEventIds: ["evt-kickoff", "evt-goal-france", "evt-card-spain", "evt-var", "evt-sub-france", "evt-goal-spain"], activeEventId: "evt-goal-spain", captureEventId: "evt-goal-spain", captureSeconds: 45,
    championDeltas: [310, 95, 58, 41, 29],
    conversation: [{ id: "chat-10", author: "Amara", body: "That finish changed everything." }, { id: "chat-11", author: "Nico", body: "The reaction at 58′ is the one." }],
  },
  {
    id: "final-whistle", label: "Final whistle", minute: "FT", statusLabel: "Full time", score: [1, 1],
    visibleEventIds: ["evt-kickoff", "evt-goal-france", "evt-card-spain", "evt-var", "evt-sub-france", "evt-goal-spain", "evt-red-france", "evt-final"], activeEventId: "evt-final", captureEventId: null, captureSeconds: 0,
    championDeltas: [520, 120, 77, 53, 38], isFinal: true,
    conversation: [{ id: "chat-12", author: "Sofia", body: "What a match. The community picked the right Moment." }, { id: "chat-13", author: "Leo", body: "We knew it was coming." }],
  },
];
