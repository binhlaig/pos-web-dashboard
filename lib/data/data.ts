import type { Task, StockItem, ActivityItem, NavSection } from "@/types";

export const TASKS: Task[] = [
  { id: "T-001", title: "Grocery section restock", status: "Done", priority: "high", due: "10:00" },
  { id: "T-002", title: "Cashier counter hygiene", status: "Done", priority: "medium", due: "09:30" },
  { id: "T-003", title: "Refrigerator temp log", status: "Done", priority: "high", due: "11:00" },
  { id: "T-004", title: "Daily sales report", status: "In Progress", priority: "high", due: "17:00" },
  { id: "T-005", title: "Delivery #D-2024 check", status: "In Progress", priority: "medium", due: "14:00" },
  { id: "T-006", title: "Update price tags", status: "Pending", priority: "low", due: "16:00" },
  { id: "T-007", title: "POS system backup", status: "Pending", priority: "high", due: "18:00" },
  { id: "T-008", title: "Clean dairy section", status: "Done", priority: "medium", due: "13:00" },
  { id: "T-009", title: "Staff break schedule", status: "Done", priority: "low", due: "12:00" },
  { id: "T-010", title: "CCTV footage check", status: "Pending", priority: "medium", due: "20:00" },
  { id: "T-011", title: "Promo banner setup", status: "Done", priority: "low", due: "09:00" },
  { id: "T-012", title: "Evening handover note", status: "Pending", priority: "high", due: "22:30" },
];

export const STOCK_ITEMS: StockItem[] = [
  { name: "Cooking Oil 1L", level: 8, min: 20, unit: "btl" },
  { name: "Salt 500g", level: 5, min: 30, unit: "pck" },
  { name: "Lifebuoy Soap", level: 12, min: 25, unit: "bar" },
  { name: "Shwe Pu Zun Water", level: 18, min: 48, unit: "btl" },
  { name: "Butter 200g", level: 3, min: 15, unit: "pck" },
  { name: "Eggs (tray)", level: 4, min: 12, unit: "tray" },
  { name: "Smile Fresh Milk", level: 9, min: 24, unit: "btl" },
];

export const ACTIVITY_ITEMS: ActivityItem[] = [
  { icon: "✅", text: "Grocery restock completed", time: "11:42", type: "success" },
  { icon: "⚠", text: "Water stock running low", time: "11:30", type: "warning" },
  { icon: "📦", text: "Delivery #D-2024 arrived", time: "10:55", type: "info" },
  { icon: "🧾", text: "Manager inspection passed", time: "10:20", type: "success" },
  { icon: "💰", text: "POS opening balance verified", time: "09:05", type: "success" },
  { icon: "🏷", text: "Price tags updated — Aisle 3", time: "08:45", type: "info" },
];

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Main",
    items: [
      { id: "dashboard", icon: "📊", label: "Dashboard" },
      { id: "tasks", icon: "✅", label: "Tasks", badge: 3, badgeColor: "amber" },
      { id: "stock", icon: "📦", label: "Inventory", badge: 7, badgeColor: "red" },
      { id: "pos", icon: "🏪", label: "POS / Sales" },
      { id: "customers", icon: "👥", label: "Customers" },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "staff", icon: "🪪", label: "Staff & Shifts" },
      { id: "delivery", icon: "🚚", label: "Deliveries", badge: 1, badgeColor: "green" },
      { id: "promotions", icon: "🏷", label: "Promotions" },
      { id: "expiry", icon: "⏰", label: "Expiry Watch", badge: 4, badgeColor: "red" },
      { id: "reports", icon: "📄", label: "Reports" },
    ],
  },
  {
    label: "Settings",
    items: [
      { id: "settings", icon: "⚙️", label: "Settings" },
    ],
  },
];

export const HOURLY_SALES = [42, 58, 71, 95, 68, 82, 77, 89, 134, 156, 112, 88];
export const HOURLY_LABELS = ["9:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];

export const CATEGORY_DATA = {
  labels: ["Grocery", "Beverages", "Household", "Personal Care", "Dairy", "Snacks", "Other"],
  values: [32, 18, 15, 12, 10, 9, 4],
  colors: ["#b8922a","#1a7a45","#1a4f8a","#b35c00","#6b3fa0","#c0392b","#9c9b96"],
};
