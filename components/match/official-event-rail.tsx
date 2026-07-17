import { ArrowLeftRight, Circle, Goal, Hand, Timer } from "lucide-react";
import type { EventKind, OfficialEventView } from "@/lib/txline/replay-fixture";

const icons: Partial<Record<EventKind, typeof Circle>> = { goal: Goal, save: Hand, substitution: ArrowLeftRight, phase: Timer };

export function OfficialEventRail({ events, mode, verified = true }: { events: OfficialEventView[]; mode: "live" | "cached" | "replay"; verified?: boolean }) {
  return (
    <section className="event-section" aria-labelledby="official-events-title">
      <div className="section-heading"><div><span className="eyebrow">Official timeline</span><h2 id="official-events-title">Official events</h2></div><span className="verified-copy">{verified ? mode === "replay" ? "Recorded TxLINE data" : "Official TxLINE data" : "TxLINE connection required"}</span></div>
      <div className="event-rail" role="list">
        {events.map((event) => {
          const Icon = icons[event.kind];
          return (
            <div key={event.id} className={`event-token ${event.active ? "is-active" : ""}`} role="listitem" aria-label={`${event.minute} ${event.title}, ${event.team}`}>
              <span className="event-minute">{event.minute}</span>
              {event.kind === "yellow-card" || event.kind === "red-card" ? <i className={`card-icon ${event.kind}`} aria-hidden="true" /> : event.kind === "var" ? <i className="var-icon" aria-hidden="true">VAR</i> : Icon ? <Icon size={21} /> : null}
              <span><strong>{event.title}</strong><small>{event.team}</small></span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
