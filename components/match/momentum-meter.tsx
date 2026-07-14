import Link from "next/link";
import { Crown } from "lucide-react";
import type { MatchRoomView } from "@/lib/txline/replay-fixture";

export function MomentumMeter({ match }: { match: MatchRoomView }) {
  return (
    <aside className="momentum-panel">
      <div className="panel-title"><Crown size={18} /><div><strong>Moment of the Match</strong><span>Community momentum</span></div></div>
      <div className="meter" style={{ "--meter-value": `${match.leadingShare * 3.6}deg` } as React.CSSProperties}>
        <div><strong>{match.leadingShare}%</strong><span>of Champions</span></div>
      </div>
      <p><strong>{match.moments[0].title}</strong> is leading the defining Moment conversation.</p>
      <button type="button" className="primary-button">Champion this Moment</button>
      <div className="leaderboard-mini">
        <span className="eyebrow">Most championed</span>
        {match.moments.map((moment) => <div key={moment.id}><strong>#{moment.rank}</strong><span>{moment.handle}</span><b>{moment.championCount.toLocaleString()}</b></div>)}
      </div>
      <Link href={`/matches/${match.id}#moments`} className="secondary-button">See full ranking</Link>
    </aside>
  );
}
