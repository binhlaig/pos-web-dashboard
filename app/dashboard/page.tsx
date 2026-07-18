"use client";

import { useState, type ElementType } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  Package,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { NavbarDemo } from "@/components/navbarDemo";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";

type SalesRange = "daily" | "weekly" | "monthly";

type SalesItem = {
  label: string;
  value: number;
};

const salesData: Record<SalesRange, SalesItem[]> = {
  daily: [
    { label: "8 AM", value: 8500 },
    { label: "10 AM", value: 18500 },
    { label: "12 PM", value: 32000 },
    { label: "2 PM", value: 24500 },
    { label: "4 PM", value: 38000 },
    { label: "6 PM", value: 46500 },
    { label: "8 PM", value: 28000 },
    { label: "10 PM", value: 14000 },
  ],

  weekly: [
    { label: "Mon", value: 82000 },
    { label: "Tue", value: 114000 },
    { label: "Wed", value: 164000 },
    { label: "Thu", value: 121000 },
    { label: "Fri", value: 86000 },
    { label: "Sat", value: 136000 },
    { label: "Sun", value: 120000 },
  ],

  monthly: [
    { label: "Week 1", value: 420000 },
    { label: "Week 2", value: 568000 },
    { label: "Week 3", value: 486000 },
    { label: "Week 4", value: 625000 },
  ],
};

const salesInformation: Record<
  SalesRange,
  {
    title: string;
    description: string;
    change: string;
  }
> = {
  daily: {
    title: "Daily Sales",
    description: "Today’s hourly sales performance",
    change: "+8.5%",
  },
  weekly: {
    title: "Weekly Sales",
    description: "Sales performance for this week",
    change: "+12.5%",
  },
  monthly: {
    title: "Monthly Sales",
    description: "Sales performance for this month",
    change: "+18.2%",
  },
};

const transactions = [
  {
    receipt: "#RCT-250518-001",
    time: "10:24 AM",
    customer: "Walk-in Customer",
    total: "¥4,250",
    payment: "Cash",
    status: "Completed",
  },
  {
    receipt: "#RCT-250518-002",
    time: "10:18 AM",
    customer: "Ko Min Thant",
    total: "¥12,800",
    payment: "KPay",
    status: "Completed",
  },
  {
    receipt: "#RCT-250518-003",
    time: "10:05 AM",
    customer: "May Thu Zar",
    total: "¥7,600",
    payment: "Card",
    status: "Completed",
  },
  {
    receipt: "#RCT-250518-004",
    time: "09:52 AM",
    customer: "Walk-in Customer",
    total: "¥2,350",
    payment: "Cash",
    status: "Completed",
  },
];

