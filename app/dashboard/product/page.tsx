
// // "use client";

// // import * as React from "react";
// // import { useRouter } from "next/navigation";
// // import { useSession } from "next-auth/react";
// // import { useTheme } from "next-themes";
// // import { motion, AnimatePresence } from "framer-motion";
// // import {
// //   Search,
// //   Plus,
// //   Package2,
// //   Boxes,
// //   LayoutGrid,
// //   List,
// //   RotateCcw,
// //   ArrowDownAZ,
// //   ArrowUpZA,
// //   ChevronRight,
// //   TrendingUp,
// //   TrendingDown,
// //   CheckCircle2,
// //   AlertCircle,
// //   Tag,
// //   Wallet,
// //   Layers,
// //   Store,
// //   X,
// //   ChevronLeft,
// //   ChevronsLeft,
// //   ChevronsRight,
// //   Moon,
// //   Sun,
// //   UserCircle2,
// // } from "lucide-react";

// // import { cn } from "@/lib/utils";
// // import { Input } from "@/components/ui/input";
// // import { Badge } from "@/components/ui/badge";
// // import { toast } from "sonner";

// // type Theme = "dark" | "light";
// // type ViewMode = "grid" | "compact";

// // type SortMode =
// //   | "name_asc"
// //   | "name_desc"
// //   | "price_desc"
// //   | "stock_desc"
// //   | "category_asc";

// // type StockLevel = "all" | "in_stock" | "low_stock" | "out_stock";

// // type Product = {
// //   id: string;
// //   sku: string;
// //   productName: string;
// //   productPrice: number;
// //   barcode?: string | null;
// //   category?: string | null;
// //   productQuantityAmount: number;
// //   imagePath?: string | null;
// //   image_path?: string | null;
// //   product_image?: string | null;
// //   productDiscount?: number | null;
// //   note?: string | null;
// //   productType?: string | null;

// //   createdBy?: any;
// //   createdByUserId?: string | null;
// //   createdByUsername?: string | null;
// //   createdByRole?: string | null;

// //   shopId?: string | null;
// //   shopCode?: string | null;
// // };

// // type ProductOwnerInfo = {
// //   id: string;
// //   username: string;
// //   shopId: string;
// //   shopCode: string;
// // };

// // const STORAGE_KEY = "binhlaig-product-page-owner-only-v2";
// // const PRODUCT_REFRESH_EVENT = "pos-products-stock-refresh";
// // const PAGE_SIZE_OPTIONS = [6, 9, 12, 18] as const;

// // function FontImport() {
// //   return (
// //     <style>{`
// //       @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;700;900&display=swap');

// //       * { font-family: 'DM Sans', sans-serif; }
// //       .serif { font-family: 'DM Serif Display', serif !important; }

// //       @keyframes star-blink {
// //         0%,100% { opacity:.2; transform: scale(.7); }
// //         50% { opacity:1; transform: scale(1.25); }
// //       }
// //     `}</style>
// //   );
// // }

// // function numberFormat(n: number) {
// //   return new Intl.NumberFormat().format(n || 0);
// // }

// // function toNumber(value: unknown, fallback = 0) {
// //   if (value == null || value === "") return fallback;

// //   if (typeof value === "number") {
// //     return Number.isFinite(value) ? value : fallback;
// //   }

// //   const cleaned = String(value).replaceAll(",", "").trim();
// //   const n = Number(cleaned);

// //   return Number.isFinite(n) ? n : fallback;
// // }

// // function money(n: number) {
// //   return `¥${numberFormat(n || 0)}`;
// // }

// // function shortMoney(n: number) {
// //   if (!n) return "¥0";
// //   if (n >= 1_000_000) return `¥${(n / 1_000_000).toFixed(1)}M`;
// //   if (n >= 1_000) return `¥${(n / 1_000).toFixed(0)}k`;
// //   return `¥${n}`;
// // }

// // function safeParseJson(value: unknown) {
// //   if (typeof value !== "string") return value;

// //   try {
// //     return JSON.parse(value);
// //   } catch {
// //     return value;
// //   }
// // }

// // function firstString(...values: unknown[]) {
// //   for (const value of values) {
// //     if (value == null) continue;
// //     const s = String(value).trim();
// //     if (s) return s;
// //   }

// //   return null;
// // }

// // function isNumericId(value: unknown) {
// //   return /^\d+$/.test(String(value ?? "").trim());
// // }

// // function normalizeOwnerInfo(session: unknown): ProductOwnerInfo {
// //   const user = ((session as any)?.user ?? {}) as any;

// //   const rawId = String(user.id ?? user.userId ?? user.staffId ?? "").trim();

// //   return {
// //     id: isNumericId(rawId) ? rawId : "",

// //     username: String(
// //       user.username ||
// //         (!isNumericId(rawId) ? rawId : "") ||
// //         user.name ||
// //         user.email ||
// //         ""
// //     ).trim(),

// //     shopId: user.shopId == null ? "" : String(user.shopId).trim(),
// //     shopCode: String(user.shopCode ?? "").trim(),
// //   };
// // }

// // function normalizeProduct(p: any): Product {
// //   const createdBy = safeParseJson(
// //     p?.createdBy ?? p?.created_by ?? p?.user_info ?? p?.owner ?? null
// //   ) as any;

// //   return {
// //     id: String(p?.id ?? ""),
// //     sku: String(p?.sku ?? p?.productSku ?? p?.product_sku ?? ""),
// //     productName: String(
// //       p?.productName ?? p?.product_name ?? p?.name ?? p?.title ?? ""
// //     ),
// //     productPrice: toNumber(p?.productPrice ?? p?.product_price ?? p?.price),
// //     productQuantityAmount: toNumber(
// //       p?.productQuantityAmount ??
// //         p?.product_quantity_amount ??
// //         p?.quantity ??
// //         p?.stock
// //     ),
// //     barcode: p?.barcode ?? null,
// //     category: p?.category ?? null,
// //     productType: p?.productType ?? p?.product_type ?? null,
// //     productDiscount: toNumber(
// //       p?.productDiscount ?? p?.product_discount ?? p?.discount
// //     ),
// //     note: p?.note ?? null,

// //     imagePath: p?.imagePath ?? null,
// //     image_path: p?.image_path ?? null,
// //     product_image: p?.product_image ?? p?.productImage ?? null,

// //     createdBy,

// //     createdByUserId: firstString(
// //       p?.createdByUserId,
// //       p?.created_by_user_id,
// //       p?.created_by_id,
// //       p?.ownerId,
// //       p?.owner_id,
// //       p?.userId,
// //       p?.user_id,
// //       createdBy?.id,
// //       createdBy?.userId,
// //       createdBy?.user_id
// //     ),

// //     createdByUsername: firstString(
// //       p?.createdByUsername,
// //       p?.created_by_username,
// //       p?.ownerUsername,
// //       p?.owner_username,
// //       p?.username,
// //       createdBy?.username,
// //       createdBy?.name,
// //       createdBy?.email
// //     ),

// //     createdByRole: firstString(
// //       p?.createdByRole,
// //       p?.created_by_role,
// //       createdBy?.role
// //     ),

// //     shopId: firstString(
// //       p?.shopId,
// //       p?.shop_id,
// //       createdBy?.shopId,
// //       createdBy?.shop_id
// //     ),

// //     shopCode: firstString(
// //       p?.shopCode,
// //       p?.shop_code,
// //       createdBy?.shopCode,
// //       createdBy?.shop_code
// //     ),
// //   };
// // }

// // function isOwnerProduct(product: Product, owner: ProductOwnerInfo) {
// //   const productUserId = String(product.createdByUserId ?? "")
// //     .trim()
// //     .toLowerCase();

// //   const productUsername = String(product.createdByUsername ?? "")
// //     .trim()
// //     .toLowerCase();

// //   const productShopId = String(product.shopId ?? "").trim().toLowerCase();
// //   const productShopCode = String(product.shopCode ?? "").trim().toLowerCase();

// //   const ownerId = String(owner.id ?? "").trim().toLowerCase();
// //   const ownerUsername = String(owner.username ?? "").trim().toLowerCase();
// //   const ownerShopId = String(owner.shopId ?? "").trim().toLowerCase();
// //   const ownerShopCode = String(owner.shopCode ?? "").trim().toLowerCase();

// //   if (ownerId && productUserId && productUserId === ownerId) return true;

// //   if (ownerUsername && productUsername && productUsername === ownerUsername) {
// //     return true;
// //   }

// //   if (ownerShopId && productShopId && productShopId === ownerShopId) {
// //     return true;
// //   }

// //   if (ownerShopCode && productShopCode && productShopCode === ownerShopCode) {
// //     return true;
// //   }

// //   return false;
// // }

// // function pickImagePath(p: Product) {
// //   return p.imagePath ?? p.image_path ?? p.product_image ?? null;
// // }

// // function buildImageUrl(path?: string | null) {
// //   if (!path) return null;

// //   const raw = String(path).trim();
// //   if (!raw) return null;

// //   if (raw.startsWith("http://") || raw.startsWith("https://")) {
// //     return raw;
// //   }

// //   const cleaned = raw.replace(/^\/?uploads\/?/, "").replace(/^\/+/, "");
// //   return `/uploads/${cleaned}`;
// // }

// // async function readErrorText(res: Response) {
// //   const ct = res.headers.get("content-type") || "";

// //   try {
// //     if (ct.includes("application/json")) {
// //       const j = await res.json();
// //       return j?.message || j?.error || JSON.stringify(j);
// //     }

// //     return (await res.text()) || "";
// //   } catch {
// //     return "";
// //   }
// // }

// // function stockLevelOf(stock: number): StockLevel {
// //   if (stock <= 0) return "out_stock";
// //   if (stock < 5) return "low_stock";
// //   return "in_stock";
// // }

// // function stockBadge(stock: number) {
// //   if (stock <= 0) {
// //     return {
// //       label: "OUT",
// //       cls: "bg-rose-500/12 text-rose-400 border-rose-500/20",
// //     };
// //   }

// //   if (stock < 5) {
// //     return {
// //       label: "LOW",
// //       cls: "bg-amber-500/12 text-amber-400 border-amber-500/20",
// //     };
// //   }

// //   return {
// //     label: "IN",
// //     cls: "bg-emerald-500/12 text-emerald-400 border-emerald-500/20",
// //   };
// // }

// // function sortProducts(items: Product[], mode: SortMode) {
// //   const arr = [...items];

// //   switch (mode) {
// //     case "name_asc":
// //       return arr.sort((a, b) => a.productName.localeCompare(b.productName));

// //     case "name_desc":
// //       return arr.sort((a, b) => b.productName.localeCompare(a.productName));

// //     case "price_desc":
// //       return arr.sort((a, b) => b.productPrice - a.productPrice);

// //     case "stock_desc":
// //       return arr.sort(
// //         (a, b) => b.productQuantityAmount - a.productQuantityAmount
// //       );

// //     case "category_asc":
// //       return arr.sort((a, b) =>
// //         String(a.category || "").localeCompare(String(b.category || ""))
// //       );

// //     default:
// //       return arr;
// //   }
// // }

// // function hashCode(str: string) {
// //   let h = 0;

// //   for (let i = 0; i < str.length; i++) {
// //     h = str.charCodeAt(i) + ((h << 5) - h);
// //   }

// //   return h;
// // }

// // function getInitials(name: string) {
// //   return String(name || "P")
// //     .split(" ")
// //     .filter(Boolean)
// //     .slice(0, 2)
// //     .map((x) => x[0]?.toUpperCase())
// //     .join("");
// // }

// // function gradientFromSeed(seed: string) {
// //   const palettes = [
// //     ["#3b82f6", "#06b6d4"],
// //     ["#8b5cf6", "#d946ef"],
// //     ["#10b981", "#06b6d4"],
// //     ["#f59e0b", "#ef4444"],
// //     ["#f43f5e", "#ec4899"],
// //     ["#6366f1", "#3b82f6"],
// //     ["#14b8a6", "#10b981"],
// //     ["#f97316", "#f59e0b"],
// //   ];

// //   return palettes[Math.abs(hashCode(seed)) % palettes.length];
// // }

// // const tk = (theme: Theme) =>
// //   theme === "dark"
// //     ? {
// //         root: "bg-[#05060d]",
// //         text: "text-[#f3e7d2]",
// //         textMuted: "text-[#bca98f]",
// //         textSubtle: "text-[#8a7a65]",
// //         card: "border-[rgba(200,137,42,0.16)] bg-[rgba(14,10,6,0.84)] backdrop-blur-xl",
// //         cardHover:
// //           "hover:border-[rgba(212,163,82,0.35)] hover:bg-[rgba(255,255,255,0.05)]",
// //         input:
// //           "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#f3e7d2] placeholder:text-[#8a7a65] focus-visible:border-[#c8892a] focus-visible:ring-[#c8892a]/20",
// //         btn: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#d4b68a] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f3e7d2]",
// //         btnPrimary:
// //           "bg-gradient-to-r from-[#a07020] to-[#d4a352] text-[#140d05] hover:from-[#b37a22] hover:to-[#deb25a] shadow-lg shadow-[#c8892a]/20",
// //         btnDanger:
// //           "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20",
// //         pill: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#bca98f]",
// //         active:
// //           "border-[rgba(212,163,82,0.55)] bg-[linear-gradient(135deg,#a07020,#d4a352)] text-[#140d05]",
// //         soft: "bg-[rgba(255,255,255,0.03)]",
// //         statChip:
// //           "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)]",
// //         modalBg:
// //           "bg-[rgba(10,8,3,0.94)] backdrop-blur-3xl border-[rgba(212,163,82,0.16)]",
// //         glow1: "bg-amber-700/[0.16]",
// //         glow2: "bg-orange-700/[0.10]",
// //         glow3: "bg-yellow-700/[0.08]",
// //       }
// //     : {
// //         root: "bg-[#f0f4ff]",
// //         text: "text-slate-900",
// //         textMuted: "text-slate-500",
// //         textSubtle: "text-slate-400",
// //         card: "border-slate-200/80 bg-white/90 shadow-[0_2px_16px_rgba(15,23,42,0.06)]",
// //         cardHover:
// //           "hover:border-slate-300 hover:shadow-[0_4px_24px_rgba(15,23,42,0.10)]",
// //         input:
// //           "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-blue-500 focus-visible:ring-blue-500/20",
// //         btn: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
// //         btnPrimary:
// //           "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/25",
// //         btnDanger: "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
// //         pill: "border-slate-200 bg-white text-slate-500 shadow-sm",
// //         active: "border-slate-900 bg-slate-900 text-white",
// //         soft: "bg-slate-50",
// //         statChip: "bg-slate-50 border-slate-200",
// //         modalBg:
// //           "bg-white/95 backdrop-blur-xl border-slate-200/80 shadow-2xl",
// //         glow1: "bg-violet-300/20",
// //         glow2: "bg-blue-300/20",
// //         glow3: "bg-cyan-300/15",
// //       };

// // function NightParticles() {
// //   const stars = Array.from({ length: 28 }).map((_, i) => ({
// //     id: i,
// //     left: `${(i * 31 + 9) % 100}%`,
// //     top: `${(i * 43 + 11) % 100}%`,
// //     size: 1.5 + (i % 3),
// //     delay: `${(i * 0.25) % 4}s`,
// //     duration: `${2.8 + (i % 4) * 0.8}s`,
// //   }));

// //   return (
// //     <div className="pointer-events-none fixed inset-0 overflow-hidden">
// //       {stars.map((s) => (
// //         <div
// //           key={s.id}
// //           className="absolute rounded-full bg-amber-100"
// //           style={{
// //             left: s.left,
// //             top: s.top,
// //             width: s.size,
// //             height: s.size,
// //             animation: `star-blink ${s.duration} ${s.delay} ease-in-out infinite`,
// //           }}
// //         />
// //       ))}
// //     </div>
// //   );
// // }

// // function ProductVisual({
// //   product,
// //   index,
// //   className,
// // }: {
// //   product: Product;
// //   index: number;
// //   className?: string;
// // }) {
// //   const imageUrl = buildImageUrl(pickImagePath(product));
// //   const [g1, g2] = gradientFromSeed(
// //     `${product.productName}-${product.sku}-${index}`
// //   );

// //   if (imageUrl) {
// //     return (
// //       <img
// //         src={imageUrl}
// //         alt={product.productName}
// //         className={cn("h-full w-full object-cover", className)}
// //         draggable={false}
// //       />
// //     );
// //   }

// //   return (
// //     <div
// //       className={cn(
// //         "flex items-center justify-center text-white font-black",
// //         className
// //       )}
// //       style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
// //     >
// //       <div className="flex flex-col items-center gap-1">
// //         <div className="rounded-2xl bg-black/15 px-3 py-2 text-lg backdrop-blur">
// //           {getInitials(product.productName || "P")}
// //         </div>
// //         <div className="text-[11px] opacity-90">{product.sku || "SKU"}</div>
// //       </div>
// //     </div>
// //   );
// // }

// // function KpiCard({
// //   theme,
// //   label,
// //   value,
// //   sub,
// //   icon: Icon,
// // }: {
// //   theme: Theme;
// //   label: string;
// //   value: string;
// //   sub: string;
// //   icon: React.ComponentType<{ className?: string }>;
// // }) {
// //   const t = tk(theme);

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 14 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       whileHover={{ y: -3, scale: 1.01 }}
// //       className={cn(
// //         "relative overflow-hidden rounded-2xl border p-3 transition-all duration-300",
// //         t.card,
// //         t.cardHover
// //       )}
// //     >
// //       <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-current opacity-[0.04] blur-3xl" />

// //       <div className="relative">
// //         <div
// //           className={cn(
// //             "mb-2 flex h-8 w-8 items-center justify-center rounded-lg border",
// //             t.statChip
// //           )}
// //         >
// //           <Icon className={cn("h-4 w-4", t.textMuted)} />
// //         </div>

// //         <div
// //           className={cn(
// //             "mb-0.5 text-[9px] font-bold uppercase tracking-[0.1em]",
// //             t.textSubtle
// //           )}
// //         >
// //           {label}
// //         </div>

// //         <div className={cn("text-[20px] font-black leading-none", t.text)}>
// //           {value}
// //         </div>

// //         <div className={cn("mt-1 text-[10px]", t.textSubtle)}>{sub}</div>
// //       </div>
// //     </motion.div>
// //   );
// // }

// // function ProductCard({
// //   product,
// //   index,
// //   theme,
// //   selected,
// //   onSelect,
// // }: {
// //   product: Product;
// //   index: number;
// //   theme: Theme;
// //   selected?: boolean;
// //   onSelect: (p: Product) => void;
// // }) {
// //   const t = tk(theme);
// //   const badge = stockBadge(product.productQuantityAmount);

// //   return (
// //     <motion.button
// //       type="button"
// //       whileHover={{ y: -3 }}
// //       onClick={() => onSelect(product)}
// //       className={cn(
// //         "w-full overflow-hidden rounded-2xl border text-left transition-all duration-200",
// //         t.card,
// //         t.cardHover,
// //         selected && "ring-2 ring-blue-500/50"
// //       )}
// //     >
// //       <div className="relative h-[125px] overflow-hidden">
// //         <ProductVisual
// //           product={product}
// //           index={index}
// //           className="absolute inset-0"
// //         />

// //         <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

// //         <div className="absolute left-2 top-2 z-10 flex gap-1.5">
// //           <Badge className={cn("border text-[10px] font-bold", badge.cls)}>
// //             {badge.label}
// //           </Badge>

// //           {Number(product.productDiscount || 0) > 0 && (
// //             <Badge className="border border-amber-500/20 bg-amber-500/12 text-amber-400 text-[10px] font-bold">
// //               -{numberFormat(Number(product.productDiscount || 0))}
// //             </Badge>
// //           )}
// //         </div>

// //         <div className="absolute right-2 top-2 z-10">
// //           <div className="rounded-full border border-white/20 bg-black/40 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur">
// //             {product.category || "UNCATEGORIZED"}
// //           </div>
// //         </div>

// //         <div className="absolute inset-x-0 bottom-0 z-10 px-3 pb-2.5">
// //           <div className="line-clamp-2 text-[13px] font-black leading-tight text-white drop-shadow-lg">
// //             {product.productName}
// //           </div>

// //           <div className="mt-0.5 font-mono text-[9px] text-white/55">
// //             {product.sku || "NO-SKU"}
// //           </div>
// //         </div>
// //       </div>

// //       <div className="px-3 pb-3 pt-2.5">
// //         <div className={cn("flex items-center gap-1.5 text-[10px]", t.textMuted)}>
// //           <Tag className="h-3 w-3 shrink-0" />
// //           {product.productType || "General Item"}
// //         </div>

