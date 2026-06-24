export type DashboardRange = "7d" | "30d" | "90d";
export type MetricMode = "revenue" | "profit";
export type ThemeMode = "dark" | "light";

export type RevenuePoint = {
  name: string;
  revenue: number;
  profit: number;
};

export type CategoryPoint = {
  name: string;
  value: number;
};

export type ShopPoint = {
  name: string;
  value: number;
};

export type TransactionItem = {
  id: string;
  customer: string;
  type: "Paid" | "Pending" | "Refund";
  amount: number;
  shop: string;
  time: string;
};

export type DashboardData = {
  summary: {
    totalRevenue: number;
    totalProfit: number;
    totalOrders: number;
    refunds: number;
    revenueChange: string;
    profitChange: string;
    ordersChange: string;
    refundChange: string;
  };
  revenueData: RevenuePoint[];
  categoryData: CategoryPoint[];
  shopData: ShopPoint[];
  transactions: TransactionItem[];
  shops: string[];
};

const revenue7d: RevenuePoint[] = [
  { name: "Mon", revenue: 1200, profit: 430 },
  { name: "Tue", revenue: 1800, profit: 620 },
  { name: "Wed", revenue: 1600, profit: 540 },
  { name: "Thu", revenue: 2200, profit: 770 },
  { name: "Fri", revenue: 2500, profit: 920 },
  { name: "Sat", revenue: 3100, profit: 1180 },
  { name: "Sun", revenue: 2800, profit: 1040 },
];

const revenue30d: RevenuePoint[] = [
  { name: "W1", revenue: 8200, profit: 3020 },
  { name: "W2", revenue: 9100, profit: 3380 },
  { name: "W3", revenue: 10400, profit: 3890 },
  { name: "W4", revenue: 11200, profit: 4230 },
];

const revenue90d: RevenuePoint[] = [
  { name: "Jan", revenue: 12000, profit: 4300 },
  { name: "Feb", revenue: 16800, profit: 6100 },
  { name: "Mar", revenue: 15400, profit: 5800 },
  { name: "Apr", revenue: 18200, profit: 7010 },
  { name: "May", revenue: 21000, profit: 8400 },
  { name: "Jun", revenue: 23600, profit: 9300 },
];

const categoryData: CategoryPoint[] = [
  { name: "Food", value: 38 },
  { name: "Drink", value: 24 },
  { name: "Snacks", value: 18 },
  { name: "Household", value: 12 },
  { name: "Other", value: 8 },
];

const shopDataAll: ShopPoint[] = [
  { name: "Main Branch", value: 86 },
  { name: "Branch A", value: 72 },
  { name: "Branch B", value: 61 },
  { name: "Online Shop", value: 49 },
];

const txAll: TransactionItem[] = [
  { id: "TXN-1001", customer: "Aung Aung", type: "Paid", amount: 12400, shop: "Main Branch", time: "2 min ago" },
  { id: "TXN-1002", customer: "Su Su", type: "Pending", amount: 8200, shop: "Branch A", time: "6 min ago" },
  { id: "TXN-1003", customer: "Ko Ko", type: "Refund", amount: 3900, shop: "Online Shop", time: "10 min ago" },
  { id: "TXN-1004", customer: "Moe Thidar", type: "Paid", amount: 19000, shop: "Main Branch", time: "15 min ago" },
  { id: "TXN-1005", customer: "Hla Hla", type: "Paid", amount: 6700, shop: "Branch B", time: "26 min ago" },
  { id: "TXN-1006", customer: "Kyaw Kyaw", type: "Paid", amount: 21000, shop: "Main Branch", time: "31 min ago" },
  { id: "TXN-1007", customer: "Ei Mon", type: "Pending", amount: 7200, shop: "Branch A", time: "44 min ago" },
  { id: "TXN-1008", customer: "Nyein", type: "Refund", amount: 2800, shop: "Online Shop", time: "1 hour ago" },
  { id: "TXN-1009", customer: "Yuki", type: "Paid", amount: 9800, shop: "Branch B", time: "1 hour ago" },
  { id: "TXN-1010", customer: "Taro", type: "Paid", amount: 15400, shop: "Main Branch", time: "2 hours ago" },
  { id: "TXN-1011", customer: "Mika", type: "Pending", amount: 6800, shop: "Branch A", time: "2 hours ago" },
  { id: "TXN-1012", customer: "Aye Aye", type: "Paid", amount: 8300, shop: "Online Shop", time: "3 hours ago" },
];

export function getAllowedShopsByRole(role: string, shopCode?: string | null) {
  if (role === "ADMIN") {
    return ["All Shops", "Main Branch", "Branch A", "Branch B", "Online Shop"];
  }

  if (shopCode === "SHOP-0001") return ["Main Branch"];
  if (shopCode === "SHOP-0002") return ["Branch A"];
  if (shopCode === "SHOP-0003") return ["Branch B"];
  if (shopCode === "SHOP-0004") return ["Online Shop"];

  return ["Main Branch"];
}

export function mapShopCodeToName(shopCode?: string | null) {
  if (shopCode === "SHOP-0001") return "Main Branch";
  if (shopCode === "SHOP-0002") return "Branch A";
  if (shopCode === "SHOP-0003") return "Branch B";
  if (shopCode === "SHOP-0004") return "Online Shop";
  return "Main Branch";
}

export function getDashboardData(
  range: DashboardRange,
  selectedShop: string,
  allowedShops?: string[]
): DashboardData {
  const revenueData =
    range === "7d" ? revenue7d : range === "30d" ? revenue30d : revenue90d;

  const shops = allowedShops && allowedShops.length > 0
    ? allowedShops
    : ["All Shops", "Main Branch", "Branch A", "Branch B", "Online Shop"];

  const safeSelectedShop = shops.includes(selectedShop) ? selectedShop : shops[0];

  const transactions =
    safeSelectedShop === "All Shops"
      ? txAll.filter((t) => shops.includes(t.shop) || shops.includes("All Shops"))
      : txAll.filter((t) => t.shop === safeSelectedShop);

  const factor =
    safeSelectedShop === "All Shops"
      ? 1
      : safeSelectedShop === "Main Branch"
      ? 0.56
      : safeSelectedShop === "Branch A"
      ? 0.24
      : safeSelectedShop === "Branch B"
      ? 0.14
      : 0.09;

  const filteredShopData =
    safeSelectedShop === "All Shops"
      ? shopDataAll.filter((s) => shops.includes(s.name))
      : shopDataAll.filter((s) => s.name === safeSelectedShop);

  return {
    summary: {
      totalRevenue: Math.round(1284000 * factor),
      totalProfit: Math.round(428300 * factor),
      totalOrders: Math.round(2480 * factor),
      refunds: Math.round(24200 * factor),
      revenueChange: "+12.5%",
      profitChange: "+8.2%",
      ordersChange: "+16.1%",
      refundChange: "-3.4%",
    },
    revenueData: revenueData.map((r) => ({
      ...r,
      revenue: Math.round(r.revenue * factor),
      profit: Math.round(r.profit * factor),
    })),
    categoryData,
    shopData: filteredShopData,
    transactions,
    shops,
  };
}