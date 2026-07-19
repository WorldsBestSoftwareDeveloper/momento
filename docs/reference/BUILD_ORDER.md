# Momento Hackathon Build Order

> Build the visible promise first: Momento transforms every official football event into a shared social experience where fans capture, champion and collectively decide the defining moment of every match.

## Speed rules

1. Maintain one Next.js app and one Supabase project.
2. Deploy in the first hour and keep the deployed URL healthy.
3. Use TxLINE score snapshot polling first; SSE is an upgrade.
4. Build replay before polish so every visible beat is testable.
5. Use one MP4 upload path with no media processing.
6. Freeze features at hour 20 and visuals at hour 24.

## Exact sequence

### 0. Freeze the five-minute story — 20 minutes

Choose one match and seven beats: lobby -> official goal -> Capture -> upload -> Champion -> final whistle -> winner. Pick owned MP4 seed videos and a clearly labeled replay sequence.

### 1. Deploy the product shell — 40 minutes

Scaffold Next.js, tokens, compact header/mobile navigation and Vercel. Create Home and Match routes with static content shaped like the final UI.

**Visible gate:** judges could understand the product from the Match screen even before data is connected.

### 2. Create only the core Supabase model — 80 minutes

Profiles, matches, official events, Moments, Champions and winner; magic-link auth; private Storage bucket; minimum RLS.

**Visible gate:** a seeded match and Moment render from Supabase on the public deployment.

### 3. Connect one TxLINE fixture — 80 minutes

Complete credential setup, call `/api/fixtures/snapshot`, normalize the selected fixture and display canonical teams/start time with TxLINE attribution.

**Fallback trigger:** after 45 blocked minutes, record the friction and continue with authorized captured payloads.

### 4. Add score snapshots and replay — 2 hours

Normalize the soccer actions required by the UI. Poll `/api/scores/snapshot/{fixtureId}` every 10 seconds for active mode. Add replay start/next/final/reset through the same normalizer.

**Visible gate:** pressing the private `Next beat` control adds a labeled official event and changes the scoreboard.

### 5. Finish the premium match room — 2 hours

Implement scoreboard, event rail, Capture CTA, empty Moment feed, Momentum Meter and mode/freshness badge. Apply the critical motion from `ANIMATION_SPEC.md`.

**Visible gate:** desktop and 390px mobile both deliver the official-event-to-capture story.

### 6. Build the simple MP4 publish flow — 2.5 hours

Choose event -> choose MP4 -> validate <=15 seconds and <=25 MB -> preview -> direct Supabase Storage upload -> create Moment -> play stored MP4.

No camera feature, transcoding, compression, thumbnail generation or background job.

**Visible gate:** a new user publishes a fresh MP4 from the deployed app.

### 7. Build Champion and ranking — 90 minutes

Add the atomic Champion function, optimistic button, live count, five-Moment cap, leaderboard and Momentum Meter update.

**Visible gate:** a second session changes the rank without producing duplicates after refresh.

### 8. Finalize and reveal the winner — 75 minutes

Map TxLINE final states, lock Champion actions, select the top valid Moment once and run the winner reveal.

**Visible gate:** replay final beat consistently selects the expected defining Moment.

### 9. Add consumer energy — 60 minutes

Add flat live match chat, copyright reminder and one report/admin-hide path. If chat threatens the core loop, seed visible messages and defer message creation.

### 10. Add only high-value TxLINE visibility — 45 minutes

Create a provenance sheet listing the endpoints actually used, current mode and last update. Do not build a full diagnostics console or proof system.

### 11. Optional upgrades — maximum 2 hours total

Choose at most one:

- TxLINE score SSE listener for a stronger real-time claim.
- One sponsor-funded devnet reward transfer to a preconfigured winner address.

Do not implement wallet onboarding, escrow, Anchor or both optional upgrades unless the entire demo is already green.

### 12. Polish and accessibility — 2 hours

Fix 390x844, 768x1024 and 1440x900; focus order; contrast; reduced motion; loading/empty/error states; video playback. The 3D artifact remains decorative and may be removed with zero product loss.

### 13. Reliability and rehearsal — 2 hours

Verify replay reset, TxLINE cache fallback, Champion idempotency, MP4 validation and finalization. Run the exact demo three times against the deployed URL.

### 14. Record and submit — 3 hours

Record a <=5-minute video, verify the app in an incognito session and on mobile, complete technical notes, endpoint list and evidence-based TxLINE feedback.

## Time gates

| Deadline | Non-negotiable result |
|---|---|
| Hour 2 | public premium shell and Supabase seed |
| Hour 6 | TxLINE fixture + deterministic official event replay |
| Hour 10 | complete responsive match room |
| Hour 14 | real MP4 upload and feed |
| Hour 17 | Champion, ranking and winner |
| Hour 20 | full judge story deployed; feature freeze |
| Hour 24 | responsive/motion/reliability pass complete |
| Hour 27 | final rehearsal and video capture underway |
| Hour 30 | working URL, video, docs and feedback submitted |

## Verification checklist

- Production build and typecheck.
- Public deployment from a clean browser.
- TxLINE snapshot success and cached failure state.
- Replay indicator visible at all times during replay.
- MP4-only, <=15-second, <=25-MB validation.
- Champion uniqueness and final lock.
- Winner declared once.
- Core flow usable at 390px.

## Cut order

1. Solana reward transfer.
2. TxLINE SSE; keep snapshot polling.
3. Live chat creation; keep seeded discussion visually.
4. Merkle proof, advanced diagnostics and extra fixture filters.
5. Decorative 3D assets.

Never cut the deployed app, TxLINE-backed official event, replay fallback, MP4 upload, Champion action, responsive match room, winner reveal or demo video.
