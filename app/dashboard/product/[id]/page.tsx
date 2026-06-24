
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

// import { Button } from "@/components/ui/button";
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
//   Layers3,
//   ScanLine,
//   Wallet,
//   Package2,
//   Sun,
//   Moon,
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
//   Minus,
//   Eye,
//   ChevronLeft,
//   ChevronRight,
//   ImageIcon,
//   X,
// } from "lucide-react";

// import { toast } from "sonner";
// import JsBarcode from "jsbarcode";

// // ─────────────────────────────────────────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────────────────────────────────────────

// type TK = "dark" | "light";

// type Product = {
//   id: string;
//   sku: string;
//   product_name: string;
//   product_price: number;
//   barcode?: string | null;
//   category?: string | null;
//   product_quantity_amount: number;
//   product_image?: string | null;
//   imagePath?: string | null;
//   image_path?: string | null;
//   product_discount?: number | null;
//   note?: string | null;
//   product_type?: string | null;
// };

// type StockMovement = {
//   id: string;
//   type: "IN" | "OUT" | "ADJUST";
//   qty: number;
//   before_qty: number;
//   after_qty: number;
//   note?: string | null;
//   created_at: string;
//   user_name?: string | null;
// };

// type MovementLaneKey = "IN" | "OUT" | "ADJUST";
// type MovementLaneMap = Record<MovementLaneKey, StockMovement[]>;

// type GalleryItem = {
//   id: string;
//   kind: "image" | "generated" | "sku" | "type";
//   url: string | null;
//   title: string;
//   category: string;
//   sku: string;
//   type: string;
//   initials: string;
//   gradient: string;
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────────────────────────────────────

// function cn(...classes: (string | false | null | undefined)[]) {
//   return classes.filter(Boolean).join(" ");
// }

// function pickImagePath(p: any): string | null {
//   return p?.imagePath ?? p?.image_path ?? p?.product_image ?? null;
// }

// function buildImageUrl(path?: string | null) {
//   if (!path) return null;
//   const raw = String(path).trim();
//   if (!raw) return null;
//   if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
//   const cleaned = raw.replace(/^\/?uploads\/?/, "").replace(/^\/+/, "");
//   return `/uploads/${cleaned}`;
// }

// async function readErrorText(res: Response) {
//   const ct = res.headers.get("content-type") || "";
//   try {
//     if (ct.includes("application/json")) {
//       const j = await res.json();
//       return j?.message || j?.error || JSON.stringify(j);
//     }
//     return (await res.text()) || "";
//   } catch {
//     return "";
//   }
// }

// function numberFormat(n: number) {
//   return new Intl.NumberFormat().format(n || 0);
// }

// function money(n: number) {
//   return `¥${numberFormat(n || 0)}`;
// }

// function hashCode(str: string) {
//   let h = 0;
//   for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
//   return h;
// }

// function getInitials(name: string) {
//   return String(name || "")
//     .split(" ")
//     .filter(Boolean)
//     .slice(0, 2)
//     .map((x) => x[0]?.toUpperCase())
//     .join("");
// }

// function gradientFromSeed(seed: string) {
//   const palettes = [
//     "from-cyan-500 via-sky-500 to-indigo-600",
//     "from-fuchsia-500 via-pink-500 to-rose-500",
//     "from-emerald-500 via-teal-500 to-cyan-600",
//     "from-amber-400 via-orange-500 to-rose-500",
//     "from-violet-500 via-purple-500 to-indigo-600",
//     "from-lime-500 via-green-500 to-emerald-600",
//   ];
//   return palettes[Math.abs(hashCode(seed)) % palettes.length];
// }

// function escapeHtml(s: string) {
//   return s
//     .replaceAll("&", "&amp;")
//     .replaceAll("<", "&lt;")
//     .replaceAll(">", "&gt;")
//     .replaceAll('"', "&quot;")
//     .replaceAll("'", "&#039;");
// }

// function buildGallery(product: Product | null): GalleryItem[] {
//   if (!product) return [];

//   const primary = buildImageUrl(pickImagePath(product));
//   const seed = `${product.product_name}-${product.category}-${product.sku}`;

//   const base = {
//     title: product.product_name,
//     category: product.category || "PRODUCT",
//     sku: product.sku || "SKU",
//     type: product.product_type || "General Item",
//     initials: getInitials(product.product_name || "P"),
//     gradient: gradientFromSeed(seed),
//   };

//   return [
//     { id: "main", kind: "image", url: primary, ...base },
//     { id: "cover", kind: "generated", url: null, ...base },
//     { id: "sku", kind: "sku", url: null, ...base },
//     { id: "type", kind: "type", url: null, ...base },
//   ];
// }

// function buildLaneMap(items: StockMovement[]): MovementLaneMap {
//   return {
//     IN: items.filter((m) => m.type === "IN"),
//     OUT: items.filter((m) => m.type === "OUT"),
//     ADJUST: items.filter((m) => m.type === "ADJUST"),
//   };
// }

// function flattenLaneMap(lanes: MovementLaneMap): StockMovement[] {
//   return [...lanes.IN, ...lanes.OUT, ...lanes.ADJUST];
// }

// function findLaneByMovementId(
//   lanes: MovementLaneMap,
//   id: string
// ): MovementLaneKey | null {
//   if (lanes.IN.some((m) => m.id === id)) return "IN";
//   if (lanes.OUT.some((m) => m.id === id)) return "OUT";
//   if (lanes.ADJUST.some((m) => m.id === id)) return "ADJUST";
//   return null;
// }

// function findLaneForOverTarget(
//   lanes: MovementLaneMap,
//   overId: string
// ): MovementLaneKey | null {
//   if (overId === "IN" || overId === "OUT" || overId === "ADJUST") return overId;
//   return findLaneByMovementId(lanes, overId);
// }

// function laneMeta(key: MovementLaneKey) {
//   if (key === "IN") {
//     return {
//       title: "Stock In",
//       icon: <TrendingUp className="h-4 w-4" />,
//       badgeCls:
//         "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
//     };
//   }

//   if (key === "OUT") {
//     return {
//       title: "Stock Out",
//       icon: <TrendingDown className="h-4 w-4" />,
//       badgeCls:
//         "border border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300",
//     };
//   }

//   return {
//     title: "Adjust",
//     icon: <History className="h-4 w-4" />,
//     badgeCls:
//       "border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
//   };
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // THEME TOKENS
// // ─────────────────────────────────────────────────────────────────────────────

// const T = (theme: TK) =>
//   theme === "dark"
//     ? {
//         root: "bg-[#030712] text-white",
//         card: "border-white/10 bg-white/[0.05] backdrop-blur-2xl",
//         soft: "border-white/10 bg-white/[0.04] backdrop-blur-xl",
//         overlay:
//           "border-white/12 bg-[#081120]/95 text-white shadow-2xl shadow-cyan-500/10",
//         text: "text-white",
//         muted: "text-white/65",
//         subtle: "text-white/35",
//         input:
//           "border-white/10 bg-white/[0.06] text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-cyan-500/70",
//         hero:
//           "border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(99,102,241,0.09),rgba(255,255,255,0.03))]",
//         ring: "ring-cyan-400/40",
//       }
//     : {
//         root: "bg-[#eef4fb] text-slate-900",
//         card: "border-slate-200 bg-white/90 backdrop-blur-2xl shadow-sm",
//         soft: "border-slate-200 bg-white/85 backdrop-blur-xl shadow-sm",
//         overlay:
//           "border-slate-200 bg-white/95 text-slate-900 shadow-2xl shadow-slate-300/50",
//         text: "text-slate-900",
//         muted: "text-slate-600",
//         subtle: "text-slate-400",
//         input:
//           "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:border-cyan-500",
//         hero:
//           "border-slate-200 bg-[linear-gradient(135deg,rgba(6,182,212,0.11),rgba(99,102,241,0.08),rgba(255,255,255,0.96))]",
//         ring: "ring-cyan-500/30",
//       };

// // ─────────────────────────────────────────────────────────────────────────────
// // UI PRIMITIVES
// // ─────────────────────────────────────────────────────────────────────────────

// function Glass({
//   theme,
//   className,
//   children,
// }: {
//   theme: TK;
//   className?: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className={cn("rounded-[28px] border overflow-hidden", T(theme).card, className)}>
//       {children}
//     </div>
//   );
// }

// function Soft({
//   theme,
//   className,
//   children,
// }: {
//   theme: TK;
//   className?: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className={cn("rounded-[22px] border overflow-hidden", T(theme).soft, className)}>
//       {children}
//     </div>
//   );
// }

// function AnimatedNumber({ value }: { value: number }) {
//   const mv = useMotionValue(0);
//   const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());
//   const [display, setDisplay] = useState("0");

//   useEffect(() => {
//     const c = animate(mv, value, { duration: 0.55, ease: "easeOut" });
//     const unsub = rounded.on("change", setDisplay);
//     return () => {
//       c.stop();
//       unsub();
//     };
//   }, [value, mv, rounded]);

//   return <motion.span>{display}</motion.span>;
// }

// function StockBadge({ stock }: { stock: number }) {
//   if (stock <= 0) {
//     return (
//       <Badge className="border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300 border font-mono text-[10px] tracking-widest">
//         OUT
//       </Badge>
//     );
//   }

//   if (stock < 5) {
//     return (
//       <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300 border font-mono text-[10px] tracking-widest">
//         LOW
//       </Badge>
//     );
//   }

//   return (
//     <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border font-mono text-[10px] tracking-widest">
//       IN
//     </Badge>
//   );
// }

// function MetricCard({
//   theme,
//   icon,
//   label,
//   value,
//   sub,
//   tone,
// }: {
//   theme: TK;
//   icon: React.ReactNode;
//   label: string;
//   value: React.ReactNode;
//   sub?: string;
//   tone?: "default" | "good" | "warn" | "danger";
// }) {
//   return (
//     <Soft theme={theme} className="p-4">
//       <div className="flex items-start justify-between gap-3">
//         <div className="space-y-1 min-w-0">
//           <div className={cn("text-[10px] font-black tracking-[0.18em]", T(theme).subtle)}>
//             {label}
//           </div>

//           <div
//             className={cn(
//               "text-xl font-black leading-none",
//               tone === "good" && "text-emerald-600 dark:text-emerald-300",
//               tone === "warn" && "text-amber-600 dark:text-amber-300",
//               tone === "danger" && "text-rose-600 dark:text-rose-300"
//             )}
//           >
//             {value}
//           </div>

//           {sub ? <div className={cn("text-xs", T(theme).muted)}>{sub}</div> : null}
//         </div>

//         <div
//           className={cn(
//             "inline-flex h-10 w-10 items-center justify-center rounded-2xl border",
//             theme === "dark"
//               ? "border-white/10 bg-white/[0.06]"
//               : "border-slate-200 bg-slate-50"
//           )}
//         >
//           {icon}
//         </div>
//       </div>
//     </Soft>
//   );
// }

// function GalleryTile({
//   item,
//   active,
//   onClick,
// }: {
//   item: GalleryItem;
//   active: boolean;
//   onClick: () => void;
// }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className={cn(
//         "relative h-20 w-full overflow-hidden rounded-2xl border transition-all",
//         active
//           ? "border-cyan-500 ring-2 ring-cyan-400/30"
//           : "border-slate-200 dark:border-white/10"
//       )}
//     >
//       {item.kind === "image" && item.url ? (
//         <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
//       ) : (
//         <div className={cn("relative h-full w-full bg-gradient-to-br", item.gradient)}>
//           <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.3),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.18),transparent_22%)]" />
//           <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-black">
//             {item.kind === "sku" ? item.sku : item.kind === "type" ? item.type : item.initials}
//           </div>
//         </div>
//       )}
//     </button>
//   );
// }

// function ProductScene({
//   product,
//   galleryItem,
// }: {
//   product: Product;
//   galleryItem: GalleryItem;
// }) {
//   if (galleryItem.kind === "image" && galleryItem.url) {
//     return (
//       <div className="relative h-full w-full overflow-hidden">
//         <img
//           src={galleryItem.url}
//           alt={product.product_name}
//           className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
//       </div>
//     );
//   }

//   return (
//     <div className={cn("relative h-full w-full bg-gradient-to-br", galleryItem.gradient)}>
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.2),transparent_22%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.15),transparent_24%)]" />
//       <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
//       <div className="absolute left-0 bottom-0 h-24 w-24 rounded-full bg-black/10 blur-2xl" />

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
//             {galleryItem.kind === "sku"
//               ? "SKU"
//               : galleryItem.kind === "type"
//               ? getInitials(product.product_type || "T")
//               : getInitials(product.product_name || "P")}
//           </div>

//           <div className="line-clamp-2 text-2xl font-black leading-tight">
//             {product.product_name}
//           </div>

//           <div className="text-sm text-white/80">
//             {galleryItem.kind === "sku"
//               ? product.sku
//               : galleryItem.kind === "type"
//               ? product.product_type || "General Item"
//               : product.product_type || "General Item"}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function StockBar({ stock }: { stock: number }) {
//   const max = Math.max(10, Math.ceil(stock / 10) * 10 || 10);
//   const pct = Math.min(100, Math.round((stock / max) * 100));

//   return (
//     <div className="space-y-2">
//       <div className="flex items-center justify-between text-xs">
//         <span className="opacity-70">Stock Health</span>
//         <span className="font-mono">{pct}%</span>
//       </div>

