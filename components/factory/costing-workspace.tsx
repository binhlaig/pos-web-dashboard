"use client";
import { usePathname, useRouter } from "next/navigation";
import { costingVoiceQuestion } from "@/lib/costing-voice-questions";
import { useCostingVoice } from "@/lib/use-costing-voice";
import toast, { Toaster } from "react-hot-toast";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useId,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  CostingApiError,
  costingRequest as costingDelete,
  decodeSheet,
  sheetRequest,
  listCostings,
  savePayload,
  photoUrl,
  syncPhotos,
  numericFields,
  type CostingSheet,
  type CostingResult,
  type CostingList,
} from "@/lib/costing-api";
import { Button } from "@/components/ui/button";
import { ProductCameraCapture } from "@/components/customUI/product-camera-capture";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import {
  Volume2,
  VolumeX,
  Sparkles,
  MessageSquare,
  Send,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Copy,
  Plus,
  Search,
  Trash2,
  Info,
  Package,
  Printer,
  RotateCcw,
  Save,
  ShoppingCart,
  TrendingUp,
  Upload,
  Camera,
  ImagePlus,
  Loader2,
  X,
  Settings2,
} from "lucide-react";

type PricingMode = "margin" | "price";
type Basis = "margin" | "markup";
type ProductType =
  "WEIGHT" | "BOTTLED_DRINK" | "PACKAGED_SNACK" | "VOLUME" | "COUNT";
const productTypes: { value: ProductType; label: string }[] = [
  { value: "WEIGHT", label: "အသား၊ ဟင်းသီးဟင်းရွက် — kg → g" },
  { value: "BOTTLED_DRINK", label: "အချိုရည်၊ ရေဘူး — ကတ် → ဘူး" },
  { value: "PACKAGED_SNACK", label: "မုန့်၊ အသင့်ထုပ်ပစ္စည်း — ပုံး → ထုပ်" },
  { value: "VOLUME", label: "ဆီ၊ အရည်အလွတ် — L → ml" },
  { value: "COUNT", label: "အခြားပစ္စည်း — အရေအတွက်ဖြင့်" },
];
// UI-only choice. Persist using existing COUNT inputs in exact whole kyattha.
// No kg conversion or new backend enum is introduced.
type CostingTypeChoice = ProductType | "VISS";
const costingTypeChoices: {value: CostingTypeChoice; label: string}[] = [
  {value: "VISS", label: "ပိဿာ / ကျပ်သား — မြန်မာအလေးချိန်"}, ...productTypes,
];
function isViss(inputs: Inputs) {
  return inputs.productType === "COUNT" && inputs.containerName === "ပိဿာ" &&
    inputs.unitName === "ကျပ်သား" && inputs.unitsPerContainer === "100";
}
function selectedCostingType(inputs: Inputs): CostingTypeChoice {
  return isViss(inputs) ? "VISS" : inputs.productType;
}
function selectCostingType(current: Inputs, choice: CostingTypeChoice): Inputs {
  const viss = choice === "VISS", productType = viss ? "COUNT" : choice;
  const count = isCountType(productType);
  return {...current, productType,weightKg:"1",lossKg:"0",containers:"1",
    unitsPerContainer:viss ? "100" : "",packGrams:viss ? "25" : count ? "1" : "1000",
    purchasePriceMode:count ? "container" : "total",purchase:"",sellingPrice:"",packaging:"0",processing:"0",
    containerName:viss ? "ပိဿာ" : productType === "PACKAGED_SNACK" ? "ပုံး" : "ကတ်",
    unitName:viss ? "ကျပ်သား" : productType === "PACKAGED_SNACK" ? "ထုပ်" : productType === "COUNT" ? "ခု" : "ဘူး"};
}
function isCountType(type: ProductType) {
  return (
    type === "BOTTLED_DRINK" || type === "PACKAGED_SNACK" || type === "COUNT"
  );
}
function quantityUnits(inputs: Inputs) {
  const count = isCountType(inputs.productType);
  return {
    count,
    large: count
      ? inputs.unitName
      : inputs.productType === "VOLUME"
        ? "L"
        : "kg",
    small: count
      ? inputs.unitName
      : inputs.productType === "VOLUME"
        ? "ml"
        : "g",
    divisor: count ? 1 : 1000,
    sale: isViss(inputs) ? "ထုပ်" : count
      ? Number(inputs.packGrams) === 1
        ? inputs.unitName
        : "တွဲ"
      : inputs.productType === "VOLUME"
        ? "ဘူး"
        : "ထုပ်",
  };
}
type Inputs = {
  originalImage?: string;
  packedImage?: string;
  productType: ProductType;
  containers: string;
  unitsPerContainer: string;
  containerName: string;
  unitName: string;
  purchasePriceMode: "total" | "container";
  product: string;
  weightKg: string;
  purchase: string;
  processing: string;
  lossKg: string;
  packGrams: string;
  packaging: string;
  sellingPrice: string;
  targetPercent: string;
  minimumMargin: string;
  discount: string;
  rounding: string;
  mode: PricingMode;
  basis: Basis;
};
const initial: Inputs = {
  originalImage: "",
  packedImage: "",
  productType: "COUNT",
  containers: "1",
  unitsPerContainer: "100",
  containerName: "ပိဿာ",
  unitName: "ကျပ်သား",
  purchasePriceMode: "container",
  product: "",
  weightKg: "1",
  purchase: "",
  processing: "0",
  lossKg: "0",
  packGrams: "25",
  packaging: "0",
  sellingPrice: "",
  targetPercent: "20",
  minimumMargin: "15",
  discount: "0",
  rounding: "100",
  mode: "margin",
  basis: "margin",
};
const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});
const inputClass =
  "h-11 w-full min-w-0 rounded-xl border-slate-200 bg-white px-3 text-base font-medium tabular-nums shadow-none focus-visible:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const draftSchema = z
  .object({
    productType: z.enum([
      "WEIGHT",
      "BOTTLED_DRINK",
      "PACKAGED_SNACK",
      "VOLUME",
      "COUNT",
    ]),
    containers: z.string(),
    unitsPerContainer: z.string(),
    containerName: z.string().max(200),
    unitName: z.string().max(200),
    purchasePriceMode: z.enum(["total", "container"]),
    product: z.string().max(200, "အမည် စာလုံး ၂၀၀ အထိသာ ဖြည့်ပါ။"),
    weightKg: z.string(),
    purchase: z.string(),
    processing: z.string(),
    lossKg: z.string(),
    packGrams: z.string(),
    packaging: z.string(),
    sellingPrice: z.string(),
    targetPercent: z.string(),
    minimumMargin: z.string(),
    discount: z.string(),
    rounding: z.string(),
    mode: z.enum(["margin", "price"]),
    basis: z.enum(["margin", "markup"]),
    originalImage: z.string().optional(),
    packedImage: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    for (const key of numericFields) {
      const raw = v[key].trim();
      if (!raw) continue;
      const n = Number(raw);
      if (
        !Number.isFinite(n) ||
        n < 0 ||
        n > 1e12 ||
        !/^\d+(?:\.\d{1,6})?$/.test(raw)
      ) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message:
            "0 မှ 1,000,000,000,000 အတွင်း ကိန်းဂဏန်းကို ဒဿမ ၆ နေရာအထိ ဖြည့်ပါ။",
        });
        continue;
      }
      if (
        ["containers", "unitsPerContainer", "packGrams"].includes(key) &&
        (n <= 0 || !Number.isInteger(n))
      )
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "0 ထက်ကြီးသော အပြည့်ကိန်း ဖြည့်ပါ။",
        });
      if (
        key === "weightKg" &&
        (n <= 0 || (raw.split(".")[1]?.length || 0) > 3)
      )
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "kg / L ကို 0 ထက်ကြီးပြီး ဒဿမ ၃ နေရာအထိ ဖြည့်ပါ။",
        });
      if (
        key === "lossKg" &&
        ((isCountType(v.productType) && !Number.isInteger(n)) ||
          (!isCountType(v.productType) && (raw.split(".")[1]?.length || 0) > 3))
      )
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "အလျော့ပမာဏ၏ ယူနစ်နှင့် ဒဿမကို စစ်ပါ။",
        });
      if (
        (["discount", "minimumMargin"].includes(key) ||
          (key === "targetPercent" && v.basis === "margin")) &&
        n >= 100
      )
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "100% ထက်နည်းရပါမည်။",
        });
    }
    if (v.mode === "margin" && v.rounding.trim() && Number(v.rounding) <= 0)
      ctx.addIssue({
        code: "custom",
        path: ["rounding"],
        message:
          "အကြံပြုဈေးတွက်ရန် ဈေးဝိုင်းယူနစ် 1 သို့မဟုတ် ပိုကြီးသောတန်ဖိုး ရွေးပါ။",
      });
    const count = isCountType(v.productType);
    const q = count
      ? v.containers.trim() && v.unitsPerContainer.trim()
        ? Number(v.containers) * Number(v.unitsPerContainer)
        : null
      : v.weightKg.trim()
        ? Number(v.weightKg)
        : null;
    if (q !== null && v.lossKg.trim() && Number(v.lossKg) >= q)
      ctx.addIssue({
        code: "custom",
        path: ["lossKg"],
        message: "အလျော့သည် ဝယ်ယူပမာဏထက် နည်းရပါမည်။",
      });
  });
function sheetMoney(code: string, value: number) {
  const amount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: code === "JPY" || code === "MMK" ? 0 : 2,
  }).format(value);
  return code === "JPY"
    ? `¥${amount}`
    : code === "MMK"
      ? `${amount} ကျပ်`
      : `${amount}${code ? ` ${code}` : ""}`;
}
// Empty discount is a valid intermediate edit (for example 10 -> empty -> 0).
// Keep the input text untouched until blur; use zero for preview and persistence.
function normalizeDiscount(inputs: Inputs): Inputs {
  return inputs.discount.trim() ? inputs : { ...inputs, discount: "0" };
}
// Pure calculation helper. Monetary calculations keep full precision until display.
function calculatePacking(inputs: Inputs) {
  inputs = normalizeDiscount(inputs);
  const count = isCountType(inputs.productType);
  if (!inputs.product.trim()) return { error: "ပစ္စည်းအမည် ဖြည့်ပါ။" };
  if (inputs.mode === "margin" && Number(inputs.rounding) <= 0)
    return {
      error: "အကြံပြုဈေးတွက်ရန် ဈေးဝိုင်းယူနစ် 1 သို့မဟုတ် အထက်ရွေးပါ။",
    };
  const numericKeys = [
    "weightKg",
    "containers",
    "unitsPerContainer",
    "purchase",
    "processing",
    "lossKg",
    "packGrams",
    "packaging",
    "sellingPrice",
    "targetPercent",
    "minimumMargin",
    "discount",
    "rounding",
  ] as const;
  const values = {} as Record<(typeof numericKeys)[number], number>;
  for (const key of numericKeys) {
    const inactive =
      (count && key === "weightKg") ||
      (!count && (key === "containers" || key === "unitsPerContainer")) ||
      (inputs.mode === "margin" && key === "sellingPrice") ||
      (inputs.mode === "price" && key === "targetPercent");
    if (inactive) {
      values[key] = 0;
      continue;
    }
    if (
      key === "rounding" &&
      inputs.mode === "price" &&
      !inputs.rounding.trim()
    ) {
      values[key] = 0;
      continue;
    }
    if (!inputs[key].trim())
      return { error: "ကိန်းဂဏန်းဖြည့်ရန် ကျန်နေပါသည်။" };
    values[key] = Number(inputs[key]);
    if (!Number.isFinite(values[key]) || values[key] < 0 || values[key] > 1e12)
      return { error: "အနုတ်မဟုတ်သော သင့်တော်သည့်ကိန်းဂဏန်းကို ဖြည့်ပါ။" };
  }
  const v = values;
  if (
    count &&
    (!Number.isInteger(v.containers) ||
      !Number.isInteger(v.unitsPerContainer) ||
      !Number.isInteger(v.lossKg))
  ) {
    return {
      error:
        "ကတ်/ပုံးအရေအတွက်၊ တစ်ကတ်ပါအရေအတွက်နှင့် ပျက်စီးပမာဏကို အပြည့်ကိန်းဖြင့် ဖြည့်ပါ။",
    };
  }
  if (count && (v.containers <= 0 || v.unitsPerContainer <= 0))
    return {
      error: "ဝယ်ယူကတ်/ပုံးနှင့် တစ်ကတ်/ပုံးပါအရေအတွက်သည် 0 ထက်ကြီးရပါမည်။",
    };
  if (!count && v.weightKg <= 0)
    return { error: "ဝယ်ယူပမာဏသည် 0 ထက်ကြီးရပါမည်။" };
  if (
    !count &&
    (Math.abs(v.weightKg * 1000 - Math.round(v.weightKg * 1000)) > 1e-6 ||
      Math.abs(v.lossKg * 1000 - Math.round(v.lossKg * 1000)) > 1e-6)
  )
    return { error: "kg / L ကို ဒဿမ 3 နေရာအထိသာ ဖြည့်ပါ။" };
  const purchasedBase = count
    ? v.containers * v.unitsPerContainer
    : Math.round(v.weightKg * 1000);
  const lossBase = count ? v.lossKg : Math.round(v.lossKg * 1000);
  if (!Number.isSafeInteger(purchasedBase))
    return { error: "စုစုပေါင်းပမာဏ များလွန်းနေပါသည်။" };
  if (!Number.isInteger(v.packGrams) || v.packGrams < 1)
    return {
      error: "တစ်ရောင်းယူနစ်ပါပမာဏကို 1 နှင့်အထက် အပြည့်ကိန်းဖြင့် ဖြည့်ပါ။",
    };
  if (purchasedBase < 1 || lossBase >= purchasedBase)
    return { error: "အလျော့/ပျက်စီးပမာဏသည် ဝယ်ယူပမာဏထက် နည်းရပါမည်။" };
  if (v.discount >= 100 || v.minimumMargin >= 100)
    return { error: "လျှော့ဈေးနှင့် အနည်းဆုံး Margin သည် 100% ထက်နည်းရပါမည်။" };
  if (
    inputs.mode === "margin" &&
    inputs.basis === "margin" &&
    v.targetPercent >= 100
  )
    return { error: "လိုချင်သော Margin သည် 100% ထက်နည်းရပါမည်။" };
  const usableBase = purchasedBase - lossBase;
  const packs = Math.floor(usableBase / v.packGrams);
  if (packs < 1)
    return {
      error: "လက်ရှိပမာဏဖြင့် ရောင်းယူနစ်တစ်ခု ပြည့်အောင် မခွဲနိုင်ပါ။",
    };
  const packedBase = packs * v.packGrams;
  const remainderBase = usableBase - packedBase;
  const purchaseTotal =
    count && inputs.purchasePriceMode === "container"
      ? v.purchase * v.containers
      : v.purchase;
  const materialCost = purchaseTotal + v.processing;
  const packedMaterialCost = (materialCost * packedBase) / usableBase;
  const remainderValue = materialCost - packedMaterialCost;
  const packagingCost = packs * v.packaging;
  const packedCost = packedMaterialCost + packagingCost;
  const costPerPack = packedCost / packs;
  const roundUp = (value: number) =>
    v.rounding > 0
      ? Math.ceil((value - 1e-9) / v.rounding) * v.rounding
      : value;
  const suggestedPrice =
    inputs.basis === "margin"
      ? costPerPack / (1 - v.targetPercent / 100)
      : costPerPack * (1 + v.targetPercent / 100);
  const price =
    inputs.mode === "margin" ? roundUp(suggestedPrice) : v.sellingPrice;
  const actualPrice = price * (1 - v.discount / 100);
  const marginOf = (p: number) =>
    p > 0 ? ((p - costPerPack) / p) * 100 : null;
  const margin = marginOf(price);
  const actualMargin = marginOf(actualPrice);
  const minimumPrice = costPerPack / (1 - v.minimumMargin / 100);
  const minimumListPrice =
    costPerPack / ((1 - v.minimumMargin / 100) * (1 - v.discount / 100));
  const revenue = price * packs;
  const actualRevenue = actualPrice * packs;
  return {
    error: null,
    packs,
    purchasedBase,
    usableBase,
    remainderBase,
    remainderValue,
    packagingCost,
    purchaseTotal,
    materialCost,
    packedCost,
    costPerPack,
    price,
    suggestedPrice,
    margin,
    actualPrice,
    actualMargin,
    minimumPrice,
    minimumListPrice,
    revenue,
    actualRevenue,
    totalProfit: revenue - packedCost,
    actualProfit: actualRevenue - packedCost,
    profitPerPack: price - costPerPack,
    actualProfitPerPack: actualPrice - costPerPack,
    cashOutlay: materialCost + packagingCost,
    comparison: [15, 20, 25].map((target) => {
      const sale = roundUp(costPerPack / (1 - target / 100));
      return { target, price: sale, margin: marginOf(sale) };
    }),
  };
}

