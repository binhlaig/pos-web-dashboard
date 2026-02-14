
// "use client";

// import React, { useMemo, useState } from "react";
// import { useSession } from "next-auth/react";
// import toast from "react-hot-toast";
// import { usePathname, useRouter } from "next/navigation";

// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent,
//   CardFooter,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectTrigger,
//   SelectContent,
//   SelectItem,
//   SelectValue,
// } from "@/components/ui/select";

// import {
//   Image as ImageIcon,
//   Plus,
//   UploadIcon,
//   LayoutDashboard,
//   Package,
//   ShoppingCart,
//   Users,
//   Settings,
//   LogOut,
//   Menu,
//   ArrowLeft,
// } from "lucide-react";

// // -----------------------------
// // Types + helpers (your original)
// // -----------------------------
// type ProductFormState = {
//   sku: string;
//   product_name: string;
//   product_price: string;
//   barcode: string;
//   category: string;
//   product_quantity_amount: string;
//   product_image: string; // UI display only
//   product_discount: string;
//   note: string;
//   product_type: string;
// };

// const initialForm: ProductFormState = {
//   sku: "",
//   product_name: "",
//   product_price: "",
//   barcode: "",
//   category: "",
//   product_quantity_amount: "",
//   product_image: "",
//   product_discount: "",
//   note: "",
//   product_type: "",
// };

// function normalizeTokenType(v: unknown) {
//   const s = String(v ?? "Bearer").replace(/\s+/g, " ").trim();
//   return s || "Bearer";
// }

// function safeJsonParse(text: string) {
//   try {
//     return JSON.parse(text);
//   } catch {
//     return null;
//   }
// }

// // -----------------------------
// // Sidebar / Shell
// // -----------------------------
// function cn(...classes: Array<string | false | null | undefined>) {
//   return classes.filter(Boolean).join(" ");
// }

// function Sidebar({
//   open,
//   onClose,
// }: {
//   open: boolean;
//   onClose: () => void;
// }) {
//   const pathname = usePathname();
//   const router = useRouter();

//   const items = [
//     { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
//     { label: "Products", href: "/dashboard/product", icon: Package },
//     { label: "POS / Orders", href: "/dashboard/orders", icon: ShoppingCart },
//     { label: "Customers", href: "/dashboard/customers", icon: Users },
//     { label: "Settings", href: "/dashboard/settings", icon: Settings },
//   ];

//   const NavItem = ({
//     label,
//     href,
//     icon: Icon,
//   }: {
//     label: string;
//     href: string;
//     icon: any;
//   }) => {
//     const active = pathname === href || pathname?.startsWith(href + "/");
//     return (
//       <button
//         type="button"
//         onClick={() => {
//           router.push(href);
//           onClose();
//         }}
//         className={cn(
//           "w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
//           active
//             ? "bg-accent text-accent-foreground"
//             : "hover:bg-muted text-muted-foreground hover:text-foreground"
//         )}
//       >
//         <Icon className="h-4 w-4" />
//         <span>{label}</span>
//       </button>
//     );
//   };

//   return (
//     <>
//       {/* Mobile overlay */}
//       <div
//         className={cn(
//           "fixed inset-0 z-40 bg-black/30 md:hidden",
//           open ? "block" : "hidden"
//         )}
//         onClick={onClose}
//       />

//       <aside
//         className={cn(
//           "fixed z-50 inset-y-0 left-0 w-72 border-r bg-background p-4 md:static md:z-auto md:block",
//           open ? "block" : "hidden md:block"
//         )}
//       >
//         <div className="flex items-center justify-between gap-2">
//           <div className="flex flex-col">
//             <div className="text-lg font-semibold leading-none">
//               Supermarket Admin
//             </div>
//             <div className="text-xs text-muted-foreground">
//               Build Smart. Grow Strong.
//             </div>
//           </div>

//           <Button
//             type="button"
//             variant="ghost"
//             size="icon"
//             className="md:hidden"
//             onClick={onClose}
//             aria-label="Close"
//           >
//             ✕
//           </Button>
//         </div>

