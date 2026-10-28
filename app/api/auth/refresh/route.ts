import { NextRequest } from "next/server";
import { proxySessionRequest } from "@/lib/session-proxy";
import { getToken } from "next-auth/jwt";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { withRefreshCookieBridge } from "@/lib/session-cookie-bridge";
const nextAuthSession = withRefreshCookieBridge(NextAuth(authOptions), true);
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  let origin: string;
  try { origin = new URL(process.env.APP_FRONTEND_ORIGIN || "").origin; }
  catch {
    console.error("[Session refresh]", { stage: "route", reason: "MISSING_CONFIGURATION", upstreamStatus: null });
    return Response.json({ reason: "MISSING_CONFIGURATION" }, { status: 503 });
  }
  if (request.headers.get("origin") !== origin)
    return Response.json({ error: "Allowed Origin required" }, { status: 403 });

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  // Standalone password-based staff sessions use their own HttpOnly cookie.
  // A NextAuth session must always rotate its encrypted JWT as well.
  if (!token) return proxySessionRequest(request, "refresh");
  const sessionRequest = new NextRequest(new URL("/api/auth/session", request.url), {
    headers: request.headers,
  });
  const response = await nextAuthSession(sessionRequest, { params: { nextauth: ["session"] } });
  const session = await response.json();
  const status = session?.error === "AccessTokenExpired" ? 401
    : session?.error || !session?.accessToken ? 503 : 200;
  const headers = new Headers({ "Content-Type": "application/json", "Cache-Control": "no-store" });
  for (const cookie of response.headers.getSetCookie()) headers.append("Set-Cookie", cookie);
  return Response.json(status === 200 ? { token: session.accessToken }
    : { reason: session?.refreshReason || "TEMPORARY_REFRESH_FAILURE", originalReason: session?.refreshOriginalReason,
        upstreamStatus: session?.refreshUpstreamStatus ?? null, error: session?.error }, { status, headers });
}




