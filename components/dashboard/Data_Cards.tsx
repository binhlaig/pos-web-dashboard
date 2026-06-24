import type { Task, StockItem, ActivityItem, TaskStatus, TaskPriority, ActivityType } from "@/types";
import { cn } from "@/lib/utils";

/* ── Task List ── */

const STATUS_CFG: Record<TaskStatus, { bg: string; text: string; label: string }> = {
  Done: { bg: "bg-green-50", text: "text-green-700", label: "Done" },
  "In Progress": { bg: "bg-amber-50", text: "text-amber-700", label: "In Progress" },
  Pending: { bg: "bg-[#f7f6f2]", text: "text-[#9c9b96]", label: "Pending" },
};

const PRI_COLORS: Record<TaskPriority, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-[#9c9b96]",
};

const ROW_BG: Record<TaskStatus, string> = {
  Done: "border-green-200",
  "In Progress": "bg-amber-50/60 border-amber-200",
  Pending: "border-transparent",
};

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const done = tasks.filter((t) => t.status === "Done").length;
  return (
    <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-black/8 flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#1a1a18]">Tasks</span>
        <span className="text-[9px] text-[#9c9b96]">{done}/{tasks.length} done</span>
      </div>
      <div className="p-2 max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-black/10">
        {tasks.map((t) => {
          const s = STATUS_CFG[t.status];
          return (
            <div
              key={t.id}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 border",
                ROW_BG[t.status]
              )}
            >
              <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", PRI_COLORS[t.priority])} />
              <span
                className={cn(
                  "flex-1 text-[10px] font-medium truncate",
                  t.status === "Done" ? "text-[#9c9b96] line-through" : "text-[#1a1a18]"
                )}
              >
                {t.title}
              </span>
              <span
                className={cn(
                  "text-[7px] font-bold rounded-full px-1.5 py-0.5 uppercase tracking-wide whitespace-nowrap",
                  s.bg,
                  s.text
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Stock Alerts ── */

interface StockAlertsProps {
  stocks: StockItem[];
  onOrder: () => void;
}

export function StockAlerts({ stocks, onOrder }: StockAlertsProps) {
  return (
    <div className="bg-white border border-red-200 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-red-100 bg-red-50 flex items-center justify-between">
        <span className="text-[11px] font-bold text-red-600">⚠ Stock Alerts</span>
        <button
          onClick={onOrder}
          className="text-[8px] font-bold text-red-600 bg-white border border-red-200 rounded px-2 py-1 hover:bg-red-50 transition-colors"
        >
          Order ↗
        </button>
      </div>
      <div className="p-2 max-h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-black/10">
        {stocks.map((s) => {
          const pct = Math.round((s.level / s.min) * 100);
          const crit = pct < 40;
          return (
            <div
              key={s.name}
              className={cn(
                "mb-2 px-2.5 py-2 rounded-lg border-l-[3px]",
                crit ? "bg-red-50 border-l-red-500" : "bg-amber-50 border-l-amber-500"
              )}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-medium text-[#1a1a18]">{s.name}</span>
                <span className={cn("text-[9px] font-bold", crit ? "text-red-600" : "text-amber-700")}>
                  {s.level}/{s.min} {s.unit}
                </span>
              </div>
              <div className="h-[3px] bg-black/6 rounded-full">
                <div
                  className={cn("h-[3px] rounded-full transition-all duration-700", crit ? "bg-red-500" : "bg-amber-500")}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Activity Feed ── */

const ACT_CFG: Record<ActivityType, { bg: string; text: string }> = {
  success: { bg: "bg-green-50", text: "text-green-700" },
  warning: { bg: "bg-red-50", text: "text-red-600" },
  info: { bg: "bg-blue-50", text: "text-blue-700" },
};

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-black/8">
        <span className="text-[11px] font-bold text-[#1a1a18]">Activity Feed</span>
      </div>
      <div className="p-2">
        {items.map((a, i) => {
          const cfg = ACT_CFG[a.type];
          return (
            <div key={i} className="flex items-start gap-2 py-1.5 border-b border-black/5 last:border-0">
              <div className={cn("w-5 h-5 rounded-md flex items-center justify-center text-[9px] flex-shrink-0", cfg.bg, cfg.text)}>
                {a.icon}
              </div>
              <span className="flex-1 text-[10px] text-[#1a1a18] leading-snug">{a.text}</span>
              <span className="text-[8px] text-[#9c9b96] whitespace-nowrap mt-0.5">{a.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
