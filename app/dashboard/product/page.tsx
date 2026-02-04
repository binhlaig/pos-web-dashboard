

// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/navigation";

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

// function cn(...classes: (string | false | null | undefined)[]) {
//   return classes.filter(Boolean).join(" ");
// }

// export default function ProductsPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [q, setQ] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [firstLoaded, setFirstLoaded] = useState(false);

//   // pagination
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   // delete dialog state
//   const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
//   const [deletingId, setDeletingId] = useState<string | null>(null);

//   const apiBase = process.env.NEXT_PUBLIC_API_URL;
//   const router = useRouter();

//   async function loadProducts(search?: string) {
//     try {
//       setLoading(true);
//       const query = search ? `?q=${encodeURIComponent(search)}` : "";
//       const res = await fetch(`${apiBase}/api/products${query}`, {
//         credentials: "include",
//       });

//       if (!res.ok) {
//         const data = await res.json().catch(() => null);
//         const msg =
//           typeof data?.message === "string"
//             ? data.message
//             : `Products load မရပါ (status ${res.status})`;
//         toast.error(msg);
//         return;
//       }

//       const data = (await res.json()) as Product[];
//       setProducts(data);
//       setFirstLoaded(true);
//       setPage(1);
//     } catch (e) {
//       console.error(e);
//       toast.error("Server error ဖြစ်နေတယ်");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function confirmDelete() {
//     if (!deleteTarget) return;

//     try {
//       setDeletingId(deleteTarget.id);

//       const res = await fetch(`${apiBase}/api/products/${deleteTarget.id}`, {
//         method: "DELETE",
//         credentials: "include",
//       });

//       if (!res.ok) {
//         const data = await res.json().catch(() => null);
//         toast.error(data?.message || "Delete မအောင်မြင်ပါ");
//         return;
//       }

//       toast.success("Product ဖျက်ပြီးပါပြီ");
//       await loadProducts(q.trim() || undefined);
//     } catch (e) {
//       console.error(e);
//       toast.error("Server error (delete)");
//     } finally {
//       setDeletingId(null);
//       setDeleteTarget(null);
//     }
//   }

//   useEffect(() => {
//     loadProducts();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     loadProducts(q.trim() || undefined);
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
//         {/* Header */}
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
//               onClick={() => loadProducts()}
//               disabled={loading}
//               className="gap-2"
//             >
//               <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
//               Refresh
//             </Button>

//             <Button
//               size="sm"
//               type="button"
//               onClick={() => router.push("/products/new")}
//               className="gap-2"
//             >
//               <Plus className="h-4 w-4" />
//               New Product
//             </Button>
//           </div>
//         </CardHeader>

//         <CardContent className="space-y-4 p-5 min-w-0">
//           {/* Search + Page Size */}
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

//           {/* Table (overflow safe) */}
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
//                     const discount = p.product_discount ?? 0;

//                     const hasImage =
//                       p.product_image && p.product_image.trim() !== "";

//                     const imageUrl =
//                       hasImage && p.product_image!.startsWith("http")
//                         ? p.product_image!
//                         : hasImage
//                         ? `${apiBase}${p.product_image}`
//                         : null;

//                     const stock = p.product_quantity_amount ?? 0;

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
//                               alt={p.product_name}
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
//                               <span className="font-medium">
//                                 {p.product_name}
//                               </span>

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
//                             {p.product_price.toLocaleString()}
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
//                           {p.product_type ? (
//                             <Badge
//                               variant="secondary"
//                               className="text-[11px] uppercase"
//                             >
//                               {p.product_type}
//                             </Badge>
//                           ) : (
//                             <span className="text-xs text-muted-foreground">
//                               -
//                             </span>
//                           )}
//                         </TableCell>

//                         <TableCell className="text-right">
//                           {discount > 0 ? (
//                             <span className="text-sm text-emerald-700 font-semibold">
//                               -{discount.toLocaleString()}
//                             </span>
//                           ) : (
//                             <span className="text-xs text-muted-foreground">
//                               0
//                             </span>
//                           )}
//                         </TableCell>

//                         <TableCell className="text-right">
//                           <div className="flex justify-end gap-2">
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               type="button"
//                               onClick={() => router.push(`/products/${p.id}`)}
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
//                                 router.push(`/products/${p.id}/edit`)
//                               }
//                               className="gap-2"
//                             >
//                               <Pencil className="h-4 w-4" />
//                               Edit
//                             </Button>

