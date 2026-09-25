"use client";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useZxing } from "react-zxing";
import {
  AlertCircle,
  Barcode,
  Boxes,
  Camera,
  CheckCircle2,
  ChevronRight,
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
type SearchSource = "initial" | "manual" | "camera" | "refresh";
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

type ApiProduct = {
  id?: string | number;
  sku?: string;
  name?: string;
  productName?: string;
  product_name?: string;
  productPrice?: number | string;
  product_price?: number | string;
  barcode?: string | number;
  category?: string;
  productQuantityAmount?: number | string;
  product_quantity_amount?: number | string;
  imagePath?: string;
  image_path?: string;
  imageUrl?: string;
  productImage?: string;
  product_image?: string;
  productDiscount?: number | string;
  product_discount?: number | string;
  productType?: string;
  product_type?: string;
  note?: string;
  cost?: number | string;
  isActive?: boolean;
  active?: boolean;
};

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeBarcode(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();
}

function normalizeProduct(raw: ApiProduct): Product {
  return {
    id: String(raw.id ?? ""),
    sku: raw.sku ?? "",
    product_name:
      raw.productName ?? raw.product_name ?? raw.name ?? "Unnamed product",
    product_price: toNumber(raw.productPrice ?? raw.product_price),
    barcode: String(raw.barcode ?? ""),
    category: raw.category ?? "",
    product_quantity_amount: toNumber(
      raw.productQuantityAmount ?? raw.product_quantity_amount,
    ),
    product_image:
      raw.imagePath ??
      raw.image_path ??
      raw.imageUrl ??
      raw.productImage ??
      raw.product_image ??
      "",
    product_discount: toNumber(raw.productDiscount ?? raw.product_discount),
    note: raw.note ?? "",
    product_type: raw.productType ?? raw.product_type ?? "",
    cost: raw.cost == null ? undefined : toNumber(raw.cost),
    isActive: raw.isActive ?? raw.active ?? true,
  };
}

function extractProducts(payload: unknown): Product[] {
  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeProduct(item as ApiProduct));
  }

  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  const possibleLists = [
    record.content,
    record.products,
    record.data,
    record.items,
  ];
  const matchedList = possibleLists.find(Array.isArray);

  if (Array.isArray(matchedList)) {
    return matchedList.map((item) => normalizeProduct(item as ApiProduct));
  }

  if (record.id != null) {
    return [normalizeProduct(record as ApiProduct)];
  }

  return [];
}
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
        statChip: "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)]",
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
        modalBg: "bg-white/95 backdrop-blur-xl border-slate-200/80 shadow-2xl",
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
      .product-check-page {
        min-height: 100vh;
        min-height: 100dvh;
      }
      .scanner-screen {
        height: 100vh;
        height: 100dvh;
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
      }
      @supports (-webkit-touch-callout: none) {
        .barcode-input {
          font-size: 16px !important;
        }
      }
      @media (min-width: 768px) and (max-width: 1194px) {
        .product-check-main {
          max-width: 1120px;
          padding: 20px 24px 32px;
        }
        .product-search-panel {
          padding: 24px;
        }
        .product-result-content {
          padding: 26px;
        }
        .product-result-info {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .touch-button {
          min-height: 52px;
        }
        .ipad-scan-frame {
          width: min(78vw, 720px);
          height: 180px;
        }
      }
      @media (min-width: 1024px) and (max-width: 1194px) and (orientation: landscape) {
        .product-result-grid {
          display: grid;
          grid-template-columns: minmax(300px, .82fr) minmax(0, 1.28fr);
        }
        .product-result-image {
          min-height: 440px;
        }
        .product-search-heading {
          font-size: 26px;
          line-height: 1.2;
        }
        .ipad-scan-frame {
          width: min(68vw, 760px);
          height: 190px;
        }
      }
      @media (min-width: 768px) and (max-width: 1023px) and (orientation: portrait) {
        .product-result-grid {
          display: block;
        }
        .product-result-image {
          min-height: 300px;
          max-height: 340px;
        }
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
function getImageCandidates(product: Product, apiBase: string) {
  const rawPath = product.product_image?.trim();
  if (!rawPath) return [];

  const normalizedPath = rawPath.replace(/\\/g, "/");
  if (/^(https?:|data:|blob:)/i.test(normalizedPath)) {
    return [normalizedPath];
  }

  // Database ထဲတွင် C:/.../uploads/file.jpg လို server local path
  // သိမ်းထားပါက browser သုံးနိုင်သော /uploads/file.jpg အဖြစ်ပြောင်းမည်။
  const uploadsPosition = normalizedPath.toLowerCase().lastIndexOf("/uploads/");
  if (uploadsPosition >= 0) {
    return [`${apiBase}${normalizedPath.slice(uploadsPosition)}`];
  }

  const relativePath = normalizedPath.replace(/^\/+/, "");
  const directUrl = `${apiBase}/${relativePath}`;

  if (relativePath.toLowerCase().startsWith("uploads/")) {
    return [directUrl];
  }

  // Backend က filename ပဲပြန်ပေးသည့် project များအတွက် /uploads fallback ပါ။
  return [directUrl, `${apiBase}/uploads/${relativePath}`];
}

function getImageUrl(product: Product, apiBase: string) {
  return getImageCandidates(product, apiBase)[0] ?? null;
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
  const candidates = React.useMemo(
    () => getImageCandidates(product, apiBase),
    [product, apiBase],
  );
  const [candidateIndex, setCandidateIndex] = React.useState(0);

  React.useEffect(() => {
    setCandidateIndex(0);
  }, [product.product_image]);

  const currentImageUrl = candidates[candidateIndex];

  if (!currentImageUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-blue-500 to-violet-500 text-white",
          className,
        )}
      >
        <Package2 className="h-5 w-5" />
      </div>
    );
  }
  return (
    <img
      src={currentImageUrl}
      alt={product.product_name}
      className={cn("h-full w-full object-cover", className)}
      onError={() => setCandidateIndex((current) => current + 1)}
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
    (p) => p.product_quantity_amount > 0 && p.product_quantity_amount < 5,
  ).length;
  const outStock = products.filter(
    (p) => p.product_quantity_amount <= 0,
  ).length;
  const totalValue = products.reduce(
    (sum, p) => sum + (p.product_price || 0) * (p.product_quantity_amount || 0),
    0,
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
              theme === "dark" ? "bg-white/[0.035]" : "bg-white/70",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                theme === "dark" ? "bg-white/[0.06]" : "bg-slate-100",
              )}
            >
              <Icon className={cn("h-4 w-4", item.color)} />
            </span>
            <div className="min-w-0">
              <div
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  t.textSubtle,
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
        selected && (theme === "dark" ? "bg-white/[0.05]" : "bg-white"),
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
          <ProductImage
            product={product}
            apiBase={apiBase}
            className="h-10 w-10"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className={cn("truncate text-[13px] font-black", t.text)}>
              {product.product_name}
            </div>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                badge.cls,
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
          <div
            className={cn(
              "mt-0.5 flex flex-wrap items-center gap-2 text-[11px]",
              t.textMuted,
            )}
          >
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
        className={cn(
          "w-full max-w-[740px] overflow-hidden rounded-3xl border",
          t.modalBg,
        )}
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
                t.textSubtle,
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
          <button
            onClick={onClose}
            className={cn("rounded-xl border p-2", t.btn)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[72vh] overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-[240px_1fr]">
            <div className="relative h-[210px] overflow-hidden rounded-2xl">
              {imageUrl ? (
                <ProductImage
                  product={product}
                  apiBase={apiBase}
                  className="absolute inset-0"
                />
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
                    badge.cls,
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
                <div
                  key={item.label}
                  className={cn("rounded-xl border p-3", t.statChip)}
                >
                  <div
                    className={cn(
                      "mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider",
                      t.textSubtle,
                    )}
                  >
                    <item.icon className="h-3 w-3" />
                    {item.label}
                  </div>
                  <div
                    className={cn("break-words text-[13px] font-black", t.text)}
                  >
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
                  t.textSubtle,
                )}
              >
                Note
              </div>
              <div
                className={cn(
                  "whitespace-pre-wrap text-[12px] leading-6",
                  t.textMuted,
                )}
              >
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
            className={cn(
              "rounded-xl border px-4 py-2 text-[13px] font-bold",
              t.btn,
            )}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
function ProductBarcodeScannerDialog({
  theme,
  onScan,
  onClose,
}: {
  theme: Theme;
  onScan: (barcode: string) => void;
  onClose: () => void;
}) {
  const t = tk(theme);
  const scanLockedRef = React.useRef(false);
  const [paused, setPaused] = React.useState(false);
  const [cameraError, setCameraError] = React.useState("");
  const { ref } = useZxing({
    paused,
    formats: ["retail_codes", "code_128", "qr_code"],
    constraints: {
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    },
    trySkew: true,
    timeBetweenDecodingAttempts: 300,
    onDecodeResult(result) {
      const barcode = result.rawValue?.trim();
      if (!barcode || scanLockedRef.current) return;
      scanLockedRef.current = true;
      setPaused(true);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(120);
      }
      onScan(barcode);
    },
    onError(error) {
      console.error("Barcode camera error:", error);
      setCameraError(
        (current) =>
          current ||
          "Camera ဖွင့်မရပါ။ Browser Settings မှ Camera permission ကို Allow လုပ်ပေးပါ။",
      );
    },
  });
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="scanner-screen fixed inset-0 z-[70] flex flex-col bg-black"
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-black">
            <Camera className="h-4 w-4 text-emerald-400" />
            Product Barcode Scanner
          </div>
          <p className="mt-0.5 truncate text-xs text-white/60">
            Barcode ကို camera ဘောင်အတွင်း အလျားလိုက်ထားပါ
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white hover:bg-white/20"
        >
          <X className="mr-1.5 inline h-4 w-4" />
          Close
        </button>
      </header>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <video
          ref={ref}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-black/15" />
        <div className="ipad-scan-frame pointer-events-none absolute left-1/2 top-1/2 h-36 w-[86%] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border-[3px] border-emerald-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.42)]">
          <div className="absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
        </div>
        <div className="absolute inset-x-4 bottom-5 flex justify-center">
          <div className="rounded-full border border-white/15 bg-black/60 px-4 py-2 text-center text-xs font-bold text-white backdrop-blur-xl">
            EAN-13 · EAN-8 · UPC · Code 128 · QR
          </div>
        </div>
      </div>
      {cameraError ? (
        <div className="border-t border-red-400/20 bg-red-600 px-4 py-3 text-center text-sm font-bold text-white">
          <AlertCircle className="mr-2 inline h-4 w-4" />
          {cameraError}
        </div>
      ) : (
        <div
          className={cn(
            "border-t px-4 py-3 text-center text-xs font-bold",
            t.line,
            "bg-black text-white/70",
          )}
        >
          Scan ပြီးသည်နှင့် product stock ကို အလိုအလျောက်ရှာပေးပါမည်။
        </div>
      )}
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
  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const [requestError, setRequestError] = React.useState("");
  const apiBase = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080"
  ).replace(/\/+$/, "");
  const t = tk(theme);
  React.useEffect(() => {
    const next: Theme = resolvedTheme === "light" ? "light" : "dark";
    setTheme(next);
  }, [resolvedTheme]);
  function getAuthToken() {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("pos_shop_owner_token") ||
      localStorage.getItem("pos_access_token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("jwt")
    );
  }

  async function handleSearch(
    e?: React.FormEvent,
    overrideQuery?: string,
    source: SearchSource = "manual",
  ) {
    if (e) e.preventDefault();
    const searchValue = (overrideQuery ?? q).trim();

    if ((source === "manual" || source === "camera") && !searchValue) {
      toast.info("Barcode No, SKU သို့မဟုတ် Product Name ထည့်ပါ။");
      return;
    }

    setLoading(true);
    setSelected(null);
    setRequestError("");
    try {
      const token = getAuthToken();

      if (!token) {
        const message =
          "Login token မတွေ့ပါ။ Sign in ပြန်ဝင်ပြီး Product Check ကိုဖွင့်ပါ။";
        setProducts([]);
        setRequestError(message);
        toast.error(message);
        return;
      }

      const url =
        searchValue.length > 0
          ? `${apiBase}/api/products?q=${encodeURIComponent(searchValue)}`
          : `${apiBase}/api/products`;
      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg =
          res.status === 401
            ? "Login session သက်တမ်းကုန်သွားပါပြီ။ Sign in ပြန်ဝင်ပါ။"
            : res.status === 403
              ? "ဒီ account မှာ products ကြည့်ခွင့်မရှိပါ။"
              : data?.message ||
                `Products API ချိတ်ဆက်၍မရပါ (status ${res.status})`;
        toast.error(msg);
        setRequestError(msg);
        setProducts([]);
        return;
      }
      const data: unknown = await res.json();
      let list = extractProducts(data);
      const normalizedSearchBarcode = normalizeBarcode(searchValue);
      let exactBarcodeProduct = list.find(
        (product) =>
          normalizeBarcode(product.barcode) === normalizedSearchBarcode,
      );

      // Backend q-search မှာ barcode column မပါလျှင် current shop products
      // အားလုံးကိုယူပြီး exact barcode ကို fallback အဖြစ် ထပ်ရှာမည်။
      const looksLikeRetailBarcode = /^\d{6,}$/.test(normalizedSearchBarcode);
      const needsBarcodeFallback =
        Boolean(searchValue) &&
        !exactBarcodeProduct &&
        (list.length === 0 || source === "camera" || looksLikeRetailBarcode);

      if (needsBarcodeFallback) {
        const allProductsResponse = await fetch(`${apiBase}/api/products`, {
          cache: "no-store",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (allProductsResponse.ok) {
          const allProductsPayload: unknown = await allProductsResponse.json();
          const allProducts = extractProducts(allProductsPayload);

          exactBarcodeProduct = allProducts.find(
            (product) =>
              normalizeBarcode(product.barcode) === normalizedSearchBarcode,
          );

          if (exactBarcodeProduct) {
            list = [exactBarcodeProduct];
          } else if (list.length === 0) {
            const normalizedText = searchValue.toLowerCase();
            list = allProducts.filter(
              (product) =>
                product.sku.toLowerCase().includes(normalizedText) ||
                product.product_name.toLowerCase().includes(normalizedText),
            );
          }
        }
      }

      setProducts(list);

      const productToOpen =
        source === "manual" || source === "camera"
          ? (exactBarcodeProduct ?? (list.length === 1 ? list[0] : null))
          : null;

      if (list.length === 0) {
        toast.info(
          searchValue
            ? "ရှာဖွေထားသော Product မတွေ့ပါ"
            : "ဒီ shop အတွက် Product မရှိသေးပါ",
        );
      } else if (productToOpen) {
        setSelected(productToOpen);
        toast.success(
          source === "camera"
            ? `Barcode ${searchValue} ကို scan လုပ်ပြီး Product တွေ့ပါပြီ။`
            : "Product data တွေ့ပါပြီ။",
        );
      } else if (source === "camera") {
        toast.info("Scan လုပ်ထားသော exact barcode product ကို မတွေ့ပါ။");
      }
    } catch (err) {
      console.error(err);
      const message = `${apiBase} ရှိ Products API ကို ချိတ်ဆက်၍မရပါ။`;
      toast.error(message);
      setRequestError(message);
      setProducts([]);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }

  // MANUAL FLOW: input ထဲ barcode/SKU/name ရေးပြီး Search နှိပ်မှ API ခေါ်မည်။
  async function handleManualSearch(event: React.FormEvent) {
    event.preventDefault();
    await handleSearch(undefined, q, "manual");
  }

  // CAMERA FLOW: scan အောင်မြင်တာနဲ့ Search button မလိုဘဲ API ခေါ်ပြီး detail ဖွင့်မည်။
  async function handleBarcodeScan(barcode: string) {
    setScannerOpen(false);
    setQ(barcode);
    await handleSearch(undefined, barcode, "camera");
  }

  const resultProduct = selected ?? (products.length === 1 ? products[0] : null);
  const resultStock = resultProduct
    ? stockBadge(resultProduct.product_quantity_amount)
    : null;

  return (
    <>
      <FontImport />
      <div
        className={cn(
          "product-check-page relative min-h-screen transition-colors duration-500",
          t.root,
        )}
      >
        {theme === "dark" && <NightParticles />}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div
            className={cn(
              "absolute -top-40 left-[15%] h-[600px] w-[600px] rounded-full blur-[150px]",
              t.glow1,
            )}
          />
          <div
            className={cn(
              "absolute -bottom-20 right-[-10%] h-[500px] w-[500px] rounded-full blur-[140px]",
              t.glow2,
            )}
          />
          <div
            className={cn(
              "absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]",
              t.glow3,
            )}
          />
        </div>
        <AnimatePresence>
          {scannerOpen ? (
            <ProductBarcodeScannerDialog
              theme={theme}
              onScan={(barcode) => void handleBarcodeScan(barcode)}
              onClose={() => setScannerOpen(false)}
            />
          ) : null}
        </AnimatePresence>
        <main className="product-check-main relative z-10 mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <header className="mb-6 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", t.active)}>
                <PackageSearch className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h1 className={cn("truncate text-xl font-black", t.text)}>Check Product</h1>
                <p className={cn("truncate text-xs", t.textMuted)}>Barcode ဖြင့် stock စစ်ဆေးရန်</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNextTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className={cn("rounded-xl border p-2.5", t.btn)}
              aria-label="Change theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </header>

          <section className={cn("product-search-panel mb-6 rounded-[28px] border p-5 backdrop-blur-2xl sm:p-7", t.modalBg)}>
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black", t.pill)}>
                  <Barcode className="h-3.5 w-3.5" />
                  EXACT BARCODE LOOKUP
                </span>
                <h2 className={cn("product-search-heading mt-4 text-2xl font-black tracking-tight sm:text-3xl", t.text)}>
                  Product barcode ကို scan သို့မဟုတ် ရိုက်ထည့်ပါ
                </h2>
                <p className={cn("mt-2 max-w-2xl text-sm leading-6", t.textMuted)}>
                  Camera scan လုပ်လျှင် အလိုအလျောက်ရှာပေးပြီး၊ barcode number ရိုက်ထည့်လျှင် Search ကိုနှိပ်ပါ။
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                disabled={loading}
                className={cn("touch-button h-12 rounded-2xl border px-5 text-sm font-black", t.btn)}
              >
                <Camera className="mr-2 inline h-4 w-4" />
                Open Camera
              </button>
            </div>

            <form onSubmit={(event) => void handleManualSearch(event)} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Barcode className={cn("absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2", t.textSubtle)} />
                <Input
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Enter barcode number..."
                  className={cn("barcode-input h-14 rounded-2xl pl-12 font-mono text-base font-bold", t.input)}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !q.trim()}
                className={cn("touch-button h-14 rounded-2xl px-7 text-sm font-black disabled:cursor-not-allowed disabled:opacity-50", t.btnPrimary)}
              >
                {loading ? <RotateCcw className="mr-2 inline h-5 w-5 animate-spin" /> : <Search className="mr-2 inline h-5 w-5" />}
                {loading ? "Searching..." : "Search Product"}
              </button>
            </form>
          </section>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.section
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn("rounded-[28px] border p-8 text-center", t.modalBg)}
              >
                <Package2 className={cn("mx-auto h-12 w-12 animate-pulse", t.textMuted)} />
                <h3 className={cn("mt-4 text-lg font-black", t.text)}>Product ရှာနေပါသည်...</h3>
                <p className={cn("mt-2 font-mono text-xs", t.textMuted)}>{q}</p>
              </motion.section>
            ) : requestError ? (
              <motion.section key="error" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className={cn("rounded-[28px] border p-8 text-center", t.modalBg)}>
                <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
                <h3 className={cn("mt-4 text-xl font-black", t.text)}>Products API Error</h3>
                <p className={cn("mx-auto mt-2 max-w-xl text-sm", t.textMuted)}>{requestError}</p>
                <button type="button" onClick={() => void handleSearch(undefined, q, "manual")} className={cn("mt-5 rounded-xl border px-4 py-2 text-sm font-bold", t.btn)}>
                  <RotateCcw className="mr-2 inline h-4 w-4" />Try Again
                </button>
              </motion.section>
            ) : resultProduct && resultStock ? (
              <motion.section
                key={resultProduct.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("overflow-hidden rounded-[30px] border", t.modalBg)}
              >
                <div className="product-result-grid grid lg:grid-cols-[minmax(280px,0.85fr)_1.35fr]">
                  <div className="product-result-image relative min-h-[300px] overflow-hidden lg:min-h-[470px]">
                    <ProductImage product={resultProduct} apiBase={apiBase} className="absolute inset-0 h-full w-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <span className={cn("absolute left-5 top-5 rounded-full border px-3 py-1.5 text-xs font-black backdrop-blur-xl", resultStock.cls)}>
                      {resultStock.label}
                    </span>
                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Category</p>
                      <p className="mt-1 truncate text-sm font-bold">{resultProduct.category || "Uncategorized"}</p>
                    </div>
                  </div>
                  <div className="product-result-content p-5 sm:p-8">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-black text-emerald-500">
                      <CheckCircle2 className="h-3.5 w-3.5" />PRODUCT FOUND
                    </span>
                    <h2 className={cn("mt-4 text-2xl font-black tracking-tight sm:text-3xl", t.text)}>{resultProduct.product_name}</h2>
                    <p className={cn("mt-2 font-mono text-xs font-bold", t.textSubtle)}>{resultProduct.sku || "NO-SKU"}</p>

                    <div className="mt-7 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
                        <p className="text-[11px] font-black uppercase tracking-wider text-blue-500">Selling Price</p>
                        <p className={cn("mt-3 text-3xl font-black", t.text)}>{formattedPrice(resultProduct.product_price)}</p>
                      </div>
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                        <p className="text-[11px] font-black uppercase tracking-wider text-emerald-500">Available Stock</p>
                        <p className={cn("mt-3 text-4xl font-black", t.text)}>{numberFormat(resultProduct.product_quantity_amount)}</p>
                      </div>
                    </div>

                    <div className="product-result-info mt-3 grid gap-3 sm:grid-cols-2">
                      {[
                        ["Barcode", resultProduct.barcode || "—", Barcode],
                        ["SKU", resultProduct.sku || "—", Package2],
                        ["Category", resultProduct.category || "—", Tag],
                        ["Type", resultProduct.product_type || "—", Layers],
                      ].map(([label, value, Icon]) => (
                        <div key={String(label)} className={cn("rounded-2xl border p-4", t.statChip)}>
                          <p className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-widest", t.textSubtle)}>
                            {React.createElement(Icon as React.ElementType, { className: "h-3.5 w-3.5" })}{label as string}
                          </p>
                          <p className={cn("mt-2 break-all text-sm font-black", t.text)}>{value as string}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button type="button" onClick={() => { setProducts([]); setSelected(null); setQ(""); setHasLoaded(false); }} className={cn("touch-button h-12 flex-1 rounded-2xl px-5 text-sm font-black", t.btnPrimary)}>
                        <RotateCcw className="mr-2 inline h-4 w-4" />New Search
                      </button>
                      <button type="button" onClick={() => { setProducts([]); setSelected(null); setQ(""); setScannerOpen(true); }} className={cn("touch-button h-12 rounded-2xl border px-5 text-sm font-black", t.btn)}>
                        <Camera className="mr-2 inline h-4 w-4" />Scan Another
                      </button>
                    </div>
                  </div>
                </div>
              </motion.section>
            ) : hasLoaded && q.trim() ? (
              <motion.section key="empty" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className={cn("rounded-[28px] border p-10 text-center", t.modalBg)}>
                <PackageSearch className={cn("mx-auto h-12 w-12", t.textMuted)} />
                <h3 className={cn("mt-4 text-xl font-black", t.text)}>Product မတွေ့ပါ</h3>
                <p className={cn("mt-2 text-sm", t.textMuted)}>Barcode <span className="font-mono font-black">{q}</span> နှင့် ကိုက်ညီသော product မရှိပါ။</p>
              </motion.section>
            ) : (
              <motion.section key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn("rounded-[28px] border border-dashed p-12 text-center", t.statChip)}>
                <Barcode className={cn("mx-auto h-12 w-12", t.textMuted)} />
                <h3 className={cn("mt-4 text-xl font-black", t.text)}>Product စစ်ဆေးရန် အသင့်ပါ</h3>
                <p className={cn("mx-auto mt-2 max-w-lg text-sm leading-6", t.textMuted)}>Product list မပြထားပါ။ Barcode ကို ရိုက်ထည့်ရှာပါ သို့မဟုတ် camera ဖြင့် scan လုပ်ပါ။</p>
              </motion.section>
            )}
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