//       <div className="h-3 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
//         <motion.div
//           initial={{ width: 0 }}
//           animate={{ width: `${pct}%` }}
//           transition={{ duration: 0.7, ease: "easeOut" }}
//           className={cn(
//             "h-full rounded-full",
//             stock <= 0 ? "bg-rose-500" : stock < 5 ? "bg-amber-500" : "bg-emerald-500"
//           )}
//         />
//       </div>
//     </div>
//   );
// }

// function movementBadge(type: StockMovement["type"]) {
//   if (type === "IN") {
//     return (
//       <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 gap-1">
//         <TrendingUp className="h-3.5 w-3.5" />
//         IN
//       </Badge>
//     );
//   }

//   if (type === "OUT") {
//     return (
//       <Badge className="bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 gap-1">
//         <TrendingDown className="h-3.5 w-3.5" />
//         OUT
//       </Badge>
//     );
//   }

//   return (
//     <Badge className="bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 gap-1">
//       <History className="h-3.5 w-3.5" />
//       ADJUST
//     </Badge>
//   );
// }

// function DragHandle({
//   listeners,
//   attributes,
//   theme,
// }: {
//   listeners?: any;
//   attributes?: any;
//   theme: TK;
// }) {
//   return (
//     <button
//       type="button"
//       {...listeners}
//       {...attributes}
//       className={cn(
//         "inline-flex h-9 w-9 items-center justify-center rounded-2xl border cursor-grab active:cursor-grabbing transition-all",
//         theme === "dark"
//           ? "border-white/10 bg-white/[0.05] text-white/45 hover:bg-white/[0.12]"
//           : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50"
//       )}
//     >
//       <GripVertical className="h-4 w-4" />
//     </button>
//   );
// }

// function SortableMovementCard({
//   move,
//   theme,
// }: {
//   move: StockMovement;
//   theme: TK;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({
//       id: move.id,
//     });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.45 : 1,
//   };

//   return (
//     <motion.div ref={setNodeRef} style={style} layout>
//       <Soft
//         theme={theme}
//         className={cn("p-4", isDragging && `ring-2 ${T(theme).ring}`)}
//       >
//         <div className="flex items-start gap-3">
//           <DragHandle theme={theme} listeners={listeners} attributes={attributes} />

//           <div className="min-w-0 flex-1 space-y-2">
//             <div className="flex items-center gap-2 flex-wrap">
//               {movementBadge(move.type)}
//               <span className={cn("text-xs font-mono", T(theme).subtle)}>
//                 {new Date(move.created_at).toLocaleString()}
//               </span>
//             </div>

//             <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
//               <div>
//                 <div className={cn("text-[10px] font-black tracking-[0.16em]", T(theme).subtle)}>
//                   QTY
//                 </div>
//                 <div className="font-black">{numberFormat(move.qty)}</div>
//               </div>

//               <div>
//                 <div className={cn("text-[10px] font-black tracking-[0.16em]", T(theme).subtle)}>
//                   BEFORE
//                 </div>
//                 <div className="font-black">{numberFormat(move.before_qty)}</div>
//               </div>

//               <div>
//                 <div className={cn("text-[10px] font-black tracking-[0.16em]", T(theme).subtle)}>
//                   AFTER
//                 </div>
//                 <div className="font-black">{numberFormat(move.after_qty)}</div>
//               </div>
//             </div>

//             <div className={cn("text-sm", T(theme).muted)}>
//               {move.note || "No note"}
//             </div>

//             <div className="flex flex-wrap gap-2 pt-1">
//               <Badge variant="secondary" className="gap-1">
//                 <UserRound className="h-3.5 w-3.5" />
//                 {move.user_name || "-"}
//               </Badge>
//             </div>
//           </div>
//         </div>
//       </Soft>
//     </motion.div>
//   );
// }

// function MovementOverlay({ move, theme }: { move: StockMovement; theme: TK }) {
//   return (
//     <div className={cn("w-[360px] rounded-[24px] border p-4 shadow-2xl", T(theme).overlay)}>
//       <div className="flex items-center gap-2 mb-2">
//         {movementBadge(move.type)}
//         <span className={cn("text-xs font-mono", T(theme).muted)}>
//           {new Date(move.created_at).toLocaleString()}
//         </span>
//       </div>

//       <div className="text-sm font-medium">
//         Qty {numberFormat(move.qty)} · {numberFormat(move.before_qty)} →{" "}
//         {numberFormat(move.after_qty)}
//       </div>

//       <div className={cn("mt-2 text-sm", T(theme).muted)}>
//         {move.note || "No note"}
//       </div>
//     </div>
//   );
// }

// function MovementLane({
//   laneKey,
//   items,
//   theme,
//   isActiveLane,
// }: {
//   laneKey: MovementLaneKey;
//   items: StockMovement[];
//   theme: TK;
//   isActiveLane: boolean;
// }) {
//   const meta = laneMeta(laneKey);

//   return (
//     <div className="h-full">
//       <Soft theme={theme} className="h-full p-4">
//         <div className="mb-4 flex items-center justify-between gap-3">
//           <div className="flex items-center gap-2">
//             <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-2xl", meta.badgeCls)}>
//               {meta.icon}
//             </div>

//             <div>
//               <div className="font-black">{meta.title}</div>
//               <div className={cn("text-xs", T(theme).muted)}>
//                 {items.length} item(s)
//               </div>
//             </div>
//           </div>

//           <Badge className={meta.badgeCls}>{laneKey}</Badge>
//         </div>

//         <div
//           id={laneKey}
//           className={cn(
//             "min-h-[420px] space-y-3 rounded-2xl border border-dashed p-2 transition-all",
//             theme === "dark"
//               ? "border-white/10 bg-white/[0.02]"
//               : "border-slate-200 bg-slate-50/60",
//             isActiveLane && `ring-2 ${T(theme).ring}`
//           )}
//         >
//           <SortableContext
//             items={items.map((m) => m.id)}
//             strategy={verticalListSortingStrategy}
//           >
//             {items.length === 0 ? (
//               <div className={cn("flex min-h-[220px] items-center justify-center text-sm", T(theme).muted)}>
//                 Drop here
//               </div>
//             ) : (
//               items.map((move) => (
//                 <SortableMovementCard key={move.id} move={move} theme={theme} />
//               ))
//             )}
//           </SortableContext>
//         </div>
//       </Soft>
//     </div>
//   );
// }

// function ProductImageModal({
//   open,
//   onOpenChange,
//   product,
//   gallery,
//   activeId,
//   onChangeActive,
// }: {
//   open: boolean;
//   onOpenChange: (v: boolean) => void;
//   product: Product | null;
//   gallery: GalleryItem[];
//   activeId: string;
//   onChangeActive: (id: string) => void;
// }) {
//   if (!product || gallery.length === 0) return null;

//   const current = gallery.find((g) => g.id === activeId) || gallery[0];
//   const idx = gallery.findIndex((g) => g.id === current.id);

//   const prev = () => onChangeActive(gallery[(idx - 1 + gallery.length) % gallery.length].id);
//   const next = () => onChangeActive(gallery[(idx + 1) % gallery.length].id);

//   return (
//     <AnimatePresence>
//       {open && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
//           onClick={(e) => e.target === e.currentTarget && onOpenChange(false)}
//         >
//           <motion.div
//             initial={{ opacity: 0, scale: 0.96, y: 12 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.96, y: 12 }}
//             className="relative w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/10 bg-[#081120]/95 text-white shadow-2xl"
//           >
//             <div className="grid min-h-[70vh] md:grid-cols-[1fr_320px]">
//               <div className="relative flex items-center justify-center overflow-hidden bg-black/30">
//                 <button
//                   onClick={() => onOpenChange(false)}
//                   className="absolute right-4 top-4 z-20 rounded-2xl border border-white/15 bg-white/10 p-2 text-white backdrop-blur hover:bg-white/15"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>

//                 <button
//                   onClick={prev}
//                   className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-2xl border border-white/15 bg-white/10 p-3 text-white backdrop-blur hover:bg-white/15"
//                 >
//                   <ChevronLeft className="h-5 w-5" />
//                 </button>

//                 <button
//                   onClick={next}
//                   className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-2xl border border-white/15 bg-white/10 p-3 text-white backdrop-blur hover:bg-white/15"
//                 >
//                   <ChevronRight className="h-5 w-5" />
//                 </button>

//                 <div className="absolute left-4 top-4 z-20 flex flex-wrap gap-2 pr-20">
//                   <Badge className="border-white/15 bg-white/10 text-white">{product.category || "PRODUCT"}</Badge>
//                   <Badge className="border-white/15 bg-white/10 text-white">{product.sku}</Badge>
//                 </div>

//                 {current.kind === "image" && current.url ? (
//                   <img src={current.url} alt={product.product_name} className="max-h-[70vh] w-auto max-w-full object-contain" />
//                 ) : (
//                   <div className={cn("relative h-full min-h-[70vh] w-full bg-gradient-to-br", current.gradient)}>
//                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.2),transparent_22%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.15),transparent_24%)]" />
//                     <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 text-center text-white">
//                       <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/20 bg-white/10 text-3xl font-black backdrop-blur">
//                         {current.kind === "sku"
//                           ? "SKU"
//                           : current.kind === "type"
//                           ? getInitials(product.product_type || "T")
//                           : getInitials(product.product_name || "P")}
//                       </div>
//                       <div className="space-y-2">
//                         <div className="text-4xl font-black leading-tight">{product.product_name}</div>
//                         <div className="text-base text-white/80">
//                           {current.kind === "sku"
//                             ? product.sku
//                             : current.kind === "type"
//                             ? product.product_type || "General Item"
//                             : product.category || "Product"}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="border-l border-white/10 p-5">
//                 <div className="mb-4">
//                   <div className="text-[11px] font-black tracking-[0.18em] text-white/45">IMAGE PREVIEW</div>
//                   <div className="mt-1 text-2xl font-black">{product.product_name}</div>
//                   <div className="mt-1 text-sm text-white/65">{product.product_type || "General Item"}</div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
//                     <div className="text-[10px] font-black tracking-[0.18em] text-white/40">PRICE</div>
//                     <div className="mt-1 text-lg font-black">{money(product.product_price)}</div>
//                   </div>
//                   <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
//                     <div className="text-[10px] font-black tracking-[0.18em] text-white/40">STOCK</div>
//                     <div className="mt-1 text-lg font-black">{numberFormat(product.product_quantity_amount)}</div>
//                   </div>
//                 </div>

//                 <div className="mt-5 space-y-3">
//                   {gallery.map((item) => (
//                     <GalleryTile
//                       key={item.id}
//                       item={item}
//                       active={item.id === current.id}
//                       onClick={() => onChangeActive(item.id)}
//                     />
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
// // PAGE
// // ─────────────────────────────────────────────────────────────────────────────

// export default function ProductViewPage() {
//   const router = useRouter();
//   const params = useParams<{ id: string }>();
//   const id = params?.id;

//   const { data: session, status } = useSession();
//   const { resolvedTheme, setTheme: setNextTheme } = useTheme();

//   const theme: TK = resolvedTheme === "dark" ? "dark" : "light";
//   const t = T(theme);

//   const token =
//     (session as any)?.accessToken ||
//     (session as any)?.access_token ||
//     (session as any)?.token ||
//     null;

//   function authHeaders(): Record<string, string> {
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   }

//   const [product, setProduct] = useState<Product | null>(null);
//   const [loading, setLoading] = useState(true);

//   const [moves, setMoves] = useState<StockMovement[]>([]);
//   const [movesLoading, setMovesLoading] = useState(false);
//   const [movesFirstLoaded, setMovesFirstLoaded] = useState(false);

//   const [mPage, setMPage] = useState(1);
//   const [mPageSize, setMPageSize] = useState(10);

//   const barcodeSvgRef = useRef<SVGSVGElement | null>(null);

//   const [stockOpen, setStockOpen] = useState(false);
//   const [stockMode, setStockMode] = useState<"IN" | "OUT" | "ADJUST">("IN");
//   const [stockQty, setStockQty] = useState<number>(1);
//   const [stockNote, setStockNote] = useState<string>("");
//   const [stockSaving, setStockSaving] = useState(false);

//   const [activeMoveId, setActiveMoveId] = useState<string | null>(null);
//   const [activeLane, setActiveLane] = useState<MovementLaneKey | null>(null);
//   const [activeGalleryId, setActiveGalleryId] = useState<string>("main");
//   const [movementLanes, setMovementLanes] = useState<MovementLaneMap>({
//     IN: [],
//     OUT: [],
//     ADJUST: [],
//   });
//   const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

//   const laneKeys: MovementLaneKey[] = ["IN", "OUT", "ADJUST"];

//   const barcodeValue =
//     (product?.barcode && product.barcode.trim() !== "" ? product.barcode : null) ??
//     product?.sku ??
//     "";

//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
//     useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
//     useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     })
//   );

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       toast.error("Login လုပ်ပါ");
//       signIn();
//     }
//   }, [status]);

//   async function loadProduct() {
//     if (!id) return;
//     if (status === "loading") return;

//     if (!token) {
//       toast.error("Session token မရပါ — Login ပြန်လုပ်ပါ");
//       signIn();
//       return;
//     }

//     const tid = toast.loading("Loading product...");

//     try {
//       setLoading(true);

//       const res = await fetch(`/backend/api/products/${id}`, {
//         method: "GET",
//         headers: { ...authHeaders(), Accept: "application/json" },
//         cache: "no-store",
//       });

//       if (!res.ok) {
//         const detail = await readErrorText(res);

