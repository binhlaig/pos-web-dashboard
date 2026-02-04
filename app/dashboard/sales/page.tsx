// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { toast } from "sonner";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Badge } from "@/components/ui/badge";

// import {
//   LineChart,
//   Line,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
// } from "recharts";

// import { RefreshCw, Calendar, ShoppingBag, Coins, Search } from "lucide-react";

// type SaleLine = {
//   id: string;
//   product_id: string;
//   sku?: string | null;
//   product_name?: string | null;
//   qty: number;
//   price: number; // unit price (or line price depending backend)
// };

// type Sale = {
//   id: string;
//   created_at: string; // ISO
//   cashier_name?: string | null;
//   note?: string | null;
//   total?: number | null; // if backend provides
//   items?: SaleLine[]; // if backend provides
// };

// function cn(...classes: (string | false | null | undefined)[]) {
//   return classes.filter(Boolean).join(" ");
// }

// function money(n: number) {
//   return Number(n || 0).toLocaleString();
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

// function safeNumber(n: any) {
//   const x = Number(n);
//   return Number.isFinite(x) ? x : 0;
// }

// function calcSaleTotal(s: Sale) {
//   if (s.total != null) return safeNumber(s.total);
//   // fallback: calculate from items
//   if (Array.isArray(s.items)) {
//     return s.items.reduce((sum, it) => sum + safeNumber(it.price) * safeNumber(it.qty), 0);
//   }
//   return 0;
// }

// export default function SalesPage() {
//   const apiBase = process.env.NEXT_PUBLIC_API_URL;

//   // default: this month
//   const today = useMemo(() => new Date(), []);
//   const [from, setFrom] = useState(() => toDateInputValue(startOfMonth(new Date())));
//   const [to, setTo] = useState(() => toDateInputValue(new Date()));

//   const [q, setQ] = useState(""); // search by id/cashier/note
//   const [loading, setLoading] = useState(false);
//   const [sales, setSales] = useState<Sale[]>([]);
//   const [firstLoaded, setFirstLoaded] = useState(false);

//   async function loadSales() {
//     try {
//       setLoading(true);
//       const qs = new URLSearchParams();
//       if (from) qs.set("from", from);
//       if (to) qs.set("to", to);
//       if (q.trim()) qs.set("q", q.trim());

//       const res = await fetch(`${apiBase}/api/sales?${qs.toString()}`, {
//         credentials: "include",
//       });

//       const data = await res.json().catch(() => null);
//       if (!res.ok) {
//         toast.error(data?.message || `Sales load failed (status ${res.status})`);
//         setSales([]);
//         setFirstLoaded(true);
//         return;
//       }

//       setSales(Array.isArray(data) ? (data as Sale[]) : []);
//       setFirstLoaded(true);
//     } catch (e) {
//       console.error(e);
//       toast.error("Server error");
//       setFirstLoaded(true);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadSales();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const computed = useMemo(() => {
//     // totals
//     const totalRevenue = sales.reduce((sum, s) => sum + calcSaleTotal(s), 0);
//     const totalOrders = sales.length;

//     // daily aggregation for chart
//     const byDay = new Map<string, { day: string; revenue: number; orders: number }>();

//     for (const s of sales) {
//       const d = new Date(s.created_at);
//       if (Number.isNaN(d.getTime())) continue;
//       const key = toDateInputValue(d); // YYYY-MM-DD
//       const cur = byDay.get(key) || { day: key, revenue: 0, orders: 0 };
//       cur.revenue += calcSaleTotal(s);
//       cur.orders += 1;
//       byDay.set(key, cur);
//     }

//     const daily = Array.from(byDay.values()).sort((a, b) => (a.day < b.day ? -1 : 1));

//     // top products (if items available)
//     const prodMap = new Map<string, { name: string; qty: number; revenue: number }>();
//     for (const s of sales) {
//       if (!Array.isArray(s.items)) continue;
//       for (const it of s.items) {
//         const key = it.product_id || it.sku || it.product_name || "unknown";
//         const name = it.product_name || it.sku || it.product_id;
//         const cur = prodMap.get(key) || { name, qty: 0, revenue: 0 };
//         cur.qty += safeNumber(it.qty);
//         cur.revenue += safeNumber(it.qty) * safeNumber(it.price);
//         prodMap.set(key, cur);
//       }
//     }
//     const topProducts = Array.from(prodMap.values())
//       .sort((a, b) => b.revenue - a.revenue)
//       .slice(0, 8);

