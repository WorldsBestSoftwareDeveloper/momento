import { readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  activateApiToken,
  createActivationMessage,
  requestGuestJwt,
  signActivationMessage,
} from "../lib/txline/auth";
import {
  TXLINE_DEVNET,
  TXLINE_FREE_TIER,
  type TxlineActivationConfig,
} from "../lib/txline/types";

// Official Devnet IDL discriminator for subscribe(service_level_id: u16, weeks: u8).
const SUBSCRIBE_DISCRIMINATOR = Buffer.from([254, 28, 191, 138, 156, 179, 183, 53]);

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local");
  let contents: string;
  try {
    contents = readFileSync(envPath, "utf8");
  } catch {
    throw new Error(`Missing ${envPath}. Create it before running activation.`);
  }

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] ??= value;
  }
}

function readConfig(): TxlineActivationConfig {
  const rpcUrl = process.env.TXLINE_RPC_URL ?? process.env.ANCHOR_PROVIDER_URL;
  const apiOrigin = process.env.TXLINE_API_ORIGIN;
  const walletPath = process.env.TXLINE_WALLET_PATH ?? process.env.ANCHOR_WALLET;
  const subscriptionTxSig = process.env.TXLINE_SUBSCRIPTION_TX_SIG?.trim();

  if (!rpcUrl) throw new Error("Set TXLINE_RPC_URL in .env.local.");
  if (!apiOrigin) throw new Error("Set TXLINE_API_ORIGIN in .env.local.");
  if (!walletPath) throw new Error("Set TXLINE_WALLET_PATH in .env.local.");
  if (rpcUrl !== TXLINE_DEVNET.rpcUrl) {
    throw new Error(`TXLINE_RPC_URL must be ${TXLINE_DEVNET.rpcUrl} for this Devnet-only script.`);
  }
  if (apiOrigin.replace(/\/$/, "") !== TXLINE_DEVNET.apiOrigin) {
    throw new Error(`TXLINE_API_ORIGIN must be ${TXLINE_DEVNET.apiOrigin}.`);
  }

  return {
    rpcUrl,
    apiOrigin: TXLINE_DEVNET.apiOrigin,
    walletPath,
    subscriptionTxSig: subscriptionTxSig || undefined,
  };
}

function loadWallet(walletPath: string): Keypair {
  const resolvedPath = isAbsolute(walletPath)
    ? walletPath
    : resolve(process.cwd(), walletPath);
  const raw = JSON.parse(readFileSync(resolvedPath, "utf8")) as unknown;
  if (!Array.isArray(raw) || !raw.every((value) => Number.isInteger(value))) {
    throw new Error("Wallet file must be a Solana keypair JSON byte array.");
  }
  return Keypair.fromSecretKey(Uint8Array.from(raw as number[]));
}

function getUserTokenAccount(wallet: PublicKey): PublicKey {
  return getAssociatedTokenAddressSync(
    new PublicKey(TXLINE_DEVNET.tokenMint),
    wallet,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
}

function createSubscribeInstruction(wallet: PublicKey): TransactionInstruction {
  const programId = new PublicKey(TXLINE_DEVNET.programId);
  const tokenMint = new PublicKey(TXLINE_DEVNET.tokenMint);
  const [pricingMatrix] = PublicKey.findProgramAddressSync(
    [Buffer.from("pricing_matrix")],
    programId,
  );
  const [tokenTreasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_treasury_v2")],
    programId,
  );
  const userTokenAccount = getUserTokenAccount(wallet);
  const tokenTreasuryVault = getAssociatedTokenAddressSync(
    tokenMint,
    tokenTreasuryPda,
    true,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const args = Buffer.alloc(3);
  args.writeUInt16LE(TXLINE_FREE_TIER.serviceLevelId, 0);
  args.writeUInt8(TXLINE_FREE_TIER.durationWeeks, 2);

  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: wallet, isSigner: true, isWritable: true },
      { pubkey: pricingMatrix, isSigner: false, isWritable: false },
      { pubkey: tokenMint, isSigner: false, isWritable: false },
      { pubkey: userTokenAccount, isSigner: false, isWritable: true },
      { pubkey: tokenTreasuryVault, isSigner: false, isWritable: true },
      { pubkey: tokenTreasuryPda, isSigner: false, isWritable: false },
      { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([SUBSCRIBE_DISCRIMINATOR, args]),
  });
}

async function main(): Promise<void> {
  loadEnvLocal();
  const config = readConfig();
  const payer = loadWallet(config.walletPath);
  const connection = new Connection(config.rpcUrl, "confirmed");

  const balance = await connection.getBalance(payer.publicKey, "confirmed");
  if (balance === 0) {
    throw new Error(
      `Wallet ${payer.publicKey.toBase58()} has no Devnet SOL. Fund it before activation.`,
    );
  }

  console.log("TxLINE Devnet World Cup Free Tier");
  console.log("Wallet:", payer.publicKey.toBase58());
  console.log("Service Level:", TXLINE_FREE_TIER.serviceLevelId);
  console.log("Duration (weeks):", TXLINE_FREE_TIER.durationWeeks);
  console.log("Selected Leagues:", JSON.stringify(TXLINE_FREE_TIER.selectedLeagues));
  let txSig = config.subscriptionTxSig;
  if (txSig) {
    console.log("Resuming activation with subscription transaction:", txSig);
    const transaction = await connection.getTransaction(txSig, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    if (!transaction || transaction.meta?.err) {
      throw new Error(
        "TXLINE_SUBSCRIPTION_TX_SIG is missing, unconfirmed, or failed on Devnet.",
      );
    }
  } else {
    console.log("Submitting on-chain subscription...");
    const userTokenAccount = getUserTokenAccount(payer.publicKey);
    const ensureUserTokenAccount = createAssociatedTokenAccountIdempotentInstruction(
      payer.publicKey,
      userTokenAccount,
      payer.publicKey,
      new PublicKey(TXLINE_DEVNET.tokenMint),
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
    const transaction = new Transaction().add(
      ensureUserTokenAccount,
      createSubscribeInstruction(payer.publicKey),
    );
    txSig = await sendAndConfirmTransaction(connection, transaction, [payer], {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });
    console.log("Subscription transaction:", txSig);
  }

  const guestJwt = await requestGuestJwt(config.apiOrigin);
  const message = createActivationMessage(
    txSig,
    TXLINE_FREE_TIER.selectedLeagues,
    guestJwt,
  );
  const walletSignature = signActivationMessage(message, payer.secretKey);
  const apiToken = await activateApiToken(config.apiOrigin, guestJwt, {
    txSig,
    walletSignature,
    leagues: TXLINE_FREE_TIER.selectedLeagues,
  });

  console.log("\nActivation succeeded. Nothing was saved automatically.");
  console.log("\nGuest JWT:\n", guestJwt);
  console.log("\nAPI Token:\n", apiToken);
  console.log("\nCopy both values into your secret manager or .env.local manually.");
}

main().catch((error: unknown) => {
  const details: string[] = [];
  let current: unknown = error;
  while (current instanceof Error) {
    details.push(current.message);
    current = current.cause;
  }
  if (current != null) details.push(String(current));
  console.error("\nTxLINE activation failed:", details.join("\nCaused by: "));
  process.exitCode = 1;
});
