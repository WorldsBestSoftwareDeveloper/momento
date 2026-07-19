# Momento Judge Setup

## Recommended demo URL

Deploy the match route and open:

```text
https://YOUR_DOMAIN/matches/france-spain-demo?mode=replay
```

The header must show `Demo Replay • Recorded TxLINE Data`. Start the seven-beat replay to demonstrate official events updating the score, clock, timeline, capture window, Moments, and community experience.

## TxLINE evidence

Momento uses TxLINE fixture `18237038` (France vs Spain, World Cup semi-final) through:

1. `/api/fixtures/snapshot` for canonical teams and competition metadata.
2. `/api/scores/historical/18237038` for deterministic replay events.
3. `/api/scores/snapshot/18237038` for the latest official match state.
4. `/api/scores/stream` for live Server-Sent Events.

All payloads pass through `lib/txline/mapper.ts` before reaching the UI. The browser never receives the guest JWT or API token.

## Vercel environment variables

Add these under **Project Settings → Environment Variables** for Production, Preview, and Development:

### Required for TxLINE replay and live data

```env
DEMO_MODE=true
DEMO_FIXTURE_ID=france-spain-demo
TXLINE_API_ORIGIN=https://txline-dev.txodds.com
TXLINE_FIXTURE_ID=18237038
TXLINE_GUEST_JWT=your-guest-jwt
TXLINE_API_TOKEN=your-api-token
```

Set `DEMO_MODE=true` for the judging deployment. Judges can still test live architecture with `?mode=live`.
The match page also exposes a visible Replay/Live switch so judges can change sources without editing the URL.

### Required for Supabase community realtime

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

### Application URL

```env
NEXT_PUBLIC_APP_URL=https://YOUR_DOMAIN
```

### Optional Solana creator reward

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_REWARDS_ENABLED=true
NEXT_PUBLIC_REWARD_AMOUNT_SOL=0.25
NEXT_PUBLIC_REWARD_CREATOR_WALLET=your-demo-creator-public-address
NEXT_PUBLIC_TREASURY_ADDRESS=your-devnet-treasury-public-address
OPINION_MARKET_ENABLED=true
```

Leave the creator address blank only when judges should be able to claim from any connected Devnet wallet. No private key is used or deployed. See `WALLET_SETUP.md` for Phantom/Solflare and Devnet instructions.

Do not deploy `TXLINE_WALLET_PATH`, wallet JSON, private keys, `TXLINE_RPC_URL`, or a Supabase service-role key. They are activation/local-operator values, not application runtime values.

After changing variables, redeploy the latest commit.

## Failure demonstration

- Missing TxLINE secrets: live mode displays setup guidance; replay stays usable.
- SSE interruption: the browser reconnects automatically and starts 15-second snapshot polling until the stream returns.
- Expired guest JWT: the server requests a fresh guest session and retries once using the existing activated API token.
- Historical endpoint unavailable: a labeled bundled normalized recording preserves the five-minute demo.

## Video checklist

- State the problem and Momento positioning.
- Show `Powered by TxLINE` and the replay disclosure.
- Advance the official historical timeline.
- Capture/upload a Moment.
- Champion it from another session and add a realtime comment.
- Explain the four TxLINE endpoints above.
- Show the deployed URL and responsive mobile layout.