// //         <div className="mt-2 grid grid-cols-3 gap-1.5">
// //           {[
// //             { label: "Price", value: shortMoney(product.productPrice) },
// //             {
// //               label: "Stock",
// //               value:
// //                 product.productQuantityAmount <= 0
// //                   ? "0"
// //                   : String(product.productQuantityAmount),
// //             },
// //             { label: "Barcode", value: product.barcode ? "YES" : "—" },
// //           ].map((item) => (
// //             <div
// //               key={item.label}
// //               className={cn("rounded-lg border px-1.5 py-1.5 text-center", t.statChip)}
// //             >
// //               <div
// //                 className={cn(
// //                   "text-[8px] font-bold uppercase tracking-wider",
// //                   t.textSubtle
// //                 )}
// //               >
// //                 {item.label}
// //               </div>

// //               <div className={cn("mt-0.5 text-[11px] font-black", t.text)}>
// //                 {item.value}
// //               </div>
// //             </div>
// //           ))}
// //         </div>

// //         <div className="mt-2 flex items-center justify-between">
// //           <div
// //             className={cn(
// //               "flex items-center gap-1 text-[10px] font-bold",
// //               product.productQuantityAmount > 0
// //                 ? "text-emerald-400"
// //                 : "text-rose-400"
// //             )}
// //           >
// //             {product.productQuantityAmount > 0 ? (
// //               <TrendingUp className="h-3 w-3" />
// //             ) : (
// //               <TrendingDown className="h-3 w-3" />
// //             )}

// //             {product.productQuantityAmount > 0 ? "Available" : "Unavailable"}
// //           </div>

// //           <ChevronRight className={cn("h-4 w-4", t.textSubtle)} />
// //         </div>
// //       </div>
// //     </motion.button>
// //   );
// // }

// // function CompactProductCard({
// //   product,
// //   index,
// //   theme,
// //   selected,
// //   onSelect,
// // }: {
// //   product: Product;
// //   index: number;
// //   theme: Theme;
// //   selected?: boolean;
// //   onSelect: (p: Product) => void;
// // }) {
// //   const t = tk(theme);
// //   const badge = stockBadge(product.productQuantityAmount);

// //   return (
// //     <motion.button
// //       type="button"
// //       whileHover={{ x: 2 }}
// //       onClick={() => onSelect(product)}
// //       className={cn(
// //         "w-full rounded-2xl border p-3 text-left transition-all duration-200",
// //         t.card,
// //         t.cardHover,
// //         selected && "ring-2 ring-blue-500/50"
// //       )}
// //     >
// //       <div className="flex items-center gap-3">
// //         <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl">
// //           <ProductVisual product={product} index={index} className="h-11 w-11" />
// //         </div>

// //         <div className="min-w-0 flex-1">
// //           <div className="flex flex-wrap items-center gap-2">
// //             <div className={cn("truncate text-[13px] font-black", t.text)}>
// //               {product.productName}
// //             </div>

// //             <span
// //               className={cn(
// //                 "rounded-full border px-2 py-0.5 text-[10px] font-bold",
// //                 badge.cls
// //               )}
// //             >
// //               {badge.label}
// //             </span>
// //           </div>

// //           <div className={cn("mt-0.5 text-[11px]", t.textMuted)}>
// //             {product.sku || "NO-SKU"} · {product.category || "UNCATEGORIZED"}
// //           </div>

// //           <div className="mt-1.5 flex items-center gap-3">
// //             <span className={cn("text-[11px] font-bold", t.text)}>
// //               {money(product.productPrice)}
// //             </span>

// //             <span className={cn("text-[10px]", t.textSubtle)}>
// //               Stock {product.productQuantityAmount}
// //             </span>
// //           </div>
// //         </div>

// //         <ChevronRight className={cn("h-4 w-4", t.textSubtle)} />
// //       </div>
// //     </motion.button>
// //   );
// // }

// // function DetailPanel({
// //   product,
// //   theme,
// //   onClose,
// //   onView,
// //   onEdit,
// //   onDelete,
// // }: {
// //   product: Product | null;
// //   theme: Theme;
// //   onClose: () => void;
// //   onView: () => void;
// //   onEdit: () => void;
// //   onDelete: () => void;
// // }) {
// //   const t = tk(theme);

// //   if (!product) {
// //     return (
// //       <div className={cn("sticky top-5 h-fit rounded-2xl border p-5", t.card)}>
// //         <div className="text-center">
// //           <Package2 className={cn("mx-auto mb-3 h-10 w-10", t.textMuted)} />
// //           <div className={cn("text-[13px] font-bold", t.text)}>
// //             No product selected
// //           </div>
// //           <div className={cn("mt-1 text-[11px]", t.textMuted)}>
// //             Product card ကိုနှိပ်ပြီး detail ကြည့်နိုင်ပါတယ်။
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   const badge = stockBadge(product.productQuantityAmount);

// //   return (
// //     <div className={cn("sticky top-5 h-fit overflow-hidden rounded-2xl border", t.card)}>
// //       <div
// //         className="flex items-center justify-between border-b px-4 py-3"
// //         style={{
// //           borderColor:
// //             theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)",
// //         }}
// //       >
// //         <div className={cn("text-[14px] font-black", t.text)}>Product Detail</div>

// //         <button onClick={onClose} className={cn("rounded-xl border p-1.5", t.btn)}>
// //           <X className="h-3.5 w-3.5" />
// //         </button>
// //       </div>

// //       <div className="space-y-3 p-4">
// //         <div className="relative h-32 overflow-hidden rounded-2xl">
// //           <ProductVisual product={product} index={0} className="absolute inset-0" />
// //           <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

// //           <div className="absolute left-3 top-3">
// //             <span
// //               className={cn(
// //                 "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
// //                 badge.cls
// //               )}
// //             >
// //               {product.productQuantityAmount > 0 ? (
// //                 <CheckCircle2 className="h-3 w-3" />
// //               ) : (
// //                 <AlertCircle className="h-3 w-3" />
// //               )}
// //               {badge.label}
// //             </span>
// //           </div>

// //           <div className="absolute bottom-0 left-0 p-3">
// //             <div className="line-clamp-2 text-[14px] font-black leading-tight text-white">
// //               {product.productName}
// //             </div>

// //             <div className="mt-1 font-mono text-[11px] text-white/60">
// //               {product.sku || "NO-SKU"}
// //             </div>
// //           </div>
// //         </div>

// //         <div className="grid grid-cols-2 gap-2">
// //           {[
// //             { label: "Price", value: money(product.productPrice), icon: Wallet },
// //             {
// //               label: "Stock",
// //               value:
// //                 product.productQuantityAmount <= 0
// //                   ? "Out of stock"
// //                   : String(product.productQuantityAmount),
// //               icon: Boxes,
// //             },
// //             { label: "Category", value: product.category || "—", icon: Tag },
// //             { label: "Type", value: product.productType || "—", icon: Layers },
// //           ].map((item) => (
// //             <div
// //               key={item.label}
// //               className={cn("rounded-xl border p-2.5", t.card, t.cardHover)}
// //             >
// //               <div
// //                 className={cn(
// //                   "mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider",
// //                   t.textSubtle
// //                 )}
// //               >
// //                 <item.icon className="h-3 w-3" />
// //                 {item.label}
// //               </div>

// //               <div className={cn("break-words text-[13px] font-black", t.text)}>
// //                 {item.value}
// //               </div>
// //             </div>
// //           ))}
// //         </div>

// //         <div className={cn("rounded-xl border p-3", t.card)}>
// //           <div
// //             className={cn(
// //               "mb-3 text-[11px] font-bold uppercase tracking-wider",
// //               t.textSubtle
// //             )}
// //           >
// //             Product Owner
// //           </div>

// //           <div className="space-y-2">
// //             <div className={cn("text-[12px]", t.textMuted)}>
// //               User ID:{" "}
// //               <span className={cn("font-bold", t.text)}>
// //                 {product.createdByUserId || "—"}
// //               </span>
// //             </div>

// //             <div className={cn("text-[12px]", t.textMuted)}>
// //               Username:{" "}
// //               <span className={cn("font-bold", t.text)}>
// //                 {product.createdByUsername || "—"}
// //               </span>
// //             </div>

// //             <div className={cn("text-[12px]", t.textMuted)}>
// //               Shop:{" "}
// //               <span className={cn("font-bold", t.text)}>
// //                 {product.shopCode || product.shopId || "—"}
// //               </span>
// //             </div>
// //           </div>
// //         </div>

// //         {product.note ? (
// //           <div className={cn("rounded-xl border p-3", t.card)}>
// //             <div
// //               className={cn(
// //                 "mb-2 text-[11px] font-bold uppercase tracking-wider",
// //                 t.textSubtle
// //               )}
// //             >
// //               Note
// //             </div>

// //             <div className={cn("text-[12px] leading-6", t.textMuted)}>
// //               {product.note}
// //             </div>
// //           </div>
// //         ) : null}

// //         <div className="flex gap-2">
// //           <button
// //             onClick={onView}
// //             className={cn("flex-1 rounded-xl py-2.5 text-[13px] font-bold", t.btnPrimary)}
// //           >
// //             View
// //           </button>

// //           <button
// //             onClick={onEdit}
// //             className={cn("rounded-xl border px-4 py-2.5 text-[13px] font-bold", t.btn)}
// //           >
// //             Edit
// //           </button>

// //           <button
// //             onClick={onDelete}
// //             className={cn("rounded-xl border px-4 py-2.5 text-[13px] font-bold", t.btnDanger)}
// //           >
// //             Delete
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // function ProductPagination({
// //   theme,
// //   currentPage,
// //   totalPages,
// //   pageSize,
// //   totalItems,
// //   startIndex,
// //   endIndex,
// //   onPageChange,
// //   onPageSizeChange,
// // }: {
// //   theme: Theme;
// //   currentPage: number;
// //   totalPages: number;
// //   pageSize: number;
// //   totalItems: number;
// //   startIndex: number;
// //   endIndex: number;
// //   onPageChange: (page: number) => void;
// //   onPageSizeChange: (size: number) => void;
// // }) {
// //   const t = tk(theme);

// //   function buildPages() {
// //     if (totalPages <= 7) {
// //       return Array.from({ length: totalPages }, (_, i) => i + 1);
// //     }

// //     if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];

// //     if (currentPage >= totalPages - 3) {
// //       return [
// //         1,
// //         "...",
// //         totalPages - 4,
// //         totalPages - 3,
// //         totalPages - 2,
// //         totalPages - 1,
// //         totalPages,
// //       ];
// //     }

// //     return [
// //       1,
// //       "...",
// //       currentPage - 1,
// //       currentPage,
// //       currentPage + 1,
// //       "...",
// //       totalPages,
// //     ];
// //   }

// //   const pages = buildPages();

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 10 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       className={cn("mt-4 rounded-2xl border p-3", t.card)}
// //     >
// //       <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
// //         <div className="flex flex-wrap items-center gap-3">
// //           <div className={cn("rounded-full border px-3 py-1.5 text-[11px] font-bold", t.pill)}>
// //             Showing {totalItems === 0 ? 0 : startIndex}-{endIndex} of {totalItems}
// //           </div>

// //           <div className={cn("flex items-center gap-2 rounded-full border px-2.5 py-1.5", t.pill)}>
// //             <span className={cn("text-[11px] font-bold", t.textMuted)}>
// //               Cards
// //             </span>

// //             {PAGE_SIZE_OPTIONS.map((size) => (
// //               <button
// //                 key={size}
// //                 type="button"
// //                 onClick={() => onPageSizeChange(size)}
// //                 className={cn(
// //                   "rounded-full px-3 py-1 text-[11px] font-bold transition-all",
// //                   pageSize === size ? t.active : "text-current"
// //                 )}
// //               >
// //                 {size}
// //               </button>
// //             ))}
// //           </div>
// //         </div>

// //         <div className="flex flex-wrap items-center gap-2">
// //           <button
// //             type="button"
// //             disabled={currentPage === 1}
// //             onClick={() => onPageChange(1)}
// //             className={cn("rounded-xl border px-3 py-2 disabled:opacity-40", t.btn)}
// //           >
// //             <ChevronsLeft className="h-4 w-4" />
// //           </button>

// //           <button
// //             type="button"
// //             disabled={currentPage === 1}
// //             onClick={() => onPageChange(currentPage - 1)}
// //             className={cn("rounded-xl border px-3 py-2 disabled:opacity-40", t.btn)}
// //           >
// //             <ChevronLeft className="h-4 w-4" />
// //           </button>

// //           <div className="flex items-center gap-2">
// //             {pages.map((page, idx) =>
// //               page === "..." ? (
// //                 <span
// //                   key={`ellipsis-${idx}`}
// //                   className={cn("px-2 text-sm font-bold", t.textSubtle)}
// //                 >
// //                   ...
// //                 </span>
// //               ) : (
// //                 <button
// //                   key={page}
// //                   type="button"
// //                   onClick={() => onPageChange(page as number)}
// //                   className={cn(
// //                     "min-w-[32px] rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all",
// //                     currentPage === page ? t.active : t.btn
// //                   )}
// //                 >
// //                   {page}
// //                 </button>
// //               )
// //             )}
// //           </div>

// //           <button
// //             type="button"
// //             disabled={currentPage === totalPages}
// //             onClick={() => onPageChange(currentPage + 1)}
// //             className={cn("rounded-xl border px-3 py-2 disabled:opacity-40", t.btn)}
// //           >
// //             <ChevronRight className="h-4 w-4" />
// //           </button>

// //           <button
// //             type="button"
// //             disabled={currentPage === totalPages}
// //             onClick={() => onPageChange(totalPages)}
// //             className={cn("rounded-xl border px-3 py-2 disabled:opacity-40", t.btn)}
// //           >
// //             <ChevronsRight className="h-4 w-4" />
// //           </button>
// //         </div>
// //       </div>
// //     </motion.div>
// //   );
// // }

// // function ConfirmDeleteModal({
// //   theme,
// //   product,
// //   loading,
// //   onClose,
// //   onConfirm,
// // }: {
// //   theme: Theme;
// //   product: Product | null;
// //   loading: boolean;
// //   onClose: () => void;
// //   onConfirm: () => void;
// // }) {
// //   const t = tk(theme);

// //   if (!product) return null;

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0 }}
// //       animate={{ opacity: 1 }}
// //       exit={{ opacity: 0 }}
// //       className="fixed inset-0 z-50 flex items-center justify-center p-4"
// //       style={{
// //         background: "rgba(0,0,0,0.6)",
// //         backdropFilter: "blur(12px)",
// //       }}
// //       onClick={(e) => e.target === e.currentTarget && onClose()}
// //     >
// //       <motion.div
// //         initial={{ scale: 0.92, y: 20 }}
// //         animate={{ scale: 1, y: 0 }}
// //         exit={{ scale: 0.92, y: 20 }}
// //         transition={{ type: "spring", damping: 22, stiffness: 280 }}
// //         className={cn("w-full max-w-[420px] overflow-hidden rounded-3xl border", t.modalBg)}
// //       >
// //         <div
// //           className="flex items-center justify-between border-b px-6 py-5"
// //           style={{
// //             borderColor:
// //               theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
// //           }}
// //         >
// //           <div>
// //             <div className={cn("text-[17px] font-black", t.text)}>
// //               Delete Product
// //             </div>

// //             <div className={cn("mt-0.5 text-[12px]", t.textMuted)}>
// //               This action cannot be undone.
// //             </div>
// //           </div>

// //           <button onClick={onClose} className={cn("rounded-xl border p-2", t.btn)}>
// //             <X className="h-4 w-4" />
// //           </button>
// //         </div>

// //         <div className="space-y-3 p-6">
// //           <div className={cn("text-[13px]", t.textMuted)}>
// //             Are you sure you want to delete
// //           </div>

// //           <div className={cn("text-[18px] font-black", t.text)}>
// //             {product.productName}
// //           </div>

// //           <div className={cn("font-mono text-[11px]", t.textSubtle)}>
// //             {product.sku}
// //           </div>
// //         </div>

// //         <div
// //           className="flex gap-3 border-t px-6 py-4"
// //           style={{
// //             borderColor:
// //               theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
// //           }}
// //         >
// //           <button
// //             onClick={onClose}
// //             className={cn("flex-1 rounded-xl border py-2.5 text-[13px] font-bold", t.btn)}
// //           >
// //             Cancel
// //           </button>

// //           <button
// //             onClick={onConfirm}
// //             disabled={loading}
// //             className={cn("flex-1 rounded-xl py-2.5 text-[13px] font-bold", t.btnDanger)}
// //           >
// //             {loading ? "Deleting..." : "Delete"}
// //           </button>
// //         </div>
// //       </motion.div>
// //     </motion.div>
// //   );
// // }

// // export default function ProductsPage() {
// //   const router = useRouter();
// //   const { data: session, status } = useSession();
// //   const { resolvedTheme, setTheme: setNextTheme } = useTheme();

// //   const token =
// //     (session as any)?.accessToken ||
// //     (session as any)?.access_token ||
// //     (session as any)?.token ||
// //     null;

// //   const ownerInfo = React.useMemo(() => normalizeOwnerInfo(session), [session]);

// //   const [products, setProducts] = React.useState<Product[]>([]);
// //   const [q, setQ] = React.useState("");
// //   const [categoryFilter, setCategoryFilter] = React.useState("All");
// //   const [stockFilter, setStockFilter] = React.useState<StockLevel>("all");
// //   const [theme, setTheme] = React.useState<Theme>("dark");
// //   const [viewMode, setViewMode] = React.useState<ViewMode>("grid");
// //   const [sortMode, setSortMode] = React.useState<SortMode>("name_asc");
// //   const [selectedId, setSelectedId] = React.useState<string | null>(null);
// //   const [panelOpen, setPanelOpen] = React.useState(true);
// //   const [notification, setNotification] = React.useState<string | null>(null);
// //   const [loading, setLoading] = React.useState(false);
// //   const [firstLoaded, setFirstLoaded] = React.useState(false);
// //   const [authError, setAuthError] = React.useState<string | null>(null);
// //   const [deleteTarget, setDeleteTarget] = React.useState<Product | null>(null);
// //   const [deletingId, setDeletingId] = React.useState<string | null>(null);
// //   const [currentPage, setCurrentPage] = React.useState(1);
// //   const [pageSize, setPageSize] = React.useState<number>(9);

// //   const t = tk(theme);

// //   function authHeaders(): Record<string, string> {
// //     return token ? { Authorization: `Bearer ${token}` } : {};
// //   }

// //   function showNotif(msg: string) {
// //     setNotification(msg);
// //     window.setTimeout(() => setNotification(null), 3000);
// //   }

// //   React.useEffect(() => {
// //     const next: Theme = resolvedTheme === "light" ? "light" : "dark";
// //     setTheme(next);
// //   }, [resolvedTheme]);

// //   React.useEffect(() => {
// //     try {
// //       const raw = localStorage.getItem(STORAGE_KEY);
// //       if (!raw) return;

// //       const p = JSON.parse(raw);

// //       if (p.viewMode) setViewMode(p.viewMode);
// //       if (p.sortMode) setSortMode(p.sortMode);
// //       if (typeof p.panelOpen === "boolean") setPanelOpen(p.panelOpen);
// //       if (p.pageSize) setPageSize(Number(p.pageSize));
// //     } catch {}
// //   }, []);

// //   React.useEffect(() => {
// //     localStorage.setItem(
// //       STORAGE_KEY,
// //       JSON.stringify({ viewMode, sortMode, panelOpen, pageSize })
// //     );
// //   }, [viewMode, sortMode, panelOpen, pageSize]);

// //   async function loadProducts(
// //     search?: string,
// //     options?: { silent?: boolean; preserveUi?: boolean }
// //   ) {
// //     if (status !== "authenticated") return;

// //     const silent = options?.silent === true;
// //     const preserveUi = options?.preserveUi === true;

// //     if (!token) {
// //       setAuthError("Session token မရပါ။ ပြန် login ဝင်ပါ။");
// //       if (!silent) toast.error("Session token မရပါ။ ပြန် login ဝင်ပါ။");
// //       return;
// //     }

// //     const tid = silent ? undefined : toast.loading("Loading products...");

// //     try {
// //       if (!silent) setLoading(true);
// //       setAuthError(null);

// //       const params = new URLSearchParams();

// //       if (search) params.set("q", search);

// //       // cache-busting: stock update ပြီး refresh နှိပ်/auto reload လုပ်ရင် browser cache မသုံးအောင်
// //       params.set("_ts", String(Date.now()));

