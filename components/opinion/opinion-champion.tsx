"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Heart, X } from "lucide-react";
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { SUPPORT_LEVELS } from "@/lib/opinion-market/model";
import { recordContribution } from "@/lib/opinion-market/contribution-store";
export function OpinionChampion({ matchId, momentId, mode, championed, count, busy, compact, onChampion }: { matchId: string; momentId: string; mode: "live" | "replay"; championed: boolean; count: number; busy?: boolean; compact?: boolean; onChampion: () => void }) {
  const [level, setLevel] = useState(0); const [sending, setSending] = useState(false); const [open, setOpen] = useState(false); const [custom, setCustom] = useState(""); const [error, setError] = useState<string | null>(null); const [signature, setSignature] = useState<string | null>(null);
  const { connection } = useConnection(); const { publicKey, sendTransaction } = useWallet(); const { setVisible } = useWalletModal(); const customAmount = Number(custom); const support = Number.isFinite(customAmount) && customAmount > 0 ? { amountSol: customAmount } : SUPPORT_LEVELS[level];
  const act = async () => {
    setError(null); setSignature(null);
    if (championed) { onChampion(); setOpen(false); return; }
    if (mode === "replay") { await recordContribution({ matchId, momentId, amountSol: support.amountSol, signature: `replay-${crypto.randomUUID()}`, mode }); onChampion(); setOpen(false); return; }
    if (!publicKey) { setVisible(true); return; }
    const address = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;
    if (!address) { window.alert("Live treasury is not configured. Use Replay Mode or add NEXT_PUBLIC_TREASURY_ADDRESS."); return; }
    setSending(true);
    try { const tx = new Transaction().add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: new PublicKey(address), lamports: Math.round(support.amountSol * LAMPORTS_PER_SOL) })); const nextSignature = await sendTransaction(tx, connection); await connection.confirmTransaction(nextSignature, "confirmed"); await recordContribution({ matchId, momentId, amountSol: support.amountSol, signature: nextSignature, mode }); onChampion(); setSignature(nextSignature); }
    catch (cause) { const message = cause instanceof Error ? cause.message : "The transaction could not be completed."; setError(/reject|cancel/i.test(message) ? "Transaction cancelled. No contribution was made." : message); }
    finally { setSending(false); }
  };
  return <div className={`opinion-champion ${compact ? "is-compact" : ""}`}>
    <motion.button type="button" className={`support-moment-button ${championed ? "is-championed" : ""}`} disabled={busy || sending} onClick={(event) => { event.stopPropagation(); setOpen(true); }} whileTap={{ scale: .96 }} animate={championed ? { scale: [1, 1.08, 1] } : { scale: 1 }}>
      <span className="support-heart"><Heart size={compact ? 16 : 18} fill={championed ? "currentColor" : "none"} /></span><span>{compact ? "Support" : "Support this Moment"}</span>{!compact && <strong>{count.toLocaleString()}</strong>}
    </motion.button>
    <AnimatePresence>{open && <motion.div className="support-sheet-backdrop" role="presentation" onClick={(event) => { event.stopPropagation(); if (event.target === event.currentTarget) setOpen(false); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.section className="support-sheet" role="dialog" aria-modal="true" aria-labelledby={`support-title-${momentId}`} initial={{ y: 42, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 28, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 320 }}>
        <div className="sheet-handle" /><header><div><span className="eyebrow">Community-backed support</span><h3 id={`support-title-${momentId}`}>Support this Moment</h3></div><button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close support options"><X /></button></header>
        <div className="sheet-intent">I&apos;m contributing SOL to the Moment I believe will define this match.</div>
        <div className="sheet-pool"><span>Your Contribution</span><strong>{support.amountSol.toFixed(2)} SOL</strong></div>
        <div className="sheet-options">{SUPPORT_LEVELS.map((item, index) => <button type="button" key={item.level} className={!custom && level === index ? "is-active" : ""} onClick={() => { setLevel(index); setCustom(""); }}>{item.amountSol.toFixed(2)} SOL</button>)}</div>
        <label className="custom-support"><span>Custom amount</span><div><input type="number" min="0.001" step="0.001" inputMode="decimal" value={custom} onChange={(event) => setCustom(event.target.value)} placeholder="0.00" /><b>SOL</b></div></label>
        <p className={`transaction-context is-${mode}`}>{mode === "replay" ? "Replay Mode • Simulated pool contribution" : "Live Mode • Real Solana Devnet transaction to the community treasury"}</p>
        {error && <p className="support-error" role="alert">{error}</p>}
        {signature && <a className="support-success" href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`} target="_blank" rel="noreferrer">Contribution confirmed <ExternalLink /></a>}
        <button type="button" className="primary-button sheet-confirm" disabled={sending || busy || support.amountSol <= 0} onClick={() => void act()}>{sending ? "Confirming…" : `Confirm ${support.amountSol.toFixed(2)} SOL`}</button>
      </motion.section>
    </motion.div>}</AnimatePresence>
  </div>;
}
