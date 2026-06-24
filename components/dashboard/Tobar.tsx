"use client";

import { useEffect, useState } from "react";
import type { NavPage } from "@/types";

interface TopbarProps {
  activePage: NavPage;
}

const PAGE_TITLES: Record<NavPage, string> = {
  dashboard: "Dashboard",
  tasks: "Tasks",
  stock: "Inventory",
  pos: "POS / Sales",
  customers: "Customers",
  staff: "Staff & Shifts",
  delivery: "Deliveries",
  promotions: "Promotions",
  expiry: "Expiry Watch",
  reports: "Reports",
  settings: "Settings",
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function Topbar({ activePage }: TopbarProps) {
  const [time, setTime] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
      const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      setDateStr(`${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-[50px] bg-white border-b border-black/8 flex items-center justify-between px-5 flex-shrink-0">
      <div className="flex items-center gap-2.5">
        <span className="w-[6px] h-[6px] rounded-full bg-green-400 animate-pulse flex-shrink-0" />
        <h1 className="text-[15px] font-extrabold text-[#1a1a18] tracking-tight">
          {PAGE_TITLES[activePage]}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-[#9c9b96]">{dateStr}</span>
        <div className="w-px h-4 bg-black/8" />
        <span className="text-[12px] font-semibold text-[#5c5b56] tabular-nums">{time}</span>
      </div>
    </header>
  );
}
