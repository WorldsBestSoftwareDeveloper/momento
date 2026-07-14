import { Circle, Goal, Hand, Timer } from "lucide-react";
import type { EventKind, OfficialEventView } from "@/lib/txline/replay-fixture";

const icons: Partial<Record<EventKind, typeof Circle>> = { goal: Goal, save: Hand, phase: Timer };

export function OfficialEventRail({ events, mode }: { events: OfficialEventView[]; mode: "live" | "cached" | "replay" }) {
  return (
    <section className="event-section" aria-labelledby="official-events-title">
      <div className="section-heading"><div><span className="eyebrow">Official timeline</span><h2 id="official-events-title">Official events</h2></div><span className="verified-copy">{mode === "replay" ? "Recorded TxLINE data" : "Official TxLINE data"}</span></div>
      <div className="event-rail" role="list">
        {events.map((event) => {
          const Icon = icons[event.kind];
          return (
            <button key={event.id} className={`event-token ${event.active ? "is-active" : ""}`} type="button" role="listitem" aria-label={`${event.minute} ${event.title}, ${event.team}`}>
              <span className="event-minute">{event.minute}</span>
              {event.kind === "card" ? <i className="card-icon" aria-hidden="true" /> : event.kind === "var" ? <i className="var-icon" aria-hidden="true">VAR</i> : Icon ? <Icon size={21} /> : null}
              <span><strong>{event.title}</strong><small>{event.team}</small></span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
