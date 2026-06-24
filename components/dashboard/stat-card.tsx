"use client";

import CountUp from "react-countup";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StatCard({
  title,
  value,
  prefix = "",
  change,
  positive,
  sub,
  icon: Icon,
}: {
  title: string;
  value: number;
  prefix?: string;
  change: string;
  positive: boolean;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.16)]">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardDescription className="text-white/60">{title}</CardDescription>
          <CardTitle className="mt-2 text-2xl font-bold tracking-tight text-white">
            {prefix}
            <CountUp end={value} duration={1.2} separator="," />
          </CardTitle>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-2 text-sm">
          <Badge
            className={
              positive
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10"
                : "border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/10"
            }
          >
            {positive ? (
              <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="mr-1 h-3.5 w-3.5" />
            )}
            {change}
          </Badge>
          <span className="text-white/50">{sub}</span>
        </div>
      </CardContent>
    </Card>
  );
}