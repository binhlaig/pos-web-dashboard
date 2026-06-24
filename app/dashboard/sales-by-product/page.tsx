

// "use client";

// import React, {
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
//   useCallback,
// } from "react";
// import {
//   AreaChart,
//   Area,
//   CartesianGrid,
//   ResponsiveContainer,
//   XAxis,
//   YAxis,
//   Tooltip,
// } from "recharts";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Input } from "@/components/ui/input";
// import {
//   RefreshCw,
//   Wand2,
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   GripVertical,
//   LayoutGrid,
//   BarChart2,
//   ImageIcon,
//   Coins,
//   PackageSearch,
//   TrendingUp,
//   Zap,
// } from "lucide-react";

// // dnd-kit
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
//   UniqueIdentifier,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   useSortable,
//   arrayMove,
//   rectSortingStrategy,
//   sortableKeyboardCoordinates,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// /* ─── Types ───────────────────────────────────────────────────────── */
// type SaleItem = {
//   product_id: string;
//   sku: string;
//   product_name: string;
//   qty: number;
//   price: number;
// };
// type Sale = {
//   id: string;
//   created_at: string;
//   total: number;
//   items: SaleItem[];
// };
// type Granularity = "hour" | "day" | "month" | "year";
// type Metric = "revenue" | "qty" | "orders";
// type CardView = "info" | "chart" | "image";

// /* ─── Storage ─────────────────────────────────────────────────────── */
// const LS_KEY = "TEMP_SALES_ANALYTICS_LUX_V1";

// /* ─── Utils ───────────────────────────────────────────────────────── */
// function cn(...c: (string | false | null | undefined)[]) {
//   return c.filter(Boolean).join(" ");
// }
// function money(n: number) {
//   return Number(n || 0).toLocaleString("en-US");
// }
// function uuid() {
//   return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
// }
// function readSales(): Sale[] {
//   try {
//     const raw = localStorage.getItem(LS_KEY);
//     if (!raw) return [];
//     const p = JSON.parse(raw);
//     return Array.isArray(p) ? p : [];
//   } catch {
//     return [];
//   }
// }
// function writeSales(s: Sale[]) {
//   localStorage.setItem(LS_KEY, JSON.stringify(s));
// }
// function groupKey(d: Date, g: Granularity) {
//   const y = d.getFullYear();
//   const m = String(d.getMonth() + 1).padStart(2, "0");
//   const day = String(d.getDate()).padStart(2, "0");
//   const h = String(d.getHours()).padStart(2, "0");
//   if (g === "year") return `${y}`;
//   if (g === "month") return `${y}-${m}`;
//   if (g === "day") return `${y}-${m}-${day}`;
//   return `${y}-${m}-${day} ${h}h`;
// }

// /* ─── Demo Seed ───────────────────────────────────────────────────── */
// const PRODUCTS = [
//   { sku: "SKU-COKE", name: "Coca Cola" },
//   { sku: "SKU-BREAD", name: "Bread" },
//   { sku: "SKU-MILK", name: "Milk" },
//   { sku: "SKU-EGG", name: "Egg" },
//   { sku: "SKU-WATER", name: "Mineral Water" },
//   { sku: "SKU-COFFEE", name: "Coffee" },
//   { sku: "SKU-TEA", name: "Green Tea" },
//   { sku: "SKU-RICE", name: "Jasmine Rice" },
//   { sku: "SKU-CHIPS", name: "Potato Chips" },
//   { sku: "SKU-RAMEN", name: "Instant Ramen" },
//   { sku: "SKU-SOAP", name: "Hand Soap" },
//   { sku: "SKU-OIL", name: "Cooking Oil" },
//   { sku: "SKU-BANANA", name: "Banana" },
//   { sku: "SKU-CHICKEN", name: "Chicken" },
//   { sku: "SKU-YOGURT", name: "Yogurt" },
// ];

// function seedDemo() {
//   const now = Date.now();
//   const sales: Sale[] = Array.from({ length: 300 }).map(() => {
//     const d = new Date(now - Math.floor(Math.random() * 90) * 86400000);
//     d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
//     const items: SaleItem[] = Array.from({
//       length: 1 + Math.floor(Math.random() * 4),
//     }).map(() => {
//       const p = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
//       const qty = 1 + Math.floor(Math.random() * 6);
//       const price = 300 + Math.floor(Math.random() * 3000);
//       return { product_id: p.sku, sku: p.sku, product_name: p.name, qty, price };
//     });
//     return {
//       id: uuid(),
//       created_at: d.toISOString(),
//       total: items.reduce((s, i) => s + i.qty * i.price, 0),
//       items,
//     };
//   });
//   writeSales(sales);
// }

// /* ─── Highlight ───────────────────────────────────────────────────── */
// function Highlight({ text, q }: { text: string; q: string }) {
//   if (!q.trim()) return <>{text}</>;
//   const i = text.toLowerCase().indexOf(q.toLowerCase());
//   if (i < 0) return <>{text}</>;
//   return (
//     <>
//       {text.slice(0, i)}
//       <span className="bg-amber-400/30 text-amber-200 rounded px-0.5">
//         {text.slice(i, i + q.length)}
//       </span>
//       {text.slice(i + q.length)}
//     </>
//   );
// }

// /* ─── MiniBarChart inline ─────────────────────────────────────────── */
// function SparkBars({ data }: { data: number[] }) {
//   const max = Math.max(...data, 1);
//   return (
//     <div className="flex items-end gap-[2px] h-8">
//       {data.map((v, i) => (
//         <div
//           key={i}
//           className="flex-1 rounded-sm bg-amber-400/70"
//           style={{ height: `${Math.round((v / max) * 100)}%`, minHeight: 2 }}
//         />
//       ))}
//     </div>
//   );
// }

// /* ─── VIEW CYCLE TYPES ────────────────────────────────────────────── */
// const VIEW_CYCLE: CardView[] = ["info", "chart", "image"];
// const VIEW_META: Record<CardView, { icon: React.ReactNode; label: string }> = {
//   info: { icon: <LayoutGrid className="w-3 h-3" />, label: "INFO" },
//   chart: { icon: <BarChart2 className="w-3 h-3" />, label: "CHART" },
//   image: { icon: <ImageIcon className="w-3 h-3" />, label: "IMAGE" },
// };

// /* ─── Stat Card Types ─────────────────────────────────────────────── */
// type StatCardDef = {
//   id: string;
//   label: string;
//   view: CardView;
// };

// /* ─── StatCard Content ────────────────────────────────────────────── */
// type StatContentProps = {
//   id: string;
//   view: CardView;
//   allRows: ReturnType<typeof useAggregation>["allRows"];
//   totalRevenue: number;
//   totalQty: number;
//   totalOrders: number;
// };