// //       if (ownerInfo.id && isNumericId(ownerInfo.id)) {
// //         params.set("created_by_user_id", ownerInfo.id);
// //         params.set("createdByUserId", ownerInfo.id);
// //         params.set("ownerId", ownerInfo.id);
// //         params.set("userId", ownerInfo.id);
// //       }

// //       if (ownerInfo.username) {
// //         params.set("created_by_username", ownerInfo.username);
// //         params.set("createdByUsername", ownerInfo.username);
// //         params.set("ownerUsername", ownerInfo.username);
// //         params.set("username", ownerInfo.username);
// //       }

// //       if (ownerInfo.shopId) {
// //         params.set("shop_id", ownerInfo.shopId);
// //         params.set("shopId", ownerInfo.shopId);
// //       }

// //       if (ownerInfo.shopCode) {
// //         params.set("shop_code", ownerInfo.shopCode);
// //         params.set("shopCode", ownerInfo.shopCode);
// //       }

// //       const query = params.toString() ? `?${params.toString()}` : "";

// //       const res = await fetch(`/backend/api/products${query}`, {
// //         headers: {
// //           ...authHeaders(),
// //           Accept: "application/json",
// //           "Cache-Control": "no-cache",
// //         },
// //         cache: "no-store",
// //       });

// //       if (!res.ok) {
// //         const detail = await readErrorText(res);
// //         setAuthError(detail || `Error ${res.status}`);

// //         if (!silent && tid) {
// //           toast.error(detail || `Error ${res.status}`, { id: tid });
// //         }

// //         setFirstLoaded(true);
// //         return;
// //       }

// //       const raw = await res.json().catch(() => []);
// //       const arr = Array.isArray(raw) ? raw : raw?.content ?? raw?.data ?? [];
// //       const normalized = (Array.isArray(arr) ? arr : []).map(normalizeProduct);

// //       const ownerProducts = normalized.filter((product) =>
// //         isOwnerProduct(product, ownerInfo)
// //       );

// //       const safeProducts =
// //         ownerProducts.length > 0 || normalized.length === 0
// //           ? ownerProducts
// //           : normalized;

// //       setProducts(safeProducts);
// //       setFirstLoaded(true);

// //       if (!preserveUi) {
// //         setCurrentPage(1);
// //       }

// //       setSelectedId((old) => {
// //         if (old && safeProducts.some((p) => p.id === old)) return old;
// //         return safeProducts[0]?.id ?? null;
// //       });

// //       if (!silent && tid) {
// //         toast.success(`Loaded ✅ ${safeProducts.length} products`, { id: tid });
// //       }
// //     } catch {
// //       setAuthError("Server error");

// //       if (!silent && tid) {
// //         toast.error("Server error", { id: tid });
// //       }
// //     } finally {
// //       if (!silent) setLoading(false);
// //     }
// //   }

// //   async function confirmDelete() {
// //     if (!deleteTarget || status !== "authenticated" || !token) return;

// //     const tid = toast.loading("Deleting...");

// //     try {
// //       setDeletingId(deleteTarget.id);

// //       const res = await fetch(`/backend/api/products/${deleteTarget.id}`, {
// //         method: "DELETE",
// //         headers: {
// //           ...authHeaders(),
// //         },
// //       });

// //       if (!res.ok) {
// //         const detail = await readErrorText(res);
// //         toast.error(detail || "Delete failed", { id: tid });
// //         return;
// //       }

// //       setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));

// //       if (selectedId === deleteTarget.id) {
// //         setSelectedId(null);
// //       }

// //       toast.success("Deleted ✅", { id: tid });
// //       showNotif("Product deleted");
// //     } catch {
// //       toast.error("Server error", { id: tid });
// //     } finally {
// //       setDeletingId(null);
// //       setDeleteTarget(null);
// //     }
// //   }

// //   React.useEffect(() => {
// //     if (status === "authenticated") {
// //       loadProducts();
// //     }
// //   }, [
// //     status,
// //     token,
// //     ownerInfo.id,
// //     ownerInfo.username,
// //     ownerInfo.shopId,
// //     ownerInfo.shopCode,
// //   ]);

// //   // POS Register page မှာ sale လုပ်ပြီး Product page ပြန်လာတဲ့အခါ
// //   // backend ထဲက latest stock ကို auto refresh လုပ်ပေးမယ်။
// //   React.useEffect(() => {
// //     if (status !== "authenticated" || !token) return;

// //     const refreshLatestStock = () => {
// //       void loadProducts(q, { silent: true, preserveUi: true });
// //     };

// //     const onVisibilityChange = () => {
// //       if (document.visibilityState === "visible") refreshLatestStock();
// //     };

// //     window.addEventListener("focus", refreshLatestStock);
// //     window.addEventListener(PRODUCT_REFRESH_EVENT, refreshLatestStock);
// //     document.addEventListener("visibilitychange", onVisibilityChange);

// //     return () => {
// //       window.removeEventListener("focus", refreshLatestStock);
// //       window.removeEventListener(PRODUCT_REFRESH_EVENT, refreshLatestStock);
// //       document.removeEventListener("visibilitychange", onVisibilityChange);
// //     };
// //   }, [
// //     status,
// //     token,
// //     q,
// //     ownerInfo.id,
// //     ownerInfo.username,
// //     ownerInfo.shopId,
// //     ownerInfo.shopCode,
// //   ]);

// //   const categories = React.useMemo(() => {
// //     const uniq = Array.from(
// //       new Set(products.map((p) => p.category).filter(Boolean))
// //     ) as string[];

// //     return ["All", ...uniq];
// //   }, [products]);

// //   const filtered = React.useMemo(() => {
// //     const query = q.trim().toLowerCase();

// //     const base = products.filter((p) => {
// //       const matchQ =
// //         !query ||
// //         p.productName.toLowerCase().includes(query) ||
// //         p.sku.toLowerCase().includes(query) ||
// //         String(p.category || "").toLowerCase().includes(query) ||
// //         String(p.productType || "").toLowerCase().includes(query);

// //       const matchCategory =
// //         categoryFilter === "All" || p.category === categoryFilter;

// //       const level = stockLevelOf(p.productQuantityAmount);
// //       const matchStock = stockFilter === "all" || level === stockFilter;

// //       return matchQ && matchCategory && matchStock;
// //     });

// //     return sortProducts(base, sortMode);
// //   }, [products, q, categoryFilter, stockFilter, sortMode]);

// //   React.useEffect(() => {
// //     setCurrentPage(1);
// //     setSelectedId(null);
// //   }, [q, categoryFilter, stockFilter, sortMode, pageSize]);

// //   const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

// //   React.useEffect(() => {
// //     if (currentPage > totalPages) {
// //       setCurrentPage(totalPages);
// //     }
// //   }, [currentPage, totalPages]);

// //   const paginatedProducts = React.useMemo(() => {
// //     const start = (currentPage - 1) * pageSize;
// //     return filtered.slice(start, start + pageSize);
// //   }, [filtered, currentPage, pageSize]);

// //   const startIndex =
// //     filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;

// //   const endIndex = Math.min(currentPage * pageSize, filtered.length);

// //   const selectedProduct = selectedId
// //     ? filtered.find((p) => p.id === selectedId) ?? null
// //     : null;

// //   React.useEffect(() => {
// //     const firstProductOnPage = paginatedProducts[0];

// //     if (!firstProductOnPage) {
// //       setSelectedId(null);
// //       return;
// //     }

// //     const selectedExistsOnCurrentPage = selectedId
// //       ? paginatedProducts.some((p) => p.id === selectedId)
// //       : false;

// //     if (!selectedId || !selectedExistsOnCurrentPage) {
// //       setSelectedId(firstProductOnPage.id);
// //     }
// //   }, [paginatedProducts, selectedId]);

// //   const stats = React.useMemo(() => {
// //     const total = products.length;

// //     const inStock = products.filter((p) => p.productQuantityAmount > 0).length;

// //     const lowStock = products.filter(
// //       (p) => p.productQuantityAmount > 0 && p.productQuantityAmount < 5
// //     ).length;

// //     const outStock = products.filter((p) => p.productQuantityAmount <= 0).length;

// //     const totalValue = products.reduce(
// //       (a, p) => a + p.productPrice * p.productQuantityAmount,
// //       0
// //     );

// //     return {
// //       total,
// //       inStock,
// //       lowStock,
// //       outStock,
// //       totalValue,
// //     };
// //   }, [products]);

// //   const SORT_OPTIONS = [
// //     { label: "A → Z", value: "name_asc" as SortMode, icon: ArrowDownAZ },
// //     { label: "Z → A", value: "name_desc" as SortMode, icon: ArrowUpZA },
// //     { label: "Price", value: "price_desc" as SortMode, icon: Wallet },
// //     { label: "Stock", value: "stock_desc" as SortMode, icon: Boxes },
// //     { label: "Category", value: "category_asc" as SortMode, icon: Tag },
// //   ];

// //   if (status === "loading") {
// //     return (
// //       <>
// //         <FontImport />

// //         <div className="flex min-h-screen items-center justify-center bg-[#05060d] text-[#f3e7d2]">
// //           <div className="text-center">
// //             <Package2 className="mx-auto mb-4 h-10 w-10 animate-pulse text-amber-400" />
// //             <div className="text-sm font-bold">Loading session...</div>
// //           </div>
// //         </div>
// //       </>
// //     );
// //   }

// //   if (status === "unauthenticated") {
// //     return (
// //       <>
// //         <FontImport />

// //         <div className="flex min-h-screen items-center justify-center bg-[#05060d] p-6 text-[#f3e7d2]">
// //           <div className="max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
// //             <UserCircle2 className="mx-auto mb-4 h-12 w-12 text-amber-400" />
// //             <div className="text-xl font-black">Login required</div>
// //             <div className="mt-2 text-sm text-[#bca98f]">
// //               Product တွေကြည့်ဖို့ login အရင်ဝင်ပါ။
// //             </div>

// //             <button
// //               onClick={() => router.push("/login")}
// //               className="mt-6 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-black text-black"
// //             >
// //               Go Login
// //             </button>
// //           </div>
// //         </div>
// //       </>
// //     );
// //   }

// //   return (
// //     <>
// //       <FontImport />

// //       <div className={cn("relative min-h-screen transition-colors duration-500", t.root)}>
// //         {theme === "dark" && <NightParticles />}

// //         <div className="pointer-events-none fixed inset-0 overflow-hidden">
// //           <div
// //             className={cn(
// //               "absolute -top-40 left-[15%] h-[600px] w-[600px] rounded-full blur-[150px]",
// //               t.glow1
// //             )}
// //           />

// //           <div
// //             className={cn(
// //               "absolute -bottom-20 right-[-10%] h-[500px] w-[500px] rounded-full blur-[140px]",
// //               t.glow2
// //             )}
// //           />

// //           <div
// //             className={cn(
// //               "absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]",
// //               t.glow3
// //             )}
// //           />
// //         </div>

// //         <AnimatePresence>
// //           {notification && (
// //             <motion.div
// //               initial={{ opacity: 0, y: -20, scale: 0.9 }}
// //               animate={{ opacity: 1, y: 0, scale: 1 }}
// //               exit={{ opacity: 0, y: -20, scale: 0.9 }}
// //               className="fixed left-1/2 top-5 z-[100] flex -translate-x-1/2 items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-[13px] font-bold shadow-2xl"
// //               style={{
// //                 background: theme === "dark" ? "rgba(12,16,24,0.95)" : "white",
// //                 borderColor:
// //                   theme === "dark"
// //                     ? "rgba(255,255,255,0.1)"
// //                     : "rgba(0,0,0,0.1)",
// //                 color: theme === "dark" ? "white" : "#0f172a",
// //                 backdropFilter: "blur(20px)",
// //               }}
// //             >
// //               <CheckCircle2 className="h-4 w-4 text-emerald-400" />
// //               {notification}
// //             </motion.div>
// //           )}
// //         </AnimatePresence>

// //         <AnimatePresence>
// //           {deleteTarget && (
// //             <ConfirmDeleteModal
// //               theme={theme}
// //               product={deleteTarget}
// //               loading={deletingId === deleteTarget.id}
// //               onClose={() => setDeleteTarget(null)}
// //               onConfirm={confirmDelete}
// //             />
// //           )}
// //         </AnimatePresence>

// //         <main className="relative z-10 mx-auto max-w-[1500px] px-4 py-5 md:px-6 lg:px-8">
// //           <section className={cn("mb-4 overflow-hidden rounded-3xl border p-3 shadow-2xl", t.card)}>
// //             <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
// //               <div className="flex flex-wrap items-center gap-2">
// //                 <span
// //                   className={cn(
// //                     "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black",
// //                     t.active
// //                   )}
// //                 >
// //                   <Package2 className="h-3.5 w-3.5" />
// //                   Product Management
// //                 </span>

// //                 <span
// //                   className={cn(
// //                     "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold",
// //                     t.pill
// //                   )}
// //                 >
// //                   <Store className="h-3.5 w-3.5" />
// //                   My Products Only
// //                 </span>

// //                 <span
// //                   className={cn(
// //                     "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold",
// //                     t.pill
// //                   )}
// //                 >
// //                   <UserCircle2 className="h-3.5 w-3.5" />
// //                   {ownerInfo.username || ownerInfo.id || "Current User"}
// //                 </span>

// //                 {ownerInfo.shopCode || ownerInfo.shopId ? (
// //                   <span
// //                     className={cn(
// //                       "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold",
// //                       t.pill
// //                     )}
// //                   >
// //                     Shop: {ownerInfo.shopCode || ownerInfo.shopId}
// //                   </span>
// //                 ) : null}
// //               </div>

// //               <div className="flex flex-wrap items-center gap-2">
// //                 <button
// //                   type="button"
// //                   onClick={() =>
// //                     setNextTheme(resolvedTheme === "dark" ? "light" : "dark")
// //                   }
// //                   className={cn("rounded-xl border px-3 py-2 text-[12px] font-bold", t.btn)}
// //                 >
// //                   {theme === "dark" ? (
// //                     <Sun className="mr-2 inline h-4 w-4" />
// //                   ) : (
// //                     <Moon className="mr-2 inline h-4 w-4" />
// //                   )}
// //                   {theme === "dark" ? "Day" : "Night"}
// //                 </button>

// //                 <button
// //                   type="button"
// //                   onClick={() => loadProducts(q)}
// //                   className={cn("rounded-xl border px-3 py-2 text-[12px] font-bold", t.btn)}
// //                   disabled={loading}
// //                 >
// //                   <RotateCcw className={cn("mr-2 inline h-4 w-4", loading && "animate-spin")} />
// //                   Refresh
// //                 </button>

// //                 <button
// //                   type="button"
// //                   onClick={() => router.push("/dashboard/product/add")}
// //                   className={cn("rounded-xl px-3 py-2 text-[12px] font-bold", t.btnPrimary)}
// //                 >
// //                   <Plus className="mr-2 inline h-4 w-4" />
// //                   Add Product
// //                 </button>
// //               </div>
// //             </div>

// //             <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
// //               <KpiCard
// //                 theme={theme}
// //                 label="My Products"
// //                 value={numberFormat(stats.total)}
// //                 sub="current user"
// //                 icon={Package2}
// //               />

// //               <KpiCard
// //                 theme={theme}
// //                 label="In Stock"
// //                 value={numberFormat(stats.inStock)}
// //                 sub="available"
// //                 icon={CheckCircle2}
// //               />

// //               <KpiCard
// //                 theme={theme}
// //                 label="Low Stock"
// //                 value={numberFormat(stats.lowStock)}
// //                 sub="less than 5"
// //                 icon={AlertCircle}
// //               />

// //               <KpiCard
// //                 theme={theme}
// //                 label="Inventory Value"
// //                 value={shortMoney(stats.totalValue)}
// //                 sub="price × stock"
// //                 icon={Wallet}
// //               />
// //             </div>
// //           </section>

// //           <section className={cn("mb-4 rounded-2xl border p-3", t.card)}>
// //             <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto_auto] xl:items-center">
// //               <div className="relative">
// //                 <Search className={cn("absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2", t.textSubtle)} />

// //                 <Input
// //                   value={q}
// //                   onChange={(e) => setQ(e.target.value)}
// //                   onKeyDown={(e) => {
// //                     if (e.key === "Enter") loadProducts(q);
// //                   }}
// //                   placeholder="Search product name, SKU, category..."
// //                   className={cn("h-10 rounded-xl pl-10 text-[12px]", t.input)}
// //                 />
// //               </div>

// //               <div className="flex flex-wrap gap-2">
// //                 {["all", "in_stock", "low_stock", "out_stock"].map((s) => (
// //                   <button
// //                     key={s}
// //                     type="button"
// //                     onClick={() => setStockFilter(s as StockLevel)}
// //                     className={cn(
// //                       "rounded-xl border px-3 py-2 text-[11px] font-bold",
// //                       stockFilter === s ? t.active : t.btn
// //                     )}
// //                   >
// //                     {s === "all"
// //                       ? "All"
// //                       : s === "in_stock"
// //                       ? "In Stock"
// //                       : s === "low_stock"
// //                       ? "Low"
// //                       : "Out"}
// //                   </button>
// //                 ))}
// //               </div>

// //               <div className="flex flex-wrap gap-2">
// //                 {SORT_OPTIONS.map((item) => (
// //                   <button
// //                     key={item.value}
// //                     type="button"
// //                     onClick={() => setSortMode(item.value)}
// //                     className={cn(
// //                       "rounded-xl border px-2.5 py-2 text-[11px] font-bold",
// //                       sortMode === item.value ? t.active : t.btn
// //                     )}
// //                   >
// //                     <item.icon className="mr-1.5 inline h-3.5 w-3.5" />
// //                     {item.label}
// //                   </button>
// //                 ))}
// //               </div>

// //               <div className="flex gap-2">
// //                 <button
// //                   type="button"
// //                   onClick={() => setViewMode("grid")}
// //                   className={cn(
// //                     "rounded-xl border px-2.5 py-2 text-[11px] font-bold",
// //                     viewMode === "grid" ? t.active : t.btn
// //                   )}
// //                 >
// //                   <LayoutGrid className="h-4 w-4" />
// //                 </button>

// //                 <button
// //                   type="button"
// //                   onClick={() => setViewMode("compact")}
// //                   className={cn(
// //                     "rounded-xl border px-2.5 py-2 text-[11px] font-bold",
// //                     viewMode === "compact" ? t.active : t.btn
// //                   )}
// //                 >
// //                   <List className="h-4 w-4" />
// //                 </button>
// //               </div>
// //             </div>

// //             <div className="mt-4 flex flex-wrap gap-2">
// //               {categories.map((cat) => (
// //                 <button
// //                   key={cat}
// //                   type="button"
// //                   onClick={() => setCategoryFilter(cat)}
// //                   className={cn(
// //                     "rounded-full border px-3 py-1.5 text-[11px] font-bold",
// //                     categoryFilter === cat ? t.active : t.btn
// //                   )}
// //                 >
// //                   {cat}
// //                 </button>
// //               ))}
// //             </div>
// //           </section>

// //           {authError ? (
// //             <div className="mb-6 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm font-bold text-rose-400">
// //               {authError}
// //             </div>
// //           ) : null}

// //           {!firstLoaded || loading ? (
// //             <div className={cn("rounded-3xl border p-10 text-center", t.card)}>
// //               <Package2 className={cn("mx-auto mb-4 h-12 w-12 animate-pulse", t.textMuted)} />
// //               <div className={cn("font-black", t.text)}>Loading products...</div>
// //             </div>
// //           ) : products.length === 0 ? (
// //             <div className={cn("rounded-3xl border p-10 text-center", t.card)}>
// //               <Package2 className={cn("mx-auto mb-4 h-12 w-12", t.textMuted)} />

// //               <div className={cn("text-xl font-black", t.text)}>
// //                 No products for this user
// //               </div>

// //               <div className={cn("mx-auto mt-2 max-w-xl text-sm", t.textMuted)}>
// //                 Product မတွေ့ရပါ။ Backend response ထဲမှာ
// //                 `createdByUserId`, `created_by_user_id`, `createdByUsername`,
// //                 `shopId` သို့မဟုတ် `shopCode` မပါရင် frontend က safety အတွက် မပြတော့ပါ။
// //               </div>

// //               <button
// //                 onClick={() => router.push("/dashboard/product/add")}
// //                 className={cn("mt-6 rounded-2xl px-5 py-2.5 text-addsm font-bold", t.btnPrimary)}
// //               >
// //                 <Plus className="mr-2 inline h-4 w-4" />
// //                 Create Product
// //               </button>
// //             </div>
// //           ) : (
// //             <section
// //               className={cn(
// //                 "grid gap-4",
// //                 panelOpen ? "xl:grid-cols-[1fr_320px]" : "xl:grid-cols-1"
// //               )}
// //             >
// //               <div>
// //                 {paginatedProducts.length === 0 ? (
// //                   <div className={cn("rounded-3xl border p-10 text-center", t.card)}>
// //                     <Search className={cn("mx-auto mb-4 h-12 w-12", t.textMuted)} />

