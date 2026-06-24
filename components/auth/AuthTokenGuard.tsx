"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AuthTokenGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const { status } = useSession();
  const queryString = searchParams.toString();

  useEffect(() => {
    if (status === "loading") {
      setReady(false);
      return;
    }

    if (status === "unauthenticated") {
      const current = `${pathname}${queryString ? `?${queryString}` : ""}`;
      router.replace(`/Sign_in?next=${encodeURIComponent(current)}`);
      return;
    }

    setReady(true);
  }, [pathname, queryString, router, status]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4 text-sm text-muted-foreground">
        Checking your login session...
      </div>
    );
  }

  return <>{children}</>;
}
