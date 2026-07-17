"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Copy, LogOut, Wallet } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { shortWalletAddress, walletAvatarLabel } from "@/lib/wallet/config";

export function WalletControl({ compact = false, iconOnly = false }: { compact?: boolean; iconOnly?: boolean }) {
  const { publicKey, connected, connecting, disconnecting, disconnect, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const address = publicKey?.toBase58() ?? "";

  if (!connected) return <button type="button" className={`wallet-connect ${compact ? "compact" : ""} ${iconOnly ? "icon-only" : ""}`} aria-label={connecting ? "Connecting wallet" : "Connect wallet"} onClick={() => setVisible(true)} disabled={connecting}><Wallet size={17} />{!iconOnly && (connecting ? "Connecting…" : "Connect Wallet")}</button>;

  const copy = async () => {
    await navigator.clipboard.writeText(address); setCopied(true); window.setTimeout(() => setCopied(false), 1_500);
  };

  return <div className={`wallet-control ${compact ? "is-compact" : ""} ${iconOnly ? "is-icon-only" : ""}`}>
    <button type="button" className="wallet-connected-button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={iconOnly ? `Wallet ${shortWalletAddress(address)}` : undefined}>
      <span className="wallet-avatar">{wallet?.adapter.icon ? <i aria-hidden style={{ backgroundImage: `url(${wallet.adapter.icon})` }} /> : walletAvatarLabel(address)}</span>
      {!iconOnly && <span><small>Connected • Devnet</small><strong>{shortWalletAddress(address)}</strong></span>}{!iconOnly && <ChevronDown size={15} />}
    </button>
    <AnimatePresence>{open && <motion.div className="wallet-popover" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
      <div><span className="status-dot" /><strong>{wallet?.adapter.name ?? "Solana Wallet"}</strong><small>Devnet connection</small></div>
      <button type="button" onClick={copy}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy address"}</button>
      <button type="button" onClick={() => void disconnect()} disabled={disconnecting}><LogOut size={15} />{disconnecting ? "Disconnecting…" : "Disconnect"}</button>
    </motion.div>}</AnimatePresence>
  </div>;
}
