// "use client";

// import * as React from "react";
// import {
//   Search,
//   Plus,
//   Receipt,
//   ArrowUpRight,
//   Clock3,
//   Wallet,
//   MoreHorizontal,
// } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// const orders = [
//   {
//     id: "ORD-1001",
//     customer: "Aung Aung",
//     branch: "Main Branch",
//     items: 4,
//     paymentStatus: "PAID",
//     orderStatus: "COMPLETED",
//     createdAt: "2026-03-23 09:10",
//     total: 24000,
//   },
//   {
//     id: "ORD-1002",
//     customer: "Su Su",
//     branch: "Branch A",
//     items: 2,
//     paymentStatus: "PENDING",
//     orderStatus: "PROCESSING",
//     createdAt: "2026-03-23 09:22",
//     total: 8200,
//   },
//   {
//     id: "ORD-1003",
//     customer: "Ko Ko",
//     branch: "Online Shop",
//     items: 1,
//     paymentStatus: "REFUND",
//     orderStatus: "RETURNED",
//     createdAt: "2026-03-23 09:40",
//     total: 3900,
//   },
// ];

// function money(n: number) {
//   return `¥${n.toLocaleString()}`;
// }

// function StatusBadge({
//   status,
// }: {
//   status: "PAID" | "PENDING" | "REFUND" | "COMPLETED" | "PROCESSING" | "RETURNED";
// }) {
//   const styles: Record<string, string> = {
//     PAID: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
//     PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
//     REFUND: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
//     COMPLETED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
//     PROCESSING: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
//     RETURNED: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
//   };

//   return (
//     <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
//       {status}
//     </span>
//   );
// }

// function StatCard({
//   title,
//   value,
//   icon: Icon,
//   sub,
// }: {
//   title: string;
//   value: string;
//   icon: React.ComponentType<{ className?: string }>;
//   sub: string;
// }) {
//   return (
//     <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
//       <CardContent className="p-5">
//         <div className="flex items-start justify-between">
//           <div>
//             <div className="text-xs font-medium text-slate-500">{title}</div>
//             <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
//             <div className="mt-2 text-xs text-slate-400">{sub}</div>
//           </div>
//           <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
//             <Icon className="h-5 w-5 text-slate-700" />
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

// export default function OrdersPage() {
//   const [query, setQuery] = React.useState("");

//   const filtered = React.useMemo(() => {
//     const q = query.toLowerCase();
//     return orders.filter(
//       (o) =>
//         o.id.toLowerCase().includes(q) ||
//         o.customer.toLowerCase().includes(q) ||
//         o.branch.toLowerCase().includes(q)
//     );
//   }, [query]);

//   return (
//     <div className="min-h-screen bg-slate-50 p-6">
//       <div className="mx-auto max-w-7xl space-y-6">
//         <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-slate-900">
//               Orders Management
//             </h1>
//             <p className="mt-1 text-sm text-slate-500">
//               Track, manage, and review all shop orders from one place.
//             </p>
//           </div>

//           <div className="flex flex-col gap-3 sm:flex-row">
//             <div className="relative min-w-[280px]">
//               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//               <Input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search order, customer, branch..."
//                 className="h-11 rounded-2xl border-slate-300 bg-white pl-10"
//               />
//             </div>
//             <Button className="h-11 rounded-2xl bg-slate-900 text-white hover:bg-slate-800">
//               <Plus className="mr-2 h-4 w-4" />
//               Create Order
//             </Button>
//           </div>
//         </div>

//         <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
//           <StatCard title="Total Orders" value="2,480" icon={Receipt} sub="All order records" />
//           <StatCard title="Paid Orders" value="1,980" icon={Wallet} sub="Successfully paid" />
//           <StatCard title="Pending Orders" value="248" icon={Clock3} sub="Waiting for payment" />
//           <StatCard title="Revenue" value="¥1,284,000" icon={ArrowUpRight} sub="This month sales" />
//         </div>

