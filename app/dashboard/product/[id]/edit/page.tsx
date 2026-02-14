"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { ArrowLeft, Save, RefreshCw, ImageIcon, Package } from "lucide-react";
import toast from "react-hot-toast";

type Product = {
  id: string;
  sku: string;
  product_name: string;
  product_price: number;
  barcode?: string | null;
  category?: string | null;
  product_quantity_amount: number;

  // ✅ image fields (backend may return any of these)
  product_image?: string | null;
  imagePath?: string | null;
  image_path?: string | null;
  productImage?: string | null;

  product_discount?: number | null;
  note?: string | null;
  product_type?: string | null;
};

function pickImagePath(p: any): string | null {
  return (
    p?.imagePath ??
    p?.image_path ??
    p?.product_image ??
    p?.productImage ??
    null
  );
}

function buildImageUrl(path?: string | null) {
  if (!path) return null;
  const raw = String(path).trim();
  if (!raw) return null;

  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

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

export default function ProductEditPage() {
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

    const tId = toast.loading("Loading product...");

    try {
      setLoading(true);

      const res = await fetch(`/backend/api/products/${id}`, {
        method: "GET",
        headers: { ...authHeaders() },
        cache: "no-store",
      });

      if (!res.ok) {
        const detail = await readErrorText(res);

        if (res.status === 401) {
          toast.error("Unauthorized — Login ပြန်လုပ်ပါ", { id: tId });
          signIn();
        } else if (res.status === 403) {
          toast.error("Forbidden — ADMIN လိုနိုင်တယ်", { id: tId });
        } else if (res.status === 404) {
          toast.error("Product မတွေ့ပါ (404)", { id: tId });
        } else {
          toast.error(detail || `Product load မရပါ (status ${res.status})`, { id: tId });
        }

        setProduct(null);
        return;
      }

      const data = (await res.json()) as Product;
      setProduct(data);

      setSku(data.sku ?? "");
      setName(data.product_name ?? "");
      setPrice(Number(data.product_price ?? 0));
      setBarcode(data.barcode ?? "");
      setCategory(data.category ?? "");
      setType(data.product_type ?? "");
      setQty(Number(data.product_quantity_amount ?? 0));
      setDiscount(Number(data.product_discount ?? 0));
      setNote(data.note ?? "");

      // ✅ FIX: pick image path from multiple possible fields
      const imgPath = pickImagePath(data);
      setImagePreview(buildImageUrl(imgPath));

      setImageFile(null);

      toast.success("Loaded ✅", { id: tId });
    } catch (e) {
      console.error(e);
      toast.error("Server error ဖြစ်နေတယ်", { id: tId });
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    if (status !== "authenticated") return;
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, status, token]);

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

    if (status === "loading") return;
    if (!token) {
      toast.error("Session token မရပါ — Login ပြန်လုပ်ပါ");
      signIn();
      return;
    }

    if (!sku.trim()) return toast.error("SKU မဖြစ်မနေလိုပါတယ်");
    if (!name.trim()) return toast.error("Product name မဖြစ်မနေလိုပါတယ်");
    if (!Number.isFinite(price) || price < 0) return toast.error("Price မှန်မှန်ထည့်ပါ");
    if (!Number.isInteger(qty) || qty < 0) return toast.error("Stock (quantity) ကို 0 သို့ အပေါင်းကိန်း ထည့်ပါ");

    const tId = toast.loading("Saving...");

    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("sku", sku.trim());
      fd.append("product_name", name.trim());
      fd.append("product_price", String(price));
      fd.append("product_quantity_amount", String(qty));

      fd.append("barcode", barcode.trim());
      fd.append("category", category.trim());
      fd.append("product_type", type.trim());
      fd.append("note", note.trim());
      fd.append("product_discount", String(Number.isFinite(discount) ? discount : 0));

      if (imageFile) fd.append("image", imageFile);

      const res = await fetch(`/backend/api/products/${product.id}`, {
        method: "PUT",
        headers: { ...authHeaders() },
        body: fd,
      });

      if (!res.ok) {
        const detail = await readErrorText(res);

        if (res.status === 401) {
          toast.error("Unauthorized — Login ပြန်လုပ်ပါ", { id: tId });
          signIn();
        } else if (res.status === 403) {
          toast.error("Forbidden — ADMIN လိုနိုင်တယ်", { id: tId });
        } else if (res.status === 404) {
          toast.error("Product မတွေ့ပါ (404)", { id: tId });
        } else {
          toast.error(detail || `Update failed (status ${res.status})`, { id: tId });
        }
        return;
      }

      toast.success("Product update ပြီးပါပြီ ✅", { id: tId });
      router.push(`/products/${product.id}`);
    } catch (e) {
      console.error(e);
      toast.error("Server error (update)", { id: tId });
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return <div className="flex justify-center py-10 text-muted-foreground">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div className="flex justify-center py-10 text-muted-foreground">Redirecting to Sign in...</div>;
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
            <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-2" disabled={saving}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Button variant="outline" size="sm" onClick={loadProduct} className="gap-2" disabled={saving}>
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
          <div className="space-y-3">
            <div className="rounded-xl border bg-muted flex items-center justify-center min-h-[260px] overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="max-h-[320px] object-contain" />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-sm">No Image</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Change image (optional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
              <p className="text-xs text-muted-foreground">
                Backend မှာ field name က <code>image</code> ဖြစ်ရမယ်။
              </p>
            </div>
          </div>

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
                <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
              </div>

              <div className="grid gap-2">
                <Label>Stock</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
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
                <Input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
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
