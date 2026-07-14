import { requestGuestJwt } from "./auth";
import type {
  TxlineClientOptions,
  TxlineRequestOptions,
} from "./types";
import { TXLINE_DEVNET } from "./types";

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
    let response = await this.send(url, requestInit);

    if (response.status === 401 && retryGuestAuth) {
      this.guestJwt = await requestGuestJwt(this.apiOrigin, this.fetchImpl);
      response = await this.send(url, requestInit);
    }

    const body = await response.text();
    if (!response.ok) {
      const detail = body.trim() ? `: ${body}` : "";
      throw new Error(
        `TxLINE request failed (${response.status} ${response.statusText})${detail}`,
      );
    }

    if (!body) return undefined as T;
    return JSON.parse(body) as T;
  }

  get<T>(path: string, options?: TxlineRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  private send(url: string, options: RequestInit): Promise<Response> {
    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    headers.set("Authorization", `Bearer ${this.guestJwt}`);
    headers.set("X-Api-Token", this.apiToken);

    return this.fetchImpl(url, { ...options, headers });
  }
}
