# Momento Animation Specification

> Motion should make official football events feel immediate and shared, then make Champion actions feel consequential. It must never make replay look live or turn the product into a game of flashing effects.

## Motion principles

1. **Broadcast, not casino:** decisive cuts, score ticks and event sweeps; no slot-machine motion, coins or endless glow.
2. **One focal event:** only one high-emphasis animation may run at a time.
3. **Official before social:** an official event lands first; the Capture CTA responds second; Moment cards follow.
4. **Transform and opacity:** prefer GPU-friendly `transform` and `opacity`; avoid animating layout dimensions.
5. **Short by default:** routine motion ends within 280 ms; event/winner sequences may take up to 900 ms.
6. **Accessible:** reduced-motion mode removes translation, scale overshoot, loops and particle effects while preserving state changes.

## Motion tokens

| Token | Value | Use |
|---|---:|---|
| `instant` | 100 ms | press, focus and tiny status feedback |
| `fast` | 180 ms | controls and count changes |
| `standard` | 260 ms | cards, sheets and page elements |
| `event` | 360 ms | official event arrival |
| `hero` | 700-900 ms | goal and winner sequences only |
| `ease-out` | `[0.16, 1, 0.3, 1]` | entrances |
| `ease-in` | `[0.7, 0, 0.84, 0]` | exits |
| `spring-soft` | stiffness 340, damping 28, mass 0.8 | CTA/button feedback |
| `spring-score` | stiffness 420, damping 34, mass 0.7 | score digit change |

Stagger lists by 35-55 ms and cap total stagger at 220 ms.

## Priority tiers

- **Must Have:** new official event, Capture pulse, upload progress, Moment entrance, Champion feedback, score update, Momentum Meter, winner reveal, leaderboard update, skeletons and errors.
- **Should Have:** goal-specific halo, page transitions, empty-state reveal and polished toasts.
- **Nice To Have:** subtle 3D artifact reaction on winner screen. It must not affect layout or performance.

## Goal event

**Trigger:** a newly received, confirmed TxLINE goal not seen in the current client session.

**Sequence:**

1. Scoreboard border brightens from neutral to `--live` over 180 ms.
2. Changed score digit exits 8px upward at 0 opacity over 120 ms.
3. New digit enters from 10px below with `spring-score`, settling within 260 ms.
4. Goal event token sweeps into the rail over 360 ms.
5. A single soft radial stadium glow expands behind the score from 0.85 to 1.08 scale and fades over 700 ms.
6. After a 160 ms pause, the Capture CTA performs its one-time pulse.

No confetti, coins or repeated flashing. Unconfirmed goals use the normal official-event animation and an `Awaiting confirmation` treatment; they do not trigger the hero goal sequence.

**Reduced motion:** instant score replacement plus a 600 ms border-color highlight.

## New official event

**Trigger:** confirmed official event insert.

- Token enters from the rail's forward direction by 18px and fades in over 300-360 ms.
- The rail scrolls the token into view over 260 ms only if the user has not manually scrolled in the last 3 seconds.
- Event icon scales from 0.92 to 1 with no overshoot.
- An `aria-live="polite"` announcement fires once after visual settlement.
- Amendments cross-fade the existing token over 180 ms; do not create a second arrival.

## Capture CTA pulse

**Trigger:** once when a new capture-eligible confirmed event opens.

- Button scales `1 -> 1.055 -> 1` using `spring-soft` over approximately 420 ms.
- Outer ring expands from 100% to 128% and opacity `0.32 -> 0` over 650 ms.
- Label may change to `Capture this goal` or event type using a 140 ms cross-fade.
- Never loop. Do not pulse when the Capture sheet is already open.

**Reduced motion:** background color brightens for 500 ms.

## Moment upload

**States:** validating, uploading, publishing, complete, retry.

- Preview settles in with a 180 ms fade.
- Determinate progress bar uses a linear width transition of 120 ms between measured byte updates; never fake progress beyond actual upload percent.
- While publishing metadata, freeze the bar at 100% and cross-fade label to `Publishing Moment…`.
- On complete, the progress surface compresses vertically by 6px and changes to a check state over 220 ms; immediately transition to the new Moment card.
- On failure, retain current percentage and apply the error animation below. Do not reset the UI to zero until retry starts.

There are no animation states for transcoding, compression or processing because those systems do not exist.

## Moment card entrance

**Trigger:** initial feed load or newly published Moment.

