
"use client";

import { useEffect, useMemo, useState, type ElementType } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  Package,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SalesRange = "daily" | "weekly" | "monthly";

type SalesItem = {
  label: string;
  value: number;
};

type Product = {
  id: number | string;
  sku?: string;
  barcode?: string;
  name?: string;
  productName?: string;
  product_name?: string;
  category?: string;
  productType?: string;
  product_type?: string;
  productQuantityAmount?: number;
  product_quantity_amount?: number;
  quantity?: number;
  stock?: number;
};

type ReceiptItem = {
  productId?: number | string;
  product_id?: number | string;
  productName?: string;
  product_name?: string;
  name?: string;
  sku?: string;
  barcode?: string;
  category?: string;
  qty?: number;
  quantity?: number;
  price?: number;
  total?: number;
};

type Receipt = {
  id?: number;
  receiptNo?: string;
  createdAt?: string;
  customerName?: string;
  grandTotal?: number;
  total?: number;
  paymentMethod?: string;
  status?: string;
  items?: ReceiptItem[];
  receiptItems?: ReceiptItem[];
  receipt_items?: ReceiptItem[];
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const LOW_STOCK_LIMIT = 10;

function getToken() {
  if (typeof window === "undefined") return null;
  for (const key of [
    "pos_shop_owner_token",
    "pos_access_token",
    "access_token",
    "token",
    "jwt",
  ]) {
    const token = localStorage.getItem(key);
    if (token) return token;
  }
  return null;
}

async function fetchApi<T>(path: string): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  return response.json() as Promise<T>;
}

function listFrom<T>(payload: T[] | { content?: T[]; data?: T[]; receipts?: T[] }): T[] {
  if (Array.isArray(payload)) return payload;
  return payload.content ?? payload.data ?? payload.receipts ?? [];
}

function receiptTotal(receipt: Receipt) {
  return Number(receipt.grandTotal ?? receipt.total ?? 0);
}

function receiptDate(receipt: Receipt) {
  return receipt.createdAt ? new Date(receipt.createdAt) : new Date(0);
}

const salesInformation: Record<
  SalesRange,
  {
    title: string;
    description: string;
    change: string;
  }
> = {
  daily: {
    title: "Daily Sales",
    description: "Today’s hourly sales performance",
    change: "+8.5%",
  },
  weekly: {
    title: "Weekly Sales",
    description: "Sales performance for this week",
    change: "+12.5%",
  },
  monthly: {
    title: "Monthly Sales",
    description: "Sales performance for this month",
    change: "+18.2%",
  },
};

