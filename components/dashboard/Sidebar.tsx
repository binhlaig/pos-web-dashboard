
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  ShoppingCart,
  Store,
  Users,
  X,
} from "lucide-react";

type DashboardSidebarProps = {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
};

type SidebarItem = {
  title: string;
  href: string;
  icon: React.ElementType;
};

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Open POS",
    href: "/dashboard/pos",
    icon: ShoppingCart,
  },
  {
    title: "Products",
    href: "/dashboard/product",
    icon: Package,
  },
  {
    title: "Inventory",
    href: "/dashboard/inventory",
    icon: Boxes,
  },
  {
    title: "Receipts",
    href: "/dashboard/receipt-settings",
    icon: ReceiptText,
  },
  {
    title: "Staff",
    href: "/dashboard/staff",
    icon: Users,
  },
  {
    title: "Tasks",
    href: "/dashboard/tasks",
    icon: ClipboardList,
  },
  {
    title: "Analytics",
    href: "/dashboard/sales-analytics",
    icon: BarChart3,
  },
];

export function DashboardSidebar({
  open,
  collapsed,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const checkIsActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile background overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* <aside
        className={`
          fixed bottom-4 left-4  top-[94px] z-40
          flex w-[270px] flex-col
          rounded-2xl
          border border-black/[0.1]
          bg-white shadow-xl
          transition-[width,transform] duration-300 ease-in-out
          dark:border-white/[0.12] dark:bg-black
          lg:translate-x-0
          ${collapsed ? "lg:w-[76px]" : "lg:w-[220px]"}
          ${
            open
              ? "translate-x-0"
              : "-translate-x-[calc(100%+2rem)]"
          }
        `}
      > */}



      <aside
        className={`
    fixed bottom-4 left-4 top-[94px] z-[70] lg:z-40
    flex w-[270px] flex-col
    rounded-2xl
    border border-black/[0.1]
    bg-white shadow-xl
    transition-[width,transform] duration-300 ease-in-out
   dark:border-white/10 dark:bg-slate-950
    lg:translate-x-0
    ${collapsed ? "lg:w-[76px]" : "lg:w-[220px]"}
    ${open
            ? "translate-x-0"
            : "-translate-x-[calc(100%+2rem)]"
          }
  `}
      >
        {/* Sidebar header */}
        <div
          className={`
            flex h-16 shrink-0 items-center
            border-b border-slate-200
            dark:border-white/10
            ${collapsed
              ? "justify-between px-4 lg:justify-center lg:px-2"
              : "justify-between px-4"
            }
          `}
        >
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex min-w-0 items-center gap-3"
          >
            {/* Brand icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <Store size={20} />
            </div>

            {/* Brand name */}
            <div
              className={`
                min-w-0 overflow-hidden
                transition-all duration-300
                ${collapsed ? "lg:hidden" : "block"}
              `}
            >
              <h1 className="whitespace-nowrap text-sm font-bold text-slate-950 dark:text-white">
                Binhlaig POS
              </h1>

              <p className="mt-0.5 whitespace-nowrap text-[11px] text-slate-500 dark:text-slate-400">
                Shop Dashboard
              </p>
            </div>
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="
              flex h-9 w-9 shrink-0 items-center justify-center
              rounded-lg text-slate-500
              transition hover:bg-slate-100
              dark:text-slate-300 dark:hover:bg-white/10
              lg:hidden
            "
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3">
          <p
            className={`
              mb-3 px-3 pt-2
              text-[10px] font-semibold uppercase
              tracking-[0.16em] text-slate-400
              ${collapsed ? "lg:hidden" : "block"}
            `}
          >
            Main menu
          </p>

          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = checkIsActive(item.href);

            return (
              <div
                key={item.href}
                className="group relative"
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  title={collapsed ? item.title : undefined}
                  aria-label={item.title}
                  className={`
                    flex h-11 items-center rounded-xl
                    text-sm font-medium
                    transition-all duration-200
                    ${collapsed
                      ? "gap-3 px-3 lg:justify-center lg:px-0"
                      : "gap-3 px-3"
                    }
                    ${isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                    }
                  `}
                >
                  <Icon
                    size={19}
                    className="shrink-0"
                  />

                  <span
                    className={`
                      whitespace-nowrap
                      ${collapsed ? "lg:hidden" : "block"}
                    `}
                  >
                    {item.title}
                  </span>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Sidebar bottom */}
        <div className="shrink-0 border-t border-slate-200 p-3 dark:border-white/10">
          {/* Settings */}
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            title={collapsed ? "Settings" : undefined}
            aria-label="Settings"
            className={`
              flex h-11 items-center rounded-xl
              text-sm font-medium
              transition-all duration-200
              ${collapsed
                ? "gap-3 px-3 lg:justify-center lg:px-0"
                : "gap-3 px-3"
              }
              ${pathname.startsWith("/dashboard/settings")
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              }
            `}
          >
            <Settings
              size={19}
              className="shrink-0"
            />

            <span
              className={`
                whitespace-nowrap
                ${collapsed ? "lg:hidden" : "block"}
              `}
            >
              Settings
            </span>
          </Link>

          {/* User profile */}
          <div
            className={`
              mt-3 flex items-center rounded-xl
              bg-slate-100
              transition-all duration-300
              dark:bg-white/[0.06]
              ${collapsed
                ? "gap-3 p-3 lg:justify-center lg:p-2"
                : "gap-3 p-3"
              }
            `}
          >
            <div
              title={collapsed ? "Sai Aung" : undefined}
              className="
                flex h-9 w-9 shrink-0 items-center justify-center
                rounded-full bg-slate-900
                text-xs font-bold text-white
                dark:bg-white dark:text-black
              "
            >
              SA
            </div>

            <div
              className={`
                min-w-0 overflow-hidden
                ${collapsed ? "lg:hidden" : "block"}
              `}
            >
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                Sai Aung
              </p>

              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}