# Momento Pre-Implementation Review and Implementation Plan

## Status

- Role: Lead Software Engineer
- Review date: 2026-07-14
- Documents reviewed: all 17 Markdown planning documents in the repository
- Implementation state: not started
- Constraint: approximately 30 hours to a deployed, rehearsed hackathon submission
- This file contains planning only; it does not authorize feature work beyond the stated phase gates.

## Executive understanding

Momento transforms every official football event into a shared social experience where fans capture, champion and collectively decide the defining moment of every match.

The product's differentiating loop is:

```text
TxLINE fixture and official event
    -> event appears in the match room
    -> event opens a Capture window
    -> fan uploads one short reaction MP4
    -> other fans Champion the Moment
    -> leaderboard and Momentum Meter update
    -> TxLINE final state locks Champion actions
    -> the community's Moment of the Match is revealed
```

The technical baseline is one Next.js 15 application, one Supabase project and server-only TxLINE access. Supabase supplies Auth, Postgres, private Storage and Realtime. TxLINE fixture/score snapshots are Must Have; ten-second active-match polling is the default. SSE and a sponsor-funded Solana devnet reward are optional upgrades. Replay is a clearly labeled deterministic mode that runs captured TxLINE records through the same normalizer and persisted event path.

The consumer UI is mobile-first, broadcast-inspired and deliberately distinct from betting/crypto dashboards. `Champion` is a free endorsement. Upload accepts MP4 only, at most 15 seconds and 25 MB, with no transcoding, compression or background processing.

## Document authority order

When planning documents disagree, implementation follows this order:

1. `BUILD_ORDER.md` for sequence, time gates and cut order.
2. `HACKATHON_WIN_STRATEGY.md` for non-negotiable judge value.
3. `FEATURE_BREAKDOWN.md` for Must/Should/Nice/Demo/Future scope.
4. This implementation plan for conflict resolutions and implementation contracts.
5. `PRODUCT_REQUIREMENTS.md` for product behavior not overridden by scope priority.
6. `TXLINE_INTEGRATION.md`, `DATABASE_SCHEMA.md` and `API_SPEC.md` for technical detail after applying the resolutions below.
7. UI, design, component, animation, replay, Solana and risk documents for their specialist domains.

The deployed behavior and submission documentation must list only functionality/endpoints actually implemented.

## Conflict register and resolutions

