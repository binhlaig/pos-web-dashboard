
// // components/header/TimeCard.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// export default function TimeCard() {
//   const [time, setTime] = useState("");
//   const [date, setDate] = useState("");

//   useEffect(() => {
//     const tick = () => {
//       const now = new Date();
//       setTime(
//         now.toLocaleTimeString("en-US", {
//           hour: "2-digit",
//           minute: "2-digit",
//         })
//       );
//       setDate(new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(now));
//     };

//     tick();
//     const id = setInterval(tick, 30_000);
//     return () => clearInterval(id);
//   }, []);

//   return (
//     <Card className="shadow-sm">
//       <CardHeader className="pb-2">
//         <CardTitle className="text-sm font-medium text-muted-foreground">
//           Time
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="pt-0">
//         <div className="text-3xl font-bold">{time || "—"}</div>
//         <p className="mt-2 text-sm text-muted-foreground">{date || "—"}</p>
//       </CardContent>
//     </Card>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export default function TimeCard() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();

      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );

      setDate(
        new Intl.DateTimeFormat("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }).format(now)
      );
    };

    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="inline-flex items-center gap-3 rounded-xl bg-white/15 backdrop-blur-md px-4 py-2 text-white shadow-md">
      <Clock className="size-5 opacity-80" />

      <div className="leading-tight">
        <div className="text-lg font-semibold tracking-tight">
          {time || "—"}
        </div>
        <div className="text-xs opacity-80">
          {date || "—"}
        </div>
      </div>
    </div>
  );
}
