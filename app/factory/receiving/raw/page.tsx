"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  AlertCircle, ArrowLeft, CheckCircle2, ClipboardList, Loader2,
  PackagePlus, Plus, RefreshCw, Save, Search, Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

/**
 * Binhlaig Factory — Raw Receiving (one-file frontend page)
 * Target route: app/factory/receiving/raw/page.tsx
 *
 * API ADAPTER: Verify these routes/field names against your Codex-generated
 * backend. The public GitHub main branch inspected 2026-10-22 did not yet
 * contain the rawmaterial package, so this page cannot claim a verified DTO.
 *
 * Existing finished-goods Receiving and POS are untouched.
 */
const API = {
  materials: "/api/factory/raw-materials",
  receipts: "/api/factory/raw-receivings",
  warehouses: "/api/factory/receivings/warehouses",
  locations: (id: number) => `/api/factory/receivings/warehouses/${id}/locations`,
};

type Unit = "KG" | "L" | "PCS";
type ReceiptStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";
type Material = { id: number; name: string; sku: string; baseUnit: Unit; active: boolean };
type Place = { id: number; name: string; active: boolean };
type Receipt = {
  id: number; receivingNumber: string; status: ReceiptStatus; version: number;
  materialId: number; materialName?: string; baseUnit?: Unit;
  supplierName?: string; expectedQuantity: number; actualQuantity: number;
  warehouseId: number; locationId: number; warehouseName?: string;
  locationName?: string; batch: string; receivedDate: string;
  createdAt?: string;
};
type Page<T> = { content: T[]; number: number; totalPages: number; totalElements?: number };
type FormValues = {
  materialId: string; supplierName: string; supplierReference: string;
  packageCount: string; quantityPerPackage: string; expectedQuantity: string;
  actualQuantity: string; varianceReason: string; purchaseCost: string;
  currency: "MMK" | "JPY"; batch: string; warehouseId: string;
  locationId: string; receivedDate: string; expiryDate: string; note: string;
};
const format = (n: number, digits = 3) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(n);
const isoDate = () => new Date().toLocaleDateString("en-CA");
const emptyForm = (): FormValues => ({
  materialId: "", supplierName: "", supplierReference: "", packageCount: "",
  quantityPerPackage: "", expectedQuantity: "", actualQuantity: "",
  varianceReason: "", purchaseCost: "", currency: "MMK", batch: "",
  warehouseId: "", locationId: "", receivedDate: isoDate(), expiryDate: "", note: "",
});
const asList = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && Array.isArray((value as { content?: unknown }).content))
    return (value as { content: T[] }).content;
  throw new Error("API list response format မကိုက်ပါ။ Backend DTO ကို စစ်ပါ။");
};
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: "same-origin",
    cache: "no-store",
    headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
  });
  const raw = await response.text();
  let parsed: unknown = null;
  try { parsed = raw ? JSON.parse(raw) : null; } catch { /* plain text error */ }
  if (!response.ok) {
    const error = parsed as { message?: string; detail?: string; error?: string } | null;
    throw new Error(`HTTP ${response.status}: ${error?.message || error?.detail || error?.error || raw || response.statusText}`);
  }
  return parsed as T;
}
const newKey = () => crypto.randomUUID();

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return <div className="min-w-0 space-y-1.5">
    <Label className="text-xs text-slate-600 dark:text-slate-300">{label}</Label>
    {children}
    {error && <p className="text-[11px] leading-5 text-rose-600" role="alert">{error}</p>}
  </div>;
}
const inputStyle = "h-11 w-full rounded-xl border-slate-200 bg-white text-sm shadow-none dark:border-slate-700 dark:bg-slate-950";
const selectStyle = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950";

export default function RawMaterialReceivingPage() {
  const { data: session, status } = useSession();
  const identity = session?.user as { id?: string | number; shopId?: string | number; shopCode?: string } | undefined;
  if (status !== "authenticated" || !identity) {
    return <p role="status" className="p-6 text-sm text-muted-foreground">
      {status === "loading" ? "Session စစ်နေသည်..." : "Login ပြန်ဝင်ပါ။"}
    </p>;
  }
  return <ReceivingWorkspace key={`${identity.id}:${identity.shopId ?? identity.shopCode}`} />;
}