//     return { totalRevenue, totalOrders, daily, topProducts };
//   }, [sales]);

//   return (
//     <div className="w-full flex justify-center py-6 px-3">
//       <div className="w-full max-w-6xl space-y-4">
//         {/* Header */}
//         <Card>
//           <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//             <div className="space-y-1">
//               <CardTitle className="flex items-center gap-2">
//                 <ShoppingBag className="h-5 w-5" />
//                 Sales Dashboard
//               </CardTitle>
//               <CardDescription>
//                 Sale list + Daily revenue chart + Top products (optional)
//               </CardDescription>
//             </div>

//             <div className="flex flex-wrap items-center gap-2">
//               <div className="flex items-center gap-2">
//                 <Calendar className="h-4 w-4 text-muted-foreground" />
//                 <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[150px]" />
//                 <span className="text-muted-foreground text-sm">to</span>
//                 <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[150px]" />
//               </div>

//               <Button
//                 variant="outline"
//                 className="gap-2"
//                 onClick={loadSales}
//                 disabled={loading}
//               >
//                 <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
//                 Refresh
//               </Button>
//             </div>
//           </CardHeader>

//           <CardContent className="grid gap-3 md:grid-cols-3">
//             <div className="rounded-xl border p-3">
//               <div className="text-xs text-muted-foreground">Revenue</div>
//               <div className="text-2xl font-semibold flex items-center gap-2">
//                 <Coins className="h-5 w-5 text-muted-foreground" />
//                 {money(computed.totalRevenue)}
//               </div>
//               <div className="text-xs text-muted-foreground mt-1">
//                 From {from} to {to}
//               </div>
//             </div>

//             <div className="rounded-xl border p-3">
//               <div className="text-xs text-muted-foreground">Orders</div>
//               <div className="text-2xl font-semibold">{computed.totalOrders}</div>
//               <div className="text-xs text-muted-foreground mt-1">
//                 Total sales records
//               </div>
//             </div>

//             <div className="rounded-xl border p-3">
//               <div className="text-xs text-muted-foreground">Search</div>
//               <div className="flex gap-2 mt-2">
//                 <div className="relative flex-1">
//                   <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     className="pl-8"
//                     placeholder="sale id / cashier / note"
//                     value={q}
//                     onChange={(e) => setQ(e.target.value)}
//                   />
//                 </div>
//                 <Button variant="outline" onClick={loadSales} disabled={loading}>
//                   Go
//                 </Button>
//               </div>
//               <div className="text-xs text-muted-foreground mt-2">
//                 Backend supports ?q=... (optional)
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Charts */}
//         <div className="grid gap-4 lg:grid-cols-2">
//           <Card className="min-w-0">
//             <CardHeader>
//               <CardTitle>Daily Revenue</CardTitle>
//               <CardDescription>နေ့အလိုက် ရောင်းရငွေ</CardDescription>
//             </CardHeader>
//             <CardContent className="h-[320px]">
//               {computed.daily.length === 0 ? (
//                 <div className="text-sm text-muted-foreground">
//                   {loading ? "Loading..." : "No chart data"}
//                 </div>
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={computed.daily}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="day" />
//                     <YAxis />
//                     <Tooltip />
//                     <Line type="monotone" dataKey="revenue" strokeWidth={2} dot={false} />
//                   </LineChart>
//                 </ResponsiveContainer>
//               )}
//             </CardContent>
//           </Card>

//           <Card className="min-w-0">
//             <CardHeader>
//               <CardTitle>Top Products (by revenue)</CardTitle>
//               <CardDescription>
//                 Items data ပါလာရင် Top products chart ပေါ်မယ်
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="h-[320px]">
//               {computed.topProducts.length === 0 ? (
//                 <div className="text-sm text-muted-foreground">
//                   Items data မပါလို့ chart မပြနိုင်သေးပါ။ (sale response မှ items ထည့်ပေးပါ)
//                 </div>
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={computed.topProducts}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="name" hide />
//                     <YAxis />
//                     <Tooltip />
//                     <Bar dataKey="revenue" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Sales List */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Sales List</CardTitle>
//             <CardDescription>Invoice / Sale records စာရင်း</CardDescription>
//           </CardHeader>

