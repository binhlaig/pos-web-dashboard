// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { useSession, signIn } from "next-auth/react";

// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { ScrollArea } from "@/components/ui/scroll-area";

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
//   ImageIcon,
//   Tag,
//   Boxes,
//   Printer,
//   RefreshCw,
//   TrendingUp,
//   TrendingDown,
//   History,
//   Barcode as BarcodeIcon,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";

// import { toast } from "sonner";
// import JsBarcode from "jsbarcode";

// type Product = {
//   id: string;
//   sku: string;
//   product_name: string;
//   product_price: number;
//   barcode?: string | null;
//   category?: string | null;
//   product_quantity_amount: number;

//   // ✅ image fields possible from backend
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

//   // allow: "uploads/x", "/uploads/x", "x"
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

// export default function ProductViewPage() {
//   const router = useRouter();
//   const params = useParams<{ id: string }>();
//   const id = params?.id;

//   const { data: session, status } = useSession();

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

//   // stock movements
//   const [moves, setMoves] = useState<StockMovement[]>([]);
//   const [movesLoading, setMovesLoading] = useState(false);
//   const [movesFirstLoaded, setMovesFirstLoaded] = useState(false);

//   // moves pagination
//   const [mPage, setMPage] = useState(1);
//   const [mPageSize, setMPageSize] = useState(10);

//   // barcode
//   const barcodeSvgRef = useRef<SVGSVGElement | null>(null);

//   // stock modal
//   const [stockOpen, setStockOpen] = useState(false);
//   const [stockMode, setStockMode] = useState<"IN" | "OUT" | "ADJUST">("IN");
//   const [stockQty, setStockQty] = useState<number>(1);
//   const [stockNote, setStockNote] = useState<string>("");
//   const [stockSaving, setStockSaving] = useState(false);

//   const barcodeValue =
//     (product?.barcode && product.barcode.trim() !== "" ? product.barcode : null) ??
//     product?.sku ??
//     "";

//   // ✅ session မရှိရင် signin သို့
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

//     try {
//       setLoading(true);

//       // ✅ IMPORTANT: use rewrite base + Bearer token
//       const res = await fetch(`/backend/api/products/${id}`, {
//         method: "GET",
//         headers: { ...authHeaders(), Accept: "application/json" },
//         cache: "no-store",
//       });

//       if (!res.ok) {
//         const detail = await readErrorText(res);

//         if (res.status === 401) {
//           toast.error("Unauthorized — Login ပြန်လုပ်ပါ");
//           signIn();
//         } else if (res.status === 403) {
//           toast.error("Forbidden — ADMIN လိုနိုင်တယ်");
//         } else if (res.status === 404) {
//           toast.error("Product မတွေ့ပါ (404) — id မမှန်နိုင်ပါတယ်");
//         } else {
//           toast.error(detail || `Product load မရပါ (status ${res.status})`);
//         }

//         setProduct(null);
//         return;
//       }

//       const data = (await res.json()) as Product;
//       setProduct(data);
//     } catch (e) {
//       console.error(e);
//       toast.error("Server error ဖြစ်နေတယ်");
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
//         return;
//       }

//       const data = (await res.json()) as StockMovement[];
//       setMoves(data);
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
//         if (!Number.isInteger(qtyNum) || qtyNum < 0) return toast.error("Adjust qty ကို 0 သို့ အပေါင်းကိန်း ထည့်ပါ");
//       } else {
//         if (!Number.isInteger(qtyNum) || qtyNum <= 0) return toast.error("Qty ကို 1 ထက်ကြီးတဲ့ အပေါင်းကိန်း ထည့်ပါ");
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

//   // barcode render
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
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id, status, token]);

//   const imageUrl = buildImageUrl(pickImagePath(product));

//   const stock = product?.product_quantity_amount ?? 0;

//   // movements pagination
//   const mTotal = moves.length;
//   const mTotalPages = Math.max(1, Math.ceil(mTotal / mPageSize));
//   const mSafePage = Math.min(Math.max(mPage, 1), mTotalPages);

//   const pagedMoves = useMemo(() => {
//     const start = (mSafePage - 1) * mPageSize;
//     return moves.slice(start, start + mPageSize);
//   }, [moves, mSafePage, mPageSize]);