// //                     <div className={cn("text-xl font-black", t.text)}>
// //                       No matching products
// //                     </div>

// //                     <div className={cn("mt-2 text-sm", t.textMuted)}>
// //                       Search/filter ကို ပြန်ပြင်ပြီး စမ်းကြည့်ပါ။
// //                     </div>
// //                   </div>
// //                 ) : viewMode === "grid" ? (
// //                   <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
// //                     {paginatedProducts.map((product, index) => (
// //                       <ProductCard
// //                         key={product.id}
// //                         product={product}
// //                         index={index}
// //                         theme={theme}
// //                         selected={selectedId === product.id}
// //                         onSelect={(p) => {
// //                           setSelectedId(p.id);
// //                           setPanelOpen(true);
// //                         }}
// //                       />
// //                     ))}
// //                   </div>
// //                 ) : (
// //                   <div className="space-y-2.5">
// //                     {paginatedProducts.map((product, index) => (
// //                       <CompactProductCard
// //                         key={product.id}
// //                         product={product}
// //                         index={index}
// //                         theme={theme}
// //                         selected={selectedId === product.id}
// //                         onSelect={(p) => {
// //                           setSelectedId(p.id);
// //                           setPanelOpen(true);
// //                         }}
// //                       />
// //                     ))}
// //                   </div>
// //                 )}

// //                 <ProductPagination
// //                   theme={theme}
// //                   currentPage={currentPage}
// //                   totalPages={totalPages}
// //                   pageSize={pageSize}
// //                   totalItems={filtered.length}
// //                   startIndex={startIndex}
// //                   endIndex={endIndex}
// //                   onPageChange={(page) => {
// //                     setCurrentPage(page);
// //                     setSelectedId(null);
// //                     window.scrollTo({ top: 0, behavior: "smooth" });
// //                   }}
// //                   onPageSizeChange={(size) => {
// //                     setPageSize(size);
// //                     setCurrentPage(1);
// //                     setSelectedId(null);
// //                   }}
// //                 />
// //               </div>

// //               {panelOpen ? (
// //                 <DetailPanel
// //                   product={selectedProduct}
// //                   theme={theme}
// //                   onClose={() => setPanelOpen(false)}
// //                   onView={() => {
// //                     if (selectedProduct) {
// //                       router.push(`/dashboard/product/${selectedProduct.id}`);
// //                     }
// //                   }}
// //                   onEdit={() => {
// //                     if (selectedProduct) {
// //                       router.push(`/dashboard/product/${selectedProduct.id}/edit`);
// //                     }
// //                   }}
// //                   onDelete={() => {
// //                     if (selectedProduct) {
// //                       setDeleteTarget(selectedProduct);
// //                     }
// //                   }}
// //                 />
// //               ) : null}
// //             </section>
// //           )}
// //         </main>
// //       </div>
// //     </>
// //   );
// // }





// "use client";

// import * as React from "react";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { useTheme } from "next-themes";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Search,
//   Plus,
//   Package2,
//   Boxes,
//   LayoutGrid,
//   List,
//   RotateCcw,
//   ArrowDownAZ,
//   ArrowUpZA,
//   ChevronRight,
//   TrendingUp,
//   TrendingDown,
//   CheckCircle2,
//   AlertCircle,
//   Tag,
//   Wallet,
//   Layers,
//   Store,
//   X,
//   ChevronLeft,
//   ChevronsLeft,
//   ChevronsRight,
//   Moon,
//   Sun,
//   UserCircle2,
// } from "lucide-react";

// import { cn } from "@/lib/utils";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { toast } from "sonner";

// type Theme = "dark" | "light";
// type ViewMode = "grid" | "compact";

// type SortMode =
//   | "name_asc"
//   | "name_desc"
//   | "price_desc"
//   | "stock_desc"
//   | "category_asc";

// type StockLevel = "all" | "in_stock" | "low_stock" | "out_stock";

// type Product = {
//   id: string;
//   sku: string;
//   productName: string;
//   productPrice: number;
//   barcode?: string | null;
//   category?: string | null;
//   productQuantityAmount: number;
//   imagePath?: string | null;
//   image_path?: string | null;
//   product_image?: string | null;
//   productDiscount?: number | null;
//   note?: string | null;
//   productType?: string | null;

//   createdBy?: any;
//   createdByUserId?: string | null;
//   createdByUsername?: string | null;
//   createdByRole?: string | null;

//   shopId?: string | null;
//   shopCode?: string | null;
// };

// type ProductOwnerInfo = {
//   id: string;
//   username: string;
//   shopId: string;
//   shopCode: string;
// };

// const STORAGE_KEY = "binhlaig-product-page-owner-only-v2";
// const PRODUCT_REFRESH_EVENT = "pos-products-stock-refresh";
// const PAGE_SIZE_OPTIONS = [6, 9, 12, 18] as const;

// function FontImport() {
//   return (
//     <style>{`
//       @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;700;900&display=swap');

//       * { font-family: 'DM Sans', sans-serif; }
//       .serif { font-family: 'DM Serif Display', serif !important; }

//       @keyframes star-blink {
//         0%,100% { opacity:.2; transform: scale(.7); }
//         50% { opacity:1; transform: scale(1.25); }
//       }
//     `}</style>
//   );
// }

// function numberFormat(n: number) {
//   return new Intl.NumberFormat().format(n || 0);
// }

// function toNumber(value: unknown, fallback = 0) {
//   if (value == null || value === "") return fallback;

//   if (typeof value === "number") {
//     return Number.isFinite(value) ? value : fallback;
//   }

//   const cleaned = String(value).replaceAll(",", "").trim();
//   const n = Number(cleaned);

//   return Number.isFinite(n) ? n : fallback;
// }

// function money(n: number) {
//   return `¥${numberFormat(n || 0)}`;
// }

// function shortMoney(n: number) {
//   if (!n) return "¥0";
//   if (n >= 1_000_000) return `¥${(n / 1_000_000).toFixed(1)}M`;
//   if (n >= 1_000) return `¥${(n / 1_000).toFixed(0)}k`;
//   return `¥${n}`;
// }

// function safeParseJson(value: unknown) {
//   if (typeof value !== "string") return value;

//   try {
//     return JSON.parse(value);
//   } catch {
//     return value;
//   }
// }

// function firstString(...values: unknown[]) {
//   for (const value of values) {
//     if (value == null) continue;
//     const s = String(value).trim();
//     if (s) return s;
//   }

//   return null;
// }

// function isNumericId(value: unknown) {
//   return /^\d+$/.test(String(value ?? "").trim());
// }

// function normalizeOwnerInfo(session: unknown): ProductOwnerInfo {
//   const user = ((session as any)?.user ?? {}) as any;
//   const rawId = String(user.id ?? user.userId ?? user.staffId ?? "").trim();

//   return {
//     id: isNumericId(rawId) ? rawId : "",
//     username: String(
//       user.username ||
//         (!isNumericId(rawId) ? rawId : "") ||
//         user.name ||
//         user.email ||
//         ""
//     ).trim(),
//     shopId: user.shopId == null ? "" : String(user.shopId).trim(),
//     shopCode: String(user.shopCode ?? "").trim(),
//   };
// }

// function normalizeProduct(p: any): Product {
//   const createdBy = safeParseJson(
//     p?.createdBy ?? p?.created_by ?? p?.user_info ?? p?.owner ?? null
//   ) as any;

//   return {
//     id: String(p?.id ?? ""),
//     sku: String(p?.sku ?? p?.productSku ?? p?.product_sku ?? ""),
//     productName: String(
//       p?.productName ?? p?.product_name ?? p?.name ?? p?.title ?? ""
//     ),
//     productPrice: toNumber(p?.productPrice ?? p?.product_price ?? p?.price),
//     productQuantityAmount: toNumber(
//       p?.productQuantityAmount ??
//         p?.product_quantity_amount ??
//         p?.quantity ??
//         p?.stock
//     ),
//     barcode: p?.barcode ?? null,
//     category: p?.category ?? null,
//     productType: p?.productType ?? p?.product_type ?? null,
//     productDiscount: toNumber(
//       p?.productDiscount ?? p?.product_discount ?? p?.discount
//     ),
//     note: p?.note ?? null,

//     imagePath: p?.imagePath ?? null,
//     image_path: p?.image_path ?? null,
//     product_image: p?.product_image ?? p?.productImage ?? null,

//     createdBy,

//     createdByUserId: firstString(
//       p?.createdByUserId,
//       p?.created_by_user_id,
//       p?.created_by_id,
//       p?.ownerId,
//       p?.owner_id,
//       p?.userId,
//       p?.user_id,
//       createdBy?.id,
//       createdBy?.userId,
//       createdBy?.user_id
//     ),

//     createdByUsername: firstString(
//       p?.createdByUsername,
//       p?.created_by_username,
//       p?.ownerUsername,
//       p?.owner_username,
//       p?.username,
//       createdBy?.username,
//       createdBy?.name,
//       createdBy?.email
//     ),

//     createdByRole: firstString(
//       p?.createdByRole,
//       p?.created_by_role,
//       createdBy?.role
//     ),

//     shopId: firstString(
//       p?.shopId,
//       p?.shop_id,
//       createdBy?.shopId,
//       createdBy?.shop_id
//     ),

//     shopCode: firstString(
//       p?.shopCode,
//       p?.shop_code,
//       createdBy?.shopCode,
//       createdBy?.shop_code
//     ),
//   };
// }

// function isOwnerProduct(product: Product, owner: ProductOwnerInfo) {
//   const productUserId = String(product.createdByUserId ?? "")
//     .trim()
//     .toLowerCase();

//   const productUsername = String(product.createdByUsername ?? "")
//     .trim()
//     .toLowerCase();

//   const productShopId = String(product.shopId ?? "").trim().toLowerCase();
//   const productShopCode = String(product.shopCode ?? "").trim().toLowerCase();

//   const ownerId = String(owner.id ?? "").trim().toLowerCase();
//   const ownerUsername = String(owner.username ?? "").trim().toLowerCase();
//   const ownerShopId = String(owner.shopId ?? "").trim().toLowerCase();
//   const ownerShopCode = String(owner.shopCode ?? "").trim().toLowerCase();

//   if (ownerId && productUserId && productUserId === ownerId) return true;
//   if (ownerUsername && productUsername && productUsername === ownerUsername) return true;
//   if (ownerShopId && productShopId && productShopId === ownerShopId) return true;
//   if (ownerShopCode && productShopCode && productShopCode === ownerShopCode) return true;

//   return false;
// }

// function pickImagePath(p: Product) {
//   return p.imagePath ?? p.image_path ?? p.product_image ?? null;
// }

// function buildImageUrl(path?: string | null) {
//   if (!path) return null;

//   const raw = String(path).trim();
//   if (!raw) return null;

//   if (raw.startsWith("http://") || raw.startsWith("https://")) {
//     return raw;
//   }

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

// function stockLevelOf(stock: number): StockLevel {
//   if (stock <= 0) return "out_stock";
//   if (stock < 5) return "low_stock";
//   return "in_stock";
// }

// function stockBadge(stock: number) {
//   if (stock <= 0) {
//     return {
//       label: "OUT",
//       cls: "bg-rose-500/12 text-rose-400 border-rose-500/20",
//     };
//   }

//   if (stock < 5) {
//     return {
//       label: "LOW",
//       cls: "bg-amber-500/12 text-amber-400 border-amber-500/20",
//     };
//   }

//   return {
//     label: "IN",
//     cls: "bg-emerald-500/12 text-emerald-400 border-emerald-500/20",
//   };
// }

// function sortProducts(items: Product[], mode: SortMode) {
//   const arr = [...items];

//   switch (mode) {
//     case "name_asc":
//       return arr.sort((a, b) => a.productName.localeCompare(b.productName));

//     case "name_desc":
//       return arr.sort((a, b) => b.productName.localeCompare(a.productName));

//     case "price_desc":
//       return arr.sort((a, b) => b.productPrice - a.productPrice);

//     case "stock_desc":
//       return arr.sort(
//         (a, b) => b.productQuantityAmount - a.productQuantityAmount
//       );

//     case "category_asc":
//       return arr.sort((a, b) =>
//         String(a.category || "").localeCompare(String(b.category || ""))
//       );

//     default:
//       return arr;
//   }
// }

// function hashCode(str: string) {
//   let h = 0;

//   for (let i = 0; i < str.length; i++) {
//     h = str.charCodeAt(i) + ((h << 5) - h);
//   }

//   return h;
// }

// function getInitials(name: string) {
//   return String(name || "P")
//     .split(" ")
//     .filter(Boolean)
//     .slice(0, 2)
//     .map((x) => x[0]?.toUpperCase())
//     .join("");
// }

// function gradientFromSeed(seed: string) {
//   const palettes = [
//     ["#3b82f6", "#06b6d4"],
//     ["#8b5cf6", "#d946ef"],
//     ["#10b981", "#06b6d4"],
//     ["#f59e0b", "#ef4444"],
//     ["#f43f5e", "#ec4899"],
//     ["#6366f1", "#3b82f6"],
//     ["#14b8a6", "#10b981"],
//     ["#f97316", "#f59e0b"],
//   ];

//   return palettes[Math.abs(hashCode(seed)) % palettes.length];
// }

// const tk = (theme: Theme) =>
//   theme === "dark"
//     ? {
//         root: "bg-[#05060d]",
//         text: "text-[#f3e7d2]",
//         textMuted: "text-[#bca98f]",
//         textSubtle: "text-[#8a7a65]",
//         card: "border-[rgba(200,137,42,0.16)] bg-[rgba(14,10,6,0.84)] backdrop-blur-xl",
//         cardHover:
//           "hover:border-[rgba(212,163,82,0.35)] hover:bg-[rgba(255,255,255,0.05)]",
//         input:
//           "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#f3e7d2] placeholder:text-[#8a7a65] focus-visible:border-[#c8892a] focus-visible:ring-[#c8892a]/20",
//         btn: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#d4b68a] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f3e7d2]",
//         btnPrimary:
//           "bg-gradient-to-r from-[#a07020] to-[#d4a352] text-[#140d05] hover:from-[#b37a22] hover:to-[#deb25a] shadow-lg shadow-[#c8892a]/20",
//         btnDanger:
//           "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20",
//         pill: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#bca98f]",
//         active:
//           "border-[rgba(212,163,82,0.55)] bg-[linear-gradient(135deg,#a07020,#d4a352)] text-[#140d05]",
//         soft: "bg-[rgba(255,255,255,0.03)]",
//         statChip:
//           "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)]",
//         modalBg:
//           "bg-[rgba(10,8,3,0.94)] backdrop-blur-3xl border-[rgba(212,163,82,0.16)]",
//         glow1: "bg-amber-700/[0.16]",
//         glow2: "bg-orange-700/[0.10]",
//         glow3: "bg-yellow-700/[0.08]",
//       }
//     : {
//         root: "bg-[#f0f4ff]",
//         text: "text-slate-900",
//         textMuted: "text-slate-500",
//         textSubtle: "text-slate-400",
//         card: "border-slate-200/80 bg-white/90 shadow-[0_2px_16px_rgba(15,23,42,0.06)]",
//         cardHover:
//           "hover:border-slate-300 hover:shadow-[0_4px_24px_rgba(15,23,42,0.10)]",
//         input:
//           "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-blue-500 focus-visible:ring-blue-500/20",
//         btn: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
//         btnPrimary:
//           "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/25",
//         btnDanger: "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
//         pill: "border-slate-200 bg-white text-slate-500 shadow-sm",
//         active: "border-slate-900 bg-slate-900 text-white",
//         soft: "bg-slate-50",
//         statChip: "bg-slate-50 border-slate-200",
//         modalBg:
//           "bg-white/95 backdrop-blur-xl border-slate-200/80 shadow-2xl",
//         glow1: "bg-violet-300/20",
//         glow2: "bg-blue-300/20",
//         glow3: "bg-cyan-300/15",
//       };

// function NightParticles() {
//   const stars = Array.from({ length: 28 }).map((_, i) => ({
//     id: i,
//     left: `${(i * 31 + 9) % 100}%`,
//     top: `${(i * 43 + 11) % 100}%`,
//     size: 1.5 + (i % 3),
//     delay: `${(i * 0.25) % 4}s`,
//     duration: `${2.8 + (i % 4) * 0.8}s`,
//   }));

//   return (
//     <div className="pointer-events-none fixed inset-0 overflow-hidden">
//       {stars.map((s) => (
//         <div
//           key={s.id}
//           className="absolute rounded-full bg-amber-100"
//           style={{
//             left: s.left,
//             top: s.top,
//             width: s.size,
//             height: s.size,
//             animation: `star-blink ${s.duration} ${s.delay} ease-in-out infinite`,
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// function ProductVisual({
//   product,
//   index,
//   className,
// }: {
//   product: Product;
//   index: number;
//   className?: string;
// }) {
//   const imageUrl = buildImageUrl(pickImagePath(product));
//   const [g1, g2] = gradientFromSeed(
//     `${product.productName}-${product.sku}-${index}`
//   );

//   if (imageUrl) {
//     return (
//       <img
//         src={imageUrl}
//         alt={product.productName}
//         className={cn("h-full w-full object-cover", className)}
//         draggable={false}
//       />
//     );
//   }

//   return (
//     <div
//       className={cn(
//         "flex items-center justify-center text-white font-black",
//         className
//       )}
//       style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
//     >
//       <div className="flex flex-col items-center gap-1">
//         <div className="rounded-2xl bg-black/15 px-3 py-2 text-lg backdrop-blur">
//           {getInitials(product.productName || "P")}
//         </div>
//         <div className="text-[11px] opacity-90">{product.sku || "SKU"}</div>
//       </div>
//     </div>
//   );
// }

// function CompactSummaryBar({
//   theme,
//   stats,
// }: {
//   theme: Theme;
//   stats: {
//     total: number;
//     inStock: number;
//     lowStock: number;
//     outStock: number;
//     totalValue: number;
//   };
// }) {
//   const t = tk(theme);

//   const items = [
//     {
//       label: "Products",
//       value: numberFormat(stats.total),
//       icon: Package2,
//       color: "text-blue-400",
//     },
//     {
//       label: "In Stock",
//       value: numberFormat(stats.inStock),
//       icon: CheckCircle2,
//       color: "text-emerald-400",
//     },
//     {
//       label: "Low",
//       value: numberFormat(stats.lowStock),
//       icon: AlertCircle,
//       color: "text-amber-400",
//     },
//     {
//       label: "Out",
//       value: numberFormat(stats.outStock),
//       icon: AlertCircle,
//       color: "text-rose-400",
//     },
//     {
//       label: "Value",
//       value: shortMoney(stats.totalValue),
//       icon: Wallet,
//       color: "text-violet-400",
//     },
//   ];

//   return (
//     <div className={cn("mt-3 rounded-2xl border px-3 py-2", t.statChip)}>
//       <div className="flex flex-wrap items-center gap-2">
//         {items.map((item) => {
//           const Icon = item.icon;

//           return (
//             <div
//               key={item.label}
//               className={cn(
//                 "flex min-w-[118px] items-center gap-2 rounded-xl px-2 py-1.5",
//                 theme === "dark" ? "bg-white/[0.035]" : "bg-white"
//               )}
//             >
//               <span
//                 className={cn(
//                   "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
//                   theme === "dark" ? "bg-white/[0.06]" : "bg-slate-100"
//                 )}
//               >
//                 <Icon className={cn("h-4 w-4", item.color)} />
//               </span>

//               <div className="min-w-0">
//                 <div className={cn("text-[9px] font-black uppercase tracking-widest", t.textSubtle)}>
//                   {item.label}
//                 </div>

//                 <div className={cn("truncate text-[14px] font-black", t.text)}>
//                   {item.value}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// function ProductCard({
//   product,
//   index,
//   theme,
//   selected,
//   onSelect,
// }: {
//   product: Product;
//   index: number;
//   theme: Theme;
//   selected?: boolean;
//   onSelect: (p: Product) => void;
// }) {
//   const t = tk(theme);
//   const badge = stockBadge(product.productQuantityAmount);

