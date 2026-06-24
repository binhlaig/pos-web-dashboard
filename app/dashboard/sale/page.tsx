"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ImageIcon,
  Loader2,
  Moon,
  Move,
  RefreshCw,
  Search,
  Sun,
  TrendingUp,
} from "lucide-react";
import { useSession } from "next-auth/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast, { Toaster } from "react-hot-toast";

type ThemeMode = "dark" | "light";
type Range = "1h" | "1d";
type MainTab = "info" | "image" | "chart";
type SortKey = "revenue" | "qty" | "name" | "stock";

type SaleProductSummary = {
  productId: string;
  sku: string;
  product_name: string;
  product_price: number;
  quantity_sold: number;
  total_amount: number;
  product_quantity_amount: number;
  image_url?: string | null;
};

type ActiveDrag =
  | {
      type: "row";
      row: SaleProductSummary;
    }
  | null;

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080";

const ACCENT = {
  blue: "#3b82f6",
  cyan: "#d4a352",
  emerald: "#10b981",
  amber: "#d4a352",
  rose: "#f43f5e",
  violet: "#a78bfa",
};

function fmt(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(v) ? v : 0);
}

function numberFmt(v: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(v) ? v : 0);
}

function initials(name: string) {
  return String(name || "NA")
    .split(" ")
    .map((x) => x[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function toNumber(value: unknown, fallback = 0) {
  if (value == null || value === "") return fallback;
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;

  const n = Number(String(value).replaceAll(",", "").trim());
  return Number.isFinite(n) ? n : fallback;
}

function readArrayPayload(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.products)) return data.data.products;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data?.content)) return data.data.content;
  if (Array.isArray(data?.data?.rows)) return data.data.rows;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.result?.products)) return data.result.products;
  if (Array.isArray(data?.result?.items)) return data.result.items;
  return [];
}

function cleanApiBase(base: string) {
  return base.replace(/\/+$/, "");
}

function apiUrl(base: string, path: string) {
  const cleanBase = cleanApiBase(base);

  return cleanBase.endsWith("/api")
    ? `${cleanBase}${path}`
    : `${cleanBase}/api${path}`;
}

function buildImageUrl(path?: string | null) {
  const raw = String(path || "").trim();
  if (!raw) return null;

  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/uploads/")) return `${cleanApiBase(API_BASE)}${raw}`;
  if (raw.startsWith("uploads/")) return `${cleanApiBase(API_BASE)}/${raw}`;
  if (raw.startsWith("/")) return raw;

  return `${cleanApiBase(API_BASE)}/uploads/products/${raw}`;
}

function normalizeProductRow(row: any, index: number): SaleProductSummary {
  const product = row?.product ?? row?.Product ?? row?.productInfo ?? {};

  const productId = String(
    row?.productId ??
      row?.product_id ??
      row?.id ??
      product?.id ??
      row?.sku ??
      `P-${index + 1}`
  );

  const sku = String(
    row?.sku ??
      row?.productSku ??
      row?.product_sku ??
      product?.sku ??
      row?.barcode ??
      productId
  );

  const productName = String(
    row?.product_name ??
      row?.productName ??
      row?.name ??
      row?.title ??
      product?.product_name ??
      product?.productName ??
      product?.name ??
      sku
  );

  const price = toNumber(
    row?.product_price ??
      row?.productPrice ??
      row?.price ??
      row?.salePrice ??
      row?.unitPrice ??
      product?.product_price ??
      product?.productPrice ??
      product?.price
  );

  const qtySold = toNumber(
    row?.quantity_sold ??
      row?.quantitySold ??
      row?.qtySold ??
      row?.soldQty ??
      row?.sold_qty
  );

  const totalAmount = toNumber(
    row?.total_amount ??
      row?.totalAmount ??
      row?.revenue ??
      row?.amount ??
      row?.totalPrice,
    price * qtySold
  );

  const stock = toNumber(
    row?.product_quantity_amount ??
      row?.productQuantityAmount ??
      row?.quantityAmount ??
      row?.quantity_amount ??
      row?.stock ??
      row?.inStock ??
      row?.stockQty ??
      row?.in_stock ??
      product?.product_quantity_amount ??
      product?.productQuantityAmount ??
      product?.quantity ??
      product?.stock
  );

  const image = buildImageUrl(
    row?.image_url ??
      row?.imageUrl ??
      row?.imagePath ??
      row?.image_path ??
      row?.product_image ??
      row?.productImage ??
      product?.image_url ??
      product?.imageUrl ??
      product?.imagePath ??
      product?.image_path ??
      product?.product_image ??
      product?.productImage
  );

  return {
    productId,
    sku,
    product_name: productName,
    product_price: price,
    quantity_sold: Math.max(0, qtySold),
    total_amount: Math.max(0, totalAmount),
    product_quantity_amount: Math.max(0, stock),
    image_url: image,
  };
}

