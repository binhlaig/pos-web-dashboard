"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useZxing } from "react-zxing";
import { Barcode, Camera, Package, RefreshCw, Search, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { historyPage, type Production } from "@/lib/factory-production-api";
import { requestJson, decodeBalances, decodePlaces, type Balance, type Place } from "@/lib/factory-stock-api";
import { sheetRequest, type CostingSheet } from "@/lib/costing-api";

// This page only reads records. Production owns output creation and stock writes.
type Price = { value: number | null; discounted: number | null; currency: string; current: boolean };
type Product = {
  key: string; records: Production[]; sample: Production; produced: bigint;
  remaining: string | null; stockWarning: string; price: Price;
};
type Data = { products: Product[]; warehouses: Place[]; warnings: string[]; updatedAt: string };
const PAGE_SIZE = 10;
function identity(itemId: number, version: number, warehouse: number, location: number, batch: string) {
  return JSON.stringify([itemId, version, warehouse, location, batch.trim().toUpperCase()]);
}
function productionKey(p: Production) {
  return identity(p.costingItemId, p.sourceVersion, p.warehouseId, p.locationId, p.outputBatch);
}
function balanceKey(b: Balance) {
  return identity(b.itemId, b.sourceVersion, b.warehouseId, b.locationId, b.batch);
}
function whole(value: string | null): bigint {
  if (value === null || !/^\d+(?:\.0+)?$/.test(value)) throw new Error("ထုတ်လုပ်ပြီး အထုပ်အရေအတွက် ပုံစံမမှန်ပါ။");
  return BigInt(value.split(".")[0]);
}
function amount(value: string | bigint | null) {
  if (value === null) return "မရသေးပါ";
  return (typeof value === "bigint" ? value : whole(value)).toLocaleString("en-US");
}
function numeric(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}
function priceOf(p: Production, sheet?: CostingSheet): Price {
  const item = sheet?.status === "FINALIZED" ? sheet.items.find(i => i.id === p.costingItemId) : undefined;
  // Current finalized Costing prices take priority. Historical snapshots are labelled.
  const values = item?.calculation.ready ? item.calculation.values : p.snapshot.calculation?.values;
  return {
    value: numeric(values?.price), discounted: numeric(values?.discountedPrice),
    currency: item ? sheet!.currencyCode : p.currency, current: !!item && item.calculation.ready,
  };
}
function money(value: number | null, currency: string) {
  if (value === null) return "ဈေးမရသေးပါ";
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: currency === "MMK" ? 0 : 2 }).format(value)} ${currency === "MMK" ? "ကျပ်" : currency}`;
}
function packageSize(p: Production) {
  const s = p.snapshot;
  const unit = s.packageSizeUnit === "unit" && ["COUNT", "BOTTLED_DRINK", "PACKAGED_SNACK"].includes(s.productType)
    ? s.bulk?.baseUnit || s.packageSizeUnit : s.packageSizeUnit;
  return `${s.packageSize} ${unit}`;
}
function groupProducts(productions: Production[], balances: Balance[], sheets: Map<number, CostingSheet>, balanceAvailable: boolean): Product[] {
  const groups = new Map<string, Production[]>();
  const stock = new Map<string, Balance[]>();
  const ids = new Set<number>();
  for (const p of productions) {
    if (p.status !== "CONFIRMED" || ids.has(p.id)) continue;
    ids.add(p.id);
    const key = productionKey(p);
    groups.set(key, [...(groups.get(key) || []), p]);
  }
  for (const b of balances) stock.set(balanceKey(b), [...(stock.get(balanceKey(b)) || []), b]);
  return [...groups].map(([key, records]) => {
    records.sort((a, b) => b.productionDate.localeCompare(a.productionDate) || b.id - a.id);
    const sample = records[0];
    const rows = stock.get(key) || [];
    // Some older stock queries repeat the same balance for multiple Receiving rows.
    // Never sum duplicate balances or assume a missing balance means zero.
    const quantities = new Set(rows.map(r => whole(r.quantity).toString()));
    const remaining = quantities.size === 1 ? [...quantities][0] : null;
    const stockWarning = !balanceAvailable ? "Warehouse လက်ကျန် ရယူမရပါ။"
      : quantities.size > 1 ? "တူညီသော Batch အတွက် လက်ကျန်များ မကိုက်ပါ။"
      : !rows.length ? "Warehouse မှ ဤ Production Batch ၏ လက်ကျန် မရသေးပါ။" : "";
    return { key, records, sample, produced: records.reduce((n, p) => n + whole(p.actualOutputQuantity), BigInt(0)), remaining, stockWarning, price: priceOf(sample, sheets.get(sample.costingSheetId)) };
  }).sort((a, b) => b.sample.productionDate.localeCompare(a.sample.productionDate) || b.sample.id - a.sample.id);
}
async function readProductions(signal: AbortSignal) {
  const records: Production[] = [];
  for (let page = 0; ; page++) {
    if (signal.aborted) throw new Error("Cancelled");
    const result = await historyPage(page, "CONFIRMED");
    records.push(...result.content);
    if (page + 1 >= result.totalPages) return records;
    if (page >= 9999) throw new Error("Production စာရင်းအလွန်များနေပါသည်။ Server search လိုအပ်ပါသည်။");
  }
}
async function readBalances(signal: AbortSignal) {
  const result: Balance[] = [];
  for (let page = 0; ; page++) {
    const part = decodeBalances(await requestJson(`/api/factory/stock/balances?page=${page}&size=100`, { signal }));
    if (part.page !== page || part.size !== 100) throw new Error("Warehouse pagination မမှန်ပါ။");
    result.push(...part.content);
    if ((page + 1) * 100 >= part.totalElements) return result;
    if (!part.content.length || page >= 9999) throw new Error("Warehouse စာရင်းအပြည့် မရပါ။");
  }
}
async function load(signal: AbortSignal): Promise<Data> {
  const [productions, balances, places] = await Promise.allSettled([
    readProductions(signal), readBalances(signal),
    requestJson("/api/factory/receivings/warehouses", { signal }).then(decodePlaces),
  ]);
  if (productions.status === "rejected") throw productions.reason;
  const warnings: string[] = [];
  if (balances.status === "rejected") warnings.push("Warehouse လက်ကျန်ကို ရယူမရပါ။ ထုတ်လုပ်ပြီးပမာဏကိုသာ ပြထားပါသည်။");
  if (places.status === "rejected") warnings.push("ဂိုဒေါင်အမည် မရသေးသဖြင့် ID ဖြင့် ပြထားပါသည်။");
  const sheets = new Map<number, CostingSheet>();
  const ids = [...new Set(productions.value.map(p => p.costingSheetId))];
  let index = 0, priceFailures = 0;
  await Promise.all(Array.from({ length: Math.min(4, ids.length) }, async () => {
    while (index < ids.length) {
      const id = ids[index++];
      try { sheets.set(id, await sheetRequest(`/${id}`, { signal })); }
      catch { priceFailures++; }
    }
  }));
  if (priceFailures) warnings.push("အချို့လက်ရှိ Costing ဈေးနှုန်းများ မရသေးပါ။ Snapshot ဈေးရှိလျှင် သီးခြားအမှတ်အသားဖြင့် ပြထားပါသည်။");
  return {
    products: groupProducts(productions.value, balances.status === "fulfilled" ? balances.value : [], sheets, balances.status === "fulfilled"),
    warehouses: places.status === "fulfilled" ? places.value : [], warnings, updatedAt: new Date().toISOString(),
  };
}
function ProductImage({ p, large = false }: { p: Production; large?: boolean }) {
  const [failed, setFailed] = React.useState(false);
  const src = `/api/factory/costings/${p.costingSheetId}/items/${p.costingItemId}/images/PACKAGED?v=${p.sourceVersion}`;
  React.useEffect(() => setFailed(false), [src]);
  return <div className={`${large ? "aspect-square w-full max-w-56" : "size-16"} mx-auto flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted`}>
    {failed ? <Package className="size-8 text-muted-foreground" /> : <img src={src} alt={p.snapshot.productName} loading="lazy" className="size-full object-cover" onError={() => setFailed(true)} />}
  </div>;
}
function PackingCamera({ onScan, onClose }: { onScan: (value: string) => void; onClose: () => void }) {
  const locked = React.useRef(false);
  const [paused, setPaused] = React.useState(false);
  const [error, setError] = React.useState("");
  const { ref } = useZxing({
    paused, formats: ["code_128"], trySkew: true, timeBetweenDecodingAttempts: 250,
    constraints: { audio: false, video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } } },
    onDecodeResult(result) {
      const value = result.rawValue?.trim();
      if (!value || locked.current) return;
      locked.current = true; setPaused(true); onScan(value);
    },
    onError() { setError("Camera ဖွင့်မရပါ။ HTTPS နှင့် Camera permission ကို စစ်ပါ။ Barcode ကိုလည်း စာရိုက်ထည့်နိုင်ပါသည်။"); },
  });
  React.useEffect(() => {
    const hidden = () => { if (document.hidden) onClose(); };
    document.addEventListener("visibilitychange", hidden);
    return () => document.removeEventListener("visibilitychange", hidden);
  }, [onClose]);
  return <div className="space-y-3"><video ref={ref} autoPlay muted playsInline aria-label="Packing barcode camera" className="aspect-video w-full rounded-xl bg-black object-cover" />{error && <p role="alert" className="text-sm leading-7 text-destructive">{error}</p>}</div>;
}
export default function PackingPage() {
  const { data: session, status } = useSession();
  const scope = JSON.stringify([(session?.user as { shopId?: unknown } | undefined)?.shopId, session?.user?.id]);
  const [data, setData] = React.useState<Data | null>(null);
  const [busy, setBusy] = React.useState(false), [error, setError] = React.useState("");
  const [revision, setRevision] = React.useState(0);
  const [search, setSearch] = React.useState(""), [warehouse, setWarehouse] = React.useState(""), [batch, setBatch] = React.useState("");
  const [stockFilter, setStockFilter] = React.useState("all"), [page, setPage] = React.useState(0);
  const [selected, setSelected] = React.useState<string | null>(null), [camera, setCamera] = React.useState(false);
  const inFlight = React.useRef(false);
  const closeCamera = React.useCallback(() => setCamera(false), []);
  React.useEffect(() => {
    setData(null); setSelected(null); setSearch(""); setWarehouse(""); setBatch(""); setPage(0);
  }, [scope, status]);
  React.useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    const controller = new AbortController();
    inFlight.current = true; setBusy(true); setError("");
    void load(controller.signal).then(value => { if (active) setData(value); }).catch(e => {
      if (active) setError(e instanceof Error ? e.message : "စာရင်းရယူမရပါ။");
    }).finally(() => { if (active) { setBusy(false); inFlight.current = false; } });
    return () => { active = false; controller.abort(); inFlight.current = false; };
  }, [status, scope, revision]);
  React.useEffect(() => {
    if (status !== "authenticated") return;
    const refresh = () => { if (!document.hidden && !inFlight.current) setRevision(v => v + 1); };
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [status]);
  const products = data?.products || [];
  const filtered = products.filter(row => {
    const p = row.sample, needle = search.trim().toLowerCase();
    return (!needle || [p.snapshot.productName, p.barcode, p.outputBatch, ...row.records.map(r => r.productionNumber)].some(v => v.toLowerCase().includes(needle)))
      && (!warehouse || String(p.warehouseId) === warehouse)
      && (!batch.trim() || p.outputBatch.toLowerCase().includes(batch.trim().toLowerCase()))
      && (stockFilter === "all" || stockFilter === "available" && row.remaining !== null && whole(row.remaining) > BigInt(0) || stockFilter === "empty" && row.remaining !== null && whole(row.remaining) === BigInt(0));
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const detail = products.find(p => p.key === selected);
  const warehouseName = (id: number) => data?.warehouses.find(w => w.id === id)?.name || `ဂိုဒေါင် #${id}`;
  const changeSearch = (value: string) => { setSearch(value); setPage(0); };
  if (status === "loading") return <p role="status" className="p-6">အကောင့်စစ်ဆေးနေပါသည်…</p>;
  if (status === "unauthenticated") return <p role="alert" className="p-6">Packing စာရင်းကြည့်ရန် Login ဝင်ပါ။</p>;
  return <main className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-sm text-muted-foreground">Factory · Packing</p><h1 className="mt-1 text-2xl font-bold leading-relaxed">ထုတ်လုပ်ထုပ်ပိုးပြီး ပစ္စည်းများ</h1><p className="mt-1 text-sm leading-7 text-muted-foreground">Production အတည်ပြုပြီးစာရင်း၊ ရောင်းဈေးနှင့် ဂိုဒေါင်လက်ကျန်</p></div>
      <Button variant="outline" disabled={busy} onClick={() => setRevision(v => v + 1)}><RefreshCw className={`mr-2 size-4 ${busy ? "animate-spin" : ""}`} />ပြန်တင်ရန်</Button>
    </header>
    <div className="flex flex-wrap gap-2"><Badge variant="secondary">ပစ္စည်း / Batch {filtered.length}</Badge><Badge variant="secondary">ဤစာမျက်နှာ {visible.length}</Badge><Badge variant="outline">{busy ? "စာရင်းရယူနေသည်…" : data ? `နောက်ဆုံးစစ်ချိန် ${new Date(data.updatedAt).toLocaleTimeString("en-GB")}` : ""}</Badge></div>
    <div className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2 sm:col-span-2"><Label htmlFor="packing-search">အမည် / Barcode / Production နံပါတ်</Label><div className="flex gap-2"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input id="packing-search" value={search} onChange={e => changeSearch(e.target.value)} placeholder="ရှာဖွေရန်…" className="pl-9" /></div><Button variant="outline" onClick={() => setCamera(true)} aria-label="Tablet camera ဖြင့် Barcode scan ဖတ်ရန်"><Camera className="size-4" /></Button></div></div>
      <div className="space-y-2"><Label htmlFor="packing-warehouse">ဂိုဒေါင်</Label><select id="packing-warehouse" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={warehouse} onChange={e => { setWarehouse(e.target.value); setPage(0); }}><option value="">အားလုံး</option>{[...new Set(products.map(p => p.sample.warehouseId))].map(id => <option key={id} value={id}>{warehouseName(id)}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="packing-stock">လက်ကျန်</Label><select id="packing-stock" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={stockFilter} onChange={e => { setStockFilter(e.target.value); setPage(0); }}><option value="all">အားလုံး</option><option value="available">လက်ကျန်ရှိသော</option><option value="empty">လက်ကျန်မရှိသော</option></select></div>
      <div className="space-y-2"><Label htmlFor="packing-batch">Batch</Label><Input id="packing-batch" value={batch} onChange={e => { setBatch(e.target.value); setPage(0); }} placeholder="Batch နံပါတ်" /></div>
    </div>
    {error && <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm leading-7 text-destructive"><AlertCircle className="mr-2 inline size-4" />{error}{data && " ယခင်ရရှိထားသောစာရင်းကိုသာ ပြထားပါသည်။"}</div>}
    {data?.warnings.map(w => <p key={w} role="status" className="rounded-xl bg-amber-50 p-3 text-sm leading-7 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{w}</p>)}
    {!visible.length ? <div role="status" className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground"><Package className="mx-auto mb-3 size-9" />{busy ? "စာရင်းရယူနေပါသည်…" : data ? "ရွေးချယ်ထားသော စစ်ထုတ်မှုနှင့်ကိုက်ညီသည့် အတည်ပြုပြီးပစ္စည်း မတွေ့ပါ။" : "စာရင်းမရသေးပါ။ ပြန်တင်ရန် နှိပ်ပါ။"}</div> : <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">{visible.map(row => {
      const p = row.sample;
      return <Card key={row.key} className="gap-0 overflow-hidden p-0"><button type="button" onClick={() => setSelected(row.key)} className="h-full w-full rounded-xl p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`${p.snapshot.productName} ${p.outputBatch} အသေးစိတ်ကြည့်ရန်`}>
        <ProductImage p={p} /><h2 className="mt-3 line-clamp-2 min-h-12 text-sm font-semibold leading-6">{p.snapshot.productName}</h2><p className="mt-1 text-xs text-muted-foreground">တစ်{p.saleUnit} · {packageSize(p)}</p>
        <p className="mt-3 text-base font-bold leading-7 text-blue-700 dark:text-blue-300">{money(row.price.value, row.price.currency)}</p><p className="text-[11px] text-muted-foreground">{row.price.current ? "လက်ရှိ Costing ရောင်းဈေး" : "Production snapshot ဈေး"}</p>
        <div className="mt-3 border-t pt-3"><p className="text-xs text-muted-foreground">လက်ရှိလက်ကျန်</p><p className={`mt-1 text-lg font-bold ${row.remaining === null ? "text-amber-700 dark:text-amber-300" : whole(row.remaining) === BigInt(0) ? "text-muted-foreground" : "text-emerald-700 dark:text-emerald-300"}`}>{amount(row.remaining)} {row.remaining === null ? "" : p.saleUnit}</p></div><p className="mt-2 truncate text-xs text-muted-foreground">Batch · {p.outputBatch}</p>
      </button></Card>;
    })}</div>}
    <div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">စာမျက်နှာ {currentPage + 1} / {totalPages}</p><div className="flex gap-2"><Button variant="outline" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} aria-label="ယခင်စာမျက်နှာ"><ChevronLeft className="size-4" /></Button><Button variant="outline" disabled={currentPage + 1 >= totalPages} onClick={() => setPage(currentPage + 1)} aria-label="နောက်စာမျက်နှာ"><ChevronRight className="size-4" /></Button></div></div>
    <Dialog open={!!detail} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-4xl"><DialogHeader><DialogTitle className="leading-8">{detail?.sample.snapshot.productName}</DialogTitle><DialogDescription>ထုတ်လုပ်ထုပ်ပိုးပြီး ပစ္စည်းအသေးစိတ်</DialogDescription></DialogHeader>{detail && <div className="grid gap-5 md:grid-cols-[220px_1fr]">
      <div className="space-y-3"><ProductImage p={detail.sample} large /><Badge variant="secondary">Production အတည်ပြုပြီး</Badge><p className="break-all text-sm"><Barcode className="mr-2 inline size-4" />{detail.sample.barcode}</p></div>
      <div className="space-y-4"><div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/40"><p className="text-sm">တစ်{detail.sample.saleUnit} ရောင်းဈေး</p><p className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-300">{money(detail.price.value, detail.price.currency)}</p><p className="mt-1 text-xs text-muted-foreground">{detail.price.current ? "လက်ရှိ FINALIZED Costing မှ" : "ထုတ်လုပ်ချိန် snapshot မှ — လက်ရှိရောင်းဈေးဖြစ်ကြောင်း မအတည်ပြုနိုင်ပါ"}</p>{detail.price.discounted !== null && detail.price.value !== null && detail.price.discounted < detail.price.value && <p className="mt-2 text-sm">လျှော့ဈေးပြီး · {money(detail.price.discounted, detail.price.currency)}</p>}</div>
      <dl className="grid grid-cols-2 gap-3 text-sm">{[
        ["တစ်ထုပ်ပါပမာဏ", packageSize(detail.sample)], ["ထုတ်လုပ်ပြီးစုစုပေါင်း", `${amount(detail.produced)} ${detail.sample.saleUnit}`],
        ["လက်ရှိ Batch လက်ကျန်", `${amount(detail.remaining)} ${detail.remaining === null ? "" : detail.sample.saleUnit}`], ["Batch", detail.sample.outputBatch],
        ["ဂိုဒေါင်", warehouseName(detail.sample.warehouseId)], ["သိုလှောင်နေရာ", `#${detail.sample.locationId}`],
      ].map(([label, value]) => <div key={label} className="rounded-xl border p-3"><dt className="text-xs leading-6 text-muted-foreground">{label}</dt><dd className="mt-1 break-words font-semibold leading-7">{value}</dd></div>)}</dl>
      {detail.stockWarning && <p role="status" className="text-sm leading-7 text-amber-700 dark:text-amber-300">{detail.stockWarning}</p>}
      {detail.records.length > 1 && <p className="text-xs leading-6 text-muted-foreground">တူညီသော ပစ္စည်း၊ Costing version၊ Batch နှင့် ဂိုဒေါင်နေရာရှိ Production များကို စုစည်းပြထားပါသည်။ လက်ကျန်သည် Batch တစ်ခုလုံး၏ လက်ကျန်ဖြစ်ပါသည်။</p>}
      <h3 className="font-semibold">သက်ဆိုင်ရာ Production မှတ်တမ်းများ</h3><div className="max-h-52 space-y-2 overflow-y-auto">{detail.records.map(p => <Card key={p.id} className="gap-0 p-0"><CardContent className="space-y-1 p-3 text-sm"><p className="font-semibold">{p.productionNumber}</p><p className="leading-7 text-muted-foreground">{p.productionDate} · {amount(whole(p.actualOutputQuantity))} {p.saleUnit} · {p.responsibleName || "တာဝန်ခံမရှိ"}</p>{p.note && <p className="whitespace-pre-wrap break-words leading-7">{p.note}</p>}</CardContent></Card>)}</div></div>
    </div>}</DialogContent></Dialog>
    <Dialog open={camera} onOpenChange={setCamera}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>Barcode Scan</DialogTitle><DialogDescription>ပစ္စည်း Barcode ကို Camera ရှေ့တွင် ထားပါ။</DialogDescription></DialogHeader>{camera && <PackingCamera onClose={closeCamera} onScan={value => { changeSearch(value); setWarehouse(""); setBatch(""); setStockFilter("all"); closeCamera(); }} />}</DialogContent></Dialog>
  </main>;
}
