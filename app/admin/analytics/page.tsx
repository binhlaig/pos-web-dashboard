


// "use client";

// import * as React from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import CountUp from "react-countup";
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   BarChart,
//   Bar,
//   Cell,
//   PieChart,
//   Pie,
//   LineChart as ReLineChart,
//   Line,
// } from "recharts";
// import type { TooltipProps } from "recharts";
// import {
//   TrendingUp,
//   TrendingDown,
//   Store,
//   Filter,
//   Search,
//   Download,
//   ArrowUpRight,
//   ArrowDownRight,
//   MoreHorizontal,
//   DollarSign,
//   ShoppingBag,
//   Package,
//   Activity,
//   Users,
//   Zap,
//   Sparkles,
//   RefreshCw,
//   ChevronRight,
//   Clock,
//   Star,
//   MoonStar,
//   SunMedium,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

// /* ─── DATA ───────────────────────────────────────────────────────────────────── */

// const salesTrend = [
//   { day: "Mon", sales: 1200, prev: 980, target: 1500 },
//   { day: "Tue", sales: 2100, prev: 1750, target: 2000 },
//   { day: "Wed", sales: 1800, prev: 2000, target: 2200 },
//   { day: "Thu", sales: 2600, prev: 2100, target: 2400 },
//   { day: "Fri", sales: 3200, prev: 2800, target: 3000 },
//   { day: "Sat", sales: 4100, prev: 3400, target: 3800 },
//   { day: "Sun", sales: 3800, prev: 3100, target: 3500 },
// ];

// const branchData = [
//   { name: "Main", value: 4200, target: 4000, pct: 105, color: "#60a5fa" },
//   { name: "Branch A", value: 3100, target: 3500, pct: 89, color: "#a78bfa" },
//   { name: "Branch B", value: 2400, target: 2000, pct: 120, color: "#34d399" },
//   { name: "Online", value: 1800, target: 2200, pct: 82, color: "#fb923c" },
// ];

// const hourlyFlow = [
//   { h: "8", v: 320 },
//   { h: "9", v: 580 },
//   { h: "10", v: 840 },
//   { h: "11", v: 1100 },
//   { h: "12", v: 1620 },
//   { h: "13", v: 1380 },
//   { h: "14", v: 980 },
//   { h: "15", v: 1240 },
//   { h: "16", v: 1560 },
//   { h: "17", v: 1890 },
//   { h: "18", v: 2100 },
//   { h: "19", v: 1760 },
//   { h: "20", v: 1340 },
//   { h: "21", v: 920 },
//   { h: "22", v: 640 },
// ];

// const categoryMix = [
//   { name: "Food", value: 38, color: "#60a5fa" },
//   { name: "Drinks", value: 24, color: "#a78bfa" },
//   { name: "Snacks", value: 18, color: "#34d399" },
//   { name: "Household", value: 12, color: "#fb923c" },
//   { name: "Other", value: 8, color: "#fb7185" },
// ];

// const topProducts = [
//   { rank: 1, name: "Premium Rice 5kg", sales: 482, revenue: 2314400, trend: "up" },
//   { rank: 2, name: "Cooking Oil 2L", sales: 341, revenue: 749800, trend: "up" },
//   { rank: 3, name: "Green Tea Pack", sales: 298, revenue: 447000, trend: "down" },
//   { rank: 4, name: "Instant Noodles x12", sales: 276, revenue: 331200, trend: "up" },
//   { rank: 5, name: "Laundry Powder 1kg", sales: 204, revenue: 428400, trend: "down" },
// ];

// const recentTx = [
//   { id: "TXN-8821", customer: "Aung Kyaw", product: "Rice Bag 5kg", amount: 4800, branch: "Main", status: "completed", time: "2m" },
//   { id: "TXN-8820", customer: "Ma Thida", product: "Cooking Oil", amount: 2200, branch: "Branch A", status: "completed", time: "7m" },
//   { id: "TXN-8819", customer: "Ko Zin", product: "Mixed Snacks", amount: 1450, branch: "Online", status: "pending", time: "12m" },
//   { id: "TXN-8818", customer: "Aye Aye", product: "Beverages x6", amount: 3600, branch: "Branch B", status: "completed", time: "18m" },
//   { id: "TXN-8817", customer: "Htet Naing", product: "Household Kit", amount: 8900, branch: "Main", status: "refunded", time: "31m" },
// ];

// /* ─── THEME ──────────────────────────────────────────────────────────────────── */

// type Theme = "dark" | "light";

// function FontImport() {
//   return (
//     <style>{`
//       @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;700;900&display=swap');
//       * { font-family: 'DM Sans', sans-serif; }
//       .serif { font-family: 'DM Serif Display', serif !important; }

//       @keyframes lantern-float {
//         0%,100% { transform: translateY(0px); }
//         50% { transform: translateY(-6px); }
//       }
//       @keyframes lantern-breathe {
//         0%,100% { opacity:.72; transform: scale(1); }
//         50% { opacity:1; transform: scale(1.05); }
//       }
//       @keyframes ember-rise {
//         0%   { transform: translateY(0px) translateX(0px) scale(1); opacity:.55; }
//         50%  { transform: translateY(-16px) translateX(4px) scale(1.12); opacity:.9; }
//         100% { transform: translateY(-32px) translateX(-2px) scale(.6); opacity:0; }
//       }
//     `}</style>
//   );
// }

// const tk = (theme: Theme) =>
//   theme === "dark"
//     ? {
//         root: "bg-[#05060d] text-[#f3e7d2]",
//         text: "text-[#f3e7d2]",
//         textMuted: "text-[#bca98f]",
//         textSubtle: "text-[#8a7a65]",
//         card: "border-[rgba(200,137,42,0.16)] bg-[rgba(14,10,6,0.84)] backdrop-blur-xl",
//         cardHover: "hover:border-[rgba(212,163,82,0.30)] hover:bg-[rgba(255,255,255,0.05)]",
//         cardSolid: "border-[rgba(200,137,42,0.16)] bg-[rgba(8,6,2,0.92)]",
//         input:
//           "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#f3e7d2] placeholder:text-[#8a7a65] focus-visible:border-[#c8892a]",
//         btn: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#d4b68a] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f3e7d2]",
//         btnPrimary: "bg-gradient-to-r from-[#a07020] to-[#d4a352] text-[#140d05] hover:from-[#b37a22] hover:to-[#deb25a] shadow-lg shadow-[#c8892a]/20",
//         divider: "bg-[rgba(255,255,255,0.08)]",
//         pill: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#bca98f]",
//         tableHead: "text-[#8a7a65]",
//         tableRow: "border-[rgba(255,255,255,0.045)] hover:bg-[rgba(255,255,255,0.04)]",
//         segmented: "bg-[rgba(255,255,255,0.045)] border-[rgba(255,255,255,0.07)]",
//         segActive: "bg-[rgba(255,255,255,0.14)] text-[#f3e7d2]",
//         segInactive: "text-[#8a7a65] hover:text-[#d4b68a]",
//         grid: "[background-image:linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] [background-size:44px_44px]",
//         cGrid: "rgba(255,255,255,0.055)",
//         cAxis: "rgba(188,169,143,0.75)",
//         ttBg: "bg-[#0a0e1a]/98 border-[rgba(255,255,255,0.08)] text-white",
//         glow1: "bg-amber-700/[0.16]",
//         glow2: "bg-orange-700/[0.10]",
//         glow3: "bg-yellow-700/[0.08]",
//         rankChip: "bg-[rgba(255,255,255,0.06)] text-[#8a7a65]",
//         track: "bg-[rgba(255,255,255,0.06)]",
//         infoRow: "bg-[rgba(255,255,255,0.03)]",
//       }
//     : {
//         root: "bg-[#edf1f9] text-slate-900",
//         text: "text-slate-900",
//         textMuted: "text-slate-500",
//         textSubtle: "text-slate-400",
//         card: "border-slate-200/80 bg-white/95 shadow-[0_2px_20px_rgba(15,23,42,0.06)] backdrop-blur-xl",
//         cardHover: "hover:border-slate-300 hover:shadow-[0_6px_28px_rgba(15,23,42,0.10)]",
//         cardSolid: "border-slate-200 bg-white shadow-sm",
//         input:
//           "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-blue-500",
//         btn: "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 shadow-sm",
//         btnPrimary: "bg-slate-900 text-white hover:bg-slate-800 shadow-md",
//         divider: "bg-slate-200",
//         pill: "border-slate-200 bg-white text-slate-500 shadow-sm",
//         tableHead: "text-slate-400",
//         tableRow: "border-slate-100 hover:bg-slate-50/70",
//         segmented: "bg-slate-100/80 border-slate-200",
//         segActive: "bg-white text-slate-900 shadow-sm",
//         segInactive: "text-slate-500 hover:text-slate-700",
//         grid: "[background-image:linear-gradient(rgba(15,23,42,0.038)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.038)_1px,transparent_1px)] [background-size:44px_44px]",
//         cGrid: "rgba(15,23,42,0.07)",
//         cAxis: "rgba(71,85,105,0.8)",
//         ttBg: "bg-white border-slate-200 text-slate-900 shadow-[0_8px_32px_rgba(15,23,42,0.12)]",
//         glow1: "bg-sky-300/20",
//         glow2: "bg-indigo-300/15",
//         glow3: "bg-cyan-300/15",
//         rankChip: "bg-slate-100 text-slate-500",
//         track: "bg-slate-100",
//         infoRow: "bg-slate-50",
//       };

// const RANGES = ["24h", "7d", "30d", "90d"];

// /* ─── HELPERS ───────────────────────────────────────────────────────────────── */

// function glowHex(hex: string, alpha = "22") {
//   return `${hex}${alpha}`;
// }

// function LanternMark({ size = 34, glow = false }: { size?: number; glow?: boolean }) {
//   const h = size * 1.5;
//   return (
//     <svg width={size} height={h} viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <defs>
//         <radialGradient id="analyticsLanternGlow" cx="50%" cy="48%" r="50%">
//           <stop offset="0%" stopColor="#fff7d6" stopOpacity="0.96" />
//           <stop offset="28%" stopColor="#fbbf24" stopOpacity="0.86" />
//           <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.44" />
//           <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
//         </radialGradient>
//         <linearGradient id="analyticsLanternMetal" x1="8" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
//           <stop offset="0%" stopColor="#c58a3c" />
//           <stop offset="50%" stopColor="#a96b28" />
//           <stop offset="100%" stopColor="#8a551d" />
//         </linearGradient>
//       </defs>