async function fetchFirstJson(
  urls: string[],
  headers: Record<string, string>
): Promise<{ data: any; error: string | null }> {
  let lastError: string | null = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
          ...headers,
        },
        cache: "no-store",
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        lastError = text || `${url} (${res.status})`;
        continue;
      }

      return { data: await res.json().catch(() => null), error: null };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }

  return { data: null, error: lastError };
}

function mergeStockRows(
  salesRows: SaleProductSummary[],
  productRows: SaleProductSummary[]
) {
  const stockByKey = new Map<string, SaleProductSummary>();

  for (const product of productRows) {
    [product.productId, product.sku, product.product_name].forEach((key) => {
      if (key) stockByKey.set(String(key).toLowerCase(), product);
    });
  }

  return salesRows.map((sale) => {
    const stock =
      stockByKey.get(sale.productId.toLowerCase()) ??
      stockByKey.get(sale.sku.toLowerCase()) ??
      stockByKey.get(sale.product_name.toLowerCase());

    return stock
      ? {
          ...sale,
          product_quantity_amount: stock.product_quantity_amount,
          image_url: sale.image_url ?? stock.image_url,
          product_price: sale.product_price || stock.product_price,
        }
      : sale;
  });
}

function getThemeTokens(mode: ThemeMode) {
  const isDark = mode === "dark";

  return {
    isDark,

    pageBg: isDark
      ? "linear-gradient(180deg, #05060d 0%, #0b0b12 48%, #120d08 100%)"
      : "linear-gradient(180deg, #f0f4ff 0%, #eef2ff 100%)",

    pageText: isDark ? "#f3e7d2" : "#0f172a",
    softText: isDark ? "#bca98f" : "#475569",
    mutedText: isDark ? "#8a7a65" : "#64748b",

    border: isDark ? "rgba(200,137,42,0.16)" : "rgba(15,23,42,0.10)",
    borderStrong: isDark ? "rgba(212,163,82,0.34)" : "rgba(15,23,42,0.14)",

    panelBg: isDark ? "rgba(14,10,6,0.84)" : "rgba(255,255,255,0.92)",
    panelBg2: isDark ? "rgba(255,255,255,0.035)" : "rgba(248,250,252,0.96)",
    chipBg: isDark ? "rgba(255,255,255,0.045)" : "rgba(241,245,249,0.96)",

    selected: isDark
      ? "linear-gradient(90deg, rgba(212,163,82,0.18), rgba(255,255,255,0.02))"
      : "linear-gradient(90deg, rgba(59,130,246,0.10), rgba(255,255,255,0.75))",

    shadow: isDark
      ? "0 24px 80px rgba(0,0,0,0.40)"
      : "0 18px 45px rgba(15,23,42,0.08)",

    shadowSoft: isDark
      ? "0 12px 34px rgba(0,0,0,0.24)"
      : "0 10px 24px rgba(15,23,42,0.06)",

    glow1: isDark ? "rgba(180,112,32,0.18)" : "rgba(167,139,250,0.20)",
    glow2: isDark ? "rgba(212,163,82,0.12)" : "rgba(96,165,250,0.18)",
    glow3: isDark ? "rgba(245,158,11,0.08)" : "rgba(34,211,238,0.14)",
  };
}

