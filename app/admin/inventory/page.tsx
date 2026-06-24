"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  Boxes,
  Sun,
  Moon,
  Sparkles,
  Download,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Zap,
  ArrowUpRight,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Loader2,
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

type Theme = "dark" | "light";

type ApiProduct = {
  id?: number | string;
  sku?: string | null;
  barcode?: string | null;
  productName?: string | null;
  product_name?: string | null;
  name?: string | null;
  productPrice?: number | string | null;
  product_price?: number | string | null;
  price?: number | string | null;
  productQuantityAmount?: number | string | null;
  product_quantity_amount?: number | string | null;
  quantity?: number | string | null;
  stock?: number | string | null;
  category?: string | null;
  productType?: string | null;
  product_type?: string | null;
  productDiscount?: number | string | null;
  product_discount?: number | string | null;
  imagePath?: string | null;
  image_path?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  sold?: number | string | null;
  rating?: number | string | null;
};

type Product = {
  id: string;
  dbId: string;
  sku: string;
  barcode: string;
  name: string;
  stock: number;
  price: number;
  category: string;
  sold: number;
  rating: number;
};

const STOCK_FILTERS = ["All", "In Stock", "Low Stock", "Out of Stock"];

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function getOwnerToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("pos_shop_owner_token") ||
    localStorage.getItem("pos_access_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    ""
  );
}

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeProduct(p: ApiProduct): Product {
  const rawId = String(p.id ?? p.sku ?? p.barcode ?? crypto.randomUUID());

  const name = String(
    p.productName ?? p.product_name ?? p.name ?? "Unnamed Product",
  );

  const stock = toNumber(
    p.productQuantityAmount ??
    p.product_quantity_amount ??
    p.quantity ??
    p.stock,
    0,
  );

  const price = toNumber(p.productPrice ?? p.product_price ?? p.price, 0);

  return {
    id: p.sku ? String(p.sku) : `P-${rawId}`,
    dbId: rawId,
    sku: String(p.sku ?? ""),
    barcode: String(p.barcode ?? ""),
    name,
    stock,
    price,
    category: String(
      p.category ?? p.productType ?? p.product_type ?? "General",
    ),
    sold: toNumber(p.sold, 0),
    rating: toNumber(p.rating, 0),
  };
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getOwnerToken();

  if (!token) {
    throw new Error("Login token မရှိပါ။ အရင်ဆုံး login ပြန်ဝင်ပါ။");
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text || `Request failed: ${res.status}`;

    try {
      const json = JSON.parse(text);
      message = json.message || json.error || message;
    } catch {
      // ignore parse error
    }

    throw new Error(message);
  }

  if (res.status === 204) {
    return null as T;
  }

  return res.json();
}

function stockLevel(s: number): "out" | "low" | "ok" {
  if (s === 0) return "out";
  if (s < 10) return "low";
  return "ok";
}

const tk = (theme: Theme) =>
  theme === "dark"
    ? {
      root: "bg-[#060a14] text-white",
      text: "text-white",
      textMuted: "text-white/50",
      textSubtle: "text-white/32",
      card: "border-white/[0.07] bg-white/[0.048] backdrop-blur-xl",
      input:
        "border-white/[0.10] bg-white/[0.06] text-white placeholder:text-white/30 focus-visible:border-blue-500/60",
      btn: "border-white/[0.10] bg-white/[0.055] text-white/80 hover:bg-white/[0.10] hover:text-white",
      btnPrimary:
        "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10",
      divider: "bg-white/[0.06]",
      pill: "border-white/[0.08] bg-white/[0.05] text-white/60",
      tableHead: "text-white/38",
      tableRow: "border-white/[0.045] hover:bg-white/[0.04]",
      tableBorder: "border-white/[0.055]",
      grid:
        "[background-image:linear-gradient(rgba(255,255,255,0.026)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.026)_1px,transparent_1px)] [background-size:44px_44px]",
      glow1: "bg-emerald-600/[0.07]",
      glow2: "bg-blue-600/[0.06]",
      track: "bg-white/[0.06]",
      dropMenu: "bg-[#0c1018] border-white/[0.09]",
      dropItem:
        "text-white/70 hover:text-white focus:text-white hover:bg-white/[0.07] focus:bg-white/[0.07]",
      segActive: "bg-white/[0.14] text-white",
      segInactive: "text-white/42 hover:text-white/70",
      catActive: "border-white/[0.15] bg-white/[0.12] text-white",
      catInactive:
        "border-white/[0.07] bg-white/[0.035] text-white/50 hover:bg-white/[0.07] hover:text-white/80",
    }
    : {
      root: "bg-[#edf1f9] text-slate-900",
      text: "text-slate-900",
      textMuted: "text-slate-500",
      textSubtle: "text-slate-400",
      card:
        "border-slate-200/80 bg-white/95 shadow-[0_2px_20px_rgba(15,23,42,0.06)] backdrop-blur-xl",
      input:
        "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-blue-500",
      btn: "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 shadow-sm",
      btnPrimary:
        "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/20",
      divider: "bg-slate-200",
      pill: "border-slate-200 bg-white text-slate-500 shadow-sm",
      tableHead: "text-slate-400",
      tableRow: "border-slate-100 hover:bg-slate-50/70",
      tableBorder: "border-slate-200",
      grid:
        "[background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:44px_44px]",
      glow1: "bg-emerald-300/18",
      glow2: "bg-sky-300/18",
      track: "bg-slate-100",
      dropMenu: "bg-white border-slate-200",
      dropItem: "text-slate-600 hover:text-slate-900 focus:text-slate-900",
      segActive: "bg-white text-slate-900 shadow-sm",
      segInactive: "text-slate-500 hover:text-slate-700",
      catActive: "border-slate-900 bg-slate-900 text-white shadow-sm",
      catInactive:
        "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 shadow-sm",
    };

