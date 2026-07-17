"use client";

import { useMemo, type ReactNode } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { getSolanaRpcEndpoint } from "./config";

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => getSolanaRpcEndpoint(), []);
  return <ConnectionProvider endpoint={endpoint}><WalletProvider wallets={[]} autoConnect><WalletModalProvider>{children}</WalletModalProvider></WalletProvider></ConnectionProvider>;
}
