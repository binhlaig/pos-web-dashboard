// "use client";
// import { formatShopDateTime, formatShopDate, formatShopTime, getShopTimezone, parseTimestamp } from "@/lib/date-time";
// import { useShopTimezone } from "@/components/shop-timezone-provider";
// import { formatHistoricalMoney } from "@/lib/currency";
// import { useEffect, useMemo, useState, useRef } from "react";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   Banknote,
//   CalendarDays,
//   ChevronLeft,
//   ChevronRight,
//   CreditCard,
//   Eye,
//   Loader2,
//   Printer,
//   ReceiptText,
//   RefreshCw,
//   Search,
//   ScanLine,
//   Camera,
//   Clock,
//   WalletCards,
//   X,
// } from "lucide-react";
// type PaymentFilter = "ALL" | "CASH" | "CARD" | "WALLET";
// type ViewMode = "RECENT" | "DATE" | "BARCODE";
// type ReceiptItem = {
//   id?: number | string;
//   productId?: number | string;
//   product_id?: number | string;
//   productName?: string;
//   product_name?: string;
//   name?: string;
//   qty?: number;
//   quantity?: number;
//   price?: number;
//   discountPercent?: number;
//   discount_percent?: number;
//   total?: number;
// };
// type Receipt = {
//   id?: number | string;
//   receiptNo?: string;
//   receipt_no?: string;
//   barcode?: string;
//   receiptBarcode?: string;
//   receipt_barcode?: string;
//   createdAt?: string;
//   created_at?: string;
//   customerName?: string;
//   customer_name?: string;
//   staffId?: string | number;
//   staff_id?: string | number;
//   staffName?: string;
//   staff_name?: string;
//   subtotal?: number;
//   taxAmount?: number;
//   tax_amount?: number;
//   serviceCharge?: number;
//   service_charge?: number;
//   discount?: number;
//   discountPercent?: number;
//   discount_percent?: number;
//   grandTotal?: number;
//   grand_total?: number;
//   total?: number;
//   paymentMethod?: string;
//   payment_method?: string;
//   cashReceived?: number;
//   cash_received?: number;
//   cashGiven?: number;
//   cash_given?: number;
//   change?: number;
//   changeAmount?: number;
//   change_amount?: number;
//   status?: string;
//   shopName?: string;
//   shop_name?: string;
//   shopAddress?: string;
//   shop_address?: string;
//   items?: ReceiptItem[];
//   receiptItems?: ReceiptItem[];
//   receipt_items?: ReceiptItem[];
// };
// const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
// const PAGE_SIZE = 10;
// function token() {
//   if (typeof window === "undefined") return null;
//   for (const key of ["pos_shop_owner_token", "pos_access_token", "access_token", "token", "jwt"]) {
//     const value = localStorage.getItem(key);
//     if (value) return value;
//   }
//   return null;
// }
// function normalizeList(payload: unknown): Receipt[] {
//   if (Array.isArray(payload)) return payload;
//   if (!payload || typeof payload !== "object") throw new Error("Unexpected receipts response");
//   const body = payload as Record<string, unknown>;
//   for (const key of ["receipts", "content", "data"]) {
//     if (Array.isArray(body[key])) return body[key] as Receipt[];
//     if (body[key] && typeof body[key] === "object") return normalizeList(body[key]);
//   }
//   throw new Error("Unexpected receipts response");
// }
// const RECENT_MS = 48 * 60 * 60 * 1000;
// // ISO calendar date in the shop timezone, independent of the device timezone.
// function calendarKey(timestamp: number, timezone: string) {
//   const parts = new Intl.DateTimeFormat("en-US", {
//     timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
//   }).formatToParts(new Date(timestamp));
//   const part = (name: string) => parts.find((p) => p.type === name)?.value ?? "";
//   return `${part("year")}-${part("month")}-${part("day")}`;
// }
// const normalizeBarcode = (code: string) => code.trim().toLowerCase();
// function barcodeMatches(receipt: Receipt, code: string) {
//   const expected = normalizeBarcode(code);
//   return [receipt.receiptNo, receipt.receipt_no, receipt.barcode, receipt.receiptBarcode, receipt.receipt_barcode]
//     .some((candidate) => candidate != null && normalizeBarcode(String(candidate)) === expected);
// }
// function escapeHtml(input: unknown) {
//   return String(input ?? "").replace(/[&<>"']/g, (char) => ({
//     "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
//   })[char]!);
// }

