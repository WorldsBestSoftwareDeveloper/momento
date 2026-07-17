"use client";
import { useState } from "react";
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { SUPPORT_LEVELS } from "@/lib/opinion-market/model";
import { ChampionButton } from "@/components/moment/champion-button";
import { recordContribution } from "@/lib/opinion-market/contribution-store";
export function OpinionChampion({ matchId, momentId, mode, championed, count, busy, compact, onChampion }: { matchId: string; momentId: string; mode: "live" | "replay"; championed: boolean; count: number; busy?: boolean; compact?: boolean; onChampion: () => void }) {
  const [level, setLevel] = useState(0); const [sending, setSending] = useState(false);
  const { connection } = useConnection(); const { publicKey, sendTransaction } = useWallet(); const { setVisible } = useWalletModal(); const support = SUPPORT_LEVELS[level];
  const act = async () => {
    if (championed) { onChampion(); return; }
    if (mode === "replay") { await recordContribution({ matchId, momentId, amountSol: support.amountSol, signature: `replay-${crypto.randomUUID()}`, mode }); onChampion(); return; }
    if (!publicKey) { setVisible(true); return; }
    const address = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;
    if (!address) { window.alert("Live treasury is not configured. Use Replay Mode or add NEXT_PUBLIC_TREASURY_ADDRESS."); return; }
    setSending(true);
    try { const tx = new Transaction().add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: new PublicKey(address), lamports: Math.round(support.amountSol * LAMPORTS_PER_SOL) })); const signature = await sendTransaction(tx, connection); await connection.confirmTransaction(signature, "confirmed"); await recordContribution({ matchId, momentId, amountSol: support.amountSol, signature, mode }); onChampion(); }
    finally { setSending(false); }
  };
  return <div className="opinion-champion"><div className="support-levels">{SUPPORT_LEVELS.map((item, index) => <button type="button" key={item.level} className={level === index ? "is-active" : ""} onClick={(event) => { event.stopPropagation(); setLevel(index); }}>{item.amountSol} SOL</button>)}</div><ChampionButton compact={compact} championed={championed} count={count} busy={busy || sending} onChampion={() => void act()} /><small>{mode === "replay" ? "Replay simulation" : "Real Devnet transfer"}</small></div>;
}
