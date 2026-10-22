import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { withRefreshCookieBridge } from "@/lib/session-cookie-bridge";

type Context = { params: Promise<{ path?: string[] }> };

export function createFactoryRawProxy(resource: "raw-materials" | "raw-receivings") {
  return withRefreshCookieBridge(async (req: NextRequest, context: unknown) => {
    const error = (message: string, status: number) =>
      NextResponse.json({ message }, { status, headers: { "Cache-Control": "no-store" } });
    const { path = [] } = await (context as Context).params;
    // Keep catch-all requests inside the selected backend resource.
    if (path.some(segment => !segment || segment === "." || segment === ".." || /[/\\]/.test(segment)))
      return error("Invalid raw material API path.", 400);
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      if (req.headers.get("origin") !== new URL(req.url).origin || req.headers.get("sec-fetch-site") === "cross-site")
        return error("Same-origin request required.", 403);
    }
    // NextAuth owns access-token refresh; the bridge forwards rotated refresh cookies.
    const session = await getServerSession(authOptions);
    const token = (session as unknown as { accessToken?: string } | null)?.accessToken;
    if (!token) return error("Session expired. Sign in again.", 401);
    const headers = new Headers({
      Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}`,
      Accept: "application/json",
    });
    for (const name of ["content-type", "idempotency-key", "if-match"]) {
      const value = req.headers.get(name);
      if (value !== null) headers.set(name, value);
    }
    try {
      const base = (process.env.REMOTE_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080").replace(/\/+$/, "");
      const url = `${base.endsWith("/api") ? base : `${base}/api`}/factory/${resource}${path.length ? `/${path.map(encodeURIComponent).join("/")}` : ""}${req.nextUrl.search}`;
      const upstream = await fetch(url, {
        method: req.method,
        headers,
        body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer(),
        cache: "no-store",
        signal: AbortSignal.timeout(35000),
        redirect: "error",
      });
      const responseHeaders = new Headers({ "Cache-Control": "no-store" });
      for (const name of ["content-type", "location", "etag", "allow", "retry-after"]) {
        const value = upstream.headers.get(name);
        if (value !== null) responseHeaders.set(name, value);
      }
      return new Response(
        req.method === "HEAD" || [204, 205, 304].includes(upstream.status) ? null : await upstream.arrayBuffer(),
        { status: upstream.status, headers: responseHeaders },
      );
    } catch {
      return error("Backend connection failed. A write may already have completed; check server records before retrying.", 502);
    }
  });
}
