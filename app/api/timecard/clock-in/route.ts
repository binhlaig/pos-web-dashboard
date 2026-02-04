// app/api/timecard/clock-in/route.ts
import { NextResponse } from "next/server";

type BreakSpan = { start: number; end?: number };
type Shift = {
  id: string;
  employeeId: string;
  date: string;     // YYYY-MM-DD
  clockIn: number;  // epoch ms
  clockOut?: number;
  breaks: BreakSpan[];
  note?: string;
};

// simple server-side util (no timezone guessing)
function toYmd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const employeeId = String(body?.employeeId || "").trim();
    const note = typeof body?.note === "string" ? body.note : undefined;

    if (!employeeId) {
      return NextResponse.json(
        { message: "employeeId is required" },
        { status: 400 }
      );
    }

    // (Optional) verify auth here if you want:
    // const auth = req.headers.get("authorization");
    // if (!auth) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const nowMs = Date.now();
    const shift: Shift = {
      id: (globalThis.crypto as any)?.randomUUID?.() ?? String(nowMs),
      employeeId,
      date: toYmd(new Date(nowMs)),
      clockIn: nowMs,
      breaks: [],
      note,
    };

    // NOTE: If you want DB persistence, write `shift` to your DB here.
    // This route currently just returns the new shift to the client.

    return NextResponse.json(shift, { status: 200 });
  } catch (e: any) {
    // Match your UI error handling (e?.message)
    const msg = e?.message || "Internal Server Error";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
