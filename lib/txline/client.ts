import { requestGuestJwt } from "./auth";
import type {
  TxlineClientOptions,
  TxlineRequestOptions,
} from "./types";
import { TXLINE_DEVNET } from "./types";
import { TxlineApiError } from "./types";

export class TxlineClient {
  private guestJwt: string;
  private readonly apiToken: string;
  private readonly apiOrigin: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: TxlineClientOptions) {
    if (!options.guestJwt || !options.apiToken) {
      throw new Error("TxLINE requires both a Guest JWT and an API Token.");
    }

    this.guestJwt = options.guestJwt;
    this.apiToken = options.apiToken;
    this.apiOrigin = (options.apiOrigin ?? TXLINE_DEVNET.apiOrigin).replace(/\/$/, "");
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async request<T>(
    path: string,
    options: TxlineRequestOptions = {},
  ): Promise<T> {
    const { retryGuestAuth = true, ...requestInit } = options;
    const url = `${this.apiOrigin}/api/${path.replace(/^\/+/, "")}`;
    let { response, body } = await this.exchange(url, requestInit);

    if (response.status === 401 && retryGuestAuth) {
      this.guestJwt = await requestGuestJwt(this.apiOrigin, this.fetchImpl);
      ({ response, body } = await this.exchange(url, requestInit));
    }

    if (!response.ok) {
      const detail = body.trim() ? `: ${body}` : "";
      throw new TxlineApiError(
        `TxLINE request failed (${response.status} ${response.statusText})${detail}`,
        response.status,
        response.status === 401 ? "UNAUTHORIZED" : response.status === 403 ? "FORBIDDEN" : "UPSTREAM",
      );
    }

    if (!body) return undefined as T;
    if (body.trimStart().startsWith("data:")) {
      const records = body.split(/\r?\n/).flatMap((line) => {
        if (!line.startsWith("data:")) return [];
        try { return [JSON.parse(line.slice(5).trim())]; } catch { return []; }
      });
      return records as T;
    }
    return JSON.parse(body) as T;
  }

  get<T>(path: string, options?: TxlineRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  async stream(path: string, signal?: AbortSignal): Promise<Response> {
    const url = `${this.apiOrigin}/api/${path.replace(/^\/+/, "")}`;
    let response = await this.send(url, { method: "GET", signal, headers: { Accept: "text/event-stream", "Cache-Control": "no-cache" } });
    if (response.status === 401) {
      this.guestJwt = await requestGuestJwt(this.apiOrigin, this.fetchImpl);
      response = await this.send(url, { method: "GET", signal, headers: { Accept: "text/event-stream", "Cache-Control": "no-cache" } });
    }
    if (!response.ok) throw this.error(response.status, response.statusText);
    return response;
  }

  private send(url: string, options: RequestInit): Promise<Response> {
    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    headers.set("Authorization", `Bearer ${this.guestJwt}`);
    headers.set("X-Api-Token", this.apiToken);

    return this.fetchImpl(url, { ...options, headers, signal: options.signal ?? AbortSignal.timeout(15_000) });
  }

  private async exchange(url: string, options: RequestInit): Promise<{ response: Response; body: string }> {
    const controller = new AbortController();
    const abortFromCaller = () => controller.abort(options.signal?.reason);
    if (options.signal?.aborted) abortFromCaller();
    else options.signal?.addEventListener("abort", abortFromCaller, { once: true });
    const timer = setTimeout(() => controller.abort(new Error("TXLINE_REQUEST_TIMEOUT")), 15_000);
    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    headers.set("Authorization", `Bearer ${this.guestJwt}`);
    headers.set("X-Api-Token", this.apiToken);
    try {
      const response = await this.fetchImpl(url, { ...options, headers, signal: controller.signal });
      const body = await response.text();
      return { response, body };
    } catch (error) {
      if (controller.signal.aborted) throw new Error("TXLINE_REQUEST_TIMEOUT");
      throw error;
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", abortFromCaller);
    }
  }


  private error(status: number, detail: string) {
    const code = status === 401 ? "UNAUTHORIZED" : status === 403 ? "FORBIDDEN" : "UPSTREAM";
    return new TxlineApiError(`TxLINE request failed (${status} ${detail})`, status, code);
  }
}
