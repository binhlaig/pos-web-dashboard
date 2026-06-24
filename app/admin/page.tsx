


// "use client";

// import * as React from "react";
// import { motion } from "framer-motion";
// import CountUp from "react-countup";
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import type { TooltipProps } from "recharts";
// import {
//   Sparkles,
//   Search,
//   Bell,
//   Sun,
//   Moon,
//   CalendarDays,
//   ArrowUpRight,
//   ArrowDownRight,
//   DollarSign,
//   ShoppingCart,
//   Wallet,
//   CreditCard,
//   MoreHorizontal,
//   Bot,
//   Store,
//   Package,
//   Users,
//   Activity,
//   Download,
//   Plus,
//   ChevronRight,
//   LayoutDashboard,
//   BarChart3,
//   Receipt,
//   Boxes,
//   Settings,
//   PanelLeftClose,
//   PanelLeftOpen,
//   LineChart as LineChartIcon,
//   ShieldCheck,
//   Clock3,
//   BadgeDollarSign,
//   User2,
//   TrendingUp,
//   Zap,
// } from "lucide-react";

// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import {
//   Tabs,
//   TabsList,
//   TabsTrigger,
//   TabsContent,
// } from "@/components/ui/tabs";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Separator } from "@/components/ui/separator";
// import { Skeleton } from "@/components/ui/skeleton";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { useRouter } from "next/navigation";

// type ThemeMode = "dark" | "light";




// const revenueData = [
//   { name: "Jan", revenue: 1200, profit: 400 },
//   { name: "Feb", revenue: 1800, profit: 610 },
//   { name: "Mar", revenue: 1600, profit: 540 },
//   { name: "Apr", revenue: 2400, profit: 830 },
//   { name: "May", revenue: 2100, profit: 760 },
//   { name: "Jun", revenue: 2800, profit: 1060 },
//   { name: "Jul", revenue: 3200, profit: 1320 },
//   { name: "Aug", revenue: 3600, profit: 1510 },
// ];

// const categoryData = [
//   { name: "Food", value: 38 },
//   { name: "Drink", value: 24 },
//   { name: "Snacks", value: 18 },
//   { name: "Household", value: 12 },
//   { name: "Other", value: 8 },
// ];

// const shopData = [
//   { name: "Main Branch", value: 86 },
//   { name: "Branch A", value: 72 },
//   { name: "Branch B", value: 61 },
//   { name: "Online Shop", value: 49 },
// ];

// const transactions = [
//   {
//     id: "TXN-1001",
//     customer: "Aung Aung",
//     type: "Paid",
//     amount: 12400,
//     shop: "Main Branch",
//     time: "2 min ago",
//   },
//   {
//     id: "TXN-1002",
//     customer: "Su Su",
//     type: "Pending",
//     amount: 8200,
//     shop: "Branch A",
//     time: "6 min ago",
//   },
//   {
//     id: "TXN-1003",
//     customer: "Ko Ko",
//     type: "Refund",
//     amount: 3900,
//     shop: "Online Shop",
//     time: "10 min ago",
//   },
//   {
//     id: "TXN-1004",
//     customer: "Moe Thidar",
//     type: "Paid",
//     amount: 19000,
//     shop: "Main Branch",
//     time: "15 min ago",
//   },
//   {
//     id: "TXN-1005",
//     customer: "Hla Hla",
//     type: "Paid",
//     amount: 6700,
//     shop: "Branch B",
//     time: "26 min ago",
//   },
// ];

// const quickActions = [
//   { label: "Create Order", icon: ShoppingCart, color: "from-blue-500/20 to-blue-600/10", iconColor: "text-blue-600 dark:text-blue-400" },
//   { label: "Add Product", icon: Package, color: "from-violet-500/20 to-violet-600/10", iconColor: "text-violet-600 dark:text-violet-400" },
//   { label: "Customers", icon: Users, color: "from-emerald-500/20 to-emerald-600/10", iconColor: "text-emerald-600 dark:text-emerald-400" },
//   { label: "Reports", icon: Activity, color: "from-amber-500/20 to-amber-600/10", iconColor: "text-amber-600 dark:text-amber-400" },
//   { label: "Shops", icon: Store, color: "from-cyan-500/20 to-cyan-600/10", iconColor: "text-cyan-600 dark:text-cyan-400" },
//   { label: "Export", icon: Download, color: "from-rose-500/20 to-rose-600/10", iconColor: "text-rose-600 dark:text-rose-400" },
// ];

// const sidebarItems = [
//   { label: "Dashboard", icon: LayoutDashboard, active: true },
//   { label: "Analytics", icon: BarChart3 },
//   { label: "Orders", icon: Receipt },
//   { label: "Inventory", icon: Boxes },
//   { label: "Branches", icon: Store },
//   { label: "Customers", icon: Users },
//   { label: "Settings", icon: Settings },
// ];

// function money(n: number) {
//   return `¥${n.toLocaleString()}`;
// }

// // ─── THEME TOKENS ─────────────────────────────────────────────────────────────
// function t(theme: ThemeMode) {
//   if (theme === "dark") {
//     return {
//       root: "bg-[#050812] text-white",
//       text: "text-white",
//       textMuted: "text-white/55",
//       textSubtle: "text-white/40",
//       card: "border-white/[0.08] bg-white/[0.055] backdrop-blur-2xl shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_16px_40px_rgba(0,0,0,0.25)]",
//       cardSolid: "border-white/[0.08] bg-[#0d1117]",
//       input: "border-white/[0.12] bg-white/[0.07] text-white placeholder:text-white/35 focus:border-white/25",
//       outlineBtn: "border-white/[0.12] bg-white/[0.06] text-white hover:bg-white/[0.10] hover:border-white/20",
//       badge: "border-white/[0.12] bg-white/[0.07] text-white/80",
//       separator: "bg-white/[0.08]",
//       sidebar: "border-white/[0.07] bg-[#07090f]/90 backdrop-blur-3xl",
//       navbar: "border-white/[0.08] bg-white/[0.055] backdrop-blur-2xl",
//       soft: "border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07]",
//       softStrong: "border-white/[0.10] bg-white/[0.07]",
//       grid: "[background-image:linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:36px_36px]",
//       tableHead: "text-white/50",
//       tableRow: "border-white/[0.05] hover:bg-white/[0.04]",
//       tableRowBorder: "border-white/[0.05]",
//       progressTrack: "bg-white/[0.07]",
//       navActive: "border-white/[0.10] bg-white/[0.09] text-white shadow-none",
//       navInactive: "border-transparent text-white/55 hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-white/90",
//     };
//   }

//   return {
//     root: "bg-[#f0f4fb] text-slate-900",
//     text: "text-slate-900",
//     textMuted: "text-slate-500",
//     textSubtle: "text-slate-400",
//     card: "border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-[0_1px_0_0_rgba(255,255,255,0.9)_inset,0_4px_24px_rgba(15,23,42,0.07)]",
//     cardSolid: "border-slate-200 bg-white",
//     input: "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-400 shadow-sm",
//     outlineBtn: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm",
//     badge: "border-slate-300 bg-white text-slate-700 shadow-sm",
//     separator: "bg-slate-200",
//     sidebar: "border-slate-200/80 bg-white/95 backdrop-blur-2xl shadow-[4px_0_24px_rgba(15,23,42,0.06)]",
//     navbar: "border-slate-200/80 bg-white/90 backdrop-blur-2xl shadow-[0_4px_20px_rgba(15,23,42,0.07)]",
//     soft: "border-slate-200 bg-white hover:bg-slate-50 shadow-sm",
//     softStrong: "border-slate-200 bg-slate-50/80",
//     grid: "[background-image:linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:36px_36px]",
//     tableHead: "text-slate-500",
//     tableRow: "border-slate-100 hover:bg-slate-50/80",
//     tableRowBorder: "border-slate-100",
//     progressTrack: "bg-slate-100",
//     navActive: "border-blue-100 bg-blue-50 text-blue-700 shadow-sm",
//     navInactive: "border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800",
//   };
// }

// // ─── BACKGROUND ───────────────────────────────────────────────────────────────
// function BackgroundFX({ theme }: { theme: ThemeMode }) {
//   if (theme === "dark") {
//     return (
//       <div className="pointer-events-none absolute inset-0 overflow-hidden">
//         <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]" />
//         <div className="absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-blue-600/[0.07] blur-[120px]" />
//         <div className="absolute -right-40 top-[15%] h-[500px] w-[500px] rounded-full bg-violet-600/[0.08] blur-[120px]" />
//         <div className="absolute bottom-0 left-[30%] h-[400px] w-[400px] rounded-full bg-emerald-600/[0.06] blur-[100px]" />
//       </div>
//     );
//   }
//   return (
//     <div className="pointer-events-none absolute inset-0 overflow-hidden">
//       <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_60%_-10%,rgba(59,130,246,0.08),transparent)]" />
//       <div className="absolute -left-20 top-0 h-[500px] w-[500px] rounded-full bg-sky-300/20 blur-[100px]" />
//       <div className="absolute -right-20 top-[20%] h-[400px] w-[400px] rounded-full bg-violet-300/15 blur-[100px]" />
//       <div className="absolute bottom-[10%] left-[25%] h-[350px] w-[350px] rounded-full bg-emerald-300/15 blur-[90px]" />
//     </div>
//   );
// }

// // ─── CARD WRAPPER ─────────────────────────────────────────────────────────────
// function SectionCard({ children, className, theme }: { children: React.ReactNode; className?: string; theme: ThemeMode }) {
//   const tk = t(theme);
//   return (
//     <Card className={cn(tk.card, "rounded-[24px]", className)}>
//       {children}
//     </Card>
//   );
// }

// // ─── SKELETON ─────────────────────────────────────────────────────────────────
// function DashboardSkeleton({ theme }: { theme: ThemeMode }) {
//   const tk = t(theme);
//   return (
//     <div className="space-y-6">
//       <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
//         {Array.from({ length: 4 }).map((_, i) => (
//           <Card key={i} className={tk.card}><CardContent className="p-6"><Skeleton className="h-4 w-24" /><Skeleton className="mt-4 h-8 w-32" /><Skeleton className="mt-4 h-4 w-28" /></CardContent></Card>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─── ANALYTICS STRIP ──────────────────────────────────────────────────────────
// function AnalyticsStrip({ theme }: { theme: ThemeMode }) {
//   const tk = t(theme);
//   const items = [
//     { label: "Live Sales", value: "¥128,400", icon: BadgeDollarSign, accent: theme === "dark" ? "text-emerald-400" : "text-emerald-600", bg: theme === "dark" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-200" },
//     { label: "Open Orders", value: "248", icon: ShoppingCart, accent: theme === "dark" ? "text-blue-400" : "text-blue-600", bg: theme === "dark" ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-200" },
//     { label: "Active Users", value: "1,240", icon: Users, accent: theme === "dark" ? "text-violet-400" : "text-violet-600", bg: theme === "dark" ? "bg-violet-500/10 border-violet-500/20" : "bg-violet-50 border-violet-200" },
//     { label: "System Uptime", value: "99.98%", icon: ShieldCheck, accent: theme === "dark" ? "text-cyan-400" : "text-cyan-600", bg: theme === "dark" ? "bg-cyan-500/10 border-cyan-500/20" : "bg-cyan-50 border-cyan-200" },
//   ];

//   return (
//     <div className="hidden xl:grid xl:grid-cols-4 xl:gap-4">
//       {items.map((item) => {
//         const Icon = item.icon;
//         return (
//           <motion.div
//             key={item.label}
//             whileHover={{ y: -2, scale: 1.01 }}
//             className={cn("relative overflow-hidden rounded-2xl border p-4 transition-all", tk.soft)}
//           >
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className={cn("text-xs font-medium", tk.textMuted)}>{item.label}</div>
//                 <div className={cn("mt-1.5 text-xl font-bold 2xl:text-2xl", tk.text)}>{item.value}</div>
//               </div>
//               <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border", item.bg)}>
//                 <Icon className={cn("h-5 w-5", item.accent)} />
//               </div>
//             </div>
//           </motion.div>
//         );
//       })}
//     </div>
//   );
// }

