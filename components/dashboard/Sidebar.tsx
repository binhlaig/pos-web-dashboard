


"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Barcode, Boxes, ChartNoAxesCombined, ClipboardCheck, Clock3,
  LayoutDashboard, Package, ReceiptText, ScanLine, Settings2, ShieldCheck,Calendar,
  ShoppingBag, Store, UsersRound, X, type LucideIcon,
} from "lucide-react";

type DashboardSidebarProps = {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
};

type SidebarItem = { title: string; href: string; icon: LucideIcon };

const sidebarItems: SidebarItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Admin", href: "/admin", icon: ShieldCheck },
  { title: "Products", href: "/dashboard/product", icon: Package },
  { title: "Barcode", href: "/dashboard/product/barcode", icon: Barcode },
  { title: "Sales", href: "/dashboard/sale", icon: ShoppingBag },
  { title: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { title: "Inventory", href: "/dashboard/inventory", icon: Boxes },
  { title: "Product Check", href: "/dashboard/product/check", icon: ScanLine },
  { title: "Receipts", href: "/dashboard/receipt-settings", icon: ReceiptText },
  { title: "Staff", href: "/dashboard/staff", icon: UsersRound },
  { title: "Tasks", href: "/dashboard/tasks", icon: ClipboardCheck },
  { title: "Analytics", href: "/dashboard/sales-analytics", icon: ChartNoAxesCombined },
  { title: "Time card", href: "/timecard", icon: Clock3 },
];
const settingsItem: SidebarItem = {
  title: "Settings", href: "/dashboard/settings", icon: Settings2,
};

export function DashboardSidebar({ open, collapsed, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  // Only the most specific matching route is highlighted.
  const activeHref = [...sidebarItems, settingsItem]
    .filter(({ href }) => pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  function renderItem(item: SidebarItem) {
    const Icon = item.icon;
    const active = item.href === activeHref;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        title={collapsed ? item.title : undefined}
        aria-label={item.title}
        aria-current={active ? "page" : undefined}
        className={`group flex min-h-12 items-center gap-3 rounded-xl px-2.5 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${collapsed ? "lg:justify-center lg:px-0" : ""} ${active ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"}`}
      >
        <span className={`grid size-8 shrink-0 place-items-center rounded-lg border transition-colors duration-150 ${active ? "border-blue-200/70 bg-white text-blue-600 shadow-sm dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300" : "border-slate-200/70 bg-slate-100/70 text-slate-500 group-hover:border-slate-300 group-hover:bg-white group-hover:text-slate-800 dark:border-white/5 dark:bg-white/5 dark:text-slate-400 dark:group-hover:border-white/10 dark:group-hover:bg-white/10 dark:group-hover:text-slate-200"}`}>
          <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className={`min-w-0 flex-1 whitespace-nowrap ${collapsed ? "lg:hidden" : ""}`}>{item.title}</span>
        {active && <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-300 ${collapsed ? "lg:hidden" : ""}`} />}
      </Link>
    );
  }

  return (
    <>
      {open && <button type="button" aria-label="Close sidebar" onClick={onClose} className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden" />}
      <aside aria-label="Dashboard sidebar" className={`fixed bottom-4 left-4 top-[94px] z-[70] flex w-[270px] flex-col rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 transition-[width,transform] duration-300 ease-in-out motion-reduce:transition-none dark:border-white/10 dark:bg-slate-950 lg:z-40 lg:translate-x-0 ${collapsed ? "lg:w-[76px]" : "lg:w-[220px]"} ${open ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]"}`}>
        <div className={`flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-white/10 ${collapsed ? "lg:justify-center lg:px-2" : ""}`}>
          <Link href="/dashboard" onClick={onClose} aria-label="Binhlaig POS dashboard" className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-blue-500">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white shadow-sm dark:bg-blue-500/15 dark:text-blue-300"><Store size={21} strokeWidth={1.75} aria-hidden="true" /></span>
            <span className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
              <span className="block whitespace-nowrap text-sm font-bold text-slate-950 dark:text-white">Binhlaig POS</span>
              <span className="mt-0.5 block whitespace-nowrap text-[11px] text-slate-500 dark:text-slate-400">Shop Dashboard</span>
            </span>
          </Link>
          <button type="button" aria-label="Close sidebar" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 lg:hidden"><X size={19} aria-hidden="true" /></button>
        </div>
        <nav aria-label="Main menu" className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3">
          <p className={`mb-3 px-2.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 ${collapsed ? "lg:hidden" : ""}`}>Main menu</p>
          {sidebarItems.map(renderItem)}
        </nav>
        <div className="shrink-0 border-t border-slate-200 p-3 dark:border-white/10">
          {renderItem(settingsItem)}
          <div className={`mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-white/5 ${collapsed ? "lg:justify-center lg:p-2" : ""}`}>
            <span title={collapsed ? "Sai Aung" : undefined} className="grid size-9 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">SA</span>
            <div className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">Sai Aung</p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">Administrator</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
