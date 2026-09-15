"use client";

import { useEffect, useMemo, useState } from "react";
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
  WalletCards,
  X,
} from "lucide-react";

type PaymentFilter = "ALL" | "CASH" | "CARD" | "WALLET";
type DateFilter = "ALL" | "TODAY" | "WEEK" | "MONTH";

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
  if (!payload || typeof payload !== "object") return [];
  const data = payload as { receipts?: Receipt[]; data?: Receipt[]; content?: Receipt[] };
  return data.receipts ?? data.data ?? data.content ?? [];
}

const value = (receipt: Receipt) => Number(receipt.grandTotal ?? receipt.grand_total ?? receipt.total ?? 0);
const number = (input: unknown) => Number(input ?? 0);
const receiptNo = (receipt: Receipt) => receipt.receiptNo ?? receipt.receipt_no ?? `#${receipt.id ?? "—"}`;
const receiptDate = (receipt: Receipt) => new Date(receipt.createdAt ?? receipt.created_at ?? 0);
const method = (receipt: Receipt) => (receipt.paymentMethod ?? receipt.payment_method ?? "UNKNOWN").toUpperCase();
const items = (receipt: Receipt) => receipt.items ?? receipt.receiptItems ?? receipt.receipt_items ?? [];
const money = (amount: number) => new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY", maximumFractionDigits: 0 }).format(amount);

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState<PaymentFilter>("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilter>("ALL");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Receipt | null>(null);

  async function loadReceipts() {
    setLoading(true);
    setError(null);
    try {
      const authToken = token();
      const response = await fetch(`${API_BASE}/api/pos/receipts/shop`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Unable to load receipts (${response.status})`);
      setReceipts(normalizeList(await response.json()));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load receipts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadReceipts(); }, []);
  useEffect(() => { setPage(1); }, [query, payment, dateFilter]);

  const filtered = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week = new Date(today.getTime() - 6 * 86_400_000);
    const month = new Date(now.getFullYear(), now.getMonth(), 1);
    const normalizedQuery = query.trim().toLowerCase();
    return [...receipts]
      .filter((receipt) => {
        const date = receiptDate(receipt);
        const matchesDate = dateFilter === "ALL" || (dateFilter === "TODAY" && date >= today) || (dateFilter === "WEEK" && date >= week) || (dateFilter === "MONTH" && date >= month);
        const matchesPayment = payment === "ALL" || method(receipt) === payment;
        const searchable = [receiptNo(receipt), receipt.customerName, receipt.customer_name, receipt.staffName, receipt.staff_name, receipt.staffId, receipt.staff_id].join(" ").toLowerCase();
        return matchesDate && matchesPayment && (!normalizedQuery || searchable.includes(normalizedQuery));
      })
      .sort((a, b) => receiptDate(b).getTime() - receiptDate(a).getTime());
  }, [receipts, query, payment, dateFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalSales = filtered.reduce((sum, receipt) => sum + value(receipt), 0);
  const cashSales = filtered.filter((receipt) => method(receipt) === "CASH").reduce((sum, receipt) => sum + value(receipt), 0);
  const cardSales = filtered.filter((receipt) => method(receipt) === "CARD").reduce((sum, receipt) => sum + value(receipt), 0);

  function printReceipt(receipt: Receipt) {
    const popup = window.open("", "_blank", "width=420,height=720");
    if (!popup) return;
    const rows = items(receipt).map((item) => {
      const name = item.productName ?? item.product_name ?? item.name ?? `Product #${item.productId ?? item.product_id ?? "—"}`;
      const qty = number(item.qty ?? item.quantity);
      const price = number(item.price);
      return `<tr><td>${name}</td><td style="text-align:center">${qty}</td><td style="text-align:right">${money(price * qty)}</td></tr>`;
    }).join("");
    popup.document.write(`<!doctype html><html><head><title>${receiptNo(receipt)}</title><style>body{font-family:Arial,sans-serif;width:320px;margin:24px auto;color:#111}h2,p{text-align:center;margin:5px}table{width:100%;border-collapse:collapse;margin:18px 0}th,td{padding:7px 2px;border-bottom:1px dashed #aaa;font-size:12px}.line{display:flex;justify-content:space-between;margin:7px 0}.total{font-size:18px;font-weight:700;border-top:2px solid #111;padding-top:10px}</style></head><body><h2>${receipt.shopName ?? receipt.shop_name ?? "POS Receipt"}</h2><p>${receipt.shopAddress ?? receipt.shop_address ?? ""}</p><p>${receiptNo(receipt)}</p><p>${receiptDate(receipt).toLocaleString()}</p><table><thead><tr><th style="text-align:left">Item</th><th>Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rows || '<tr><td colspan="3">No item details</td></tr>'}</tbody></table><div class="line"><span>Subtotal</span><b>${money(number(receipt.subtotal))}</b></div><div class="line"><span>Tax</span><b>${money(number(receipt.taxAmount ?? receipt.tax_amount))}</b></div><div class="line total"><span>Total</span><span>${money(value(receipt))}</span></div><div class="line"><span>Payment</span><span>${method(receipt)}</span></div><p style="margin-top:24px">Thank you!</p><script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}<\/script></body></html>`);
    popup.document.close();
  }

  return (
    <section className="py-5">
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-black dark:text-slate-300"><ArrowLeft size={17} /></Link>
            <div><h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Receipts</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">View, search and reprint POS transactions.</p></div>
          </div>
        </div>
        <button type="button" onClick={() => void loadReceipts()} disabled={loading} className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-black dark:text-slate-200">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{error}. Please sign in again and check the API URL.</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Total Sales" value={loading ? "—" : money(totalSales)} icon={ReceiptText} color="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" />
        <Stat title="Transactions" value={loading ? "—" : filtered.length.toLocaleString()} icon={CalendarDays} color="bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400" />
        <Stat title="Cash Sales" value={loading ? "—" : money(cashSales)} icon={Banknote} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" />
        <Stat title="Card Sales" value={loading ? "—" : money(cardSales)} icon={CreditCard} color="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400" />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-black">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-white/10 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Receipt, staff or customer..." className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-white" /></div>
          <div className="flex flex-wrap gap-2">
            <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value as DateFilter)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none dark:border-white/10 dark:bg-black dark:text-slate-300"><option value="ALL">All dates</option><option value="TODAY">Today</option><option value="WEEK">Last 7 days</option><option value="MONTH">This month</option></select>
            <select value={payment} onChange={(event) => setPayment(event.target.value as PaymentFilter)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none dark:border-white/10 dark:bg-black dark:text-slate-300"><option value="ALL">All payments</option><option value="CASH">Cash</option><option value="CARD">Card</option><option value="WALLET">Wallet</option></select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500 dark:bg-white/[0.04] dark:text-slate-400"><tr><th className="px-5 py-3">Receipt</th><th className="px-4 py-3">Date & Time</th><th className="px-4 py-3">Staff</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Total</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {visible.map((receipt, index) => <tr key={receipt.id ?? receiptNo(receipt) ?? index} className="text-xs hover:bg-slate-50 dark:hover:bg-white/[0.04]"><td className="px-5 py-4 font-semibold text-blue-600">{receiptNo(receipt)}</td><td className="px-4 py-4 text-slate-600 dark:text-slate-300"><div>{receiptDate(receipt).toLocaleDateString()}</div><div className="mt-0.5 text-[10px] text-slate-400">{receiptDate(receipt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div></td><td className="px-4 py-4 text-slate-700 dark:text-slate-200"><div>{receipt.staffName ?? receipt.staff_name ?? "—"}</div><div className="mt-0.5 text-[10px] text-slate-400">ID: {receipt.staffId ?? receipt.staff_id ?? "—"}</div></td><td className="px-4 py-4"><PaymentBadge payment={method(receipt)} /></td><td className="px-4 py-4"><span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">{receipt.status ?? "PAID"}</span></td><td className="px-4 py-4 text-right text-sm font-bold text-slate-950 dark:text-white">{money(value(receipt))}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => setSelected(receipt)} title="View receipt" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300"><Eye size={15} /></button><button type="button" onClick={() => printReceipt(receipt)} title="Reprint receipt" className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700"><Printer size={15} /></button></div></td></tr>)}
              {loading && <tr><td colSpan={7} className="py-14 text-center text-sm text-slate-400"><Loader2 className="mx-auto mb-2 animate-spin" size={24} />Loading receipts...</td></tr>}
              {!loading && visible.length === 0 && <tr><td colSpan={7} className="py-14 text-center text-sm text-slate-400"><ReceiptText className="mx-auto mb-2" size={28} />No receipts found.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-xs text-slate-500 dark:border-white/10"><span>Showing {visible.length} of {filtered.length} receipts</span><div className="flex items-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40 dark:border-white/10"><ChevronLeft size={15} /></button><span>Page {page} / {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40 dark:border-white/10"><ChevronRight size={15} /></button></div></div>
      </div>

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
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-950"><div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-slate-950"><div><h2 className="font-bold text-slate-950 dark:text-white">Receipt Details</h2><p className="mt-0.5 text-xs text-blue-600">{receiptNo(receipt)}</p></div><button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/10"><X size={18} /></button></div><div className="p-5"><div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-xs dark:bg-white/[0.04]"><Detail label="Date" value={receiptDate(receipt).toLocaleString()} /><Detail label="Staff" value={receipt.staffName ?? receipt.staff_name ?? "—"} /><Detail label="Staff ID" value={String(receipt.staffId ?? receipt.staff_id ?? "—")} /><Detail label="Payment" value={method(receipt)} /></div><div className="mt-5 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10"><table className="w-full"><thead className="bg-slate-50 text-left text-[11px] text-slate-500 dark:bg-white/[0.04]"><tr><th className="px-3 py-2.5">Item</th><th className="px-3 py-2.5 text-center">Qty</th><th className="px-3 py-2.5 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100 text-xs dark:divide-white/[0.06]">{items(receipt).map((item, index) => { const qty = number(item.qty ?? item.quantity); return <tr key={item.id ?? index}><td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-200">{item.productName ?? item.product_name ?? item.name ?? `Product #${item.productId ?? item.product_id ?? "—"}`}</td><td className="px-3 py-3 text-center text-slate-500">{qty}</td><td className="px-3 py-3 text-right font-semibold dark:text-white">{money(number(item.total) || number(item.price) * qty)}</td></tr>; })}{items(receipt).length === 0 && <tr><td colSpan={3} className="py-7 text-center text-slate-400">No item details</td></tr>}</tbody></table></div><div className="ml-auto mt-5 w-full max-w-xs space-y-2 text-sm"><Amount label="Subtotal" amount={number(receipt.subtotal)} /><Amount label="Tax" amount={number(receipt.taxAmount ?? receipt.tax_amount)} /><Amount label="Service charge" amount={number(receipt.serviceCharge ?? receipt.service_charge)} /><Amount label="Discount" amount={number(receipt.discount)} /><div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold dark:border-white/10"><span>Total</span><span className="text-blue-600">{money(value(receipt))}</span></div>{method(receipt) === "CASH" && <><Amount label="Cash received" amount={number(receipt.cashReceived ?? receipt.cash_received ?? receipt.cashGiven ?? receipt.cash_given)} /><Amount label="Change" amount={number(receipt.change ?? receipt.changeAmount ?? receipt.change_amount)} /></>}</div></div><div className="flex justify-end gap-2 border-t border-slate-200 p-4 dark:border-white/10"><button type="button" onClick={onClose} className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold dark:border-white/10">Close</button><button type="button" onClick={onPrint} className="flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"><Printer size={16} />Reprint</button></div></div></div>;
}

function Detail({ label, value: text }: { label: string; value: string }) { return <div><p className="text-slate-400">{label}</p><p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{text}</p></div>; }
function Amount({ label, amount }: { label: string; amount: number }) { return <div className="flex justify-between text-slate-600 dark:text-slate-300"><span>{label}</span><span className="font-semibold">{money(amount)}</span></div>; }