//         <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
//           <CardHeader className="flex flex-row items-center justify-between">
//             <div>
//               <CardTitle className="text-lg font-bold text-slate-900">
//                 Order List
//               </CardTitle>
//               <CardDescription className="text-slate-500">
//                 Latest orders across branches
//               </CardDescription>
//             </div>
//           </CardHeader>

//           <CardContent>
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[920px] text-sm">
//                 <thead>
//                   <tr className="border-b border-slate-200">
//                     {[
//                       "Order ID",
//                       "Customer",
//                       "Branch",
//                       "Items",
//                       "Payment",
//                       "Status",
//                       "Created At",
//                       "Total",
//                       "Actions",
//                     ].map((h) => (
//                       <th
//                         key={h}
//                         className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
//                       >
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {filtered.map((order) => (
//                     <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
//                       <td className="px-3 py-4 font-mono font-semibold text-slate-900">
//                         {order.id}
//                       </td>
//                       <td className="px-3 py-4 font-medium text-slate-900">
//                         {order.customer}
//                       </td>
//                       <td className="px-3 py-4 text-slate-600">{order.branch}</td>
//                       <td className="px-3 py-4 text-slate-600">{order.items}</td>
//                       <td className="px-3 py-4">
//                         <StatusBadge status={order.paymentStatus as any} />
//                       </td>
//                       <td className="px-3 py-4">
//                         <StatusBadge status={order.orderStatus as any} />
//                       </td>
//                       <td className="px-3 py-4 text-slate-500">{order.createdAt}</td>
//                       <td className="px-3 py-4 font-bold text-slate-900">
//                         {money(order.total)}
//                       </td>
//                       <td className="px-3 py-4">
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="icon" className="rounded-xl">
//                               <MoreHorizontal className="h-4 w-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuItem>View Detail</DropdownMenuItem>
//                             <DropdownMenuItem>Edit Order</DropdownMenuItem>
//                             <DropdownMenuItem>Print Receipt</DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }



"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { useSession } from "next-auth/react";
import {
  Search,
  Plus,
  Receipt,
  ArrowUpRight,
  Clock3,
  Wallet,
  MoreHorizontal,
  Filter,
  Download,
  Sun,
  Moon,
  Sparkles,
  ShoppingBag,
  ChevronDown,
  Eye,
  Pencil,
  Printer,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Package,
  TrendingUp,
  Zap,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const orders = [
  { id: "ORD-1001", customer: "Aung Aung",    branch: "Main Branch", items: 4, paymentStatus: "PAID",    orderStatus: "COMPLETED",  createdAt: "2026-03-23 09:10", total: 24000 },
  { id: "ORD-1002", customer: "Su Su",         branch: "Branch A",    items: 2, paymentStatus: "PENDING", orderStatus: "PROCESSING", createdAt: "2026-03-23 09:22", total: 8200  },
  { id: "ORD-1003", customer: "Ko Ko",         branch: "Online Shop", items: 1, paymentStatus: "REFUND",  orderStatus: "RETURNED",   createdAt: "2026-03-23 09:40", total: 3900  },
  { id: "ORD-1004", customer: "Moe Thidar",    branch: "Main Branch", items: 6, paymentStatus: "PAID",    orderStatus: "COMPLETED",  createdAt: "2026-03-23 10:05", total: 38500 },
  { id: "ORD-1005", customer: "Hla Hla",       branch: "Branch B",    items: 3, paymentStatus: "PAID",    orderStatus: "COMPLETED",  createdAt: "2026-03-23 10:18", total: 12700 },
  { id: "ORD-1006", customer: "Kyaw Zin",      branch: "Branch A",    items: 5, paymentStatus: "PENDING", orderStatus: "PROCESSING", createdAt: "2026-03-23 10:34", total: 19200 },
  { id: "ORD-1007", customer: "Thida Win",     branch: "Online Shop", items: 2, paymentStatus: "PAID",    orderStatus: "COMPLETED",  createdAt: "2026-03-23 10:55", total: 7400  },
  { id: "ORD-1008", customer: "Naing Naing",   branch: "Main Branch", items: 8, paymentStatus: "REFUND",  orderStatus: "RETURNED",   createdAt: "2026-03-23 11:10", total: 55000 },
];

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

function money(n: number) { return `¥${n.toLocaleString()}`; }

// ─── THEME ────────────────────────────────────────────────────────────────────
type Theme = "dark" | "light";

const tk = (theme: Theme) => theme === "dark" ? {
  root:        "bg-[#060a14] text-white",
  text:        "text-white",
  textMuted:   "text-white/50",
  textSubtle:  "text-white/32",
  card:        "border-white/[0.07] bg-white/[0.048] backdrop-blur-xl",
  cardSolid:   "border-white/[0.07] bg-[#0c1018]",
  input:       "border-white/[0.10] bg-white/[0.06] text-white placeholder:text-white/30 focus-visible:border-blue-500/60",
  btn:         "border-white/[0.10] bg-white/[0.055] text-white/80 hover:bg-white/[0.10] hover:text-white",
  btnPrimary:  "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10",
  divider:     "bg-white/[0.06]",
  pill:        "border-white/[0.08] bg-white/[0.05] text-white/60",
  tableHead:   "text-white/38",
  tableRow:    "border-white/[0.045] hover:bg-white/[0.04]",
  tableBorder: "border-white/[0.055]",
  segActive:   "bg-white/[0.14] text-white",
  segInactive: "text-white/42 hover:text-white/70",
  segWrap:     "bg-white/[0.045] border-white/[0.07]",
  grid:        "[background-image:linear-gradient(rgba(255,255,255,0.026)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.026)_1px,transparent_1px)] [background-size:44px_44px]",
  glow1:       "bg-blue-600/[0.08]",
  glow2:       "bg-violet-600/[0.06]",
  rankChip:    "bg-white/[0.06] text-white/45",
  hover:       "hover:bg-white/[0.04]",
  dropMenu:    "bg-[#0c1018] border-white/[0.09]",
  dropItem:    "text-white/70 hover:text-white focus:text-white hover:bg-white/[0.07] focus:bg-white/[0.07]",
} : {
  root:        "bg-[#edf1f9] text-slate-900",
  text:        "text-slate-900",
  textMuted:   "text-slate-500",
  textSubtle:  "text-slate-400",
  card:        "border-slate-200/80 bg-white/95 shadow-[0_2px_20px_rgba(15,23,42,0.06)] backdrop-blur-xl",
  cardSolid:   "border-slate-200 bg-white shadow-sm",
  input:       "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-blue-500",
  btn:         "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 shadow-sm",
  btnPrimary:  "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/20",
  divider:     "bg-slate-200",
  pill:        "border-slate-200 bg-white text-slate-500 shadow-sm",
  tableHead:   "text-slate-400",
  tableRow:    "border-slate-100 hover:bg-slate-50/70",
  tableBorder: "border-slate-200",
  segActive:   "bg-white text-slate-900 shadow-sm",
  segInactive: "text-slate-500 hover:text-slate-700",
  segWrap:     "bg-slate-100 border-slate-200",
  grid:        "[background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:44px_44px]",
  glow1:       "bg-sky-300/20",
  glow2:       "bg-indigo-300/15",
  rankChip:    "bg-slate-100 text-slate-500",
  hover:       "hover:bg-slate-50",
  dropMenu:    "bg-white border-slate-200",
  dropItem:    "text-slate-600 hover:text-slate-900 focus:text-slate-900",
};

// ─── STATUS CONFIG ─────────────────────────────────────────────────────────────
const payConfig: Record<PayStatus, { label: string; dot: string; bg: string; text: string }> = {
  PAID:    { label: "Paid",    dot: "bg-emerald-500", bg: "bg-emerald-500/10", text: "text-emerald-500" },
  PENDING: { label: "Pending", dot: "bg-amber-500",   bg: "bg-amber-500/10",   text: "text-amber-500"   },
  REFUND:  { label: "Refund",  dot: "bg-rose-500",    bg: "bg-rose-500/10",    text: "text-rose-500"    },
};
const ordConfig: Record<OrdStatus, { label: string; dot: string; bg: string; text: string }> = {
  COMPLETED:  { label: "Completed",  dot: "bg-blue-500",   bg: "bg-blue-500/10",   text: "text-blue-500"   },
  PROCESSING: { label: "Processing", dot: "bg-violet-500", bg: "bg-violet-500/10", text: "text-violet-500" },
  RETURNED:   { label: "Returned",   dot: "bg-slate-500",  bg: "bg-slate-500/10",  text: "text-slate-400"  },
};

function StatusPill({ cfg }: { cfg: { label: string; dot: string; bg: string; text: string } }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold", cfg.bg, cfg.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

// ─── KPI CARD ────────────────────────────────────────────────────────────────
function KpiCard({ theme, label, value, prefix = "", sub, icon: Icon, accentClass, delay = 0 }: {
  theme: Theme; label: string; value: number; prefix?: string; sub: string;
  icon: React.ComponentType<{ className?: string }>; accentClass: string; delay?: number;
}) {
  const t = tk(theme);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.015 }}
    >
      <div className={cn("relative overflow-hidden rounded-[20px] border p-5 transition-all duration-200", t.card)}>
        <div className={cn("absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl opacity-45", accentClass)} />
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", theme === "dark" ? "border-white/[0.07] bg-white/[0.07]" : "border-slate-200 bg-slate-50")}>
              <Icon className={cn("h-[18px] w-[18px]", t.textMuted)} />
            </div>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </div>
          <div className={cn("text-[11px] font-bold uppercase tracking-widest mb-1.5", t.textSubtle)}>{label}</div>
          <div className={cn("text-[28px] font-black tracking-tight leading-none", t.text)}>
            {prefix}<CountUp end={value} duration={1.4} separator="," />
          </div>
          <div className={cn("mt-2 text-[11px] font-medium", t.textSubtle)}>{sub}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── FILTER TAB ───────────────────────────────────────────────────────────────
const FILTER_TABS = ["All", "Paid", "Pending", "Refund", "Completed", "Processing", "Returned"];
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
  if (status.includes("PENDING") || status.includes("UNPAID") || status.includes("DUE")) return "PENDING";
  return "PAID";
}

function normalizeOrderStatus(value: unknown): OrdStatus {
  const status = String(value || "").toUpperCase();
  if (status.includes("RETURN") || status.includes("REFUND") || status.includes("CANCEL")) return "RETURNED";
  if (status.includes("PROCESS") || status.includes("PENDING") || status.includes("OPEN")) return "PROCESSING";
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
    const lineTotal = toNumber(item?.lineTotal ?? item?.line_total ?? item?.total, qty * price);

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
    items: Math.max(0, toNumber(receipt?.itemCount ?? receipt?.item_count ?? receipt?.totalItems ?? itemDetails.length)),
    paymentStatus: normalizePaymentStatus(receipt?.paymentStatus ?? receipt?.payment_status ?? receipt?.status),
    orderStatus: normalizeOrderStatus(receipt?.orderStatus ?? receipt?.order_status ?? receipt?.status),
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
      return readArrayPayload(data)
        .map(normalizeReceiptToOrder)
        .filter(Boolean) as OrderRow[];
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Orders API fetch failed.";
    }
  }

  throw new Error(lastError || "No orders endpoint available.");
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [query,  setQuery]  = React.useState("");
  const [tab,    setTab]    = React.useState("All");
  const [theme,  setTheme]  = React.useState<Theme>("dark");
  const [orders, setOrders] = React.useState<OrderRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [apiError, setApiError] = React.useState("");
  const [selectedOrder, setSelectedOrder] = React.useState<OrderRow | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const t = tk(theme);
  const accessToken = String((session as any)?.accessToken || (session as any)?.user?.accessToken || "").trim();

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
    return orders.filter(o => {
      const matchSearch =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.branch.toLowerCase().includes(q);
      const matchTab =
        tab === "All" ||
        o.paymentStatus === tab.toUpperCase() ||
        o.orderStatus   === tab.toUpperCase();
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

  const paidOrders = React.useMemo(() => orders.filter((o) => o.paymentStatus === "PAID").length, [orders]);
  const pendingOrders = React.useMemo(() => orders.filter((o) => o.paymentStatus === "PENDING").length, [orders]);
  const refundOrders = React.useMemo(() => orders.filter((o) => o.paymentStatus === "REFUND").length, [orders]);
  const processingOrders = React.useMemo(() => orders.filter((o) => o.orderStatus === "PROCESSING").length, [orders]);
  const completedOrders = React.useMemo(() => orders.filter((o) => o.orderStatus === "COMPLETED").length, [orders]);
  const revenue = React.useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);
  const avgOrderValue = orders.length ? Math.round(revenue / orders.length) : 0;
  const refundRate = orders.length ? (refundOrders / orders.length) * 100 : 0;

  return (
    <div className={cn("relative min-h-screen transition-colors duration-300", t.root)}>
      {/* grid */}
      <div className={cn("pointer-events-none fixed inset-0", t.grid)} />
      {/* glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className={cn("absolute -top-32 left-[10%] h-[500px] w-[500px] rounded-full blur-[130px]", t.glow1)} />
        <div className={cn("absolute bottom-0 right-[-5%] h-[400px] w-[400px] rounded-full blur-[120px]", t.glow2)} />
      </div>

      <div className="relative z-10 mx-auto max-w-[1520px] px-5 py-7 md:px-8 space-y-7">

        {/* ── TOPBAR ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26 }}
          className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className={cn("mb-2.5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold", t.pill)}>
              <Sparkles className="h-3 w-3" />
              Orders Management
            </div>
            <h1 className={cn("text-[34px] md:text-[42px] font-black tracking-tight leading-[0.95]", t.text)}>
              Orders
              <span className={cn("ml-3 text-[20px] font-bold", t.textMuted)}>/ All Branches</span>
            </h1>
            <p className={cn("mt-2 text-sm", t.textMuted)}>
              Track, manage, and review all shop orders from one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5", t.textSubtle)} />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search order, customer, branch…"
                className={cn("h-9 w-[260px] rounded-xl pl-9 text-[13px]", t.input)}
              />
            </div>

            <button
              onClick={loadOrders}
              disabled={loading}
              className={cn("flex h-9 items-center gap-1.5 rounded-xl border px-3.5 text-[13px] font-semibold transition-all disabled:opacity-60", t.btn)}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              Reload API
            </button>

            <button className={cn("flex h-9 items-center gap-1.5 rounded-xl border px-3.5 text-[13px] font-semibold transition-all", t.btn)}>
              <Download className="h-3.5 w-3.5" />
              Export
            </button>

            <button
              onClick={() => setTheme(th => th === "dark" ? "light" : "dark")}
              className={cn("flex h-9 w-9 items-center justify-center rounded-xl border transition-all", t.btn)}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button className={cn("flex h-9 items-center gap-1.5 rounded-xl px-4 text-[13px] font-bold transition-all", t.btnPrimary)}>
              <Plus className="h-4 w-4" />
              Create Order
            </button>
          </div>
        </motion.div>

        {/* ── KPI ROW ───────────────────────────────────────────────────── */}
        <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
          <KpiCard theme={theme} label="Total Orders"   value={orders.length} sub="Loaded from API"       icon={Receipt}       accentClass="bg-blue-500/18"    delay={0}    />
          <KpiCard theme={theme} label="Paid Orders"    value={paidOrders}    sub="Successfully paid"     icon={Wallet}        accentClass="bg-emerald-500/18" delay={0.07} />
          <KpiCard theme={theme} label="Pending Orders" value={pendingOrders} sub="Awaiting payment"      icon={Clock3}        accentClass="bg-amber-500/18"   delay={0.14} />
          <KpiCard theme={theme} label="Revenue" value={revenue} prefix="¥" sub="Receipt total" icon={TrendingUp} accentClass="bg-violet-500/18" delay={0.21} />
        </div>

        {/* ── QUICK STATS STRIP ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.26 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            { label: "Completed",         value: String(completedOrders),       color: "text-blue-400"   },
            { label: "Processing Now",    value: String(processingOrders),      color: "text-violet-400" },
            { label: "Avg Order Value",   value: money(avgOrderValue),          color: "text-emerald-400"},
            { label: "Refund Rate",       value: `${refundRate.toFixed(1)}%`,   color: "text-rose-400"   },
          ].map((s, i) => (
            <div key={s.label} className={cn("rounded-[18px] border px-4 py-3.5", t.card)}>
              <div className={cn("text-[11px] font-semibold uppercase tracking-widest", t.textSubtle)}>{s.label}</div>
              <div className={cn("mt-1.5 text-[22px] font-black", s.color)}>{s.value}</div>
            </div>
          ))}
        </motion.div>

        {/* ── ORDER TABLE ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.30 }}
        >
          <div className={cn("rounded-[22px] border overflow-hidden", t.card)}>

            {/* Table Header */}
            <div className={cn("flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between border-b", t.tableBorder)}>
              <div>
                <div className={cn("text-[17px] font-bold", t.text)}>Order List</div>
                <div className={cn("text-[12px] mt-0.5", t.textMuted)}>
                  {apiError ? apiError : `${filtered.length} order${filtered.length !== 1 ? "s" : ""} found from API`}
                </div>
              </div>

              {/* Filter tabs - scrollable */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                {FILTER_TABS.map(f => (
                  <button
                    key={f}
                    onClick={() => setTab(f)}
                    className={cn(
                      "shrink-0 rounded-xl px-3.5 py-2 text-[12px] font-bold transition-all whitespace-nowrap",
                      tab === f
                        ? theme === "dark" ? "bg-white/[0.13] text-white" : "bg-slate-900 text-white"
                        : cn(t.textMuted, "hover:bg-white/[0.05] dark:hover:text-white/70")
                    )}
                  >{f}</button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px]">
                <thead>
                  <tr className={cn("border-b", t.tableBorder)}>
                    {[
                      { label: "Order ID",   align: "left"  },
                      { label: "Customer",   align: "left"  },
                      { label: "Branch",     align: "left"  },
                      { label: "Items",      align: "center"},
                      { label: "Payment",    align: "left"  },
                      { label: "Status",     align: "left"  },
                      { label: "Date",       align: "left"  },
                      { label: "Total",      align: "right" },
                      { label: "",           align: "center"},
                    ].map((h, i) => (
                      <th
                        key={i}
                        className={cn(
                          "px-4 py-3.5 text-[10px] font-black uppercase tracking-widest",
                          h.align === "right" ? "text-right" : h.align === "center" ? "text-center" : "text-left",
                          t.tableHead
                        )}
                      >
                        {h.label && (
                          <span className="flex items-center gap-1">
                            {h.label}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>

                <AnimatePresence mode="popLayout">
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={9} className={cn("py-16 text-center", t.textMuted)}>
                          <div className="flex flex-col items-center gap-3">
                            <RefreshCw className="h-10 w-10 animate-spin opacity-40" />
                            <div className="text-sm font-semibold">Loading orders from API...</div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {!loading && apiError && (
                      <tr>
                        <td colSpan={9} className="py-16 text-center text-rose-400">
                          <div className="flex flex-col items-center gap-3">
                            <AlertCircle className="h-10 w-10 opacity-70" />
                            <div className="text-sm font-semibold">{apiError}</div>
                            <button onClick={loadOrders} className={cn("mt-2 rounded-xl border px-4 py-2 text-[12px] font-bold", t.btn)}>
                              Try again
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {!loading && !apiError && paginatedOrders.map((order, i) => {
                      const pay = payConfig[order.paymentStatus] ?? payConfig.PENDING;
                      const ord = ordConfig[order.orderStatus] ?? ordConfig.PROCESSING;
                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={cn("border-b transition-colors cursor-default group", t.tableRow)}
                        >
                          {/* Order ID */}
                          <td className="px-4 py-4">
                            <span className={cn("font-mono text-[12px] font-bold", t.textMuted)}>{order.id}</span>
                          </td>

                          {/* Customer */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-black",
                                theme === "dark" ? "bg-white/[0.08] text-white/60" : "bg-slate-100 text-slate-500"
                              )}>
                                {order.customer.charAt(0)}
                              </div>
                              <span className={cn("text-[13px] font-semibold", t.text)}>{order.customer}</span>
                            </div>
                          </td>

                          {/* Branch */}
                          <td className="px-4 py-4">
                            <span className={cn("rounded-lg border px-2.5 py-1 text-[11px] font-semibold", t.pill)}>
                              {order.branch}
                            </span>
                          </td>

                          {/* Items */}
                          <td className="px-4 py-4 text-center">
                            <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-xl text-[12px] font-bold",
                              theme === "dark" ? "bg-white/[0.07] text-white/70" : "bg-slate-100 text-slate-600"
                            )}>
                              {order.items}
                            </span>
                          </td>

                          {/* Payment Status */}
                          <td className="px-4 py-4">
                            <StatusPill cfg={pay} />
                          </td>

                          {/* Order Status */}
                          <td className="px-4 py-4">
                            <StatusPill cfg={ord} />
                          </td>

                          {/* Date */}
                          <td className="px-4 py-4">
                            <div className={cn("text-[12px]", t.textSubtle)}>
                              <div>{order.createdAt.split(" ")[0]}</div>
                              <div className="mt-0.5 font-semibold">{order.createdAt.split(" ")[1]}</div>
                            </div>
                          </td>

                          {/* Total */}
                          <td className="px-4 py-4 text-right">
                            <span className={cn("text-[14px] font-black", t.text)}>{money(order.total)}</span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className={cn(
                                  "flex h-8 w-8 items-center justify-center rounded-xl border opacity-0 group-hover:opacity-100 transition-all",
                                  t.btn
                                )}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className={cn("rounded-2xl border min-w-[170px] p-1.5", t.dropMenu)}
                              >
                                <DropdownMenuItem
                                  onClick={() => setSelectedOrder(order)}
                                  className={cn("rounded-xl gap-2.5 text-[13px] py-2.5 cursor-pointer", t.dropItem)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  View Detail
                                </DropdownMenuItem>
                                <DropdownMenuItem className={cn("rounded-xl gap-2.5 text-[13px] py-2.5 cursor-pointer", t.dropItem)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit Order
                                </DropdownMenuItem>
                                <DropdownMenuItem className={cn("rounded-xl gap-2.5 text-[13px] py-2.5 cursor-pointer", t.dropItem)}>
                                  <Printer className="h-3.5 w-3.5" />
                                  Print Receipt
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className={cn("my-1", t.divider)} />
                                <DropdownMenuItem className="rounded-xl gap-2.5 text-[13px] py-2.5 cursor-pointer text-rose-500 hover:text-rose-500 focus:text-rose-500 hover:bg-rose-500/10 focus:bg-rose-500/10">
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
                        <td colSpan={9} className={cn("py-16 text-center", t.textMuted)}>
                          <div className="flex flex-col items-center gap-3">
                            <Package className="h-10 w-10 opacity-30" />
                            <div className="text-sm font-semibold">No orders found</div>
                            <div className={cn("text-[12px]", t.textSubtle)}>Try adjusting your search or filter</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </AnimatePresence>
              </table>
            </div>

            {/* Table Footer */}
            <div className={cn("flex flex-col gap-3 px-6 py-4 border-t sm:flex-row sm:items-center sm:justify-between", t.tableBorder)}>
              <div className={cn("text-[12px] font-medium", t.textSubtle)}>
                Showing{" "}
                <span className={cn("font-bold", t.textMuted)}>
                  {filtered.length ? pageStart + 1 : 0}-{pageEnd}
                </span>{" "}
                of <span className={cn("font-bold", t.textMuted)}>{filtered.length}</span> filtered orders
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
                  className={cn("flex h-8 min-w-[58px] items-center justify-center rounded-xl border px-3 text-[12px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40", t.btn)}
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
                        ? theme === "dark" ? "bg-white/[0.14] border-white/[0.14] text-white" : "bg-slate-900 border-transparent text-white"
                        : t.btn
                    )}
                  >{p}</button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className={cn("flex h-8 min-w-[58px] items-center justify-center rounded-xl border px-3 text-[12px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40", t.btn)}
                >
                  Next
                </button>
              </div>
            </div>

          </div>
        </motion.div>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <div className={cn("flex items-center justify-between text-[11px] font-semibold pb-3", t.textSubtle)}>
          <span>© 2026 BINHLAIG · Orders Module</span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-3 w-3" />
            Connected · /api/pos/receipts
          </span>
        </div>

      </div>

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
              className={cn("max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[24px] border shadow-2xl", t.cardSolid)}
            >
              <div className={cn("flex items-start justify-between gap-4 border-b px-6 py-5", t.tableBorder)}>
                <div>
                  <div className={cn("text-[11px] font-black uppercase tracking-widest", t.textSubtle)}>Order Detail</div>
                  <h2 className={cn("mt-1 font-mono text-xl font-black", t.text)}>{selectedOrder.id}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusPill cfg={payConfig[selectedOrder.paymentStatus]} />
                    <StatusPill cfg={ordConfig[selectedOrder.orderStatus]} />
                  </div>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border", t.btn)}
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
                      <div className={cn("text-[10px] font-black uppercase tracking-widest", t.textSubtle)}>{label}</div>
                      <div className={cn("mt-2 text-sm font-bold", t.text)}>{value}</div>
                    </div>
                  ))}
                </div>

                <div className={cn("mt-5 overflow-hidden rounded-2xl border", t.tableBorder)}>
                  <div className={cn("border-b px-4 py-3 text-sm font-black", t.tableBorder, t.text)}>
                    Items ({selectedOrder.items})
                  </div>

                  {selectedOrder.itemDetails.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[560px] text-sm">
                        <thead>
                          <tr className={cn("border-b", t.tableBorder)}>
                            {["Item", "Qty", "Price", "Line Total"].map((heading) => (
                              <th key={heading} className={cn("px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest", t.tableHead)}>
                                {heading}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrder.itemDetails.map((item, index) => (
                            <tr key={`${item.name}-${index}`} className={cn("border-b", t.tableBorder)}>
                              <td className={cn("px-4 py-3 font-semibold", t.text)}>{item.name}</td>
                              <td className={cn("px-4 py-3", t.textMuted)}>{item.qty}</td>
                              <td className={cn("px-4 py-3", t.textMuted)}>{money(item.price)}</td>
                              <td className={cn("px-4 py-3 font-bold", t.text)}>{money(item.total)}</td>
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
                  <button onClick={() => setSelectedOrder(null)} className={cn("rounded-xl border px-4 py-2 text-sm font-bold", t.btn)}>
                    Close
                  </button>
                  <button onClick={() => window.print()} className={cn("inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold", t.btnPrimary)}>
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
