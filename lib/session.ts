// /lib/session.ts
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authOptions } from "./auth";

// Project-wide user type (auth callbacks ထဲက session.user format နဲ့ကိုက်)
export type AppUser = {
  id: string;
  username: string;
  role: string;
  avatarUrl: string | null;
};

export async function getSessionSafe() {
  // server-only: layout / server components မှာသုံးမယ်
  try {
    return await getServerSession(authOptions);
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const session = await getSessionSafe();
  return (session?.user as AppUser) ?? null;
}

export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (user) return user;

  // redirect param တင်ချင်ရင် headers() ကနေ current path ဆောက်နိုင်
  // layout.tsx မှာ searchParams မရလို့ ဒီလိုလုပ်ရတတ်
  try {
    const h = headers();
    const host = (await h).get("x-forwarded-host") ?? (await h).get("host");
    const proto = (await h).get("x-forwarded-proto") ?? "http";
    const url = (await h).get("x-original-url") ?? (await h).get("referer") ?? "/";
    const pathname = typeof url === "string" ? new URL(url, `${proto}://${host}`).pathname : "/";
    const to = `/login?redirect=${encodeURIComponent(pathname)}`;
    redirect(to);
  } catch {
    redirect("/login");
  }
}
