import type { ReactNode } from "react";
import { DesktopHeader } from "./desktop-header";
import { MobileBottomNav } from "./mobile-bottom-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <DesktopHeader />
      <main className="app-main">{children}</main>
      <MobileBottomNav />
    </div>
  );
}
