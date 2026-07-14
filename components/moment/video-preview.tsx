"use client";

import { useRef, useState } from "react";
import { Pause, Play, RefreshCw, Trash2 } from "lucide-react";

export function VideoPreview({ url, durationSeconds, onRemove, onReplace }: { url: string; durationSeconds: number; onRemove: () => void; onReplace: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const toggle = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) await video.play(); else video.pause();
  };
  return (
    <div className="composer-preview">
      <video ref={videoRef} src={url} playsInline muted preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
      <div className="preview-shade" />
      <button type="button" className="preview-play" onClick={toggle} aria-label={playing ? "Pause video preview" : "Play video preview"}>{playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button>
      <span className="preview-duration">{durationSeconds.toFixed(1)}s / 15s</span>
      <div className="preview-actions"><button type="button" onClick={onReplace}><RefreshCw size={15} /> Replace</button><button type="button" onClick={onRemove}><Trash2 size={15} /> Remove</button></div>
    </div>
  );
}
