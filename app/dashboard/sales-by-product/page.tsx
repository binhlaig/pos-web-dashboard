

// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   AreaChart,
//   Area,
//   CartesianGrid,
//   ResponsiveContainer,
//   XAxis,
//   YAxis,
// } from "recharts";

// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";

// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// import {
//   Package,
//   RefreshCw,
//   Wand2,
//   TrendingUp,
//   ShoppingCart,
//   Coins,
//   Clock,
//   Search,
//   Star,
//   ChevronRight,
// } from "lucide-react";
// import { toast } from "sonner";

// /* ----------------------------- Types ----------------------------- */
// type SaleItem = {
//   product_id: string;
//   sku: string;
//   product_name: string;
//   qty: number;
//   price: number;
// };

// type Sale = {
//   id: string;
//   created_at: string; // ISO
//   total: number;
//   items: SaleItem[];
// };

// type Granularity = "hour" | "day" | "month" | "year";
// type Metric = "revenue" | "qty" | "orders";

// /* ----------------------------- Storage ----------------------------- */
// const LS_KEY = "TEMP_SALES_PRODUCT_ANALYTICS_FULL_V1";

// /* ----------------------------- Utils ----------------------------- */
// function cn(...classes: (string | false | null | undefined)[]) {
//   return classes.filter(Boolean).join(" ");
// }

// function money(n: number) {
//   return Number(n || 0).toLocaleString();
// }

// function uuid() {
//   return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
// }

// function readSales(): Sale[] {
//   try {
//     const raw = localStorage.getItem(LS_KEY);
//     if (!raw) return [];
//     const parsed = JSON.parse(raw);
//     return Array.isArray(parsed) ? (parsed as Sale[]) : [];
//   } catch {
//     return [];
//   }
// }

// function writeSales(sales: Sale[]) {
//   localStorage.setItem(LS_KEY, JSON.stringify(sales));
// }

// function groupKey(d: Date, g: Granularity) {
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   const h = String(d.getHours()).padStart(2, "0");
//   if (g === "year") return `${y}`;
//   if (g === "month") return `${y}-${m}`;
//   if (g === "day") return `${y}-${m}-${day}`;
//   return `${y}-${m}-${day} ${h}:00`;
// }

// function sortKey(a: string, b: string) {
//   return a < b ? -1 : a > b ? 1 : 0;
// }

// function metricLabel(m: Metric) {
//   if (m === "revenue") return "Revenue";
//   if (m === "qty") return "Quantity";
//   return "Orders";
// }

// function metricFormat(m: Metric, v: number) {
//   if (m === "revenue") return money(v);
//   return Number(v || 0).toLocaleString();
// }

// // inline highlight without dangerouslySetInnerHTML
// function HighlightText({ text, q }: { text: string; q: string }) {
//   const kw = q.trim();
//   if (!kw) return <>{text}</>;

//   const lower = text.toLowerCase();
//   const idx = lower.indexOf(kw.toLowerCase());
//   if (idx < 0) return <>{text}</>;

//   const before = text.slice(0, idx);
//   const hit = text.slice(idx, idx + kw.length);
//   const after = text.slice(idx + kw.length);

//   return (
//     <>
//       {before}
//       <mark className="rounded px-1 bg-primary/15 text-foreground">{hit}</mark>
//       {after}
//     </>
//   );
// }

// /* ----------------------------- Demo Seed ----------------------------- */
// function seedDemo() {
//   const products = [
//     { sku: "SKU-COKE", name: "Coke" },
//     { sku: "SKU-BREAD", name: "Bread" },
//     { sku: "SKU-MILK", name: "Milk" },
//     { sku: "SKU-EGG", name: "Egg" },
//     { sku: "SKU-WATER", name: "Water" },
//     { sku: "SKU-COFFEE", name: "Coffee" },
//     { sku: "SKU-TEA", name: "Tea" },
//     { sku: "SKU-RICE", name: "Rice" },
//     { sku: "SKU-NOODLE", name: "Noodle" },
//     { sku: "SKU-SNACK", name: "Snack" },
//   ];

//   const now = Date.now();

//   const sales: Sale[] = Array.from({ length: 220 }).map(() => {
//     const dayOffset = Math.floor(Math.random() * 90);
//     const hour = Math.floor(Math.random() * 24);
//     const minute = Math.floor(Math.random() * 60);

//     const d = new Date(now - dayOffset * 86400000);
//     d.setHours(hour, minute, 0, 0);

//     const itemsCount = 1 + Math.floor(Math.random() * 4);
//     const items: SaleItem[] = Array.from({ length: itemsCount }).map(() => {
//       const p = products[Math.floor(Math.random() * products.length)];
//       const qty = 1 + Math.floor(Math.random() * 5);
//       const price = 200 + Math.floor(Math.random() * 2500);

