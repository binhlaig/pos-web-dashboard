// // "use client";

// // import { useState } from "react";
// // import { useRouter } from "next/navigation";
// // import {
// //   Card,
// //   CardHeader,
// //   CardTitle,
// //   CardDescription,
// //   CardContent,
// //   CardFooter,
// // } from "@/components/ui/card";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Textarea } from "@/components/ui/textarea";
// // import { Button } from "@/components/ui/button";
// // import {
// //   Select,
// //   SelectTrigger,
// //   SelectContent,
// //   SelectItem,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import { toast } from "sonner";
// // import { Image as ImageIcon, UploadIcon } from "lucide-react";

// // type ProductFormState = {
// //   sku: string;
// //   product_name: string;
// //   product_price: string; // form မှာ string, 보내기 전에 number ပြောင်းမယ်
// //   barcode: string;
// //   category: string;
// //   product_quantity_amount: string;
// //   product_image: string;
// //   product_discount: string;
// //   note: string;
// //   product_type: string;
// // };

// // const initialForm: ProductFormState = {
// //   sku: "",
// //   product_name: "",
// //   product_price: "",
// //   barcode: "",
// //   category: "",
// //   product_quantity_amount: "",
// //   product_image: "",
// //   product_discount: "",
// //   note: "",
// //   product_type: "",
// // };

// // export default function ProductCreatePage() {
// //   const [form, setForm] = useState<ProductFormState>(initialForm);
// //   const [loading, setLoading] = useState(false);
// //   const [imagePreview, setImagePreview] = useState<string | null>(null);
// //   const [imageFile, setImageFile] = useState<File | null>(null); // future upload 用
// //   const router = useRouter();

// //   const apiBase = process.env.NEXT_PUBLIC_API_URL;

// //   function handleChange(field: keyof ProductFormState, value: string) {
// //     setForm((prev) => ({ ...prev, [field]: value }));
// //   }

// //   function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
// //     const file = e.target.files?.[0];
// //     if (!file) return;

// //     setImageFile(file);
// //     setImagePreview(URL.createObjectURL(file));

// //     // file name ကို path အဖြစ် 변환해서 backend ထဲသို့သွားမယ်
// //     const cleaned = file.name.replace(/\s+/g, "_").toLowerCase();
// //     const path = `/uploads/products/${cleaned}`;
// //     handleChange("product_image", path);
// //   }

// //   async function handleSubmit(e: React.FormEvent) {
// //     e.preventDefault();

// //     // basic validation
// //     if (!form.sku || !form.product_name || !form.product_price) {
// //       toast.error("SKU, Product Name, Price ကို ထည့်ပေးပါ");
// //       return;
// //     }

// //     const product_price = Number(form.product_price);
// //     const product_quantity_amount = form.product_quantity_amount
// //       ? Number(form.product_quantity_amount)
// //       : 0;
// //     const product_discount = form.product_discount
// //       ? Number(form.product_discount)
// //       : 0;

// //     if (Number.isNaN(product_price)) {
// //       toast.error("Price သည် number ဖြစ်ရပါမယ်");
// //       return;
// //     }

// //     setLoading(true);
// //     try {
// //       const payload = {
// //         sku: form.sku,
// //         product_name: form.product_name,
// //         product_price,
// //         barcode: form.barcode || undefined,
// //         category: form.category || undefined,
// //         product_quantity_amount,
// //         product_image: form.product_image || undefined,
// //         product_discount,
// //         note: form.note || undefined,
// //         product_type: form.product_type || undefined,
// //       };

// //       // NOTE:
// //       // အခု version မှာ file ကို backend ကို multipart နဲ့မပို့သေးဘူး။
// //       // backend တွင် Multer upload route သတ်မှတ်လိုက်ရင်
// //       // imageFile ကို သာသီးသန့် upload လိုက်ပြီး path ကို DB ထဲသိုလို့ရမယ်။

// //       const res = await fetch(`${apiBase}/api/products`, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify(payload),
// //       });

// //       if (!res.ok) {
// //         const data = await res.json().catch(() => null);
// //         const msg =
// //           typeof data?.message === "string"
// //             ? data.message
// //             : Array.isArray(data?.message)
// //             ? data.message.join("\n")
// //             : `Failed to create product (status ${res.status})`;
// //         toast.error(msg);
// //         return;
// //       }

