# TxLINE Integration

> TxLINE establishes what officially happened; Momento transforms each event into a shared experience fans capture, champion and collectively turn into the defining Moment.

## Hackathon decision

Use the smallest TxLINE integration that is highly visible and reliable:

1. Fixture snapshot for canonical match identity.
2. Score snapshot on entry and every 10 seconds while active.
3. A recorded TxLINE sequence through the same normalizer for deterministic replay.
4. **Should Have:** score SSE after the complete product loop works.

Do not integrate odds merely to increase endpoint count. Momento is not a betting product.

## Verified platform facts

Checked against TxLINE documentation on 2026-07-15:

- Mainnet free service level `1` provides 60-second delayed World Cup/International Friendlies data; level `12` provides real-time data.
- Free access still requires an on-chain subscription transaction and SOL for fees/rent.
- Data calls require both the guest JWT and activated API token.
- The guest JWT is documented as expiring after 30 days.

Sources: [Quickstart](https://txline.txodds.com/documentation/quickstart), [World Cup Free Tier](https://txline.txodds.com/documentation/worldcup), [API Reference](https://txline.txodds.com/api-reference/authentication/start-a-new-guest-session), [Soccer Feed](https://txline.txodds.com/documentation/scores/soccer-feed).

## Network setup

Choose one network and keep RPC, program ID, transaction, guest JWT host and activation host aligned.

| Network | Program ID | API origin |
|---|---|---|
| Mainnet | `9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA` | `https://txline.txodds.com` |
| Devnet | `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J` | `https://txline-dev.txodds.com` |

Devnet is the easiest setup path. Use mainnet level 12 only if credentials are already working and live coverage improves the demo. Recheck current values before implementation.

## Endpoint plan

### `POST /auth/guest/start` — Must Have setup

| Field | Specification |
|---|---|
| Purpose | Obtain the operator guest JWT required for activation and data access. |
| Trigger | Once during setup; again only before documented expiry or after an auth failure. |
| Cache strategy | Store server-side as a deployment secret; never send to the browser or database logs. |
| Refresh interval | No periodic refresh during the hackathon; replace before its documented 30-day expiry. |
| Fallback behaviour | Continue with the current valid JWT. If none exists, use labeled replay and show operator setup blocked. |
| Replay compatibility | Not required to run replay after authorized payloads have been captured. |

### `POST /api/token/activate` — Must Have setup

| Field | Specification |
|---|---|
| Purpose | Exchange the matching on-chain subscription proof/signature for the long-lived TxLINE API token. |
| Trigger | Once after the selected-network subscription transaction. |
| Cache strategy | Store only in server deployment secrets. |
| Refresh interval | None during normal app requests; reactivate only when the token is invalid/expired. |
| Fallback behaviour | Keep an existing valid token; otherwise use replay while fixing network, wallet or signed-message mismatch. |
| Replay compatibility | Not needed at replay runtime. |

### `GET /api/fixtures/snapshot` — Must Have

| Field | Specification |
|---|---|
| Purpose | Supply canonical TxLINE fixture ID, competition, teams, home/away mapping and kickoff time for Home and the match header. |
| Trigger | Initial lobby load; manual refresh; scheduled refresh near the demo match. |
| Cache strategy | Store normalized selected fixtures in Supabase and serve the last successful value. |
| Refresh interval | 5 minutes normally; 30 seconds within 30 minutes of kickoff or while searching for an active match. |
| Fallback behaviour | Show the last successful fixture with timestamp; if absent, show the featured replay fixture. |
| Replay compatibility | The replay fixture is seeded from a captured authorized fixture snapshot and marked `REPLAY`. |

Request details:

- Optional `startEpochDay` and `competitionId` query parameters.
- Important fields: `Ts`, `StartTime`, `Competition`, `CompetitionId`, `FixtureGroupId`, participant IDs/names, `FixtureId`, `Participant1IsHome`.

### `GET /api/scores/snapshot/{fixtureId}` — Must Have

| Field | Specification |
|---|---|
| Purpose | Drive scoreboard, match phase, official event rail, Capture prompts and final-whistle detection. |
| Trigger | Match-room entry; active polling; manual retry after stale/error state. |
| Cache strategy | Normalize into the `matches` and `official_events` tables; deduplicate by provider identity/sequence. |
| Refresh interval | Snapshot on entry; 15-second polling only while SSE is disconnected; stop after confirmed final. |
| Fallback behaviour | Continue showing the last normalized score/events with a stale timestamp. After 30 seconds without an update in expected real-time mode, offer replay or keep polling with a reconnect label. |
| Replay compatibility | Recorded score records pass through the same normalizer and database writes at controlled offsets. |

Request details:

- Optional `asOf` Unix timestamp in milliseconds.
- Use `fixtureId`, `gameState`, `action`, `id`, `ts`, `seq`, `confirmed`, `statusSoccerId`, `scoreSoccer` and `dataSoccer` when present.
- Parse unknown/optional fields tolerantly; the UI receives only normalized Momento events.

### `GET /api/scores/stream` — Must Have

| Field | Specification |
|---|---|
| Purpose | Improve perceived real-time quality by receiving official score actions via SSE. |
| Trigger | Server-side listener starts for live mode and filters records to the configured featured fixture. |
| Cache strategy | Each received record goes through the same dedupe/normalization as snapshots; store the last event ID only if the listener is implemented. |
| Refresh interval | Continuous SSE; heartbeat monitored; reconnect on disconnect. |
| Fallback behaviour | Browser EventSource reconnects automatically and uses 15-second normalized snapshot polling until the proxy stream returns. |
| Replay compatibility | Replay does not call SSE but emits equivalent recorded score records through the same normalizer. |

The server ignores heartbeat/non-JSON messages and never forwards credentials or raw TxLINE payloads to the browser.

### `GET /api/scores/historical/{fixtureId}` — Must Have

| Field | Specification |
|---|---|
| Purpose | Supply the deterministic sequence of official score actions for the judge replay. |
| Trigger | Replay-mode server load for configured fixture `18237038`. |
| Cache strategy | Request with `no-store` because Devnet may alternate between JSON-array and SSE-style historical bodies; normalized fallback remains available. |
| Refresh interval | Once per replay request with framework cache reuse. |
| Fallback behaviour | Use the clearly disclosed bundled normalized recording and retain replay controls. |
| Replay compatibility | Primary replay endpoint; records pass through the same mapper used by snapshots and SSE. |

## Endpoint-to-screen visibility

| Screen | Visible TxLINE contribution |
|---|---|
| Home | Canonical fixture card, coverage attribution and last update |
| Match room | Score, phase, official event rail, freshness and mode |
| Capture | Selected official event, minute and event type |
| Moment card | Official event chip linking the reaction to what happened |
| Winner | Final match state and defining official event |
| Provenance sheet | Exact endpoints actually used in the deployed build |

## Normalization rules

1. Canonical key: `{fixtureId}:{provider id}:{seq}:{action}`; fall back to a hash of stable fields.
2. Keep provider timestamp and ingestion timestamp separate.
3. Map only product-relevant soccer actions: goal, penalty, card, shot/save when explicit, VAR, phase, corner, substitution and `other`.
4. Do not create a Capture prompt for retracted or unconfirmed events.
5. Treat `F`, `FET` and `FPE` as final. Treat interruption, abandonment, cancellation, postponement and coverage suspension as exceptional, not final.
6. Unknown data must not crash the visible match room.

## Replay contract

- Record only data the team's TxLINE access permits it to retain.
- Preserve fixture ID, original provider timestamps and action sequence.
- Emit through the production normalizer.
- Never show the `LIVE` label in replay.
- Follow all indicators and controls in `DEMO_REPLAY_SPEC.md`.

## Failure handling

| Failure | Response |
|---|---|
| 400 | stop retrying the unchanged request; log safe parameters |
| 401/403 | mark operator auth blocked; serve cached/replay data |
| 429 | widen polling interval and retain last-known data |
| Network/5xx | retry with short backoff; show stale timestamp |
| Schema mismatch | skip unsafe record, retain sanitized diagnostic and keep prior UI state |
| Sequence gap | refetch the current score snapshot |

## Implementation checklist

- [x] Confirm Devnet and service level 1.
- [x] Complete on-chain subscription and activation script.
- [x] Load canonical fixture metadata through a server-only client.
- [x] Fetch and normalize a real score snapshot.
- [x] Fetch historical fixture `18237038` for deterministic replay.
- [x] Route replay, snapshots and SSE through one normalized UI model.
- [x] Add SSE with automatic EventSource reconnect and snapshot polling fallback.
- [ ] Record concrete TxLINE positives and friction for the submission.