// function StatContent({ id, view, allRows, totalRevenue, totalQty, totalOrders }: StatContentProps) {
//   if (view === "info") {
//     if (id === "revenue")
//       return (
//         <>
//           <div className="text-3xl font-black tracking-tight text-amber-400 font-mono">
//             {money(totalRevenue)}
//           </div>
//           <div className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">MMK / Total</div>
//         </>
//       );
//     if (id === "qty")
//       return (
//         <>
//           <div className="text-3xl font-black tracking-tight text-sky-400 font-mono">{totalQty}</div>
//           <div className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Units Sold</div>
//         </>
//       );
//     if (id === "products")
//       return (
//         <>
//           <div className="text-3xl font-black tracking-tight text-emerald-400 font-mono">
//             {allRows.length}
//           </div>
//           <div className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Unique SKUs</div>
//         </>
//       );
//   }

//   if (view === "chart") {
//     const top = allRows.slice(0, 8);
//     const data =
//       id === "revenue"
//         ? top.map((r) => r.revenue)
//         : id === "qty"
//         ? top.map((r) => r.qty)
//         : top.map((r) => r.orders);
//     return (
//       <div className="mt-1">
//         <SparkBars data={data} />
//         <div className="text-[10px] text-zinc-600 mt-1 uppercase tracking-widest">Top 8 products</div>
//       </div>
//     );
//   }

//   if (view === "image") {
//     return (
//       <div className="grid grid-cols-3 gap-1 mt-1">
//         {allRows.slice(0, 6).map((r, i) => (
//           <div
//             key={r.sku}
//             className="aspect-square rounded-md flex flex-col items-center justify-center text-center p-1"
//             style={{
//               background: `hsl(${(i * 47) % 360} 30% 18%)`,
//               border: "1px solid hsl(" + ((i * 47) % 360) + " 30% 28%)",
//             }}
//           >
//             <PackageSearch className="w-3 h-3 mb-0.5 opacity-60" style={{ color: `hsl(${(i * 47) % 360} 70% 65%)` }} />
//             <div className="text-[8px] leading-tight opacity-70 truncate w-full text-center px-0.5">
//               {r.name.slice(0, 8)}
//             </div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   return null;
// }

// /* ─── useSortableCard ─────────────────────────────────────────────── */
// function SortableStatCard({
//   card,
//   allRows,
//   totalRevenue,
//   totalQty,
//   totalOrders,
//   onCycle,
//   isGhost,
// }: {
//   card: StatCardDef;
//   allRows: ReturnType<typeof useAggregation>["allRows"];
//   totalRevenue: number;
//   totalQty: number;
//   totalOrders: number;
//   onCycle: (id: string) => void;
//   isGhost?: boolean;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
//     id: card.id,
//   });

//   const style: React.CSSProperties = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isGhost ? 0.3 : 1,
//   };

//   return (
//     <div ref={setNodeRef} style={style} className="relative group">
//       <div className="lux-card rounded-2xl p-4 h-full flex flex-col">
//         {/* Header row */}
//         <div className="flex items-center justify-between mb-3">
//           <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
//             {card.label}
//           </div>
//           <div className="flex items-center gap-1">
//             {/* View cycle button */}
//             <button
//               onClick={() => onCycle(card.id)}
//               className="flex items-center gap-1 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-500 hover:border-amber-500/60 hover:text-amber-400 transition-all"
//             >
//               {VIEW_META[card.view].icon}
//               {VIEW_META[card.view].label}
//             </button>
//             {/* Drag handle */}
//             <div
//               {...attributes}
//               {...listeners}
//               className="opacity-0 group-hover:opacity-40 hover:!opacity-80 cursor-grab active:cursor-grabbing p-1 transition-opacity"
//             >
//               <GripVertical className="w-3.5 h-3.5 text-zinc-400" />
//             </div>
//           </div>
//         </div>

//         <StatContent
//           id={card.id}
//           view={card.view}
//           allRows={allRows}
//           totalRevenue={totalRevenue}
//           totalQty={totalQty}
//           totalOrders={totalOrders}
//         />
//       </div>
//     </div>
//   );
// }

// /* ─── useAggregation hook ─────────────────────────────────────────── */
// function useAggregation(sales: Sale[]) {
//   return useMemo(() => {
//     const map = new Map<
//       string,
//       { sku: string; name: string; revenue: number; qty: number; orders: number }
//     >();
//     for (const s of sales) {
//       const seen = new Set<string>();
//       for (const it of s.items) {
//         const key = it.sku || it.product_id || "?";
//         const cur = map.get(key) || { sku: key, name: it.product_name || key, revenue: 0, qty: 0, orders: 0 };
//         cur.qty += Number(it.qty || 0);
//         cur.revenue += Number(it.qty || 0) * Number(it.price || 0);
//         if (!seen.has(key)) { cur.orders += 1; seen.add(key); }
//         map.set(key, cur);
//       }
//     }
//     return { allRows: Array.from(map.values()).sort((a, b) => b.revenue - a.revenue) };
//   }, [sales]);
// }

// /* ─── Main Page ───────────────────────────────────────────────────── */
// const PAGE_SIZE = 20;

// export default function SalesByProductPage() {
//   const [sales, setSales] = useState<Sale[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [q, setQ] = useState("");
//   const [selectedSku, setSelectedSku] = useState("");
//   const [granularity, setGranularity] = useState<Granularity>("day");
//   const [metric, setMetric] = useState<Metric>("revenue");
//   const [page, setPage] = useState(1);
//   const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
//   const rightRef = useRef<HTMLDivElement>(null);

//   const [statCards, setStatCards] = useState<StatCardDef[]>([
//     { id: "revenue", label: "Total Revenue", view: "info" },
//     { id: "qty", label: "Total Units", view: "info" },
//     { id: "products", label: "Unique Products", view: "info" },
//   ]);

//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
//     useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
//   );

//   function reload() {
//     setLoading(true);
//     setTimeout(() => {
//       const d = readSales();
//       if (!d.length) seedDemo();
//       setSales(readSales());
//       setLoading(false);
//     }, 50);
//   }

//   useEffect(() => { reload(); }, []);

//   const { allRows } = useAggregation(sales);

//   const filteredRows = useMemo(() => {
//     const kw = q.trim().toLowerCase();
//     if (!kw) return allRows;
//     return allRows.filter(r => r.sku.toLowerCase().includes(kw) || r.name.toLowerCase().includes(kw));
//   }, [allRows, q]);

//   useEffect(() => { setPage(1); }, [q]);
//   useEffect(() => {
//     if (!selectedSku && filteredRows.length) setSelectedSku(filteredRows[0].sku);
//   }, [filteredRows]);

//   const totalRevenue = useMemo(() => allRows.reduce((s, r) => s + r.revenue, 0), [allRows]);
//   const totalQty = useMemo(() => allRows.reduce((s, r) => s + r.qty, 0), [allRows]);
//   const totalOrders = useMemo(() => sales.length, [sales]);

