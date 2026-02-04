
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
  Moon,
  Pause,
  Play,
  Settings,
  Square,
  Sun,
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
import { get, post } from "@/lib/timecard/api";
import { decodeJwt, getAccessToken } from "@/app/timecard/auth";
import type { User } from "@/lib/timecard/user";

/* ===== Employees (static; replace with API as needed) ===== */
const EMPLOYEES: {
  id: string;
  name: string;
  dept?: string;
  rate?: number;
}[] = [
  { id: "1001", name: "Aung Aung", dept: "Sales", rate: 1300 },
  { id: "1002", name: "Su Su", dept: "Cashier", rate: 1200 },
  { id: "1003", name: "Ko Ko", dept: "Stock", rate: 1200 },
  { id: "2001", name: "Mia", dept: "HR", rate: 1500 },
  { id:"1004", name: "Sai", dept: "HR", rate:2000 },
];

/* ===== Types ===== */
interface BreakSpan {
  start: number;
  end?: number;
}
interface Shift {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  clockIn: number; // epoch ms
  clockOut?: number;
  breaks: BreakSpan[];
  note?: string;
}

/* ===== Helpers ===== */
const LS_KEY_V1 = "timecard_pro_v1"; // old
const LS_KEY = "timecard_pro_v2"; // new with schema + undo stack
const toYmd = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
const prettyHM = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
    sec
  ).padStart(2, "0")}`;
};
const prettyClock = (t: number | Date) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(t);
const breakMs = (sh: Shift, now = Date.now()) =>
  sh.breaks.reduce((a, b) => a + ((b.end ?? now) - b.start), 0);
const workMs = (sh: Shift, now = Date.now()) =>
  Math.max(0, (sh.clockOut ?? now) - sh.clockIn - breakMs(sh, now));
const onBreak = (sh?: Shift) =>
  !!sh && sh.breaks.some((b) => b.end === undefined);
const weekStart = (d = new Date()) => {
  const n = new Date(d);
  const day = (n.getDay() + 6) % 7; // Monday
  n.setHours(0, 0, 0, 0);
  n.setDate(n.getDate() - day);
  return n;
};

/* ===== Storage + migration ===== */
function loadV2(): Shift[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveV2(arr: Shift[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}
function migrateFromV1IfNeeded() {
  if (typeof window === "undefined") return [] as Shift[];
  const v2 = localStorage.getItem(LS_KEY);
  if (v2) return JSON.parse(v2) as Shift[];
  const v1 = localStorage.getItem(LS_KEY_V1);
  if (!v1) return [] as Shift[];
  try {
    const arr: Shift[] = JSON.parse(v1);
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
    toast.success("Data migrated from v1 storage");
    return arr;
  } catch {
    return [] as Shift[];
  }
}

/* ===== Theme / FX ===== */
function useMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => setM(true), []);
  return m;
}
function ThemeToggle() {
  const mounted = useMounted();
  const { resolvedTheme, setTheme } = useTheme();
  if (!mounted)
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        className="rounded-2xl"
      />
    );
  const isDark = resolvedTheme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-2xl"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

/* ===== Component ===== */
export default function TimecardPro() {
  const mounted = useMounted();

  // Client-only ticking clock (hydration-safe)
  const [now, setNow] = React.useState<Date | null>(null);
  const [hourlyRate, setHourlyRate] = React.useState("");
  const [note, setNote] = React.useState("");
  const [shifts, setShifts] = React.useState<Shift[]>([]);
  const [showAll, setShowAll] = React.useState(false);
  const [deptFilter, setDeptFilter] = React.useState<string>("ALL");

  // 🔐 cache for users keyed by id
  const usersCacheRef = React.useRef<Record<string, User>>({});

  // editing modal
  const [editShift, setEditShift] = React.useState<Shift | null>(null);
  const [editNote, setEditNote] = React.useState("");
  const [pendingDelete, setPendingDelete] = React.useState<Shift | null>(null);
  const undoStack = React.useRef<Shift[][]>([]);

  // current employee context
  const [employeeId, setEmployeeId] = React.useState("");
  const [user, setUser] = React.useState<User | null>(null);
  const [userLoading, setUserLoading] = React.useState(false);

  // 🔎 All users dialog state
  const [browseOpen, setBrowseOpen] = React.useState(false);
  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [usersLoading, setUsersLoading] = React.useState(false);
  const [usersErr, setUsersErr] = React.useState<string | null>(null);
  const [userQuery, setUserQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("ALL");

  async function fetchAllUsers() {
    try {
      setUsersLoading(true);
      setUsersErr(null);
      const res = await get<User[]>("/auth/users");
      const list = res || [];
      setAllUsers(list);
      // seed cache
      for (const u of list) {
        usersCacheRef.current[String(u.id)] = u;
      }
    } catch (e: any) {
      setUsersErr(e?.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }

  React.useEffect(() => {
    if (browseOpen && allUsers.length === 0 && !usersLoading) {
      fetchAllUsers();
    }
  }, [browseOpen, allUsers.length, usersLoading]);

  React.useEffect(() => {
    if (!mounted) return;
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [mounted]);

  // Set employeeId from JWT if present
  React.useEffect(() => {
    try {
      const token = getAccessToken();
      if (!token) return;
      const payload = decodeJwt(token) as { sub?: string } | undefined;
      if (payload?.sub) setEmployeeId(payload.sub);
    } catch {
      // ignore invalid token
    }
  }, []);

  React.useEffect(() => setShifts(migrateFromV1IfNeeded()), []);
  React.useEffect(() => saveV2(shifts), [shifts]);

  /* ===== Employee helpers (static list) ===== */
  const getEmployeeLocal = React.useCallback(
    (id: string) => EMPLOYEES.find((e) => e.id === id) ?? null,
    []
  );
  const localEmployee = React.useMemo(
    () => getEmployeeLocal(employeeId),
    [employeeId, getEmployeeLocal]
  );
  const employeeExists = React.useMemo(
    () => !!user || !!localEmployee,
    [user, localEmployee]
  );

  // Auto-fetch user profile by employeeId with cache-first logic
  React.useEffect(() => {
    let cancelled = false;

    setUser(null);
    if (!employeeId) return;

    // 1) Check cache first
    const cached = usersCacheRef.current[String(employeeId)];
    if (cached) {
      setUser(cached);
      return;
    }

    // 2) Optional: check static local list (for name badge fallback only)
    // (we still may fetch API user if available)
    // const local = EMPLOYEES.find(e => e.id === employeeId);
    // if (local) { ... }

    // 3) API fetch
    (async () => {
      try {
        setUserLoading(true);
        const u = await get<User>(`/auth/users/${employeeId}`);
        if (cancelled) return;
        setUser(u);
        usersCacheRef.current[String(u.id)] = u;
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setUserLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  /* ===== Derived ===== */
  const active = React.useMemo(
    () => shifts.find((s) => s.employeeId === employeeId && !s.clockOut),
    [shifts, employeeId]
  );

  const todays = React.useMemo(
    () =>
      shifts.filter((s) => {
        const isToday = s.date === toYmd(now ?? new Date());
        const empOk = showAll ? true : s.employeeId === employeeId;
        const deptOk =
          deptFilter === "ALL"
            ? true
            : getEmployeeLocal(s.employeeId)?.dept === deptFilter;
        return isToday && empOk && deptOk;
      }),
    [shifts, employeeId, now, showAll, deptFilter, getEmployeeLocal]
  );

  const ws = React.useMemo(() => weekStart(now ?? new Date()), [now]);
  const we = React.useMemo(() => {
    const t = new Date(ws);
    t.setDate(ws.getDate() + 6);
    return t;
  }, [ws]);

  const weekly = React.useMemo(
    () =>
      shifts.filter((s) => {
        const d = new Date(s.date + "T00:00:00");
        const inRange = d >= ws && d <= we;
        const empOk = showAll ? true : s.employeeId === employeeId;
        const deptOk =
          deptFilter === "ALL"
            ? true
            : getEmployeeLocal(s.employeeId)?.dept === deptFilter;
        return inRange && empOk && deptOk;
      }),
    [shifts, employeeId, ws, we, showAll, deptFilter, getEmployeeLocal]
  );

  const todayTotal = React.useMemo(
    () => todays.reduce((a, s) => a + workMs(s, +(now ?? Date.now())), 0),
    [todays, now]
  );
  const weekTotal = React.useMemo(
    () => weekly.reduce((a, s) => a + workMs(s, +(now ?? Date.now())), 0),
    [weekly, now]
  );
  const weekBreak = React.useMemo(
    () => weekly.reduce((a, s) => a + breakMs(s, +(now ?? Date.now())), 0),
    [weekly, now]
  );
  const effectiveRate = React.useMemo(
    () => parseFloat(hourlyRate) || (localEmployee?.rate ?? 0),
    [hourlyRate, localEmployee]
  );
  const weekGross = React.useMemo(
    () => effectiveRate * (weekTotal / 3600000),
    [effectiveRate, weekTotal]
  );

  // Simple overtime calc: >8h/day or >40h/week paid at 1.25x
  const weekDailyOverMs = React.useMemo(
    () =>
      weekly.reduce((sum, s) => {
        const worked = workMs(s, +(now ?? Date.now()));
        return sum + Math.max(0, worked - 8 * 3600000);
      }, 0),
    [weekly, now]
  );
  const weekOverMs = React.useMemo(
    () => Math.max(0, weekTotal - 40 * 3600000),
    [weekTotal]
  );
  const weekOverGross = React.useMemo(
    () =>
      effectiveRate * 1.25 * (Math.max(weekDailyOverMs, weekOverMs) / 3600000),
    [effectiveRate, weekDailyOverMs, weekOverMs]
  );

  /* ===== Actions ===== */
  const pushUndo = (prev: Shift[]) => {
    undoStack.current.push(prev);
    if (undoStack.current.length > 20) undoStack.current.shift();
  };
  const undo = () => {
    const prev = undoStack.current.pop();
    if (!prev) return toast("Nothing to undo");
    setShifts(prev);
    toast.success("Undid last change");
  };

  const requireValidEmployee = () => {
    if (showAll) {
      toast.error("Select an Employee ID (Show All is on)");
      return false;
    }
    if (!employeeId) {
      toast.error("Enter Employee ID");
      return false;
    }
    if (!employeeExists) {
      toast.error("Unknown Employee ID");
      return false;
    }
    return true;
  };

  // --- Clock In (API)
  // const doClockIn = async () => {
  //   if (!requireValidEmployee()) return;
  //   if (active) return toast.error("Already clocked in");
  //   try {
  //     const sh = await post<Shift>("/timecard/clock-in", {
  //       employeeId,
  //       note: note || undefined,
  //     });
  //     setShifts((prev) => [sh, ...prev]);
  //     setNote("");
  //     toast.success("Clocked in");
  //   } catch (e) {
  //     const msg = e instanceof Error ? e.message : "Clock-in failed";
  //     toast.error(msg);
  //   }
  // };



  // --- Clock In (API)
const doClockIn = async () => {
  if (!requireValidEmployee()) return;
  if (active) return toast.error("Already clocked in");
  try {
    const sh = await post<Shift>("/timecard/clock-in", {
      employeeId,
      note: note || undefined,
    });
    setShifts((prev) => [sh, ...prev]);
    setNote("");
    toast.success("Clocked in");
  } catch (e: any) {
    const msg = e?.message || "Clock-in failed";
    toast.error(msg);
  }
};


  const doClockOut = () => {
    if (!requireValidEmployee()) return;
    if (!active) return toast.error("Not clocked in");
    const end = Date.now();
    pushUndo(shifts);
    setShifts((prev) =>
      prev.map((s) =>
        s.id === active.id
          ? {
              ...s,
              clockOut: end,
              breaks: s.breaks.map((b) => (b.end ? b : { ...b, end })),
            }
          : s
      )
    );
    toast.success("Clocked out");
  };

  const startBreak = () => {
    if (!requireValidEmployee()) return;
    if (!active) return toast.error("Not clocked in");
    if (onBreak(active)) return toast.error("Break already started");
    pushUndo(shifts);
    setShifts((prev) =>
      prev.map((s) =>
        s.id === active.id
          ? { ...s, breaks: [...s.breaks, { start: Date.now() }] }
          : s
      )
    );
    toast("Break started", { icon: "☕" });
  };

  const endBreak = () => {
    if (!requireValidEmployee()) return;
    if (!active) return toast.error("Not clocked in");
    if (!onBreak(active)) return toast.error("No active break");
    pushUndo(shifts);
    setShifts((prev) =>
      prev.map((s) => {
        if (s.id !== active.id) return s;
        const last = [...s.breaks];
        const i = last.findIndex((b) => !b.end);
        if (i >= 0) last[i] = { ...last[i], end: Date.now() };
        return { ...s, breaks: last };
      })
    );
    toast.success("Break ended");
  };

  const saveNoteToActive = () => {
    if (!note.trim()) return;
    if (!requireValidEmployee()) return;
    if (active) {
      pushUndo(shifts);
      setShifts((prev) =>
        prev.map((s) => (s.id === active.id ? { ...s, note } : s))
      );
      toast.success("Note saved");
    } else {
      toast("No active shift");
    }
    setNote("");
  };

  const clearToday = () => {
    if (showAll) return toast.error("Select an Employee ID (Show All is on)");
    if (!employeeId) return;
    if (!employeeExists) return toast.error("Unknown Employee ID");
    pushUndo(shifts);
    setShifts((prev) =>
      prev.filter(
        (s) =>
          !(s.employeeId === employeeId && s.date === toYmd(now ?? new Date()))
      )
    );
    toast.success("Cleared today");
  };

  const exportCSV = () => {
    const source = showAll
      ? shifts
      : shifts.filter((s) => s.employeeId === employeeId);
    if (!showAll && !employeeExists) return toast.error("Unknown Employee ID");
    const rows = source
      .slice()
      .sort((a, b) => a.clockIn - b.clockIn)
      .map((s) => {
        const br = Math.round(breakMs(s) / 60000);
        const cols = [
          s.date,
          ...(showAll
            ? [getEmployeeLocal(s.employeeId)?.name ?? s.employeeId]
            : []),
          prettyClock(s.clockIn),
          s.clockOut ? prettyClock(s.clockOut) : "",
          String(br),
          prettyHM(workMs(s)),
          (s.note ?? "").replaceAll("\n", " "),
        ];
        return cols.map(csvEscape);
      });
    const header = showAll
      ? [
          "Date",
          "Employee",
          "Clock In",
          "Clock Out",
          "Break (min)",
          "Worked (h:mm:ss)",
          "Note",
        ]
      : [
          "Date",
          "Clock In",
          "Clock Out",
          "Break (min)",
          "Worked (h:mm:ss)",
          "Note",
        ];
    const csv = [header.map(csvEscape), ...rows]
      .map((r) => r.join(","))
      .join("\n");
    downloadText(
      csv,
      `timecard_${showAll ? "all" : employeeId || "all"}_${toYmd(
        now ?? new Date()
      )}.csv`,
      "text/csv;charset=utf-8;"
    );
  };

  const exportJSON = () => {
    const data = JSON.stringify({ version: 2, shifts }, null, 2);
    downloadText(
      data,
      `timecard_export_${toYmd(now ?? new Date())}.json`,
      "application/json"
    );
  };

  const importJSON = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!parsed || !Array.isArray(parsed.shifts ?? parsed))
          throw new Error("Invalid file");
        pushUndo(shifts);
        setShifts(parsed.shifts ?? parsed);
        toast.success("Imported shifts");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        toast.error(`Import failed: ${msg}`);
      }
    };
    reader.readAsText(file);
  };

  /* ===== Hero strings (hydration-safe) ===== */
  const statusText = showAll
    ? "All Employees View"
    : !employeeId
    ? "No Employee"
    : active
    ? onBreak(active)
      ? "On Break"
      : "On The Clock"
    : "Off The Clock";

  const heroTime = React.useMemo(() => {
    if (!now) return "--:--:--";
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(now);
  }, [now]);

  const heroDate = React.useMemo(() => {
    if (!now) return "";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(
      now
    );
  }, [now]);

  const tz = React.useMemo(() => {
    if (!mounted) return "—";
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }, [mounted]);

  /* ===== Utilization ratios ===== */
  const weekWorkedRatio =
    weekTotal === 0 ? 0 : weekTotal / (weekTotal + weekBreak);
  const weekBreakRatio =
    weekTotal === 0 ? 0 : weekBreak / (weekTotal + weekBreak);

  // keyboard shortcuts (single-employee mode)
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (showAll) return;
      if (!employeeExists) return;
      if (e.key === "i") {
        doClockIn();
      }
      if (e.key === "o") {
        doClockOut();
      }
      if (e.key === "b") {
        active && onBreak(active) ? endBreak() : startBreak();
      }
      if (e.key === "u") {
        undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAll, employeeExists, active]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-white text-slate-900 dark:bg-black dark:text-neutral-200">
      <Toaster position="top-right" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 z-50 bg-black text-white rounded px-3 py-2"
      >
        Skip to content
      </a>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_10%,rgba(14,165,233,0.08),transparent_40%),radial-gradient(ellipse_at_90%_90%,rgba(59,130,246,0.06),transparent_38%)]" />

      <div id="main" className="relative z-10 mx-auto w-[92%] max-w-7xl py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_64px_-24px_rgba(59,130,246,0.18)] dark:backdrop-blur-md">
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    className={cn(
                      "border",
                      showAll
                        ? "border-sky-300/60 bg-sky-100 text-sky-800 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-200"
                        : employeeId && !employeeExists
                        ? "border-rose-300/60 bg-rose-100 text-rose-800 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200"
                        : "border-sky-300/40 bg-sky-100 text-sky-700 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-300"
                    )}
                  >
                    {statusText}
                  </Badge>

                  {/* 👤 Employee name/dept badge (API user preferred, fallback to static) */}
                  {!showAll && (user || localEmployee) && (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200"
                    >
                      👤 {user?.username ?? localEmployee?.name}
                      {localEmployee?.dept ? ` (${localEmployee.dept})` : ""}
                    </Badge>
                  )}

                  <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-white/70"
                    suppressHydrationWarning
                  >
                    {tz}
                  </Badge>
                  <div className="ml-auto flex items-center gap-2 text-xs text-slate-500 dark:text-white/60">
                    <ThemeToggle />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-600 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/5"
                    >
                      <Settings className="mr-2 h-4 w-4" /> Preferences
                    </Button>
                  </div>
                </div>

                {/* Time + Employee ID / Show All */}
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <motion.h1
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45 }}
                      className="text-5xl font-extrabold leading-none tracking-tight text-slate-900 sm:text-6xl md:text-7xl dark:text-white"
                      suppressHydrationWarning
                    >
                      {heroTime}
                    </motion.h1>
                    <p
                      className="text-lg font-medium text-sky-800/80 md:text-2xl dark:text-sky-300/90"
                      suppressHydrationWarning
                    >
                      {heroDate}
                    </p>
                  </div>

                  <div className="grid content-start gap-3">
                    <label
                      htmlFor="empid"
                      className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/50"
                    >
                      Employee / Filters
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative flex-1 min-w-[220px]">
                        <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
                        <Input
                          id="empid"
                          value={employeeId}
                          onChange={(e) => setEmployeeId(e.target.value.trim())}
                          placeholder="Enter Employee ID (UUID or number)"
                          className="pl-9 font-mono"
                          disabled={showAll}
                        />
                      </div>

                      {/* 🧑 auto-show employee info */}
                      {employeeId && (user || localEmployee) && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200"
                        >
                          👤 {user?.username ?? localEmployee?.name}
                          {localEmployee?.dept ? ` (${localEmployee.dept})` : ""}
                        </Badge>
                      )}

                      {employeeId && !user && !localEmployee && userLoading && (
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/80"
                        >
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          Checking…
                        </Badge>
                      )}

                      {employeeId && !user && !localEmployee && !userLoading && (
                        <Badge
                          variant="secondary"
                          className="bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200"
                        >
                          ❌ Not found
                        </Badge>
                      )}

                      <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-white/15 dark:bg-white/5"
                      >
                        <option value="ALL">All depts</option>
                        {[
                          ...new Set(
                            EMPLOYEES.map((e) => e.dept).filter(Boolean)
                          ),
                        ].map((d) => (
                          <option key={String(d)} value={String(d)}>
                            {String(d)}
                          </option>
                        ))}
                      </select>

                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          setEmployeeId("");
                          setDeptFilter("ALL");
                        }}
                        disabled={showAll}
                      >
                        Clear
                      </Button>

                      {/* 🔎 Browse Users dialog opener */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setBrowseOpen(true)}
                        className="whitespace-nowrap"
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Browse Users
                      </Button>

                      <Button
                        type="button"
                        variant={showAll ? "default" : "outline"}
                        onClick={() => setShowAll((v) => !v)}
                        className={cn(
                          "ml-auto",
                          showAll
                            ? "bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-600"
                            : ""
                        )}
                        aria-pressed={showAll}
                      >
                        {showAll
                          ? "Showing: All Employees"
                          : "Show All Employees"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <ActionButton
                    onClick={doClockIn}
                    disabled={
                      showAll || !employeeId || !employeeExists || !!active
                    }
                    icon={Play}
                    label="Clock In"
                    intent="primary"
                  />
                  <ActionButton
                    onClick={startBreak}
                    disabled={
                      showAll ||
                      !employeeId ||
                      !employeeExists ||
                      !active ||
                      onBreak(active)
                    }
                    icon={Coffee}
                    label="Start Break"
                  />
                  <ActionButton
                    onClick={endBreak}
                    disabled={
                      showAll ||
                      !employeeId ||
                      !employeeExists ||
                      !active ||
                      !onBreak(active)
                    }
                    icon={Pause}
                    label="End Break"
                  />
                  <ActionButton
                    onClick={doClockOut}
                    disabled={
                      showAll || !employeeId || !employeeExists || !active
                    }
                    icon={Square}
                    label="Clock Out"
                    intent="danger"
                  />
                  <ActionButton
                    onClick={undo}
                    disabled={undoStack.current.length === 0}
                    icon={Undo2}
                    label="Undo"
                  />
                </div>

                {/* Session pill (single-employee mode only) */}
                {!showAll && (
                  <div className="mt-6">
                    <SessionPill active={active} now={+(now ?? Date.now())} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ENTRIES + INSIGHTS */}
            <Card className="border-slate-200 dark:border-white/10">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-slate-800 dark:text-white/90">
                    {showAll ? "All Employees — Entries" : "Entries"}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportCSV}
                      className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                    >
                      <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportJSON}
                      className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                    >
                      <FileJson className="mr-2 h-4 w-4" /> Export JSON
                    </Button>
                    <label className="inline-flex items-center">
                      <input
                        type="file"
                        accept="application/json"
                        className="hidden"
                        onChange={(e) => importJSON(e.target.files?.[0])}
                      />
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                      >
                        <span>
                          <Upload className="mr-2 h-4 w-4" /> Import JSON
                        </span>
                      </Button>
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearToday}
                      disabled={showAll || !employeeId || !employeeExists}
                      className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                    >
                      Clear today
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="today" className="w-full">
                  <div className="flex items-center justify-between gap-3">
                    <TabsList className="bg-slate-100 dark:bg-white/5">
                      <TabsTrigger
                        value="today"
                        className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-700 dark:data-[state=active]:bg-sky-500/20 dark:data-[state=active]:text-sky-200"
                      >
                        Today
                      </TabsTrigger>
                      <TabsTrigger
                        value="week"
                        className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-700 dark:data-[state=active]:bg-sky-500/20 dark:data-[state=active]:text-sky-200"
                      >
                        This week
                      </TabsTrigger>
                    </TabsList>

                    <div className="hidden md:flex items-center gap-3 text-sm text-slate-600 dark:text-white/70">
                      <InsightsChip
                        icon={ChartPie}
                        label="Worked"
                        value={prettyHM(weekTotal)}
                      />
                      <InsightsChip
                        icon={Coffee}
                        label="Break"
                        value={prettyHM(weekBreak)}
                      />
                      <InsightsChip
                        icon={Check}
                        label="Earnings"
                        value={earningsFmt(weekGross + weekOverGross)}
                      />
                    </div>

                    {!showAll && active && (
                      <span className="hidden md:inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100 px-3 py-1 text-xs text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </span>
                        <span className="font-medium">
                          {onBreak(active) ? "On Break: " : "Working now: "}
                          {getEmployeeLocal(active.employeeId)?.name ??
                            user?.username ??
                            active.employeeId}
                        </span>
                      </span>
                    )}
                  </div>

                  <Separator className="my-4 bg-slate-200 dark:bg-white/10" />

                  {/* Today */}
                  <TabsContent value="today" className="m-0">
                    {showAll ? (
                      todays.length === 0 ? (
                        <EmptyState label="No entries (all employees) for today" />
                      ) : (
                        <EntriesTable
                          shifts={todays}
                          now={+(now ?? Date.now())}
                          getEmployee={(id) => getEmployeeLocal(id)}
                          onEdit={(s) => {
                            setEditShift(s);
                            setEditNote(s.note ?? "");
                          }}
                          onDelete={(s) => setPendingDelete(s)}
                        />
                      )
                    ) : employeeId ? (
                      todays.length === 0 ? (
                        <EmptyState label="No entries for today yet" />
                      ) : (
                        <EntriesTable
                          shifts={todays}
                          now={+(now ?? Date.now())}
                          getEmployee={(id) => getEmployeeLocal(id)}
                          onEdit={(s) => {
                            setEditShift(s);
                            setEditNote(s.note ?? "");
                          }}
                          onDelete={(s) => setPendingDelete(s)}
                        />
                      )
                    ) : (
                      <EmptyState label="Enter Employee ID to view entries" />
                    )}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-slate-600 dark:text-white/70">
                        Today total:{" "}
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {prettyHM(todayTotal)}
                        </span>
                      </p>
                      <Badge className="border border-emerald-300/60 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                        OT est:{" "}
                        {prettyHM(Math.max(0, todayTotal - 8 * 3600000))}
                      </Badge>
                    </div>
                  </TabsContent>

                  {/* Week */}
                  <TabsContent value="week" className="m-0">
                    {showAll ? (
                      weekly.length === 0 ? (
                        <EmptyState label="No entries (all employees) for this week" />
                      ) : (
                        <EntriesTable
                          shifts={weekly}
                          now={+(now ?? Date.now())}
                          getEmployee={(id) => getEmployeeLocal(id)}
                          onEdit={(s) => {
                            setEditShift(s);
                            setEditNote(s.note ?? "");
                          }}
                          onDelete={(s) => setPendingDelete(s)}
                        />
                      )
                    ) : employeeId ? (
                      weekly.length === 0 ? (
                        <EmptyState label="No entries for this week" />
                      ) : (
                        <EntriesTable
                          shifts={weekly}
                          now={+(now ?? Date.now())}
                          getEmployee={(id) => getEmployeeLocal(id)}
                          onEdit={(s) => {
                            setEditShift(s);
                            setEditNote(s.note ?? "");
                          }}
                          onDelete={(s) => setPendingDelete(s)}
                        />
                      )
                    ) : (
                      <EmptyState label="Enter Employee ID to view entries" />
                    )}

                    {/* Week footer */}
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          inputMode="decimal"
                          placeholder="Hourly rate (optional)"
                          className="h-9 w-56 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 dark:bg-black/40 dark:text-white dark:placeholder:text-white/40"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                        />
                        <Badge className="border border-emerald-300/60 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                          Est. earnings:{" "}
                          {earningsFmt(weekGross + weekOverGross)}
                        </Badge>
                      </div>
                      <UtilizationRing
                        worked={weekWorkedRatio}
                        breakPct={weekBreakRatio}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-white/60">
                      Overtime shown at 1.25× where applicable.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="relative overflow-hidden border-slate-200 bg-gradient-to-b from-sky-50/60 to-transparent dark:border-white/10 dark:from-sky-500/10 dark:to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white/90">
                  <UserRound className="h-5 w-5 text-sky-600 dark:text-sky-300" />{" "}
                  Kiosk keypad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Keypad
                  onPress={(n) =>
                    setEmployeeId((v) => (showAll ? v : (v + n).slice(0, 10)))
                  }
                  onBackspace={() =>
                    setEmployeeId((v) => (showAll ? v : v.slice(0, -1)))
                  }
                  onClear={() => (showAll ? null : setEmployeeId(""))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={doClockIn}
                    disabled={
                      showAll || !employeeId || !employeeExists || !!active
                    }
                    variant="secondary"
                    className="justify-start bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15"
                  >
                    <Play className="mr-2 h-4 w-4" /> Clock In
                  </Button>
                  <Button
                    onClick={doClockOut}
                    disabled={
                      showAll || !employeeId || !employeeExists || !active
                    }
                    variant="secondary"
                    className="justify-start bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15"
                  >
                    <Square className="mr-2 h-4 w-4" /> Clock Out
                  </Button>
                  <Button
                    onClick={startBreak}
                    disabled={
                      showAll ||
                      !employeeId ||
                      !employeeExists ||
                      !(active && !onBreak(active))
                    }
                    variant="secondary"
                    className="justify-start bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15"
                  >
                    <Coffee className="mr-2 h-4 w-4" /> Start Break
                  </Button>
                  <Button
                    onClick={endBreak}
                    disabled={
                      showAll ||
                      !employeeId ||
                      !employeeExists ||
                      !(active && onBreak(active))
                    }
                    variant="secondary"
                    className="justify-start bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15"
                  >
                    <Pause className="mr-2 h-4 w-4" /> End Break
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white/90">
                  <TimerReset className="h-5 w-5 text-sky-600 dark:text-sky-300" />{" "}
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={6}
                  placeholder="Add a note…"
                  className="min-h-[140px] resize-none bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 dark:bg-black/40 dark:text-white dark:placeholder:text-white/40"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className="mt-3 flex justify-between">
                  <span className="text-xs text-slate-500 dark:text-white/50">
                    Tip: Press{" "}
                    <kbd className="rounded bg-slate-100 px-1 dark:bg-white/10">
                      i
                    </kbd>
                    ,{" "}
                    <kbd className="rounded bg-slate-100 px-1 dark:bg-white/10">
                      o
                    </kbd>
                    ,{" "}
                    <kbd className="rounded bg-slate-100 px-1 dark:bg-white/10">
                      b
                    </kbd>{" "}
                    for quick actions.
                  </span>
                  <Button
                    className="bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500"
                    onClick={saveNoteToActive}
                  >
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white/90">
                  <CalendarDays className="h-5 w-5 text-sky-600 dark:text-sky-300" />{" "}
                  Today summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-slate-200 dark:divide-white/10">
                  <li className="flex items-center justify-between py-3 text-sm">
                    <span className="text-slate-600 dark:text-white/70">
                      {showAll ? "Employees (today)" : "Shifts"}
                    </span>
                    <span className="text-slate-900 dark:text-white">
                      {todays.length}
                    </span>
                  </li>
                  <li className="flex items-center justify-between py-3 text-sm">
                    <span className="text-slate-600 dark:text-white/70">
                      Worked
                    </span>
                    <span className="text-slate-900 dark:text-white">
                      {prettyHM(todayTotal)}
                    </span>
                  </li>
                  <li className="flex items-center justify-between py-3 text-sm">
                    <span className="text-slate-600 dark:text-white/70">
                      Breaks
                    </span>
                    <span className="text-slate-900 dark:text-white">
                      {prettyHM(
                        todays.reduce(
                          (a, s) => a + breakMs(s, +(now ?? Date.now())),
                          0
                        )
                      )}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <Dialog
        open={!!editShift}
        onOpenChange={(open) => {
          if (!open) setEditShift(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit entry</DialogTitle>
          </DialogHeader>
          {editShift && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-white/60">
                    Clock In
                  </label>
                  <Input
                    type="datetime-local"
                    value={toLocalInput(editShift.clockIn)}
                    onChange={(e) =>
                      setEditShift({
                        ...editShift,
                        clockIn: fromLocalInput(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-white/60">
                    Clock Out
                  </label>
                  <Input
                    type="datetime-local"
                    value={
                      editShift.clockOut ? toLocalInput(editShift.clockOut) : ""
                    }
                    onChange={(e) =>
                      setEditShift({
                        ...editShift,
                        clockOut: e.target.value
                          ? fromLocalInput(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-white/60">
                  Note
                </label>
                <Textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditShift(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editShift) return;
                pushUndo(shifts);
                setShifts((prev) =>
                  prev.map((s) =>
                    s.id === editShift.id ? { ...editShift, note: editNote } : s
                  )
                );
                setEditShift(null);
                toast.success("Entry updated");
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!pendingDelete) return;
                pushUndo(shifts);
                setShifts((prev) =>
                  prev.filter((s) => s.id !== pendingDelete.id)
                );
                setPendingDelete(null);
                toast.success("Entry deleted");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 🔎 All Users Dialog mount */}
      <AllUsersDialog
        open={browseOpen}
        onOpenChange={setBrowseOpen}
        users={allUsers}
        loading={usersLoading}
        error={usersErr}
        onReload={fetchAllUsers}
        onPick={(u) => {
          const idStr = String(u.id);
          setEmployeeId(idStr);
          setUser(u); // show immediately
          usersCacheRef.current[idStr] = u; // cache to prevent flicker
          setBrowseOpen(false);
          toast.success(`Selected ${u.username || idStr}`);
        }}
        query={userQuery}
        setQuery={setUserQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />

      <footer className="pointer-events-none absolute inset-x-0 bottom-6 z-10 text-center text-xs text-slate-500 dark:text-white/30">
        Timecard Pro • Shadcn × Framer
      </footer>

      <style jsx global>{`
        .tc-ring {
          --size: 88px;
          width: var(--size);
          height: var(--size);
          display: grid;
          place-items: center;
          position: relative;
        }
        .tc-ring svg {
          position: absolute;
          inset: 0;
        }
        .sticky-th thead th {
          position: sticky;
          top: 0;
          z-index: 1;
        }
        .zebra tbody tr:nth-child(odd) {
          background: rgba(2, 6, 23, 0.03);
        }
        .dark .zebra tbody tr:nth-child(odd) {
          background: rgba(255, 255, 255, 0.04);
        }
      `}</style>
    </section>
  );
}

/* ===== UI bits ===== */
function ActionButton({
  onClick,
  disabled,
  icon: Icon,
  label,
  intent = "default",
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ComponentType<any>;
  label: string;
  intent?: "default" | "primary" | "danger";
}) {
  const base =
    intent === "primary"
      ? "bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 dark:bg-sky-600 dark:hover:bg-sky-500"
      : intent === "danger"
      ? "bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 dark:bg-red-600/80 dark:hover:bg-red-600"
      : "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15";
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn("justify-center", base)}
    >
      <Icon className="mr-2 h-4 w-4" /> {label}
    </Button>
  );
}

function SessionPill({ active, now }: { active?: Shift; now: number }) {
  const net = active ? workMs(active, now) : 0;
  const br = active ? breakMs(active, now) : 0;
  const total = net + br;
  const netPct = total === 0 ? 0 : (net / total) * 100;
  const brPct = total === 0 ? 0 : (br / total) * 100;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-black/30">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {active ? (onBreak(active) ? "Break" : "Working") : "—"}
          </Badge>
          {active && (
            <span className="text-xs text-slate-500 dark:text-white/50">
              Started {prettyClock(active.clockIn)}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/50">
            Net
          </p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {prettyHM(net)}
          </p>
        </div>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div className="h-full bg-sky-500/80" style={{ width: `${netPct}%` }} />
        <div
          className="-mt-3 h-3 bg-amber-500/70"
          style={{ width: `${brPct}%` }}
        />
      </div>
      <div className="mt-2 grid grid-cols-3 text-center text-xs text-slate-600 dark:text-white/70">
        <div>Elapsed: {prettyHM(total)}</div>
        <div>Break: {prettyHM(br)}</div>
        <div>Net: {prettyHM(net)}</div>
      </div>
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

function EntriesTable({
  shifts,
  now,
  getEmployee,
  onEdit,
  onDelete,
}: {
  shifts: Shift[];
  now: number;
  getEmployee: (
    id: string
  ) => { id: string; name: string; dept?: string } | null;
  onEdit: (s: Shift) => void;
  onDelete: (s: Shift) => void;
}) {
  if (shifts.length === 0) return <EmptyState label="No entries" />;

  const totalBreak = shifts.reduce((a, s) => a + breakMs(s, now), 0);
  const totalWork = shifts.reduce((a, s) => a + workMs(s, now), 0);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
      <table className="sticky-th zebra min-w-full table-fixed divide-y divide-slate-200 dark:divide-white/10">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-white/5 dark:text-white/60">
          <tr>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Employee</th>
            <th className="px-4 py-2 text-left">Clock In</th>
            <th className="px-4 py-2 text-left">Clock Out</th>
            <th className="px-4 py-2 text-left">Break</th>
            <th className="px-4 py-2 text-left">Worked</th>
            <th className="px-4 py-2 text-left">Note</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm dark:divide-white/10">
          {shifts
            .slice()
            .sort((a, b) => b.clockIn - a.clockIn)
            .map((s) => {
              const br = breakMs(s, now);
              const wk = workMs(s, now);
              const emp = getEmployee(s.employeeId);
              const isLive = !s.clockOut;
              const isOnBreak = isLive && onBreak(s);
              return (
                <tr
                  key={s.id}
                  className={cn(
                    "hover:bg-slate-50 dark:hover:bg-white/5",
                    isLive && "bg-sky-50/60 dark:bg-sky-500/10"
                  )}
                >
                  <td className="px-4 py-3">
                    {isLive ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-60" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" />
                        </span>
                        <Badge
                          className={cn(
                            "border px-2 py-0.5",
                            isOnBreak
                              ? "border-amber-300/60 bg-amber-100 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200"
                              : "border-emerald-300/60 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                          )}
                        >
                          {isOnBreak ? "On Break" : "Working Now"}
                        </Badge>
                      </span>
                    ) : (
                      <Badge className="border border-slate-300/60 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white/80 px-2 py-0.5">
                        Finished
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-white/80">
                    {s.date}
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className={cn(
                        "font-medium",
                        emp
                          ? "text-slate-900 dark:text-white"
                          : "text-rose-700 dark:text-rose-300"
                      )}
                    >
                      {emp ? emp.name : `Unknown (${s.employeeId})`}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-white/60">
                      {emp?.dept ?? (emp ? "" : "Not in directory")}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-800 dark:text-white/90">
                    {prettyClock(s.clockIn)}
                  </td>
                  <td className="px-4 py-3 text-slate-800 dark:text-white/90">
                    {s.clockOut ? prettyClock(s.clockOut) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-white/80">
                    {prettyHM(br)}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {prettyHM(wk)}
                  </td>
                  <td className="px-4 py-3 text-slate-700 whitespace-pre-wrap dark:text-white/70">
                    {s.note ?? ""}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(s)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onDelete(s)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50/60 dark:bg-white/5 text-sm">
            <td className="px-4 py-2" colSpan={5}>
              Totals
            </td>
            <td className="px-4 py-2">{prettyHM(totalBreak)}</td>
            <td className="px-4 py-2 font-semibold">{prettyHM(totalWork)}</td>
            <td className="px-4 py-2" colSpan={2}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function Keypad({
  onPress,
  onBackspace,
  onClear,
}: {
  onPress: (n: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  return (
    <div className="grid grid-cols-3 gap-3">
      {keys.slice(0, 9).map((k) => (
        <Button
          key={k}
          type="button"
          variant="outline"
          onClick={() => onPress(k)}
          className="h-14 text-lg"
        >
          {k}
        </Button>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={onClear}
        className="h-14 text-lg"
      >
        Clear
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => onPress("0")}
        className="h-14 text-lg"
      >
        0
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={onBackspace}
        className="h-14 text-lg"
      >
        <X className="h-4 w-4 mr-2" /> Back
      </Button>
    </div>
  );
}

function InsightsChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
      <Icon className="h-3.5 w-3.5" /> {label}:{" "}
      <strong className="font-semibold">{value}</strong>
    </span>
  );
}

function UtilizationRing({
  worked,
  breakPct,
}: {
  worked: number;
  breakPct: number;
}) {
  const size = 88,
    stroke = 8,
    r = (size - stroke) / 2,
    c = 2 * Math.PI * r;
  const workedLen = c * worked,
    breakLen = c * breakPct;
  return (
    <div className="flex items-center gap-4">
      <div className="tc-ring" aria-label="Weekly utilization ring">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            className="fill-none stroke-slate-200/60 dark:stroke-white/10"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            className="fill-none stroke-sky-500"
            strokeDasharray={`${workedLen} ${c - workedLen}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            className="fill-none stroke-amber-500"
            strokeDasharray={`${breakLen} ${c - breakLen}`}
            transform={`rotate(${worked * 360 - 90} ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="text-center">
          <p className="text-[10px] uppercase text-slate-500 dark:text-white/60">
            Utilization
          </p>
          <p className="-mt-1 text-sm font-semibold text-slate-900 dark:text-white">
            {Math.round(worked * 100)}%
          </p>
        </div>
      </div>
      <div className="text-xs text-slate-600 dark:text-white/70">
        <p>
          <span className="inline-block h-2 w-2 rounded-full bg-sky-500 align-middle mr-2" />{" "}
          Worked
        </p>
        <p>
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500 align-middle mr-2" />{" "}
          Break
        </p>
      </div>
    </div>
  );
}

function earningsFmt(v: number) {
  const currency = guessCurrency();
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(v || 0);
}
function guessCurrency(): string {
  try {
    const l = (
      Intl.DateTimeFormat().resolvedOptions().locale ||
      navigator?.language ||
      ""
    ).toLowerCase();
    if (l.includes("ja")) return "JPY";
    if (l.includes("en-us")) return "USD";
    if (l.includes("en-gb")) return "GBP";
    if (l.includes("de") || l.includes("fr") || l.includes("es")) return "EUR";
  } catch {}
  return "USD";
}

/* ===== utils ===== */
function csvEscape(s: string) {
  const needs = /[",\n]/.test(s);
  return needs ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function downloadText(text: string, filename: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function toLocalInput(ms: number) {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
function fromLocalInput(v: string) {
  return new Date(v).getTime();
}

/* ===== All Users Dialog ===== */
function AllUsersDialog({
  open,
  onOpenChange,
  users,
  loading,
  error,
  onReload,
  onPick,
  query,
  setQuery,
  roleFilter,
  setRoleFilter,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  users: User[];
  loading: boolean;
  error: string | null;
  onReload: () => void;
  onPick: (u: User) => void;
  query: string;
  setQuery: (v: string) => void;
  roleFilter: string;
  setRoleFilter: (v: string) => void;
}) {
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const text = `${u.username || ""}  ${u.role || ""} ${
        (u as any).dept || ""
      } ${u.id || ""}`;
      const qok = q ? text.toLowerCase().includes(q) : true;
      const rok = roleFilter === "ALL" ? true : (u.role || "") === roleFilter;
      return qok && rok;
    });
  }, [users, query, roleFilter]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>All users</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, role, dept, id…"
                className="pl-9"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-white/15 dark:bg-white/5"
            >
              <option value="ALL">All roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="MANAGER">MANAGER</option>
              <option value="CASHIER">CASHIER</option>
              <option value="STAFF">STAFF</option>
            </select>
            <Button variant="outline" onClick={onReload}>
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading users…
            </div>
          ) : error ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState label="No users found" />
          ) : (
            <div className="max-h-[420px] overflow-auto rounded-lg border border-slate-200 dark:border-white/10">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-white/5 dark:text-white/60">
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Role</th>
                    <th className="px-3 py-2 text-left">Dept</th>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Pick</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {filtered.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">
                        {u.username || "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-700 dark:text-white/80">
                        {u.email || "—"}
                      </td>
                      <td className="px-3 py-2">
                        <Badge className="border border-slate-300/60 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white/80">
                          {u.role || "—"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-slate-700 dark:text-white/80">
                        {(u as any).dept || "—"}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-slate-500 dark:text-white/60">
                        {u.id}
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          size="sm"
                          onClick={() => onPick(u)}
                          className="bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500"
                        >
                          Use
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


















//------ abse Code --- for Time Card 

// "use client";

// import * as React from "react";
// import { motion } from "framer-motion";
// import { useTheme } from "next-themes";
// import toast, { Toaster } from "react-hot-toast";
// import {
//   CalendarDays,
//   ChartPie,
//   Check,
//   Coffee,
//   Download,
//   Hash,
//   Moon,
//   Pause,
//   Play,
//   Settings,
//   Square,
//   Sun,
//   TimerReset,
//   UserRound,
//   X,
//   Pencil,
//   Trash,
//   Upload,
//   FileJson,
//   Undo2,
//   Search,
//   Loader2,
// } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Separator } from "@/components/ui/separator";
// import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { cn } from "@/lib/utils";
// import { get, post } from "@/lib/timecard/api";
// import { decodeJwt, getAccessToken } from "@/app/timecard/auth";
// import type { User } from "@/lib/timecard/user";

// /* ===== Employees (static; replace with API as needed) ===== */
// const EMPLOYEES: {
//   id: string;
//   name: string;
//   dept?: string;
//   rate?: number;
// }[] = [
//   { id: "1001", name: "Aung Aung", dept: "Sales", rate: 1300 },
//   { id: "1002", name: "Su Su", dept: "Cashier", rate: 1200 },
//   { id: "1003", name: "Ko Ko", dept: "Stock", rate: 1200 },
//   { id: "2001", name: "Mia", dept: "HR", rate: 1500 },
// ];

// /* ===== Types ===== */
// interface BreakSpan {
//   start: number;
//   end?: number;
// }
// interface Shift {
//   id: string;
//   employeeId: string;
//   date: string; // YYYY-MM-DD
//   clockIn: number; // epoch ms
//   clockOut?: number;
//   breaks: BreakSpan[];
//   note?: string;
// }

// /* ===== Helpers ===== */
// const LS_KEY_V1 = "timecard_pro_v1";
// const LS_KEY = "timecard_pro_v2";
// const toYmd = (d = new Date()) =>
//   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
//     d.getDate()
//   ).padStart(2, "0")}`;
// const prettyHM = (ms: number) => {
//   const s = Math.max(0, Math.floor(ms / 1000));
//   const h = Math.floor(s / 3600),
//     m = Math.floor((s % 3600) / 60),
//     sec = s % 60;
//   return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
//     sec
//   ).padStart(2, "0")}`;
// };
// const prettyClock = (t: number | Date) =>
//   new Intl.DateTimeFormat(undefined, {
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(t);
// const breakMs = (sh: Shift, now = Date.now()) =>
//   sh.breaks.reduce((a, b) => a + ((b.end ?? now) - b.start), 0);
// const workMs = (sh: Shift, now = Date.now()) =>
//   Math.max(0, (sh.clockOut ?? now) - sh.clockIn - breakMs(sh, now));
// const onBreak = (sh?: Shift) =>
//   !!sh && sh.breaks.some((b) => b.end === undefined);
// const weekStart = (d = new Date()) => {
//   const n = new Date(d);
//   const day = (n.getDay() + 6) % 7; // Monday
//   n.setHours(0, 0, 0, 0);
//   n.setDate(n.getDate() - day);
//   return n;
// };

// /* ===== Storage + migration ===== */
// function loadV2(): Shift[] {
//   if (typeof window === "undefined") return [];
//   try {
//     return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
//   } catch {
//     return [];
//   }
// }
// function saveV2(arr: Shift[]) {
//   if (typeof window === "undefined") return;
//   localStorage.setItem(LS_KEY, JSON.stringify(arr));
// }
// function migrateFromV1IfNeeded() {
//   if (typeof window === "undefined") return [] as Shift[];
//   const v2 = localStorage.getItem(LS_KEY);
//   if (v2) return JSON.parse(v2) as Shift[];
//   const v1 = localStorage.getItem(LS_KEY_V1);
//   if (!v1) return [] as Shift[];
//   try {
//     const arr: Shift[] = JSON.parse(v1);
//     localStorage.setItem(LS_KEY, JSON.stringify(arr));
//     toast.success("Data migrated from v1 storage");
//     return arr;
//   } catch {
//     return [] as Shift[];
//   }
// }

// /* ===== Theme / FX ===== */
// function useMounted() {
//   const [m, setM] = React.useState(false);
//   React.useEffect(() => setM(true), []);
//   return m;
// }
// function ThemeToggle() {
//   const mounted = useMounted();
//   const { resolvedTheme, setTheme } = useTheme();
//   if (!mounted)
//     return (
//       <Button
//         variant="ghost"
//         size="icon"
//         aria-label="Toggle theme"
//         className="rounded-2xl"
//       />
//     );
//   const isDark = resolvedTheme === "dark";
//   return (
//     <Button
//       variant="ghost"
//       size="icon"
//       aria-label="Toggle theme"
//       onClick={() => setTheme(isDark ? "light" : "dark")}
//       className="rounded-2xl"
//     >
//       {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
//     </Button>
//   );
// }

// /* ===== Component ===== */
// export default function TimecardPro() {
//   const mounted = useMounted();

//   // Client-only ticking clock (hydration-safe)
//   const [now, setNow] = React.useState<Date | null>(null);
//   const [hourlyRate, setHourlyRate] = React.useState("");
//   const [note, setNote] = React.useState("");
//   const [shifts, setShifts] = React.useState<Shift[]>([]);
//   const [showAll, setShowAll] = React.useState(false);
//   const [deptFilter, setDeptFilter] = React.useState<string>("ALL");

//   // 🔐 cache for users keyed by id
//   const usersCacheRef = React.useRef<Record<string, User>>({});

//   // editing modal
//   const [editShift, setEditShift] = React.useState<Shift | null>(null);
//   const [editNote, setEditNote] = React.useState("");
//   const [pendingDelete, setPendingDelete] = React.useState<Shift | null>(null);
//   const undoStack = React.useRef<Shift[][]>([]);

//   // current employee context
//   const [employeeId, setEmployeeId] = React.useState("");
//   const [user, setUser] = React.useState<User | null>(null);
//   const [userLoading, setUserLoading] = React.useState(false);

//   // 🔎 All users dialog state
//   const [browseOpen, setBrowseOpen] = React.useState(false);
//   const [allUsers, setAllUsers] = React.useState<User[]>([]);
//   const [usersLoading, setUsersLoading] = React.useState(false);
//   const [usersErr, setUsersErr] = React.useState<string | null>(null);
//   const [userQuery, setUserQuery] = React.useState("");
//   const [roleFilter, setRoleFilter] = React.useState<string>("ALL");

//   async function fetchAllUsers() {
//     try {
//       setUsersLoading(true);
//       setUsersErr(null);
//       const res = await get<User[]>("/auth/users");
//       const list = res || [];
//       setAllUsers(list);
//       // seed cache
//       for (const u of list) {
//         usersCacheRef.current[String(u.id)] = u;
//       }
//     } catch (e: any) {
//       setUsersErr(e?.message || "Failed to load users");
//     } finally {
//       setUsersLoading(false);
//     }
//   }

//   // 👉 showAll ဖွင့်လိုက်တာနဲ့ API users ကို preload လုပ်ထားမယ်
//   React.useEffect(() => {
//     if (showAll && allUsers.length === 0 && !usersLoading) {
//       fetchAllUsers();
//     }
//   }, [showAll, allUsers.length, usersLoading]);

//   React.useEffect(() => {
//     if (!mounted) return;
//     setNow(new Date());
//     const id = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(id);
//   }, [mounted]);

//   // Set employeeId from JWT if present
//   React.useEffect(() => {
//     try {
//       const token = getAccessToken();
//       if (!token) return;
//       const payload = decodeJwt(token) as { sub?: string } | undefined;
//       if (payload?.sub) setEmployeeId(payload.sub);
//     } catch {
//       // ignore invalid token
//     }
//   }, []);

//   React.useEffect(() => setShifts(migrateFromV1IfNeeded()), []);
//   React.useEffect(() => saveV2(shifts), [shifts]);

//   /* ===== Employee helpers (static list) ===== */
//   const getEmployeeLocal = React.useCallback(
//     (id: string) => EMPLOYEES.find((e) => e.id === id) ?? null,
//     []
//   );
//   const localEmployee = React.useMemo(
//     () => getEmployeeLocal(employeeId),
//     [employeeId, getEmployeeLocal]
//   );
//   const employeeExists = React.useMemo(
//     () => !!user || !!localEmployee,
//     [user, localEmployee]
//   );

//   // ✅ API cache → local → id resolver (UI ဖော်ပြရန်)
//   const getEmployeeForDisplay = React.useCallback(
//     (id: string): { id: string; name: string; dept?: string } => {
//       const key = String(id);
//       const u = usersCacheRef.current[key];
//       if (u) {
//         return {
//           id: key,
//           name: u.username || u.email || (u as any).name || key,
//           dept: (u as any).dept,
//         };
//       }
//       const l = getEmployeeLocal(key);
//       if (l) return l;
//       return { id: key, name: key };
//     },
//     [getEmployeeLocal]
//   );

//   // Auto-fetch user profile by employeeId with cache-first logic
//   React.useEffect(() => {
//     let cancelled = false;

//     setUser(null);
//     if (!employeeId) return;

//     const cached = usersCacheRef.current[String(employeeId)];
//     if (cached) {
//       setUser(cached);
//       return;
//     }

//     (async () => {
//       try {
//         setUserLoading(true);
//         const u = await get<User>(`/auth/users/${employeeId}`);
//         if (cancelled) return;
//         setUser(u);
//         usersCacheRef.current[String(u.id)] = u;
//       } catch {
//         if (!cancelled) setUser(null);
//       } finally {
//         if (!cancelled) setUserLoading(false);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [employeeId]);

//   /* ===== Derived ===== */
//   const active = React.useMemo(
//     () => shifts.find((s) => s.employeeId === employeeId && !s.clockOut),
//     [shifts, employeeId]
//   );

//   const todays = React.useMemo(
//     () =>
//       shifts.filter((s) => {
//         const isToday = s.date === toYmd(now ?? new Date());
//         const empOk = showAll ? true : s.employeeId === employeeId;
//         const deptOk =
//           deptFilter === "ALL"
//             ? true
//             : getEmployeeLocal(s.employeeId)?.dept === deptFilter;
//         return isToday && empOk && deptOk;
//       }),
//     [shifts, employeeId, now, showAll, deptFilter, getEmployeeLocal]
//   );

//   const ws = React.useMemo(() => weekStart(now ?? new Date()), [now]);
//   const we = React.useMemo(() => {
//     const t = new Date(ws);
//     t.setDate(ws.getDate() + 6);
//     return t;
//   }, [ws]);

//   const weekly = React.useMemo(
//     () =>
//       shifts.filter((s) => {
//         const d = new Date(s.date + "T00:00:00");
//         const inRange = d >= ws && d <= we;
//         const empOk = showAll ? true : s.employeeId === employeeId;
//         const deptOk =
//           deptFilter === "ALL"
//             ? true
//             : getEmployeeLocal(s.employeeId)?.dept === deptFilter;
//         return inRange && empOk && deptOk;
//       }),
//     [shifts, employeeId, ws, we, showAll, deptFilter, getEmployeeLocal]
//   );

//   const todayTotal = React.useMemo(
//     () => todays.reduce((a, s) => a + workMs(s, +(now ?? Date.now())), 0),
//     [todays, now]
//   );
//   const weekTotal = React.useMemo(
//     () => weekly.reduce((a, s) => a + workMs(s, +(now ?? Date.now())), 0),
//     [weekly, now]
//   );
//   const weekBreak = React.useMemo(
//     () => weekly.reduce((a, s) => a + breakMs(s, +(now ?? Date.now())), 0),
//     [weekly, now]
//   );
//   const effectiveRate = React.useMemo(
//     () => parseFloat(hourlyRate) || (localEmployee?.rate ?? 0),
//     [hourlyRate, localEmployee]
//   );
//   const weekGross = React.useMemo(
//     () => effectiveRate * (weekTotal / 3600000),
//     [effectiveRate, weekTotal]
//   );

//   // Simple overtime calc
//   const weekDailyOverMs = React.useMemo(
//     () =>
//       weekly.reduce((sum, s) => {
//         const worked = workMs(s, +(now ?? Date.now()));
//         return sum + Math.max(0, worked - 8 * 3600000);
//       }, 0),
//     [weekly, now]
//   );
//   const weekOverMs = React.useMemo(
//     () => Math.max(0, weekTotal - 40 * 3600000),
//     [weekTotal]
//   );
//   const weekOverGross = React.useMemo(
//     () =>
//       effectiveRate * 1.25 * (Math.max(weekDailyOverMs, weekOverMs) / 3600000),
//     [effectiveRate, weekDailyOverMs, weekOverMs]
//   );

//   /* ===== Actions ===== */
//   const pushUndo = (prev: Shift[]) => {
//     undoStack.current.push(prev);
//     if (undoStack.current.length > 20) undoStack.current.shift();
//   };
//   const undo = () => {
//     const prev = undoStack.current.pop();
//     if (!prev) return toast("Nothing to undo");
//     setShifts(prev);
//     toast.success("Undid last change");
//   };

//   const requireValidEmployee = () => {
//     if (showAll) {
//       toast.error("Select an Employee ID (Show All is on)");
//       return false;
//     }
//     if (!employeeId) {
//       toast.error("Enter Employee ID");
//       return false;
//     }
//     if (!employeeExists) {
//       toast.error("Unknown Employee ID");
//       return false;
//     }
//     return true;
//   };

//   // --- Clock In (API)
//   const doClockIn = async () => {
//     if (!requireValidEmployee()) return;
//     if (active) return toast.error("Already clocked in");
//     try {
//       const sh = await post<Shift>("/timecard/clock-in", {
//         employeeId,
//         note: note || undefined,
//       });
//       setShifts((prev) => [sh, ...prev]);
//       setNote("");
//       toast.success("Clocked in");
//     } catch (e: any) {
//       const msg = e?.message || "Clock-in failed";
//       toast.error(msg);
//     }
//   };

//   const doClockOut = () => {
//     if (!requireValidEmployee()) return;
//     if (!active) return toast.error("Not clocked in");
//     const end = Date.now();
//     pushUndo(shifts);
//     setShifts((prev) =>
//       prev.map((s) =>
//         s.id === active.id
//           ? {
//               ...s,
//               clockOut: end,
//               breaks: s.breaks.map((b) => (b.end ? b : { ...b, end })),
//             }
//           : s
//       )
//     );
//     toast.success("Clocked out");
//   };

//   const startBreak = () => {
//     if (!requireValidEmployee()) return;
//     if (!active) return toast.error("Not clocked in");
//     if (onBreak(active)) return toast.error("Break already started");
//     pushUndo(shifts);
//     setShifts((prev) =>
//       prev.map((s) =>
//         s.id === active.id
//           ? { ...s, breaks: [...s.breaks, { start: Date.now() }] }
//           : s
//       )
//     );
//     toast("Break started", { icon: "☕" });
//   };

//   const endBreak = () => {
//     if (!requireValidEmployee()) return;
//     if (!active) return toast.error("Not clocked in");
//     if (!onBreak(active)) return toast.error("No active break");
//     pushUndo(shifts);
//     setShifts((prev) =>
//       prev.map((s) => {
//         if (s.id !== active.id) return s;
//         const last = [...s.breaks];
//         const i = last.findIndex((b) => !b.end);
//         if (i >= 0) last[i] = { ...last[i], end: Date.now() };
//         return { ...s, breaks: last };
//       })
//     );
//     toast.success("Break ended");
//   };

//   const saveNoteToActive = () => {
//     if (!note.trim()) return;
//     if (!requireValidEmployee()) return;
//     if (active) {
//       pushUndo(shifts);
//       setShifts((prev) =>
//         prev.map((s) => (s.id === active.id ? { ...s, note } : s))
//       );
//       toast.success("Note saved");
//     } else {
//       toast("No active shift");
//     }
//     setNote("");
//   };

//   const clearToday = () => {
//     if (showAll) return toast.error("Select an Employee ID (Show All is on)");
//     if (!employeeId) return;
//     if (!employeeExists) return toast.error("Unknown Employee ID");
//     pushUndo(shifts);
//     setShifts((prev) =>
//       prev.filter(
//         (s) =>
//           !(s.employeeId === employeeId && s.date === toYmd(now ?? new Date()))
//       )
//     );
//     toast.success("Cleared today");
//   };

//   const exportCSV = () => {
//     const source = showAll
//       ? shifts
//       : shifts.filter((s) => s.employeeId === employeeId);
//     if (!showAll && !employeeExists) return toast.error("Unknown Employee ID");
//     const rows = source
//       .slice()
//       .sort((a, b) => a.clockIn - b.clockIn)
//       .map((s) => {
//         const br = Math.round(breakMs(s) / 60000);
//         const empDisp = getEmployeeForDisplay(s.employeeId);
//         const cols = [
//           s.date,
//           ...(showAll ? [empDisp.name] : []), // ✅ name in CSV when showAll
//           prettyClock(s.clockIn),
//           s.clockOut ? prettyClock(s.clockOut) : "",
//           String(br),
//           prettyHM(workMs(s)),
//           (s.note ?? "").replaceAll("\n", " "),
//         ];
//         return cols.map(csvEscape);
//       });
//     const header = showAll
//       ? [
//           "Date",
//           "Employee",
//           "Clock In",
//           "Clock Out",
//           "Break (min)",
//           "Worked (h:mm:ss)",
//           "Note",
//         ]
//       : [
//           "Date",
//           "Clock In",
//           "Clock Out",
//           "Break (min)",
//           "Worked (h:mm:ss)",
//           "Note",
//         ];
//     const csv = [header.map(csvEscape), ...rows]
//       .map((r) => r.join(","))
//       .join("\n");
//     downloadText(
//       csv,
//       `timecard_${showAll ? "all" : employeeId || "all"}_${toYmd(
//         now ?? new Date()
//       )}.csv`,
//       "text/csv;charset=utf-8;"
//     );
//   };

//   const exportJSON = () => {
//     const data = JSON.stringify({ version: 2, shifts }, null, 2);
//     downloadText(
//       data,
//       `timecard_export_${toYmd(now ?? new Date())}.json`,
//       "application/json"
//     );
//   };

//   const importJSON = (file?: File | null) => {
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = () => {
//       try {
//         const parsed = JSON.parse(String(reader.result));
//         if (!parsed || !Array.isArray(parsed.shifts ?? parsed))
//           throw new Error("Invalid file");
//         pushUndo(shifts);
//         setShifts(parsed.shifts ?? parsed);
//         toast.success("Imported shifts");
//       } catch (e) {
//         const msg = e instanceof Error ? e.message : "Unknown error";
//         toast.error(`Import failed: ${msg}`);
//       }
//     };
//     reader.readAsText(file);
//   };

//   /* ===== Hero strings ===== */
//   const statusText = showAll
//     ? "All Employees View"
//     : !employeeId
//     ? "No Employee"
//     : active
//     ? onBreak(active)
//       ? "On Break"
//       : "On The Clock"
//     : "Off The Clock";

//   const heroTime = React.useMemo(() => {
//     if (!now) return "--:--:--";
//     return new Intl.DateTimeFormat(undefined, {
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     }).format(now);
//   }, [now]);

