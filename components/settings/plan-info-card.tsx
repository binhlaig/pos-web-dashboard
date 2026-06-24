"use client";

import { BadgeCheck, CalendarDays, Crown, Database, Package, Receipt, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanInfo } from "@/lib/settings-api";

const featureLabels: Array<[string, string]> = [
  ["allowRestaurant", "Restaurant"],
  ["allowFashion", "Fashion"],
  ["allowAnalytics", "Analytics"],
  ["allowKitchen", "Kitchen"],
  ["allowTableOrder", "Table Order"],
];

function formatLimit(value: unknown) {
  if (value == null || value === "") return "Unlimited";
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString() : String(value);
}

export function PlanInfoCard({ plan }: { plan: PlanInfo }) {
  const limits = plan.limits || {};
  const features = plan.features || {};
  const status = String(plan.shopStatus || "ACTIVE").toUpperCase();
  const statusVariant =
    status === "ACTIVE" ? "default" : status === "EXPIRED" || status === "SUSPENDED" ? "destructive" : "secondary";

  return (
    <Card className="rounded-2xl border-border/70 bg-background/80 shadow-sm backdrop-blur">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-violet-500/10 p-2 text-violet-500">
              <Crown className="h-5 w-5" />
            </span>
            <div>
              <CardTitle>Current Plan & Usage</CardTitle>
              <CardDescription>Read-only subscription features and limits.</CardDescription>
            </div>
          </div>
          <Badge variant={statusVariant}>{status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Crown className="h-4 w-4" />
              Plan
            </div>
            <p className="mt-2 text-lg font-semibold">{plan.subscriptionPlan || "Unknown"}</p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              End Date
            </div>
            <p className="mt-2 text-lg font-semibold">{plan.subscriptionEndDate || "No end date"}</p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              Products
            </div>
            <p className="mt-2 text-lg font-semibold">{formatLimit(limits.maxProducts)}</p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Staff
            </div>
            <p className="mt-2 text-lg font-semibold">{formatLimit(limits.maxStaff)}</p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Receipt className="h-4 w-4" />
              Monthly Receipts
            </div>
            <p className="mt-2 text-lg font-semibold">{formatLimit(limits.maxReceiptsPerMonth)}</p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              Storage MB
            </div>
            <p className="mt-2 text-lg font-semibold">{formatLimit(limits.maxStorageMb)}</p>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <BadgeCheck className="h-4 w-4 text-emerald-500" />
            Included Features
          </div>
          <div className="flex flex-wrap gap-2">
            {featureLabels.map(([key, label]) => {
              const enabled = Boolean(features[key]);
              return (
                <Badge key={key} variant={enabled ? "default" : "outline"} className={!enabled ? "opacity-60" : ""}>
                  {label}: {enabled ? "On" : "Off"}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
