
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  ArrowLeft,
  Save,
  RefreshCw,
  ImageIcon,
  Package,
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

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [product, setProduct] = useState<Product | null>(null);

  // form fields
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [barcode, setBarcode] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [qty, setQty] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [note, setNote] = useState("");

  // image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  async function loadProduct() {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/products/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        toast.error("Product load မရပါ");
        return;
      }
      const data = (await res.json()) as Product;
      setProduct(data);

      // init form
      setSku(data.sku ?? "");
      setName(data.product_name ?? "");
      setPrice(Number(data.product_price ?? 0));
      setBarcode(data.barcode ?? "");
      setCategory(data.category ?? "");
      setType(data.product_type ?? "");
      setQty(Number(data.product_quantity_amount ?? 0));
      setDiscount(Number(data.product_discount ?? 0));
      setNote(data.note ?? "");

      // preview current image
      const url =
        data.product_image && data.product_image.startsWith("http")
          ? data.product_image
          : data.product_image
          ? `${apiBase}${data.product_image}`
          : null;

      setImagePreview(url);
      setImageFile(null);
    } catch (e) {
      console.error(e);
      toast.error("Server error ဖြစ်နေတယ်");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // live preview when user chooses a file
  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const stockStatus = useMemo(() => {
    if (qty <= 0) return { label: "Out", cls: "bg-red-500/10 text-red-700 border-red-500/20" };
    if (qty < 5) return { label: "Low", cls: "bg-amber-500/10 text-amber-800 border-amber-500/20" };
    return { label: "In", cls: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" };
  }, [qty]);

  async function onSave() {
    if (!product) return;

    if (!sku.trim()) return toast.error("SKU မဖြစ်မနေလိုပါတယ်");
    if (!name.trim()) return toast.error("Product name မဖြစ်မနေလိုပါတယ်");
    if (!Number.isFinite(price) || price < 0) return toast.error("Price မှန်မှန်ထည့်ပါ");
    if (!Number.isInteger(qty) || qty < 0) return toast.error("Stock (quantity) ကို 0 သို့ အပေါင်းကိန်း ထည့်ပါ");

    try {
      setSaving(true);

      // ✅ MUST be FormData because backend uses FileInterceptor('image')
      const fd = new FormData();
      fd.append("sku", sku.trim());
      fd.append("product_name", name.trim());
      fd.append("product_price", String(price));
      fd.append("product_quantity_amount", String(qty));

      // optional fields (only append if you want to update)
      if (barcode.trim()) fd.append("barcode", barcode.trim());
      if (category.trim()) fd.append("category", category.trim());
      if (type.trim()) fd.append("product_type", type.trim());
      if (note.trim()) fd.append("note", note.trim());

      if (Number.isFinite(discount) && discount > 0) {
        fd.append("product_discount", String(discount));
      } else {
        // if you want to clear discount -> send 0
        fd.append("product_discount", "0");
      }

      // image file (optional)
      if (imageFile) {
        fd.append("image", imageFile); // ✅ field name MUST be "image"
      }

      const res = await fetch(`${apiBase}/api/products/${product.id}`, {
        method: "PATCH",
        body: fd,
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.message || `Update failed (status ${res.status})`);
        return;
      }

      toast.success("Product update ပြီးပါပြီ ✅");

      // ✅ go back to view page (it will reload product data)
      router.push(`/products/${product.id}`);
    } catch (e) {
      console.error(e);
      toast.error("Server error (update)");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10 text-muted-foreground">
        Loading...
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
      <Card className="w-full max-w-4xl overflow-hidden">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1 min-w-0">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Edit Product
            </CardTitle>
            <CardDescription>
              Product ကိုပြင်ဆင်ပြီး Save လုပ်ပါ (image upload အပါအဝင်)
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
              disabled={saving}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={loadProduct}
              className="gap-2"
              disabled={saving}
            >
              <RefreshCw className={saving ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
              Reload
            </Button>

            <Button size="sm" onClick={onSave} className="gap-2" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          {/* Image panel */}
          <div className="space-y-3">
            <div className="rounded-xl border bg-muted flex items-center justify-center min-h-[260px] overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="max-h-[320px] object-contain"
                />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-sm">No Image</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Change image (optional)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-muted-foreground">
                Backend မှာ field name က <code>image</code> ဖြစ်ရမယ်။
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="grid gap-2">
                <Label>SKU</Label>
                <Input value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>

              <div className="grid gap-2">
                <Label>Stock</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                  />
                  <Badge className={stockStatus.cls}>{stockStatus.label}</Badge>
                </div>
              </div>

              <Separator />

              <div className="grid gap-2">
                <Label>Barcode (optional)</Label>
                <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label>Category (optional)</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label>Type (optional)</Label>
                <Input value={type} onChange={(e) => setType(e.target.value)} />
              </div>

              <div className="grid gap-2">
                <Label>Discount (optional)</Label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>

              <div className="grid gap-2">
                <Label>Note (optional)</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