//         <div className="my-4 h-px bg-border" />

//         <nav className="space-y-1">
//           {items.map((it) => (
//             <NavItem key={it.href} {...it} />
//           ))}
//         </nav>

//         <div className="my-4 h-px bg-border" />

//         <button
//           type="button"
//           onClick={() => toast("Logout ကို NextAuth signOut() ချိတ်နိုင်ပါတယ်")}
//           className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
//         >
//           <LogOut className="h-4 w-4" />
//           Logout
//         </button>
//       </aside>
//     </>
//   );
// }

// function DashboardShell({ children }: { children: React.ReactNode }) {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   return (
//     <div className="min-h-screen bg-muted/30">
//       <div className="flex">
//         <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

//         <main className="flex-1 min-w-0">
//           {/* Top bar */}
          

//           {/* Content */}
//           <div className="p-4 md:p-6">{children}</div>
//         </main>
//       </div>
//     </div>
//   );
// }

// // -----------------------------
// // Your page (wrapped with shell)
// // -----------------------------
// export default function ProductCreatePage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   const [form, setForm] = useState<ProductFormState>(initialForm);
//   const [loading, setLoading] = useState(false);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [imageFile, setImageFile] = useState<File | null>(null);

//   const apiBase = useMemo(
//     () => (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, ""),
//     []
//   );

//   function handleChange(field: keyof ProductFormState, value: string) {
//     setForm((prev) => ({ ...prev, [field]: value }));
//   }

//   function resetForm() {
//     setForm(initialForm);
//     setImageFile(null);
//     setImagePreview((prev) => {
//       if (prev) URL.revokeObjectURL(prev);
//       return null;
//     });
//   }

//   function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (!file.type.startsWith("image/")) {
//       toast.error("Image file ပဲရွေးပါ");
//       return;
//     }

//     setImageFile(file);
//     setImagePreview((prev) => {
//       if (prev) URL.revokeObjectURL(prev);
//       return URL.createObjectURL(file);
//     });

//     handleChange("product_image", file.name);
//   }

//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();

//     if (!apiBase) {
//       toast.error("NEXT_PUBLIC_API_URL မထည့်ရသေးပါ (.env.local)");
//       return;
//     }

//     if (status === "loading") {
//       toast("Checking login...");
//       return;
//     }
//     if (status !== "authenticated") {
//       toast.error("Login မဝင်ရသေးပါ (session မရှိပါ)");
//       return;
//     }

//     const accessToken = String((session as any)?.accessToken || "").trim();
//     const tokenType = normalizeTokenType((session as any)?.tokenType);

//     if (!accessToken) {
//       toast.error("Session ထဲမှာ accessToken မတွေ့ပါ (NextAuth callbacks စစ်ပါ)");
//       return;
//     }

//     if (!form.sku.trim() || !form.product_name.trim() || !form.product_price) {
//       toast.error("SKU, Product Name, Price ကို ထည့်ပေးပါ");
//       return;
//     }

//     const product_price = Number(form.product_price);
//     const product_quantity_amount = form.product_quantity_amount
//       ? Number(form.product_quantity_amount)
//       : 0;
//     const product_discount = form.product_discount
//       ? Number(form.product_discount)
//       : 0;

//     if (Number.isNaN(product_price)) return toast.error("Price သည် number ဖြစ်ရပါမယ်");
//     if (Number.isNaN(product_quantity_amount)) return toast.error("Quantity သည် number ဖြစ်ရပါမယ်");
//     if (Number.isNaN(product_discount)) return toast.error("Discount သည် number ဖြစ်ရပါမယ်");

//     setLoading(true);
//     const toastId = toast.loading("Saving product...");

//     try {
//       const formData = new FormData();
//       formData.append("sku", form.sku.trim());
//       formData.append("product_name", form.product_name.trim());
//       formData.append("product_price", String(product_price));
//       formData.append("product_quantity_amount", String(product_quantity_amount));
//       formData.append("product_discount", String(product_discount));

