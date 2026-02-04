// app/page.tsx (Home)
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarClock, Plus, Settings } from "lucide-react";
import Header from "@/components/header/header";
import TimeCard from "@/components/header/TimeCard";
import Link from "next/link";

export default function Home() {
  const now = new Date();

  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
    now
  );

  return (
    <main className="min-h-dvh w-full">
      {/* Top App Header */}
      <Header />

      {/* Page Container */}
      <section className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 lg:py-10 space-y-6">
        {/* Hero / Announcement Card */}
        <div
          className="
          relative
          w-full
          h-[280px]
          rounded-2xl
          bg-(image:--hero-image)
          bg-cover bg-center
          shadow-xl overflow-hidden
          px-6 sm:px-8 lg:px-12
          py-16 sm:py-20
        "
        >
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
          <div className="relative z-10 flex h-full items-end justify-between gap-4">
            <div className="text-white">
              <p className="text-sm/none mb-2 opacity-90">Welcome back 👋</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow">
                Supermarket POS Dashboard
              </h1>
              <p className="mt-1 text-white/85">
                Track sales, manage products, and monitor activity.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Button variant="secondary">
                <Settings className="size-4 mr-2" /> Settings
              </Button>
              <Button>
                <Plus className="size-4 mr-2" /> New Item
              </Button>
            </div>
          </div>

          {/* Small floating label (meeting) */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/15 text-white backdrop-blur-md shadow-md">
              <CalendarClock className="size-4 mr-2" />
              Upcoming: 12:30 PM
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <TimeCard time={time} date={date} />

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today’s Sales
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">¥128,540</div>
              <p className="mt-2 text-sm text-emerald-600">
                +8.2% vs yesterday
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
              <div className="text-3xl font-bold">3</div>
              <p className="mt-2 text-sm text-muted-foreground">
                2 online • 1 standby
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions + Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Quick Actions</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary">
                    <Link href="/dashboard/product/add">
                      <Plus className="size-4 mr-1" /> Product
                    </Link>
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Plus className="size-4 mr-1" /> Category
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Separator />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <Button variant="outline">New Sale</Button>
                <Button variant="outline">Refund</Button>
                <Button variant="outline">Inventory</Button>
                <Button variant="outline">Reports</Button>
                <Button variant="outline">Suppliers</Button>
                <Button variant="outline">Discounts</Button>
                <Button variant="outline">Employees</Button>
                <Button variant="outline">Customers</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Today’s Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">Morning Delivery</p>
                  <p className="text-sm text-muted-foreground">10:00 — 10:30</p>
                </div>
                <Badge variant="outline">Logistics</Badge>
              </div>
              <Separator />
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">Team Standup</p>
                  <p className="text-sm text-muted-foreground">12:30 — 12:45</p>
                </div>
                <Badge variant="outline">Staff</Badge>
              </div>
              <Separator />
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">Promo Setup</p>
                  <p className="text-sm text-muted-foreground">15:00 — 16:00</p>
                </div>
                <Badge variant="outline">Marketing</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