// //       const created = await res.json().catch(() => null);
// //       toast.success(
// //         `Product ထည့်သွင်းပြီးပါပြီ: ${created?.product_name ?? form.product_name}`,
// //       );

// //       setForm(initialForm);
// //       setImageFile(null);
// //       setImagePreview(null);

// //       // list page သို့လှည့်ချင်ရင်
// //       // router.push("/products");
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Server error ဖြစ်နေတယ်");
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   return (
// //     <div className="flex w-full justify-center py-8">
// //       <Card className="w-full max-w-3xl">
// //         <CardHeader>
// //           <CardTitle>New Product</CardTitle>
// //           <CardDescription>
// //             စူပါမားကက် Product အသစ်တစ်ခုကို ထည့်သွင်းရန် form ဖြစ်သည်။
// //           </CardDescription>
// //         </CardHeader>

// //         <form onSubmit={handleSubmit}>
// //           <CardContent className="space-y-6">
// //             {/* Row 1: SKU + Name */}
// //             <div className="grid gap-4 md:grid-cols-2">
// //               <div className="space-y-2">
// //                 <Label htmlFor="sku">SKU / Code</Label>
// //                 <Input
// //                   id="sku"
// //                   value={form.sku}
// //                   onChange={(e) => handleChange("sku", e.target.value)}
// //                   placeholder="SKU-1001"
// //                   required
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <Label htmlFor="product_name">Product Name</Label>
// //                 <Input
// //                   id="product_name"
// //                   value={form.product_name}
// //                   onChange={(e) =>
// //                     handleChange("product_name", e.target.value)
// //                   }
// //                   placeholder="Coca Cola 500ml"
// //                   required
// //                 />
// //               </div>
// //             </div>

// //             {/* Row 2: Price + Quantity */}
// //             <div className="grid gap-4 md:grid-cols-2">
// //               <div className="space-y-2">
// //                 <Label htmlFor="product_price">Price (JPY/MMK ...)</Label>
// //                 <Input
// //                   id="product_price"
// //                   type="number"
// //                   min="0"
// //                   step="0.01"
// //                   value={form.product_price}
// //                   onChange={(e) =>
// //                     handleChange("product_price", e.target.value)
// //                   }
// //                   placeholder="1200"
// //                   required
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <Label htmlFor="product_quantity_amount">
// //                   Quantity / Stock
// //                 </Label>
// //                 <Input
// //                   id="product_quantity_amount"
// //                   type="number"
// //                   min="0"
// //                   step="0.01"
// //                   value={form.product_quantity_amount}
// //                   onChange={(e) =>
// //                     handleChange(
// //                       "product_quantity_amount",
// //                       e.target.value,
// //                     )
// //                   }
// //                   placeholder="50"
// //                 />
// //               </div>
// //             </div>

// //             {/* Row 3: Barcode + Discount */}
// //             <div className="grid gap-4 md:grid-cols-2">
// //               <div className="space-y-2">
// //                 <Label htmlFor="barcode">Barcode</Label>
// //                 <Input
// //                   id="barcode"
// //                   value={form.barcode}
// //                   onChange={(e) =>
// //                     handleChange("barcode", e.target.value)
// //                   }
// //                   placeholder="8852121212333"
// //                 />
// //               </div>
// //               <div className="space-y-2">
// //                 <Label htmlFor="product_discount">
// //                   Discount (amount)
// //                 </Label>
// //                 <Input
// //                   id="product_discount"
// //                   type="number"
// //                   min="0"
// //                   step="0.01"
// //                   value={form.product_discount}
// //                   onChange={(e) =>
// //                     handleChange("product_discount", e.target.value)
// //                   }
// //                   placeholder="100"
// //                 />
// //               </div>
// //             </div>

// //             {/* Row 4: Category + Type */}
// //             <div className="grid gap-4 md:grid-cols-2">
// //               <div className="space-y-2">
// //                 <Label htmlFor="category">Category</Label>
// //                 <Input
// //                   id="category"
// //                   value={form.category}
// //                   onChange={(e) =>
// //                     handleChange("category", e.target.value)
// //                   }
// //                   placeholder="Drink / Snack / etc."
// //                 />
// //               </div>

// //               <div className="space-y-2">
// //                 <Label>Product Type</Label>
// //                 <Select
// //                   value={form.product_type}
// //                   onValueChange={(value) =>
// //                     handleChange("product_type", value)
// //                   }
// //                 >
// //                   <SelectTrigger>
// //                     <SelectValue placeholder="Select type" />
// //                   </SelectTrigger>
// //                   <SelectContent>
// //                     <SelectItem value="DRINK">Drink</SelectItem>
// //                     <SelectItem value="FOOD">Food</SelectItem>
// //                     <SelectItem value="SNACK">Snack</SelectItem>
// //                     <SelectItem value="OTHER">Other</SelectItem>
// //                   </SelectContent>
// //                 </Select>
// //               </div>
// //             </div>

// //             {/* Row 5: Image upload + preview + path */}
// //             <div className="space-y-2">
// //               <Label className="flex items-center gap-2">
// //                 <ImageIcon className="w-4 h-4" />
// //                 Product Image
// //               </Label>

// //               <div className="flex flex-col md:flex-row gap-4 md:items-center">
// //                 {/* Upload Button */}
// //                 <div>
// //                   <label
// //                     htmlFor="imageUpload"
// //                     className="flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer bg-muted hover:bg-accent"
// //                   >
// //                     <UploadIcon className="w-4 h-4" />
// //                     Choose File
// //                   </label>

// //                   <input
// //                     id="imageUpload"
// //                     type="file"
// //                     className="hidden"
// //                     accept="image/*"
// //                     onChange={handleImageChange}
// //                   />
// //                 </div>

// //                 {/* Preview */}
// //                 {imagePreview ? (
// //                   <img
// //                     src={imagePreview}
// //                     alt="Preview"
// //                     className="w-24 h-24 rounded-md object-cover border"
// //                   />
// //                 ) : (
// //                   <div className="w-24 h-24 flex items-center justify-center border rounded-md text-xs text-muted-foreground">
// //                     No Image
// //                   </div>
// //                 )}
// //               </div>

// //               {/* backend path display */}
// //               <Input
// //                 disabled
// //                 value={form.product_image}
// //                 placeholder="/uploads/products/xxx.png"
// //                 className="bg-muted cursor-not-allowed"
// //               />
// //             </div>

// //             {/* Row 6: Note */}
// //             <div className="space-y-2">
// //               <Label htmlFor="note">Note</Label>
// //               <Textarea
// //                 id="note"
// //                 value={form.note}
// //                 onChange={(e) => handleChange("note", e.target.value)}
// //                 placeholder="စျေးနှုန်း ပြောင်းလဲလျှင် / လော့ထပ်စော်ရင် စာရိုက်ထားနိုင်ပါတယ်..."
// //                 rows={3}
// //               />
// //             </div>
// //           </CardContent>

// //           <CardFooter className="flex justify-end gap-6 px-4 py-6">
// //             <Button
// //               type="button"
// //               variant="outline"
// //               onClick={() => {
// //                 setForm(initialForm);
// //                 setImageFile(null);
// //                 setImagePreview(null);
// //               }}
// //               disabled={loading}
// //             >
// //               Clear
// //             </Button>
// //             <Button type="submit" disabled={loading}>
// //               {loading ? "Saving..." : "Save Product"}
// //             </Button>
// //           </CardFooter>
// //         </form>
// //       </Card>
// //     </div>
// //   );
// // }







// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
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
// import { toast } from "sonner";
// import { Image as ImageIcon, UploadIcon } from "lucide-react";

// type ProductFormState = {
//   sku: string;
//   product_name: string;
//   product_price: string; // form မှာ string, 보내기 전에 number ပြောင်းမယ်
//   barcode: string;
//   category: string;
//   product_quantity_amount: string;
//   product_image: string;
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

// export default function ProductCreatePage() {
//   const [form, setForm] = useState<ProductFormState>(initialForm);
//   const [loading, setLoading] = useState(false);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [imageFile, setImageFile] = useState<File | null>(null); // upload 用
//   const router = useRouter();

//   const apiBase = process.env.NEXT_PUBLIC_API_URL;

//   function handleChange(field: keyof ProductFormState, value: string) {
//     setForm((prev) => ({ ...prev, [field]: value }));
//   }

//   function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setImageFile(file);
//     setImagePreview(URL.createObjectURL(file));

//     // ❌ မူလက fake path (/uploads/products/xxx) generate လုပ်ထားတယ်
//     // backend က file.filename နဲ့ 자체 path သတ်မှတ်လိမ့်မယ် — frontend က မလုပ်တော့ပါ
//     handleChange("product_image", file.name); // UI မှာ file name လောက်ပြချင်လို့
//   }

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();

//     // basic validation
//     if (!form.sku || !form.product_name || !form.product_price) {
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

//     if (Number.isNaN(product_price)) {
//       toast.error("Price သည် number ဖြစ်ရပါမယ်");
//       return;
//     }

//     setLoading(true);
//     try {
//       // 🔥 JSON အစား FormData သုံးမယ် (multipart/form-data)
//       const formData = new FormData();
//       formData.append("sku", form.sku);
//       formData.append("product_name", form.product_name);
//       formData.append("product_price", String(product_price));
//       formData.append(
//         "product_quantity_amount",
//         String(product_quantity_amount),
//       );

//       if (form.barcode) formData.append("barcode", form.barcode);
//       if (form.category) formData.append("category", form.category);
//       if (form.product_type) formData.append("product_type", form.product_type);
//       if (form.note) formData.append("note", form.note);
//       formData.append("product_discount", String(product_discount));

//       // ⬅⬅ image file ရှိရင် "image" နာမည်နဲ့ပို့မယ်
//       // backend: FileInterceptor('image', ...) နဲ့ ကိုက်
//       if (imageFile) {
//         formData.append("image", imageFile);
//       }

//       const res = await fetch(`${apiBase}/api/products`, {
//         method: "POST",
//         body: formData,
//         // ❌ "Content-Type": "application/json" မသတ်မှတ်ပါနဲ့
//         // browser က tự動 multipart/form-data + boundary ထည့်ပေးမယ်
//       });

//       if (!res.ok) {
//         const data = await res.json().catch(() => null);
//         const msg =
//           typeof data?.message === "string"
//             ? data.message
//             : Array.isArray(data?.message)
//             ? data.message.join("\n")
//             : `Failed to create product (status ${res.status})`;
//         toast.error(msg);
//         return;
//       }

//       const created = await res.json().catch(() => null);
//       toast.success(
//         `Product ထည့်သွင်းပြီးပါပြီ: ${
//           created?.product_name ?? form.product_name
//         }`,
//       );

//       setForm(initialForm);
//       setImageFile(null);
//       setImagePreview(null);

//       // list page သို့လှည့်ချင်ရင်
//       // router.push("/products");
//     } catch (err) {
//       console.error(err);
//       toast.error("Server error ဖြစ်နေတယ်");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="flex w-full justify-center py-8">
//       <Card className="w-full max-w-3xl">
//         <CardHeader>
//           <CardTitle>New Product</CardTitle>
//           <CardDescription>
//             စူပါမားကက် Product အသစ်တစ်ခုကို ထည့်သွင်းရန် form ဖြစ်သည်။
//           </CardDescription>
//         </CardHeader>

//         <form onSubmit={handleSubmit}>
//           <CardContent className="space-y-6">
//             {/* Row 1: SKU + Name */}
//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <Label htmlFor="sku">SKU / Code</Label>
//                 <Input
//                   id="sku"
//                   value={form.sku}
//                   onChange={(e) => handleChange("sku", e.target.value)}
//                   placeholder="SKU-1001"
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="product_name">Product Name</Label>
//                 <Input
//                   id="product_name"
//                   value={form.product_name}
//                   onChange={(e) =>
//                     handleChange("product_name", e.target.value)
//                   }
//                   placeholder="Coca Cola 500ml"
//                   required
//                 />
//               </div>
//             </div>

//             {/* Row 2: Price + Quantity */}
//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <Label htmlFor="product_price">Price (JPY/MMK ...)</Label>
//                 <Input
//                   id="product_price"
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={form.product_price}
//                   onChange={(e) =>
//                     handleChange("product_price", e.target.value)
//                   }
//                   placeholder="1200"
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="product_quantity_amount">
//                   Quantity / Stock
//                 </Label>
//                 <Input
//                   id="product_quantity_amount"
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={form.product_quantity_amount}
//                   onChange={(e) =>
//                     handleChange(
//                       "product_quantity_amount",
//                       e.target.value,
//                     )
//                   }
//                   placeholder="50"
//                 />
//               </div>
//             </div>

//             {/* Row 3: Barcode + Discount */}
//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <Label htmlFor="barcode">Barcode</Label>
//                 <Input
//                   id="barcode"
//                   value={form.barcode}
//                   onChange={(e) =>
//                     handleChange("barcode", e.target.value)
//                   }
//                   placeholder="8852121212333"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="product_discount">
//                   Discount (amount)
//                 </Label>
//                 <Input
//                   id="product_discount"
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={form.product_discount}
//                   onChange={(e) =>
//                     handleChange("product_discount", e.target.value)
//                   }
//                   placeholder="100"
//                 />
//               </div>
//             </div>

//             {/* Row 4: Category + Type */}
//             <div className="grid gap-4 md:grid-cols-2">
//               <div className="space-y-2">
//                 <Label htmlFor="category">Category</Label>
//                 <Input
//                   id="category"
//                   value={form.category}
//                   onChange={(e) =>
//                     handleChange("category", e.target.value)
//                   }
//                   placeholder="Drink / Snack / etc."
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label>Product Type</Label>
//                 <Select
//                   value={form.product_type}
//                   onValueChange={(value) =>
//                     handleChange("product_type", value)
//                   }
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

//             {/* Row 5: Image upload + preview + path */}
//             <div className="space-y-2">
//               <Label className="flex items-center gap-2">
//                 <ImageIcon className="w-4 h-4" />
//                 Product Image
//               </Label>

//               <div className="flex flex-col md:flex-row gap-4 md:items-center">
//                 {/* Upload Button */}
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

//                 {/* Preview */}
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

//               {/* backend path display (ယာယီ file name လောက်ပြထားမယ်) */}
//               <Input
//                 disabled
//                 value={form.product_image}
//                 placeholder="/uploads/products/xxx.png"
//                 className="bg-muted cursor-not-allowed"
//               />
//             </div>

//             {/* Row 6: Note */}
//             <div className="space-y-2">
//               <Label htmlFor="note">Note</Label>
//               <Textarea
//                 id="note"
//                 value={form.note}
//                 onChange={(e) => handleChange("note", e.target.value)}
//                 placeholder="စျေးနှုန်း ပြောင်းလဲလျှင် / လော့ထပ်စော်ရင် စာရိုက်ထားနိုင်ပါတယ်..."
//                 rows={3}
//               />
//             </div>
//           </CardContent>

//           <CardFooter className="flex justify-end gap-6 px-4 py-6">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => {
//                 setForm(initialForm);
//                 setImageFile(null);
//                 setImagePreview(null);
//               }}
//               disabled={loading}
//             >
//               Clear
//             </Button>
//             <Button type="submit" disabled={loading}>
//               {loading ? "Saving..." : "Save Product"}
//             </Button>
//           </CardFooter>
//         </form>
//       </Card>
//     </div>
//   );
// }




"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { Image as ImageIcon, UploadIcon } from "lucide-react";

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

export default function ProductCreatePage() {
  const [form, setForm] = useState<ProductFormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const router = useRouter();

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  function handleChange(field: keyof ProductFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // UI မှာ file name လောက် ပြပေးမယ် (DB ထဲမသွားဘူး)
    handleChange("product_image", file.name);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.sku || !form.product_name || !form.product_price) {
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

    if (Number.isNaN(product_price)) {
      toast.error("Price သည် number ဖြစ်ရပါမယ်");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("sku", form.sku);
      formData.append("product_name", form.product_name);
      formData.append("product_price", String(product_price));
      formData.append(
        "product_quantity_amount",
        String(product_quantity_amount),
      );

      if (form.barcode) formData.append("barcode", form.barcode);
      if (form.category) formData.append("category", form.category);
      if (form.product_type) formData.append("product_type", form.product_type);
      if (form.note) formData.append("note", form.note);
      formData.append("product_discount", String(product_discount));

      // ⭐ အရေးကြီး: image file ကို "image" field နာမည်နဲ့ပို့မယ်
      // backend: FileInterceptor('image', ...) နဲ့ကိုက်
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`${apiBase}/api/products`, {
        method: "POST",
        body: formData,
        // ❌ 'Content-Type' မသတ်မှတ်ပါနဲ့ (browser က tự動 multipart/form-data ထည့်ပေးမယ်)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg =
          typeof data?.message === "string"
            ? data.message
            : Array.isArray(data?.message)
            ? data.message.join("\n")
            : `Failed to create product (status ${res.status})`;
        toast.error(msg);
        return;
      }

      const created = await res.json().catch(() => null);
      console.log("Created product:", created);

      toast.success(
        `Product ထည့်သွင်းပြီးပါပြီ: ${
          created?.product_name ?? form.product_name
        }`,
      );

      setForm(initialForm);
      setImageFile(null);
      setImagePreview(null);

      // router.push("/products");
    } catch (err) {
      console.error(err);
      toast.error("Server error ဖြစ်နေတယ်");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full justify-center py-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>New Product</CardTitle>
          <CardDescription>
            စူပါမားကက် Product အသစ်တစ်ခုကို ထည့်သွင်းရန် form ဖြစ်သည်။
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Row 1: SKU + Name */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU / Code</Label>
                <Input
                  id="sku"
                  value={form.sku}
                  onChange={(e) => handleChange("sku", e.target.value)}
                  placeholder="SKU-1001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_name">Product Name</Label>
                <Input
                  id="product_name"
                  value={form.product_name}
                  onChange={(e) =>
                    handleChange("product_name", e.target.value)
                  }
                  placeholder="Coca Cola 500ml"
                  required
                />
              </div>
            </div>

            {/* Row 2: Price + Quantity */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product_price">Price (JPY/MMK ...)</Label>
                <Input
                  id="product_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.product_price}
                  onChange={(e) =>
                    handleChange("product_price", e.target.value)
                  }
                  placeholder="1200"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_quantity_amount">
                  Quantity / Stock
                </Label>
                <Input
                  id="product_quantity_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.product_quantity_amount}
                  onChange={(e) =>
                    handleChange(
                      "product_quantity_amount",
                      e.target.value,
                    )
                  }
                  placeholder="50"
                />
              </div>
            </div>

            {/* Row 3: Barcode + Discount */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={form.barcode}
                  onChange={(e) =>
                    handleChange("barcode", e.target.value)
                  }
                  placeholder="8852121212333"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_discount">
                  Discount (amount)
                </Label>
                <Input
                  id="product_discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.product_discount}
                  onChange={(e) =>
                    handleChange("product_discount", e.target.value)
                  }
                  placeholder="100"
                />
              </div>
            </div>

            {/* Row 4: Category + Type */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) =>
                    handleChange("category", e.target.value)
                  }
                  placeholder="Drink / Snack / etc."
                />
              </div>

              <div className="space-y-2">
                <Label>Product Type</Label>
                <Select
                  value={form.product_type}
                  onValueChange={(value) =>
                    handleChange("product_type", value)
                  }
                >
                  <SelectTrigger>
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

            {/* Row 5: Image upload + preview + filename display */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Product Image
              </Label>

              <div className="flex flex-col md:flex-row gap-4 md:items-center">
                {/* Upload Button */}
                <div>
                  <label
                    htmlFor="imageUpload"
                    className="flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer bg-muted hover:bg-accent"
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

                {/* Preview */}
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-md object-cover border"
                  />
                ) : (
                  <div className="w-24 h-24 flex items-center justify-center border rounded-md text-xs text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>

              {/* file name display only (DB path မဟုတ်) */}
              <Input
                disabled
                value={form.product_image}
                placeholder="Selected image filename"
                className="bg-muted cursor-not-allowed"
              />
            </div>

            {/* Row 6: Note */}
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={form.note}
                onChange={(e) => handleChange("note", e.target.value)}
                placeholder="စျေးနှုန်း ပြောင်းလဲလျှင် / လော့ထပ်စော်ရင် စာရိုက်ထားနိုင်ပါတယ်..."
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-6 px-4 py-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm(initialForm);
                setImageFile(null);
                setImagePreview(null);
              }}
              disabled={loading}
              className="cursor-pointer"
            >
              Clear
            </Button>
            <Button type="submit" disabled={loading} className="dark:text-foreground cursor-pointer">
              {loading ? "Saving..." : "Save Product"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