//       <line x1="16" y1="0" x2="16" y2="6" stroke={glow ? "#d6ae67" : "#9d6a2b"} strokeWidth="1.5" strokeLinecap="round" />
//       <rect x="8" y="6" width="16" height="5" rx="2" fill="url(#analyticsLanternMetal)" stroke="#7b4a18" strokeWidth="0.8" />
//       <rect x="6" y="11" width="20" height="26" rx="3" fill={glow ? "#0e0908" : "#f7edd9"} stroke="#a66b27" strokeWidth="1" />
//       {glow && <rect x="6" y="11" width="20" height="26" rx="3" fill="url(#analyticsLanternGlow)" />}
//       {[11, 16, 21].map((x) => (
//         <line key={x} x1={x} y1="11" x2={x} y2="37" stroke={glow ? "#6b3e10" : "#b47b34"} strokeWidth="1" opacity="0.95" />
//       ))}
//       {glow && (
//         <>
//           <motion.ellipse
//             cx="16" cy="26" rx="4" ry="6" fill="#f59e0b" opacity="0.68"
//             animate={{ ry: [6, 7.1, 5.3, 6.7, 6], cx: [16, 15.7, 16.3, 15.9, 16] }}
//             transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
//           />
//           <motion.ellipse
//             cx="16" cy="27" rx="2.5" ry="4.2" fill="#fde68a"
//             animate={{ ry: [4.2, 5, 3.6, 4.5, 4.2] }}
//             transition={{ duration: 0.95, repeat: Infinity, ease: "easeInOut" }}
//           />
//         </>
//       )}
//       <rect x="8" y="37" width="16" height="5" rx="2" fill="url(#analyticsLanternMetal)" stroke="#7b4a18" strokeWidth="0.8" />
//       <line x1="16" y1="42" x2="16" y2="47" stroke="#8f5b24" strokeWidth="1.5" strokeLinecap="round" />
//       <circle cx="16" cy="47" r="1.5" fill="#8f5b24" />
//     </svg>
//   );
// }

// function LanternToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
//   return (
//     <motion.button
//       type="button"
//       onClick={onToggle}
//       whileHover={{ y: -2, scale: 1.04 }}
//       whileTap={{ scale: 0.94 }}
//       className="relative flex flex-col items-center focus:outline-none"
//       style={{ width: 58 }}
//       aria-label={dark ? "Switch to day mode" : "Switch to night mode"}
//     >
//       {dark && (
//         <div
//           className="pointer-events-none absolute"
//           style={{
//             width: 76,
//             height: 76,
//             top: -6,
//             left: "50%",
//             transform: "translateX(-50%)",
//             borderRadius: "50%",
//             background:
//               "radial-gradient(ellipse at center, rgba(251,191,36,0.52) 0%, rgba(245,158,11,0.18) 52%, transparent 76%)",
//             filter: "blur(9px)",
//             animation: "lantern-breathe 2.8s ease-in-out infinite",
//           }}
//         />
//       )}

//       <div style={{ animation: "lantern-float 3s ease-in-out infinite" }}>
//         <LanternMark size={34} glow={dark} />
//       </div>

//       <span
//         style={{
//           marginTop: 5,
//           fontSize: 7,
//           fontWeight: 700,
//           letterSpacing: "0.2em",
//           color: dark ? "#c8892a" : "#9a6c2a",
//         }}
//       >
//         {dark ? "NIGHT" : "DAY"}
//       </span>
//     </motion.button>
//   );
// }

// function NightParticles() {
//   const particles = Array.from({ length: 28 }).map((_, i) => ({
//     id: i,
//     left: `${(i * 31 + 9) % 100}%`,
//     top: `${(i * 43 + 11) % 100}%`,
//     size: 1.5 + (i % 3),
//     delay: (i * 0.25) % 4,
//     duration: 2.8 + (i % 4) * 0.8,
//   }));

//   const embers = Array.from({ length: 10 }).map((_, i) => ({
//     id: i,
//     left: `${38 + (i % 5) * 5 - 10}%`,
//     delay: i * 0.4,
//     size: 3 + (i % 3),
//     dur: 3.5 + (i % 4) * 0.5,
//   }));

//   return (
//     <div className="pointer-events-none fixed inset-0 overflow-hidden">
//       {particles.map((p) => (
//         <motion.div
//           key={p.id}
//           className="absolute rounded-full bg-amber-100"
//           style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
//           animate={{ opacity: [0.08, 0.9, 0.08], scale: [0.7, 1.4, 0.7] }}
//           transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
//         />
//       ))}

//       {embers.map((e) => (
//         <div
//           key={e.id}
//           style={{
//             position: "absolute",
//             bottom: "56%",
//             left: e.left,
//             width: e.size,
//             height: e.size,
//             borderRadius: "50%",
//             background: "radial-gradient(circle, #ffe080 0%, #ff8820 60%, transparent 100%)",
//             boxShadow: "0 0 6px 2px rgba(255,160,40,0.6)",
//             animation: `ember-rise ${e.dur}s ${e.delay}s ease-out infinite`,
//             opacity: 0,
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// /* ─── TOOLTIP ───────────────────────────────────────────────────────────────── */

// function ChartTip({
//   active,
//   payload,
//   label,
//   theme,
//   accent = "#60a5fa",
// }: TooltipProps<number, string> & { theme: Theme; accent?: string }) {
//   const t = tk(theme);
//   if (!active || !payload?.length) return null;

//   return (
//     <div
//       className={cn("rounded-2xl border px-4 py-3 min-w-[170px] shadow-2xl backdrop-blur-xl", t.ttBg)}
//       style={{
//         borderColor: accent,
//         boxShadow: `0 12px 35px ${glowHex(accent, "20")}`,
//       }}
//     >
//       <div className={cn("text-[10px] font-bold uppercase tracking-widest mb-2.5", t.textSubtle)}>
//         {label}
//       </div>
//       {payload.map((p, i) => (
//         <div key={i} className="flex items-center justify-between gap-5 text-[13px]">
//           <span className="flex items-center gap-1.5">
//             <span className="h-2 w-2 rounded-full inline-block" style={{ background: String(p.color ?? accent) }} />
//             <span className={t.textMuted}>{p.name}</span>
//           </span>
//           <span className={cn("font-bold", t.text)}>
//             ¥{Number(p.value ?? 0).toLocaleString()}
//           </span>
//         </div>
//       ))}
//     </div>
//   );
// }

// /* ─── CARD SHELL ────────────────────────────────────────────────────────────── */

// function Card({
//   children,
//   className,
//   theme,
// }: {
//   children: React.ReactNode;
//   className?: string;
//   theme: Theme;
// }) {
//   const t = tk(theme);
//   return (
//     <div
//       className={cn(
//         "rounded-[22px] border transition-all duration-200",
//         t.card,
//         t.cardHover,
//         className
//       )}
//     >
//       {children}
//     </div>
//   );
// }

// /* ─── POLISHED CHARTS ───────────────────────────────────────────────────────── */

// function GlowAreaChartCard({
//   theme,
//   data,
//   xKey,
//   yKey,
//   name,
//   accent,
//   compareKey,
//   compareName,
//   height = 280,
// }: {
//   theme: Theme;
//   data: Record<string, any>[];
//   xKey: string;
//   yKey: string;
//   name: string;
//   accent: string;
//   compareKey?: string;
//   compareName?: string;
//   height?: number;
// }) {
//   const t = tk(theme);
//   const gid = `ga-${accent.replace(/[^a-zA-Z0-9]/g, "")}`;
//   const filterId = `gf-${accent.replace(/[^a-zA-Z0-9]/g, "")}`;

//   return (
//     <div
//       className="relative rounded-[20px] overflow-hidden border px-2 pt-2"
//       style={{
//         borderColor: glowHex(accent, "55"),
//         boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 14px 40px ${glowHex(accent, "14")}`,
//       }}
//     >
//       <div
//         className="pointer-events-none absolute inset-x-0 top-0 h-24"
//         style={{ background: `linear-gradient(180deg, ${glowHex(accent, "1f")} 0%, transparent 100%)` }}
//       />
//       <div
//         className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl"
//         style={{ background: glowHex(accent, "20") }}
//       />

//       <div style={{ height }}>
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
//             <defs>
//               <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="0%" stopColor={accent} stopOpacity={0.46} />
//                 <stop offset="45%" stopColor={accent} stopOpacity={0.18} />
//                 <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
//               </linearGradient>
//               <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
//                 <feGaussianBlur stdDeviation="4" result="blur" />
//                 <feMerge>
//                   <feMergeNode in="blur" />
//                   <feMergeNode in="SourceGraphic" />
//                 </feMerge>
//               </filter>
//             </defs>

//             <CartesianGrid stroke={t.cGrid} vertical={false} strokeDasharray="3 5" />
//             <XAxis
//               dataKey={xKey}
//               tick={{ fill: t.cAxis, fontSize: 11, fontWeight: 600 }}
//               axisLine={false}
//               tickLine={false}
//             />
//             <YAxis
//               tick={{ fill: t.cAxis, fontSize: 11, fontWeight: 600 }}
//               axisLine={false}
//               tickLine={false}
//             />
//             <Tooltip content={<ChartTip theme={theme} accent={accent} />} />

//             {compareKey ? (
//               <Area
//                 type="monotone"
//                 dataKey={compareKey}
//                 name={compareName ?? compareKey}
//                 stroke={theme === "dark" ? "rgba(255,255,255,0.20)" : "rgba(15,23,42,0.22)"}
//                 fill={theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)"}
//                 strokeWidth={1.5}
//                 dot={false}
//                 strokeDasharray="4 3"
//               />
//             ) : null}

//             <Area
//               type="monotone"
//               dataKey={yKey}
//               name={name}
//               stroke={accent}
//               fill={`url(#${gid})`}
//               strokeWidth={3}
//               filter={`url(#${filterId})`}
//               dot={{ r: 0 }}
//               activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2, fill: accent }}
//               animationDuration={700}
//               animationEasing="ease-out"
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }

// function GlowBarChartCard({
//   theme,
//   data,
//   xKey,
//   yKey,
//   name,
//   accent,
//   height = 280,
// }: {
//   theme: Theme;
//   data: Record<string, any>[];
//   xKey: string;
//   yKey: string;
//   name: string;
//   accent: string;
//   height?: number;
// }) {
//   const t = tk(theme);
//   const max = Math.max(...data.map((d) => Number(d[yKey] ?? 0)), 1);

//   return (
//     <div
//       className="relative rounded-[20px] overflow-hidden border px-2 pt-2"
//       style={{
//         borderColor: glowHex(accent, "55"),
//         boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 14px 40px ${glowHex(accent, "14")}`,
//       }}
//     >
//       <div
//         className="pointer-events-none absolute inset-x-0 top-0 h-24"
//         style={{ background: `linear-gradient(180deg, ${glowHex(accent, "16")} 0%, transparent 100%)` }}
//       />

//       <div style={{ height }}>
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }} barSize={14}>
//             <CartesianGrid stroke={t.cGrid} vertical={false} strokeDasharray="3 5" />
//             <XAxis
//               dataKey={xKey}
//               tick={{ fill: t.cAxis, fontSize: 10, fontWeight: 600 }}
//               axisLine={false}
//               tickLine={false}
//             />
//             <YAxis
//               tick={{ fill: t.cAxis, fontSize: 10, fontWeight: 600 }}
//               axisLine={false}
//               tickLine={false}
//             />
//             <Tooltip content={<ChartTip theme={theme} accent={accent} />} cursor={{ fill: glowHex(accent, "12") }} />
//             <Bar dataKey={yKey} name={name} radius={[6, 6, 0, 0]} animationDuration={650}>
//               {data.map((entry, i) => {
//                 const ratio = Number(entry[yKey] ?? 0) / max;
//                 const opacity = 0.25 + ratio * 0.75;
//                 return <Cell key={i} fill={accent} opacity={opacity} />;
//               })}
//             </Bar>
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }

// /* ─── KPI CARD ──────────────────────────────────────────────────────────────── */