//       return {
//         product_id: p.sku,
//         sku: p.sku,
//         product_name: p.name,
//         qty,
//         price,
//       };
//     });

//     const total = items.reduce((sum, it) => sum + it.qty * it.price, 0);

//     return {
//       id: uuid(),
//       created_at: d.toISOString(),
//       total,
//       items,
//     };
//   });

//   writeSales(sales);
// }

// /* ----------------------------- Page ----------------------------- */
// export default function SalesByProductPage() {
//   const [sales, setSales] = useState<Sale[]>([]);
//   const [loading, setLoading] = useState(false);

//   // Left table search
//   const [q, setQ] = useState("");

//   // selected product
//   const [selectedSku, setSelectedSku] = useState<string>("");

//   // right chart config
//   const [granularity, setGranularity] = useState<Granularity>("day");
//   const [metric, setMetric] = useState<Metric>("revenue");

//   // smooth scroll target + pulse animation
//   const rightRef = useRef<HTMLDivElement | null>(null);
//   const [pulse, setPulse] = useState(false);

//   function reload() {
//     setLoading(true);
//     try {
//       const data = readSales();
//       if (!data || data.length === 0) seedDemo();
//       setSales(readSales());
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     reload();
//   }, []);

//   /* ----------------------------- Aggregation for table ----------------------------- */
//   const productRows = useMemo(() => {
//     const map = new Map<
//       string,
//       { sku: string; name: string; revenue: number; qty: number; orders: number }
//     >();

//     for (const s of sales) {
//       const seen = new Set<string>();
//       for (const it of s.items) {
//         const key = it.sku || it.product_id || "NA";
//         const cur = map.get(key) || {
//           sku: key,
//           name: it.product_name || key,
//           revenue: 0,
//           qty: 0,
//           orders: 0,
//         };

//         cur.qty += Number(it.qty || 0);
//         cur.revenue += Number(it.qty || 0) * Number(it.price || 0);

//         if (!seen.has(key)) {
//           cur.orders += 1;
//           seen.add(key);
//         }
//         map.set(key, cur);
//       }
//     }

//     let rows = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);

//     const kw = q.trim().toLowerCase();
//     if (kw) {
//       rows = rows.filter(
//         (r) =>
//           r.sku.toLowerCase().includes(kw) || r.name.toLowerCase().includes(kw),
//       );
//     }

//     return rows;
//   }, [sales, q]);

//   // default selection
//   useEffect(() => {
//     if (!selectedSku && productRows.length > 0) setSelectedSku(productRows[0].sku);
//   }, [productRows, selectedSku]);

//   const selectedProduct = useMemo(() => {
//     return productRows.find((p) => p.sku === selectedSku) || null;
//   }, [productRows, selectedSku]);

//   /* ----------------------------- Series for selected product ----------------------------- */
//   const series = useMemo(() => {
//     if (!selectedSku) return [];

//     const bucket = new Map<
//       string,
//       { bucket: string; revenue: number; qty: number; orders: number }
//     >();

//     for (const s of sales) {
//       const items = s.items.filter((it) => (it.sku || it.product_id) === selectedSku);
//       if (items.length === 0) continue;

//       const k = groupKey(new Date(s.created_at), granularity);

//       const cur = bucket.get(k) || { bucket: k, revenue: 0, qty: 0, orders: 0 };
//       for (const it of items) {
//         cur.qty += Number(it.qty || 0);
//         cur.revenue += Number(it.qty || 0) * Number(it.price || 0);
//       }
//       cur.orders += 1;

//       bucket.set(k, cur);
//     }

//     return Array.from(bucket.values()).sort((a, b) => sortKey(a.bucket, b.bucket));
//   }, [sales, selectedSku, granularity]);

//   const chartConfig = {
//     revenue: { label: "Revenue" },
//     qty: { label: "Quantity" },
//     orders: { label: "Orders" },
//   } as const;

//   const metricColorVar =
//     metric === "revenue"
//       ? "var(--chart-1)"
//       : metric === "qty"
//       ? "var(--chart-2)"
//       : "var(--chart-3)";

//   function selectProduct(sku: string) {
//     setSelectedSku(sku);
//     rightRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
//     setPulse(true);
//     window.setTimeout(() => setPulse(false), 450);
//   }

//   return (
//     <div className="w-full flex justify-center py-8 px-3">
//       <div className="w-full max-w-6xl space-y-4">
//         {/* Header */}
//         <Card className="overflow-hidden">
//           <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//             <div className="space-y-1">
//               <CardTitle className="flex items-center gap-2">
//                 <Package className="h-5 w-5" />
//                 Sales by Product
//               </CardTitle>
//               <CardDescription>
//                 Frontend-only test (localStorage) — Table selector + One Chart + Tabs
//               </CardDescription>
//             </div>

