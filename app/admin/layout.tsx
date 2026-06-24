import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";

const ADMIN_PAGE_ROLES = new Set(["admin", "owner", "superviser", "supervisor"]);

function hasAdminPageAccess(role: string) {
  return String(role || "")
    .split(/[,\s]+/)
    .map((value) => value.trim().toLowerCase().replace(/^role_/, ""))
    .some((value) => ADMIN_PAGE_ROLES.has(value));
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  if (!hasAdminPageAccess(user.role)) {
    redirect("/dashboard");
  }

  return children;
}
