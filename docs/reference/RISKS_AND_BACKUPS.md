# Momento Risks and Backups

> Protect the central promise: official event -> capture -> Champion -> community-selected defining Moment.

## Risk posture

The largest risk is not UI quality; it is making the demo dependent on the timing and health of external systems. Momento's core path must be real, while replay, cache, and optional blockchain gates keep the presentation deterministic.

## Risk register

| Risk | Likelihood | Impact | Prevention | Demo backup | Trigger/owner |
|---|---|---|---|---|---|
| TxLINE subscription/token setup blocks | Medium | Critical | Complete first; keep network/IDL/API host aligned | Authorized recorded payload replay | 45 min without fixture response -> switch build path; integration owner |
| No live match during judging | High | Critical | Build replay first-class | Deterministic event sequence labeled replay | Always use replay for scripted demo unless live fixture is rehearsed |
| Provider schema varies | Medium | High | Tolerant validation, raw retention, safe normalization | Skip unknown action as `other`; keep scoreboard snapshot | Parse alert >1 record -> inspect raw fixture |
| Free-tier delay changes UX | Medium | Medium | Render freshness/mode; prefer service level 12 if ready | Replay/cached data | Freshness exceeds tier threshold |
| Optional SSE cannot be hosted | Medium | Low | Treat snapshot polling as the default | keep 10-second score snapshot polling | cut SSE immediately |
| Video upload slow/fails | Medium | Critical | MP4 only, <=15 seconds, <=25 MB, direct Storage upload | pre-seeded Moment; preserve form for retry | two failed uploads -> diagnose before recording |
| Browser codec incompatibility | Medium | High | MP4 H.264 baseline sample; MIME allowlist | known-good bundled sample clip | playback error on target browser |
| Supabase RLS blocks valid flow | Medium | High | policy tests and server RPCs | seeded service-created data is view-only backup | any authenticated mutation 403 |
| RLS leaks private/raw data | Low | Critical | deny default; public safe views; clean-session tests | disable affected endpoint | unexpected row visible -> release blocker |
| Champion manipulation/Sybil | High at scale | Medium in demo | auth, uniqueness, per-match cap and rate limit | state MVP limitation in docs | anomalous burst/operator review |
| Copyrighted match footage | Medium | High | reaction-only copy, report/hide, owned seed clips | remove clip immediately | report or rights uncertainty |
| Gambling interpretation | Medium | High | Champion is free; no stakes, odds or returns | remove reward wording/feature | reviewer/legal concern |
| Solana RPC/reward friction | Medium | Low | isolate to post-match optional flow | reward pending; show TxLINE subscription relevance | core green gate not met by hour 20 -> cut payout |
| Duplicate payout | Low | Critical | settlement unique row, idempotency, signature reconciliation | disable payout; manual pending | uncertain submitted signature -> never resubmit blindly |
| Email auth delays | Medium | Medium | magic link tested; pre-auth demo sessions | supplied judge test account/OTP provider if configured | email >60 sec |
| Realtime client drops | Medium | Medium | refetch on reconnect/focus | 15 sec polling/manual refresh | disconnected status >15 sec |
| Generated/3D assets hurt performance | Medium | Low | compressed WebP/AVIF, decorative-only, mobile hide | remove artifact | LCP regression >0.5 sec or asset >250 KB |
| Team crest/image rights | High | Medium | text/generic color flags, owned fan media | generic team tiles | rights not confirmed -> no crests |
| Time overrun | High | Critical | gates, cut order and feature freeze | ship match room/upload/Champion/replay only | milestone miss >2 hours |
| Demo recording failure | Medium | Critical | three rehearsals, local copy, notifications off | re-record from deterministic state | any core step ambiguous -> do not submit take |

## Critical fallback packages

### Provider fallback

- One captured fixture snapshot.
- One captured score sequence containing kickoff, goal, card/VAR, and final state.
- Original IDs/timestamps retained.
- Replay label and explanation visible.
- Same parser/database path as live ingestion.

### Social fallback

- Two pre-authenticated demo users.
- Three owned/licensed reaction clips.
- Pre-seeded published Moments and comments.
- Resettable Champion actions so the leaderboard change is still demonstrable.

### Deployment fallback

- Last-known-good production deployment retained.
- Environment variables documented outside the recording.
- Database migration rollback is additive/manual; never destructive during the demo window.
- Static technical status page may explain an outage, but it does not replace a working app submission.

## Security threats

| Threat | Control |
|---|---|
| Client calls TxLINE directly and leaks token | server-only adapter and secret scanning |
| User uploads executable/oversized content | MIME + signature/metadata checks, size/duration, private bucket |
| Champion race inflates count | unique key and single atomic database RPC |
| User attaches to another match's event | server checks event-match relation |
| Replay endpoint exposed | admin RLS/route guard, excluded from navigation |
| Sponsor key exposure | isolated deployment secret, never browser/log/database |

## Go/no-go gates

### Go for recording

- Deployed URL works from a clean browser.
- Replay reset and each beat work twice consecutively.
- A new Moment can upload and play.
- Champion count is correct after refresh.
- Finalization declares the expected winner once.
- Data mode is truthful.

### No-go until fixed

- TxLINE token appears in browser/network response.
- Unauthenticated user can mutate protected data.
- Replay is labeled live.
- Champion count can be duplicated.
- Upload allows non-MP4, >15 seconds or >25 MB.
- Demo relies on an unverified payout.

## Questions to resolve early

- Which TxLINE network/service level and credentials are already available?
- May the team store/replay captured provider payloads for a hackathon demo?
- What exact prize, if any, will Momento itself distribute to a winning creator?
- Are the supplied fan clips and any team marks licensed/owned?
- Is optional SSE worth time after snapshot polling and replay are stable?
