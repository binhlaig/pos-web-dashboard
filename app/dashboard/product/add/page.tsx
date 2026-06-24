"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import JsBarcode from "jsbarcode";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ArrowLeft,
  Bot,
  ScanLine,
  Tag,
  Upload,
  Image as ImageIcon,
  Crop,
  RefreshCw,
  Loader2,
  Wand2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Package2,
  Boxes,
  CircleDollarSign,
  Sparkles,
  UserCircle2,
  Store,
  FileSpreadsheet,
  ClipboardList,
  Copy,
  Trash2,
  UploadCloud,
  Plus,
  HomeIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getLimitErrorMessage } from "@/lib/api-limit-error";
import { toast } from "sonner";

type Theme = "dark" | "light";

type ProductBusinessModule =
  | "SUPERMARKET"
  | "RESTAURANT"
  | "FASHION"
  | "FRUIT";

type ProductForm = {
  sku: string;
  product_name: string;
  product_price: string;
  barcode: string;
  category: string;
  product_quantity_amount: string;
  product_discount: string;
  note: string;

  /**
   * Module-specific optional fields.
   * Existing backend can ignore unsupported fields safely.
   */
  product_type: ProductBusinessModule | "";
  brand: string;
  color: string;
  size: string;
  gender: string;
  season: string;
  sale_type: "WEIGHT" | "PIECE" | "PACK" | "";
  unit: "kg" | "g" | "viss" | "piece" | "pack" | "";
  cost_price: string;
  expiry_date: string;
  supplier_name: string;
  kitchen_item: boolean;
};

type CategoryOption = {
  label: string;
  value: string;
};

type ProductCreatorInfo = {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  shopId: string;
  shopCode: string;
  imageUrl: string;
};

type AISuggestion = {
  sku: string;
  category: string;
  suggested_price: string;
  note: string;
  barcode: string;
  reasoning: string;
  confidence: "high" | "medium" | "low";
  tags: string[];
};

type AddMode = "single" | "bulk";

type BulkRow = ProductForm & {
  rowId: string;
  /**
   * Paste/old data အတွက် image URL/path ကို ဆက်သုံးနိုင်အောင်ထားထားပါတယ်။
   * File upload ရွေးထားရင် image_file ကို backend ဆီ FormData နဲ့ပို့ပါမယ်။
   */
  image_path: string;
  image_file: File | null;
  image_preview: string;
  status: "idle" | "saving" | "success" | "error";
  error?: string | null;
  suggestion?: AISuggestion | null;
};

const INITIAL_FORM: ProductForm = {
  sku: "",
  product_name: "",
  product_price: "",
  barcode: "",
  category: "",
  product_quantity_amount: "0",
  product_discount: "0",
  note: "",
  product_type: "",
  brand: "",
  color: "",
  size: "",
  gender: "",
  season: "",
  sale_type: "",
  unit: "",
  cost_price: "",
  expiry_date: "",
  supplier_name: "",
  kitchen_item: false,
};

function makeBulkRow(initial?: Partial<BulkRow>): BulkRow {
  return {
    ...INITIAL_FORM,
    rowId:
      globalThis.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    image_path: "",
    image_file: null,
    image_preview: "",
    status: "idle",
    error: null,
    suggestion: null,
    ...initial,
  };
}

function bulkRowsFromPaste(text: string): BulkRow[] {
  return text
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.includes("\t")
        ? line.split("\t").map((part) => part.trim())
        : line.split(",").map((part) => part.trim());

      const pastedModule = String(parts[6] || "").trim().toUpperCase();

      return makeBulkRow({
        sku: parts[0] || "",
        product_name: parts[1] || "",
        product_price: parts[2] || "0",
        product_quantity_amount: parts[3] || "0",
        barcode: parts[4] || "",
        category: parts[5] || "OTHER",
        product_type: pastedModule
          ? normalizeProductModule(pastedModule)
          : "",
        product_discount: parts[7] || "0",
        image_path: parts[8] || "",
        note: parts[9] || "",
        brand: parts[10] || "",
        color: parts[11] || "",
        size: parts[12] || "",
        gender: parts[13] || "",
        season: parts[14] || "",
        sale_type: ["WEIGHT", "PIECE", "PACK"].includes(String(parts[15] || "").toUpperCase())
          ? (String(parts[15]).toUpperCase() as ProductForm["sale_type"])
          : "",
        unit: ["kg", "g", "viss", "piece", "pack"].includes(String(parts[16] || ""))
          ? (String(parts[16]) as ProductForm["unit"])
          : "",
        cost_price: parts[17] || "",
        expiry_date: parts[18] || "",
        supplier_name: parts[19] || "",
      });
    });
}

async function copyBulkSample() {
  const sample = [
    "SKU-001, Coca Cola 500ml, 1200, 24, 955000000001, DRINK, SUPERMARKET, 0, /uploads/products/coca-cola.png, Cold drink",
    "SKU-002, Fried Rice, 3500, 10, 955000000002, FOOD, RESTAURANT, 0, /uploads/products/fried-rice.png, Main menu",
    "SKU-003, Cotton Shirt, 15000, 8, 955000000003, FASHION, FASHION, 0, /uploads/products/shirt.png, Variant shirt, BrandX, Black, M, UNISEX, Summer",
    "SKU-004, Apple, 8000, 25.5, 955000000004, FRUIT, FRUIT, 0, /uploads/products/apple.png, Fresh fruit, , , , , , WEIGHT, kg, 5000, 2026-06-30, Local supplier",
  ].join("\n");

  await navigator.clipboard?.writeText(sample);
}

