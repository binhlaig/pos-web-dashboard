"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { LucideIcon } from "lucide-react";
import {
  BrainCircuit,
  GripVertical,
  Receipt,
  Cpu,
  Languages,
  ScanLine,
  BellRing,
  Sparkles,
  Store,
  Save,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Boxes,
  Zap,
  BarChart3,
  LockKeyhole,
  BadgeJapaneseYen,
  Bot,
  MonitorCog,
  PanelTop,
  Sun,
  Moon,
} from "lucide-react";

type ThemeMode = "dark" | "light";

type SectionId =
  | "general"
  | "receipt"
  | "inventory"
  | "local-ai"
  | "security"
  | "smart-workflow";

interface SectionItem {
  id: SectionId;
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
  theme: ThemeMode;
}

interface ToggleProps {
  defaultChecked?: boolean;
  theme: ThemeMode;
}

interface ToggleRowProps {
  title: string;
  description: string;
  defaultChecked?: boolean;
  theme: ThemeMode;
}

interface SortableCardProps {
  section: SectionItem;
  children: React.ReactNode;
  theme: ThemeMode;
}

const sectionsSeed: SectionItem[] = [
  {
    id: "general",
    title: "General POS",
    description: "Store defaults, pricing and terminal experience.",
    icon: Store,
    badge: "Core",
  },
  {
    id: "receipt",
    title: "Receipt & Checkout",
    description: "Receipt print flow and checkout output.",
    icon: Receipt,
    badge: "Sales",
  },
  {
    id: "inventory",
    title: "Inventory Rules",
    description: "Stock guardrails and barcode workflow.",
    icon: Boxes,
    badge: "Stock",
  },
  {
    id: "local-ai",
    title: "Local AI Assistant",
    description: "Offline AI for search, help and translation.",
    icon: BrainCircuit,
    badge: "AI",
  },
  {
    id: "security",
    title: "Security & Approval",
    description: "Manager approval and session safety.",
    icon: LockKeyhole,
    badge: "Safety",
  },
  {
    id: "smart-workflow",
    title: "Smart Workflow",
    description: "Shortcuts, alerts and staff guidance.",
    icon: Zap,
    badge: "Speed",
  },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getThemeClasses(theme: ThemeMode) {
  const isDark = theme === "dark";

  return {
    page: isDark
      ? "min-h-screen bg-[#0a0a0a] text-white"
      : "min-h-screen bg-[#f6f7fb] text-zinc-900",

    shell: isDark
      ? "overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] shadow-[0_30px_120px_rgba(0,0,0,0.45)]"
      : "overflow-hidden rounded-[34px] border border-black/10 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]",

    border: isDark ? "border-white/10" : "border-black/10",
    card: isDark ? "bg-white/[0.03]" : "bg-white",
    cardSoft: isDark ? "bg-white/[0.04]" : "bg-[#f8fafc]",
    cardHover: isDark ? "hover:bg-white/[0.08]" : "hover:bg-black/[0.04]",
    mutedText: isDark ? "text-zinc-400" : "text-zinc-600",
    softText: isDark ? "text-zinc-500" : "text-zinc-500",
    strongText: isDark ? "text-white" : "text-zinc-950",
    amberText: "text-amber-300",
    iconBox: isDark
      ? "border-white/10 bg-white/[0.06] text-amber-300"
      : "border-black/10 bg-amber-50 text-amber-700",
    input: isDark
      ? "border-white/10 bg-white/[0.04] text-zinc-100 placeholder:text-zinc-500 focus:border-amber-400/40 focus:bg-white/[0.06]"
      : "border-black/10 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500/40 focus:bg-white",
    sectionDragging: isDark
      ? "border-amber-400/30 bg-zinc-900/95 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
      : "border-amber-400/30 bg-white shadow-[0_20px_50px_rgba(245,158,11,0.10)]",
    stickyBar: isDark
      ? "bg-black/50 backdrop-blur-xl"
      : "bg-white/85 backdrop-blur-xl",
    badge: isDark
      ? "border-white/10 bg-white/[0.04] text-zinc-400"
      : "border-black/10 bg-black/[0.03] text-zinc-600",
    accentBadge: isDark
      ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
      : "border-amber-300/40 bg-amber-50 text-amber-700",
    ghostBtn: isDark
      ? "border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/[0.08]"
      : "border-black/10 bg-white text-zinc-700 hover:bg-black/[0.04]",
    primaryBtn: isDark
      ? "bg-amber-300 text-black hover:opacity-90"
      : "bg-amber-500 text-white hover:opacity-90",
    metricGlow: isDark
      ? "bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.10),transparent_35%)]"
      : "bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_35%)]",
    aiHero: isDark
      ? "border-amber-400/20 bg-gradient-to-br from-amber-400/10 via-transparent to-cyan-400/10"
      : "border-amber-300/40 bg-gradient-to-br from-amber-50 via-white to-cyan-50",
    toast: isDark
      ? "border-amber-400/20 bg-zinc-950/95 text-zinc-100"
      : "border-amber-300/40 bg-white text-zinc-900",
  };
}

function Field({ label, children, hint, theme }: FieldProps) {
  const t = getThemeClasses(theme);

  return (
    <div className="space-y-2">
      <label className={cx("text-[11px] font-medium uppercase tracking-[0.18em]", t.softText)}>
        {label}
      </label>
      {children}
      {hint ? <p className={cx("text-xs", t.softText)}>{hint}</p> : null}
    </div>
  );
}

function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { theme: ThemeMode }
) {
  const { theme, className, ...rest } = props;
  const t = getThemeClasses(theme);

  return (
    <input
      {...rest}
      className={cx(
        "h-11 w-full rounded-2xl border px-4 text-sm outline-none transition",
        t.input,
        className
      )}
    />
  );
}

