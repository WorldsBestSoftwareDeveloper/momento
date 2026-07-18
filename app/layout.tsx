import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { SolanaWalletProvider } from "@/lib/wallet/solana-wallet-provider";
import { CanonicalMatchProvider } from "@/lib/match/canonical-match-state";
import { getReplayConfig } from "@/lib/txline/replay-config";
import { getMatchExperienceDataset } from "@/lib/match/match-data-source";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Momento — Champion the defining Moment",
  description: "Official football events become shared fan experiences.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const config = getReplayConfig();
  const mode = config.demoMode ? "replay" : "live";
  const [replayDataset, liveDataset] = await Promise.all([
    getMatchExperienceDataset(config.matchId, "replay"),
    getMatchExperienceDataset(config.matchId, "live"),
  ]);
  return <html lang="en"><body className={`${inter.variable} ${spaceGrotesk.variable}`}><SolanaWalletProvider><CanonicalMatchProvider defaultMode={mode} initialReplayMatch={replayDataset.match} initialLiveMatch={liveDataset.match}>{children}</CanonicalMatchProvider></SolanaWalletProvider></body></html>;
}
