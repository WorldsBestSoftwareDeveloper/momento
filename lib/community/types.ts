import type { MomentView } from "@/lib/txline/replay-fixture";

export interface CommunityUser {
  id: string;
  name: string;
  handle: string;
  initials: string;
}

export interface CommunityComment {
  id: string;
  momentId: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorInitials: string;
  body: string;
  createdAt: string;
}

export interface CommunitySnapshot {
  momentId: string;
  championCount: number;
  commentCount: number;
  watchingCount: number;
  championed: boolean;
  lastComment: CommunityComment | null;
}

export interface CommunityMomentRecord {
  moment: MomentView;
  ownerId?: string;
}

export type Unsubscribe = () => void;

export interface MomentRepository {
  ensure(record: CommunityMomentRecord): Promise<void>;
}

export interface CommentRepository {
  list(momentId: string): Promise<CommunityComment[]>;
  create(momentId: string, body: string, user: CommunityUser): Promise<CommunityComment>;
  subscribe(momentId: string, listener: () => void): Unsubscribe;
}

export interface ChampionRepository {
  getState(momentId: string, userId: string): Promise<{ championed: boolean; count: number }>;
  setChampion(momentId: string, userId: string, championed: boolean): Promise<{ championed: boolean; count: number }>;
  subscribe(momentId: string, listener: () => void): Unsubscribe;
}

