// /components/auth/SyncUser.tsx
"use client";

import { useEffect } from "react";
import type { AppUser } from "@/lib/session";

export default function SyncUser({ user }: { user: AppUser }) {
  useEffect(() => {
    try {
      // debug only – UI preview/store စသည့်အတွက်
      sessionStorage.setItem("preview_user", JSON.stringify(user));
    } catch {}
  }, [user]);
  return null;
}