// // ─── TOOLTIP ──────────────────────────────────────────────────────────────────
// function CustomTooltip({ active, payload, label, theme }: TooltipProps<number, string> & { theme: ThemeMode }) {
//   if (!active || !payload || payload.length === 0) return null;
//   return (
//     <div className={cn("min-w-[180px] rounded-2xl border px-4 py-3 shadow-2xl", theme === "dark" ? "border-white/10 bg-[#0d1117]/98 text-white" : "border-slate-200 bg-white text-slate-900 shadow-[0_8px_30px_rgba(15,23,42,0.12)]")}>
//       <div className={cn("mb-2 text-xs font-medium", theme === "dark" ? "text-white/50" : "text-slate-400")}>{label}</div>
//       <div className="space-y-2">
//         {payload.map((entry, idx) => (
//           <div key={idx} className="flex items-center justify-between gap-4 text-sm">
//             <div className="flex items-center gap-2">
//               <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: String(entry.color || "#8884d8") }} />
//               <span className={theme === "dark" ? "text-white/60" : "text-slate-500"}>{entry.name}</span>
//             </div>
//             <span className={cn("font-semibold", theme === "dark" ? "text-white" : "text-slate-900")}>{money(Number(entry.value ?? 0))}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─── LEGEND CHIP ─────────────────────────────────────────────────────────────
// function LegendChip({ theme, label, color }: { theme: ThemeMode; label: string; color: string }) {
//   return (
//     <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium", theme === "dark" ? "border-white/10 bg-white/[0.06] text-white/70" : "border-slate-200 bg-white text-slate-600 shadow-sm")}>
//       <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
//       <span>{label}</span>
//     </div>
//   );
// }

// // ─── STAT CARD ────────────────────────────────────────────────────────────────
// function AnimatedStatCard({ theme, title, value, prefix = "", suffix = "", decimals = 0, change, positive, icon: Icon, sub, gradient }: {
//   theme: ThemeMode; title: string; value: number; prefix?: string; suffix?: string;
//   decimals?: number; change: string; positive: boolean;
//   icon: React.ComponentType<{ className?: string }>; sub: string; gradient: string;
// }) {
//   return (
//     <motion.div whileHover={{ y: -5, scale: 1.015 }} transition={{ duration: 0.2, ease: "easeOut" }}>
//       <Card className={cn("relative overflow-hidden rounded-[24px] border text-white shadow-[0_20px_60px_rgba(0,0,0,0.3)]", theme === "dark" ? "border-white/[0.07]" : "border-transparent")}>
//         <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
//         <div className="absolute -right-6 -top-6 h-36 w-36 rounded-full bg-white/[0.07] blur-2xl" />
//         <div className="absolute -bottom-8 -left-4 h-32 w-32 rounded-full bg-black/20 blur-2xl" />
//         <div className="relative">
//           <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 pt-5 px-5">
//             <div>
//               <CardDescription className="text-white/65 text-xs font-medium uppercase tracking-wider">{title}</CardDescription>
//               <CardTitle className="mt-2 text-2xl font-bold tracking-tight 2xl:text-[28px]">
//                 {prefix}
//                 <CountUp end={value} duration={1.5} decimals={decimals} separator="," />
//                 {suffix}
//               </CardTitle>
//             </div>
//             <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur">
//               <Icon className="h-5 w-5" />
//             </div>
//           </CardHeader>
//           <CardContent className="px-5 pb-5">
//             <div className="flex items-center gap-2 text-sm">
//               <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", positive ? "bg-white/20 text-white" : "bg-black/20 text-white/90")}>
//                 {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
//                 {change}
//               </span>
//               <span className="text-white/60 text-xs">{sub}</span>
//             </div>
//           </CardContent>
//         </div>
//       </Card>
//     </motion.div>
//   );
// }

// // ─── MINI METRIC ─────────────────────────────────────────────────────────────
// function MiniMetric({ theme, label, value, icon: Icon }: { theme: ThemeMode; label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
//   const tk = t(theme);
//   return (
//     <div className={cn("rounded-2xl border p-4", theme === "dark" ? "border-white/[0.08] bg-white/[0.06]" : "border-slate-200 bg-white shadow-sm")}>
//       <div className="flex items-center justify-between">
//         <div className={cn("text-xs font-medium", tk.textMuted)}>{label}</div>
//         <Icon className={cn("h-4 w-4", tk.textMuted)} />
//       </div>
//       <div className={cn("mt-2 text-2xl font-bold", tk.text)}>{value}</div>
//     </div>
//   );
// }

// // ─── SIDEBAR ─────────────────────────────────────────────────────────────────
// function DesktopSidebar({ theme, collapsed }: { theme: ThemeMode; collapsed: boolean }) {
//   const tk = t(theme);
//   return (
//     <aside className={cn("fixed left-0 top-0 z-30 hidden h-screen border-r xl:flex xl:flex-col transition-all duration-300", tk.sidebar, collapsed ? "w-[88px]" : "w-[264px]")}>
//       {/* Logo */}
//       <div className={cn("flex items-center gap-3 px-5 py-6", collapsed && "justify-center px-0")}>
//         <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-500 text-white shadow-lg shadow-blue-500/25">
//           <Sparkles className="h-5 w-5" />
//         </div>
//         {!collapsed && (
//           <div>
//             <div className={cn("text-sm font-bold tracking-widest uppercase", tk.text)}>BINHLAIG</div>
//             <div className={cn("text-[10px] font-medium", tk.textMuted)}>Premium Admin</div>
//           </div>
//         )}
//       </div>

//       {/* Workspace badge */}
//       {!collapsed && (
//         <div className="px-4 mb-2">
//           <div className={cn("rounded-xl border px-3.5 py-2.5", theme === "dark" ? "border-white/[0.07] bg-white/[0.04]" : "border-slate-200 bg-slate-50")}>
//             <div className={cn("text-[10px] font-semibold uppercase tracking-widest", tk.textSubtle)}>Workspace</div>
//             <div className={cn("mt-0.5 text-sm font-semibold", tk.text)}>Main Operations</div>
//           </div>
//         </div>
//       )}

//       {/* Nav */}
//       <nav className="mt-3 flex-1 space-y-1 px-3">
//         {sidebarItems.map((item) => {
//           const Icon = item.icon;
//           return (
//             <button
//               key={item.label}
//               className={cn(
//                 "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-150",
//                 item.active ? tk.navActive : tk.navInactive,
//                 collapsed && "justify-center px-0"
//               )}
//             >
//               <Icon className="h-[18px] w-[18px] shrink-0" />
//               {!collapsed && <span className={cn("text-[13px] font-medium")}>{item.label}</span>}
//             </button>
//           );
//         })}
//       </nav>

//       {/* User */}
//       <div className="p-3">
//         <div className={cn("rounded-xl border p-3", theme === "dark" ? "border-white/[0.07] bg-white/[0.04]" : "border-slate-200 bg-slate-50")}>
//           <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
//             <Avatar className="h-9 w-9 ring-2 ring-offset-1 ring-blue-500/30">
//               <AvatarImage src="" />
//               <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-blue-500 to-violet-600 text-white">SA</AvatarFallback>
//             </Avatar>
//             {!collapsed && (
//               <div>
//                 <div className={cn("text-[13px] font-semibold", tk.text)}>Sai Aung</div>
//                 <div className={cn("text-[10px] font-semibold uppercase tracking-wider", tk.textSubtle)}>Admin</div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }

// // ─── MAIN ─────────────────────────────────────────────────────────────────────
// export default function DashboardPage() {
//   const [theme, setTheme] = React.useState<ThemeMode>("dark");
//   const [loading, setLoading] = React.useState(true);
//   const [range, setRange] = React.useState("30d");
//   const [txFilter, setTxFilter] = React.useState("all");
//   const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

//   const router = useRouter();

//   React.useEffect(() => {
//     const savedTheme = localStorage.getItem("binhlaig-theme") as ThemeMode | null;
//     const savedSidebar = localStorage.getItem("binhlaig-sidebar");
//     if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
//     if (savedSidebar === "true") setSidebarCollapsed(true);
//     const timer = setTimeout(() => setLoading(false), 900);
//     return () => clearTimeout(timer);
//   }, []);

//   React.useEffect(() => { localStorage.setItem("binhlaig-theme", theme); }, [theme]);
//   React.useEffect(() => { localStorage.setItem("binhlaig-sidebar", String(sidebarCollapsed)); }, [sidebarCollapsed]);

//   const tk = t(theme);
//   const filteredTransactions = React.useMemo(() => txFilter === "all" ? transactions : transactions.filter((x) => x.type.toLowerCase() === txFilter), [txFilter]);
//   const mainOffset = sidebarCollapsed ? "xl:pl-[108px]" : "xl:pl-[284px]";

//   return (
//     <div className={cn("relative min-h-screen overflow-hidden transition-colors duration-300", tk.root)}>
//       <BackgroundFX theme={theme} />
//       <div className={cn("pointer-events-none absolute inset-0 opacity-60", tk.grid)} />
//       <DesktopSidebar theme={theme} collapsed={sidebarCollapsed} />

//       <div className={cn("relative z-10", mainOffset)}>
//         {/* NAVBAR */}
//         <div className="sticky top-0 z-20 px-4 pt-4 md:px-6 xl:px-8">
//           <div className={cn("mx-auto flex max-w-[1850px] items-center justify-between gap-3 rounded-[20px] border px-4 py-2.5", tk.navbar)}>
//             <div className="flex items-center gap-3">
//               <Button variant="outline" size="icon" className={cn("hidden xl:inline-flex h-9 w-9 rounded-xl", tk.outlineBtn)} onClick={() => setSidebarCollapsed((p) => !p)}>
//                 {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
//               </Button>
//               <div className="xl:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-500 text-white">
//                 <Sparkles className="h-4 w-4" />
//               </div>
//               <div>
//                 <div className={cn("text-sm font-bold", tk.text)}>BINHLAIG Dashboard</div>
//                 <div className={cn("text-[11px]", tk.textMuted)}>Premium analytics workspace</div>
//               </div>
//             </div>

//             <div className="hidden min-w-[260px] flex-1 px-3 md:block xl:max-w-[400px]">
//               <div className="relative">
//                 <Search className={cn("absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2", tk.textSubtle)} />
//                 <Input placeholder="Search products, orders, customers..." className={cn("h-9 rounded-xl pl-9 text-sm", tk.input)} />
//               </div>
//             </div>

//             <div className="flex items-center gap-2">
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="outline" className={cn("h-9 rounded-xl text-sm gap-1.5", tk.outlineBtn)}>
//                     <CalendarDays className="h-3.5 w-3.5" />
//                     {range === "7d" ? "7 days" : range === "30d" ? "30 days" : "90 days"}
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                   <DropdownMenuItem onClick={() => setRange("7d")}>Last 7 days</DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => setRange("30d")}>Last 30 days</DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => setRange("90d")}>Last 90 days</DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>

//               <Button variant="outline" size="icon" className={cn("h-9 w-9 rounded-xl", tk.outlineBtn)} onClick={() => setTheme((p) => (p === "dark" ? "light" : "dark"))}>
//                 {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//               </Button>

//               <Button variant="outline" size="icon" className={cn("h-9 w-9 rounded-xl", tk.outlineBtn)}>
//                 <Bell className="h-4 w-4" />
//               </Button>

//               <Button className={cn("h-9 rounded-xl text-sm gap-1.5 font-semibold shadow-lg", theme === "dark" ? "bg-white text-black hover:bg-white/90 shadow-white/10" : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20")}>
//                 <Plus className="h-4 w-4" />
//                 New Order
//               </Button>
//             </div>
//           </div>
//         </div>

//         {/* MAIN CONTENT */}
//         <div className="mx-auto w-full max-w-[1850px] px-4 py-6 md:px-6 xl:px-8 2xl:py-8">
//           {/* Header */}
//           <div className="mb-7">
//             <div className={cn("mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium", tk.badge)}>
//               <Zap className="h-3 w-3" />
//               Desktop optimized · 15-inch wide layout
//             </div>
//             <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
//               <div>
//                 <h1 className={cn("text-3xl font-bold tracking-tight md:text-4xl", tk.text)}>
//                   Welcome back 👋
//                 </h1>
//                 <p className={cn("mt-2 max-w-2xl text-sm leading-relaxed", tk.textMuted)}>
//                   Real-time POS analytics, branch performance, and team activity — all in one premium workspace.
//                 </p>
//               </div>
//               <div className="hidden xl:flex items-center gap-2">
//                 <div className={cn("flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium", tk.badge)}>
//                   <Clock3 className="h-3.5 w-3.5" />
//                   Last sync 2 min ago
//                 </div>
//                 <div className={cn("flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium", tk.badge)}>
//                   <User2 className="h-3.5 w-3.5" />
//                   Admin session active
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Analytics strip */}
//           <div className="mb-6 2xl:mb-7">
//             <AnalyticsStrip theme={theme} />
//           </div>

