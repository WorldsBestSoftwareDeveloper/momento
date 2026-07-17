# Momento

Momento transforms every official football event into a shared social experience where fans capture, champion and collectively decide the defining moment of every match.

The hackathon build uses TxLINE for canonical fixtures, official score actions, historical replay, and live SSE updates. UI components receive one normalized match model and never access TxLINE credentials or raw payloads.

## Run locally

Requirements: Node.js 20+, npm, and optional TxLINE/Supabase credentials.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000/matches/france-spain-demo`.

- `?mode=replay` selects deterministic historical replay.
- `?mode=live` selects authenticated snapshots and SSE.
- The match-room Replay/Live switch changes the same query flag without changing UI components.
- Without TxLINE credentials, replay remains available and live mode shows setup guidance.
- Without Supabase credentials, community interactions use the local demo repository.

## TxLINE server configuration

```env
DEMO_MODE=true
DEMO_FIXTURE_ID=france-spain-demo
TXLINE_API_ORIGIN=https://txline-dev.txodds.com
TXLINE_FIXTURE_ID=18237038
TXLINE_GUEST_JWT=your-guest-jwt
TXLINE_API_TOKEN=your-activated-api-token
```

`TXLINE_GUEST_JWT` and `TXLINE_API_TOKEN` are server-only. Never prefix them with `NEXT_PUBLIC_`.

Devnet activation is available through `npx tsx scripts/activate-txline.ts`. It uses service level 1 for four weeks with `SELECTED_LEAGUES=[]`, saves nothing, and prints the credentials for manual storage.

## Data paths

- Fixtures: `GET /api/fixtures/snapshot`
- Score snapshot: `GET /api/scores/snapshot/{fixtureId}`
- Historical replay: `GET /api/scores/historical/{fixtureId}`
- Live score stream: `GET /api/scores/stream`

The browser connects only to Momento’s normalized `/api/txline/match` and `/api/txline/stream` routes.

## Solana creator rewards

Milestone 6 uses the official Solana Wallet Adapter packages for optional Phantom/Solflare connections. The social product remains fully usable without a wallet. A connected winning creator can claim a configurable Devnet demo reward and open its confirmed transaction in Solana Explorer.

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_REWARDS_ENABLED=true
NEXT_PUBLIC_REWARD_AMOUNT_SOL=0.25
NEXT_PUBLIC_REWARD_CREATOR_WALLET=
```

See [WALLET_SETUP.md](WALLET_SETUP.md). Never configure a private key or seed phrase.

## Opinion Market treasury

Replay mode deterministically demonstrates community pools and 70/20/10 settlement while clearly labeling those entries as demo records. To create or reuse a private local Devnet treasury and attempt faucet funding, run `npm run treasury:setup`. The script stores key material only under the gitignored `.secrets` directory and prints the public address for `NEXT_PUBLIC_TREASURY_ADDRESS`. Never deploy the wallet file or expose it through a `NEXT_PUBLIC_` variable.

## Validation

```powershell
npm run typecheck
npm run lint
npm run build
```

See [JUDGE_SETUP.md](JUDGE_SETUP.md) for the demo and deployment checklist.
