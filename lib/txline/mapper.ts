import type { ReplayBeat } from "@/lib/replay/types";
import { getDemoMatch, type EventKind, type MatchRoomView, type OfficialEventView } from "./replay-fixture";
import type { TxlineFixture, TxlineScoreUpdate } from "./types";

const FINAL_ACTIONS = new Set(["game_finalised", "game_finalized", "final", "full_time"]);

function actionName(update: TxlineScoreUpdate) {
  return String(update.action ?? update.dataSoccer?.Action ?? "").trim().toLowerCase();
}

function eventKind(update: TxlineScoreUpdate): EventKind | null {
  const action = actionName(update);
  const data = update.dataSoccer;
  if (action === "penalty_outcome" && String(data?.Outcome).toLowerCase() === "scored") return "goal";
  if (data?.Goal || action.includes("goal")) return "goal";
  if (data?.RedCard || action.includes("red_card") || (action.includes("card") && data?.Color?.toLowerCase() === "red")) return "red-card";
  if (data?.YellowCard || action.includes("yellow_card") || (action.includes("card") && data?.Color?.toLowerCase() === "yellow")) return "yellow-card";
  if (data?.VAR || action.startsWith("var")) return "var";
  if (action.includes("substitution")) return "substitution";
  if (action.includes("kickoff") || action.includes("game_started") || FINAL_ACTIONS.has(action)) return "phase";
  return null;
}

function minuteNumber(update: TxlineScoreUpdate) {
  const explicit = update.dataSoccer?.Minutes ?? update.dataSoccer?.New?.Minutes;
  if (typeof explicit === "number" && Number.isFinite(explicit)) return Math.max(0, Math.round(explicit));
  const seconds = update.clock?.seconds;
  if (typeof seconds === "number") return Math.max(0, Math.floor(seconds / 60));
  if (update.ts && update.startTime) {
    const timestamp = update.ts > 10_000_000_000 ? update.ts / 1000 : update.ts;
    const start = update.startTime > 10_000_000_000 ? update.startTime / 1000 : update.startTime;
    const elapsed = Math.floor((timestamp - start) / 60);
    if (elapsed >= 0 && elapsed <= 180) return elapsed;
  }
  return 0;
}

function score(update: TxlineScoreUpdate): [number, number] {
  return [
    Number(update.scoreSoccer?.Participant1?.Total?.Goals ?? 0),
    Number(update.scoreSoccer?.Participant2?.Total?.Goals ?? 0),
  ];
}

function isFinal(update: TxlineScoreUpdate) {
  return FINAL_ACTIONS.has(actionName(update)) || update.statusId === 100 || update.dataSoccer?.StatusId === 100 || String(update.gameState).toUpperCase().startsWith("F");
}

function statusLabel(update: TxlineScoreUpdate) {
  if (isFinal(update)) return "Full time";
  const state = String(update.gameState ?? "").toUpperCase();
  const labels: Record<string, string> = { NS: "Not started", H1: "First half", HT: "Half time", H2: "Second half", ET1: "Extra time", HTET: "Extra-time break", ET2: "Extra time", PE: "Penalties", I: "Interrupted", P: "Postponed" };
  const statusLabels: Record<number, string> = { 1: "Not started", 2: "First half", 3: "Half time", 4: "Second half", 5: "Full time", 7: "Extra time", 8: "Extra-time break", 9: "Extra time", 12: "Penalties" };
  return labels[state] ?? statusLabels[update.statusId ?? update.dataSoccer?.StatusId ?? 0] ?? "Live";
}

function eventTitle(kind: EventKind, update: TxlineScoreUpdate) {
  if (kind === "yellow-card") return "Yellow card";
  if (kind === "red-card") return "Red card";
  if (kind === "var") return actionName(update).includes("end") ? "VAR decision" : "VAR check";
  if (kind === "substitution") return "Substitution";
  if (kind === "goal") return "Goal";
  return isFinal(update) ? "Full time" : "Kickoff";
}

function teamFor(update: TxlineScoreUpdate, fixture: TxlineFixture) {
  const participant = update.dataSoccer?.Participant;
  if (participant === fixture.Participant1Id || participant === 1) return fixture.Participant1;
  if (participant === fixture.Participant2Id || participant === 2) return fixture.Participant2;
  if (eventKind(update) === "goal") {
    const currentScore = score(update);
    if (currentScore[0] > currentScore[1]) return fixture.Participant1;
    if (currentScore[1] > currentScore[0]) return fixture.Participant2;
  }
  return isFinal(update) ? "Final whistle" : "Official match event";
}

export function mapTxlineEvent(update: TxlineScoreUpdate, fixture: TxlineFixture): OfficialEventView | null {
  const kind = eventKind(update);
  if (!kind) return null;
  const minute = isFinal(update) ? "FT" : `${minuteNumber(update)}′`;
  return {
    id: `tx-${update.id ?? update.seq ?? update.ts ?? `${actionName(update)}-${minute}`}`,
    minute,
    kind,
    title: eventTitle(kind, update),
    team: teamFor(update, fixture),
    confirmed: update.confirmed !== false,
  };
}