//           {/* Hero Panel */}
//           <SectionCard theme={theme} className="mb-6 overflow-hidden 2xl:mb-7">
//             <CardContent className="relative p-0">
//               <div className={cn("absolute inset-0", theme === "dark" ? "bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.12),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.10),transparent_45%)]" : "bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.06),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.05),transparent_45%)]")} />
//               <div className="relative grid gap-6 p-6 md:p-7 xl:grid-cols-[1.3fr_0.7fr] 2xl:gap-8 2xl:p-8">
//                 <div className="flex flex-col justify-between">
//                   <div>
//                     <div className={cn("mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold", theme === "dark" ? "border-blue-500/30 bg-blue-500/10 text-blue-400" : "border-blue-200 bg-blue-50 text-blue-600")}>
//                       <TrendingUp className="h-3 w-3" />
//                       Live business overview
//                     </div>
//                     <h2 className={cn("max-w-3xl text-2xl font-bold leading-tight md:text-[34px] 2xl:text-[42px]", tk.text)}>
//                       Beautiful analytics for your POS, sales, branches and team performance.
//                     </h2>
//                     <p className={cn("mt-4 max-w-2xl text-sm leading-relaxed md:text-[15px]", tk.textMuted)}>
//                       Premium, interactive, production-ready. Optimized for wide displays and modern admin workspaces.
//                     </p>
//                     <div className="mt-6 flex flex-wrap gap-3">
//                       <Button className={cn("rounded-xl gap-2 font-semibold shadow-lg", theme === "dark" ? "bg-white text-black hover:bg-white/90 shadow-white/10" : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20")}>
//                         <Download className="h-4 w-4" />
//                         Export Report
//                       </Button>
//                       <Button
//                         variant="outline"
//                         className={cn("rounded-xl gap-2", tk.outlineBtn)}
//                         onClick={() => router.push("/analytics")}
//                       >
//                         <ChevronRight className="h-4 w-4" />
//                         Open Analytics
//                       </Button>
//                     </div>
//                   </div>

//                   <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
//                     {[
//                       { label: "System Uptime", value: "99.98%", icon: ShieldCheck },
//                       { label: "Active Branches", value: "04", icon: Store },
//                       { label: "Growth", value: "+18.2%", icon: LineChartIcon },
//                       { label: "Live Panels", value: "12", icon: Activity },
//                     ].map((item) => {
//                       const Icon = item.icon;
//                       return (
//                         <div key={item.label} className={cn("rounded-xl border px-4 py-3", theme === "dark" ? "border-white/[0.07] bg-white/[0.04]" : "border-slate-200 bg-slate-50")}>
//                           <div className="flex items-center justify-between mb-1.5">
//                             <span className={cn("text-[11px] font-medium", tk.textMuted)}>{item.label}</span>
//                             <Icon className={cn("h-3.5 w-3.5", tk.textSubtle)} />
//                           </div>
//                           <div className={cn("text-lg font-bold", tk.text)}>{item.value}</div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 <div className="grid gap-4 content-start">
//                   <motion.div whileHover={{ y: -3 }} className={cn("rounded-2xl border p-5", theme === "dark" ? "border-white/[0.08] bg-gradient-to-br from-white/[0.08] to-white/[0.03]" : "border-slate-200 bg-white shadow-sm")}>
//                     <div className="flex items-center justify-between mb-4">
//                       <div className={cn("text-sm font-medium", tk.textMuted)}>Today Revenue</div>
//                       <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", theme === "dark" ? "bg-emerald-500/15" : "bg-emerald-50")}>
//                         <DollarSign className="h-4 w-4 text-emerald-500" />
//                       </div>
//                     </div>
//                     <div className={cn("text-3xl font-bold 2xl:text-4xl", tk.text)}>
//                       ¥<CountUp end={128400} duration={1.4} separator="," />
//                     </div>
//                     <div className="mt-2 flex items-center gap-1.5 text-sm text-emerald-500 font-medium">
//                       <ArrowUpRight className="h-4 w-4" />
//                       +18.2% from yesterday
//                     </div>
//                     <div className={cn("mt-4 h-1.5 w-full overflow-hidden rounded-full", theme === "dark" ? "bg-white/10" : "bg-slate-100")}>
//                       <motion.div initial={{ width: 0 }} animate={{ width: "74%" }} transition={{ duration: 1, delay: 0.5 }} className="h-full rounded-full bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400" />
//                     </div>
//                     <div className={cn("mt-2 flex justify-between text-[11px] font-medium", tk.textSubtle)}>
//                       <span>0%</span><span>Target: 74%</span><span>100%</span>
//                     </div>
//                   </motion.div>

//                   <div className="grid grid-cols-2 gap-3">
//                     <MiniMetric theme={theme} label="Orders" value="248" icon={ShoppingCart} />
//                     <MiniMetric theme={theme} label="Customers" value="1,240" icon={Users} />
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </SectionCard>

//           {loading ? (
//             <DashboardSkeleton theme={theme} />
//           ) : (
//             <>
//               {/* KPI CARDS */}
//               <div className="mb-6 grid gap-4 md:grid-cols-2 2xl:mb-7 2xl:grid-cols-4 2xl:gap-5">
//                 <AnimatedStatCard theme={theme} title="Total Revenue" value={1284000} prefix="¥" change="+12.5%" positive icon={DollarSign} sub="vs last month" gradient="from-[#0a1628] via-[#1e40af] to-[#0284c7]" />
//                 <AnimatedStatCard theme={theme} title="Net Profit" value={428300} prefix="¥" change="+8.2%" positive icon={Wallet} sub="Stable growth" gradient="from-[#022c22] via-[#065f46] to-[#059669]" />
//                 <AnimatedStatCard theme={theme} title="Total Orders" value={2480} change="+16.1%" positive icon={ShoppingCart} sub="Completed orders" gradient="from-[#1e1b4b] via-[#5b21b6] to-[#9333ea]" />
//                 <AnimatedStatCard theme={theme} title="Refunds" value={24200} prefix="¥" change="-3.4%" positive={false} icon={CreditCard} sub="Needs review" gradient="from-[#450a0a] via-[#991b1b] to-[#ef4444]" />
//               </div>

//               {/* CHARTS + SIDE */}
//               <div className="grid gap-6 2xl:grid-cols-14 2xl:gap-7">
//                 <div className="space-y-6 2xl:col-span-9">
//                   {/* Revenue Chart */}
//                   <SectionCard theme={theme}>
//                     <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-4">
//                       <div>
//                         <CardTitle className={cn("text-[18px] font-bold", tk.text)}>Revenue Overview</CardTitle>
//                         <CardDescription className={cn("text-sm mt-0.5", tk.textMuted)}>Revenue and profit trend</CardDescription>
//                       </div>
//                       <div className="flex flex-wrap items-center gap-2">
//                         <LegendChip theme={theme} label="Revenue" color="#60a5fa" />
//                         <LegendChip theme={theme} label="Profit" color="#34d399" />
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="h-[320px] w-full 2xl:h-[380px]">
//                         <ResponsiveContainer width="100%" height="100%">
//                           <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
//                             <defs>
//                               <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
//                                 <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
//                                 <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.01} />
//                               </linearGradient>
//                               <linearGradient id="profFill" x1="0" y1="0" x2="0" y2="1">
//                                 <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
//                                 <stop offset="95%" stopColor="#34d399" stopOpacity={0.01} />
//                               </linearGradient>
//                             </defs>
//                             <CartesianGrid stroke={theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.07)"} vertical={false} strokeDasharray="4 4" />
//                             <XAxis dataKey="name" tick={{ fill: theme === "dark" ? "rgba(255,255,255,0.45)" : "rgba(71,85,105,0.9)", fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
//                             <YAxis tick={{ fill: theme === "dark" ? "rgba(255,255,255,0.45)" : "rgba(71,85,105,0.9)", fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
//                             <Tooltip content={<CustomTooltip theme={theme} />} />
//                             <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#60a5fa" fill="url(#revFill)" strokeWidth={2.5} dot={false} />
//                             <Area type="monotone" dataKey="profit" name="Profit" stroke="#34d399" fill="url(#profFill)" strokeWidth={2} dot={false} />
//                           </AreaChart>
//                         </ResponsiveContainer>
//                       </div>
//                     </CardContent>
//                   </SectionCard>

//                   {/* Shops + Quick Actions */}
//                   <div className="grid gap-6 xl:grid-cols-2">
//                     <SectionCard theme={theme}>
//                       <CardHeader>
//                         <CardTitle className={cn("text-[17px] font-bold", tk.text)}>Top Shops</CardTitle>
//                         <CardDescription className={cn("text-sm", tk.textMuted)}>Branch performance ranking</CardDescription>
//                       </CardHeader>
//                       <CardContent className="space-y-5">
//                         {shopData.map((shop, i) => (
//                           <div key={shop.name}>
//                             <div className="mb-2.5 flex items-center justify-between">
//                               <div className="flex items-center gap-2.5">
//                                 <span className={cn("flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-bold", theme === "dark" ? "bg-white/10 text-white/70" : "bg-slate-100 text-slate-500")}>{i + 1}</span>
//                                 <span className={cn("text-sm font-semibold", tk.text)}>{shop.name}</span>
//                               </div>
//                               <span className={cn("text-sm font-bold", tk.text)}>{shop.value}%</span>
//                             </div>
//                             <div className={cn("h-2 w-full overflow-hidden rounded-full", tk.progressTrack)}>
//                               <motion.div initial={{ width: 0 }} animate={{ width: `${shop.value}%` }} transition={{ duration: 0.9, delay: i * 0.1 }}
//                                 className={cn("h-full rounded-full", theme === "dark" ? "bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400" : "bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500")}
//                               />
//                             </div>
//                           </div>
//                         ))}
//                       </CardContent>
//                     </SectionCard>

//                     <SectionCard theme={theme}>
//                       <CardHeader>
//                         <CardTitle className={cn("text-[17px] font-bold", tk.text)}>Quick Actions</CardTitle>
//                         <CardDescription className={cn("text-sm", tk.textMuted)}>Fast access to common modules</CardDescription>
//                       </CardHeader>
//                       <CardContent className="grid grid-cols-2 gap-3 2xl:grid-cols-3">
//                         {quickActions.map((item) => {
//                           const Icon = item.icon;
//                           return (
//                             <motion.button whileHover={{ y: -3, scale: 1.02 }} key={item.label}
//                               className={cn("rounded-xl border p-4 text-left transition-all", theme === "dark" ? "border-white/[0.07] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.12]" : "border-slate-200 bg-white hover:bg-slate-50 hover:shadow-md shadow-sm")}
//                             >
//                               <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-gradient-to-br", item.color, theme === "dark" ? "border-white/10" : "border-transparent")}>
//                                 <Icon className={cn("h-4.5 w-4.5", item.iconColor)} />
//                               </div>
//                               <div className={cn("mt-3 text-[13px] font-semibold", tk.text)}>{item.label}</div>
//                               <div className={cn("mt-0.5 text-[11px]", tk.textSubtle)}>Open module</div>
//                             </motion.button>
//                           );
//                         })}
//                       </CardContent>
//                     </SectionCard>
//                   </div>