| ID | Conflict | Documents | Resolution for implementation |
|---|---|---|---|
| C01 | Chat/comments are Required in the PRD but Should/Nice-to-Have in feature priority and cut strategy. | PRD, Feature Breakdown, Demo Script | Match chat is **Should Have**. Moment comments are **Nice To Have**. The core judge path ends successfully without either. Demo/test instructions mention comments only if implemented. |
| C02 | Home calls for live/upcoming/recent discovery, while only one featured fixture is prioritized. | PRD, UI/UX, Feature Breakdown | Must Have Home shows one featured live/replay match plus a compact list if data exists. Upcoming/recent filters are Nice To Have. |
| C03 | UI copy still references camera preview/recording although upload is file-only. | PRD journey, UI/UX, Feature Breakdown, Build Order | No camera flow. Rename the screen conceptually to **Upload Moment**. Empty event state disables publishing and explains that an official event is required. |
| C04 | Winner reveal is 700 ms maximum in UI/UX but 850-900 ms in Animation Spec; design motion tokens also differ. | UI/UX, Design System, Animation Spec | `ANIMATION_SPEC.md` is authoritative. Winner sequence may run up to 900 ms; routine motion uses its 100/180/260/360 ms tokens. Only the critical subset is Must Have. |
| C05 | Feature Breakdown says implement all motion, but Build Order says critical motion first. | Feature Breakdown, Build Order, Animation Spec | Must Have motion: official event, score change, Capture pulse, upload progress, Champion feedback, leaderboard layout and winner reveal. Other motion is Should/Nice and cuttable. |
| C06 | Ten-second polling is assigned to Next.js, but no owner invokes it continuously on Vercel. | System Architecture, TxLINE Integration | The active match page invokes a protected internal sync endpoint every 10 seconds while visible. The route fetches TxLINE server-side, normalizes and upserts idempotently. Multiple clients are safe through dedupe; the demo operator tab guarantees polling. No background worker is required. |
| C07 | Replay reset requires session-scoped deletion/restoration, but events/Moments/Champions lack replay session ownership. | Demo Replay, Database Schema, API Spec | Use one dedicated demo match row with `is_demo=true` and never mix it with production user content. Add nullable `replay_session_id` to replay-created official events and winner records; seed Moments/Champion actions have a documented baseline. Reset deletes only rows for the demo match/session and reapplies seed data. |
| C08 | `txline_fixture_id` is unique, but replay and live could use the same provider fixture as separate rows. | Database Schema, Replay Spec | Use a synthetic negative `txline_fixture_id` for the dedicated demo match and store the original provider fixture ID in `raw_fixture`/replay metadata. Live fixtures keep genuine positive IDs. |
| C09 | Replay controls differ: API has start/advance/delete, while Replay Spec requires pause, resume, jump-final and reset. | API Spec, Demo Replay | Guided mode is Must Have: reset, start, next beat, jump final. Timed pause/resume/speed is Nice To Have. Plan explicit guided endpoints/actions; no timed mode unless the core demo is green. |
| C10 | Winner tie-break requires “earliest time reaching final Champion count,” but no persisted timestamp defines that moment. | PRD, Database Schema, Demo Script | For the hackathon use deterministic ordering: `champion_count DESC`, then `published_at ASC`, then `moment_id ASC`. Do not claim the unsupported “time reaching count” rule. |
| C11 | UUID convention says UUID v7/`gen_random_uuid()`, but `gen_random_uuid()` produces v4. | Database Schema | Use PostgreSQL `gen_random_uuid()` (UUID v4) consistently. UUID v7 is Future and provides no demo value. |
| C12 | `toggle_moment_champion` accepts `p_user_id`, which could allow caller spoofing. | Database Schema, API Spec | RPC derives the actor from `auth.uid()`; no caller-supplied user ID. Admin/service execution is separate and not exposed publicly. |
| C13 | RLS matrix refers to `champions`, while the table is `moment_champions`. | Database Schema | Use `moment_champions` everywhere in migrations, policies, Realtime and generated types. |
| C14 | Reward states disagree: UI includes `submitted`, database omits it. | Components, Solana, Database Schema, API | Optional settlement states are `pending`, `submitted`, `confirmed`, `failed`. Record a signature before confirmation and never blindly resubmit. |
| C15 | `reward_settlements.winner_id` has no unambiguous referenced key. | Database Schema | Use `match_id` as the unique FK and `winner_moment_id` as an FK to `moments`. Recipient comes from the stored profile wallet/address snapshot. |
| C16 | Data Provenance UI lists SSE/proofs even when they may not be built. | UI/UX, TxLINE Integration, Demo Script | Render only endpoints actually called by the deployed build. Snapshot endpoints are Must Have; SSE/proof entries appear conditionally. |
| C17 | Server independently validates duration, but no media parser/background pipeline exists. | API Spec, Upload architecture | Client reads duration from the browser video element; server enforces auth, path ownership, MP4 MIME and <=25 MB. Store client-reported duration and reject outside 1-15000 ms. This is acceptable hackathon validation, not a security guarantee. |
| C18 | Caption accessibility is referenced, but no caption/VTT production flow exists. | UI/UX, Components | Moment caption text is the MVP text alternative. Video controls are labeled and playback is muted-first. Timed captions/transcripts are Future and must not be claimed. |
| C19 | Winner/detail components assume a reward even when Solana is cut. | UI/UX, Components, Solana | Winner reveal is complete without reward. `RewardStatusCard` renders only when a reward is configured; otherwise use neutral community-winner copy. |
| C20 | Product language says “record/select” after camera was cut. | PRD, UI/UX | All implementation copy uses `Choose MP4`, `Upload Moment` and `Replace video`; no `Record` action. |

## Preflight inputs and blockers

These are not reasons to delay documentation or UI shell work, but they gate real integration:

