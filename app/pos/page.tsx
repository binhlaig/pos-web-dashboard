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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type Product = {
  id: string;
  sku: string;
  product_name: string;
  product_price: number;
  barcode?: string | null;
  category?: string | null;
  product_quantity_amount: number;
  product_image?: string | null;
  product_discount?: number | null;
  note?: string | null;
  product_type?: string | null;
};

type CartItem = {
  product: Product;
  qty: number;
};

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function money(n: number) {
  return Number(n || 0).toLocaleString();
}

function clampInt(n: number, min: number, max: number) {
  const x = Number.isFinite(n) ? Math.trunc(n) : min;
  return Math.max(min, Math.min(max, x));
}

export default function POSPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  // products search/list
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [firstLoaded, setFirstLoaded] = useState(false);

  // cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);

  // low-stock threshold
  const LOW_STOCK = 5;

  async function loadProducts(search?: string) {
    try {
      setLoading(true);
      const query = search ? `?q=${encodeURIComponent(search)}` : "";
      const res = await fetch(`${apiBase}/api/products${query}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.message || `Products load failed (status ${res.status})`);
        return;
      }

      const data = (await res.json()) as Product[];
      setProducts(data);
      setFirstLoaded(true);
    } catch (e) {
      console.error(e);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    // backend already filters by q, but keep safe UI filter too
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) => {
      return (
        p.product_name.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        (p.barcode || "").toLowerCase().includes(s)
      );
    });
  }, [products, q]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => (p.product_quantity_amount ?? 0) > 0 && (p.product_quantity_amount ?? 0) < LOW_STOCK)
      .length;
  }, [products]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => (p.product_quantity_amount ?? 0) <= 0).length;
  }, [products]);

  function stockBadge(p: Product) {
    const stock = Number(p.product_quantity_amount ?? 0);
    if (stock <= 0) {
      return (
        <Badge className="bg-red-500/10 text-red-700 border border-red-500/20 gap-1">
          <AlertTriangle className="h-3.5 w-3.5" />
          OUT
        </Badge>
      );
    }
    if (stock < LOW_STOCK) {
      return (
        <Badge className="bg-amber-500/10 text-amber-800 border border-amber-500/20 gap-1">
          <AlertTriangle className="h-3.5 w-3.5" />
          LOW
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
        IN
      </Badge>
    );
  }

  function addToCart(p: Product) {
    const stock = Number(p.product_quantity_amount ?? 0);
    if (stock <= 0) return toast.error("Stock မရှိပါ (OUT)");

    setCart((prev) => {
      const idx = prev.findIndex((x) => x.product.id === p.id);
      if (idx === -1) return [...prev, { product: p, qty: 1 }];

      const next = [...prev];
      const currentQty = next[idx].qty;

      if (currentQty + 1 > stock) {
        toast.error("Stock မလုံလောက်ပါ");
        return prev;
      }
      next[idx] = { ...next[idx], qty: currentQty + 1 };
      return next;
    });
  }

  function setQty(productId: string, qty: number) {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.product.id === productId);
      if (idx === -1) return prev;

      const stock = Number(prev[idx].product.product_quantity_amount ?? 0);
      const safe = clampInt(qty, 1, Math.max(1, stock));

      const next = [...prev];
      next[idx] = { ...next[idx], qty: safe };
      return next;
    });
  }

  function inc(productId: string) {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.product.id === productId);
      if (idx === -1) return prev;

      const stock = Number(prev[idx].product.product_quantity_amount ?? 0);
      const current = prev[idx].qty;
      if (current + 1 > stock) {
        toast.error("Stock မလုံလောက်ပါ");
        return prev;
      }
      const next = [...prev];
      next[idx] = { ...next[idx], qty: current + 1 };
      return next;
    });
  }

  function dec(productId: string) {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.product.id === productId);
      if (idx === -1) return prev;
      const current = prev[idx].qty;
      const nextQty = Math.max(1, current - 1);
      const next = [...prev];
      next[idx] = { ...next[idx], qty: nextQty };
      return next;
    });
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((x) => x.product.id !== productId));
  }

  function clearCart() {
    setCart([]);
  }

  const subtotal = useMemo(() => {
    return cart.reduce((sum, it) => sum + Number(it.product.product_price || 0) * it.qty, 0);
  }, [cart]);

  const totalDiscount = useMemo(() => {
    // product_discount ကို "per item amount" အဖြစ်ယူထား (မင်း schema အတိုင်း)
    return cart.reduce((sum, it) => sum + Number(it.product.product_discount || 0) * it.qty, 0);
  }, [cart]);

  const grandTotal = Math.max(0, subtotal - totalDiscount);

  // ✅ Sale submit:
  // - First try POST /api/sales (recommended)
  // - If 404, fallback to calling stock-out per item
  async function checkout() {
    if (cart.length === 0) return toast.error("Cart မရှိသေးပါ");
    try {
      setCheckingOut(true);

      // client-side final stock validation (extra safety)
      for (const it of cart) {
        const stock = Number(it.product.product_quantity_amount ?? 0);
        if (stock <= 0 || it.qty > stock) {
          toast.error(`Stock မလုံလောက်ပါ: ${it.product.product_name}`);
          return;
        }
      }

      // ✅ 1) Try Sales endpoint
      const saleRes = await fetch(`${apiBase}/api/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: cart.map((it) => ({
            product_id: it.product.id,
            qty: it.qty,
            price: it.product.product_price,
          })),
          note: "POS sale",
        }),
      });

      if (saleRes.ok) {
        toast.success("Sale success ✅ (stock auto OUT)");
        clearCart();
        await loadProducts(q.trim() || undefined);
        return;
      }

      // If sales endpoint not ready, fallback to stock-out per item
      if (saleRes.status === 404) {
        for (const it of cart) {
          const r = await fetch(`${apiBase}/api/products/${it.product.id}/stock-out`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              qty: it.qty,
              note: "POS sale (fallback)",
            }),
          });

          const d = await r.json().catch(() => null);
          if (!r.ok) {
            toast.error(d?.message || `Stock OUT failed for ${it.product.product_name}`);
            return;
          }
        }

        toast.success("Sale success ✅ (fallback stock-out)");
        clearCart();
        await loadProducts(q.trim() || undefined);
        return;
      }

      // Other errors
      const err = await saleRes.json().catch(() => null);
      toast.error(err?.message || `Checkout failed (status ${saleRes.status})`);
    } catch (e) {
      console.error(e);
      toast.error("Checkout error");
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div className="w-full flex justify-center py-6 px-3 overflow-x-hidden">
      <div className="w-full max-w-6xl grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        {/* LEFT: Products */}
        <Card className="min-w-0">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                POS Sale
              </CardTitle>
              <CardDescription>
                Product ရှာ → Cart ထည့် → Checkout လုပ်ပါ (Stock auto OUT)
              </CardDescription>
            </div>

            {/* Low-stock alert UI */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-amber-500/10 text-amber-800 border border-amber-500/20 gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Low: {lowStockCount}
              </Badge>
              <Badge className="bg-red-500/10 text-red-700 border border-red-500/20 gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Out: {outOfStockCount}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => loadProducts(q.trim() || undefined)}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 min-w-0">
            {/* Search */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex w-full gap-2 md:max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="SKU / Name / Barcode"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => loadProducts(q.trim() || undefined)}
                  disabled={loading}
                >
                  Search
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                {loading ? "Loading..." : `${filtered.length} items`}
              </div>
            </div>

            <Separator />

            {/* Product grid */}
            <ScrollArea className="h-[560px] rounded-xl border">
              <div className="p-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {firstLoaded && filtered.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4">
                    No products found
                  </div>
                ) : null}

                {filtered.map((p) => {
                  const stock = Number(p.product_quantity_amount ?? 0);
                  const disabled = stock <= 0;

                  const imageUrl =
                    p.product_image && p.product_image.startsWith("http")
                      ? p.product_image
                      : p.product_image
                      ? `${apiBase}${p.product_image}`
                      : null;

                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "rounded-xl border bg-background overflow-hidden hover:shadow-sm transition",
                        disabled && "opacity-60"
                      )}
                    >
                      <div className="h-28 bg-muted flex items-center justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={p.product_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {p.product_name}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono truncate">
                              {p.sku}
                            </div>
                          </div>
                          {stockBadge(p)}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold">
                            {money(p.product_price)}
                          </div>
                          <div
                            className={cn(
                              "text-xs font-mono",
                              stock <= 0
                                ? "text-red-700"
                                : stock < LOW_STOCK
                                ? "text-amber-800"
                                : "text-muted-foreground"
                            )}
                          >
                            Stock: {stock}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="w-full gap-2"
                          onClick={() => addToCart(p)}
                          disabled={disabled}
                        >
                          <Plus className="h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* RIGHT: Cart */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart
            </CardTitle>
            <CardDescription>
              Qty ပြင်ပြီး Checkout လုပ်ပါ
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 min-w-0">
            {cart.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Cart မရှိသေးပါ
              </div>
            ) : (
              <ScrollArea className="h-[420px] rounded-xl border">
                <div className="p-3 space-y-3">
                  {cart.map((it) => {
                    const p = it.product;
                    const stock = Number(p.product_quantity_amount ?? 0);
                    const over = it.qty > stock;

                    return (
                      <div key={p.id} className="rounded-xl border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {p.product_name}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono truncate">
                              {p.sku}
                            </div>
                          </div>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeItem(p.id)}
                            className="h-8 w-8"
                            aria-label="remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-sm font-semibold">
                            {money(p.product_price)}
                            {p.product_discount ? (
                              <span className="ml-2 text-xs text-emerald-700">
                                (-{money(p.product_discount)}/ea)
                              </span>
                            ) : null}
                          </div>
                          <div
                            className={cn(
                              "text-xs font-mono",
                              stock <= 0
                                ? "text-red-700"
                                : stock < LOW_STOCK
                                ? "text-amber-800"
                                : "text-muted-foreground"
                            )}
                          >
                            Stock: {stock}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-9 w-9"
                              onClick={() => dec(p.id)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>

                            <Input
                              type="number"
                              value={it.qty}
                              onChange={(e) =>
                                setQty(p.id, Number(e.target.value))
                              }
                              className={cn(
                                "w-20 text-center",
                                over && "border-red-500"
                              )}
                              min={1}
                              max={Math.max(1, stock)}
                            />

                            <Button
                              size="icon"
                              variant="outline"
                              className="h-9 w-9"
                              onClick={() => inc(p.id)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="text-sm font-semibold">
                            {money(Number(p.product_price || 0) * it.qty)}
                          </div>
                        </div>

                        {over ? (
                          <div className="mt-2 text-xs text-red-700">
                            Stock မလုံလောက်ပါ (qty ကိုလျှော့ပါ)
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">{money(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-mono text-emerald-700">
                  -{money(totalDiscount)}
                </span>
              </div>

              <div className="flex items-center justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-mono font-semibold">
                  {money(grandTotal)}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <Button
              className="w-full gap-2"
              onClick={checkout}
              disabled={checkingOut || cart.length === 0}
            >
              <CheckCircle2 className="h-4 w-4" />
              {checkingOut ? "Checking out..." : "Checkout"}
            </Button>

            <Button
              className="w-full"
              variant="outline"
              onClick={clearCart}
              disabled={checkingOut || cart.length === 0}
            >
              Clear Cart
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
