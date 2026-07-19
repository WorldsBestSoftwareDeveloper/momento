# Momento Design System

> The design system expresses Momento's central promise: official football events become shared social experiences that fans capture, champion and collectively turn into the defining Moment.

## Design language

**Broadcast intensity, editorial clarity, human emotion.** The interface uses deep stadium neutrals and a single electric signal color. Glass is limited to overlays and live-event tokens; core surfaces remain opaque enough for readability and performance.

## Visual reference

See [../assets/momento-ui-concept.png](../assets/momento-ui-concept.png). Production assets should use licensed/owned imagery and generic team treatments until rights are confirmed.

## Color tokens

| Token | Value | Use |
|---|---|---|
| `--canvas` | `#080A0C` | page background |
| `--surface-1` | `#101317` | primary cards |
| `--surface-2` | `#171B20` | elevated/control surfaces |
| `--surface-glass` | `rgba(18,22,26,.76)` | overlays only |
| `--text` | `#F4F2EA` | primary text |
| `--text-muted` | `#9CA3AA` | metadata |
| `--line` | `rgba(255,255,255,.10)` | dividers |
| `--live` | `#C7FF2F` | live, Champion, primary CTA |
| `--live-ink` | `#111500` | text on live |
| `--urgent` | `#FF685F` | cards, errors, urgent events |
| `--info` | `#7AC7FF` | cached/provenance info |
| `--success` | `#57D68D` | confirmed/settled |

Contrast must meet WCAG AA. Electric lime is not body text on off-white; use it for controls/accents against dark surfaces.

## Typography

- Display: **Space Grotesk** or **Geist Sans**, 600-700.
- UI/body: **Inter** or **Geist Sans**, 400-600.
- Numeric scoreboard: tabular numbers enabled.
- Do not add a third font.

| Style | Mobile | Desktop | Line height |
|---|---:|---:|---:|
| Display | 32px | 48px | 1.0 |
| H1 | 28px | 36px | 1.1 |
| H2 | 22px | 28px | 1.2 |
| H3 | 18px | 20px | 1.25 |
| Body | 15px | 16px | 1.5 |
| Label | 12px | 12px | 1.2, uppercase optional |
| Metadata | 12px | 13px | 1.35 |

## Spacing and layout

- 4px base unit: `1, 2, 3, 4, 6, 8, 12, 16` -> 4-64px.
- Mobile page gutter: 16px; tablet: 24px; desktop: 32px.
- Max content width: 1440px.
- Desktop grid: 12 columns, 24px gap.
- Touch targets: minimum 44x44px.
- Dense event rail may use 8-12px internal gaps but never reduce hit areas.

## Radius and borders

- Small control: 10px.
- Card: 16px.
- Sheet/dialog: 24px.
- Pill: 999px.
- Standard border: 1px `--line`.
- Active event: 1px color border plus subtle inset highlight; do not rely only on glow.

## Elevation and glass

- `shadow-card`: `0 12px 36px rgba(0,0,0,.28)`.
- `shadow-float`: `0 20px 64px rgba(0,0,0,.45)`.
- Glass: backdrop blur 16px, only for sticky header, bottom nav, sheets, and 3D/event overlay.
- Provide opaque `--surface-1` fallback and disable heavy blur on lower-power/reduced-transparency contexts.

## Motion

| Token | Duration | Easing | Use |
|---|---:|---|---|
| instant | 100ms | ease-out | press/hover |
| fast | 180ms | cubic-bezier(.2,.8,.2,1) | controls, list state |
| standard | 280ms | same | sheets/cards |
| event | 350ms | spring-like, no bounce excess | official event arrival |
| celebration | 700ms max | ease-out | winner reveal only |

Framer Motion rules: animate opacity/transform, not layout-heavy properties; one focal animation at a time; reduced motion removes translation and repeated pulses.

## Icons and artifacts

- Use Lucide for UI actions at 18/20/24px with consistent 1.75px stroke.
- Use custom simple event glyphs for goal, card, VAR, whistle, and penalty.
- A single chrome football/event token may appear on marketing/empty/winner surfaces. Keep 3D assets outside scrolling Moment cards, under 250 KB WebP/AVIF where possible, and hide decorative variants on small mobile screens.
- Never use unlicensed federation/team crests in production.

## Core component styles

### Buttons

- Primary: live background, dark text, 48px height; label uses verb + object.
- Secondary: surface-2 with border.
- Ghost: transparent, hover/pressed surface.
- Destructive: urgent tint, confirmation for irreversible action.
- Loading retains width and replaces leading icon with spinner.

### Cards

- Moment: media-first 9:16 video surface, metadata overlay gradient and event chip above/below media.
- Match: scoreboard hierarchy, limited chrome, 120-180px height.
- Event: compact pill/card with minute, icon, label, team; confirmation marker.
- Leaderboard: row-first rather than oversized dashboard tile.

### Inputs

- 48px minimum control height; label remains visible.
- Error appears below control; focus ring is 2px `--live` plus 2px canvas offset.
- Chat composer may be 44px compact but still accessible.

### Badges

- `LIVE`: lime dot + text.
- `CACHED`: blue clock + text and timestamp.
- `REPLAY`: neutral/purple play icon + `Recorded data` text.
- `TxLINE verified`: provider mark plus optional proof action; never imply every fan video is verified.

## Content voice

- Energetic and direct: `Capture this moment`, `Champion this Moment`.
- Honest status: `Reconnecting to official match data`.
- No gambling or investment vocabulary.
- Do not overuse exclamation marks; let events provide the energy.

## Accessibility

- AA contrast, 200% zoom support, visible focus, keyboard-operable rail/sheets.
- Video controls are labeled and captions are supported.
- Event arrival is announced once; duplicate/amended events do not spam assistive tech.
- Error copy includes recovery action.
- Avoid continuous parallax, flashing, and motion tied to scrolling.
