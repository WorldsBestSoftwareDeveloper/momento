import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

if (existsSync(".env.local")) for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
}

async function main() {
  const walletPath = resolve(process.env.TREASURY_WALLET_PATH ?? ".secrets/momento-devnet-treasury.json");
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl("devnet");
  let treasury: Keypair;

  if (existsSync(walletPath)) {
    treasury = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(walletPath, "utf8")) as number[]));
    console.log("Reusing existing Devnet treasury.");
  } else {
    treasury = Keypair.generate();
    mkdirSync(dirname(walletPath), { recursive: true });
    writeFileSync(walletPath, JSON.stringify(Array.from(treasury.secretKey)));
    console.log(`Created Devnet treasury at ${walletPath}`);
  }

  console.log(`Treasury public address: ${treasury.publicKey.toBase58()}`);
  console.log("Keep the wallet file private. Add only the public address to NEXT_PUBLIC_TREASURY_ADDRESS.");

  try {
    const connection = new Connection(endpoint, "confirmed");
    const balance = await connection.getBalance(treasury.publicKey);
    if (balance < 0.25 * LAMPORTS_PER_SOL) {
      console.log("Requesting 1 Devnet SOL from the faucet…");
      const signature = await connection.requestAirdrop(treasury.publicKey, LAMPORTS_PER_SOL);
      await connection.confirmTransaction(signature, "confirmed");
      console.log(`Funded: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    } else console.log(`Treasury already funded: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
  } catch (error) {
    console.warn(`Automatic funding unavailable: ${error instanceof Error ? error.message : "Unknown RPC error"}`);
    console.warn(`Fund this address manually on Devnet: ${treasury.publicKey.toBase58()}`);
  }
}

void main().catch((error) => {
  console.error(`Treasury setup failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  process.exitCode = 1;
});
