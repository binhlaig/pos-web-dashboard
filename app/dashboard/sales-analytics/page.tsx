// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { toast } from "sonner";

// import {
//   Area,
//   AreaChart,
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
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";

// import {
//   Calendar,
//   Clock,
//   Wand2,
//   Trash2,
//   RefreshCw,
//   Plus,
//   TrendingUp,
//   ShoppingBag,
// } from "lucide-react";

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
//   cashier_name?: string | null;
//   note?: string | null;
//   items: SaleItem[];
// };

// type Granularity = "hour" | "day" | "month" | "year";

// const LS_KEY = "TEMP_SALES_SHADCN_CHART_V1";

// function cn(...classes: (string | false | null | undefined)[]) {
//   return classes.filter(Boolean).join(" ");
// }

// function money(n: number) {
//   return Number(n || 0).toLocaleString();
// }

// function uuid() {
//   return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
// }

// function toDateInputValue(d: Date) {
//   const yyyy = d.getFullYear();
//   const mm = String(d.getMonth() + 1).padStart(2, "0");
//   const dd = String(d.getDate()).padStart(2, "0");
//   return `${yyyy}-${mm}-${dd}`;
// }

// function startOfMonth(d: Date) {
//   return new Date(d.getFullYear(), d.getMonth(), 1);
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

// function calcTotal(items: SaleItem[]) {
//   return items.reduce((sum, it) => sum + Number(it.qty || 0) * Number(it.price || 0), 0);
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

// function niceLabel(g: Granularity) {
//   if (g === "hour") return "Hour";
//   if (g === "day") return "Day";
//   if (g === "month") return "Month";
//   return "Year";
// }

// export default function SalesAnalyticsShadcnAreaPage() {
//   const [from, setFrom] = useState(() => toDateInputValue(startOfMonth(new Date())));
//   const [to, setTo] = useState(() => toDateInputValue(new Date()));
//   const [granularity, setGranularity] = useState<Granularity>("day");

//   const [sales, setSales] = useState<Sale[]>([]);
//   const [loading, setLoading] = useState(false);

//   // quick add (frontend test)
//   const [sku, setSku] = useState("SKU-001");
//   const [name, setName] = useState("Coke");
//   const [qty, setQty] = useState(1);
//   const [price, setPrice] = useState(1200);

//   function load() {
//     setLoading(true);
//     try {
//       setSales(readSales());
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     load();
//   }, []);

//   function clearAll() {
//     writeSales([]);
//     setSales([]);
//     toast.success("Cleared");
//   }

//   function seedDemo() {
//     const demoNames = ["Coke", "Bread", "Milk", "Egg", "Water", "Coffee", "Tea", "Rice"];
//     const now = Date.now();

//     const demo: Sale[] = Array.from({ length: 120 }).map(() => {
//       const dayOffset = Math.floor(Math.random() * 90);
//       const hour = Math.floor(Math.random() * 24);
//       const minute = Math.floor(Math.random() * 60);

//       const d = new Date(now - dayOffset * 86400000);
//       d.setHours(hour, minute, 0, 0);

//       const itemsCount = 1 + Math.floor(Math.random() * 4);
//       const items: SaleItem[] = Array.from({ length: itemsCount }).map(() => {
//         const n = demoNames[Math.floor(Math.random() * demoNames.length)];
//         const q = 1 + Math.floor(Math.random() * 5);
//         const p = 200 + Math.floor(Math.random() * 2500);
//         return {
//           product_id: `demo-${n}`,
//           product_name: n,
//           sku: `SKU-${n.toUpperCase()}`,
//           qty: q,
//           price: p,
//         };
//       });

//       return {
//         id: uuid(),
//         created_at: d.toISOString(),
//         total: calcTotal(items),
//         cashier_name: Math.random() > 0.5 ? "Aung" : "Sai",
//         note: "demo sale",
//         items,
//       };
//     });

//     const merged = [...demo, ...readSales()].sort(
//       (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
//     );
//     writeSales(merged);
//     setSales(merged);
//     toast.success("Seeded demo ✅");
//   }

//   function quickAdd() {
//     const items: SaleItem[] = [
//       {
//         product_id: sku || "temp",
//         sku: sku || "SKU-NA",
//         product_name: name || "Unnamed",
//         qty: Math.max(1, Math.trunc(Number(qty || 1))),
//         price: Math.max(0, Number(price || 0)),
//       },
//     ];