//   function movementBadge(type: StockMovement["type"]) {
//     if (type === "IN")
//       return (
//         <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 gap-1">
//           <TrendingUp className="h-3.5 w-3.5" />
//           IN
//         </Badge>
//       );
//     if (type === "OUT")
//       return (
//         <Badge className="bg-red-500/10 text-red-700 border border-red-500/20 gap-1">
//           <TrendingDown className="h-3.5 w-3.5" />
//           OUT
//         </Badge>
//       );
//     return (
//       <Badge className="bg-amber-500/10 text-amber-800 border border-amber-500/20 gap-1">
//         <History className="h-3.5 w-3.5" />
//         ADJUST
//       </Badge>
//     );
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
//     .wrap { width: 320px; border: 1px solid #ddd; border-radius: 12px; padding: 14px; }
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

//     const w = window.open("", "_blank", "width=420,height=520");
//     if (!w) {
//       toast.error("Popup blocked ဖြစ်နေတယ် (Allow popups လုပ်ပါ)");
//       return;
//     }
//     w.document.open();
//     w.document.write(html);
//     w.document.close();
//   }

//   if (status === "loading" || loading) {
//     return <div className="flex justify-center py-10 text-muted-foreground">Loading product...</div>;
//   }

//   if (!product) {
//     return (
//       <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
//         <div>Product not found</div>
//         <Button variant="outline" size="sm" onClick={loadProduct} className="gap-2">
//           <RefreshCw className="h-4 w-4" /> Retry
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="flex justify-center py-8 px-3 overflow-x-hidden">
//       <div className="w-full max-w-5xl min-w-0 space-y-6">
//         {/* Product Detail */}
//         <Card className="overflow-hidden min-w-0">
//           <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//             <div className="space-y-1 min-w-0">
//               <CardTitle className="flex items-center gap-2">
//                 <Package className="h-5 w-5" />
//                 Product Detail
//               </CardTitle>
//               <CardDescription>
//                 Product Detail + Barcode Print + Stock IN/OUT/Adjust + History
//               </CardDescription>
//             </div>

//             <div className="flex flex-wrap gap-2">
//               <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2">
//                 <ArrowLeft className="h-4 w-4" />
//                 Back
//               </Button>

//               <Button size="sm" onClick={() => router.push(`/products/${product.id}/edit`)} className="gap-2">
//                 <Pencil className="h-4 w-4" />
//                 Edit
//               </Button>

//               <Button size="sm" variant="outline" className="gap-2" onClick={() => openStockModal("IN")}>
//                 <TrendingUp className="h-4 w-4" />
//                 Stock IN
//               </Button>

//               <Button size="sm" variant="outline" className="gap-2" onClick={() => openStockModal("OUT")}>
//                 <TrendingDown className="h-4 w-4" />
//                 Stock OUT
//               </Button>

//               <Button size="sm" variant="secondary" className="gap-2" onClick={() => openStockModal("ADJUST")}>
//                 <History className="h-4 w-4" />
//                 Adjust
//               </Button>
//             </div>
//           </CardHeader>

//           <CardContent className="grid gap-6 md:grid-cols-2 min-w-0">
//             {/* Image */}
//             <div className="flex items-center justify-center rounded-xl border bg-muted min-h-[260px]">
//               {imageUrl ? (
//                 <img src={imageUrl} alt={product.product_name} className="max-h-[320px] object-contain" />
//               ) : (
//                 <div className="flex flex-col items-center text-muted-foreground">
//                   <ImageIcon className="h-8 w-8" />
//                   <span className="text-sm">No Image</span>
//                 </div>
//               )}
//             </div>

//             {/* Info + Barcode */}
//             <div className="space-y-4 min-w-0">
//               <div className="min-w-0">
//                 <h2 className="text-xl font-semibold break-words">{product.product_name}</h2>
//                 <div className="text-sm text-muted-foreground">
//                   SKU: <span className="font-mono">{product.sku}</span>
//                 </div>
//                 {product.barcode && (
//                   <div className="text-sm text-muted-foreground">
//                     Barcode: <span className="font-mono">{product.barcode}</span>
//                   </div>
//                 )}
//               </div>

//               <Separator />

