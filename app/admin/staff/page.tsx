


// "use client";

// import * as React from "react";
// import { useSession } from "next-auth/react";
// import { motion, AnimatePresence } from "framer-motion";
// import CountUp from "react-countup";
// import {
//   Search, Plus, Sparkles, Users, UserCheck, Clock, Star,
//   MoreHorizontal, Eye, Pencil, Trash2, Shield, Store, Calendar,
//   Mail, MapPin, Activity, Key, Crown, RotateCcw, Phone,
//   ChevronRight, PanelRightOpen, PanelRightClose, ArrowDownAZ, ArrowUpZA,
//   BadgeCheck, Briefcase, X, TrendingUp, TrendingDown, CheckCircle2,
//   Loader2, RefreshCw, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight as PageChevronRight,
//   Cake, IdCard, Wallet, FileText, UserRound, Contact, ClipboardList,
//   LayoutGrid, List
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import {
//   DropdownMenu, DropdownMenuContent, DropdownMenuItem,
//   DropdownMenuSeparator, DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
// const STORAGE_KEY = "staff-lantern-mode-v2";
// const PAGE_SIZE_OPTIONS = [6, 9, 12, 15] as const;

// type Role = "admin" | "manager" | "cashier" | "stock";
// type Status = "active" | "on_leave" | "inactive";
// type ViewMode = "grid" | "compact";
// type SortMode = "name_asc" | "name_desc" | "rating_desc" | "sales_desc" | "joined_desc";
// type PanelTab = "profile" | "activity" | "stats" | "tasks";

// type TaskStatus = "Pending" | "In Progress" | "Done";
// type TaskPriority = "High" | "Medium" | "Low";

// type StaffTask = {
//   id: string;
//   title: string;
//   description?: string;
//   dueDate?: string;
//   status: TaskStatus;
//   priority: TaskPriority;
// };

// type StaffMember = {
//   id: string;
//   rawId: number | string;
//   dbId: number | string;
//   name: string;
//   role: Role;
//   branch: string;
//   phone: string;
//   email: string;
//   status: Status;
//   joined: string;
//   sales: number;
//   orders: number;
//   rating: number;
//   shifts: number;
//   trend: number;
//   img: string;
//   address?: string;
//   nrc?: string;
//   salary?: number;
//   emergencyContact?: string;
//   emergencyPhone?: string;
//   note?: string;
//   staffId?: number | string;
//   dateOfBirth?: string;
//   tasks?: StaffTask[];
// };

// const ACTIVITY_FEED = [
//   { id: 1, text: "Completed morning shift handover", time: "2m ago", type: "shift" },
//   { id: 2, text: "Processed 12 orders — ¥84,000", time: "1h ago", type: "sale" },
//   { id: 3, text: "Updated inventory count", time: "3h ago", type: "stock" },
//   { id: 4, text: "Received 5-star customer review", time: "5h ago", type: "review" },
//   { id: 5, text: "Logged into system at 08:02 AM", time: "8h ago", type: "login" },
// ];

// const roleCfg: Record<Role, { label: string; icon: React.FC<{ className?: string }>; color: string; emoji: string }> = {
//   admin: { label: "Admin", icon: Crown, color: "#d97706", emoji: "👑" },
//   manager: { label: "Manager", icon: Shield, color: "#c8892a", emoji: "🛡️" },
//   cashier: { label: "Cashier", icon: Key, color: "#eab308", emoji: "🔑" },
//   stock: { label: "Stock", icon: Store, color: "#b45309", emoji: "📦" },
// };

// const statusCfg: Record<Status, { label: string; color: string; emoji: string }> = {
//   active: { label: "Active", color: "#10b981", emoji: "🟢" },
//   on_leave: { label: "On Leave", color: "#f59e0b", emoji: "🟡" },
//   inactive: { label: "Inactive", color: "#94a3b8", emoji: "⚪" },
// };

// const ROLES = ["All", "Admin", "Manager", "Cashier", "Stock"];
// const STATUSES = ["All", "Active", "On Leave", "Inactive"];

// function money(n: number) { return n > 0 ? `¥${n.toLocaleString()}` : "—"; }
// function shortMoney(n: number) { return n > 0 ? `¥${(n / 1000).toFixed(0)}k` : "—"; }

// function normalizeRole(r: any): Role {
//   const v = String(r || "cashier").toLowerCase();
//   return (["admin", "manager", "cashier", "stock"] as Role[]).includes(v as Role) ? v as Role : "cashier";
// }

// function normalizeStatus(s: any): Status {
//   const v = String(s || "active").toLowerCase();
//   return (["active", "on_leave", "inactive"] as Status[]).includes(v as Status) ? v as Status : "active";
// }

// function formatDate(value?: string) {
//   if (!value) return "—";
//   return value;
// }

// function makeMockTasks(name: string): StaffTask[] {
//   return [
//     {
//       id: `TSK-${name.slice(0, 2).toUpperCase()}-01`,
//       title: "Check opening balance",
//       description: "Verify cashier opening amount before shift starts.",
//       dueDate: "09:00 AM",
//       status: "Done",
//       priority: "High",
//     },
//     {
//       id: `TSK-${name.slice(0, 2).toUpperCase()}-02`,
//       title: "Restock front shelf",
//       description: "Refill fast-moving drinks and snack items.",
//       dueDate: "11:30 AM",
//       status: "In Progress",
//       priority: "Medium",
//     },
//     {
//       id: `TSK-${name.slice(0, 2).toUpperCase()}-03`,
//       title: "Submit daily sales note",
//       description: "Prepare closing summary for manager review.",
//       dueDate: "05:00 PM",
//       status: "Pending",
//       priority: "High",
//     },
//   ];
// }

// function getTaskStats(tasks: StaffTask[] = []) {
//   return {
//     total: tasks.length,
//     pending: tasks.filter(t => t.status === "Pending").length,
//     progress: tasks.filter(t => t.status === "In Progress").length,
//     done: tasks.filter(t => t.status === "Done").length,
//   };
// }

// function taskStatusColor(status: TaskStatus) {
//   if (status === "Pending") return { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "rgba(245,158,11,0.35)" };
//   if (status === "In Progress") return { bg: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "rgba(96,165,250,0.35)" };
//   return { bg: "rgba(16,185,129,0.12)", color: "#10b981", border: "rgba(16,185,129,0.35)" };
// }

// function taskPriorityColor(priority: TaskPriority) {
//   if (priority === "High") return "#ef4444";
//   if (priority === "Medium") return "#f59e0b";
//   return "#94a3b8";
// }

// function mapApiStaffToUi(staff: any): StaffMember {
//   const name = staff.fullName || staff.name || "Unknown";
//   const img = staff.imageUrl && String(staff.imageUrl).startsWith("http")
//     ? staff.imageUrl
//     : staff.imageUrl
//       ? `${API_BASE_URL}${staff.imageUrl}`
//       : `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4`;

//   return {
//     id: `ST-${String(staff.staffId ?? staff.id ?? Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
//     rawId: staff.id ?? name,
//     dbId: staff.id ?? "",
//     name,
//     role: normalizeRole(staff.role),
//     branch: staff.branch || "Main Branch",
//     phone: staff.phone || "—",
//     email: staff.email || "—",
//     status: normalizeStatus(staff.status),
//     joined: staff.startDate || "—",
//     sales: Number(staff.sales || 0),
//     orders: Number(staff.orders || 0),
//     rating: Number(staff.rating || 4.0),
//     shifts: Number(staff.shifts || 0),
//     trend: Number(staff.trend || 0),
//     img,
//     address: staff.address || "",
//     nrc: staff.nrc || "",
//     salary: staff.salary != null ? Number(staff.salary) : 0,
//     emergencyContact: staff.emergencyContact || "",
//     emergencyPhone: staff.emergencyPhone || "",
//     note: staff.note || "",
//     staffId: staff.staffId ?? "",
//     dateOfBirth: staff.dateOfBirth || "",
//     tasks: Array.isArray(staff.tasks) && staff.tasks.length > 0 ? staff.tasks : makeMockTasks(name),
//   };
// }

// function sortStaff(items: StaffMember[], mode: SortMode) {
//   const a = [...items];
//   switch (mode) {
//     case "name_asc": return a.sort((a, b) => a.name.localeCompare(b.name));
//     case "name_desc": return a.sort((a, b) => b.name.localeCompare(a.name));
//     case "rating_desc": return a.sort((a, b) => b.rating - a.rating);
//     case "sales_desc": return a.sort((a, b) => b.sales - a.sales);
//     case "joined_desc": return a.sort((a, b) => b.joined.localeCompare(a.joined));
//     default: return a;
//   }
// }

// function buildPageNumbers(current: number, total: number) {
//   if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
//   if (current <= 4) return [1, 2, 3, 4, 5, "...", total] as const;
//   if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total] as const;
//   return [1, "...", current - 1, current, current + 1, "...", total] as const;
// }

// /* ---------------- theme ---------------- */

// function FontImport() {
//   return (
//     <style>{`
//       @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;700&display=swap');
//       * { font-family: 'DM Sans', sans-serif; }
//       .serif { font-family: 'DM Serif Display', serif !important; }
//       ::placeholder { color: rgba(122,85,32,0.75); opacity: 1; }
//     `}</style>
//   );
// }

// function glassCard(night: boolean, extra?: React.CSSProperties): React.CSSProperties {
//   return {
//     background: night ? "rgba(14,10,6,0.84)" : "rgba(255,255,255,0.90)",
//     border: `1px solid ${night ? "rgba(200,137,42,0.18)" : "rgba(216,203,184,0.55)"}`,
//     boxShadow: night
//       ? "0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(200,137,42,0.07)"
//       : "0 24px 64px rgba(26,21,16,0.10)",
//     backdropFilter: "blur(24px)",
//     ...extra,
//   };
// }

// function premiumInputStyle(night: boolean): React.CSSProperties {
//   return {
//     background: night ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.72)",
//     border: `1.5px solid ${night ? "rgba(46,32,16,1)" : "rgba(216,203,184,1)"}`,
//     color: night ? "#e8dcc8" : "#1a1510",
//     boxShadow: "none",
//   };
// }

// function sectionTitle(night: boolean) {
//   return cn("text-[10px] uppercase tracking-[0.24em] font-bold", night ? "text-[#7a5520]" : "text-[#8a7a65]");
// }

// function LanternMark({ size = 48, glow = false }: { size?: number; glow?: boolean }) {
//   const h = size * 1.5;
//   const isNight = glow;

//   return (
//     <svg width={size} height={h} viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <defs>
//         <radialGradient id="lanternCoreNightMerged" cx="50%" cy="48%" r="50%">
//           <stop offset="0%" stopColor="#fff7d6" stopOpacity="0.95" />
//           <stop offset="28%" stopColor="#fbbf24" stopOpacity="0.85" />
//           <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.45" />
//           <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
//         </radialGradient>

//         <linearGradient id="lanternBodyDayMerged" x1="6" y1="11" x2="26" y2="37" gradientUnits="userSpaceOnUse">
//           <stop offset="0%" stopColor="#fffaf1" />
//           <stop offset="45%" stopColor="#f5e7cf" />
//           <stop offset="100%" stopColor="#ecd5ae" />
//         </linearGradient>

//         <linearGradient id="lanternMetalDayMerged" x1="8" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
//           <stop offset="0%" stopColor="#c58a3c" />
//           <stop offset="50%" stopColor="#a96b28" />
//           <stop offset="100%" stopColor="#8a551d" />
//         </linearGradient>

//         <radialGradient id="lanternGlassDayMerged" cx="50%" cy="45%" r="65%">
//           <stop offset="0%" stopColor="#fffdf7" stopOpacity="0.9" />
//           <stop offset="70%" stopColor="#f6ead4" stopOpacity="0.45" />
//           <stop offset="100%" stopColor="#e8d0a4" stopOpacity="0.1" />
//         </radialGradient>
//       </defs>

//       <line x1="16" y1="0" x2="16" y2="6" stroke={isNight ? "#d6ae67" : "#9d6a2b"} strokeWidth="1.5" strokeLinecap="round" />
//       <rect x="8" y="6" width="16" height="5" rx="2" fill={isNight ? "#b07840" : "url(#lanternMetalDayMerged)"} stroke={isNight ? "#d4a060" : "#7b4a18"} strokeWidth="0.8" />
//       <rect x="6" y="11" width="20" height="26" rx="3" fill={isNight ? "#0e0908" : "url(#lanternBodyDayMerged)"} stroke={isNight ? "#9d6220" : "#a66b27"} strokeWidth="1" />

//       {isNight ? (
//         <rect x="6" y="11" width="20" height="26" rx="3" fill="url(#lanternCoreNightMerged)" />
//       ) : (
//         <rect x="6" y="11" width="20" height="26" rx="3" fill="url(#lanternGlassDayMerged)" />
//       )}

//       {[11, 16, 21].map((x) => (
//         <line
//           key={x}
//           x1={x}
//           y1="11"
//           x2={x}
//           y2="37"
//           stroke={isNight ? "#6b3e10" : "#b47b34"}
//           strokeWidth="1"
//           opacity="0.95"
//         />
//       ))}

//       {isNight && (
//         <g>
//           <motion.ellipse
//             cx="16"
//             cy="26"
//             rx="4"
//             ry="6"
//             fill="#f59e0b"
//             opacity="0.68"
//             animate={{ ry: [6, 7.1, 5.2, 6.7, 6], cx: [16, 15.5, 16.4, 15.8, 16] }}
//             transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
//           />
//           <motion.ellipse
//             cx="16"
//             cy="27"
//             rx="2.5"
//             ry="4.2"
//             fill="#fde68a"
//             animate={{ ry: [4.2, 5, 3.6, 4.6, 4.2], cx: [16, 16.3, 15.7, 16.1, 16] }}
//             transition={{ duration: 0.95, repeat: Infinity, ease: "easeInOut" }}
//           />
//           <motion.ellipse
//             cx="16"
//             cy="27.5"
//             rx="1.3"
//             ry="2.2"
//             fill="white"
//             opacity="0.85"
//             animate={{ ry: [2.2, 2.7, 1.9, 2.4, 2.2] }}
//             transition={{ duration: 0.75, repeat: Infinity, ease: "easeInOut" }}
//           />
//         </g>
//       )}

//       {!isNight && (
//         <motion.g
//           animate={{ opacity: [0.78, 1, 0.82], scale: [0.98, 1.02, 0.99] }}
//           transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
//         >
//           <ellipse cx="16" cy="25" rx="5.2" ry="7.4" fill="#fff4cf" opacity="0.72" />
//           <ellipse cx="16" cy="25.5" rx="3.2" ry="5" fill="#ffe29a" opacity="0.56" />
//           <ellipse cx="16" cy="26" rx="1.6" ry="2.8" fill="#fffdf7" opacity="0.9" />
//         </motion.g>
//       )}

//       <rect x="8" y="37" width="16" height="5" rx="2" fill={isNight ? "#b07840" : "url(#lanternMetalDayMerged)"} stroke={isNight ? "#d4a060" : "#7b4a18"} strokeWidth="0.8" />
//       <line x1="16" y1="42" x2="16" y2="47" stroke={isNight ? "#d4804a" : "#8f5b24"} strokeWidth="1.5" strokeLinecap="round" />
//       <circle cx="16" cy="47" r="1.5" fill={isNight ? "#d4804a" : "#8f5b24"} />
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
//       <AnimatePresence>
//         {dark ? (
//           <motion.div
//             key="night-glow-big"
//             initial={{ opacity: 0, scale: 0.35 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.35 }}
//             transition={{ duration: 0.45 }}
//             className="pointer-events-none absolute"
//             style={{
//               width: 76,
//               height: 76,
//               top: -6,
//               left: "50%",
//               transform: "translateX(-50%)",
//               borderRadius: "50%",
//               background:
//                 "radial-gradient(ellipse at center, rgba(251,191,36,0.52) 0%, rgba(245,158,11,0.18) 52%, transparent 76%)",
//               filter: "blur(9px)",
//             }}
//           />
//         ) : (
//           <motion.div
//             key="day-halo"
//             initial={{ opacity: 0, scale: 0.5 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.5 }}
//             transition={{ duration: 0.4 }}
//             className="pointer-events-none absolute"
//             style={{
//               width: 70,
//               height: 70,
//               top: -4,
//               left: "50%",
//               transform: "translateX(-50%)",
//               borderRadius: "50%",
//               background:
//                 "radial-gradient(ellipse at center, rgba(255,233,180,0.55) 0%, rgba(245,190,95,0.18) 55%, transparent 78%)",
//               filter: "blur(10px)",
//             }}
//           />
//         )}
//       </AnimatePresence>

//       <LanternMark size={34} glow={dark} />

//       <span
//         style={{
//           marginTop: 5,
//           fontSize: 7,
//           fontWeight: 700,
//           letterSpacing: "0.2em",
//           color: dark ? "#c8892a" : "#9a6c2a",
//           transition: "color 0.4s",
//           fontFamily: "'DM Sans', sans-serif",
//         }}
//       >
//         {dark ? "NIGHT" : "DAY"}
//       </span>
//     </motion.button>
//   );
// }

// function NightParticles() {
//   const particles = React.useMemo(
//     () =>
//       Array.from({ length: 34 }).map((_, i) => ({
//         id: i,
//         x: `${(i * 31 + 7) % 100}%`,
//         y: `${(i * 47 + 13) % 100}%`,
//         size: 1.5 + (i % 3) * 1,
//         dur: 2.5 + (i % 4) * 0.7,
//         delay: (i * 0.21) % 4,
//         color: ["#e0e7ff", "#fef3c7", "#ddd6fe", "#ffffff", "#fde68a"][i % 5],
//       })),
//     []
//   );

//   return (
//     <div className="pointer-events-none fixed inset-0 overflow-hidden">
//       {particles.map((p) => (
//         <motion.div
//           key={p.id}
//           className="absolute rounded-full"
//           style={{ left: p.x, top: p.y, width: p.size, height: p.size, background: p.color }}
//           animate={{ opacity: [0.08, 0.9, 0.08], scale: [0.7, 1.4, 0.7] }}
//           transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
//         />
//       ))}
//     </div>
//   );
// }

// function DayParticles() {
//   const motes = React.useMemo(
//     () =>
//       Array.from({ length: 14 }).map((_, i) => ({
//         id: i,
//         x: `${(i * 23 + 8) % 96}%`,
//         y: `${(i * 41 + 11) % 90}%`,
//         size: 60 + (i % 4) * 30,
//         dur: 6 + (i % 3) * 2,
//         delay: i * 0.5,
//         color: [
//           "rgba(200,137,42,0.06)",
//           "rgba(245,158,11,0.05)",
//           "rgba(251,191,36,0.04)",
//           "rgba(210,160,60,0.06)",
//         ][i % 4],
//       })),
//     []
//   );

//   return (
//     <div className="pointer-events-none fixed inset-0 overflow-hidden">
//       {motes.map((m) => (
//         <motion.div
//           key={m.id}
//           className="absolute rounded-full"
//           style={{
//             left: m.x,
//             top: m.y,
//             width: m.size,
//             height: m.size,
//             background: m.color,
//             filter: "blur(24px)",
//           }}
//           animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
//           transition={{ duration: m.dur, repeat: Infinity, delay: m.delay, ease: "easeInOut" }}
//         />
//       ))}
//     </div>
//   );
// }

// /* ---------------- ui bits ---------------- */

// function Sparkline({ data, color }: { data: number[]; color: string }) {
//   const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
//   const w = 72, h = 26;
//   const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
//   return (
//     <svg width={w} height={h} className="overflow-visible">
//       <defs>
//         <linearGradient id={`sg${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
//           <stop offset="0%" stopColor={color} stopOpacity={0.35} />
//           <stop offset="100%" stopColor={color} stopOpacity={0} />
//         </linearGradient>
//       </defs>
//       <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sg${color.replace("#", "")})`} />
//       <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
//   );
// }

// function generateSparkData(base: number, trend: number) {
//   return Array.from({ length: 7 }, (_, i) => Math.max(0, base + trend * i * 0.5 + (Math.random() - 0.5) * 20));
// }

// function Avatar({ src, name, className }: { src: string; name: string; className?: string }) {
//   const [failed, setFailed] = React.useState(false);
//   const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
//   if (failed) return (
//     <div className={cn("flex items-center justify-center font-bold text-white", className)}
//       style={{ background: "linear-gradient(135deg,#a07020,#c8892a)" }}>
//       {initials}
//     </div>
//   );
//   return <img src={src} alt={name} className={className} draggable={false} onError={() => setFailed(true)} />;
// }

// function RatingStars({ rating }: { rating: number }) {
//   return (
//     <div className="flex items-center gap-0.5">
//       {Array.from({ length: 5 }).map((_, i) => (
//         <Star key={i} className={cn("h-3 w-3", i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-gray-400/40")} />
//       ))}
//       <span className="ml-1 text-[11px] font-bold text-amber-500">{rating.toFixed(1)}</span>
//     </div>
//   );
// }

// function MiniBadge({ text, night, color }: { text: string; night: boolean; color: string }) {
//   return (
//     <span
//       className="rounded-full px-2.5 py-1 text-[10px] font-bold"
//       style={{
//         background: night ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
//         border: `1px solid ${color}55`,
//         color,
//       }}
//     >
//       {text}
//     </span>
//   );
// }

// function KpiCard({
//   label, value, sub, icon: Icon, color, night
// }: { label: string; value: number; sub: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string; night: boolean }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
//       whileHover={{ y: -4, scale: 1.015 }}
//       transition={{ duration: 0.35 }}
//       className="relative overflow-hidden rounded-[22px] p-4"
//       style={glassCard(night)}
//     >
//       <div className="absolute left-0 right-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
//       <div className="mb-3 flex items-center justify-between">
//         <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
//           <Icon className="h-4 w-4" style={{ color }} />
//         </div>
//         <span className={sectionTitle(night)}>{label}</span>
//       </div>
//       <div className={cn("serif text-4xl leading-none", night ? "text-[#e8dcc8]" : "text-[#1a1510]")}>
//         <CountUp end={value} duration={1.1} separator="," decimals={value % 1 !== 0 ? 1 : 0} />
//       </div>
//       <div className="mt-2 text-[11px]" style={{ color: night ? "#6d5d4b" : "#8e7f6e" }}>{sub}</div>
//     </motion.div>
//   );
// }

// function PremiumPill({
//   children, active, onClick, color, night
// }: { children: React.ReactNode; active: boolean; onClick: () => void; color: string; night: boolean }) {
//   return (
//     <motion.button
//       type="button"
//       onClick={onClick}
//       whileHover={{ scale: 1.03, y: -1 }}
//       whileTap={{ scale: 0.97 }}
//       className="rounded-full px-3.5 py-2 text-[11px] font-bold"
//       style={{
//         background: active
//           ? `linear-gradient(135deg, ${color}, #d4a352)`
//           : night ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)",
//         color: active ? "#140d05" : (night ? "#bca98f" : "#7d6f60"),
//         border: `1px solid ${active ? "rgba(212,163,82,0.65)" : (night ? "rgba(255,255,255,0.05)" : "rgba(216,203,184,0.7)")}`,
//         boxShadow: active ? "0 10px 24px rgba(200,137,42,0.18)" : "none",
//       }}
//     >
//       {children}
//     </motion.button>
//   );
// }

// function StaffCard({
//   member, selected, onSelect, night
// }: { member: StaffMember; selected?: boolean; onSelect?: (m: StaffMember) => void; night: boolean }) {
//   const role = roleCfg[member.role];
//   const status = statusCfg[member.status];
//   const sparkData = React.useMemo(() => generateSparkData(50, member.trend), [member.id, member.trend]);
//   const sparkColor = member.trend >= 0 ? "#10b981" : "#ef4444";
//   const taskStats = getTaskStats(member.tasks || []);

//   return (
//     <motion.button
//       whileHover={{ y: -6, scale: 1.01 }}
//       whileTap={{ scale: 0.99 }}
//       onClick={() => onSelect?.(member)}
//       className="w-full overflow-hidden rounded-[24px] text-left"
//       style={{
//         ...glassCard(night),
//         border: `1px solid ${selected ? "rgba(212,163,82,0.55)" : (night ? "rgba(200,137,42,0.18)" : "rgba(216,203,184,0.55)")}`,
//       }}
//     >
//       <div className="relative p-5">
//         <div className="absolute left-0 right-0 top-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #c8892a, transparent)" }} />

//         <div className="mb-4 flex items-start justify-between">
//           <div className="flex items-center gap-3">
//             <div className="relative">
//               <div
//                 className="h-14 w-14 overflow-hidden rounded-full p-[2px]"
//                 style={{ background: "linear-gradient(135deg,#7a5210,#d4a352,#7a5210)" }}
//               >
//                 <Avatar src={member.img} name={member.name} className="h-full w-full rounded-full object-cover" />
//               </div>
//               <span
//                 className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2"
//                 style={{
//                   background: status.color,
//                   borderColor: night ? "#100802" : "white"
//                 }}
//               />
//             </div>

//             <div>
//               <div className={cn("serif text-[28px] leading-none", night ? "text-[#e8dcc8]" : "text-[#1a1510]")}>
//                 {member.name}
//               </div>
//               <div className="mt-1 text-[11px]" style={{ color: night ? "#7a5520" : "#8a7a65" }}>
//                 {member.id} · {member.branch}
//               </div>
//             </div>
//           </div>

//           <MiniBadge text={status.label} night={night} color={status.color} />
//         </div>

//         <div className="mb-4 flex flex-wrap items-center gap-2">
//           <MiniBadge text={`${role.emoji} ${role.label}`} night={night} color={role.color} />
//           <MiniBadge text={`Staff ID ${member.staffId || "—"}`} night={night} color="#c8892a" />
//         </div>

//         <div className="mb-4 grid grid-cols-3 gap-2">
//           {[
//             { l: "Sales", v: shortMoney(member.sales) },
//             { l: "Orders", v: member.orders > 0 ? String(member.orders) : "—" },
//             { l: "Shifts", v: String(member.shifts) },
//           ].map(item => (
//             <div
//               key={item.l}
//               className="rounded-[16px] p-3 text-center"
//               style={{
//                 background: night ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.65)",
//                 border: `1px solid ${night ? "rgba(255,255,255,0.05)" : "rgba(216,203,184,0.7)"}`,
//               }}
//             >
//               <div className="text-[9px] uppercase tracking-[0.18em]" style={{ color: night ? "#6d5d4b" : "#8e7f6e" }}>{item.l}</div>
//               <div className={cn("mt-1 text-[14px] font-bold", night ? "text-[#e8dcc8]" : "text-[#1a1510]")}>{item.v}</div>
//             </div>
//           ))}
//         </div>

//         <div className="mb-3 flex items-center justify-between">
//           <RatingStars rating={member.rating} />
//           <span className={cn(
//             "flex items-center gap-1 text-[11px] font-bold",
//             member.trend > 0 ? "text-emerald-500" : member.trend < 0 ? "text-rose-400" : "text-gray-400"
//           )}>
//             {member.trend > 0 ? <TrendingUp className="h-3 w-3" /> : member.trend < 0 ? <TrendingDown className="h-3 w-3" /> : null}
//             {member.trend !== 0 ? `${member.trend > 0 ? "+" : ""}${member.trend}%` : "Stable"}
//           </span>
//         </div>

//         <div className="mb-4 flex items-center justify-between">
//           <div className="text-[11px]" style={{ color: night ? "#8a7a65" : "#8e7f6e" }}>Weekly trend</div>
//           <Sparkline data={sparkData} color={sparkColor} />
//         </div>

//         <div
//           className="rounded-[18px] p-3"
//           style={{
//             background: night ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.60)",
//             border: `1px solid ${night ? "rgba(255,255,255,0.04)" : "rgba(216,203,184,0.7)"}`,
//           }}
//         >
//           <div className="mb-2 flex items-center justify-between">
//             <span className={sectionTitle(night)}>Tasks</span>
//             <span className="text-[11px]" style={{ color: night ? "#8a7a65" : "#8e7f6e" }}>{taskStats.total} total</span>
//           </div>
//           <div className="grid grid-cols-3 gap-2">
//             <MiniBadge text={`⏳ ${taskStats.pending}`} night={night} color="#f59e0b" />
//             <MiniBadge text={`⚡ ${taskStats.progress}`} night={night} color="#60a5fa" />
//             <MiniBadge text={`✅ ${taskStats.done}`} night={night} color="#10b981" />
//           </div>
//         </div>

//         <div className="mt-4 flex items-center justify-between">
//           <div className="text-[11px]" style={{ color: night ? "#8a7a65" : "#8e7f6e" }}>
//             {member.salary ? `¥${Number(member.salary).toLocaleString()}` : "No salary"}
//           </div>

//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <button
//                 className="flex h-9 w-9 items-center justify-center rounded-full"
//                 style={{
//                   background: night ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.78)",
//                   border: `1px solid ${night ? "rgba(255,255,255,0.05)" : "rgba(216,203,184,0.7)"}`,
//                 }}
//               >
//                 <MoreHorizontal className="h-4 w-4" style={{ color: night ? "#bca98f" : "#7d6f60" }} />
//               </button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="min-w-[170px] rounded-2xl border p-2 shadow-xl bg-white">
//               {[{ icon: Eye, label: "View Profile" }, { icon: Pencil, label: "Edit Staff" }, { icon: ClipboardList, label: "Assign Task" }, { icon: Activity, label: "Activity" }].map(item => (
//                 <DropdownMenuItem key={item.label} className="cursor-pointer rounded-xl gap-2 py-2.5 text-[13px] font-medium">
//                   <item.icon className="h-3.5 w-3.5" />{item.label}
//                 </DropdownMenuItem>
//               ))}
//               <DropdownMenuSeparator />
//               <DropdownMenuItem className="cursor-pointer rounded-xl gap-2 py-2.5 text-[13px] font-medium text-rose-500">
//                 <Trash2 className="h-3.5 w-3.5" /> Remove
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>
//     </motion.button>
//   );
// }

// function CompactCard({
//   member, selected, onSelect, night
// }: { member: StaffMember; selected?: boolean; onSelect?: (m: StaffMember) => void; night: boolean }) {
//   const role = roleCfg[member.role];
//   const status = statusCfg[member.status];
//   return (
//     <motion.button
//       whileHover={{ x: 3, scale: 1.005 }}
//       whileTap={{ scale: 0.995 }}
//       onClick={() => onSelect?.(member)}
//       className="w-full rounded-[22px] p-4 text-left"
//       style={{
//         ...glassCard(night),
//         border: `1px solid ${selected ? "rgba(212,163,82,0.55)" : (night ? "rgba(200,137,42,0.18)" : "rgba(216,203,184,0.55)")}`,
//       }}
//     >
//       <div className="flex items-center gap-4">
//         <div
//           className="rounded-full p-[2px]"
//           style={{ background: "linear-gradient(135deg,#7a5210,#d4a352,#7a5210)" }}
//         >
//           <Avatar src={member.img} name={member.name} className="h-14 w-14 rounded-full object-cover" />
//         </div>

//         <div className="min-w-0 flex-1">
//           <div className="flex items-center gap-2 flex-wrap">
//             <span className={cn("serif text-[24px] leading-none", night ? "text-[#e8dcc8]" : "text-[#1a1510]")}>{member.name}</span>
//             <MiniBadge text={role.label} night={night} color={role.color} />
//             <MiniBadge text={status.label} night={night} color={status.color} />
//           </div>
//           <div className="mt-1 text-[11px]" style={{ color: night ? "#7a5520" : "#8a7a65" }}>
//             {member.id} · {member.branch} · Staff ID {member.staffId || "—"}
//           </div>
//           <div className="mt-2 flex flex-wrap gap-2">
//             <MiniBadge text={`Sales ${shortMoney(member.sales)}`} night={night} color="#c8892a" />
//             <MiniBadge text={`${member.orders} orders`} night={night} color="#60a5fa" />
//             <MiniBadge text={`${member.shifts} shifts`} night={night} color="#10b981" />
//           </div>
//         </div>

//         <div className="flex flex-col items-end gap-2">
//           <RatingStars rating={member.rating} />
//           <ChevronRight className="h-4 w-4" style={{ color: night ? "#bca98f" : "#7d6f60" }} />
//         </div>
//       </div>
//     </motion.button>
//   );
// }

// function DetailPanel({
//   member,
//   onClose,
//   onAddTask,
//   onUpdateTaskStatus,
//   night,
// }: {
//   member: StaffMember | null;
//   onClose: () => void;
//   onAddTask: (staffId: string, task: Omit<StaffTask, "id">) => void;
//   onUpdateTaskStatus: (staffId: string, taskId: string, status: TaskStatus) => void;
//   night: boolean;
// }) {
//   const [tab, setTab] = React.useState<PanelTab>("profile");
//   const actIcons: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = { shift: Clock, sale: Activity, stock: Store, review: Star, login: CheckCircle2 };

//   return (
//     <div className="sticky top-5 h-fit overflow-hidden rounded-[26px]" style={glassCard(night)}>
//       <div className="px-5 py-4" style={{ borderBottom: `1px solid ${night ? "rgba(255,255,255,0.05)" : "rgba(216,203,184,0.7)"}` }}>
//         <div className="mb-3 flex items-center justify-between">
//           <div>
//             <div className={sectionTitle(night)}>Staff Detail</div>
//             <div className={cn("serif mt-1 text-[30px] leading-none", night ? "text-[#e8dcc8]" : "text-[#1a1510]")}>
//               {member ? member.name : "Preview"}
//             </div>
//           </div>
//           <button onClick={onClose} className="rounded-full p-2" style={premiumInputStyle(night)}>
//             <X className="h-4 w-4" style={{ color: night ? "#bca98f" : "#7d6f60" }} />
//           </button>
//         </div>

//         {member && (
//           <div className="flex gap-1 rounded-full p-1" style={{ background: night ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)", border: `1px solid ${night ? "rgba(255,255,255,0.04)" : "rgba(216,203,184,0.7)"}` }}>
//             {(["profile", "activity", "stats", "tasks"] as PanelTab[]).map(tb => (
//               <button
//                 key={tb}
//                 type="button"
//                 onClick={() => setTab(tb)}
//                 className="rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
//                 style={{
//                   background: tab === tb ? "linear-gradient(135deg,#a07020,#d4a352)" : "transparent",
//                   color: tab === tb ? "#140d05" : (night ? "#bca98f" : "#7d6f60")
//                 }}
//               >
//                 {tb}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       {!member ? (
//         <div className="p-10 text-center">
//           <div className="mb-4 flex justify-center"><LanternMark size={42} glow={night} /></div>
//           <div className={cn("serif text-[30px]", night ? "text-[#e8dcc8]" : "text-[#1a1510]")}>No staff selected</div>
//           <div className="mt-2 text-[12px]" style={{ color: night ? "#7a5520" : "#8a7a65" }}>Choose any staff card to preview details here.</div>
//         </div>
//       ) : (
//         <AnimatePresence mode="wait">
//           <motion.div key={`${member.id}-${tab}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
//             {tab === "profile" && (
//               <div className="space-y-4 p-5">
//                 <div className="flex items-center gap-4">
//                   <div className="rounded-full p-[2px]" style={{ background: "linear-gradient(135deg,#7a5210,#d4a352,#7a5210)" }}>
//                     <Avatar src={member.img} name={member.name} className="h-20 w-20 rounded-full object-cover" />
//                   </div>
//                   <div>
//                     <div className={cn("serif text-[34px] leading-none", night ? "text-[#e8dcc8]" : "text-[#1a1510]")}>{member.name}</div>
//                     <div className="mt-2 flex flex-wrap gap-2">
//                       <MiniBadge text={roleCfg[member.role].label} night={night} color={roleCfg[member.role].color} />
//                       <MiniBadge text={statusCfg[member.status].label} night={night} color={statusCfg[member.status].color} />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                   {[
//                     { l: "Orders", v: member.orders || "—", icon: BadgeCheck, color: "#60a5fa" },
//                     { l: "Sales", v: money(member.sales), icon: Activity, color: "#c8892a" },
//                     { l: "Shifts", v: member.shifts, icon: Clock, color: "#10b981" },
//                     { l: "Rating", v: member.rating.toFixed(1) + " ★", icon: Star, color: "#f59e0b" },
//                   ].map(item => (
//                     <div key={item.l} className="rounded-[18px] p-3" style={premiumInputStyle(night)}>
//                       <item.icon className="mb-2 h-4 w-4" style={{ color: item.color }} />
//                       <div className="text-[9px] uppercase tracking-[0.18em]" style={{ color: night ? "#6d5d4b" : "#8e7f6e" }}>{item.l}</div>
//                       <div className={cn("mt-1 text-[16px] font-bold", night ? "text-[#e8dcc8]" : "text-[#1a1510]")}>{item.v}</div>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="rounded-[18px] p-4" style={premiumInputStyle(night)}>
//                   <div className={sectionTitle(night)}>Staff Information</div>
//                   <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] md:grid-cols-2">
//                     {[
//                       { icon: IdCard, label: "Staff ID", value: member.staffId || "—" },
//                       { icon: Cake, label: "Date of Birth", value: formatDate(member.dateOfBirth) },
//                       { icon: Phone, label: "Phone", value: member.phone || "—" },
//                       { icon: Mail, label: "Email", value: member.email || "—" },
//                       { icon: FileText, label: "NRC", value: member.nrc || "—" },
//                       { icon: Wallet, label: "Salary", value: member.salary ? `¥${Number(member.salary).toLocaleString()}` : "—" },
//                       { icon: Calendar, label: "Start Date", value: formatDate(member.joined) },
//                       { icon: Briefcase, label: "Branch", value: member.branch || "—" },
//                     ].map((row, i) => (
//                       <div key={i} className="rounded-[14px] p-3" style={{ background: night ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)", border: `1px solid ${night ? "rgba(255,255,255,0.04)" : "rgba(216,203,184,0.7)"}` }}>
//                         <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.16em]" style={{ color: night ? "#7a5520" : "#8a7a65" }}>
//                           <row.icon className="h-3 w-3" /> {row.label}
//                         </div>
//                         <div className={cn("font-medium break-all", night ? "text-[#e8dcc8]" : "text-[#1a1510]")}>{row.value}</div>
//                       </div>
//                     ))}
//                     <div className="rounded-[14px] p-3 md:col-span-2" style={{ background: night ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)", border: `1px solid ${night ? "rgba(255,255,255,0.04)" : "rgba(216,203,184,0.7)"}` }}>
//                       <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.16em]" style={{ color: night ? "#7a5520" : "#8a7a65" }}>
//                         <MapPin className="h-3 w-3" /> Address
//                       </div>
//                       <div className={cn("font-medium", night ? "text-[#e8dcc8]" : "text-[#1a1510]")}>{member.address || "—"}</div>
//                     </div>
//                     <div className="rounded-[14px] p-3 md:col-span-2" style={{ background: night ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)", border: `1px solid ${night ? "rgba(255,255,255,0.04)" : "rgba(216,203,184,0.7)"}` }}>
//                       <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.16em]" style={{ color: night ? "#7a5520" : "#8a7a65" }}>
//                         <FileText className="h-3 w-3" /> Note
//                       </div>
//                       <div className={cn("font-medium whitespace-pre-wrap", night ? "text-[#e8dcc8]" : "text-[#1a1510]")}>{member.note || "—"}</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {tab === "activity" && (
//               <div className="p-5">
//                 <div className={sectionTitle(night)}>Recent Activity</div>
//                 <div className="mt-4 space-y-2">
//                   {ACTIVITY_FEED.map((act, i) => {
//                     const Icon = actIcons[act.type] || Activity;
//                     return (
//                       <motion.div
//                         key={act.id}
//                         initial={{ opacity: 0, x: -10 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: i * 0.06 }}
//                         className="flex gap-3 rounded-[16px] p-3"
//                         style={premiumInputStyle(night)}
//                       >
//                         <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "rgba(200,137,42,0.12)" }}>
//                           <Icon className="h-4 w-4" style={{ color: "#c8892a" }} />
//                         </div>
//                         <div>
//                           <div className={cn("text-[12px] font-medium", night ? "text-[#e8dcc8]" : "text-[#1a1510]")}>{act.text}</div>
//                           <div className="mt-1 text-[10px]" style={{ color: night ? "#7a5520" : "#8a7a65" }}>{act.time}</div>
//                         </div>
//                       </motion.div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {tab === "stats" && (
//               <div className="space-y-3 p-5">
//                 <div className={sectionTitle(night)}>Performance</div>
//                 {[
//                   { l: "Monthly Sales", v: member.sales, max: 1300000, color: "#c8892a" },
//                   { l: "Orders Completed", v: member.orders, max: 500, color: "#60a5fa" },
//                   { l: "Shifts Attended", v: member.shifts, max: 25, color: "#10b981" }
//                 ].map(stat => (
//                   <div key={stat.l} className="rounded-[18px] p-4" style={premiumInputStyle(night)}>
//                     <div className="mb-2 flex items-center justify-between">
//                       <div className="text-[11px] font-bold" style={{ color: night ? "#bca98f" : "#7d6f60" }}>{stat.l}</div>
//                       <div className="font-bold" style={{ color: stat.color }}>
//                         {stat.l.includes("Sales") ? shortMoney(stat.v) : stat.v}
//                       </div>
//                     </div>
//                     <div className="h-2 overflow-hidden rounded-full" style={{ background: night ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)" }}>
//                       <motion.div
//                         className="h-full rounded-full"
//                         style={{ background: `linear-gradient(90deg, ${stat.color}, #d4a352)` }}
//                         initial={{ width: 0 }}
//                         animate={{ width: `${Math.min(100, (stat.v / stat.max) * 100)}%` }}
//                         transition={{ duration: 0.8 }}
//                       />
//                     </div>
//                     <div className="mt-2 text-[10px]" style={{ color: night ? "#7a5520" : "#8a7a65" }}>
//                       {Math.round((stat.v / stat.max) * 100)}% of target
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {tab === "tasks" && (
//               <div className="space-y-4 p-5">
//                 <div className="flex items-center justify-between">
//                   <div className={sectionTitle(night)}>Assigned Tasks</div>
//                   <button
//                     type="button"
//                     onClick={() =>
//                       onAddTask(member.id, {
//                         title: "New assigned task",
//                         description: "Task created from admin staff panel.",
//                         dueDate: "06:00 PM",
//                         status: "Pending",
//                         priority: "Medium",
//                       })
//                     }
//                     className="rounded-full px-3 py-1.5 text-[11px] font-bold"
//                     style={{ background: "linear-gradient(135deg,#a07020,#d4a352)", color: "#140d05" }}
//                   >
//                     + Assign Task
//                   </button>
//                 </div>

//                 {(member.tasks || []).map(task => {
//                   const statusStyle = taskStatusColor(task.status);
//                   const priorityColor = taskPriorityColor(task.priority);

//                   return (
//                     <div key={task.id} className="rounded-[18px] p-4" style={premiumInputStyle(night)}>
//                       <div className="flex items-start justify-between gap-3">
//                         <div className="min-w-0 flex-1">
//                           <div className="flex items-center gap-2">
//                             <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: priorityColor }} />
//                             <div className={cn("text-[13px] font-bold", night ? "text-[#e8dcc8]" : "text-[#1a1510]")}>{task.title}</div>
//                           </div>
//                           <div className="mt-1 text-[11px]" style={{ color: night ? "#8a7a65" : "#8e7f6e" }}>
//                             {task.description || "No description"}
//                           </div>
//                           <div className="mt-2 flex flex-wrap gap-2">
//                             <MiniBadge text={task.id} night={night} color="#c8892a" />
//                             <MiniBadge text={task.priority} night={night} color={priorityColor} />
//                             <MiniBadge text={`Due ${task.dueDate || "—"}`} night={night} color="#60a5fa" />
//                           </div>
//                         </div>

//                         <span
//                           className="rounded-full px-3 py-1 text-[10px] font-bold"
//                           style={{
//                             background: statusStyle.bg,
//                             color: statusStyle.color,
//                             border: `1px solid ${statusStyle.border}`,
//                           }}
//                         >
//                           {task.status}
//                         </span>
//                       </div>

//                       <div className="mt-3 flex flex-wrap gap-2">
//                         {(["Pending", "In Progress", "Done"] as TaskStatus[]).map((s) => (
//                           <button
//                             key={s}
//                             type="button"
//                             onClick={() => onUpdateTaskStatus(member.id, task.id, s)}
//                             className="rounded-full px-3 py-1.5 text-[10px] font-bold"
//                             style={{
//                               background: task.status === s ? "linear-gradient(135deg,#a07020,#d4a352)" : "transparent",
//                               color: task.status === s ? "#140d05" : (night ? "#bca98f" : "#7d6f60"),
//                               border: `1px solid ${task.status === s ? "rgba(212,163,82,0.65)" : (night ? "rgba(255,255,255,0.05)" : "rgba(216,203,184,0.7)")}`,
//                             }}
//                           >
//                             {s}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </motion.div>
//         </AnimatePresence>
//       )}
//     </div>
//   );
// }

// function PaginationBar({
//   currentPage,
//   totalPages,
//   pageSize,
//   totalItems,
//   startIndex,
//   endIndex,
//   onPageChange,
//   onPageSizeChange,
//   night,
// }: {
//   currentPage: number;
//   totalPages: number;
//   pageSize: number;
//   totalItems: number;
//   startIndex: number;
//   endIndex: number;
//   onPageChange: (page: number) => void;
//   onPageSizeChange: (size: number) => void;
//   night: boolean;
// }) {
//   const pages = buildPageNumbers(currentPage, totalPages);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="mt-5 rounded-[24px] p-4"
//       style={glassCard(night)}
//     >
//       <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//         <div className="flex flex-wrap items-center gap-3">
//           <div
//             className="rounded-full px-4 py-2 text-[12px] font-bold"
//             style={{
//               background: night ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)",
//               border: `1px solid ${night ? "rgba(255,255,255,0.05)" : "rgba(216,203,184,0.7)"}`,
//               color: night ? "#bca98f" : "#7d6f60",
//             }}
//           >
//             Showing {totalItems === 0 ? 0 : startIndex}-{endIndex} of {totalItems}
//           </div>

//           <div className="flex items-center gap-2 rounded-full px-3 py-2" style={premiumInputStyle(night)}>
//             <span className="text-[11px] font-bold" style={{ color: night ? "#bca98f" : "#7d6f60" }}>Cards</span>
//             {PAGE_SIZE_OPTIONS.map(size => (
//               <button
//                 key={size}
//                 type="button"
//                 onClick={() => onPageSizeChange(size)}
//                 className="rounded-full px-3 py-1 text-[11px] font-bold"
//                 style={{
//                   background: pageSize === size ? "linear-gradient(135deg,#a07020,#d4a352)" : "transparent",
//                   color: pageSize === size ? "#140d05" : (night ? "#bca98f" : "#7d6f60"),
//                   border: `1px solid ${pageSize === size ? "rgba(212,163,82,0.65)" : "transparent"}`,
//                 }}
//               >
//                 {size}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           {[
//             { icon: ChevronsLeft, page: 1, disabled: currentPage === 1 },
//             { icon: ChevronLeft, page: currentPage - 1, disabled: currentPage === 1 },
//           ].map((btn, i) => (
//             <button
//               key={i}
//               type="button"
//               disabled={btn.disabled}
//               onClick={() => onPageChange(btn.page)}
//               className="h-10 w-10 rounded-[14px] disabled:opacity-40"
//               style={premiumInputStyle(night)}
//             >
//               <btn.icon className="mx-auto h-4 w-4" style={{ color: night ? "#bca98f" : "#7d6f60" }} />
//             </button>
//           ))}

//           <div className="flex items-center gap-2 rounded-[18px] px-2 py-2" style={premiumInputStyle(night)}>
//             {pages.map((page, idx) =>
//               page === "..." ? (
//                 <span key={`ellipsis-${idx}`} className="px-2 text-sm font-bold" style={{ color: night ? "#7a5520" : "#8a7a65" }}>...</span>
//               ) : (
//                 <button
//                   key={page}
//                   type="button"
//                   onClick={() => onPageChange(page)}
//                   className="min-w-[40px] h-10 rounded-[14px] px-3 text-[12px] font-bold"
//                   style={{
//                     background: currentPage === page ? "linear-gradient(135deg,#a07020,#d4a352)" : "transparent",
//                     color: currentPage === page ? "#140d05" : (night ? "#bca98f" : "#7d6f60"),
//                     border: `1px solid ${currentPage === page ? "rgba(212,163,82,0.65)" : "transparent"}`,
//                   }}
//                 >
//                   {page}
//                 </button>
//               )
//             )}
//           </div>

//           {[
//             { icon: PageChevronRight, page: currentPage + 1, disabled: currentPage === totalPages || totalPages === 0 },
//             { icon: ChevronsRight, page: totalPages, disabled: currentPage === totalPages || totalPages === 0 },
//           ].map((btn, i) => (
//             <button
//               key={i}
//               type="button"
//               disabled={btn.disabled}
//               onClick={() => onPageChange(btn.page)}
//               className="h-10 w-10 rounded-[14px] disabled:opacity-40"
//               style={premiumInputStyle(night)}
//             >
//               <btn.icon className="mx-auto h-4 w-4" style={{ color: night ? "#bca98f" : "#7d6f60" }} />
//             </button>
//           ))}
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// export default function StaffPage() {
//   const { data: session, status: sessionStatus } = useSession();

//   const [staffList, setStaffList] = React.useState<StaffMember[]>([]);
//   const [q, setQ] = React.useState("");
//   const [roleFilter, setRoleFilter] = React.useState("All");
//   const [statusFilter, setStatusFilter] = React.useState("All");
//   const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
//   const [sortMode, setSortMode] = React.useState<SortMode>("name_asc");
//   const [selectedId, setSelectedId] = React.useState<string | null>(null);
//   const [panelOpen, setPanelOpen] = React.useState(true);
//   const [notification, setNotification] = React.useState<string | null>(null);
//   const [loading, setLoading] = React.useState(true);
//   const [error, setError] = React.useState<string | null>(null);
//   const [refreshing, setRefreshing] = React.useState(false);
//   const [currentPage, setCurrentPage] = React.useState(1);
//   const [pageSize, setPageSize] = React.useState<number>(9);
//   const [night, setNight] = React.useState(true);

//   function showNotif(msg: string) {
//     setNotification(msg);
//     setTimeout(() => setNotification(null), 3000);
//   }

//   const fetchStaff = React.useCallback(async (refresh = false) => {
//     try {
//       const accessToken = (session as any)?.accessToken;

//       if (!accessToken) {
//         setStaffList([]);
//         if (sessionStatus !== "loading") {
//           setError("Session expired. Please sign in again.");
//         }
//         return;
//       }

//       refresh ? setRefreshing(true) : setLoading(true);
//       setError(null);

//       const res = await fetch(`${API_BASE_URL}/api/staff`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//         cache: "no-store"
//       });

//       if (res.status === 401) {
//         throw new Error("Session expired. Please sign in again.");
//       }

//       if (!res.ok) throw new Error(`Failed (${res.status})`);

//       const data = await res.json();
//       setStaffList(Array.isArray(data) ? data.map(mapApiStaffToUi) : []);
//     } catch (e) {
//       setError(e instanceof Error ? e.message : "Error");
//       setStaffList([]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [session, sessionStatus]);

//   React.useEffect(() => {
//     if (sessionStatus === "authenticated") {
//       fetchStaff();
//     } else if (sessionStatus === "unauthenticated") {
//       setStaffList([]);
//       setLoading(false);
//       setError("Please sign in again.");
//     }
//   }, [fetchStaff, sessionStatus]);

//   React.useEffect(() => {
//     const saved = localStorage.getItem(STORAGE_KEY);
//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);
//         if (parsed.viewMode) setViewMode(parsed.viewMode);
//         if (parsed.sortMode) setSortMode(parsed.sortMode);
//         if (typeof parsed.panelOpen === "boolean") setPanelOpen(parsed.panelOpen);
//         if (parsed.pageSize) setPageSize(parsed.pageSize);
//         if (typeof parsed.night === "boolean") setNight(parsed.night);
//       } catch { }
//     }
//   }, []);

//   React.useEffect(() => {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify({ viewMode, sortMode, panelOpen, pageSize, night }));
//   }, [viewMode, sortMode, panelOpen, pageSize, night]);

//   function addTaskToStaff(staffId: string, task: Omit<StaffTask, "id">) {
//     setStaffList(prev =>
//       prev.map(staff =>
//         staff.id === staffId
//           ? { ...staff, tasks: [{ id: `TSK-${Date.now()}`, ...task }, ...(staff.tasks || [])] }
//           : staff
//       )
//     );
//     showNotif("Task assigned successfully.");
//   }

//   function updateTaskStatusForStaff(staffId: string, taskId: string, status: TaskStatus) {
//     setStaffList(prev =>
//       prev.map(staff =>
//         staff.id === staffId
//           ? {
//             ...staff,
//             tasks: (staff.tasks || []).map(task =>
//               task.id === taskId ? { ...task, status } : task
//             ),
//           }
//           : staff
//       )
//     );
//     showNotif(`Task updated to ${status}.`);
//   }

//   const filtered = React.useMemo(() => {
//     const query = q.trim().toLowerCase();
//     const base = staffList.filter(s => {
//       const mQ = !query
//         || s.name.toLowerCase().includes(query)
//         || s.id.toLowerCase().includes(query)
//         || String(s.staffId || "").toLowerCase().includes(query)
//         || s.email.toLowerCase().includes(query)
//         || s.phone.toLowerCase().includes(query)
//         || s.branch.toLowerCase().includes(query)
//         || String(s.nrc || "").toLowerCase().includes(query);

//       const mR = roleFilter === "All" || s.role === roleFilter.toLowerCase();
//       const mS = statusFilter === "All" || s.status === statusFilter.toLowerCase().replace(" ", "_");
//       return mQ && mR && mS;
//     });
//     return sortStaff(base, sortMode);
//   }, [staffList, q, roleFilter, statusFilter, sortMode]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

//   React.useEffect(() => { setCurrentPage(1); }, [q, roleFilter, statusFilter, sortMode, pageSize]);
//   React.useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);

//   const paginatedStaff = React.useMemo(() => {
//     const start = (currentPage - 1) * pageSize;
//     return filtered.slice(start, start + pageSize);
//   }, [filtered, currentPage, pageSize]);

//   const selectedMember = selectedId ? staffList.find(s => s.id === selectedId) ?? null : null;

//   React.useEffect(() => {
//     if (!selectedId && paginatedStaff.length > 0) {
//       setSelectedId(paginatedStaff[0].id);
//       return;
//     }
//     const existsInAll = selectedId ? filtered.some(i => i.id === selectedId) : false;
//     if (selectedId && !existsInAll) {
//       setSelectedId(filtered[0]?.id ?? null);
//     }
//   }, [filtered, paginatedStaff, selectedId]);

//   const stats = React.useMemo(() => ({
//     total: staffList.length,
//     active: staffList.filter(s => s.status === "active").length,
//     onLeave: staffList.filter(s => s.status === "on_leave").length,
//     avgRating: staffList.length ? staffList.reduce((a, s) => a + s.rating, 0) / staffList.length : 0,
//     totalSales: staffList.reduce((a, s) => a + s.sales, 0),
//     totalTasks: staffList.reduce((a, s) => a + (s.tasks?.length || 0), 0),
//   }), [staffList]);

//   const startIndex = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
//   const endIndex = Math.min(currentPage * pageSize, filtered.length);

//   return (
//     <>
//       <FontImport />
//       <div
//         className="relative min-h-screen overflow-hidden transition-all duration-700"
//         style={{
//           background: night
//             ? "linear-gradient(160deg, #05060d 0%, #0d0b18 42%, #120a02 100%)"
//             : "linear-gradient(160deg, #f6f1e9 0%, #fbf7f1 50%, #f0ebe3 100%)",
//         }}
//       >
//         <AnimatePresence mode="wait">
//           {night ? <NightParticles key="night" /> : <DayParticles key="day" />}
//         </AnimatePresence>

//         <div className="pointer-events-none absolute inset-0">
//           <div
//             className="absolute right-[-120px] top-[-100px] h-[320px] w-[320px] rounded-full blur-3xl"
//             style={{
//               background: night ? "rgba(251,191,36,0.10)" : "rgba(245,158,11,0.08)",
//             }}
//           />
//           <div
//             className="absolute bottom-[-120px] left-[-80px] h-[280px] w-[280px] rounded-full blur-3xl"
//             style={{
//               background: night ? "rgba(217,119,6,0.10)" : "rgba(200,137,42,0.07)",
//             }}
//           />
//         </div>

//         <AnimatePresence>
//           {notification && (
//             <motion.div
//               initial={{ opacity: 0, y: -20, scale: 0.95 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: -20, scale: 0.95 }}
//               className="fixed left-1/2 top-5 z-[100] -translate-x-1/2 rounded-full px-5 py-2.5 text-[13px] font-bold"
//               style={{
//                 background: night ? "rgba(14,10,6,0.92)" : "rgba(255,255,255,0.94)",
//                 border: `1px solid ${night ? "rgba(200,137,42,0.18)" : "rgba(216,203,184,0.55)"}`,
//                 color: night ? "#e8dcc8" : "#1a1510",
//                 backdropFilter: "blur(18px)",
//               }}
//             >
//               {notification}
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <div className="relative z-10 mx-auto max-w-[1480px] px-4 py-6 md:px-6">
//           <div className="mb-6 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="h-2 w-2 rounded-full" style={{ background: "#c8892a" }} />
//               <span className={sectionTitle(night)}>CUTEPOS · STAFF CONTROL</span>
//             </div>

//             <div className="flex items-center">
//               <LanternToggle dark={night} onToggle={() => setNight((p) => !p)} />
//             </div>
//           </div>

//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="relative mb-6 overflow-hidden rounded-[28px] p-6"
//             style={glassCard(night)}
//           >
//             <div className="absolute left-0 right-0 top-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #c8892a, transparent)" }} />

//             <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
//               <div className="flex items-center gap-5">
//                 <div className="hidden md:block">
//                   <motion.div
//                     animate={{ y: [0, -10, 0] }}
//                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
//                   >
//                     <LanternMark size={88} glow={night} />
//                   </motion.div>
//                 </div>
//                 <div>
//                   <div className={sectionTitle(night)}>{night ? "NIGHT SHIFT OVERVIEW" : "GOOD MORNING"}</div>
//                   <h1 className={cn("serif mt-2 text-4xl leading-none md:text-5xl", night ? "text-[#e8dcc8]" : "text-[#1a1510]")}>
//                     Staff Management
//                   </h1>
//                   <p className="mt-3 max-w-2xl text-[12.5px] leading-7" style={{ color: night ? "#6d5d4b" : "#8e7f6e" }}>
//                     Night lantern mode is the main look now. Search staff, review profiles, manage tasks, and keep the premium warm glow design across the page.
//                   </p>
//                 </div>
//               </div>

//               <div className="flex flex-wrap items-center justify-end gap-2">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: night ? "#7a5520" : "#8a7a65" }} />
//                   <input
//                     value={q}
//                     onChange={e => setQ(e.target.value)}
//                     placeholder="Search staff..."
//                     className="h-11 w-[220px] rounded-full pl-10 pr-9 text-[13px] outline-none"
//                     style={premiumInputStyle(night)}
//                   />
//                   {q && (
//                     <button
//                       type="button"
//                       onClick={() => setQ("")}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold"
//                       style={{ color: night ? "#bca98f" : "#7d6f60" }}
//                     >
//                       ✕
//                     </button>
//                   )}
//                 </div>

//                 <motion.button
//                   whileHover={{ scale: 1.03, y: -1 }}
//                   whileTap={{ scale: 0.97 }}
//                   onClick={() => fetchStaff(true)}
//                   disabled={refreshing}
//                   className="flex h-11 items-center gap-2 rounded-full px-4 text-[12px] font-bold disabled:opacity-60"
//                   style={premiumInputStyle(night)}
//                 >
//                   {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
//                   Refresh
//                 </motion.button>

//                 <motion.button
//                   whileHover={{ scale: 1.03, y: -1 }}
//                   whileTap={{ scale: 0.97 }}
//                   onClick={() => {
//                     setQ("");
//                     setRoleFilter("All");
//                     setStatusFilter("All");
//                     setSortMode("name_asc");
//                     setViewMode("grid");
//                     setCurrentPage(1);
//                     showNotif("Filters reset.");
//                   }}
//                   className="flex h-11 items-center gap-2 rounded-full px-4 text-[12px] font-bold"
//                   style={premiumInputStyle(night)}
//                 >
//                   <RotateCcw className="h-4 w-4" /> Reset
//                 </motion.button>

//                 <motion.a
//                   whileHover={{ scale: 1.03, y: -1 }}
//                   whileTap={{ scale: 0.97 }}
//                   href="/admin/staff/add_staff"
//                   className="flex h-11 items-center gap-2 rounded-full px-5 text-[12px] font-bold"
//                   style={{ background: "linear-gradient(135deg,#a07020,#d4a352)", color: "#140d05", boxShadow: "0 12px 28px rgba(200,137,42,0.18)" }}
//                 >
//                   <Plus className="h-4 w-4" /> Add Staff
//                 </motion.a>
//               </div>
//             </div>
//           </motion.div>

//           {sessionStatus === "loading" && (
//             <div className="mb-5 rounded-[20px] p-4 text-sm font-medium" style={glassCard(night)}>
//               <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Checking session...
//             </div>
//           )}

//           {loading && (
//             <div className="mb-5 rounded-[20px] p-4 text-sm font-medium" style={glassCard(night)}>
//               <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading staff...
//             </div>
//           )}

//           {error && (
//             <div
//               className="mb-5 rounded-[20px] p-4 text-sm font-medium"
//               style={{
//                 background: night ? "rgba(60,10,10,0.6)" : "#fff1f2",
//                 border: night ? "1px solid rgba(200,50,50,0.3)" : "1px solid #fecdd3",
//                 color: night ? "#f87171" : "#dc2626"
//               }}
//             >
//               {error}
//             </div>
//           )}

//           <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
//             <KpiCard label="Total Staff" value={stats.total} sub="Team members" icon={Users} color="#c8892a" night={night} />
//             <KpiCard label="Active Now" value={stats.active} sub="Currently working" icon={UserCheck} color="#10b981" night={night} />
//             <KpiCard label="On Leave" value={stats.onLeave} sub="Temporary absence" icon={Clock} color="#f59e0b" night={night} />
//             <KpiCard label="Avg Rating" value={Number(stats.avgRating.toFixed(1))} sub="Team score" icon={Star} color="#eab308" night={night} />
//             <KpiCard label="Sales" value={Math.round(stats.totalSales / 1000)} sub="In ¥ thousands" icon={Activity} color="#d97706" night={night} />
//             <KpiCard label="Tasks" value={stats.totalTasks} sub="Assigned to staff" icon={FileText} color="#60a5fa" night={night} />
//           </div>

//           <div className="mb-5 rounded-[24px] p-4" style={glassCard(night)}>
//             <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
//               <div className="flex flex-wrap gap-2">
//                 {ROLES.map(role => (
//                   <PremiumPill
//                     key={role}
//                     active={roleFilter === role}
//                     onClick={() => setRoleFilter(role)}
//                     color="#a07020"
//                     night={night}
//                   >
//                     {role}
//                   </PremiumPill>
//                 ))}
//               </div>

//               <div className="flex flex-wrap gap-2">
//                 {STATUSES.map(status => (
//                   <PremiumPill
//                     key={status}
//                     active={statusFilter === status}
//                     onClick={() => setStatusFilter(status)}
//                     color={status === "Active" ? "#10b981" : status === "On Leave" ? "#f59e0b" : "#94a3b8"}
//                     night={night}
//                   >
//                     {status}
//                   </PremiumPill>
//                 ))}
//               </div>

//               <div className="flex flex-wrap gap-2">
//                 <PremiumPill active={viewMode === "grid"} onClick={() => setViewMode("grid")} color="#a07020" night={night}>
//                   <LayoutGrid className="mr-1 inline h-3.5 w-3.5" /> Grid
//                 </PremiumPill>
//                 <PremiumPill active={viewMode === "compact"} onClick={() => setViewMode("compact")} color="#a07020" night={night}>
//                   <List className="mr-1 inline h-3.5 w-3.5" /> Compact
//                 </PremiumPill>
//                 <PremiumPill active={sortMode === "name_asc"} onClick={() => setSortMode("name_asc")} color="#a07020" night={night}>
//                   <ArrowDownAZ className="mr-1 inline h-3.5 w-3.5" /> A-Z
//                 </PremiumPill>
//                 <PremiumPill active={sortMode === "name_desc"} onClick={() => setSortMode("name_desc")} color="#a07020" night={night}>
//                   <ArrowUpZA className="mr-1 inline h-3.5 w-3.5" /> Z-A
//                 </PremiumPill>
//                 <PremiumPill active={sortMode === "rating_desc"} onClick={() => setSortMode("rating_desc")} color="#eab308" night={night}>
//                   ⭐ Rating
//                 </PremiumPill>
//                 <PremiumPill active={sortMode === "sales_desc"} onClick={() => setSortMode("sales_desc")} color="#d97706" night={night}>
//                   💰 Sales
//                 </PremiumPill>
//               </div>

//               <motion.button
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 onClick={() => setPanelOpen(v => !v)}
//                 className="flex h-11 items-center gap-2 rounded-full px-4 text-[12px] font-bold"
//                 style={premiumInputStyle(night)}
//               >
//                 {panelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
//                 {panelOpen ? "Hide Detail" : "Show Detail"}
//               </motion.button>
//             </div>
//           </div>

//           <div className={cn("grid gap-5", panelOpen ? "xl:grid-cols-[minmax(0,1fr)_380px]" : "grid-cols-1")}>
//             <div>
//               {viewMode === "grid" ? (
//                 <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
//                   {paginatedStaff.map((member) => (
//                     <StaffCard
//                       key={member.id}
//                       member={member}
//                       selected={selectedId === member.id}
//                       onSelect={(m) => setSelectedId(m.id)}
//                       night={night}
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {paginatedStaff.map((member) => (
//                     <CompactCard
//                       key={member.id}
//                       member={member}
//                       selected={selectedId === member.id}
//                       onSelect={(m) => setSelectedId(m.id)}
//                       night={night}
//                     />
//                   ))}
//                 </div>
//               )}

//               {!loading && filtered.length === 0 && (
//                 <div className="rounded-[24px] p-10 text-center" style={glassCard(night)}>
//                   <div className="mb-4 flex justify-center"><LanternMark size={48} glow={night} /></div>
//                   <div className={cn("serif text-[34px]", night ? "text-[#e8dcc8]" : "text-[#1a1510]")}>No matching staff found</div>
//                   <div className="mt-2 text-[12px]" style={{ color: night ? "#7a5520" : "#8a7a65" }}>
//                     Try changing search text or filter buttons.
//                   </div>
//                 </div>
//               )}

//               <PaginationBar
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 pageSize={pageSize}
//                 totalItems={filtered.length}
//                 startIndex={startIndex}
//                 endIndex={endIndex}
//                 onPageChange={setCurrentPage}
//                 onPageSizeChange={setPageSize}
//                 night={night}
//               />
//             </div>

//             {panelOpen && (
//               <DetailPanel
//                 member={selectedMember}
//                 onClose={() => setPanelOpen(false)}
//                 onAddTask={addTaskToStaff}
//                 onUpdateTaskStatus={updateTaskStatusForStaff}
//                 night={night}
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }








































// // "use client";

// // import * as React from "react";
// // import { useSession } from "next-auth/react";
// // import { motion, AnimatePresence } from "framer-motion";
// // import CountUp from "react-countup";
// // import {
// //   Search, Plus, Sparkles, Users, UserCheck, Clock, Star,
// //   MoreHorizontal, Eye, Pencil, Trash2, Shield, Store, Calendar,
// //   Mail, MapPin, Activity, Key, Crown, LayoutGrid, RotateCcw, Phone,
// //   ChevronRight, PanelRightOpen, PanelRightClose, ArrowDownAZ, ArrowUpZA,
// //   BadgeCheck, Briefcase, X, TrendingUp, TrendingDown, CheckCircle2,
// //   List, Loader2, RefreshCw, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight as PageChevronRight,
// //   Cake, IdCard, Wallet, FileText, UserRound, Contact, ClipboardList
// // } from "lucide-react";
// // import { cn } from "@/lib/utils";
// // import {
// //   DropdownMenu, DropdownMenuContent, DropdownMenuItem,
// //   DropdownMenuSeparator, DropdownMenuTrigger,
// // } from "@/components/ui/dropdown-menu";

// // const FontImport = () => (
// //   <style>{`
// //     @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');
// //     * { font-family: 'Nunito', sans-serif; }
// //     .fredoka { font-family: 'Fredoka One', cursive !important; }

// //     @keyframes lantern-ray-pulse {
// //       0%, 100% { opacity: 0.55; transform: scaleX(1); }
// //       50%       { opacity: 0.85; transform: scaleX(1.04); }
// //     }
// //     @keyframes lantern-halo-breathe {
// //       0%, 100% { transform: scale(1);   opacity: 0.70; }
// //       50%       { transform: scale(1.06); opacity: 1; }
// //     }
// //     @keyframes ember-drift {
// //       0%   { transform: translateY(0px)   translateX(0px)  scale(1);   opacity: 0.55; }
// //       33%  { transform: translateY(-18px) translateX(6px)  scale(1.15); opacity: 0.80; }
// //       66%  { transform: translateY(-30px) translateX(-4px) scale(0.90); opacity: 0.45; }
// //       100% { transform: translateY(-44px) translateX(2px)  scale(0.6);  opacity: 0; }
// //     }
// //     @keyframes smoke-rise {
// //       0%   { transform: translateY(0) scaleX(1);    opacity: 0.18; }
// //       100% { transform: translateY(-60px) scaleX(2); opacity: 0; }
// //     }
// //     @keyframes star-twinkle {
// //       0%, 100% { opacity: 0.08; }
// //       50%       { opacity: 0.90; }
// //     }
// //   `}</style>
// // );

// // /* ═══════════════════════════════════════════════════════
// //    LANTERN ICON  (day = beautiful unlit antique, night = flame burning)
// // ═══════════════════════════════════════════════════════ */
// // function LanternIcon({ lit, size = 38 }: { lit: boolean; size?: number }) {
// //   const w = size;
// //   const h = Math.round(size * 1.72);
// //   return (
// //     <svg width={w} height={h} viewBox="0 0 38 66" fill="none" xmlns="http://www.w3.org/2000/svg">
// //       <defs>
// //         <linearGradient id="sp-brass" x1="0" y1="0" x2="1" y2="1">
// //           <stop offset="0%"  stopColor={lit ? "#7a5a30" : "#d4a040"} />
// //           <stop offset="50%" stopColor={lit ? "#4e3418" : "#9a6820"} />
// //           <stop offset="100%" stopColor={lit ? "#2e1c08" : "#6a4414"} />
// //         </linearGradient>
// //         <linearGradient id="sp-cap" x1="0" y1="0" x2="0" y2="1">
// //           <stop offset="0%" stopColor={lit ? "#8a6840" : "#e8c050"} />
// //           <stop offset="100%" stopColor={lit ? "#3e2410" : "#805818"} />
// //         </linearGradient>
// //         <linearGradient id="sp-handle" x1="0" y1="0" x2="0" y2="1">
// //           <stop offset="0%" stopColor={lit ? "#a07848" : "#f0d060"} />
// //           <stop offset="100%" stopColor={lit ? "#5a3818" : "#a07020"} />
// //         </linearGradient>
// //         <radialGradient id="sp-globe-day" cx="35%" cy="28%" r="62%">
// //           <stop offset="0%"   stopColor="#faf6ee" stopOpacity="0.72" />
// //           <stop offset="55%"  stopColor="#f0e8d8" stopOpacity="0.35" />
// //           <stop offset="100%" stopColor="#e0d4b8" stopOpacity="0.12" />
// //         </radialGradient>
// //         <radialGradient id="sp-globe-night" cx="50%" cy="55%" r="50%">
// //           <stop offset="0%"   stopColor="#fff8e0" stopOpacity="0.98" />
// //           <stop offset="25%"  stopColor="#fdd060" stopOpacity="0.92" />
// //           <stop offset="58%"  stopColor="#e87820" stopOpacity="0.72" />
// //           <stop offset="100%" stopColor="#b04000" stopOpacity="0.15" />
// //         </radialGradient>
// //         <linearGradient id="sp-fl1" x1="0" y1="1" x2="0" y2="0">
// //           <stop offset="0%"   stopColor="#c04008" />
// //           <stop offset="30%"  stopColor="#e87018" />
// //           <stop offset="68%"  stopColor="#fcc030" />
// //           <stop offset="100%" stopColor="#fff0a0" stopOpacity="0.88" />
// //         </linearGradient>
// //         <linearGradient id="sp-fl2" x1="0" y1="1" x2="0" y2="0">
// //           <stop offset="0%"   stopColor="#e06818" />
// //           <stop offset="55%"  stopColor="#fde050" />
// //           <stop offset="100%" stopColor="#fffae0" />
// //         </linearGradient>
// //         <radialGradient id="sp-halo" cx="50%" cy="46%" r="50%">
// //           <stop offset="0%"   stopColor="#ffb830" stopOpacity="0.45" />
// //           <stop offset="55%"  stopColor="#ff7010" stopOpacity="0.14" />
// //           <stop offset="100%" stopColor="#ff3800" stopOpacity="0" />
// //         </radialGradient>
// //         <radialGradient id="sp-glint" cx="28%" cy="20%" r="32%">
// //           <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.85" />
// //           <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
// //         </radialGradient>
// //       </defs>

// //       {/* night halo */}
// //       {lit && (
// //         <motion.ellipse cx="19" cy="36" rx="19" ry="24" fill="url(#sp-halo)"
// //           animate={{ rx: [19, 24, 19], ry: [24, 29, 24], opacity: [0.75, 1, 0.75] }}
// //           transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
// //       )}

// //       {/* chimney cap */}
// //       <rect x="13" y="1" width="12" height="2.5" rx="1" fill="url(#sp-cap)" />
// //       <path d="M13.5 3.5 L12.5 9 L25.5 9 L24.5 3.5 Z" fill="url(#sp-cap)" />
// //       {[16, 19, 22].map(x => (
// //         <line key={x} x1={x} y1="4" x2={x} y2="8.5" stroke={lit ? "#2a1408" : "#6a3c10"} strokeWidth="0.7" opacity="0.5" />
// //       ))}
// //       <line x1="19" y1="0" x2="19" y2="1" stroke={lit ? "#7a5830" : "#c89030"} strokeWidth="1.4" strokeLinecap="round" />

// //       {/* top collar */}
// //       <rect x="10.5" y="9" width="17" height="2.8" rx="1.3" fill="url(#sp-brass)" />

// //       {/* glass globe */}
// //       <ellipse cx="19" cy="26" rx="9.5" ry="13"
// //         fill={lit ? "url(#sp-globe-night)" : "url(#sp-globe-day)"}
// //         stroke={lit ? "#e88020" : "#c09050"}
// //         strokeWidth={lit ? "0.5" : "0.7"}
// //         strokeOpacity={lit ? 0.3 : 0.45} />
// //       {!lit && <ellipse cx="19" cy="26" rx="9.5" ry="13" fill="url(#sp-glint)" />}

// //       {/* pillars */}
// //       <line x1="9.8"  y1="11.8" x2="9.2"  y2="39.5" stroke={lit ? "#7a5530" : "#c08838"} strokeWidth="1.6" strokeLinecap="round" />
// //       <line x1="28.2" y1="11.8" x2="28.8" y2="39.5" stroke={lit ? "#7a5530" : "#c08838"} strokeWidth="1.6" strokeLinecap="round" />

// //       {/* FLAME (night) */}
// //       {lit && (
// //         <>
// //           <motion.path
// //             d="M19 17 C15.8 21 14 25.5 14.8 30 C15.6 34 22.4 34 23.2 30 C24 25.5 22.2 21 19 17 Z"
// //             fill="url(#sp-fl1)"
// //             animate={{ d: [
// //               "M19 17 C15.8 21 14 25.5 14.8 30 C15.6 34 22.4 34 23.2 30 C24 25.5 22.2 21 19 17 Z",
// //               "M19 16.5 C15.2 21 13.5 26 14.5 30 C15.4 34.5 23 34 24 30 C25 25.5 22.8 20.5 19 16.5 Z",
// //               "M19 17 C15.8 21 14 25.5 14.8 30 C15.6 34 22.4 34 23.2 30 C24 25.5 22.2 21 19 17 Z",
// //             ]}}
// //             transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }} />
// //           <motion.path
// //             d="M19 19.5 C17.2 23 16.5 26.5 17 29.5 C17.5 32 21 32 21.5 29.5 C22 26.5 21 23 19 19.5 Z"
// //             fill="url(#sp-fl2)"
// //             animate={{ d: [
// //               "M19 19.5 C17.2 23 16.5 26.5 17 29.5 C17.5 32 21 32 21.5 29.5 C22 26.5 21 23 19 19.5 Z",
// //               "M19 19 C16.8 23 16.2 27 17 29.5 C17.6 32.5 21.4 32 22 29.5 C22.6 26.5 21.4 22.5 19 19 Z",
// //               "M19 19.5 C17.2 23 16.5 26.5 17 29.5 C17.5 32 21 32 21.5 29.5 C22 26.5 21 23 19 19.5 Z",
// //             ]}}
// //             transition={{ duration: 1.05, repeat: Infinity, ease: "easeInOut" }} />
// //           <motion.ellipse cx="19" cy="19" rx="1.1" ry="1.9" fill="white" opacity="0.90"
// //             animate={{ ry: [1.9, 2.5, 1.7, 1.9], opacity: [0.9, 1, 0.82, 0.9] }}
// //             transition={{ duration: 0.85, repeat: Infinity, ease: "easeInOut" }} />
// //         </>
// //       )}

// //       {/* unlit wick (day) */}
// //       {!lit && (
// //         <>
// //           <rect x="16.5" y="23" width="5" height="1.8" rx="0.9" fill="#9a7030" stroke="#c09040" strokeWidth="0.4" />
// //           <line x1="19" y1="18" x2="19" y2="23.8" stroke="#2a1a06" strokeWidth="1.0" strokeLinecap="round" opacity="0.65" />
// //           <circle cx="19" cy="17.5" r="0.75" fill="#1a0e02" opacity="0.5" />
// //         </>
// //       )}

// //       {/* bottom collar */}
// //       <ellipse cx="19" cy="39.2" rx="10.2" ry="2.4" fill="url(#sp-brass)" stroke={lit ? "#5a3818" : "#b07828"} strokeWidth="0.5" />

// //       {/* font/reservoir */}
// //       <rect x="12.5" y="41.6" width="13" height="9" rx="2.5" fill={lit ? "#6a3a10" : "url(#sp-cap)"} stroke={lit ? "#a05818" : "#b07020"} strokeWidth={lit ? "0.45" : "0.6"} />
// //       {lit && (
// //         <motion.rect x="12.5" y="41.6" width="13" height="9" rx="2.5" fill="#f08020" opacity="0.3"
// //           animate={{ opacity: [0.2, 0.45, 0.2] }}
// //           transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
// //       )}
// //       <line x1="12.5" y1="45" x2="25.5" y2="45" stroke={lit ? "#7a4818" : "#b07820"} strokeWidth="0.5" opacity="0.45" />

// //       {/* base */}
// //       <ellipse cx="19" cy="50.6" rx="8.8" ry="2.0" fill="url(#sp-cap)" stroke={lit ? "#6a3e18" : "#b07820"} strokeWidth="0.55" />

// //       {/* handle */}
// //       <path d="M10.5 18 Q3.5 25 4.2 36 Q4.8 43 10.5 45" fill="none" stroke="url(#sp-handle)" strokeWidth="1.9" strokeLinecap="round" />
// //       <circle cx="10.5" cy="18" r="1.6" fill="url(#sp-brass)" />
// //       <circle cx="10.5" cy="45" r="1.6" fill="url(#sp-brass)" />

// //       {/* floor pool (night) */}
// //       {lit && (
// //         <motion.ellipse cx="19" cy="56" rx="10" ry="2.0" fill="#ff8818" opacity="0.18"
// //           animate={{ rx: [10, 14, 10], opacity: [0.14, 0.28, 0.14] }}
// //           transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
// //       )}
// //     </svg>
// //   );
// // }

// // /* ═══════════════════════════════════════════════════════
// //    LANTERN BACKGROUND  — the entire page atmosphere
// // ═══════════════════════════════════════════════════════ */
// // function LanternBackground({ lit }: { lit: boolean }) {
// //   /* star positions – stable across renders */
// //   const stars = React.useMemo(() =>
// //     Array.from({ length: 32 }, (_, i) => ({
// //       id: i,
// //       left: `${(i * 37 + 11) % 100}%`,
// //       top:  `${(i * 53 +  7) % 100}%`,
// //       size: 1 + (i % 3) * 0.6,
// //       dur:  2.5 + (i % 5) * 0.5,
// //       delay: (i * 0.22) % 4,
// //     })), []);

// //   /* ember particles */
// //   const embers = React.useMemo(() =>
// //     Array.from({ length: 10 }, (_, i) => ({
// //       id: i,
// //       left: `${38 + (i % 5) * 5 - 10}%`,
// //       delay: i * 0.45,
// //       size: 3 + (i % 3),
// //       dur: 3.5 + (i % 4) * 0.6,
// //     })), []);

// //   return (
// //     <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>

// //       {/* ── DAY background ── */}
// //       <motion.div
// //         animate={{ opacity: lit ? 0 : 1 }}
// //         transition={{ duration: 1.2 }}
// //         className="absolute inset-0"
// //         style={{ background: "linear-gradient(135deg,#FFF9C4 0%,#FFE0F0 35%,#E0F4FF 70%,#E8FFE8 100%)" }}
// //       />

// //       {/* ── NIGHT sky ── */}
// //       <motion.div
// //         animate={{ opacity: lit ? 1 : 0 }}
// //         transition={{ duration: 1.4 }}
// //         className="absolute inset-0"
// //         style={{ background: "radial-gradient(ellipse at 50% 0%, #2a1600 0%, #140a00 40%, #0a0500 100%)" }}
// //       />

// //       {/* Stars */}
// //       <AnimatePresence>
// //         {lit && stars.map(s => (
// //           <motion.div
// //             key={s.id}
// //             className="absolute rounded-full bg-amber-100"
// //             style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
// //             initial={{ opacity: 0 }}
// //             animate={{ opacity: [0.08, 0.9, 0.08] }}
// //             transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
// //           />
// //         ))}
// //       </AnimatePresence>

// //       {/* ══ THE LANTERN LIGHT EFFECT ══
// //           A central warm radial glow + crepuscular rays emanating from top-centre
// //           (as if a lantern hanging above illuminates the whole scene)          */}
// //       <AnimatePresence>
// //         {lit && (
// //           <>
// //             {/* Core halo — very bright centre */}
// //             <motion.div
// //               initial={{ opacity: 0, scale: 0.4 }}
// //               animate={{ opacity: 1, scale: 1 }}
// //               exit={{ opacity: 0, scale: 0.4 }}
// //               transition={{ duration: 1.0 }}
// //               style={{
// //                 position: "absolute",
// //                 top: "-8%",
// //                 left: "50%",
// //                 transform: "translateX(-50%)",
// //                 width: "520px",
// //                 height: "520px",
// //                 borderRadius: "50%",
// //                 background: "radial-gradient(ellipse at center, rgba(255,200,60,0.72) 0%, rgba(255,140,20,0.45) 30%, rgba(200,80,10,0.18) 60%, transparent 80%)",
// //                 animation: "lantern-halo-breathe 3s ease-in-out infinite",
// //                 filter: "blur(28px)",
// //               }}
// //             />

// //             {/* Secondary wider warm wash */}
// //             <motion.div
// //               initial={{ opacity: 0 }}
// //               animate={{ opacity: 1 }}
// //               exit={{ opacity: 0 }}
// //               transition={{ duration: 1.4, delay: 0.2 }}
// //               style={{
// //                 position: "absolute",
// //                 top: "-20%",
// //                 left: "50%",
// //                 transform: "translateX(-50%)",
// //                 width: "900px",
// //                 height: "900px",
// //                 borderRadius: "50%",
// //                 background: "radial-gradient(ellipse at center, rgba(255,160,30,0.30) 0%, rgba(180,80,10,0.12) 45%, transparent 70%)",
// //                 filter: "blur(40px)",
// //               }}
// //             />

// //             {/* Crepuscular light rays — 7 rays fanning from top-centre */}
// //             {[
// //               { rotate: -42, opacity: 0.18, width: "3px",  height: "75vh", delay: 0    },
// //               { rotate: -28, opacity: 0.28, width: "5px",  height: "82vh", delay: 0.15 },
// //               { rotate: -14, opacity: 0.38, width: "8px",  height: "90vh", delay: 0.05 },
// //               { rotate:   0, opacity: 0.50, width: "14px", height: "95vh", delay: 0    },
// //               { rotate:  14, opacity: 0.38, width: "8px",  height: "90vh", delay: 0.08 },
// //               { rotate:  28, opacity: 0.28, width: "5px",  height: "82vh", delay: 0.18 },
// //               { rotate:  42, opacity: 0.18, width: "3px",  height: "75vh", delay: 0.10 },
// //             ].map((ray, i) => (
// //               <motion.div
// //                 key={i}
// //                 initial={{ opacity: 0, scaleY: 0 }}
// //                 animate={{ opacity: ray.opacity, scaleY: 1 }}
// //                 exit={{ opacity: 0, scaleY: 0 }}
// //                 transition={{ duration: 1.2, delay: 0.3 + ray.delay }}
// //                 style={{
// //                   position: "absolute",
// //                   top: 0,
// //                   left: "50%",
// //                   transformOrigin: "50% 0%",
// //                   transform: `translateX(-50%) rotate(${ray.rotate}deg)`,
// //                   width: ray.width,
// //                   height: ray.height,
// //                   background: "linear-gradient(to bottom, rgba(255,210,60,0.90) 0%, rgba(255,160,30,0.40) 35%, rgba(200,90,10,0.10) 70%, transparent 100%)",
// //                   filter: "blur(4px)",
// //                   animation: `lantern-ray-pulse ${3.5 + i * 0.4}s ease-in-out ${ray.delay}s infinite`,
// //                 }}
// //               />
// //             ))}

// //             {/* Floor warm gradient — bottom of page lit by lamp */}
// //             <motion.div
// //               initial={{ opacity: 0 }}
// //               animate={{ opacity: 1 }}
// //               exit={{ opacity: 0 }}
// //               transition={{ duration: 1.6, delay: 0.4 }}
// //               style={{
// //                 position: "absolute",
// //                 bottom: 0,
// //                 left: 0,
// //                 right: 0,
// //                 height: "45%",
// //                 background: "linear-gradient(to top, rgba(160,70,10,0.22) 0%, rgba(180,90,15,0.10) 40%, transparent 100%)",
// //               }}
// //             />

// //             {/* Side vignettes — edges dark, centre lit */}
// //             <motion.div
// //               initial={{ opacity: 0 }}
// //               animate={{ opacity: 1 }}
// //               exit={{ opacity: 0 }}
// //               transition={{ duration: 1.2 }}
// //               style={{
// //                 position: "absolute",
// //                 inset: 0,
// //                 background: "radial-gradient(ellipse 85% 100% at 50% 0%, transparent 40%, rgba(5,2,0,0.72) 100%)",
// //               }}
// //             />

// //             {/* Ember particles floating up */}
// //             {embers.map(e => (
// //               <div
// //                 key={e.id}
// //                 style={{
// //                   position: "absolute",
// //                   bottom: "55%",
// //                   left: e.left,
// //                   width: e.size,
// //                   height: e.size,
// //                   borderRadius: "50%",
// //                   background: "radial-gradient(circle, #ffe080 0%, #ff8820 60%, transparent 100%)",
// //                   boxShadow: "0 0 6px 2px rgba(255,160,40,0.6)",
// //                   animation: `ember-drift ${e.dur}s ${e.delay}s ease-out infinite`,
// //                   opacity: 0,
// //                 }}
// //               />
// //             ))}

// //             {/* Subtle smoke wisps from the imaginary lantern above */}
// //             {[20, 30, 42].map((left, i) => (
// //               <div
// //                 key={i}
// //                 style={{
// //                   position: "absolute",
// //                   top: 0,
// //                   left: `${left + 50 - 31}%`,
// //                   width: "18px",
// //                   height: "60px",
// //                   borderRadius: "50%",
// //                   background: "rgba(200,140,60,0.12)",
// //                   filter: "blur(6px)",
// //                   animation: `smoke-rise ${5 + i}s ${i * 1.2}s ease-out infinite`,
// //                 }}
// //               />
// //             ))}
// //           </>
// //         )}
// //       </AnimatePresence>
// //     </div>
// //   );
// // }

// // /* ═══════════════════════════════════════════════════════
// //    LANTERN TOGGLE BUTTON
// // ═══════════════════════════════════════════════════════ */
// // function LanternToggle({ lit, onToggle }: { lit: boolean; onToggle: () => void }) {
// //   return (
// //     <motion.button
// //       type="button"
// //       onClick={onToggle}
// //       whileTap={{ scale: 0.90 }}
// //       whileHover={{ scale: 1.07, y: -2 }}
// //       className="relative flex flex-col items-center focus:outline-none select-none"
// //       style={{ width: 60 }}
// //       title={lit ? "Switch to Day" : "Switch to Night"}
// //     >
// //       {/* Glow aura when lit */}
// //       <AnimatePresence>
// //         {lit && (
// //           <motion.div
// //             initial={{ opacity: 0, scale: 0.3 }}
// //             animate={{ opacity: 1, scale: 1 }}
// //             exit={{ opacity: 0, scale: 0.3 }}
// //             transition={{ duration: 0.5 }}
// //             className="pointer-events-none absolute"
// //             style={{
// //               width: 100, height: 100, top: -12, left: "50%", transform: "translateX(-50%)",
// //               borderRadius: "50%",
// //               background: "radial-gradient(ellipse at center, rgba(255,180,40,0.60) 0%, rgba(240,110,15,0.25) 45%, transparent 72%)",
// //               filter: "blur(12px)",
// //             }}
// //           />
// //         )}
// //       </AnimatePresence>

// //       {/* Day: sunlight above */}
// //       <AnimatePresence>
// //         {!lit && (
// //           <motion.div
// //             initial={{ opacity: 0 }}
// //             animate={{ opacity: 1 }}
// //             exit={{ opacity: 0 }}
// //             transition={{ duration: 0.5 }}
// //             className="pointer-events-none absolute"
// //             style={{
// //               width: 60, height: 24, top: -10, left: "50%", transform: "translateX(-50%)",
// //               borderRadius: "50%",
// //               background: "radial-gradient(ellipse at center, rgba(255,230,120,0.70) 0%, transparent 70%)",
// //               filter: "blur(8px)",
// //             }}
// //           />
// //         )}
// //       </AnimatePresence>

// //       {/* Floor cast */}
// //       <AnimatePresence>
// //         {lit && (
// //           <motion.div
// //             initial={{ opacity: 0, scaleX: 0.2 }}
// //             animate={{ opacity: 1, scaleX: 1 }}
// //             exit={{ opacity: 0, scaleX: 0.2 }}
// //             transition={{ duration: 0.5 }}
// //             className="pointer-events-none absolute"
// //             style={{
// //               bottom: 8, width: 54, height: 8, left: "50%", transform: "translateX(-50%)",
// //               borderRadius: "50%",
// //               background: "radial-gradient(ellipse at center, rgba(255,160,40,0.65) 0%, transparent 70%)",
// //               filter: "blur(6px)",
// //             }}
// //           />
// //         )}
// //       </AnimatePresence>

// //       <LanternIcon lit={lit} size={38} />

// //       <motion.span
// //         key={lit ? "night" : "day"}
// //         initial={{ opacity: 0, y: 3 }}
// //         animate={{ opacity: 1, y: 0 }}
// //         className="mt-0.5 text-[9px] font-black tracking-[0.2em] transition-colors duration-300"
// //         style={{ color: lit ? "#fbbf24" : "#b45309" }}
// //       >
// //         {lit ? "NIGHT" : "DAY"}
// //       </motion.span>
// //     </motion.button>
// //   );
// // }

// // /* ─── rest of original code below (unchanged except wiring lantern) ─ */

// // const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
// // const STORAGE_KEY  = "cartoon-staff-v3";
// // const PAGE_SIZE_OPTIONS = [6, 9, 12, 15] as const;

// // type Role      = "admin"|"manager"|"cashier"|"stock";
// // type Status    = "active"|"on_leave"|"inactive";
// // type ViewMode  = "grid"|"compact";
// // type SortMode  = "name_asc"|"name_desc"|"rating_desc"|"sales_desc"|"joined_desc";
// // type PanelTab  = "profile"|"activity"|"stats"|"tasks";
// // type TaskStatus   = "Pending" | "In Progress" | "Done";
// // type TaskPriority = "High" | "Medium" | "Low";

// // type StaffTask = {
// //   id: string; title: string; description?: string; dueDate?: string;
// //   status: TaskStatus; priority: TaskPriority;
// // };

// // type StaffMember = {
// //   id: string; rawId: number | string; dbId: number | string;
// //   name: string; role: Role; branch: string; phone: string; email: string;
// //   status: Status; joined: string; sales: number; orders: number; rating: number;
// //   shifts: number; trend: number; img: string;
// //   address?: string; nrc?: string; salary?: number;
// //   emergencyContact?: string; emergencyPhone?: string; note?: string;
// //   staffId?: number | string; dateOfBirth?: string; tasks?: StaffTask[];
// // };

// // const ACTIVITY_FEED = [
// //   { id:1, text:"Completed morning shift handover", time:"2m ago",  type:"shift"  },
// //   { id:2, text:"Processed 12 orders — ¥84,000",    time:"1h ago",  type:"sale"   },
// //   { id:3, text:"Updated inventory count",           time:"3h ago",  type:"stock"  },
// //   { id:4, text:"Received 5-star customer review",   time:"5h ago",  type:"review" },
// //   { id:5, text:"Logged into system at 08:02 AM",    time:"8h ago",  type:"login"  },
// // ];

// // const roleCfg: Record<Role,{label:string;icon:React.FC<{className?:string}>;color:string;bg:string;emoji:string}> = {
// //   admin:   {label:"Admin",   icon:Crown,  color:"#FF6B6B",bg:"#FFF0F0",emoji:"👑"},
// //   manager: {label:"Manager", icon:Shield, color:"#4ECDC4",bg:"#F0FFFE",emoji:"🛡️"},
// //   cashier: {label:"Cashier", icon:Key,    color:"#FFD93D",bg:"#FFFBF0",emoji:"🔑"},
// //   stock:   {label:"Stock",   icon:Store,  color:"#6BCB77",bg:"#F0FFF4",emoji:"📦"},
// // };

// // const statusCfg: Record<Status,{label:string;color:string;bg:string;emoji:string;glow:string}> = {
// //   active:   {label:"Active",   color:"#00B894",bg:"#F0FFF8",emoji:"🟢",glow:"rgba(0,184,148,0.4)"},
// //   on_leave: {label:"On Leave", color:"#FDCB6E",bg:"#FFFBF0",emoji:"🟡",glow:"rgba(253,203,110,0.4)"},
// //   inactive: {label:"Inactive", color:"#B2BEC3",bg:"#F8F9FA",emoji:"⚪",glow:"rgba(178,190,195,0.3)"},
// // };

// // const CARD_GRADIENTS = [
// //   ["#FF6B6B","#FF8E53"],["#4ECDC4","#44A8B3"],["#6BCB77","#4D9E52"],
// //   ["#FFD93D","#FF914D"],["#C77DFF","#9B5DE5"],["#FF6B9D","#FF4F8B"],
// //   ["#48CAE4","#0096C7"],["#F8A448","#F07834"],
// // ] as const;

// // const ROLES    = ["All","Admin","Manager","Cashier","Stock"];
// // const STATUSES = ["All","Active","On Leave","Inactive"];

// // function money(n:number){ return n>0?`¥${n.toLocaleString()}`:"—"; }
// // function shortMoney(n:number){ return n>0?`¥${(n/1000).toFixed(0)}k`:"—"; }
// // function normalizeRole(r:any):Role{ const v=String(r||"cashier").toLowerCase(); return(["admin","manager","cashier","stock"] as Role[]).includes(v as Role)?v as Role:"cashier"; }
// // function normalizeStatus(s:any):Status{ const v=String(s||"active").toLowerCase(); return(["active","on_leave","inactive"] as Status[]).includes(v as Status)?v as Status:"active"; }
// // function formatDate(value?:string){ return value||"—"; }

// // function makeMockTasks(name:string):StaffTask[]{
// //   return [
// //     {id:`TSK-${name.slice(0,2).toUpperCase()}-01`,title:"Check opening balance",description:"Verify cashier opening amount.",dueDate:"09:00 AM",status:"Done",priority:"High"},
// //     {id:`TSK-${name.slice(0,2).toUpperCase()}-02`,title:"Restock front shelf",description:"Refill fast-moving items.",dueDate:"11:30 AM",status:"In Progress",priority:"Medium"},
// //     {id:`TSK-${name.slice(0,2).toUpperCase()}-03`,title:"Submit daily sales note",description:"Prepare closing summary.",dueDate:"05:00 PM",status:"Pending",priority:"High"},
// //   ];
// // }

// // function getTaskStats(tasks:StaffTask[]=[]):{ total:number; pending:number; progress:number; done:number }{
// //   return { total:tasks.length, pending:tasks.filter(t=>t.status==="Pending").length, progress:tasks.filter(t=>t.status==="In Progress").length, done:tasks.filter(t=>t.status==="Done").length };
// // }

// // function taskStatusColor(status:TaskStatus){ if(status==="Pending") return{bg:"#FFF9C4",color:"#d68910",border:"#FFD93D"}; if(status==="In Progress") return{bg:"#E0F4FF",color:"#0984e3",border:"#74b9ff"}; return{bg:"#E8FFE8",color:"#00b894",border:"#55efc4"}; }
// // function taskPriorityColor(priority:TaskPriority){ if(priority==="High") return"#FF6B6B"; if(priority==="Medium") return"#FFD93D"; return"#B2BEC3"; }

// // function mapApiStaffToUi(staff:any):StaffMember{
// //   const name=staff.fullName||staff.name||"Unknown";
// //   const img=staff.imageUrl&&String(staff.imageUrl).startsWith("http")?staff.imageUrl:staff.imageUrl?`${API_BASE_URL}${staff.imageUrl}`:`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4`;
// //   return {
// //     id:`ST-${String(staff.staffId??staff.id??Math.floor(Math.random()*1000)).padStart(3,"0")}`,
// //     rawId:staff.id??name, dbId:staff.id??"", name,
// //     role:normalizeRole(staff.role), branch:staff.branch||"Main Branch",
// //     phone:staff.phone||"—", email:staff.email||"—",
// //     status:normalizeStatus(staff.status), joined:staff.startDate||"—",
// //     sales:Number(staff.sales||0), orders:Number(staff.orders||0),
// //     rating:Number(staff.rating||4.0), shifts:Number(staff.shifts||0), trend:Number(staff.trend||0),
// //     img, address:staff.address||"", nrc:staff.nrc||"", salary:staff.salary!=null?Number(staff.salary):0,
// //     emergencyContact:staff.emergencyContact||"", emergencyPhone:staff.emergencyPhone||"",
// //     note:staff.note||"", staffId:staff.staffId??"", dateOfBirth:staff.dateOfBirth||"",
// //     tasks:Array.isArray(staff.tasks)&&staff.tasks.length>0?staff.tasks:makeMockTasks(name),
// //   };
// // }

// // function sortStaff(items:StaffMember[],mode:SortMode){
// //   const a=[...items];
// //   switch(mode){
// //     case"name_asc":    return a.sort((a,b)=>a.name.localeCompare(b.name));
// //     case"name_desc":   return a.sort((a,b)=>b.name.localeCompare(a.name));
// //     case"rating_desc": return a.sort((a,b)=>b.rating-a.rating);
// //     case"sales_desc":  return a.sort((a,b)=>b.sales-a.sales);
// //     case"joined_desc": return a.sort((a,b)=>b.joined.localeCompare(a.joined));
// //     default: return a;
// //   }
// // }

// // function buildPageNumbers(current:number,total:number){
// //   if(total<=7) return Array.from({length:total},(_,i)=>i+1);
// //   if(current<=4) return[1,2,3,4,5,"...",total] as const;
// //   if(current>=total-3) return[1,"...",total-4,total-3,total-2,total-1,total] as const;
// //   return[1,"...",current-1,current,current+1,"...",total] as const;
// // }

// // const BUBBLES=[
// //   {size:80,top:"5%",left:"3%",   color:"#FF6B6B22",delay:0  },
// //   {size:55,top:"12%",left:"78%", color:"#4ECDC422",delay:0.6},
// //   {size:40,top:"65%",left:"2%",  color:"#FFD93D33",delay:1.1},
// //   {size:65,top:"78%",left:"85%", color:"#6BCB7733",delay:0.9},
// //   {size:30,top:"45%",left:"91%", color:"#C77DFF22",delay:1.5},
// // ];

// // function Sparkline({data,color}:{data:number[];color:string}){
// //   const max=Math.max(...data),min=Math.min(...data),range=max-min||1;
// //   const w=72,h=26;
// //   const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-min)/range)*h}`).join(" ");
// //   return(
// //     <svg width={w} height={h} className="overflow-visible">
// //       <defs>
// //         <linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
// //           <stop offset="0%" stopColor={color} stopOpacity={0.35}/>
// //           <stop offset="100%" stopColor={color} stopOpacity={0}/>
// //         </linearGradient>
// //       </defs>
// //       <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sg${color.replace("#","")})`}/>
// //       <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
// //     </svg>
// //   );
// // }

// // function generateSparkData(base:number,trend:number){ return Array.from({length:7},(_,i)=>Math.max(0,base+trend*i*0.5+(Math.random()-0.5)*20)); }

// // function Avatar({src,name,index,className}:{src:string;name:string;index:number;className?:string}){
// //   const[failed,setFailed]=React.useState(false);
// //   const[g1,g2]=CARD_GRADIENTS[index%CARD_GRADIENTS.length];
// //   const initials=name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
// //   if(failed) return(<div className={cn("flex items-center justify-center font-black text-white text-sm",className)} style={{background:`linear-gradient(135deg,${g1},${g2})`}}>{initials}</div>);
// //   return<img src={src} alt={name} className={className} draggable={false} onError={()=>setFailed(true)}/>;
// // }

// // function RatingStars({rating}:{rating:number}){
// //   return(
// //     <div className="flex items-center gap-0.5">
// //       {Array.from({length:5}).map((_,i)=>(<Star key={i} className={cn("h-3 w-3",i<Math.floor(rating)?"fill-amber-400 text-amber-400":"text-gray-200")}/>))}
// //       <span className="ml-1 text-[11px] font-black text-amber-500">{rating.toFixed(1)}</span>
// //     </div>
// //   );
// // }

// // function TaskMiniBadge({tasks=[]}:{tasks?:StaffTask[]}){
// //   const stats=getTaskStats(tasks);
// //   return(
// //     <div className="flex items-center gap-1.5 flex-wrap">
// //       <span className="rounded-full px-2 py-0.5 text-[10px] font-black" style={{background:"#FFF8F0",color:"#FF8E53",border:"2px solid #FFD7BF"}}>📋 {stats.total}</span>
// //       <span className="rounded-full px-2 py-0.5 text-[10px] font-black" style={{background:"#FFF9C4",color:"#d68910",border:"2px solid #FFD93D"}}>⏳ {stats.pending}</span>
// //       <span className="rounded-full px-2 py-0.5 text-[10px] font-black" style={{background:"#E8FFE8",color:"#00b894",border:"2px solid #55efc4"}}>✅ {stats.done}</span>
// //     </div>
// //   );
// // }

// // function KpiCard({label,value,sub,icon:Icon,color,emoji,lit}:{label:string;value:number;sub:string;icon:React.ComponentType<{className?:string}>;color:string;emoji:string;lit:boolean}){
// //   return(
// //     <motion.div initial={{opacity:0,y:20,scale:0.92}} animate={{opacity:1,y:0,scale:1}}
// //       transition={{duration:0.4,type:"spring",bounce:0.4}}
// //       whileHover={{y:-5,scale:1.03}} whileTap={{scale:0.97}}
// //       className="relative overflow-hidden rounded-[22px] p-4 cursor-pointer"
// //       style={{
// //         background: lit ? "rgba(30,15,2,0.75)" : "white",
// //         border:`3.5px solid ${lit ? color+"55" : color+"33"}`,
// //         boxShadow: lit ? `0 8px 24px ${color}44, inset 0 1px 0 rgba(255,200,80,0.08)` : `0 8px 24px ${color}22`,
// //         backdropFilter: lit ? "blur(12px)" : "none",
// //       }}>
// //       <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[18px]" style={{background:`linear-gradient(90deg,${color},${color}88)`}}/>
// //       <div className="absolute right-2 bottom-1 text-5xl opacity-10 select-none">{emoji}</div>
// //       <div className="relative">
// //         <div className="mb-2 w-9 h-9 flex items-center justify-center rounded-[14px] text-white shadow-md" style={{background:`linear-gradient(135deg,${color},${color}bb)`}}>
// //           <Icon className="h-4 w-4"/>
// //         </div>
// //         <div className={cn("text-[10px] font-black uppercase tracking-widest mb-0.5", lit?"text-amber-600":"text-gray-400")}>{label}</div>
// //         <div className="text-[28px] font-black leading-none fredoka" style={{color: lit ? "#fbbf24" : color}}>
// //           <CountUp end={value} duration={1.2} separator="," decimals={value%1!==0?1:0}/>
// //         </div>
// //         <div className={cn("mt-1 text-[11px] font-semibold", lit?"text-amber-900/80":"text-gray-400")}>{sub}</div>
// //       </div>
// //     </motion.div>
// //   );
// // }

// // function ProgressBar({value,max,color="#4ECDC4"}:{value:number;max:number;color?:string}){
// //   const pct=max>0?Math.min(100,(value/max)*100):0;
// //   return(
// //     <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100" style={{border:"2px solid #eee"}}>
// //       <motion.div className="h-full rounded-full" style={{background:`linear-gradient(90deg,${color},${color}99)`}}
// //         initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.8,ease:"easeOut",delay:0.2}}/>
// //     </div>
// //   );
// // }

// // function PillBtn({children,active,onClick,color="#333",lit}:{children:React.ReactNode;active:boolean;onClick:()=>void;color?:string;lit?:boolean}){
// //   return(
// //     <motion.button type="button" onClick={onClick} whileHover={{scale:1.06}} whileTap={{scale:0.94}}
// //       className="px-3 py-1.5 rounded-full text-[12px] font-black transition-all"
// //       style={{
// //         background:active?color:lit?"rgba(40,20,5,0.6)":"white",
// //         color:active?"white":lit?"#d4a050":"#666",
// //         border:`2.5px solid ${active?color:lit?"rgba(200,130,40,0.3)":"#DDD"}`,
// //         boxShadow:active?`0 4px 12px ${color}44`:"none",
// //       }}>{children}</motion.button>
// //   );
// // }

// // /* ─── STAFF FLIP CARD (colour-adapted for night mode) ─── */
// // function StaffFlipCard({member,index,selected,onSelect,lit}:{member:StaffMember;index:number;selected?:boolean;onSelect?:(m:StaffMember)=>void;lit:boolean}){
// //   const[flipped,setFlipped]=React.useState(false);
// //   const role=roleCfg[member.role]; const status=statusCfg[member.status]; const RoleIcon=role.icon;
// //   const sparkData=React.useMemo(()=>generateSparkData(50,member.trend),[member.id,member.trend]);
// //   const sparkColor=member.trend>=0?"#6BCB77":"#FF6B6B";
// //   const[g1,g2]=CARD_GRADIENTS[index%CARD_GRADIENTS.length];
// //   const taskStats=getTaskStats(member.tasks||[]);
// //   const cardBg = lit ? "rgba(20,10,2,0.78)" : "white";
// //   const cardBorder = lit ? (selected?`${g1}aa`:"rgba(200,130,40,0.25)") : (selected?"#4ECDC4":"#EBEBEB");
// //   const textMain = lit ? "#f5e0b0" : "#1f2937";
// //   const textSub  = lit ? "#a07848" : "#6b7280";
// //   const itemBg   = lit ? "rgba(255,180,40,0.07)" : "#F8F9FF";
// //   const itemBorder= lit ? "rgba(200,120,30,0.2)" : "#EBEBF5";

// //   return(
// //     <div className="relative h-[430px] cursor-pointer select-none" style={{perspective:"1200px"}}
// //       onClick={()=>{setFlipped(f=>!f);onSelect?.(member);}}>
// //       <motion.div animate={{rotateY:flipped?180:0}} transition={{duration:0.55}}
// //         style={{transformStyle:"preserve-3d"}} className="relative h-full w-full">

// //         {/* FRONT */}
// //         <motion.div className="absolute inset-0 overflow-hidden rounded-[24px]"
// //           style={{backfaceVisibility:"hidden",background:cardBg,border:`3.5px solid ${cardBorder}`,
// //             boxShadow:selected
// //               ?lit?`0 0 0 3px ${g1}66,0 12px 40px rgba(255,160,40,0.30)`:`0 0 0 3px #4ECDC444,0 12px 32px rgba(0,0,0,0.10)`
// //               :lit?"0 8px 32px rgba(0,0,0,0.60),inset 0 1px 0 rgba(255,200,80,0.06)":"0 8px 24px rgba(0,0,0,0.07)",
// //             backdropFilter: lit?"blur(16px)":"none",
// //           }}>
// //           {/* card top image */}
// //           <div className="relative h-[185px] w-full overflow-hidden" style={{background:`linear-gradient(135deg,${g1},${g2})`}}>
// //             <Avatar src={member.img} name={member.name} index={index} className="absolute inset-0 h-full w-full object-cover opacity-90"/>
// //             <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle,white 1.5px,transparent 1.5px)",backgroundSize:"16px 16px"}}/>
// //             {lit && <div className="absolute inset-0" style={{background:"linear-gradient(to bottom, rgba(255,160,30,0.08) 0%, rgba(0,0,0,0.20) 100%)"}}/>}

// //             <motion.div animate={{y:[0,-3,0]}} transition={{duration:2,repeat:Infinity,delay:index*0.3}}
// //               className="absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black text-white"
// //               style={{background:`${role.color}dd`,border:"2px solid rgba(255,255,255,0.4)",boxShadow:`0 4px 12px ${role.color}66`}}>
// //               <RoleIcon className="h-3 w-3"/> {role.label}
// //             </motion.div>

// //             <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black text-white"
// //               style={{background:"rgba(0,0,0,0.45)",border:"2px solid rgba(255,255,255,0.3)",backdropFilter:"blur(8px)"}}>
// //               <motion.span animate={{scale:[1,1.3,1]}} transition={{duration:1.5,repeat:Infinity}}
// //                 className="h-2 w-2 rounded-full inline-block" style={{background:status.color,boxShadow:`0 0 6px ${status.glow}`}}/>
// //               {status.label}
// //             </div>

// //             <div className="absolute inset-x-0 bottom-0 px-4 pb-3 bg-gradient-to-t from-black/60 to-transparent">
// //               <div className="text-[15px] font-black text-white fredoka drop-shadow">{member.name}</div>
// //               <div className="text-[10px] text-white/70 font-mono">{member.id}</div>
// //             </div>
// //           </div>

// //           <div className="px-4 pb-4 pt-3">
// //             <div className="flex items-center gap-1.5 text-[11px] font-semibold mb-2" style={{color:textSub}}>
// //               <MapPin className="h-3 w-3"/> {member.branch}
// //             </div>
// //             <div className="flex items-center justify-between mb-3">
// //               <RatingStars rating={member.rating}/>
// //               <span className={cn("flex items-center gap-1 text-[10px] font-black",member.trend>0?"text-emerald-500":member.trend<0?"text-rose-500":"text-gray-400")}>
// //                 {member.trend>0?<TrendingUp className="h-3 w-3"/>:member.trend<0?<TrendingDown className="h-3 w-3"/>:null}
// //                 {member.trend!==0?`${member.trend>0?"+":""}${member.trend}% MoM`:"Stable"}
// //               </span>
// //             </div>

// //             <div className="flex items-end gap-3">
// //               <div className="flex-1 grid grid-cols-3 gap-1.5">
// //                 {[{l:"Shifts",v:String(member.shifts)},{l:"Orders",v:member.orders>0?String(member.orders):"—"},{l:"Sales",v:shortMoney(member.sales)}].map(item=>(
// //                   <div key={item.l} className="rounded-[12px] p-2 text-center" style={{background:itemBg,border:`2px solid ${itemBorder}`}}>
// //                     <div className="text-[8px] font-black uppercase tracking-wider" style={{color:textSub}}>{item.l}</div>
// //                     <div className="text-[12px] font-black mt-0.5" style={{color:textMain}}>{item.v}</div>
// //                   </div>
// //                 ))}
// //               </div>
// //               <div className="opacity-70"><Sparkline data={sparkData} color={sparkColor}/></div>
// //             </div>

// //             <div className="mt-3 grid grid-cols-2 gap-2">
// //               {[{l:"Staff ID",v:String(member.staffId||"—")},{l:"Salary",v:member.salary?`¥${Number(member.salary).toLocaleString()}`:"—"}].map(item=>(
// //                 <div key={item.l} className="rounded-[12px] p-2 text-center" style={{background:itemBg,border:`2px solid ${itemBorder}`}}>
// //                   <div className="text-[8px] font-black uppercase tracking-wider" style={{color:textSub}}>{item.l}</div>
// //                   <div className="text-[12px] font-black mt-0.5" style={{color:textMain}}>{item.v}</div>
// //                 </div>
// //               ))}
// //             </div>

// //             <div className="mt-3 rounded-[14px] p-3" style={{background:lit?"rgba(255,160,30,0.08)":"#FFF8F2",border:lit?"2px solid rgba(255,150,30,0.2)":"2px solid #FFE2D1"}}>
// //               <div className="flex items-center justify-between mb-2">
// //                 <div className="text-[10px] font-black uppercase tracking-wider" style={{color:textSub}}>Tasks</div>
// //                 <TaskMiniBadge tasks={member.tasks}/>
// //               </div>
// //               <div className="grid grid-cols-3 gap-2">
// //                 {[{l:"Pending",v:taskStats.pending,c:"#d68910"},{l:"Doing",v:taskStats.progress,c:"#0984e3"},{l:"Done",v:taskStats.done,c:"#00b894"}].map(item=>(
// //                   <div key={item.l} className="rounded-[12px] p-2 text-center" style={{background:lit?"rgba(0,0,0,0.25)":"white",border:lit?"2px solid rgba(200,130,30,0.15)":"2px solid #F1F1F1"}}>
// //                     <div className="text-[8px] font-black uppercase tracking-wider" style={{color:textSub}}>{item.l}</div>
// //                     <div className="text-[12px] font-black mt-0.5" style={{color:item.c}}>{item.v}</div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           </div>
// //         </motion.div>

// //         {/* BACK */}
// //         <div className="absolute inset-0 overflow-hidden rounded-[24px] p-5"
// //           style={{backfaceVisibility:"hidden",transform:"rotateY(180deg)",background:cardBg,
// //             border:`3.5px solid ${cardBorder}`,boxShadow:lit?"0 8px 32px rgba(0,0,0,0.60)":"0 8px 24px rgba(0,0,0,0.07)",
// //             backdropFilter:lit?"blur(16px)":"none",
// //           }}>
// //           <div className="flex items-start justify-between mb-4">
// //             <div>
// //               <div className="text-[15px] font-black fredoka" style={{color:textMain}}>{member.name}</div>
// //               <div className="text-[10px] font-mono" style={{color:textSub}}>{member.id}</div>
// //             </div>
// //             <div className="h-10 w-10 rounded-[14px] overflow-hidden" style={{border:`3px solid ${g1}44`}}>
// //               <Avatar src={member.img} name={member.name} index={index} className="h-full w-full object-cover"/>
// //             </div>
// //           </div>

// //           <div className="space-y-2.5 mb-4">
// //             {[{icon:Mail,v:member.email},{icon:Phone,v:member.phone},{icon:Calendar,v:`Joined ${formatDate(member.joined)}`},{icon:Briefcase,v:member.branch},{icon:IdCard,v:`Staff ID: ${member.staffId||"—"}`},{icon:Wallet,v:`Salary: ${member.salary?`¥${Number(member.salary).toLocaleString()}`:"—"}`}].map((row,i)=>(
// //               <div key={i} className="flex items-center gap-2 text-[11px] font-semibold" style={{color:textSub}}>
// //                 <row.icon className="h-3 w-3 shrink-0" style={{opacity:0.5}}/><span className="truncate">{row.v}</span>
// //               </div>
// //             ))}
// //           </div>

// //           <div className="mb-4 rounded-[14px] p-3" style={{background:lit?"rgba(255,160,30,0.08)":"#FFF8F2",border:lit?"2px solid rgba(255,150,30,0.2)":"2px solid #FFE2D1"}}>
// //             <div className="text-[10px] font-black uppercase tracking-wider mb-2" style={{color:textSub}}>Task Summary</div>
// //             <TaskMiniBadge tasks={member.tasks}/>
// //           </div>

// //           <div className="flex gap-2" onClick={e=>e.stopPropagation()}>
// //             <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}}
// //               onClick={()=>onSelect?.(member)}
// //               className="flex-1 flex items-center justify-center gap-1.5 rounded-[14px] py-2 text-[12px] font-black text-white"
// //               style={{background:`linear-gradient(135deg,${g1},${g2})`,border:"none",boxShadow:`0 4px 12px ${g1}44`}}>
// //               <Eye className="h-3.5 w-3.5"/> View
// //             </motion.button>

// //             <DropdownMenu>
// //               <DropdownMenuTrigger asChild>
// //                 <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}}
// //                   className="flex-1 flex items-center justify-center gap-1.5 rounded-[14px] py-2 text-[12px] font-black"
// //                   style={{background:lit?"rgba(255,180,40,0.10)":"white",color:lit?"#d4a050":"#666",border:lit?"2.5px solid rgba(200,130,40,0.25)":"2.5px solid #EEE"}}>
// //                   <MoreHorizontal className="h-3.5 w-3.5"/> Actions
// //                 </motion.button>
// //               </DropdownMenuTrigger>
// //               <DropdownMenuContent align="end" className="min-w-[160px] rounded-[18px] border-2 border-gray-100 p-1.5 shadow-xl bg-white">
// //                 {[{icon:Eye,label:"View Profile"},{icon:Pencil,label:"Edit Staff"},{icon:ClipboardList,label:"Assign Task"},{icon:Activity,label:"Activity"}].map(item=>(
// //                   <DropdownMenuItem key={item.label} className="cursor-pointer rounded-[12px] gap-2 py-2.5 text-[13px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50">
// //                     <item.icon className="h-3.5 w-3.5"/>{item.label}
// //                   </DropdownMenuItem>
// //                 ))}
// //                 <DropdownMenuSeparator className="my-1 bg-gray-100"/>
// //                 <DropdownMenuItem className="cursor-pointer rounded-[12px] gap-2 py-2.5 text-[13px] font-semibold text-rose-500 hover:bg-rose-50">
// //                   <Trash2 className="h-3.5 w-3.5"/> Remove
// //                 </DropdownMenuItem>
// //               </DropdownMenuContent>
// //             </DropdownMenu>
// //           </div>
// //         </div>
// //       </motion.div>
// //     </div>
// //   );
// // }

// // function CompactCard({member,index,selected,onSelect,lit}:{member:StaffMember;index:number;selected?:boolean;onSelect?:(m:StaffMember)=>void;lit:boolean}){
// //   const role=roleCfg[member.role]; const status=statusCfg[member.status];
// //   const[g1]=CARD_GRADIENTS[index%CARD_GRADIENTS.length];
// //   const cardBg=lit?"rgba(20,10,2,0.72)":"white";
// //   const textMain=lit?"#f5e0b0":"#1f2937"; const textSub=lit?"#a07848":"#6b7280";
// //   return(
// //     <motion.button whileHover={{x:4,scale:1.01}} whileTap={{scale:0.98}} onClick={()=>onSelect?.(member)}
// //       className="w-full rounded-[20px] p-4 text-left transition-all"
// //       style={{background:cardBg,border:`3px solid ${selected?g1:lit?"rgba(200,130,40,0.25)":"#EBEBEB"}`,
// //         boxShadow:selected?`0 0 0 2px ${g1}44,0 8px 20px ${lit?"rgba(255,160,40,0.15)":"rgba(0,0,0,0.08)"}`
// //           :lit?"0 8px 24px rgba(0,0,0,0.50)":"0 2px 8px rgba(0,0,0,0.04)",
// //         backdropFilter:lit?"blur(14px)":"none",
// //       }}>
// //       <div className="flex items-center gap-4">
// //         <div className="relative shrink-0">
// //           <div className="h-14 w-14 rounded-[18px] overflow-hidden" style={{border:`3px solid ${g1}44`}}>
// //             <Avatar src={member.img} name={member.name} index={index} className="h-full w-full object-cover"/>
// //           </div>
// //           <motion.div animate={{scale:[1,1.2,1]}} transition={{duration:2,repeat:Infinity}}
// //             className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white"
// //             style={{background:status.color,boxShadow:`0 0 8px ${status.glow}`}}/>
// //         </div>
// //         <div className="min-w-0 flex-1">
// //           <div className="flex items-center gap-2 flex-wrap">
// //             <span className="text-[14px] font-black fredoka" style={{color:textMain}}>{member.name}</span>
// //             <span className="rounded-full px-2 py-0.5 text-[10px] font-black" style={{background:role.bg,color:role.color,border:`2px solid ${role.color}44`}}>
// //               {role.emoji} {role.label}
// //             </span>
// //           </div>
// //           <div className="text-[11px] font-semibold mt-0.5" style={{color:textSub}}>
// //             {member.id} · {member.branch} · Staff ID {member.staffId||"—"}
// //           </div>
// //           <div className="mt-2"><ProgressBar value={member.sales} max={1300000} color={g1}/></div>
// //           <div className="mt-1 flex items-center justify-between">
// //             <span className="text-[10px] font-semibold" style={{color:textSub}}>Sales {shortMoney(member.sales)}</span>
// //             <span className="text-[10px] font-semibold" style={{color:textSub}}>{member.orders} orders · {member.shifts} shifts</span>
// //           </div>
// //           <div className="mt-2"><TaskMiniBadge tasks={member.tasks}/></div>
// //         </div>
// //         <div className="flex flex-col items-end gap-2 shrink-0">
// //           <RatingStars rating={member.rating}/>
// //           <span className={cn("flex items-center gap-1 text-[10px] font-black",member.trend>0?"text-emerald-500":member.trend<0?"text-rose-500":"text-gray-400")}>
// //             {member.trend>0?<TrendingUp className="h-3 w-3"/>:member.trend<0?<TrendingDown className="h-3 w-3"/>:null}
// //             {member.trend!==0?`${member.trend>0?"+":""}${member.trend}%`:"—"}
// //           </span>
// //           <ChevronRight className="h-4 w-4" style={{color:lit?"#a07848":"#d1d5db"}}/>
// //         </div>
// //       </div>
// //     </motion.button>
// //   );
// // }

// // /* ─── Detail Panel (unchanged logic, minor night-aware styling) ─── */
// // function DetailPanel({member,onClose,onAddTask,onUpdateTaskStatus,lit}:{
// //   member:StaffMember|null; onClose:()=>void;
// //   onAddTask:(staffId:string,task:Omit<StaffTask,"id">)=>void;
// //   onUpdateTaskStatus:(staffId:string,taskId:string,status:TaskStatus)=>void;
// //   lit:boolean;
// // }){
// //   const[tab,setTab]=React.useState<PanelTab>("profile");
// //   const gradIdx=member?Math.max(0,Number(String(member.rawId).replace(/\D/g,""))||0)%CARD_GRADIENTS.length:0;
// //   const[g1,g2]=CARD_GRADIENTS[gradIdx];
// //   const actIcons:Record<string,React.FC<{className?:string;style?:React.CSSProperties}>>={shift:Clock,sale:Activity,stock:Store,review:Star,login:CheckCircle2};
// //   const panelBg=lit?"rgba(16,8,1,0.85)":"white";
// //   const textMain=lit?"#f5e0b0":"#1f2937"; const textSub=lit?"#a07848":"#6b7280";
// //   const rowBg=lit?"rgba(255,180,40,0.06)":"#f9fafb"; const rowBorder=lit?"rgba(200,130,40,0.15)":"#e5e7eb";

// //   return(
// //     <div className="sticky top-5 h-fit rounded-[24px] overflow-hidden"
// //       style={{background:panelBg,border:lit?"3.5px solid rgba(200,130,40,0.25)":"3.5px solid #EBEBEB",
// //         boxShadow:lit?"0 16px 50px rgba(0,0,0,0.70), inset 0 1px 0 rgba(255,200,80,0.06)":"0 16px 40px rgba(0,0,0,0.10)",
// //         backdropFilter:lit?"blur(20px)":"none",
// //       }}>
// //       <div className="flex items-center justify-between px-5 py-4" style={{background:`linear-gradient(135deg,${g1},${g2})`}}>
// //         <div className="flex items-center gap-2">
// //           <span className="text-xl">🔍</span>
// //           <div className="text-[15px] font-black text-white fredoka">Staff Detail</div>
// //         </div>
// //         <div className="flex items-center gap-2">
// //           {member&&(
// //             <div className="flex gap-1 rounded-full p-1" style={{background:"rgba(255,255,255,0.2)"}}>
// //               {(["profile","activity","stats","tasks"] as PanelTab[]).map(tb=>(
// //                 <button key={tb} type="button" onClick={()=>setTab(tb)}
// //                   className="rounded-full px-2.5 py-1 text-[10px] font-black capitalize transition-all"
// //                   style={{background:tab===tb?"white":"transparent",color:tab===tb?g1:"rgba(255,255,255,0.8)"}}>
// //                   {tb}
// //                 </button>
// //               ))}
// //             </div>
// //           )}
// //           <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-full bg-white/20 text-white"><X className="h-4 w-4"/></button>
// //         </div>
// //       </div>

// //       {!member?(
// //         <div className="p-10 text-center">
// //           <div className="text-5xl mb-3">👥</div>
// //           <div className="text-[14px] font-black fredoka" style={{color:textMain}}>No staff selected</div>
// //           <div className="text-[12px] mt-1 font-semibold" style={{color:textSub}}>Tap any card to preview details.</div>
// //         </div>
// //       ):(
// //         <AnimatePresence mode="wait">
// //           <motion.div key={`${member.id}-${tab}`} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.2}}>

// //             {tab==="profile"&&(
// //               <div className="p-5 space-y-4">
// //                 <div className="relative rounded-[20px] h-36 overflow-hidden" style={{background:`linear-gradient(135deg,${g1},${g2})`}}>
// //                   <Avatar src={member.img} name={member.name} index={gradIdx} className="absolute inset-0 h-full w-full object-cover opacity-80"/>
// //                   <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/60 to-transparent w-full">
// //                     <div className="text-[17px] font-black text-white fredoka">{member.name}</div>
// //                     <div className="flex items-center gap-2 mt-1 flex-wrap">
// //                       <span className="rounded-full px-2 py-0.5 text-[10px] font-black text-white" style={{background:`${roleCfg[member.role].color}cc`}}>{roleCfg[member.role].emoji} {roleCfg[member.role].label}</span>
// //                       <span className="rounded-full px-2 py-0.5 text-[10px] font-black text-white" style={{background:statusCfg[member.status].color+"cc"}}>{statusCfg[member.status].emoji} {statusCfg[member.status].label}</span>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div className="grid grid-cols-2 gap-2.5">
// //                   {[{l:"Orders",v:member.orders||"—",icon:BadgeCheck,color:"#4ECDC4"},{l:"Sales",v:money(member.sales),icon:Activity,color:"#FF6B6B"},{l:"Shifts",v:member.shifts,icon:Clock,color:"#FFD93D"},{l:"Rating",v:member.rating.toFixed(1)+" ★",icon:Star,color:"#C77DFF"}].map(item=>(
// //                     <div key={item.l} className="rounded-[16px] p-3 text-center" style={{background:item.color+"11",border:`2.5px solid ${item.color}33`}}>
// //                       <item.icon className="h-4 w-4 mx-auto mb-1" style={{color:item.color}}/>
// //                       <div className="text-[9px] font-black uppercase tracking-wider" style={{color:textSub}}>{item.l}</div>
// //                       <div className="text-[16px] font-black fredoka mt-0.5" style={{color:item.color}}>{item.v}</div>
// //                     </div>
// //                   ))}
// //                 </div>

// //                 <div className="rounded-[18px] p-4" style={{background:panelBg,border:`2.5px solid ${rowBorder}`}}>
// //                   <div className="text-[11px] font-black uppercase tracking-wider mb-3" style={{color:textSub}}>Staff Information</div>
// //                   <div className="grid grid-cols-1 gap-2 text-[12px] md:grid-cols-2">
// //                     {[
// //                       {icon:IdCard,l:"Staff ID",v:String(member.staffId||"—")},
// //                       {icon:Cake,l:"Date of Birth",v:formatDate(member.dateOfBirth)||"—"},
// //                       {icon:Phone,l:"Phone",v:member.phone||"—"},
// //                       {icon:Mail,l:"Email",v:member.email||"—"},
// //                       {icon:FileText,l:"NRC",v:member.nrc||"—"},
// //                       {icon:Wallet,l:"Salary",v:member.salary?`¥${Number(member.salary).toLocaleString()}`:"—"},
// //                       {icon:Calendar,l:"Start Date",v:formatDate(member.joined)},
// //                       {icon:Briefcase,l:"Branch",v:member.branch||"—"},
// //                     ].map((row,i)=>(
// //                       <div key={i} className="rounded-[12px] p-3" style={{background:rowBg}}>
// //                         <div className="flex items-center gap-1 text-[10px] font-black uppercase" style={{color:textSub}}><row.icon className="h-3 w-3"/> {row.l}</div>
// //                         <div className="font-bold" style={{color:textMain}}>{row.v}</div>
// //                       </div>
// //                     ))}
// //                     <div className="rounded-[12px] p-3 md:col-span-2" style={{background:rowBg}}>
// //                       <div className="flex items-center gap-1 text-[10px] font-black uppercase" style={{color:textSub}}><MapPin className="h-3 w-3"/> Address</div>
// //                       <div className="font-bold" style={{color:textMain}}>{member.address||"—"}</div>
// //                     </div>
// //                     <div className="rounded-[12px] p-3" style={{background:rowBg}}>
// //                       <div className="flex items-center gap-1 text-[10px] font-black uppercase" style={{color:textSub}}><UserRound className="h-3 w-3"/> Emergency Contact</div>
// //                       <div className="font-bold" style={{color:textMain}}>{member.emergencyContact||"—"}</div>
// //                     </div>
// //                     <div className="rounded-[12px] p-3" style={{background:rowBg}}>
// //                       <div className="flex items-center gap-1 text-[10px] font-black uppercase" style={{color:textSub}}><Contact className="h-3 w-3"/> Emergency Phone</div>
// //                       <div className="font-bold" style={{color:textMain}}>{member.emergencyPhone||"—"}</div>
// //                     </div>
// //                     <div className="rounded-[12px] p-3 md:col-span-2" style={{background:rowBg}}>
// //                       <div className="flex items-center gap-1 text-[10px] font-black uppercase" style={{color:textSub}}><FileText className="h-3 w-3"/> Note</div>
// //                       <div className="font-bold whitespace-pre-wrap" style={{color:textMain}}>{member.note||"—"}</div>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             )}

// //             {tab==="activity"&&(
// //               <div className="p-5">
// //                 <div className="text-[12px] font-black uppercase tracking-wider mb-4" style={{color:textSub}}>Recent Activity ⚡</div>
// //                 <div className="space-y-1">
// //                   {ACTIVITY_FEED.map((act,i)=>{
// //                     const Icon=actIcons[act.type]||Activity;
// //                     return(
// //                       <motion.div key={act.id} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}}
// //                         className="flex gap-3 rounded-[14px] p-3 transition-colors"
// //                         style={{"--hover-bg":lit?"rgba(255,180,40,0.06)":"#f9fafb"} as any}
// //                         onMouseEnter={e=>(e.currentTarget.style.background=lit?"rgba(255,180,40,0.06)":"#f9fafb")}
// //                         onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
// //                         <div className="h-7 w-7 flex items-center justify-center rounded-[10px] shrink-0" style={{background:`${g1}15`,border:`2px solid ${g1}33`}}>
// //                           <Icon className="h-3.5 w-3.5" style={{color:g1}}/>
// //                         </div>
// //                         <div className="min-w-0 flex-1">
// //                           <div className="text-[12px] font-semibold leading-snug" style={{color:textMain}}>{act.text}</div>
// //                           <div className="text-[10px] mt-0.5 font-semibold" style={{color:textSub}}>{act.time}</div>
// //                         </div>
// //                       </motion.div>
// //                     );
// //                   })}
// //                 </div>
// //               </div>
// //             )}

// //             {tab==="stats"&&(
// //               <div className="p-5 space-y-3">
// //                 <div className="text-[12px] font-black uppercase tracking-wider mb-2" style={{color:textSub}}>Performance 📊</div>
// //                 {[{l:"Monthly Sales",v:member.sales,max:1300000,color:g1},{l:"Orders Completed",v:member.orders,max:500,color:"#4ECDC4"},{l:"Shifts Attended",v:member.shifts,max:25,color:"#FFD93D"}].map(stat=>(
// //                   <div key={stat.l} className="rounded-[16px] p-4" style={{background:`${stat.color}0e`,border:`2.5px solid ${stat.color}22`}}>
// //                     <div className="flex items-center justify-between mb-2">
// //                       <div className="text-[11px] font-black" style={{color:textSub}}>{stat.l}</div>
// //                       <div className="text-[14px] font-black fredoka" style={{color:stat.color}}>{stat.l.includes("Sales")?shortMoney(stat.v):stat.v}</div>
// //                     </div>
// //                     <ProgressBar value={stat.v} max={stat.max} color={stat.color}/>
// //                     <div className="mt-1.5 text-[10px] font-semibold" style={{color:textSub}}>{Math.round((stat.v/stat.max)*100)}% of target</div>
// //                   </div>
// //                 ))}
// //               </div>
// //             )}

// //             {tab==="tasks"&&member&&(
// //               <div className="p-5 space-y-4">
// //                 <div className="flex items-center justify-between">
// //                   <div className="text-[12px] font-black uppercase tracking-wider" style={{color:textSub}}>Assigned Tasks 📋</div>
// //                   <button type="button"
// //                     onClick={()=>onAddTask(member.id,{title:"New assigned task",description:"Task created from admin panel.",dueDate:"06:00 PM",status:"Pending",priority:"Medium"})}
// //                     className="rounded-full px-3 py-1.5 text-[11px] font-black text-white"
// //                     style={{background:"linear-gradient(135deg,#FF6B6B,#FF8E53)",boxShadow:"0 4px 12px rgba(255,107,107,0.25)"}}>
// //                     + Assign Task
// //                   </button>
// //                 </div>
// //                 <div className="grid grid-cols-3 gap-2">
// //                   {[{label:"Pending",value:getTaskStats(member.tasks).pending,color:"#d68910",bg:"#FFF9C4",border:"#FFD93D"},{label:"Doing",value:getTaskStats(member.tasks).progress,color:"#0984e3",bg:"#E0F4FF",border:"#74b9ff"},{label:"Done",value:getTaskStats(member.tasks).done,color:"#00b894",bg:"#E8FFE8",border:"#55efc4"}].map(item=>(
// //                     <div key={item.label} className="rounded-[14px] p-3 text-center" style={{background:item.bg,border:`2.5px solid ${item.border}`}}>
// //                       <div className="text-[9px] font-black uppercase tracking-wider text-gray-500">{item.label}</div>
// //                       <div className="mt-1 text-[18px] font-black fredoka" style={{color:item.color}}>{item.value}</div>
// //                     </div>
// //                   ))}
// //                 </div>
// //                 <div className="space-y-3">
// //                   {(member.tasks||[]).map(task=>{
// //                     const ss=taskStatusColor(task.status); const pc=taskPriorityColor(task.priority);
// //                     return(
// //                       <div key={task.id} className="rounded-[18px] p-4" style={{background:lit?"rgba(30,15,2,0.60)":"white",border:lit?"2.5px solid rgba(200,130,40,0.15)":"2.5px solid #EBEBEB"}}>
// //                         <div className="flex items-start justify-between gap-3">
// //                           <div className="min-w-0 flex-1">
// //                             <div className="flex items-center gap-2 flex-wrap">
// //                               <span className="inline-block rounded-full" style={{width:10,height:10,background:pc,boxShadow:`0 0 8px ${pc}66`}}/>
// //                               <div className="text-[13px] font-black" style={{color:textMain}}>{task.title}</div>
// //                             </div>
// //                             <div className="mt-1 text-[11px] font-semibold" style={{color:textSub}}>{task.description||"No description"}</div>
// //                             <div className="mt-2 flex flex-wrap items-center gap-2">
// //                               {[task.id,task.priority,`Due ${task.dueDate||"—"}`].map(label=>(
// //                                 <span key={label} className="rounded-full px-2 py-0.5 text-[10px] font-black" style={{background:lit?"rgba(255,180,40,0.08)":"#f3f4f6",color:textSub,border:lit?"1px solid rgba(200,130,40,0.2)":"1px solid #e5e7eb"}}>{label}</span>
// //                               ))}
// //                             </div>
// //                           </div>
// //                           <span className="rounded-full px-3 py-1 text-[10px] font-black" style={{background:ss.bg,color:ss.color,border:`2px solid ${ss.border}`}}>{task.status}</span>
// //                         </div>
// //                         <div className="mt-3 flex flex-wrap gap-2">
// //                           {(["Pending","In Progress","Done"] as TaskStatus[]).map(s=>(
// //                             <button key={s} type="button" onClick={()=>onUpdateTaskStatus(member.id,task.id,s)}
// //                               className="rounded-full px-3 py-1.5 text-[10px] font-black transition-all"
// //                               style={{background:task.status===s?"#FF6B6B":lit?"rgba(255,180,40,0.08)":"white",color:task.status===s?"white":textSub,border:`2px solid ${task.status===s?"#FF6B6B":lit?"rgba(200,130,40,0.20)":"#DDD"}`}}>
// //                               {s}
// //                             </button>
// //                           ))}
// //                         </div>
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               </div>
// //             )}
// //           </motion.div>
// //         </AnimatePresence>
// //       )}
// //     </div>
// //   );
// // }

// // /* ─── Pagination ─── */
// // function PaginationBar({currentPage,totalPages,pageSize,totalItems,startIndex,endIndex,onPageChange,onPageSizeChange,lit}:{
// //   currentPage:number;totalPages:number;pageSize:number;totalItems:number;
// //   startIndex:number;endIndex:number;
// //   onPageChange:(p:number)=>void;onPageSizeChange:(s:number)=>void;lit:boolean;
// // }){
// //   const pages=buildPageNumbers(currentPage,totalPages);
// //   const bg=lit?"rgba(20,10,2,0.72)":"white";
// //   const border=lit?"rgba(200,130,40,0.22)":"#EBEBEB";
// //   const textSub=lit?"#a07848":"#6b7280";

// //   return(
// //     <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
// //       className="mt-5 rounded-[24px] p-4"
// //       style={{background:bg,border:`3px solid ${border}`,boxShadow:lit?"0 8px 24px rgba(0,0,0,0.50)":"0 8px 20px rgba(0,0,0,0.05)",backdropFilter:lit?"blur(14px)":"none"}}>
// //       <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
// //         <div className="flex flex-wrap items-center gap-3">
// //           <div className="rounded-full px-4 py-2 text-[12px] font-black" style={{color:textSub,background:lit?"rgba(255,200,50,0.08)":"#FFF8E7",border:lit?"2px solid rgba(200,130,40,0.20)":"2px solid #FFD93D66"}}>
// //             📚 Showing {totalItems===0?0:startIndex}-{endIndex} of {totalItems}
// //           </div>
// //           <div className="flex items-center gap-2 rounded-full px-3 py-2" style={{background:lit?"rgba(255,180,40,0.07)":"#F8F9FF",border:lit?"2px solid rgba(200,130,40,0.15)":"2px solid #E9ECFF"}}>
// //             <span className="text-[11px] font-black" style={{color:textSub}}>Cards</span>
// //             {PAGE_SIZE_OPTIONS.map(size=>(
// //               <button key={size} type="button" onClick={()=>onPageSizeChange(size)}
// //                 className="rounded-full px-3 py-1 text-[11px] font-black transition-all"
// //                 style={{background:pageSize===size?"#4ECDC4":lit?"rgba(30,15,2,0.40)":"white",color:pageSize===size?"white":textSub,border:`2px solid ${pageSize===size?"#4ECDC4":lit?"rgba(200,130,40,0.18)":"#DDD"}`}}>
// //                 {size}
// //               </button>
// //             ))}
// //           </div>
// //         </div>

// //         <div className="flex flex-wrap items-center gap-2">
// //           {[{icon:ChevronsLeft,disabled:currentPage===1,action:()=>onPageChange(1)},{icon:ChevronLeft,disabled:currentPage===1,action:()=>onPageChange(currentPage-1)}].map((btn,i)=>(
// //             <button key={i} type="button" disabled={btn.disabled} onClick={btn.action}
// //               className="h-10 w-10 rounded-[14px] flex items-center justify-center disabled:opacity-40"
// //               style={{background:lit?"rgba(30,15,2,0.50)":"white",border:`2.5px solid ${border}`}}>
// //               <btn.icon className="h-4 w-4" style={{color:textSub}}/>
// //             </button>
// //           ))}

// //           <div className="flex items-center gap-2 rounded-[18px] px-2 py-2" style={{background:lit?"rgba(30,15,2,0.50)":"#FFF",border:`2.5px solid ${border}`}}>
// //             {pages.map((page,idx)=>
// //               page==="..."?(
// //                 <span key={`e-${idx}`} className="px-2 text-sm font-black" style={{color:textSub}}>...</span>
// //               ):(
// //                 <button key={page} type="button" onClick={()=>onPageChange(page as number)}
// //                   className="min-w-[40px] h-10 rounded-[14px] px-3 text-[12px] font-black transition-all"
// //                   style={{
// //                     background:currentPage===page?"linear-gradient(135deg,#FF6B6B,#FF8E53)":lit?"rgba(255,180,40,0.07)":"white",
// //                     color:currentPage===page?"white":textSub,
// //                     border:`2.5px solid ${currentPage===page?"#FF8E53":border}`,
// //                     boxShadow:currentPage===page?"0 6px 16px rgba(255,107,107,0.25)":"none",
// //                   }}>{page}</button>
// //               )
// //             )}
// //           </div>

// //           {[{icon:PageChevronRight,disabled:currentPage===totalPages||totalPages===0,action:()=>onPageChange(currentPage+1)},{icon:ChevronsRight,disabled:currentPage===totalPages||totalPages===0,action:()=>onPageChange(totalPages)}].map((btn,i)=>(
// //             <button key={i} type="button" disabled={btn.disabled} onClick={btn.action}
// //               className="h-10 w-10 rounded-[14px] flex items-center justify-center disabled:opacity-40"
// //               style={{background:lit?"rgba(30,15,2,0.50)":"white",border:`2.5px solid ${border}`}}>
// //               <btn.icon className="h-4 w-4" style={{color:textSub}}/>
// //             </button>
// //           ))}
// //         </div>
// //       </div>
// //     </motion.div>
// //   );
// // }

// // /* ═══════════════════════════════════════════════════════
// //    MAIN PAGE
// // ═══════════════════════════════════════════════════════ */
// // export default function StaffPage(){
// //   const{data:session,status:sessionStatus}=useSession();

// //   const[staffList,setStaffList]=React.useState<StaffMember[]>([]);
// //   const[q,setQ]=React.useState("");
// //   const[roleFilter,setRoleFilter]=React.useState("All");
// //   const[statusFilter,setStatusFilter]=React.useState("All");
// //   const[viewMode,setViewMode]=React.useState<ViewMode>("grid");
// //   const[sortMode,setSortMode]=React.useState<SortMode>("name_asc");
// //   const[selectedId,setSelectedId]=React.useState<string|null>(null);
// //   const[panelOpen,setPanelOpen]=React.useState(true);
// //   const[notification,setNotification]=React.useState<string|null>(null);
// //   const[loading,setLoading]=React.useState(true);
// //   const[error,setError]=React.useState<string|null>(null);
// //   const[refreshing,setRefreshing]=React.useState(false);
// //   const[currentPage,setCurrentPage]=React.useState(1);
// //   const[pageSize,setPageSize]=React.useState<number>(9);
// //   /* ── LANTERN STATE ── */
// //   const[lanternLit,setLanternLit]=React.useState(false);

// //   function showNotif(msg:string){ setNotification(msg); setTimeout(()=>setNotification(null),3000); }

// //   const fetchStaff=React.useCallback(async(refresh=false)=>{
// //     try{
// //       const accessToken=(session as any)?.accessToken;
// //       if(!accessToken){ setStaffList([]); if(sessionStatus!=="loading") setError("Session expired. Please sign in again."); return; }
// //       refresh?setRefreshing(true):setLoading(true);
// //       setError(null);
// //       const res=await fetch(`${API_BASE_URL}/api/staff`,{headers:{"Content-Type":"application/json",Authorization:`Bearer ${accessToken}`},cache:"no-store"});
// //       if(res.status===401) throw new Error("Session expired. Please sign in again.");
// //       if(!res.ok) throw new Error(`Failed (${res.status})`);
// //       const data=await res.json();
// //       setStaffList(Array.isArray(data)?data.map(mapApiStaffToUi):[]);
// //     }catch(e){
// //       setError(e instanceof Error?e.message:"Error");
// //       setStaffList([]);
// //     }finally{ setLoading(false); setRefreshing(false); }
// //   },[session,sessionStatus]);

// //   React.useEffect(()=>{
// //     if(sessionStatus==="authenticated") fetchStaff();
// //     else if(sessionStatus==="unauthenticated"){ setStaffList([]); setLoading(false); setError("Please sign in again."); }
// //   },[fetchStaff,sessionStatus]);

// //   React.useEffect(()=>{
// //     try{
// //       const saved=localStorage.getItem(STORAGE_KEY);
// //       if(!saved) return;
// //       const p=JSON.parse(saved);
// //       if(p.viewMode)  setViewMode(p.viewMode);
// //       if(p.sortMode)  setSortMode(p.sortMode);
// //       if(typeof p.panelOpen==="boolean") setPanelOpen(p.panelOpen);
// //       if(p.pageSize)  setPageSize(p.pageSize);
// //       if(typeof p.lanternLit==="boolean") setLanternLit(p.lanternLit);
// //     }catch{}
// //   },[]);

// //   React.useEffect(()=>{
// //     localStorage.setItem(STORAGE_KEY,JSON.stringify({viewMode,sortMode,panelOpen,pageSize,lanternLit}));
// //   },[viewMode,sortMode,panelOpen,pageSize,lanternLit]);

// //   function addTaskToStaff(staffId:string,task:Omit<StaffTask,"id">){
// //     setStaffList(prev=>prev.map(s=>s.id===staffId?{...s,tasks:[{id:`TSK-${Date.now()}`,...task},...(s.tasks||[])]}:s));
// //     showNotif("Task assigned successfully! 📋");
// //   }

// //   function updateTaskStatusForStaff(staffId:string,taskId:string,status:TaskStatus){
// //     setStaffList(prev=>prev.map(s=>s.id===staffId?{...s,tasks:(s.tasks||[]).map(t=>t.id===taskId?{...t,status}:t)}:s));
// //     showNotif(`Task updated to ${status}! ✨`);
// //   }

// //   const filtered=React.useMemo(()=>{
// //     const query=q.trim().toLowerCase();
// //     const base=staffList.filter(s=>{
// //       const mQ=!query||s.name.toLowerCase().includes(query)||s.id.toLowerCase().includes(query)||String(s.staffId||"").toLowerCase().includes(query)||s.email.toLowerCase().includes(query)||s.phone.toLowerCase().includes(query)||s.branch.toLowerCase().includes(query)||String(s.nrc||"").toLowerCase().includes(query);
// //       const mR=roleFilter==="All"||s.role===roleFilter.toLowerCase();
// //       const mS=statusFilter==="All"||s.status===statusFilter.toLowerCase().replace(" ","_");
// //       return mQ&&mR&&mS;
// //     });
// //     return sortStaff(base,sortMode);
// //   },[staffList,q,roleFilter,statusFilter,sortMode]);

// //   const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize));

// //   React.useEffect(()=>{ setCurrentPage(1); },[q,roleFilter,statusFilter,sortMode,pageSize]);
// //   React.useEffect(()=>{ if(currentPage>totalPages) setCurrentPage(totalPages); },[currentPage,totalPages]);

// //   const paginatedStaff=React.useMemo(()=>{
// //     const start=(currentPage-1)*pageSize;
// //     return filtered.slice(start,start+pageSize);
// //   },[filtered,currentPage,pageSize]);

// //   const selectedMember=selectedId?staffList.find(s=>s.id===selectedId)??null:null;

// //   React.useEffect(()=>{
// //     if(!selectedId&&paginatedStaff.length>0){ setSelectedId(paginatedStaff[0].id); return; }
// //     const existsInAll=selectedId?filtered.some(i=>i.id===selectedId):false;
// //     if(selectedId&&!existsInAll) setSelectedId(filtered[0]?.id??null);
// //   },[filtered,paginatedStaff,selectedId]);

// //   const stats=React.useMemo(()=>({
// //     total:staffList.length,active:staffList.filter(s=>s.status==="active").length,
// //     onLeave:staffList.filter(s=>s.status==="on_leave").length,
// //     avgRating:staffList.length?staffList.reduce((a,s)=>a+s.rating,0)/staffList.length:0,
// //     totalSales:staffList.reduce((a,s)=>a+s.sales,0),
// //     totalTasks:staffList.reduce((a,s)=>a+(s.tasks?.length||0),0),
// //   }),[staffList]);

// //   const startIndex=filtered.length===0?0:(currentPage-1)*pageSize+1;
// //   const endIndex=Math.min(currentPage*pageSize,filtered.length);

// //   /* ── night-aware helpers ── */
// //   const nightText = lanternLit ? "#f5e0b0" : "#1f2937";
// //   const nightSub  = lanternLit ? "#a07848"  : "#6b7280";
// //   const headerBg  = lanternLit
// //     ? "linear-gradient(135deg,#8b4500,#c87020,#ffb830)"
// //     : "linear-gradient(135deg,#FF6B6B,#FF8E53,#FFD93D)";
// //   const filterBarBg= lanternLit ? "rgba(16,8,1,0.72)" : "white";
// //   const filterBarBorder= lanternLit ? "rgba(200,130,40,0.22)" : "#EBEBEB";

// //   return(
// //     <div className="relative min-h-screen overflow-x-hidden">
// //       <FontImport/>

// //       {/* ── ATMOSPHERIC LANTERN BACKGROUND ── */}
// //       <LanternBackground lit={lanternLit}/>

// //       {/* Day-only floating bubbles */}
// //       {!lanternLit && BUBBLES.map((b,i)=>(
// //         <motion.div key={i} className="absolute rounded-full pointer-events-none" style={{zIndex:1,width:b.size,height:b.size,top:b.top,left:b.left,background:b.color,border:"3px solid rgba(0,0,0,0.04)"}}
// //           animate={{y:[0,-16,0],scale:[1,1.06,1]}} transition={{duration:5+i,delay:b.delay,repeat:Infinity,ease:"easeInOut"}}/>
// //       ))}

// //       {/* Notification */}
// //       <AnimatePresence>
// //         {notification&&(
// //           <motion.div initial={{opacity:0,y:-20,scale:0.9}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-20,scale:0.9}}
// //             className="fixed top-5 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-2.5 rounded-full px-5 py-2.5 text-[13px] font-black shadow-2xl"
// //             style={{background:"white",border:"3px solid #6BCB77",color:"#333",boxShadow:"0 8px 24px rgba(107,203,119,0.3)"}}>
// //             <CheckCircle2 className="h-4 w-4 text-emerald-500"/> {notification}
// //           </motion.div>
// //         )}
// //       </AnimatePresence>

// //       {/* ─────────────── PAGE CONTENT ─────────────── */}
// //       <div className="relative z-10 mx-auto max-w-[1440px] space-y-5 px-4 py-6 md:px-6">

// //         {/* HEADER BANNER */}
// //         <motion.div initial={{opacity:0,y:-24}} animate={{opacity:1,y:0}} transition={{duration:0.5,type:"spring",bounce:0.35}}
// //           className="relative overflow-hidden rounded-[28px] p-5"
// //           style={{background:headerBg,border:"4px solid rgba(255,255,255,0.7)",boxShadow:lanternLit?"0 16px 50px rgba(200,120,20,0.45)":"0 16px 40px rgba(255,107,107,0.25)"}}>
// //           <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle,white 2px,transparent 2px)",backgroundSize:"22px 22px"}}/>

// //           <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
// //             <div className="flex items-center gap-4">
// //               {/* ── LANTERN TOGGLE in header ── */}
// //               <div className="hidden md:flex items-center justify-center" style={{minWidth:60}}>
// //                 <LanternToggle lit={lanternLit} onToggle={()=>setLanternLit(v=>!v)}/>
// //               </div>
// //               <div>
// //                 <div className="inline-flex items-center gap-2 mb-2 rounded-full px-3 py-1 text-[11px] font-black text-white" style={{background:"rgba(255,255,255,0.25)",border:"2px solid rgba(255,255,255,0.4)"}}>
// //                   <Sparkles className="h-3 w-3"/> BINHLAIG · Staff Control
// //                 </div>
// //                 <h1 className="text-3xl md:text-4xl font-black text-white fredoka drop-shadow">Staff Management!</h1>
// //                 <p className="mt-1 text-sm text-white/90 font-semibold">{stats.active} active 🟢 · {stats.onLeave} on leave 🟡 · {filtered.length} showing</p>
// //               </div>
// //             </div>

// //             <div className="flex flex-wrap items-center gap-2">
// //               {/* Mobile lantern toggle */}
// //               <div className="flex md:hidden">
// //                 <LanternToggle lit={lanternLit} onToggle={()=>setLanternLit(v=>!v)}/>
// //               </div>

// //               <div className="relative">
// //                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"/>
// //                 <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search staff..."
// //                   className="h-10 w-[220px] rounded-full pl-9 pr-9 text-[13px] font-semibold bg-white outline-none"
// //                   style={{border:"2.5px solid rgba(255,255,255,0.5)",boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}/>
// //                 {q&&<button onClick={()=>setQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"><X className="h-3.5 w-3.5"/></button>}
// //               </div>

// //               {[{label:"Reset",icon:RotateCcw,onClick:()=>{setRoleFilter("All");setStatusFilter("All");setQ("");setSortMode("name_asc");setCurrentPage(1);fetchStaff(true);showNotif("Staff list refreshed! 🎉");}},
// //                 {label:refreshing?"...":"Refresh",icon:refreshing?Loader2:RefreshCw,onClick:()=>fetchStaff(true)},
// //                 {label:viewMode==="grid"?"Grid":"List",icon:viewMode==="grid"?LayoutGrid:List,onClick:()=>setViewMode(v=>v==="grid"?"compact":"grid")},
// //                 {label:"Panel",icon:panelOpen?PanelRightClose:PanelRightOpen,onClick:()=>setPanelOpen(v=>!v)},
// //               ].map(btn=>(
// //                 <motion.button key={btn.label} whileHover={{scale:1.06}} whileTap={{scale:0.94}} onClick={btn.onClick}
// //                   className="h-10 px-4 rounded-full text-[13px] font-black bg-white text-gray-700 flex items-center gap-1.5"
// //                   style={{border:"2.5px solid rgba(255,255,255,0.6)",boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}>
// //                   <btn.icon className={cn("h-3.5 w-3.5",btn.label==="..."?"animate-spin":"")}/>
// //                   {btn.label}
// //                 </motion.button>
// //               ))}

// //               <motion.a whileHover={{scale:1.08}} whileTap={{scale:0.94}} href="/admin/staff/add_staff"
// //                 className="h-10 px-5 rounded-full text-[13px] font-black text-white flex items-center gap-1.5"
// //                 style={{background:"rgba(0,0,0,0.25)",border:"2.5px solid rgba(255,255,255,0.5)",boxShadow:"0 4px 12px rgba(0,0,0,0.15)"}}>
// //                 <Plus className="h-4 w-4"/> Add Staff
// //               </motion.a>
// //             </div>
// //           </div>
// //         </motion.div>

// //         {/* status messages */}
// //         {sessionStatus==="loading"&&(
// //           <div className="rounded-[20px] p-4 text-sm flex items-center gap-2 font-semibold" style={{background:filterBarBg,border:`2.5px solid ${filterBarBorder}`,color:nightSub,backdropFilter:lanternLit?"blur(12px)":"none"}}>
// //             <Loader2 className="h-4 w-4 animate-spin text-orange-400"/> Checking session... 🔐
// //           </div>
// //         )}
// //         {loading&&(
// //           <div className="rounded-[20px] p-4 text-sm flex items-center gap-2 font-semibold" style={{background:filterBarBg,border:`2.5px solid ${filterBarBorder}`,color:nightSub,backdropFilter:lanternLit?"blur(12px)":"none"}}>
// //             <Loader2 className="h-4 w-4 animate-spin text-orange-400"/> Loading staff... 🔄
// //           </div>
// //         )}
// //         {error&&(
// //           <div className="rounded-[20px] p-4 text-sm font-semibold" style={{background:"#FFF0F0",border:"2.5px solid #FF6B6B",color:"#D63031"}}>
// //             😱 {error}
// //           </div>
// //         )}

// //         {/* KPI CARDS */}
// //         <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
// //           <KpiCard label="Total Staff"  value={stats.total}                      sub="Team members"       icon={Users}        color="#FF6B6B" emoji="👥" lit={lanternLit}/>
// //           <KpiCard label="Active Now"   value={stats.active}                     sub="Currently working"  icon={UserCheck}    color="#6BCB77" emoji="✅" lit={lanternLit}/>
// //           <KpiCard label="On Leave"     value={stats.onLeave}                    sub="Temporary absence"  icon={Clock}        color="#FFD93D" emoji="⏰" lit={lanternLit}/>
// //           <KpiCard label="Avg Rating"   value={Number(stats.avgRating.toFixed(1))} sub="Team score"       icon={Star}         color="#C77DFF" emoji="⭐" lit={lanternLit}/>
// //           <KpiCard label="Total Sales"  value={Math.round(stats.totalSales/1000)} sub="In ¥ thousands"   icon={Activity}     color="#4ECDC4" emoji="💰" lit={lanternLit}/>
// //           <KpiCard label="All Tasks"    value={stats.totalTasks}                 sub="Assigned to staff"  icon={FileText}     color="#FF8E53" emoji="📋" lit={lanternLit}/>
// //         </div>

// //         {/* FILTER BAR */}
// //         <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
// //           className="rounded-[22px] p-4"
// //           style={{background:filterBarBg,border:`3px solid ${filterBarBorder}`,boxShadow:lanternLit?"0 4px 20px rgba(0,0,0,0.50)":"0 4px 16px rgba(0,0,0,0.05)",backdropFilter:lanternLit?"blur(14px)":"none"}}>
// //           <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
// //             <div className="flex flex-wrap items-center gap-2">
// //               <span className="text-[10px] font-black uppercase tracking-widest mr-1" style={{color:nightSub}}>Role</span>
// //               {ROLES.map(r=>(
// //                 <PillBtn key={r} active={roleFilter===r} onClick={()=>setRoleFilter(r)} color={r==="All"?"#333":roleCfg[r.toLowerCase() as Role]?.color||"#333"} lit={lanternLit}>
// //                   {r!=="All"&&roleCfg[r.toLowerCase() as Role]?.emoji+" "}{r}
// //                 </PillBtn>
// //               ))}
// //             </div>
// //             <div className="w-px h-6 bg-gray-200 hidden xl:block"/>
// //             <div className="flex flex-wrap items-center gap-2">
// //               <span className="text-[10px] font-black uppercase tracking-widest mr-1" style={{color:nightSub}}>Status</span>
// //               {STATUSES.map(s=>(
// //                 <PillBtn key={s} active={statusFilter===s} onClick={()=>setStatusFilter(s)} color={s==="All"?"#333":statusCfg[s.toLowerCase().replace(" ","_") as Status]?.color||"#333"} lit={lanternLit}>
// //                   {s!=="All"&&statusCfg[s.toLowerCase().replace(" ","_") as Status]?.emoji+" "}{s}
// //                 </PillBtn>
// //               ))}
// //             </div>
// //             <div className="w-px h-6 bg-gray-200 hidden xl:block"/>
// //             <div className="flex flex-wrap items-center gap-2">
// //               <span className="text-[10px] font-black uppercase tracking-widest mr-1" style={{color:nightSub}}>Sort</span>
// //               {[{label:"A→Z",value:"name_asc",icon:ArrowDownAZ},{label:"Z→A",value:"name_desc",icon:ArrowUpZA}].map(opt=>(
// //                 <PillBtn key={opt.value} active={sortMode===opt.value} onClick={()=>setSortMode(opt.value as SortMode)} color="#667eea" lit={lanternLit}>
// //                   <opt.icon className="h-3 w-3 inline mr-1"/>{opt.label}
// //                 </PillBtn>
// //               ))}
// //             </div>
// //           </div>
// //         </motion.div>

// //         {/* MAIN GRID */}
// //         <div className={cn("grid gap-4 xl:gap-5",panelOpen?"xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_340px]":"grid-cols-1")}>
// //           <div>
// //             {filtered.length===0&&!loading?(
// //               <div className="rounded-[22px] p-12 text-center" style={{background:filterBarBg,border:`3px dashed ${filterBarBorder}`,backdropFilter:lanternLit?"blur(12px)":"none"}}>
// //                 <div className="text-5xl mb-3">🔍</div>
// //                 <div className="text-[16px] font-black fredoka" style={{color:nightText}}>No staff found!</div>
// //                 <div className="text-[12px] mt-1 font-semibold" style={{color:nightSub}}>Create staff from the create page and it will show here.</div>
// //               </div>
// //             ):viewMode==="grid"?(
// //               <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
// //                 {paginatedStaff.map((member,i)=>(
// //                   <motion.div key={member.id} initial={{opacity:0,scale:0.9,y:16}} animate={{opacity:1,scale:1,y:0}}
// //                     transition={{duration:0.35,delay:i*0.05,type:"spring",bounce:0.3}}>
// //                     <StaffFlipCard member={member} index={i} selected={selectedId===member.id} onSelect={m=>setSelectedId(m.id)} lit={lanternLit}/>
// //                   </motion.div>
// //                 ))}
// //               </div>
// //             ):(
// //               <div className="space-y-3">
// //                 {paginatedStaff.map((member,i)=>(
// //                   <motion.div key={member.id} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{duration:0.3,delay:i*0.04}}>
// //                     <CompactCard member={member} index={i} selected={selectedId===member.id} onSelect={m=>setSelectedId(m.id)} lit={lanternLit}/>
// //                   </motion.div>
// //                 ))}
// //               </div>
// //             )}

// //             {filtered.length>0&&(
// //               <PaginationBar currentPage={currentPage} totalPages={totalPages} pageSize={pageSize}
// //                 totalItems={filtered.length} startIndex={startIndex} endIndex={endIndex}
// //                 onPageChange={setCurrentPage} onPageSizeChange={size=>{setPageSize(size);setCurrentPage(1);}}
// //                 lit={lanternLit}/>
// //             )}
// //           </div>

// //           {panelOpen&&(
// //             <motion.div initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} transition={{duration:0.4,type:"spring",bounce:0.3}}>
// //               <DetailPanel member={selectedMember} onClose={()=>setPanelOpen(false)}
// //                 onAddTask={addTaskToStaff} onUpdateTaskStatus={updateTaskStatusForStaff}
// //                 lit={lanternLit}/>
// //             </motion.div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }



























"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Sparkles,
  Users,
  UserCheck,
  Clock,
  Star,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Shield,
  Store,
  Calendar,
  Mail,
  MapPin,
  Activity,
  Key,
  Crown,
  Phone,
  ChevronRight,
  PanelRightOpen,
  PanelRightClose,
  ArrowDownAZ,
  ArrowUpZA,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight as PageChevronRight,
  Cake,
  IdCard,
  Wallet,
  FileText,
  Briefcase,
  X,
  TrendingUp,
  TrendingDown,
  ClipboardList,
  LayoutGrid,
  List,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080";

const STORAGE_KEY = "staff-lantern-mode-v3";
const PAGE_SIZE_OPTIONS = [6, 9, 12, 15, 24] as const;

type Role = "admin" | "manager" | "cashier" | "stock";
type Status = "active" | "on_leave" | "inactive";
type ViewMode = "grid" | "compact";
type SortMode =
  | "name_asc"
  | "name_desc"
  | "rating_desc"
  | "sales_desc"
  | "joined_desc";

type TaskStatus = "Pending" | "In Progress" | "Done";
type TaskPriority = "High" | "Medium" | "Low";

type StaffTask = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: TaskStatus;
  priority: TaskPriority;
};

type StaffMember = {
  id: string;
  rawId: number | string;
  dbId: number | string;
  name: string;
  role: Role;
  branch: string;
  phone: string;
  email: string;
  status: Status;
  joined: string;
  sales: number;
  orders: number;
  rating: number;
  shifts: number;
  trend: number;
  img: string;
  address?: string;
  nrc?: string;
  salary?: number;
  emergencyContact?: string;
  emergencyPhone?: string;
  note?: string;
  staffId?: number | string;
  dateOfBirth?: string;
  tasks?: StaffTask[];
};

const roleCfg: Record<
  Role,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    emoji: string;
  }
> = {
  admin: { label: "Admin", icon: Crown, color: "#d97706", emoji: "👑" },
  manager: { label: "Manager", icon: Shield, color: "#c8892a", emoji: "🛡️" },
  cashier: { label: "Cashier", icon: Key, color: "#eab308", emoji: "🔑" },
  stock: { label: "Stock", icon: Store, color: "#b45309", emoji: "📦" },
};

const statusCfg: Record<
  Status,
  {
    label: string;
    color: string;
    emoji: string;
  }
> = {
  active: { label: "Active", color: "#10b981", emoji: "🟢" },
  on_leave: { label: "On Leave", color: "#f59e0b", emoji: "🟡" },
  inactive: { label: "Inactive", color: "#94a3b8", emoji: "⚪" },
};

const ROLES = ["All", "Admin", "Manager", "Cashier", "Stock"];
const STATUSES = ["All", "Active", "On Leave", "Inactive"];

function getStaffPageToken(session: any) {
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

function money(n: number) {
  return n > 0 ? `¥${Number(n).toLocaleString()}` : "—";
}

function shortMoney(n: number) {
  return n > 0 ? `¥${(Number(n) / 1000).toFixed(0)}k` : "—";
}

function normalizeRole(r: unknown): Role {
  const v = String(r || "cashier").toLowerCase();
  return (["admin", "manager", "cashier", "stock"] as Role[]).includes(
    v as Role,
  )
    ? (v as Role)
    : "cashier";
}

function normalizeStatus(s: unknown): Status {
  const v = String(s || "active").toLowerCase().replace(/\s+/g, "_");

  return (["active", "on_leave", "inactive"] as Status[]).includes(v as Status)
    ? (v as Status)
    : "active";
}

function formatDate(value?: string) {
  if (!value) return "—";
  return value;
}

function makeMockTasks(name: string): StaffTask[] {
  const prefix = name.slice(0, 2).toUpperCase() || "ST";

  return [
    {
      id: `TSK-${prefix}-01`,
      title: "Check opening balance",
      description: "Verify cashier opening amount before shift starts.",
      dueDate: "09:00 AM",
      status: "Done",
      priority: "High",
    },
    {
      id: `TSK-${prefix}-02`,
      title: "Restock front shelf",
      description: "Refill fast-moving drinks and snack items.",
      dueDate: "11:30 AM",
      status: "In Progress",
      priority: "Medium",
    },
    {
      id: `TSK-${prefix}-03`,
      title: "Submit daily sales note",
      description: "Prepare closing summary for manager review.",
      dueDate: "05:00 PM",
      status: "Pending",
      priority: "High",
    },
  ];
}

function getTaskStats(tasks: StaffTask[] = []) {
  return {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    progress: tasks.filter((t) => t.status === "In Progress").length,
    done: tasks.filter((t) => t.status === "Done").length,
  };
}

function mapApiStaffToUi(staff: any): StaffMember {
  const name = staff.fullName || staff.full_name || staff.name || "Unknown";

  const imageUrl = staff.imageUrl || staff.image_url || staff.imagePath || staff.image_path;

  const img =
    imageUrl && String(imageUrl).startsWith("http")
      ? String(imageUrl)
      : imageUrl
        ? `${API_BASE_URL}${imageUrl}`
        : `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(
            name,
          )}&backgroundColor=b6e3f4`;

  const staffId = staff.staffId ?? staff.staff_id ?? "";
  const dbId = staff.id ?? staff.staffId ?? staff.staff_id ?? name;

  return {
    id: `ST-${String(staffId || dbId).padStart(3, "0")}`,
    rawId: dbId,
    dbId,
    name,
    role: normalizeRole(staff.role),
    branch: staff.branch || "Main Branch",
    phone: staff.phone || "—",
    email: staff.email || "—",
    status: normalizeStatus(staff.status),
    joined: staff.startDate || staff.start_date || staff.createdAt || staff.created_at || "—",
    sales: Number(staff.sales || 0),
    orders: Number(staff.orders || 0),
    rating: Number(staff.rating || 4.0),
    shifts: Number(staff.shifts || 0),
    trend: Number(staff.trend || 0),
    img,
    address: staff.address || "",
    nrc: staff.nrc || "",
    salary: staff.salary != null ? Number(staff.salary) : 0,
    emergencyContact: staff.emergencyContact || staff.emergency_contact || "",
    emergencyPhone: staff.emergencyPhone || staff.emergency_phone || "",
    note: staff.note || "",
    staffId,
    dateOfBirth: staff.dateOfBirth || staff.date_of_birth || "",
    tasks:
      Array.isArray(staff.tasks) && staff.tasks.length > 0
        ? staff.tasks
        : makeMockTasks(name),
  };
}

function sortStaff(items: StaffMember[], mode: SortMode) {
  const copy = [...items];

  switch (mode) {
    case "name_asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "name_desc":
      return copy.sort((a, b) => b.name.localeCompare(a.name));
    case "rating_desc":
      return copy.sort((a, b) => b.rating - a.rating);
    case "sales_desc":
      return copy.sort((a, b) => b.sales - a.sales);
    case "joined_desc":
      return copy.sort((a, b) => String(b.joined).localeCompare(String(a.joined)));
    default:
      return copy;
  }
}

function buildPageNumbers(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 4) return [1, 2, 3, 4, 5, "...", total] as const;

  if (current >= total - 3) {
    return [
      1,
      "...",
      total - 4,
      total - 3,
      total - 2,
      total - 1,
      total,
    ] as const;
  }

  return [1, "...", current - 1, current, current + 1, "...", total] as const;
}

function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;700;800;900&display=swap');

      * {
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, "SF Pro Display",
          "Inter", "Segoe UI", "Noto Sans Myanmar", "Padauk", sans-serif;
      }

      .serif {
        font-family: 'DM Serif Display', Georgia, serif !important;
      }

      ::placeholder {
        color: rgba(122,85,32,0.75);
        opacity: 1;
      }
    `}</style>
  );
}

function glassCard(night: boolean, extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: night ? "rgba(14,10,6,0.84)" : "rgba(255,255,255,0.90)",
    border: `1px solid ${
      night ? "rgba(200,137,42,0.18)" : "rgba(216,203,184,0.55)"
    }`,
    boxShadow: night
      ? "0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(200,137,42,0.07)"
      : "0 24px 64px rgba(26,21,16,0.10)",
    backdropFilter: "blur(24px)",
    ...extra,
  };
}

function premiumInputStyle(night: boolean): React.CSSProperties {
  return {
    background: night ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.72)",
    border: `1.5px solid ${
      night ? "rgba(46,32,16,1)" : "rgba(216,203,184,1)"
    }`,
    color: night ? "#e8dcc8" : "#1a1510",
    boxShadow: "none",
  };
}

function sectionTitle(night: boolean) {
  return cn(
    "text-[10px] uppercase tracking-[0.24em] font-bold",
    night ? "text-[#7a5520]" : "text-[#8a7a65]",
  );
}

function LanternMark({
  size = 48,
  glow = false,
}: {
  size?: number;
  glow?: boolean;
}) {
  const h = size * 1.5;
  const isNight = glow;

  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 32 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="lanternCoreNight" cx="50%" cy="48%" r="50%">
          <stop offset="0%" stopColor="#fff7d6" stopOpacity="0.95" />
          <stop offset="28%" stopColor="#fbbf24" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </radialGradient>

        <linearGradient
          id="lanternBodyDay"
          x1="6"
          y1="11"
          x2="26"
          y2="37"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#fffaf1" />
          <stop offset="45%" stopColor="#f5e7cf" />
          <stop offset="100%" stopColor="#ecd5ae" />
        </linearGradient>

        <linearGradient
          id="lanternMetalDay"
          x1="8"
          y1="6"
          x2="24"
          y2="42"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#c58a3c" />
          <stop offset="50%" stopColor="#a96b28" />
          <stop offset="100%" stopColor="#8a551d" />
        </linearGradient>
      </defs>

      <line
        x1="16"
        y1="0"
        x2="16"
        y2="6"
        stroke={isNight ? "#d6ae67" : "#9d6a2b"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="8"
        y="6"
        width="16"
        height="5"
        rx="2"
        fill={isNight ? "#b07840" : "url(#lanternMetalDay)"}
        stroke={isNight ? "#d4a060" : "#7b4a18"}
        strokeWidth="0.8"
      />
      <rect
        x="6"
        y="11"
        width="20"
        height="26"
        rx="3"
        fill={isNight ? "#0e0908" : "url(#lanternBodyDay)"}
        stroke={isNight ? "#9d6220" : "#a66b27"}
        strokeWidth="1"
      />

      {isNight && (
        <rect
          x="6"
          y="11"
          width="20"
          height="26"
          rx="3"
          fill="url(#lanternCoreNight)"
        />
      )}

      {[11, 16, 21].map((x) => (
        <line
          key={x}
          x1={x}
          y1="11"
          x2={x}
          y2="37"
          stroke={isNight ? "#6b3e10" : "#b47b34"}
          strokeWidth="1"
          opacity="0.95"
        />
      ))}

      {isNight && (
        <g>
          <motion.ellipse
            cx="16"
            cy="26"
            rx="4"
            ry="6"
            fill="#f59e0b"
            opacity="0.68"
            animate={{
              ry: [6, 7.1, 5.2, 6.7, 6],
              cx: [16, 15.5, 16.4, 15.8, 16],
            }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.ellipse
            cx="16"
            cy="27"
            rx="2.5"
            ry="4.2"
            fill="#fde68a"
            animate={{ ry: [4.2, 5, 3.6, 4.6, 4.2] }}
            transition={{ duration: 0.95, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>
      )}

      <rect
        x="8"
        y="37"
        width="16"
        height="5"
        rx="2"
        fill={isNight ? "#b07840" : "url(#lanternMetalDay)"}
        stroke={isNight ? "#d4a060" : "#7b4a18"}
        strokeWidth="0.8"
      />
      <line
        x1="16"
        y1="42"
        x2="16"
        y2="47"
        stroke={isNight ? "#d4804a" : "#8f5b24"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="16" cy="47" r="1.5" fill={isNight ? "#d4804a" : "#8f5b24"} />
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
      <AnimatePresence>
        {dark ? (
          <motion.div
            key="night-glow-big"
            initial={{ opacity: 0, scale: 0.35 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.35 }}
            transition={{ duration: 0.45 }}
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
            }}
          />
        ) : (
          <motion.div
            key="day-halo"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none absolute"
            style={{
              width: 70,
              height: 70,
              top: -4,
              left: "50%",
              transform: "translateX(-50%)",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, rgba(255,233,180,0.55) 0%, rgba(245,190,95,0.18) 55%, transparent 78%)",
              filter: "blur(10px)",
            }}
          />
        )}
      </AnimatePresence>

      <LanternMark size={34} glow={dark} />

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
  const particles = React.useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        id: i,
        x: `${(i * 31 + 7) % 100}%`,
        y: `${(i * 47 + 13) % 100}%`,
        size: 1.5 + (i % 3) * 1,
        dur: 2.5 + (i % 4) * 0.7,
        delay: (i * 0.21) % 4,
        color: ["#e0e7ff", "#fef3c7", "#ddd6fe", "#ffffff", "#fde68a"][i % 5],
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: p.color,
          }}
          animate={{ opacity: [0.08, 0.9, 0.08], scale: [0.7, 1.4, 0.7] }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function DayParticles() {
  const motes = React.useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        x: `${(i * 23 + 8) % 96}%`,
        y: `${(i * 41 + 11) % 90}%`,
        size: 60 + (i % 4) * 30,
        dur: 6 + (i % 3) * 2,
        delay: i * 0.5,
        color: [
          "rgba(200,137,42,0.06)",
          "rgba(245,158,11,0.05)",
          "rgba(251,191,36,0.04)",
          "rgba(210,160,60,0.06)",
        ][i % 4],
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {motes.map((m) => (
        <motion.div
          key={m.id}
          className="absolute rounded-full"
          style={{
            left: m.x,
            top: m.y,
            width: m.size,
            height: m.size,
            background: m.color,
            filter: "blur(24px)",
          }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
          transition={{
            duration: m.dur,
            repeat: Infinity,
            delay: m.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function Avatar({
  src,
  name,
  className,
}: {
  src: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = React.useState(false);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (failed) {
    return (
      <div
        className={cn("flex items-center justify-center font-bold text-white", className)}
        style={{ background: "linear-gradient(135deg,#a07020,#c8892a)" }}
      >
        {initials || "ST"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={className}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-400/40",
          )}
        />
      ))}

      <span className="ml-1 text-[11px] font-bold text-amber-500">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function MiniBadge({
  text,
  night,
  color,
}: {
  text: string;
  night: boolean;
  color: string;
}) {
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[10px] font-bold"
      style={{
        background: night ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
        border: `1px solid ${color}55`,
        color,
      }}
    >
      {text}
    </span>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  night,
}: {
  label: string;
  value: number;
  sub: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  night: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-[22px] p-4"
      style={glassCard(night)}
    >
      <div
        className="absolute left-0 right-0 top-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />

      <div className="mb-3 flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl"
          style={{
            background: `${color}22`,
            border: `1px solid ${color}44`,
          }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>

        <span className={sectionTitle(night)}>{label}</span>
      </div>

      <div
        className={cn(
          "serif text-4xl leading-none",
          night ? "text-[#e8dcc8]" : "text-[#1a1510]",
        )}
      >
        {Number(value || 0).toLocaleString()}
      </div>

      <div
        className="mt-2 text-[11px]"
        style={{ color: night ? "#6d5d4b" : "#8e7f6e" }}
      >
        {sub}
      </div>
    </motion.div>
  );
}

function PremiumPill({
  children,
  active,
  onClick,
  color,
  night,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  color: string;
  night: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      className="rounded-full px-3.5 py-2 text-[11px] font-bold"
      style={{
        background: active
          ? `linear-gradient(135deg, ${color}, #d4a352)`
          : night
            ? "rgba(255,255,255,0.03)"
            : "rgba(255,255,255,0.7)",
        color: active ? "#140d05" : night ? "#bca98f" : "#7d6f60",
        border: `1px solid ${
          active
            ? "rgba(212,163,82,0.65)"
            : night
              ? "rgba(255,255,255,0.05)"
              : "rgba(216,203,184,0.7)"
        }`,
        boxShadow: active ? "0 10px 24px rgba(200,137,42,0.18)" : "none",
      }}
    >
      {children}
    </motion.button>
  );
}