//             <div className="flex flex-wrap items-center gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={reload}
//                 disabled={loading}
//                 className="gap-2"
//               >
//                 <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
//                 Reload
//               </Button>

//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => {
//                   seedDemo();
//                   setSales(readSales());
//                   toast.success("Seeded demo ✅");
//                 }}
//                 className="gap-2"
//               >
//                 <Wand2 className="h-4 w-4" />
//                 Seed
//               </Button>
//             </div>
//           </CardHeader>
//         </Card>

//         {/* Layout */}
//         <div className="grid gap-4 lg:grid-cols-5">
//           {/* LEFT: Nice table */}
//           <Card className="lg:col-span-2 overflow-hidden">
//             <CardHeader className="space-y-2">
//               <CardTitle className="flex items-center gap-2">
//                 <ShoppingCart className="h-5 w-5" />
//                 Products
//               </CardTitle>
//               <CardDescription>
//                 Click product → right side chart update
//               </CardDescription>

//               <div className="relative">
//                 <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   className="pl-8"
//                   placeholder="Search SKU / Name..."
//                   value={q}
//                   onChange={(e) => setQ(e.target.value)}
//                 />
//               </div>
//             </CardHeader>

//             <CardContent className="p-0">
//               <div className="border-t" />

//               <ScrollArea className="h-[560px]">
//                 {/* 🏆 Top 5 sticky */}
//                 <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
//                   <div className="flex items-center justify-between px-3 py-2">
//                     <div className="flex items-center gap-2 text-sm font-semibold">
//                       <Star className="h-4 w-4 text-primary" />
//                       Top 5
//                     </div>
//                     <Badge variant="secondary" className="text-xs">
//                       Quick pick
//                     </Badge>
//                   </div>

//                   <div className="px-2 pb-2 grid gap-2">
//                     {productRows.slice(0, 5).map((p, i) => {
//                       const active = p.sku === selectedSku;
//                       return (
//                         <button
//                           key={p.sku}
//                           type="button"
//                           onClick={() => selectProduct(p.sku)}
//                           className={cn(
//                             "w-full text-left rounded-xl border px-3 py-2 transition",
//                             active
//                               ? "bg-muted/70 border-primary/30"
//                               : "hover:bg-muted/40",
//                           )}
//                         >
//                           <div className="flex items-center justify-between gap-2">
//                             <div className="min-w-0">
//                               <div className="text-sm font-semibold truncate">
//                                 <HighlightText text={p.name} q={q} />
//                               </div>
//                               <div className="text-xs text-muted-foreground font-mono truncate">
//                                 <HighlightText text={p.sku} q={q} />
//                               </div>
//                             </div>

//                             <div className="flex items-center gap-2 shrink-0">
//                               <div className="text-sm font-semibold tabular-nums">
//                                 {money(p.revenue)}
//                               </div>
//                               <ChevronRight className="h-4 w-4 text-muted-foreground" />
//                             </div>
//                           </div>

//                           <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
//                             <div
//                               className={cn(
//                                 "h-full rounded-full",
//                                 active ? "bg-primary" : "bg-primary/60",
//                               )}
//                               style={{
//                                 width: `${Math.min(
//                                   100,
//                                   productRows[0]?.revenue
//                                     ? (p.revenue / productRows[0].revenue) * 100
//                                     : 0,
//                                 )}%`,
//                               }}
//                             />
//                           </div>

//                           <div className="mt-1 flex gap-2 text-[11px] text-muted-foreground">
//                             <span>Qty {p.qty}</span>
//                             <span>•</span>
//                             <span>Orders {p.orders}</span>
//                             <span>•</span>
//                             <span>Rank #{i + 1}</span>
//                           </div>
//                         </button>
//                       );
//                     })}
//                   </div>

//                   <Separator />
//                   <div className="px-3 py-2 text-xs text-muted-foreground">
//                     All products
//                   </div>
//                 </div>

//                 {/* Table */}
//                 <table className="w-full text-sm">
//                   <thead className="sticky top-[168px] z-[5] bg-background/95 backdrop-blur border-b">
//                     <tr className="text-left text-muted-foreground">
//                       <th className="p-3 w-[44px]">#</th>
//                       <th className="p-3">Product</th>
//                       <th className="p-3 text-right">Revenue</th>
//                       <th className="p-3 w-[120px]">Share</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {productRows.length === 0 ? (
//                       <tr>
//                         <td colSpan={4} className="p-4 text-muted-foreground">
//                           No data. Seed လုပ်ပြီးစမ်းပါ
//                         </td>
//                       </tr>
//                     ) : null}

//                     {productRows.map((p, idx) => {
//                       const active = p.sku === selectedSku;
//                       const share = productRows[0]?.revenue
//                         ? Math.min(100, (p.revenue / productRows[0].revenue) * 100)
//                         : 0;