//   return (
//     <motion.button
//       type="button"
//       whileHover={{ y: -3 }}
//       onClick={() => onSelect(product)}
//       className={cn(
//         "w-full overflow-hidden rounded-2xl border text-left transition-all duration-200",
//         t.card,
//         t.cardHover,
//         selected && "ring-2 ring-blue-500/50"
//       )}
//     >
//       <div className="relative h-[118px] overflow-hidden">
//         <ProductVisual
//           product={product}
//           index={index}
//           className="absolute inset-0"
//         />

//         <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

//         <div className="absolute left-2 top-2 z-10 flex gap-1.5">
//           <Badge className={cn("border text-[10px] font-bold", badge.cls)}>
//             {badge.label}
//           </Badge>

//           {Number(product.productDiscount || 0) > 0 && (
//             <Badge className="border border-amber-500/20 bg-amber-500/12 text-amber-400 text-[10px] font-bold">
//               -{numberFormat(Number(product.productDiscount || 0))}
//             </Badge>
//           )}
//         </div>

//         <div className="absolute right-2 top-2 z-10">
//           <div className="rounded-full border border-white/20 bg-black/40 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur">
//             {product.category || "UNCATEGORIZED"}
//           </div>
//         </div>

//         <div className="absolute inset-x-0 bottom-0 z-10 px-3 pb-2.5">
//           <div className="line-clamp-2 text-[13px] font-black leading-tight text-white drop-shadow-lg">
//             {product.productName}
//           </div>

//           <div className="mt-0.5 font-mono text-[9px] text-white/55">
//             {product.sku || "NO-SKU"}
//           </div>
//         </div>
//       </div>

//       <div className="px-3 pb-3 pt-2.5">
//         <div className={cn("flex items-center gap-1.5 text-[10px]", t.textMuted)}>
//           <Tag className="h-3 w-3 shrink-0" />
//           {product.productType || "General Item"}
//         </div>

//         <div className="mt-2 grid grid-cols-3 gap-1.5">
//           {[
//             { label: "Price", value: shortMoney(product.productPrice) },
//             {
//               label: "Stock",
//               value:
//                 product.productQuantityAmount <= 0
//                   ? "0"
//                   : String(product.productQuantityAmount),
//             },
//             { label: "Barcode", value: product.barcode ? "YES" : "—" },
//           ].map((item) => (
//             <div
//               key={item.label}
//               className={cn("rounded-lg border px-1.5 py-1.5 text-center", t.statChip)}
//             >
//               <div
//                 className={cn(
//                   "text-[8px] font-bold uppercase tracking-wider",
//                   t.textSubtle
//                 )}
//               >
//                 {item.label}
//               </div>

//               <div className={cn("mt-0.5 text-[11px] font-black", t.text)}>
//                 {item.value}
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="mt-2 flex items-center justify-between">
//           <div
//             className={cn(
//               "flex items-center gap-1 text-[10px] font-bold",
//               product.productQuantityAmount > 0
//                 ? "text-emerald-400"
//                 : "text-rose-400"
//             )}
//           >
//             {product.productQuantityAmount > 0 ? (
//               <TrendingUp className="h-3 w-3" />
//             ) : (
//               <TrendingDown className="h-3 w-3" />
//             )}

//             {product.productQuantityAmount > 0 ? "Available" : "Unavailable"}
//           </div>

//           <ChevronRight className={cn("h-4 w-4", t.textSubtle)} />
//         </div>
//       </div>
//     </motion.button>
//   );
// }

// function CompactProductCard({
//   product,
//   index,
//   theme,
//   selected,
//   onSelect,
// }: {
//   product: Product;
//   index: number;
//   theme: Theme;
//   selected?: boolean;
//   onSelect: (p: Product) => void;
// }) {
//   const t = tk(theme);
//   const badge = stockBadge(product.productQuantityAmount);

//   return (
//     <motion.button
//       type="button"
//       whileHover={{ x: 2 }}
//       onClick={() => onSelect(product)}
//       className={cn(
//         "w-full rounded-2xl border p-3 text-left transition-all duration-200",
//         t.card,
//         t.cardHover,
//         selected && "ring-2 ring-blue-500/50"
//       )}
//     >
//       <div className="flex items-center gap-3">
//         <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl">
//           <ProductVisual product={product} index={index} className="h-11 w-11" />
//         </div>

//         <div className="min-w-0 flex-1">
//           <div className="flex flex-wrap items-center gap-2">
//             <div className={cn("truncate text-[13px] font-black", t.text)}>
//               {product.productName}
//             </div>

//             <span
//               className={cn(
//                 "rounded-full border px-2 py-0.5 text-[10px] font-bold",
//                 badge.cls
//               )}
//             >
//               {badge.label}
//             </span>
//           </div>

//           <div className={cn("mt-0.5 text-[11px]", t.textMuted)}>
//             {product.sku || "NO-SKU"} · {product.category || "UNCATEGORIZED"}
//           </div>

//           <div className="mt-1.5 flex items-center gap-3">
//             <span className={cn("text-[11px] font-bold", t.text)}>
//               {money(product.productPrice)}
//             </span>

//             <span className={cn("text-[10px]", t.textSubtle)}>
//               Stock {product.productQuantityAmount}
//             </span>
//           </div>
//         </div>

//         <ChevronRight className={cn("h-4 w-4", t.textSubtle)} />
//       </div>
//     </motion.button>
//   );
// }

// function ProductDetailDialog({
//   product,
//   theme,
//   onClose,
//   onView,
//   onEdit,
//   onDelete,
// }: {
//   product: Product | null;
//   theme: Theme;
//   onClose: () => void;
//   onView: () => void;
//   onEdit: () => void;
//   onDelete: () => void;
// }) {
//   const t = tk(theme);

//   if (!product) return null;

//   const badge = stockBadge(product.productQuantityAmount);

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-50 flex items-center justify-center p-4"
//       style={{
//         background: "rgba(0,0,0,0.62)",
//         backdropFilter: "blur(12px)",
//       }}
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <motion.div
//         initial={{ scale: 0.94, y: 18 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.94, y: 18 }}
//         transition={{ duration: 0.18 }}
//         className={cn("w-full max-w-[720px] overflow-hidden rounded-3xl border", t.modalBg)}
//       >
//         <div
//           className="flex items-start justify-between gap-4 border-b px-5 py-4"
//           style={{
//             borderColor:
//               theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
//           }}
//         >
//           <div>
//             <div className={cn("text-[11px] font-black uppercase tracking-widest", t.textSubtle)}>
//               Product Detail
//             </div>

//             <h2 className={cn("mt-1 text-xl font-black", t.text)}>
//               {product.productName}
//             </h2>

//             <div className={cn("mt-1 font-mono text-[11px]", t.textMuted)}>
//               {product.sku || "NO-SKU"}
//             </div>
//           </div>

//           <button onClick={onClose} className={cn("rounded-xl border p-2", t.btn)}>
//             <X className="h-4 w-4" />
//           </button>
//         </div>

//         <div className="max-h-[72vh] overflow-y-auto p-5">
//           <div className="grid gap-4 md:grid-cols-[240px_1fr]">
//             <div className="relative h-[210px] overflow-hidden rounded-2xl">
//               <ProductVisual product={product} index={0} className="absolute inset-0" />
//               <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

//               <div className="absolute left-3 top-3">
//                 <span
//                   className={cn(
//                     "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
//                     badge.cls
//                   )}
//                 >
//                   {product.productQuantityAmount > 0 ? (
//                     <CheckCircle2 className="h-3 w-3" />
//                   ) : (
//                     <AlertCircle className="h-3 w-3" />
//                   )}
//                   {badge.label}
//                 </span>
//               </div>
//             </div>

//             <div className="grid gap-2 sm:grid-cols-2">
//               {[
//                 { label: "Price", value: money(product.productPrice), icon: Wallet },
//                 {
//                   label: "Stock",
//                   value:
//                     product.productQuantityAmount <= 0
//                       ? "Out of stock"
//                       : String(product.productQuantityAmount),
//                   icon: Boxes,
//                 },
//                 { label: "Category", value: product.category || "—", icon: Tag },
//                 { label: "Type", value: product.productType || "—", icon: Layers },
//                 { label: "Barcode", value: product.barcode || "—", icon: Tag },
//                 {
//                   label: "Shop",
//                   value: product.shopCode || product.shopId || "—",
//                   icon: Store,
//                 },
//               ].map((item) => (
//                 <div key={item.label} className={cn("rounded-xl border p-3", t.statChip)}>
//                   <div className={cn("mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider", t.textSubtle)}>
//                     <item.icon className="h-3 w-3" />
//                     {item.label}
//                   </div>

//                   <div className={cn("break-words text-[13px] font-black", t.text)}>
//                     {item.value}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className={cn("mt-4 rounded-xl border p-3", t.statChip)}>
//             <div className={cn("mb-2 text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>
//               Product Owner
//             </div>

//             <div className="grid gap-2 sm:grid-cols-3">
//               <div className={cn("text-[12px]", t.textMuted)}>
//                 User ID:{" "}
//                 <span className={cn("font-bold", t.text)}>
//                   {product.createdByUserId || "—"}
//                 </span>
//               </div>

//               <div className={cn("text-[12px]", t.textMuted)}>
//                 Username:{" "}
//                 <span className={cn("font-bold", t.text)}>
//                   {product.createdByUsername || "—"}
//                 </span>
//               </div>

//               <div className={cn("text-[12px]", t.textMuted)}>
//                 Role:{" "}
//                 <span className={cn("font-bold", t.text)}>
//                   {product.createdByRole || "—"}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {product.note ? (
//             <div className={cn("mt-4 rounded-xl border p-3", t.statChip)}>
//               <div className={cn("mb-2 text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>
//                 Note
//               </div>

//               <div className={cn("text-[12px] leading-6", t.textMuted)}>
//                 {product.note}
//               </div>
//             </div>
//           ) : null}
//         </div>

//         <div
//           className="flex flex-wrap justify-end gap-2 border-t px-5 py-4"
//           style={{
//             borderColor:
//               theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
//           }}
//         >
//           <button onClick={onClose} className={cn("rounded-xl border px-4 py-2 text-[13px] font-bold", t.btn)}>
//             Close
//           </button>

//           <button onClick={onView} className={cn("rounded-xl px-4 py-2 text-[13px] font-bold", t.btnPrimary)}>
//             View
//           </button>

//           <button onClick={onEdit} className={cn("rounded-xl border px-4 py-2 text-[13px] font-bold", t.btn)}>
//             Edit
//           </button>

//           <button onClick={onDelete} className={cn("rounded-xl border px-4 py-2 text-[13px] font-bold", t.btnDanger)}>
//             Delete
//           </button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// function ProductPagination({
//   theme,
//   currentPage,
//   totalPages,
//   pageSize,
//   totalItems,
//   startIndex,
//   endIndex,
//   onPageChange,
//   onPageSizeChange,
// }: {
//   theme: Theme;
//   currentPage: number;
//   totalPages: number;
//   pageSize: number;
//   totalItems: number;
//   startIndex: number;
//   endIndex: number;
//   onPageChange: (page: number) => void;
//   onPageSizeChange: (size: number) => void;
// }) {
//   const t = tk(theme);

//   function buildPages() {
//     if (totalPages <= 7) {
//       return Array.from({ length: totalPages }, (_, i) => i + 1);
//     }

//     if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];

//     if (currentPage >= totalPages - 3) {
//       return [
//         1,
//         "...",
//         totalPages - 4,
//         totalPages - 3,
//         totalPages - 2,
//         totalPages - 1,
//         totalPages,
//       ];
//     }

//     return [
//       1,
//       "...",
//       currentPage - 1,
//       currentPage,
//       currentPage + 1,
//       "...",
//       totalPages,
//     ];
//   }

//   const pages = buildPages();

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       className={cn("mt-4 rounded-2xl border p-3", t.card)}
//     >
//       <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
//         <div className="flex flex-wrap items-center gap-3">
//           <div className={cn("rounded-full border px-3 py-1.5 text-[11px] font-bold", t.pill)}>
//             Showing {totalItems === 0 ? 0 : startIndex}-{endIndex} of {totalItems}
//           </div>

//           <div className={cn("flex items-center gap-2 rounded-full border px-2.5 py-1.5", t.pill)}>
//             <span className={cn("text-[11px] font-bold", t.textMuted)}>
//               Cards
//             </span>

//             {PAGE_SIZE_OPTIONS.map((size) => (
//               <button
//                 key={size}
//                 type="button"
//                 onClick={() => onPageSizeChange(size)}
//                 className={cn(
//                   "rounded-full px-3 py-1 text-[11px] font-bold transition-all",
//                   pageSize === size ? t.active : "text-current"
//                 )}
//               >
//                 {size}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           <button
//             type="button"
//             disabled={currentPage === 1}
//             onClick={() => onPageChange(1)}
//             className={cn("rounded-xl border px-3 py-2 disabled:opacity-40", t.btn)}
//           >
//             <ChevronsLeft className="h-4 w-4" />
//           </button>

//           <button
//             type="button"
//             disabled={currentPage === 1}
//             onClick={() => onPageChange(currentPage - 1)}
//             className={cn("rounded-xl border px-3 py-2 disabled:opacity-40", t.btn)}
//           >
//             <ChevronLeft className="h-4 w-4" />
//           </button>

//           <div className="flex items-center gap-2">
//             {pages.map((page, idx) =>
//               page === "..." ? (
//                 <span
//                   key={`ellipsis-${idx}`}
//                   className={cn("px-2 text-sm font-bold", t.textSubtle)}
//                 >
//                   ...
//                 </span>
//               ) : (
//                 <button
//                   key={page}
//                   type="button"
//                   onClick={() => onPageChange(page as number)}
//                   className={cn(
//                     "min-w-[32px] rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all",
//                     currentPage === page ? t.active : t.btn
//                   )}
//                 >
//                   {page}
//                 </button>
//               )
//             )}
//           </div>

//           <button
//             type="button"
//             disabled={currentPage === totalPages}
//             onClick={() => onPageChange(currentPage + 1)}
//             className={cn("rounded-xl border px-3 py-2 disabled:opacity-40", t.btn)}
//           >
//             <ChevronRight className="h-4 w-4" />
//           </button>

//           <button
//             type="button"
//             disabled={currentPage === totalPages}
//             onClick={() => onPageChange(totalPages)}
//             className={cn("rounded-xl border px-3 py-2 disabled:opacity-40", t.btn)}
//           >
//             <ChevronsRight className="h-4 w-4" />
//           </button>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// function ConfirmDeleteModal({
//   theme,
//   product,
//   loading,
//   onClose,
//   onConfirm,
// }: {
//   theme: Theme;
//   product: Product | null;
//   loading: boolean;
//   onClose: () => void;
//   onConfirm: () => void;
// }) {
//   const t = tk(theme);

//   if (!product) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[60] flex items-center justify-center p-4"
//       style={{
//         background: "rgba(0,0,0,0.6)",
//         backdropFilter: "blur(12px)",
//       }}
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <motion.div
//         initial={{ scale: 0.92, y: 20 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.92, y: 20 }}
//         transition={{ type: "spring", damping: 22, stiffness: 280 }}
//         className={cn("w-full max-w-[420px] overflow-hidden rounded-3xl border", t.modalBg)}
//       >
//         <div
//           className="flex items-center justify-between border-b px-6 py-5"
//           style={{
//             borderColor:
//               theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
//           }}
//         >
//           <div>
//             <div className={cn("text-[17px] font-black", t.text)}>
//               Delete Product
//             </div>

//             <div className={cn("mt-0.5 text-[12px]", t.textMuted)}>
//               This action cannot be undone.
//             </div>
//           </div>

//           <button onClick={onClose} className={cn("rounded-xl border p-2", t.btn)}>
//             <X className="h-4 w-4" />
//           </button>
//         </div>

//         <div className="space-y-3 p-6">
//           <div className={cn("text-[13px]", t.textMuted)}>
//             Are you sure you want to delete
//           </div>

//           <div className={cn("text-[18px] font-black", t.text)}>
//             {product.productName}
//           </div>

//           <div className={cn("font-mono text-[11px]", t.textSubtle)}>
//             {product.sku}
//           </div>
//         </div>

//         <div
//           className="flex gap-3 border-t px-6 py-4"
//           style={{
//             borderColor:
//               theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
//           }}
//         >
//           <button
//             onClick={onClose}
//             className={cn("flex-1 rounded-xl border py-2.5 text-[13px] font-bold", t.btn)}
//           >
//             Cancel
//           </button>

//           <button
//             onClick={onConfirm}
//             disabled={loading}
//             className={cn("flex-1 rounded-xl py-2.5 text-[13px] font-bold", t.btnDanger)}
//           >
//             {loading ? "Deleting..." : "Delete"}
//           </button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

// export default function ProductsPage() {
//   const router = useRouter();
//   const { data: session, status } = useSession();
//   const { resolvedTheme, setTheme: setNextTheme } = useTheme();

//   const token =
//     (session as any)?.accessToken ||
//     (session as any)?.access_token ||
//     (session as any)?.token ||
//     null;

//   const ownerInfo = React.useMemo(() => normalizeOwnerInfo(session), [session]);

//   const [products, setProducts] = React.useState<Product[]>([]);
//   const [q, setQ] = React.useState("");
//   const [categoryFilter, setCategoryFilter] = React.useState("All");
//   const [stockFilter, setStockFilter] = React.useState<StockLevel>("all");
//   const [theme, setTheme] = React.useState<Theme>("dark");
//   const [viewMode, setViewMode] = React.useState<ViewMode>("compact");
//   const [sortMode, setSortMode] = React.useState<SortMode>("name_asc");
//   const [selectedId, setSelectedId] = React.useState<string | null>(null);
//   const [panelOpen, setPanelOpen] = React.useState(false);
//   const [notification, setNotification] = React.useState<string | null>(null);
//   const [loading, setLoading] = React.useState(false);
//   const [firstLoaded, setFirstLoaded] = React.useState(false);
//   const [authError, setAuthError] = React.useState<string | null>(null);
//   const [deleteTarget, setDeleteTarget] = React.useState<Product | null>(null);
//   const [deletingId, setDeletingId] = React.useState<string | null>(null);
//   const [currentPage, setCurrentPage] = React.useState(1);
//   const [pageSize, setPageSize] = React.useState<number>(9);

//   const t = tk(theme);

//   function authHeaders(): Record<string, string> {
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   }

//   function showNotif(msg: string) {
//     setNotification(msg);
//     window.setTimeout(() => setNotification(null), 3000);
//   }

//   React.useEffect(() => {
//     const next: Theme = resolvedTheme === "light" ? "light" : "dark";
//     setTheme(next);
//   }, [resolvedTheme]);

//   React.useEffect(() => {
//     try {
//       const raw = localStorage.getItem(STORAGE_KEY);
//       if (!raw) return;

//       const p = JSON.parse(raw);

//       if (p.viewMode) setViewMode(p.viewMode);
//       if (p.sortMode) setSortMode(p.sortMode);
//       if (p.pageSize) setPageSize(Number(p.pageSize));
//     } catch {}
//   }, []);

//   React.useEffect(() => {
//     localStorage.setItem(
//       STORAGE_KEY,
//       JSON.stringify({ viewMode, sortMode, panelOpen, pageSize })
//     );
//   }, [viewMode, sortMode, panelOpen, pageSize]);

//   async function loadProducts(
//     search?: string,
//     options?: { silent?: boolean; preserveUi?: boolean }
//   ) {
//     if (status !== "authenticated") return;

//     const silent = options?.silent === true;
//     const preserveUi = options?.preserveUi === true;

//     if (!token) {
//       setAuthError("Session token မရပါ။ ပြန် login ဝင်ပါ။");
//       if (!silent) toast.error("Session token မရပါ။ ပြန် login ဝင်ပါ။");
//       return;
//     }

//     const tid = silent ? undefined : toast.loading("Loading products...");

//     try {
//       if (!silent) setLoading(true);
//       setAuthError(null);

//       const params = new URLSearchParams();

//       if (search) params.set("q", search);

//       params.set("_ts", String(Date.now()));

//       if (ownerInfo.id && isNumericId(ownerInfo.id)) {
//         params.set("created_by_user_id", ownerInfo.id);
//         params.set("createdByUserId", ownerInfo.id);
//         params.set("ownerId", ownerInfo.id);
//         params.set("userId", ownerInfo.id);
//       }

//       if (ownerInfo.username) {
//         params.set("created_by_username", ownerInfo.username);
//         params.set("createdByUsername", ownerInfo.username);
//         params.set("ownerUsername", ownerInfo.username);
//         params.set("username", ownerInfo.username);
//       }

//       if (ownerInfo.shopId) {
//         params.set("shop_id", ownerInfo.shopId);
//         params.set("shopId", ownerInfo.shopId);
//       }

