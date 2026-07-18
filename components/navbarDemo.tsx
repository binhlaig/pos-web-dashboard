"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Menu as MenuIcon,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import {
  HoveredLink,
  Menu,
  MenuItem,
  ProductItem,
} from "./ui/navbar-menu";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import { DashboardColorPicker } from "@/app/dashboard/dashboard-color-picker";
import { NavbarUserProfile } from "./dashboard/navbar-user-profile";

type NavbarDemoProps = {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenSidebar: () => void;
};

export function NavbarDemo({
  sidebarCollapsed,
  onToggleSidebar,
  onOpenSidebar,
}: NavbarDemoProps) {
  return (
    <Navbar
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={onToggleSidebar}
      onOpenSidebar={onOpenSidebar}
    />
  );
}

type NavbarProps = NavbarDemoProps & {
  className?: string;
};

function Navbar({
  className,
  sidebarCollapsed,
  onToggleSidebar,
  onOpenSidebar,
}: NavbarProps) {
  const [active, setActive] =
    useState<string | null>(null);

  return (
    <div
      className={cn(
        "fixed inset-x-4 top-4 z-50",
        className,
      )}
    >
      <Menu setActive={setActive}>
        {/* Left section */}
        <div className="flex shrink-0 items-center gap-3">
          {/* Mobile Sidebar button */}
          <button
            type="button"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
            className="
              flex h-9 w-9 items-center justify-center
              rounded-xl border border-slate-200
              bg-slate-50 text-slate-600
              transition-all duration-200
              hover:border-blue-200
              hover:bg-blue-50
              hover:text-blue-600
              active:scale-95
              dark:border-white/10
              dark:bg-white/[0.08]
              dark:text-slate-300
              dark:hover:border-blue-500/30
              dark:hover:bg-blue-500/10
              dark:hover:text-blue-400
              lg:hidden
            "
          >
            <MenuIcon size={18} />
          </button>

          {/* Desktop sidebar toggle */}
          <div className="group relative hidden lg:block">
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label={
                sidebarCollapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
              className="
                flex h-9 w-9 items-center justify-center
                rounded-xl border border-slate-200
                bg-slate-50 text-slate-600
                transition-all duration-200
                hover:border-blue-200
                hover:bg-blue-50
                hover:text-blue-600
                active:scale-95
                dark:border-white/10
                dark:bg-white/[0.08]
                dark:text-slate-300
                dark:hover:border-blue-500/30
                dark:hover:bg-blue-500/10
                dark:hover:text-blue-400
              "
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </button>

            <div
              className="
                pointer-events-none absolute
                left-0 top-[calc(100%+10px)]
                z-[70] whitespace-nowrap
                rounded-lg bg-slate-950
                px-3 py-2 text-xs
                font-medium text-white
                opacity-0 shadow-xl
                transition-opacity duration-200
                group-hover:opacity-100
                dark:bg-white dark:text-black
              "
            >
              {sidebarCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"}
            </div>
          </div>

          <div className="hidden h-8 w-px bg-slate-200 dark:bg-white/10 sm:block" />

          <div>
            <h1 className="whitespace-nowrap text-sm font-bold text-slate-950 dark:text-white">
              POS Dashboard
            </h1>

            <p className="hidden whitespace-nowrap text-[11px] text-slate-500 dark:text-slate-400 sm:block">
              Manage your shop
            </p>
          </div>
        </div>

        {/* Center navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          <MenuItem
            setActive={setActive}
            active={active}
            item="Services"
          >
            <div className="flex min-w-[220px] flex-col space-y-4 text-sm">
              <HoveredLink href="/dashboard/pos">
                Open POS
              </HoveredLink>

              <HoveredLink href="/dashboard/staff">
                Staff Management
              </HoveredLink>

              <HoveredLink href="/dashboard/tasks">
                Task Management
              </HoveredLink>

              <HoveredLink href="/dashboard/settings">
                Shop Settings
              </HoveredLink>
            </div>
          </MenuItem>

          <MenuItem
            setActive={setActive}
            active={active}
            item="Products"
          >
            <div className="grid grid-cols-2 gap-4 p-2 text-sm">
              <ProductItem
                title="Products"
                href="/dashboard/products"
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80"
                description="Create and manage shop products."
              />

              <ProductItem
                title="Inventory"
                href="/dashboard/inventory"
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80"
                description="Check stock and inventory levels."
              />

              <ProductItem
                title="Receipts"
                href="/dashboard/receipts"
                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=300&q=80"
                description="View sales and receipt history."
              />

              <ProductItem
                title="Analytics"
                href="/dashboard/analytics"
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80"
                description="View sales performance."
              />
            </div>
          </MenuItem>

          <MenuItem
            setActive={setActive}
            active={active}
            item="Reports"
          >
            <div className="flex min-w-[200px] flex-col space-y-4 text-sm">
              <HoveredLink href="/dashboard/analytics">
                Sales Analytics
              </HoveredLink>

              <HoveredLink href="/dashboard/receipts">
                Receipt History
              </HoveredLink>

              <HoveredLink href="/dashboard/inventory">
                Inventory Report
              </HoveredLink>

              <HoveredLink href="/dashboard/staff">
                Staff Report
              </HoveredLink>
            </div>
          </MenuItem>
        </div>

        {/* Right section */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Whole dashboard color */}
          <DashboardColorPicker />

          {/* Light/Dark mode */}
          <ThemeToggle />

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="
              relative hidden h-9 w-9
              items-center justify-center
              rounded-xl text-slate-600
              transition hover:bg-slate-100
              dark:text-slate-300
              dark:hover:bg-white/10
              sm:flex
            "
          >
            <Bell size={18} />

            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-black" />
          </button>

          <div className="hidden h-8 w-px bg-slate-200 dark:bg-white/10 md:block" />

          {/* Profile */}

          <NavbarUserProfile/>
         
        </div>
      </Menu>
    </div>
  );
}