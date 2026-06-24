// // "use client";

// // import React, { useEffect, useMemo, useState } from "react";
// // import { useParams, useRouter } from "next/navigation";
// // import { useSession, signIn } from "next-auth/react";

// // import {
// //   Card,
// //   CardHeader,
// //   CardTitle,
// //   CardDescription,
// //   CardContent,
// // } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Textarea } from "@/components/ui/textarea";
// // import { Label } from "@/components/ui/label";
// // import { Badge } from "@/components/ui/badge";
// // import { Separator } from "@/components/ui/separator";

// // import { ArrowLeft, Save, RefreshCw, ImageIcon, Package } from "lucide-react";
// // import toast from "react-hot-toast";

// // type Product = {
// //   id: string;
// //   sku: string;
// //   product_name: string;
// //   product_price: number;
// //   barcode?: string | null;
// //   category?: string | null;
// //   product_quantity_amount: number;

// //   // ✅ image fields (backend may return any of these)
// //   product_image?: string | null;
// //   imagePath?: string | null;
// //   image_path?: string | null;
// //   productImage?: string | null;

// //   product_discount?: number | null;
// //   note?: string | null;
// //   product_type?: string | null;
// // };

// // function pickImagePath(p: any): string | null {
// //   return (
// //     p?.imagePath ??
// //     p?.image_path ??
// //     p?.product_image ??
// //     p?.productImage ??
// //     null
// //   );
// // }

// // function buildImageUrl(path?: string | null) {
// //   if (!path) return null;
// //   const raw = String(path).trim();
// //   if (!raw) return null;

// //   if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

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

// // export default function ProductEditPage() {
// //   const router = useRouter();
// //   const params = useParams<{ id: string }>();
// //   const id = params?.id;

// //   const { data: session, status } = useSession();

// //   const token =
// //     (session as any)?.accessToken ||
// //     (session as any)?.access_token ||
// //     (session as any)?.token ||
// //     null;

// //   function authHeaders(): Record<string, string> {
// //     return token ? { Authorization: `Bearer ${token}` } : {};
// //   }

// //   const [loading, setLoading] = useState(true);
// //   const [saving, setSaving] = useState(false);

// //   const [product, setProduct] = useState<Product | null>(null);

// //   // form fields
// //   const [sku, setSku] = useState("");
// //   const [name, setName] = useState("");
// //   const [price, setPrice] = useState<number>(0);
// //   const [barcode, setBarcode] = useState("");
// //   const [category, setCategory] = useState("");
// //   const [type, setType] = useState("");
// //   const [qty, setQty] = useState<number>(0);
// //   const [discount, setDiscount] = useState<number>(0);
// //   const [note, setNote] = useState("");

// //   // image
// //   const [imageFile, setImageFile] = useState<File | null>(null);
// //   const [imagePreview, setImagePreview] = useState<string | null>(null);

// //   useEffect(() => {
// //     if (status === "unauthenticated") {
// //       toast.error("Login လုပ်ပါ");
// //       signIn();
// //     }
// //   }, [status]);

// //   async function loadProduct() {
// //     if (!id) return;

// //     if (status === "loading") return;
// //     if (!token) {
// //       toast.error("Session token မရပါ — Login ပြန်လုပ်ပါ");
// //       signIn();
// //       return;
// //     }

// //     const tId = toast.loading("Loading product...");

// //     try {
// //       setLoading(true);

// //       const res = await fetch(`/backend/api/products/${id}`, {
// //         method: "GET",
// //         headers: { ...authHeaders() },
// //         cache: "no-store",
// //       });

// //       if (!res.ok) {
// //         const detail = await readErrorText(res);

// //         if (res.status === 401) {
// //           toast.error("Unauthorized — Login ပြန်လုပ်ပါ", { id: tId });
// //           signIn();
// //         } else if (res.status === 403) {
// //           toast.error("Forbidden — ADMIN လိုနိုင်တယ်", { id: tId });
// //         } else if (res.status === 404) {
// //           toast.error("Product မတွေ့ပါ (404)", { id: tId });
// //         } else {
// //           toast.error(detail || `Product load မရပါ (status ${res.status})`, { id: tId });
// //         }

// //         setProduct(null);
// //         return;
// //       }

// //       const data = (await res.json()) as Product;
// //       setProduct(data);

// //       setSku(data.sku ?? "");
// //       setName(data.product_name ?? "");
// //       setPrice(Number(data.product_price ?? 0));
// //       setBarcode(data.barcode ?? "");
// //       setCategory(data.category ?? "");
// //       setType(data.product_type ?? "");
// //       setQty(Number(data.product_quantity_amount ?? 0));
// //       setDiscount(Number(data.product_discount ?? 0));
// //       setNote(data.note ?? "");

// //       // ✅ FIX: pick image path from multiple possible fields
// //       const imgPath = pickImagePath(data);
// //       setImagePreview(buildImageUrl(imgPath));

// //       setImageFile(null);

