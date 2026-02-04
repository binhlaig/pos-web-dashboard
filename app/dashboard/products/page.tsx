// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   BarChart,
//   Bar,
//   Tooltip,
// } from "recharts";

// import {
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// import {
//   Package,
//   Search,
//   RefreshCw,
//   TrendingUp,
//   AlertTriangle,
//   Boxes,
//   Tag,
//   ChevronRight,
//   ShoppingCart,
// } from "lucide-react";
// import { toast } from "sonner";

// /* ----------------------------- Types ----------------------------- */
// type Product = {
//   id: string;
//   sku: string;
//   product_name: string;
//   product_price: number;
//   product_quantity_amount: number;
//   category?: string | null;
//   product_type?: string | null;
//   product_discount?: number | null;
// };

// type ProductEvent = {
//   at: string; // YYYY-MM-DD
//   sku: string;
//   type: "SALE" | "RESTOCK";
//   qty: number;
//   revenue: number; // for SALE
// };

// const LS_PRODUCTS = "DASH_PRODUCTS_V1";
// const LS_EVENTS = "DASH_PRODUCT_EVENTS_V1";

// /* ----------------------------- Utils ----------------------------- */
// function cn(...classes: (string | false | null | undefined)[]) {
//   return classes.filter(Boolean).join(" ");
// }

// function money(n: number) {
//   return Number(n || 0).toLocaleString();
// }

// function isoDay(d: Date) {
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   return `${y}-${m}-${day}`;
// }

// function readLS<T>(key: string, fallback: T): T {
//   try {
//     const raw = localStorage.getItem(key);
//     if (!raw) return fallback;
//     return JSON.parse(raw) as T;
//   } catch {
//     return fallback;
//   }
// }

// function writeLS<T>(key: string, val: T) {
//   localStorage.setItem(key, JSON.stringify(val));
// }

// function uuid() {
//   return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
// }

// /* ----------------------------- Demo Seed ----------------------------- */
// function seedDemo() {
//   const products: Product[] = [
//     {
//       id: uuid(),
//       sku: "SKU-COKE",
//       product_name: "Coke",
//       product_price: 1200,
//       product_quantity_amount: 18,
//       category: "Drink",
//       product_type: "unit",
//       product_discount: 0,
//     },
//     {
//       id: uuid(),
//       sku: "SKU-BREAD",
//       product_name: "Bread",
//       product_price: 900,
//       product_quantity_amount: 4,
//       category: "Food",
//       product_type: "unit",
//       product_discount: 0,
//     },
//     {
//       id: uuid(),
//       sku: "SKU-MILK",
//       product_name: "Milk",
//       product_price: 1500,
//       product_quantity_amount: 0,
//       category: "Drink",
//       product_type: "unit",
//       product_discount: 100,
//     },
//     {
//       id: uuid(),
//       sku: "SKU-RICE",
//       product_name: "Rice 5kg",
//       product_price: 8500,
//       product_quantity_amount: 9,
//       category: "Grocery",
//       product_type: "pack",
//       product_discount: 0,
//     },
//     {
//       id: uuid(),
//       sku: "SKU-NOODLE",
//       product_name: "Noodle",
//       product_price: 700,
//       product_quantity_amount: 30,
//       category: "Food",
//       product_type: "unit",
//       product_discount: 0,
//     },
//     {
//       id: uuid(),
//       sku: "SKU-SNACK",
//       product_name: "Snack",
//       product_price: 500,
//       product_quantity_amount: 2,
//       category: "Food",
//       product_type: "unit",
//       product_discount: 0,
//     },
//   ];

//   // last 30 days events
//   const now = new Date();
//   const events: ProductEvent[] = [];
//   for (let i = 0; i < 30; i++) {
//     const d = new Date(now);
//     d.setDate(now.getDate() - i);
//     const day = isoDay(d);

//     // random events
//     const loops = 2 + Math.floor(Math.random() * 4);
//     for (let k = 0; k < loops; k++) {
//       const p = products[Math.floor(Math.random() * products.length)];
//       const sale = Math.random() > 0.35;
//       const qty = 1 + Math.floor(Math.random() * 5);
//       const revenue = sale ? qty * p.product_price : 0;

//       events.push({
//         at: day,
//         sku: p.sku,
//         type: sale ? "SALE" : "RESTOCK",
//         qty,
//         revenue,
//       });
//     }
//   }

//   writeLS(LS_PRODUCTS, products);
//   writeLS(LS_EVENTS, events);
// }

// /* ----------------------------- Page ----------------------------- */
// export default function ProductDashboardPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [events, setEvents] = useState<ProductEvent[]>([]);
//   const [loading, setLoading] = useState(false);

//   // UI
//   const [q, setQ] = useState("");
//   const [selectedSku, setSelectedSku] = useState<string>("");

//   function reload() {
//     setLoading(true);
//     try {
//       const p = readLS<Product[]>(LS_PRODUCTS, []);
//       const e = readLS<ProductEvent[]>(LS_EVENTS, []);
//       if (p.length === 0 || e.length === 0) seedDemo();
//       setProducts(readLS<Product[]>(LS_PRODUCTS, []));
//       setEvents(readLS<ProductEvent[]>(LS_EVENTS, []));
//       toast.success("Dashboard data loaded ✅");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     reload();
//   }, []);

//   /* ----------------------------- KPIs ----------------------------- */
//   const kpis = useMemo(() => {
//     const totalProducts = products.length;
//     const totalStock = products.reduce(
//       (sum, p) => sum + Number(p.product_quantity_amount || 0),
//       0,
//     );
//     const outOfStock = products.filter((p) => (p.product_quantity_amount ?? 0) <= 0).length;
//     const lowStock = products.filter((p) => {
//       const s = p.product_quantity_amount ?? 0;
//       return s > 0 && s < 5;
//     }).length;

//     // last 7 days revenue
//     const today = new Date();
//     const days = new Set<string>();
//     for (let i = 0; i < 7; i++) {
//       const d = new Date(today);
//       d.setDate(today.getDate() - i);
//       days.add(isoDay(d));
//     }
//     const revenue7d = events
//       .filter((x) => x.type === "SALE" && days.has(x.at))
//       .reduce((sum, x) => sum + Number(x.revenue || 0), 0);

//     return { totalProducts, totalStock, outOfStock, lowStock, revenue7d };
//   }, [products, events]);

//   /* ----------------------------- Trend chart (30 days) ----------------------------- */
//   const trend30 = useMemo(() => {
//     const map = new Map<string, { day: string; revenue: number; sold: number }>();

//     for (const ev of events) {
//       const cur = map.get(ev.at) || { day: ev.at, revenue: 0, sold: 0 };
//       if (ev.type === "SALE") {
//         cur.revenue += Number(ev.revenue || 0);
//         cur.sold += Number(ev.qty || 0);
//       }
//       map.set(ev.at, cur);
//     }

//     return Array.from(map.values()).sort((a, b) => (a.day < b.day ? -1 : 1));
//   }, [events]);

//   /* ----------------------------- Category revenue (top 6) ----------------------------- */
//   const categoryBar = useMemo(() => {
//     const bySku = new Map<string, Product>();
//     products.forEach((p) => bySku.set(p.sku, p));

//     const map = new Map<string, number>();
//     for (const ev of events) {
//       if (ev.type !== "SALE") continue;
//       const p = bySku.get(ev.sku);
//       const cat = (p?.category || "Uncategorized").trim();
//       map.set(cat, (map.get(cat) || 0) + Number(ev.revenue || 0));
//     }