//       if (ownerInfo.shopCode) {
//         params.set("shop_code", ownerInfo.shopCode);
//         params.set("shopCode", ownerInfo.shopCode);
//       }

//       const query = params.toString() ? `?${params.toString()}` : "";

//       const res = await fetch(`/backend/api/products${query}`, {
//         headers: {
//           ...authHeaders(),
//           Accept: "application/json",
//           "Cache-Control": "no-cache",
//         },
//         cache: "no-store",
//       });

//       if (!res.ok) {
//         const detail = await readErrorText(res);
//         setAuthError(detail || `Error ${res.status}`);

//         if (!silent && tid) {
//           toast.error(detail || `Error ${res.status}`, { id: tid });
//         }

//         setFirstLoaded(true);
//         return;
//       }

//       const raw = await res.json().catch(() => []);
//       const arr = Array.isArray(raw) ? raw : raw?.content ?? raw?.data ?? [];
//       const normalized = (Array.isArray(arr) ? arr : []).map(normalizeProduct);

//       const ownerProducts = normalized.filter((product) =>
//         isOwnerProduct(product, ownerInfo)
//       );

//       const safeProducts =
//         ownerProducts.length > 0 || normalized.length === 0
//           ? ownerProducts
//           : normalized;

//       setProducts(safeProducts);
//       setFirstLoaded(true);

//       if (!preserveUi) {
//         setCurrentPage(1);
//       }

//       setSelectedId((old) => {
//         if (old && safeProducts.some((p) => p.id === old)) return old;
//         return null;
//       });

//       if (!silent && tid) {
//         toast.success(`Loaded ✅ ${safeProducts.length} products`, { id: tid });
//       }
//     } catch {
//       setAuthError("Server error");

//       if (!silent && tid) {
//         toast.error("Server error", { id: tid });
//       }
//     } finally {
//       if (!silent) setLoading(false);
//     }
//   }

//   async function confirmDelete() {
//     if (!deleteTarget || status !== "authenticated" || !token) return;

//     const tid = toast.loading("Deleting...");

//     try {
//       setDeletingId(deleteTarget.id);

//       const res = await fetch(`/backend/api/products/${deleteTarget.id}`, {
//         method: "DELETE",
//         headers: {
//           ...authHeaders(),
//         },
//       });

//       if (!res.ok) {
//         const detail = await readErrorText(res);
//         toast.error(detail || "Delete failed", { id: tid });
//         return;
//       }

//       setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));

//       if (selectedId === deleteTarget.id) {
//         setSelectedId(null);
//       }

//       toast.success("Deleted ✅", { id: tid });
//       showNotif("Product deleted");
//     } catch {
//       toast.error("Server error", { id: tid });
//     } finally {
//       setDeletingId(null);
//       setDeleteTarget(null);
//     }
//   }

//   React.useEffect(() => {
//     if (status === "authenticated") {
//       loadProducts();
//     }
//   }, [
//     status,
//     token,
//     ownerInfo.id,
//     ownerInfo.username,
//     ownerInfo.shopId,
//     ownerInfo.shopCode,
//   ]);

//   React.useEffect(() => {
//     if (status !== "authenticated" || !token) return;

//     const refreshLatestStock = () => {
//       void loadProducts(q, { silent: true, preserveUi: true });
//     };

//     const onVisibilityChange = () => {
//       if (document.visibilityState === "visible") refreshLatestStock();
//     };

//     window.addEventListener("focus", refreshLatestStock);
//     window.addEventListener(PRODUCT_REFRESH_EVENT, refreshLatestStock);
//     document.addEventListener("visibilitychange", onVisibilityChange);

//     return () => {
//       window.removeEventListener("focus", refreshLatestStock);
//       window.removeEventListener(PRODUCT_REFRESH_EVENT, refreshLatestStock);
//       document.removeEventListener("visibilitychange", onVisibilityChange);
//     };
//   }, [
//     status,
//     token,
//     q,
//     ownerInfo.id,
//     ownerInfo.username,
//     ownerInfo.shopId,
//     ownerInfo.shopCode,
//   ]);

//   const categories = React.useMemo(() => {
//     const uniq = Array.from(
//       new Set(products.map((p) => p.category).filter(Boolean))
//     ) as string[];

//     return ["All", ...uniq];
//   }, [products]);

//   const filtered = React.useMemo(() => {
//     const query = q.trim().toLowerCase();

//     const base = products.filter((p) => {
//       const matchQ =
//         !query ||
//         p.productName.toLowerCase().includes(query) ||
//         p.sku.toLowerCase().includes(query) ||
//         String(p.category || "").toLowerCase().includes(query) ||
//         String(p.productType || "").toLowerCase().includes(query);

//       const matchCategory =
//         categoryFilter === "All" || p.category === categoryFilter;

//       const level = stockLevelOf(p.productQuantityAmount);
//       const matchStock = stockFilter === "all" || level === stockFilter;

//       return matchQ && matchCategory && matchStock;
//     });

//     return sortProducts(base, sortMode);
//   }, [products, q, categoryFilter, stockFilter, sortMode]);

//   React.useEffect(() => {
//     setCurrentPage(1);
//     setSelectedId(null);
//     setPanelOpen(false);
//   }, [q, categoryFilter, stockFilter, sortMode, pageSize]);

//   const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

//   React.useEffect(() => {
//     if (currentPage > totalPages) {
//       setCurrentPage(totalPages);
//     }
//   }, [currentPage, totalPages]);

//   const paginatedProducts = React.useMemo(() => {
//     const start = (currentPage - 1) * pageSize;
//     return filtered.slice(start, start + pageSize);
//   }, [filtered, currentPage, pageSize]);

//   const startIndex =
//     filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;

//   const endIndex = Math.min(currentPage * pageSize, filtered.length);

//   const selectedProduct = selectedId
//     ? filtered.find((p) => p.id === selectedId) ?? null
//     : null;

//   const stats = React.useMemo(() => {
//     const total = products.length;

//     const inStock = products.filter((p) => p.productQuantityAmount > 0).length;

//     const lowStock = products.filter(
//       (p) => p.productQuantityAmount > 0 && p.productQuantityAmount < 5
//     ).length;

//     const outStock = products.filter((p) => p.productQuantityAmount <= 0).length;

//     const totalValue = products.reduce(
//       (a, p) => a + p.productPrice * p.productQuantityAmount,
//       0
//     );

//     return {
//       total,
//       inStock,
//       lowStock,
//       outStock,
//       totalValue,
//     };
//   }, [products]);

//   const SORT_OPTIONS = [
//     { label: "A → Z", value: "name_asc" as SortMode, icon: ArrowDownAZ },
//     { label: "Z → A", value: "name_desc" as SortMode, icon: ArrowUpZA },
//     { label: "Price", value: "price_desc" as SortMode, icon: Wallet },
//     { label: "Stock", value: "stock_desc" as SortMode, icon: Boxes },
//     { label: "Category", value: "category_asc" as SortMode, icon: Tag },
//   ];

//   if (status === "loading") {
//     return (
//       <>
//         <FontImport />

//         <div className="flex min-h-screen items-center justify-center bg-[#05060d] text-[#f3e7d2]">
//           <div className="text-center">
//             <Package2 className="mx-auto mb-4 h-10 w-10 animate-pulse text-amber-400" />
//             <div className="text-sm font-bold">Loading session...</div>
//           </div>
//         </div>
//       </>
//     );
//   }

//   if (status === "unauthenticated") {
//     return (
//       <>
//         <FontImport />

//         <div className="flex min-h-screen items-center justify-center bg-[#05060d] p-6 text-[#f3e7d2]">
//           <div className="max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
//             <UserCircle2 className="mx-auto mb-4 h-12 w-12 text-amber-400" />
//             <div className="text-xl font-black">Login required</div>
//             <div className="mt-2 text-sm text-[#bca98f]">
//               Product တွေကြည့်ဖို့ login အရင်ဝင်ပါ။
//             </div>

//             <button
//               onClick={() => router.push("/login")}
//               className="mt-6 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-black text-black"
//             >
//               Go Login
//             </button>
//           </div>
//         </div>
//       </>
//     );
//   }

//   return (
//     <>
//       <FontImport />

//       <div className={cn("relative min-h-screen transition-colors duration-500", t.root)}>
//         {theme === "dark" && <NightParticles />}

//         <div className="pointer-events-none fixed inset-0 overflow-hidden">
//           <div
//             className={cn(
//               "absolute -top-40 left-[15%] h-[600px] w-[600px] rounded-full blur-[150px]",
//               t.glow1
//             )}
//           />

//           <div
//             className={cn(
//               "absolute -bottom-20 right-[-10%] h-[500px] w-[500px] rounded-full blur-[140px]",
//               t.glow2
//             )}
//           />

//           <div
//             className={cn(
//               "absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]",
//               t.glow3
//             )}
//           />
//         </div>

//         <AnimatePresence>
//           {notification && (
//             <motion.div
//               initial={{ opacity: 0, y: -20, scale: 0.9 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: -20, scale: 0.9 }}
//               className="fixed left-1/2 top-5 z-[100] flex -translate-x-1/2 items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-[13px] font-bold shadow-2xl"
//               style={{
//                 background: theme === "dark" ? "rgba(12,16,24,0.95)" : "white",
//                 borderColor:
//                   theme === "dark"
//                     ? "rgba(255,255,255,0.1)"
//                     : "rgba(0,0,0,0.1)",
//                 color: theme === "dark" ? "white" : "#0f172a",
//                 backdropFilter: "blur(20px)",
//               }}
//             >
//               <CheckCircle2 className="h-4 w-4 text-emerald-400" />
//               {notification}
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <AnimatePresence>
//           {deleteTarget && (
//             <ConfirmDeleteModal
//               theme={theme}
//               product={deleteTarget}
//               loading={deletingId === deleteTarget.id}
//               onClose={() => setDeleteTarget(null)}
//               onConfirm={confirmDelete}
//             />
//           )}
//         </AnimatePresence>

//         <AnimatePresence>
//           {panelOpen && selectedProduct ? (
//             <ProductDetailDialog
//               product={selectedProduct}
//               theme={theme}
//               onClose={() => setPanelOpen(false)}
//               onView={() => {
//                 router.push(`/dashboard/product/${selectedProduct.id}`);
//               }}
//               onEdit={() => {
//                 router.push(`/dashboard/product/${selectedProduct.id}/edit`);
//               }}
//               onDelete={() => {
//                 setDeleteTarget(selectedProduct);
//                 setPanelOpen(false);
//               }}
//             />
//           ) : null}
//         </AnimatePresence>

//         <main className="relative z-10 mx-auto max-w-[1500px] px-4 py-5 md:px-6 lg:px-8">
//           <section className={cn("mb-4 overflow-hidden rounded-3xl border p-3 shadow-2xl", t.card)}>
//             <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
//               <div className="flex flex-wrap items-center gap-2">
//                 <span
//                   className={cn(
//                     "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black",
//                     t.active
//                   )}
//                 >
//                   <Package2 className="h-3.5 w-3.5" />
//                   Product Management
//                 </span>

//                 <span
//                   className={cn(
//                     "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold",
//                     t.pill
//                   )}
//                 >
//                   <Store className="h-3.5 w-3.5" />
//                   My Products Only
//                 </span>

//                 <span
//                   className={cn(
//                     "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold",
//                     t.pill
//                   )}
//                 >
//                   <UserCircle2 className="h-3.5 w-3.5" />
//                   {ownerInfo.username || ownerInfo.id || "Current User"}
//                 </span>

//                 {ownerInfo.shopCode || ownerInfo.shopId ? (
//                   <span
//                     className={cn(
//                       "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold",
//                       t.pill
//                     )}
//                   >
//                     Shop: {ownerInfo.shopCode || ownerInfo.shopId}
//                   </span>
//                 ) : null}
//               </div>

//               <div className="flex flex-wrap items-center gap-2">
//                 <button
//                   type="button"
//                   onClick={() =>
//                     setNextTheme(resolvedTheme === "dark" ? "light" : "dark")
//                   }
//                   className={cn("rounded-xl border px-3 py-2 text-[12px] font-bold", t.btn)}
//                 >
//                   {theme === "dark" ? (
//                     <Sun className="mr-2 inline h-4 w-4" />
//                   ) : (
//                     <Moon className="mr-2 inline h-4 w-4" />
//                   )}
//                   {theme === "dark" ? "Day" : "Night"}
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => loadProducts(q)}
//                   className={cn("rounded-xl border px-3 py-2 text-[12px] font-bold", t.btn)}
//                   disabled={loading}
//                 >
//                   <RotateCcw className={cn("mr-2 inline h-4 w-4", loading && "animate-spin")} />
//                   Refresh
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => router.push("/dashboard/product/add")}
//                   className={cn("rounded-xl px-3 py-2 text-[12px] font-bold", t.btnPrimary)}
//                 >
//                   <Plus className="mr-2 inline h-4 w-4" />
//                   Add Product
//                 </button>
//               </div>
//             </div>

//             <CompactSummaryBar theme={theme} stats={stats} />
//           </section>

//           <section className={cn("mb-4 rounded-2xl border p-3", t.card)}>
//             <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto_auto] xl:items-center">
//               <div className="relative">
//                 <Search className={cn("absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2", t.textSubtle)} />

//                 <Input
//                   value={q}
//                   onChange={(e) => setQ(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") loadProducts(q);
//                   }}
//                   placeholder="Search product name, SKU, category..."
//                   className={cn("h-10 rounded-xl pl-10 text-[12px]", t.input)}
//                 />
//               </div>

//               <div className="flex flex-wrap gap-2">
//                 {["all", "in_stock", "low_stock", "out_stock"].map((s) => (
//                   <button
//                     key={s}
//                     type="button"
//                     onClick={() => setStockFilter(s as StockLevel)}
//                     className={cn(
//                       "rounded-xl border px-3 py-2 text-[11px] font-bold",
//                       stockFilter === s ? t.active : t.btn
//                     )}
//                   >
//                     {s === "all"
//                       ? "All"
//                       : s === "in_stock"
//                         ? "In Stock"
//                         : s === "low_stock"
//                           ? "Low"
//                           : "Out"}
//                   </button>
//                 ))}
//               </div>

//               <div className="flex flex-wrap gap-2">
//                 {SORT_OPTIONS.map((item) => (
//                   <button
//                     key={item.value}
//                     type="button"
//                     onClick={() => setSortMode(item.value)}
//                     className={cn(
//                       "rounded-xl border px-2.5 py-2 text-[11px] font-bold",
//                       sortMode === item.value ? t.active : t.btn
//                     )}
//                   >
//                     <item.icon className="mr-1.5 inline h-3.5 w-3.5" />
//                     {item.label}
//                   </button>
//                 ))}
//               </div>

//               <div className="flex gap-2">
//                 <button
//                   type="button"
//                   onClick={() => setViewMode("grid")}
//                   className={cn(
//                     "rounded-xl border px-2.5 py-2 text-[11px] font-bold",
//                     viewMode === "grid" ? t.active : t.btn
//                   )}
//                 >
//                   <LayoutGrid className="h-4 w-4" />
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() => setViewMode("compact")}
//                   className={cn(
//                     "rounded-xl border px-2.5 py-2 text-[11px] font-bold",
//                     viewMode === "compact" ? t.active : t.btn
//                   )}
//                 >
//                   <List className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>

//             <div className="mt-3 flex flex-wrap gap-2">
//               {categories.map((cat) => (
//                 <button
//                   key={cat}
//                   type="button"
//                   onClick={() => setCategoryFilter(cat)}
//                   className={cn(
//                     "rounded-full border px-3 py-1.5 text-[11px] font-bold",
//                     categoryFilter === cat ? t.active : t.btn
//                   )}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </div>
//           </section>

//           {authError ? (
//             <div className="mb-6 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm font-bold text-rose-400">
//               {authError}
//             </div>
//           ) : null}

//           {!firstLoaded || loading ? (
//             <div className={cn("rounded-3xl border p-10 text-center", t.card)}>
//               <Package2 className={cn("mx-auto mb-4 h-12 w-12 animate-pulse", t.textMuted)} />
//               <div className={cn("font-black", t.text)}>Loading products...</div>
//             </div>
//           ) : products.length === 0 ? (
//             <div className={cn("rounded-3xl border p-10 text-center", t.card)}>
//               <Package2 className={cn("mx-auto mb-4 h-12 w-12", t.textMuted)} />

//               <div className={cn("text-xl font-black", t.text)}>
//                 No products for this user
//               </div>

//               <div className={cn("mx-auto mt-2 max-w-xl text-sm", t.textMuted)}>
//                 Product မတွေ့ရပါ။ Backend response ထဲမှာ
//                 `createdByUserId`, `created_by_user_id`, `createdByUsername`,
//                 `shopId` သို့မဟုတ် `shopCode` မပါရင် frontend က safety အတွက် မပြတော့ပါ။
//               </div>

//               <button
//                 onClick={() => router.push("/dashboard/product/add")}
//                 className={cn("mt-6 rounded-2xl px-5 py-2.5 text-sm font-bold", t.btnPrimary)}
//               >
//                 <Plus className="mr-2 inline h-4 w-4" />
//                 Create Product
//               </button>
//             </div>
//           ) : (
//             <section>
//               {paginatedProducts.length === 0 ? (
//                 <div className={cn("rounded-3xl border p-10 text-center", t.card)}>
//                   <Search className={cn("mx-auto mb-4 h-12 w-12", t.textMuted)} />

//                   <div className={cn("text-xl font-black", t.text)}>
//                     No matching products
//                   </div>

//                   <div className={cn("mt-2 text-sm", t.textMuted)}>
//                     Search/filter ကို ပြန်ပြင်ပြီး စမ်းကြည့်ပါ။
//                   </div>
//                 </div>
//               ) : viewMode === "grid" ? (
//                 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
//                   {paginatedProducts.map((product, index) => (
//                     <ProductCard
//                       key={product.id}
//                       product={product}
//                       index={index}
//                       theme={theme}
//                       selected={selectedId === product.id}
//                       onSelect={(p) => {
//                         setSelectedId(p.id);
//                         setPanelOpen(true);
//                       }}
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
//                   {paginatedProducts.map((product, index) => (
//                     <CompactProductCard
//                       key={product.id}
//                       product={product}
//                       index={index}
//                       theme={theme}
//                       selected={selectedId === product.id}
//                       onSelect={(p) => {
//                         setSelectedId(p.id);
//                         setPanelOpen(true);
//                       }}
//                     />
//                   ))}
//                 </div>
//               )}

//               <ProductPagination
//                 theme={theme}
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 pageSize={pageSize}
//                 totalItems={filtered.length}
//                 startIndex={startIndex}
//                 endIndex={endIndex}
//                 onPageChange={(page) => {
//                   setCurrentPage(page);
//                   setSelectedId(null);
//                   setPanelOpen(false);
//                   window.scrollTo({ top: 0, behavior: "smooth" });
//                 }}
//                 onPageSizeChange={(size) => {
//                   setPageSize(size);
//                   setCurrentPage(1);
//                   setSelectedId(null);
//                   setPanelOpen(false);
//                 }}
//               />
//             </section>
//           )}
//         </main>
//       </div>
//     </>
//   );
// }





































"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Package2,
  Boxes,
  LayoutGrid,
  List,
  RotateCcw,
  ArrowDownAZ,
  ArrowUpZA,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Tag,
  Wallet,
  Layers,
  Store,
  X,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Moon,
  Sun,
  UserCircle2,
  HomeIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FeaturePageGuard } from "@/components/feature-page-guard";
import { toast } from "sonner";

type Theme = "dark" | "light";
type ViewMode = "grid" | "compact";

type SortMode =
  | "name_asc"
  | "name_desc"
  | "price_desc"
  | "stock_desc"
  | "category_asc";

type StockLevel = "all" | "in_stock" | "low_stock" | "out_stock";

type Product = {
  id: string;
  sku: string;
  productName: string;
  productPrice: number;
  barcode?: string | null;
  category?: string | null;
  productQuantityAmount: number;
  imagePath?: string | null;
  image_path?: string | null;
  product_image?: string | null;
  productDiscount?: number | null;
  note?: string | null;
  productType?: string | null;

  createdBy?: any;
  createdByUserId?: string | null;
  createdByUsername?: string | null;
  createdByRole?: string | null;

  shopId?: string | null;
  shopCode?: string | null;
};

type ProductOwnerInfo = {
  id: string;
  username: string;
  shopId: string;
  shopCode: string;
};

const STORAGE_KEY = "binhlaig-product-page-owner-only-v2";
const PRODUCT_REFRESH_EVENT = "pos-products-stock-refresh";
const PAGE_SIZE_OPTIONS = [6, 9, 12, 18] as const;

