"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search,
  Receipt,
  Clock3,
  Wallet,
  MoreHorizontal,
  Download,
  Sun,
  Moon,
  Sparkles,
  Eye,
  Pencil,
  Printer,
  Trash2,
  RefreshCw,
  AlertCircle,
  XCircle,
  Package,
  TrendingUp,
  Zap,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FeaturePageGuard } from "@/components/feature-page-guard";

// ─── TYPES ───────────────────────────────────────────────────────────────────
type PayStatus = "PAID" | "PENDING" | "REFUND";
type OrdStatus = "COMPLETED" | "PROCESSING" | "RETURNED";

type OrderItemRow = {
  name: string;
  qty: number;
  price: number;
  total: number;
};

type OrderRow = {
  id: string;
  customer: string;
  branch: string;
  items: number;
  paymentStatus: PayStatus;
  orderStatus: OrdStatus;
  createdAt: string;
  total: number;
  itemDetails: OrderItemRow[];
};

function money(n: number) {
  return `¥${n.toLocaleString()}`;
}

// ─── THEME ───────────────────────────────────────────────────────────────────
type Theme = "dark" | "light";

const tk = (theme: Theme) =>
  theme === "dark"
    ? {
        root: "bg-[#060a14] text-white",
        text: "text-white",
        textMuted: "text-white/50",
        textSubtle: "text-white/32",
        card: "border-white/[0.07] bg-white/[0.048] backdrop-blur-xl",
        cardSolid: "border-white/[0.07] bg-[#0c1018]",
        input:
          "border-white/[0.10] bg-white/[0.06] text-white placeholder:text-white/30 focus-visible:border-blue-500/60",
        btn: "border-white/[0.10] bg-white/[0.055] text-white/80 hover:bg-white/[0.10] hover:text-white",
        btnPrimary: "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10",
        divider: "bg-white/[0.06]",
        pill: "border-white/[0.08] bg-white/[0.05] text-white/60",
        tableHead: "text-white/38",
        tableRow: "border-white/[0.045] hover:bg-white/[0.04]",
        tableBorder: "border-white/[0.055]",
        grid:
          "[background-image:linear-gradient(rgba(255,255,255,0.026)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.026)_1px,transparent_1px)] [background-size:44px_44px]",
        glow1: "bg-blue-600/[0.08]",
        glow2: "bg-violet-600/[0.06]",
        dropMenu: "bg-[#0c1018] border-white/[0.09]",
        dropItem:
          "text-white/70 hover:text-white focus:text-white hover:bg-white/[0.07] focus:bg-white/[0.07]",
      }
    : {
        root: "bg-[#edf1f9] text-slate-900",
        text: "text-slate-900",
        textMuted: "text-slate-500",
        textSubtle: "text-slate-400",
        card:
          "border-slate-200/80 bg-white/95 shadow-[0_2px_20px_rgba(15,23,42,0.06)] backdrop-blur-xl",
        cardSolid: "border-slate-200 bg-white shadow-sm",
        input:
          "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-blue-500",
        btn: "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 shadow-sm",
        btnPrimary: "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/20",
        divider: "bg-slate-200",
        pill: "border-slate-200 bg-white text-slate-500 shadow-sm",
        tableHead: "text-slate-400",
        tableRow: "border-slate-100 hover:bg-slate-50/70",
        tableBorder: "border-slate-200",
        grid:
          "[background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:44px_44px]",
        glow1: "bg-sky-300/20",
        glow2: "bg-indigo-300/15",
        dropMenu: "bg-white border-slate-200",
        dropItem: "text-slate-600 hover:text-slate-900 focus:text-slate-900",
      };

// ─── STATUS CONFIG ───────────────────────────────────────────────────────────
const payConfig: Record<
  PayStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  PAID: {
    label: "Paid",
    dot: "bg-emerald-500",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
  },
  PENDING: {
    label: "Pending",
    dot: "bg-amber-500",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
  },
  REFUND: {
    label: "Refund",
    dot: "bg-rose-500",
    bg: "bg-rose-500/10",
    text: "text-rose-500",
  },
};

