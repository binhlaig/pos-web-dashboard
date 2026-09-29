
// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { useSession, signIn } from "next-auth/react";
// import { useTheme } from "next-themes";
// import {
//   motion,
//   AnimatePresence,
//   useMotionValue,
//   useTransform,
//   animate,
// } from "framer-motion";

// import {
//   DndContext,
//   DragOverlay,
//   PointerSensor,
//   MouseSensor,
//   TouchSensor,
//   KeyboardSensor,
//   closestCenter,
//   useSensor,
//   useSensors,
//   type DragEndEvent,
//   type DragStartEvent,
//   type DragOverEvent,
// } from "@dnd-kit/core";

// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   arrayMove,
//   useSortable,
//   sortableKeyboardCoordinates,
// } from "@dnd-kit/sortable";

// import { CSS } from "@dnd-kit/utilities";

// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";

// import {
//   ArrowLeft,
//   Pencil,
//   Package,
//   Tag,
//   Boxes,
//   Printer,
//   RefreshCw,
//   TrendingUp,
//   TrendingDown,
//   History,
//   Barcode as BarcodeIcon,
//   GripVertical,
//   Sparkles,
//   ScanLine,
//   Wallet,
//   Package2,
//   UserRound,
//   Activity,
//   GalleryVertical,
//   Gauge,
//   ShieldCheck,
//   CircleDollarSign,
//   Clock3,
//   Box,
//   Zap,
//   ArrowUpRight,
//   ArrowDownRight,
//   ArrowRightLeft,
//   Eye,
//   ChevronLeft,
//   ChevronRight,
//   ImageIcon,
//   X,
//   Loader2,
//   Layers3,
// } from "lucide-react";

// import { toast } from "sonner";
// import JsBarcode from "jsbarcode";
// import { cn } from "@/lib/utils";

// // ─────────────────────────────────────────────────────────────────────────────
// // Font + Animations
// // ─────────────────────────────────────────────────────────────────────────────

// function FontImport() {
//   return (
//     <style>{`
//       @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;700;900&display=swap');
//       * { font-family: 'DM Sans', sans-serif; }
//       .serif { font-family: 'DM Serif Display', serif !important; }
//       @keyframes lantern-float {
//         0%, 100% { transform: translateY(0px); }
//         50%       { transform: translateY(-7px); }
//       }
//       @keyframes lantern-breathe {
//         0%, 100% { opacity: .72; transform: scale(1); }
//         50%       { opacity: 1;   transform: scale(1.06); }
//       }
//       @keyframes ember-rise {
//         0%   { transform: translateY(0) translateX(0) scale(1);     opacity: .55; }
//         50%  { transform: translateY(-18px) translateX(5px) scale(1.1); opacity: .9; }
//         100% { transform: translateY(-36px) translateX(-2px) scale(.5); opacity: 0; }
//       }
//     `}</style>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Theme tokens — mirrors product list / create / edit
// // ─────────────────────────────────────────────────────────────────────────────

// type Theme = "dark" | "light";

// const tk = (theme: Theme) =>
//   theme === "dark"
//     ? {
//         root:        "bg-[#05060d]",
//         text:        "text-[#f3e7d2]",
//         textMuted:   "text-[#bca98f]",
//         textSubtle:  "text-[#8a7a65]",
//         card:        "border-[rgba(200,137,42,0.16)] bg-[rgba(14,10,6,0.84)] backdrop-blur-xl",
//         cardHover:   "hover:border-[rgba(212,163,82,0.35)]",
//         btn:         "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#d4b68a] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f3e7d2]",
//         btnPrimary:  "bg-gradient-to-r from-[#a07020] to-[#d4a352] text-[#140d05] hover:brightness-110 shadow-lg shadow-[#c8892a]/20",
//         btnDanger:   "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20",
//         soft:        "border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)]",
//         input:       "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#f3e7d2] placeholder:text-[#8a7a65] focus-visible:border-[#c8892a] focus-visible:ring-[#c8892a]/20",
//         pill:        "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#bca98f]",
//         glow1:       "bg-amber-700/[0.16]",
//         glow2:       "bg-orange-700/[0.10]",
//         hero:        "border-[rgba(200,137,42,0.16)] bg-[linear-gradient(135deg,rgba(200,137,42,0.12),rgba(160,80,20,0.07),rgba(14,10,6,0.84))]",
//         heroLine:    "from-[#a07020] via-[#d4a352] to-transparent",
//         metricIcon:  "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]",
//         ring:        "ring-[#c8892a]/40",
//         laneIn:      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
//         laneOut:     "border-rose-500/20 bg-rose-500/10 text-rose-300",
//         laneAdj:     "border-amber-500/20 bg-amber-500/10 text-amber-300",
//         laneDrop:    "border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.02)]",
//         dragHandle:  "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#8a7a65] hover:bg-[rgba(255,255,255,0.10)]",
//         modalBg:     "border-[rgba(200,137,42,0.16)] bg-[rgba(8,6,2,0.96)] backdrop-blur-3xl",
//         sceneOverlay:"from-black/70 via-black/10 to-transparent",
//       }
//     : {
//         root:        "bg-[#f0f4ff]",
//         text:        "text-slate-900",
//         textMuted:   "text-slate-500",
//         textSubtle:  "text-slate-400",
//         card:        "border-slate-200/80 bg-white/90 shadow-[0_2px_16px_rgba(15,23,42,0.06)]",
//         cardHover:   "hover:border-slate-300",
//         btn:         "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
//         btnPrimary:  "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:brightness-110 shadow-lg shadow-blue-500/25",
//         btnDanger:   "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
//         soft:        "border-slate-200 bg-slate-50/80",
//         input:       "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-blue-500 focus-visible:ring-blue-500/20",
//         pill:        "border-slate-200 bg-white text-slate-500 shadow-sm",
//         glow1:       "bg-violet-300/20",
//         glow2:       "bg-blue-300/20",
//         hero:        "border-slate-200/80 bg-[linear-gradient(135deg,rgba(6,182,212,0.08),rgba(99,102,241,0.06),rgba(255,255,255,0.96))]",
//         heroLine:    "from-blue-500 via-violet-500 to-transparent",
//         metricIcon:  "border-slate-200 bg-slate-50",
//         ring:        "ring-blue-500/30",
//         laneIn:      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
//         laneOut:     "border-rose-500/20 bg-rose-500/10 text-rose-700",
//         laneAdj:     "border-amber-500/20 bg-amber-500/10 text-amber-700",
//         laneDrop:    "border-slate-200 bg-slate-50/60",
//         dragHandle:  "border-slate-200 bg-white text-slate-400 hover:bg-slate-50 shadow-sm",
//         modalBg:     "border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl",
//         sceneOverlay:"from-black/65 via-black/10 to-transparent",
//       };

// // ─────────────────────────────────────────────────────────────────────────────
// // LanternMark SVG
// // ─────────────────────────────────────────────────────────────────────────────

// function LanternMark({ size = 34, glow = false }: { size?: number; glow?: boolean }) {
//   const h = size * 1.5;
//   return (
//     <svg width={size} height={h} viewBox="0 0 32 48" fill="none">
//       <defs>
//         <radialGradient id="lgGlowView" cx="50%" cy="48%" r="50%">
//           <stop offset="0%"   stopColor="#fff7d6" stopOpacity="0.96" />
//           <stop offset="28%"  stopColor="#fbbf24" stopOpacity="0.86" />
//           <stop offset="60%"  stopColor="#f59e0b" stopOpacity="0.44" />
//           <stop offset="100%" stopColor="#d97706" stopOpacity="0"    />
//         </radialGradient>
//         <linearGradient id="lmMetalView" x1="8" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
//           <stop offset="0%"   stopColor="#c58a3c" />
//           <stop offset="50%"  stopColor="#a96b28" />
//           <stop offset="100%" stopColor="#8a551d" />
//         </linearGradient>
//         <linearGradient id="lbBodyView" x1="6" y1="11" x2="26" y2="37" gradientUnits="userSpaceOnUse">
//           <stop offset="0%"   stopColor="#fffaf1" />
//           <stop offset="45%"  stopColor="#f5e7cf" />
//           <stop offset="100%" stopColor="#ecd5ae" />
//         </linearGradient>
//       </defs>
//       <line x1="16" y1="0" x2="16" y2="6" stroke={glow ? "#d6ae67" : "#9d6a2b"} strokeWidth="1.5" strokeLinecap="round" />
//       <rect x="8" y="6" width="16" height="5" rx="2" fill="url(#lmMetalView)" stroke="#7b4a18" strokeWidth="0.8" />
//       <rect x="6" y="11" width="20" height="26" rx="3" fill={glow ? "#0e0908" : "url(#lbBodyView)"} stroke="#a66b27" strokeWidth="1" />
//       {glow && <rect x="6" y="11" width="20" height="26" rx="3" fill="url(#lgGlowView)" />}
//       {[11, 16, 21].map((x) => (
//         <line key={x} x1={x} y1="11" x2={x} y2="37" stroke={glow ? "#6b3e10" : "#b47b34"} strokeWidth="1" opacity="0.95" />
//       ))}
//       {glow && (
//         <>
//           <motion.ellipse cx="16" cy="26" rx="4" ry="6" fill="#f59e0b" opacity="0.68"
//             animate={{ ry: [6, 7.1, 5.3, 6.7, 6], cx: [16, 15.7, 16.3, 15.9, 16] }}
//             transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }} />
//           <motion.ellipse cx="16" cy="27" rx="2.5" ry="4.2" fill="#fde68a"
//             animate={{ ry: [4.2, 5, 3.6, 4.5, 4.2] }}
//             transition={{ duration: 0.95, repeat: Infinity, ease: "easeInOut" }} />
//         </>
//       )}
//       <rect x="8" y="37" width="16" height="5" rx="2" fill="url(#lmMetalView)" stroke="#7b4a18" strokeWidth="0.8" />
//       <line x1="16" y1="42" x2="16" y2="47" stroke="#8f5b24" strokeWidth="1.5" strokeLinecap="round" />
//       <circle cx="16" cy="47" r="1.5" fill="#8f5b24" />
//     </svg>
//   );
// }

// function LanternToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
//   return (
//     <motion.button type="button" onClick={onToggle}
//       whileHover={{ y: -2, scale: 1.04 }} whileTap={{ scale: 0.94 }}
//       className="relative flex flex-col items-center focus:outline-none" style={{ width: 58 }}
//       aria-label={dark ? "Switch to day mode" : "Switch to night mode"}>
//       {dark && (
//         <div className="pointer-events-none absolute" style={{
//           width: 76, height: 76, top: -6, left: "50%", transform: "translateX(-50%)",
//           borderRadius: "50%",
//           background: "radial-gradient(ellipse at center, rgba(251,191,36,0.52) 0%, rgba(245,158,11,0.18) 52%, transparent 76%)",
//           filter: "blur(9px)", animation: "lantern-breathe 2.8s ease-in-out infinite",
//         }} />
//       )}
//       <div style={{ animation: "lantern-float 3s ease-in-out infinite" }}>
//         <LanternMark size={34} glow={dark} />
//       </div>
//       <span style={{ marginTop: 5, fontSize: 7, fontWeight: 700, letterSpacing: "0.2em", color: dark ? "#c8892a" : "#9a6c2a" }}>
//         {dark ? "NIGHT" : "DAY"}
//       </span>
//     </motion.button>
//   );
// }

// function NightParticles() {
//   const particles = Array.from({ length: 26 }).map((_, i) => ({
//     id: i, left: `${(i * 31 + 9) % 100}%`, top: `${(i * 43 + 11) % 100}%`,
//     size: 1.5 + (i % 3), delay: (i * 0.25) % 4, duration: 2.8 + (i % 4) * 0.8,
//   }));
//   const embers = Array.from({ length: 10 }).map((_, i) => ({
//     id: i, left: `${38 + (i % 5) * 5 - 10}%`, delay: i * 0.4,
//     size: 3 + (i % 3), dur: 3.5 + (i % 4) * 0.5,
//   }));
//   return (
//     <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
//       {particles.map((p) => (
//         <motion.div key={p.id} className="absolute rounded-full bg-amber-100"
//           style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
//           animate={{ opacity: [0.08, 0.9, 0.08], scale: [0.7, 1.4, 0.7] }}
//           transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }} />
//       ))}
//       {embers.map((e) => (
//         <div key={e.id} style={{
//           position: "absolute", bottom: "56%", left: e.left,
//           width: e.size, height: e.size, borderRadius: "50%",
//           background: "radial-gradient(circle, #ffe080 0%, #ff8820 60%, transparent 100%)",
//           boxShadow: "0 0 6px 2px rgba(255,160,40,0.6)",
//           animation: `ember-rise ${e.dur}s ${e.delay}s ease-out infinite`, opacity: 0,
//         }} />
//       ))}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Types
// // ─────────────────────────────────────────────────────────────────────────────

// type Product = {
//   id: string; sku: string; product_name: string; product_price: number;
//   barcode?: string | null; category?: string | null;
//   product_quantity_amount: number;
//   product_image?: string | null; imagePath?: string | null; image_path?: string | null;
//   product_discount?: number | null; note?: string | null; product_type?: string | null;
// };

// type StockMovement = {
//   id: string; type: "IN" | "OUT" | "ADJUST"; qty: number;
//   before_qty: number; after_qty: number; note?: string | null;
//   created_at: string; user_name?: string | null;
// };

// type MovementLaneKey = "IN" | "OUT" | "ADJUST";
// type MovementLaneMap = Record<MovementLaneKey, StockMovement[]>;

// type GalleryItem = {
//   id: string; kind: "image" | "generated" | "sku" | "type"; url: string | null;
//   title: string; category: string; sku: string; type: string;
//   initials: string; gradient: string;
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // Helpers
// // ─────────────────────────────────────────────────────────────────────────────

