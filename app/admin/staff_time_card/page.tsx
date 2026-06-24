// "use client";

// import * as React from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   KeyboardSensor,
//   useSensor,
//   useSensors,
//   DragEndEvent,
//   DragStartEvent,
//   DragOverlay,
// } from "@dnd-kit/core";
// import {
//   arrayMove,
//   SortableContext,
//   sortableKeyboardCoordinates,
//   rectSortingStrategy,
//   useSortable,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import {
//   LogIn,
//   LogOut,
//   Clock,
//   Sun,
//   Moon,
//   Sparkles,
//   Zap,
//   Users,
//   CheckCircle2,
//   XCircle,
//   GripVertical,
//   RotateCcw,
//   Timer,
//   CalendarDays,
//   MapPin,
//   Coffee,
//   AlertCircle,
//   Activity,
//   BadgeCheck,
//   Search,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Input } from "@/components/ui/input";

// // ─── TYPES ────────────────────────────────────────────────────────────────────
// type Theme   = "dark" | "light";
// type PunchStatus = "out" | "in" | "break" | "done";

// // ─── STAFF DATA ───────────────────────────────────────────────────────────────
// const INITIAL_STAFF = [
//   { id: "ST-001", name: "Sai Aung",  role: "Admin",   branch: "Main",     grad: "from-blue-600 via-blue-500 to-cyan-400",     img: "https://api.dicebear.com/9.x/notionists/svg?seed=SaiAung&backgroundColor=b6e3f4"   },
//   { id: "ST-002", name: "Ma Thida", role: "Manager", branch: "Branch A",  grad: "from-violet-600 via-violet-500 to-fuchsia-400", img: "https://api.dicebear.com/9.x/notionists/svg?seed=MaThida&backgroundColor=ffdfbf"  },
//   { id: "ST-003", name: "Ko Kyaw",  role: "Cashier", branch: "Main",     grad: "from-emerald-600 via-emerald-500 to-teal-400", img: "https://api.dicebear.com/9.x/notionists/svg?seed=KoKyaw&backgroundColor=c0aede"    },
//   { id: "ST-004", name: "Su Myat",  role: "Cashier", branch: "Branch B", grad: "from-rose-600 via-rose-500 to-pink-400",       img: "https://api.dicebear.com/9.x/notionists/svg?seed=SuMyat&backgroundColor=ffd5dc"    },
//   { id: "ST-005", name: "Htet Lin", role: "Stock",   branch: "Main",     grad: "from-amber-600 via-amber-500 to-orange-400",   img: "https://api.dicebear.com/9.x/notionists/svg?seed=HtetLin&backgroundColor=d1f4d9"   },
//   { id: "ST-006", name: "Aye Aye",  role: "Manager", branch: "Branch B", grad: "from-indigo-600 via-indigo-500 to-blue-400",   img: "https://api.dicebear.com/9.x/notionists/svg?seed=AyeAye&backgroundColor=ffeaa7"    },
//   { id: "ST-007", name: "Naing Zaw",role: "Cashier", branch: "Online",   grad: "from-teal-600 via-teal-500 to-cyan-400",       img: "https://api.dicebear.com/9.x/notionists/svg?seed=NaingZaw&backgroundColor=e8d5b7"  },
//   { id: "ST-008", name: "Win Myint",role: "Stock",   branch: "Branch A", grad: "from-orange-600 via-orange-500 to-amber-400",  img: "https://api.dicebear.com/9.x/notionists/svg?seed=WinMyint&backgroundColor=b6e3f4"  },
// ];

// type StaffMember = typeof INITIAL_STAFF[0];

// interface PunchRecord {
//   status: PunchStatus;
//   clockIn:  string | null;
//   clockOut: string | null;
//   breakStart: string | null;
//   breakEnd:   string | null;
//   logs: { time: string; action: string; color: string }[];
// }

// function nowStr() {
//   const d = new Date();
//   return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
// }

// function initRecord(): PunchRecord {
//   return { status: "out", clockIn: null, clockOut: null, breakStart: null, breakEnd: null, logs: [] };
// }

// // ─── THEME ────────────────────────────────────────────────────────────────────
// const tk = (theme: Theme) => theme === "dark" ? {
//   root:         "bg-[#060a14] text-white",
//   text:         "text-white",
//   textMuted:    "text-white/50",
//   textSubtle:   "text-white/30",
//   card:         "border-white/[0.08] bg-white/[0.048] backdrop-blur-2xl",
//   pill:         "border-white/[0.08] bg-white/[0.05] text-white/55",
//   btn:          "border-white/[0.10] bg-white/[0.06] text-white/80 hover:bg-white/[0.12] hover:text-white",
//   btnPrimary:   "bg-white text-black hover:bg-white/90",
//   input:        "border-white/10 bg-white/[0.06] text-white placeholder:text-white/30 focus-visible:border-blue-500/60",
//   divider:      "bg-white/[0.06]",
//   grid:         "[background-image:linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] [background-size:44px_44px]",
//   glow1:        "bg-blue-600/[0.09]",
//   glow2:        "bg-violet-600/[0.07]",
//   glow3:        "bg-emerald-600/[0.06]",
//   kpiCard:      "border-white/[0.07] bg-white/[0.042]",
//   logBg:        "bg-white/[0.04] border-white/[0.06]",
//   logRow:       "border-white/[0.04]",
//   statChip:     "bg-white/[0.05] border-white/[0.07]",
//   catActive:    "border-white/20 bg-white/[0.14] text-white shadow-sm",
//   catInactive:  "border-white/[0.07] bg-white/[0.03] text-white/45 hover:bg-white/[0.07] hover:text-white/75",
//   flipFront:    "from-white/[0.08] to-white/[0.025]",
//   flipBack:     "from-[#0e1828] to-[#080e1a]",
//   dragGhost:    "shadow-[0_30px_80px_rgba(0,0,0,0.8)]",
//   grip:         "border-white/10 bg-black/40 text-white/35 hover:text-white/65",
//   sectionBorder:"border-white/[0.06]",
//   statusOut:    "bg-slate-500/10   border-slate-500/20  text-slate-400",
//   statusIn:     "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
//   statusBreak:  "bg-amber-500/10   border-amber-500/20  text-amber-400",
//   statusDone:   "bg-blue-500/10    border-blue-500/20   text-blue-400",
//   elapsed:      "bg-white/[0.07]",
//   elapsedFill:  "from-blue-400 to-cyan-400",
// } : {
//   root:         "bg-[#edf1f9] text-slate-900",
//   text:         "text-slate-900",
//   textMuted:    "text-slate-500",
//   textSubtle:   "text-slate-400",
//   card:         "border-slate-200/80 bg-white/95 shadow-[0_2px_20px_rgba(15,23,42,0.06)] backdrop-blur-xl",
//   pill:         "border-slate-200 bg-white text-slate-500 shadow-sm",
//   btn:          "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 shadow-sm",
//   btnPrimary:   "bg-slate-900 text-white hover:bg-slate-800 shadow-md",
//   input:        "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-blue-500",
//   divider:      "bg-slate-200",
//   grid:         "[background-image:linear-gradient(rgba(15,23,42,0.033)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.033)_1px,transparent_1px)] [background-size:44px_44px]",
//   glow1:        "bg-sky-300/18",
//   glow2:        "bg-violet-300/14",
//   glow3:        "bg-emerald-300/12",
//   kpiCard:      "border-slate-200/80 bg-white/95 shadow-[0_2px_16px_rgba(15,23,42,0.06)]",
//   logBg:        "bg-slate-50 border-slate-200",
//   logRow:       "border-slate-100",
//   statChip:     "bg-slate-50 border-slate-200",
//   catActive:    "border-slate-900 bg-slate-900 text-white shadow-sm",
//   catInactive:  "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 shadow-sm",
//   flipFront:    "from-white to-slate-50/80",
//   flipBack:     "from-slate-50 to-white",
//   dragGhost:    "shadow-[0_24px_60px_rgba(15,23,42,0.25)]",
//   grip:         "border-slate-200 bg-white/80 text-slate-400 hover:text-slate-600 shadow-sm",
//   sectionBorder:"border-slate-100",
//   statusOut:    "bg-slate-100     border-slate-200    text-slate-500",
//   statusIn:     "bg-emerald-50    border-emerald-200  text-emerald-600",
//   statusBreak:  "bg-amber-50      border-amber-200    text-amber-600",
//   statusDone:   "bg-blue-50       border-blue-200     text-blue-600",
//   elapsed:      "bg-slate-100",
//   elapsedFill:  "from-blue-500 to-cyan-500",
// };

// // ─── LIVE ELAPSED HOOK ────────────────────────────────────────────────────────
// function useElapsed(fromStr: string | null): string {
//   const [elapsed, setElapsed] = React.useState("00:00:00");
//   React.useEffect(() => {
//     if (!fromStr) { setElapsed("00:00:00"); return; }
//     const tick = () => {
//       const [h, m, s] = fromStr.split(":").map(Number);
//       const start = new Date();
//       start.setHours(h, m, s ?? 0, 0);
//       const diff = Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000));
//       const hh = String(Math.floor(diff / 3600)).padStart(2, "0");
//       const mm = String(Math.floor((diff % 3600) / 60)).padStart(2, "0");
//       const ss = String(diff % 60).padStart(2, "0");
//       setElapsed(`${hh}:${mm}:${ss}`);
//     };
//     tick();
//     const id = setInterval(tick, 1000);
//     return () => clearInterval(id);
//   }, [fromStr]);
//   return elapsed;
// }

// // ─── LIVE WALL CLOCK ─────────────────────────────────────────────────────────
// function WallClock({ theme }: { theme: Theme }) {
//   const [now, setNow] = React.useState(new Date());
//   React.useEffect(() => {
//     const id = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(id);
//   }, []);
//   const t = tk(theme);
//   const H = String(now.getHours()).padStart(2, "0");
//   const M = String(now.getMinutes()).padStart(2, "0");
//   const S = String(now.getSeconds()).padStart(2, "0");

//   // shift progress 09:00→18:00
//   const nowMins   = now.getHours() * 60 + now.getMinutes();
//   const pct       = Math.max(0, Math.min(((nowMins - 540) / 540) * 100, 100));

//   return (
//     <div className={cn("rounded-[22px] border p-6 bg-gradient-to-br", theme === "dark" ? "from-[#0a0f1e] to-[#080c18] border-white/[0.07]" : "from-white to-slate-50 border-slate-200 shadow-sm")}>
//       <div className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-3", t.textSubtle)}>Live Clock</div>

//       {/* Clock digits */}
//       <div className="flex items-end gap-1 mb-1">
//         <span className={cn("text-[56px] font-black leading-none tabular-nums tracking-tighter", t.text)}>{H}</span>
//         <span className={cn("text-[40px] font-black leading-none mb-1.5", t.textMuted)}>:</span>
//         <span className={cn("text-[56px] font-black leading-none tabular-nums tracking-tighter", t.text)}>{M}</span>
//         <span className={cn("text-[40px] font-black leading-none mb-1.5", t.textMuted)}>:</span>
//         <span className={cn("text-[30px] font-bold leading-none mb-1.5 tabular-nums", t.textMuted)}>{S}</span>
//       </div>

//       <div className={cn("text-[12px] font-medium mb-5", t.textMuted)}>
//         {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
//       </div>

//       {/* Shift bar */}
//       <div>
//         <div className="flex justify-between mb-2">
//           <span className={cn("text-[10px] font-black uppercase tracking-widest", t.textSubtle)}>Shift 09:00 — 18:00</span>
//           <span className={cn("text-[10px] font-bold", t.textSubtle)}>{pct.toFixed(0)}%</span>
//         </div>
//         <div className={cn("h-[6px] w-full rounded-full overflow-hidden", t.elapsed)}>
//           <div
//             className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000", t.elapsedFill)}
//             style={{ width: `${pct}%` }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── STATUS CONFIG ────────────────────────────────────────────────────────────
// const punchStatusCfg: Record<PunchStatus, {
//   label: string; dot: string; pulse: boolean;
//   btnLabel: string; btnColor: string; btnIcon: React.FC<{ className?: string }>;
//   nextStatus: PunchStatus | null;
// }> = {
//   out:   { label: "Not In",   dot: "bg-slate-400",               pulse: false, btnLabel: "Clock In",   btnColor: "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30", btnIcon: LogIn,   nextStatus: "in"    },
//   in:    { label: "On Shift", dot: "bg-emerald-400",             pulse: true,  btnLabel: "Break",      btnColor: "bg-amber-500   hover:bg-amber-400   shadow-amber-500/30",   btnIcon: Coffee,  nextStatus: "break" },
//   break: { label: "On Break", dot: "bg-amber-400",               pulse: true,  btnLabel: "Resume",     btnColor: "bg-blue-500    hover:bg-blue-400    shadow-blue-500/30",     btnIcon: Activity,nextStatus: "in"    },
//   done:  { label: "Done",     dot: "bg-blue-400",                pulse: false, btnLabel: "Clocked Out",btnColor: "bg-slate-500   cursor-default",                             btnIcon: BadgeCheck, nextStatus: null },
// };

// // ─── PUNCH FLIP CARD ─────────────────────────────────────────────────────────
// function PunchCard({
//   member,
//   record,
//   onAction,
//   onClockOut,
//   theme,
//   isDragging,
// }: {
//   member: StaffMember;
//   record: PunchRecord;
//   onAction: (id: string) => void;
//   onClockOut: (id: string) => void;
//   theme: Theme;
//   isDragging: boolean;
// }) {
//   const [flipped, setFlipped] = React.useState(false);
//   const t     = tk(theme);
//   const cfg   = punchStatusCfg[record.status];
//   const BtnIcon = cfg.btnIcon;
//   const elapsed = useElapsed(record.status === "in" ? record.clockIn : record.status === "break" ? record.breakStart : null);

//   const statusClass = {
//     out:   t.statusOut,
//     in:    t.statusIn,
//     break: t.statusBreak,
//     done:  t.statusDone,
//   }[record.status];

//   return (
//     <div
//       className="relative h-[360px] cursor-pointer select-none"
//       style={{ perspective: "1100px" }}
//       onClick={() => setFlipped(f => !f)}
//     >
//       <motion.div
//         animate={{ rotateY: flipped ? 180 : 0 }}
//         transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
//         style={{ transformStyle: "preserve-3d" }}
//         className={cn("relative h-full w-full transition-opacity duration-150", isDragging && "opacity-0")}
//       >

//         {/* ── FRONT — PHOTO + PUNCH BUTTON ── */}
//         <div
//           className={cn("absolute inset-0 rounded-[22px] border overflow-hidden bg-gradient-to-br", t.flipFront,
//             record.status === "in" && !isDragging ? "ring-2 ring-emerald-500/40 shadow-[0_0_24px_rgba(52,211,153,0.15)]" :
//             record.status === "break" ? "ring-2 ring-amber-500/40 shadow-[0_0_24px_rgba(251,191,36,0.15)]" : "",
//             theme === "dark" ? "border-white/[0.08]" : "border-slate-200"
//           )}
//           style={{ backfaceVisibility: "hidden" }}
//         >
//           {/* Avatar / image */}
//           <div className={cn("h-[196px] w-full relative overflow-hidden bg-gradient-to-br", member.grad)}>
//             <img
//               src={member.img}
//               alt={member.name}
//               className="absolute inset-0 h-full w-full object-cover mix-blend-multiply opacity-85"
//               draggable={false}
//             />
//             {/* Bottom gradient */}
//             <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