//   const heroDate = React.useMemo(() => {
//     if (!now) return "";
//     return new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(
//       now
//     );
//   }, [now]);

//   const tz = React.useMemo(() => {
//     if (!mounted) return "—";
//     return Intl.DateTimeFormat().resolvedOptions().timeZone;
//   }, [mounted]);

//   /* ===== Utilization ratios ===== */
//   const weekWorkedRatio =
//     weekTotal === 0 ? 0 : weekTotal / (weekTotal + weekBreak);
//   const weekBreakRatio =
//     weekTotal === 0 ? 0 : weekBreak / (weekTotal + weekBreak);

//   // keyboard shortcuts (single-employee mode)
//   React.useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
//       if (showAll) return;
//       if (!employeeExists) return;
//       if (e.key === "i") doClockIn();
//       if (e.key === "o") doClockOut();
//       if (e.key === "b") (active && onBreak(active) ? endBreak() : startBreak());
//       if (e.key === "u") undo();
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [showAll, employeeExists, active]);

//   return (
//     <section className="relative min-h-screen overflow-hidden bg-white text-slate-900 dark:bg-black dark:text-neutral-200">
//       <Toaster position="top-right" />
//       <a
//         href="#main"
//         className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 z-50 bg-black text-white rounded px-3 py-2"
//       >
//         Skip to content
//       </a>

