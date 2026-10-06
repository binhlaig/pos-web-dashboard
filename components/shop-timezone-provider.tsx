"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { getStoredToken } from "@/lib/auth";
import { getMyShop } from "@/lib/settings-api";
import { DEFAULT_SHOP_TIMEZONE, getShopTimezone, setTimezoneIdentity, publishShopTimezone, subscribeShopTimezone } from "@/lib/date-time";

export function useShopTimezone() {
  return useSyncExternalStore(subscribeShopTimezone, getShopTimezone, () => DEFAULT_SHOP_TIMEZONE);
}
export function ShopTimezoneProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  useEffect(() => {
    let active = true;
    let lastIdentity = "";
    const refresh = (force = false) => {
      const token = getStoredToken() || "";
      const sessionToken = String((session as {accessToken?: string} | null)?.accessToken || "");
      const authenticated = !!token && (!sessionToken || token === sessionToken);
      const identity = authenticated ? token : "";
      const generation = setTimezoneIdentity(identity);
      if (!authenticated || (!force && identity === lastIdentity)) { lastIdentity = identity; return; }
      lastIdentity = identity;
      void getMyShop().then(shop => {
        if (active) publishShopTimezone(shop.timezone, identity, generation);
      }).catch(() => { if (active) lastIdentity = ""; });
    };
    const forcedRefresh = () => refresh(true);
    refresh(true);
    const timer = window.setInterval(() => refresh(), 1000);
    for (const event of ["pos-auth-change", "storage", "focus", "pos-shop-timezone-change"]) window.addEventListener(event, forcedRefresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      for (const event of ["pos-auth-change", "storage", "focus", "pos-shop-timezone-change"]) window.removeEventListener(event, forcedRefresh);
    };
  }, [session, status, pathname]);
  return children;
}