//     const sale: Sale = {
//       id: uuid(),
//       created_at: new Date().toISOString(),
//       total: calcTotal(items),
//       cashier_name: "Test",
//       note: "quick add",
//       items,
//     };

//     const merged = [sale, ...readSales()];
//     writeSales(merged);
//     setSales(merged);
//     toast.success("Added ✅");
//   }

//   const filtered = useMemo(() => {
//     const fromTs = from ? new Date(`${from}T00:00:00.000Z`).getTime() : -Infinity;
//     const toTs = to ? new Date(`${to}T23:59:59.999Z`).getTime() : Infinity;
//     return sales.filter((s) => {
//       const t = new Date(s.created_at).getTime();
//       return t >= fromTs && t <= toTs;
//     });
//   }, [sales, from, to]);

//   const analytics = useMemo(() => {
//     const revenue = filtered.reduce((sum, s) => sum + Number(s.total || 0), 0);
//     const orders = filtered.length;

//     const bucket = new Map<string, { bucket: string; revenue: number; orders: number }>();
//     for (const s of filtered) {
//       const d = new Date(s.created_at);
//       const k = groupKey(d, granularity);
//       const cur = bucket.get(k) || { bucket: k, revenue: 0, orders: 0 };
//       cur.revenue += Number(s.total || 0);
//       cur.orders += 1;
//       bucket.set(k, cur);
//     }

//     const series = Array.from(bucket.values()).sort((a, b) => sortKey(a.bucket, b.bucket));
//     return { revenue, orders, series };
//   }, [filtered, granularity]);

//   // ✅ shadcn chart config (uses CSS vars like --chart-1 / --chart-2)
//   const chartConfig = {
//     revenue: { label: "Revenue" },
//     orders: { label: "Orders" },
//   } as const;

//   return (
//     <div className="w-full flex justify-center py-6 px-3">
//       <div className="w-full max-w-6xl space-y-4">
//         {/* Header */}
//         <Card className="overflow-hidden">
//           <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//             <div className="space-y-1">
//               <CardTitle className="flex items-center gap-2">
//                 <TrendingUp className="h-5 w-5" />
//                 Sales Analytics (Shadcn Area Chart)
//               </CardTitle>
//               <CardDescription>
//                 Hour / Day / Month / Year အလိုက် ရောင်းအားကို shadcn chart design နဲ့ကြည့်နိုင်ပါတယ်
//               </CardDescription>
//             </div>

//             <div className="flex flex-wrap items-center gap-2">
//               <Badge variant="secondary" className="gap-1">
//                 <Clock className="h-3.5 w-3.5" />
//                 {niceLabel(granularity)}
//               </Badge>

//               <div className="flex items-center gap-2">
//                 <Calendar className="h-4 w-4 text-muted-foreground" />
//                 <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[150px]" />
//                 <span className="text-muted-foreground text-sm">to</span>
//                 <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[150px]" />
//               </div>

//               <Button variant="outline" size="sm" className="gap-2" onClick={load} disabled={loading}>
//                 <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
//                 Reload
//               </Button>

//               <Button variant="outline" size="sm" className="gap-2" onClick={seedDemo}>
//                 <Wand2 className="h-4 w-4" />
//                 Seed
//               </Button>

//               <Button variant="destructive" size="sm" className="gap-2" onClick={clearAll}>
//                 <Trash2 className="h-4 w-4" />
//                 Clear
//               </Button>
//             </div>
//           </CardHeader>

//           <CardContent className="grid gap-3 md:grid-cols-4">
//             {/* Revenue stat */}
//             <div className="rounded-2xl border bg-card/50 p-4">
//               <div className="text-xs text-muted-foreground">Revenue</div>
//               <div className="mt-1 text-2xl font-semibold">{money(analytics.revenue)}</div>
//               <div className="text-xs text-muted-foreground mt-1">{from} → {to}</div>
//             </div>

//             {/* Orders stat */}
//             <div className="rounded-2xl border bg-card/50 p-4">
//               <div className="text-xs text-muted-foreground">Orders</div>
//               <div className="mt-1 text-2xl font-semibold">{analytics.orders}</div>
//               <div className="text-xs text-muted-foreground mt-1">Sales count</div>
//             </div>

