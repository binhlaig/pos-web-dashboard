// "use client";

// import { useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { toast } from "sonner";
// import {
//   Search as SearchIcon,
//   PackageSearch,
//   Package2,
//   Barcode,
//   Tag,
// } from "lucide-react";

// type Product = {
//   id: string;
//   sku: string;
//   product_name: string;
//   product_price: number;
//   barcode?: string;
//   category?: string;
//   product_quantity_amount: number;
//   product_image?: string;
//   product_discount: number;
//   note?: string;
//   product_type?: string;
//   cost?: number;
//   isActive: boolean;
// };

// export default function ProductCheckPage() {
//   const [q, setQ] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [products, setProducts] = useState<Product[]>([]);
//   const [selected, setSelected] = useState<Product | null>(null);

//   const apiBase =
//     process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

//   async function handleSearch(e: React.FormEvent) {
//     e.preventDefault();
//     setLoading(true);
//     setSelected(null);

//     try {
//       const url =
//         q.trim().length > 0
//           ? `${apiBase}/api/products?q=${encodeURIComponent(q.trim())}`
//           : `${apiBase}/api/products`;

//       const res = await fetch(url, { cache: "no-store" });

//       if (!res.ok) {
//         const data = await res.json().catch(() => null);
//         const msg =
//           data?.message ||
//           `Search failed (status ${res.status})`;
//         toast.error(msg);
//         setProducts([]);
//         return;
//       }

//       const data = (await res.json()) as Product[] | Product;

//       // backend might return single object or array; normalize to array
//       const list = Array.isArray(data) ? data : [data];
//       setProducts(list);

//       if (list.length === 0) {
//         toast.info("Product မတွေ့ပါ");
//       } else if (list.length === 1) {
//         setSelected(list[0]);
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Server error ဖြစ်နေတယ်");
//     } finally {
//       setLoading(false);
//     }
//   }

//   function formattedPrice(p?: number) {
//     if (p == null) return "-";
//     return new Intl.NumberFormat("ja-JP", {
//       style: "currency",
//       currency: "JPY",
//     }).format(p);
//   }

//   function getImageUrl(p: Product) {
//     if (!p.product_image) return null;
//     if (p.product_image.startsWith("http")) return p.product_image;
//     // static file serving ကို backend ပိုက်ဆံအတိုင်းသဘောထား
//     return `${apiBase}${p.product_image}`;
//   }

//   return (
//     <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-8">
//       {/* LEFT: Search & List */}
//       <div className="w-full lg:w-1/2 space-y-4">
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <PackageSearch className="w-5 h-5" />
//               Product Find &amp; Check
//             </CardTitle>
//             <CardDescription>
//               SKU / Barcode / Name ထည့်ပြီး product ကိုရှာကြည့်ပါ။
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <form
//               onSubmit={handleSearch}
//               className="flex flex-col md:flex-row gap-2"
//             >
//               <div className="flex-1 space-y-1">
//                 <Label htmlFor="q">Search</Label>
//                 <div className="flex items-center gap-2">
//                   <Input
//                     id="q"
//                     placeholder="SKU, Barcode, Name..."
//                     value={q}
//                     onChange={(e) => setQ(e.target.value)}
//                     className="flex-1"
//                   />
//                   <Button
//                     type="submit"
//                     disabled={loading}
                    
//                   >
//                     <SearchIcon className="w-4 h-4 mr-1" />
//                     {loading ? "Searching..." : "Search"}
//                   </Button>
//                 </div>
//               </div>
//             </form>
//           </CardContent>
//         </Card>

