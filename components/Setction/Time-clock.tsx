
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils"; // Shadcn utility function (optional)
import TimeClock from "./clock";

export default function Time_Clock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  // Auto update every second
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDate(
        new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(now)
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="flex size-full flex-col gap-5 text-white">
    <div className="h-[303px] w-full rounded-[20px] bg-hero bg-cover">
      <div className="flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11">
        <TimeClock/>
        
      </div>
    </div>
    
  </section>
  );
}
