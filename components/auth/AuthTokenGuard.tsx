"use client";

import { LoadingScreen } from "@/components/loading-screen";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AuthTokenGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [transportFailed, setTransportFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { data: session, status, update } = useSession();
  const sessionRejected = (session as any)?.error === "AccessTokenExpired";
  const queryString = searchParams.toString();

  useEffect(() => {
    if (status === "loading") {
      setReady(false);
      return;
    }

    if (status === "unauthenticated" && !sessionRejected) {
      setReady(false);
      const controller = new AbortController();
      void fetch("/api/auth/session", { cache: "no-store", signal: controller.signal })
        .then(async response => {
          if (!response.ok) throw new Error("Session service unavailable");
          const current = await response.json();
          if (controller.signal.aborted) return;
          if (!current?.user || current.error === "AccessTokenExpired") {
            const path = `${pathname}${queryString ? `?${queryString}` : ""}`;
            router.replace(`/Sign_in?next=${encodeURIComponent(path)}`);
          } else {
            setTransportFailed(true);
            await update();
          }
        }).catch(() => { if (!controller.signal.aborted) setTransportFailed(true); });
      return () => controller.abort();
    }
    if (sessionRejected) {
      setReady(false);
      const current = `${pathname}${queryString ? `?${queryString}` : ""}`;
      router.replace(`/Sign_in?next=${encodeURIComponent(current)}`);
      return;
    }

    setTransportFailed(false);
    setReady(true);
  }, [pathname, queryString, router, status, sessionRejected, attempt, update]);

  if (transportFailed || (session as any)?.error === "RefreshTemporarilyUnavailable") {
    return <div role="alert" className="p-6">Unable to renew your session right now.
      <button className="ml-3 underline" onClick={() => { setAttempt(value => value + 1); void update(); }}>Retry</button>
    </div>;
  }
  if (!ready) {
    return (
      <LoadingScreen title="Checking your login session..." />
    );
  }

  return <>{children}</>;
}
