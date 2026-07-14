# Momento Product Requirements

> **Central positioning:** Momento transforms every official football event into a shared social experience where fans capture, champion and collectively decide the defining moment of every match.

## Document status

- Product: Momento
- Tagline: **Capture the Moment. Champion It. Relive It.**
- Version: Hackathon MVP 1.0
- Planning date: 2026-07-14
- Delivery constraint: a polished, working demo in approximately 30 hours
- Primary data source: [TxLINE](https://txline.txodds.com/documentation/worldcup)

## Product thesis

**Momento transforms every official football event into a shared social experience where fans capture, champion and collectively decide the defining moment of every match.** TxLINE provides the canonical fixture, match state, score and event timeline. Fans answer those official events with short reaction videos, champion the reactions that best express the match, and create a community-owned memory of what mattered most.

Momento is not a sportsbook. **Champion** is a free fan endorsement, not a wager; it has no odds, stake, cash-out or promised financial return. A sponsor may optionally reward the creator whose Moment the community champions after the match.

## Terminology decision

| Option | Consumer appeal | Clarity | Legal safety | Decision |
|---|---|---|---|---|
| Champion | Active, positive and distinctive | Clear after one line of onboarding | Strong; does not imply money or return | **Chosen** |
| Support | Familiar but generic | Immediately clear | Strong | Rejected because it is not memorable |
| Back | Energetic and short | Can imply financial backing | Weaker for a reward-adjacent product | Rejected |

Primary CTA: **Champion**. Confirmed state: **Championed**. Metric: **Champion count**. Do not use Champion as a noun for the creator; the creator is the `Moment of the Match winner`.

## Problem

Football discussion is fragmented across broadcast chats, social networks, and group messages. Reactions lose their relationship to the official event that caused them, and the best fan-created moments are difficult to find after the match.

## Product promise

TxLINE establishes what officially happened. Momento lets fans turn it into a shared memory by capturing a reaction, championing the most defining response and collectively choosing Moment of the Match.

## Goals and success measures

| Goal | MVP measure | Demo proof |
|---|---:|---|
| Make TxLINE indispensable | 100% of match rooms derive fixture/event identity from TxLINE-shaped data | Live-data badge, event rail, event-linked capture, final whistle |
| Deliver a premium consumer experience | Core flow works at 390px and 1440px without horizontal page overflow | Desktop and mobile walkthrough |
| Create a working social loop | Upload, publish, champion, comment and rank work end-to-end | Two accounts or seeded users change the leaderboard |
| Keep the demo reliable | Replay mode can reproduce a complete match flow without an active fixture | Demo fixture replays cached TxLINE payloads |
| Keep blockchain additive | Community result works without blockchain; one optional reward receipt | Winner card may link to Solana Explorer |

## Personas

### The live reactor

Watches the match with a phone nearby, wants to post instantly, and values a fast capture flow more than editing tools.

### The fan curator

Does not upload often but scrolls, comments and champions Moments. Wants clear proof that reactions correspond to real match events.

### The creator

Builds a reputation through expressive short videos. Wants attribution, rankings, shareable results, and a clear prize status.

### The judge or partner

Needs to understand the TxLINE integration in seconds, test a complete flow, and distinguish live, cached, and user-generated data.

## Core concepts

- **Fixture:** a TxLINE match, keyed by `fixtureId`.
- **Official event:** a normalized TxLINE score action such as goal, penalty, card, save/shot, VAR, phase change, or final whistle.
- **Capture window:** the period after an eligible official event during which a fan can attach a new Moment. Default: 180 seconds live; unrestricted in demo replay.
- **Moment:** a fan-created video, title, caption, and event association.
- **Champion:** the free action a fan takes to elevate one Moment. A fan may champion each Moment at most once and up to five distinct Moments in a match.
- **Moment of the Match:** the eligible Moment with the highest valid Champion count after the fixture becomes final and moderation checks pass.
- **Data mode:** `LIVE`, `CACHED`, or `REPLAY`, always visible to avoid misrepresenting provenance.

## MVP scope

### Required

1. Guest browsing and Supabase email magic-link authentication.
2. Home screen with covered fixtures sourced from the server's TxLINE adapter.
3. Match room with scoreboard, official event rail, Moments feed, Champion totals and live discussion.
4. TxLINE fixture snapshot ingestion and score snapshot ingestion.
5. Score snapshot polling every 10 seconds, with Supabase Realtime fan-out after normalization.
6. Replay mode backed by captured, immutable TxLINE-shaped JSON for demo reliability.
7. A deliberately simple MP4 upload: 15 seconds maximum, 25 MB maximum, direct to Supabase Storage, then Moment publishing.
8. One Champion action per user per Moment; idempotent writes and live count updates.
9. Comments/live chat with basic rate limiting and report action.
10. Post-match winner calculation and a visible reward status.
11. Optional sponsor-to-preconfigured-winner transfer on Solana devnet; no wallet onboarding in the core flow.
12. About/Data Provenance sheet listing the TxLINE endpoints used and current mode.

### Explicitly out of scope

- Real-money staking, odds, markets, deposits, custody, or cash-out.
- On-chain Champion actions/voting, custom Anchor programs, tokens or NFTs.
- Video transcoding, compression services, thumbnail workers or background media processing.
- Video editing, filters, duets, direct messaging, or follow graphs.
- Full tournament brackets, fantasy teams, personalized recommendations, or push notifications.
- Automated content moderation beyond file validation, text filters, reports, and admin hide.
- Multi-language localization.

## User stories and acceptance criteria

### Discover a match

As a fan, I can see live/upcoming/recent covered fixtures so that I know where to participate.

- Fixture cards show teams, UTC/local kickoff, state, and current score when known.
- Each card shows `TxLINE verified`, plus live/cached/replay mode.
- An empty state explains when no covered fixture is available and offers the demo replay.

### Follow official events

As a fan, I can distinguish official match facts from fan content.

- Official events use a compact broadcast rail and TxLINE provenance marker.
- Duplicate or amended events do not create duplicate capture prompts.
- Unconfirmed events are visually marked and cannot finalize a winner association until confirmed.

### Create a Moment

As a creator, I can attach a short reaction to an official event.

- Authentication is requested only when publishing.
- Video must be MP4, no more than 15 seconds and no more than 25 MB.
- Title is 3-60 characters; caption is optional up to 220 characters.
- The chosen event, match minute, and team context are visible before publish.
- Upload progress, retry and failure recovery are present.
- The original MP4 uploads directly to Supabase Storage. There is no transcoding, compression service or background processing.

### Champion a Moment

As a fan, I can champion a Moment without financial risk.

- The action is free and labeled `Champion`, never `Back`, `Bet`, `Stake` or `Buy`.
- Repeating the action removes the Champion before final whistle.
- Counts update optimistically, then reconcile with the server.
- The server enforces uniqueness and per-match caps.

### Discuss live

As a fan, I can comment on a Moment or participate in the match chat.

- New messages appear via Supabase Realtime.
- A user may post at most five messages per 30 seconds.
- Users can report content; hidden content disappears without destroying audit records.

### See the winner

As a fan, I can see why a Moment won and whether a reward was delivered.

- Winner selection begins only after TxLINE final states `F`, `FET`, or `FPE`.
- The winner card shows Champion count, creator, official linked event and reward state.
- Ties resolve by earliest time reaching the final Champion count, then earliest publish time.

## Primary journey

1. Open Home and select a live or replay fixture.
2. Observe official events arrive on the TxLINE rail.
3. Select an event and tap **Capture**.
4. Record/select a video, add title/caption, and publish.
5. Another fan champions it and comments.
6. The Momentum Meter and ranking change live.
7. Final whistle locks Champion actions.
8. The winner is declared; optional Solana reward is sent and linked.

## Business and trust rules

- UGC is owned by its uploader; Momento must not imply rights to broadcast footage.
- The capture UI warns users to upload their own reaction, not copyrighted match footage.
- TxLINE and TxODDS attribution must follow their current terms; do not use official team marks unless licensed.
- Prize language must be sponsor-funded and community-selection based, not a return on a user's Champion action.
- Every screen that displays sports facts exposes the data timestamp and mode.

## Roadmap

### After hackathon

- Creator follows and personalized feeds.
- Clip trimming, captions, accessibility transcripts, and automated moderation.
- Club/brand-sponsored match rooms and prize pools.
- Shareable event/Moment deep links and notification subscriptions.
- Multi-competition TxLINE coverage and historical match archives.
- Reputation-weighted community curation with transparent anti-abuse controls.

### Long term

- Licensed broadcast companion experiences.
- Stadium and watch-party modes.
- Creator monetization, sponsor challenges, and verified fan communities.

## Launch gates

- TxLINE credentials and selected network are confirmed.
- One historical or captured fixture replay exists.
- Upload/Champion/comment flows work on a deployed URL.
- No TxLINE secret is shipped to the browser.
- The demo can complete with live upstream unavailable.
- Privacy, content policy, terms, and prize wording have a minimum viable review.
