"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarDays,
  Download,
  Pause,
  Play,
  Settings,
  Square,
  Sun,
  TimerReset,
  UserRound,
  Coffee,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

/**
 * EMPLOYMENT TIME CARD — Clear Blue Light (Clarity‑optimized)
 * Changes focused on clarity:
 * 1) Softer, narrower beams with additive blend only in dark mode.
 * 2) Lower alpha + wider falloff to avoid banding and halo bloom.
 * 3) Motion budget trimmed; respects prefers‑reduced‑motion.
 * 4) Toggle to quickly disable decorative FX.
 * 5) Grid mask tightened to keep content area high contrast.
 */

// ===== Types =====
interface BreakSpan { start: number; end?: number; }
interface Shift {
  id: string;
  date: string; // YYYY-MM-DD (local)
  clockIn: number; // epoch ms
  clockOut?: number;
  breaks: BreakSpan[];
  note?: string;
}

// ===== Helpers =====
const LS_KEY = "employment_timecard_v1";
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

const fmtHM = (ms: number) => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
};
const toYmd = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
};
const prettyTime = (t: number) =>
  new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(t);
const calcBreakMs = (sh: Shift, now = Date.now()) =>
  sh.breaks.reduce((acc, b) => acc + ((b.end ?? now) - b.start), 0);
const calcShiftMs = (sh: Shift, now = Date.now()) => {
  const end = sh.clockOut ?? now;
  return Math.max(0, end - sh.clockIn - calcBreakMs(sh, now));
};
const isOnBreak = (sh?: Shift) => !!sh && sh.breaks.some(b => b.end === undefined);
const weekStart = (d = new Date()) => {
  const n = new Date(d);
  const day = (n.getDay() + 6) % 7; // Mon=0
  n.setHours(0,0,0,0);
  n.setDate(n.getDate() - day);
  return n;
};

// ===== Storage =====
const loadShifts = (): Shift[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]") as Shift[]; }
  catch { return []; }
};
const saveShifts = (list: Shift[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(list));
};

