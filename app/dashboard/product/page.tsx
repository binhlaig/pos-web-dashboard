
// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";

// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card";

// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";

// import {
//   AlertDialog,
//   AlertDialogTrigger,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogCancel,
//   AlertDialogAction,
// } from "@/components/ui/alert-dialog";

// import {
//   Search,
//   Plus,
//   RefreshCw,
//   Package,
//   ChevronLeft,
//   ChevronRight,
//   Eye,
//   Pencil,
//   Trash2,
//   ImageIcon,
//   Tag,
//   Boxes,
// } from "lucide-react";

// import { toast } from "sonner";

// type Product = {
//   id: string;
//   sku: string;
//   productName: string;
//   productPrice: number;
//   barcode?: string | null;
//   category?: string | null;
//   productQuantityAmount: number;
//   imagePath?: string | null;
//   productDiscount?: number | null;
//   note?: string | null;
//   productType?: string | null;
// };

// function cn(...classes: (string | false | null | undefined)[]) {
//   return classes.filter(Boolean).join(" ");
// }

// // normalize backend response (camelCase / snake_case)
// // so UI is always consistent
// function normalizeProduct(p: any): Product {
//   return {
//     id: String(p?.id ?? ""),
//     sku: String(p?.sku ?? ""),
//     productName: String(p?.productName ?? p?.product_name ?? p?.name ?? ""),
//     productPrice: Number(p?.productPrice ?? p?.product_price ?? p?.price ?? 0),
//     productQuantityAmount: Number(
//       p?.productQuantityAmount ?? p?.product_quantity_amount ?? p?.stock ?? 0
//     ),
//     barcode: p?.barcode ?? null,
//     category: p?.category ?? null,
//     productType: p?.productType ?? p?.product_type ?? null,
//     productDiscount: Number(
//       p?.productDiscount ?? p?.product_discount ?? p?.discount ?? 0
//     ),
//     note: p?.note ?? null,
//     imagePath: p?.imagePath ?? p?.image_path ?? p?.product_image ?? null,
//   };
// }

// export default function ProductsPage() {
//   const router = useRouter();
//   const { data: session, status } = useSession();

//   const accessToken = (session as any)?.accessToken as string | undefined;
//   const tokenType = ((session as any)?.tokenType as string | undefined) ?? "Bearer";

//   const apiBase = useMemo(
//     () => (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, ""),
//     []
//   );

//   const [products, setProducts] = useState<Product[]>([]);
//   const [q, setQ] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [firstLoaded, setFirstLoaded] = useState(false);

//   // pagination
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   // delete
//   const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
//   const [deletingId, setDeletingId] = useState<string | null>(null);

//   async function loadProducts(search?: string, resetPage: boolean = false) {
//     if (!apiBase) {
//       toast.error("NEXT_PUBLIC_API_URL မထည့်ရသေးပါ (.env.local)");
//       return;
//     }

//     // Wait session
//     if (status === "loading") return;

//     // Must login
//     if (!accessToken) {
//       toast.error("Login မဝင်ရသေးပါ");
//       router.push("/login");
//       return;
//     }

//     try {
//       setLoading(true);

//       const query = search ? `?q=${encodeURIComponent(search)}` : "";
//       const res = await fetch(`${apiBase}/api/products${query}`, {
//         method: "GET",
//         headers: {
//           Authorization: `${tokenType} ${accessToken}`,
//           Accept: "application/json",
//         },
//         cache: "no-store",
//       });

//       const text = await res.text().catch(() => "");

//       if (!res.ok) {
//         let msg = `Products load မရပါ (status ${res.status})`;
//         try {
//           const j = JSON.parse(text || "{}");
//           msg = j?.message || j?.error || msg;
//         } catch {
//           if (text) msg = text;
//         }
//         toast.error(msg);
//         setFirstLoaded(true);
//         return;
//       }

//       const raw = text ? JSON.parse(text) : [];
//       const arr = Array.isArray(raw) ? raw : raw?.content ?? raw?.data ?? [];
//       const normalized = (Array.isArray(arr) ? arr : []).map(normalizeProduct);