//       <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_10%_10%,rgba(14,165,233,0.08),transparent_40%),radial-gradient(ellipse_at_90%_90%,rgba(59,130,246,0.06),transparent_38%)]" />

//       <div id="main" className="relative z-10 mx-auto w-[92%] max-w-7xl py-8">
//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
//           {/* LEFT */}
//           <div className="lg:col-span-8 space-y-6">
//             <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-900/70 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_24px_64px_-24px_rgba(59,130,246,0.18)] dark:backdrop-blur-md">
//               <CardContent className="p-6 sm:p-8">
//                 <div className="flex flex-wrap items-center gap-3">
//                   <Badge
//                     className={cn(
//                       "border",
//                       showAll
//                         ? "border-sky-300/60 bg-sky-100 text-sky-800 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-200"
//                         : employeeId && !employeeExists
//                         ? "border-rose-300/60 bg-rose-100 text-rose-800 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200"
//                         : "border-sky-300/40 bg-sky-100 text-sky-700 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-300"
//                     )}
//                   >
//                     {statusText}
//                   </Badge>

//                   {!showAll && (user || localEmployee) && (
//                     <Badge
//                       variant="secondary"
//                       className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200"
//                     >
//                       👤 {user?.username ?? localEmployee?.name}
//                       {localEmployee?.dept ? ` (${localEmployee.dept})` : ""}
//                     </Badge>
//                   )}