//         if (res.status === 401) {
//           toast.error("Unauthorized — Login ပြန်လုပ်ပါ", { id: tid });
//           signIn();
//         } else if (res.status === 403) {
//           toast.error("Forbidden — ADMIN လိုနိုင်တယ်", { id: tid });
//         } else if (res.status === 404) {
//           toast.error("Product မတွေ့ပါ (404) — id မမှန်နိုင်ပါတယ်", { id: tid });
//         } else {
//           toast.error(detail || `Product load မရပါ (status ${res.status})`, { id: tid });
//         }

//         setProduct(null);
//         return;
//       }

//       const data = (await res.json()) as Product;
//       setProduct(data);
//       toast.success("Loaded ✅", { id: tid });
//     } catch (e) {
//       console.error(e);
//       toast.error("Server error ဖြစ်နေတယ်", { id: tid });
//       setProduct(null);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function loadMovements(resetPage = false) {
//     if (!id) return;
//     if (status === "loading") return;
//     if (!token) return;

//     try {
//       setMovesLoading(true);

//       const res = await fetch(`/backend/api/products/${id}/movements`, {
//         method: "GET",
//         headers: { ...authHeaders(), Accept: "application/json" },
//         cache: "no-store",
//       });

//       if (!res.ok) {
//         setMovesFirstLoaded(true);
//         setMoves([]);
//         setMovementLanes({ IN: [], OUT: [], ADJUST: [] });
//         return;
//       }

//       const data = (await res.json()) as StockMovement[];
//       setMoves(data);
//       setMovementLanes(buildLaneMap(data));
//       setMovesFirstLoaded(true);

//       const newTotalPages = Math.max(1, Math.ceil(data.length / mPageSize));
//       if (resetPage) setMPage(1);
//       else setMPage((p) => Math.min(p, newTotalPages));
//     } catch (e) {
//       console.error(e);
//       toast.error("Movements load error");
//     } finally {
//       setMovesLoading(false);
//     }
//   }

//   function openStockModal(mode: "IN" | "OUT" | "ADJUST") {
//     setStockMode(mode);
//     setStockQty(mode === "ADJUST" ? Number(product?.product_quantity_amount ?? 0) : 1);
//     setStockNote("");
//     setStockOpen(true);
//   }

//   async function submitStock() {
//     if (!product) return;
//     if (status === "loading") return;

//     if (!token) {
//       toast.error("Session token မရပါ — Login ပြန်လုပ်ပါ");
//       signIn();
//       return;
//     }

//     try {
//       setStockSaving(true);

//       const url =
//         stockMode === "IN"
//           ? `/backend/api/products/${product.id}/stock-in`
//           : stockMode === "OUT"
//           ? `/backend/api/products/${product.id}/stock-out`
//           : `/backend/api/products/${product.id}/stock-adjust`;

//       const method = stockMode === "ADJUST" ? "PATCH" : "POST";
//       const qtyNum = Number(stockQty);

//       if (!Number.isFinite(qtyNum)) return toast.error("Qty မှန်မှန်ထည့်ပါ");

//       if (stockMode === "ADJUST") {
//         if (!Number.isInteger(qtyNum) || qtyNum < 0) {
//           return toast.error("Adjust qty ကို 0 သို့ အပေါင်းကိန်း ထည့်ပါ");
//         }
//       } else {
//         if (!Number.isInteger(qtyNum) || qtyNum <= 0) {
//           return toast.error("Qty ကို 1 ထက်ကြီးတဲ့ အပေါင်းကိန်း ထည့်ပါ");
//         }
//       }

//       const res = await fetch(url, {
//         method,
//         headers: { ...authHeaders(), "Content-Type": "application/json" },
//         body: JSON.stringify({
//           qty: qtyNum,
//           note: stockNote.trim() ? stockNote.trim() : undefined,
//         }),
//       });

//       const data = await res.json().catch(() => null);

//       if (!res.ok) {
//         toast.error(data?.message || `Stock update failed (status ${res.status})`);
//         return;
//       }

//       toast.success(
//         stockMode === "IN"
//           ? "Stock IN success ✅"
//           : stockMode === "OUT"
//           ? "Stock OUT success ✅"
//           : "Stock ADJUST success ✅"
//       );

//       setStockOpen(false);
//       await loadProduct();
//       await loadMovements(true);
//     } catch (e) {
//       console.error(e);
//       toast.error("Stock update error");
//     } finally {
//       setStockSaving(false);
//     }
//   }

//   useEffect(() => {
//     if (!barcodeSvgRef.current) return;
//     if (!barcodeValue) return;

//     try {
//       JsBarcode(barcodeSvgRef.current, barcodeValue, {
//         format: "CODE128",
//         displayValue: true,
//         fontSize: 14,
//         height: 70,
//         margin: 8,
//       });
//     } catch (e) {
//       console.error(e);
//     }
//   }, [barcodeValue]);

//   useEffect(() => {
//     if (!id) return;
//     if (status !== "authenticated") return;

//     loadProduct();
//     loadMovements(true);
//   }, [id, status, token]);

//   useEffect(() => {
//     setMoves(flattenLaneMap(movementLanes));
//   }, [movementLanes]);

//   const gallery = buildGallery(product);
//   const activeGallery =
//     gallery.find((g) => g.id === activeGalleryId) || gallery[0] || null;

//   const stock = product?.product_quantity_amount ?? 0;

//   const mTotal = moves.length;
//   const mTotalPages = Math.max(1, Math.ceil(mTotal / mPageSize));
//   const mSafePage = Math.min(Math.max(mPage, 1), mTotalPages);

//   const activeMove =
//     activeMoveId
//       ? flattenLaneMap(movementLanes).find((m) => m.id === activeMoveId) || null
//       : null;

//   const totalIn = useMemo(
//     () => moves.filter((m) => m.type === "IN").reduce((s, m) => s + Number(m.qty || 0), 0),
//     [moves]
//   );

//   const totalOut = useMemo(
//     () => moves.filter((m) => m.type === "OUT").reduce((s, m) => s + Number(m.qty || 0), 0),
//     [moves]
//   );

//   const adjustCount = useMemo(
//     () => moves.filter((m) => m.type === "ADJUST").length,
//     [moves]
//   );

//   const lastMove = moves[0] || null;

//   function onDragStart(event: DragStartEvent) {
//     const id = String(event.active.id);
//     setActiveMoveId(id);
//     setActiveLane(findLaneByMovementId(movementLanes, id));
//   }

//   function onDragOver(event: DragOverEvent) {
//     const { active, over } = event;
//     if (!over) return;

//     const activeId = String(active.id);
//     const overId = String(over.id);

//     const fromLane = findLaneByMovementId(movementLanes, activeId);
//     const toLane = findLaneForOverTarget(movementLanes, overId);

//     if (!fromLane || !toLane) return;

//     setActiveLane(toLane);

//     if (fromLane === toLane) return;

//     setMovementLanes((prev) => {
//       const sourceItems = [...prev[fromLane]];
//       const targetItems = [...prev[toLane]];

//       const sourceIndex = sourceItems.findIndex((m) => m.id === activeId);
//       if (sourceIndex === -1) return prev;

//       const [moved] = sourceItems.splice(sourceIndex, 1);
//       const nextItem = { ...moved, type: toLane };

//       const overIndex = targetItems.findIndex((m) => m.id === overId);
//       if (overIndex === -1) {
//         targetItems.push(nextItem);
//       } else {
//         targetItems.splice(overIndex, 0, nextItem);
//       }

//       return {
//         ...prev,
//         [fromLane]: sourceItems,
//         [toLane]: targetItems,
//       };
//     });
//   }

//   function onDragEnd(event: DragEndEvent) {
//     const { active, over } = event;

//     if (!over) {
//       setActiveMoveId(null);
//       setActiveLane(null);
//       return;
//     }

//     const activeId = String(active.id);
//     const overId = String(over.id);

//     const fromLane = findLaneByMovementId(movementLanes, activeId);
//     const toLane = findLaneForOverTarget(movementLanes, overId);

//     if (!fromLane || !toLane) {
//       setActiveMoveId(null);
//       setActiveLane(null);
//       return;
//     }

//     if (fromLane === toLane) {
//       setMovementLanes((prev) => {
//         const items = [...prev[toLane]];
//         const oldIndex = items.findIndex((m) => m.id === activeId);
//         const newIndex = items.findIndex((m) => m.id === overId);

//         if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
//           return prev;
//         }

//         return {
//           ...prev,
//           [toLane]: arrayMove(items, oldIndex, newIndex),
//         };
//       });
//     }

//     setActiveMoveId(null);
//     setActiveLane(null);
//   }

//   function printBarcode() {
//     if (!product) return;

//     const svg = barcodeSvgRef.current?.outerHTML || "";
//     const title = product.product_name ?? "Product";

//     const html = `<!doctype html>
// <html>
// <head>
//   <meta charset="utf-8" />
//   <title>Print Barcode</title>
//   <style>
//     body { font-family: Arial, sans-serif; padding: 18px; }
//     .wrap { width: 360px; border: 1px solid #ddd; border-radius: 12px; padding: 14px; }
//     .name { font-weight: 700; margin-bottom: 6px; }
//     .sku { color: #555; font-size: 12px; margin-bottom: 10px; }
//     .row { display:flex; gap:10px; flex-wrap:wrap; }
//     .price { font-weight: 700; }
//     svg { width: 100%; height: auto; }
//   </style>
// </head>
// <body>
//   <div class="wrap">
//     <div class="name">${escapeHtml(title)}</div>
//     <div class="sku">SKU: ${escapeHtml(product.sku)}</div>
//     ${svg}
//     <div class="row" style="margin-top:10px;">
//       <div class="price">Price: ${Number(product.product_price || 0).toLocaleString()}</div>
//       <div>Stock: ${Number(product.product_quantity_amount || 0)}</div>
//     </div>
//   </div>
//   <script>
//     window.onload = () => {
//       window.print();
//       window.close();
//     }
//   </script>
// </body>
// </html>`;

//     const w = window.open("", "_blank", "width=460,height=560");
//     if (!w) {
//       toast.error("Popup blocked ဖြစ်နေတယ်");
//       return;
//     }

//     w.document.open();
//     w.document.write(html);
//     w.document.close();
//   }

//   if (status === "loading" || loading) {
//     return (
//       <div className={cn("min-h-screen flex items-center justify-center", t.root)}>
//         <div className={cn("text-sm", t.muted)}>Loading product...</div>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className={cn("min-h-screen flex items-center justify-center px-4", t.root)}>
//         <Glass theme={theme} className="w-full max-w-md p-8 text-center space-y-4">
//           <div className="text-xl font-black">Product not found</div>
//           <div className={cn("text-sm", t.muted)}>ဒီ product ကို ရှာမတွေ့ပါ</div>
//           <Button variant="outline" size="sm" onClick={loadProduct} className="gap-2">
//             <RefreshCw className="h-4 w-4" />
//             Retry
//           </Button>
//         </Glass>
//       </div>
//     );
//   }

//   return (
//     <div className={cn("min-h-screen", t.root)}>
//       <ProductImageModal
//         open={imagePreviewOpen}
//         onOpenChange={setImagePreviewOpen}
//         product={product}
//         gallery={gallery}
//         activeId={activeGalleryId}
//         onChangeActive={setActiveGalleryId}
//       />

//       <div className="mx-auto w-full max-w-[1900px] px-4 py-8 sm:px-6 2xl:px-10 space-y-6">
//         {/* HERO */}
//         <Glass theme={theme} className={t.hero}>
//           <div className="p-6 2xl:p-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
//             <div className="space-y-3">
//               <div className="flex flex-wrap gap-2">
//                 <Badge className="rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 px-3 py-1 text-xs font-bold">
//                   <Sparkles className="mr-1.5 h-3.5 w-3.5" />
//                   Product Detail 3D+
//                 </Badge>

//                 <Badge className="rounded-full border px-3 py-1 text-xs font-bold">
//                   <Layers3 className="mr-1.5 h-3.5 w-3.5" />
//                   dnd-kit Enhanced
//                 </Badge>

//                 <Badge className="rounded-full border px-3 py-1 text-xs font-bold">
//                   <GalleryVertical className="mr-1.5 h-3.5 w-3.5" />
//                   Gallery + Sidebar
//                 </Badge>

//                 <Badge className="rounded-full border px-3 py-1 text-xs font-bold">
//                   <ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />
//                   Kanban Lanes
//                 </Badge>
//               </div>

//               <div className="text-[clamp(1.8rem,3.5vw,3rem)] font-black tracking-tight leading-none">
//                 {product.product_name}
//               </div>

//               <div className={cn("text-sm 2xl:text-base", t.muted)}>
//                 Full 3D floating product scene with gallery thumbnails, sticky control panel
//                 and kanban-style stock movement lanes
//               </div>
//             </div>

//             <div className="flex flex-wrap gap-2">
//               <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
//                 <ArrowLeft className="h-4 w-4" />
//                 Back
//               </Button>

//               <Button
//                 size="sm"
//                 onClick={() => router.push(`/dashboard/product/${product.id}/edit`)}
//                 className="gap-2"
//               >
//                 <Pencil className="h-4 w-4" />
//                 Edit
//               </Button>

//               <Button variant="outline" size="sm" onClick={() => loadProduct()} className="gap-2">
//                 <RefreshCw className="h-4 w-4" />
//                 Refresh
//               </Button>

//               <Button
//                 variant="outline"
//                 size="icon"
//                 onClick={() => setNextTheme(theme === "dark" ? "light" : "dark")}
//               >
//                 {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
//               </Button>
//             </div>
//           </div>
//         </Glass>