//       setProducts(normalized);
//       setFirstLoaded(true);

//       // keep page if not reset, clamp to total pages
//       const newTotalPages = Math.max(1, Math.ceil(normalized.length / pageSize));
//       if (resetPage) setPage(1);
//       else setPage((prev) => Math.min(prev, newTotalPages));
//     } catch (e) {
//       console.error(e);
//       toast.error("Server error ဖြစ်နေတယ်");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function confirmDelete() {
//     if (!deleteTarget) return;

//     if (!apiBase) {
//       toast.error("NEXT_PUBLIC_API_URL မထည့်ရသေးပါ");
//       return;
//     }
//     if (!accessToken) {
//       toast.error("Login မဝင်ရသေးပါ");
//       router.push("/login");
//       return;
//     }

//     try {
//       setDeletingId(deleteTarget.id);

//       const res = await fetch(`${apiBase}/api/products/${deleteTarget.id}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `${tokenType} ${accessToken}`,
//         },
//       });

//       const text = await res.text().catch(() => "");

//       if (!res.ok) {
//         let msg = "Delete မအောင်မြင်ပါ";
//         try {
//           const j = JSON.parse(text || "{}");
//           msg = j?.message || j?.error || msg;
//         } catch {
//           if (text) msg = text;
//         }
//         toast.error(msg);
//         return;
//       }

//       toast.success("Product ဖျက်ပြီးပါပြီ");
//       await loadProducts(q.trim() || undefined, false); // keep current page
//     } catch (e) {
//       console.error(e);
//       toast.error("Server error (delete)");
//     } finally {
//       setDeletingId(null);
//       setDeleteTarget(null);
//     }
//   }

//   useEffect(() => {
//     // load once when session ready
//     if (status !== "loading") loadProducts(undefined, true);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [status, accessToken]);

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     loadProducts(q.trim() || undefined, true);
//   };

//   // pagination math
//   const total = products.length;
//   const totalPages = Math.max(1, Math.ceil(total / pageSize));
//   const safePage = Math.min(Math.max(page, 1), totalPages);

//   const pagedProducts = useMemo(() => {
//     const start = (safePage - 1) * pageSize;
//     return products.slice(start, start + pageSize);
//   }, [products, safePage, pageSize]);

//   const showingFrom = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
//   const showingTo = Math.min(safePage * pageSize, total);

//   const pageButtons = useMemo(() => {
//     const buttons: number[] = [];
//     const max = totalPages;

//     const windowSize = 5;
//     let start = Math.max(1, safePage - Math.floor(windowSize / 2));
//     let end = Math.min(max, start + windowSize - 1);
//     start = Math.max(1, end - windowSize + 1);

//     for (let i = start; i <= end; i++) buttons.push(i);
//     return buttons;
//   }, [safePage, totalPages]);

//   return (
//     <div className="flex w-full justify-center py-8 px-3 overflow-x-hidden">
//       <Card className="w-full max-w-6xl overflow-hidden border-muted/60 shadow-sm min-w-0">
//         <CardHeader className="bg-gradient-to-r from-muted/40 to-background flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
//           <div className="space-y-1 min-w-0">
//             <CardTitle className="flex items-center gap-2">
//               <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
//                 <Package className="h-5 w-5" />
//               </span>
//               <span className="text-xl">Products</span>
//             </CardTitle>
//             <CardDescription className="text-[13px]">
//               စူပါမားကက်ထဲရှိ product စာရင်းကို ကြည့်ရှုနိုင်သော စာမျက်နှာ ဖြစ်သည်။
//             </CardDescription>
//           </div>

//           <div className="flex flex-wrap gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               type="button"
//               onClick={() => loadProducts(q.trim() || undefined, true)}
//               disabled={loading}
//               className="gap-2"
//             >
//               <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
//               Refresh
//             </Button>

