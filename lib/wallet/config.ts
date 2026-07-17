import { clusterApiUrl } from "@solana/web3.js";

export const SOLANA_NETWORK = "devnet" as const;

export function getSolanaRpcEndpoint() {
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() || clusterApiUrl(SOLANA_NETWORK);
}

export function shortWalletAddress(address: string, edge = 4) {
  return address.length <= edge * 2 + 1 ? address : `${address.slice(0, edge)}…${address.slice(-edge)}`;
}

export function walletAvatarLabel(address: string) {
  return address.slice(0, 2).toUpperCase();
}
