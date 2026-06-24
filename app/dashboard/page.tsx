
"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  getPlanLimits,
  getPosUser,
  type PlanLimits,
  type PosSessionUser,
} from "@/lib/auth-session";
import { saveToken } from "@/lib/auth";
import { BackendApiError, redirectToLogin } from "@/lib/backend-api";
import { refreshMyPlanSession } from "@/lib/plan-api";
import { getMyShopFeatures, type ShopFeatureSettings } from "@/lib/shop-features-api";
import {
  SHOP_OWNER_ROUTE_GROUPS,
  normalizeBusinessType,
  routeMatchesBusinessType,
} from "@/lib/shop-owner-routes";
import {
  Activity,
  BarChart3,
  Bell,
  Brain,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  GripVertical,
  HelpCircle,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Megaphone,
  Menu,
  NotebookPen,
  Package,
  Plus,
  Receipt,
  RefreshCw,
  ScanLine,
  Search,
  Send,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Siren,
  Sparkles,
  Store,
  TrendingUp,
  User2,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type TaskStatus = "Pending" | "In Progress" | "Done";
type TaskPriority = "high" | "medium" | "low";

type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  due: string;
  priority: TaskPriority;
  owner: string;
};

type ActivityItem = {
  id: number;
  title: string;
  time: string;
  type: "task" | "notice" | "support";
};

type NotificationItem = {
  id: number;
  title: string;
  desc: string;
  level: "info" | "warning" | "success";
  time: string;
};

type SidePanelId =
  | "manager-message"
  | "notifications"
  | "schedule"
  | "quick-actions"
  | "assistant"
  | "announcements"
  | "activity";

type BelowPanelId = "workflow" | "staff-notes" | "checklist";
type ThemeMode = "dark" | "light";

/* -------------------------------------------------------------------------- */
/* Demo data                                                                  */
/* -------------------------------------------------------------------------- */

const STATUS_ORDER: TaskStatus[] = ["Pending", "In Progress", "Done"];

const INITIAL_TASKS: Task[] = [
  { id: "T-101", title: "Check POS opening balance", status: "Done", due: "09:00 AM", priority: "high", owner: "Cashier" },
  { id: "T-102", title: "Restock beverage section", status: "In Progress", due: "11:30 AM", priority: "medium", owner: "Store Staff" },
  { id: "T-103", title: "Update daily sales report", status: "Pending", due: "05:00 PM", priority: "high", owner: "Supervisor" },
  { id: "T-104", title: "Clean cashier counter", status: "Pending", due: "07:00 PM", priority: "low", owner: "Front Staff" },
  { id: "T-105", title: "Verify delivery items", status: "In Progress", due: "02:00 PM", priority: "medium", owner: "Inventory" },
  { id: "T-106", title: "Close front register", status: "Done", due: "08:30 PM", priority: "high", owner: "Cashier" },
];

const ANNOUNCEMENTS = [
  { id: 1, title: "Monthly staff meeting", desc: "Meeting starts at 6:30 PM this Friday in the main office.", time: "Today" },
  { id: 2, title: "Uniform update", desc: "Please wear the new uniform set starting next Monday.", time: "Yesterday" },
  { id: 3, title: "Peak hour coverage", desc: "Keep one backup cashier available between 6:00–8:00 PM.", time: "1 hr ago" },
];

const INITIAL_ACTIVITY: ActivityItem[] = [
  { id: 1, title: "Opening balance check completed", time: "09:20 AM", type: "task" },
  { id: 2, title: "Rush-hour support note added", time: "10:10 AM", type: "support" },
  { id: 3, title: "New staff announcement reviewed", time: "11:00 AM", type: "notice" },
  { id: 4, title: "Delivery verification started", time: "01:20 PM", type: "task" },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 1, title: "2 tasks need attention", desc: "Daily sales report and counter cleaning are still pending.", level: "warning", time: "Now" },
  { id: 2, title: "Shift reminder", desc: "Rush-hour coverage starts at 6:00 PM.", level: "info", time: "12 min ago" },
  { id: 3, title: "Opening balance verified", desc: "Morning cash check completed successfully.", level: "success", time: "1 hr ago" },
];

const WORKFLOW_STEPS = [
  { id: 1, title: "Open shift & prepare counter", status: "done" as const, eta: "09:00 AM", owner: "Front Staff" },
  { id: 2, title: "Handle live customer orders", status: "current" as const, eta: "Now", owner: "Cashier" },
  { id: 3, title: "Restock shelf & verify items", status: "next" as const, eta: "02:00 PM", owner: "Store Staff" },
  { id: 4, title: "Closing support & handover", status: "next" as const, eta: "07:30 PM", owner: "Closing Team" },
];

const SHIFT_BLOCKS = [
  { id: 1, title: "Shift", value: "09:00 – 18:00" },
  { id: 2, title: "Break", value: "12:00 – 13:00" },
  { id: 3, title: "Rush Hour", value: "18:00 – 20:00" },
  { id: 4, title: "Manager Check", value: "17:30" },
];

const STAFF_NOTES = [
  "Check beverage shelf before evening rush.",
  "Confirm cashier counter is clean and ready.",
  "Review pending report before closing time.",
];

const CHECKLIST_ITEMS = [
  "Opening counter ready",
  "POS checked",
  "Shelf restocked",
  "Daily report updated",
  "Closing handover note prepared",
];

const INIT_SIDE: SidePanelId[] = [
  "manager-message",
  "notifications",
  "schedule",
  "quick-actions",
  "assistant",
  "announcements",
  "activity",
];

const INIT_BELOW: BelowPanelId[] = ["workflow", "staff-notes", "checklist"];

const SIDE_LABELS: Record<SidePanelId, string> = {
  "manager-message": "Manager Message",
  notifications: "Alerts",
  schedule: "Shift Today",
  "quick-actions": "Quick Actions",
  assistant: "AI Assistant",
  announcements: "Announcements",
  activity: "Activity",
};

const BELOW_LABELS: Record<BelowPanelId, string> = {
  workflow: "Shift Workflow",
  "staff-notes": "Staff Notes",
  checklist: "Daily Checklist",
};

const ADMIN_ROLES = new Set(["admin", "owner", "superviser", "supervisor"]);

function normalizeRole(role: unknown) {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/^role_/, "");
}

function canUseAdminRoutes(role: unknown) {
  return normalizeRole(role)
    .split(/[,\s]+/)
    .some((value) => ADMIN_ROLES.has(value));
}

const adminNavItems = [
  { label: "Admin Panel", icon: ShieldCheck, href: "/admin" },
  { label: "Admin Analytics", icon: BarChart3, href: "/admin/analytics" },
  { label: "Admin Orders", icon: Receipt, href: "/admin/orders" },
  { label: "Inventory", icon: Store, href: "/admin/inventory" },
  { label: "Tasks", icon: Clock3, href: "/admin/tasks" },
  { label: "Staff", icon: User2, href: "/admin/staff" },
  { label: "Add Staff", icon: UserPlus, href: "/admin/staff/add_staff" },
];