//                   {/* Transactions */}
//                   <SectionCard theme={theme}>
//                     <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//                       <div>
//                         <CardTitle className={cn("text-[17px] font-bold", tk.text)}>Recent Transactions</CardTitle>
//                         <CardDescription className={cn("text-sm", tk.textMuted)}>Filtered list of latest activities</CardDescription>
//                       </div>
//                       <Tabs value={txFilter} onValueChange={setTxFilter}>
//                         <TabsList className={cn(theme === "dark" ? "bg-white/[0.06]" : "bg-slate-100")}>
//                           <TabsTrigger value="all">All</TabsTrigger>
//                           <TabsTrigger value="paid">Paid</TabsTrigger>
//                           <TabsTrigger value="pending">Pending</TabsTrigger>
//                           <TabsTrigger value="refund">Refund</TabsTrigger>
//                         </TabsList>
//                       </Tabs>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="overflow-x-auto">
//                         <table className="w-full min-w-[760px] text-sm">
//                           <thead>
//                             <tr className={cn("border-b", tk.tableRowBorder)}>
//                               {["Transaction", "Customer", "Shop", "Status", "Time", "Amount"].map((h, i) => (
//                                 <th key={h} className={cn("px-3 py-3 font-semibold text-xs uppercase tracking-wider", i === 5 ? "text-right" : "text-left", tk.tableHead)}>{h}</th>
//                               ))}
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {filteredTransactions.map((tx) => (
//                               <tr key={tx.id} className={cn("border-b transition-colors", tk.tableRow)}>
//                                 <td className={cn("px-3 py-3.5 font-mono text-xs font-semibold", tk.text)}>{tx.id}</td>
//                                 <td className={cn("px-3 py-3.5 font-medium", tk.text)}>{tx.customer}</td>
//                                 <td className={cn("px-3 py-3.5", tk.textMuted)}>{tx.shop}</td>
//                                 <td className="px-3 py-3.5">
//                                   <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
//                                     tx.type === "Paid" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
//                                       tx.type === "Pending" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
//                                         "bg-rose-500/10 text-rose-600 dark:text-rose-400"
//                                   )}>{tx.type}</span>
//                                 </td>
//                                 <td className={cn("px-3 py-3.5 text-xs", tk.textMuted)}>{tx.time}</td>
//                                 <td className={cn("px-3 py-3.5 text-right font-bold", tk.text)}>{money(tx.amount)}</td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     </CardContent>
//                   </SectionCard>
//                 </div>

//                 {/* SIDEBAR RIGHT */}
//                 <div className="space-y-6 2xl:col-span-5">
//                   <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-1">
//                     {/* Pie */}
//                     <SectionCard theme={theme}>
//                       <CardHeader>
//                         <CardTitle className={cn("text-[17px] font-bold", tk.text)}>Sales Categories</CardTitle>
//                         <CardDescription className={cn("text-sm", tk.textMuted)}>Breakdown by category</CardDescription>
//                       </CardHeader>
//                       <CardContent>
//                         <div className="h-[260px] 2xl:h-[300px]">
//                           <ResponsiveContainer width="100%" height="100%">
//                             <PieChart>
//                               <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100} paddingAngle={3}>
//                                 {categoryData.map((_, index) => (
//                                   <Cell key={index} fill={["#60a5fa", "#a78bfa", "#34d399", "#f59e0b", "#fb7185"][index]} />
//                                 ))}
//                               </Pie>
//                               <Tooltip content={<CustomTooltip theme={theme} />} />
//                             </PieChart>
//                           </ResponsiveContainer>
//                         </div>
//                         <div className="mt-3 space-y-2.5">
//                           {categoryData.map((item, i) => (
//                             <div key={item.name} className="flex items-center justify-between">
//                               <div className="flex items-center gap-2.5">
//                                 <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ["#60a5fa", "#a78bfa", "#34d399", "#f59e0b", "#fb7185"][i] }} />
//                                 <span className={cn("text-[13px] font-medium", tk.text)}>{item.name}</span>
//                               </div>
//                               <span className={cn("text-[13px] font-semibold", tk.textMuted)}>{item.value}%</span>
//                             </div>
//                           ))}
//                         </div>
//                       </CardContent>
//                     </SectionCard>

//                     {/* AI Insight */}
//                     <SectionCard theme={theme}>
//                       <CardHeader>
//                         <CardTitle className={cn("text-[17px] font-bold", tk.text)}>AI Insight</CardTitle>
//                         <CardDescription className={cn("text-sm", tk.textMuted)}>Smart business summary</CardDescription>
//                       </CardHeader>
//                       <CardContent>
//                         <div className={cn("rounded-2xl border p-5", theme === "dark" ? "border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-violet-500/[0.04]" : "border-violet-200 bg-gradient-to-br from-violet-50 to-white")}>
//                           <div className="mb-4 flex items-center gap-3">
//                             <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", theme === "dark" ? "bg-violet-500/20" : "bg-violet-100")}>
//                               <Bot className="h-5 w-5 text-violet-500" />
//                             </div>
//                             <div>
//                               <div className={cn("text-sm font-bold", tk.text)}>BINHLAIG AI</div>
//                               <div className={cn("text-[11px]", tk.textMuted)}>Generated business insight</div>
//                             </div>
//                           </div>
//                           <p className={cn("text-[13px] leading-relaxed", tk.textMuted)}>
//                             Main Branch leads with highest conversion rate. Online Shop refunds increased slightly — snack category sales remain under-optimized. Consider weekend promotions for Branch B.
//                           </p>
//                           <div className="mt-4 flex flex-wrap gap-2">
//                             <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Growth chance</span>
//                             <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">Review refunds</span>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </SectionCard>
//                   </div>

//                   {/* Recent Activity */}
//                   <SectionCard theme={theme}>
//                     <CardHeader className="flex flex-row items-center justify-between pb-4">
//                       <div>
//                         <CardTitle className={cn("text-[17px] font-bold", tk.text)}>Recent Activity</CardTitle>
//                         <CardDescription className={cn("text-sm", tk.textMuted)}>Team and system updates</CardDescription>
//                       </div>
//                       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
//                         <MoreHorizontal className="h-4 w-4" />
//                       </Button>
//                     </CardHeader>
//                     <CardContent className="space-y-3">
//                       {[
//                         { title: "New customer registered", time: "5 min ago", icon: Users, color: theme === "dark" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600" },
//                         { title: "Stock updated for 12 items", time: "18 min ago", icon: Package, color: theme === "dark" ? "bg-violet-500/10 border-violet-500/20 text-violet-400" : "bg-violet-50 border-violet-200 text-violet-600" },
//                         { title: "Income report exported", time: "40 min ago", icon: Download, color: theme === "dark" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600" },
//                         { title: "Branch A sales increased", time: "1 hour ago", icon: Store, color: theme === "dark" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-600" },
//                       ].map((item, i) => {
//                         const Icon = item.icon;
//                         return (
//                           <div key={i} className="flex gap-3 items-center">
//                             <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border", item.color)}>
//                               <Icon className="h-4 w-4" />
//                             </div>
//                             <div className="min-w-0 flex-1">
//                               <div className={cn("text-[13px] font-semibold", tk.text)}>{item.title}</div>
//                               <div className={cn("text-[11px] mt-0.5", tk.textSubtle)}>{item.time}</div>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </CardContent>
//                   </SectionCard>

//                   {/* User Card */}
//                   <SectionCard theme={theme}>
//                     <CardContent className="p-5">
//                       <div className="flex items-center gap-3">
//                         <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-blue-500/20">
//                           <AvatarImage src="" />
//                           <AvatarFallback className="font-bold text-sm bg-gradient-to-br from-blue-500 to-violet-600 text-white">SA</AvatarFallback>
//                         </Avatar>
//                         <div>
//                           <div className={cn("font-bold", tk.text)}>Sai Aung</div>
//                           <div className={cn("text-xs font-medium", tk.textMuted)}>Admin Dashboard Access</div>
//                         </div>
//                       </div>
//                       <Separator className={cn("my-4", tk.separator)} />
//                       <div className="grid grid-cols-2 gap-3 text-sm">
//                         <div className={cn("rounded-xl border px-3 py-2.5", theme === "dark" ? "border-white/[0.07] bg-white/[0.04]" : "border-slate-200 bg-slate-50")}>
//                           <div className={cn("text-[10px] font-semibold uppercase tracking-wider", tk.textSubtle)}>Role</div>
//                           <div className={cn("mt-1 font-bold", tk.text)}>ADMIN</div>
//                         </div>
//                         <div className={cn("rounded-xl border px-3 py-2.5", theme === "dark" ? "border-white/[0.07] bg-white/[0.04]" : "border-slate-200 bg-slate-50")}>
//                           <div className={cn("text-[10px] font-semibold uppercase tracking-wider", tk.textSubtle)}>Shop Code</div>
//                           <div className={cn("mt-1 font-bold", tk.text)}>SHOP-0001</div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </SectionCard>
//                 </div>
//               </div>
//             </>
//           )}

//           <Separator className={cn("my-6 2xl:my-8", tk.separator)} />
//           <div className={cn("flex flex-col gap-2 pb-4 text-center text-[11px] font-medium md:flex-row md:items-center md:justify-between", tk.textSubtle)}>
//             <div>© 2026 BINHLAIG. Premium dashboard UI.</div>
//             <div>Aceternity-style effects · shadcn/ui components.</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


















"use client";

import * as React from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { TooltipProps } from "recharts";
import {
  Sparkles,
  Search,
  Bell,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  Wallet,
  CreditCard,
  MoreHorizontal,
  Bot,
  Store,
  Package,
  Users,
  Activity,
  Download,
  Plus,
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  Receipt,
  Boxes,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LineChart as LineChartIcon,
  ShieldCheck,
  Clock3,
  BadgeDollarSign,
  User2,
  TrendingUp,
  Flame,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

type ThemeMode = "dark" | "light";

const revenueData = [
  { name: "Jan", revenue: 1200, profit: 400 },
  { name: "Feb", revenue: 1800, profit: 610 },
  { name: "Mar", revenue: 1600, profit: 540 },
  { name: "Apr", revenue: 2400, profit: 830 },
  { name: "May", revenue: 2100, profit: 760 },
  { name: "Jun", revenue: 2800, profit: 1060 },
  { name: "Jul", revenue: 3200, profit: 1320 },
  { name: "Aug", revenue: 3600, profit: 1510 },
];

const categoryData = [
  { name: "Food", value: 38 },
  { name: "Drink", value: 24 },
  { name: "Snacks", value: 18 },
  { name: "Household", value: 12 },
  { name: "Other", value: 8 },
];

const shopData = [
  { name: "Main Branch", value: 86 },
  { name: "Branch A", value: 72 },
  { name: "Branch B", value: 61 },
  { name: "Online Shop", value: 49 },
];

const transactions = [
  { id: "TXN-1001", customer: "Aung Aung", type: "Paid", amount: 12400, shop: "Main Branch", time: "2 min ago" },
  { id: "TXN-1002", customer: "Su Su", type: "Pending", amount: 8200, shop: "Branch A", time: "6 min ago" },
  { id: "TXN-1003", customer: "Ko Ko", type: "Refund", amount: 3900, shop: "Online Shop", time: "10 min ago" },
  { id: "TXN-1004", customer: "Moe Thidar", type: "Paid", amount: 19000, shop: "Main Branch", time: "15 min ago" },
  { id: "TXN-1005", customer: "Hla Hla", type: "Paid", amount: 6700, shop: "Branch B", time: "26 min ago" },
];

const quickActions = [
  { label: "Create Order", icon: ShoppingCart, color: "from-amber-500/20 to-orange-600/10", iconColor: "text-amber-600 dark:text-amber-400" },
  { label: "Add Product", icon: Package, color: "from-orange-500/20 to-amber-600/10", iconColor: "text-orange-600 dark:text-orange-400" },
  { label: "Customers", icon: Users, color: "from-emerald-500/20 to-emerald-600/10", iconColor: "text-emerald-600 dark:text-emerald-400" },
  { label: "Reports", icon: Activity, color: "from-yellow-500/20 to-orange-600/10", iconColor: "text-yellow-600 dark:text-yellow-400" },
  { label: "Shops", icon: Store, color: "from-amber-500/20 to-yellow-600/10", iconColor: "text-amber-600 dark:text-amber-400" },
  { label: "Export", icon: Download, color: "from-rose-500/20 to-rose-600/10", iconColor: "text-rose-600 dark:text-rose-400" },
];

const sidebarItems = [
  { label: "admin Dashboard", icon: LayoutDashboard, active:true },
  { label: "Dashboard", icon: LayoutDashboard,href: "/dashboard" },
  { label: "Analytics", icon: BarChart3 ,href: "/admin/analytics"},
  { label: "Orders", icon: Receipt, href: "/admin/orders" },
  { label: "Inventory", icon: Boxes, href: "/admin/inventory" },
  { label: "Branches", icon: Store, href: "/branches" },
  { label: "Customers", icon: Users, href: "/customers" },
  { label: "Settings", icon: Settings, href: "/settings" },
  {label: "Tasks", icon: Clock3, href: "/admin/tasks"},
{label:"Staff", icon: User2, href: "/admin/staff"}
];

function money(n: number) {
  return `¥${n.toLocaleString()}`;
}

function t(theme: ThemeMode) {
  if (theme === "dark") {
    return {
      root: "bg-[#05040a] text-white",
      text: "text-white",
      textMuted: "text-[#c7b9a3]",
      textSubtle: "text-[#8e7c63]",
      card: "border-[rgba(200,137,42,0.12)] bg-[rgba(10,8,16,0.88)] backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.5)]",
      cardSolid: "border-[rgba(200,137,42,0.12)] bg-[#0a0810]",
      input: "border-white/[0.08] bg-white/[0.03] text-white placeholder:text-[#7c6c58] focus:border-amber-600/30",
      outlineBtn: "border-white/[0.07] bg-white/[0.03] text-white hover:bg-white/[0.06] hover:border-amber-500/20",
      badge: "border-amber-500/15 bg-white/[0.03] text-amber-300",
      separator: "bg-white/[0.06]",
      sidebar: "border-white/[0.05] bg-[#060410]/95 backdrop-blur-3xl",
      navbar: "border-white/[0.05] bg-[#080614]/80 backdrop-blur-2xl",
      soft: "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]",
      softStrong: "border-white/[0.08] bg-white/[0.04]",
      grid: "[background-image:linear-gradient(to_right,rgba(180,130,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(180,130,255,0.015)_1px,transparent_1px)] [background-size:42px_42px]",
      tableHead: "text-[#a79273]",
      tableRow: "border-white/[0.04] hover:bg-white/[0.03]",
      tableRowBorder: "border-white/[0.04]",
      progressTrack: "bg-white/[0.06]",
      navActive: "border-amber-500/15 bg-amber-500/8 text-amber-400 shadow-none",
      navInactive: "border-transparent text-[#b19e81] hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-white",
    };
  }

  return {
    root: "bg-[#fdf8f0] text-slate-900",
    text: "text-slate-900",
    textMuted: "text-slate-500",
    textSubtle: "text-slate-400",
    card: "border-amber-900/[0.07] bg-[linear-gradient(180deg,rgba(255,252,246,0.94),rgba(255,247,235,0.88))] backdrop-blur-xl shadow-[0_4px_24px_rgba(140,90,20,0.08)]",
    cardSolid: "border-slate-200 bg-white",
    input: "border-amber-100 bg-white text-slate-900 placeholder:text-slate-400 focus:border-amber-300 shadow-sm",
    outlineBtn: "border-amber-100 bg-white text-slate-700 hover:bg-amber-50 hover:border-amber-300 shadow-sm",
    badge: "border-amber-200 bg-white text-amber-700 shadow-sm",
    separator: "bg-amber-100",
    sidebar: "border-amber-900/[0.07] bg-white/95 backdrop-blur-2xl shadow-[4px_0_24px_rgba(140,90,20,0.06)]",
    navbar: "border-amber-900/[0.07] bg-white/90 backdrop-blur-2xl shadow-[0_4px_20px_rgba(140,90,20,0.07)]",
    soft: "border-amber-100 bg-white hover:bg-amber-50 shadow-sm",
    softStrong: "border-amber-100 bg-amber-50/80",
    grid: "[background-image:linear-gradient(to_right,rgba(120,80,20,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,80,20,0.03)_1px,transparent_1px)] [background-size:36px_36px]",
    tableHead: "text-slate-500",
    tableRow: "border-amber-100 hover:bg-amber-50/70",
    tableRowBorder: "border-amber-100",
    progressTrack: "bg-amber-100",
    navActive: "border-amber-300 bg-amber-50 text-amber-700 shadow-sm",
    navInactive: "border-transparent text-slate-500 hover:border-amber-200 hover:bg-amber-50 hover:text-slate-800",
  };
}

// ── DIMMED LanternMark ─────────────────────────────────────────────────────────
// glow intensity ကို လျှော့ချပြီး မှောင်ကျပြီး ကြည်ကောင်းအောင် ပြင်ထားတယ်
function LanternMark({ size = 36, glow = false, dimmed = false }: { size?: number; glow?: boolean; dimmed?: boolean }) {
  const h = size * 1.5;
  const uid = React.useId().replace(/:/g, "");
  const glowId = `lanternGlow-${uid}`;
  const metalId = `lanternMetal-${uid}`;

  // dimmed mode မှာ glow opacity နည်းနည်းပဲ ထားမယ်
  const glowOpacity = dimmed ? 0.55 : 0.88;
  const outerGlowOpacity = dimmed ? 0.0 : 0.42;

  return (
    <svg width={size} height={h} viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={glowId} cx="50%" cy="48%" r="50%">
          <stop offset="0%" stopColor="#ffe8a0" stopOpacity={glowOpacity} />
          <stop offset="30%" stopColor="#f59e0b" stopOpacity={dimmed ? 0.55 : 0.70} />
          <stop offset="65%" stopColor="#d97706" stopOpacity={dimmed ? 0.15 : outerGlowOpacity} />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={metalId} x1="8" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9a6a2e" />
          <stop offset="50%" stopColor="#7d4e1c" />
          <stop offset="100%" stopColor="#613a12" />
        </linearGradient>
      </defs>

      {/* string */}
      <line x1="16" y1="0" x2="16" y2="6" stroke={glow ? "#a88040" : "#6b4418"} strokeWidth="1.5" strokeLinecap="round" />
      {/* top cap */}
      <rect x="8" y="6" width="16" height="5" rx="2" fill={`url(#${metalId})`} stroke="#5a3410" strokeWidth="0.8" />

      {/* body — dark when glow, light when no glow */}
      <rect x="6" y="11" width="20" height="26" rx="3"
        fill={glow ? "#080510" : "#f0e4cc"}
        stroke="#7a4a1a"
        strokeWidth="1"
      />

      {/* inner glow fill */}
      {glow && <rect x="6" y="11" width="20" height="26" rx="3" fill={`url(#${glowId})`} />}

      {/* vertical slats */}
      {[11, 16, 21].map((x) => (
        <line key={x} x1={x} y1="11" x2={x} y2="37"
          stroke={glow ? "#4a2c08" : "#9a6428"}
          strokeWidth="1"
          opacity="0.9"
        />
      ))}

      {/* animated flame — dimmed mode မှာ အလင်းနည်းတယ် */}
      {glow && (
        <>
          <motion.ellipse
            cx="16" cy="26"
            rx="3.4" ry="5.2"
            fill="#d97706"
            opacity={dimmed ? 0.28 : 0.45}
            animate={{
              ry: [5.2, 4.4, 5.8, 4.9, 5.2],
              opacity: dimmed
                ? [0.28, 0.16, 0.32, 0.20, 0.28]
                : [0.45, 0.28, 0.50, 0.32, 0.45],
              cx: [16, 15.85, 16.12, 15.95, 16],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.ellipse
            cx="16" cy="27"
            rx="2.0" ry="3.4"
            fill="#fcd34d"
            animate={{
              ry: [3.4, 2.7, 3.9, 3.1, 3.4],
              opacity: dimmed
                ? [0.55, 0.32, 0.65, 0.40, 0.55]
                : [0.82, 0.52, 0.90, 0.62, 0.82],
            }}
            transition={{ duration: 1.55, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* bottom cap */}
      <rect x="8" y="37" width="16" height="5" rx="2" fill={`url(#${metalId})`} stroke="#5a3410" strokeWidth="0.8" />
      <line x1="16" y1="42" x2="16" y2="47" stroke="#6b3e18" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="47" r="1.5" fill="#6b3e18" />
    </svg>
  );
}

// ── SWINGING LANTERN — ကြည်ကောင်းတဲ့ dim glow ─────────────────────────────────
function SwingingLantern({
  size = 84,
  className,
  delay = 0,
  dimmed = false,
}: {
  size?: number;
  className?: string;
  delay?: number;
  dimmed?: boolean;
}) {
  return (
    <motion.div
      className={cn("absolute origin-top", className)}
      animate={{ rotate: [-4, 3, -2.5, 4, -4], y: [0, -1.5, 0.8, -1, 0] }}
      transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {/* outer ambient glow — မှိန်သွားအောင် */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-7 -translate-x-1/2 rounded-full"
        style={{
          width: size * 2.2,
          height: size * 1.8,
          background: dimmed
            ? "radial-gradient(ellipse at center, rgba(215,160,60,0.10) 0%, rgba(180,100,20,0.04) 45%, transparent 72%)"
            : "radial-gradient(ellipse at center, rgba(215,160,60,0.16) 0%, rgba(180,100,20,0.06) 45%, transparent 72%)",
          filter: "blur(18px)",
        }}
        animate={{
          opacity: dimmed
            ? [0.30, 0.14, 0.34, 0.18, 0.30]
            : [0.45, 0.22, 0.50, 0.26, 0.45],
          scale: [1, 0.95, 1.02, 0.97, 1],
        }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay }}
      />

      {/* inner tight glow */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 rounded-full"
        style={{
          width: size * 1.0,
          height: size * 1.1,
          background: dimmed
            ? "radial-gradient(circle at center, rgba(240,200,100,0.08) 0%, rgba(210,140,30,0.04) 50%, transparent 80%)"
            : "radial-gradient(circle at center, rgba(240,200,100,0.12) 0%, rgba(210,140,30,0.06) 50%, transparent 80%)",
          filter: "blur(10px)",
        }}
        animate={{ opacity: dimmed ? [0.28, 0.12, 0.32, 0.16, 0.28] : [0.42, 0.18, 0.46, 0.22, 0.42] }}
        transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut", delay: delay + 0.2 }}
      />

      <LanternMark size={size} glow dimmed={dimmed} />
    </motion.div>
  );
}

// ── LANTERN TOGGLE ─────────────────────────────────────────────────────────────
function LanternToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative flex flex-col items-center focus:outline-none"
      style={{ width: 58 }}
      aria-label={dark ? "Switch to day mode" : "Switch to night mode"}
    >
      {dark && (
        <motion.div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 64,
            height: 64,
            top: -4,
            left: "50%",
            transform: "translateX(-50%)",
            background:
              "radial-gradient(ellipse at center, rgba(210,150,40,0.22) 0%, rgba(180,100,20,0.08) 55%, transparent 78%)",
            filter: "blur(10px)",
          }}
          animate={{ opacity: [0.28, 0.12, 0.32, 0.15, 0.28] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <motion.div
        animate={dark ? { rotate: [-2.5, 2.5, -1.8, 2.8, -2.5] } : {}}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <LanternMark size={34} glow={dark} dimmed={true} />
      </motion.div>

      <span
        style={{
          marginTop: 5,
          fontSize: 7,
          fontWeight: 700,
          letterSpacing: "0.2em",
          color: dark ? "#9a6820" : "#9a6c2a",
        }}
      >
        {dark ? "NIGHT" : "DAY"}
      </span>
    </button>
  );
}

// ── NIGHT STARS — improved twinkling ──────────────────────────────────────────
function NightStars() {
  const stars = React.useMemo(
    () =>
      Array.from({ length: 55 }).map((_, i) => {
        // star types: tiny, small, medium, bright
        const type = i % 8 === 0 ? "bright" : i % 4 === 0 ? "medium" : i % 2 === 0 ? "small" : "tiny";
        const size =
          type === "bright" ? 3.8 :
          type === "medium" ? 2.4 :
          type === "small" ? 1.8 : 1.2;

        return {
          id: i,
          left: `${(i * 19 + 7) % 100}%`,
          top: `${(i * 13 + 5) % 65}%`,
          size,
          type,
          delay: (i * 0.18) % 5,
          duration: 2.0 + (i % 7) * 0.55,
          // bright stars twinkle more dramatically
          minOpacity: type === "bright" ? 0.08 : type === "medium" ? 0.05 : 0.02,
          maxOpacity: type === "bright" ? 0.90 : type === "medium" ? 0.70 : 0.50,
        };
      }),
    []
  );

  return (
    <>
      {stars.map((star) => (
        <motion.span
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            background:
              star.type === "bright"
                ? "radial-gradient(circle, rgba(255,248,230,1) 0%, rgba(240,200,100,0.7) 40%, rgba(200,160,60,0.15) 80%, transparent 100%)"
                : star.type === "medium"
                ? "radial-gradient(circle, rgba(255,246,220,0.95) 0%, rgba(220,180,90,0.4) 60%, transparent 100%)"
                : "rgba(240,234,210,0.80)",
            boxShadow:
              star.type === "bright"
                ? "0 0 12px 2px rgba(220,180,80,0.22), 0 0 4px rgba(255,240,180,0.40)"
                : star.type === "medium"
                ? "0 0 6px rgba(200,170,80,0.18)"
                : "none",
          }}
          animate={{
            opacity: [
              star.minOpacity,
              star.maxOpacity,
              star.minOpacity * 2,
              star.maxOpacity * 0.7,
              star.minOpacity,
            ],
            scale:
              star.type === "bright"
                ? [0.7, 1.25, 0.85, 1.15, 0.7]
                : star.type === "medium"
                ? [0.8, 1.10, 0.9, 1.05, 0.8]
                : [0.85, 1.05, 0.9, 1.02, 0.85],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: star.delay,
          }}
        />
      ))}

      {/* occasional shooting star */}
      <ShootingStars />
    </>
  );
}

// ── SHOOTING STARS ─────────────────────────────────────────────────────────────
function ShootingStars() {
  const [visible, setVisible] = React.useState(false);
  const [pos, setPos] = React.useState({ x: 20, y: 8 });

  React.useEffect(() => {
    const schedule = () => {
      const delay = 8000 + Math.random() * 12000;
      setTimeout(() => {
        setPos({ x: 10 + Math.random() * 60, y: 5 + Math.random() * 30 });
        setVisible(true);
        setTimeout(() => {
          setVisible(false);
          schedule();
        }, 1200);
      }, delay);
    };
    schedule();
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      initial={{ opacity: 0, x: 0, y: 0, scaleX: 0 }}
      animate={{ opacity: [0, 1, 0.8, 0], x: 120, y: 60, scaleX: 1 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
    >
      <div
        style={{
          width: 80,
          height: 1.5,
          background: "linear-gradient(to right, transparent, rgba(255,240,180,0.9), rgba(255,220,100,0.6), transparent)",
          borderRadius: 2,
          filter: "blur(0.5px)",
          boxShadow: "0 0 6px rgba(255,220,120,0.5)",
          transform: "rotate(30deg)",
        }}
      />
    </motion.div>
  );
}

// ── BACKGROUND FX ──────────────────────────────────────────────────────────────
// dark theme ကို ပိုမှောင်ပြီး deep purple-navy-black ဆိုတဲ့ feel ပေးမယ်
function BackgroundFX({ theme }: { theme: ThemeMode }) {
  if (theme === "dark") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* deep dark base */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#020108_0%,#04030c_30%,#060210_60%,#0a0415_100%)]" />

        {/* very subtle warm horizon glow — မှိန်ပါတယ် */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 30% at 50% 0%, rgba(160,100,30,0.04) 0%, transparent 60%)",
          }}
        />

        {/* distant nebula-like glow spots — deep and subtle */}
        <div className="absolute -left-32 top-[-60px] h-[500px] w-[500px] rounded-full bg-[rgba(60,20,80,0.12)] blur-[160px]" />
        <div className="absolute right-[-80px] top-[5%] h-[420px] w-[420px] rounded-full bg-[rgba(40,15,60,0.10)] blur-[150px]" />
        <div className="absolute bottom-[-100px] left-[20%] h-[380px] w-[380px] rounded-full bg-[rgba(30,10,50,0.10)] blur-[130px]" />
        {/* very faint warm accent — lantern မီးရဲ့ ရောင်မြည် */}
        <div className="absolute top-[15%] left-[35%] h-[300px] w-[300px] rounded-full bg-[rgba(80,40,5,0.04)] blur-[140px]" />

        {/* deep vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_55%,rgba(0,0,0,0.45)_100%)]" />

        <NightStars />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_85%_-5%,rgba(255,215,100,0.22),transparent_65%)]" />
      <div className="absolute right-[-60px] top-[-60px] h-80 w-80 rounded-full bg-[rgba(255,200,80,0.20)] blur-3xl" />
      <div className="absolute bottom-[-80px] left-[15%] h-72 w-72 rounded-full bg-[rgba(255,180,60,0.14)] blur-3xl" />
    </div>
  );
}

// ── SECTION CARD — some cards get lantern decoration ──────────────────────────
function SectionCard({
  children,
  className,
  theme,
  lantern = false,
  cornerLantern = false,
}: {
  children: React.ReactNode;
  className?: string;
  theme: ThemeMode;
  lantern?: boolean;
  cornerLantern?: boolean;
}) {
  const tk = t(theme);
  return (
    <Card className={cn("relative overflow-hidden rounded-[24px]", tk.card, className)}>
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          theme === "dark"
            ? "bg-[radial-gradient(circle_at_top_right,rgba(160,100,30,0.06),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(120,60,10,0.04),transparent_26%)]"
            : "bg-[radial-gradient(circle_at_top_right,rgba(255,205,120,0.20),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,180,70,0.10),transparent_28%)]"
        )}
      />
      {/* top highlight line */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px",
          theme === "dark"
            ? "bg-gradient-to-r from-transparent via-amber-600/30 to-transparent"
            : "bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
        )}
      />

      {/* corner lantern decoration for select cards */}
      {cornerLantern && theme === "dark" && (
        <div className="pointer-events-none absolute right-3 top-0 z-10 opacity-70">
          <SwingingLantern size={36} className="right-0 top-0" delay={Math.random() * 1.5} dimmed={true} />
        </div>
      )}

      {lantern && (
        <>
          <div className={cn("pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full blur-3xl", theme === "dark" ? "bg-amber-700/[0.06]" : "bg-amber-300/35")} />
          <div className={cn("pointer-events-none absolute bottom-0 left-0 h-20 w-20 rounded-full blur-2xl", theme === "dark" ? "bg-orange-700/[0.04]" : "bg-orange-200/30")} />
        </>
      )}
      <div className="relative">{children}</div>
    </Card>
  );
}

function DashboardSkeleton({ theme }: { theme: ThemeMode }) {
  const tk = t(theme);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className={tk.card}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-4 h-8 w-32" />
              <Skeleton className="mt-4 h-4 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AnalyticsStrip({ theme }: { theme: ThemeMode }) {
  const tk = t(theme);
  const items = [
    { label: "Live Sales", value: "¥128,400", icon: BadgeDollarSign, accent: theme === "dark" ? "text-emerald-400" : "text-emerald-600", bg: theme === "dark" ? "bg-emerald-500/8 border-emerald-500/15" : "bg-emerald-50 border-emerald-200" },
    { label: "Open Orders", value: "248", icon: ShoppingCart, accent: theme === "dark" ? "text-amber-400" : "text-amber-600", bg: theme === "dark" ? "bg-amber-500/8 border-amber-500/15" : "bg-amber-50 border-amber-200" },
    { label: "Active Users", value: "1,240", icon: Users, accent: theme === "dark" ? "text-orange-400" : "text-orange-600", bg: theme === "dark" ? "bg-orange-500/8 border-orange-500/15" : "bg-orange-50 border-orange-200" },
    { label: "System Uptime", value: "99.98%", icon: ShieldCheck, accent: theme === "dark" ? "text-yellow-400" : "text-yellow-600", bg: theme === "dark" ? "bg-yellow-500/8 border-yellow-500/15" : "bg-yellow-50 border-yellow-200" },
  ];

  return (
    <div className="hidden xl:grid xl:grid-cols-4 xl:gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            whileHover={{ y: -2, scale: 1.01 }}
            className={cn("relative overflow-hidden rounded-2xl border p-4 transition-all", tk.soft)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className={cn("text-xs font-medium", tk.textMuted)}>{item.label}</div>
                <div className={cn("mt-1.5 text-xl font-bold 2xl:text-2xl", tk.text)}>{item.value}</div>
              </div>
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border", item.bg)}>
                <Icon className={cn("h-5 w-5", item.accent)} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function CustomTooltip({ active, payload, label, theme }: TooltipProps<number, string> & { theme: ThemeMode }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className={cn("min-w-[180px] rounded-2xl border px-4 py-3 shadow-2xl", theme === "dark" ? "border-white/[0.07] bg-[#08060f]/98 text-white" : "border-slate-200 bg-white text-slate-900 shadow-[0_8px_30px_rgba(15,23,42,0.12)]")}>
      <div className={cn("mb-2 text-xs font-medium", theme === "dark" ? "text-[#a79273]" : "text-slate-400")}>{label}</div>
      <div className="space-y-2">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: String(entry.color || "#8884d8") }} />
              <span className={theme === "dark" ? "text-[#c7b9a3]" : "text-slate-500"}>{entry.name}</span>
            </div>
            <span className={cn("font-semibold", theme === "dark" ? "text-white" : "text-slate-900")}>{money(Number(entry.value ?? 0))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LegendChip({ theme, label, color }: { theme: ThemeMode; label: string; color: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium", theme === "dark" ? "border-white/[0.07] bg-white/[0.04] text-[#d8c7a8]" : "border-amber-200 bg-white text-slate-600 shadow-sm")}>
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
  );
}

function AnimatedStatCard({
  theme, title, value, prefix = "", suffix = "", decimals = 0, change, positive, icon: Icon, sub, gradient,
}: {
  theme: ThemeMode; title: string; value: number; prefix?: string; suffix?: string;
  decimals?: number; change: string; positive: boolean;
  icon: React.ComponentType<{ className?: string }>; sub: string; gradient: string;
}) {
  return (
    <motion.div whileHover={{ y: -5, scale: 1.015 }} transition={{ duration: 0.2, ease: "easeOut" }}>
      <Card className={cn("relative overflow-hidden rounded-[24px] border text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]", theme === "dark" ? "border-white/[0.05]" : "border-transparent")}>
        <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
        <div className="absolute -right-6 -top-6 h-36 w-36 rounded-full bg-white/[0.05] blur-2xl" />
        <div className="absolute -bottom-8 -left-4 h-32 w-32 rounded-full bg-black/25 blur-2xl" />
        <div className="relative">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 pt-5 px-5">
            <div>
              <CardDescription className="text-white/55 text-xs font-medium uppercase tracking-wider">{title}</CardDescription>
              <CardTitle className="mt-2 text-2xl font-bold tracking-tight 2xl:text-[28px]">
                {prefix}
                <CountUp end={value} duration={1.5} decimals={decimals} separator="," />
                {suffix}
              </CardTitle>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
              <Icon className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex items-center gap-2 text-sm">
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", positive ? "bg-white/15 text-white" : "bg-black/20 text-white/90")}>
                {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {change}
              </span>
              <span className="text-white/50 text-xs">{sub}</span>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}

function MiniMetric({ theme, label, value, icon: Icon }: { theme: ThemeMode; label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  const tk = t(theme);
  return (
    <div className={cn("rounded-2xl border p-4", theme === "dark" ? "border-white/[0.06] bg-white/[0.04]" : "border-amber-100 bg-white shadow-sm")}>
      <div className="flex items-center justify-between">
        <div className={cn("text-xs font-medium", tk.textMuted)}>{label}</div>
        <Icon className={cn("h-4 w-4", tk.textMuted)} />
      </div>
      <div className={cn("mt-2 text-2xl font-bold", tk.text)}>{value}</div>
    </div>
  );
}

function DesktopSidebar({ theme, collapsed }: { theme: ThemeMode; collapsed: boolean }) {
  const tk = t(theme);
  const router = useRouter();

  return (
    <aside className={cn("fixed left-0 top-0 z-30 hidden h-screen border-r xl:flex xl:flex-col transition-all duration-300", tk.sidebar, collapsed ? "w-[88px]" : "w-[264px]")}>
      <div className={cn("flex items-center gap-3 px-5 py-6", collapsed && "justify-center px-0")}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-yellow-600 text-white shadow-lg shadow-amber-700/20">
          <Flame className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div>
            <div className={cn("text-sm font-bold tracking-widest uppercase", tk.text)}>BINHLAIG</div>
            <div className={cn("text-[10px] font-medium", tk.textMuted)}>Lantern Admin</div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-4 mb-2">
          <div className={cn("rounded-xl border px-3.5 py-2.5", theme === "dark" ? "border-white/[0.06] bg-white/[0.03]" : "border-amber-100 bg-amber-50")}>
            <div className={cn("text-[10px] font-semibold uppercase tracking-widest", tk.textSubtle)}>Workspace</div>
            <div className={cn("mt-0.5 text-sm font-semibold", tk.text)}>Main Operations</div>
          </div>
        </div>
      )}

      <nav className="mt-3 flex-1 space-y-1 px-3">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button

              key={item.label}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-150",
                item.active ? tk.navActive : tk.navInactive,
                collapsed && "justify-center px-0"
              )}
              onClick={() => item.href && router.push(item.href)}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="text-[13px] font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-3">
        <div className={cn("rounded-xl border p-3", theme === "dark" ? "border-white/[0.06] bg-white/[0.03]" : "border-amber-100 bg-amber-50")}>
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <Avatar className="h-9 w-9 ring-2 ring-offset-1 ring-amber-600/20">
              <AvatarImage src="" />
              <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-amber-600 to-orange-700 text-white">SA</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div>
                <div className={cn("text-[13px] font-semibold", tk.text)}>Sai Aung</div>
                <div className={cn("text-[10px] font-semibold uppercase tracking-wider", tk.textSubtle)}>Admin</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function DashboardPage() {
  const [theme, setTheme] = React.useState<ThemeMode>("dark");
  const [loading, setLoading] = React.useState(true);
  const [range, setRange] = React.useState("30d");
  const [txFilter, setTxFilter] = React.useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const router = useRouter();

  React.useEffect(() => {
    const savedTheme = localStorage.getItem("binhlaig-theme") as ThemeMode | null;
    const savedSidebar = localStorage.getItem("binhlaig-sidebar");
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
    if (savedSidebar === "true") setSidebarCollapsed(true);
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    localStorage.setItem("binhlaig-theme", theme);
  }, [theme]);

  React.useEffect(() => {
    localStorage.setItem("binhlaig-sidebar", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const tk = t(theme);
  const filteredTransactions = React.useMemo(
    () => (txFilter === "all" ? transactions : transactions.filter((x) => x.type.toLowerCase() === txFilter)),
    [txFilter]
  );
  const mainOffset = sidebarCollapsed ? "xl:pl-[108px]" : "xl:pl-[284px]";

  return (
    <div className={cn("relative min-h-screen overflow-hidden transition-colors duration-300", tk.root)}>
      <BackgroundFX theme={theme} />
      <div className={cn("pointer-events-none absolute inset-0 opacity-40", tk.grid)} />
      <DesktopSidebar theme={theme} collapsed={sidebarCollapsed} />

      <div className={cn("relative z-10", mainOffset)}>
        {/* NAVBAR */}
        <div className="sticky top-0 z-20 px-4 pt-4 md:px-6 xl:px-8">
          <div className={cn("mx-auto flex max-w-[1850px] items-center justify-between gap-3 rounded-[20px] border px-4 py-2.5", tk.navbar)}>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className={cn("hidden xl:inline-flex h-9 w-9 rounded-xl", tk.outlineBtn)} onClick={() => setSidebarCollapsed((p) => !p)}>
                {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </Button>

              <div className="xl:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-yellow-600 text-white">
                <Flame className="h-4 w-4" />
              </div>

              <div>
                <div className={cn("text-sm font-bold", tk.text)}>BINHLAIG Dashboard</div>
                <div className={cn("text-[11px]", tk.textMuted)}>Lantern analytics workspace</div>
              </div>
            </div>

            <div className="hidden min-w-[260px] flex-1 px-3 md:block xl:max-w-[400px]">
              <div className="relative">
                <Search className={cn("absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2", tk.textSubtle)} />
                <Input placeholder="Search products, orders, customers..." className={cn("h-9 rounded-xl pl-9 text-sm", tk.input)} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className={cn("h-9 rounded-xl text-sm gap-1.5", tk.outlineBtn)}>
                    <CalendarDays className="h-3.5 w-3.5" />
                    {range === "7d" ? "7 days" : range === "30d" ? "30 days" : "90 days"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setRange("7d")}>Last 7 days</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRange("30d")}>Last 30 days</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRange("90d")}>Last 90 days</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <LanternToggle dark={theme === "dark"} onToggle={() => setTheme((p) => (p === "dark" ? "light" : "dark"))} />

              <Button variant="outline" size="icon" className={cn("h-9 w-9 rounded-xl", tk.outlineBtn)}>
                <Bell className="h-4 w-4" />
              </Button>

              <Button className={cn("h-9 rounded-xl text-sm gap-1.5 font-semibold shadow-lg", theme === "dark" ? "bg-amber-700 text-white hover:bg-amber-600 shadow-amber-900/30" : "bg-amber-600 text-white hover:bg-amber-700 shadow-amber-700/20")}>
                <Plus className="h-4 w-4" />
                New Order
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1850px] px-4 py-6 md:px-6 xl:px-8 2xl:py-8">
          {/* Hero header */}
          <div className="mb-7">
            <div className={cn("mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium", tk.badge)}>
              <Flame className="h-3 w-3" />
              Desktop optimized · lantern mode
            </div>
            <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
              <div>
                <h1 className={cn("text-3xl font-bold tracking-tight md:text-4xl", tk.text)}>
                  Welcome back 👋
                </h1>
                <p className={cn("mt-2 max-w-2xl text-sm leading-relaxed", tk.textMuted)}>
                  Real-time POS analytics, branch performance, and team activity — now with warm lantern design.
                </p>
              </div>
              <div className="hidden xl:flex items-center gap-2">
                <div className={cn("flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium", tk.badge)}>
                  <Clock3 className="h-3.5 w-3.5" />
                  Last sync 2 min ago
                </div>
                <div className={cn("flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium", tk.badge)}>
                  <User2 className="h-3.5 w-3.5" />
                  Admin session active
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 2xl:mb-7">
            <AnalyticsStrip theme={theme} />
          </div>

          {/* HERO CARD — lanterns on both corners */}
          <SectionCard theme={theme} lantern className="mb-6 overflow-hidden 2xl:mb-7">
            <CardContent className="relative p-0">
              <div
                className={cn(
                  "absolute inset-0",
                  theme === "dark"
                    ? "bg-[radial-gradient(circle_at_78%_18%,rgba(160,90,20,0.08),transparent_18%),radial-gradient(circle_at_20%_50%,rgba(120,60,10,0.05),transparent_45%)]"
                    : "bg-[radial-gradient(circle_at_80%_20%,rgba(255,205,120,0.16),transparent_28%),radial-gradient(circle_at_20%_50%,rgba(255,180,70,0.08),transparent_45%)]"
                )}
              />

              {/* Lanterns on hero card — dimmed */}
              {theme === "dark" && (
                <>
                  <SwingingLantern size={80} className="right-[7%] top-[-12px]" dimmed={true} />
                  <SwingingLantern size={44} className="left-[3%] bottom-4 opacity-70" delay={0.9} dimmed={true} />
                  {/* extra small lantern on far right */}
                  <SwingingLantern size={32} className="right-[22%] top-[-6px] opacity-50" delay={1.8} dimmed={true} />
                </>
              )}

              <div className="relative grid gap-6 p-6 md:p-7 xl:grid-cols-[1.3fr_0.7fr] 2xl:gap-8 2xl:p-8">
                <div className="flex flex-col justify-between">
                  <div>
                    <div className={cn("mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold", theme === "dark" ? "border-amber-600/20 bg-amber-600/8 text-amber-400" : "border-amber-200 bg-amber-50 text-amber-700")}>
                      <TrendingUp className="h-3 w-3" />
                      Live business overview
                    </div>
                    <h2 className={cn("max-w-3xl text-2xl font-bold leading-tight md:text-[34px] 2xl:text-[42px]", tk.text)}>
                      Beautiful lantern analytics for your POS, sales, branches and team performance.
                    </h2>
                    <p className={cn("mt-4 max-w-2xl text-sm leading-relaxed md:text-[15px]", tk.textMuted)}>
                      Premium, interactive, production-ready. Optimized for wide displays with warm night-mode atmosphere.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button className={cn("rounded-xl gap-2 font-semibold shadow-lg", theme === "dark" ? "bg-amber-700 text-white hover:bg-amber-600 shadow-amber-900/30" : "bg-amber-600 text-white hover:bg-amber-700 shadow-amber-700/20")}>
                        <Download className="h-4 w-4" />
                        Export Report
                      </Button>
                      <Button
                        variant="outline"
                        className={cn("rounded-xl gap-2", tk.outlineBtn)}
                        onClick={() => router.push("/analytics")}
                      >
                        <ChevronRight className="h-4 w-4" />
                        Open Analytics
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: "System Uptime", value: "99.98%", icon: ShieldCheck },
                      { label: "Active Branches", value: "04", icon: Store },
                      { label: "Growth", value: "+18.2%", icon: LineChartIcon },
                      { label: "Live Panels", value: "12", icon: Activity },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className={cn("rounded-xl border px-4 py-3", theme === "dark" ? "border-white/[0.06] bg-white/[0.03]" : "border-amber-100 bg-amber-50")}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={cn("text-[11px] font-medium", tk.textMuted)}>{item.label}</span>
                            <Icon className={cn("h-3.5 w-3.5", tk.textSubtle)} />
                          </div>
                          <div className={cn("text-lg font-bold", tk.text)}>{item.value}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 content-start">
                  <motion.div whileHover={{ y: -3 }} className={cn("rounded-2xl border p-5", theme === "dark" ? "border-white/[0.06] bg-white/[0.04]" : "border-amber-100 bg-white shadow-sm")}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("text-sm font-medium", tk.textMuted)}>Today Revenue</div>
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", theme === "dark" ? "bg-amber-600/12" : "bg-amber-50")}>
                        <DollarSign className="h-4 w-4 text-amber-500" />
                      </div>
                    </div>

                    <div className={cn("text-3xl font-bold 2xl:text-4xl", tk.text)}>
                      ¥<CountUp end={128400} duration={1.4} separator="," />
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-sm text-emerald-500 font-medium">
                      <ArrowUpRight className="h-4 w-4" />
                      +18.2% from yesterday
                    </div>

                    <div className={cn("mt-4 h-1.5 w-full overflow-hidden rounded-full", theme === "dark" ? "bg-white/[0.07]" : "bg-amber-100")}>
                      <motion.div initial={{ width: 0 }} animate={{ width: "74%" }} transition={{ duration: 1, delay: 0.5 }} className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400" />
                    </div>

                    <div className={cn("mt-2 flex justify-between text-[11px] font-medium", tk.textSubtle)}>
                      <span>0%</span>
                      <span>Target: 74%</span>
                      <span>100%</span>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-3">
                    <MiniMetric theme={theme} label="Orders" value="248" icon={ShoppingCart} />
                    <MiniMetric theme={theme} label="Customers" value="1,240" icon={Users} />
                  </div>
                </div>
              </div>
            </CardContent>
          </SectionCard>

          {loading ? (
            <DashboardSkeleton theme={theme} />
          ) : (
            <>
              <div className="mb-6 grid gap-4 md:grid-cols-2 2xl:mb-7 2xl:grid-cols-4 2xl:gap-5">
                <AnimatedStatCard theme={theme} title="Total Revenue" value={1284000} prefix="¥" change="+12.5%" positive icon={DollarSign} sub="vs last month" gradient="from-[#1a0d04] via-[#6b4210] to-[#a8701a]" />
                <AnimatedStatCard theme={theme} title="Net Profit" value={428300} prefix="¥" change="+8.2%" positive icon={Wallet} sub="Stable growth" gradient="from-[#0e0f04] via-[#3d4810] to-[#6e8018]" />
                <AnimatedStatCard theme={theme} title="Total Orders" value={2480} change="+16.1%" positive icon={ShoppingCart} sub="Completed orders" gradient="from-[#180c04] via-[#7a3408] to-[#c05e12]" />
                <AnimatedStatCard theme={theme} title="Refunds" value={24200} prefix="¥" change="-3.4%" positive={false} icon={CreditCard} sub="Needs review" gradient="from-[#2a0606] via-[#6b1212] to-[#c43030]" />
              </div>

              <div className="grid gap-6 2xl:grid-cols-14 2xl:gap-7">
                <div className="space-y-6 2xl:col-span-9">
                  {/* Revenue chart — with corner lantern */}
                  <SectionCard theme={theme} lantern cornerLantern>
                    <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-4">
                      <div>
                        <CardTitle className={cn("text-[18px] font-bold", tk.text)}>Revenue Overview</CardTitle>
                        <CardDescription className={cn("text-sm mt-0.5", tk.textMuted)}>Revenue and profit trend</CardDescription>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <LegendChip theme={theme} label="Revenue" color="#d97706" />
                        <LegendChip theme={theme} label="Profit" color="#34d399" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[320px] w-full 2xl:h-[380px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                            <defs>
                              <linearGradient id="revFillDark" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d97706" stopOpacity={0.22} />
                                <stop offset="95%" stopColor="#d97706" stopOpacity={0.00} />
                              </linearGradient>
                              <linearGradient id="profFillDark" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#34d399" stopOpacity={0.16} />
                                <stop offset="95%" stopColor="#34d399" stopOpacity={0.00} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid stroke={theme === "dark" ? "rgba(180,140,80,0.05)" : "rgba(140,90,20,0.08)"} vertical={false} strokeDasharray="4 4" />
                            <XAxis dataKey="name" tick={{ fill: theme === "dark" ? "rgba(180,155,110,0.7)" : "rgba(71,85,105,0.9)", fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: theme === "dark" ? "rgba(180,155,110,0.7)" : "rgba(71,85,105,0.9)", fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip theme={theme} />} />
                            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#d97706" fill="url(#revFillDark)" strokeWidth={2} dot={false} />
                            <Area type="monotone" dataKey="profit" name="Profit" stroke="#34d399" fill="url(#profFillDark)" strokeWidth={1.8} dot={false} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </SectionCard>

                  <div className="grid gap-6 xl:grid-cols-2">
                    {/* Top Shops */}
                    <SectionCard theme={theme} lantern cornerLantern>
                      <CardHeader>
                        <CardTitle className={cn("text-[17px] font-bold", tk.text)}>Top Shops</CardTitle>
                        <CardDescription className={cn("text-sm", tk.textMuted)}>Branch performance ranking</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        {shopData.map((shop, i) => (
                          <div key={shop.name}>
                            <div className="mb-2.5 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className={cn("flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-bold", theme === "dark" ? "bg-white/[0.06] text-[#d8c7a8]" : "bg-amber-100 text-slate-500")}>{i + 1}</span>
                                <span className={cn("text-sm font-semibold", tk.text)}>{shop.name}</span>
                              </div>
                              <span className={cn("text-sm font-bold", tk.text)}>{shop.value}%</span>
                            </div>
                            <div className={cn("h-2 w-full overflow-hidden rounded-full", tk.progressTrack)}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${shop.value}%` }} transition={{ duration: 0.9, delay: i * 0.1 }} className="h-full rounded-full bg-gradient-to-r from-amber-600 via-orange-500 to-yellow-500" />
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </SectionCard>

                    {/* Quick Actions */}
                    <SectionCard theme={theme} lantern>
                      <CardHeader>
                        <CardTitle className={cn("text-[17px] font-bold", tk.text)}>Quick Actions</CardTitle>
                        <CardDescription className={cn("text-sm", tk.textMuted)}>Fast access to common modules</CardDescription>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-3 2xl:grid-cols-3">
                        {quickActions.map((item) => {
                          const Icon = item.icon;
                          return (
                            <motion.button whileHover={{ y: -3, scale: 1.02 }} key={item.label} className={cn("rounded-xl border p-4 text-left transition-all", theme === "dark" ? "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-amber-600/15" : "border-amber-100 bg-white hover:bg-amber-50 hover:shadow-md shadow-sm")}>
                              <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-gradient-to-br", item.color, theme === "dark" ? "border-white/[0.07]" : "border-transparent")}>
                                <Icon className={cn("h-4.5 w-4.5", item.iconColor)} />
                              </div>
                              <div className={cn("mt-3 text-[13px] font-semibold", tk.text)}>{item.label}</div>
                              <div className={cn("mt-0.5 text-[11px]", tk.textSubtle)}>Open module</div>
                            </motion.button>
                          );
                        })}
                      </CardContent>
                    </SectionCard>
                  </div>

                  {/* Transactions */}
                  <SectionCard theme={theme} lantern>
                    <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className={cn("text-[17px] font-bold", tk.text)}>Recent Transactions</CardTitle>
                        <CardDescription className={cn("text-sm", tk.textMuted)}>Filtered list of latest activities</CardDescription>
                      </div>
                      <Tabs value={txFilter} onValueChange={setTxFilter}>
                        <TabsList className={cn(theme === "dark" ? "bg-white/[0.04]" : "bg-amber-100")}>
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="paid">Paid</TabsTrigger>
                          <TabsTrigger value="pending">Pending</TabsTrigger>
                          <TabsTrigger value="refund">Refund</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-sm">
                          <thead>
                            <tr className={cn("border-b", tk.tableRowBorder)}>
                              {["Transaction", "Customer", "Shop", "Status", "Time", "Amount"].map((h, i) => (
                                <th key={h} className={cn("px-3 py-3 font-semibold text-xs uppercase tracking-wider", i === 5 ? "text-right" : "text-left", tk.tableHead)}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTransactions.map((tx) => (
                              <tr key={tx.id} className={cn("border-b transition-colors", tk.tableRow)}>
                                <td className={cn("px-3 py-3.5 font-mono text-xs font-semibold", tk.text)}>{tx.id}</td>
                                <td className={cn("px-3 py-3.5 font-medium", tk.text)}>{tx.customer}</td>
                                <td className={cn("px-3 py-3.5", tk.textMuted)}>{tx.shop}</td>
                                <td className="px-3 py-3.5">
                                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                                    tx.type === "Paid" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                      tx.type === "Pending" ? "bg-amber-600/10 text-amber-600 dark:text-amber-400" :
                                        "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                  )}>{tx.type}</span>
                                </td>
                                <td className={cn("px-3 py-3.5 text-xs", tk.textMuted)}>{tx.time}</td>
                                <td className={cn("px-3 py-3.5 text-right font-bold", tk.text)}>{money(tx.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </SectionCard>
                </div>

                <div className="space-y-6 2xl:col-span-5">
                  <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-1">
                    {/* Sales Categories */}
                    <SectionCard theme={theme} lantern cornerLantern>
                      <CardHeader>
                        <CardTitle className={cn("text-[17px] font-bold", tk.text)}>Sales Categories</CardTitle>
                        <CardDescription className={cn("text-sm", tk.textMuted)}>Breakdown by category</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[260px] 2xl:h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100} paddingAngle={3}>
                                {categoryData.map((_, index) => (
                                  <Cell key={index} fill={["#d97706", "#ea580c", "#34d399", "#ca8a04", "#f43f5e"][index]} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomTooltip theme={theme} />} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-3 space-y-2.5">
                          {categoryData.map((item, i) => (
                            <div key={item.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ["#d97706", "#ea580c", "#34d399", "#ca8a04", "#f43f5e"][i] }} />
                                <span className={cn("text-[13px] font-medium", tk.text)}>{item.name}</span>
                              </div>
                              <span className={cn("text-[13px] font-semibold", tk.textMuted)}>{item.value}%</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </SectionCard>

                    {/* AI Insight — lantern decoration */}
                    <SectionCard theme={theme} lantern className="relative overflow-hidden">
                      {theme === "dark" && (
                        <div className="pointer-events-none absolute right-2 top-0 z-10 opacity-65">
                          <SwingingLantern size={38} className="right-0 top-0" delay={0.6} dimmed={true} />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className={cn("text-[17px] font-bold", tk.text)}>AI Insight</CardTitle>
                        <CardDescription className={cn("text-sm", tk.textMuted)}>Smart business summary</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className={cn("rounded-2xl border p-5", theme === "dark" ? "border-amber-700/15 bg-gradient-to-br from-amber-700/8 to-orange-700/[0.03]" : "border-amber-200 bg-gradient-to-br from-amber-50 to-white")}>
                          <div className="mb-4 flex items-center gap-3">
                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", theme === "dark" ? "bg-amber-600/15" : "bg-amber-100")}>
                              <Bot className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                              <div className={cn("text-sm font-bold", tk.text)}>BINHLAIG AI</div>
                              <div className={cn("text-[11px]", tk.textMuted)}>Generated business insight</div>
                            </div>
                          </div>
                          <p className={cn("text-[13px] leading-relaxed", tk.textMuted)}>
                            Main Branch leads with highest conversion rate. Online Shop refunds increased slightly — snack category sales remain under-optimized. Consider weekend promotions for Branch B.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Growth chance</span>
                            <span className="inline-flex items-center rounded-full bg-amber-600/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">Review refunds</span>
                          </div>
                        </div>
                      </CardContent>
                    </SectionCard>
                  </div>

                  {/* Recent Activity */}
                  <SectionCard theme={theme} lantern className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                      <div>
                        <CardTitle className={cn("text-[17px] font-bold", tk.text)}>Recent Activity</CardTitle>
                        <CardDescription className={cn("text-sm", tk.textMuted)}>Team and system updates</CardDescription>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[
                        { title: "New customer registered", time: "5 min ago", icon: Users, color: theme === "dark" ? "bg-amber-700/10 border-amber-700/15 text-amber-400" : "bg-amber-50 border-amber-200 text-amber-600" },
                        { title: "Stock updated for 12 items", time: "18 min ago", icon: Package, color: theme === "dark" ? "bg-orange-700/10 border-orange-700/15 text-orange-400" : "bg-orange-50 border-orange-200 text-orange-600" },
                        { title: "Income report exported", time: "40 min ago", icon: Download, color: theme === "dark" ? "bg-emerald-700/10 border-emerald-700/15 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600" },
                        { title: "Branch A sales increased", time: "1 hour ago", icon: Store, color: theme === "dark" ? "bg-yellow-700/10 border-yellow-700/15 text-yellow-400" : "bg-yellow-50 border-yellow-200 text-yellow-600" },
                      ].map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <div key={i} className="flex gap-3 items-center">
                            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border", item.color)}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className={cn("text-[13px] font-semibold", tk.text)}>{item.title}</div>
                              <div className={cn("text-[11px] mt-0.5", tk.textSubtle)}>{item.time}</div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </SectionCard>

                  {/* User Card */}
                  <SectionCard theme={theme} lantern className="relative overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-amber-600/15">
                          <AvatarImage src="" />
                          <AvatarFallback className="font-bold text-sm bg-gradient-to-br from-amber-600 to-orange-700 text-white">SA</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className={cn("font-bold", tk.text)}>Sai Aung</div>
                          <div className={cn("text-xs font-medium", tk.textMuted)}>Admin Dashboard Access</div>
                        </div>
                      </div>
                      <Separator className={cn("my-4", tk.separator)} />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className={cn("rounded-xl border px-3 py-2.5", theme === "dark" ? "border-white/[0.06] bg-white/[0.03]" : "border-amber-100 bg-amber-50")}>
                          <div className={cn("text-[10px] font-semibold uppercase tracking-wider", tk.textSubtle)}>Role</div>
                          <div className={cn("mt-1 font-bold", tk.text)}>ADMIN</div>
                        </div>
                        <div className={cn("rounded-xl border px-3 py-2.5", theme === "dark" ? "border-white/[0.06] bg-white/[0.03]" : "border-amber-100 bg-amber-50")}>
                          <div className={cn("text-[10px] font-semibold uppercase tracking-wider", tk.textSubtle)}>Shop Code</div>
                          <div className={cn("mt-1 font-bold", tk.text)}>SHOP-0001</div>
                        </div>
                      </div>
                    </CardContent>
                  </SectionCard>
                </div>
              </div>
            </>
          )}

          <Separator className={cn("my-6 2xl:my-8", tk.separator)} />
          <div className={cn("flex flex-col gap-2 pb-4 text-center text-[11px] font-medium md:flex-row md:items-center md:justify-between", tk.textSubtle)}>
            <div>© 2026 BINHLAIG. Lantern dashboard UI.</div>
            <div>Warm glow effects · shadcn/ui components · cozy night mode.</div>
          </div>
        </div>
      </div>
    </div>
  );
}