// function pickImagePath(p: any): string | null {
//   return p?.imagePath ?? p?.image_path ?? p?.product_image ?? null;
// }
// function buildImageUrl(path?: string | null) {
//   if (!path) return null;
//   const raw = String(path).trim();
//   if (!raw) return null;
//   if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
//   return `/uploads/${raw.replace(/^\/?uploads\/?/, "").replace(/^\/+/, "")}`;
// }
// async function readErrorText(res: Response) {
//   const ct = res.headers.get("content-type") || "";
//   try {
//     if (ct.includes("application/json")) { const j = await res.json(); return j?.message || j?.error || JSON.stringify(j); }
//     return (await res.text()) || "";
//   } catch { return ""; }
// }
// function numberFormat(n: number) { return new Intl.NumberFormat().format(n || 0); }
// function money(n: number) { return `¥${numberFormat(n || 0)}`; }
// function hashCode(str: string) {
//   let h = 0;
//   for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
//   return h;
// }
// function getInitials(name: string) {
//   return String(name || "").split(" ").filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase()).join("");
// }
// function gradientFromSeed(seed: string) {
//   const palettes = [
//     ["#3b82f6","#06b6d4"],["#8b5cf6","#d946ef"],["#10b981","#06b6d4"],
//     ["#f59e0b","#ef4444"],["#f43f5e","#ec4899"],["#6366f1","#3b82f6"],
//   ];
//   return palettes[Math.abs(hashCode(seed)) % palettes.length];
// }
// function gradientClass(seed: string) {
//   const palettes = [
//     "from-cyan-500 via-sky-500 to-indigo-600","from-fuchsia-500 via-pink-500 to-rose-500",
//     "from-emerald-500 via-teal-500 to-cyan-600","from-amber-400 via-orange-500 to-rose-500",
//     "from-violet-500 via-purple-500 to-indigo-600","from-lime-500 via-green-500 to-emerald-600",
//   ];
//   return palettes[Math.abs(hashCode(seed)) % palettes.length];
// }
// function escapeHtml(s: string) {
//   return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
// }
// function buildGallery(product: Product | null): GalleryItem[] {
//   if (!product) return [];
//   const primary = buildImageUrl(pickImagePath(product));
//   const seed = `${product.product_name}-${product.category}-${product.sku}`;
//   const base = {
//     title: product.product_name, category: product.category || "PRODUCT",
//     sku: product.sku || "SKU", type: product.product_type || "General Item",
//     initials: getInitials(product.product_name || "P"), gradient: gradientClass(seed),
//   };
//   return [
//     { id: "main",  kind: "image",     url: primary, ...base },
//     { id: "cover", kind: "generated", url: null,    ...base },
//     { id: "sku",   kind: "sku",       url: null,    ...base },
//     { id: "type",  kind: "type",      url: null,    ...base },
//   ];
// }
// function buildLaneMap(items: StockMovement[]): MovementLaneMap {
//   return {
//     IN:     items.filter((m) => m.type === "IN"),
//     OUT:    items.filter((m) => m.type === "OUT"),
//     ADJUST: items.filter((m) => m.type === "ADJUST"),
//   };
// }
// function flattenLaneMap(lanes: MovementLaneMap): StockMovement[] {
//   return [...lanes.IN, ...lanes.OUT, ...lanes.ADJUST];
// }
// function findLaneByMovementId(lanes: MovementLaneMap, id: string): MovementLaneKey | null {
//   if (lanes.IN.some((m) => m.id === id))     return "IN";
//   if (lanes.OUT.some((m) => m.id === id))    return "OUT";
//   if (lanes.ADJUST.some((m) => m.id === id)) return "ADJUST";
//   return null;
// }
// function findLaneForOverTarget(lanes: MovementLaneMap, overId: string): MovementLaneKey | null {
//   if (overId === "IN" || overId === "OUT" || overId === "ADJUST") return overId;
//   return findLaneByMovementId(lanes, overId);
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // AnimatedNumber
// // ─────────────────────────────────────────────────────────────────────────────

// function AnimatedNumber({ value }: { value: number }) {
//   const mv = useMotionValue(0);
//   const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());
//   const [display, setDisplay] = useState("0");
//   useEffect(() => {
//     const c = animate(mv, value, { duration: 0.55, ease: "easeOut" });
//     const unsub = rounded.on("change", setDisplay);
//     return () => { c.stop(); unsub(); };
//   }, [value, mv, rounded]);
//   return <motion.span>{display}</motion.span>;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Stock Badge
// // ─────────────────────────────────────────────────────────────────────────────

// function StockBadge({ stock }: { stock: number }) {
//   if (stock <= 0) return <Badge className="border-rose-500/20 bg-rose-500/10 text-rose-400 border font-mono text-[10px] tracking-widest">OUT</Badge>;
//   if (stock < 5)  return <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-400 border font-mono text-[10px] tracking-widest">LOW</Badge>;
//   return <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 border font-mono text-[10px] tracking-widest">IN</Badge>;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Metric Card
// // ─────────────────────────────────────────────────────────────────────────────

// function MetricCard({
//   theme, icon, label, value, sub, tone,
// }: {
//   theme: Theme; icon: React.ReactNode; label: string; value: React.ReactNode;
//   sub?: string; tone?: "default" | "good" | "warn" | "danger";
// }) {
//   const t = tk(theme);
//   return (
//     <div className={cn("rounded-[20px] border p-4", t.soft)}>
//       <div className="flex items-start justify-between gap-3">
//         <div className="space-y-1 min-w-0">
//           <div className={cn("text-[10px] font-black tracking-[0.18em]", t.textSubtle)}>{label}</div>
//           <div className={cn("text-xl font-black leading-none",
//             tone === "good"   ? "text-emerald-400" :
//             tone === "warn"   ? "text-amber-400"   :
//             tone === "danger" ? "text-rose-400"    : t.text
//           )}>{value}</div>
//           {sub && <div className={cn("text-xs", t.textMuted)}>{sub}</div>}
//         </div>
//         <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-2xl border", t.metricIcon, t.textMuted)}>
//           {icon}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Gallery Tile
// // ─────────────────────────────────────────────────────────────────────────────

// function GalleryTile({ item, active, onClick }: { item: GalleryItem; active: boolean; onClick: () => void }) {
//   return (
//     <button type="button" onClick={onClick}
//       className={cn("relative h-20 w-full overflow-hidden rounded-2xl border transition-all",
//         active ? "border-[#c8892a] ring-2 ring-[#c8892a]/30" : "border-[rgba(255,255,255,0.1)]"
//       )}>
//       {item.kind === "image" && item.url
//         ? <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
//         : (
//           <div className={cn("relative h-full w-full bg-gradient-to-br", item.gradient)}>
//             <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.3),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.18),transparent_22%)]" />
//             <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-black">
//               {item.kind === "sku" ? item.sku : item.kind === "type" ? item.type : item.initials}
//             </div>
//           </div>
//         )}
//     </button>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Product Scene
// // ─────────────────────────────────────────────────────────────────────────────

// function ProductScene({ product, galleryItem, theme }: { product: Product; galleryItem: GalleryItem; theme: Theme }) {
//   const t = tk(theme);
//   if (galleryItem.kind === "image" && galleryItem.url) {
//     return (
//       <div className="relative h-full w-full overflow-hidden">
//         <img src={galleryItem.url} alt={product.product_name}
//           className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
//         <div className={cn("absolute inset-0 bg-gradient-to-t", t.sceneOverlay)} />
//       </div>
//     );
//   }
//   return (
//     <div className={cn("relative h-full w-full bg-gradient-to-br", galleryItem.gradient)}>
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.2),transparent_22%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.15),transparent_24%)]" />
//       <div className="absolute inset-0 p-6 text-white flex flex-col justify-between">
//         <div className="flex items-start justify-between gap-3">
//           <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[10px] font-black tracking-[0.2em] backdrop-blur">
//             {product.category || "PRODUCT"}
//           </span>
//           <span className="rounded-full border border-white/20 bg-black/15 px-2.5 py-1 text-[10px] font-bold backdrop-blur">
//             {product.sku || "SKU"}
//           </span>
//         </div>
//         <div className="space-y-3">
//           <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl font-black backdrop-blur">
//             {galleryItem.kind === "sku" ? "SKU" : galleryItem.kind === "type" ? getInitials(product.product_type || "T") : getInitials(product.product_name || "P")}
//           </div>
//           <div className="line-clamp-2 text-2xl font-black leading-tight">{product.product_name}</div>
//           <div className="text-sm text-white/80">
//             {galleryItem.kind === "sku" ? product.sku : galleryItem.kind === "type" ? product.product_type || "General Item" : product.product_type || "General Item"}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Stock Bar
// // ─────────────────────────────────────────────────────────────────────────────

// function StockBar({ stock, theme }: { stock: number; theme: Theme }) {
//   const t = tk(theme);
//   const max = Math.max(10, Math.ceil(stock / 10) * 10 || 10);
//   const pct = Math.min(100, Math.round((stock / max) * 100));
//   return (
//     <div className="space-y-2">
//       <div className={cn("flex items-center justify-between text-xs", t.textMuted)}>
//         <span>Stock Health</span>
//         <span className="font-mono">{pct}%</span>
//       </div>
//       <div className={cn("h-3 rounded-full overflow-hidden", theme === "dark" ? "bg-white/10" : "bg-black/10")}>
//         <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: "easeOut" }}
//           className={cn("h-full rounded-full", stock <= 0 ? "bg-rose-500" : stock < 5 ? "bg-amber-500" : "bg-emerald-500")} />
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Movement badge helpers
// // ─────────────────────────────────────────────────────────────────────────────

// function movementBadge(type: StockMovement["type"]) {
//   if (type === "IN")     return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 gap-1"><TrendingUp  className="h-3.5 w-3.5" />IN</Badge>;
//   if (type === "OUT")    return <Badge className="bg-rose-500/10    text-rose-400    border border-rose-500/20    gap-1"><TrendingDown className="h-3.5 w-3.5" />OUT</Badge>;
//   return                        <Badge className="bg-amber-500/10   text-amber-400   border border-amber-500/20   gap-1"><History      className="h-3.5 w-3.5" />ADJUST</Badge>;
// }

// function laneMeta(key: MovementLaneKey) {
//   if (key === "IN")     return { title: "Stock In",  icon: <TrendingUp  className="h-4 w-4" /> };
//   if (key === "OUT")    return { title: "Stock Out", icon: <TrendingDown className="h-4 w-4" /> };
//   return                       { title: "Adjust",    icon: <History      className="h-4 w-4" /> };
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Sortable Movement Card
// // ─────────────────────────────────────────────────────────────────────────────

// function SortableMovementCard({ move, theme }: { move: StockMovement; theme: Theme }) {
//   const t = tk(theme);
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: move.id });
//   const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
//   return (
//     <motion.div ref={setNodeRef} style={style} layout>
//       <div className={cn("rounded-[18px] border p-4 transition-all", t.soft, isDragging && `ring-2 ${t.ring}`)}>
//         <div className="flex items-start gap-3">
//           <button type="button" {...attributes} {...listeners}
//             className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl border cursor-grab active:cursor-grabbing transition-all", t.dragHandle)}>
//             <GripVertical className="h-4 w-4" />
//           </button>
//           <div className="min-w-0 flex-1 space-y-2">
//             <div className="flex items-center gap-2 flex-wrap">
//               {movementBadge(move.type)}
//               <span className={cn("text-xs font-mono", t.textSubtle)}>{new Date(move.created_at).toLocaleString()}</span>
//             </div>
//             <div className="grid grid-cols-3 gap-2 text-sm">
//               {[["QTY", move.qty], ["BEFORE", move.before_qty], ["AFTER", move.after_qty]].map(([l, v]) => (
//                 <div key={String(l)}>
//                   <div className={cn("text-[10px] font-black tracking-[0.16em]", t.textSubtle)}>{l}</div>
//                   <div className={cn("font-black", t.text)}>{numberFormat(Number(v))}</div>
//                 </div>
//               ))}
//             </div>
//             <div className={cn("text-sm", t.textMuted)}>{move.note || "No note"}</div>
//             <Badge variant="secondary" className="gap-1"><UserRound className="h-3.5 w-3.5" />{move.user_name || "—"}</Badge>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Movement Lane
// // ─────────────────────────────────────────────────────────────────────────────

// function MovementLane({ laneKey, items, theme, isActiveLane }: {
//   laneKey: MovementLaneKey; items: StockMovement[]; theme: Theme; isActiveLane: boolean;
// }) {
//   const t  = tk(theme);
//   const meta = laneMeta(laneKey);
//   const laneCls = laneKey === "IN" ? t.laneIn : laneKey === "OUT" ? t.laneOut : t.laneAdj;
//   return (
//     <div className={cn("rounded-[22px] border p-4", t.soft)}>
//       <div className="mb-4 flex items-center justify-between gap-3">
//         <div className="flex items-center gap-2">
//           <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl border", laneCls)}>{meta.icon}</div>
//           <div>
//             <div className={cn("font-black", t.text)}>{meta.title}</div>
//             <div className={cn("text-xs", t.textMuted)}>{items.length} item(s)</div>
//           </div>
//         </div>
//         <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-bold", laneCls)}>{laneKey}</span>
//       </div>
//       <div id={laneKey} className={cn(
//         "min-h-[360px] space-y-3 rounded-2xl border border-dashed p-2 transition-all",
//         t.laneDrop, isActiveLane && `ring-2 ${t.ring}`
//       )}>
//         <SortableContext items={items.map((m) => m.id)} strategy={verticalListSortingStrategy}>
//           {items.length === 0
//             ? <div className={cn("flex min-h-[200px] items-center justify-center text-sm", t.textMuted)}>Drop here</div>
//             : items.map((move) => <SortableMovementCard key={move.id} move={move} theme={theme} />)
//           }
//         </SortableContext>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Image Preview Modal
// // ─────────────────────────────────────────────────────────────────────────────