function ReceivingWorkspace() {
  const [materials, setMaterials] = React.useState<Material[]>([]);
  const [warehouses, setWarehouses] = React.useState<Place[]>([]);
  const [locations, setLocations] = React.useState<Place[]>([]);
  const [receipts, setReceipts] = React.useState<Page<Receipt> | null>(null);
  const [page, setPage] = React.useState(0);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"ALL" | ReceiptStatus>("ALL");
  const [view, setView] = React.useState<"list" | "new" | "detail">("list");
  const [form, setForm] = React.useState<FormValues>(emptyForm);
  const [selected, setSelected] = React.useState<Receipt | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [createMaterialOpen, setCreateMaterialOpen] = React.useState(false);
  const [newMaterial, setNewMaterial] = React.useState({ name: "", sku: "", baseUnit: "KG" as Unit });
  const [refresh, setRefresh] = React.useState(0);
  const [uncertain, setUncertain] = React.useState(false);
  const [createdMaterialLoading, setCreatedMaterialLoading] = React.useState(false);
  const selectedMaterial = materials.find(m => String(m.id) === form.materialId);
  const unit = selectedMaterial?.baseUnit || "KG";
  const step = unit === "PCS" ? "1" : "0.001";
  const expected = Number(form.expectedQuantity);
  const actual = Number(form.actualQuantity);
  const variance = form.actualQuantity !== "" && form.expectedQuantity !== "" && Number.isFinite(actual - expected)
    ? actual - expected : null;

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setForm(previous => ({ ...previous, [key]: value, ...(key === "warehouseId" ? { locationId: "" } : {}) }));

  React.useEffect(() => {
    let live = true;
    void Promise.all([request<unknown>(API.materials), request<unknown>(API.warehouses)])
      .then(([a, b]) => { if (live) { setMaterials(asList<Material>(a)); setWarehouses(asList<Place>(b)); } })
      .catch(e => { if (live) setError(e instanceof Error ? e.message : "အချက်အလက် မရပါ။"); });
    return () => { live = false; };
  }, [refresh]);

  React.useEffect(() => {
    let live = true;
    setLoading(true);
    const q = new URLSearchParams({ page: String(page), size: "15" });
    if (search.trim()) q.set("search", search.trim());
    if (filter !== "ALL") q.set("status", filter);
    void request<Page<Receipt>>(`${API.receipts}?${q}`)
      .then(result => {
        if (!live) return;
        if (!result || !Array.isArray(result.content)) throw new Error("Receiving pagination response မကိုက်ပါ။");
        setReceipts(result);
      })
      .catch(e => { if (live) setError(e instanceof Error ? e.message : "စာရင်းမရပါ။"); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [page, filter, search, refresh]);

  React.useEffect(() => {
    if (!form.warehouseId) { setLocations([]); return; }
    let live = true;
    void request<unknown>(API.locations(Number(form.warehouseId)))
      .then(value => { if (live) setLocations(asList<Place>(value)); })
      .catch(e => { if (live) setError(e instanceof Error ? e.message : "Location မရပါ။"); });
    return () => { live = false; };
  }, [form.warehouseId, refresh]);

  const validate = (): string | null => {
    if (!selectedMaterial?.active) return "ကုန်ကြမ်းအမျိုးအစား ရွေးပါ။";
    if (!form.supplierName.trim()) return "Supplier အမည် ဖြည့်ပါ။";
    if (!form.batch.trim()) return "Batch / Lot ဖြည့်ပါ။";
    if (!form.warehouseId || !warehouses.some(w => w.active && String(w.id) === form.warehouseId)) return "Warehouse မှန်ကန်စွာ ရွေးပါ။";
    if (!form.locationId || !locations.some(l => l.active && String(l.id) === form.locationId)) return "Storage Location ရွေးပါ။";
    const validNumber = (s: string, required: boolean) => {
      if (!s && !required) return true;
      if (!/^\d+(?:\.\d{1,3})?$/.test(s) || Number(s) <= 0 || !Number.isFinite(Number(s))) return false;
      return unit !== "PCS" || Number.isInteger(Number(s));
    };
    if (!validNumber(form.expectedQuantity, true) || !validNumber(form.actualQuantity, true)) return `Expected / Actual ပမာဏကို ${unit} ယူနစ်နဲ့ မှန်ကန်စွာဖြည့်ပါ။`;
    if (form.packageCount && (!/^\d+$/.test(form.packageCount) || Number(form.packageCount) < 1)) return "အထုပ်အရေအတွက် အပြည့်ကိန်းဖြည့်ပါ။";
    if (form.quantityPerPackage && !validNumber(form.quantityPerPackage, true)) return "တစ်ထုပ်ပါပမာဏ စစ်ပါ။";
    if (!/^\d+(?:\.\d{1,2})?$/.test(form.purchaseCost)) return "ဝယ်ဈေးဖြည့်ပါ။";
    if (variance !== null && variance !== 0 && !form.varianceReason.trim()) return "ပမာဏကွာခြားရသည့်အကြောင်းရင်း ဖြည့်ပါ။";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.receivedDate) || (form.expiryDate && form.expiryDate < form.receivedDate)) return "Receiving / Expiry Date စစ်ပါ။";
    return null;
  };

  const body = () => ({
    materialId: Number(form.materialId),
    supplierName: form.supplierName.trim(),
    supplierReference: form.supplierReference.trim() || null,
    packageCount: form.packageCount ? Number(form.packageCount) : null,
    quantityPerPackage: form.quantityPerPackage ? Number(form.quantityPerPackage) : null,
    expectedQuantity: Number(form.expectedQuantity),
    actualQuantity: Number(form.actualQuantity),
    varianceReason: form.varianceReason.trim() || null,
    purchaseCost: Number(form.purchaseCost), currency: form.currency,
    batch: form.batch.trim(), warehouseId: Number(form.warehouseId),
    locationId: Number(form.locationId), receivedDate: form.receivedDate,
    expiryDate: form.expiryDate || null, note: form.note.trim() || null,
  });

  async function openReceipt(id: number) {
    setBusy(true); setError("");
    try {
      const r = await request<Receipt>(`${API.receipts}/${id}`);
      setSelected(r); setView("detail"); setNotice("");
    } catch (e) { setError(e instanceof Error ? e.message : "Record မဖွင့်နိုင်ပါ။"); }
    finally { setBusy(false); }
  }

  async function saveDraft() {
    const validation = validate();
    if (validation) { setError(validation); return; }
    if (busy || uncertain) return;
    setBusy(true); setError("");
    // A timeout or unreadable response is uncertain. Do not blindly retry POST.
    try {
      const response = await request<Receipt>(API.receipts, {
        method: "POST", headers: { "Idempotency-Key": newKey() }, body: JSON.stringify(body()),
      });
      if (!Number.isSafeInteger(response.id)) throw new Error("Created response မှာ receipt ID မပါပါ။");
      await openReceipt(response.id);
      setNotice("Receiving Draft ကို Server တွင် သိမ်းပြီးပါပြီ။");
      setRefresh(x => x + 1);
    } catch (e) {
      setUncertain(true);
      setError(`${e instanceof Error ? e.message : "Save failed"} · အောင်မြင်မှုမသေချာလျှင် Receiving List ကို စစ်ပြီးမှ အသစ်ထပ်ဖန်တီးပါ။`);
    } finally { setBusy(false); }
  }

  async function confirmReceipt() {
    if (!selected || selected.status !== "DRAFT" || busy || uncertain) return;
    setConfirmOpen(false); setBusy(true); setError("");
    const id = selected.id;
    try {
      const response = await request<Receipt>(`${API.receipts}/${id}/confirm`, {
        method: "POST", headers: { "Idempotency-Key": newKey() }, body: JSON.stringify({ version: selected.version }),
      });
      if (!response || response.status !== "CONFIRMED") throw new Error("Confirm response မသေချာပါ။");
      await openReceipt(id);
      setNotice("Receiving Confirmed — Raw Stock ကို Server က အတည်ပြုပြီးပါပြီ။");
      setRefresh(x => x + 1);
    } catch (e) {
      setUncertain(true);
      setError(`${e instanceof Error ? e.message : "Confirm failed"} · Confirm ပြန်နှိပ်မည့်အစား Record ကို ပြန်ဖွင့်စစ်ပါ။`);
    } finally { setBusy(false); }
  }

  async function createMaterial() {
    if (!newMaterial.name.trim() || !newMaterial.sku.trim() || createdMaterialLoading) return;
    setCreatedMaterialLoading(true); setError("");
    try {
      const r = await request<Material>(API.materials, {
        method: "POST", body: JSON.stringify({ ...newMaterial, name: newMaterial.name.trim(), sku: newMaterial.sku.trim() }),
      });
      setMaterials(old => [...old.filter(i => i.id !== r.id), r]);
      update("materialId", String(r.id));
      setCreateMaterialOpen(false);
      setNewMaterial({ name: "", sku: "", baseUnit: "KG" });
    } catch (e) { setError(e instanceof Error ? e.message : "Material မသိမ်းနိုင်ပါ။"); }
    finally { setCreatedMaterialLoading(false); }
  }

  function newReceiving() {
    setForm(emptyForm()); setSelected(null); setError(""); setNotice("");
    setUncertain(false); setView("new");
  }

  return <main lang="my" className="mx-auto max-w-[1480px] space-y-5 p-3 text-slate-900 dark:text-slate-100 sm:p-5" style={{ fontFamily: '"Noto Sans Myanmar", "Myanmar Text", sans-serif' }}>
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-bold tracking-widest text-blue-600">BINHLAIG · FACTORY / RECEIVING</p>
        <h1 className="mt-1 text-xl font-bold sm:text-2xl">Raw Material Receiving</h1>
        <p className="mt-1 text-xs text-slate-500">ကုန်ကြမ်းလက်ခံခြင်း · Warehouse နှင့် Lot Tracking</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="h-10 rounded-xl" disabled={busy} onClick={() => { setView("list"); setUncertain(false); setRefresh(x => x + 1); }}>
          <ClipboardList className="size-4" /> စာရင်းများ
        </Button>
        <Button className="h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700" disabled={busy || uncertain} onClick={newReceiving}>
          <Plus className="size-4" /> New Receiving
        </Button>
      </div>
    </header>

    {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-6 text-rose-800 dark:border-rose-800 dark:bg-rose-950/20 dark:text-rose-200"><AlertCircle className="mt-0.5 size-4 shrink-0" />{error}</div>}
    {notice && <div role="status" className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-200"><CheckCircle2 className="size-4 shrink-0" />{notice}</div>}

    {view === "list" && <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Current Page", value: receipts?.content.length ?? "—", icon: ClipboardList },
          { label: "Draft", value: receipts?.content.filter(r => r.status === "DRAFT").length ?? "—", icon: PackagePlus },
          { label: "Confirmed", value: receipts?.content.filter(r => r.status === "CONFIRMED").length ?? "—", icon: Warehouse },
        ].map(stat => <Card key={stat.label} className="gap-0 py-0 shadow-none"><CardContent className="p-4">
          <stat.icon className="mb-2 size-4 text-blue-600" />
          <p className="text-xs text-slate-500">{stat.label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{stat.value}</p>
        </CardContent></Card>)}
      </div>
      <Card className="gap-0 overflow-hidden py-0 shadow-none"><CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold">Receiving History</h2>
          <Button variant="ghost" size="sm" disabled={loading} onClick={() => setRefresh(x => x + 1)}><RefreshCw className="size-4" /> Refresh</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[180px] flex-1"><Search className="absolute left-3 top-3 size-4 text-slate-400" /><Input placeholder="Material / Receiving နံပါတ်ရှာရန်" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className={`${inputStyle} pl-9`} /></div>
          <select aria-label="Filter receiving status" className={`${selectStyle} w-auto min-w-[130px]`} value={filter} onChange={e => { setFilter(e.target.value as typeof filter); setPage(0); }}>
            <option value="ALL">All Status</option><option value="DRAFT">Draft</option><option value="CONFIRMED">Confirmed</option><option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full min-w-[690px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900"><tr>{["Receiving", "Raw Material", "Quantity", "Batch", "Date", "Status", ""].map(label => <th key={label} className="p-3 font-semibold">{label}</th>)}</tr></thead>
            <tbody>{receipts?.content.map(r => <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
              <td className="p-3 font-mono">{r.receivingNumber || `#${r.id}`}</td>
              <td className="p-3 font-semibold">{r.materialName || materials.find(m => m.id === r.materialId)?.name || `#${r.materialId}`}</td>
              <td className="p-3 tabular-nums">{format(r.actualQuantity)} {r.baseUnit || materials.find(m => m.id === r.materialId)?.baseUnit || ""}</td>
              <td className="p-3 font-mono">{r.batch}</td><td className="p-3">{r.receivedDate}</td>
              <td className="p-3"><Badge variant="outline" className={r.status === "CONFIRMED" ? "border-emerald-200 text-emerald-700 dark:text-emerald-300" : r.status === "DRAFT" ? "border-amber-200 text-amber-700" : "text-slate-500"}>{r.status}</Badge></td>
              <td className="p-3 text-right"><Button size="sm" variant="outline" disabled={busy} onClick={() => void openReceipt(r.id)}>View</Button></td>
            </tr>)}</tbody>
          </table>
          {!loading && !receipts?.content.length && <p className="p-8 text-center text-xs text-slate-500">Receiving မှတ်တမ်း မရှိသေးပါ။</p>}
          {loading && <p className="p-8 text-center text-xs text-slate-500">စာရင်းရယူနေသည်...</p>}
        </div>
        <div className="flex items-center justify-between"><Button variant="outline" disabled={page === 0 || loading} onClick={() => setPage(x => x - 1)}>Previous</Button><p className="text-xs text-slate-500">Page {page + 1} / {Math.max(1, receipts?.totalPages ?? 1)}</p><Button variant="outline" disabled={loading || !receipts || page + 1 >= receipts.totalPages} onClick={() => setPage(x => x + 1)}>Next</Button></div>
      </CardContent></Card>
    </>}

    {view === "new" && <>
      <div className="flex items-center gap-2"><Button variant="ghost" onClick={() => setView("list")}><ArrowLeft className="size-4" /> Back</Button><Badge variant="outline">New Draft</Badge></div>
      <div className="grid items-start gap-4 min-[1000px]:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="gap-0 py-0 shadow-none"><CardContent className="space-y-6 p-4 sm:p-5">
          <section className="space-y-3"><h2 className="border-b pb-2 text-sm font-bold">01 · Material & Supplier</h2>
            <div className="grid gap-3 sm:grid-cols-2"><Field label="Raw Material *"><div className="flex gap-2"><select className={selectStyle} value={form.materialId} onChange={e => update("materialId", e.target.value)}><option value="">ပစ္စည်းရွေးပါ</option>{materials.filter(m => m.active).map(m => <option key={m.id} value={m.id}>{m.name} · {m.baseUnit}</option>)}</select><Button variant="outline" type="button" aria-label="Add material" onClick={() => setCreateMaterialOpen(true)}><Plus className="size-4" /></Button></div></Field>
              <Field label="Supplier Name *"><Input className={inputStyle} value={form.supplierName} onChange={e => update("supplierName", e.target.value)} placeholder="Supplier" maxLength={200}/></Field>
              <Field label="Supplier Reference"><Input className={inputStyle} value={form.supplierReference} onChange={e => update("supplierReference", e.target.value)} placeholder="Invoice / Reference" /></Field>
              <Field label="Batch / Lot *"><Input className={inputStyle} value={form.batch} onChange={e => update("batch", e.target.value)} placeholder="ON-20261022-001" maxLength={100}/></Field>
            </div>
          </section>
          <section className="space-y-3"><h2 className="border-b pb-2 text-sm font-bold">02 · Quantity & Purchase Cost</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Package Count"><Input className={inputStyle} value={form.packageCount} onChange={e => { update("packageCount", e.target.value); if (/^\d+$/.test(e.target.value) && Number(form.quantityPerPackage) > 0) update("expectedQuantity", String(Number(e.target.value) * Number(form.quantityPerPackage))); }} inputMode="numeric" type="number" min="1" placeholder="2" /></Field>
              <Field label={`Per Package (${unit})`}><Input className={inputStyle} value={form.quantityPerPackage} onChange={e => { update("quantityPerPackage", e.target.value); if (Number(form.packageCount) > 0 && Number.isFinite(Number(e.target.value))) update("expectedQuantity", String(Number(form.packageCount) * Number(e.target.value))); }} type="number" min="0" step={step} placeholder="30" /></Field>
              <Field label={`Expected (${unit}) *`}><Input className={inputStyle} value={form.expectedQuantity} onChange={e => update("expectedQuantity", e.target.value)} type="number" min="0" step={step} /></Field>
              <Field label={`Actual Received (${unit}) *`}><Input className={`${inputStyle} border-blue-300 font-semibold dark:border-blue-700`} value={form.actualQuantity} onChange={e => update("actualQuantity", e.target.value)} type="number" min="0" step={step} /></Field>
              <Field label="Purchase Cost *"><Input className={inputStyle} value={form.purchaseCost} onChange={e => update("purchaseCost", e.target.value)} type="number" min="0" step="0.01" placeholder="180000" /></Field>
              <Field label="Currency"><select className={selectStyle} value={form.currency} onChange={e => update("currency", e.target.value as FormValues["currency"])}><option value="MMK">MMK · Ks</option><option value="JPY">JPY · ¥</option></select></Field>
            </div>
            {variance !== null && variance !== 0 && <Field label="Quantity Variance Reason *"><Input className={inputStyle} value={form.varianceReason} onChange={e => update("varianceReason", e.target.value)} placeholder="ကွာခြားမှုအကြောင်းရင်း" maxLength={500}/></Field>}
          </section>
          <section className="space-y-3"><h2 className="border-b pb-2 text-sm font-bold">03 · Warehouse & Dates</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Warehouse *"><select className={selectStyle} value={form.warehouseId} onChange={e => update("warehouseId", e.target.value)}><option value="">Warehouse ရွေးပါ</option>{warehouses.filter(w => w.active).map(w => <option value={w.id} key={w.id}>{w.name}</option>)}</select></Field>
              <Field label="Storage Location *"><select className={selectStyle} value={form.locationId} onChange={e => update("locationId", e.target.value)} disabled={!form.warehouseId}><option value="">Location ရွေးပါ</option>{locations.filter(l => l.active).map(l => <option value={l.id} key={l.id}>{l.name}</option>)}</select></Field>
              <Field label="Receiving Date *"><Input className={inputStyle} type="date" value={form.receivedDate} onChange={e => update("receivedDate", e.target.value)} /></Field>
              <Field label="Expiry Date"><Input className={inputStyle} type="date" min={form.receivedDate} value={form.expiryDate} onChange={e => update("expiryDate", e.target.value)} /></Field>
              <div className="sm:col-span-2"><Field label="Notes"><Input className={inputStyle} value={form.note} onChange={e => update("note", e.target.value)} maxLength={2000}/></Field></div>
            </div>
          </section>
          <div className="flex justify-end border-t pt-4"><Button className="min-h-11 rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-700" disabled={busy || uncertain} onClick={() => void saveDraft()}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save Draft</Button></div>
        </CardContent></Card>
        <aside className="min-w-0 min-[1000px]:sticky min-[1000px]:top-20"><Card className="gap-0 py-0 shadow-none"><CardContent className="space-y-4 p-4">
          <h2 className="text-sm font-bold">Receiving Summary</h2>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-500">Raw Material</p><p className="mt-1 font-semibold">{selectedMaterial?.name || "ပစ္စည်းမရွေးရသေး"}</p></div>
          <div className="rounded-xl bg-blue-600 p-4 text-white"><p className="text-xs text-blue-100">Actual Accepted</p><p className="mt-2 text-2xl font-bold tabular-nums">{form.actualQuantity ? format(actual) : "—"} {unit}</p></div>
          <div className="space-y-3 text-xs"><div className="flex justify-between gap-2"><span className="text-slate-500">Expected</span><strong>{form.expectedQuantity ? format(expected) : "—"} {unit}</strong></div><div className="flex justify-between gap-2"><span className="text-slate-500">Variance</span><strong className={variance && variance !== 0 ? "text-amber-600" : "text-emerald-600"}>{variance === null ? "—" : `${variance > 0 ? "+" : ""}${format(variance)} ${unit}`}</strong></div><div className="flex justify-between gap-2"><span className="text-slate-500">Warehouse</span><strong>{warehouses.find(w => String(w.id) === form.warehouseId)?.name || "—"}</strong></div><div className="flex justify-between gap-2"><span className="text-slate-500">Lot</span><strong className="break-all">{form.batch || "—"}</strong></div></div>
          <p className="border-t pt-3 text-[11px] leading-6 text-slate-500">Draft သိမ်းတာနဲ့ Stock မတိုးပါ။ Confirm ကို Server မှာ အောင်မြင်မှ Raw Stock တိုးပါမယ်။</p>
        </CardContent></Card></aside>
      </div>
    </>}

    {view === "detail" && selected && <>
      <Button variant="ghost" onClick={() => { setView("list"); setRefresh(x => x + 1); }}><ArrowLeft className="size-4" /> Back to List</Button>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">
        <Card className="gap-0 py-0 shadow-none"><CardContent className="space-y-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-bold">{selected.receivingNumber || `Receiving #${selected.id}`}</h2><p className="text-xs text-slate-500">Server Record · Version {selected.version}</p></div><Badge variant="outline" className={selected.status === "CONFIRMED" ? "border-emerald-200 text-emerald-700" : "border-amber-200 text-amber-700"}>{selected.status}</Badge></div>
          <div className="grid grid-cols-2 gap-3 text-sm">{[
            ["Raw Material", selected.materialName || materials.find(m => m.id === selected.materialId)?.name || `#${selected.materialId}`],
            ["Actual Received", `${format(selected.actualQuantity)} ${selected.baseUnit || materials.find(m => m.id === selected.materialId)?.baseUnit || ""}`],
            ["Expected", `${format(selected.expectedQuantity)} ${selected.baseUnit || ""}`],
            ["Supplier", selected.supplierName || "—"], ["Batch", selected.batch],
            ["Warehouse", selected.warehouseName || String(selected.warehouseId)],
            ["Location", selected.locationName || String(selected.locationId)],
            ["Received Date", selected.receivedDate],
          ].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900"><p className="text-[11px] text-slate-500">{label}</p><p className="mt-1 break-words font-semibold">{value}</p></div>)}</div>
          <p className="text-xs leading-7 text-slate-500">Confirmed Record ကို Stock Posting တစ်ကြိမ်သာလုပ်ရပါမယ်။ Actual Stock ကို Raw Stock API မှာစစ်ပါ။</p>
        </CardContent></Card>
        <Card className="gap-0 py-0 shadow-none"><CardContent className="space-y-4 p-4"><h3 className="text-sm font-bold">Actions</h3>
          {selected.status === "CONFIRMED" ? <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-200"><CheckCircle2 className="mb-2 size-5" />Receiving Confirmed</div> : selected.status === "DRAFT" ? <Button disabled={busy || uncertain} className="w-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => setConfirmOpen(true)}><CheckCircle2 className="size-4" /> Confirm Receiving</Button> : <p className="text-sm text-slate-500">Cancelled</p>}
          <Button variant="outline" className="w-full" disabled={busy} onClick={() => void openReceipt(selected.id)}><RefreshCw className="size-4" /> Refresh Server Record</Button>
          {uncertain && <p className="text-xs leading-6 text-amber-700">ရလဒ်မသေချာသေးပါ။ Server record ကို Refresh လုပ်ပြီး status စစ်ပါ။</p>}
        </CardContent></Card>
      </div>
    </>}

    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Receiving အတည်ပြုမလား?</DialogTitle><DialogDescription className="leading-7">Confirm လုပ်ပြီးရင် Raw Stock ကို Server က တိုးပေးပါမယ်။ Record ကို နောက်မှ ပြင်မရတော့ပါ။</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button><Button disabled={busy || uncertain} className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => void confirmReceipt()}>Confirm</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={createMaterialOpen} onOpenChange={setCreateMaterialOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Raw Material အသစ်ထည့်ရန်</DialogTitle><DialogDescription>ပစ္စည်းအမည်၊ SKU နဲ့ Base Unit ကို သတ်မှတ်ပါ။</DialogDescription></DialogHeader><div className="space-y-3"><Field label="Material Name"><Input className={inputStyle} value={newMaterial.name} onChange={e => setNewMaterial(s => ({ ...s, name: e.target.value }))} /></Field><Field label="SKU"><Input className={inputStyle} value={newMaterial.sku} onChange={e => setNewMaterial(s => ({ ...s, sku: e.target.value }))} /></Field><Field label="Base Unit"><select className={selectStyle} value={newMaterial.baseUnit} onChange={e => setNewMaterial(s => ({ ...s, baseUnit: e.target.value as Unit }))}><option value="KG">KG</option><option value="L">L</option><option value="PCS">PCS</option></select></Field></div><DialogFooter><Button variant="outline" onClick={() => setCreateMaterialOpen(false)}>Cancel</Button><Button disabled={createdMaterialLoading || !newMaterial.name.trim() || !newMaterial.sku.trim()} onClick={() => void createMaterial()}>Save Material</Button></DialogFooter></DialogContent></Dialog>
  </main>;
}
