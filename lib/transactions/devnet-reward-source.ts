import { LAMPORTS_PER_SOL, PublicKey, type Connection } from "@solana/web3.js";
import type { RewardTransactionResult } from "@/lib/reward/types";

export type RewardTransactionStage = "sending" | "confirming";

export interface RewardTransactionSource {
  claim(connection: Connection, recipient: string, amountSol: number, onStage: (stage: RewardTransactionStage) => void): Promise<RewardTransactionResult>;
}

export class DevnetAirdropRewardSource implements RewardTransactionSource {
  async claim(connection: Connection, recipient: string, amountSol: number, onStage: (stage: RewardTransactionStage) => void) {
    const publicKey = new PublicKey(recipient);
    const lamports = Math.round(amountSol * LAMPORTS_PER_SOL);
    onStage("sending");
    const signature = await connection.requestAirdrop(publicKey, lamports);
    onStage("confirming");
    const confirmation = await connection.confirmTransaction(signature, "confirmed");
    if (confirmation.value.err) throw new Error("The Devnet reward transaction was not confirmed.");
    return { signature, confirmedAt: new Date().toISOString() };
  }
}

export function devnetExplorerUrl(signature: string) {
  return `https://explorer.solana.com/tx/${encodeURIComponent(signature)}?cluster=devnet`;
}
