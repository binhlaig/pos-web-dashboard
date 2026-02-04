"use client";

import * as React from "react";
import { Download, Users, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

/**
 * All Employees — Time Card Table
 * - Reads localStorage (same schema as kiosk pages) and shows a combined table
 * - Filters: query by Employee ID or name (if provided in data), range: Today / This week / All
 * - CSV export for the currently visible rows
 *
 * NOTE: This is a demo that reads from localStorage. Replace loadShifts() with API calls in production.
 */

// ====== Types & helpers (match kiosk schemas) ======
interface BreakSpan { start: number; end?: number }
interface Shift {
  id: string;
  employeeId: string;
  date: string;          // YYYY-MM-DD local
  clockIn: number;       // epoch ms
  clockOut?: number;
  breaks: BreakSpan[];
  note?: string;
  // Optional — if you store names/depts alongside
  name?: string;
  dept?: string;
}

const LS_KEYS = [
  "kiosk_timecard_clearbluelight_v1", // latest kiosk page
  "kiosk:punches",                     // earlier kiosk demo
  "timecard:punches"                   // earlier single-user demo
];

function loadShifts(): Shift[] {
  if (typeof window === "undefined") return [];
  const out: Shift[] = [];
  for (const key of LS_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const arr = JSON.parse(raw);
      // normalize older shapes
      if (Array.isArray(arr)) {
        for (const it of arr) {
          if (it && typeof it === "object") {
            const s: Shift = {
              id: String(it.id ?? crypto.randomUUID()),
              employeeId: String(it.employeeId ?? it.id ?? "unknown"),
              date: String(it.date ?? toYmd(new Date(it.clockIn ?? Date.now()))),
              clockIn: Number(it.clockIn ?? Date.now()),
              clockOut: typeof it.clockOut === "number" ? it.clockOut : undefined,
              breaks: Array.isArray(it.breaks) ? it.breaks : [],
              note: typeof it.note === "string" ? it.note : undefined,
              name: it.name,
              dept: it.dept,
            };
            out.push(s);
          }
        }
      }
    } catch {}
  }
  // sort newest first
  return out.sort((a,b)=> b.clockIn - a.clockIn);
}

const toYmd = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const weekStart = (d = new Date()) => { const n=new Date(d); const day=(n.getDay()+6)%7; n.setHours(0,0,0,0); n.setDate(n.getDate()-day); return n; };
const breakMs = (sh: Shift, now = Date.now()) => sh.breaks?.reduce((a,b)=> a + ((b.end ?? now) - b.start), 0) ?? 0;
const workMs = (sh: Shift, now = Date.now()) => Math.max(0, (sh.clockOut ?? now) - sh.clockIn - breakMs(sh, now));
const fmtHM = (ms: number) => { const s=Math.max(0,Math.floor(ms/1000)); const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sec=s%60; return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`; };
const prettyClock = (t: number) => new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(t);

// ====== Page ======
export default function AllEmployeesTimecards() {
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState("today");
  const [rows, setRows] = React.useState<Shift[]>([]);

  // hydrate
  React.useEffect(()=> setRows(loadShifts()), []);

  // filter by range
  const now = new Date();
  const today = toYmd(now);
  const ws = weekStart(now);
  const we = new Date(ws); we.setDate(ws.getDate()+6);

  const inRange = React.useCallback((s: Shift) => {
    if (tab === "all") return true;
    if (tab === "today") return s.date === today;
    if (tab === "week") {
      const d = new Date(s.date + "T00:00:00");
      return d >= ws && d <= we;
    }
    return true;
  }, [tab, today, ws, we]);

  const filtered = React.useMemo(()=> rows.filter(s => inRange(s) && matchQuery(s, query)), [rows, inRange, query]);

  // totals
  const totalWorked = React.useMemo(()=> filtered.reduce((a,s)=> a + workMs(s), 0), [filtered]);
  const totalBreaks = React.useMemo(()=> filtered.reduce((a,s)=> a + breakMs(s), 0), [filtered]);

  const exportCSV = () => {
    const header = ["Employee ID","Name","Dept","Date","Clock In","Clock Out","Break (min)","Worked (h:mm:ss)","Note"];
    const lines = filtered.map(s => [
      s.employeeId,
      s.name ?? "",
      s.dept ?? "",
      s.date,
      prettyClock(s.clockIn),
      s.clockOut ? prettyClock(s.clockOut) : "",
      String(Math.round(breakMs(s)/60000)),
      fmtHM(workMs(s)),
      (s.note ?? "").replaceAll("\n"," ")
    ]);
    const csv = [header, ...lines].map(r=> r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`timecards_${tab}_${today}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-[92%] max-w-7xl py-8">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>All Employees — Time Cards</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search by ID, name, dept" value={query} onChange={e=>setQuery(e.target.value)} className="w-64" />
            <Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4"/> Export</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <div className="mb-4 flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">This week</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              <Badge variant="secondary" className="gap-2"><CalendarDays className="h-4 w-4"/> {tabLabel(tab, today)}</Badge>
            </div>

            <TabsContent value="today" className="m-0">
              <TimecardTable rows={filtered} />
            </TabsContent>
            <TabsContent value="week" className="m-0">
              <TimecardTable rows={filtered} />
            </TabsContent>
            <TabsContent value="all" className="m-0">
              <TimecardTable rows={filtered} />
            </TabsContent>
          </Tabs>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>Total worked: <span className="font-semibold text-foreground">{fmtHM(totalWorked)}</span></span>
            <span>Total breaks: <span className="font-semibold text-foreground">{fmtHM(totalBreaks)}</span></span>
            <span>Rows: <span className="font-semibold text-foreground">{filtered.length}</span></span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TimecardTable({ rows }: { rows: Shift[] }){
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        No records found.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px]">Employee</TableHead>
            <TableHead className="min-w-[100px]">Date</TableHead>
            <TableHead>Clock In</TableHead>
            <TableHead>Clock Out</TableHead>
            <TableHead>Break</TableHead>
            <TableHead>Worked</TableHead>
            <TableHead className="min-w-[200px]">Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((s) => (
            <TableRow key={`${s.id}-${s.clockIn}`}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{s.name ?? `#${s.employeeId}`}</span>
                  <span className="text-xs text-muted-foreground">{s.dept ?? `ID: ${s.employeeId}`}</span>
                </div>
              </TableCell>
              <TableCell>{s.date}</TableCell>
              <TableCell>{prettyClock(s.clockIn)}</TableCell>
              <TableCell>{s.clockOut ? prettyClock(s.clockOut) : "—"}</TableCell>
              <TableCell>{fmtHM(breakMs(s))}</TableCell>
              <TableCell className="font-medium">{fmtHM(workMs(s))}</TableCell>
              <TableCell className="max-w-[520px] whitespace-pre-wrap">{s.note ?? ""}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function matchQuery(s: Shift, q: string){
  if (!q.trim()) return true;
  const t = q.toLowerCase();
  return (
    s.employeeId?.toLowerCase().includes(t) ||
    s.name?.toLowerCase().includes(t) ||
    s.dept?.toLowerCase().includes(t) ||
    s.note?.toLowerCase().includes(t)
  );
}

function tabLabel(tab: string, today: string){
  if (tab === "today") return today;
  if (tab === "week") {
    const ws = weekStart(new Date());
    const we = new Date(ws); we.setDate(ws.getDate()+6);
    const f = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    return `${f(ws)} → ${f(we)}`;
  }
  return "All records";
}