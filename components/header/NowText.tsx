"use client";
// components/header/NowText.tsx
import { shopDateFormatter, formatShopTime, getShopTimezone } from "@/lib/date-time";
import { useShopTimezone } from "@/components/shop-timezone-provider";


import { useEffect, useState } from "react";

export default function NowText() {
  const shopTimezone = useShopTimezone();
  const [text, setText] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const time = formatShopTime(now, getShopTimezone(), {
        hour: "2-digit",
        minute: "2-digit",
      }, "en-US");
      const date = shopDateFormatter("en-US", { dateStyle: "full" }).format(now);
      setText(`${date} • ${time}`);
    };

    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [shopTimezone]);

  return <span className="text-xs text-muted-foreground">{text || "—"}</span>;
}