function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { theme: ThemeMode }
) {
  const { theme, className, ...rest } = props;
  const t = getThemeClasses(theme);

  return (
    <select
      {...rest}
      className={cx(
        "h-11 w-full rounded-2xl border px-4 text-sm outline-none transition",
        t.input,
        className
      )}
    />
  );
}

function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { theme: ThemeMode }
) {
  const { theme, className, ...rest } = props;
  const t = getThemeClasses(theme);

  return (
    <textarea
      {...rest}
      className={cx(
        "min-h-[120px] w-full rounded-2xl border px-4 py-3 text-sm outline-none transition",
        t.input,
        className
      )}
    />
  );
}

function Toggle({ defaultChecked = false, theme }: ToggleProps) {
  const [enabled, setEnabled] = React.useState(defaultChecked);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setEnabled((v) => !v)}
      className={cx(
        "relative h-7 w-12 rounded-full border transition",
        enabled
          ? isDark
            ? "border-amber-400/40 bg-amber-400/20"
            : "border-amber-400/40 bg-amber-100"
          : isDark
          ? "border-white/10 bg-white/[0.06]"
          : "border-black/10 bg-black/[0.04]"
      )}
      aria-pressed={enabled}
    >
      <span
        className={cx(
          "absolute top-1 h-5 w-5 rounded-full transition-all",
          enabled
            ? "left-6 bg-amber-400"
            : isDark
            ? "left-1 bg-zinc-400"
            : "left-1 bg-zinc-500"
        )}
      />
    </button>
  );
}

function ToggleRow({
  title,
  description,
  defaultChecked = false,
  theme,
}: ToggleRowProps) {
  const t = getThemeClasses(theme);

  return (
    <div
      className={cx(
        "flex min-h-[92px] items-center justify-between gap-4 rounded-3xl border p-4 transition",
        t.border,
        t.card,
        theme === "dark" ? "hover:bg-white/[0.05]" : "hover:bg-black/[0.02]"
      )}
    >
      <div className="min-w-0">
        <p className={cx("text-sm font-medium", t.strongText)}>{title}</p>
        <p className={cx("mt-1 text-xs leading-6", t.mutedText)}>{description}</p>
      </div>
      <Toggle defaultChecked={defaultChecked} theme={theme} />
    </div>
  );
}