// function KpiCard({
//   theme,
//   label,
//   value,
//   prefix = "",
//   suffix = "",
//   decimals = 0,
//   change,
//   up,
//   icon: Icon,
//   accentClass,
//   barFrom,
//   barTo,
//   delay = 0,
// }: {
//   theme: Theme;
//   label: string;
//   value: number;
//   prefix?: string;
//   suffix?: string;
//   decimals?: number;
//   change: string;
//   up: boolean;
//   icon: React.ComponentType<{ className?: string }>;
//   accentClass: string;
//   barFrom: string;
//   barTo: string;
//   delay?: number;
// }) {
//   const t = tk(theme);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 18 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3, delay, ease: "easeOut" }}
//       whileHover={{ y: -5, scale: 1.015 }}
//     >
//       <Card theme={theme} className="relative overflow-hidden p-5">
//         <div className={cn("absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-50", accentClass)} />
//         <div className="relative">
//           <div className="flex items-start justify-between mb-4">
//             <div
//               className={cn(
//                 "relative flex h-10 w-10 items-center justify-center rounded-xl border",
//                 theme === "dark" ? "border-white/[0.07] bg-white/[0.07]" : "border-slate-200 bg-slate-50"
//               )}
//             >
//               <Icon className={cn("h-[18px] w-[18px]", t.textMuted)} />
//               {theme === "dark" && (
//                 <div className="absolute -right-1 -top-1">
//                   <div
//                     className="h-2.5 w-2.5 rounded-full"
//                     style={{
//                       background: "radial-gradient(circle, #fff7cc 0%, #fbbf24 42%, #f59e0b 70%, #b45309 100%)",
//                       boxShadow: "0 0 10px rgba(251,191,36,.45)",
//                       animation: "lantern-breathe 2s ease-in-out infinite",
//                     }}
//                   />
//                 </div>
//               )}
//             </div>
//             <span
//               className={cn(
//                 "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
//                 up ? "bg-emerald-500/12 text-emerald-500" : "bg-rose-500/12 text-rose-500"
//               )}
//             >
//               {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
//               {change}
//             </span>
//           </div>

//           <div className={cn("text-[11px] font-semibold uppercase tracking-widest mb-1", t.textSubtle)}>
//             {label}
//           </div>

//           <div className={cn("text-[30px] font-black tracking-tight leading-none", t.text)}>
//             {prefix}
//             <CountUp end={value} duration={1.5} decimals={decimals} separator="," />
//             {suffix}
//           </div>

//           <div className={cn("mt-4 h-[3px] w-full rounded-full overflow-hidden", t.track)}>
//             <motion.div
//               initial={{ width: 0 }}
//               animate={{ width: "68%" }}
//               transition={{ duration: 1.1, delay: delay + 0.35, ease: "easeOut" }}
//               className={cn("h-full rounded-full bg-gradient-to-r", barFrom, barTo)}
//             />
//           </div>
//         </div>
//       </Card>
//     </motion.div>
//   );
// }

// /* ─── SEGMENTED CONTROL ─────────────────────────────────────────────────────── */

// function Segmented({
//   options,
//   value,
//   onChange,
//   theme,
// }: {
//   options: string[];
//   value: string;
//   onChange: (v: string) => void;
//   theme: Theme;
// }) {
//   const t = tk(theme);

//   return (
//     <div className={cn("flex items-center rounded-xl border overflow-hidden", t.segmented)}>
//       {options.map((o) => (
//         <button
//           key={o}
//           onClick={() => onChange(o)}
//           className={cn(
//             "px-3.5 py-2 text-[11px] font-bold transition-all",
//             value === o ? t.segActive : t.segInactive
//           )}
//         >
//           {o}
//         </button>
//       ))}
//     </div>
//   );
// }

// /* ─── PAGE ───────────────────────────────────────────────────────────────────── */

// export default function AnalyticsPage() {
//   const [range, setRange] = React.useState("7d");
//   const [theme, setTheme] = React.useState<Theme>("dark");
//   const [search, setSearch] = React.useState("");
//   const [activeTab, setActiveTab] = React.useState<"trend" | "hourly">("trend");
//   const t = tk(theme);

//   const filtered = recentTx.filter(
//     (tx) =>
//       !search ||
//       tx.customer.toLowerCase().includes(search.toLowerCase()) ||
//       tx.product.toLowerCase().includes(search.toLowerCase()) ||
//       tx.id.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <>
//       <FontImport />
//       <div className={cn("relative min-h-screen transition-colors duration-300", t.root)}>
//         {theme === "dark" && <NightParticles />}
//         <div className={cn("pointer-events-none fixed inset-0", t.grid)} />

//         <div className="pointer-events-none fixed inset-0 overflow-hidden">
//           <div className={cn("absolute -top-32 left-[15%] h-[550px] w-[550px] rounded-full blur-[140px]", t.glow1)} />
//           <div className={cn("absolute bottom-[5%] right-[-8%] h-[450px] w-[450px] rounded-full blur-[130px]", t.glow2)} />
//           <div className={cn("absolute top-[38%] left-[40%] h-[360px] w-[360px] rounded-full blur-[150px]", t.glow3)} />
//         </div>

//         <div className="relative z-10 mx-auto max-w-[1520px] px-5 py-7 md:px-8 space-y-7">
//           <motion.div
//             initial={{ opacity: 0, y: -14 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.28 }}
//             className={cn("relative overflow-hidden rounded-[30px] border p-6 md:p-8", t.card)}
//           >
//             <div className="absolute left-0 right-0 top-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #c8892a, transparent)" }} />
//             <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
//               <div className="flex items-center gap-5">
//                 {theme === "dark" && (
//                   <motion.div
//                     animate={{ y: [0, -8, 0] }}
//                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
//                     className="hidden md:block"
//                   >
//                     <LanternMark size={78} glow />
//                   </motion.div>
//                 )}
//                 <div>
//                   <div className={cn("mb-2.5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold", t.pill)}>
//                     <Sparkles className="h-3 w-3" />
//                     BINHLAIG Analytics
//                   </div>
//                   <h1 className={cn("serif text-[40px] md:text-[54px] font-normal leading-[0.95]", t.text)}>
//                     Analytics
//                     <span className={cn("ml-3 text-[18px] md:text-[24px] font-medium", t.textMuted)}>/ Overview</span>
//                   </h1>
//                   <p className={cn("mt-2 text-sm", t.textMuted)}>
//                     Real-time POS insights across all branches and channels.
//                   </p>
//                 </div>
//               </div>

//               <div className="flex flex-wrap items-center gap-2.5">
//                 <Segmented options={RANGES} value={range} onChange={setRange} theme={theme} />
//                 <Button variant="outline" className={cn("h-9 rounded-xl gap-1.5 text-[13px]", t.btn)}>
//                   <Download className="h-3.5 w-3.5" />
//                   Export
//                 </Button>
//                 <Button variant="outline" className={cn("h-9 rounded-xl gap-1.5 text-[13px]", t.btn)}>
//                   <RefreshCw className="h-3.5 w-3.5" />
//                   Refresh
//                 </Button>
//                 <LanternToggle dark={theme === "dark"} onToggle={() => setTheme((th) => (th === "dark" ? "light" : "dark"))} />
//               </div>
//             </div>
//           </motion.div>

//           <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
//             <KpiCard
//               theme={theme}
//               label="Total Revenue"
//               value={128400}
//               prefix="¥"
//               change="+18.2%"
//               up
//               icon={DollarSign}
//               accentClass="bg-blue-500/20"
//               barFrom="from-blue-400"
//               barTo="to-cyan-400"
//               delay={0}
//             />
//             <KpiCard
//               theme={theme}
//               label="Total Orders"
//               value={2480}
//               change="+12.4%"
//               up
//               icon={ShoppingBag}
//               accentClass="bg-violet-500/20"
//               barFrom="from-violet-400"
//               barTo="to-fuchsia-400"
//               delay={0.07}
//             />
//             <KpiCard
//               theme={theme}
//               label="Avg Order Value"
//               value={5178}
//               prefix="¥"
//               change="+5.1%"
//               up
//               icon={Package}
//               accentClass="bg-emerald-500/20"
//               barFrom="from-emerald-400"
//               barTo="to-teal-400"
//               delay={0.14}
//             />
//             <KpiCard
//               theme={theme}
//               label="Refund Rate"
//               value={2.4}
//               suffix="%"
//               decimals={1}
//               change="+0.3%"
//               up={false}
//               icon={Activity}
//               accentClass="bg-rose-500/20"
//               barFrom="from-rose-400"
//               barTo="to-orange-400"
//               delay={0.21}
//             />
//           </div>

//           <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
//             <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
//               <Card theme={theme} className="p-6 space-y-5">
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <div className={cn("text-[17px] font-bold", t.text)}>Sales Trend</div>
//                     <div className={cn("text-[12px] mt-0.5", t.textMuted)}>This week vs last week</div>
//                   </div>

//                   <div className="flex items-center gap-2">
//                     {[
//                       { label: "This Week", color: "#60a5fa" },
//                       {
//                         label: "Last Week",
//                         color: theme === "dark" ? "rgba(255,255,255,0.18)" : "rgba(15,23,42,0.2)",
//                       },
//                     ].map((l) => (
//                       <div key={l.label} className="flex items-center gap-1.5">
//                         <span className="h-[3px] w-5 rounded-full inline-block" style={{ background: l.color }} />
//                         <span className={cn("text-[10px] font-semibold", t.textSubtle)}>{l.label}</span>
//                       </div>
//                     ))}
//                     <button className={cn("flex h-8 w-8 items-center justify-center rounded-xl border", t.btn)}>
//                       <MoreHorizontal className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="flex gap-2">
//                   {(["trend", "hourly"] as const).map((tab) => (
//                     <button
//                       key={tab}
//                       onClick={() => setActiveTab(tab)}
//                       className={cn(
//                         "rounded-xl px-3.5 py-2 text-[11px] font-bold transition-all border",
//                         activeTab === tab
//                           ? theme === "dark"
//                             ? "bg-white/12 border-white/15 text-[#f3e7d2]"
//                             : "bg-slate-900 border-transparent text-white"
//                           : cn("border-transparent", t.textMuted, "hover:border-current")
//                       )}
//                     >
//                       {tab === "trend" ? "Weekly" : "Today / Hour"}
//                     </button>
//                   ))}
//                 </div>

//                 <AnimatePresence mode="wait">
//                   {activeTab === "trend" ? (
//                     <motion.div key="trend" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//                       <GlowAreaChartCard
//                         theme={theme}
//                         data={salesTrend}
//                         xKey="day"
//                         yKey="sales"
//                         name="This Week"
//                         accent="#60a5fa"
//                         compareKey="prev"
//                         compareName="Last Week"
//                         height={280}
//                       />
//                     </motion.div>
//                   ) : (
//                     <motion.div key="hourly" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//                       <GlowBarChartCard
//                         theme={theme}
//                         data={hourlyFlow}
//                         xKey="h"
//                         yKey="v"
//                         name="Sales"
//                         accent="#a78bfa"
//                         height={280}
//                       />
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </Card>
//             </motion.div>

//             <div className="flex flex-col gap-6">
//               <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
//                 <Card theme={theme} className="p-6 space-y-4">
//                   <div>
//                     <div className={cn("text-[17px] font-bold", t.text)}>Category Mix</div>
//                     <div className={cn("text-[12px] mt-0.5", t.textMuted)}>Revenue by product type</div>
//                   </div>

