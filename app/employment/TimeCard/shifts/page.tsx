"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Loader2,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Store,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

type StaffStatus = "ACTIVE" | "INACTIVE";
type ShiftStatus = "DRAFT" | "PUBLISHED" | "APPROVED";
type ViewMode = "DAY" | "WEEK" | "MONTH";

type Staff = {
  id: number | string;
  staffId: string;
  name: string;
  role: string;
  branch: string;
  status: StaffStatus;
};

type Shift = {
  id: number | string;
  staffId: string;
  staffName?: string;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
  note?: string;
  status: ShiftStatus;
};

type ShiftPayload = {
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
  note?: string;
  status: ShiftStatus;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const STAFF_ENDPOINT = `${API_BASE}/api/staff`;
const SHIFT_ENDPOINT = `${API_BASE}/api/timecard/schedules`;

const DAY_START_HOUR = 6;
const DAY_END_HOUR = 24;

const DAY_TIMELINE_HOURS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
  (_, index) => DAY_START_HOUR + index
);

function getAuthToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("pos_shop_owner_token") ||
    localStorage.getItem("pos_access_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    ""
  );
}

function authHeaders() {
  const token = getAuthToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readJsonOrThrow<T>(response: Response): Promise<T> {
  const text = await response.text();

  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      (typeof data === "string" && data) ||
      `Request failed (${response.status})`;

    throw new Error(message);
  }

  return data as T;
}

function normalizeStaff(item: any): Staff {
  return {
    id: item.id ?? item.staffId,
    staffId: String(item.staffId ?? item.employeeId ?? item.id ?? ""),
    name: String(item.fullName ?? item.name ?? item.username ?? "Unknown"),
    role: String(item.role ?? "Staff"),
    branch: String(item.branch ?? "Main Branch"),
    status: String(item.status ?? "ACTIVE").toUpperCase() as StaffStatus,
  };
}