//                   <Badge
//                     variant="secondary"
//                     className="bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-white/70"
//                     suppressHydrationWarning
//                   >
//                     {tz}
//                   </Badge>
//                   <div className="ml-auto flex items-center gap-2 text-xs text-slate-500 dark:text-white/60">
//                     <ThemeToggle />
//                     <Button
//                       size="sm"
//                       variant="ghost"
//                       className="text-slate-600 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/5"
//                     >
//                       <Settings className="mr-2 h-4 w-4" /> Preferences
//                     </Button>
//                   </div>
//                 </div>

//                 {/* Time + Employee ID / Show All */}
//                 <div className="mt-6 grid gap-6 md:grid-cols-2">
//                   <div className="flex flex-col gap-1">
//                     <motion.h1
//                       initial={{ opacity: 0, y: 12 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ duration: 0.45 }}
//                       className="text-5xl font-extrabold leading-none tracking-tight text-slate-900 sm:text-6xl md:text-7xl dark:text-white"
//                       suppressHydrationWarning
//                     >
//                       {heroTime}
//                     </motion.h1>
//                     <p
//                       className="text-lg font-medium text-sky-800/80 md:text-2xl dark:text-sky-300/90"
//                       suppressHydrationWarning
//                     >
//                       {heroDate}
//                     </p>
//                   </div>