//                       return (
//                         <tr
//                           key={p.sku}
//                           onClick={() => selectProduct(p.sku)}
//                           className={cn(
//                             "border-b cursor-pointer transition",
//                             active ? "bg-muted/70" : "hover:bg-muted/40",
//                           )}
//                         >
//                           <td className="p-3 text-muted-foreground font-mono">
//                             {idx + 1}
//                           </td>

//                           <td className="p-3">
//                             <div className="flex flex-col min-w-0">
//                               <span className="font-medium truncate">
//                                 <HighlightText text={p.name} q={q} />
//                               </span>
//                               <span className="text-xs text-muted-foreground font-mono truncate">
//                                 <HighlightText text={p.sku} q={q} />
//                               </span>
//                             </div>
//                           </td>

//                           <td className="p-3 text-right font-semibold tabular-nums">
//                             {money(p.revenue)}
//                           </td>

//                           <td className="p-3">
//                             <div className="h-2 rounded-full bg-muted overflow-hidden">
//                               <div
//                                 className={cn(
//                                   "h-full rounded-full transition-all",
//                                   active ? "bg-primary" : "bg-primary/60",
//                                 )}
//                                 style={{ width: `${share}%` }}
//                               />
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </ScrollArea>
//             </CardContent>
//           </Card>

//           {/* RIGHT: One chart + tabs */}
//           <div ref={rightRef} className={cn("lg:col-span-3 scroll-mt-6", pulse && "animate-pulse")}>
//             <Card className="overflow-hidden">
//               <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//                 <div className="space-y-1">
//                   <CardTitle className="flex items-center gap-2">
//                     <TrendingUp className="h-5 w-5" />
//                     {selectedProduct ? selectedProduct.name : "Product Analytics"}
//                   </CardTitle>
//                   <CardDescription>
//                     One Chart + Metric Tabs (Revenue / Qty / Orders)
//                   </CardDescription>
//                 </div>

//                 <div className="flex flex-wrap items-center gap-2">
//                   <Badge variant="secondary" className="gap-1">
//                     <Clock className="h-3.5 w-3.5" />
//                     {granularity}
//                   </Badge>

//                   {(["hour", "day", "month", "year"] as Granularity[]).map((g) => (
//                     <Button
//                       key={g}
//                       size="sm"
//                       variant={granularity === g ? "default" : "outline"}
//                       onClick={() => setGranularity(g)}
//                     >
//                       {g}
//                     </Button>
//                   ))}
//                 </div>
//               </CardHeader>

//               <CardContent className="space-y-4">
//                 {/* Summary */}
//                 {selectedProduct ? (
//                   <div className="rounded-2xl border p-4 bg-card/40">
//                     <div className="flex flex-wrap items-start justify-between gap-3">
//                       <div className="min-w-0">
//                         <div className="text-lg font-semibold break-words">
//                           {selectedProduct.name}
//                         </div>
//                         <div className="text-xs text-muted-foreground font-mono">
//                           {selectedProduct.sku}
//                         </div>
//                       </div>

//                       <div className="flex flex-wrap gap-2">
//                         <Badge variant="secondary" className="gap-1">
//                           <Coins className="h-3.5 w-3.5" />
//                           {money(selectedProduct.revenue)}
//                         </Badge>
//                         <Badge variant="outline">Qty {selectedProduct.qty}</Badge>
//                         <Badge variant="outline">Orders {selectedProduct.orders}</Badge>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-sm text-muted-foreground">Select a product...</div>
//                 )}

//                 <Separator />

//                 {/* Metric tabs */}
//                 <div className="flex items-center justify-between gap-3 flex-wrap">
//                   <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
//                     <TabsList>
//                       <TabsTrigger value="revenue">Revenue</TabsTrigger>
//                       <TabsTrigger value="qty">Qty</TabsTrigger>
//                       <TabsTrigger value="orders">Orders</TabsTrigger>
//                     </TabsList>
//                   </Tabs>

//                   <Badge variant="secondary" className="gap-1">
//                     {metricLabel(metric)}
//                   </Badge>
//                 </div>

//                 {/* Empty */}
//                 {selectedSku && series.length === 0 ? (
//                   <div className="text-sm text-muted-foreground">
//                     ဒီ product အတွက် sales record မတွေ့ပါ (Seed ထည့်ပြီးပြန်စမ်းပါ)
//                   </div>
//                 ) : null}

//                 {/* Chart */}
//                 <div className="rounded-2xl border p-3">
//                   <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
//                     <div className="text-sm font-medium">{metricLabel(metric)}</div>
//                     <div className="text-xs text-muted-foreground">
//                       Value: <b>{metric === "revenue" ? "MMK/JPY" : "count"}</b>
//                     </div>
//                   </div>