//                   <div className="flex items-center gap-4">
//                     <div className="h-[140px] w-[140px] shrink-0">
//                       <ResponsiveContainer width="100%" height="100%">
//                         <PieChart>
//                           <Pie
//                             data={categoryMix}
//                             dataKey="value"
//                             innerRadius={44}
//                             outerRadius={65}
//                             paddingAngle={3}
//                             startAngle={90}
//                             endAngle={-270}
//                           >
//                             {categoryMix.map((c, i) => (
//                               <Cell key={i} fill={c.color} />
//                             ))}
//                           </Pie>
//                         </PieChart>
//                       </ResponsiveContainer>
//                     </div>

//                     <div className="flex-1 space-y-2.5">
//                       {categoryMix.map((c) => (
//                         <div key={c.name} className="flex items-center justify-between">
//                           <div className="flex items-center gap-2">
//                             <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
//                             <span className={cn("text-[12px] font-medium", t.text)}>{c.name}</span>
//                           </div>
//                           <span className={cn("text-[12px] font-bold", t.textMuted)}>{c.value}%</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </Card>
//               </motion.div>

//               <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
//                 <div className="grid grid-cols-2 gap-4">
//                   {[
//                     { label: "Active Branches", value: "4", icon: Store, color: "text-blue-400" },
//                     { label: "Staff Online", value: "18", icon: Users, color: "text-emerald-400" },
//                     { label: "Avg Wait Time", value: "3.2m", icon: Clock, color: "text-amber-400" },
//                     { label: "Products Listed", value: "482", icon: Package, color: "text-violet-400" },
//                   ].map((s) => {
//                     const Icon = s.icon;
//                     return (
//                       <Card key={s.label} theme={theme} className="p-4 flex flex-col gap-2">
//                         <Icon className={cn("h-4 w-4", s.color)} />
//                         <div className={cn("text-[22px] font-black", t.text)}>{s.value}</div>
//                         <div className={cn("text-[11px] font-medium", t.textMuted)}>{s.label}</div>
//                       </Card>
//                     );
//                   })}
//                 </div>
//               </motion.div>
//             </div>
//           </div>

//           <div className="grid gap-6 xl:grid-cols-2">
//             <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
//               <Card theme={theme} className="p-6 space-y-5">
//                 <div>
//                   <div className={cn("text-[17px] font-bold", t.text)}>Branch Performance</div>
//                   <div className={cn("text-[12px] mt-0.5", t.textMuted)}>Revenue vs target — {range}</div>
//                 </div>

//                 <div className="space-y-5">
//                   {branchData.map((b, i) => (
//                     <motion.div
//                       key={b.name}
//                       initial={{ opacity: 0, x: -10 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 0.38 + i * 0.07 }}
//                     >
//                       <div className="flex items-center justify-between mb-2.5">
//                         <div className="flex items-center gap-3">
//                           <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black", i === 0 ? "bg-amber-500/15 text-amber-500" : t.rankChip)}>
//                             {i === 0 ? <Star className="h-3.5 w-3.5" /> : i + 1}
//                           </span>
//                           <div>
//                             <span className={cn("text-[13px] font-bold", t.text)}>{b.name}</span>
//                             <span className={cn("ml-2 text-[11px]", t.textSubtle)}>¥{b.target.toLocaleString()}</span>
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-2">
//                           <span className={cn("text-[13px] font-bold", t.text)}>¥{b.value.toLocaleString()}</span>
//                           <span
//                             className={cn(
//                               "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold",
//                               b.pct >= 100 ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
//                             )}
//                           >
//                             {b.pct >= 100 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
//                             {b.pct}%
//                           </span>
//                         </div>
//                       </div>

//                       <div className={cn("h-[6px] w-full rounded-full overflow-hidden", t.track)}>
//                         <motion.div
//                           initial={{ width: 0 }}
//                           animate={{ width: `${Math.min(b.pct, 100)}%` }}
//                           transition={{ duration: 1, delay: 0.4 + i * 0.08, ease: "easeOut" }}
//                           style={{ background: `linear-gradient(90deg,${b.color}99,${b.color})`, boxShadow: `0 0 18px ${glowHex(b.color, "55")}` }}
//                           className="h-full rounded-full"
//                         />
//                       </div>
//                     </motion.div>
//                   ))}
//                 </div>
//               </Card>
//             </motion.div>

//             <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
//               <Card theme={theme} className="p-6 space-y-5">
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <div className={cn("text-[17px] font-bold", t.text)}>Top Products</div>
//                     <div className={cn("text-[12px] mt-0.5", t.textMuted)}>By units sold — {range}</div>
//                   </div>
//                   <button className={cn("flex items-center gap-1 text-[11px] font-bold rounded-xl border px-3 py-2", t.btn)}>
//                     View all <ChevronRight className="h-3 w-3" />
//                   </button>
//                 </div>

//                 <div className="space-y-1">
//                   {topProducts.map((p, i) => (
//                     <motion.div
//                       key={p.rank}
//                       initial={{ opacity: 0, x: 10 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: 0.42 + i * 0.06 }}
//                       className={cn(
//                         "flex items-center gap-3 rounded-xl px-3 py-3 transition-colors",
//                         t.infoRow,
//                         theme === "dark" ? "hover:bg-white/[0.06]" : "hover:bg-slate-100"
//                       )}
//                     >
//                       <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black", i === 0 ? "bg-amber-500/15 text-amber-500" : t.rankChip)}>
//                         {i === 0 ? <Star className="h-3.5 w-3.5" /> : p.rank}
//                       </span>

//                       <div className="min-w-0 flex-1">
//                         <div className={cn("text-[13px] font-semibold truncate", t.text)}>{p.name}</div>
//                         <div className={cn("text-[11px]", t.textSubtle)}>{p.sales} sold</div>
//                       </div>

//                       <div className="text-right shrink-0">
//                         <div className={cn("text-[13px] font-bold", t.text)}>¥{(p.revenue / 1000).toFixed(0)}k</div>
//                         <span className={cn("text-[10px] font-bold", p.trend === "up" ? "text-emerald-500" : "text-rose-500")}>
//                           {p.trend === "up" ? "↑" : "↓"}
//                         </span>
//                       </div>
//                     </motion.div>
//                   ))}
//                 </div>
//               </Card>
//             </motion.div>
//           </div>

//           <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
//             <Card theme={theme} className="p-6 space-y-5">
//               <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//                 <div>
//                   <div className={cn("text-[17px] font-bold", t.text)}>Recent Transactions</div>
//                   <div className={cn("text-[12px] mt-0.5", t.textMuted)}>{filtered.length} records</div>
//                 </div>

//                 <div className="flex gap-2.5">
//                   <div className="relative flex-1 md:w-[280px]">
//                     <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5", t.textSubtle)} />
//                     <Input
//                       value={search}
//                       onChange={(e) => setSearch(e.target.value)}
//                       placeholder="Customer, product, ID…"
//                       className={cn("h-9 rounded-xl pl-9 text-[13px]", t.input)}
//                     />
//                   </div>

//                   <button className={cn("flex h-9 items-center gap-1.5 rounded-xl border px-3.5 text-[13px] font-semibold", t.btn)}>
//                     <Filter className="h-3.5 w-3.5" />
//                     Filter
//                   </button>
//                 </div>
//               </div>

//               <div className="overflow-x-auto">
//                 <table className="w-full min-w-[700px]">
//                   <thead>
//                     <tr className={cn("border-b", theme === "dark" ? "border-white/[0.055]" : "border-slate-100")}>
//                       {[["ID", ""], ["Customer", ""], ["Product", ""], ["Branch", ""], ["Amount", "text-right"], ["Status", ""], ["Time", "text-right"]].map(([h, align]) => (
//                         <th
//                           key={h}
//                           className={cn(
//                             "pb-3 text-[10px] font-black uppercase tracking-widest",
//                             align || "text-left",
//                             t.tableHead,
//                             h === "ID" ? "pr-3" : "px-3"
//                           )}
//                         >
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>

//                   <AnimatePresence mode="popLayout">
//                     <tbody>
//                       {filtered.map((tx, i) => (
//                         <motion.tr
//                           key={tx.id}
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                           exit={{ opacity: 0 }}
//                           transition={{ delay: i * 0.04 }}
//                           className={cn("border-b transition-colors cursor-default", t.tableRow)}
//                         >
//                           <td className={cn("py-3.5 pr-3 font-mono text-[11px] font-bold", t.textMuted)}>{tx.id}</td>
//                           <td className={cn("px-3 py-3.5 text-[13px] font-semibold", t.text)}>{tx.customer}</td>
//                           <td className={cn("px-3 py-3.5 text-[12px]", t.textMuted)}>{tx.product}</td>
//                           <td className="px-3 py-3.5">
//                             <span className={cn("rounded-lg border px-2.5 py-1 text-[11px] font-semibold", t.pill)}>{tx.branch}</span>
//                           </td>
//                           <td className={cn("px-3 py-3.5 text-right text-[13px] font-black", t.text)}>
//                             ¥{tx.amount.toLocaleString()}
//                           </td>
//                           <td className="px-3 py-3.5">
//                             <span
//                               className={cn(
//                                 "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold",
//                                 tx.status === "completed"
//                                   ? "bg-emerald-500/10 text-emerald-500"
//                                   : tx.status === "pending"
//                                   ? "bg-amber-500/10 text-amber-500"
//                                   : "bg-rose-500/10 text-rose-500"
//                               )}
//                             >
//                               <span
//                                 className={cn(
//                                   "h-1.5 w-1.5 rounded-full",
//                                   tx.status === "completed"
//                                     ? "bg-emerald-500"
//                                     : tx.status === "pending"
//                                     ? "bg-amber-500"
//                                     : "bg-rose-500"
//                                 )}
//                               />
//                               {tx.status}
//                             </span>
//                           </td>
//                           <td className={cn("pl-3 py-3.5 text-right text-[11px]", t.textSubtle)}>{tx.time} ago</td>
//                         </motion.tr>
//                       ))}

//                       {!filtered.length && (
//                         <tr>
//                           <td colSpan={7} className={cn("py-14 text-center text-sm", t.textMuted)}>
//                             No transactions match your search.
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </AnimatePresence>
//                 </table>
//               </div>
//             </Card>
//           </motion.div>

//           <div className={cn("flex items-center justify-between text-[11px] font-semibold pb-3", t.textSubtle)}>
//             <span>© 2026 BINHLAIG · Analytics Module</span>
//             <span className="flex items-center gap-1.5">
//               <Zap className="h-3 w-3" />
//               Live · Updated just now
//             </span>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }






"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import type { TooltipProps } from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Store,
  Filter,
  Search,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  DollarSign,
  ShoppingBag,
  Package,
  Activity,
  Users,
  Zap,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Clock,
  Star,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080";

type Theme = "dark" | "light";
type RangeKey = "24h" | "7d" | "30d" | "90d";

type ApiReceiptItem = {
  id?: number | string;
  productId?: number | string | null;
  product_id?: number | string | null;
  productName?: string | null;
  product_name?: string | null;
  name?: string | null;
  sku?: string | null;
  barcode?: string | null;
  category?: string | null;
  productType?: string | null;
  product_type?: string | null;
  qty?: number | string | null;
  quantity?: number | string | null;
  price?: number | string | null;
  productPrice?: number | string | null;
  product_price?: number | string | null;
  lineTotal?: number | string | null;
  line_total?: number | string | null;
  total?: number | string | null;
};

