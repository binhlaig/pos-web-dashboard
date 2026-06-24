"use client";

import { motion } from "framer-motion";
import type { ShopPoint, ThemeMode } from "@/lib/dashboard-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function TopShops({
  data,
  theme,
}: {
  data: ShopPoint[];
  theme: ThemeMode;
}) {
  return (
    <Card className={theme === "dark" ? "border-white/10 bg-white/5 backdrop-blur-xl" : "border-slate-200 bg-white/80 backdrop-blur-xl"}>
      <CardHeader>
        <CardTitle className={theme === "dark" ? "text-white" : "text-slate-900"}>
          Top Shops
        </CardTitle>
        <CardDescription className={theme === "dark" ? "text-white/55" : "text-slate-500"}>
          Branch performance
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {data.map((shop) => (
          <div key={shop.name}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className={theme === "dark" ? "font-medium text-white" : "font-medium text-slate-900"}>
                {shop.name}
              </span>
              <span className={theme === "dark" ? "text-white/50" : "text-slate-500"}>
                {shop.value}%
              </span>
            </div>

            <div className={theme === "dark" ? "h-2.5 w-full overflow-hidden rounded-full bg-white/10" : "h-2.5 w-full overflow-hidden rounded-full bg-slate-100"}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${shop.value}%` }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}