/* -------------------------------------------------------------------------- */
/* Theme helpers                                                              */
/* -------------------------------------------------------------------------- */

const DarkCtx = React.createContext(true);
const useDark = () => React.useContext(DarkCtx);

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function themeTokens(mode: ThemeMode) {
  const dark = mode === "dark";
  return {
    root: dark ? "bg-[#05040a] text-white" : "bg-[#fff8ed] text-slate-950",
    pageGlow: dark
      ? "radial-gradient(circle at 20% 5%, rgba(245,158,11,.22), transparent 30%), radial-gradient(circle at 86% 10%, rgba(99,102,241,.12), transparent 26%), #05040a"
      : "radial-gradient(circle at 16% 8%, rgba(245,158,11,.18), transparent 28%), radial-gradient(circle at 90% 4%, rgba(251,191,36,.14), transparent 25%), #fff8ed",
    card: dark
      ? "border-white/[0.08] bg-[#0d0a13]/80 shadow-[0_24px_80px_rgba(0,0,0,.42)]"
      : "border-amber-900/[0.08] bg-white/80 shadow-[0_18px_60px_rgba(120,72,20,.10)]",
    panel: dark ? "border-white/[0.07] bg-white/[0.035]" : "border-amber-900/[0.08] bg-white/70",
    soft: dark ? "border-white/[0.07] bg-white/[0.04]" : "border-amber-900/[0.08] bg-amber-50/70",
    sidebar: dark ? "border-white/[0.07] bg-[#080611]/92" : "border-amber-900/[0.08] bg-white/92",
    text: dark ? "text-white" : "text-slate-950",
    muted: dark ? "text-amber-100/55" : "text-slate-500",
    subtle: dark ? "text-amber-100/35" : "text-slate-400",
    input: dark
      ? "border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/35 focus:border-amber-400/50"
      : "border-amber-900/[0.10] bg-white text-slate-950 placeholder:text-slate-400 focus:border-amber-400",
    navActive: dark
      ? "border-blue-400/25 bg-[#0b3a75]/35 text-blue-100"
      : "border-[#0b3a75]/20 bg-[#0b3a75] text-white shadow-sm",
    navInactive: dark
      ? "border-transparent text-amber-100/55 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-white"
      : "border-transparent text-slate-500 hover:border-amber-200 hover:bg-amber-50 hover:text-slate-900",
  };
}

/* -------------------------------------------------------------------------- */
/* Decorative components                                                      */
/* -------------------------------------------------------------------------- */

function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap');
      * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
      .serif { font-family: 'DM Serif Display', serif !important; }
      .scrollbar-thin::-webkit-scrollbar { width: 4px; height: 4px; }
      .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
      .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(217,119,6,.28); border-radius: 999px; }
    `}</style>
  );
}

function LanternMark({ size = 44, lit }: { size?: number; lit: boolean }) {
  const h = size * 1.45;
  const id = React.useId().replace(/:/g, "");

  return (
    <svg width={size} height={h} viewBox="0 0 32 48" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`glow-${id}`} cx="50%" cy="48%" r="56%">
          <stop offset="0%" stopColor="#fff8d7" stopOpacity=".95" />
          <stop offset="36%" stopColor="#fbbf24" stopOpacity=".75" />
          <stop offset="75%" stopColor="#d97706" stopOpacity=".10" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`metal-${id}`} x1="8" y1="6" x2="24" y2="42">
          <stop stopColor="#d59b45" />
          <stop offset=".52" stopColor="#a76822" />
          <stop offset="1" stopColor="#7c4615" />
        </linearGradient>
        <linearGradient id={`body-${id}`} x1="6" y1="10" x2="26" y2="38">
          <stop stopColor={lit ? "#211407" : "#fff8e7"} />
          <stop offset="1" stopColor={lit ? "#100804" : "#efd8ad"} />
        </linearGradient>
      </defs>
      <line x1="16" y1="0" x2="16" y2="6" stroke="#a66b27" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="8" y="6" width="16" height="5" rx="2" fill={`url(#metal-${id})`} />
      <rect x="6" y="11" width="20" height="26" rx="4" fill={`url(#body-${id})`} stroke="#a66b27" strokeWidth="1" />
      <rect x="6" y="11" width="20" height="26" rx="4" fill={lit ? `url(#glow-${id})` : "rgba(255,255,255,.20)"} />
      {[11, 16, 21].map((x) => (
        <line key={x} x1={x} y1="12" x2={x} y2="36" stroke={lit ? "#6b3e10" : "#b47b34"} strokeWidth="1" opacity=".8" />
      ))}
      <motion.g animate={{ scale: lit ? [0.96, 1.06, 0.98] : [0.98, 1.02, 0.99], opacity: lit ? [0.85, 1, 0.88] : [0.6, 0.86, 0.64] }} transition={{ duration: lit ? 1.2 : 2.6, repeat: Infinity, ease: "easeInOut" }}>
        <ellipse cx="16" cy="26" rx="4" ry="6.2" fill="#f59e0b" opacity=".72" />
        <ellipse cx="16" cy="27" rx="2.35" ry="4" fill="#fde68a" opacity=".92" />
        <ellipse cx="16" cy="28" rx="1.1" ry="2" fill="#fff" opacity=".8" />
      </motion.g>
      <rect x="8" y="37" width="16" height="5" rx="2" fill={`url(#metal-${id})`} />
      <line x1="16" y1="42" x2="16" y2="47" stroke="#8f5b24" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="47" r="1.5" fill="#8f5b24" />
    </svg>
  );
}

