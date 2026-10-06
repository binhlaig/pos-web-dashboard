"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import ToasterProvider from "@/lib/Toasterprovider";
import { ShopTimezoneProvider } from "@/components/shop-timezone-provider";
import { CurrencyProvider } from "@/components/currency-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToasterProvider />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ShopTimezoneProvider><CurrencyProvider>{children}</CurrencyProvider></ShopTimezoneProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