//             {/* Status badge top-right */}
//             <div className="absolute right-3 top-3">
//               <span className={cn("inline-flex items-center gap-1.5 rounded-full border bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm", record.status === "in" ? "border-emerald-500/40" : record.status === "break" ? "border-amber-500/40" : "border-white/15")}>
//                 <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot, cfg.pulse && "animate-pulse")} />
//                 {cfg.label}
//               </span>
//             </div>

//             {/* Name overlay */}
//             <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
//               <div className="text-[16px] font-black text-white drop-shadow-md leading-tight">{member.name}</div>
//               <div className="text-[11px] text-white/60 font-mono mt-0.5">{member.id}</div>
//             </div>
//           </div>

//           {/* Body */}
//           <div className="px-4 pt-3 pb-4 space-y-3">
//             {/* Role + branch */}
//             <div className="flex items-center justify-between">
//               <span className={cn("text-[11px] font-semibold", t.textMuted)}>{member.role}</span>
//               <span className={cn("flex items-center gap-1 text-[11px]", t.textSubtle)}>
//                 <MapPin className="h-2.5 w-2.5" />{member.branch}
//               </span>
//             </div>

//             {/* Elapsed / clock-in time */}
//             {record.status === "in" && (
//               <div className="flex items-center justify-between">
//                 <span className={cn("text-[10px] font-bold uppercase tracking-widest", t.textSubtle)}>Elapsed</span>
//                 <span className="font-mono text-[13px] font-black text-emerald-400 tabular-nums">{elapsed}</span>
//               </div>
//             )}
//             {record.status === "break" && (
//               <div className="flex items-center justify-between">
//                 <span className={cn("text-[10px] font-bold uppercase tracking-widest", t.textSubtle)}>On Break</span>
//                 <span className="font-mono text-[13px] font-black text-amber-400 tabular-nums">{elapsed}</span>
//               </div>
//             )}
//             {record.status === "done" && record.clockIn && record.clockOut && (
//               <div className="flex items-center justify-between">
//                 <span className={cn("text-[10px] font-bold uppercase tracking-widest", t.textSubtle)}>Worked</span>
//                 <span className={cn("font-mono text-[13px] font-black tabular-nums", t.text)}>
//                   {record.clockIn} — {record.clockOut}
//                 </span>
//               </div>
//             )}
//             {record.status === "out" && (
//               <div className={cn("text-[11px] text-center py-1 rounded-xl border", t.pill)}>
//                 Not clocked in today
//               </div>
//             )}

//             {/* Action buttons */}
//             <div className="flex gap-2" onClick={e => e.stopPropagation()}>
//               {record.status !== "done" && (
//                 <button
//                   onClick={() => onAction(member.id)}
//                   className={cn("flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-black text-white shadow-lg transition-all active:scale-95", cfg.btnColor)}
//                 >
//                   <BtnIcon className="h-4 w-4" />
//                   {cfg.btnLabel}
//                 </button>
//               )}
//               {record.status === "in" && (
//                 <button
//                   onClick={() => onClockOut(member.id)}
//                   className="flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-[12px] font-bold text-rose-400 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 transition-all active:scale-95"
//                 >
//                   <LogOut className="h-4 w-4" />
//                 </button>
//               )}
//               {record.status === "done" && (
//                 <div className={cn("flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-black", t.statusDone)}>
//                   <BadgeCheck className="h-4 w-4" />
//                   Shift Complete
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* ── BACK — PUNCH LOG ── */}
//         <div
//           className={cn("absolute inset-0 rounded-[22px] border overflow-hidden bg-gradient-to-br p-5", t.flipBack,
//             theme === "dark" ? "border-white/[0.08]" : "border-slate-200"
//           )}
//           style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
//         >
//           {/* Header */}
//           <div className="flex items-center gap-3 mb-4">
//             <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-black text-white text-[13px] bg-gradient-to-br", member.grad)}>
//               {member.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
//             </div>
//             <div>
//               <div className={cn("text-[14px] font-black", t.text)}>{member.name}</div>
//               <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold", statusClass)}>
//                 <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
//                 {cfg.label}
//               </span>
//             </div>
//           </div>

//           {/* Time chips */}
//           <div className="grid grid-cols-2 gap-2 mb-4">
//             {[
//               { label: "Clock In",  value: record.clockIn   ?? "—", color: "text-emerald-400" },
//               { label: "Clock Out", value: record.clockOut  ?? "—", color: "text-rose-400"    },
//               { label: "Break",     value: record.breakStart ?? "—",color: "text-amber-400"   },
//               { label: "Resume",    value: record.breakEnd   ?? "—",color: "text-blue-400"    },
//             ].map(c => (
//               <div key={c.label} className={cn("rounded-xl border px-3 py-2.5", t.statChip)}>
//                 <div className={cn("text-[9px] font-black uppercase tracking-widest mb-0.5", t.textSubtle)}>{c.label}</div>
//                 <div className={cn("text-[14px] font-black tabular-nums", c.value !== "—" ? c.color : t.textSubtle)}>{c.value}</div>
//               </div>
//             ))}
//           </div>

//           {/* Log */}
//           <div className={cn("rounded-xl border overflow-hidden", t.logBg)}>
//             <div className={cn("px-3 py-2 text-[10px] font-black uppercase tracking-widest border-b", t.textSubtle, t.logRow)}>
//               Activity Log
//             </div>
//             <div className="max-h-[110px] overflow-y-auto">
//               {record.logs.length === 0 ? (
//                 <div className={cn("px-3 py-3 text-[11px] text-center", t.textSubtle)}>No activity yet</div>
//               ) : (
//                 record.logs.slice().reverse().map((log, i) => (
//                   <div key={i} className={cn("flex items-center gap-2.5 px-3 py-2 border-b last:border-0 text-[11px]", t.logRow)}>
//                     <span className={cn("font-mono font-bold tabular-nums text-[10px]", t.textSubtle)}>{log.time}</span>
//                     <span className={cn("font-semibold", log.color)}>{log.action}</span>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>

//           {/* Tap hint */}
//           <div className={cn("mt-3 text-center text-[10px] font-semibold", t.textSubtle)}>Tap to flip back</div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// // ─── SORTABLE WRAPPER ─────────────────────────────────────────────────────────
// function SortablePunchCard(props: {
//   member: StaffMember;
//   record: PunchRecord;
//   onAction: (id: string) => void;
//   onClockOut: (id: string) => void;
//   theme: Theme;
//   activeDragId: string | null;
// }) {
//   const { member, theme, activeDragId } = props;
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: member.id });
//   const t = tk(theme);

//   const style: React.CSSProperties = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     zIndex: isDragging ? 50 : undefined,
//   };

//   return (
//     <div ref={setNodeRef} style={style} className="relative group">
//       {/* Drag handle */}
//       <div
//         {...attributes}
//         {...listeners}
//         onClick={e => e.stopPropagation()}
//         className={cn(
//           "absolute left-2.5 top-2.5 z-30 flex h-7 w-7 items-center justify-center rounded-xl border cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm",
//           t.grip
//         )}
//       >
//         <GripVertical className="h-3.5 w-3.5" />
//       </div>
//       <PunchCard {...props} isDragging={isDragging} />
//     </div>
//   );
// }

// // ─── OVERLAY GHOST ────────────────────────────────────────────────────────────
// function DragOverlayCard({ member, theme }: { member: StaffMember; theme: Theme }) {
//   const t = tk(theme);
//   return (
//     <div className={cn("h-[360px] w-[260px] rounded-[22px] border overflow-hidden rotate-3 scale-105 pointer-events-none", t.card, t.dragGhost)}>
//       <div className={cn("h-[196px] w-full relative bg-gradient-to-br", member.grad)}>
//         <img src={member.img} alt="" className="absolute inset-0 h-full w-full object-cover mix-blend-multiply opacity-80" draggable={false} />
//         <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
//         <div className="absolute inset-x-0 bottom-3 left-4">
//           <div className="text-[16px] font-black text-white">{member.name}</div>
//         </div>
//       </div>
//       <div className="px-4 pt-3">
//         <div className={cn("text-[12px]", t.textMuted)}>{member.role} · {member.branch}</div>
//       </div>
//     </div>
//   );
// }

// // ─── PAGE ─────────────────────────────────────────────────────────────────────
// export default function TimeCardPunchPage() {
//   const [staffOrder, setStaffOrder] = React.useState(INITIAL_STAFF.map(s => s.id));
//   const [records,    setRecords]    = React.useState<Record<string, PunchRecord>>(
//     () => Object.fromEntries(INITIAL_STAFF.map(s => [s.id, initRecord()]))
//   );
//   const [theme,        setTheme]        = React.useState<Theme>("dark");
//   const [activeDragId, setActiveDragId] = React.useState<string | null>(null);
//   const [q,            setQ]            = React.useState("");
//   const [filterStatus, setFilterStatus] = React.useState<"all" | PunchStatus>("all");

//   const t = tk(theme);

//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
//     useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
//   );

//   // Counts
//   const inCount    = Object.values(records).filter(r => r.status === "in").length;
//   const breakCount = Object.values(records).filter(r => r.status === "break").length;
//   const outCount   = Object.values(records).filter(r => r.status === "out").length;
//   const doneCount  = Object.values(records).filter(r => r.status === "done").length;

//   function handleAction(id: string) {
//     setRecords(prev => {
//       const r   = prev[id];
//       const cfg = punchStatusCfg[r.status];
//       if (!cfg.nextStatus) return prev;
//       const time  = nowStr();
//       const next  = cfg.nextStatus;
//       const logs  = [...r.logs];

//       let update: Partial<PunchRecord> = { status: next };
//       if (r.status === "out") {
//         update = { status: "in", clockIn: time };
//         logs.push({ time, action: "Clocked In", color: "text-emerald-400" });
//       } else if (r.status === "in") {
//         update = { status: "break", breakStart: time };
//         logs.push({ time, action: "Break Started", color: "text-amber-400" });
//       } else if (r.status === "break") {
//         update = { status: "in", breakEnd: time };
//         logs.push({ time, action: "Break Ended", color: "text-blue-400" });
//       }
//       return { ...prev, [id]: { ...r, ...update, logs } };
//     });
//   }

//   function handleClockOut(id: string) {
//     setRecords(prev => {
//       const r    = prev[id];
//       const time = nowStr();
//       const logs = [...r.logs, { time, action: "Clocked Out", color: "text-rose-400" }];
//       return { ...prev, [id]: { ...r, status: "done", clockOut: time, logs } };
//     });
//   }

//   function handleReset() {
//     setStaffOrder(INITIAL_STAFF.map(s => s.id));
//     setRecords(Object.fromEntries(INITIAL_STAFF.map(s => [s.id, initRecord()])));
//   }

//   function handleDragStart(e: DragStartEvent) { setActiveDragId(String(e.active.id)); }
//   function handleDragEnd(e: DragEndEvent) {
//     setActiveDragId(null);
//     if (e.over && e.active.id !== e.over.id) {
//       setStaffOrder(prev => {
//         const oi = prev.indexOf(String(e.active.id));
//         const ni = prev.indexOf(String(e.over!.id));
//         return arrayMove(prev, oi, ni);
//       });
//     }
//   }

//   // Build ordered + filtered staff list
//   const orderedStaff = staffOrder
//     .map(id => INITIAL_STAFF.find(s => s.id === id)!)
//     .filter(Boolean)
//     .filter(s => {
//       const matchQ = !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.id.toLowerCase().includes(q.toLowerCase());
//       const matchF = filterStatus === "all" || records[s.id].status === filterStatus;
//       return matchQ && matchF;
//     });

//   const activeMember = activeDragId ? INITIAL_STAFF.find(s => s.id === activeDragId) : null;

//   return (
//     <div className={cn("relative min-h-screen transition-colors duration-300", t.root)}>
//       <div className={cn("pointer-events-none fixed inset-0", t.grid)} />
//       <div className="pointer-events-none fixed inset-0 overflow-hidden">
//         <div className={cn("absolute -top-40 left-[15%] h-[600px] w-[600px] rounded-full blur-[140px]", t.glow1)} />
//         <div className={cn("absolute top-[30%] right-[-8%] h-[500px] w-[500px] rounded-full blur-[130px]", t.glow2)} />
//         <div className={cn("absolute bottom-[-5%] left-[40%] h-[400px] w-[400px] rounded-full blur-[120px]", t.glow3)} />
//       </div>

//       <div className="relative z-10 mx-auto max-w-[1520px] px-5 py-7 md:px-8 space-y-7">

//         {/* ── TOPBAR ────────────────────────────────────────────────────── */}
//         <motion.div
//           initial={{ opacity: 0, y: -12 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.26 }}
//           className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
//         >
//           <div>
//             <div className={cn("mb-2.5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold", t.pill)}>
//               <Sparkles className="h-3 w-3" />
//               Time Card · Punch In / Out
//             </div>
//             <h1 className={cn("text-[34px] md:text-[42px] font-black tracking-tight leading-[0.95]", t.text)}>
//               Time Cards
//               <span className={cn("ml-3 text-[20px] font-bold", t.textMuted)}>/ Punch</span>
//             </h1>
//             <p className={cn("mt-2 text-sm", t.textMuted)}>
//               Tap a card to flip the punch log. Tap the button to clock in/out/break. Drag to reorder.
//             </p>
//           </div>

//           <div className="flex flex-wrap items-center gap-2.5">
//             <div className="relative">
//               <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5", t.textSubtle)} />
//               <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search staff…"
//                 className={cn("h-9 w-[200px] rounded-xl pl-9 text-[13px]", t.input)} />
//             </div>
//             <button onClick={handleReset} className={cn("flex h-9 items-center gap-1.5 rounded-xl border px-3.5 text-[13px] font-semibold", t.btn)}>
//               <RotateCcw className="h-3.5 w-3.5" />Reset
//             </button>
//             <button onClick={() => setTheme(th => th === "dark" ? "light" : "dark")}
//               className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", t.btn)}>
//               {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//             </button>
//           </div>
//         </motion.div>

//         {/* ── MAIN LAYOUT ───────────────────────────────────────────────── */}
//         <div className="grid gap-6 xl:grid-cols-[1fr_300px]">

//           {/* ── LEFT: DnD CARD GRID ── */}
//           <div className="space-y-5">

//             {/* Status filter tabs */}
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}
//               className="flex flex-wrap items-center gap-2"
//             >
//               {([
//                 { key: "all",   label: `All (${INITIAL_STAFF.length})` },
//                 { key: "in",    label: `On Shift (${inCount})` },
//                 { key: "break", label: `Break (${breakCount})` },
//                 { key: "out",   label: `Not In (${outCount})` },
//                 { key: "done",  label: `Done (${doneCount})` },
//               ] as const).map(f => (
//                 <button key={f.key} onClick={() => setFilterStatus(f.key)}
//                   className={cn("rounded-xl border px-3.5 py-1.5 text-[12px] font-bold transition-all",
//                     filterStatus === f.key ? t.catActive : t.catInactive
//                   )}
//                 >{f.label}</button>
//               ))}
//             </motion.div>