function Field({
  name,
  label,
  value,
  onChange,
  unit,
  step = "any",
  max,
}: {
  name: keyof Inputs;
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  step?: string;
  max?: number;
}) {
  const form = useFormContext<Inputs>();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="min-w-0 gap-1.5">
          <FormLabel className="text-[12px] leading-6 text-slate-600 dark:text-slate-300">
            {label}
          </FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                {...field}
                type="number"
                inputMode="decimal"
                min={0}
                max={max}
                step={step}
                value={value}
                onBlur={() => {
                  field.onBlur();
                  if (name === "discount" && !value.trim()) {
                    field.onChange("0");
                    onChange("0");
                  }
                }}
                onChange={(event) => {
                  field.onChange(event.target.value);
                  onChange(event.target.value);
                }}
                className={`${inputClass} ${unit ? "pr-14" : ""}`}
              />
            </FormControl>
            {unit && (
              <span className="pointer-events-none absolute inset-y-0 right-3 flex max-w-12 items-center truncate text-[11px] text-slate-400">
                {unit}
              </span>
            )}
          </div>
          <FormMessage className="text-[10px] leading-5" />
        </FormItem>
      )}
    />
  );
}
function Row({
  label,
  children,
  strong = false,
}: {
  label: string;
  children: ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 text-xs leading-6">
      <span className="min-w-0 text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span
        className={`shrink-0 text-right tabular-nums ${strong ? "font-bold text-slate-950 dark:text-white" : "font-medium"}`}
      >
        {children}
      </span>
    </div>
  );
}
function SelectField({
  label,
  children,
  name,
  ...props
}: { label: string; children: ReactNode; name: keyof Inputs } & Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "name"
>) {
  const form = useFormContext<Inputs>();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="min-w-0 gap-1.5">
          <FormLabel className="text-[12px] leading-6 text-slate-600 dark:text-slate-300">
            {label}
          </FormLabel>
          <FormControl>
            <select
              {...field}
              {...props}
              value={props.value ?? field.value ?? ""}
              onBlur={(event) => {
                field.onBlur();
                props.onBlur?.(event);
              }}
              onChange={(event) => {
                field.onChange(name === "productType" && event.target.value === "VISS" ? "COUNT" : event.target.value);
                props.onChange?.(event);
              }}
              className={`${inputClass} appearance-auto pr-2`}
            >
              {children}
            </select>
          </FormControl>
          <FormMessage className="text-[10px] leading-5" />
        </FormItem>
      )}
    />
  );
}
function GroupTitle({
  number,
  title,
  note,
}: {
  number: string;
  title: string;
  note?: string;
}) {
  return (
    <div className="mb-3 flex items-start gap-2.5">
      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
        {number}
      </span>
      <div>
        <h3 className="text-sm font-semibold leading-7">{title}</h3>
        {note && <p className="text-[11px] leading-6 text-slate-400">{note}</p>}
      </div>
    </div>
  );
}

function MarginStatus({
  value,
  minimum,
}: {
  value: number | null | undefined;
  minimum: number;
}) {
  const unknown = value == null;
  const loss = !unknown && value < 0;
  const low = !unknown && !loss && value < minimum;
  const tone = unknown
    ? "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
    : loss
      ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300"
      : low
        ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200"
        : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300";
  return (
    <span
      className={`inline-flex flex-wrap items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs leading-6 ${tone}`}
    >
      <strong className="text-base tabular-nums">
        {unknown ? "—" : `${numberFormat.format(value)}%`}
      </strong>
      <span className="text-[10px]">
        {unknown
          ? "တွက်မရသေး"
          : loss
            ? "အရှုံး"
            : low
              ? "အနည်းဆုံးမပြည့်"
              : "သတ်မှတ်ချက်ပြည့်မီ"}
      </span>
    </span>
  );
}

const IMAGE_LIMIT = 220_000;
function validImage(value: unknown) {
  return (
    value === undefined ||
    value === "" ||
    (typeof value === "string" &&
      /^\/api\/factory\/costings\/[1-9]\d*\/items\/[1-9]\d*\/images\/(ORIGINAL|PACKAGED)\?v=\d+$/.test(
        value,
      )) ||
    (typeof value === "string" &&
      value.length <= IMAGE_LIMIT &&
      /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value))
  );
}