//     return Array.from(map.entries())
//       .map(([category, revenue]) => ({ category, revenue }))
//       .sort((a, b) => b.revenue - a.revenue)
//       .slice(0, 6);
//   }, [events, products]);

//   /* ----------------------------- Table (Products) ----------------------------- */
//   const filteredProducts = useMemo(() => {
//     const kw = q.trim().toLowerCase();
//     let rows = products;
//     if (kw) {
//       rows = rows.filter(
//         (p) =>
//           p.sku.toLowerCase().includes(kw) ||
//           p.product_name.toLowerCase().includes(kw),
//       );
//     }
//     // sort: low stock first then revenue-ish by price*qty
//     return rows.slice().sort((a, b) => {
//       const sa = a.product_quantity_amount ?? 0;
//       const sb = b.product_quantity_amount ?? 0;
//       if (sa === sb) return b.product_price - a.product_price;
//       return sa - sb;
//     });
//   }, [products, q]);

//   useEffect(() => {
//     if (!selectedSku && products.length > 0) setSelectedSku(products[0].sku);
//   }, [products, selectedSku]);

//   /* ----------------------------- Selected product chart (7 days) ----------------------------- */
//   const selectedSeries7 = useMemo(() => {
//     if (!selectedSku) return [];
//     const today = new Date();
//     const days: string[] = [];
//     for (let i = 6; i >= 0; i--) {
//       const d = new Date(today);
//       d.setDate(today.getDate() - i);
//       days.push(isoDay(d));
//     }

//     const map = new Map<string, { day: string; revenue: number; qty: number; orders: number }>();
//     days.forEach((day) => map.set(day, { day, revenue: 0, qty: 0, orders: 0 }));

//     for (const ev of events) {
//       if (ev.sku !== selectedSku) continue;
//       const cur = map.get(ev.at);
//       if (!cur) continue;

//       if (ev.type === "SALE") {
//         cur.revenue += Number(ev.revenue || 0);
//         cur.qty += Number(ev.qty || 0);
//         cur.orders += 1;
//       }
//     }

//     return Array.from(map.values()).sort((a, b) => (a.day < b.day ? -1 : 1));
//   }, [events, selectedSku]);

//   const selectedProduct = useMemo(
//     () => products.find((p) => p.sku === selectedSku) || null,
//     [products, selectedSku],
//   );

//   const chartConfig = {
//     revenue: { label: "Revenue" },
//     sold: { label: "Sold" },
//     qty: { label: "Qty" },
//     orders: { label: "Orders" },
//   } as const;

//   return (
//     <div className="w-full flex justify-center py-8 px-3">
//       <div className="w-full max-w-7xl space-y-4">
//         {/* Header */}
//         <Card className="overflow-hidden">
//           <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//             <div className="space-y-1">
//               <CardTitle className="flex items-center gap-2">
//                 <Package className="h-5 w-5" />
//                 Product Dashboard
//               </CardTitle>
//               <CardDescription>
//                 Products overview + trend charts + low stock alerts (frontend-only demo)
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
//                   reload();
//                   toast.success("Seeded demo ✅");
//                 }}
//                 className="gap-2"
//               >
//                 <Tag className="h-4 w-4" />
//                 Seed demo
//               </Button>
//             </div>
//           </CardHeader>
//         </Card>

//         {/* KPI Cards */}
//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
//           <KpiCard title="Products" value={kpis.totalProducts} icon={<Package className="h-4 w-4" />} />
//           <KpiCard title="Total Stock" value={kpis.totalStock} icon={<Boxes className="h-4 w-4" />} />
//           <KpiCard title="Out of Stock" value={kpis.outOfStock} icon={<AlertTriangle className="h-4 w-4" />} tone="danger" />
//           <KpiCard title="Low Stock" value={kpis.lowStock} icon={<AlertTriangle className="h-4 w-4" />} tone="warning" />
//           <KpiCard title="Revenue (7d)" value={money(kpis.revenue7d)} icon={<TrendingUp className="h-4 w-4" />} />
//         </div>

//         {/* Charts row */}
//         <div className="grid gap-4 lg:grid-cols-5">
//           {/* 30d Trend */}
//           <Card className="lg:col-span-3 overflow-hidden">
//             <CardHeader className="space-y-1">
//               <CardTitle className="flex items-center gap-2">
//                 <TrendingUp className="h-5 w-5" />
//                 Revenue Trend (30 days)
//               </CardTitle>
//               <CardDescription>Daily revenue (demo events)</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="h-[320px]">
//                 <ChartContainer config={chartConfig} className="h-full w-full">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <AreaChart data={trend30} margin={{ left: 8, right: 12, top: 12, bottom: 0 }}>
//                       <CartesianGrid vertical={false} />
//                       <XAxis dataKey="day" tickLine={false} axisLine={false} />
//                       <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => money(v)} />
//                       <ChartTooltip content={<ChartTooltipContent formatter={(v) => money(Number(v))} />} />
//                       <Area
//                         type="monotone"
//                         dataKey="revenue"
//                         stroke="var(--chart-1)"
//                         fill="var(--chart-1)"
//                         fillOpacity={0.22}
//                         strokeWidth={2}
//                       />
//                     </AreaChart>
//                   </ResponsiveContainer>
//                 </ChartContainer>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Category bar */}
//           <Card className="lg:col-span-2 overflow-hidden">
//             <CardHeader className="space-y-1">
//               <CardTitle>Top Categories</CardTitle>
//               <CardDescription>Revenue by category</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="h-[320px]">
//                 <ChartContainer config={chartConfig} className="h-full w-full">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={categoryBar} margin={{ left: 8, right: 12, top: 12, bottom: 0 }}>
//                       <CartesianGrid vertical={false} />
//                       <XAxis dataKey="category" tickLine={false} axisLine={false} />
//                       <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => money(v)} />
//                       <Tooltip />
//                       <Bar dataKey="revenue" fill="var(--chart-2)" radius={8} />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </ChartContainer>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Table + Selected product details */}
//         <div className="grid gap-4 lg:grid-cols-5">
//           {/* Products Table */}
//           <Card className="lg:col-span-3 overflow-hidden">
//             <CardHeader className="space-y-2">
//               <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
//                 <div>
//                   <CardTitle className="flex items-center gap-2">
//                     <ShoppingCart className="h-5 w-5" />
//                     Products List
//                   </CardTitle>
//                   <CardDescription>Click row → right chart (7 days)</CardDescription>
//                 </div>

//                 <div className="relative w-full md:max-w-sm">
//                   <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     className="pl-8"
//                     placeholder="Search SKU / Name..."
//                     value={q}
//                     onChange={(e) => setQ(e.target.value)}
//                   />
//                 </div>
//               </div>
//             </CardHeader>

//             <CardContent className="p-0">
//               <div className="border-t" />
//               <ScrollArea className="h-[440px]">
//                 <Table>
//                   <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10">
//                     <TableRow>
//                       <TableHead className="w-[80px]">SKU</TableHead>
//                       <TableHead>Product</TableHead>
//                       <TableHead className="text-right">Price</TableHead>
//                       <TableHead className="text-right">Stock</TableHead>
//                       <TableHead>Category</TableHead>
//                       <TableHead className="text-right">Discount</TableHead>
//                       <TableHead className="text-right">Action</TableHead>
//                     </TableRow>
//                   </TableHeader>

