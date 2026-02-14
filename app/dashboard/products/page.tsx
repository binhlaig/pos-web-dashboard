
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