// function ProductImageModal({ open, onOpenChange, product, gallery, activeId, onChangeActive }: {
//   open: boolean; onOpenChange: (v: boolean) => void;
//   product: Product | null; gallery: GalleryItem[];
//   activeId: string; onChangeActive: (id: string) => void;
// }) {
//   if (!product || gallery.length === 0) return null;
//   const current = gallery.find((g) => g.id === activeId) || gallery[0];
//   const idx     = gallery.findIndex((g) => g.id === current.id);
//   const prev    = () => onChangeActive(gallery[(idx - 1 + gallery.length) % gallery.length].id);
//   const next    = () => onChangeActive(gallery[(idx + 1) % gallery.length].id);
//   return (
//     <AnimatePresence>
//       {open && (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//           className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
//           onClick={(e) => e.target === e.currentTarget && onOpenChange(false)}>
//           <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.95, y: 12 }}
//             className="relative w-full max-w-6xl overflow-hidden rounded-[30px] border border-[rgba(200,137,42,0.2)] bg-[rgba(8,6,2,0.97)] text-white shadow-2xl">
//             {/* top accent */}
//             <div className="h-[2px] bg-gradient-to-r from-transparent via-[#c8892a] to-transparent" />
//             <div className="grid min-h-[70vh] md:grid-cols-[1fr_320px]">
//               <div className="relative flex items-center justify-center overflow-hidden bg-black/30">
//                 <button onClick={() => onOpenChange(false)}
//                   className="absolute right-4 top-4 z-20 rounded-2xl border border-[rgba(200,137,42,0.25)] bg-[rgba(200,137,42,0.12)] p-2 text-[#d4a352] backdrop-blur hover:bg-[rgba(200,137,42,0.22)]">
//                   <X className="h-5 w-5" />
//                 </button>
//                 <button onClick={prev}
//                   className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-2xl border border-white/15 bg-black/30 p-3 text-white backdrop-blur hover:bg-black/50">
//                   <ChevronLeft className="h-5 w-5" />
//                 </button>
//                 <button onClick={next}
//                   className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-2xl border border-white/15 bg-black/30 p-3 text-white backdrop-blur hover:bg-black/50">
//                   <ChevronRight className="h-5 w-5" />
//                 </button>
//                 {current.kind === "image" && current.url
//                   ? <img src={current.url} alt={product.product_name} className="max-h-[70vh] w-auto max-w-full object-contain" />
//                   : (
//                     <div className={cn("relative h-full min-h-[70vh] w-full bg-gradient-to-br", current.gradient)}>
//                       <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.2),transparent_22%)]" />
//                       <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center text-white p-8">
//                         <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/20 bg-white/10 text-3xl font-black backdrop-blur">
//                           {current.kind === "sku" ? "SKU" : current.kind === "type" ? getInitials(product.product_type || "T") : getInitials(product.product_name || "P")}
//                         </div>
//                         <div className="text-4xl font-black leading-tight">{product.product_name}</div>
//                         <div className="text-base text-white/80">{current.kind === "sku" ? product.sku : current.kind === "type" ? product.product_type || "General" : product.category || "Product"}</div>
//                       </div>
//                     </div>
//                   )}
//               </div>
//               {/* sidebar */}
//               <div className="border-l border-[rgba(200,137,42,0.15)] p-5 space-y-4">
//                 <div>
//                   <div className="text-[11px] font-black tracking-[0.18em] text-[#8a7a65]">IMAGE PREVIEW</div>
//                   <div className="mt-1 flex items-center gap-2">
//                     <LanternMark size={20} glow />
//                     <div className="text-2xl font-black text-[#f3e7d2]">{product.product_name}</div>
//                   </div>
//                   <div className="mt-1 text-sm text-[#bca98f]">{product.product_type || "General Item"}</div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                   {[["PRICE", money(product.product_price)], ["STOCK", numberFormat(product.product_quantity_amount)]].map(([l, v]) => (
//                     <div key={String(l)} className="rounded-2xl border border-[rgba(200,137,42,0.15)] bg-[rgba(200,137,42,0.07)] p-3">
//                       <div className="text-[10px] font-black tracking-[0.18em] text-[#8a7a65]">{l}</div>
//                       <div className="mt-1 text-lg font-black text-[#f3e7d2]">{v}</div>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="space-y-3">
//                   {gallery.map((item) => (
//                     <GalleryTile key={item.id} item={item} active={item.id === current.id} onClick={() => onChangeActive(item.id)} />
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // Main Page
// // ─────────────────────────────────────────────────────────────────────────────

// export default function ProductViewPage() {
//   const router                                    = useRouter();
//   const params                                    = useParams<{ id: string }>();
//   const id                                        = params?.id;
//   const { data: session, status }                 = useSession();
//   const { resolvedTheme, setTheme: setNextTheme } = useTheme();

//   const [themeState, setThemeState] = useState<Theme>("dark");
//   useEffect(() => { setThemeState(resolvedTheme === "light" ? "light" : "dark"); }, [resolvedTheme]);
//   const theme = themeState;
//   const t = tk(theme);

//   const token = (session as any)?.accessToken ?? (session as any)?.access_token ?? (session as any)?.token ?? null;
//   function authHeaders(): Record<string, string> { return token ? { Authorization: `Bearer ${token}` } : {}; }

//   const [product,       setProduct]       = useState<Product | null>(null);
//   const [loading,       setLoading]       = useState(true);
//   const [moves,         setMoves]         = useState<StockMovement[]>([]);
//   const [movesLoading,  setMovesLoading]  = useState(false);
//   const [movesLoaded,   setMovesLoaded]   = useState(false);
//   const [mPageSize,     setMPageSize]     = useState(10);
//   const [mPage,         setMPage]         = useState(1);
//   const [stockOpen,     setStockOpen]     = useState(false);
//   const [stockMode,     setStockMode]     = useState<"IN" | "OUT" | "ADJUST">("IN");
//   const [stockQty,      setStockQty]      = useState(1);
//   const [stockNote,     setStockNote]     = useState("");
//   const [stockSaving,   setStockSaving]   = useState(false);
//   const [activeMoveId,  setActiveMoveId]  = useState<string | null>(null);
//   const [activeLane,    setActiveLane]    = useState<MovementLaneKey | null>(null);
//   const [activeGallId,  setActiveGallId]  = useState("main");
//   const [movLanes,      setMovLanes]      = useState<MovementLaneMap>({ IN: [], OUT: [], ADJUST: [] });
//   const [imgPreview,    setImgPreview]    = useState(false);

//   const barcodeSvgRef = useRef<SVGSVGElement>(null);
//   const laneKeys: MovementLaneKey[] = ["IN", "OUT", "ADJUST"];

//   const sensors = useSensors(
//     useSensor(PointerSensor,  { activationConstraint: { distance: 6 } }),
//     useSensor(MouseSensor,    { activationConstraint: { distance: 6 } }),
//     useSensor(TouchSensor,    { activationConstraint: { delay: 120, tolerance: 6 } }),
//     useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
//   );

//   useEffect(() => { if (status === "unauthenticated") { toast.error("Login လုပ်ပါ"); signIn(); } }, [status]);

//   const barcodeValue = (product?.barcode?.trim() || null) ?? product?.sku ?? "";

//   useEffect(() => {
//     if (!barcodeSvgRef.current || !barcodeValue) return;
//     try { JsBarcode(barcodeSvgRef.current, barcodeValue, { format: "CODE128", displayValue: true, fontSize: 14, height: 70, margin: 8 }); }
//     catch { /* bad barcode */ }
//   }, [barcodeValue]);

//   async function loadProduct() {
//     if (!id || !token) return;
//     const tid = toast.loading("Loading product...");
//     try {
//       setLoading(true);
//       const res = await fetch(`/backend/api/products/${id}`, {
//         headers: { ...authHeaders(), Accept: "application/json" }, cache: "no-store",
//       });
//       if (!res.ok) {
//         const detail = await readErrorText(res);
//         if (res.status === 401) { toast.error("Unauthorized — Login ပြန်လုပ်ပါ", { id: tid }); signIn(); }
//         else toast.error(detail || `Error ${res.status}`, { id: tid });
//         setProduct(null); return;
//       }
//       const data = await res.json() as Product;
//       setProduct(data);
//       toast.success("Loaded ✅", { id: tid });
//     } catch { toast.error("Server error", { id: tid }); setProduct(null); }
//     finally { setLoading(false); }
//   }

//   async function loadMovements(resetPage = false) {
//     if (!id || !token) return;
//     try {
//       setMovesLoading(true);
//       const res = await fetch(`/backend/api/products/${id}/movements`, {
//         headers: { ...authHeaders(), Accept: "application/json" }, cache: "no-store",
//       });
//       if (!res.ok) { setMovesLoaded(true); setMoves([]); setMovLanes({ IN: [], OUT: [], ADJUST: [] }); return; }
//       const data = await res.json() as StockMovement[];
//       setMoves(data);
//       setMovLanes(buildLaneMap(data));
//       setMovesLoaded(true);
//       if (resetPage) setMPage(1);
//     } catch { toast.error("Movements load error"); }
//     finally { setMovesLoading(false); }
//   }

//   useEffect(() => {
//     if (!id || status !== "authenticated") return;
//     loadProduct();
//     loadMovements(true);
//   }, [id, status, token]);

//   useEffect(() => { setMoves(flattenLaneMap(movLanes)); }, [movLanes]);

//   function openStockModal(mode: "IN" | "OUT" | "ADJUST") {
//     setStockMode(mode);
//     setStockQty(mode === "ADJUST" ? Number(product?.product_quantity_amount ?? 0) : 1);
//     setStockNote("");
//     setStockOpen(true);
//   }

//   async function submitStock() {
//     if (!product || !token) return;
//     const qtyNum = Number(stockQty);
//     if (!Number.isFinite(qtyNum)) { toast.error("Qty မှန်မှန်ထည့်ပါ"); return; }
//     if (stockMode === "ADJUST" && (qtyNum < 0 || !Number.isInteger(qtyNum))) { toast.error("0 သို့ အပေါင်းကိန်း ထည့်ပါ"); return; }
//     if (stockMode !== "ADJUST" && (qtyNum <= 0 || !Number.isInteger(qtyNum))) { toast.error("1 ထက်ကြီးတဲ့ အပေါင်းကိန်း ထည့်ပါ"); return; }

//     setStockSaving(true);
//     const url = stockMode === "IN" ? `/backend/api/products/${product.id}/stock-in`
//       : stockMode === "OUT" ? `/backend/api/products/${product.id}/stock-out`
//       : `/backend/api/products/${product.id}/stock-adjust`;
//     try {
//       const res = await fetch(url, {
//         method: stockMode === "ADJUST" ? "PATCH" : "POST",
//         headers: { ...authHeaders(), "Content-Type": "application/json" },
//         body: JSON.stringify({ qty: qtyNum, note: stockNote.trim() || undefined }),
//       });
//       const data = await res.json().catch(() => null);
//       if (!res.ok) { toast.error(data?.message || `Failed (${res.status})`); return; }
//       toast.success(`Stock ${stockMode} success ✅`);
//       setStockOpen(false);
//       await loadProduct();
//       await loadMovements(true);
//     } catch { toast.error("Stock update error"); }
//     finally { setStockSaving(false); }
//   }

//   // DnD handlers
//   function onDragStart(event: DragStartEvent) {
//     const activeId = String(event.active.id);
//     setActiveMoveId(activeId);
//     setActiveLane(findLaneByMovementId(movLanes, activeId));
//   }
//   function onDragOver(event: DragOverEvent) {
//     const { active, over } = event;
//     if (!over) return;
//     const activeId = String(active.id);
//     const overId   = String(over.id);
//     const fromLane = findLaneByMovementId(movLanes, activeId);
//     const toLane   = findLaneForOverTarget(movLanes, overId);
//     if (!fromLane || !toLane) return;
//     setActiveLane(toLane);
//     if (fromLane === toLane) return;
//     setMovLanes((prev) => {
//       const src  = [...prev[fromLane]];
//       const tgt  = [...prev[toLane]];
//       const idx  = src.findIndex((m) => m.id === activeId);
//       if (idx === -1) return prev;
//       const [moved] = src.splice(idx, 1);
//       const overIdx = tgt.findIndex((m) => m.id === overId);
//       overIdx === -1 ? tgt.push({ ...moved, type: toLane }) : tgt.splice(overIdx, 0, { ...moved, type: toLane });
//       return { ...prev, [fromLane]: src, [toLane]: tgt };
//     });
//   }
//   function onDragEnd(event: DragEndEvent) {
//     const { active, over } = event;
//     if (!over) { setActiveMoveId(null); setActiveLane(null); return; }
//     const activeId = String(active.id);
//     const overId   = String(over.id);
//     const fromLane = findLaneByMovementId(movLanes, activeId);
//     const toLane   = findLaneForOverTarget(movLanes, overId);
//     if (fromLane && toLane && fromLane === toLane) {
//       setMovLanes((prev) => {
//         const items    = [...prev[toLane]];
//         const oldIndex = items.findIndex((m) => m.id === activeId);
//         const newIndex = items.findIndex((m) => m.id === overId);
//         if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev;
//         return { ...prev, [toLane]: arrayMove(items, oldIndex, newIndex) };
//       });
//     }
//     setActiveMoveId(null); setActiveLane(null);
//   }

//   function printBarcode() {
//     if (!product) return;
//     const svg   = barcodeSvgRef.current?.outerHTML || "";
//     const title = product.product_name ?? "Product";
//     const html  = `<!doctype html><html><head><meta charset="utf-8"><title>Print Barcode</title><style>body{font-family:Arial,sans-serif;padding:18px}.wrap{width:360px;border:1px solid #ddd;border-radius:12px;padding:14px}.name{font-weight:700;margin-bottom:6px}.sku{color:#555;font-size:12px;margin-bottom:10px}svg{width:100%;height:auto}</style></head><body><div class="wrap"><div class="name">${escapeHtml(title)}</div><div class="sku">SKU: ${escapeHtml(product.sku)}</div>${svg}<div style="margin-top:10px;display:flex;gap:10px"><span style="font-weight:700">Price: ${Number(product.product_price || 0).toLocaleString()}</span><span>Stock: ${Number(product.product_quantity_amount || 0)}</span></div></div><script>window.onload=()=>{window.print();window.close()}</script></body></html>`;
//     const w = window.open("", "_blank", "width=460,height=560");
//     if (!w) { toast.error("Popup blocked"); return; }
//     w.document.open(); w.document.write(html); w.document.close();
//   }

//   const gallery     = buildGallery(product);
//   const activeGall  = gallery.find((g) => g.id === activeGallId) || gallery[0] || null;
//   const stock       = product?.product_quantity_amount ?? 0;
//   const totalIn     = useMemo(() => moves.filter((m) => m.type === "IN").reduce((s, m) => s + Number(m.qty || 0), 0), [moves]);
//   const totalOut    = useMemo(() => moves.filter((m) => m.type === "OUT").reduce((s, m) => s + Number(m.qty || 0), 0), [moves]);
//   const adjustCount = useMemo(() => moves.filter((m) => m.type === "ADJUST").length, [moves]);
//   const lastMove    = moves[0] || null;
//   const activeMove  = activeMoveId ? flattenLaneMap(movLanes).find((m) => m.id === activeMoveId) || null : null;
//   const mTotal      = moves.length;
//   const mTotalPages = Math.max(1, Math.ceil(mTotal / mPageSize));

//   // ── Loading ──
//   if (status === "loading" || loading) {
//     return (
//       <>
//         <FontImport />
//         <div className={cn("min-h-screen flex items-center justify-center", t.root)}>
//           {theme === "dark" && <NightParticles />}
//           <div className="relative z-10 flex flex-col items-center gap-4">
//             {theme === "dark" && <LanternMark size={54} glow />}
//             <Loader2 className={cn("h-8 w-8 animate-spin", t.textMuted)} />
//             <div className={cn("text-[13px]", t.textMuted)}>Loading product...</div>
//           </div>
//         </div>
//       </>
//     );
//   }

//   if (!product) {
//     return (
//       <>
//         <FontImport />
//         <div className={cn("min-h-screen flex items-center justify-center px-4", t.root)}>
//           <div className={cn("w-full max-w-md overflow-hidden rounded-[28px] border p-8 text-center space-y-4", t.card)}>
//             {theme === "dark" && <div className="flex justify-center"><LanternMark size={46} glow={false} /></div>}
//             <div className={cn("text-xl font-black", t.text)}>Product not found</div>
//             <div className={cn("text-sm", t.textMuted)}>ဒီ product ကို ရှာမတွေ့ပါ</div>
//             <button onClick={loadProduct}
//               className={cn("inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-semibold transition-all", t.btn)}>
//               <RefreshCw className="h-4 w-4" /> Retry
//             </button>
//           </div>
//         </div>
//       </>
//     );
//   }

//   // ──────────────────────────────────────────────────────────────────────────
//   // RENDER
//   // ──────────────────────────────────────────────────────────────────────────
//   return (
//     <>
//       <FontImport />
//       <div className={cn("relative min-h-screen transition-colors duration-500", t.root)}>