//             <Button
//               size="sm"
//               type="button"
//               onClick={() => router.push("/dashboard/product/add")}
//               className="gap-2"
//             >
//               <Plus className="h-4 w-4" />
//               New Product
//             </Button>
//           </div>
//         </CardHeader>

//         <CardContent className="space-y-4 p-5 min-w-0">
//           <form
//             onSubmit={handleSearch}
//             className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between min-w-0"
//           >
//             <div className="flex w-full gap-2 md:max-w-lg min-w-0">
//               <div className="relative flex-1 min-w-0">
//                 <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   className="pl-8"
//                   placeholder="SKU / Name / Barcode နဲ့ရှာနိုင်ပါတယ်..."
//                   value={q}
//                   onChange={(e) => setQ(e.target.value)}
//                 />
//               </div>
//               <Button type="submit" variant="outline" disabled={loading}>
//                 Search
//               </Button>
//             </div>

//             <div className="flex items-center justify-between gap-2 w-full md:w-auto min-w-0">
//               <div className="text-xs text-muted-foreground whitespace-nowrap">
//                 {loading
//                   ? "Loading..."
//                   : `Showing ${showingFrom}-${showingTo} of ${total}`}
//               </div>

//               <div className="flex items-center gap-2">
//                 <Badge variant="secondary" className="gap-1 whitespace-nowrap">
//                   <Boxes className="h-3.5 w-3.5" />
//                   Page size
//                 </Badge>

//                 <select
//                   className="h-9 rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
//                   value={pageSize}
//                   onChange={(e) => {
//                     setPageSize(Number(e.target.value));
//                     setPage(1);
//                   }}
//                 >
//                   <option value={10}>10</option>
//                   <option value={20}>20</option>
//                   <option value={50}>50</option>
//                 </select>
//               </div>
//             </div>
//           </form>

//           <Separator />

//           <div className="w-full min-w-0 overflow-x-auto rounded-xl border">
//             <ScrollArea className="w-full max-h-[560px]">
//               <Table className="min-w-[980px]">
//                 <TableCaption>
//                   {total === 0 && firstLoaded
//                     ? "Product မရှိသေးပါ။ New Product ခလုတ်နှိပ်၍ အသစ်ထည့်နိုင်ပါတယ်။"
//                     : "Products list"}
//                 </TableCaption>

//                 <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
//                   <TableRow>
//                     <TableHead className="w-[86px]">Image</TableHead>
//                     <TableHead>SKU</TableHead>
//                     <TableHead>Name</TableHead>
//                     <TableHead className="text-right">Price</TableHead>
//                     <TableHead className="text-right">Stock</TableHead>
//                     <TableHead>Category</TableHead>
//                     <TableHead>Type</TableHead>
//                     <TableHead className="text-right">Discount</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>

//                 <TableBody>
//                   {total === 0 && (
//                     <TableRow>
//                       <TableCell colSpan={9} className="text-center py-10">
//                         {firstLoaded
//                           ? "Product မတွေ့ရပါဘူး၊ Search keyword ကိုပြောင်းကြည့်ပါ။"
//                           : "Loading..."}
//                       </TableCell>
//                     </TableRow>
//                   )}

//                   {pagedProducts.map((p) => {
//                     const discount = p.productDiscount ?? 0;
//                     const stock = p.productQuantityAmount ?? 0;

//                     const hasImage = p.imagePath && p.imagePath.trim() !== "";
//                     const imageUrl =
//                       hasImage && p.imagePath!.startsWith("http")
//                         ? p.imagePath!
//                         : hasImage
//                         ? `${apiBase}${p.imagePath}`
//                         : null;

//                     const stockBadge =
//                       stock <= 0 ? (
//                         <Badge className="bg-red-500/10 text-red-600 border border-red-500/20">
//                           Out
//                         </Badge>
//                       ) : stock < 5 ? (
//                         <Badge className="bg-amber-500/10 text-amber-700 border border-amber-500/20">
//                           Low
//                         </Badge>
//                       ) : (
//                         <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
//                           In
//                         </Badge>
//                       );