// //       toast.success("Loaded ✅", { id: tId });
// //     } catch (e) {
// //       console.error(e);
// //       toast.error("Server error ဖြစ်နေတယ်", { id: tId });
// //       setProduct(null);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   useEffect(() => {
// //     if (!id) return;
// //     if (status !== "authenticated") return;
// //     loadProduct();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [id, status, token]);

// //   useEffect(() => {
// //     if (!imageFile) return;
// //     const url = URL.createObjectURL(imageFile);
// //     setImagePreview(url);
// //     return () => URL.revokeObjectURL(url);
// //   }, [imageFile]);

// //   const stockStatus = useMemo(() => {
// //     if (qty <= 0) return { label: "Out", cls: "bg-red-500/10 text-red-700 border-red-500/20" };
// //     if (qty < 5) return { label: "Low", cls: "bg-amber-500/10 text-amber-800 border-amber-500/20" };
// //     return { label: "In", cls: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" };
// //   }, [qty]);

// //   async function onSave() {
// //     if (!product) return;

// //     if (status === "loading") return;
// //     if (!token) {
// //       toast.error("Session token မရပါ — Login ပြန်လုပ်ပါ");
// //       signIn();
// //       return;
// //     }

// //     if (!sku.trim()) return toast.error("SKU မဖြစ်မနေလိုပါတယ်");
// //     if (!name.trim()) return toast.error("Product name မဖြစ်မနေလိုပါတယ်");
// //     if (!Number.isFinite(price) || price < 0) return toast.error("Price မှန်မှန်ထည့်ပါ");
// //     if (!Number.isInteger(qty) || qty < 0) return toast.error("Stock (quantity) ကို 0 သို့ အပေါင်းကိန်း ထည့်ပါ");

// //     const tId = toast.loading("Saving...");

// //     try {
// //       setSaving(true);

// //       const fd = new FormData();
// //       fd.append("sku", sku.trim());
// //       fd.append("product_name", name.trim());
// //       fd.append("product_price", String(price));
// //       fd.append("product_quantity_amount", String(qty));

// //       fd.append("barcode", barcode.trim());
// //       fd.append("category", category.trim());
// //       fd.append("product_type", type.trim());
// //       fd.append("note", note.trim());
// //       fd.append("product_discount", String(Number.isFinite(discount) ? discount : 0));

// //       if (imageFile) fd.append("image", imageFile);

// //       const res = await fetch(`/backend/api/products/${product.id}`, {
// //         method: "PUT",
// //         headers: { ...authHeaders() },
// //         body: fd,
// //       });

// //       if (!res.ok) {
// //         const detail = await readErrorText(res);

// //         if (res.status === 401) {
// //           toast.error("Unauthorized — Login ပြန်လုပ်ပါ", { id: tId });
// //           signIn();
// //         } else if (res.status === 403) {
// //           toast.error("Forbidden — ADMIN လိုနိုင်တယ်", { id: tId });
// //         } else if (res.status === 404) {
// //           toast.error("Product မတွေ့ပါ (404)", { id: tId });
// //         } else {
// //           toast.error(detail || `Update failed (status ${res.status})`, { id: tId });
// //         }
// //         return;
// //       }

// //       toast.success("Product update ပြီးပါပြီ ✅", { id: tId });
// //       router.push(`/products/${product.id}`);
// //     } catch (e) {
// //       console.error(e);
// //       toast.error("Server error (update)", { id: tId });
// //     } finally {
// //       setSaving(false);
// //     }
// //   }

// //   if (status === "loading" || loading) {
// //     return <div className="flex justify-center py-10 text-muted-foreground">Loading...</div>;
// //   }

// //   if (status === "unauthenticated") {
// //     return <div className="flex justify-center py-10 text-muted-foreground">Redirecting to Sign in...</div>;
// //   }

// //   if (!product) {
// //     return (
// //       <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
// //         <div>Product not found</div>
// //         <Button variant="outline" size="sm" onClick={loadProduct} className="gap-2">
// //           <RefreshCw className="h-4 w-4" /> Retry
// //         </Button>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="flex justify-center py-8 px-3 overflow-x-hidden">
// //       <Card className="w-full max-w-4xl overflow-hidden">
// //         <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
// //           <div className="space-y-1 min-w-0">
// //             <CardTitle className="flex items-center gap-2">
// //               <Package className="h-5 w-5" />
// //               Edit Product
// //             </CardTitle>
// //             <CardDescription>
// //               Product ကိုပြင်ဆင်ပြီး Save လုပ်ပါ (image upload အပါအဝင်)
// //             </CardDescription>
// //           </div>

// //           <div className="flex flex-wrap gap-2">
// //             <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2" disabled={saving}>
// //               <ArrowLeft className="h-4 w-4" />
// //               Back
// //             </Button>

// //             <Button variant="outline" size="sm" onClick={loadProduct} className="gap-2" disabled={saving}>
// //               <RefreshCw className={saving ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
// //               Reload
// //             </Button>