//                   <div className="h-[360px]">
//                     <ChartContainer config={chartConfig} className="h-full w-full">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <AreaChart data={series} margin={{ left: 8, right: 12, top: 12, bottom: 0 }}>
//                           <CartesianGrid vertical={false} />
//                           <XAxis dataKey="bucket" tickLine={false} axisLine={false} />
//                           <YAxis
//                             tickLine={false}
//                             axisLine={false}
//                             allowDecimals={metric === "revenue"}
//                             tickFormatter={(v) => (metric === "revenue" ? money(v) : String(v))}
//                           />
//                           <ChartTooltip
//                             content={
//                               <ChartTooltipContent
//                                 formatter={(value) => metricFormat(metric, Number(value))}
//                               />
//                             }
//                           />
//                           <Area
//                             dataKey={metric}
//                             type="monotone"
//                             stroke={metricColorVar}
//                             fill={metricColorVar}
//                             fillOpacity={0.22}
//                             strokeWidth={2}
//                           />
//                         </AreaChart>
//                       </ResponsiveContainer>
//                     </ChartContainer>
//                   </div>
//                 </div>

//                 <div className="text-xs text-muted-foreground">
//                   Frontend-only test (localStorage) — DB မလိုပါ
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }





"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Package,
  RefreshCw,
  Wand2,
  TrendingUp,
  ShoppingCart,
  Coins,
  Clock,
  Search,
  Star,
  ChevronRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { toast } from "sonner";

/* ----------------------------- Types ----------------------------- */
type SaleItem = {
  product_id: string;
  sku: string;
  product_name: string;
  qty: number;
  price: number;
};

type Sale = {
  id: string;
  created_at: string; // ISO
  total: number;
  items: SaleItem[];
};

type Granularity = "hour" | "day" | "month" | "year";
type Metric = "revenue" | "qty" | "orders";

/* ----------------------------- Storage ----------------------------- */
const LS_KEY = "TEMP_SALES_PRODUCT_ANALYTICS_FULL_V2";

/* ----------------------------- Utils ----------------------------- */
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function money(n: number) {
  return Number(n || 0).toLocaleString();
}

function uuid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readSales(): Sale[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Sale[]) : [];
  } catch {
    return [];
  }
}

function writeSales(sales: Sale[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(sales));
}

function groupKey(d: Date, g: Granularity) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  if (g === "year") return `${y}`;
  if (g === "month") return `${y}-${m}`;
  if (g === "day") return `${y}-${m}-${day}`;
  return `${y}-${m}-${day} ${h}:00`;
}

function sortKey(a: string, b: string) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function metricLabel(m: Metric) {
  if (m === "revenue") return "Revenue";
  if (m === "qty") return "Quantity";
  return "Orders";
}

function metricFormat(m: Metric, v: number) {
  if (m === "revenue") return money(v);
  return Number(v || 0).toLocaleString();
}

// inline highlight (no dangerouslySetInnerHTML)
function HighlightText({ text, q }: { text: string; q: string }) {
  const kw = q.trim();
  if (!kw) return <>{text}</>;

  const lower = text.toLowerCase();
  const idx = lower.indexOf(kw.toLowerCase());
  if (idx < 0) return <>{text}</>;

  const before = text.slice(0, idx);
  const hit = text.slice(idx, idx + kw.length);
  const after = text.slice(idx + kw.length);

  return (
    <>
      {before}
      <mark className="rounded px-1 bg-primary/15 text-foreground">{hit}</mark>
      {after}
    </>
  );
}