function NightParticles() {
  const stars = Array.from({ length: 28 }).map((_, i) => ({
    id: i,
    left: `${(i * 31 + 9) % 100}%`,
    top: `${(i * 43 + 11) % 100}%`,
    size: 1.5 + (i % 3),
    delay: `${(i * 0.25) % 4}s`,
    duration: `${2.8 + (i % 4) * 0.8}s`,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-amber-100"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animation: `star-blink ${s.duration} ${s.delay} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  const safeStock = Math.max(0, Number(stock || 0));
  const inStock = safeStock > 0;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
        inStock
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-400"
          : "border-rose-400/25 bg-rose-400/10 text-rose-400"
      }`}
    >
      {inStock ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <AlertTriangle className="h-3.5 w-3.5" />
      )}
      {inStock ? `${safeStock} left` : "Stock Out"}
    </span>
  );
}

function SummaryChip({
  label,
  value,
  icon,
  accent,
  theme,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  accent: string;
  theme: ReturnType<typeof getThemeTokens>;
}) {
  return (
    <div
      className="flex min-w-[140px] items-center gap-2 rounded-2xl px-2 py-1.5"
      style={{
        background: theme.isDark
          ? "rgba(255,255,255,0.035)"
          : "rgba(255,255,255,0.72)",
      }}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
        style={{
          background: `${accent}18`,
          color: accent,
        }}
      >
        {icon}
      </span>

      <div className="min-w-0">
        <div
          className="text-[9px] font-black uppercase tracking-[0.14em]"
          style={{ color: theme.mutedText }}
        >
          {label}
        </div>

        <div
          className="truncate text-sm font-black"
          style={{ color: theme.pageText }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function MainDropCard({
  droppedRow,
  theme,
  mainTab,
  setMainTab,
}: {
  droppedRow: SaleProductSummary | null;
  theme: ReturnType<typeof getThemeTokens>;
  mainTab: MainTab;
  setMainTab: React.Dispatch<React.SetStateAction<MainTab>>;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "main-drop-card",
  });

  const chartData = droppedRow
    ? [
        { label: "Qty", value: droppedRow.quantity_sold },
        { label: "Price", value: Math.round(droppedRow.product_price / 100) },
        { label: "Revenue", value: Math.round(droppedRow.total_amount / 1000) },
        { label: "Stock", value: droppedRow.product_quantity_amount },
      ]
    : [];

  const tabs: { key: MainTab; label: string; icon: React.ReactNode }[] = [
    { key: "info", label: "Info", icon: <TrendingUp className="h-3.5 w-3.5" /> },
    { key: "image", label: "Image", icon: <ImageIcon className="h-3.5 w-3.5" /> },
    { key: "chart", label: "Chart", icon: <BarChart3 className="h-3.5 w-3.5" /> },
  ];

  return (
    <section
      ref={setNodeRef}
      className="relative overflow-hidden rounded-[24px] border px-4 py-4"
      style={{
        background: theme.panelBg,
        borderColor: isOver ? ACCENT.cyan : theme.border,
        boxShadow: isOver
          ? "0 0 0 2px rgba(212,163,82,0.24), 0 18px 50px rgba(0,0,0,0.28)"
          : theme.shadowSoft,
      }}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl"
        style={{ background: "rgba(212,163,82,0.13)" }}
      />

      <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em]"
            style={{
              borderColor: theme.borderStrong,
              background: theme.chipBg,
              color: isOver ? ACCENT.cyan : theme.mutedText,
            }}
          >
            <Move className="h-3.5 w-3.5" />
            Dnd Kit Drop Area
          </div>

          <div
            className="mt-2 text-xl font-black tracking-[-0.03em]"
            style={{ color: theme.pageText }}
          >
            Drop Product Here
          </div>

          <div className="mt-1 text-xs leading-5" style={{ color: theme.softText }}>
            Table row ဘေးက drag icon ကိုဆွဲပြီး ဒီနေရာမှာ drop လုပ်ပါ။
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tabs.map((tab) => {
            const active = mainTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setMainTab(tab.key)}
                className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition"
                style={{
                  background: active ? `${ACCENT.cyan}18` : theme.chipBg,
                  color: active ? ACCENT.cyan : theme.softText,
                  borderColor: active ? ACCENT.cyan : theme.borderStrong,
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {!droppedRow ? (
        <div
          className="relative mt-4 flex min-h-[150px] items-center justify-center rounded-[20px] border border-dashed px-4 text-center"
          style={{
            borderColor: isOver ? ACCENT.cyan : theme.borderStrong,
            background: isOver ? "rgba(212,163,82,0.10)" : theme.panelBg2,
          }}
        >
          <div>
            <div
              className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl"
              style={{
                background: isOver ? `${ACCENT.cyan}22` : theme.chipBg,
                color: isOver ? ACCENT.cyan : theme.mutedText,
              }}
            >
              <Move className="h-5 w-5" />
            </div>

            <div className="text-sm font-black" style={{ color: theme.pageText }}>
              {isOver ? "Release to drop" : "Drag product row here"}
            </div>

            <div className="mt-1 text-xs" style={{ color: theme.softText }}>
              Product ကို select လုပ်ပြီး sales detail ကြည့်နိုင်ပါတယ်။
            </div>
          </div>
        </div>
      ) : (
        <div
          className="relative mt-4 overflow-hidden rounded-[20px] border"
          style={{
            background: theme.panelBg2,
            borderColor: theme.border,
          }}
        >
          <div
            className="flex flex-col gap-3 border-b p-3 md:flex-row md:items-center md:justify-between"
            style={{ borderColor: theme.border }}
          >
            <div className="flex min-w-0 items-center gap-3">
              {droppedRow.image_url ? (
                <img
                  src={droppedRow.image_url}
                  alt={droppedRow.product_name}
                  className="h-12 w-12 shrink-0 rounded-2xl border object-cover"
                  style={{ borderColor: theme.borderStrong }}
                />
              ) : (
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xs font-black"
                  style={{
                    background: `${ACCENT.cyan}18`,
                    color: ACCENT.cyan,
                  }}
                >
                  {initials(droppedRow.product_name)}
                </div>
              )}

              <div className="min-w-0">
                <div
                  className="truncate text-base font-black"
                  style={{ color: theme.pageText }}
                >
                  {droppedRow.product_name}
                </div>

                <div className="mt-0.5 truncate text-xs" style={{ color: theme.softText }}>
                  SKU: {droppedRow.sku} · ID: {droppedRow.productId}
                </div>
              </div>
            </div>

            <StockBadge stock={droppedRow.product_quantity_amount} />
          </div>

          <div className="p-4">
            {mainTab === "info" && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-4">
                {[
                  { label: "Price", value: fmt(droppedRow.product_price) },
                  { label: "Qty Sold", value: numberFmt(droppedRow.quantity_sold) },
                  { label: "Revenue", value: fmt(droppedRow.total_amount) },
                  {
                    label: "Status",
                    value: droppedRow.total_amount >= 60000 ? "Top Sales" : "Normal",
                  },
                ].map((item) => (
                  <div key={item.label} className="min-w-0">
                    <div
                      className="text-[10px] font-black uppercase tracking-[0.14em]"
                      style={{ color: theme.mutedText }}
                    >
                      {item.label}
                    </div>

                    <div
                      className="mt-1 truncate text-sm font-black"
                      style={{ color: theme.pageText }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {mainTab === "image" && (
              <div className="grid gap-4 md:grid-cols-[180px_1fr] md:items-center">
                <div
                  className="overflow-hidden rounded-[18px] border"
                  style={{ borderColor: theme.borderStrong }}
                >
                  {droppedRow.image_url ? (
                    <img
                      src={droppedRow.image_url}
                      alt={droppedRow.product_name}
                      className="h-[150px] w-full object-cover"
                    />
                  ) : (
                    <div
                      className="grid h-[150px] place-items-center text-3xl font-black"
                      style={{ background: theme.panelBg, color: ACCENT.cyan }}
                    >
                      {initials(droppedRow.product_name)}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Product", value: droppedRow.product_name },
                    { label: "SKU", value: droppedRow.sku },
                    { label: "Revenue", value: fmt(droppedRow.total_amount) },
                    { label: "Qty Sold", value: numberFmt(droppedRow.quantity_sold) },
                  ].map((item) => (
                    <div key={item.label} className="min-w-0">
                      <div
                        className="text-[10px] font-black uppercase tracking-[0.14em]"
                        style={{ color: theme.mutedText }}
                      >
                        {item.label}
                      </div>

                      <div
                        className="mt-1 truncate text-sm font-black"
                        style={{ color: theme.pageText }}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mainTab === "chart" && (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="dropAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT.cyan} stopOpacity={0.45} />
                        <stop offset="100%" stopColor={ACCENT.cyan} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.borderStrong}
                      vertical={false}
                    />

                    <XAxis
                      dataKey="label"
                      tick={{ fill: theme.softText, fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{ fill: theme.mutedText, fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={28}
                    />

                    <Tooltip
                      contentStyle={{
                        background: theme.isDark ? "#140d05" : "#ffffff",
                        border: `1px solid ${theme.borderStrong}`,
                        borderRadius: 16,
                        color: theme.pageText,
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={ACCENT.cyan}
                      strokeWidth={3}
                      fill="url(#dropAreaGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function DraggableTableRow({
  item,
  selected,
  onSelect,
  theme,
}: {
  item: SaleProductSummary;
  selected: boolean;
  onSelect: () => void;
  theme: ReturnType<typeof getThemeTokens>;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `row:${item.productId}`,
      data: {
        type: "row",
        row: item,
      },
    });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.45 : 1,
    background: selected ? theme.selected : "transparent",
    boxShadow: selected ? `inset 3px 0 0 ${ACCENT.cyan}` : "none",
  };

  return (
    <tr
      ref={setNodeRef}
      onClick={onSelect}
      className="cursor-pointer border-b transition-all duration-200"
      style={{
        ...style,
        borderColor: theme.border,
      }}
    >
      <td className="px-3 py-4">
        <button
          {...listeners}
          {...attributes}
          onClick={(e) => e.stopPropagation()}
          className="grid h-9 w-9 place-items-center rounded-xl border transition"
          style={{
            borderColor: selected ? ACCENT.cyan : theme.borderStrong,
            background: selected ? `${ACCENT.cyan}18` : theme.chipBg,
            color: selected ? ACCENT.cyan : theme.mutedText,
          }}
          title="Drag row"
        >
          <Move className="h-4 w-4" />
        </button>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.product_name}
              className="h-12 w-12 rounded-xl border object-cover"
              style={{
                borderColor: selected ? ACCENT.cyan : theme.borderStrong,
              }}
            />
          ) : (
            <div
              className="grid h-12 w-12 place-items-center rounded-xl border text-[11px] font-bold"
              style={{
                borderColor: selected ? ACCENT.cyan : theme.borderStrong,
                background: selected ? `${ACCENT.cyan}18` : theme.panelBg2,
                color: selected ? ACCENT.cyan : theme.mutedText,
              }}
            >
              {initials(item.product_name)}
            </div>
          )}

          <div className="min-w-0">
            <div
              className="truncate text-sm font-semibold"
              style={{ color: theme.pageText }}
            >
              {item.product_name}
            </div>

            <div
              className="mt-0.5 text-[10px] uppercase tracking-[0.14em]"
              style={{ color: theme.mutedText }}
            >
              ID: {item.productId}
            </div>
          </div>
        </div>
      </td>

      <td className="px-5 py-4 text-[11px] font-mono" style={{ color: theme.mutedText }}>
        {item.sku}
      </td>

      <td className="px-5 py-4 text-right text-sm" style={{ color: theme.pageText }}>
        {fmt(item.product_price)}
      </td>

      <td className="px-5 py-4 text-right">
        <StockBadge stock={item.product_quantity_amount} />
      </td>

      <td className="px-5 py-4 text-right text-sm font-bold" style={{ color: ACCENT.emerald }}>
        {numberFmt(item.quantity_sold)}
      </td>

      <td className="px-5 py-4 text-right text-sm font-bold" style={{ color: ACCENT.amber }}>
        {fmt(item.total_amount)}
      </td>
    </tr>
  );
}

function buildPaginationPages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages] as const;

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ] as const;
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ] as const;
}

function PageIconButton({
  children,
  disabled,
  onClick,
  theme,
  label,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
  theme: ReturnType<typeof getThemeTokens>;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-xl border transition disabled:opacity-40"
      style={{
        background: theme.chipBg,
        borderColor: theme.borderStrong,
        color: theme.softText,
      }}
      aria-label={label}
    >
      {children}
    </button>
  );
}

function SalesPagination({
  theme,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onPageSizeChange,
}: {
  theme: ReturnType<typeof getThemeTokens>;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const pages = buildPaginationPages(currentPage, totalPages);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="rounded-full border px-4 py-2 text-[12px] font-bold"
          style={{
            background: theme.chipBg,
            borderColor: theme.borderStrong,
            color: theme.softText,
          }}
        >
          Showing {totalItems === 0 ? 0 : startIndex}-{endIndex} of {totalItems}
        </div>

        <div
          className="flex items-center gap-2 rounded-full border px-3 py-2"
          style={{
            background: theme.chipBg,
            borderColor: theme.borderStrong,
            color: theme.softText,
          }}
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.12em]">
            Rows
          </span>

          {PAGE_SIZE_OPTIONS.map((size) => {
            const active = pageSize === size;

            return (
              <button
                key={size}
                type="button"
                onClick={() => onPageSizeChange(size)}
                className="rounded-full border px-3 py-1 text-[11px] font-bold transition"
                style={{
                  background: active ? `${ACCENT.cyan}18` : "transparent",
                  borderColor: active ? ACCENT.cyan : "transparent",
                  color: active ? ACCENT.cyan : theme.softText,
                }}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PageIconButton
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          theme={theme}
          label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </PageIconButton>

        <PageIconButton
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          theme={theme}
          label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </PageIconButton>

        <div
          className="flex items-center gap-2 rounded-2xl border px-2 py-2"
          style={{
            background: theme.chipBg,
            borderColor: theme.borderStrong,
          }}
        >
          {pages.map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-sm font-bold"
                style={{ color: theme.mutedText }}
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className="min-w-10 rounded-xl border px-3 py-2 text-[12px] font-bold transition"
                style={{
                  background: currentPage === page ? `${ACCENT.cyan}18` : "transparent",
                  borderColor: currentPage === page ? ACCENT.cyan : "transparent",
                  color: currentPage === page ? ACCENT.cyan : theme.softText,
                }}
              >
                {page}
              </button>
            )
          )}
        </div>

        <PageIconButton
          disabled={currentPage === totalPages || totalItems === 0}
          onClick={() => onPageChange(currentPage + 1)}
          theme={theme}
          label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </PageIconButton>

        <PageIconButton
          disabled={currentPage === totalPages || totalItems === 0}
          onClick={() => onPageChange(totalPages)}
          theme={theme}
          label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </PageIconButton>
      </div>
    </div>
  );
}

export default function SalesKanbanPage() {
  const { data: session, status } = useSession();

  const [range, setRange] = useState<Range>("1h");
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState<SaleProductSummary[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [droppedRow, setDroppedRow] = useState<SaleProductSummary | null>(null);
  const [mainTab, setMainTab] = useState<MainTab>("info");
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("revenue");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const theme = useMemo(() => getThemeTokens(themeMode), [themeMode]);

  const token =
    (session as any)?.accessToken ||
    (session as any)?.access_token ||
    (session as any)?.token ||
    null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const loadSales = useCallback(
    async (r: Range) => {
      if (status === "loading") return;

      setLoading(true);

      try {
        const headers: Record<string, string> = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const ts = Date.now();

        const [salesResult, productsResult] = await Promise.all([
          fetchFirstJson(
            [
              `/backend/api/reports/sales/products?range=${r}&_ts=${ts}`,
              apiUrl(API_BASE, `/reports/sales/products?range=${r}&_ts=${ts}`),
            ],
            headers
          ),
          fetchFirstJson(
            [
              `/backend/api/products?_ts=${ts}`,
              apiUrl(API_BASE, `/products?_ts=${ts}`),
            ],
            headers
          ),
        ]);

        const salesRows = readArrayPayload(salesResult.data).map(normalizeProductRow);
        const productRows = readArrayPayload(productsResult.data).map(normalizeProductRow);

        const list = salesRows.length
          ? mergeStockRows(salesRows, productRows)
          : productRows;

        if (!list.length) {
          toast.error(productsResult.error || salesResult.error || "Product API data မရသေးပါ");
        }

        setSales(list);
        setLastUpdated(new Date());

        setSelectedRowId((prev) => {
          if (prev && list.some((item) => item.productId === prev)) return prev;
          return list[0]?.productId ?? null;
        });

        setDroppedRow((prev) => {
          if (prev && list.some((item) => item.productId === prev.productId)) {
            return list.find((item) => item.productId === prev.productId) ?? prev;
          }

          return list[0] ?? null;
        });
      } catch (error) {
        console.error(error);
        toast.error("Server error");
        setSales([]);
        setSelectedRowId(null);
        setDroppedRow(null);
      } finally {
        setLoading(false);
      }
    },
    [status, token]
  );

  useEffect(() => {
    if (status === "loading") return;
    loadSales(range);
  }, [loadSales, range, status]);

  const filteredSales = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = sales.filter((item) => {
      if (!q) return true;

      return (
        item.product_name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.productId.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "name") return a.product_name.localeCompare(b.product_name);
      if (sortBy === "qty") return b.quantity_sold - a.quantity_sold;
      if (sortBy === "stock") return b.product_quantity_amount - a.product_quantity_amount;
      return b.total_amount - a.total_amount;
    });

    return list;
  }, [sales, search, sortBy]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredSales.length / pageSize)),
    [filteredSales.length, pageSize]
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(Math.max(page, 1), totalPages));
  }, [totalPages]);

  const pageStartIndex = (currentPage - 1) * pageSize;

  const paginatedSales = useMemo(
    () => filteredSales.slice(pageStartIndex, pageStartIndex + pageSize),
    [filteredSales, pageSize, pageStartIndex]
  );

  const displayStartIndex = filteredSales.length === 0 ? 0 : pageStartIndex + 1;
  const displayEndIndex = Math.min(pageStartIndex + pageSize, filteredSales.length);

  const totalQty = useMemo(
    () => filteredSales.reduce((sum, item) => sum + item.quantity_sold, 0),
    [filteredSales]
  );

  const totalAmount = useMemo(
    () => filteredSales.reduce((sum, item) => sum + item.total_amount, 0),
    [filteredSales]
  );

  const remainingStock = useMemo(
    () =>
      filteredSales.reduce(
        (sum, item) => sum + Math.max(0, item.product_quantity_amount),
        0
      ),
    [filteredSales]
  );

  const stockOutCount = useMemo(
    () => filteredSales.filter((item) => item.product_quantity_amount <= 0).length,
    [filteredSales]
  );

  const selectedProduct =
    sales.find((item) => item.productId === selectedRowId) ??
    droppedRow ??
    sales[0] ??
    null;

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;

    if (data?.type === "row" && data.row) {
      setActiveDrag({
        type: "row",
        row: data.row as SaleProductSummary,
      });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const currentDrag = activeDrag;
    setActiveDrag(null);

    if (!event.over || !currentDrag) return;

    const overId = String(event.over.id);

    if (currentDrag.type === "row" && overId === "main-drop-card") {
      setDroppedRow(currentDrag.row);
      setSelectedRowId(currentDrag.row.productId);
      toast.success(`${currentDrag.row.product_name} dropped successfully`);
    }
  }

  const activeRow = activeDrag?.type === "row" ? activeDrag.row : null;

  return (
    <>
      <Toaster position="top-right" />

      <style>{`
        @keyframes star-blink {
          0%,100% { opacity:.2; transform: scale(.7); }
          50% { opacity:1; transform: scale(1.25); }
        }
      `}</style>

      <div
        className="relative min-h-screen px-4 py-4 md:px-6 md:py-6 xl:px-8 2xl:px-10"
        style={{
          background: theme.pageBg,
          color: theme.pageText,
        }}
      >
        {themeMode === "dark" && <NightParticles />}

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div
            className="absolute -top-40 left-[15%] h-[600px] w-[600px] rounded-full blur-[150px]"
            style={{ background: theme.glow1 }}
          />

          <div
            className="absolute -bottom-20 right-[-10%] h-[500px] w-[500px] rounded-full blur-[140px]"
            style={{ background: theme.glow2 }}
          />

          <div
            className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]"
            style={{ background: theme.glow3 }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-[1550px] space-y-5">
          <header className="space-y-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div
                  className="mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.16em]"
                  style={{
                    borderColor: theme.borderStrong,
                    background: theme.chipBg,
                    color: theme.mutedText,
                  }}
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  sales page · dnd kit
                </div>

                <h1 className="text-2xl font-black tracking-[-0.04em] md:text-4xl">
                  Sales Products
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: theme.softText }}>
                  Product page night mode style အတိုင်း warm amber / gold UI ပြောင်းထားပါတယ်။
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(["1h", "1d"] as Range[]).map((item) => {
                  const active = range === item;

                  return (
                    <button
                      key={item}
                      onClick={() => {
                        setRange(item);
                        setCurrentPage(1);
                      }}
                      className="rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition"
                      style={{
                        background: active ? `${ACCENT.cyan}18` : theme.chipBg,
                        color: active ? ACCENT.cyan : theme.softText,
                        borderColor: active ? ACCENT.cyan : theme.borderStrong,
                      }}
                    >
                      {item}
                    </button>
                  );
                })}

                <button
                  onClick={() => loadSales(range)}
                  disabled={loading}
                  className="rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition disabled:opacity-60"
                  style={{
                    background: theme.chipBg,
                    color: theme.softText,
                    borderColor: theme.borderStrong,
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                    refresh
                  </span>
                </button>

                <button
                  onClick={() =>
                    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"))
                  }
                  className="rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition"
                  style={{
                    background: theme.chipBg,
                    color: theme.softText,
                    borderColor: theme.borderStrong,
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    {themeMode === "dark" ? (
                      <Sun className="h-3.5 w-3.5" />
                    ) : (
                      <Moon className="h-3.5 w-3.5" />
                    )}
                    {themeMode === "dark" ? "light" : "dark"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SummaryChip
                label="Revenue"
                value={fmt(totalAmount)}
                icon={<TrendingUp className="h-4 w-4" />}
                accent={ACCENT.amber}
                theme={theme}
              />

              <SummaryChip
                label="Qty Sold"
                value={numberFmt(totalQty)}
                icon={<BarChart3 className="h-4 w-4" />}
                accent={ACCENT.emerald}
                theme={theme}
              />

              <SummaryChip
                label="Remaining Stock"
                value={numberFmt(remainingStock)}
                icon={<Boxes className="h-4 w-4" />}
                accent={ACCENT.cyan}
                theme={theme}
              />

              <SummaryChip
                label="Stock Out"
                value={numberFmt(stockOutCount)}
                icon={<AlertTriangle className="h-4 w-4" />}
                accent={ACCENT.rose}
                theme={theme}
              />
            </div>
          </header>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <MainDropCard
              droppedRow={droppedRow ?? selectedProduct}
              theme={theme}
              mainTab={mainTab}
              setMainTab={setMainTab}
            />

            <section className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <div
                    className="text-[11px] uppercase tracking-[0.16em]"
                    style={{ color: theme.mutedText }}
                  >
                    product table
                  </div>

                  <div className="mt-1 text-lg font-bold">Sales data list</div>

                  <div className="mt-1 text-xs" style={{ color: theme.softText }}>
                    Row ဘေးက drag icon ကိုဆွဲပြီး Drop Product Here ထဲ drop လုပ်ပါ။
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row">
                  <div
                    className="flex items-center gap-2 rounded-2xl border px-3"
                    style={{
                      background: theme.chipBg,
                      borderColor: theme.borderStrong,
                    }}
                  >
                    <Search className="h-4 w-4" style={{ color: theme.mutedText }} />

                    <input
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search product / sku / id"
                      className="h-11 w-full bg-transparent text-sm outline-none md:w-72"
                      style={{ color: theme.pageText }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {(["revenue", "qty", "stock", "name"] as SortKey[]).map((key) => {
                      const active = sortBy === key;

                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setSortBy(key);
                            setCurrentPage(1);
                          }}
                          className="rounded-2xl border px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
                          style={{
                            background: active ? `${ACCENT.cyan}18` : theme.chipBg,
                            color: active ? ACCENT.cyan : theme.softText,
                            borderColor: active ? ACCENT.cyan : theme.borderStrong,
                          }}
                        >
                          {key}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto border-t" style={{ borderColor: theme.border }}>
                {loading ? (
                  <div
                    className="flex h-56 items-center justify-center gap-3 text-sm"
                    style={{ color: theme.softText }}
                  >
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading sales data...
                  </div>
                ) : filteredSales.length === 0 ? (
                  <div className="flex h-56 flex-col items-center justify-center gap-3 text-center">
                    <div
                      className="grid h-14 w-14 place-items-center rounded-3xl"
                      style={{ background: theme.chipBg, color: theme.mutedText }}
                    >
                      <ImageIcon className="h-6 w-6" />
                    </div>

                    <div className="text-lg font-bold">No matching products</div>

                    <div className="text-sm" style={{ color: theme.softText }}>
                      Try another keyword or press refresh.
                    </div>
                  </div>
                ) : (
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: theme.border }}>
                        {["Drag", "Product", "SKU", "Price", "Stock", "Qty Sold", "Revenue"].map(
                          (head, i) => (
                            <th
                              key={head}
                              className="px-5 py-4 text-[11px] uppercase tracking-[0.16em]"
                              style={{
                                color: theme.mutedText,
                                textAlign: i >= 3 ? "right" : "left",
                              }}
                            >
                              {head}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedSales.map((item) => {
                        const selected = item.productId === selectedProduct?.productId;

                        return (
                          <DraggableTableRow
                            key={`${item.productId}-${item.sku}`}
                            item={item}
                            selected={selected}
                            onSelect={() => {
                              setSelectedRowId(item.productId);
                              setDroppedRow(item);
                            }}
                            theme={theme}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={{ color: theme.softText }}>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <SalesPagination
                    theme={theme}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={filteredSales.length}
                    startIndex={displayStartIndex}
                    endIndex={displayEndIndex}
                    onPageChange={(page) =>
                      setCurrentPage(Math.min(Math.max(page, 1), totalPages))
                    }
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                  />

                  <div className="text-sm">
                    Last updated:{" "}
                    <span className="font-bold">
                      {lastUpdated ? lastUpdated.toLocaleTimeString() : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <DragOverlay>
              {activeRow ? (
                <div
                  className="w-[320px] rounded-[28px] border p-4 opacity-95"
                  style={{
                    background: theme.panelBg,
                    borderColor: ACCENT.cyan,
                    boxShadow: theme.shadow,
                  }}
                >
                  <div className="flex items-center gap-3">
                    {activeRow.image_url ? (
                      <img
                        src={activeRow.image_url}
                        alt={activeRow.product_name}
                        className="h-14 w-14 rounded-2xl object-cover"
                      />
                    ) : (
                      <div
                        className="grid h-14 w-14 place-items-center rounded-2xl font-bold"
                        style={{
                          background: `${ACCENT.cyan}18`,
                          color: ACCENT.cyan,
                        }}
                      >
                        {initials(activeRow.product_name)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div
                        className="truncate text-sm font-bold"
                        style={{ color: theme.pageText }}
                      >
                        {activeRow.product_name}
                      </div>

                      <div className="text-xs" style={{ color: theme.softText }}>
                        {activeRow.sku}
                      </div>

                      <div
                        className="mt-1 text-xs font-semibold"
                        style={{ color: ACCENT.cyan }}
                      >
                        Dragging row...
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </>
  );
}
