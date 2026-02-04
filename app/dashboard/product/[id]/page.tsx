
// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useParams, useRouter } from "next/navigation";

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
//   product_image?: string | null;
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
//   created_at: string; // ISO
//   user_name?: string | null;
// };

// function cn(...classes: (string | false | null | undefined)[]) {
//   return classes.filter(Boolean).join(" ");
// }

// export default function ProductViewPage() {
//   const router = useRouter();
//   const params = useParams<{ id: string }>();
//   const id = params.id;

//   const apiBase = process.env.NEXT_PUBLIC_API_URL;

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

//   const barcodeValue =
//     (product?.barcode && product.barcode.trim() !== "" ? product.barcode : null) ??
//     product?.sku ??
//     "";

//   async function loadProduct() {
//     try {
//       setLoading(true);
//       const res = await fetch(`${apiBase}/api/products/${id}`, {
//         credentials: "include",
//       });

//       if (!res.ok) {
//         toast.error("Product load မရပါ");
//         return;
//       }

//       const data = (await res.json()) as Product;
//       setProduct(data);
//     } catch (e) {
//       console.error(e);
//       toast.error("Server error ဖြစ်နေတယ်");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function loadMovements(resetPage = false) {
//     try {
//       setMovesLoading(true);

//       // ✅ endpoint (လိုအပ်) : GET /api/products/:id/movements
//       const res = await fetch(`${apiBase}/api/products/${id}/movements`, {
//         credentials: "include",
//       });

//       if (!res.ok) {
//         // endpoint မရှိသေးရင် error မပြင်းထန်အောင် quiet
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

//   // render barcode whenever barcodeValue changes
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
//       // invalid data for CODE128 etc.
//       console.error(e);
//     }
//   }, [barcodeValue]);

//   useEffect(() => {
//     if (!id) return;
//     loadProduct();
//     loadMovements(true);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [id]);

//   const imageUrl =
//     product?.product_image && product.product_image.startsWith("http")
//       ? product.product_image
//       : product?.product_image
//       ? `${apiBase}${product.product_image}`
//       : null;

//   const stock = product?.product_quantity_amount ?? 0;

//   // movements pagination (frontend)
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

//     const html = `
// <!doctype html>
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

//   if (loading) {
//     return (
//       <div className="flex justify-center py-10 text-muted-foreground">
//         Loading product...
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="flex justify-center py-10 text-muted-foreground">
//         Product not found
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
//                 Product အချက်အလက် အသေးစိတ် + Barcode Print + Stock History
//               </CardDescription>
//             </div>

//             <div className="flex flex-wrap gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => router.back()}
//                 className="gap-2"
//               >
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
//             </div>
//           </CardHeader>

//           <CardContent className="grid gap-6 md:grid-cols-2 min-w-0">
//             {/* Image */}
//             <div className="flex items-center justify-center rounded-xl border bg-muted min-h-[260px]">
//               {imageUrl ? (
//                 <img
//                   src={imageUrl}
//                   alt={product.product_name}
//                   className="max-h-[320px] object-contain"
//                 />
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
//                 <h2 className="text-xl font-semibold break-words">
//                   {product.product_name}
//                 </h2>
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
//                   <span className="font-medium">
//                     {product.product_price.toLocaleString()}
//                   </span>
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
//                 {product.product_type && (
//                   <Badge variant="secondary">{product.product_type}</Badge>
//                 )}
//               </div>

//               {product.note && (
//                 <>
//                   <Separator />
//                   <div>
//                     <div className="text-sm font-medium">Note</div>
//                     <p className="text-sm text-muted-foreground whitespace-pre-wrap">
//                       {product.note}
//                     </p>
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

//                   <Button
//                     size="sm"
//                     variant="outline"
//                     className="gap-2"
//                     onClick={printBarcode}
//                   >
//                     <Printer className="h-4 w-4" />
//                     Print
//                   </Button>
//                 </div>

//                 <div className="mt-2 overflow-x-auto">
//                   {/* SVG barcode rendered by JsBarcode */}
//                   <svg ref={barcodeSvgRef} />
//                 </div>

