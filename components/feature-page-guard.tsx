"use client";

import * as React from "react";
import { AlertCircle, LockKeyhole, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { BackendApiError, redirectToLogin } from "@/lib/backend-api";
import { saveToken } from "@/lib/auth";
import { getMyShopFeatures, type ShopFeatureKey, type ShopFeatureSettings } from "@/lib/shop-features-api";

type FeaturePageGuardProps = {
  featureKey: ShopFeatureKey;
  children: React.ReactNode;
};

function GuardShell({
  icon,
  title,
  message,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center bg-slate-50 px-4 py-10 text-slate-950 dark:bg-[#06101f] dark:text-white">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#0b3a75]/10 text-[#0b3a75] dark:bg-blue-400/10 dark:text-blue-200">
            {icon}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            {message ? (
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-white/60">{message}</p>
            ) : null}
            {action ? <div className="mt-4">{action}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturePageGuard({ featureKey, children }: FeaturePageGuardProps) {
  const { data: session, status } = useSession();
  const accessToken = String((session as any)?.accessToken || "");
  const [settings, setSettings] = React.useState<ShopFeatureSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [errorTitle, setErrorTitle] = React.useState("Feature settings မဖတ်နိုင်ပါ");
  const [featureDisabled, setFeatureDisabled] = React.useState(false);

  const load = React.useCallback(async () => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (status === "unauthenticated") {
      redirectToLogin();
      return;
    }

    if (accessToken) saveToken(accessToken);

    try {
      setLoading(true);
      setError("");
      setErrorTitle("Feature settings မဖတ်နိုင်ပါ");
      setFeatureDisabled(false);
      setSettings(await getMyShopFeatures());
    } catch (err) {
      if (err instanceof BackendApiError && (err.code === "UNAUTHORIZED" || err.code === "LOGIN_REQUIRED")) {
        redirectToLogin();
        return;
      }

      if (err instanceof BackendApiError && err.code === "FEATURE_DISABLED") {
        setFeatureDisabled(true);
        setErrorTitle("Feature disabled");
      } else if (err instanceof BackendApiError && err.code === "ENDPOINT_MISSING") {
        setErrorTitle("Backend endpoint missing");
      }

      setError(err instanceof Error ? err.message : "Feature settings load failed.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, status]);

  React.useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <GuardShell
        icon={<RefreshCw className="h-5 w-5 animate-spin" />}
        title="Checking feature access"
        message="Please wait while we load your shop settings."
      />
    );
  }

  if (error) {
    return (
      <GuardShell
        icon={featureDisabled ? <LockKeyhole className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
        title={errorTitle}
        message={error}
        action={featureDisabled ? null : (
          <Button onClick={load} size="sm" className="bg-[#0b3a75] text-white hover:bg-[#092f5f]">
            Retry
          </Button>
        )}
      />
    );
  }

  if (!settings?.[featureKey]) {
    return (
      <GuardShell
        icon={<LockKeyhole className="h-5 w-5" />}
        title="Feature ပိတ်ထားပါတယ်"
        message="Super Admin မှ ဒီ feature ကို ပိတ်ထားပါတယ်။"
      />
    );
  }

  return <>{children}</>;
}