//             {/* Granularity switch */}
//             <div className="rounded-2xl border bg-card/50 p-4">
//               <div className="text-xs text-muted-foreground mb-2">Group by</div>
//               <div className="flex flex-wrap gap-2">
//                 <Button size="sm" variant={granularity === "hour" ? "default" : "outline"} onClick={() => setGranularity("hour")}>
//                   Hour
//                 </Button>
//                 <Button size="sm" variant={granularity === "day" ? "default" : "outline"} onClick={() => setGranularity("day")}>
//                   Day
//                 </Button>
//                 <Button size="sm" variant={granularity === "month" ? "default" : "outline"} onClick={() => setGranularity("month")}>
//                   Month
//                 </Button>
//                 <Button size="sm" variant={granularity === "year" ? "default" : "outline"} onClick={() => setGranularity("year")}>
//                   Year
//                 </Button>
//               </div>
//               <div className="text-xs text-muted-foreground mt-2">
//                 Hour များရင် label rotate လုပ်ထားပါတယ်
//               </div>
//             </div>

//             {/* Quick add */}
//             <div className="rounded-2xl border bg-card/50 p-4">
//               <div className="text-xs text-muted-foreground">Quick add (test)</div>
//               <div className="mt-2 grid grid-cols-2 gap-2">
//                 <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU" />
//                 <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
//                 <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="Price" />
//                 <Input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} placeholder="Qty" />
//               </div>
//               <Button className="mt-2 w-full gap-2" onClick={quickAdd}>
//                 <Plus className="h-4 w-4" />
//                 Add
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         {/* ✅ Shadcn Area Charts */}
//         <div className="grid gap-4 lg:grid-cols-2">
//           {/* Revenue Area */}
//           <Card className="overflow-hidden">
//             <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
//               <div>
//                 <CardTitle>Revenue</CardTitle>
//                 <CardDescription>{niceLabel(granularity)} အလိုက် ရောင်းရငွေ</CardDescription>
//               </div>
//               <Badge variant="secondary">Area</Badge>
//             </CardHeader>

//             <CardContent className="h-[320px]">
//               {analytics.series.length === 0 ? (
//                 <div className="text-sm text-muted-foreground">No data (Seed လုပ်ပါ)</div>
//               ) : (
//                 <ChartContainer config={chartConfig} className="h-full w-full">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <AreaChart
//                       data={analytics.series}
//                       margin={{ left: 8, right: 12, top: 12, bottom: granularity === "hour" ? 44 : 16 }}
//                     >
//                       <CartesianGrid vertical={false} />
//                       <XAxis
//                         dataKey="bucket"
//                         tickLine={false}
//                         axisLine={false}
//                         interval={granularity === "hour" ? 2 : 0}
//                         angle={granularity === "hour" ? -35 : 0}
//                         textAnchor={granularity === "hour" ? "end" : "middle"}
//                         height={granularity === "hour" ? 70 : 30}
//                       />
//                       <YAxis tickLine={false} axisLine={false} />
//                       <ChartTooltip content={<ChartTooltipContent />} />

//                       {/* ✅ shadcn style: fill uses CSS var */}
//                       <Area
//                         dataKey="revenue"
//                         type="monotone"
//                         stroke="var(--chart-1)"
//                         fill="var(--chart-1)"
//                         fillOpacity={0.18}
//                         strokeWidth={2}
//                       />
//                     </AreaChart>
//                   </ResponsiveContainer>
//                 </ChartContainer>
//               )}
//             </CardContent>
//           </Card>

//           {/* Orders Area */}
//           <Card className="overflow-hidden">
//             <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
//               <div>
//                 <CardTitle>Orders</CardTitle>
//                 <CardDescription>{niceLabel(granularity)} အလိုက် အော်ဒါအရေအတွက်</CardDescription>
//               </div>
//               <Badge variant="secondary">Area</Badge>
//             </CardHeader>

