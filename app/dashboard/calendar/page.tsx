"use client";

/**
 * Install at src/app/dashboard/calendar/page.tsx (or app/dashboard/calendar/page.tsx).
 * Existing dependencies: next-auth, lucide-react and the shop timezone provider.
 * Add a sidebar link to /dashboard/calendar.
 * This initial implementation stores calendar data in this browser, scoped to
 * shop + account. It does NOT synchronize with the backend or send reminders.
 * Backup exports include notes. Keep them private. Dates are shop calendar dates;
 * event times are wall-clock times in the displayed shop timezone.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useShopTimezone } from "@/components/shop-timezone-provider";
import { getShopTimezone } from "@/lib/date-time";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Search, X, Check, Clock, StickyNote, Truck, Users, Wrench, Megaphone, Wallet, Download, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";

type Kind = "NOTE" | "DELIVERY" | "SHIFT" | "MAINTENANCE" | "PROMOTION" | "PAYMENT";
type Priority = "NORMAL" | "HIGH";
type View = "MONTH" | "WEEK" | "AGENDA";
type Entry = {
  id: string; title: string; note: string; kind: Kind; priority: Priority;
  date: string; endDate: string; time: string; endTime: string;
  assignee: string; completed: boolean; updatedAt: string;
};
type Snapshot = { version: 1; revision: string; entries: Entry[] };
const KINDS = {
  NOTE: { label: "Note / Task", icon: StickyNote, color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20", dot: "bg-blue-500" },
  DELIVERY: { label: "Stock delivery", icon: Truck, color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20", dot: "bg-emerald-500" },
  SHIFT: { label: "Staff shift", icon: Users, color: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20", dot: "bg-violet-500" },
  MAINTENANCE: { label: "Maintenance", icon: Wrench, color: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20", dot: "bg-amber-500" },
  PROMOTION: { label: "Promotion", icon: Megaphone, color: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-500/10 dark:text-pink-300 dark:border-pink-500/20", dot: "bg-pink-500" },
  PAYMENT: { label: "Bill / Payment", icon: Wallet, color: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/20", dot: "bg-cyan-500" },
} as const;
const PANEL = "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-black";
const BUTTON = "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 dark:border-white/10 dark:bg-black dark:text-slate-300 dark:hover:bg-white/5";
const INPUT = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-slate-950 dark:text-white";
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
function blank(date: string): Entry { return { id: "", title: "", note: "", kind: "NOTE", priority: "NORMAL", date, endDate: date, time: "", endTime: "", assignee: "", completed: false, updatedAt: "" }; }
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
function decodeSnapshot(raw: string | null): Snapshot {
  if (!raw) return { version: 1, revision: "", entries: [] };
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== "object") throw new Error("Invalid calendar data. Your saved data has not been overwritten.");
  const value = data as Snapshot;
  if (value.version !== 1 || typeof value.revision !== "string" || !Array.isArray(value.entries)) throw new Error("Unsupported calendar data. Your saved data has not been overwritten.");
  const ids = new Set<string>();
  for (const entry of value.entries) {
    if (!entry || typeof entry.id !== "string" || !entry.id || ids.has(entry.id) || typeof entry.title !== "string" || typeof entry.note !== "string" || typeof entry.assignee !== "string" || typeof entry.time !== "string" || typeof entry.endTime !== "string" || typeof entry.updatedAt !== "string" || typeof entry.completed !== "boolean" || !Object.keys(KINDS).includes(entry.kind) || !["NORMAL", "HIGH"].includes(entry.priority) || validateEntry(entry)) throw new Error("Invalid saved calendar entries. Your saved data has not been overwritten.");
    ids.add(entry.id);
  }
  return value;
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
// These claims select a local storage namespace; decoding is not authentication
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

export default function PosCalendarPage() {
  const timezoneSubscription = useShopTimezone();
  const timezone = getShopTimezone();
  const { data: session, status } = useSession();
  const { shop, account } = useMemo(() => resolveCalendarIdentity(session), [session]);
  const storageKey = shop && account ? `binhlaig:calendar:v1:${encodeURIComponent(shop)}:${encodeURIComponent(account)}` : "";
  const [today, setToday] = useState("");
  const [anchor, setAnchor] = useState("");
  const [selected, setSelected] = useState("");
  const [view, setView] = useState<View>("MONTH");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<Kind | "ALL">("ALL");
  const [completion, setCompletion] = useState("ALL");
  const [draft, setDraft] = useState<Entry | null>(null);
  const [formError, setFormError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const revision = useRef("");
  const editingVersion = useRef("");
  const activeKey = useRef("");
  const initializedKey = useRef("");
  useEffect(() => {
    function update() { const key = todayKey(getShopTimezone()); setToday(key); setAnchor(a => a || key); setSelected(d => d || key); }
    update(); const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, [timezoneSubscription]);
  useEffect(() => {
    setReady(false); setEntries([]); setDraft(null); setDeleteId(null); setError(""); setMessage("");
    revision.current = ""; activeKey.current = storageKey; initializedKey.current = "";
    if (status !== "authenticated" || !storageKey) return;
    function load() {
      try { const snap = decodeSnapshot(localStorage.getItem(storageKey)); setEntries(snap.entries); revision.current = snap.revision; initializedKey.current = storageKey; setReady(true); setError(""); }
      catch (reason) { setReady(false); setError(reason instanceof Error ? reason.message : "Unable to read saved calendar."); }
    }
    load();
    const listener = (event: StorageEvent) => { if ((event.key === storageKey || event.key === null) && event.storageArea === localStorage) load(); };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, [storageKey, status]);
  useEffect(() => { if (!message) return; const timer = window.setTimeout(() => setMessage(""), 4000); return () => window.clearTimeout(timer); }, [message]);
  function commit(next: Entry[]) {
    if (!ready || activeKey.current !== storageKey || initializedKey.current !== storageKey) return false;
    try {
      const current = decodeSnapshot(localStorage.getItem(storageKey));
      if (current.revision !== revision.current) { setEntries(current.entries); revision.current = current.revision; setError("Calendar changed in another tab. Review the latest entries and try again."); return false; }
      const snap: Snapshot = { version: 1, revision: crypto.randomUUID(), entries: next };
      localStorage.setItem(storageKey, JSON.stringify(snap));
      revision.current = snap.revision; setEntries(next); setError(""); return true;
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save calendar. Check browser storage."); return false; }
  }
  function save() {
    if (!draft) return;
    const invalid = validateEntry(draft); if (invalid) { setFormError(invalid); return; }
    const saved = { ...draft, id: draft.id || crypto.randomUUID(), title: draft.title.trim(), assignee: draft.assignee.trim(), updatedAt: new Date().toISOString() };
    if (draft.id && entries.find(e => e.id === draft.id)?.updatedAt !== editingVersion.current) { setFormError("This entry changed in another tab. Close and reopen it before editing."); return; }
    const next = draft.id ? entries.map(e => e.id === draft.id ? saved : e) : [...entries, saved];
    if (draft.id && !entries.some(e => e.id === draft.id)) { setFormError("This entry was removed in another tab. Close this form and review the calendar."); return; }
    if (commit(next)) { setDraft(null); setSelected(saved.date); setAnchor(saved.date); setMessage("Calendar entry saved."); } else setFormError("Could not save. Check the calendar error message and try again.");
  }
  function toggle(entry: Entry) { if (commit(entries.map(e => e.id === entry.id ? { ...e, completed: !e.completed, updatedAt: new Date().toISOString() } : e))) setMessage(entry.completed ? "Marked pending." : "Marked done."); }
  function open(entry: Entry) { editingVersion.current = entry.updatedAt; setFormError(""); setDraft({ ...entry }); }
  const filtered = useMemo(() => entries.filter(e => (kind === "ALL" || e.kind === kind) && (completion === "ALL" || e.completed === (completion === "DONE")) && (!query.trim() || `${e.title} ${e.note} ${e.assignee}`.toLowerCase().includes(query.trim().toLowerCase()))).sort(sortEntries), [entries, kind, completion, query]);
  const first = anchor ? view === "WEEK" ? weekStart(anchor) : weekStart(monthStart(anchor)) : "";
  const days = first ? Array.from({ length: view === "WEEK" ? 7 : 42 }, (_, i) => addDays(first, i)) : [];
  const monthLast = anchor ? addDays(monthMove(anchor, 1), -1) : "";
  const agenda = filtered.filter(e => e.date <= monthLast && e.endDate >= monthStart(anchor || "2000-01-01"));
  const dayEntries = filtered.filter(e => selected && covers(e, selected));
  const upcoming = entries.filter(e => !e.completed && e.endDate >= today).sort(sortEntries).slice(0, 5);
  const due = entries.filter(e => !e.completed && e.endDate < today);
  const counts = [
    { label: "Today", value: entries.filter(e => today && covers(e, today)).length, icon: CalendarDays, color: "text-blue-600 dark:text-blue-400" },
    { label: "Pending", value: entries.filter(e => !e.completed).length, icon: Clock, color: "text-violet-600 dark:text-violet-400" },
    { label: "Overdue dates", value: due.length, icon: AlertCircle, color: "text-amber-600 dark:text-amber-400" },
    { label: "Completed", value: entries.filter(e => e.completed).length, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400" },
  ];
  function backup() {
    const blob = new Blob([JSON.stringify({ version: 1, shop, timezone, entries }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `pos-calendar-${today}.json`; a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (status === "loading" || !today) return <div className="py-20 text-center text-sm text-slate-500">Loading calendar…</div>;
  if (status !== "authenticated") return <div className={`${PANEL} p-8 text-center text-slate-600 dark:text-slate-300`}>Sign in to open your POS calendar.</div>;
  if (!storageKey) return <div role="alert" className={`${PANEL} p-6 text-sm text-slate-600 dark:text-slate-300`}>Calendar cannot identify the current shop from this login. Sign out and sign in again. If this continues, your NextAuth session must include shopId / shopCode or the backend accessToken.</div>;
  const pending = !ready || initializedKey.current !== storageKey;
  if (pending) return <div role="status" className={`${PANEL} p-6 text-sm text-slate-600 dark:text-slate-300`}>{error || "Loading saved calendar…"}</div>;
  return <section className="py-5 text-slate-950 dark:text-white">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">POS Calendar</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Plan shop operations, keep notes and track work.</p></div>
      <div className="flex gap-2"><button type="button" disabled={pending} onClick={backup} className={BUTTON}><Download size={16} />Backup</button><button type="button" disabled={pending} onClick={() => open(blank(selected || today))} className="flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40"><Plus size={17} />Add entry</button></div>
    </div>
    {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
    {message && <p role="status" className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{message}</p>}
    <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">{counts.map(({ label, value, icon: Icon, color }) => <div key={label} className={`${PANEL} flex items-center justify-between p-4`}><div><p className="text-xs text-slate-500 dark:text-slate-400">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums">{value}</p></div><div className={`rounded-xl bg-slate-50 p-3 dark:bg-white/5 ${color}`}><Icon size={20} /></div></div>)}</div>
    <div className={`${PANEL} mb-4 flex flex-wrap items-center gap-3 p-3`}>
      <label className="relative min-w-48 flex-1"><span className="sr-only">Search calendar</span><Search size={16} className="absolute left-3 top-3.5 text-slate-400" /><input className={`${INPUT} pl-9`} placeholder="Search notes, plans or staff…" value={query} onChange={e => setQuery(e.target.value)} /></label>
      <select aria-label="Entry type" className={`${INPUT} !w-auto`} value={kind} onChange={e => setKind(e.target.value as Kind | "ALL")}><option value="ALL">All types</option>{Object.entries(KINDS).map(([key, meta]) => <option key={key} value={key}>{meta.label}</option>)}</select>
      <select aria-label="Completion status" className={`${INPUT} !w-auto`} value={completion} onChange={e => setCompletion(e.target.value)}><option value="ALL">All statuses</option><option value="PENDING">Pending</option><option value="DONE">Done</option></select>
      {(query || kind !== "ALL" || completion !== "ALL") && <button type="button" className={BUTTON} onClick={() => { setQuery(""); setKind("ALL"); setCompletion("ALL"); }}>Reset</button>}
    </div>
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className={`${PANEL} min-w-0 overflow-hidden`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-white/10">
          <div className="flex items-center gap-2"><button type="button" className={`${BUTTON} !px-2`} aria-label="Previous period" onClick={() => setAnchor(view === "WEEK" ? addDays(anchor, -7) : monthMove(anchor, -1))}><ChevronLeft size={17} /></button><button type="button" className={`${BUTTON} !px-2`} aria-label="Next period" onClick={() => setAnchor(view === "WEEK" ? addDays(anchor, 7) : monthMove(anchor, 1))}><ChevronRight size={17} /></button><h2 className="ml-1 text-base font-semibold">{view === "WEEK" ? `${formatDay(first)} – ${formatDay(addDays(first, 6), { month: "short", day: "numeric", year: "numeric" })}` : formatDay(anchor, { month: "long", year: "numeric" })}</h2></div>
          <div className="flex flex-wrap gap-2"><button type="button" className={BUTTON} onClick={() => { setAnchor(today); setSelected(today); }}>Today</button><div className="flex rounded-xl bg-slate-100 p-1 dark:bg-white/5">{(["MONTH", "WEEK", "AGENDA"] as View[]).map(mode => <button type="button" key={mode} aria-pressed={view === mode} onClick={() => setView(mode)} className={`min-h-9 rounded-lg px-3 text-xs font-semibold capitalize ${view === mode ? "bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-300" : "text-slate-500"}`}>{mode.toLowerCase()}</button>)}</div></div>
        </div>
        {view === "AGENDA" ? <div className="divide-y divide-slate-100 dark:divide-white/5">{agenda.length ? agenda.map(entry => <div key={entry.id} className="flex items-start gap-3 p-4"><div className="w-16 shrink-0 text-xs font-semibold text-slate-500">{formatDay(entry.date)}</div><EntryRow entry={entry} onOpen={() => open(entry)} onToggle={() => toggle(entry)} disabled={pending} /></div>) : <Empty text="No matching entries this month." />}</div> : <div className="overflow-x-auto">
          <div className={view === "WEEK" ? "min-w-[700px]" : "min-w-[620px]"}>
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 dark:border-white/5 dark:bg-white/[0.03]">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <div key={day} className="p-2 text-center text-xs font-medium text-slate-500">{day}</div>)}</div>
            <div className="grid grid-cols-7">{days.map(day => {
              const list = filtered.filter(e => covers(e, day));
              return <div key={day} className={`border-b border-r border-slate-100 p-2 dark:border-white/5 ${view === "WEEK" ? "min-h-[370px]" : "min-h-[116px]"} ${day === selected ? "bg-blue-50/60 dark:bg-blue-500/[0.06]" : ""} ${view === "MONTH" && day.slice(0, 7) !== anchor.slice(0, 7) ? "bg-slate-50/50 dark:bg-white/[0.02]" : ""}`}>
                <button type="button" onClick={() => setSelected(day)} aria-label={formatDay(day, { weekday: "long", year: "numeric", month: "long", day: "numeric" })} aria-pressed={selected === day} className={`mb-1 flex h-7 w-7 items-center justify-center rounded-lg text-xs font-semibold ${day === today ? "bg-blue-600 text-white" : day.slice(0, 7) !== anchor.slice(0, 7) ? "text-slate-400" : "text-slate-700 dark:text-slate-300"}`}>{dateOf(day).getUTCDate()}</button>
                <div className="space-y-1">{list.slice(0, view === "WEEK" ? list.length : 3).map(entry => <button type="button" key={entry.id} onClick={() => open(entry)} disabled={pending} title={`${entry.title}${entry.time ? ` · ${entry.time}` : ""}`} className={`block w-full truncate rounded-md border px-1.5 py-1 text-left text-[10px] ${KINDS[entry.kind].color} ${entry.completed ? "opacity-50 line-through" : ""}`}>{entry.priority === "HIGH" ? "! " : ""}{entry.time && entry.date === day ? `${entry.time} ` : ""}{entry.title}</button>)}{view === "MONTH" && list.length > 3 && <button type="button" onClick={() => setSelected(day)} className="text-[10px] font-medium text-blue-600 dark:text-blue-400">+{list.length - 3} more</button>}</div>
              </div>;
            })}</div>
          </div>
        </div>}
        <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-200 p-3 dark:border-white/10">{Object.values(KINDS).map(meta => <span key={meta.label} className="flex items-center gap-1.5 text-[10px] text-slate-500"><span className={`h-2 w-2 rounded-full ${meta.dot}`} />{meta.label}</span>)}</div>
      </div>
      <aside className="space-y-4">
        <div className={`${PANEL} p-4`}><div className="mb-3 flex items-center justify-between gap-2"><div><p className="text-xs text-slate-500">Selected day</p><h2 className="mt-1 text-sm font-semibold">{formatDay(selected || today, { weekday: "short", month: "short", day: "numeric" })}</h2></div><button type="button" disabled={pending} onClick={() => open(blank(selected || today))} aria-label="Add entry to selected day" className={`${BUTTON} !px-2`}><Plus size={16} /></button></div><div className="space-y-3">{dayEntries.length ? dayEntries.map(entry => <EntryRow key={entry.id} entry={entry} disabled={pending} onOpen={() => open(entry)} onToggle={() => toggle(entry)} />) : <Empty text="Nothing planned. Add a note or schedule." />}</div></div>
        <div className={`${PANEL} p-4`}><h2 className="mb-3 text-sm font-semibold">Upcoming work</h2><div className="space-y-3">{upcoming.length ? upcoming.map(entry => <button key={entry.id} type="button" disabled={pending} onClick={() => open(entry)} className="flex w-full items-start gap-2 text-left"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${KINDS[entry.kind].dot}`} /><div className="min-w-0"><p className="truncate text-xs font-medium">{entry.title}</p><p className="mt-0.5 text-[10px] text-slate-500">{formatDay(entry.date)} · {entry.time || "All day"}</p></div></button>) : <Empty text="No upcoming work." />}</div></div>
        {due.length > 0 && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10"><h2 className="mb-2 text-sm font-semibold text-amber-800 dark:text-amber-300">Past dates · still pending</h2>{due.sort(sortEntries).slice(0, 3).map(entry => <button key={entry.id} type="button" disabled={pending} onClick={() => open(entry)} className="block w-full truncate py-1 text-left text-xs text-amber-700 dark:text-amber-300">{formatDay(entry.endDate)} · {entry.title}</button>)}</div>}
        <p className="px-1 text-[11px] leading-5 text-slate-500">Shop time: {timezone}. Saved on this browser for this shop and account. No automatic reminders or device sync.</p>
      </aside>
    </div>
    {draft && !deleteId && <EntryEditor key={draft.id || "new"} draft={draft} onChange={setDraft} onClose={() => setDraft(null)} onSave={save} onDelete={() => setDeleteId(draft.id)} error={formError} timezone={timezone} disabled={pending} />}
    {deleteId && <Dialog title="Delete calendar entry?" onClose={() => setDeleteId(null)}>{error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}<p className="text-sm text-slate-500">This removes the entry from this browser. You can keep a backup before deleting it.</p><div className="mt-5 flex justify-end gap-2"><button type="button" className={BUTTON} onClick={() => setDeleteId(null)}>Cancel</button><button type="button" className="min-h-11 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white" onClick={() => { if (commit(entries.filter(e => e.id !== deleteId))) { setDeleteId(null); setDraft(null); setMessage("Entry deleted."); } }}>Delete entry</button></div></Dialog>}
  </section>;
}
function Empty({ text }: { text: string }) { return <p className="py-5 text-center text-xs text-slate-400">{text}</p>; }
function EntryRow({ entry, onOpen, onToggle, disabled }: { entry: Entry; onOpen: () => void; onToggle: () => void; disabled: boolean }) {
  const meta = KINDS[entry.kind]; const Icon = meta.icon;
  return <div className="flex min-w-0 flex-1 items-start gap-2"><button type="button" disabled={disabled} onClick={onToggle} aria-label={`${entry.completed ? "Mark pending" : "Mark done"}: ${entry.title}`} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${entry.completed ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 dark:border-slate-600"}`}>{entry.completed && <Check size={13} />}</button><button type="button" disabled={disabled} onClick={onOpen} className="min-w-0 flex-1 text-left"><p className={`break-words text-sm font-medium ${entry.completed ? "text-slate-400 line-through" : "text-slate-800 dark:text-slate-200"}`}>{entry.title}{entry.priority === "HIGH" && <span className="ml-1 text-xs text-rose-500">!</span>}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-slate-500"><Icon size={12} />{meta.label} · {entry.time || "All day"}{entry.endTime ? `–${entry.endTime}` : ""}</p>{entry.assignee && <p className="mt-0.5 text-[10px] text-slate-400">{entry.assignee}</p>}</button></div>;
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
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div ref={ref} role="dialog" aria-modal="true" aria-label={title} className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-950"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h2><button type="button" aria-label="Close dialog" onClick={onClose} className={BUTTON}><X size={17} /></button></div>{children}</div></div>;
}
function EntryEditor({ draft, onChange, onClose, onSave, onDelete, error, timezone, disabled }: { draft: Entry; onChange: (entry: Entry) => void; onClose: () => void; onSave: () => void; onDelete: () => void; error: string; timezone: string; disabled: boolean }) {
  const patch = (value: Partial<Entry>) => onChange({ ...draft, ...value });
  return <Dialog title={draft.id ? "Edit calendar entry" : "New calendar entry"} onClose={onClose}><form onSubmit={e => { e.preventDefault(); onSave(); }} className="space-y-4 text-slate-800 dark:text-slate-200">
    <label className="block text-xs font-medium">Title<input required maxLength={120} className={`${INPUT} mt-1`} value={draft.title} onChange={e => patch({ title: e.target.value })} placeholder="e.g. Supplier delivery / Staff meeting" /></label>
    <div className="grid grid-cols-2 gap-3"><label className="text-xs font-medium">Type<select className={`${INPUT} mt-1`} value={draft.kind} onChange={e => patch({ kind: e.target.value as Kind })}>{Object.entries(KINDS).map(([key, meta]) => <option value={key} key={key}>{meta.label}</option>)}</select></label><label className="text-xs font-medium">Priority<select className={`${INPUT} mt-1`} value={draft.priority} onChange={e => patch({ priority: e.target.value as Priority })}><option value="NORMAL">Normal</option><option value="HIGH">High</option></select></label></div>
    <div className="grid grid-cols-2 gap-3"><label className="text-xs font-medium">Start date<input required type="date" className={`${INPUT} mt-1`} value={draft.date} onChange={e => patch({ date: e.target.value, endDate: draft.endDate < e.target.value ? e.target.value : draft.endDate })} /></label><label className="text-xs font-medium">End date<input required type="date" min={draft.date} className={`${INPUT} mt-1`} value={draft.endDate} onChange={e => patch({ endDate: e.target.value })} /></label></div>
    <div className="grid grid-cols-2 gap-3"><label className="text-xs font-medium">Start time (optional)<input type="time" className={`${INPUT} mt-1`} value={draft.time} onChange={e => patch({ time: e.target.value, endTime: e.target.value ? draft.endTime : "" })} /></label><label className="text-xs font-medium">End time (optional)<input type="time" className={`${INPUT} mt-1`} value={draft.endTime} onChange={e => patch({ endTime: e.target.value })} /></label></div>
    <p className="text-[11px] text-slate-500">Times use {timezone}. Leave times empty for an all-day entry.</p>
    <label className="block text-xs font-medium">Assigned to (optional)<input maxLength={120} className={`${INPUT} mt-1`} value={draft.assignee} onChange={e => patch({ assignee: e.target.value })} placeholder="Staff name / Supplier / Team" /></label>
    <label className="block text-xs font-medium">Notes<textarea maxLength={5000} className={`${INPUT} mt-1 !h-28 resize-y py-3`} value={draft.note} onChange={e => patch({ note: e.target.value })} placeholder="Checklist, delivery details or other notes…" /></label>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.completed} onChange={e => patch({ completed: e.target.checked })} />Completed</label>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <div className="flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-4 dark:border-white/10"><div>{draft.id && <button type="button" disabled={disabled} onClick={onDelete} className={`${BUTTON} !text-red-600`}><Trash2 size={15} />Delete</button>}</div><div className="flex gap-2"><button type="button" className={BUTTON} onClick={onClose}>Cancel</button><button type="submit" disabled={disabled} className="min-h-11 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white disabled:opacity-40">Save entry</button></div></div>
  </form></Dialog>;
}