//               <div className="space-y-2">
//                 <div className="flex items-center gap-2">
//                   <Tag className="h-4 w-4 text-muted-foreground" />
//                   <span className="font-medium">{product.product_price.toLocaleString()}</span>
//                   {product.product_discount ? (
//                     <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
//                       -{product.product_discount}
//                     </Badge>
//                   ) : null}
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <Boxes className="h-4 w-4 text-muted-foreground" />
//                   <span
//                     className={
//                       stock <= 0
//                         ? "text-red-600 font-medium"
//                         : stock < 5
//                         ? "text-amber-600 font-medium"
//                         : "font-medium"
//                     }
//                   >
//                     Stock: {stock}
//                   </span>
//                 </div>
//               </div>

//               <div className="flex flex-wrap gap-2">
//                 {product.category && <Badge variant="outline">{product.category}</Badge>}
//                 {product.product_type && <Badge variant="secondary">{product.product_type}</Badge>}
//               </div>

//               {product.note && (
//                 <>
//                   <Separator />
//                   <div>
//                     <div className="text-sm font-medium">Note</div>
//                     <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.note}</p>
//                   </div>
//                 </>
//               )}

//               <Separator />

//               {/* Barcode Block */}
//               <div className="rounded-xl border p-3 bg-background min-w-0">
//                 <div className="flex items-center justify-between gap-2 flex-wrap">
//                   <div className="flex items-center gap-2 text-sm font-medium">
//                     <BarcodeIcon className="h-4 w-4 text-muted-foreground" />
//                     Barcode
//                   </div>

//                   <Button size="sm" variant="outline" className="gap-2" onClick={printBarcode}>
//                     <Printer className="h-4 w-4" />
//                     Print
//                   </Button>
//                 </div>

//                 <div className="mt-2 overflow-x-auto">
//                   <svg ref={barcodeSvgRef} />
//                 </div>

//                 <div className="text-xs text-muted-foreground mt-1">
//                   Print ထုတ်ရာမှာ Barcode value အဖြစ် <b>{product.barcode ? "barcode" : "SKU"}</b> ကိုသုံးထားပါတယ်။
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Stock History / Movements */}
//         <Card className="overflow-hidden min-w-0">
//           <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
//             <div className="space-y-1">
//               <CardTitle className="flex items-center gap-2">
//                 <History className="h-5 w-5" />
//                 Stock Movements
//               </CardTitle>
//               <CardDescription>Stock ဝင်/ထွက်/ပြင်ဆင်မှု history ကိုကြည့်နိုင်ပါတယ်</CardDescription>
//             </div>

//             <div className="flex flex-wrap gap-2 items-center">
//               <Badge variant="secondary" className="gap-1">
//                 <History className="h-3.5 w-3.5" />
//                 Page size
//               </Badge>

//               <select
//                 className="h-9 rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
//                 value={mPageSize}
//                 onChange={(e) => {
//                   setMPageSize(Number(e.target.value));
//                   setMPage(1);
//                 }}
//               >
//                 <option value={10}>10</option>
//                 <option value={20}>20</option>
//                 <option value={50}>50</option>
//               </select>

//               <Button size="sm" variant="outline" className="gap-2" onClick={() => loadMovements(true)} disabled={movesLoading}>
//                 <RefreshCw className={cn("h-4 w-4", movesLoading && "animate-spin")} />
//                 Refresh
//               </Button>
//             </div>
//           </CardHeader>

//           <CardContent className="space-y-3 min-w-0">
//             <div className="text-xs text-muted-foreground">
//               {movesLoading
//                 ? "Loading movements..."
//                 : `Showing ${mTotal === 0 ? 0 : (mSafePage - 1) * mPageSize + 1}-${Math.min(mSafePage * mPageSize, mTotal)} of ${mTotal}`}
//             </div>

//             <div className="w-full min-w-0 overflow-x-auto rounded-xl border">
//               <ScrollArea className="max-h-[360px]">
//                 <table className="min-w-[880px] w-full text-sm">
//                   <thead className="sticky top-0 bg-background/95 backdrop-blur border-b">
//                     <tr className="text-left">
//                       <th className="p-3">Type</th>
//                       <th className="p-3 text-right">Qty</th>
//                       <th className="p-3 text-right">Before</th>
//                       <th className="p-3 text-right">After</th>
//                       <th className="p-3">Note</th>
//                       <th className="p-3">By</th>
//                       <th className="p-3">Time</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {mTotal === 0 && movesFirstLoaded && (
//                       <tr>
//                         <td className="p-4 text-muted-foreground" colSpan={7}>
//                           Movements မရှိသေးပါ (သို့) backend endpoint မထည့်ရသေးပါ။
//                         </td>
//                       </tr>
//                     )}