function SectionContent({ id, theme }: { id: SectionId; theme: ThemeMode }) {
  switch (id) {
    case "general":
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4 xl:grid-cols-3">
            <Field label="Store Name" theme={theme}>
              <Input theme={theme} defaultValue="BINHLAIG POS" />
            </Field>

            <Field label="Currency" theme={theme}>
              <Select theme={theme} defaultValue="JPY">
                <option value="JPY">JPY</option>
                <option value="MMK">MMK</option>
                <option value="USD">USD</option>
              </Select>
            </Field>

            <Field label="Tax Rate (%)" theme={theme}>
              <Input theme={theme} type="number" defaultValue="10" />
            </Field>

            <Field label="Low Stock Threshold" theme={theme}>
              <Input theme={theme} type="number" defaultValue="5" />
            </Field>

            <Field label="Default Language" theme={theme}>
              <Select theme={theme} defaultValue="ja">
                <option value="ja">Japanese</option>
                <option value="en">English</option>
                <option value="my">Myanmar</option>
              </Select>
            </Field>

            <Field label="Timezone" theme={theme}>
              <Input theme={theme} defaultValue="Asia/Tokyo" />
            </Field>

            <Field label="Round Pricing" theme={theme}>
              <Select theme={theme} defaultValue="0">
                <option value="0">No rounding</option>
                <option value="1">Nearest 1</option>
                <option value="10">Nearest 10</option>
                <option value="100">Nearest 100</option>
              </Select>
            </Field>

            <Field label="Default Terminal" theme={theme}>
              <Input theme={theme} defaultValue="Main Counter 01" />
            </Field>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ToggleRow
              title="Open Cash Drawer After Sale"
              description="Automatically trigger drawer action after payment success."
              defaultChecked
              theme={theme}
            />
            <ToggleRow
              title="Quick Sale Mode"
              description="Reduce cashier steps for fast in-store operations."
              defaultChecked
              theme={theme}
            />
          </div>
        </div>
      );

    case "receipt":
      return (
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-2">
            <ToggleRow
              title="Auto Print After Sale"
              description="Print receipt automatically after successful checkout."
              defaultChecked
              theme={theme}
            />
            <ToggleRow
              title="Show Logo on Receipt"
              description="Include store logo on printed receipt."
              defaultChecked
              theme={theme}
            />
            <ToggleRow
              title="QR / Barcode on Receipt"
              description="Add order reference code for return and support."
              defaultChecked
              theme={theme}
            />
            <Field label="Receipt Width" theme={theme}>
              <Select theme={theme} defaultValue="80mm">
                <option value="58mm">58mm</option>
                <option value="80mm">80mm</option>
                <option value="A4">A4</option>
              </Select>
            </Field>
          </div>

          <Field label="Receipt Footer" theme={theme}>
            <Textarea
              theme={theme}
              rows={5}
              defaultValue="Thank you for shopping with BINHLAIG POS. Please keep this receipt for exchange or return."
            />
          </Field>
        </div>
      );

    case "inventory":
      return (
        <div className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-2">
            <ToggleRow
              title="Allow Negative Stock"
              description="Permit checkout even when inventory falls below zero."
              theme={theme}
            />
            <ToggleRow
              title="Auto Generate SKU"
              description="Generate SKU automatically for newly created products."
              defaultChecked
              theme={theme}
            />
            <ToggleRow
              title="Scan First Workflow"
              description="Prioritize barcode input for faster cashier flow."
              defaultChecked
              theme={theme}
            />
            <Field label="Out-of-Stock Action" theme={theme}>
              <Select theme={theme} defaultValue="warn">
                <option value="warn">Warn only</option>
                <option value="block">Block sale</option>
                <option value="manager">Manager approval</option>
              </Select>
            </Field>

            <Field label="Default SKU Prefix" theme={theme}>
              <Input theme={theme} defaultValue="POS-" />
            </Field>

            <Field label="Stock Alert Channel" theme={theme}>
              <Input theme={theme} defaultValue="Manager Terminal / Dashboard" />
            </Field>
          </div>
        </div>
      );

    case "local-ai":
      return (
        <div className="space-y-6">
          <div className={cx("overflow-hidden rounded-[28px] border", getThemeClasses(theme).aiHero)}>
            <div className="grid gap-5 p-5 xl:grid-cols-[1.3fr_0.7fr]">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className={cx("rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em]", getThemeClasses(theme).accentBadge)}>
                    Offline Ready
                  </span>
                  <span className={cx("rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em]", getThemeClasses(theme).badge)}>
                    Local Model
                  </span>
                </div>
                <h3 className={cx("text-lg font-semibold", getThemeClasses(theme).strongText)}>
                  Private local AI for your POS team
                </h3>
                <p className={cx("mt-2 max-w-2xl text-sm leading-7", getThemeClasses(theme).mutedText)}>
                  Run AI inside your shop for product search, multilingual staff
                  help, stock Q&amp;A and cashier guidance without depending
                  fully on cloud services.
                </p>
              </div>

              <div className={cx("rounded-3xl border p-4", getThemeClasses(theme).border, getThemeClasses(theme).cardSoft)}>
                <div className="flex items-center gap-3">
                  <div className={cx("flex h-11 w-11 items-center justify-center rounded-2xl", theme === "dark" ? "bg-amber-400/10 text-amber-300" : "bg-amber-100 text-amber-700")}>
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={cx("text-xs uppercase tracking-[0.18em]", getThemeClasses(theme).softText)}>
                      Suggested Model
                    </p>
                    <p className={cx("mt-1 text-sm font-medium", getThemeClasses(theme).strongText)}>
                      llama3 / mistral / phi
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3 xl:grid-cols-2">
            <ToggleRow
              title="Enable Local AI"
              description="Turn on local assistant inside the POS system."
              defaultChecked
              theme={theme}
            />

            <Field label="Provider" theme={theme}>
              <Select theme={theme} defaultValue="ollama">
                <option value="ollama">Ollama</option>
                <option value="lmstudio">LM Studio</option>
                <option value="custom">Custom API</option>
              </Select>
            </Field>

            <Field label="Model Name" theme={theme}>
              <Input theme={theme} defaultValue="llama3.1:8b" />
            </Field>

            <Field label="Endpoint URL" theme={theme}>
              <Input theme={theme} defaultValue="http://localhost:11434" />
            </Field>

            <Field label="Assistant Language" theme={theme}>
              <Select theme={theme} defaultValue="multi">
                <option value="multi">Japanese + English + Myanmar</option>
                <option value="ja">Japanese Only</option>
                <option value="en">English Only</option>
                <option value="my">Myanmar Only</option>
              </Select>
            </Field>

            <Field label="Context Window" theme={theme}>
              <Input theme={theme} type="number" defaultValue="4096" />
            </Field>

            <ToggleRow
              title="AI Product Search"
              description="Let staff search products with natural language."
              defaultChecked
              theme={theme}
            />
            <ToggleRow
              title="AI Translation Help"
              description="Support Japanese, English and Myanmar switching."
              defaultChecked
              theme={theme}
            />
            <ToggleRow
              title="AI Sales Suggestion"
              description="Suggest add-ons and related products during sale."
              theme={theme}
            />
          </div>

          <Field label="System Prompt" theme={theme}>
            <Textarea
              theme={theme}
              rows={6}
              defaultValue={`You are the local POS assistant for store staff.
Answer briefly and clearly.
Support Japanese, English, and Myanmar.
Help with product lookup, stock, pricing, receipt questions, and cashier workflow.
Do not expose sensitive data.`}
            />
          </Field>
        </div>
      );

    case "security":
      return (
        <div className="grid gap-4 xl:grid-cols-2">
          <ToggleRow
            title="Require Manager Approval for Refund"
            description="Protect refund and return actions from unauthorized use."
            defaultChecked
            theme={theme}
          />
          <ToggleRow
            title="Confirm Before Void Sale"
            description="Ask for additional confirmation before sale cancellation."
            defaultChecked
            theme={theme}
          />
          <Field label="Manager PIN Length" theme={theme}>
            <Input theme={theme} type="number" defaultValue="6" />
          </Field>
          <Field label="Session Auto Lock (minutes)" theme={theme}>
            <Input theme={theme} type="number" defaultValue="15" />
          </Field>
        </div>
      );

    case "smart-workflow":
      return (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3 xl:grid-cols-2">
          <ToggleRow
            title="Show Shortcut Hints"
            description="Display keyboard helper tips for staff members."
            defaultChecked
            theme={theme}
          />
          <ToggleRow
            title="Play Success Sound"
            description="Play sound feedback after successful payment."
            defaultChecked
            theme={theme}
          />
          <ToggleRow
            title="Low Stock Popup Alerts"
            description="Show stock warning while selling low-stock items."
            defaultChecked
            theme={theme}
          />
          <Field label="Default Search Mode" theme={theme}>
            <Select theme={theme} defaultValue="barcode">
              <option value="barcode">Barcode first</option>
              <option value="name">Product name first</option>
              <option value="ai">AI smart search</option>
            </Select>
          </Field>
          <Field label="New Staff Guidance Level" theme={theme}>
            <Select theme={theme} defaultValue="normal">
              <option value="minimal">Minimal</option>
              <option value="normal">Normal</option>
              <option value="detailed">Detailed</option>
            </Select>
          </Field>
        </div>
      );

    default:
      return null;
  }
}

