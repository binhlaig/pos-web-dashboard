// app/timecard/schedule/page.tsx
"use client";

import * as React from "react";
import { addDays, startOfWeek, endOfWeek, format, parseISO, isSameDay } from "date-fns";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Moon,
  Sun,
  Plus,
  Trash,
  Pencil,
  Users,
  Save,
  RefreshCw,
} from "lucide-react";

import { get, post } from "@/lib/timecard/api"; // ✅ your existing API helper
import type { User } from "@/lib/timecard/user";
import { decodeJwt, getAccessToken } from "@/app/timecard/auth";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/* ---------------- Types ---------------- */

type ID = string;

interface ScheduleShift {
  id: ID;
  employeeId: ID;
  // planned shift date (YYYY-MM-DD) — time range uses startAt/endAt
  date: string;
  startAt: string; // ISO string
  endAt: string; // ISO string
  note?: string;
}

interface UpsertShiftDto {
  id?: ID;
  employeeId: ID;
  startAt: string; // ISO
  endAt: string; // ISO
  note?: string;
}

/* ------------- Local helpers ------------- */

const MONDAY = 1; // start of week Monday
const toYmd = (d: Date) => format(d, "yyyy-MM-dd");

function weekRange(anchor: Date) {
  const from = startOfWeek(anchor, { weekStartsOn: MONDAY as 1 });
  const to = endOfWeek(anchor, { weekStartsOn: MONDAY as 1 });
  return { from, to };
}

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
      <Button variant="ghost" size="icon" className="rounded-2xl" aria-label="Toggle theme" />
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

/* ------------ Employees fallback (optional) ------------ */
/* API မှာ /auth/users မရရင် fallback တွေပြ */
const FALLBACK_EMPLOYEES: Array<{ id: string; name: string; dept?: string }> = [
  { id: "1001", name: "Aung Aung", dept: "Sales" },
  { id: "1002", name: "Su Su", dept: "Cashier" },
  { id: "1003", name: "Ko Ko", dept: "Stock" },
  { id: "2001", name: "Mia", dept: "HR" },
];

/* ------------------- Main Page ------------------- */

