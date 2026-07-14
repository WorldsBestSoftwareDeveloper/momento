import { DataModeBadge } from "./data-mode-badge";
import type { MatchRoomView, MatchTeamView } from "@/lib/txline/replay-fixture";

function Team({ team, side }: { team: MatchTeamView; side: "home" | "away" }) {
  return (
    <div className={`score-team score-team-${side}`}>
      <span className={`team-mark team-${team.tone}`} aria-hidden="true">{team.code}</span>
      <div><span className="team-code">{team.code}</span><strong>{team.name}</strong></div>
      <span className="score-number">{team.score}</span>
    </div>
  );
}

export function MatchScoreboard({ match, compact = false }: { match: MatchRoomView; compact?: boolean }) {
  return (
    <section className={`scoreboard ${compact ? "scoreboard-compact" : ""}`} aria-label={`${match.home.name} ${match.home.score}, ${match.away.name} ${match.away.score}`}>
      <div className="scoreboard-meta">
        <span>{match.competition}</span>
        <DataModeBadge mode={match.mode} label={match.modeLabel} />
      </div>
      <div className="scoreboard-main">
        <Team team={match.home} side="home" />
        <div className="match-clock"><strong>{match.minute}</strong><span>{match.state === "live" ? "Second half" : "Full time"}</span></div>
        <Team team={match.away} side="away" />
      </div>
      <div className="scoreboard-foot"><span>Powered by <strong>TxLINE</strong></span><span>{match.updatedAtLabel}</span></div>
    </section>
  );
}