function SortableSectionCard({ section, children, theme }: SortableCardProps) {
  const [open, setOpen] = React.useState(section.id === "general");
  const t = getThemeClasses(theme);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = section.icon;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={cx(
        "overflow-hidden rounded-[28px] border backdrop-blur-sm transition",
        isDragging ? t.sectionDragging : `${t.border} ${t.card}`
      )}
    >
      <div
        className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 xl:px-6"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border", t.iconBox)}>
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={cx("truncate text-[15px] font-semibold xl:text-base", t.strongText)}>
                {section.title}
              </h3>
              {section.badge ? (
                <span className={cx("rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]", t.badge)}>
                  {section.badge}
                </span>
              ) : null}
            </div>
            <p className={cx("mt-1 text-sm", t.mutedText)}>{section.description}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            {...attributes}
            {...listeners}
            className={cx(
              "flex h-10 w-10 items-center justify-center rounded-2xl border transition",
              t.border,
              t.cardSoft,
              t.cardHover,
              t.mutedText
            )}
            aria-label="Drag section"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div
            className={cx(
              "flex h-10 w-10 items-center justify-center rounded-2xl border",
              t.border,
              t.cardSoft,
              t.mutedText
            )}
          >
            <ChevronRight
              className={cx(
                "h-4 w-4 transition-transform duration-200",
                open && "rotate-90"
              )}
            />
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className={cx("border-t px-5 py-5 xl:px-6 xl:py-6", t.border)}>
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  sub,
  theme,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  sub: string;
  theme: ThemeMode;
}) {
  const t = getThemeClasses(theme);

  return (
    <div className={cx("relative overflow-hidden rounded-[26px] border p-5", t.border, t.cardSoft)}>
      <div className={cx("absolute inset-0", t.metricGlow)} />
      <div className="relative">
        <div className={cx("mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border", t.iconBox)}>
          <Icon className="h-5 w-5" />
        </div>
        <p className={cx("text-[11px] uppercase tracking-[0.18em]", t.softText)}>{title}</p>
        <p className={cx("mt-2 text-base font-semibold xl:text-lg", t.strongText)}>{value}</p>
        <p className={cx("mt-1 text-xs", t.mutedText)}>{sub}</p>
      </div>
    </div>
  );
}

