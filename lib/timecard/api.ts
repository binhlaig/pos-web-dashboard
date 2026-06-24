
// // @/lib/timecard/api.ts
// import { getAccessToken } from "@/app/timecard/auth";

// const RUNTIME_ORIGIN =
//   typeof window !== "undefined" ? window.location.origin : "";

// export const API_BASE =
//   process.env.NEXT_PUBLIC_API_URL === undefined
//     ? ""
//     : process.env.NEXT_PUBLIC_API_URL || RUNTIME_ORIGIN;

// async function authHeader(): Promise<Record<string, string>> {
//   const t = await getAccessToken();
//   return t ? { Authorization: `Bearer ${t}` } : {};
// }

// function buildUrl(path: string, params?: Record<string, any>) {
//   const qs =
//     params && Object.keys(params).length
//       ? "?" +
//         new URLSearchParams(
//           Object.entries(params).map(([k, v]) => [k, String(v)])
//         ).toString()
//       : "";

//   const base = API_BASE.replace(/\/+$/, "");
//   const clean = path.startsWith("/") ? path : `/${path}`;
//   return `${base}/api${clean}${qs}`;
// }

// async function handle<T>(res: Response): Promise<T> {
//   if (!res.ok) {
//     let msg = `${res.status} ${res.statusText}`;
//     try {
//       const text = await res.text();
//       msg = text || msg;
//     } catch {}
//     throw new Error(msg);
//   }

//   const text = await res.text();
//   return (text ? JSON.parse(text) : {}) as T;
// }

// export async function get<T>(path: string, params?: Record<string, any>) {
//   const headers = await authHeader();

//   const res = await fetch(buildUrl(path, params), {
//     method: "GET",
//     headers: {
//       Accept: "application/json",
//       ...headers,
//     },
//     credentials: "include",
//   });

//   return handle<T>(res);
// }

// export async function post<T>(path: string, body?: any) {
//   const headers = await authHeader();

//   const hasBody = body !== undefined;

//   const res = await fetch(buildUrl(path), {
//     method: "POST",
//     headers: {
//       ...(hasBody ? { "Content-Type": "application/json" } : {}),
//       Accept: "application/json",
//       ...headers,
//     },
//     ...(hasBody ? { body: JSON.stringify(body) } : {}),
//     credentials: "include",
//   });

//   return handle<T>(res);
// }




import { clearAuthTokens, getStoredToken, redirectToSignIn } from "@/lib/auth";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function buildUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();

  if (!res.ok) {
    if (res.status === 401) {
      clearAuthTokens();
      redirectToSignIn();
      throw new Error("Your login session has expired. Please sign in again.");
    }

    if (res.status === 403) {
      throw new Error(text || "You do not have permission to access this resource, or this feature is disabled for your plan.");
    }

    if (res.status === 404) {
      throw new Error(text || "Backend endpoint not found. Please check NEXT_PUBLIC_API_BASE_URL.");
    }

    if (res.status >= 500) {
      throw new Error(text || "Backend server error. Please try again or check the server logs.");
    }

    throw new Error(text || `Request failed with status ${res.status}`);
  }

  try {
    return text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    return text as T;
  }
}

function resolveToken(token?: string | null) {
  return token ?? getStoredToken() ?? null;
}

export async function get<T>(path: string, token?: string | null): Promise<T> {
  const resolvedToken = resolveToken(token);

  const res = await fetch(buildUrl(path), {
    method: "GET",
    headers: {
      ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
    },
    cache: "no-store",
  });

  return parseResponse<T>(res);
}

export async function post<T>(
  path: string,
  body?: unknown,
  token?: string | null
): Promise<T> {
  const resolvedToken = resolveToken(token);

  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseResponse<T>(res);
}

export async function put<T>(
  path: string,
  body?: unknown,
  token?: string | null
): Promise<T> {
  const resolvedToken = resolveToken(token);

  const res = await fetch(buildUrl(path), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseResponse<T>(res);
}

export async function del<T>(path: string, token?: string | null): Promise<T> {
  const resolvedToken = resolveToken(token);

  const res = await fetch(buildUrl(path), {
    method: "DELETE",
    headers: {
      ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
    },
  });

  return parseResponse<T>(res);
}
