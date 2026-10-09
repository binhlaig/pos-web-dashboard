"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useCurrency } from "@/components/currency-provider";
import { useZxing } from "react-zxing";
import { AlertCircle, Barcode, Boxes, Camera, CheckCircle2, ChevronLeft, ChevronRight, Layers, Loader2, Package, PackageSearch, RotateCcw, Search, Tag, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type Product = { id: string; name: string; sku: string; barcode: string; price: number; stock: number; image: string; category: string; type: string; discount: number; cost?: number; active: boolean; note: string };
type Money = (amount?: number | null) => string;
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "");
const PAGE_SIZE = 6;
const panel = "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-950";
const text = (v: unknown) => String(v ?? "").trim();
const numeric = (v: unknown) => Number.isFinite(Number(v)) ? Number(v) : 0;
const barcodeKey = (v: unknown) => text(v).replace(/\s+/g, "").toLowerCase();
function productsFrom(data: unknown): Product[] {
  if (!data || typeof data !== "object") return [];
  const root = data as Record<string, unknown>;
  let rows: unknown = Array.isArray(data) ? data : [root.content, root.products, root.data, root.items].find(Array.isArray);
  if (!rows && root.data && typeof root.data === "object") return productsFrom(root.data);
  if (!rows && root.id != null) rows = [root];
  if (!Array.isArray(rows)) return [];
  return rows.filter(r => r && typeof r === "object").map(r => {
    const v = r as Record<string, unknown>;
    return { id: text(v.id ?? v.dbId ?? v.productId), name: text(v.productName ?? v.product_name ?? v.name) || "Unnamed product", sku: text(v.sku), barcode: text(v.barcode), price: numeric(v.productPrice ?? v.product_price ?? v.price), stock: numeric(v.productQuantityAmount ?? v.product_quantity_amount), image: text(v.imagePath ?? v.image_path ?? v.imageUrl ?? v.productImage ?? v.product_image), category: text(v.category), type: text(v.productType ?? v.product_type), discount: numeric(v.productDiscount ?? v.product_discount), cost: v.cost == null ? undefined : numeric(v.cost), active: v.isActive !== false && v.active !== false, note: text(v.note) };
  });
}
function imageCandidates(raw: string) {
  const path = raw.replace(/\\/g, "/");
  if (!path) return [];
  if (/^(https?:|data:|blob:)/i.test(path)) return [path];
  const uploads = path.toLowerCase().lastIndexOf("/uploads/");
  if (uploads >= 0) return [`${API_BASE}${path.slice(uploads)}`];
  const relative = path.replace(/^\/+/, "");
  return relative.startsWith("uploads/") ? [`${API_BASE}/${relative}`] : [`${API_BASE}/${relative}`, `${API_BASE}/uploads/${relative}`];
}
function ProductImage({ product, className = "" }: { product: Product; className?: string }) {
  const candidates = useMemo(() => imageCandidates(product.image), [product.image]);
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [product.image]);
  return <div className={`overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 ${className}`}>{candidates[index] ? <img src={candidates[index]} alt={product.name} loading="lazy" onError={() => setIndex(i => i + 1)} className="size-full object-cover" /> : <div className="flex size-full items-center justify-center text-slate-400 dark:text-slate-600"><Package className="size-8" strokeWidth={1.5} /></div>}</div>;
}
function StockBadge({ product }: { product: Product }) {
  const cls = !product.active ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" : product.stock <= 0 ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" : product.stock < 5 ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}><span className="size-1.5 rounded-full bg-current" />{!product.active ? "Inactive" : product.stock <= 0 ? "Out of stock" : product.stock < 5 ? "Low stock" : "In stock"}</span>;
}
function ProductResult({ product, formatMoney }: { product: Product; formatMoney: Money }) {
  const fields = [
    { title: "Price", value: formatMoney(product.price), icon: Wallet, color: "text-blue-600 dark:text-blue-300" },
    { title: "Remaining stock", value: product.stock.toLocaleString(), icon: Boxes, color: product.stock <= 0 ? "text-rose-600 dark:text-rose-300" : "text-emerald-600 dark:text-emerald-300" },
    { title: "Category", value: product.category || "—", icon: Tag, color: "text-violet-600 dark:text-violet-300" },
    { title: "Product type", value: product.type || "—", icon: Layers, color: "text-slate-600 dark:text-slate-300" },
    { title: "Discount", value: product.discount ? formatMoney(product.discount) : "—", icon: Tag, color: "text-amber-600 dark:text-amber-300" },
    { title: "Cost", value: product.cost == null ? "—" : formatMoney(product.cost), icon: Wallet, color: "text-slate-600 dark:text-slate-300" },
  ];
  return <section aria-label="Product result" className="space-y-4">
    <div className={`${panel} flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6`}>
      <ProductImage product={product} className="h-36 w-full shrink-0 sm:size-[120px]" />
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-300"><CheckCircle2 className="size-3.5" />Product found</span><StockBadge product={product} /></div>
        <h2 className="break-words text-xl font-semibold tracking-tight sm:text-2xl">{product.name}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">SKU · {product.sku || "—"}</p>
        <div className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-white/5"><Barcode className="size-4 shrink-0 text-slate-400" /><span className="break-all font-mono">{product.barcode || "No barcode"}</span></div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">{fields.map(({ title, value, icon: Icon, color }) => <div key={title} className={`${panel} min-w-0 p-4 sm:p-5`}><div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><span className={`grid size-8 shrink-0 place-items-center rounded-xl bg-slate-50 dark:bg-white/5 ${color}`}><Icon className="size-4" strokeWidth={1.75} /></span>{title}</div><p className={`mt-3 break-words text-lg font-semibold tabular-nums ${title === "Price" || title === "Remaining stock" ? color : ""}`}>{value}</p></div>)}</div>
    {product.note && <div className={`${panel} p-5`}><p className="text-xs font-medium text-slate-500 dark:text-slate-400">Product note</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{product.note}</p></div>}
  </section>;
}
function CameraScanner({ onScan }: { onScan: (value: string) => void }) {
  const locked = useRef(false);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState("");
  const { ref } = useZxing({ paused, formats: ["retail_codes", "code_128", "qr_code"], trySkew: true, timeBetweenDecodingAttempts: 200, constraints: { audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } } }, onDecodeResult(result) { const value = result.rawValue?.trim(); if (!value || locked.current) return; locked.current = true; setPaused(true); onScan(value); }, onError() { setError("Camera permission ကို Allow လုပ်ပါ။ မရလျှင် barcode ကို စာရိုက်ထည့်ပြီး ရှာနိုင်ပါတယ်။"); } });
  return <><div className="relative aspect-video overflow-hidden rounded-2xl bg-black"><video ref={ref} autoPlay muted playsInline className="size-full object-cover" /><div className="pointer-events-none absolute inset-x-[8%] top-1/2 h-[40%] -translate-y-1/2 rounded-xl border-2 border-emerald-400 shadow-[0_0_0_999px_rgba(0,0,0,0.35)]" /></div>{error && <p role="alert" className="text-sm text-rose-600 dark:text-rose-300">{error}</p>}</>;
}