// const value = (receipt: Receipt) => Number(receipt.grandTotal ?? receipt.grand_total ?? receipt.total ?? 0);
// const number = (input: unknown) => Number(input ?? 0);
// const receiptNo = (receipt: Receipt) => receipt.receiptNo ?? receipt.receipt_no ?? `#${receipt.id ?? "—"}`;
// const receiptDate = (receipt: Receipt) => {
//   const timestamp = receipt.createdAt ?? receipt.created_at;
//   return timestamp ? parseTimestamp(timestamp) : new Date(NaN);
// };
// const method = (receipt: Receipt) => (receipt.paymentMethod ?? receipt.payment_method ?? "UNKNOWN").toUpperCase();
// const items = (receipt: Receipt) => receipt.items ?? receipt.receiptItems ?? receipt.receipt_items ?? [];
// export default function ReceiptsPage() {
//   const shopTimezone = useShopTimezone();
//   const money = (amount: number) => formatHistoricalMoney(amount);
//   const [receipts, setReceipts] = useState<Receipt[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [query, setQuery] = useState("");
//   const [payment, setPayment] = useState<PaymentFilter>("ALL");
//   const [mode, setMode] = useState<ViewMode>("RECENT");
//   const [now, setNow] = useState(() => Date.now());
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [range, setRange] = useState<{ from: string; to: string } | null>(null);
//   const [barcodeInput, setBarcodeInput] = useState("");
//   const [barcode, setBarcode] = useState("");
//   const [searchError, setSearchError] = useState("");
//   const [cameraOpen, setCameraOpen] = useState(false);
//   const barcodeRef = useRef<HTMLInputElement>(null);
//   const requestRef = useRef(0);
//   const [page, setPage] = useState(1);
//   const [selected, setSelected] = useState<Receipt | null>(null);
//   async function loadReceipts() {
//     const request = ++requestRef.current;
//     setLoading(true);
//     setError(null);
//     try {
//       const authToken = token();
//       const response = await fetch(`${API_BASE}/api/pos/receipts/shop`, {
//         headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
//         cache: "no-store",
//       });
//       if (!response.ok) throw new Error(`Unable to load receipts (${response.status})`);
//       const list = normalizeList(await response.json());
//       if (request !== requestRef.current) return;
//       setReceipts(list);
//       setNow(Date.now());
//     } catch (reason) {
//       if (request !== requestRef.current) return;
//       setError(reason instanceof Error ? reason.message : "Unable to load receipts");
//     } finally {
//       if (request === requestRef.current) setLoading(false);
//     }
//   }
//   useEffect(() => {
//     void loadReceipts();
//     const timer = window.setInterval(() => setNow(Date.now()), 30_000);
//     return () => { window.clearInterval(timer); requestRef.current++; };
//   }, []);
//   useEffect(() => { setPage(1); }, [query, payment, mode, range, barcode, shopTimezone]);
//   useEffect(() => { if (mode === "BARCODE") barcodeRef.current?.focus(); }, [mode]);
//   function switchMode(next: ViewMode) {
//     setMode(next); setQuery(""); setPayment("ALL"); setSearchError(""); setPage(1);
//     setBarcode(""); setBarcodeInput(""); setRange(null); setSelected(null);
//   }
//   function searchDates() {
//     if (!fromDate || !toDate) { setSearchError("Choose both start and end dates."); return; }
//     if (fromDate > toDate) { setSearchError("End date must be on or after start date."); return; }
//     setSearchError(""); setRange({ from: fromDate, to: toDate });
//     setQuery(""); setPayment("ALL"); setPage(1);
//   }
//   function searchBarcode(input: string) {
//     const code = input.trim();
//     if (!code || loading || error) return;
//     setMode("BARCODE"); setBarcodeInput(code); setBarcode(code);
//     setQuery(""); setPayment("ALL"); setSearchError(""); setPage(1);
//     const matches = receipts.filter((receipt) => barcodeMatches(receipt, code));
//     if (matches.length === 1) setSelected(matches[0]);
//     else setSelected(null);
//   }
//   const filtered = useMemo(() => {
//     const timezone = getShopTimezone();
//     const normalizedQuery = query.trim().toLowerCase();
//     return receipts.filter((receipt) => {
//       const timestamp = receiptDate(receipt).getTime();
//       let matchesScope = false;
//       if (mode === "RECENT") matchesScope = Number.isFinite(timestamp) && timestamp >= now - RECENT_MS && timestamp <= now;
//       if (mode === "DATE" && range && Number.isFinite(timestamp)) {
//         const day = calendarKey(timestamp, timezone);
//         matchesScope = day >= range.from && day <= range.to;
//       }
//       if (mode === "BARCODE" && barcode) matchesScope = barcodeMatches(receipt, barcode);
//       const searchable = [receiptNo(receipt), receipt.customerName, receipt.customer_name,
//         receipt.staffName, receipt.staff_name, receipt.staffId, receipt.staff_id].join(" ").toLowerCase();
//       return matchesScope && (payment === "ALL" || method(receipt) === payment)
//         && (!normalizedQuery || searchable.includes(normalizedQuery));
//     }).sort((a, b) => (receiptDate(b).getTime() || 0) - (receiptDate(a).getTime() || 0));
//   }, [receipts, query, payment, mode, range, barcode, shopTimezone, now]);
//   const scopeLabel = mode === "RECENT" ? "Last 48 hours"
//     : mode === "DATE" ? (range ? `${range.from} — ${range.to}` : "Search receipts by date")
//     : barcode ? `Barcode: ${barcode}` : "Scan or enter a receipt barcode";
//   const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
//   const currentPage = Math.min(page, pageCount);
//   const visible = loading || error ? [] : mode === "DATE"
//     ? filtered
//     : filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
//   const totalSales = filtered.reduce((sum, receipt) => sum + value(receipt), 0);
//   const cashSales = filtered.filter((receipt) => method(receipt) === "CASH").reduce((sum, receipt) => sum + value(receipt), 0);
//   const cardSales = filtered.filter((receipt) => method(receipt) === "CARD").reduce((sum, receipt) => sum + value(receipt), 0);
//   function printReceipt(receipt: Receipt) {
//     const money = (amount: number) => formatHistoricalMoney(amount, receipt);
//     const popup = window.open("", "_blank", "width=420,height=720");
//     if (!popup) return;
//     const rows = items(receipt).map((item) => {
//       const name = item.productName ?? item.product_name ?? item.name ?? `Product #${item.productId ?? item.product_id ?? "—"}`;
//       const qty = number(item.qty ?? item.quantity);
//       const price = number(item.price);
//       return `<tr><td>${escapeHtml(name)}</td><td style="text-align:center">${qty}</td><td style="text-align:right">${money(price * qty)}</td></tr>`;
//     }).join("");
//     popup.document.write(`<!doctype html><html><head><title>${escapeHtml(receiptNo(receipt))}</title><style>body{font-family:Arial,sans-serif;width:320px;margin:24px auto;color:#111}h2,p{text-align:center;margin:5px}table{width:100%;border-collapse:collapse;margin:18px 0}th,td{padding:7px 2px;border-bottom:1px dashed #aaa;font-size:12px}.line{display:flex;justify-content:space-between;margin:7px 0}.total{font-size:18px;font-weight:700;border-top:2px solid #111;padding-top:10px}</style></head><body><h2>${escapeHtml(receipt.shopName ?? receipt.shop_name ?? "POS Receipt")}</h2><p>${escapeHtml(receipt.shopAddress ?? receipt.shop_address ?? "")}</p><p>${escapeHtml(receiptNo(receipt))}</p><p>${formatShopDateTime(receipt.createdAt ?? receipt.created_at, getShopTimezone(), undefined, undefined)}</p><table><thead><tr><th style="text-align:left">Item</th><th>Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rows || '<tr><td colspan="3">No item details</td></tr>'}</tbody></table><div class="line"><span>Subtotal</span><b>${money(number(receipt.subtotal))}</b></div><div class="line"><span>Tax</span><b>${money(number(receipt.taxAmount ?? receipt.tax_amount))}</b></div><div class="line total"><span>Total</span><span>${formatHistoricalMoney(value(receipt), receipt)}</span></div><div class="line"><span>Payment</span><span>${method(receipt)}</span></div><p style="margin-top:24px">Thank you!</p><script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</script></body></html>`);
//     popup.document.close();
//   }
//   return (
//     <section className="py-5">
//       <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
//         <div>
//           <div className="flex items-center gap-3">
//             <Link href="/dashboard" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-black dark:text-slate-300"><ArrowLeft size={17} /></Link>
//             <div><h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Receipts</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Last 48 hours by default. Find older receipts by date or barcode.</p></div>
//           </div>
//         </div>
//         <button type="button" onClick={() => void loadReceipts()} disabled={loading} className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-black dark:text-slate-200">
//           <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
//         </button>
//       </div>
//       {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{error}. Please sign in again and check the API URL.</div>}
//       <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-black">
//         <div className="flex flex-wrap gap-2" role="group" aria-label="Receipt search mode">
//           {([{ key: "RECENT", label: "Last 48 Hours", icon: Clock }, { key: "DATE", label: "Date Search", icon: CalendarDays }, { key: "BARCODE", label: "Barcode Search", icon: ScanLine }] as const).map(({ key, label, icon: Icon }) => (
//             <button key={key} type="button" onClick={() => switchMode(key)} aria-pressed={mode === key} className={`flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold ${mode === key ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}><Icon size={17} />{label}</button>
//           ))}
//         </div>
//         <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{mode === "RECENT" ? "Recent receipts only. Older transactions remain available in Date Search and Barcode Search." : `Dates and times use the shop timezone: ${getShopTimezone()}.`}</p>
//         {mode === "DATE" && <form onSubmit={(event) => { event.preventDefault(); searchDates(); }} className="mt-4 flex flex-wrap items-end gap-3">
//           <label className="flex flex-col gap-1 text-xs text-slate-500">From date<input type="date" required value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-transparent px-3 text-sm dark:border-white/10 dark:text-white" /></label>
//           <label className="flex flex-col gap-1 text-xs text-slate-500">To date<input type="date" required min={fromDate || undefined} value={toDate} onChange={(event) => setToDate(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-transparent px-3 text-sm dark:border-white/10 dark:text-white" /></label>
//           <button disabled={loading || !!error} className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white disabled:opacity-40"><Search size={17} />Search</button>
//         </form>}
//         {mode === "BARCODE" && <form onSubmit={(event) => { event.preventDefault(); searchBarcode(barcodeInput); }} className="mt-4 flex flex-wrap gap-2">
//           <label className="min-w-0 flex-1"><span className="sr-only">Receipt barcode or receipt number</span><input ref={barcodeRef} value={barcodeInput} onChange={(event) => setBarcodeInput(event.target.value)} autoComplete="off" placeholder="Scan barcode here, then Enter / Search" className="h-11 w-full rounded-xl border border-slate-200 bg-transparent px-3 text-sm dark:border-white/10 dark:text-white" /></label>
//           <button disabled={loading || !!error || !barcodeInput.trim()} className="flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-40"><Search size={17} />Search</button>
//           <button type="button" disabled={loading || !!error} onClick={() => setCameraOpen(true)} className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300 disabled:opacity-40"><Camera size={17} />Camera Scan</button>
//           <p className="w-full text-xs text-slate-500">USB / Bluetooth scanner: select the input and scan. Search matches the full receipt number or receipt barcode across all loaded dates.</p>
//         </form>}
//         {searchError && <p role="alert" className="mt-3 text-sm text-red-600">{searchError}</p>}
//       </div>
//       <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300"><ReceiptText size={17} />{scopeLabel}</div>
//       <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         <Stat title="Total Sales" value={loading || error ? "—" : money(totalSales)} icon={ReceiptText} color="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" />
//         <Stat title="Transactions" value={loading || error ? "—" : filtered.length.toLocaleString()} icon={CalendarDays} color="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400" />
//         <Stat title="Cash Sales" value={loading || error ? "—" : money(cashSales)} icon={Banknote} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" />
//         <Stat title="Card Sales" value={loading || error ? "—" : money(cardSales)} icon={CreditCard} color="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400" />
//       </div>
//       <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-black">
//         <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between">
//           <div className="relative w-full lg:max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Receipt, staff or customer..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-white" /></div>
//           <div className="flex flex-wrap gap-2">

