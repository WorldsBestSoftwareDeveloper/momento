# Momento Component Library

> Components serve the visible loop: official TxLINE event -> capture -> Champion -> defining Moment.

## Principles

- Components receive normalized Momento types, never raw TxLINE payloads.
- Server components fetch; client components own interaction only where required.
- Every async component documents loading, empty, error, and stale states.
- Variants are semantic (`live`, `cached`, `replay`), not arbitrary color props.

## Foundations

| Component | Responsibility | Key props/state |
|---|---|---|
| `AppShell` | responsive header/bottom nav/content canvas | active route, data status |
| `PageHeader` | title, context, actions | title, eyebrow, action slot |
| `Surface` | standard card/elevation | level, interactive |
| `StatusBadge` | semantic system status | status, label, timestamp |
| `DataModeBadge` | live/cached/replay truth | mode, updatedAt |
| `EmptyState` | focused recovery | icon/artifact, title, body, CTA |
| `ErrorNotice` | inline recoverable error | code, retry, compact |
| `Skeleton` | shape-matched loading | variant |
| `SignedMedia` | signed URL refresh wrapper | path, type, expiry |

## Match and TxLINE components

### `MatchCard`

Fixture discovery card with teams, kickoff, score/state, Moment count, and data provenance. Variants: `live`, `upcoming`, `final`, `replay`.

### `MatchScoreboard`

Canonical teams, score, match phase/minute, freshness. Does not fetch data itself. Handles extra time and penalties without compressing names beyond readability.

### `TxlineAttribution`

Compact attribution with tooltip/sheet explaining which facts are provider-backed. Never wraps a Moment video as verified.

### `OfficialEventRail`

Ordered, keyboard-scrollable event list. Inputs: normalized events, selected ID, mode. Centers a newly selected event without trapping horizontal scroll.

### `OfficialEventToken`

Minute, glyph, title, team, confirmed/amended state. Emits selection only.

### `CaptureWindowBanner`

Shows eligible event and remaining window. Hidden if no eligible event; replay variant says `Replay capture enabled`.

### `ProviderFreshness`

Human-readable freshness and reconnect state. Uses server-provided thresholds.

## Moment components

### `MomentCard`

9:16 video, creator, 15s duration, event chip and Champion action/count. Variants: feed, compact, winner. Video activation is controlled by feed visibility.

### `VideoPlayer`

Muted-first inline MP4 player with duration, play/pause, mute, progress, captions hook and error fallback. Only one feed video plays at once.

### `MomentComposer`

State machine: event -> source -> validate -> describe -> upload -> publish -> success. Persists draft metadata in memory/session storage, never the video blob long term.

### `VideoSourcePicker`

MP4 file chooser with copyright reminder. It accepts one `video/mp4` file, <=15 seconds and <=25 MB.

### `UploadProgress`

Determinate byte progress and retry. There is no transcoding, compression or background media state.

### `OfficialEventChip`

Links Moment to event minute/type and opens event context sheet.

### `ChampionButton`

Optimistic but reconciled action. Props include championed, count, locked and remaining cap. Requires auth callback and accessible pressed state.

### `MomentumMeter`

Shows the leading Moment's share of valid Champion actions or raw Champion count. Never implies probability or expected return. Avoid a percentage when the denominator is too small; show counts instead.

## Community components

| Component | Responsibility |
|---|---|
| `LeaderboardList` | ranked eligible Moments with live/final state |
| `LeaderboardRow` | rank, creator, event, Champion count, winner state |
| `CommentList` | paginated nested-one-level comments |
| `CommentComposer` | validated, rate-limited comment entry |
| `ChatPanel` | match messages, connection state, composer |
| `MessageRow` | avatar, handle, message, time, report menu |
| `ReportDialog` | reason selection and optional detail |
| `CreatorBadge` | public identity and optional win count |

## Winner and optional reward components

| Component | Responsibility |
|---|---|
| `WinnerReveal` | final score, winning Moment, restrained celebration |
| `RewardStatusCard` | not configured/pending/submitted/confirmed/failed |
| `ExplorerLink` | network-safe transaction link with abbreviated signature |

## Navigation and overlays

| Component | Notes |
|---|---|
| `DesktopHeader` | compact, 64px; no duplicate subnav |
| `MobileBottomNav` | safe-area aware; central Capture action |
| `CaptureEventSheet` | mobile full-height; desktop dialog |
| `MomentDetailSheet` | quick view from feed, deep link supported |
| `RankingSheet` | mobile collapse/expand; no hidden Champion action |
| `DataProvenanceSheet` | endpoint/mode/freshness explainer |
| `AuthIntentDialog` | preserves pending action across sign-in |

## Admin/demo components

- `ReplayControlPanel`: start, pause, next beat, final, reset.
- `IntegrationHealthCard`: last snapshot time, data mode and replay state.
- `SeedControls`: create/remove only scoped demo content.
- `SettlementPanel`: winner, recipient, amount, explicit confirmation, signature.

## Component ownership map

| Feature | Composed components |
|---|---|
| Home | AppShell, MatchCard, DataModeBadge, EmptyState |
| Match room | MatchScoreboard, OfficialEventRail, MomentCard, MomentumMeter, ChatPanel |
| Capture | CaptureEventSheet, MomentComposer, VideoSourcePicker, UploadProgress |
| Moment detail | VideoPlayer, OfficialEventChip, ChampionButton, CommentList |
| Winner | WinnerReveal, RewardStatusCard, TxlineAttribution, ExplorerLink |

## Testing priority

- Unit: event token mapping, data mode copy, Champion state, upload validation and winner rows.
- Component: composer transitions, auth intent restoration and snapshot/realtime reconnect banners.
- Accessibility: keyboard rail, dialogs/sheets focus return, aria-live score, video controls.
- Visual: Match room at 390x844, 768x1024, 1440x900.