export default function PosSettingsForm(): React.JSX.Element {
  const [theme, setTheme] = React.useState<ThemeMode>("dark");
  const [sections, setSections] = React.useState<SectionItem[]>(sectionsSeed);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  const t = getThemeClasses(theme);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const showMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2200);
  };

  const onSave = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      showMessage("POS settings saved successfully");
    }, 900);
  };

  const onReset = () => {
    showMessage("Preview reset completed");
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSections((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id);
      const newIndex = prev.findIndex((item) => item.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  return (
    <div className={t.page}>
      <div className="mx-auto w-full max-w-[1480px] px-5 py-6 xl:px-8">
        <div className={t.shell}>
          <div className={cx("border-b px-5 py-6 xl:px-8 xl:py-8", t.border)}>
            <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr] xl:items-end">
              <div className="max-w-4xl">
                <div className={cx("mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em]", t.accentBadge)}>
                  <PanelTop className="h-3.5 w-3.5" />
                  POS Configuration Center
                </div>

                <h1 className={cx("text-3xl font-semibold tracking-tight xl:text-[40px]", t.strongText)}>
                  Premium POS Settings
                </h1>

                <p className={cx("mt-3 max-w-3xl text-sm leading-7 xl:text-[15px]", t.mutedText)}>
                  Configure cashier experience, local AI workflow, security,
                  receipt handling and smart store operations in one polished
                  control panel optimized for laptop and counter displays.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                <div className={cx("rounded-3xl border p-4", t.border, t.cardSoft)}>
                  <p className={cx("text-[11px] uppercase tracking-[0.18em]", t.softText)}>
                    Active Mode
                  </p>
                  <p className={cx("mt-2 text-base font-semibold", t.strongText)}>
                    Retail / Counter
                  </p>
                  <p className={cx("mt-1 text-xs", t.mutedText)}>
                    Optimized for cashier-first operation
                  </p>
                </div>

                <div className={cx("rounded-3xl border p-4", t.border, t.cardSoft)}>
                  <p className={cx("text-[11px] uppercase tracking-[0.18em]", t.softText)}>
                    Local AI
                  </p>
                  <p className={cx("mt-2 text-base font-semibold", t.strongText)}>
                    Enabled
                  </p>
                  <p className={cx("mt-1 text-xs", t.mutedText)}>
                    Offline-ready multilingual support
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={cx("sticky top-0 z-30 border-b px-5 py-4 xl:px-8", t.border, t.stickyBar)}>
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cx("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em]", t.badge)}>
                  <Languages className="h-3.5 w-3.5" />
                  Multilingual
                </span>
                <span className={cx("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em]", t.badge)}>
                  <ScanLine className="h-3.5 w-3.5" />
                  Scan-first
                </span>
                <span className={cx("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.16em]", t.badge)}>
                  <Bot className="h-3.5 w-3.5" />
                  Local AI
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={cx(
                    "inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition",
                    t.ghostBtn
                  )}
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-4 w-4" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      Dark Mode
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onReset}
                  className={cx(
                    "inline-flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition",
                    t.ghostBtn
                  )}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={onSave}
                  className={cx(
                    "inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-sm font-semibold transition",
                    t.primaryBtn
                  )}
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save POS Settings"}
                </button>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 xl:px-8">
            <div className="mb-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4 xl:grid-cols-4">
              <MetricCard
                icon={BadgeJapaneseYen}
                title="Currency Profile"
                value="JPY / Tax 10%"
                sub="Default tax and pricing rules"
                theme={theme}
              />
              <MetricCard
                icon={Receipt}
                title="Receipt Setup"
                value="80mm Auto Print"
                sub="Logo and footer enabled"
                theme={theme}
              />
              <MetricCard
                icon={MonitorCog}
                title="Terminal Mode"
                value="Main Counter 01"
                sub="Retail checkout experience"
                theme={theme}
              />
              <MetricCard
                icon={BarChart3}
                title="Risk Control"
                value="Manager Approval"
                sub="Refund and void protection active"
                theme={theme}
              />
            </div>

            <div className={cx("mb-6 rounded-[28px] border p-5", t.border, t.card)}>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className={cx("text-sm font-medium", t.strongText)}>
                    Reorder settings sections
                  </p>
                  <p className={cx("mt-1 text-sm", t.mutedText)}>
                    Drag each handle to arrange the page in the order your team
                    uses most.
                  </p>
                </div>

                <div className={cx("inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-medium uppercase tracking-[0.16em]", t.accentBadge)}>
                  <GripVertical className="h-4 w-4" />
                  DND Kit Enabled
                </div>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((section) => section.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {sections.map((section) => (
                    <SortableSectionCard
                      key={section.id}
                      section={section}
                      theme={theme}
                    >
                      <SectionContent id={section.id} theme={theme} />
                    </SortableSectionCard>
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              <div className={cx("rounded-[28px] border p-5", t.border, t.card)}>
                <div className="mb-3 flex items-center gap-2 text-amber-500">
                  <BellRing className="h-4 w-4" />
                  <p className={cx("text-sm font-semibold", t.strongText)}>Recommended</p>
                </div>
                <p className={cx("text-sm leading-7", t.mutedText)}>
                  For busy stores, enable quick sale mode, scan-first workflow
                  and auto print.
                </p>
              </div>

              <div className={cx("rounded-[28px] border p-5", t.border, t.card)}>
                <div className="mb-3 flex items-center gap-2 text-amber-500">
                  <Sparkles className="h-4 w-4" />
                  <p className={cx("text-sm font-semibold", t.strongText)}>
                    Best with Local AI
                  </p>
                </div>
                <p className={cx("text-sm leading-7", t.mutedText)}>
                  Use local AI for multilingual support, product search and
                  faster staff guidance.
                </p>
              </div>

              <div className={cx("rounded-[28px] border p-5", t.border, t.card)}>
                <div className="mb-3 flex items-center gap-2 text-amber-500">
                  <CheckCircle2 className="h-4 w-4" />
                  <p className={cx("text-sm font-semibold", t.strongText)}>
                    Safe Default
                  </p>
                </div>
                <p className={cx("text-sm leading-7", t.mutedText)}>
                  Use manager approval and session auto-lock for shared terminals
                  and junior staff.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {message ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className={cx("inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl", t.toast)}>
              <CheckCircle2 className="h-4 w-4 text-amber-500" />
              {message}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}