function fixtureTeams(fixture: TxlineFixture) {
  const teamCode = (name: string) => ({ France: "FRA", Spain: "ESP" })[name] ?? name.slice(0, 3).toUpperCase();
  const participant1 = { name: fixture.Participant1, shortName: fixture.Participant1, code: teamCode(fixture.Participant1), tone: "blue" as const };
  const participant2 = { name: fixture.Participant2, shortName: fixture.Participant2, code: teamCode(fixture.Participant2), tone: "red" as const };
  return fixture.Participant1IsHome ? [participant1, participant2] as const : [participant2, participant1] as const;
}

export function mapTxlineMatch(fixture: TxlineFixture, updates: TxlineScoreUpdate[], mode: "live" | "replay"): MatchRoomView {
  const ordered = [...updates].sort((a, b) => (a.seq ?? -1) - (b.seq ?? -1));
  const latest = ordered.at(-1);
  const rawScore = latest ? score(latest) : [0, 0] as [number, number];
  const [home, away] = fixtureTeams(fixture);
  const homeScore = fixture.Participant1IsHome ? rawScore[0] : rawScore[1];
  const awayScore = fixture.Participant1IsHome ? rawScore[1] : rawScore[0];
  const allEvents = ordered.map((update) => mapTxlineEvent(update, fixture)).filter((event): event is OfficialEventView => event !== null).filter((event) => event.confirmed);
  const events = mode === "live" && allEvents.length > 24 ? [allEvents[0], ...allEvents.slice(-23)] : allEvents;
  const seed = getDemoMatch("france-spain-demo", mode, mode === "replay" ? "Historical Replay • Official TxLINE Match Data" : "Live Match • Official TxLINE Feed");
  const final = latest ? isFinal(latest) : false;
  const goalEvents = events.filter((event) => event.kind === "goal");
  const moments = seed.moments.map((moment, index) => {
    const linked = goalEvents[Math.min(index, Math.max(0, goalEvents.length - 1))] ?? events.find((event) => event.kind !== "phase");
    return linked ? { ...moment, eventId: linked.id, eventLabel: `${linked.minute} ${linked.title} • ${linked.team}`, txlineVerified: true } : { ...moment, txlineVerified: false };
  });
  return {
    ...seed,
    id: String(fixture.FixtureId),
    providerFixtureId: String(fixture.FixtureId),
    competition: fixture.Competition,
    state: final ? "final" : "live",
    statusLabel: latest ? statusLabel(latest) : "Scheduled",
    minute: final ? "FT" : latest ? `${minuteNumber(latest)}′` : "—",
    mode,
    modeLabel: mode === "replay" ? "Historical Replay • Official TxLINE Match Data" : "Live Match • Official TxLINE Feed",
    txlineVerified: true,
    updatedAtLabel: latest?.ts ? `TxLINE update • ${new Date(latest.ts > 10_000_000_000 ? latest.ts : latest.ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "TxLINE fixture snapshot",
    home: { ...home, score: homeScore },
    away: { ...away, score: awayScore },
    events,
    moments,
  };
}

export function mapReplayBeats(match: MatchRoomView, updates: TxlineScoreUpdate[], fixture: TxlineFixture): ReplayBeat[] {
  const candidates = updates.map((update) => ({ update, event: mapTxlineEvent(update, fixture) })).filter((item): item is { update: TxlineScoreUpdate; event: OfficialEventView } => item.event !== null).filter((item) => item.event.confirmed);
  const final = candidates.findLast(({ update }) => isFinal(update));
  const kickoff = candidates.find(({ event, update }) => event.kind === "phase" && !isFinal(update));
  const goals = candidates.filter(({ event }) => event.kind === "goal");
  const preferred = [kickoff, goals[0], candidates.find(({ event }) => event.kind === "yellow-card"), candidates.find(({ event }) => event.kind === "var"), candidates.find(({ event }) => event.kind === "substitution"), goals.at(-1), final].filter((item): item is { update: TxlineScoreUpdate; event: OfficialEventView } => Boolean(item));
  const selectedIds = new Set(preferred.map(({ event }) => event.id));
  for (const candidate of candidates) {
    if (preferred.length >= 7) break;
    if (!selectedIds.has(candidate.event.id)) { preferred.push(candidate); selectedIds.add(candidate.event.id); }
  }
  const selected = preferred.sort((a, b) => (a.update.seq ?? -1) - (b.update.seq ?? -1)).slice(0, 7);
  const visible: string[] = [];
  return selected.map(({ update, event }, index) => {
    if (!visible.includes(event.id)) visible.push(event.id);
    const raw = score(update);
    const mappedScore: [number, number] = fixture.Participant1IsHome ? raw : [raw[1], raw[0]];
    const kickoffBeat = index === 0 && event.kind === "phase" && event.title === "Kickoff";
    return {
      id: `txline-beat-${update.seq ?? index}`,
      label: `${event.title}${event.team.startsWith("Official") ? "" : ` • ${event.team}`}`,
      minute: kickoffBeat ? "1′" : event.minute,
      statusLabel: kickoffBeat ? "First half" : statusLabel(update),
      score: kickoffBeat ? [0, 0] : mappedScore,
      visibleEventIds: [...visible],
      activeEventId: event.id,
      captureEventId: event.kind === "phase" || !event.confirmed ? null : event.id,
      captureSeconds: event.kind === "goal" ? 45 : event.kind === "phase" ? 0 : 30,
      championDeltas: [index * 38, index * 12, index * 8, index * 5, index * 3],
      conversation: [],
      isFinal: isFinal(update),
    };
  });
}
