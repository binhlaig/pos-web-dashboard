import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertCircle, ArrowRight, Barcode, Boxes, CalendarDays,
  CheckCircle2, ClipboardList, Clock3, Drumstick, Factory, Fish, Leaf, Package,
  ScanLine, Snowflake, Truck, Trash2,
} from "lucide-react";

// Save as app/factory/page.tsx. Uses the existing app/factory/layout.tsx.
// Visual preview only: replace these fixtures with authenticated overview data
// once the backend contract exists. Do not present fixtures as live data.
const production = [
  { id: "PR-1028", product: "Fresh Chicken Packs", planned: 120, completed: 80, status: "In progress", tone: "blue" as const, icon: Drumstick, color: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300" },
  { id: "PR-1029", product: "Mixed Vegetables", planned: 90, completed: 90, status: "Ready to pack", tone: "green" as const, icon: Leaf, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  { id: "PR-1030", product: "Fish Fillets", planned: 60, completed: 0, status: "Pending", tone: "amber" as const, icon: Fish, color: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" },
];
const alerts = [
  { name: "Carrots", detail: "12 kg remaining", note: "In Vegetable Zone", badge: "Low stock", tone: "red" as const, icon: Leaf, color: "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300" },
  { name: "Fresh Fish", detail: "2 batches", note: "Expiry within 2 days", badge: "Expiring soon", tone: "amber" as const, icon: Fish, color: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300" },
  { name: "Chicken Batch CH-0702", detail: "Review required", note: "In Cold Room A", badge: "Quality hold", tone: "red" as const, icon: Drumstick, color: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300" },
];
const deliveries = [
  { shop: "Shop A", route: "R-001", crates: 24, status: "Ready", tone: "green" as const, departure: "10:00 AM" },
  { shop: "Shop B", route: "R-002", crates: 18, status: "Picking", tone: "amber" as const, departure: "12:00 PM" },
  { shop: "Shop C", route: "R-003", crates: 12, status: "Dispatched", tone: "blue" as const, departure: "02:00 PM" },
];
const warehouses = [
  { name: "Cold Room A", occupied: 680, capacity: 1000, icon: Snowflake, color: "bg-emerald-500", iconColor: "text-blue-500" },
  { name: "Cold Room B", occupied: 520, capacity: 1000, icon: Snowflake, color: "bg-blue-500", iconColor: "text-blue-500" },
  { name: "Vegetable Zone", occupied: 740, capacity: 1000, icon: Leaf, color: "bg-amber-500", iconColor: "text-emerald-600" },
];
const actions = [
  { label: "Receive Stock", href: "/factory/receiving", icon: Barcode },
  { label: "Start Production", href: "/factory/production", icon: Factory },
  { label: "Pack Items", href: "/factory/packing", icon: Package },
  { label: "Dispatch Goods", href: "/factory/dispatch", icon: Truck },
];
const panel = "min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900";
const tableHead = "bg-slate-100/90 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300";
const cell = "px-3 py-3";

type Tone = "blue" | "green" | "amber" | "red";
function Status({ children, tone }: { children: ReactNode; tone: Tone }) {
  const colors: Record<Tone, string> = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    red: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  };
  const Icon = tone === "green" ? CheckCircle2 : tone === "red" ? AlertCircle : tone === "blue" ? Truck : Clock3;
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[11px] font-semibold ${colors[tone]}`}><Icon aria-hidden="true" className="size-3.5 shrink-0" />{children}</span>;
}
function Progress({ value, label, color = "bg-emerald-500" }: { value: number; label: string; color?: string }) {
  const percent = Math.max(0, Math.min(100, value));
  return <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)} className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} /></div>;
}
function SectionTitle({ title, href, linkLabel = "View all" }: { title: string; href: string; linkLabel?: string }) {
  return <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-bold tracking-tight">{title}</h2><Link href={href} className="inline-flex min-h-9 items-center gap-1 text-xs font-medium text-blue-600 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-blue-400">{linkLabel}<ArrowRight aria-hidden="true" className="size-3.5" /></Link></div>;
}

export default function FactoryOverviewPage() {
  const metrics = [
    { title: "Raw material stock", value: "1,250 kg", subtitle: "Available across 3 storage zones", icon: Boxes, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300" },
    { title: "Production orders", value: "12", subtitle: "5 in progress · 6 pending · 1 ready", icon: ClipboardList, color: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300" },
    { title: "Deliveries today", value: "8", subtitle: "3 dispatched · 5 pending", icon: Truck, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300" },
    { title: "Waste today", value: "18 kg", subtitle: "Recorded during processing", icon: Trash2, color: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300" },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 text-slate-950 dark:text-slate-100">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl xl:text-4xl">Factory Overview</h1><p className="mt-1.5 text-sm text-slate-500 sm:text-base dark:text-slate-400">Production and deliveries at a glance</p></div>
        <div className="flex flex-wrap items-center gap-3 pt-1"><span className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><CalendarDays aria-hidden="true" className="size-4" /><span>07 Oct 2026 · Sample day</span></span><span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">Design preview</span></div>
      </div>
      <p role="note" className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-2.5 text-xs leading-5 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300"><AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />Sample data for the design preview. Live stock, production, and delivery data are not connected yet.</p>

      <section aria-label="Factory summary" className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => { const Icon = metric.icon; return (
          <article key={metric.title} className={`${panel} flex items-center gap-3 xl:gap-4`}>
            <div className={`grid size-14 shrink-0 place-items-center rounded-2xl xl:size-16 ${metric.color}`}><Icon aria-hidden="true" className="size-8" strokeWidth={1.7} /></div>
            <div className="min-w-0"><h2 className="text-xs font-semibold sm:text-sm">{metric.title}</h2><p className="mt-1 whitespace-nowrap text-2xl font-bold tracking-tight tabular-nums xl:text-3xl">{metric.value}</p><p className="mt-1 text-[11px] leading-4 text-slate-500 dark:text-slate-400">{metric.subtitle}</p></div>
          </article>
        ); })}
      </section>

      <section aria-label="Scan quick actions" className="rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
        <div className="grid items-center gap-4 xl:grid-cols-[minmax(200px,0.9fr)_minmax(0,2fr)]">
          <div className="flex items-center gap-3"><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"><ScanLine aria-hidden="true" className="size-8" /></span><div><h2 className="text-xl font-bold">Scan to start</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Quick actions for daily operations</p></div></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {actions.map((action, index) => { const Icon = action.icon; return <Link key={action.href} href={action.href} className={`flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border bg-white px-2 py-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 motion-reduce:transform-none dark:bg-slate-900 ${index === 0 ? "border-blue-500 ring-2 ring-blue-100 dark:ring-blue-500/10" : "border-blue-100 dark:border-slate-700"}`}><Icon aria-hidden="true" className="size-6 text-blue-600 dark:text-blue-400" /><span className="text-xs font-semibold">{action.label}</span></Link>; })}
          </div>
        </div>
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
        <section className={panel}>
          <SectionTitle title="Today's Production" href="/factory/production" linkLabel="View all orders" />
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700"><table className="w-full min-w-[650px] text-left text-xs"><thead className={tableHead}><tr>{["Order", "Product", "Planned", "Completed", "Status"].map((label) => <th key={label} scope="col" className={`${cell} font-medium`}>{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {production.map((order) => { const Icon = order.icon; return <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40"><td className={`${cell} whitespace-nowrap font-medium`}>{order.id}</td><td className={cell}><div className="flex items-center gap-2"><span className={`grid size-10 shrink-0 place-items-center rounded-lg ${order.color}`}><Icon aria-hidden="true" className="size-6" /></span><span className="font-medium">{order.product}</span></div></td><td className={`${cell} whitespace-nowrap tabular-nums`}>{order.planned} packs</td><td className={`${cell} min-w-32`}><p className="mb-1.5 whitespace-nowrap tabular-nums">{order.completed} packs</p><Progress value={order.completed / order.planned * 100} label={`${order.product} completion`} /></td><td className={cell}><Status tone={order.tone}>{order.status}</Status></td></tr>; })}
          </tbody></table></div><p className="mt-3 text-[11px] text-slate-400">Showing 3 of 12 sample production orders.</p>
        </section>
        <section className={panel}>
          <SectionTitle title="Stock Alerts" href="/factory/warehouse" />
          <div className="divide-y divide-slate-100 dark:divide-slate-800">{alerts.map((alert) => { const Icon = alert.icon; return <div key={alert.name} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"><div className={`grid size-12 shrink-0 place-items-center rounded-xl ${alert.color}`}><Icon aria-hidden="true" className="size-7" /></div><div className="min-w-0 flex-1"><h3 className="text-xs font-bold">{alert.name}</h3><p className="mt-1 text-xs">{alert.detail}</p><p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{alert.note}</p></div><Status tone={alert.tone}>{alert.badge}</Status></div>; })}</div>
        </section>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className={panel}>
          <SectionTitle title="Shop Deliveries" href="/factory/dispatch" linkLabel="View all deliveries" />
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700"><table className="w-full min-w-[530px] text-left text-xs"><thead className={tableHead}><tr>{["Shop", "Route", "Crates", "Status", "Departure"].map((label) => <th key={label} scope="col" className={`${cell} font-medium`}>{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{deliveries.map((delivery) => <tr key={delivery.route} className="hover:bg-slate-50 dark:hover:bg-slate-800/40"><td className={cell}><span className="flex items-center gap-2 whitespace-nowrap font-semibold"><Truck aria-hidden="true" className="size-5 text-blue-500" />{delivery.shop}</span></td><td className={cell}>{delivery.route}</td><td className={`${cell} whitespace-nowrap`}>{delivery.crates} crates</td><td className={cell}><Status tone={delivery.tone}>{delivery.status}</Status></td><td className={`${cell} whitespace-nowrap tabular-nums`}>{delivery.departure}</td></tr>)}</tbody></table></div><p className="mt-3 text-[11px] text-slate-400">Showing 3 of 8 sample deliveries.</p>
        </section>
        <section className={panel}>
          <SectionTitle title="Warehouse Status" href="/factory/warehouse" />
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700"><table className="w-full min-w-[430px] text-left text-xs"><thead className={tableHead}><tr><th scope="col" className={`${cell} font-medium`}>Location</th><th scope="col" className={`${cell} font-medium`}>Occupied</th><th scope="col" className={`${cell} text-right font-medium`}>Capacity</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{warehouses.map((warehouse) => { const percent = warehouse.occupied / warehouse.capacity * 100; const Icon = warehouse.icon; return <tr key={warehouse.name}><td className={cell}><span className="flex items-center gap-2 whitespace-nowrap"><Icon aria-hidden="true" className={`size-4 shrink-0 ${warehouse.iconColor}`} />{warehouse.name}</span></td><td className={`${cell} min-w-36`}><div className="flex items-center gap-2"><span className="w-8 shrink-0 text-xs font-bold tabular-nums">{Math.round(percent)}%</span><div className="min-w-0 flex-1"><Progress value={percent} label={`${warehouse.name} occupancy`} color={warehouse.color} /></div></div></td><td className={`${cell} whitespace-nowrap text-right tabular-nums text-slate-500 dark:text-slate-400`}>{warehouse.occupied.toLocaleString("en-US")} / {warehouse.capacity.toLocaleString("en-US")} kg</td></tr>; })}</tbody></table></div><p className="mt-3 text-[11px] leading-5 text-slate-400">Occupancy includes reserved and held stock. Available raw materials are shown separately above.</p>
        </section>
      </div>
    </div>
  );
}