//         {/* glow blobs */}
//         <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
//           <div className={cn("absolute -top-40 left-[15%] h-[500px] w-[500px] rounded-full blur-[140px]", t.glow1)} />
//           <div className={cn("absolute -bottom-20 right-[-10%] h-[440px] w-[440px] rounded-full blur-[130px]", t.glow2)} />
//         </div>

//         {theme === "dark" && <NightParticles />}

//         <ProductImageModal open={imgPreview} onOpenChange={setImgPreview}
//           product={product} gallery={gallery} activeId={activeGallId} onChangeActive={setActiveGallId} />

//         <div className="relative z-10 mx-auto w-full max-w-[1900px] space-y-5 px-5 py-7 sm:px-6 2xl:px-10">

//           {/* ── HERO ── */}
//           <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
//             className={cn("relative overflow-hidden rounded-[30px] border p-6 md:p-8", t.hero)}>
//             <div className={cn("absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r", t.heroLine)} />

//             <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
//               <div className="flex items-center gap-5">
//                 {theme === "dark" && (
//                   <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="hidden md:block">
//                     <LanternMark size={72} glow />
//                   </motion.div>
//                 )}
//                 <div className="space-y-3">
//                   <div className="flex flex-wrap gap-2">
//                     <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide", t.pill)}>
//                       <Sparkles className="h-3 w-3" /> BINHLAIG · Product Detail
//                     </div>
//                     <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold", t.pill)}>
//                       <Layers3 className="h-3 w-3" /> dnd-kit Kanban
//                     </div>
//                     <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold", t.pill)}>
//                       <GalleryVertical className="h-3 w-3" /> Gallery
//                     </div>
//                   </div>
//                   <h1 className={cn("serif text-[clamp(1.8rem,3.5vw,3rem)] font-normal leading-none", t.text)}>
//                     {product.product_name}
//                   </h1>
//                   <div className={cn("text-sm", t.textMuted)}>
//                     {product.category || "UNCATEGORIZED"} · SKU: {product.sku} · {product.product_type || "General"}
//                   </div>
//                 </div>
//               </div>

//               <div className="flex flex-wrap items-center gap-2">
//                 <button onClick={() => router.back()}
//                   className={cn("flex h-10 items-center gap-2 rounded-xl border px-4 text-[13px] font-semibold transition-all", t.btn)}>
//                   <ArrowLeft className="h-4 w-4" /> Back
//                 </button>
//                 <button onClick={() => router.push(`/dashboard/product/${product.id}/edit`)}
//                   className={cn("flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-bold transition-all", t.btnPrimary)}>
//                   <Pencil className="h-4 w-4" /> Edit
//                 </button>
//                 <button onClick={() => loadProduct()}
//                   className={cn("flex h-10 items-center gap-2 rounded-xl border px-4 text-[13px] font-semibold transition-all", t.btn)}>
//                   <RefreshCw className="h-4 w-4" /> Refresh
//                 </button>
//                 <LanternToggle dark={theme === "dark"} onToggle={() => setNextTheme(theme === "dark" ? "light" : "dark")} />
//               </div>
//             </div>
//           </motion.div>

//           {/* ── MAIN GRID ── */}
//           <div className="grid gap-5 xl:grid-cols-[1.4fr_0.85fr] 2xl:gap-8">

//             {/* ── LEFT ── */}
//             <div className="space-y-5">

//               {/* gallery + 3D scene */}
//               <div className="grid gap-5 xl:grid-cols-[110px_minmax(0,1fr)] 2xl:grid-cols-[130px_minmax(0,1fr)]">
//                 {/* gallery strip */}
//                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
//                   className={cn("rounded-[24px] border p-3", t.card)}>
//                   <div className="space-y-3">
//                     {gallery.map((item) => (
//                       <GalleryTile key={item.id} item={item} active={item.id === activeGall?.id} onClick={() => setActiveGallId(item.id)} />
//                     ))}
//                   </div>
//                 </motion.div>

//                 {/* 3D scene */}
//                 <motion.div className="[perspective:1800px]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
//                   <motion.div whileHover={{ rotateX: 3, rotateY: -6, scale: 1.01 }}
//                     transition={{ type: "spring", stiffness: 180, damping: 18 }}
//                     style={{ transformStyle: "preserve-3d" }}>
//                     <div className={cn("group overflow-hidden rounded-[24px] border", t.card)}>
//                       <div className="relative min-h-[420px] 2xl:min-h-[580px]">
//                         {activeGall && <ProductScene product={product} galleryItem={activeGall} theme={theme} />}

//                         {/* preview button */}
//                         <button type="button" onClick={() => setImgPreview(true)}
//                           className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-black/30 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-black/45">
//                           <Eye className="h-4 w-4" /> Preview
//                         </button>

//                         {/* stock badge + discount */}
//                         <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
//                           <StockBadge stock={stock} />
//                           {Number(product.product_discount || 0) > 0 && (
//                             <Badge className="rounded-full border border-white/20 bg-emerald-500/20 text-white backdrop-blur px-3 py-1 text-[10px] font-bold">
//                               -{product.product_discount}
//                             </Badge>
//                           )}
//                           {/* lantern watermark on dark */}
//                           {theme === "dark" && (
//                             <div className="rounded-full border border-[rgba(200,137,42,0.2)] bg-[rgba(20,10,2,0.45)] px-2 py-1 backdrop-blur">
//                               <LanternMark size={16} glow />
//                             </div>
//                           )}
//                         </div>

//                         {/* bottom info chips */}
//                         <div className="absolute inset-x-0 bottom-16 z-10 px-4 grid gap-3 md:grid-cols-3">
//                           {[
//                             { label: "PRICE", value: money(product.product_price) },
//                             { label: "SKU",   value: product.sku },
//                             { label: "TYPE",  value: product.product_type || "General" },
//                           ].map((item) => (
//                             <div key={item.label} className="rounded-2xl border border-white/20 bg-black/25 px-4 py-3 text-white backdrop-blur">
//                               <div className="text-[10px] font-black tracking-[0.18em] text-white/70">{item.label}</div>
//                               <div className="text-sm font-black break-all">{item.value}</div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   </motion.div>
//                 </motion.div>
//               </div>

//               {/* analytics */}
//               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
//                 className={cn("rounded-[24px] border p-5 2xl:p-7", t.card)}>
//                 <div className="mb-5 flex items-center gap-2">
//                   <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", t.metricIcon, t.textMuted)}>
//                     <Gauge className="h-4 w-4" />
//                   </div>
//                   <div>
//                     <div className={cn("font-black", t.text)}>Stock Analytics</div>
//                     <div className={cn("text-xs", t.textMuted)}>live metrics</div>
//                   </div>
//                 </div>

//                 <div className="mb-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
//                   <MetricCard theme={theme} icon={<Wallet       className="h-4 w-4" />} label="PRICE"     value={<AnimatedNumber value={product.product_price} />} sub="current price" />
//                   <MetricCard theme={theme} icon={<Boxes        className="h-4 w-4" />} label="STOCK"     value={<AnimatedNumber value={stock} />} sub="available now" tone={stock <= 0 ? "danger" : stock < 5 ? "warn" : "good"} />
//                   <MetricCard theme={theme} icon={<ArrowUpRight   className="h-4 w-4" />} label="TOTAL IN"  value={<AnimatedNumber value={totalIn} />} sub="sum of IN" tone="good" />
//                   <MetricCard theme={theme} icon={<ArrowDownRight className="h-4 w-4" />} label="TOTAL OUT" value={<AnimatedNumber value={totalOut} />} sub="sum of OUT" tone="danger" />
//                 </div>

//                 <div className="grid gap-4 xl:grid-cols-3">
//                   <div className={cn("xl:col-span-2 rounded-[20px] border p-4", t.soft)}>
//                     <div className="flex items-center justify-between gap-3 mb-4">
//                       <div className={cn("text-[13px] font-bold", t.text)}>Stock Health</div>
//                       <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-bold", t.pill)}>{stock} units</span>
//                     </div>
//                     <StockBar stock={stock} theme={theme} />
//                     <div className="mt-4 grid grid-cols-3 gap-3">
//                       {[
//                         { label: "IN",     value: totalIn,     cls: "text-emerald-400" },
//                         { label: "OUT",    value: totalOut,    cls: "text-rose-400"    },
//                         { label: "ADJUST", value: adjustCount, cls: "text-amber-400"   },
//                       ].map((item) => (
//                         <div key={item.label} className={cn("rounded-xl border p-3", t.soft)}>
//                           <div className={cn("text-[10px] font-black tracking-[0.18em]", t.textSubtle)}>{item.label}</div>
//                           <div className={cn("mt-1 font-black", item.cls)}>{numberFormat(item.value)}</div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>

//                   <div className={cn("rounded-[20px] border p-4", t.soft)}>
//                     <div className="flex items-center gap-2 mb-4">
//                       <Clock3 className={cn("h-4 w-4", t.textMuted)} />
//                       <div className={cn("text-[13px] font-bold", t.text)}>Last Activity</div>
//                     </div>
//                     {lastMove ? (
//                       <div className="space-y-2">
//                         {movementBadge(lastMove.type)}
//                         <div className={cn("text-lg font-black", t.text)}>{numberFormat(lastMove.before_qty)} → {numberFormat(lastMove.after_qty)}</div>
//                         <div className={cn("text-xs", t.textMuted)}>{new Date(lastMove.created_at).toLocaleString()}</div>
//                         <div className={cn("text-xs", t.textMuted)}>{lastMove.note || "No note"}</div>
//                       </div>
//                     ) : (
//                       <div className={cn("text-sm", t.textMuted)}>No recent movement</div>
//                     )}
//                   </div>
//                 </div>
//               </motion.div>

//               {/* kanban movements */}
//               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
//                 className={cn("rounded-[24px] border p-5 2xl:p-7", t.card)}>
//                 <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//                   <div className="flex items-center gap-3">
//                     <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", t.metricIcon, t.textMuted)}>
//                       <ArrowRightLeft className="h-4 w-4" />
//                     </div>
//                     <div>
//                       <div className={cn("font-black", t.text)}>Movement Kanban</div>
//                       <div className={cn("text-xs", t.textMuted)}>IN / OUT / ADJUST lanes · drag to rearrange</div>
//                     </div>
//                   </div>
//                   <div className="flex flex-wrap items-center gap-2">
//                     <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-bold", t.pill)}>{mTotal} total</span>
//                     <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-bold", t.pill)}>
//                       Page {Math.min(mPage, mTotalPages)} / {mTotalPages}
//                     </span>
//                     <select value={mPageSize} onChange={(e) => { setMPageSize(Number(e.target.value)); setMPage(1); }}
//                       className={cn("h-9 rounded-xl border px-3 text-[12px] outline-none", t.input)}>
//                       {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
//                     </select>
//                     <button onClick={() => loadMovements(true)} disabled={movesLoading}
//                       className={cn("flex h-9 items-center gap-2 rounded-xl border px-3 text-[12px] font-semibold transition-all", t.btn)}>
//                       <RefreshCw className={cn("h-4 w-4", movesLoading && "animate-spin")} /> Refresh
//                     </button>
//                   </div>
//                 </div>

//                 {mTotal === 0 && movesLoaded
//                   ? <div className={cn("rounded-2xl border p-8 text-center text-sm", t.soft, t.textMuted)}>Movements မရှိသေးပါ</div>
//                   : (
//                     <DndContext sensors={sensors} collisionDetection={closestCenter}
//                       onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
//                       <div className="grid gap-4 xl:grid-cols-3">
//                         {laneKeys.map((laneKey) => (
//                           <MovementLane key={laneKey} laneKey={laneKey} items={movLanes[laneKey]}
//                             theme={theme} isActiveLane={activeLane === laneKey} />
//                         ))}
//                       </div>
//                       <DragOverlay>
//                         {activeMove && (
//                           <div className={cn("w-[340px] overflow-hidden rounded-[22px] border p-4 shadow-2xl", t.card)}>
//                             <div className="flex items-center gap-2 mb-2">{movementBadge(activeMove.type)}</div>
//                             <div className={cn("text-sm font-medium", t.text)}>
//                               Qty {numberFormat(activeMove.qty)} · {numberFormat(activeMove.before_qty)} → {numberFormat(activeMove.after_qty)}
//                             </div>
//                             <div className={cn("mt-1 text-xs", t.textMuted)}>{activeMove.note || "No note"}</div>
//                           </div>
//                         )}
//                       </DragOverlay>
//                     </DndContext>
//                   )
//                 }
//                 <div className={cn("mt-3 text-[11px] font-mono", t.textSubtle)}>Frontend preview only · refresh ရင် backend state ပြန်လာနိုင်သည်</div>
//               </motion.div>
//             </div>

//             {/* ── RIGHT SIDEBAR ── */}
//             <div className="space-y-5 xl:sticky xl:top-6 self-start">

//               {/* quick control */}
//               <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
//                 className={cn("rounded-[24px] border p-5", t.card)}>
//                 <div className="mb-4 flex items-center gap-2">
//                   {theme === "dark" && <div className="h-2.5 w-2.5 rounded-full" style={{ background: "radial-gradient(circle, #fff7cc 0%, #fbbf24 42%, #f59e0b 70%, #b45309 100%)", boxShadow: "0 0 10px rgba(251,191,36,.45)" }} />}
//                   <div className={cn("font-black", t.text)}>Quick Control</div>
//                 </div>
//                 <div className="space-y-2">
//                   {[
//                     { mode: "IN"     as const, icon: <TrendingUp   className="h-4 w-4" />, label: "Stock IN",           cls: t.btn },
//                     { mode: "OUT"    as const, icon: <TrendingDown  className="h-4 w-4" />, label: "Stock OUT",          cls: t.btn },
//                     { mode: "ADJUST" as const, icon: <History       className="h-4 w-4" />, label: "Stock Adjust",       cls: t.btn },
//                   ].map((item) => (
//                     <button key={item.mode} onClick={() => openStockModal(item.mode)}
//                       className={cn("flex w-full h-11 items-center gap-3 rounded-xl border px-4 text-[13px] font-semibold transition-all justify-start", item.cls)}>
//                       {item.icon} {item.label}
//                     </button>
//                   ))}
//                   <button onClick={() => setImgPreview(true)}
//                     className={cn("flex w-full h-11 items-center gap-3 rounded-xl border px-4 text-[13px] font-semibold transition-all justify-start", t.btn)}>
//                     <ImageIcon className="h-4 w-4" /> Image Preview
//                   </button>
//                   <button onClick={printBarcode}
//                     className={cn("flex w-full h-11 items-center gap-3 rounded-xl border px-4 text-[13px] font-semibold transition-all justify-start", t.btn)}>
//                     <Printer className="h-4 w-4" /> Print Barcode
//                   </button>
//                 </div>
//               </motion.div>