function StockPill({ stock }: { stock: number }) {
  const level = stockLevel(stock);

  const cfg = {
    out: {
      label: "Out of Stock",
      dot: "bg-rose-500",
      bg: "bg-rose-500/10",
      text: "text-rose-500",
    },
    low: {
      label: "Low Stock",
      dot: "bg-amber-500",
      bg: "bg-amber-500/10",
      text: "text-amber-500",
    },
    ok: {
      label: "In Stock",
      dot: "bg-emerald-500",
      bg: "bg-emerald-500/10",
      text: "text-emerald-500",
    },
  }[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
        cfg.bg,
        cfg.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function KpiCard({
  theme,
  label,
  value,
  sub,
  icon: Icon,
  accentClass,
  valueColor = "",
  delay = 0,
}: {
  theme: Theme;
  label: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
  valueColor?: string;
  delay?: number;
}) {
  const t = tk(theme);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.015 }}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[20px] border p-5 transition-all duration-200",
          t.card,
        )}
      >
        <div
          className={cn(
            "absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl opacity-45",
            accentClass,
          )}
        />

        <div className="relative">
          <div className="mb-4 flex items-start justify-between">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border",
                theme === "dark"
                  ? "border-white/[0.07] bg-white/[0.07]"
                  : "border-slate-200 bg-slate-50",
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", t.textMuted)} />
            </div>

            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </div>

          <div
            className={cn(
              "mb-1.5 text-[11px] font-bold uppercase tracking-widest",
              t.textSubtle,
            )}
          >
            {label}
          </div>

          <div
            className={cn(
              "text-[30px] font-black leading-none tracking-tight",
              valueColor || t.text,
            )}
          >
            {value}
          </div>

          <div className={cn("mt-2 text-[11px] font-medium", t.textSubtle)}>
            {sub}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StockBar({
  stock,
  max = 200,
  theme,
}: {
  stock: number;
  max?: number;
  theme: Theme;
}) {
  const t = tk(theme);
  const pct = Math.min((stock / max) * 100, 100);
  const level = stockLevel(stock);

  const color =
    level === "out"
      ? "bg-rose-500"
      : level === "low"
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div className="flex items-center gap-2.5">
      <div className={cn("h-[5px] w-20 overflow-hidden rounded-full", t.track)}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", color)}
        />
      </div>

      <span className={cn("text-[12px] font-bold", t.text)}>{stock}</span>
    </div>
  );
}

function PaginationButton({
  children,
  disabled,
  active,
  theme,
  className,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
  theme: Theme;
  className?: string;
  onClick: () => void;
}) {
  const t = tk(theme);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-8 min-w-[34px] items-center justify-center rounded-xl border px-3 text-[12px] font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? theme === "dark"
            ? "border-white/[0.14] bg-white/[0.14] text-white"
            : "border-transparent bg-slate-900 text-white"
          : t.btn,
        className,
      )}
    >
      {children}
    </button>
  );
}

