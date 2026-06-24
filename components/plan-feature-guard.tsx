"use client";

import * as React from "react";
import type { PlanFeatures } from "@/lib/auth-session";
import { getPlanFeatures, getPosUser } from "@/lib/auth-session";
import { LockKeyhole, ShieldAlert } from "lucide-react";

type PlanFeatureGuardProps = {
  feature: keyof PlanFeatures;
  title: string;
  children: React.ReactNode;
};

function BlockedMessage({
  title,
  message,
  tone = "amber",
}: {
  title: string;
  message: string;
  tone?: "amber" | "rose";
}) {
  const Icon = tone === "rose" ? ShieldAlert : LockKeyhole;
  const colors =
    tone === "rose"
      ? "border-rose-500/20 bg-rose-500/10 text-rose-100"
      : "border-amber-500/20 bg-amber-500/10 text-amber-100";

  return (
    <div className="flex min-h-[70dvh] items-center justify-center bg-[#05060d] p-4 text-white">
      <div className={`w-full max-w-lg rounded-lg border p-6 shadow-2xl ${colors}`}>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-white/75">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlanFeatureGuard({
  feature,
  title,
  children,
}: PlanFeatureGuardProps) {
  const [state, setState] = React.useState<{
    ready: boolean;
    user: ReturnType<typeof getPosUser>;
    features: PlanFeatures;
  }>({
    ready: false,
    user: null,
    features: getPlanFeatures(),
  });

  React.useEffect(() => {
    setState({
      ready: true,
      user: getPosUser(),
      features: getPlanFeatures(),
    });
  }, []);

  if (!state.ready) {
    return (
      <BlockedMessage
        title="Checking plan access"
        message="Please wait while we verify your login session."
      />
    );
  }

  if (!state.user) {
    return (
      <BlockedMessage
        title="Login session missing"
        message="Your POS login session was not found. Please sign in again to continue."
      />
    );
  }

  const shopStatus = String(state.user.shopStatus || "").toUpperCase();
  if (shopStatus === "SUSPENDED") {
    return (
      <BlockedMessage
        title="Shop suspended"
        message="This shop is suspended. Please contact support or the shop owner to restore access."
        tone="rose"
      />
    );
  }

  if (shopStatus === "EXPIRED") {
    return (
      <BlockedMessage
        title="Subscription expired"
        message="This shop subscription has expired. Renew the plan to use this module again."
        tone="rose"
      />
    );
  }

  if (!state.features[feature]) {
    return (
      <BlockedMessage
        title={`${title} is not included`}
        message="Your current subscription plan does not include this module."
      />
    );
  }

  return <>{children}</>;
}
