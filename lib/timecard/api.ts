// @/lib/timecard/api.ts

// CASE A (Next.js Route Handlers inside the same app):
//   - Leave NEXT_PUBLIC_API_URL undefined (or set to an empty string).
//   - Requests go to same-origin:  "" + "/api" + path  =>  "/api/..."
//
// CASE B (External backend e.g. http://localhost:8000):
//   - Set NEXT_PUBLIC_API_URL="http://localhost:8000" (NO trailing /api).
//   - Requests go to "http://localhost:8000/api" + path.

const RUNTIME_ORIGIN =
  typeof window !== "undefined" ? window.location.origin : "";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL === undefined
    ? "" // same-origin by default (works in dev & prod)
    : process.env.NEXT_PUBLIC_API_URL || RUNTIME_ORIGIN;

// Login ပြီးရလာတဲ့ token ကို localStorage ထဲသိမ်းထားတယ်လို့ မြင်သလို:
export const authHeader = () => {
  if (typeof window === "undefined") return {};
  const t = localStorage.getItem("token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

function buildUrl(path: string, params?: Record<string, any>) {
  const qs =
    params && Object.keys(params).length
      ? "?" +
        new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)])
        ).toString()
      : "";

  // Always hit "/api/*" on the server/base
  // (API_BASE may be "" (same-origin) or absolute like "http://localhost:8000")
  const base = API_BASE.replace(/\/+$/, ""); // trim trailing slash
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${base}/api${clean}${qs}`;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    // Try to surface server error message cleanly
    let msg = `${res.status} ${res.statusText}`;
    try {
      const text = await res.text();
      msg = text || msg;
    } catch {}
    throw new Error(msg);
  }
  // Some endpoints may return empty body. Guard it.
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

export async function get<T>(path: string, params?: Record<string, any>) {
  const res = await fetch(buildUrl(path, params), {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(authHeader().Authorization ? { Authorization: authHeader().Authorization! } : {}),
    },
    credentials: "include",
  });
  return handle<T>(res);
}

export async function post<T>(path: string, body?: any) {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authHeader().Authorization ? { Authorization: authHeader().Authorization! } : {}),
    },
    body: JSON.stringify(body ?? {}),
    credentials: "include",
  });
  return handle<T>(res);
}