/* ----------------------------- Demo Seed ----------------------------- */
function seedDemo() {
  const products = [
    { sku: "SKU-COKE", name: "Coke" },
    { sku: "SKU-BREAD", name: "Bread" },
    { sku: "SKU-MILK", name: "Milk" },
    { sku: "SKU-EGG", name: "Egg" },
    { sku: "SKU-WATER", name: "Water" },
    { sku: "SKU-COFFEE", name: "Coffee" },
    { sku: "SKU-TEA", name: "Tea" },
    { sku: "SKU-RICE", name: "Rice" },
    { sku: "SKU-NOODLE", name: "Noodle" },
    { sku: "SKU-SNACK", name: "Snack" },
    { sku: "SKU-CHIPS", name: "Chips" },
    { sku: "SKU-SODA", name: "Soda" },
    { sku: "SKU-CANDY", name: "Candy" },
    { sku: "SKU-BISCUIT", name: "Biscuit" },
    { sku: "SKU-YOGURT", name: "Yogurt" },
    { sku: "SKU-ICE", name: "Ice" },
    { sku: "SKU-SOAP", name: "Soap" },
    { sku: "SKU-SHAMPOO", name: "Shampoo" },
    { sku: "SKU-TOOTHPASTE", name: "Toothpaste" },
    { sku: "SKU-TISSUE", name: "Tissue" },
    { sku: "SKU-OIL", name: "Cooking Oil" },
    { sku: "SKU-SALT", name: "Salt" },
    { sku: "SKU-SUGAR", name: "Sugar" },
    { sku: "SKU-FLOUR", name: "Flour" },
    { sku: "SKU-APPLE", name: "Apple" },
    { sku: "SKU-BANANA", name: "Banana" },
    { sku: "SKU-ORANGE", name: "Orange" },
    { sku: "SKU-FISH", name: "Fish" },
    { sku: "SKU-MEAT", name: "Meat" },
    { sku: "SKU-CHICKEN", name: "Chicken" },
    { sku: "SKU-ONION", name: "Onion" },
    { sku: "SKU-GARLIC", name: "Garlic" },
    { sku: "SKU-TOMATO", name: "Tomato" },
    { sku: "SKU-POTATO", name: "Potato" },
    { sku: "SKU-CARROT", name: "Carrot" },
    { sku: "SKU-PEPPER", name: "Pepper" },
    { sku: "SKU-CHILI", name: "Chili" },
    { sku: "SKU-RAMEN", name: "Ramen" },
  ];

  const now = Date.now();

  const sales: Sale[] = Array.from({ length: 260 }).map(() => {
    const dayOffset = Math.floor(Math.random() * 120);
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);

    const d = new Date(now - dayOffset * 86400000);
    d.setHours(hour, minute, 0, 0);

    const itemsCount = 1 + Math.floor(Math.random() * 4);
    const items: SaleItem[] = Array.from({ length: itemsCount }).map(() => {
      const p = products[Math.floor(Math.random() * products.length)];
      const qty = 1 + Math.floor(Math.random() * 5);
      const price = 200 + Math.floor(Math.random() * 2500);
      return {
        product_id: p.sku,
        sku: p.sku,
        product_name: p.name,
        qty,
        price,
      };
    });

    const total = items.reduce((sum, it) => sum + it.qty * it.price, 0);

    return {
      id: uuid(),
      created_at: d.toISOString(),
      total,
      items,
    };
  });

  writeSales(sales);
}

