
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

import {
  clearAuthTokens,
  getStoredToken,
  saveToken,
} from "@/lib/auth";

type AuthSession = {
  accessToken?: string | null;
  error?: string | null;
  user?: unknown;
};

/**
 * Read JWT expiration without verifying signatures.
 *
 * This is only for comparing token freshness.
 * Authentication remains the server's responsibility.
 */
function getTokenExpiry(token: string): number {
  try {
    const payload = token.split(".")[1];

    if (!payload) return 0;

    const normalized = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = normalized.padEnd(
      Math.ceil(normalized.length / 4) * 4,
      "="
    );

    const decoded = JSON.parse(
      atob(padded)
    ) as { exp?: number };

    return Number(decoded.exp || 0);
  } catch {
    return 0;
  }
}

export default function AuthTokenSync() {
  const { data: session, status } = useSession();

  const currentSession =
    session as AuthSession | null;

  const accessToken =
    currentSession?.accessToken || "";

  useEffect(() => {
    /**
     * Background session loading must not
     * clear or replace the existing token.
     */
    if (status === "loading") {
      return;
    }

    /**
     * Authenticated:
     * Synchronize only when a newer token
     * is available.
     */
    if (status === "authenticated") {
      if (!accessToken) return;

      const storedToken = getStoredToken();

      // Avoid unnecessary storage updates
      // and pos-auth-change events.
      if (storedToken === accessToken) {
        return;
      }

      if (storedToken) {
        const storedExpiry =
          getTokenExpiry(storedToken);

        const incomingExpiry =
          getTokenExpiry(accessToken);

        // Avoid overwriting a newer JWT
        // with an older session response.
        if (
          storedExpiry > 0 &&
          incomingExpiry > 0 &&
          storedExpiry > incomingExpiry
        ) {
          return;
        }
      }

      /**
       * saveToken updates localStorage and
       * dispatches pos-auth-change.
       *
       * No browser reload or route refresh.
       */
      saveToken(accessToken);

      return;
    }

    /**
     * Unauthenticated:
     *
     * A failed NextAuth session request can
     * temporarily appear unauthenticated.
     *
     * Confirm with the server before
     * clearing browser tokens.
     */
    if (status === "unauthenticated") {
      const controller = new AbortController();

      async function verifySession() {
        try {
          const response = await fetch(
            "/api/auth/session",
            {
              method: "GET",
              credentials: "same-origin",
              cache: "no-store",
              signal: controller.signal,
            }
          );

          if (!response.ok) {
            return;
          }

          const current =
            (await response.json()) as AuthSession;

          if (controller.signal.aborted) {
            return;
          }

          /**
           * Clear credentials only after
           * an authoritative empty session
           * or definite expiration.
           */
          if (
            !current?.user ||
            current.error === "AccessTokenExpired"
          ) {
            clearAuthTokens();
          }
        } catch {
          // Temporary network failures
          // must not destroy local credentials.
        }
      }

      void verifySession();

      return () => {
        controller.abort();
      };
    }
  }, [accessToken, status]);

  return null;
}
