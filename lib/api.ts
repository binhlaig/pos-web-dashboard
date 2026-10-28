import { requireMatchingIdentity } from "@/lib/session-identity";
import { getSession } from "next-auth/react";
import { clearAuthTokens, getStoredToken, redirectToSignIn, saveToken } from "@/lib/auth";

type ApiErrorPayload = {
  message?: string;
  error?: string;
  code?: string;
  detail?: string;
  status?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function buildErrorMessage(status: number, payload: unknown, path?: string) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const p = payload as ApiErrorPayload;

    if (status === 401) {
      return p.message || p.error || "Login session expired. Please login again.";
    }

    if (status === 403) {
      if (String(p.error || p.code || "").toUpperCase() === "FEATURE_DISABLED") {
        return (
          p.message ||
          "This feature is disabled for your shop plan. Please contact the shop owner or upgrade the plan."
        );
      }

      return p.message || p.error || "Permission denied or feature disabled.";
    }

    if (status === 404) {
      return (
        p.message || p.error || `Backend endpoint not found${path ? `: ${path}` : ""}.`
      );
    }

    if (status >= 500) {
      return p.message || p.error || "Backend server error.";
    }

    return p.message || p.error || p.detail || `HTTP ${status}`;
  }

  if (status === 401) return "Login session expired. Please login again.";
  if (status === 403) return "Permission denied or feature disabled.";
  if (status === 404) return `Backend endpoint not found${path ? `: ${path}` : ""}.`;
  if (status >= 500) return "Backend server error.";

  return `HTTP ${status}`;
}

async function parseResponse(res: Response) {
  const ct = res.headers.get("content-type") || "";

  if (ct.includes("application/json")) {
    return res.json().catch(() => null);
  }

  return res.text().catch(() => "");
}

function buildUrl(path: string) {
  // Full URL ဖြစ်ပြီးသားဆို 그대로သုံး
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // path က / နဲ့မစရင် / ထည့်
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${API_BASE}${normalizedPath}`;
}

type BrowserSession = { accessToken?: string | null; error?: string | null };
let pendingRefresh: Promise<string> | null = null;

function endExpiredSession(): never {
  clearAuthTokens();
  redirectToSignIn();
  throw new Error("Login session expired. Please login again.");
}
export async function renewAccessToken(previous: string): Promise<string> {
  if (pendingRefresh) {
    const next = await pendingRefresh;
    requireMatchingIdentity(previous, next);
    return next;
  }
  pendingRefresh = (async () => {
    // getSession invokes the NextAuth JWT callback and persists its rotated JWT.
    let session: BrowserSession | null;
    try {
      session = (await getSession()) as BrowserSession | null;
    } catch {
      throw new Error("Session service unavailable. Try again shortly.");
    }
    if (session?.error === "AccessTokenExpired") return endExpiredSession();
    if (session?.error === "RefreshTemporarilyUnavailable")
      throw new Error("Unable to renew session now. Try again shortly.");
    if (session?.accessToken && session.accessToken !== previous) {
      requireMatchingIdentity(previous, session.accessToken);
      saveToken(session.accessToken);
      return session.accessToken;
    }
    if (!session?.accessToken) throw new Error("Unable to renew session now. Try again shortly.");
    // An otherwise fresh access token was rejected: force one coordinated
    // refresh using the encrypted NextAuth credential, preserving both cookies.
    const response = await fetch("/api/auth/refresh", {
      method: "POST", credentials: "include", cache: "no-store",
    });
    if (response.status === 401) return endExpiredSession();
    if (!response.ok) throw new Error("Unable to renew session now. Try again shortly.");
    const data = await response.json();
    if (typeof data?.token !== "string") throw new Error("Invalid session response.");
    requireMatchingIdentity(previous, data.token);
    saveToken(data.token);
    return data.token;
  })();
  try {
    return await pendingRefresh;
  } finally {
    pendingRefresh = null;
  }
}

/** Retry only an explicit authentication rejection, once. Network outcomes are never replayed. */
export async function sessionFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const previous = headers.get("Authorization")?.replace(/^Bearer\s+/i, "") || getStoredToken() || "";
  if (previous) headers.set("Authorization", `Bearer ${previous}`);
  const response = await fetch(url, { ...init, headers });
  if (response.status !== 401) return response;
  const next = await renewAccessToken(previous);
  headers.set("Authorization", `Bearer ${next}`);
  return fetch(url, { ...init, headers });
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: any;
    auth?: boolean;
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const auth = options.auth ?? false;

  const url = buildUrl(path);
  let token = auth ? getStoredToken() : "";
  if (auth && !token) {
    const session = (await getSession()) as BrowserSession | null;
    if (session?.error === "AccessTokenExpired") return endExpiredSession();
    if (session?.accessToken) {
      token = session.accessToken;
      saveToken(token);
    } else if (session?.error)
      throw new Error("Unable to renew session now. Try again shortly.");
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers ?? {}),
  };

  if (auth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const body = options.body;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (body && !isFormData && typeof body === "object") {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  const send = async (bearer: string) => {
    const requestHeaders = new Headers(headers);
    if (auth && bearer) requestHeaders.set("Authorization", `Bearer ${bearer}`);
    try {
      return await fetch(url, {
        method,
        headers: requestHeaders,
        body:
          body != null
            ? isFormData
              ? body
              : requestHeaders.get("Content-Type")?.includes("application/json")
                ? JSON.stringify(body)
                : body
            : undefined,
      });
    } catch {
      throw new Error(`Backend unreachable, API URL wrong, or CORS issue. URL: ${url}`);
    }
  };
  let res = await send(token);
  if (auth && res.status === 401) {
    const latest = getStoredToken();
    if (latest && latest !== token) {
      requireMatchingIdentity(token, latest);
      token = latest;
    } else {
      token = await renewAccessToken(token);
    }
    // A single retry after an authentication rejection. Never retry network errors,
    // 403, or 5xx responses, especially for checkout/payment mutations.
    res = await send(token);
  }
  const payload = await parseResponse(res);

  if (!res.ok) {
    if (res.status === 401 && auth) {
      // A fresh token was rejected: stop retrying. Keep session state so an
      // endpoint-specific 401 does not silently destroy a valid global session.
    }

    throw new Error(buildErrorMessage(res.status, payload, path));
  }

  return payload as T;
}

export function postForm<T>(path: string, form: FormData, auth = false) {
  return apiRequest<T>(path, {
    method: "POST",
    body: form,
    auth,
  });
}

export function postJson<T>(path: string, data: any, auth = false) {
  return apiRequest<T>(path, {
    method: "POST",
    body: data,
    auth,
  });
}

export function putJson<T>(path: string, data: any, auth = false) {
  return apiRequest<T>(path, {
    method: "PUT",
    body: data,
    auth,
  });
}

export function patchJson<T>(path: string, data: any, auth = false) {
  return apiRequest<T>(path, {
    method: "PATCH",
    body: data,
    auth,
  });
}

export function deleteJson<T>(path: string, auth = false) {
  return apiRequest<T>(path, {
    method: "DELETE",
    auth,
  });
}

export function getJson<T>(path: string, auth = false) {
  return apiRequest<T>(path, {
    method: "GET",
    auth,
  });
}