// //             <Button size="sm" onClick={onSave} className="gap-2" disabled={saving}>
// //               <Save className="h-4 w-4" />
// //               {saving ? "Saving..." : "Save"}
// //             </Button>
// //           </div>
// //         </CardHeader>

// //         <CardContent className="grid gap-6 md:grid-cols-2">
// //           <div className="space-y-3">
// //             <div className="rounded-xl border bg-muted flex items-center justify-center min-h-[260px] overflow-hidden">
// //               {imagePreview ? (
// //                 <img src={imagePreview} alt="preview" className="max-h-[320px] object-contain" />
// //               ) : (
// //                 <div className="flex flex-col items-center text-muted-foreground">
// //                   <ImageIcon className="h-8 w-8" />
// //                   <span className="text-sm">No Image</span>
// //                 </div>
// //               )}
// //             </div>

// //             <div className="space-y-2">
// //               <Label>Change image (optional)</Label>
// //               <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
// //               <p className="text-xs text-muted-foreground">
// //                 Backend မှာ field name က <code>image</code> ဖြစ်ရမယ်။
// //               </p>
// //             </div>
// //           </div>

// //           <div className="space-y-4">
// //             <div className="grid gap-3">
// //               <div className="grid gap-2">
// //                 <Label>SKU</Label>
// //                 <Input value={sku} onChange={(e) => setSku(e.target.value)} />
// //               </div>

// //               <div className="grid gap-2">
// //                 <Label>Name</Label>
// //                 <Input value={name} onChange={(e) => setName(e.target.value)} />
// //               </div>

// //               <div className="grid gap-2">
// //                 <Label>Price</Label>
// //                 <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
// //               </div>

// //               <div className="grid gap-2">
// //                 <Label>Stock</Label>
// //                 <div className="flex items-center gap-2">
// //                   <Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
// //                   <Badge className={stockStatus.cls}>{stockStatus.label}</Badge>
// //                 </div>
// //               </div>

// //               <Separator />

// //               <div className="grid gap-2">
// //                 <Label>Barcode (optional)</Label>
// //                 <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} />
// //               </div>

// //               <div className="grid gap-2">
// //                 <Label>Category (optional)</Label>
// //                 <Input value={category} onChange={(e) => setCategory(e.target.value)} />
// //               </div>

// //               <div className="grid gap-2">
// //                 <Label>Type (optional)</Label>
// //                 <Input value={type} onChange={(e) => setType(e.target.value)} />
// //               </div>

// //               <div className="grid gap-2">
// //                 <Label>Discount (optional)</Label>
// //                 <Input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
// //               </div>

// //               <div className="grid gap-2">
// //                 <Label>Note (optional)</Label>
// //                 <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
// //               </div>
// //             </div>
// //           </div>
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // }













// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { useSession } from "next-auth/react";
// import toast from "react-hot-toast";
// import JsBarcode from "jsbarcode";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import {
//   ArrowLeft,
//   Sparkles,
//   Upload,
//   ScanLine,
//   Image as ImageIcon,
//   Trash2,
//   Loader2,
//   Wand2,
//   Tag,
//   Save,
//   Boxes,
//   CircleDollarSign,
//   Crop,
//   RefreshCw,
//   Pencil,
// } from "lucide-react";

// type ProductForm = {
//   sku: string;
//   product_name: string;
//   product_price: string;
//   barcode: string;
//   category: string;
//   product_quantity_amount: string;
//   product_discount: string;
//   note: string;
//   product_type: string;
// };

// type ProductApi = {
//   id: string;
//   sku?: string;
//   product_name?: string;
//   product_price?: number | string;
//   barcode?: string;
//   category?: string;
//   product_quantity_amount?: number | string;
//   product_discount?: number | string;
//   note?: string;
//   product_type?: string;
//   product_image?: string;
//   imagePath?: string;
//   image_path?: string;
// };

// type CategoryOption = {
//   label: string;
//   value: string;
// };

// const FALLBACK_CATEGORIES: CategoryOption[] = [
//   { label: "Drink", value: "DRINK" },
//   { label: "Food", value: "FOOD" },
//   { label: "Snack", value: "SNACK" },
//   { label: "Household", value: "HOUSEHOLD" },
//   { label: "Frozen", value: "FROZEN" },
//   { label: "Cosmetic", value: "COSMETIC" },
//   { label: "Other", value: "OTHER" },
// ];

// function normalizeTokenType(v: unknown) {
//   const s = String(v ?? "Bearer").replace(/\s+/g, " ").trim();
//   return s || "Bearer";
// }

// function slugify(v: string) {
//   return v
//     .toUpperCase()
//     .replace(/[^A-Z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "")
//     .slice(0, 24);
// }