//   const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
//   const safePage = Math.min(Math.max(page, 1), totalPages);
//   const pageRows = useMemo(() => filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [filteredRows, safePage]);
//   const selectedProduct = filteredRows.find(r => r.sku === selectedSku) || null;

//   const series = useMemo(() => {
//     if (!selectedSku) return [];
//     const bucket = new Map<string, { bucket: string; revenue: number; qty: number; orders: number }>();
//     for (const s of sales) {
//       const items = s.items.filter(it => (it.sku || it.product_id) === selectedSku);
//       if (!items.length) continue;
//       const k = groupKey(new Date(s.created_at), granularity);
//       const cur = bucket.get(k) || { bucket: k, revenue: 0, qty: 0, orders: 0 };
//       items.forEach(it => { cur.qty += Number(it.qty || 0); cur.revenue += Number(it.qty || 0) * Number(it.price || 0); });
//       cur.orders += 1;
//       bucket.set(k, cur);
//     }
//     return Array.from(bucket.values()).sort((a, b) => a.bucket < b.bucket ? -1 : 1);
//   }, [sales, selectedSku, granularity]);

//   function selectProduct(sku: string) {
//     setSelectedSku(sku);
//     rightRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
//   }

//   const handleCycle = useCallback((id: string) => {
//     setStatCards(prev => prev.map(c => c.id === id ? {
//       ...c,
//       view: VIEW_CYCLE[(VIEW_CYCLE.indexOf(c.view) + 1) % VIEW_CYCLE.length]
//     } : c));
//   }, []);

//   function handleDragStart(e: DragStartEvent) { setActiveId(e.active.id); }
//   function handleDragEnd(e: DragEndEvent) {
//     setActiveId(null);
//     if (e.over && e.active.id !== e.over.id) {
//       setStatCards(prev => {
//         const oi = prev.findIndex(c => c.id === e.active.id);
//         const ni = prev.findIndex(c => c.id === e.over!.id);
//         return arrayMove(prev, oi, ni);
//       });
//     }
//   }

//   const activeCard = statCards.find(c => c.id === activeId);
//   const METRIC_COLOR = { revenue: "#f59e0b", qty: "#38bdf8", orders: "#a78bfa" };

//   return (
//     <>
//       <style>{`
//         .lux-card {
//           background: linear-gradient(135deg, #18181b 0%, #1c1c1f 100%);
//           border: 1px solid #27272a;
//           transition: border-color 0.2s;
//         }
//         .lux-card:hover { border-color: #3f3f46; }
//         .lux-page { background: #0f0f11; min-height: 100vh; color: #e4e4e7; }
//         .lux-row-active { background: rgba(245,158,11,0.08) !important; border-left: 2px solid #f59e0b; }
//         .lux-row:hover { background: rgba(255,255,255,0.03); }
//         .progress-track { background: #27272a; border-radius: 2px; height: 3px; overflow: hidden; }
//         .progress-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #f59e0b, #fbbf24); }
//         .lux-btn { background: transparent; border: 1px solid #3f3f46; color: #a1a1aa; border-radius: 8px; padding: 4px 12px; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; transition: all 0.15s; cursor: pointer; }
//         .lux-btn:hover { border-color: #f59e0b; color: #f59e0b; }
//         .lux-btn-active { border-color: #f59e0b !important; color: #f59e0b !important; background: rgba(245,158,11,0.08) !important; }
//         .lux-metric-btn { background: transparent; border: 1px solid #3f3f46; border-radius: 6px; padding: 6px 14px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.15s; color: #71717a; }
//         .lux-metric-btn:hover { border-color: #52525b; color: #a1a1aa; }
//         .lux-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; border: 1px solid #3f3f46; color: #71717a; }
//         .divider { height: 1px; background: #27272a; margin: 0; }
//         input.lux-input { background: #18181b; border: 1px solid #27272a; color: #e4e4e7; border-radius: 10px; padding: 8px 12px 8px 36px; font-size: 13px; width: 100%; outline: none; transition: border-color 0.15s; }
//         input.lux-input:focus { border-color: #52525b; }
//         input.lux-input::placeholder { color: #52525b; }
//         .chart-tooltip { background: #1c1c1f !important; border: 1px solid #3f3f46 !important; border-radius: 8px !important; font-size: 12px !important; }
//       `}</style>

//       <div className="lux-page p-4 md:p-8">
//         <div className="max-w-7xl mx-auto space-y-6">

//           {/* ── Header ── */}
//           <div className="flex items-center justify-between">
//             <div>
//               <div className="flex items-center gap-2 mb-1">
//                 <Zap className="w-4 h-4 text-amber-400" />
//                 <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400/70 font-medium">
//                   Analytics Console
//                 </span>
//               </div>
//               <h1 className="text-2xl font-black tracking-tight text-zinc-100">
//                 Sales by Product
//               </h1>
//               <p className="text-xs text-zinc-600 mt-0.5">
//                 Cards drag လုပ်ပြီး sort · view button နှိပ်ပြီး{" "}
//                 <span className="text-amber-500/80">info → chart → image</span> ပြောင်း
//               </p>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 className="lux-btn flex items-center gap-2"
//                 onClick={() => { seedDemo(); setSales(readSales()); }}
//               >
//                 <Wand2 className="w-3 h-3" /> Seed
//               </button>
//               <button
//                 className="lux-btn flex items-center gap-2"
//                 onClick={reload}
//                 disabled={loading}
//               >
//                 <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} /> Reload
//               </button>
//             </div>
//           </div>

//           {/* ── DnD Stat Cards ── */}
//           <DndContext
//             sensors={sensors}
//             collisionDetection={closestCenter}
//             onDragStart={handleDragStart}
//             onDragEnd={handleDragEnd}
//           >
//             <SortableContext items={statCards.map(c => c.id)} strategy={rectSortingStrategy}>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 {statCards.map(card => (
//                   <SortableStatCard
//                     key={card.id}
//                     card={card}
//                     allRows={allRows}
//                     totalRevenue={totalRevenue}
//                     totalQty={totalQty}
//                     totalOrders={totalOrders}
//                     onCycle={handleCycle}
//                     isGhost={activeId === card.id}
//                   />
//                 ))}
//               </div>
//             </SortableContext>

//             <DragOverlay>
//               {activeCard && (
//                 <div className="lux-card rounded-2xl p-4 rotate-2 scale-105 shadow-2xl opacity-90">
//                   <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
//                     {activeCard.label}
//                   </div>
//                   <StatContent
//                     id={activeCard.id}
//                     view={activeCard.view}
//                     allRows={allRows}
//                     totalRevenue={totalRevenue}
//                     totalQty={totalQty}
//                     totalOrders={totalOrders}
//                   />
//                 </div>
//               )}
//             </DragOverlay>
//           </DndContext>

//           {/* ── Main Layout ── */}
//           <div className="grid gap-4 lg:grid-cols-5">
//             {/* LEFT: Product List */}
//             <div className="lg:col-span-2 lux-card rounded-2xl overflow-hidden flex flex-col">
//               <div className="p-4 border-b border-zinc-800/60">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
//                     Products
//                   </div>
//                   <span className="lux-tag">
//                     <span>{filteredRows.length} SKUs</span>
//                   </span>
//                 </div>

