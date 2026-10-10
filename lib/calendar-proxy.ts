import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { validCalendarDate } from "@/lib/calendar-api";

export async function proxyCalendar(req: NextRequest, id?: string) {
  const jsonError = (message: string, status: number) => NextResponse.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
  const session = await getServerSession(authOptions);
  const token = (session as unknown as { accessToken?: string } | null)?.accessToken;
  if (!token) return jsonError("Session expired. Sign in again.", 401);
  if (id !== undefined && !/^[1-9]\d*$/.test(id)) return jsonError("Invalid entry ID.", 400);
  const query = new URL(req.url).searchParams;
  const forwarded = new URLSearchParams();
  if (!id && req.method === "GET") {
    const from = query.get("from"), to = query.get("to");
    if (!validCalendarDate(from) || !validCalendarDate(to) || from > to) return jsonError("Valid from/to dates are required.", 400);
    forwarded.set("from", from); forwarded.set("to", to);
  }
  if (req.method === "DELETE") {
    const version = query.get("version");
    if (!version || !/^\d+$/.test(version) || !Number.isSafeInteger(Number(version))) return jsonError("A valid last-read version is required.", 400);
    forwarded.set("version", version);
  }
  let body: string | undefined;
  if (["POST", "PUT"].includes(req.method)) {
    try {
      const input = await req.json();
      if (!input || typeof input !== "object" || Array.isArray(input)) return jsonError("JSON object required.", 400);
      if (req.method === "PUT" && (!Number.isSafeInteger(input.version) || input.version < 0)) return jsonError("A valid last-read version is required.", 400);
      const fields = ["title", "note", "kind", "priority", "date", "endDate", "time", "endTime", "assignee", "completed", ...(req.method === "PUT" ? ["version"] : [])];
      body = JSON.stringify(Object.fromEntries(fields.filter(k => k in input).map(k => [k, input[k]])));
    } catch { return jsonError("Invalid JSON request body.", 400); }
  }
  try {
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.REMOTE_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");
    const url = `${base.endsWith("/api") ? base : `${base}/api`}/calendar/entries${id ? `/${encodeURIComponent(id)}` : ""}?${forwarded}`;
    const response = await fetch(url, { method: req.method, headers: { Accept: "application/json", Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}`, ...(body ? { "Content-Type": "application/json" } : {}) }, body, cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (response.status === 204) return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
    const text = await response.text();
    let payload; try { payload = JSON.parse(text); } catch { payload = { message: response.ok ? "Unexpected backend response." : `Calendar backend request failed (HTTP ${response.status}).` }; }
    return NextResponse.json(payload, { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch { return jsonError("Could not connect to calendar backend. Retry the request.", 502); }
}
