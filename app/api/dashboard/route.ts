import { NextRequest, NextResponse } from "next/server";
import {
  getAllowedShopsByRole,
  getDashboardData,
  mapShopCodeToName,
} from "@/lib/dashboard-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const range = (searchParams.get("range") || "30d") as "7d" | "30d" | "90d";
  const shop = searchParams.get("shop") || "All Shops";

  // mock auth user
  const mockUser = {
    role: "ADMIN", // change to CASHIER / STAFF for testing
    shopCode: "SHOP-0001",
  };

  const allowedShops = getAllowedShopsByRole(mockUser.role, mockUser.shopCode);

  const safeShop =
    mockUser.role === "ADMIN"
      ? shop
      : mapShopCodeToName(mockUser.shopCode);

  await new Promise((r) => setTimeout(r, 700));

  const data = getDashboardData(range, safeShop, allowedShops);

  return NextResponse.json({
    ...data,
    auth: {
      role: mockUser.role,
      shopCode: mockUser.shopCode,
      selectedShop: safeShop,
    },
  });
}