//                   <TableBody>
//                     {filteredProducts.map((p) => {
//                       const stock = p.product_quantity_amount ?? 0;
//                       const active = p.sku === selectedSku;

//                       return (
//                         <TableRow
//                           key={p.id}
//                           className={cn(
//                             "cursor-pointer transition",
//                             active ? "bg-muted/70" : "hover:bg-muted/40",
//                           )}
//                           onClick={() => setSelectedSku(p.sku)}
//                         >
//                           <TableCell className="font-mono text-xs">{p.sku}</TableCell>
//                           <TableCell>
//                             <div className="flex flex-col min-w-0">
//                               <span className="font-medium truncate">{p.product_name}</span>
//                               <span className="text-xs text-muted-foreground truncate">
//                                 {p.product_type || "-"}
//                               </span>
//                             </div>
//                           </TableCell>
//                           <TableCell className="text-right font-semibold tabular-nums">
//                             {money(p.product_price)}
//                           </TableCell>
//                           <TableCell className="text-right">
//                             <span
//                               className={cn(
//                                 "font-semibold tabular-nums",
//                                 stock <= 0 && "text-red-600",
//                                 stock > 0 && stock < 5 && "text-amber-600",
//                               )}
//                             >
//                               {stock}
//                             </span>
//                           </TableCell>
//                           <TableCell>
//                             {p.category ? <Badge variant="outline">{p.category}</Badge> : "-"}
//                           </TableCell>
//                           <TableCell className="text-right">
//                             {p.product_discount ? (
//                               <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
//                                 -{p.product_discount}
//                               </Badge>
//                             ) : (
//                               <span className="text-xs text-muted-foreground">0</span>
//                             )}
//                           </TableCell>
//                           <TableCell className="text-right">
//                             <Button size="sm" variant="outline" className="gap-1">
//                               View <ChevronRight className="h-4 w-4" />
//                             </Button>
//                           </TableCell>
//                         </TableRow>
//                       );
//                     })}
//                   </TableBody>
//                 </Table>
//               </ScrollArea>
//             </CardContent>
//           </Card>

