"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { DataMode } from "@/lib/txline/replay-config";
import { WalletControl } from "./wallet-control";

export function ModeAwareWalletControl({ defaultMode, compact = false, iconOnly = false, mobile = false }: { defaultMode: DataMode; compact?: boolean; iconOnly?: boolean; mobile?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") ?? defaultMode;
  const hidden = pathname.startsWith("/matches/") && mode !== "live";

  if (mobile) {
    if (hidden) return <div className="mobile-wallet-slot is-hidden" aria-hidden="true" />;
    return <div className="mobile-wallet-slot"><WalletControl compact={compact} iconOnly={iconOnly} /><span>Wallet</span></div>;
  }

  return hidden ? null : <WalletControl compact={compact} iconOnly={iconOnly} />;
}