//         {/* MAIN */}
//         <div className="grid gap-6 2xl:gap-8 xl:grid-cols-[1.4fr_0.9fr]">
//           {/* LEFT */}
//           <div className="space-y-6">
//             <div className="grid gap-6 xl:grid-cols-[110px_minmax(0,1fr)] 2xl:grid-cols-[128px_minmax(0,1fr)]">
//               {/* GALLERY */}
//               <Glass theme={theme} className="p-3">
//                 <div className="space-y-3">
//                   {gallery.map((item) => (
//                     <GalleryTile
//                       key={item.id}
//                       item={item}
//                       active={item.id === activeGallery?.id}
//                       onClick={() => setActiveGalleryId(item.id)}
//                     />
//                   ))}
//                 </div>
//               </Glass>

//               {/* SCENE */}
//               <motion.div
//                 className="[perspective:1800px]"
//                 initial={{ opacity: 0, y: 16 }}
//                 animate={{ opacity: 1, y: 0 }}
//               >
//                 <motion.div
//                   whileHover={{ rotateX: 4, rotateY: -7, scale: 1.01 }}
//                   transition={{ type: "spring", stiffness: 180, damping: 18 }}
//                   style={{ transformStyle: "preserve-3d" }}
//                 >
//                   <Glass theme={theme} className="group overflow-hidden">
//                     <div className="relative min-h-[420px] 2xl:min-h-[620px]">
//                       {activeGallery ? (
//                         <ProductScene product={product} galleryItem={activeGallery} />
//                       ) : null}

//                       <button
//                         type="button"
//                         onClick={() => setImagePreviewOpen(true)}
//                         className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-black/25 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-black/35"
//                       >
//                         <Eye className="h-4 w-4" />
//                         Preview
//                       </button>

//                       <div className="absolute left-4 top-4 flex flex-wrap gap-2">
//                         <StockBadge stock={stock} />
//                         {product.product_discount ? (
//                           <Badge className="rounded-full border border-white/20 bg-emerald-500/20 text-white backdrop-blur px-3 py-1 text-[10px] font-bold">
//                             -{product.product_discount}
//                           </Badge>
//                         ) : null}
//                       </div>

//                       <div className="absolute right-4 top-4">
//                         <Badge className="rounded-full border border-white/20 bg-black/20 text-white backdrop-blur px-3 py-1 text-[10px] font-bold">
//                           {product.category || "UNCATEGORIZED"}
//                         </Badge>
//                       </div>

//                       <div className="absolute left-4 right-4 bottom-4 grid gap-3 md:grid-cols-3">
//                         <div className="rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-white backdrop-blur">
//                           <div className="text-[10px] tracking-[0.18em] font-black text-white/70">
//                             PRICE
//                           </div>
//                           <div className="text-lg font-black">{money(product.product_price)}</div>
//                         </div>

//                         <div className="rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-white backdrop-blur">
//                           <div className="text-[10px] tracking-[0.18em] font-black text-white/70">
//                             SKU
//                           </div>
//                           <div className="text-sm font-black break-all">{product.sku}</div>
//                         </div>

//                         <div className="rounded-2xl border border-white/20 bg-black/20 px-4 py-3 text-white backdrop-blur">
//                           <div className="text-[10px] tracking-[0.18em] font-black text-white/70">
//                             TYPE
//                           </div>
//                           <div className="text-sm font-black">{product.product_type || "General"}</div>
//                         </div>
//                       </div>
//                     </div>
//                   </Glass>
//                 </motion.div>
//               </motion.div>
//             </div>

//             {/* ANALYTICS */}
//             <Glass theme={theme}>
//               <div className="p-5 2xl:p-7 space-y-5">
//                 <div className="flex items-center justify-between gap-3 flex-wrap">
//                   <div>
//                     <div className="flex items-center gap-2 text-xl font-black">
//                       <Gauge className="h-5 w-5" />
//                       Stock Analytics
//                     </div>
//                     <div className={cn("text-sm", t.muted)}>
//                       lightweight UI analytics cards
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
//                   <MetricCard
//                     theme={theme}
//                     icon={<Wallet className="h-4 w-4" />}
//                     label="PRICE"
//                     value={<AnimatedNumber value={product.product_price} />}
//                     sub="current price"
//                   />
//                   <MetricCard
//                     theme={theme}
//                     icon={<Boxes className="h-4 w-4" />}
//                     label="STOCK"
//                     value={<AnimatedNumber value={stock} />}
//                     sub="available now"
//                     tone={stock <= 0 ? "danger" : stock < 5 ? "warn" : "good"}
//                   />
//                   <MetricCard
//                     theme={theme}
//                     icon={<ArrowUpRight className="h-4 w-4" />}
//                     label="TOTAL IN"
//                     value={<AnimatedNumber value={totalIn} />}
//                     sub="sum of IN movements"
//                     tone="good"
//                   />
//                   <MetricCard
//                     theme={theme}
//                     icon={<ArrowDownRight className="h-4 w-4" />}
//                     label="TOTAL OUT"
//                     value={<AnimatedNumber value={totalOut} />}
//                     sub="sum of OUT movements"
//                     tone="danger"
//                   />
//                 </div>

//                 <div className="grid gap-4 xl:grid-cols-3">
//                   <Soft theme={theme} className="p-4 xl:col-span-2">
//                     <div className="flex items-center justify-between gap-3">
//                       <div>
//                         <div className="text-sm font-bold">Stock Health</div>
//                         <div className={cn("text-xs", t.muted)}>simple visual balance</div>
//                       </div>
//                       <Badge variant="secondary">{stock} units</Badge>
//                     </div>

//                     <div className="mt-4">
//                       <StockBar stock={stock} />
//                     </div>

//                     <div className="mt-4 grid grid-cols-3 gap-3">
//                       <div className="rounded-2xl border border-black/5 dark:border-white/10 p-3">
//                         <div className={cn("text-[10px] font-black tracking-[0.18em]", t.subtle)}>
//                           IN
//                         </div>
//                         <div className="mt-1 font-black text-emerald-600 dark:text-emerald-300">{numberFormat(totalIn)}</div>
//                       </div>

//                       <div className="rounded-2xl border border-black/5 dark:border-white/10 p-3">
//                         <div className={cn("text-[10px] font-black tracking-[0.18em]", t.subtle)}>
//                           OUT
//                         </div>
//                         <div className="mt-1 font-black text-rose-600 dark:text-rose-300">{numberFormat(totalOut)}</div>
//                       </div>

//                       <div className="rounded-2xl border border-black/5 dark:border-white/10 p-3">
//                         <div className={cn("text-[10px] font-black tracking-[0.18em]", t.subtle)}>
//                           ADJUST
//                         </div>
//                         <div className="mt-1 font-black text-amber-600 dark:text-amber-300">{numberFormat(adjustCount)}</div>
//                       </div>
//                     </div>
//                   </Soft>

//                   <Soft theme={theme} className="p-4">
//                     <div className="flex items-center gap-2 text-sm font-bold">
//                       <Clock3 className="h-4 w-4" />
//                       Last Activity
//                     </div>

//                     <div className="mt-4 space-y-3">
//                       {lastMove ? (
//                         <>
//                           <div className="flex items-center gap-2">{movementBadge(lastMove.type)}</div>
//                           <div className="text-lg font-black">
//                             {numberFormat(lastMove.before_qty)} → {numberFormat(lastMove.after_qty)}
//                           </div>
//                           <div className={cn("text-sm", t.muted)}>
//                             {new Date(lastMove.created_at).toLocaleString()}
//                           </div>
//                           <div className={cn("text-sm", t.muted)}>
//                             {lastMove.note || "No note"}
//                           </div>
//                         </>
//                       ) : (
//                         <div className={cn("text-sm", t.muted)}>No recent movement</div>
//                       )}
//                     </div>
//                   </Soft>
//                 </div>
//               </div>
//             </Glass>

//             {/* KANBAN MOVEMENTS */}
//             <Glass theme={theme}>
//               <div className="p-5 2xl:p-7 space-y-5">
//                 <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//                   <div className="space-y-1">
//                     <div className="flex items-center gap-2 text-xl font-black">
//                       <ArrowRightLeft className="h-5 w-5" />
//                       Movement Kanban
//                     </div>
//                     <div className={cn("text-sm", t.muted)}>
//                       IN / OUT / ADJUST lanes with cross-lane dnd-kit drag
//                     </div>
//                   </div>

//                   <div className="flex flex-wrap items-center gap-2">
//                     <Badge variant="secondary" className="gap-1">
//                       <Package2 className="h-3.5 w-3.5" />
//                       {mTotal} total
//                     </Badge>

//                     <Badge variant="secondary" className="gap-1">
//                       <ScanLine className="h-3.5 w-3.5" />
//                       Page {mSafePage} / {mTotalPages}
//                     </Badge>

//                     <select
//                       className={cn("h-10 rounded-xl border px-3 text-sm outline-none", t.input)}
//                       value={mPageSize}
//                       onChange={(e) => {
//                         setMPageSize(Number(e.target.value));
//                         setMPage(1);
//                       }}
//                     >
//                       <option value={10}>10</option>
//                       <option value={20}>20</option>
//                       <option value={50}>50</option>
//                     </select>

//                     <Button
//                       size="sm"
//                       variant="outline"
//                       className="gap-2"
//                       onClick={() => loadMovements(true)}
//                       disabled={movesLoading}
//                     >
//                       <RefreshCw className={cn("h-4 w-4", movesLoading && "animate-spin")} />
//                       Refresh
//                     </Button>
//                   </div>
//                 </div>

//                 {mTotal === 0 && movesFirstLoaded ? (
//                   <Soft theme={theme} className="p-8 text-center">
//                     <div className={cn("text-sm", t.muted)}>Movements မရှိသေးပါ</div>
//                   </Soft>
//                 ) : (
//                   <DndContext
//                     sensors={sensors}
//                     collisionDetection={closestCenter}
//                     onDragStart={onDragStart}
//                     onDragOver={onDragOver}
//                     onDragEnd={onDragEnd}
//                   >
//                     <div className="grid gap-4 xl:grid-cols-3">
//                       {laneKeys.map((laneKey) => (
//                         <MovementLane
//                           key={laneKey}
//                           laneKey={laneKey}
//                           items={movementLanes[laneKey]}
//                           theme={theme}
//                           isActiveLane={activeLane === laneKey}
//                         />
//                       ))}
//                     </div>

//                     <DragOverlay>
//                       {activeMove ? <MovementOverlay move={activeMove} theme={theme} /> : null}
//                     </DragOverlay>
//                   </DndContext>
//                 )}

//                 <div className={cn("text-xs", t.subtle)}>
//                   Frontend preview only · refresh လုပ်ရင် backend order / lane state ပြန်လာနိုင်တယ်
//                 </div>
//               </div>
//             </Glass>
//           </div>

//           {/* RIGHT SIDEBAR */}
//           <div className="space-y-6 xl:sticky xl:top-6 self-start">
//             <Glass theme={theme}>
//               <div className="p-5 space-y-5">
//                 <div className="flex items-center gap-2 text-lg font-black">
//                   <ShieldCheck className="h-5 w-5" />
//                   Quick Control
//                 </div>

//                 <div className="grid gap-3">
//                   <Button
//                     variant="outline"
//                     onClick={() => openStockModal("IN")}
//                     className="gap-2 h-11 rounded-2xl justify-start"
//                   >
//                     <TrendingUp className="h-4 w-4" />
//                     Stock IN
//                   </Button>

//                   <Button
//                     variant="outline"
//                     onClick={() => openStockModal("OUT")}
//                     className="gap-2 h-11 rounded-2xl justify-start"
//                   >
//                     <TrendingDown className="h-4 w-4" />
//                     Stock OUT
//                   </Button>

//                   <Button
//                     variant="secondary"
//                     onClick={() => openStockModal("ADJUST")}
//                     className="gap-2 h-11 rounded-2xl justify-start"
//                   >
//                     <History className="h-4 w-4" />
//                     Adjust
//                   </Button>

//                   <Button
//                     variant="outline"
//                     onClick={() => setImagePreviewOpen(true)}
//                     className="gap-2 h-11 rounded-2xl justify-start"
//                   >
//                     <ImageIcon className="h-4 w-4" />
//                     Open Image Preview
//                   </Button>

//                   <Button
//                     variant="outline"
//                     onClick={printBarcode}
//                     className="gap-2 h-11 rounded-2xl justify-start"
//                   >
//                     <Printer className="h-4 w-4" />
//                     Print Barcode
//                   </Button>
//                 </div>
//               </div>
//             </Glass>

//             <Glass theme={theme}>
//               <div className="p-5 space-y-4">
//                 <div className="flex items-center gap-2 text-lg font-black">
//                   <Package className="h-5 w-5" />
//                   Product Info
//                 </div>

//                 <div className="grid gap-3">
//                   <MetricCard
//                     theme={theme}
//                     icon={<CircleDollarSign className="h-4 w-4" />}
//                     label="PRICE"
//                     value={money(product.product_price)}
//                   />
//                   <MetricCard
//                     theme={theme}
//                     icon={<Box className="h-4 w-4" />}
//                     label="SKU"
//                     value={<span className="text-sm break-all">{product.sku}</span>}
//                   />
//                   <MetricCard
//                     theme={theme}
//                     icon={<Tag className="h-4 w-4" />}
//                     label="CATEGORY"
//                     value={<span className="text-sm">{product.category || "UNCATEGORIZED"}</span>}
//                   />
//                   <MetricCard
//                     theme={theme}
//                     icon={<Zap className="h-4 w-4" />}
//                     label="TYPE"
//                     value={<span className="text-sm">{product.product_type || "General"}</span>}
//                   />
//                 </div>

