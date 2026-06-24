"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import type { CategoryPoint, ThemeMode } from "@/lib/dashboard-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#60a5fa", "#a78bfa", "#34d399", "#f59e0b", "#fb7185"];

export function CategoryPieChart({
  data,
  theme,
}: {
  data: CategoryPoint[];
  theme: ThemeMode;
}) {
  return (
    <Card className={theme === "dark" ? "border-white/10 bg-white/5 backdrop-blur-xl" : "border-slate-200 bg-white/80 backdrop-blur-xl"}>
      <CardHeader>
        <CardTitle className={theme === "dark" ? "text-white" : "text-slate-900"}>
          Sales Categories
        </CardTitle>
        <CardDescription className={theme === "dark" ? "text-white/55" : "text-slate-500"}>
          Pie chart overview
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  background: theme === "dark" ? "rgba(17,24,39,0.95)" : "rgba(255,255,255,0.98)",
                  border: theme === "dark"
                    ? "1px solid rgba(255,255,255,0.08)"
                    : "1px solid rgba(15,23,42,0.08)",
                  borderRadius: 16,
                  color: theme === "dark" ? "white" : "#0f172a",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 space-y-2">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className={theme === "dark" ? "text-white" : "text-slate-900"}>
                  {item.name}
                </span>
              </div>
              <span className={theme === "dark" ? "text-white/50" : "text-slate-500"}>
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}