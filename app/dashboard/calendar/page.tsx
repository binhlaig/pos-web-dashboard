"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { useCurrency } from "@/components/currency-provider";
import { calendarRequest, editableEntry, CalendarApiError, type CalendarEntry } from "@/lib/calendar-api";
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";
import { useSession } from "next-auth/react";
import { useShopTimezone } from "@/components/shop-timezone-provider";
import { getShopTimezone, parseTimestamp } from "@/lib/date-time";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, X, Check, Clock, StickyNote, Truck, Users, Wrench, Megaphone, Wallet, Download, Trash2, AlertCircle, CheckCircle2, ArrowUpRight, ReceiptText, TrendingUp, RefreshCw, Banknote, CreditCard } from "lucide-react";

type Kind = "NOTE" | "DELIVERY" | "SHIFT" | "MAINTENANCE" | "PROMOTION" | "PAYMENT";
type Priority = "NORMAL" | "HIGH";
type View = "MONTH" | "WEEK" | "AGENDA";
type Entry = CalendarEntry;
const KINDS = {
  NOTE: { label: "Note / Task", icon: StickyNote, color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20", dot: "bg-blue-500" },
  DELIVERY: { label: "Stock delivery", icon: Truck, color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20", dot: "bg-emerald-500" },
  SHIFT: { label: "Staff shift", icon: Users, color: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20", dot: "bg-violet-500" },
  MAINTENANCE: { label: "Maintenance", icon: Wrench, color: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20", dot: "bg-amber-500" },
  PROMOTION: { label: "Promotion", icon: Megaphone, color: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-500/10 dark:text-pink-300 dark:border-pink-500/20", dot: "bg-pink-500" },
  PAYMENT: { label: "Bill / Payment", icon: Wallet, color: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20", dot: "bg-cyan-500" },
} as const;
const PANEL = "rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_24px_-12px_rgba(15,23,42,0.16)] dark:border-slate-700/60 dark:bg-slate-950 dark:shadow-[0_8px_32px_-16px_rgba(59,130,246,0.18)]";
const PRIMARY = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-[0_4px_16px_-4px_rgba(37,99,235,0.55)] transition hover:bg-blue-500 hover:shadow-[0_6px_22px_-4px_rgba(37,99,235,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-40 dark:ring-offset-slate-950";
const BUTTON = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors";
const INPUT = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700/70 dark:bg-slate-900 dark:text-white dark:[color-scheme:dark]";
const pad = (n: number) => String(n).padStart(2, "0");
function dateKey(date: Date) { return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`; }
function dateOf(key: string) { return new Date(`${key}T00:00:00Z`); }
function addDays(key: string, days: number) { const date = dateOf(key); date.setUTCDate(date.getUTCDate() + days); return dateKey(date); }
function validDate(key: unknown): key is string { return typeof key === "string" && /^\d{4}-\d{2}-\d{2}$/.test(key) && Number.isFinite(dateOf(key).getTime()) && dateKey(dateOf(key)) === key; }
function todayKey(timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (name: string) => parts.find(p => p.type === name)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
function formatDay(key: string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) { return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(dateOf(key)); }
function monthStart(key: string) { return `${key.slice(0, 7)}-01`; }
function monthMove(key: string, amount: number) { const d = dateOf(monthStart(key)); d.setUTCMonth(d.getUTCMonth() + amount); return dateKey(d); }
function weekStart(key: string) { return addDays(key, -((dateOf(key).getUTCDay() + 6) % 7)); }
function covers(entry: Entry, key: string) { return entry.date <= key && entry.endDate >= key; }
function blank(date: string): Entry { return { id: "", title: "", note: "", kind: "NOTE", priority: "NORMAL", date, endDate: date, time: "", endTime: "", assignee: "", completed: false, version: 0, createdAt: "", updatedAt: "" }; }
function sortEntries(a: Entry, b: Entry) { return a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.title.localeCompare(b.title); }
function validateEntry(entry: Entry) {
  if (!entry.title.trim() || entry.title.trim().length > 120) return "Enter a title (1–120 characters).";
  if (!validDate(entry.date) || !validDate(entry.endDate) || entry.endDate < entry.date) return "Choose valid start and end dates.";
  if (entry.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(entry.time)) return "Choose a valid start time.";
  if (entry.endTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(entry.endTime)) return "Choose a valid end time.";
  if (entry.endTime && !entry.time) return "Choose a start time first.";
  if (entry.date === entry.endDate && entry.time && entry.endTime && entry.endTime <= entry.time) return "End time must be after start time. For an overnight shift, choose the next day as the end date.";
  if (entry.note.length > 5000 || entry.assignee.length > 120) return "Notes or assignee are too long.";
  return "";
}
type CalendarIdentity = { shop: string; account: string };
function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function identityText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value !== "string" && typeof value !== "number") continue;
    const text = String(value).trim();
    if (text && text !== "null" && text !== "undefined") return text;
  }
  return "";
}
// Decode only the JWT issued through this authenticated NextAuth session.
// These claims identify account scope; decoding is not authentication
// or signature verification, and must never be used to authorize backend access.
function calendarClaims(value: unknown): Record<string, unknown> {
  if (typeof value !== "string") return {};
  try {
    const token = value.trim().replace(/^Bearer\s+/i, "");
    const parts = token.split(".");
    if (parts.length !== 3) return {}; // NextAuth's encrypted JWE is not a backend JWT.
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - payload.length % 4) % 4);
    const bytes = Uint8Array.from(atob(padded), char => char.charCodeAt(0));
    return objectValue(JSON.parse(new TextDecoder().decode(bytes)));
  } catch { return {}; }
}
function resolveCalendarIdentity(sessionValue: unknown): CalendarIdentity {
  const root = objectValue(sessionValue);
  const user = objectValue(root.user);
  const profile = objectValue(root.profile);
  const userShop = objectValue(user.shop);
  const sessionShop = objectValue(root.shop);
  const claims = calendarClaims(identityText(root.accessToken, root.access_token, root.token,
    root.backendToken, user.accessToken, user.access_token, user.token));
  const subject = identityText(claims.sub);
  const staffPrincipal = /^staff:([^:]+):([^:]+)$/.exec(subject);
  const shop = identityText(user.shopId, user.shop_id, userShop.id, root.shopId, root.shop_id,
    sessionShop.id, profile.shopId, claims.shopId, claims.shop_id,
    staffPrincipal?.[1], user.shopCode, user.shop_code, userShop.code,
    root.shopCode, root.shop_code, sessionShop.code, claims.shopCode, claims.shop_code);
  const account = identityText(user.id, user.userId, user.user_id, user.email, user.username,
    root.userId, root.accountId, root.username, profile.id, profile.username,
    staffPrincipal ? subject : "", claims.userId, claims.accountId, claims.username, subject);
  return { shop, account };
}

type SalesReceipt = {
  id?: number | string; receiptNo?: string; receipt_no?: string;
  createdAt?: string | number; created_at?: string | number; total?: number | string;
  grandTotal?: number | string; grand_total?: number | string;
  paymentMethod?: string; payment_method?: string; status?: string;
};
type DaySales = { total: number; count: number; payments: Record<string, number>; invalidCount: number; legacyCount: number };
// Existing App Router proxy forwards this request to the Spring Boot backend.
// Keep client requests on the dashboard origin; backend base URLs belong in the proxy.
const SALES_ENDPOINT = "/api/pos/receipts/shop";
async function fetchCalendarSales(token: string, signal: AbortSignal) {
  const response = await fetch(SALES_ENDPOINT, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    credentials: "same-origin", cache: "no-store", signal,
  });
  const text = await response.text();
  let payload: unknown = null;
  try { payload = text ? JSON.parse(text) : null; } catch { /* HTML/plain-text responses are handled below. */ }
  if (!response.ok) {
    const body = objectValue(payload);
    const detail = identityText(body.message, body.detail, body.error);
    const fallback = response.status === 401 ? "Your login session expired. Sign in again."
      : response.status === 403 ? "This account cannot access shop receipts."
      : response.status === 404 ? "The dashboard receipts proxy route is missing."
      : response.status === 502 ? "The dashboard cannot connect to the POS backend."
      : "Unable to load daily sales.";
    throw new Error(`${detail || fallback} (HTTP ${response.status})`);
  }
  return salesReceiptList(payload);
}
function salesReceiptList(payload: unknown): SalesReceipt[] {
  if (Array.isArray(payload)) return payload as SalesReceipt[];
  const value = objectValue(payload);
  if (value.last === false || (typeof value.totalPages === "number" && value.totalPages > 1)) throw new Error("The receipts API returned partial history. Daily totals are unavailable until full history is returned.");
  for (const key of ["receipts", "content", "data"]) {
    if (value[key] != null) {
      const list = salesReceiptList(value[key]);
      if (typeof value.totalElements === "number" && value.totalElements > list.length) throw new Error("The receipts API returned partial history. Daily totals are unavailable.");
      return list;
    }
  }
  throw new Error("Unexpected receipts response.");
}
function salesDateKey(value: unknown, formatter: Intl.DateTimeFormat) {
  // Explicit instants use the shop timezone. Legacy LocalDateTime values keep
  // their written calendar date; do not silently assume UTC or device timezone.
  if (typeof value !== "string" && typeof value !== "number") return { key: "", legacy: false };
  const date = parseTimestamp(value);
  if (Number.isFinite(date.getTime())) {
    const parts = formatter.formatToParts(date);
    const part = (name: string) => parts.find(p => p.type === name)?.value ?? "";
    return { key: `${part("year")}-${part("month")}-${part("day")}`, legacy: false };
  }
  const legacy = typeof value === "string" ? /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?$/.exec(value.trim()) : null;
  if (legacy && validDate(legacy[1]) && Number(legacy[2] ?? 0) < 24 && Number(legacy[3] ?? 0) < 60 && Number(legacy[4] ?? 0) < 60) return { key: legacy[1], legacy: true };
  return { key: "", legacy: false };
}
function aggregateDaySales(receipts: SalesReceipt[], timezone: string) {
  const days: Record<string, DaySales> = {};
  const formatter = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" });
  const seen = new Set<string>(); let undatedCount = 0;
  for (const receipt of receipts) {
    if (!receipt || typeof receipt !== "object") { undatedCount++; continue; }
    if (!["PAID", "COMPLETED"].includes(String(receipt.status ?? "COMPLETED").trim().toUpperCase())) continue;
    const id = String(receipt.id ?? receipt.receiptNo ?? receipt.receipt_no ?? "");
    if (id && seen.has(id)) continue;
    if (id) seen.add(id);
    const { key, legacy } = salesDateKey(receipt.createdAt ?? receipt.created_at, formatter);
    if (!key) { undatedCount++; continue; }
    const day = days[key] ?? (days[key] = { total: 0, count: 0, payments: {}, invalidCount: 0, legacyCount: 0 });
    const rawAmount = receipt.grandTotal ?? receipt.grand_total ?? receipt.total;
    const amount = (typeof rawAmount === "number" || (typeof rawAmount === "string" && rawAmount.trim())) ? Number(rawAmount) : NaN;
    if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(day.total + amount)) { day.invalidCount++; continue; }
    const payment = String(receipt.paymentMethod ?? receipt.payment_method ?? "OTHER").trim().toUpperCase() || "OTHER";
    day.total += amount; day.count++; if (legacy) day.legacyCount++;
    day.payments[payment] = (day.payments[payment] ?? 0) + amount;
  }
  return { days, undatedCount };
}
export default function PosCalendarPage() {
  const { formatSharedMoney: money } = useCurrency();
  const timezoneSubscription = useShopTimezone();
  const timezone = getShopTimezone();
  const { data: session, status } = useSession();
  const { shop, account } = useMemo(() => resolveCalendarIdentity(session), [session]);
  const storageKey = shop && account ? `binhlaig:calendar:v1:${encodeURIComponent(shop)}:${encodeURIComponent(account)}` : "";
  const rootSession = objectValue(session);
  const salesToken = identityText(rootSession.accessToken).replace(/^Bearer\s+/i, "");
  const salesScope = `${storageKey}:${salesToken}`;
  const [sales, setSales] = useState<{ scope: string; loading: boolean; error: string; rows: SalesReceipt[] }>({ scope: "", loading: false, error: "", rows: [] });
  const [salesRefresh, setSalesRefresh] = useState(0);
  const [salesEnabled, setSalesEnabled] = useState(false);
  useEffect(() => {
    if (status !== "authenticated" || !storageKey || !salesEnabled) return;
    const controller = new AbortController();
    setSales({ scope: salesScope, loading: true, error: "", rows: [] });
    async function loadSales() {
      try {
        if (!salesToken) throw new Error("Your login session has no backend access token. Daily sales are unavailable.");
        const rows = await fetchCalendarSales(salesToken, controller.signal);
        if (!controller.signal.aborted) setSales({ scope: salesScope, loading: false, error: "", rows });
      } catch (reason) {
        if (!controller.signal.aborted) setSales({ scope: salesScope, loading: false, error: reason instanceof Error ? reason.message : "Unable to load daily sales.", rows: [] });
      }
    }
    void loadSales();
    return () => controller.abort();
  }, [status, storageKey, salesToken, salesScope, salesRefresh, salesEnabled]);
  useEffect(() => {
    if (status !== "authenticated" || !storageKey || !salesToken || !salesEnabled) return;
    const refresh = () => setSalesRefresh(value => value + 1);
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [status, storageKey, salesToken, salesEnabled]);
  const salesSummary = useMemo(() => {
    if (sales.scope !== salesScope || sales.loading) return { loading: true, error: "", days: {} as Record<string, DaySales>, undatedCount: 0 };
    if (sales.error) return { loading: false, error: sales.error, days: {} as Record<string, DaySales>, undatedCount: 0 };
    try { return { loading: false, error: "", ...aggregateDaySales(sales.rows, timezone) }; }
    catch (reason) { return { loading: false, error: reason instanceof Error ? reason.message : "Unable to calculate sales.", days: {} as Record<string, DaySales>, undatedCount: 0 }; }
  }, [sales, salesScope, timezone]);
  const [today, setToday] = useState("");
  const [anchor, setAnchor] = useState("");
  const [selected, setSelected] = useState("");
  const [view, setView] = useState<View>("MONTH");
  const [loaded, setLoaded] = useState<{scope:string; range:string; entries:Entry[]}>({scope:"",range:"",entries:[]});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sidePanel, setSidePanel] = useState<"DAY" | "UPCOMING" | "OVERDUE" | null>(null);
  const [kind, setKind] = useState<Kind | "ALL">("ALL");
  const [completion, setCompletion] = useState("ALL");
  const [draft, setDraft] = useState<Entry | null>(null);
  const [formError, setFormError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const [conflict, setConflict] = useState<Entry | null>(null);
  const [latest, setLatest] = useState<Entry | null>(null);
  const generation = useRef(0);
  const draftScope = useRef("");
  const scope = status === "authenticated" ? storageKey + ":" + salesToken : "";
  const activeScope = useRef(scope); activeScope.current = scope;
  const range = useMemo(() => {
    if (!anchor || !today) return {from:"",to:""};


    const from=view === "WEEK"?weekStart(anchor):view === "AGENDA"?monthStart(anchor):weekStart(monthStart(anchor));
    const to=view === "WEEK"?addDays(from,6):view === "AGENDA"?addDays(monthMove(anchor,1),-1):addDays(from,41);
    const panelFrom=sidePanel === "OVERDUE"?addDays(today,-365):sidePanel === "UPCOMING"?today:from;
    const panelTo=sidePanel === "UPCOMING"?addDays(today,90):sidePanel === "OVERDUE"?addDays(today,-1):to;
    return {from:from<panelFrom?from:panelFrom,to:to>panelTo?to:panelTo};
  },[anchor,today,view,sidePanel]);
  const rangeKey=range.from+":"+range.to;
  const entries=loaded.scope===scope && loaded.range===rangeKey ? loaded.entries : [];
  useEffect(() => {
    const update=()=>{const key=todayKey(getShopTimezone());setToday(key);setAnchor(v=>v||key);setSelected(v=>v||key);};
    update(); const timer=window.setInterval(update,30000);return ()=>window.clearInterval(timer);
  },[timezoneSubscription]);
  useEffect(()=>{generation.current++;setDraft(null);setDeleteId(null);setConflict(null);setLatest(null);setFormError("");setMessage("");setSales({scope:"",loading:false,error:"",rows:[]});setLoaded({scope:"",range:"",entries:[]});},[scope]);
  useEffect(()=>{
    setReady(false);setError("");if(!scope||!range.from)return;
    const controller=new AbortController();
    void calendarRequest("?from="+range.from+"&to="+range.to,{signal:controller.signal}).then(result=>{
      if(!controller.signal.aborted&&activeScope.current===scope){setLoaded({scope,range:rangeKey,entries:result as Entry[]});setReady(true);}
    }).catch(reason=>{if(!controller.signal.aborted&&activeScope.current===scope){setLoaded({scope,range:rangeKey,entries:[]});setError(reason instanceof Error?reason.message:"Unable to load calendar.");setReady(true);}});
    return ()=>controller.abort();
  },[scope,range.from,range.to,rangeKey,refresh]);
  useEffect(()=>{if(!message)return;const timer=window.setTimeout(()=>setMessage(""),4000);return ()=>window.clearTimeout(timer);},[message]);
  async function mutate(entry:Entry,operation:"save"|"toggle"|"delete"){
    if(busy.current||!ready||!scope||conflict)return;
    draftScope.current=scope;
    const requestScope=scope, editor=generation.current;busy.current=true;setSaving(true);setFormError("");setError("");
    try{
      const updated=operation==="toggle"?{...entry,completed:!entry.completed}:entry;
      const result=await calendarRequest(entry.id?"/"+entry.id+(operation==="delete"?"?version="+entry.version:""):"",{method:operation==="delete"?"DELETE":entry.id?"PUT":"POST",...(operation!=="delete"?{body:JSON.stringify(editableEntry(updated,Boolean(entry.id)))}:{})}) as Entry|null;
      if(activeScope.current!==requestScope||generation.current!==editor)return;
      setLoaded(prev=>({...prev,entries:operation==="delete"?prev.entries.filter(e=>e.id!==entry.id):result?[...prev.entries.filter(e=>e.id!==result.id),result]:prev.entries}));setRefresh(v=>v+1);
      if(generation.current===editor){if(operation!=="toggle"){setDraft(null);setDeleteId(null);}setMessage(operation==="delete"?"Entry deleted from database.":"Calendar entry saved to database.");}
    }catch(reason){if(activeScope.current!==requestScope||generation.current!==editor)return;const text=reason instanceof Error?reason.message:"Calendar request failed.";setFormError(text);setError(text);if(reason instanceof CalendarApiError&&reason.status===409){setConflict(entry);setLatest(null);}}
    finally{busy.current=false;setSaving(false);}
  }
  function save(){if(!draft)return;const invalid=validateEntry(draft);if(invalid){setFormError(invalid);return;}void mutate(draft,"save");}
  function toggle(entry:Entry){void mutate(entry,"toggle");}
  function open(entry:Entry){if(busy.current)return;generation.current++;draftScope.current=scope;setConflict(null);setLatest(null);setFormError("");setDraft({...entry});}
  function closeEditor(){if(busy.current)return;generation.current++;setDraft(null);setConflict(null);setLatest(null);}
  async function loadLatest(){
    if(!conflict||busy.current)return;const requestScope=scope,editor=generation.current;busy.current=true;setSaving(true);
    try{const result=await calendarRequest("/"+conflict.id) as Entry;if(activeScope.current===requestScope&&generation.current===editor)setLatest(result);}
    catch(reason){if(activeScope.current===requestScope)setFormError(reason instanceof Error?reason.message:"Unable to load latest entry.");}
    finally{busy.current=false;setSaving(false);}
  }
  const filtered = useMemo(() => entries.filter(e => (kind === "ALL" || e.kind === kind) && (completion === "ALL" || e.completed === (completion === "DONE"))).sort(sortEntries), [entries, kind, completion]);
  const first = anchor ? view === "WEEK" ? weekStart(anchor) : weekStart(monthStart(anchor)) : "";
  const days = first ? Array.from({ length: view === "WEEK" ? 7 : 42 }, (_, i) => addDays(first, i)) : [];
  const monthLast = anchor ? addDays(monthMove(anchor, 1), -1) : "";
  const agenda = filtered.filter(e => e.date <= monthLast && e.endDate >= monthStart(anchor || "2000-01-01"));
  const dayEntries = filtered.filter(e => selected && covers(e, selected));
  const upcoming = filtered.filter(e => !e.completed && e.endDate >= today && e.date <= addDays(today, 90)).sort(sortEntries).slice(0, 5);
  const due = filtered.filter(e => !e.completed && e.endDate < today && e.endDate >= addDays(today, -365));
  const counts = [
    { label: "Today", value: filtered.filter(e => today && covers(e, today)).length, icon: CalendarDays, color: "text-blue-600 dark:text-blue-400", glow: "bg-blue-500", tint: "bg-blue-50 dark:bg-blue-500/10", detail: "Scheduled for your shop today" },
    { label: "Pending", value: entries.filter(e => !e.completed).length, icon: Clock, color: "text-violet-600 dark:text-violet-400", glow: "bg-violet-500", tint: "bg-violet-50 dark:bg-violet-500/10", detail: "Work waiting to be completed" },
    { label: "Overdue dates", value: due.length, icon: AlertCircle, color: "text-amber-600 dark:text-amber-400", glow: "bg-amber-500", tint: "bg-amber-50 dark:bg-amber-500/10", detail: "Past dates that need attention" },
    { label: "Completed", value: entries.filter(e => e.completed).length, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", glow: "bg-emerald-500", tint: "bg-emerald-50 dark:bg-emerald-500/10", detail: "Finished notes and schedules" },
  ];
  function backup() {
    const blob = new Blob([JSON.stringify({ version: 1, shop, timezone, entries }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `pos-calendar-${today}.json`; a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (status === "loading" || !today) return <div className="py-20 text-center text-sm text-slate-500">Loading calendar…</div>;
  if (status !== "authenticated") return <div className={`${PANEL} p-8 text-center text-slate-600 dark:text-slate-300`}>Sign in to open your POS calendar.</div>;
  if (!storageKey) return <div role="alert" className={`${PANEL} p-6 text-sm text-slate-600 dark:text-slate-300`}>Calendar cannot identify the current shop from this login. Sign out and sign in again. If this continues, your NextAuth session must include shopId / shopCode or the backend accessToken.</div>;
  const pending = !ready || saving;
  return <section className="pos-calendar relative isolate min-w-0 py-2 text-slate-950 dark:text-white">
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 overflow-hidden"><div className="absolute left-8 top-4 h-60 w-60 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/10" /><div className="absolute right-10 top-16 h-52 w-52 rounded-full bg-violet-400/10 blur-3xl dark:bg-violet-500/10" /></div>
    <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div><h1 className="text-xl font-bold tracking-tight">POS Calendar</h1><p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Notes & schedules · {timezone}</p></div>
      <div className="flex gap-2"><button type="button" disabled={pending} onClick={backup} className={BUTTON}><Download size={15} />Export loaded entries</button><button type="button" disabled={pending} onClick={() => open(blank(selected || today))} className={PRIMARY}><Plus size={16} />Add entry</button></div>
    </header>
    <p className="mb-2 text-xs text-slate-500">Loaded range: {range.from} to {range.to}. Counts and exports cover this range only. Upcoming covers 90 days; overdue covers the past year; agenda covers the selected month.</p>
    {!ready && <p role="status">Loading calendar entries...</p>}
    {error && <button type="button" className={BUTTON} onClick={()=>setRefresh(v=>v+1)}>Retry loading entries</button>}
    {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
    {message && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{message}</p>}
    <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{counts.map(({ label, value, icon: Icon, color, glow, tint, detail }) => <div key={label} title={detail} className={`${PANEL} relative flex items-center gap-2.5 overflow-hidden px-3 py-2.5`}>
      <div aria-hidden="true" className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 blur-2xl ${glow}`} />
      <div className={`relative rounded-lg p-2 ${tint} ${color}`}><Icon size={17} /></div><div className="relative min-w-0"><p className="truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">{label}</p><p className="text-xl font-semibold leading-6 tabular-nums">{value}</p></div>
    </div>)}</div>
    <div className="relative grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
      <div className={`${PANEL} min-w-0 overflow-hidden ring-1 ring-blue-500/[0.03] dark:ring-blue-500/10`}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/60 px-3 py-2.5 dark:border-white/10 dark:bg-slate-900/40">
          <div className="flex items-center gap-2"><button type="button" className={`${BUTTON} !px-2`} aria-label="Previous period" onClick={() => setAnchor(view === "WEEK" ? addDays(anchor, -7) : monthMove(anchor, -1))}><ChevronLeft size={17} /></button><button type="button" className={`${BUTTON} !px-2`} aria-label="Next period" onClick={() => setAnchor(view === "WEEK" ? addDays(anchor, 7) : monthMove(anchor, 1))}><ChevronRight size={17} /></button><h2 className="ml-1 text-base font-semibold">{view === "WEEK" ? `${formatDay(first)} – ${formatDay(addDays(first, 6), { month: "short", day: "numeric", year: "numeric" })}` : formatDay(anchor, { month: "long", year: "numeric" })}</h2></div>
          <div className="flex flex-wrap gap-2"><button type="button" className={BUTTON} onClick={() => { setAnchor(today); setSelected(today); }}>Today</button><div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/5">{(["MONTH", "WEEK", "AGENDA"] as View[]).map(mode => <button type="button" key={mode} aria-pressed={view === mode} onClick={() => setView(mode)} className={`min-h-9 rounded-lg px-3 text-xs font-semibold capitalize ${view === mode ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/20" : "text-slate-500"}`}>{mode.toLowerCase()}</button>)}</div></div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-2 dark:border-white/5">
          <select aria-label="Entry type" className={`${INPUT} !h-10 !w-auto !max-w-[150px] !px-2 !text-xs`} value={kind} onChange={e => setKind(e.target.value as Kind | "ALL")}><option value="ALL">All types</option>{Object.entries(KINDS).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}</select>
          <select aria-label="Completion status" className={`${INPUT} !h-10 !w-auto !px-2 !text-xs`} value={completion} onChange={e => setCompletion(e.target.value)}><option value="ALL">All statuses</option><option value="PENDING">Pending</option><option value="DONE">Done</option></select>
          {(kind !== "ALL" || completion !== "ALL") && <button type="button" aria-label="Reset calendar filters" title="Reset filters" className={`${BUTTON} !px-2`} onClick={() => { setKind("ALL"); setCompletion("ALL"); }}><X size={14} /></button>}
        </div>
        {view === "AGENDA" ? <div className="divide-y divide-slate-100 dark:divide-white/5">{agenda.length ? agenda.map(entry => <div key={entry.id} className="flex items-start gap-3 p-4"><div className="w-16 shrink-0 text-xs font-semibold text-slate-500">{formatDay(entry.date)}</div><EntryRow entry={entry} onOpen={() => open(entry)} onToggle={() => toggle(entry)} disabled={pending} /></div>) : <Empty text="No matching entries this month." />}</div> : <div className="overflow-x-auto">
          <div className="min-w-[490px]">
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 dark:border-white/5 dark:bg-white/[0.03]">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <div key={day} className="p-2 text-center text-xs font-medium text-slate-500">{day}</div>)}</div>
            <div className="grid grid-cols-7">{days.map(day => {
              const list = filtered.filter(e => covers(e, day));
              return <SalesDatePopover key={day}
                label={formatDay(day, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                selected={selected === day} dateNumber={dateOf(day).getUTCDate()}
                onSelect={() => setSelected(day)} onPreview={() => setSalesEnabled(true)}
                className={`calendar-day border-b border-r border-slate-100 p-1.5 transition-colors hover:bg-slate-50/80 dark:border-white/5 dark:hover:bg-slate-900/70 ${view === "WEEK" ? "calendar-week-day min-h-[370px]" : "calendar-month-day min-h-[116px]"} ${day === selected ? "bg-blue-50/80 ring-1 ring-inset ring-blue-500/25 dark:bg-blue-500/[0.09] dark:ring-blue-400/25" : ""} ${view === "MONTH" && day.slice(0, 7) !== anchor.slice(0, 7) ? "bg-slate-50/50 dark:bg-white/[0.02]" : ""}`}
                dateClassName={`mb-1 flex h-6 w-6 items-center justify-center rounded-lg text-xs font-semibold ${day === today ? "bg-blue-600 text-white shadow-[0_3px_10px_-2px_rgba(37,99,235,0.6)]" : day.slice(0, 7) !== anchor.slice(0, 7) ? "text-slate-400" : "text-slate-700 dark:text-slate-300"}`}
                preview={<>
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800"><div><h3 className="text-sm font-semibold">{formatDay(day, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</h3><p className="mt-1 text-[10px] leading-4 text-slate-500">POS sales · {timezone}</p></div><button type="button" title="Refresh sales" aria-label="Refresh sales" onClick={() => setSalesRefresh(value => value + 1)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><RefreshCw size={13} className={salesSummary.loading ? "animate-spin" : ""} /></button></div>
                    <div className="grid sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
                    <div className="min-w-0 bg-slate-50/40 dark:bg-slate-900/20">
                    {salesSummary.loading ? <p role="status" className="px-4 py-8 text-center text-xs text-slate-500">Loading daily sales…</p> : salesSummary.error ? <p role="alert" className="px-4 py-5 text-xs leading-5 text-amber-700 dark:text-amber-300">{salesSummary.error}</p> : <DaySalesSummary summary={salesSummary.days[day] ?? { total: 0, count: 0, payments: {}, invalidCount: 0, legacyCount: 0 }} undatedCount={salesSummary.undatedCount} money={money} />}
                    <div className="border-t border-slate-100 px-4 py-2 text-[10px] text-slate-400 dark:border-slate-800">Paid / completed POS receipts</div>
                    </div>
                    <DayCalendarRecords day={day} entries={entries} loading={!ready || loaded.scope !== scope || loaded.range !== rangeKey} error={error} />
                    </div>
                </>}>
                <div className="calendar-events space-y-1">{list.slice(0, view === "WEEK" ? list.length : 3).map(entry => <button type="button" key={entry.id} onClick={() => open(entry)} disabled={pending} title={`${entry.title}${entry.time ? ` · ${entry.time}` : ""}`} className={`block w-full truncate rounded-md border px-1 py-0.5 text-left text-[10px] font-medium transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:brightness-125 ${KINDS[entry.kind].color} ${entry.completed ? "opacity-50 line-through" : ""}`}>{entry.priority === "HIGH" ? "! " : ""}{entry.time && entry.date === day ? `${entry.time} ` : ""}{entry.title}</button>)}{view === "MONTH" && list.length > 1 && <button type="button" onClick={() => { setSelected(day); setSidePanel("DAY"); }} className={`calendar-more ${list.length <= 3 ? "calendar-only-compact" : ""} text-[10px] font-medium text-blue-600 dark:text-blue-400`}><span className="calendar-compact-more">+{list.length - 1} more</span>{list.length > 3 && <span className="calendar-full-more">+{list.length - 3} more</span>}</button>}</div>
              </SalesDatePopover>;
            })}</div>
          </div>
        </div>}
        <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-200 px-3 py-2 dark:border-white/10">{Object.values(KINDS).map(meta => <span key={meta.label} className="flex items-center gap-1.5 text-[10px] text-slate-500"><span className={`h-2 w-2 rounded-full ${meta.dot}`} />{meta.label}</span>)}</div>
      </div>
      <aside className="flex items-start gap-2 lg:sticky lg:top-3" aria-label="Calendar tools">
        {sidePanel && <div id="calendar-details" role="region" aria-label={sidePanel === "DAY" ? "Selected day details" : sidePanel === "UPCOMING" ? "Upcoming work" : "Overdue work"} className={`${PANEL} absolute right-16 top-0 z-20 max-h-[calc(100dvh-180px)] w-[min(280px,calc(100vw-100px))] overflow-y-auto p-2 shadow-xl lg:static lg:z-auto lg:w-[248px] lg:shadow-sm 2xl:w-[280px]`}>
          <div className="mb-2 flex items-center justify-between px-2"><span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Calendar details</span><button type="button" aria-label="Collapse calendar details" onClick={() => setSidePanel(null)} className={`${BUTTON} !min-h-9 !px-2`}><X size={15} /></button></div>
          {sidePanel === "DAY" && (<div className="p-2"><div className="mb-3 flex items-center justify-between gap-2"><div><p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400"><CalendarDays size={12} />Selected day</p><h2 className="mt-1 text-sm font-semibold">{formatDay(selected || today, { weekday: "short", month: "short", day: "numeric" })}</h2></div><button type="button" disabled={pending} onClick={() => open(blank(selected || today))} aria-label="Add entry to selected day" className={`${BUTTON} !px-2`}><Plus size={16} /></button></div><div className="space-y-3">{dayEntries.length ? dayEntries.map(entry => <EntryRow key={entry.id} entry={entry} disabled={pending} onOpen={() => open(entry)} onToggle={() => toggle(entry)} />) : <Empty text="Nothing planned. Add a note or schedule." />}</div></div>)}
          {sidePanel === "UPCOMING" && (<div className="p-2"><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-semibold"><Clock size={15} className="text-violet-500" />Upcoming work</h2><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">{upcoming.length}</span></div><div className="space-y-3">{upcoming.length ? upcoming.map(entry => <button key={entry.id} type="button" disabled={pending} onClick={() => open(entry)} className="group flex w-full items-start gap-2 rounded-xl border border-transparent p-2 text-left transition hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-900"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${KINDS[entry.kind].dot}`} /><div className="min-w-0"><p className="truncate text-xs font-medium">{entry.title}</p><p className="mt-0.5 text-[10px] text-slate-500">{formatDay(entry.date)} · {entry.time || "All day"}</p></div><ArrowUpRight size={13} className="ml-auto mt-0.5 shrink-0 text-slate-400" /></button>) : <Empty text="No upcoming work." />}</div></div>)}
          {sidePanel === "OVERDUE" && (<div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10"><h2 className="mb-2 text-sm font-semibold text-amber-800 dark:text-amber-300">Past dates · still pending</h2>{[...due].sort(sortEntries).map(entry => <button key={entry.id} type="button" disabled={pending} onClick={() => open(entry)} className="block w-full truncate py-1 text-left text-xs text-amber-700 dark:text-amber-300">{formatDay(entry.endDate)} · {entry.title}</button>)}{due.length === 0 && <Empty text="No overdue entries." />}</div>)}
          <p className="px-2 pb-1 pt-3 text-[10px] leading-4 text-slate-500">{timezone} · Saved through the Calendar API.</p>
        </div>}
        <nav aria-label="Calendar detail panels" className={`${PANEL} flex w-14 shrink-0 flex-col items-center gap-2 p-1.5`}>
          {([
            { key: "DAY", label: "Selected day", icon: CalendarDays, count: dayEntries.length },
            { key: "UPCOMING", label: "Upcoming work", icon: Clock, count: upcoming.length },
            { key: "OVERDUE", label: "Overdue work", icon: AlertCircle, count: due.length },
          ] as const).map(({ key, label, icon: Icon, count }) => <button key={key} type="button" title={label} aria-label={`${label} (${count})`} aria-expanded={sidePanel === key} aria-controls={sidePanel === key ? "calendar-details" : undefined} onClick={() => setSidePanel(current => current === key ? null : key)} className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${sidePanel === key ? "bg-blue-600 text-white shadow-[0_3px_12px_-3px_rgba(37,99,235,0.6)]" : "text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"}`}><Icon size={19} />{count > 0 && <span className={`absolute right-0.5 top-0.5 flex min-w-3.5 items-center justify-center rounded-full px-0.5 text-[8px] font-semibold ${sidePanel === key ? "bg-white/20 text-white" : key === "OVERDUE" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{count > 99 ? "99+" : count}</span>}</button>)}
          <div className="my-0.5 h-px w-8 bg-slate-200 dark:bg-slate-800" />
          <button type="button" title="Add entry to selected day" aria-label="Add entry to selected day" disabled={pending} onClick={() => open(blank(selected || today))} className="flex h-11 w-11 items-center justify-center rounded-xl text-blue-600 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-blue-400 dark:hover:bg-blue-500/10"><Plus size={20} /></button>
        </nav>
      </aside>
    </div>
    <p className="mt-2 text-[10px] text-slate-400">Saved through the Calendar API · {timezone}</p>
    <style>{`
      /* Portal content needs its own selector, outside the calendar section. */
      .calendar-message-tail { bottom: -17px; clip-path: polygon(12% 0, 100% 0, 0 100%); }
      .calendar-message-tail > span { clip-path: polygon(12% 0, 100% 0, 0 100%); }
      .calendar-sales-message[data-side="bottom"] .calendar-message-tail { bottom: auto; top: -17px; transform: scaleY(-1); }
      .calendar-sales-message { transform-origin: var(--radix-popover-content-transform-origin); }
      .calendar-sales-message[data-state="open"] { animation: calendar-message-in 650ms cubic-bezier(0.22, 1, 0.36, 1) both !important; }
      .calendar-sales-message[data-state="closed"] { animation: calendar-message-out 200ms ease-in both !important; }
      @keyframes calendar-message-in {
        from { opacity: 0; transform: translateY(8px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes calendar-message-out {
        from { opacity: 1; transform: translateY(0) scale(1); }
        to { opacity: 0; transform: translateY(4px) scale(0.98); }
      }
      @media (prefers-reduced-motion: reduce) {
        .calendar-sales-message[data-state] { animation: none !important; }
      }

      .pos-calendar .calendar-compact-more { display: none; }
      .pos-calendar .calendar-only-compact { display: none; }
      @media (min-width: 1024px) and (max-width: 1366px) and (max-height: 900px) and (orientation: landscape) {
        .pos-calendar .calendar-month-day { min-height: 80px; height: clamp(80px, calc((100dvh - 390px) / 6), 88px); }
        .pos-calendar .calendar-month-day .calendar-events > button:nth-child(2):not(.calendar-more),
        .pos-calendar .calendar-month-day .calendar-events > button:nth-child(3):not(.calendar-more) { display: none; }
        .pos-calendar .calendar-more { display: inline-block; }
        .pos-calendar .calendar-compact-more { display: inline; }
        .pos-calendar .calendar-full-more { display: none; }
        .pos-calendar .calendar-week-day { min-height: 390px; max-height: 450px; overflow-y: auto; }
      }
    `}</style>
    {draft && draftScope.current === scope && !deleteId && !conflict && <EntryEditor key={draft.id || "new"} draft={draft} onChange={setDraft} onClose={closeEditor} onSave={save} onDelete={() => { if(draft.id) setDeleteId(draft.id); }} error={formError} timezone={timezone} disabled={pending || Boolean(conflict)} saving={saving} />}
    <AlertDialog open={deleteId!==null && !conflict && draftScope.current===scope} onOpenChange={value=>{if(!value&&!saving)setDeleteId(null);}}><AlertDialogContent><AlertDialogTitle>Delete calendar entry?</AlertDialogTitle><AlertDialogDescription>This removes the entry from the database.</AlertDialogDescription>{formError&&<p role="alert">{formError}</p>}<div className="mt-4 flex gap-2"><button className={BUTTON} disabled={saving} onClick={()=>setDeleteId(null)}>Cancel</button><button className={PRIMARY} disabled={pending||Boolean(conflict)} onClick={()=>{if(draft&&draft.id===deleteId)void mutate(draft,"delete");}}>Delete entry</button></div></AlertDialogContent></AlertDialog>
    <AlertDialog open={Boolean(conflict) && draftScope.current===scope} onOpenChange={value=>{if(!value&&!saving){setConflict(null);setLatest(null);}}}><AlertDialogContent><AlertDialogTitle>Calendar entry changed</AlertDialogTitle><AlertDialogDescription>Your unsaved values are preserved. Load the latest entry, compare it, then explicitly review its version before saving again.</AlertDialogDescription>{formError&&<p role="alert">{formError}</p>}{latest&&<div className="my-3 text-sm"><p>Latest version {latest.version}: {latest.title} / {latest.date} to {latest.endDate} / {latest.kind} / {latest.priority}</p><p>{latest.time} to {latest.endTime} / {latest.assignee} / {latest.completed?"Completed":"Pending"}</p><p className="whitespace-pre-wrap">{latest.note}</p></div>}<div className="mt-4 flex flex-wrap gap-2"><button className={BUTTON} disabled={saving} onClick={()=>{setConflict(null);setLatest(null);}}>Keep editing</button><button className={BUTTON} disabled={saving} onClick={()=>void loadLatest()}>Load latest entry</button>{latest&&<button className={PRIMARY} disabled={saving} onClick={()=>{draftScope.current=scope;setDraft(prev=>({...((prev?.id===latest.id)?prev:latest),version:latest.version}));setDeleteId(null);setConflict(null);setLatest(null);setFormError("Latest version selected after review. Review the form and save explicitly.");}}>Reviewed: keep my values with latest version</button>}</div></AlertDialogContent></AlertDialog>
  </section>;
}
// Match the project's Radix Popover API. Anchor to the entire day cell,
// and keep hover on native DOM elements to avoid forwarding custom props.
function SalesDatePopover({ label, selected, dateNumber, onSelect, onPreview, className, dateClassName, preview, children }: {
  label: string; selected: boolean; dateNumber: number; onSelect: () => void;
  onPreview: () => void; className: string; dateClassName: string;
  preview: ReactNode; children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchUntil = useRef(0);
  function clearTimers() {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null; closeTimer.current = null;
  }
  useEffect(() => () => clearTimers(), []);
  function enter() {
    if (Date.now() < touchUntil.current) return;
    clearTimers();
    if (open) return;
    onPreview(); // Load once during the hover wait so the message can show actual sales.
    openTimer.current = setTimeout(() => { openTimer.current = null; setOpen(true); }, 5_000);
  }
  function leave() {
    if (Date.now() < touchUntil.current) return;
    clearTimers();
    closeTimer.current = setTimeout(() => { closeTimer.current = null; setOpen(false); }, 200);
  }
  return <Popover open={open} onOpenChange={next => { clearTimers(); setOpen(next); if (next) onPreview(); }}>
    <PopoverAnchor asChild>
      <div className={className} onMouseEnter={enter} onMouseLeave={leave}
        onPointerEnter={event => { if (event.pointerType === "mouse") enter(); }}
        onPointerLeave={event => { if (event.pointerType === "mouse") leave(); }}
        onClick={event => {
          if ((event.target as HTMLElement).closest("button")) return;
          clearTimers(); setOpen(current => !current); onSelect(); onPreview();
        }}
        onPointerDown={event => { if (event.pointerType === "touch") { touchUntil.current = Date.now() + 1000; clearTimers(); } }}
        onClickCapture={event => {
          const button = (event.target as HTMLElement).closest("button");
          if (button && !button.hasAttribute("data-sales-date")) { clearTimers(); setOpen(false); }
        }}>
        <PopoverTrigger asChild>
          <button type="button" data-sales-date="" aria-label={label} aria-pressed={selected} className={dateClassName} onClick={onSelect}>{dateNumber}</button>
        </PopoverTrigger>
        {children}
      </div>
    </PopoverAnchor>
    <PopoverContent aria-label={`Daily sales: ${label}`} side="top" align="start" sideOffset={18} collisionPadding={20}
      onOpenAutoFocus={event => event.preventDefault()} onCloseAutoFocus={event => event.preventDefault()}
      onMouseEnter={clearTimers} onMouseLeave={leave}
      className="calendar-sales-message !z-[100] !w-[640px] !max-w-[calc(100vw-40px)] !overflow-visible !rounded-2xl !border-slate-200 !bg-white !p-0 !text-slate-900 shadow-[0_20px_64px_-20px_rgba(37,99,235,0.32)] dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100">
      <span aria-hidden="true" className="calendar-message-tail absolute left-6 h-[18px] w-7 bg-slate-200 dark:bg-slate-700"><span className="absolute left-px top-0 h-4 w-[26px] bg-white dark:bg-slate-950" /></span>
      <div className="overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-blue-100 bg-blue-50/70 px-4 py-3 dark:border-blue-500/15 dark:bg-blue-500/[0.08]">
        <div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-[0_3px_12px_-4px_rgba(37,99,235,0.5)]"><CalendarDays size={17} /></div><div><p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Day overview</p><p className="mt-0.5 text-[10px] text-blue-600 dark:text-blue-300">Shop sales & calendar records</p></div></div>
        <button type="button" aria-label="Close sales message" onClick={() => { clearTimers(); setOpen(false); }} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-100 hover:text-slate-700 dark:hover:bg-blue-500/15 dark:hover:text-slate-200"><X size={14} /></button>
      </div>
      <div className="max-h-[min(560px,calc(var(--radix-popover-content-available-height,100dvh)-76px))] overflow-y-auto overscroll-contain [scrollbar-width:thin]" tabIndex={0} role="region" aria-label={`Daily sales and calendar records: ${label}`}>
        {preview}
      </div>
      </div>
    </PopoverContent>
  </Popover>;
}
function DayCalendarRecords({ day, entries, loading, error }: { day: string; entries: Entry[]; loading: boolean; error: string }) {
  // The message shows every entry covering this date, independently of grid filters.
  const records = entries.filter(entry => covers(entry, day)).sort(sortEntries);
  return <section aria-label="Calendar records for this day" className="min-w-0 border-t border-slate-100 p-4 dark:border-slate-800 sm:border-l sm:border-t-0">
    <div className="mb-3 flex items-center justify-between gap-2">
      <h4 className="flex items-center gap-1.5 text-xs font-semibold"><StickyNote size={13} className="text-blue-500" />Calendar records</h4>
      {!loading && <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">{records.length}</span>}
    </div>
    {loading ? <p role="status" className="text-[11px] text-slate-500">Loading calendar records…</p> : <>
      {error && <p role="alert" className="mb-2 text-[11px] leading-4 text-amber-700 dark:text-amber-300">{error}</p>}
      {!records.length && !error && <p className="text-[11px] text-slate-500">No calendar entries for this day.</p>}
      <div className="max-h-80 space-y-2 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]" tabIndex={records.length ? 0 : undefined} aria-label="Daily entry list">{records.map(entry => {
        const meta = KINDS[entry.kind]; const Icon = meta.icon;
        return <article key={entry.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-start gap-2">
            <span aria-hidden="true" className={`mt-0.5 shrink-0 rounded-lg border p-1.5 ${meta.color}`}><Icon size={13} /></span>
            <div className="min-w-0 flex-1">
              <p className={`break-words text-xs font-semibold ${entry.completed ? "text-slate-500 line-through dark:text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>{entry.title}</p>
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{meta.label}</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400"><Clock size={10} />{entry.time || "All day"}{entry.endTime ? ` – ${entry.endTime}` : ""}</span>
            <span className={entry.completed ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}>{entry.completed ? "Completed" : "Pending"}</span>
            {entry.priority === "HIGH" && <span className="font-medium text-rose-600 dark:text-rose-400">High priority</span>}
          </div>
          {entry.date !== entry.endDate && <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{formatDay(entry.date, { month: "short", day: "numeric", year: "numeric" })} – {formatDay(entry.endDate, { month: "short", day: "numeric", year: "numeric" })}</p>}
          {entry.assignee && <p className="mt-1 flex items-start gap-1 break-words text-[10px] text-slate-500 dark:text-slate-400"><Users size={11} className="mt-0.5 shrink-0" /><span className="min-w-0 break-words">{entry.assignee}</span></p>}
          {entry.note && <p className="mt-2 whitespace-pre-wrap break-words border-t border-slate-200/70 pt-2 text-[11px] leading-4 text-slate-600 dark:border-slate-800 dark:text-slate-300">{entry.note}</p>}
        </article>;
      })}</div>
    </>}
  </section>;
}
function DaySalesSummary({ summary, money, undatedCount }: { summary: DaySales; money: (amount: number) => string; undatedCount: number }) {
  const incomplete = summary.invalidCount > 0 || undatedCount > 0;
  const unavailable = summary.count === 0 && incomplete;
  return <div className="p-4"><div className="rounded-xl bg-blue-50 px-3 py-3 dark:bg-blue-500/10"><p className="flex items-center gap-1.5 text-[10px] font-medium text-blue-600 dark:text-blue-300"><TrendingUp size={13} />{incomplete ? "Available receipts subtotal" : "Daily revenue"}</p><p className="mt-1 break-words text-2xl font-bold tracking-tight text-blue-700 dark:text-blue-300">{unavailable ? "—" : money(summary.total)}</p></div>
    <div className="mt-3 grid grid-cols-2 gap-3"><div><p className="flex items-center gap-1 text-[10px] text-slate-500"><ReceiptText size={11} />{incomplete ? "Included receipts" : "Receipts"}</p><p className="mt-1 text-sm font-semibold">{summary.count}</p></div><div><p className="text-[10px] text-slate-500">Average sale</p><p className="mt-1 text-sm font-semibold">{unavailable ? "—" : money(summary.count ? summary.total / summary.count : 0)}</p></div></div>
    {summary.count ? <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">{Object.entries(summary.payments).map(([payment, amount]) => <div key={payment} className="flex items-center justify-between gap-2 text-[11px]"><span className="flex items-center gap-1.5 text-slate-500">{payment === "CASH" ? <Banknote size={12} /> : payment === "CARD" ? <CreditCard size={12} /> : <Wallet size={12} />}{payment}</span><span className="font-medium">{money(amount)}</span></div>)}</div> : <p className="mt-3 text-[11px] text-slate-500">{unavailable ? "Daily total cannot be confirmed from the available receipts." : "No paid POS receipts for this day."}</p>}
    {(summary.invalidCount > 0 || undatedCount > 0) && <div role="status" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[10px] leading-4 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
      {summary.invalidCount > 0 && <p>{summary.invalidCount} receipt(s) on this date have invalid totals and are excluded.</p>}
      {undatedCount > 0 && <p>{undatedCount} receipt(s) have unreadable dates and are excluded. Daily totals may be incomplete.</p>}
    </div>}
    {summary.legacyCount > 0 && <p className="mt-2 text-[10px] leading-4 text-slate-400">{summary.legacyCount} legacy receipt(s) use their original recorded date because no timezone offset was saved.</p>}
  </div>;
}
function Empty({ text }: { text: string }) { return <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center dark:border-slate-800 dark:bg-slate-900/40"><CalendarDays aria-hidden="true" size={22} className="mb-3 text-slate-300 dark:text-slate-600" /><p className="max-w-52 text-xs leading-5 text-slate-500 dark:text-slate-400">{text}</p></div>; }
function EntryRow({ entry, onOpen, onToggle, disabled }: { entry: Entry; onOpen: () => void; onToggle: () => void; disabled: boolean }) {
  const meta = KINDS[entry.kind]; const Icon = meta.icon;
  return <div className="flex min-w-0 flex-1 items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50"><button type="button" disabled={disabled} onClick={onToggle} aria-label={`${entry.completed ? "Mark pending" : "Mark done"}: ${entry.title}`} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${entry.completed ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 dark:border-slate-600"}`}>{entry.completed && <Check size={13} />}</button><button type="button" disabled={disabled} onClick={onOpen} className="min-w-0 flex-1 text-left"><p className={`break-words text-sm font-medium ${entry.completed ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-200"}`}>{entry.title}{entry.priority === "HIGH" && <span className="ml-1 text-xs text-rose-500">!</span>}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500"><Icon size={12} />{meta.label} · {entry.time || "All day"}{entry.endTime ? `–${entry.endTime}` : ""}</p>{entry.assignee && <p className="mt-0.5 text-[10px] text-slate-400">{entry.assignee}</p>}</button></div>;
}
function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const scroll = document.body.style.overflow; document.body.style.overflow = "hidden";
    const focusables = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]') ?? []);
    focusables()[0]?.focus();
    function key(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closeRef.current(); }
      if (event.key === "Tab") { const elements = focusables(); const first = elements[0]; const last = elements[elements.length - 1]; if (!first) return; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } }
    }
    document.addEventListener("keydown", key);
    return () => { document.body.style.overflow = scroll; document.removeEventListener("keydown", key); previous?.focus(); };
  }, []);
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div ref={ref} role="dialog" aria-modal="true" aria-label={title} className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-16px_rgba(37,99,235,0.25)] dark:border-slate-700 dark:bg-slate-950"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2><button type="button" aria-label="Close dialog" onClick={onClose} className={BUTTON}><X size={17} /></button></div>{children}</div></div>;
}
function EntryEditor({ draft, onChange, onClose, onSave, onDelete, error, timezone, disabled, saving }: { draft: Entry; onChange: (entry: Entry) => void; onClose: () => void; onSave: () => void; onDelete: () => void; error: string; timezone: string; disabled: boolean; saving: boolean }) {
  const patch = (value: Partial<Entry>) => onChange({ ...draft, ...value });
  return <Dialog title={draft.id ? "Edit calendar entry" : "New calendar entry"} onClose={onClose}><form onSubmit={e => { e.preventDefault(); onSave(); }} className="space-y-4 text-slate-800 dark:text-slate-200"><fieldset disabled={disabled} className="space-y-4">
    <label className="block text-xs font-medium">Title<input required maxLength={120} className={`${INPUT} mt-1`} value={draft.title} onChange={e => patch({ title: e.target.value })} placeholder="e.g. Supplier delivery / Staff meeting" /></label>
    <div className="grid grid-cols-2 gap-3"><label className="text-xs font-medium">Type<select className={`${INPUT} mt-1`} value={draft.kind} onChange={e => patch({ kind: e.target.value as Kind })}>{Object.entries(KINDS).map(([key, meta]) => <option value={key} key={key}>{meta.label}</option>)}</select></label><label className="text-xs font-medium">Priority<select className={`${INPUT} mt-1`} value={draft.priority} onChange={e => patch({ priority: e.target.value as Priority })}><option value="NORMAL">Normal</option><option value="HIGH">High</option></select></label></div>
    <div className="grid grid-cols-2 gap-3"><label className="text-xs font-medium">Start date<input required type="date" className={`${INPUT} mt-1`} value={draft.date} onChange={e => patch({ date: e.target.value, endDate: draft.endDate < e.target.value ? e.target.value : draft.endDate })} /></label><label className="text-xs font-medium">End date<input required type="date" min={draft.date} className={`${INPUT} mt-1`} value={draft.endDate} onChange={e => patch({ endDate: e.target.value })} /></label></div>
    <div className="grid grid-cols-2 gap-3"><label className="text-xs font-medium">Start time (optional)<input type="time" className={`${INPUT} mt-1`} value={draft.time} onChange={e => patch({ time: e.target.value, endTime: e.target.value ? draft.endTime : "" })} /></label><label className="text-xs font-medium">End time (optional)<input type="time" className={`${INPUT} mt-1`} value={draft.endTime} onChange={e => patch({ endTime: e.target.value })} /></label></div>
    <p className="text-[11px] text-slate-500">Times use {timezone}. Leave times empty for an all-day entry.</p>
    <label className="block text-xs font-medium">Assigned to (optional)<input maxLength={120} className={`${INPUT} mt-1`} value={draft.assignee} onChange={e => patch({ assignee: e.target.value })} placeholder="Staff name / Supplier / Team" /></label>
    <label className="block text-xs font-medium">Notes<textarea maxLength={5000} className={`${INPUT} mt-1 !h-28 resize-y py-3`} value={draft.note} onChange={e => patch({ note: e.target.value })} placeholder="Checklist, delivery details or other notes…" /></label>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.completed} onChange={e => patch({ completed: e.target.checked })} />Completed</label>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <div className="flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-4 dark:border-white/10"><div>{draft.id && <button type="button" disabled={disabled} onClick={onDelete} className={`${BUTTON} !text-red-600`}><Trash2 size={15} />Delete</button>}</div><div className="flex gap-2"><button type="button" className={BUTTON} onClick={onClose}>Cancel</button><button type="submit" disabled={disabled} className={PRIMARY}>{saving ? "Saving..." : "Save entry"}</button></div></div>
  </fieldset></form></Dialog>;
}