//                 {product.note ? (
//                   <Soft theme={theme} className="p-4">
//                     <div className="text-sm font-bold mb-1">Note</div>
//                     <p className={cn("text-sm whitespace-pre-wrap", t.muted)}>{product.note}</p>
//                   </Soft>
//                 ) : null}
//               </div>
//             </Glass>

//             <Glass theme={theme}>
//               <div className="p-5 space-y-4">
//                 <div className="flex items-center justify-between gap-3">
//                   <div>
//                     <div className="flex items-center gap-2 text-lg font-black">
//                       <BarcodeIcon className="h-5 w-5" />
//                       Barcode
//                     </div>
//                     <div className={cn("text-sm", t.muted)}>
//                       uses {product.barcode ? "barcode" : "SKU"}
//                     </div>
//                   </div>

//                   <Button size="sm" variant="outline" className="gap-2" onClick={printBarcode}>
//                     <Printer className="h-4 w-4" />
//                     Print
//                   </Button>
//                 </div>

//                 <Soft theme={theme} className="p-4 overflow-x-auto">
//                   <svg ref={barcodeSvgRef} />
//                 </Soft>
//               </div>
//             </Glass>
//           </div>
//         </div>
//       </div>

//       {/* STOCK MODAL */}
//       <Dialog open={stockOpen} onOpenChange={setStockOpen}>
//         <DialogContent className="sm:max-w-md 2xl:sm:max-w-lg">
//           <DialogHeader>
//             <DialogTitle>
//               {stockMode === "IN"
//                 ? "Stock IN"
//                 : stockMode === "OUT"
//                 ? "Stock OUT"
//                 : "Stock Adjust"}
//             </DialogTitle>

//             <DialogDescription>
//               {stockMode === "ADJUST"
//                 ? "Final stock number (absolute) ကို သတ်မှတ်ပါ"
//                 : "Qty (delta) ကို ထည့်ပါ"}
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-3">
//             <div className="grid gap-2">
//               <Label>Qty</Label>
//               <Input
//                 type="number"
//                 value={stockQty}
//                 onChange={(e) => setStockQty(Number(e.target.value))}
//                 min={stockMode === "ADJUST" ? 0 : 1}
//               />
//               {stockMode === "OUT" && (
//                 <p className="text-xs text-muted-foreground">
//                   Current stock: <b>{product?.product_quantity_amount ?? 0}</b>
//                 </p>
//               )}
//             </div>

//             <div className="grid gap-2">
//               <Label>Note (optional)</Label>
//               <Input
//                 value={stockNote}
//                 onChange={(e) => setStockNote(e.target.value)}
//                 placeholder="e.g. restock from supplier / sale invoice..."
//               />
//             </div>
//           </div>

//           <DialogFooter className="gap-2">
//             <Button variant="outline" onClick={() => setStockOpen(false)} disabled={stockSaving}>
//               Cancel
//             </Button>
//             <Button onClick={submitStock} disabled={stockSaving}>
//               {stockSaving ? "Saving..." : "Confirm"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }



















"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  ArrowLeft,
  Pencil,
  Package,
  Tag,
  Boxes,
  Printer,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  History,
  Barcode as BarcodeIcon,
  GripVertical,
  Sparkles,
  ScanLine,
  Wallet,
  Package2,
  UserRound,
  Activity,
  GalleryVertical,
  Gauge,
  ShieldCheck,
  CircleDollarSign,
  Clock3,
  Box,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  Eye,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  X,
  Loader2,
  Layers3,
} from "lucide-react";