//                 <div className="text-xs text-muted-foreground mt-1">
//                   Print ထုတ်ရာမှာ Barcode value အဖြစ်{" "}
//                   <b>{product.barcode ? "barcode" : "SKU"}</b> ကိုသုံးထားပါတယ်။
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
//               <CardDescription>
//                 Stock ဝင်/ထွက်/ပြင်ဆင်မှု history ကိုကြည့်နိုင်ပါတယ်
//               </CardDescription>
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

//               <Button
//                 size="sm"
//                 variant="outline"
//                 className="gap-2"
//                 onClick={() => loadMovements(true)}
//                 disabled={movesLoading}
//               >
//                 <RefreshCw className={cn("h-4 w-4", movesLoading && "animate-spin")} />
//                 Refresh
//               </Button>
//             </div>
//           </CardHeader>

//           <CardContent className="space-y-3 min-w-0">
//             <div className="text-xs text-muted-foreground">
//               {movesLoading
//                 ? "Loading movements..."
//                 : `Showing ${(mTotal === 0 ? 0 : (mSafePage - 1) * mPageSize + 1)}-${Math.min(
//                     mSafePage * mPageSize,
//                     mTotal
//                   )} of ${mTotal}`}
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
//                         <td className="p-3 text-right font-mono">
//                           {Number(m.qty).toLocaleString()}
//                         </td>
//                         <td className="p-3 text-right font-mono">
//                           {Number(m.before_qty).toLocaleString()}
//                         </td>
//                         <td className="p-3 text-right font-mono">
//                           {Number(m.after_qty).toLocaleString()}
//                         </td>
//                         <td className="p-3 text-muted-foreground">
//                           {m.note || "-"}
//                         </td>
//                         <td className="p-3 text-muted-foreground">
//                           {m.user_name || "-"}
//                         </td>
//                         <td className="p-3 text-muted-foreground">
//                           {new Date(m.created_at).toLocaleString()}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </ScrollArea>
//             </div>

//             {/* movements pagination */}
//             <div className="flex items-center justify-between gap-2 flex-wrap">
//               <div className="text-xs text-muted-foreground whitespace-nowrap">
//                 Page <b>{mSafePage}</b> / <b>{mTotalPages}</b>
//               </div>

//               <div className="flex items-center gap-2 flex-wrap">
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   disabled={mSafePage <= 1}
//                   onClick={() => setMPage((p) => Math.max(1, p - 1))}
//                   className="gap-1"
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                   Prev
//                 </Button>

//                 <Button
//                   size="sm"
//                   variant="outline"
//                   disabled={mSafePage >= mTotalPages}
//                   onClick={() => setMPage((p) => Math.min(mTotalPages, p + 1))}
//                   className="gap-1"
//                 >
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
  product_image?: string | null;
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

