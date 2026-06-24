"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  Database,
  Globe,
  Key,
  Lock,
  LogOut,
  Mail,
  Moon,
  Palette,
  Printer,
  Receipt,
  Shield,
  Smartphone,
  Sparkles,
  Store,
  Sun,
  User,
  Wifi,
  X,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";

// ─── THEME ────────────────────────────────────────────────────────────────
type Theme = "dark" | "light";

const tk = (theme: Theme) =>
  theme === "dark"
    ? {
        root: "bg-[#060a14] text-white",
        text: "text-white",
        textMuted: "text-white/55",
        textSubtle: "text-white/35",
        card: "border-white/[0.08] bg-white/[0.055] backdrop-blur-xl",
        cardHover: "hover:border-white/[0.16] hover:bg-white/[0.075]",
        btn: "border-white/[0.10] bg-white/[0.06] text-white/75 hover:bg-white/[0.11] hover:text-white",
        pill: "border-white/[0.10] bg-white/[0.06] text-white/65",
        divider: "border-white/[0.08]",
        dialog: "border-white/[0.10] bg-[#0b1120]/95 text-white shadow-2xl shadow-black/40",
        row: "border-white/[0.075] bg-white/[0.035]",
        grid:
          "[background-image:linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] [background-size:44px_44px]",
        glow1: "bg-blue-600/[0.08]",
        glow2: "bg-violet-600/[0.055]",
        danger: "border-rose-500/25 bg-rose-500/[0.055] text-rose-400",
      }
    : {
        root: "bg-[#edf1f9] text-slate-900",
        text: "text-slate-900",
        textMuted: "text-slate-500",
        textSubtle: "text-slate-400",
        card: "border-slate-200 bg-white/95 shadow-[0_2px_22px_rgba(15,23,42,0.07)] backdrop-blur-xl",
        cardHover: "hover:border-slate-300 hover:shadow-[0_7px_28px_rgba(15,23,42,0.10)]",
        btn: "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm",
        pill: "border-slate-200 bg-white text-slate-500 shadow-sm",
        divider: "border-slate-200",
        dialog: "border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-900/20",
        row: "border-slate-200 bg-slate-50/70",
        grid:
          "[background-image:linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:44px_44px]",
        glow1: "bg-blue-300/18",
        glow2: "bg-violet-300/14",
        danger: "border-rose-200 bg-rose-50 text-rose-600",
      };

// ─── TYPES ────────────────────────────────────────────────────────────────
type SettingItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  danger?: boolean;
  rows: {
    label: string;
    value: string;
    status?: "good" | "warn" | "off";
  }[];
};