export default function SchedulePage() {
  const mounted = useMounted();

  // anchor date
  const [anchor, setAnchor] = React.useState<Date>(new Date());
  const { from, to } = weekRange(anchor);

  // data state
  const [loading, setLoading] = React.useState(false);
  const [employees, setEmployees] = React.useState<Array<{ id: string; name: string; dept?: string }>>([]);
  const [employeeMap, setEmployeeMap] = React.useState<Record<string, { id: string; name: string; dept?: string }>>({});
  const [shifts, setShifts] = React.useState<ScheduleShift[]>([]);
  const [filterEmp, setFilterEmp] = React.useState<string>("ALL");

  // auth (optional: to preselect own id)
  const [myId, setMyId] = React.useState<string>("");

  // upsert dialog
  const [editOpen, setEditOpen] = React.useState(false);
  const [editLoading, setEditLoading] = React.useState(false);
  const [editing, setEditing] = React.useState<UpsertShiftDto | null>(null);

  // delete confirm
  const [deletingId, setDeletingId] = React.useState<ID | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // load employees (API → fallback)
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await get<User[]>("/auth/users").catch(() => []) as any[];
        let mapped: Array<{ id: string; name: string; dept?: string }> = [];
        if (Array.isArray(list) && list.length) {
          mapped = list.map((u) => ({
            id: String(u.id),
            name: u.username || u.email || String(u.id),
            dept: (u as any).dept,
          }));
        } else {
          mapped = FALLBACK_EMPLOYEES;
        }
        setEmployees(mapped);
        setEmployeeMap(Object.fromEntries(mapped.map((e) => [e.id, e])));
      } catch (e) {
        setEmployees(FALLBACK_EMPLOYEES);
        setEmployeeMap(Object.fromEntries(FALLBACK_EMPLOYEES.map((e) => [e.id, e])));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // try decode own id
  React.useEffect(() => {
    try {
      const t = getAccessToken();
      if (!t) return;
      const p = decodeJwt(t) as { sub?: string } | undefined;
      if (p?.sub) setMyId(p.sub);
    } catch {}
  }, []);

  // load week schedule
  async function loadWeek() {
    try {
      setLoading(true);
      const data = await get<ScheduleShift[]>("/schedule", {
        start: toYmd(from),
        end: toYmd(to),
        ...(filterEmp !== "ALL" ? { employeeId: filterEmp } : {}),
      });
      setShifts(data || []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load schedule");
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadWeek();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor, filterEmp]);

  // helpers
  const days: Date[] = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(from, i)),
    [from]
  );

  const openCreateFor = (employeeId: string, day: Date) => {
    const start = new Date(day);
    start.setHours(9, 0, 0, 0);
    const end = new Date(day);
    end.setHours(17, 0, 0, 0);
    setEditing({
      employeeId,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      note: "",
    });
    setEditOpen(true);
  };

  const openEdit = (s: ScheduleShift) => {
    setEditing({
      id: s.id,
      employeeId: s.employeeId,
      startAt: s.startAt,
      endAt: s.endAt,
      note: s.note,
    });
    setEditOpen(true);
  };

  async function saveShift() {
    if (!editing) return;
    try {
      setEditLoading(true);
      // basic validation
      if (!editing.employeeId) {
        toast.error("Select employee");
        return;
      }
      if (!editing.startAt || !editing.endAt) {
        toast.error("Start/End required");
        return;
      }
      const start = new Date(editing.startAt).getTime();
      const end = new Date(editing.endAt).getTime();
      if (end <= start) {
        toast.error("End must be after start");
        return;
      }

      if (editing.id) {
        // update
        const res = await post<ScheduleShift>(`/schedule/${editing.id}`, editing); // allow POST to /:id for simplicity
        toast.success("Shift updated");
        setEditOpen(false);
        setEditing(null);
        // refresh
        await loadWeek();
      } else {
        // create
        const res = await post<ScheduleShift>("/schedule", editing);
        toast.success("Shift created");
        setEditOpen(false);
        setEditing(null);
        await loadWeek();
      }
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally {
      setEditLoading(false);
    }
  }

  async function removeShift(id: ID) {
    try {
      setDeleteLoading(true);
      // simple delete via POST pattern (if your backend prefers DELETE, switch to fetch directly)
      await post<{ ok: true }>(`/schedule/${id}/delete`, {});
      toast.success("Shift deleted");
      setDeletingId(null);
      await loadWeek();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  }

  const gridData = React.useMemo(() => {
    // map: empId -> dayIndex -> shifts[]
    const map: Record<string, Record<number, ScheduleShift[]>> = {};
    for (const s of shifts) {
      const d = parseISO(s.startAt);
      const idx = days.findIndex((dx) => isSameDay(dx, d));
      if (idx < 0) continue;
      if (!map[s.employeeId]) map[s.employeeId] = {};
      if (!map[s.employeeId][idx]) map[s.employeeId][idx] = [];
      map[s.employeeId][idx].push(s);
    }
    return map;
  }, [shifts, days]);

  const headerTitle = `${format(from, "MMM d")} – ${format(to, "MMM d, yyyy")}`;

  return (
    <section className="relative min-h-screen bg-white text-slate-900 dark:bg-black dark:text-neutral-200">
      <Toaster position="top-right" />
      <div className="mx-auto w-[92%] max-w-7xl py-8">
        <div className="mb-6 flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-sky-600 dark:text-sky-300" />
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-bold"
          >
            Employee Schedule
          </motion.h1>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadWeek()}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>

        {/* Controls */}
        <Card className="border-slate-200 dark:border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setAnchor(addDays(anchor, -7))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-[220px] text-center font-semibold">
                  {headerTitle}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setAnchor(addDays(anchor, +7))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  className="ml-2"
                  onClick={() => setAnchor(new Date())}
                >
                  This week
                </Button>
              </div>

              <Separator orientation="vertical" className="mx-1 hidden md:block" />

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 opacity-70" />
                <Select value={filterEmp} onValueChange={setFilterEmp}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Filter by employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All employees</SelectItem>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name} {e.dept ? `(${e.dept})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid */}
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
          <table className="min-w-full table-fixed">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-white/5 dark:text-white/60">
              <tr>
                <th className="w-48 px-3 py-2 text-left">Employee</th>
                {days.map((d, i) => (
                  <th key={i} className="px-3 py-2 text-left">
                    {format(d, "EEE d")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm dark:divide-white/10">
              {(filterEmp === "ALL" ? employees : employees.filter((e) => e.id === filterEmp)).map(
                (emp) => (
                  <tr key={emp.id} className="align-top">
                    <td className="bg-slate-50/60 px-3 py-3 dark:bg-white/5">
                      <div className="font-semibold text-slate-900 dark:text-white">{emp.name}</div>
                      <div className="text-xs text-slate-500 dark:text-white/60">{emp.dept ?? "\u00A0"}</div>
                    </td>
                    {days.map((d, di) => {
                      const dayShifts = (gridData[emp.id]?.[di] || []).sort(
                        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
                      );
                      return (
                        <td key={di} className="px-2 py-2">
                          <div className="flex flex-col gap-2">
                            {dayShifts.map((s) => (
                              <div
                                key={s.id}
                                className="group rounded-lg border border-sky-200 bg-sky-50 px-2 py-1 text-sky-800 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-200"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {format(parseISO(s.startAt), "HH:mm")}–{format(parseISO(s.endAt), "HH:mm")}
                                  </span>
                                  <span className="opacity-0 transition group-hover:opacity-100">
                                    <Button variant="outline" size="icon" className="h-7 w-7 mr-1" onClick={() => openEdit(s)}>
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => setDeletingId(s.id)}
                                    >
                                      <Trash className="h-3.5 w-3.5" />
                                    </Button>
                                  </span>
                                </div>
                                {s.note && (
                                  <div className="mt-0.5 line-clamp-2 text-xs opacity-80">{s.note}</div>
                                )}
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              className="justify-start"
                              onClick={() => openCreateFor(emp.id, d)}
                            >
                              <Plus className="mr-2 h-4 w-4" /> Add
                            </Button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                )
              )}
            </tbody>
          </table>

          {loading && (
            <div className="flex items-center justify-center py-10 text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading…
            </div>
          )}

          {!loading && shifts.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-white/60">
              No shifts for this range yet.
            </div>
          )}
        </div>
      </div>

      {/* Upsert Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => !editLoading && setEditOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit shift" : "Create shift"}</DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="grid gap-3">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-500 dark:text-white/60">Employee</label>
                  <Select
                    value={editing.employeeId}
                    onValueChange={(v) => setEditing({ ...(editing as UpsertShiftDto), employeeId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name} {e.dept ? `(${e.dept})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div />
                <div>
                  <label className="mb-1 block text-xs text-slate-500 dark:text-white/60">Start</label>
                  <Input
                    type="datetime-local"
                    value={toLocal(editing.startAt)}
                    onChange={(e) =>
                      setEditing({ ...(editing as UpsertShiftDto), startAt: fromLocal(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-500 dark:text-white/60">End</label>
                  <Input
                    type="datetime-local"
                    value={toLocal(editing.endAt)}
                    onChange={(e) =>
                      setEditing({ ...(editing as UpsertShiftDto), endAt: fromLocal(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-500 dark:text-white/60">Note</label>
                <Textarea
                  rows={4}
                  value={editing.note || ""}
                  onChange={(e) => setEditing({ ...(editing as UpsertShiftDto), note: e.target.value })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)} disabled={editLoading}>
              Cancel
            </Button>
            <Button onClick={saveShift} disabled={editLoading} className="gap-2">
              {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm (simple) */}
      <Dialog open={!!deletingId} onOpenChange={(o) => !deleteLoading && setDeletingId(o ? deletingId : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this shift?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 dark:text-white/70">
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeletingId(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && removeShift(deletingId)}
              disabled={deleteLoading}
              className="gap-2"
            >
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/* ---------------- utils ---------------- */

function toLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const da = pad(d.getDate());
  const h = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${y}-${m}-${da}T${h}:${mi}`;
}
function fromLocal(v: string) {
  return new Date(v).toISOString();
}



// //--- no Database code ---//
// // app/timecard/schedule/page.tsx
// "use client";

// import * as React from "react";
// import { addDays, startOfWeek, endOfWeek, format, parseISO, isSameDay } from "date-fns";
// import { useTheme } from "next-themes";
// import { motion } from "framer-motion";
// import toast, { Toaster } from "react-hot-toast";
// import {
//   CalendarDays,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   Loader2,
//   Moon,
//   Sun,
//   Plus,
//   Trash,
//   Pencil,
//   Users,
//   Save,
//   RefreshCw,
// } from "lucide-react";

// import { get, post } from "@/lib/timecard/api"; // ✅ your existing API helper
// import type { User } from "@/lib/timecard/user";
// import { decodeJwt, getAccessToken } from "@/app/timecard/auth";

// import { cn } from "@/lib/utils";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import { Separator } from "@/components/ui/separator";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { toLocal } from "@/components/schedule/fusion_schedule";
// import { FALLBACK_EMPLOYEES } from "@/components/schedule/fusion_schedule";

// /* ---------------- Types ---------------- */

// type ID = string;

// interface ScheduleShift {
//   id: ID;
//   employeeId: ID;
//   // planned shift date (YYYY-MM-DD) — time range uses startAt/endAt
//   date: string;
//   startAt: string; // ISO string
//   endAt: string; // ISO string
//   note?: string;
// }

// interface UpsertShiftDto {
//   id?: ID;
//   employeeId: ID;
//   startAt: string; // ISO
//   endAt: string; // ISO
//   note?: string;
// }

// /* ------------- Local helpers ------------- */

// const MONDAY = 1; // start of week Monday
// const toYmd = (d: Date) => format(d, "yyyy-MM-dd");

// function weekRange(anchor: Date) {
//   const from = startOfWeek(anchor, { weekStartsOn: MONDAY as 1 });
//   const to = endOfWeek(anchor, { weekStartsOn: MONDAY as 1 });
//   return { from, to };
// }

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
//       <Button variant="ghost" size="icon" className="rounded-2xl" aria-label="Toggle theme" />
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

// /* ------------ Employees fallback (optional) ------------ */
// /* API မှာ /auth/users မရရင် fallback တွေပြ */
// // const FALLBACK_EMPLOYEES: Array<{ id: string; name: string; dept?: string }> = [
// //   { id: "1001", name: "Aung Aung", dept: "Sales" },
// //   { id: "1002", name: "Su Su", dept: "Cashier" },
// //   { id: "1003", name: "Ko Ko", dept: "Stock" },
// //   { id: "2001", name: "Mia", dept: "HR" },
// // ];

// /* ------------------- Main Page ------------------- */

// export default function SchedulePage() {
//   const mounted = useMounted();

//   // anchor date
//   const [anchor, setAnchor] = React.useState<Date>(new Date());
//   const { from, to } = weekRange(anchor);

//   // data state
//   const [loading, setLoading] = React.useState(false);
//   const [employees, setEmployees] = React.useState<Array<{ id: string; name: string; dept?: string }>>([]);
//   const [employeeMap, setEmployeeMap] = React.useState<Record<string, { id: string; name: string; dept?: string }>>({});
//   const [shifts, setShifts] = React.useState<ScheduleShift[]>([]);
//   const [filterEmp, setFilterEmp] = React.useState<string>("ALL");

//   // auth (optional: to preselect own id)
//   const [myId, setMyId] = React.useState<string>("");

//   // upsert dialog
//   const [editOpen, setEditOpen] = React.useState(false);
//   const [editLoading, setEditLoading] = React.useState(false);
//   const [editing, setEditing] = React.useState<UpsertShiftDto | null>(null);

//   // delete confirm
//   const [deletingId, setDeletingId] = React.useState<ID | null>(null);
//   const [deleteLoading, setDeleteLoading] = React.useState(false);

//   // load employees (API → fallback)
//   React.useEffect(() => {
//     (async () => {
//       try {
//         setLoading(true);
//         const list = await get<User[]>("/auth/users").catch(() => []) as any[];
//         let mapped: Array<{ id: string; name: string; dept?: string }> = [];
//         if (Array.isArray(list) && list.length) {
//           mapped = list.map((u) => ({
//             id: String(u.id),
//             name: u.username || u.email || String(u.id),
//             dept: (u as any).dept,
//           }));
//         } else {
//           mapped = FALLBACK_EMPLOYEES;
//         }
//         setEmployees(mapped);
//         setEmployeeMap(Object.fromEntries(mapped.map((e) => [e.id, e])));
//       } catch (e) {
//         setEmployees(FALLBACK_EMPLOYEES);
//         setEmployeeMap(Object.fromEntries(FALLBACK_EMPLOYEES.map((e) => [e.id, e])));
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   // try decode own id
//   React.useEffect(() => {
//     try {
//       const t = getAccessToken();
//       if (!t) return;
//       const p = decodeJwt(t) as { sub?: string } | undefined;
//       if (p?.sub) setMyId(p.sub);
//     } catch {}
//   }, []);

//   // load week schedule
//   async function loadWeek() {
//     try {
//       setLoading(true);
//       const data = await get<ScheduleShift[]>("/schedule", {
//         start: toYmd(from),
//         end: toYmd(to),
//         ...(filterEmp !== "ALL" ? { employeeId: filterEmp } : {}),
//       });
//       setShifts(data || []);
//     } catch (e: any) {
//       toast.error(e?.message || "Failed to load schedule");
//       setShifts([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   React.useEffect(() => {
//     loadWeek();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [anchor, filterEmp]);

//   // helpers
//   const days: Date[] = React.useMemo(
//     () => Array.from({ length: 7 }, (_, i) => addDays(from, i)),
//     [from]
//   );

//   const openCreateFor = (employeeId: string, day: Date) => {
//     const start = new Date(day);
//     start.setHours(9, 0, 0, 0);
//     const end = new Date(day);
//     end.setHours(17, 0, 0, 0);
//     setEditing({
//       employeeId,
//       startAt: start.toISOString(),
//       endAt: end.toISOString(),
//       note: "",
//     });
//     setEditOpen(true);
//   };

//   const openEdit = (s: ScheduleShift) => {
//     setEditing({
//       id: s.id,
//       employeeId: s.employeeId,
//       startAt: s.startAt,
//       endAt: s.endAt,
//       note: s.note,
//     });
//     setEditOpen(true);
//   };

//   async function saveShift() {
//     if (!editing) return;
//     try {
//       setEditLoading(true);
//       // basic validation
//       if (!editing.employeeId) {
//         toast.error("Select employee");
//         return;
//       }
//       if (!editing.startAt || !editing.endAt) {
//         toast.error("Start/End required");
//         return;
//       }
//       const start = new Date(editing.startAt).getTime();
//       const end = new Date(editing.endAt).getTime();
//       if (end <= start) {
//         toast.error("End must be after start");
//         return;
//       }

//       if (editing.id) {
//         // update
//         const res = await post<ScheduleShift>(`/schedule/${editing.id}`, editing); // allow POST to /:id for simplicity
//         toast.success("Shift updated");
//         setEditOpen(false);
//         setEditing(null);
//         // refresh
//         await loadWeek();
//       } else {
//         // create
//         const res = await post<ScheduleShift>("/schedule", editing);
//         toast.success("Shift created");
//         setEditOpen(false);
//         setEditing(null);
//         await loadWeek();
//       }
//     } catch (e: any) {
//       toast.error(e?.message || "Save failed");
//     } finally {
//       setEditLoading(false);
//     }
//   }

//   async function removeShift(id: ID) {
//     try {
//       setDeleteLoading(true);
//       // simple delete via POST pattern (if your backend prefers DELETE, switch to fetch directly)
//       await post<{ ok: true }>(`/schedule/${id}/delete`, {});
//       toast.success("Shift deleted");
//       setDeletingId(null);
//       await loadWeek();
//     } catch (e: any) {
//       toast.error(e?.message || "Delete failed");
//     } finally {
//       setDeleteLoading(false);
//     }
//   }

//   const gridData = React.useMemo(() => {
//     // map: empId -> dayIndex -> shifts[]
//     const map: Record<string, Record<number, ScheduleShift[]>> = {};
//     for (const s of shifts) {
//       const d = parseISO(s.startAt);
//       const idx = days.findIndex((dx) => isSameDay(dx, d));
//       if (idx < 0) continue;
//       if (!map[s.employeeId]) map[s.employeeId] = {};
//       if (!map[s.employeeId][idx]) map[s.employeeId][idx] = [];
//       map[s.employeeId][idx].push(s);
//     }
//     return map;
//   }, [shifts, days]);

//   const headerTitle = `${format(from, "MMM d")} – ${format(to, "MMM d, yyyy")}`;

//   return (
//     <section className="relative min-h-screen bg-white text-slate-900 dark:bg-black dark:text-neutral-200">
//       <Toaster position="top-right" />
//       <div className="mx-auto w-[92%] max-w-7xl py-8">
//         <div className="mb-6 flex items-center gap-3">
//           <CalendarDays className="h-6 w-6 text-sky-600 dark:text-sky-300" />
//           <motion.h1
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.4 }}
//             className="text-2xl font-bold"
//           >
//             Employee Schedule
//           </motion.h1>
//           <div className="ml-auto flex items-center gap-2">
//             <ThemeToggle />
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => loadWeek()}
//               className="gap-2"
//             >
//               <RefreshCw className="h-4 w-4" /> Refresh
//             </Button>
//           </div>
//         </div>

//         {/* Controls */}
//         <Card className="border-slate-200 dark:border-white/10">
//           <CardContent className="p-4">
//             <div className="flex flex-wrap items-center gap-3">
//               <div className="flex items-center gap-2">
//                 <Button
//                   variant="outline"
//                   onClick={() => setAnchor(addDays(anchor, -7))}
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                 </Button>
//                 <div className="min-w-[220px] text-center font-semibold">
//                   {headerTitle}
//                 </div>
//                 <Button
//                   variant="outline"
//                   onClick={() => setAnchor(addDays(anchor, +7))}
//                 >
//                   <ChevronRight className="h-4 w-4" />
//                 </Button>
//                 <Button
//                   variant="secondary"
//                   className="ml-2"
//                   onClick={() => setAnchor(new Date())}
//                 >
//                   This week
//                 </Button>
//               </div>

//               <Separator orientation="vertical" className="mx-1 hidden md:block" />

//               <div className="flex items-center gap-2">
//                 <Users className="h-4 w-4 opacity-70" />
//                 <Select value={filterEmp} onValueChange={setFilterEmp}>
//                   <SelectTrigger className="w-[220px]">
//                     <SelectValue placeholder="Filter by employee" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="ALL">All employees</SelectItem>
//                     {employees.map((e) => (
//                       <SelectItem key={e.id} value={e.id}>
//                         {e.name} {e.dept ? `(${e.dept})` : ""}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Grid */}
//         <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
//           <table className="min-w-full table-fixed">
//             <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-white/5 dark:text-white/60">
//               <tr>
//                 <th className="w-48 px-3 py-2 text-left">Employee</th>
//                 {days.map((d, i) => (
//                   <th key={i} className="px-3 py-2 text-left">
//                     {format(d, "EEE d")}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-200 text-sm dark:divide-white/10">
//               {(filterEmp === "ALL" ? employees : employees.filter((e) => e.id === filterEmp)).map(
//                 (emp) => (
//                   <tr key={emp.id} className="align-top">
//                     <td className="bg-slate-50/60 px-3 py-3 dark:bg-white/5">
//                       <div className="font-semibold text-slate-900 dark:text-white">{emp.name}</div>
//                       <div className="text-xs text-slate-500 dark:text-white/60">{emp.dept ?? "\u00A0"}</div>
//                     </td>
//                     {days.map((d, di) => {
//                       const dayShifts = (gridData[emp.id]?.[di] || []).sort(
//                         (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
//                       );
//                       return (
//                         <td key={di} className="px-2 py-2">
//                           <div className="flex flex-col gap-2">
//                             {dayShifts.map((s) => (
//                               <div
//                                 key={s.id}
//                                 className="group rounded-lg border border-sky-200 bg-sky-50 px-2 py-1 text-sky-800 dark:border-sky-400/30 dark:bg-sky-500/10 dark:text-sky-200"
//                               >
//                                 <div className="flex items-center justify-between gap-2">
//                                   <span className="inline-flex items-center gap-1">
//                                     <Clock className="h-3.5 w-3.5" />
//                                     {format(parseISO(s.startAt), "HH:mm")}–{format(parseISO(s.endAt), "HH:mm")}
//                                   </span>
//                                   <span className="opacity-0 transition group-hover:opacity-100">
//                                     <Button variant="outline" size="icon" className="h-7 w-7 mr-1" onClick={() => openEdit(s)}>
//                                       <Pencil className="h-3.5 w-3.5" />
//                                     </Button>
//                                     <Button
//                                       variant="outline"
//                                       size="icon"
//                                       className="h-7 w-7"
//                                       onClick={() => setDeletingId(s.id)}
//                                     >
//                                       <Trash className="h-3.5 w-3.5" />
//                                     </Button>
//                                   </span>
//                                 </div>
//                                 {s.note && (
//                                   <div className="mt-0.5 line-clamp-2 text-xs opacity-80">{s.note}</div>
//                                 )}
//                               </div>
//                             ))}
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="justify-start"
//                               onClick={() => openCreateFor(emp.id, d)}
//                             >
//                               <Plus className="mr-2 h-4 w-4" /> Add
//                             </Button>
//                           </div>
//                         </td>
//                       );
//                     })}
//                   </tr>
//                 )
//               )}
//             </tbody>
//           </table>

//           {loading && (
//             <div className="flex items-center justify-center py-10 text-slate-500">
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Loading…
//             </div>
//           )}

//           {!loading && shifts.length === 0 && (
//             <div className="py-8 text-center text-sm text-slate-500 dark:text-white/60">
//               No shifts for this range yet.
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Upsert Dialog */}
//       <Dialog open={editOpen} onOpenChange={(o) => !editLoading && setEditOpen(o)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>{editing?.id ? "Edit shift" : "Create shift"}</DialogTitle>
//           </DialogHeader>

//           {editing && (
//             <div className="grid gap-3">
//               <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
//                 <div>
//                   <label className="mb-1 block text-xs text-slate-500 dark:text-white/60">Employee</label>
//                   <Select
//                     value={editing.employeeId}
//                     onValueChange={(v) => setEditing({ ...(editing as UpsertShiftDto), employeeId: v })}
//                   >
//                     <SelectTrigger>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {employees.map((e) => (
//                         <SelectItem key={e.id} value={e.id}>
//                           {e.name} {e.dept ? `(${e.dept})` : ""}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div />
//                 <div>
//                   <label className="mb-1 block text-xs text-slate-500 dark:text-white/60">Start</label>
//                   <Input
//                     type="datetime-local"
//                     value={toLocal(editing.startAt)}
//                     onChange={(e) =>
//                       setEditing({ ...(editing as UpsertShiftDto), startAt: fromLocal(e.target.value) })
//                     }
//                   />
//                 </div>
//                 <div>
//                   <label className="mb-1 block text-xs text-slate-500 dark:text-white/60">End</label>
//                   <Input
//                     type="datetime-local"
//                     value={toLocal(editing.endAt)}
//                     onChange={(e) =>
//                       setEditing({ ...(editing as UpsertShiftDto), endAt: fromLocal(e.target.value) })
//                     }
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="mb-1 block text-xs text-slate-500 dark:text-white/60">Note</label>
//                 <Textarea
//                   rows={4}
//                   value={editing.note || ""}
//                   onChange={(e) => setEditing({ ...(editing as UpsertShiftDto), note: e.target.value })}
//                 />
//               </div>
//             </div>
//           )}

//           <DialogFooter>
//             <Button variant="ghost" onClick={() => setEditOpen(false)} disabled={editLoading}>
//               Cancel
//             </Button>
//             <Button onClick={saveShift} disabled={editLoading} className="gap-2">
//               {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
//               Save
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Delete confirm (simple) */}
//       <Dialog open={!!deletingId} onOpenChange={(o) => !deleteLoading && setDeletingId(o ? deletingId : null)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Delete this shift?</DialogTitle>
//           </DialogHeader>
//           <p className="text-sm text-slate-600 dark:text-white/70">
//             This action cannot be undone.
//           </p>
//           <DialogFooter>
//             <Button variant="ghost" onClick={() => setDeletingId(null)} disabled={deleteLoading}>
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               onClick={() => deletingId && removeShift(deletingId)}
//               disabled={deleteLoading}
//               className="gap-2"
//             >
//               {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
//               Delete
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </section>
//   );
// }

// /* ---------------- utils ---------------- */

// // function toLocal(iso: string) {
// //   const d = new Date(iso);
// //   const pad = (n: number) => String(n).padStart(2, "0");
// //   const y = d.getFullYear();
// //   const m = pad(d.getMonth() + 1);
// //   const da = pad(d.getDate());
// //   const h = pad(d.getHours());
// //   const mi = pad(d.getMinutes());
// //   return `${y}-${m}-${da}T${h}:${mi}`;
// // }

// function fromLocal(v: string) {
//   return new Date(v).toISOString();
// }