//                     return (
//                       <TableRow
//                         key={p.id}
//                         className="hover:bg-muted/40 transition-colors"
//                       >
//                         <TableCell>
//                           {imageUrl ? (
//                             <img
//                               src={imageUrl}
//                               alt={p.productName}
//                               className="h-12 w-12 rounded-xl object-cover border bg-muted shadow-sm"
//                             />
//                           ) : (
//                             <div className="h-12 w-12 rounded-xl border flex items-center justify-center bg-muted text-muted-foreground">
//                               <ImageIcon className="h-4 w-4" />
//                             </div>
//                           )}
//                         </TableCell>

//                         <TableCell className="font-mono text-xs">
//                           <span className="rounded-md bg-muted px-2 py-1">
//                             {p.sku}
//                           </span>
//                         </TableCell>

//                         <TableCell>
//                           <div className="flex flex-col gap-0.5">
//                             <div className="flex items-center gap-2">
//                               <span className="font-medium">{p.productName}</span>

//                               {discount > 0 && (
//                                 <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 gap-1">
//                                   <Tag className="h-3.5 w-3.5" />
//                                   Sale
//                                 </Badge>
//                               )}
//                             </div>

//                             {p.barcode && (
//                               <span className="text-[11px] text-muted-foreground">
//                                 Barcode: {p.barcode}
//                               </span>
//                             )}

//                             {p.note && (
//                               <span className="text-[11px] text-muted-foreground line-clamp-1">
//                                 {p.note}
//                               </span>
//                             )}
//                           </div>
//                         </TableCell>

//                         <TableCell className="text-right">
//                           <span className="font-mono font-semibold">
//                             {p.productPrice.toLocaleString()}
//                           </span>
//                         </TableCell>

//                         <TableCell className="text-right">
//                           <div className="flex items-center justify-end gap-2">
//                             {stockBadge}
//                             <span
//                               className={cn(
//                                 "font-mono",
//                                 stock <= 0 && "text-red-600 font-semibold",
//                                 stock > 0 &&
//                                   stock < 5 &&
//                                   "text-amber-700 font-semibold"
//                               )}
//                             >
//                               {stock}
//                             </span>
//                           </div>
//                         </TableCell>

//                         <TableCell>
//                           {p.category ? (
//                             <Badge variant="outline" className="text-[11px]">
//                               {p.category}
//                             </Badge>
//                           ) : (
//                             <span className="text-xs text-muted-foreground">
//                               -
//                             </span>
//                           )}
//                         </TableCell>

//                         <TableCell>
//                           {p.productType ? (
//                             <Badge
//                               variant="secondary"
//                               className="text-[11px] uppercase"
//                             >
//                               {p.productType}
//                             </Badge>
//                           ) : (
//                             <span className="text-xs text-muted-foreground">-</span>
//                           )}
//                         </TableCell>

//                         <TableCell className="text-right">
//                           {discount > 0 ? (
//                             <span className="text-sm text-emerald-700 font-semibold">
//                               -{discount.toLocaleString()}
//                             </span>
//                           ) : (
//                             <span className="text-xs text-muted-foreground">0</span>
//                           )}
//                         </TableCell>

//                         <TableCell className="text-right">
//                           <div className="flex justify-end gap-2">
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               type="button"
//                               onClick={() =>
//                                 router.push(`/dashboard/product/${p.id}`)
//                               }
//                               className="gap-2 hover:bg-primary/5"
//                             >
//                               <Eye className="h-4 w-4" />
//                               View
//                             </Button>

//                             <Button
//                               size="sm"
//                               variant="secondary"
//                               type="button"
//                               onClick={() =>
//                                 router.push(`/dashboard/product/${p.id}/edit`)
//                               }
//                               className="gap-2"
//                             >
//                               <Pencil className="h-4 w-4" />
//                               Edit
//                             </Button>

