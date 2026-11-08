// "use client";

// import * as React from "react";
// import { SessionProvider } from "next-auth/react";
// import { ThemeProvider } from "@/components/theme-provider";
// import ToasterProvider from "@/lib/Toasterprovider";
// import { ShopTimezoneProvider } from "@/components/shop-timezone-provider";
// import { CurrencyProvider } from "@/components/currency-provider";

// export default function Providers({ children }: { children: React.ReactNode }) {
//   return (
//     <SessionProvider refetchInterval={60} refetchOnWindowFocus>
//       <ToasterProvider />
//       <ThemeProvider
//         attribute="class"
//         defaultTheme="system"
//         enableSystem
//         disableTransitionOnChange
//       >
//         <ShopTimezoneProvider><CurrencyProvider>{children}</CurrencyProvider></ShopTimezoneProvider>
//       </ThemeProvider>
//     </SessionProvider>
//   );
// }



"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

import { ThemeProvider } from "@/components/theme-provider";
import ToasterProvider from "@/lib/Toasterprovider";
import { ShopTimezoneProvider } from "@/components/shop-timezone-provider";
import { CurrencyProvider } from "@/components/currency-provider";

type ProvidersProps = {
  children: ReactNode;
};

const SESSION_REFETCH_INTERVAL = 60;

export default function Providers({
  children,
}: ProvidersProps) {
  return (
    <SessionProvider
      refetchInterval={SESSION_REFETCH_INTERVAL}
      refetchOnWindowFocus={false}
    >
      <ToasterProvider />

      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ShopTimezoneProvider>
          <CurrencyProvider>
            {children}
          </CurrencyProvider>
        </ShopTimezoneProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