function StaffCard({
  member,
  selected,
  onSelect,
  night,
}: {
  member: StaffMember;
  selected?: boolean;
  onSelect?: (m: StaffMember) => void;
  night: boolean;
}) {
  const role = roleCfg[member.role];
  const status = statusCfg[member.status];
  const taskStats = getTaskStats(member.tasks || []);

  return (
    <motion.button
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect?.(member)}
      className="w-full overflow-hidden rounded-[24px] text-left"
      style={{
        ...glassCard(night),
        border: `1px solid ${
          selected
            ? "rgba(212,163,82,0.55)"
            : night
              ? "rgba(200,137,42,0.18)"
              : "rgba(216,203,184,0.55)"
        }`,
      }}
    >
      <div className="relative p-5">
        <div
          className="absolute left-0 right-0 top-0 h-[2px]"
          style={{
            background: "linear-gradient(90deg, transparent, #c8892a, transparent)",
          }}
        />

        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="h-14 w-14 overflow-hidden rounded-full p-[2px]"
                style={{
                  background: "linear-gradient(135deg,#7a5210,#d4a352,#7a5210)",
                }}
              >
                <Avatar
                  src={member.img}
                  name={member.name}
                  className="h-full w-full rounded-full object-cover"
                />
              </div>

              <span
                className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2"
                style={{
                  background: status.color,
                  borderColor: night ? "#100802" : "white",
                }}
              />
            </div>

            <div>
              <div
                className={cn(
                  "serif text-[28px] leading-none",
                  night ? "text-[#e8dcc8]" : "text-[#1a1510]",
                )}
              >
                {member.name}
              </div>

              <div
                className="mt-1 text-[11px]"
                style={{ color: night ? "#7a5520" : "#8a7a65" }}
              >
                {member.id} · {member.branch}
              </div>
            </div>
          </div>

          <MiniBadge text={status.label} night={night} color={status.color} />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <MiniBadge text={`${role.emoji} ${role.label}`} night={night} color={role.color} />
          <MiniBadge text={`Staff ID ${member.staffId || "—"}`} night={night} color="#c8892a" />
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          {[
            { l: "Sales", v: shortMoney(member.sales) },
            { l: "Orders", v: member.orders > 0 ? String(member.orders) : "—" },
            { l: "Shifts", v: String(member.shifts) },
          ].map((item) => (
            <div
              key={item.l}
              className="rounded-[16px] p-3 text-center"
              style={{
                background: night ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.65)",
                border: `1px solid ${
                  night ? "rgba(255,255,255,0.05)" : "rgba(216,203,184,0.7)"
                }`,
              }}
            >
              <div
                className="text-[9px] uppercase tracking-[0.18em]"
                style={{ color: night ? "#6d5d4b" : "#8e7f6e" }}
              >
                {item.l}
              </div>

              <div
                className={cn(
                  "mt-1 text-[14px] font-bold",
                  night ? "text-[#e8dcc8]" : "text-[#1a1510]",
                )}
              >
                {item.v}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between">
          <RatingStars rating={member.rating} />

          <span
            className={cn(
              "flex items-center gap-1 text-[11px] font-bold",
              member.trend > 0
                ? "text-emerald-500"
                : member.trend < 0
                  ? "text-rose-400"
                  : "text-gray-400",
            )}
          >
            {member.trend > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : member.trend < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : null}

            {member.trend !== 0 ? `${member.trend > 0 ? "+" : ""}${member.trend}%` : "Stable"}
          </span>
        </div>

        <div
          className="rounded-[18px] p-3"
          style={{
            background: night ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.60)",
            border: `1px solid ${
              night ? "rgba(255,255,255,0.04)" : "rgba(216,203,184,0.7)"
            }`,
          }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className={sectionTitle(night)}>Tasks</span>
            <span
              className="text-[11px]"
              style={{ color: night ? "#8a7a65" : "#8e7f6e" }}
            >
              {taskStats.total} total
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MiniBadge text={`⏳ ${taskStats.pending}`} night={night} color="#f59e0b" />
            <MiniBadge text={`⚡ ${taskStats.progress}`} night={night} color="#60a5fa" />
            <MiniBadge text={`✅ ${taskStats.done}`} night={night} color="#10b981" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div
            className="text-[11px]"
            style={{ color: night ? "#8a7a65" : "#8e7f6e" }}
          >
            {member.salary ? `¥${Number(member.salary).toLocaleString()}` : "No salary"}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  background: night ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.78)",
                  border: `1px solid ${
                    night ? "rgba(255,255,255,0.05)" : "rgba(216,203,184,0.7)"
                  }`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal
                  className="h-4 w-4"
                  style={{ color: night ? "#bca98f" : "#7d6f60" }}
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="min-w-[170px] rounded-2xl border bg-white p-2 shadow-xl"
            >
              {[
                { icon: Eye, label: "View Profile" },
                { icon: Pencil, label: "Edit Staff" },
                { icon: ClipboardList, label: "Assign Task" },
                { icon: Activity, label: "Activity" },
              ].map((item) => (
                <DropdownMenuItem
                  key={item.label}
                  className="cursor-pointer gap-2 rounded-xl py-2.5 text-[13px] font-medium"
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuItem className="cursor-pointer gap-2 rounded-xl py-2.5 text-[13px] font-medium text-rose-500">
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.button>
  );
}

function CompactCard({
  member,
  selected,
  onSelect,
  night,
}: {
  member: StaffMember;
  selected?: boolean;
  onSelect?: (m: StaffMember) => void;
  night: boolean;
}) {
  const role = roleCfg[member.role];
  const status = statusCfg[member.status];

  return (
    <motion.button
      whileHover={{ x: 3, scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      onClick={() => onSelect?.(member)}
      className="w-full rounded-[22px] p-4 text-left"
      style={{
        ...glassCard(night),
        border: `1px solid ${
          selected
            ? "rgba(212,163,82,0.55)"
            : night
              ? "rgba(200,137,42,0.18)"
              : "rgba(216,203,184,0.55)"
        }`,
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="rounded-full p-[2px]"
          style={{
            background: "linear-gradient(135deg,#7a5210,#d4a352,#7a5210)",
          }}
        >
          <Avatar
            src={member.img}
            name={member.name}
            className="h-14 w-14 rounded-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "serif text-[24px] leading-none",
                night ? "text-[#e8dcc8]" : "text-[#1a1510]",
              )}
            >
              {member.name}
            </span>

            <MiniBadge text={role.label} night={night} color={role.color} />
            <MiniBadge text={status.label} night={night} color={status.color} />
          </div>

          <div
            className="mt-1 text-[11px]"
            style={{ color: night ? "#7a5520" : "#8a7a65" }}
          >
            {member.id} · {member.branch} · Staff ID {member.staffId || "—"}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <MiniBadge text={`Sales ${shortMoney(member.sales)}`} night={night} color="#c8892a" />
            <MiniBadge text={`${member.orders} orders`} night={night} color="#60a5fa" />
            <MiniBadge text={`${member.shifts} shifts`} night={night} color="#10b981" />
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <RatingStars rating={member.rating} />

          <ChevronRight
            className="h-4 w-4"
            style={{ color: night ? "#bca98f" : "#7d6f60" }}
          />
        </div>
      </div>
    </motion.button>
  );
}

function DetailPanel({
  member,
  onClose,
  night,
}: {
  member: StaffMember | null;
  onClose: () => void;
  night: boolean;
}) {
  const [tab, setTab] = React.useState<"profile" | "tasks">("profile");

  return (
    <div className="sticky top-5 h-fit overflow-hidden rounded-[26px]" style={glassCard(night)}>
      <div
        className="px-5 py-4"
        style={{
          borderBottom: `1px solid ${
            night ? "rgba(255,255,255,0.05)" : "rgba(216,203,184,0.7)"
          }`,
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className={sectionTitle(night)}>Staff Detail</div>

            <div
              className={cn(
                "serif mt-1 text-[30px] leading-none",
                night ? "text-[#e8dcc8]" : "text-[#1a1510]",
              )}
            >
              {member ? member.name : "Preview"}
            </div>
          </div>

          <button type="button" onClick={onClose} className="rounded-full p-2" style={premiumInputStyle(night)}>
            <X className="h-4 w-4" style={{ color: night ? "#bca98f" : "#7d6f60" }} />
          </button>
        </div>

        {member && (
          <div
            className="flex gap-1 rounded-full p-1"
            style={{
              background: night ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)",
              border: `1px solid ${
                night ? "rgba(255,255,255,0.04)" : "rgba(216,203,184,0.7)"
              }`,
            }}
          >
            {(["profile", "tasks"] as const).map((tb) => (
              <button
                key={tb}
                type="button"
                onClick={() => setTab(tb)}
                className="rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
                style={{
                  background: tab === tb ? "linear-gradient(135deg,#a07020,#d4a352)" : "transparent",
                  color: tab === tb ? "#140d05" : night ? "#bca98f" : "#7d6f60",
                }}
              >
                {tb}
              </button>
            ))}
          </div>
        )}
      </div>

      {!member ? (
        <div className="p-10 text-center">
          <div className="mb-4 flex justify-center">
            <LanternMark size={42} glow={night} />
          </div>

          <div
            className={cn(
              "serif text-[30px]",
              night ? "text-[#e8dcc8]" : "text-[#1a1510]",
            )}
          >
            No staff selected
          </div>

          <div
            className="mt-2 text-[12px]"
            style={{ color: night ? "#7a5520" : "#8a7a65" }}
          >
            Choose any staff card to preview details here.
          </div>
        </div>
      ) : tab === "profile" ? (
        <div className="space-y-4 p-5">
          <div className="flex items-center gap-4">
            <div
              className="rounded-full p-[2px]"
              style={{
                background: "linear-gradient(135deg,#7a5210,#d4a352,#7a5210)",
              }}
            >
              <Avatar
                src={member.img}
                name={member.name}
                className="h-20 w-20 rounded-full object-cover"
              />
            </div>

            <div>
              <div
                className={cn(
                  "serif text-[34px] leading-none",
                  night ? "text-[#e8dcc8]" : "text-[#1a1510]",
                )}
              >
                {member.name}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <MiniBadge
                  text={roleCfg[member.role].label}
                  night={night}
                  color={roleCfg[member.role].color}
                />
                <MiniBadge
                  text={statusCfg[member.status].label}
                  night={night}
                  color={statusCfg[member.status].color}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { l: "Orders", v: member.orders || "—", icon: CheckCircle2, color: "#60a5fa" },
              { l: "Sales", v: money(member.sales), icon: Activity, color: "#c8892a" },
              { l: "Shifts", v: member.shifts, icon: Clock, color: "#10b981" },
              { l: "Rating", v: member.rating.toFixed(1) + " ★", icon: Star, color: "#f59e0b" },
            ].map((item) => (
              <div key={item.l} className="rounded-[18px] p-3" style={premiumInputStyle(night)}>
                <item.icon className="mb-2 h-4 w-4" style={{ color: item.color }} />
                <div
                  className="text-[9px] uppercase tracking-[0.18em]"
                  style={{ color: night ? "#6d5d4b" : "#8e7f6e" }}
                >
                  {item.l}
                </div>

                <div
                  className={cn(
                    "mt-1 text-[16px] font-bold",
                    night ? "text-[#e8dcc8]" : "text-[#1a1510]",
                  )}
                >
                  {item.v}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[18px] p-4" style={premiumInputStyle(night)}>
            <div className={sectionTitle(night)}>Staff Information</div>

            <div className="mt-3 grid grid-cols-1 gap-2 text-[12px] md:grid-cols-2">
              {[
                { icon: IdCard, label: "Staff ID", value: member.staffId || "—" },
                { icon: Cake, label: "Date of Birth", value: formatDate(member.dateOfBirth) },
                { icon: Phone, label: "Phone", value: member.phone || "—" },
                { icon: Mail, label: "Email", value: member.email || "—" },
                { icon: FileText, label: "NRC", value: member.nrc || "—" },
                {
                  icon: Wallet,
                  label: "Salary",
                  value: member.salary ? `¥${Number(member.salary).toLocaleString()}` : "—",
                },
                { icon: Calendar, label: "Start Date", value: formatDate(member.joined) },
                { icon: Briefcase, label: "Branch", value: member.branch || "—" },
              ].map((row, i) => (
                <div
                  key={i}
                  className="rounded-[14px] p-3"
                  style={{
                    background: night ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)",
                    border: `1px solid ${
                      night ? "rgba(255,255,255,0.04)" : "rgba(216,203,184,0.7)"
                    }`,
                  }}
                >
                  <div
                    className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.16em]"
                    style={{ color: night ? "#7a5520" : "#8a7a65" }}
                  >
                    <row.icon className="h-3 w-3" />
                    {row.label}
                  </div>

                  <div
                    className={cn(
                      "break-all font-medium",
                      night ? "text-[#e8dcc8]" : "text-[#1a1510]",
                    )}
                  >
                    {row.value}
                  </div>
                </div>
              ))}

              <div
                className="rounded-[14px] p-3 md:col-span-2"
                style={{
                  background: night ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)",
                  border: `1px solid ${
                    night ? "rgba(255,255,255,0.04)" : "rgba(216,203,184,0.7)"
                  }`,
                }}
              >
                <div
                  className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: night ? "#7a5520" : "#8a7a65" }}
                >
                  <MapPin className="h-3 w-3" />
                  Address
                </div>

                <div
                  className={cn(
                    "font-medium",
                    night ? "text-[#e8dcc8]" : "text-[#1a1510]",
                  )}
                >
                  {member.address || "—"}
                </div>
              </div>

              <div
                className="rounded-[14px] p-3 md:col-span-2"
                style={{
                  background: night ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.6)",
                  border: `1px solid ${
                    night ? "rgba(255,255,255,0.04)" : "rgba(216,203,184,0.7)"
                  }`,
                }}
              >
                <div
                  className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.16em]"
                  style={{ color: night ? "#7a5520" : "#8a7a65" }}
                >
                  <FileText className="h-3 w-3" />
                  Note
                </div>

                <div
                  className={cn(
                    "whitespace-pre-wrap font-medium",
                    night ? "text-[#e8dcc8]" : "text-[#1a1510]",
                  )}
                >
                  {member.note || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-5">
          <div className={sectionTitle(night)}>Assigned Tasks</div>

          {(member.tasks || []).map((task) => {
            const statusColor =
              task.status === "Done"
                ? "#10b981"
                : task.status === "In Progress"
                  ? "#60a5fa"
                  : "#f59e0b";

            const priorityColor =
              task.priority === "High"
                ? "#ef4444"
                : task.priority === "Medium"
                  ? "#f59e0b"
                  : "#94a3b8";

            return (
              <div key={task.id} className="rounded-[18px] p-4" style={premiumInputStyle(night)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: priorityColor }}
                      />

                      <div
                        className={cn(
                          "text-[13px] font-bold",
                          night ? "text-[#e8dcc8]" : "text-[#1a1510]",
                        )}
                      >
                        {task.title}
                      </div>
                    </div>

                    <div
                      className="mt-1 text-[11px]"
                      style={{ color: night ? "#8a7a65" : "#8e7f6e" }}
                    >
                      {task.description || "No description"}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <MiniBadge text={task.id} night={night} color="#c8892a" />
                      <MiniBadge text={task.priority} night={night} color={priorityColor} />
                      <MiniBadge text={`Due ${task.dueDate || "—"}`} night={night} color="#60a5fa" />
                    </div>
                  </div>

                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-bold"
                    style={{
                      background: `${statusColor}22`,
                      color: statusColor,
                      border: `1px solid ${statusColor}55`,
                    }}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PaginationBar({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onPageSizeChange,
  night,
}: {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  night: boolean;
}) {
  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-5 rounded-[24px] p-4"
      style={glassCard(night)}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="rounded-full px-4 py-2 text-[12px] font-bold"
            style={{
              background: night ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)",
              border: `1px solid ${
                night ? "rgba(255,255,255,0.05)" : "rgba(216,203,184,0.7)"
              }`,
              color: night ? "#bca98f" : "#7d6f60",
            }}
          >
            Showing {totalItems === 0 ? 0 : startIndex}-{endIndex} of {totalItems}
          </div>

          <div className="flex items-center gap-2 rounded-full px-3 py-2" style={premiumInputStyle(night)}>
            <span
              className="text-[11px] font-bold"
              style={{ color: night ? "#bca98f" : "#7d6f60" }}
            >
              Cards
            </span>

            {PAGE_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onPageSizeChange(size)}
                className="rounded-full px-3 py-1 text-[11px] font-bold"
                style={{
                  background: pageSize === size ? "linear-gradient(135deg,#a07020,#d4a352)" : "transparent",
                  color: pageSize === size ? "#140d05" : night ? "#bca98f" : "#7d6f60",
                  border: `1px solid ${
                    pageSize === size ? "rgba(212,163,82,0.65)" : "transparent"
                  }`,
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { icon: ChevronsLeft, page: 1, disabled: currentPage === 1 },
            { icon: ChevronLeft, page: currentPage - 1, disabled: currentPage === 1 },
          ].map((btn, i) => (
            <button
              key={i}
              type="button"
              disabled={btn.disabled}
              onClick={() => onPageChange(btn.page)}
              className="h-10 w-10 rounded-[14px] disabled:opacity-40"
              style={premiumInputStyle(night)}
            >
              <btn.icon
                className="mx-auto h-4 w-4"
                style={{ color: night ? "#bca98f" : "#7d6f60" }}
              />
            </button>
          ))}

          <div className="flex items-center gap-2 rounded-[18px] px-2 py-2" style={premiumInputStyle(night)}>
            {pages.map((page, idx) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-sm font-bold"
                  style={{ color: night ? "#7a5520" : "#8a7a65" }}
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className="h-10 min-w-[40px] rounded-[14px] px-3 text-[12px] font-bold"
                  style={{
                    background:
                      currentPage === page
                        ? "linear-gradient(135deg,#a07020,#d4a352)"
                        : "transparent",
                    color: currentPage === page ? "#140d05" : night ? "#bca98f" : "#7d6f60",
                    border: `1px solid ${
                      currentPage === page ? "rgba(212,163,82,0.65)" : "transparent"
                    }`,
                  }}
                >
                  {page}
                </button>
              ),
            )}
          </div>

          {[
            {
              icon: PageChevronRight,
              page: currentPage + 1,
              disabled: currentPage === totalPages || totalPages === 0,
            },
            {
              icon: ChevronsRight,
              page: totalPages,
              disabled: currentPage === totalPages || totalPages === 0,
            },
          ].map((btn, i) => (
            <button
              key={i}
              type="button"
              disabled={btn.disabled}
              onClick={() => onPageChange(btn.page)}
              className="h-10 w-10 rounded-[14px] disabled:opacity-40"
              style={premiumInputStyle(night)}
            >
              <btn.icon
                className="mx-auto h-4 w-4"
                style={{ color: night ? "#bca98f" : "#7d6f60" }}
              />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function StaffPage() {
  const { data: session, status: sessionStatus } = useSession();

  const [staffList, setStaffList] = React.useState<StaffMember[]>([]);
  const [q, setQ] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
  const [sortMode, setSortMode] = React.useState<SortMode>("name_asc");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [panelOpen, setPanelOpen] = React.useState(true);
  const [notification, setNotification] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<number>(9);
  const [night, setNight] = React.useState(true);

  function showNotif(msg: string) {
    setNotification(msg);
    window.setTimeout(() => setNotification(null), 3000);
  }

  const fetchStaff = React.useCallback(
    async (refresh = false) => {
      try {
        const accessToken = getStaffPageToken(session);

        if (!accessToken) {
          setStaffList([]);

          if (sessionStatus !== "loading") {
            setError("Login token မရှိပါ။ အရင်ဆုံး login ပြန်ဝင်ပါ။");
          }

          return;
        }

        refresh ? setRefreshing(true) : setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/api/staff`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        });

        if (res.status === 401) {
          throw new Error("Session expired. Please sign in again.");
        }

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          let message = `Failed (${res.status})`;

          try {
            const json = JSON.parse(text);

            if (json.error === "FEATURE_DISABLED") {
              message =
                "Staff feature is disabled for this shop plan. Super Admin မှာ Staff ကို ON လုပ်ပါ။";
            } else {
              message = json.message || json.error || message;
            }
          } catch {
            if (text) message = text;
          }

          throw new Error(message);
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data.map(mapApiStaffToUi) : [];

        setStaffList(list);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Staff API error");
        setStaffList([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session, sessionStatus],
  );

  React.useEffect(() => {
    if (sessionStatus === "authenticated") {
      void fetchStaff();
    } else if (sessionStatus === "unauthenticated") {
      const fallbackToken = getStaffPageToken(session);

      if (fallbackToken) {
        void fetchStaff();
        return;
      }

      setStaffList([]);
      setLoading(false);
      setError("Please sign in again.");
    }
  }, [fetchStaff, session, sessionStatus]);

  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      if (parsed.viewMode) setViewMode(parsed.viewMode);
      if (parsed.sortMode) setSortMode(parsed.sortMode);
      if (typeof parsed.panelOpen === "boolean") setPanelOpen(parsed.panelOpen);
      if (parsed.pageSize) setPageSize(parsed.pageSize);
      if (typeof parsed.night === "boolean") setNight(parsed.night);
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        viewMode,
        sortMode,
        panelOpen,
        pageSize,
        night,
      }),
    );
  }, [viewMode, sortMode, panelOpen, pageSize, night]);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();

    const base = staffList.filter((s) => {
      const matchQuery =
        !query ||
        s.name.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query) ||
        String(s.staffId || "").toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.phone.toLowerCase().includes(query) ||
        s.branch.toLowerCase().includes(query) ||
        String(s.nrc || "").toLowerCase().includes(query);

      const matchRole = roleFilter === "All" || s.role === roleFilter.toLowerCase();

      const matchStatus =
        statusFilter === "All" ||
        s.status === statusFilter.toLowerCase().replace(" ", "_");

      return matchQuery && matchRole && matchStatus;
    });

    return sortStaff(base, sortMode);
  }, [staffList, q, roleFilter, statusFilter, sortMode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  React.useEffect(() => {
    setCurrentPage(1);
  }, [q, roleFilter, statusFilter, sortMode, pageSize]);

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedStaff = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const selectedMember = selectedId
    ? staffList.find((s) => s.id === selectedId) ?? null
    : null;

  React.useEffect(() => {
    if (!selectedId && paginatedStaff.length > 0) {
      setSelectedId(paginatedStaff[0].id);
    }
  }, [selectedId, paginatedStaff]);

  const activeCount = staffList.filter((s) => s.status === "active").length;
  const onLeaveCount = staffList.filter((s) => s.status === "on_leave").length;
  const inactiveCount = staffList.filter((s) => s.status === "inactive").length;
  const totalTasks = staffList.reduce(
    (sum, s) => sum + getTaskStats(s.tasks || []).total,
    0,
  );

  const startIndex =
    filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const endIndex = Math.min(currentPage * pageSize, filtered.length);

  const pageBg = night
    ? "radial-gradient(circle at 12% 10%, rgba(245,158,11,0.10), transparent 34%), radial-gradient(circle at 88% 12%, rgba(59,130,246,0.08), transparent 30%), #05060d"
    : "radial-gradient(circle at 12% 10%, rgba(245,158,11,0.12), transparent 34%), radial-gradient(circle at 88% 12%, rgba(251,191,36,0.08), transparent 30%), #f6f1e9";

  return (
    <section
      className={cn(
        "relative min-h-screen overflow-hidden px-4 py-6 transition-colors md:px-8",
        night ? "text-[#e8dcc8]" : "text-[#1a1510]",
      )}
      style={{ background: pageBg }}
    >
      <FontImport />

      {night ? <NightParticles /> : <DayParticles />}

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            className="fixed right-5 top-5 z-50 rounded-2xl px-4 py-3 text-sm font-bold"
            style={glassCard(night)}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto max-w-[1700px]">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div
              className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em]"
              style={premiumInputStyle(night)}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Admin Staff
            </div>

            <h1
              className={cn(
                "serif text-[44px] leading-none md:text-[58px]",
                night ? "text-[#e8dcc8]" : "text-[#1a1510]",
              )}
            >
              Staff
              <span
                className="ml-3 text-[22px]"
                style={{ color: night ? "#7a5520" : "#8a7a65" }}
              >
                / Team Control
              </span>
            </h1>

            <p
              className="mt-3 max-w-2xl text-sm leading-6"
              style={{ color: night ? "#8a7a65" : "#7d6f60" }}
            >
              API data ဖြင့် staff list ကိုကြည့်ရန်၊ search/filter/sort/pagination
              ဖြင့်စီမံရန် page ဖြစ်ပါတယ်။
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void fetchStaff(true)}
              disabled={refreshing || loading}
              className="inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-[13px] font-bold disabled:opacity-60"
              style={premiumInputStyle(night)}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </button>

            <button
              type="button"
              onClick={() => setViewMode((v) => (v === "grid" ? "compact" : "grid"))}
              className="inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-[13px] font-bold"
              style={premiumInputStyle(night)}
            >
              {viewMode === "grid" ? (
                <List className="h-4 w-4" />
              ) : (
                <LayoutGrid className="h-4 w-4" />
              )}
              {viewMode === "grid" ? "Compact" : "Grid"}
            </button>

            <LanternToggle dark={night} onToggle={() => setNight((v) => !v)} />

            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-[13px] font-black"
              style={{
                background: "linear-gradient(135deg,#a07020,#d4a352)",
                color: "#140d05",
                boxShadow: "0 12px 28px rgba(200,137,42,0.22)",
              }}
            >
              <Plus className="h-4 w-4" />
              Add Staff
            </button>
          </div>
        </div>

        {error && (
          <div
            className="mb-5 rounded-[22px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-400"
          >
            {error}
          </div>
        )}

        <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
          <KpiCard
            label="Total Staff"
            value={staffList.length}
            sub="All registered staff"
            icon={Users}
            color="#c8892a"
            night={night}
          />

          <KpiCard
            label="Active"
            value={activeCount}
            sub="Currently active"
            icon={UserCheck}
            color="#10b981"
            night={night}
          />

          <KpiCard
            label="On Leave"
            value={onLeaveCount}
            sub="Away from duty"
            icon={Clock}
            color="#f59e0b"
            night={night}
          />

          <KpiCard
            label="Tasks"
            value={totalTasks}
            sub={`${inactiveCount} inactive staff`}
            icon={ClipboardList}
            color="#60a5fa"
            night={night}
          />
        </div>

        <div className="mb-5 rounded-[26px] p-4" style={glassCard(night)}>
          <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto_auto] xl:items-center">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: night ? "#7a5520" : "#8a7a65" }}
              />

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, staff ID, email, phone, branch, NRC..."
                className="h-12 w-full rounded-2xl pl-11 pr-4 text-sm outline-none"
                style={premiumInputStyle(night)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <PremiumPill
                  key={role}
                  active={roleFilter === role}
                  onClick={() => setRoleFilter(role)}
                  color="#a07020"
                  night={night}
                >
                  {role}
                </PremiumPill>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUSES.map((status) => (
                <PremiumPill
                  key={status}
                  active={statusFilter === status}
                  onClick={() => setStatusFilter(status)}
                  color="#c8892a"
                  night={night}
                >
                  {status}
                </PremiumPill>
              ))}
            </div>

            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="h-12 rounded-2xl px-4 text-sm font-bold outline-none"
              style={premiumInputStyle(night)}
            >
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
              <option value="rating_desc">Best Rating</option>
              <option value="sales_desc">Top Sales</option>
              <option value="joined_desc">Newest Joined</option>
            </select>
          </div>
        </div>

        <div
          className={cn(
            "grid gap-5",
            panelOpen ? "xl:grid-cols-[1fr_420px]" : "xl:grid-cols-1",
          )}
        >
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold"
                style={premiumInputStyle(night)}
              >
                {sortMode.includes("asc") ? (
                  <ArrowDownAZ className="h-4 w-4" />
                ) : (
                  <ArrowUpZA className="h-4 w-4" />
                )}
                {filtered.length} staff found
              </div>

              <button
                type="button"
                onClick={() => setPanelOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold"
                style={premiumInputStyle(night)}
              >
                {panelOpen ? (
                  <PanelRightClose className="h-4 w-4" />
                ) : (
                  <PanelRightOpen className="h-4 w-4" />
                )}
                {panelOpen ? "Hide Detail" : "Show Detail"}
              </button>
            </div>

            {loading ? (
              <div className="rounded-[26px] p-14 text-center" style={glassCard(night)}>
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-amber-500" />
                <div
                  className="mt-4 text-sm font-bold"
                  style={{ color: night ? "#bca98f" : "#7d6f60" }}
                >
                  Loading staff from API...
                </div>
              </div>
            ) : paginatedStaff.length === 0 ? (
              <div className="rounded-[26px] p-14 text-center" style={glassCard(night)}>
                <Users className="mx-auto h-10 w-10 text-amber-500/60" />
                <div
                  className={cn(
                    "serif mt-4 text-[32px]",
                    night ? "text-[#e8dcc8]" : "text-[#1a1510]",
                  )}
                >
                  No staff found
                </div>

                <div
                  className="mt-2 text-sm"
                  style={{ color: night ? "#7a5520" : "#8a7a65" }}
                >
                  Try changing search, role, or status filter.
                </div>
              </div>
            ) : viewMode === "grid" ? (
              <div
                className={cn(
                  "grid gap-4",
                  panelOpen
                    ? "md:grid-cols-2 2xl:grid-cols-3"
                    : "md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4",
                )}
              >
                {paginatedStaff.map((member) => (
                  <StaffCard
                    key={member.id}
                    member={member}
                    selected={selectedId === member.id}
                    onSelect={(m) => {
                      setSelectedId(m.id);
                      showNotif(`${m.name} selected.`);
                    }}
                    night={night}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedStaff.map((member) => (
                  <CompactCard
                    key={member.id}
                    member={member}
                    selected={selectedId === member.id}
                    onSelect={(m) => {
                      setSelectedId(m.id);
                      showNotif(`${m.name} selected.`);
                    }}
                    night={night}
                  />
                ))}
              </div>
            )}

            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filtered.length}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={(page) => {
                const safe = Math.max(1, Math.min(totalPages, page));
                setCurrentPage(safe);
              }}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              night={night}
            />
          </div>

          {panelOpen && (
            <DetailPanel
              member={selectedMember}
              onClose={() => setPanelOpen(false)}
              night={night}
            />
          )}
        </div>
      </div>
    </section>
  );
}