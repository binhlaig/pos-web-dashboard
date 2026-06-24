"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import toast, { Toaster } from "react-hot-toast";
import {
  CalendarDays,
  ChartPie,
  Check,
  Coffee,
  Download,
  Hash,
  Pause,
  Play,
  Settings,
  Square,
  TimerReset,
  UserRound,
  X,
  Pencil,
  Trash,
  Upload,
  FileJson,
  Undo2,
  Search,
  Loader2,
  Sparkles,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { get, post } from "@/lib/timecard/api";
import { decodeJwt, getAccessToken } from "@/app/timecard/auth";

/* ===== fallback employees ===== */
const EMPLOYEES: { id: string; name: string; dept?: string; rate?: number }[] = [
  { id: "1001", name: "Aung Aung", dept: "Sales", rate: 1300 },
  { id: "1002", name: "Su Su", dept: "Cashier", rate: 1200 },
  { id: "1003", name: "Ko Ko", dept: "Stock", rate: 1200 },
  { id: "2001", name: "Mia", dept: "HR", rate: 1500 },
  { id: "1004", name: "Sai", dept: "HR", rate: 2000 },
];

/* ===== types ===== */
interface BreakSpan { start: number; end?: number }
export interface Shift {
  id: string;
  employeeId: string;
  date: string;
  clockIn: number;
  clockOut?: number;
  breaks: BreakSpan[];
  note?: string;
  shopId?: string;
  shopCode?: string;
}
interface ApiBreak { id: number; startTime: string; endTime?: string | null }
interface ApiShift {
  id: number;
  employeeId: number;
  workDate: string;
  clockInTime: string;
  clockOutTime?: string | null;
  note?: string | null;
  breaks: ApiBreak[];
  shopId?: number | string | null;
  shopCode?: string | null;
}
type Staff = {
  id: number; fullName?: string; full_name?: string; email?: string;
  phone?: string; role?: string; branch?: string; status?: string;
  staffId?: string | number; staff_id?: string | number;
  shopId?: string | number; shop_id?: string | number;
  shopCode?: string; shop_code?: string; imageUrl?: string; image_url?: string;
};

/* ===== helpers ===== */
const toYmd = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const prettyHM = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export const prettyClock = (t: number | Date) =>
  new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(t);

export const breakMs = (sh: Shift, now = Date.now()) =>
  sh.breaks.reduce((a, b) => a + ((b.end ?? now) - b.start), 0);

export const workMs = (sh: Shift, now = Date.now()) =>
  Math.max(0, (sh.clockOut ?? now) - sh.clockIn - breakMs(sh, now));

export const onBreak = (sh?: Shift) => !!sh && sh.breaks.some((b) => b.end === undefined);

const weekStart = (d = new Date()) => {
  const n = new Date(d);
  const day = (n.getDay() + 6) % 7;
  n.setHours(0, 0, 0, 0);
  n.setDate(n.getDate() - day);
  return n;
};

function mapApiShift(s: ApiShift): Shift {
  return {
    id: String(s.id),
    employeeId: String(s.employeeId),
    date: s.workDate,
    clockIn: new Date(s.clockInTime).getTime(),
    clockOut: s.clockOutTime ? new Date(s.clockOutTime).getTime() : undefined,
    note: s.note ?? "",
    shopId: s.shopId != null ? String(s.shopId) : "",
    shopCode: s.shopCode ?? "",
    breaks: (s.breaks ?? []).map((b) => ({
      start: new Date(b.startTime).getTime(),
      end: b.endTime ? new Date(b.endTime).getTime() : undefined,
    })),
  };
}

function staffDisplayName(s?: Staff | null) {
  return String(s?.fullName ?? s?.full_name ?? s?.staffId ?? s?.staff_id ?? s?.id ?? "");
}

function useMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => setM(true), []);
  return m;
}

function earningsFmt(v: number) {
  const currency = guessCurrency();
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(v || 0);
}

function guessCurrency(): string {
  if (typeof window === "undefined") return "USD";
  try {
    const l = (Intl.DateTimeFormat().resolvedOptions().locale || navigator?.language || "").toLowerCase();
    if (l.includes("ja")) return "JPY";
    if (l.includes("en-us")) return "USD";
    if (l.includes("en-gb")) return "GBP";
    if (l.includes("de") || l.includes("fr") || l.includes("es")) return "EUR";
  } catch { }
  return "USD";
}