function buildImagePreviewUrl(path?: string | null) {
  const raw = String(path || "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) return raw;
  return `/${raw.replace(/^\/+/, "")}`;
}

const MODULE_CATEGORIES: Record<ProductBusinessModule, CategoryOption[]> = {
  SUPERMARKET: [
    { label: "Barcode Product", value: "BARCODE_PRODUCT" },
    { label: "အကြော် / Fried", value: "FRIED" },
    { label: "သစ်သီး / Fresh Fruit", value: "FRESH_FRUIT" },
    { label: "ဖျော်ရည် / Juice", value: "JUICE" },
    { label: "အသင့်စား / Ready Food", value: "READY_FOOD" },
    { label: "Snack", value: "SNACK" },
    { label: "Drink", value: "DRINK" },
    { label: "Household", value: "HOUSEHOLD" },
    { label: "Frozen", value: "FROZEN" },
    { label: "Cosmetic", value: "COSMETIC" },
    { label: "Other", value: "OTHER" },
  ],
  RESTAURANT: [
    { label: "Food Menu", value: "FOOD" },
    { label: "Drink Menu", value: "DRINK" },
    { label: "Coffee / Tea", value: "COFFEE_TEA" },
    { label: "Fried / Side Dish", value: "FRIED" },
    { label: "Main Dish", value: "MAIN_DISH" },
    { label: "Dessert", value: "DESSERT" },
    { label: "Kitchen Raw Item", value: "KITCHEN_RAW" },
    { label: "Other", value: "OTHER" },
  ],
  FASHION: [
    { label: "Shirt", value: "SHIRT" },
    { label: "Pants", value: "PANTS" },
    { label: "Dress", value: "DRESS" },
    { label: "Skirt", value: "SKIRT" },
    { label: "Jacket", value: "JACKET" },
    { label: "Shoes", value: "SHOES" },
    { label: "Bag", value: "BAG" },
    { label: "Accessory", value: "ACCESSORY" },
    { label: "Other", value: "OTHER" },
  ],
  FRUIT: [
    { label: "Fruit", value: "FRUIT" },
    { label: "Vegetable", value: "VEGETABLE" },
    { label: "Fresh Juice", value: "FRESH_JUICE" },
    { label: "Fruit Pack", value: "FRUIT_PACK" },
    { label: "Dry Fruit", value: "DRY_FRUIT" },
    { label: "Other", value: "OTHER" },
  ],
};

const FALLBACK_CATEGORIES: CategoryOption[] = MODULE_CATEGORIES.SUPERMARKET;

function uniqueCategories(items: CategoryOption[]) {
  const seen = new Set<string>();

  return items
    .map((item) => ({
      label: String(item.label || item.value || "OTHER").trim(),
      value: String(item.value || item.label || "OTHER").trim().toUpperCase(),
    }))
    .filter((item) => {
      if (!item.value || seen.has(item.value)) return false;
      seen.add(item.value);
      return true;
    });
}

function getCategoryOptions(
  categoriesByModule: Record<ProductBusinessModule, CategoryOption[]>,
  module: ProductBusinessModule,
) {
  const options = categoriesByModule[module]?.length
    ? categoriesByModule[module]
    : MODULE_CATEGORIES[module];

  return uniqueCategories(options);
}

function getDefaultCategoryForModule(
  module: ProductBusinessModule,
  categoriesByModule: Record<ProductBusinessModule, CategoryOption[]> = MODULE_CATEGORIES,
) {
  return getCategoryOptions(categoriesByModule, module)[0]?.value || "OTHER";
}

function isCategoryAllowedForModule(
  category: string,
  module: ProductBusinessModule,
  categoriesByModule: Record<ProductBusinessModule, CategoryOption[]> = MODULE_CATEGORIES,
) {
  const current = String(category || "").trim().toUpperCase();
  if (!current) return false;

  return getCategoryOptions(categoriesByModule, module).some(
    (item) => item.value === current,
  );
}

function normalizeCategoryForModule(
  category: string,
  module: ProductBusinessModule,
  categoriesByModule: Record<ProductBusinessModule, CategoryOption[]> = MODULE_CATEGORIES,
) {
  const current = String(category || "").trim().toUpperCase();
  return isCategoryAllowedForModule(current, module, categoriesByModule)
    ? current
    : getDefaultCategoryForModule(module, categoriesByModule);
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  low: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const PRODUCT_MODULES: {
  value: ProductBusinessModule;
  label: string;
  description: string;
  badge: string;
}[] = [
    {
      value: "SUPERMARKET",
      label: "Supermarket",
      description: "Barcode, stock, retail product fields",
      badge: "Normal barcode stock",
    },
    {
      value: "RESTAURANT",
      label: "Restaurant",
      description: "Menu item, kitchen item, food/drink product fields",
      badge: "Menu / Kitchen",
    },
    {
      value: "FASHION",
      label: "Fashion",
      description: "Brand, color, size, gender, season fields",
      badge: "Size / Color",
    },
    {
      value: "FRUIT",
      label: "Fruit",
      description: "Weight, unit, cost, expiry, supplier fields",
      badge: "Weight / Unit",
    },
  ];

function normalizeProductModule(value: unknown): ProductBusinessModule {
  const v = String(value || "").trim().toUpperCase();

  if (v === "RESTAURANT") return "RESTAURANT";
  if (v === "FASHION") return "FASHION";
  if (v === "FRUIT") return "FRUIT";

  return "SUPERMARKET";
}

function getSessionBusinessModule(session: unknown): ProductBusinessModule {
  const user = ((session as any)?.user ?? {}) as any;
  return normalizeProductModule(
    user.businessType ??
    user.business_type ??
    user.shopBusinessType ??
    user.shop_business_type,
  );
}

function appendIfPresent(fd: FormData, keys: string[], value: unknown) {
  if (value === null || value === undefined) return;

  const normalized =
    typeof value === "boolean" ? String(value) : String(value).trim();

  if (!normalized) return;

  keys.forEach((key) => fd.append(key, normalized));
}

function appendModuleFieldsToFormData(
  fd: FormData,
  source: ProductForm,
  module: ProductBusinessModule,
) {
  const productType = source.product_type || module;

  appendIfPresent(fd, ["businessType", "business_type"], module);
  appendIfPresent(fd, ["productType", "product_type"], productType);

  if (module === "RESTAURANT") {
    appendIfPresent(fd, ["kitchenItem", "kitchen_item"], source.kitchen_item);
  }

  if (module === "FASHION") {
    appendIfPresent(fd, ["brand"], source.brand);
    appendIfPresent(fd, ["color", "colour"], source.color);
    appendIfPresent(fd, ["size"], source.size);
    appendIfPresent(fd, ["gender"], source.gender);
    appendIfPresent(fd, ["season"], source.season);
  }

  if (module === "FRUIT") {
    appendIfPresent(fd, ["saleType", "sale_type"], source.sale_type);
    appendIfPresent(fd, ["unit"], source.unit);
    appendIfPresent(fd, ["costPrice", "cost_price"], source.cost_price);
    appendIfPresent(fd, ["expiryDate", "expiry_date"], source.expiry_date);
    appendIfPresent(fd, ["supplierName", "supplier_name"], source.supplier_name);
  }
}

function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;700;900&display=swap');

      * { font-family: 'DM Sans', sans-serif; }
      .serif { font-family: 'DM Serif Display', serif !important; }

      @keyframes lantern-float {
        0%,100% { transform: translateY(0px); }
        50% { transform: translateY(-7px); }
      }

      @keyframes lantern-breathe {
        0%,100% { opacity:.72; transform: scale(1); }
        50% { opacity:1; transform: scale(1.06); }
      }

      @keyframes ember-rise {
        0% { transform: translateY(0) translateX(0) scale(1); opacity:.55; }
        50% { transform: translateY(-18px) translateX(5px) scale(1.1); opacity:.9; }
        100% { transform: translateY(-36px) translateX(-2px) scale(.5); opacity:0; }
      }
    `}</style>
  );
}

const tk = (theme: Theme) =>
  theme === "dark"
    ? {
      root: "bg-[#05060d]",
      text: "text-[#f3e7d2]",
      textMuted: "text-[#bca98f]",
      textSubtle: "text-[#8a7a65]",
      card: "border-[rgba(200,137,42,0.16)] bg-[rgba(14,10,6,0.84)] backdrop-blur-xl",
      input:
        "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#f3e7d2] placeholder:text-[#8a7a65] focus-visible:border-[#c8892a] focus-visible:ring-[#c8892a]/20",
      btn: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#d4b68a] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f3e7d2]",
      btnPrimary:
        "bg-gradient-to-r from-[#a07020] to-[#d4a352] text-[#140d05] hover:from-[#b37a22] hover:to-[#deb25a] shadow-lg shadow-[#c8892a]/20",
      pill: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#bca98f]",
      soft: "bg-[rgba(255,255,255,0.03)]",
      previewCard:
        "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]",
      aiPanel: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]",
      imgDrop:
        "border-[rgba(255,255,255,0.14)] hover:border-[#c8892a] hover:bg-[rgba(200,137,42,0.05)]",
      tag: "bg-[rgba(200,137,42,0.12)] border-[rgba(200,137,42,0.25)] text-[#d4a352]",
      glow1: "bg-amber-700/[0.16]",
      glow2: "bg-orange-700/[0.10]",
    }
    : {
      root: "bg-[#f0f4ff]",
      text: "text-slate-900",
      textMuted: "text-slate-500",
      textSubtle: "text-slate-400",
      card: "border-slate-200/80 bg-white/90 shadow-[0_2px_16px_rgba(15,23,42,0.06)]",
      input:
        "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-blue-500 focus-visible:ring-blue-500/20",
      btn: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
      btnPrimary:
        "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/25",
      pill: "border-slate-200 bg-white text-slate-500 shadow-sm",
      soft: "bg-slate-50",
      previewCard: "border-slate-200 bg-slate-50",
      aiPanel: "border-[rgba(99,102,241,0.15)] bg-[rgba(59,130,246,0.04)]",
      imgDrop:
        "border-slate-300 hover:border-violet-500 hover:bg-violet-50/40",
      tag: "bg-violet-100 border-violet-200 text-violet-700",
      glow1: "bg-violet-300/20",
      glow2: "bg-blue-300/20",
    };

function LanternMark({
  size = 34,
  glow = false,
}: {
  size?: number;
  glow?: boolean;
}) {
  const h = size * 1.5;

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 32 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="lgGlowAddProductFixed" cx="50%" cy="48%" r="50%">
          <stop offset="0%" stopColor="#fff7d6" stopOpacity="0.96" />
          <stop offset="28%" stopColor="#fbbf24" stopOpacity="0.86" />
          <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.44" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </radialGradient>

        <linearGradient
          id="lmMetalAddProductFixed"
          x1="8"
          y1="6"
          x2="24"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#c58a3c" />
          <stop offset="50%" stopColor="#a96b28" />
          <stop offset="100%" stopColor="#8a551d" />
        </linearGradient>

        <linearGradient
          id="lbBodyAddProductFixed"
          x1="6"
          y1="11"
          x2="26"
          y2="37"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#fffaf1" />
          <stop offset="45%" stopColor="#f5e7cf" />
          <stop offset="100%" stopColor="#ecd5ae" />
        </linearGradient>
      </defs>

      <line
        x1="16"
        y1="0"
        x2="16"
        y2="6"
        stroke={glow ? "#d6ae67" : "#9d6a2b"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <rect
        x="8"
        y="6"
        width="16"
        height="5"
        rx="2"
        fill="url(#lmMetalAddProductFixed)"
        stroke="#7b4a18"
        strokeWidth="0.8"
      />

      <rect
        x="6"
        y="11"
        width="20"
        height="26"
        rx="3"
        fill={glow ? "#0e0908" : "url(#lbBodyAddProductFixed)"}
        stroke="#a66b27"
        strokeWidth="1"
      />

      {glow && (
        <rect
          x="6"
          y="11"
          width="20"
          height="26"
          rx="3"
          fill="url(#lgGlowAddProductFixed)"
        />
      )}

      {[11, 16, 21].map((x) => (
        <line
          key={x}
          x1={x}
          y1="11"
          x2={x}
          y2="37"
          stroke={glow ? "#6b3e10" : "#b47b34"}
          strokeWidth="1"
          opacity="0.95"
        />
      ))}

      {glow && (
        <>
          <motion.ellipse
            cx="16"
            cy="26"
            rx="4"
            ry="6"
            fill="#f59e0b"
            opacity="0.68"
            animate={{
              ry: [6, 7.1, 5.3, 6.7, 6],
              cx: [16, 15.7, 16.3, 15.9, 16],
            }}
            transition={{
              duration: 1.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.ellipse
            cx="16"
            cy="27"
            rx="2.5"
            ry="4.2"
            fill="#fde68a"
            animate={{ ry: [4.2, 5, 3.6, 4.5, 4.2] }}
            transition={{
              duration: 0.95,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </>
      )}

      <rect
        x="8"
        y="37"
        width="16"
        height="5"
        rx="2"
        fill="url(#lmMetalAddProductFixed)"
        stroke="#7b4a18"
        strokeWidth="0.8"
      />

      <line
        x1="16"
        y1="42"
        x2="16"
        y2="47"
        stroke="#8f5b24"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <circle cx="16" cy="47" r="1.5" fill="#8f5b24" />
    </svg>
  );
}

function LanternToggle({
  dark,
  onToggle,
}: {
  dark: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ y: -2, scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      className="relative flex flex-col items-center focus:outline-none"
      style={{ width: 58 }}
      aria-label={dark ? "Switch to day mode" : "Switch to night mode"}
    >
      {dark && (
        <div
          className="pointer-events-none absolute"
          style={{
            width: 76,
            height: 76,
            top: -6,
            left: "50%",
            transform: "translateX(-50%)",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(251,191,36,0.52) 0%, rgba(245,158,11,0.18) 52%, transparent 76%)",
            filter: "blur(9px)",
            animation: "lantern-breathe 2.8s ease-in-out infinite",
          }}
        />
      )}

      <div style={{ animation: "lantern-float 3s ease-in-out infinite" }}>
        <LanternMark size={34} glow={dark} />
      </div>

      <span
        style={{
          marginTop: 5,
          fontSize: 7,
          fontWeight: 700,
          letterSpacing: "0.2em",
          color: dark ? "#c8892a" : "#9a6c2a",
        }}
      >
        {dark ? "NIGHT" : "DAY"}
      </span>
    </motion.button>
  );
}

function NightParticles() {
  const particles = Array.from({ length: 26 }).map((_, i) => ({
    id: i,
    left: `${(i * 31 + 9) % 100}%`,
    top: `${(i * 43 + 11) % 100}%`,
    size: 1.5 + (i % 3),
    delay: (i * 0.25) % 4,
    duration: 2.8 + (i % 4) * 0.8,
  }));

  const embers = Array.from({ length: 10 }).map((_, i) => ({
    id: i,
    left: `${38 + (i % 5) * 5 - 10}%`,
    delay: i * 0.4,
    size: 3 + (i % 3),
    dur: 3.5 + (i % 4) * 0.5,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-amber-100"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
          }}
          animate={{
            opacity: [0.08, 0.9, 0.08],
            scale: [0.7, 1.4, 0.7],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {embers.map((e) => (
        <div
          key={e.id}
          style={{
            position: "absolute",
            bottom: "56%",
            left: e.left,
            width: e.size,
            height: e.size,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #ffe080 0%, #ff8820 60%, transparent 100%)",
            boxShadow: "0 0 6px 2px rgba(255,160,40,0.6)",
            animation: `ember-rise ${e.dur}s ${e.delay}s ease-out infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

function normalizeTokenType(v: unknown) {
  return (
    String(v ?? "Bearer")
      .replace(/\s+/g, " ")
      .trim() || "Bearer"
  );
}

function normalizeCreatorInfo(session: unknown): ProductCreatorInfo {
  const user = ((session as any)?.user ?? {}) as any;

  return {
    id: String(user.id ?? user.userId ?? user.staffId ?? "").trim(),
    username: String(user.username ?? user.name ?? user.email ?? "").trim(),
    name: String(user.name ?? user.username ?? "").trim(),
    email: String(user.email ?? "").trim(),
    role: String(user.role ?? "").trim(),
    shopId: user.shopId == null ? "" : String(user.shopId).trim(),
    shopCode: String(user.shopCode ?? "").trim(),
    imageUrl: String(
      user.imageUrl ?? user.avatarUrl ?? user.image ?? "",
    ).trim(),
  };
}

function isNumericId(value: string) {
  return /^\d+$/.test(String(value || "").trim());
}

/**
 * createdByUserId ထဲကို number ဖြစ်မှ ပို့မယ်။
 * "user3" လို string ဖြစ်ရင် username fields ထဲပဲပို့မယ်။
 */
function appendCreatorInfo(formData: FormData, creator: ProductCreatorInfo) {
  const numericUserId = isNumericId(creator.id) ? creator.id : "";

  const username =
    creator.username ||
    (!isNumericId(creator.id) ? creator.id : "") ||
    creator.name ||
    creator.email ||
    "";

  const displayName = creator.name || username;

  const payload = {
    id: numericUserId || null,
    userId: numericUserId || null,
    username: username || null,
    name: displayName || null,
    email: creator.email || null,
    role: creator.role || null,
    shopId: creator.shopId || null,
    shopCode: creator.shopCode || null,
    imageUrl: creator.imageUrl || null,
  };

  formData.append("createdBy", JSON.stringify(payload));
  formData.append("created_by", JSON.stringify(payload));
  formData.append("user_info", JSON.stringify(payload));
  formData.append("owner", JSON.stringify(payload));

  if (numericUserId) {
    formData.append("createdByUserId", numericUserId);
    formData.append("created_by_user_id", numericUserId);
    formData.append("created_by_id", numericUserId);
    formData.append("ownerId", numericUserId);
    formData.append("owner_id", numericUserId);
    formData.append("userId", numericUserId);
    formData.append("user_id", numericUserId);
  }

  if (username) {
    formData.append("createdByUsername", username);
    formData.append("created_by_username", username);
    formData.append("ownerUsername", username);
    formData.append("owner_username", username);
    formData.append("username", username);
  }

  if (displayName) {
    formData.append("createdByName", displayName);
    formData.append("created_by_name", displayName);
  }

  if (creator.email) {
    formData.append("createdByEmail", creator.email);
    formData.append("created_by_email", creator.email);
  }

  if (creator.role) {
    formData.append("createdByRole", creator.role);
    formData.append("created_by_role", creator.role);
  }

  if (creator.shopId) {
    formData.append("shopId", creator.shopId);
    formData.append("shop_id", creator.shopId);
  }

  if (creator.shopCode) {
    formData.append("shopCode", creator.shopCode);
    formData.append("shop_code", creator.shopCode);
  }

  if (creator.imageUrl) {
    formData.append("createdByImageUrl", creator.imageUrl);
    formData.append("created_by_image_url", creator.imageUrl);
  }
}

function slugify(v: string) {
  return v
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

function generateSku(name: string) {
  return `${slugify(name).slice(0, 10) || "PRODUCT"}-${1000 + Math.floor(Math.random() * 9000)
    }`;
}

function generateBarcodeString(seed = "") {
  const base = String(Date.now()).slice(-9);
  const extra = String(Math.floor(100 + Math.random() * 900));
  const cleaned = seed.replace(/\D/g, "").slice(0, 4);
  return `${cleaned}${base}${extra}`.slice(0, 13);
}

function inferCategory(name: string) {
  const n = name.toLowerCase();

  if (
    ["cola", "coffee", "tea", "juice", "water", "drink", "soda", "milk"].some(
      (k) => n.includes(k),
    )
  ) {
    return "DRINK";
  }

  if (
    ["chip", "cracker", "cookie", "snack", "nuts", "candy", "chocolate"].some(
      (k) => n.includes(k),
    )
  ) {
    return "SNACK";
  }

  if (
    ["rice", "bread", "noodle", "food", "egg", "meat", "oil", "sauce"].some(
      (k) => n.includes(k),
    )
  ) {
    return "FOOD";
  }

  if (
    ["soap", "clean", "tissue", "detergent", "shampoo", "brush"].some((k) =>
      n.includes(k),
    )
  ) {
    return "HOUSEHOLD";
  }

  if (
    ["ice cream", "frozen", "nugget", "dumpling"].some((k) => n.includes(k))
  ) {
    return "FROZEN";
  }

  if (
    ["cream", "lotion", "powder", "lip", "cosmetic"].some((k) => n.includes(k))
  ) {
    return "COSMETIC";
  }

  return "OTHER";
}

function inferPrice(name: string, category: string) {
  const n = name.toLowerCase();

  if (n.includes("500ml") && category === "DRINK") return "700";
  if (n.includes("330ml") && category === "DRINK") return "500";
  if (n.includes("1l") && category === "DRINK") return "1200";
  if (n.includes("2l") && category === "DRINK") return "2200";

  if (category === "SNACK") return "500";
  if (category === "FOOD") return "1500";
  if (category === "HOUSEHOLD") return "2500";
  if (category === "FROZEN") return "3500";
  if (category === "COSMETIC") return "4000";

  return "1000";
}

function localAIFill(productName: string): AISuggestion {
  const trimmed = productName.trim();
  const category = inferCategory(trimmed);
  const sku = generateSku(trimmed);
  const barcode = generateBarcodeString(sku);
  const suggested_price = inferPrice(trimmed, category);

  const tags = Array.from(new Set([category.toLowerCase(), "packaged"])).slice(
    0,
    5,
  );

  let confidence: AISuggestion["confidence"] = "medium";

  if (
    ["coca cola", "pepsi", "sprite", "fanta", "coffee mix", "lays"].some((k) =>
      trimmed.toLowerCase().includes(k),
    )
  ) {
    confidence = "high";
  } else if (trimmed.length < 4) {
    confidence = "low";
  }

  return {
    sku,
    category,
    suggested_price,
    barcode,
    tags,
    note: `${trimmed} is categorized as ${category.toLowerCase()} item for retail sale.`,
    reasoning: `Local AI checked keywords in "${trimmed}". Detected category: ${category}. Estimated price based on common retail range.`,
    confidence,
  };
}

async function cropImageToSquare(file: File): Promise<File> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();

    r.onload = () => res(String(r.result ?? ""));
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const el = new Image();

    el.onload = () => res(el);
    el.onerror = rej;
    el.src = dataUrl;
  });

  const size = Math.min(img.width, img.height);
  const sx = Math.floor((img.width - size) / 2);
  const sy = Math.floor((img.height - size) / 2);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);

  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, "image/jpeg", 0.92),
  );

  if (!blob) throw new Error("Crop failed");

  return new File([blob], file.name.replace(/\.[^.]+$/, "") + "-crop.jpg", {
    type: "image/jpeg",
  });
}