//             <CardContent className="h-[320px]">
//               {analytics.series.length === 0 ? (
//                 <div className="text-sm text-muted-foreground">No data (Seed လုပ်ပါ)</div>
//               ) : (
//                 <ChartContainer config={chartConfig} className="h-full w-full">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <AreaChart
//                       data={analytics.series}
//                       margin={{ left: 8, right: 12, top: 12, bottom: granularity === "hour" ? 44 : 16 }}
//                     >
//                       <CartesianGrid vertical={false} />
//                       <XAxis
//                         dataKey="bucket"
//                         tickLine={false}
//                         axisLine={false}
//                         interval={granularity === "hour" ? 2 : 0}
//                         angle={granularity === "hour" ? -35 : 0}
//                         textAnchor={granularity === "hour" ? "end" : "middle"}
//                         height={granularity === "hour" ? 70 : 30}
//                       />
//                       <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
//                       <ChartTooltip content={<ChartTooltipContent />} />

//                       <Area
//                         dataKey="orders"
//                         type="monotone"
//                         stroke="var(--chart-2)"
//                         fill="var(--chart-2)"
//                         fillOpacity={0.18}
//                         strokeWidth={2}
//                       />
//                     </AreaChart>
//                   </ResponsiveContainer>
//                 </ChartContainer>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* List */}
//         <Card className="overflow-hidden">
//           <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
//             <div>
//               <CardTitle>Sales List</CardTitle>
//               <CardDescription>Frontend-only (localStorage) list</CardDescription>
//             </div>
//             <Badge variant="outline" className="gap-1">
//               <ShoppingBag className="h-3.5 w-3.5" />
//               {filtered.length} sales
//             </Badge>
//           </CardHeader>

//           <CardContent className="min-w-0">
//             <div className="rounded-xl border overflow-hidden">
//               <ScrollArea className="h-[520px]">
//                 <table className="w-full text-sm min-w-[980px]">
//                   <thead className="sticky top-0 bg-background/95 backdrop-blur border-b">
//                     <tr className="text-left">
//                       <th className="p-3">Time</th>
//                       <th className="p-3">Sale ID</th>
//                       <th className="p-3 text-right">Total</th>
//                       <th className="p-3">Items</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filtered.length === 0 ? (
//                       <tr>
//                         <td colSpan={4} className="p-4 text-muted-foreground">
//                           No sales — Seed ကိုနှိပ်ပြီး demo data ထည့်ပါ
//                         </td>
//                       </tr>
//                     ) : null}

//                     {filtered.map((s) => {
//                       const pcs = s.items.reduce((sum, it) => sum + Number(it.qty || 0), 0);
//                       return (
//                         <tr key={s.id} className="border-b hover:bg-muted/40">
//                           <td className="p-3 text-muted-foreground">
//                             {new Date(s.created_at).toLocaleString()}
//                           </td>
//                           <td className="p-3 font-mono text-xs">{s.id}</td>
//                           <td className="p-3 text-right font-mono font-medium">{money(s.total)}</td>
//                           <td className="p-3">
//                             <Badge variant="secondary">{pcs} pcs</Badge>
//                             <div className="text-xs text-muted-foreground mt-1">
//                               {s.items.slice(0, 3).map((it) => (
//                                 <span key={it.sku} className="mr-2">
//                                   {it.product_name} x{it.qty}
//                                 </span>
//                               ))}
//                               {s.items.length > 3 ? "..." : ""}
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </ScrollArea>
//             </div>

//             <Separator className="my-3" />
//             <div className="text-xs text-muted-foreground">
//               ✅ Shadcn chart component သုံးထားတဲ့အတွက် tooltip/grid/typography က လှပြီး theme နဲ့ကိုက်ပါတယ်
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }




"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import { TrendingUp, Clock, Calendar } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Types */
/* ------------------------------------------------------------------ */
type Sale = {
  id: string;
  created_at: string;
  total: number;
};

type Granularity = "hour" | "day" | "month" | "year";
type Metric = "revenue" | "orders";

/* ------------------------------------------------------------------ */
/* Utils */
/* ------------------------------------------------------------------ */
const LS_KEY = "TEMP_SALES_ANALYTICS_V2";

function money(n: number) {
  return Number(n || 0).toLocaleString();
}

