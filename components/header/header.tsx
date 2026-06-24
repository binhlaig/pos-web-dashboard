



"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  LogOut,
  Settings,
  User2,
  LayoutDashboard,
  ShieldCheck,
  Store,
} from "lucide-react";
import { ModeToggle } from "../dark-mode";


function initialsFrom(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? "U") +
    (parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : parts[0]?.[1] ?? "")
  ).toUpperCase();
}

const FILE_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

function resolveAvatarUrl(avatarUrl?: string | null) {
  if (!avatarUrl) return undefined;

  const clean = avatarUrl.trim();
  if (!clean) return undefined;

  if (/^https?:\/\//i.test(clean)) return clean;

  if (clean.startsWith("/uploads/")) {
    if (FILE_BASE) {
      try {
        return new URL(clean, FILE_BASE).href;
      } catch {
        return clean;
      }
    }
    return clean;
  }

  if (clean.startsWith("/")) {
    return clean;
  }

  const relativePath = `/uploads/avatars/${clean}`;

  if (FILE_BASE) {
    try {
      return new URL(relativePath, FILE_BASE).href;
    } catch {
      return relativePath;
    }
  }

  return relativePath;
}

async function clearClientAuthData() {
  try {
    localStorage.removeItem("remember_login");
    localStorage.removeItem("shop_code");
    localStorage.removeItem("last_username");
    localStorage.removeItem("sync-user");
    localStorage.removeItem("user");
    localStorage.removeItem("auth-user");

    sessionStorage.removeItem("remember_login");
    sessionStorage.removeItem("shop_code");
    sessionStorage.removeItem("last_username");
    sessionStorage.removeItem("sync-user");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("auth-user");
  } catch {}
}

function UserDropdown({
  name,
  email,
  image,
  role,
  shopCode,
  onLogout,
}: {
  name: string;
  email?: string;
  image?: string;
  role?: string;
  shopCode?: string;
  onLogout: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 rounded-xl px-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9 overflow-hidden ring-2 ring-slate-200 dark:ring-slate-700">
              {image ? (
                <AvatarImage
                  src={image}
                  alt={name || "user avatar"}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : null}
              <AvatarFallback className="bg-slate-900 text-white dark:bg-cyan-600">
                {initialsFrom(name)}
              </AvatarFallback>
            </Avatar>

            <div className="hidden md:flex flex-col leading-tight text-left">
              <span className="text-sm font-semibold line-clamp-1 text-slate-800 dark:text-slate-100">
                {name}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                {role || "Staff"}{shopCode ? ` • ${shopCode}` : ""}
              </span>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 rounded-2xl border-slate-200 dark:border-slate-700"
      >
        <DropdownMenuLabel className="text-xs">
          Signed in as
          <div className="mt-1 font-semibold text-sm text-slate-800 dark:text-slate-100">
            {name}
          </div>
          {email ? (
            <div className="text-slate-500 dark:text-slate-400">{email}</div>
          ) : null}
          <div className="mt-1 text-slate-500 dark:text-slate-400">
            {role || "Staff"}{shopCode ? ` • ${shopCode}` : ""}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings/profile" className="flex items-center">
            <User2 className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header() {
  const { data, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const sessionUser = data?.user as any | undefined;
  const sessionError = (data as any)?.error;

  const [mounted, setMounted] = useState(false);
  const [syncedUser, setSyncedUser] = useState<any>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setMounted(true);

    try {
      const raw =
        localStorage.getItem("sync-user") ||
        localStorage.getItem("user") ||
        localStorage.getItem("auth-user");

      if (raw) {
        setSyncedUser(JSON.parse(raw));
      }
    } catch {
      setSyncedUser(null);
    }
  }, []);

  const mergedUser = {
    ...syncedUser,
    ...sessionUser,
    image:
      sessionUser?.imageUrl ??
      sessionUser?.avatarUrl ??
      sessionUser?.image ??
      syncedUser?.imageUrl ??
      syncedUser?.avatarUrl ??
      syncedUser?.image ??
      null,
    username:
      sessionUser?.username ??
      sessionUser?.name ??
      syncedUser?.username ??
      syncedUser?.name ??
      "Unknown User",
    shopCode:
      sessionUser?.shopCode ??
      syncedUser?.shopCode ??
      null,
  };

  const hasUser = !!(sessionUser || syncedUser);

  const name = mergedUser?.name ?? mergedUser?.username ?? "Unknown User";
  const email = mergedUser?.email ?? "";
  const role = mergedUser?.role ?? "Staff";
  const employeeId = mergedUser?.employeeId ?? mergedUser?.id ?? undefined;
  const shopCode = mergedUser?.shopCode ?? undefined;
  const userImage = resolveAvatarUrl(mergedUser?.image);

  useEffect(() => {
    if (!mounted) return;
    if (status === "loading") return;

    if (sessionError === "AccessTokenExpired") {
      const doLogout = async () => {
        setLoggingOut(true);
        await clearClientAuthData();
        await signOut({ redirect: false });
        router.replace("/Sign_in");
      };

      doLogout();
    }
  }, [mounted, status, sessionError, router]);

  const onLogout = useMemo(
    () => async () => {
      setLoggingOut(true);
      await clearClientAuthData();
      await signOut({ redirect: false });
      router.replace("/Sign_in");
    },
    [router]
  );

function formatShortDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(d);
}


function getGreeting(h: number) {
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatClock(d: Date) {
  return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(d);
}

  const pageTitle = useMemo(() => {
    if (pathname?.startsWith("/dashboard/settings")) return "Settings";
    if (pathname?.startsWith("/settings/profile")) return "Profile";
    if (pathname?.startsWith("/dashboard")) return "Dashboard";
    return "Supermarket System";
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/85 dark:bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 min-w-0"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-sm">
              <Store className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Supermarket Dashboard
              </p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {pageTitle}
              </p>
            </div>
          </Link>

          <Separator orientation="vertical" className="hidden h-6 sm:block" />

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>{role}</span>
            {employeeId ? <span>• #{employeeId}</span> : null}
            {shopCode ? <span>• {shopCode}</span> : null}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />

          <Button
            size="icon"
            variant="ghost"
            className="h-10 w-10 rounded-xl"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {loggingOut ? (
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-violet-500 animate-spin" />
              Signing out...
            </div>
          ) : hasUser ? (
            mounted ? (
              <UserDropdown
                name={name}
                email={email}
                image={userImage}
                role={role}
                shopCode={shopCode}
                onLogout={onLogout}
              />
            ) : (
              <div
                aria-hidden
                className="h-10 w-[190px] animate-pulse rounded-xl bg-slate-200/60 dark:bg-slate-800/60"
              />
            )
          ) : (
            <Button asChild size="sm" className="rounded-xl">
              <Link href="/Sign_in">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
    
  );
}