function csvEscape(s: string) {
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function downloadText(text: string, filename: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function toLocalInput(ms: number) {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(v: string) { return new Date(v).getTime(); }

/* ===== Lantern SVG ===== */
function LanternMark({ size = 34, glow = false }: { size?: number; glow?: boolean }) {
  const h = size * 1.5;
  return (
    <svg width={size} height={h} viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="tcLanternGlow" cx="50%" cy="48%" r="50%">
          <stop offset="0%" stopColor="#fff7d6" stopOpacity="0.96" />
          <stop offset="28%" stopColor="#fbbf24" stopOpacity="0.86" />
          <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.44" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="tcLanternMetal" x1="8" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c58a3c" />
          <stop offset="50%" stopColor="#a96b28" />
          <stop offset="100%" stopColor="#8a551d" />
        </linearGradient>
      </defs>
      <line x1="16" y1="0" x2="16" y2="6" stroke={glow ? "#d6ae67" : "#9d6a2b"} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="8" y="6" width="16" height="5" rx="2" fill="url(#tcLanternMetal)" stroke="#7b4a18" strokeWidth="0.8" />
      <rect x="6" y="11" width="20" height="26" rx="3" fill={glow ? "#0e0908" : "#f7edd9"} stroke="#a66b27" strokeWidth="1" />
      {glow && <rect x="6" y="11" width="20" height="26" rx="3" fill="url(#tcLanternGlow)" />}
      {[11, 16, 21].map((x) => (
        <line key={x} x1={x} y1="11" x2={x} y2="37" stroke={glow ? "#6b3e10" : "#b47b34"} strokeWidth="1" opacity="0.95" />
      ))}
      {glow && (
        <>
          <motion.ellipse cx="16" cy="26" rx="4" ry="6" fill="#f59e0b" opacity="0.68"
            animate={{ ry: [6, 7.1, 5.3, 6.7, 6], cx: [16, 15.7, 16.3, 15.9, 16] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }} />
          <motion.ellipse cx="16" cy="27" rx="2.5" ry="4.2" fill="#fde68a"
            animate={{ ry: [4.2, 5, 3.6, 4.5, 4.2] }}
            transition={{ duration: 0.95, repeat: Infinity, ease: "easeInOut" }} />
        </>
      )}
      <rect x="8" y="37" width="16" height="5" rx="2" fill="url(#tcLanternMetal)" stroke="#7b4a18" strokeWidth="0.8" />
      <line x1="16" y1="42" x2="16" y2="47" stroke="#8f5b24" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="47" r="1.5" fill="#8f5b24" />
    </svg>
  );
}

/* ===== ThemeToggle ===== */
function ThemeToggle() {
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();
  if (!mounted) return <div className="h-10 w-14 rounded-2xl" />;
  const isDark = resolvedTheme === "dark";
  return (
    <motion.button type="button" onClick={() => setTheme(isDark ? "light" : "dark")}
      whileHover={{ y: -2, scale: 1.03 }} whileTap={{ scale: 0.95 }}
      className="relative flex w-[58px] flex-col items-center rounded-2xl"
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}>
      {isDark && (
        <div className="pointer-events-none absolute" style={{
          width: 76, height: 76, top: -6, left: "50%", transform: "translateX(-50%)",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(251,191,36,0.52) 0%, rgba(245,158,11,0.18) 52%, transparent 76%)",
          filter: "blur(9px)",
        }} />
      )}
      <LanternMark size={34} glow={isDark} />
      <span style={{ marginTop: 5, fontSize: 7, fontWeight: 700, letterSpacing: "0.2em", color: isDark ? "#c8892a" : "#9a6c2a" }}>
        {isDark ? "NIGHT" : "DAY"}
      </span>
    </motion.button>
  );
}

/* ===== ActionButton ===== */
function ActionButton({ onClick, disabled, icon: Icon, label, intent = "default" }: {
  onClick: () => void; disabled?: boolean; icon: React.ComponentType<any>;
  label: string; intent?: "default" | "primary" | "danger";
}) {
  const base = intent === "primary"
    ? "border border-[rgba(212,163,82,0.45)] bg-gradient-to-r from-[#a07020] to-[#d4a352] text-[#140d05] hover:from-[#b37a22] hover:to-[#deb25a] disabled:opacity-50"
    : intent === "danger"
      ? "border border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/15 disabled:opacity-50 dark:text-rose-300"
      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-[rgba(255,255,255,0.10)] dark:bg-[rgba(255,255,255,0.04)] dark:text-[#d4b68a] dark:hover:bg-[rgba(255,255,255,0.08)]";
  return (
    <Button onClick={onClick} disabled={disabled} className={cn("h-12 justify-center rounded-xl font-bold shadow-sm", base)}>
      <Icon className="mr-2 h-4 w-4" /> {label}
    </Button>
  );
}

/* ===== SessionPill ===== */
function SessionPill({ active, now }: { active?: Shift; now: number }) {
  const net = active ? workMs(active, now) : 0;
  const br = active ? breakMs(active, now) : 0;
  const total = net + br;
  const netPct = total === 0 ? 0 : (net / total) * 100;
  const brPct = total === 0 ? 0 : (br / total) * 100;
  return (
    <div className="rounded-[22px] border border-[rgba(200,137,42,0.14)] bg-[rgba(255,255,255,0.55)] p-4 dark:bg-[rgba(255,255,255,0.03)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <LanternMark size={18} glow />
          <Badge variant="outline" className="text-xs">
            {active ? (onBreak(active) ? "Break" : "Working") : "—"}
          </Badge>
          {active && (
            <span className="text-xs text-slate-500 dark:text-[#8a7a65]">
              Started {prettyClock(active.clockIn)}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-[#8a7a65]">Net</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-[#f3e7d2]">{prettyHM(net)}</p>
        </div>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-[rgba(255,255,255,0.08)]">
        <div className="h-full bg-gradient-to-r from-[#a07020] to-[#d4a352]" style={{ width: `${netPct}%` }} />
        <div className="-mt-3 h-3 bg-amber-500/60" style={{ width: `${brPct}%` }} />
      </div>
      <div className="mt-2 grid grid-cols-3 text-center text-xs text-slate-600 dark:text-[#bca98f]">
        <div>Elapsed: {prettyHM(total)}</div>
        <div>Break: {prettyHM(br)}</div>
        <div>Net: {prettyHM(net)}</div>
      </div>
    </div>
  );
}

/* ===== EmptyState ===== */
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-600 dark:border-white/10 dark:bg-black/20 dark:text-white/60">
      {label}
    </div>
  );
}

/* ===== InsightsChip ===== */
function InsightsChip({ icon: Icon, label, value }: { icon: React.ComponentType<any>; label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
      <Icon className="h-4 w-4 text-sky-600 dark:text-[#c8892a]" />
      <span className="text-slate-500 dark:text-[#8a7a65]">{label}</span>
      <span className="font-medium text-slate-900 dark:text-[#f3e7d2]">{value}</span>
    </div>
  );
}

/* ===== UtilizationRing ===== */
function UtilizationRing({ worked, breakPct }: { worked: number; breakPct: number }) {
  const size = 88, stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const workedLen = Math.max(0, Math.min(c, c * worked));
  const breakLen = Math.max(0, Math.min(c, c * breakPct));
  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-[rgba(200,137,42,0.12)] bg-[rgba(255,255,255,0.45)] px-4 py-3 dark:bg-[rgba(255,255,255,0.03)]">
      <div className="tc-ring">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-slate-200 dark:stroke-white/10" />
          <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-sky-500"
            strokeDasharray={`${workedLen} ${c - workedLen}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
          <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-amber-500"
            strokeDasharray={`${breakLen} ${c - breakLen}`} transform={`rotate(${worked * 360 - 90} ${size / 2} ${size / 2})`} />
        </svg>
        <div className="text-center">
          <p className="text-[10px] uppercase text-slate-500 dark:text-[#8a7a65]">Utilization</p>
          <p className="-mt-1 text-sm font-semibold text-slate-900 dark:text-[#f3e7d2]">{Math.round(worked * 100)}%</p>
        </div>
      </div>
      <div className="text-xs text-slate-600 dark:text-[#bca98f]">
        <p><span className="inline-block h-2 w-2 rounded-full bg-sky-500 align-middle mr-2" /> Worked</p>
        <p><span className="inline-block h-2 w-2 rounded-full bg-amber-500 align-middle mr-2" /> Break</p>
      </div>
    </div>
  );
}

/* ===== EntriesTable ===== */
function EntriesTable({ shifts, now, getEmployee, staffMap, onEdit, onDelete }: {
  shifts: Shift[]; now: number;
  getEmployee: (id: string) => { id: string; name: string; dept?: string } | null;
  staffMap: Record<string, Staff>;
  onEdit: (s: Shift) => void;
  onDelete: (s: Shift) => void;
}) {
  if (shifts.length === 0) return <EmptyState label="No entries" />;
  const totalBreak = shifts.reduce((a, s) => a + breakMs(s, now), 0);
  const totalWork = shifts.reduce((a, s) => a + workMs(s, now), 0);
  const sorted = [...shifts].sort((a, b) => b.clockIn - a.clockIn);

  return (
    <>
      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {sorted.map((s) => {
          const br = breakMs(s, now), wk = workMs(s, now);
          const emp = getEmployee(s.employeeId);
          const staff = staffMap[String(s.employeeId)];
          const displayName = staff?.fullName ?? staff?.full_name ?? emp?.name ?? `ID ${s.employeeId}`;
          const displayStaffId = staff?.staffId ?? staff?.staff_id ?? null;
          const isLive = !s.clockOut, isOnBreak = isLive && onBreak(s);
          return (
            <div key={s.id} className="rounded-2xl border border-[rgba(200,137,42,0.12)] bg-white p-4 shadow-sm dark:border-[rgba(255,255,255,0.08)] dark:bg-[rgba(255,255,255,0.03)]">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-900 dark:text-white">{String(displayName)}</div>
                  <div className="text-xs text-slate-500 dark:text-white/60">
                    {displayStaffId ? `Staff ID: ${String(displayStaffId)}` : emp?.dept ?? ""}
                    {s.shopCode ? ` • Shop Code: ${s.shopCode}` : ""}
                  </div>
                </div>
                {isLive ? (
                  <Badge className={cn("border px-2 py-0.5", isOnBreak
                    ? "border-amber-300/60 bg-amber-100 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200"
                    : "border-emerald-300/60 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200")}>
                    {isOnBreak ? "On Break" : "Working"}
                  </Badge>
                ) : (
                  <Badge className="border border-slate-300/60 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white/80 px-2 py-0.5">Finished</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Date", val: s.date },
                  { label: "Worked", val: prettyHM(wk) },
                  { label: "Clock In", val: prettyClock(s.clockIn) },
                  { label: "Clock Out", val: s.clockOut ? prettyClock(s.clockOut) : "—" },
                  { label: "Break", val: prettyHM(br) },
                  { label: "Note", val: s.note ?? "—" },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div className="text-xs text-slate-500 dark:text-white/60">{label}</div>
                    <div className="text-slate-800 dark:text-white/90 line-clamp-2">{val}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => onEdit(s)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => onDelete(s)}><Trash className="h-4 w-4" /></Button>
              </div>
            </div>
          );
        })}
        <div className="rounded-2xl border border-[rgba(200,137,42,0.12)] bg-[rgba(255,255,255,0.45)] px-4 py-3 text-sm dark:border-[rgba(255,255,255,0.08)] dark:bg-[rgba(255,255,255,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-[#bca98f]">Total Break</span>
            <span className="font-medium text-slate-900 dark:text-[#f3e7d2]">{prettyHM(totalBreak)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-slate-600 dark:text-[#bca98f]">Total Work</span>
            <span className="font-semibold text-slate-900 dark:text-[#f3e7d2]">{prettyHM(totalWork)}</span>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-[20px] border border-[rgba(200,137,42,0.12)] dark:border-[rgba(255,255,255,0.08)]">
        <div className="overflow-x-auto">
          <table className="sticky-th zebra min-w-[1080px] table-fixed divide-y divide-slate-200 dark:divide-white/10">
            <thead className="bg-[#faf4ea] text-xs uppercase tracking-wide text-[#8a6c47] dark:bg-[rgba(255,255,255,0.04)] dark:text-[#8a7a65]">
              <tr>
                {["Status", "Date", "Employee", "Clock In", "Clock Out", "Break", "Worked", "Note", "Actions"].map(h => (
                  <th key={h} className="px-4 py-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm dark:divide-white/10">
              {sorted.map((s) => {
                const br = breakMs(s, now), wk = workMs(s, now);
                const emp = getEmployee(s.employeeId);
                const staff = staffMap[String(s.employeeId)];
                const displayName = staff?.fullName ?? staff?.full_name ?? emp?.name ?? `ID ${s.employeeId}`;
                const displayStaffId = staff?.staffId ?? staff?.staff_id ?? null;
                const isLive = !s.clockOut, isOnBreak = isLive && onBreak(s);
                return (
                  <tr key={s.id} className={cn("hover:bg-slate-50 dark:hover:bg-white/5", isLive && "bg-amber-50/70 dark:bg-[rgba(200,137,42,0.08)]")}>
                    <td className="px-4 py-3">
                      {isLive ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-60" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" />
                          </span>
                          <Badge className={cn("border px-2 py-0.5", isOnBreak
                            ? "border-amber-300/60 bg-amber-100 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200"
                            : "border-emerald-300/60 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200")}>
                            {isOnBreak ? "On Break" : "Working Now"}
                          </Badge>
                        </span>
                      ) : (
                        <Badge className="border border-slate-300/60 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white/80 px-2 py-0.5">Finished</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-white/80">{s.date}</td>
                    <td className="px-4 py-3">
                      <div className={cn("font-medium", staff || emp ? "text-slate-900 dark:text-white" : "text-rose-700 dark:text-rose-300")}>{String(displayName)}</div>
                      <div className="text-xs text-slate-500 dark:text-white/60">{displayStaffId ? `Staff ID: ${String(displayStaffId)}` : emp?.dept ?? ""}{s.shopCode ? ` • Shop Code: ${s.shopCode}` : ""}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-800 dark:text-white/90">{prettyClock(s.clockIn)}</td>
                    <td className="px-4 py-3 text-slate-800 dark:text-white/90">{s.clockOut ? prettyClock(s.clockOut) : "—"}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-white/80">{prettyHM(br)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{prettyHM(wk)}</td>
                    <td className="px-4 py-3 text-slate-700 whitespace-pre-wrap dark:text-white/70">{s.note ?? ""}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onEdit(s)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onDelete(s)}><Trash className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50/60 dark:bg-white/5 text-sm">
                <td className="px-4 py-2" colSpan={5}>Totals</td>
                <td className="px-4 py-2">{prettyHM(totalBreak)}</td>
                <td className="px-4 py-2 font-semibold">{prettyHM(totalWork)}</td>
                <td className="px-4 py-2" colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}

/* ===== Keypad ===== */
function Keypad({ onPress, onBackspace, onClear }: {
  onPress: (n: string) => void; onBackspace: () => void; onClear: () => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((k) => (
        <Button key={k} type="button" variant="outline" onClick={() => onPress(k)} className="h-14 rounded-xl text-lg">{k}</Button>
      ))}
      <Button type="button" variant="secondary" onClick={onClear} className="h-14 rounded-xl text-lg">Clear</Button>
      <Button type="button" variant="outline" onClick={() => onPress("0")} className="h-14 rounded-xl text-lg">0</Button>
      <Button type="button" variant="secondary" onClick={onBackspace} className="h-14 rounded-xl text-lg"><X className="h-5 w-5" /></Button>
    </div>
  );
}

/* ===== AllStaffDialog — FIXED ===== */
function AllStaffDialog({
  open, onOpenChange, staff, loading, error, onReload, onPick, onOpenTimecard,
  query, setQuery, roleFilter, setRoleFilter, shopId,
}: {
  open: boolean; onOpenChange: (open: boolean) => void;
  staff: Staff[]; loading: boolean; error: string | null;
  onReload: () => void;
  onPick: (staff: Staff) => void;
  onOpenTimecard: (staff: Staff) => void;
  query: string; setQuery: React.Dispatch<React.SetStateAction<string>>;
  roleFilter: string; setRoleFilter: React.Dispatch<React.SetStateAction<string>>;
  shopId: string;
}) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(15);

  const roles = React.useMemo(
    () => Array.from(new Set(staff.map((s) => String(s.role ?? "")).filter(Boolean))),
    [staff]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return staff.filter((s) => {
      const roleOk = roleFilter === "ALL" ? true : String(s.role ?? "") === roleFilter;
      const text = [
        s.id, s.staffId ?? s.staff_id, s.fullName ?? s.full_name,
        s.email, s.phone, s.role, s.branch,
        s.shopCode ?? s.shop_code, s.shopId ?? s.shop_id,
      ].join(" ").toLowerCase();
      return roleOk && (!q || text.includes(q));
    });
  }, [staff, query, roleFilter]);

  React.useEffect(() => { setPage(1); }, [query, roleFilter, open]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeP = Math.min(page, totalPages);
  const pageStart = (safeP - 1) * pageSize;
  const pagedStaff = filtered.slice(pageStart, pageStart + pageSize);

  const statusCls = (status?: string) => {
    const s = String(status ?? "").toLowerCase();
    if (s.includes("active") && !s.includes("in")) return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300";
    if (s.includes("inactive") || s.includes("disabled")) return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300";
    return "border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // Full-screen on all sizes, capped at 1600px on large screens
          "fixed inset-0 m-0 flex flex-col rounded-none border-0 p-0 shadow-2xl",
          "sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2",
          "sm:w-[96vw] sm:max-w-[1600px] sm:h-[92vh] sm:rounded-[24px] sm:border sm:border-slate-200 dark:sm:border-white/10",
          "bg-white dark:bg-[#0c0905]"
        )}
      >
        {/* ── Header ── */}
        <div className="flex-none border-b border-slate-200 bg-gradient-to-r from-amber-50 via-white to-amber-50/50 px-5 py-4 dark:border-white/10 dark:from-[#16100a] dark:via-[#110c08] dark:to-[#16100a]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-[#c8892a]/15">
              <Users className="h-5 w-5 text-amber-700 dark:text-[#e8c27a]" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-[#f3e7d2]">Browse Staff</h2>
              <p className="text-xs text-slate-500 dark:text-[#9f8d78]">
                {filtered.length} staff found{shopId ? ` · Shop ${shopId}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="rounded-full border border-amber-200 bg-amber-50 px-3 text-amber-700 dark:border-[#c8892a]/25 dark:bg-[#c8892a]/10 dark:text-[#f3d7a0]">
                {filtered.length} staff
              </Badge>
              <Badge className="rounded-full border border-slate-200 bg-white px-3 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-[#e5d4bc]">
                {safeP} / {totalPages}
              </Badge>
              {/* Close button */}
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Search / filter bar ── */}
        <div className="flex-none border-b border-slate-100 bg-white/95 px-5 py-3 backdrop-blur dark:border-white/10 dark:bg-[#100d08]/95">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-[#8a7a65]" />
              <Input
                placeholder="Search name, ID, email, phone, shop…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 rounded-xl border-slate-200 pl-9 text-sm dark:border-white/10 dark:bg-white/5 dark:text-[#f3e7d2] dark:placeholder:text-[#6b5e50]"
              />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-[#f3e7d2]">
              <option value="ALL">All roles</option>
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={String(pageSize)} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-[#f3e7d2]">
              {[10, 15, 20, 30, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
            </select>
            <Button variant="outline" size="sm" onClick={onReload} className="h-10 rounded-xl">
              <Undo2 className="mr-1.5 h-3.5 w-3.5" /> Reload
            </Button>
            <span className="hidden text-xs text-slate-400 dark:text-[#6b5e50] lg:inline-block">
              {filtered.length === 0 ? "0" : `${pageStart + 1}–${Math.min(pageStart + pageSize, filtered.length)}`} of {filtered.length}
            </span>
          </div>
        </div>

        {/* ── Body — scrollable ── */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-[#bca98f]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading staff…
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500 dark:border-white/10 dark:text-[#bca98f]">
              No staff found
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="grid gap-3 sm:hidden">
                {pagedStaff.map((s) => {
                  const name = String(s.fullName ?? s.full_name ?? "—");
                  const sid = String(s.staffId ?? s.staff_id ?? "—");
                  const shop = String(s.shopCode ?? s.shop_code ?? s.shopId ?? s.shop_id ?? "—");
                  return (
                    <div key={String(s.id)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-slate-900 dark:text-[#f3e7d2]">{name}</div>
                          <div className="truncate text-xs text-slate-500 dark:text-[#9f8d78]">{String(s.email ?? "—")}</div>
                        </div>
                        <Badge className={cn("shrink-0 rounded-full border text-xs", statusCls(String(s.status ?? "")))}>{String(s.status ?? "—")}</Badge>
                      </div>
                      <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                        {[["ID", String(s.id)], ["Staff ID", sid], ["Role", String(s.role ?? "—")], ["Shop", shop]].map(([l, v]) => (
                          <div key={l}><div className="text-xs text-slate-500 dark:text-[#8a7a65]">{l}</div><div className="font-mono text-slate-800 dark:text-[#f3e7d2]">{v}</div></div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" variant="outline" className="rounded-xl" onClick={() => onPick(s)}>Select</Button>
                        <Button size="sm" className="rounded-xl bg-[#a07020] text-white hover:bg-[#8a6118] dark:bg-[#a07020]" onClick={() => onOpenTimecard(s)}>
                          <Clock className="mr-1.5 h-3.5 w-3.5" /> Time Card
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                <table className="w-full min-w-[900px] table-fixed text-sm">
                  <thead className="sticky top-0 z-10 bg-[#faf6f0] dark:bg-[#18120d]">
                    <tr className="border-b border-slate-200 dark:border-white/10 text-xs uppercase tracking-wide text-[#8a6c47] dark:text-[#8a7a65]">
                      <th className="w-20 px-4 py-3 text-left">ID</th>
                      <th className="w-28 px-4 py-3 text-left">Staff ID</th>
                      <th className="px-4 py-3 text-left">Name / Email</th>
                      <th className="w-32 px-4 py-3 text-left">Role</th>
                      <th className="w-40 px-4 py-3 text-left">Branch</th>
                      <th className="w-24 px-4 py-3 text-left">Shop</th>
                      <th className="w-28 px-4 py-3 text-left">Status</th>
                      <th className="w-44 px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                    {pagedStaff.map((s, i) => {
                      const name = String(s.fullName ?? s.full_name ?? "—");
                      const sid = String(s.staffId ?? s.staff_id ?? "—");
                      const shop = String(s.shopCode ?? s.shop_code ?? s.shopId ?? s.shop_id ?? "—");
                      return (
                        <tr key={String(s.id)} className={cn(
                          "transition hover:bg-amber-50/60 dark:hover:bg-white/[0.04]",
                          i % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-slate-50/50 dark:bg-white/[0.02]"
                        )}>
                          <td className="px-4 py-3 font-mono text-slate-700 dark:text-[#d4c3ab]">{String(s.id)}</td>
                          <td className="px-4 py-3 font-mono text-slate-700 dark:text-[#d4c3ab]">{sid}</td>
                          <td className="px-4 py-3">
                            <div className="truncate font-medium text-slate-900 dark:text-[#f3e7d2]">{name}</div>
                            <div className="truncate text-xs text-slate-500 dark:text-[#9f8d78]">{String(s.email ?? "—")}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-[#e5d4bc]"><div className="truncate">{String(s.role ?? "—")}</div></td>
                          <td className="px-4 py-3 text-slate-700 dark:text-[#e5d4bc]"><div className="truncate">{String(s.branch ?? "—")}</div></td>
                          <td className="px-4 py-3 text-slate-700 dark:text-[#e5d4bc]">{shop}</td>
                          <td className="px-4 py-3">
                            <Badge className={cn("rounded-full border text-xs", statusCls(String(s.status ?? "")))}>{String(s.status ?? "—")}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs" onClick={() => onPick(s)}>Select</Button>
                              <Button size="sm" className="h-8 rounded-lg bg-[#a07020] text-xs text-white hover:bg-[#8a6118] dark:bg-[#a07020]" onClick={() => onOpenTimecard(s)}>
                                <Clock className="mr-1 h-3 w-3" /> Time Card
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* ── Pagination footer ── */}
        <div className="flex-none border-t border-slate-200 bg-white/95 px-5 py-3 dark:border-white/10 dark:bg-[#100d08]/95">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 w-9 rounded-xl p-0" onClick={() => setPage(1)} disabled={safeP <= 1 || filtered.length === 0}>
                <ChevronLeft className="h-4 w-4" /><ChevronLeft className="-ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-9 rounded-xl" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safeP <= 1 || filtered.length === 0}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Prev
              </Button>

              {/* page number pills */}
              <div className="hidden items-center gap-1 sm:flex">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={cn("h-9 min-w-[36px] rounded-xl px-2 text-sm transition",
                        p === safeP
                          ? "bg-[#a07020] text-white dark:bg-[#a07020]"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-[#e5d4bc]"
                      )}>
                      {p}
                    </button>
                  );
                })}
                {totalPages > 7 && <span className="px-1 text-slate-400">…{totalPages}</span>}
              </div>

              <Button variant="outline" size="sm" className="h-9 rounded-xl" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safeP >= totalPages || filtered.length === 0}>
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-9 w-9 rounded-xl p-0" onClick={() => setPage(totalPages)} disabled={safeP >= totalPages || filtered.length === 0}>
                <ChevronRight className="h-4 w-4" /><ChevronRight className="-ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 dark:text-[#6b5e50]">
                {filtered.length === 0 ? "0" : `${pageStart + 1}–${Math.min(pageStart + pageSize, filtered.length)}`} of {filtered.length}
              </span>
              <Button variant="ghost" size="sm" className="h-9 rounded-xl" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ===== Main Page ===== */
export default function TimecardPro() {
  const mounted = useMounted();
  const { data: session } = useSession();
  const accessToken = (session as any)?.accessToken as string | null;
  const [now, setNow] = React.useState<Date | null>(null);
  const [hourlyRate, setHourlyRate] = React.useState("");
  const [note, setNote] = React.useState("");
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [showAll, setShowAll] = React.useState(false);
  const [deptFilter, setDeptFilter] = React.useState<string>("ALL");
  const [loadingShifts, setLoadingShifts] = React.useState(false);
  const [editShift, setEditShift] = React.useState<Shift | null>(null);
  const [editNote, setEditNote] = React.useState("");
  const [pendingDelete, setPendingDelete] = React.useState<Shift | null>(null);
  const [shopId, setShopId] = React.useState("");
  const [shopCode, setShopCode] = React.useState("");
  const [selectedStaffName, setSelectedStaffName] = React.useState("");
  const [employeeId, setEmployeeId] = React.useState("");
  const [staffPkId, setStaffPkId] = React.useState<string>("");
  const [staff, setStaff] = React.useState<Staff | null>(null);
  const [staffLoading, setStaffLoading] = React.useState(false);
  const staffCacheRef = React.useRef<Record<string, Staff>>({});
  const [browseOpen, setBrowseOpen] = React.useState(false);
  const [allStaff, setAllStaff] = React.useState<Staff[]>([]);
  const [staffLoadingList, setStaffLoadingList] = React.useState(false);
  const [staffErr, setStaffErr] = React.useState<string | null>(null);
  const [staffQuery, setStaffQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("ALL");

  const getEmployeeLocal = React.useCallback((id: string) => EMPLOYEES.find((e) => e.id === id) ?? null, []);
  const localEmployee = React.useMemo(() => getEmployeeLocal(staffPkId || employeeId), [staffPkId, employeeId, getEmployeeLocal]);
  const selectedPkId = React.useMemo(() => String(staff?.id ?? staffPkId ?? ""), [staff, staffPkId]);
  const staffMap = React.useMemo(() => {
    const map: Record<string, Staff> = {};
    for (const s of allStaff) map[String(s.id)] = s;
    if (staff?.id) map[String(staff.id)] = staff;
    return map;
  }, [allStaff, staff]);

  const currentShopStaffIds = React.useMemo(() => {
    if (!shopId) return new Set<string>();
    return new Set(
      allStaff
        .filter((s) => String(s.shopId ?? s.shop_id ?? "") === shopId)
        .map((s) => String(s.id))
    );
  }, [allStaff, shopId]);

  React.useEffect(() => {
    if (!mounted) return;
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [mounted]);

  React.useEffect(() => {
    (async () => {
      try {
        const token = accessToken || await getAccessToken();
        if (!token) return;
        const payload = decodeJwt(token) as {
          shopId?: string | number;
          shop_id?: string | number;
          shopCode?: string;
          shop_code?: string;
          username?: string;
        } | undefined;
        const sid = payload?.shopId ?? payload?.shop_id;
        const scode = payload?.shopCode ?? payload?.shop_code;
        if (sid !== undefined && sid !== null) setShopId(String(sid));
        if (scode) setShopCode(String(scode));
        if (payload?.username) setSelectedStaffName(String(payload.username));
      } catch { }
    })();
  }, [accessToken]);

  const fetchAllStaff = React.useCallback(async () => {
    setStaffLoadingList(true);
    setStaffErr(null);
    try {
      const res = await get<Staff[]>("/timecard/staff", accessToken);
      const raw = Array.isArray(res) ? res : [];
      const list = shopId
        ? raw.filter((s) => String(s.shopId ?? s.shop_id ?? "") === shopId)
        : raw;

      setAllStaff(list);
      const nc: Record<string, Staff> = {};
      for (const s of list) nc[String(s.id)] = s;
      staffCacheRef.current = { ...staffCacheRef.current, ...nc };
    } catch (e: any) {
      setStaffErr(e?.message || "Failed to load staff");
      setAllStaff([]);
    } finally {
      setStaffLoadingList(false);
    }
  }, [accessToken, shopId]);

  React.useEffect(() => { if (browseOpen) fetchAllStaff(); }, [browseOpen, fetchAllStaff]);

  // fetchShiftsForId - direct call with explicit params to avoid stale closure timing issues
  const fetchShiftsForId = React.useCallback(async (pkId: string | null, all: boolean, sid?: string) => {
    try {
      setLoadingShifts(true);
      const resolvedShopId = sid ?? shopId;
      let path: string | null;
      if (all) {
        const params = new URLSearchParams();
        if (resolvedShopId) params.set("shopId", resolvedShopId);
        const qs = params.toString();
        path = qs ? `/timecard/shifts?${qs}` : "/timecard/shifts";
      } else if (pkId) {
        const params = new URLSearchParams();
        params.set("employeeId", String(Number(pkId)));
        if (resolvedShopId) params.set("shopId", resolvedShopId);
        path = `/timecard/shifts?${params.toString()}`;
      } else {
        path = null;
      }
      if (!path) { setShifts([]); return; }
      const res = await get<ApiShift[]>(path, accessToken);
      setShifts((res || []).map(mapApiShift));
    } catch (e: any) { toast.error(e?.message || "Failed to load shifts"); }
    finally { setLoadingShifts(false); }
  }, [shopId, accessToken]);

  const fetchShifts = React.useCallback(() => {
    fetchShiftsForId(selectedPkId || null, showAll);
  }, [fetchShiftsForId, selectedPkId, showAll]);

  React.useEffect(() => { fetchShifts(); }, [fetchShifts]);

  React.useEffect(() => {
    let cancelled = false;
    setStaff(null); setStaffPkId("");
    if (!employeeId || Number.isNaN(Number(employeeId))) return;
    (async () => {
      try {
        setStaffLoading(true);
        const s = await get<Staff>(`/timecard/staff/by-staff-id/${employeeId}`, accessToken);
        if (cancelled) return;

        const staffShopId = String(s.shopId ?? s.shop_id ?? "");
        if (shopId && staffShopId && staffShopId !== shopId) {
          toast.error("This staff does not belong to your shop");
          setStaff(null);
          setStaffPkId("");
          return;
        }

        const resolvedPkId = String(s.id);
        setStaff(s);
        setStaffPkId(resolvedPkId);
        setSelectedStaffName(staffDisplayName(s));
        staffCacheRef.current[resolvedPkId] = s;
        // Immediately fetch shifts with resolved pk — avoids stale-closure timing issue
        fetchShiftsForId(resolvedPkId, false);
      } catch { if (!cancelled) { setStaff(null); setStaffPkId(""); } }
      finally { if (!cancelled) setStaffLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [employeeId]);

  const effectiveEmployeeId = React.useMemo(() => (selectedPkId ? Number(selectedPkId) : 0), [selectedPkId]);
  const employeeExists = React.useMemo(() => effectiveEmployeeId > 0, [effectiveEmployeeId]);
  const active = React.useMemo(() => {
    if (showAll) {
      return shifts.find((s) => !s.clockOut);
    }
    if (!selectedPkId) return undefined;
    return shifts.find((s) => s.employeeId === selectedPkId && !s.clockOut);
  }, [shifts, selectedPkId, showAll]);

  const nowMs = now ? +now : 0;
  const todayStr = now ? toYmd(now) : "";

  // All shifts for selected staff (no date filter) - used in "All Records" tab
  const allFiltered = React.useMemo(() => {
    return shifts.filter((s) => {
      const empOk = showAll ? true : !!selectedPkId && s.employeeId === selectedPkId;
      const deptOk = deptFilter === "ALL" ? true : getEmployeeLocal(s.employeeId)?.dept === deptFilter;
      const shopOk = showAll
        ? !shopId || currentShopStaffIds.has(String(s.employeeId))
        : true;
      return empOk && deptOk && shopOk;
    });
  }, [shifts, selectedPkId, showAll, deptFilter, getEmployeeLocal, shopId, currentShopStaffIds]);

  // Today only
  const todays = React.useMemo(() => allFiltered.filter((s) => s.date === todayStr),
    [allFiltered, todayStr]);

  const ws = React.useMemo(() => weekStart(now ?? new Date()), [now]);
  const we = React.useMemo(() => { const t = new Date(ws); t.setDate(ws.getDate() + 6); return t; }, [ws]);

  // This week
  const weekly = React.useMemo(() => allFiltered.filter((s) => {
    const d = new Date(s.date + "T00:00:00");
    return d >= ws && d <= we;
  }), [allFiltered, ws, we]);

  const todayTotal = React.useMemo(() => todays.reduce((a, s) => a + workMs(s, nowMs), 0), [todays, nowMs]);
  const weekTotal = React.useMemo(() => weekly.reduce((a, s) => a + workMs(s, nowMs), 0), [weekly, nowMs]);
  const weekBreak = React.useMemo(() => weekly.reduce((a, s) => a + breakMs(s, nowMs), 0), [weekly, nowMs]);
  const effectiveRate = React.useMemo(() => parseFloat(hourlyRate) || (localEmployee?.rate ?? 0), [hourlyRate, localEmployee]);
  const weekGross = React.useMemo(() => effectiveRate * (weekTotal / 3600000), [effectiveRate, weekTotal]);
  const weekDailyOverMs = React.useMemo(() => weekly.reduce((sum, s) => sum + Math.max(0, workMs(s, nowMs) - 8 * 3600000), 0), [weekly, nowMs]);
  const weekOverMs = React.useMemo(() => Math.max(0, weekTotal - 40 * 3600000), [weekTotal]);
  const weekOverGross = React.useMemo(() => effectiveRate * 1.25 * (Math.max(weekDailyOverMs, weekOverMs) / 3600000), [effectiveRate, weekDailyOverMs, weekOverMs]);
  const weekWorkedRatio = weekTotal === 0 ? 0 : weekTotal / (weekTotal + weekBreak);
  const weekBreakRatio = weekTotal === 0 ? 0 : weekBreak / (weekTotal + weekBreak);

  const requireValidEmployee = () => {
    if (!accessToken) {
      toast.error("Session expired. Please sign in again.");
      signOut({ callbackUrl: "/Sign_in" });
      return false;
    }
    if (showAll) {
      toast.error("Turn off Show All and select one staff first.");
      return false;
    }
    if (!selectedPkId || Number.isNaN(Number(selectedPkId))) {
      toast.error("Select a valid staff first");
      return false;
    }
    return true;
  };

  const doClockIn = async () => {
    if (!requireValidEmployee()) return;

    if (active) {
      toast.error("Already clocked in");
      return;
    }

    try {
      await post<ApiShift>(
        "/timecard/clock-in",
        {
          employeeId: effectiveEmployeeId,
          note: note || undefined,
        },
        accessToken
      );

      setNote("");
      toast.success("Clocked in");
      await fetchShiftsForId(selectedPkId, false, shopId);
    } catch (e: any) {
      toast.error(e?.message || "Clock-in failed");
    }
  };

  const doClockOut = async () => {
    if (!requireValidEmployee() || !active) {
      if (!active) toast.error("Not clocked in");
      return;
    }
    try {
      await post<ApiShift>(
        `/timecard/${active.id}/clock-out`,
        undefined,
        accessToken
      );
      toast.success("Clocked out");
      await fetchShiftsForId(selectedPkId, false, shopId);
    } catch (e: any) {
      toast.error(e?.message || "Clock-out failed");
    }
  };

  const startBreak = async () => {
    if (!requireValidEmployee() || !active || onBreak(active)) return;
    try {
      await post<ApiShift>(
        `/timecard/${active.id}/break/start`,
        undefined,
        accessToken
      );
      toast("Break started", { icon: "☕" });
      await fetchShiftsForId(selectedPkId, false, shopId);
    } catch (e: any) {
      toast.error(e?.message || "Start break failed");
    }
  };

  const endBreak = async () => {
    if (!requireValidEmployee() || !active || !onBreak(active)) return;
    try {
      await post<ApiShift>(
        `/timecard/${active.id}/break/end`,
        undefined,
        accessToken
      );
      toast.success("Break ended");
      await fetchShiftsForId(selectedPkId, false, shopId);
    } catch (e: any) {
      toast.error(e?.message || "End break failed");
    }
  };

  const exportCSV = () => {
    const targetId = selectedPkId;
    if (!showAll && !targetId) return toast.error("Select staff first");
    const source = showAll ? allFiltered : shifts.filter((s) => s.employeeId === targetId);
    const rows = source.slice().sort((a, b) => a.clockIn - b.clockIn).map((s) => {
      const cols = [s.date, ...(showAll ? [getEmployeeLocal(s.employeeId)?.name ?? s.employeeId] : []),
      prettyClock(s.clockIn), s.clockOut ? prettyClock(s.clockOut) : "",
      String(Math.round(breakMs(s) / 60000)), prettyHM(workMs(s)), (s.note ?? "").replaceAll("\n", " ")];
      return cols.map(csvEscape);
    });
    const header = showAll
      ? ["Date", "Employee", "Clock In", "Clock Out", "Break (min)", "Worked (h:mm:ss)", "Note"]
      : ["Date", "Clock In", "Clock Out", "Break (min)", "Worked (h:mm:ss)", "Note"];
    downloadText([header.map(csvEscape), ...rows].map((r) => r.join(",")).join("\n"),
      `timecard_${showAll ? "all" : targetId || "all"}_${todayStr}.csv`, "text/csv;charset=utf-8;");
  };

  const exportJSON = () => downloadText(JSON.stringify({ version: 2, shifts }, null, 2), `timecard_export_${todayStr}.json`, "application/json");

  const importJSON = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || !Array.isArray(parsed.shifts ?? parsed)) throw new Error("Invalid file");
        setShifts(parsed.shifts ?? parsed); toast.success("Imported shifts");
      } catch (e) { toast.error(`Import failed: ${e instanceof Error ? e.message : "Unknown error"}`); }
    };
    reader.readAsText(file);
  };

  const statusText = showAll ? "All Employees View"
    : !employeeId ? "No Staff"
      : active ? (onBreak(active) ? "On Break" : "On The Clock")
        : "Off The Clock";

  const heroTime = React.useMemo(() => {
    if (!now) return "--:--:--";
    return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(now);
  }, [now]);

  const heroDate = React.useMemo(() => {
    if (!now) return "";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(now);
  }, [now]);

  const tz = React.useMemo(() => mounted ? Intl.DateTimeFormat().resolvedOptions().timeZone : "—", [mounted]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f6f1e9] text-slate-900 dark:bg-[#05060d] dark:text-[#f3e7d2]">
      <Toaster position="top-right" />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 z-50 bg-black text-white rounded px-3 py-2">
        Skip to content
      </a>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_10%,rgba(245,158,11,0.10),transparent_40%),radial-gradient(ellipse_at_90%_90%,rgba(217,119,6,0.08),transparent_38%)] dark:bg-[radial-gradient(ellipse_at_10%_10%,rgba(251,191,36,0.08),transparent_40%),radial-gradient(ellipse_at_90%_90%,rgba(217,119,6,0.08),transparent_38%)]" />

      <div id="main" className="relative z-10 mx-auto w-[92%] max-w-7xl py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* ── Left column ── */}
          <div className="lg:col-span-8 space-y-6">

            {/* Hero card */}
            <Card className="relative overflow-hidden rounded-[28px] border border-[rgba(200,137,42,0.18)] bg-[rgba(255,255,255,0.90)] shadow-[0_24px_64px_rgba(26,21,16,0.08)] dark:bg-[rgba(14,10,6,0.84)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.50),0_0_50px_rgba(200,137,42,0.08)] dark:backdrop-blur-xl">
              <CardContent className="relative p-6 sm:p-8">
                <div className="absolute left-0 right-0 top-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #c8892a, transparent)" }} />

                {/* Status bar */}
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[rgba(200,137,42,0.12)] bg-[rgba(255,255,255,0.35)] px-3 py-3 dark:bg-[rgba(255,255,255,0.03)]">
                  <Badge className={cn("border",
                    showAll ? "border-sky-300/60 bg-sky-100 text-sky-800 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-200"
                      : employeeId && !employeeExists ? "border-rose-300/60 bg-rose-100 text-rose-800 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200"
                        : "border-amber-300/50 bg-amber-50 text-amber-800 dark:border-[rgba(200,137,42,0.30)] dark:bg-[rgba(200,137,42,0.10)] dark:text-[#f3e7d2]")}>
                    {statusText}
                  </Badge>
                  {!showAll && staff && (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
                      👤 {staffDisplayName(staff)} {staff.role ? `(${staff.role})` : ""}
                    </Badge>
                  )}
                  {!showAll && selectedStaffName && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-200">
                      🕒 {selectedStaffName}
                    </Badge>
                  )}
                  {!showAll && (
                    active ? (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
                        Active shift running
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/80">
                        Ready to clock in
                      </Badge>
                    )
                  )}
                  {shopId && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-200">
                      Shop {shopId}
                    </Badge>
                  )}
                  {shopCode && (
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-200">
                      {shopCode}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-[#bca98f]" suppressHydrationWarning>{tz}</Badge>
                  <div className="ml-auto flex items-center gap-2">
                    <ThemeToggle />
                    <Button size="sm" variant="ghost" className="rounded-xl text-slate-600 hover:bg-slate-100 dark:text-[#bca98f] dark:hover:bg-[rgba(255,255,255,0.05)]">
                      <Settings className="mr-2 h-4 w-4" /> Preferences
                    </Button>
                  </div>
                </div>

                {/* Time + staff selector */}
                <div className="mt-6 grid gap-6 md:grid-cols-[1.05fr_0.95fr]">
                  <div className="flex flex-col gap-3">
                    <div className="hidden md:block"><LanternMark size={74} glow /></div>
                    <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
                      className="serif text-[52px] font-normal leading-none tracking-tight text-slate-900 sm:text-[64px] md:text-[78px] dark:text-[#f3e7d2]" suppressHydrationWarning>
                      {heroTime}
                    </motion.h1>
                    <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[#9a6c2a] dark:text-[#8a5f24]">Timecard Pro</p>
                    <p className="text-lg font-medium text-slate-600 md:text-2xl dark:text-[#bca98f]" suppressHydrationWarning>{heroDate}</p>
                  </div>

                  <div className="grid content-start gap-3 rounded-[22px] border border-[rgba(200,137,42,0.14)] bg-[rgba(255,255,255,0.45)] p-4 dark:bg-[rgba(255,255,255,0.03)]">
                    <label htmlFor="empid" className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8a5f24] dark:text-[#8a5f24]">
                      Staff / Filters
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative flex-1 min-w-[200px]">
                        <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                        <Input id="empid" value={employeeId} onChange={(e) => setEmployeeId(e.target.value.trim())}
                          placeholder="Enter Staff ID" disabled={showAll}
                          className="h-11 rounded-xl border-slate-300 bg-white/90 pl-9 font-mono dark:border-[rgba(255,255,255,0.10)] dark:bg-[rgba(255,255,255,0.04)] dark:text-[#f3e7d2]" />
                      </div>
                      {employeeId && staff && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
                          👤 {staffDisplayName(staff)}
                        </Badge>
                      )}
                      {employeeId && !staff && staffLoading && (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/80">
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Checking…
                        </Badge>
                      )}
                      {employeeId && !staff && !staffLoading && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                          Staff ID ready
                        </Badge>
                      )}
                      <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
                        className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm dark:border-[rgba(255,255,255,0.10)] dark:bg-[rgba(255,255,255,0.04)] dark:text-[#f3e7d2]">
                        <option value="ALL">All depts</option>
                        {[...new Set(EMPLOYEES.map((e) => e.dept).filter(Boolean))].map((d) => (
                          <option key={String(d)} value={String(d)}>{String(d)}</option>
                        ))}
                      </select>
                      <Button variant="outline" type="button" disabled={showAll}
                        onClick={() => { setEmployeeId(""); setStaffPkId(""); setDeptFilter("ALL"); setStaff(null); setSelectedStaffName(""); }}>
                        Clear
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setBrowseOpen(true)} className="whitespace-nowrap">
                        <Search className="mr-2 h-4 w-4" /> Browse Staff
                      </Button>
                      <Button type="button" variant={showAll ? "default" : "outline"} onClick={() => setShowAll((v) => !v)}
                        className={cn("ml-auto", showAll ? "bg-[#a07020] text-white hover:bg-[#8a6118] dark:bg-[#a07020]" : "")} aria-pressed={showAll}>
                        {showAll ? "All Employees" : "Show All"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Today Worked", value: prettyHM(todayTotal) },
                    { label: "Week Total", value: prettyHM(weekTotal) },
                    { label: "Week Earnings", value: earningsFmt(weekGross + weekOverGross) },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[20px] border border-[rgba(200,137,42,0.14)] bg-[rgba(255,255,255,0.45)] px-4 py-4 dark:bg-[rgba(255,255,255,0.03)]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a5f24]">{item.label}</p>
                      <p className="mt-2 text-[20px] font-black text-slate-900 dark:text-[#f3e7d2]">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <ActionButton onClick={doClockIn} disabled={!!active || showAll || !selectedPkId} icon={Play} label="Clock In" intent="primary" />
                  <ActionButton onClick={startBreak} disabled={!active || onBreak(active) || showAll} icon={Coffee} label="Start Break" />
                  <ActionButton onClick={endBreak} disabled={!active || !onBreak(active) || showAll} icon={Pause} label="End Break" />
                  <ActionButton onClick={doClockOut} disabled={!active || showAll} icon={Square} label="Clock Out" intent="danger" />
                  <ActionButton onClick={fetchShifts} disabled={loadingShifts} icon={Undo2} label={loadingShifts ? "Loading..." : "Refresh"} />
                </div>

                {!showAll && <div className="mt-6"><SessionPill active={active} now={nowMs} /></div>}
              </CardContent>
            </Card>

            {/* Entries card */}
            <Card className="rounded-[26px] border border-[rgba(200,137,42,0.16)] bg-[rgba(255,255,255,0.90)] dark:bg-[rgba(14,10,6,0.84)]">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-[#f3e7d2]">
                    {showAll ? "All Employees — Entries" : staff ? (
                      <>
                        <span>Entries</span>
                        <span className="text-sm font-normal text-amber-700 dark:text-amber-400">
                          — {staffDisplayName(staff)}
                          {staff.role ? ` (${staff.role})` : ""}
                        </span>
                      </>
                    ) : "Entries"}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={exportCSV}><Download className="mr-2 h-4 w-4" /> CSV</Button>
                    <Button variant="outline" size="sm" onClick={exportJSON}><FileJson className="mr-2 h-4 w-4" /> JSON</Button>
                    <label className="inline-flex items-center">
                      <input type="file" accept="application/json" className="hidden" onChange={(e) => importJSON(e.target.files?.[0])} />
                      <Button asChild variant="outline" size="sm"><span><Upload className="mr-2 h-4 w-4" /> Import</span></Button>
                    </label>
                    <Button variant="outline" size="sm" onClick={() => toast.error("Clear today API မရှိသေးပါ")} disabled={showAll || !employeeId}>
                      Clear today
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <TabsList className="bg-slate-100 dark:bg-[rgba(255,255,255,0.05)]">
                        <TabsTrigger value="all" className="gap-1.5">
                          All
                          {allFiltered.length > 0 && (
                            <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                              {allFiltered.length}
                            </span>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="today" className="gap-1.5">
                          Today
                          {todays.length > 0 && (
                            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                              {todays.length}
                            </span>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="week" className="gap-1.5">
                          This Week
                          {weekly.length > 0 && (
                            <span className="rounded-full bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300">
                              {weekly.length}
                            </span>
                          )}
                        </TabsTrigger>
                      </TabsList>
                      {loadingShifts && <Loader2 className="h-4 w-4 animate-spin text-amber-600" />}
                    </div>
                    <div className="hidden md:flex items-center gap-3 text-sm text-slate-600 dark:text-[#bca98f]">
                      <InsightsChip icon={ChartPie} label="Week" value={prettyHM(weekTotal)} />
                      <InsightsChip icon={Coffee} label="Break" value={prettyHM(weekBreak)} />
                      <InsightsChip icon={Check} label="Earnings" value={earningsFmt(weekGross + weekOverGross)} />
                    </div>
                  </div>
                  <Separator className="my-4 bg-slate-200 dark:bg-white/10" />

                  {/* ── All Records tab ── */}
                  <TabsContent value="all" className="m-0">
                    {!showAll && !selectedPkId ? (
                      <EmptyState label="Browse Staff ကနေ staff တစ်ယောက် ရွေးပါ သို့မဟုတ် Staff ID ထည့်ပါ" />
                    ) : allFiltered.length === 0 ? (
                      <EmptyState label={loadingShifts ? "Loading shifts…" : "No records found for this staff"} />
                    ) : (
                      <EntriesTable
                        shifts={allFiltered} now={nowMs}
                        getEmployee={getEmployeeLocal} staffMap={staffMap}
                        onEdit={(s) => { setEditShift(s); setEditNote(s.note ?? ""); }}
                        onDelete={setPendingDelete}
                      />
                    )}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-slate-600 dark:text-[#bca98f]">
                        Total records: <span className="font-semibold text-slate-900 dark:text-[#f3e7d2]">{allFiltered.length}</span>
                        {" · "}
                        All time worked: <span className="font-semibold text-slate-900 dark:text-[#f3e7d2]">
                          {prettyHM(allFiltered.reduce((a, s) => a + workMs(s, nowMs), 0))}
                        </span>
                      </p>
                    </div>
                  </TabsContent>

                  {/* ── Today tab ── */}
                  <TabsContent value="today" className="m-0">
                    {!showAll && !selectedPkId ? (
                      <EmptyState label="Select a staff to view entries" />
                    ) : todays.length === 0 ? (
                      <EmptyState label={loadingShifts ? "Loading…" : "No clock-in entries for today yet"} />
                    ) : (
                      <EntriesTable
                        shifts={todays} now={nowMs}
                        getEmployee={getEmployeeLocal} staffMap={staffMap}
                        onEdit={(s) => { setEditShift(s); setEditNote(s.note ?? ""); }}
                        onDelete={setPendingDelete}
                      />
                    )}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-slate-600 dark:text-[#bca98f]">
                        Today total: <span className="font-semibold text-slate-900 dark:text-[#f3e7d2]">{prettyHM(todayTotal)}</span>
                      </p>
                      <Badge className="border border-emerald-300/60 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                        OT est: {prettyHM(Math.max(0, todayTotal - 8 * 3600000))}
                      </Badge>
                    </div>
                  </TabsContent>

                  {/* ── This Week tab ── */}
                  <TabsContent value="week" className="m-0">
                    {!showAll && !selectedPkId ? (
                      <EmptyState label="Select a staff to view entries" />
                    ) : weekly.length === 0 ? (
                      <EmptyState label={loadingShifts ? "Loading…" : "No entries for this week"} />
                    ) : (
                      <EntriesTable
                        shifts={weekly} now={nowMs}
                        getEmployee={getEmployeeLocal} staffMap={staffMap}
                        onEdit={(s) => { setEditShift(s); setEditNote(s.note ?? ""); }}
                        onDelete={setPendingDelete}
                      />
                    )}
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Input type="number" inputMode="decimal" placeholder="Hourly rate (optional)"
                          className="h-9 w-56 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 dark:bg-[rgba(255,255,255,0.04)] dark:text-[#f3e7d2] dark:placeholder:text-[#8a7a65]"
                          value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
                        <Badge className="border border-emerald-300/60 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                          {earningsFmt(weekGross + weekOverGross)}
                        </Badge>
                      </div>
                      <UtilizationRing worked={weekWorkedRatio} breakPct={weekBreakRatio} />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* ── Right column ── */}
          <div className="lg:col-span-4 space-y-6">
            {/* Kiosk */}
            <Card className="relative overflow-hidden rounded-[24px] border border-[rgba(200,137,42,0.14)] bg-[rgba(255,255,255,0.92)] dark:bg-[rgba(14,10,6,0.82)]">
              <div className="absolute right-5 top-5 hidden sm:block"><LanternMark size={18} glow /></div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-[#f3e7d2]">
                  <UserRound className="h-5 w-5 text-sky-600 dark:text-[#c8892a]" /> Kiosk keypad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Keypad
                  onPress={(n) => setEmployeeId((v) => (showAll ? v : (v + n).slice(0, 10)))}
                  onBackspace={() => setEmployeeId((v) => (showAll ? v : v.slice(0, -1)))}
                  onClear={() => (showAll ? null : setEmployeeId(""))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={doClockIn} disabled={showAll || !employeeId || !employeeExists || !!active}><Play className="mr-2 h-4 w-4" /> Clock In</Button>
                  <Button onClick={doClockOut} disabled={showAll || !employeeId || !employeeExists || !active}><Square className="mr-2 h-4 w-4" /> Clock Out</Button>
                  <Button onClick={startBreak} disabled={showAll || !employeeId || !employeeExists || !(active && !onBreak(active))}><Coffee className="mr-2 h-4 w-4" /> Start Break</Button>
                  <Button onClick={endBreak} disabled={showAll || !employeeId || !employeeExists || !(active && onBreak(active))}><Pause className="mr-2 h-4 w-4" /> End Break</Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="relative overflow-hidden rounded-[24px] border border-[rgba(200,137,42,0.14)] bg-[rgba(255,255,255,0.92)] dark:bg-[rgba(14,10,6,0.82)]">
              <div className="absolute right-5 top-5 hidden sm:block"><LanternMark size={18} glow /></div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-[#f3e7d2]">
                  <TimerReset className="h-5 w-5 text-sky-600 dark:text-[#c8892a]" /> Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea rows={6} placeholder="Add a note…"
                  className="min-h-[140px] resize-none rounded-xl bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 dark:bg-[rgba(255,255,255,0.04)] dark:text-[#f3e7d2] dark:placeholder:text-[#8a7a65]"
                  value={note} onChange={(e) => setNote(e.target.value)} />
                <div className="mt-3 flex justify-between">
                  <span className="text-xs text-slate-500 dark:text-[#8a7a65]">
                    Tip: <kbd className="rounded bg-slate-100 px-1 dark:bg-white/10">i</kbd>{" "}
                    <kbd className="rounded bg-slate-100 px-1 dark:bg-white/10">o</kbd>{" "}
                    <kbd className="rounded bg-slate-100 px-1 dark:bg-white/10">b</kbd>
                  </span>
                  <Button onClick={() => toast.error("Note update API မရှိသေးပါ")}>Save</Button>
                </div>
              </CardContent>
            </Card>

            {/* Today summary */}
            <Card className="relative overflow-hidden rounded-[24px] border border-[rgba(200,137,42,0.14)] bg-[rgba(255,255,255,0.92)] dark:bg-[rgba(14,10,6,0.82)]">
              <div className="absolute right-5 top-5 hidden sm:block"><LanternMark size={18} glow /></div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-[#f3e7d2]">
                  <CalendarDays className="h-5 w-5 text-sky-600 dark:text-[#c8892a]" /> Today summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-slate-200 dark:divide-white/10">
                  {[
                    { label: showAll ? "Employees (today)" : "Shifts", val: todays.length },
                    { label: "Worked", val: prettyHM(todayTotal) },
                    { label: "Breaks", val: prettyHM(todays.reduce((a, s) => a + breakMs(s, nowMs), 0)) },
                  ].map(({ label, val }) => (
                    <li key={label} className="flex items-center justify-between py-3 text-sm">
                      <span className="text-slate-600 dark:text-[#bca98f]">{label}</span>
                      <span className="text-slate-900 dark:text-[#f3e7d2]">{val}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editShift} onOpenChange={(open) => !open && setEditShift(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit entry</DialogTitle></DialogHeader>
          {editShift && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-white/60">Clock In</label>
                  <Input type="datetime-local" value={toLocalInput(editShift.clockIn)}
                    onChange={(e) => setEditShift({ ...editShift, clockIn: fromLocalInput(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-white/60">Clock Out</label>
                  <Input type="datetime-local" value={editShift.clockOut ? toLocalInput(editShift.clockOut) : ""}
                    onChange={(e) => setEditShift({ ...editShift, clockOut: e.target.value ? fromLocalInput(e.target.value) : undefined })} />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-white/60">Note</label>
                <Textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} rows={4} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditShift(null)}>Cancel</Button>
            <Button onClick={() => { toast.error("Edit API မရှိသေးပါ"); setEditShift(null); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete this entry?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { toast.error("Delete API မရှိသေးပါ"); setPendingDelete(null); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Browse staff dialog */}
      <AllStaffDialog
        open={browseOpen} onOpenChange={setBrowseOpen}
        staff={allStaff} loading={staffLoadingList} error={staffErr} onReload={fetchAllStaff}
        onPick={(s) => {
          const pkId = String(s.id);
          setEmployeeId(String(s.staffId ?? s.staff_id ?? ""));
          setStaffPkId(pkId); setStaff(s);
          setSelectedStaffName(staffDisplayName(s));
          staffCacheRef.current[pkId] = s;
          // Immediately fetch shifts with the resolved pk
          fetchShiftsForId(pkId, false);
          setBrowseOpen(false);
          toast.success(`Selected ${staffDisplayName(s)}`);
        }}
        onOpenTimecard={(s) => {
          const pkId = String(s.id);
          setEmployeeId(String(s.staffId ?? s.staff_id ?? ""));
          setStaffPkId(pkId); setStaff(s);
          setSelectedStaffName(staffDisplayName(s));
          staffCacheRef.current[pkId] = s;
          setShowAll(false); setBrowseOpen(false);
          // Immediately fetch shifts with the resolved pk
          fetchShiftsForId(pkId, false);
          requestAnimationFrame(() => document.getElementById("empid")?.scrollIntoView({ behavior: "smooth", block: "center" }));
          toast.success(`Opened time card for ${staffDisplayName(s)}`);
        }}
        query={staffQuery} setQuery={setStaffQuery}
        roleFilter={roleFilter} setRoleFilter={setRoleFilter}
        shopId={shopId}
      />

      <footer className="pointer-events-none absolute inset-x-0 bottom-6 z-10 text-center text-xs text-[#9a8060] dark:text-[#6d5d4b]">
        Timecard Pro • Lantern Shift Edition
      </footer>

      <style jsx global>{`
        .tc-ring { --size: 88px; width: var(--size); height: var(--size); display: grid; place-items: center; position: relative; }
        .tc-ring svg { position: absolute; inset: 0; }
        .sticky-th thead th { position: sticky; top: 0; z-index: 1; }
        .zebra tbody tr:nth-child(odd) { background: rgba(2, 6, 23, 0.03); }
        .dark .zebra tbody tr:nth-child(odd) { background: rgba(255, 255, 255, 0.04); }
      `}</style>
    </section>
  );
}
