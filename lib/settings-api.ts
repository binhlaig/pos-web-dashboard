"use client";

import { backendRequest } from "@/lib/backend-api";

export type ProfileSettings = {
  username?: string | null;
  role?: string | null;
  shopCode?: string | null;
  avatarUrl?: string | null;
  imageUrl?: string | null;
};

export type ShopSettings = {
  shopName?: string | null;
  address?: string | null;
  phone?: string | null;
  businessType?: string | null;
  shopStatus?: string | null;
  subscriptionPlan?: string | null;
};

export type ReceiptSettings = {
  shopName?: string | null;
  address?: string | null;
  phone?: string | null;
  secondPhone?: string | null;
  footerMessage?: string | null;
  taxRatePercent?: number | string | null;
  currencyCode?: string | null;
  currencySymbol?: string | null;
  currencyDecimalDigits?: number | string | null;
  currencyPosition?: string | null;
};

export type PlanInfo = {
  subscriptionPlan?: string | null;
  shopStatus?: string | null;
  subscriptionEndDate?: string | null;
  features?: Record<string, boolean | undefined> | null;
  limits?: Record<string, number | null | undefined> | null;
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  return backendRequest<T>(path, init);
}

export function getMyProfile() {
  return request<ProfileSettings>("/api/me/profile");
}

export function updateMyProfile(payload: Partial<ProfileSettings>) {
  return request<ProfileSettings>("/api/me/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateMyPassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  return request<{ message?: string }>("/api/me/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function uploadMyAvatar(formData: FormData) {
  return request<ProfileSettings>("/api/me/avatar", {
    method: "POST",
    body: formData,
  });
}

export function getMyShop() {
  return request<ShopSettings>("/api/me/shop");
}

export function updateMyShop(payload: Partial<ShopSettings>) {
  return request<ShopSettings>("/api/me/shop", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function getMyPlan() {
  return request<PlanInfo>("/api/me/plan");
}

export function getReceiptSettings() {
  return request<ReceiptSettings>("/api/receipt-settings/my-shop");
}

export function updateReceiptSettings(payload: Partial<ReceiptSettings>) {
  return request<ReceiptSettings>("/api/receipt-settings/my-shop", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