//                     {pagedMoves.map((m) => (
//                       <tr key={m.id} className="border-b hover:bg-muted/40">
//                         <td className="p-3">{movementBadge(m.type)}</td>
//                         <td className="p-3 text-right font-mono">{Number(m.qty).toLocaleString()}</td>
//                         <td className="p-3 text-right font-mono">{Number(m.before_qty).toLocaleString()}</td>
//                         <td className="p-3 text-right font-mono">{Number(m.after_qty).toLocaleString()}</td>
//                         <td className="p-3 text-muted-foreground">{m.note || "-"}</td>
//                         <td className="p-3 text-muted-foreground">{m.user_name || "-"}</td>
//                         <td className="p-3 text-muted-foreground">{new Date(m.created_at).toLocaleString()}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </ScrollArea>
//             </div>

//             <div className="flex items-center justify-between gap-2 flex-wrap">
//               <div className="text-xs text-muted-foreground whitespace-nowrap">
//                 Page <b>{mSafePage}</b> / <b>{mTotalPages}</b>
//               </div>

//               <div className="flex items-center gap-2 flex-wrap">
//                 <Button size="sm" variant="outline" disabled={mSafePage <= 1} onClick={() => setMPage((p) => Math.max(1, p - 1))} className="gap-1">
//                   <ChevronLeft className="h-4 w-4" />
//                   Prev
//                 </Button>

//                 <Button size="sm" variant="outline" disabled={mSafePage >= mTotalPages} onClick={() => setMPage((p) => Math.min(mTotalPages, p + 1))} className="gap-1">
//                   Next
//                   <ChevronRight className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>

//             <div className="text-xs text-muted-foreground">
//               Endpoint: <code className="px-1 py-0.5 rounded bg-muted">GET /api/products/:id/movements</code>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Stock Modal */}
//       <Dialog open={stockOpen} onOpenChange={setStockOpen}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>
//               {stockMode === "IN" ? "Stock IN" : stockMode === "OUT" ? "Stock OUT" : "Stock Adjust"}
//             </DialogTitle>
//             <DialogDescription>
//               {stockMode === "ADJUST" ? "Final stock number (absolute) ကို သတ်မှတ်ပါ" : "Qty (delta) ကို ထည့်ပါ"}
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

// function escapeHtml(s: string) {
//   return s
//     .replaceAll("&", "&amp;")
//     .replaceAll("<", "&lt;")
//     .replaceAll(">", "&gt;")
//     .replaceAll('"', "&quot;")
//     .replaceAll("'", "&#039;");
// }



"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  ImageIcon,
  Tag,
  Boxes,
  Printer,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  History,
  Barcode as BarcodeIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { toast } from "sonner";
import JsBarcode from "jsbarcode";

type Product = {
  id: string;
  sku: string;
  product_name: string;
  product_price: number;
  barcode?: string | null;
  category?: string | null;
  product_quantity_amount: number;

  // possible image fields from backend
  product_image?: string | null;
  imagePath?: string | null;
  image_path?: string | null;

  product_discount?: number | null;
  note?: string | null;
  product_type?: string | null;
};

type StockMovement = {
  id: string;
  type: "IN" | "OUT" | "ADJUST";
  qty: number;
  before_qty: number;
  after_qty: number;
  note?: string | null;
  created_at: string; // ISO
  user_name?: string | null;
};

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function pickImagePath(p: any): string | null {
  return p?.imagePath ?? p?.image_path ?? p?.product_image ?? null;
}

