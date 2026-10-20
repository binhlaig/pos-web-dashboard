"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle, ArrowDownToLine, ArrowRight, Barcode, Check,
  CheckCircle2, Drumstick, Fish, Info, Leaf, ScanLine, Undo2, Weight,
} from "lucide-react";

// Save as app/factory/receiving/page.tsx.
// The existing factory layout owns the sidebar, header, and account guard.
// Preview data is isolated here; no inventory endpoint is assumed or called.
type ReceivedCrate = {
  id: string;
  barcode: string;
  name: string;
  batch: string;
  weightGrams: number;
  location: string;
  kind: "chicken" | "vegetable" | "fish";
};

const previewCrates: ReceivedCrate[] = [
  { id: "crate-001", barcode: "CRATE-001", name: "Fresh Chicken", batch: "CH-071026", weightGrams: 12350, location: "Cold Room A", kind: "chicken" },
  { id: "crate-002", barcode: "CRATE-002", name: "White Cabbage", batch: "WC-071026", weightGrams: 18000, location: "Rack V-02", kind: "vegetable" },
  { id: "crate-003", barcode: "CRATE-003", name: "Fresh Fish", batch: "FH-071026", weightGrams: 9200, location: "Cold Room B", kind: "fish" },
];

function kg(grams: number) {
  return (grams / 1000).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ProductThumbnail({ kind, large = false }: { kind: ReceivedCrate["kind"]; large?: boolean }) {
  const Icon = kind === "chicken" ? Drumstick : kind === "fish" ? Fish : Leaf;
  const tone = kind === "chicken"
    ? "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
    : kind === "fish"
      ? "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300";
  return (
    <div aria-hidden="true" className={`grid shrink-0 place-items-center rounded-xl ${tone} ${large ? "size-20 sm:size-28" : "size-10"}`}>
      <Icon className={large ? "size-12" : "size-6"} strokeWidth={1.5} />
    </div>
  );
}

export default function FactoryReceivingPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [barcode, setBarcode] = useState("");
  const [crates, setCrates] = useState<ReceivedCrate[]>(previewCrates);
  const [lastScanned, setLastScanned] = useState<ReceivedCrate | null>(previewCrates[0]);
  const [notice, setNotice] = useState<{ kind: "error" | "info" | "success"; text: string } | null>(null);
  const totalGrams = crates.reduce((total, crate) => total + crate.weightGrams, 0);

  function handleScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = barcode.trim().toUpperCase();
    if (!value) return;
    const crate = previewCrates.find((item) => item.barcode === value);
    if (!crate) {
      setNotice({ kind: "error", text: "Unknown preview barcode. Use CRATE-001, CRATE-002, or CRATE-003." });
    } else if (crates.some((item) => item.id === crate.id)) {
      setNotice({ kind: "error", text: `${crate.name}: this crate is already in the receiving list.` });
    } else {
      setCrates((current) => [...current, crate]);
      setLastScanned(crate);
      setNotice({ kind: "success", text: `${crate.name} added to the preview list.` });
    }
    setBarcode("");
    inputRef.current?.focus();
  }

  function undoLastScan() {
    if (!crates.length) return;
    const remaining = crates.slice(0, -1);
    setCrates(remaining);
    setLastScanned(remaining[remaining.length - 1] ?? null);
    setNotice({ kind: "info", text: "Last crate removed from the preview list. No stock was changed." });
    inputRef.current?.focus();
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 text-slate-950 dark:text-slate-100">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl xl:text-4xl">Barcode Receiving</h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base dark:text-slate-400">Scan order, scan item, scan storage location</p>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">Design preview</span>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <ol aria-label="Receiving steps" className="grid grid-cols-1 gap-4 rounded-2xl bg-white/50 p-4 sm:grid-cols-3 sm:gap-3 dark:bg-slate-900/40">
            <li className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-600 text-white"><Check className="size-5" /></span>
              <div className="min-w-0"><p className="text-sm font-semibold">1. Purchase order</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">PO-1028 preview</p></div>
            </li>
            <li aria-current="step" className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-600 text-lg font-semibold text-white shadow-sm">2</span>
              <div className="min-w-0"><p className="text-sm font-semibold">2. Scan items</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Scan product barcodes</p></div>
            </li>
            <li className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-slate-300 bg-slate-100 text-lg font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800">3</span>
              <div className="min-w-0"><p className="text-sm font-semibold">3. Storage location</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Scan or confirm location</p></div>
            </li>
          </ol>

          <section aria-label="Barcode scanner and received items" className="min-w-0 space-y-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
            <form onSubmit={handleScan} className="flex min-h-20 items-center gap-3 rounded-xl border-2 border-blue-600 px-4 shadow-[0_0_0_4px_rgba(37,99,235,0.06)] focus-within:ring-2 focus-within:ring-blue-200 sm:gap-4">
              <Barcode aria-hidden="true" className="size-9 shrink-0 text-slate-900 dark:text-slate-200" />
              <div className="h-9 w-px shrink-0 bg-slate-200 dark:bg-slate-700" />
              <label htmlFor="receiving-barcode" className="sr-only">Scan crate barcode</label>
              <input ref={inputRef} id="receiving-barcode" value={barcode} onChange={(event) => setBarcode(event.target.value)} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="Scan barcode here..." aria-describedby="scan-help" className="min-w-0 flex-1 bg-transparent py-5 text-base outline-none placeholder:text-slate-400 sm:text-xl dark:placeholder:text-slate-500" />
              <button type="submit" aria-label="Add scanned barcode" className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-2 text-xs font-medium text-slate-500 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-slate-400 dark:hover:bg-slate-800"><span className="hidden xl:inline">Press Enter</span><ArrowRight className="size-5" /></button>
            </form>
            <p id="scan-help" className="text-xs leading-5 text-slate-500 dark:text-slate-400">Preview codes: CRATE-001, CRATE-002, CRATE-003. Undo a crate, then scan its code to add it again.</p>
            {notice && (
              <div role={notice.kind === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${notice.kind === "error" ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200" : "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-200"}`}>{notice.text}</div>
            )}

            {lastScanned ? (
              <section aria-label="Latest scan" className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 sm:p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <h2 className="flex items-center gap-2 text-lg font-bold text-emerald-700 sm:text-xl dark:text-emerald-300"><CheckCircle2 aria-hidden="true" className="size-6 shrink-0" />Scan successful <span className="text-xs font-medium">(preview)</span></h2>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <ProductThumbnail kind={lastScanned.kind} large />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold sm:text-xl">{lastScanned.name}</h3>
                    <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                      <dt className="text-slate-500 dark:text-slate-400">Batch:</dt><dd className="break-all font-medium">{lastScanned.batch}</dd>
                      <dt className="text-slate-500 dark:text-slate-400">Net weight:</dt><dd className="font-medium">{kg(lastScanned.weightGrams)} kg</dd>
                      <dt className="text-slate-500 dark:text-slate-400">Location:</dt><dd className="font-medium">{lastScanned.location}</dd>
                    </dl>
                  </div>
                  <div className="hidden rounded-xl border border-emerald-100 bg-white p-4 text-center xl:block dark:border-slate-700 dark:bg-slate-900">
                    <ScanLine aria-hidden="true" className="mx-auto size-10 text-slate-600 dark:text-slate-300" />
                    <p className="mt-2 font-mono text-xs">{lastScanned.barcode}</p>
                  </div>
                </div>
              </section>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700"><ScanLine className="mx-auto size-8 text-slate-400" /><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Ready for your next scan</p></div>
            )}

            <div>
              <h2 className="mb-3 text-lg font-bold">Received items</h2>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full min-w-[590px] text-left text-sm">
                  <thead className="bg-slate-100 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"><tr><th scope="col" className="px-3 py-3 font-semibold">Item</th><th scope="col" className="px-3 py-3 font-semibold">Batch</th><th scope="col" className="px-3 py-3 font-semibold">Weight</th><th scope="col" className="px-3 py-3 font-semibold">Location</th><th scope="col" className="px-3 py-3 font-semibold">Status</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {crates.map((crate) => (
                      <tr key={crate.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-3 py-3"><div className="flex items-center gap-2.5"><ProductThumbnail kind={crate.kind} /><span className="font-medium">{crate.name}</span></div></td>
                        <td className="whitespace-nowrap px-3 py-3 text-slate-600 dark:text-slate-400">{crate.batch}</td>
                        <td className="whitespace-nowrap px-3 py-3 tabular-nums">{kg(crate.weightGrams)} kg</td>
                        <td className="whitespace-nowrap px-3 py-3">{crate.location}</td>
                        <td className="px-3 py-3"><span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-emerald-700 dark:text-emerald-400"><CheckCircle2 className="size-4" />Scanned</span></td>
                      </tr>
                    ))}
                    {!crates.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">No crates scanned yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          <p className="flex items-start gap-2 px-1 text-xs leading-5 text-slate-500 dark:text-slate-400"><Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />Preview only. Scans update this list; warehouse stock is unchanged.</p>
        </div>

        <aside aria-label="Receiving summary" className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:sticky lg:top-24 xl:p-6 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-base font-medium">Purchase order</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">PO-1028</h2>
          <div className="mt-6"><p className="text-sm font-semibold">Supplier</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Fresh Foods Supply</p><p className="mt-2 text-xs text-blue-600 dark:text-blue-400">Sample purchase order</p></div>
          <div className="my-6 h-px bg-slate-200 dark:bg-slate-700" />
          <dl className="space-y-5">
            <div className="flex items-center gap-3"><dt><ArrowDownToLine aria-hidden="true" className="size-6 text-slate-400" /><span className="sr-only">Crate count</span></dt><dd className="text-base"><strong className="tabular-nums">{crates.length}</strong> crates scanned</dd></div>
            <div className="flex items-center gap-3"><dt><Weight aria-hidden="true" className="size-6 text-slate-400" /><span className="sr-only">Received weight</span></dt><dd className="text-base"><strong className="tabular-nums">{kg(totalGrams)} kg</strong> received</dd></div>
          </dl>
          <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10"><AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-500" /><div><p className="text-xs font-bold text-amber-800 dark:text-amber-200">Check expiry before confirming</p><p className="mt-1 text-xs leading-5 text-amber-700 dark:text-amber-300">Verify batch expiry dates on labels.</p></div></div>
          <button type="button" disabled aria-describedby="confirm-help" className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"><Check className="size-5" />Confirm Receiving</button>
          <button type="button" onClick={undoLastScan} disabled={!crates.length} className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 text-sm font-medium text-slate-600 hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"><Undo2 className="size-5" />Undo last scan</button>
          <p id="confirm-help" className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">Confirmation will be available when the receiving API and storage-location checks are connected.</p>
        </aside>
      </div>
    </div>
  );
}
