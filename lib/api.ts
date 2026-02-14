


// "use client";

// type PostFormOptions = {
//   token?: string;
//   /**
//    * remote api connect မရရင် local nextjs api (/api/..) ကို fallback ချင်လား
//    * default: true
//    */
//   fallbackToLocal?: boolean;

//   /**
//    * fetch timeout (ms) - remote connect မရတဲ့အခါကိုမြန်မြန် fallback ဖြစ်ချင်ရင် သတ်မှတ်
//    * default: 2500
//    */
//   timeoutMs?: number;
// };

// function isNetworkError(err: unknown) {
//   // fetch fail / abort / DNS / connection refused စတာတွေ
//   if (!(err instanceof Error)) return false;
//   const msg = (err.message || "").toLowerCase();
//   return (
//     msg.includes("failed to fetch") ||
//     msg.includes("networkerror") ||
//     msg.includes("load failed") ||
//     msg.includes("fetch") ||
//     msg.includes("abort") ||
//     msg.includes("timed out") ||
//     msg.includes("timeout")
//   );
// }

// function makeAbort(timeoutMs: number) {
//   const controller = new AbortController();
//   const id = setTimeout(() => controller.abort(), timeoutMs);
//   return { controller, clear: () => clearTimeout(id) };
// }

// async function parseError(res: Response) {
//   const contentType = res.headers.get("content-type") ?? "";
//   let message = `Request failed with status ${res.status}`;

//   try {
//     if (contentType.includes("application/json")) {
//       const errJson: any = await res.json();
//       console.error("❌ Backend error JSON:", errJson);
//       message =
//         errJson?.message ||
//         errJson?.detail ||
//         errJson?.error ||
//         JSON.stringify(errJson);
//     } else {
//       const text = await res.text();
//       console.error("❌ Backend error text:", text);
//       if (text) message = text;
//     }
//   } catch (e) {
//     console.error("❌ Error parsing backend error:", e);
//   }

//   return message;
// }

// async function postFormOnce<T>(
//   fullUrl: string,
//   formData: FormData,
//   options: PostFormOptions,
// ) {
//   const headers: HeadersInit = {};
//   if (options.token) headers["Authorization"] = `Bearer ${options.token}`;

//   const timeoutMs = options.timeoutMs ?? 2500;
//   const { controller, clear } = makeAbort(timeoutMs);

//   try {
//     const res = await fetch(fullUrl, {
//       method: "POST",
//       body: formData,
//       headers,
//       credentials: "include",
//       signal: controller.signal,
//     });

//     const contentType = res.headers.get("content-type") ?? "";

//     if (!res.ok) {
//       const message = await parseError(res);
//       throw new Error(message);
//     }

//     if (contentType.includes("application/json")) {
//       return (await res.json()) as T;
//     }
//     return {} as T;
//   } finally {
//     clear();
//   }
// }

// /**
//  * ✅ Remote-first + Local fallback (when remote connect fails)
//  */
// export async function postForm<T>(
//   url: string,
//   formData: FormData,
//   options: PostFormOptions = {},
// ): Promise<T> {
//   const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();

//   // local next api route (/api/...)
//   const isLocalApiRoute = url.startsWith("/api/");

//   // full url for remote (if baseUrl exists)
//   const remoteUrl =
//     url.startsWith("http") ? url : baseUrl ? `${baseUrl}${url}` : url;

//   // local fallback url (same origin)
//   const localUrl = url; // must be "/api/...."

//   const fallbackToLocal =
//     options.fallbackToLocal ?? true; // default true

//   // 1) try remote first (only when baseUrl is provided and url isn't already local)
//   if (baseUrl && !url.startsWith("http") && !isLocalApiRoute) {
//     try {
//       return await postFormOnce<T>(remoteUrl, formData, options);
//     } catch (err) {
//       // remote responded with HTTP error => NOT a connect failure (so do not fallback)
//       // But fetch throws Error only; to differentiate:
//       // - network/abort => fallback
//       // - http error => message already thrown (no fallback)
//       if (fallbackToLocal && isNetworkError(err)) {
//         if (isLocalApiRoute) {
//           // unlikely branch (since isLocalApiRoute false here), but safe
//           return await postFormOnce<T>(localUrl, formData, options);
//         }
//       }
//       throw err;
//     }
//   }

//   // 2) If url is local api route (/api/...) => we can do remote-first by proxying:
//   //    - if baseUrl exists, try remote proxy endpoint pattern:
//   //    The easiest & cleanest approach: your /api/auth/register route is gateway already.
//   //    So just call local here.
//   if (isLocalApiRoute) {
//     // Call local (gateway) => it will try remote then fallback to mongo
//     return await postFormOnce<T>(localUrl, formData, options);
//   }

//   // 3) If baseUrl is empty, just call provided url (same origin or absolute)
//   try {
//     return await postFormOnce<T>(remoteUrl, formData, options);
//   } catch (err) {
//     // If user calls non-/api path and wants fallback, you could add a map here.
//     throw err;
//   }
// }



type ApiErrorPayload = {
  message?: string;
  error?: string;
  status?: number;
};

function buildErrorMessage(status: number, payload: unknown) {
  if (typeof payload === "string" && payload.trim()) return payload;

  if (payload && typeof payload === "object") {
    const p = payload as ApiErrorPayload;
    return p.message || p.error || `HTTP ${status}`;
  }

  return `HTTP ${status}`;
}

async function parseResponse(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: any;
    auth?: boolean; // ✅ true only for protected endpoints
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const method = options.method ?? "GET";
  const auth = options.auth ?? false;

  // ✅ IMPORTANT: rewrites work only with relative paths like "/backend/..."
  const url = path;

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
  };

  // ✅ Attach token only when auth=true
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;

  // ✅ If body is FormData, don't set Content-Type (browser sets boundary)
  const body = options.body;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (body && !isFormData && typeof body === "object") {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  const res = await fetch(url, {
    method,
    headers: isFormData ? headers : headers,
    body: body
      ? isFormData
        ? body
        : headers["Content-Type"]?.includes("application/json")
        ? JSON.stringify(body)
        : body
      : undefined,
  });

  const payload = await parseResponse(res);

  if (!res.ok) {
    // Optional: auto-logout on 401 for protected endpoints
    if (res.status === 401 && auth) {
      localStorage.removeItem("token");
    }
    throw new Error(buildErrorMessage(res.status, payload));
  }

  return payload as T;
}

// ✅ Convenience wrappers
export function postForm<T>(path: string, form: FormData, auth = false) {
  return apiRequest<T>(path, { method: "POST", body: form, auth });
}

export function postJson<T>(path: string, data: any, auth = false) {
  return apiRequest<T>(path, { method: "POST", body: data, auth });
}

export function getJson<T>(path: string, auth = false) {
  return apiRequest<T>(path, { method: "GET", auth });
}