const ordConfig: Record<
  OrdStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  COMPLETED: {
    label: "Completed",
    dot: "bg-blue-500",
    bg: "bg-blue-500/10",
    text: "text-blue-500",
  },
  PROCESSING: {
    label: "Processing",
    dot: "bg-violet-500",
    bg: "bg-violet-500/10",
    text: "text-violet-500",
  },
  RETURNED: {
    label: "Returned",
    dot: "bg-slate-500",
    bg: "bg-slate-500/10",
    text: "text-slate-400",
  },
};

function StatusPill({
  cfg,
}: {
  cfg: { label: string; dot: string; bg: string; text: string };
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
        cfg.bg,
        cfg.text
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

// ─── COMPACT SUMMARY ITEM ────────────────────────────────────────────────────
function SummaryItem({
  theme,
  label,
  value,
  icon: Icon,
  accent,
}: {
  theme: Theme;
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  const t = tk(theme);

  return (
    <div className="flex min-w-[135px] items-center gap-2.5 rounded-2xl px-3 py-2">
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          theme === "dark" ? "bg-white/[0.07]" : "bg-slate-100"
        )}
      >
        <Icon className={cn("h-4 w-4", accent)} />
      </span>

      <div className="min-w-0">
        <div className={cn("text-[10px] font-black uppercase tracking-widest", t.textSubtle)}>
          {label}
        </div>
        <div className={cn("truncate text-[15px] font-black", t.text)}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ─── API HELPERS ─────────────────────────────────────────────────────────────
const FILTER_TABS = [
  "All",
  "Paid",
  "Pending",
  "Refund",
  "Completed",
  "Processing",
  "Returned",
];

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

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

function buildAuthHeaders(token?: string | null): Record<string, string> {
  const accessToken = String(token || getStoredAccessToken() || "").trim();

  return accessToken
    ? {
        Authorization: accessToken.startsWith("Bearer ")
          ? accessToken
          : `Bearer ${accessToken}`,
      }
    : {};
}

function readArrayPayload(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.receipts)) return data.receipts;
  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.result)) return data.result;
  return [];
}

function toNumber(value: unknown, fallback = 0) {
  if (value == null || value === "") return fallback;
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;

  const n = Number(String(value).replaceAll(",", "").trim());
  return Number.isFinite(n) ? n : fallback;
}

