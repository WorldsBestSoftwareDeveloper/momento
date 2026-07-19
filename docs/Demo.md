# Momento Demo and Submission Script

> **Opening message:** Momento transforms every official football event into a shared social experience where fans capture, champion and collectively decide the defining moment of every match.

## Demo objective

In under five minutes, prove three things: fan reactions lose context today; Momento creates a compelling working loop; TxLINE is the official data spine that makes the loop trustworthy and timely.

Target runtime: **4:35**, leaving 25 seconds of safety.

## Recording setup

- Use the deployed production URL in an incognito window.
- Prepare desktop at 1440x900 and one mobile responsive view or real phone recording.
- Preload a replay fixture but label it `Demo replay • recorded TxLINE data`.
- Seed two published Moments; keep one owned clip ready for a fresh upload.
- Open a second authenticated session for Champion/chat.
- Pre-verify winner and optional Solana transaction path.
- Hide browser bookmarks, notifications, secrets, admin URLs, and personal wallet balances.

## Minute-by-minute script

### 0:00-0:25 — The problem

**Screen:** Home with a live/replay featured match.

**Say:**

> Football's biggest moments create millions of reactions, but those reactions scatter across feeds and lose the official event that caused them. Momento transforms every official football event into a shared social experience where fans capture, champion and collectively decide the defining moment of every match.

**Show:** Product name/tagline, mobile-first quality, no pitch-deck pause.

### 0:25-0:55 — TxLINE is the backbone

**Click:** Featured France vs Spain match.

**Show:** scoreboard, mode badge, freshness, official event rail.

**Say:**

> This fixture, score state, clock and event timeline come through our TxLINE integration. We use the fixture snapshot for canonical matches and the score snapshot for official events. The UI always tells you whether data is live, cached or this deterministic replay. If our optional score stream is enabled, it uses the same event path.

**Trigger:** admin hotkey/second screen advances to a confirmed goal event. Do not expose the admin panel in the main recording.

### 0:55-1:25 — Official event becomes a social prompt

**Show:** event enters rail; score changes; Capture button pulses once.

**Say:**

> A confirmed goal is normalized and stored with its TxLINE fixture ID, provider timestamp, and sequence. That event opens a capture window. Fan content is visually separate, but it remains attached to the official moment.

**Click:** Goal event or Capture.

### 1:25-2:10 — Create a working Moment

**Show:** event picker preselects the goal, choose the prepared <=15s reaction, preview, title `We knew it was coming`, publish.

**Say:**

> Fans upload their own reaction, not match footage. Momento accepts a single MP4 up to 15 seconds and 25 megabytes, uploads it directly to private Supabase Storage and publishes it against this official event. There is no transcoding or background processing.

**Wait:** show real progress briefly; cut dead time if needed. Return to match room and show the new card.

### 2:10-2:50 — Champion and discuss

**Switch/show second session:** champion the newly created Moment and post `That reaction says everything.`

**Say:**

> Champion is a free community endorsement—not a bet, stake or financial position. The database enforces one Champion action per fan per Moment and a per-match cap. Supabase Realtime updates the feed, ranking and chat across devices.

**Show:** count and leaderboard change without refresh.

### 2:50-3:20 — Mobile consumer experience

**Switch:** mobile viewport.

**Show:** compact scoreboard, scroll event rail, swipe Moment, central Capture, ranking sheet.

**Say:**

> The same live room is designed mobile-first: official context stays pinned, reactions become a vertical feed, and capture remains one-thumb reachable.

### 3:20-3:55 — Final whistle and winner

**Advance replay:** final whistle.

**Show:** Champion actions lock, winner reveal, linked goal event and final score.

**Say:**

> When TxLINE reports a confirmed final state, Champion actions lock and a deterministic database transaction chooses Moment of the Match. Hidden content is excluded and ties resolve transparently by the earliest time reaching the final count.

### 3:55-4:20 — Minimal Solana

**Show either:** confirmed devnet reward Explorer link, or the community winner with reward pending.

**Say if confirmed:**

> Blockchain is deliberately minimal. Fans never need a wallet to participate. A sponsor can send the fixed creator reward after finalization, and this devnet transaction provides a public settlement receipt.

**Say if pending:**

> The social winner does not depend on a wallet. Reward settlement is isolated as an optional post-match step, so wallet or RPC friction can never break the fan experience.

### 4:20-4:35 — Close

**Show:** provenance sheet/end frame with tagline.

**Say:**

> Momento makes official data participatory: capture the moment, champion the reaction, relive the match. TxLINE tells us what happened; fans decide what it meant.

## Demo contingency map

| Failure during recording | Immediate move |
|---|---|
| TxLINE unavailable | State that the clearly labeled replay uses recorded TxLINE payloads; continue |
| Upload too slow | Use a pre-published Moment, mention the real upload was shown/tested, re-record if core proof is unclear |
| Auth email slow | Use pre-authenticated incognito profiles |
| Realtime delay | Refresh once; explain database reconciliation only if necessary |
| Reward RPC fails | Show pending state; never retry live without idempotency verification |
| Replay timing drifts | Use deterministic `next beat` control |

## Judge test path

Provide beside the application URL:

1. Open the featured replay fixture.
2. Browse Moments anonymously.
3. Use supplied judge/test login or magic link.
4. Upload any MP4 that is <=15 seconds and <=25 MB, or use the provided sample.
5. Champion a different Moment and add a comment.
6. Open Data Provenance to see endpoints and mode.

Never provide admin credentials or secrets. A reset script/operator should restore demo data after judge testing if needed.

## Brief technical documentation for submission

Use this concise description:

> Momento is a Next.js 15 responsive web app backed by Supabase Auth, Postgres, Storage and Realtime. Server routes consume TxLINE fixture and score snapshots, normalize official events and store them for realtime fan experiences. Fans publish MP4 reactions up to 15 seconds, champion them through idempotent database operations and see a winner after a TxLINE final state. Solana is limited to TxLINE subscription setup and one optional sponsor-funded devnet reward.

List these TxLINE integrations:

- `POST /auth/guest/start`
- `POST /api/token/activate`
- `GET /api/fixtures/snapshot`
- `GET /api/scores/snapshot/{fixtureId}`
- `GET /api/scores/stream?fixtureId={fixtureId}` only if the deployed build actually enables SSE

Only list endpoints that the deployed build actually calls.

## TxLINE feedback template

Write this after real integration; do not submit invented praise/friction.

**What worked well**

- Which endpoint got to first useful data fastest?
- Did fixture IDs, timestamps and sequences make event association reliable?
- Did captured historical data improve replay development and demo testing?
- Was on-chain verification useful to explain provenance?

**Where we hit friction**

- Exact network/IDL/host alignment issue, if any.
- Time from subscription transaction to token activation.
- Schema breadth/optional fields and how tolerant parsing was handled.
- If SSE was implemented, its heartbeat/reconnect behavior and any missing example.
- Free-tier rate/renewal details that required clarification.

**Suggested final structure:** two concrete positives, two specific frictions, and one actionable documentation improvement. Include no credentials, transaction secrets, or private support correspondence.

## Submission checklist

- [ ] Demo video <=5:00 with problem, live app, and explicit TxLINE backend explanation.
- [ ] Public deployed URL works in incognito and on mobile.
- [ ] Judge test instructions and optional test account are valid.
- [ ] Technical summary reflects the deployed system.
- [ ] Endpoint list includes only actual usage.
- [ ] TxLINE feedback is evidence-based.
- [ ] Repository contains setup instructions/environment variable names without values.
- [ ] No section is only a mockup/pitch; every shown core action works.