const lowStockItems = [
  {
    name: "Mineral Water 500ml",
    stock: 6,
    color:
      "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  {
    name: "Potato Chips Classic",
    stock: 8,
    color:
      "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  },
  {
    name: "Instant Noodles Spicy",
    stock: 5,
    color:
      "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  },
  {
    name: "Laundry Detergent 1kg",
    stock: 7,
    color:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
];

function formatYen(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatChartValue(value: number) {
  if (value >= 1_000_000) {
    return `¥${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `¥${Math.round(value / 1_000)}K`;
  }

  return `¥${value}`;
}

const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [salesRange, setSalesRange] =
    useState<SalesRange>("weekly");

  const selectedSales = salesData[salesRange];

  const totalSales = selectedSales.reduce(
    (total, item) => total + item.value,
    0,
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 pt-[96px] transition-colors dark:bg-slate-950">
      {/* Navbar */}
      <NavbarDemo
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() =>
          setSidebarCollapsed((previous) => !previous)
        }
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      {/* Sidebar */}
      <DashboardSidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Dashboard content */}
      <section
        className={`
          py-5 transition-[margin] duration-300
          ${
            sidebarCollapsed
              ? "lg:ml-[92px]"
              : "lg:ml-[236px]"
          }
        `}
      >
        {/* Heading */}
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              Dashboard Overview
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Today&apos;s shop sales and performance summary.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="
                flex h-10 items-center gap-2 rounded-xl
                border border-slate-200 bg-white px-3
                text-xs font-medium text-slate-600
                shadow-sm transition hover:bg-slate-50
                dark:border-white/10 dark:bg-black
                dark:text-slate-300 dark:hover:bg-white/10
                sm:text-sm
              "
            >
              <CalendarDays size={17} />
              <span>May 12 – May 18</span>
            </button>

            <Link
              href="/dashboard/pos"
              className="
                flex h-10 items-center gap-2 rounded-xl
                bg-blue-600 px-4 text-xs font-semibold
                text-white shadow-md shadow-blue-600/20
                transition hover:bg-blue-700 active:scale-95
                sm:text-sm
              "
            >
              <ShoppingCart size={17} />
              Open POS
            </Link>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <SummaryCard
            title="Today Sales"
            value="¥128,500"
            change="+18.6%"
            comparison="vs yesterday"
            icon={TrendingUp}
            iconStyle="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          />

          <SummaryCard
            title="Orders"
            value="142"
            change="+12.4%"
            comparison="vs yesterday"
            icon={ShoppingCart}
            iconStyle="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
          />

          <SummaryCard
            title="Products"
            value="1,248"
            change="+5.3%"
            comparison="vs last week"
            icon={Package}
            iconStyle="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"
          />

          <SummaryCard
            title="Low Stock"
            value="32"
            change="-8.2%"
            comparison="vs last week"
            icon={AlertTriangle}
            iconStyle="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
            negative
          />
        </div>

        {/* Charts */}
        <div className="mt-4 grid grid-cols-1 gap-4 2xl:grid-cols-5">
          {/* Sales line chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black 2xl:col-span-3">
            {/* Chart header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-bold text-slate-950 dark:text-white">
                  {salesInformation[salesRange].title}
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {salesInformation[salesRange].description}
                </p>
              </div>

              {/* Range buttons */}
              <div className="flex w-fit items-center rounded-xl bg-slate-100 p-1 dark:bg-white/[0.07]">
                <SalesRangeButton
                  label="Daily"
                  active={salesRange === "daily"}
                  onClick={() => setSalesRange("daily")}
                />

                <SalesRangeButton
                  label="Weekly"
                  active={salesRange === "weekly"}
                  onClick={() => setSalesRange("weekly")}
                />

                <SalesRangeButton
                  label="Monthly"
                  active={salesRange === "monthly"}
                  onClick={() => setSalesRange("monthly")}
                />
              </div>
            </div>

            {/* Sales total */}
            <div className="mt-6 flex items-end gap-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total sales
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
                  {formatYen(totalSales)}
                </p>
              </div>

              <span className="mb-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                {salesInformation[salesRange].change}
              </span>
            </div>

            {/* Recharts line chart */}
            <div className="mt-6 h-[280px] w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  key={salesRange}
                  data={selectedSales}
                  margin={{
                    top: 12,
                    right: 12,
                    bottom: 0,
                    left: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="salesGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--color-blue-600)"
                        stopOpacity={0.38}
                      />

                      <stop
                        offset="55%"
                        stopColor="var(--color-blue-400)"
                        stopOpacity={0.13}
                      />

                      <stop
                        offset="100%"
                        stopColor="var(--color-blue-400)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="rgba(148, 163, 184, 0.2)"
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    dy={10}
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={52}
                    tick={{
                      fill: "#94a3b8",
                      fontSize: 11,
                    }}
                    tickFormatter={formatChartValue}
                  />

                  <Tooltip
                    cursor={{
                      stroke: "var(--color-blue-600)",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                    formatter={(value) => [
                      formatYen(Number(value)),
                      "Sales",
                    ]}
                    labelFormatter={(label) =>
                      salesRange === "daily"
                        ? `Time: ${label}`
                        : `${label}`
                    }
                    contentStyle={{
                      border: "none",
                      borderRadius: "12px",
                      backgroundColor: "#0f172a",
                      boxShadow:
                        "0 12px 30px rgba(15, 23, 42, 0.18)",
                      padding: "10px 12px",
                    }}
                    labelStyle={{
                      color: "#94a3b8",
                      fontSize: "11px",
                      marginBottom: "5px",
                    }}
                    itemStyle={{
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Sales"
                    stroke="var(--color-blue-600)"
                    strokeWidth={3}
                    fill="url(#salesGradient)"
                    dot={{
                      r: 4,
                      fill: "#ffffff",
                      stroke: "var(--color-blue-600)",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 6,
                      fill: "var(--color-blue-600)",
                      stroke: "#ffffff",
                      strokeWidth: 3,
                    }}
                    animationBegin={0}
                    animationDuration={700}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black 2xl:col-span-2">
            <h2 className="font-bold text-slate-950 dark:text-white">
              Sales by Category
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Product category sales distribution
            </p>

            <div className="mt-8 flex flex-col items-center gap-7 lg:flex-row lg:justify-center">
              <div
                className="relative h-44 w-44 shrink-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(var(--color-blue-600) 0% 33%, #22c55e 33% 55%, #f97316 55% 74%, #8b5cf6 74% 89%, #cbd5e1 89% 100%)",
                }}
              >
                <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-white transition-colors dark:bg-black">
                  <p className="text-xl font-bold text-slate-950 dark:text-white">
                    ¥128.5K
                  </p>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Total sales
                  </p>
                </div>
              </div>

              <div className="w-full space-y-3">
                <CategoryItem
                  color="bg-blue-600"
                  title="Beverages"
                  value="¥42,300"
                  percent="32.9%"
                />

                <CategoryItem
                  color="bg-green-500"
                  title="Snacks"
                  value="¥28,600"
                  percent="22.3%"
                />

                <CategoryItem
                  color="bg-orange-500"
                  title="Groceries"
                  value="¥24,800"
                  percent="19.3%"
                />

                <CategoryItem
                  color="bg-violet-500"
                  title="Household"
                  value="¥18,700"
                  percent="14.5%"
                />

                <CategoryItem
                  color="bg-slate-300"
                  title="Others"
                  value="¥14,100"
                  percent="11.0%"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom content */}
        <div className="mt-4 grid grid-cols-1 gap-4 2xl:grid-cols-5">
          {/* Recent transactions */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-black 2xl:col-span-3">
            <div className="flex items-center justify-between p-5">
              <div>
                <h2 className="font-bold text-slate-950 dark:text-white">
                  Recent Transactions
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Latest POS sales and payments
                </p>
              </div>

              <Link
                href="/dashboard/receipts"
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead className="border-y border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.04]">
                  <tr className="text-left text-[11px] text-slate-500 dark:text-slate-400">
                    <th className="px-5 py-3 font-medium">
                      Receipt
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Time
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Customer
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Total
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Payment
                    </th>

                    <th className="px-4 py-3 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.receipt}
                      className="text-xs transition hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 font-medium text-blue-600">
                        {transaction.receipt}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {transaction.time}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-700 dark:text-slate-200">
                        {transaction.customer}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-900 dark:text-white">
                        {transaction.total}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {transaction.payment}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low stock */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black 2xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-950 dark:text-white">
                  Low Stock Alerts
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Products requiring restock
                </p>
              </div>

              <Link
                href="/dashboard/inventory"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>

            <div className="mt-5 divide-y divide-slate-100 dark:divide-white/[0.06]">
              {lowStockItems.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-3 py-3"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}
                  >
                    <Package size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                      {item.name}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      Current stock: {item.stock}
                    </p>
                  </div>

                  <span className="whitespace-nowrap rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-medium text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                    {item.stock} left
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/dashboard/inventory"
              className="
                mt-4 flex h-10 w-full items-center
                justify-center gap-2 rounded-xl
                border border-slate-200
                text-xs font-semibold text-slate-600
                transition hover:bg-slate-50
                dark:border-white/10 dark:text-slate-300
                dark:hover:bg-white/10
              "
            >
              <ReceiptText size={16} />
              Manage inventory
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DashboardPage;

function SummaryCard({
  title,
  value,
  change,
  comparison,
  icon: Icon,
  iconStyle,
  negative = false,
}: {
  title: string;
  value: string;
  change: string;
  comparison: string;
  icon: ElementType;
  iconStyle: string;
  negative?: boolean;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-black">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
            {value}
          </h2>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px]">
        <span
          className={
            negative
              ? "font-semibold text-red-500"
              : "font-semibold text-emerald-600"
          }
        >
          {change}
        </span>

        <span className="text-slate-400">
          {comparison}
        </span>
      </div>
    </article>
  );
}

function SalesRangeButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-lg px-3 py-1.5
        text-[11px] font-medium
        transition-all duration-200
        sm:text-xs
        ${
          active
            ? "bg-white text-blue-600 shadow-sm dark:bg-white/10 dark:text-blue-400"
            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        }
      `}
    >
      {label}
    </button>
  );
}

function CategoryItem({
  color,
  title,
  value,
  percent,
}: {
  color: string;
  title: string;
  value: string;
  percent: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <span
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`}
      />

      <span className="min-w-0 flex-1 truncate text-slate-600 dark:text-slate-300">
        {title}
      </span>

      <span className="whitespace-nowrap font-medium text-slate-900 dark:text-white">
        {value}
      </span>

      <span className="w-11 text-right text-slate-400">
        {percent}
      </span>
    </div>
  );
}