//                 <div className="relative">
//                   <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-600" />
//                   <input
//                     className="lux-input"
//                     placeholder="Search name or SKU…"
//                     value={q}
//                     onChange={e => setQ(e.target.value)}
//                   />
//                 </div>
//               </div>

//               <ScrollArea className="flex-1 h-[580px]">
//                 {/* Top 3 highlight */}
//                 <div className="p-3 border-b border-zinc-800/60">
//                   <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-600 mb-2 px-1">
//                     Top Performers
//                   </div>
//                   {filteredRows.slice(0, 3).map((r, i) => {
//                     const active = r.sku === selectedSku;
//                     const pct = filteredRows[0]?.revenue ? (r.revenue / filteredRows[0].revenue) * 100 : 0;
//                     const rankColor = ["text-amber-400", "text-zinc-300", "text-zinc-500"][i];
//                     return (
//                       <button
//                         key={r.sku}
//                         onClick={() => selectProduct(r.sku)}
//                         className={cn(
//                           "w-full text-left rounded-xl px-3 py-2.5 mb-1.5 transition-all",
//                           active ? "lux-row-active" : "lux-row hover:bg-zinc-800/40"
//                         )}
//                         style={{ border: active ? undefined : "1px solid transparent" }}
//                       >
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center gap-2 min-w-0">
//                             <span className={cn("text-xs font-black w-4 shrink-0", rankColor)}>
//                               {i + 1}
//                             </span>
//                             <div className="min-w-0">
//                               <div className="text-sm font-semibold text-zinc-100 truncate">
//                                 <Highlight text={r.name} q={q} />
//                               </div>
//                               <div className="text-[10px] text-zinc-600 font-mono">
//                                 <Highlight text={r.sku} q={q} />
//                               </div>
//                             </div>
//                           </div>
//                           <div className="text-right shrink-0 ml-2">
//                             <div className="text-xs font-bold text-amber-400 font-mono">
//                               {money(r.revenue)}
//                             </div>
//                             <div className="text-[10px] text-zinc-600">{r.qty} units</div>
//                           </div>
//                         </div>
//                         <div className="progress-track mt-2">
//                           <div className="progress-fill" style={{ width: `${pct}%` }} />
//                         </div>
//                       </button>
//                     );
//                   })}
//                 </div>

//                 {/* Paged table */}
//                 <div className="divide-y divide-zinc-800/40">
//                   {pageRows.length === 0 ? (
//                     <div className="p-6 text-center text-zinc-600 text-sm">
//                       No data — Seed လုပ်ပြီးစမ်းပါ
//                     </div>
//                   ) : pageRows.map((r, idx) => {
//                     const active = r.sku === selectedSku;
//                     const globalIdx = (safePage - 1) * PAGE_SIZE + idx + 1;
//                     const pct = filteredRows[0]?.revenue ? Math.min(100, (r.revenue / filteredRows[0].revenue) * 100) : 0;
//                     return (
//                       <button
//                         key={r.sku}
//                         onClick={() => selectProduct(r.sku)}
//                         className={cn(
//                           "w-full text-left px-4 py-2.5 transition-all lux-row",
//                           active ? "lux-row-active" : ""
//                         )}
//                       >
//                         <div className="flex items-center gap-3">
//                           <span className="text-[11px] text-zinc-600 font-mono w-5 shrink-0 text-right">
//                             {globalIdx}
//                           </span>
//                           <div className="flex-1 min-w-0">
//                             <div className="text-[13px] font-medium text-zinc-200 truncate">
//                               <Highlight text={r.name} q={q} />
//                             </div>
//                             <div className="flex items-center gap-2 mt-0.5">
//                               <div className="progress-track flex-1">
//                                 <div className="progress-fill" style={{ width: `${pct}%`, background: active ? "#f59e0b" : "#52525b" }} />
//                               </div>
//                               <span className="text-[10px] text-zinc-600 font-mono shrink-0">
//                                 {money(r.revenue)}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       </button>
//                     );
//                   })}
//                 </div>

//                 {/* Pagination */}
//                 <div className="p-3 flex items-center justify-between border-t border-zinc-800/60">
//                   <span className="text-[10px] text-zinc-600">
//                     pg {safePage}/{totalPages}
//                   </span>
//                   <div className="flex items-center gap-1">
//                     <button
//                       className="lux-btn px-2 py-1"
//                       disabled={safePage <= 1}
//                       onClick={() => setPage(p => Math.max(1, p - 1))}
//                     >
//                       <ChevronLeft className="w-3 h-3" />
//                     </button>
//                     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                       const n = Math.max(1, Math.min(safePage - 2, totalPages - 4)) + i;
//                       return (
//                         <button
//                           key={n}
//                           className={cn("lux-btn px-2.5 py-1", n === safePage && "lux-btn-active")}
//                           onClick={() => setPage(n)}
//                         >
//                           {n}
//                         </button>
//                       );
//                     })}
//                     <button
//                       className="lux-btn px-2 py-1"
//                       disabled={safePage >= totalPages}
//                       onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                     >
//                       <ChevronRight className="w-3 h-3" />
//                     </button>
//                   </div>
//                 </div>
//               </ScrollArea>
//             </div>

