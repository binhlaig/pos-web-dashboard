import type { Task, StockItem } from "@/types";
import { cn } from "@/lib/utils";

interface KpiGridProps {
  tasks: Task[];
  stocks: StockItem[];
  onStockClick: () => void;
}

export default function KpiGrid({ tasks, stocks, onStockClick }: KpiGridProps) {
  const done = tasks.filter((t) => t.status === "Done").length;
  const total = tasks.length;
  const pct = Math.round((done / total) * 100);
  const lowStock = stocks.filter((s) => s.level / s.min < 0.4).length;

  const cards = [
    {
      label: "Today's Sales",
      value: "1,245K",
      sub: "MMK",
      trend: "▲ 12.4% vs yesterday",
      trendColor: "text-green-700",
      accent: "border-t-[#b8922a]",
    },
    {
      label: "Customers",
      value: "342",
      sub: "Today total",
      trend: "▲ 28 this hour",
      trendColor: "text-blue-700",
      accent: "border-t-blue-700",
    },
    {
      label: "Stock Alerts",
      value: String(lowStock),
      sub: "Items low",
      trend: "⚠ Restock needed",
      trendColor: "text-red-600",
      accent: "border-t-red-600",
      bg: "bg-red-50",
      onClick: onStockClick,
      clickable: true,
    },
    {
      label: "Tasks Done",
      value: `${done}/${total}`,
      sub: `${pct}% complete`,
      trend: null,
      trendColor: "text-green-700",
      accent: "border-t-green-700",
      progress: pct,
    },
    {
      label: "Avg Checkout",
      value: "4.2 min",
      sub: "Per customer",
      trend: "Rush: 6–8 PM",
      trendColor: "text-amber-700",
      accent: "border-t-amber-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      {cards.map((c) => (
        <div
          key={c.label}
          onClick={c.onClick}
          className={cn(
            "rounded-xl border border-black/8 p-3 border-t-[3px]",
            c.accent,
            c.bg ?? "bg-white",
            c.clickable && "cursor-pointer hover:shadow-sm transition-shadow"
          )}
        >
          <div className="text-[8px] font-bold text-[#9c9b96] uppercase tracking-[0.1em] mb-1.5">
            {c.label}
          </div>
          <div className="text-[20px] font-extrabold text-[#1a1a18] leading-none">{c.value}</div>
          <div className="text-[9px] text-[#9c9b96] mt-1">{c.sub}</div>
          {c.progress !== undefined && (
            <div className="h-1 bg-black/6 rounded-full mt-2">
              <div
                className="h-1 bg-green-700 rounded-full transition-all duration-700"
                style={{ width: `${c.progress}%` }}
              />
            </div>
          )}
          {c.trend && (
            <div className={cn("text-[10px] font-medium mt-1.5", c.trendColor)}>{c.trend}</div>
          )}
        </div>
      ))}
    </div>
  );
}
