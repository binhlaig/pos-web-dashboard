"use client";

import { useEffect, useRef } from "react";
import { HOURLY_SALES, HOURLY_LABELS, CATEGORY_DATA } from "@/lib/data/data";

declare global {
  interface Window {
    Chart: any;
  }
}

export function SalesChart() {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!ref.current || typeof window === "undefined") return;
    if (!window.Chart) return;

    chartRef.current?.destroy();
    chartRef.current = new window.Chart(ref.current, {
      type: "bar",
      data: {
        labels: HOURLY_LABELS,
        datasets: [
          {
            label: "Sales (K MMK)",
            data: HOURLY_SALES,
            backgroundColor: HOURLY_SALES.map((v) =>
              v >= 130 ? "#b8922a" : v >= 80 ? "#d4a84a" : "#e8d090"
            ),
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c: any) => `${c.parsed.y}K MMK` } },
        },
        scales: {
          x: {
            ticks: { color: "#9c9b96", font: { size: 8 }, maxRotation: 0 },
            grid: { color: "rgba(0,0,0,0.04)" },
          },
          y: {
            ticks: { color: "#9c9b96", font: { size: 8 }, callback: (v: number) => `${v}K` },
            grid: { color: "rgba(0,0,0,0.06)" },
          },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, []);

  return (
    <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-black/8 flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#1a1a18]">Hourly Sales (MMK &apos;000)</span>
        <span className="text-[9px] text-[#9c9b96] bg-[#f0ede8] rounded-full px-2 py-0.5">Today</span>
      </div>
      <div className="p-3 relative h-[190px]">
        <canvas ref={ref} role="img" aria-label="Hourly sales bar chart for today">
          Hourly sales from 9 AM to 9 PM.
        </canvas>
      </div>
    </div>
  );
}

export function CategoryChart() {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!ref.current || typeof window === "undefined") return;
    if (!window.Chart) return;

    chartRef.current?.destroy();
    chartRef.current = new window.Chart(ref.current, {
      type: "doughnut",
      data: {
        labels: CATEGORY_DATA.labels,
        datasets: [
          {
            data: CATEGORY_DATA.values,
            backgroundColor: CATEGORY_DATA.colors,
            borderColor: "#fff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "60%",
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: "#5c5b56",
              font: { size: 8 },
              boxWidth: 8,
              padding: 5,
              generateLabels: (c: any) =>
                c.data.labels.map((l: string, i: number) => ({
                  text: `${l} ${c.data.datasets[0].data[i]}%`,
                  fillStyle: c.data.datasets[0].backgroundColor[i],
                  strokeStyle: "#fff",
                  hidden: false,
                  index: i,
                })),
            },
          },
        },
      },
    });
    return () => chartRef.current?.destroy();
  }, []);

  return (
    <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 border-b border-black/8">
        <span className="text-[11px] font-bold text-[#1a1a18]">Sales by Category</span>
      </div>
      <div className="p-3 relative h-[190px]">
        <canvas ref={ref} role="img" aria-label="Category sales doughnut chart">
          Category breakdown of sales.
        </canvas>
      </div>
    </div>
  );
}