function readSales(): Sale[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function seedDemo() {
  const now = Date.now();
  const sales: Sale[] = Array.from({ length: 200 }).map(() => {
    const dayOffset = Math.floor(Math.random() * 14);
    const hour = Math.floor(Math.random() * 24);

    const d = new Date(now - dayOffset * 86400000);
    d.setHours(hour, 0, 0, 0);

    return {
      id: crypto.randomUUID(),
      created_at: d.toISOString(),
      total: 500 + Math.floor(Math.random() * 5000),
    };
  });

  localStorage.setItem(LS_KEY, JSON.stringify(sales));
}

/* ------------------------------------------------------------------ */
/* Bucket Builders */
/* ------------------------------------------------------------------ */
function buildHourBuckets() {
  return Array.from({ length: 24 }).map((_, h) => ({
    label: `${String(h).padStart(2, "0")}:00`,
    hour: h,
    revenue: 0,
    orders: 0,
  }));
}

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sun
  const diff = date.getDate() - day;
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/* ------------------------------------------------------------------ */
/* Page */
/* ------------------------------------------------------------------ */
export default function SalesAnalyticsPage() {
  const [granularity, setGranularity] = useState<Granularity>("hour");
  const [metric, setMetric] = useState<Metric>("revenue");

  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    if (readSales().length === 0) seedDemo();
    setSales(readSales());
  }, []);

  /* ----------------------- Build comparison data ------------------- */
  const chartData = useMemo(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

    // Hour mode (24 fixed)
    if (granularity === "hour") {
      const thisWeek = buildHourBuckets();
      const lastWeek = buildHourBuckets();

      for (const s of sales) {
        const d = new Date(s.created_at);
        const h = d.getHours();

        if (d >= thisWeekStart) {
          thisWeek[h].revenue += s.total;
          thisWeek[h].orders += 1;
        } else if (d >= lastWeekStart && d < thisWeekStart) {
          lastWeek[h].revenue += s.total;
          lastWeek[h].orders += 1;
        }
      }

      return thisWeek.map((b, i) => ({
        label: b.label,
        thisWeek: b[metric],
        lastWeek: lastWeek[i][metric],
      }));
    }

    // Day / Month / Year (simple grouping)
    const map = new Map<string, any>();

    for (const s of sales) {
      const d = new Date(s.created_at);
      let key = "";

      if (granularity === "day") {
        key = d.toISOString().slice(0, 10);
      } else if (granularity === "month") {
        key = d.toISOString().slice(0, 7);
      } else {
        key = String(d.getFullYear());
      }

      const row =
        map.get(key) || {
          label: key,
          thisWeek: 0,
          lastWeek: 0,
        };

      if (d >= thisWeekStart) {
        row.thisWeek += metric === "revenue" ? s.total : 1;
      } else if (d >= lastWeekStart && d < thisWeekStart) {
        row.lastWeek += metric === "revenue" ? s.total : 1;
      }

      map.set(key, row);
    }

    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [sales, granularity, metric]);

  const chartConfig = {
    thisWeek: { label: "This Week" },
    lastWeek: { label: "Last Week" },
  } as const;

  /* ------------------------------------------------------------------ */
  return (
    <div className="flex justify-center py-8 px-3">
      <div className="w-full max-w-5xl space-y-4">
        {/* Header */}
        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Sales Analytics
              </CardTitle>
              <CardDescription>
                Revenue / Orders · Hour / Day / Month / Year · Week Comparison
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Metric toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm">Orders</span>
                <Switch
                  checked={metric === "revenue"}
                  onCheckedChange={(v) =>
                    setMetric(v ? "revenue" : "orders")
                  }
                />
                <span className="text-sm">Revenue</span>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Granularity */}
              <div className="flex gap-2">
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
            </div>
          </CardHeader>
        </Card>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {metric === "revenue" ? "Revenue" : "Orders"} – This Week vs Last
              Week
            </CardTitle>
            <CardDescription>
              Hour mode မှာ 24 hours ကို always ပြပါတယ်
            </CardDescription>
          </CardHeader>

          <CardContent className="h-[360px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />

                  {/* This week */}
                  <Area
                    dataKey="thisWeek"
                    type="monotone"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />

                  {/* Last week */}
                  <Area
                    dataKey="lastWeek"
                    type="monotone"
                    stroke="var(--chart-2)"
                    fill="var(--chart-2)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="text-xs text-muted-foreground">
          ✅ Frontend only (localStorage) · Shadcn Area Chart · Comparison enabled
        </div>
      </div>
    </div>
  );
}
