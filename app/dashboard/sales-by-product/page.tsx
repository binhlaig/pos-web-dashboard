"use client";
import { shopCalendarDate } from "@/lib/date-time";
import { useShopTimezone } from "@/components/shop-timezone-provider";
import { useCurrency } from "@/components/currency-provider";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  LayoutGrid,
  BarChart2,
  ImageIcon,
  Coins,
  PackageSearch,
  TrendingUp,
  Zap,
} from "lucide-react";
// dnd-kit
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
/* ─── Types ───────────────────────────────────────────────────────── */
type SaleItem = {
  product_id: string;
  sku: string;
  product_name: string;
  qty: number;
  price: number;
};
type Sale = {
  id: string;
  created_at: string;
  total: number;
  items: SaleItem[];
};
type Granularity = "hour" | "day" | "month" | "year";
type Metric = "revenue" | "qty" | "orders";
type CardView = "info" | "chart" | "image";
/* ─── API / Utils ─────────────────────────────────────────────────────── */
type ReceiptItemApi = {
  id?: number | string;
  productId?: number | string | null;
  product_id?: number | string | null;
  barcode?: string | null;
  sku?: string | null;
  productName?: string | null;
  product_name?: string | null;
  qty?: number | string | null;
  price?: number | string | null;
  lineTotal?: number | string | null;
  line_total?: number | string | null;
};
type ReceiptApi = {
  id?: number | string;
  receiptNo?: string;
  receipt_no?: string;
  createdAt?: string;
  created_at?: string;
  grandTotal?: number | string | null;
  grand_total?: number | string | null;
  total?: number | string | null;
  items?: ReceiptItemApi[];
};
const RECEIPT_ENDPOINTS = [
  "/api/pos/receipts",
  "/api/pos/receipts/shop",
  "/api/pos/receipts/my",
];
function getStoredAccessToken() {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("pos_shop_owner_token") ||
    localStorage.getItem("pos_access_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  ).trim();
}
function authHeaders(token?: string | null): Record<string, string> {
  const accessToken = (token || getStoredAccessToken()).trim();
  return accessToken
    ? {
        Authorization: accessToken.startsWith("Bearer ")
          ? accessToken
          : `Bearer ${accessToken}`,
      }
    : {};
}
function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}
function normalizeReceiptsResponse(data: any): ReceiptApi[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.receipts)) return data.receipts;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}
function normalizeSaleFromReceipt(receipt: ReceiptApi): Sale | null {
  const itemsRaw = Array.isArray(receipt.items) ? receipt.items : [];
  const items: SaleItem[] = itemsRaw
    .map((item) => {
      const productId = String(item.productId ?? item.product_id ?? item.sku ?? item.barcode ?? "UNKNOWN").trim();
      const sku = String(item.sku ?? productId ?? "UNKNOWN").trim();
      const productName = String(item.productName ?? item.product_name ?? sku ?? "Unknown Product").trim();
      const qty = Number(item.qty ?? 0);
      const price = Number(item.price ?? 0);
      return {
        product_id: productId || sku || "UNKNOWN",
        sku: sku || productId || "UNKNOWN",
        product_name: productName || sku || "Unknown Product",
        qty: Number.isFinite(qty) ? qty : 0,
        price: Number.isFinite(price) ? price : 0,
      };
    })
    .filter((item) => item.qty > 0);
  if (!items.length) return null;
  const totalFromItems = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const total = Number(receipt.grandTotal ?? receipt.grand_total ?? receipt.total ?? totalFromItems);
  return {
    id: String(receipt.id ?? receipt.receiptNo ?? receipt.receipt_no ?? crypto.randomUUID()),
    created_at: String(receipt.createdAt ?? receipt.created_at ?? ""),
    total: Number.isFinite(total) ? total : totalFromItems,
    items,
  };
}
async function fetchReceiptsFromApi(accessToken?: string | null): Promise<Sale[]> {
  let lastError = "Receipts load failed.";
  for (const endpoint of RECEIPT_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...authHeaders(accessToken),
        },
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        lastError = data?.message || data?.error || `${endpoint} failed (${res.status})`;
        continue;
      }
      return normalizeReceiptsResponse(data)
        .map(normalizeSaleFromReceipt)
        .filter((sale): sale is Sale => Boolean(sale));
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Receipts load failed.";
    }
  }
  throw new Error(lastError);
}
function groupKey(d: Date, g: Granularity) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const h = String(d.getUTCHours()).padStart(2, "0");
  if (g === "year") return `${y}`;
  if (g === "month") return `${y}-${m}`;
  if (g === "day") return `${y}-${m}-${day}`;
  return `${y}-${m}-${day} ${h}h`;
}
/* ─── Highlight ───────────────────────────────────────────────────── */
function Highlight({ text, q }: { text: string; q: string }) {
  if (!q.trim()) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded px-0.5">
        {text.slice(i, i + q.length)}
      </span>
      {text.slice(i + q.length)}
    </>
  );
}
/* ─── MiniBarChart inline ─────────────────────────────────────────── */
function SparkBars({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[2px] h-8">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-blue-500/70"
          style={{ height: `${Math.round((v / max) * 100)}%`, minHeight: 2 }}
        />
      ))}
    </div>
  );
}
/* ─── VIEW CYCLE TYPES ────────────────────────────────────────────── */
const VIEW_CYCLE: CardView[] = ["info", "chart", "image"];
const VIEW_META: Record<CardView, { icon: React.ReactNode; label: string }> = {
  info: { icon: <LayoutGrid className="w-3 h-3" />, label: "INFO" },
  chart: { icon: <BarChart2 className="w-3 h-3" />, label: "CHART" },
  image: { icon: <ImageIcon className="w-3 h-3" />, label: "PRODUCTS" },
};
/* ─── Stat Card Types ─────────────────────────────────────────────── */
type StatCardDef = {
  id: string;
  label: string;
  view: CardView;
};
/* ─── StatCard Content ────────────────────────────────────────────── */
type StatContentProps = {
  id: string;
  view: CardView;
  allRows: ReturnType<typeof useAggregation>["allRows"];
  totalRevenue: number;
  totalQty: number;
  totalOrders: number;
};
// Small local vector illustrations: crisp at tablet resolution, no image downloads.
function MetricIllustration({ kind, className = "" }: { kind: string; className?: string }) {
  return <svg viewBox="0 0 112 88" aria-hidden="true" focusable="false" className={cn("h-[76px] w-[96px] shrink-0", className)} fill="none">
    <circle cx="58" cy="43" r="35" fill="currentColor" opacity=".07" />
    <ellipse cx="58" cy="78" rx="38" ry="5" fill="currentColor" opacity=".08" />
    {kind === "revenue" ? <>
      <rect x="23" y="17" width="44" height="57" rx="8" fill="currentColor" opacity=".12" />
      <rect x="28" y="12" width="44" height="57" rx="8" className="fill-white dark:fill-slate-900" stroke="currentColor" strokeWidth="1.7" />
      <path d="M38 25h24M38 31h15M38 56h22" stroke="currentColor" opacity=".35" strokeWidth="3" strokeLinecap="round" />
      <path d="m38 47 7-7 7 4 10-11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="79" cy="59" r="15" className="fill-white dark:fill-slate-900" stroke="currentColor" strokeWidth="2" />
      <circle cx="79" cy="59" r="10" fill="currentColor" opacity=".13" />
      <path d="M75 56h8M75 62h8M79 52v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </> : kind === "qty" ? <>
      <path d="m22 39 26-13 26 13v29L48 81 22 68Z" className="fill-white dark:fill-slate-900" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m22 39 26 13 26-13M48 52v29M35 33l26 13v10" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m22 39 26 13v29L22 68Z" fill="currentColor" opacity=".1" />
      <rect x="68" y="15" width="25" height="29" rx="7" className="fill-white dark:fill-slate-900" stroke="currentColor" strokeWidth="1.7" />
      <path d="m74 29 5 5 9-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M29 60v6M33 58v10M37 61v8" stroke="currentColor" opacity=".4" strokeWidth="2" />
    </> : <>
      <rect x="20" y="19" width="72" height="57" rx="10" className="fill-white dark:fill-slate-900" stroke="currentColor" strokeWidth="1.7" />
      <path d="M20 34h72" stroke="currentColor" opacity=".3" strokeWidth="1.7" />
      <circle cx="29" cy="26" r="2" fill="currentColor" opacity=".4" /><circle cx="36" cy="26" r="2" fill="currentColor" opacity=".25" />
      {[30, 51, 72].map((x) => <g key={x}><rect x={x} y="43" width="12" height="15" rx="3" fill="currentColor" opacity={x === 51 ? ".25" : ".12"} /><path d={`M${x} 65h12`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".35" /></g>)}
      <circle cx="89" cy="20" r="10" className="fill-white dark:fill-slate-900" stroke="currentColor" strokeWidth="1.7" /><path d="M85 20h8M89 16v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>}
    <path d="M13 23h6M16 20v6M94 65h5M96.5 62.5v5" stroke="currentColor" opacity=".25" strokeWidth="1.5" strokeLinecap="round" />
  </svg>;
}
function StatContent({ id, view, allRows, totalRevenue, totalQty, totalOrders }: StatContentProps) {
  const { formatSharedMoney } = useCurrency();
  const money = formatSharedMoney;
  if (view === "info") {
    const isRevenue = id === "revenue";
    const isQty = id === "qty";
    const color = isRevenue ? "text-blue-600 dark:text-blue-400" : isQty ? "text-emerald-600 dark:text-emerald-400" : "text-violet-600 dark:text-violet-400";
    const fill = isRevenue ? "bg-blue-500" : isQty ? "bg-emerald-500" : "bg-violet-500";
    const top = [...allRows].sort((a, b) => isRevenue ? b.revenue - a.revenue : isQty ? b.qty - a.qty : b.orders - a.orders).slice(0, 3);
    const measure = (row: typeof allRows[number]) => isRevenue ? row.revenue : isQty ? row.qty : row.orders;
    const max = Math.max(...top.map(measure), 1);
    const amount = isRevenue ? money(totalRevenue) : (isQty ? totalQty : allRows.length).toLocaleString();
    const detail = isRevenue ? `Average / receipt: ${totalOrders ? money(totalRevenue / totalOrders) : "—"}`
      : isQty ? `Units / receipt: ${totalOrders ? (totalQty / totalOrders).toLocaleString(undefined, { maximumFractionDigits: 1 }) : "—"}`
      : `${totalOrders.toLocaleString()} receipts · ${totalQty.toLocaleString()} units sold`;
    return (
      <div className="flex min-h-[232px] flex-col">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0"><div className={cn("break-words text-2xl xl:text-3xl font-bold tracking-tight tabular-nums", color)}>{amount}</div><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{isRevenue ? "Product sales revenue" : isQty ? "Total units sold" : "Products with sales"}</p></div>
          <MetricIllustration kind={id} className={color} />
        </div>
        <div className="mt-3 flex-1 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3 dark:border-white/[0.06] dark:bg-white/[0.03]">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{isRevenue ? "Top revenue products" : isQty ? "Most units sold" : "Most ordered products"}</p>
          {top.length ? <div className="space-y-2">{top.map((row) => <div key={row.sku}>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs"><span title={row.name} className="min-w-0 truncate font-medium text-slate-700 dark:text-slate-200">{row.name}</span><span className={cn("shrink-0 font-semibold", color)}>{isRevenue ? money(row.revenue) : `${measure(row).toLocaleString()} ${isQty ? "units" : "orders"}`}</span></div>
            <div className="h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"><div className={cn("h-full rounded-full", fill)} style={{ width: `${Math.min(100, Math.max(0, measure(row) / max * 100))}%` }} /></div>
          </div>)}</div> : <p className="py-4 text-center text-xs text-slate-400">No product sales yet</p>}
        </div>
        <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-white/[0.06] dark:text-slate-400">{detail}</p>
      </div>
    );
  }
  if (view === "chart") {
    const top = allRows.slice(0, 8);
    const data =
      id === "revenue"
        ? top.map((r) => r.revenue)
        : id === "qty"
        ? top.map((r) => r.qty)
        : top.map((r) => r.orders);
    return (
      <div className="flex min-h-[232px] flex-col justify-center rounded-xl bg-slate-50 p-4 dark:bg-white/[0.04]">
        <SparkBars data={data} />
        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">Top 8 products</div>
      </div>
    );
  }
  if (view === "image") {
    return (
      <div className="grid min-h-[232px] content-start grid-cols-3 gap-2 mt-1">
        {allRows.slice(0, 6).map((r) => (
          <div
            key={r.sku}
            className="h-24 rounded-xl border border-blue-100 bg-blue-50 flex flex-col items-center justify-center text-center p-2 text-slate-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-slate-300"
          >
            <MetricIllustration kind="qty" className="!h-12 !w-14 text-blue-600 dark:text-blue-400" />
            <div className="text-[11px] leading-tight opacity-70 truncate w-full text-center px-0.5">
              {r.name}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return null;
}
/* ─── useSortableCard ─────────────────────────────────────────────── */
function SortableStatCard({
  card,
  allRows,
  totalRevenue,
  totalQty,
  totalOrders,
  onCycle,
  isGhost,
}: {
  card: StatCardDef;
  allRows: ReturnType<typeof useAggregation>["allRows"];
  totalRevenue: number;
  totalQty: number;
  totalOrders: number;
  onCycle: (id: string) => void;
  isGhost?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: card.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isGhost ? 0.3 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-black rounded-2xl p-5 h-full flex flex-col">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 font-medium">
            {card.label}
          </div>
          <div className="flex items-center gap-1">
            {/* View cycle button */}
            <button
                type="button"
              onClick={() => onCycle(card.id)}
              className="flex min-h-9 items-center gap-1.5 text-[10px] font-semibold px-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 transition-all"
            >
              {VIEW_META[card.view].icon}
              {VIEW_META[card.view].label}
            </button>
            {/* Drag handle */}
            <div
              {...attributes}
              {...listeners}
              className="opacity-60 hover:opacity-100 cursor-grab active:cursor-grabbing touch-none rounded-lg p-2 transition-opacity"
            >
              <GripVertical className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </div>
          </div>
        </div>
        <StatContent
          id={card.id}
          view={card.view}
          allRows={allRows}
          totalRevenue={totalRevenue}
          totalQty={totalQty}
          totalOrders={totalOrders}
        />
      </div>
    </div>
  );
}
/* ─── useAggregation hook ─────────────────────────────────────────── */
function useAggregation(sales: Sale[]) {
  return useMemo(() => {
    const map = new Map<
      string,
      { sku: string; name: string; revenue: number; qty: number; orders: number }
    >();
    for (const s of sales) {
      const seen = new Set<string>();
      for (const it of s.items) {
        const key = it.sku || it.product_id || "?";
        const cur = map.get(key) || { sku: key, name: it.product_name || key, revenue: 0, qty: 0, orders: 0 };
        cur.qty += Number(it.qty || 0);
        cur.revenue += Number(it.qty || 0) * Number(it.price || 0);
        if (!seen.has(key)) { cur.orders += 1; seen.add(key); }
        map.set(key, cur);
      }
    }
    return { allRows: Array.from(map.values()).sort((a, b) => b.revenue - a.revenue) };
  }, [sales]);
}
/* ─── Main Page ───────────────────────────────────────────────────── */
const PAGE_SIZE = 20;
export default function SalesByProductPage() {
  const shopTimezone = useShopTimezone();
  const { formatSharedMoney } = useCurrency();
  const money = formatSharedMoney;
  const { data: session, status } = useSession();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [selectedSku, setSelectedSku] = useState("");
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [metric, setMetric] = useState<Metric>("revenue");
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const [statCards, setStatCards] = useState<StatCardDef[]>([
    { id: "revenue", label: "Total Revenue", view: "info" },
    { id: "qty", label: "Total Units", view: "info" },
    { id: "products", label: "Unique Products", view: "info" },
  ]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  async function reload() {
    try {
      setLoading(true);
      setError("");
      const accessToken = String((session as any)?.accessToken || "").trim();
      const rows = await fetchReceiptsFromApi(accessToken);
      setSales(rows);
      if (rows.length) {
        setSelectedSku("");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load product sales.");
      setSales([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (status === "loading") return;
    void reload();
  }, [status, session, shopTimezone]);
  const { allRows } = useAggregation(sales);
  const filteredRows = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return allRows;
    return allRows.filter(r => r.sku.toLowerCase().includes(kw) || r.name.toLowerCase().includes(kw));
  }, [allRows, q, shopTimezone]);
  useEffect(() => { setPage(1); }, [q, shopTimezone]);
  useEffect(() => {
    if (filteredRows.length && !filteredRows.some(row => row.sku === selectedSku)) setSelectedSku(filteredRows[0].sku);
  }, [filteredRows, selectedSku, shopTimezone]);
  const totalRevenue = useMemo(() => allRows.reduce((s, r) => s + r.revenue, 0), [allRows, shopTimezone]);
  const totalQty = useMemo(() => allRows.reduce((s, r) => s + r.qty, 0), [allRows, shopTimezone]);
  const totalOrders = useMemo(() => sales.length, [sales, shopTimezone]);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pageRows = useMemo(() => filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [filteredRows, safePage, shopTimezone]);
  const selectedProduct = filteredRows.find(r => r.sku === selectedSku) || null;
  const series = useMemo(() => {
    if (!selectedSku) return [];
    const bucket = new Map<string, { bucket: string; revenue: number; qty: number; orders: number }>();
    for (const s of sales) {
      const items = s.items.filter(it => (it.sku || it.product_id) === selectedSku);
      if (!items.length) continue;
      const k = groupKey(shopCalendarDate(s.created_at), granularity);
      const cur = bucket.get(k) || { bucket: k, revenue: 0, qty: 0, orders: 0 };
      items.forEach(it => { cur.qty += Number(it.qty || 0); cur.revenue += Number(it.qty || 0) * Number(it.price || 0); });
      cur.orders += 1;
      bucket.set(k, cur);
    }
    return Array.from(bucket.values()).sort((a, b) => a.bucket < b.bucket ? -1 : 1);
  }, [sales, selectedSku, granularity, shopTimezone]);
  function selectProduct(sku: string) {
    setSelectedSku(sku);
    rightRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  const handleCycle = useCallback((id: string) => {
    setStatCards(prev => prev.map(c => c.id === id ? {
      ...c,
      view: VIEW_CYCLE[(VIEW_CYCLE.indexOf(c.view) + 1) % VIEW_CYCLE.length]
    } : c));
  }, [shopTimezone]);
  function handleDragStart(e: DragStartEvent) { setActiveId(e.active.id); }
  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    if (e.over && e.active.id !== e.over.id) {
      setStatCards(prev => {
        const oi = prev.findIndex(c => c.id === e.active.id);
        const ni = prev.findIndex(c => c.id === e.over!.id);
        return arrayMove(prev, oi, ni);
      });
    }
  }
  const activeCard = statCards.find(c => c.id === activeId);
  const METRIC_COLOR = { revenue: "#2563eb", qty: "#059669", orders: "#7c3aed" };
  return (
    <>
      <style>{`
        .sales-products { --chart-grid: #e2e8f0; --chart-label: #64748b; --chart-bg: #ffffff; --chart-border: #e2e8f0; --chart-text: #0f172a; }
        .dark .sales-products { --chart-grid: #334155; --chart-label: #94a3b8; --chart-bg: #0f172a; --chart-border: #334155; --chart-text: #f1f5f9; }
      `}</style>
      <div className="sales-products py-5 text-slate-950 dark:text-white">
        <div className="space-y-4">
          {/* ── Header ── */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 font-medium">
                  Analytics Console
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Sales by Product
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review product revenue, units sold and sales trends.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-black dark:text-slate-300 dark:hover:bg-white/10 flex items-center gap-2"
                onClick={() => void reload()}
                disabled={loading}
              >
                <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
                {loading ? "Loading" : "Refresh"}
              </button>
            </div>
          </div>
          {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{error}</div>}
          {/* ── DnD Stat Cards ── */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
          >
            <SortableContext items={statCards.map(c => c.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statCards.map(card => (
                  <SortableStatCard
                    key={card.id}
                    card={card}
                    allRows={allRows}
                    totalRevenue={totalRevenue}
                    totalQty={totalQty}
                    totalOrders={totalOrders}
                    onCycle={handleCycle}
                    isGhost={activeId === card.id}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeCard && (
                <div className="border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-black rounded-2xl p-4 rotate-2 scale-105 shadow-2xl opacity-90">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    {activeCard.label}
                  </div>
                  <StatContent
                    id={activeCard.id}
                    view={activeCard.view}
                    allRows={allRows}
                    totalRevenue={totalRevenue}
                    totalQty={totalQty}
                    totalOrders={totalOrders}
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>
          {/* ── Main Layout ── */}
          <div className="grid gap-4 lg:grid-cols-5">
            {/* LEFT: Product List */}
            <div className="lg:col-span-2 border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-black rounded-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Products
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <span>{filteredRows.length} SKUs</span>
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <input
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    placeholder="Search name or SKU…"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                  />
                </div>
              </div>
              <ScrollArea className="flex-1 h-[580px]">
                {/* Top 3 highlight */}
                <div className="p-3 border-b border-slate-200 dark:border-white/10">
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 px-1">
                    Top Performers
                  </div>
                  {filteredRows.slice(0, 3).map((r, i) => {
                    const active = r.sku === selectedSku;
                    const pct = filteredRows[0]?.revenue ? (r.revenue / filteredRows[0].revenue) * 100 : 0;
                    const rankColor = ["text-blue-600 dark:text-blue-400", "text-slate-600 dark:text-slate-300", "text-slate-500 dark:text-slate-400"][i];
                    return (
                      <button
                type="button"
                        key={r.sku}
                        onClick={() => selectProduct(r.sku)}
                        className={cn(
                          "w-full text-left rounded-xl px-3 py-2.5 mb-1.5 transition-all",
                          active ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30" : "hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                        )}
                        style={{ border: active ? undefined : "1px solid transparent" }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={cn("text-xs font-bold w-4 shrink-0", rankColor)}>
                              {i + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-950 dark:text-white truncate">
                                <Highlight text={r.name} q={q} />
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                <Highlight text={r.sku} q={q} />
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                              {money(r.revenue)}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{r.qty} units</div>
                          </div>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10 mt-2">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
                {/* Paged table */}
                <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                  {pageRows.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                      {loading || status === "loading" ? "Loading product sales…" : error ? "Unable to load product sales. Try Refresh." : "No product sales found. Refresh after completing a sale."}
                    </div>
                  ) : pageRows.map((r, idx) => {
                    const active = r.sku === selectedSku;
                    const globalIdx = (safePage - 1) * PAGE_SIZE + idx + 1;
                    const pct = filteredRows[0]?.revenue ? Math.min(100, (r.revenue / filteredRows[0].revenue) * 100) : 0;
                    return (
                      <button
                type="button"
                        key={r.sku}
                        onClick={() => selectProduct(r.sku)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 transition-all hover:bg-slate-50 dark:hover:bg-white/[0.04]",
                          active ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30" : ""
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 w-5 shrink-0 text-right">
                            {globalIdx}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-slate-800 dark:text-slate-200 truncate">
                              <Highlight text={r.name} q={q} />
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10 flex-1">
                                <div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%`, background: active ? "#2563eb" : "#94a3b8" }} />
                              </div>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                                {money(r.revenue)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {/* Pagination */}
                <div className="p-3 flex items-center justify-between border-t border-slate-200 dark:border-white/10">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    pg {safePage}/{totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                type="button"
                      className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-black dark:text-slate-300 dark:hover:bg-white/10 px-2 py-1"
                      disabled={safePage <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const n = Math.max(1, Math.min(safePage - 2, totalPages - 4)) + i;
                      return (
                        <button
                type="button"
                          key={n}
                          className={cn("inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-black dark:text-slate-300 dark:hover:bg-white/10 px-2.5 py-1", n === safePage && "!border-blue-600 !bg-blue-600 !text-white")}
                          onClick={() => setPage(n)}
                        >
                          {n}
                        </button>
                      );
                    })}
                    <button
                type="button"
                      className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-black dark:text-slate-300 dark:hover:bg-white/10 px-2 py-1"
                      disabled={safePage >= totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </ScrollArea>
            </div>
            {/* RIGHT: Chart Panel */}
            <div ref={rightRef} className="lg:col-span-3 border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-black rounded-2xl overflow-hidden flex flex-col">
              {/* Panel header */}
              <div className="p-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Selected Product
                    </div>
                    <div className="text-xl font-bold text-slate-950 dark:text-white tracking-tight">
                      {selectedProduct?.name || "—"}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedProduct?.sku || "—"}
                    </div>
                  </div>
                  {selectedProduct && (
                    <div className="flex gap-2 flex-wrap justify-end">
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {money(selectedProduct.revenue)}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Revenue</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {selectedProduct.qty}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Units</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-violet-600 dark:text-violet-400">
                          {selectedProduct.orders}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Orders</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Controls */}
              <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Metric</span>
                  {(["revenue", "qty", "orders"] as Metric[]).map(m => (
                    <button
                type="button"
                      key={m}
                      className={cn("min-h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold capitalize text-slate-600 dark:border-white/10 dark:bg-black dark:text-slate-300", metric === m && "!border-blue-600 !bg-blue-600 !text-white")}
                      onClick={() => setMetric(m)}
                      aria-pressed={metric === m}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Granularity</span>
                  {(["hour", "day", "month", "year"] as Granularity[]).map(g => (
                    <button
                type="button"
                      key={g}
                      className={cn("inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-black dark:text-slate-300 dark:hover:bg-white/10", granularity === g && "!border-blue-600 !bg-blue-600 !text-white")}
                      onClick={() => setGranularity(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              {/* Chart */}
              <div className="flex-1 p-4">
                {series.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                    <TrendingUp className="w-10 h-10 mb-3 opacity-30" />
                    <div className="text-sm">Product ရွေးပြီး data ကြည့်ပါ</div>
                  </div>
                ) : (
                  <div className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={METRIC_COLOR[metric]} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={METRIC_COLOR[metric]} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="bucket"
                          tick={{ fontSize: 10, fill: "var(--chart-label)" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "var(--chart-label)" }}
                          tickLine={false}
                          axisLine={false}
                          width={metric === "revenue" ? 72 : 40}
                          tickFormatter={v => metric === "revenue" ? money(v) : String(v)}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--chart-bg)",
                            border: "1px solid var(--chart-border)",
                            borderRadius: 10,
                            fontSize: 12,
                            color: "var(--chart-text)",
                          }}
                          formatter={(v) => [
                            metric === "revenue" ? money(Number(v ?? 0)) : Number(v ?? 0),
                            metric.charAt(0).toUpperCase() + metric.slice(1),
                          ]}
                          labelStyle={{ color: "var(--chart-label)", fontSize: 11 }}
                        />
                        <Area
                          dataKey={metric}
                          type="monotone"
                          stroke={METRIC_COLOR[metric]}
                          fill="url(#areaGrad)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, fill: METRIC_COLOR[metric], strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              {/* Footer */}
              <div className="px-4 py-2 border-t border-slate-200 dark:border-white/10 flex items-center gap-2">
                <Coins className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Sales trends grouped by the shop timezone.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