//                             <AlertDialog>
//                               <AlertDialogTrigger asChild>
//                                 <Button
//                                   size="sm"
//                                   variant="destructive"
//                                   type="button"
//                                   onClick={() => setDeleteTarget(p)}
//                                   disabled={deletingId === p.id}
//                                   className="gap-2"
//                                 >
//                                   <Trash2 className="h-4 w-4" />
//                                   {deletingId === p.id ? "Deleting..." : "Delete"}
//                                 </Button>
//                               </AlertDialogTrigger>

//                               <AlertDialogContent>
//                                 <AlertDialogHeader>
//                                   <AlertDialogTitle>
//                                     Product ဖျက်မလား?
//                                   </AlertDialogTitle>

//                                   <AlertDialogDescription>
//                                     <span>
//                                       ဒီ product ကို ဖျက်လိုက်ရင်{" "}
//                                       <b>ပြန်လည်မရနိုင်ပါ</b>။
//                                     </span>
//                                     <br />
//                                     <br />
//                                     <span className="text-sm text-muted-foreground">
//                                       • Name: <b>{deleteTarget?.productName}</b>
//                                       <br />
//                                       • SKU: {deleteTarget?.sku}
//                                     </span>
//                                   </AlertDialogDescription>
//                                 </AlertDialogHeader>

//                                 <AlertDialogFooter>
//                                   <AlertDialogCancel
//                                     onClick={() => setDeleteTarget(null)}
//                                   >
//                                     မဖျက်ပါ
//                                   </AlertDialogCancel>
//                                   <AlertDialogAction
//                                     onClick={confirmDelete}
//                                     className="bg-red-600 hover:bg-red-700"
//                                   >
//                                     ဖျက်မည်
//                                   </AlertDialogAction>
//                                 </AlertDialogFooter>
//                               </AlertDialogContent>
//                             </AlertDialog>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })}
//                 </TableBody>
//               </Table>
//             </ScrollArea>
//           </div>

//           {/* Pagination */}
//           <div className="w-full min-w-0 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
//             <div className="text-xs text-muted-foreground whitespace-nowrap">
//               Page <span className="font-medium">{safePage}</span> /{" "}
//               <span className="font-medium">{totalPages}</span>
//             </div>

//             <div className="flex w-full min-w-0 flex-wrap items-center gap-2 md:w-auto">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 type="button"
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={safePage <= 1}
//                 className="gap-1"
//               >
//                 <ChevronLeft className="h-4 w-4" />
//                 Prev
//               </Button>

//               {pageButtons.map((n) => (
//                 <Button
//                   key={n}
//                   variant={n === safePage ? "default" : "outline"}
//                   size="sm"
//                   type="button"
//                   onClick={() => setPage(n)}
//                   className={cn("min-w-[40px]", n === safePage && "shadow-sm")}
//                 >
//                   {n}
//                 </Button>
//               ))}

//               <Button
//                 variant="outline"
//                 size="sm"
//                 type="button"
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={safePage >= totalPages}
//                 className="gap-1"
//               >
//                 Next
//                 <ChevronRight className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }





"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {
  Search,
  Plus,
  RefreshCw,
  Package,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  ImageIcon,
  Tag,
  Boxes,
} from "lucide-react";

import { toast } from "sonner";

type Product = {
  id: string;
  sku: string;
  productName: string;
  productPrice: number;
  barcode?: string | null;
  category?: string | null;
  productQuantityAmount: number;

  // image fields can vary
  imagePath?: string | null;
  image_path?: string | null;
  product_image?: string | null;

  productDiscount?: number | null;
  note?: string | null;
  productType?: string | null;
};

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// normalize backend response (camelCase / snake_case)
function normalizeProduct(p: any): Product {
  return {
    id: String(p?.id ?? ""),
    sku: String(p?.sku ?? ""),
    productName: String(p?.productName ?? p?.product_name ?? p?.name ?? ""),
    productPrice: Number(p?.productPrice ?? p?.product_price ?? p?.price ?? 0),
    productQuantityAmount: Number(
      p?.productQuantityAmount ?? p?.product_quantity_amount ?? p?.stock ?? 0
    ),
    barcode: p?.barcode ?? null,
    category: p?.category ?? null,
    productType: p?.productType ?? p?.product_type ?? null,
    productDiscount: Number(
      p?.productDiscount ?? p?.product_discount ?? p?.discount ?? 0
    ),
    note: p?.note ?? null,

    imagePath: p?.imagePath ?? null,
    image_path: p?.image_path ?? null,
    product_image: p?.product_image ?? null,
  };
}