//                   <div className="grid content-start gap-3">
//                     <label
//                       htmlFor="empid"
//                       className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/50"
//                     >
//                       Employee / Filters
//                     </label>
//                     <div className="flex flex-wrap items-center gap-2">
//                       <div className="relative flex-1 min-w-[220px]">
//                         <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
//                         <Input
//                           id="empid"
//                           value={employeeId}
//                           onChange={(e) => setEmployeeId(e.target.value.trim())}
//                           placeholder="Enter Employee ID (UUID or number)"
//                           className="pl-9 font-mono"
//                           disabled={showAll}
//                         />
//                       </div>

//                       {employeeId && (user || localEmployee) && (
//                         <Badge
//                           variant="secondary"
//                           className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200"
//                         >
//                           👤 {user?.username ?? localEmployee?.name}
//                           {localEmployee?.dept ? ` (${localEmployee.dept})` : ""}
//                         </Badge>
//                       )}

//                       {employeeId && !user && !localEmployee && userLoading && (
//                         <Badge
//                           variant="secondary"
//                           className="bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/80"
//                         >
//                           <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
//                           Checking…
//                         </Badge>
//                       )}

//                       {employeeId && !user && !localEmployee && !userLoading && (
//                         <Badge
//                           variant="secondary"
//                           className="bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200"
//                         >
//                           ❌ Not found
//                         </Badge>
//                       )}

