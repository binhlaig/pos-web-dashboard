"use client";
import * as React from "react";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  ImageIcon,
  Lock,
  Mail,
  Monitor,
  Clock,
  Phone,
  Printer,
  Receipt,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  User,
  UserCog,
  WalletCards,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getMyPlan,
  getMyProfile,
  getMyShop,
  getReceiptSettings,
  type PlanInfo,
  type ProfileSettings,
  type ReceiptSettings,
  type ShopSettings,
} from "@/lib/settings-api";
import { getPlanFeatures, getPlanLimits, getPosUser } from "@/lib/auth-session";
import { getStoredToken } from "@/lib/auth";
type PageData = {
  profile: ProfileSettings;
  shop: ShopSettings;
  receipt: ReceiptSettings;
  plan: PlanInfo;
};
type RowType = "text" | "image";
type DialogSection = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  warning?: boolean;
  rows: {
    label: string;
    value: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
    status?: "good" | "warn" | "muted";
    type?: RowType;
  }[];
};
function storageProfile(): ProfileSettings {
  const user = getPosUser();
  return {
    username: user?.username || user?.name || "",
    role: user?.role || "",
    shopCode: user?.shopCode || "",
    avatarUrl: user?.imageUrl || user?.image || "",
  };
}
function storageShop(): ShopSettings {
  const user = getPosUser();
  return {
    shopName: "",
    address: "",
    phone: "",
    businessType: "",
    shopStatus: user?.shopStatus || "",
    subscriptionPlan: user?.subscriptionPlan || "",
  };
}
function storagePlan(): PlanInfo {
  const user = getPosUser();
  return {
    subscriptionPlan:
      user?.subscriptionPlan ||
      (typeof window !== "undefined" ? localStorage.getItem("pos_plan") : "") ||
      "",
    shopStatus: user?.shopStatus || "",
    subscriptionEndDate: user?.subscriptionEndDate || "",
    features: getPlanFeatures(),
    limits: getPlanLimits(),
  };
}
const emptyReceipt: ReceiptSettings = {
  shopName: "",
  address: "",
  phone: "",
  secondPhone: "",
  footerMessage: "",
  taxRatePercent: 0,
  currencyCode: "MMK",
  currencySymbol: "Ks",
  currencyDecimalDigits: 0,
  currencyPosition: "AFTER",
};
function safeText(value: unknown, fallback = "Not set") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}
function normalizeImageUrl(url: unknown) {
  const value = safeText(url, "");
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  if (value.startsWith("/")) {
    return value;
  }
  return `/${value}`;
}
function statusClass(status?: "good" | "warn" | "muted") {
  if (status === "good") return "bg-emerald-500";
  if (status === "warn") return "bg-amber-500";
  return "bg-slate-400";
}
function ViewOnlyRow({
  label,
  value,
  icon: Icon,
  status,
  type = "text",
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  status?: "good" | "warn" | "muted";
  type?: RowType;
}) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const imageUrl = typeof value === "string" ? normalizeImageUrl(value) : "";
  return (
    <div className="rounded-2xl border bg-muted/30 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
          {label}
        </div>
        <span className={`h-2 w-2 shrink-0 rounded-full ${statusClass(status)}`} />
      </div>
      {type === "image" ? (
        imageUrl && imageUrl !== "Not set" && !imageFailed ? (
          <div className="mt-3 flex items-center gap-4">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border bg-background">
              <img
                src={imageUrl}
                alt="Profile avatar"
                className="h-full w-full object-cover"
                onError={() => setImageFailed(true)}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground">Profile Avatar</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {imageUrl}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border bg-muted text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">No avatar image</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Avatar image မရှိသေးပါ သို့မဟုတ် image URL မှားနေပါတယ်။
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="break-words text-sm font-semibold text-foreground">
          {value}
        </div>
      )}
    </div>
  );
}
function ReadOnlyDialog({
  section,
  onClose,
}: {
  section: DialogSection | null;
  onClose: () => void;
}) {
  if (!section) return null;
  const Icon = section.icon;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-[720px] overflow-hidden rounded-3xl border bg-background shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div className="flex items-start gap-4">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                section.warning
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">
                  {section.title}
                </h2>
                <span className="rounded-full border bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                  {section.badge || "View only"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {section.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-background transition hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[68vh] overflow-y-auto p-5">
          <div className="mb-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm font-medium text-blue-700 dark:text-blue-200">
            ဒီနေရာမှာ data တွေကို ကြည့်ရန်အတွက်သာ ပြထားပါတယ်။ Edit / Save /
            Delete လုပ်လို့မရအောင် ပိတ်ထားပါတယ်။
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {section.rows.map((row) => (
              <ViewOnlyRow
                key={row.label}
                label={row.label}
                value={row.value}
                icon={row.icon}
                status={row.status}
                type={row.type}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end border-t p-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
function buildSections(data: PageData, role: string): DialogSection[] {
  const features = data.plan.features || {};
  const limits = data.plan.limits || {};
  const featureRows = Object.entries(features).map(([key, value]) => ({
    label: key,
    value: value ? "Enabled" : "Disabled",
    icon: CheckCircle2,
    status: value ? ("good" as const) : ("muted" as const),
  }));
  const limitRows = Object.entries(limits).map(([key, value]) => ({
    label: key,
    value: safeText(value),
    icon: WalletCards,
    status: "muted" as const,
  }));
  return [
    {
      id: "profile",
      title: "Profile",
      subtitle: "Login user and access profile information",
      icon: UserCog,
      badge: "Account",
      rows: [
        {
          label: "Avatar",
          value: safeText(data.profile.avatarUrl),
          icon: ImageIcon,
          status: data.profile.avatarUrl ? "good" : "muted",
          type: "image",
        },
        {
          label: "Username",
          value: safeText(data.profile.username),
          icon: User,
          status: "good",
        },
        {
          label: "Role",
          value: safeText(role),
          icon: ShieldCheck,
          status: role ? "good" : "muted",
        },
        {
          label: "Shop Code",
          value: safeText(data.profile.shopCode),
          icon: Store,
          status: data.profile.shopCode ? "good" : "muted",
        },
      ],
    },
    {
      id: "shop",
      title: "Shop",
      subtitle: "Current shop information and business status",
      icon: Store,
      badge: "Shop data",
      rows: [
        {
          label: "Shop Name",
          value: safeText(data.shop.shopName),
          icon: Store,
          status: data.shop.shopName ? "good" : "muted",
        },
        {
          label: "Address",
          value: safeText(data.shop.address),
          icon: FileText,
          status: data.shop.address ? "good" : "muted",
        },
        {
          label: "Phone",
          value: safeText(data.shop.phone),
          icon: Phone,
          status: data.shop.phone ? "good" : "muted",
        },
        {
          label: "Business Type",
          value: safeText(data.shop.businessType),
          icon: Store,
          status: data.shop.businessType ? "good" : "muted",
        },
        {
          label: "Shop Status",
          value: safeText(data.shop.shopStatus),
          icon: ShieldCheck,
          status:
            String(data.shop.shopStatus).toUpperCase() === "ACTIVE"
              ? "good"
              : data.shop.shopStatus
                ? "warn"
                : "muted",
        },
        {
          label: "Subscription Plan",
          value: safeText(data.shop.subscriptionPlan),
          icon: CreditCard,
          status: data.shop.subscriptionPlan ? "good" : "muted",
        },
      ],
    },
    {
      id: "receipt",
      title: "Receipt",
      subtitle: "Receipt printing and currency settings",
      icon: Receipt,
      badge: "Print info",
      rows: [
        {
          label: "Shop Name",
          value: safeText(data.receipt.shopName),
          icon: Store,
          status: data.receipt.shopName ? "good" : "muted",
        },
        {
          label: "Address",
          value: safeText(data.receipt.address),
          icon: FileText,
          status: data.receipt.address ? "good" : "muted",
        },
        {
          label: "Phone",
          value: safeText(data.receipt.phone),
          icon: Phone,
          status: data.receipt.phone ? "good" : "muted",
        },
        {
          label: "Second Phone",
          value: safeText(data.receipt.secondPhone),
          icon: Phone,
          status: data.receipt.secondPhone ? "good" : "muted",
        },
        {
          label: "Footer Message",
          value: safeText(data.receipt.footerMessage),
          icon: FileText,
          status: data.receipt.footerMessage ? "good" : "muted",
        },
        {
          label: "Tax Rate",
          value: `${data.receipt.taxRatePercent || 0}%`,
          icon: Receipt,
          status: "good",
        },
        {
          label: "Currency",
          value: `${safeText(data.receipt.currencyCode)} / ${safeText(
            data.receipt.currencySymbol
          )}`,
          icon: WalletCards,
          status: "good",
        },
        {
          label: "Currency Position",
          value: safeText(data.receipt.currencyPosition),
          icon: Printer,
          status: "good",
        },
      ],
    },
    {
      id: "plan",
      title: "Plan",
      subtitle: "Current subscription plan, limits, and features",
      icon: CreditCard,
      badge: "Subscription",
      rows: [
        {
          label: "Plan",
          value: safeText(data.plan.subscriptionPlan),
          icon: CreditCard,
          status: data.plan.subscriptionPlan ? "good" : "muted",
        },
        {
          label: "Shop Status",
          value: safeText(data.plan.shopStatus),
          icon: ShieldCheck,
          status:
            String(data.plan.shopStatus).toUpperCase() === "ACTIVE"
              ? "good"
              : data.plan.shopStatus
                ? "warn"
                : "muted",
        },
        {
          label: "End Date",
          value: safeText(data.plan.subscriptionEndDate),
          icon: CalendarDays,
          status: data.plan.subscriptionEndDate ? "good" : "muted",
        },
        ...featureRows,
        ...limitRows,
      ],
    },
    {
      id: "security",
      title: "Security",
      subtitle: "Account protection summary",
      icon: Lock,
      badge: "Protected",
      warning: true,
      rows: [
        {
          label: "Password",
          value: "Hidden for security",
          icon: Lock,
          status: "good",
        },
        {
          label: "Edit Permission",
          value: "Disabled on this settings page",
          icon: ShieldCheck,
          status: "good",
        },
        {
          label: "Sensitive Actions",
          value: "Only backend / admin flow can update",
          icon: AlertTriangle,
          status: "warn",
        },
        {
          label: "Email",
          value: "Read only",
          icon: Mail,
          status: "muted",
        },
      ],
    },
  ];
}

type DeviceSession = {
  sessionId: string;
  accountType: string;
  accountId: number;
  deviceId: string;
  deviceName: string;
  expiresAt: string | null;
  lastSeenAt: string | null;
};

// JWT payload is used only to locate/display the shop and current session.
// Backend validates the token and shop ownership for every request.
function deviceTokenContext(token: string): { shopId?: unknown; sid?: unknown } {
  try {
    const segment = token.split(".")[1];
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const payload: unknown = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
    return payload && typeof payload === "object" ? payload as { shopId?: unknown; sid?: unknown } : {};
  } catch {
    return {};
  }
}

function getCurrentDeviceName(): string {
  const ua = navigator.userAgent;
  if (/Windows/i.test(ua)) return "Windows PC";
  if (/iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return "iPad";
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/Android/i.test(ua)) {
    if (/Redmi/i.test(ua)) return "Redmi Android";
    if (/Xiaomi|Mi Pad/i.test(ua)) return "Xiaomi Android";
    return "Android Device";
  }
  if (/Macintosh|Mac OS X/i.test(ua)) return "Mac";
  if (/CrOS/i.test(ua)) return "Chromebook";
  if (/Linux/i.test(ua)) return "Linux PC";
  return "Web Browser";
}

function displayDeviceName(rows: DeviceSession[], isCurrent: boolean, currentName: string): string {
  const names = rows.map(row => row.deviceName.trim()).filter(Boolean);
  const named = names.find(name => !/^(POS Web Browser|Web Browser|Unnamed device)$/i.test(name));
  if (named) return named;
  if (isCurrent && currentName) return currentName;
  return names[0] || "Unnamed device";
}

function deviceDate(value: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
}

function DevicesPanel({ maxDevices, refreshKey }: { maxDevices: unknown; refreshKey: number }) {
  const [sessions, setSessions] = React.useState<DeviceSession[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [reload, setReload] = React.useState(0);
  const [currentDeviceId, setCurrentDeviceId] = React.useState("");
  const [currentDeviceName, setCurrentDeviceName] = React.useState("");
  const [currentSessionId, setCurrentSessionId] = React.useState("");

  React.useEffect(() => {
    const controller = new AbortController();
    setCurrentDeviceName(getCurrentDeviceName());
    async function load() {
      setLoading(true);
      setError("");
      setSessions(null);
      try {
        const token = getStoredToken();
        if (!token) throw new Error("Login session missing. Please sign in again.");
        const context = deviceTokenContext(token);
        const shopId = String(context.shopId ?? "");
        if (!/^\d+$/.test(shopId) || Number(shopId) <= 0) {
          throw new Error("Shop information missing. Please sign in again.");
        }
        setCurrentSessionId(typeof context.sid === "string" ? context.sid : "");
        try { setCurrentDeviceId(localStorage.getItem("pos_device_id") || ""); }
        catch { setCurrentDeviceId(""); }
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/+$/, "");
        if (!base) throw new Error("Device API connection is not configured.");
        const response = await fetch(`${base}/api/owner/shops/${encodeURIComponent(shopId)}/devices`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          if (response.status === 401) throw new Error("Session expired. Please sign in again.");
          if (response.status === 403) throw new Error("Only the shop owner can view devices.");
          if (response.status === 404) throw new Error("Device API was not found on this backend.");
          throw new Error(`Devices could not be loaded (HTTP ${response.status}).`);
        }
        const body: unknown = await response.json();
        if (!Array.isArray(body) || !body.every((item: unknown) => {
          if (!item || typeof item !== "object") return false;
          const row = item as Record<string, unknown>;
          return typeof row.sessionId === "string" && typeof row.deviceId === "string"
            && row.deviceId.length > 0 && typeof row.deviceName === "string"
            && typeof row.accountType === "string" && typeof row.accountId === "number"
            && (row.expiresAt == null || typeof row.expiresAt === "string")
            && (row.lastSeenAt == null || typeof row.lastSeenAt === "string");
        })) throw new Error("Unexpected device response from backend.");
        if (!controller.signal.aborted) setSessions(body as DeviceSession[]);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Device connection failed.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [refreshKey, reload]);

  React.useEffect(() => {
    if (!open) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function keydown(event: KeyboardEvent) { if (event.key === "Escape") setOpen(false); }
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = before;
      document.removeEventListener("keydown", keydown);
    };
  }, [open]);

  const devices = React.useMemo(() => {
    const groups = new Map<string, DeviceSession[]>();
    for (const session of sessions || []) {
      groups.set(session.deviceId, [...(groups.get(session.deviceId) || []), session]);
    }
    return Array.from(groups.entries()).sort(([a], [b]) =>
      Number(b === currentDeviceId) - Number(a === currentDeviceId) || a.localeCompare(b)
    );
  }, [sessions, currentDeviceId]);
  const limit = maxDevices == null || maxDevices === "" ? null : Number(maxDevices);
  const limitLabel = limit !== null && Number.isFinite(limit) && limit >= 0 ? String(limit) : "Not available";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}
        className="group rounded-3xl border bg-background/95 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-muted/20 hover:shadow-md">
        <div className="mb-5 flex items-start justify-between gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Monitor className="h-6 w-6" /></span>
          <span className="rounded-full border bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">Devices</span>
        </div>
        <h2 className="text-base font-black">Devices</h2>
        <p className="mt-1 min-h-[40px] text-sm text-muted-foreground">ဆိုင်၏ active devices နှင့် login sessions</p>
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <span className="text-xs font-bold text-muted-foreground">
            {loading ? "Loading…" : sessions ? `${devices.length} active devices` : "Unable to load"}
          </span>
          <span className="text-xs font-black text-primary">View details</span>
        </div>
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <button type="button" aria-label="Close devices" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
          <div role="dialog" aria-modal="true" aria-labelledby="devices-title" className="relative z-10 flex max-h-[88dvh] w-full max-w-[800px] flex-col overflow-hidden rounded-3xl border bg-background shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b p-5">
              <div><h2 id="devices-title" className="text-xl font-black">Devices</h2><p className="mt-1 text-sm text-muted-foreground">Active login sessions • View only</p></div>
              <button autoFocus type="button" aria-label="Close devices" onClick={() => setOpen(false)} className="rounded-xl border p-2"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 overflow-y-auto p-5">
              <div className="flex items-center gap-3 rounded-2xl border bg-primary/5 p-4">
                <Monitor className="h-6 w-6 shrink-0 text-primary" />
                <div><p className="text-xs text-muted-foreground">Current device</p><p className="mt-1 font-bold">{currentDeviceName || "Web Browser"}</p></div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[{ label: "Active devices", value: sessions ? devices.length : "—" }, { label: "Plan limit", value: limitLabel }, { label: "Active sessions", value: sessions ? sessions.length : "—" }].map(item => (
                  <div key={item.label} className="rounded-2xl border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">{item.label}</p><p className="mt-2 text-xl font-black">{item.value}</p></div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Device ID တူသော sessions များကို device တစ်ခုအဖြစ် စုပြထားပါသည်။ အချိန်များကို ဒီ browser ၏ timezone ဖြင့် ပြထားပါသည်။</p>
              {loading ? <div className="rounded-2xl border p-5 text-sm">Loading devices…</div> : null}
              {error ? <div role="alert" className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-200">{error}</div> : null}
              {!loading && sessions?.length === 0 ? <div className="rounded-2xl border p-5 text-sm text-muted-foreground">Active device မရှိသေးပါ။</div> : null}
              {devices.map(([deviceId, rows]) => (
                <article key={deviceId} className="overflow-hidden rounded-2xl border">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/30 p-4">
                    <div className="flex min-w-0 items-center gap-3"><Monitor className="h-5 w-5 shrink-0 text-primary" /><h3 className="break-words font-bold">{displayDeviceName(rows, deviceId === currentDeviceId || rows.some(row => row.sessionId === currentSessionId), currentDeviceName)}</h3></div>
                    {deviceId === currentDeviceId || rows.some(row => row.sessionId === currentSessionId) ? <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">This browser</span> : null}
                  </div>
                  <div className="space-y-3 p-4">
                    <p className="break-all text-xs text-muted-foreground">Device ID: {deviceId}</p>
                    {rows.map(row => (
                      <div key={row.sessionId} className="rounded-xl border bg-muted/20 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-bold">{row.accountType === "USER" ? "User account" : row.accountType === "STAFF" ? "Staff account" : row.accountType} #{row.accountId}</span><span className="text-xs text-emerald-600">{row.sessionId === currentSessionId ? "Current session" : "Active session"}</span></div>
                        <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2"><div><p className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" /> Last seen</p><p className="mt-1 font-semibold">{deviceDate(row.lastSeenAt)}</p></div><div><p className="text-muted-foreground">Session expires</p><p className="mt-1 font-semibold">{deviceDate(row.expiresAt)}</p></div></div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <div className="flex justify-end gap-2 border-t p-4"><Button variant="outline" disabled={loading} onClick={() => setReload(value => value + 1)}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button><Button variant="outline" onClick={() => setOpen(false)}>Close</Button></div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default function DashboardSettingsPage() {
  const [data, setData] = React.useState<PageData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [selected, setSelected] = React.useState<DialogSection | null>(null);
  const [deviceRefreshKey, setDeviceRefreshKey] = React.useState(0);
  async function loadSettings(showToast = false) {
    try {
      setLoading(true);
      setError("");
      if (!getStoredToken()) {
        throw new Error("Login session missing. Please sign in again.");
      }
      const results = await Promise.allSettled([
        getMyProfile(),
        getMyShop(),
        getReceiptSettings(),
        getMyPlan(),
      ]);
      const [profileResult, shopResult, receiptResult, planResult] = results;
      const firstFailure = results.find((item) => item.status === "rejected");
      if (firstFailure?.status === "rejected") {
        setError(
          firstFailure.reason instanceof Error
            ? firstFailure.reason.message
            : "Some settings could not be loaded."
        );
      }
      const localPlan = storagePlan();
      const profile =
        profileResult.status === "fulfilled"
          ? { ...storageProfile(), ...profileResult.value }
          : storageProfile();
      const shop =
        shopResult.status === "fulfilled"
          ? { ...storageShop(), ...shopResult.value }
          : storageShop();
      const receipt =
        receiptResult.status === "fulfilled"
          ? { ...emptyReceipt, ...receiptResult.value }
          : emptyReceipt;
      const plan =
        planResult.status === "fulfilled"
          ? {
              ...localPlan,
              ...planResult.value,
              features: {
                ...(localPlan.features || {}),
                ...(planResult.value.features || {}),
              },
              limits: {
                ...(localPlan.limits || {}),
                ...(planResult.value.limits || {}),
              },
            }
          : localPlan;
      setData({ profile, shop, receipt, plan });
      if (showToast) setDeviceRefreshKey(value => value + 1);
      if (showToast) toast.success("Settings refreshed");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Settings load failed";
      setError(message);
      setData({
        profile: storageProfile(),
        shop: storageShop(),
        receipt: emptyReceipt,
        plan: storagePlan(),
      });
    } finally {
      setLoading(false);
    }
  }
  React.useEffect(() => {
    loadSettings();
  }, []);
  const role = data?.profile.role || storageProfile().role || "Staff";
  const sections = data ? buildSections(data, role) : [];
  return (
    <div className="min-h-dvh bg-muted/20 px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px] space-y-5">
        <section className="overflow-hidden rounded-3xl border bg-background/95 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Settings className="h-6 w-6" />
              </span>
              <div>
                <div className="mb-1 inline-flex items-center gap-2 rounded-full border bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  View Only Settings
                </div>
                <h1 className="text-2xl font-black tracking-tight">Settings</h1>
                <p className="text-sm text-muted-foreground">
                  Data များကို card နှိပ်ပြီး dialog ထဲမှာ ကြည့်နိုင်ပါသည်။
                  Edit လုပ်နိုင်သော form များကို ဖယ်ထားပါသည်။
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => loadSettings(true)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: data?.profile.username || "User",
                sub: "Profile",
                icon: UserCog,
              },
              {
                label: data?.profile.shopCode || "Shop",
                sub: "Shop code",
                icon: Store,
              },
              {
                label: role || "Role",
                sub: "Access level",
                icon: ShieldCheck,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.sub} className="rounded-2xl border bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4" />
                    {item.sub}
                  </div>
                  <p className="mt-2 truncate text-base font-bold">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
        {error ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-medium text-amber-700 dark:text-amber-200">
            {error}
          </div>
        ) : null}
        {loading && !data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-44 animate-pulse rounded-3xl border bg-background/70"
              />
            ))}
          </div>
        ) : null}
        {data ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DevicesPanel maxDevices={(data.plan.limits as Record<string, unknown> | undefined)?.maxDevices} refreshKey={deviceRefreshKey} />
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setSelected(section)}
                  className="group rounded-3xl border bg-background/95 p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-muted/20 hover:shadow-md"
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        section.warning
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                        {section.badge || "View"}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1" />
                    </div>
                  </div>
                  <h2 className="text-base font-black">{section.title}</h2>
                  <p className="mt-1 min-h-[40px] text-sm text-muted-foreground">
                    {section.subtitle}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <span className="text-xs font-bold text-muted-foreground">
                      {section.rows.length} items
                    </span>
                    <span className="text-xs font-black text-primary">
                      View details
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      <ReadOnlyDialog section={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