// ===== Page =====
export default function Page() {
  const [now, setNow] = useState(new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [note, setNote] = useState("");
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [fxOn, setFxOn] = useState(true); // NEW: visuals toggle
  const prefersReduced = useReducedMotion();

  // tick
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  // storage
  useEffect(() => setShifts(loadShifts()), []);
  useEffect(() => saveShifts(shifts), [shifts]);

  const activeShift = useMemo(() => shifts.find(s => !s.clockOut), [shifts]);
  const todayShifts = useMemo(() => shifts.filter(s => s.date === toYmd(now)), [shifts, now]);

  const weekRange = useMemo(() => {
    const ws = weekStart(now);
    const we = new Date(ws); we.setDate(ws.getDate()+6);
    return { ws, we };
  }, [now]);

  const weeklyShifts = useMemo(() => {
    const { ws, we } = weekRange;
    return shifts.filter(s => {
      const d = new Date(s.date + "T00:00:00");
      return d >= ws && d <= we;
    });
  }, [shifts, weekRange]);

  const todayTotalMs = useMemo(
    () => todayShifts.reduce((acc, s) => acc + calcShiftMs(s, +now), 0),
    [todayShifts, now]
  );
  const weekTotalMs = useMemo(
    () => weeklyShifts.reduce((acc, s) => acc + calcShiftMs(s, +now), 0),
    [weeklyShifts, now]
  );

  const earnings = useMemo(() => {
    const rate = parseFloat(hourlyRate);
    return Number.isFinite(rate) ? (weekTotalMs / 3600000) * rate : undefined;
  }, [weekTotalMs, hourlyRate]);

  // ===== Actions =====
  const clockIn = () => {
    if (activeShift) return;
    const start = Date.now();
    const sh: Shift = {
      id: crypto.randomUUID(),
      date: toYmd(new Date(start)),
      clockIn: start,
      breaks: [],
      note: note || undefined,
    };
    setShifts([sh, ...shifts]); setNote("");
  };
  const clockOut = () => {
    if (!activeShift) return;
    const end = Date.now();
    const breaks = activeShift.breaks.map(b => (b.end ? b : { ...b, end }));
    setShifts(prev => prev.map(s => s.id === activeShift.id ? { ...s, clockOut: end, breaks } : s));
  };
  const startBreak = () => {
    if (!activeShift || isOnBreak(activeShift)) return;
    setShifts(prev => prev.map(s => s.id === activeShift.id ? { ...s, breaks: [...s.breaks, { start: Date.now() }] } : s));
  };
  const endBreak = () => {
    if (!activeShift) return;
    setShifts(prev => prev.map(s => {
      if (s.id !== activeShift.id) return s;
      const last = [...s.breaks];
      const i = last.findIndex(b => !b.end);
      if (i >= 0) last[i] = { ...last[i], end: Date.now() };
      return { ...s, breaks: last };
    }));
  };
  const saveNoteToActive = () => {
    if (!activeShift && !note.trim()) return;
    if (activeShift) {
      setShifts(prev => prev.map(s => s.id === activeShift.id ? { ...s, note } : s));
    } else if (note.trim()) {
      const latest = todayShifts[0];
      if (latest) setShifts(prev => prev.map(s => s.id === latest.id ? { ...s, note } : s));
    }
    setNote("");
  };
  const clearToday = () => setShifts(prev => prev.filter(s => s.date !== toYmd(now)));

  const exportCSV = () => {
    const header = ["Date","Clock In","Clock Out","Break (min)","Work (h:mm:ss)","Note"];
    const rows = shifts.slice().sort((a,b) => a.clockIn - b.clockIn).map(s => {
      const breakMin = Math.round(calcBreakMs(s) / 60000);
      return [
        s.date,
        prettyTime(s.clockIn),
        s.clockOut ? prettyTime(s.clockOut) : "",
        `${breakMin}`,
        fmtHM(calcShiftMs(s)),
        (s.note ?? "").replaceAll("\n"," "),
      ];
    });
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `timecard_${toYmd(now)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // Derived UI state
  const isActive = !!activeShift;
  const onBreak = isOnBreak(activeShift);
  const activeElapsed = isActive ? calcShiftMs(activeShift, +now) : 0;
  const activeBreakMs = isActive ? calcBreakMs(activeShift, +now) : 0;

  const heroTime = useMemo(() =>
    new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(now), [now]);
  const heroDate = useMemo(() =>
    new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(now), [now]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-white text-slate-900 dark:bg-black dark:text-neutral-200">
      {/* Background layers: all conditional for clarity */}
      {fxOn && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_-14%,rgba(14,165,233,0.08),transparent_40%),radial-gradient(circle_at_88%_114%,rgba(14,165,233,0.05),transparent_36%)] dark:bg-[radial-gradient(circle_at_12%_-14%,rgba(59,130,246,0.10),transparent_42%),radial-gradient(circle_at_88%_114%,rgba(59,130,246,0.08),transparent_38%)]" />
          <GridBackground />
        </>
      )}

      <div className="relative z-10 mx-auto mt-10 w-[92%] max-w-7xl">
        <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_64px_-24px_rgba(59,130,246,0.18)] dark:backdrop-blur-md">
          {/* HERO scanline — trimmed motion & glow */}
          {fxOn && !prefersReduced && (
            <ScanLines dir="ltr" className="long-travel slower wider long-burst" />
          )}

          {/* HERO */}
          <div className="relative flex w-full flex-col justify-between rounded-t-2xl bg-[linear-gradient(180deg,rgba(2,132,199,0.04)_0%,rgba(2,132,199,0.0)_100%)] p-6 sm:p-8 md:p-10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.0)_0%,rgba(15,23,42,0.35)_100%)]">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="glass-badge border border-sky-300/40 bg-sky-100 text-sky-700 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-300">
                {isActive ? (onBreak ? "On Break" : "On The Clock") : "Off The Clock"}
              </Badge>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-white/70">{tz}</Badge>

              {/* NEW: FX toggle, right‑aligned on larger screens */}
              <div className="ml-auto flex items-center gap-2 text-xs text-slate-500 dark:text-white/60">
                <span className="hidden sm:inline">Visual FX</span>
                <button
                  aria-label="Toggle visual effects"
                  onClick={() => setFxOn(v => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full border transition-colors duration-200 ${fxOn ? "bg-sky-600/80 border-sky-700/50" : "bg-slate-200 border-slate-300 dark:bg-white/10 dark:border-white/15"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 translate-x-1 rounded-full bg-white shadow transition-transform duration-200 ${fxOn ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-1">
              <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
                className="text-5xl font-extrabold leading-none tracking-tight text-slate-900 sm:text-6xl md:text-7xl dark:text-white">
                {heroTime}
              </motion.h1>
              <p className="text-lg font-medium text-sky-800/80 md:text-2xl dark:text-sky-300/90">{heroDate}</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {!isActive ? (
                <Button size="sm" onClick={clockIn} className="neon-btn bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500">
                  <Play className="mr-2 h-4 w-4" /> Clock In
                </Button>
              ) : (
                <>
                  {!onBreak ? (
                    <Button size="sm" variant="secondary" onClick={startBreak} className="justify-start bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15">
                      <Coffee className="mr-2 h-4 w-4" /> Start Break
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={endBreak} className="justify-start bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15">
                      <Pause className="mr-2 h-4 w-4" /> End Break
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={clockOut} className="bg-rose-600 hover:bg-rose-700 text-white dark:bg-red-600/80 dark:hover:bg-red-600">
                    <Square className="mr-2 h-4 w-4" /> Clock Out
                  </Button>
                </>
              )}

              <Button size="sm" variant="outline" onClick={exportCSV} className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10">
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
              <Button size="sm" variant="ghost" className="text-slate-600 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/5">
                <Settings className="mr-2 h-4 w-4" /> Preferences
              </Button>
            </div>
          </div>

          {/* CONTENT GRID */}
          <CardContent className="p-6 md:p-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* LEFT */}
              <div className="space-y-6 lg:col-span-8">
                {/* Active session */}
                <Card className="relative overflow-hidden border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                  {fxOn && !prefersReduced && (
                    <ScanLines dir="rtl" className="long-travel slow wide" />
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white/90">
                      <TimerReset className="h-5 w-5 text-sky-600 dark:text-sky-300" /> Active session
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <Stat label="Elapsed" value={fmtHM(activeElapsed)} />
                      <Stat label="Break" value={fmtHM(activeBreakMs)} />
                      <Stat label="Net" value={fmtHM(Math.max(0, activeElapsed))} />
                      <Stat label="Status" value={isActive ? (onBreak ? "Break" : "Working") : "—"} />
                    </div>
                    {isActive && (
                      <p className="mt-3 text-xs text-slate-500 dark:text-white/50">
                        Started at {prettyTime(activeShift!.clockIn)} • {activeShift!.note ? "Note saved" : "No note"}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Entries */}
                <Tabs defaultValue="today" className="w-full">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-slate-800 dark:text-white/90">Entries</CardTitle>
                    <TabsList className="bg-slate-100 dark:bg-white/5">
                      <TabsTrigger value="today" className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-700 dark:data-[state=active]:bg-sky-500/20 dark:data-[state=active]:text-sky-200">Today</TabsTrigger>
                      <TabsTrigger value="week" className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-700 dark:data-[state=active]:bg-sky-500/20 dark:data-[state=active]:text-sky-200">This week</TabsTrigger>
                    </TabsList>
                  </div>

                  <Separator className="my-4 bg-slate-200 dark:bg-white/10" />

                  <TabsContent value="today" className="m-0">
                    {todayShifts.length === 0 ? <EmptyState label="No entries for today yet" /> : <EntriesTable shifts={todayShifts} now={+now} />}
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-slate-600 dark:text-white/70">
                        Today total: <span className="font-semibold text-slate-900 dark:text-white">{fmtHM(todayTotalMs)}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={clearToday} className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10">Clear today</Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="week" className="m-0">
                    <EntriesTable shifts={weeklyShifts} now={+now} />
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-slate-600 dark:text-white/70">
                        Week total: <span className="font-semibold text-slate-900 dark:text-white">{fmtHM(weekTotalMs)}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <Input type="number" inputMode="decimal" placeholder="Hourly rate (optional)" className="h-8 w-48 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 dark:bg-black/40 dark:text-white dark:placeholder:text-white/40"
                          value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
                        {earnings !== undefined && (
                          <Badge className="border border-emerald-300/60 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                            Est. earnings: {new Intl.NumberFormat(undefined, { style: "currency", currency: guessCurrency() }).format(earnings)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* RIGHT */}
              <div className="space-y-6 lg:col-span-4">
                {/* Quick actions */}
                <Card className="relative overflow-hidden border-slate-200 bg-gradient-to-b from-sky-50/60 to-transparent dark:border-white/10 dark:from-sky-500/10 dark:to-transparent">
                  {fxOn && !prefersReduced && (
                    <ScanLines dir="ttb" className="long-burst tall" />
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white/90">
                      <Sun className="h-5 w-5 text-sky-600 dark:text-sky-300" /> Quick actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3">
                    <Button onClick={clockIn} disabled={isActive} variant="secondary"
                      className="justify-start bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15">
                      <Play className="mr-2 h-4 w-4" /> Clock In
                    </Button>
                    <Button onClick={clockOut} disabled={!isActive} variant="secondary"
                      className="justify-start bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15">
                      <Square className="mr-2 h-4 w-4" /> Clock Out
                    </Button>
                    <Button onClick={startBreak} disabled={!isActive || onBreak} variant="secondary"
                      className="justify-start bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15">
                      <Coffee className="mr-2 h-4 w-4" /> Start Break
                    </Button>
                    <Button onClick={endBreak} disabled={!isActive || !onBreak} variant="secondary"
                      className="justify-start bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15">
                      <Pause className="mr-2 h-4 w-4" /> End Break
                    </Button>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card className="relative overflow-hidden border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
                  {fxOn && !prefersReduced && (
                    <ScanLines dir="ltr" className="no-gate slower wider" />
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white/90">
                      <UserRound className="h-5 w-5 text-sky-600 dark:text-sky-300" /> Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea rows={6} placeholder="Add a note…" className="min-h-[140px] resize-none bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 dark:bg-black/40 dark:text-white dark:placeholder:text-white/40"
                      value={note} onChange={(e) => setNote(e.target.value)} />
                    <div className="mt-3 flex justify-end">
                      <Button className="neon-btn bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500" onClick={saveNoteToActive}>Save</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Today summary */}
                <Card className="relative overflow-hidden border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
                  {fxOn && !prefersReduced && (
                    <ScanLines dir="btt" className="long-travel slow" />
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white/90">
                      <CalendarDays className="h-5 w-5 text-sky-600 dark:text-sky-300" /> Today summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="divide-y divide-slate-200 dark:divide-white/10">
                      <li className="flex items-center justify-between py-3 text-sm">
                        <span className="text-slate-600 dark:text-white/70">Shifts</span>
                        <span className="text-slate-900 dark:text-white">{todayShifts.length}</span>
                      </li>
                      <li className="flex items-center justify-between py-3 text-sm">
                        <span className="text-slate-600 dark:text-white/70">Worked</span>
                        <span className="text-slate-900 dark:text-white">{fmtHM(todayTotalMs)}</span>
                      </li>
                      <li className="flex items-center justify-between py-3 text-sm">
                        <span className="text-slate-600 dark:text-white/70">Breaks</span>
                        <span className="text-slate-900 dark:text-white">{fmtHM(todayShifts.reduce((a,s)=>a+calcBreakMs(s,+now),0))}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="pointer-events-none absolute inset-x-0 bottom-6 z-10 text-center text-xs text-slate-500 dark:text-white/30">
        Aceternity × shadcn • Employment Time Card
      </footer>

      <style jsx global>{`
        :root { --beam-alpha-light: 0.05; --beam-alpha-dark: 0.12; --beam-blur: 20px; }
        @media (prefers-color-scheme: dark) { :root { --beam-blur: 20px; } }

        /* Subtle grid — tighter mask for clearer content */
        .grid-bg:before {
          content: "";
          position: absolute; inset: 0;
          background-image:
            linear-gradient(to right, rgba(2,6,23,0.045) 2px, transparent 1px),
            linear-gradient(to bottom, rgba(2,6,23,0.045) 1px, transparent 1px);
          background-size: 24px 24px;
          mask-image: radial-gradient(ellipse at 50% 38%, black 52%, transparent 82%);
          -webkit-mask-image: radial-gradient(ellipse at 50% 38%, black 52%, transparent 82%);
        }
        .dark .grid-bg:before {
          background-image:
            linear-gradient(to right, rgba(255,255,255,0.055) 2px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.055) 1px, transparent 1px);
        }

        /* ===== Scanline beams — clarity‑tuned ===== */
        @keyframes scanX { 0% { transform: translateX(-30%); opacity: 1; } 100% { transform: translateX(130%); opacity: 0; } }
        @keyframes scanXRTL { 0% { transform: translateX(30%); opacity: 1; } 100% { transform: translateX(-130%); opacity: 0; } }
        @keyframes scanYTTB { 0% { transform: translateY(-30%); opacity: 1; } 100% { transform: translateY(130%); opacity: 0; } }
        @keyframes scanYBTT { 0% { transform: translateY(30%); opacity: 1; } 100% { transform: translateY(-130%); opacity: 0; } }

        .scan-wrap { position: absolute; inset: 0; pointer-events: none; will-change: transform, opacity; }
        .scan-bar {
          position: absolute; height: 2px; width: 92%; top: 0; left: 0; border-radius: 9999px;
          background: linear-gradient(90deg,
            rgba(2,132,199,0) 0%,
            rgba(2,132,199,var(--beam-alpha-light)) 55%,
            rgba(2,132,199,0) 100%);
          filter: drop-shadow(0 0 var(--beam-blur) rgba(14,165,233,0.26));
        }
        .dark .scan-bar {
          background: linear-gradient(90deg,
            rgba(59,130,246,0) 0%,
            rgba(59,130,246,var(--beam-alpha-dark)) 55%,
            rgba(59,130,246,0) 100%);
          filter: drop-shadow(0 0 var(--beam-blur) rgba(59,130,246,0.5));
          mix-blend-mode: screen; /* additive only in dark for crispness */
        }
        .scan-bar:nth-child(2) { animation-delay: 8s; opacity: .85; }
        .scan-bar:nth-child(3) { animation-delay: 1.6s; opacity: .7; }

        .scan-ltr .scan-bar { animation: scanX 9s linear infinite; }
        .scan-rtl .scan-bar { right: 0; left: auto; animation: scanXRTL 9s linear infinite; }
        .scan-ttb .scan-bar, .scan-btt .scan-bar { width: 2px; height: 92%; left: -1px; }
        .scan-ttb .scan-bar { animation: scanYTTB 11s linear infinite; top: 0; }
        .scan-btt .scan-bar { animation: scanYBTT 11s linear infinite; bottom: 0; top: auto; }

        @media (prefers-reduced-motion: reduce) {
          .scan-bar { animation: none !important; opacity: .0 !important; }
        }
      `}</style>
    </section>
  );
}

/* ===== UI bits ===== */
function GridBackground() {
  return <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />;
}

function ScanLines({
  dir = "ltr",
  className = "",
}: {
  dir?: "ltr" | "rtl" | "ttb" | "btt";
  className?: string;
}) {
  const base =
    dir === "rtl" ? "scan-rtl" : dir === "ttb" ? "scan-ttb" : dir === "btt" ? "scan-btt" : "scan-ltr";
  return (
    <div className={`scan-wrap ${base} ${className}`}>
      <div className="scan-bar" />
      <div className="scan-bar" />
      <div className="scan-bar" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-white/10 dark:bg-black/30">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/50">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-600 dark:border-white/10 dark:bg-black/20 dark:text-white/60">
      {label}
    </div>
  );
}

function EntriesTable({ shifts, now }: { shifts: Shift[]; now: number }) {
  if (shifts.length === 0) return <EmptyState label="No entries" />;
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
      <table className="min-w-full table-fixed divide-y divide-slate-200 dark:divide-white/10">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-white/5 dark:text-white/60">
          <tr>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Clock In</th>
            <th className="px-4 py-2 text-left">Clock Out</th>
            <th className="px-4 py-2 text-left">Break</th>
            <th className="px-4 py-2 text-left">Worked</th>
            <th className="px-4 py-2 text-left">Note</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm dark:divide-white/10">
          {shifts
            .slice()
            .sort((a, b) => b.clockIn - a.clockIn)
            .map((s) => {
              const breakMs = calcBreakMs(s, now);
              const workMs = calcShiftMs(s, now);
              return (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="px-4 py-3 text-slate-700 dark:text-white/80">{s.date}</td>
                  <td className="px-4 py-3 text-slate-800 dark:text-white/90">{prettyTime(s.clockIn)}</td>
                  <td className="px-4 py-3 text-slate-800 dark:text-white/90">{s.clockOut ? prettyTime(s.clockOut) : "—"}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-white/80">{fmtHM(breakMs)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{fmtHM(workMs)}</td>
                  <td className="px-4 py-3 text-slate-700 whitespace-pre-wrap dark:text-white/70">{s.note ?? ""}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

function guessCurrency(): string {
  const l = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
  if (l.includes("jp")) return "JPY";
  if (l.includes("en-us")) return "USD";
  if (l.includes("en-gb")) return "GBP";
  if (l.includes("de") || l.includes("fr") || l.includes("es")) return "EUR";
  return "USD";
}