//             {/* Cards grid */}
//             <DndContext
//               sensors={sensors}
//               collisionDetection={closestCenter}
//               onDragStart={handleDragStart}
//               onDragEnd={handleDragEnd}
//             >
//               <SortableContext items={orderedStaff.map(s => s.id)} strategy={rectSortingStrategy}>
//                 <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
//                   <AnimatePresence>
//                     {orderedStaff.map((member, i) => (
//                       <motion.div
//                         key={member.id}
//                         layout
//                         initial={{ opacity: 0, scale: 0.93 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         exit={{ opacity: 0, scale: 0.93 }}
//                         transition={{ delay: i * 0.05 }}
//                       >
//                         <SortablePunchCard
//                           member={member}
//                           record={records[member.id]}
//                           onAction={handleAction}
//                           onClockOut={handleClockOut}
//                           theme={theme}
//                           activeDragId={activeDragId}
//                         />
//                       </motion.div>
//                     ))}
//                   </AnimatePresence>

//                   {orderedStaff.length === 0 && (
//                     <div className={cn("col-span-full py-20 text-center", t.textMuted)}>
//                       <Users className="h-12 w-12 mx-auto opacity-20 mb-3" />
//                       <div className="text-sm font-semibold">No staff match</div>
//                     </div>
//                   )}
//                 </div>
//               </SortableContext>

//               <DragOverlay dropAnimation={{ duration: 300, easing: "cubic-bezier(0.18,0.67,0.6,1.22)" }}>
//                 {activeMember && <DragOverlayCard member={activeMember} theme={theme} />}
//               </DragOverlay>
//             </DndContext>
//           </div>

//           {/* ── RIGHT: LIVE CLOCK + SUMMARY ── */}
//           <div className="space-y-5">
//             <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
//               <WallClock theme={theme} />
//             </motion.div>

//             {/* Status summary */}
//             <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.22 }}
//               className={cn("rounded-[22px] border p-5 space-y-4", t.card)}
//             >
//               <div className={cn("text-[13px] font-bold", t.text)}>Today's Status</div>
//               {[
//                 { label: "On Shift",  count: inCount,    total: INITIAL_STAFF.length, color: "bg-emerald-400", dot: "bg-emerald-400 animate-pulse" },
//                 { label: "On Break",  count: breakCount, total: INITIAL_STAFF.length, color: "bg-amber-400",   dot: "bg-amber-400 animate-pulse"  },
//                 { label: "Not In",    count: outCount,   total: INITIAL_STAFF.length, color: "bg-slate-400",   dot: "bg-slate-400"                },
//                 { label: "Done",      count: doneCount,  total: INITIAL_STAFF.length, color: "bg-blue-400",    dot: "bg-blue-400"                 },
//               ].map(s => (
//                 <div key={s.label}>
//                   <div className="flex items-center justify-between mb-1.5">
//                     <div className="flex items-center gap-2">
//                       <span className={cn("h-2 w-2 rounded-full shrink-0", s.dot)} />
//                       <span className={cn("text-[12px] font-semibold", t.textMuted)}>{s.label}</span>
//                     </div>
//                     <span className={cn("text-[12px] font-bold tabular-nums", t.text)}>{s.count}/{s.total}</span>
//                   </div>
//                   <div className={cn("h-[5px] w-full rounded-full overflow-hidden", t.elapsed)}>
//                     <motion.div
//                       initial={{ width: 0 }}
//                       animate={{ width: `${(s.count / s.total) * 100}%` }}
//                       transition={{ duration: 0.9, delay: 0.3 }}
//                       className={cn("h-full rounded-full", s.color)}
//                     />
//                   </div>
//                 </div>
//               ))}
//             </motion.div>

//             {/* Quick punch — all staff clock-in shortcut */}
//             <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28 }}
//               className={cn("rounded-[22px] border p-5 space-y-3", t.card)}
//             >
//               <div className={cn("text-[13px] font-bold", t.text)}>Quick Actions</div>

//               <button
//                 onClick={() => INITIAL_STAFF.forEach(s => { if (records[s.id].status === "out") handleAction(s.id); })}
//                 className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-[13px] font-black text-white hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
//               >
//                 <LogIn className="h-4 w-4" />
//                 Clock In All (Not In)
//               </button>

//               <button
//                 onClick={() => INITIAL_STAFF.forEach(s => { if (records[s.id].status === "in") handleClockOut(s.id); })}
//                 className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 py-3 text-[13px] font-black text-rose-400 hover:bg-rose-500/20 transition-all active:scale-[0.98]"
//               >
//                 <LogOut className="h-4 w-4" />
//                 Clock Out All (On Shift)
//               </button>
//             </motion.div>

//             {/* Hint */}
//             <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.34 }}
//               className={cn("rounded-[22px] border p-4 space-y-2.5", t.card)}
//             >
//               <div className={cn("text-[11px] font-black uppercase tracking-widest", t.textSubtle)}>How to use</div>
//               {[
//                 { icon: GripVertical, text: "Drag grip handle to reorder" },
//                 { icon: RotateCcw,    text: "Tap card to flip logs ↔ photo" },
//                 { icon: LogIn,        text: "Green button = Clock In" },
//                 { icon: Coffee,       text: "Break / Resume shift" },
//                 { icon: LogOut,       text: "Red button = Clock Out" },
//               ].map((h, i) => {
//                 const Icon = h.icon;
//                 return (
//                   <div key={i} className="flex items-center gap-2.5">
//                     <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-lg", theme === "dark" ? "bg-white/[0.07]" : "bg-slate-100")}>
//                       <Icon className={cn("h-3.5 w-3.5", t.textSubtle)} />
//                     </div>
//                     <span className={cn("text-[11px] font-medium", t.textMuted)}>{h.text}</span>
//                   </div>
//                 );
//               })}
//             </motion.div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className={cn("flex items-center justify-between text-[11px] font-semibold pb-3", t.textSubtle)}>
//           <span>© 2026 BINHLAIG · Time Card Punch Module</span>
//           <span className="flex items-center gap-1.5"><Zap className="h-3 w-3" />@dnd-kit · framer-motion · live clock</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import * as React from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   LogIn, LogOut, Sun, Moon, Sparkles, Zap, Users, RotateCcw,
//   Clock3, Shield, Key, Store, Crown, CheckCircle2, Mail, Phone,
//   Calendar, Coffee, Activity, ScanLine, TimerReset, MapPin,
//   AlertCircle, ChevronRight, Fingerprint, Eye, EyeOff, X,
//   ArrowLeft, BadgeCheck, ClockArrowUp,
// } from "lucide-react";
// import { cn } from "@/lib/utils";

// // ─────────────────────────────────────────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────────────────────────────────────────
// type Theme = "dark" | "light";
// type PunchStatus = "out" | "in" | "break" | "done";
// type View = "login" | "dashboard" | "staff-panel";

// type StaffMember = {
//   id: string;
//   name: string;
//   role: string;
//   branch: string;
//   grad: [string, string];
//   accent: string;
//   email: string;
//   phone: string;
//   joined: string;
//   pin: string; // 4-digit PIN
//   scheduleToday: boolean; // whether scheduled today
//   shiftStart: string;
//   shiftEnd: string;
// };

// type PunchRecord = {
//   status: PunchStatus;
//   clockIn: string | null;
//   clockOut: string | null;
//   breakStart: string | null;
//   breakEnd: string | null;
//   totalBreakMins: number;
//   logs: { time: string; action: string; color: string }[];
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // DATA — Staff with schedules
// // ─────────────────────────────────────────────────────────────────────────────
// const INITIAL_STAFF: StaffMember[] = [
//   {
//     id: "ST-001", name: "Sai Aung", role: "Admin", branch: "Main",
//     grad: ["#3b82f6", "#06b6d4"], accent: "#3b82f6",
//     email: "saiaung@binhlaig.com", phone: "+95 9 111 222 33", joined: "2023-01",
//     pin: "1234", scheduleToday: true, shiftStart: "09:00", shiftEnd: "18:00",
//   },
//   {
//     id: "ST-002", name: "Ma Thida", role: "Manager", branch: "Branch A",
//     grad: ["#8b5cf6", "#ec4899"], accent: "#8b5cf6",
//     email: "mathida@binhlaig.com", phone: "+95 9 222 333 44", joined: "2023-04",
//     pin: "2345", scheduleToday: true, shiftStart: "08:30", shiftEnd: "17:30",
//   },
//   {
//     id: "ST-003", name: "Ko Kyaw", role: "Cashier", branch: "Main",
//     grad: ["#10b981", "#14b8a6"], accent: "#10b981",
//     email: "kokyaw@binhlaig.com", phone: "+95 9 333 444 55", joined: "2024-02",
//     pin: "3456", scheduleToday: true, shiftStart: "10:00", shiftEnd: "19:00",
//   },
//   {
//     id: "ST-004", name: "Su Myat", role: "Cashier", branch: "Branch B",
//     grad: ["#f43f5e", "#fb7185"], accent: "#f43f5e",
//     email: "sumyat@binhlaig.com", phone: "+95 9 444 555 66", joined: "2024-05",
//     pin: "4567", scheduleToday: false, shiftStart: "09:00", shiftEnd: "18:00",
//   },
//   {
//     id: "ST-005", name: "Htet Lin", role: "Stock", branch: "Main",
//     grad: ["#f59e0b", "#f97316"], accent: "#f59e0b",
//     email: "htetlin@binhlaig.com", phone: "+95 9 555 666 77", joined: "2023-09",
//     pin: "5678", scheduleToday: true, shiftStart: "07:00", shiftEnd: "16:00",
//   },
//   {
//     id: "ST-006", name: "Aye Aye", role: "Manager", branch: "Branch B",
//     grad: ["#6366f1", "#3b82f6"], accent: "#6366f1",
//     email: "ayeaye@binhlaig.com", phone: "+95 9 666 777 88", joined: "2023-06",
//     pin: "6789", scheduleToday: false, shiftStart: "09:00", shiftEnd: "18:00",
//   },
//   {
//     id: "ST-007", name: "Naing Zaw", role: "Cashier", branch: "Online",
//     grad: ["#0d9488", "#06b6d4"], accent: "#0d9488",
//     email: "naingzaw@binhlaig.com", phone: "+95 9 777 888 99", joined: "2024-08",
//     pin: "7890", scheduleToday: true, shiftStart: "12:00", shiftEnd: "21:00",
//   },
//   {
//     id: "ST-008", name: "Win Myint", role: "Stock", branch: "Branch A",
//     grad: ["#ea580c", "#eab308"], accent: "#ea580c",
//     email: "winmyint@binhlaig.com", phone: "+95 9 888 999 00", joined: "2023-11",
//     pin: "8901", scheduleToday: true, shiftStart: "08:00", shiftEnd: "17:00",
//   },
// ];

// function initRecord(): PunchRecord {
//   return { status: "out", clockIn: null, clockOut: null, breakStart: null, breakEnd: null, totalBreakMins: 0, logs: [] };
// }

// function nowStr() {
//   const d = new Date();
//   return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
// }

// function timeDiffMins(from: string, to: string): number {
//   const [fh, fm, fs] = from.split(":").map(Number);
//   const [th, tm, ts] = to.split(":").map(Number);
//   return Math.floor(((th * 3600 + tm * 60 + (ts || 0)) - (fh * 3600 + fm * 60 + (fs || 0))) / 60);
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // THEME TOKENS
// // ─────────────────────────────────────────────────────────────────────────────
// const tk = (theme: Theme) =>
//   theme === "dark" ? {
//     root: "bg-[#050816] text-white",
//     text: "text-white", textMuted: "text-white/65", textSubtle: "text-white/35",
//     card: "border-white/[0.08] bg-white/[0.05] backdrop-blur-2xl",
//     cardSoft: "border-white/[0.08] bg-white/[0.035] backdrop-blur-xl",
//     pill: "border-white/[0.08] bg-white/[0.05] text-white/80",
//     btn: "border-white/10 bg-white/[0.06] text-white/85 hover:bg-white/[0.12]",
//     input: "border-white/10 bg-white/[0.06] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20",
//     divider: "bg-white/[0.08]",
//     grid: "[background-image:linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] [background-size:44px_44px]",
//     chip: "bg-white/[0.05] border-white/[0.07]",
//     elapsed: "bg-white/[0.08]",
//     statusOut: "bg-slate-500/10 border-slate-500/20 text-slate-300",
//     statusIn: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
//     statusBreak: "bg-amber-500/10 border-amber-500/20 text-amber-300",
//     statusDone: "bg-blue-500/10 border-blue-500/20 text-blue-300",
//     catActive: "border-white/20 bg-white/[0.14] text-white",
//     catInactive: "border-white/[0.07] bg-white/[0.03] text-white/55 hover:bg-white/[0.07]",
//     loginCard: "border-white/10 bg-white/[0.04] backdrop-blur-3xl",
//     pinBtn: "border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.14]",
//     pinDisplay: "border-white/10 bg-black/30",
//     errorBg: "bg-rose-500/10 border-rose-500/20 text-rose-300",
//     successBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
//     warningBg: "bg-amber-500/10 border-amber-500/20 text-amber-300",
//   } : {
//     root: "bg-[#eef3fa] text-slate-900",
//     text: "text-slate-900", textMuted: "text-slate-600", textSubtle: "text-slate-400",
//     card: "border-slate-200 bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(15,23,42,0.06)]",
//     cardSoft: "border-slate-200 bg-white/80 backdrop-blur-xl shadow-[0_6px_24px_rgba(15,23,42,0.05)]",
//     pill: "border-slate-200 bg-white text-slate-700",
//     btn: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
//     input: "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300",
//     divider: "bg-slate-200",
//     grid: "[background-image:linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] [background-size:44px_44px]",
//     chip: "bg-slate-50 border-slate-200",
//     elapsed: "bg-slate-100",
//     statusOut: "bg-slate-100 border-slate-200 text-slate-600",
//     statusIn: "bg-emerald-50 border-emerald-200 text-emerald-600",
//     statusBreak: "bg-amber-50 border-amber-200 text-amber-600",
//     statusDone: "bg-blue-50 border-blue-200 text-blue-600",
//     catActive: "border-slate-900 bg-slate-900 text-white",
//     catInactive: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
//     loginCard: "border-slate-200 bg-white/80 backdrop-blur-xl shadow-[0_24px_80px_rgba(15,23,42,0.10)]",
//     pinBtn: "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 shadow-sm",
//     pinDisplay: "border-slate-200 bg-slate-50",
//     errorBg: "bg-rose-50 border-rose-200 text-rose-600",
//     successBg: "bg-emerald-50 border-emerald-200 text-emerald-600",
//     warningBg: "bg-amber-50 border-amber-200 text-amber-600",
//   };

