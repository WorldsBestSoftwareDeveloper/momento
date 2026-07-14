import { createLocalComment, emitLocal, ensureLocalMoment, getLocalState, subscribeLocal } from "../local-store";
import type { ChampionRepository, CommentRepository, CommunityMomentRecord, CommunityUser, MomentRepository } from "../types";

export class LocalMomentRepository implements MomentRepository {
  async ensure(record: CommunityMomentRecord) { ensureLocalMoment(record); }
}

export class LocalCommentRepository implements CommentRepository {
  async list(momentId: string) { return [...getLocalState(momentId).comments]; }
  async create(momentId: string, body: string, user: CommunityUser) { return createLocalComment(momentId, body, user); }
  subscribe(momentId: string, listener: () => void) { return subscribeLocal(momentId, listener); }
}

export class LocalChampionRepository implements ChampionRepository {
  async getState(momentId: string, userId: string) {
    const state = getLocalState(momentId);
    return { championed: state.champions.has(userId), count: state.championBase + state.champions.size };
  }
  async setChampion(momentId: string, userId: string, championed: boolean) {
    const state = getLocalState(momentId);
    if (championed) state.champions.add(userId); else state.champions.delete(userId);
    emitLocal(momentId);
    return { championed: state.champions.has(userId), count: state.championBase + state.champions.size };
  }
  subscribe(momentId: string, listener: () => void) { return subscribeLocal(momentId, listener); }
}

