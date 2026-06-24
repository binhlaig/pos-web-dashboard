
import type { ComponentType } from "react";
import {
  BarChart3,
  ChefHat,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  ListOrdered,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Store,
  Table2,
  Utensils,
  Users,
  ReceiptText
} from "lucide-react";


import type { ShopFeatureSettings } from "@/lib/shop-features-api";

export type BusinessType = "SUPERMARKET" | "RESTAURANT" | "ALL";

export type ShopOwnerRouteItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  featureKey: keyof ShopFeatureSettings;
  businessTypes: BusinessType[];
  alwaysVisible?: boolean;
};

export type ShopOwnerRouteGroup = {
  label: string;
  items: ShopOwnerRouteItem[];
};

export function normalizeBusinessType(value: unknown): BusinessType | null {
  const raw = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  if (!raw) return null;

  if (
    raw === "RESTAURANT" ||
    raw === "CAFE" ||
    raw === "FOOD" ||
    raw === "FOOD_SERVICE" ||
    raw === "CAFE_RESTAURANT"
  ) {
    return "RESTAURANT";
  }

  if (raw === "SUPERMARKET" || raw === "MARKET" || raw === "GROCERY") {
    return "SUPERMARKET";
  }

  return null;
}

export function routeMatchesBusinessType(
  item: ShopOwnerRouteItem,
  businessType: BusinessType | null,
) {
  if (!businessType) return true;
  return (
    item.businessTypes.includes("ALL") ||
    item.businessTypes.includes(businessType)
  );
}

export const SHOP_OWNER_ROUTE_GROUPS: ShopOwnerRouteGroup[] = [
  {
    label: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        featureKey: "dashboardEnabled",
        businessTypes: ["SUPERMARKET", "RESTAURANT"],
      },
    ],
  },
  {
    label: "Sales",
    items: [
      {
        label: "Receipts / Orders",
        href: "/orders",
        icon: Receipt,
        featureKey: "receiptsEnabled",
        businessTypes: ["SUPERMARKET", "RESTAURANT"],
      },
      {
        label: "Sales By Product",
        href: "/dashboard/sales-by-product",
        icon: BarChart3,
        featureKey: "receiptsEnabled",
        businessTypes: ["SUPERMARKET", "RESTAURANT"],
      },
      {
        label: "Sales Analytics",
        href: "/dashboard/sales-analytics",
        icon: BarChart3,
        featureKey: "dashboardEnabled",
        businessTypes: ["SUPERMARKET", "RESTAURANT","ALL"],
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
        businessTypes: ["SUPERMARKET", "RESTAURANT"],
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
        businessTypes: ["SUPERMARKET", "RESTAURANT"],
      },
      {
        label: "Timecard",
        href: "/dashboard/timecard",
        icon: Clock3,
        featureKey: "timecardEnabled",
        businessTypes: ["SUPERMARKET", "RESTAURANT"],
      },
    ],
  },
  {
    label: "Employment",
    items: [
      {
        label: "Employee Timesheets",
        href: "/employment/Timecard_list",
        icon: Users,
        featureKey: "tasksEnabled",
        businessTypes: ["SUPERMARKET", "RESTAURANT"],
      },
    {
      label: "Employment Shifts",
      href: "/employment/TimeCard/shifts",
      icon:Clock3,
      featureKey: "timecardEnabled",
      businessTypes: ["SUPERMARKET", "RESTAURANT"],
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
        businessTypes: ["SUPERMARKET", "RESTAURANT"],
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
        businessTypes: ["RESTAURANT"],
      },
      {
        label: "Tables",
        href: "/dashboard/restaurant/tables",
        icon: Table2,
        featureKey: "restaurantTablesEnabled",
        businessTypes: ["RESTAURANT"],
      },
      {
        label: "Kitchen",
        href: "/dashboard/restaurant/kitchen",
        icon: ChefHat,
        featureKey: "restaurantKitchenEnabled",
        businessTypes: ["RESTAURANT"],
      },
      {
        label: "Restaurant Orders",
        href: "/dashboard/restaurant/orders",
        icon: ListOrdered,
        featureKey: "restaurantOrdersEnabled",
        businessTypes: ["RESTAURANT"],
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
        businessTypes: ["SUPERMARKET", "RESTAURANT"],
        alwaysVisible: true,
      },
    {
      label: "Receipt Settings",
      href: "/dashboard/receipt-settings",
      icon: ReceiptText,
      featureKey: "settingsEnabled",
      businessTypes: ["SUPERMARKET", "RESTAURANT"],
    },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        label: "Admin Inventory",
        href: "/admin/inventory",
        icon: Store,
        featureKey: "productsEnabled",
        businessTypes: ["SUPERMARKET", "RESTAURANT"],
      },
    ],
  },
];
