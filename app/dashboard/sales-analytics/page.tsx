"use client";
import { formatShopDate, calendarDateKey, getShopTimezone, shopCalendarDate, parseTimestamp } from "@/lib/date-time";
import { useShopTimezone } from "@/components/shop-timezone-provider";
import { useCurrency } from "@/components/currency-provider";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { AnimatePresence, animate, motion, useMotionValue } from "framer-motion";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Eye,
  Flame,
  GripVertical,
  RefreshCw,
  ShoppingCart,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────
type Sale = { id: string; created_at: string; total: number };
type Granularity = "hour" | "day" | "month" | "year";
type Metric = "revenue" | "orders";
type DatePreset = "today" | "yesterday" | "7d" | "month" | "custom";
type ThemeMode = "day" | "night";
type StatCardItem = {
  id: string;
  title: string;
  value: string;
  numericValue: number;
  sub: string;
  change: number;
  icon: React.ElementType;
  accent: string;
  sparkData: number[];
};
type ThemeTokens = {
  pageBg: string;
  pageText: string;
  mutedText: string;
  softText: string;
  cardBg: string;
  cardInnerBg: string;
  panelBg: string;
  panelBorder: string;
  buttonBg: string;
  buttonHover: string;
  divider: string;
  chartGrid: string;
  chartTick: string;
  tooltipBg: string;
  tooltipBorder: string;
  emptyHeat: string;
  topBar: string;
  footerText: string;
  glowOne: string;
  glowTwo: string;
  glowThree: string;
};
// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────
const CARD_ORDER_KEY = "SALES_ANALYTICS_CARD_ORDER_V3";
const RECEIPT_ENDPOINTS = [
  "/api/restaurant/payments",
  "/api/restaurant/payments/shop",
  "/api/restaurant/payments/my",
  "/api/pos/receipts",
  "/api/pos/receipts/shop",
  "/api/pos/receipts/my",
];
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080";
function cleanApiBase(base: string) {
  return base.replace(/\/+$/, "");
}
function apiUrl(base: string, path: string) {
  const cleanBase = cleanApiBase(base);
  return cleanBase.endsWith("/api")
    ? `${cleanBase}${path}`
    : `${cleanBase}/api${path}`;
}
function endpointCandidates(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return Array.from(
    new Set([
      // Next.js rewrite/proxy style
      `/backend${normalizedPath}`,
      // Direct Spring Boot backend
      apiUrl(API_BASE, normalizedPath),
      // Existing same-origin API route fallback
      normalizedPath,
    ]),
  );
}
const THEME: Record<ThemeMode, ThemeTokens> = {
  night: {
    pageBg: "transparent",
    pageText: "text-white",
    mutedText: "text-slate-400",
    softText: "text-slate-300",
    cardBg: "bg-black",
    cardInnerBg: "bg-white/4",
    panelBg: "bg-black",
    panelBorder: "border-white/10",
    buttonBg: "bg-white/5",
    buttonHover: "hover:bg-white/10 hover:text-white",
    divider: "bg-white/8",
    chartGrid: "rgba(255,255,255,0.06)",
    chartTick: "#64748b",
    tooltipBg: "bg-slate-950",
    tooltipBorder: "border-white/10",
    emptyHeat: "rgba(255,255,255,0.05)",
    topBar: "bg-black",
    footerText: "text-slate-500",
    glowOne: "bg-blue-500/10",
    glowTwo: "bg-violet-600/10",
    glowThree: "bg-emerald-500/8",
  },
  day: {
    pageBg: "transparent",
    pageText: "text-slate-950",
    mutedText: "text-slate-500",
    softText: "text-slate-600",
    cardBg: "bg-white",
    cardInnerBg: "bg-slate-50/90",
    panelBg: "bg-white",
    panelBorder: "border-slate-200",
    buttonBg: "bg-white/80",
    buttonHover: "hover:bg-slate-50 hover:text-blue-700",
    divider: "bg-slate-200",
    chartGrid: "rgba(15,23,42,0.08)",
    chartTick: "#64748b",
    tooltipBg: "bg-white/95",
    tooltipBorder: "border-slate-200",
    emptyHeat: "rgba(15,23,42,0.07)",
    topBar: "bg-white",
    footerText: "text-slate-400",
    glowOne: "bg-blue-300/35",
    glowTwo: "bg-amber-200/45",
    glowThree: "bg-emerald-200/35",
  },
};
// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────
const numberFmt = (n: number) => Number(n || 0).toLocaleString();
function toNumber(value: unknown, fallback = 0) {
  if (value == null || value === "") return fallback;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  const cleaned = String(value)
    .replaceAll(",", "")
    .replace(/\b(?:ks|mmk|jpy|yen|¥)\b/gi, "")
    .replace(/¥/g, "")
    .trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : fallback;
}
function getLocalAccessToken() {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("pos_shop_owner_token") ||
    localStorage.getItem("pos_access_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  ).trim();
}
function buildAuthHeaders(token?: string | null): Record<string, string> {
  const finalToken = String(token || getLocalAccessToken() || "").trim();
  return finalToken
    ? {
        Authorization: finalToken.startsWith("Bearer ")
          ? finalToken
          : `Bearer ${finalToken}`,
      }
    : {};
}
function readArrayPayload(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.payments)) return data.payments;
  if (Array.isArray(data?.data?.payments)) return data.data.payments;
  if (Array.isArray(data?.result?.payments)) return data.result.payments;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.data?.orders)) return data.data.orders;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.receipts)) return data.receipts;
  if (Array.isArray(data?.data?.receipts)) return data.data.receipts;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.page?.content)) return data.page.content;
  if (Array.isArray(data?.data?.rows)) return data.data.rows;
  if (Array.isArray(data?.result?.content)) return data.result.content;
  if (Array.isArray(data?.result?.rows)) return data.result.rows;
  return [];
}
function normalizeReceiptToSale(receipt: any, index: number): Sale | null {
  const rawDate =
    receipt?.paidAt ??
    receipt?.paid_at ??
    receipt?.paymentAt ??
    receipt?.payment_at ??
    receipt?.completedAt ??
    receipt?.completed_at ??
    receipt?.createdAt ??
    receipt?.created_at ??
    receipt?.orderDate ??
    receipt?.order_date ??
    receipt?.createdDate ??
    receipt?.created_date ??
    receipt?.date ??
    receipt?.timestamp ??
    null;
  const date = shopCalendarDate(rawDate);
  if (Number.isNaN(date.getTime())) return null;
  const total = toNumber(
    receipt?.total ??
      receipt?.totalAmount ??
      receipt?.total_amount ??
      receipt?.grandTotal ??
      receipt?.grand_total ??
      receipt?.paidAmount ??
      receipt?.paid_amount ??
      receipt?.netTotal ??
      receipt?.net_total ??
      receipt?.amount ??
      receipt?.finalTotal ??
      receipt?.final_total ??
      receipt?.subtotal ??
      receipt?.subTotal ??
      0
  );
  if (total <= 0) return null;
  return {
    id: String(
      receipt?.paymentId ??
        receipt?.payment_id ??
        receipt?.paymentNo ??
        receipt?.payment_no ??
        receipt?.receiptNo ??
        receipt?.receipt_no ??
        receipt?.orderNo ??
        receipt?.order_no ??
        receipt?.id ??
        `${date.toISOString()}-${index}`
    ),
    created_at: String(rawDate),
    total,
  };
}
function normalizeReceiptsToSales(data: any): Sale[] {
  return readArrayPayload(data)
    .map(normalizeReceiptToSale)
    .filter(Boolean) as Sale[];
}
async function readErrorText(res: Response) {
  const ct = res.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const data = await res.json();
      return data?.message || data?.error || JSON.stringify(data);
    }
    return (await res.text()) || "";
  } catch {
    return "";
  }
}
async function fetchReceiptsFromApi(token?: string | null): Promise<Sale[]> {
  let lastError = "";
  let checked = 0;
  for (const endpoint of RECEIPT_ENDPOINTS) {
    for (const candidateUrl of endpointCandidates(endpoint)) {
      checked += 1;
      try {
        const url = `${candidateUrl}${candidateUrl.includes("?") ? "&" : "?"}_ts=${Date.now()}`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...buildAuthHeaders(token),
          },
          cache: "no-store",
          credentials: "include",
        });
        if (res.status === 404) {
          lastError = `${candidateUrl} not found`;
          console.log("SALES_ANALYTICS_ENDPOINT_RESULT", candidateUrl, 0, "404");
          continue;
        }
        if (res.status === 401 || res.status === 403) {
          lastError = `${candidateUrl}: Unauthorized`;
          console.log("SALES_ANALYTICS_ENDPOINT_RESULT", candidateUrl, 0, res.status);
          continue;
        }
        if (!res.ok) {
          const detail = await readErrorText(res);
          lastError = detail || `${candidateUrl} failed: ${res.status}`;
          console.log("SALES_ANALYTICS_ENDPOINT_RESULT", candidateUrl, 0, res.status, detail);
          continue;
        }
        const data = await res.json().catch(() => null);
        const rows = normalizeReceiptsToSales(data);
        console.log("SALES_ANALYTICS_ENDPOINT_RESULT", candidateUrl, rows.length, data);
        // ✅ 200 OK ဖြစ်ပေမယ့် [] ဖြစ်ရင် နောက် endpoint / fallback URL ကို ဆက်စမ်းမယ်
        if (rows.length > 0) {
          return rows;
        }
        lastError = `${candidateUrl} returned empty data`;
      } catch (error) {
        lastError =
          error instanceof Error ? error.message : "Receipt API fetch failed";
        console.log("SALES_ANALYTICS_ENDPOINT_RESULT", candidateUrl, 0, lastError);
      }
    }
  }
  console.warn("SALES_ANALYTICS_NO_ROWS", { checked, lastError });
  return [];
}
function startOfWeek(d: Date) {
  const date = new Date(d);
  date.setUTCDate(date.getUTCDate() - date.getUTCDay());
  date.setUTCHours(0, 0, 0, 0);
  return date;
}
function toDateInputValue(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function startOfDay(date: Date) {
  const next = new Date(date);
  next.setUTCHours(0, 0, 0, 0);
  return next;
}
function endOfDay(date: Date) {
  const next = new Date(date);
  next.setUTCHours(23, 59, 59, 999);
  return next;
}
function resolveDateRange(
  preset: DatePreset,
  customStart: string,
  customEnd: string,
) {
  const now = shopCalendarDate();
  let start = startOfDay(now);
  let end = endOfDay(now);
  if (preset === "yesterday") {
    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    start = startOfDay(yesterday);
    end = endOfDay(yesterday);
  }
  if (preset === "7d") {
    start = startOfDay(now);
    start.setUTCDate(start.getUTCDate() - 6);
    end = endOfDay(now);
  }
  if (preset === "month") {
    start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    end = endOfDay(now);
  }
  if (preset === "custom") {
    const parsedStart = customStart ? new Date(`${customStart}T00:00:00Z`) : null;
    const parsedEnd = customEnd ? new Date(`${customEnd}T23:59:59.999Z`) : null;
    if (parsedStart && !Number.isNaN(parsedStart.getTime())) {
      start = parsedStart;
    }
    if (parsedEnd && !Number.isNaN(parsedEnd.getTime())) {
      end = parsedEnd;
    }
  }
  return { start, end };
}
function isSaleInRange(sale: Sale, start: Date, end: Date) {
  const date = shopCalendarDate(sale.created_at);
  if (Number.isNaN(date.getTime())) return false;
  return date >= start && date <= end;
}
function buildHourBuckets() {
  return Array.from({ length: 24 }, (_, h) => ({
    label: `${String(h).padStart(2, "0")}:00`,
    hour: h,
    revenue: 0,
    orders: 0,
  }));
}
function loadCardOrder(defaults: string[]) {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(CARD_ORDER_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as string[];
    const valid = parsed.filter((id) => defaults.includes(id));
    const missing = defaults.filter((id) => !valid.includes(id));
    return [...valid, ...missing];
  } catch {
    return defaults;
  }
}
function AnimatedNumber({ value, format }: { value: number; format: (n: number) => string }) {
  const shopTimezone = useShopTimezone();
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        if (ref.current) ref.current.textContent = format(Math.round(latest));
      },
    });
    return controls.stop;
  }, [format, motionVal, value, shopTimezone]);
  return <span ref={ref}>{format(0)}</span>;
}
// ────────────────────────────────────────────────────────────────────────────
// Mini Sparkline
// ────────────────────────────────────────────────────────────────────────────
function Sparkline({ data, color, id }: { data: number[]; color: string; id: string }) {
  const shopTimezone = useShopTimezone();
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 80;
  const h = 32;
  const pts = data.map((v, i) => {
    const x = data.length === 1 ? 0 : (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  });
  const path = `M ${pts.join(" L ")}`;
  const fill = `M ${pts[0]} L ${pts.join(" L ")} L ${w},${h} L 0,${h} Z`;
  const gradientId = `spark-${id}`;
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#${gradientId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
// ────────────────────────────────────────────────────────────────────────────
// Custom Tooltip
// ────────────────────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, metric, theme }: any) {
  const shopTimezone = useShopTimezone();
  const { formatSharedMoney: money } = useCurrency();
  if (!active || !payload?.length) return null;
  const t = THEME[(theme as ThemeMode) || "night"];
  return (
    <div className={`rounded-2xl border ${t.tooltipBorder} ${t.tooltipBg} p-3 shadow-2xl `}>
      <p className={`mb-2 text-[11px] font-semibold uppercase tracking-widest ${t.mutedText}`}>{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className={t.softText}>{entry.name === "thisWeek" ? "Selected" : "Previous"}:</span>
          <span className={`font-bold ${t.pageText}`}>
            {metric === "revenue" ? money(entry.value) : numberFmt(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
// ────────────────────────────────────────────────────────────────────────────
// Sortable KPI Card
// ────────────────────────────────────────────────────────────────────────────
function SortableStatCard({ item, theme }: { item: StatCardItem; theme: ThemeMode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const Icon = item.icon;
  const t = THEME[theme];
  const color = item.id === "revenue" ? "text-blue-600 dark:text-blue-400" : item.id === "orders" ? "text-emerald-600 dark:text-emerald-400" : item.id === "average" ? "text-violet-600 dark:text-violet-400" : "text-amber-600 dark:text-amber-400";
  const tint = item.id === "revenue" ? "bg-blue-50 dark:bg-blue-500/10" : item.id === "orders" ? "bg-emerald-50 dark:bg-emerald-500/10" : item.id === "average" ? "bg-violet-50 dark:bg-violet-500/10" : "bg-amber-50 dark:bg-amber-500/10";
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`h-full rounded-2xl border ${t.panelBorder} ${t.cardBg} ${isDragging ? "z-30 shadow-xl" : "shadow-sm"}`}>
    <div className="p-5">
      <div className="flex items-center justify-between gap-3">
        <p className={`text-sm font-medium ${t.softText}`}>{item.title}</p>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tint} ${color}`}><Icon className="h-4 w-4" /></div>
      </div>
      <p className={`mt-3 break-words text-2xl font-bold tracking-tight tabular-nums ${t.pageText}`}><AnimatedNumber value={item.numericValue} format={() => item.value} /></p>
      <p className={`mt-1 text-xs ${t.mutedText}`}>{item.sub}</p>
      <div className={`mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 ${t.panelBorder}`}>
        {item.id === "peak" ? <span className={`text-xs ${t.mutedText}`}>Busiest hour by revenue</span> :
          <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${item.change === 0 ? "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400" : item.change > 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"}`}>
            {item.change > 0 ? <ArrowUpRight size={13} /> : item.change < 0 ? <ArrowDownRight size={13} /> : null}{item.change > 0 ? "+" : ""}{item.change.toFixed(1)}%<span className="font-normal">vs previous</span>
          </span>}
        <button type="button" {...attributes} {...listeners} aria-label={`Reorder ${item.title}`} className={`flex h-8 w-8 touch-none items-center justify-center rounded-lg ${t.mutedText} ${t.buttonHover}`}><GripVertical size={14} /></button>
      </div>
    </div>
  </div>;
}
// ────────────────────────────────────────────────────────────────────────────
// Hourly Heatmap
// ────────────────────────────────────────────────────────────────────────────
function HourlyHeatmap({ sales, metric, theme }: { sales: Sale[]; metric: Metric; theme: ThemeMode }) {
  const shopTimezone = useShopTimezone();
  const { formatSharedMoney: money } = useCurrency();
  const weekStart = startOfWeek(shopCalendarDate());
  const buckets = buildHourBuckets();
  const t = THEME[theme];
  for (const s of sales) {
    const d = shopCalendarDate(s.created_at);
    if (d >= weekStart) {
      buckets[d.getUTCHours()].revenue += s.total;
      buckets[d.getUTCHours()].orders += 1;
    }
  }
  const values = buckets.map((b) => b[metric]);
  const max = Math.max(...values, 1);
  return (
    <div className="grid grid-cols-12 gap-1">
      {buckets.map((b) => {
        const intensity = b[metric] / max;
        return (
          <div key={b.hour} className="group relative">
            <div
              className="h-6 rounded-md transition-all duration-300 group-hover:scale-110"
              style={{
                background:
                  intensity > 0
                    ? `rgba(14, 165, 233, ${0.12 + intensity * 0.8})`
                    : t.emptyHeat,
              }}
            />
            <div className={`absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border ${t.tooltipBorder} ${t.tooltipBg} px-2 py-1 text-[10px] ${t.pageText} shadow-lg group-hover:block`}>
              {b.label}: {metric === "revenue" ? money(b[metric]) : b[metric]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
// ────────────────────────────────────────────────────────────────────────────
// Top Hours List
// ────────────────────────────────────────────────────────────────────────────
function TopHours({ sales, metric, theme }: { sales: Sale[]; metric: Metric; theme: ThemeMode }) {
  const shopTimezone = useShopTimezone();
  const { formatSharedMoney: money } = useCurrency();
  const weekStart = startOfWeek(new Date());
  const buckets = buildHourBuckets();
  const t = THEME[theme];
  for (const s of sales) {
    const d = shopCalendarDate(s.created_at);
    if (d >= weekStart) {
      buckets[d.getUTCHours()].revenue += s.total;
      buckets[d.getUTCHours()].orders += 1;
    }
  }
  const top5 = [...buckets].sort((a, b) => b[metric] - a[metric]).slice(0, 5);
  const max = Math.max(top5[0]?.[metric] ?? 0, 1);
  return (
    <div className="space-y-2">
      {top5.map((b, i) => (
        <div key={b.hour} className="flex items-center gap-3">
          <span className={`w-4 text-[11px] font-bold ${t.mutedText}`}>#{i + 1}</span>
          <span className={`w-14 text-xs ${t.softText}`}>{b.label}</span>
          <div className={`h-1.5 flex-1 overflow-hidden rounded-full ${theme === "day" ? "bg-slate-100" : "bg-white/5"}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(b[metric] / max) * 100}%` }}
              transition={{ delay: i * 0.08, duration: 0.7, ease: "easeOut" }}
              className="h-full rounded-full bg-blue-400"
            />
          </div>
          <span className={`w-20 text-right text-xs font-semibold ${t.pageText}`}>
            {metric === "revenue" ? money(b[metric]) : b[metric]}
          </span>
        </div>
      ))}
    </div>
  );
}
// ────────────────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────────────────
function SalesAnalyticsDashboardContent() {
  const shopTimezone = useShopTimezone();
  const { currencySettings, formatSharedCompactMoney , formatSharedMoney: money } = useCurrency();
  const { data: session, status } = useSession();
  const token =
    (session as any)?.accessToken ||
    (session as any)?.access_token ||
    (session as any)?.token ||
    (session as any)?.user?.accessToken ||
    (session as any)?.user?.token ||
    getLocalAccessToken() ||
    null;
  const [granularity, setGranularity] = useState<Granularity>("hour");
  const [metric, setMetric] = useState<Metric>("revenue");
  const [sales, setSales] = useState<Sale[]>([]);
  const [datePreset, setDatePreset] = useState<DatePreset>("today");
  const [customStartDate, setCustomStartDate] = useState(() => toDateInputValue(shopCalendarDate()));
  const [customEndDate, setCustomEndDate] = useState(() => toDateInputValue(shopCalendarDate()));
  const [cardOrder, setCardOrder] = useState(["revenue", "orders", "average", "peak"]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState("");
  const { resolvedTheme } = useTheme();
  const theme: ThemeMode = resolvedTheme === "dark" ? "night" : "day";
  const t = THEME[theme];
  const isDay = theme === "day";
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const selectedDateRange = useMemo(
    () => resolveDateRange(datePreset, customStartDate, customEndDate),
    [datePreset, customStartDate, customEndDate, shopTimezone],
  );
  const filteredSales = useMemo(
    () =>
      sales.filter((sale) =>
        isSaleInRange(sale, selectedDateRange.start, selectedDateRange.end),
      ),
    [sales, selectedDateRange, shopTimezone],
  );
  const dateRangeLabel = useMemo(() => {
    const start = formatShopDate(calendarDateKey(selectedDateRange.start), getShopTimezone(), undefined, undefined);
    const end = formatShopDate(calendarDateKey(selectedDateRange.end), getShopTimezone(), undefined, undefined);
    if (datePreset === "today") return "Today";
    if (datePreset === "yesterday") return "Yesterday";
    if (datePreset === "7d") return "Last 7 days";
    if (datePreset === "month") return "This month";
    return start === end ? start : `${start} - ${end}`;
  }, [datePreset, selectedDateRange, shopTimezone]);
  useEffect(() => {
    setCardOrder(loadCardOrder(["revenue", "orders", "average", "peak"]));
  }, [shopTimezone]);
  useEffect(() => {
    if (status === "loading") return;
    if (!token) {
      setApiError("Session token မရပါ။ ပြန် login ဝင်ပါ။");
      setSales([]);
      return;
    }
    void loadSalesFromApi(token);
  }, [status, token, shopTimezone]);
  async function loadSalesFromApi(accessToken = token) {
    try {
      setIsRefreshing(true);
      setApiError("");
      const rows = await fetchReceiptsFromApi(accessToken);
      setSales(rows);
      if (rows.length === 0) {
        setApiError(
          "Restaurant payment data မတွေ့သေးပါ။ Console ထဲက SALES_ANALYTICS_ENDPOINT_RESULT ကိုစစ်ပါ။ Backend GET /api/restaurant/payments ရှိရပါမယ်။",
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sales load failed.";
      setApiError(message);
      setSales([]);
    } finally {
      setIsRefreshing(false);
    }
  }
  const handleRefresh = () => {
    if (!token) {
      setApiError("Session token မရပါ။ ပြန် login ဝင်ပါ။");
      return;
    }
    void loadSalesFromApi(token);
  };
  // ── Analytics ──────────────────────────────────────────────────────────────
  const analytics = useMemo(() => {
    const rangeMs = Math.max(
      1,
      selectedDateRange.end.getTime() - selectedDateRange.start.getTime(),
    );
    const previousEnd = new Date(selectedDateRange.start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - rangeMs);
    let thisWeekRevenue = 0;
    let lastWeekRevenue = 0;
    let thisWeekOrders = 0;
    let lastWeekOrders = 0;
    const hourBuckets = buildHourBuckets();
    for (const s of sales) {
      const d = shopCalendarDate(s.created_at);
      if (Number.isNaN(d.getTime())) continue;
      if (d >= selectedDateRange.start && d <= selectedDateRange.end) {
        thisWeekRevenue += s.total;
        thisWeekOrders++;
        hourBuckets[d.getUTCHours()].revenue += s.total;
        hourBuckets[d.getUTCHours()].orders++;
      } else if (d >= previousStart && d <= previousEnd) {
        lastWeekRevenue += s.total;
        lastWeekOrders++;
      }
    }
    const avgOrderValue = thisWeekOrders > 0 ? thisWeekRevenue / thisWeekOrders : 0;
    const peakHour = [...hourBuckets].sort((a, b) => b.revenue - a.revenue)[0] ?? {
      label: "--:00",
      revenue: 0,
      orders: 0,
    };
    return {
      thisWeekRevenue,
      lastWeekRevenue,
      thisWeekOrders,
      lastWeekOrders,
      avgOrderValue,
      peakHour,
      hourBuckets,
    };
  }, [sales, selectedDateRange, shopTimezone]);
  // ── Chart data ─────────────────────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (granularity === "hour") {
      const buckets = buildHourBuckets();
      for (const s of filteredSales) {
        const d = shopCalendarDate(s.created_at);
        const h = d.getUTCHours();
        buckets[h].revenue += s.total;
        buckets[h].orders++;
      }
      return buckets.map((b) => ({
        label: b.label,
        thisWeek: b[metric],
        lastWeek: 0,
      }));
    }
    const map = new Map<string, { label: string; thisWeek: number; lastWeek: number }>();
    for (const s of filteredSales) {
      const d = shopCalendarDate(s.created_at);
      const key =
        granularity === "day"
          ? d.toISOString().slice(0, 10)
          : granularity === "month"
            ? d.toISOString().slice(0, 7)
            : String(d.getUTCFullYear());
      const row = map.get(key) ?? { label: key, thisWeek: 0, lastWeek: 0 };
      row.thisWeek += metric === "revenue" ? s.total : 1;
      map.set(key, row);
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [filteredSales, granularity, metric, shopTimezone]);
  const growthPct = useMemo(() => {
    const prev = metric === "revenue" ? analytics.lastWeekRevenue : analytics.lastWeekOrders;
    const curr = metric === "revenue" ? analytics.thisWeekRevenue : analytics.thisWeekOrders;
    if (prev <= 0 && curr > 0) return 100;
    if (prev <= 0) return 0;
    return ((curr - prev) / prev) * 100;
  }, [analytics, metric, shopTimezone]);
  const revenueGrowth = useMemo(() => {
    const { thisWeekRevenue: c, lastWeekRevenue: p } = analytics;
    if (p <= 0 && c > 0) return 100;
    if (p <= 0) return 0;
    return ((c - p) / p) * 100;
  }, [analytics, shopTimezone]);
  const ordersGrowth = useMemo(() => {
    const { thisWeekOrders: c, lastWeekOrders: p } = analytics;
    if (p <= 0 && c > 0) return 100;
    if (p <= 0) return 0;
    return ((c - p) / p) * 100;
  }, [analytics, shopTimezone]);
  const revenueSparkData = analytics.hourBuckets.filter((_, i) => i % 2 === 0).map((b) => b.revenue);
  const ordersSparkData = analytics.hourBuckets.filter((_, i) => i % 2 === 0).map((b) => b.orders);
  const statCards = useMemo<StatCardItem[]>(() => {
    const all: StatCardItem[] = [
      {
        id: "revenue",
        title: "Total Revenue",
        value: money(analytics.thisWeekRevenue),
        numericValue: analytics.thisWeekRevenue,
        sub: `Last: ${money(analytics.lastWeekRevenue)}`,
        change: revenueGrowth,
        icon: Wallet,
        accent: "#3b82f6",
        sparkData: revenueSparkData,
      },
      {
        id: "orders",
        title: "Total Orders",
        value: numberFmt(analytics.thisWeekOrders),
        numericValue: analytics.thisWeekOrders,
        sub: `Last: ${numberFmt(analytics.lastWeekOrders)}`,
        change: ordersGrowth,
        icon: ShoppingCart,
        accent: "#4ade80",
        sparkData: ordersSparkData,
      },
      {
        id: "average",
        title: "Avg Order Value",
        value: money(analytics.avgOrderValue),
        numericValue: analytics.avgOrderValue,
        sub: "Per receipt in selected period",
        change: (() => { const previous = analytics.lastWeekOrders ? analytics.lastWeekRevenue / analytics.lastWeekOrders : 0; return previous ? (analytics.avgOrderValue - previous) / previous * 100 : 0; })(),
        icon: Target,
        accent: "#a78bfa",
        sparkData: revenueSparkData.map((v, i) => v / (ordersSparkData[i] || 1)),
      },
      {
        id: "peak",
        title: "Peak Hour",
        value: analytics.thisWeekOrders ? analytics.peakHour.label : "—",
        numericValue: analytics.peakHour.revenue,
        sub: money(analytics.peakHour.revenue),
        change: 0,
        icon: Flame,
        accent: "#fb923c",
        sparkData: revenueSparkData,
      },
    ];
    const map = new Map(all.map((item) => [item.id, item]));
    return cardOrder.map((id) => map.get(id)).filter(Boolean) as StatCardItem[];
  }, [analytics, cardOrder, revenueGrowth, ordersGrowth, revenueSparkData, ordersSparkData, currencySettings, shopTimezone]);
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setCardOrder((prev) => {
      const next = arrayMove(prev, prev.indexOf(String(active.id)), prev.indexOf(String(over.id)));
      localStorage.setItem(CARD_ORDER_KEY, JSON.stringify(next));
      return next;
    });
  }
  // ────────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative py-5"
      
    >
      <div className="relative mx-auto w-full max-w-[1920px] space-y-4">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className={`text-2xl font-bold tracking-tight sm:text-3xl ${t.pageText}`}>Sales Analytics</h1>
              <p className={`mt-1 text-sm ${t.mutedText}`}>
                {`${filteredSales.length} / ${sales.length} receipts · ${dateRangeLabel}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span role="status" className={`rounded-full border px-3 py-1.5 text-xs font-medium ${apiError ? "border-red-500/20 bg-red-500/10 text-red-500" : `${t.panelBorder} ${t.cardInnerBg} ${t.softText}`}`}>{isRefreshing || status === "loading" ? "Loading…" : apiError ? "Load failed" : "Receipts loaded"}</span>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing || status === "loading"}
              className={`flex h-10 gap-2 px-4 disabled:opacity-40 items-center justify-center rounded-xl border ${t.panelBorder} ${t.buttonBg} ${t.softText} transition ${t.buttonHover}`}
              aria-label="Refresh receipt API data"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /><span className="text-sm font-semibold">Refresh</span>
            </button>
          </div>
        </motion.div>
        {apiError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{apiError}</div>}
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`flex flex-wrap items-center gap-3 rounded-2xl border ${t.panelBorder} ${t.panelBg} p-3 shadow-sm `}
        >
          <div className={`flex rounded-xl border ${t.panelBorder} ${isDay ? "bg-white" : "bg-white/4"} p-1`}>
            {(["revenue", "orders"] as Metric[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                className={`min-h-10 rounded-xl px-4 py-2 text-sm font-semibold capitalize transition-all ${
                  metric === m
                    ? "bg-blue-500 text-white shadow-sm"
                    : `${t.softText} hover:text-blue-500`
                }`}
              >
                {m === "revenue" ? "Revenue" : "Orders"}
              </button>
            ))}
          </div>
          <div className={`h-6 w-px ${t.divider}`} />
          <div className="flex flex-wrap gap-1.5">
            {(["hour", "day", "month", "year"] as Granularity[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGranularity(g)}
                className={`min-h-10 rounded-xl px-3 py-2 text-sm font-semibold capitalize transition-all ${
                  granularity === g
                    ? isDay
                      ? "bg-blue-600 text-white"
                      : "bg-blue-600 text-white"
                    : `${t.mutedText} hover:text-blue-500`
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <div className={`h-6 w-px ${t.divider}`} />
          <div className="flex flex-wrap items-center gap-2">
            {([
              ["today", "Today"],
              ["yesterday", "Yesterday"],
              ["7d", "7 Days"],
              ["month", "Month"],
              ["custom", "Custom"],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setDatePreset(key)}
                className={`min-h-10 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                  datePreset === key
                    ? "bg-blue-500 text-white shadow-sm"
                    : `${t.mutedText} hover:text-blue-500`
                }`}
              >
                {label}
              </button>
            ))}
            {datePreset === "custom" && (
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(event) => setCustomStartDate(event.target.value)}
                  className={`rounded-lg border ${t.panelBorder} ${t.buttonBg} px-3 py-1.5 text-sm ${t.pageText} outline-none`}
                />
                <span className={`text-xs ${t.mutedText}`}>to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(event) => setCustomEndDate(event.target.value)}
                  className={`rounded-lg border ${t.panelBorder} ${t.buttonBg} px-3 py-1.5 text-sm ${t.pageText} outline-none`}
                />
              </div>
            )}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                growthPct >= 0 ? "bg-emerald-500/15 text-emerald-500" : "bg-rose-500/15 text-rose-500"
              }`}
            >
              {growthPct >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {growthPct >= 0 ? "+" : ""}
              {growthPct.toFixed(1)}%
            </span>
          </div>
        </motion.div>
        {/* KPI Cards */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={cardOrder} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map((item) => (
                <SortableStatCard key={item.id} item={item} theme={theme} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* Chart panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className={`rounded-2xl border ${t.panelBorder} ${t.panelBg} p-5 shadow-sm `}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className={`text-base font-bold ${t.pageText}`}>{metric === "revenue" ? "Revenue Trend" : "Orders Trend"}</h2>
                <p className={`mt-0.5 text-xs ${t.mutedText}`}>
                  {dateRangeLabel} · <span className="capitalize">{granularity}</span> view
                </p>
              </div>
              <div className={`flex items-center gap-3 text-xs ${t.mutedText}`}>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-5 rounded-full bg-blue-400" />
                  Selected
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-5 rounded-full bg-slate-500" />
                  Previous
                </span>
              </div>
            </div>
            <div className="relative h-[300px] sm:h-[360px] 2xl:h-[400px]">
              {filteredSales.length === 0 && <div className={`absolute inset-0 z-10 flex items-center justify-center rounded-xl ${t.panelBg}`}><div className="text-center"><BarChart3 className={`mx-auto mb-3 h-9 w-9 ${t.mutedText}`} /><p className={`text-sm font-medium ${t.pageText}`}>{isRefreshing ? "Loading sales…" : "No sales in this period"}</p><p className={`mt-1 text-xs ${t.mutedText}`}>Choose another date range to view sales.</p></div></div>}
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                  <defs>
                    <linearGradient id="gradThis" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.16} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradLast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={t.chartGrid} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: t.chartTick, fontSize: 11 }}
                    minTickGap={20}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: t.chartTick, fontSize: 11 }}
                    width={60}
                    tickFormatter={(v) => (metric === "revenue" ? formatSharedCompactMoney(Number(v)) : String(v))}
                  />
                  <Tooltip content={<CustomTooltip metric={metric} theme={theme} />} />
                  <Area dataKey="lastWeek" type="monotone" stroke="#64748b" fill="url(#gradLast)" strokeWidth={1.5} strokeDasharray="4 4" />
                  <Area dataKey="thisWeek" type="monotone" stroke="#3b82f6" fill="url(#gradThis)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className={`mt-5 rounded-xl border ${t.panelBorder} ${isDay ? "bg-white/70" : "bg-white/[0.02]"} p-4`}>
              <p className={`mb-3 flex items-center gap-2 text-xs font-semibold ${t.softText}`}>
                <Eye className="h-3.5 w-3.5" />
                Hourly activity heatmap (selected dates)
              </p>
              <HourlyHeatmap sales={filteredSales} metric={metric} theme={theme} />
              <div className={`mt-2 flex justify-between text-[10px] ${t.mutedText}`}>
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
            </div>
          </motion.div>
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18 }}
            className="space-y-4 xl:sticky xl:top-6 xl:self-start"
          >
            <div className={`rounded-2xl border ${t.panelBorder} ${t.panelBg} p-5 shadow-sm `}>
              <h3 className={`mb-4 flex items-center gap-2 text-sm font-bold ${t.pageText}`}>
                <Zap className="h-4 w-4 text-amber-400" />
                Quick Summary
              </h3>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${metric}-${granularity}-${theme}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-2"
                >
                  {[
                    { label: "Revenue", value: money(analytics.thisWeekRevenue), color: "#3b82f6" },
                    { label: "Orders", value: numberFmt(analytics.thisWeekOrders), color: "#4ade80" },
                    { label: "Avg Value", value: money(analytics.avgOrderValue), color: "#a78bfa" },
                    { label: "Peak Hour", value: analytics.thisWeekOrders ? analytics.peakHour.label : "—", color: "#fb923c" },
                  ].map((item) => (
                    <div key={item.label} className={`flex items-center justify-between rounded-xl ${t.cardInnerBg} px-4 py-3`}>
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                        <span className={`text-xs ${t.softText}`}>{item.label}</span>
                      </div>
                      <span className={`text-sm font-bold ${t.pageText}`}>{item.value}</span>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className={`rounded-2xl border ${t.panelBorder} ${t.panelBg} p-5 shadow-sm `}>
              <h3 className={`mb-4 flex items-center gap-2 text-sm font-bold ${t.pageText}`}>
                <Star className="h-4 w-4 text-blue-400" />
                Top performing hours
              </h3>
              <TopHours sales={filteredSales} metric={metric} theme={theme} />
            </div>
            <div
              className={`rounded-2xl border p-5 ${t.panelBorder} ${t.panelBg} shadow-sm`}
            >
              
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-500/70">Period comparison</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className={`text-4xl font-bold ${growthPct >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {growthPct >= 0 ? "+" : ""}
                    {growthPct.toFixed(1)}%
                  </span>
                </div>
                <p className={`mt-1.5 text-xs ${t.mutedText}`}>
                  {metric === "revenue" ? `${money(analytics.thisWeekRevenue)} selected` : `${analytics.thisWeekOrders} orders selected`}
                </p>
                <div className={`mt-4 flex items-center gap-2 text-xs ${t.mutedText}`}>
                  {growthPct >= 0 ? (
                    <>
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Trending upward</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                      <span>Down from the previous period</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <p className={`text-xs ${t.footerText}`}>Dates and activity hours use the shop timezone: {getShopTimezone()}.</p>
      </div>
    </div>
  );
}
export default function SalesAnalyticsDashboard() {
  const shopTimezone = useShopTimezone();
  return <SalesAnalyticsDashboardContent />;
}