//             <select value={payment} onChange={(event) => setPayment(event.target.value as PaymentFilter)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none dark:border-white/10 dark:bg-black dark:text-slate-300"><option value="ALL">All payments</option><option value="CASH">Cash</option><option value="CARD">Card</option><option value="WALLET">Wallet</option></select>
//           </div>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[900px]">
//             <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500 dark:bg-white/[0.04] dark:text-slate-400"><tr><th className="px-5 py-3">Receipt</th><th className="px-4 py-3">Date & Time</th><th className="px-4 py-3">Staff</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Total</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
//             <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
//               {visible.map((receipt, index) => <tr key={receipt.id ?? receiptNo(receipt) ?? index} className="text-xs hover:bg-slate-50 dark:hover:bg-white/[0.04]"><td className="px-5 py-4 font-semibold text-blue-600">{receiptNo(receipt)}</td><td className="px-4 py-4 text-slate-600 dark:text-slate-300"><div>{formatShopDate(receipt.createdAt ?? receipt.created_at, getShopTimezone(), undefined, undefined)}</div><div className="mt-0.5 text-[10px] text-slate-400">{formatShopTime(receipt.createdAt ?? receipt.created_at, getShopTimezone(), { hour: "2-digit", minute: "2-digit" }, [])}</div></td><td className="px-4 py-4 text-slate-700 dark:text-slate-200"><div>{receipt.staffName ?? receipt.staff_name ?? "—"}</div><div className="mt-0.5 text-[10px] text-slate-400">ID: {receipt.staffId ?? receipt.staff_id ?? "—"}</div></td><td className="px-4 py-4"><PaymentBadge payment={method(receipt)} /></td><td className="px-4 py-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">{receipt.status ?? "PAID"}</span></td><td className="px-4 py-4 text-right text-sm font-bold text-slate-950 dark:text-white">{formatHistoricalMoney(value(receipt), receipt)}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => setSelected(receipt)} title="View receipt" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300"><Eye size={15} /></button><button type="button" onClick={() => printReceipt(receipt)} title="Reprint receipt" className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700"><Printer size={15} /></button></div></td></tr>)}
//               {loading && <tr><td colSpan={7} className="py-14 text-center text-sm text-slate-400"><Loader2 className="mx-auto mb-2 animate-spin" size={24} />Loading receipts...</td></tr>}
//               {!loading && !error && visible.length === 0 && <tr><td colSpan={7} className="py-14 text-center text-sm text-slate-400"><ReceiptText className="mx-auto mb-2" size={28} />{mode === "DATE" && !range ? "Choose a date range and press Search." : mode === "BARCODE" && !barcode ? "Scan a receipt barcode or enter its number." : "No receipts found for this search."}</td></tr>}
//             </tbody>
//           </table>
//         </div>
//         <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-xs text-slate-500 dark:border-white/10"><span>{mode === "DATE" ? `Showing all ${visible.length} matching receipts` : `Showing ${visible.length} of ${filtered.length} receipts`}</span>{mode !== "DATE" && <div className="flex items-center gap-2"><button type="button" disabled={currentPage === 1} onClick={() => setPage(() => Math.max(1, currentPage - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40 dark:border-white/10"><ChevronLeft size={15} /></button><span>Page {currentPage} / {pageCount}</span><button type="button" disabled={currentPage === pageCount} onClick={() => setPage(() => Math.min(pageCount, currentPage + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40 dark:border-white/10"><ChevronRight size={15} /></button></div>}</div>
//       </div>
//       {cameraOpen && <CameraScanner onClose={() => { setCameraOpen(false); barcodeRef.current?.focus(); }} onScan={(code) => { setCameraOpen(false); searchBarcode(code); }} />}
//       {selected && <ReceiptDialog receipt={selected} onClose={() => setSelected(null)} onPrint={() => printReceipt(selected)} />}
//     </section>
//   );
// }
// function Stat({ title, value: amount, icon: Icon, color }: { title: string; value: string; icon: typeof ReceiptText; color: string }) {
//   return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500 dark:text-slate-400">{title}</p><p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{amount}</p></div><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}><Icon size={21} /></div></div></article>;
// }
// function PaymentBadge({ payment }: { payment: string }) {
//   const Icon = payment === "CASH" ? Banknote : payment === "CARD" ? CreditCard : WalletCards;
//   return <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300"><Icon size={13} />{payment.replaceAll("_", " ")}</span>;
// }
// function ReceiptDialog({ receipt, onClose, onPrint }: { receipt: Receipt; onClose: () => void; onPrint: () => void }) {
//   const money = (amount: number) => formatHistoricalMoney(amount, receipt);
//   return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-950"><div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-slate-950"><div><h2 className="font-bold text-slate-950 dark:text-white">Receipt Details</h2><p className="mt-0.5 text-xs text-blue-600">{receiptNo(receipt)}</p></div><button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/10"><X size={18} /></button></div><div className="p-5"><div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-xs dark:bg-white/[0.04]"><Detail label="Date" value={formatShopDateTime(receipt.createdAt ?? receipt.created_at, getShopTimezone(), undefined, undefined)} /><Detail label="Staff" value={receipt.staffName ?? receipt.staff_name ?? "—"} /><Detail label="Staff ID" value={String(receipt.staffId ?? receipt.staff_id ?? "—")} /><Detail label="Payment" value={method(receipt)} /></div><div className="mt-5 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10"><table className="w-full"><thead className="bg-slate-50 text-left text-[11px] text-slate-500 dark:bg-white/[0.04]"><tr><th className="px-3 py-2.5">Item</th><th className="px-3 py-2.5 text-center">Qty</th><th className="px-3 py-2.5 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100 text-xs dark:divide-white/[0.06]">{items(receipt).map((item, index) => { const qty = number(item.qty ?? item.quantity); return <tr key={item.id ?? index}><td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-200">{item.productName ?? item.product_name ?? item.name ?? `Product #${item.productId ?? item.product_id ?? "—"}`}</td><td className="px-3 py-3 text-center text-slate-500">{qty}</td><td className="px-3 py-3 text-right font-semibold dark:text-white">{money(number(item.total) || number(item.price) * qty)}</td></tr>; })}{items(receipt).length === 0 && <tr><td colSpan={3} className="py-7 text-center text-slate-400">No item details</td></tr>}</tbody></table></div><div className="ml-auto mt-5 w-full max-w-xs space-y-2 text-sm"><Amount receipt={receipt} label="Subtotal" amount={number(receipt.subtotal)} /><Amount receipt={receipt} label="Tax" amount={number(receipt.taxAmount ?? receipt.tax_amount)} /><Amount receipt={receipt} label="Service charge" amount={number(receipt.serviceCharge ?? receipt.service_charge)} /><Amount receipt={receipt} label="Discount" amount={number(receipt.discount)} /><div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold dark:border-white/10"><span>Total</span><span className="text-blue-600">{formatHistoricalMoney(value(receipt), receipt)}</span></div>{method(receipt) === "CASH" && <><Amount receipt={receipt} label="Cash received" amount={number(receipt.cashReceived ?? receipt.cash_received ?? receipt.cashGiven ?? receipt.cash_given)} /><Amount receipt={receipt} label="Change" amount={number(receipt.change ?? receipt.changeAmount ?? receipt.change_amount)} /></>}</div></div><div className="flex justify-end gap-2 border-t border-slate-200 p-4 dark:border-white/10"><button type="button" onClick={onClose} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold dark:border-white/10">Close</button><button type="button" onClick={onPrint} className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"><Printer size={16} />Reprint</button></div></div></div>;
// }
// function Detail({ label, value: text }: { label: string; value: string }) {
// return <div><p className="text-slate-400">{label}</p><p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{text}</p></div>; }
// function Amount({ label, amount, receipt }: { label: string; amount: number; receipt?: unknown }) {
//   const money = (amount: number) => formatHistoricalMoney(amount, receipt);
// return <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>{label}</span><span className="font-semibold">{money(amount)}</span></div>; }

