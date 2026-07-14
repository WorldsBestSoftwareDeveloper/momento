"use client";

import { useRef, useState } from "react";
import { Clock3, Crown, MessageCircle, Pause, Play, ShieldCheck } from "lucide-react";
import type { MomentView } from "@/lib/txline/replay-fixture";
import { useMomentCommunity } from "@/lib/community/use-moment-community";
import { ChampionButton } from "./champion-button";

export function MomentCard({ moment, featured = false, onOpen }: { moment: MomentView; featured?: boolean; onOpen?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const { snapshot, busy, toggleChampion } = useMomentCommunity(moment);
  const hasPlayableVideo = moment.videoPath.startsWith("blob:") || moment.videoPath.startsWith("http");
  const toggleVideo = async () => {
    const video = videoRef.current;
    if (!hasPlayableVideo || !video) return;
    if (video.paused) await video.play(); else video.pause();
  };
  return (
    <article className={`moment-card poster-${moment.posterTone} ${featured ? "is-featured" : ""}`} onClick={onOpen}>
      <div className="moment-media" data-demo-video={moment.videoPath}>
        {hasPlayableVideo && <video ref={videoRef} src={moment.videoPath} playsInline muted preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />}
        {moment.isWinner && <span className="winner-chip"><Crown size={13} /> Current leader</span>}
        <span className="duration-chip">0:{moment.durationSeconds.toString().padStart(2, "0")}</span>
        <div className="poster-orbit" aria-hidden="true"><span>{moment.initials}</span></div>
        <button type="button" className="play-button" aria-label={`${playing ? "Pause" : "Play"} ${moment.title}`} onClick={(event) => { event.stopPropagation(); void toggleVideo(); }}>{playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button>
        <div className="media-gradient" />
        <div className="moment-overlay"><span className="event-chip">{moment.eventLabel}</span>{moment.txlineVerified && <span className="verified-event-chip"><ShieldCheck size={11} /> TxLINE event</span>}<button type="button" className="moment-title-button" onClick={(event) => { event.stopPropagation(); onOpen?.(); }}><h3>{moment.title}</h3></button></div>
      </div>
      <div className="moment-meta">
        <div className="avatar" aria-hidden="true">{moment.initials}</div>
        <div><strong>{moment.creator}</strong><span>{moment.handle}</span><small><Clock3 size={10} /> {moment.createdAtLabel ?? "Now"}</small></div>
        <ChampionButton compact championed={snapshot.championed} count={snapshot.championCount} busy={busy} onChampion={toggleChampion} />
      </div>
      <div className="moment-social-proof"><span><MessageCircle size={13} /> {snapshot.commentCount} comments</span><span>{snapshot.championCount.toLocaleString()} Champions</span></div>
      <button type="button" className="last-comment-preview" onClick={(event) => { event.stopPropagation(); onOpen?.(); }}><strong>{snapshot.lastComment?.authorHandle ?? "Discussion"}</strong><span>{snapshot.lastComment?.body ?? "Be first to join this Moment."}</span></button>
    </article>
  );
}
