"use client";

import * as React from "react";
import { Menu, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ThemeMode } from "@/lib/dashboard-data";

export function DashboardLayout({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: ThemeMode;
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className={theme === "dark" ? "relative min-h-screen bg-[#030712] text-white" : "relative min-h-screen bg-[#f6f8fc] text-slate-900"}>
      <div
        className={
          theme === "dark"
            ? "absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.14),transparent_30%)]"
            : "absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.08),transparent_28%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.08),transparent_30%)]"
        }
      />

      <div
        className={
          theme === "dark"
            ? "absolute inset-0 opacity-70 [background-size:30px_30px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]"
            : "absolute inset-0 opacity-70 [background-size:30px_30px] [background-image:linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)]"
        }
      />

      <div className="relative z-10 flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r transition-transform lg:static lg:translate-x-0 ${
            theme === "dark"
              ? "border-white/10 bg-black/30 backdrop-blur-xl"
              : "border-slate-200 bg-white/80 backdrop-blur-xl"
          } ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className={theme === "dark"
            ? "flex items-center justify-between border-b border-white/10 p-5"
            : "flex items-center justify-between border-b border-slate-200 p-5"
          }>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />
              <span className="font-semibold">BINHLAIG</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-2 p-4">
            {["Dashboard", "Analytics", "Orders", "Products", "Customers", "Reports", "Settings"].map((item) => (
              <div
                key={item}
                className={
                  item === "Dashboard"
                    ? theme === "dark"
                      ? "rounded-xl bg-white/10 px-4 py-3 text-sm text-white"
                      : "rounded-xl bg-slate-900 px-4 py-3 text-sm text-white"
                    : theme === "dark"
                    ? "rounded-xl px-4 py-3 text-sm text-white/65 hover:bg-white/5 hover:text-white"
                    : "rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }
              >
                {item}
              </div>
            ))}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
            <div className="mb-6 flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className={theme === "dark"
                  ? "border-white/10 bg-white/5 text-white lg:hidden"
                  : "border-slate-200 bg-white text-slate-900 lg:hidden"
                }
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div>
                <div className={theme === "dark"
                  ? "mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur"
                  : "mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 backdrop-blur"
                }>
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  Premium Dashboard
                </div>

                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className={theme === "dark" ? "mt-1 text-sm text-white/55" : "mt-1 text-sm text-slate-500"}>
                  Aceternity UI + shadcn/ui production dashboard
                </p>
              </div>
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}