// const punchCfg = {
//   out: { label: "Not In", dot: "bg-slate-400", pulse: false, btnLabel: "Clock In", btnCls: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20", btnIcon: LogIn },
//   in: { label: "On Shift", dot: "bg-emerald-400", pulse: true, btnLabel: "Take Break", btnCls: "bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20", btnIcon: Coffee },
//   break: { label: "On Break", dot: "bg-amber-400", pulse: true, btnLabel: "Resume", btnCls: "bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20", btnIcon: Activity },
//   done: { label: "Done", dot: "bg-blue-400", pulse: false, btnLabel: "Completed", btnCls: "bg-slate-500 text-white opacity-60", btnIcon: CheckCircle2 },
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────────────────────────────────────
// function useElapsed(fromStr: string | null): string {
//   const [elapsed, setElapsed] = React.useState("00:00:00");
//   React.useEffect(() => {
//     if (!fromStr) { setElapsed("00:00:00"); return; }
//     const tick = () => {
//       const [h, m, s] = fromStr.split(":").map(Number);
//       const start = new Date(); start.setHours(h, m, s ?? 0, 0);
//       const diff = Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000));
//       setElapsed(`${String(Math.floor(diff / 3600)).padStart(2,"0")}:${String(Math.floor((diff%3600)/60)).padStart(2,"0")}:${String(diff%60).padStart(2,"0")}`);
//     };
//     tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
//   }, [fromStr]);
//   return elapsed;
// }

// function useClock() {
//   const [now, setNow] = React.useState(new Date());
//   React.useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
//   return now;
// }

// function RoleIcon({ role, className }: { role: string; className?: string }) {
//   const icons: Record<string, React.ComponentType<{ className?: string }>> = { Admin: Crown, Manager: Shield, Cashier: Key, Stock: Store };
//   const Icon = icons[role] ?? Users; return <Icon className={className} />;
// }

// function GradAvatar({ member, size = "lg" }: { member: StaffMember; size?: "sm" | "md" | "lg" | "xl" }) {
//   const initials = member.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
//   const [c0, c1] = member.grad;
//   const sz = { sm: "h-9 w-9 text-[11px]", md: "h-12 w-12 text-[13px]", lg: "h-[72px] w-[72px] text-[22px]", xl: "h-24 w-24 text-[30px]" }[size];
//   return (
//     <div className={cn("flex shrink-0 items-center justify-center rounded-2xl font-black text-white", sz)}
//       style={{ background: `linear-gradient(135deg, ${c0}, ${c1})` }}>{initials}</div>
//   );
// }

// function getStatusCls(theme: Theme, status: PunchStatus) {
//   const t = tk(theme);
//   return { out: t.statusOut, in: t.statusIn, break: t.statusBreak, done: t.statusDone }[status];
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // LIVE CLOCK DISPLAY
// // ─────────────────────────────────────────────────────────────────────────────
// function LiveClock({ theme }: { theme: Theme }) {
//   const now = useClock();
//   const t = tk(theme);
//   const H = String(now.getHours()).padStart(2, "0");
//   const M = String(now.getMinutes()).padStart(2, "0");
//   const S = String(now.getSeconds()).padStart(2, "0");
//   return (
//     <div className="flex items-end gap-1 tabular-nums">
//       <span className={cn("text-[52px] font-black leading-none tracking-[-0.05em]", t.text)}>{H}</span>
//       <span className={cn("pb-1 text-[28px] font-black opacity-40", t.text)}>:</span>
//       <span className={cn("text-[52px] font-black leading-none tracking-[-0.05em]", t.text)}>{M}</span>
//       <span className={cn("pb-2 text-[18px] font-bold tabular-nums", t.textMuted)}>{S}</span>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // LOGIN / CLOCK-IN SCREEN
// // ─────────────────────────────────────────────────────────────────────────────
// function LoginScreen({ theme, onLogin }: { theme: Theme; onLogin: (staff: StaffMember) => void }) {
//   const t = tk(theme);
//   const now = useClock();
//   const [idInput, setIdInput] = React.useState("");
//   const [foundStaff, setFoundStaff] = React.useState<StaffMember | null>(null);
//   const [pin, setPin] = React.useState("");
//   const [showPin, setShowPin] = React.useState(false);
//   const [error, setError] = React.useState("");
//   const [step, setStep] = React.useState<"id" | "pin">("id");
//   const [shake, setShake] = React.useState(false);

//   const H = String(now.getHours()).padStart(2, "0");
//   const M = String(now.getMinutes()).padStart(2, "0");
//   const S = String(now.getSeconds()).padStart(2, "0");

//   const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

//   function handleFindStaff() {
//     const q = idInput.trim().toUpperCase();
//     const staff = INITIAL_STAFF.find(s => s.id === q || s.name.toLowerCase() === idInput.trim().toLowerCase());
//     if (!staff) { setError("Staff ID / Name မတွေ့ပါ"); triggerShake(); return; }
//     if (!staff.scheduleToday) { setError(`${staff.name} — ယနေ့ shift မရှိပါ (Day Off)`); triggerShake(); return; }
//     setFoundStaff(staff); setError(""); setStep("pin");
//   }

//   function handlePinKey(k: string) {
//     if (k === "DEL") { setPin(p => p.slice(0, -1)); return; }
//     if (pin.length >= 4) return;
//     const next = pin + k;
//     setPin(next);
//     if (next.length === 4) {
//       setTimeout(() => verifyPin(next), 200);
//     }
//   }

//   function verifyPin(p: string) {
//     if (!foundStaff) return;
//     if (p === foundStaff.pin) { onLogin(foundStaff); }
//     else { setError("PIN မှားနေပါသည်"); setPin(""); triggerShake(); }
//   }

//   function triggerShake() { setShake(true); setTimeout(() => setShake(false), 600); }

//   function handleBack() { setStep("id"); setFoundStaff(null); setPin(""); setError(""); setIdInput(""); }

//   return (
//     <div className={cn("relative min-h-screen overflow-hidden flex flex-col items-center justify-center px-4 py-8", t.root)}>
//       <div className={cn("pointer-events-none fixed inset-0", t.grid)} />
//       <div className="absolute -top-32 left-[15%] h-[480px] w-[480px] rounded-full bg-cyan-500/10 blur-[120px]" />
//       <div className="absolute right-[5%] top-[20%] h-[400px] w-[400px] rounded-full bg-violet-500/12 blur-[120px]" />
//       <div className="absolute bottom-[-8%] left-[35%] h-[380px] w-[380px] rounded-full bg-emerald-500/08 blur-[110px]" />

//       {/* Top bar */}
//       <div className="relative z-10 mb-8 w-full max-w-[420px]">
//         <div className="flex items-center justify-between">
//           <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold", t.pill)}>
//             <Sparkles className="h-3.5 w-3.5" />
//             BINHLAIG · Time Card
//           </div>
//           <div className="flex items-center gap-2">
//             <span className={cn("font-mono text-[11px] tabular-nums", t.textSubtle)}>{dateStr.split(",")[0]}</span>
//           </div>
//         </div>
//       </div>

//       {/* Clock */}
//       <div className="relative z-10 mb-8 text-center">
//         <div className="flex items-end justify-center gap-1 tabular-nums">
//           <span className={cn("text-[80px] font-black leading-none tracking-[-0.06em]", t.text)}>{H}</span>
//           <span className={cn("pb-2 text-[44px] font-black opacity-35", t.text)}>:</span>
//           <span className={cn("text-[80px] font-black leading-none tracking-[-0.06em]", t.text)}>{M}</span>
//           <span className={cn("pb-3 text-[26px] font-bold", t.textMuted)}>{S}</span>
//         </div>
//         <div className={cn("mt-2 text-sm font-semibold", t.textMuted)}>{dateStr}</div>
//       </div>

//       {/* Main card */}
//       <motion.div
//         animate={shake ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
//         transition={{ duration: 0.4 }}
//         className={cn("relative z-10 w-full max-w-[420px] rounded-[28px] border p-6 md:p-8", t.loginCard)}
//       >
//         <AnimatePresence mode="wait">
//           {step === "id" ? (
//             <motion.div key="id-step" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
//               <div className="mb-6 flex items-center gap-3">
//                 <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/20">
//                   <Fingerprint className="h-5 w-5 text-cyan-400" />
//                 </div>
//                 <div>
//                   <div className={cn("text-[16px] font-black", t.text)}>Staff ID ဝင်ရောက်မည်</div>
//                   <div className={cn("text-[12px]", t.textMuted)}>ID သို့မဟုတ် Name ထည့်ပြီး Find နှိပ်ပါ</div>
//                 </div>
//               </div>

//               {error && (
//                 <div className={cn("mb-4 flex items-center gap-2 rounded-2xl border px-4 py-3 text-[12px] font-semibold", t.errorBg)}>
//                   <AlertCircle className="h-4 w-4 shrink-0" />
//                   {error}
//                 </div>
//               )}

//               <div className="flex gap-2">
//                 <div className="relative flex-1">
//                   <ScanLine className={cn("absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2", t.textSubtle)} />
//                   <input
//                     value={idInput}
//                     onChange={e => { setIdInput(e.target.value); setError(""); }}
//                     onKeyDown={e => e.key === "Enter" && handleFindStaff()}
//                     placeholder="ST-001 / Sai Aung"
//                     className={cn("h-12 w-full rounded-2xl border pl-10 pr-4 text-sm font-semibold", t.input)}
//                     autoFocus
//                   />
//                 </div>
//                 <button
//                   onClick={handleFindStaff}
//                   className="h-12 rounded-2xl bg-cyan-500 px-5 text-sm font-black text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition"
//                 >
//                   <ChevronRight className="h-5 w-5" />
//                 </button>
//               </div>

