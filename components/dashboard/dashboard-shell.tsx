"use client";

import * as React from "react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  DollarSign,
  ShoppingCart,
  Wallet,
  CreditCard,
} from "lucide-react";

import type {
  DashboardData,
  DashboardRange,
  MetricMode,
  ThemeMode,
} from "@/lib/dashboard-data";

import { StatCard } from "./stat-card";
import { RevenueChart } from "./revenue-chart";
import { CategoryPieChart } from "./category-pie-chart";
import { TopShops } from "./top-shops";
import { TransactionTable } from "./transaction-table";
import { FiltersBar } from "./filters-bar";
import { exportTransactionsCSV } from "./export-utils";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { DashboardLayout } from "./dashboard-layout";


type DashboardApiResponse = DashboardData & {
  auth?: {
    role: string;
    shopCode: string;
    selectedShop: string;
  };
};

export function DashboardShell({
  initialData,
}: {
  initialData: DashboardApiResponse;
}) {
  const [data, setData] = useState<DashboardApiResponse>(initialData);
  const [range, setRange] = useState<DashboardRange>("30d");
  const [shop, setShop] = useState(initialData.auth?.selectedShop || initialData.shops[0] || "All Shops");
  const [mode, setMode] = useState<MetricMode>("revenue");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [txFilter, setTxFilter] = useState("all");
  const [txSearch, setTxSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [theme, setTheme] = useState<ThemeMode>("dark");

  React.useEffect(() => {
    const saved = localStorage.getItem("binhlaig-dashboard-theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem("binhlaig-dashboard-theme", theme);
  }, [theme]);

  const filteredTransactions = useMemo(() => {
    const byType =
      txFilter === "all"
        ? data.transactions
        : data.transactions.filter((t) => t.type.toLowerCase() === txFilter);

    return byType;
  }, [data.transactions, txFilter]);

  async function loadDashboard(nextRange = range, nextShop = shop) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/dashboard?range=${encodeURIComponent(nextRange)}&shop=${encodeURIComponent(nextShop)}`,
        { cache: "no-store" }
      );

      if (!res.ok) {
        throw new Error("Failed to load dashboard");
      }

      const json: DashboardApiResponse = await res.json();
      setData(json);
    } catch (err: any) {
      toast.error(err?.message || "Dashboard load failed");
    } finally {
      setLoading(false);
    }
  }

  const handleRangeChange = (v: DashboardRange) => {
    setRange(v);
    setPage(1);
    startTransition(() => {
      loadDashboard(v, shop);
    });
  };

  const handleShopChange = (v: string) => {
    setShop(v);
    setPage(1);
    startTransition(() => {
      loadDashboard(range, v);
    });
  };

  const handleRefresh = () => {
    startTransition(async () => {
      await loadDashboard(range, shop);
      toast.success("Dashboard refreshed");
    });
  };

  const handleExport = () => {
    exportTransactionsCSV(filteredTransactions);
    toast.success("CSV exported");
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    toast.success("Theme updated");
  };

  React.useEffect(() => {
    setPage(1);
  }, [txFilter, txSearch]);

  const allowShopSelect = data.auth?.role === "ADMIN";

  return (
    <DashboardLayout theme={theme}>
      <div className="mb-6">
        <FiltersBar
          range={range}
          onRangeChange={handleRangeChange}
          shop={shop}
          onShopChange={handleShopChange}
          shops={data.shops}
          date={date}
          onDateChange={setDate}
          onRefresh={handleRefresh}
          onExport={handleExport}
          isRefreshing={isPending}
          theme={theme}
          onThemeToggle={handleThemeToggle}
          allowShopSelect={allowShopSelect}
        />
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={data.summary.totalRevenue}
              prefix="¥"
              change={data.summary.revenueChange}
              positive
              sub="Compared to last month"
              icon={DollarSign}
            />
            <StatCard
              title="Net Profit"
              value={data.summary.totalProfit}
              prefix="¥"
              change={data.summary.profitChange}
              positive
              sub="Stable growth"
              icon={Wallet}
            />
            <StatCard
              title="Total Orders"
              value={data.summary.totalOrders}
              change={data.summary.ordersChange}
              positive
              sub="Completed orders"
              icon={ShoppingCart}
            />
            <StatCard
              title="Refunds"
              value={data.summary.refunds}
              prefix="¥"
              change={data.summary.refundChange}
              positive={false}
              sub="Needs review"
              icon={CreditCard}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
              <RevenueChart
                data={data.revenueData}
                mode={mode}
                onModeChange={setMode}
                theme={theme}
              />

              <TransactionTable
                rows={filteredTransactions}
                filter={txFilter}
                onFilterChange={setTxFilter}
                search={txSearch}
                onSearchChange={setTxSearch}
                page={page}
                onPageChange={setPage}
                theme={theme}
              />
            </div>

            <div className="space-y-6 xl:col-span-4">
              <CategoryPieChart data={data.categoryData} theme={theme} />
              <TopShops data={data.shopData} theme={theme} />
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}