// function inferCategory(name: string) {
//   const n = name.toLowerCase();
//   if (["cola", "coffee", "tea", "juice", "water", "drink", "soda", "milk"].some((k) => n.includes(k))) return "DRINK";
//   if (["chip", "cracker", "cookie", "snack", "nuts"].some((k) => n.includes(k))) return "SNACK";
//   if (["rice", "bread", "noodle", "food", "egg", "meat"].some((k) => n.includes(k))) return "FOOD";
//   if (["soap", "clean", "tissue", "detergent"].some((k) => n.includes(k))) return "HOUSEHOLD";
//   return "OTHER";
// }

// function inferType(name: string) {
//   const n = name.toLowerCase();
//   if (["cola", "coffee", "tea", "juice", "water", "drink", "soda", "milk"].some((k) => n.includes(k))) return "DRINK";
//   if (["rice", "bread", "noodle", "food", "egg", "meat"].some((k) => n.includes(k))) return "FOOD";
//   if (["chip", "cracker", "cookie", "snack", "nuts"].some((k) => n.includes(k))) return "SNACK";
//   return "OTHER";
// }

// function generateSku(name: string) {
//   const base = slugify(name || "PRODUCT").slice(0, 10) || "PRODUCT";
//   const rand = Math.floor(1000 + Math.random() * 9000);
//   return `${base}-${rand}`;
// }

// function generateBarcodeString(seed?: string) {
//   const base = String(Date.now()).slice(-9);
//   const extra = String(Math.floor(100 + Math.random() * 900));
//   const cleaned = (seed || "").replace(/\D/g, "").slice(0, 4);
//   return `${cleaned}${base}${extra}`.slice(0, 13);
// }

// function pickImagePath(p: ProductApi | null) {
//   if (!p) return null;
//   return p.imagePath || p.image_path || p.product_image || null;
// }

// function buildImageUrl(path?: string | null) {
//   if (!path) return null;
//   const raw = String(path).trim();
//   if (!raw) return null;
//   if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
//   const cleaned = raw.replace(/^\/?uploads\/?/, "").replace(/^\/+/, "");
//   return `/uploads/${cleaned}`;
// }

// async function cropImageToSquare(file: File): Promise<File> {
//   const dataUrl = await new Promise<string>((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => resolve(String(reader.result || ""));
//     reader.onerror = reject;
//     reader.readAsDataURL(file);
//   });

//   const img = await new Promise<HTMLImageElement>((resolve, reject) => {
//     const el = new Image();
//     el.onload = () => resolve(el);
//     el.onerror = reject;
//     el.src = dataUrl;
//   });

//   const size = Math.min(img.width, img.height);
//   const sx = Math.floor((img.width - size) / 2);
//   const sy = Math.floor((img.height - size) / 2);

//   const canvas = document.createElement("canvas");
//   canvas.width = size;
//   canvas.height = size;
//   const ctx = canvas.getContext("2d");
//   if (!ctx) throw new Error("Canvas unavailable");

//   ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);

//   const blob = await new Promise<Blob | null>((resolve) =>
//     canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
//   );

//   if (!blob) throw new Error("Crop failed");
//   const name = file.name.replace(/\.[^.]+$/, "") + "-crop.jpg";
//   return new File([blob], name, { type: "image/jpeg" });
// }

// export default function ProductEditPagePro() {
//   const router = useRouter();
//   const params = useParams();
//   const id = String(params?.id || "");
//   const { data: session, status } = useSession();

//   const [form, setForm] = useState<ProductForm>({
//     sku: "",
//     product_name: "",
//     product_price: "",
//     barcode: "",
//     category: "",
//     product_quantity_amount: "0",
//     product_discount: "0",
//     note: "",
//     product_type: "OTHER",
//   });
//   const [loading, setLoading] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [dragOver, setDragOver] = useState(false);
//   const [categories, setCategories] = useState<CategoryOption[]>(FALLBACK_CATEGORIES);
//   const [categoriesLoading, setCategoriesLoading] = useState(false);
//   const [aiFilling, setAiFilling] = useState(false);
//   const [cropping, setCropping] = useState(false);

//   const fileInputRef = useRef<HTMLInputElement | null>(null);
//   const barcodeSvgRef = useRef<SVGSVGElement | null>(null);

//   const apiBase = useMemo(() => (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, ""), []);
//   const accessToken = String((session as any)?.accessToken || "").trim();
//   const tokenType = normalizeTokenType((session as any)?.tokenType);

//   function setField<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
//     setForm((prev) => ({ ...prev, [key]: value }));
//   }

//   function updatePreviewWithFile(file: File) {
//     setImageFile(file);
//     setImagePreview((prev) => {
//       if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
//       return URL.createObjectURL(file);
//     });
//   }

//   function applyImage(file: File) {
//     if (!file.type.startsWith("image/")) {
//       toast.error("Image file ပဲရွေးပါ");
//       return;
//     }
//     updatePreviewWithFile(file);
//   }

//   function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     applyImage(file);
//   }

//   function handleDrop(e: React.DragEvent<HTMLDivElement>) {
//     e.preventDefault();
//     setDragOver(false);
//     const file = e.dataTransfer.files?.[0];
//     if (!file) return;
//     applyImage(file);
//   }

