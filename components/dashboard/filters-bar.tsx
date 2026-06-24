"use client";

import { format } from "date-fns";
import { CalendarDays, RefreshCcw, Download, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { DashboardRange, ThemeMode } from "@/lib/dashboard-data";

export function FiltersBar({
  range,
  onRangeChange,
  shop,
  onShopChange,
  shops,
  date,
  onDateChange,
  onRefresh,
  onExport,
  isRefreshing,
  theme,
  onThemeToggle,
  allowShopSelect,
}: {
  range: DashboardRange;
  onRangeChange: (v: DashboardRange) => void;
  shop: string;
  onShopChange: (v: string) => void;
  shops: string[];
  date: Date | undefined;
  onDateChange: (d: Date | undefined) => void;
  onRefresh: () => void;
  onExport: () => void;
  isRefreshing: boolean;
  theme: ThemeMode;
  onThemeToggle: () => void;
  allowShopSelect: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select value={range} onValueChange={(v) => onRangeChange(v as DashboardRange)}>
          <SelectTrigger className={theme === "dark"
            ? "w-full border-white/10 bg-white/5 text-white sm:w-[160px]"
            : "w-full border-slate-200 bg-white text-slate-900 sm:w-[160px]"
          }>
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={shop} onValueChange={onShopChange} disabled={!allowShopSelect}>
          <SelectTrigger className={theme === "dark"
            ? "w-full border-white/10 bg-white/5 text-white sm:w-[180px]"
            : "w-full border-slate-200 bg-white text-slate-900 sm:w-[180px]"
          }>
            <SelectValue placeholder="Select shop" />
          </SelectTrigger>
          <SelectContent>
            {shops.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={theme === "dark"
                ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
              }
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              {date ? format(date, "yyyy-MM-dd") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={onDateChange} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          className={theme === "dark"
            ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
            : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
          }
          onClick={onThemeToggle}
        >
          {theme === "dark" ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              Light
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </>
          )}
        </Button>

        <Button
          variant="outline"
          className={theme === "dark"
            ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
            : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
          }
          onClick={onRefresh}
        >
          <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>

        <Button
          variant="outline"
          className={theme === "dark"
            ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
            : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
          }
          onClick={onExport}
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}