/* ----------------------------- Page ----------------------------- */
export default function SalesByProductPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);

  // search
  const [q, setQ] = useState("");

  // selected product
  const [selectedSku, setSelectedSku] = useState<string>("");

  // chart config
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [metric, setMetric] = useState<Metric>("revenue");

  // smooth scroll + pulse
  const rightRef = useRef<HTMLDivElement | null>(null);
  const [pulse, setPulse] = useState(false);

  // ✅ Table pagination
  const PAGE_SIZE = 30;
  const [page, setPage] = useState(1);

  function reload() {
    setLoading(true);
    try {
      const data = readSales();
      if (!data || data.length === 0) seedDemo();
      setSales(readSales());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  /* ----------------------------- Aggregation ----------------------------- */
  const allRows = useMemo(() => {
    const map = new Map<
      string,
      { sku: string; name: string; revenue: number; qty: number; orders: number }
    >();

    for (const s of sales) {
      const seen = new Set<string>();
      for (const it of s.items) {
        const key = it.sku || it.product_id || "NA";
        const cur = map.get(key) || {
          sku: key,
          name: it.product_name || key,
          revenue: 0,
          qty: 0,
          orders: 0,
        };

        cur.qty += Number(it.qty || 0);
        cur.revenue += Number(it.qty || 0) * Number(it.price || 0);

        if (!seen.has(key)) {
          cur.orders += 1;
          seen.add(key);
        }
        map.set(key, cur);
      }
    }

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [sales]);

  const filteredRows = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return allRows;
    return allRows.filter(
      (r) =>
        r.sku.toLowerCase().includes(kw) || r.name.toLowerCase().includes(kw),
    );
  }, [allRows, q]);

  // ✅ Search change => page reset
  useEffect(() => {
    setPage(1);
  }, [q]);

  // default selection
  useEffect(() => {
    if (!selectedSku && filteredRows.length > 0) setSelectedSku(filteredRows[0].sku);
  }, [filteredRows, selectedSku]);

  const selectedProduct = useMemo(() => {
    return filteredRows.find((p) => p.sku === selectedSku) || null;
  }, [filteredRows, selectedSku]);

  /* ----------------------------- Pagination data ----------------------------- */
  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, safePage]);

  // keep page safe if data changed
  useEffect(() => {
    if (page !== safePage) setPage(safePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safePage, total]);

  function selectProduct(sku: string) {
    setSelectedSku(sku);
    rightRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setPulse(true);
    window.setTimeout(() => setPulse(false), 450);
  }

  /* ----------------------------- Series for selected product ----------------------------- */
  const series = useMemo(() => {
    if (!selectedSku) return [];

    const bucket = new Map<
      string,
      { bucket: string; revenue: number; qty: number; orders: number }
    >();

    for (const s of sales) {
      const items = s.items.filter((it) => (it.sku || it.product_id) === selectedSku);
      if (items.length === 0) continue;

      const k = groupKey(new Date(s.created_at), granularity);

      const cur = bucket.get(k) || { bucket: k, revenue: 0, qty: 0, orders: 0 };
      for (const it of items) {
        cur.qty += Number(it.qty || 0);
        cur.revenue += Number(it.qty || 0) * Number(it.price || 0);
      }
      cur.orders += 1;

      bucket.set(k, cur);
    }

    return Array.from(bucket.values()).sort((a, b) => sortKey(a.bucket, b.bucket));
  }, [sales, selectedSku, granularity]);

  const chartConfig = {
    revenue: { label: "Revenue" },
    qty: { label: "Quantity" },
    orders: { label: "Orders" },
  } as const;

  const metricColorVar =
    metric === "revenue"
      ? "var(--chart-1)"
      : metric === "qty"
      ? "var(--chart-2)"
      : "var(--chart-3)";

  // pagination numbers (compact)
  const pageNumbers = useMemo(() => {
    const maxBtns = 5; // show up to 5
    const half = Math.floor(maxBtns / 2);
    let start = Math.max(1, safePage - half);
    let end = Math.min(totalPages, start + maxBtns - 1);
    start = Math.max(1, end - maxBtns + 1);

    const nums: number[] = [];
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }, [safePage, totalPages]);

  return (
    <div className="w-full flex justify-center py-8 px-3">
      <div className="w-full max-w-6xl space-y-4">
        {/* Header */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Sales by Product
              </CardTitle>
              <CardDescription>
                Table selector + Pagination (30/পৃষ্ঠা) + One Chart + Tabs
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={reload}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Reload
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  seedDemo();
                  setSales(readSales());
                  toast.success("Seeded demo ✅");
                }}
                className="gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Seed
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Layout */}
        <div className="grid gap-4 lg:grid-cols-5">
          {/* LEFT */}
          <Card className="lg:col-span-2 overflow-hidden">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Products
              </CardTitle>
              <CardDescription>
                Click product → chart update (Right)
              </CardDescription>

              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Search SKU / Name..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Showing{" "}
                <b>
                  {total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}-
                  {Math.min(safePage * PAGE_SIZE, total)}
                </b>{" "}
                of <b>{total}</b>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="border-t" />

              <ScrollArea className="h-[560px]">
                {/* Top 5 sticky */}
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Star className="h-4 w-4 text-primary" />
                      Top 5
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Quick pick
                    </Badge>
                  </div>

                  <div className="px-2 pb-2 grid gap-2">
                    {filteredRows.slice(0, 5).map((p, i) => {
                      const active = p.sku === selectedSku;
                      return (
                        <button
                          key={p.sku}
                          type="button"
                          onClick={() => selectProduct(p.sku)}
                          className={cn(
                            "w-full text-left rounded-xl border px-3 py-2 transition",
                            active
                              ? "bg-muted/70 border-primary/30"
                              : "hover:bg-muted/40",
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold truncate">
                                <HighlightText text={p.name} q={q} />
                              </div>
                              <div className="text-xs text-muted-foreground font-mono truncate">
                                <HighlightText text={p.sku} q={q} />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <div className="text-sm font-semibold tabular-nums">
                                {money(p.revenue)}
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>

                          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                active ? "bg-primary" : "bg-primary/60",
                              )}
                              style={{
                                width: `${Math.min(
                                  100,
                                  filteredRows[0]?.revenue
                                    ? (p.revenue / filteredRows[0].revenue) * 100
                                    : 0,
                                )}%`,
                              }}
                            />
                          </div>

                          <div className="mt-1 flex gap-2 text-[11px] text-muted-foreground">
                            <span>Qty {p.qty}</span>
                            <span>•</span>
                            <span>Orders {p.orders}</span>
                            <span>•</span>
                            <span>Rank #{i + 1}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <Separator />

                  {/* ✅ Pagination controls (sticky) */}
                  <div className="px-3 py-2 flex items-center justify-between gap-2 flex-wrap">
                    <div className="text-xs text-muted-foreground">
                      Page <b>{safePage}</b> / <b>{totalPages}</b>
                    </div>

                    <div className="flex items-center gap-1 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2"
                        disabled={safePage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {pageNumbers.map((n) => (
                        <Button
                          key={n}
                          size="sm"
                          variant={n === safePage ? "default" : "outline"}
                          className="h-8 px-2"
                          onClick={() => setPage(n)}
                        >
                          {n}
                        </Button>
                      ))}

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2"
                        disabled={safePage >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    Products (paged)
                  </div>
                </div>

                {/* Table */}
                <table className="w-full text-sm">
                  <thead className="sticky top-[250px] z-[5] bg-background/95 backdrop-blur border-b">
                    <tr className="text-left text-muted-foreground">
                      <th className="p-3 w-[56px]">#</th>
                      <th className="p-3">Product</th>
                      <th className="p-3 text-right">Revenue</th>
                      <th className="p-3 w-[120px]">Share</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-muted-foreground">
                          No data. Seed လုပ်ပြီးစမ်းပါ
                        </td>
                      </tr>
                    ) : null}

                    {pageRows.map((p, idx) => {
                      const active = p.sku === selectedSku;

                      // global rank index
                      const globalIndex = (safePage - 1) * PAGE_SIZE + idx + 1;

                      const share = filteredRows[0]?.revenue
                        ? Math.min(100, (p.revenue / filteredRows[0].revenue) * 100)
                        : 0;

                      return (
                        <tr
                          key={p.sku}
                          onClick={() => selectProduct(p.sku)}
                          className={cn(
                            "border-b cursor-pointer transition",
                            active ? "bg-muted/70" : "hover:bg-muted/40",
                          )}
                        >
                          <td className="p-3 text-muted-foreground font-mono">
                            {globalIndex}
                          </td>

                          <td className="p-3">
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium truncate">
                                <HighlightText text={p.name} q={q} />
                              </span>
                              <span className="text-xs text-muted-foreground font-mono truncate">
                                <HighlightText text={p.sku} q={q} />
                              </span>
                            </div>
                          </td>

                          <td className="p-3 text-right font-semibold tabular-nums">
                            {money(p.revenue)}
                          </td>

                          <td className="p-3">
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  active ? "bg-primary" : "bg-primary/60",
                                )}
                                style={{ width: `${share}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="h-3" />
              </ScrollArea>
            </CardContent>
          </Card>

          {/* RIGHT */}
          <div
            ref={rightRef}
            className={cn("lg:col-span-3 scroll-mt-6", pulse && "animate-pulse")}
          >
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {selectedProduct ? selectedProduct.name : "Product Analytics"}
                  </CardTitle>
                  <CardDescription>
                    One Chart + Metric Tabs (Revenue / Qty / Orders)
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {granularity}
                  </Badge>

                  {(["hour", "day", "month", "year"] as Granularity[]).map((g) => (
                    <Button
                      key={g}
                      size="sm"
                      variant={granularity === g ? "default" : "outline"}
                      onClick={() => setGranularity(g)}
                    >
                      {g}
                    </Button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Summary */}
                {selectedProduct ? (
                  <div className="rounded-2xl border p-4 bg-card/40">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-lg font-semibold break-words">
                          {selectedProduct.name}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {selectedProduct.sku}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="gap-1">
                          <Coins className="h-3.5 w-3.5" />
                          {money(selectedProduct.revenue)}
                        </Badge>
                        <Badge variant="outline">Qty {selectedProduct.qty}</Badge>
                        <Badge variant="outline">Orders {selectedProduct.orders}</Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Select a product...
                  </div>
                )}

                <Separator />

                {/* Tabs */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
                    <TabsList>
                      <TabsTrigger value="revenue">Revenue</TabsTrigger>
                      <TabsTrigger value="qty">Qty</TabsTrigger>
                      <TabsTrigger value="orders">Orders</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <Badge variant="secondary" className="gap-1">
                    {metricLabel(metric)}
                  </Badge>
                </div>

                {/* Empty */}
                {selectedSku && series.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    ဒီ product အတွက် sales record မတွေ့ပါ (Seed ထည့်ပြီးပြန်စမ်းပါ)
                  </div>
                ) : null}

                {/* Chart */}
                <div className="rounded-2xl border p-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                    <div className="text-sm font-medium">{metricLabel(metric)}</div>
                    <div className="text-xs text-muted-foreground">
                      Value: <b>{metric === "revenue" ? "MMK/JPY" : "count"}</b>
                    </div>
                  </div>

                  <div className="h-[360px]">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={series} margin={{ left: 8, right: 12, top: 12, bottom: 0 }}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="bucket" tickLine={false} axisLine={false} />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={metric === "revenue"}
                            tickFormatter={(v) => (metric === "revenue" ? money(v) : String(v))}
                          />
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                formatter={(value) => metricFormat(metric, Number(value))}
                              />
                            }
                          />
                          <Area
                            dataKey={metric}
                            type="monotone"
                            stroke={
                              metric === "revenue"
                                ? "var(--chart-1)"
                                : metric === "qty"
                                ? "var(--chart-2)"
                                : "var(--chart-3)"
                            }
                            fill={
                              metric === "revenue"
                                ? "var(--chart-1)"
                                : metric === "qty"
                                ? "var(--chart-2)"
                                : "var(--chart-3)"
                            }
                            fillOpacity={0.22}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Frontend-only test (localStorage) — DB မလိုပါ
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
