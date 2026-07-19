# Momento Internal API Specification

> These APIs power the shared loop: official TxLINE event -> capture -> Champion -> community-selected defining Moment.

## General contract

- Base: `/api`
- JSON request/response unless uploading directly to Supabase Storage.
- Auth: Supabase session cookie/token. Public reads allow anonymous access.
- Success envelope: `{ "data": ..., "meta": { "requestId": "...", "mode": "live|cached|replay" } }`
- Error envelope: `{ "error": { "code": "...", "message": "safe copy", "fieldErrors": {} }, "requestId": "..." }`
- Mutations accept `Idempotency-Key` UUID.
- Dates are ISO 8601; TxLINE IDs are serialized as strings to avoid JavaScript integer loss.

## Public reads

### `GET /api/matches`

Query: `scope=live|upcoming|recent` (default `live`), `cursor`, `limit` (1-20).

Response item: match ID, TxLINE fixture ID, competition, teams, start, normalized state/score, data mode, freshness, Moment count, active capture event count.

Errors: `400 INVALID_QUERY`, `503 DATA_UNAVAILABLE` only when neither live nor cache exists.

### `GET /api/matches/{matchId}`

Returns match header, data provenance, winner if present, top Moments preview and capability flags such as `canCapture` and `championsLocked`.

Errors: `404 MATCH_NOT_FOUND`.

### `GET /api/matches/{matchId}/events`

Query: `afterTs`, `limit` (max 200).

Returns normalized official events ordered by provider time, including `confirmed`, capture eligibility/window, and amended state. It never returns raw provider payloads.

### `GET /api/matches/{matchId}/moments`

Query: `sort=trending|new|championed`, `eventId`, `cursor`, `limit` (max 20).

Moment response includes signed playback URL, creator public profile, official event chip, Champion count, current user's Champion state when authenticated and comment count.

### `GET /api/moments/{momentId}`

Returns full Moment, comments preview, linked official event, match summary, and winner status.

### `GET /api/matches/{matchId}/leaderboard`

Returns top 10 eligible Moments, Champion counts, ranks, tie state and finalization status.

## Upload and Moment mutations

### `POST /api/uploads/intent`

Auth required.

Request:

```json
{
  "matchId": "uuid",
  "eventId": "uuid",
  "fileName": "reaction.mp4",
  "mimeType": "video/mp4",
  "byteSize": 8412231
}
```

Response: `{ uploadPath, uploadToken, expiresAt, maxDurationMs: 15000 }` or Supabase's equivalent signed upload data.

Validation: event belongs to match, capture window open (unless authorized replay), MIME is exactly `video/mp4`, size <=25 MB and user <=5 intents/hour.

Errors: `401 AUTH_REQUIRED`, `409 CAPTURE_CLOSED`, `413 FILE_TOO_LARGE`, `415 MP4_REQUIRED`, `429 RATE_LIMITED`.

### `POST /api/moments`

Request:

```json
{
  "matchId": "uuid",
  "eventId": "uuid",
  "uploadPath": "moments/user/uuid/source.mp4",
  "title": "That save changed everything",
  "caption": "We all froze for a second.",
  "durationMs": 12400
}
```

Response: `201` Moment resource.

Server validation: caller owns upload path; object exists; MIME is `video/mp4`; size <=25 MB; duration 1-15000 ms; event belongs to match; title/caption lengths; one Moment per user per official event for MVP.

The uploaded MP4 is stored and played as-is. There is no transcoding, compression service, thumbnail generation or background processing.

Errors: `409 DUPLICATE_MOMENT`, `409 CAPTURE_CLOSED`, `422 VIDEO_INVALID`, `422 VALIDATION_FAILED`.

### `DELETE /api/moments/{momentId}`

Soft-removes caller's Moment unless it is already the finalized winner. Returns `204`. Admin moderation uses a separate audited action.

## Engagement mutations

### `PUT /api/moments/{momentId}/champion`

Idempotently ensures the fan champions the Moment. Response: `{ championed: true, championCount, remainingMatchChampions }`.

### `DELETE /api/moments/{momentId}/champion`

Idempotently removes the Champion action before lock. Same response with `championed: false`.

Errors: `403 CHAMPION_LIMIT_REACHED`, `409 CHAMPION_LOCKED`, `404 MOMENT_NOT_FOUND`, `429 RATE_LIMITED`.

### `POST /api/moments/{momentId}/comments`

Request: `{ "body": "The timing on this reaction 😭", "parentId": null }`.

Validation: 1-500 characters, clean after trimming, target visible, rate limit. Response `201` comment.

### `POST /api/matches/{matchId}/messages`

Request: `{ "body": "What a save!" }`. Limit 1-280 characters and five messages/30 sec.

### `POST /api/reports`

Request: `{ targetType: "moment|comment|message", targetId, reason, detail? }`. Idempotent per reporter/target.

## Rewards — optional

For the hackathon, the winning demo creator has a preconfigured devnet recipient address. Do not add wallet connection, signature challenges or an escrow API to the core flow.

### `GET /api/matches/{matchId}/reward`

Public reward status, recipient abbreviated address, network, amount, and explorer URL when submitted.

### `POST /api/admin/matches/{matchId}/settle`

Admin only. Request `{ amountLamports, recipientWallet, confirmation: true }`; creates one sponsor-funded devnet transfer record. Never accepts a private key and never retries an uncertain transaction automatically.

Errors: `409 WINNER_NOT_FINAL`, `409 SETTLEMENT_EXISTS`, `422 WALLET_INVALID`, `503 SOLANA_UNAVAILABLE`.

## Demo/admin APIs

### `POST /api/admin/replays`

Request: `{ matchId, fixtureName, speed: 8 }`. Starts one replay and returns session ID. Admin only.

### `POST /api/admin/replays/{sessionId}/advance`

Optional deterministic demo control: advances to the next named beat (`goal`, `card`, `final`) rather than relying on a timer.

### `DELETE /api/admin/replays/{sessionId}`

Stops replay and restores the fixture's pre-replay state. Cleanup is scoped to the session.

### `GET /api/admin/health`

Returns TxLINE mode/freshness, last successful snapshot and replay state. Secrets are never included.

## Realtime channels

| Channel | Tables/events | Client behavior |
|---|---|---|
| `match:{id}` | match update, official event insert | Update score/rail, announce event accessibly |
| `moments:{matchId}` | Moment insert/update | Insert card, update moderation status |
| `champions:{matchId}` | Champion aggregate update | Reconcile counters and ranking |
| `chat:{matchId}` | message insert/update | Append visible messages |
| `comments:{momentId}` | comment insert/update | Append visible comments |

Clients must refetch after reconnect; Realtime is an invalidation/UX layer, not the authoritative source.

## Validation limits

| Resource | Limit |
|---|---:|
| Video | 15 seconds, 25 MB |
| Moment title | 3-60 characters |
| Moment caption | 220 characters |
| Comment | 500 characters |
| Match message | 280 characters |
| Champion actions | 5 distinct Moments per match/user |
| Upload intents | 5/hour/user |
| Comments/chat | 5/30 sec/user |

## HTTP mapping

- `400`: malformed query/body
- `401`: authentication required/invalid
- `403`: authenticated but not permitted/limit rule
- `404`: resource absent or intentionally hidden
- `409`: valid request conflicts with state
- `413`/`415`: upload size/type
- `422`: semantic validation
- `429`: rate limit
- `502`: upstream malformed response
- `503`: provider/database/RPC unavailable with no safe fallback