// Store complete drafts in IndexedDB so photos do not fill localStorage's small quota.
async function draftDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("binhlaig-factory-costing", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("drafts");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("ဤ browser တွင် မူကြမ်းသိမ်းရန် မရနိုင်ပါ။"));
    request.onblocked = () =>
      reject(new Error("အခြား Costing tab များကို ပိတ်ပြီး ပြန်စမ်းပါ။"));
  });
}
async function writePhotoDraft(key: string, value: unknown) {
  const db = await draftDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("drafts", "readwrite");
      tx.objectStore("drafts").put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = tx.onabort = () =>
        reject(
          new Error(
            "ပုံနှင့်မူကြမ်း သိမ်းမရပါ။ Browser storage နေရာလွတ်ကို စစ်ပြီး ပြန်စမ်းပါ။",
          ),
        );
    });
  } finally {
    db.close();
  }
}
async function readPhotoDraft(key: string) {
  const db = await draftDatabase();
  try {
    return await new Promise<unknown>((resolve, reject) => {
      const tx = db.transaction("drafts", "readonly");
      const request = tx.objectStore("drafts").get(key);
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = tx.onabort = () =>
        reject(new Error("သိမ်းထားသော မူကြမ်းကို ဖတ်မရပါ။"));
    });
  } finally {
    db.close();
  }
}
async function prepareProductImage(file: File): Promise<string> {
  if (
    ![
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ].includes(file.type) &&
    !(file.type === "" && /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name))
  )
    throw new Error(
      "JPG၊ PNG သို့မဟုတ် WebP ပုံကို ရွေးပါ။ HEIC ပုံဆို JPG သို့ ပြောင်းပြီး ရွေးပါ။",
    );
  if (file.size > 15 * 1024 * 1024)
    throw new Error("ပုံတစ်ပုံကို 15 MB ထက်ငယ်သောဖိုင် ရွေးပါ။");
  const url = URL.createObjectURL(file);
  try {
    const picture = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(new Error("ပုံဖိုင်ကို ဖတ်မရပါ။ အခြားပုံတစ်ပုံ ရွေးပါ။"));
      img.src = url;
    });
    let width = picture.naturalWidth,
      height = picture.naturalHeight;
    if (!width || !height || width * height > 60_000_000)
      throw new Error(
        "ပုံအရွယ်အစား ကြီးလွန်းနေပါသည်။ ပုံကို ချုံ့ပြီး ပြန်ရွေးပါ။",
      );
    const ratio = Math.min(1, 960 / Math.max(width, height));
    width = Math.max(1, Math.round(width * ratio));
    height = Math.max(1, Math.round(height * ratio));
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("ဤ browser တွင် ပုံပြင်ဆင်မရပါ။");
    for (let attempt = 0; attempt < 8; attempt++) {
      canvas.width = width;
      canvas.height = height;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(picture, 0, 0, width, height);
      const data = canvas.toDataURL(
        "image/jpeg",
        Math.max(0.5, 0.82 - attempt * 0.06),
      );
      if (validImage(data)) return data;
      width = Math.max(1, Math.round(width * 0.8));
      height = Math.max(1, Math.round(height * 0.8));
    }
    throw new Error("ပုံကို သိမ်းရန် မချုံ့နိုင်ပါ။ အခြားပုံတစ်ပုံ ရွေးပါ။");
  } finally {
    URL.revokeObjectURL(url);
  }
}
function ProductImageUpload({
  title,
  hint,
  value,
  onChange,
  onBusyChange,
}: {
  title: string;
  hint: string;
  value?: string;
  onChange: (value: string) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const deviceCamera = useRef<HTMLInputElement>(null);
  const processing = useRef(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function choose(file?: File) {
    if (!file || processing.current) return;
    processing.current = true;
    setBusy(true);
    setError("");
    onBusyChange(true);
    try {
      const image = await prepareProductImage(file);
      if (mounted.current) onChange(image);
    } catch (e) {
      if (mounted.current)
        setError(e instanceof Error ? e.message : "ပုံထည့်မရပါ။");
    } finally {
      processing.current = false;
      onBusyChange(false);
      if (mounted.current) setBusy(false);
    }
  }
  useEffect(() => {
    if (!cameraOpen) return;
    onBusyChange(true);
    return () => onBusyChange(false);
    // Balance one busy job per camera session, not per callback identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOpen]);
  return (
    <div className="mt-3 min-w-0">
      <input
        ref={input}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label={title}
        disabled={busy}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void choose(file);
        }}
      />
      <input
        ref={deviceCamera}
        type="file"
        accept="image/*"
        capture="environment"
        aria-label={`${title} Device Camera`}
        disabled={busy}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void choose(file);
        }}
      />
      {cameraOpen && (
        <ProductCameraCapture
          title={title}
          onCapture={(file) => {
            setCameraOpen(false);
            void choose(file);
          }}
          onClose={() => setCameraOpen(false)}
          onFallback={() => {
            deviceCamera.current?.click();
            setCameraOpen(false);
          }}
        />
      )}
      <div className="flex items-start gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          aria-label={`${title} ${value ? "ပြောင်းရန်" : "ထည့်ရန်"}`}
          title={hint}
          className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 transition hover:border-blue-400 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 print:border-solid"
        >
          {value ? (
            <img
              src={value}
              alt={title}
              className="size-full object-contain p-1"
            />
          ) : (
            <span className="flex flex-col items-center gap-1">
              <ImagePlus className="size-6" />
              <span className="text-[10px]">ပုံထည့်ရန်</span>
            </span>
          )}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-white/80 dark:bg-slate-950/80">
              <Loader2 className="size-5 animate-spin text-blue-500" />
            </span>
          )}
        </button>
        <div className="min-w-0 flex-1 py-0.5">
          <p className="text-xs font-semibold leading-6">{title}</p>
          <p className="text-[10px] leading-5 text-slate-500 dark:text-slate-400">
            JPG / PNG / WebP · 15 MB အထိ
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1 print:hidden">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => input.current?.click()}
              className="h-8 rounded-lg px-2 text-[10px]"
            >
              <Upload className="!size-3.5" />
              {busy
                ? "ပြင်ဆင်နေသည်..."
                : value
                  ? "ပုံပြောင်းရန်"
                  : "ပုံရွေးရန်"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setCameraOpen(true)}
              aria-label={`${title} ကင်မရာဖွင့်ရန်`}
              className="h-8 rounded-lg px-2 text-[10px]"
            >
              <Camera className="!size-3.5" />
              ကင်မရာ
            </Button>
            {value && (
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  onChange("");
                  setError("");
                }}
                aria-label={`${title} ဖယ်ရန်`}
                className="size-8 rounded-lg p-0 text-rose-600"
              >
                <X className="!size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <p
        aria-live="polite"
        className="mt-1 text-[10px] leading-5 text-slate-400"
      >
        {busy
          ? "ပုံပြင်ဆင်ပြီးမှ သိမ်းပါ။"
          : "အားလုံးသိမ်း နှိပ်လျှင် ပုံပါ သိမ်းမည်။"}
      </p>
      {error && (
        <p
          role="alert"
          className="mt-1 text-xs leading-6 text-rose-600 dark:text-rose-300"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function serverResult(r: CostingResult): ReturnType<typeof calculatePacking> {
  if (!r.ready) {
    const labels: Record<string, string> = {
      product: "ပစ္စည်းအမည်",
      productType: "ပစ္စည်းအမျိုးအစား",
      purchase: "ဝယ်ဈေး",
      processing: "အပိုကုန်ကျစရိတ်",
      lossKg: "အလျော့ပမာဏ",
      packGrams: "တစ်ရောင်းယူနစ်ပါပမာဏ",
      packaging: "ထုပ်ပိုးခ",
      discount: "လျှော့ဈေး",
      minimumMargin: "အနည်းဆုံး Margin",
      weightKg: "ဝယ်ယူ kg / L",
      containers: "ကတ်/ပုံး အရေအတွက်",
      unitsPerContainer: "တစ်ကတ်/ပုံးပါပမာဏ",
      sellingPrice: "ရောင်းဈေး",
      targetPercent: "ရည်မှန်း အမြတ် %",
      rounding: "ဈေးဝိုင်းယူနစ်",
      mode: "ဈေးတွက်နည်း",
      basis: "အမြတ်တွက်အခြေခံ",
      purchasePriceMode: "ဝယ်ဈေးသတ်မှတ်ပုံ",
    };
    return {
      error:
        r.errors
          .map((e) =>
            e.endsWith(" required")
              ? `${labels[e.replace(" required", "")] || e.replace(" required", "")} ဖြည့်ရန်ကျန်`
              : e === "No complete sale units"
                ? "ရောင်းယူနစ်တစ်ခု ပြည့်အောင် မခွဲနိုင်ပါ။"
                : e,
          )
          .join(" · ") || "အချက်အလက် မပြည့်စုံသေးပါ။",
    };
  }
  const v = r.values,
    cpu = v.costPerUnit!;
  return {
    error: null,
    packs: v.saleUnits!,
    purchasedBase: v.purchasedQuantity!,
    usableBase: v.usableQuantity!,
    remainderBase: v.remainder!,
    remainderValue: v.remainderMaterialCost!,
    packagingCost: v.packagingCost!,
    purchaseTotal: v.purchaseTotal!,
    materialCost: v.materialCost!,
    packedCost: v.packedCost!,
    costPerPack: cpu,
    price: v.price!,
    suggestedPrice: v.price!,
    margin: v.margin,
    actualPrice: v.discountedPrice!,
    actualMargin: v.discountedMargin,
    minimumPrice: v.minimumPrice!,
    minimumListPrice: v.minimumListPrice!,
    revenue: v.revenue!,
    actualRevenue: v.discountedRevenue!,
    totalProfit: v.profit!,
    actualProfit: v.discountedProfit!,
    profitPerPack: v.profitPerUnit!,
    actualProfitPerPack: v.discountedProfitPerUnit!,
    cashOutlay: v.materialCost! + v.packagingCost!,
    comparison: [15, 20, 25].map((target) => {
      const price = v[`margin${target}Price`]!;
      return {
        target,
        price,
        margin: price > 0 ? ((price - cpu) / price) * 100 : null,
      };
    }),
  };
}
function ProductCalculator({
  inputs,
  setInputs,
  onImageBusy,
  readOnly,
  serverCalculation,
  currencyCode,
}: {
  inputs: Inputs;
  setInputs: Dispatch<SetStateAction<Inputs>>;
  onImageBusy: (busy: boolean) => void;
  readOnly: boolean;
  serverCalculation?: CostingResult;
  currencyCode: string;
}) {
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState("purchase");
  const form = useForm<Inputs>({
    resolver: zodResolver(draftSchema),
    values: inputs,
    resetOptions: { keepErrors: true },
    mode: "onChange",
  });
  const result = serverCalculation
    ? serverResult(serverCalculation)
    : calculatePacking(inputs);
  const purchaseResult = calculatePacking({
    ...inputs,
    mode: "price",
    sellingPrice: "0",
    targetPercent: "0",
    discount: "0",
    minimumMargin: "0",
  });
  const units = quantityUnits(inputs);
  const currency = currencyCode;
  const money = (value: number) => sheetMoney(currencyCode, value);
  const percent = (value: number | null | undefined) =>
    value == null ? "—" : `${numberFormat.format(value)}%`;
  const update = <K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };
  const numberField = (
    key: Exclude<
      keyof Inputs,
      | "product"
      | "mode"
      | "basis"
      | "productType"
      | "containerName"
      | "unitName"
      | "purchasePriceMode"
      | "originalImage"
      | "packedImage"
    >,
    label: string,
    unit?: string,
    max?: number,
    step = "any",
  ) => (
    <Field
      name={key}
      label={label}
      value={inputs[key]}
      onChange={(value) => update(key, value)}
      unit={unit}
      max={max}
      step={step}
    />
  );

  function changeProductType(choice: CostingTypeChoice) {
    setInputs(current => selectCostingType(current, choice));
    setNotice(choice === "VISS"
      ? "1 ပိဿာ = 100 ကျပ်သား။ တစ်ပိဿာဝယ်ဈေးနှင့် ခွဲရောင်းမည့် ကျပ်သားကို ဖြည့်ပါ။"
      : "ယူနစ် ပြောင်းထားပါသည်။ ဝယ်ဈေးနှင့် လိုအပ်သောပမာဏကို ပြန်ဖြည့်ပါ။");
  }

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={(event) => event.preventDefault()}
        className="grid min-w-0 items-start gap-4 min-[1000px]:grid-cols-[minmax(0,1fr)_285px] 2xl:grid-cols-[minmax(0,1fr)_320px] print:block"
      >
        <Card className="min-w-0 gap-0 overflow-hidden border-slate-200 bg-white py-0 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted">
                <Package className="size-5 text-muted-foreground" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold">
                  {inputs.product.trim() || "ပစ္စည်းအသစ်"}
                </h2>
                <p className="truncate text-[11px] leading-6 text-muted-foreground">
                  {
                    costingTypeChoices.find(
                      (type) => type.value === selectedCostingType(inputs),
                    )?.label
                  }
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-muted px-2 py-1 text-[10px] text-muted-foreground">
              {readOnly ? "Read only" : "Editing"}
            </span>
          </div>
            <Tabs
              value={tab}
              onValueChange={(value) => setTab(String(value))}
              className="gap-0"
            >
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-5">
                <TabsList
                  aria-label="တွက်ချက်မှုအဆင့်များ"
                  className="grid h-auto min-h-12 w-full grid-cols-2 rounded-xl border-0 bg-slate-100 p-1 dark:bg-slate-800"
                >
                  <TabsTrigger
                    value="purchase"
                    className="min-h-11 whitespace-normal px-2 text-xs leading-6 data-[selected]:bg-white data-[state=active]:bg-white dark:data-[selected]:bg-slate-700 dark:data-[state=active]:bg-slate-700"
                  >
                    <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                      1
                    </span>
                    ဝယ်ယူမှုနှင့် ခွဲရောင်းပုံ
                  </TabsTrigger>
                  <TabsTrigger
                    value="pricing"
                    className="min-h-11 whitespace-normal px-2 text-xs leading-6 data-[selected]:bg-white data-[state=active]:bg-white dark:data-[selected]:bg-slate-700 dark:data-[state=active]:bg-slate-700"
                  >
                    <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                      2
                    </span>
                    ရောင်းဈေးနှင့် အမြတ်
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="purchase" className="m-0 p-4 sm:p-5">
                <fieldset disabled={readOnly} className="min-w-0">
                  <div className="space-y-5">
                    <div>
                      <GroupTitle
                        number="01"
                        title="ပစ္စည်းနှင့် တွက်ချက်ပုံ"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="product"
                          render={({ field }) => (
                            <FormItem className="gap-1.5">
                              <FormLabel className="text-xs leading-6">
                                ပစ္စည်းအမည်
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={inputs.product}
                                  maxLength={200}
                                  placeholder="ဥပမာ — ကြက်သွန်နီ 1 kg"
                                  onChange={(event) => {
                                    field.onChange(event.target.value);
                                    update("product", event.target.value);
                                  }}
                                  className={inputClass}
                                />
                              </FormControl>
                              <FormMessage className="text-[10px]" />
                            </FormItem>
                          )}
                        />
                        <SelectField
                          name="productType"
                          label="ပစ္စည်းအမျိုးအစား"
                          value={selectedCostingType(inputs)}
                          onChange={(event) =>
                            changeProductType(event.target.value as CostingTypeChoice)
                          }
                        >
                          {costingTypeChoices.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </SelectField>
                      </div>
                      <div className="mt-4 rounded-xl border border-border p-3">
                        <p className="text-xs font-semibold">
                          ကုန်ပစ္စည်းဓာတ်ပုံများ
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <ProductImageUpload
                            title="မူလဝယ်ယူသောအထုပ်ပုံ"
                            hint="မပြင်ဆင်ရသေးသော မူလအထုပ်ပုံ"
                            value={inputs.originalImage}
                            onChange={(value) => update("originalImage", value)}
                            onBusyChange={onImageBusy}
                          />
                          <ProductImageUpload
                            title="ထုပ်ပိုးပြီးပစ္စည်းပုံ"
                            hint="ရောင်းချရန်အဆင်သင့်ဖြစ်သော အထုပ်ပုံ"
                            value={inputs.packedImage}
                            onChange={(value) => update("packedImage", value)}
                            onBusyChange={onImageBusy}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                      <GroupTitle
                        number="02"
                        title="ဝယ်ယူပမာဏ"
                        note={
                          units.count
                            ? "ဝယ်လာသော ကတ်/ပုံးမှ ရောင်းနိုင်သော အရေအတွက်ကို တွက်ပါ။"
                            : "ဝယ်ယူပမာဏမှ အလျော့နုတ်ပြီး ခွဲထည့်မည့်ပမာဏကို သတ်မှတ်ပါ။"
                        }
                      />
                      <div className="grid grid-cols-2 gap-3">
                        {units.count ? (
                          <>
                            <SelectField
                              name="containerName"
                              label="ဝယ်ယူရောက်ရှိလာသော ပုံစံ"
                              value={inputs.containerName}
                              onChange={(event) =>
                                update("containerName", event.target.value)
                              }
                            >
                              {["ကတ်", "ပုံး", "အိတ်", "ပါကင်", "ထုပ်ကြီး", "ပိဿာ"].map(
                                (name) => (
                                  <option key={name}>{name}</option>
                                ),
                              )}
                            </SelectField>
                            <SelectField
                              name="unitName"
                              label="ရေတွက်ယူနစ်"
                              value={inputs.unitName}
                              onChange={(event) =>
                                update("unitName", event.target.value)
                              }
                            >
                              {[
                                "ဘူး",
                                "ထုပ်",
                                "ခု",
                                "ချောင်း",
                                "လုံး",
                                "စုံ",
                                "ကျပ်သား",
                              ].map((name) => (
                                <option key={name}>{name}</option>
                              ))}
                            </SelectField>
                            {numberField(
                              "containers",
                              `ဝယ်ယူသော ${inputs.containerName}`,
                              inputs.containerName,
                              undefined,
                              "1",
                            )}
                            {isViss(inputs) ? <p className="self-center rounded-xl bg-muted p-3 text-xs leading-7">1 ပိဿာ = 100 ကျပ်သား</p> : numberField(
                              "unitsPerContainer",
                              `တစ်${inputs.containerName}တွင်ပါသောပမာဏ`,
                              inputs.unitName,
                              undefined,
                              "1",
                            )}
                          </>
                        ) : (
                          numberField(
                            "weightKg",
                            "စုစုပေါင်းဝယ်ယူပမာဏ",
                            units.large,
                            undefined,
                            "0.001",
                          )
                        )}
                        {numberField(
                          "packGrams",
                          units.count
                            ? "တစ်ရောင်းယူနစ်တွင် ပါမည့်ပမာဏ"
                            : `ခွဲထည့်မည့် တစ်${units.sale}ပမာဏ`,
                          units.small,
                          undefined,
                          "1",
                        )}
                      </div>
                      <p className="mt-3 flex items-start gap-2 rounded-xl bg-blue-50 px-3 py-2 text-[11px] leading-6 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                        <Info className="mt-1 size-3.5 shrink-0" />
                        {units.count
                          ? `ရောင်းယူနစ်ပမာဏ 1 ဆို တစ်${inputs.unitName}ချင်း၊ 6 ဆို 6 ${inputs.unitName} တစ်တွဲ။ အသင့်ထုပ်ကို ထပ်မထုပ်လျှင် ထုပ်ပိုးခ 0 ထည့်ပါ။`
                          : `kg / L ကို ဒဿမ 3 နေရာအထိ၊ g / ml ကို အပြည့်ကိန်းဖြင့် ဖြည့်ပါ။`}
                      </p>
                    </div>
                    <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                      <GroupTitle number="03" title="ဝယ်ဈေးနှင့် ကုန်ကျစရိတ်" />
                      {units.count && (
                        <div className="mb-3">
                          <SelectField
                            name="purchasePriceMode"
                            label="ဝယ်ဈေးသတ်မှတ်ပုံ"
                            value={inputs.purchasePriceMode}
                            onChange={(event) =>
                              update(
                                "purchasePriceMode",
                                event.target
                                  .value as Inputs["purchasePriceMode"],
                              )
                            }
                          >
                            <option value="total">
                              အားလုံး၏ စုစုပေါင်းဝယ်ဈေး
                            </option>
                            <option value="container">
                              တစ်{inputs.containerName} ဝယ်ဈေး
                            </option>
                          </SelectField>
                        </div>
                      )}
                      <div className="grid grid-cols-1 gap-3">
                        {numberField(
                          "purchase",
                          units.count &&
                            inputs.purchasePriceMode === "container"
                            ? `တစ်${inputs.containerName} ဝယ်ဈေး`
                            : "စုစုပေါင်းဝယ်ဈေး",
                          currency,
                        )}
                      </div>
                      <details className="group mt-4 rounded-xl border border-slate-200 bg-slate-50/70 px-3 dark:border-slate-700 dark:bg-slate-800/40">
                        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-2 [&::-webkit-details-marker]:hidden">
                          <div>
                            <p className="text-xs font-semibold leading-6">
                              အလျော့နှင့် အပိုကုန်ကျစရိတ် ပြင်ရန်
                            </p>
                            <p className="text-[10px] leading-6 text-slate-400">
                              အလျော့ {inputs.lossKg || "0"} {units.large} · အပို{" "}
                              {money(Number(inputs.processing) || 0)} · ထုပ်ပိုး{" "}
                              {money(Number(inputs.packaging) || 0)}
                            </p>
                          </div>
                          <ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="grid grid-cols-2 gap-3 border-t border-slate-200 py-3 dark:border-slate-700">
                          {numberField(
                            "lossKg",
                            units.count
                              ? "ပျက်စီး / ရောင်းမရသောပမာဏ"
                              : "အလျော့ပမာဏ",
                            units.large,
                            undefined,
                            units.count ? "1" : "0.001",
                          )}
                          {numberField(
                            "processing",
                            "ပို့ဆောင်စရိတ် / ကားခ",
                            currency,
                          )}
                          {numberField(
                            "packaging",
                            "တစ်ရောင်းယူနစ် ထုပ်ပိုးခ",
                            currency,
                          )}
                        </div>
                      </details>
                    </div>
                    {!purchaseResult.error && (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2 dark:border-blue-500/20 dark:bg-blue-500/10">
                        <span className="text-xs leading-7 text-blue-700 dark:text-blue-300">
                          ရောင်းနိုင်ပမာဏ{" "}
                          {numberFormat.format(purchaseResult.packs!)}{" "}
                          {units.sale}
                        </span>
                        <span className="text-xs font-semibold leading-7 text-blue-700 dark:text-blue-300">
                          တစ်ယူနစ် {money(purchaseResult.costPerPack!)}
                        </span>
                      </div>
                    )}
                    {notice && (
                      <p
                        role="status"
                        className="text-xs leading-6 text-blue-600 dark:text-blue-300"
                      >
                        {notice}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <Button
                        type="button"
                        variant="ghost"
                        className="min-h-11 text-xs"
                        onClick={() => {
                          setInputs((current) => ({
                            ...current,
                            purchase: "",
                            processing: "0",
                            packaging: "0",
                            sellingPrice: "",
                            discount: "0",
                          }));
                          setNotice("ဤပစ္စည်း၏ ဈေးများ ရှင်းပြီးပါပြီ။");
                        }}
                      >
                        <RotateCcw />
                        ဈေးများရှင်းရန်
                      </Button>
                      <Button
                        type="button"
                        className="min-h-11 rounded-xl bg-blue-600 text-xs text-white"
                        onClick={() => setTab("pricing")}
                      >
                        ရောင်းဈေး ဆက်တွက်မည်
                        <TrendingUp />
                      </Button>
                    </div>
                  </div>
                </fieldset>
              </TabsContent>
              <TabsContent value="pricing" className="m-0 p-4 sm:p-5">
                <fieldset disabled={readOnly} className="min-w-0 space-y-4">
                  <GroupTitle number="01" title="ဈေးတွက်မည့်နည်းလမ်း" />
                  <div
                    role="group"
                    aria-label="ဈေးတွက်နည်း"
                    className="grid grid-cols-2 gap-2"
                  >
                    {(
                      [
                        { value: "margin", label: "အမြတ် % မှ ဈေးတွက်" },
                        { value: "price", label: "ဈေးမှ အမြတ်တွက်" },
                      ] as const
                    ).map((mode) => (
                      <Button
                        key={mode.value}
                        type="button"
                        variant={
                          inputs.mode === mode.value ? "default" : "outline"
                        }
                        aria-pressed={inputs.mode === mode.value}
                        onClick={() => update("mode", mode.value)}
                        className={`min-h-12 whitespace-normal rounded-xl px-2 text-xs leading-6 ${inputs.mode === mode.value ? "bg-blue-600 text-white" : ""}`}
                      >
                        {mode.label}
                      </Button>
                    ))}
                  </div>
                  {inputs.mode === "margin" ? (
                    <div className="space-y-3 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-500/25 dark:bg-blue-500/10">
                      <SelectField
                        name="basis"
                        label="အမြတ်ရာခိုင်နှုန်း၏ အခြေခံ"
                        value={inputs.basis}
                        onChange={(event) =>
                          update("basis", event.target.value as Basis)
                        }
                      >
                        <option value="margin">ရောင်းရငွေအပေါ် — Margin</option>
                        <option value="markup">ကုန်ကျစရိတ်ပေါ် — Markup</option>
                      </SelectField>
                      <label className="block">
                        <span className="mb-2 block text-xs font-semibold leading-7 text-blue-800 dark:text-blue-200">
                          လိုချင်သော{" "}
                          {inputs.basis === "margin" ? "Margin" : "Markup"}
                        </span>
                        <span className="relative block">
                          <Input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            max={inputs.basis === "margin" ? 99.99 : undefined}
                            value={inputs.targetPercent}
                            onChange={(event) =>
                              update("targetPercent", event.target.value)
                            }
                            className={`${inputClass} h-14 border-blue-300 pr-12 text-2xl font-bold text-blue-700 dark:border-blue-500/40 dark:text-blue-200`}
                          />
                          <span className="pointer-events-none absolute right-4 top-3 text-xl font-semibold text-blue-500">
                            %
                          </span>
                        </span>
                      </label>
                      <div
                        role="group"
                        aria-label="အမြတ်ရာခိုင်နှုန်း အမြန်ရွေးရန်"
                        className="grid grid-cols-5 gap-2"
                      >
                        {[10, 15, 20, 25, 30].map((target) => (
                          <Button
                            key={target}
                            type="button"
                            variant="outline"
                            aria-pressed={
                              Number(inputs.targetPercent) === target
                            }
                            onClick={() =>
                              update("targetPercent", String(target))
                            }
                            className={`min-h-11 min-w-0 rounded-xl px-1 text-sm font-bold tabular-nums ${Number(inputs.targetPercent) === target ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 dark:border-blue-400 dark:bg-blue-500 dark:text-white" : "border-blue-200 bg-white text-blue-700 dark:border-blue-500/20 dark:bg-slate-900 dark:text-blue-300"}`}
                          >
                            {target}%
                          </Button>
                        ))}
                      </div>
                      <p className="text-[11px] leading-7 text-blue-800 dark:text-blue-200">
                        {inputs.basis === "margin"
                          ? "Margin = အမြတ် ÷ ရောင်းရငွေ × 100။ အပေါ်သို့ ဈေးဝိုင်းပြီးနောက် အမှန်တကယ် Margin က ရည်မှန်းချက်ထက် အနည်းငယ်ပိုနိုင်ပါသည်။"
                          : "Markup = အမြတ် ÷ ကုန်ကျစရိတ် × 100။ Markup % နှင့် Margin % တို့ မတူပါ။"}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-500/25 dark:bg-blue-500/10">
                      <label className="block">
                        <span className="mb-2 block text-xs font-semibold leading-7 text-blue-800 dark:text-blue-200">
                          တစ်ရောင်းယူနစ် ({units.sale}) ရောင်းဈေး ဖြည့်ပါ
                        </span>
                        <Input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          value={inputs.sellingPrice}
                          onChange={(event) =>
                            update("sellingPrice", event.target.value)
                          }
                          className={`${inputClass} h-14 border-blue-300 text-2xl font-bold text-blue-700 dark:border-blue-500/40 dark:text-blue-200`}
                        />
                      </label>
                      <p className="mt-2 text-[11px] leading-6 text-blue-700 dark:text-blue-300">
                        ငွေကြေး {currency || "—"} · ရောင်းဈေးပြောင်းသည်နှင့်
                        အမြတ် % ကို ပြန်တွက်ပေးပါမည်။
                      </p>
                    </div>
                  )}
                  {!result.error && (
                    <div className="overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-500/25">
                      <div className="bg-blue-600 p-4 text-white dark:bg-blue-500">
                        <p className="text-xs font-medium leading-7 text-blue-100">
                          လက်ရှိသတ်မှတ်ထားသော ရောင်းဈေး
                        </p>
                        <p className="mt-1 break-words text-3xl font-bold leading-normal tabular-nums">
                          {money(result.price!)}
                        </p>
                        <p className="mt-1 text-[11px] leading-6 text-blue-100">
                          တစ်ရောင်းယူနစ် = {inputs.packGrams} {units.small} ·
                          တွက်ချက်မှုအတွက် ရွေးထားသောဈေး
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 bg-white p-3 dark:bg-slate-950">
                        <div>
                          <p className="mb-1 text-[10px] leading-6 text-slate-500">
                            အမှန်တကယ်ရရှိမည့် Margin
                          </p>
                          <MarginStatus
                            value={result.margin}
                            minimum={Number(inputs.minimumMargin)}
                          />
                        </div>
                        <div>
                          <p className="mb-1 text-[10px] leading-6 text-slate-500">
                            တစ်ယူနစ် အမြတ် / အရှုံး
                          </p>
                          <p
                            className={`pt-1 text-lg font-bold leading-8 tabular-nums ${result.profitPerPack! < 0 ? "text-rose-600 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"}`}
                          >
                            {money(result.profitPerPack!)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-3 sm:grid-cols-2 dark:border-amber-500/20 dark:bg-amber-500/5">
                    <div>
                      {numberField(
                        "minimumMargin",
                        "သတိပေးရန် အနည်းဆုံး Margin",
                        "%",
                        99.99,
                      )}
                      <p className="mt-1 text-[10px] leading-6 text-amber-800 dark:text-amber-300">
                        ဤ % အောက်ကျလျှင် အဝါရောင်ပြမည်။
                      </p>
                    </div>
                    <SelectField
                      name="rounding"
                      label="အကြံပြုဈေးကို အပေါ်သို့ဝိုင်းရန်"
                      value={inputs.rounding || "0"}
                      onChange={(event) =>
                        update("rounding", event.target.value)
                      }
                    >
                      <option value="0">မဝိုင်းပါ</option>
                      {[1, 10, 50, 100, 500, 1000].map((step) => (
                        <option key={step} value={step}>
                          {numberFormat.format(step)} {currency} အလိုက်
                        </option>
                      ))}
                    </SelectField>
                  </div>
                  {!result.error && (
                    <>
                      <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                        <GroupTitle
                          number="02"
                          title="ရောင်းဈေးတစ်ခုကို ရွေးပါ"
                          note="ရည်မှန်း Margin နှင့် ဈေးဝိုင်းပြီးနောက် တကယ်ရမည့် Margin ကို ခွဲပြထားသည်။"
                        />
                        <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-3">
                          {result.comparison!.map((option) => {
                            const selected =
                              Math.abs(result.price! - option.price) < 0.000001;
                            return (
                              <Button
                                key={option.target}
                                type="button"
                                variant="outline"
                                aria-pressed={selected}
                                onClick={() =>
                                  setInputs((current) => ({
                                    ...current,
                                    mode: "price",
                                    sellingPrice: String(option.price),
                                  }))
                                }
                                className={`h-auto min-h-36 min-w-0 flex-col items-stretch gap-2 whitespace-normal rounded-xl px-3 py-3 text-left ${selected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-500/10" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"}`}
                              >
                                <span className="flex items-center justify-between gap-1 text-[11px] font-medium leading-6 text-slate-500">
                                  ရည်မှန်း {option.target}%
                                  {selected && (
                                    <CheckCircle2
                                      aria-label="ရွေးထားသောဈေး"
                                      className="!size-4 text-blue-600"
                                    />
                                  )}
                                </span>
                                <strong className="max-w-full break-words text-lg leading-7 tabular-nums text-blue-700 dark:text-blue-300">
                                  {money(option.price)}
                                </strong>
                                <span className="text-[10px] leading-6 text-slate-500">
                                  တကယ်ရမည့် Margin
                                </span>
                                <span
                                  className={`text-base font-bold tabular-nums ${option.margin != null && option.margin < Number(inputs.minimumMargin) ? "text-amber-700 dark:text-amber-300" : "text-emerald-700 dark:text-emerald-300"}`}
                                >
                                  {percent(option.margin)}
                                </span>
                                <span
                                  className={`text-[10px] leading-6 ${selected ? "font-semibold text-blue-700 dark:text-blue-300" : "text-slate-400"}`}
                                >
                                  {selected ? "ရွေးထားပြီး" : "ဤဈေးကို ရွေးရန်"}
                                </span>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                    <GroupTitle number="03" title="လျှော့ဈေး စမ်းတွက်ပါ" />
                    <div className="grid grid-cols-2 items-end gap-4">
                      {numberField("discount", "လျှော့ဈေး", "%", 99.99)}
                      <div className="pb-1">
                        <p className="mb-2 text-[11px] text-slate-500">
                          လျှော့ပြီးရောင်းဈေး
                        </p>
                        <p className="break-words text-lg font-bold tabular-nums">
                          {result.error ? "—" : money(result.actualPrice!)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-6 text-slate-500">
                      လျှော့ပြီး Margin{" "}
                      <MarginStatus
                        value={result.error ? null : result.actualMargin}
                        minimum={Number(inputs.minimumMargin)}
                      />
                    </p>
                  </div>
                  {!result.error && (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-7 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                      Margin {inputs.minimumMargin}% ရရန် အနည်းဆုံးဈေး{" "}
                      <strong>{money(result.minimumPrice!)}</strong>။ လျှော့ဈေး{" "}
                      {normalizeDiscount(inputs).discount}% ပါပေးလျှင်
                      မူလသတ်မှတ်ဈေး အနည်းဆုံး{" "}
                      <strong>{money(result.minimumListPrice!)}</strong>{" "}
                      ဖြစ်ရပါမည်။
                    </p>
                  )}
                  {result.error && (
                    <p className="text-xs leading-7 text-amber-700 dark:text-amber-300">
                      ဝယ်ယူမှုအချက်အလက်များ ပြည့်စုံအောင် အရင်ဖြည့်ပါ။
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-11 text-xs"
                    onClick={() => setTab("purchase")}
                  >
                    <ShoppingCart />
                    ဝယ်ယူမှု ပြန်ပြင်မည်
                  </Button>
                </fieldset>
              </TabsContent>
            </Tabs>
        </Card>

        <aside className="min-w-0 min-[1000px]:sticky min-[1000px]:top-20 print:static">
          <Card className="gap-0 overflow-hidden rounded-2xl border-border py-0 shadow-none">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">တွက်ချက်မှုအနှစ်ချုပ်</h3>
                <span className="rounded-lg bg-muted px-2 py-1 text-[10px] text-muted-foreground">
                  {serverCalculation ? "Server Result" : "Live Estimate"}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {inputs.product || "ပစ္စည်းအမည်"}
              </p>
              {result.error ? (
                <div
                  role="status"
                  className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-7 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
                >
                  <AlertTriangle className="mb-2 size-4" />
                  {result.error}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-muted/60 p-3">
                      <p className="text-[10px] text-muted-foreground">
                        ရောင်းနိုင်ပမာဏ
                      </p>
                      <p className="mt-2 text-xl font-bold tabular-nums">
                        {numberFormat.format(result.packs!)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {units.sale}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/60 p-3">
                      <p className="text-[10px] text-muted-foreground">
                        တစ်ယူနစ်ကုန်ကျစရိတ်
                      </p>
                      <p className="mt-2 break-words text-base font-bold tabular-nums">
                        {money(result.costPerPack!)}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-blue-600 p-4 text-white">
                    <p className="text-[11px] text-blue-100">
                      သတ်မှတ်ရောင်းဈေး
                    </p>
                    <p className="mt-2 break-words text-2xl font-bold tabular-nums">
                      {money(result.price!)}
                    </p>
                    <p className="mt-1 text-[10px] text-blue-100">
                      တစ်{units.sale} လျှင်
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="min-w-0 rounded-xl border p-3">
                      <p className="mb-2 text-[10px] text-muted-foreground">
                        Margin
                      </p>
                      <MarginStatus
                        value={result.margin}
                        minimum={Number(inputs.minimumMargin)}
                      />
                    </div>
                    <div className="min-w-0 rounded-xl border p-3">
                      <p className="text-[10px] text-muted-foreground">
                        ခန့်မှန်းအမြတ်
                      </p>
                      <p
                        className={`mt-2 break-words text-base font-bold tabular-nums ${result.totalProfit! < 0 ? "text-rose-600" : "text-emerald-600"}`}
                      >
                        {money(result.totalProfit!)}
                      </p>
                    </div>
                  </div>
                  <details className="rounded-xl border p-3">
                    <summary className="cursor-pointer text-xs font-medium">
                      အသေးစိတ်ရလဒ်များ
                    </summary>
                    <div className="mt-2 divide-y divide-border">
                      <Row label="ဝယ်ဈေး">{money(result.purchaseTotal!)}</Row>
                      <Row label="ထုပ်ပိုးခ">
                        {money(result.packagingCost!)}
                      </Row>
                      <Row label="ရောင်းရငွေ">{money(result.revenue!)}</Row>
                      <Row label="လျှော့ဈေးပြီး အမြတ်">
                        {money(result.actualProfit!)}
                      </Row>
                      <Row label="လျှော့ဈေးပြီး Margin">
                        {percent(result.actualMargin)}
                      </Row>
                      <Row label="လက်ကျန်ပမာဏ">
                        {numberFormat.format(result.remainderBase!)}{" "}
                        {units.small}
                      </Row>
                    </div>
                  </details>
                </>
              )}
              <p className="text-[10px] leading-6 text-muted-foreground">
                ခန့်မှန်းချက်သာဖြစ်သည်။ Stock နှင့် Product ဈေးကို မပြောင်းပါ။
              </p>
            </CardContent>
          </Card>
        </aside>
      </form>
    </Form>
  );
}

type ProductEntry = { id: string; inputs: Inputs };
const blankInputs: Inputs = { ...initial };

function validateDraftInputs(value: unknown): value is Inputs {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    ["originalImage", "packedImage"].every((key) => validImage(record[key])) &&
    Object.keys(initial)
      .filter((key) => key !== "originalImage" && key !== "packedImage")
      .every(
        (key) =>
          typeof record[key] === "string" &&
          (record[key] as string).length <= 1000,
      ) &&
    productTypes.some((type) => type.value === record.productType) &&
    ["total", "container"].includes(String(record.purchasePriceMode)) &&
    ["price", "margin"].includes(String(record.mode)) &&
    ["margin", "markup"].includes(String(record.basis))
  );
}

function fromServer(sheet: CostingSheet): ProductEntry[] {
  return sheet.items.map((item) => ({
    id: item.clientItemId,
    inputs: {
      ...Object.fromEntries(
        Object.keys(initial)
          .filter((k) => k !== "originalImage" && k !== "packedImage")
          .map((key) => [
            key,
            item.inputs[key] == null ? "" : String(item.inputs[key]),
          ]),
      ),
      originalImage: item.originalImage
        ? photoUrl(sheet, item, "ORIGINAL")
        : "",
      packedImage: item.packagedImage ? photoUrl(sheet, item, "PACKAGED") : "",
    } as Inputs,
  }));
}
function draftSignature(title: string, items: ProductEntry[]) {
  return JSON.stringify({ title, items });
}
function newId() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `product-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
type Recovery = {
  version: 5;
  currency: string;
  title: string;
  items: ProductEntry[];
  activeId: string;
  sheet: CostingSheet | null;
  blocked: boolean;
  savedSignature: string | null;
  savedAt: string;
};
const CostingViewContext = createContext<ReactNode>(null);
export function CostingRouteView() { return <>{useContext(CostingViewContext)}</>; }
export function CostingRouteWorkspace({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const workspace = pathname === "/factory/costing" || pathname === "/factory/costing/chat";
  return workspace ? <FactoryCostingPage>{children}</FactoryCostingPage> : <>{children}</>;
}
function FactoryCostingPage({ children }: { children: ReactNode }) {
  const { data, status } = useSession();
  const identity = data?.user as
    | {
        id?: string | number;
        username?: string;
        shopId?: string | number;
        shopCode?: string;
      }
    | undefined;
  if (status !== "authenticated" || !identity)
    return (
      <p role="status" className="p-6 text-sm text-slate-500">
        {status === "loading"
          ? "Login session စစ်နေသည်..."
          : "Login ပြန်ဝင်ပါ။"}
      </p>
    );
  return (
    <ConnectedCostingPage
      key={`${identity.id ?? identity.username}:${identity.shopId ?? identity.shopCode}`}
    >{children}</ConnectedCostingPage>
  );
}
type CostingWorkspaceProps = Parameters<typeof ProductCalculator>[0] & {
  chatMode: boolean;
  chatStarted: boolean;
  onStartChat: () => void;
  initialStep: number;
  onProgress: (step: number, completed: boolean) => void;
  onAdd: () => void;
  title: string;
  onTitle: (value: string) => void;
  onSave: () => void;
  onFinalize: () => void;
  actionDisabled: boolean;
  finalizeDisabled: boolean;
};
function CostingWorkspace(props: CostingWorkspaceProps) {
  return props.chatMode ? <CostingChat {...props} /> : <ProductCalculator {...props} />;
}
function costingPointText(text: string) {
  return text.split(/([¥]?[0-9၀-၉][0-9၀-၉,.]*(?:\s?(?:%|ကျပ်|MMK|JPY|kg|g|L|ml))?)/gu).map((part, index) =>
    /^[¥]?[0-9၀-၉]/u.test(part) ? <span key={index} className="font-semibold text-blue-600 dark:text-blue-400">{part}</span> : part,
  );
}
function TypedCostingText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [count, setCount] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;
  const parts = Array.from(new Intl.Segmenter("my", { granularity: "grapheme" }).segment(text), part => part.segment);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    let index = 0;
    const segments = Array.from(new Intl.Segmenter("my", { granularity: "grapheme" }).segment(text));
    setCount(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(segments.length); done.current?.(); return;
    }
    function tick() {
      if (cancelled) return;
      index += 1; setCount(index);
      if (index < segments.length) timer = setTimeout(tick, 22);
      else done.current?.();
    }
    timer = setTimeout(tick, 80);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [text]);
  return <><span className="sr-only">{text}</span><span aria-hidden="true" className="whitespace-pre-wrap break-words leading-8">{costingPointText(parts.slice(0, count).join(""))}{count < parts.length && <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-blue-500 align-middle" />}</span></>;
}
// Restore only this chat's keyboard-induced page pan, after the viewport settles.
function useCostingChatKeyboard(composer: { readonly current: HTMLInputElement | null }) {
  useEffect(() => {
    const viewport = window.visualViewport;
    let before: { x: number; y: number; height: number } | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const height = () => viewport?.height ?? window.innerHeight;
    const zoomed = () => viewport != null && Math.abs(viewport.scale - 1) > 0.05;
    const remember = (event: Event) => {
      if (navigator.maxTouchPoints < 1 || event.target !== composer.current || before || zoomed()) return;
      before = { x: window.scrollX, y: window.scrollY, height: height() };
    };
    const settle = () => {
      clearTimeout(timer);
      if (!before || zoomed() || height() < before.height - 80) return;
      // The keyboard-hide button can leave the input focused: resize matters too.
      timer = setTimeout(() => {
        if (!before || zoomed() || height() < before.height - 80) return;
        const focused = document.activeElement;
        if (focused !== composer.current && focused instanceof HTMLElement &&
          (focused.matches("input, textarea, select") || focused.isContentEditable)) {
          before = null; return;
        }
        const position = before;
        before = null;
        window.scrollTo({ left: position.x, top: position.y, behavior: "instant" });
      }, 350);
    };
    const onBlur = (event: FocusEvent) => {
      if (event.target === composer.current) settle();
    };
    const onOrientation = () => { clearTimeout(timer); before = null; };
    // Capture the position before Safari pans the page to reveal the field.
    document.addEventListener("pointerdown", remember, true);
    document.addEventListener("focusin", remember, true);
    document.addEventListener("focusout", onBlur, true);
    viewport?.addEventListener("resize", settle);
    viewport?.addEventListener("scroll", settle);
    window.addEventListener("resize", settle);
    window.addEventListener("orientationchange", onOrientation);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerdown", remember, true);
      document.removeEventListener("focusin", remember, true);
      document.removeEventListener("focusout", onBlur, true);
      viewport?.removeEventListener("resize", settle);
      viewport?.removeEventListener("scroll", settle);
      window.removeEventListener("resize", settle);
      window.removeEventListener("orientationchange", onOrientation);
    };
  }, [composer]);
}
function CostingChat({ inputs, setInputs, readOnly, currencyCode, serverCalculation,
  onImageBusy, onSave, onFinalize, actionDisabled, finalizeDisabled, title, onTitle, initialStep, onProgress, onAdd, chatStarted, onStartChat }: CostingWorkspaceProps) {
  const [step, setStep] = useState(initialStep);
  const [welcomeReady, setWelcomeReady] = useState(false);
  const [welcomeMuted, setWelcomeMuted] = useState(false);
  const welcomeVoice = useCostingVoice("welcome");
  const welcomeAutoplayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const welcomeVoiceRef = useRef(welcomeVoice);
  welcomeVoiceRef.current = welcomeVoice;
  useEffect(() => {
    if (chatStarted || welcomeMuted) { welcomeVoiceRef.current.stopSpeech(); return; }
    // Defer until mount effects finish; Strict Mode's initial cleanup cancels the first timer.
    const timer = setTimeout(() => { void welcomeVoiceRef.current.readQuestion("welcome"); }, 150);
    welcomeAutoplayTimer.current = timer;
    return () => { clearTimeout(timer); welcomeVoiceRef.current.stopSpeech(); };
  }, [chatStarted, welcomeMuted]);

  const { speakingQuestion, readQuestion } = useCostingVoice(step);
  const questionVoice = (questionId: string) => {
    const text = costingVoiceQuestion(questionId);
    if (!text) return null;
    return <Button type="button" variant="ghost" onClick={() => void readQuestion(questionId)} aria-pressed={speakingQuestion === text} aria-label={speakingQuestion === text ? "အသံရပ်ရန်" : "မေးခွန်းကို အသံဖြင့် နားထောင်ရန်"} title={speakingQuestion === text ? "အသံရပ်ရန်" : "မေးခွန်းကို အသံဖြင့် နားထောင်ရန်"} className={`size-10 shrink-0 rounded-full p-0 ${speakingQuestion === text ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" : "text-muted-foreground"}`}>
    {speakingQuestion === text ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
  </Button>;
  };
  const [includeExtras, setIncludeExtras] = useState(true);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [typing, setTyping] = useState(true);
  const transcript = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLInputElement>(null);
  useCostingChatKeyboard(composer);
  const uid = useId();
  const units = quantityUnits(inputs);
  const result = serverCalculation ? serverResult(serverCalculation) : calculatePacking(inputs);
  const money = (value: number) => sheetMoney(currencyCode, value);
  type ChatStep = { key: keyof Inputs | "title" | "extras"; preview?: boolean; question: string; options?: {value: string; label: string}[]; photo?: boolean; text?: boolean };
  const steps: ChatStep[] = [
    { key: "title", question: "ဒီစာရင်းအတွက် စာရင်းအမည်ကို အရင်ရေးပေးပါ။", text: true },
    { key: "product", question: "ဘယ်ပစ္စည်းအတွက် ကုန်ကျစရိတ်တွက်မလဲ။ ပစ္စည်းအမည်ကို ရေးပေးပါ။", text: true },
    { key: "productType", question: "ဒီပစ္စည်းရဲ့ အမျိုးအစားနဲ့ တွက်ချက်မယ့် ယူနစ်ကို ရွေးပေးပါ။", options: costingTypeChoices },
    { key: "originalImage", question: "မူလဝယ်ယူလာတဲ့ ပစ္စည်းဓာတ်ပုံ ထည့်ချင်ပါသလား။ မလိုသေးရင် ကျော်နိုင်ပါတယ်။", photo: true },
    ...(units.count ? [
      { key: "containerName", question: "ဝယ်ယူရောက်ရှိလာသော ပုံစံကို ရေးပေးပါ။ ဥပမာ — ပိဿာ၊ ကတ်၊ ပုံး။", text: true },
      { key: "unitName", question: "အတွင်းပါ အသေးဆုံးယူနစ်ကို ဘယ်လိုခေါ်မလဲ။ ဥပမာ — ကျပ်သား၊ ဘူး၊ ထုပ်၊ ခု။", text: true },
      { key: "containers", question: `စုစုပေါင်း ဘယ်နှ${inputs.containerName} ဝယ်ယူလာပါသလဲ။` },
      { key: "unitsPerContainer", question: `တစ်${inputs.containerName}မှာ ${inputs.unitName} ဘယ်လောက်ပါသလဲ။${isViss(inputs) ? " 1 ပိဿာ = 100 ကျပ်သား ဖြစ်ပါတယ်။" : ""}` },
    ] as ChatStep[] : [{ key: "weightKg", question: `ဝယ်ယူလာတဲ့ စုစုပေါင်းပမာဏကို ${units.large} နဲ့ ဖြည့်ပေးပါ။` } as ChatStep]),
    { key: "extras", question: "အလျော့နှင့် အပိုကုန်ကျစရိတ် ပြင်ရန် လိုပါသလား။", options: [{ value: "yes", label: "အလျော့နှင့် ပို့ဆောင်စရိတ် ပြင်မည်" }, { value: "no", label: "လက်ရှိတန်ဖိုးအတိုင်း ဆက်မည်" }] },
    ...(includeExtras ? [{ key: "lossKg", question: `အလျော့ / ပျက်စီးပမာဏ ဘယ်လောက်ရှိပါသလဲ။ (${units.large})\nမရှိရင် 0 ဖြည့်ပါ။` } as ChatStep] : []),
    ...(units.count ? [{ key: "purchasePriceMode", question: "ဝယ်ဈေးကို တစ်ယူနစ်ဈေးနဲ့ ဖြည့်မလား၊ စုစုပေါင်းဈေးနဲ့ ဖြည့်မလား။", options: [{value:"container",label:`တစ်${inputs.containerName} ဝယ်ဈေး`},{value:"total",label:"စုစုပေါင်း ဝယ်ဈေး"}] } as ChatStep] : []),
    { key: "purchase", question: `${units.count && inputs.purchasePriceMode === "container" ? `တစ်${inputs.containerName}` : "စုစုပေါင်း"} ဝယ်ဈေး ဘယ်လောက်လဲ။ (${currencyCode})` },
    ...(includeExtras ? [{ key: "processing", question: `ပို့ဆောင်စရိတ် / ကားခ စုစုပေါင်း ဘယ်လောက်ကုန်ပါသလဲ။ (${currencyCode}) မရှိရင် 0 ဖြည့်ပါ။` } as ChatStep] : []),
    { key: "packGrams", question: `တစ်ရောင်းယူနစ်မှာ ${units.small} ဘယ်လောက်ထည့်မလဲ။` },
    { key: "packaging", question: `တစ်ရောင်းယူနစ်အတွက် ထုပ်ပိုးခ ဘယ်လောက်ကုန်ပါသလဲ။ (${currencyCode})` },
    { key: "packedImage", question: "ထုပ်ပိုးပြီး ပစ္စည်းဓာတ်ပုံ ထည့်ချင်ပါသလား။ မလိုသေးရင် ကျော်နိုင်ပါတယ်။", photo: true },
    { key: "mode", question: "ရောင်းဈေးကို ဘယ်လို သတ်မှတ်ချင်ပါသလဲ။", options: [{value:"margin",label:"အမြတ် % ဖြင့် တွက်မည်"},{value:"price",label:"ရောင်းဈေးကို ကိုယ်တိုင်ဖြည့်မည်"}] },
    ...(inputs.mode === "margin" ? [
      { key: "basis", question: "အမြတ်တွက်ချက်ပုံကို ရွေးပေးပါ။ Margin က ရောင်းဈေးအပေါ်၊ Markup က ကုန်ကျစရိတ်အပေါ် တွက်ပါတယ်။", options: [{value:"margin",label:"Margin"},{value:"markup",label:"Markup"}] },
      { key: "targetPercent", preview: true, question: "ရောင်းဈေးတစ်ခုကို ရွေးပါ။\nရည်မှန်း % နဲ့ ဈေးဝိုင်းပြီးနောက် တကယ်ရမယ့် Margin ကို စမ်းစစ်နိုင်ပါတယ်။ အောက်က ၃ ခုထဲက ရွေးနိုင်သလို လိုချင်တဲ့ % ကိုလည်း ဖြည့်နိုင်ပါတယ်။\nစစ်ပြီး ပို့ရန် နှိပ်မှ နောက်အဆင့်ကို ဆက်ပါမယ်။" },
    ] as ChatStep[] : [{ key: "sellingPrice", question: `တစ်ရောင်းယူနစ် ရောင်းဈေးကို ဖြည့်ပေးပါ။ (${currencyCode})` } as ChatStep]),
    { key: "discount", question: "လျှော့ဈေး ဘယ်နှရာခိုင်နှုန်း ပေးမလဲ။ မပေးရင် 0 ဖြည့်ပါ။" },
    { key: "minimumMargin", question: "အမြတ်သတိပေးရန် အနည်းဆုံး Margin % ကို ဖြည့်ပေးပါ။" },
    { key: "rounding", question: "ရောင်းဈေးကို ဘယ်ယူနစ်အလိုက် အပေါ်သို့ ဝိုင်းပေးရမလဲ။", options: (inputs.mode === "price" ? [0,1,10,50,100,500,1000] : [1,10,50,100,500,1000]).map(value => ({ value:String(value),label:value === 0 ? "မဝိုင်းပါ" : `${value} ${currencyCode}` })) },
  ];
  const current = steps[step];
  const finished = step >= steps.length;
  const valueOf = (item: ChatStep) => item.key === "extras" ? (includeExtras ? "yes" : "no") : item.key === "title" ? title : item.key === "productType" ? selectedCostingType(inputs) : String(inputs[item.key] ?? "");
  useEffect(() => {
    onProgress(step, finished && !result.error);
    // Persist each product's position across selection changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, finished, result.error]);
  const detailLabels: Partial<Record<keyof Inputs | "title" | "extras", string>> = {
    title: "စာရင်းအမည်", product: "ပစ္စည်းအမည်", productType: "ပစ္စည်းအမျိုးအစား", containerName: "ဝယ်ယူရောက်ရှိလာသော ပုံစံ", unitName: "ယူနစ်", containers: "ဝယ်ယူပမာဏ", unitsPerContainer: "တစ်ယူနစ်ပါပမာဏ", weightKg: `ဝယ်ယူပမာဏ (${units.large})`, lossKg: `အလျော့ (${units.large})`, purchasePriceMode: "ဝယ်ဈေးဖြည့်ပုံ", purchase: `ဝယ်ဈေး (${currencyCode})`, processing: `ပို့ဆောင်စရိတ် / ကားခ (${currencyCode})`, packGrams: `တစ်ရောင်းယူနစ်ပါပမာဏ (${units.small})`, packaging: `ထုပ်ပိုးခ (${currencyCode})`, mode: "ဈေးတွက်နည်း", basis: "အမြတ်တွက်ချက်ပုံ", targetPercent: "ရည်မှန်းအမြတ် %", sellingPrice: `ရောင်းဈေး (${currencyCode})`, discount: "လျှော့ဈေး %", minimumMargin: "အနည်းဆုံး Margin %", rounding: "ဈေးဝိုင်းယူနစ်",
  };
  // Include optional costs even when their edit questions were skipped.
  const detailKeys = [...new Set([...steps.filter(item => !item.photo && item.key !== "extras").map(item => item.key), "lossKg", "processing"])] as (keyof Inputs | "title")[];
  const details = detailKeys.map(key => {
    const item = steps.find(item => item.key === key);
    const value = key === "title" ? title : key === "productType" ? costingTypeChoices.find(choice => choice.value === selectedCostingType(inputs))?.label : inputs[key];
    return `${detailLabels[key] || key} — ${item?.options?.find(option => option.value === value)?.label || value || "0"}`;
  }).join("\n");
  const summary = result.error ? `အချက်အလက်တချို့ကို ပြန်စစ်ဖို့ လိုပါသေးတယ်။\n${result.error}\nအပေါ်က အဖြေပြင်ရန်ကို နှိပ်ပြီး ပြန်ပြင်နိုင်ပါတယ်။` :
    `အချက်အလက်တွေ ပြည့်စုံပါပြီ။\n\n${details}\n\nတွက်ချက်ရလဒ်\nရောင်းနိုင်သောပမာဏ — ${numberFormat.format(result.packs!)} ${units.sale}\nတစ်ရောင်းယူနစ် ကုန်ကျစရိတ် — ${money(result.costPerPack!)}\nရောင်းဈေး — ${money(result.price!)}\nတစ်ရောင်းယူနစ် အမြတ် — ${money(result.profitPerPack!)}\nMargin — ${result.margin == null ? "—" : `${numberFormat.format(result.margin)}%`}\nလျှော့ဈေးပြီး စုစုပေါင်းအမြတ် — ${money(result.actualProfit!)}\n\nစစ်ဆေးပြီးရင် သိမ်းမည်ကို နှိပ်ပါ။ သိမ်းပြီးမှ အတည်ပြုနိုင်ပါတယ်။`;
  useEffect(() => {
    const item = steps[step];
    setAnswer(item ? (item.key === "title" && title === "ကုန်ကျစရိတ်စာရင်းအသစ်" ? "" : valueOf(item)) : ""); setError("");
    // The composer changes only when the active question changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, current?.key]);
  useEffect(() => {
    const messages = transcript.current;
    if (messages) messages.scrollTo({ top: messages.scrollHeight, behavior: "smooth" });
  }, [step, typing]);
  function submit(raw = answer) {
    if (!current || typing || readOnly || actionDisabled) return;
    const value = raw.trim();
    if (!value) { setError("အဖြေဖြည့်ပေးပါ။"); return; }
    if (current.key === "extras") {
      setIncludeExtras(value === "yes");
    } else if (current.key === "title") {
      if (value.length > 200) { setError("စာရင်းအမည် စာလုံး ၂၀၀ အထိသာ ဖြည့်ပါ။"); return; }
      onTitle(value);
    } else {
      let next: Inputs;
      if (current.key === "productType") next = selectCostingType(inputs, value as CostingTypeChoice);
      else next = { ...inputs, [current.key]: value };
      if (current.key === "mode" && value === "margin" && Number(next.rounding) <= 0) next.rounding = "1";
      const checked = draftSchema.safeParse(next);
      const issue = !checked.success && checked.error.issues.find(i => i.path[0] === current.key);
      if (issue) { setError(issue.message); return; }
      setInputs(next);
    }
    setTyping(true); setStep(index => index + 1);
  }
  if (!chatStarted) return <section aria-label="Costing Assistant မိတ်ဆက်" className="flex min-h-[65vh] w-full min-w-0 flex-col justify-center px-2 py-8 sm:px-6">
    <div className="mb-5 flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"><Sparkles className="size-6" /></span><h2 className="text-sm font-semibold">Binhlaig Costing Assistant</h2></div>
    <div className="max-w-2xl text-sm leading-8"><TypedCostingText text={"မင်္ဂလာပါရှင့်။ ကျွန်မက Binhlaig Costing Assistant ပါ။\n\nသင့်ပစ္စည်းတွေရဲ့ ကုန်ကျစရိတ်၊ ရောင်းဈေးနဲ့ အမြတ်ကို လွယ်လွယ်ကူကူ တွက်နိုင်အောင် ကျွန်မက တစ်ဆင့်ချင်း ကူညီပေးပါမယ်။\n\nစာရင်းအမည်ကနေစပြီး ပစ္စည်းအမည်၊ ဝယ်ယူပမာဏနဲ့ စရိတ်တွေကို တစ်ခုချင်း မေးပေးပါမယ်ရှင့်။ ဖြည့်ပြီးသားအဖြေတွေကိုလည်း ပြန်ပြင်နိုင်ပါတယ်။\n\nနောက်ဆုံးမှာ တွက်ချက်ရလဒ်ကို စစ်ဆေးပြီး စာရင်းသိမ်းနိုင်သလို ပစ္စည်းအသစ်တွေလည်း ထပ်ဖြည့်နိုင်ပါတယ်။\n\nအဆင်သင့်ဖြစ်ရင် အောက်က ‘အခု Chat စမည်’ ခလုတ်ကို နှိပ်ပြီး စလိုက်ကြရအောင်ရှင့်။"} onDone={() => setWelcomeReady(true)} /></div>
    <div className="mt-6 flex flex-wrap items-center gap-3"><Button type="button" variant="outline" aria-pressed={welcomeMuted} onClick={() => { welcomeVoice.stopSpeech(); setWelcomeMuted(value => !value); }} className="min-h-11 rounded-xl">{welcomeMuted ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}{welcomeMuted ? "မိတ်ဆက်အသံ ဖွင့်ရန်" : "မိတ်ဆက်အသံ ပိတ်ရန်"}</Button>
      {!welcomeMuted && !welcomeVoice.speakingQuestion && <Button type="button" variant="ghost" onClick={() => { if (welcomeAutoplayTimer.current) clearTimeout(welcomeAutoplayTimer.current); void welcomeVoice.readQuestion("welcome"); }} className="min-h-11 rounded-xl"><Volume2 className="size-4" /> မိတ်ဆက်အသံ နားထောင်ရန်</Button>}
      <Button type="button" disabled={!welcomeReady} onClick={() => { welcomeVoice.stopSpeech(); onStartChat(); }} className="min-h-11 rounded-xl bg-blue-600 px-5 text-white"><MessageSquare className="size-4" /> အခု Chat စမည်</Button></div>
  </section>;
  return <section className="flex min-h-[65vh] w-full min-w-0 flex-col">
    <div className="flex items-center justify-between border-b py-3 text-xs text-muted-foreground"><span className="flex items-center gap-2"><Sparkles className="size-4 text-blue-600" /> Costing Assistant</span><span>{Math.min(step + 1, steps.length)} / {steps.length}</span></div>
    <div ref={transcript} className="min-h-0 max-h-[62vh] flex-1 space-y-8 overflow-y-auto overscroll-contain px-1 py-6 sm:px-4">
      {!finished && steps.slice(0, step).map((item, index) => <div key={item.key} className="space-y-3"><div className="flex items-start gap-2"><p className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-8">{item.question}</p>{questionVoice(item.key)}</div><div className="ml-auto w-fit max-w-[90%] rounded-2xl bg-muted px-4 py-2"><p className="break-words text-sm leading-8">{item.photo ? (valueOf(item) ? "ဓာတ်ပုံ ထည့်ထားပါသည်။" : "ဓာတ်ပုံ မထည့်သေးပါ။") : item.options?.find(option => option.value === valueOf(item))?.label || valueOf(item)}</p><button type="button" disabled={readOnly || actionDisabled} onClick={() => { setTyping(true); setStep(index); }} className="text-[10px] text-muted-foreground underline underline-offset-4 disabled:opacity-50">အဖြေပြင်ရန်</button></div></div>)}
      <div className="flex items-start gap-3"><Sparkles className="mt-2 size-4 shrink-0 text-blue-600" /><div className="min-w-0 flex-1 text-sm" key={current?.key || "summary"}><TypedCostingText text={finished ? summary : current.question} onDone={() => { setTyping(false); if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) composer.current?.focus({ preventScroll: true }); }} /></div>{!finished && questionVoice(current.key)}</div>
      {finished && <div className="flex flex-wrap gap-3 pl-7">{(["originalImage", "packedImage"] as const).map(key => inputs[key] ? <figure key={key}><img src={inputs[key]} alt={key === "originalImage" ? "မူလပစ္စည်းပုံ" : "ထုပ်ပိုးပြီးပုံ"} className="size-24 rounded-xl object-cover" /><figcaption className="mt-1 text-[10px] text-muted-foreground">{key === "originalImage" ? "မူလပစ္စည်းပုံ" : "ထုပ်ပိုးပြီးပုံ"}</figcaption></figure> : null)}</div>}
    </div>
    <div className="shrink-0 border-t bg-background py-4">
      {!finished && !typing && current.preview && <div className="mb-4 space-y-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">{[15,20,25].map(target => {
          const trial = calculatePacking({ ...inputs, mode: "margin", targetPercent: String(target) });
          return <button key={target} type="button" disabled={readOnly || actionDisabled} onClick={() => setAnswer(String(target))} aria-pressed={answer === String(target)} className={`rounded-xl border p-3 text-left disabled:opacity-50 ${answer === String(target) ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : ""}`}>
            <p className="text-xs text-muted-foreground">ရည်မှန်း {inputs.basis === "margin" ? "Margin" : "Markup"}</p><p className="mt-1 font-semibold text-blue-600 dark:text-blue-400">{target}%</p>
            <p className="mt-2 text-sm font-semibold">{trial.error ? "—" : money(trial.price!)}</p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">တကယ်ရမည့် Margin {trial.error || trial.margin == null ? "—" : `${numberFormat.format(trial.margin)}%`}</p>
          </button>;
        })}</div>
        {(() => {
          if (!answer.trim() || !Number.isFinite(Number(answer)) || Number(answer) < 0 || (inputs.basis === "margin" && Number(answer) >= 100)) return <p className="text-xs leading-7 text-amber-600">သင့်တော်သော ရည်မှန်း % ဖြည့်ပါ။ Margin သည် 100% ထက်နည်းရပါမည်။</p>;
          const trial = calculatePacking({ ...inputs, mode: "margin", targetPercent: answer });
          return <p aria-live="polite" className="whitespace-pre-wrap text-xs leading-8">{trial.error || costingPointText(`သင်စမ်းထားသော ${inputs.basis === "margin" ? "Margin" : "Markup"} — ${answer}%\nဈေးဝိုင်းပြီး ရောင်းဈေး — ${money(trial.price!)}\nတကယ်ရမည့် Margin — ${trial.margin == null ? "—" : `${numberFormat.format(trial.margin)}%`}\nတစ်ယူနစ်အမြတ် — ${money(trial.profitPerPack!)}`)}</p>;
        })()}
        <label htmlFor={`${uid}-answer`} className="text-xs text-muted-foreground">လိုချင်သော အမြတ် % ကို စမ်းစစ်ရန်</label>
      </div>}
      {!finished && !typing && <>
        {current.photo ? <div className="mx-auto max-w-xs space-y-2"><ProductImageUpload title={current.key === "originalImage" ? "မူလပစ္စည်းပုံ" : "ထုပ်ပိုးပြီးပုံ"} hint="မလိုသေးရင် ကျော်နိုင်ပါတယ်" value={inputs[current.key as "originalImage" | "packedImage"]} onChange={value => setInputs(previous => ({ ...previous, [current.key]: value }))} onBusyChange={onImageBusy} /><Button type="button" disabled={readOnly || actionDisabled} onClick={() => { setTyping(true); setStep(index => index + 1); }} className="w-full">{valueOf(current) ? "ဆက်ရန်" : "ဓာတ်ပုံမထည့်ဘဲ ဆက်ရန်"}</Button></div> : current.options ? <div className="space-y-3"><div className="flex flex-wrap gap-2">{current.options.map(option => <Button key={option.value} type="button" variant="outline" disabled={readOnly || actionDisabled} aria-pressed={answer === option.value} onClick={() => setAnswer(option.value)} className={`min-h-11 whitespace-normal rounded-full px-4 text-xs leading-6 ${answer === option.value ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" : ""}`}>{option.label}</Button>)}</div><Button type="button" disabled={readOnly || actionDisabled || !answer} onClick={() => submit()}>ပို့ရန် <Send className="size-4" /></Button></div> : <form onSubmit={event => { event.preventDefault(); submit(); }} className="flex items-center gap-2 rounded-2xl border bg-muted/30 p-2"><Input ref={composer} id={`${uid}-answer`} aria-label={current.question} type={current.text ? "text" : "number"} min={current.text ? undefined : 0} step="any" value={answer} onChange={event => setAnswer(event.target.value)} disabled={readOnly || actionDisabled} placeholder={current.key === "title" ? "စာရင်းအမည် ရေးပါ…" : "အဖြေကို ဒီမှာဖြည့်ပါ…"} className="h-12 border-0 bg-transparent text-base shadow-none focus-visible:ring-0 md:text-base" /><Button type="submit" aria-label="အဖြေပို့မည်" disabled={readOnly || actionDisabled || !answer.trim()} className={`${current.preview ? "h-11 px-4" : "size-11"} shrink-0 rounded-xl bg-blue-600 text-white`}><Send className="size-4" />{current.preview && "ပို့ရန်"}</Button></form>}
      </>}
      {typing && <p role="status" className="py-3 text-xs text-muted-foreground">စာရေးနေပါသည်…</p>}
      {finished && !typing && <div className="flex flex-wrap gap-3"><Button type="button" variant="outline" disabled={readOnly || actionDisabled || !!result.error} onClick={onAdd}><Plus className="size-4" /> ပစ္စည်းထပ်ဖြည့်ရန်</Button><Button type="button" variant="ghost" disabled={readOnly || actionDisabled} onClick={() => { setTyping(true); setStep(1); }}>ဤပစ္စည်း ပြန်ပြင်ရန်</Button><Button type="button" disabled={readOnly || actionDisabled || !!result.error} onClick={onSave}><Save className="size-4" /> သိမ်းမည်</Button><Button type="button" variant="outline" disabled={readOnly || finalizeDisabled || !!result.error} onClick={onFinalize}><CheckCircle2 className="size-4" /> အတည်ပြုရန်</Button></div>}
      {error && <p role="alert" className="mt-2 text-xs leading-7 text-red-600">{error}</p>}
    </div>
  </section>;
}

function ConnectedCostingPage({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const chatMode = pathname === "/factory/costing/chat";
  const [moreOpen, setMoreOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const confirmResolver = useRef<((accepted: boolean) => void) | null>(null);
  function askConfirmation(
    message: string,
    title = "လုပ်ဆောင်ချက် အတည်ပြုရန်",
  ) {
    // Ignore repeat clicks while one confirmation is already pending.
    if (confirmResolver.current) return Promise.resolve(false);
    return new Promise<boolean>((resolve) => {
      confirmResolver.current = resolve;
      setConfirmation({ title, message });
    });
  }
  function finishConfirmation(accepted: boolean) {
    const resolve = confirmResolver.current;
    confirmResolver.current = null;
    setConfirmation(null);
    resolve?.(accepted);
  }
  useEffect(
    () => () => {
      confirmResolver.current?.(false);
      confirmResolver.current = null;
    },
    [],
  );

  const [chatStarted, setChatStarted] = useState(false);
  const [chatProgress, setChatProgress] = useState<Record<string, number>>({});
  const [chatCompleted, setChatCompleted] = useState<Record<string, boolean>>({});
  const [items, setItems] = useState<ProductEntry[]>([
    { id: "product-1", inputs: { ...initial } },
  ]);
  const [activeId, setActiveId] = useState("product-1"),
    [title, setTitle] = useState("ကုန်ကျစရိတ်စာရင်းအသစ်");
  const [notice, setNotice] = useState(""),
    [deleted, setDeleted] = useState<ProductEntry | null>(null);
  const [search, setSearch] = useState(""),
    [productsOpen, setProductsOpen] = useState(false);
  const [draftBusy, setDraftBusy] = useState(false),
    [pendingImages, setPendingImages] = useState(0);
  const [savedSignature, setSavedSignature] = useState<string | null>(null),
    [sheet, setSheet] = useState<CostingSheet | null>(null);
  const [blocked, setBlocked] = useState(false),
    [conflict, setConflict] = useState<CostingSheet | null>(null);
  const [listOpen, setListOpen] = useState(false),
    [listSearch, setListSearch] = useState(""),
    [listStatus, setListStatus] = useState("");
  const [listPage, setListPage] = useState(0),
    [listing, setListing] = useState<CostingList | null>(null),
    [listBusy, setListBusy] = useState(false),
    [listError, setListError] = useState("");
  const [importPreview, setImportPreview] = useState<{
    items: ProductEntry[];
    currency: string;
  } | null>(null);
  const cacheEnabled = useRef(false);
  const lock = useRef(false),
    imageJobs = useRef(0),
    serverRef = useRef<CostingSheet | null>(null),
    blockRef = useRef(false),
    listSeq = useRef(0);
  const { data: session } = useSession();
  const user = session?.user as
    | {
        id?: string | number;
        username?: string;
        email?: string;
        name?: string;
        shopId?: string | number;
        shopCode?: string;
      }
    | undefined;
  const shopCurrency = "MMK",
    currency = sheet?.currencyCode || shopCurrency;
  const active = items.find((item) => item.id === activeId) ?? items[0];
  const signature = draftSignature(title, items),
    hasChanges = signature !== savedSignature;
  const finalized = sheet?.status === "FINALIZED",
    busy = draftBusy || pendingImages > 0;
  const authoritative = !!sheet && !hasChanges;
  const rows = items.map((item) => ({
    ...item,
    calculation: authoritative
      ? serverResult(
          sheet!.items.find((i) => i.clientItemId === item.id)?.calculation ?? {
            ready: false,
            errors: ["Server တွက်ချက်မှု မရှိသေးပါ။"],
            values: {},
          },
        )
      : calculatePacking(item.inputs),
  }));
  const valid = rows.filter((row) => !row.calculation.error);
  const totals = authoritative ? sheet!.totals : null;
  const totalCost =
    totals?.packedCost ??
    valid.reduce((sum, row) => sum + row.calculation.packedCost!, 0);
  const totalRevenue =
    totals?.revenue ??
    valid.reduce((sum, row) => sum + row.calculation.revenue!, 0);
  const discountedRevenue =
    totals?.discountedRevenue ??
    valid.reduce((sum, row) => sum + row.calculation.actualRevenue!, 0);
  const combinedMargin = totals
    ? totals.combinedMargin
    : totalRevenue > 0
      ? ((totalRevenue - totalCost) / totalRevenue) * 100
      : null;
  const money = (value: number) => sheetMoney(currency, value);
  const visibleItems = items.filter((item) =>
    `${item.inputs.product} ${costingTypeChoices.find((t) => t.value === selectedCostingType(item.inputs))?.label || ""}`
      .toLocaleLowerCase()
      .includes(search.trim().toLocaleLowerCase()),
  );
  const onImageBusy = (value: boolean) => {
    imageJobs.current = Math.max(0, imageJobs.current + (value ? 1 : -1));
    setPendingImages(imageJobs.current);
  };
  const titleForm = useForm<{ title: string }>({
    resolver: zodResolver(
      z.object({
        title: z
          .string()
          .trim()
          .min(1, "စာရင်းအမည် ဖြည့်ပါ။")
          .max(200, "စာလုံး ၂၀၀ အထိသာ ဖြည့်ပါ။"),
      }),
    ),
    values: { title },
    mode: "onChange",
  });
  function acknowledge(next: CostingSheet | null) {
    serverRef.current = next;
    setSheet(next);
  }
  function setGate(value: boolean) {
    blockRef.current = value;
    setBlocked(value);
  }
  function identityKey(version = 5) {
    const account = user?.username || user?.id,
      shop =
        user?.shopId ||
        user?.shopCode ||
        localStorage.getItem("pos_shop_id") ||
        localStorage.getItem("pos_shop_code");
    if (!account || !shop)
      throw new Error(
        "Login နှင့် ဆိုင်အချက်အလက် ရရှိရန် လိုအပ်ပါသည်။",
      );
    return `binhlaig:factory-costing:v${version}:${encodeURIComponent(String(account))}:${encodeURIComponent(String(shop))}:${shopCurrency}`;
  }
  async function cache(
    nextSheet = serverRef.current,
    nextBlocked = blockRef.current,
    nextItems = items,
    nextTitle = title,
    nextSaved = savedSignature,
  ) {
    await writePhotoDraft(identityKey(), {
      version: 5,
      currency: nextSheet?.currencyCode || shopCurrency,
      title: nextTitle,
      items: nextItems,
      activeId: activeId,
      sheet: nextSheet,
      blocked: nextBlocked,
      savedSignature: nextSaved,
      savedAt: new Date().toISOString(),
    } satisfies Recovery);
  }
  useEffect(() => {
    if (!cacheEnabled.current || !user || !shopCurrency || draftBusy) return;
    const timer = setTimeout(() => {
      if (lock.current) return;
      void cache().catch(() =>
        setNotice(
          "Browser recovery သိမ်းမရပါ။ စာမျက်နှာမပိတ်မီ Server သို့ သိမ်းပါ။",
        ),
      );
    }, 700);
    return () => clearTimeout(timer);
    // Changes are cached only after authenticated identity/settings are available.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    signature,
    sheet,
    blocked,
    shopCurrency,
    user?.username,
    user?.id,
    user?.shopId,
    draftBusy,
  ]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (hasChanges || blocked) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasChanges, blocked]);
  useEffect(() => {
    if (!listOpen) {
      listSeq.current++;
      return;
    }
    const seq = ++listSeq.current;
    setListBusy(true);
    setListError("");
    listCostings(listPage, listSearch, listStatus)
      .then((data) => {
        if (seq === listSeq.current) setListing(data);
      })
      .catch((e) => {
        if (seq === listSeq.current)
          setListError(e instanceof Error ? e.message : "စာရင်းဖွင့်မရပါ။");
      })
      .finally(() => {
        if (seq === listSeq.current) setListBusy(false);
      });
    return () => {
      listSeq.current++;
    };
  }, [listOpen, listPage, listSearch, listStatus]);
  async function addProduct(copy = false) {
    cacheEnabled.current = true;
    if (finalized || lock.current) return;
    if (items.length >= 100) {
      setNotice("ပစ္စည်း ၁၀၀ မျိုးအထိသာ ထည့်နိုင်ပါသည်။");
      return;
    }
    if (
      !(await askConfirmation(
        copy
          ? "ရွေးထားသောပစ္စည်းကို မိတ္တူကူးပြီး စာရင်းထဲ ထည့်မလား။"
          : "ပစ္စည်းအသစ်တစ်ခုကို ဒီစာရင်းထဲ ထည့်မလား။ အတည်ပြုပြီးမှ ပစ္စည်းအလွတ်တစ်ခု ထည့်ပေးမည်။",
        copy ? "ပစ္စည်းမိတ္တူ ထည့်ရန်" : "ပစ္စည်းအသစ် ထည့်ရန်",
      ))
    )
      return;
    if (finalized || lock.current || imageJobs.current || items.length >= 100)
      return;
    const id = newId();
    setItems((current) => [
      ...current,
      {
        id,
        inputs:
          copy && active
            ? { ...active.inputs, product: `${active.inputs.product} (မိတ္တူ)` }
            : { ...blankInputs },
      },
    ]);
    setActiveId(id);
    setProductsOpen(false);
    setSearch("");
  }
  function removeActive() {
    cacheEnabled.current = true;
    if (!active || items.length <= 1 || finalized || lock.current) return;
    setDeleted(active);
    const next = items.filter((i) => i.id !== active.id);
    setItems(next);
    setActiveId(next[0].id);
  }
  const updateActive: Dispatch<SetStateAction<Inputs>> = (next) => {
    cacheEnabled.current = true;
    if (finalized || lock.current) return;
    setItems((current) =>
      current.map((item) =>
        item.id === activeId
          ? {
              ...item,
              inputs: typeof next === "function" ? next(item.inputs) : next,
            }
          : item,
      ),
    );
  };
  function adopt(next: CostingSheet) {
    cacheEnabled.current = true;
    const local = fromServer(next);
    acknowledge(next);
    setTitle(next.title);
    setItems(local);
    setActiveId(local[0]?.id || "");
    setDeleted(null);
    setSearch("");
    setGate(false);
    setConflict(null);
    setSavedSignature(draftSignature(next.title, local));
  }
  async function resetSheet() {
    if (
      busy ||
      lock.current ||
      !(await askConfirmation(
        "စာရင်းအသစ် စတင်မလား။ မသိမ်းရသေးသောအချက်များရှိလျှင် ဆက်မလုပ်မီ Server တွင် သိမ်းပါ။ ဆက်လုပ်မလား။",
      ))
    )
      return;
    acknowledge(null);
    setGate(false);
    setConflict(null);
    const id = newId();
    setItems([{ id, inputs: { ...blankInputs } }]);
    setActiveId(id);
    setTitle("ကုန်ကျစရိတ်စာရင်းအသစ်");
    setSavedSignature(null);
    setDeleted(null);
    setNotice("");
  }
  async function handleFailure(error: unknown) {
    if (
      error instanceof CostingApiError &&
      (error.status === 409 || error.uncertain)
    ) {
      setGate(true);
      try {
        await cache(serverRef.current, true);
      } catch {}
    }
    setNotice(
      error instanceof Error ? error.message : "လုပ်ဆောင်ချက် မအောင်မြင်ပါ။",
    );
  }
  async function saveDraft() {
    cacheEnabled.current = true;
    if (lock.current || imageJobs.current || finalized) return;
    if (blockRef.current) {
      setNotice("Server လက်ရှိစာရင်းကို အရင်ပြန်စစ်ပြီး ပြန်ညှိပါ။");
      toast.error("Server လက်ရှိစာရင်းကို အရင်ပြန်စစ်ပြီး ပြန်ညှိပါ။");
      return;
    }
    lock.current = true;
    setDraftBusy(true);
    setNotice("Server သို့ သိမ်းနေသည်...");
    try {
      await toast.promise((async () => {
      if (!(await titleForm.trigger())) {
        setNotice("စာရင်းအမည် စစ်ပါ။");
        throw new Error("စာရင်းအမည် စစ်ပါ။");
      }
      for (const item of items) {
        const checked = draftSchema.safeParse(item.inputs);
        if (!checked.success) {
          setActiveId(item.id);
          setNotice(
            `${item.inputs.product || "ပစ္စည်း"}: ${checked.error.issues.map((i) => i.message).join(" · ")}`,
          );
          throw new Error(`${item.inputs.product || "ပစ္စည်း"}: ${checked.error.issues.map((i) => i.message).join(" · ")}`);
        }
      }
      await cache(serverRef.current, false);
      const previous = serverRef.current;
      // Persist the intent before POST so an unknown creation response cannot be retried blindly.
      if (!previous) await cache(null, true);
      const next = await sheetRequest(previous ? `/${previous.id}` : "", {
        method: previous ? "PUT" : "POST",
        body: JSON.stringify(
          savePayload(
            title,
            items.map((item) => ({
              ...item,
              inputs: normalizeDiscount(item.inputs),
            })) as {
              id: string;
              inputs: Record<string, string | undefined>;
            }[],
            previous?.version,
          ),
        ),
      });
      acknowledge(next);
      await cache(next, false);
      const synced = await syncPhotos(next, items, async (response) => {
        acknowledge(response);
        await cache(response, false);
      });
      const normalized = fromServer(synced),
        sig = draftSignature(synced.title, normalized);
      // Persist recovery before replacing local data, including after partial uploads.
      await cache(synced, false, normalized, synced.title, sig);
      adopt(synced);
      setNotice(
        "ပစ္စည်းများနှင့် ပုံနှစ်မျိုးလုံးကို Server တွင် သိမ်းပြီးပါပြီ။",
      );
      })(), {
        loading: "Server သို့ သိမ်းနေသည်...",
        success: "ပစ္စည်းများနှင့် ပုံများ သိမ်းပြီးပါပြီ။",
        error: (error: unknown) => error instanceof Error ? error.message : "သိမ်းဆည်းမှု မအောင်မြင်ပါ။",
      }, { id: "costing-save" });
    } catch (e) {
      await handleFailure(e);
    } finally {
      lock.current = false;
      setDraftBusy(false);
    }
  }
  async function openSheet(id: number, keepLocal = false) {
    if (busy || lock.current) return;
    if (
      !keepLocal &&
      hasChanges &&
      !(await askConfirmation(
        "လက်ရှိမသိမ်းရသေးသော form ကို အစားထိုးပြီး Server စာရင်းဖွင့်မလား။",
      ))
    )
      return;
    lock.current = true;
    setDraftBusy(true);
    try {
      const latest = await sheetRequest(`/${id}`);
      if (keepLocal) {
        setConflict(latest);
        setListOpen(false);
        setNotice("Server လက်ရှိအခြေအနေကို အောက်တွင် စစ်ပြီးမှ ပြန်ညှိပါ။");
      } else {
        adopt(latest);
        setListOpen(false);
        await cache(
          latest,
          false,
          fromServer(latest),
          latest.title,
          draftSignature(latest.title, fromServer(latest)),
        );
        setNotice("Server မှ စာရင်းပြန်ဖွင့်ပြီးပါပြီ။");
      }
    } catch (e) {
      await handleFailure(e);
    } finally {
      lock.current = false;
      setDraftBusy(false);
    }
  }
  async function reconcile() {
    if (!conflict || conflict.status !== "DRAFT") return;
    if (
      !(await askConfirmation(
        "ဒီ Server စာရင်းကို လက်ရှိ local အချက်အလက်များဖြင့် ဆက်ပြင်မည်။ နောက်တစ်ကြိမ်သိမ်းလျှင် Server ရှိ ပစ္စည်းစာရင်းကို အစားထိုးမည်။ ဆက်လုပ်မလား။",
      ))
    )
      return;
    acknowledge(conflict);
    setGate(false);
    setSavedSignature(null);
    setConflict(null);
    setNotice(
      "ပြန်ညှိပြီးပါပြီ။ အချက်အလက်နှင့် ပုံများကို စစ်ပြီး အားလုံးသိမ်း နှိပ်ပါ။",
    );
    try {
      await cache(conflict, false);
    } catch {}
  }
  async function serverAction(action: "finalize" | "copy" | "delete") {
    const current = serverRef.current;
    if (!current || busy || lock.current || blocked) return;
    if (action === "finalize" && hasChanges) {
      setNotice("အတည်မပြုမီ ပုံနှင့်အချက်အလက်အားလုံးကို အရင်သိမ်းပါ။");
      toast.error("အတည်မပြုမီ ပုံနှင့်အချက်အလက်အားလုံးကို အရင်သိမ်းပါ။");
      return;
    }
    if (
      action !== "copy" &&
      !(await askConfirmation(
        action === "delete"
          ? "ဒီ Server မူကြမ်းနှင့် ပုံများကို ဖျက်မလား။"
          : "အတည်ပြုပြီးလျှင် ပြင်မရတော့ပါ။ အတည်ပြုမလား။",
      ))
    )
      return;
    if (
      action === "copy" &&
      hasChanges &&
      !(await askConfirmation(
        "နောက်ဆုံး Server တွင် သိမ်းထားသောအချက်များကိုသာ မိတ္တူကူးမည်။ ဆက်လုပ်မလား။",
      ))
    )
      return;
    lock.current = true;
    setDraftBusy(true);
    try {
      const performAction = async () => {
      await cache(current, false);
      if (action === "delete") {
        await sheetRequestDelete(current);
        acknowledge(null);
        setGate(false);
        const id = newId();
        setItems([{ id, inputs: { ...blankInputs } }]);
        setActiveId(id);
        setTitle("ကုန်ကျစရိတ်စာရင်းအသစ်");
        setSavedSignature(null);
        setNotice("Server မူကြမ်း ဖျက်ပြီးပါပြီ။");
      } else {
        const next = await sheetRequest(`/${current.id}/${action}`, {
          method: "POST",
          body: JSON.stringify({ version: current.version }),
        });
        adopt(next);
        await cache(
          next,
          false,
          fromServer(next),
          next.title,
          draftSignature(next.title, fromServer(next)),
        );
        setNotice(
          action === "copy"
            ? "Server မူကြမ်းမိတ္တူ ဖန်တီးပြီးပါပြီ။"
            : "အတည်ပြုပြီးပါပြီ။ Server ရလဒ်ကို ပြထားပါသည်။",
        );
      }
      };
      if (action === "finalize") {
        await toast.promise(performAction(), {
          loading: "စာရင်းကို အတည်ပြုနေသည်...",
          success: "စာရင်းကို အတည်ပြုပြီးပါပြီ။",
          error: (error: unknown) => error instanceof Error ? error.message : "အတည်ပြုမှု မအောင်မြင်ပါ။",
        }, { id: "costing-finalize" });
      } else {
        await performAction();
      }
    } catch (e) {
      await handleFailure(e);
    } finally {
      lock.current = false;
      setDraftBusy(false);
    }
  }
  async function sheetRequestDelete(current: CostingSheet) {
    await costingDelete(`/${current.id}?version=${current.version}`, {
      method: "DELETE",
    });
  }
  async function restoreRecovery() {
    if (
      busy ||
      lock.current ||
      !(await askConfirmation(
        "Browser recovery ဖြင့် လက်ရှိ form ကို အစားထိုးမလား။ Server စာရင်းကို မပြောင်းပါ။",
      ))
    )
      return;
    lock.current = true;
    setDraftBusy(true);
    try {
      const value = (await readPhotoDraft(identityKey())) as
        Recovery | undefined;
      if (
        !value ||
        value.version !== 5 ||
        !Array.isArray(value.items) ||
        value.items.some(
          (i) =>
            !i || typeof i.id !== "string" || !validateDraftInputs(i.inputs),
        ) ||
        new Set(value.items.map((i) => i.id)).size !== value.items.length ||
        value.items.length > 100 ||
        typeof value.title !== "string"
      )
        throw new Error("ပြန်ယူနိုင်သော Browser recovery မရှိသေးပါ။");
      const restoredSheet = value.sheet ? decodeSheet(value.sheet) : null;
      acknowledge(restoredSheet);
      setItems(value.items);
      setActiveId(
        value.items.find((i) => i.id === value.activeId)?.id ||
          value.items[0]?.id ||
          "",
      );
      setTitle(value.title);
      setSavedSignature(value.savedSignature);
      setGate(!!value.blocked);
      setNotice(
        "Browser recovery ပြန်ယူပြီးပါပြီ။ မသိမ်းရသေးသောပုံနှင့်အချက်များကို စစ်ပါ။",
      );
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Recovery ပြန်ဖွင့်မရပါ။");
    } finally {
      lock.current = false;
      setDraftBusy(false);
    }
  }
  async function previewLegacy() {
    if (busy || lock.current) return;
    lock.current = true;
    setDraftBusy(true);
    try {
      let raw = await readPhotoDraft(identityKey(4));
      if (!raw) {
        const legacy =
          localStorage.getItem(identityKey(3)) ??
          localStorage.getItem(identityKey(2)) ??
          localStorage.getItem(identityKey(1));
        if (legacy) raw = JSON.parse(legacy);
      }
      const d = raw as
        | {
            version: number;
            currency: string;
            items: ProductEntry[];
            inputs?: Inputs;
          }
        | undefined;
      if (!d)
        throw new Error(
          "ဒီအကောင့်/ဆိုင်အတွက် browser မူကြမ်းအဟောင်း မရှိသေးပါ။",
        );
      if (d.currency !== shopCurrency)
        throw new Error(
          "မူကြမ်းအဟောင်း currency နှင့် လက်ရှိဆိုင် currency မကိုက်ပါ။ ငွေပမာဏကို အလိုအလျောက် မပြောင်းပါ။",
        );
      const previous =
        d.version === 1 && d.inputs
          ? [
              {
                id: newId(),
                inputs: {
                  ...initial,
                  ...d.inputs,
                  productType: "WEIGHT" as const,
                  purchasePriceMode: "total" as const,
                },
              },
            ]
          : d.version === 2
            ? d.items.map((i) => ({
                ...i,
                inputs: {
                  ...initial,
                  ...i.inputs,
                  productType: "WEIGHT" as const,
                  purchasePriceMode: "total" as const,
                },
              }))
            : d.items;
      if (
        ![1, 2, 3, 4].includes(d.version) ||
        !Array.isArray(previous) ||
        !previous.length ||
        previous.length > 100 ||
        previous.some((i) => !validateDraftInputs(i.inputs))
      )
        throw new Error("မူကြမ်းအဟောင်း အချက်အလက် မမှန်ပါ။");
      setImportPreview({
        currency: d.currency,
        items: previous.map((i) => ({
          id: newId(),
          inputs: { ...initial, ...i.inputs },
        })),
      });
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "မူကြမ်းအဟောင်း ဖတ်မရပါ။");
    } finally {
      lock.current = false;
      setDraftBusy(false);
    }
  }
  const summary = [
    { label: "ရောင်းယူနစ် ကုန်ကျစရိတ်", value: totalCost },
    { label: "ရောင်းရငွေ", value: totalRevenue },
    { label: "ခန့်မှန်းအမြတ်", value: totalRevenue - totalCost },
    { label: "လျှော့ဈေးပြီးအမြတ်", value: discountedRevenue - totalCost },
  ];
  const view = (
    <div
      lang="my"
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
          e.preventDefault();
          void saveDraft();
        }
      }}
      style={{ fontFamily: '"Noto Sans Myanmar", "Myanmar Text", sans-serif' }}
      className="mx-auto min-w-0 max-w-[1500px] space-y-4 text-slate-950 dark:text-slate-100"
    >
      <Toaster position="top-center" toastOptions={{ duration: 4500 }} />
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-wider text-blue-600">BINHLAIG / FACTORY</p>
          <h1 className="mt-1 text-xl font-bold sm:text-2xl">{chatMode ? "Costing Chat" : "Costing"}</h1>
          <p className="text-xs leading-6 text-muted-foreground">ကုန်ကျစရိတ်နှင့် ရောင်းဈေးတွက်ချက်ခြင်း</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {!chatMode && <span className={`rounded-lg border px-3 py-2 text-xs font-medium ${finalized ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300" : hasChanges ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300" : "border-border bg-muted text-muted-foreground"}`}>
            {finalized ? "Finalized" : hasChanges ? "Unsaved" : sheet ? "Saved" : "New Draft"}
          </span>}
          <Button type="button" variant={chatMode ? "default" : "outline"} disabled={busy} onClick={() => router.push(chatMode ? "/factory/costing" : "/factory/costing/chat", { scroll: false })} className="h-10 rounded-xl">
            {chatMode ? <Package className="size-4" /> : <MessageSquare className="size-4" />} {chatMode ? "ပုံမှန် Form" : "Chat Q&A"}
          </Button>
          {!chatMode && <>
          <Button type="button" variant="outline" disabled={busy} className="h-10 rounded-xl" onClick={() => { setListPage(0); setListOpen(true); }}>
            <Search className="size-4" /> စာရင်းဖွင့်
          </Button>
          <Button type="button" disabled={busy || finalized || blocked} onClick={() => void saveDraft()} className="h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
            {draftBusy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} သိမ်းမည်
          </Button>
          <Button type="button" variant="outline" className="size-10 rounded-xl p-0" aria-label="အခြားလုပ်ဆောင်ချက်များ" onClick={() => setMoreOpen(true)}>
            <Settings2 className="size-4" />
          </Button>
          </>}
        </div>
      </header>
      {!chatMode && (
      <Card className="gap-0 border-slate-200 bg-white py-0 dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="space-y-3 p-4">
          <Form {...titleForm}>
            <form
              noValidate
              onSubmit={titleForm.handleSubmit(() => saveDraft())}
              className="grid gap-2"
            >
              <FormField
                control={titleForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>စာရင်းအမည်</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={title}
                        onChange={(event) => {
                          cacheEnabled.current = true;
                          field.onChange(event.target.value);
                          setTitle(event.target.value);
                        }}
                        disabled={busy || finalized}
                        maxLength={200}
                        className={inputClass}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button type="button" variant="outline" disabled={busy || finalized} onClick={() => void addProduct()} className="min-h-10 rounded-xl text-xs">
              <Plus className="size-4" /> ပစ္စည်းထည့်ရန်
            </Button>
            <Button type="button" variant="outline" disabled={busy || finalized || !active || items.length <= 1} onClick={removeActive} className="min-h-10 rounded-xl text-xs text-rose-600">
              <Trash2 className="size-4" /> ရွေးထားသောပစ္စည်းဖယ်ရန်
            </Button>
            {sheet && !finalized && (
              <Button type="button" variant="outline" disabled={busy || blocked || hasChanges} onClick={() => void serverAction("finalize")} className="min-h-10 rounded-xl text-xs">
                <CheckCircle2 className="size-4" /> အတည်ပြုရန်
              </Button>
            )}
          </div>
          {sheet && (
            <p className="text-[10px] leading-6 text-slate-500">
              စာရင်း #{sheet.id} · {sheet.status} · version {sheet.version} ·{" "}
              {sheet.currencyCode}
            </p>
          )}
          {notice && (
            <p
              role="status"
              className="rounded-xl bg-blue-50 px-3 py-2 text-xs leading-7 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
            >
              {notice}
            </p>
          )}
          {blocked && (
            <div
              role="alert"
              className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-7 text-amber-900"
            >
              <p>
                လုပ်ဆောင်ချက် အောင်မြင်မှုမသေချာပါ သို့မဟုတ် version မကိုက်ပါ။
                Local အချက်အလက်များကို ထိန်းထားပါသည်။
              </p>
              {sheet ? (
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => void openSheet(sheet.id, true)}
                  className="mt-2 min-h-11 text-xs"
                >
                  Server လက်ရှိစာရင်း စစ်ရန်
                </Button>
              ) : (
                <p>
                  Server စာရင်းဖွင့်ပြီး ဖန်တီးပြီးသားစာရင်း ရှိမရှိ စစ်ပါ။
                  တွေ့လျှင် “လက်ရှိ form ဖြင့် ပြန်ညှိ” ကို ရွေးပါ။
                </p>
              )}
            </div>
          )}
          {conflict && (
            <div className="rounded-xl border border-amber-200 p-3 text-xs leading-7">
              <p>
                Server #{conflict.id} · {conflict.title} · {conflict.status} ·
                version {conflict.version}
              </p>
              <p>
                Server ပစ္စည်း {conflict.items.length} မျိုး / လက်ရှိ form{" "}
                {items.length} မျိုး · Server အမြတ်{" "}
                {conflict.totals.profit == null
                  ? "—"
                  : sheetMoney(conflict.currencyCode, conflict.totals.profit)}
              </p>
              <details>
                <summary className="cursor-pointer text-blue-600">
                  Server အချက်အလက်များ နှိုင်းယှဉ်ရန်
                </summary>
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-100 p-2 text-[10px] dark:bg-slate-950">
                  {JSON.stringify(
                    conflict.items.map((i) => ({
                      name: i.inputs.product,
                      inputs: i.inputs,
                      originalImage: i.originalImage,
                      packagedImage: i.packagedImage,
                    })),
                    null,
                    2,
                  )}
                </pre>
              </details>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => void openSheet(conflict.id)}
                  className="min-h-11 text-xs"
                >
                  Server form ကို ဖွင့်
                </Button>
                {conflict.status === "DRAFT" && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => void reconcile()}
                    className="min-h-11 text-xs"
                  >
                    လက်ရှိ form ဖြင့် ပြန်ညှိ
                  </Button>
                )}
              </div>
            </div>
          )}
          {deleted && !finalized && (
            <Button
              variant="link"
              disabled={busy || items.length >= 100}
              onClick={() => {
                setItems((current) => [...current, deleted]);
                setActiveId(deleted.id);
                setDeleted(null);
              }}
              className="min-h-11 text-xs"
            >
              <RotateCcw />
              နောက်ဆုံးဖယ်ထားသောပစ္စည်း ပြန်ထည့်
            </Button>
          )}
          <Dialog open={productsOpen} onOpenChange={setProductsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                disabled={busy}
                className="min-h-11 rounded-xl text-xs"
              >
                <Package />
                ပစ္စည်း {items.length} မျိုး · တွက်ချက်ပြီး {valid.length} မျိုး
                <ChevronDown />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-2xl">
              <DialogHeader>
                <DialogTitle>တွက်ချက်မည့်ပစ္စည်းရွေးပါ</DialogTitle>
                <DialogDescription>
                  ပစ္စည်းအမည် သို့မဟုတ် အမျိုးအစားအလိုက် ရှာနိုင်ပါသည်။
                </DialogDescription>
              </DialogHeader>
              <Input
                aria-label="ပစ္စည်းရှာရန်"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ပစ္စည်းရှာရန်..."
                className={inputClass}
              />
              <div className="grid gap-2 sm:grid-cols-2">
                {visibleItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    aria-pressed={item.id === activeId}
                    onClick={() => {
                      setActiveId(item.id);
                      setProductsOpen(false);
                    }}
                    className={`h-auto min-h-14 justify-start whitespace-normal text-xs ${item.id === activeId ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10" : ""}`}
                  >
                    <Package />
                    {item.inputs.product || "အမည်မဖြည့်ရသေး"}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      )}
      {finalized && (
        <p className="rounded-xl bg-emerald-50 p-3 text-xs leading-7 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
          အတည်ပြုပြီးသော စာရင်းဖြစ်၍ ပြင်မရပါ။ “Server စာရင်းမိတ္တူ” ဖြင့်
          မူကြမ်းအသစ်ဖန်တီးနိုင်ပါသည်။
        </p>
      )}
      <div className={chatMode ? "grid min-w-0 items-start gap-5 md:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]" : ""}>
      {chatMode && <aside className="order-2 min-w-0 space-y-3 md:sticky md:top-20">
        <p className="text-xs font-semibold">ဤစာရင်းရှိ ပစ္စည်းများ ({items.length})</p>
        <div className="grid max-h-[65dvh] grid-cols-2 gap-2 overflow-y-auto pb-2 md:grid-cols-1">
          {items.map((item, index) => <button key={item.id} type="button" disabled={busy} aria-pressed={item.id === activeId} onClick={() => setActiveId(item.id)} className={`min-w-0 rounded-xl border p-3 text-left disabled:opacity-50 ${item.id === activeId ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "bg-card"}`}>
            <span className="block break-words text-xs font-semibold leading-7">{index + 1}. {item.inputs.product || "ပစ္စည်းအသစ်"}</span><span className={`mt-1 block text-[10px] ${chatCompleted[item.id] || (authoritative && !rows.find(row => row.id === item.id)?.calculation.error) ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>{chatCompleted[item.id] || (authoritative && !rows.find(row => row.id === item.id)?.calculation.error) ? "ဖြည့်ပြီး · အသေးစိတ်ကြည့်ရန်" : "ဖြည့်ဆဲ"}</span>
          </button>)}
        </div>
      </aside>}
      <div className="order-1 min-w-0">
      {active ? (
        <CostingWorkspace
          chatStarted={chatStarted}
          onStartChat={() => setChatStarted(true)}
          initialStep={chatProgress[active.id] ?? (authoritative && !rows.find(row => row.id === active.id)?.calculation.error ? 1000 : (items.length > 1 ? 1 : 0))}
          onProgress={(position, complete) => { setChatProgress(previous => ({ ...previous, [active.id]: position })); setChatCompleted(previous => ({ ...previous, [active.id]: complete })); }}
          onAdd={() => void addProduct()}
          title={title}
          onTitle={setTitle}
          chatMode={chatMode}
          onSave={() => void saveDraft()}
          onFinalize={() => void serverAction("finalize")}
          actionDisabled={busy || blocked || finalized}
          finalizeDisabled={busy || blocked || finalized || hasChanges || !sheet}
          key={active.id}
          inputs={active.inputs}
          setInputs={updateActive}
          onImageBusy={onImageBusy}
          readOnly={finalized || draftBusy}
          currencyCode={currency}
          serverCalculation={
            authoritative
              ? sheet!.items.find((i) => i.clientItemId === active.id)
                  ?.calculation
              : undefined
          }
        />
      ) : (
        <Button
          disabled={busy || finalized}
          onClick={() => addProduct()}
          className="min-h-11 text-xs"
        >
          ပစ္စည်းထည့်ရန်
        </Button>
      )}
      </div>
      </div>
      {!chatMode && (
      <Card className="gap-0 border-slate-200 bg-white py-0 dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="p-4">
          <div className="flex flex-wrap justify-between gap-2">
            <h2 className="text-sm font-bold">ပစ္စည်းအားလုံး အနှစ်ချုပ်</h2>
            <span className="text-[10px] text-slate-500">
              {authoritative ? "Server ရလဒ်" : "မသိမ်းရသေးသော ခန့်မှန်းချက်"} ·{" "}
              {valid.length}/{items.length} မျိုး
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {summary.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"
              >
                <p className="text-[10px] leading-6 text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-1 break-words text-lg font-bold tabular-nums">
                  {valid.length ? money(stat.value) : "—"}
                </p>
              </div>
            ))}
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer py-2 text-xs text-blue-600">
              ပစ္စည်းတစ်မျိုးစီ၏ အသေးစိတ်
            </summary>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead>
                  <tr>
                    {[
                      "ပစ္စည်း",
                      "ရောင်းယူနစ်",
                      "တစ်ယူနစ်ကုန်ကျစရိတ်",
                      "ရောင်းဈေး",
                      "အမြတ်",
                      "လျှော့ပြီးအမြတ်",
                    ].map((label) => (
                      <th key={label} className="p-3">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => setActiveId(row.id)}
                          className="text-blue-600"
                        >
                          {row.inputs.product || "အမည်မဖြည့်ရသေး"}
                        </button>
                      </td>
                      {row.calculation.error ? (
                        <td
                          colSpan={5}
                          className="p-3 leading-6 text-amber-700"
                        >
                          {row.calculation.error}
                        </td>
                      ) : (
                        <>
                          <td className="p-3">
                            {numberFormat.format(row.calculation.packs!)}
                          </td>
                          <td className="p-3">
                            {money(row.calculation.costPerPack!)}
                          </td>
                          <td className="p-3">
                            {money(row.calculation.price!)}
                          </td>
                          <td className="p-3">
                            {money(row.calculation.totalProfit!)}
                          </td>
                          <td className="p-3">
                            {money(row.calculation.actualProfit!)}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <p className="mt-2 text-[10px] leading-6 text-slate-500">
            စုစုပေါင်း Margin{" "}
            {combinedMargin == null
              ? "—"
              : `${numberFormat.format(combinedMargin)}%`}{" "}
            · မပြည့်စုံသောပစ္စည်းများ မပါဝင်ပါ။ Product ဈေးနှင့် Stock ကို
            မပြောင်းပါ။
          </p>
        </CardContent>
      </Card>
      )}
      <Dialog open={listOpen} onOpenChange={setListOpen}>
        <DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Server တွင် သိမ်းထားသောစာရင်းများ</DialogTitle>
            <DialogDescription>
              မူကြမ်းနှင့် အတည်ပြုစာရင်းများကို ပြန်ဖွင့်နိုင်ပါသည်။
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            <Input
              aria-label="Server စာရင်းရှာရန်"
              maxLength={200}
              value={listSearch}
              onChange={(e) => {
                setListSearch(e.target.value);
                setListPage(0);
              }}
              placeholder="စာရင်းအမည်ရှာရန်..."
              className="min-w-0 flex-1"
            />
            <select
              aria-label="စာရင်းအခြေအနေ"
              value={listStatus}
              onChange={(e) => {
                setListStatus(e.target.value);
                setListPage(0);
              }}
              className="rounded-lg border p-2 text-xs dark:bg-slate-900"
            >
              <option value="">အားလုံး</option>
              <option value="DRAFT">မူကြမ်း</option>
              <option value="FINALIZED">အတည်ပြုပြီး</option>
            </select>
          </div>
          {listBusy && (
            <p role="status" className="text-xs">
              စာရင်းဖတ်နေသည်...
            </p>
          )}
          {listError && (
            <p role="alert" className="text-xs text-rose-600">
              {listError}
            </p>
          )}
          {!listBusy &&
            !listError &&
            listing?.content.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
              >
                <p className="text-sm font-semibold">{entry.title}</p>
                <p className="mt-1 text-[10px] leading-6 text-slate-500">
                  #{entry.id} · {entry.status} · {entry.currencyCode} · ပစ္စည်း{" "}
                  {entry.items.length} မျိုး · {entry.updatedAt}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => void openSheet(entry.id)}
                    className="min-h-10 text-xs"
                  >
                    ဖွင့်ရန်
                  </Button>
                  {blocked && entry.status === "DRAFT" && (
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() => void openSheet(entry.id, true)}
                      className="min-h-10 text-xs"
                    >
                      လက်ရှိ form ဖြင့် ပြန်ညှိ
                    </Button>
                  )}
                </div>
              </div>
            ))}
          {!listBusy && !listError && listing?.content.length === 0 && (
            <p className="text-xs">စာရင်းမတွေ့ပါ။</p>
          )}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              disabled={listBusy || listPage === 0}
              onClick={() => setListPage((p) => p - 1)}
              className="min-h-10 text-xs"
            >
              အရှေ့
            </Button>
            <span className="text-xs">
              {listPage + 1} / {Math.max(1, listing?.totalPages || 1)}
            </span>
            <Button
              variant="outline"
              disabled={
                listBusy || !listing || listPage + 1 >= listing.totalPages
              }
              onClick={() => setListPage((p) => p + 1)}
              className="min-h-10 text-xs"
            >
              နောက်
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!importPreview}
        onOpenChange={(open) => {
          if (!open) setImportPreview(null);
        }}
      >
        <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Browser မူကြမ်းအဟောင်း တင်ရန်</DialogTitle>
            <DialogDescription>
              အောက်ပါပစ္စည်းများကို form ထဲ ပြန်ယူမည်။ “အားလုံးသိမ်း” နှိပ်မှ
              Server သို့ တင်ပါမည်။ မူကြမ်းအဟောင်းကို မဖျက်ပါ။
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs">
            {importPreview?.currency} · ပစ္စည်း {importPreview?.items.length}{" "}
            မျိုး
          </p>
          {importPreview?.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-xl border p-2"
            >
              <div className="flex gap-1">
                {[item.inputs.originalImage, item.inputs.packedImage]
                  .filter(Boolean)
                  .map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={i ? "ထုပ်ပိုးပြီးပုံ" : "မူလအထုပ်ပုံ"}
                      className="size-12 rounded-lg object-contain"
                    />
                  ))}
              </div>
              <p className="text-xs">
                {item.inputs.product || "အမည်မဖြည့်ရသေး"}
              </p>
            </div>
          ))}
          <Button
            disabled={busy}
            onClick={async () => {
              if (!importPreview) return;
              if (
                hasChanges &&
                !(await askConfirmation(
                  "လက်ရှိ form ကို browser မူကြမ်းအဟောင်းဖြင့် အစားထိုးမလား။",
                ))
              )
                return;
              acknowledge(null);
              setGate(false);
              setItems(importPreview.items);
              setActiveId(importPreview.items[0].id);
              setTitle("Browser မှ ပြန်တင်သောမူကြမ်း");
              setSavedSignature(null);
              setImportPreview(null);
              setNotice(
                "အချက်အလက်နှင့် ပုံများကို စစ်ပြီး အားလုံးသိမ်း နှိပ်ပါ။",
              );
            }}
            className="min-h-11 text-xs"
          >
            စစ်ဆေးပြီး Form ထဲ ပြန်ယူမည်
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Costing Actions</DialogTitle>
            <DialogDescription>စာရင်းနှင့် မူကြမ်းဆိုင်ရာ လုပ်ဆောင်ချက်များ</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Button variant="outline" disabled={busy || finalized} onClick={() => { setMoreOpen(false); void addProduct(); }} className="min-h-11 justify-start"><Plus className="size-4" /> ပစ္စည်းအသစ်ထည့်ရန်</Button>
            <Button variant="outline" disabled={busy || finalized || !active} onClick={() => { setMoreOpen(false); void addProduct(true); }} className="min-h-11 justify-start"><Copy className="size-4" /> ပစ္စည်းမိတ္တူ</Button>
            <Button variant="outline" disabled={busy} onClick={() => { setMoreOpen(false); void resetSheet(); }} className="min-h-11 justify-start"><Plus className="size-4" /> စာရင်းအသစ်</Button>
            {sheet && <Button variant="outline" disabled={busy || blocked} onClick={() => { setMoreOpen(false); void serverAction("copy"); }} className="min-h-11 justify-start"><Copy className="size-4" /> Server မိတ္တူ</Button>}
            {sheet && !finalized && <Button variant="outline" disabled={busy || blocked || hasChanges} onClick={() => { setMoreOpen(false); void serverAction("finalize"); }} className="min-h-11 justify-start"><CheckCircle2 className="size-4" /> အတည်ပြုရန်</Button>}
            <div className="my-1 border-t" />
            <Button variant="ghost" disabled={busy} onClick={() => { setMoreOpen(false); void restoreRecovery(); }} className="min-h-11 justify-start"><RotateCcw className="size-4" /> Browser Recovery</Button>
            <Button variant="ghost" disabled={busy} onClick={() => { setMoreOpen(false); void previewLegacy(); }} className="min-h-11 justify-start"><Upload className="size-4" /> မူကြမ်းအဟောင်း ပြန်ယူရန်</Button>
            <Button variant="ghost" onClick={() => { setMoreOpen(false); window.print(); }} className="min-h-11 justify-start"><Printer className="size-4" /> Print</Button>
            {sheet && !finalized && <Button variant="ghost" disabled={busy || blocked} onClick={() => { setMoreOpen(false); void serverAction("delete"); }} className="min-h-11 justify-start text-rose-600"><Trash2 className="size-4" /> Server မူကြမ်းဖျက်ရန်</Button>}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={confirmation !== null}
        onOpenChange={(open) => {
          if (!open) finishConfirmation(false);
        }}
      >
        <DialogContent
          className="max-w-md rounded-2xl"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            document.getElementById("costing-confirm-cancel")?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>{confirmation?.title}</DialogTitle>
            <DialogDescription className="leading-7">
              {confirmation?.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              id="costing-confirm-cancel"
              type="button"
              variant="outline"
              onClick={() => finishConfirmation(false)}
            >
              မလုပ်တော့ပါ
            </Button>
            <Button type="button" onClick={() => finishConfirmation(true)}>
              အတည်ပြုမည်
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
  return <CostingViewContext.Provider value={view}>{children}</CostingViewContext.Provider>;
}
