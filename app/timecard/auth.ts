// // /lib/timecard/auth.ts
// const KEY = "pos_access_token";

// export function setAccessToken(token: string) {
//   if (typeof window === "undefined") return;
//   localStorage.setItem(KEY, token);
// }

// export function getAccessToken(): string | null {
//   if (typeof window === "undefined") return null;
//   return localStorage.getItem(KEY);
// }

// export function decodeJwt<T = any>(token?: string | null): T | null {
//   if (!token) return null;
//   try {
//     const [, payload] = token.split(".");
//     return JSON.parse(atob(payload)) as T;
//   } catch {
//     return null;
//   }
// }

// // login helper (optional)
// import { post } from "./api";
// export async function login(username: string, password: string) {
//   // backend: POST /api/auth/login {username,password} -> {access_token, role, username}
//   const data = await post<{ access_token: string; role: string; username: string }>(
//     "/auth/login",
//     { username, password }
//   );
//   setAccessToken(data.access_token);
//   return data;
// }



// /app/timecard/auth.ts
import { getSession, signIn, signOut } from "next-auth/react";

/**
 * ✅ Get JWT token from NextAuth session
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await getSession();
    return (session as any)?.accessToken || null;
  } catch {
    return null;
  }
}

/**
 * ✅ Decode JWT (same as before but safer)
 */
export function decodeJwt<T = any>(token?: string | null): T | null {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];

    // fix base64url
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );

    return JSON.parse(atob(padded)) as T;
  } catch {
    return null;
  }
}

/**
 * ❌ REMOVE localStorage login
 * ✅ Use NextAuth signIn instead
 */
export async function login(username: string, password: string) {
  const res = await signIn("credentials", {
    username,
    password,
    redirect: false,
  });

  if (res?.error) {
    throw new Error(res.error);
  }

  return res;
}

/**
 * logout helper
 */
export function logout() {
  return signOut({ callbackUrl: "/Sign_in" });
}
