"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Clock3, Crown, MessageCircle, Pause, Play, ShieldCheck } from "lucide-react";
import type { MomentView } from "@/lib/txline/replay-fixture";
import { useMomentCommunity } from "@/lib/community/use-moment-community";
import { MomentMarketSummary } from "@/components/opinion/moment-market-summary";
import { OpinionChampion } from "@/components/opinion/opinion-champion";

export function MomentCard({ matchId, moment, mode, featured = false, onOpen }: { matchId: string; moment: MomentView; mode: "live" | "replay"; featured?: boolean; onOpen?: (startAt: number) => void }) {
  const cardRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [mobileVisible, setMobileVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { snapshot, busy, toggleChampion } = useMomentCommunity(moment);
  const desktopHover = typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const shouldPlay = desktopHover ? hovered : mobileVisible;

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new IntersectionObserver(([entry]) => setMobileVisible(entry.isIntersecting && entry.intersectionRatio >= .68), { threshold: [.25, .68, .9] });
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shouldPlay) void video.play().catch(() => undefined); else video.pause();
  }, [shouldPlay, loaded]);

  const toggleVideo = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) await video.play(); else video.pause();
  };
  const open = () => onOpen?.(videoRef.current?.currentTime ?? 0);

  return <article ref={cardRef} className={`moment-card poster-${moment.posterTone} ${featured ? "is-featured" : ""} ${playing ? "is-previewing" : ""}`} onClick={open} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
    <div className="moment-media" data-demo-video={moment.videoPath}>
      {moment.posterPath && <Image className={`moment-poster ${playing ? "is-hidden" : ""}`} src={moment.posterPath} alt="" fill sizes="(max-width: 767px) 50vw, (max-width: 1200px) 33vw, 22vw" priority={moment.rank <= 2} />}
      {(shouldPlay || loaded) && <video ref={videoRef} src={moment.videoPath} poster={moment.posterPath} playsInline muted loop preload="metadata" onLoadedData={() => setLoaded(true)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />}
      <div className="stadium-reflection" aria-hidden="true" />
      {moment.isWinner && <span className="winner-chip"><Crown size={13} /> Current leader</span>}
      <span className="duration-chip"><i />0:{moment.durationSeconds.toString().padStart(2, "0")}</span>
      <button type="button" className="play-button" aria-label={`${playing ? "Pause" : "Play"} ${moment.title}`} onClick={(event) => { event.stopPropagation(); void toggleVideo(); }}>{playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button>
      <div className="media-gradient" />
      <div className="moment-overlay"><span className="event-chip">{moment.eventLabel}</span>{moment.txlineVerified && <span className="verified-event-chip"><ShieldCheck size={11} /> TxLINE event</span>}<button type="button" className="moment-title-button" onClick={(event) => { event.stopPropagation(); open(); }}><h3>{moment.title}</h3></button></div>
    </div>
    <div className="moment-meta">
      <div className="avatar creator-avatar" aria-hidden="true">{moment.posterPath ? <Image src={moment.posterPath} alt="" fill sizes="32px" /> : moment.initials}</div>
      <div><strong>{moment.creator}</strong><span>{moment.handle}</span><small><Clock3 size={10} /> {moment.createdAtLabel ?? "Now"}</small></div>
      <OpinionChampion compact matchId={matchId} momentId={moment.id} mode={mode} championed={snapshot.championed} count={snapshot.championCount} busy={busy} onChampion={toggleChampion} />
    </div>
    <div className="moment-social-proof"><span><MessageCircle size={13} /> {snapshot.commentCount} comments</span><span>{snapshot.championCount.toLocaleString()} Champions</span></div>
    <MomentMarketSummary matchId={matchId} moment={{ ...moment, championCount: snapshot.championCount }} compact />
    <button type="button" className="last-comment-preview" onClick={(event) => { event.stopPropagation(); open(); }}><strong>{snapshot.lastComment?.authorHandle ?? "Discussion"}</strong><span>{snapshot.lastComment?.body ?? "Be first to join this Moment."}</span></button>
  </article>;
}
