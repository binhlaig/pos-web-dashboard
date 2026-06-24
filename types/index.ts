export type TaskStatus = "Done" | "In Progress" | "Pending";
export type TaskPriority = "high" | "medium" | "low";
export type ActivityType = "success" | "warning" | "info";
export type NavPage =
  | "dashboard"
  | "tasks"
  | "stock"
  | "pos"
  | "customers"
  | "staff"
  | "delivery"
  | "promotions"
  | "expiry"
  | "reports"
  | "settings";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due: string;
}

export interface StockItem {
  name: string;
  level: number;
  min: number;
  unit: string;
}

export interface ActivityItem {
  icon: string;
  text: string;
  time: string;
  type: ActivityType;
}

export interface NavItem {
  id: NavPage;
  icon: string;
  label: string;
  badge?: number;
  badgeColor?: "red" | "amber" | "green";
}

export interface NavSection {
  label: string;
  items: NavItem[];
}
