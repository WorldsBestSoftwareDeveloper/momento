import type { MatchRoomView, OfficialEventView } from "@/lib/txline/replay-fixture";

export interface ReplayConversationMessage {
  id: string;
  author: string;
  body: string;
}

export interface ReplayBeat {
  id: string;
  label: string;
  minute: string;
  statusLabel: string;
  score: [number, number];
  visibleEventIds: string[];
  activeEventId: string | null;
  captureEventId: string | null;
  captureSeconds: number;
  championDeltas: [number, number, number, number, number];
  conversation: ReplayConversationMessage[];
  isFinal?: boolean;
}

export interface ReplayViewState {
  cursor: number;
  running: boolean;
  completed: boolean;
  beat: ReplayBeat | null;
  match: MatchRoomView;
  visibleEvents: OfficialEventView[];
  captureEvent: OfficialEventView | null;
}