function buildImageUrl(path?: string | null) {
  if (!path) return null;
  const raw = String(path).trim();
  if (!raw) return null;

  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

  // allow: "uploads/x", "/uploads/x", "x"
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

export default function ProductViewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data: session, status } = useSession();

  const token =
    (session as any)?.accessToken ||
    (session as any)?.access_token ||
    (session as any)?.token ||
    null;

  function authHeaders(): Record<string, string> {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // stock movements
  const [moves, setMoves] = useState<StockMovement[]>([]);
  const [movesLoading, setMovesLoading] = useState(false);
  const [movesFirstLoaded, setMovesFirstLoaded] = useState(false);

  // moves pagination
  const [mPage, setMPage] = useState(1);
  const [mPageSize, setMPageSize] = useState(10);

  // barcode
  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);

  // stock modal
  const [stockOpen, setStockOpen] = useState(false);
  const [stockMode, setStockMode] = useState<"IN" | "OUT" | "ADJUST">("IN");
  const [stockQty, setStockQty] = useState<number>(1);
  const [stockNote, setStockNote] = useState<string>("");
  const [stockSaving, setStockSaving] = useState(false);

  const barcodeValue =
    (product?.barcode && product.barcode.trim() !== "" ? product.barcode : null) ??
    product?.sku ??
    "";

  // ✅ session မရှိရင် signin
  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Login လုပ်ပါ");
      signIn();
    }
  }, [status]);

  async function loadProduct() {
    if (!id) return;

    if (status === "loading") return;
    if (!token) {
      toast.error("Session token မရပါ — Login ပြန်လုပ်ပါ");
      signIn();
      return;
    }

    const t = toast.loading("Loading product...");

    try {
      setLoading(true);

      // ✅ use rewrite base + Bearer token
      const res = await fetch(`/backend/api/products/${id}`, {
        method: "GET",
        headers: { ...authHeaders(), Accept: "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        const detail = await readErrorText(res);

        if (res.status === 401) {
          toast.error("Unauthorized — Login ပြန်လုပ်ပါ", { id: t });
          signIn();
        } else if (res.status === 403) {
          toast.error("Forbidden — ADMIN လိုနိုင်တယ်", { id: t });
        } else if (res.status === 404) {
          toast.error("Product မတွေ့ပါ (404) — id မမှန်နိုင်ပါတယ်", { id: t });
        } else {
          toast.error(detail || `Product load မရပါ (status ${res.status})`, { id: t });
        }

        setProduct(null);
        return;
      }

      const data = (await res.json()) as Product;
      setProduct(data);
      toast.success("Loaded ✅", { id: t });
    } catch (e) {
      console.error(e);
      toast.error("Server error ဖြစ်နေတယ်", { id: t });
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadMovements(resetPage = false) {
    if (!id) return;

    if (status === "loading") return;
    if (!token) return;

    try {
      setMovesLoading(true);

      const res = await fetch(`/backend/api/products/${id}/movements`, {
        method: "GET",
        headers: { ...authHeaders(), Accept: "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        setMovesFirstLoaded(true);
        setMoves([]);
        return;
      }

      const data = (await res.json()) as StockMovement[];
      setMoves(data);
      setMovesFirstLoaded(true);

      const newTotalPages = Math.max(1, Math.ceil(data.length / mPageSize));
      if (resetPage) setMPage(1);
      else setMPage((p) => Math.min(p, newTotalPages));
    } catch (e) {
      console.error(e);
      toast.error("Movements load error");
    } finally {
      setMovesLoading(false);
    }
  }

  function openStockModal(mode: "IN" | "OUT" | "ADJUST") {
    setStockMode(mode);
    setStockQty(
      mode === "ADJUST"
        ? Number(product?.product_quantity_amount ?? 0)
        : 1
    );
    setStockNote("");
    setStockOpen(true);
  }

  async function submitStock() {
    if (!product) return;

    if (status === "loading") return;
    if (!token) {
      toast.error("Session token မရပါ — Login ပြန်လုပ်ပါ");
      signIn();
      return;
    }

    try {
      setStockSaving(true);

      const url =
        stockMode === "IN"
          ? `/backend/api/products/${product.id}/stock-in`
          : stockMode === "OUT"
          ? `/backend/api/products/${product.id}/stock-out`
          : `/backend/api/products/${product.id}/stock-adjust`;

      const method = stockMode === "ADJUST" ? "PATCH" : "POST";

      const qtyNum = Number(stockQty);
      if (!Number.isFinite(qtyNum)) return toast.error("Qty မှန်မှန်ထည့်ပါ");

      if (stockMode === "ADJUST") {
        if (!Number.isInteger(qtyNum) || qtyNum < 0)
          return toast.error("Adjust qty ကို 0 သို့ အပေါင်းကိန်း ထည့်ပါ");
      } else {
        if (!Number.isInteger(qtyNum) || qtyNum <= 0)
          return toast.error("Qty ကို 1 ထက်ကြီးတဲ့ အပေါင်းကိန်း ထည့်ပါ");
      }

      const res = await fetch(url, {
        method,
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          qty: qtyNum,
          note: stockNote.trim() ? stockNote.trim() : undefined,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(data?.message || `Stock update failed (status ${res.status})`);
        return;
      }

      toast.success(
        stockMode === "IN"
          ? "Stock IN success ✅"
          : stockMode === "OUT"
          ? "Stock OUT success ✅"
          : "Stock ADJUST success ✅"
      );

      setStockOpen(false);

      await loadProduct();
      await loadMovements(true);
    } catch (e) {
      console.error(e);
      toast.error("Stock update error");
    } finally {
      setStockSaving(false);
    }
  }

  // barcode render
  useEffect(() => {
    if (!barcodeSvgRef.current) return;
    if (!barcodeValue) return;

    try {
      JsBarcode(barcodeSvgRef.current, barcodeValue, {
        format: "CODE128",
        displayValue: true,
        fontSize: 14,
        height: 70,
        margin: 8,
      });
    } catch (e) {
      console.error(e);
    }
  }, [barcodeValue]);

  useEffect(() => {
    if (!id) return;
    if (status !== "authenticated") return;

    loadProduct();
    loadMovements(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, status, token]);

  const imageUrl = buildImageUrl(pickImagePath(product));
  const stock = product?.product_quantity_amount ?? 0;

  // movements pagination
  const mTotal = moves.length;
  const mTotalPages = Math.max(1, Math.ceil(mTotal / mPageSize));
  const mSafePage = Math.min(Math.max(mPage, 1), mTotalPages);

  const pagedMoves = useMemo(() => {
    const start = (mSafePage - 1) * mPageSize;
    return moves.slice(start, start + mPageSize);
  }, [moves, mSafePage, mPageSize]);

  function movementBadge(type: StockMovement["type"]) {
    if (type === "IN")
      return (
        <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 gap-1">
          <TrendingUp className="h-3.5 w-3.5" />
          IN
        </Badge>
      );
    if (type === "OUT")
      return (
        <Badge className="bg-red-500/10 text-red-700 border border-red-500/20 gap-1">
          <TrendingDown className="h-3.5 w-3.5" />
          OUT
        </Badge>
      );
    return (
      <Badge className="bg-amber-500/10 text-amber-800 border border-amber-500/20 gap-1">
        <History className="h-3.5 w-3.5" />
        ADJUST
      </Badge>
    );
  }

  function printBarcode() {
    if (!product) return;

    const svg = barcodeSvgRef.current?.outerHTML || "";
    const title = product.product_name ?? "Product";

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Print Barcode</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 18px; }
    .wrap { width: 360px; border: 1px solid #ddd; border-radius: 12px; padding: 14px; }
    .name { font-weight: 700; margin-bottom: 6px; }
    .sku { color: #555; font-size: 12px; margin-bottom: 10px; }
    .row { display:flex; gap:10px; flex-wrap:wrap; }
    .price { font-weight: 700; }
    svg { width: 100%; height: auto; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="name">${escapeHtml(title)}</div>
    <div class="sku">SKU: ${escapeHtml(product.sku)}</div>
    ${svg}
    <div class="row" style="margin-top:10px;">
      <div class="price">Price: ${Number(product.product_price || 0).toLocaleString()}</div>
      <div>Stock: ${Number(product.product_quantity_amount || 0)}</div>
    </div>
  </div>
  <script>
    window.onload = () => {
      window.print();
      window.close();
    }
  </script>
</body>
</html>`;

    const w = window.open("", "_blank", "width=460,height=560");
    if (!w) {
      toast.error("Popup blocked ဖြစ်နေတယ် (Allow popups လုပ်ပါ)");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  // ✅ 1920+ friendly container
  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center py-10 text-muted-foreground">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
        <div>Product not found</div>
        <Button variant="outline" size="sm" onClick={loadProduct} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-10 px-3 md:px-6 2xl:px-10 overflow-x-hidden">
      <div className="w-full max-w-5xl 2xl:max-w-[1400px] min-w-0 space-y-6 2xl:space-y-8">
        {/* Product Detail */}
        <Card className="overflow-hidden min-w-0">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-5 md:px-6 2xl:px-8 py-5 2xl:py-6">
            <div className="space-y-1 min-w-0">
              <CardTitle className="flex items-center gap-2 2xl:text-2xl">
                <Package className="h-5 w-5" />
                Product Detail
              </CardTitle>
              <CardDescription className="2xl:text-base">
                Product Detail + Barcode Print + Stock IN/OUT/Adjust + History
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <Button
                size="sm"
                onClick={() => router.push(`/products/${product.id}/edit`)}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => openStockModal("IN")}
              >
                <TrendingUp className="h-4 w-4" />
                Stock IN
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => openStockModal("OUT")}
              >
                <TrendingDown className="h-4 w-4" />
                Stock OUT
              </Button>

              <Button
                size="sm"
                variant="secondary"
                className="gap-2"
                onClick={() => openStockModal("ADJUST")}
              >
                <History className="h-4 w-4" />
                Adjust
              </Button>
            </div>
          </CardHeader>

          {/* ✅ 2xl grid: image 2 cols + info 3 cols */}
          <CardContent className="grid gap-6 2xl:gap-8 md:grid-cols-2 2xl:grid-cols-5 min-w-0 px-5 md:px-6 2xl:px-8 pb-6 2xl:pb-8">
            {/* Image */}
            <div className="flex items-center justify-center rounded-2xl border bg-muted min-h-[260px] 2xl:min-h-[420px] 2xl:col-span-2 overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.product_name}
                  className="max-h-[320px] 2xl:max-h-[520px] object-contain"
                />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-sm">No Image</span>
                </div>
              )}
            </div>

            {/* Info + Barcode */}
            <div className="space-y-4 2xl:space-y-6 min-w-0 2xl:col-span-3">
              <div className="min-w-0">
                <h2 className="text-xl 2xl:text-3xl font-semibold break-words">
                  {product.product_name}
                </h2>
                <div className="text-sm 2xl:text-base text-muted-foreground">
                  SKU: <span className="font-mono">{product.sku}</span>
                </div>
                {product.barcode && (
                  <div className="text-sm 2xl:text-base text-muted-foreground">
                    Barcode:{" "}
                    <span className="font-mono">{product.barcode}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-base 2xl:text-lg">
                    {product.product_price.toLocaleString()}
                  </span>
                  {product.product_discount ? (
                    <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                      -{product.product_discount}
                    </Badge>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Boxes className="h-4 w-4 text-muted-foreground" />
                  <span
                    className={
                      stock <= 0
                        ? "text-red-600 font-medium"
                        : stock < 5
                        ? "text-amber-600 font-medium"
                        : "font-medium"
                    }
                  >
                    Stock: {stock}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.category && (
                  <Badge variant="outline">{product.category}</Badge>
                )}
                {product.product_type && (
                  <Badge variant="secondary">{product.product_type}</Badge>
                )}
              </div>

              {product.note && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm 2xl:text-base font-medium">Note</div>
                    <p className="text-sm 2xl:text-base text-muted-foreground whitespace-pre-wrap">
                      {product.note}
                    </p>
                  </div>
                </>
              )}

              <Separator />

              {/* Barcode Block */}
              <div className="rounded-2xl border p-4 2xl:p-5 bg-background min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-sm 2xl:text-base font-medium">
                    <BarcodeIcon className="h-4 w-4 text-muted-foreground" />
                    Barcode
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={printBarcode}
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                </div>

                <div className="mt-3 2xl:mt-4 overflow-x-auto">
                  <svg ref={barcodeSvgRef} />
                </div>

                <div className="text-xs 2xl:text-sm text-muted-foreground mt-2">
                  Print ထုတ်ရာမှာ Barcode value အဖြစ်{" "}
                  <b>{product.barcode ? "barcode" : "SKU"}</b> ကိုသုံးထားပါတယ်။
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock History / Movements */}
        <Card className="overflow-hidden min-w-0">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between px-5 md:px-6 2xl:px-8 py-5 2xl:py-6">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 2xl:text-2xl">
                <History className="h-5 w-5" />
                Stock Movements
              </CardTitle>
              <CardDescription className="2xl:text-base">
                Stock ဝင်/ထွက်/ပြင်ဆင်မှု history ကိုကြည့်နိုင်ပါတယ်
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="secondary" className="gap-1">
                <History className="h-3.5 w-3.5" />
                Page size
              </Badge>

              <select
                className="h-9 rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={mPageSize}
                onChange={(e) => {
                  setMPageSize(Number(e.target.value));
                  setMPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => loadMovements(true)}
                disabled={movesLoading}
              >
                <RefreshCw
                  className={cn("h-4 w-4", movesLoading && "animate-spin")}
                />
                Refresh
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 2xl:space-y-4 min-w-0 px-5 md:px-6 2xl:px-8 pb-6 2xl:pb-8">
            <div className="text-xs 2xl:text-sm text-muted-foreground">
              {movesLoading
                ? "Loading movements..."
                : `Showing ${
                    mTotal === 0 ? 0 : (mSafePage - 1) * mPageSize + 1
                  }-${Math.min(mSafePage * mPageSize, mTotal)} of ${mTotal}`}
            </div>

            <div className="w-full min-w-0 overflow-x-auto rounded-2xl border">
              <ScrollArea className="max-h-[360px] 2xl:max-h-[520px]">
                <table className="min-w-[880px] 2xl:min-w-[1100px] w-full text-sm 2xl:text-base">
                  <thead className="sticky top-0 bg-background/95 backdrop-blur border-b">
                    <tr className="text-left">
                      <th className="p-3">Type</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Before</th>
                      <th className="p-3 text-right">After</th>
                      <th className="p-3">Note</th>
                      <th className="p-3">By</th>
                      <th className="p-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mTotal === 0 && movesFirstLoaded && (
                      <tr>
                        <td className="p-4 text-muted-foreground" colSpan={7}>
                          Movements မရှိသေးပါ (သို့) backend endpoint မထည့်ရသေးပါ။
                        </td>
                      </tr>
                    )}

                    {pagedMoves.map((m) => (
                      <tr key={m.id} className="border-b hover:bg-muted/40">
                        <td className="p-3">{movementBadge(m.type)}</td>
                        <td className="p-3 text-right font-mono">
                          {Number(m.qty).toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {Number(m.before_qty).toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {Number(m.after_qty).toLocaleString()}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {m.note || "-"}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {m.user_name || "-"}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(m.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>

            {/* pagination */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="text-xs 2xl:text-sm text-muted-foreground whitespace-nowrap">
                Page <b>{mSafePage}</b> / <b>{mTotalPages}</b>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={mSafePage <= 1}
                  onClick={() => setMPage((p) => Math.max(1, p - 1))}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  disabled={mSafePage >= mTotalPages}
                  onClick={() => setMPage((p) => Math.min(mTotalPages, p + 1))}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="text-xs 2xl:text-sm text-muted-foreground">
              Endpoint:{" "}
              <code className="px-1 py-0.5 rounded bg-muted">
                GET /api/products/:id/movements
              </code>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Modal */}
      <Dialog open={stockOpen} onOpenChange={setStockOpen}>
        <DialogContent className="sm:max-w-md 2xl:sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {stockMode === "IN"
                ? "Stock IN"
                : stockMode === "OUT"
                ? "Stock OUT"
                : "Stock Adjust"}
            </DialogTitle>
            <DialogDescription>
              {stockMode === "ADJUST"
                ? "Final stock number (absolute) ကို သတ်မှတ်ပါ"
                : "Qty (delta) ကို ထည့်ပါ"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid gap-2">
              <Label>Qty</Label>
              <Input
                type="number"
                value={stockQty}
                onChange={(e) => setStockQty(Number(e.target.value))}
                min={stockMode === "ADJUST" ? 0 : 1}
              />
              {stockMode === "OUT" && (
                <p className="text-xs text-muted-foreground">
                  Current stock: <b>{product?.product_quantity_amount ?? 0}</b>
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Note (optional)</Label>
              <Input
                value={stockNote}
                onChange={(e) => setStockNote(e.target.value)}
                placeholder="e.g. restock from supplier / sale invoice..."
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setStockOpen(false)}
              disabled={stockSaving}
            >
              Cancel
            </Button>
            <Button onClick={submitStock} disabled={stockSaving}>
              {stockSaving ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