// ─── DATA: VIEW ONLY ──────────────────────────────────────────────────────
const SETTINGS: SettingItem[] = [
  {
    id: "profile",
    title: "Profile",
    subtitle: "Account and owner information",
    icon: User,
    badge: "View only",
    rows: [
      { label: "Full Name", value: "Sai Aung" },
      { label: "Email", value: "saiaung@binhlaig.com" },
      { label: "Phone", value: "+95 9 111 222 333" },
      { label: "Role", value: "Administrator" },
      { label: "Session", value: "Active", status: "good" },
    ],
  },
  {
    id: "appearance",
    title: "Appearance",
    subtitle: "Current UI display settings",
    icon: Palette,
    badge: "Locked",
    rows: [
      { label: "Theme", value: "Dark / Light supported" },
      { label: "Accent Color", value: "Blue" },
      { label: "Compact Mode", value: "Disabled", status: "off" },
      { label: "Language", value: "English / မြန်မာ / 日本語" },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    subtitle: "Alert and report preferences",
    icon: Bell,
    badge: "Read only",
    rows: [
      { label: "New Order Alert", value: "Enabled", status: "good" },
      { label: "Low Stock Warning", value: "Enabled", status: "good" },
      { label: "Daily Summary", value: "Enabled", status: "good" },
      { label: "Email Notifications", value: "Disabled", status: "off" },
      { label: "SMS Notifications", value: "Enabled", status: "good" },
    ],
  },
  {
    id: "security",
    title: "Security",
    subtitle: "Login and access protection",
    icon: Shield,
    badge: "Protected",
    rows: [
      { label: "Password", value: "Hidden for security" },
      { label: "Two-Factor Authentication", value: "Disabled", status: "warn" },
      { label: "Session Timeout", value: "Enabled", status: "good" },
      { label: "Login Activity Alerts", value: "Enabled", status: "good" },
    ],
  },
  {
    id: "store",
    title: "Store & POS",
    subtitle: "Receipt and shop configuration",
    icon: Store,
    badge: "View only",
    rows: [
      { label: "Store Name", value: "BINHLAIG POS" },
      { label: "Shop Code", value: "SHOP-0001" },
      { label: "Tax Rate", value: "5%" },
      { label: "Auto Print Receipt", value: "Enabled", status: "good" },
      { label: "Tax Inclusive Pricing", value: "Disabled", status: "off" },
      { label: "Logo on Receipt", value: "Enabled", status: "good" },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    subtitle: "Connected services and backup",
    icon: Wifi,
    badge: "System",
    rows: [
      { label: "Stripe Payments", value: "Connected", status: "good" },
      { label: "Google Sheets Export", value: "Connected", status: "good" },
      { label: "Slack Alerts", value: "Disconnected", status: "off" },
      { label: "WhatsApp Notify", value: "Disconnected", status: "off" },
      { label: "Backup Export", value: "Available by admin only" },
    ],
  },
  {
    id: "danger",
    title: "Danger Zone",
    subtitle: "Sensitive account actions",
    icon: AlertTriangle,
    badge: "Disabled",
    danger: true,
    rows: [
      { label: "Sign Out All Devices", value: "Admin permission required", status: "warn" },
      { label: "Reset to Defaults", value: "Disabled from this page", status: "off" },
      { label: "Delete Account", value: "Disabled from this page", status: "off" },
    ],
  },
];

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────
function StatusDot({ status }: { status?: "good" | "warn" | "off" }) {
  const cls =
    status === "good"
      ? "bg-emerald-500"
      : status === "warn"
        ? "bg-amber-500"
        : status === "off"
          ? "bg-slate-400"
          : "bg-blue-500";

  return <span className={cn("h-2 w-2 shrink-0 rounded-full", cls)} />;
}

function InfoRow({
  label,
  value,
  status,
  theme,
}: {
  label: string;
  value: string;
  status?: "good" | "warn" | "off";
  theme: Theme;
}) {
  const t = tk(theme);

  return (
    <div className={cn("rounded-2xl border px-4 py-3", t.row)}>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className={cn("text-[11px] font-bold uppercase tracking-widest", t.textSubtle)}>
          {label}
        </span>
        <StatusDot status={status} />
      </div>
      <div className={cn("text-[14px] font-semibold", t.text)}>{value}</div>
    </div>
  );
}

function ViewOnlyDialog({
  item,
  theme,
  onClose,
}: {
  item: SettingItem | null;
  theme: Theme;
  onClose: () => void;
}) {
  const t = tk(theme);
  const Icon = item?.icon;

  return (
    <AnimatePresence>
      {item && Icon && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            aria-label="Close dialog backdrop"
            onClick={onClose}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "relative z-10 w-full max-w-[620px] overflow-hidden rounded-[28px] border",
              t.dialog
            )}
          >
            <div className={cn("flex items-start justify-between gap-4 border-b px-6 py-5", t.divider)}>
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                    item.danger
                      ? t.danger
                      : theme === "dark"
                        ? "border-white/[0.08] bg-white/[0.07]"
                        : "border-slate-200 bg-slate-50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className={cn("text-[20px] font-black tracking-tight", t.text)}>
                      {item.title}
                    </h2>
                    <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold", t.pill)}>
                      {item.badge || "View only"}
                    </span>
                  </div>
                  <p className={cn("mt-1 text-[13px]", t.textMuted)}>{item.subtitle}</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all",
                  t.btn
                )}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[68vh] overflow-y-auto px-6 py-5">
              <div
                className={cn(
                  "mb-4 rounded-2xl border px-4 py-3 text-[12px] font-semibold",
                  theme === "dark"
                    ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                )}
              >
                ဒီ data တွေက ကြည့်ရန်အတွက်သာ ဖြစ်ပါတယ်။ ဒီ page မှာ edit / save / delete လုပ်လို့မရပါ။
              </div>

              <div className="grid gap-3">
                {item.rows.map((row) => (
                  <InfoRow
                    key={`${item.id}-${row.label}`}
                    label={row.label}
                    value={row.value}
                    status={row.status}
                    theme={theme}
                  />
                ))}
              </div>
            </div>

            <div className={cn("flex justify-end border-t px-6 py-4", t.divider)}>
              <button
                onClick={onClose}
                className={cn(
                  "rounded-xl border px-4 py-2 text-[13px] font-bold transition-all",
                  t.btn
                )}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [theme, setTheme] = React.useState<Theme>("dark");
  const [selected, setSelected] = React.useState<SettingItem | null>(null);

  const t = tk(theme);

  return (
    <div className={cn("relative min-h-screen overflow-hidden transition-colors duration-300", t.root)}>
      <div className={cn("pointer-events-none fixed inset-0", t.grid)} />

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className={cn("absolute -top-32 right-[12%] h-[480px] w-[480px] rounded-full blur-[130px]", t.glow1)} />
        <div className={cn("absolute bottom-0 left-[-8%] h-[380px] w-[380px] rounded-full blur-[120px]", t.glow2)} />
      </div>

      <div className="relative z-10 mx-auto max-w-[1180px] px-5 py-7 md:px-8">
        {/* TOP BAR */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24 }}
          className="mb-7 flex items-start justify-between gap-4"
        >
          <div>
            <div className={cn("mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold", t.pill)}>
              <Sparkles className="h-3.5 w-3.5" />
              System Configuration
            </div>

            <h1 className={cn("text-[34px] font-black leading-none tracking-tight md:text-[46px]", t.text)}>
              Settings
            </h1>

            <p className={cn("mt-3 max-w-[680px] text-[13px] leading-6 md:text-[14px]", t.textMuted)}>
              Settings တွေကို page အရှည်ကြီးမလုပ်တော့ဘဲ card တစ်ခုစီကနေ dialog ဖွင့်ပြီး ကြည့်နိုင်အောင် ပြင်ထားပါတယ်။
              Data များကို view only အဖြစ်သာ ပြထားပြီး edit controls မပါပါ။
            </p>
          </div>

          <button
            onClick={() => setTheme((p) => (p === "dark" ? "light" : "dark"))}
            className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-all", t.btn)}
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </motion.div>

        {/* SUMMARY BAR */}
        <div className={cn("mb-5 grid gap-3 rounded-[24px] border p-3 md:grid-cols-3", t.card)}>
          <div className="flex items-center gap-3 rounded-2xl px-3 py-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <div>
              <div className={cn("text-[12px] font-black", t.text)}>View Only Mode</div>
              <div className={cn("text-[11px]", t.textSubtle)}>No edit / save action</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl px-3 py-2">
            <Lock className="h-5 w-5 text-blue-500" />
            <div>
              <div className={cn("text-[12px] font-black", t.text)}>Protected Settings</div>
              <div className={cn("text-[11px]", t.textSubtle)}>Safe for staff viewing</div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl px-3 py-2">
            <Receipt className="h-5 w-5 text-violet-500" />
            <div>
              <div className={cn("text-[12px] font-black", t.text)}>Dialog UI</div>
              <div className={cn("text-[11px]", t.textSubtle)}>Compact page layout</div>
            </div>
          </div>
        </div>

        {/* SETTINGS CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {SETTINGS.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className={cn(
                  "group rounded-[24px] border p-5 text-left transition-all",
                  t.card,
                  t.cardHover,
                  item.danger ? "border-rose-500/25" : ""
                )}
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl border transition-all",
                      item.danger
                        ? t.danger
                        : theme === "dark"
                          ? "border-white/[0.08] bg-white/[0.07]"
                          : "border-slate-200 bg-slate-50"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold", t.pill)}>
                      {item.badge || "View"}
                    </span>
                    <ChevronRight className={cn("h-4 w-4 transition-transform group-hover:translate-x-1", t.textSubtle)} />
                  </div>
                </div>

                <h3 className={cn("text-[16px] font-black", item.danger ? "text-rose-500" : t.text)}>
                  {item.title}
                </h3>

                <p className={cn("mt-1 min-h-[38px] text-[12px] leading-5", t.textMuted)}>
                  {item.subtitle}
                </p>

                <div className={cn("mt-4 flex items-center justify-between border-t pt-4", t.divider)}>
                  <span className={cn("text-[11px] font-bold", t.textSubtle)}>
                    {item.rows.length} items
                  </span>
                  <span className={cn("text-[12px] font-black", item.danger ? "text-rose-500" : t.text)}>
                    View details
                  </span>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* FOOTER */}
        <div className={cn("mt-7 flex items-center justify-between pb-3 text-[11px] font-semibold", t.textSubtle)}>
          <span>© 2026 BINHLAIG · Settings</span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-3 w-3" />
            v2.4.1
          </span>
        </div>
      </div>

      <ViewOnlyDialog item={selected} theme={theme} onClose={() => setSelected(null)} />
    </div>
  );
}