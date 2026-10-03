"use client";

import { useLayoutEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { getStoredToken } from "@/lib/auth";
import { getReceiptSettings, type ReceiptSettings } from "@/lib/settings-api";
import { DEFAULT_CURRENCY, formatCurrencyAmount } from "@/lib/currency";
import { createCurrencyStore } from "@/lib/currency-store";

const store = createCurrencyStore();
const serverSnapshot = () => DEFAULT_CURRENCY;

// Components subscribe to this single store; print/export helpers share the same snapshot.
export function useCurrencySettings() {
  return useSyncExternalStore(store.subscribe, store.snapshot, serverSnapshot);
}
export function useCurrency() {
  const currencySettings = useCurrencySettings();
  return useMemo(() => ({
    currencySettings,
    formatSharedMoney: (value: number) => formatCurrencyAmount(value, currencySettings),
    formatSharedCompactMoney: (value: number) => formatCurrencyAmount(value, currencySettings, true),
  }), [currencySettings]);
}
export const getCurrencyIdentity = store.identity;
export function publishCurrencySettings(settings: ReceiptSettings, expectedIdentity = store.identity()) {
  store.publish(settings, expectedIdentity);
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  useLayoutEffect(() => {
    let active = true;
    const check = (refresh = false) => {
      if (!active) return;
      const token = getStoredToken();
      const sessionToken = String((session as { accessToken?: string } | null)?.accessToken || "");
      // Wait for the existing auth sync when NextAuth has switched accounts.
      const authenticated = Boolean(token) && (!sessionToken || sessionToken === token);
      const nextIdentity = JSON.stringify([token, session?.user, window.localStorage.getItem("pos_shop_id"), window.localStorage.getItem("pos_shop_code")]);
      void store.refresh(nextIdentity, authenticated, getReceiptSettings, refresh);
    };
    const refresh = () => check(true);
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("pos-auth-change", refresh);
    document.addEventListener("visibilitychange", onVisible);
    // Existing login/shop flows also write storage directly in the same tab.
    const timer = window.setInterval(() => check(), 500);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pos-auth-change", refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [session, status, pathname]);
  return children;
}