//               {/* product info */}
//               <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
//                 className={cn("rounded-[24px] border p-5", t.card)}>
//                 <div className="mb-4 flex items-center gap-2">
//                   {theme === "dark" && <LanternMark size={18} glow />}
//                   <div className={cn("font-black", t.text)}>Product Info</div>
//                 </div>
//                 <div className="space-y-3">
//                   <MetricCard theme={theme} icon={<CircleDollarSign className="h-4 w-4" />} label="PRICE"    value={money(product.product_price)} />
//                   <MetricCard theme={theme} icon={<Box              className="h-4 w-4" />} label="SKU"      value={<span className="text-sm break-all">{product.sku}</span>} />
//                   <MetricCard theme={theme} icon={<Tag              className="h-4 w-4" />} label="CATEGORY" value={<span className="text-sm">{product.category || "UNCATEGORIZED"}</span>} />
//                   <MetricCard theme={theme} icon={<Zap              className="h-4 w-4" />} label="TYPE"     value={<span className="text-sm">{product.product_type || "General"}</span>} />
//                   <MetricCard theme={theme} icon={<Boxes            className="h-4 w-4" />} label="STOCK"    value={<AnimatedNumber value={stock} />} tone={stock <= 0 ? "danger" : stock < 5 ? "warn" : "good"} />
//                 </div>
//                 {product.note && (
//                   <div className={cn("mt-4 rounded-2xl border p-4", t.soft)}>
//                     <div className={cn("mb-1 text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>Note</div>
//                     <p className={cn("text-sm whitespace-pre-wrap", t.textMuted)}>{product.note}</p>
//                   </div>
//                 )}
//               </motion.div>

//               {/* barcode */}
//               <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
//                 className={cn("rounded-[24px] border p-5", t.card)}>
//                 <div className="mb-4 flex items-center justify-between gap-3">
//                   <div className="flex items-center gap-2">
//                     <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", t.metricIcon, t.textMuted)}>
//                       <BarcodeIcon className="h-4 w-4" />
//                     </div>
//                     <div>
//                       <div className={cn("font-black", t.text)}>Barcode</div>
//                       <div className={cn("text-[11px]", t.textMuted)}>uses {product.barcode ? "barcode" : "SKU"}</div>
//                     </div>
//                   </div>
//                   <button onClick={printBarcode}
//                     className={cn("flex h-9 items-center gap-2 rounded-xl border px-3 text-[12px] font-semibold transition-all", t.btn)}>
//                     <Printer className="h-4 w-4" /> Print
//                   </button>
//                 </div>
//                 <div className={cn("overflow-x-auto rounded-2xl border p-4", t.soft)}>
//                   <svg ref={barcodeSvgRef} />
//                 </div>
//               </motion.div>
//             </div>
//           </div>
//         </div>

//         {/* ── STOCK MODAL ── */}
//         <Dialog open={stockOpen} onOpenChange={setStockOpen}>
//           <DialogContent className="sm:max-w-md">
//             <DialogHeader>
//               <DialogTitle className="flex items-center gap-2">
//                 {theme === "dark" && <LanternMark size={20} glow />}
//                 {stockMode === "IN" ? "Stock IN" : stockMode === "OUT" ? "Stock OUT" : "Stock Adjust"}
//               </DialogTitle>
//               <DialogDescription>
//                 {stockMode === "ADJUST" ? "Final stock (absolute) ကို သတ်မှတ်ပါ" : "Delta qty ထည့်ပါ"}
//               </DialogDescription>
//             </DialogHeader>
//             <div className="space-y-3">
//               <div className="space-y-1.5">
//                 <Label>Qty</Label>
//                 <Input type="number" value={stockQty} onChange={(e) => setStockQty(Number(e.target.value))}
//                   min={stockMode === "ADJUST" ? 0 : 1} />
//                 {stockMode === "OUT" && (
//                   <p className="text-xs text-muted-foreground">Current stock: <b>{product?.product_quantity_amount ?? 0}</b></p>
//                 )}
//               </div>
//               <div className="space-y-1.5">
//                 <Label>Note (optional)</Label>
//                 <Input value={stockNote} onChange={(e) => setStockNote(e.target.value)}
//                   placeholder="e.g. restock from supplier / sale invoice..." />
//               </div>
//             </div>
//             <DialogFooter className="gap-2">
//               <button onClick={() => setStockOpen(false)} disabled={stockSaving}
//                 className={cn("flex h-10 items-center rounded-xl border px-5 text-[13px] font-semibold transition-all", tk(theme).btn)}>
//                 Cancel
//               </button>
//               <button onClick={submitStock} disabled={stockSaving}
//                 className={cn("flex h-10 items-center gap-2 rounded-xl px-5 text-[13px] font-bold transition-all", tk(theme).btnPrimary)}>
//                 {stockSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
//                 {stockSaving ? "Saving..." : "Confirm"}
//               </button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </>
//   );
// }
















"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import JsBarcode from "jsbarcode";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ArrowLeft,
  Bot,
  ScanLine,
  Tag,
  Upload,
  Image as ImageIcon,
  Crop,
  RefreshCw,
  Loader2,
  Wand2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Package2,
  Boxes,
  CircleDollarSign,
  Sparkles,
  Trash2,
  Save,
  X,
  RotateCcw,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────────────────
// Font + Keyframe Animations
// ─────────────────────────────────────────────────────────────────────────────

function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;700;900&display=swap');
      * { font-family: 'DM Sans', sans-serif; }
      .serif { font-family: 'DM Serif Display', serif !important; }
      @keyframes lantern-float {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-7px); }
      }
      @keyframes lantern-breathe {
        0%, 100% { opacity: .72; transform: scale(1); }
        50%       { opacity: 1;   transform: scale(1.06); }
      }
      @keyframes ember-rise {
        0%   { transform: translateY(0)   translateX(0)  scale(1);   opacity: .55; }
        50%  { transform: translateY(-18px) translateX(5px)  scale(1.1); opacity: .9; }
        100% { transform: translateY(-36px) translateX(-2px) scale(.5);  opacity: 0; }
      }
    `}</style>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme tokens — exact mirror of product list + create pages
// ─────────────────────────────────────────────────────────────────────────────

type Theme = "dark" | "light";

const tk = (theme: Theme) =>
  theme === "dark"
    ? {
        root:        "bg-[#05060d]",
        text:        "text-[#f3e7d2]",
        textMuted:   "text-[#bca98f]",
        textSubtle:  "text-[#8a7a65]",
        card:        "border-[rgba(200,137,42,0.16)] bg-[rgba(14,10,6,0.84)] backdrop-blur-xl",
        cardHover:   "hover:border-[rgba(212,163,82,0.35)] hover:bg-[rgba(255,255,255,0.05)]",
        input:       "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#f3e7d2] placeholder:text-[#8a7a65] focus-visible:border-[#c8892a] focus-visible:ring-[#c8892a]/20",
        btn:         "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#d4b68a] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f3e7d2] hover:border-[rgba(212,163,82,0.25)]",
        btnPrimary:  "bg-gradient-to-r from-[#a07020] to-[#d4a352] text-[#140d05] hover:from-[#b37a22] hover:to-[#deb25a] shadow-lg shadow-[#c8892a]/20",
        btnDanger:   "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20",
        pill:        "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#bca98f]",
        soft:        "bg-[rgba(255,255,255,0.03)]",
        glow1:       "bg-amber-700/[0.16]",
        glow2:       "bg-orange-700/[0.10]",
        sugWrap:     "border-[rgba(200,137,42,0.25)] bg-[rgba(200,137,42,0.07)]",
        sugItem:     "bg-[rgba(255,255,255,0.04)]",
        aiPanel:     "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]",
        imgDrop:     "border-[rgba(255,255,255,0.14)] hover:border-[#c8892a] hover:bg-[rgba(200,137,42,0.05)]",
        previewCard: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]",
        tag:         "bg-[rgba(200,137,42,0.12)] border-[rgba(200,137,42,0.25)] text-[#d4a352]",
        modalBg:     "bg-[rgba(10,8,3,0.96)] border-[rgba(212,163,82,0.16)] backdrop-blur-3xl",
        divider:     "bg-[rgba(255,255,255,0.07)]",
        changedField:"border-[#c8892a] bg-[rgba(200,137,42,0.06)]",
      }
    : {
        root:        "bg-[#f0f4ff]",
        text:        "text-slate-900",
        textMuted:   "text-slate-500",
        textSubtle:  "text-slate-400",
        card:        "border-slate-200/80 bg-white/90 shadow-[0_2px_16px_rgba(15,23,42,0.06)]",
        cardHover:   "hover:border-slate-300 hover:shadow-[0_4px_24px_rgba(15,23,42,0.10)]",
        input:       "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-blue-500 focus-visible:ring-blue-500/20",
        btn:         "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
        btnPrimary:  "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/25",
        btnDanger:   "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
        pill:        "border-slate-200 bg-white text-slate-500 shadow-sm",
        soft:        "bg-slate-50",
        glow1:       "bg-violet-300/20",
        glow2:       "bg-blue-300/20",
        sugWrap:     "border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.05)]",
        sugItem:     "bg-white",
        aiPanel:     "border-[rgba(99,102,241,0.15)] bg-[rgba(59,130,246,0.04)]",
        imgDrop:     "border-slate-300 hover:border-violet-500 hover:bg-violet-50/40",
        previewCard: "border-slate-200 bg-slate-50",
        tag:         "bg-violet-100 border-violet-200 text-violet-700",
        modalBg:     "bg-white/95 border-slate-200/80 shadow-2xl backdrop-blur-xl",
        divider:     "bg-slate-200",
        changedField:"border-blue-400 bg-blue-50/40",
      };

// ─────────────────────────────────────────────────────────────────────────────
// LanternMark SVG
// ─────────────────────────────────────────────────────────────────────────────

function LanternMark({ size = 34, glow = false }: { size?: number; glow?: boolean }) {
  const h = size * 1.5;
  return (
    <svg width={size} height={h} viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lgGlowEdit" cx="50%" cy="48%" r="50%">
          <stop offset="0%"   stopColor="#fff7d6" stopOpacity="0.96" />
          <stop offset="28%"  stopColor="#fbbf24" stopOpacity="0.86" />
          <stop offset="60%"  stopColor="#f59e0b" stopOpacity="0.44" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0"    />
        </radialGradient>
        <linearGradient id="lmMetalEdit" x1="8" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#c58a3c" />
          <stop offset="50%"  stopColor="#a96b28" />
          <stop offset="100%" stopColor="#8a551d" />
        </linearGradient>
        <linearGradient id="lbBodyEdit" x1="6" y1="11" x2="26" y2="37" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#fffaf1" />
          <stop offset="45%"  stopColor="#f5e7cf" />
          <stop offset="100%" stopColor="#ecd5ae" />
        </linearGradient>
      </defs>
      <line x1="16" y1="0" x2="16" y2="6" stroke={glow ? "#d6ae67" : "#9d6a2b"} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="8" y="6" width="16" height="5" rx="2" fill="url(#lmMetalEdit)" stroke="#7b4a18" strokeWidth="0.8" />
      <rect x="6" y="11" width="20" height="26" rx="3" fill={glow ? "#0e0908" : "url(#lbBodyEdit)"} stroke="#a66b27" strokeWidth="1" />
      {glow && <rect x="6" y="11" width="20" height="26" rx="3" fill="url(#lgGlowEdit)" />}
      {[11, 16, 21].map((x) => (
        <line key={x} x1={x} y1="11" x2={x} y2="37" stroke={glow ? "#6b3e10" : "#b47b34"} strokeWidth="1" opacity="0.95" />
      ))}
      {glow && (
        <>
          <motion.ellipse cx="16" cy="26" rx="4" ry="6" fill="#f59e0b" opacity="0.68"
            animate={{ ry: [6, 7.1, 5.3, 6.7, 6], cx: [16, 15.7, 16.3, 15.9, 16] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }} />
          <motion.ellipse cx="16" cy="27" rx="2.5" ry="4.2" fill="#fde68a"
            animate={{ ry: [4.2, 5, 3.6, 4.5, 4.2] }}
            transition={{ duration: 0.95, repeat: Infinity, ease: "easeInOut" }} />
        </>
      )}
      <rect x="8" y="37" width="16" height="5" rx="2" fill="url(#lmMetalEdit)" stroke="#7b4a18" strokeWidth="0.8" />
      <line x1="16" y1="42" x2="16" y2="47" stroke="#8f5b24" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="47" r="1.5" fill="#8f5b24" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LanternToggle
// ─────────────────────────────────────────────────────────────────────────────

function LanternToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <motion.button
      type="button" onClick={onToggle}
      whileHover={{ y: -2, scale: 1.04 }} whileTap={{ scale: 0.94 }}
      className="relative flex flex-col items-center focus:outline-none"
      style={{ width: 58 }}
      aria-label={dark ? "Switch to day mode" : "Switch to night mode"}
    >
      {dark && (
        <div className="pointer-events-none absolute" style={{
          width: 76, height: 76, top: -6, left: "50%",
          transform: "translateX(-50%)", borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(251,191,36,0.52) 0%, rgba(245,158,11,0.18) 52%, transparent 76%)",
          filter: "blur(9px)", animation: "lantern-breathe 2.8s ease-in-out infinite",
        }} />
      )}
      <div style={{ animation: "lantern-float 3s ease-in-out infinite" }}>
        <LanternMark size={34} glow={dark} />
      </div>
      <span style={{ marginTop: 5, fontSize: 7, fontWeight: 700, letterSpacing: "0.2em", color: dark ? "#c8892a" : "#9a6c2a" }}>
        {dark ? "NIGHT" : "DAY"}
      </span>
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NightParticles
// ─────────────────────────────────────────────────────────────────────────────

function NightParticles() {
  const particles = Array.from({ length: 26 }).map((_, i) => ({
    id: i, left: `${(i * 31 + 9) % 100}%`, top: `${(i * 43 + 11) % 100}%`,
    size: 1.5 + (i % 3), delay: (i * 0.25) % 4, duration: 2.8 + (i % 4) * 0.8,
  }));
  const embers = Array.from({ length: 10 }).map((_, i) => ({
    id: i, left: `${38 + (i % 5) * 5 - 10}%`, delay: i * 0.4,
    size: 3 + (i % 3), dur: 3.5 + (i % 4) * 0.5,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full bg-amber-100"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ opacity: [0.08, 0.9, 0.08], scale: [0.7, 1.4, 0.7] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }} />
      ))}
      {embers.map((e) => (
        <div key={e.id} style={{
          position: "absolute", bottom: "56%", left: e.left,
          width: e.size, height: e.size, borderRadius: "50%",
          background: "radial-gradient(circle, #ffe080 0%, #ff8820 60%, transparent 100%)",
          boxShadow: "0 0 6px 2px rgba(255,160,40,0.6)",
          animation: `ember-rise ${e.dur}s ${e.delay}s ease-out infinite`, opacity: 0,
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete Confirm Modal
// ─────────────────────────────────────────────────────────────────────────────

function DeleteModal({
  theme, productName, loading,
  onClose, onConfirm,
}: {
  theme: Theme; productName: string; loading: boolean;
  onClose: () => void; onConfirm: () => void;
}) {
  const t = tk(theme);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(14px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
        className={cn("w-full max-w-[420px] overflow-hidden rounded-3xl border", t.modalBg)}
      >
        {/* top line */}
        <div className="h-[2px]" style={{ background: "linear-gradient(90deg,transparent,#e05050,transparent)" }} />

        <div className="flex items-start justify-between px-6 py-5" style={{ borderBottom: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }}>
          <div>
            <div className={cn("text-[17px] font-black", t.text)}>Delete Product</div>
            <div className={cn("mt-0.5 text-[12px]", t.textMuted)}>This action cannot be undone</div>
          </div>
          <button onClick={onClose} className={cn("rounded-xl border p-2 transition-all", t.btn)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-2">
          <div className={cn("text-[13px]", t.textMuted)}>Are you sure you want to permanently delete</div>
          <div className={cn("text-[20px] font-black", t.text)}>{productName}</div>
        </div>

        <div className="flex gap-3 px-6 py-4" style={{ borderTop: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}` }}>
          <button onClick={onClose} className={cn("flex-1 rounded-xl border py-2.5 text-[13px] font-bold transition-all", t.btn)}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className={cn("flex-1 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-[13px] font-bold transition-all", t.btnDanger)}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ProductForm = {
  sku: string; product_name: string; product_price: string;
  barcode: string; category: string; product_quantity_amount: string;
  product_discount: string; note: string; product_type: string;
};

