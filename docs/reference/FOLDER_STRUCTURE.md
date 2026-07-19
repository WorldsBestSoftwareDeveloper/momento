# Momento Recommended Folder Structure

> Keep the 30-hour build in one Next.js application. This document refines the recommendation only; it does not create or move implementation folders.

## Recommended shape

```text
momento/
├─ app/
│  ├─ page.tsx                     # Home / featured fixture
│  ├─ matches/[matchId]/page.tsx   # Match room
│  ├─ moments/[momentId]/page.tsx  # Moment detail
│  ├─ profile/page.tsx
│  ├─ admin/demo/page.tsx          # protected replay controls
│  ├─ auth/callback/route.ts
│  ├─ api/
│  │  ├─ matches/
│  │  ├─ moments/
│  │  ├─ uploads/intent/route.ts
│  │  ├─ reports/route.ts
│  │  └─ admin/
│  ├─ layout.tsx
│  └─ globals.css
├─ components/
│  ├─ ui/                          # shadcn primitives
│  ├─ shell/
│  ├─ match/
│  ├─ moment/
│  ├─ community/
│  └─ demo/
├─ lib/
│  ├─ supabase/
│  ├─ txline/
│  │  ├─ client.ts                 # server-only snapshots
│  │  ├─ schemas.ts
│  │  ├─ normalize-soccer.ts
│  │  └─ replay-fixture.ts         # sanitized authorized data
│  ├─ validation/
│  ├─ champion.ts
│  ├─ replay.ts
│  ├─ rewards.ts                   # optional devnet transfer only
│  ├─ env.ts
│  └─ errors.ts
├─ public/
│  ├─ brand/
│  └─ demo/                        # owned MP4 samples only
├─ supabase/
│  ├─ migrations/
│  └─ seed.sql
├─ scripts/
│  ├─ seed-demo.ts
│  └─ reset-demo.ts
├─ docs/
│  └─ assets/
│     └─ momento-ui-concept.png
├─ PRODUCT_REQUIREMENTS.md
├─ SYSTEM_ARCHITECTURE.md
├─ DATABASE_SCHEMA.md
├─ TXLINE_INTEGRATION.md
├─ API_SPEC.md
├─ SOLANA_ARCHITECTURE.md
├─ UI_UX_SPEC.md
├─ ANIMATION_SPEC.md
├─ DESIGN_SYSTEM.md
├─ COMPONENT_LIBRARY.md
├─ FEATURE_BREAKDOWN.md
├─ BUILD_ORDER.md
├─ DEMO_SCRIPT.md
├─ DEMO_REPLAY_SPEC.md
├─ HACKATHON_WIN_STRATEGY.md
├─ RISKS_AND_BACKUPS.md
├─ FOLDER_STRUCTURE.md
├─ .env.example
├─ package.json
└─ README.md
```

## Boundary rules

- TxLINE credentials and calls remain server-only under `lib/txline`.
- Raw TxLINE responses are normalized before reaching React components.
- Supabase mutations live in route handlers or small database RPCs, not UI components.
- Replay calls the same normalizer used by TxLINE snapshots.
- Keep demo controls isolated and protected.
- Add no separate worker, monorepo package or shared-config package unless optional SSE is implemented after the full demo works.
- Keep the original MP4 in Supabase Storage; do not create media-processing folders or jobs.

## Environment variable names

```text
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TXLINE_NETWORK=devnet
TXLINE_API_ORIGIN=
TXLINE_GUEST_JWT=
TXLINE_API_TOKEN=
TXLINE_PROGRAM_ID=
SOLANA_RPC_URL=
SOLANA_REWARD_ENABLED=false
SOLANA_SPONSOR_SECRET_KEY=
DEMO_REPLAY_ENABLED=true
DEMO_ADMIN_EMAIL=
```

Never prefix server secrets with `NEXT_PUBLIC_`.

## Migration order

1. Profiles and auth trigger.
2. Matches and official events.
3. Moments and MP4 Storage policy.
4. Champions and atomic toggle.
5. Winner and replay state.
6. Optional chat/reports/reward row.

## Replay fixtures

Keep one sanitized fixture snapshot and one score sequence in `lib/txline/replay-fixture.ts` or a JSON sibling. Document source date, endpoint, redaction and expected normalized result. Never commit JWTs, API tokens, private keys or unowned media.
