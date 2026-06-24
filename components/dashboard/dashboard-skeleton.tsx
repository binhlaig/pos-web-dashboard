"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-white/10 bg-white/5 backdrop-blur-xl">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-4 h-8 w-36" />
              <Skeleton className="mt-4 h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl xl:col-span-8">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-4 h-[320px] w-full" />
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5 backdrop-blur-xl xl:col-span-4">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-4 h-[320px] w-full rounded-2xl" />
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-4 h-[260px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}