//             {/* RIGHT: Chart Panel */}
//             <div ref={rightRef} className="lg:col-span-3 lux-card rounded-2xl overflow-hidden flex flex-col">
//               {/* Panel header */}
//               <div className="p-4 border-b border-zinc-800/60">
//                 <div className="flex items-start justify-between gap-3">
//                   <div>
//                     <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-600 mb-1">
//                       Selected Product
//                     </div>
//                     <div className="text-xl font-black text-zinc-100 tracking-tight">
//                       {selectedProduct?.name || "—"}
//                     </div>
//                     <div className="text-[11px] text-zinc-600 font-mono mt-0.5">
//                       {selectedProduct?.sku || "—"}
//                     </div>
//                   </div>
//                   {selectedProduct && (
//                     <div className="flex gap-2 flex-wrap justify-end">
//                       <div className="text-right">
//                         <div className="text-lg font-black text-amber-400 font-mono">
//                           {money(selectedProduct.revenue)}
//                         </div>
//                         <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Revenue</div>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-lg font-black text-sky-400 font-mono">
//                           {selectedProduct.qty}
//                         </div>
//                         <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Units</div>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-lg font-black text-violet-400 font-mono">
//                           {selectedProduct.orders}
//                         </div>
//                         <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Orders</div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Controls */}
//               <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap border-b border-zinc-800/60">
//                 <div className="flex items-center gap-2">
//                   <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Metric</span>
//                   {(["revenue", "qty", "orders"] as Metric[]).map(m => (
//                     <button
//                       key={m}
//                       className={cn("lux-metric-btn", metric === m && "lux-btn-active")}
//                       onClick={() => setMetric(m)}
//                       style={metric === m ? { borderColor: METRIC_COLOR[m], color: METRIC_COLOR[m], background: METRIC_COLOR[m] + "14" } : {}}
//                     >
//                       {m}
//                     </button>
//                   ))}
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Granularity</span>
//                   {(["hour", "day", "month", "year"] as Granularity[]).map(g => (
//                     <button
//                       key={g}
//                       className={cn("lux-btn", granularity === g && "lux-btn-active")}
//                       onClick={() => setGranularity(g)}
//                     >
//                       {g}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Chart */}
//               <div className="flex-1 p-4">
//                 {series.length === 0 ? (
//                   <div className="h-full flex flex-col items-center justify-center text-zinc-700">
//                     <TrendingUp className="w-10 h-10 mb-3 opacity-30" />
//                     <div className="text-sm">Product ရွေးပြီး data ကြည့်ပါ</div>
//                   </div>
//                 ) : (
//                   <div className="h-[340px]">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <AreaChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
//                         <defs>
//                           <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
//                             <stop offset="0%" stopColor={METRIC_COLOR[metric]} stopOpacity={0.3} />
//                             <stop offset="100%" stopColor={METRIC_COLOR[metric]} stopOpacity={0.02} />
//                           </linearGradient>
//                         </defs>
//                         <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
//                         <XAxis
//                           dataKey="bucket"
//                           tick={{ fontSize: 10, fill: "#52525b" }}
//                           tickLine={false}
//                           axisLine={false}
//                         />
//                         <YAxis
//                           tick={{ fontSize: 10, fill: "#52525b" }}
//                           tickLine={false}
//                           axisLine={false}
//                           width={metric === "revenue" ? 72 : 40}
//                           tickFormatter={v => metric === "revenue" ? money(v) : String(v)}
//                         />
//                         <Tooltip
//                           contentStyle={{
//                             background: "#18181b",
//                             border: "1px solid #3f3f46",
//                             borderRadius: 10,
//                             fontSize: 12,
//                             color: "#e4e4e7",
//                           }}
//                           formatter={(v: number) => [
//                             metric === "revenue" ? money(v) : v,
//                             metric.charAt(0).toUpperCase() + metric.slice(1),
//                           ]}
//                           labelStyle={{ color: "#71717a", fontSize: 11 }}
//                         />
//                         <Area
//                           dataKey={metric}
//                           type="monotone"
//                           stroke={METRIC_COLOR[metric]}
//                           fill="url(#areaGrad)"
//                           strokeWidth={2}
//                           dot={false}
//                           activeDot={{ r: 4, fill: METRIC_COLOR[metric], strokeWidth: 0 }}
//                         />
//                       </AreaChart>
//                     </ResponsiveContainer>
//                   </div>
//                 )}
//               </div>

//               {/* Footer */}
//               <div className="px-4 py-2 border-t border-zinc-800/60 flex items-center gap-2">
//                 <Coins className="w-3 h-3 text-zinc-700" />
//                 <span className="text-[10px] text-zinc-700 uppercase tracking-widest">
//                   localStorage demo · DB မလိုပါ
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }








"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  LayoutGrid,
  BarChart2,
  ImageIcon,
  Coins,
  PackageSearch,
  TrendingUp,
  Zap,
} from "lucide-react";

// dnd-kit
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ─── Types ───────────────────────────────────────────────────────── */
type SaleItem = {
  product_id: string;
  sku: string;
  product_name: string;
  qty: number;
  price: number;
};
type Sale = {
  id: string;
  created_at: string;
  total: number;
  items: SaleItem[];
};
type Granularity = "hour" | "day" | "month" | "year";
type Metric = "revenue" | "qty" | "orders";
type CardView = "info" | "chart" | "image";

/* ─── API / Utils ─────────────────────────────────────────────────────── */
type ReceiptItemApi = {
  id?: number | string;
  productId?: number | string | null;
  product_id?: number | string | null;
  barcode?: string | null;
  sku?: string | null;
  productName?: string | null;
  product_name?: string | null;
  qty?: number | string | null;
  price?: number | string | null;
  lineTotal?: number | string | null;
  line_total?: number | string | null;
};

type ReceiptApi = {
  id?: number | string;
  receiptNo?: string;
  receipt_no?: string;
  createdAt?: string;
  created_at?: string;
  grandTotal?: number | string | null;
  grand_total?: number | string | null;
  total?: number | string | null;
  items?: ReceiptItemApi[];
};

const RECEIPT_ENDPOINTS = [
  "/api/pos/receipts",
  "/api/pos/receipts/shop",
  "/api/pos/receipts/my",
];

function getStoredAccessToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("pos_shop_owner_token") ||
    localStorage.getItem("pos_access_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  ).trim();
}

function authHeaders(token?: string | null): Record<string, string> {
  const accessToken = (token || getStoredAccessToken()).trim();

  return accessToken
    ? {
        Authorization: accessToken.startsWith("Bearer ")
          ? accessToken
          : `Bearer ${accessToken}`,
      }
    : {};
}

function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

function money(n: number) {
  return Number(n || 0).toLocaleString("en-US");
}

function normalizeReceiptsResponse(data: any): ReceiptApi[] {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.receipts)) return data.receipts;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;

  return [];
}

function normalizeSaleFromReceipt(receipt: ReceiptApi): Sale | null {
  const itemsRaw = Array.isArray(receipt.items) ? receipt.items : [];

  const items: SaleItem[] = itemsRaw
    .map((item) => {
      const productId = String(item.productId ?? item.product_id ?? item.sku ?? item.barcode ?? "UNKNOWN").trim();
      const sku = String(item.sku ?? productId ?? "UNKNOWN").trim();
      const productName = String(item.productName ?? item.product_name ?? sku ?? "Unknown Product").trim();
      const qty = Number(item.qty ?? 0);
      const price = Number(item.price ?? 0);

      return {
        product_id: productId || sku || "UNKNOWN",
        sku: sku || productId || "UNKNOWN",
        product_name: productName || sku || "Unknown Product",
        qty: Number.isFinite(qty) ? qty : 0,
        price: Number.isFinite(price) ? price : 0,
      };
    })
    .filter((item) => item.qty > 0);

  if (!items.length) return null;

  const totalFromItems = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const total = Number(receipt.grandTotal ?? receipt.grand_total ?? receipt.total ?? totalFromItems);

  return {
    id: String(receipt.id ?? receipt.receiptNo ?? receipt.receipt_no ?? crypto.randomUUID()),
    created_at: String(receipt.createdAt ?? receipt.created_at ?? new Date().toISOString()),
    total: Number.isFinite(total) ? total : totalFromItems,
    items,
  };
}