function ProductModuleSelector({
  module,
  onChange,
  theme,
  t,
}: {
  module: ProductBusinessModule;
  onChange: (value: ProductBusinessModule) => void;
  theme: Theme;
  t: ReturnType<typeof tk>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("grid gap-3 rounded-[24px] border p-3 md:grid-cols-4", t.card)}
    >
      {PRODUCT_MODULES.map((item) => {
        const active = module === item.value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              "rounded-2xl border p-4 text-left transition-all",
              active ? t.btnPrimary : t.btn,
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[14px] font-black">{item.label}</div>
                <div className="mt-1 text-[11px] leading-5 opacity-80">
                  {item.description}
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full border px-2 py-1 text-[9px] font-black uppercase tracking-wide",
                  active
                    ? theme === "dark"
                      ? "border-[#140d05]/20 bg-[#140d05]/10 text-[#140d05]"
                      : "border-white/20 bg-white/20 text-white"
                    : t.pill,
                )}
              >
                {item.badge}
              </span>
            </div>
          </button>
        );
      })}
    </motion.div>
  );
}

function ProductModuleFields({
  module,
  form,
  setField,
  t,
}: {
  module: ProductBusinessModule;
  form: ProductForm;
  setField: <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => void;
  t: ReturnType<typeof tk>;
}) {
  if (module === "RESTAURANT") {
    return (
      <div className={cn("rounded-2xl border p-4", t.aiPanel)}>
        <div className={cn("mb-3 text-[13px] font-black", t.text)}>
          Restaurant module fields
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className={cn("flex items-center gap-3 rounded-xl border p-3", t.previewCard)}>
            <input
              type="checkbox"
              checked={form.kitchen_item}
              onChange={(event) => setField("kitchen_item", event.target.checked)}
            />
            <span className={cn("text-[12px] font-bold", t.text)}>
              Send this item to kitchen
            </span>
          </label>

          <div className="space-y-1.5">
            <Label className={cn("text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>
              Product Type
            </Label>
            <Select
              value={form.product_type || module}
              onValueChange={(v) => setField("product_type", v as ProductBusinessModule)}
            >
              <SelectTrigger className={cn("h-10 rounded-xl", t.input)}>
                <SelectValue placeholder="Select product type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RESTAURANT">RESTAURANT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  if (module === "FASHION") {
    return (
      <div className={cn("rounded-2xl border p-4", t.aiPanel)}>
        <div className={cn("mb-3 text-[13px] font-black", t.text)}>
          Fashion module fields
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label className={cn("text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>
              Brand
            </Label>
            <Input
              value={form.brand}
              onChange={(e) => setField("brand", e.target.value)}
              placeholder="e.g. Adidas"
              className={cn("h-10 rounded-xl", t.input)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={cn("text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>
              Color
            </Label>
            <Input
              value={form.color}
              onChange={(e) => setField("color", e.target.value)}
              placeholder="Black / White"
              className={cn("h-10 rounded-xl", t.input)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={cn("text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>
              Size
            </Label>
            <Input
              value={form.size}
              onChange={(e) => setField("size", e.target.value)}
              placeholder="S / M / L / XL"
              className={cn("h-10 rounded-xl", t.input)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={cn("text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>
              Gender
            </Label>
            <Select value={form.gender} onValueChange={(v) => setField("gender", v)}>
              <SelectTrigger className={cn("h-10 rounded-xl", t.input)}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEN">MEN</SelectItem>
                <SelectItem value="WOMEN">WOMEN</SelectItem>
                <SelectItem value="UNISEX">UNISEX</SelectItem>
                <SelectItem value="KIDS">KIDS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className={cn("text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>
              Season
            </Label>
            <Input
              value={form.season}
              onChange={(e) => setField("season", e.target.value)}
              placeholder="Summer / Winter"
              className={cn("h-10 rounded-xl", t.input)}
            />
          </div>
        </div>

        <p className={cn("mt-3 text-[11px] leading-5", t.textMuted)}>
          Variant table backend မပြီးသေးရင် ဒီ fields တွေကို products table ထဲက optional columns / JSON fields အနေနဲ့ သိမ်းနိုင်ပါတယ်။
        </p>
      </div>
    );
  }

  if (module === "FRUIT") {
    return (
      <div className={cn("rounded-2xl border p-4", t.aiPanel)}>
        <div className={cn("mb-3 text-[13px] font-black", t.text)}>
          Fruit module fields
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label className={cn("text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>
              Sale Type
            </Label>
            <Select value={form.sale_type} onValueChange={(v) => setField("sale_type", v as ProductForm["sale_type"])}>
              <SelectTrigger className={cn("h-10 rounded-xl", t.input)}>
                <SelectValue placeholder="WEIGHT / PIECE" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEIGHT">WEIGHT</SelectItem>
                <SelectItem value="PIECE">PIECE</SelectItem>
                <SelectItem value="PACK">PACK</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className={cn("text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>
              Unit
            </Label>
            <Select value={form.unit} onValueChange={(v) => setField("unit", v as ProductForm["unit"])}>
              <SelectTrigger className={cn("h-10 rounded-xl", t.input)}>
                <SelectValue placeholder="kg / piece" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="g">g</SelectItem>
                <SelectItem value="viss">viss</SelectItem>
                <SelectItem value="piece">piece</SelectItem>
                <SelectItem value="pack">pack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className={cn("text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>
              Cost Price
            </Label>
            <Input
              type="number"
              value={form.cost_price}
              onChange={(e) => setField("cost_price", e.target.value)}
              placeholder="Cost per unit"
              className={cn("h-10 rounded-xl", t.input)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className={cn("text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>
              Expiry Date
            </Label>
            <Input
              type="date"
              value={form.expiry_date}
              onChange={(e) => setField("expiry_date", e.target.value)}
              className={cn("h-10 rounded-xl", t.input)}
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className={cn("text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>
              Supplier
            </Label>
            <Input
              value={form.supplier_name}
              onChange={(e) => setField("supplier_name", e.target.value)}
              placeholder="Supplier name"
              className={cn("h-10 rounded-xl", t.input)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border p-4", t.aiPanel)}>
      <div className={cn("text-[13px] font-black", t.text)}>
        Supermarket module
      </div>
      <p className={cn("mt-1 text-[11px] leading-5", t.textMuted)}>
        Default barcode, price, stock, discount fields ကိုသုံးပါမယ်။
      </p>
    </div>
  );
}

export default function ProductCreatePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { resolvedTheme, setTheme: setNextTheme } = useTheme();

  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(resolvedTheme === "light" ? "light" : "dark");
  }, [resolvedTheme]);

  const t = tk(theme);

  const accessToken = String(
    (session as any)?.accessToken ||
    (session as any)?.access_token ||
    (session as any)?.token ||
    "",
  ).trim();

  const tokenType = normalizeTokenType((session as any)?.tokenType);
  const creatorInfo = useMemo(() => normalizeCreatorInfo(session), [session]);
  const sessionBusinessModule = useMemo(
    () => getSessionBusinessModule(session),
    [session],
  );

  const apiBase = "";

  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);
  const [productModule, setProductModule] =
    useState<ProductBusinessModule>("SUPERMARKET");
  const [mode, setMode] = useState<AddMode>("single");
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([
    makeBulkRow(),
    makeBulkRow(),
    makeBulkRow(),
  ]);
  const [bulkPaste, setBulkPaste] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkAiFilling, setBulkAiFilling] = useState(false);
  const [loading, setLoading] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [categoriesByModule, setCategoriesByModule] = useState<
    Record<ProductBusinessModule, CategoryOption[]>
  >(MODULE_CATEGORIES);

  const activeCategories = useMemo(
    () => getCategoryOptions(categoriesByModule, productModule),
    [categoriesByModule, productModule],
  );

  const [catLoading, setCatLoading] = useState(false);
  const [aiFilling, setAiFilling] = useState(false);
  const [cropping, setCropping] = useState(false);

  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const barcodeSvgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!barcodeSvgRef.current || !form.barcode.trim()) return;

    try {
      JsBarcode(barcodeSvgRef.current, form.barcode.trim(), {
        format: "CODE128",
        displayValue: true,
        fontSize: 12,
        height: 55,
        margin: 6,
      });
    } catch { }
  }, [form.barcode]);

  useEffect(() => {
    setProductModule(sessionBusinessModule);
    setForm((prev) => ({
      ...prev,
      product_type: sessionBusinessModule,
      category: normalizeCategoryForModule(
        prev.category,
        sessionBusinessModule,
        categoriesByModule,
      ),
    }));
  }, [sessionBusinessModule, categoriesByModule]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    return () => {
      bulkRows.forEach((row) => {
        if (row.image_preview) URL.revokeObjectURL(row.image_preview);
      });
    };
    // component unmount cleanup only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setField<K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function revokeAndSetPreview(url: string | null) {
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  }

  function resetForm() {
    setForm({ ...INITIAL_FORM, product_type: productModule });
    setImageFile(null);
    revokeAndSetPreview(null);
    setSuggestion(null);
    setAiError(null);
    setShowReasoning(false);
  }

  function applyImage(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Image file ပဲရွေးပါ");
      return;
    }

    setImageFile(file);
    revokeAndSetPreview(URL.createObjectURL(file));
  }

  async function autoFill() {
    if (!form.product_name.trim()) {
      toast.error("Product name ကို အရင်ထည့်ပါ");
      return;
    }

    setAiFilling(true);
    setSuggestion(null);
    setAiError(null);

    const tid = toast.loading("Local AI analyzing...");

    try {
      await new Promise((r) => setTimeout(r, 450));

      const s = localAIFill(form.product_name.trim());

      setForm((prev) => ({
        ...prev,
        sku: prev.sku.trim() || s.sku,
        barcode: prev.barcode.trim() || s.barcode,
        category:
          prev.category ||
          normalizeCategoryForModule(s.category, productModule, categoriesByModule),
        product_price: prev.product_price.trim() || s.suggested_price,
        note: prev.note.trim() || s.note,
      }));

      setSuggestion(s);
      toast.success("Local AI fill done ✅", { id: tid });
    } catch (err: any) {
      const msg = err?.message ?? "Local AI error ဖြစ်တယ်";
      setAiError(msg);
      toast.error(msg, { id: tid });
    } finally {
      setAiFilling(false);
    }
  }

  function applyAIAll() {
    if (!suggestion) return;

    setForm((prev) => ({
      ...prev,
      sku: suggestion.sku,
      barcode: suggestion.barcode,
      category: suggestion.category,
      product_price: suggestion.suggested_price,
      note: suggestion.note,
    }));

    toast.success("AI suggestion apply လုပ်ပြီး ✅");
  }

  function generateBarcodeNow() {
    const bc = generateBarcodeString(form.sku || form.product_name);
    setField("barcode", bc);
    toast.success("Barcode generated ✅");
  }

  async function loadCategories() {
    setCatLoading(true);

    try {
      const res = await fetch(`/backend/api/categories`, {
        headers: accessToken
          ? { Authorization: `${tokenType} ${accessToken}` }
          : {},
        cache: "no-store",
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      const rows = Array.isArray(data)
        ? data
        : Array.isArray(data?.categories)
          ? data.categories
          : Array.isArray(data?.data)
            ? data.data
            : [];

      const next: Record<ProductBusinessModule, CategoryOption[]> = {
        SUPERMARKET: [...MODULE_CATEGORIES.SUPERMARKET],
        RESTAURANT: [...MODULE_CATEGORIES.RESTAURANT],
        FASHION: [...MODULE_CATEGORIES.FASHION],
        FRUIT: [...MODULE_CATEGORIES.FRUIT],
      };

      rows.forEach((item: any) => {
        const module = normalizeProductModule(
          item.businessType ??
          item.business_type ??
          item.module ??
          item.productType ??
          item.product_type ??
          productModule,
        );

        const value = String(
          item.value ?? item.name ?? item.category ?? item.label ?? "",
        )
          .trim()
          .toUpperCase();

        if (!value) return;

        next[module].push({
          label: String(item.label ?? item.name ?? item.category ?? value),
          value,
        });
      });

      setCategoriesByModule({
        SUPERMARKET: uniqueCategories(next.SUPERMARKET),
        RESTAURANT: uniqueCategories(next.RESTAURANT),
        FASHION: uniqueCategories(next.FASHION),
        FRUIT: uniqueCategories(next.FRUIT),
      });

      setForm((prev) => ({
        ...prev,
        category: normalizeCategoryForModule(prev.category, productModule, next),
      }));

      toast.success("Module category list updated ✅");
    } catch {
      toast.error("Category API မရလို့ module default categories သုံးထားပါ");
      setCategoriesByModule(MODULE_CATEGORIES);
    } finally {
      setCatLoading(false);
    }
  }

  async function cropImage() {
    if (!imageFile) {
      toast.error("Image မရှိသေးပါ");
      return;
    }

    try {
      setCropping(true);

      const cropped = await cropImageToSquare(imageFile);
      applyImage(cropped);

      toast.success("Crop done ✅");
    } catch {
      toast.error("Crop failed");
    } finally {
      setCropping(false);
    }
  }

  function setBulkField<K extends keyof BulkRow>(
    rowId: string,
    key: K,
    value: BulkRow[K],
  ) {
    setBulkRows((prev) =>
      prev.map((row) =>
        row.rowId === rowId
          ? { ...row, [key]: value, status: "idle", error: null }
          : row,
      ),
    );
  }

  function setBulkRowModule(rowId: string, nextModule: ProductBusinessModule) {
    setBulkRows((prev) =>
      prev.map((row) => {
        if (row.rowId !== rowId) return row;

        return {
          ...row,
          product_type: nextModule,
          category: normalizeCategoryForModule(
            row.category,
            nextModule,
            categoriesByModule,
          ),
          status: "idle",
          error: null,
        };
      }),
    );
  }

  function applyBulkImage(rowId: string, file?: File | null) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Image file ပဲရွေးပါ");
      return;
    }

    setBulkRows((prev) =>
      prev.map((row) => {
        if (row.rowId !== rowId) return row;

        if (row.image_preview) URL.revokeObjectURL(row.image_preview);

        return {
          ...row,
          image_file: file,
          image_preview: URL.createObjectURL(file),
          image_path: "",
          status: "idle",
          error: null,
        };
      }),
    );
  }

  function clearBulkImage(rowId: string) {
    setBulkRows((prev) =>
      prev.map((row) => {
        if (row.rowId !== rowId) return row;

        if (row.image_preview) URL.revokeObjectURL(row.image_preview);

        return {
          ...row,
          image_file: null,
          image_preview: "",
          image_path: "",
          status: "idle",
          error: null,
        };
      }),
    );
  }

  function localAIFillBulkRow(rowId: string) {
    setBulkRows((prev) =>
      prev.map((row) => {
        if (row.rowId !== rowId) return row;
        if (!row.product_name.trim()) {
          return {
            ...row,
            status: "error",
            error: "Product name လိုအပ်ပါတယ်။",
          };
        }

        const s = localAIFill(row.product_name.trim());

        return {
          ...row,
          sku: row.sku.trim() || s.sku,
          barcode: row.barcode.trim() || s.barcode,
          category:
            row.category ||
            normalizeCategoryForModule(
              s.category,
              normalizeProductModule(row.product_type || productModule),
              categoriesByModule,
            ),
          product_price: row.product_price.trim() || s.suggested_price,
          note: row.note.trim() || s.note,
          suggestion: s,
          status: "idle",
          error: null,
        };
      }),
    );
  }

  async function localAIFillAllBulkRows() {
    setBulkAiFilling(true);

    try {
      await new Promise((r) => setTimeout(r, 350));

      setBulkRows((prev) =>
        prev.map((row) => {
          if (!row.product_name.trim()) return row;

          const s = localAIFill(row.product_name.trim());

          return {
            ...row,
            sku: row.sku.trim() || s.sku,
            barcode: row.barcode.trim() || s.barcode,
            category:
              row.category ||
              normalizeCategoryForModule(
                s.category,
                normalizeProductModule(row.product_type || productModule),
                categoriesByModule,
              ),
            product_price: row.product_price.trim() || s.suggested_price,
            note: row.note.trim() || s.note,
            suggestion: s,
            status: "idle",
            error: null,
          };
        }),
      );

      toast.success("Bulk rows AI fill done ✅");
    } finally {
      setBulkAiFilling(false);
    }
  }

  function applyBulkPaste() {
    const rows = bulkRowsFromPaste(bulkPaste);

    if (!rows.length) {
      toast.error("Paste data မတွေ့ပါ။");
      return;
    }

    setBulkRows((prev) => {
      prev.forEach((row) => {
        if (row.image_preview) URL.revokeObjectURL(row.image_preview);
      });
      return rows;
    });
    setBulkPaste("");
    toast.success(`${rows.length} rows imported ✅`);
  }

  function appendCategoryToFormData(fd: FormData, category: string) {
    const normalized = String(category || "").trim().toUpperCase();
    if (!normalized) return;

    fd.append("category", normalized);
    fd.append("productCategory", normalized);
    fd.append("product_category", normalized);
    fd.append("posCategory", normalized);
    fd.append("pos_category", normalized);
  }

  function appendProductFieldsToFormData(
    fd: FormData,
    source: ProductForm,
    imagePath?: string,
  ) {
    const price = Number(source.product_price || 0);
    const qty = Number(source.product_quantity_amount || 0);
    const discount = Number(source.product_discount || 0);

    fd.append("sku", source.sku.trim());
    fd.append("product_name", source.product_name.trim());
    fd.append("product_price", String(price));
    fd.append("product_quantity_amount", String(qty));
    fd.append("product_discount", String(discount));

    fd.append("productName", source.product_name.trim());
    fd.append("productPrice", String(price));
    fd.append("productQuantityAmount", String(qty));
    fd.append("productDiscount", String(discount));

    if (source.barcode.trim()) fd.append("barcode", source.barcode.trim());
    appendCategoryToFormData(fd, source.category);
    if (source.note.trim()) fd.append("note", source.note.trim());

    if (imagePath?.trim()) {
      fd.append("imagePath", imagePath.trim());
      fd.append("image_path", imagePath.trim());
      fd.append("product_image", imagePath.trim());
    }

    appendModuleFieldsToFormData(
      fd,
      source,
      normalizeProductModule(source.product_type || productModule),
    );
  }

  async function createProductWithFormData(
    source: ProductForm,
    imagePath?: string,
    imageFile?: File | null,
  ) {
    if (status !== "authenticated") throw new Error("Login မဝင်ရသေးပါ");
    if (!accessToken) throw new Error("Session ထဲမှာ accessToken မတွေ့ပါ");
    if (
      !source.sku.trim() ||
      !source.product_name.trim() ||
      !source.product_price.trim()
    ) {
      throw new Error("SKU, Product Name, Price ကို ထည့်ပေးပါ");
    }

    const fd = new FormData();
    appendProductFieldsToFormData(fd, source, imagePath);

    if (imageFile) {
      fd.append("image", imageFile);
      fd.append("file", imageFile);
      fd.append("productImage", imageFile);
    }

    appendCreatorInfo(fd, creatorInfo);

    const res = await fetch(`${apiBase}/backend/api/products`, {
      method: "POST",
      headers: {
        Authorization: `${tokenType} ${accessToken}`,
      },
      body: fd,
    });

    const text = await res.text().catch(() => "");
    let json: any = null;

    try {
      json = text ? JSON.parse(text) : null;
    } catch { }

    if (!res.ok) {
      const msg =
        json?.message ?? json?.error ?? text ?? `Failed (${res.status})`;
      throw new Error(getLimitErrorMessage(msg) || String(msg));
    }

    return json;
  }

  function resetBulkRows() {
    setBulkRows((prev) => {
      prev.forEach((row) => {
        if (row.image_preview) URL.revokeObjectURL(row.image_preview);
      });

      return [makeBulkRow(), makeBulkRow(), makeBulkRow()];
    });

    setBulkPaste("");
  }

  async function submitBulk() {
    if (status === "loading") {
      toast("Checking login...");
      return;
    }

    if (status !== "authenticated") {
      toast.error("Login မဝင်ရသေးပါ");
      router.replace("/Sign_in?next=/dashboard/product/add");
      return;
    }

    if (!accessToken) {
      toast.error("Session ထဲမှာ accessToken မတွေ့ပါ");
      return;
    }

    const rows = bulkRows.filter((row) => row.product_name.trim());

    if (!rows.length) {
      toast.error("Bulk add အတွက် product အနည်းဆုံး ၁ ခု ထည့်ပါ။");
      return;
    }

    setBulkSaving(true);
    const tid = toast.loading(`Creating ${rows.length} products...`);

    try {
      let success = 0;
      let failed = 0;
      const failedRowIds = new Set<string>();

      for (const row of rows) {
        setBulkRows((prev) =>
          prev.map((item) =>
            item.rowId === row.rowId
              ? { ...item, status: "saving", error: null }
              : item,
          ),
        );

        try {
          await createProductWithFormData(row, row.image_path, row.image_file);
          success += 1;

          setBulkRows((prev) =>
            prev.map((item) =>
              item.rowId === row.rowId
                ? { ...item, status: "success", error: null }
                : item,
            ),
          );
        } catch (err) {
          failed += 1;
          failedRowIds.add(row.rowId);

          setBulkRows((prev) =>
            prev.map((item) =>
              item.rowId === row.rowId
                ? {
                  ...item,
                  status: "error",
                  error: err instanceof Error ? err.message : "Create failed",
                }
                : item,
            ),
          );
        }
      }

      if (failed) {
        toast.error(`Saved ${success}, failed ${failed}`, { id: tid });

        // Success rows တွေကို ဖျက်ပြီး error rows တွေကိုပဲ ထားပါ။
        setBulkRows((prev) => {
          prev.forEach((row) => {
            if (!failedRowIds.has(row.rowId) && row.image_preview) {
              URL.revokeObjectURL(row.image_preview);
            }
          });

          const failedRows = prev.filter((row) => failedRowIds.has(row.rowId));
          return failedRows.length ? failedRows : [makeBulkRow()];
        });

        return;
      }

      toast.success(`Created ${success} products ✅`, { id: tid });

      // Submit all success ဖြစ်ရင် form/table ကို reset လုပ်ပြီး product list page ကို refresh/push လုပ်ပါ။
      resetBulkRows();
      router.refresh();
      router.push("/dashboard/product");
    } finally {
      setBulkSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (status === "loading") {
      toast("Checking login...");
      return;
    }

    if (status !== "authenticated") {
      toast.error("Login မဝင်ရသေးပါ");
      router.replace("/Sign_in?next=/dashboard/product/add");
      return;
    }

    if (!accessToken) {
      toast.error("Session ထဲမှာ accessToken မတွေ့ပါ");
      return;
    }

    if (
      !form.sku.trim() ||
      !form.product_name.trim() ||
      !form.product_price.trim()
    ) {
      toast.error("SKU, Product Name, Price ကို ထည့်ပေးပါ");
      return;
    }

    const price = Number(form.product_price);
    const qty = Number(form.product_quantity_amount || 0);
    const discount = Number(form.product_discount || 0);

    if (Number.isNaN(price)) {
      toast.error("Price သည် number ဖြစ်ရပါမယ်");
      return;
    }

    if (Number.isNaN(qty)) {
      toast.error("Quantity သည် number ဖြစ်ရပါမယ်");
      return;
    }

    if (Number.isNaN(discount)) {
      toast.error("Discount သည် number ဖြစ်ရပါမယ်");
      return;
    }

    setLoading(true);

    const tid = toast.loading("Creating product...");

    try {
      const fd = new FormData();

      fd.append("sku", form.sku.trim());
      fd.append("product_name", form.product_name.trim());
      fd.append("product_price", String(price));
      fd.append("product_quantity_amount", String(qty));
      fd.append("product_discount", String(discount));

      fd.append("productName", form.product_name.trim());
      fd.append("productPrice", String(price));
      fd.append("productQuantityAmount", String(qty));
      fd.append("productDiscount", String(discount));

      if (form.barcode.trim()) {
        fd.append("barcode", form.barcode.trim());
      }

      appendCategoryToFormData(fd, form.category);

      if (form.note.trim()) {
        fd.append("note", form.note.trim());
      }

      appendModuleFieldsToFormData(fd, form, productModule);

      if (imageFile) {
        fd.append("image", imageFile);
        fd.append("file", imageFile);
      }

      appendCreatorInfo(fd, creatorInfo);

      const res = await fetch(`${apiBase}/backend/api/products`, {
        method: "POST",
        headers: {
          Authorization: `${tokenType} ${accessToken}`,
        },
        body: fd,
      });

      const text = await res.text().catch(() => "");

      let json: any = null;

      try {
        json = text ? JSON.parse(text) : null;
      } catch { }

      if (!res.ok) {
        const msg =
          json?.message ?? json?.error ?? text ?? `Failed (${res.status})`;

        toast.error(getLimitErrorMessage(msg) || String(msg), { id: tid });
        return;
      }

      toast.success(
        `Created: ${json?.productName ?? json?.product_name ?? form.product_name}`,
        { id: tid },
      );

      resetForm();

      router.push("/dashboard/product");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      toast.error(getLimitErrorMessage(msg) || "Server error ဖြစ်နေတယ်", { id: tid });
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <>
        <FontImport />
        <div className="flex min-h-screen items-center justify-center bg-[#05060d] text-[#f3e7d2]">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-amber-400" />
            <div className="text-sm font-bold">Checking session...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FontImport />

      <div
        className={cn(
          "relative min-h-screen transition-colors duration-500",
          t.root,
        )}
      >
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div
            className={cn(
              "absolute -top-40 left-[15%] h-[500px] w-[500px] rounded-full blur-[140px]",
              t.glow1,
            )}
          />

          <div
            className={cn(
              "absolute -bottom-20 right-[-10%] h-[440px] w-[440px] rounded-full blur-[130px]",
              t.glow2,
            )}
          />
        </div>

        {theme === "dark" && <NightParticles />}

        <div className="relative z-10 mx-auto max-w-5xl space-y-5 px-5 py-7 md:px-8 2xl:max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "relative overflow-hidden rounded-[30px] border p-6 md:p-8",
              t.card,
            )}
          >
            <div
              className="absolute left-0 right-0 top-0 h-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #c8892a, transparent)",
              }}
            />

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                {theme === "dark" && (
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="hidden md:block"
                  >
                    <LanternMark size={72} glow />
                  </motion.div>
                )}

                <div>
                  {/* <div
                    className={cn(
                      "mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide",
                      t.pill,
                    )}
                  >
                    <Sparkles className="h-3 w-3" />
                    BINHLAIG · Create Product
                  </div> */}


                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className={cn("rounded-xl px-3 py-2 text-[12px] font-bold hover:cursor-pointer mb-2", t.btnPrimary)}
                >
                  <HomeIcon className="mr-2 inline h-4 w-4 " />
                  dashboard
                </button>




                  <h1
                    className={cn(
                      "serif text-[36px] font-normal leading-[0.95] md:text-[48px]",
                      t.text,
                    )}
                  >
                    Add Product
                    <span
                      className={cn(
                        "ml-2 text-[16px] font-medium md:text-[20px]",
                        t.textMuted,
                      )}
                    >
                      owner protected
                    </span>
                  </h1>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold",
                        t.pill,
                      )}
                    >
                      <UserCircle2 className="h-3.5 w-3.5" />
                      {creatorInfo.username || creatorInfo.id || "Current User"}
                    </span>

                    <span
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold",
                        t.pill,
                      )}
                    >
                      <Store className="h-3.5 w-3.5" />
                      {creatorInfo.shopCode || creatorInfo.shopId || "No Shop"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-xl border px-4 text-[13px] font-semibold transition-all",
                    t.btn,
                  )}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>


{/* 
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className={cn("rounded-xl px-3 py-2 text-[12px] font-bold hover:cursor-pointer", t.btnPrimary)}
                >
                  <HomeIcon className="mr-2 inline h-4 w-4 " />
                  dashboard
                </button> */}

                <LanternToggle
                  dark={theme === "dark"}
                  onToggle={() =>
                    setNextTheme(theme === "dark" ? "light" : "dark")
                  }
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "grid gap-3 rounded-[24px] border p-3 md:grid-cols-2",
              t.card,
            )}
          >
            <button
              type="button"
              onClick={() => setMode("single")}
              className={cn(
                "rounded-2xl border p-4 text-left transition-all",
                mode === "single" ? t.btnPrimary : t.btn,
              )}
            >
              <div className="flex items-center gap-3">
                <Package2 className="h-5 w-5" />
                <div>
                  <div className="text-[15px] font-black">Single Add</div>
                  <div className="mt-0.5 text-[11px] opacity-80">
                    Product တစ်ခုပြီးတစ်ခု add လုပ်ရန်
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode("bulk")}
              className={cn(
                "rounded-2xl border p-4 text-left transition-all",
                mode === "bulk" ? t.btnPrimary : t.btn,
              )}
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5" />
                <div>
                  <div className="text-[15px] font-black">
                    Product အများကြီး Add
                  </div>
                  <div className="mt-0.5 text-[11px] opacity-80">
                    Table / paste / image path ဖြင့် add လုပ်ရန်
                  </div>
                </div>
              </div>
            </button>
          </motion.div>

          <ProductModuleSelector
            module={productModule}
            onChange={(nextModule) => {
              setProductModule(nextModule);
              setForm((prev) => ({
                ...prev,
                product_type: nextModule,
                category: normalizeCategoryForModule(
                  prev.category,
                  nextModule,
                  categoriesByModule,
                ),
              }));
              setBulkRows((prev) =>
                prev.map((row) => ({
                  ...row,
                  product_type: row.product_type || nextModule,
                  category: normalizeCategoryForModule(
                    row.category,
                    nextModule,
                    categoriesByModule,
                  ),
                })),
              );
            }}
            theme={theme}
            t={t}
          />

          {mode === "single" ? (
            <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={cn("rounded-[24px] border p-6", t.card)}
              >
                <div className={cn("mb-1 text-[22px] font-black", t.text)}>
                  Product Form
                </div>

                <div className={cn("mb-5 text-[13px]", t.textMuted)}>
                  ဒီ form နဲ့ create လုပ်တဲ့ product တွေကို current user / shop
                  owner info နဲ့သိမ်းပါမယ်။
                </div>

                <div className={cn("mb-5 rounded-2xl border p-4", t.aiPanel)}>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={autoFill}
                      disabled={aiFilling}
                      className={cn(
                        "flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-bold transition-all",
                        theme === "dark"
                          ? "bg-gradient-to-r from-[#a07020] to-[#d4a352] text-[#140d05] hover:brightness-110"
                          : "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:brightness-110",
                      )}
                    >
                      {aiFilling ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}

                      {aiFilling ? "Analyzing..." : "Local AI Auto Fill"}
                    </button>

                    <button
                      type="button"
                      onClick={generateBarcodeNow}
                      className={cn(
                        "flex h-9 items-center gap-2 rounded-xl border px-3 text-[12px] font-semibold transition-all",
                        t.btn,
                      )}
                    >
                      <ScanLine className="h-4 w-4" />
                      Barcode Generate
                    </button>

                    <button
                      type="button"
                      onClick={loadCategories}
                      disabled={catLoading}
                      className={cn(
                        "flex h-9 items-center gap-2 rounded-xl border px-3 text-[12px] font-semibold transition-all",
                        t.btn,
                      )}
                    >
                      {catLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Tag className="h-4 w-4" />
                      )}
                      Module Categories
                    </button>
                  </div>

                  <AnimatePresence>
                    {suggestion && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn("text-[12px] font-bold", t.text)}
                            >
                              Local AI Suggestion
                            </span>

                            <Badge
                              className={cn(
                                "border text-[10px] font-bold",
                                CONFIDENCE_COLORS[suggestion.confidence],
                              )}
                            >
                              {suggestion.confidence} confidence
                            </Badge>
                          </div>

                          <button
                            type="button"
                            onClick={applyAIAll}
                            className={cn(
                              "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-all",
                              t.btn,
                            )}
                          >
                            <Wand2 className="h-3 w-3" />
                            Apply All
                          </button>
                        </div>

                        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {[
                            { l: "SKU", v: suggestion.sku },
                            { l: "Category", v: suggestion.category },
                            { l: "Price", v: suggestion.suggested_price },
                            {
                              l: "Barcode",
                              v: suggestion.barcode.slice(0, 10) + "...",
                            },
                          ].map((item) => (
                            <div
                              key={item.l}
                              className={cn(
                                "rounded-xl border p-2",
                                t.previewCard,
                              )}
                            >
                              <div
                                className={cn(
                                  "mb-1 text-[9px] font-bold uppercase tracking-wider",
                                  t.textSubtle,
                                )}
                              >
                                {item.l}
                              </div>

                              <div
                                className={cn(
                                  "truncate text-[11px] font-black",
                                  t.text,
                                )}
                              >
                                {item.v}
                              </div>
                            </div>
                          ))}
                        </div>

                        {suggestion.tags.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-1.5">
                            {suggestion.tags.map((tag) => (
                              <span
                                key={tag}
                                className={cn(
                                  "rounded-full border px-2.5 py-0.5 text-[10px] font-bold",
                                  t.tag,
                                )}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setShowReasoning((v) => !v)}
                          className={cn(
                            "flex items-center gap-1 text-[11px]",
                            t.textSubtle,
                          )}
                        >
                          {showReasoning ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                          Local AI reasoning
                        </button>

                        <AnimatePresence>
                          {showReasoning && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className={cn(
                                "mt-2 rounded-xl border p-3 text-[11px] leading-relaxed",
                                t.previewCard,
                                t.textMuted,
                              )}
                            >
                              {suggestion.reasoning}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {aiError && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-2 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />

                        <div>
                          <div className="text-[11px] font-bold text-rose-400">
                            Local AI error
                          </div>

                          <div className="mt-0.5 text-[10px] text-rose-400/80">
                            {aiError}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label
                        className={cn(
                          "text-[11px] font-bold uppercase tracking-wider",
                          t.textSubtle,
                        )}
                      >
                        SKU / Code
                      </Label>

                      <Input
                        value={form.sku}
                        onChange={(e) => setField("sku", e.target.value)}
                        placeholder="SKU-1001"
                        className={cn("h-10 rounded-xl", t.input)}
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <Label
                        className={cn(
                          "text-[11px] font-bold uppercase tracking-wider",
                          t.textSubtle,
                        )}
                      >
                        Product Name
                      </Label>

                      <Input
                        value={form.product_name}
                        onChange={(e) =>
                          setField("product_name", e.target.value)
                        }
                        placeholder='e.g. "Coca Cola 500ml"'
                        className={cn("h-10 rounded-xl", t.input)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label
                        className={cn(
                          "text-[11px] font-bold uppercase tracking-wider",
                          t.textSubtle,
                        )}
                      >
                        Price
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.product_price}
                        onChange={(e) =>
                          setField("product_price", e.target.value)
                        }
                        placeholder="500"
                        className={cn("h-10 rounded-xl", t.input)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        className={cn(
                          "text-[11px] font-bold uppercase tracking-wider",
                          t.textSubtle,
                        )}
                      >
                        Stock
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={form.product_quantity_amount}
                        onChange={(e) =>
                          setField("product_quantity_amount", e.target.value)
                        }
                        placeholder="50"
                        className={cn("h-10 rounded-xl", t.input)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        className={cn(
                          "text-[11px] font-bold uppercase tracking-wider",
                          t.textSubtle,
                        )}
                      >
                        Discount
                      </Label>

                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.product_discount}
                        onChange={(e) =>
                          setField("product_discount", e.target.value)
                        }
                        placeholder="0"
                        className={cn("h-10 rounded-xl", t.input)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label
                        className={cn(
                          "text-[11px] font-bold uppercase tracking-wider",
                          t.textSubtle,
                        )}
                      >
                        Barcode
                      </Label>

                      <Input
                        value={form.barcode}
                        onChange={(e) => setField("barcode", e.target.value)}
                        placeholder="8852121212333"
                        className={cn("h-10 rounded-xl", t.input)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        className={cn(
                          "text-[11px] font-bold uppercase tracking-wider",
                          t.textSubtle,
                        )}
                      >
                        Category
                      </Label>

                      <Select
                        value={form.category}
                        onValueChange={(v) => setField("category", v)}
                      >
                        <SelectTrigger
                          className={cn("h-10 rounded-xl", t.input)}
                        >
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>

                        <SelectContent>
                          {activeCategories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      className={cn(
                        "text-[11px] font-bold uppercase tracking-wider",
                        t.textSubtle,
                      )}
                    >
                      Note
                    </Label>

                    <Textarea
                      value={form.note}
                      onChange={(e) => setField("note", e.target.value)}
                      rows={4}
                      placeholder="Product description..."
                      className={cn("resize-none rounded-xl", t.input)}
                    />
                  </div>

                  <ProductModuleFields
                    module={productModule}
                    form={form}
                    setField={setField}
                    t={t}
                  />

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={loading}
                      className={cn(
                        "flex h-10 items-center rounded-xl border px-5 text-[13px] font-semibold transition-all",
                        t.btn,
                      )}
                    >
                      Clear
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className={cn(
                        "flex h-10 items-center gap-2 rounded-xl px-5 text-[13px] font-bold transition-all",
                        t.btnPrimary,
                      )}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Package2 className="h-4 w-4" />
                      )}

                      {loading ? "Creating..." : "Create Product"}
                    </button>
                  </div>
                </form>
              </motion.div>

              <div className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className={cn("rounded-[24px] border p-5", t.card)}
                >
                  <div className={cn("mb-1 text-[16px] font-black", t.text)}>
                    Image Upload
                  </div>

                  <div className={cn("mb-4 text-[12px]", t.textMuted)}>
                    drag & drop · square crop
                  </div>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);

                      const f = e.dataTransfer.files?.[0];
                      if (f) applyImage(f);
                    }}
                    className={cn(
                      "flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-6 text-center transition-all",
                      t.imgDrop,
                      dragOver &&
                      (theme === "dark"
                        ? "border-[#c8892a] bg-[rgba(200,137,42,0.08)]"
                        : "border-violet-500 bg-violet-50/50"),
                    )}
                    onClick={() => fileRef.current?.click()}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) applyImage(f);
                      }}
                    />

                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl",
                        t.soft,
                      )}
                    >
                      <Upload className={cn("h-5 w-5", t.textMuted)} />
                    </div>

                    <div>
                      <div className={cn("text-[13px] font-semibold", t.text)}>
                        Drop image here
                      </div>

                      <div className={cn("text-[11px]", t.textSubtle)}>
                        or click to choose
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={cropImage}
                      disabled={!imageFile || cropping}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-xl border py-2 text-[12px] font-semibold transition-all",
                        t.btn,
                      )}
                    >
                      {cropping ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Crop className="h-4 w-4" />
                      )}
                      Crop Square
                    </button>

                    <button
                      type="button"
                      onClick={() => imageFile && applyImage(imageFile)}
                      disabled={!imageFile}
                      className={cn(
                        "flex items-center justify-center rounded-xl border px-3 py-2 transition-all",
                        t.btn,
                      )}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>

                  <div
                    className={cn(
                      "mt-3 flex min-h-[200px] items-center justify-center overflow-hidden rounded-2xl border",
                      t.previewCard,
                    )}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-[280px] w-full object-contain"
                      />
                    ) : (
                      <div
                        className={cn(
                          "flex flex-col items-center gap-2",
                          t.textSubtle,
                        )}
                      >
                        <ImageIcon className="h-10 w-10" />
                        <span className="text-[12px]">No Image</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24 }}
                  className={cn("rounded-[24px] border p-5", t.card)}
                >
                  <div className="mb-4 flex items-center gap-3">
                    {theme === "dark" && (
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          background:
                            "radial-gradient(circle, #fff7cc 0%, #fbbf24 42%, #f59e0b 70%, #b45309 100%)",
                          boxShadow: "0 0 10px rgba(251,191,36,.45)",
                        }}
                      />
                    )}

                    <div className={cn("text-[16px] font-black", t.text)}>
                      Live Preview
                    </div>
                  </div>

                  <div className="mb-3 grid grid-cols-3 gap-2">
                    {[
                      {
                        label: "Price",
                        value: form.product_price || "0",
                        icon: CircleDollarSign,
                      },
                      {
                        label: "Stock",
                        value: form.product_quantity_amount || "0",
                        icon: Boxes,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={cn(
                          "min-w-0 rounded-2xl border p-3",
                          t.previewCard,
                        )}
                      >
                        <div
                          className={cn(
                            "mb-1 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider",
                            t.textSubtle,
                          )}
                        >
                          <item.icon className="h-3 w-3" />
                          {item.label}
                        </div>

                        <div
                          className={cn(
                            "min-w-0 break-words text-[12px] font-black leading-tight",
                            t.text,
                          )}
                        >
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className={cn("mb-3 rounded-2xl border p-4", t.previewCard)}
                  >
                    <div className="flex items-center gap-2">
                      {theme === "dark" && <LanternMark size={18} glow />}

                      <div>
                        <div className={cn("text-[13px] font-black", t.text)}>
                          {form.product_name || "Product Name"}
                        </div>

                        <div className={cn("text-[10px]", t.textSubtle)}>
                          SKU: {form.sku || "—"} ·{" "}
                          {form.category || "UNCATEGORIZED"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                          t.tag,
                        )}
                      >
                        owner: {creatorInfo.username || creatorInfo.id || "—"}
                      </span>

                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                          t.tag,
                        )}
                      >
                        shop:{" "}
                        {creatorInfo.shopCode || creatorInfo.shopId || "—"}
                      </span>
                    </div>

                    {suggestion?.tags?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {suggestion.tags.map((tag) => (
                          <span
                            key={tag}
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                              t.tag,
                            )}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div
                    className={cn(
                      "overflow-x-auto rounded-2xl border p-4",
                      t.previewCard,
                    )}
                  >
                    {form.barcode ? (
                      <svg ref={barcodeSvgRef} />
                    ) : (
                      <div
                        className={cn(
                          "flex items-center gap-2 text-[12px]",
                          t.textSubtle,
                        )}
                      >
                        <ScanLine className="h-4 w-4" />
                        barcode not generated yet
                      </div>
                    )}
                  </div>

                  {suggestion && (
                    <div
                      className={cn(
                        "mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold",
                        CONFIDENCE_COLORS[suggestion.confidence],
                      )}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Local AI filled with {suggestion.confidence} confidence
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={cn("rounded-[24px] border p-6", t.card)}
            >
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className={cn("mb-1 text-[22px] font-black", t.text)}>
                    Product အများကြီး Add
                  </div>
                  <div className={cn("text-[13px]", t.textMuted)}>
                    မူလ design မပျက်အောင် table row, Local AI, image path/preview နှင့် module fields
                    ကို row တစ်ကြောင်းချင်းစီတွင် ထည့်ထားပါတယ်။
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={localAIFillAllBulkRows}
                    disabled={bulkAiFilling}
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-xl border px-4 text-[12px] font-semibold transition-all",
                      t.btn,
                    )}
                  >
                    {bulkAiFilling ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                    AI Fill Rows
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setBulkRows((prev) => [...prev, makeBulkRow()])
                    }
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-xl border px-4 text-[12px] font-semibold transition-all",
                      t.btn,
                    )}
                  >
                    <Plus className="h-4 w-4" />
                    Add Row
                  </button>

                  <button
                    type="button"
                    onClick={submitBulk}
                    disabled={bulkSaving}
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-xl px-5 text-[13px] font-bold transition-all",
                      t.btnPrimary,
                    )}
                  >
                    {bulkSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UploadCloud className="h-4 w-4" />
                    )}
                    Submit All
                  </button>
                </div>
              </div>

              <div className={cn("mb-5 rounded-2xl border p-4", t.aiPanel)}>
                <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className={cn("text-[13px] font-black", t.text)}>
                      Paste products
                    </div>
                    <div className={cn("mt-0.5 text-[11px]", t.textMuted)}>
                      Format: SKU, Name, Price, Stock, Barcode, Category, Type,
                      Discount, Image, Note
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await copyBulkSample();
                        toast.success("Sample copied ✅");
                      }}
                      className={cn(
                        "flex h-9 items-center gap-2 rounded-xl border px-3 text-[12px] font-semibold transition-all",
                        t.btn,
                      )}
                    >
                      <Copy className="h-4 w-4" />
                      Copy Sample
                    </button>

                    <button
                      type="button"
                      onClick={applyBulkPaste}
                      className={cn(
                        "flex h-9 items-center gap-2 rounded-xl border px-3 text-[12px] font-semibold transition-all",
                        t.btn,
                      )}
                    >
                      <ClipboardList className="h-4 w-4" />
                      Apply Paste
                    </button>
                  </div>
                </div>

                <Textarea
                  value={bulkPaste}
                  onChange={(e) => setBulkPaste(e.target.value)}
                  rows={4}
                  placeholder="SKU, Name, Price, Stock, Barcode, Category, Module, Discount, Image, Note, Brand, Color, Size, Gender, Season, SaleType, Unit, Cost, Expiry, Supplier"
                  className={cn("resize-none rounded-xl", t.input)}
                />
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[2080px] border-collapse text-left">
                  <thead>
                    <tr
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        t.textSubtle,
                      )}
                    >
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Image</th>
                      <th className="px-3 py-3">SKU</th>
                      <th className="px-3 py-3">Name</th>
                      <th className="px-3 py-3">Price</th>
                      <th className="px-3 py-3">Stock</th>
                      <th className="px-3 py-3">Barcode</th>
                      <th className="px-3 py-3">Category</th>
                      <th className="px-3 py-3">Module</th>
                      <th className="px-3 py-3">Module Fields</th>
                      <th className="px-3 py-3">Discount</th>
                      <th className="px-3 py-3">Note</th>
                      <th className="px-3 py-3 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody
                    className={cn(
                      "divide-y",
                      theme === "dark"
                        ? "divide-white/[0.06]"
                        : "divide-slate-100",
                    )}
                  >
                    {bulkRows.map((row, index) => {
                      const imagePreview =
                        row.image_preview ||
                        buildImagePreviewUrl(row.image_path);

                      return (
                        <tr key={row.rowId}>
                          <td className="px-3 py-3 align-top">
                            {row.status === "saving" ? (
                              <Badge className="border border-blue-500/20 bg-blue-500/10 text-blue-400">
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />{" "}
                                Saving
                              </Badge>
                            ) : row.status === "success" ? (
                              <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                                Saved
                              </Badge>
                            ) : row.status === "error" ? (
                              <Badge
                                title={row.error || ""}
                                className="border border-rose-500/20 bg-rose-500/10 text-rose-400"
                              >
                                Error
                              </Badge>
                            ) : row.suggestion ? (
                              <Badge
                                className={cn(
                                  "border text-[10px] font-bold",
                                  CONFIDENCE_COLORS[row.suggestion.confidence],
                                )}
                              >
                                AI {row.suggestion.confidence}
                              </Badge>
                            ) : (
                              <Badge className={cn("border", t.pill)}>
                                #{index + 1}
                              </Badge>
                            )}
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="flex min-w-[260px] items-center gap-2">
                              <div
                                className={cn(
                                  "grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border",
                                  t.previewCard,
                                )}
                              >
                                {imagePreview ? (
                                  <img
                                    src={imagePreview}
                                    alt="product"
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon
                                    className={cn("h-4 w-4", t.textSubtle)}
                                  />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <label
                                  className={cn(
                                    "flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 text-[11px] font-bold transition-all",
                                    t.btn,
                                  )}
                                >
                                  <Upload className="h-4 w-4" />
                                  {row.image_file
                                    ? "Change Image"
                                    : "Choose Image"}
                                  <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={(e) => {
                                      applyBulkImage(
                                        row.rowId,
                                        e.target.files?.[0] || null,
                                      );
                                      e.currentTarget.value = "";
                                    }}
                                  />
                                </label>

                                {row.image_file ? (
                                  <div
                                    className={cn(
                                      "mt-1 truncate text-[10px]",
                                      t.textSubtle,
                                    )}
                                  >
                                    {row.image_file.name}
                                  </div>
                                ) : (
                                  <Input
                                    value={row.image_path}
                                    onChange={(e) =>
                                      setBulkField(
                                        row.rowId,
                                        "image_path",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="optional image path"
                                    className={cn(
                                      "mt-1 h-8 rounded-xl text-[11px]",
                                      t.input,
                                    )}
                                  />
                                )}
                              </div>

                              {(row.image_file || row.image_path) && (
                                <button
                                  type="button"
                                  onClick={() => clearBulkImage(row.rowId)}
                                  className={cn(
                                    "grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition-all",
                                    theme === "dark"
                                      ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                                      : "border-rose-200 bg-rose-50 text-rose-600",
                                  )}
                                  title="Remove image"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <Input
                              value={row.sku}
                              onChange={(e) =>
                                setBulkField(row.rowId, "sku", e.target.value)
                              }
                              className={cn(
                                "h-10 min-w-[130px] rounded-xl",
                                t.input,
                              )}
                            />
                          </td>

                          <td className="px-3 py-3 align-top">
                            <Input
                              value={row.product_name}
                              onChange={(e) =>
                                setBulkField(
                                  row.rowId,
                                  "product_name",
                                  e.target.value,
                                )
                              }
                              placeholder="Product name"
                              className={cn(
                                "h-10 min-w-[230px] rounded-xl",
                                t.input,
                              )}
                            />
                          </td>

                          <td className="px-3 py-3 align-top">
                            <Input
                              type="number"
                              value={row.product_price}
                              onChange={(e) =>
                                setBulkField(
                                  row.rowId,
                                  "product_price",
                                  e.target.value,
                                )
                              }
                              className={cn(
                                "h-10 min-w-[110px] rounded-xl",
                                t.input,
                              )}
                            />
                          </td>

                          <td className="px-3 py-3 align-top">
                            <Input
                              type="number"
                              value={row.product_quantity_amount}
                              onChange={(e) =>
                                setBulkField(
                                  row.rowId,
                                  "product_quantity_amount",
                                  e.target.value,
                                )
                              }
                              className={cn(
                                "h-10 min-w-[95px] rounded-xl",
                                t.input,
                              )}
                            />
                          </td>

                          <td className="px-3 py-3 align-top">
                            <Input
                              value={row.barcode}
                              onChange={(e) =>
                                setBulkField(
                                  row.rowId,
                                  "barcode",
                                  e.target.value,
                                )
                              }
                              className={cn(
                                "h-10 min-w-[155px] rounded-xl",
                                t.input,
                              )}
                            />
                          </td>

                          <td className="px-3 py-3 align-top">
                            <Select
                              value={row.category}
                              onValueChange={(v) =>
                                setBulkField(row.rowId, "category", v)
                              }
                            >
                              <SelectTrigger
                                className={cn(
                                  "h-10 min-w-[150px] rounded-xl",
                                  t.input,
                                )}
                              >
                                <SelectValue placeholder="Category" />
                              </SelectTrigger>
                              <SelectContent>
                                {getCategoryOptions(
                                  categoriesByModule,
                                  normalizeProductModule(row.product_type || productModule),
                                ).map((cat) => (
                                  <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <Select
                              value={row.product_type || productModule}
                              onValueChange={(v) =>
                                setBulkRowModule(row.rowId, v as ProductBusinessModule)
                              }
                            >
                              <SelectTrigger className={cn("h-10 min-w-[150px] rounded-xl", t.input)}>
                                <SelectValue placeholder="Module" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SUPERMARKET">SUPERMARKET</SelectItem>
                                <SelectItem value="RESTAURANT">RESTAURANT</SelectItem>
                                <SelectItem value="FASHION">FASHION</SelectItem>
                                <SelectItem value="FRUIT">FRUIT</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>

                          <td className="px-3 py-3 align-top">
                            {normalizeProductModule(row.product_type || productModule) === "RESTAURANT" ? (
                              <label className={cn("flex min-w-[250px] items-center gap-2 rounded-xl border px-3 py-2 text-[12px] font-bold", t.previewCard)}>
                                <input
                                  type="checkbox"
                                  checked={row.kitchen_item}
                                  onChange={(e) =>
                                    setBulkField(row.rowId, "kitchen_item", e.target.checked)
                                  }
                                />
                                Kitchen item
                              </label>
                            ) : normalizeProductModule(row.product_type || productModule) === "FASHION" ? (
                              <div className="grid min-w-[430px] grid-cols-3 gap-2">
                                <Input
                                  value={row.brand}
                                  onChange={(e) => setBulkField(row.rowId, "brand", e.target.value)}
                                  placeholder="Brand"
                                  className={cn("h-10 rounded-xl", t.input)}
                                />
                                <Input
                                  value={row.color}
                                  onChange={(e) => setBulkField(row.rowId, "color", e.target.value)}
                                  placeholder="Color"
                                  className={cn("h-10 rounded-xl", t.input)}
                                />
                                <Input
                                  value={row.size}
                                  onChange={(e) => setBulkField(row.rowId, "size", e.target.value)}
                                  placeholder="Size"
                                  className={cn("h-10 rounded-xl", t.input)}
                                />
                                <Input
                                  value={row.gender}
                                  onChange={(e) => setBulkField(row.rowId, "gender", e.target.value)}
                                  placeholder="Gender"
                                  className={cn("h-10 rounded-xl", t.input)}
                                />
                                <Input
                                  value={row.season}
                                  onChange={(e) => setBulkField(row.rowId, "season", e.target.value)}
                                  placeholder="Season"
                                  className={cn("h-10 rounded-xl", t.input)}
                                />
                              </div>
                            ) : normalizeProductModule(row.product_type || productModule) === "FRUIT" ? (
                              <div className="grid min-w-[560px] grid-cols-5 gap-2">
                                <Select
                                  value={row.sale_type}
                                  onValueChange={(v) =>
                                    setBulkField(row.rowId, "sale_type", v as ProductForm["sale_type"])
                                  }
                                >
                                  <SelectTrigger className={cn("h-10 rounded-xl", t.input)}>
                                    <SelectValue placeholder="Sale" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="WEIGHT">WEIGHT</SelectItem>
                                    <SelectItem value="PIECE">PIECE</SelectItem>
                                    <SelectItem value="PACK">PACK</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Select
                                  value={row.unit}
                                  onValueChange={(v) =>
                                    setBulkField(row.rowId, "unit", v as ProductForm["unit"])
                                  }
                                >
                                  <SelectTrigger className={cn("h-10 rounded-xl", t.input)}>
                                    <SelectValue placeholder="Unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="kg">kg</SelectItem>
                                    <SelectItem value="g">g</SelectItem>
                                    <SelectItem value="viss">viss</SelectItem>
                                    <SelectItem value="piece">piece</SelectItem>
                                    <SelectItem value="pack">pack</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="number"
                                  value={row.cost_price}
                                  onChange={(e) => setBulkField(row.rowId, "cost_price", e.target.value)}
                                  placeholder="Cost"
                                  className={cn("h-10 rounded-xl", t.input)}
                                />
                                <Input
                                  type="date"
                                  value={row.expiry_date}
                                  onChange={(e) => setBulkField(row.rowId, "expiry_date", e.target.value)}
                                  className={cn("h-10 rounded-xl", t.input)}
                                />
                                <Input
                                  value={row.supplier_name}
                                  onChange={(e) => setBulkField(row.rowId, "supplier_name", e.target.value)}
                                  placeholder="Supplier"
                                  className={cn("h-10 rounded-xl", t.input)}
                                />
                              </div>
                            ) : (
                              <div className={cn("min-w-[250px] rounded-xl border px-3 py-2 text-[11px] font-bold", t.previewCard, t.textMuted)}>
                                Supermarket default fields
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-3 align-top">
                            <Input
                              type="number"
                              value={row.product_discount}
                              onChange={(e) =>
                                setBulkField(
                                  row.rowId,
                                  "product_discount",
                                  e.target.value,
                                )
                              }
                              className={cn(
                                "h-10 min-w-[100px] rounded-xl",
                                t.input,
                              )}
                            />
                          </td>

                          <td className="px-3 py-3 align-top">
                            <Input
                              value={row.note}
                              onChange={(e) =>
                                setBulkField(row.rowId, "note", e.target.value)
                              }
                              className={cn(
                                "h-10 min-w-[220px] rounded-xl",
                                t.input,
                              )}
                            />
                          </td>

                          <td className="px-3 py-3 text-right align-top">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => localAIFillBulkRow(row.rowId)}
                                className={cn(
                                  "rounded-xl border px-3 py-2 text-[12px] font-semibold",
                                  t.btn,
                                )}
                              >
                                <Bot className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (row.image_preview)
                                    URL.revokeObjectURL(row.image_preview);

                                  setBulkRows((prev) =>
                                    prev.length <= 1
                                      ? [makeBulkRow()]
                                      : prev.filter(
                                        (item) => item.rowId !== row.rowId,
                                      ),
                                  );
                                }}
                                className={cn(
                                  "rounded-xl border px-3 py-2 text-[12px] font-semibold",
                                  theme === "dark"
                                    ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                                    : "border-rose-200 bg-rose-50 text-rose-600",
                                )}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
