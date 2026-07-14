import { Crown, Heart, Play } from "lucide-react";
import type { MomentView } from "@/lib/txline/replay-fixture";

export function MomentCard({ moment, featured = false }: { moment: MomentView; featured?: boolean }) {
  return (
    <article className={`moment-card poster-${moment.posterTone} ${featured ? "is-featured" : ""}`}>
      <div className="moment-media" data-demo-video={moment.videoPath}>
        {moment.isWinner && <span className="winner-chip"><Crown size={13} /> Current leader</span>}
        <span className="duration-chip">0:{moment.durationSeconds.toString().padStart(2, "0")}</span>
        <div className="poster-orbit" aria-hidden="true"><span>{moment.initials}</span></div>
        <button type="button" className="play-button" aria-label={`Play ${moment.title}`}><Play fill="currentColor" /></button>
        <div className="media-gradient" />
        <div className="moment-overlay"><span className="event-chip">{moment.eventLabel}</span><h3>{moment.title}</h3></div>
      </div>
      <div className="moment-meta">
        <div className="avatar" aria-hidden="true">{moment.initials}</div>
        <div><strong>{moment.creator}</strong><span>{moment.handle}</span></div>
        <button type="button" aria-label={`Champion ${moment.title}`}><Heart size={18} /><span>{moment.championCount.toLocaleString()}</span></button>
      </div>
    </article>
  );
}