- TxLINE selected network, service level, activated guest JWT and API token.
- Confirmation that captured TxLINE data may be retained for the hackathon replay.
- One permitted fixture snapshot and one score sequence with goal plus final state.
- Supabase project, Vercel project and magic-link redirect URLs.
- At least three owned H.264/AAC MP4 reaction clips under 15 seconds and 25 MB.
- Two demo users or a reliable pre-authenticated-session procedure.
- Confirmation that no unlicensed team crests/fan images will ship.
- Optional only: sponsor devnet key, fixed amount and winner recipient address.

## Detailed implementation plan

The phase order follows `BUILD_ORDER.md` exactly. Time estimates are cumulative targets, not invitations to exceed the 30-hour cap.

### Phase 0 — Freeze the judge story

**Timebox:** 20 minutes
**Scope:** planning/data selection only

Tasks:

1. Select one replay match and define the seven named beats: ready, kickoff, goal, upload, Champion, final, winner.
2. Confirm the goal event is capture-eligible and the final record maps to `F`, `FET` or `FPE`.
3. Choose three owned MP4 files and verify codec playback in target browsers.
4. Select the expected winning seed Moment and deterministic final counts.
5. Freeze the exact positioning statement and demo closing line.
6. Record all optional steps in a separate list so they cannot enter core scope accidentally.

Gate:

- Replay beat sheet, owned media and expected winner are fixed.
- No unresolved choice changes the core user journey.

### Phase 1 — Deploy the premium product shell

**Timebox:** 40 minutes
**Cumulative target:** 1 hour

Tasks:

1. Create the single Next.js 15 TypeScript application at repository root.
2. Add only required dependencies: Tailwind, shadcn/ui primitives actually used, Framer Motion and Supabase clients.
3. Establish environment validation with public/server separation.
4. Apply design tokens, typography, dark canvas, surface/radius primitives and reduced-motion baseline.
5. Create the Home and Match route shells using static typed fixtures shaped like final view models.
6. Build compact desktop header and mobile bottom navigation.
7. Deploy immediately to Vercel and verify from a clean browser.

Deliverables:

- Public URL.
- Responsive AppShell, Home shell and Match shell.
- Environment failure state that reveals no secrets.

Verification:

- Production build and typecheck.
- 390x844 and 1440x900 no-overflow check.
- No official crest/generated fan image used as a production asset.

Gate:

- A judge can infer official-event -> Capture -> Champion from the static Match shell.

### Phase 2 — Supabase core model, Auth and Storage

**Timebox:** 80 minutes
**Cumulative target:** approximately 2.5 hours

Tasks:

1. Create migrations for `profiles`, `matches`, `official_events`, `moments`, `moment_champions`, `match_winners` and `replay_sessions` only.
2. Apply conflict resolutions C07-C15: demo/session fields, synthetic demo fixture ID, UUID v4, safe Champion RPC, corrected names, deterministic tie-break and reward fields only if enabled.
3. Add the auth-profile trigger and roles `fan`, `moderator`, `admin`.
4. Add deny-by-default RLS and the minimum read/mutation policies.
5. Create private `moments` bucket and MP4 path policy.
6. Implement the database Champion toggle and winner finalization contracts as migrations.
7. Seed one demo match, two users, 3-5 Moments and deterministic Champion baseline.
8. Configure magic-link redirects for localhost and deployed URL.

Verification:

- Anonymous can read published public data but cannot mutate.
- Authenticated fan can affect only own profile/uploads and Champion through RPC.
- Caller cannot Champion as another user.
- Duplicate Champion does not inflate count.
- Private Storage object is not publicly enumerable.

Gate:

- Public deployment renders Supabase seed data.
- Champion and finalization database rules pass direct smoke tests.

### Phase 3 — Connect one TxLINE fixture

**Timebox:** 80 minutes
**Cumulative target:** approximately 4 hours

Tasks:

1. Confirm network consistency across RPC, program, subscription, guest auth and activation host.
2. Add server-only TxLINE client with both required headers and safe timeouts.
3. Define tolerant fixture schema and normalized Match view model.
4. Call `/api/fixtures/snapshot` and select the featured covered fixture.
5. Upsert the real fixture using its positive TxLINE ID.
6. Render canonical team names, kickoff, competition, mode and last update on Home.
7. Record integration timestamps and friction notes for submission feedback.

Fallback at 45 blocked minutes:

- Stop credential debugging from blocking the product.
- Use the permitted replay fixture while logging the exact blocker.
- Continue real integration in a later bounded attempt only.

Gate:

- At least one real fixture response has been validated and safely displayed, or the blocker is documented and replay mode is ready.

### Phase 4 — Score snapshot sync and replay

**Timebox:** 2 hours
**Cumulative target:** approximately 6 hours

Tasks:

1. Define tolerant score-record schemas only for fields used by Momento.
2. Implement normalized match phase/score and event mappings for goal, penalty, card, VAR, explicit shot/save, phase, corner, substitution and other.
3. Derive stable provider keys and make every upsert idempotent.
4. Create a server-only sync route that fetches one fixture score snapshot, normalizes and writes it.
5. Have the visible active match page invoke sync every 10 seconds; pause when hidden and refetch on focus.
6. Add stale/cached state after the relevant freshness threshold.
7. Add the dedicated replay match and sanitized replay fixture with original metadata.
8. Implement guided replay controls: reset, start, next beat and jump final.
9. Add persistent replay badge/banner/provenance.
10. Ensure final replay beat invokes the same winner finalization path.

Verification:

- Duplicate sync calls do not duplicate official events.
- Unknown provider action does not crash or corrupt match state.
- Unconfirmed/retracted event does not open Capture.
- Replay and snapshot records produce equivalent normalized view models.
- Every replay control is idempotent.
- Reset affects only the dedicated demo match/session and completes under five seconds.

Gate:

- Private Next Beat visibly updates the public match room through Supabase Realtime.
- Replay is unmistakably labeled on Home, Match and Provenance.

### Phase 5 — Premium match room

**Timebox:** 2 hours
**Cumulative target:** approximately 8 hours

Tasks:

1. Implement MatchScoreboard with score, phase/minute, freshness and mode.
2. Implement keyboard/touch accessible OfficialEventRail and tokens.
3. Implement CaptureWindowBanner and central Capture CTA.
4. Implement empty Moment feed and Momentum Meter shell.
5. Compose desktop main/right rail and mobile vertical feed/ranking sheet.
6. Implement Must Have motion only: official event entrance, score change and Capture pulse.
7. Add `aria-live` behavior with duplicate announcement protection.
8. Ensure cached/replay modes remain fully useful and visually distinct.

Verification:

- 320px minimum width has no horizontal page overflow.
- Event rail scrolls without trapping the page.
- Reduced motion produces static state changes.
- Unconfirmed event cannot be selected for Capture.

Gate:

- Desktop and mobile communicate the product loop in under ten seconds.

### Phase 6 — Simple MP4 publish flow

**Timebox:** 2.5 hours
**Cumulative target:** approximately 10.5 hours

Tasks:

1. Implement event picker with latest eligible event preselected.
2. Implement MP4 file chooser; no camera/record button.
3. Read client file type, size and browser video duration.
4. Show preview, title, caption and official event context.
5. Create user-scoped signed upload intent/path.
6. Upload directly to Supabase Storage with determinate progress.
7. Publish Moment metadata through internal API after upload.
8. Return to the match feed and show the new Moment.
9. Implement retry while preserving title/caption/file selection where the browser permits.
10. Add reaction-only copyright copy.

Verification:

- Reject non-MP4, zero-length, >25 MB and duration outside 1-15 seconds.
- Reject closed/retracted/wrong-match event.
- Reject another user's upload path.
- Known H.264 MP4 uploads and plays in Chrome/mobile target.
- No transcoding/processing claim or state exists.

Gate:

- A newly authenticated user publishes and plays one fresh MP4 on the deployed site.

### Phase 7 — Champion, leaderboard and Momentum Meter

**Timebox:** 90 minutes
**Cumulative target:** approximately 12 hours

Tasks:

1. Implement ChampionButton with auth intent preservation.
2. Apply optimistic state only once per request and reconcile RPC result.
3. Display remaining per-match Champion capacity when relevant.
4. Query and render deterministic top-ten leaderboard.
5. Update Momentum Meter using raw counts under five total actions and percentage otherwise.
6. Subscribe to match Moment/Champion invalidations and refetch authoritative aggregates.
7. Implement Champion feedback and leaderboard layout motion.

Verification:

- Two sessions observe the same count/rank after refresh.
- Double-click/retry does not inflate count.
- Sixth distinct Champion attempt is rejected with clear copy.
- Remove works before lock and fails after final lock.

Gate:

- Second session changes the featured Moment's ranking without refresh and remains correct after hard reload.

### Phase 8 — Finalization and winner

**Timebox:** 75 minutes
**Cumulative target:** approximately 13.5 hours

Tasks:

1. Map `F`, `FET` and `FPE` to final; keep exceptional states non-final.
2. Lock Champion actions once, in the same finalization transaction.
3. Select winner with resolved deterministic ordering.
4. Persist immutable winning Moment/count snapshot.
5. Render final scoreboard, linked official event and winner Moment.
6. Implement the reduced/full winner reveal from Animation Spec.
7. Render optional reward UI only when configured.

Verification:

- Multiple final events/calls create one winner.
- Hidden/removed Moment cannot win.
- Tie produces the documented deterministic winner.
- Champion mutation returns locked after finalization.
- Winner page works with reward disabled.

Gate:

- Jump Final produces the same winner three consecutive reset/replay cycles.

### Phase 9 — Consumer energy and trust basics

**Timebox:** 60 minutes maximum
**Priority:** Should Have

Tasks in order:

1. Add flat match chat table/policies/API and Realtime list if time remains.
2. Add five-messages-per-30-seconds enforcement.
3. Add one report action and simple admin hide path.
4. Do not build nested comments. Add Moment comments only after chat and trust are complete.

Cut rule:

- If the core demo is not green, show owned seed discussion as static demo content and skip creation.
- Judge instructions must not ask for comments/chat that do not work.

### Phase 10 — TxLINE provenance

**Timebox:** 45 minutes

Tasks:

1. Build DataProvenanceSheet with current mode and last successful update.
2. List fixture/score snapshot endpoints only when actually used.
3. Add SSE/proof rows only if those calls are present in production.
4. Explain Official TxLINE Data versus Fan-Created Content.
5. In replay mode show original provider fixture ID/time and recorded-data disclosure.

Gate:

- A judge can identify TxLINE's role and current data mode without narration.

### Phase 11 — Choose at most one optional upgrade

**Timebox:** two hours total maximum
**Priority:** Nice To Have

Option A — TxLINE SSE:

- Add only if the host/process is already available.
- Reuse normalizer and idempotent upserts.
- Fall back immediately to snapshot polling.
- Update provenance and submission endpoint list only after deployed verification.

Option B — Devnet reward:

- Add `submitted` settlement state and corrected FKs.
- Use fixed server-configured amount and preconfigured recipient.
- Submit one transfer, persist signature, reconcile confirmation and render Explorer link.
- Never expose key material or blindly resubmit.

Selection rule:

- Prefer SSE if it makes a real active-match demo materially stronger.
- Prefer reward only if the replay demo will show a verified transaction.
- Choose neither when any non-negotiable gate is incomplete.

### Phase 12 — Responsive, motion and accessibility polish

**Timebox:** 2 hours

Tasks:

1. Test 390x844, 768x1024 and 1440x900 plus 320px minimum.
2. Fix layout overflow, safe areas, focus order, dialog focus return and touch targets.
3. Apply remaining high-value motion; cut empty/toast/page flourishes first.
4. Verify `prefers-reduced-motion` for every Must Have animation.
5. Verify muted-first video, labeled controls and Moment caption text alternative.
6. Validate loading, empty, stale, replay and upload-error states.
7. Remove decorative 3D asset if it harms load or layout.

Gate:

- Core path is usable by keyboard and touch with motion reduced/on.

### Phase 13 — Reliability and rehearsal

