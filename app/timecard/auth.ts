// /lib/timecard/auth.ts
const KEY = "pos_access_token";

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, token);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function decodeJwt<T = any>(token?: string | null): T | null {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload)) as T;
  } catch {
    return null;
  }
}

// login helper (optional)
import { post } from "./api";
export async function login(username: string, password: string) {
  // backend: POST /api/auth/login {username,password} -> {access_token, role, username}
  const data = await post<{ access_token: string; role: string; username: string }>(
    "/auth/login",
    { username, password }
  );
  setAccessToken(data.access_token);
  return data;
}
