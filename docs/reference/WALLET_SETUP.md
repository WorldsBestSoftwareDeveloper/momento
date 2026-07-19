# Momento Wallet and Creator Reward Setup

Momento uses the official Solana Wallet Adapter on **Devnet only**. A wallet is never required to browse matches, upload a Moment, Champion, or comment. Connecting a wallet unlocks only the optional creator-reward claim.

## 1. Install Phantom or Solflare

- Install [Phantom](https://phantom.com/download) or [Solflare](https://www.solflare.com/).
- Create or import a wallet directly inside the wallet application.
- Momento will never request, receive, or store a seed phrase or private key.

## 2. Use Solana Devnet

Enable testnet/Devnet mode in the wallet’s developer settings when the wallet exposes a network selector. Momento’s application connection is locked to Solana Devnet and every Explorer link includes `cluster=devnet`.

## 3. Configure the application

Add these public values to `.env.local` and Vercel:

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_REWARDS_ENABLED=true
NEXT_PUBLIC_REWARD_AMOUNT_SOL=0.25
NEXT_PUBLIC_REWARD_CREATOR_WALLET=
```

- `NEXT_PUBLIC_SOLANA_RPC_URL` may be replaced with a reliable third-party Devnet RPC URL.
- `NEXT_PUBLIC_REWARD_AMOUNT_SOL` is capped at 1 SOL by the demo configuration.
- Set `NEXT_PUBLIC_REWARD_CREATOR_WALLET` to the winning demo creator’s public address to restrict claims. Leave it blank only for an open judge demonstration.
- These values are public configuration. Never add a private key, wallet JSON, seed phrase, or service-role secret.

## 4. Connect

1. Open `/rewards` or the post-match reward card.
2. Select **Connect Wallet**.
3. Choose Phantom or Solflare in the Wallet Adapter modal.
4. Approve the connection in the wallet.
5. Momento displays the shortened address, `Connected`, and `Devnet`.

Wallet Adapter remembers the selected wallet and attempts to reconnect on the next visit. Disconnect is available from the wallet status menu.

## 5. Claim the demo creator reward

1. Complete the replay or open the finalized Live match.
2. Confirm the card says **Champion of the Match** and **Reward Available**.
3. Connect the configured creator wallet.
4. Select **Claim Reward**.
5. Momento requests the configured amount from the Devnet faucet, waits for confirmation, and stores the public receipt locally.
6. Open the transaction with the **Explorer** button.

The faucet may rate-limit public RPC endpoints. If claiming fails, wait briefly or configure another Devnet RPC and use **Retry**. The community winner remains final even when a reward is pending.

## Security and scope

- Devnet only; no Mainnet transactions.
- No smart contract, token, NFT, escrow, betting, or on-chain Champion action.
- No private keys or sponsor secrets in Momento.
- The demo reward source is replaceable behind `RewardTransactionSource`; production sponsorship can be added later without changing UI components.