//       if (form.barcode.trim()) formData.append("barcode", form.barcode.trim());
//       if (form.category.trim()) formData.append("category", form.category.trim());
//       if (form.product_type) formData.append("product_type", form.product_type);
//       if (form.note.trim()) formData.append("note", form.note.trim());
//       if (imageFile) formData.append("image", imageFile);

//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 15000);

//       const url = `${apiBase}/api/products`;
//       const res = await fetch(url, {
//         method: "POST",
//         body: formData,
//         headers: { Authorization: `${tokenType} ${accessToken}` },
//         signal: controller.signal,
//       });

//       clearTimeout(timeoutId);

//       const text = await res.text().catch(() => "");
//       const json = text ? safeJsonParse(text) : null;

//       if (!res.ok) {
//         const msg =
//           (json && ((json as any).message || (json as any).error || (json as any).detail)) ||
//           (text ? text : null) ||
//           `Failed to create product (status ${res.status})`;

//         if (res.status === 401) {
//           toast.error(
//             `401 Unauthorized\n- Token/Authorization မလက်ခံ\n- Token expired/invalid\n- Backend security config စစ်ပါ\n\n${msg}`
//           );
//         } else {
//           toast.error(String(msg));
//         }
//         return;
//       }

//       toast.success(`Product ထည့်သွင်းပြီးပါပြီ: ${(json as any)?.product_name ?? form.product_name}`, {
//         id: toastId,
//       });

//       resetForm();
//       router.push("/dashboard");
//     } catch (err: any) {
//       if (err?.name === "AbortError") {
//         toast.error("Request timeout (15s). Backend/CORS/URL ကိုစစ်ပါ။", { id: toastId });
//         return;
//       }
//       toast.error("Server error ဖြစ်နေတယ်", { id: toastId });
//     } finally {
//       toast.dismiss(toastId);
//       setLoading(false);
//     }
//   }

//   return (
//     <DashboardShell>

//     <div className="mx-auto w-full max-w-3xl">
//       <div className="flex items-center justify-between gap-3 mb-4">
//         <div>
//           <div className="text-xl font-semibold">New Product</div>
//           <div className="text-sm text-muted-foreground">
//             စူပါမားကက် Product အသစ်တစ်ခုကို ထည့်သွင်းရန် form ဖြစ်သည်။
//           </div>
//         </div>

//         <Button
//           size="sm"
//           type="button"
//           onClick={() => router.push("/dashboard/product")}
//           className="gap-2"
//         >
//           <ArrowLeft className="h-4 w-4" />
//           go dashboard
//         </Button>
//       </div>

//       <Card className="w-full max-w-3xl">
//         <CardHeader>
//           <CardTitle>Product Form</CardTitle>
//           <CardDescription>အချက်အလက်တွေကို ပြည့်စုံအောင် ဖြည့်ပါ။</CardDescription>
//         </CardHeader>

//         <form onSubmit={handleSubmit} noValidate>
//           <CardContent className="space-y-6">
//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <Label htmlFor="sku">SKU / Code</Label>
//                 <Input
//                   id="sku"
//                   value={form.sku}
//                   onChange={(e) => handleChange("sku", e.target.value)}
//                   placeholder="SKU-1001"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="product_name">Product Name</Label>
//                 <Input
//                   id="product_name"
//                   value={form.product_name}
//                   onChange={(e) => handleChange("product_name", e.target.value)}
//                   placeholder="Coca Cola 500ml"
//                 />
//               </div>
//             </div>

//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <Label htmlFor="product_price">Price</Label>
//                 <Input
//                   id="product_price"
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={form.product_price}
//                   onChange={(e) => handleChange("product_price", e.target.value)}
//                   placeholder="1200"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="product_quantity_amount">Quantity / Stock</Label>
//                 <Input
//                   id="product_quantity_amount"
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={form.product_quantity_amount}
//                   onChange={(e) => handleChange("product_quantity_amount", e.target.value)}
//                   placeholder="50"
//                 />
//               </div>
//             </div>

