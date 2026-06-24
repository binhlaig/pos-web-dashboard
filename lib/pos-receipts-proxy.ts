import { NextRequest, NextResponse } from "next/server";

const DEFAULT_BACKEND_BASE = "http://localhost:8080";

function getBackendApiBase() {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.REMOTE_API_BASE_URL ||
    DEFAULT_BACKEND_BASE;

  const cleanBase = base.replace(/\/+$/, "");
  return cleanBase.endsWith("/api") ? cleanBase : `${cleanBase}/api`;
}

function buildBackendUrl(req: NextRequest, receiptPath: string) {
  const url = new URL(req.url);
  const backendUrl = new URL(`${getBackendApiBase()}/pos/receipts${receiptPath}`);

  url.searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  return backendUrl;
}

export async function proxyReceiptsRequest(
  req: NextRequest,
  receiptPath = ""
) {
  const backendUrl = buildBackendUrl(req, receiptPath);
  const headers: HeadersInit = {
    Accept: "application/json",
  };

  const authorization = req.headers.get("authorization");
  if (authorization) headers.Authorization = authorization;

  try {
    const res = await fetch(backendUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text();

    return NextResponse.json(payload, { status: res.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Receipts API failed.";

    return NextResponse.json(
      {
        message: "Could not connect to POS receipts backend.",
        error: message,
      },
      { status: 502 }
    );
  }
}
