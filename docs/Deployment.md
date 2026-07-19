# Momento Deployment Guide

Momento is deployed at [themomento.xyz](https://themomento.xyz) from the public [GitHub repository](https://github.com/WorldsBestSoftwareDeveloper/momento). It is designed for Vercel with Supabase, TxLINE Devnet, and optional Solana Devnet integrations.

## Vercel deployment

1. Import the GitHub repository into Vercel.
2. Configure the variables documented in [`.env.example`](../.env.example).
3. Keep `TXLINE_GUEST_JWT` and `TXLINE_API_TOKEN` server-only.
4. Set `NEXT_PUBLIC_APP_URL` to `https://themomento.xyz`.
5. Deploy, then verify both canonical routes:
   - `/matches/france-spain-demo?mode=replay`
   - `/matches/france-spain-demo?mode=live`

## Supabase

1. Create a Supabase project.
2. Apply the SQL files in [`supabase/migrations`](../supabase/migrations/).
3. Add the required tables to the Supabase Realtime publication.
4. Create the public Moment-media Storage bucket and apply upload/read policies.
5. Add only the project URL and public anonymous key to Vercel.
6. Never expose a service-role key.

Without Supabase, Momento falls back to local repositories. Cross-device persistence, public media, and Realtime require Supabase.

## TxLINE

Activate TxLINE on Devnet locally, then add `TXLINE_API_ORIGIN`, `TXLINE_FIXTURE_ID`, `TXLINE_GUEST_JWT`, and `TXLINE_API_TOKEN` to Vercel. Never deploy an activation wallet or `TXLINE_WALLET_PATH`. See [TxLINE integration](TxLINE.md) and [wallet setup](reference/WALLET_SETUP.md).

## Solana Devnet

Set `NEXT_PUBLIC_SOLANA_RPC_URL` to a reliable Devnet RPC. Create or reuse a dedicated treasury with:

```bash
npm run treasury:setup
```

Fund the printed public address with Devnet SOL and set `NEXT_PUBLIC_TREASURY_ADDRESS`. Users approve every Support transfer explicitly through Solana Wallet Adapter. Never deploy the treasury keypair or a private key.

## Production validation

```bash
npm run typecheck
npm run lint
npm run build
```

After deployment, verify TxLINE status and fallback labeling, a cross-device Supabase update, public MP4 playback, wallet-free replay, and a signed Live Mode Support transaction with its Explorer receipt.

## Judge operations

The complete environment matrix, failure demonstration, and video checklist are preserved in the [judge setup reference](reference/JUDGE_SETUP.md).
