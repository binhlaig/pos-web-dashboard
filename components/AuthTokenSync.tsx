"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { clearAuthTokens, saveToken } from "@/lib/auth";

export default function AuthTokenSync() {
  const { data: session, status } = useSession();
  const accessToken = String((session as any)?.accessToken || "");

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated") {
      if (accessToken) saveToken(accessToken);
      return;
    }

    if (status === "unauthenticated") {
      // NextAuth can report unauthenticated after a failed session fetch. Only
      // clear browser credentials after a successful, authoritative empty read.
      const controller = new AbortController();
      void fetch("/api/auth/session", { cache: "no-store", signal: controller.signal })
        .then(async response => {
          if (!response.ok) return;
          const current = await response.json();
          if (!controller.signal.aborted && (!current?.user || current.error === "AccessTokenExpired")) clearAuthTokens();
        }).catch(() => {});
      return () => controller.abort();
    }
  }, [accessToken, status]);

  return null;
}
