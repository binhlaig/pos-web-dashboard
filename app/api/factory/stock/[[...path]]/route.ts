import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
type Context = { params: Promise<{ path?: string[] }> };
async function proxy(req: NextRequest, ctx: Context) {
  const error = (message: string, status: number) =>
    NextResponse.json(
      { message },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  const { path = [] } = await ctx.params;
  const read =
    path.length === 1 &&
    ["balances", "history", "events", "products"].includes(path[0]);
  const map =
    path.length === 2 &&
    path[0] === "mappings" &&
    /^[1-9]\d*$/.test(path[1]) &&
    Number.isSafeInteger(Number(path[1]));
  if (!((read && req.method === "GET") || (map && req.method === "POST")))
    return error("Invalid stock API path/method.", 400);
  if (
    req.method === "POST" &&
    (req.headers.get("origin") !== new URL(req.url).origin ||
      req.headers.get("sec-fetch-site") === "cross-site")
  )
    return error("Same-origin request required.", 403);
  const session = await getServerSession(authOptions);
  const token = (session as unknown as { accessToken?: string } | null)
    ?.accessToken;
  if (!token) return error("Session expired. Sign in again.", 401);
  const events = path[0] === "events";
  const query = new URLSearchParams();
  const keys =
    path[0] === "products"
      ? ["q"]
      : ["balances", "history"].includes(path[0])
        ? ["warehouseId", "locationId", "batch", "search", "page", "size"]
        : [];
  for (const k of keys) {
    const v = req.nextUrl.searchParams.get(k);
    if (v !== null) query.set(k, v);
  }
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}`,
    Accept: events ? "text/event-stream" : "application/json",
  };
  let body: string | undefined;
  if (map) {
    try {
      const raw = await req.text();
      if (raw.length > 8192) return error("Request too large.", 413);
      const p = JSON.parse(raw);
      if (!p || typeof p !== "object" || Array.isArray(p))
        return error("JSON object required.", 400);
      body = JSON.stringify(p);
      headers["Content-Type"] = "application/json";
    } catch {
      return error("Invalid JSON.", 400);
    }
  }
  const abort = new AbortController();
  const stop = () => abort.abort();
  req.signal.addEventListener("abort", stop, { once: true });
  if (req.signal.aborted) abort.abort();
  const timeout = setTimeout(stop, events ? 45000 : 30000);
  try {
    const base = (
      process.env.REMOTE_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:8080"
    ).replace(/\/+$/, "");
    const api = base.endsWith("/api") ? base : `${base}/api`;
    const url = `${api}/${path[0] === "products" ? "products" : `factory/stock/${path.join("/")}`}${query.size ? `?${query}` : ""}`;
    const upstream = await fetch(url, {
      method: req.method,
      headers,
      body,
      signal: abort.signal,
      cache: "no-store",
      redirect: "error",
    });
    if (events && upstream.ok) {
      if (
        !upstream.headers.get("content-type")?.includes("text/event-stream") ||
        !upstream.body
      ) {
        clearTimeout(timeout);
        req.signal.removeEventListener("abort", stop);
        abort.abort();
        return error("Invalid event stream.", 502);
      }
      const reader = upstream.body.getReader();
      let closed = false;
      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearTimeout(timeout);
        req.signal.removeEventListener("abort", stop);
      };
      const stream = new ReadableStream<Uint8Array>({
        async pull(controller) {
          try {
            const { done, value } = await reader.read();
            if (done) {
              cleanup();
              controller.close();
            } else controller.enqueue(value);
          } catch (e) {
            cleanup();
            abort.abort();
            controller.error(e);
          }
        },
        async cancel() {
          cleanup();
          abort.abort();
          try {
            await reader.cancel();
          } catch {}
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-store, no-transform",
          "X-Accel-Buffering": "no",
        },
      });
    }
    const payload = await upstream.json().catch(() => null);
    clearTimeout(timeout);
    req.signal.removeEventListener("abort", stop);
    return NextResponse.json(
      payload ?? { message: "Invalid backend response." },
      {
        status: upstream.ok && payload === null ? 502 : upstream.status,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch {
    clearTimeout(timeout);
    req.signal.removeEventListener("abort", stop);
    abort.abort();
    return error(
      events
        ? "Stock event connection failed."
        : "Stock service unavailable. A submitted mapping may already exist.",
      502,
    );
  }
}
export const GET = proxy;
export const POST = proxy;
