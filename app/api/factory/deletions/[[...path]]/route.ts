import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Context = { params: Promise<{ path?: string[] }> };
const validId = (value: string) => /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));
const modules = new Set(["warehouses", "locations", "receivings", "costings", "costing-items", "productions", "packing-products"]);
const fail = (message: string, status: number) => NextResponse.json({ message }, { status, headers: { "Cache-Control": "no-store" } });

async function proxy(req: NextRequest, context: Context) {
  const path = (await context.params).path ?? [];
  const method = req.method;
  const [module, id, action] = path;
  const eligibility = path.length === 3 && modules.has(module) && validId(id) && action === "eligibility";
  const deletion = path.length === 2 && modules.has(module) && validId(id);
  const archives = path.length === 2 && module === "packing-products" && id === "archives";
  const archiveAction = path.length === 3 && module === "packing-products" && validId(id) && ["archive", "restore"].includes(action);
  if (!((eligibility || archives) && method === "GET" || deletion && method === "DELETE" || archiveAction && method === "POST")) return fail("Unknown Factory deletion endpoint", 404);

  const writing = method !== "GET";
  if (writing && (req.headers.get("origin") !== req.nextUrl.origin || req.headers.get("sec-fetch-site") === "cross-site")) return fail("Same-origin request required", 403);
  const headers = new Headers({ Accept: "application/json" });
  let body: string | undefined;
  if (writing) {
    if (!(req.headers.get("content-type") || "").includes("application/json")) return fail("JSON body required", 415);
    const reader = req.body?.getReader();
    if (!reader) return fail("JSON body required", 400);
    const chunks: Uint8Array[] = []; let size = 0;
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 65536) { await reader.cancel(); return fail("Request too large", 413); }
      chunks.push(value);
    }
    const data = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.length; }
    body = new TextDecoder().decode(data);
    try { const json: unknown = JSON.parse(body); if (!json || typeof json !== "object" || Array.isArray(json)) return fail("Object body required", 400); }
    catch { return fail("Invalid JSON", 400); }
    headers.set("Content-Type", "application/json");
  }

  try {
    const session = await getServerSession(authOptions);
    const token = (session as unknown as { accessToken?: string } | null)?.accessToken;
    if (!token) return fail("Session expired; sign in again", 401);
    headers.set("Authorization", `Bearer ${token.replace(/^Bearer\s+/i, "")}`);
    const base = (process.env.REMOTE_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");
    const upstream = new URL(`${base.endsWith("/api") ? base : `${base}/api`}/factory/deletions/${path.map(encodeURIComponent).join("/")}`);
    if (method === "GET") {
      const keys = eligibility && module === "packing-products" ? ["costingSheetId", "sourceVersion", "warehouseId", "locationId", "batch"] : [];
      for (const [key, value] of req.nextUrl.searchParams) {
        if (!keys.includes(key)) return fail("Unsupported query parameter", 400);
        upstream.searchParams.append(key, value);
      }
      if (eligibility && module === "packing-products" && keys.some(k => !req.nextUrl.searchParams.has(k))) return fail("Packing stock identity required", 400);
    }
    const response = await fetch(upstream, { method, headers, body, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(25000) });
    const payload: unknown = await response.json().catch(() => null);
    if (payload === null) return fail("Invalid backend JSON response; operation result may be uncertain", 502);
    return NextResponse.json(payload, { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return fail("Backend connection failed; verify the record before retrying", 502);
  }
}
export const GET = proxy;
export const POST = proxy;
export const DELETE = proxy;
