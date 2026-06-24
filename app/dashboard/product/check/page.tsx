"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  AlertCircle,
  Barcode,
  Boxes,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  ImageIcon,
  Layers,
  Moon,
  Package2,
  PackageSearch,
  RotateCcw,
  Search,
  Sun,
  Tag,
  Wallet,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Theme = "dark" | "light";

type Product = {
  id: string;
  sku: string;
  product_name: string;
  product_price: number;
  barcode?: string;
  category?: string;
  product_quantity_amount: number;
  product_image?: string;
  product_discount: number;
  note?: string;
  product_type?: string;
  cost?: number;
  isActive: boolean;
};

const tk = (theme: Theme) =>
  theme === "dark"
    ? {
        root: "bg-[#05060d]",
        text: "text-[#f3e7d2]",
        textMuted: "text-[#bca98f]",
        textSubtle: "text-[#8a7a65]",
        input:
          "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#f3e7d2] placeholder:text-[#8a7a65] focus-visible:border-[#c8892a] focus-visible:ring-[#c8892a]/20",
        btn: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#d4b68a] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f3e7d2]",
        btnPrimary:
          "bg-gradient-to-r from-[#a07020] to-[#d4a352] text-[#140d05] hover:from-[#b37a22] hover:to-[#deb25a] shadow-lg shadow-[#c8892a]/20",
        pill: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#bca98f]",
        active:
          "border-[rgba(212,163,82,0.55)] bg-[linear-gradient(135deg,#a07020,#d4a352)] text-[#140d05]",
        statChip:
          "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)]",
        modalBg:
          "bg-[rgba(10,8,3,0.94)] backdrop-blur-3xl border-[rgba(212,163,82,0.16)]",
        glow1: "bg-amber-700/[0.16]",
        glow2: "bg-orange-700/[0.10]",
        glow3: "bg-yellow-700/[0.08]",
        line: "border-white/[0.07]",
        rowHover: "hover:bg-white/[0.035]",
      }
    : {
        root: "bg-[#f0f4ff]",
        text: "text-slate-900",
        textMuted: "text-slate-500",
        textSubtle: "text-slate-400",
        input:
          "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-blue-500 focus-visible:ring-blue-500/20",
        btn: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
        btnPrimary:
          "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/25",
        pill: "border-slate-200 bg-white text-slate-500 shadow-sm",
        active: "border-slate-900 bg-slate-900 text-white",
        statChip: "bg-white/70 border-slate-200",
        modalBg:
          "bg-white/95 backdrop-blur-xl border-slate-200/80 shadow-2xl",
        glow1: "bg-violet-300/20",
        glow2: "bg-blue-300/20",
        glow3: "bg-cyan-300/15",
        line: "border-slate-200",
        rowHover: "hover:bg-white/70",
      };

