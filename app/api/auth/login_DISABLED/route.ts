import { NextResponse } from "next/server";

export const runtime = "nodejs";

const REMOTE_BASE =
  process.env.REMOTE_API_BASE_URL || "http://localhost:8080";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(`${REMOTE_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: body.username,
        password: body.password,
      }),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Login proxy error:", error);
    return NextResponse.json(
      { message: "Unable to connect to backend" },
      { status: 500 }
    );
  }
}
