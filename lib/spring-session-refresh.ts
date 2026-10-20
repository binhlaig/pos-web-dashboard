import "server-only";
import { createHash } from "node:crypto";

export class SessionRefreshError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
export type RefreshedSession = {
  data: Record<string, unknown> & { token: string };
  refreshToken: string;
  cookies: string[];
};

export function refreshCookieFromResponse(response: Response): string | null {
  for (const cookie of response.headers.getSetCookie()) {
    const match = /^pos_refresh=([^;]+);/i.exec(cookie);
    if (match && /;\s*HttpOnly(?:;|$)/i.test(cookie)) {
      try {
        return decodeURIComponent(match[1]);
      } catch {
        return null;
      }
    }
  }
  return null;
}

// Shared Redis coordination is required for Vercel/multiple instances.
// The in-process fallback is only for local development / one persistent process.
// Keep aliases for the session lifetime: server components cannot always persist
// a rotated NextAuth cookie, so a later request may still carry an older alias.
const cache = new Map<string, { until: number; promise: Promise<RefreshedSession> }>();
const MAX_ENTRIES = 20000;
function tokenExpiration(raw: string): number {
  try {
    return (
      Number(JSON.parse(Buffer.from(raw.split(".")[1], "base64url").toString()).exp) *
      1000
    );
  } catch {
    return 0;
  }
}

export async function refreshSpringSession(raw: string): Promise<RefreshedSession> {
  if (!raw) throw new SessionRefreshError(401, "Please sign in again.");
  const key = createHash("sha256").update(raw).digest("hex");
  const now = Date.now();
  for (const [hash, entry] of cache) if (entry.until <= now) cache.delete(hash);
  const existing = cache.get(key);
  if (existing) {
    const result = await existing.promise;
    if (tokenExpiration(result.data.token) <= Date.now() + 30000) {
      return refreshSpringSession(result.refreshToken);
    }
    return result;
  }
  // Fail closed rather than evict an active alias and replay a consumed credential.
  if (cache.size >= MAX_ENTRIES)
    throw new SessionRefreshError(503, "Session service is busy. Try again shortly.");
  const promise = coordinatedRefresh(raw, key);
  const entry = { until: now + 18 * 60 * 60 * 1000, promise };
  cache.set(key, entry);
  try {
    const result = await promise;
    const maxAge = /;\s*Max-Age=(\d+)/i.exec(result.cookies[0] || "");
    if (maxAge)
      entry.until = Math.min(entry.until, Date.now() + Number(maxAge[1]) * 1000);
    return result;
  } catch (error) {
    // Do not automatically repeat failed refresh POSTs. A timeout may have occurred
    // after upstream rotation; backend idempotency/grace is needed to recover it.
    // Preserve failures too: an uncertain refresh must never replay a consumed token.
    throw error;
  }
}

async function performRefresh(raw: string): Promise<RefreshedSession> {
  const configured = process.env.APP_FRONTEND_ORIGIN?.trim();
  if (!configured) throw new SessionRefreshError(503, "Auth origin is not configured.");
  let origin: string;
  try {
    origin = new URL(configured).origin;
  } catch {
    throw new SessionRefreshError(503, "Auth origin is invalid.");
  }
  const base = (
    process.env.REMOTE_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8080"
  ).replace(/\/+$/, "");
  let response: Response;
  try {
    response = await fetch(`${base}/api/auth/refresh`, {
      method: "POST",
      headers: {
        Origin: origin,
        Cookie: `pos_refresh=${encodeURIComponent(raw)}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new SessionRefreshError(503, "Auth service unavailable. Try again shortly.");
  }
  if (!response.ok)
    throw new SessionRefreshError(
      response.status,
      response.status === 401
        ? "Session expired or revoked. Please sign in again."
        : "Unable to refresh session. Try again shortly.",
    );
  const data = await response.json().catch(() => null);
  const next = refreshCookieFromResponse(response);
  if (
    !data ||
    typeof data.token !== "string" ||
    !next ||
    !Number.isFinite(tokenExpiration(data.token)) ||
    tokenExpiration(data.token) <= Date.now()
  ) {
    throw new SessionRefreshError(502, "Invalid authentication response.");
  }
  return {
    data,
    refreshToken: next,
    cookies: response.headers
      .getSetCookie()
      .filter(
        (cookie) =>
          cookie.startsWith("pos_refresh=") && /;\s*HttpOnly(?:;|$)/i.test(cookie),
      ),
  };
}

type SharedRecord =
  | { state: "pending" }
  | { state: "done"; result: RefreshedSession }
  | { state: "failed"; status: number; message: string };

async function redis(command: (string | number)[]): Promise<unknown> {
  const endpoint = process.env.SESSION_REDIS_REST_URL;
  const secret = process.env.SESSION_REDIS_REST_TOKEN;
  if (!endpoint || !secret)
    throw new SessionRefreshError(503, "Shared session store is not configured.");
  if (new URL(endpoint).protocol !== "https:")
    throw new SessionRefreshError(503, "Shared session store requires HTTPS.");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok)
    throw new SessionRefreshError(503, "Shared session store unavailable.");
  const data = await response.json();
  if (data.error) throw new SessionRefreshError(503, "Shared session store unavailable.");
  return data.result;
}

async function coordinatedRefresh(raw: string, hash: string): Promise<RefreshedSession> {
  const shared = Boolean(
    process.env.SESSION_REDIS_REST_URL && process.env.SESSION_REDIS_REST_TOKEN,
  );
  if (!shared) {
    if (process.env.VERCEL || process.env.SESSION_REQUIRE_SHARED_STORE === "true") {
      throw new SessionRefreshError(
        503,
        "Configure shared session storage before using this deployment.",
      );
    }
    return performRefresh(raw);
  }
  const key = `pos:refresh:v1:${hash}`;
  // Atomic permanent claim prevents competing workers from ever replaying this
  // single-use credential. Never steal an expired lock after an unknown outcome.
  const claimed = await redis([
    "SET",
    key,
    JSON.stringify({ state: "pending" }),
    "NX",
    "EX",
    64800,
  ]);
  if (claimed === "OK") {
    try {
      const result = await performRefresh(raw);
      const age = /;\s*Max-Age=(\d+)/i.exec(result.cookies[0] || "");
      const ttl = Math.max(1, Math.min(64800, Number(age?.[1] || 64800)));
      await redis(["SET", key, JSON.stringify({ state: "done", result }), "EX", ttl]);
      return result;
    } catch (error) {
      const status = error instanceof SessionRefreshError ? error.status : 503;
      // Only a definitive 401 may force logout. Unknown rotation outcomes remain
      // blocked until a fresh sign-in; retrying the old token would revoke it.
      if (status === 401) {
        await redis([
          "SET",
          key,
          JSON.stringify({
            state: "failed",
            status,
            message: "Session expired or revoked.",
          }),
          "EX",
          64800,
        ]).catch(() => {});
      }
      throw error;
    }
  }
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const value = await redis(["GET", key]);
    if (typeof value !== "string")
      throw new SessionRefreshError(
        503,
        "Session state is unavailable. Please sign in again if it persists.",
      );
    const entry = JSON.parse(value) as SharedRecord;
    if (entry.state === "done") {
      if (tokenExpiration(entry.result.data.token) <= Date.now() + 30000)
        return refreshSpringSession(entry.result.refreshToken);
      return entry.result;
    }
    if (entry.state === "failed")
      throw new SessionRefreshError(entry.status, entry.message);
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new SessionRefreshError(
    503,
    "Refresh is pending or its outcome is uncertain. Try again; sign in again if it persists.",
  );
}