//   async function cropCurrentImage() {
//     if (!imageFile) {
//       toast.error("Image မရှိသေးပါ");
//       return;
//     }

//     try {
//       setCropping(true);
//       const cropped = await cropImageToSquare(imageFile);
//       updatePreviewWithFile(cropped);
//       toast.success("Image cropped ✅");
//     } catch {
//       toast.error("Crop failed");
//     } finally {
//       setCropping(false);
//     }
//   }

//   function autoFillFromName() {
//     if (!form.product_name.trim()) {
//       toast.error("Product name အရင်ထည့်ပါ");
//       return;
//     }

//     setAiFilling(true);
//     window.setTimeout(() => {
//       const name = form.product_name.trim();
//       const category = inferCategory(name);
//       const productType = inferType(name);
//       const nextSku = form.sku.trim() || generateSku(name);
//       const nextBarcode = form.barcode.trim() || generateBarcodeString(nextSku);

//       setForm((prev) => ({
//         ...prev,
//         sku: nextSku,
//         barcode: nextBarcode,
//         category: prev.category || category,
//         product_type: prev.product_type === "OTHER" ? productType : prev.product_type,
//         note: prev.note || `Auto-filled from product name: ${name}`,
//       }));

//       toast.success("AI auto fill done ✅");
//       setAiFilling(false);
//     }, 650);
//   }

//   function generateBarcodeNow() {
//     const next = generateBarcodeString(form.sku || form.product_name);
//     setField("barcode", next);
//     toast.success("Barcode generated ✅");
//   }

//   async function loadCategoriesFromApi() {
//     if (!apiBase) {
//       toast.error("NEXT_PUBLIC_API_URL မထည့်ရသေးပါ");
//       return;
//     }

//     setCategoriesLoading(true);
//     try {
//       const res = await fetch(`${apiBase}/api/categories`, {
//         headers: accessToken
//           ? { Authorization: `${tokenType} ${accessToken}` }
//           : undefined,
//       });

//       if (!res.ok) throw new Error();
//       const data = await res.json();

//       const mapped: CategoryOption[] = Array.isArray(data)
//         ? data.map((item: any) => ({
//             label: String(item.label ?? item.name ?? item.category ?? item.value ?? "OTHER"),
//             value: String(item.value ?? item.name ?? item.category ?? item.label ?? "OTHER").toUpperCase(),
//           }))
//         : [];

//       if (!mapped.length) throw new Error();
//       setCategories(mapped);
//       toast.success("Category API connected ✅");
//     } catch {
//       toast.error("API category မရလို့ fallback categories သုံးထားပါတယ်");
//       setCategories(FALLBACK_CATEGORIES);
//     } finally {
//       setCategoriesLoading(false);
//     }
//   }

//   async function loadProduct() {
//     if (!id || !apiBase || !accessToken) return;

//     setInitialLoading(true);
//     try {
//       const res = await fetch(`${apiBase}/api/products/${id}`, {
//         headers: { Authorization: `${tokenType} ${accessToken}` },
//         cache: "no-store",
//       });

//       if (!res.ok) throw new Error();
//       const data: ProductApi = await res.json();

//       setForm({
//         sku: String(data.sku || ""),
//         product_name: String(data.product_name || ""),
//         product_price: String(data.product_price ?? ""),
//         barcode: String(data.barcode || ""),
//         category: String(data.category || ""),
//         product_quantity_amount: String(data.product_quantity_amount ?? "0"),
//         product_discount: String(data.product_discount ?? "0"),
//         note: String(data.note || ""),
//         product_type: String(data.product_type || "OTHER"),
//       });

//       const img = buildImageUrl(pickImagePath(data));
//       if (img) {
//         setImagePreview((prev) => {
//           if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
//           return img;
//         });
//       }
//     } catch {
//       toast.error("Product load failed");
//     } finally {
//       setInitialLoading(false);
//     }
//   }

//   useEffect(() => {
//     if (!barcodeSvgRef.current) return;
//     if (!form.barcode.trim()) return;

//     try {
//       JsBarcode(barcodeSvgRef.current, form.barcode.trim(), {
//         format: "CODE128",
//         displayValue: true,
//         fontSize: 12,
//         height: 55,
//         margin: 6,
//       });
//     } catch {}
//   }, [form.barcode]);

//   useEffect(() => {
//     if (status === "authenticated" && accessToken && id) {
//       loadProduct();
//     }
//   }, [status, accessToken, id]);

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
//       toast.error("Login မဝင်ရသေးပါ");
//       return;
//     }

//     if (!accessToken) {
//       toast.error("Session ထဲမှာ accessToken မတွေ့ပါ");
//       return;
//     }

//     if (!form.sku.trim() || !form.product_name.trim() || !form.product_price.trim()) {
//       toast.error("SKU, Product Name, Price ကို ထည့်ပေးပါ");
//       return;
//     }