// // Native detector requires a supported browser and HTTPS. No extra package needed.
// type BarcodeDetectorInstance = { detect: (video: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> };
// type BarcodeDetectorConstructor = { new(options: { formats: string[] }): BarcodeDetectorInstance; getSupportedFormats: () => Promise<string[]> };
// function CameraScanner({ onClose, onScan }: { onClose: () => void; onScan: (code: string) => void }) {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const scanRef = useRef(onScan);
//   scanRef.current = onScan;
//   const [message, setMessage] = useState("Starting camera...");
//   useEffect(() => {
//     let stopped = false;
//     let stream: MediaStream | null = null;
//     let timer: ReturnType<typeof setTimeout> | undefined;
//     const stopCamera = () => stream?.getTracks().forEach((track) => track.stop());
//     async function start() {
//       try {
//         const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
//         if (!Detector) throw new Error("Camera barcode scanning is unavailable in this browser. Use a USB / Bluetooth scanner or enter the receipt number.");
//         if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera access requires HTTPS and a supported browser.");
//         const supported = await Detector.getSupportedFormats();
//         const formats = ["code_128", "code_39", "ean_13", "ean_8", "qr_code", "itf", "upc_a", "upc_e", "codabar"].filter((format) => supported.includes(format));
//         if (!formats.length) throw new Error("No supported barcode formats. Use a scanner or enter the receipt number.");
//         if (stopped) return;
//         const detector = new Detector({ formats });
//         stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: "environment" } } });
//         if (stopped) { stopCamera(); return; }
//         const video = videoRef.current;
//         if (!video) { stopCamera(); return; }
//         video.srcObject = stream;
//         await video.play();
//         if (stopped) return;
//         setMessage("Point the camera at the receipt barcode.");
//         async function detect() {
//           if (stopped) return;
//           try {
//             const codes = await detector.detect(video!);
//             if (stopped) return;
//             const code = codes.find((entry) => entry.rawValue.trim())?.rawValue;
//             if (code) { stopped = true; stopCamera(); scanRef.current(code); return; }
//           } catch {
//             if (stopped) return;
//             stopCamera();
//             setMessage("Unable to scan with this camera. Close and use a scanner or enter the receipt number.");
//             return;
//           }
//           timer = setTimeout(() => { void detect(); }, 180);
//         }
//         void detect();
//       } catch (reason) {
//         stopCamera();
//         if (!stopped) setMessage(reason instanceof Error ? reason.message : "Camera access failed. Check camera permission or enter the receipt number.");
//       }
//     }
//     void start();
//     return () => { stopped = true; if (timer) clearTimeout(timer); stopCamera(); };
//   }, []);
//   useEffect(() => {
//     const handler = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
//     window.addEventListener("keydown", handler);
//     return () => window.removeEventListener("keydown", handler);
//   }, [onClose]);
//   return <div role="dialog" aria-modal="true" aria-label="Scan receipt barcode" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
//     <div className="w-full max-w-lg rounded-2xl bg-white p-5 dark:bg-slate-950">
//       <div className="mb-4 flex items-center justify-between"><h2 className="font-bold dark:text-white">Scan Receipt Barcode</h2><button type="button" autoFocus onClick={onClose} aria-label="Close camera" className="rounded-xl p-3 dark:text-white"><X size={20} /></button></div>
//       <video ref={videoRef} playsInline muted className="aspect-video w-full rounded-xl bg-black object-cover" />
//       <p role="status" className="mt-3 text-sm text-slate-500">{message}</p>
//       <button type="button" onClick={onClose} className="mt-4 min-h-11 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white">Close / Enter Receipt Number</button>
//     </div>
//   </div>;
// }











