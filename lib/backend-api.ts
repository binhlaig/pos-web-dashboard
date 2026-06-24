"use client";

import { clearAuthTokens, getStoredToken, redirectToSignIn } from "@/lib/auth";

export type BackendErrorCode =
  | "LOGIN_REQUIRED"
  | "UNAUTHORIZED"
  | "FEATURE_DISABLED"
  | "ENDPOINT_MISSING"
  | "REQUEST_FAILED";

export class BackendApiError extends Error {
  status: number;
  code: BackendErrorCode;
  body: unknown;

  constructor(message: string, status: number, code: BackendErrorCode, body?: unknown) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export function backendApiUrl(path: string) {
  const base = API_BASE.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${cleanPath}` : cleanPath;
}

export function getStoredBearerToken() {
  return getStoredToken();
}

export function clearStoredAuth() {
  if (typeof window === "undefined") return;

  clearAuthTokens();
  [
    "pos_user",
    "pos_shop_id",
    "pos_shop_code",
    "pos_plan",
    "pos_features",
    "pos_limits",
  ].forEach((key) => window.localStorage.removeItem(key));

  window.sessionStorage.removeItem("pos_user");
}

export function redirectToLogin() {
  redirectToSignIn();
}

async function parseResponse(res: Response) {
  const text = await res.text().catch(() => "");
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function messageFromBody(body: unknown, fallback: string) {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    return String(record.message || record.error || record.detail || fallback);
  }

  return typeof body === "string" && body.trim() ? body : fallback;
}

function codeFromBody(body: unknown) {
  if (!body || typeof body !== "object") return "";
  const record = body as Record<string, unknown>;
  return String(record.code || record.errorCode || record.reason || "").toUpperCase();
}

export async function backendRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getStoredBearerToken();

  if (!token) {
    throw new BackendApiError("Login session missing. Please sign in again.", 401, "LOGIN_REQUIRED");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(backendApiUrl(path), {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
  });
  const body = await parseResponse(res);

  if (res.status === 401) {
    clearStoredAuth();
    redirectToSignIn();
    throw new BackendApiError("Your login session expired. Please sign in again.", 401, "UNAUTHORIZED", body);
  }

  if (res.status === 403) {
    const featureDisabled = codeFromBody(body) === "FEATURE_DISABLED";
    throw new BackendApiError(
      featureDisabled
        ? "This feature is disabled for your shop plan. Please contact the shop owner or upgrade the plan."
        : messageFromBody(body, "You do not have permission to access this feature."),
      403,
      featureDisabled ? "FEATURE_DISABLED" : "REQUEST_FAILED",
      body,
    );
  }

  if (res.status === 404) {
    throw new BackendApiError(
      `Backend endpoint missing: ${path}. Please add this API on the backend or check NEXT_PUBLIC_API_BASE_URL.`,
      404,
      "ENDPOINT_MISSING",
      body,
    );
  }

  if (!res.ok) {
    throw new BackendApiError(
      messageFromBody(body, `Request failed (${res.status})`),
      res.status,
      "REQUEST_FAILED",
      body,
    );
  }

  return body as T;
}
