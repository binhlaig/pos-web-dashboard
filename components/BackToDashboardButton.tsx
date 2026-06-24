"use client";

import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";

type BackToDashboardButtonProps = {
  className?: string;
  compact?: boolean;
};

export default function BackToDashboardButton({
  className = "",
  compact = false,
}: BackToDashboardButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/dashboard")}
      className={[
        "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/95 font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b3a75]/40 dark:border-white/10 dark:bg-[#06101f]/95 dark:text-white dark:hover:bg-[#0b1324]",
        compact ? "h-10 gap-1.5 px-3 text-xs" : "h-11 gap-2 px-4 text-sm",
        className,
      ].join(" ")}
      aria-label="Back to Dashboard"
    >
      <ArrowLeft className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      <LayoutDashboard className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      <span className="hidden sm:inline">Dashboard</span>
    </button>
  );
}
