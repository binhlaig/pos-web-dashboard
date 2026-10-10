import { NextRequest } from "next/server";
import { proxyCalendar } from "@/lib/calendar-proxy";
export const dynamic = "force-dynamic";
export function GET(req: NextRequest) { return proxyCalendar(req); }
export function POST(req: NextRequest) { return proxyCalendar(req); }