//           {/* Selected product panel */}
//           <Card className="lg:col-span-2 overflow-hidden">
//             <CardHeader className="space-y-1">
//               <CardTitle>Selected Product (7 days)</CardTitle>
//               <CardDescription>
//                 {selectedProduct ? (
//                   <>
//                     <span className="font-medium">{selectedProduct.product_name}</span>{" "}
//                     <span className="text-muted-foreground font-mono text-xs">
//                       ({selectedProduct.sku})
//                     </span>
//                   </>
//                 ) : (
//                   "Select a product from table"
//                 )}
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               {selectedProduct ? (
//                 <>
//                   {/* mini summary */}
//                   <div className="rounded-2xl border p-3 bg-card/40">
//                     <div className="flex items-start justify-between gap-2">
//                       <div className="min-w-0">
//                         <div className="font-semibold truncate">
//                           {selectedProduct.product_name}
//                         </div>
//                         <div className="text-xs text-muted-foreground font-mono">
//                           {selectedProduct.sku}
//                         </div>
//                       </div>
//                       <Badge variant="secondary">{money(selectedProduct.product_price)}</Badge>
//                     </div>

//                     <div className="mt-2 flex flex-wrap gap-2">
//                       {selectedProduct.category && (
//                         <Badge variant="outline">{selectedProduct.category}</Badge>
//                       )}
//                       {selectedProduct.product_type && (
//                         <Badge variant="secondary">{selectedProduct.product_type}</Badge>
//                       )}
//                       <Badge
//                         className={cn(
//                           "border",
//                           (selectedProduct.product_quantity_amount ?? 0) <= 0
//                             ? "bg-red-500/10 text-red-700 border-red-500/20"
//                             : (selectedProduct.product_quantity_amount ?? 0) < 5
//                             ? "bg-amber-500/10 text-amber-800 border-amber-500/20"
//                             : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
//                         )}
//                       >
//                         Stock: {selectedProduct.product_quantity_amount ?? 0}
//                       </Badge>
//                     </div>
//                   </div>

//                   <Separator />

//                   {/* Chart */}
//                   <div className="h-[280px] rounded-2xl border p-2">
//                     <ChartContainer config={chartConfig} className="h-full w-full">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <AreaChart data={selectedSeries7} margin={{ left: 8, right: 12, top: 12, bottom: 0 }}>
//                           <CartesianGrid vertical={false} />
//                           <XAxis dataKey="day" tickLine={false} axisLine={false} />
//                           <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => money(v)} />
//                           <ChartTooltip content={<ChartTooltipContent formatter={(v) => money(Number(v))} />} />
//                           <Area
//                             type="monotone"
//                             dataKey="revenue"
//                             stroke="var(--chart-1)"
//                             fill="var(--chart-1)"
//                             fillOpacity={0.22}
//                             strokeWidth={2}
//                           />
//                         </AreaChart>
//                       </ResponsiveContainer>
//                     </ChartContainer>
//                   </div>

//                   <div className="text-xs text-muted-foreground">
//                     Demo data (localStorage). Backend မလိုသေးပါ။
//                   </div>
//                 </>
//               ) : (
//                 <div className="text-sm text-muted-foreground">
//                   Select a product from table...
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Low stock list */}
//         <Card className="overflow-hidden">
//           <CardHeader className="space-y-1">
//             <CardTitle className="flex items-center gap-2">
//               <AlertTriangle className="h-5 w-5" />
//               Low Stock Alerts
//             </CardTitle>
//             <CardDescription>Stock 0 or less than 5</CardDescription>
//           </CardHeader>
//           <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
//             {products
//               .filter((p) => (p.product_quantity_amount ?? 0) <= 0 || (p.product_quantity_amount ?? 0) < 5)
//               .slice(0, 12)
//               .map((p) => {
//                 const s = p.product_quantity_amount ?? 0;
//                 return (
//                   <div
//                     key={p.id}
//                     className={cn(
//                       "rounded-2xl border p-3 transition",
//                       s <= 0
//                         ? "bg-red-500/5 border-red-500/20"
//                         : "bg-amber-500/5 border-amber-500/20",
//                     )}
//                   >
//                     <div className="flex items-start justify-between gap-2">
//                       <div className="min-w-0">
//                         <div className="font-semibold truncate">{p.product_name}</div>
//                         <div className="text-xs text-muted-foreground font-mono truncate">
//                           {p.sku}
//                         </div>
//                       </div>
//                       <Badge
//                         className={cn(
//                           "border",
//                           s <= 0
//                             ? "bg-red-500/10 text-red-700 border-red-500/20"
//                             : "bg-amber-500/10 text-amber-800 border-amber-500/20",
//                         )}
//                       >
//                         Stock: {s}
//                       </Badge>
//                     </div>
//                     <div className="mt-2 text-xs text-muted-foreground">
//                       {p.category || "Uncategorized"} • {money(p.product_price)}
//                     </div>
//                   </div>
//                 );
//               })}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

// /* ----------------------------- KPI Card ----------------------------- */
// function KpiCard({
//   title,
//   value,
//   icon,
//   tone,
// }: {
//   title: string;
//   value: any;
//   icon: React.ReactNode;
//   tone?: "danger" | "warning";
// }) {
//   return (
//     <Card className="overflow-hidden">
//       <CardContent className="p-4">
//         <div className="flex items-start justify-between gap-2">
//           <div className="space-y-1">
//             <div className="text-xs text-muted-foreground">{title}</div>
//             <div className="text-2xl font-semibold">{value}</div>
//           </div>
//           <div
//             className={cn(
//               "rounded-xl border p-2 bg-muted/30",
//               tone === "danger" && "bg-red-500/10 border-red-500/20 text-red-700",
//               tone === "warning" && "bg-amber-500/10 border-amber-500/20 text-amber-800",
//             )}
//           >
//             {icon}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }




// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
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
// import { Input } from "@/components/ui/input";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Separator } from "@/components/ui/separator";

// import {
//   Package,
//   Search,
//   RefreshCw,
//   Wand2,
//   Boxes,
//   AlertTriangle,
//   TrendingUp,
//   Coins,
//   ChevronLeft,
//   ChevronRight,
//   ChevronRight as ChevronRightIcon,
// } from "lucide-react";
// import { toast } from "sonner";

// /* ----------------------------- Types ----------------------------- */
// type ProductRow = {
//   id: string;
//   sku: string;
//   name: string;
//   price: number;
//   stock: number;
//   category?: string;
//   type?: string;
//   revenue: number; // demo
//   soldQty: number; // demo
//   orders: number; // demo
// };

// type TrendPoint = {
//   bucket: string;
//   revenue: number;
//   orders: number;
//   soldQty: number;
// };

// /* ----------------------------- Utils ----------------------------- */
// function cn(...classes: (string | false | null | undefined)[]) {
//   return classes.filter(Boolean).join(" ");
// }
// function money(n: number) {
//   return Number(n || 0).toLocaleString();
// }
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
// function uuid() {
//   return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
// }

// /* ----------------------------- Demo Data ----------------------------- */
// const LS_KEY = "PRODUCT_DASHBOARD_DEMO_V1";

// function seedProducts() {
//   const cats = ["Drink", "Food", "Daily", "Snack", "Fresh"];
//   const types = ["unit", "pack", "kg"];
//   const names = [
//     "Coke",
//     "Water",
//     "Milk",
//     "Bread",
//     "Egg",
//     "Coffee",
//     "Tea",
//     "Rice",
//     "Noodle",
//     "Snack",
//     "Chips",
//     "Candy",
//     "Yogurt",
//     "Soap",
//     "Shampoo",
//     "Toothpaste",
//     "Tissue",
//     "Cooking Oil",
//     "Salt",
//     "Sugar",
//     "Apple",
//     "Banana",
//     "Orange",
//     "Chicken",
//     "Fish",
//     "Meat",
//     "Onion",
//     "Garlic",
//     "Tomato",
//     "Potato",
//     "Carrot",
//     "Pepper",
//   ];

//   const rows: ProductRow[] = names.map((n, i) => {
//     const price = 200 + Math.floor(Math.random() * 2500);
//     const stock = Math.floor(Math.random() * 40);
//     const soldQty = Math.floor(Math.random() * 600);
//     const orders = Math.floor(Math.random() * 260);
//     const revenue = soldQty * price;

//     return {
//       id: uuid(),
//       sku: `SKU-${String(i + 1).padStart(3, "0")}`,
//       name: n,
//       price,
//       stock,
//       category: cats[Math.floor(Math.random() * cats.length)],
//       type: types[Math.floor(Math.random() * types.length)],
//       revenue,
//       soldQty,
//       orders,
//     };
//   });

//   localStorage.setItem(LS_KEY, JSON.stringify(rows));
// }

// function readProducts(): ProductRow[] {
//   try {
//     const raw = localStorage.getItem(LS_KEY);
//     if (!raw) return [];
//     const parsed = JSON.parse(raw);
//     return Array.isArray(parsed) ? (parsed as ProductRow[]) : [];
//   } catch {
//     return [];
//   }
// }

// /* ----------------------------- Page ----------------------------- */
// type Metric = "revenue" | "soldQty" | "orders";

// export default function ProductDashboardPage() {
//   const [rows, setRows] = useState<ProductRow[]>([]);
//   const [loading, setLoading] = useState(false);

//   // UI
//   const [q, setQ] = useState("");
//   const [selectedSku, setSelectedSku] = useState<string>("");
//   const [metric, setMetric] = useState<Metric>("revenue");

//   // table pagination
//   const PAGE_SIZE = 20;
//   const [page, setPage] = useState(1);

//   // right panel focus
//   const rightRef = useRef<HTMLDivElement | null>(null);
//   const [pulse, setPulse] = useState(false);

//   function reload() {
//     setLoading(true);
//     try {
//       const current = readProducts();
//       if (!current || current.length === 0) seedProducts();
//       setRows(readProducts());
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     reload();
//   }, []);

//   const filtered = useMemo(() => {
//     const kw = q.trim().toLowerCase();
//     if (!kw) return rows;
//     return rows.filter(
//       (r) =>
//         r.sku.toLowerCase().includes(kw) ||
//         r.name.toLowerCase().includes(kw) ||
//         (r.category || "").toLowerCase().includes(kw),
//     );
//   }, [rows, q]);

//   // default selection
//   useEffect(() => {
//     if (!selectedSku && filtered.length > 0) setSelectedSku(filtered[0].sku);
//   }, [filtered, selectedSku]);

//   // search -> reset page
//   useEffect(() => setPage(1), [q]);

//   const total = filtered.length;
//   const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
//   const safePage = Math.min(Math.max(page, 1), totalPages);

//   const pageRows = useMemo(() => {
//     const start = (safePage - 1) * PAGE_SIZE;
//     return filtered
//       .slice()
//       .sort((a, b) => b.revenue - a.revenue)
//       .slice(start, start + PAGE_SIZE);
//   }, [filtered, safePage]);

//   const selected = useMemo(
//     () => filtered.find((r) => r.sku === selectedSku) || null,
//     [filtered, selectedSku],
//   );

//   function selectSku(sku: string) {
//     setSelectedSku(sku);
//     rightRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
//     setPulse(true);
//     window.setTimeout(() => setPulse(false), 450);
//   }

//   /* ----------------------------- KPIs ----------------------------- */
//   const kpis = useMemo(() => {
//     const totalRevenue = filtered.reduce((s, r) => s + (r.revenue || 0), 0);
//     const totalOrders = filtered.reduce((s, r) => s + (r.orders || 0), 0);
//     const totalSoldQty = filtered.reduce((s, r) => s + (r.soldQty || 0), 0);
//     const lowStock = filtered.filter((r) => r.stock <= 0).length;
//     const warningStock = filtered.filter((r) => r.stock > 0 && r.stock < 5).length;

//     return { totalRevenue, totalOrders, totalSoldQty, lowStock, warningStock };
//   }, [filtered]);

//   /* ----------------------------- Charts ----------------------------- */
//   const top10 = useMemo(() => {
//     return filtered
//       .slice()
//       .sort((a, b) => b.revenue - a.revenue)
//       .slice(0, 10)
//       .map((r) => ({
//         name: r.name.length > 12 ? r.name.slice(0, 12) + "…" : r.name,
//         revenue: r.revenue,
//         soldQty: r.soldQty,
//         orders: r.orders,
//       }));
//   }, [filtered]);

//   const trend = useMemo<TrendPoint[]>(() => {
//     // demo: 14 days series based on selected (or total)
//     const base = selected ? selected.revenue : kpis.totalRevenue;
//     const baseOrders = selected ? selected.orders : kpis.totalOrders;
//     const baseQty = selected ? selected.soldQty : kpis.totalSoldQty;

//     const days = 14;
//     const arr: TrendPoint[] = [];
//     for (let i = days - 1; i >= 0; i--) {
//       const d = new Date(Date.now() - i * 86400000);
//       const label = `${d.getMonth() + 1}/${d.getDate()}`;
//       const factor = 0.6 + Math.random() * 0.9;

//       arr.push({
//         bucket: label,
//         revenue: Math.round(base * factor * 0.09),
//         orders: Math.round(baseOrders * factor * 0.12),
//         soldQty: Math.round(baseQty * factor * 0.12),
//       });
//     }
//     return arr;
//   }, [selected, kpis.totalRevenue, kpis.totalOrders, kpis.totalSoldQty]);

//   const chartConfig = {
//     revenue: { label: "Revenue" },
//     soldQty: { label: "Sold Qty" },
//     orders: { label: "Orders" },
//   } as const;

//   return (
//     <div className="w-full flex justify-center py-8 px-3">
//       <div className="w-full max-w-6xl space-y-4">
//         {/* Header */}
//         <Card className="overflow-hidden">
//           <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//             <div className="space-y-1">
//               <CardTitle className="flex items-center gap-2">
//                 <Package className="h-5 w-5" />
//                 Product Dashboard
//               </CardTitle>
//               <CardDescription>
//                 Frontend-only demo (localStorage) — KPIs + charts + product table
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
//                   seedProducts();
//                   setRows(readProducts());
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

//         {/* KPI Cards */}
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
//           <Card className="overflow-hidden">
//             <CardHeader className="space-y-1">
//               <CardDescription className="flex items-center gap-2">
//                 <Coins className="h-4 w-4" />
//                 Total Revenue
//               </CardDescription>
//               <CardTitle className="text-2xl">{money(kpis.totalRevenue)}</CardTitle>
//             </CardHeader>
//           </Card>

//           <Card className="overflow-hidden">
//             <CardHeader className="space-y-1">
//               <CardDescription className="flex items-center gap-2">
//                 <TrendingUp className="h-4 w-4" />
//                 Total Orders
//               </CardDescription>
//               <CardTitle className="text-2xl">{kpis.totalOrders.toLocaleString()}</CardTitle>
//             </CardHeader>
//           </Card>

//           <Card className="overflow-hidden">
//             <CardHeader className="space-y-1">
//               <CardDescription className="flex items-center gap-2">
//                 <Boxes className="h-4 w-4" />
//                 Sold Qty
//               </CardDescription>
//               <CardTitle className="text-2xl">{kpis.totalSoldQty.toLocaleString()}</CardTitle>
//             </CardHeader>
//           </Card>

//           <Card className="overflow-hidden">
//             <CardHeader className="space-y-1">
//               <CardDescription className="flex items-center gap-2">
//                 <AlertTriangle className="h-4 w-4" />
//                 Low Stock (0)
//               </CardDescription>
//               <CardTitle className="text-2xl">{kpis.lowStock}</CardTitle>
//             </CardHeader>
//           </Card>

//           <Card className="overflow-hidden">
//             <CardHeader className="space-y-1">
//               <CardDescription className="flex items-center gap-2">
//                 <AlertTriangle className="h-4 w-4" />
//                 Warning (&lt;5)
//               </CardDescription>
//               <CardTitle className="text-2xl">{kpis.warningStock}</CardTitle>
//             </CardHeader>
//           </Card>
//         </div>

//         {/* Main grid */}
//         <div className="grid gap-4 lg:grid-cols-5">
//           {/* LEFT: Table */}
//           <Card className="lg:col-span-2 overflow-hidden">
//             <CardHeader className="space-y-2">
//               <CardTitle className="flex items-center gap-2">
//                 <Search className="h-5 w-5" />
//                 Products
//               </CardTitle>
//               <CardDescription>Click row → focus right panel</CardDescription>

//               <div className="relative">
//                 <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   className="pl-8"
//                   placeholder="Search SKU / Name / Category..."
//                   value={q}
//                   onChange={(e) => setQ(e.target.value)}
//                 />
//               </div>

//               <div className="flex items-center justify-between text-xs text-muted-foreground">
//                 <span>
//                   Showing{" "}
//                   <b>
//                     {total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}-
//                     {Math.min(safePage * PAGE_SIZE, total)}
//                   </b>{" "}
//                   of <b>{total}</b>
//                 </span>
//                 <span>
//                   Page <b>{safePage}</b> / <b>{totalPages}</b>
//                 </span>
//               </div>
//             </CardHeader>

//             <CardContent className="p-0">
//               <div className="border-t" />
//               <ScrollArea className="h-[620px]">
//                 <table className="w-full text-sm">
//                   <thead className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
//                     <tr className="text-left text-muted-foreground">
//                       <th className="p-3 w-[56px]">#</th>
//                       <th className="p-3">Product</th>
//                       <th className="p-3 text-right">Revenue</th>
//                       <th className="p-3 text-right">Stock</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {pageRows.length === 0 ? (
//                       <tr>
//                         <td colSpan={4} className="p-4 text-muted-foreground">
//                           No products. Seed လုပ်ပြီး စမ်းပါ
//                         </td>
//                       </tr>
//                     ) : null}

//                     {pageRows.map((p, idx) => {
//                       const active = p.sku === selectedSku;
//                       const globalIndex = (safePage - 1) * PAGE_SIZE + idx + 1;

//                       return (
//                         <tr
//                           key={p.sku}
//                           onClick={() => selectSku(p.sku)}
//                           className={cn(
//                             "border-b cursor-pointer transition",
//                             active ? "bg-muted/70" : "hover:bg-muted/40",
//                           )}
//                         >
//                           <td className="p-3 text-muted-foreground font-mono">
//                             {globalIndex}
//                           </td>

//                           <td className="p-3">
//                             <div className="flex flex-col min-w-0">
//                               <div className="flex items-center gap-2">
//                                 <span className="font-medium truncate">
//                                   <HighlightText text={p.name} q={q} />
//                                 </span>
//                                 {p.category ? (
//                                   <Badge variant="outline" className="text-[10px]">
//                                     {p.category}
//                                   </Badge>
//                                 ) : null}
//                               </div>
//                               <span className="text-xs text-muted-foreground font-mono truncate">
//                                 <HighlightText text={p.sku} q={q} />
//                               </span>
//                               <span className="text-[11px] text-muted-foreground">
//                                 price {money(p.price)} • orders {p.orders}
//                               </span>
//                             </div>
//                           </td>

//                           <td className="p-3 text-right font-semibold tabular-nums">
//                             {money(p.revenue)}
//                           </td>

//                           <td className="p-3 text-right tabular-nums">
//                             <span
//                               className={cn(
//                                 p.stock <= 0
//                                   ? "text-red-600 font-semibold"
//                                   : p.stock < 5
//                                   ? "text-amber-600 font-semibold"
//                                   : "font-medium",
//                               )}
//                             >
//                               {p.stock}
//                             </span>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>

//                 {/* Pagination controls */}
//                 <div className="flex items-center justify-between gap-2 px-3 py-3 border-t bg-background/90 sticky bottom-0">
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     className="gap-1"
//                     disabled={safePage <= 1}
//                     onClick={() => setPage((p) => Math.max(1, p - 1))}
//                   >
//                     <ChevronLeft className="h-4 w-4" />
//                     Prev
//                   </Button>

//                   <div className="text-xs text-muted-foreground">
//                     Page <b>{safePage}</b> / <b>{totalPages}</b>
//                   </div>

//                   <Button
//                     size="sm"
//                     variant="outline"
//                     className="gap-1"
//                     disabled={safePage >= totalPages}
//                     onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                   >
//                     Next
//                     <ChevronRightIcon className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </ScrollArea>
//             </CardContent>
//           </Card>

//           {/* RIGHT: Charts */}
//           <div
//             ref={rightRef}
//             className={cn("lg:col-span-3 scroll-mt-6", pulse && "animate-pulse")}
//           >
//             <Card className="overflow-hidden">
//               <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//                 <div className="space-y-1">
//                   <CardTitle className="flex items-center gap-2">
//                     <TrendingUp className="h-5 w-5" />
//                     {selected ? selected.name : "Product Analytics"}
//                   </CardTitle>
//                   <CardDescription>
//                     Selected product performance (demo)
//                   </CardDescription>
//                 </div>

//                 <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
//                   <TabsList>
//                     <TabsTrigger value="revenue">Revenue</TabsTrigger>
//                     <TabsTrigger value="soldQty">Sold Qty</TabsTrigger>
//                     <TabsTrigger value="orders">Orders</TabsTrigger>
//                   </TabsList>
//                 </Tabs>
//               </CardHeader>

//               <CardContent className="space-y-4">
//                 {/* Selected summary */}
//                 {selected ? (
//                   <div className="rounded-2xl border p-4 bg-card/40">
//                     <div className="flex flex-wrap items-start justify-between gap-3">
//                       <div className="min-w-0">
//                         <div className="text-lg font-semibold break-words">
//                           {selected.name}
//                         </div>
//                         <div className="text-xs text-muted-foreground font-mono">
//                           {selected.sku}
//                         </div>
//                         <div className="text-xs text-muted-foreground">
//                           price {money(selected.price)} • stock{" "}
//                           <b className={selected.stock <= 0 ? "text-red-600" : ""}>
//                             {selected.stock}
//                           </b>
//                         </div>
//                       </div>

//                       <div className="flex flex-wrap gap-2">
//                         <Badge variant="secondary" className="gap-1">
//                           <Coins className="h-3.5 w-3.5" />
//                           {money(selected.revenue)}
//                         </Badge>
//                         <Badge variant="outline">qty {selected.soldQty}</Badge>
//                         <Badge variant="outline">orders {selected.orders}</Badge>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-sm text-muted-foreground">
//                     Select a product from the table...
//                   </div>
//                 )}

//                 <Separator />

//                 {/* Trend Area Chart (shadcn area chart style) */}
//                 <div className="rounded-2xl border p-3">
//                   <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
//                     <div className="text-sm font-medium">
//                       14-day Trend • {metric === "revenue" ? "Revenue" : metric}
//                     </div>
//                     <Badge variant="secondary" className="gap-1">
//                       <TrendingUp className="h-3.5 w-3.5" />
//                       {metric}
//                     </Badge>
//                   </div>

//                   <div className="h-[320px]">
//                     <ChartContainer config={chartConfig} className="h-full w-full">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <AreaChart data={trend} margin={{ left: 8, right: 12, top: 12, bottom: 0 }}>
//                           <CartesianGrid vertical={false} />
//                           <XAxis dataKey="bucket" tickLine={false} axisLine={false} />
//                           <YAxis
//                             tickLine={false}
//                             axisLine={false}
//                             tickFormatter={(v) =>
//                               metric === "revenue" ? money(Number(v)) : String(v)
//                             }
//                           />
//                           <ChartTooltip
//                             content={
//                               <ChartTooltipContent
//                                 formatter={(value) =>
//                                   metric === "revenue"
//                                     ? money(Number(value))
//                                     : Number(value).toLocaleString()
//                                 }
//                               />
//                             }
//                           />
//                           <Area
//                             dataKey={metric}
//                             type="monotone"
//                             stroke={
//                               metric === "revenue"
//                                 ? "var(--chart-1)"
//                                 : metric === "soldQty"
//                                 ? "var(--chart-2)"
//                                 : "var(--chart-3)"
//                             }
//                             fill={
//                               metric === "revenue"
//                                 ? "var(--chart-1)"
//                                 : metric === "soldQty"
//                                 ? "var(--chart-2)"
//                                 : "var(--chart-3)"
//                             }
//                             fillOpacity={0.22}
//                             strokeWidth={2}
//                           />
//                         </AreaChart>
//                       </ResponsiveContainer>
//                     </ChartContainer>
//                   </div>
//                 </div>

//                 {/* Top 10 bar chart */}
//                 <div className="rounded-2xl border p-3">
//                   <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
//                     <div className="text-sm font-medium">Top 10 Products (Revenue)</div>
//                     <Badge variant="secondary" className="gap-1">
//                       <Coins className="h-3.5 w-3.5" />
//                       revenue
//                     </Badge>
//                   </div>

//                   <div className="h-[320px]">
//                     <ChartContainer config={chartConfig} className="h-full w-full">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <BarChart data={top10} margin={{ left: 8, right: 12, top: 12, bottom: 0 }}>
//                           <CartesianGrid vertical={false} />
//                           <XAxis dataKey="name" tickLine={false} axisLine={false} />
//                           <YAxis
//                             tickLine={false}
//                             axisLine={false}
//                             tickFormatter={(v) => money(Number(v))}
//                           />
//                           <ChartTooltip
//                             content={
//                               <ChartTooltipContent formatter={(value) => money(Number(value))} />
//                             }
//                           />
//                           <Bar
//                             dataKey="revenue"
//                             radius={[10, 10, 0, 0]}
//                             fill="var(--chart-1)"
//                           />
//                         </BarChart>
//                       </ResponsiveContainer>
//                     </ChartContainer>
//                   </div>
//                 </div>

//                 <div className="text-xs text-muted-foreground">
//                   Demo data only (localStorage). Backend ချိတ်ချင်ရင် API အစားထိုးပေးမယ်။
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

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Tooltip,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Package,
  Search,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Boxes,
  Tag,
  ChevronRight,
  PlusCircle,
  LayoutGrid,
  History,
  BarChart3,
  Upload,
  Download,
  Settings,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

/* ----------------------------- Types ----------------------------- */
type Product = {
  id: string;
  sku: string;
  product_name: string;
  product_price: number;
  product_quantity_amount: number;
  category?: string | null;
  product_type?: string | null;
  product_discount?: number | null;
};

type ProductEvent = {
  at: string; // YYYY-MM-DD
  sku: string;
  type: "SALE" | "RESTOCK";
  qty: number;
  revenue: number; // for SALE
};

const LS_PRODUCTS = "DASH_PRODUCTS_V1";
const LS_EVENTS = "DASH_PRODUCT_EVENTS_V1";

/* ----------------------------- Routes (Change if needed) ----------------------------- */
const ROUTES = {
  productsList: "/products", // ✅ your existing list page
  productCreate: "/products/new",
  salesByProduct: "/sales-by-product", // the page we built
  salesDashboard: "/dashboard/sales", // optional
  lowStock: "/products?filter=low-stock", // optional
  stockMovements: "/products/movements", // optional
  importProducts: "/products/import", // optional
  exportProducts: "/products/export", // optional
  settings: "/settings/products", // optional
};

/* ----------------------------- Utils ----------------------------- */
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function money(n: number) {
  return Number(n || 0).toLocaleString();
}

function isoDay(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, val: T) {
  localStorage.setItem(key, JSON.stringify(val));
}

function uuid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/* ----------------------------- Demo Seed ----------------------------- */
function seedDemo() {
  const products: Product[] = [
    {
      id: uuid(),
      sku: "SKU-COKE",
      product_name: "Coke",
      product_price: 1200,
      product_quantity_amount: 18,
      category: "Drink",
      product_type: "unit",
      product_discount: 0,
    },
    {
      id: uuid(),
      sku: "SKU-BREAD",
      product_name: "Bread",
      product_price: 900,
      product_quantity_amount: 4,
      category: "Food",
      product_type: "unit",
      product_discount: 0,
    },
    {
      id: uuid(),
      sku: "SKU-MILK",
      product_name: "Milk",
      product_price: 1500,
      product_quantity_amount: 0,
      category: "Drink",
      product_type: "unit",
      product_discount: 100,
    },
    {
      id: uuid(),
      sku: "SKU-RICE",
      product_name: "Rice 5kg",
      product_price: 8500,
      product_quantity_amount: 9,
      category: "Grocery",
      product_type: "pack",
      product_discount: 0,
    },
    {
      id: uuid(),
      sku: "SKU-NOODLE",
      product_name: "Noodle",
      product_price: 700,
      product_quantity_amount: 30,
      category: "Food",
      product_type: "unit",
      product_discount: 0,
    },
    {
      id: uuid(),
      sku: "SKU-SNACK",
      product_name: "Snack",
      product_price: 500,
      product_quantity_amount: 2,
      category: "Food",
      product_type: "unit",
      product_discount: 0,
    },
  ];

  const now = new Date();
  const events: ProductEvent[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const day = isoDay(d);
    const loops = 2 + Math.floor(Math.random() * 4);

    for (let k = 0; k < loops; k++) {
      const p = products[Math.floor(Math.random() * products.length)];
      const sale = Math.random() > 0.35;
      const qty = 1 + Math.floor(Math.random() * 5);
      const revenue = sale ? qty * p.product_price : 0;

      events.push({
        at: day,
        sku: p.sku,
        type: sale ? "SALE" : "RESTOCK",
        qty,
        revenue,
      });
    }
  }

  writeLS(LS_PRODUCTS, products);
  writeLS(LS_EVENTS, events);
}

/* ----------------------------- Page ----------------------------- */
export default function ProductDashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<ProductEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // UI
  const [q, setQ] = useState("");
  const [selectedSku, setSelectedSku] = useState<string>("");

  function reload() {
    setLoading(true);
    try {
      const p = readLS<Product[]>(LS_PRODUCTS, []);
      const e = readLS<ProductEvent[]>(LS_EVENTS, []);
      if (p.length === 0 || e.length === 0) seedDemo();
      setProducts(readLS<Product[]>(LS_PRODUCTS, []));
      setEvents(readLS<ProductEvent[]>(LS_EVENTS, []));
      toast.success("Dashboard data loaded ✅");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  /* ----------------------------- KPIs ----------------------------- */
  const kpis = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce(
      (sum, p) => sum + Number(p.product_quantity_amount || 0),
      0,
    );
    const outOfStock = products.filter((p) => (p.product_quantity_amount ?? 0) <= 0).length;
    const lowStock = products.filter((p) => {
      const s = p.product_quantity_amount ?? 0;
      return s > 0 && s < 5;
    }).length;

    const today = new Date();
    const days = new Set<string>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.add(isoDay(d));
    }
    const revenue7d = events
      .filter((x) => x.type === "SALE" && days.has(x.at))
      .reduce((sum, x) => sum + Number(x.revenue || 0), 0);

    return { totalProducts, totalStock, outOfStock, lowStock, revenue7d };
  }, [products, events]);

  /* ----------------------------- Trend chart (30 days) ----------------------------- */
  const trend30 = useMemo(() => {
    const map = new Map<string, { day: string; revenue: number; sold: number }>();

    for (const ev of events) {
      const cur = map.get(ev.at) || { day: ev.at, revenue: 0, sold: 0 };
      if (ev.type === "SALE") {
        cur.revenue += Number(ev.revenue || 0);
        cur.sold += Number(ev.qty || 0);
      }
      map.set(ev.at, cur);
    }

    return Array.from(map.values()).sort((a, b) => (a.day < b.day ? -1 : 1));
  }, [events]);

  /* ----------------------------- Category revenue (top 6) ----------------------------- */
  const categoryBar = useMemo(() => {
    const bySku = new Map<string, Product>();
    products.forEach((p) => bySku.set(p.sku, p));

    const map = new Map<string, number>();
    for (const ev of events) {
      if (ev.type !== "SALE") continue;
      const p = bySku.get(ev.sku);
      const cat = (p?.category || "Uncategorized").trim();
      map.set(cat, (map.get(cat) || 0) + Number(ev.revenue || 0));
    }

    return Array.from(map.entries())
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [events, products]);

  /* ----------------------------- Table (Products) ----------------------------- */
  const filteredProducts = useMemo(() => {
    const kw = q.trim().toLowerCase();
    let rows = products;
    if (kw) {
      rows = rows.filter(
        (p) =>
          p.sku.toLowerCase().includes(kw) ||
          p.product_name.toLowerCase().includes(kw),
      );
    }
    return rows.slice().sort((a, b) => {
      const sa = a.product_quantity_amount ?? 0;
      const sb = b.product_quantity_amount ?? 0;
      if (sa === sb) return b.product_price - a.product_price;
      return sa - sb; // low stock first
    });
  }, [products, q]);

  useEffect(() => {
    if (!selectedSku && products.length > 0) setSelectedSku(products[0].sku);
  }, [products, selectedSku]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.sku === selectedSku) || null,
    [products, selectedSku],
  );

  const selectedSeries7 = useMemo(() => {
    if (!selectedSku) return [];
    const today = new Date();
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(isoDay(d));
    }

    const map = new Map<string, { day: string; revenue: number }>();
    days.forEach((day) => map.set(day, { day, revenue: 0 }));

    for (const ev of events) {
      if (ev.sku !== selectedSku) continue;
      const cur = map.get(ev.at);
      if (!cur) continue;
      if (ev.type === "SALE") cur.revenue += Number(ev.revenue || 0);
    }

    return Array.from(map.values()).sort((a, b) => (a.day < b.day ? -1 : 1));
  }, [events, selectedSku]);

  const chartConfig = {
    revenue: { label: "Revenue" },
  } as const;

  /* ----------------------------- Navigation Cards ----------------------------- */
  const navCards = [
    {
      title: "Products List",
      desc: "Product စာရင်း (search / view / edit / delete)",
      icon: <LayoutGrid className="h-5 w-5" />,
      href: ROUTES.productsList,
      badge: "List",
    },
    {
      title: "Create Product",
      desc: "Product အသစ်ထည့် (image upload ပါ)",
      icon: <PlusCircle className="h-5 w-5" />,
      href: ROUTES.productCreate,
      badge: "Create",
      primary: true,
    },
    {
      title: "Sales by Product",
      desc: "Product တစ်ခုချင်း ရောင်းအား chart/table",
      icon: <BarChart3 className="h-5 w-5" />,
      href: ROUTES.salesByProduct,
      badge: "Analytics",
    },
    {
      title: "Low Stock",
      desc: "Stock နည်း/ကုန်နေတဲ့ product တွေ",
      icon: <AlertTriangle className="h-5 w-5" />,
      href: ROUTES.lowStock,
      badge: "Alert",
    },
    {
      title: "Stock Movements",
      desc: "IN/OUT/ADJUST history (optional)",
      icon: <History className="h-5 w-5" />,
      href: ROUTES.stockMovements,
      badge: "History",
    },
    {
      title: "Import Products",
      desc: "CSV/Excel import (optional)",
      icon: <Upload className="h-5 w-5" />,
      href: ROUTES.importProducts,
      badge: "Tool",
    },
    {
      title: "Export Products",
      desc: "CSV export (optional)",
      icon: <Download className="h-5 w-5" />,
      href: ROUTES.exportProducts,
      badge: "Tool",
    },
    {
      title: "Product Settings",
      desc: "Tax/Category/Unit config (optional)",
      icon: <Settings className="h-5 w-5" />,
      href: ROUTES.settings,
      badge: "Settings",
    },
  ];

  return (
    <div className="w-full flex justify-center py-8 px-3">
      <div className="w-full max-w-7xl space-y-4">
        {/* Header */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Dashboard
              </CardTitle>
              <CardDescription>
                Products overview + navigation to product-related pages
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
                size="sm"
                onClick={() => router.push(ROUTES.productCreate)}
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                New Product
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* ✅ Navigation Section */}
        <Card className="overflow-hidden">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Dashboard ကနေ product-related pages တွေကို လွယ်လွယ်ကူကူ သွားနိုင်အောင်
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {navCards.map((x) => (
                <Link
                  key={x.title}
                  href={x.href}
                  className={cn(
                    "group rounded-2xl border p-4 transition overflow-hidden",
                    "hover:bg-muted/40 hover:border-primary/30",
                    x.primary && "bg-primary/5 border-primary/20",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={cn(
                        "rounded-xl border p-2 bg-muted/30",
                        x.primary && "bg-primary/10 border-primary/20",
                      )}
                    >
                      {x.icon}
                    </div>

                    <Badge
                      variant={x.primary ? "default" : "secondary"}
                      className="text-[11px]"
                    >
                      {x.badge}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold">{x.title}</div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition" />
                    </div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      {x.desc}
                    </div>
                  </div>

                  <div className="mt-3 h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-0 group-hover:w-full transition-all bg-primary/60" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <KpiCard title="Products" value={kpis.totalProducts} icon={<Package className="h-4 w-4" />} />
          <KpiCard title="Total Stock" value={kpis.totalStock} icon={<Boxes className="h-4 w-4" />} />
          <KpiCard title="Out of Stock" value={kpis.outOfStock} icon={<AlertTriangle className="h-4 w-4" />} tone="danger" />
          <KpiCard title="Low Stock" value={kpis.lowStock} icon={<AlertTriangle className="h-4 w-4" />} tone="warning" />
          <KpiCard title="Revenue (7d)" value={money(kpis.revenue7d)} icon={<TrendingUp className="h-4 w-4" />} />
        </div>

        {/* Charts row */}
        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3 overflow-hidden">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Trend (30 days)
              </CardTitle>
              <CardDescription>Daily revenue (demo events)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend30} margin={{ left: 8, right: 12, top: 12, bottom: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => money(v)} />
                      <ChartTooltip content={<ChartTooltipContent formatter={(v) => money(Number(v))} />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--chart-1)"
                        fill="var(--chart-1)"
                        fillOpacity={0.22}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 overflow-hidden">
            <CardHeader className="space-y-1">
              <CardTitle>Top Categories</CardTitle>
              <CardDescription>Revenue by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryBar} margin={{ left: 8, right: 12, top: 12, bottom: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="category" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => money(v)} />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="var(--chart-2)" radius={8} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table + Selected */}
        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3 overflow-hidden">
            <CardHeader className="space-y-2">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Products Snapshot
                  </CardTitle>
                  <CardDescription>
                    Dashboard ထဲကနေ လျင်မြန်စွာ စစ်နိုင်တဲ့ product list
                  </CardDescription>
                </div>

                <div className="relative w-full md:max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Search SKU / Name..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="border-t" />
              <ScrollArea className="h-[420px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10">
                    <TableRow>
                      <TableHead className="w-[90px]">SKU</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((p) => {
                      const stock = p.product_quantity_amount ?? 0;
                      const active = p.sku === selectedSku;

                      return (
                        <TableRow
                          key={p.id}
                          className={cn(
                            "cursor-pointer transition",
                            active ? "bg-muted/70" : "hover:bg-muted/40",
                          )}
                          onClick={() => setSelectedSku(p.sku)}
                        >
                          <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                          <TableCell>
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium truncate">{p.product_name}</span>
                              <span className="text-xs text-muted-foreground truncate">
                                {p.product_type || "-"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            {money(p.product_price)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={cn(
                                "font-semibold tabular-nums",
                                stock <= 0 && "text-red-600",
                                stock > 0 && stock < 5 && "text-amber-600",
                              )}
                            >
                              {stock}
                            </span>
                          </TableCell>
                          <TableCell>
                            {p.category ? <Badge variant="outline">{p.category}</Badge> : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                router.push(`/products/${p.id}`);
                              }}
                            >
                              View <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 overflow-hidden">
            <CardHeader className="space-y-1">
              <CardTitle>Selected Product (7 days)</CardTitle>
              <CardDescription>
                {selectedProduct ? (
                  <>
                    <span className="font-medium">{selectedProduct.product_name}</span>{" "}
                    <span className="text-muted-foreground font-mono text-xs">
                      ({selectedProduct.sku})
                    </span>
                  </>
                ) : (
                  "Select a product from table"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedProduct ? (
                <>
                  <div className="rounded-2xl border p-3 bg-card/40">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">
                          {selectedProduct.product_name}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {selectedProduct.sku}
                        </div>
                      </div>
                      <Badge variant="secondary">{money(selectedProduct.product_price)}</Badge>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedProduct.category && (
                        <Badge variant="outline">{selectedProduct.category}</Badge>
                      )}
                      <Badge
                        className={cn(
                          "border",
                          (selectedProduct.product_quantity_amount ?? 0) <= 0
                            ? "bg-red-500/10 text-red-700 border-red-500/20"
                            : (selectedProduct.product_quantity_amount ?? 0) < 5
                            ? "bg-amber-500/10 text-amber-800 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
                        )}
                      >
                        Stock: {selectedProduct.product_quantity_amount ?? 0}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="h-[280px] rounded-2xl border p-2">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={selectedSeries7} margin={{ left: 8, right: 12, top: 12, bottom: 0 }}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="day" tickLine={false} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => money(v)} />
                          <ChartTooltip content={<ChartTooltipContent formatter={(v) => money(Number(v))} />} />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="var(--chart-1)"
                            fill="var(--chart-1)"
                            fillOpacity={0.22}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Demo data (localStorage). Backend မလိုသေးပါ။
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Select a product from table...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- KPI Card ----------------------------- */
function KpiCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: any;
  icon: React.ReactNode;
  tone?: "danger" | "warning";
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{title}</div>
            <div className="text-2xl font-semibold">{value}</div>
          </div>
          <div
            className={cn(
              "rounded-xl border p-2 bg-muted/30",
              tone === "danger" && "bg-red-500/10 border-red-500/20 text-red-700",
              tone === "warning" && "bg-amber-500/10 border-amber-500/20 text-amber-800",
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}