import type { CommunityComment, CommunityMomentRecord, CommunityUser, Unsubscribe } from "./types";

interface LocalMomentState {
  record: CommunityMomentRecord;
  comments: CommunityComment[];
  champions: Set<string>;
  championBase: number;
  commentBase: number;
}

const states = new Map<string, LocalMomentState>();
const listeners = new Map<string, Set<() => void>>();

const seedAuthors = [
  { authorId: "demo-ines", authorName: "Ines Costa", authorHandle: "@inesc", authorInitials: "IC" },
  { authorId: "demo-malik", authorName: "Malik Reed", authorHandle: "@malikr", authorInitials: "MR" },
];

function seedComments(momentId: string, baseCount: number): CommunityComment[] {
  const now = Date.now();
  return [
    { id: `${momentId}-seed-1`, momentId, ...seedAuthors[0], body: "That reaction says everything about the match.", createdAt: new Date(now - 82_000).toISOString() },
    { id: `${momentId}-seed-2`, momentId, ...seedAuthors[1], body: "The timing with the official event is perfect.", createdAt: new Date(now - 31_000).toISOString() },
  ].slice(0, Math.min(2, baseCount));
}

export function ensureLocalMoment(record: CommunityMomentRecord) {
  if (states.has(record.moment.id)) return;
  const commentBase = record.moment.commentCount ?? 0;
  states.set(record.moment.id, {
    record,
    comments: seedComments(record.moment.id, commentBase),
    champions: new Set(),
    championBase: record.moment.championCount,
    commentBase,
  });
}

export function getLocalState(momentId: string) {
  const state = states.get(momentId);
  if (!state) throw new Error("Moment community is not initialized.");
  return state;
}

export function emitLocal(momentId: string) {
  listeners.get(momentId)?.forEach((listener) => listener());
}

export function subscribeLocal(momentId: string, listener: () => void): Unsubscribe {
  const group = listeners.get(momentId) ?? new Set();
  group.add(listener);
  listeners.set(momentId, group);
  return () => {
    group.delete(listener);
    if (!group.size) listeners.delete(momentId);
  };
}

export function createLocalComment(momentId: string, body: string, user: CommunityUser) {
  const state = getLocalState(momentId);
  const comment: CommunityComment = {
    id: crypto.randomUUID(), momentId, authorId: user.id, authorName: user.name,
    authorHandle: user.handle, authorInitials: user.initials, body, createdAt: new Date().toISOString(),
  };
  state.comments.push(comment);
  emitLocal(momentId);
  return comment;
}