function formatYen(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatChartValue(value: number) {
  if (value >= 1_000_000) {
    return `¥${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `¥${Math.round(value / 1_000)}K`;
  }

  return `¥${value}`;
}

const DashboardPage = () => {
  const [salesRange, setSalesRange] = useState<SalesRange>("weekly");
  const [products, setProducts] = useState<Product[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchApi<Product[] | { content?: Product[]; data?: Product[]; receipts?: Product[] }>("/api/products"),
      fetchApi<Receipt[] | { content?: Receipt[]; data?: Receipt[]; receipts?: Receipt[] }>(
        "/api/pos/receipts/shop",
      ),
    ])
      .then(([productPayload, receiptPayload]) => {
        if (!active) return;
        setProducts(listFrom(productPayload));
        setReceipts(listFrom(receiptPayload));
        setError(null);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load dashboard data");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const now = useMemo(() => new Date(), []);
  const startToday = useMemo(() => new Date(now.getFullYear(), now.getMonth(), now.getDate()), [now]);
  const startTomorrow = useMemo(() => new Date(startToday.getTime() + 86_400_000), [startToday]);
  const startYesterday = useMemo(() => new Date(startToday.getTime() - 86_400_000), [startToday]);
  const paidReceipts = useMemo(
    () => receipts.filter((receipt) => (receipt.status ?? "PAID").toUpperCase() !== "CANCELLED"),
    [receipts],
  );
  const todayReceipts = useMemo(
    () => paidReceipts.filter((receipt) => receiptDate(receipt) >= startToday && receiptDate(receipt) < startTomorrow),
    [paidReceipts, startToday, startTomorrow],
  );
  const yesterdayReceipts = useMemo(
    () => paidReceipts.filter((receipt) => receiptDate(receipt) >= startYesterday && receiptDate(receipt) < startToday),
    [paidReceipts, startYesterday, startToday],
  );
  const todaySales = todayReceipts.reduce((sum, receipt) => sum + receiptTotal(receipt), 0);
  const yesterdaySales = yesterdayReceipts.reduce((sum, receipt) => sum + receiptTotal(receipt), 0);
  const percentChange = (current: number, previous: number) =>
    previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
  const salesChange = percentChange(todaySales, yesterdaySales);
  const orderChange = percentChange(todayReceipts.length, yesterdayReceipts.length);

  const salesData = useMemo<Record<SalesRange, SalesItem[]>>(() => {
    const daily = Array.from({ length: 24 }, (_, hour) => ({ label: `${hour.toString().padStart(2, "0")}:00`, value: 0 }));
    const weekly = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => ({ label, value: 0 }));
    const monthly = Array.from({ length: 5 }, (_, index) => ({ label: `Week ${index + 1}`, value: 0 }));
    const mondayOffset = (now.getDay() + 6) % 7;
    const weekStart = new Date(startToday.getTime() - mondayOffset * 86_400_000);
    paidReceipts.forEach((receipt) => {
      const date = receiptDate(receipt);
      const value = receiptTotal(receipt);
      if (date >= startToday && date < startTomorrow) daily[date.getHours()].value += value;
      const weekIndex = Math.floor((date.getTime() - weekStart.getTime()) / 86_400_000);
      if (weekIndex >= 0 && weekIndex < 7) weekly[weekIndex].value += value;
      if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) {
        monthly[Math.min(4, Math.floor((date.getDate() - 1) / 7))].value += value;
      }
    });
    return { daily, weekly, monthly };
  }, [now, paidReceipts, startToday, startTomorrow]);

  const selectedSales = salesData[salesRange];
  const totalSales = selectedSales.reduce((total, item) => total + item.value, 0);
  const lowStockItems = useMemo(
    () => products.map((product) => ({
      id: product.id,
      name: product.productName ?? product.product_name ?? product.name ?? `Product #${product.id}`,
      stock: Number(product.productQuantityAmount ?? product.product_quantity_amount ?? product.quantity ?? product.stock ?? 0),
      color: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    })).filter((product) => product.stock <= LOW_STOCK_LIMIT).sort((a, b) => a.stock - b.stock),
    [products],
  );
  const recentTransactions = useMemo(
    () => [...paidReceipts].sort((a, b) => receiptDate(b).getTime() - receiptDate(a).getTime()).slice(0, 5),
    [paidReceipts],
  );
  const categorySales = useMemo(() => {
    const productById = new Map(products.map((product) => [String(product.id), product]));
    const productByName = new Map(
      products.flatMap((product) =>
        [product.productName, product.product_name, product.name]
          .filter((name): name is string => Boolean(name))
          .map((name) => [name.trim().toLowerCase(), product] as const),
      ),
    );
    const productByCode = new Map(
      products.flatMap((product) =>
        [product.sku, product.barcode]
          .filter((code): code is string => Boolean(code))
          .map((code) => [String(code).trim(), product] as const),
      ),
    );
    const totals = new Map<string, number>();
    todayReceipts.forEach((receipt) => {
      const items = receipt.items ?? receipt.receiptItems ?? receipt.receipt_items ?? [];
      items.forEach((item) => {
      const productId = item.productId ?? item.product_id;
      const productName = item.productName ?? item.product_name ?? item.name;
      const product =
        (productId != null ? productById.get(String(productId)) : undefined) ??
        (productName ? productByName.get(productName.trim().toLowerCase()) : undefined) ??
        productByCode.get(String(item.sku ?? item.barcode ?? "").trim());
      const category =
        item.category?.trim() ||
        product?.category?.trim() ||
        product?.productType?.trim() ||
        product?.product_type?.trim() ||
        "Others";
      const value = Number(item.total ?? Number(item.price ?? 0) * Number(item.qty ?? item.quantity ?? 0));
      totals.set(category, (totals.get(category) ?? 0) + value);
      });
    });
    return [...totals.entries()].map(([title, value]) => ({ title, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [products, todayReceipts]);
  const categoryTotal = categorySales.reduce((sum, category) => sum + category.value, 0);
  const categoryGradient = useMemo(() => {
    const colors = ["#2563eb", "#22c55e", "#f97316", "#8b5cf6", "#cbd5e1"];
    if (!categoryTotal) return "conic-gradient(#e2e8f0 0% 100%)";
    let start = 0;
    const stops = categorySales.map((category, index) => {
      const end = start + (category.value / categoryTotal) * 100;
      const stop = `${colors[index]} ${start}% ${end}%`;
      start = end;
      return stop;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [categorySales, categoryTotal]);

  return (
    <section className="py-5">
      {/* Heading */}
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            Dashboard Overview
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Today&apos;s shop sales and performance summary.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="
                flex h-10 items-center gap-2 rounded-xl
                border border-slate-200 bg-white px-3
                text-xs font-medium text-slate-600
                shadow-sm transition hover:bg-slate-50
                dark:border-white/10 dark:bg-slate-950
                dark:text-slate-300 dark:hover:bg-white/10
                sm:text-sm
              "
          >
            <CalendarDays size={17} />
            <span>{now.toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}</span>
          </button>

          <Link
            href="/dashboard/pos"
            className="
                flex h-10 items-center gap-2 rounded-xl
                bg-blue-600 px-4 text-xs font-semibold
                text-white shadow-md shadow-blue-600/20
                transition hover:bg-blue-700 active:scale-95
                sm:text-sm
              "
          >
            <ShoppingCart size={17} />
            Open POS
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}. Please sign in again and confirm the API URL.
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <SummaryCard
          title="Today Sales"
          value={loading ? "—" : formatYen(todaySales)}
          change={`${salesChange >= 0 ? "+" : ""}${salesChange.toFixed(1)}%`}
          comparison="vs yesterday"
          icon={TrendingUp}
          iconStyle="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          negative={salesChange < 0}
        />

        <SummaryCard
          title="Orders"
          value={loading ? "—" : todayReceipts.length.toLocaleString()}
          change={`${orderChange >= 0 ? "+" : ""}${orderChange.toFixed(1)}%`}
          comparison="vs yesterday"
          icon={ShoppingCart}
          iconStyle="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          negative={orderChange < 0}
        />

        <SummaryCard
          title="Products"
          value={loading ? "—" : products.length.toLocaleString()}
          change="Live"
          comparison="from inventory"
          icon={Package}
          iconStyle="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
        />

        <SummaryCard
          title="Low Stock"
          value={loading ? "—" : lowStockItems.length.toLocaleString()}
          change={`≤ ${LOW_STOCK_LIMIT}`}
          comparison="items remaining"
          icon={AlertTriangle}
          iconStyle="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
          negative={lowStockItems.length > 0}
        />
      </div>

      {/* Charts */}
      <div className="mt-4 grid grid-cols-1 gap-4 2xl:grid-cols-5">
        {/* Sales line chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black 2xl:col-span-3">
          {/* Chart header */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">
                {salesInformation[salesRange].title}
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {salesInformation[salesRange].description}
              </p>
            </div>

            {/* Range buttons */}
            <div className="flex w-fit items-center rounded-xl bg-slate-100 p-1 dark:bg-white/[0.07]">
              <SalesRangeButton
                label="Daily"
                active={salesRange === "daily"}
                onClick={() => setSalesRange("daily")}
              />

              <SalesRangeButton
                label="Weekly"
                active={salesRange === "weekly"}
                onClick={() => setSalesRange("weekly")}
              />

              <SalesRangeButton
                label="Monthly"
                active={salesRange === "monthly"}
                onClick={() => setSalesRange("monthly")}
              />
            </div>
          </div>

          {/* Sales total */}
          <div className="mt-6 flex items-end gap-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total sales
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                {formatYen(totalSales)}
              </p>
            </div>

            <span className="mb-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              Live DB
            </span>
          </div>

          {/* Recharts line chart */}
          <div className="mt-6 h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                key={salesRange}
                data={selectedSales}
                margin={{
                  top: 12,
                  right: 12,
                  bottom: 0,
                  left: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="var(--color-blue-600)"
                      stopOpacity={0.38}
                    />

                    <stop
                      offset="55%"
                      stopColor="var(--color-blue-400)"
                      stopOpacity={0.13}
                    />

                    <stop
                      offset="100%"
                      stopColor="var(--color-blue-400)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="rgba(148, 163, 184, 0.2)"
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  dy={10}
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 11,
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 11,
                  }}
                  tickFormatter={formatChartValue}
                />

                <Tooltip
                  cursor={{
                    stroke: "var(--color-blue-600)",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  formatter={(value) => [formatYen(Number(value)), "Sales"]}
                  labelFormatter={(label) =>
                    salesRange === "daily" ? `Time: ${label}` : `${label}`
                  }
                  contentStyle={{
                    border: "none",
                    borderRadius: "12px",
                    backgroundColor: "#0f172a",
                    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.18)",
                    padding: "10px 12px",
                  }}
                  labelStyle={{
                    color: "#94a3b8",
                    fontSize: "11px",
                    marginBottom: "5px",
                  }}
                  itemStyle={{
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  name="Sales"
                  stroke="var(--color-blue-600)"
                  strokeWidth={3}
                  fill="url(#salesGradient)"
                  dot={{
                    r: 4,
                    fill: "#ffffff",
                    stroke: "var(--color-blue-600)",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: "var(--color-blue-600)",
                    stroke: "#ffffff",
                    strokeWidth: 3,
                  }}
                  animationBegin={0}
                  animationDuration={700}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black 2xl:col-span-2">
          <h2 className="font-bold text-slate-950 dark:text-white">
            Sales by Category
          </h2>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Product category sales distribution
          </p>

          <div className="mt-8 flex flex-col items-center gap-7 lg:flex-row lg:justify-center">
            <div
              className="relative h-44 w-44 shrink-0 rounded-full"
              style={{
                background: categoryGradient,
              }}
            >
              <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-white transition-colors dark:bg-black">
                <p className="text-xl font-bold text-slate-950 dark:text-white">
                  {formatYen(categoryTotal)}
                </p>

                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Total sales
                </p>
              </div>
            </div>

            <div className="w-full space-y-3">
              {categorySales.length === 0 ? (
                <p className="text-center text-xs text-slate-400">No category sales today</p>
              ) : categorySales.map((category, index) => (
                <CategoryItem
                  key={category.title}
                  color={["bg-blue-600", "bg-green-500", "bg-orange-500", "bg-violet-500", "bg-slate-300"][index]}
                  title={category.title}
                  value={formatYen(category.value)}
                  percent={`${(categoryTotal ? (category.value / categoryTotal) * 100 : 0).toFixed(1)}%`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom content */}
      <div className="mt-4 grid grid-cols-1 gap-4 2xl:grid-cols-5">
        {/* Recent transactions */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-black 2xl:col-span-3">
          <div className="flex items-center justify-between p-5">
            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">
                Recent Transactions
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Latest POS sales and payments
              </p>
            </div>

            <Link
              href="/dashboard/receipts"
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View all
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="border-y border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.04]">
                <tr className="text-left text-[11px] text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-3 font-medium">Receipt</th>

                  <th className="px-4 py-3 font-medium">Time</th>

                  <th className="px-4 py-3 font-medium">Customer</th>

                  <th className="px-4 py-3 font-medium">Total</th>

                  <th className="px-4 py-3 font-medium">Payment</th>

                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {recentTransactions.map((transaction, index) => (
                  <tr
                    key={transaction.id ?? transaction.receiptNo ?? index}
                    className="text-xs transition hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 font-medium text-blue-600">
                      {transaction.receiptNo ?? `#${transaction.id ?? "—"}`}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {receiptDate(transaction).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-700 dark:text-slate-200">
                      {transaction.customerName ?? "Walk-in Customer"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {formatYen(receiptTotal(transaction))}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      {(transaction.paymentMethod ?? "—").replaceAll("_", " ")}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        {transaction.status ?? "PAID"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black 2xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-950 dark:text-white">
                Low Stock Alerts
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Products requiring restock
              </p>
            </div>

            <Link
              href="/dashboard/inventory"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View all
            </Link>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
            <table className="w-full table-fixed">
              <thead className="bg-slate-50 dark:bg-white/[0.04]">
                <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <th className="w-[68%] px-4 py-3 font-semibold">Product Name</th>
                  <th className="px-4 py-3 text-right font-semibold">Remaining Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {lowStockItems.slice(0, 5).map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50 dark:hover:bg-white/[0.04]">
                    <td className="px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
                          <Package size={17} />
                        </div>
                        <span className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex min-w-16 justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${
                        item.stock <= 0
                          ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                          : "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                      }`}>
                        {item.stock}
                      </span>
                    </td>
                  </tr>
                ))}
                {loading && (
                  <tr><td colSpan={2} className="px-4 py-8 text-center text-xs text-slate-400">Loading products...</td></tr>
                )}
                {!loading && lowStockItems.length === 0 && (
                  <tr><td colSpan={2} className="px-4 py-8 text-center text-xs text-slate-400">All products have enough stock</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <Link
            href="/dashboard/inventory"
            className="
                mt-4 flex h-10 w-full items-center
                justify-center gap-2 rounded-xl
                border border-slate-200
                text-xs font-semibold text-slate-600
                transition hover:bg-slate-50
                dark:border-white/10 dark:text-slate-300
                dark:hover:bg-white/10
              "
          >
            <ReceiptText size={16} />
            Manage inventory
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;

function SummaryCard({
  title,
  value,
  change,
  comparison,
  icon: Icon,
  iconStyle,
  negative = false,
}: {
  title: string;
  value: string;
  change: string;
  comparison: string;
  icon: ElementType;
  iconStyle: string;
  negative?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-black">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>

          <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            {value}
          </h2>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px]">
        <span
          className={
            negative
              ? "font-semibold text-red-500"
              : "font-semibold text-emerald-600"
          }
        >
          {change}
        </span>

        <span className="text-slate-400">{comparison}</span>
      </div>
    </article>
  );
}

function SalesRangeButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-lg px-3 py-1.5
        text-[11px] font-medium
        transition-all duration-200
        sm:text-xs
        ${
          active
            ? "bg-white text-blue-600 shadow-sm dark:bg-white/10 dark:text-blue-400"
            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        }
      `}
    >
      {label}
    </button>
  );
}

function CategoryItem({
  color,
  title,
  value,
  percent,
}: {
  color: string;
  title: string;
  value: string;
  percent: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />

      <span className="min-w-0 flex-1 truncate text-slate-600 dark:text-slate-300">
        {title}
      </span>

      <span className="whitespace-nowrap font-medium text-slate-900 dark:text-white">
        {value}
      </span>

      <span className="w-11 text-right text-slate-400">{percent}</span>
    </div>
  );
}
