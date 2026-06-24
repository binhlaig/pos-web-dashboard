"use client";

import { backendRequest, getStoredBearerToken } from "@/lib/backend-api";

export type ShopFeatureKey =
  | "dashboardEnabled"
  | "productsEnabled"
  | "posRegisterEnabled"
  | "receiptsEnabled"
  | "staffEnabled"
  | "tasksEnabled"
  | "timecardEnabled"
  | "restaurantPosEnabled"
  | "restaurantTablesEnabled"
  | "restaurantKitchenEnabled"
  | "restaurantOrdersEnabled"
  | "allowRestaurant"
  | "allowKitchen"
  | "allowTableOrder"
  | "settingsEnabled";

export type ShopBusinessType = "SUPERMARKET" | "RESTAURANT" | string;

export type ShopFeatureSettings = Record<ShopFeatureKey, boolean> & {
  businessType?: ShopBusinessType | null;
  business_type?: ShopBusinessType | null;
};

export const SHOP_FEATURE_KEYS: ShopFeatureKey[] = [
  "dashboardEnabled",
  "productsEnabled",
  "posRegisterEnabled",
  "receiptsEnabled",
  "staffEnabled",
  "tasksEnabled",
  "timecardEnabled",
  "restaurantPosEnabled",
  "restaurantTablesEnabled",
  "restaurantKitchenEnabled",
  "restaurantOrdersEnabled",
  "allowRestaurant",
  "allowKitchen",
  "allowTableOrder",
  "settingsEnabled",
];

const DEFAULT_SHOP_FEATURES: ShopFeatureSettings = {
  dashboardEnabled: true,
  productsEnabled: true,
  posRegisterEnabled: true,
  receiptsEnabled: true,
  staffEnabled: true,
  tasksEnabled: true,
  timecardEnabled: true,
  restaurantPosEnabled: true,
  restaurantTablesEnabled: true,
  restaurantKitchenEnabled: true,
  restaurantOrdersEnabled: true,
  allowRestaurant: true,
  allowKitchen: true,
  allowTableOrder: true,
  settingsEnabled: true,
};

export function getOwnerToken() {
  return getStoredBearerToken();
}

function unwrapFeatureBody(body: unknown) {
  if (!body || typeof body !== "object") return {};
  const record = body as Record<string, unknown>;

  if (record.features && typeof record.features === "object") {
    return { ...record, ...(record.features as Record<string, unknown>) };
  }

  if (record.shop_features && typeof record.shop_features === "object") {
    return { ...record, ...(record.shop_features as Record<string, unknown>) };
  }

  return record;
}

export function normalizeShopFeatures(body: unknown): ShopFeatureSettings {
  const record = unwrapFeatureBody(body) as Record<string, unknown>;
  const normalized: ShopFeatureSettings = { ...DEFAULT_SHOP_FEATURES };

  for (const key of SHOP_FEATURE_KEYS) {
    if (typeof record[key] === "boolean") {
      normalized[key] = record[key];
    }
  }

  normalized.businessType = String(
    record.businessType ||
      record.business_type ||
      record.shopBusinessType ||
      record.shop_business_type ||
      ""
  ).trim() || null;
  normalized.business_type = normalized.businessType;

  return normalized;
}

export async function getMyShopFeatures(): Promise<ShopFeatureSettings> {
  const body = await backendRequest<unknown>("/api/shop/features/my");
  return normalizeShopFeatures(body);
}