//           <CardContent className="min-w-0">
//             <div className="text-xs text-muted-foreground mb-2">
//               {loading
//                 ? "Loading..."
//                 : `Showing ${sales.length} sales (from ${from} to ${to})`}
//             </div>

//             <div className="rounded-xl border overflow-hidden">
//               <ScrollArea className="h-[520px]">
//                 <table className="w-full text-sm min-w-[900px]">
//                   <thead className="sticky top-0 bg-background/95 backdrop-blur border-b">
//                     <tr className="text-left">
//                       <th className="p-3">Sale ID</th>
//                       <th className="p-3">Time</th>
//                       <th className="p-3">Cashier</th>
//                       <th className="p-3 text-right">Total</th>
//                       <th className="p-3">Note</th>
//                       <th className="p-3">Items</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {firstLoaded && sales.length === 0 ? (
//                       <tr>
//                         <td colSpan={6} className="p-4 text-muted-foreground">
//                           No sales found
//                         </td>
//                       </tr>
//                     ) : null}

//                     {sales.map((s) => {
//                       const total = calcSaleTotal(s);
//                       const itemsCount = Array.isArray(s.items)
//                         ? s.items.reduce((sum, it) => sum + safeNumber(it.qty), 0)
//                         : null;

//                       return (
//                         <tr key={s.id} className="border-b hover:bg-muted/40">
//                           <td className="p-3 font-mono text-xs">{s.id}</td>
//                           <td className="p-3 text-muted-foreground">
//                             {new Date(s.created_at).toLocaleString()}
//                           </td>
//                           <td className="p-3">
//                             {s.cashier_name ? (
//                               <Badge variant="secondary">{s.cashier_name}</Badge>
//                             ) : (
//                               <span className="text-muted-foreground">-</span>
//                             )}
//                           </td>
//                           <td className="p-3 text-right font-mono">
//                             {money(total)}
//                           </td>
//                           <td className="p-3 text-muted-foreground">
//                             {s.note || "-"}
//                           </td>
//                           <td className="p-3">
//                             {itemsCount != null ? (
//                               <Badge variant="outline">{itemsCount} pcs</Badge>
//                             ) : (
//                               <span className="text-muted-foreground text-xs">
//                                 (no items)
//                               </span>
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </ScrollArea>
//             </div>

//             <div className="text-xs text-muted-foreground mt-2">
//               Endpoint expected:{" "}
//               <code className="px-1 py-0.5 rounded bg-muted">
//                 GET /api/sales?from=YYYY-MM-DD&to=YYYY-MM-DD&q=...
//               </code>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }






"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

import {
  RefreshCw,
  Trash2,
  Plus,
  Calendar,
  ShoppingBag,
  Coins,
  Box,
  Wand2,
} from "lucide-react";

type TempSaleItem = {
  product_id: string;
  product_name: string;
  sku: string;
  qty: number;
  price: number; // unit price
};

type TempSale = {
  id: string;
  created_at: string; // ISO
  cashier_name?: string | null;
  note?: string | null;
  total: number;
  items: TempSaleItem[];
};

const LS_KEY = "TEMP_SALES_V1";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function money(n: number) {
  return Number(n || 0).toLocaleString();
}

function toDateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function uuid() {
  // simple frontend uuid
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readSales(): TempSale[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TempSale[]) : [];
  } catch {
    return [];
  }
}

function writeSales(sales: TempSale[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(sales));
}

function calcTotal(items: TempSaleItem[]) {
  return items.reduce((sum, it) => sum + Number(it.qty || 0) * Number(it.price || 0), 0);
}

