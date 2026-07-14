"use client";

import { useRef, useState } from "react";
import { Clock3, Crown, Heart, MessageCircle, Pause, Play, ShieldCheck } from "lucide-react";
import type { MomentView } from "@/lib/txline/replay-fixture";

export function MomentCard({ moment, featured = false }: { moment: MomentView; featured?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const hasPlayableVideo = moment.videoPath.startsWith("blob:") || moment.videoPath.startsWith("http");
  const toggleVideo = async () => {
    const video = videoRef.current;
    if (!hasPlayableVideo || !video) return;
    if (video.paused) await video.play(); else video.pause();
  };
  return (
    <article className={`moment-card poster-${moment.posterTone} ${featured ? "is-featured" : ""}`}>
      <div className="moment-media" data-demo-video={moment.videoPath}>
        {hasPlayableVideo && <video ref={videoRef} src={moment.videoPath} playsInline muted preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />}
        {moment.isWinner && <span className="winner-chip"><Crown size={13} /> Current leader</span>}
        <span className="duration-chip">0:{moment.durationSeconds.toString().padStart(2, "0")}</span>
        <div className="poster-orbit" aria-hidden="true"><span>{moment.initials}</span></div>
        <button type="button" className="play-button" aria-label={`${playing ? "Pause" : "Play"} ${moment.title}`} onClick={toggleVideo}>{playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button>
        <div className="media-gradient" />
        <div className="moment-overlay"><span className="event-chip">{moment.eventLabel}</span>{moment.txlineVerified && <span className="verified-event-chip"><ShieldCheck size={11} /> TxLINE event</span>}<h3>{moment.title}</h3></div>
      </div>
      <div className="moment-meta">
        <div className="avatar" aria-hidden="true">{moment.initials}</div>
        <div><strong>{moment.creator}</strong><span>{moment.handle}</span><small><Clock3 size={10} /> {moment.createdAtLabel ?? "Now"}</small></div>
        <button type="button" aria-label={`Champion ${moment.title}`}><Heart size={18} /><span>{moment.championCount.toLocaleString()}</span></button>
      </div>
      <div className="moment-social-proof"><span><MessageCircle size={13} /> {moment.commentCount ?? 0} comments</span><span>{moment.championCount.toLocaleString()} Champions</span></div>
    </article>
  );
}