async function fetchReceiptsFromApi(accessToken?: string | null): Promise<Sale[]> {
  let lastError = "Receipts load failed.";

  for (const endpoint of RECEIPT_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...authHeaders(accessToken),
        },
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        lastError = data?.message || data?.error || `${endpoint} failed (${res.status})`;
        continue;
      }

      return normalizeReceiptsResponse(data)
        .map(normalizeSaleFromReceipt)
        .filter((sale): sale is Sale => Boolean(sale));
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Receipts load failed.";
    }
  }

  throw new Error(lastError);
}

function groupKey(d: Date, g: Granularity) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  if (g === "year") return `${y}`;
  if (g === "month") return `${y}-${m}`;
  if (g === "day") return `${y}-${m}-${day}`;
  return `${y}-${m}-${day} ${h}h`;
}

/* ─── Highlight ───────────────────────────────────────────────────── */
function Highlight({ text, q }: { text: string; q: string }) {
  if (!q.trim()) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="bg-amber-400/30 text-amber-200 rounded px-0.5">
        {text.slice(i, i + q.length)}
      </span>
      {text.slice(i + q.length)}
    </>
  );
}

/* ─── MiniBarChart inline ─────────────────────────────────────────── */
function SparkBars({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[2px] h-8">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-amber-400/70"
          style={{ height: `${Math.round((v / max) * 100)}%`, minHeight: 2 }}
        />
      ))}
    </div>
  );
}

/* ─── VIEW CYCLE TYPES ────────────────────────────────────────────── */
const VIEW_CYCLE: CardView[] = ["info", "chart", "image"];
const VIEW_META: Record<CardView, { icon: React.ReactNode; label: string }> = {
  info: { icon: <LayoutGrid className="w-3 h-3" />, label: "INFO" },
  chart: { icon: <BarChart2 className="w-3 h-3" />, label: "CHART" },
  image: { icon: <ImageIcon className="w-3 h-3" />, label: "IMAGE" },
};

/* ─── Stat Card Types ─────────────────────────────────────────────── */
type StatCardDef = {
  id: string;
  label: string;
  view: CardView;
};

/* ─── StatCard Content ────────────────────────────────────────────── */
type StatContentProps = {
  id: string;
  view: CardView;
  allRows: ReturnType<typeof useAggregation>["allRows"];
  totalRevenue: number;
  totalQty: number;
  totalOrders: number;
};