import { toast } from "sonner";
import JsBarcode from "jsbarcode";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Font + Animations
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
        0%   { transform: translateY(0) translateX(0) scale(1);     opacity: .55; }
        50%  { transform: translateY(-18px) translateX(5px) scale(1.1); opacity: .9; }
        100% { transform: translateY(-36px) translateX(-2px) scale(.5); opacity: 0; }
      }
    `}</style>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme tokens — mirrors product list / create / edit
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
        cardHover:   "hover:border-[rgba(212,163,82,0.35)]",
        btn:         "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#d4b68a] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f3e7d2]",
        btnPrimary:  "bg-gradient-to-r from-[#a07020] to-[#d4a352] text-[#140d05] hover:brightness-110 shadow-lg shadow-[#c8892a]/20",
        btnDanger:   "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20",
        soft:        "border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)]",
        input:       "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#f3e7d2] placeholder:text-[#8a7a65] focus-visible:border-[#c8892a] focus-visible:ring-[#c8892a]/20",
        pill:        "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#bca98f]",
        glow1:       "bg-amber-700/[0.16]",
        glow2:       "bg-orange-700/[0.10]",
        hero:        "border-[rgba(200,137,42,0.16)] bg-[linear-gradient(135deg,rgba(200,137,42,0.12),rgba(160,80,20,0.07),rgba(14,10,6,0.84))]",
        heroLine:    "from-[#a07020] via-[#d4a352] to-transparent",
        metricIcon:  "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]",
        ring:        "ring-[#c8892a]/40",
        laneIn:      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
        laneOut:     "border-rose-500/20 bg-rose-500/10 text-rose-300",
        laneAdj:     "border-amber-500/20 bg-amber-500/10 text-amber-300",
        laneDrop:    "border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.02)]",
        dragHandle:  "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#8a7a65] hover:bg-[rgba(255,255,255,0.10)]",
        modalBg:     "border-[rgba(200,137,42,0.16)] bg-[rgba(8,6,2,0.96)] backdrop-blur-3xl",
        sceneOverlay:"from-black/70 via-black/10 to-transparent",
      }
    : {
        root:        "bg-[#f0f4ff]",
        text:        "text-slate-900",
        textMuted:   "text-slate-500",
        textSubtle:  "text-slate-400",
        card:        "border-slate-200/80 bg-white/90 shadow-[0_2px_16px_rgba(15,23,42,0.06)]",
        cardHover:   "hover:border-slate-300",
        btn:         "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
        btnPrimary:  "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:brightness-110 shadow-lg shadow-blue-500/25",
        btnDanger:   "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
        soft:        "border-slate-200 bg-slate-50/80",
        input:       "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-blue-500 focus-visible:ring-blue-500/20",
        pill:        "border-slate-200 bg-white text-slate-500 shadow-sm",
        glow1:       "bg-violet-300/20",
        glow2:       "bg-blue-300/20",
        hero:        "border-slate-200/80 bg-[linear-gradient(135deg,rgba(6,182,212,0.08),rgba(99,102,241,0.06),rgba(255,255,255,0.96))]",
        heroLine:    "from-blue-500 via-violet-500 to-transparent",
        metricIcon:  "border-slate-200 bg-slate-50",
        ring:        "ring-blue-500/30",
        laneIn:      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
        laneOut:     "border-rose-500/20 bg-rose-500/10 text-rose-700",
        laneAdj:     "border-amber-500/20 bg-amber-500/10 text-amber-700",
        laneDrop:    "border-slate-200 bg-slate-50/60",
        dragHandle:  "border-slate-200 bg-white text-slate-400 hover:bg-slate-50 shadow-sm",
        modalBg:     "border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-xl",
        sceneOverlay:"from-black/65 via-black/10 to-transparent",
      };

// ─────────────────────────────────────────────────────────────────────────────
// LanternMark SVG
// ─────────────────────────────────────────────────────────────────────────────

function LanternMark({ size = 34, glow = false }: { size?: number; glow?: boolean }) {
  const h = size * 1.5;
  return (
    <svg width={size} height={h} viewBox="0 0 32 48" fill="none">
      <defs>
        <radialGradient id="lgGlowView" cx="50%" cy="48%" r="50%">
          <stop offset="0%"   stopColor="#fff7d6" stopOpacity="0.96" />
          <stop offset="28%"  stopColor="#fbbf24" stopOpacity="0.86" />
          <stop offset="60%"  stopColor="#f59e0b" stopOpacity="0.44" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0"    />
        </radialGradient>
        <linearGradient id="lmMetalView" x1="8" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#c58a3c" />
          <stop offset="50%"  stopColor="#a96b28" />
          <stop offset="100%" stopColor="#8a551d" />
        </linearGradient>
        <linearGradient id="lbBodyView" x1="6" y1="11" x2="26" y2="37" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#fffaf1" />
          <stop offset="45%"  stopColor="#f5e7cf" />
          <stop offset="100%" stopColor="#ecd5ae" />
        </linearGradient>
      </defs>
      <line x1="16" y1="0" x2="16" y2="6" stroke={glow ? "#d6ae67" : "#9d6a2b"} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="8" y="6" width="16" height="5" rx="2" fill="url(#lmMetalView)" stroke="#7b4a18" strokeWidth="0.8" />
      <rect x="6" y="11" width="20" height="26" rx="3" fill={glow ? "#0e0908" : "url(#lbBodyView)"} stroke="#a66b27" strokeWidth="1" />
      {glow && <rect x="6" y="11" width="20" height="26" rx="3" fill="url(#lgGlowView)" />}
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
      <rect x="8" y="37" width="16" height="5" rx="2" fill="url(#lmMetalView)" stroke="#7b4a18" strokeWidth="0.8" />
      <line x1="16" y1="42" x2="16" y2="47" stroke="#8f5b24" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="47" r="1.5" fill="#8f5b24" />
    </svg>
  );
}

function LanternToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <motion.button type="button" onClick={onToggle}
      whileHover={{ y: -2, scale: 1.04 }} whileTap={{ scale: 0.94 }}
      className="relative flex flex-col items-center focus:outline-none" style={{ width: 58 }}
      aria-label={dark ? "Switch to day mode" : "Switch to night mode"}>
      {dark && (
        <div className="pointer-events-none absolute" style={{
          width: 76, height: 76, top: -6, left: "50%", transform: "translateX(-50%)",
          borderRadius: "50%",
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
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
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
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Product = {
  id: string; sku: string; product_name: string; product_price: number;
  barcode?: string | null; category?: string | null;
  product_quantity_amount: number;
  product_image?: string | null; imagePath?: string | null; image_path?: string | null;
  product_discount?: number | null; note?: string | null; product_type?: string | null;
};

type StockMovement = {
  id: string; type: "IN" | "OUT" | "ADJUST"; qty: number;
  before_qty: number; after_qty: number; note?: string | null;
  created_at: string; user_name?: string | null;
};

type MovementLaneKey = "IN" | "OUT" | "ADJUST";
type MovementLaneMap = Record<MovementLaneKey, StockMovement[]>;

type GalleryItem = {
  id: string; kind: "image" | "generated" | "sku" | "type"; url: string | null;
  title: string; category: string; sku: string; type: string;
  initials: string; gradient: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function pickImagePath(p: any): string | null {
  return p?.imagePath ?? p?.image_path ?? p?.product_image ?? null;
}
function buildImageUrl(path?: string | null) {
  if (!path) return null;
  const raw = String(path).trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  return `/uploads/${raw.replace(/^\/?uploads\/?/, "").replace(/^\/+/, "")}`;
}
async function readErrorText(res: Response) {
  const ct = res.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) { const j = await res.json(); return j?.message || j?.error || JSON.stringify(j); }
    return (await res.text()) || "";
  } catch { return ""; }
}
function numberFormat(n: number) { return new Intl.NumberFormat().format(n || 0); }
function money(n: number) { return `¥${numberFormat(n || 0)}`; }
function hashCode(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return h;
}
function getInitials(name: string) {
  return String(name || "").split(" ").filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase()).join("");
}
function gradientFromSeed(seed: string) {
  const palettes = [
    ["#3b82f6","#06b6d4"],["#8b5cf6","#d946ef"],["#10b981","#06b6d4"],
    ["#f59e0b","#ef4444"],["#f43f5e","#ec4899"],["#6366f1","#3b82f6"],
  ];
  return palettes[Math.abs(hashCode(seed)) % palettes.length];
}
function gradientClass(seed: string) {
  const palettes = [
    "from-cyan-500 via-sky-500 to-indigo-600","from-fuchsia-500 via-pink-500 to-rose-500",
    "from-emerald-500 via-teal-500 to-cyan-600","from-amber-400 via-orange-500 to-rose-500",
    "from-violet-500 via-purple-500 to-indigo-600","from-lime-500 via-green-500 to-emerald-600",
  ];
  return palettes[Math.abs(hashCode(seed)) % palettes.length];
}
function escapeHtml(s: string) {
  return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
}
function buildGallery(product: Product | null): GalleryItem[] {
  if (!product) return [];
  const primary = buildImageUrl(pickImagePath(product));
  const seed = `${product.product_name}-${product.category}-${product.sku}`;
  const base = {
    title: product.product_name, category: product.category || "PRODUCT",
    sku: product.sku || "SKU", type: product.product_type || "General Item",
    initials: getInitials(product.product_name || "P"), gradient: gradientClass(seed),
  };
  return [
    { id: "main",  kind: "image",     url: primary, ...base },
    { id: "cover", kind: "generated", url: null,    ...base },
    { id: "sku",   kind: "sku",       url: null,    ...base },
    { id: "type",  kind: "type",      url: null,    ...base },
  ];
}
function buildLaneMap(items: StockMovement[]): MovementLaneMap {
  return {
    IN:     items.filter((m) => m.type === "IN"),
    OUT:    items.filter((m) => m.type === "OUT"),
    ADJUST: items.filter((m) => m.type === "ADJUST"),
  };
}
function flattenLaneMap(lanes: MovementLaneMap): StockMovement[] {
  return [...lanes.IN, ...lanes.OUT, ...lanes.ADJUST];
}
function findLaneByMovementId(lanes: MovementLaneMap, id: string): MovementLaneKey | null {
  if (lanes.IN.some((m) => m.id === id))     return "IN";
  if (lanes.OUT.some((m) => m.id === id))    return "OUT";
  if (lanes.ADJUST.some((m) => m.id === id)) return "ADJUST";
  return null;
}
function findLaneForOverTarget(lanes: MovementLaneMap, overId: string): MovementLaneKey | null {
  if (overId === "IN" || overId === "OUT" || overId === "ADJUST") return overId;
  return findLaneByMovementId(lanes, overId);
}

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedNumber
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString());
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    const c = animate(mv, value, { duration: 0.55, ease: "easeOut" });
    const unsub = rounded.on("change", setDisplay);
    return () => { c.stop(); unsub(); };
  }, [value, mv, rounded]);
  return <motion.span>{display}</motion.span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Stock Badge
// ─────────────────────────────────────────────────────────────────────────────

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return <Badge className="border-rose-500/20 bg-rose-500/10 text-rose-400 border font-mono text-[10px] tracking-widest">OUT</Badge>;
  if (stock < 5)  return <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-400 border font-mono text-[10px] tracking-widest">LOW</Badge>;
  return <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 border font-mono text-[10px] tracking-widest">IN</Badge>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Metric Card
// ─────────────────────────────────────────────────────────────────────────────

function MetricCard({
  theme, icon, label, value, sub, tone,
}: {
  theme: Theme; icon: React.ReactNode; label: string; value: React.ReactNode;
  sub?: string; tone?: "default" | "good" | "warn" | "danger";
}) {
  const t = tk(theme);
  return (
    <div className={cn("rounded-[20px] border p-4", t.soft)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className={cn("text-[10px] font-black tracking-[0.18em]", t.textSubtle)}>{label}</div>
          <div className={cn("text-xl font-black leading-none",
            tone === "good"   ? "text-emerald-400" :
            tone === "warn"   ? "text-amber-400"   :
            tone === "danger" ? "text-rose-400"    : t.text
          )}>{value}</div>
          {sub && <div className={cn("text-xs", t.textMuted)}>{sub}</div>}
        </div>
        <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-2xl border", t.metricIcon, t.textMuted)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Gallery Tile
// ─────────────────────────────────────────────────────────────────────────────

function GalleryTile({ item, active, onClick }: { item: GalleryItem; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={cn("relative h-20 w-full overflow-hidden rounded-2xl border transition-all",
        active ? "border-[#c8892a] ring-2 ring-[#c8892a]/30" : "border-[rgba(255,255,255,0.1)]"
      )}>
      {item.kind === "image" && item.url
        ? <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
        : (
          <div className={cn("relative h-full w-full bg-gradient-to-br", item.gradient)}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.3),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.18),transparent_22%)]" />
            <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-black">
              {item.kind === "sku" ? item.sku : item.kind === "type" ? item.type : item.initials}
            </div>
          </div>
        )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Product Scene
// ─────────────────────────────────────────────────────────────────────────────

function ProductScene({ product, galleryItem, theme }: { product: Product; galleryItem: GalleryItem; theme: Theme }) {
  const t = tk(theme);
  if (galleryItem.kind === "image" && galleryItem.url) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <img src={galleryItem.url} alt={product.product_name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className={cn("absolute inset-0 bg-gradient-to-t", t.sceneOverlay)} />
      </div>
    );
  }
  return (
    <div className={cn("relative h-full w-full bg-gradient-to-br", galleryItem.gradient)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.2),transparent_22%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.15),transparent_24%)]" />
      <div className="absolute inset-0 p-6 text-white flex flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[10px] font-black tracking-[0.2em] backdrop-blur">
            {product.category || "PRODUCT"}
          </span>
          <span className="rounded-full border border-white/20 bg-black/15 px-2.5 py-1 text-[10px] font-bold backdrop-blur">
            {product.sku || "SKU"}
          </span>
        </div>
        <div className="space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-xl font-black backdrop-blur">
            {galleryItem.kind === "sku" ? "SKU" : galleryItem.kind === "type" ? getInitials(product.product_type || "T") : getInitials(product.product_name || "P")}
          </div>
          <div className="line-clamp-2 text-2xl font-black leading-tight">{product.product_name}</div>
          <div className="text-sm text-white/80">
            {galleryItem.kind === "sku" ? product.sku : galleryItem.kind === "type" ? product.product_type || "General Item" : product.product_type || "General Item"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stock Bar
// ─────────────────────────────────────────────────────────────────────────────

function StockBar({ stock, theme }: { stock: number; theme: Theme }) {
  const t = tk(theme);
  const max = Math.max(10, Math.ceil(stock / 10) * 10 || 10);
  const pct = Math.min(100, Math.round((stock / max) * 100));
  return (
    <div className="space-y-2">
      <div className={cn("flex items-center justify-between text-xs", t.textMuted)}>
        <span>Stock Health</span>
        <span className="font-mono">{pct}%</span>
      </div>
      <div className={cn("h-3 rounded-full overflow-hidden", theme === "dark" ? "bg-white/10" : "bg-black/10")}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: "easeOut" }}
          className={cn("h-full rounded-full", stock <= 0 ? "bg-rose-500" : stock < 5 ? "bg-amber-500" : "bg-emerald-500")} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Movement badge helpers
// ─────────────────────────────────────────────────────────────────────────────

function movementBadge(type: StockMovement["type"]) {
  if (type === "IN")     return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 gap-1"><TrendingUp  className="h-3.5 w-3.5" />IN</Badge>;
  if (type === "OUT")    return <Badge className="bg-rose-500/10    text-rose-400    border border-rose-500/20    gap-1"><TrendingDown className="h-3.5 w-3.5" />OUT</Badge>;
  return                        <Badge className="bg-amber-500/10   text-amber-400   border border-amber-500/20   gap-1"><History      className="h-3.5 w-3.5" />ADJUST</Badge>;
}

function laneMeta(key: MovementLaneKey) {
  if (key === "IN")     return { title: "Stock In",  icon: <TrendingUp  className="h-4 w-4" /> };
  if (key === "OUT")    return { title: "Stock Out", icon: <TrendingDown className="h-4 w-4" /> };
  return                       { title: "Adjust",    icon: <History      className="h-4 w-4" /> };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sortable Movement Card
// ─────────────────────────────────────────────────────────────────────────────

function SortableMovementCard({ move, theme }: { move: StockMovement; theme: Theme }) {
  const t = tk(theme);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: move.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <motion.div ref={setNodeRef} style={style} layout>
      <div className={cn("rounded-[18px] border p-4 transition-all", t.soft, isDragging && `ring-2 ${t.ring}`)}>
        <div className="flex items-start gap-3">
          <button type="button" {...attributes} {...listeners}
            className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl border cursor-grab active:cursor-grabbing transition-all", t.dragHandle)}>
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {movementBadge(move.type)}
              <span className={cn("text-xs font-mono", t.textSubtle)}>{new Date(move.created_at).toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {[["QTY", move.qty], ["BEFORE", move.before_qty], ["AFTER", move.after_qty]].map(([l, v]) => (
                <div key={String(l)}>
                  <div className={cn("text-[10px] font-black tracking-[0.16em]", t.textSubtle)}>{l}</div>
                  <div className={cn("font-black", t.text)}>{numberFormat(Number(v))}</div>
                </div>
              ))}
            </div>
            <div className={cn("text-sm", t.textMuted)}>{move.note || "No note"}</div>
            <Badge variant="secondary" className="gap-1"><UserRound className="h-3.5 w-3.5" />{move.user_name || "—"}</Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Movement Lane
// ─────────────────────────────────────────────────────────────────────────────

function MovementLane({ laneKey, items, theme, isActiveLane }: {
  laneKey: MovementLaneKey; items: StockMovement[]; theme: Theme; isActiveLane: boolean;
}) {
  const t  = tk(theme);
  const meta = laneMeta(laneKey);
  const laneCls = laneKey === "IN" ? t.laneIn : laneKey === "OUT" ? t.laneOut : t.laneAdj;
  return (
    <div className={cn("rounded-[22px] border p-4", t.soft)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl border", laneCls)}>{meta.icon}</div>
          <div>
            <div className={cn("font-black", t.text)}>{meta.title}</div>
            <div className={cn("text-xs", t.textMuted)}>{items.length} item(s)</div>
          </div>
        </div>
        <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-bold", laneCls)}>{laneKey}</span>
      </div>
      <div id={laneKey} className={cn(
        "min-h-[360px] space-y-3 rounded-2xl border border-dashed p-2 transition-all",
        t.laneDrop, isActiveLane && `ring-2 ${t.ring}`
      )}>
        <SortableContext items={items.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          {items.length === 0
            ? <div className={cn("flex min-h-[200px] items-center justify-center text-sm", t.textMuted)}>Drop here</div>
            : items.map((move) => <SortableMovementCard key={move.id} move={move} theme={theme} />)
          }
        </SortableContext>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Image Preview Modal
// ─────────────────────────────────────────────────────────────────────────────

function ProductImageModal({ open, onOpenChange, product, gallery, activeId, onChangeActive }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  product: Product | null; gallery: GalleryItem[];
  activeId: string; onChangeActive: (id: string) => void;
}) {
  if (!product || gallery.length === 0) return null;
  const current = gallery.find((g) => g.id === activeId) || gallery[0];
  const idx     = gallery.findIndex((g) => g.id === current.id);
  const prev    = () => onChangeActive(gallery[(idx - 1 + gallery.length) % gallery.length].id);
  const next    = () => onChangeActive(gallery[(idx + 1) % gallery.length].id);
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={(e) => e.target === e.currentTarget && onOpenChange(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="relative w-full max-w-6xl overflow-hidden rounded-[30px] border border-[rgba(200,137,42,0.2)] bg-[rgba(8,6,2,0.97)] text-white shadow-2xl">
            {/* top accent */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#c8892a] to-transparent" />
            <div className="grid min-h-[70vh] md:grid-cols-[1fr_320px]">
              <div className="relative flex items-center justify-center overflow-hidden bg-black/30">
                <button onClick={() => onOpenChange(false)}
                  className="absolute right-4 top-4 z-20 rounded-2xl border border-[rgba(200,137,42,0.25)] bg-[rgba(200,137,42,0.12)] p-2 text-[#d4a352] backdrop-blur hover:bg-[rgba(200,137,42,0.22)]">
                  <X className="h-5 w-5" />
                </button>
                <button onClick={prev}
                  className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-2xl border border-white/15 bg-black/30 p-3 text-white backdrop-blur hover:bg-black/50">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={next}
                  className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-2xl border border-white/15 bg-black/30 p-3 text-white backdrop-blur hover:bg-black/50">
                  <ChevronRight className="h-5 w-5" />
                </button>
                {current.kind === "image" && current.url
                  ? <img src={current.url} alt={product.product_name} className="max-h-[70vh] w-auto max-w-full object-contain" />
                  : (
                    <div className={cn("relative h-full min-h-[70vh] w-full bg-gradient-to-br", current.gradient)}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_24%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.2),transparent_22%)]" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center text-white p-8">
                        <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/20 bg-white/10 text-3xl font-black backdrop-blur">
                          {current.kind === "sku" ? "SKU" : current.kind === "type" ? getInitials(product.product_type || "T") : getInitials(product.product_name || "P")}
                        </div>
                        <div className="text-4xl font-black leading-tight">{product.product_name}</div>
                        <div className="text-base text-white/80">{current.kind === "sku" ? product.sku : current.kind === "type" ? product.product_type || "General" : product.category || "Product"}</div>
                      </div>
                    </div>
                  )}
              </div>
              {/* sidebar */}
              <div className="border-l border-[rgba(200,137,42,0.15)] p-5 space-y-4">
                <div>
                  <div className="text-[11px] font-black tracking-[0.18em] text-[#8a7a65]">IMAGE PREVIEW</div>
                  <div className="mt-1 flex items-center gap-2">
                    <LanternMark size={20} glow />
                    <div className="text-2xl font-black text-[#f3e7d2]">{product.product_name}</div>
                  </div>
                  <div className="mt-1 text-sm text-[#bca98f]">{product.product_type || "General Item"}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[["PRICE", money(product.product_price)], ["STOCK", numberFormat(product.product_quantity_amount)]].map(([l, v]) => (
                    <div key={String(l)} className="rounded-2xl border border-[rgba(200,137,42,0.15)] bg-[rgba(200,137,42,0.07)] p-3">
                      <div className="text-[10px] font-black tracking-[0.18em] text-[#8a7a65]">{l}</div>
                      <div className="mt-1 text-lg font-black text-[#f3e7d2]">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {gallery.map((item) => (
                    <GalleryTile key={item.id} item={item} active={item.id === current.id} onClick={() => onChangeActive(item.id)} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ProductViewPage() {
  const router                                    = useRouter();
  const params                                    = useParams<{ id: string }>();
  const id                                        = params?.id;
  const { data: session, status }                 = useSession();
  const { resolvedTheme, setTheme: setNextTheme } = useTheme();

  const [themeState, setThemeState] = useState<Theme>("dark");
  useEffect(() => { setThemeState(resolvedTheme === "light" ? "light" : "dark"); }, [resolvedTheme]);
  const theme = themeState;
  const t = tk(theme);

  const token = (session as any)?.accessToken ?? (session as any)?.access_token ?? (session as any)?.token ?? null;
  function authHeaders(): Record<string, string> { return token ? { Authorization: `Bearer ${token}` } : {}; }

  const [product,       setProduct]       = useState<Product | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [moves,         setMoves]         = useState<StockMovement[]>([]);
  const [movesLoading,  setMovesLoading]  = useState(false);
  const [movesLoaded,   setMovesLoaded]   = useState(false);
  const [mPageSize,     setMPageSize]     = useState(10);
  const [mPage,         setMPage]         = useState(1);
  const [stockOpen,     setStockOpen]     = useState(false);
  const [stockMode,     setStockMode]     = useState<"IN" | "OUT" | "ADJUST">("IN");
  const [stockQty,      setStockQty]      = useState(1);
  const [stockNote,     setStockNote]     = useState("");
  const [stockSaving,   setStockSaving]   = useState(false);
  const [activeMoveId,  setActiveMoveId]  = useState<string | null>(null);
  const [activeLane,    setActiveLane]    = useState<MovementLaneKey | null>(null);
  const [activeGallId,  setActiveGallId]  = useState("main");
  const [movLanes,      setMovLanes]      = useState<MovementLaneMap>({ IN: [], OUT: [], ADJUST: [] });
  const [imgPreview,    setImgPreview]    = useState(false);

  const barcodeSvgRef = useRef<SVGSVGElement>(null);
  const laneKeys: MovementLaneKey[] = ["IN", "OUT", "ADJUST"];

  const sensors = useSensors(
    useSensor(PointerSensor,  { activationConstraint: { distance: 6 } }),
    useSensor(MouseSensor,    { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,    { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => { if (status === "unauthenticated") { toast.error("Login လုပ်ပါ"); signIn(); } }, [status]);

  const barcodeValue = (product?.barcode?.trim() || null) ?? product?.sku ?? "";

  useEffect(() => {
    if (!barcodeSvgRef.current || !barcodeValue) return;
    try { JsBarcode(barcodeSvgRef.current, barcodeValue, { format: "CODE128", displayValue: true, fontSize: 14, height: 70, margin: 8 }); }
    catch { /* bad barcode */ }
  }, [barcodeValue]);

  async function loadProduct() {
    if (!id || !token) return;
    const tid = toast.loading("Loading product...");
    try {
      setLoading(true);
      const res = await fetch(`/backend/api/products/${id}`, {
        headers: { ...authHeaders(), Accept: "application/json" }, cache: "no-store",
      });
      if (!res.ok) {
        const detail = await readErrorText(res);
        if (res.status === 401) { toast.error("Unauthorized — Login ပြန်လုပ်ပါ", { id: tid }); signIn(); }
        else toast.error(detail || `Error ${res.status}`, { id: tid });
        setProduct(null); return;
      }
      const data = await res.json() as Product;
      setProduct(data);
      toast.success("Loaded ✅", { id: tid });
    } catch { toast.error("Server error", { id: tid }); setProduct(null); }
    finally { setLoading(false); }
  }

  async function loadMovements(resetPage = false) {
    if (!id || !token) return;
    try {
      setMovesLoading(true);
      const res = await fetch(`/backend/api/products/${id}/movements`, {
        headers: { ...authHeaders(), Accept: "application/json" }, cache: "no-store",
      });
      if (!res.ok) { setMovesLoaded(true); setMoves([]); setMovLanes({ IN: [], OUT: [], ADJUST: [] }); return; }
      const data = await res.json() as StockMovement[];
      setMoves(data);
      setMovLanes(buildLaneMap(data));
      setMovesLoaded(true);
      if (resetPage) setMPage(1);
    } catch { toast.error("Movements load error"); }
    finally { setMovesLoading(false); }
  }

  useEffect(() => {
    if (!id || status !== "authenticated") return;
    loadProduct();
    loadMovements(true);
  }, [id, status, token]);

  useEffect(() => { setMoves(flattenLaneMap(movLanes)); }, [movLanes]);

  function openStockModal(mode: "IN" | "OUT" | "ADJUST") {
    setStockMode(mode);
    setStockQty(mode === "ADJUST" ? Number(product?.product_quantity_amount ?? 0) : 1);
    setStockNote("");
    setStockOpen(true);
  }

  async function submitStock() {
    if (!product || !token) return;
    const qtyNum = Number(stockQty);
    if (!Number.isFinite(qtyNum)) { toast.error("Qty မှန်မှန်ထည့်ပါ"); return; }
    if (stockMode === "ADJUST" && (qtyNum < 0 || !Number.isInteger(qtyNum))) { toast.error("0 သို့ အပေါင်းကိန်း ထည့်ပါ"); return; }
    if (stockMode !== "ADJUST" && (qtyNum <= 0 || !Number.isInteger(qtyNum))) { toast.error("1 ထက်ကြီးတဲ့ အပေါင်းကိန်း ထည့်ပါ"); return; }

    setStockSaving(true);
    const url = stockMode === "IN" ? `/backend/api/products/${product.id}/stock-in`
      : stockMode === "OUT" ? `/backend/api/products/${product.id}/stock-out`
      : `/backend/api/products/${product.id}/stock-adjust`;
    try {
      const res = await fetch(url, {
        method: stockMode === "ADJUST" ? "PATCH" : "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ qty: qtyNum, note: stockNote.trim() || undefined }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) { toast.error(data?.message || `Failed (${res.status})`); return; }
      toast.success(`Stock ${stockMode} success ✅`);
      setStockOpen(false);
      await loadProduct();
      await loadMovements(true);
    } catch { toast.error("Stock update error"); }
    finally { setStockSaving(false); }
  }

  // DnD handlers
  function onDragStart(event: DragStartEvent) {
    const activeId = String(event.active.id);
    setActiveMoveId(activeId);
    setActiveLane(findLaneByMovementId(movLanes, activeId));
  }
  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId   = String(over.id);
    const fromLane = findLaneByMovementId(movLanes, activeId);
    const toLane   = findLaneForOverTarget(movLanes, overId);
    if (!fromLane || !toLane) return;
    setActiveLane(toLane);
    if (fromLane === toLane) return;
    setMovLanes((prev) => {
      const src  = [...prev[fromLane]];
      const tgt  = [...prev[toLane]];
      const idx  = src.findIndex((m) => m.id === activeId);
      if (idx === -1) return prev;
      const [moved] = src.splice(idx, 1);
      const overIdx = tgt.findIndex((m) => m.id === overId);
      overIdx === -1 ? tgt.push({ ...moved, type: toLane }) : tgt.splice(overIdx, 0, { ...moved, type: toLane });
      return { ...prev, [fromLane]: src, [toLane]: tgt };
    });
  }
  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) { setActiveMoveId(null); setActiveLane(null); return; }
    const activeId = String(active.id);
    const overId   = String(over.id);
    const fromLane = findLaneByMovementId(movLanes, activeId);
    const toLane   = findLaneForOverTarget(movLanes, overId);
    if (fromLane && toLane && fromLane === toLane) {
      setMovLanes((prev) => {
        const items    = [...prev[toLane]];
        const oldIndex = items.findIndex((m) => m.id === activeId);
        const newIndex = items.findIndex((m) => m.id === overId);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev;
        return { ...prev, [toLane]: arrayMove(items, oldIndex, newIndex) };
      });
    }
    setActiveMoveId(null); setActiveLane(null);
  }

  function printBarcode() {
    if (!product) return;
    const svg   = barcodeSvgRef.current?.outerHTML || "";
    const title = product.product_name ?? "Product";
    const html  = `<!doctype html><html><head><meta charset="utf-8"><title>Print Barcode</title><style>body{font-family:Arial,sans-serif;padding:18px}.wrap{width:360px;border:1px solid #ddd;border-radius:12px;padding:14px}.name{font-weight:700;margin-bottom:6px}.sku{color:#555;font-size:12px;margin-bottom:10px}svg{width:100%;height:auto}</style></head><body><div class="wrap"><div class="name">${escapeHtml(title)}</div><div class="sku">SKU: ${escapeHtml(product.sku)}</div>${svg}<div style="margin-top:10px;display:flex;gap:10px"><span style="font-weight:700">Price: ${Number(product.product_price || 0).toLocaleString()}</span><span>Stock: ${Number(product.product_quantity_amount || 0)}</span></div></div><script>window.onload=()=>{window.print();window.close()}</script></body></html>`;
    const w = window.open("", "_blank", "width=460,height=560");
    if (!w) { toast.error("Popup blocked"); return; }
    w.document.open(); w.document.write(html); w.document.close();
  }

  const gallery     = buildGallery(product);
  const activeGall  = gallery.find((g) => g.id === activeGallId) || gallery[0] || null;
  const stock       = product?.product_quantity_amount ?? 0;
  const totalIn     = useMemo(() => moves.filter((m) => m.type === "IN").reduce((s, m) => s + Number(m.qty || 0), 0), [moves]);
  const totalOut    = useMemo(() => moves.filter((m) => m.type === "OUT").reduce((s, m) => s + Number(m.qty || 0), 0), [moves]);
  const adjustCount = useMemo(() => moves.filter((m) => m.type === "ADJUST").length, [moves]);
  const lastMove    = moves[0] || null;
  const activeMove  = activeMoveId ? flattenLaneMap(movLanes).find((m) => m.id === activeMoveId) || null : null;
  const mTotal      = moves.length;
  const mTotalPages = Math.max(1, Math.ceil(mTotal / mPageSize));

  // ── Loading ──
  if (status === "loading" || loading) {
    return (
      <>
        <FontImport />
        <div className={cn("min-h-screen flex items-center justify-center", t.root)}>
          {theme === "dark" && <NightParticles />}
          <div className="relative z-10 flex flex-col items-center gap-4">
            {theme === "dark" && <LanternMark size={54} glow />}
            <Loader2 className={cn("h-8 w-8 animate-spin", t.textMuted)} />
            <div className={cn("text-[13px]", t.textMuted)}>Loading product...</div>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <FontImport />
        <div className={cn("min-h-screen flex items-center justify-center px-4", t.root)}>
          <div className={cn("w-full max-w-md overflow-hidden rounded-[28px] border p-8 text-center space-y-4", t.card)}>
            {theme === "dark" && <div className="flex justify-center"><LanternMark size={46} glow={false} /></div>}
            <div className={cn("text-xl font-black", t.text)}>Product not found</div>
            <div className={cn("text-sm", t.textMuted)}>ဒီ product ကို ရှာမတွေ့ပါ</div>
            <button onClick={loadProduct}
              className={cn("inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13px] font-semibold transition-all", t.btn)}>
              <RefreshCw className="h-4 w-4" /> Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <>
      <FontImport />
      <div className={cn("relative min-h-screen transition-colors duration-500", t.root)}>

        {/* glow blobs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          <div className={cn("absolute -top-40 left-[15%] h-[500px] w-[500px] rounded-full blur-[140px]", t.glow1)} />
          <div className={cn("absolute -bottom-20 right-[-10%] h-[440px] w-[440px] rounded-full blur-[130px]", t.glow2)} />
        </div>

        {theme === "dark" && <NightParticles />}

        <ProductImageModal open={imgPreview} onOpenChange={setImgPreview}
          product={product} gallery={gallery} activeId={activeGallId} onChangeActive={setActiveGallId} />

        <div className="relative z-10 mx-auto w-full max-w-[1900px] space-y-5 px-5 py-7 sm:px-6 2xl:px-10">

          {/* ── HERO ── */}
          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className={cn("relative overflow-hidden rounded-[30px] border p-6 md:p-8", t.hero)}>
            <div className={cn("absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r", t.heroLine)} />

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center gap-5">
                {theme === "dark" && (
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="hidden md:block">
                    <LanternMark size={72} glow />
                  </motion.div>
                )}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide", t.pill)}>
                      <Sparkles className="h-3 w-3" /> BINHLAIG · Product Detail
                    </div>
                    <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold", t.pill)}>
                      <Layers3 className="h-3 w-3" /> dnd-kit Kanban
                    </div>
                    <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold", t.pill)}>
                      <GalleryVertical className="h-3 w-3" /> Gallery
                    </div>
                  </div>
                  <h1 className={cn("serif text-[clamp(1.8rem,3.5vw,3rem)] font-normal leading-none", t.text)}>
                    {product.product_name}
                  </h1>
                  <div className={cn("text-sm", t.textMuted)}>
                    {product.category || "UNCATEGORIZED"} · SKU: {product.sku} · {product.product_type || "General"}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => router.back()}
                  className={cn("flex h-10 items-center gap-2 rounded-xl border px-4 text-[13px] font-semibold transition-all", t.btn)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button onClick={() => router.push(`/dashboard/product/${product.id}/edit`)}
                  className={cn("flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-bold transition-all", t.btnPrimary)}>
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button onClick={() => loadProduct()}
                  className={cn("flex h-10 items-center gap-2 rounded-xl border px-4 text-[13px] font-semibold transition-all", t.btn)}>
                  <RefreshCw className="h-4 w-4" /> Refresh
                </button>
                <LanternToggle dark={theme === "dark"} onToggle={() => setNextTheme(theme === "dark" ? "light" : "dark")} />
              </div>
            </div>
          </motion.div>

          {/* ── MAIN GRID ── */}
          <div className="grid gap-5 xl:grid-cols-[1.4fr_0.85fr] 2xl:gap-8">

            {/* ── LEFT ── */}
            <div className="space-y-5">

              {/* gallery + 3D scene */}
              <div className="grid gap-5 xl:grid-cols-[110px_minmax(0,1fr)] 2xl:grid-cols-[130px_minmax(0,1fr)]">
                {/* gallery strip */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                  className={cn("rounded-[24px] border p-3", t.card)}>
                  <div className="space-y-3">
                    {gallery.map((item) => (
                      <GalleryTile key={item.id} item={item} active={item.id === activeGall?.id} onClick={() => setActiveGallId(item.id)} />
                    ))}
                  </div>
                </motion.div>

                {/* 3D scene */}
                <motion.div className="[perspective:1800px]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                  <motion.div whileHover={{ rotateX: 3, rotateY: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 180, damping: 18 }}
                    style={{ transformStyle: "preserve-3d" }}>
                    <div className={cn("group overflow-hidden rounded-[24px] border", t.card)}>
                      <div className="relative min-h-[420px] 2xl:min-h-[580px]">
                        {activeGall && <ProductScene product={product} galleryItem={activeGall} theme={theme} />}

                        {/* preview button */}
                        <button type="button" onClick={() => setImgPreview(true)}
                          className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-black/30 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-black/45">
                          <Eye className="h-4 w-4" /> Preview
                        </button>

                        {/* stock badge + discount */}
                        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                          <StockBadge stock={stock} />
                          {Number(product.product_discount || 0) > 0 && (
                            <Badge className="rounded-full border border-white/20 bg-emerald-500/20 text-white backdrop-blur px-3 py-1 text-[10px] font-bold">
                              -{product.product_discount}
                            </Badge>
                          )}
                          {/* lantern watermark on dark */}
                          {theme === "dark" && (
                            <div className="rounded-full border border-[rgba(200,137,42,0.2)] bg-[rgba(20,10,2,0.45)] px-2 py-1 backdrop-blur">
                              <LanternMark size={16} glow />
                            </div>
                          )}
                        </div>

                        {/* bottom info chips */}
                        <div className="absolute inset-x-0 bottom-16 z-10 px-4 grid gap-3 md:grid-cols-3">
                          {[
                            { label: "PRICE", value: money(product.product_price) },
                            { label: "SKU",   value: product.sku },
                            { label: "TYPE",  value: product.product_type || "General" },
                          ].map((item) => (
                            <div key={item.label} className="rounded-2xl border border-white/20 bg-black/25 px-4 py-3 text-white backdrop-blur">
                              <div className="text-[10px] font-black tracking-[0.18em] text-white/70">{item.label}</div>
                              <div className="text-sm font-black break-all">{item.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* analytics */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                className={cn("rounded-[24px] border p-5 2xl:p-7", t.card)}>
                <div className="mb-5 flex items-center gap-2">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", t.metricIcon, t.textMuted)}>
                    <Gauge className="h-4 w-4" />
                  </div>
                  <div>
                    <div className={cn("font-black", t.text)}>Stock Analytics</div>
                    <div className={cn("text-xs", t.textMuted)}>live metrics</div>
                  </div>
                </div>

                <div className="mb-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                  <MetricCard theme={theme} icon={<Wallet       className="h-4 w-4" />} label="PRICE"     value={<AnimatedNumber value={product.product_price} />} sub="current price" />
                  <MetricCard theme={theme} icon={<Boxes        className="h-4 w-4" />} label="STOCK"     value={<AnimatedNumber value={stock} />} sub="available now" tone={stock <= 0 ? "danger" : stock < 5 ? "warn" : "good"} />
                  <MetricCard theme={theme} icon={<ArrowUpRight   className="h-4 w-4" />} label="TOTAL IN"  value={<AnimatedNumber value={totalIn} />} sub="sum of IN" tone="good" />
                  <MetricCard theme={theme} icon={<ArrowDownRight className="h-4 w-4" />} label="TOTAL OUT" value={<AnimatedNumber value={totalOut} />} sub="sum of OUT" tone="danger" />
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                  <div className={cn("xl:col-span-2 rounded-[20px] border p-4", t.soft)}>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className={cn("text-[13px] font-bold", t.text)}>Stock Health</div>
                      <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-bold", t.pill)}>{stock} units</span>
                    </div>
                    <StockBar stock={stock} theme={theme} />
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {[
                        { label: "IN",     value: totalIn,     cls: "text-emerald-400" },
                        { label: "OUT",    value: totalOut,    cls: "text-rose-400"    },
                        { label: "ADJUST", value: adjustCount, cls: "text-amber-400"   },
                      ].map((item) => (
                        <div key={item.label} className={cn("rounded-xl border p-3", t.soft)}>
                          <div className={cn("text-[10px] font-black tracking-[0.18em]", t.textSubtle)}>{item.label}</div>
                          <div className={cn("mt-1 font-black", item.cls)}>{numberFormat(item.value)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={cn("rounded-[20px] border p-4", t.soft)}>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock3 className={cn("h-4 w-4", t.textMuted)} />
                      <div className={cn("text-[13px] font-bold", t.text)}>Last Activity</div>
                    </div>
                    {lastMove ? (
                      <div className="space-y-2">
                        {movementBadge(lastMove.type)}
                        <div className={cn("text-lg font-black", t.text)}>{numberFormat(lastMove.before_qty)} → {numberFormat(lastMove.after_qty)}</div>
                        <div className={cn("text-xs", t.textMuted)}>{new Date(lastMove.created_at).toLocaleString()}</div>
                        <div className={cn("text-xs", t.textMuted)}>{lastMove.note || "No note"}</div>
                      </div>
                    ) : (
                      <div className={cn("text-sm", t.textMuted)}>No recent movement</div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* kanban movements */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                className={cn("rounded-[24px] border p-5 2xl:p-7", t.card)}>
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", t.metricIcon, t.textMuted)}>
                      <ArrowRightLeft className="h-4 w-4" />
                    </div>
                    <div>
                      <div className={cn("font-black", t.text)}>Movement Kanban</div>
                      <div className={cn("text-xs", t.textMuted)}>IN / OUT / ADJUST lanes · drag to rearrange</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-bold", t.pill)}>{mTotal} total</span>
                    <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-bold", t.pill)}>
                      Page {Math.min(mPage, mTotalPages)} / {mTotalPages}
                    </span>
                    <select value={mPageSize} onChange={(e) => { setMPageSize(Number(e.target.value)); setMPage(1); }}
                      className={cn("h-9 rounded-xl border px-3 text-[12px] outline-none", t.input)}>
                      {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <button onClick={() => loadMovements(true)} disabled={movesLoading}
                      className={cn("flex h-9 items-center gap-2 rounded-xl border px-3 text-[12px] font-semibold transition-all", t.btn)}>
                      <RefreshCw className={cn("h-4 w-4", movesLoading && "animate-spin")} /> Refresh
                    </button>
                  </div>
                </div>

                {mTotal === 0 && movesLoaded
                  ? <div className={cn("rounded-2xl border p-8 text-center text-sm", t.soft, t.textMuted)}>Movements မရှိသေးပါ</div>
                  : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter}
                      onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
                      <div className="grid gap-4 xl:grid-cols-3">
                        {laneKeys.map((laneKey) => (
                          <MovementLane key={laneKey} laneKey={laneKey} items={movLanes[laneKey]}
                            theme={theme} isActiveLane={activeLane === laneKey} />
                        ))}
                      </div>
                      <DragOverlay>
                        {activeMove && (
                          <div className={cn("w-[340px] overflow-hidden rounded-[22px] border p-4 shadow-2xl", t.card)}>
                            <div className="flex items-center gap-2 mb-2">{movementBadge(activeMove.type)}</div>
                            <div className={cn("text-sm font-medium", t.text)}>
                              Qty {numberFormat(activeMove.qty)} · {numberFormat(activeMove.before_qty)} → {numberFormat(activeMove.after_qty)}
                            </div>
                            <div className={cn("mt-1 text-xs", t.textMuted)}>{activeMove.note || "No note"}</div>
                          </div>
                        )}
                      </DragOverlay>
                    </DndContext>
                  )
                }
                <div className={cn("mt-3 text-[11px] font-mono", t.textSubtle)}>Frontend preview only · refresh ရင် backend state ပြန်လာနိုင်သည်</div>
              </motion.div>
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="space-y-5 xl:sticky xl:top-6 self-start">

              {/* quick control */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                className={cn("rounded-[24px] border p-5", t.card)}>
                <div className="mb-4 flex items-center gap-2">
                  {theme === "dark" && <div className="h-2.5 w-2.5 rounded-full" style={{ background: "radial-gradient(circle, #fff7cc 0%, #fbbf24 42%, #f59e0b 70%, #b45309 100%)", boxShadow: "0 0 10px rgba(251,191,36,.45)" }} />}
                  <div className={cn("font-black", t.text)}>Quick Control</div>
                </div>
                <div className="space-y-2">
                  {[
                    { mode: "IN"     as const, icon: <TrendingUp   className="h-4 w-4" />, label: "Stock IN",           cls: t.btn },
                    { mode: "OUT"    as const, icon: <TrendingDown  className="h-4 w-4" />, label: "Stock OUT",          cls: t.btn },
                    { mode: "ADJUST" as const, icon: <History       className="h-4 w-4" />, label: "Stock Adjust",       cls: t.btn },
                  ].map((item) => (
                    <button key={item.mode} onClick={() => openStockModal(item.mode)}
                      className={cn("flex w-full h-11 items-center gap-3 rounded-xl border px-4 text-[13px] font-semibold transition-all justify-start", item.cls)}>
                      {item.icon} {item.label}
                    </button>
                  ))}
                  <button onClick={() => setImgPreview(true)}
                    className={cn("flex w-full h-11 items-center gap-3 rounded-xl border px-4 text-[13px] font-semibold transition-all justify-start", t.btn)}>
                    <ImageIcon className="h-4 w-4" /> Image Preview
                  </button>
                  <button onClick={printBarcode}
                    className={cn("flex w-full h-11 items-center gap-3 rounded-xl border px-4 text-[13px] font-semibold transition-all justify-start", t.btn)}>
                    <Printer className="h-4 w-4" /> Print Barcode
                  </button>
                </div>
              </motion.div>

              {/* product info */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className={cn("rounded-[24px] border p-5", t.card)}>
                <div className="mb-4 flex items-center gap-2">
                  {theme === "dark" && <LanternMark size={18} glow />}
                  <div className={cn("font-black", t.text)}>Product Info</div>
                </div>
                <div className="space-y-3">
                  <MetricCard theme={theme} icon={<CircleDollarSign className="h-4 w-4" />} label="PRICE"    value={money(product.product_price)} />
                  <MetricCard theme={theme} icon={<Box              className="h-4 w-4" />} label="SKU"      value={<span className="text-sm break-all">{product.sku}</span>} />
                  <MetricCard theme={theme} icon={<Tag              className="h-4 w-4" />} label="CATEGORY" value={<span className="text-sm">{product.category || "UNCATEGORIZED"}</span>} />
                  <MetricCard theme={theme} icon={<Zap              className="h-4 w-4" />} label="TYPE"     value={<span className="text-sm">{product.product_type || "General"}</span>} />
                  <MetricCard theme={theme} icon={<Boxes            className="h-4 w-4" />} label="STOCK"    value={<AnimatedNumber value={stock} />} tone={stock <= 0 ? "danger" : stock < 5 ? "warn" : "good"} />
                </div>
                {product.note && (
                  <div className={cn("mt-4 rounded-2xl border p-4", t.soft)}>
                    <div className={cn("mb-1 text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>Note</div>
                    <p className={cn("text-sm whitespace-pre-wrap", t.textMuted)}>{product.note}</p>
                  </div>
                )}
              </motion.div>

              {/* barcode */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
                className={cn("rounded-[24px] border p-5", t.card)}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", t.metricIcon, t.textMuted)}>
                      <BarcodeIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className={cn("font-black", t.text)}>Barcode</div>
                      <div className={cn("text-[11px]", t.textMuted)}>uses {product.barcode ? "barcode" : "SKU"}</div>
                    </div>
                  </div>
                  <button onClick={printBarcode}
                    className={cn("flex h-9 items-center gap-2 rounded-xl border px-3 text-[12px] font-semibold transition-all", t.btn)}>
                    <Printer className="h-4 w-4" /> Print
                  </button>
                </div>
                <div className={cn("overflow-x-auto rounded-2xl border p-4", t.soft)}>
                  <svg ref={barcodeSvgRef} />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── STOCK MODAL ── */}
        <Dialog open={stockOpen} onOpenChange={setStockOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {theme === "dark" && <LanternMark size={20} glow />}
                {stockMode === "IN" ? "Stock IN" : stockMode === "OUT" ? "Stock OUT" : "Stock Adjust"}
              </DialogTitle>
              <DialogDescription>
                {stockMode === "ADJUST" ? "Final stock (absolute) ကို သတ်မှတ်ပါ" : "Delta qty ထည့်ပါ"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Qty</Label>
                <Input type="number" value={stockQty} onChange={(e) => setStockQty(Number(e.target.value))}
                  min={stockMode === "ADJUST" ? 0 : 1} />
                {stockMode === "OUT" && (
                  <p className="text-xs text-muted-foreground">Current stock: <b>{product?.product_quantity_amount ?? 0}</b></p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Note (optional)</Label>
                <Input value={stockNote} onChange={(e) => setStockNote(e.target.value)}
                  placeholder="e.g. restock from supplier / sale invoice..." />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <button onClick={() => setStockOpen(false)} disabled={stockSaving}
                className={cn("flex h-10 items-center rounded-xl border px-5 text-[13px] font-semibold transition-all", tk(theme).btn)}>
                Cancel
              </button>
              <button onClick={submitStock} disabled={stockSaving}
                className={cn("flex h-10 items-center gap-2 rounded-xl px-5 text-[13px] font-bold transition-all", tk(theme).btnPrimary)}>
                {stockSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {stockSaving ? "Saving..." : "Confirm"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}