//                       <select
//                         value={deptFilter}
//                         onChange={(e) => setDeptFilter(e.target.value)}
//                         className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-white/15 dark:bg-white/5"
//                       >
//                         <option value="ALL">All depts</option>
//                         {[
//                           ...new Set(
//                             EMPLOYEES.map((e) => e.dept).filter(Boolean)
//                           ),
//                         ].map((d) => (
//                           <option key={String(d)} value={String(d)}>
//                             {String(d)}
//                           </option>
//                         ))}
//                       </select>

//                       <Button
//                         variant="outline"
//                         type="button"
//                         onClick={() => {
//                           setEmployeeId("");
//                           setDeptFilter("ALL");
//                         }}
//                         disabled={showAll}
//                       >
//                         Clear
//                       </Button>

//                       <Button
//                         type="button"
//                         variant="outline"
//                         onClick={() => setBrowseOpen(true)}
//                         className="whitespace-nowrap"
//                       >
//                         <Search className="mr-2 h-4 w-4" />
//                         Browse Users
//                       </Button>

//                       <Button
//                         type="button"
//                         variant={showAll ? "default" : "outline"}
//                         onClick={() => setShowAll((v) => !v)}
//                         className={cn(
//                           "ml-auto",
//                           showAll
//                             ? "bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-600"
//                             : ""
//                         )}
//                         aria-pressed={showAll}
//                       >
//                         {showAll
//                           ? "Showing: All Employees"
//                           : "Show All Employees"}
//                       </Button>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
//                   <ActionButton
//                     onClick={doClockIn}
//                     disabled={
//                       showAll || !employeeId || !employeeExists || !!active
//                     }
//                     icon={Play}
//                     label="Clock In"
//                     intent="primary"
//                   />
//                   <ActionButton
//                     onClick={startBreak}
//                     disabled={
//                       showAll ||
//                       !employeeId ||
//                       !employeeExists ||
//                       !active ||
//                       onBreak(active)
//                     }
//                     icon={Coffee}
//                     label="Start Break"
//                   />
//                   <ActionButton
//                     onClick={endBreak}
//                     disabled={
//                       showAll ||
//                       !employeeId ||
//                       !employeeExists ||
//                       !active ||
//                       !onBreak(active)
//                     }
//                     icon={Pause}
//                     label="End Break"
//                   />
//                   <ActionButton
//                     onClick={doClockOut}
//                     disabled={
//                       showAll || !employeeId || !employeeExists || !active
//                     }
//                     icon={Square}
//                     label="Clock Out"
//                     intent="danger"
//                   />
//                   <ActionButton
//                     onClick={undo}
//                     disabled={undoStack.current.length === 0}
//                     icon={Undo2}
//                     label="Undo"
//                   />
//                 </div>

//                 {/* Session pill */}
//                 {!showAll && (
//                   <div className="mt-6">
//                     <SessionPill active={active} now={+(now ?? Date.now())} />
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {/* ENTRIES + INSIGHTS */}
//             <Card className="border-slate-200 dark:border-white/10">
//               <CardHeader className="pb-2">
//                 <div className="flex items-center justify-between gap-3">
//                   <CardTitle className="text-slate-800 dark:text-white/90">
//                     {showAll ? "All Employees — Entries" : "Entries"}
//                   </CardTitle>
//                   <div className="flex items-center gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={exportCSV}
//                       className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
//                     >
//                       <Download className="mr-2 h-4 w-4" /> Export CSV
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={exportJSON}
//                       className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
//                     >
//                       <FileJson className="mr-2 h-4 w-4" /> Export JSON
//                     </Button>
//                     <label className="inline-flex items-center">
//                       <input
//                         type="file"
//                         accept="application/json"
//                         className="hidden"
//                         onChange={(e) => importJSON(e.target.files?.[0])}
//                       />
//                       <Button
//                         asChild
//                         variant="outline"
//                         size="sm"
//                         className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
//                       >
//                         <span>
//                           <Upload className="mr-2 h-4 w-4" /> Import JSON
//                         </span>
//                       </Button>
//                     </label>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={clearToday}
//                       disabled={showAll || !employeeId || !employeeExists}
//                       className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/15 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
//                     >
//                       Clear today
//                     </Button>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <Tabs defaultValue="today" className="w-full">
//                   <div className="flex items-center justify-between gap-3">
//                     <TabsList className="bg-slate-100 dark:bg-white/5">
//                       <TabsTrigger
//                         value="today"
//                         className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-700 dark:data-[state=active]:bg-sky-500/20 dark:data-[state=active]:text-sky-200"
//                       >
//                         Today
//                       </TabsTrigger>
//                       <TabsTrigger
//                         value="week"
//                         className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-700 dark:data-[state=active]:bg-sky-500/20 dark:data-[state=active]:text-sky-200"
//                       >
//                         This week
//                       </TabsTrigger>
//                     </TabsList>

//                     <div className="hidden md:flex items-center gap-3 text-sm text-slate-600 dark:text-white/70">
//                       <InsightsChip
//                         icon={ChartPie}
//                         label="Worked"
//                         value={prettyHM(weekTotal)}
//                       />
//                       <InsightsChip
//                         icon={Coffee}
//                         label="Break"
//                         value={prettyHM(weekBreak)}
//                       />
//                       <InsightsChip
//                         icon={Check}
//                         label="Earnings"
//                         value={earningsFmt(weekGross + weekOverGross)}
//                       />
//                     </div>

//                     {!showAll && active && (
//                       <span className="hidden md:inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-100 px-3 py-1 text-xs text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
//                         <span className="relative flex h-2.5 w-2.5">
//                           <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
//                           <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
//                         </span>
//                         <span className="font-medium">
//                           {onBreak(active) ? "On Break: " : "Working now: "}
//                           {getEmployeeForDisplay(active.employeeId).name}
//                         </span>
//                       </span>
//                     )}
//                   </div>

//                   <Separator className="my-4 bg-slate-200 dark:bg-white/10" />

//                   {/* Today */}
//                   <TabsContent value="today" className="m-0">
//                     {showAll ? (
//                       todays.length === 0 ? (
//                         <EmptyState label="No entries (all employees) for today" />
//                       ) : (
//                         <EntriesTable
//                           shifts={todays}
//                           now={+(now ?? Date.now())}
//                           getEmployee={(id) => getEmployeeForDisplay(id)} // ✅
//                           onEdit={(s) => {
//                             setEditShift(s);
//                             setEditNote(s.note ?? "");
//                           }}
//                           onDelete={(s) => setPendingDelete(s)}
//                         />
//                       )
//                     ) : employeeId ? (
//                       todays.length === 0 ? (
//                         <EmptyState label="No entries for today yet" />
//                       ) : (
//                         <EntriesTable
//                           shifts={todays}
//                           now={+(now ?? Date.now())}
//                           getEmployee={(id) => getEmployeeForDisplay(id)} // ✅
//                           onEdit={(s) => {
//                             setEditShift(s);
//                             setEditNote(s.note ?? "");
//                           }}
//                           onDelete={(s) => setPendingDelete(s)}
//                         />
//                       )
//                     ) : (
//                       <EmptyState label="Enter Employee ID to view entries" />
//                     )}
//                     <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
//                       <p className="text-sm text-slate-600 dark:text-white/70">
//                         Today total:{" "}
//                         <span className="font-semibold text-slate-900 dark:text-white">
//                           {prettyHM(todayTotal)}
//                         </span>
//                       </p>
//                       <Badge className="border border-emerald-300/60 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
//                         OT est:{" "}
//                         {prettyHM(Math.max(0, todayTotal - 8 * 3600000))}
//                       </Badge>
//                     </div>
//                   </TabsContent>

//                   {/* Week */}
//                   <TabsContent value="week" className="m-0">
//                     {showAll ? (
//                       weekly.length === 0 ? (
//                         <EmptyState label="No entries (all employees) for this week" />
//                       ) : (
//                         <EntriesTable
//                           shifts={weekly}
//                           now={+(now ?? Date.now())}
//                           getEmployee={(id) => getEmployeeForDisplay(id)} // ✅
//                           onEdit={(s) => {
//                             setEditShift(s);
//                             setEditNote(s.note ?? "");
//                           }}
//                           onDelete={(s) => setPendingDelete(s)}
//                         />
//                       )
//                     ) : employeeId ? (
//                       weekly.length === 0 ? (
//                         <EmptyState label="No entries for this week" />
//                       ) : (
//                         <EntriesTable
//                           shifts={weekly}
//                           now={+(now ?? Date.now())}
//                           getEmployee={(id) => getEmployeeForDisplay(id)} // ✅
//                           onEdit={(s) => {
//                             setEditShift(s);
//                             setEditNote(s.note ?? "");
//                           }}
//                           onDelete={(s) => setPendingDelete(s)}
//                         />
//                       )
//                     ) : (
//                       <EmptyState label="Enter Employee ID to view entries" />
//                     )}