"use client";
import { formatShopDateTime, formatShopDate, formatShopTime, getShopTimezone, parseTimestamp } from "@/lib/date-time";
import { useShopTimezone } from "@/components/shop-timezone-provider";
import { formatHistoricalMoney } from "@/lib/currency";
import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Loader2,
  Printer,
  ReceiptText,
  RefreshCw,
  Search,
  ScanLine,
  Camera,
  Clock,
  WalletCards,
  X,
} from "lucide-react";
type PaymentFilter = "ALL" | "CASH" | "CARD" | "WALLET";
type ViewMode = "RECENT" | "DATE" | "BARCODE";
type ReceiptItem = {
  id?: number | string;
  productId?: number | string;
  product_id?: number | string;
  productName?: string;
  product_name?: string;
  name?: string;
  qty?: number;
  quantity?: number;
  price?: number;
  discountPercent?: number;
  discount_percent?: number;
  total?: number;
};
type Receipt = {
  id?: number | string;
  receiptNo?: string;
  receipt_no?: string;
  barcode?: string;
  receiptBarcode?: string;
  receipt_barcode?: string;
  createdAt?: string;
  created_at?: string;
  customerName?: string;
  customer_name?: string;
  staffId?: string | number;
  staff_id?: string | number;
  staffName?: string;
  staff_name?: string;
  subtotal?: number;
  taxAmount?: number;
  tax_amount?: number;
  serviceCharge?: number;
  service_charge?: number;
  discount?: number;
  discountPercent?: number;
  discount_percent?: number;
  grandTotal?: number;
  grand_total?: number;
  total?: number;
  paymentMethod?: string;
  payment_method?: string;
  cashReceived?: number;
  cash_received?: number;
  cashGiven?: number;
  cash_given?: number;
  change?: number;
  changeAmount?: number;
  change_amount?: number;
  status?: string;
  shopName?: string;
  shop_name?: string;
  shopAddress?: string;
  shop_address?: string;
  items?: ReceiptItem[];
  receiptItems?: ReceiptItem[];
  receipt_items?: ReceiptItem[];
};
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const PAGE_SIZE = 10;
function token() {
  if (typeof window === "undefined") return null;
  for (const key of ["pos_shop_owner_token", "pos_access_token", "access_token", "token", "jwt"]) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  return null;
}
function normalizeList(payload: unknown): Receipt[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") throw new Error("Unexpected receipts response");
  const body = payload as Record<string, unknown>;
  for (const key of ["receipts", "content", "data"]) {
    if (Array.isArray(body[key])) return body[key] as Receipt[];
    if (body[key] && typeof body[key] === "object") return normalizeList(body[key]);
  }
  throw new Error("Unexpected receipts response");
}
const RECENT_MS = 48 * 60 * 60 * 1000;
// ISO calendar date in the shop timezone, independent of the device timezone.
function calendarKey(timestamp: number, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(timestamp));
  const part = (name: string) => parts.find((p) => p.type === name)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
const normalizeBarcode = (code: string) => code.trim().toLowerCase();
function barcodeMatches(receipt: Receipt, code: string) {
  const expected = normalizeBarcode(code);
  return [receipt.receiptNo, receipt.receipt_no, receipt.barcode, receipt.receiptBarcode, receipt.receipt_barcode]
    .some((candidate) => candidate != null && normalizeBarcode(String(candidate)) === expected);
}
function escapeHtml(input: unknown) {
  return String(input ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]!);
}