export default function InventoryPage() {
  const router = useRouter();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState("All");
  const [stockFilter, setStockFilter] = React.useState("All");
  const [theme, setTheme] = React.useState<Theme>("dark");
  const [sortField, setSortField] = React.useState<string>("id");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [loading, setLoading] = React.useState(true);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");

  const t = tk(theme);

  const fetchProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const query = q.trim();
      const path = query
        ? `/api/products?q=${encodeURIComponent(query)}`
        : "/api/products";

      const res = await apiFetch<ApiProduct[]>(path);
      const list = Array.isArray(res) ? res.map(normalizeProduct) : [];

      setProducts(list);
    } catch (e) {
      setProducts([]);
      setError(e instanceof Error ? e.message : "Products API ခေါ်မရပါ။");
    } finally {
      setLoading(false);
    }
  }, [q]);

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      void fetchProducts();
    }, 250);

    return () => window.clearTimeout(id);
  }, [fetchProducts]);

  const categories = React.useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          products
            .map((p) => p.category)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b)),
        ),
      ),
    ];
  }, [products]);

  const filtered = React.useMemo(() => {
    return products
      .filter((p) => {
        const query = q.toLowerCase();

        const matchQ =
          !q ||
          p.name.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.barcode.toLowerCase().includes(query);

        const matchCat = cat === "All" || p.category === cat;

        const matchStock =
          stockFilter === "All"
            ? true
            : stockFilter === "In Stock"
              ? p.stock >= 10
              : stockFilter === "Low Stock"
                ? p.stock > 0 && p.stock < 10
                : p.stock === 0;

        return matchQ && matchCat && matchStock;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;

        if (sortField === "price") return (a.price - b.price) * dir;
        if (sortField === "stock") return (a.stock - b.stock) * dir;
        if (sortField === "sold") return (a.sold - b.sold) * dir;
        if (sortField === "name") return a.name.localeCompare(b.name) * dir;

        return a.id.localeCompare(b.id) * dir;
      });
  }, [products, q, cat, stockFilter, sortField, sortDir]);

  React.useEffect(() => {
    setPage(1);
  }, [q, cat, stockFilter, sortField, sortDir, pageSize]);

  const totalPages = React.useMemo(() => {
    return Math.max(1, Math.ceil(filtered.length / pageSize));
  }, [filtered.length, pageSize]);

  const safePage = Math.min(page, totalPages);

  const pageStart = React.useMemo(() => {
    return (safePage - 1) * pageSize;
  }, [safePage, pageSize]);

  const pageEnd = React.useMemo(() => {
    return Math.min(pageStart + pageSize, filtered.length);
  }, [pageStart, pageSize, filtered.length]);

  const pagedProducts = React.useMemo(() => {
    return filtered.slice(pageStart, pageEnd);
  }, [filtered, pageStart, pageEnd]);

  const pageNumbers = React.useMemo(() => {
    const maxButtons = 5;

    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (safePage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (safePage >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [safePage - 2, safePage - 1, safePage, safePage + 1, safePage + 2];
  }, [safePage, totalPages]);

  const totalStock = React.useMemo(
    () => products.reduce((sum, p) => sum + p.stock, 0),
    [products],
  );

  const outCount = React.useMemo(
    () => products.filter((p) => p.stock === 0).length,
    [products],
  );

  const lowCount = React.useMemo(
    () => products.filter((p) => p.stock > 0 && p.stock < 10).length,
    [products],
  );

  function toggleSort(field: string) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDir("asc");
  }

  function SortIcon({ field }: { field: string }) {
    if (sortField !== field) {
      return <ArrowUpRight className={cn("h-3 w-3 opacity-30", t.tableHead)} />;
    }

    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-blue-400" />
    ) : (
      <ChevronDown className="h-3 w-3 text-blue-400" />
    );
  }

  async function deleteProduct(product: Product) {
    const ok = window.confirm(`Delete "${product.name}"?`);
    if (!ok) return;

    try {
      setDeletingId(product.dbId);
      setError("");

      await apiFetch<void>(`/api/products/${product.dbId}`, {
        method: "DELETE",
      });

      setProducts((current) =>
        current.filter((item) => item.dbId !== product.dbId),
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Product delete လုပ်ရာမှာ အမှားရှိပါတယ်။",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function exportCsv() {
    const header = ["ID", "SKU", "Barcode", "Name", "Category", "Stock", "Price"];

    const rows = filtered.map((p) => [
      p.dbId,
      p.sku,
      p.barcode,
      p.name,
      p.category,
      String(p.stock),
      String(p.price),
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) =>
            /[",\n]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell,
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "inventory-products.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <div
      className={cn(
        "relative min-h-screen transition-colors duration-300",
        t.root,
      )}
    >
      <div className={cn("pointer-events-none fixed inset-0", t.grid)} />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className={cn(
            "absolute -top-32 right-[10%] h-[480px] w-[480px] rounded-full blur-[130px]",
            t.glow1,
          )}
        />

        <div
          className={cn(
            "absolute bottom-0 left-[-5%] h-[400px] w-[400px] rounded-full blur-[120px]",
            t.glow2,
          )}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1520px] space-y-7 px-5 py-7 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26 }}
          className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>


            <div className="pb-2">
              <div
                className={cn(
                  "mb-2.5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold",
                  t.pill,
                )}
              >
                <Sparkles className="h-3 w-3" />
                Inventory Management
              </div>

              <button
                onClick={() => router.push("/dashboard")}
                className={cn(
                  "mb-2.5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold",
                  t.pill,
                )}
              >
                <Store className="h-4 w-4" />
                Dashboard
              </button>

            </div>



            <h1
              className={cn(
                "text-[34px] font-black leading-[0.95] tracking-tight md:text-[42px]",
                t.text,
              )}
            >
              Inventory
              <span className={cn("ml-3 text-[20px] font-bold", t.textMuted)}>
                / Products
              </span>
            </h1>

            <p className={cn("mt-2 text-sm", t.textMuted)}>
              API data ဖြင့် product stock, price, catalog ကို စီမံပါ။
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search
                className={cn(
                  "absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2",
                  t.textSubtle,
                )}
              />

              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search product, SKU, barcode…"
                className={cn(
                  "h-9 w-[260px] rounded-xl pl-9 text-[13px]",
                  t.input,
                )}
              />
            </div>

            <button
              type="button"
              onClick={exportCsv}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-xl border px-3.5 text-[13px] font-semibold",
                t.btn,
              )}
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>

            <button
              type="button"
              onClick={() => void fetchProducts()}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-xl border px-3.5 text-[13px] font-semibold",
                t.btn,
              )}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Refresh
            </button>

            <button
              type="button"
              onClick={() =>
                setTheme((th) => (th === "dark" ? "light" : "dark"))
              }
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl border transition-all",
                t.btn,
              )}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard/product/add")}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-xl px-4 text-[13px] font-bold",
                t.btnPrimary,
              )}
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </motion.div>

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-500">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <KpiCard
            theme={theme}
            label="Total Products"
            value={loading ? "…" : String(products.length)}
            sub="Active catalog"
            icon={Package}
            accentClass="bg-blue-500/18"
            delay={0}
          />

          <KpiCard
            theme={theme}
            label="Total Stock"
            value={loading ? "…" : totalStock.toLocaleString()}
            sub="Units available"
            icon={Boxes}
            accentClass="bg-emerald-500/18"
            delay={0.07}
          />

          <KpiCard
            theme={theme}
            label="Low Stock"
            value={loading ? "…" : String(lowCount)}
            sub="Need restock soon"
            icon={AlertTriangle}
            accentClass="bg-amber-500/18"
            delay={0.14}
            valueColor="text-amber-500"
          />

          <KpiCard
            theme={theme}
            label="Out of Stock"
            value={loading ? "…" : String(outCount)}
            sub="Requires urgent action"
            icon={Boxes}
            accentClass="bg-rose-500/18"
            delay={0.21}
            valueColor="text-rose-500"
          />
        </div>

        {(outCount > 0 || lowCount > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="grid gap-3 sm:grid-cols-2"
          >
            {outCount > 0 && (
              <button
                type="button"
                onClick={() => setStockFilter("Out of Stock")}
                className="flex items-center gap-3 rounded-[18px] border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3.5 text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15">
                  <Boxes className="h-4 w-4 text-rose-500" />
                </div>

                <div>
                  <div className="text-[13px] font-bold text-rose-500">
                    {outCount} product{outCount > 1 ? "s" : ""} out of stock
                  </div>

                  <div className={cn("text-[11px]", t.textSubtle)}>
                    Restock required immediately
                  </div>
                </div>

                <span className="ml-auto shrink-0 text-[11px] font-bold text-rose-500">
                  View →
                </span>
              </button>
            )}

            {lowCount > 0 && (
              <button
                type="button"
                onClick={() => setStockFilter("Low Stock")}
                className="flex items-center gap-3 rounded-[18px] border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3.5 text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>

                <div>
                  <div className="text-[13px] font-bold text-amber-500">
                    {lowCount} product{lowCount > 1 ? "s" : ""} low on stock
                  </div>

                  <div className={cn("text-[11px]", t.textSubtle)}>
                    Consider reordering soon
                  </div>
                </div>

                <span className="ml-auto shrink-0 text-[11px] font-bold text-amber-500">
                  View →
                </span>
              </button>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
        >
          <div className={cn("overflow-hidden rounded-[22px] border", t.card)}>
            <div className={cn("space-y-4 border-b px-6 py-5", t.tableBorder)}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className={cn("text-[17px] font-bold", t.text)}>
                    Product List
                  </div>

                  <div className={cn("mt-0.5 text-[12px]", t.textMuted)}>
                    {loading
                      ? "Loading products…"
                      : `${filtered.length} product${filtered.length !== 1 ? "s" : ""
                      } found`}
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-center overflow-hidden rounded-xl border",
                    t.segActive,
                    theme === "dark"
                      ? "border-white/[0.07] bg-white/[0.045]"
                      : "border-slate-200 bg-slate-100",
                  )}
                >
                  {STOCK_FILTERS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setStockFilter(f)}
                      className={cn(
                        "whitespace-nowrap px-3 py-2 text-[11px] font-bold transition-all",
                        stockFilter === f ? t.segActive : t.segInactive,
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCat(c)}
                    className={cn(
                      "rounded-xl border px-3.5 py-1.5 text-[12px] font-bold transition-all",
                      cat === c ? t.catActive : t.catInactive,
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead>
                  <tr className={cn("border-b", t.tableBorder)}>
                    {[
                      {
                        label: "Product",
                        field: "name",
                        sortable: true,
                        align: "left",
                      },
                      {
                        label: "Category",
                        field: "",
                        sortable: false,
                        align: "left",
                      },
                      {
                        label: "Stock",
                        field: "stock",
                        sortable: true,
                        align: "left",
                      },
                      {
                        label: "Price",
                        field: "price",
                        sortable: true,
                        align: "right",
                      },
                      {
                        label: "Sold",
                        field: "sold",
                        sortable: true,
                        align: "center",
                      },
                      {
                        label: "Status",
                        field: "",
                        sortable: false,
                        align: "left",
                      },
                      {
                        label: "",
                        field: "",
                        sortable: false,
                        align: "center",
                      },
                    ].map((h, i) => (
                      <th
                        key={i}
                        onClick={() => h.sortable && toggleSort(h.field)}
                        className={cn(
                          "px-4 py-3.5 text-[10px] font-black uppercase tracking-widest",
                          h.align === "right"
                            ? "text-right"
                            : h.align === "center"
                              ? "text-center"
                              : "text-left",
                          h.sortable ? "cursor-pointer select-none" : "",
                          t.tableHead,
                        )}
                      >
                        {h.label && (
                          <span className="inline-flex items-center gap-1">
                            {h.label}
                            {h.sortable && <SortIcon field={h.field} />}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>

                <AnimatePresence mode="popLayout">
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={7}
                          className={cn("py-16 text-center", t.textMuted)}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin opacity-60" />
                            <div className="text-sm font-semibold">
                              Loading products from API…
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : filtered.length > 0 ? (
                      pagedProducts.map((p, i) => (
                        <motion.tr
                          key={p.dbId}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.025 }}
                          className={cn(
                            "group cursor-default border-b transition-colors",
                            t.tableRow,
                          )}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-black",
                                  theme === "dark"
                                    ? "bg-white/[0.07] text-white/50"
                                    : "bg-slate-100 text-slate-500",
                                )}
                              >
                                {String(pageStart + i + 1).padStart(2, "0")}
                              </div>

                              <div>
                                <div
                                  className={cn(
                                    "text-[13px] font-semibold",
                                    t.text,
                                  )}
                                >
                                  {p.name}
                                </div>

                                <div
                                  className={cn(
                                    "text-[11px] font-mono",
                                    t.textSubtle,
                                  )}
                                >
                                  {p.sku || p.barcode || p.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={cn(
                                "rounded-lg border px-2.5 py-1 text-[11px] font-semibold",
                                t.pill,
                              )}
                            >
                              {p.category}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <StockBar stock={p.stock} theme={theme} />
                          </td>

                          <td className="px-4 py-4 text-right">
                            <span
                              className={cn("text-[13px] font-bold", t.text)}
                            >
                              ¥{p.price.toLocaleString()}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-center">
                            <span
                              className={cn(
                                "text-[13px] font-bold",
                                t.textMuted,
                              )}
                            >
                              {p.sold}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <StockPill stock={p.stock} />
                          </td>

                          <td className="px-4 py-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-xl border opacity-0 transition-all group-hover:opacity-100",
                                    t.btn,
                                  )}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent
                                align="end"
                                className={cn(
                                  "min-w-[170px] rounded-2xl border p-1.5",
                                  t.dropMenu,
                                )}
                              >
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/dashboard/product/${p.dbId}`)
                                  }
                                  className={cn(
                                    "cursor-pointer gap-2.5 rounded-xl py-2.5 text-[13px]",
                                    t.dropItem,
                                  )}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  View Detail
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/product/${p.dbId}/edit`,
                                    )
                                  }
                                  className={cn(
                                    "cursor-pointer gap-2.5 rounded-xl py-2.5 text-[13px]",
                                    t.dropItem,
                                  )}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit Product
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/product/${p.dbId}/edit`,
                                    )
                                  }
                                  className={cn(
                                    "cursor-pointer gap-2.5 rounded-xl py-2.5 text-[13px]",
                                    t.dropItem,
                                  )}
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                  Restock
                                </DropdownMenuItem>

                                <DropdownMenuSeparator
                                  className={cn("my-1", t.divider)}
                                />

                                <DropdownMenuItem
                                  disabled={deletingId === p.dbId}
                                  onClick={() => void deleteProduct(p)}
                                  className="cursor-pointer gap-2.5 rounded-xl py-2.5 text-[13px] text-rose-500 hover:bg-rose-500/10 hover:text-rose-500 focus:bg-rose-500/10 focus:text-rose-500"
                                >
                                  {deletingId === p.dbId ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  )}
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className={cn("py-16 text-center", t.textMuted)}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <Package className="h-10 w-10 opacity-25" />
                            <div className="text-sm font-semibold">
                              No products found
                            </div>
                            <div className={cn("text-[12px]", t.textSubtle)}>
                              Try adjusting your search or filters
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </AnimatePresence>
              </table>
            </div>

            <div
              className={cn(
                "flex flex-col gap-3 border-t px-6 py-4 md:flex-row md:items-center md:justify-between",
                t.tableBorder,
              )}
            >
              <div className={cn("text-[12px] font-medium", t.textSubtle)}>
                {filtered.length === 0 ? (
                  <>Showing 0 of {products.length} products</>
                ) : (
                  <>
                    Showing{" "}
                    <span className={cn("font-bold", t.textMuted)}>
                      {pageStart + 1}
                    </span>
                    –
                    <span className={cn("font-bold", t.textMuted)}>
                      {pageEnd}
                    </span>{" "}
                    of{" "}
                    <span className={cn("font-bold", t.textMuted)}>
                      {filtered.length}
                    </span>{" "}
                    filtered products
                    <span className="ml-1 opacity-70">
                      / {products.length} total
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={String(pageSize)}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className={cn(
                    "h-8 rounded-xl border px-2 text-[12px] font-bold outline-none",
                    theme === "dark"
                      ? "border-white/[0.10] bg-[#0c1018] text-white/80"
                      : "border-slate-300 bg-white text-slate-600",
                  )}
                >
                  {[5, 10, 15, 20, 30, 50].map((n) => (
                    <option key={n} value={n}>
                      {n} / page
                    </option>
                  ))}
                </select>

                <PaginationButton
                  theme={theme}
                  disabled={safePage <= 1 || loading}
                  onClick={() => setPage(1)}
                >
                  First
                </PaginationButton>

                <PaginationButton
                  theme={theme}
                  disabled={safePage <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </PaginationButton>

                <div className="flex items-center gap-1">
                  {pageNumbers.map((pageNumber) => (
                    <PaginationButton
                      key={pageNumber}
                      theme={theme}
                      active={pageNumber === safePage}
                      disabled={loading}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </PaginationButton>
                  ))}
                </div>

                <PaginationButton
                  theme={theme}
                  disabled={safePage >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </PaginationButton>

                <PaginationButton
                  theme={theme}
                  disabled={safePage >= totalPages || loading}
                  onClick={() => setPage(totalPages)}
                >
                  Last
                </PaginationButton>

                <div className={cn("text-[12px] font-bold", t.textSubtle)}>
                  {safePage} / {totalPages}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div
          className={cn(
            "flex items-center justify-between pb-3 text-[11px] font-semibold",
            t.textSubtle,
          )}
        >
          <span>© 2026 BINHLAIG · Inventory Module</span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-3 w-3" />
            API · Updated from backend
          </span>
        </div>
      </div>
    </div>
  );
}