//                     {/* Week footer */}
//                     <div className="mt-4 grid gap-4 md:grid-cols-2">
//                       <div className="flex items-center gap-2">
//                         <Input
//                           type="number"
//                           inputMode="decimal"
//                           placeholder="Hourly rate (optional)"
//                           className="h-9 w-56 bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 dark:bg-black/40 dark:text-white dark:placeholder:text-white/40"
//                           value={hourlyRate}
//                           onChange={(e) => setHourlyRate(e.target.value)}
//                         />
//                         <Badge className="border border-emerald-300/60 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
//                           Est. earnings:{" "}
//                           {earningsFmt(weekGross + weekOverGross)}
//                         </Badge>
//                       </div>
//                       <UtilizationRing
//                         worked={weekWorkedRatio}
//                         breakPct={weekBreakRatio}
//                       />
//                     </div>
//                     <p className="mt-2 text-xs text-slate-500 dark:text-white/60">
//                       Overtime shown at 1.25× where applicable.
//                     </p>
//                   </TabsContent>
//                 </Tabs>
//               </CardContent>
//             </Card>
//           </div>

//           {/* RIGHT */}
//           <div className="lg:col-span-4 space-y-6">
//             <Card className="relative overflow-hidden border-slate-200 bg-gradient-to-b from-sky-50/60 to-transparent dark:border-white/10 dark:from-sky-500/10 dark:to-transparent">
//               <CardHeader className="pb-2">
//                 <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white/90">
//                   <UserRound className="h-5 w-5 text-sky-600 dark:text-sky-300" />{" "}
//                   Kiosk keypad
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <Keypad
//                   onPress={(n) =>
//                     setEmployeeId((v) => (showAll ? v : (v + n).slice(0, 10)))
//                   }
//                   onBackspace={() =>
//                     setEmployeeId((v) => (showAll ? v : v.slice(0, -1)))
//                   }
//                   onClear={() => (showAll ? null : setEmployeeId(""))}
//                 />
//                 <div className="grid grid-cols-2 gap-3">
//                   <Button
//                     onClick={doClockIn}
//                     disabled={
//                       showAll || !employeeId || !employeeExists || !!active
//                     }
//                     variant="secondary"
//                     className="justify-start bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15"
//                   >
//                     <Play className="mr-2 h-4 w-4" /> Clock In
//                   </Button>
//                   <Button
//                     onClick={doClockOut}
//                     disabled={
//                       showAll || !employeeId || !employeeExists || !active
//                     }
//                     variant="secondary"
//                     className="justify-start bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15"
//                   >
//                     <Square className="mr-2 h-4 w-4" /> Clock Out
//                   </Button>
//                   <Button
//                     onClick={startBreak}
//                     disabled={
//                       showAll ||
//                       !employeeId ||
//                       !employeeExists ||
//                       !(active && !onBreak(active))
//                     }
//                     variant="secondary"
//                     className="justify-start bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15"
//                   >
//                     <Coffee className="mr-2 h-4 w-4" /> Start Break
//                   </Button>
//                   <Button
//                     onClick={endBreak}
//                     disabled={
//                       showAll ||
//                       !employeeId ||
//                       !employeeExists ||
//                       !(active && onBreak(active))
//                     }
//                     variant="secondary"
//                     className="justify-start bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15"
//                   >
//                     <Pause className="mr-2 h-4 w-4" /> End Break
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="relative overflow-hidden border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
//               <CardHeader className="pb-2">
//                 <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white/90">
//                   <TimerReset className="h-5 w-5 text-sky-600 dark:text-sky-300" />{" "}
//                   Notes
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <Textarea
//                   rows={6}
//                   placeholder="Add a note…"
//                   className="min-h-[140px] resize-none bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 dark:bg-black/40 dark:text-white dark:placeholder:text-white/40"
//                   value={note}
//                   onChange={(e) => setNote(e.target.value)}
//                 />
//                 <div className="mt-3 flex justify-between">
//                   <span className="text-xs text-slate-500 dark:text-white/50">
//                     Tip: Press{" "}
//                     <kbd className="rounded bg-slate-100 px-1 dark:bg-white/10">
//                       i
//                     </kbd>
//                     ,{" "}
//                     <kbd className="rounded bg-slate-100 px-1 dark:bg-white/10">
//                       o
//                     </kbd>
//                     ,{" "}
//                     <kbd className="rounded bg-slate-100 px-1 dark:bg-white/10">
//                       b
//                     </kbd>{" "}
//                     for quick actions.
//                   </span>
//                   <Button
//                     className="bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500"
//                     onClick={saveNoteToActive}
//                   >
//                     Save
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="relative overflow-hidden border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
//               <CardHeader className="pb-2">
//                 <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white/90">
//                   <CalendarDays className="h-5 w-5 text-sky-600 dark:text-sky-300" />{" "}
//                   Today summary
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <ul className="divide-y divide-slate-200 dark:divide-white/10">
//                   <li className="flex items-center justify-between py-3 text-sm">
//                     <span className="text-slate-600 dark:text-white/70">
//                       {showAll ? "Employees (today)" : "Shifts"}
//                     </span>
//                     <span className="text-slate-900 dark:text-white">
//                       {todays.length}
//                     </span>
//                   </li>
//                   <li className="flex items-center justify-between py-3 text-sm">
//                     <span className="text-slate-600 dark:text-white/70">
//                       Worked
//                     </span>
//                     <span className="text-slate-900 dark:text-white">
//                       {prettyHM(todayTotal)}
//                     </span>
//                   </li>
//                   <li className="flex items-center justify-between py-3 text-sm">
//                     <span className="text-slate-600 dark:text-white/70">
//                       Breaks
//                     </span>
//                     <span className="text-slate-900 dark:text-white">
//                       {prettyHM(
//                         todays.reduce(
//                           (a, s) => a + breakMs(s, +(now ?? Date.now())),
//                           0
//                         )
//                       )}
//                     </span>
//                   </li>
//                 </ul>
//               </CardContent>
//             </Card>
//           </div>

//           {/* RIGHT END */}
//         </div>
//       </div>

//       {/* Edit modal */}
//       <Dialog
//         open={!!editShift}
//         onOpenChange={(open) => {
//           if (!open) setEditShift(null);
//         }}
//       >
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Edit entry</DialogTitle>
//           </DialogHeader>
//           {editShift && (
//             <div className="space-y-3">
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="text-xs text-slate-500 dark:text-white/60">
//                     Clock In
//                   </label>
//                   <Input
//                     type="datetime-local"
//                     value={toLocalInput(editShift.clockIn)}
//                     onChange={(e) =>
//                       setEditShift({
//                         ...editShift,
//                         clockIn: fromLocalInput(e.target.value),
//                       })
//                     }
//                   />
//                 </div>
//                 <div>
//                   <label className="text-xs text-slate-500 dark:text-white/60">
//                     Clock Out
//                   </label>
//                   <Input
//                     type="datetime-local"
//                     value={
//                       editShift.clockOut ? toLocalInput(editShift.clockOut) : ""
//                     }
//                     onChange={(e) =>
//                       setEditShift({
//                         ...editShift,
//                         clockOut: e.target.value
//                           ? fromLocalInput(e.target.value)
//                           : undefined,
//                       })
//                     }
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="text-xs text-slate-500 dark:text-white/60">
//                   Note
//                 </label>
//                 <Textarea
//                   value={editNote}
//                   onChange={(e) => setEditNote(e.target.value)}
//                   rows={4}
//                 />
//               </div>
//             </div>
//           )}
//           <DialogFooter>
//             <Button variant="ghost" onClick={() => setEditShift(null)}>
//               Cancel
//             </Button>
//             <Button
//               onClick={() => {
//                 if (!editShift) return;
//                 pushUndo(shifts);
//                 setShifts((prev) =>
//                   prev.map((s) =>
//                     s.id === editShift.id ? { ...editShift, note: editNote } : s
//                   )
//                 );
//                 setEditShift(null);
//                 toast.success("Entry updated");
//               }}
//             >
//               Save
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Delete confirm */}
//       <AlertDialog
//         open={!!pendingDelete}
//         onOpenChange={(open) => {
//           if (!open) setPendingDelete(null);
//         }}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={() => {
//                 if (!pendingDelete) return;
//                 pushUndo(shifts);
//                 setShifts((prev) =>
//                   prev.filter((s) => s.id !== pendingDelete.id)
//                 );
//                 setPendingDelete(null);
//                 toast.success("Entry deleted");
//               }}
//             >
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       {/* 🔎 All Users Dialog mount */}
//       <AllUsersDialog
//         open={browseOpen}
//         onOpenChange={setBrowseOpen}
//         users={allUsers}
//         loading={usersLoading}
//         error={usersErr}
//         onReload={fetchAllUsers}
//         onPick={(u) => {
//           const idStr = String(u.id);
//           setEmployeeId(idStr);
//           setUser(u); // show immediately
//           usersCacheRef.current[idStr] = u; // cache to prevent flicker
//           setBrowseOpen(false);
//           toast.success(`Selected ${u.username || idStr}`);
//         }}
//         query={userQuery}
//         setQuery={setUserQuery}
//         roleFilter={roleFilter}
//         setRoleFilter={setRoleFilter}
//       />

//       <footer className="pointer-events-none absolute inset-x-0 bottom-6 z-10 text-center text-xs text-slate-500 dark:text-white/30">
//         Timecard Pro • Shadcn × Framer
//       </footer>

//       <style jsx global>{`
//         .tc-ring {
//           --size: 88px;
//           width: var(--size);
//           height: var(--size);
//           display: grid;
//           place-items: center;
//           position: relative;
//         }
//         .tc-ring svg {
//           position: absolute;
//           inset: 0;
//         }
//         .sticky-th thead th {
//           position: sticky;
//           top: 0;
//           z-index: 1;
//         }
//         .zebra tbody tr:nth-child(odd) {
//           background: rgba(2, 6, 23, 0.03);
//         }
//         .dark .zebra tbody tr:nth-child(odd) {
//           background: rgba(255, 255, 255, 0.04);
//         }
//       `}</style>
//     </section>
//   );
// }

// /* ===== UI bits ===== */
// function ActionButton({
//   onClick,
//   disabled,
//   icon: Icon,
//   label,
//   intent = "default",
// }: {
//   onClick: () => void;
//   disabled?: boolean;
//   icon: React.ComponentType<any>;
//   label: string;
//   intent?: "default" | "primary" | "danger";
// }) {
//   const base =
//     intent === "primary"
//       ? "bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 dark:bg-sky-600 dark:hover:bg-sky-500"
//       : intent === "danger"
//       ? "bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 dark:bg-red-600/80 dark:hover:bg-red-600"
//       : "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/15";
//   return (
//     <Button
//       onClick={onClick}
//       disabled={disabled}
//       className={cn("justify-center", base)}
//     >
//       <Icon className="mr-2 h-4 w-4" /> {label}
//     </Button>
//   );
// }

// function SessionPill({ active, now }: { active?: Shift; now: number }) {
//   const net = active ? workMs(active, now) : 0;
//   const br = active ? breakMs(active, now) : 0;
//   const total = net + br;
//   const netPct = total === 0 ? 0 : (net / total) * 100;
//   const brPct = total === 0 ? 0 : (br / total) * 100;
//   return (
//     <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-black/30">
//       <div className="flex items-center justify-between gap-3">
//         <div className="flex items-center gap-2">
//           <Badge variant="outline" className="text-xs">
//             {active ? (onBreak(active) ? "Break" : "Working") : "—"}
//           </Badge>
//           {active && (
//             <span className="text-xs text-slate-500 dark:text-white/50">
//               Started {prettyClock(active.clockIn)}
//             </span>
//           )}
//         </div>
//         <div className="text-right">
//           <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/50">
//             Net
//           </p>
//           <p className="text-lg font-semibold text-slate-900 dark:text-white">
//             {prettyHM(net)}
//           </p>
//         </div>
//       </div>
//       <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
//         <div className="h-full bg-sky-500/80" style={{ width: `${netPct}%` }} />
//         <div
//           className="-mt-3 h-3 bg-amber-500/70"
//           style={{ width: `${brPct}%` }}
//         />
//       </div>
//       <div className="mt-2 grid grid-cols-3 text-center text-xs text-slate-600 dark:text-white/70">
//         <div>Elapsed: {prettyHM(total)}</div>
//         <div>Break: {prettyHM(br)}</div>
//         <div>Net: {prettyHM(net)}</div>
//       </div>
//     </div>
//   );
// }

// function EmptyState({ label }: { label: string }) {
//   return (
//     <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-600 dark:border-white/10 dark:bg-black/20 dark:text-white/60">
//       {label}
//     </div>
//   );
// }

// function EntriesTable({
//   shifts,
//   now,
//   getEmployee,
//   onEdit,
//   onDelete,
// }: {
//   shifts: Shift[];
//   now: number;
//   getEmployee: (
//     id: string
//   ) => { id: string; name: string; dept?: string } | null | { id: string; name: string; dept?: string };
//   onEdit: (s: Shift) => void;
//   onDelete: (s: Shift) => void;
// }) {
//   if (shifts.length === 0) return <EmptyState label="No entries" />;

//   const totalBreak = shifts.reduce((a, s) => a + breakMs(s, now), 0);
//   const totalWork = shifts.reduce((a, s) => a + workMs(s, now), 0);