- Initial feed: cards fade from 0 and translate 12px upward over 260 ms with 45 ms stagger, maximum five animated cards.
- Newly published card: insert at its sorted position, scale `0.97 -> 1` and fade over 280 ms; apply a 900 ms low-opacity `--live` border that fades to normal.
- Do not autoplay until the entrance finishes and the card meets the visibility threshold.
- Resorting must use layout animation capped at 320 ms.

## Champion animation

**Trigger:** server-accepted Champion action.

1. Button press scales to 0.96 for 90 ms.
2. Crest/star icon fills from bottom to top over 220 ms.
3. A single outline ring expands and fades over 420 ms.
4. `Champion` changes to `Championed` with a 140 ms cross-fade.
5. Count ticks once using the score-digit pattern.

Optimistic feedback begins on press, but a rejected server response reverses within 180 ms and shows the specific reason. Removing a Champion uses a simple 160 ms icon unfill—no negative shake or guilt-inducing copy.

**Avoid:** hearts bursting across the screen, coins, fireworks or repeated haptics.

## Live score update

- Only changed digits animate.
- Old digit translates 8px upward/fades over 120 ms; new digit enters 10px below using `spring-score`.
- Team name and unchanged score remain still.
- Match phase/minute cross-fades over 140 ms.
- Reconciliation to a corrected score uses a neutral 240 ms cross-fade and `Corrected` indicator, not a goal celebration.

## Momentum Meter

The meter communicates share of Champion actions, never probability.

- First render animates from the previous known value, not always zero, over 500 ms.
- Champion updates interpolate the arc/bar over 320 ms with `ease-out`.
- Numeric percentage/count ticks over 180 ms.
- Leading-Moment change cross-fades creator thumbnail/title over 220 ms after the meter settles.
- If fewer than five total Champion actions exist, display raw counts instead of a dramatic percentage animation.

## Winner reveal

**Trigger:** one confirmed match finalization and winner record.

**Total duration:** 850-900 ms.

1. Final scoreboard locks with a 180 ms border highlight.
2. Background content dims to 0.72 opacity over 220 ms.
3. Winning Moment rises 20px and fades in over 360 ms.
4. Crown/defining-Moment mark draws once over 420 ms.
5. `Moment of the Match` and Champion total enter with 55 ms stagger.
6. One restrained lime/silver light sweep crosses the winner card over 500 ms.

Do not use full-screen confetti. The video remains paused until the user plays it.

**Reduced motion:** immediate winner card with a static highlight.

## Leaderboard update

- Reorder rows with Framer Motion layout animation, 280-320 ms.
- Changed row receives a 600 ms subtle surface tint.
- Rank number ticks/cross-fades; the entire list must not fade out.
- Preserve focus and scroll position.
- When Champion actions lock, a top-down 180 ms lock-state cross-fade occurs once.

## Page transitions

- Route content fades `0 -> 1` and translates `8px -> 0` over 220 ms.
- Shared match header remains stable between lobby and match room when feasible.
- Exit animation is at most 100 ms; navigation must never wait on motion.
- Back navigation restores scroll without replaying card stagger.

## Skeleton loading

- Use shape-matched scoreboard, event-token and Moment-card skeletons.
- A low-contrast shimmer moves left-to-right over 1.4 seconds, maximum two loops before switching to a gentle opacity breathe.
- Skeletons never animate in reduced-motion mode.
- Keep real layout dimensions to avoid content shift.

## Empty states

- Icon/artifact fades in over 220 ms.
- Title and body enter with 40 ms stagger; CTA follows after 80 ms.
- The artifact may float once by 4px, then stays still.
- For `No Moments yet`, the Capture CTA receives one pulse only when an eligible event exists.

## Toasts

- Enter from 12px below and fade over 180 ms; exit in 120 ms.
- Auto-dismiss success/info after 3.5 seconds; errors remain until dismissed or resolved.
- Stack at most three; collapse older informational toasts.
- Essential failures must also appear inline—never toast-only.

## Error animations

- Field error: border/color transition over 140 ms and one 3px horizontal nudge in each direction, total 180 ms.
- Upload/provider banner: fade/slide 8px over 220 ms.
- Champion rejection: reverse optimistic fill over 180 ms; no repeated shake.
- Reconnecting indicator: rotate a small icon at a calm 1.2-second cycle; stop immediately when connected.
- Never flash red backgrounds or move large page regions.

## Performance and acceptance

- Target 60 fps on a mid-range mobile device.
- Animate no more than five feed cards on first render.
- Decorative 3D motion is disabled under 768px and under reduced motion.
- Motion never delays input, navigation, publishing or data updates.
- Test at 390x844 and 1440x900 with reduced motion on and off.