function normalizeShift(item: any): Shift {
  return {
    id: item.id,
    staffId: String(item.staffId ?? item.employeeId ?? ""),
    staffName: item.staffName ?? item.employeeName ?? item.fullName,
    date: String(item.date ?? item.workDate ?? item.shiftDate ?? ""),
    startTime: String(item.startTime ?? item.clockInTime ?? "09:00").slice(0, 5),
    endTime: String(item.endTime ?? item.clockOutTime ?? "17:00").slice(0, 5),
    role: String(item.role ?? item.shiftRole ?? "Staff"),
    note: item.note ?? "",
    status: String(item.status ?? "DRAFT").toUpperCase() as ShiftStatus,
  };
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`;
}

function dateKeyToLocalDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addDays(date: Date, amount: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + amount);
  return d;
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getDaysInMonth(date: Date) {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const total = end.getDate();

  return Array.from({ length: total }, (_, index) => addDays(start, index));
}

function getMiniCalendarDays(monthDate: Date) {
  const firstDay = startOfMonth(monthDate);
  const startDay = firstDay.getDay();
  const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
  const calendarStart = addDays(firstDay, mondayOffset);

  return Array.from({ length: 42 }, (_, index) =>
    addDays(calendarStart, index)
  );
}

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatMonthTitle(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function getDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
  });
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function isSameDate(a: Date, b: Date) {
  return toDateKey(a) === toDateKey(b);
}

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function formatHourLabel(hour: number) {
  if (hour === 24) return "24:00";
  return `${String(hour).padStart(2, "0")}:00`;
}

function getShiftTimelineStyle(shift: Shift) {
  const dayStartMinutes = DAY_START_HOUR * 60;
  const dayEndMinutes = DAY_END_HOUR * 60;
  const totalMinutes = dayEndMinutes - dayStartMinutes;

  const shiftStart = Math.max(timeToMinutes(shift.startTime), dayStartMinutes);
  const shiftEnd = Math.min(timeToMinutes(shift.endTime), dayEndMinutes);

  const left = ((shiftStart - dayStartMinutes) / totalMinutes) * 100;
  const width = ((shiftEnd - shiftStart) / totalMinutes) * 100;

  return {
    left: `${left}%`,
    width: `${Math.max(width, 3)}%`,
  };
}

function getRangeTitle(viewMode: ViewMode, selectedDate: Date) {
  if (viewMode === "DAY") {
    return selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (viewMode === "WEEK") {
    const start = startOfWeek(selectedDate);
    const end = addDays(start, 6);

    const startText = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const endText = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return `${startText} - ${endText}`;
  }

  return formatMonthTitle(selectedDate);
}

function statusStyle(status: ShiftStatus) {
  if (status === "APPROVED") {
    return "border-emerald-300 bg-emerald-50 text-emerald-800";
  }

  if (status === "PUBLISHED") {
    return "border-blue-300 bg-blue-50 text-blue-800";
  }

  return "border-amber-300 bg-amber-50 text-amber-800";
}

function statusBadgeStyle(status: ShiftStatus) {
  if (status === "APPROVED") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "PUBLISHED") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-amber-100 text-amber-700";
}

function getDisplayedDays(viewMode: ViewMode, selectedDate: Date) {
  if (viewMode === "DAY") {
    return [selectedDate];
  }

  if (viewMode === "WEEK") {
    const start = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }

  return getDaysInMonth(selectedDate);
}

function getCalendarMinWidth(viewMode: ViewMode, dayCount: number) {
  if (viewMode === "DAY") return "1280px";
  if (viewMode === "WEEK") return "1120px";
  return `${Math.max(3600, 260 + dayCount * 110)}px`;
}

function getGridTemplate(viewMode: ViewMode, dayCount: number) {
  if (viewMode === "WEEK") {
    return "260px repeat(7,minmax(140px,1fr))";
  }

  return `260px repeat(${dayCount},110px)`;
}

function getFilteredStaff({
  staff,
  query,
  selectedStaffId,
}: {
  staff: Staff[];
  query: string;
  selectedStaffId: string;
}) {
  return staff.filter((item) => {
    const search = query.toLowerCase();

    const matchesQuery =
      item.name.toLowerCase().includes(search) ||
      item.staffId.toLowerCase().includes(search) ||
      item.role.toLowerCase().includes(search) ||
      item.branch.toLowerCase().includes(search);

    const matchesStaff =
      selectedStaffId === "ALL" || item.staffId === selectedStaffId;

    return matchesQuery && matchesStaff && item.status === "ACTIVE";
  });
}

function MonthCalendarDialog({
  open,
  month,
  selectedDate,
  shifts,
  onClose,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: {
  open: boolean;
  month: Date;
  selectedDate: Date;
  shifts: Shift[];
  onClose: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: Date) => void;
}) {
  if (!open) return null;

  const days = getMiniCalendarDays(month);
  const shiftDateSet = new Set(shifts.map((shift) => shift.date));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 className="text-xl font-black">Select Date</h2>
            <p className="text-sm text-slate-500">
              Date ကိုရွေးပြီး Day / Week / Month view မှာ shift ထည့်နိုင်ပါတယ်။
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border hover:bg-slate-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onPrevMonth}
              className="flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-bold hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            <div className="text-center">
              <p className="text-lg font-black">{formatMonthTitle(month)}</p>
              <p className="text-xs text-slate-500">
                Dot ပါတဲ့နေ့တွေမှာ shift ရှိပါတယ်
              </p>
            </div>

            <button
              type="button"
              onClick={onNextMonth}
              className="flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-bold hover:bg-slate-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="py-2 text-xs font-black uppercase text-slate-400"
              >
                {day}
              </div>
            ))}

            {days.map((date) => {
              const dateKey = toDateKey(date);
              const inMonth = isSameMonth(date, month);
              const isToday = isSameDate(date, new Date());
              const isSelected = isSameDate(date, selectedDate);
              const hasShift = shiftDateSet.has(dateKey);

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => onSelectDate(date)}
                  className={[
                    "relative flex h-14 items-center justify-center rounded-2xl border text-sm font-black transition",
                    inMonth ? "text-slate-800" : "text-slate-300",
                    isSelected
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 hover:border-slate-400 hover:bg-slate-50",
                    isToday && !isSelected ? "border-slate-950" : "",
                  ].join(" ")}
                >
                  {date.getDate()}

                  {hasShift ? (
                    <span
                      className={[
                        "absolute bottom-2 h-1.5 w-1.5 rounded-full",
                        isSelected ? "bg-white" : "bg-blue-500",
                      ].join(" ")}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DayTimelineView({
  staff,
  shifts,
  selectedDate,
  query,
  selectedStaffId,
  onAddShift,
  onEditShift,
}: {
  staff: Staff[];
  shifts: Shift[];
  selectedDate: Date;
  query: string;
  selectedStaffId: string;
  onAddShift: (staffId: string, date: string) => void;
  onEditShift: (shift: Shift) => void;
}) {
  const dateKey = toDateKey(selectedDate);

  const filteredStaff = getFilteredStaff({
    staff,
    query,
    selectedStaffId,
  });

  const hourColumns = DAY_END_HOUR - DAY_START_HOUR;
  const timelineGridTemplateColumns = `repeat(${hourColumns}, minmax(70px, 1fr))`;

  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-sm">
      <div className="overflow-auto">
        <div className="min-w-[1280px]">
          <div className="grid grid-cols-[260px_1fr] border-b bg-slate-50">
            <div className="sticky left-0 z-20 border-r bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Users className="h-4 w-4" />
                Staff
              </div>
            </div>

            <div
              className="grid"
              style={{ gridTemplateColumns: timelineGridTemplateColumns }}
            >
              {DAY_TIMELINE_HOURS.slice(0, -1).map((hour) => (
                <div
                  key={hour}
                  className="border-r p-3 text-center text-xs font-black text-slate-500"
                >
                  {formatHourLabel(hour)}
                </div>
              ))}
            </div>
          </div>

          <div className="max-h-[720px] overflow-auto">
            {filteredStaff.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Staff မတွေ့ပါ။
              </div>
            ) : (
              filteredStaff.map((person) => {
                const shift = shifts.find(
                  (item) =>
                    item.staffId === person.staffId && item.date === dateKey
                );

                return (
                  <div
                    key={person.staffId}
                    className="grid grid-cols-[260px_1fr] border-b last:border-b-0"
                  >
                    <div className="sticky left-0 z-10 border-r bg-white p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-sm font-black text-slate-800">
                          {person.name.slice(0, 1)}
                        </div>

                        <div>
                          <p className="font-bold">{person.name}</p>
                          <p className="text-xs text-slate-500">
                            {person.staffId}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                              {person.role}
                            </span>

                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                              {person.branch}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative min-h-[125px] bg-slate-50/40">
                      <div
                        className="absolute inset-0 grid"
                        style={{
                          gridTemplateColumns: timelineGridTemplateColumns,
                        }}
                      >
                        {DAY_TIMELINE_HOURS.slice(0, -1).map((hour) => (
                          <button
                            key={hour}
                            type="button"
                            onClick={() => onAddShift(person.staffId, dateKey)}
                            className="border-r border-slate-200 transition hover:bg-slate-100/70"
                            title={`${person.name} - ${formatHourLabel(hour)}`}
                          />
                        ))}
                      </div>

                      {!shift ? (
                        <button
                          type="button"
                          onClick={() => onAddShift(person.staffId, dateKey)}
                          className="absolute left-4 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-400 shadow-sm hover:border-slate-500 hover:text-slate-700"
                        >
                          <Plus className="h-4 w-4" />
                          Add Shift
                        </button>
                      ) : null}

                      {shift ? (
                        <button
                          type="button"
                          onClick={() => onEditShift(shift)}
                          style={getShiftTimelineStyle(shift)}
                          className={`absolute top-1/2 z-20 min-w-[120px] -translate-y-1/2 rounded-2xl border px-4 py-3 text-left shadow-md transition hover:scale-[1.01] ${statusStyle(
                            shift.status
                          )}`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusBadgeStyle(
                                shift.status
                              )}`}
                            >
                              {shift.status}
                            </span>

                            <Edit3 className="h-4 w-4 opacity-70" />
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-sm font-black">
                            <Clock className="h-4 w-4" />
                            {shift.startTime} - {shift.endTime}
                          </div>

                          <p className="mt-1 truncate text-xs font-semibold opacity-80">
                            {shift.role}
                          </p>
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffShiftCalendarPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  const [viewMode, setViewMode] = useState<ViewMode>("WEEK");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("ALL");

  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<Shift["id"] | null>(
    null
  );

  const [form, setForm] = useState<ShiftPayload>({
    staffId: "",
    date: "",
    startTime: "09:00",
    endTime: "17:00",
    role: "Cashier",
    note: "",
    status: "DRAFT",
  });

  const [staffLoading, setStaffLoading] = useState(false);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const displayedDays = useMemo(() => {
    return getDisplayedDays(viewMode, selectedDate);
  }, [viewMode, selectedDate]);

  const displayedDateKeys = useMemo(() => {
    return displayedDays.map(toDateKey);
  }, [displayedDays]);

  const rangeFrom = displayedDateKeys[0];
  const rangeTo = displayedDateKeys[displayedDateKeys.length - 1];

  const filteredStaff = useMemo(() => {
    return getFilteredStaff({
      staff,
      query,
      selectedStaffId,
    });
  }, [staff, query, selectedStaffId]);

  const totalRangeShifts = useMemo(() => {
    return shifts.filter((shift) => displayedDateKeys.includes(shift.date))
      .length;
  }, [shifts, displayedDateKeys]);

  const draftCount = useMemo(() => {
    return shifts.filter(
      (shift) =>
        displayedDateKeys.includes(shift.date) && shift.status === "DRAFT"
    ).length;
  }, [shifts, displayedDateKeys]);

  const calendarMinWidth = getCalendarMinWidth(viewMode, displayedDays.length);
  const gridTemplateColumns = getGridTemplate(viewMode, displayedDays.length);

  async function loadStaff() {
    try {
      setStaffLoading(true);
      setError("");

      const response = await fetch(STAFF_ENDPOINT, {
        method: "GET",
        headers: authHeaders(),
      });

      const data = await readJsonOrThrow<any[]>(response);
      setStaff(Array.isArray(data) ? data.map(normalizeStaff) : []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Staff data load မရပါ။";
      setError(message);
    } finally {
      setStaffLoading(false);
    }
  }

  async function loadShifts(from = rangeFrom, to = rangeTo) {
    if (!from || !to) return;

    try {
      setShiftsLoading(true);
      setError("");

      const url = `${SHIFT_ENDPOINT}?from=${encodeURIComponent(
        from
      )}&to=${encodeURIComponent(to)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: authHeaders(),
      });

      const data = await readJsonOrThrow<any[]>(response);
      setShifts(Array.isArray(data) ? data.map(normalizeShift) : []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Shift data load မရပါ။";
      setError(message);
    } finally {
      setShiftsLoading(false);
    }
  }

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    loadShifts(rangeFrom, rangeTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeFrom, rangeTo]);

  function getShift(staffId: string, dateKey: string) {
    return shifts.find(
      (shift) => shift.staffId === staffId && shift.date === dateKey
    );
  }

  function openCreateDialog(staffId: string, date: string) {
    const staffInfo = staff.find((item) => item.staffId === staffId);

    setEditingShiftId(null);
    setForm({
      staffId,
      date,
      startTime: "09:00",
      endTime: "17:00",
      role: staffInfo?.role || "Cashier",
      note: "",
      status: "DRAFT",
    });
    setShiftDialogOpen(true);
  }

  function openEditDialog(shift: Shift) {
    setEditingShiftId(shift.id);
    setForm({
      staffId: shift.staffId,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      role: shift.role,
      note: shift.note || "",
      status: shift.status,
    });
    setShiftDialogOpen(true);
  }

  function closeShiftDialog() {
    setShiftDialogOpen(false);
    setEditingShiftId(null);
  }

  async function saveShift() {
    if (!form.staffId || !form.date || !form.startTime || !form.endTime) {
      alert("Staff, date, start time, end time မဖြစ်မနေထည့်ပါ။");
      return;
    }

    if (form.startTime >= form.endTime) {
      alert("End time က Start time ထက်နောက်ကျရပါမယ်။");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const isEdit = editingShiftId !== null;

      const response = await fetch(
        isEdit
          ? `${SHIFT_ENDPOINT}/${encodeURIComponent(String(editingShiftId))}`
          : SHIFT_ENDPOINT,
        {
          method: isEdit ? "PUT" : "POST",
          headers: authHeaders(),
          body: JSON.stringify(form),
        }
      );

      const saved = await readJsonOrThrow<any>(response);
      const normalized = normalizeShift(saved);

      setShifts((prev) => {
        if (isEdit) {
          return prev.map((item) =>
            String(item.id) === String(editingShiftId) ? normalized : item
          );
        }

        return [...prev, normalized];
      });

      closeShiftDialog();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Shift save မရပါ။";
      setError(message);
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteShift() {
    if (!editingShiftId) return;

    const ok = confirm("ဒီ shift ကို ဖျက်မှာသေချာလား?");
    if (!ok) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${SHIFT_ENDPOINT}/${encodeURIComponent(String(editingShiftId))}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      await readJsonOrThrow<any>(response);

      setShifts((prev) =>
        prev.filter((shift) => String(shift.id) !== String(editingShiftId))
      );

      closeShiftDialog();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Shift delete မရပါ။";
      setError(message);
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  async function publishCurrentRange() {
    if (!rangeFrom || !rangeTo) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(`${SHIFT_ENDPOINT}/publish`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          from: rangeFrom,
          to: rangeTo,
        }),
      });

      await readJsonOrThrow<any>(response);
      await loadShifts(rangeFrom, rangeTo);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Publish မလုပ်နိုင်ပါ။";
      setError(message);
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  function goPrevious() {
    if (viewMode === "DAY") {
      const nextDate = addDays(selectedDate, -1);
      setSelectedDate(nextDate);
      setCalendarMonth(nextDate);
      return;
    }

    if (viewMode === "WEEK") {
      const nextDate = addDays(selectedDate, -7);
      setSelectedDate(nextDate);
      setCalendarMonth(nextDate);
      return;
    }

    const nextDate = addMonths(selectedDate, -1);
    setSelectedDate(nextDate);
    setCalendarMonth(nextDate);
  }

  function goNext() {
    if (viewMode === "DAY") {
      const nextDate = addDays(selectedDate, 1);
      setSelectedDate(nextDate);
      setCalendarMonth(nextDate);
      return;
    }

    if (viewMode === "WEEK") {
      const nextDate = addDays(selectedDate, 7);
      setSelectedDate(nextDate);
      setCalendarMonth(nextDate);
      return;
    }

    const nextDate = addMonths(selectedDate, 1);
    setSelectedDate(nextDate);
    setCalendarMonth(nextDate);
  }

  function goToday() {
    const today = new Date();
    setSelectedDate(today);
    setCalendarMonth(today);
  }

  function selectDateFromCalendar(date: Date) {
    setSelectedDate(date);
    setCalendarMonth(date);
    setCalendarDialogOpen(false);
  }

  function selectDateFromInput(dateKey: string) {
    if (!dateKey) return;

    const nextDate = dateKeyToLocalDate(dateKey);
    setSelectedDate(nextDate);
    setCalendarMonth(nextDate);
  }
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-950 md:p-6">
      <div className="mx-auto max-w-[1700px] space-y-4">
        <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow">
                <CalendarDays className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Staff Shift Calendar
                </h1>
                <p className="text-sm text-slate-500">
                  API နဲ့ချိတ်ထားပြီး Day / Week / Month view ဖြင့် staff
                  shifts များကို ထည့်သွင်းနိုင်ပါတယ်။
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:flex md:items-center">
              <div className="rounded-2xl border bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Current View</p>
                <p className="text-sm font-bold">{viewMode}</p>
              </div>

              <div className="rounded-2xl border bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Range</p>
                <p className="text-sm font-bold">
                  {getRangeTitle(viewMode, selectedDate)}
                </p>
              </div>

              <div className="rounded-2xl border bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Shifts</p>
                <p className="text-sm font-bold">{totalRangeShifts}</p>
              </div>

              <div className="rounded-2xl border bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Draft</p>
                <p className="text-sm font-bold">{draftCount}</p>
              </div>

              <button
                type="button"
                onClick={publishCurrentRange}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Publish
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        ) : null}

        <div className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search staff..."
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none ring-0 focus:border-slate-400 md:w-72"
                />
              </div>

              <select
                value={selectedStaffId}
                onChange={(event) => setSelectedStaffId(event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-slate-400"
              >
                <option value="ALL">All Staff</option>
                {staff.map((item) => (
                  <option key={item.staffId} value={item.staffId}>
                    {item.staffId} - {item.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={toDateKey(selectedDate)}
                onChange={(event) => selectDateFromInput(event.target.value)}
                className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-slate-400"
              />

              <div className="flex rounded-2xl border bg-slate-50 p-1">
                {(["DAY", "WEEK", "MONTH"] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewMode(mode)}
                    className={[
                      "h-9 rounded-xl px-4 text-sm font-bold transition",
                      viewMode === mode
                        ? "bg-slate-950 text-white shadow"
                        : "text-slate-500 hover:bg-white hover:text-slate-900",
                    ].join(" ")}
                  >
                    {mode === "DAY"
                      ? "Day"
                      : mode === "WEEK"
                      ? "Week"
                      : "Month"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
               <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border bg-white px-4 text-sm font-semibold hover:bg-slate-50"
             
            >
              <Store className="h-4 w-4" />
              Dashboard
            </button>

              <button
                type="button"
                onClick={goPrevious}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border bg-white px-4 text-sm font-semibold hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>

              <button
                type="button"
                onClick={goToday}
                className="inline-flex h-11 items-center rounded-2xl border bg-white px-4 text-sm font-semibold hover:bg-slate-50"
              >
                Today
              </button>

              <button
                type="button"
                onClick={goNext}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border bg-white px-4 text-sm font-semibold hover:bg-slate-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setCalendarDialogOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white shadow hover:bg-slate-800"
              >
                <CalendarDays className="h-4 w-4" />
                Open Calendar
              </button>

              <button
                type="button"
                onClick={() => {
                  loadStaff();
                  loadShifts(rangeFrom, rangeTo);
                }}
                className="inline-flex h-11 items-center gap-2 rounded-2xl border bg-white px-4 text-sm font-semibold hover:bg-slate-50"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {staffLoading || shiftsLoading ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-white/70 bg-white p-10 text-sm font-bold text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading...
          </div>
        ) : viewMode === "DAY" ? (
          <DayTimelineView
            staff={staff}
            shifts={shifts}
            selectedDate={selectedDate}
            query={query}
            selectedStaffId={selectedStaffId}
            onAddShift={openCreateDialog}
            onEditShift={openEditDialog}
          />
        ) : (
          <div className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-sm">
            <div className="overflow-auto">
              <div style={{ minWidth: calendarMinWidth }}>
                <div
                  className="grid border-b bg-slate-50"
                  style={{ gridTemplateColumns }}
                >
                  <div className="sticky left-0 z-20 border-r bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Users className="h-4 w-4" />
                      Staff
                    </div>
                  </div>

                  {displayedDays.map((date) => {
                    const dateKey = toDateKey(date);
                    const isToday = dateKey === toDateKey(new Date());

                    return (
                      <div
                        key={dateKey}
                        className={`border-r p-4 text-center last:border-r-0 ${
                          isToday ? "bg-slate-950 text-white" : "bg-slate-50"
                        }`}
                      >
                        <p className="text-xs font-semibold uppercase opacity-70">
                          {getDayLabel(date)}
                        </p>

                        <p className="text-lg font-black">
                          {viewMode === "MONTH"
                            ? date.getDate()
                            : formatDisplayDate(date)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="max-h-[700px] overflow-auto">
                  {filteredStaff.length === 0 ? (
                    <div className="p-10 text-center text-sm text-slate-500">
                      Staff မတွေ့ပါ။
                    </div>
                  ) : (
                    filteredStaff.map((person) => (
                      <div
                        key={person.staffId}
                        className="grid border-b last:border-b-0"
                        style={{ gridTemplateColumns }}
                      >
                        <div className="sticky left-0 z-10 border-r bg-white p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-sm font-black text-slate-800">
                              {person.name.slice(0, 1)}
                            </div>

                            <div>
                              <p className="font-bold">{person.name}</p>
                              <p className="text-xs text-slate-500">
                                {person.staffId}
                              </p>

                              <div className="mt-2 flex flex-wrap gap-1">
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                                  {person.role}
                                </span>

                                <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                                  {person.branch}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {displayedDays.map((date) => {
                          const dateKey = toDateKey(date);
                          const shift = getShift(person.staffId, dateKey);
                          const cellHeight =
                            viewMode === "MONTH"
                              ? "min-h-[118px]"
                              : "min-h-[150px]";

                          return (
                            <div
                              key={`${person.staffId}-${dateKey}`}
                              className={`${cellHeight} border-r bg-slate-50/40 p-2 last:border-r-0`}
                            >
                              {shift ? (
                                <button
                                  type="button"
                                  onClick={() => openEditDialog(shift)}
                                  className={`h-full w-full rounded-2xl border p-3 text-left shadow-sm transition hover:scale-[1.01] hover:shadow-md ${statusStyle(
                                    shift.status
                                  )}`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span
                                      className={`rounded-full px-2 py-1 text-[10px] font-bold ${statusBadgeStyle(
                                        shift.status
                                      )}`}
                                    >
                                      {viewMode === "MONTH"
                                        ? shift.status.slice(0, 1)
                                        : shift.status}
                                    </span>

                                    <Edit3 className="h-4 w-4 opacity-70" />
                                  </div>

                                  <div className="mt-3 space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-black">
                                      <Clock className="h-3.5 w-3.5" />
                                      {shift.startTime}
                                      {viewMode !== "MONTH"
                                        ? ` - ${shift.endTime}`
                                        : ""}
                                    </div>

                                    <p className="truncate text-xs font-semibold opacity-80">
                                      {shift.role}
                                    </p>

                                    {viewMode !== "MONTH" && shift.note ? (
                                      <p className="line-clamp-2 text-xs opacity-70">
                                        {shift.note}
                                      </p>
                                    ) : null}
                                  </div>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openCreateDialog(person.staffId, dateKey)
                                  }
                                  className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/70 text-xs font-semibold text-slate-400 transition hover:border-slate-500 hover:bg-white hover:text-slate-700"
                                >
                                  <Plus className="h-4 w-4" />
                                  {viewMode === "MONTH" ? "Add" : "Add Shift"}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <MonthCalendarDialog
        open={calendarDialogOpen}
        month={calendarMonth}
        selectedDate={selectedDate}
        shifts={shifts}
        onClose={() => setCalendarDialogOpen(false)}
        onPrevMonth={() => setCalendarMonth((prev) => addMonths(prev, -1))}
        onNextMonth={() => setCalendarMonth((prev) => addMonths(prev, 1))}
        onSelectDate={selectDateFromCalendar}
      />

      {shiftDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-black">
                  {editingShiftId ? "Edit Shift" : "Add New Shift"}
                </h2>

                <p className="text-sm text-slate-500">
                  Staff shift အချိန်၊ role၊ status များကို ထည့်ပါ။
                </p>
              </div>

              <button
                type="button"
                onClick={closeShiftDialog}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold">Staff</label>

                <select
                  value={form.staffId}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      staffId: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border px-4 text-sm outline-none focus:border-slate-500"
                >
                  <option value="">Select staff</option>
                  {staff.map((item) => (
                    <option key={item.staffId} value={item.staffId}>
                      {item.staffId} - {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Date</label>

                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border px-4 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Start Time</label>

                <input
                  type="time"
                  value={form.startTime}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      startTime: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border px-4 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">End Time</label>

                <input
                  type="time"
                  value={form.endTime}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      endTime: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border px-4 text-sm outline-none focus:border-slate-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Role</label>

                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      role: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border px-4 text-sm outline-none focus:border-slate-500"
                >
                  <option value="Cashier">Cashier</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Waiter">Waiter</option>
                  <option value="Manager">Manager</option>
                  <option value="Stock">Stock</option>
                  <option value="Delivery">Delivery</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold">Status</label>

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      status: event.target.value as ShiftStatus,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border px-4 text-sm outline-none focus:border-slate-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="APPROVED">Approved</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold">Note</label>

                <textarea
                  value={form.note}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      note: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="ဥပမာ - Morning shift / Night shift / Special note"
                  className="w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none focus:border-slate-500"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t p-5 md:flex-row md:items-center md:justify-between">
              <div>
                {editingShiftId ? (
                  <button
                    type="button"
                    onClick={deleteShift}
                    disabled={saving}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-5 text-sm font-bold text-red-700 hover:bg-red-100 disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Shift
                  </button>
                ) : null}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeShiftDialog}
                  disabled={saving}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border px-5 text-sm font-bold hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveShift}
                  disabled={saving}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Shift
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}