//   return (
//     <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
//       <table className="sticky-th zebra min-w-full table-fixed divide-y divide-slate-200 dark:divide-white/10">
//         <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-white/5 dark:text-white/60">
//           <tr>
//             <th className="px-4 py-2 text-left">Status</th>
//             <th className="px-4 py-2 text-left">Date</th>
//             <th className="px-4 py-2 text-left">Employee</th>
//             <th className="px-4 py-2 text-left">Clock In</th>
//             <th className="px-4 py-2 text-left">Clock Out</th>
//             <th className="px-4 py-2 text-left">Break</th>
//             <th className="px-4 py-2 text-left">Worked</th>
//             <th className="px-4 py-2 text-left">Note</th>
//             <th className="px-4 py-2 text-left">Actions</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-slate-200 text-sm dark:divide-white/10">
//           {shifts
//             .slice()
//             .sort((a, b) => b.clockIn - a.clockIn)
//             .map((s) => {
//               const br = breakMs(s, now);
//               const wk = workMs(s, now);
//               const empInfo = getEmployee(s.employeeId) as
//                 | { id: string; name: string; dept?: string }
//                 | null;
//               const isLive = !s.clockOut;
//               const isOnBreak = isLive && onBreak(s);
//               return (
//                 <tr
//                   key={s.id}
//                   className={cn(
//                     "hover:bg-slate-50 dark:hover:bg-white/5",
//                     isLive && "bg-sky-50/60 dark:bg-sky-500/10"
//                   )}
//                 >
//                   <td className="px-4 py-3">
//                     {isLive ? (
//                       <span className="inline-flex items-center gap-2">
//                         <span className="relative flex h-2.5 w-2.5">
//                           <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-500 opacity-60" />
//                           <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" />
//                         </span>
//                         <Badge
//                           className={cn(
//                             "border px-2 py-0.5",
//                             isOnBreak
//                               ? "border-amber-300/60 bg-amber-100 text-amber-800 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200"
//                               : "border-emerald-300/60 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200"
//                           )}
//                         >
//                           {isOnBreak ? "On Break" : "Working Now"}
//                         </Badge>
//                       </span>
//                     ) : (
//                       <Badge className="border border-slate-300/60 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white/80 px-2 py-0.5">
//                         Finished
//                       </Badge>
//                     )}
//                   </td>
//                   <td className="px-4 py-3 text-slate-700 dark:text-white/80">
//                     {s.date}
//                   </td>
//                   <td className="px-4 py-3">
//                     <div
//                       className={cn(
//                         "font-medium",
//                         empInfo
//                           ? "text-slate-900 dark:text-white"
//                           : "text-rose-700 dark:text-rose-300"
//                       )}
//                     >
//                       {empInfo ? empInfo.name : `Unknown (${s.employeeId})`}
//                     </div>
//                     <div className="text-xs text-slate-500 dark:text-white/60">
//                       {empInfo?.dept ?? (empInfo ? "" : "Not in directory")}
//                     </div>
//                   </td>
//                   <td className="px-4 py-3 text-slate-800 dark:text-white/90">
//                     {prettyClock(s.clockIn)}
//                   </td>
//                   <td className="px-4 py-3 text-slate-800 dark:text-white/90">
//                     {s.clockOut ? prettyClock(s.clockOut) : "—"}
//                   </td>
//                   <td className="px-4 py-3 text-slate-700 dark:text-white/80">
//                     {prettyHM(br)}
//                   </td>
//                   <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
//                     {prettyHM(wk)}
//                   </td>
//                   <td className="px-4 py-3 text-slate-700 whitespace-pre-wrap dark:text-white/70">
//                     {s.note ?? ""}
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="flex items-center gap-2">
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         className="h-8 w-8"
//                         onClick={() => onEdit(s)}
//                       >
//                         <Pencil className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         className="h-8 w-8"
//                         onClick={() => onDelete(s)}
//                       >
//                         <Trash className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </td>
//                 </tr>
//               );
//             })}
//         </tbody>
//         <tfoot>
//           <tr className="bg-slate-50/60 dark:bg-white/5 text-sm">
//             <td className="px-4 py-2" colSpan={5}>
//               Totals
//             </td>
//             <td className="px-4 py-2">{prettyHM(totalBreak)}</td>
//             <td className="px-4 py-2 font-semibold">{prettyHM(totalWork)}</td>
//             <td className="px-4 py-2" colSpan={2}></td>
//           </tr>
//         </tfoot>
//       </table>
//     </div>
//   );
// }

// function Keypad({
//   onPress,
//   onBackspace,
//   onClear,
// }: {
//   onPress: (n: string) => void;
//   onBackspace: () => void;
//   onClear: () => void;
// }) {
//   const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
//   return (
//     <div className="grid grid-cols-3 gap-3">
//       {keys.slice(0, 9).map((k) => (
//         <Button
//           key={k}
//           type="button"
//           variant="outline"
//           onClick={() => onPress(k)}
//           className="h-14 text-lg"
//         >
//           {k}
//         </Button>
//       ))}
//       <Button
//         type="button"
//         variant="secondary"
//         onClick={onClear}
//         className="h-14 text-lg"
//       >
//         Clear
//       </Button>
//       <Button
//         type="button"
//         variant="outline"
//         onClick={() => onPress("0")}
//         className="h-14 text-lg"
//       >
//         0
//       </Button>
//       <Button
//         type="button"
//         variant="secondary"
//         onClick={onBackspace}
//         className="h-14 text-lg"
//       >
//         <X className="h-4 w-4 mr-2" /> Back
//       </Button>
//     </div>
//   );
// }

// function InsightsChip({
//   icon: Icon,
//   label,
//   value,
// }: {
//   icon: React.ComponentType<any>;
//   label: string;
//   value: string;
// }) {
//   return (
//     <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
//       <Icon className="h-3.5 w-3.5" /> {label}:{" "}
//       <strong className="font-semibold">{value}</strong>
//     </span>
//   );
// }

// function UtilizationRing({
//   worked,
//   breakPct,
// }: {
//   worked: number;
//   breakPct: number;
// }) {
//   const size = 88,
//     stroke = 8,
//     r = (size - stroke) / 2,
//     c = 2 * Math.PI * r;
//   const workedLen = c * worked,
//     breakLen = c * breakPct;
//   return (
//     <div className="flex items-center gap-4">
//       <div className="tc-ring" aria-label="Weekly utilization ring">
//         <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
//           <circle
//             cx={size / 2}
//             cy={size / 2}
//             r={r}
//             strokeWidth={stroke}
//             className="fill-none stroke-slate-200/60 dark:stroke-white/10"
//           />
//           <circle
//             cx={size / 2}
//             cy={size / 2}
//             r={r}
//             strokeWidth={stroke}
//             className="fill-none stroke-sky-500"
//             strokeDasharray={`${workedLen} ${c - workedLen}`}
//             transform={`rotate(-90 ${size / 2} ${size / 2})`}
//           />
//           <circle
//             cx={size / 2}
//             cy={size / 2}
//             r={r}
//             strokeWidth={stroke}
//             className="fill-none stroke-amber-500"
//             strokeDasharray={`${breakLen} ${c - breakLen}`}
//             transform={`rotate(${worked * 360 - 90} ${size / 2} ${size / 2})`}
//           />
//         </svg>
//         <div className="text-center">
//           <p className="text-[10px] uppercase text-slate-500 dark:text-white/60">
//             Utilization
//           </p>
//           <p className="-mt-1 text-sm font-semibold text-slate-900 dark:text-white">
//             {Math.round(worked * 100)}%
//           </p>
//         </div>
//       </div>
//       <div className="text-xs text-slate-600 dark:text-white/70">
//         <p>
//           <span className="inline-block h-2 w-2 rounded-full bg-sky-500 align-middle mr-2" />{" "}
//           Worked
//         </p>
//         <p>
//           <span className="inline-block h-2 w-2 rounded-full bg-amber-500 align-middle mr-2" />{" "}
//           Break
//         </p>
//       </div>
//     </div>
//   );
// }

// function earningsFmt(v: number) {
//   const currency = guessCurrency();
//   return new Intl.NumberFormat(undefined, {
//     style: "currency",
//     currency,
//   }).format(v || 0);
// }
// function guessCurrency(): string {
//   try {
//     const l = (
//       Intl.DateTimeFormat().resolvedOptions().locale ||
//       navigator?.language ||
//       ""
//     ).toLowerCase();
//     if (l.includes("ja")) return "JPY";
//     if (l.includes("en-us")) return "USD";
//     if (l.includes("en-gb")) return "GBP";
//     if (l.includes("de") || l.includes("fr") || l.includes("es")) return "EUR";
//   } catch {}
//   return "USD";
// }

// /* ===== utils ===== */
// function csvEscape(s: string) {
//   const needs = /[",\n]/.test(s);
//   return needs ? '"' + s.replace(/"/g, '""') + '"' : s;
// }
// function downloadText(text: string, filename: string, mime: string) {
//   const blob = new Blob([text], { type: mime });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   document.body.appendChild(a);
//   a.click();
//   a.remove();
//   URL.revokeObjectURL(url);
// }
// function toLocalInput(ms: number) {
//   const d = new Date(ms);
//   const pad = (n: number) => String(n).padStart(2, "0");
//   return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
//     d.getHours()
//   )}:${pad(d.getMinutes())}`;
// }
// function fromLocalInput(v: string) {
//   return new Date(v).getTime();
// }

// /* ===== All Users Dialog ===== */
// function AllUsersDialog({
//   open,
//   onOpenChange,
//   users,
//   loading,
//   error,
//   onReload,
//   onPick,
//   query,
//   setQuery,
//   roleFilter,
//   setRoleFilter,
// }: {
//   open: boolean;
//   onOpenChange: (v: boolean) => void;
//   users: User[];
//   loading: boolean;
//   error: string | null;
//   onReload: () => void;
//   onPick: (u: User) => void;
//   query: string;
//   setQuery: (v: string) => void;
//   roleFilter: string;
//   setRoleFilter: (v: string) => void;
// }) {
//   const filtered = React.useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return users.filter((u) => {
//       const text = `${u.username || ""}  ${u.role || ""} ${
//         (u as any).dept || ""
//       } ${u.id || ""}`;
//       const qok = q ? text.toLowerCase().includes(q) : true;
//       const rok = roleFilter === "ALL" ? true : (u.role || "") === roleFilter;
//       return qok && rok;
//     });
//   }, [users, query, roleFilter]);

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>All users</DialogTitle>
//         </DialogHeader>

//         <div className="flex flex-col gap-3">
//           <div className="flex items-center gap-2">
//             <div className="relative flex-1">
//               <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
//               <Input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search by name, email, role, dept, id…"
//                 className="pl-9"
//               />
//             </div>
//             <select
//               value={roleFilter}
//               onChange={(e) => setRoleFilter(e.target.value)}
//               className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-white/15 dark:bg-white/5"
//             >
//               <option value="ALL">All roles</option>
//               <option value="ADMIN">ADMIN</option>
//               <option value="MANAGER">MANAGER</option>
//               <option value="CASHIER">CASHIER</option>
//               <option value="STAFF">STAFF</option>
//             </select>
//             <Button variant="outline" onClick={onReload}>
//               Refresh
//             </Button>
//           </div>

//           {loading ? (
//             <div className="flex items-center justify-center py-10 text-slate-500">
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Loading users…
//             </div>
//           ) : error ? (
//             <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200">
//               {error}
//             </div>
//           ) : filtered.length === 0 ? (
//             <EmptyState label="No users found" />
//           ) : (
//             <div className="max-h[420px] overflow-auto rounded-lg border border-slate-200 dark:border-white/10">
//               <table className="min-w-full text-sm">
//                 <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-white/5 dark:text-white/60">
//                   <tr>
//                     <th className="px-3 py-2 text-left">Name</th>
//                     <th className="px-3 py-2 text-left">Role</th>
//                     <th className="px-3 py-2 text-left">Dept</th>
//                     <th className="px-3 py-2 text-left">ID</th>
//                     <th className="px-3 py-2 text-left">Pick</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-200 dark:divide-white/10">
//                   {filtered.map((u) => (
//                     <tr
//                       key={u.id}
//                       className="hover:bg-slate-50 dark:hover:bg-white/5"
//                     >
//                       <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">
//                         {u.username || "—"}
//                       </td>
//                       <td className="px-3 py-2 text-slate-700 dark:text-white/80">
//                         {u.email || "—"}
//                       </td>
//                       <td className="px-3 py-2">
//                         <Badge className="border border-slate-300/60 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-white/80">
//                           {u.role || "—"}
//                         </Badge>
//                       </td>
//                       <td className="px-3 py-2 text-slate-700 dark:text-white/80">
//                         {(u as any).dept || "—"}
//                       </td>
//                       <td className="px-3 py-2 text-[11px] text-slate-500 dark:text-white/60">
//                         {u.id}
//                       </td>
//                       <td className="px-3 py-2">
//                         <Button
//                           size="sm"
//                           onClick={() => onPick(u)}
//                           className="bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500"
//                         >
//                           Use
//                         </Button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         <DialogFooter>
//           <Button variant="ghost" onClick={() => onOpenChange(false)}>
//             Close
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