const value = (receipt: Receipt) => Number(receipt.grandTotal ?? receipt.grand_total ?? receipt.total ?? 0);
const number = (input: unknown) => Number(input ?? 0);
const receiptNo = (receipt: Receipt) => receipt.receiptNo ?? receipt.receipt_no ?? `#${receipt.id ?? "—"}`;
const receiptDate = (receipt: Receipt) => {
  const timestamp = receipt.createdAt ?? receipt.created_at;
  return timestamp ? parseTimestamp(timestamp) : new Date(NaN);
};
const method = (receipt: Receipt) => (receipt.paymentMethod ?? receipt.payment_method ?? "UNKNOWN").toUpperCase();
const items = (receipt: Receipt) => receipt.items ?? receipt.receiptItems ?? receipt.receipt_items ?? [];
export default function ReceiptsPage() {
  const shopTimezone = useShopTimezone();
  const money = (amount: number) => formatHistoricalMoney(amount);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState<PaymentFilter>("ALL");
  const [mode, setMode] = useState<ViewMode>("RECENT");
  const [now, setNow] = useState(() => Date.now());
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcode, setBarcode] = useState("");
  const [searchError, setSearchError] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Receipt | null>(null);
  async function loadReceipts() {
    const request = ++requestRef.current;
    setLoading(true);
    setError(null);
    try {
      const authToken = token();
      const response = await fetch(`${API_BASE}/api/pos/receipts/shop`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Unable to load receipts (${response.status})`);
      const list = normalizeList(await response.json());
      if (request !== requestRef.current) return;
      setReceipts(list);
      setNow(Date.now());
    } catch (reason) {
      if (request !== requestRef.current) return;
      setError(reason instanceof Error ? reason.message : "Unable to load receipts");
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }
  useEffect(() => {
    void loadReceipts();
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => { window.clearInterval(timer); requestRef.current++; };
  }, []);
  useEffect(() => { setPage(1); }, [query, payment, mode, range, barcode, shopTimezone]);
  useEffect(() => { if (mode === "BARCODE") barcodeRef.current?.focus(); }, [mode]);
  function switchMode(next: ViewMode) {
    setMode(next); setQuery(""); setPayment("ALL"); setSearchError(""); setPage(1);
    setBarcode(""); setBarcodeInput(""); setRange(null); setSelected(null);
  }
  function searchDates() {
    if (!fromDate || !toDate) { setSearchError("Choose both start and end dates."); return; }
    if (fromDate > toDate) { setSearchError("End date must be on or after start date."); return; }
    setSearchError(""); setRange({ from: fromDate, to: toDate });
    setQuery(""); setPayment("ALL"); setPage(1);
  }
  function searchBarcode(input: string) {
    const code = input.trim();
    if (!code || loading || error) return;
    setMode("BARCODE"); setBarcodeInput(code); setBarcode(code);
    setQuery(""); setPayment("ALL"); setSearchError(""); setPage(1);
    const matches = receipts.filter((receipt) => barcodeMatches(receipt, code));
    if (matches.length === 1) setSelected(matches[0]);
    else setSelected(null);
  }
  const filtered = useMemo(() => {
    const timezone = getShopTimezone();
    const normalizedQuery = query.trim().toLowerCase();
    return receipts.filter((receipt) => {
      const timestamp = receiptDate(receipt).getTime();
      let matchesScope = false;
      if (mode === "RECENT") matchesScope = Number.isFinite(timestamp) && timestamp >= now - RECENT_MS && timestamp <= now;
      if (mode === "DATE" && range && Number.isFinite(timestamp)) {
        const day = calendarKey(timestamp, timezone);
        matchesScope = day >= range.from && day <= range.to;
      }
      if (mode === "BARCODE" && barcode) matchesScope = barcodeMatches(receipt, barcode);
      const searchable = [receiptNo(receipt), receipt.customerName, receipt.customer_name,
        receipt.staffName, receipt.staff_name, receipt.staffId, receipt.staff_id].join(" ").toLowerCase();
      return matchesScope && (payment === "ALL" || method(receipt) === payment)
        && (!normalizedQuery || searchable.includes(normalizedQuery));
    }).sort((a, b) => (receiptDate(b).getTime() || 0) - (receiptDate(a).getTime() || 0));
  }, [receipts, query, payment, mode, range, barcode, shopTimezone, now]);
  const scopeLabel = mode === "RECENT" ? "Last 48 hours"
    : mode === "DATE" ? (range ? `${range.from} — ${range.to}` : "Search receipts by date")
    : barcode ? `Barcode: ${barcode}` : "Scan or enter a receipt barcode";
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = loading || error ? [] : mode === "DATE"
    ? filtered
    : filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalSales = filtered.reduce((sum, receipt) => sum + value(receipt), 0);
  const cashSales = filtered.filter((receipt) => method(receipt) === "CASH").reduce((sum, receipt) => sum + value(receipt), 0);
  const cardSales = filtered.filter((receipt) => method(receipt) === "CARD").reduce((sum, receipt) => sum + value(receipt), 0);
  function printReceipt(receipt: Receipt) {
    const money = (amount: number) => formatHistoricalMoney(amount, receipt);
    const popup = window.open("", "_blank", "width=420,height=720");
    if (!popup) return;
    const rows = items(receipt).map((item) => {
      const name = item.productName ?? item.product_name ?? item.name ?? `Product #${item.productId ?? item.product_id ?? "—"}`;
      const qty = number(item.qty ?? item.quantity);
      const price = number(item.price);
      return `<tr><td>${escapeHtml(name)}</td><td style="text-align:center">${qty}</td><td style="text-align:right">${money(price * qty)}</td></tr>`;
    }).join("");
    popup.document.write(`<!doctype html><html><head><title>${escapeHtml(receiptNo(receipt))}</title><style>body{font-family:Arial,sans-serif;width:320px;margin:24px auto;color:#111}h2,p{text-align:center;margin:5px}table{width:100%;border-collapse:collapse;margin:18px 0}th,td{padding:7px 2px;border-bottom:1px dashed #aaa;font-size:12px}.line{display:flex;justify-content:space-between;margin:7px 0}.total{font-size:18px;font-weight:700;border-top:2px solid #111;padding-top:10px}</style></head><body><h2>${escapeHtml(receipt.shopName ?? receipt.shop_name ?? "POS Receipt")}</h2><p>${escapeHtml(receipt.shopAddress ?? receipt.shop_address ?? "")}</p><p>${escapeHtml(receiptNo(receipt))}</p><p>${formatShopDateTime(receipt.createdAt ?? receipt.created_at, getShopTimezone(), undefined, undefined)}</p><table><thead><tr><th style="text-align:left">Item</th><th>Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rows || '<tr><td colspan="3">No item details</td></tr>'}</tbody></table><div class="line"><span>Subtotal</span><b>${money(number(receipt.subtotal))}</b></div><div class="line"><span>Tax</span><b>${money(number(receipt.taxAmount ?? receipt.tax_amount))}</b></div><div class="line total"><span>Total</span><span>${formatHistoricalMoney(value(receipt), receipt)}</span></div><div class="line"><span>Payment</span><span>${method(receipt)}</span></div><p style="margin-top:24px">Thank you!</p><script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</script></body></html>`);
    popup.document.close();
  }
  return (
    <section className="py-5">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-black dark:text-slate-300"><ArrowLeft size={17} /></Link>
            <div><h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Receipts</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">View and reprint shop receipts.</p></div>
          </div>
        </div>
        <button type="button" onClick={() => void loadReceipts()} disabled={loading} className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-black dark:text-slate-200">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>
      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{error}. Please sign in again and check the API URL.</div>}

      {/* Mode tabs */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10">
        <div className="flex gap-1" role="tablist" aria-label="Receipt search mode">
          {([
            { key: "RECENT", label: "Last 48 Hours", icon: Clock },
            { key: "DATE", label: "Date", icon: CalendarDays },
            { key: "BARCODE", label: "Barcode", icon: ScanLine },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              onClick={() => switchMode(key)}
              className={`-mb-px flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-medium transition-colors ${
                mode === key
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
        <span className="pb-2 text-xs text-slate-400">{getShopTimezone()}</span>
      </div>

      {/* Date search */}
      {mode === "DATE" && (
        <form
          onSubmit={(event) => { event.preventDefault(); searchDates(); }}
          className="mb-4 flex flex-wrap items-center gap-2"
        >
          <input
            type="date"
            required
            aria-label="From date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-black dark:text-white"
          />
          <span className="text-sm text-slate-400">–</span>
          <input
            type="date"
            required
            aria-label="To date"
            min={fromDate || undefined}
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-black dark:text-white"
          />
          <button
            disabled={loading || !!error}
            className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
          >
            <Search size={16} />Search
          </button>
        </form>
      )}

      {/* Barcode search */}
      {mode === "BARCODE" && (
        <form
          onSubmit={(event) => { event.preventDefault(); searchBarcode(barcodeInput); }}
          className="mb-4 flex flex-wrap gap-2"
        >
          <label className="min-w-0 flex-1 sm:max-w-md">
            <span className="sr-only">Receipt barcode or receipt number</span>
            <div className="relative">
              <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                ref={barcodeRef}
                value={barcodeInput}
                onChange={(event) => setBarcodeInput(event.target.value)}
                autoComplete="off"
                placeholder="Scan or type receipt number"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-black dark:text-white"
              />
            </div>
          </label>
          <button
            disabled={loading || !!error || !barcodeInput.trim()}
            className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
          >
            <Search size={16} />Search
          </button>
          <button
            type="button"
            disabled={loading || !!error}
            onClick={() => setCameraOpen(true)}
            className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <Camera size={16} />Camera
          </button>
        </form>
      )}

      {searchError && <p role="alert" className="mb-3 text-sm text-red-600">{searchError}</p>}

      {/* Result summary */}
      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">{scopeLabel}</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Total Sales" value={loading || error ? "—" : money(totalSales)} icon={ReceiptText} color="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" />
        <Stat title="Transactions" value={loading || error ? "—" : filtered.length.toLocaleString()} icon={CalendarDays} color="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400" />
        <Stat title="Cash Sales" value={loading || error ? "—" : money(cashSales)} icon={Banknote} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" />
        <Stat title="Card Sales" value={loading || error ? "—" : money(cardSales)} icon={CreditCard} color="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400" />
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-black">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Receipt, staff or customer..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-white" /></div>
          <div className="flex flex-wrap gap-2">

            <select value={payment} onChange={(event) => setPayment(event.target.value as PaymentFilter)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none dark:border-white/10 dark:bg-black dark:text-slate-300"><option value="ALL">All payments</option><option value="CASH">Cash</option><option value="CARD">Card</option><option value="WALLET">Wallet</option></select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500 dark:bg-white/[0.04] dark:text-slate-400"><tr><th className="px-5 py-3">Receipt</th><th className="px-4 py-3">Date & Time</th><th className="px-4 py-3">Staff</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Total</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {visible.map((receipt, index) => <tr key={receipt.id ?? receiptNo(receipt) ?? index} className="text-xs hover:bg-slate-50 dark:hover:bg-white/[0.04]"><td className="px-5 py-4 font-semibold text-blue-600">{receiptNo(receipt)}</td><td className="px-4 py-4 text-slate-600 dark:text-slate-300"><div>{formatShopDate(receipt.createdAt ?? receipt.created_at, getShopTimezone(), undefined, undefined)}</div><div className="mt-0.5 text-[10px] text-slate-400">{formatShopTime(receipt.createdAt ?? receipt.created_at, getShopTimezone(), { hour: "2-digit", minute: "2-digit" }, [])}</div></td><td className="px-4 py-4 text-slate-700 dark:text-slate-200"><div>{receipt.staffName ?? receipt.staff_name ?? "—"}</div><div className="mt-0.5 text-[10px] text-slate-400">ID: {receipt.staffId ?? receipt.staff_id ?? "—"}</div></td><td className="px-4 py-4"><PaymentBadge payment={method(receipt)} /></td><td className="px-4 py-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">{receipt.status ?? "PAID"}</span></td><td className="px-4 py-4 text-right text-sm font-bold text-slate-950 dark:text-white">{formatHistoricalMoney(value(receipt), receipt)}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => setSelected(receipt)} title="View receipt" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300"><Eye size={15} /></button><button type="button" onClick={() => printReceipt(receipt)} title="Reprint receipt" className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700"><Printer size={15} /></button></div></td></tr>)}
              {loading && <tr><td colSpan={7} className="py-14 text-center text-sm text-slate-400"><Loader2 className="mx-auto mb-2 animate-spin" size={24} />Loading receipts...</td></tr>}
              {!loading && !error && visible.length === 0 && <tr><td colSpan={7} className="py-14 text-center text-sm text-slate-400"><ReceiptText className="mx-auto mb-2" size={28} />{mode === "DATE" && !range ? "Choose a date range and press Search." : mode === "BARCODE" && !barcode ? "Scan a receipt barcode or enter its number." : "No receipts found for this search."}</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-xs text-slate-500 dark:border-white/10"><span>{mode === "DATE" ? `Showing all ${visible.length} matching receipts` : `Showing ${visible.length} of ${filtered.length} receipts`}</span>{mode !== "DATE" && <div className="flex items-center gap-2"><button type="button" disabled={currentPage === 1} onClick={() => setPage(() => Math.max(1, currentPage - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40 dark:border-white/10"><ChevronLeft size={15} /></button><span>Page {currentPage} / {pageCount}</span><button type="button" disabled={currentPage === pageCount} onClick={() => setPage(() => Math.min(pageCount, currentPage + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40 dark:border-white/10"><ChevronRight size={15} /></button></div>}</div>
      </div>
      {cameraOpen && <CameraScanner onClose={() => { setCameraOpen(false); barcodeRef.current?.focus(); }} onScan={(code) => { setCameraOpen(false); searchBarcode(code); }} />}
      {selected && <ReceiptDialog receipt={selected} onClose={() => setSelected(null)} onPrint={() => printReceipt(selected)} />}
    </section>
  );
}
function Stat({ title, value: amount, icon: Icon, color }: { title: string; value: string; icon: typeof ReceiptText; color: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500 dark:text-slate-400">{title}</p><p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{amount}</p></div><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}><Icon size={21} /></div></div></article>;
}
function PaymentBadge({ payment }: { payment: string }) {
  const Icon = payment === "CASH" ? Banknote : payment === "CARD" ? CreditCard : WalletCards;
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300"><Icon size={13} />{payment.replaceAll("_", " ")}</span>;
}
function ReceiptDialog({ receipt, onClose, onPrint }: { receipt: Receipt; onClose: () => void; onPrint: () => void }) {
  const money = (amount: number) => formatHistoricalMoney(amount, receipt);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-950"><div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-slate-950"><div><h2 className="font-bold text-slate-950 dark:text-white">Receipt Details</h2><p className="mt-0.5 text-xs text-blue-600">{receiptNo(receipt)}</p></div><button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/10"><X size={18} /></button></div><div className="p-5"><div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-xs dark:bg-white/[0.04]"><Detail label="Date" value={formatShopDateTime(receipt.createdAt ?? receipt.created_at, getShopTimezone(), undefined, undefined)} /><Detail label="Staff" value={receipt.staffName ?? receipt.staff_name ?? "—"} /><Detail label="Staff ID" value={String(receipt.staffId ?? receipt.staff_id ?? "—")} /><Detail label="Payment" value={method(receipt)} /></div><div className="mt-5 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10"><table className="w-full"><thead className="bg-slate-50 text-left text-[11px] text-slate-500 dark:bg-white/[0.04]"><tr><th className="px-3 py-2.5">Item</th><th className="px-3 py-2.5 text-center">Qty</th><th className="px-3 py-2.5 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100 text-xs dark:divide-white/[0.06]">{items(receipt).map((item, index) => { const qty = number(item.qty ?? item.quantity); return <tr key={item.id ?? index}><td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-200">{item.productName ?? item.product_name ?? item.name ?? `Product #${item.productId ?? item.product_id ?? "—"}`}</td><td className="px-3 py-3 text-center text-slate-500">{qty}</td><td className="px-3 py-3 text-right font-semibold dark:text-white">{money(number(item.total) || number(item.price) * qty)}</td></tr>; })}{items(receipt).length === 0 && <tr><td colSpan={3} className="py-7 text-center text-slate-400">No item details</td></tr>}</tbody></table></div><div className="ml-auto mt-5 w-full max-w-xs space-y-2 text-sm"><Amount receipt={receipt} label="Subtotal" amount={number(receipt.subtotal)} /><Amount receipt={receipt} label="Tax" amount={number(receipt.taxAmount ?? receipt.tax_amount)} /><Amount receipt={receipt} label="Service charge" amount={number(receipt.serviceCharge ?? receipt.service_charge)} /><Amount receipt={receipt} label="Discount" amount={number(receipt.discount)} /><div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold dark:border-white/10"><span>Total</span><span className="text-blue-600">{formatHistoricalMoney(value(receipt), receipt)}</span></div>{method(receipt) === "CASH" && <><Amount receipt={receipt} label="Cash received" amount={number(receipt.cashReceived ?? receipt.cash_received ?? receipt.cashGiven ?? receipt.cash_given)} /><Amount receipt={receipt} label="Change" amount={number(receipt.change ?? receipt.changeAmount ?? receipt.change_amount)} /></>}</div></div><div className="flex justify-end gap-2 border-t border-slate-200 p-4 dark:border-white/10"><button type="button" onClick={onClose} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold dark:border-white/10">Close</button><button type="button" onClick={onPrint} className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"><Printer size={16} />Reprint</button></div></div></div>;
}
function Detail({ label, value: text }: { label: string; value: string }) {
return <div><p className="text-slate-400">{label}</p><p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{text}</p></div>; }
function Amount({ label, amount, receipt }: { label: string; amount: number; receipt?: unknown }) {
  const money = (amount: number) => formatHistoricalMoney(amount, receipt);
return <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>{label}</span><span className="font-semibold">{money(amount)}</span></div>; }

// Native detector requires a supported browser and HTTPS. No extra package needed.
type BarcodeDetectorInstance = { detect: (video: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> };
type BarcodeDetectorConstructor = { new(options: { formats: string[] }): BarcodeDetectorInstance; getSupportedFormats: () => Promise<string[]> };
function CameraScanner({ onClose, onScan }: { onClose: () => void; onScan: (code: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanRef = useRef(onScan);
  scanRef.current = onScan;
  const [message, setMessage] = useState("Starting camera...");
  useEffect(() => {
    let stopped = false;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stopCamera = () => stream?.getTracks().forEach((track) => track.stop());
    async function start() {
      try {
        const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
        if (!Detector) throw new Error("Camera barcode scanning is unavailable in this browser. Use a USB / Bluetooth scanner or enter the receipt number.");
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera access requires HTTPS and a supported browser.");
        const supported = await Detector.getSupportedFormats();
        const formats = ["code_128", "code_39", "ean_13", "ean_8", "qr_code", "itf", "upc_a", "upc_e", "codabar"].filter((format) => supported.includes(format));
        if (!formats.length) throw new Error("No supported barcode formats. Use a scanner or enter the receipt number.");
        if (stopped) return;
        const detector = new Detector({ formats });
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: "environment" } } });
        if (stopped) { stopCamera(); return; }
        const video = videoRef.current;
        if (!video) { stopCamera(); return; }
        video.srcObject = stream;
        await video.play();
        if (stopped) return;
        setMessage("Point the camera at the receipt barcode.");
        async function detect() {
          if (stopped) return;
          try {
            const codes = await detector.detect(video!);
            if (stopped) return;
            const code = codes.find((entry) => entry.rawValue.trim())?.rawValue;
            if (code) { stopped = true; stopCamera(); scanRef.current(code); return; }
          } catch {
            if (stopped) return;
            stopCamera();
            setMessage("Unable to scan with this camera. Close and use a scanner or enter the receipt number.");
            return;
          }
          timer = setTimeout(() => { void detect(); }, 180);
        }
        void detect();
      } catch (reason) {
        stopCamera();
        if (!stopped) setMessage(reason instanceof Error ? reason.message : "Camera access failed. Check camera permission or enter the receipt number.");
      }
    }
    void start();
    return () => { stopped = true; if (timer) clearTimeout(timer); stopCamera(); };
  }, []);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return <div role="dialog" aria-modal="true" aria-label="Scan receipt barcode" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="w-full max-w-lg rounded-2xl bg-white p-5 dark:bg-slate-950">
      <div className="mb-4 flex items-center justify-between"><h2 className="font-bold dark:text-white">Scan Receipt Barcode</h2><button type="button" autoFocus onClick={onClose} aria-label="Close camera" className="rounded-xl p-3 dark:text-white"><X size={20} /></button></div>
      <video ref={videoRef} playsInline muted className="aspect-video w-full rounded-xl bg-black object-cover" />
      <p role="status" className="mt-3 text-sm text-slate-500">{message}</p>
      <button type="button" onClick={onClose} className="mt-4 min-h-11 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white">Close / Enter Receipt Number</button>
    </div>
  </div>;
}