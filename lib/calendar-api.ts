export type CalendarEntry = {
  id: number | ""; version: number; title: string; note: string;
  kind: "NOTE" | "DELIVERY" | "SHIFT" | "MAINTENANCE" | "PROMOTION" | "PAYMENT";
  priority: "NORMAL" | "HIGH"; date: string; endDate: string;
  time: string; endTime: string; assignee: string; completed: boolean;
  createdAt: string; updatedAt: string;
};
export class CalendarApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export function validCalendarDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}
export function decodeEntry(value: unknown): CalendarEntry {
  if (!value || typeof value !== "object") throw new Error("Unexpected calendar entry response. Retry or contact support.");
  const v = value as Record<string, unknown>;
  const optional = ["note", "time", "endTime", "assignee"];
  if (!Number.isSafeInteger(v.id) || Number(v.id) <= 0 || !Number.isSafeInteger(v.version) || Number(v.version) < 0 || typeof v.title !== "string" || !v.title.trim() || !validCalendarDate(v.date) || !validCalendarDate(v.endDate) || v.endDate < v.date || typeof v.completed !== "boolean" || !["NOTE", "DELIVERY", "SHIFT", "MAINTENANCE", "PROMOTION", "PAYMENT"].includes(String(v.kind)) || !["NORMAL", "HIGH"].includes(String(v.priority)) || optional.some(k => v[k] !== null && typeof v[k] !== "string") || ["time", "endTime"].some(k => v[k] !== null && !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(v[k]))) || ["createdAt", "updatedAt"].some(k => typeof v[k] !== "string" || !String(v[k]).endsWith("Z") || !Number.isFinite(Date.parse(String(v[k]))))) throw new Error("Unexpected calendar entry response. Retry or contact support.");
  return { ...v, ...Object.fromEntries(optional.map(k => [k, v[k] ?? ""])) } as CalendarEntry;
}
export function editableEntry(e: CalendarEntry, withVersion = false) {
  return { title: e.title.trim(), note: e.note || null, kind: e.kind, priority: e.priority, date: e.date, endDate: e.endDate, time: e.time || null, endTime: e.endTime || null, assignee: e.assignee.trim() || null, completed: e.completed, ...(withVersion ? { version: e.version } : {}) };
}
export async function calendarRequest(path = "", options: RequestInit = {}): Promise<CalendarEntry | CalendarEntry[] | null> {
  let response: Response;
  try { response = await fetch(`/api/calendar/entries${path}`, { ...options, credentials: "same-origin", cache: "no-store", headers: { Accept: "application/json", "Content-Type": "application/json" } }); }
  catch (e) { if (options.signal?.aborted) throw e; throw new CalendarApiError("Backend connection failed. Retry the request.", 502); }
  if (response.status === 204 && response.ok) {
    if (options.method === "DELETE") return null;
    throw new Error("Unexpected empty calendar response. Reload entries before retrying the change.");
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const fallback: Record<number, string> = { 400: "Calendar validation failed.", 401: "Session expired. Sign in again.", 403: "Permission denied.", 404: "Entry missing or unavailable.", 409: "Another user or device changed this entry. Load the latest entry and review before saving.", 502: "Backend connection failed. Retry the request." };
    const detail = payload?.message || payload?.detail || payload?.error;
    throw new CalendarApiError(`${fallback[response.status] || "Calendar request failed."}${typeof detail === "string" ? ` ${detail}` : ""}`, response.status);
  }
  if ((!options.method || options.method === "GET") && (!path || path.startsWith("?"))) {
    if (!Array.isArray(payload)) throw new Error("Unexpected calendar list response. Expected an array; retry or contact support.");
    const entries = payload.map(decodeEntry);
    if (new Set(entries.map(e => e.id)).size !== entries.length) throw new Error("Calendar response contains duplicate IDs.");
    return entries;
  }
  return decodeEntry(payload);
}
