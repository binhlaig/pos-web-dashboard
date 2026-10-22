"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { costingRequest, decodeSheet, photoUrl, type CostingSheet, type CostingServerItem } from "@/lib/costing-api";
import {
  AlertCircle, ArrowLeft, CheckCircle2, ClipboardList, Loader2, FileCheck2,
  PackagePlus, Plus, RefreshCw, Save, Search, Warehouse, ImageIcon, Eye,
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
  costingSheetId?: number; costingItemId?: number; costingVersion?: number;
  costingSnapshot?: unknown; sourceSnapshot?: unknown; snapshot?: unknown;
};
/** Only server-returned, persisted source proof authorizes a stock posting. */
function hasPersistedCostingReference(record: Receipt | null | undefined, expected?: { sheetId: number; itemId: number; version: number }): boolean {
  if (!record || typeof record !== "object" || Array.isArray(record)) return false;
  const raw = record as Receipt & Record<string, unknown>;
  const candidate = raw.costingSnapshot ?? raw.sourceSnapshot ?? raw.snapshot;
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return false;
  const snapshot = candidate as Record<string, unknown>;
  const ids = [raw.costingSheetId, snapshot.costingSheetId, snapshot.sheetId];
  const items = [raw.costingItemId, snapshot.costingItemId, snapshot.itemId];
  const versions = [raw.costingVersion, snapshot.costingVersion, snapshot.sourceVersion, snapshot.sheetVersion];
  const sheetId = ids.find(value => typeof value === "number" && Number.isSafeInteger(value));
  const itemId = items.find(value => typeof value === "number" && Number.isSafeInteger(value));
  const version = versions.find(value => typeof value === "number" && Number.isSafeInteger(value));
  if (typeof sheetId !== "number" || typeof itemId !== "number" || typeof version !== "number") return false;
  return expected ? sheetId === expected.sheetId && itemId === expected.itemId && version === expected.version : true;
}

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
  // URL deep-link is only a UI selection. Server-side reference validation
  // and snapshot persistence are required before a linked stock posting is safe.
  const [source, setSource] = React.useState<{ sheet: CostingSheet; item: CostingServerItem } | null>(null);
  const [sourceLoading, setSourceLoading] = React.useState(false);
  const [sourceError, setSourceError] = React.useState("");
  const [sourceRequested, setSourceRequested] = React.useState(false);
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
  const [productPhotoError, setProductPhotoError] = React.useState(false);
  const selectedMaterial = materials.find(m => String(m.id) === form.materialId);
  // Costing controls the displayed product; raw material identity must still be
  // resolved to a real server materialId, never fabricated from the costing item.
  const costingProductName = source ? String(source.item.inputs.product || "").trim() : "";
  const normalizedName = (value: string) => value.trim().toLocaleLowerCase();
  const matchingMaterials = source
    ? materials.filter(m => m.active && normalizedName(m.name) === normalizedName(costingProductName))
    : [];
  const costingMaterialResolved = !!source && !!selectedMaterial?.active &&
    normalizedName(selectedMaterial.name) === normalizedName(costingProductName);
  const materialNeedsLink = !!source && !costingMaterialResolved;
  const unit = selectedMaterial?.baseUnit || "KG";
  const step = unit === "PCS" ? "1" : "0.001";
  const expected = Number(form.expectedQuantity);
  const actual = Number(form.actualQuantity);
  const referenceImage = source ? photoUrl(source.sheet, source.item, "ORIGINAL") : null;
  const chosenProductName = source ? String(source.item.inputs.product || "ပစ္စည်းအမည်မရှိ") : selectedMaterial?.name || "ပစ္စည်းမရွေးရသေး";
  const chosenProductCost = source?.item.calculation.values.costPerUnit;
  const chosenProductPrice = source?.item.calculation.values.price;
  const purchaseAmount = Number(form.purchaseCost || 0);
  const variance = form.actualQuantity !== "" && form.expectedQuantity !== "" && Number.isFinite(actual - expected)
    ? actual - expected : null;

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setForm(previous => ({ ...previous, [key]: value, ...(key === "warehouseId" ? { locationId: "" } : {}) }));

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sheetId = params.get("sheetId");
    const itemId = params.get("itemId");
    if (!sheetId && !itemId) return;
    setSourceRequested(true);
    if (!sheetId || !itemId || !/^[1-9]\d*$/.test(sheetId) || !/^[1-9]\d*$/.test(itemId)) {
      setSourceError("Costing Reference ID မမှန်ပါ။");
      return;
    }
    let active = true;
    setSourceLoading(true);
    void costingRequest(`/${sheetId}`)
      .then(value => {
        if (!active) return;
        const sheet = decodeSheet(value);
        const item = sheet.items.find(i => i.id === Number(itemId));
        if (sheet.status !== "FINALIZED" || !item?.calculation.ready) {
          throw new Error("FINALIZED ဖြစ်ပြီး တွက်ချက်မှု ပြည့်စုံသော Costing Product ကိုသာ ရွေးပါ။");
        }
        setProductPhotoError(false);
        setSource({ sheet, item });
        setView("new");
      })
      .catch(e => { if (active) setSourceError(e instanceof Error ? e.message : "Costing Reference မဖွင့်နိုင်ပါ။"); })
      .finally(() => { if (active) setSourceLoading(false); });
    return () => { active = false; };
  }, []);

  React.useEffect(() => {
    let live = true;
    void Promise.all([request<unknown>(API.materials), request<unknown>(API.warehouses)])
      .then(([a, b]) => { if (live) { setMaterials(asList<Material>(a)); setWarehouses(asList<Place>(b)); } })
      .catch(e => { if (live) setError(e instanceof Error ? e.message : "အချက်အလက် မရပါ။"); });
    return () => { live = false; };
  }, [refresh]);

  // Auto-select a uniquely named existing material after both asynchronous API
  // responses arrive. Duplicate names are never silently chosen.
  React.useEffect(() => {
    if (!source) return;
    const matches = materials.filter(m => m.active &&
      m.name.trim().toLocaleLowerCase() === String(source.item.inputs.product || "").trim().toLocaleLowerCase());
    if (matches.length !== 1) return;
    setForm(previous => previous.materialId === String(matches[0].id)
      ? previous : { ...previous, materialId: String(matches[0].id) });
  }, [source, materials]);

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
    if (source && materialNeedsLink) return "Costing Product ကို Raw Material မှတ်တမ်းနဲ့ မချိတ်ရသေးပါ။ အောက်က ‘ကုန်ကြမ်းအဖြစ် စာရင်းသွင်းရန်’ ကိုနှိပ်ပါ။";
    if (!selectedMaterial?.active) return "ကုန်ကြမ်းပစ္စည်း ရွေးပါ။";
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
      if (!r || !Number.isSafeInteger(r.id)) throw new Error("Receiving record ကို Server က မှန်ကန်စွာ ပြန်မပေးပါ။");
      setSelected(r); setView("detail"); setNotice("");
    } catch (e) { setError(e instanceof Error ? e.message : "Record မဖွင့်နိုင်ပါ။"); }
    finally { setBusy(false); }
  }

  async function saveDraft() {
    const validation = validate();
    if (validation) { setError(validation); return; }
    if (busy || uncertain) return;
    if (!sourceRequested || !source || sourceLoading || sourceError) { setError("FINALIZED Costing Product ကို Costing Products Page မှ အရင်ရွေးပါ။"); return; }
    setBusy(true); setError("");
    // A timeout or unreadable response is uncertain. Do not blindly retry POST.
    try {
      const response = await request<Receipt>(API.receipts, {
        method: "POST", headers: { "Idempotency-Key": newKey() }, body: JSON.stringify({ ...body(), costingSheetId: source.sheet.id, costingItemId: source.item.id, costingVersion: source.sheet.version }),
      });
      if (!response || !Number.isSafeInteger(response.id)) throw new Error("Created response မှာ receipt ID မပါပါ။");
      const persisted = await request<Receipt>(`${API.receipts}/${response.id}`);
      if (!persisted || !Number.isSafeInteger(persisted.id)) throw new Error("Server မှ Receiving record ပြန်မရပါ။");
      setSelected(persisted); setView("detail");
      if (!hasPersistedCostingReference(persisted, { sheetId: source.sheet.id, itemId: source.item.id, version: source.sheet.version })) {
        setError("Draft သိမ်းထားသော်လည်း Backend က Costing Reference Snapshot ကို ပြန်မပေးပါ။ Confirm ကို ပိတ်ထားပါတယ်။ Backend DTO / Migration စစ်ပါ။");
      } else {
        setNotice("Costing Reference ပါဝင်သော Receiving Draft ကို Server တွင် သိမ်းပြီးပါပြီ။");
      }
      setRefresh(x => x + 1);
    } catch (e) {
      setUncertain(true);
      setError(`${e instanceof Error ? e.message : "Save failed"} · အောင်မြင်မှုမသေချာလျှင် Receiving List ကို စစ်ပြီးမှ အသစ်ထပ်ဖန်တီးပါ။`);
    } finally { setBusy(false); }
  }

  async function confirmReceipt() {
    if (!selected || selected.status !== "DRAFT" || busy || uncertain) return;
    if (!hasPersistedCostingReference(selected)) { setError("Server မှ ပြန်ရသော Receiving မှာ Costing Snapshot မရှိသေးသဖြင့် Confirm ပိတ်ထားပါသည်။"); return; }
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
    if (source && normalizedName(newMaterial.name) !== normalizedName(costingProductName)) {
      setError("Raw Material အမည်သည် ရွေးထားသော Costing Product အမည်နှင့် တူရပါမယ်။");
      return;
    }
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
    {sourceLoading && <div role="status" className="rounded-xl border border-border bg-card p-4 text-sm"><Loader2 className="mr-2 inline size-4 animate-spin"/>Costing Reference ဖတ်နေပါသည်...</div>}
    {sourceError && <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30">{sourceError} <Link className="ml-2 underline" href="/factory/costing/products">Costing Products သို့</Link></div>}
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-bold tracking-widest text-blue-600">BINHLAIG · FACTORY / RECEIVING</p>
        <h1 className="mt-1 text-xl font-bold sm:text-2xl">ကုန်ကြမ်း လက်ခံမှု</h1>
        <p className="mt-1 text-xs text-slate-500">ကုန်ကြမ်းပစ္စည်းများကို စစ်ဆေးပြီး စတော့စာရင်းသို့ လက်ခံသွင်းရန်</p>
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
          <h2 className="text-sm font-bold">လက်ခံမှု မှတ်တမ်းများ</h2>
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
      <div className="flex items-center gap-2"><Button variant="ghost" onClick={() => setView("list")}><ArrowLeft className="size-4" /> Back</Button><Badge variant="outline">လက်ခံမှု မူကြမ်း</Badge></div>
      <div className="grid items-start gap-4 min-[1000px]:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="gap-0 py-0 shadow-none"><CardContent className="space-y-6 p-4 sm:p-5">
          <section className="space-y-3"><h2 className="border-b pb-2 text-sm font-bold">01 · ပစ္စည်းနှင့် ပေးသွင်းသူ</h2>
            <div className="grid gap-3 sm:grid-cols-2"><Field label="ကုန်ကြမ်းပစ္စည်း *">
                {source ? (
                  <div className="space-y-2">
                    <div className={`${inputStyle} flex h-auto min-h-11 items-center gap-2 rounded-xl border px-3 py-2`}>
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                      <span className="min-w-0 flex-1 break-words font-semibold">{costingProductName || "Costing Product အမည်မရှိ"}</span>
                      <Badge variant="outline">Costing</Badge>
                    </div>
                    {costingMaterialResolved ? (
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">Raw Material ချိတ်ဆက်ထားပြီး · {selectedMaterial?.baseUnit} · ID #{selectedMaterial?.id}</p>
                    ) : (
                      <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-900 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
                        <p>{matchingMaterials.length > 1 ? "အမည်တူ Raw Material တစ်ခုထက်ပိုရှိနေပါတယ်။ မှန်ကန်တဲ့ Record ကို ရွေးချယ်ဖို့ Backend Mapping လိုပါတယ်။" : "Costing Product ကို ပြထားပေမဲ့ Backend Raw Material မှတ်တမ်း မရှိသေးပါ။ Stock အတွက် Material ID အမှန်လိုအပ်ပါတယ်။"}</p>
                        {matchingMaterials.length === 0 && <Button type="button" size="sm" variant="outline" onClick={() => {
                          setNewMaterial({ name: costingProductName, sku: `FC-${source.sheet.id}-${source.item.id}`, baseUnit: "KG" });
                          setCreateMaterialOpen(true);
                        }}><Plus className="mr-1 size-4" /> ကုန်ကြမ်းအဖြစ် စာရင်းသွင်းရန်</Button>}
                        {matchingMaterials.length > 1 && <select aria-label="Raw Material ID ရွေးရန်" className={selectStyle} value={form.materialId} onChange={e => update("materialId", e.target.value)}><option value="">Raw Material ID ရွေးရန်</option>{matchingMaterials.map(m => <option key={m.id} value={m.id}>{m.name} · {m.sku} · #{m.id}</option>)}</select>}
                      </div>
                    )}
                  </div>
                ) : <div className="flex gap-2"><select className={selectStyle} value={form.materialId} onChange={e => update("materialId", e.target.value)}><option value="">ပစ္စည်းရွေးပါ</option>{materials.filter(m => m.active).map(m => <option key={m.id} value={m.id}>{m.name} · {m.baseUnit}</option>)}</select><Button variant="outline" type="button" aria-label="ကုန်ကြမ်းအသစ်ထည့်ရန်" title="ကုန်ကြမ်းအသစ်ထည့်ရန်" onClick={() => setCreateMaterialOpen(true)}><Plus className="size-4" /></Button></div>}
              </Field>
              <Field label="ပေးသွင်းသူ *"><Input className={inputStyle} value={form.supplierName} onChange={e => update("supplierName", e.target.value)} placeholder="Supplier" maxLength={200}/></Field>
              <div className="sm:col-span-2 flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-3 sm:flex-row sm:items-center">
                <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-card sm:w-32">
                  {source && source.item.originalImage && referenceImage && !productPhotoError ? (
                    // Authenticated same-origin Costing photo endpoint.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={referenceImage} alt={`${chosenProductName} - မူလဝယ်ယူသောပစ္စည်းပုံ`} className="h-full w-full object-contain p-1" onError={() => setProductPhotoError(true)} />
                  ) : <div className="flex flex-col items-center gap-1 text-muted-foreground"><ImageIcon className="size-6" /><span className="text-[11px]">ပစ္စည်းပုံ မရှိသေးပါ</span></div>}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[11px] text-muted-foreground">ရွေးချယ်ထားသော ကုန်ပစ္စည်း</p>
                  <p className="break-words text-base font-bold">{chosenProductName}</p>
                  {source && <Badge variant="outline" className="border-emerald-200 text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="mr-1 size-3"/> Costing ချိတ်ဆက်ထားသည်</Badge>}
                  {source && selectedMaterial && selectedMaterial.name.trim().toLocaleLowerCase() !== chosenProductName.trim().toLocaleLowerCase() && <p className="text-xs text-amber-700 dark:text-amber-300">သတိ: Material အမည်နှင့် Costing Product အမည် မတူပါ။ Backend ပစ္စည်းချိတ်ဆက်မှုကို စစ်ဆေးပါ။</p>}
                </div>
              </div>
              {source && <div className="sm:col-span-2 rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-3 dark:border-blue-800 dark:bg-blue-950/20" role="note" aria-label="Costing ကိုးကားအချက်အလက်">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-900 dark:text-blue-200"><FileCheck2 className="size-4 text-blue-600" /> Costing မှရယူထားသော ကိုးကားအချက်အလက် <Badge variant="outline">Sheet #{source.sheet.id} · Item #{source.item.id} · V{source.sheet.version}</Badge></div>
                <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">Costing တွင် တွက်ထားသော အိတ်အရေအတွက်သည် လက်ခံနိုင်သည့် အများဆုံးပမာဏ မဟုတ်ပါ။ ရောက်ရှိသည့်အိတ်အရေအတွက်ကို သီးခြားဖြည့်နိုင်ပါသည်။</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs"><span>တစ်ယူနစ် ကုန်ကျစရိတ်: <strong>{chosenProductCost ?? "—"} {source.sheet.currencyCode}</strong></span><span>ရောင်းဈေး: <strong>{chosenProductPrice ?? "—"} {source.sheet.currencyCode}</strong></span></div>
                <Link className="mt-2 inline-flex text-xs font-semibold text-blue-700 underline dark:text-blue-300" href={`/factory/costing/products/${source.sheet.id}/${source.item.id}`}>Costing အသေးစိတ်ကြည့်ရန်</Link>
              </div>}
              <Field label="Supplier Reference"><Input className={inputStyle} value={form.supplierReference} onChange={e => update("supplierReference", e.target.value)} placeholder="Invoice / Reference" /></Field>
              <Field label="Batch / Lot *"><Input className={inputStyle} value={form.batch} onChange={e => update("batch", e.target.value)} placeholder="ON-20261022-001" maxLength={100}/></Field>
            </div>
          </section>
          <section className="space-y-3"><h2 className="border-b pb-2 text-sm font-bold">02 · လက်ခံရရှိသော အရေအတွက်</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="ရောက်ရှိသော အိတ်/ထုပ် အရေအတွက်"><Input className={inputStyle} value={form.packageCount} onChange={e => { update("packageCount", e.target.value); if (/^\d+$/.test(e.target.value) && Number(form.quantityPerPackage) > 0) update("expectedQuantity", String(Number(e.target.value) * Number(form.quantityPerPackage))); }} inputMode="numeric" type="number" min="1" placeholder="2" /></Field>
              <Field label={`တစ်အိတ်/ထုပ် ပါဝင်ပမာဏ (${unit})`}><Input className={inputStyle} value={form.quantityPerPackage} onChange={e => { update("quantityPerPackage", e.target.value); if (Number(form.packageCount) > 0 && Number.isFinite(Number(e.target.value))) update("expectedQuantity", String(Number(form.packageCount) * Number(e.target.value))); }} type="number" min="0" step={step} placeholder="30" /></Field>
              <Field label={`မျှော်မှန်းလက်ခံပမာဏ (${unit}) *`}><Input className={inputStyle} value={form.expectedQuantity} onChange={e => update("expectedQuantity", e.target.value)} type="number" min="0" step={step} /></Field>
              <Field label={`အမှန်တကယ် လက်ခံပမာဏ (${unit}) *`}><Input className={`${inputStyle} border-blue-300 font-semibold dark:border-blue-700`} value={form.actualQuantity} onChange={e => update("actualQuantity", e.target.value)} type="number" min="0" step={step} /></Field>
              <Field label="စုစုပေါင်း ဝယ်ယူကုန်ကျစရိတ် *"><Input className={inputStyle} value={form.purchaseCost} onChange={e => update("purchaseCost", e.target.value)} type="number" min="0" step="0.01" placeholder="180000" /></Field>
              <Field label="ငွေကြေး"><select className={selectStyle} value={form.currency} onChange={e => update("currency", e.target.value as FormValues["currency"])}><option value="MMK">MMK · Ks</option><option value="JPY">JPY · ¥</option></select></Field>
            </div>
            {variance !== null && variance !== 0 && <Field label="အရေအတွက်ကွာခြားရသည့် အကြောင်းရင်း *"><Input className={inputStyle} value={form.varianceReason} onChange={e => update("varianceReason", e.target.value)} placeholder="ကွာခြားမှုအကြောင်းရင်း" maxLength={500}/></Field>}
          </section>
          <section className="space-y-3"><h2 className="border-b pb-2 text-sm font-bold">03 · ကုန်ကျစရိတ်၊ ဂိုဒေါင်နှင့် ရက်စွဲ</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="ဂိုဒေါင် *"><select className={selectStyle} value={form.warehouseId} onChange={e => update("warehouseId", e.target.value)}><option value="">Warehouse ရွေးပါ</option>{warehouses.filter(w => w.active).map(w => <option value={w.id} key={w.id}>{w.name}</option>)}</select></Field>
              <Field label="သိုလှောင်နေရာ *"><select className={selectStyle} value={form.locationId} onChange={e => update("locationId", e.target.value)} disabled={!form.warehouseId}><option value="">Location ရွေးပါ</option>{locations.filter(l => l.active).map(l => <option value={l.id} key={l.id}>{l.name}</option>)}</select></Field>
              <Field label="လက်ခံရက်စွဲ *"><Input className={inputStyle} type="date" value={form.receivedDate} onChange={e => update("receivedDate", e.target.value)} /></Field>
              <Field label="သက်တမ်းကုန်ရက်"><Input className={inputStyle} type="date" min={form.receivedDate} value={form.expiryDate} onChange={e => update("expiryDate", e.target.value)} /></Field>
              <div className="sm:col-span-2"><Field label="မှတ်ချက်"><Input className={inputStyle} value={form.note} onChange={e => update("note", e.target.value)} maxLength={2000}/></Field></div>
            </div>
          </section>
          <div className="flex justify-end border-t pt-4"><Button className="min-h-11 rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-700" disabled={busy || uncertain || !source || sourceLoading || !!sourceError || materialNeedsLink} onClick={() => void saveDraft()}>{busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save Draft</Button></div>
        </CardContent></Card>
        <aside className="min-w-0 min-[1000px]:sticky min-[1000px]:top-20"><Card className="gap-0 overflow-hidden py-0 shadow-none"><CardContent className="space-y-4 p-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300"><ClipboardList className="size-4"/> အနှစ်ချုပ်</h2>
          <div className="flex items-center gap-3"><div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/30">{source?.item.originalImage && referenceImage && !productPhotoError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={referenceImage} alt={chosenProductName} className="h-full w-full object-contain" onError={() => setProductPhotoError(true)}/>
          ) : <ImageIcon className="size-6 text-muted-foreground"/>}</div><div className="min-w-0"><p className="break-words font-bold">{chosenProductName}</p>{source && <Badge variant="outline" className="mt-1 border-emerald-200 text-emerald-700">Costing Linked</Badge>}</div></div>
          <dl className="space-y-2 text-xs">
            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">ပေးသွင်းသူ</dt><dd className="text-right font-semibold">{form.supplierName || "—"}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">ရောက်ရှိသည့်အထုပ်</dt><dd className="font-semibold">{form.packageCount || "—"} အိတ်/ထုပ်</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">မျှော်မှန်းပမာဏ</dt><dd className="font-semibold">{form.expectedQuantity ? format(expected) : "—"} {unit}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">ဂိုဒေါင်</dt><dd className="text-right font-semibold">{warehouses.find(w => String(w.id) === form.warehouseId)?.name || "—"}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Batch / Lot</dt><dd className="break-all text-right font-semibold">{form.batch || "—"}</dd></div>
          </dl>
          <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950/30"><p className="text-xs text-muted-foreground">အမှန်တကယ် လက်ခံပမာဏ</p><p className="mt-1 text-2xl font-bold tabular-nums text-blue-700 dark:text-blue-300">{form.actualQuantity ? format(actual) : "—"} {unit}</p></div>
          <div className="space-y-2 rounded-xl bg-muted/40 p-3 text-xs"><div className="flex justify-between"><span className="text-muted-foreground">ဝယ်ယူကုန်ကျစရိတ်</span><strong>{form.purchaseCost ? format(purchaseAmount,2) : "—"} {form.currency}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">လက်ခံပမာဏ ကွာခြားချက်</span><strong className={variance && variance !== 0 ? "text-amber-600" : "text-emerald-600"}>{variance === null ? "—" : `${variance > 0 ? "+" : ""}${format(variance)} ${unit}`}</strong></div>{source && <div className="flex justify-between"><span className="text-muted-foreground">Costing ရောင်းဈေး/ယူနစ်</span><strong>{chosenProductPrice ?? "—"} {source.sheet.currencyCode}</strong></div>}</div>
          <p className="border-t pt-3 text-[11px] leading-6 text-muted-foreground">မူကြမ်းသိမ်းရုံဖြင့် စတော့မတိုးပါ။ Backend မှ Costing Snapshot ကို အတည်ပြုပြီး Receiving Confirm အောင်မြင်မှ Raw Stock တိုးပါမည်။</p>
          <Button className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={busy || uncertain || !source || sourceLoading || !!sourceError || materialNeedsLink} onClick={() => void saveDraft()}>{busy ? <Loader2 className="size-4 animate-spin"/> : <Save className="size-4"/>} မူကြမ်းသိမ်းမည်</Button>
        </CardContent></Card></aside>
      </div>
    </>}

    {view === "new" && <section className="rounded-2xl border border-border bg-card p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-sm font-bold"><ClipboardList className="size-4 text-blue-600"/> လက်ခံမှု မှတ်တမ်းများ</h2><Button variant="outline" size="sm" onClick={() => setView("list")}>အားလုံးကြည့်ရန် <ArrowLeft className="ml-1 size-3 rotate-180"/></Button></div><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-xs"><thead className="bg-muted/40"><tr>{["ရက်စွဲ","ကုန်ပစ္စည်း","ပေးသွင်းသူ","အမှန်တကယ်ပမာဏ","အခြေအနေ",""].map(x => <th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{receipts?.content.slice(0,5).map(r => <tr key={r.id} className="border-t"><td className="p-3">{r.receivedDate}</td><td className="p-3 font-semibold">{r.materialName || materials.find(m=>m.id===r.materialId)?.name || `#${r.materialId}`}</td><td className="p-3">{r.supplierName || "—"}</td><td className="p-3">{format(r.actualQuantity)} {r.baseUnit || ""}</td><td className="p-3"><Badge variant="outline">{r.status}</Badge></td><td className="p-3"><Button variant="outline" size="sm" disabled={busy} onClick={() => void openReceipt(r.id)}><Eye className="size-3"/> ကြည့်ရန်</Button></td></tr>)}</tbody></table>{!receipts?.content.length && <p className="p-5 text-center text-xs text-muted-foreground">လက်ခံမှုမှတ်တမ်း မရှိသေးပါ။</p>}</div></section>}

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
          {selected.status === "DRAFT" && !hasPersistedCostingReference(selected) && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-xs leading-6 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">Backend response မှ Costing Snapshot မတွေ့ပါ။ Confirm ကို ပိတ်ထားသည်။</p>}
          {selected.status === "CONFIRMED" ? <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-200"><CheckCircle2 className="mb-2 size-5" />Receiving Confirmed</div> : selected.status === "DRAFT" ? <Button disabled={busy || uncertain || !hasPersistedCostingReference(selected)} className="w-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => setConfirmOpen(true)}><CheckCircle2 className="size-4" /> Confirm Receiving</Button> : <p className="text-sm text-slate-500">Cancelled</p>}
          <Button variant="outline" className="w-full" disabled={busy} onClick={() => void openReceipt(selected.id)}><RefreshCw className="size-4" /> Refresh Server Record</Button>
          {uncertain && <p className="text-xs leading-6 text-amber-700">ရလဒ်မသေချာသေးပါ။ Server record ကို Refresh လုပ်ပြီး status စစ်ပါ။</p>}
        </CardContent></Card>
      </div>
    </>}

    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Receiving အတည်ပြုမလား?</DialogTitle><DialogDescription className="leading-7">Confirm လုပ်ပြီးရင် Raw Stock ကို Server က တိုးပေးပါမယ်။ Record ကို နောက်မှ ပြင်မရတော့ပါ။</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button><Button disabled={busy || uncertain || !hasPersistedCostingReference(selected)} className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => void confirmReceipt()}>Confirm</Button></DialogFooter></DialogContent></Dialog>
    <Dialog open={createMaterialOpen} onOpenChange={setCreateMaterialOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Raw Material အသစ်ထည့်ရန်</DialogTitle><DialogDescription>ပစ္စည်းအမည်၊ SKU နဲ့ Base Unit ကို သတ်မှတ်ပါ။</DialogDescription></DialogHeader><div className="space-y-3"><Field label="Material Name"><Input className={inputStyle} readOnly={!!source} value={newMaterial.name} onChange={e => setNewMaterial(s => ({ ...s, name: e.target.value }))} /></Field><Field label="SKU"><Input className={inputStyle} value={newMaterial.sku} onChange={e => setNewMaterial(s => ({ ...s, sku: e.target.value }))} /></Field><Field label="Base Unit"><select className={selectStyle} value={newMaterial.baseUnit} onChange={e => setNewMaterial(s => ({ ...s, baseUnit: e.target.value as Unit }))}><option value="KG">KG</option><option value="L">L</option><option value="PCS">PCS</option></select></Field></div><DialogFooter><Button variant="outline" onClick={() => setCreateMaterialOpen(false)}>Cancel</Button><Button disabled={createdMaterialLoading || !newMaterial.name.trim() || !newMaterial.sku.trim()} onClick={() => void createMaterial()}>Save Material</Button></DialogFooter></DialogContent></Dialog>
  </main>;
}