function StatContent({ id, view, allRows, totalRevenue, totalQty, totalOrders }: StatContentProps) {
  if (view === "info") {
    if (id === "revenue")
      return (
        <>
          <div className="text-3xl font-black tracking-tight text-amber-400 font-mono">
            {money(totalRevenue)}
          </div>
          <div className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">MMK / Total</div>
        </>
      );
    if (id === "qty")
      return (
        <>
          <div className="text-3xl font-black tracking-tight text-sky-400 font-mono">{totalQty}</div>
          <div className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Units Sold</div>
        </>
      );
    if (id === "products")
      return (
        <>
          <div className="text-3xl font-black tracking-tight text-emerald-400 font-mono">
            {allRows.length}
          </div>
          <div className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Unique SKUs</div>
        </>
      );
  }

  if (view === "chart") {
    const top = allRows.slice(0, 8);
    const data =
      id === "revenue"
        ? top.map((r) => r.revenue)
        : id === "qty"
        ? top.map((r) => r.qty)
        : top.map((r) => r.orders);
    return (
      <div className="mt-1">
        <SparkBars data={data} />
        <div className="text-[10px] text-zinc-600 mt-1 uppercase tracking-widest">Top 8 products</div>
      </div>
    );
  }

  if (view === "image") {
    return (
      <div className="grid grid-cols-3 gap-1 mt-1">
        {allRows.slice(0, 6).map((r, i) => (
          <div
            key={r.sku}
            className="aspect-square rounded-md flex flex-col items-center justify-center text-center p-1"
            style={{
              background: `hsl(${(i * 47) % 360} 30% 18%)`,
              border: "1px solid hsl(" + ((i * 47) % 360) + " 30% 28%)",
            }}
          >
            <PackageSearch className="w-3 h-3 mb-0.5 opacity-60" style={{ color: `hsl(${(i * 47) % 360} 70% 65%)` }} />
            <div className="text-[8px] leading-tight opacity-70 truncate w-full text-center px-0.5">
              {r.name.slice(0, 8)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

/* ─── useSortableCard ─────────────────────────────────────────────── */
function SortableStatCard({
  card,
  allRows,
  totalRevenue,
  totalQty,
  totalOrders,
  onCycle,
  isGhost,
}: {
  card: StatCardDef;
  allRows: ReturnType<typeof useAggregation>["allRows"];
  totalRevenue: number;
  totalQty: number;
  totalOrders: number;
  onCycle: (id: string) => void;
  isGhost?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: card.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isGhost ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="lux-card rounded-2xl p-4 h-full flex flex-col">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium">
            {card.label}
          </div>
          <div className="flex items-center gap-1">
            {/* View cycle button */}
            <button
              onClick={() => onCycle(card.id)}
              className="flex items-center gap-1 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-500 hover:border-amber-500/60 hover:text-amber-400 transition-all"
            >
              {VIEW_META[card.view].icon}
              {VIEW_META[card.view].label}
            </button>
            {/* Drag handle */}
            <div
              {...attributes}
              {...listeners}
              className="opacity-0 group-hover:opacity-40 hover:!opacity-80 cursor-grab active:cursor-grabbing p-1 transition-opacity"
            >
              <GripVertical className="w-3.5 h-3.5 text-zinc-400" />
            </div>
          </div>
        </div>

        <StatContent
          id={card.id}
          view={card.view}
          allRows={allRows}
          totalRevenue={totalRevenue}
          totalQty={totalQty}
          totalOrders={totalOrders}
        />
      </div>
    </div>
  );
}

/* ─── useAggregation hook ─────────────────────────────────────────── */
function useAggregation(sales: Sale[]) {
  return useMemo(() => {
    const map = new Map<
      string,
      { sku: string; name: string; revenue: number; qty: number; orders: number }
    >();
    for (const s of sales) {
      const seen = new Set<string>();
      for (const it of s.items) {
        const key = it.sku || it.product_id || "?";
        const cur = map.get(key) || { sku: key, name: it.product_name || key, revenue: 0, qty: 0, orders: 0 };
        cur.qty += Number(it.qty || 0);
        cur.revenue += Number(it.qty || 0) * Number(it.price || 0);
        if (!seen.has(key)) { cur.orders += 1; seen.add(key); }
        map.set(key, cur);
      }
    }
    return { allRows: Array.from(map.values()).sort((a, b) => b.revenue - a.revenue) };
  }, [sales]);
}

/* ─── Main Page ───────────────────────────────────────────────────── */
const PAGE_SIZE = 20;

export default function SalesByProductPage() {
  const { data: session, status } = useSession();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [selectedSku, setSelectedSku] = useState("");
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [metric, setMetric] = useState<Metric>("revenue");
  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const [statCards, setStatCards] = useState<StatCardDef[]>([
    { id: "revenue", label: "Total Revenue", view: "info" },
    { id: "qty", label: "Total Units", view: "info" },
    { id: "products", label: "Unique Products", view: "info" },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function reload() {
    try {
      setLoading(true);
      const accessToken = String((session as any)?.accessToken || "").trim();
      const rows = await fetchReceiptsFromApi(accessToken);
      setSales(rows);
      if (rows.length) {
        setSelectedSku("");
      }
    } catch (error) {
      console.error(error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "loading") return;
    void reload();
  }, [status, session]);

  const { allRows } = useAggregation(sales);

  const filteredRows = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return allRows;
    return allRows.filter(r => r.sku.toLowerCase().includes(kw) || r.name.toLowerCase().includes(kw));
  }, [allRows, q]);

  useEffect(() => { setPage(1); }, [q]);
  useEffect(() => {
    if (!selectedSku && filteredRows.length) setSelectedSku(filteredRows[0].sku);
  }, [filteredRows]);

  const totalRevenue = useMemo(() => allRows.reduce((s, r) => s + r.revenue, 0), [allRows]);
  const totalQty = useMemo(() => allRows.reduce((s, r) => s + r.qty, 0), [allRows]);
  const totalOrders = useMemo(() => sales.length, [sales]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pageRows = useMemo(() => filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [filteredRows, safePage]);
  const selectedProduct = filteredRows.find(r => r.sku === selectedSku) || null;

  const series = useMemo(() => {
    if (!selectedSku) return [];
    const bucket = new Map<string, { bucket: string; revenue: number; qty: number; orders: number }>();
    for (const s of sales) {
      const items = s.items.filter(it => (it.sku || it.product_id) === selectedSku);
      if (!items.length) continue;
      const k = groupKey(new Date(s.created_at), granularity);
      const cur = bucket.get(k) || { bucket: k, revenue: 0, qty: 0, orders: 0 };
      items.forEach(it => { cur.qty += Number(it.qty || 0); cur.revenue += Number(it.qty || 0) * Number(it.price || 0); });
      cur.orders += 1;
      bucket.set(k, cur);
    }
    return Array.from(bucket.values()).sort((a, b) => a.bucket < b.bucket ? -1 : 1);
  }, [sales, selectedSku, granularity]);

  function selectProduct(sku: string) {
    setSelectedSku(sku);
    rightRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const handleCycle = useCallback((id: string) => {
    setStatCards(prev => prev.map(c => c.id === id ? {
      ...c,
      view: VIEW_CYCLE[(VIEW_CYCLE.indexOf(c.view) + 1) % VIEW_CYCLE.length]
    } : c));
  }, []);

  function handleDragStart(e: DragStartEvent) { setActiveId(e.active.id); }
  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    if (e.over && e.active.id !== e.over.id) {
      setStatCards(prev => {
        const oi = prev.findIndex(c => c.id === e.active.id);
        const ni = prev.findIndex(c => c.id === e.over!.id);
        return arrayMove(prev, oi, ni);
      });
    }
  }

  const activeCard = statCards.find(c => c.id === activeId);
  const METRIC_COLOR = { revenue: "#f59e0b", qty: "#38bdf8", orders: "#a78bfa" };

  return (
    <>
      <style>{`
        .lux-card {
          background: linear-gradient(135deg, #18181b 0%, #1c1c1f 100%);
          border: 1px solid #27272a;
          transition: border-color 0.2s;
        }
        .lux-card:hover { border-color: #3f3f46; }
        .lux-page { background: #0f0f11; min-height: 100vh; color: #e4e4e7; }
        .lux-row-active { background: rgba(245,158,11,0.08) !important; border-left: 2px solid #f59e0b; }
        .lux-row:hover { background: rgba(255,255,255,0.03); }
        .progress-track { background: #27272a; border-radius: 2px; height: 3px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, #f59e0b, #fbbf24); }
        .lux-btn { background: transparent; border: 1px solid #3f3f46; color: #a1a1aa; border-radius: 8px; padding: 4px 12px; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; transition: all 0.15s; cursor: pointer; }
        .lux-btn:hover { border-color: #f59e0b; color: #f59e0b; }
        .lux-btn-active { border-color: #f59e0b !important; color: #f59e0b !important; background: rgba(245,158,11,0.08) !important; }
        .lux-metric-btn { background: transparent; border: 1px solid #3f3f46; border-radius: 6px; padding: 6px 14px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.15s; color: #71717a; }
        .lux-metric-btn:hover { border-color: #52525b; color: #a1a1aa; }
        .lux-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; border: 1px solid #3f3f46; color: #71717a; }
        .divider { height: 1px; background: #27272a; margin: 0; }
        input.lux-input { background: #18181b; border: 1px solid #27272a; color: #e4e4e7; border-radius: 10px; padding: 8px 12px 8px 36px; font-size: 13px; width: 100%; outline: none; transition: border-color 0.15s; }
        input.lux-input:focus { border-color: #52525b; }
        input.lux-input::placeholder { color: #52525b; }
        .chart-tooltip { background: #1c1c1f !important; border: 1px solid #3f3f46 !important; border-radius: 8px !important; font-size: 12px !important; }
      `}</style>

      <div className="lux-page p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ── Header ── */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400/70 font-medium">
                  Analytics Console
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-zinc-100">
                Sales by Product
              </h1>
              <p className="text-xs text-zinc-600 mt-0.5">
                Receipt API data · Cards drag လုပ်ပြီး sort · view button နှိပ်ပြီး{" "}
                <span className="text-amber-500/80">info → chart → image</span> ပြောင်း
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="lux-btn flex items-center gap-2"
                onClick={() => void reload()}
                disabled={loading}
              >
                <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
                {loading ? "Loading" : "Reload API"}
              </button>
            </div>
          </div>

          {/* ── DnD Stat Cards ── */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={statCards.map(c => c.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statCards.map(card => (
                  <SortableStatCard
                    key={card.id}
                    card={card}
                    allRows={allRows}
                    totalRevenue={totalRevenue}
                    totalQty={totalQty}
                    totalOrders={totalOrders}
                    onCycle={handleCycle}
                    isGhost={activeId === card.id}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeCard && (
                <div className="lux-card rounded-2xl p-4 rotate-2 scale-105 shadow-2xl opacity-90">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
                    {activeCard.label}
                  </div>
                  <StatContent
                    id={activeCard.id}
                    view={activeCard.view}
                    allRows={allRows}
                    totalRevenue={totalRevenue}
                    totalQty={totalQty}
                    totalOrders={totalOrders}
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>

          {/* ── Main Layout ── */}
          <div className="grid gap-4 lg:grid-cols-5">
            {/* LEFT: Product List */}
            <div className="lg:col-span-2 lux-card rounded-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-zinc-800/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                    Products
                  </div>
                  <span className="lux-tag">
                    <span>{filteredRows.length} SKUs</span>
                  </span>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-600" />
                  <input
                    className="lux-input"
                    placeholder="Search name or SKU…"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                  />
                </div>
              </div>

              <ScrollArea className="flex-1 h-[580px]">
                {/* Top 3 highlight */}
                <div className="p-3 border-b border-zinc-800/60">
                  <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-600 mb-2 px-1">
                    Top Performers
                  </div>
                  {filteredRows.slice(0, 3).map((r, i) => {
                    const active = r.sku === selectedSku;
                    const pct = filteredRows[0]?.revenue ? (r.revenue / filteredRows[0].revenue) * 100 : 0;
                    const rankColor = ["text-amber-400", "text-zinc-300", "text-zinc-500"][i];
                    return (
                      <button
                        key={r.sku}
                        onClick={() => selectProduct(r.sku)}
                        className={cn(
                          "w-full text-left rounded-xl px-3 py-2.5 mb-1.5 transition-all",
                          active ? "lux-row-active" : "lux-row hover:bg-zinc-800/40"
                        )}
                        style={{ border: active ? undefined : "1px solid transparent" }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={cn("text-xs font-black w-4 shrink-0", rankColor)}>
                              {i + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-zinc-100 truncate">
                                <Highlight text={r.name} q={q} />
                              </div>
                              <div className="text-[10px] text-zinc-600 font-mono">
                                <Highlight text={r.sku} q={q} />
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <div className="text-xs font-bold text-amber-400 font-mono">
                              {money(r.revenue)}
                            </div>
                            <div className="text-[10px] text-zinc-600">{r.qty} units</div>
                          </div>
                        </div>
                        <div className="progress-track mt-2">
                          <div className="progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Paged table */}
                <div className="divide-y divide-zinc-800/40">
                  {pageRows.length === 0 ? (
                    <div className="p-6 text-center text-zinc-600 text-sm">
                      No receipt data — POS sale/payment လုပ်ပြီး Reload API နှိပ်ပါ
                    </div>
                  ) : pageRows.map((r, idx) => {
                    const active = r.sku === selectedSku;
                    const globalIdx = (safePage - 1) * PAGE_SIZE + idx + 1;
                    const pct = filteredRows[0]?.revenue ? Math.min(100, (r.revenue / filteredRows[0].revenue) * 100) : 0;
                    return (
                      <button
                        key={r.sku}
                        onClick={() => selectProduct(r.sku)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 transition-all lux-row",
                          active ? "lux-row-active" : ""
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-zinc-600 font-mono w-5 shrink-0 text-right">
                            {globalIdx}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-zinc-200 truncate">
                              <Highlight text={r.name} q={q} />
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="progress-track flex-1">
                                <div className="progress-fill" style={{ width: `${pct}%`, background: active ? "#f59e0b" : "#52525b" }} />
                              </div>
                              <span className="text-[10px] text-zinc-600 font-mono shrink-0">
                                {money(r.revenue)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="p-3 flex items-center justify-between border-t border-zinc-800/60">
                  <span className="text-[10px] text-zinc-600">
                    pg {safePage}/{totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      className="lux-btn px-2 py-1"
                      disabled={safePage <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const n = Math.max(1, Math.min(safePage - 2, totalPages - 4)) + i;
                      return (
                        <button
                          key={n}
                          className={cn("lux-btn px-2.5 py-1", n === safePage && "lux-btn-active")}
                          onClick={() => setPage(n)}
                        >
                          {n}
                        </button>
                      );
                    })}
                    <button
                      className="lux-btn px-2 py-1"
                      disabled={safePage >= totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* RIGHT: Chart Panel */}
            <div ref={rightRef} className="lg:col-span-3 lux-card rounded-2xl overflow-hidden flex flex-col">
              {/* Panel header */}
              <div className="p-4 border-b border-zinc-800/60">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.25em] text-zinc-600 mb-1">
                      Selected Product
                    </div>
                    <div className="text-xl font-black text-zinc-100 tracking-tight">
                      {selectedProduct?.name || "—"}
                    </div>
                    <div className="text-[11px] text-zinc-600 font-mono mt-0.5">
                      {selectedProduct?.sku || "—"}
                    </div>
                  </div>
                  {selectedProduct && (
                    <div className="flex gap-2 flex-wrap justify-end">
                      <div className="text-right">
                        <div className="text-lg font-black text-amber-400 font-mono">
                          {money(selectedProduct.revenue)}
                        </div>
                        <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Revenue</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-sky-400 font-mono">
                          {selectedProduct.qty}
                        </div>
                        <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Units</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-violet-400 font-mono">
                          {selectedProduct.orders}
                        </div>
                        <div className="text-[10px] text-zinc-600 uppercase tracking-widest">Orders</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap border-b border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Metric</span>
                  {(["revenue", "qty", "orders"] as Metric[]).map(m => (
                    <button
                      key={m}
                      className={cn("lux-metric-btn", metric === m && "lux-btn-active")}
                      onClick={() => setMetric(m)}
                      style={metric === m ? { borderColor: METRIC_COLOR[m], color: METRIC_COLOR[m], background: METRIC_COLOR[m] + "14" } : {}}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600">Granularity</span>
                  {(["hour", "day", "month", "year"] as Granularity[]).map(g => (
                    <button
                      key={g}
                      className={cn("lux-btn", granularity === g && "lux-btn-active")}
                      onClick={() => setGranularity(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div className="flex-1 p-4">
                {series.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-700">
                    <TrendingUp className="w-10 h-10 mb-3 opacity-30" />
                    <div className="text-sm">Product ရွေးပြီး data ကြည့်ပါ</div>
                  </div>
                ) : (
                  <div className="h-[340px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={METRIC_COLOR[metric]} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={METRIC_COLOR[metric]} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="bucket"
                          tick={{ fontSize: 10, fill: "#52525b" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#52525b" }}
                          tickLine={false}
                          axisLine={false}
                          width={metric === "revenue" ? 72 : 40}
                          tickFormatter={v => metric === "revenue" ? money(v) : String(v)}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#18181b",
                            border: "1px solid #3f3f46",
                            borderRadius: 10,
                            fontSize: 12,
                            color: "#e4e4e7",
                          }}
                          formatter={(v: number) => [
                            metric === "revenue" ? money(v) : v,
                            metric.charAt(0).toUpperCase() + metric.slice(1),
                          ]}
                          labelStyle={{ color: "#71717a", fontSize: 11 }}
                        />
                        <Area
                          dataKey={metric}
                          type="monotone"
                          stroke={METRIC_COLOR[metric]}
                          fill="url(#areaGrad)"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, fill: METRIC_COLOR[metric], strokeWidth: 0 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t border-zinc-800/60 flex items-center gap-2">
                <Coins className="w-3 h-3 text-zinc-700" />
                <span className="text-[10px] text-zinc-700 uppercase tracking-widest">
                  Connected to POS receipts API · /api/pos/receipts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