//                             {/* ✅ Delete with AlertDialog */}
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
//                                   <AlertDialogDescription className="space-y-2">
//                                     <div>
//                                       ဒီ product ကို ဖျက်လိုက်ရင်{" "}
//                                       <b>ပြန်လည်မရနိုင်ပါ</b>။
//                                     </div>
//                                     <div className="text-sm text-muted-foreground">
//                                       • Name:{" "}
//                                       <b>{deleteTarget?.product_name}</b>
//                                       <br />
//                                       • SKU: {deleteTarget?.sku}
//                                     </div>
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

//           {/* Pagination Bar (overflow safe) */}
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

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function ProductsPage() {
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

  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  async function loadProducts(search?: string, resetPage: boolean = false) {
    try {
      setLoading(true);
      const query = search ? `?q=${encodeURIComponent(search)}` : "";
      const res = await fetch(`${apiBase}/api/products${query}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg =
          typeof data?.message === "string"
            ? data.message
            : `Products load မရပါ (status ${res.status})`;
        toast.error(msg);
        return;
      }

      const data = (await res.json()) as Product[];
      setProducts(data);
      setFirstLoaded(true);

      // ✅ keep page if not reset, but clamp to new totalPages
      const newTotal = data.length;
      const newTotalPages = Math.max(1, Math.ceil(newTotal / pageSize));

      if (resetPage) setPage(1);
      else setPage((prev) => Math.min(prev, newTotalPages));
    } catch (e) {
      console.error(e);
      toast.error("Server error ဖြစ်နေတယ်");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);

      const res = await fetch(`${apiBase}/api/products/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.message || "Delete မအောင်မြင်ပါ");
        return;
      }

      toast.success("Product ဖျက်ပြီးပါပြီ");
      await loadProducts(q.trim() || undefined, false); // ✅ keep current page
    } catch (e) {
      console.error(e);
      toast.error("Server error (delete)");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  useEffect(() => {
    loadProducts(undefined, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="flex w-full justify-center py-8 px-3 overflow-x-hidden">
      <Card className="w-full max-w-6xl overflow-hidden border-muted/60 shadow-sm min-w-0">
        <CardHeader className="bg-gradient-to-r from-muted/40 to-background flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1 min-w-0">
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </span>
              <span className="text-xl">Products</span>
            </CardTitle>
            <CardDescription className="text-[13px]">
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
              onClick={() => router.push("/products/new")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Product
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-5 min-w-0">
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
              <div className="text-xs text-muted-foreground whitespace-nowrap">
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

          <div className="w-full min-w-0 overflow-x-auto rounded-xl border">
            <ScrollArea className="w-full max-h-[560px]">
              <Table className="min-w-[980px]">
                <TableCaption>
                  {total === 0 && firstLoaded
                    ? "Product မရှိသေးပါ။ New Product ခလုတ်နှိပ်၍ အသစ်ထည့်နိုင်ပါတယ်။"
                    : "Products list"}
                </TableCaption>

                <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
                  <TableRow>
                    <TableHead className="w-[86px]">Image</TableHead>
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
                    const discount = p.product_discount ?? 0;

                    const hasImage =
                      p.product_image && p.product_image.trim() !== "";

                    const imageUrl =
                      hasImage && p.product_image!.startsWith("http")
                        ? p.product_image!
                        : hasImage
                        ? `${apiBase}${p.product_image}`
                        : null;

                    const stock = p.product_quantity_amount ?? 0;

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
                              alt={p.product_name}
                              className="h-12 w-12 rounded-xl object-cover border bg-muted shadow-sm"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-xl border flex items-center justify-center bg-muted text-muted-foreground">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="font-mono text-xs">
                          <span className="rounded-md bg-muted px-2 py-1">
                            {p.sku}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {p.product_name}
                              </span>

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
                            {p.product_price.toLocaleString()}
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
                          {p.product_type ? (
                            <Badge
                              variant="secondary"
                              className="text-[11px] uppercase"
                            >
                              {p.product_type}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          {discount > 0 ? (
                            <span className="text-sm text-emerald-700 font-semibold">
                              -{discount.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              0
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              type="button"
                              onClick={() => router.push(`/dashboard/product/${p.id}`)}
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

                            {/* ✅ Delete + AlertDialog (NO <div> inside <p>!) */}
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

                                  {/* ✅ Description is <p> internally → use only inline elements */}
                                  <AlertDialogDescription>
                                    <span>
                                      ဒီ product ကို ဖျက်လိုက်ရင်{" "}
                                      <b>ပြန်လည်မရနိုင်ပါ</b>။
                                    </span>
                                    <br />
                                    <br />
                                    <span className="text-sm text-muted-foreground">
                                      • Name: <b>{deleteTarget?.product_name}</b>
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
            <div className="text-xs text-muted-foreground whitespace-nowrap">
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
