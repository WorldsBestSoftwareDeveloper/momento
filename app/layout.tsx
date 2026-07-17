import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { SolanaWalletProvider } from "@/lib/wallet/solana-wallet-provider";
import { CanonicalMatchProvider } from "@/lib/match/canonical-match-state";
import { getReplayConfig } from "@/lib/txline/replay-config";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Momento — Champion the defining Moment",
  description: "Official football events become shared fan experiences.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const mode = getReplayConfig().demoMode ? "replay" : "live";
  return <html lang="en"><body className={`${inter.variable} ${spaceGrotesk.variable}`}><SolanaWalletProvider><CanonicalMatchProvider defaultMode={mode}>{children}</CanonicalMatchProvider></SolanaWalletProvider></body></html>;
}
