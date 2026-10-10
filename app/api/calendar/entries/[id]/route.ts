import { NextRequest } from "next/server";
import { proxyCalendar } from "@/lib/calendar-proxy";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function GET(req: NextRequest, ctx: Context) { return proxyCalendar(req, (await ctx.params).id); }
export async function PUT(req: NextRequest, ctx: Context) { return proxyCalendar(req, (await ctx.params).id); }
export async function DELETE(req: NextRequest, ctx: Context) { return proxyCalendar(req, (await ctx.params).id); }
