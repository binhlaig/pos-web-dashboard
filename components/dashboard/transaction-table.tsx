"use client";

import * as React from "react";
import type { TransactionItem, ThemeMode } from "@/lib/dashboard-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

export function TransactionTable({
  rows,
  filter,
  onFilterChange,
  search,
  onSearchChange,
  page,
  onPageChange,
  theme,
}: {
  rows: TransactionItem[];
  filter: string;
  onFilterChange: (v: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  page: number;
  onPageChange: (v: number) => void;
  theme: ThemeMode;
}) {
  const pageSize = 5;

  const searchedRows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((tx) =>
      [tx.id, tx.customer, tx.shop, tx.type, String(tx.amount), tx.time]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(searchedRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pagedRows = searchedRows.slice(start, start + pageSize);

  React.useEffect(() => {
    if (page > totalPages) {
      onPageChange(totalPages);
    }
  }, [page, totalPages, onPageChange]);

  return (
    <Card className={theme === "dark" ? "border-white/10 bg-white/5 backdrop-blur-xl" : "border-slate-200 bg-white/80 backdrop-blur-xl"}>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className={theme === "dark" ? "text-white" : "text-slate-900"}>
              Recent Transactions
            </CardTitle>
            <CardDescription className={theme === "dark" ? "text-white/55" : "text-slate-500"}>
              Latest activities
            </CardDescription>
          </div>

          <Tabs value={filter} onValueChange={onFilterChange}>
            <TabsList className={theme === "dark" ? "bg-white/5" : "bg-slate-100"}>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="refund">Refund</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search transaction, customer, shop..."
          className={theme === "dark"
            ? "border-white/10 bg-white/5 text-white placeholder:text-white/35"
            : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
          }
        />
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className={theme === "dark" ? "border-b border-white/10" : "border-b border-slate-200"}>
                <th className={theme === "dark" ? "px-3 py-3 text-left font-medium text-white" : "px-3 py-3 text-left font-medium text-slate-900"}>Transaction</th>
                <th className={theme === "dark" ? "px-3 py-3 text-left font-medium text-white" : "px-3 py-3 text-left font-medium text-slate-900"}>Customer</th>
                <th className={theme === "dark" ? "px-3 py-3 text-left font-medium text-white" : "px-3 py-3 text-left font-medium text-slate-900"}>Shop</th>
                <th className={theme === "dark" ? "px-3 py-3 text-left font-medium text-white" : "px-3 py-3 text-left font-medium text-slate-900"}>Status</th>
                <th className={theme === "dark" ? "px-3 py-3 text-left font-medium text-white" : "px-3 py-3 text-left font-medium text-slate-900"}>Time</th>
                <th className={theme === "dark" ? "px-3 py-3 text-right font-medium text-white" : "px-3 py-3 text-right font-medium text-slate-900"}>Amount</th>
              </tr>
            </thead>

            <tbody>
              {pagedRows.map((tx) => (
                <tr
                  key={tx.id}
                  className={theme === "dark"
                    ? "border-b border-white/5 transition-colors hover:bg-white/5"
                    : "border-b border-slate-100 transition-colors hover:bg-slate-50"
                  }
                >
                  <td className={theme === "dark" ? "px-3 py-4 font-medium text-white" : "px-3 py-4 font-medium text-slate-900"}>
                    {tx.id}
                  </td>
                  <td className={theme === "dark" ? "px-3 py-4 text-white" : "px-3 py-4 text-slate-900"}>
                    {tx.customer}
                  </td>
                  <td className={theme === "dark" ? "px-3 py-4 text-white" : "px-3 py-4 text-slate-900"}>
                    {tx.shop}
                  </td>
                  <td className="px-3 py-4">
                    <Badge
                      className={
                        tx.type === "Paid"
                          ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10"
                          : tx.type === "Pending"
                          ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/10"
                          : "bg-rose-500/10 text-rose-400 hover:bg-rose-500/10"
                      }
                    >
                      {tx.type}
                    </Badge>
                  </td>
                  <td className={theme === "dark" ? "px-3 py-4 text-white" : "px-3 py-4 text-slate-900"}>
                    {tx.time}
                  </td>
                  <td className={theme === "dark" ? "px-3 py-4 text-right font-semibold text-white" : "px-3 py-4 text-right font-semibold text-slate-900"}>
                    ¥{tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className={theme === "dark" ? "text-sm text-white/50" : "text-sm text-slate-500"}>
            Page {safePage} / {totalPages}
          </div>

          <div className="flex gap-2">
            <button
              className={theme === "dark"
                ? "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white disabled:opacity-40"
                : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 disabled:opacity-40"
              }
              onClick={() => onPageChange(Math.max(1, safePage - 1))}
              disabled={safePage <= 1}
            >
              Prev
            </button>

            <button
              className={theme === "dark"
                ? "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white disabled:opacity-40"
                : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 disabled:opacity-40"
              }
              onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
              disabled={safePage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}