type ApiReceipt = {
  id?: number | string;
  receiptNo?: string | null;
  receipt_no?: string | null;
  receiptNumber?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
  date?: string | null;
  paymentMethod?: string | null;
  payment_method?: string | null;
  status?: string | null;

  subtotal?: number | string | null;
  grandTotal?: number | string | null;
  grand_total?: number | string | null;
  total?: number | string | null;
  totalAmount?: number | string | null;
  total_amount?: number | string | null;
  taxAmount?: number | string | null;
  tax_amount?: number | string | null;
  discountAmount?: number | string | null;
  discount_amount?: number | string | null;

  shopName?: string | null;
  shop_name?: string | null;
  branch?: string | null;
  staffName?: string | null;
  staff_name?: string | null;
  createdByName?: string | null;
  created_by_name?: string | null;
  customerName?: string | null;
  customer_name?: string | null;

  items?: ApiReceiptItem[] | null;
  receiptItems?: ApiReceiptItem[] | null;
  receipt_items?: ApiReceiptItem[] | null;
};

type SalesPoint = {
  day: string;
  sales: number;
  prev: number;
  target: number;
};

type BranchPoint = {
  name: string;
  value: number;
  target: number;
  pct: number;
  color: string;
};

type HourPoint = {
  h: string;
  v: number;
};

type CategoryPoint = {
  name: string;
  value: number;
  amount: number;
  color: string;
};

type ProductPoint = {
  rank: number;
  name: string;
  sales: number;
  revenue: number;
  trend: "up" | "down";
};

type TransactionRow = {
  id: string;
  customer: string;
  product: string;
  amount: number;
  branch: string;
  status: string;
  time: string;
};

const RANGES: RangeKey[] = ["24h", "7d", "30d", "90d"];

const COLORS = [
  "#60a5fa",
  "#a78bfa",
  "#34d399",
  "#fb923c",
  "#fb7185",
  "#facc15",
  "#22d3ee",
];

function getAnalyticsToken(session: any) {
  if (session?.accessToken) return String(session.accessToken);

  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("admin_access_token") ||
    localStorage.getItem("super_admin_token") ||
    localStorage.getItem("pos_shop_owner_token") ||
    localStorage.getItem("pos_access_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    ""
  );
}

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getReceiptDate(receipt: ApiReceipt) {
  const raw = receipt.createdAt || receipt.created_at || receipt.date;
  const d = raw ? new Date(raw) : new Date();

  if (Number.isNaN(d.getTime())) return new Date();
  return d;
}

function getReceiptTotal(receipt: ApiReceipt) {
  return toNumber(
    receipt.grandTotal ??
    receipt.grand_total ??
    receipt.totalAmount ??
    receipt.total_amount ??
    receipt.total ??
    receipt.subtotal,
    0,
  );
}

function getReceiptNo(receipt: ApiReceipt) {
  return String(
    receipt.receiptNo ||
    receipt.receipt_no ||
    receipt.receiptNumber ||
    receipt.id ||
    "TXN",
  );
}

function getReceiptItems(receipt: ApiReceipt): ApiReceiptItem[] {
  const items = receipt.items || receipt.receiptItems || receipt.receipt_items;
  return Array.isArray(items) ? items : [];
}

function getItemName(item: ApiReceiptItem) {
  return String(item.productName || item.product_name || item.name || "Unknown Product");
}

function getItemCategory(item: ApiReceiptItem) {
  return String(item.category || item.productType || item.product_type || "General");
}

function getItemQty(item: ApiReceiptItem) {
  return toNumber(item.qty ?? item.quantity, 1);
}

function getItemTotal(item: ApiReceiptItem) {
  const direct = toNumber(item.lineTotal ?? item.line_total ?? item.total, NaN);

  if (Number.isFinite(direct)) return direct;

  const qty = getItemQty(item);
  const price = toNumber(item.price ?? item.productPrice ?? item.product_price, 0);

  return qty * price;
}

function normalizeStatus(status: unknown) {
  const raw = String(status || "completed").toLowerCase();

  if (raw.includes("refund") || raw.includes("cancel") || raw.includes("void")) {
    return "refunded";
  }

  if (raw.includes("pending")) return "pending";

  return "completed";
}

function rangeToDays(range: RangeKey) {
  if (range === "24h") return 1;
  if (range === "7d") return 7;
  if (range === "30d") return 30;
  return 90;
}

function filterReceiptsByRange(receipts: ApiReceipt[], range: RangeKey) {
  const days = rangeToDays(range);
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);

  return receipts.filter((receipt) => getReceiptDate(receipt) >= start);
}

function formatAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.max(0, Math.floor(diff / 60_000));

  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
}

function buildSalesTrend(receipts: ApiReceipt[], range: RangeKey): SalesPoint[] {
  if (range === "24h") {
    const hours = Array.from({ length: 8 }, (_, index) => {
      const h = 8 + index * 2;
      return {
        key: h,
        label: `${h}`,
        sales: 0,
      };
    });

    receipts.forEach((receipt) => {
      const d = getReceiptDate(receipt);
      const h = d.getHours();
      const bucket = hours.reduce((best, item) => {
        return Math.abs(item.key - h) < Math.abs(best.key - h) ? item : best;
      }, hours[0]);

      bucket.sales += getReceiptTotal(receipt);
    });

    return hours.map((item) => ({
      day: item.label,
      sales: item.sales,
      prev: Math.round(item.sales * 0.82),
      target: Math.max(1000, Math.round(item.sales * 1.12)),
    }));
  }

  const days = Math.min(rangeToDays(range), 14);
  const now = new Date();

  const buckets = Array.from({ length: days }, (_, index) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (days - 1 - index));
    d.setHours(0, 0, 0, 0);

    return {
      key: d.toISOString().slice(0, 10),
      day: days <= 7 ? formatDayLabel(d) : `${d.getMonth() + 1}/${d.getDate()}`,
      sales: 0,
      prev: 0,
      target: 0,
    };
  });

  receipts.forEach((receipt) => {
    const d = getReceiptDate(receipt);
    const key = d.toISOString().slice(0, 10);
    const bucket = buckets.find((item) => item.key === key);

    if (bucket) bucket.sales += getReceiptTotal(receipt);
  });

  return buckets.map((item) => ({
    day: item.day,
    sales: item.sales,
    prev: Math.round(item.sales * 0.86),
    target: Math.max(1000, Math.round(item.sales * 1.15)),
  }));
}

function buildHourlyFlow(receipts: ApiReceipt[]): HourPoint[] {
  const buckets = Array.from({ length: 15 }, (_, i) => {
    const h = 8 + i;
    return { h: String(h), v: 0 };
  });

  receipts.forEach((receipt) => {
    const d = getReceiptDate(receipt);
    const h = d.getHours();
    const bucket = buckets.find((item) => Number(item.h) === h);

    if (bucket) bucket.v += getReceiptTotal(receipt);
  });

  return buckets;
}

function buildBranchData(receipts: ApiReceipt[]): BranchPoint[] {
  const map = new Map<string, number>();

  receipts.forEach((receipt) => {
    const name = String(
      receipt.branch || receipt.shopName || receipt.shop_name || "Main",
    );

    map.set(name, (map.get(name) || 0) + getReceiptTotal(receipt));
  });

  const rows = Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  if (!rows.length) {
    return [{ name: "Main", value: 0, target: 0, pct: 0, color: COLORS[0] }];
  }

  return rows.map(([name, value], index) => {
    const target = Math.max(1, Math.round(value * 0.92));

    return {
      name,
      value,
      target,
      pct: Math.round((value / target) * 100),
      color: COLORS[index % COLORS.length],
    };
  });
}

function buildCategoryMix(receipts: ApiReceipt[]): CategoryPoint[] {
  const map = new Map<string, number>();

  receipts.forEach((receipt) => {
    const items = getReceiptItems(receipt);

    if (!items.length) {
      map.set("General", (map.get("General") || 0) + getReceiptTotal(receipt));
      return;
    }

    items.forEach((item) => {
      const category = getItemCategory(item);
      map.set(category, (map.get(category) || 0) + getItemTotal(item));
    });
  });

  const total = Array.from(map.values()).reduce((sum, value) => sum + value, 0);

  const rows = Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (!rows.length) {
    return [{ name: "General", value: 100, amount: 0, color: COLORS[0] }];
  }

  return rows.map(([name, amount], index) => ({
    name,
    amount,
    value: total > 0 ? Math.round((amount / total) * 100) : 0,
    color: COLORS[index % COLORS.length],
  }));
}

