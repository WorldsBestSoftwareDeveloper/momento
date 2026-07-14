import { History, Radio } from "lucide-react";
import type { DataMode } from "@/lib/txline/replay-config";

export function DataModeBadge({ mode, label }: { mode: DataMode; label: string }) {
  const Icon = mode === "replay" ? History : Radio;
  return <span className={`mode-badge mode-${mode}`}><Icon size={14} />{label}</span>;
}