//     const product_price = Number(form.product_price);
//     const product_quantity_amount = Number(form.product_quantity_amount || 0);
//     const product_discount = Number(form.product_discount || 0);

//     if (Number.isNaN(product_price)) return toast.error("Price သည် number ဖြစ်ရပါမယ်");
//     if (Number.isNaN(product_quantity_amount)) return toast.error("Quantity သည် number ဖြစ်ရပါမယ်");
//     if (Number.isNaN(product_discount)) return toast.error("Discount သည် number ဖြစ်ရပါမယ်");

//     setLoading(true);
//     const toastId = toast.loading("Updating product...");

//     try {
//       const formData = new FormData();
//       formData.append("sku", form.sku.trim());
//       formData.append("product_name", form.product_name.trim());
//       formData.append("product_price", String(product_price));
//       formData.append("product_quantity_amount", String(product_quantity_amount));
//       formData.append("product_discount", String(product_discount));

//       if (form.barcode.trim()) formData.append("barcode", form.barcode.trim());
//       if (form.category.trim()) formData.append("category", form.category.trim());
//       if (form.product_type.trim()) formData.append("product_type", form.product_type.trim());
//       if (form.note.trim()) formData.append("note", form.note.trim());
//       if (imageFile) formData.append("image", imageFile);

//       const res = await fetch(`${apiBase}/api/products/${id}`, {
//         method: "PUT",
//         body: formData,
//         headers: { Authorization: `${tokenType} ${accessToken}` },
//       });

//       const text = await res.text().catch(() => "");
//       let json: any = null;
//       try {
//         json = text ? JSON.parse(text) : null;
//       } catch {}

//       if (!res.ok) {
//         const msg = json?.message || json?.error || text || `Failed (${res.status})`;
//         toast.error(String(msg), { id: toastId });
//         return;
//       }