function AmbientBackground({ dark }: { dark: boolean }) {
  const particles = React.useMemo(
    () =>
      Array.from({ length: dark ? 42 : 18 }).map((_, i) => ({
        id: i,
        x: `${(i * 29 + 9) % 100}%`,
        y: `${(i * 47 + 15) % 100}%`,
        size: dark ? 1.6 + (i % 3) : 70 + (i % 4) * 34,
        delay: (i * 0.17) % 4,
        duration: dark ? 2.2 + (i % 4) * 0.6 : 7 + (i % 3) * 2,
      })),
    [dark]
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: dark ? (p.id % 4 === 0 ? "#fde68a" : "#ffffff") : "rgba(245,158,11,.08)",
            filter: dark ? undefined : "blur(22px)",
          }}
          animate={dark ? { opacity: [0.08, 0.9, 0.08], scale: [0.7, 1.45, 0.7] } : { opacity: [0.35, 0.92, 0.35], scale: [0.92, 1.12, 0.92] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function MiniBulb({ className = "" }: { className?: string }) {
  const dark = useDark();
  return (
    <span className={cx("relative inline-flex h-5 w-5 items-center justify-center", className)}>
      {dark && <span className="absolute inset-0 rounded-full bg-amber-300/30 blur-md" />}
      <span className="absolute top-0 h-1.5 w-2 rounded bg-amber-700" />
      <span className="mt-1 h-3.5 w-3.5 rounded-full border border-amber-500/40 bg-[radial-gradient(circle_at_50%_35%,#fff8d7,#fbbf24_42%,#d97706)]" />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Generic UI                                                                 */
/* -------------------------------------------------------------------------- */

function ShellCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const dark = useDark();
  const tk = themeTokens(dark ? "dark" : "light");
  return <div className={cx("rounded-[28px] border backdrop-blur-2xl", tk.card, className)}>{children}</div>;
}

function PanelHeader({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: React.ReactNode }) {
  const dark = useDark();
  return (
    <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
      <div className="flex items-center gap-2.5">
        <span className="text-amber-400">{icon}</span>
        <span className={cx("text-xs font-black uppercase tracking-[.20em]", dark ? "text-amber-50" : "text-slate-900")}>{title}</span>
      </div>
      {badge}
    </div>
  );
}

function Badge({ children, tone = "amber" }: { children: React.ReactNode; tone?: "amber" | "green" | "blue" | "red" }) {
  const tones = {
    amber: "border-amber-400/25 bg-amber-400/10 text-amber-300",
    green: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    blue: "border-sky-400/25 bg-sky-400/10 text-sky-300",
    red: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  };
  return <span className={cx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.14em]", tones[tone])}>{children}</span>;
}

function formatLimit(value: number | null | undefined) {
  return value == null ? "Unlimited" : Number(value).toLocaleString();
}

function CurrentPlanCard({
  user,
  limits,
  onRefresh,
  refreshing,
}: {
  user: PosSessionUser | null;
  limits: PlanLimits;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const dark = useDark();
  const tk = themeTokens(dark ? "dark" : "light");
  const status = String(user?.shopStatus || "ACTIVE").toUpperCase();
  const statusTone = status === "ACTIVE" ? "green" : status === "EXPIRED" || status === "SUSPENDED" ? "red" : "amber";
  const plan = user?.subscriptionPlan || "Current plan";
  const endDate = user?.subscriptionEndDate
    ? new Date(user.subscriptionEndDate).toLocaleDateString()
    : "No end date";

  return (
    <ShellCard className="overflow-hidden">
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone as "amber" | "green" | "red"}>{status}</Badge>
            <span className={cx("text-xs font-black uppercase tracking-[.18em]", tk.subtle)}>Subscription</span>
          </div>
          <h2 className={cx("mt-2 text-2xl font-black tracking-tight", tk.text)}>{plan}</h2>
          <p className={cx("mt-1 text-sm", tk.muted)}>Ends: {endDate}</p>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
          {[
            ["Products", formatLimit(limits.maxProducts)],
            ["Staff", formatLimit(limits.maxStaff)],
            ["Monthly Receipts", formatLimit(limits.maxReceiptsPerMonth)],
          ].map(([label, value]) => (
            <div key={label} className={cx("rounded-[20px] border p-4", tk.panel)}>
              <p className={cx("text-[10px] font-black uppercase tracking-[.16em]", tk.subtle)}>{label}</p>
              <p className={cx("mt-1 text-lg font-black", tk.text)}>{value}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className={cx("inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xs font-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60", tk.panel)}
        >
          <RefreshCw className={cx("h-4 w-4", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>
    </ShellCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Sidebar                                                                    */
/* -------------------------------------------------------------------------- */

function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: { collapsed: boolean; setCollapsed: (v: boolean) => void; mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
  const dark = useDark();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const accessToken = String((session as any)?.accessToken || "");
  const tk = themeTokens(dark ? "dark" : "light");
  const user = session?.user as any | undefined;
  const role = user?.role || "staff";
  const isAdmin = canUseAdminRoutes(role);
  const [posUser, setPosUser] = React.useState<PosSessionUser | null>(null);
  const [features, setFeatures] = React.useState<ShopFeatureSettings | null>(null);
  const [featuresLoading, setFeaturesLoading] = React.useState(true);
  const [featuresError, setFeaturesError] = React.useState("");
  const [featuresErrorTitle, setFeaturesErrorTitle] = React.useState("Menu settings မဖတ်နိုင်ပါ");

  const loadFeatures = React.useCallback(async () => {
    if (status === "loading") {
      setFeaturesLoading(true);
      return;
    }

    if (status === "unauthenticated") {
      redirectToLogin();
      return;
    }

    if (accessToken) saveToken(accessToken);

    try {
      setFeaturesLoading(true);
      setFeaturesError("");
      setFeaturesErrorTitle("Menu settings မဖတ်နိုင်ပါ");
      setPosUser(getPosUser());
      setFeatures(await getMyShopFeatures());
    } catch (err) {
      if (err instanceof BackendApiError && (err.code === "UNAUTHORIZED" || err.code === "LOGIN_REQUIRED")) {
        redirectToLogin();
        return;
      }

      if (err instanceof BackendApiError && err.code === "ENDPOINT_MISSING") {
        setFeaturesErrorTitle("Backend endpoint missing");
      } else if (err instanceof BackendApiError && err.code === "FEATURE_DISABLED") {
        setFeaturesErrorTitle("Feature disabled");
      }

      setFeaturesError(err instanceof Error ? err.message : "Feature settings load failed.");
    } finally {
      setFeaturesLoading(false);
    }
  }, [accessToken, status]);

  React.useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const businessType = React.useMemo(
    () =>
      normalizeBusinessType(
        features?.businessType ||
          features?.business_type ||
          user?.businessType ||
          user?.business_type ||
          user?.shopBusinessType ||
          user?.shop_business_type ||
          (posUser as any)?.businessType ||
          (posUser as any)?.business_type ||
          (posUser as any)?.shopBusinessType ||
          (posUser as any)?.shop_business_type,
      ),
    [features, posUser, user],
  );

  const visibleOwnerRouteGroups = React.useMemo(
    () =>
      SHOP_OWNER_ROUTE_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (!routeMatchesBusinessType(item, businessType)) return false;
          if (item.alwaysVisible) return true;
          if (!features?.[item.featureKey]) return false;
          return routeMatchesBusinessType(item, businessType);
        }),
      })).filter((group) => group.items.length > 0),
    [businessType, features],
  );

  const visibleOwnerRouteCount = React.useMemo(
    () => visibleOwnerRouteGroups.reduce((total, group) => total + group.items.length, 0),
    [visibleOwnerRouteGroups],
  );

  const menuSections = isAdmin
    ? [
        ...visibleOwnerRouteGroups,
        { label: "Admin Routes", items: adminNavItems },
      ]
    : visibleOwnerRouteGroups;

  return (
    <>
      <AnimatePresence>
        {mobileOpen && <motion.button aria-label="Close menu" className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />}
      </AnimatePresence>

      <motion.aside
        animate={{ width: collapsed ? 76 : 250 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", sans-serif' }}
        className={cx(
          "scrollbar-thin fixed left-0 top-0 z-50 flex h-dvh flex-col overflow-hidden border-r backdrop-blur-2xl transition-transform lg:translate-x-0",
          tk.sidebar,
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/5 px-4">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <LanternMark size={28} lit={dark} />
              <div>
                <p className="text-[12px] font-black tracking-[.25em] text-amber-400">LANTERN</p>
                <p className={cx("text-[10px] font-bold tracking-[.20em]", tk.muted)}>MARKET POS</p>
              </div>
            </div>
          ) : (
            <LanternMark size={26} lit={dark} />
          )}

          <button className="rounded-xl p-2 text-amber-200/70 hover:bg-white/5 lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="h-4 w-4" />
          </button>

          {!collapsed && (
            <button className="hidden rounded-xl p-2 text-amber-200/60 hover:bg-white/5 lg:block" onClick={() => setCollapsed(true)}>
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="border-b border-white/5 p-3">
          <div className={cx("flex items-center gap-3 rounded-2xl border p-3", tk.panel, collapsed && "justify-center") }>
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-400/10 text-sm font-black text-amber-300">
              ST
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#080611] bg-emerald-400" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className={cx("truncate text-sm font-bold", tk.text)}>{user?.name || user?.username || "Staff Member"}</p>
                <p className={cx("truncate text-xs", tk.muted)}>{isAdmin ? "Admin access" : "Staff access"} · {role}</p>
              </div>
            )}
          </div>
        </div>

        {!collapsed && (
          <div className="px-3 py-3">
            <div className={cx("flex items-center gap-2 rounded-2xl border px-3 py-2.5", tk.panel)}>
              <Search className={cx("h-4 w-4", tk.subtle)} />
              <input className={cx("w-full bg-transparent text-sm outline-none", tk.text)} placeholder="Search menu..." />
            </div>
          </div>
        )}

        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-2 font-sans">
          {featuresLoading && (
            <div className="space-y-2 px-1 py-2">
              {[0, 1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className={cx(
                    "h-11 animate-pulse rounded-2xl border",
                    dark ? "border-white/[0.05] bg-white/[0.04]" : "border-slate-100 bg-slate-100",
                  )}
                />
              ))}
            </div>
          )}

          {!featuresLoading && featuresError && (
            <div className={cx("mx-1 rounded-2xl border p-3 text-xs leading-5", tk.panel)}>
              {!collapsed && (
                <>
                  <p className={cx("font-bold", tk.text)}>{featuresErrorTitle}</p>
                  <p className={cx("mt-1", tk.muted)}>{featuresError}</p>
                  <button
                    className="mt-3 rounded-xl bg-[#0b3a75] px-3 py-2 text-xs font-bold text-white"
                    onClick={loadFeatures}
                  >
                    Retry
                  </button>
                </>
              )}
              {collapsed && (
                <button className="flex w-full justify-center text-blue-300" onClick={loadFeatures} title={featuresError}>
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {!featuresLoading && visibleOwnerRouteCount === 0 && !collapsed && (
            <div className={cx("mx-1 rounded-2xl border p-3 text-xs leading-5", tk.panel, tk.muted)}>
              Available menu items မရှိသေးပါ။
            </div>
          )}

          {!featuresLoading && menuSections.map((section) => (
            <div key={section.label} className="space-y-1">
              {!collapsed && (
                <div className={cx("px-3 pb-0.5 pt-2.5 text-[9px] font-black uppercase tracking-[.16em]", tk.subtle)}>
                  {section.label}
                </div>
              )}

              {section.items.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setMobileOpen(false);
                    }}
                    className={cx(
                      "group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200",
                      active ? tk.navActive : tk.navInactive,
                      collapsed && "justify-center px-0"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {!collapsed && <span className="text-[12px] font-bold">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/5 p-3">
          {[
            { label: "Help", icon: HelpCircle },
            { label: "Settings", icon: Settings },
            { label: "Sign Out", icon: LogOut, danger: true },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} className={cx("flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/5", collapsed && "justify-center px-0", item.danger ? "text-rose-400" : tk.muted)}>
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="text-[13px] font-bold">{item.label}</span>}
              </button>
            );
          })}
          {collapsed && (
            <button className="mt-2 flex w-full justify-center rounded-2xl py-3 text-amber-300/70 hover:bg-white/5" onClick={() => setCollapsed(false)}>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.aside>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Task Board                                                                 */
/* -------------------------------------------------------------------------- */

function useDashboardSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 110, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
}

function priorityMeta(priority: TaskPriority) {
  return {
    high: { label: "High", dot: "bg-rose-400", className: "border-rose-400/20 bg-rose-400/10 text-rose-300" },
    medium: { label: "Medium", dot: "bg-amber-400", className: "border-amber-400/20 bg-amber-400/10 text-amber-300" },
    low: { label: "Low", dot: "bg-slate-400", className: "border-slate-400/20 bg-slate-400/10 text-slate-300" },
  }[priority];
}

function statusMeta(status: TaskStatus) {
  return {
    Pending: { icon: Clock3, tone: "bg-slate-400", className: "border-slate-400/20 bg-slate-400/10 text-slate-300" },
    "In Progress": { icon: Zap, tone: "bg-amber-400", className: "border-amber-400/20 bg-amber-400/10 text-amber-300" },
    Done: { icon: CheckCircle2, tone: "bg-emerald-400", className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" },
  }[status];
}

function SortableTaskCard({ task, onCycleStatus, overlay = false }: { task: Task; onCycleStatus: (id: string) => void; overlay?: boolean }) {
  const dark = useDark();
  const tk = themeTokens(dark ? "dark" : "light");
  const sortable = useSortable({ id: task.id, data: { type: "task" } });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;
  const priority = priorityMeta(task.priority);
  const status = statusMeta(task.status);

  return (
    <motion.div
      ref={overlay ? undefined : setNodeRef}
      layout
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cx("group relative rounded-[24px] border p-4 transition-all", tk.panel, isDragging && "scale-[1.02] opacity-40", overlay && "rotate-2 shadow-2xl")}
    >
      <div className={cx("absolute bottom-4 left-0 top-4 w-1 rounded-r-full", priority.dot)} />
      <div className="pl-2">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className={cx("font-mono text-[11px] font-black tracking-wider", tk.subtle)}>{task.id}</p>
            <p className={cx("mt-1 line-clamp-2 text-[14px] font-black leading-6", task.status === "Done" && "line-through opacity-55", tk.text)}>{task.title}</p>
          </div>
          <button {...listeners} {...attributes} className={cx("touch-none rounded-xl p-2 opacity-0 transition group-hover:opacity-100", tk.muted)}>
            <GripVertical className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className={cx("inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-bold", priority.className)}>
            <span className={cx("h-1.5 w-1.5 rounded-full", priority.dot)} />
            {priority.label}
          </span>
          <span className={cx("inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-bold", status.className)}>{task.owner}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className={cx("inline-flex items-center gap-1.5 text-xs font-semibold", tk.muted)}>
            <Clock3 className="h-3.5 w-3.5" /> {task.due}
          </span>
          <button onClick={() => onCycleStatus(task.id)} className={cx("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-black transition hover:scale-[1.02] active:scale-95", status.className)}>
            <span className={cx("h-1.5 w-1.5 rounded-full", status.tone)} />
            {task.status}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function TaskColumn({ status, tasks, onCycleStatus }: { status: TaskStatus; tasks: Task[]; onCycleStatus: (id: string) => void }) {
  const dark = useDark();
  const tk = themeTokens(dark ? "dark" : "light");
  const { setNodeRef, isOver } = useDroppable({ id: `column-${status}`, data: { type: "column", status } });
  const meta = statusMeta(status);
  const Icon = meta.icon;

  return (
    <div ref={setNodeRef} className={cx("flex min-h-[430px] flex-col rounded-[28px] border transition-all duration-200", tk.card, isOver && "scale-[1.01] ring-2 ring-amber-400/35") }>
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className={cx("flex h-9 w-9 items-center justify-center rounded-2xl border", meta.className)}>
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <p className={cx("text-sm font-black", tk.text)}>{status}</p>
            <p className={cx("text-xs", tk.muted)}>{tasks.length} task{tasks.length === 1 ? "" : "s"}</p>
          </div>
        </div>
        <button className={cx("rounded-2xl border p-2 transition hover:scale-105", tk.panel)}>
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-4">
          {tasks.length ? (
            tasks.map((task) => <SortableTaskCard key={task.id} task={task} onCycleStatus={onCycleStatus} />)
          ) : (
            <div className={cx("flex h-36 flex-col items-center justify-center rounded-[24px] border border-dashed", dark ? "border-white/10" : "border-amber-900/10") }>
              <LanternMark size={42} lit={dark} />
              <p className={cx("mt-2 text-xs font-semibold", tk.muted)}>Drop task here</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function reorderTasks(tasks: Task[], activeId: string, overId: string): Task[] {
  const activeTask = tasks.find((task) => task.id === activeId);
  if (!activeTask) return tasks;

  const isColumn = overId.startsWith("column-");
  const nextStatus = isColumn ? (overId.replace("column-", "") as TaskStatus) : tasks.find((task) => task.id === overId)?.status ?? activeTask.status;
  const withoutActive = tasks.filter((task) => task.id !== activeId);
  const nextTask = { ...activeTask, status: nextStatus };

  const groups: Record<TaskStatus, Task[]> = {
    Pending: withoutActive.filter((task) => task.status === "Pending"),
    "In Progress": withoutActive.filter((task) => task.status === "In Progress"),
    Done: withoutActive.filter((task) => task.status === "Done"),
  };

  const targetGroup = [...groups[nextStatus]];
  const targetIndex = isColumn ? -1 : targetGroup.findIndex((task) => task.id === overId);
  if (targetIndex === -1) targetGroup.push(nextTask);
  else targetGroup.splice(targetIndex, 0, nextTask);

  return [
    ...(nextStatus === "Pending" ? targetGroup : groups.Pending),
    ...(nextStatus === "In Progress" ? targetGroup : groups["In Progress"]),
    ...(nextStatus === "Done" ? targetGroup : groups.Done),
  ];
}

/* -------------------------------------------------------------------------- */
/* Side panels                                                                */
/* -------------------------------------------------------------------------- */

function ManagerMessage() {
  const dark = useDark();
  const tk = themeTokens(dark ? "dark" : "light");
  return (
    <div>
      <PanelHeader icon={<ShieldCheck className="h-4 w-4" />} title="Manager Message" badge={<Badge>Priority</Badge>} />
      <div className="p-4">
        <div className="relative overflow-hidden rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4">
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-300/20 blur-2xl" />
          <div className="relative flex gap-3">
            <LanternMark size={36} lit={dark} />
            <div>
              <p className={cx("text-sm font-black", tk.text)}>Support rush-hour checkout</p>
              <p className={cx("mt-1 text-xs leading-relaxed", tk.muted)}>Keep customer flow steady, help with restocking, and finish pending reports before closing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsPanel({ notifications }: { notifications: NotificationItem[] }) {
  const dark = useDark();
  const tk = themeTokens(dark ? "dark" : "light");
  const meta = {
    info: "border-sky-400/20 bg-sky-400/10 text-sky-300",
    warning: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  };

  return (
    <div>
      <PanelHeader icon={<Bell className="h-4 w-4" />} title="Alerts" badge={<Badge tone="red">Live</Badge>} />
      <div className="space-y-2 p-4">
        {notifications.slice(0, 4).map((item) => (
          <div key={item.id} className={cx("rounded-[20px] border p-3", meta[item.level])}>
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-black">{item.title}</p>
              <span className="shrink-0 font-mono text-[10px] opacity-70">{item.time}</span>
            </div>
            <p className={cx("mt-1 text-xs leading-relaxed", tk.muted)}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SchedulePanel() {
  const dark = useDark();
  const tk = themeTokens(dark ? "dark" : "light");
  return (
    <div>
      <PanelHeader icon={<CalendarClock className="h-4 w-4" />} title="Shift Today" />
      <div className="grid grid-cols-2 gap-3 p-4">
        {SHIFT_BLOCKS.map((block) => (
          <div key={block.id} className={cx("rounded-[20px] border p-3", tk.panel)}>
            <p className={cx("text-[10px] font-black uppercase tracking-[.16em]", tk.subtle)}>{block.title}</p>
            <p className={cx("mt-1 text-sm font-black", tk.text)}>{block.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActionsPanel({ onReportIssue }: { onReportIssue: () => void }) {
  const dark = useDark();
  const tk = themeTokens(dark ? "dark" : "light");
  const actions = [
    { label: "My Tasks", icon: ClipboardList, color: "text-sky-300" },
    { label: "Schedule", icon: CalendarClock, color: "text-emerald-300" },
    { label: "Notices", icon: Bell, color: "text-amber-300" },
    { label: "Scan ID", icon: ScanLine, color: "text-violet-300" },
  ];
  return (
    <div>
      <PanelHeader icon={<Sparkles className="h-4 w-4" />} title="Quick Actions" />
      <div className="grid grid-cols-2 gap-3 p-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button key={action.label} className={cx("group rounded-[20px] border p-4 text-center transition hover:-translate-y-0.5", tk.panel)}>
              <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 transition group-hover:scale-110">
                <Icon className={cx("h-4 w-4", action.color)} />
              </span>
              <span className={cx("text-xs font-black", tk.text)}>{action.label}</span>
            </button>
          );
        })}
      </div>
      <div className="px-4 pb-4">
        <button onClick={onReportIssue} className="flex w-full items-center justify-center gap-2 rounded-[20px] border border-rose-400/20 bg-rose-400/10 py-3 text-xs font-black text-rose-300 transition hover:scale-[1.01] active:scale-95">
          <Siren className="h-4 w-4" /> Report Issue
        </button>
      </div>
    </div>
  );
}

function AssistantPanel({ tasks }: { tasks: Task[] }) {
  const dark = useDark();
  const tk = themeTokens(dark ? "dark" : "light");
  const [q, setQ] = React.useState("");
  const [answer, setAnswer] = React.useState("Ask what to do next, which task is urgent, or how to close the shift.");

  function ask(value = q) {
    const query = value.trim().toLowerCase();
    const pending = tasks.filter((task) => task.status === "Pending");
    const active = tasks.filter((task) => task.status === "In Progress");

    if (!query) return setAnswer("Type a question first.");
    if (query.includes("next") || query.includes("what should")) {
      const next = pending[0] ?? active[0];
      return setAnswer(next ? `Next: ${next.title} before ${next.due}.` : "All tasks look good!");
    }
    if (query.includes("urgent") || query.includes("priority")) {
      const urgent = tasks.find((task) => task.priority === "high" && task.status !== "Done");
      return setAnswer(urgent ? `High priority: ${urgent.title}. Finish before ${urgent.due}.` : "No urgent tasks right now.");
    }
    if (query.includes("clos")) return setAnswer("Before closing: clean counter, verify register, update sales report, and hand over notes.");
    return setAnswer("Tip: finish pending high-priority tasks first and keep checkout support ready.");
  }

  return (
    <div>
      <PanelHeader icon={<Brain className="h-4 w-4" />} title="AI Assistant" badge={<Badge tone="green">Ready</Badge>} />
      <div className="space-y-3 p-4">
        <div className="relative overflow-hidden rounded-[22px] border border-amber-400/20 bg-amber-400/10 p-4">
          <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-amber-300/20 blur-2xl" />
          <div className="relative flex gap-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p className={cx("text-xs leading-relaxed", tk.text)}>{answer}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()} className={cx("min-w-0 flex-1 rounded-2xl border px-3 py-2.5 text-sm outline-none transition", tk.input)} placeholder="Ask anything..." />
          <button onClick={() => ask()} className="rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 px-3 text-slate-950 shadow-lg shadow-amber-900/20 transition hover:scale-105 active:scale-95">
            <Send className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {["Next task?", "Any urgent?", "Closing steps"].map((chip) => (
            <button key={chip} onClick={() => { setQ(chip); ask(chip); }} className={cx("rounded-full border px-3 py-1.5 text-[11px] font-bold transition", tk.panel)}>
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnnouncementsPanel() {
  const dark = useDark();
  const tk = themeTokens(dark ? "dark" : "light");
  return (
    <div>
      <PanelHeader icon={<Megaphone className="h-4 w-4" />} title="Announcements" />
      <div className="space-y-2 p-4">
        {ANNOUNCEMENTS.map((item, index) => (
          <div key={item.id} className={cx("relative rounded-[20px] border p-3", tk.panel)}>
            {index === 0 && <MiniBulb className="absolute right-3 top-3" />}
            <div className="flex items-start justify-between gap-2">
              <p className={cx("text-xs font-black", tk.text)}>{item.title}</p>
              <span className={cx("shrink-0 font-mono text-[10px]", tk.subtle)}>{item.time}</span>
            </div>
            <p className={cx("mt-1 text-xs leading-relaxed", tk.muted)}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityPanel({ activity }: { activity: ActivityItem[] }) {
  const dark = useDark();
  const tk = themeTokens(dark ? "dark" : "light");
  const meta = {
    task: { icon: CheckCircle2, className: "bg-emerald-400/10 text-emerald-300" },
    notice: { icon: Bell, className: "bg-sky-400/10 text-sky-300" },
    support: { icon: Sparkles, className: "bg-amber-400/10 text-amber-300" },
  };

  return (
    <div>
      <PanelHeader icon={<Activity className="h-4 w-4" />} title="Activity" />
      <div className="space-y-1 p-4">
        {activity.slice(0, 5).map((item) => {
          const Icon = meta[item.type].icon;
          return (
            <div key={item.id} className="flex items-start gap-3 rounded-2xl px-1 py-2">
              <span className={cx("flex h-7 w-7 shrink-0 items-center justify-center rounded-2xl", meta[item.type].className)}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              <p className={cx("flex-1 text-xs font-semibold leading-relaxed", tk.text)}>{item.title}</p>
              <span className={cx("font-mono text-[10px]", tk.subtle)}>{item.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PanelRenderer({ id, tasks, notifications, activity, onReportIssue }: { id: SidePanelId; tasks: Task[]; notifications: NotificationItem[]; activity: ActivityItem[]; onReportIssue: () => void }) {
  switch (id) {
    case "manager-message": return <ManagerMessage />;
    case "notifications": return <NotificationsPanel notifications={notifications} />;
    case "schedule": return <SchedulePanel />;
    case "quick-actions": return <QuickActionsPanel onReportIssue={onReportIssue} />;
    case "assistant": return <AssistantPanel tasks={tasks} />;
    case "announcements": return <AnnouncementsPanel />;
    case "activity": return <ActivityPanel activity={activity} />;
  }
}

/* -------------------------------------------------------------------------- */
/* Bottom panels                                                              */
/* -------------------------------------------------------------------------- */

function WorkflowContent() {
  const dark = useDark();
  const tk = themeTokens(dark ? "dark" : "light");
  return (
    <div>
      <PanelHeader icon={<TrendingUp className="h-4 w-4" />} title="Shift Workflow" />
      <div className="space-y-1 p-4">
        {WORKFLOW_STEPS.map((step, index) => {
          const color = step.status === "done" ? "bg-emerald-400" : step.status === "current" ? "bg-amber-400" : "bg-slate-400";
          return (
            <div key={step.id} className={cx("flex gap-3 rounded-[20px] p-3", step.status === "current" && "border border-amber-400/20 bg-amber-400/10") }>
              <div className="flex shrink-0 flex-col items-center gap-1 pt-0.5">
                <span className={cx("flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-slate-950", color)}>{step.status === "done" ? "✓" : index + 1}</span>
                {index < WORKFLOW_STEPS.length - 1 && <span className="h-7 w-px bg-white/10" />}
              </div>
              <div>
                <p className={cx("text-sm font-black", step.status === "done" && "line-through opacity-50", tk.text)}>{step.title}</p>
                <p className={cx("mt-1 text-xs", tk.muted)}>{step.eta} · {step.owner}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StaffNotesContent() {
  const dark = useDark();
  const tk = themeTokens(dark ? "dark" : "light");
  return (
    <div>
      <PanelHeader icon={<NotebookPen className="h-4 w-4" />} title="Staff Notes" />
      <div className="space-y-2 p-4">
        {STAFF_NOTES.map((note) => (
          <div key={note} className={cx("flex gap-3 rounded-[20px] border p-3", tk.panel)}>
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
            <p className={cx("text-xs font-semibold leading-relaxed", tk.text)}>{note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChecklistContent() {
  const dark = useDark();
  const tk = themeTokens(dark ? "dark" : "light");
  const [checked, setChecked] = React.useState<Set<number>>(new Set([0, 1]));

  function toggle(index: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div>
      <PanelHeader icon={<CheckCircle2 className="h-4 w-4" />} title="Daily Checklist" badge={<Badge tone="green">{checked.size}/{CHECKLIST_ITEMS.length}</Badge>} />
      <div className="space-y-1 p-4">
        {CHECKLIST_ITEMS.map((item, index) => {
          const active = checked.has(index);
          return (
            <button key={item} onClick={() => toggle(index)} className="flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition hover:bg-white/5">
              <span className={cx("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2", active ? "border-emerald-400 bg-emerald-400" : "border-white/15")}>{active && <CheckCircle2 className="h-3 w-3 text-slate-950" />}</span>
              <span className={cx("text-sm font-bold", active && "line-through opacity-45", tk.text)}>{item}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BelowRenderer({ id }: { id: BelowPanelId }) {
  switch (id) {
    case "workflow": return <WorkflowContent />;
    case "staff-notes": return <StaffNotesContent />;
    case "checklist": return <ChecklistContent />;
  }
}

function SortablePanel({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { type: "panel" } });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cx("group relative", isDragging && "scale-[1.02] opacity-50") }>
      <ShellCard className="relative overflow-hidden">
        <button {...attributes} {...listeners} className="absolute right-3 top-3 z-10 rounded-xl p-2 text-amber-200/45 opacity-0 transition hover:bg-white/5 group-hover:opacity-100">
          <GripVertical className="h-4 w-4" />
        </button>
        {children}
      </ShellCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(date);
}

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function completionPct(tasks: Task[]) {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((task) => task.status === "Done").length / tasks.length) * 100);
}

/* -------------------------------------------------------------------------- */
/* Main page                                                                  */
/* -------------------------------------------------------------------------- */

export default function StaffDashboardPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const accessToken = String((session as any)?.accessToken || "");
  const [mounted, setMounted] = React.useState(false);
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS);
  const [sidePanels, setSidePanels] = React.useState<SidePanelId[]>(INIT_SIDE);
  const [belowPanels, setBelowPanels] = React.useState<BelowPanelId[]>(INIT_BELOW);
  const [activeTaskId, setActiveTaskId] = React.useState<string | null>(null);
  const [activeSideId, setActiveSideId] = React.useState<SidePanelId | null>(null);
  const [activeBelowId, setActiveBelowId] = React.useState<BelowPanelId | null>(null);
  const [now, setNow] = React.useState<Date | null>(null);
  const [activity, setActivity] = React.useState<ActivityItem[]>(INITIAL_ACTIVITY);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [issueSent, setIssueSent] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [planUser, setPlanUser] = React.useState<PosSessionUser | null>(null);
  const [planLimits, setPlanLimits] = React.useState<PlanLimits>(() => getPlanLimits());
  const [planRefreshing, setPlanRefreshing] = React.useState(false);

  const taskSensors = useDashboardSensors();
  const sideSensors = useDashboardSensors();
  const belowSensors = useDashboardSensors();

  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  React.useEffect(() => {
    setPlanUser(getPosUser());
    setPlanLimits(getPlanLimits());
  }, []);

  const dark = mounted ? resolvedTheme !== "light" : true;
  const mode: ThemeMode = dark ? "dark" : "light";
  const tk = themeTokens(mode);
  const done = tasks.filter((task) => task.status === "Done").length;
  const urgent = tasks.filter((task) => task.priority === "high" && task.status !== "Done").length;
  const pct = completionPct(tasks);
  const activeTask = activeTaskId ? tasks.find((task) => task.id === activeTaskId) ?? null : null;
  const dateLabel = now ? formatDate(now) : "Today";
  const greeting = now ? getGreeting(now.getHours()) : "Welcome";
  const clockLabel = now ? formatClock(now) : "--:--";

  function pushActivity(title: string, type: ActivityItem["type"]) {
    setActivity((prev) => [{ id: Date.now(), title, time: formatClock(new Date()), type }, ...prev]);
  }

  function cycleTaskStatus(id: string) {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, status: STATUS_ORDER[(STATUS_ORDER.indexOf(task.status) + 1) % STATUS_ORDER.length] } : task)));
    pushActivity(`Task status updated: ${id}`, "task");
  }

  function reportIssue() {
    setIssueSent(true);
    setNotifications((prev) => [{ id: Date.now(), title: "Issue reported", desc: "Urgent request submitted to manager.", level: "warning", time: "Just now" }, ...prev]);
    pushActivity("Urgent issue report submitted", "support");
    window.setTimeout(() => setIssueSent(false), 2800);
  }

  async function refreshPlan() {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      redirectToLogin();
      return;
    }

    if (accessToken) saveToken(accessToken);

    try {
      setPlanRefreshing(true);
      await refreshMyPlanSession();
      setPlanUser(getPosUser());
      setPlanLimits(getPlanLimits());
      pushActivity("Subscription plan refreshed", "notice");
    } catch (error) {
      if (error instanceof BackendApiError && (error.code === "UNAUTHORIZED" || error.code === "LOGIN_REQUIRED")) {
        redirectToLogin();
        return;
      }

      setNotifications((prev) => [
        {
          id: Date.now(),
          title: "Plan refresh failed",
          desc: error instanceof Error ? error.message : "Could not refresh plan data.",
          level: "warning",
          time: "Just now",
        },
        ...prev,
      ]);
    } finally {
      setPlanRefreshing(false);
    }
  }

  function onTaskDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    if (tasks.some((task) => task.id === id)) setActiveTaskId(id);
  }

  function onTaskDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    if (overId && activeId !== overId && tasks.some((task) => task.id === activeId)) {
      setTasks((prev) => reorderTasks(prev, activeId, overId));
      pushActivity(`Task moved: ${activeId}`, "task");
    }
    setActiveTaskId(null);
  }

  function onSideDragStart(event: DragStartEvent) {
    const id = String(event.active.id) as SidePanelId;
    if (sidePanels.includes(id)) setActiveSideId(id);
  }

  function onSideDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id) as SidePanelId;
    const overId = event.over ? (String(event.over.id) as SidePanelId) : null;
    if (overId && activeId !== overId && sidePanels.includes(activeId) && sidePanels.includes(overId)) {
      setSidePanels((prev) => arrayMove(prev, prev.indexOf(activeId), prev.indexOf(overId)));
    }
    setActiveSideId(null);
  }

  function onBelowDragStart(event: DragStartEvent) {
    const id = String(event.active.id) as BelowPanelId;
    if (belowPanels.includes(id)) setActiveBelowId(id);
  }

  function onBelowDragEnd(event: DragEndEvent) {
    const activeId = String(event.active.id) as BelowPanelId;
    const overId = event.over ? (String(event.over.id) as BelowPanelId) : null;
    if (overId && activeId !== overId && belowPanels.includes(activeId) && belowPanels.includes(overId)) {
      setBelowPanels((prev) => arrayMove(prev, prev.indexOf(activeId), prev.indexOf(overId)));
    }
    setActiveBelowId(null);
  }

  if (!mounted) {
    return (
      <DarkCtx.Provider value={true}>
        <FontImport />
        <div
          className={cx("min-h-dvh overflow-hidden", themeTokens("dark").root)}
          style={{ background: themeTokens("dark").pageGlow }}
        />
      </DarkCtx.Provider>
    );
  }

  return (
    <DarkCtx.Provider value={dark}>
      <FontImport />
      <div className={cx("min-h-dvh overflow-hidden", tk.root)} style={{ background: tk.pageGlow }}>
        <AmbientBackground dark={dark} />
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main className={cx("relative z-10 min-h-dvh transition-[padding] duration-300", collapsed ? "lg:pl-[76px]" : "lg:pl-[250px]")}>
          <div className="mx-auto max-w-[1780px] space-y-6 p-4 sm:p-6 lg:p-8">
            <ShellCard className="sticky top-4 z-30 overflow-hidden">
              <div className="flex flex-col gap-4 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-3">
                  <button className={cx("rounded-2xl border p-3 lg:hidden", tk.panel)} onClick={() => setMobileOpen(true)}>
                    <Menu className="h-5 w-5" />
                  </button>
                  <div className="hidden sm:block">
                    <LanternMark size={44} lit={dark} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{dateLabel}</Badge>
                      <Badge tone="green">Live Shift</Badge>
                    </div>
                    <h1 className={cx("serif mt-2 text-3xl leading-tight sm:text-4xl", tk.text)}>{greeting}, Staff</h1>
                    <p className={cx("mt-1 text-sm", tk.muted)}>Manage tasks, shift updates, alerts, and daily workflow from one production dashboard.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className={cx("rounded-2xl border px-4 py-3 text-right", tk.panel)}>
                    <p className={cx("font-mono text-xl font-black", tk.text)}>{clockLabel}</p>
                    <p className={cx("text-[10px] font-bold uppercase tracking-[.18em]", tk.subtle)}>Local time</p>
                  </div>
                  <button onClick={() => setTheme(dark ? "light" : "dark")} className={cx("group relative overflow-hidden rounded-2xl border px-4 py-3 transition hover:scale-[1.02] active:scale-95", tk.panel)}>
                    <span className="absolute inset-0 bg-amber-400/10 opacity-0 transition group-hover:opacity-100" />
                    <span className="relative flex items-center gap-2 text-sm font-black">
                      <LanternMark size={24} lit={dark} />
                      {dark ? "Night" : "Day"}
                    </span>
                  </button>
                </div>
              </div>
            </ShellCard>

            <CurrentPlanCard
              user={planUser}
              limits={planLimits}
              onRefresh={refreshPlan}
              refreshing={planRefreshing}
            />

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Total Tasks", value: tasks.length, icon: ClipboardList, tone: "text-amber-300", bg: "bg-amber-400/10" },
                { label: "Completed", value: done, icon: CheckCircle2, tone: "text-emerald-300", bg: "bg-emerald-400/10" },
                { label: "Urgent", value: urgent, icon: Siren, tone: "text-rose-300", bg: "bg-rose-400/10" },
                { label: "Efficiency", value: `${pct}%`, icon: TrendingUp, tone: "text-sky-300", bg: "bg-sky-400/10" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <ShellCard key={stat.label} className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={cx("flex h-12 w-12 items-center justify-center rounded-2xl", stat.bg)}>
                        <Icon className={cx("h-5 w-5", stat.tone)} />
                      </div>
                      <div>
                        <p className={cx("text-3xl font-black tracking-tight", tk.text)}>{stat.value}</p>
                        <p className={cx("text-xs font-bold uppercase tracking-[.14em]", tk.muted)}>{stat.label}</p>
                      </div>
                    </div>
                  </ShellCard>
                );
              })}
            </section>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
              <section className="min-w-0 space-y-6">
                <ShellCard className="overflow-hidden p-4 sm:p-5">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-amber-300" />
                        <p className={cx("text-xs font-black uppercase tracking-[.22em]", tk.muted)}>Task Board</p>
                      </div>
                      <h2 className={cx("mt-1 text-xl font-black", tk.text)}>Today’s operational tasks</h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-white/10">
                        <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-400" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7 }} />
                      </div>
                      <span className="text-sm font-black text-amber-300">{pct}%</span>
                    </div>
                  </div>

                  <DndContext sensors={taskSensors} collisionDetection={closestCenter} onDragStart={onTaskDragStart} onDragEnd={onTaskDragEnd} onDragCancel={() => setActiveTaskId(null)}>
                    <div className="grid grid-cols-1 gap-4 2xl:grid-cols-3">
                      {STATUS_ORDER.map((status) => (
                        <TaskColumn key={status} status={status} tasks={tasks.filter((task) => task.status === status)} onCycleStatus={cycleTaskStatus} />
                      ))}
                    </div>
                    <DragOverlay>{activeTask ? <SortableTaskCard task={activeTask} onCycleStatus={cycleTaskStatus} overlay /> : null}</DragOverlay>
                  </DndContext>
                </ShellCard>

                <DndContext sensors={belowSensors} collisionDetection={closestCenter} onDragStart={onBelowDragStart} onDragEnd={onBelowDragEnd} onDragCancel={() => setActiveBelowId(null)}>
                  <SortableContext items={belowPanels} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      {belowPanels.map((id) => (
                        <SortablePanel key={id} id={id}>
                          <BelowRenderer id={id} />
                        </SortablePanel>
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay>{activeBelowId ? <ShellCard><BelowRenderer id={activeBelowId} /></ShellCard> : null}</DragOverlay>
                </DndContext>
              </section>

              <aside className="space-y-4">
                <DndContext sensors={sideSensors} collisionDetection={closestCenter} onDragStart={onSideDragStart} onDragEnd={onSideDragEnd} onDragCancel={() => setActiveSideId(null)}>
                  <SortableContext items={sidePanels} strategy={verticalListSortingStrategy}>
                    {sidePanels.map((id) => (
                      <SortablePanel key={id} id={id}>
                        <PanelRenderer id={id} tasks={tasks} notifications={notifications} activity={activity} onReportIssue={reportIssue} />
                      </SortablePanel>
                    ))}
                  </SortableContext>
                  <DragOverlay>{activeSideId ? <ShellCard><PanelRenderer id={activeSideId} tasks={tasks} notifications={notifications} activity={activity} onReportIssue={reportIssue} /></ShellCard> : null}</DragOverlay>
                </DndContext>
              </aside>
            </div>
          </div>
        </main>

        <AnimatePresence>
          {issueSent && (
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} className="fixed bottom-6 right-6 z-[80] rounded-[24px] border border-amber-400/25 bg-[#0d0a13]/90 p-4 text-white shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300">
                  <Siren className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-black">Issue reported</p>
                  <p className="text-xs text-white/55">Manager has been notified.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DarkCtx.Provider>
  );
}










