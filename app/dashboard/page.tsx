
// app/dashboard/page.tsx
import Header from "@/components/header/header";
import TimeCard from "@/components/header/TimeCard";
import NowText from "@/components/header/NowText";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  CalendarClock,
  Plus,
  Settings,
  User2,
  Mail,
  TrendingUp,
  Receipt,
  Boxes,
  ArrowRight,
  Bell,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

function initialsFrom(str?: string | null) {
  if (!str) return "U";
  const parts = str.trim().split(/\s+/);
  const ini =
    parts.length === 1
      ? parts[0].slice(0, 2)
      : (parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "");
  return ini.toUpperCase();
}

function formatJPY(n: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(n);
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/Sign_in");

  const user = session.user as any;

  const userName: string =
    user?.name || user?.username || user?.displayName || "Unnamed User";
  const userEmail: string = user?.email || "no-email@example.com";
  const userImage: string | null = user?.avatarUrl ?? user?.image ?? null;
  const userRole: string = user?.role || "Staff";
  const employeeId: string | number | undefined = user?.employeeId || user?.id;

  // ✅ mock server-side KPIs (later replace with real DB/API)
  const kpi = {
    todaySales: 128540,
    salesDelta: 8.2,
    orders: 214,
    lowStock: 7,
    activeRegisters: { total: 3, online: 2, standby: 1 },
  };

  const quickActions = [
    {
      icon: <Plus className="size-4" />,
      label: "New Product",
      href: "/dashboard/product",
    },
    { icon: <Receipt className="size-4" />, label: "New Sale", href: "/pos" },
    {
      icon: <Boxes className="size-4" />,
      label: "Inventory",
      href: "/inventory",
    },
    {
      icon: <Settings className="size-4" />,
      label: "Settings",
      href: "/settings",
    },
  ];

  const recentActivity = [
    { title: "Sale completed", meta: "Register #2 • ¥3,460", time: "10:12" },
    { title: "Stock updated", meta: "SKU 49100012 • +24", time: "09:40" },
    { title: "New product added", meta: "Green Tea 500ml", time: "09:05" },
    { title: "Refund processed", meta: "Order #A-12091", time: "08:22" },
  ];

  const todaySchedule = [
    { time: "12:30", title: "Supplier delivery", meta: "Back door • 18 boxes" },
    { time: "15:00", title: "Shift change", meta: "Cashier team" },
    { time: "18:00", title: "Daily close prep", meta: "Register audit" },
  ];

  return (
    <section className="w-full">
      {/* <Header /> */}

      <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 lg:py-10 space-y-6">
        {/* Hero */}
        <div className="relative w-full rounded-2xl bg-(image:--hero-image) bg-cover bg-center shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

          <div className="relative z-10 px-6 sm:px-8 lg:px-12 py-10 sm:py-12 lg:py-14">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

              <div className="text-white">
                <p className="text-sm/none mb-2 opacity-90">
                  Welcome back, {userName.split(" ")[0]} 👋
                </p>

                {/* Title + TimeCard */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow">
                    Supermarket POS Dashboard
                  </h1>

                  {/* ✅ Move TimeCard here */}
                  <div className="w-full sm:w-auto">
                    <TimeCard />
                  </div>
                </div>

                <p className="mt-2 text-white/85">
                  Track sales, manage products, and monitor activity.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge className="bg-white/20 text-white backdrop-blur-md shadow-md">
                    {userRole}
                  </Badge>
                  {/* ...your other badges */}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="secondary"
                  className="bg-white/90 hover:bg-white"
                >
                  <Settings className="size-4 mr-2" /> Settings
                </Button>
                <Button>
                  <Plus className="size-4 mr-2" /> New Item
                </Button>
              </div>
            </div>
          </div>

          {/* top-left chip */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Badge className="bg-white/15 text-white backdrop-blur-md shadow-md">
              <CalendarClock className="size-4 mr-2" /> Today schedule
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* ✅ Client-time (no hydration mismatch) */}
          <TimeCard />

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today’s Sales
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">
                {formatJPY(kpi.todaySales)}
              </div>
              <p className="mt-2 text-sm text-emerald-600">
                +{kpi.salesDelta}% vs yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Registers
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">
                {kpi.activeRegisters.total}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {kpi.activeRegisters.online} online •{" "}
                {kpi.activeRegisters.standby} standby
              </p>
            </CardContent>
          </Card>

          {/* 🧑‍💼 User Info */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                User
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-black/5">
                  <AvatarImage src={userImage ?? undefined} alt={userName} />
                  <AvatarFallback>{initialsFrom(userName)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <div className="font-semibold truncate">{userName}</div>
                  <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <Mail className="size-3" /> {userEmail}
                  </div>
                </div>
              </div>

              <Separator className="my-3" />
  

              <div className="grid grid-cols-2 gap-2 text-sm min-w-0">
                <div>
                  <div className="text-muted-foreground text-xs">Role</div>
                  <div className="font-medium truncate">{userRole}</div>
                </div>

                <div>
                  <div className="text-muted-foreground text-xs">
                    Employee ID
                  </div>
                  <div
                    className="font-medium truncate"
                    title={String(employeeId ?? "—")}
                  >
                    {employeeId ?? "—"}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary">
                  Profile
                </Button>
                <Button size="sm">Switch</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Quick Actions */}
          <Card className="lg:col-span-4 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((a) => (
                  <Button
                    key={a.label}
                    variant="secondary"
                    className="justify-between"
                    asChild
                  >
                    <a href={a.href}>
                      <span className="inline-flex items-center gap-2">
                        {a.icon}
                        {a.label}
                      </span>
                      <ArrowRight className="size-4 opacity-60" />
                    </a>
                  </Button>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="text-sm text-muted-foreground">
                Tip: use{" "}
                <span className="font-medium text-foreground">New Sale</span>{" "}
                for fastest checkout flow.
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-5 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {recentActivity.map((x, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-medium">{x.title}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {x.meta}
                      </div>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {x.time}
                    </Badge>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <Button variant="secondary" className="w-full">
                View all activity
              </Button>
            </CardContent>
          </Card>

          {/* Today Schedule */}
          <Card className="lg:col-span-3 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Today Schedule</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {todaySchedule.map((s, idx) => (
                  <div key={idx} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold">{s.title}</div>
                      <Badge variant="outline">{s.time}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {s.meta}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Button className="w-full">Open schedule</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </section>
  );
}
