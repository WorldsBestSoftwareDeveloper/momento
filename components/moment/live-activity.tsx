import { Eye, Flame, MessageCircle } from "lucide-react";
import type { CommunitySnapshot } from "@/lib/community/types";

export function LiveActivity({ snapshot }: { snapshot: CommunitySnapshot }) {
  return <div className="live-activity" aria-label="Live Moment activity">
    <span><Flame size={14} /> <strong>{snapshot.championCount.toLocaleString()}</strong> Champions</span>
    <span><MessageCircle size={14} /> <strong>{snapshot.commentCount.toLocaleString()}</strong> debating</span>
    <span><Eye size={14} /> <strong>{snapshot.watchingCount}</strong> Watching</span>
  </div>;
}

