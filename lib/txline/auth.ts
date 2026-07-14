import nacl from "tweetnacl";
import type {
  ActivationRequest,
  ActivationResponse,
  GuestAuthResponse,
} from "./types";

function apiError(label: string, response: Response, body: string): Error {
  const detail = body.trim() ? `: ${body}` : "";
  return new Error(`${label} failed (${response.status} ${response.statusText})${detail}`);
}

export async function requestGuestJwt(
  apiOrigin: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const response = await fetchImpl(`${apiOrigin}/auth/guest/start`, {
    method: "POST",
    headers: { Accept: "application/json" },
  });
  const body = await response.text();

  if (!response.ok) {
    throw apiError("TxLINE guest authentication", response, body);
  }

  const data = JSON.parse(body) as GuestAuthResponse;
  if (!data.token || typeof data.token !== "string") {
    throw new Error("TxLINE guest authentication returned no token.");
  }

  return data.token;
}

export function createActivationMessage(
  txSig: string,
  selectedLeagues: readonly number[],
  guestJwt: string,
): Uint8Array {
  return new TextEncoder().encode(
    `${txSig}:${selectedLeagues.join(",")}:${guestJwt}`,
  );
}

export function signActivationMessage(
  message: Uint8Array,
  secretKey: Uint8Array,
): string {
  return Buffer.from(nacl.sign.detached(message, secretKey)).toString("base64");
}

export async function activateApiToken(
  apiOrigin: string,
  guestJwt: string,
  activation: ActivationRequest,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const response = await fetchImpl(`${apiOrigin}/api/token/activate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${guestJwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(activation),
  });
  const body = await response.text();

  if (!response.ok) {
    throw apiError("TxLINE API activation", response, body);
  }

  let data: ActivationResponse | string;
  try {
    data = JSON.parse(body) as ActivationResponse | string;
  } catch {
    data = body;
  }

  const token = typeof data === "string" ? data : data.token;
  if (!token || typeof token !== "string") {
    throw new Error("TxLINE API activation returned no API token.");
  }

  return token;
}
