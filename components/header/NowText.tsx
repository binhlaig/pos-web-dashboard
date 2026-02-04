// components/header/NowText.tsx
"use client";

import { useEffect, useState } from "react";

export default function NowText() {
  const [text, setText] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const date = new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(now);
      setText(`${date} • ${time}`);
    };

    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return <span className="text-xs text-muted-foreground">{text || "—"}</span>;
}