//               {/* Today's scheduled staff */}
//               <div className="mt-6">
//                 <div className={cn("mb-3 text-[11px] font-black uppercase tracking-widest", t.textSubtle)}>
//                   ယနေ့ Shift ရှိသော ဝန်ထမ်းများ
//                 </div>
//                 <div className="grid grid-cols-2 gap-2">
//                   {INITIAL_STAFF.filter(s => s.scheduleToday).map(s => (
//                     <button
//                       key={s.id}
//                       onClick={() => { setIdInput(s.id); setError(""); }}
//                       className={cn("flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left transition hover:scale-[1.02]", t.chip)}
//                     >
//                       <GradAvatar member={s} size="sm" />
//                       <div className="min-w-0">
//                         <div className={cn("truncate text-[11px] font-bold", t.text)}>{s.name}</div>
//                         <div className={cn("text-[10px]", t.textSubtle)}>{s.shiftStart}–{s.shiftEnd}</div>
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Day off staff */}
//               <div className="mt-4">
//                 <div className={cn("mb-2 text-[11px] font-black uppercase tracking-widest", t.textSubtle)}>
//                   Day Off
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {INITIAL_STAFF.filter(s => !s.scheduleToday).map(s => (
//                     <div key={s.id} className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1 opacity-50", t.chip)}>
//                       <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
//                       <span className={cn("text-[10px] font-semibold", t.textMuted)}>{s.name}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </motion.div>
//           ) : (
//             <motion.div key="pin-step" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
//               <button onClick={handleBack} className={cn("mb-5 flex items-center gap-2 text-[12px] font-bold transition hover:opacity-70", t.textMuted)}>
//                 <ArrowLeft className="h-4 w-4" /> Back
//               </button>

//               {foundStaff && (
//                 <div className="mb-6 flex items-center gap-3">
//                   <GradAvatar member={foundStaff} size="md" />
//                   <div>
//                     <div className={cn("text-[16px] font-black", t.text)}>{foundStaff.name}</div>
//                     <div className={cn("text-[12px]", t.textMuted)}>{foundStaff.id} · {foundStaff.role} · {foundStaff.branch}</div>
//                     <div className={cn("mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold", t.successBg)}>
//                       <Clock3 className="h-3 w-3" /> {foundStaff.shiftStart} – {foundStaff.shiftEnd}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {error && (
//                 <div className={cn("mb-4 flex items-center gap-2 rounded-2xl border px-4 py-3 text-[12px] font-semibold", t.errorBg)}>
//                   <AlertCircle className="h-4 w-4 shrink-0" /> {error}
//                 </div>
//               )}

//               <div className={cn("mb-4 flex items-center justify-between rounded-2xl border px-4 py-3", t.pinDisplay)}>
//                 <div className="flex gap-3">
//                   {[0,1,2,3].map(i => (
//                     <div key={i} className={cn("h-3.5 w-3.5 rounded-full border-2 transition-all duration-150",
//                       i < pin.length ? "bg-cyan-400 border-cyan-400 scale-110" : theme === "dark" ? "border-white/20" : "border-slate-300"
//                     )} />
//                   ))}
//                 </div>
//                 <button onClick={() => setShowPin(v => !v)} className={cn("transition hover:opacity-70", t.textMuted)}>
//                   {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                 </button>
//               </div>

//               {showPin && pin && (
//                 <div className={cn("mb-4 rounded-2xl border px-4 py-2 text-center font-mono text-lg font-black tracking-widest", t.chip, t.text)}>
//                   {pin.padEnd(4, "·")}
//                 </div>
//               )}

//               {/* PIN Pad */}
//               <div className="grid grid-cols-3 gap-3">
//                 {["1","2","3","4","5","6","7","8","9","","0","DEL"].map((k, i) => {
//                   if (k === "") return <div key={i} />;
//                   return (
//                     <button
//                       key={k}
//                       onClick={() => handlePinKey(k)}
//                       className={cn(
//                         "flex h-14 items-center justify-center rounded-2xl border text-[18px] font-black transition active:scale-95",
//                         k === "DEL"
//                           ? cn("text-rose-400 border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/15")
//                           : t.pinBtn
//                       )}
//                     >
//                       {k === "DEL" ? <X className="h-5 w-5" /> : k}
//                     </button>
//                   );
//                 })}
//               </div>

//               <div className={cn("mt-4 text-center text-[11px]", t.textSubtle)}>
//                 PIN 4 လုံး ထည့်သောအခါ အလိုအလျောက်ဝင်မည်
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // STAFF PUNCH PANEL (after login)
// // ─────────────────────────────────────────────────────────────────────────────
// function StaffPunchPanel({
//   staff, record, theme, onAction, onClockOut, onLogout,
// }: {
//   staff: StaffMember; record: PunchRecord; theme: Theme;
//   onAction: () => void; onClockOut: () => void; onLogout: () => void;
// }) {
//   const t = tk(theme);
//   const cfg = punchCfg[record.status];
//   const BtnIcon = cfg.btnIcon;
//   const now = useClock();
//   const elapsed = useElapsed(record.status === "in" ? record.clockIn : record.status === "break" ? record.breakStart : null);

//   const shiftMins = timeDiffMins(staff.shiftStart + ":00", staff.shiftEnd + ":00");
//   const workedMins = record.clockIn
//     ? Math.max(0, Math.floor((Date.now() - (() => { const [h,m,s] = record.clockIn!.split(":").map(Number); const d = new Date(); d.setHours(h,m,s,0); return d.getTime(); })()) / 60000) - record.totalBreakMins)
//     : 0;
//   const pct = shiftMins > 0 ? Math.min((workedMins / shiftMins) * 100, 100) : 0;

//   const [c0, c1] = staff.grad;

//   return (
//     <div className={cn("relative min-h-screen flex flex-col items-center justify-center px-4 py-8", t.root)}>
//       <div className={cn("pointer-events-none fixed inset-0", t.grid)} />
//       <div className="absolute -top-20 left-[10%] h-[400px] w-[400px] rounded-full blur-[100px]" style={{ background: `${c0}18` }} />
//       <div className="absolute right-[5%] bottom-[10%] h-[350px] w-[350px] rounded-full blur-[100px]" style={{ background: `${c1}14` }} />

//       <motion.div
//         initial={{ opacity: 0, scale: 0.94 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="relative z-10 w-full max-w-[460px]"
//       >
//         {/* Header */}
//         <div className="mb-6 flex items-center justify-between">
//           <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold", t.pill)}>
//             <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" />
//             Authenticated
//           </div>
//           <button
//             onClick={onLogout}
//             className={cn("flex items-center gap-2 rounded-2xl border px-4 py-2 text-[12px] font-bold transition", t.btn)}
//           >
//             <ArrowLeft className="h-3.5 w-3.5" /> Logout
//           </button>
//         </div>

//         {/* Main Card */}
//         <div className={cn("overflow-hidden rounded-[28px] border", t.card)}>
//           {/* Gradient header */}
//           <div className="relative h-[160px] overflow-hidden" style={{ background: `linear-gradient(135deg, ${c0}22, ${c1}18)` }}>
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div className="h-32 w-32 rounded-full border opacity-10" style={{ borderColor: c0 }} />
//               <div className="absolute h-48 w-48 rounded-full border opacity-06" style={{ borderColor: c1 }} />
//             </div>
//             <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl opacity-25" style={{ background: c0 }} />
//             <div className="absolute inset-x-0 bottom-4 flex items-end justify-center gap-4">
//               <GradAvatar member={staff} size="lg" />
//               <div className="pb-1">
//                 <div className="text-[20px] font-black text-white drop-shadow-sm">{staff.name}</div>
//                 <div className="text-[12px] font-semibold text-white/70">{staff.id} · {staff.role} · {staff.branch}</div>
//               </div>
//             </div>

//             {/* Status badge */}
//             <div className="absolute right-4 top-4">
//               <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm", getStatusCls(theme, record.status))}>
//                 <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot, cfg.pulse && "animate-pulse")} />
//                 {cfg.label}
//               </span>
//             </div>
//           </div>

//           <div className="p-6">
//             {/* Live clock */}
//             <div className="mb-5 flex items-center justify-between">
//               <LiveClock theme={theme} />
//               <div className="text-right">
//                 <div className={cn("text-[11px] font-black uppercase tracking-wider", t.textSubtle)}>Shift</div>
//                 <div className={cn("text-[15px] font-black tabular-nums", t.text)}>{staff.shiftStart} – {staff.shiftEnd}</div>
//               </div>
//             </div>

//             {/* Shift progress */}
//             <div className="mb-5">
//               <div className="mb-2 flex justify-between">
//                 <span className={cn("text-[11px] font-black uppercase tracking-wider", t.textSubtle)}>Shift Progress</span>
//                 <span className="text-[12px] font-black" style={{ color: c0 }}>{pct.toFixed(0)}%</span>
//               </div>
//               <div className={cn("h-2.5 w-full overflow-hidden rounded-full", t.elapsed)}>
//                 <motion.div
//                   className="h-full rounded-full"
//                   style={{ background: `linear-gradient(90deg, ${c0}, ${c1})` }}
//                   initial={{ width: 0 }}
//                   animate={{ width: `${pct}%` }}
//                   transition={{ duration: 1 }}
//                 />
//               </div>
//             </div>

//             {/* Time chips */}
//             <div className="mb-5 grid grid-cols-2 gap-3">
//               {[
//                 { label: "Clock In", value: record.clockIn, color: "text-emerald-400" },
//                 { label: "Clock Out", value: record.clockOut, color: "text-rose-400" },
//                 { label: "Break Start", value: record.breakStart, color: "text-amber-400" },
//                 { label: "Break End", value: record.breakEnd, color: "text-blue-400" },
//               ].map(item => (
//                 <div key={item.label} className={cn("rounded-2xl border px-3 py-2.5", t.chip)}>
//                   <div className={cn("text-[9px] font-black uppercase tracking-widest", t.textSubtle)}>{item.label}</div>
//                   <div className={cn("mt-1 font-mono text-[14px] font-black tabular-nums", item.value ? item.color : t.textSubtle)}>
//                     {item.value ?? "—"}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Elapsed timer */}
//             {(record.status === "in" || record.status === "break") && (
//               <div className={cn("mb-5 flex items-center justify-between rounded-2xl border px-4 py-3", t.chip)}>
//                 <span className={cn("text-[11px] font-black uppercase tracking-wider", t.textSubtle)}>
//                   {record.status === "in" ? "Working Time" : "Break Time"}
//                 </span>
//                 <span className={cn("font-mono text-[20px] font-black tabular-nums", record.status === "in" ? "text-emerald-400" : "text-amber-400")}>
//                   {elapsed}
//                 </span>
//               </div>
//             )}

//             {/* Action Buttons */}
//             <div className="flex gap-3">
//               {record.status !== "done" && (
//                 <button
//                   onClick={onAction}
//                   className={cn("flex-1 flex items-center justify-center gap-2 rounded-2xl px-4 py-4 text-[14px] font-black transition active:scale-[0.98]", cfg.btnCls)}
//                 >
//                   <BtnIcon className="h-4 w-4" />
//                   {cfg.btnLabel}
//                 </button>
//               )}

//               {record.status === "in" && (
//                 <button
//                   onClick={onClockOut}
//                   className="flex items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-4 text-rose-400 transition hover:bg-rose-500/20 active:scale-[0.98]"
//                 >
//                   <LogOut className="h-4 w-4" />
//                 </button>
//               )}

//               {record.status === "done" && (
//                 <div className={cn("flex-1 flex items-center justify-center gap-2 rounded-2xl px-4 py-4 text-[14px] font-black", t.statusDone)}>
//                   <CheckCircle2 className="h-5 w-5" />
//                   Shift Complete
//                 </div>
//               )}
//             </div>

//             {/* Log */}
//             {record.logs.length > 0 && (
//               <div className={cn("mt-4 overflow-hidden rounded-2xl border", t.chip)}>
//                 <div className={cn("border-b px-3 py-2 text-[9px] font-black uppercase tracking-widest", t.textSubtle, t.divider)}>
//                   Activity Log
//                 </div>
//                 <div className="max-h-[120px] overflow-y-auto">
//                   {[...record.logs].reverse().map((log, i) => (
//                     <div key={i} className={cn("flex items-center gap-2 border-b px-3 py-2 text-[10px] last:border-b-0", t.divider)}>
//                       <span className={cn("font-mono tabular-nums", t.textSubtle)}>{log.time}</span>
//                       <span className={cn("font-bold", log.color)}>{log.action}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // ADMIN DASHBOARD
// // ─────────────────────────────────────────────────────────────────────────────
// function AdminDashboard({
//   theme, records, onSwitchToLogin,
// }: {
//   theme: Theme;
//   records: Record<string, PunchRecord>;
//   onSwitchToLogin: () => void;
// }) {
//   const t = tk(theme);
//   const now = useClock();
//   const [filter, setFilter] = React.useState<"all" | PunchStatus>("all");
//   const todayStaff = INITIAL_STAFF.filter(s => s.scheduleToday);

//   const inCount = todayStaff.filter(s => records[s.id].status === "in").length;
//   const breakCount = todayStaff.filter(s => records[s.id].status === "break").length;
//   const outCount = todayStaff.filter(s => records[s.id].status === "out").length;
//   const doneCount = todayStaff.filter(s => records[s.id].status === "done").length;

//   const filtered = todayStaff.filter(s => filter === "all" || records[s.id].status === filter);

//   return (
//     <div className={cn("relative min-h-screen overflow-hidden", t.root)}>
//       <div className={cn("pointer-events-none fixed inset-0", t.grid)} />
//       <div className="absolute -top-24 left-[12%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[110px]" />
//       <div className="absolute right-[-5%] top-[15%] h-[380px] w-[380px] rounded-full bg-violet-500/10 blur-[110px]" />

//       <div className="relative z-10 mx-auto max-w-[1400px] px-5 py-6 md:px-8">
//         {/* Top */}
//         <div className="mb-6 flex items-center justify-between">
//           <div>
//             <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold", t.pill)}>
//               <ClockArrowUp className="h-3.5 w-3.5" />
//               Admin · Attendance Overview
//             </div>
//             <div className={cn("mt-2 text-[22px] font-black", t.text)}>Today's Attendance</div>
//             <div className={cn("text-sm", t.textMuted)}>
//               {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
//             </div>
//           </div>
//           <button
//             onClick={onSwitchToLogin}
//             className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-2.5 text-[13px] font-black text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition"
//           >
//             <LogIn className="h-4 w-4" /> Clock In
//           </button>
//         </div>

//         {/* Stats */}
//         <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//           {[
//             { label: "On Shift", val: inCount, accent: "#10b981", icon: Activity },
//             { label: "On Break", val: breakCount, accent: "#f59e0b", icon: Coffee },
//             { label: "Not In", val: outCount, accent: "#94a3b8", icon: Clock3 },
//             { label: "Done", val: doneCount, accent: "#3b82f6", icon: CheckCircle2 },
//           ].map(({ label, val, accent, icon: Icon }) => (
//             <div key={label} className={cn("rounded-[22px] border p-4", t.cardSoft)}>
//               <div className="flex items-center justify-between">
//                 <div>
//                   <div className={cn("text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>{label}</div>
//                   <div className={cn("mt-1 text-[28px] font-black", t.text)}>
//                     {val}<span className={cn("ml-1 text-sm font-semibold", t.textMuted)}>/ {todayStaff.length}</span>
//                   </div>
//                 </div>
//                 <div className="flex h-11 w-11 items-center justify-center rounded-2xl border"
//                   style={{ borderColor: `${accent}33`, background: `${accent}14`, color: accent }}>
//                   <Icon className="h-5 w-5" />
//                 </div>
//               </div>
//               <div className={cn("mt-3 h-2 w-full overflow-hidden rounded-full", t.elapsed)}>
//                 <div className="h-full rounded-full" style={{ width: `${todayStaff.length ? (val / todayStaff.length) * 100 : 0}%`, background: accent }} />
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Filters */}
//         <div className="mb-4 flex flex-wrap gap-2">
//           {([
//             { key: "all", label: `All (${todayStaff.length})` },
//             { key: "in", label: `On Shift (${inCount})` },
//             { key: "break", label: `Break (${breakCount})` },
//             { key: "out", label: `Not In (${outCount})` },
//             { key: "done", label: `Done (${doneCount})` },
//           ] as const).map(f => (
//             <button key={f.key} onClick={() => setFilter(f.key)}
//               className={cn("rounded-2xl border px-4 py-2 text-[12px] font-bold transition-all", filter === f.key ? t.catActive : t.catInactive)}>
//               {f.label}
//             </button>
//           ))}
//         </div>

//         {/* Staff table */}
//         <div className={cn("overflow-hidden rounded-[24px] border", t.card)}>
//           <div className={cn("grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-4 border-b px-6 py-3 text-[10px] font-black uppercase tracking-widest", t.textSubtle, t.divider)}>
//             <div>Staff</div><div>Status</div><div>Clock In</div><div>Break</div><div>Clock Out</div><div>Shift</div>
//           </div>
//           <div className="divide-y" style={{ borderColor: "transparent" }}>
//             {filtered.map(s => {
//               const r = records[s.id];
//               const cfg = punchCfg[r.status];
//               return (
//                 <div key={s.id} className={cn("grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-6 py-3.5", t.divider)}>
//                   <div className="flex items-center gap-2.5">
//                     <GradAvatar member={s} size="sm" />
//                     <div>
//                       <div className={cn("text-[13px] font-bold", t.text)}>{s.name}</div>
//                       <div className={cn("text-[10px]", t.textSubtle)}>{s.id} · {s.role}</div>
//                     </div>
//                   </div>
//                   <div>
//                     <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold", getStatusCls(theme, r.status))}>
//                       <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot, cfg.pulse && "animate-pulse")} />
//                       {cfg.label}
//                     </span>
//                   </div>
//                   <div className={cn("font-mono text-[12px] text-emerald-400 font-bold", !r.clockIn && t.textSubtle)}>{r.clockIn ?? "—"}</div>
//                   <div className={cn("font-mono text-[12px] text-amber-400 font-bold", !r.breakStart && t.textSubtle)}>{r.breakStart ?? "—"}</div>
//                   <div className={cn("font-mono text-[12px] text-rose-400 font-bold", !r.clockOut && t.textSubtle)}>{r.clockOut ?? "—"}</div>
//                   <div className={cn("text-[12px] font-semibold", t.textMuted)}>{s.shiftStart}–{s.shiftEnd}</div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Day off */}
//         <div className="mt-5">
//           <div className={cn("mb-2 text-[11px] font-black uppercase tracking-widest", t.textSubtle)}>Day Off ဝန်ထမ်းများ</div>
//           <div className="flex flex-wrap gap-2">
//             {INITIAL_STAFF.filter(s => !s.scheduleToday).map(s => (
//               <div key={s.id} className={cn("flex items-center gap-2 rounded-2xl border px-3 py-2 opacity-50", t.chip)}>
//                 <GradAvatar member={s} size="sm" />
//                 <span className={cn("text-[12px] font-bold", t.textMuted)}>{s.name}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className={cn("mt-8 flex items-center justify-between pb-4 text-[11px] font-semibold", t.textSubtle)}>
//           <span>© 2026 BINHLAIG · Time Card Clock Center</span>
//           <span className="inline-flex items-center gap-1.5"><Zap className="h-3 w-3" />framer-motion · v2</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // ROOT
// // ─────────────────────────────────────────────────────────────────────────────
// export default function TimeCardV2() {
//   const [theme, setTheme] = React.useState<Theme>("dark");
//   const [view, setView] = React.useState<View>("login");
//   const [loggedInStaff, setLoggedInStaff] = React.useState<StaffMember | null>(null);
//   const [records, setRecords] = React.useState<Record<string, PunchRecord>>(
//     () => Object.fromEntries(INITIAL_STAFF.map(s => [s.id, initRecord()]))
//   );

//   function handleLogin(staff: StaffMember) {
//     setLoggedInStaff(staff);
//     setView("staff-panel");
//   }

//   function handleLogout() {
//     setLoggedInStaff(null);
//     setView("login");
//   }

//   function handleAction() {
//     if (!loggedInStaff) return;
//     const id = loggedInStaff.id;
//     setRecords(prev => {
//       const r = prev[id];
//       const time = nowStr();
//       const logs = [...r.logs];
//       let update: Partial<PunchRecord> = {};
//       if (r.status === "out") {
//         update = { status: "in", clockIn: time };
//         logs.push({ time, action: "Clocked In", color: "text-emerald-400" });
//       } else if (r.status === "in") {
//         update = { status: "break", breakStart: time };
//         logs.push({ time, action: "Break Started", color: "text-amber-400" });
//       } else if (r.status === "break") {
//         const mins = r.breakStart ? timeDiffMins(r.breakStart, time) : 0;
//         update = { status: "in", breakEnd: time, totalBreakMins: r.totalBreakMins + mins };
//         logs.push({ time, action: "Break Ended", color: "text-blue-400" });
//       }
//       return { ...prev, [id]: { ...r, ...update, logs } };
//     });
//   }

//   function handleClockOut() {
//     if (!loggedInStaff) return;
//     const id = loggedInStaff.id;
//     setRecords(prev => {
//       const r = prev[id];
//       const time = nowStr();
//       return { ...prev, [id]: { ...r, status: "done", clockOut: time, logs: [...r.logs, { time, action: "Clocked Out", color: "text-rose-400" }] } };
//     });
//   }

//   // Theme toggle button (floating)
//   const ThemeBtn = () => {
//     const t = tk(theme);
//     return (
//       <button
//         onClick={() => setTheme(th => th === "dark" ? "light" : "dark")}
//         className={cn("fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-2xl border shadow-xl", t.btn)}
//       >
//         {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//       </button>
//     );
//   };

//   // Admin tab (floating)
//   const AdminBtn = () => {
//     const t = tk(theme);
//     return (
//       <button
//         onClick={() => setView(v => v === "dashboard" ? (loggedInStaff ? "staff-panel" : "login") : "dashboard")}
//         className={cn("fixed bottom-5 left-5 z-50 flex h-10 items-center gap-2 rounded-2xl border px-4 text-[12px] font-bold shadow-xl", t.btn)}
//       >
//         {view === "dashboard" ? <><ArrowLeft className="h-3.5 w-3.5" /> Back</> : <><Users className="h-3.5 w-3.5" /> Admin</>}
//       </button>
//     );
//   };

//   return (
//     <>
//       <ThemeBtn />
//       <AdminBtn />
//       <AnimatePresence mode="wait">
//         {view === "login" && (
//           <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//             <LoginScreen theme={theme} onLogin={handleLogin} />
//           </motion.div>
//         )}
//         {view === "staff-panel" && loggedInStaff && (
//           <motion.div key="panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//             <StaffPunchPanel
//               staff={loggedInStaff}
//               record={records[loggedInStaff.id]}
//               theme={theme}
//               onAction={handleAction}
//               onClockOut={handleClockOut}
//               onLogout={handleLogout}
//             />
//           </motion.div>
//         )}
//         {view === "dashboard" && (
//           <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
//             <AdminDashboard theme={theme} records={records} onSwitchToLogin={() => setView("login")} />
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }





"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Users,
  Clock3,
  Shield,
  Key,
  Store,
  Crown,
  CheckCircle2,
  Coffee,
  Activity,
  ScanLine,
  AlertCircle,
  ChevronRight,
  Fingerprint,
  Eye,
  EyeOff,
  X,
  ArrowLeft,
  BadgeCheck,
  ClockArrowUp,
  MapPin,
  CalendarDays,
  TimerReset,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type Theme = "dark" | "light";
type PunchStatus = "out" | "in" | "break" | "done";
type View = "login" | "dashboard" | "staff-panel";

type StaffMember = {
  id: string;
  name: string;
  role: string;
  branch: string;
  grad: [string, string];
  accent: string;
  email: string;
  phone: string;
  joined: string;
  pin: string;
  scheduleToday: boolean;
  shiftStart: string;
  shiftEnd: string;
};

type PunchRecord = {
  status: PunchStatus;
  clockIn: string | null;
  clockOut: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  totalBreakMins: number;
  logs: { time: string; action: string; color: string }[];
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const INITIAL_STAFF: StaffMember[] = [
  {
    id: "ST-001",
    name: "Sai Aung",
    role: "Admin",
    branch: "Main",
    grad: ["#3b82f6", "#06b6d4"],
    accent: "#3b82f6",
    email: "saiaung@binhlaig.com",
    phone: "+95 9 111 222 33",
    joined: "2023-01",
    pin: "1234",
    scheduleToday: true,
    shiftStart: "09:00",
    shiftEnd: "18:00",
  },
  {
    id: "ST-002",
    name: "Ma Thida",
    role: "Manager",
    branch: "Branch A",
    grad: ["#8b5cf6", "#ec4899"],
    accent: "#8b5cf6",
    email: "mathida@binhlaig.com",
    phone: "+95 9 222 333 44",
    joined: "2023-04",
    pin: "2345",
    scheduleToday: true,
    shiftStart: "08:30",
    shiftEnd: "17:30",
  },
  {
    id: "ST-003",
    name: "Ko Kyaw",
    role: "Cashier",
    branch: "Main",
    grad: ["#10b981", "#14b8a6"],
    accent: "#10b981",
    email: "kokyaw@binhlaig.com",
    phone: "+95 9 333 444 55",
    joined: "2024-02",
    pin: "3456",
    scheduleToday: true,
    shiftStart: "10:00",
    shiftEnd: "19:00",
  },
  {
    id: "ST-004",
    name: "Su Myat",
    role: "Cashier",
    branch: "Branch B",
    grad: ["#f43f5e", "#fb7185"],
    accent: "#f43f5e",
    email: "sumyat@binhlaig.com",
    phone: "+95 9 444 555 66",
    joined: "2024-05",
    pin: "4567",
    scheduleToday: false,
    shiftStart: "09:00",
    shiftEnd: "18:00",
  },
  {
    id: "ST-005",
    name: "Htet Lin",
    role: "Stock",
    branch: "Main",
    grad: ["#f59e0b", "#f97316"],
    accent: "#f59e0b",
    email: "htetlin@binhlaig.com",
    phone: "+95 9 555 666 77",
    joined: "2023-09",
    pin: "5678",
    scheduleToday: true,
    shiftStart: "07:00",
    shiftEnd: "16:00",
  },
  {
    id: "ST-006",
    name: "Aye Aye",
    role: "Manager",
    branch: "Branch B",
    grad: ["#6366f1", "#3b82f6"],
    accent: "#6366f1",
    email: "ayeaye@binhlaig.com",
    phone: "+95 9 666 777 88",
    joined: "2023-06",
    pin: "6789",
    scheduleToday: false,
    shiftStart: "09:00",
    shiftEnd: "18:00",
  },
  {
    id: "ST-007",
    name: "Naing Zaw",
    role: "Cashier",
    branch: "Online",
    grad: ["#0d9488", "#06b6d4"],
    accent: "#0d9488",
    email: "naingzaw@binhlaig.com",
    phone: "+95 9 777 888 99",
    joined: "2024-08",
    pin: "7890",
    scheduleToday: true,
    shiftStart: "12:00",
    shiftEnd: "21:00",
  },
  {
    id: "ST-008",
    name: "Win Myint",
    role: "Stock",
    branch: "Branch A",
    grad: ["#ea580c", "#eab308"],
    accent: "#ea580c",
    email: "winmyint@binhlaig.com",
    phone: "+95 9 888 999 00",
    joined: "2023-11",
    pin: "8901",
    scheduleToday: true,
    shiftStart: "08:00",
    shiftEnd: "17:00",
  },
];

function initRecord(): PunchRecord {
  return {
    status: "out",
    clockIn: null,
    clockOut: null,
    breakStart: null,
    breakEnd: null,
    totalBreakMins: 0,
    logs: [],
  };
}

function nowStr() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

function timeDiffMins(from: string, to: string): number {
  const [fh, fm, fs] = from.split(":").map(Number);
  const [th, tm, ts] = to.split(":").map(Number);
  return Math.floor(
    ((th * 3600 + tm * 60 + (ts || 0)) -
      (fh * 3600 + fm * 60 + (fs || 0))) /
      60
  );
}

function timeToDate(time: string) {
  const [h, m, s] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, s ?? 0, 0);
  return d;
}

// ─────────────────────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────────────────────
const tk = (theme: Theme) =>
  theme === "dark"
    ? {
        root: "bg-[#050816] text-white",
        text: "text-white",
        textMuted: "text-white/65",
        textSubtle: "text-white/35",
        card: "border-white/[0.08] bg-white/[0.05] backdrop-blur-2xl",
        cardSoft: "border-white/[0.08] bg-white/[0.035] backdrop-blur-xl",
        pill: "border-white/[0.08] bg-white/[0.05] text-white/80",
        btn: "border-white/10 bg-white/[0.06] text-white/85 hover:bg-white/[0.12]",
        input:
          "border-white/10 bg-white/[0.06] text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20",
        divider: "border-white/[0.08]",
        grid: "[background-image:linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] [background-size:44px_44px]",
        chip: "bg-white/[0.05] border-white/[0.07]",
        elapsed: "bg-white/[0.08]",
        statusOut: "bg-slate-500/10 border-slate-500/20 text-slate-300",
        statusIn: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
        statusBreak: "bg-amber-500/10 border-amber-500/20 text-amber-300",
        statusDone: "bg-blue-500/10 border-blue-500/20 text-blue-300",
        catActive: "border-white/20 bg-white/[0.14] text-white",
        catInactive:
          "border-white/[0.07] bg-white/[0.03] text-white/55 hover:bg-white/[0.07]",
        loginCard: "border-white/10 bg-white/[0.04] backdrop-blur-3xl",
        pinBtn: "border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.14]",
        pinDisplay: "border-white/10 bg-black/30",
        errorBg: "bg-rose-500/10 border-rose-500/20 text-rose-300",
        successBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
        warningBg: "bg-amber-500/10 border-amber-500/20 text-amber-300",
      }
    : {
        root: "bg-[#eef3fa] text-slate-900",
        text: "text-slate-900",
        textMuted: "text-slate-600",
        textSubtle: "text-slate-400",
        card: "border-slate-200 bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(15,23,42,0.06)]",
        cardSoft:
          "border-slate-200 bg-white/80 backdrop-blur-xl shadow-[0_6px_24px_rgba(15,23,42,0.05)]",
        pill: "border-slate-200 bg-white text-slate-700",
        btn: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
        input:
          "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300",
        divider: "border-slate-200",
        grid: "[background-image:linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] [background-size:44px_44px]",
        chip: "bg-slate-50 border-slate-200",
        elapsed: "bg-slate-100",
        statusOut: "bg-slate-100 border-slate-200 text-slate-600",
        statusIn: "bg-emerald-50 border-emerald-200 text-emerald-600",
        statusBreak: "bg-amber-50 border-amber-200 text-amber-600",
        statusDone: "bg-blue-50 border-blue-200 text-blue-600",
        catActive: "border-slate-900 bg-slate-900 text-white",
        catInactive: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
        loginCard:
          "border-slate-200 bg-white/80 backdrop-blur-xl shadow-[0_24px_80px_rgba(15,23,42,0.10)]",
        pinBtn: "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 shadow-sm",
        pinDisplay: "border-slate-200 bg-slate-50",
        errorBg: "bg-rose-50 border-rose-200 text-rose-600",
        successBg: "bg-emerald-50 border-emerald-200 text-emerald-600",
        warningBg: "bg-amber-50 border-amber-200 text-amber-600",
      };

const punchCfg = {
  out: {
    label: "Not In",
    dot: "bg-slate-400",
    pulse: false,
    btnLabel: "Clock In",
    btnCls:
      "bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20",
    btnIcon: LogIn,
  },
  in: {
    label: "On Shift",
    dot: "bg-emerald-400",
    pulse: true,
    btnLabel: "Take Break",
    btnCls:
      "bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20",
    btnIcon: Coffee,
  },
  break: {
    label: "On Break",
    dot: "bg-amber-400",
    pulse: true,
    btnLabel: "Resume",
    btnCls:
      "bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20",
    btnIcon: Activity,
  },
  done: {
    label: "Done",
    dot: "bg-blue-400",
    pulse: false,
    btnLabel: "Completed",
    btnCls: "bg-slate-500 text-white opacity-60",
    btnIcon: CheckCircle2,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS / HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function useElapsed(fromStr: string | null): string {
  const [elapsed, setElapsed] = React.useState("00:00:00");

  React.useEffect(() => {
    if (!fromStr) {
      setElapsed("00:00:00");
      return;
    }

    const tick = () => {
      const start = timeToDate(fromStr);
      const diff = Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000));
      setElapsed(
        `${String(Math.floor(diff / 3600)).padStart(2, "0")}:${String(
          Math.floor((diff % 3600) / 60)
        ).padStart(2, "0")}:${String(diff % 60).padStart(2, "0")}`
      );
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [fromStr]);

  return elapsed;
}

function useClock() {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function RoleIcon({
  role,
  className,
}: {
  role: string;
  className?: string;
}) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    Admin: Crown,
    Manager: Shield,
    Cashier: Key,
    Stock: Store,
  };
  const Icon = icons[role] ?? Users;
  return <Icon className={className} />;
}

function GradAvatar({
  member,
  size = "lg",
}: {
  member: StaffMember;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const initials = member.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const [c0, c1] = member.grad;
  const sz = {
    sm: "h-9 w-9 text-[11px]",
    md: "h-12 w-12 text-[13px]",
    lg: "h-[72px] w-[72px] text-[22px]",
    xl: "h-24 w-24 text-[30px]",
  }[size];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl font-black text-white",
        sz
      )}
      style={{ background: `linear-gradient(135deg, ${c0}, ${c1})` }}
    >
      {initials}
    </div>
  );
}