function buildTopProducts(receipts: ApiReceipt[]): ProductPoint[] {
  const map = new Map<string, { qty: number; revenue: number }>();

  receipts.forEach((receipt) => {
    getReceiptItems(receipt).forEach((item) => {
      const name = getItemName(item);
      const current = map.get(name) || { qty: 0, revenue: 0 };

      current.qty += getItemQty(item);
      current.revenue += getItemTotal(item);

      map.set(name, current);
    });
  });

  const rows = Array.from(map.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  return rows.map(([name, value], index) => ({
    rank: index + 1,
    name,
    sales: value.qty,
    revenue: value.revenue,
    trend: index % 3 === 2 ? "down" : "up",
  }));
}

function buildRecentTransactions(receipts: ApiReceipt[]): TransactionRow[] {
  return [...receipts]
    .sort((a, b) => getReceiptDate(b).getTime() - getReceiptDate(a).getTime())
    .slice(0, 12)
    .map((receipt) => {
      const items = getReceiptItems(receipt);
      const product =
        items.length === 1
          ? getItemName(items[0])
          : items.length > 1
            ? `${getItemName(items[0])} + ${items.length - 1} more`
            : "Receipt Sale";

      return {
        id: getReceiptNo(receipt),
        customer: String(
          receipt.customerName ||
          receipt.customer_name ||
          receipt.staffName ||
          receipt.staff_name ||
          receipt.createdByName ||
          receipt.created_by_name ||
          "Walk-in Customer",
        ),
        product,
        amount: getReceiptTotal(receipt),
        branch: String(receipt.branch || receipt.shopName || receipt.shop_name || "Main"),
        status: normalizeStatus(receipt.status),
        time: formatAgo(getReceiptDate(receipt)),
      };
    });
}

function calcAnalytics(receipts: ApiReceipt[]) {
  const revenue = receipts.reduce((sum, receipt) => sum + getReceiptTotal(receipt), 0);
  const orders = receipts.length;
  const avg = orders > 0 ? revenue / orders : 0;
  const refunds = receipts.filter((receipt) => normalizeStatus(receipt.status) === "refunded").length;
  const refundRate = orders > 0 ? (refunds / orders) * 100 : 0;

  const itemCount = receipts.reduce((sum, receipt) => {
    const items = getReceiptItems(receipt);
    if (!items.length) return sum;
    return sum + items.reduce((itemSum, item) => itemSum + getItemQty(item), 0);
  }, 0);

  return {
    revenue,
    orders,
    avg,
    refunds,
    refundRate,
    itemCount,
  };
}

/* ─── THEME ───────────────────────────────────────────────────────────────── */

function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;700;900&display=swap');
      * { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", sans-serif; }
      .serif { font-family: 'DM Serif Display', Georgia, serif !important; }

      @keyframes lantern-float {
        0%,100% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
      }

      @keyframes lantern-breathe {
        0%,100% { opacity:.72; transform: scale(1); }
        50% { opacity:1; transform: scale(1.05); }
      }

      @keyframes ember-rise {
        0%   { transform: translateY(0px) translateX(0px) scale(1); opacity:.55; }
        50%  { transform: translateY(-16px) translateX(4px) scale(1.12); opacity:.9; }
        100% { transform: translateY(-32px) translateX(-2px) scale(.6); opacity:0; }
      }
    `}</style>
  );
}

const tk = (theme: Theme) =>
  theme === "dark"
    ? {
      root: "bg-[#05060d] text-[#f3e7d2]",
      text: "text-[#f3e7d2]",
      textMuted: "text-[#bca98f]",
      textSubtle: "text-[#8a7a65]",
      card: "border-[rgba(200,137,42,0.16)] bg-[rgba(14,10,6,0.84)] backdrop-blur-xl",
      cardHover:
        "hover:border-[rgba(212,163,82,0.30)] hover:bg-[rgba(255,255,255,0.05)]",
      input:
        "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#f3e7d2] placeholder:text-[#8a7a65] focus-visible:border-[#c8892a]",
      btn: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#d4b68a] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f3e7d2]",
      btnPrimary:
        "bg-gradient-to-r from-[#a07020] to-[#d4a352] text-[#140d05] hover:from-[#b37a22] hover:to-[#deb25a] shadow-lg shadow-[#c8892a]/20",
      pill: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#bca98f]",
      tableHead: "text-[#8a7a65]",
      tableRow: "border-[rgba(255,255,255,0.045)] hover:bg-[rgba(255,255,255,0.04)]",
      segmented: "bg-[rgba(255,255,255,0.045)] border-[rgba(255,255,255,0.07)]",
      segActive: "bg-[rgba(255,255,255,0.14)] text-[#f3e7d2]",
      segInactive: "text-[#8a7a65] hover:text-[#d4b68a]",
      grid:
        "[background-image:linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] [background-size:44px_44px]",
      cGrid: "rgba(255,255,255,0.055)",
      cAxis: "rgba(188,169,143,0.75)",
      ttBg: "bg-[#0a0e1a]/98 border-[rgba(255,255,255,0.08)] text-white",
      glow1: "bg-amber-700/[0.16]",
      glow2: "bg-orange-700/[0.10]",
      glow3: "bg-yellow-700/[0.08]",
      rankChip: "bg-[rgba(255,255,255,0.06)] text-[#8a7a65]",
      track: "bg-[rgba(255,255,255,0.06)]",
      infoRow: "bg-[rgba(255,255,255,0.03)]",
    }
    : {
      root: "bg-[#edf1f9] text-slate-900",
      text: "text-slate-900",
      textMuted: "text-slate-500",
      textSubtle: "text-slate-400",
      card: "border-slate-200/80 bg-white/95 shadow-[0_2px_20px_rgba(15,23,42,0.06)] backdrop-blur-xl",
      cardHover: "hover:border-slate-300 hover:shadow-[0_6px_28px_rgba(15,23,42,0.10)]",
      input:
        "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-blue-500",
      btn: "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 shadow-sm",
      btnPrimary: "bg-slate-900 text-white hover:bg-slate-800 shadow-md",
      pill: "border-slate-200 bg-white text-slate-500 shadow-sm",
      tableHead: "text-slate-400",
      tableRow: "border-slate-100 hover:bg-slate-50/70",
      segmented: "bg-slate-100/80 border-slate-200",
      segActive: "bg-white text-slate-900 shadow-sm",
      segInactive: "text-slate-500 hover:text-slate-700",
      grid:
        "[background-image:linear-gradient(rgba(15,23,42,0.038)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.038)_1px,transparent_1px)] [background-size:44px_44px]",
      cGrid: "rgba(15,23,42,0.07)",
      cAxis: "rgba(71,85,105,0.8)",
      ttBg: "bg-white border-slate-200 text-slate-900 shadow-[0_8px_32px_rgba(15,23,42,0.12)]",
      glow1: "bg-sky-300/20",
      glow2: "bg-indigo-300/15",
      glow3: "bg-cyan-300/15",
      rankChip: "bg-slate-100 text-slate-500",
      track: "bg-slate-100",
      infoRow: "bg-slate-50",
    };

function glowHex(hex: string, alpha = "22") {
  return `${hex}${alpha}`;
}

function LanternMark({
  size = 34,
  glow = false,
}: {
  size?: number;
  glow?: boolean;
}) {
  const h = size * 1.5;

  return (
    <svg width={size} height={h} viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="analyticsLanternGlow" cx="50%" cy="48%" r="50%">
          <stop offset="0%" stopColor="#fff7d6" stopOpacity="0.96" />
          <stop offset="28%" stopColor="#fbbf24" stopOpacity="0.86" />
          <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.44" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="analyticsLanternMetal" x1="8" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c58a3c" />
          <stop offset="50%" stopColor="#a96b28" />
          <stop offset="100%" stopColor="#8a551d" />
        </linearGradient>
      </defs>

      <line x1="16" y1="0" x2="16" y2="6" stroke={glow ? "#d6ae67" : "#9d6a2b"} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="8" y="6" width="16" height="5" rx="2" fill="url(#analyticsLanternMetal)" stroke="#7b4a18" strokeWidth="0.8" />
      <rect x="6" y="11" width="20" height="26" rx="3" fill={glow ? "#0e0908" : "#f7edd9"} stroke="#a66b27" strokeWidth="1" />
      {glow && <rect x="6" y="11" width="20" height="26" rx="3" fill="url(#analyticsLanternGlow)" />}

      {[11, 16, 21].map((x) => (
        <line key={x} x1={x} y1="11" x2={x} y2="37" stroke={glow ? "#6b3e10" : "#b47b34"} strokeWidth="1" opacity="0.95" />
      ))}

      {glow && (
        <>
          <motion.ellipse
            cx="16"
            cy="26"
            rx="4"
            ry="6"
            fill="#f59e0b"
            opacity="0.68"
            animate={{ ry: [6, 7.1, 5.3, 6.7, 6], cx: [16, 15.7, 16.3, 15.9, 16] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.ellipse
            cx="16"
            cy="27"
            rx="2.5"
            ry="4.2"
            fill="#fde68a"
            animate={{ ry: [4.2, 5, 3.6, 4.5, 4.2] }}
            transition={{ duration: 0.95, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      <rect x="8" y="37" width="16" height="5" rx="2" fill="url(#analyticsLanternMetal)" stroke="#7b4a18" strokeWidth="0.8" />
      <line x1="16" y1="42" x2="16" y2="47" stroke="#8f5b24" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="47" r="1.5" fill="#8f5b24" />
    </svg>
  );
}

function LanternToggle({
  dark,
  onToggle,
}: {
  dark: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ y: -2, scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      className="relative flex flex-col items-center focus:outline-none"
      style={{ width: 58 }}
      aria-label={dark ? "Switch to day mode" : "Switch to night mode"}
    >
      {dark && (
        <div
          className="pointer-events-none absolute"
          style={{
            width: 76,
            height: 76,
            top: -6,
            left: "50%",
            transform: "translateX(-50%)",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(251,191,36,0.52) 0%, rgba(245,158,11,0.18) 52%, transparent 76%)",
            filter: "blur(9px)",
            animation: "lantern-breathe 2.8s ease-in-out infinite",
          }}
        />
      )}

      <div style={{ animation: "lantern-float 3s ease-in-out infinite" }}>
        <LanternMark size={34} glow={dark} />
      </div>

      <span
        style={{
          marginTop: 5,
          fontSize: 7,
          fontWeight: 700,
          letterSpacing: "0.2em",
          color: dark ? "#c8892a" : "#9a6c2a",
        }}
      >
        {dark ? "NIGHT" : "DAY"}
      </span>
    </motion.button>
  );
}

function NightParticles() {
  const particles = Array.from({ length: 28 }).map((_, i) => ({
    id: i,
    left: `${(i * 31 + 9) % 100}%`,
    top: `${(i * 43 + 11) % 100}%`,
    size: 1.5 + (i % 3),
    delay: (i * 0.25) % 4,
    duration: 2.8 + (i % 4) * 0.8,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-amber-100"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ opacity: [0.08, 0.9, 0.08], scale: [0.7, 1.4, 0.7] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function ChartTip({
  active,
  payload,
  label,
  theme,
  accent = "#60a5fa",
}: TooltipProps<number, string> & { theme: Theme; accent?: string }) {
  const t = tk(theme);

  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "min-w-[170px] rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl",
        t.ttBg,
      )}
      style={{
        borderColor: accent,
        boxShadow: `0 12px 35px ${glowHex(accent, "20")}`,
      }}
    >
      <div className={cn("mb-2.5 text-[10px] font-bold uppercase tracking-widest", t.textSubtle)}>
        {label}
      </div>

      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-5 text-[13px]">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: String(p.color ?? accent) }}
            />
            <span className={t.textMuted}>{p.name}</span>
          </span>

          <span className={cn("font-bold", t.text)}>
            ¥{Number(p.value ?? 0).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

function Card({
  children,
  className,
  theme,
}: {
  children: React.ReactNode;
  className?: string;
  theme: Theme;
}) {
  const t = tk(theme);

  return (
    <div
      className={cn(
        "rounded-[22px] border transition-all duration-200",
        t.card,
        t.cardHover,
        className,
      )}
    >
      {children}
    </div>
  );
}

function GlowAreaChartCard({
  theme,
  data,
  xKey,
  yKey,
  name,
  accent,
  compareKey,
  compareName,
  height = 280,
}: {
  theme: Theme;
  data: Record<string, any>[];
  xKey: string;
  yKey: string;
  name: string;
  accent: string;
  compareKey?: string;
  compareName?: string;
  height?: number;
}) {
  const t = tk(theme);
  const gid = `ga-${accent.replace(/[^a-zA-Z0-9]/g, "")}`;
  const filterId = `gf-${accent.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div
      className="relative overflow-hidden rounded-[20px] border px-2 pt-2"
      style={{
        borderColor: glowHex(accent, "55"),
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 14px 40px ${glowHex(
          accent,
          "14",
        )}`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          background: `linear-gradient(180deg, ${glowHex(
            accent,
            "1f",
          )} 0%, transparent 100%)`,
        }}
      />

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity={0.46} />
                <stop offset="45%" stopColor={accent} stopOpacity={0.18} />
                <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
              </linearGradient>

              <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid stroke={t.cGrid} vertical={false} strokeDasharray="3 5" />
            <XAxis
              dataKey={xKey}
              tick={{ fill: t.cAxis, fontSize: 11, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: t.cAxis, fontSize: 11, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTip theme={theme} accent={accent} />} />

            {compareKey ? (
              <Area
                type="monotone"
                dataKey={compareKey}
                name={compareName ?? compareKey}
                stroke={theme === "dark" ? "rgba(255,255,255,0.20)" : "rgba(15,23,42,0.22)"}
                fill={theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)"}
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 3"
              />
            ) : null}

            <Area
              type="monotone"
              dataKey={yKey}
              name={name}
              stroke={accent}
              fill={`url(#${gid})`}
              strokeWidth={3}
              filter={`url(#${filterId})`}
              dot={{ r: 0 }}
              activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2, fill: accent }}
              animationDuration={700}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function GlowBarChartCard({
  theme,
  data,
  xKey,
  yKey,
  name,
  accent,
  height = 280,
}: {
  theme: Theme;
  data: Record<string, any>[];
  xKey: string;
  yKey: string;
  name: string;
  accent: string;
  height?: number;
}) {
  const t = tk(theme);
  const max = Math.max(...data.map((d) => Number(d[yKey] ?? 0)), 1);

  return (
    <div
      className="relative overflow-hidden rounded-[20px] border px-2 pt-2"
      style={{
        borderColor: glowHex(accent, "55"),
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 14px 40px ${glowHex(
          accent,
          "14",
        )}`,
      }}
    >
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }} barSize={14}>
            <CartesianGrid stroke={t.cGrid} vertical={false} strokeDasharray="3 5" />
            <XAxis
              dataKey={xKey}
              tick={{ fill: t.cAxis, fontSize: 10, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: t.cAxis, fontSize: 10, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<ChartTip theme={theme} accent={accent} />}
              cursor={{ fill: glowHex(accent, "12") }}
            />
            <Bar dataKey={yKey} name={name} radius={[6, 6, 0, 0]} animationDuration={650}>
              {data.map((entry, i) => {
                const ratio = Number(entry[yKey] ?? 0) / max;
                const opacity = 0.25 + ratio * 0.75;
                return <Cell key={i} fill={accent} opacity={opacity} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function KpiCard({
  theme,
  label,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  change,
  up,
  icon: Icon,
  accentClass,
  barFrom,
  barTo,
  delay = 0,
}: {
  theme: Theme;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change: string;
  up: boolean;
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
  barFrom: string;
  barTo: string;
  delay?: number;
}) {
  const t = tk(theme);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      whileHover={{ y: -5, scale: 1.015 }}
    >
      <Card theme={theme} className="relative overflow-hidden p-5">
        <div className={cn("absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-50", accentClass)} />
        <div className="relative">
          <div className="mb-4 flex items-start justify-between">
            <div
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-xl border",
                theme === "dark"
                  ? "border-white/[0.07] bg-white/[0.07]"
                  : "border-slate-200 bg-slate-50",
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", t.textMuted)} />
            </div>

            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
                up ? "bg-emerald-500/12 text-emerald-500" : "bg-rose-500/12 text-rose-500",
              )}
            >
              {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {change}
            </span>
          </div>

          <div className={cn("mb-1 text-[11px] font-semibold uppercase tracking-widest", t.textSubtle)}>
            {label}
          </div>

          <div className={cn("text-[30px] font-black leading-none tracking-tight", t.text)}>
            {prefix}
            <CountUp
              end={value}
              duration={1.2}
              decimals={decimals}
              separator=","
              preserveValue
            />
            {suffix}
          </div>

          <div className={cn("mt-4 h-[3px] w-full overflow-hidden rounded-full", t.track)}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "68%" }}
              transition={{ duration: 1.1, delay: delay + 0.25, ease: "easeOut" }}
              className={cn("h-full rounded-full bg-gradient-to-r", barFrom, barTo)}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function Segmented({
  options,
  value,
  onChange,
  theme,
}: {
  options: string[];
  value: string;
  onChange: (v: RangeKey) => void;
  theme: Theme;
}) {
  const t = tk(theme);

  return (
    <div className={cn("flex items-center overflow-hidden rounded-xl border", t.segmented)}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o as RangeKey)}
          className={cn(
            "px-3.5 py-2 text-[11px] font-bold transition-all",
            value === o ? t.segActive : t.segInactive,
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

async function readErrorMessage(res: Response) {
  const text = await res.text().catch(() => "");
  let message = `Failed (${res.status})`;

  try {
    const json = JSON.parse(text);

    if (json.error === "FEATURE_DISABLED") {
      return "Receipts / Analytics feature is disabled for this shop plan. Super Admin မှာ Receipts ကို ON လုပ်ပါ။";
    }

    message = json.message || json.error || message;
  } catch {
    if (text) message = text;
  }

  return message;
}

export default function AnalyticsPage() {
  const { data: session, status: sessionStatus } = useSession();

  const [range, setRange] = React.useState<RangeKey>("7d");
  const [theme, setTheme] = React.useState<Theme>("dark");
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"trend" | "hourly">("trend");
  const [receipts, setReceipts] = React.useState<ApiReceipt[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState("");

  const t = tk(theme);

  const fetchReceipts = React.useCallback(
    async (refresh = false) => {
      try {
        const token = getAnalyticsToken(session);

        if (!token) {
          setReceipts([]);
          if (sessionStatus !== "loading") {
            setError("Login token မရှိပါ။ အရင်ဆုံး login ပြန်ဝင်ပါ။");
          }
          return;
        }

        refresh ? setRefreshing(true) : setLoading(true);
        setError("");

        const candidatePaths = [
          "/api/pos/receipts/shop",
          "/api/pos/receipts/my",
          "/api/pos/receipts",
        ];

        let lastError = "";

        for (const path of candidatePaths) {
          const res = await fetch(`${API_BASE_URL}${path}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          });

          if (res.ok) {
            const data = await res.json();

            if (Array.isArray(data)) {
              setReceipts(data);
            } else if (Array.isArray(data.content)) {
              setReceipts(data.content);
            } else if (Array.isArray(data.items)) {
              setReceipts(data.items);
            } else if (Array.isArray(data.data)) {
              setReceipts(data.data);
            } else {
              setReceipts([]);
            }

            return;
          }

          lastError = await readErrorMessage(res);

          if (res.status === 401 || res.status === 403) {
            throw new Error(lastError);
          }
        }

        throw new Error(lastError || "Receipts API ခေါ်မရပါ။");
      } catch (e) {
        setReceipts([]);
        setError(e instanceof Error ? e.message : "Analytics API error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session, sessionStatus],
  );

  React.useEffect(() => {
    if (sessionStatus === "authenticated") {
      void fetchReceipts();
    } else if (sessionStatus === "unauthenticated") {
      const token = getAnalyticsToken(session);

      if (token) {
        void fetchReceipts();
        return;
      }

      setLoading(false);
      setError("Please sign in again.");
    }
  }, [fetchReceipts, session, sessionStatus]);

  const rangedReceipts = React.useMemo(
    () => filterReceiptsByRange(receipts, range),
    [receipts, range],
  );

  const analytics = React.useMemo(
    () => calcAnalytics(rangedReceipts),
    [rangedReceipts],
  );

  const salesTrend = React.useMemo(
    () => buildSalesTrend(rangedReceipts, range),
    [rangedReceipts, range],
  );

  const hourlyFlow = React.useMemo(
    () => buildHourlyFlow(rangedReceipts),
    [rangedReceipts],
  );

  const branchData = React.useMemo(
    () => buildBranchData(rangedReceipts),
    [rangedReceipts],
  );

  const categoryMix = React.useMemo(
    () => buildCategoryMix(rangedReceipts),
    [rangedReceipts],
  );

  const topProducts = React.useMemo(
    () => buildTopProducts(rangedReceipts),
    [rangedReceipts],
  );

  const recentTx = React.useMemo(
    () => buildRecentTransactions(rangedReceipts),
    [rangedReceipts],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    return recentTx.filter(
      (tx) =>
        !q ||
        tx.customer.toLowerCase().includes(q) ||
        tx.product.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q) ||
        tx.branch.toLowerCase().includes(q),
    );
  }, [recentTx, search]);
  const router = useRouter();

  return (
    <>
      <FontImport />

      <div className={cn("relative min-h-screen transition-colors duration-300", t.root)}>
        {theme === "dark" && <NightParticles />}
        <div className={cn("pointer-events-none fixed inset-0", t.grid)} />

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className={cn("absolute -top-32 left-[15%] h-[550px] w-[550px] rounded-full blur-[140px]", t.glow1)} />
          <div className={cn("absolute bottom-[5%] right-[-8%] h-[450px] w-[450px] rounded-full blur-[130px]", t.glow2)} />
          <div className={cn("absolute left-[40%] top-[38%] h-[360px] w-[360px] rounded-full blur-[150px]", t.glow3)} />
        </div>

        <div className="relative z-10 mx-auto max-w-[1520px] space-y-7 px-5 py-7 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className={cn("relative overflow-hidden rounded-[30px] border p-6 md:p-8", t.card)}
          >
            <div
              className="absolute left-0 right-0 top-0 h-[2px]"
              style={{
                background: "linear-gradient(90deg, transparent, #c8892a, transparent)",
              }}
            />

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex items-center gap-5">
                {theme === "dark" && (
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="hidden md:block"
                  >
                    <LanternMark size={78} glow />
                  </motion.div>
                )}

                <div>

                    <button
                      onClick={() => router.push("/dashboard")}
                      className={cn("mb-2.5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold", t.pill)}
                    >
                      <Store className="h-4 w-4" />
                      Dashboard
                    </button>


                  <h1 className={cn("serif text-[40px] font-normal leading-[0.95] md:text-[54px]", t.text)}>
                    Analytics
                    <span className={cn("ml-3 text-[18px] font-medium md:text-[24px]", t.textMuted)}>
                      / API Overview
                    </span>
                  </h1>

                  <p className={cn("mt-2 text-sm", t.textMuted)}>
                    Real POS receipts data မှ revenue, orders, products, transactions ကိုတွက်ပြထားပါတယ်။
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Segmented options={RANGES} value={range} onChange={setRange} theme={theme} />

                <Button
                  variant="outline"
                  className={cn("h-9 gap-1.5 rounded-xl text-[13px]", t.btn)}
                  onClick={() => {
                    const rows = filtered.map((tx) => ({
                      id: tx.id,
                      customer: tx.customer,
                      product: tx.product,
                      branch: tx.branch,
                      amount: tx.amount,
                      status: tx.status,
                      time: tx.time,
                    }));

                    const csv = [
                      ["ID", "Customer", "Product", "Branch", "Amount", "Status", "Time"],
                      ...rows.map((r) => [
                        r.id,
                        r.customer,
                        r.product,
                        r.branch,
                        String(r.amount),
                        r.status,
                        r.time,
                      ]),
                    ]
                      .map((row) =>
                        row
                          .map((cell) =>
                            /[",\n]/.test(cell)
                              ? `"${cell.replaceAll('"', '""')}"`
                              : cell,
                          )
                          .join(","),
                      )
                      .join("\n");

                    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "analytics-transactions.csv";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>

                <Button
                  variant="outline"
                  disabled={refreshing || loading}
                  onClick={() => void fetchReceipts(true)}
                  className={cn("h-9 gap-1.5 rounded-xl text-[13px]", t.btn)}
                >
                  {refreshing || loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Refresh
                </Button>

                <LanternToggle
                  dark={theme === "dark"}
                  onToggle={() => setTheme((th) => (th === "dark" ? "light" : "dark"))}
                />
              </div>
            </div>
          </motion.div>

          {error ? (
            <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-400">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <KpiCard
              theme={theme}
              label="Total Revenue"
              value={analytics.revenue}
              prefix="¥"
              change="+ Live"
              up
              icon={DollarSign}
              accentClass="bg-blue-500/20"
              barFrom="from-blue-400"
              barTo="to-cyan-400"
              delay={0}
            />

            <KpiCard
              theme={theme}
              label="Total Orders"
              value={analytics.orders}
              change="+ API"
              up
              icon={ShoppingBag}
              accentClass="bg-violet-500/20"
              barFrom="from-violet-400"
              barTo="to-fuchsia-400"
              delay={0.07}
            />

            <KpiCard
              theme={theme}
              label="Avg Order Value"
              value={analytics.avg}
              prefix="¥"
              change="+ Avg"
              up
              icon={Package}
              accentClass="bg-emerald-500/20"
              barFrom="from-emerald-400"
              barTo="to-teal-400"
              delay={0.14}
            />

            <KpiCard
              theme={theme}
              label="Refund Rate"
              value={analytics.refundRate}
              suffix="%"
              decimals={1}
              change={`${analytics.refunds}`}
              up={false}
              icon={Activity}
              accentClass="bg-rose-500/20"
              barFrom="from-rose-400"
              barTo="to-orange-400"
              delay={0.21}
            />
          </div>

          {loading ? (
            <Card theme={theme} className="p-10 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-500" />
              <div className={cn("mt-4 text-sm font-bold", t.textMuted)}>
                Loading analytics from receipts API...
              </div>
            </Card>
          ) : (
            <>
              <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <Card theme={theme} className="space-y-5 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className={cn("text-[17px] font-bold", t.text)}>Sales Trend</div>
                        <div className={cn("mt-0.5 text-[12px]", t.textMuted)}>
                          Receipts data · {range}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-block h-[3px] w-5 rounded-full bg-[#60a5fa]" />
                          <span className={cn("text-[10px] font-semibold", t.textSubtle)}>Current</span>
                        </div>

                        <button className={cn("flex h-8 w-8 items-center justify-center rounded-xl border", t.btn)}>
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {(["trend", "hourly"] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          className={cn(
                            "rounded-xl border px-3.5 py-2 text-[11px] font-bold transition-all",
                            activeTab === tab
                              ? theme === "dark"
                                ? "border-white/15 bg-white/12 text-[#f3e7d2]"
                                : "border-transparent bg-slate-900 text-white"
                              : cn("border-transparent", t.textMuted, "hover:border-current"),
                          )}
                        >
                          {tab === "trend" ? "Range Trend" : "Today / Hour"}
                        </button>
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {activeTab === "trend" ? (
                        <motion.div key="trend" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <GlowAreaChartCard
                            theme={theme}
                            data={salesTrend}
                            xKey="day"
                            yKey="sales"
                            name="Revenue"
                            accent="#60a5fa"
                            compareKey="prev"
                            compareName="Estimate Prev"
                            height={280}
                          />
                        </motion.div>
                      ) : (
                        <motion.div key="hourly" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <GlowBarChartCard
                            theme={theme}
                            data={hourlyFlow}
                            xKey="h"
                            yKey="v"
                            name="Sales"
                            accent="#a78bfa"
                            height={280}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>

                <div className="flex flex-col gap-6">
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
                    <Card theme={theme} className="space-y-4 p-6">
                      <div>
                        <div className={cn("text-[17px] font-bold", t.text)}>Category Mix</div>
                        <div className={cn("mt-0.5 text-[12px]", t.textMuted)}>
                          Revenue by item category
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="h-[140px] w-[140px] shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={categoryMix}
                                dataKey="value"
                                innerRadius={44}
                                outerRadius={65}
                                paddingAngle={3}
                                startAngle={90}
                                endAngle={-270}
                              >
                                {categoryMix.map((c, i) => (
                                  <Cell key={i} fill={c.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="flex-1 space-y-2.5">
                          {categoryMix.map((c) => (
                            <div key={c.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                                <span className={cn("text-[12px] font-medium", t.text)}>
                                  {c.name}
                                </span>
                              </div>
                              <span className={cn("text-[12px] font-bold", t.textMuted)}>
                                {c.value}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        {
                          label: "Active Branches",
                          value: String(branchData.length),
                          icon: Store,
                          color: "text-blue-400",
                        },
                        {
                          label: "Receipts",
                          value: String(analytics.orders),
                          icon: Users,
                          color: "text-emerald-400",
                        },
                        {
                          label: "Items Sold",
                          value: String(analytics.itemCount),
                          icon: Clock,
                          color: "text-amber-400",
                        },
                        {
                          label: "Products Sold",
                          value: String(topProducts.length),
                          icon: Package,
                          color: "text-violet-400",
                        },
                      ].map((s) => {
                        const Icon = s.icon;
                        return (
                          <Card key={s.label} theme={theme} className="flex flex-col gap-2 p-4">
                            <Icon className={cn("h-4 w-4", s.color)} />
                            <div className={cn("text-[22px] font-black", t.text)}>{s.value}</div>
                            <div className={cn("text-[11px] font-medium", t.textMuted)}>{s.label}</div>
                          </Card>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
                  <Card theme={theme} className="space-y-5 p-6">
                    <div>
                      <div className={cn("text-[17px] font-bold", t.text)}>Branch Performance</div>
                      <div className={cn("mt-0.5 text-[12px]", t.textMuted)}>
                        Revenue vs target — {range}
                      </div>
                    </div>

                    <div className="space-y-5">
                      {branchData.map((b, i) => (
                        <motion.div
                          key={b.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.38 + i * 0.07 }}
                        >
                          <div className="mb-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  "flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black",
                                  i === 0 ? "bg-amber-500/15 text-amber-500" : t.rankChip,
                                )}
                              >
                                {i === 0 ? <Star className="h-3.5 w-3.5" /> : i + 1}
                              </span>

                              <div>
                                <span className={cn("text-[13px] font-bold", t.text)}>{b.name}</span>
                                <span className={cn("ml-2 text-[11px]", t.textSubtle)}>
                                  ¥{b.target.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={cn("text-[13px] font-bold", t.text)}>
                                ¥{b.value.toLocaleString()}
                              </span>

                              <span
                                className={cn(
                                  "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold",
                                  b.pct >= 100
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "bg-amber-500/10 text-amber-500",
                                )}
                              >
                                {b.pct >= 100 ? (
                                  <TrendingUp className="h-2.5 w-2.5" />
                                ) : (
                                  <TrendingDown className="h-2.5 w-2.5" />
                                )}
                                {b.pct}%
                              </span>
                            </div>
                          </div>

                          <div className={cn("h-[6px] w-full overflow-hidden rounded-full", t.track)}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(b.pct, 100)}%` }}
                              transition={{ duration: 1, delay: 0.4 + i * 0.08, ease: "easeOut" }}
                              style={{
                                background: `linear-gradient(90deg,${b.color}99,${b.color})`,
                                boxShadow: `0 0 18px ${glowHex(b.color, "55")}`,
                              }}
                              className="h-full rounded-full"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
                  <Card theme={theme} className="space-y-5 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className={cn("text-[17px] font-bold", t.text)}>Top Products</div>
                        <div className={cn("mt-0.5 text-[12px]", t.textMuted)}>
                          By revenue — {range}
                        </div>
                      </div>

                      <button className={cn("flex items-center gap-1 rounded-xl border px-3 py-2 text-[11px] font-bold", t.btn)}>
                        View all <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      {topProducts.length ? (
                        topProducts.map((p, i) => (
                          <motion.div
                            key={`${p.rank}-${p.name}`}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.42 + i * 0.06 }}
                            className={cn(
                              "flex cursor-default items-center gap-3 rounded-xl px-3 py-3 transition-colors",
                              t.infoRow,
                              theme === "dark" ? "hover:bg-white/[0.06]" : "hover:bg-slate-100",
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black",
                                i === 0 ? "bg-amber-500/15 text-amber-500" : t.rankChip,
                              )}
                            >
                              {i === 0 ? <Star className="h-3.5 w-3.5" /> : p.rank}
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className={cn("truncate text-[13px] font-semibold", t.text)}>
                                {p.name}
                              </div>
                              <div className={cn("text-[11px]", t.textSubtle)}>
                                {p.sales} sold
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              <div className={cn("text-[13px] font-bold", t.text)}>
                                ¥{(p.revenue / 1000).toFixed(0)}k
                              </div>
                              <span className={cn("text-[10px] font-bold", p.trend === "up" ? "text-emerald-500" : "text-rose-500")}>
                                {p.trend === "up" ? "↑" : "↓"}
                              </span>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className={cn("py-10 text-center text-sm", t.textMuted)}>
                          Product item data မရှိသေးပါ။
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
                <Card theme={theme} className="space-y-5 p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className={cn("text-[17px] font-bold", t.text)}>Recent Transactions</div>
                      <div className={cn("mt-0.5 text-[12px]", t.textMuted)}>
                        {filtered.length} records
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <div className="relative flex-1 md:w-[280px]">
                        <Search className={cn("absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2", t.textSubtle)} />
                        <Input
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Customer, product, ID…"
                          className={cn("h-9 rounded-xl pl-9 text-[13px]", t.input)}
                        />
                      </div>

                      <button className={cn("flex h-9 items-center gap-1.5 rounded-xl border px-3.5 text-[13px] font-semibold", t.btn)}>
                        <Filter className="h-3.5 w-3.5" />
                        Filter
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                      <thead>
                        <tr className={cn("border-b", theme === "dark" ? "border-white/[0.055]" : "border-slate-100")}>
                          {[
                            ["ID", ""],
                            ["Customer", ""],
                            ["Product", ""],
                            ["Branch", ""],
                            ["Amount", "text-right"],
                            ["Status", ""],
                            ["Time", "text-right"],
                          ].map(([h, align]) => (
                            <th
                              key={h}
                              className={cn(
                                "pb-3 text-[10px] font-black uppercase tracking-widest",
                                align || "text-left",
                                t.tableHead,
                                h === "ID" ? "pr-3" : "px-3",
                              )}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <AnimatePresence mode="popLayout">
                        <tbody>
                          {filtered.map((tx, i) => (
                            <motion.tr
                              key={`${tx.id}-${i}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className={cn("cursor-default border-b transition-colors", t.tableRow)}
                            >
                              <td className={cn("py-3.5 pr-3 font-mono text-[11px] font-bold", t.textMuted)}>
                                {tx.id}
                              </td>
                              <td className={cn("px-3 py-3.5 text-[13px] font-semibold", t.text)}>
                                {tx.customer}
                              </td>
                              <td className={cn("px-3 py-3.5 text-[12px]", t.textMuted)}>
                                {tx.product}
                              </td>
                              <td className="px-3 py-3.5">
                                <span className={cn("rounded-lg border px-2.5 py-1 text-[11px] font-semibold", t.pill)}>
                                  {tx.branch}
                                </span>
                              </td>
                              <td className={cn("px-3 py-3.5 text-right text-[13px] font-black", t.text)}>
                                ¥{tx.amount.toLocaleString()}
                              </td>
                              <td className="px-3 py-3.5">
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold",
                                    tx.status === "completed"
                                      ? "bg-emerald-500/10 text-emerald-500"
                                      : tx.status === "pending"
                                        ? "bg-amber-500/10 text-amber-500"
                                        : "bg-rose-500/10 text-rose-500",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "h-1.5 w-1.5 rounded-full",
                                      tx.status === "completed"
                                        ? "bg-emerald-500"
                                        : tx.status === "pending"
                                          ? "bg-amber-500"
                                          : "bg-rose-500",
                                    )}
                                  />
                                  {tx.status}
                                </span>
                              </td>
                              <td className={cn("py-3.5 pl-3 text-right text-[11px]", t.textSubtle)}>
                                {tx.time} ago
                              </td>
                            </motion.tr>
                          ))}

                          {!filtered.length && (
                            <tr>
                              <td colSpan={7} className={cn("py-14 text-center text-sm", t.textMuted)}>
                                No transactions match your search.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </AnimatePresence>
                    </table>
                  </div>
                </Card>
              </motion.div>
            </>
          )}

          <div className={cn("flex items-center justify-between pb-3 text-[11px] font-semibold", t.textSubtle)}>
            <span>© 2026 BINHLAIG · Analytics Module</span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3 w-3" />
              API · Updated from backend
            </span>
          </div>
        </div>
      </div>
    </>
  );
}