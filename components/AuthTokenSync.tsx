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
      clearAuthTokens();
    }
  }, [accessToken, status]);

  return null;
}