function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;700;900&display=swap');

      * { font-family: 'DM Sans', sans-serif; }
      .serif { font-family: 'DM Serif Display', serif !important; }

      @keyframes star-blink {
        0%,100% { opacity:.2; transform: scale(.7); }
        50% { opacity:1; transform: scale(1.25); }
      }
    `}</style>
  );
}

function numberFormat(n: number) {
  return new Intl.NumberFormat().format(n || 0);
}

function toNumber(value: unknown, fallback = 0) {
  if (value == null || value === "") return fallback;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  const cleaned = String(value).replaceAll(",", "").trim();
  const n = Number(cleaned);

  return Number.isFinite(n) ? n : fallback;
}

function money(n: number) {
  return `¥${numberFormat(n || 0)}`;
}

function shortMoney(n: number) {
  if (!n) return "¥0";
  if (n >= 1_000_000) return `¥${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `¥${(n / 1_000).toFixed(0)}k`;
  return `¥${n}`;
}

function safeParseJson(value: unknown) {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (value == null) continue;
    const s = String(value).trim();
    if (s) return s;
  }

  return null;
}

function isNumericId(value: unknown) {
  return /^\d+$/.test(String(value ?? "").trim());
}

function normalizeOwnerInfo(session: unknown): ProductOwnerInfo {
  const user = ((session as any)?.user ?? {}) as any;
  const rawId = String(user.id ?? user.userId ?? user.staffId ?? "").trim();

  return {
    id: isNumericId(rawId) ? rawId : "",
    username: String(
      user.username ||
      (!isNumericId(rawId) ? rawId : "") ||
      user.name ||
      user.email ||
      ""
    ).trim(),
    shopId: user.shopId == null ? "" : String(user.shopId).trim(),
    shopCode: String(user.shopCode ?? "").trim(),
  };
}

function normalizeProduct(p: any): Product {
  const createdBy = safeParseJson(
    p?.createdBy ?? p?.created_by ?? p?.user_info ?? p?.owner ?? null
  ) as any;

  return {
    id: String(p?.id ?? ""),
    sku: String(p?.sku ?? p?.productSku ?? p?.product_sku ?? ""),
    productName: String(
      p?.productName ?? p?.product_name ?? p?.name ?? p?.title ?? ""
    ),
    productPrice: toNumber(p?.productPrice ?? p?.product_price ?? p?.price),
    productQuantityAmount: toNumber(
      p?.productQuantityAmount ??
      p?.product_quantity_amount ??
      p?.quantity ??
      p?.stock
    ),
    barcode: p?.barcode ?? null,
    category: p?.category ?? null,
    productType: p?.productType ?? p?.product_type ?? null,
    productDiscount: toNumber(
      p?.productDiscount ?? p?.product_discount ?? p?.discount
    ),
    note: p?.note ?? null,

    imagePath: p?.imagePath ?? null,
    image_path: p?.image_path ?? null,
    product_image: p?.product_image ?? p?.productImage ?? null,

    createdBy,

    createdByUserId: firstString(
      p?.createdByUserId,
      p?.created_by_user_id,
      p?.created_by_id,
      p?.ownerId,
      p?.owner_id,
      p?.userId,
      p?.user_id,
      createdBy?.id,
      createdBy?.userId,
      createdBy?.user_id
    ),

    createdByUsername: firstString(
      p?.createdByUsername,
      p?.created_by_username,
      p?.ownerUsername,
      p?.owner_username,
      p?.username,
      createdBy?.username,
      createdBy?.name,
      createdBy?.email
    ),

    createdByRole: firstString(
      p?.createdByRole,
      p?.created_by_role,
      createdBy?.role
    ),

    shopId: firstString(
      p?.shopId,
      p?.shop_id,
      createdBy?.shopId,
      createdBy?.shop_id
    ),

    shopCode: firstString(
      p?.shopCode,
      p?.shop_code,
      createdBy?.shopCode,
      createdBy?.shop_code
    ),
  };
}

function isOwnerProduct(product: Product, owner: ProductOwnerInfo) {
  const productUserId = String(product.createdByUserId ?? "")
    .trim()
    .toLowerCase();

  const productUsername = String(product.createdByUsername ?? "")
    .trim()
    .toLowerCase();

  const productShopId = String(product.shopId ?? "").trim().toLowerCase();
  const productShopCode = String(product.shopCode ?? "").trim().toLowerCase();

  const ownerId = String(owner.id ?? "").trim().toLowerCase();
  const ownerUsername = String(owner.username ?? "").trim().toLowerCase();
  const ownerShopId = String(owner.shopId ?? "").trim().toLowerCase();
  const ownerShopCode = String(owner.shopCode ?? "").trim().toLowerCase();

  if (ownerId && productUserId && productUserId === ownerId) return true;
  if (ownerUsername && productUsername && productUsername === ownerUsername) return true;
  if (ownerShopId && productShopId && productShopId === ownerShopId) return true;
  if (ownerShopCode && productShopCode && productShopCode === ownerShopCode) return true;

  return false;
}

function pickImagePath(p: Product) {
  return p.imagePath ?? p.image_path ?? p.product_image ?? null;
}

function buildImageUrl(path?: string | null) {
  if (!path) return null;

  const raw = String(path).trim();
  if (!raw) return null;

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  const cleaned = raw.replace(/^\/?uploads\/?/, "").replace(/^\/+/, "");
  return `/uploads/${cleaned}`;
}

async function readErrorText(res: Response) {
  const ct = res.headers.get("content-type") || "";

  try {
    if (ct.includes("application/json")) {
      const j = await res.json();
      return j?.message || j?.error || JSON.stringify(j);
    }

    return (await res.text()) || "";
  } catch {
    return "";
  }
}

function stockLevelOf(stock: number): StockLevel {
  if (stock <= 0) return "out_stock";
  if (stock < 5) return "low_stock";
  return "in_stock";
}

function stockBadge(stock: number) {
  if (stock <= 0) {
    return {
      label: "OUT",
      cls: "bg-rose-500/12 text-rose-400 border-rose-500/20",
    };
  }

  if (stock < 5) {
    return {
      label: "LOW",
      cls: "bg-amber-500/12 text-amber-400 border-amber-500/20",
    };
  }

  return {
    label: "IN",
    cls: "bg-emerald-500/12 text-emerald-400 border-emerald-500/20",
  };
}

function sortProducts(items: Product[], mode: SortMode) {
  const arr = [...items];

  switch (mode) {
    case "name_asc":
      return arr.sort((a, b) => a.productName.localeCompare(b.productName));

    case "name_desc":
      return arr.sort((a, b) => b.productName.localeCompare(a.productName));

    case "price_desc":
      return arr.sort((a, b) => b.productPrice - a.productPrice);

    case "stock_desc":
      return arr.sort(
        (a, b) => b.productQuantityAmount - a.productQuantityAmount
      );

    case "category_asc":
      return arr.sort((a, b) =>
        String(a.category || "").localeCompare(String(b.category || ""))
      );

    default:
      return arr;
  }
}

function hashCode(str: string) {
  let h = 0;

  for (let i = 0; i < str.length; i++) {
    h = str.charCodeAt(i) + ((h << 5) - h);
  }

  return h;
}

function getInitials(name: string) {
  return String(name || "P")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");
}

function gradientFromSeed(seed: string) {
  const palettes = [
    ["#3b82f6", "#06b6d4"],
    ["#8b5cf6", "#d946ef"],
    ["#10b981", "#06b6d4"],
    ["#f59e0b", "#ef4444"],
    ["#f43f5e", "#ec4899"],
    ["#6366f1", "#3b82f6"],
    ["#14b8a6", "#10b981"],
    ["#f97316", "#f59e0b"],
  ];

  return palettes[Math.abs(hashCode(seed)) % palettes.length];
}

const tk = (theme: Theme) =>
  theme === "dark"
    ? {
      root: "bg-[#05060d]",
      text: "text-[#f3e7d2]",
      textMuted: "text-[#bca98f]",
      textSubtle: "text-[#8a7a65]",
      card: "border-[rgba(200,137,42,0.16)] bg-[rgba(14,10,6,0.84)] backdrop-blur-xl",
      input:
        "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#f3e7d2] placeholder:text-[#8a7a65] focus-visible:border-[#c8892a] focus-visible:ring-[#c8892a]/20",
      btn: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#d4b68a] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f3e7d2]",
      btnPrimary:
        "bg-gradient-to-r from-[#a07020] to-[#d4a352] text-[#140d05] hover:from-[#b37a22] hover:to-[#deb25a] shadow-lg shadow-[#c8892a]/20",
      btnDanger:
        "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20",
      pill: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#bca98f]",
      active:
        "border-[rgba(212,163,82,0.55)] bg-[linear-gradient(135deg,#a07020,#d4a352)] text-[#140d05]",
      statChip:
        "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)]",
      modalBg:
        "bg-[rgba(10,8,3,0.94)] backdrop-blur-3xl border-[rgba(212,163,82,0.16)]",
      glow1: "bg-amber-700/[0.16]",
      glow2: "bg-orange-700/[0.10]",
      glow3: "bg-yellow-700/[0.08]",
      line: "border-white/[0.07]",
      rowHover: "hover:bg-white/[0.035]",
    }
    : {
      root: "bg-[#f0f4ff]",
      text: "text-slate-900",
      textMuted: "text-slate-500",
      textSubtle: "text-slate-400",
      card: "border-slate-200/80 bg-white/90 shadow-[0_2px_16px_rgba(15,23,42,0.06)]",
      input:
        "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-blue-500 focus-visible:ring-blue-500/20",
      btn: "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
      btnPrimary:
        "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/25",
      btnDanger: "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
      pill: "border-slate-200 bg-white text-slate-500 shadow-sm",
      active: "border-slate-900 bg-slate-900 text-white",
      statChip: "bg-white/70 border-slate-200",
      modalBg:
        "bg-white/95 backdrop-blur-xl border-slate-200/80 shadow-2xl",
      glow1: "bg-violet-300/20",
      glow2: "bg-blue-300/20",
      glow3: "bg-cyan-300/15",
      line: "border-slate-200",
      rowHover: "hover:bg-white/70",
    };

