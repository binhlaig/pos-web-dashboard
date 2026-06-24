"use client";

import type React from "react";
import {
  BarChart3,
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Soup,
  Table2,
  Users,
  Utensils,
} from "lucide-react";
import type { ShopBusinessType, ShopFeatureKey } from "./shop-features-api";

export type ShopOwnerRoute = {
  label: string;
  href: string;
  icon: React.ElementType;
  featureKey: ShopFeatureKey;
  businessTypes: ShopBusinessType[];
};

export type ShopOwnerRouteGroup = {
  label: "Main" | "Sales" | "Inventory" | "People" | "Operations" | "Restaurant" | "System";
  items: ShopOwnerRoute[];
};

const SHARED_BUSINESS_TYPES: ShopBusinessType[] = ["SUPERMARKET", "RESTAURANT"];
const RESTAURANT_ONLY: ShopBusinessType[] = ["RESTAURANT"];
const SUPERMARKET_ONLY: ShopBusinessType[] = ["SUPERMARKET"];

export const SHOP_OWNER_ROUTE_GROUPS: ShopOwnerRouteGroup[] = [
  {
    label: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        featureKey: "dashboardEnabled",
        businessTypes: SHARED_BUSINESS_TYPES,
      },
    ],
  },
  {
    label: "Sales",
    items: [
      {
        label: "POS Register",
        href: "/pos",
        icon: ShoppingCart,
        featureKey: "posRegisterEnabled",
        businessTypes: SUPERMARKET_ONLY,
      },
      {
        label: "Receipts",
        href: "/orders",
        icon: Receipt,
        featureKey: "receiptsEnabled",
        businessTypes: SHARED_BUSINESS_TYPES,
      },
      {
        label: "Sales Analytics",
        href: "/dashboard/sales-analytics",
        icon: BarChart3,
        featureKey: "receiptsEnabled",
        businessTypes: SHARED_BUSINESS_TYPES,
      },
      {
        label: "Sales By Product",
        href: "/dashboard/sales-by-product",
        icon: BarChart3,
        featureKey: "receiptsEnabled",
        businessTypes: SHARED_BUSINESS_TYPES,
      },
    ],
  },
  {
    label: "Inventory",
    items: [
      {
        label: "Products",
        href: "/dashboard/product",
        icon: Package,
        featureKey: "productsEnabled",
        businessTypes: SHARED_BUSINESS_TYPES,
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        label: "Staff",
        href: "/dashboard/staff",
        icon: Users,
        featureKey: "staffEnabled",
        businessTypes: SHARED_BUSINESS_TYPES,
      },
      {
        label: "Timecard",
        href: "/dashboard/timecard",
        icon: CalendarClock,
        featureKey: "timecardEnabled",
        businessTypes: SHARED_BUSINESS_TYPES,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Tasks",
        href: "/dashboard/tasks",
        icon: ClipboardList,
        featureKey: "tasksEnabled",
        businessTypes: SHARED_BUSINESS_TYPES,
      },
    ],
  },
  {
    label: "Restaurant",
    items: [
      {
        label: "Restaurant POS",
        href: "/dashboard/restaurant/pos",
        icon: Utensils,
        featureKey: "restaurantPosEnabled",
        businessTypes: RESTAURANT_ONLY,
      },
      {
        label: "Tables",
        href: "/dashboard/restaurant/tables",
        icon: Table2,
        featureKey: "restaurantTablesEnabled",
        businessTypes: RESTAURANT_ONLY,
      },
      {
        label: "Kitchen",
        href: "/dashboard/restaurant/kitchen",
        icon: Soup,
        featureKey: "restaurantKitchenEnabled",
        businessTypes: RESTAURANT_ONLY,
      },
      {
        label: "Orders",
        href: "/dashboard/restaurant/orders",
        icon: Receipt,
        featureKey: "restaurantOrdersEnabled",
        businessTypes: RESTAURANT_ONLY,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        featureKey: "settingsEnabled",
        businessTypes: SHARED_BUSINESS_TYPES,
      },
    ],
  },
];

export const SHOP_OWNER_ROUTES: ShopOwnerRoute[] = SHOP_OWNER_ROUTE_GROUPS.flatMap(
  (group) => group.items,
);

export function normalizeBusinessType(value: unknown): ShopBusinessType | null {
  const text = String(value || "").trim().toUpperCase();
  return text || null;
}

export function routeMatchesBusinessType(route: ShopOwnerRoute, businessType: ShopBusinessType | null) {
  if (!businessType) return true;
  return route.businessTypes.includes(businessType);
}
