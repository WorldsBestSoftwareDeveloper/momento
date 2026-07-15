import { TxlineClient } from "./client";
import type { TxlineScoreUpdate } from "./types";
import { requireTxlineConfig } from "./validation";
import { normalizeScoreUpdate } from "./scores";

export interface SseMessage { id?: string; event?: string; data: string; retry?: number }

export function parseSseBlock(block: string): SseMessage | null {
  const message: SseMessage = { data: "" };
  for (const rawLine of block.split(/\r?\n/)) {
    if (!rawLine || rawLine.startsWith(":")) continue;
    const separator = rawLine.indexOf(":");
    const field = separator < 0 ? rawLine : rawLine.slice(0, separator);
    const value = separator < 0 ? "" : rawLine.slice(separator + 1).replace(/^ /, "");
    if (field === "data") message.data += `${value}\n`;
    if (field === "event") message.event = value;
    if (field === "id") message.id = value;
    if (field === "retry") message.retry = Number(value);
  }
  message.data = message.data.replace(/\n$/, "");
  return message.data || message.event || message.id ? message : null;
}

export async function* streamScoreUpdates(signal?: AbortSignal): AsyncGenerator<TxlineScoreUpdate> {
  const response = await new TxlineClient(requireTxlineConfig()).stream("scores/stream", signal);
  if (!response.body) throw new Error("TXLINE_STREAM_NO_BODY");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (!signal?.aborted) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let separator = buffer.match(/\r?\n\r?\n/);
      while (separator?.index !== undefined) {
        const block = buffer.slice(0, separator.index);
        buffer = buffer.slice(separator.index + separator[0].length);
        const message = parseSseBlock(block);
        if (message?.data) {
          try {
            const parsed = JSON.parse(message.data) as unknown;
            if (!parsed || typeof parsed !== "object") continue;
            const envelope = parsed as { data?: unknown };
            const candidate = envelope.data && typeof envelope.data === "object" ? envelope.data : parsed;
            const update = normalizeScoreUpdate(candidate);
            if (update) yield update;
          } catch { /* heartbeat or non-JSON status event */ }
        }
        separator = buffer.match(/\r?\n\r?\n/);
      }
    }
  } finally { reader.releaseLock(); }
}