function NightParticles() {
  const stars = Array.from({ length: 28 }).map((_, i) => ({
    id: i,
    left: `${(i * 31 + 9) % 100}%`,
    top: `${(i * 43 + 11) % 100}%`,
    size: 1.5 + (i % 3),
    delay: `${(i * 0.25) % 4}s`,
    duration: `${2.8 + (i % 4) * 0.8}s`,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-amber-100"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animation: `star-blink ${s.duration} ${s.delay} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

function ProductVisual({
  product,
  index,
  className,
}: {
  product: Product;
  index: number;
  className?: string;
}) {
  const imageUrl = buildImageUrl(pickImagePath(product));
  const [g1, g2] = gradientFromSeed(
    `${product.productName}-${product.sku}-${index}`
  );

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={product.productName}
        className={cn("h-full w-full object-cover", className)}
        draggable={false}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center text-white font-black",
        className
      )}
      style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
    >
      <div className="flex flex-col items-center gap-1">
        <div className="rounded-2xl bg-black/15 px-3 py-2 text-lg backdrop-blur">
          {getInitials(product.productName || "P")}
        </div>
        <div className="text-[11px] opacity-90">{product.sku || "SKU"}</div>
      </div>
    </div>
  );
}

function CompactSummaryBar({
  theme,
  stats,
}: {
  theme: Theme;
  stats: {
    total: number;
    inStock: number;
    lowStock: number;
    outStock: number;
    totalValue: number;
  };
}) {
  const t = tk(theme);

  const items = [
    {
      label: "Products",
      value: numberFormat(stats.total),
      icon: Package2,
      color: "text-blue-400",
    },
    {
      label: "In Stock",
      value: numberFormat(stats.inStock),
      icon: CheckCircle2,
      color: "text-emerald-400",
    },
    {
      label: "Low",
      value: numberFormat(stats.lowStock),
      icon: AlertCircle,
      color: "text-amber-400",
    },
    {
      label: "Out",
      value: numberFormat(stats.outStock),
      icon: AlertCircle,
      color: "text-rose-400",
    },
    {
      label: "Value",
      value: shortMoney(stats.totalValue),
      icon: Wallet,
      color: "text-violet-400",
    },
  ];

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className={cn(
              "flex min-w-[112px] items-center gap-2 rounded-xl px-2 py-1.5",
              theme === "dark" ? "bg-white/[0.035]" : "bg-white/70"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                theme === "dark" ? "bg-white/[0.06]" : "bg-slate-100"
              )}
            >
              <Icon className={cn("h-4 w-4", item.color)} />
            </span>

            <div className="min-w-0">
              <div className={cn("text-[9px] font-black uppercase tracking-widest", t.textSubtle)}>
                {item.label}
              </div>

              <div className={cn("truncate text-[14px] font-black", t.text)}>
                {item.value}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProductCard({
  product,
  index,
  theme,
  selected,
  onSelect,
}: {
  product: Product;
  index: number;
  theme: Theme;
  selected?: boolean;
  onSelect: (p: Product) => void;
}) {
  const t = tk(theme);
  const badge = stockBadge(product.productQuantityAmount);

  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      onClick={() => onSelect(product)}
      className={cn(
        "w-full overflow-hidden rounded-2xl border text-left transition-all duration-200",
        theme === "dark"
          ? "border-white/[0.07] bg-white/[0.035] hover:bg-white/[0.06]"
          : "border-slate-200 bg-white/70 hover:bg-white",
        selected && "ring-2 ring-blue-500/50"
      )}
    >
      <div className="relative h-[118px] overflow-hidden">
        <ProductVisual
          product={product}
          index={index}
          className="absolute inset-0"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

        <div className="absolute left-2 top-2 z-10 flex gap-1.5">
          <Badge className={cn("border text-[10px] font-bold", badge.cls)}>
            {badge.label}
          </Badge>

          {Number(product.productDiscount || 0) > 0 && (
            <Badge className="border border-amber-500/20 bg-amber-500/12 text-amber-400 text-[10px] font-bold">
              -{numberFormat(Number(product.productDiscount || 0))}
            </Badge>
          )}
        </div>

        <div className="absolute right-2 top-2 z-10">
          <div className="rounded-full border border-white/20 bg-black/40 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur">
            {product.category || "UNCATEGORIZED"}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 px-3 pb-2.5">
          <div className="line-clamp-2 text-[13px] font-black leading-tight text-white drop-shadow-lg">
            {product.productName}
          </div>

          <div className="mt-0.5 font-mono text-[9px] text-white/55">
            {product.sku || "NO-SKU"}
          </div>
        </div>
      </div>

      <div className="px-3 pb-3 pt-2.5">
        <div className={cn("flex items-center gap-1.5 text-[10px]", t.textMuted)}>
          <Tag className="h-3 w-3 shrink-0" />
          {product.productType || "General Item"}
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {[
            { label: "Price", value: shortMoney(product.productPrice) },
            {
              label: "Stock",
              value:
                product.productQuantityAmount <= 0
                  ? "0"
                  : String(product.productQuantityAmount),
            },
            { label: "Barcode", value: product.barcode ? "YES" : "—" },
          ].map((item) => (
            <div
              key={item.label}
              className={cn("rounded-lg border px-1.5 py-1.5 text-center", t.statChip)}
            >
              <div
                className={cn(
                  "text-[8px] font-bold uppercase tracking-wider",
                  t.textSubtle
                )}
              >
                {item.label}
              </div>

              <div className={cn("mt-0.5 text-[11px] font-black", t.text)}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div
            className={cn(
              "flex items-center gap-1 text-[10px] font-bold",
              product.productQuantityAmount > 0
                ? "text-emerald-400"
                : "text-rose-400"
            )}
          >
            {product.productQuantityAmount > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}

            {product.productQuantityAmount > 0 ? "Available" : "Unavailable"}
          </div>

          <ChevronRight className={cn("h-4 w-4", t.textSubtle)} />
        </div>
      </div>
    </motion.button>
  );
}

function CompactProductCard({
  product,
  index,
  theme,
  selected,
  onSelect,
}: {
  product: Product;
  index: number;
  theme: Theme;
  selected?: boolean;
  onSelect: (p: Product) => void;
}) {
  const t = tk(theme);
  const badge = stockBadge(product.productQuantityAmount);

  return (
    <motion.button
      type="button"
      whileHover={{ x: 2 }}
      onClick={() => onSelect(product)}
      className={cn(
        "w-full border-b px-2 py-3 text-left transition-all duration-200",
        t.line,
        t.rowHover,
        selected && (theme === "dark" ? "bg-white/[0.05]" : "bg-white")
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
          <ProductVisual product={product} index={index} className="h-10 w-10" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className={cn("truncate text-[13px] font-black", t.text)}>
              {product.productName}
            </div>

            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                badge.cls
              )}
            >
              {badge.label}
            </span>
          </div>

          <div className={cn("mt-0.5 text-[11px]", t.textMuted)}>
            {product.sku || "NO-SKU"} · {product.category || "UNCATEGORIZED"}
          </div>
        </div>

        <div className="hidden min-w-[100px] text-right sm:block">
          <div className={cn("text-[12px] font-black", t.text)}>
            {money(product.productPrice)}
          </div>
          <div className={cn("text-[10px]", t.textSubtle)}>
            Stock {product.productQuantityAmount}
          </div>
        </div>

        <ChevronRight className={cn("h-4 w-4", t.textSubtle)} />
      </div>
    </motion.button>
  );
}

function ProductDetailDialog({
  product,
  theme,
  onClose,
  onView,
  onEdit,
  onDelete,
}: {
  product: Product | null;
  theme: Theme;
  onClose: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = tk(theme);

  if (!product) return null;

  const badge = stockBadge(product.productQuantityAmount);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.62)",
        backdropFilter: "blur(12px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.94, y: 18 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 18 }}
        transition={{ duration: 0.18 }}
        className={cn("w-full max-w-[720px] overflow-hidden rounded-3xl border", t.modalBg)}
      >
        <div
          className="flex items-start justify-between gap-4 border-b px-5 py-4"
          style={{
            borderColor:
              theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
          }}
        >
          <div>
            <div className={cn("text-[11px] font-black uppercase tracking-widest", t.textSubtle)}>
              Product Detail
            </div>

            <h2 className={cn("mt-1 text-xl font-black", t.text)}>
              {product.productName}
            </h2>

            <div className={cn("mt-1 font-mono text-[11px]", t.textMuted)}>
              {product.sku || "NO-SKU"}
            </div>
          </div>

          <button onClick={onClose} className={cn("rounded-xl border p-2", t.btn)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[72vh] overflow-y-auto p-5">
          <div className="grid gap-4 md:grid-cols-[240px_1fr]">
            <div className="relative h-[210px] overflow-hidden rounded-2xl">
              <ProductVisual product={product} index={0} className="absolute inset-0" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

              <div className="absolute left-3 top-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
                    badge.cls
                  )}
                >
                  {product.productQuantityAmount > 0 ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  {badge.label}
                </span>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { label: "Price", value: money(product.productPrice), icon: Wallet },
                {
                  label: "Stock",
                  value:
                    product.productQuantityAmount <= 0
                      ? "Out of stock"
                      : String(product.productQuantityAmount),
                  icon: Boxes,
                },
                { label: "Category", value: product.category || "—", icon: Tag },
                { label: "Type", value: product.productType || "—", icon: Layers },
                { label: "Barcode", value: product.barcode || "—", icon: Tag },
                {
                  label: "Shop",
                  value: product.shopCode || product.shopId || "—",
                  icon: Store,
                },
              ].map((item) => (
                <div key={item.label} className={cn("rounded-xl border p-3", t.statChip)}>
                  <div className={cn("mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider", t.textSubtle)}>
                    <item.icon className="h-3 w-3" />
                    {item.label}
                  </div>

                  <div className={cn("break-words text-[13px] font-black", t.text)}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={cn("mt-4 rounded-xl border p-3", t.statChip)}>
            <div className={cn("mb-2 text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>
              Product Owner
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className={cn("text-[12px]", t.textMuted)}>
                User ID:{" "}
                <span className={cn("font-bold", t.text)}>
                  {product.createdByUserId || "—"}
                </span>
              </div>

              <div className={cn("text-[12px]", t.textMuted)}>
                Username:{" "}
                <span className={cn("font-bold", t.text)}>
                  {product.createdByUsername || "—"}
                </span>
              </div>

              <div className={cn("text-[12px]", t.textMuted)}>
                Role:{" "}
                <span className={cn("font-bold", t.text)}>
                  {product.createdByRole || "—"}
                </span>
              </div>
            </div>
          </div>

          {product.note ? (
            <div className={cn("mt-4 rounded-xl border p-3", t.statChip)}>
              <div className={cn("mb-2 text-[11px] font-bold uppercase tracking-wider", t.textSubtle)}>
                Note
              </div>

              <div className={cn("text-[12px] leading-6", t.textMuted)}>
                {product.note}
              </div>
            </div>
          ) : null}
        </div>

        <div
          className="flex flex-wrap justify-end gap-2 border-t px-5 py-4"
          style={{
            borderColor:
              theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
          }}
        >
          <button onClick={onClose} className={cn("rounded-xl border px-4 py-2 text-[13px] font-bold", t.btn)}>
            Close
          </button>

          <button onClick={onView} className={cn("rounded-xl px-4 py-2 text-[13px] font-bold", t.btnPrimary)}>
            View
          </button>

          <button onClick={onEdit} className={cn("rounded-xl border px-4 py-2 text-[13px] font-bold", t.btn)}>
            Edit
          </button>

          <button onClick={onDelete} className={cn("rounded-xl border px-4 py-2 text-[13px] font-bold", t.btnDanger)}>
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProductPagination({
  theme,
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onPageSizeChange,
}: {
  theme: Theme;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const t = tk(theme);

  function buildPages() {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) return [1, 2, 3, 4, 5, "...", totalPages];

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  }

  const pages = buildPages();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className={cn("rounded-full border px-3 py-1.5 text-[11px] font-bold", t.pill)}>
            Showing {totalItems === 0 ? 0 : startIndex}-{endIndex} of {totalItems}
          </div>

          <div className={cn("flex items-center gap-2 rounded-full border px-2.5 py-1.5", t.pill)}>
            <span className={cn("text-[11px] font-bold", t.textMuted)}>
              Rows
            </span>

            {PAGE_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onPageSizeChange(size)}
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-bold transition-all",
                  pageSize === size ? t.active : "text-current"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            className={cn("rounded-xl border px-3 py-2 disabled:opacity-40", t.btn)}
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className={cn("rounded-xl border px-3 py-2 disabled:opacity-40", t.btn)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            {pages.map((page, idx) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className={cn("px-2 text-sm font-bold", t.textSubtle)}
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page as number)}
                  className={cn(
                    "min-w-[32px] rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all",
                    currentPage === page ? t.active : t.btn
                  )}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className={cn("rounded-xl border px-3 py-2 disabled:opacity-40", t.btn)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            className={cn("rounded-xl border px-3 py-2 disabled:opacity-40", t.btn)}
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ConfirmDeleteModal({
  theme,
  product,
  loading,
  onClose,
  onConfirm,
}: {
  theme: Theme;
  product: Product | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const t = tk(theme);

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(12px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
        className={cn("w-full max-w-[420px] overflow-hidden rounded-3xl border", t.modalBg)}
      >
        <div
          className="flex items-center justify-between border-b px-6 py-5"
          style={{
            borderColor:
              theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
          }}
        >
          <div>
            <div className={cn("text-[17px] font-black", t.text)}>
              Delete Product
            </div>

            <div className={cn("mt-0.5 text-[12px]", t.textMuted)}>
              This action cannot be undone.
            </div>
          </div>

          <button onClick={onClose} className={cn("rounded-xl border p-2", t.btn)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 p-6">
          <div className={cn("text-[13px]", t.textMuted)}>
            Are you sure you want to delete
          </div>

          <div className={cn("text-[18px] font-black", t.text)}>
            {product.productName}
          </div>

          <div className={cn("font-mono text-[11px]", t.textSubtle)}>
            {product.sku}
          </div>
        </div>

        <div
          className="flex gap-3 border-t px-6 py-4"
          style={{
            borderColor:
              theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
          }}
        >
          <button
            onClick={onClose}
            className={cn("flex-1 rounded-xl border py-2.5 text-[13px] font-bold", t.btn)}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn("flex-1 rounded-xl py-2.5 text-[13px] font-bold", t.btnDanger)}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProductsPageContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { resolvedTheme, setTheme: setNextTheme } = useTheme();

  const token =
    (session as any)?.accessToken ||
    (session as any)?.access_token ||
    (session as any)?.token ||
    null;

  const ownerInfo = React.useMemo(() => normalizeOwnerInfo(session), [session]);

  const [products, setProducts] = React.useState<Product[]>([]);
  const [q, setQ] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("All");
  const [stockFilter, setStockFilter] = React.useState<StockLevel>("all");
  const [theme, setTheme] = React.useState<Theme>("dark");
  const [viewMode, setViewMode] = React.useState<ViewMode>("compact");
  const [sortMode, setSortMode] = React.useState<SortMode>("name_asc");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [notification, setNotification] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [firstLoaded, setFirstLoaded] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Product | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<number>(9);

  const t = tk(theme);

  function authHeaders(): Record<string, string> {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  function showNotif(msg: string) {
    setNotification(msg);
    window.setTimeout(() => setNotification(null), 3000);
  }

  React.useEffect(() => {
    const next: Theme = resolvedTheme === "light" ? "light" : "dark";
    setTheme(next);
  }, [resolvedTheme]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const p = JSON.parse(raw);

      if (p.viewMode) setViewMode(p.viewMode);
      if (p.sortMode) setSortMode(p.sortMode);
      if (p.pageSize) setPageSize(Number(p.pageSize));
    } catch { }
  }, []);

  React.useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ viewMode, sortMode, panelOpen, pageSize })
    );
  }, [viewMode, sortMode, panelOpen, pageSize]);

  async function loadProducts(
    search?: string,
    options?: { silent?: boolean; preserveUi?: boolean }
  ) {
    if (status !== "authenticated") return;

    const silent = options?.silent === true;
    const preserveUi = options?.preserveUi === true;

    if (!token) {
      setAuthError("Session token မရပါ။ ပြန် login ဝင်ပါ။");
      if (!silent) toast.error("Session token မရပါ။ ပြန် login ဝင်ပါ။");
      return;
    }

    const tid = silent ? undefined : toast.loading("Loading products...");

    try {
      if (!silent) setLoading(true);
      setAuthError(null);

      const params = new URLSearchParams();

      if (search) params.set("q", search);

      params.set("_ts", String(Date.now()));

      if (ownerInfo.id && isNumericId(ownerInfo.id)) {
        params.set("created_by_user_id", ownerInfo.id);
        params.set("createdByUserId", ownerInfo.id);
        params.set("ownerId", ownerInfo.id);
        params.set("userId", ownerInfo.id);
      }

      if (ownerInfo.username) {
        params.set("created_by_username", ownerInfo.username);
        params.set("createdByUsername", ownerInfo.username);
        params.set("ownerUsername", ownerInfo.username);
        params.set("username", ownerInfo.username);
      }

      if (ownerInfo.shopId) {
        params.set("shop_id", ownerInfo.shopId);
        params.set("shopId", ownerInfo.shopId);
      }

      if (ownerInfo.shopCode) {
        params.set("shop_code", ownerInfo.shopCode);
        params.set("shopCode", ownerInfo.shopCode);
      }

      const query = params.toString() ? `?${params.toString()}` : "";

      const res = await fetch(`/backend/api/products${query}`, {
        headers: {
          ...authHeaders(),
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const detail = await readErrorText(res);
        setAuthError(detail || `Error ${res.status}`);

        if (!silent && tid) {
          toast.error(detail || `Error ${res.status}`, { id: tid });
        }

        setFirstLoaded(true);
        return;
      }

      const raw = await res.json().catch(() => []);
      const arr = Array.isArray(raw) ? raw : raw?.content ?? raw?.data ?? [];
      const normalized = (Array.isArray(arr) ? arr : []).map(normalizeProduct);

      const ownerProducts = normalized.filter((product) =>
        isOwnerProduct(product, ownerInfo)
      );

      const safeProducts =
        ownerProducts.length > 0 || normalized.length === 0
          ? ownerProducts
          : normalized;

      setProducts(safeProducts);
      setFirstLoaded(true);

      if (!preserveUi) {
        setCurrentPage(1);
      }

      setSelectedId((old) => {
        if (old && safeProducts.some((p) => p.id === old)) return old;
        return null;
      });

      if (!silent && tid) {
        toast.success(`Loaded ✅ ${safeProducts.length} products`, { id: tid });
      }
    } catch {
      setAuthError("Server error");

      if (!silent && tid) {
        toast.error("Server error", { id: tid });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || status !== "authenticated" || !token) return;

    const tid = toast.loading("Deleting...");

    try {
      setDeletingId(deleteTarget.id);

      const res = await fetch(`/backend/api/products/${deleteTarget.id}`, {
        method: "DELETE",
        headers: {
          ...authHeaders(),
        },
      });

      if (!res.ok) {
        const detail = await readErrorText(res);
        toast.error(detail || "Delete failed", { id: tid });
        return;
      }

      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));

      if (selectedId === deleteTarget.id) {
        setSelectedId(null);
      }

      toast.success("Deleted ✅", { id: tid });
      showNotif("Product deleted");
    } catch {
      toast.error("Server error", { id: tid });
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  React.useEffect(() => {
    if (status === "authenticated") {
      loadProducts();
    }
  }, [
    status,
    token,
    ownerInfo.id,
    ownerInfo.username,
    ownerInfo.shopId,
    ownerInfo.shopCode,
  ]);

  React.useEffect(() => {
    if (status !== "authenticated" || !token) return;

    const refreshLatestStock = () => {
      void loadProducts(q, { silent: true, preserveUi: true });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshLatestStock();
    };

    window.addEventListener("focus", refreshLatestStock);
    window.addEventListener(PRODUCT_REFRESH_EVENT, refreshLatestStock);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", refreshLatestStock);
      window.removeEventListener(PRODUCT_REFRESH_EVENT, refreshLatestStock);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [
    status,
    token,
    q,
    ownerInfo.id,
    ownerInfo.username,
    ownerInfo.shopId,
    ownerInfo.shopCode,
  ]);

  const categories = React.useMemo(() => {
    const uniq = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean))
    ) as string[];

    return ["All", ...uniq];
  }, [products]);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();

    const base = products.filter((p) => {
      const matchQ =
        !query ||
        p.productName.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        String(p.category || "").toLowerCase().includes(query) ||
        String(p.productType || "").toLowerCase().includes(query);

      const matchCategory =
        categoryFilter === "All" || p.category === categoryFilter;

      const level = stockLevelOf(p.productQuantityAmount);
      const matchStock = stockFilter === "all" || level === stockFilter;

      return matchQ && matchCategory && matchStock;
    });

    return sortProducts(base, sortMode);
  }, [products, q, categoryFilter, stockFilter, sortMode]);

  React.useEffect(() => {
    setCurrentPage(1);
    setSelectedId(null);
    setPanelOpen(false);
  }, [q, categoryFilter, stockFilter, sortMode, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const startIndex =
    filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;

  const endIndex = Math.min(currentPage * pageSize, filtered.length);

  const selectedProduct = selectedId
    ? filtered.find((p) => p.id === selectedId) ?? null
    : null;

  const stats = React.useMemo(() => {
    const total = products.length;

    const inStock = products.filter((p) => p.productQuantityAmount > 0).length;

    const lowStock = products.filter(
      (p) => p.productQuantityAmount > 0 && p.productQuantityAmount < 5
    ).length;

    const outStock = products.filter((p) => p.productQuantityAmount <= 0).length;

    const totalValue = products.reduce(
      (a, p) => a + p.productPrice * p.productQuantityAmount,
      0
    );

    return {
      total,
      inStock,
      lowStock,
      outStock,
      totalValue,
    };
  }, [products]);

  const SORT_OPTIONS = [
    { label: "A → Z", value: "name_asc" as SortMode, icon: ArrowDownAZ },
    { label: "Z → A", value: "name_desc" as SortMode, icon: ArrowUpZA },
    { label: "Price", value: "price_desc" as SortMode, icon: Wallet },
    { label: "Stock", value: "stock_desc" as SortMode, icon: Boxes },
    { label: "Category", value: "category_asc" as SortMode, icon: Tag },
  ];

  if (status === "loading") {
    return (
      <>
        <FontImport />

        <div className="flex min-h-screen items-center justify-center bg-[#05060d] text-[#f3e7d2]">
          <div className="text-center">
            <Package2 className="mx-auto mb-4 h-10 w-10 animate-pulse text-amber-400" />
            <div className="text-sm font-bold">Loading session...</div>
          </div>
        </div>
      </>
    );
  }

  if (status === "unauthenticated") {
    return (
      <>
        <FontImport />

        <div className="flex min-h-screen items-center justify-center bg-[#05060d] p-6 text-[#f3e7d2]">
          <div className="max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <UserCircle2 className="mx-auto mb-4 h-12 w-12 text-amber-400" />
            <div className="text-xl font-black">Login required</div>
            <div className="mt-2 text-sm text-[#bca98f]">
              Product တွေကြည့်ဖို့ login အရင်ဝင်ပါ။
            </div>

            <button
              onClick={() => router.replace("/Sign_in?next=/dashboard/product")}
              className="mt-6 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-black text-black"
            >
              Go Login
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FontImport />

      <div className={cn("relative min-h-screen transition-colors duration-500", t.root)}>
        {theme === "dark" && <NightParticles />}

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div
            className={cn(
              "absolute -top-40 left-[15%] h-[600px] w-[600px] rounded-full blur-[150px]",
              t.glow1
            )}
          />

          <div
            className={cn(
              "absolute -bottom-20 right-[-10%] h-[500px] w-[500px] rounded-full blur-[140px]",
              t.glow2
            )}
          />

          <div
            className={cn(
              "absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[160px]",
              t.glow3
            )}
          />
        </div>

        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed left-1/2 top-5 z-[100] flex -translate-x-1/2 items-center gap-2.5 rounded-2xl border px-4 py-2.5 text-[13px] font-bold shadow-2xl"
              style={{
                background: theme === "dark" ? "rgba(12,16,24,0.95)" : "white",
                borderColor:
                  theme === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)",
                color: theme === "dark" ? "white" : "#0f172a",
                backdropFilter: "blur(20px)",
              }}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {deleteTarget && (
            <ConfirmDeleteModal
              theme={theme}
              product={deleteTarget}
              loading={deletingId === deleteTarget.id}
              onClose={() => setDeleteTarget(null)}
              onConfirm={confirmDelete}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {panelOpen && selectedProduct ? (
            <ProductDetailDialog
              product={selectedProduct}
              theme={theme}
              onClose={() => setPanelOpen(false)}
              onView={() => {
                router.push(`/dashboard/product/${selectedProduct.id}`);
              }}
              onEdit={() => {
                router.push(`/dashboard/product/${selectedProduct.id}/edit`);
              }}
              onDelete={() => {
                setDeleteTarget(selectedProduct);
                setPanelOpen(false);
              }}
            />
          ) : null}
        </AnimatePresence>

        <main className="relative z-10 mx-auto max-w-[1500px] px-4 py-5 md:px-6 lg:px-8">
          <section className="mb-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">

                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className={cn("rounded-xl px-3 py-2 text-[12px] font-bold hover:cursor-pointer", t.btnPrimary)}
                >
                  <HomeIcon className="mr-2 inline h-4 w-4 " />
                  dashboard
                </button>


                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold",
                    t.pill
                  )}
                >
                  <Store className="h-3.5 w-3.5" />
                  My Products Only
                </span>

                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold",
                    t.pill
                  )}
                >
                  <UserCircle2 className="h-3.5 w-3.5" />
                  {ownerInfo.username || ownerInfo.id || "Current User"}
                </span>

                {ownerInfo.shopCode || ownerInfo.shopId ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold",
                      t.pill
                    )}
                  >
                    Shop: {ownerInfo.shopCode || ownerInfo.shopId}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setNextTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                  className={cn("rounded-xl border px-3 py-2 text-[12px] font-bold", t.btn)}
                >
                  {theme === "dark" ? (
                    <Sun className="mr-2 inline h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 inline h-4 w-4" />
                  )}
                  {theme === "dark" ? "Day" : "Night"}
                </button>

                <button
                  type="button"
                  onClick={() => loadProducts(q)}
                  className={cn("rounded-xl border px-3 py-2 text-[12px] font-bold", t.btn)}
                  disabled={loading}
                >
                  <RotateCcw className={cn("mr-2 inline h-4 w-4", loading && "animate-spin")} />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/dashboard/product/add")}
                  className={cn("rounded-xl px-3 py-2 text-[12px] font-bold hover:cursor-pointer", t.btnPrimary)}
                >
                  <Plus className="mr-2 inline h-4 w-4" />
                  Add Product
                </button>


              </div>
            </div>

            <CompactSummaryBar theme={theme} stats={stats} />
          </section>

          <section className="mb-3">
            <div className="grid gap-3 xl:grid-cols-[1fr_auto_auto_auto] xl:items-center">
              <div className="relative">
                <Search className={cn("absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2", t.textSubtle)} />

                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") loadProducts(q);
                  }}
                  placeholder="Search product name, SKU, category..."
                  className={cn("h-10 rounded-xl pl-10 text-[12px]", t.input)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {["all", "in_stock", "low_stock", "out_stock"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStockFilter(s as StockLevel)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-[11px] font-bold",
                      stockFilter === s ? t.active : t.btn
                    )}
                  >
                    {s === "all"
                      ? "All"
                      : s === "in_stock"
                        ? "In Stock"
                        : s === "low_stock"
                          ? "Low"
                          : "Out"}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSortMode(item.value)}
                    className={cn(
                      "rounded-xl border px-2.5 py-2 text-[11px] font-bold",
                      sortMode === item.value ? t.active : t.btn
                    )}
                  >
                    <item.icon className="mr-1.5 inline h-3.5 w-3.5" />
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "rounded-xl border px-2.5 py-2 text-[11px] font-bold",
                    viewMode === "grid" ? t.active : t.btn
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("compact")}
                  className={cn(
                    "rounded-xl border px-2.5 py-2 text-[11px] font-bold",
                    viewMode === "compact" ? t.active : t.btn
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[11px] font-bold",
                    categoryFilter === cat ? t.active : t.btn
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {authError ? (
            <div className="mb-6 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm font-bold text-rose-400">
              {authError}
            </div>
          ) : null}

          {!firstLoaded || loading ? (
            <div className="p-10 text-center">
              <Package2 className={cn("mx-auto mb-4 h-12 w-12 animate-pulse", t.textMuted)} />
              <div className={cn("font-black", t.text)}>Loading products...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="p-10 text-center">
              <Package2 className={cn("mx-auto mb-4 h-12 w-12", t.textMuted)} />

              <div className={cn("text-xl font-black", t.text)}>
                No products for this user
              </div>

              <div className={cn("mx-auto mt-2 max-w-xl text-sm", t.textMuted)}>
                Product မတွေ့ရပါ။ Backend response ထဲမှာ
                `createdByUserId`, `created_by_user_id`, `createdByUsername`,
                `shopId` သို့မဟုတ် `shopCode` မပါရင် frontend က safety အတွက် မပြတော့ပါ။
              </div>

              <button
                onClick={() => router.push("/dashboard/product/add")}
                className={cn("mt-6 rounded-2xl px-5 py-2.5 text-sm font-bold", t.btnPrimary)}
              >
                <Plus className="mr-2 inline h-4 w-4" />
                Create Product
              </button>
            </div>
          ) : (
            <section>
              {paginatedProducts.length === 0 ? (
                <div className="p-10 text-center">
                  <Search className={cn("mx-auto mb-4 h-12 w-12", t.textMuted)} />

                  <div className={cn("text-xl font-black", t.text)}>
                    No matching products
                  </div>

                  <div className={cn("mt-2 text-sm", t.textMuted)}>
                    Search/filter ကို ပြန်ပြင်ပြီး စမ်းကြည့်ပါ။
                  </div>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                  {paginatedProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      theme={theme}
                      selected={selectedId === product.id}
                      onSelect={(p) => {
                        setSelectedId(p.id);
                        setPanelOpen(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className={cn("overflow-hidden border-t", t.line)}>
                  {paginatedProducts.map((product, index) => (
                    <CompactProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      theme={theme}
                      selected={selectedId === product.id}
                      onSelect={(p) => {
                        setSelectedId(p.id);
                        setPanelOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}

              <ProductPagination
                theme={theme}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filtered.length}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  setSelectedId(null);
                  setPanelOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                  setSelectedId(null);
                  setPanelOpen(false);
                }}
              />
            </section>
          )}
        </main>
      </div>
    </>
  );
}

export default function ProductsPage() {
  return (
    <FeaturePageGuard featureKey="productsEnabled">
      <ProductsPageContent />
    </FeaturePageGuard>
  );
}
