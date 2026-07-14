import type { MomentView } from "@/lib/txline/replay-fixture";
import { getCommunityRepositories } from "./repository-factory";
import type { CommunityComment, CommunitySnapshot, Unsubscribe } from "./types";

async function initialize(moment: MomentView) {
  const repositories = await getCommunityRepositories();
  await repositories.moment.ensure({ moment, ownerId: repositories.user.id });
  return repositories;
}

export class CommentService {
  async list(moment: MomentView) { return (await initialize(moment)).comment.list(moment.id); }
  async create(moment: MomentView, body: string) {
    const clean = body.trim();
    if (!clean || clean.length > 500) throw new Error("Write a comment between 1 and 500 characters.");
    const repositories = await initialize(moment);
    return repositories.comment.create(moment.id, clean, repositories.user);
  }
  async subscribe(moment: MomentView, listener: () => void): Promise<Unsubscribe> { return (await initialize(moment)).comment.subscribe(moment.id, listener); }
}

export class ChampionService {
  async getState(moment: MomentView) { const repositories = await initialize(moment); return repositories.champion.getState(moment.id, repositories.user.id); }
  async setChampion(moment: MomentView, championed: boolean) { const repositories = await initialize(moment); return repositories.champion.setChampion(moment.id, repositories.user.id, championed); }
  async subscribe(moment: MomentView, listener: () => void): Promise<Unsubscribe> { return (await initialize(moment)).champion.subscribe(moment.id, listener); }
}

export class ActivityService {
  constructor(private comments = new CommentService(), private champions = new ChampionService()) {}
  async getSnapshot(moment: MomentView): Promise<CommunitySnapshot> {
    const [comments, champion] = await Promise.all([this.comments.list(moment), this.champions.getState(moment)]);
    return {
      momentId: moment.id, championCount: champion.count,
      commentCount: (moment.commentCount ?? 0) + comments.filter((comment) => !comment.id.includes("-seed-")).length,
      watchingCount: 36 + moment.rank * 7, championed: champion.championed,
      lastComment: comments.at(-1) ?? null,
    };
  }
  async subscribe(moment: MomentView, listener: () => void): Promise<Unsubscribe> {
    const unsubs = await Promise.all([this.comments.subscribe(moment, listener), this.champions.subscribe(moment, listener)]);
    return () => unsubs.forEach((unsubscribe) => unsubscribe());
  }
}

export const commentService = new CommentService();
export const championService = new ChampionService();
export const activityService = new ActivityService(commentService, championService);
export type { CommunityComment };