//         <Card className="h-[420px] overflow-hidden flex flex-col">
//           <CardHeader className="pb-2">
//             <CardTitle className="flex items-center gap-2 text-sm">
//               <Package2 className="w-4 h-4" />
//               Result List
//             </CardTitle>
//             <CardDescription className="text-xs">
//               ရလာတဲ့ product list (Click လိုက်ရင် အောက်က panel မှာ အသေးစိတ်မြင်ရမယ်)
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="flex-1 overflow-auto">
//             {products.length === 0 ? (
//               <div className="text-sm text-muted-foreground">
//                 ရလဒ်မရှိသေးပါ။ Search လုပ်ကြည့်ပါ။
//               </div>
//             ) : (
//               <table className="w-full text-sm border-collapse">
//                 <thead>
//                   <tr className="border-b text-xs text-muted-foreground">
//                     <th className="py-1 px-2 text-left">SKU</th>
//                     <th className="py-1 px-2 text-left">Name</th>
//                     <th className="py-1 px-2 text-right">Price</th>
//                     <th className="py-1 px-2 text-center">Stock</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {products.map((p) => (
//                     <tr
//                       key={p.id}
//                       className={`border-b hover:bg-accent cursor-pointer ${
//                         selected?.id === p.id ? "bg-accent/60" : ""
//                       }`}
//                       onClick={() => setSelected(p)}
//                     >
//                       <td className="py-1 px-2 text-xs font-mono">
//                         {p.sku}
//                       </td>
//                       <td className="py-1 px-2">
//                         <div className="flex flex-col">
//                           <span className="font-medium">
//                             {p.product_name}
//                           </span>
//                           {p.barcode && (
//                             <span className="text-[10px] text-muted-foreground flex items-center gap-1">
//                               <Barcode className="w-3 h-3" />
//                               {p.barcode}
//                             </span>
//                           )}
//                         </div>
//                       </td>
//                       <td className="py-1 px-2 text-right">
//                         {formattedPrice(p.product_price)}
//                       </td>
//                       <td className="py-1 px-2 text-center">
//                         {p.product_quantity_amount ?? 0}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       {/* RIGHT: Detail Panel */}
//       <div className="w-full lg:w-1/2">
//         <Card className="h-full">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Tag className="w-4 h-4" />
//               Product Detail
//             </CardTitle>
//             <CardDescription>
//               List ထဲက product ကို click လိုက်ရင် ဒီ panel ထဲမှာ အသေးစိတ် ပြပေးမယ်။
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {!selected ? (
//               <div className="text-sm text-muted-foreground">
//                 Product တစ်ခုခုကို list ထဲကနေရွေးပါ။
//               </div>
//             ) : (
//               <>
//                 {/* Image + Basic info */}
//                 <div className="flex flex-col md:flex-row gap-4">
//                   <div className="w-32 h-32 border rounded-md flex items-center justify-center overflow-hidden bg-muted">
//                     {getImageUrl(selected) ? (
//                       <img
//                         src={getImageUrl(selected)!}
//                         alt={selected.product_name}
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <span className="text-xs text-muted-foreground text-center px-2">
//                         No Image
//                       </span>
//                     )}
//                   </div>
//                   <div className="flex-1 space-y-1 text-sm">
//                     <div className="flex items-center gap-2">
//                       <span className="font-semibold text-base">
//                         {selected.product_name}
//                       </span>
//                       {selected.isActive ? (
//                         <Badge variant="default" className="text-[10px]">
//                           Active
//                         </Badge>
//                       ) : (
//                         <Badge
//                           variant="outline"
//                           className="text-[10px]"
//                         >
//                           Inactive
//                         </Badge>
//                       )}
//                     </div>
//                     <div className="text-xs text-muted-foreground">
//                       SKU: <span className="font-mono">{selected.sku}</span>
//                     </div>
//                     {selected.barcode && (
//                       <div className="text-xs text-muted-foreground flex items-center gap-1">
//                         <Barcode className="w-3 h-3" />
//                         <span className="font-mono">
//                           {selected.barcode}
//                         </span>
//                       </div>
//                     )}
//                     <div className="text-sm mt-1">
//                       Price:{" "}
//                       <span className="font-semibold">
//                         {formattedPrice(selected.product_price)}
//                       </span>
//                     </div>
//                     <div className="text-sm">
//                       Stock:{" "}
//                       <span className="font-semibold">
//                         {selected.product_quantity_amount ?? 0}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Category / Type / Discount */}
//                 <div className="grid gap-2 md:grid-cols-2 text-sm">
//                   <div>
//                     <div className="text-xs text-muted-foreground">
//                       Category
//                     </div>
//                     <div>{selected.category || "-"}</div>
//                   </div>
//                   <div>
//                     <div className="text-xs text-muted-foreground">
//                       Type
//                     </div>
//                     <div>{selected.product_type || "-"}</div>
//                   </div>
//                   <div>
//                     <div className="text-xs text-muted-foreground">
//                       Discount
//                     </div>
//                     <div>
//                       {selected.product_discount
//                         ? formattedPrice(selected.product_discount)
//                         : "-"}
//                     </div>
//                   </div>
//                   <div>
//                     <div className="text-xs text-muted-foreground">
//                       Cost
//                     </div>
//                     <div>
//                       {selected.cost != null
//                         ? formattedPrice(selected.cost)
//                         : "-"}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Note */}
//                 {selected.note && (
//                   <div className="text-sm">
//                     <div className="text-xs text-muted-foreground mb-1">
//                       Note
//                     </div>
//                     <div className="border rounded-md p-2 bg-muted/30 text-sm whitespace-pre-wrap">
//                       {selected.note}
//                     </div>
//                   </div>
//                 )}

//                 {/* Raw image path */}
//                 {selected.product_image && (
//                   <div className="text-[11px] text-muted-foreground">
//                     Image path:{" "}
//                     <span className="font-mono">
//                       {selected.product_image}
//                     </span>
//                   </div>
//                 )}
//               </>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }





"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search as SearchIcon,
  PackageSearch,
  Package2,
  Barcode,
  Tag,
  FlaskConical,
} from "lucide-react";

type Product = {
  id: string;
  sku: string;
  product_name: string;
  product_price: number;
  barcode?: string;
  category?: string;
  product_quantity_amount: number;
  product_image?: string;
  product_discount: number;
  note?: string;
  product_type?: string;
  cost?: number;
  isActive: boolean;
};

export default function ProductCheckPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();

    setLoading(true);
    setSelected(null);

    try {
      const url =
        q.trim().length > 0
          ? `${apiBase}/api/products?q=${encodeURIComponent(q.trim())}`
          : `${apiBase}/api/products`;

      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg =
          data?.message ||
          `Search failed (status ${res.status})`;
        toast.error(msg);
        setProducts([]);
        return;
      }

      const data = (await res.json()) as Product[] | Product;
      const list = Array.isArray(data) ? data : [data];

      setProducts(list);

      if (list.length === 0) {
        toast.info("Product မတွေ့ပါ");
      } else if (list.length === 1) {
        setSelected(list[0]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  }

  function formattedPrice(p?: number) {
    if (p == null) return "-";
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(p);
  }

  function getImageUrl(p: Product) {
    if (!p.product_image) return null;
    if (p.product_image.startsWith("http")) return p.product_image;
    return `${apiBase}${p.product_image}`;
  }

  // -------------------------
  // TEST BUTTON HANDLERS
  // -------------------------
  function setTest(value: string) {
    setQ(value);
    handleSearch();
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-8">
      {/* LEFT: Search & List */}
      <div className="w-full lg:w-1/2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PackageSearch className="w-5 h-5" />
              Product Find &amp; Check
            </CardTitle>
            <CardDescription>
              SKU / Barcode / Name ထည့်ပြီး product ကိုရှာကြည့်ပါ။
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSearch}
              className="flex flex-col gap-4"
            >
              {/* Search input */}
              <div className="space-y-1">
                <Label>Search</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="SKU, Barcode, Name..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading}>
                    <SearchIcon className="w-4 h-4 mr-1" />
                    {loading ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>

              {/* ------------------------ */}
              {/* TEST BUTTON BLOCK       */}
              {/* ------------------------ */}
              <div className="border rounded-md p-3 bg-muted/40">
                <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                  <FlaskConical className="w-4 h-4" />
                  Test Tools
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTest("SKU-1001")}
                  >
                    Test SKU
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTest("8852121212333")}
                  >
                    Test Barcode
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setTest("Coca Cola")}
                  >
                    Test Name
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => setTest("Cola")}
                >
                  Auto Test (Search Cola)
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Result List */}
        <Card className="h-[420px] overflow-hidden flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package2 className="w-4 h-4" />
              Result List
            </CardTitle>
            <CardDescription className="text-xs">
              ရလာတဲ့ product list
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {products.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                ရလဒ်မရှိသေးပါ။
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="py-1 px-2 text-left">SKU</th>
                    <th className="py-1 px-2 text-left">Name</th>
                    <th className="py-1 px-2 text-right">Price</th>
                    <th className="py-1 px-2 text-center">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className={`border-b hover:bg-accent cursor-pointer ${
                        selected?.id === p.id ? "bg-accent/50" : ""
                      }`}
                      onClick={() => setSelected(p)}
                    >
                      <td className="py-1 px-2 font-mono text-xs">{p.sku}</td>
                      <td className="py-1 px-2">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {p.product_name}
                          </span>
                          {p.barcode && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Barcode className="w-3 h-3" />
                              {p.barcode}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-1 px-2 text-right">
                        {formattedPrice(p.product_price)}
                      </td>
                      <td className="py-1 px-2 text-center">
                        {p.product_quantity_amount ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT: Detail Panel */}
      <div className="w-full lg:w-1/2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Product Detail
            </CardTitle>
            <CardDescription>
              ရွေးထားသော product ၏ အသေးစိတ်အချက်အလက်
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!selected ? (
              <div className="text-sm text-muted-foreground">
                Product တစ်ခုကို list ထဲကနေရွေးပါ။
              </div>
            ) : (
              <>
                {/* Image + Basic */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-32 h-32 border rounded-md overflow-hidden bg-muted">
                    {getImageUrl(selected) ? (
                      <img
                        src={getImageUrl(selected)!}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs flex items-center justify-center h-full text-muted-foreground">
                        No Image
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1 text-sm">
                    <div className="text-base font-semibold">
                      {selected.product_name}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      SKU:{" "}
                      <span className="font-mono">{selected.sku}</span>
                    </div>

                    {selected.barcode && (
                      <div className="text-xs text-muted-foreground flex gap-1">
                        <Barcode className="w-3 h-3" />
                        <span className="font-mono">
                          {selected.barcode}
                        </span>
                      </div>
                    )}

                    <div>
                      Price:{" "}
                      <span className="font-semibold">
                        {formattedPrice(selected.product_price)}
                      </span>
                    </div>

                    <div>
                      Stock:{" "}
                      <span className="font-semibold">
                        {selected.product_quantity_amount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Category / Type / Discount */}
                <div className="grid gap-2 md:grid-cols-2 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Category
                    </div>
                    <div>{selected.category || "-"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">
                      Type
                    </div>
                    <div>{selected.product_type || "-"}</div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">
                      Discount
                    </div>
                    <div>
                      {selected.product_discount
                        ? formattedPrice(selected.product_discount)
                        : "-"}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground">
                      Cost
                    </div>
                    <div>
                      {selected.cost != null
                        ? formattedPrice(selected.cost)
                        : "-"}
                    </div>
                  </div>
                </div>

                {/* Note */}
                {selected.note && (
                  <div className="text-sm">
                    <div className="text-xs text-muted-foreground mb-1">
                      Note
                    </div>
                    <div className="border rounded-md p-2 bg-muted/20 whitespace-pre-wrap">
                      {selected.note}
                    </div>
                  </div>
                )}

                {/* Image Path */}
                {selected.product_image && (
                  <div className="text-[10px] text-muted-foreground">
                    Image Path:{" "}
                    <span className="font-mono">{selected.product_image}</span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
