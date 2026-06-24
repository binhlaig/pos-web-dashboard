
"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { savePosSession } from "@/lib/auth-session";

export default function SyncUser({ user, session: providedSession }: { user?: any; session?: any }) {
  const { data: hookSession, status } = useSession();
  const session = providedSession ?? hookSession;

  useEffect(() => {
    if (status === "loading") return;

    const sessionUser = session?.user || {};
    const source = user || sessionUser;
    if (!source) return;

    const normalized = {
      ...source,
      image:
        source?.image ??
        source?.imageUrl ??
        source?.avatarUrl ??
        null,
      imageUrl:
        source?.imageUrl ??
        source?.image ??
        source?.avatarUrl ??
        null,
    };

    localStorage.setItem("sync-user", JSON.stringify(normalized));
    savePosSession({
      accessToken: session?.accessToken || localStorage.getItem("pos_access_token"),
      user: {
        ...normalized,
        shopStatus: session?.shopStatus || normalized.shopStatus,
        subscriptionPlan: session?.subscriptionPlan || normalized.subscriptionPlan,
        subscriptionEndDate:
          session?.subscriptionEndDate || normalized.subscriptionEndDate,
      },
      shopId: normalized.shopId,
      shopCode: normalized.shopCode,
      shopStatus: session?.shopStatus || normalized.shopStatus,
      subscriptionPlan: session?.subscriptionPlan || normalized.subscriptionPlan,
      subscriptionEndDate:
        session?.subscriptionEndDate || normalized.subscriptionEndDate,
      features: session?.features,
      limits: session?.limits,
    });
  }, [user, session, status]);

  return null;
}