export default function ProductCheckPage() {
  const currency = useCurrency() as { formatMoney?: Money; formatSharedMoney?: Money };
  const formatMoney: Money = currency.formatSharedMoney ?? currency.formatMoney ?? (n => Number(n ?? 0).toLocaleString());
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [missingQuery, setMissingQuery] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [page, setPage] = useState(1);
  const input = useRef<HTMLInputElement>(null);
  const controller = useRef<AbortController | null>(null);
  const revision = useRef(0);
  useEffect(() => () => { revision.current += 1; controller.current?.abort(); }, []);
  async function search(value = query, camera = false) {
    const needle = value.trim();
    if (!needle) { setError("Barcode၊ SKU သို့မဟုတ် product အမည် ထည့်ပါ။"); input.current?.focus(); return; }
    controller.current?.abort();
    const abort = new AbortController(); controller.current = abort;
    const request = ++revision.current;
    setLoading(true); setError(""); setSelected(null); setProducts([]); setPage(1); setNotFound(false);
    try {
      const token = ["pos_shop_owner_token", "pos_access_token", "access_token", "token", "jwt"].map(k => localStorage.getItem(k)?.trim()).find(Boolean);
      if (!token) throw new Error("Login token မတွေ့ပါ။ Sign in ပြန်ဝင်ပါ။");
      const headers = { Accept: "application/json", Authorization: /^Bearer\s/i.test(token) ? token : `Bearer ${token}` };
      async function fetchProducts(q?: string) {
        const response = await fetch(`${API_BASE}/api/products${q ? `?q=${encodeURIComponent(q)}` : ""}`, { headers, cache: "no-store", signal: abort.signal });
        if (!response.ok) { const body = await response.json().catch(() => null); throw new Error(response.status === 401 ? "Login session သက်တမ်းကုန်သွားပါပြီ။ Sign in ပြန်ဝင်ပါ။" : response.status === 403 ? "Products ကြည့်ခွင့်မရှိပါ။" : body?.message || `Products API error (${response.status})`); }
        return productsFrom(await response.json());
      }
      let list = await fetchProducts(needle);
      const key = barcodeKey(needle);
      let exact = list.find(p => p.barcode && barcodeKey(p.barcode) === key);
      if (!exact && (!list.length || camera || /^\d{6,}$/.test(key))) {
        const all = await fetchProducts();
        exact = all.find(p => p.barcode && barcodeKey(p.barcode) === key);
        if (!exact) list = all.filter(p => p.name.toLowerCase().includes(needle.toLowerCase()) || p.sku.toLowerCase().includes(needle.toLowerCase()));
      }
      if (exact) list = [exact];
      if (camera && !exact) list = [];
      if (request !== revision.current) return;
      setProducts(list); setSelected(exact ?? (list.length === 1 ? list[0] : null));
      if (!list.length) { setMissingQuery(needle); setNotFound(true); }
    } catch (reason) {
      if (!abort.signal.aborted && request === revision.current) setError(reason instanceof Error ? reason.message : "Products API ချိတ်ဆက်၍မရပါ။");
    } finally { if (request === revision.current) { setLoading(false); setSearched(true); } }
  }
  function reset() { revision.current += 1; controller.current?.abort(); setQuery(""); setProducts([]); setSelected(null); setError(""); setSearched(false); setLoading(false); setNotFound(false); setPage(1); input.current?.focus(); }
  function submit(e: FormEvent) { e.preventDefault(); void search(); }
  const pages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const visible = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return <main className="min-h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <div className="mx-auto max-w-[1120px] space-y-5 px-4 py-5 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"><PackageSearch className="size-5" strokeWidth={1.75} /></span><div><h1 className="text-xl font-semibold tracking-tight">Product Check</h1><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Barcode၊ SKU သို့မဟုတ် အမည်ဖြင့် ဈေးနှုန်းနဲ့ stock စစ်ပါ။</p></div></div><Button type="button" variant="outline" size="sm" onClick={reset}><RotateCcw className="mr-1.5 size-3.5" />Reset</Button></header>
      <section className={`${panel} p-4 sm:p-5`} aria-label="Search product"><form onSubmit={submit} className="flex flex-wrap gap-2"><div className="relative min-w-[160px] flex-1"><Barcode className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input ref={input} value={query} onChange={e => setQuery(e.target.value)} aria-label="Barcode, SKU or product name" placeholder="Scan barcode / SKU / Product name" autoComplete="off" className="h-11 rounded-xl bg-white pl-10 text-base dark:bg-slate-900" /></div><Button type="button" variant="outline" onClick={() => setCameraOpen(true)} disabled={loading} className="size-11 shrink-0 rounded-xl p-0" aria-label="Scan with camera"><Camera className="size-4" /></Button><Button type="submit" disabled={loading} className="h-11 rounded-xl px-5">{loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Search className="mr-2 size-4" />}Search</Button></form><p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Scanner သုံးလျှင် barcode ဖတ်ပြီး Enter နှိပ်ပါ။ Camera scan က အလိုအလျောက် ရှာပေးပါတယ်။</p></section>
      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"><AlertCircle className="mt-0.5 size-4 shrink-0" />{error}</div>}
      {loading ? <div role="status" className={`${panel} flex min-h-60 items-center justify-center gap-2 text-sm text-slate-500`}><Loader2 className="size-5 animate-spin" />Searching products…</div> : selected ? <ProductResult product={selected} formatMoney={formatMoney} /> : !products.length && <div className={`${panel} flex min-h-60 flex-col items-center justify-center gap-3 p-6 text-center`}><span className="grid size-14 place-items-center rounded-2xl bg-slate-50 text-slate-400 dark:bg-white/5"><PackageSearch className="size-7" strokeWidth={1.5} /></span><p className="font-medium">{error ? "ရှာဖွေမှု မအောင်မြင်ပါ" : searched ? "Product မတွေ့ပါ" : "Product ကို စစ်ရန် ရှာဖွေပါ"}</p><p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">Barcode၊ SKU သို့မဟုတ် အမည် ရိုက်ထည့်နိုင်ပါတယ်။</p></div>}
      {!loading && products.length > 1 && <section aria-label="Search results" className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Search results</h2><span className="text-xs text-slate-500">{products.length} products</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{visible.map((p, i) => <button key={`${p.id}-${p.barcode}-${i}`} type="button" onClick={() => setSelected(p)} className={`${panel} flex min-w-0 items-start gap-3 p-4 text-left transition-colors hover:border-blue-300 focus-visible:outline-2 focus-visible:outline-blue-500 ${selected === p ? "border-blue-400 dark:border-blue-400" : ""}`}><ProductImage product={p} className="size-14 shrink-0" /><span className="min-w-0 flex-1"><span className="line-clamp-2 block text-sm font-semibold">{p.name}</span><span className="mt-1 block truncate text-xs text-slate-500">{p.sku || p.barcode || "—"}</span><span className="mt-2 block text-sm font-medium">{formatMoney(p.price)}</span><span className="mt-2 block"><StockBadge product={p} /></span></span></button>)}</div>{pages > 1 && <div className="flex items-center justify-between"><Button type="button" size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="mr-1 size-4" />Back</Button><span className="text-xs text-slate-500">{page} / {pages}</span><Button type="button" size="sm" variant="outline" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next<ChevronRight className="ml-1 size-4" /></Button></div>}</section>}
    </div>
    <Dialog open={cameraOpen} onOpenChange={setCameraOpen}><DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-2xl"><DialogHeader><DialogTitle>Scan product barcode</DialogTitle><DialogDescription>Barcode ကို camera ဘောင်အတွင်း ထားပါ။</DialogDescription></DialogHeader>{cameraOpen && <CameraScanner onScan={value => { setCameraOpen(false); setQuery(value); void search(value, true); }} />}</DialogContent></Dialog>
    <AlertDialog open={notFound} onOpenChange={setNotFound}><AlertDialogContent className="z-[80] rounded-2xl border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"><AlertDialogHeader><span className="mb-2 grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"><PackageSearch className="size-6" /></span><AlertDialogTitle>Product မတွေ့ပါ</AlertDialogTitle><AlertDialogDescription className="break-words text-slate-500 dark:text-slate-400">“{missingQuery}” နဲ့ ကိုက်ညီသော product ကို ဒီ shop မှာ မတွေ့ပါ။ Barcode သို့မဟုတ် SKU ကို စစ်ပြီး ပြန်ရှာပါ။</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogAction onClick={() => setNotFound(false)} className="rounded-xl">ပြန်ရှာမည်</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </main>;
}
