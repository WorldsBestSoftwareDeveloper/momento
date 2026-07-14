import type { MomentView, OfficialEventView } from "@/lib/txline/replay-fixture";
import type { UploadedMedia } from "@/lib/upload/upload-service";

export interface CreateMomentInput {
  title: string;
  description?: string;
  durationSeconds: number;
  event: OfficialEventView;
  media: UploadedMedia;
}

export interface MomentService {
  create(input: CreateMomentInput): Promise<MomentView>;
}

export function validateMomentText(title: string, description: string): Record<string, string> {
  const errors: Record<string, string> = {};
  const cleanTitle = title.trim();
  if (cleanTitle.length < 3) errors.title = "Add a title with at least 3 characters.";
  if (cleanTitle.length > 60) errors.title = "Keep the title to 60 characters or fewer.";
  if (description.trim().length > 220) errors.description = "Keep the description to 220 characters or fewer.";
  return errors;
}

export const localMomentService: MomentService = {
  async create({ title, description, durationSeconds, event, media }) {
    await new Promise((resolve) => window.setTimeout(resolve, 280));
    const cleanDescription = description?.trim() ?? "";
    return {
      id: crypto.randomUUID(),
      creator: "You",
      handle: "@momento_fan",
      title: title.trim(),
      caption: cleanDescription,
      description: cleanDescription,
      eventId: event.id,
      eventLabel: `${event.minute} ${event.title} • ${event.team}`,
      durationSeconds: Math.max(1, Math.round(durationSeconds)),
      championCount: 0,
      videoPath: media.playbackUrl,
      posterTone: event.team.toLowerCase().includes("spain") ? "red" : "blue",
      initials: "YOU",
      rank: 1,
      createdAtLabel: "Just now",
      commentCount: 0,
      txlineVerified: true,
    };
  },
};