**Timebox:** 2 hours

Tasks:

1. Run production build, typecheck and repository lint/tests.
2. Test clean anonymous, creator and second-fan sessions.
3. Test TxLINE failure -> cached/replay path.
4. Run replay reset and all guided beats three times.
5. Test MP4 rejection/acceptance, Champion idempotency and finalization races.
6. Verify no service role, TxLINE token or sponsor key appears in browser output/logs.
7. Verify all demo media/team assets are permitted.
8. Freeze the last-known-good deployment.

No-go conditions:

- Replay can appear live.
- Champion count duplicates.
- Winner can change after finalization.
- Non-owner can publish against another upload path.
- Public client receives a server secret.

### Phase 14 — Record and submit

**Timebox:** 3 hours

Tasks:

1. Reset demo seed and open pre-authenticated sessions.
2. Record the 4:35 script against the public deployment.
3. Verify mobile view during the recording.
4. Re-record any take where a core action is ambiguous or mocked.
5. Verify application URL from incognito after recording.
6. Update technical summary and endpoint list to match deployed reality.
7. Write evidence-based TxLINE positives/friction.
8. Provide judge test steps that mention only implemented actions.
9. Submit video, URL, technical notes and feedback.

## Implementation work packages

Use these as the work-tracking units; each ends with a deployable checkpoint.

| Package | Phases | Required evidence |
|---|---|---|
| WP-01 Visible shell | 0-1 | deployed Home/Match at mobile + desktop |
| WP-02 Trusted data core | 2-4 | RLS smoke tests, real fixture, replay beat |
| WP-03 Consumer creation | 5-6 | fresh deployed MP4 Moment linked to event |
| WP-04 Collective decision | 7-8 | two-session Champion + deterministic winner |
| WP-05 Judge clarity | 9-10 | provenance and optional consumer energy |
| WP-06 Optional differentiator | 11 | verified SSE or Explorer receipt, otherwise skipped |
| WP-07 Submission quality | 12-14 | responsive checks, three rehearsals, final video |

## Minimum test matrix

| Area | Happy path | Required failure path |
|---|---|---|
| Auth | magic link returns to pending publish/Champion action | expired/slow link preserves safe retry |
| TxLINE fixture | real fixture normalizes and caches | auth/network failure serves replay/cached truthfully |
| TxLINE score | snapshot creates one event | duplicate/unknown/unconfirmed does not corrupt or prompt |
| Replay | guided beats and reset | repeated control is idempotent |
| Upload | MP4 <=15s/25MB publishes and plays | wrong type/size/duration/path rejected |
| Champion | two users update count/rank | duplicate, cap and final lock enforced |
| Winner | final state selects expected Moment | tie, hidden Moment and duplicate finalization safe |
| Realtime | second session updates | reconnect causes authoritative refetch |
| Responsive | 390px and 1440px complete flow | 320px no page overflow |
| Secrets | server calls succeed | no server token/key in client bundle/network/log |

## Scope freeze and cut policy

At hour 20, no new feature may enter the implementation. At hour 24, no visual redesign may begin.

Cut in this order:

1. Solana reward transfer.
2. TxLINE SSE.
3. Moment comments, then live chat creation.
4. Merkle proof/advanced diagnostics/extra fixture filters.
5. Page/toast/empty-state motion flourishes.
6. Decorative 3D assets.

Never cut:

- Public deployed URL.
- Real TxLINE fixture/score snapshot path or a documented integration blocker plus permitted replay.
- Persistent truthful replay indicator.
- Official event linked to a fan Moment.
- Real direct MP4 upload.
- Real Champion action and authoritative count.
- Responsive match room.
- Final lock and deterministic winner reveal.
- Demo video and accurate submission documentation.

## Definition of implementation readiness

Implementation may begin when:

- The conflict resolutions in this file are accepted as the baseline.
- TxLINE/network status and replay-data permission are known or explicitly marked blocked.
- Supabase and Vercel project access is available.
- Owned MP4 demo media exists.
- Phase 0 expected winner/beat sequence is frozen.

No feature code has been written during this review.
