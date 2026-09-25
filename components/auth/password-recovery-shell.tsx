"use client";

import type { ReactNode } from "react";
import { Moon, ShoppingBag, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PasswordRecoveryShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 px-4 py-8 text-foreground dark:from-[#060409] dark:via-[#0c0a12] dark:to-[#100802] sm:px-6">
      <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-400/8" />
      <div aria-hidden className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl dark:bg-orange-500/8" />
      <button
        type="button"
        onClick={() => setTheme(dark ? "light" : "dark")}
        className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-700/20 bg-background/70 text-amber-700 shadow-sm backdrop-blur transition hover:bg-background dark:text-amber-400 sm:right-6 sm:top-6"
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <Card className="relative w-full max-w-md gap-5 overflow-hidden border-amber-700/20 bg-card/90 py-0 shadow-2xl backdrop-blur-md dark:border-amber-500/20 dark:bg-card/85">
        <div className="h-1 w-full bg-gradient-to-r from-amber-900 via-amber-500 to-amber-900" />
        <CardHeader className="px-6 pt-7 text-center sm:px-8">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-600/20 bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-700 dark:text-amber-400">Binhlaig POS</p>
          <CardTitle className="mt-1 text-2xl font-semibold sm:text-3xl">{title}</CardTitle>
          <CardDescription className="mx-auto max-w-sm leading-6">{description}</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-7 sm:px-8 sm:pb-8">{children}</CardContent>
      </Card>
    </main>
  );
}
