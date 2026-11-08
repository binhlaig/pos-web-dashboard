
"use client";

import { LoadingScreen } from "@/components/loading-screen";

import {
  type ReactNode,
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { useSession } from "next-auth/react";

type AuthTokenGuardProps = {
  children: ReactNode;
};

export default function AuthTokenGuard({
  children,
}: AuthTokenGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: session, status, update } = useSession();

  const [ready, setReady] = useState(false);
  const [transportFailed, setTransportFailed] =
    useState(false);
  const [attempt, setAttempt] = useState(0);

  const sessionError = (
    session as { error?: string | null } | null
  )?.error;

  const sessionRejected =
    sessionError === "AccessTokenExpired";

  const temporarilyUnavailable =
    sessionError === "RefreshTemporarilyUnavailable";

  const queryString = searchParams.toString();

  /**
   * A valid session may be refreshed in the
   * background every 15 minutes.
   *
   * Do not reset ready during background
   * loading: doing so unmounts page children
   * and destroys unsaved React state.
   */
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    if (status === "loading") {
      // Preserve the previously verified page.
      return () => {
        controller.abort();
      };
    }

    /**
     * A definitively rejected session is not
     * recoverable through background refresh.
     */
    if (sessionRejected) {
      setReady(false);

      const currentPath =
        `${pathname}${queryString ? `?${queryString}` : ""}`;

      router.replace(
        `/Sign_in?next=${encodeURIComponent(currentPath)}`
      );

      return () => {
        controller.abort();
      };
    }

    /**
     * Keep the current page mounted during a
     * temporary refresh-service failure.
     *
     * Do not treat a temporary 503 as logout.
     */
    if (status === "authenticated") {
      setTransportFailed(false);
      setReady(true);

      return () => {
        controller.abort();
      };
    }

    /**
     * An unauthenticated client state can be
     * caused by a failed session fetch.
     *
     * Verify against the server before
     * deciding to redirect to Sign In.
     */
    if (status === "unauthenticated") {
      setReady(false);

      async function verifySession() {
        try {
          const response = await fetch(
            "/api/auth/session",
            {
              method: "GET",
              cache: "no-store",
              credentials: "same-origin",
              signal: controller.signal,
            }
          );

          if (!response.ok) {
            throw new Error(
              "Session service unavailable"
            );
          }

          const current = await response.json();

          if (!active || controller.signal.aborted) {
            return;
          }

          const rejected =
            current?.error === "AccessTokenExpired";

          if (!current?.user || rejected) {
            const currentPath =
              `${pathname}${queryString ? `?${queryString}` : ""}`;

            router.replace(
              `/Sign_in?next=${encodeURIComponent(currentPath)}`
            );

            return;
          }

          /**
           * The server still has an active
           * session. Restore the client session
           * without refreshing the browser page.
           */
          setTransportFailed(false);
          await update();

        } catch {
          if (!active || controller.signal.aborted) {
            return;
          }

          setTransportFailed(true);
        }
      }

      void verifySession();
    }

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    pathname,
    queryString,
    router,
    status,
    sessionRejected,
    attempt,
    update,
  ]);

  /**
   * Manual retry for temporary session errors.
   * Does not navigate or reload the browser.
   */
  const handleRetry = () => {
    setTransportFailed(false);
    setAttempt((value) => value + 1);
    void update();
  };

  /**
   * Render an error without replacing
   * previously mounted page children.
   */
  if (ready && !sessionRejected) {
    return (
      <>
        {children}

        {(transportFailed || temporarilyUnavailable) && (
          <div
            role="alert"
            className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-amber-300 bg-background p-4 shadow-lg"
          >
            <p className="text-sm text-foreground">
              Session ကို ယာယီ Refresh လုပ်၍ မရသေးပါ။
              ရေးလက်စ Data မပျောက်အောင် ထိန်းထားပါတယ်။
            </p>

            <button
              type="button"
              className="mt-3 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted"
              onClick={handleRetry}
            >
              Retry Session
            </button>
          </div>
        )}
      </>
    );
  }

  /**
   * Show the initial loading screen only
   * before the session is verified.
   */
  if (transportFailed || temporarilyUnavailable) {
    return (
      <div
        role="alert"
        className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6"
      >
        <p className="text-center text-sm text-muted-foreground">
          Unable to renew your session right now.
        </p>

        <button
          type="button"
          className="rounded-lg border px-4 py-2 text-sm font-medium"
          onClick={handleRetry}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <LoadingScreen title="Checking your login session..." />
  );
}