function formatOrderDate(value: unknown) {
  const date = value ? new Date(String(value)) : new Date();
  if (Number.isNaN(date.getTime())) return String(value || "");

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function normalizePaymentStatus(value: unknown): PayStatus {
  const status = String(value || "").toUpperCase();

  if (status.includes("REFUND") || status.includes("RETURN")) return "REFUND";
  if (status.includes("PENDING") || status.includes("UNPAID") || status.includes("DUE")) {
    return "PENDING";
  }

  return "PAID";
}

function normalizeOrderStatus(value: unknown): OrdStatus {
  const status = String(value || "").toUpperCase();

  if (status.includes("RETURN") || status.includes("REFUND") || status.includes("CANCEL")) {
    return "RETURNED";
  }

  if (status.includes("PROCESS") || status.includes("PENDING") || status.includes("OPEN")) {
    return "PROCESSING";
  }

  return "COMPLETED";
}

function normalizeReceiptToOrder(receipt: any, index: number): OrderRow | null {
  const itemList = Array.isArray(receipt?.items)
    ? receipt.items
    : Array.isArray(receipt?.orderItems)
      ? receipt.orderItems
      : Array.isArray(receipt?.lines)
        ? receipt.lines
        : [];

  const itemDetails: OrderItemRow[] = itemList.map((item: any, itemIndex: number) => {
    const qty = toNumber(item?.qty ?? item?.quantity ?? item?.count, 0);
    const price = toNumber(item?.price ?? item?.unitPrice ?? item?.unit_price, 0);
    const lineTotal = toNumber(
      item?.lineTotal ?? item?.line_total ?? item?.total,
      qty * price
    );

    return {
      name: String(
        item?.productName ??
          item?.product_name ??
          item?.name ??
          item?.sku ??
          item?.barcode ??
          `Item ${itemIndex + 1}`
      ),
      qty,
      price,
      total: lineTotal,
    };
  });

  const total = toNumber(
    receipt?.grandTotal ??
      receipt?.grand_total ??
      receipt?.total ??
      receipt?.amount ??
      receipt?.subtotal ??
      receipt?.subTotal ??
      receipt?.netTotal
  );

  const id = String(
    receipt?.receiptNo ??
      receipt?.receipt_no ??
      receipt?.orderNo ??
      receipt?.order_no ??
      receipt?.invoiceNo ??
      receipt?.id ??
      `ORD-${String(index + 1).padStart(4, "0")}`
  );

  return {
    id,
    customer: String(
      receipt?.customerName ??
        receipt?.customer_name ??
        receipt?.customer?.name ??
        receipt?.customer ??
        receipt?.cashierName ??
        receipt?.createdBy ??
        "Walk-in Customer"
    ),
    branch: String(
      receipt?.branch ??
        receipt?.branchName ??
        receipt?.shopName ??
        receipt?.shop_name ??
        receipt?.shopCode ??
        receipt?.shop_code ??
        "Main Branch"
    ),
    items: Math.max(
      0,
      toNumber(receipt?.itemCount ?? receipt?.item_count ?? receipt?.totalItems ?? itemDetails.length)
    ),
    paymentStatus: normalizePaymentStatus(
      receipt?.paymentStatus ?? receipt?.payment_status ?? receipt?.status
    ),
    orderStatus: normalizeOrderStatus(
      receipt?.orderStatus ?? receipt?.order_status ?? receipt?.status
    ),
    createdAt: formatOrderDate(
      receipt?.createdAt ??
        receipt?.created_at ??
        receipt?.createdDate ??
        receipt?.paidAt ??
        receipt?.paid_at ??
        receipt?.date ??
        receipt?.timestamp
    ),
    total,
    itemDetails,
  };
}

async function readErrorText(res: Response) {
  const contentType = res.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      const data = await res.json();
      return data?.message || data?.error || JSON.stringify(data);
    }

    return await res.text();
  } catch {
    return "";
  }
}