//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <Label htmlFor="barcode">Barcode</Label>
//                 <Input
//                   id="barcode"
//                   value={form.barcode}
//                   onChange={(e) => handleChange("barcode", e.target.value)}
//                   placeholder="8852121212333"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="product_discount">Discount (amount)</Label>
//                 <Input
//                   id="product_discount"
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={form.product_discount}
//                   onChange={(e) => handleChange("product_discount", e.target.value)}
//                   placeholder="100"
//                 />
//               </div>
//             </div>

//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <Label htmlFor="category">Category</Label>
//                 <Input
//                   id="category"
//                   value={form.category}
//                   onChange={(e) => handleChange("category", e.target.value)}
//                   placeholder="Drink / Snack / etc."
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label>Product Type</Label>
//                 <Select
//                   value={form.product_type}
//                   onValueChange={(value) => handleChange("product_type", value)}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="DRINK">Drink</SelectItem>
//                     <SelectItem value="FOOD">Food</SelectItem>
//                     <SelectItem value="SNACK">Snack</SelectItem>
//                     <SelectItem value="OTHER">Other</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label className="flex items-center gap-2">
//                 <ImageIcon className="w-4 h-4" />
//                 Product Image
//               </Label>

//               <div className="flex flex-col md:flex-row gap-4 md:items-center">
//                 <div>
//                   <label
//                     htmlFor="imageUpload"
//                     className="flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer bg-muted hover:bg-accent"
//                   >
//                     <UploadIcon className="w-4 h-4" />
//                     Choose File
//                   </label>
//                   <input
//                     id="imageUpload"
//                     type="file"
//                     className="hidden"
//                     accept="image/*"
//                     onChange={handleImageChange}
//                   />
//                 </div>

//                 {imagePreview ? (
//                   <img
//                     src={imagePreview}
//                     alt="Preview"
//                     className="w-24 h-24 rounded-md object-cover border"
//                   />
//                 ) : (
//                   <div className="w-24 h-24 flex items-center justify-center border rounded-md text-xs text-muted-foreground">
//                     No Image
//                   </div>
//                 )}
//               </div>

//               <Input
//                 disabled
//                 value={form.product_image}
//                 placeholder="Selected image filename"
//                 className="bg-muted cursor-not-allowed"
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="note">Note</Label>
//               <Textarea
//                 id="note"
//                 value={form.note}
//                 onChange={(e) => handleChange("note", e.target.value)}
//                 placeholder="..."
//                 rows={3}
//               />
//             </div>
//           </CardContent>

//           <CardFooter className="flex justify-end gap-6 px-4 py-6">
//             <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
//               Clear
//             </Button>

//             <Button type="submit" disabled={loading}>
//               {loading ? "Saving..." : "Save Product"}
//             </Button>
//           </CardFooter>
//         </form>
//       </Card>
//     </div>
//     </DashboardShell>

//   );
// }






"use client";

