"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Clock,
  CalendarDays,
  RefreshCcw,
  PackageSearch,
} from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

type Range = "1h" | "1d";

type SaleProductSummary = {
  productId: string;
  sku: string;
  product_name: string;
  product_price: number;
  quantity_sold: number;
  total_amount: number;
};

export default function SalesPage() {
  const [range, setRange] = useState<Range>("1h");
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState<SaleProductSummary[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  async function loadSales(selectedRange: Range) {
    setLoading(true);
    try {
      const res = await fetch(
        `${apiBase}/api/reports/sales/products?range=${selectedRange}`,
        { cache: "no-store" },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg =
          data?.message ||
          `Failed to load sales (status ${res.status})`;
        toast.error(msg);
        setSales([]);
        return;
      }

      const data = (await res.json()) as SaleProductSummary[] | SaleProductSummary;
      const list = Array.isArray(data) ? data : [data];
      setSales(list);
      setLastUpdated(new Date());

      if (list.length === 0) {
        toast.info("ဒီအချိန်အပိုင်းအတွင်း ရောင်းချမှုမရှိသေးပါ");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error ဖြစ်နေတယ်");
    } finally {
      setLoading(false);
    }
  }

  // auto load when range changes
  useEffect(() => {
    loadSales(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const totalQty = useMemo(
    () =>
      sales.reduce((sum, p) => sum + (p.quantity_sold ?? 0), 0),
    [sales],
  );

  const totalAmount = useMemo(
    () =>
      sales.reduce((sum, p) => sum + (p.total_amount ?? 0), 0),
    [sales],
  );

  const fmtCurrency = (value?: number) => {
    if (value == null) return "-";
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(value);
  };

  const fmtTime = (date: Date | null) => {
    if (!date) return "-";
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <PackageSearch className="w-6 h-6" />
            Product Sales Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            နောက်ဆုံး 1 နာရီ / 1 ရက်အတွင်း ရောင်းချထားတဲ့ product list ကို ကြည့်ရှုနိုင်ပါတယ်။
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(v) => v && setRange(v as Range)}
            className="bg-muted rounded-md p-1"
          >
            <ToggleGroupItem value="1h" className="gap-1">
              <Clock className="w-3 h-3" />
              1 Hour
            </ToggleGroupItem>
            <ToggleGroupItem value="1d" className="gap-1">
              <CalendarDays className="w-3 h-3" />
              1 Day
            </ToggleGroupItem>
          </ToggleGroup>

          <Button
            variant="outline"
            size="icon"
            onClick={() => loadSales(range)}
            disabled={loading}
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Products Sold</CardTitle>
            <CardDescription className="text-xs">
              {range === "1h" ? "နောက်ဆုံး 1 နာရီ" : "နောက်ဆုံး 1 ရက်"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sales.length}
            </div>
            <div className="text-xs text-muted-foreground">
              unique products
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Quantity</CardTitle>
            <CardDescription className="text-xs">
              ရောင်းချထားသော total pieces/units
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQty}</div>
            <div className="text-xs text-muted-foreground">
              items
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Sales Amount</CardTitle>
            <CardDescription className="text-xs">
              subtotal (tax 제외 / မထည့်ရသေးလား သင်ဖြေရှင်းရမယ်)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {fmtCurrency(totalAmount)}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Last updated: {fmtTime(lastUpdated)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            Product Sales List
          </CardTitle>
          <CardDescription className="text-xs">
            {range === "1h"
              ? "နောက်ဆုံး 1 နာရီအတွင်း"
              : "နောက်ဆုံး 1 ရက်အတွင်း"}{" "}
            ရောင်းချထားတဲ့ product များ စာရင်း
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          {sales.length === 0 ? (
            <div className="py-4 text-sm text-muted-foreground">
              ရောင်းချမှုအချက်အလက် မတွေ့ရသေးပါ။
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-1 px-2 text-left">SKU</th>
                  <th className="py-1 px-2 text-left">Name</th>
                  <th className="py-1 px-2 text-right">Unit Price</th>
                  <th className="py-1 px-2 text-center">Qty Sold</th>
                  <th className="py-1 px-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((p) => (
                  <tr key={p.productId} className="border-b">
                    <td className="py-1 px-2 font-mono text-xs">
                      {p.sku}
                    </td>
                    <td className="py-1 px-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {p.product_name}
                        </span>
                        {p.quantity_sold > 0 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1"
                          >
                            {p.quantity_sold}x
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-1 px-2 text-right">
                      {fmtCurrency(p.product_price)}
                    </td>
                    <td className="py-1 px-2 text-center">
                      {p.quantity_sold}
                    </td>
                    <td className="py-1 px-2 text-right">
                      {fmtCurrency(p.total_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