function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;700;900&display=swap');

      * { font-family: 'DM Sans', sans-serif; }

      @keyframes star-blink {
        0%,100% { opacity:.2; transform: scale(.7); }
        50% { opacity:1; transform: scale(1.25); }
      }
    `}</style>
  );
}

function NightParticles() {
  const stars = Array.from({ length: 24 }).map((_, i) => ({
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

function numberFormat(n: number) {
  return new Intl.NumberFormat().format(n || 0);
}

function formattedPrice(p?: number) {
  if (p == null) return "-";

  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(p);
}

function stockBadge(stock: number) {
  if (stock <= 0) {
    return {
      label: "OUT",
      cls: "bg-rose-500/12 text-rose-400 border-rose-500/20",
    };
  }

  if (stock < 5) {
    return {
      label: "LOW",
      cls: "bg-amber-500/12 text-amber-400 border-amber-500/20",
    };
  }

  return {
    label: "IN",
    cls: "bg-emerald-500/12 text-emerald-400 border-emerald-500/20",
  };
}

function getImageUrl(product: Product, apiBase: string) {
  if (!product.product_image) return null;

  if (product.product_image.startsWith("http")) {
    return product.product_image;
  }

  if (product.product_image.startsWith("/")) {
    return `${apiBase}${product.product_image}`;
  }

  return `${apiBase}/${product.product_image}`;
}

function ProductImage({
  product,
  apiBase,
  className,
}: {
  product: Product;
  apiBase: string;
  className?: string;
}) {
  const imageUrl = getImageUrl(product, apiBase);

  if (!imageUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-blue-500 to-violet-500 text-white",
          className
        )}
      >
        <Package2 className="h-5 w-5" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={product.product_name}
      className={cn("h-full w-full object-cover", className)}
      draggable={false}
    />
  );
}

function SummaryBar({
  theme,
  products,
}: {
  theme: Theme;
  products: Product[];
}) {
  const t = tk(theme);

  const inStock = products.filter((p) => p.product_quantity_amount > 0).length;
  const lowStock = products.filter(
    (p) => p.product_quantity_amount > 0 && p.product_quantity_amount < 5
  ).length;
  const outStock = products.filter((p) => p.product_quantity_amount <= 0).length;
  const totalValue = products.reduce(
    (sum, p) => sum + (p.product_price || 0) * (p.product_quantity_amount || 0),
    0
  );

  const items = [
    {
      label: "Results",
      value: numberFormat(products.length),
      icon: PackageSearch,
      color: "text-blue-400",
    },
    {
      label: "In Stock",
      value: numberFormat(inStock),
      icon: CheckCircle2,
      color: "text-emerald-400",
    },
    {
      label: "Low",
      value: numberFormat(lowStock),
      icon: AlertCircle,
      color: "text-amber-400",
    },
    {
      label: "Out",
      value: numberFormat(outStock),
      icon: AlertCircle,
      color: "text-rose-400",
    },
    {
      label: "Value",
      value: formattedPrice(totalValue),
      icon: Wallet,
      color: "text-violet-400",
    },
  ];

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className={cn(
              "flex min-w-[112px] items-center gap-2 rounded-xl px-2 py-1.5",
              theme === "dark" ? "bg-white/[0.035]" : "bg-white/70"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                theme === "dark" ? "bg-white/[0.06]" : "bg-slate-100"
              )}
            >
              <Icon className={cn("h-4 w-4", item.color)} />
            </span>

            <div className="min-w-0">
              <div
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  t.textSubtle
                )}
              >
                {item.label}
              </div>

              <div className={cn("truncate text-[14px] font-black", t.text)}>
                {item.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProductRow({
  product,
  theme,
  apiBase,
  selected,
  onSelect,
}: {
  product: Product;
  theme: Theme;
  apiBase: string;
  selected?: boolean;
  onSelect: (p: Product) => void;
}) {
  const t = tk(theme);
  const badge = stockBadge(product.product_quantity_amount);

  return (
    <motion.button
      type="button"
      whileHover={{ x: 2 }}
      onClick={() => onSelect(product)}
      className={cn(
        "w-full border-b px-2 py-3 text-left transition-all duration-200",
        t.line,
        t.rowHover,
        selected && (theme === "dark" ? "bg-white/[0.05]" : "bg-white")
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
          <ProductImage product={product} apiBase={apiBase} className="h-10 w-10" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className={cn("truncate text-[13px] font-black", t.text)}>
              {product.product_name}
            </div>

            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                badge.cls
              )}
            >
              {badge.label}
            </span>

            {!product.isActive ? (
              <span className="rounded-full border border-slate-500/20 bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold text-slate-400">
                INACTIVE
              </span>
            ) : null}
          </div>

          <div className={cn("mt-0.5 flex flex-wrap items-center gap-2 text-[11px]", t.textMuted)}>
            <span className="font-mono">{product.sku || "NO-SKU"}</span>
            <span>·</span>
            <span>{product.category || "UNCATEGORIZED"}</span>
            {product.barcode ? (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1 font-mono">
                  <Barcode className="h-3 w-3" />
                  {product.barcode}
                </span>
              </>
            ) : null}
          </div>
        </div>

        <div className="hidden min-w-[100px] text-right sm:block">
          <div className={cn("text-[12px] font-black", t.text)}>
            {formattedPrice(product.product_price)}
          </div>
          <div className={cn("text-[10px]", t.textSubtle)}>
            Stock {product.product_quantity_amount ?? 0}
          </div>
        </div>

        <ChevronRight className={cn("h-4 w-4", t.textSubtle)} />
      </div>
    </motion.button>
  );
}

function ProductDetailDialog({
  product,
  theme,
  apiBase,
  onClose,
}: {
  product: Product | null;
  theme: Theme;
  apiBase: string;
  onClose: () => void;
}) {
  const t = tk(theme);

  if (!product) return null;

  const badge = stockBadge(product.product_quantity_amount);
  const imageUrl = getImageUrl(product, apiBase);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.62)",
        backdropFilter: "blur(12px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.94, y: 18 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 18 }}
        transition={{ duration: 0.18 }}
        className={cn("w-full max-w-[740px] overflow-hidden rounded-3xl border", t.modalBg)}
      >
        <div
          className="flex items-start justify-between gap-4 border-b px-5 py-4"
          style={{
            borderColor:
              theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
          }}
        >
          <div>
            <div
              className={cn(
                "text-[11px] font-black uppercase tracking-widest",
                t.textSubtle
              )}
            >
              Product Check Detail
            </div>

            <h2 className={cn("mt-1 text-xl font-black", t.text)}>
              {product.product_name}
            </h2>

            <div className={cn("mt-1 font-mono text-[11px]", t.textMuted)}>
              {product.sku || "NO-SKU"}
            </div>
          </div>

          <button onClick={onClose} className={cn("rounded-xl border p-2", t.btn)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[72vh] overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-[240px_1fr]">
            <div className="relative h-[210px] overflow-hidden rounded-2xl">
              {imageUrl ? (
                <ProductImage product={product} apiBase={apiBase} className="absolute inset-0" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-violet-600 text-white">
                  <ImageIcon className="mb-2 h-8 w-8" />
                  <span className="text-xs font-bold">No Image</span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

              <div className="absolute left-3 top-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
                    badge.cls
                  )}
                >
                  {product.product_quantity_amount > 0 ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  {badge.label}
                </span>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {[
                {
                  label: "Price",
                  value: formattedPrice(product.product_price),
                  icon: Wallet,
                },
                {
                  label: "Stock",
                  value:
                    product.product_quantity_amount <= 0
                      ? "Out of stock"
                      : String(product.product_quantity_amount),
                  icon: Boxes,
                },
                {
                  label: "Category",
                  value: product.category || "—",
                  icon: Tag,
                },
                {
                  label: "Type",
                  value: product.product_type || "—",
                  icon: Layers,
                },
                {
                  label: "Barcode",
                  value: product.barcode || "—",
                  icon: Barcode,
                },
                {
                  label: "Discount",
                  value: product.product_discount
                    ? formattedPrice(product.product_discount)
                    : "—",
                  icon: Wallet,
                },
                {
                  label: "Cost",
                  value:
                    product.cost != null ? formattedPrice(product.cost) : "—",
                  icon: Wallet,
                },
                {
                  label: "Active",
                  value: product.isActive ? "Active" : "Inactive",
                  icon: CheckCircle2,
                },
              ].map((item) => (
                <div key={item.label} className={cn("rounded-xl border p-3", t.statChip)}>
                  <div
                    className={cn(
                      "mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider",
                      t.textSubtle
                    )}
                  >
                    <item.icon className="h-3 w-3" />
                    {item.label}
                  </div>

                  <div className={cn("break-words text-[13px] font-black", t.text)}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {product.note ? (
            <div className={cn("mt-4 rounded-xl border p-3", t.statChip)}>
              <div
                className={cn(
                  "mb-2 text-[11px] font-bold uppercase tracking-wider",
                  t.textSubtle
                )}
              >
                Note
              </div>

              <div className={cn("whitespace-pre-wrap text-[12px] leading-6", t.textMuted)}>
                {product.note}
              </div>
            </div>
          ) : null}

          {product.product_image ? (
            <div className={cn("mt-4 text-[10px]", t.textSubtle)}>
              Image Path:{" "}
              <span className="font-mono">{product.product_image}</span>
            </div>
          ) : null}
        </div>

        <div
          className="flex flex-wrap justify-end gap-2 border-t px-5 py-4"
          style={{
            borderColor:
              theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
          }}
        >
          <button
            onClick={onClose}
            className={cn("rounded-xl border px-4 py-2 text-[13px] font-bold", t.btn)}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProductCheckPage() {
  const { resolvedTheme, setTheme: setNextTheme } = useTheme();

  const [theme, setTheme] = React.useState<Theme>("dark");
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selected, setSelected] = React.useState<Product | null>(null);

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

  const t = tk(theme);

  React.useEffect(() => {
    const next: Theme = resolvedTheme === "light" ? "light" : "dark";
    setTheme(next);
  }, [resolvedTheme]);

  async function handleSearch(e?: React.FormEvent, overrideQuery?: string) {
    if (e) e.preventDefault();

    const searchValue = overrideQuery ?? q;

    setLoading(true);
    setSelected(null);

    try {
      const url =
        searchValue.trim().length > 0
          ? `${apiBase}/api/products?q=${encodeURIComponent(searchValue.trim())}`
          : `${apiBase}/api/products`;

      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.message || `Search failed (status ${res.status})`;

        toast.error(msg);
        setProducts([]);
        return;
      }

      const data = (await res.json()) as Product[] | Product;
      const list = Array.isArray(data) ? data : [data];

      setProducts(list);

      if (list.length === 0) {
        toast.info("Product မတွေ့ပါ");
      } else if (list.length === 1) {
        setSelected(list[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  function setTest(value: string) {
    setQ(value);
    void handleSearch(undefined, value);
  }

  return (
    <>
      <FontImport />

      <div className={cn("relative min-h-screen transition-colors duration-500", t.root)}>
        {theme === "dark" && <NightParticles />}

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div
            className={cn(
              "absolute -top-40 left-[15%] h-[600px] w-[600px] rounded-full blur-[150px]",
              t.glow1
            )}
          />

          <div
            className={cn(
              "absolute -bottom-20 right-[-10%] h-[500px] w-[500px] rounded-full blur-[140px]",
              t.glow2
            )}
          />

          <div
            className={cn(
              "absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]",
              t.glow3
            )}
          />
        </div>

        <AnimatePresence>
          {selected ? (
            <ProductDetailDialog
              product={selected}
              theme={theme}
              apiBase={apiBase}
              onClose={() => setSelected(null)}
            />
          ) : null}
        </AnimatePresence>

        <main className="relative z-10 mx-auto max-w-[1500px] px-4 py-5 md:px-6 lg:px-8">
          <section className="mb-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black",
                    t.active
                  )}
                >
                  <PackageSearch className="h-3.5 w-3.5" />
                  Product Check
                </span>

                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold",
                    t.pill
                  )}
                >
                  <Search className="h-3.5 w-3.5" />
                  SKU / Barcode / Name
                </span>

                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold",
                    t.pill
                  )}
                >
                  <FlaskConical className="h-3.5 w-3.5" />
                  Test Tools Ready
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setNextTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                  className={cn("rounded-xl border px-3 py-2 text-[12px] font-bold", t.btn)}
                >
                  {theme === "dark" ? (
                    <Sun className="mr-2 inline h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 inline h-4 w-4" />
                  )}
                  {theme === "dark" ? "Day" : "Night"}
                </button>

                <button
                  type="button"
                  onClick={() => handleSearch()}
                  className={cn("rounded-xl border px-3 py-2 text-[12px] font-bold", t.btn)}
                  disabled={loading}
                >
                  <RotateCcw className={cn("mr-2 inline h-4 w-4", loading && "animate-spin")} />
                  Refresh
                </button>
              </div>
            </div>

            <SummaryBar theme={theme} products={products} />
          </section>

          <section className="mb-3">
            <form
              onSubmit={(e) => handleSearch(e)}
              className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center"
            >
              <div className="relative">
                <Search className={cn("absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2", t.textSubtle)} />

                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search SKU, Barcode, Product Name..."
                  className={cn("h-10 rounded-xl pl-10 text-[12px]", t.input)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn("rounded-xl px-4 py-2.5 text-[12px] font-black", t.btnPrimary)}
              >
                <Search className="mr-2 inline h-4 w-4" />
                {loading ? "Searching..." : "Search"}
              </button>
            </form>

            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { label: "Test SKU", value: "SKU-1001" },
                { label: "Test Barcode", value: "8852121212333" },
                { label: "Test Name", value: "Coca Cola" },
                { label: "Auto Test Cola", value: "Cola" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setTest(item.value)}
                  className={cn("rounded-full border px-3 py-1.5 text-[11px] font-bold", t.btn)}
                >
                  <FlaskConical className="mr-1.5 inline h-3.5 w-3.5" />
                  {item.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            {loading ? (
              <div className="p-10 text-center">
                <Package2 className={cn("mx-auto mb-4 h-12 w-12 animate-pulse", t.textMuted)} />
                <div className={cn("font-black", t.text)}>Searching products...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="p-10 text-center">
                <PackageSearch className={cn("mx-auto mb-4 h-12 w-12", t.textMuted)} />

                <div className={cn("text-xl font-black", t.text)}>
                  Product result မရှိသေးပါ
                </div>

                <div className={cn("mx-auto mt-2 max-w-xl text-sm", t.textMuted)}>
                  SKU / Barcode / Product Name ထည့်ပြီး search နှိပ်ပါ။
                </div>
              </div>
            ) : (
              <div className={cn("overflow-hidden border-t", t.line)}>
                {products.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    theme={theme}
                    apiBase={apiBase}
                    selected={selected?.id === product.id}
                    onSelect={(p) => setSelected(p)}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}