export default function ProductViewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

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

  // ✅ stock modal state
  const [stockOpen, setStockOpen] = useState(false);
  const [stockMode, setStockMode] = useState<"IN" | "OUT" | "ADJUST">("IN");
  const [stockQty, setStockQty] = useState<number>(1);
  const [stockNote, setStockNote] = useState<string>("");
  const [stockSaving, setStockSaving] = useState(false);

  const barcodeValue =
    (product?.barcode && product.barcode.trim() !== ""
      ? product.barcode
      : null) ??
    product?.sku ??
    "";

  async function loadProduct() {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/products/${id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const d = await res.json().catch(() => null);
        toast.error(d?.message || "Product load မရပါ");
        return;
      }

      const data = (await res.json()) as Product;
      setProduct(data);
    } catch (e) {
      console.error(e);
      toast.error("Server error ဖြစ်နေတယ်");
    } finally {
      setLoading(false);
    }
  }

  async function loadMovements(resetPage = false) {
    try {
      setMovesLoading(true);

      const res = await fetch(`${apiBase}/api/products/${id}/movements`, {
        credentials: "include",
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

  // ✅ open modal helper
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

  // ✅ submit stock update
  async function submitStock() {
    if (!product) return;

    try {
      setStockSaving(true);

      const url =
        stockMode === "IN"
          ? `${apiBase}/api/products/${product.id}/stock-in`
          : stockMode === "OUT"
          ? `${apiBase}/api/products/${product.id}/stock-out`
          : `${apiBase}/api/products/${product.id}/stock-adjust`;

      const method = stockMode === "ADJUST" ? "PATCH" : "POST";

      const qtyNum = Number(stockQty);
      if (!Number.isFinite(qtyNum)) {
        toast.error("Qty မှန်မှန်ထည့်ပါ");
        return;
      }
      if (stockMode === "ADJUST") {
        if (!Number.isInteger(qtyNum) || qtyNum < 0) {
          toast.error("Adjust qty ကို 0 သို့ အပေါင်းကိန်း ထည့်ပါ");
          return;
        }
      } else {
        if (!Number.isInteger(qtyNum) || qtyNum <= 0) {
          toast.error("Qty ကို 1 ထက်ကြီးတဲ့ အပေါင်းကိန်း ထည့်ပါ");
          return;
        }
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

      // refresh UI
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
    loadProduct();
    loadMovements(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const imageUrl =
    product?.product_image && product.product_image.startsWith("http")
      ? product.product_image
      : product?.product_image
      ? `${apiBase}${product.product_image}`
      : null;

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
    .wrap { width: 320px; border: 1px solid #ddd; border-radius: 12px; padding: 14px; }
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

    const w = window.open("", "_blank", "width=420,height=520");
    if (!w) {
      toast.error("Popup blocked ဖြစ်နေတယ် (Allow popups လုပ်ပါ)");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10 text-muted-foreground">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center py-10 text-muted-foreground">
        Product not found
      </div>
    );
  }

  return (
    <div className="flex justify-center py-8 px-3 overflow-x-hidden">
      <div className="w-full max-w-5xl min-w-0 space-y-6">
        {/* Product Detail */}
        <Card className="overflow-hidden min-w-0">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1 min-w-0">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Detail
              </CardTitle>
              <CardDescription>
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

          <CardContent className="grid gap-6 md:grid-cols-2 min-w-0">
            {/* Image */}
            <div className="flex items-center justify-center rounded-xl border bg-muted min-h-[260px]">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.product_name}
                  className="max-h-[320px] object-contain"
                />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-sm">No Image</span>
                </div>
              )}
            </div>

            {/* Info + Barcode */}
            <div className="space-y-4 min-w-0">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold break-words">
                  {product.product_name}
                </h2>
                <div className="text-sm text-muted-foreground">
                  SKU: <span className="font-mono">{product.sku}</span>
                </div>
                {product.barcode && (
                  <div className="text-sm text-muted-foreground">
                    Barcode: <span className="font-mono">{product.barcode}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {product.product_price.toLocaleString()}
                  </span>
                  {product.product_discount ? (
                    <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                      -{product.product_discount}
                    </Badge>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
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
                    <div className="text-sm font-medium">Note</div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {product.note}
                    </p>
                  </div>
                </>
              )}

              <Separator />

              {/* Barcode Block */}
              <div className="rounded-xl border p-3 bg-background min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-sm font-medium">
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

                <div className="mt-2 overflow-x-auto">
                  <svg ref={barcodeSvgRef} />
                </div>

                <div className="text-xs text-muted-foreground mt-1">
                  Print ထုတ်ရာမှာ Barcode value အဖြစ်{" "}
                  <b>{product.barcode ? "barcode" : "SKU"}</b> ကိုသုံးထားပါတယ်။
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock History / Movements */}
        <Card className="overflow-hidden min-w-0">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Stock Movements
              </CardTitle>
              <CardDescription>
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

          <CardContent className="space-y-3 min-w-0">
            <div className="text-xs text-muted-foreground">
              {movesLoading
                ? "Loading movements..."
                : `Showing ${
                    mTotal === 0 ? 0 : (mSafePage - 1) * mPageSize + 1
                  }-${Math.min(mSafePage * mPageSize, mTotal)} of ${mTotal}`}
            </div>

            <div className="w-full min-w-0 overflow-x-auto rounded-xl border">
              <ScrollArea className="max-h-[360px]">
                <table className="min-w-[880px] w-full text-sm">
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
              <div className="text-xs text-muted-foreground whitespace-nowrap">
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

            <div className="text-xs text-muted-foreground">
              Endpoint:{" "}
              <code className="px-1 py-0.5 rounded bg-muted">
                GET /api/products/:id/movements
              </code>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Stock Modal */}
      <Dialog open={stockOpen} onOpenChange={setStockOpen}>
        <DialogContent className="sm:max-w-md">
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