//       toast.success(`Updated: ${json?.product_name ?? form.product_name}`, { id: toastId });
//       router.push(`/dashboard/product/${id}`);
//     } catch {
//       toast.error("Server error ဖြစ်နေတယ်", { id: toastId });
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (initialLoading) {
//     return (
//       <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 py-6 md:px-6 2xl:px-10">
//         <div className="flex items-center gap-2 text-sm text-muted-foreground">
//           <Loader2 className="h-4 w-4 animate-spin" />
//           Loading product...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 2xl:px-10 space-y-6">
//       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
//         <div>
//           <div className="flex items-center gap-2 text-sm font-bold text-cyan-600">
//             <Sparkles className="h-4 w-4" />
//             PRO EDIT PAGE
//           </div>
//           <h1 className="mt-1 text-3xl font-black tracking-tight">Edit Product</h1>
//           <p className="mt-1 text-sm text-muted-foreground">
//             create page နဲ့တူတဲ့ workflow, barcode preview, category API, drag & drop image + crop
//           </p>
//         </div>

//         <div className="flex items-center gap-2">
//           <Button type="button" variant="outline" onClick={() => router.back()} className="gap-2">
//             <ArrowLeft className="h-4 w-4" />
//             Back
//           </Button>
//           <Button type="button" variant="outline" onClick={loadProduct} className="gap-2">
//             <RefreshCw className="h-4 w-4" />
//             Reload
//           </Button>
//         </div>
//       </div>

//       <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
//         <Card className="rounded-3xl border">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2 text-2xl">
//               <Pencil className="h-5 w-5" />
//               Product Form
//             </CardTitle>
//             <CardDescription>
//               edit page ကို pro create version နဲ့ align ဖြစ်အောင် ပြင်ထားပါတယ်
//             </CardDescription>
//           </CardHeader>

//           <form onSubmit={handleSubmit} noValidate>
//             <CardContent className="space-y-6">
//               <div className="flex flex-wrap gap-2">
//                 <Button type="button" variant="outline" onClick={autoFillFromName} disabled={aiFilling} className="gap-2">
//                   {aiFilling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
//                   AI Auto Fill
//                 </Button>

//                 <Button type="button" variant="outline" onClick={generateBarcodeNow} className="gap-2">
//                   <ScanLine className="h-4 w-4" />
//                   Generate Barcode
//                 </Button>

//                 <Button type="button" variant="outline" onClick={loadCategoriesFromApi} disabled={categoriesLoading} className="gap-2">
//                   {categoriesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
//                   Category API Connect
//                 </Button>
//               </div>

//               <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
//                 <div className="space-y-2">
//                   <Label htmlFor="sku">SKU / Code</Label>
//                   <Input id="sku" value={form.sku} onChange={(e) => setField("sku", e.target.value)} placeholder="SKU-1001" />
//                 </div>

//                 <div className="space-y-2 md:col-span-2">
//                   <Label htmlFor="product_name">Product Name</Label>
//                   <Input id="product_name" value={form.product_name} onChange={(e) => setField("product_name", e.target.value)} placeholder="Coca Cola 500ml" />
//                 </div>
//               </div>

//               <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
//                 <div className="space-y-2">
//                   <Label htmlFor="product_price">Price</Label>
//                   <Input id="product_price" type="number" min="0" step="0.01" value={form.product_price} onChange={(e) => setField("product_price", e.target.value)} placeholder="1200" />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="product_quantity_amount">Quantity / Stock</Label>
//                   <Input id="product_quantity_amount" type="number" min="0" step="1" value={form.product_quantity_amount} onChange={(e) => setField("product_quantity_amount", e.target.value)} placeholder="50" />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="product_discount">Discount</Label>
//                   <Input id="product_discount" type="number" min="0" step="0.01" value={form.product_discount} onChange={(e) => setField("product_discount", e.target.value)} placeholder="100" />
//                 </div>
//               </div>

//               <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
//                 <div className="space-y-2">
//                   <Label htmlFor="barcode">Barcode</Label>
//                   <Input id="barcode" value={form.barcode} onChange={(e) => setField("barcode", e.target.value)} placeholder="8852121212333" />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Category</Label>
//                   <Select value={form.category} onValueChange={(value) => setField("category", value)}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select category" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {categories.map((cat) => (
//                         <SelectItem key={cat.value} value={cat.value}>
//                           {cat.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label>Product Type</Label>
//                   <Select value={form.product_type} onValueChange={(value) => setField("product_type", value)}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select type" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="DRINK">Drink</SelectItem>
//                       <SelectItem value="FOOD">Food</SelectItem>
//                       <SelectItem value="SNACK">Snack</SelectItem>
//                       <SelectItem value="OTHER">Other</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="note">Note</Label>
//                 <Textarea id="note" value={form.note} onChange={(e) => setField("note", e.target.value)} placeholder="..." rows={4} />
//               </div>

//               <div className="flex justify-end gap-2">
//                 <Button type="submit" disabled={loading} className="gap-2">
//                   {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
//                   {loading ? "Saving..." : "Update Product"}
//                 </Button>
//               </div>
//             </CardContent>
//           </form>
//         </Card>

//         <div className="space-y-6">
//           <Card className="rounded-3xl border">
//             <CardHeader>
//               <CardTitle className="text-xl">Image Upload</CardTitle>
//               <CardDescription>drag & drop + square crop</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div
//                 onDragOver={(e) => {
//                   e.preventDefault();
//                   setDragOver(true);
//                 }}
//                 onDragLeave={() => setDragOver(false)}
//                 onDrop={handleDrop}
//                 className={
//                   "rounded-3xl border-2 border-dashed p-6 text-center transition " +
//                   (dragOver ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20" : "border-muted-foreground/20")
//                 }
//               >
//                 <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleImageChange} />

//                 <div className="flex flex-col items-center gap-3">
//                   <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
//                     <Upload className="h-6 w-6" />
//                   </div>
//                   <div>
//                     <div className="font-semibold">Drop image here</div>
//                     <div className="text-sm text-muted-foreground">or click button below</div>
//                   </div>
//                   <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
//                     <Upload className="h-4 w-4" />
//                     Choose File
//                   </Button>
//                 </div>
//               </div>

//               <div className="flex gap-2">
//                 <Button type="button" variant="outline" onClick={cropCurrentImage} disabled={!imageFile || cropping} className="gap-2 flex-1">
//                   {cropping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crop className="h-4 w-4" />}
//                   Crop Square
//                 </Button>
//                 <Button type="button" variant="outline" onClick={() => imageFile && updatePreviewWithFile(imageFile)} disabled={!imageFile} className="gap-2">
//                   <RefreshCw className="h-4 w-4" />
//                 </Button>
//               </div>

//               <div className="overflow-hidden rounded-3xl border bg-muted/30 min-h-[280px] flex items-center justify-center">
//                 {imagePreview ? (
//                   <img src={imagePreview} alt="Preview" className="max-h-[360px] w-full object-contain" />
//                 ) : (
//                   <div className="flex flex-col items-center gap-2 text-muted-foreground">
//                     <ImageIcon className="h-10 w-10" />
//                     <span className="text-sm">No Image</span>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="rounded-3xl border">
//             <CardHeader>
//               <CardTitle className="text-xl">Live Preview</CardTitle>
//               <CardDescription>barcode + quick info</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="grid grid-cols-3 gap-3">
//                 <div className="rounded-2xl border p-3">
//                   <div className="text-[11px] text-muted-foreground">Price</div>
//                   <div className="mt-1 font-black flex items-center gap-1"><CircleDollarSign className="h-4 w-4" />{form.product_price || "0"}</div>
//                 </div>
//                 <div className="rounded-2xl border p-3">
//                   <div className="text-[11px] text-muted-foreground">Stock</div>
//                   <div className="mt-1 font-black flex items-center gap-1"><Boxes className="h-4 w-4" />{form.product_quantity_amount || "0"}</div>
//                 </div>
//                 <div className="rounded-2xl border p-3">
//                   <div className="text-[11px] text-muted-foreground">Type</div>
//                   <div className="mt-1 font-black">{form.product_type || "OTHER"}</div>
//                 </div>
//               </div>

//               <div className="rounded-3xl border p-4">
//                 <div className="text-sm font-semibold">{form.product_name || "Product Name"}</div>
//                 <div className="text-xs text-muted-foreground mt-1">SKU: {form.sku || "-"}</div>
//                 <div className="text-xs text-muted-foreground">Category: {form.category || "-"}</div>
//               </div>

//               <div className="rounded-3xl border p-4 overflow-x-auto">
//                 {form.barcode ? (
//                   <svg ref={barcodeSvgRef} />
//                 ) : (
//                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                     <ScanLine className="h-4 w-4" />
//                     barcode not generated yet
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
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

  // form
  const [form,        setForm]        = useState<ProductForm>(EMPTY_FORM);
  const [origForm,    setOrigForm]    = useState<ProductForm>(EMPTY_FORM);   // snapshot for dirty check
  const [loading,     setLoading]     = useState(false);
  const [fetching,    setFetching]    = useState(true);
  const [fetchError,  setFetchError]  = useState<string | null>(null);
  const [imageFile,   setImageFile]   = useState<File | null>(null);
  const [preview,     setPreview]     = useState<string | null>(null);       // new file preview
  const [serverImage, setServerImage] = useState<string | null>(null);       // existing image URL
  const [dragOver,    setDragOver]    = useState(false);
  const [categories,  setCategories]  = useState<CategoryOption[]>(FALLBACK_CATEGORIES);
  const [catLoading,  setCatLoading]  = useState(false);
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
    return new Set(keys.filter((k) => form[k] !== origForm[k]));
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
  }, [productId, status]);

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
      setCategories(mapped);
      toast.success("Category API connected ✅");
    } catch {
      toast.error("API မရလို့ fallback categories သုံးထားပါ");
      setCategories(FALLBACK_CATEGORIES);
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
    if (!apiBase)                   { toast.error("NEXT_PUBLIC_API_BASE_URL မထည့်ရသေးပါ"); return; }
    if (status === "loading")       { toast("Checking login..."); return; }
    if (status !== "authenticated") { toast.error("Login မဝင်ရသေးပါ"); return; }
    if (!accessToken)               { toast.error("Session ထဲမှာ accessToken မတွေ့ပါ"); return; }
    if (!form.sku.trim() || !form.product_name.trim() || !form.product_price.trim()) {
      toast.error("SKU, Product Name, Price ကို ထည့်ပေးပါ"); return;
    }
    const price    = Number(form.product_price);
    const qty      = Number(form.product_quantity_amount || 0);
    const discount = Number(form.product_discount || 0);
    if (isNaN(price))    { toast.error("Price သည် number ဖြစ်ရပါမယ်"); return; }
    if (isNaN(qty))      { toast.error("Quantity သည် number ဖြစ်ရပါမယ်"); return; }
    if (isNaN(discount)) { toast.error("Discount သည် number ဖြစ်ရပါမယ်"); return; }

    setLoading(true);
    const tid = toast.loading("Updating product...");
    try {
      const fd = new FormData();
      fd.append("sku",                     form.sku.trim());
      fd.append("product_name",            form.product_name.trim());
      fd.append("product_price",           String(price));
      fd.append("product_quantity_amount", String(qty));
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
    } finally { setLoading(false); }
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
                      Category API
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

                  {/* Price + Stock + Discount */}
                  <div className="grid gap-4 md:grid-cols-3">
                    {(["product_price", "product_quantity_amount", "product_discount"] as const).map((key) => (
                      <div key={key} className="space-y-1.5">
                        <Label className={cn("text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                          dirtyFields.has(key) ? (theme === "dark" ? "text-[#d4a352]" : "text-blue-600") : t.textSubtle)}>
                          {key === "product_price" ? "Price (MMK)" : key === "product_quantity_amount" ? "Stock" : "Discount"}
                          {dirtyFields.has(key) && <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-400">CHANGED</span>}
                        </Label>
                        <Input type="number" min="0" step={key === "product_quantity_amount" ? "1" : "0.01"}
                          value={form[key]}
                          onChange={(e) => setField(key, e.target.value)}
                          className={cn("h-10 rounded-xl transition-all", dirtyFields.has(key) ? t.changedField : t.input)}
                        />
                      </div>
                    ))}
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
                          {["DRINK","FOOD","SNACK","OTHER"].map((v) => (
                            <SelectItem key={v} value={v}>{v.charAt(0) + v.slice(1).toLowerCase()}</SelectItem>
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
                      { label: "Stock", value: form.product_quantity_amount || "0", icon: Boxes, dirty: dirtyFields.has("product_quantity_amount") },
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
                          SKU: {form.sku || "—"} · {form.category || "UNCATEGORIZED"}
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