type CategoryOption = { label: string; value: string };
type BusinessType = "SUPERMARKET" | "RESTAURANT" | "FASHION";

const BUSINESS_OPTIONS: Record<BusinessType, {
  categories: CategoryOption[];
  productTypes: CategoryOption[];
}> = {
  SUPERMARKET: {
    categories: [
      { label: "Beverages", value: "BEVERAGES" },
      { label: "Food", value: "FOOD" },
      { label: "Snacks", value: "SNACKS" },
      { label: "Fresh Produce", value: "FRESH_PRODUCE" },
      { label: "Meat & Seafood", value: "MEAT_SEAFOOD" },
      { label: "Dairy & Eggs", value: "DAIRY_EGGS" },
      { label: "Bakery", value: "BAKERY" },
      { label: "Frozen", value: "FROZEN" },
      { label: "Household", value: "HOUSEHOLD" },
      { label: "Personal Care", value: "PERSONAL_CARE" },
      { label: "Cosmetic", value: "COSMETIC" },
      { label: "Other", value: "OTHER" },
    ],
    productTypes: [
      { label: "Drink", value: "DRINK" },
      { label: "Food", value: "FOOD" },
      { label: "Snack", value: "SNACK" },
      { label: "Grocery", value: "GROCERY" },
      { label: "Fresh", value: "FRESH" },
      { label: "Frozen", value: "FROZEN" },
      { label: "Household", value: "HOUSEHOLD" },
      { label: "Personal Care", value: "PERSONAL_CARE" },
      { label: "Other", value: "OTHER" },
    ],
  },
  RESTAURANT: {
    categories: [
      { label: "Appetizers", value: "APPETIZERS" },
      { label: "Main Course", value: "MAIN_COURSE" },
      { label: "Rice & Noodles", value: "RICE_NOODLES" },
      { label: "Soup", value: "SOUP" },
      { label: "Salad", value: "SALAD" },
      { label: "Grill", value: "GRILL" },
      { label: "Dessert", value: "DESSERT" },
      { label: "Hot Drinks", value: "HOT_DRINKS" },
      { label: "Cold Drinks", value: "COLD_DRINKS" },
      { label: "Alcohol", value: "ALCOHOL" },
      { label: "Combo / Set", value: "COMBO_SET" },
      { label: "Other", value: "OTHER" },
    ],
    productTypes: [
      { label: "Food", value: "FOOD" },
      { label: "Drink", value: "DRINK" },
      { label: "Dessert", value: "DESSERT" },
      { label: "Combo", value: "COMBO" },
      { label: "Add-on", value: "ADD_ON" },
      { label: "Modifier", value: "MODIFIER" },
      { label: "Other", value: "OTHER" },
    ],
  },
  FASHION: {
    categories: [
      { label: "Men", value: "MEN" },
      { label: "Women", value: "WOMEN" },
      { label: "Kids", value: "KIDS" },
      { label: "Tops", value: "TOPS" },
      { label: "Bottoms", value: "BOTTOMS" },
      { label: "Dresses", value: "DRESSES" },
      { label: "Outerwear", value: "OUTERWEAR" },
      { label: "Shoes", value: "SHOES" },
      { label: "Bags", value: "BAGS" },
      { label: "Accessories", value: "ACCESSORIES" },
      { label: "Sportswear", value: "SPORTSWEAR" },
      { label: "Other", value: "OTHER" },
    ],
    productTypes: [
      { label: "Shirt", value: "SHIRT" },
      { label: "T-Shirt", value: "T_SHIRT" },
      { label: "Pants", value: "PANTS" },
      { label: "Jeans", value: "JEANS" },
      { label: "Dress", value: "DRESS" },
      { label: "Skirt", value: "SKIRT" },
      { label: "Jacket", value: "JACKET" },
      { label: "Shoes", value: "SHOES" },
      { label: "Bag", value: "BAG" },
      { label: "Accessory", value: "ACCESSORY" },
      { label: "Other", value: "OTHER" },
    ],
  },
};

function normalizeBusinessType(value: unknown): BusinessType | null {
  const v = String(value ?? "").trim().toUpperCase();
  if (v === "SUPERMARKET" || v === "RESTAURANT" || v === "FASHION") return v;
  return null;
}

function getSessionBusinessType(session: any): BusinessType | null {
  // Prefer the literal business_type field from the authenticated user session.
  return normalizeBusinessType(
    session?.user?.business_type ??
    session?.user?.businessType ??
    session?.user?.shop_business_type ??
    session?.user?.shopBusinessType ??
    session?.business_type ??
    session?.businessType ??
    session?.shop_business_type ??
    session?.shopBusinessType ??
    session?.shop?.business_type ??
    session?.shop?.businessType
  );
}

function withCurrentOption(options: CategoryOption[], current: string): CategoryOption[] {
  const value = String(current ?? "").trim().toUpperCase();
  if (!value || options.some((o) => o.value === value)) return options;
  return [{ label: value.replace(/_/g, " "), value }, ...options];
}