function pickImagePath(p: Product) {
  return p.imagePath ?? p.image_path ?? p.product_image ?? null;
}

function buildImageUrl(path?: string | null) {
  if (!path) return null;
  const raw = String(path).trim();
  if (!raw) return null;

  // full url
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

export default function ProductsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const token =
    (session as any)?.accessToken ||
    (session as any)?.access_token ||
    (session as any)?.token ||
    null;

  function authHeaders(): Record<string, string> {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [firstLoaded, setFirstLoaded] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // delete
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ✅ If not logged in, go sign in
  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Login လုပ်ပါ");
      signIn();
    }
  }, [status]);

  async function loadProducts(search?: string, resetPage: boolean = false) {
    // Wait session
    if (status === "loading") return;

    // Must login
    if (!token) {
      toast.error("Session token မရပါ — Login ပြန်လုပ်ပါ");
      signIn();
      return;
    }

    const t = toast.loading("Loading products...");

    try {
      setLoading(true);

      const query = search ? `?q=${encodeURIComponent(search)}` : "";

      // ✅ Use rewrite base: /backend -> http://localhost:8080
      const res = await fetch(`/backend/api/products${query}`, {
        method: "GET",
        headers: {
          ...authHeaders(),
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const detail = await readErrorText(res);

        if (res.status === 401) {
          toast.error("Unauthorized — Login ပြန်လုပ်ပါ", { id: t });
          signIn();
        } else if (res.status === 403) {
          toast.error("Forbidden — ADMIN လိုနိုင်တယ်", { id: t });
        } else {
          toast.error(detail || `Products load မရပါ (status ${res.status})`, {
            id: t,
          });
        }

        setFirstLoaded(true);
        return;
      }

      const raw = await res.json().catch(() => []);
      const arr = Array.isArray(raw) ? raw : raw?.content ?? raw?.data ?? [];
      const normalized = (Array.isArray(arr) ? arr : []).map(normalizeProduct);

      setProducts(normalized);
      setFirstLoaded(true);

      // keep page if not reset, clamp to total pages
      const newTotalPages = Math.max(1, Math.ceil(normalized.length / pageSize));
      if (resetPage) setPage(1);
      else setPage((prev) => Math.min(prev, newTotalPages));

      toast.success("Loaded ✅", { id: t });
    } catch (e) {
      console.error(e);
      toast.error("Server error ဖြစ်နေတယ်", { id: t });
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    if (status === "loading") return;
    if (!token) {
      toast.error("Session token မရပါ — Login ပြန်လုပ်ပါ");
      signIn();
      return;
    }

    const t = toast.loading("Deleting...");

    try {
      setDeletingId(deleteTarget.id);

      const res = await fetch(`/backend/api/products/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });

      if (!res.ok) {
        const detail = await readErrorText(res);
        if (res.status === 401) {
          toast.error("Unauthorized — Login ပြန်လုပ်ပါ", { id: t });
          signIn();
        } else if (res.status === 403) {
          toast.error("Forbidden — ADMIN လိုနိုင်တယ်", { id: t });
        } else {
          toast.error(detail || "Delete မအောင်မြင်ပါ", { id: t });
        }
        return;
      }

      toast.success("Product ဖျက်ပြီးပါပြီ ✅", { id: t });
      await loadProducts(q.trim() || undefined, false);
    } catch (e) {
      console.error(e);
      toast.error("Server error (delete)", { id: t });
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  useEffect(() => {
    // load once when session ready
    if (status === "authenticated") loadProducts(undefined, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts(q.trim() || undefined, true);
  };

  // pagination math
  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const pagedProducts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, safePage, pageSize]);

  const showingFrom = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const showingTo = Math.min(safePage * pageSize, total);

  const pageButtons = useMemo(() => {
    const buttons: number[] = [];
    const max = totalPages;

    const windowSize = 5;
    let start = Math.max(1, safePage - Math.floor(windowSize / 2));
    let end = Math.min(max, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    for (let i = start; i <= end; i++) buttons.push(i);
    return buttons;
  }, [safePage, totalPages]);

  // ✅ 1920+ container
  return (
    <div className="flex w-full justify-center py-10 px-3 md:px-6 2xl:px-10 overflow-x-hidden">
      <Card className="w-full max-w-6xl 2xl:max-w-[1400px] overflow-hidden border-muted/60 shadow-sm min-w-0">
        <CardHeader className="bg-gradient-to-r from-muted/40 to-background flex flex-col gap-2 md:flex-row md:items-center md:justify-between px-5 md:px-6 2xl:px-8 py-5 2xl:py-6">
          <div className="space-y-1 min-w-0">
            <CardTitle className="flex items-center gap-2 2xl:text-2xl">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </span>
              <span>Products</span>
            </CardTitle>
            <CardDescription className="text-[13px] 2xl:text-base">
              စူပါမားကက်ထဲရှိ product စာရင်းကို ကြည့်ရှုနိုင်သော စာမျက်နှာ ဖြစ်သည်။
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => loadProducts(q.trim() || undefined, true)}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>

            <Button
              size="sm"
              type="button"
              onClick={() => router.push("/dashboard/product/add")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Product
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-5 md:px-6 2xl:px-8 py-5 2xl:py-6 min-w-0">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between min-w-0"
          >
            <div className="flex w-full gap-2 md:max-w-lg min-w-0">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="SKU / Name / Barcode နဲ့ရှာနိုင်ပါတယ်..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline" disabled={loading}>
                Search
              </Button>
            </div>

            <div className="flex items-center justify-between gap-2 w-full md:w-auto min-w-0">
              <div className="text-xs 2xl:text-sm text-muted-foreground whitespace-nowrap">
                {loading
                  ? "Loading..."
                  : `Showing ${showingFrom}-${showingTo} of ${total}`}
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1 whitespace-nowrap">
                  <Boxes className="h-3.5 w-3.5" />
                  Page size
                </Badge>

                <select
                  className="h-9 rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </form>

          <Separator />

          <div className="w-full min-w-0 overflow-x-auto rounded-2xl border">
            <ScrollArea className="w-full max-h-[560px] 2xl:max-h-[720px]">
              <Table className="min-w-[980px] 2xl:min-w-[1200px]">
                <TableCaption>
                  {total === 0 && firstLoaded
                    ? "Product မရှိသေးပါ။ New Product ခလုတ်နှိပ်၍ အသစ်ထည့်နိုင်ပါတယ်။"
                    : "Products list"}
                </TableCaption>

                <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
                  <TableRow>
                    <TableHead className="w-[96px]">Image</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {total === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10">
                        {firstLoaded
                          ? "Product မတွေ့ရပါဘူး၊ Search keyword ကိုပြောင်းကြည့်ပါ။"
                          : "Loading..."}
                      </TableCell>
                    </TableRow>
                  )}

                  {pagedProducts.map((p) => {
                    const discount = p.productDiscount ?? 0;
                    const stock = p.productQuantityAmount ?? 0;

                    // ✅ FIX: always build image url from /uploads rewrite
                    const imageUrl = buildImageUrl(pickImagePath(p));

                    const stockBadge =
                      stock <= 0 ? (
                        <Badge className="bg-red-500/10 text-red-600 border border-red-500/20">
                          Out
                        </Badge>
                      ) : stock < 5 ? (
                        <Badge className="bg-amber-500/10 text-amber-700 border border-amber-500/20">
                          Low
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                          In
                        </Badge>
                      );

                    return (
                      <TableRow
                        key={p.id}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <TableCell>
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={p.productName}
                              className="h-12 w-12 2xl:h-14 2xl:w-14 rounded-2xl object-cover border bg-muted shadow-sm"
                              onError={(e) => {
                                // if backend path wrong, show placeholder
                                (e.currentTarget as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : null}

                          {!imageUrl ? (
                            <div className="h-12 w-12 2xl:h-14 2xl:w-14 rounded-2xl border flex items-center justify-center bg-muted text-muted-foreground">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          ) : null}

                          {/* fallback placeholder if img failed */}
                          {imageUrl ? (
                            <div className="hidden h-12 w-12 2xl:h-14 2xl:w-14 rounded-2xl border items-center justify-center bg-muted text-muted-foreground">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          ) : null}
                        </TableCell>

                        <TableCell className="font-mono text-xs">
                          <span className="rounded-md bg-muted px-2 py-1">
                            {p.sku}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{p.productName}</span>

                              {discount > 0 && (
                                <Badge className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 gap-1">
                                  <Tag className="h-3.5 w-3.5" />
                                  Sale
                                </Badge>
                              )}
                            </div>

                            {p.barcode && (
                              <span className="text-[11px] text-muted-foreground">
                                Barcode: {p.barcode}
                              </span>
                            )}

                            {p.note && (
                              <span className="text-[11px] text-muted-foreground line-clamp-1">
                                {p.note}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <span className="font-mono font-semibold">
                            {p.productPrice.toLocaleString()}
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {stockBadge}
                            <span
                              className={cn(
                                "font-mono",
                                stock <= 0 && "text-red-600 font-semibold",
                                stock > 0 &&
                                  stock < 5 &&
                                  "text-amber-700 font-semibold"
                              )}
                            >
                              {stock}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          {p.category ? (
                            <Badge variant="outline" className="text-[11px]">
                              {p.category}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          {p.productType ? (
                            <Badge
                              variant="secondary"
                              className="text-[11px] uppercase"
                            >
                              {p.productType}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          {discount > 0 ? (
                            <span className="text-sm text-emerald-700 font-semibold">
                              -{discount.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">0</span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              type="button"
                              onClick={() =>
                                router.push(`/dashboard/product/${p.id}`)
                              }
                              className="gap-2 hover:bg-primary/5"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>

                            <Button
                              size="sm"
                              variant="secondary"
                              type="button"
                              onClick={() =>
                                router.push(`/dashboard/product/${p.id}/edit`)
                              }
                              className="gap-2"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  type="button"
                                  onClick={() => setDeleteTarget(p)}
                                  disabled={deletingId === p.id}
                                  className="gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  {deletingId === p.id ? "Deleting..." : "Delete"}
                                </Button>
                              </AlertDialogTrigger>

                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Product ဖျက်မလား?
                                  </AlertDialogTitle>

                                  <AlertDialogDescription>
                                    <span>
                                      ဒီ product ကို ဖျက်လိုက်ရင်{" "}
                                      <b>ပြန်လည်မရနိုင်ပါ</b>။
                                    </span>
                                    <br />
                                    <br />
                                    <span className="text-sm text-muted-foreground">
                                      • Name: <b>{deleteTarget?.productName}</b>
                                      <br />
                                      • SKU: {deleteTarget?.sku}
                                    </span>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    onClick={() => setDeleteTarget(null)}
                                  >
                                    မဖျက်ပါ
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={confirmDelete}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    ဖျက်မည်
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {/* Pagination */}
          <div className="w-full min-w-0 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-xs 2xl:text-sm text-muted-foreground whitespace-nowrap">
              Page <span className="font-medium">{safePage}</span> /{" "}
              <span className="font-medium">{totalPages}</span>
            </div>

            <div className="flex w-full min-w-0 flex-wrap items-center gap-2 md:w-auto">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>

              {pageButtons.map((n) => (
                <Button
                  key={n}
                  variant={n === safePage ? "default" : "outline"}
                  size="sm"
                  type="button"
                  onClick={() => setPage(n)}
                  className={cn("min-w-[40px]", n === safePage && "shadow-sm")}
                >
                  {n}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
