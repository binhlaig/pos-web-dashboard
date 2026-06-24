"use client";

import { savePosSession } from "@/lib/auth-session";
import { backendRequest, getStoredBearerToken } from "@/lib/backend-api";

export async function getMyPlan() {
  return backendRequest<any>("/api/me/plan", { method: "GET" });
}

export async function refreshMyPlanSession() {
  const data = await getMyPlan();
  let currentUser: any = null;
  if (typeof window !== "undefined") {
    try {
      currentUser = JSON.parse(window.localStorage.getItem("pos_user") || "null");
    } catch {
      currentUser = null;
    }
  }

  savePosSession({
    accessToken: getStoredBearerToken(),
    user: currentUser,
    shopId: data?.shopId ?? currentUser?.shopId,
    shopCode: data?.shopCode ?? currentUser?.shopCode,
    shopStatus: data?.shopStatus,
    subscriptionPlan: data?.subscriptionPlan,
    subscriptionEndDate: data?.subscriptionEndDate,
    features: data?.features,
    limits: data?.limits,
  });

  return data;
}
