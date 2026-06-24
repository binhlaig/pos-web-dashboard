"use client";

import { useState } from "react";
import { NAV_SECTIONS } from "@/lib/data/data";
import type { NavPage } from "@/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
}

const BADGE_COLORS: Record<string, string> = {
  red: "bg-red-600 text-white",
  amber: "bg-amber-600 text-white",
  green: "bg-green-700 text-white",
};

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col bg-[#1a1a18] transition-all duration-300 ease-in-out h-screen sticky top-0 flex-shrink-0",
        collapsed ? "w-[60px]" : "w-[210px]"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center border-b border-white/8 flex-shrink-0",
          collapsed ? "justify-center px-0 py-4" : "gap-3 px-4 py-4"
        )}
      >
        <div className="w-[30px] h-[30px] bg-[#b8922a] rounded-[7px] flex items-center justify-center text-[15px] flex-shrink-0">
          🛒
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-[13px] font-extrabold text-white leading-tight font-sans truncate">
              Mya Pann
            </div>
            <div className="text-[9px] text-white/35 mt-0.5 truncate">
              Supermarket · Branch A
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 scrollbar-none">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-3">
            {!collapsed && (
              <div className="px-2 pb-1.5 text-[8px] font-bold tracking-[0.12em] uppercase text-white/28">
                {section.label}
              </div>
            )}
            {collapsed && <div className="border-t border-white/8 my-2" />}

            {section.items.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "w-full flex items-center rounded-lg mb-0.5 transition-all duration-150 text-left",
                    collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-2.5 py-2",
                    isActive
                      ? "bg-[rgba(184,146,42,0.18)] border border-[rgba(184,146,42,0.25)]"
                      : "hover:bg-white/7 border border-transparent"
                  )}
                >
                  <span className="text-[14px] flex-shrink-0 leading-none">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span
                        className={cn(
                          "flex-1 text-[11px] font-medium truncate",
                          isActive ? "text-[#e8d5a0] font-semibold" : "text-white/62"
                        )}
                      >
                        {item.label}
                      </span>
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            "text-[9px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none",
                            BADGE_COLORS[item.badgeColor ?? "red"]
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && item.badge !== undefined && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-white/7 px-2 py-3 flex-shrink-0">
        <div
          className={cn(
            "flex items-center rounded-lg bg-white/5",
            collapsed ? "justify-center p-2" : "gap-2.5 px-2.5 py-2"
          )}
        >
          <div className="w-7 h-7 rounded-full bg-[#b8922a] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            KT
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-[11px] font-semibold text-white truncate">Ko Thet</div>
              <div className="text-[9px] text-white/35 truncate">Store Manager</div>
            </div>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/8",
            "text-white/35 hover:text-white/60 hover:bg-white/5 transition-colors py-1.5",
            collapsed ? "px-0" : "px-2"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="text-[11px] leading-none select-none">
            {collapsed ? "▶" : "◀"}
          </span>
          {!collapsed && (
            <span className="text-[9px] font-semibold tracking-wide uppercase">Collapse</span>
          )}
        </button>
      </div>
    </aside>
  );
}