function getStatusCls(theme: Theme, status: PunchStatus) {
  const t = tk(theme);
  return {
    out: t.statusOut,
    in: t.statusIn,
    break: t.statusBreak,
    done: t.statusDone,
  }[status];
}

function getWorkedMinutes(record: PunchRecord) {
  if (!record.clockIn) return 0;
  const start = timeToDate(record.clockIn).getTime();
  const end = record.clockOut ? timeToDate(record.clockOut).getTime() : Date.now();
  return Math.max(0, Math.floor((end - start) / 60000) - record.totalBreakMins);
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED CLOCK UI
// ─────────────────────────────────────────────────────────────────────────────
function LiveClock({
  theme,
  large = false,
}: {
  theme: Theme;
  large?: boolean;
}) {
  const now = useClock();
  const t = tk(theme);

  const H = String(now.getHours()).padStart(2, "0");
  const M = String(now.getMinutes()).padStart(2, "0");
  const S = String(now.getSeconds()).padStart(2, "0");

  return (
    <div className="flex items-end gap-1 tabular-nums">
      <span
        className={cn(
          large
            ? "text-[84px] md:text-[110px]"
            : "text-[52px] md:text-[60px]",
          "font-black leading-none tracking-[-0.06em]",
          t.text
        )}
      >
        {H}
      </span>
      <span
        className={cn(
          large ? "pb-2 text-[42px]" : "pb-1 text-[28px]",
          "font-black opacity-40",
          t.text
        )}
      >
        :
      </span>
      <span
        className={cn(
          large
            ? "text-[84px] md:text-[110px]"
            : "text-[52px] md:text-[60px]",
          "font-black leading-none tracking-[-0.06em]",
          t.text
        )}
      >
        {M}
      </span>
      <span
        className={cn(
          large ? "pb-3 text-[24px]" : "pb-2 text-[18px]",
          "font-bold tabular-nums",
          t.textMuted
        )}
      >
        {S}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function LoginScreen({
  theme,
  onLogin,
}: {
  theme: Theme;
  onLogin: (staff: StaffMember) => void;
}) {
  const t = tk(theme);
  const now = useClock();

  const [idInput, setIdInput] = React.useState("");
  const [foundStaff, setFoundStaff] = React.useState<StaffMember | null>(null);
  const [pin, setPin] = React.useState("");
  const [showPin, setShowPin] = React.useState(false);
  const [error, setError] = React.useState("");
  const [step, setStep] = React.useState<"id" | "pin">("id");
  const [shake, setShake] = React.useState(false);

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  function handleFindStaff() {
    const raw = idInput.trim();
    const q = raw.toUpperCase();

    const staff = INITIAL_STAFF.find(
      (s) =>
        s.id === q ||
        s.name.toLowerCase() === raw.toLowerCase() ||
        s.name.toLowerCase().includes(raw.toLowerCase())
    );

    if (!staff) {
      setError("Staff ID / Name မတွေ့ပါ");
      triggerShake();
      return;
    }

    if (!staff.scheduleToday) {
      setError(`${staff.name} — ယနေ့ shift မရှိပါ (Day Off)`);
      triggerShake();
      return;
    }

    setFoundStaff(staff);
    setError("");
    setPin("");
    setStep("pin");
  }

  function verifyPin(nextPin: string) {
    if (!foundStaff) return;

    if (nextPin === foundStaff.pin) {
      setError("");
      onLogin(foundStaff);
      return;
    }

    setError("PIN မှားနေပါသည်");
    setPin("");
    triggerShake();
  }

  function handlePinKey(k: string) {
    if (k === "DEL") {
      setPin((p) => p.slice(0, -1));
      return;
    }

    if (pin.length >= 4) return;

    const next = pin + k;
    setPin(next);

    if (next.length === 4) {
      setTimeout(() => verifyPin(next), 180);
    }
  }

  function handleBack() {
    setStep("id");
    setFoundStaff(null);
    setPin("");
    setShowPin(false);
    setError("");
    setIdInput("");
  }

  const scheduled = INITIAL_STAFF.filter((s) => s.scheduleToday);
  const dayOff = INITIAL_STAFF.filter((s) => !s.scheduleToday);

  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden px-4 py-8",
        t.root
      )}
    >
      <div className={cn("pointer-events-none fixed inset-0", t.grid)} />
      <div className="absolute -top-32 left-[12%] h-[460px] w-[460px] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="absolute right-[6%] top-[16%] h-[420px] w-[420px] rounded-full bg-violet-500/12 blur-[120px]" />
      <div className="absolute bottom-[-8%] left-[34%] h-[380px] w-[380px] rounded-full bg-emerald-500/10 blur-[110px]" />

      <div className="relative z-10 mx-auto max-w-[1180px]">
        <div className="mb-6 flex items-center justify-between">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold",
              t.pill
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            BINHLAIG · Time Card
          </div>

          <div className={cn("text-[11px] font-semibold", t.textSubtle)}>
            {dateStr}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          {/* Left: Big Clock */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={cn(
              "relative overflow-hidden rounded-[32px] border p-7 md:p-10",
              t.card
            )}
          >
            <div className="absolute inset-0">
              <div className="absolute left-10 top-10 h-52 w-52 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="absolute right-0 top-8 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
            </div>

            <div className="relative z-10">
              <div
                className={cn(
                  "mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold",
                  t.pill
                )}
              >
                <Clock3 className="h-3.5 w-3.5" />
                Clock Main
              </div>

              <h1
                className={cn(
                  "text-[30px] font-black tracking-tight md:text-[48px]",
                  t.text
                )}
              >
                Time Card Clock Center
              </h1>

              <p className={cn("mt-3 max-w-xl text-sm md:text-base", t.textMuted)}>
                Staff ID သို့မဟုတ် name ဖြင့်ရှာပြီး PIN ဖြင့်ဝင်ရောက်ပါ။
                ဒီ screen ကို clock main အဖြစ်ထားပြီး staff punch flow ကိုမြန်မြန်သုံးနိုင်အောင် ပြင်ထားပါတယ်။
              </p>

              <div className="mt-8">
                <LiveClock theme={theme} large />
              </div>

              <div className={cn("mt-3 text-sm font-semibold", t.textMuted)}>
                {dateStr}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: Fingerprint,
                    title: "ID + PIN",
                    desc: "Secure staff check-in",
                  },
                  {
                    icon: Activity,
                    title: "Real-time punch",
                    desc: "In / Break / Resume / Out",
                  },
                  {
                    icon: Users,
                    title: "Staff flow",
                    desc: "Fast daily attendance",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className={cn("rounded-2xl border p-4", t.chip)}>
                      <Icon className={cn("mb-2 h-4 w-4", t.textMuted)} />
                      <div className={cn("text-[12px] font-black", t.text)}>
                        {item.title}
                      </div>
                      <div className={cn("mt-1 text-[11px]", t.textSubtle)}>
                        {item.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Right: Login Card */}
          <motion.div
            animate={shake ? { x: [-8, 8, -8, 8, 0] } : { x: 0 }}
            transition={{ duration: 0.35 }}
            className={cn("rounded-[30px] border p-6 md:p-8", t.loginCard)}
          >
            <AnimatePresence mode="wait">
              {step === "id" ? (
                <motion.div
                  key="id-step"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/15">
                      <Fingerprint className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className={cn("text-[16px] font-black", t.text)}>
                        Staff Login
                      </div>
                      <div className={cn("text-[12px]", t.textMuted)}>
                        ID သို့မဟုတ် Name ထည့်ပြီး Find နှိပ်ပါ
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div
                      className={cn(
                        "mb-4 flex items-center gap-2 rounded-2xl border px-4 py-3 text-[12px] font-semibold",
                        t.errorBg
                      )}
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <ScanLine
                        className={cn(
                          "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
                          t.textSubtle
                        )}
                      />
                      <input
                        value={idInput}
                        onChange={(e) => {
                          setIdInput(e.target.value);
                          setError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleFindStaff()}
                        placeholder="ST-001 / Sai Aung"
                        className={cn(
                          "h-12 w-full rounded-2xl border pl-10 pr-4 text-sm font-semibold",
                          t.input
                        )}
                        autoFocus
                      />
                    </div>

                    <button
                      onClick={handleFindStaff}
                      className="h-12 rounded-2xl bg-cyan-500 px-5 text-sm font-black text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-6">
                    <div
                      className={cn(
                        "mb-3 text-[11px] font-black uppercase tracking-widest",
                        t.textSubtle
                      )}
                    >
                      Today Scheduled Staff
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {scheduled.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setIdInput(s.id);
                            setError("");
                          }}
                          className={cn(
                            "flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left transition hover:scale-[1.02]",
                            t.chip
                          )}
                        >
                          <GradAvatar member={s} size="sm" />
                          <div className="min-w-0">
                            <div className={cn("truncate text-[11px] font-bold", t.text)}>
                              {s.name}
                            </div>
                            <div className={cn("text-[10px]", t.textSubtle)}>
                              {s.shiftStart}–{s.shiftEnd}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {dayOff.length > 0 && (
                    <div className="mt-5">
                      <div
                        className={cn(
                          "mb-2 text-[11px] font-black uppercase tracking-widest",
                          t.textSubtle
                        )}
                      >
                        Day Off
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {dayOff.map((s) => (
                          <div
                            key={s.id}
                            className={cn(
                              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 opacity-60",
                              t.chip
                            )}
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            <span className={cn("text-[10px] font-semibold", t.textMuted)}>
                              {s.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="pin-step"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <button
                    onClick={handleBack}
                    className={cn(
                      "mb-5 flex items-center gap-2 text-[12px] font-bold transition hover:opacity-70",
                      t.textMuted
                    )}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>

                  {foundStaff && (
                    <div className="mb-6 flex items-center gap-3">
                      <GradAvatar member={foundStaff} size="md" />
                      <div className="min-w-0">
                        <div className={cn("truncate text-[16px] font-black", t.text)}>
                          {foundStaff.name}
                        </div>
                        <div className={cn("text-[12px]", t.textMuted)}>
                          {foundStaff.id} · {foundStaff.role} · {foundStaff.branch}
                        </div>
                        <div
                          className={cn(
                            "mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
                            t.successBg
                          )}
                        >
                          <Clock3 className="h-3 w-3" />
                          {foundStaff.shiftStart} – {foundStaff.shiftEnd}
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div
                      className={cn(
                        "mb-4 flex items-center gap-2 rounded-2xl border px-4 py-3 text-[12px] font-semibold",
                        t.errorBg
                      )}
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div
                    className={cn(
                      "mb-4 flex items-center justify-between rounded-2xl border px-4 py-3",
                      t.pinDisplay
                    )}
                  >
                    <div className="flex gap-3">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-3.5 w-3.5 rounded-full border-2 transition-all duration-150",
                            i < pin.length
                              ? "scale-110 border-cyan-400 bg-cyan-400"
                              : theme === "dark"
                              ? "border-white/20"
                              : "border-slate-300"
                          )}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => setShowPin((v) => !v)}
                      className={cn("transition hover:opacity-70", t.textMuted)}
                    >
                      {showPin ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {showPin && (
                    <div
                      className={cn(
                        "mb-4 rounded-2xl border px-4 py-2 text-center font-mono text-lg font-black tracking-widest",
                        t.chip,
                        t.text
                      )}
                    >
                      {(pin || "").padEnd(4, "·")}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "DEL"].map(
                      (k, i) => {
                        if (k === "") return <div key={i} />;

                        return (
                          <button
                            key={k}
                            onClick={() => handlePinKey(k)}
                            className={cn(
                              "flex h-14 items-center justify-center rounded-2xl border text-[18px] font-black transition active:scale-95",
                              k === "DEL"
                                ? "border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/15"
                                : t.pinBtn
                            )}
                          >
                            {k === "DEL" ? <X className="h-5 w-5" /> : k}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <div className={cn("mt-4 text-center text-[11px]", t.textSubtle)}>
                    PIN 4 လုံးထည့်ပြီးတာနဲ့ auto verify လုပ်ပါမယ်
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAFF PANEL
// ─────────────────────────────────────────────────────────────────────────────
function StaffPunchPanel({
  staff,
  record,
  theme,
  onAction,
  onClockOut,
  onLogout,
}: {
  staff: StaffMember;
  record: PunchRecord;
  theme: Theme;
  onAction: () => void;
  onClockOut: () => void;
  onLogout: () => void;
}) {
  const t = tk(theme);
  const cfg = punchCfg[record.status];
  const BtnIcon = cfg.btnIcon;

  const elapsed = useElapsed(
    record.status === "in"
      ? record.clockIn
      : record.status === "break"
      ? record.breakStart
      : null
  );

  const shiftMins = timeDiffMins(staff.shiftStart + ":00", staff.shiftEnd + ":00");
  const workedMins = getWorkedMinutes(record);
  const pct = shiftMins > 0 ? Math.min((workedMins / shiftMins) * 100, 100) : 0;

  const [c0, c1] = staff.grad;

  return (
    <div className={cn("relative min-h-screen overflow-hidden px-4 py-8", t.root)}>
      <div className={cn("pointer-events-none fixed inset-0", t.grid)} />
      <div
        className="absolute -top-20 left-[10%] h-[400px] w-[400px] rounded-full blur-[100px]"
        style={{ background: `${c0}18` }}
      />
      <div
        className="absolute bottom-[8%] right-[5%] h-[350px] w-[350px] rounded-full blur-[100px]"
        style={{ background: `${c1}16` }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 mx-auto max-w-[1120px]"
      >
        <div className="mb-6 flex items-center justify-between">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold",
              t.pill
            )}
          >
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" />
            Authenticated
          </div>

          <button
            onClick={onLogout}
            className={cn(
              "flex items-center gap-2 rounded-2xl border px-4 py-2 text-[12px] font-bold transition",
              t.btn
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left main card */}
          <div className={cn("overflow-hidden rounded-[30px] border", t.card)}>
            <div
              className="relative h-[180px] overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${c0}22, ${c1}18)` }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="h-32 w-32 rounded-full border opacity-10"
                  style={{ borderColor: c0 }}
                />
                <div
                  className="absolute h-52 w-52 rounded-full border opacity-10"
                  style={{ borderColor: c1 }}
                />
              </div>

              <div
                className="absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl opacity-25"
                style={{ background: c0 }}
              />

              <div className="absolute right-4 top-4">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold backdrop-blur-sm",
                    getStatusCls(theme, record.status)
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      cfg.dot,
                      cfg.pulse && "animate-pulse"
                    )}
                  />
                  {cfg.label}
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-5 flex items-end justify-center gap-4">
                <GradAvatar member={staff} size="lg" />
                <div className="pb-1">
                  <div className="text-[21px] font-black text-white drop-shadow-sm">
                    {staff.name}
                  </div>
                  <div className="text-[12px] font-semibold text-white/70">
                    {staff.id} · {staff.role} · {staff.branch}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <LiveClock theme={theme} />
                <div className="text-right">
                  <div
                    className={cn(
                      "text-[11px] font-black uppercase tracking-wider",
                      t.textSubtle
                    )}
                  >
                    Shift
                  </div>
                  <div className={cn("text-[15px] font-black tabular-nums", t.text)}>
                    {staff.shiftStart} – {staff.shiftEnd}
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <div className="mb-2 flex justify-between">
                  <span
                    className={cn(
                      "text-[11px] font-black uppercase tracking-wider",
                      t.textSubtle
                    )}
                  >
                    Shift Progress
                  </span>
                  <span className="text-[12px] font-black" style={{ color: c0 }}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className={cn("h-2.5 w-full overflow-hidden rounded-full", t.elapsed)}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${c0}, ${c1})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3">
                {[
                  { label: "Clock In", value: record.clockIn, color: "text-emerald-400" },
                  { label: "Clock Out", value: record.clockOut, color: "text-rose-400" },
                  { label: "Break Start", value: record.breakStart, color: "text-amber-400" },
                  { label: "Break End", value: record.breakEnd, color: "text-blue-400" },
                ].map((item) => (
                  <div key={item.label} className={cn("rounded-2xl border px-3 py-2.5", t.chip)}>
                    <div
                      className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        t.textSubtle
                      )}
                    >
                      {item.label}
                    </div>
                    <div
                      className={cn(
                        "mt-1 font-mono text-[14px] font-black tabular-nums",
                        item.value ? item.color : t.textSubtle
                      )}
                    >
                      {item.value ?? "—"}
                    </div>
                  </div>
                ))}
              </div>

              {(record.status === "in" || record.status === "break") && (
                <div className={cn("mb-5 flex items-center justify-between rounded-2xl border px-4 py-3", t.chip)}>
                  <span
                    className={cn(
                      "text-[11px] font-black uppercase tracking-wider",
                      t.textSubtle
                    )}
                  >
                    {record.status === "in" ? "Working Time" : "Break Time"}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[20px] font-black tabular-nums",
                      record.status === "in" ? "text-emerald-400" : "text-amber-400"
                    )}
                  >
                    {elapsed}
                  </span>
                </div>
              )}

              <div className="flex gap-3">
                {record.status !== "done" && (
                  <button
                    onClick={onAction}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-4 text-[14px] font-black transition active:scale-[0.98]",
                      cfg.btnCls
                    )}
                  >
                    <BtnIcon className="h-4 w-4" />
                    {cfg.btnLabel}
                  </button>
                )}

                {record.status === "in" && (
                  <button
                    onClick={onClockOut}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-4 text-rose-400 transition hover:bg-rose-500/20 active:scale-[0.98]"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}

                {record.status === "done" && (
                  <div
                    className={cn(
                      "flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-4 text-[14px] font-black",
                      t.statusDone
                    )}
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Shift Complete
                  </div>
                )}
              </div>

              {record.logs.length > 0 && (
                <div className={cn("mt-5 overflow-hidden rounded-2xl border", t.chip)}>
                  <div
                    className={cn(
                      "border-b px-3 py-2 text-[9px] font-black uppercase tracking-widest",
                      t.textSubtle
                    )}
                  >
                    Activity Log
                  </div>
                  <div className="max-h-[150px] overflow-y-auto">
                    {[...record.logs].reverse().map((log, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-2 border-b px-3 py-2 text-[10px] last:border-b-0",
                          t.divider
                        )}
                      >
                        <span className={cn("font-mono tabular-nums", t.textSubtle)}>
                          {log.time}
                        </span>
                        <span className={cn("font-bold", log.color)}>{log.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right info panel */}
          <div className="space-y-5">
            <div className={cn("rounded-[28px] border p-5", t.cardSoft)}>
              <div className={cn("mb-4 text-[13px] font-bold", t.text)}>
                Staff Info
              </div>

              <div className="flex items-center gap-3">
                <GradAvatar member={staff} size="md" />
                <div className="min-w-0">
                  <div className={cn("truncate text-[15px] font-black", t.text)}>
                    {staff.name}
                  </div>
                  <div className={cn("text-[11px]", t.textMuted)}>
                    {staff.id} · {staff.role}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className={cn("flex items-center gap-2 text-[12px]", t.textMuted)}>
                  <MapPin className="h-4 w-4 shrink-0" />
                  {staff.branch}
                </div>
                <div className={cn("flex items-center gap-2 text-[12px]", t.textMuted)}>
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  Joined {staff.joined}
                </div>
                <div className={cn("flex items-center gap-2 text-[12px]", t.textMuted)}>
                  <RoleIcon role={staff.role} className="h-4 w-4 shrink-0" />
                  {staff.role}
                </div>
              </div>
            </div>

            <div className={cn("rounded-[28px] border p-5", t.cardSoft)}>
              <div className={cn("mb-4 text-[13px] font-bold", t.text)}>
                Today Summary
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={cn("rounded-2xl border p-3", t.chip)}>
                  <div className={cn("text-[10px] font-black uppercase tracking-widest", t.textSubtle)}>
                    Worked
                  </div>
                  <div className={cn("mt-1 text-[20px] font-black", t.text)}>
                    {Math.floor(workedMins / 60)}h {workedMins % 60}m
                  </div>
                </div>

                <div className={cn("rounded-2xl border p-3", t.chip)}>
                  <div className={cn("text-[10px] font-black uppercase tracking-widest", t.textSubtle)}>
                    Break Total
                  </div>
                  <div className={cn("mt-1 text-[20px] font-black", t.text)}>
                    {record.totalBreakMins}m
                  </div>
                </div>
              </div>

              <div className={cn("mt-3 rounded-2xl border p-3", t.chip)}>
                <div className={cn("text-[10px] font-black uppercase tracking-widest", t.textSubtle)}>
                  Current State
                </div>
                <div className={cn("mt-1 text-[14px] font-black", t.text)}>
                  {cfg.label}
                </div>
              </div>
            </div>

            <div className={cn("rounded-[28px] border p-5", t.cardSoft)}>
              <div className={cn("mb-4 text-[13px] font-bold", t.text)}>
                Quick Notes
              </div>

              <div className="space-y-3">
                <div className={cn("flex items-start gap-2 rounded-2xl border p-3 text-[12px]", t.chip)}>
                  <TimerReset className="mt-0.5 h-4 w-4 shrink-0" />
                  Clock In → Take Break → Resume → Clock Out flow နဲ့သုံးနိုင်ပါတယ်။
                </div>
                <div className={cn("flex items-start gap-2 rounded-2xl border p-3 text-[12px]", t.chip)}>
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0" />
                  Progress bar က shift time နဲ့ worked time ကိုအခြေခံထားပါတယ်။
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function AdminDashboard({
  theme,
  records,
  onSwitchToLogin,
}: {
  theme: Theme;
  records: Record<string, PunchRecord>;
  onSwitchToLogin: () => void;
}) {
  const t = tk(theme);
  const now = useClock();
  const [filter, setFilter] = React.useState<"all" | PunchStatus>("all");

  const todayStaff = INITIAL_STAFF.filter((s) => s.scheduleToday);

  const inCount = todayStaff.filter((s) => records[s.id].status === "in").length;
  const breakCount = todayStaff.filter((s) => records[s.id].status === "break").length;
  const outCount = todayStaff.filter((s) => records[s.id].status === "out").length;
  const doneCount = todayStaff.filter((s) => records[s.id].status === "done").length;

  const filtered = todayStaff.filter(
    (s) => filter === "all" || records[s.id].status === filter
  );

  return (
    <div className={cn("relative min-h-screen overflow-hidden", t.root)}>
      <div className={cn("pointer-events-none fixed inset-0", t.grid)} />
      <div className="absolute -top-24 left-[10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[110px]" />
      <div className="absolute right-[-5%] top-[15%] h-[380px] w-[380px] rounded-full bg-violet-500/10 blur-[110px]" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 py-6 md:px-8">
        <div className="mb-6 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold",
                t.pill
              )}
            >
              <ClockArrowUp className="h-3.5 w-3.5" />
              Admin · Attendance Overview
            </div>

            <div className={cn("mt-3 text-[26px] font-black", t.text)}>
              Today's Attendance
            </div>
            <div className={cn("mt-1 text-sm", t.textMuted)}>
              {now.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={cn("rounded-[24px] border px-5 py-3", t.cardSoft)}>
              <LiveClock theme={theme} />
            </div>
            <button
              onClick={onSwitchToLogin}
              className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-[13px] font-black text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
            >
              <LogIn className="h-4 w-4" />
              Clock In
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "On Shift", val: inCount, accent: "#10b981", icon: Activity },
            { label: "On Break", val: breakCount, accent: "#f59e0b", icon: Coffee },
            { label: "Not In", val: outCount, accent: "#94a3b8", icon: Clock3 },
            { label: "Done", val: doneCount, accent: "#3b82f6", icon: CheckCircle2 },
          ].map(({ label, val, accent, icon: Icon }) => (
            <div key={label} className={cn("rounded-[24px] border p-4", t.cardSoft)}>
              <div className="flex items-center justify-between">
                <div>
                  <div
                    className={cn(
                      "text-[11px] font-bold uppercase tracking-wider",
                      t.textSubtle
                    )}
                  >
                    {label}
                  </div>
                  <div className={cn("mt-1 text-[28px] font-black", t.text)}>
                    {val}
                    <span className={cn("ml-1 text-sm font-semibold", t.textMuted)}>
                      / {todayStaff.length}
                    </span>
                  </div>
                </div>

                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border"
                  style={{
                    borderColor: `${accent}33`,
                    background: `${accent}14`,
                    color: accent,
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className={cn("mt-3 h-2 w-full overflow-hidden rounded-full", t.elapsed)}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${todayStaff.length ? (val / todayStaff.length) * 100 : 0}%`,
                    background: accent,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {([
            { key: "all", label: `All (${todayStaff.length})` },
            { key: "in", label: `On Shift (${inCount})` },
            { key: "break", label: `Break (${breakCount})` },
            { key: "out", label: `Not In (${outCount})` },
            { key: "done", label: `Done (${doneCount})` },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-2xl border px-4 py-2 text-[12px] font-bold transition-all",
                filter === f.key ? t.catActive : t.catInactive
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className={cn("overflow-hidden rounded-[28px] border", t.card)}>
          <div
            className={cn(
              "grid grid-cols-[2.2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 border-b px-6 py-3 text-[10px] font-black uppercase tracking-widest",
              t.textSubtle,
              t.divider
            )}
          >
            <div>Staff</div>
            <div>Status</div>
            <div>Clock In</div>
            <div>Break Start</div>
            <div>Break End</div>
            <div>Clock Out</div>
            <div>Shift</div>
          </div>

          <div>
            {filtered.map((s) => {
              const r = records[s.id];
              const cfg = punchCfg[r.status];

              return (
                <div
                  key={s.id}
                  className={cn(
                    "grid grid-cols-[2.2fr_1fr_1fr_1fr_1fr_1fr_1fr] items-center gap-4 border-b px-6 py-3.5 last:border-b-0",
                    t.divider
                  )}
                >
                  <div className="flex items-center gap-3">
                    <GradAvatar member={s} size="sm" />
                    <div className="min-w-0">
                      <div className={cn("truncate text-[13px] font-bold", t.text)}>
                        {s.name}
                      </div>
                      <div className={cn("text-[10px]", t.textSubtle)}>
                        {s.id} · {s.role} · {s.branch}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
                        getStatusCls(theme, r.status)
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          cfg.dot,
                          cfg.pulse && "animate-pulse"
                        )}
                      />
                      {cfg.label}
                    </span>
                  </div>

                  <div
                    className={cn(
                      "font-mono text-[12px] font-bold text-emerald-400",
                      !r.clockIn && t.textSubtle
                    )}
                  >
                    {r.clockIn ?? "—"}
                  </div>
                  <div
                    className={cn(
                      "font-mono text-[12px] font-bold text-amber-400",
                      !r.breakStart && t.textSubtle
                    )}
                  >
                    {r.breakStart ?? "—"}
                  </div>
                  <div
                    className={cn(
                      "font-mono text-[12px] font-bold text-blue-400",
                      !r.breakEnd && t.textSubtle
                    )}
                  >
                    {r.breakEnd ?? "—"}
                  </div>
                  <div
                    className={cn(
                      "font-mono text-[12px] font-bold text-rose-400",
                      !r.clockOut && t.textSubtle
                    )}
                  >
                    {r.clockOut ?? "—"}
                  </div>
                  <div className={cn("text-[12px] font-semibold", t.textMuted)}>
                    {s.shiftStart}–{s.shiftEnd}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5">
          <div
            className={cn(
              "mb-2 text-[11px] font-black uppercase tracking-widest",
              t.textSubtle
            )}
          >
            Day Off ဝန်ထမ်းများ
          </div>

          <div className="flex flex-wrap gap-2">
            {INITIAL_STAFF.filter((s) => !s.scheduleToday).map((s) => (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border px-3 py-2 opacity-60",
                  t.chip
                )}
              >
                <GradAvatar member={s} size="sm" />
                <span className={cn("text-[12px] font-bold", t.textMuted)}>
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "mt-8 flex items-center justify-between pb-4 text-[11px] font-semibold",
            t.textSubtle
          )}
        >
          <span>© 2026 BINHLAIG · Time Card Clock Center</span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3 w-3" />
            framer-motion · updated
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function TimeCardV2() {
  const [theme, setTheme] = React.useState<Theme>("dark");
  const [view, setView] = React.useState<View>("login");
  const [loggedInStaff, setLoggedInStaff] = React.useState<StaffMember | null>(null);
  const [records, setRecords] = React.useState<Record<string, PunchRecord>>(() =>
    Object.fromEntries(INITIAL_STAFF.map((s) => [s.id, initRecord()]))
  );

  function handleLogin(staff: StaffMember) {
    setLoggedInStaff(staff);
    setView("staff-panel");
  }

  function handleLogout() {
    setLoggedInStaff(null);
    setView("login");
  }

  function handleAction() {
    if (!loggedInStaff) return;
    const id = loggedInStaff.id;

    setRecords((prev) => {
      const r = prev[id];
      const time = nowStr();
      const logs = [...r.logs];
      let update: Partial<PunchRecord> = {};

      if (r.status === "out") {
        update = {
          status: "in",
          clockIn: time,
          clockOut: null,
          breakStart: null,
          breakEnd: null,
          totalBreakMins: 0,
        };
        logs.push({ time, action: "Clocked In", color: "text-emerald-400" });
      } else if (r.status === "in") {
        update = {
          status: "break",
          breakStart: time,
        };
        logs.push({ time, action: "Break Started", color: "text-amber-400" });
      } else if (r.status === "break") {
        const mins = r.breakStart ? timeDiffMins(r.breakStart, time) : 0;
        update = {
          status: "in",
          breakEnd: time,
          totalBreakMins: r.totalBreakMins + mins,
        };
        logs.push({ time, action: "Break Ended", color: "text-blue-400" });
      }

      return {
        ...prev,
        [id]: {
          ...r,
          ...update,
          logs,
        },
      };
    });
  }

  function handleClockOut() {
    if (!loggedInStaff) return;
    const id = loggedInStaff.id;

    setRecords((prev) => {
      const r = prev[id];
      const time = nowStr();

      return {
        ...prev,
        [id]: {
          ...r,
          status: "done",
          clockOut: time,
          logs: [...r.logs, { time, action: "Clocked Out", color: "text-rose-400" }],
        },
      };
    });
  }

  function getBackView(): View {
    return loggedInStaff ? "staff-panel" : "login";
  }

  const ThemeBtn = () => {
    const t = tk(theme);
    return (
      <button
        onClick={() => setTheme((th) => (th === "dark" ? "light" : "dark"))}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-2xl border shadow-xl",
          t.btn
        )}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    );
  };

  const AdminBtn = () => {
    const t = tk(theme);
    return (
      <button
        onClick={() => setView((v) => (v === "dashboard" ? getBackView() : "dashboard"))}
        className={cn(
          "fixed bottom-5 left-5 z-50 flex h-11 items-center gap-2 rounded-2xl border px-4 text-[12px] font-bold shadow-xl",
          t.btn
        )}
      >
        {view === "dashboard" ? (
          <>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </>
        ) : (
          <>
            <Users className="h-3.5 w-3.5" />
            Admin
          </>
        )}
      </button>
    );
  };

  return (
    <>
      <ThemeBtn />
      <AdminBtn />

      <AnimatePresence mode="wait">
        {view === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoginScreen theme={theme} onLogin={handleLogin} />
          </motion.div>
        )}

        {view === "staff-panel" && loggedInStaff && (
          <motion.div
            key="staff-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StaffPunchPanel
              staff={loggedInStaff}
              record={records[loggedInStaff.id]}
              theme={theme}
              onAction={handleAction}
              onClockOut={handleClockOut}
              onLogout={handleLogout}
            />
          </motion.div>
        )}

        {view === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AdminDashboard
              theme={theme}
              records={records}
              onSwitchToLogin={() => setView("login")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}