type AISuggestion = {
  sku: string; category: string; product_type: string;
  suggested_price: string; note: string; barcode: string;
  reasoning: string; confidence: "high" | "medium" | "low"; tags: string[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM: ProductForm = {
  sku: "", product_name: "", product_price: "", barcode: "",
  category: "", product_quantity_amount: "0", product_discount: "0",
  note: "", product_type: "OTHER",
};

const FALLBACK_CATEGORIES: CategoryOption[] = [
  { label: "Drink",     value: "DRINK"     },
  { label: "Food",      value: "FOOD"      },
  { label: "Snack",     value: "SNACK"     },
  { label: "Household", value: "HOUSEHOLD" },
  { label: "Frozen",    value: "FROZEN"    },
  { label: "Cosmetic",  value: "COSMETIC"  },
  { label: "Other",     value: "OTHER"     },
];

const CONFIDENCE_COLORS: Record<string, string> = {
  high:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  medium: "bg-amber-500/10  text-amber-400  border-amber-500/20",
  low:    "bg-rose-500/10   text-rose-400   border-rose-500/20",
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function normalizeTokenType(v: unknown) {
  return String(v ?? "Bearer").replace(/\s+/g, " ").trim() || "Bearer";
}
function slugify(v: string) {
  return v.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24);
}
function generateSku(name: string) {
  return `${(slugify(name).slice(0, 10) || "PRODUCT")}-${1000 + Math.floor(Math.random() * 9000)}`;
}
function generateBarcodeString(seed = "") {
  const base    = String(Date.now()).slice(-9);
  const extra   = String(Math.floor(100 + Math.random() * 900));
  const cleaned = seed.replace(/\D/g, "").slice(0, 4);
  return `${cleaned}${base}${extra}`.slice(0, 13);
}
function inferCategory(name: string) {
  const n = name.toLowerCase();
  if (["cola","coffee","tea","juice","water","drink","soda","milk","beer"].some((k) => n.includes(k))) return "DRINK";
  if (["chip","cracker","cookie","snack","nuts","candy","chocolate"].some((k) => n.includes(k)))       return "SNACK";
  if (["rice","bread","noodle","food","egg","meat","sausage","oil","sauce"].some((k) => n.includes(k))) return "FOOD";
  if (["soap","clean","tissue","detergent","shampoo","brush"].some((k) => n.includes(k)))              return "HOUSEHOLD";
  if (["ice cream","frozen","nugget","dumpling"].some((k) => n.includes(k)))                           return "FROZEN";
  if (["cream","lotion","powder","lip","cosmetic"].some((k) => n.includes(k)))                         return "COSMETIC";
  return "OTHER";
}
function inferType(name: string) {
  const n = name.toLowerCase();
  if (["cola","coffee","tea","juice","water","drink","soda","milk"].some((k) => n.includes(k))) return "DRINK";
  if (["rice","bread","noodle","food","egg","meat"].some((k) => n.includes(k)))                 return "FOOD";
  if (["chip","cracker","cookie","snack","nuts","candy"].some((k) => n.includes(k)))             return "SNACK";
  return "OTHER";
}
function inferPrice(name: string, category: string) {
  const n = name.toLowerCase();
  if (n.includes("500ml") && category === "DRINK") return "700";
  if (n.includes("330ml") && category === "DRINK") return "500";
  if (n.includes("1l")    && category === "DRINK") return "1200";
  if (n.includes("2l")    && category === "DRINK") return "2200";
  if (category === "SNACK")     return "500";
  if (category === "FOOD")      return "1500";
  if (category === "HOUSEHOLD") return "2500";
  if (category === "FROZEN")    return "3500";
  if (category === "COSMETIC")  return "4000";
  return "1000";
}
function localAIFill(productName: string): AISuggestion {
  const trimmed      = productName.trim();
  const category     = inferCategory(trimmed);
  const product_type = inferType(trimmed);
  const sku          = generateSku(trimmed);
  const barcode      = generateBarcodeString(sku);
  const suggested_price = inferPrice(trimmed, category);
  const tags = Array.from(new Set([category.toLowerCase(), product_type.toLowerCase(), "packaged"])).slice(0, 5);
  let confidence: AISuggestion["confidence"] = "medium";
  if (["coca cola","pepsi","sprite","fanta","coffee mix","lays"].some((k) => trimmed.toLowerCase().includes(k))) confidence = "high";
  else if (trimmed.length < 4) confidence = "low";
  return {
    sku, category, product_type, suggested_price, barcode, tags,
    note: `${trimmed} is categorized as ${category.toLowerCase()} item for retail sale.`,
    reasoning: `Local AI checked keywords in "${trimmed}". Detected category: ${category}. Detected type: ${product_type}. Estimated Myanmar retail price.`,
    confidence,
  };
}

function buildImageUrl(path?: string | null) {
  if (!path) return null;
  const raw = String(path).trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  const cleaned = raw.replace(/^\/?uploads\/?/, "").replace(/^\/+/, "");
  return `/uploads/${cleaned}`;
}

async function cropImageToSquare(file: File): Promise<File> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result ?? ""));
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const el = new Image();
    el.onload = () => res(el);
    el.onerror = rej;
    el.src = dataUrl;
  });
  const size = Math.min(img.width, img.height);
  const sx = Math.floor((img.width - size) / 2);
  const sy = Math.floor((img.height - size) / 2);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.92));
  if (!blob) throw new Error("Crop failed");
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + "-crop.jpg", { type: "image/jpeg" });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ProductEditPage() {
  const router                                    = useRouter();
  const params                                    = useParams();
  const productId                                 = String(params?.id ?? "");
  const { data: session, status }                 = useSession();
  const { resolvedTheme, setTheme: setNextTheme } = useTheme();

  // theme
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => { setTheme(resolvedTheme === "light" ? "light" : "dark"); }, [resolvedTheme]);
  const t = tk(theme);

  // auth
  const accessToken = String((session as any)?.accessToken ?? "").trim();
  const tokenType   = normalizeTokenType((session as any)?.tokenType);
  const apiBase     = useMemo(() => (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, ""), []);

  // Read business_type directly from the authenticated user session.
  const sessionBusinessType = useMemo(
    () => getSessionBusinessType(session as any),
    [session]
  );

  // form
  const [form,        setForm]        = useState<ProductForm>(EMPTY_FORM);
  const [origForm,    setOrigForm]    = useState<ProductForm>(EMPTY_FORM);   // snapshot for dirty check
  const [loading,     setLoading]     = useState(false);
  const savingRef = useRef(false);
  const [stockSummary, setStockSummary] = useState<{ opening: number | null; total: number | null; sold: number | null; correction: number | null }>({ opening: null, total: null, sold: null, correction: null });
  const [fetching,    setFetching]    = useState(true);
  const [fetchError,  setFetchError]  = useState<string | null>(null);
  const [imageFile,   setImageFile]   = useState<File | null>(null);
  const [preview,     setPreview]     = useState<string | null>(null);       // new file preview
  const [serverImage, setServerImage] = useState<string | null>(null);       // existing image URL
  const [dragOver,    setDragOver]    = useState(false);
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [apiCategories, setApiCategories] = useState<CategoryOption[] | null>(null);
  const [catLoading,  setCatLoading]  = useState(false);

  const businessConfig = businessType ? BUSINESS_OPTIONS[businessType] : null;
  const categories = useMemo(() => {
    const base = apiCategories?.length
      ? apiCategories
      : (businessConfig?.categories ?? []);
    return withCurrentOption(base, form.category);
  }, [apiCategories, businessConfig, form.category]);

  const productTypes = useMemo(
    () => withCurrentOption(businessConfig?.productTypes ?? [], form.product_type),
    [businessConfig, form.product_type]
  );

  // Session is the first source for current user's shop business type.
  // Never silently default to SUPERMARKET when the value is missing.
  useEffect(() => {
    if (status !== "authenticated") return;
    if (sessionBusinessType) {
      setBusinessType(sessionBusinessType);
      setApiCategories(null);
    }
  }, [sessionBusinessType, status]);
  const [aiFilling,   setAiFilling]   = useState(false);
  const [cropping,    setCropping]    = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [showDelete,  setShowDelete]  = useState(false);

  // AI
  const [suggestion,    setSuggestion]    = useState<AISuggestion | null>(null);
  const [aiError,       setAiError]       = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);

  const fileRef       = useRef<HTMLInputElement>(null);
  const barcodeSvgRef = useRef<SVGSVGElement>(null);

  // dirty check — which fields changed
  const dirtyFields = useMemo(() => {
    const keys = Object.keys(form) as (keyof ProductForm)[];
    return new Set(keys.filter((k) => k !== "product_quantity_amount" && form[k] !== origForm[k]));
  }, [form, origForm]);
  const isDirty = dirtyFields.size > 0 || imageFile !== null;

  // ── fetch product ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!productId || status !== "authenticated") return;
    (async () => {
      setFetching(true);
      setFetchError(null);
      try {
        const res = await fetch(`${apiBase}/api/products/${productId}`, {
          headers: { Authorization: `${tokenType} ${accessToken}`, Accept: "application/json" },
          cache: "no-store",
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          setFetchError(txt || `Error ${res.status}`);
          return;
        }
        const raw = await res.json();
        const p   = raw?.data ?? raw;
        const populated: ProductForm = {
          sku:                    String(p?.sku ?? ""),
          product_name:           String(p?.productName ?? p?.product_name ?? p?.name ?? ""),
          product_price:          String(p?.productPrice ?? p?.product_price ?? p?.price ?? ""),
          barcode:                String(p?.barcode ?? ""),
          category:               String(p?.category ?? ""),
          product_quantity_amount:String(p?.productQuantityAmount ?? p?.product_quantity_amount ?? p?.stock ?? "0"),
          product_discount:       String(p?.productDiscount ?? p?.product_discount ?? p?.discount ?? "0"),
          note:                   String(p?.note ?? ""),
          product_type:           String(p?.productType ?? p?.product_type ?? "OTHER"),
        };
        // DB/product response wins when backend returns the shop's business type.
        // Otherwise use the authenticated user's session business type.
        const dbBusinessType = normalizeBusinessType(
          p?.businessType ??
          p?.business_type ??
          p?.shopBusinessType ??
          p?.shop_business_type ??
          p?.shop?.businessType ??
          p?.shop?.business_type
        );
        // Current authenticated user's session is authoritative for this page.
        // DB/product value is only a fallback.
        const resolvedBusinessType = sessionBusinessType ?? dbBusinessType;
        if (resolvedBusinessType) {
          setBusinessType(resolvedBusinessType);
        } else {
          toast.error("user session ရဲ့ business_type ကို မတွေ့ပါ");
        }
        setApiCategories(null);

        setStockSummary({
          opening: p?.openingBalance == null ? null : Number(p.openingBalance),
          total: p?.totalStock == null ? null : Number(p.totalStock),
          sold: p?.soldQuantity == null ? null : Number(p.soldQuantity),
          correction: p?.stockCorrection == null ? null : Number(p.stockCorrection),
        });
        setForm(populated);
        setOrigForm(populated);
        const imgPath = buildImageUrl(p?.imagePath ?? p?.image_path ?? p?.product_image ?? null);
        setServerImage(imgPath);
      } catch (e: any) {
        setFetchError(e?.message ?? "Network error");
      } finally {
        setFetching(false);
      }
    })();
  }, [productId, status, sessionBusinessType]);

  // ── barcode render ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!barcodeSvgRef.current || !form.barcode.trim()) return;
    try {
      JsBarcode(barcodeSvgRef.current, form.barcode.trim(), {
        format: "CODE128", displayValue: true, fontSize: 12, height: 55, margin: 6,
      });
    } catch { /* invalid string */ }
  }, [form.barcode]);

  // ── helpers ────────────────────────────────────────────────────────────────
  function setField<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function revokeAndSetPreview(url: string | null) {
    setPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return url; });
  }
  function resetToOriginal() {
    setForm(origForm);
    setImageFile(null);
    revokeAndSetPreview(null);
    setSuggestion(null);
    setAiError(null);
    toast("Changes discarded");
  }
  function applyImage(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Image file ပဲရွေးပါ"); return; }
    setImageFile(file);
    revokeAndSetPreview(URL.createObjectURL(file));
  }

  // ── AI auto fill ───────────────────────────────────────────────────────────
  async function autoFill() {
    if (!form.product_name.trim()) { toast.error("Product name ကို အရင်ထည့်ပါ"); return; }
    setAiFilling(true); setSuggestion(null); setAiError(null);
    const tid = toast.loading("Local AI analyzing...");
    try {
      await new Promise((r) => setTimeout(r, 450));
      const s = localAIFill(form.product_name.trim());
      setForm((prev) => ({
        ...prev,
        sku:          prev.sku.trim()           || s.sku,
        barcode:      prev.barcode.trim()       || s.barcode,
        category:     prev.category             || s.category,
        product_type: prev.product_type === "OTHER" ? s.product_type : prev.product_type,
        product_price:prev.product_price.trim() || s.suggested_price,
        note:         prev.note.trim()          || s.note,
      }));
      setSuggestion(s);
      toast.success("Local AI fill done ✅", { id: tid });
    } catch (err: any) {
      const msg = err?.message ?? "Local AI error";
      setAiError(msg); toast.error(msg, { id: tid });
    } finally {
      setAiFilling(false);
    }
  }
  function applyAIAll() {
    if (!suggestion) return;
    setForm((prev) => ({
      ...prev,
      sku: suggestion.sku, barcode: suggestion.barcode,
      category: suggestion.category, product_type: suggestion.product_type,
      product_price: suggestion.suggested_price, note: suggestion.note,
    }));
    toast.success("AI suggestion apply လုပ်ပြီး ✅");
  }
  function generateBarcodeNow() {
    setField("barcode", generateBarcodeString(form.sku || form.product_name));
    toast.success("Barcode generated ✅");
  }
  async function loadCategories() {
    if (!apiBase) { toast.error("NEXT_PUBLIC_API_BASE_URL မထည့်ရသေးပါ"); return; }
    setCatLoading(true);
    try {
      const res  = await fetch(`${apiBase}/api/categories`, {
        headers: accessToken ? { Authorization: `${tokenType} ${accessToken}` } : {},
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const mapped: CategoryOption[] = Array.isArray(data)
        ? data.map((item: any) => ({
            label: String(item.label ?? item.name ?? item.category ?? item.value ?? "OTHER"),
            value: String(item.value ?? item.name ?? item.category ?? item.label ?? "OTHER").toUpperCase(),
          }))
        : [];
      if (!mapped.length) throw new Error();

      if (!businessConfig || !businessType) {
        throw new Error("Business type unavailable");
      }

      const allowed = new Set(businessConfig.categories.map((item) => item.value));
      const filtered = mapped.filter((item) => allowed.has(item.value));

      setApiCategories(filtered.length ? filtered : businessConfig.categories);
      toast.success(`${businessType} categories loaded ✅`);
    } catch {
      toast.error(businessType
        ? `API မရလို့ ${businessType} categories သုံးထားပါ`
        : "Business type မရသေးပါ");
      setApiCategories(null);
    } finally {
      setCatLoading(false);
    }
  }
  async function cropImage() {
    if (!imageFile) { toast.error("Image မရှိသေးပါ"); return; }
    try {
      setCropping(true);
      applyImage(await cropImageToSquare(imageFile));
      toast.success("Crop done ✅");
    } catch { toast.error("Crop failed"); }
    finally { setCropping(false); }
  }

  // ── update submit ──────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (savingRef.current) return;
    if (!apiBase)                   { toast.error("NEXT_PUBLIC_API_BASE_URL မထည့်ရသေးပါ"); return; }
    if (status === "loading")       { toast("Checking login..."); return; }
    if (status !== "authenticated") { toast.error("Login မဝင်ရသေးပါ"); return; }
    if (!accessToken)               { toast.error("Session ထဲမှာ accessToken မတွေ့ပါ"); return; }
    if (!form.sku.trim() || !form.product_name.trim() || !form.product_price.trim()) {
      toast.error("SKU, Product Name, Price ကို ထည့်ပေးပါ"); return;
    }
    const price    = Number(form.product_price);
    const discount = Number(form.product_discount || 0);
    if (isNaN(price))    { toast.error("Price သည် number ဖြစ်ရပါမယ်"); return; }
    if (isNaN(discount)) { toast.error("Discount သည် number ဖြစ်ရပါမယ်"); return; }

    savingRef.current = true;
    setLoading(true);
    const tid = toast.loading("Updating product...");
    try {
      const fd = new FormData();
      fd.append("sku",                     form.sku.trim());
      fd.append("product_name",            form.product_name.trim());
      fd.append("product_price",           String(price));
      fd.append("product_discount",        String(discount));
      if (form.barcode.trim())      fd.append("barcode",       form.barcode.trim());
      if (form.category.trim())     fd.append("category",      form.category.trim());
      if (form.product_type.trim()) fd.append("product_type",  form.product_type.trim());
      if (form.note.trim())         fd.append("note",          form.note.trim());
      if (imageFile)                fd.append("image",         imageFile);

      const res = await fetch(`${apiBase}/api/products/${productId}`, {
        method: "PUT",
        headers: { Authorization: `${tokenType} ${accessToken}` },
        body: fd,
      });
      const text = await res.text().catch(() => "");
      let json: any = null;
      try { json = text ? JSON.parse(text) : null; } catch { /* ok */ }
      if (!res.ok) {
        toast.error(String(json?.message ?? json?.error ?? text ?? `Failed (${res.status})`), { id: tid });
        return;
      }
      toast.success(`Updated: ${json?.product_name ?? form.product_name}`, { id: tid });
      // refresh snapshot
      const next = { ...form };
      setOrigForm(next);
      setImageFile(null);
      revokeAndSetPreview(null);
      if (json?.imagePath || json?.image_path) setServerImage(buildImageUrl(json.imagePath ?? json.image_path));
      router.push("/dashboard/product");
    } catch {
      toast.error("Server error ဖြစ်နေတယ်", { id: tid });
    } finally { savingRef.current = false; setLoading(false); }
  }

  // ── delete ─────────────────────────────────────────────────────────────────
  async function confirmDelete() {
    if (status !== "authenticated" || !accessToken) return;
    setDeleting(true);
    const tid = toast.loading("Deleting...");
    try {
      const res = await fetch(`${apiBase}/api/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `${tokenType} ${accessToken}` },
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        toast.error(txt || "Delete failed", { id: tid }); return;
      }
      toast.success("Deleted ✅", { id: tid });
      router.push("/dashboard/product");
    } catch {
      toast.error("Server error", { id: tid });
    } finally { setDeleting(false); setShowDelete(false); }
  }

  // ── current display image (new file preview OR server) ─────────────────────
  const displayImage = preview ?? serverImage;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <FontImport />
      <div className={cn("relative min-h-screen transition-colors duration-500", t.root)}>

        {/* glow blobs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className={cn("absolute -top-40 left-[15%] h-[500px] w-[500px] rounded-full blur-[140px]", t.glow1)} />
          <div className={cn("absolute -bottom-20 right-[-10%] h-[440px] w-[440px] rounded-full blur-[130px]", t.glow2)} />
        </div>

        {theme === "dark" && <NightParticles />}

        {/* delete modal */}
        <AnimatePresence>
          {showDelete && (
            <DeleteModal
              theme={theme} productName={form.product_name}
              loading={deleting} onClose={() => setShowDelete(false)} onConfirm={confirmDelete}
            />
          )}
        </AnimatePresence>

        <div className="relative z-10 mx-auto max-w-5xl space-y-5 px-5 py-7 md:px-8 2xl:max-w-6xl">

          {/* ── HEADER CARD ── */}
          <motion.div
            initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className={cn("relative overflow-hidden rounded-[30px] border p-6 md:p-8", t.card)}
          >
            <div className="absolute left-0 right-0 top-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #c8892a, transparent)" }} />

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                {theme === "dark" && (
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="hidden md:block">
                    <LanternMark size={72} glow />
                  </motion.div>
                )}
                <div>
                  <div className={cn("mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide", t.pill)}>
                    <Sparkles className="h-3 w-3" />
                    BINHLAIG · Edit Product
                  </div>
                  <h1 className={cn("serif text-[36px] md:text-[48px] font-normal leading-[0.95]", t.text)}>
                    Edit Product
                    <span className={cn("ml-2 text-[16px] md:text-[20px] font-medium", t.textMuted)}>
                      {form.product_name || "loading..."}
                    </span>
                  </h1>
                  {/* dirty indicator */}
                  <AnimatePresence>
                    {isDirty && (
                      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-400">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                        {dirtyFields.size} field{dirtyFields.size !== 1 ? "s" : ""} changed{imageFile ? " + new image" : ""}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => router.back()} className={cn("flex h-10 items-center gap-2 rounded-xl border px-4 text-[13px] font-semibold transition-all", t.btn)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                {isDirty && (
                  <button type="button" onClick={resetToOriginal} className={cn("flex h-10 items-center gap-2 rounded-xl border px-4 text-[13px] font-semibold transition-all", t.btn)}>
                    <RotateCcw className="h-4 w-4" /> Discard
                  </button>
                )}
                <button type="button" onClick={() => setShowDelete(true)} className={cn("flex h-10 items-center gap-2 rounded-xl border px-4 text-[13px] font-semibold transition-all", t.btnDanger)}>
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
                <LanternToggle dark={theme === "dark"} onToggle={() => setNextTheme(theme === "dark" ? "light" : "dark")} />
              </div>
            </div>
          </motion.div>

          {/* ── fetch error ── */}
          {fetchError && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <div className="text-[13px] font-bold text-rose-400">Failed to load product</div>
                <div className="mt-0.5 text-[11px] text-rose-400/80">{fetchError}</div>
              </div>
            </div>
          )}

          {/* ── loading skeleton ── */}
          {fetching && !fetchError && (
            <div className={cn("flex items-center justify-center rounded-[24px] border p-16", t.card)}>
              <div className="flex flex-col items-center gap-4">
                {theme === "dark" && <LanternMark size={46} glow />}
                <Loader2 className={cn("h-8 w-8 animate-spin", t.textMuted)} />
                <div className={cn("text-[13px]", t.textMuted)}>Loading product data...</div>
              </div>
            </div>
          )}

          {/* ── MAIN GRID ── */}
          {!fetching && !fetchError && (
            <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">

              {/* ── LEFT: form ── */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className={cn("rounded-[24px] border p-6", t.card)}>

                <div className={cn("mb-1 text-[22px] font-black", t.text)}>Edit Form</div>
                <div className={cn("mb-5 text-[13px]", t.textMuted)}>
                  Changed fields are highlighted. AI fill can re-suggest values based on name.
                </div>

                {/* AI panel */}
                <div className={cn("mb-5 rounded-2xl border p-4", t.aiPanel)}>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <button type="button" onClick={autoFill} disabled={aiFilling}
                      className={cn("flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-bold transition-all",
                        theme === "dark"
                          ? "bg-gradient-to-r from-[#a07020] to-[#d4a352] text-[#140d05] hover:brightness-110"
                          : "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:brightness-110"
                      )}>
                      {aiFilling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                      {aiFilling ? "Analyzing..." : "AI Re-suggest"}
                    </button>
                    <button type="button" onClick={generateBarcodeNow} className={cn("flex h-9 items-center gap-2 rounded-xl border px-3 text-[12px] font-semibold transition-all", t.btn)}>
                      <ScanLine className="h-4 w-4" /> New Barcode
                    </button>
                    <button type="button" onClick={loadCategories} disabled={catLoading} className={cn("flex h-9 items-center gap-2 rounded-xl border px-3 text-[12px] font-semibold transition-all", t.btn)}>
                      {catLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
                      {businessType ? `${businessType} Categories` : "Categories"}
                    </button>
                  </div>

                  {/* suggestion */}
                  <AnimatePresence>
                    {suggestion && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} className={cn("overflow-hidden rounded-xl border p-4", t.sugWrap)}>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[10px]",
                              theme === "dark" ? "bg-gradient-to-br from-[#a07020] to-[#d4a352] text-[#140d05]" : "bg-gradient-to-br from-blue-600 to-violet-600 text-white"
                            )}>✦</div>
                            <span className={cn("text-[12px] font-bold", t.text)}>AI Re-suggestion</span>
                            <Badge className={cn("border text-[10px] font-bold", CONFIDENCE_COLORS[suggestion.confidence])}>
                              {suggestion.confidence} confidence
                            </Badge>
                          </div>
                          <button type="button" onClick={applyAIAll} className={cn("flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-all", t.btn)}>
                            <Wand2 className="h-3 w-3" /> Apply All
                          </button>
                        </div>
                        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                          {[
                            { l: "SKU", v: suggestion.sku }, { l: "Category", v: suggestion.category },
                            { l: "Type", v: suggestion.product_type }, { l: "Price", v: suggestion.suggested_price },
                            { l: "Barcode", v: suggestion.barcode.slice(0, 10) + "..." },
                          ].map((item) => (
                            <div key={item.l} className={cn("rounded-xl border p-2", t.sugItem, t.card)}>
                              <div className={cn("mb-1 text-[9px] font-bold uppercase tracking-wider", t.textSubtle)}>{item.l}</div>
                              <div className={cn("truncate text-[11px] font-black", t.text)}>{item.v}</div>
                            </div>
                          ))}
                        </div>
                        {suggestion.tags.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-1.5">
                            {suggestion.tags.map((tag) => (
                              <span key={tag} className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-bold", t.tag)}>#{tag}</span>
                            ))}
                          </div>
                        )}
                        <button type="button" onClick={() => setShowReasoning((v) => !v)}
                          className={cn("flex items-center gap-1 text-[11px]", t.textSubtle)}>
                          {showReasoning ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          AI reasoning
                        </button>
                        <AnimatePresence>
                          {showReasoning && (
                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className={cn("mt-2 rounded-xl border p-3 text-[11px] leading-relaxed", t.previewCard, t.textMuted)}>
                              {suggestion.reasoning}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* AI error */}
                  <AnimatePresence>
                    {aiError && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="mt-2 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                        <div className="text-[11px] font-bold text-rose-400">{aiError}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── form fields ── */}
                <form onSubmit={handleSubmit} noValidate className="space-y-4">

                  {/* helper: field wrapper that highlights if dirty */}
                  {/* SKU + Name */}
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {(["sku", "product_name"] as const).map((key, idx) => (
                      <div key={key} className={cn("space-y-1.5", idx === 1 && "md:col-span-2")}>
                        <Label className={cn("text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                          dirtyFields.has(key) ? (theme === "dark" ? "text-[#d4a352]" : "text-blue-600") : t.textSubtle)}>
                          {key === "sku" ? "SKU / Code" : "Product Name"}
                          {dirtyFields.has(key) && <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-400">CHANGED</span>}
                        </Label>
                        <Input
                          value={form[key]}
                          onChange={(e) => setField(key, e.target.value)}
                          placeholder={key === "sku" ? "SKU-1001" : "Coca Cola 500ml"}
                          className={cn("h-10 rounded-xl transition-all", dirtyFields.has(key) ? t.changedField : t.input)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Product metadata. Stock is managed by the separate stock API. */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {(["product_price", "product_discount"] as const).map((key) => (
                      <div key={key} className="space-y-1.5">
                        <Label className={cn("text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>
                          {key === "product_price" ? "Price (MMK)" : "Discount"}
                        </Label>
                        <Input type="number" min="0" step="0.01" value={form[key]}
                          onChange={(e) => setField(key, e.target.value)}
                          className={cn("h-10 rounded-xl", dirtyFields.has(key) ? t.changedField : t.input)} />
                      </div>
                    ))}
                  </div>
                  <div className={cn("grid grid-cols-2 gap-3 rounded-xl border p-4 text-sm md:grid-cols-4", t.previewCard)}>
                    <div><span className={t.textSubtle}>Opening stock</span><strong className="block">{stockSummary.opening ?? "—"}</strong></div>
                    <div><span className={t.textSubtle}>Total stock</span><strong className="block">{stockSummary.total ?? "—"}</strong></div>
                    <div><span className={t.textSubtle}>Sold since tracking</span><strong className="block">{stockSummary.sold ?? "—"}</strong></div>
                    <div><span className={t.textSubtle}>Remaining</span><strong className="block">{form.product_quantity_amount}</strong></div>
                  </div>
                  <p className={cn("text-xs", t.textSubtle)}>
                    Stock changes use the separate stock operation API. Opening stock cannot be edited with Product PUT.
                  </p>

                  {/* Business Type */}
                  <div className="space-y-1.5">
                    <Label className={cn("text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>
                      User Session Business Type
                    </Label>
                    <div className={cn(
                      "flex h-10 items-center justify-between rounded-xl border px-3 text-[12px] font-black",
                      t.input
                    )}>
                      <span>{sessionBusinessType ?? businessType ?? "SESSION BUSINESS TYPE MISSING"}</span>
                      {(sessionBusinessType ?? businessType) && (
                        <Badge className={cn("border text-[10px] font-bold", t.tag)}>
                          {(sessionBusinessType ?? businessType) === "SUPERMARKET"
                            ? "Retail"
                            : (sessionBusinessType ?? businessType) === "RESTAURANT"
                              ? "Food Service"
                              : "Apparel"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Barcode + Category + Type */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className={cn("text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                        dirtyFields.has("barcode") ? (theme === "dark" ? "text-[#d4a352]" : "text-blue-600") : t.textSubtle)}>
                        Barcode {dirtyFields.has("barcode") && <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-400">CHANGED</span>}
                      </Label>
                      <Input value={form.barcode} onChange={(e) => setField("barcode", e.target.value)}
                        placeholder="8852121212333"
                        className={cn("h-10 rounded-xl transition-all", dirtyFields.has("barcode") ? t.changedField : t.input)} />
                    </div>

                    <div className="space-y-1.5">
                      <Label className={cn("text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                        dirtyFields.has("category") ? (theme === "dark" ? "text-[#d4a352]" : "text-blue-600") : t.textSubtle)}>
                        Category {dirtyFields.has("category") && <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-400">CHANGED</span>}
                      </Label>
                      <Select value={form.category} onValueChange={(v) => setField("category", v)}>
                        <SelectTrigger className={cn("h-10 rounded-xl transition-all", dirtyFields.has("category") ? t.changedField : t.input)}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className={cn("text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                        dirtyFields.has("product_type") ? (theme === "dark" ? "text-[#d4a352]" : "text-blue-600") : t.textSubtle)}>
                        Product Type {dirtyFields.has("product_type") && <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-400">CHANGED</span>}
                      </Label>
                      <Select value={form.product_type} onValueChange={(v) => setField("product_type", v)}>
                        <SelectTrigger className={cn("h-10 rounded-xl transition-all", dirtyFields.has("product_type") ? t.changedField : t.input)}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {productTypes.map((item) => (
                            <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="space-y-1.5">
                    <Label className={cn("text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                      dirtyFields.has("note") ? (theme === "dark" ? "text-[#d4a352]" : "text-blue-600") : t.textSubtle)}>
                      Note {dirtyFields.has("note") && <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-400">CHANGED</span>}
                    </Label>
                    <Textarea value={form.note} onChange={(e) => setField("note", e.target.value)}
                      rows={4} placeholder="Product description..."
                      className={cn("rounded-xl resize-none transition-all", dirtyFields.has("note") ? t.changedField : t.input)} />
                  </div>

                  {/* footer buttons */}
                  <div className="flex flex-wrap justify-between gap-2 pt-1">
                    <button type="button" onClick={() => setShowDelete(true)}
                      className={cn("flex h-10 items-center gap-2 rounded-xl border px-5 text-[13px] font-semibold transition-all", t.btnDanger)}>
                      <Trash2 className="h-4 w-4" /> Delete Product
                    </button>
                    <div className="flex gap-2">
                      {isDirty && (
                        <button type="button" onClick={resetToOriginal} className={cn("flex h-10 items-center gap-2 rounded-xl border px-5 text-[13px] font-semibold transition-all", t.btn)}>
                          <RotateCcw className="h-4 w-4" /> Discard
                        </button>
                      )}
                      <button type="submit" disabled={loading || !isDirty}
                        className={cn("flex h-10 items-center gap-2 rounded-xl px-5 text-[13px] font-bold transition-all",
                          isDirty ? t.btnPrimary : "opacity-40 cursor-not-allowed " + t.btnPrimary)}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>

              {/* ── RIGHT: image + preview ── */}
              <div className="space-y-5">

                {/* image card */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                  className={cn("rounded-[24px] border p-5", t.card)}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className={cn("text-[16px] font-black", t.text)}>Product Image</div>
                    {imageFile && (
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400">New image selected</span>
                    )}
                  </div>
                  <div className={cn("mb-4 text-[12px]", t.textMuted)}>drag &amp; drop · square crop · replaces existing</div>

                  {/* drop zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) applyImage(f); }}
                    className={cn(
                      "flex min-h-[90px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-5 text-center transition-all",
                      t.imgDrop, dragOver && (theme === "dark" ? "border-[#c8892a] bg-[rgba(200,137,42,0.08)]" : "border-violet-500 bg-violet-50/50")
                    )}
                    onClick={() => fileRef.current?.click()}
                  >
                    <input ref={fileRef} type="file" hidden accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) applyImage(f); }} />
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", t.soft)}>
                      <Upload className={cn("h-4 w-4", t.textMuted)} />
                    </div>
                    <div>
                      <div className={cn("text-[12px] font-semibold", t.text)}>Drop new image here</div>
                      <div className={cn("text-[10px]", t.textSubtle)}>or click to choose</div>
                    </div>
                  </div>

                  {/* crop row */}
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={cropImage} disabled={!imageFile || cropping}
                      className={cn("flex flex-1 items-center justify-center gap-2 rounded-xl border py-2 text-[12px] font-semibold transition-all", t.btn)}>
                      {cropping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crop className="h-4 w-4" />} Crop Square
                    </button>
                    <button type="button" onClick={() => imageFile && applyImage(imageFile)} disabled={!imageFile}
                      className={cn("flex items-center justify-center rounded-xl border px-3 py-2 transition-all", t.btn)}>
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    {preview && (
                      <button type="button" onClick={() => { setImageFile(null); revokeAndSetPreview(null); }}
                        className={cn("flex items-center justify-center rounded-xl border px-3 py-2 transition-all", t.btnDanger)} title="Remove new image">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* image display */}
                  <div className={cn("mt-3 overflow-hidden rounded-2xl border", t.previewCard)}>
                    {displayImage ? (
                      <div className="relative">
                        <img src={displayImage} alt="Product" className="max-h-[260px] w-full object-contain" />
                        {preview && (
                          <div className="absolute right-2 top-2 rounded-full border border-amber-500/30 bg-black/50 px-2.5 py-1 text-[10px] font-bold text-amber-400 backdrop-blur">
                            New Image
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={cn("flex min-h-[180px] flex-col items-center justify-center gap-2", t.textSubtle)}>
                        <ImageIcon className="h-10 w-10" />
                        <span className="text-[12px]">No Image</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* live preview card */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
                  className={cn("rounded-[24px] border p-5", t.card)}>
                  <div className="mb-4 flex items-center gap-3">
                    {theme === "dark" && <div className="h-2.5 w-2.5 rounded-full" style={{ background: "radial-gradient(circle, #fff7cc 0%, #fbbf24 42%, #f59e0b 70%, #b45309 100%)", boxShadow: "0 0 10px rgba(251,191,36,.45)" }} />}
                    <div className={cn("text-[16px] font-black", t.text)}>Live Preview</div>
                  </div>

                  <div className="mb-3 grid grid-cols-3 gap-2">
                    {[
                      { label: "Price", value: form.product_price || "0", icon: CircleDollarSign, dirty: dirtyFields.has("product_price") },
                      { label: "Remaining", value: form.product_quantity_amount || "0", icon: Boxes, dirty: false },
                      { label: "Type",  value: form.product_type || "OTHER", icon: Package2, dirty: dirtyFields.has("product_type") },
                    ].map((item) => (
                      <div key={item.label} className={cn("rounded-2xl border p-3 transition-all", item.dirty ? t.changedField : t.previewCard)}>
                        <div className={cn("mb-1 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider", item.dirty ? (theme === "dark" ? "text-[#d4a352]" : "text-blue-600") : t.textSubtle)}>
                          <item.icon className="h-3 w-3" />
                          {item.label}
                        </div>
                        <div className={cn("text-[13px] font-black", t.text)}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* name card */}
                  <div className={cn("mb-3 rounded-2xl border p-4 transition-all", dirtyFields.has("product_name") ? t.changedField : t.previewCard)}>
                    <div className="flex items-center gap-2">
                      {theme === "dark" && <LanternMark size={18} glow />}
                      <div>
                        <div className={cn("text-[13px] font-black", t.text)}>{form.product_name || "Product Name"}</div>
                        <div className={cn("text-[10px]", t.textSubtle)}>
                          {sessionBusinessType ?? businessType ?? "BUSINESS TYPE N/A"} · SKU: {form.sku || "—"} · {form.category || "UNCATEGORIZED"}
                        </div>
                      </div>
                    </div>
                    {suggestion?.tags?.length ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {suggestion.tags.map((tag) => (
                          <span key={tag} className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold", t.tag)}>#{tag}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* barcode */}
                  <div className={cn("overflow-x-auto rounded-2xl border p-4", t.previewCard)}>
                    {form.barcode ? (
                      <svg ref={barcodeSvgRef} />
                    ) : (
                      <div className={cn("flex items-center gap-2 text-[12px]", t.textSubtle)}>
                        <ScanLine className="h-4 w-4" /> barcode not set
                      </div>
                    )}
                  </div>

                  {/* confidence or dirty summary */}
                  {isDirty && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] font-bold text-amber-400">
                      <Save className="h-3.5 w-3.5" />
                      {dirtyFields.size} unsaved change{dirtyFields.size !== 1 ? "s" : ""}
                      {imageFile ? " + new image" : ""}
                    </div>
                  )}
                  {suggestion && !isDirty && (
                    <div className={cn("mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] font-bold", CONFIDENCE_COLORS[suggestion.confidence])}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      AI suggestion: {suggestion.confidence} confidence
                    </div>
                  )}
                </motion.div>
              </div>
              {/* end RIGHT */}
            </div>
          )}
          {/* end MAIN GRID */}
        </div>
      </div>
    </>
  );
}
