import { clearAuthTokens, getStoredToken, redirectToSignIn } from "@/lib/auth";

type ApiErrorPayload = {
  message?: string;
  error?: string;
  code?: string;
  detail?: string;
  status?: number;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function buildErrorMessage(status: number, payload: unknown, path?: string) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const p = payload as ApiErrorPayload;

    if (status === 401) {
      return p.message || p.error || "Login session expired. Please login again.";
    }

    if (status === 403) {
      if (
        String(p.error || p.code || "").toUpperCase() === "FEATURE_DISABLED"
      ) {
        return (
          p.message ||
          "This feature is disabled for your shop plan. Please contact the shop owner or upgrade the plan."
        );
      }

      return p.message || p.error || "Permission denied or feature disabled.";
    }

    if (status === 404) {
      return (
        p.message ||
        p.error ||
        `Backend endpoint not found${path ? `: ${path}` : ""}.`
      );
    }

    if (status >= 500) {
      return p.message || p.error || "Backend server error.";
    }

    return p.message || p.error || p.detail || `HTTP ${status}`;
  }

  if (status === 401) return "Login session expired. Please login again.";
  if (status === 403) return "Permission denied or feature disabled.";
  if (status === 404) return `Backend endpoint not found${path ? `: ${path}` : ""}.`;
  if (status >= 500) return "Backend server error.";

  return `HTTP ${status}`;
}

async function parseResponse(res: Response) {
  const ct = res.headers.get("content-type") || "";

  if (ct.includes("application/json")) {
    return res.json().catch(() => null);
  }

  return res.text().catch(() => "");
}

function buildUrl(path: string) {
  // Full URL ဖြစ်ပြီးသားဆို 그대로သုံး
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // path က / နဲ့မစရင် / ထည့်
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${API_BASE}${normalizedPath}`;
}

export async function apiRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: any;
    auth?: boolean;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const method = options.method ?? "GET";
  const auth = options.auth ?? false;

  const url = buildUrl(path);
  const token = auth ? getStoredToken() : "";

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers ?? {}),
  };

  if (auth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const body = options.body;
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  if (body && !isFormData && typeof body === "object") {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  let res: Response;

  try {
    res = await fetch(url, {
      method,
      headers,
      body: body
        ? isFormData
          ? body
          : headers["Content-Type"]?.includes("application/json")
          ? JSON.stringify(body)
          : body
        : undefined,
    });
  } catch {
    throw new Error(
      `Backend unreachable, API URL wrong, or CORS issue. URL: ${url}`
    );
  }

  const payload = await parseResponse(res);

  if (!res.ok) {
    if (res.status === 401 && auth) {
      clearAuthTokens();
      redirectToSignIn();
    }

    throw new Error(buildErrorMessage(res.status, payload, path));
  }

  return payload as T;
}

export function postForm<T>(path: string, form: FormData, auth = false) {
  return apiRequest<T>(path, {
    method: "POST",
    body: form,
    auth,
  });
}

export function postJson<T>(path: string, data: any, auth = false) {
  return apiRequest<T>(path, {
    method: "POST",
    body: data,
    auth,
  });
}

export function putJson<T>(path: string, data: any, auth = false) {
  return apiRequest<T>(path, {
    method: "PUT",
    body: data,
    auth,
  });
}

export function patchJson<T>(path: string, data: any, auth = false) {
  return apiRequest<T>(path, {
    method: "PATCH",
    body: data,
    auth,
  });
}

export function deleteJson<T>(path: string, auth = false) {
  return apiRequest<T>(path, {
    method: "DELETE",
    auth,
  });
}

export function getJson<T>(path: string, auth = false) {
  return apiRequest<T>(path, {
    method: "GET",
    auth,
  });
}
