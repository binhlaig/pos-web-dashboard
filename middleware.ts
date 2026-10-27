import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = new Set([
  "/Sign_in",
  "/sign-in",
  "/auth-bin",
  "/forgot-password",
  "/reset-password",
]);

function isStaticOrAuthPath(pathname: string) {
  return (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".")
  );
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.has(pathname) || isStaticOrAuthPath(pathname);
}

function isProtectedPath(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/")
    || pathname === "/factory" || pathname.startsWith("/factory/");
}

function isExpired(exp: unknown) {
  if (!exp) return false;

  const value = Number(exp);

  if (!Number.isFinite(value)) return false;

  return Math.floor(Date.now() / 1000) >= value;
}

function isTokenInvalid(token: any) {
  // getToken validates the NextAuth JWT. Spring access expiry is recoverable in
  // the JWT callback; AccessTokenExpired means refresh was definitively rejected.
  return (
    !token ||
    token.error === "AccessTokenExpired" ||
    isExpired(token.exp)
  );
}

function isSafeNextPath(next: string | null) {
  return !!next && next.startsWith("/") && !next.startsWith("//") &&
    !/[\\\x00-\x20\x7f]/.test(next);
}

function redirectToSignIn(req: NextRequest) {
  const url = req.nextUrl.clone();

  url.pathname = "/Sign_in";
  url.search = "";

  if (req.nextUrl.pathname !== "/") {
    url.searchParams.set(
      "next",
      `${req.nextUrl.pathname}${req.nextUrl.search}`
    );
  }

  return NextResponse.redirect(url);
}

function redirectToDashboardOrNext(req: NextRequest) {
  const nextParam = req.nextUrl.searchParams.get("next");
  let target = "/dashboard";
  if (isSafeNextPath(nextParam)) {
    const candidate = new URL(nextParam!, req.url);
    if (
      candidate.origin === new URL(req.url).origin &&
      candidate.pathname !== "/Sign_in" && candidate.pathname !== "/sign-in"
    ) target = `${candidate.pathname}${candidate.search}${candidate.hash}`;
  }

  return NextResponse.redirect(new URL(target, req.url));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isStaticOrAuthPath(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  }).catch(() => null);

  const invalid = isTokenInvalid(token);

  // Root route
  if (pathname === "/") {
    if (invalid) {
      return NextResponse.redirect(new URL("/Sign_in", req.url));
    }

    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Sign_in page
  // Token မှန်နေရင် /Sign_in မှာမနေစေဘဲ dashboard သို့မဟုတ် next ကိုပို့မယ်
  if (pathname === "/Sign_in" || pathname === "/sign-in") {
    if (!invalid) {
      return redirectToDashboardOrNext(req);
    }

    return NextResponse.next();
  }

  // Dashboard protected routes
  if (isProtectedPath(pathname)) {
    if (invalid) {
      return redirectToSignIn(req);
    }

    return NextResponse.next();
  }

  // Other public pages
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};