export default function SalesTempFrontendPage() {
  const today = useMemo(() => new Date(), []);
  const [from, setFrom] = useState(() => toDateInputValue(startOfMonth(new Date())));
  const [to, setTo] = useState(() => toDateInputValue(new Date()));

  const [sales, setSales] = useState<TempSale[]>([]);
  const [loading, setLoading] = useState(false);

  // form state: quick add sale (1 item for demo)
  const [cashier, setCashier] = useState("Aung");
  const [note, setNote] = useState("temp sale");
  const [sku, setSku] = useState("SKU-001");
  const [name, setName] = useState("Coke");
  const [price, setPrice] = useState<number>(1200);
  const [qty, setQty] = useState<number>(1);

  function load() {
    setLoading(true);
    try {
      const all = readSales();
      setSales(all);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function clearAll() {
    writeSales([]);
    setSales([]);
    toast.success("Cleared temp sales");
  }

  function seedDemo() {
    const demoNames = ["Coke", "Bread", "Milk", "Egg", "Water", "Coffee", "Tea"];
    const now = Date.now();

    const demo: TempSale[] = Array.from({ length: 30 }).map((_, i) => {
      const dayOffset = Math.floor(Math.random() * 10); // last 10 days
      const created_at = new Date(now - dayOffset * 86400000).toISOString();

      const itemsCount = 1 + Math.floor(Math.random() * 3);
      const items: TempSaleItem[] = Array.from({ length: itemsCount }).map(() => {
        const n = demoNames[Math.floor(Math.random() * demoNames.length)];
        const q = 1 + Math.floor(Math.random() * 4);
        const p = 200 + Math.floor(Math.random() * 2000);
        return {
          product_id: `demo-${n}`,
          product_name: n,
          sku: `SKU-${n.toUpperCase()}`,
          qty: q,
          price: p,
        };
      });

      return {
        id: uuid(),
        created_at,
        cashier_name: Math.random() > 0.5 ? "Aung" : "Sai",
        note: "demo temp sale",
        total: calcTotal(items),
        items,
      };
    });

    const merged = [...demo, ...readSales()].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    writeSales(merged);
    setSales(merged);
    toast.success("Seeded demo sales ✅");
  }

  function createSale() {
    const safeQty = Math.max(1, Math.trunc(Number(qty || 1)));
    const safePrice = Math.max(0, Number(price || 0));

    const items: TempSaleItem[] = [
      {
        product_id: sku || "temp",
        product_name: name || "Unnamed",
        sku: sku || "SKU-NA",
        qty: safeQty,
        price: safePrice,
      },
    ];

    const sale: TempSale = {
      id: uuid(),
      created_at: new Date().toISOString(),
      cashier_name: cashier || null,
      note: note || null,
      total: calcTotal(items),
      items,
    };

    const merged = [sale, ...readSales()];
    writeSales(merged);
    setSales(merged);
    toast.success("Temp sale created ✅");
  }

  // filter by date range
  const filtered = useMemo(() => {
    const fromTs = from ? new Date(`${from}T00:00:00.000Z`).getTime() : -Infinity;
    const toTs = to ? new Date(`${to}T23:59:59.999Z`).getTime() : Infinity;

    return sales.filter((s) => {
      const t = new Date(s.created_at).getTime();
      return t >= fromTs && t <= toTs;
    });
  }, [sales, from, to]);

  const stats = useMemo(() => {
    const revenue = filtered.reduce((sum, s) => sum + Number(s.total || 0), 0);
    const orders = filtered.length;

    // daily aggregation for chart
    const byDay = new Map<string, { day: string; revenue: number; orders: number }>();
    for (const s of filtered) {
      const d = new Date(s.created_at);
      const key = toDateInputValue(d);
      const cur = byDay.get(key) || { day: key, revenue: 0, orders: 0 };
      cur.revenue += Number(s.total || 0);
      cur.orders += 1;
      byDay.set(key, cur);
    }
    const daily = Array.from(byDay.values()).sort((a, b) => (a.day < b.day ? -1 : 1));

    // top products
    const prodMap = new Map<string, { name: string; revenue: number; qty: number }>();
    for (const s of filtered) {
      for (const it of s.items) {
        const key = it.sku || it.product_id;
        const cur = prodMap.get(key) || { name: it.product_name || it.sku, revenue: 0, qty: 0 };
        cur.qty += Number(it.qty || 0);
        cur.revenue += Number(it.qty || 0) * Number(it.price || 0);
        prodMap.set(key, cur);
      }
    }
    const topProducts = Array.from(prodMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);

    return { revenue, orders, daily, topProducts };
  }, [filtered]);

  return (
    <div className="w-full flex justify-center py-6 px-3 overflow-x-hidden">
      <div className="w-full max-w-6xl space-y-4">
        {/* Header */}
        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Temp Sales (Frontend Only)
              </CardTitle>
              <CardDescription>
                DB မလို — localStorage ထဲမှာ သိမ်းပြီး chart + list test လုပ်နိုင်ပါတယ်
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-[150px]" />
                <span className="text-muted-foreground text-sm">to</span>
                <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-[150px]" />
              </div>

              <Button variant="outline" className="gap-2" onClick={load} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Reload
              </Button>

              <Button variant="outline" className="gap-2" onClick={seedDemo}>
                <Wand2 className="h-4 w-4" />
                Seed Demo
              </Button>

              <Button variant="destructive" className="gap-2" onClick={clearAll}>
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardHeader>

          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Revenue</div>
              <div className="text-2xl font-semibold flex items-center gap-2">
                <Coins className="h-5 w-5 text-muted-foreground" />
                {money(stats.revenue)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {from} → {to}
              </div>
            </div>

            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Orders</div>
              <div className="text-2xl font-semibold">{stats.orders}</div>
              <div className="text-xs text-muted-foreground mt-1">
                filtered sales count
              </div>
            </div>

            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Data store</div>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Box className="h-3.5 w-3.5" />
                  localStorage
                </Badge>
                <span className="text-xs text-muted-foreground">
                  (browser restart မပျောက်)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Create Temp Sale (demo) */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Create Temp Sale (Test)</CardTitle>
            <CardDescription>Frontend-only test အတွက် 1-item sale ကိုလွယ်လွယ်ထည့်နိုင်ပါတယ်</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-3 md:grid-cols-6">
            <div className="md:col-span-1">
              <div className="text-xs text-muted-foreground mb-1">Cashier</div>
              <Input value={cashier} onChange={(e) => setCashier(e.target.value)} />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-muted-foreground mb-1">Note</div>
              <Input value={note} onChange={(e) => setNote(e.target.value)} />
            </div>

            <div className="md:col-span-1">
              <div className="text-xs text-muted-foreground mb-1">SKU</div>
              <Input value={sku} onChange={(e) => setSku(e.target.value)} />
            </div>

            <div className="md:col-span-1">
              <div className="text-xs text-muted-foreground mb-1">Name</div>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="md:col-span-1 grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Price</div>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Qty</div>
                <Input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  min={1}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button className="gap-2" onClick={createSale}>
              <Plus className="h-4 w-4" />
              Create Temp Sale
            </Button>
          </CardFooter>
        </Card>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Daily Revenue</CardTitle>
              <CardDescription>နေ့အလိုက် ရောင်းရငွေ</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              {stats.daily.length === 0 ? (
                <div className="text-sm text-muted-foreground">No chart data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Revenue အများဆုံး product များ</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              {stats.topProducts.length === 0 ? (
                <div className="text-sm text-muted-foreground">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" hide />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle>Temp Sales List</CardTitle>
            <CardDescription>Front-end only sales records</CardDescription>
          </CardHeader>

          <CardContent className="min-w-0">
            <div className="text-xs text-muted-foreground mb-2">
              Showing <b>{filtered.length}</b> sales (filtered)
            </div>

            <div className="rounded-xl border overflow-hidden">
              <ScrollArea className="h-[520px]">
                <table className="w-full text-sm min-w-[980px]">
                  <thead className="sticky top-0 bg-background/95 backdrop-blur border-b">
                    <tr className="text-left">
                      <th className="p-3">ID</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Cashier</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3">Note</th>
                      <th className="p-3">Items</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-muted-foreground">
                          No sales
                        </td>
                      </tr>
                    ) : null}

                    {filtered.map((s) => {
                      const itemsCount = s.items.reduce((sum, it) => sum + Number(it.qty || 0), 0);
                      return (
                        <tr key={s.id} className="border-b hover:bg-muted/40">
                          <td className="p-3 font-mono text-xs">{s.id}</td>
                          <td className="p-3 text-muted-foreground">
                            {new Date(s.created_at).toLocaleString()}
                          </td>
                          <td className="p-3">
                            {s.cashier_name ? (
                              <Badge variant="secondary">{s.cashier_name}</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {money(s.total)}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {s.note || "-"}
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{itemsCount} pcs</Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {s.items.slice(0, 2).map((it) => (
                                <span key={it.sku} className="mr-2">
                                  {it.product_name} x{it.qty}
                                </span>
                              ))}
                              {s.items.length > 2 ? "..." : ""}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </ScrollArea>
            </div>

            <Separator className="my-3" />

            <div className="text-xs text-muted-foreground">
              ✅ Frontend-only test: data ကို localStorage ထဲ သိမ်းထားတာပါ။
              Production မှာတော့ backend + DB သို့ ပြောင်းဖို့လိုမယ်။
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
