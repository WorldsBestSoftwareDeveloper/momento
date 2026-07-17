"use client";

import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";

interface ReplayControlsProps {
  cursor: number;
  total: number;
  running: boolean;
  completed: boolean;
  beatLabel: string;
  onStart: () => void;
  onNext: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onFinish: () => void;
}

export function ReplayControls(props: ReplayControlsProps) {
  const { cursor, total, running, completed, beatLabel, onStart, onNext, onPause, onResume, onReset, onFinish } = props;
  return (
    <section className="replay-controls" aria-label="Historical replay controls">
      <div><span className="eyebrow">Historical replay</span><strong>{beatLabel}</strong><small>Chapter {Math.max(cursor + 1, 0)} of {total}</small></div>
      <div className="replay-control-actions">
        <button type="button" onClick={onReset} disabled={cursor < 0}><RotateCcw size={15} /> Reset</button>
        {cursor < 0 ? <button type="button" className="is-primary" onClick={onStart}><Play size={15} /> Start replay</button> : running ? <button type="button" onClick={onPause}><Pause size={15} /> Pause</button> : !completed ? <button type="button" onClick={onResume}><Play size={15} /> Resume</button> : null}
        <button type="button" onClick={onNext} disabled={completed || cursor < 0}><SkipForward size={15} /> Next chapter</button>
        <button type="button" onClick={onFinish} disabled={completed || cursor < 0}>Final whistle</button>
      </div>
    </section>
  );
}