async function fetchOrdersFromApi(token?: string | null): Promise<OrderRow[]> {
  let lastError = "";

  for (const endpoint of RECEIPT_ENDPOINTS) {
    try {
      const res = await fetch(`${endpoint}?_ts=${Date.now()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...buildAuthHeaders(token),
        },
        cache: "no-store",
      });

      if (res.status === 404) {
        lastError = `${endpoint} not found`;
        continue;
      }

      if (res.status === 401 || res.status === 403) {
        lastError = "Unauthorized: login token မပါပါ။ ပြန် login ဝင်ပါ။";
        continue;
      }

      if (!res.ok) {
        lastError = (await readErrorText(res)) || `${endpoint} failed (${res.status})`;
        continue;
      }

      const data = await res.json().catch(() => null);

      return readArrayPayload(data).map(normalizeReceiptToOrder).filter(Boolean) as OrderRow[];
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Orders API fetch failed.";
    }
  }

  throw new Error(lastError || "No orders endpoint available.");
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
function OrdersPageContent() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState("All");
  const [theme, setTheme] = React.useState<Theme>("dark");
  const [orders, setOrders] = React.useState<OrderRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [apiError, setApiError] = React.useState("");
  const [selectedOrder, setSelectedOrder] = React.useState<OrderRow | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<number>(10);

  const t = tk(theme);

  const accessToken = String(
    (session as any)?.accessToken || (session as any)?.user?.accessToken || ""
  ).trim();

  const loadOrders = React.useCallback(async () => {
    try {
      setLoading(true);
      setApiError("");

      const rows = await fetchOrdersFromApi(accessToken);
      setOrders(rows);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Orders load failed.";

      setOrders([]);
      setApiError(message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  React.useEffect(() => {
    if (sessionStatus === "loading") return;
    loadOrders();
  }, [sessionStatus, loadOrders]);

  const filtered = React.useMemo(() => {
    const q = query.toLowerCase();

    return orders.filter((o) => {
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.branch.toLowerCase().includes(q);

      const matchTab =
        tab === "All" ||
        o.paymentStatus === tab.toUpperCase() ||
        o.orderStatus === tab.toUpperCase();

      return matchSearch && matchTab;
    });
  }, [orders, query, tab]);

  React.useEffect(() => {
    setPage(1);
  }, [query, tab, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = filtered.length ? (safePage - 1) * pageSize : 0;
  const pageEnd = Math.min(pageStart + pageSize, filtered.length);

  const paginatedOrders = React.useMemo(
    () => filtered.slice(pageStart, pageEnd),
    [filtered, pageStart, pageEnd]
  );

  const pageNumbers = React.useMemo(() => {
    const start = Math.max(1, Math.min(safePage - 1, totalPages - 2));
    return Array.from({ length: Math.min(3, totalPages) }, (_, i) => start + i);
  }, [safePage, totalPages]);

  React.useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const paidOrders = React.useMemo(
    () => orders.filter((o) => o.paymentStatus === "PAID").length,
    [orders]
  );

  const pendingOrders = React.useMemo(
    () => orders.filter((o) => o.paymentStatus === "PENDING").length,
    [orders]
  );

  const completedOrders = React.useMemo(
    () => orders.filter((o) => o.orderStatus === "COMPLETED").length,
    [orders]
  );

  const processingOrders = React.useMemo(
    () => orders.filter((o) => o.orderStatus === "PROCESSING").length,
    [orders]
  );

  const revenue = React.useMemo(
    () => orders.reduce((sum, order) => sum + order.total, 0),
    [orders]
  );

  return (
    <div className={cn("relative min-h-screen transition-colors duration-300", t.root)}>
      <div className={cn("pointer-events-none fixed inset-0", t.grid)} />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={cn(
            "absolute -top-32 left-[10%] h-[500px] w-[500px] rounded-full blur-[130px]",
            t.glow1
          )}
        />
        <div
          className={cn(
            "absolute bottom-0 right-[-5%] h-[400px] w-[400px] rounded-full blur-[120px]",
            t.glow2
          )}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1520px] space-y-4 px-5 py-5 md:px-8">
        {/* TOPBAR */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <div
              className={cn(
                "mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold",
                t.pill
              )}
            >
              <Sparkles className="h-3 w-3" />
              Orders Management
            </div>

            <h1
              className={cn(
                "text-[30px] font-black leading-none tracking-tight md:text-[38px]",
                t.text
              )}
            >
              Orders
              <span className={cn("ml-3 text-[17px] font-bold", t.textMuted)}>
                / All Branches
              </span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                className={cn(
                  "absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2",
                  t.textSubtle
                )}
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search order, customer, branch…"
                className={cn("h-9 w-[260px] rounded-xl pl-9 text-[13px]", t.input)}
              />
            </div>

            <button
              onClick={loadOrders}
              disabled={loading}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-xl border px-3.5 text-[13px] font-semibold transition-all disabled:opacity-60",
                t.btn
              )}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              Reload
            </button>

            <button
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-xl border px-3.5 text-[13px] font-semibold transition-all",
                t.btn
              )}
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>

            <button
              onClick={() => setTheme((th) => (th === "dark" ? "light" : "dark"))}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl border transition-all",
                t.btn
              )}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-xl px-4 text-[13px] font-bold transition-all",
                t.btnPrimary
              )}
            >
              <Store className="h-4 w-4" />
              Dashboard
            </button>
            
          </div>
        </motion.div>

        {/* COMPACT SUMMARY BAR */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className={cn(
            "flex flex-wrap items-center justify-between gap-2 rounded-[22px] border px-3 py-2",
            t.card
          )}
        >
          <div className="flex flex-wrap items-center gap-1">
            <SummaryItem
              theme={theme}
              label="Orders"
              value={orders.length}
              icon={Receipt}
              accent="text-blue-500"
            />
            <SummaryItem
              theme={theme}
              label="Paid"
              value={paidOrders}
              icon={Wallet}
              accent="text-emerald-500"
            />
            <SummaryItem
              theme={theme}
              label="Pending"
              value={pendingOrders}
              icon={Clock3}
              accent="text-amber-500"
            />
            <SummaryItem
              theme={theme}
              label="Revenue"
              value={money(revenue)}
              icon={TrendingUp}
              accent="text-violet-500"
            />
            <SummaryItem
              theme={theme}
              label="Completed"
              value={completedOrders}
              icon={Receipt}
              accent="text-sky-500"
            />
            <SummaryItem
              theme={theme}
              label="Processing"
              value={processingOrders}
              icon={Store}
              accent="text-fuchsia-500"
            />
          </div>
        </motion.div>

        {/* ORDER TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <div className={cn("overflow-hidden rounded-[22px] border", t.card)}>
            {/* Table Header */}
            <div
              className={cn(
                "flex flex-col gap-3 border-b px-5 py-4 md:flex-row md:items-center md:justify-between",
                t.tableBorder
              )}
            >
              <div>
                <div className={cn("text-[16px] font-bold", t.text)}>Order List</div>
                <div className={cn("mt-0.5 text-[12px]", t.textMuted)}>
                  {apiError
                    ? apiError
                    : `${filtered.length} order${filtered.length !== 1 ? "s" : ""} found from API`}
                </div>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                {FILTER_TABS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setTab(f)}
                    className={cn(
                      "shrink-0 whitespace-nowrap rounded-xl px-3 py-2 text-[12px] font-bold transition-all",
                      tab === f
                        ? theme === "dark"
                          ? "bg-white/[0.13] text-white"
                          : "bg-slate-900 text-white"
                        : cn(t.textMuted, "hover:bg-white/[0.05] dark:hover:text-white/70")
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px]">
                <thead>
                  <tr className={cn("border-b", t.tableBorder)}>
                    {[
                      { label: "Order ID", align: "left" },
                      { label: "Customer", align: "left" },
                      { label: "Branch", align: "left" },
                      { label: "Items", align: "center" },
                      { label: "Payment", align: "left" },
                      { label: "Status", align: "left" },
                      { label: "Date", align: "left" },
                      { label: "Total", align: "right" },
                      { label: "", align: "center" },
                    ].map((h, i) => (
                      <th
                        key={i}
                        className={cn(
                          "px-4 py-3 text-[10px] font-black uppercase tracking-widest",
                          h.align === "right"
                            ? "text-right"
                            : h.align === "center"
                              ? "text-center"
                              : "text-left",
                          t.tableHead
                        )}
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <AnimatePresence mode="popLayout">
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={9} className={cn("py-14 text-center", t.textMuted)}>
                          <div className="flex flex-col items-center gap-3">
                            <RefreshCw className="h-10 w-10 animate-spin opacity-40" />
                            <div className="text-sm font-semibold">Loading orders from API...</div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {!loading && apiError && (
                      <tr>
                        <td colSpan={9} className="py-14 text-center text-rose-400">
                          <div className="flex flex-col items-center gap-3">
                            <AlertCircle className="h-10 w-10 opacity-70" />
                            <div className="text-sm font-semibold">{apiError}</div>
                            <button
                              onClick={loadOrders}
                              className={cn(
                                "mt-2 rounded-xl border px-4 py-2 text-[12px] font-bold",
                                t.btn
                              )}
                            >
                              Try again
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      !apiError &&
                      paginatedOrders.map((order, i) => {
                        const pay = payConfig[order.paymentStatus] ?? payConfig.PENDING;
                        const ord = ordConfig[order.orderStatus] ?? ordConfig.PROCESSING;

                        return (
                          <motion.tr
                            key={order.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className={cn(
                              "group cursor-default border-b transition-colors",
                              t.tableRow
                            )}
                          >
                            <td className="px-4 py-4">
                              <span className={cn("font-mono text-[12px] font-bold", t.textMuted)}>
                                {order.id}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-black",
                                    theme === "dark"
                                      ? "bg-white/[0.08] text-white/60"
                                      : "bg-slate-100 text-slate-500"
                                  )}
                                >
                                  {order.customer.charAt(0)}
                                </div>
                                <span className={cn("text-[13px] font-semibold", t.text)}>
                                  {order.customer}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={cn(
                                  "rounded-lg border px-2.5 py-1 text-[11px] font-semibold",
                                  t.pill
                                )}
                              >
                                {order.branch}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-center">
                              <span
                                className={cn(
                                  "inline-flex h-7 w-7 items-center justify-center rounded-xl text-[12px] font-bold",
                                  theme === "dark"
                                    ? "bg-white/[0.07] text-white/70"
                                    : "bg-slate-100 text-slate-600"
                                )}
                              >
                                {order.items}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <StatusPill cfg={pay} />
                            </td>

                            <td className="px-4 py-4">
                              <StatusPill cfg={ord} />
                            </td>

                            <td className="px-4 py-4">
                              <div className={cn("text-[12px]", t.textSubtle)}>
                                <div>{order.createdAt.split(" ")[0]}</div>
                                <div className="mt-0.5 font-semibold">
                                  {order.createdAt.split(" ")[1]}
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4 text-right">
                              <span className={cn("text-[14px] font-black", t.text)}>
                                {money(order.total)}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className={cn(
                                      "flex h-8 w-8 items-center justify-center rounded-xl border opacity-0 transition-all group-hover:opacity-100",
                                      t.btn
                                    )}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                  align="end"
                                  className={cn("min-w-[170px] rounded-2xl border p-1.5", t.dropMenu)}
                                >
                                  <DropdownMenuItem
                                    onClick={() => setSelectedOrder(order)}
                                    className={cn(
                                      "cursor-pointer gap-2.5 rounded-xl py-2.5 text-[13px]",
                                      t.dropItem
                                    )}
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    View Detail
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    className={cn(
                                      "cursor-pointer gap-2.5 rounded-xl py-2.5 text-[13px]",
                                      t.dropItem
                                    )}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit Order
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    className={cn(
                                      "cursor-pointer gap-2.5 rounded-xl py-2.5 text-[13px]",
                                      t.dropItem
                                    )}
                                  >
                                    <Printer className="h-3.5 w-3.5" />
                                    Print Receipt
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator className={cn("my-1", t.divider)} />

                                  <DropdownMenuItem className="cursor-pointer gap-2.5 rounded-xl py-2.5 text-[13px] text-rose-500 hover:bg-rose-500/10 hover:text-rose-500 focus:bg-rose-500/10 focus:text-rose-500">
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete Order
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </motion.tr>
                        );
                      })}

                    {!loading && !apiError && filtered.length === 0 && (
                      <tr>
                        <td colSpan={9} className={cn("py-14 text-center", t.textMuted)}>
                          <div className="flex flex-col items-center gap-3">
                            <Package className="h-10 w-10 opacity-30" />
                            <div className="text-sm font-semibold">No orders found</div>
                            <div className={cn("text-[12px]", t.textSubtle)}>
                              Try adjusting your search or filter
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </AnimatePresence>
              </table>
            </div>

            {/* Table Footer */}
            <div
              className={cn(
                "flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
                t.tableBorder
              )}
            >
              <div className={cn("text-[12px] font-medium", t.textSubtle)}>
                Showing{" "}
                <span className={cn("font-bold", t.textMuted)}>
                  {filtered.length ? pageStart + 1 : 0}-{pageEnd}
                </span>{" "}
                of <span className={cn("font-bold", t.textMuted)}>{filtered.length}</span>{" "}
                filtered orders
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className={cn("h-8 rounded-xl border px-2 text-[12px] font-bold outline-none", t.btn)}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className={cn(
                    "flex h-8 min-w-[58px] items-center justify-center rounded-xl border px-3 text-[12px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40",
                    t.btn
                  )}
                >
                  Prev
                </button>

                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "flex h-8 min-w-[32px] items-center justify-center rounded-xl border px-3 text-[12px] font-bold transition-all",
                      p === safePage
                        ? theme === "dark"
                          ? "border-white/[0.14] bg-white/[0.14] text-white"
                          : "border-transparent bg-slate-900 text-white"
                        : t.btn
                    )}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className={cn(
                    "flex h-8 min-w-[58px] items-center justify-center rounded-xl border px-3 text-[12px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40",
                    t.btn
                  )}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div
          className={cn(
            "flex items-center justify-between pb-3 text-[11px] font-semibold",
            t.textSubtle
          )}
        >
          <span>© 2026 BINHLAIG · Orders Module</span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-3 w-3" />
            Connected · /api/pos/receipts
          </span>
        </div>
      </div>

      {/* DETAIL DIALOG */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[24px] border shadow-2xl",
                t.cardSolid
              )}
            >
              <div
                className={cn(
                  "flex items-start justify-between gap-4 border-b px-6 py-5",
                  t.tableBorder
                )}
              >
                <div>
                  <div
                    className={cn(
                      "text-[11px] font-black uppercase tracking-widest",
                      t.textSubtle
                    )}
                  >
                    Order Detail
                  </div>

                  <h2 className={cn("mt-1 font-mono text-xl font-black", t.text)}>
                    {selectedOrder.id}
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusPill cfg={payConfig[selectedOrder.paymentStatus]} />
                    <StatusPill cfg={ordConfig[selectedOrder.orderStatus]} />
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                    t.btn
                  )}
                  aria-label="Close order detail"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[calc(90vh-90px)] overflow-y-auto p-6">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Customer", selectedOrder.customer],
                    ["Branch", selectedOrder.branch],
                    ["Created", selectedOrder.createdAt],
                    ["Total", money(selectedOrder.total)],
                  ].map(([label, value]) => (
                    <div key={label} className={cn("rounded-2xl border p-4", t.card)}>
                      <div
                        className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          t.textSubtle
                        )}
                      >
                        {label}
                      </div>
                      <div className={cn("mt-2 text-sm font-bold", t.text)}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={cn("mt-5 overflow-hidden rounded-2xl border", t.tableBorder)}>
                  <div
                    className={cn(
                      "border-b px-4 py-3 text-sm font-black",
                      t.tableBorder,
                      t.text
                    )}
                  >
                    Items ({selectedOrder.items})
                  </div>

                  {selectedOrder.itemDetails.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[560px] text-sm">
                        <thead>
                          <tr className={cn("border-b", t.tableBorder)}>
                            {["Item", "Qty", "Price", "Line Total"].map((heading) => (
                              <th
                                key={heading}
                                className={cn(
                                  "px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest",
                                  t.tableHead
                                )}
                              >
                                {heading}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {selectedOrder.itemDetails.map((item, index) => (
                            <tr
                              key={`${item.name}-${index}`}
                              className={cn("border-b", t.tableBorder)}
                            >
                              <td className={cn("px-4 py-3 font-semibold", t.text)}>
                                {item.name}
                              </td>
                              <td className={cn("px-4 py-3", t.textMuted)}>
                                {item.qty}
                              </td>
                              <td className={cn("px-4 py-3", t.textMuted)}>
                                {money(item.price)}
                              </td>
                              <td className={cn("px-4 py-3 font-bold", t.text)}>
                                {money(item.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className={cn("px-4 py-10 text-center text-sm", t.textMuted)}>
                      Item detail မပါသေးပါ။ API response ထဲမှာ items ပါလာရင် ဒီနေရာမှာပြပါမယ်။
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className={cn("rounded-xl border px-4 py-2 text-sm font-bold", t.btn)}
                  >
                    Close
                  </button>

                  <button
                    onClick={() => window.print()}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold",
                      t.btnPrimary
                    )}
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <FeaturePageGuard featureKey="receiptsEnabled">
      <OrdersPageContent />
    </FeaturePageGuard>
  );
}