import React, { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import {
  Image as ImageIcon,
  UploadIcon,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  ArrowLeft,
} from "lucide-react";

// -----------------------------
// Types + helpers
// -----------------------------
type ProductFormState = {
  sku: string;
  product_name: string;
  product_price: string;
  barcode: string;
  category: string;
  product_quantity_amount: string;
  product_image: string; // UI display only
  product_discount: string;
  note: string;
  product_type: string;
};

const initialForm: ProductFormState = {
  sku: "",
  product_name: "",
  product_price: "",
  barcode: "",
  category: "",
  product_quantity_amount: "",
  product_image: "",
  product_discount: "",
  note: "",
  product_type: "",
};

function normalizeTokenType(v: unknown) {
  const s = String(v ?? "Bearer").replace(/\s+/g, " ").trim();
  return s || "Bearer";
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// -----------------------------
// Sidebar / Shell (RESPONSIVE 1920+)
// -----------------------------
function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const items = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Products", href: "/dashboard/product", icon: Package },
    { label: "POS / Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { label: "Customers", href: "/dashboard/customers", icon: Users },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const NavItem = ({
    label,
    href,
    icon: Icon,
  }: {
    label: string;
    href: string;
    icon: any;
  }) => {
    const active = pathname === href || pathname?.startsWith(href + "/");
    return (
      <button
        type="button"
        onClick={() => {
          router.push(href);
          onClose();
        }}
        className={cn(
          "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
          "2xl:px-4 2xl:py-2.5 2xl:text-[15px]",
          active
            ? "bg-accent text-accent-foreground"
            : "hover:bg-muted text-muted-foreground hover:text-foreground"
        )}
      >
        <Icon className="h-4 w-4 2xl:h-[18px] 2xl:w-[18px]" />
        <span className="truncate">{label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 md:hidden",
          open ? "block" : "hidden"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed z-50 inset-y-0 left-0 border-r bg-background p-4",
          "w-72 md:static md:z-auto md:block",
          "2xl:w-80 2xl:p-6",
          open ? "block" : "hidden md:block"
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <div className="text-lg font-semibold leading-none 2xl:text-xl">
              Supermarket Admin
            </div>
            <div className="text-xs text-muted-foreground 2xl:text-sm">
              Build Smart. Grow Strong.
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </Button>
        </div>

        <div className="my-4 h-px bg-border" />

        <nav className="space-y-1">{items.map((it) => <NavItem key={it.href} {...it} />)}</nav>

        <div className="my-4 h-px bg-border" />

        <button
          type="button"
          onClick={() => toast("Logout ကို NextAuth signOut() ချိတ်နိုင်ပါတယ်")}
          className={cn(
            "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
            "2xl:px-4 2xl:py-2.5 2xl:text-[15px]"
          )}
        >
          <LogOut className="h-4 w-4 2xl:h-[18px] 2xl:w-[18px]" />
          Logout
        </button>
      </aside>
    </>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0">
          {/* ✅ Top bar (for mobile + 1920+ spacing) */}
          <div className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto w-full max-w-6xl 2xl:max-w-[1400px] px-4 md:px-6 2xl:px-10 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="h-4 w-4" />
                </Button>

                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-none 2xl:text-base">
                    Dashboard
                  </div>
                  <div className="text-[11px] text-muted-foreground 2xl:text-sm truncate">
                    Products / Orders / Customers
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => router.push("/dashboard")}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>
          </div>

          {/* ✅ Content wrapper for 1920+ */}
          <div className="mx-auto w-full max-w-6xl 2xl:max-w-[1400px] px-4 md:px-6 2xl:px-10 py-6 2xl:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// -----------------------------
// Page
// -----------------------------
export default function ProductCreatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState<ProductFormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, ""),
    []
  );

  function handleChange(field: keyof ProductFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm(initialForm);
    setImageFile(null);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Image file ပဲရွေးပါ");
      return;
    }

    setImageFile(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    handleChange("product_image", file.name);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!apiBase) {
      toast.error("NEXT_PUBLIC_API_URL မထည့်ရသေးပါ (.env.local)");
      return;
    }

    if (status === "loading") {
      toast("Checking login...");
      return;
    }
    if (status !== "authenticated") {
      toast.error("Login မဝင်ရသေးပါ (session မရှိပါ)");
      return;
    }

    const accessToken = String((session as any)?.accessToken || "").trim();
    const tokenType = normalizeTokenType((session as any)?.tokenType);

    if (!accessToken) {
      toast.error("Session ထဲမှာ accessToken မတွေ့ပါ (NextAuth callbacks စစ်ပါ)");
      return;
    }

    if (!form.sku.trim() || !form.product_name.trim() || !form.product_price) {
      toast.error("SKU, Product Name, Price ကို ထည့်ပေးပါ");
      return;
    }

    const product_price = Number(form.product_price);
    const product_quantity_amount = form.product_quantity_amount
      ? Number(form.product_quantity_amount)
      : 0;
    const product_discount = form.product_discount
      ? Number(form.product_discount)
      : 0;

    if (Number.isNaN(product_price)) return toast.error("Price သည် number ဖြစ်ရပါမယ်");
    if (Number.isNaN(product_quantity_amount)) return toast.error("Quantity သည် number ဖြစ်ရပါမယ်");
    if (Number.isNaN(product_discount)) return toast.error("Discount သည် number ဖြစ်ရပါမယ်");

    setLoading(true);
    const toastId = toast.loading("Saving product...");

    try {
      const formData = new FormData();
      formData.append("sku", form.sku.trim());
      formData.append("product_name", form.product_name.trim());
      formData.append("product_price", String(product_price));
      formData.append("product_quantity_amount", String(product_quantity_amount));
      formData.append("product_discount", String(product_discount));

      if (form.barcode.trim()) formData.append("barcode", form.barcode.trim());
      if (form.category.trim()) formData.append("category", form.category.trim());
      if (form.product_type) formData.append("product_type", form.product_type);
      if (form.note.trim()) formData.append("note", form.note.trim());
      if (imageFile) formData.append("image", imageFile);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const url = `${apiBase}/api/products`;
      const res = await fetch(url, {
        method: "POST",
        body: formData,
        headers: { Authorization: `${tokenType} ${accessToken}` },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const text = await res.text().catch(() => "");
      const json = text ? safeJsonParse(text) : null;

      if (!res.ok) {
        const msg =
          (json && ((json as any).message || (json as any).error || (json as any).detail)) ||
          (text ? text : null) ||
          `Failed to create product (status ${res.status})`;

        if (res.status === 401) {
          toast.error(
            `401 Unauthorized\n- Token/Authorization မလက်ခံ\n- Token expired/invalid\n- Backend security config စစ်ပါ\n\n${msg}`
          );
        } else {
          toast.error(String(msg));
        }
        return;
      }

      toast.success(
        `Product ထည့်သွင်းပြီးပါပြီ: ${(json as any)?.product_name ?? form.product_name}`,
        { id: toastId }
      );

      resetForm();
      router.push("/dashboard/product");
    } catch (err: any) {
      if (err?.name === "AbortError") {
        toast.error("Request timeout (15s). Backend/CORS/URL ကိုစစ်ပါ။", { id: toastId });
        return;
      }
      toast.error("Server error ဖြစ်နေတယ်", { id: toastId });
    } finally {
      toast.dismiss(toastId);
      setLoading(false);
    }
  }

  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-3xl 2xl:max-w-5xl">
        <div className="flex items-center justify-between gap-3 mb-4 2xl:mb-6">
          <div className="min-w-0">
            <div className="text-xl font-semibold 2xl:text-3xl">New Product</div>
            <div className="text-sm text-muted-foreground 2xl:text-base">
              စူပါမားကက် Product အသစ်တစ်ခုကို ထည့်သွင်းရန် form ဖြစ်သည်။
            </div>
          </div>

        </div>

        <Card className="w-full">
          <CardHeader className="2xl:py-6">
            <CardTitle className="2xl:text-2xl">Product Form</CardTitle>
            <CardDescription className="2xl:text-base">
              အချက်အလက်တွေကို ပြည့်စုံအောင် ဖြည့်ပါ။
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} noValidate>
            <CardContent className="space-y-6 2xl:space-y-8">
              {/* ✅ 1920+: 3 columns */}
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3 2xl:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sku" className="2xl:text-[15px]">SKU / Code</Label>
                  <Input
                    id="sku"
                    value={form.sku}
                    onChange={(e) => handleChange("sku", e.target.value)}
                    placeholder="SKU-1001"
                    className="2xl:h-11 2xl:text-[15px]"
                  />
                </div>

                <div className="space-y-2 2xl:col-span-2">
                  <Label htmlFor="product_name" className="2xl:text-[15px]">
                    Product Name
                  </Label>
                  <Input
                    id="product_name"
                    value={form.product_name}
                    onChange={(e) => handleChange("product_name", e.target.value)}
                    placeholder="Coca Cola 500ml"
                    className="2xl:h-11 2xl:text-[15px]"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3 2xl:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="product_price" className="2xl:text-[15px]">Price</Label>
                  <Input
                    id="product_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.product_price}
                    onChange={(e) => handleChange("product_price", e.target.value)}
                    placeholder="1200"
                    className="2xl:h-11 2xl:text-[15px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_quantity_amount" className="2xl:text-[15px]">
                    Quantity / Stock
                  </Label>
                  <Input
                    id="product_quantity_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.product_quantity_amount}
                    onChange={(e) => handleChange("product_quantity_amount", e.target.value)}
                    placeholder="50"
                    className="2xl:h-11 2xl:text-[15px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_discount" className="2xl:text-[15px]">
                    Discount (amount)
                  </Label>
                  <Input
                    id="product_discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.product_discount}
                    onChange={(e) => handleChange("product_discount", e.target.value)}
                    placeholder="100"
                    className="2xl:h-11 2xl:text-[15px]"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3 2xl:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="barcode" className="2xl:text-[15px]">Barcode</Label>
                  <Input
                    id="barcode"
                    value={form.barcode}
                    onChange={(e) => handleChange("barcode", e.target.value)}
                    placeholder="8852121212333"
                    className="2xl:h-11 2xl:text-[15px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="2xl:text-[15px]">Category</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    placeholder="Drink / Snack / etc."
                    className="2xl:h-11 2xl:text-[15px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="2xl:text-[15px]">Product Type</Label>
                  <Select
                    value={form.product_type}
                    onValueChange={(value) => handleChange("product_type", value)}
                  >
                    <SelectTrigger className="2xl:h-11 2xl:text-[15px]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRINK">Drink</SelectItem>
                      <SelectItem value="FOOD">Food</SelectItem>
                      <SelectItem value="SNACK">Snack</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* ✅ Image block: 1920+ -> side by side */}
              <div className="grid gap-4 2xl:grid-cols-[1fr_360px] 2xl:items-start 2xl:gap-8">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 2xl:text-[15px]">
                    <ImageIcon className="w-4 h-4" />
                    Product Image
                  </Label>

                  <div className="flex flex-col md:flex-row gap-4 md:items-center">
                    <div>
                      <label
                        htmlFor="imageUpload"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer bg-muted hover:bg-accent 2xl:px-5 2xl:py-3"
                      >
                        <UploadIcon className="w-4 h-4" />
                        Choose File
                      </label>
                      <input
                        id="imageUpload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>

                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-24 h-24 2xl:w-32 2xl:h-32 rounded-2xl object-cover border bg-muted"
                      />
                    ) : (
                      <div className="w-24 h-24 2xl:w-32 2xl:h-32 flex items-center justify-center border rounded-2xl text-xs text-muted-foreground bg-background">
                        No Image
                      </div>
                    )}
                  </div>

                  <Input
                    disabled
                    value={form.product_image}
                    placeholder="Selected image filename"
                    className="bg-muted cursor-not-allowed 2xl:h-11 2xl:text-[15px]"
                  />
                </div>

                {/* 1920+ Preview Card */}
                <div className="rounded-2xl border bg-background p-4 2xl:p-5">
                  <div className="text-sm font-semibold 2xl:text-base mb-2">
                    Live Preview
                  </div>
                  <div className="rounded-2xl border bg-muted flex items-center justify-center min-h-[180px] 2xl:min-h-[240px] overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview large"
                        className="max-h-[240px] object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Image field name: <code className="px-1 py-0.5 rounded bg-muted">image</code>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note" className="2xl:text-[15px]">Note</Label>
                <Textarea
                  id="note"
                  value={form.note}
                  onChange={(e) => handleChange("note", e.target.value)}
                  placeholder="..."
                  rows={3}
                  className="2xl:text-[15px]"
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-3 px-4 py-6 2xl:px-8 2xl:py-8">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={loading}
              >
                Clear
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Product"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardShell>
  );
}
