"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import type { RevenuePoint, MetricMode, ThemeMode } from "@/lib/dashboard-data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const themeChart = {
  dark: {
    stroke: "#ffffff",
    grid: "rgba(255,255,255,0.08)",
    tick: "rgba(255,255,255,0.55)",
    tooltipBg: "rgba(17,24,39,0.95)",
    tooltipBorder: "1px solid rgba(255,255,255,0.08)",
  },
  light: {
    stroke: "#0f172a",
    grid: "rgba(15,23,42,0.08)",
    tick: "rgba(15,23,42,0.55)",
    tooltipBg: "rgba(255,255,255,0.98)",
    tooltipBorder: "1px solid rgba(15,23,42,0.08)",
  },
};

export function RevenueChart({
  data,
  mode,
  onModeChange,
  theme,
}: {
  data: RevenuePoint[];
  mode: MetricMode;
  onModeChange: (v: MetricMode) => void;
  theme: ThemeMode;
}) {
  const dataKey = mode === "revenue" ? "revenue" : "profit";
  const t = themeChart[theme];

  return (
    <Card className={theme === "dark" ? "border-white/10 bg-white/5 backdrop-blur-xl" : "border-slate-200 bg-white/80 backdrop-blur-xl"}>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className={theme === "dark" ? "text-white" : "text-slate-900"}>
            Revenue Overview
          </CardTitle>
          <CardDescription className={theme === "dark" ? "text-white/55" : "text-slate-500"}>
            Toggle revenue and profit
          </CardDescription>
        </div>

        <Tabs value={mode} onValueChange={(v) => onModeChange(v as MetricMode)}>
          <TabsList className={theme === "dark" ? "bg-white/5" : "bg-slate-100"}>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="profit">Profit</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={t.stroke} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={t.stroke} stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke={t.grid} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: t.tick, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: t.tick, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: t.tooltipBg,
                  border: t.tooltipBorder,
                  borderRadius: 16,
                  color: theme === "dark" ? "white" : "#0f172a",
                }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={t.stroke}
                fill="url(#chartFill)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}