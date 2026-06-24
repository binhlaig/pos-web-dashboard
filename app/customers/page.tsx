"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import {
  Search,
  User,
  Users,
  Plus,
  Download,
  Sun,
  Moon,
  Sparkles,
  Zap,
  ArrowUpRight,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ShoppingBag,
  Crown,
  Star,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const customers = [
  { id: "C-001", name: "Aung Aung",    phone: "+95 9 111 222 33", branch: "Main Branch", total: 120000, orders: 12, lastOrder: "2026-03-22", tier: "gold",     joined: "2024-01" },
  { id: "C-002", name: "Su Su",         phone: "+95 9 222 333 44", branch: "Branch A",    total:  54000, orders:  6, lastOrder: "2026-03-20", tier: "silver",   joined: "2024-06" },
  { id: "C-003", name: "Ko Ko",         phone: "+95 9 333 444 55", branch: "Online Shop", total:  18500, orders:  3, lastOrder: "2026-03-18", tier: "bronze",   joined: "2025-01" },
  { id: "C-004", name: "Moe Thidar",    phone: "+95 9 444 555 66", branch: "Main Branch", total: 245000, orders: 28, lastOrder: "2026-03-23", tier: "platinum", joined: "2023-08" },
  { id: "C-005", name: "Hla Hla",       phone: "+95 9 555 666 77", branch: "Branch B",    total:  72000, orders:  9, lastOrder: "2026-03-21", tier: "silver",   joined: "2024-03" },
  { id: "C-006", name: "Kyaw Zin",      phone: "+95 9 666 777 88", branch: "Branch A",    total:  38000, orders:  5, lastOrder: "2026-03-19", tier: "bronze",   joined: "2025-02" },
  { id: "C-007", name: "Thida Win",     phone: "+95 9 777 888 99", branch: "Online Shop", total: 196000, orders: 19, lastOrder: "2026-03-22", tier: "gold",     joined: "2023-11" },
  { id: "C-008", name: "Naing Naing",   phone: "+95 9 888 999 00", branch: "Main Branch", total:   9200, orders:  2, lastOrder: "2026-03-15", tier: "bronze",   joined: "2025-03" },
];

type Tier = "platinum" | "gold" | "silver" | "bronze";

const tierCfg: Record<Tier, { label: string; icon: React.FC<{ className?: string }>; bg: string; text: string; ring: string }> = {
  platinum: { label: "Platinum", icon: Crown,   bg: "bg-sky-500/10",     text: "text-sky-400",    ring: "ring-sky-500/30"   },
  gold:     { label: "Gold",     icon: Star,    bg: "bg-amber-500/10",   text: "text-amber-400",  ring: "ring-amber-500/30" },
  silver:   { label: "Silver",   icon: TrendingUp, bg: "bg-slate-400/10", text: "text-slate-400", ring: "ring-slate-400/30" },
  bronze:   { label: "Bronze",   icon: User,    bg: "bg-orange-700/10",  text: "text-orange-400", ring: "ring-orange-700/30"},
};

const TIERS   = ["All", "Platinum", "Gold", "Silver", "Bronze"];
const BRANCHES = ["All", "Main Branch", "Branch A", "Branch B", "Online Shop"];
const SORTS    = ["Name", "Total Spent", "Orders", "Last Order"];

function money(n: number) { return `¥${n.toLocaleString()}`; }

// ─── THEME ────────────────────────────────────────────────────────────────────
type Theme = "dark" | "light";

const tk = (theme: Theme) => theme === "dark" ? {
  root:        "bg-[#060a14] text-white",
  text:        "text-white",
  textMuted:   "text-white/50",
  textSubtle:  "text-white/32",
  card:        "border-white/[0.07] bg-white/[0.048] backdrop-blur-xl",
  cardHover:   "hover:border-white/[0.12] hover:bg-white/[0.07]",
  input:       "border-white/[0.10] bg-white/[0.06] text-white placeholder:text-white/30 focus-visible:border-blue-500/60",
  btn:         "border-white/[0.10] bg-white/[0.055] text-white/80 hover:bg-white/[0.10] hover:text-white",
  btnPrimary:  "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10",
  divider:     "bg-white/[0.06]",
  pill:        "border-white/[0.08] bg-white/[0.05] text-white/60",
  tableBorder: "border-white/[0.055]",
  tableHead:   "text-white/38",
  tableRow:    "border-white/[0.045] hover:bg-white/[0.04]",
  segActive:   "bg-white/[0.14] text-white",
  segInactive: "text-white/42 hover:text-white/70",
  grid:        "[background-image:linear-gradient(rgba(255,255,255,0.026)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.026)_1px,transparent_1px)] [background-size:44px_44px]",
  glow1:       "bg-violet-600/[0.07]",
  glow2:       "bg-blue-600/[0.06]",
  catActive:   "border-white/[0.15] bg-white/[0.12] text-white",
  catInactive: "border-white/[0.07] bg-white/[0.035] text-white/50 hover:bg-white/[0.07] hover:text-white/80",
  avatarBg:    "bg-white/[0.09]",
  dropMenu:    "bg-[#0c1018] border-white/[0.09]",
  dropItem:    "text-white/70 hover:text-white focus:text-white hover:bg-white/[0.07] focus:bg-white/[0.07]",
  statChip:    "bg-white/[0.04] border-white/[0.07]",
} : {
  root:        "bg-[#edf1f9] text-slate-900",
  text:        "text-slate-900",
  textMuted:   "text-slate-500",
  textSubtle:  "text-slate-400",
  card:        "border-slate-200/80 bg-white/95 shadow-[0_2px_20px_rgba(15,23,42,0.06)] backdrop-blur-xl",
  cardHover:   "hover:border-slate-300 hover:shadow-[0_6px_28px_rgba(15,23,42,0.10)]",
  input:       "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-blue-500",
  btn:         "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 shadow-sm",
  btnPrimary:  "bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/20",
  divider:     "bg-slate-200",
  pill:        "border-slate-200 bg-white text-slate-500 shadow-sm",
  tableBorder: "border-slate-200",
  tableHead:   "text-slate-400",
  tableRow:    "border-slate-100 hover:bg-slate-50/70",
  segActive:   "bg-white text-slate-900 shadow-sm",
  segInactive: "text-slate-500 hover:text-slate-700",
  grid:        "[background-image:linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] [background-size:44px_44px]",
  glow1:       "bg-violet-300/15",
  glow2:       "bg-sky-300/18",
  catActive:   "border-slate-900 bg-slate-900 text-white shadow-sm",
  catInactive: "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 shadow-sm",
  avatarBg:    "bg-slate-100",
  dropMenu:    "bg-white border-slate-200",
  dropItem:    "text-slate-600 hover:text-slate-900 focus:text-slate-900",
  statChip:    "bg-slate-50 border-slate-200",
};

// ─── AVATAR ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-fuchsia-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-blue-500",
];
function Avatar({ name, size = "md", idx = 0 }: { name: string; size?: "sm" | "md" | "lg"; idx?: number }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const grad = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  const sz = size === "sm" ? "h-8 w-8 text-[11px]" : size === "lg" ? "h-14 w-14 text-[16px]" : "h-10 w-10 text-[13px]";
  return (
    <div className={cn("flex shrink-0 items-center justify-center rounded-2xl font-black text-white bg-gradient-to-br", sz, grad)}>
      {initials}
    </div>
  );
}

// ─── KPI CARD ────────────────────────────────────────────────────────────────
function KpiCard({ theme, label, value, sub, icon: Icon, accentClass, valueColor = "", prefix = "", delay = 0 }: {
  theme: Theme; label: string; value: number; sub: string; prefix?: string;
  icon: React.ComponentType<{ className?: string }>; accentClass: string;
  valueColor?: string; delay?: number;
}) {
  const t = tk(theme);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.015 }}
    >
      <div className={cn("relative overflow-hidden rounded-[20px] border p-5 transition-all duration-200", t.card)}>
        <div className={cn("absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl opacity-45", accentClass)} />
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border",
              theme === "dark" ? "border-white/[0.07] bg-white/[0.07]" : "border-slate-200 bg-slate-50"
            )}>
              <Icon className={cn("h-[18px] w-[18px]", t.textMuted)} />
            </div>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </div>
          <div className={cn("text-[11px] font-bold uppercase tracking-widest mb-1.5", t.textSubtle)}>{label}</div>
          <div className={cn("text-[28px] font-black tracking-tight leading-none", valueColor || t.text)}>
            {prefix}<CountUp end={value} duration={1.4} separator="," />
          </div>
          <div className={cn("mt-2 text-[11px] font-medium", t.textSubtle)}>{sub}</div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── SORT ICON ────────────────────────────────────────────────────────────────
function SortIco({ field, sortField, sortDir, theme }: { field: string; sortField: string; sortDir: "asc" | "desc"; theme: Theme }) {
  if (sortField !== field) return <ArrowUpRight className={cn("h-3 w-3 opacity-25", tk(theme).tableHead)} />;
  return sortDir === "asc" ? <ChevronUp className="h-3 w-3 text-blue-400" /> : <ChevronDown className="h-3 w-3 text-blue-400" />;
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const [q,          setQ]          = React.useState("");
  const [tierFilter, setTierFilter] = React.useState("All");
  const [branchFilter, setBranchFilter] = React.useState("All");
  const [theme,      setTheme]      = React.useState<Theme>("dark");
  const [sortField,  setSortField]  = React.useState("total");
  const [sortDir,    setSortDir]    = React.useState<"asc" | "desc">("desc");
  const [viewMode,   setViewMode]   = React.useState<"table" | "grid">("table");
  const t = tk(theme);

  const filtered = React.useMemo(() => {
    return customers
      .filter(c => {
        const matchQ = !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.id.toLowerCase().includes(q.toLowerCase());
        const matchTier   = tierFilter === "All"   || c.tier === tierFilter.toLowerCase();
        const matchBranch = branchFilter === "All" || c.branch === branchFilter;
        return matchQ && matchTier && matchBranch;
      })
      .sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortField === "total")  return (a.total  - b.total)  * dir;
        if (sortField === "orders") return (a.orders - b.orders) * dir;
        if (sortField === "name")   return a.name.localeCompare(b.name) * dir;
        return 0;
      });
  }, [q, tierFilter, branchFilter, sortField, sortDir]);

  function toggleSort(field: string) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  }

  const totalRevenue = customers.reduce((s, c) => s + c.total, 0);
  const avgSpend     = Math.round(totalRevenue / customers.length);

  return (
    <div className={cn("relative min-h-screen transition-colors duration-300", t.root)}>
      {/* grid */}
      <div className={cn("pointer-events-none fixed inset-0", t.grid)} />
      {/* glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className={cn("absolute -top-32 left-[20%] h-[500px] w-[500px] rounded-full blur-[130px]", t.glow1)} />
        <div className={cn("absolute bottom-0 right-[-5%] h-[400px] w-[400px] rounded-full blur-[120px]", t.glow2)} />
      </div>

      <div className="relative z-10 mx-auto max-w-[1520px] px-5 py-7 md:px-8 space-y-7">

        {/* ── TOPBAR ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26 }}
          className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className={cn("mb-2.5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold", t.pill)}>
              <Sparkles className="h-3 w-3" />
              Customer Management
            </div>
            <h1 className={cn("text-[34px] md:text-[42px] font-black tracking-tight leading-[0.95]", t.text)}>
              Customers
              <span className={cn("ml-3 text-[20px] font-bold", t.textMuted)}>/ All</span>
            </h1>
            <p className={cn("mt-2 text-sm", t.textMuted)}>
              Track customer lifetime value, purchase history, and loyalty tiers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5", t.textSubtle)} />
              <Input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search name, ID…"
                className={cn("h-9 w-[230px] rounded-xl pl-9 text-[13px]", t.input)}
              />
            </div>
            <button className={cn("flex h-9 items-center gap-1.5 rounded-xl border px-3.5 text-[13px] font-semibold", t.btn)}>
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            <button
              onClick={() => setTheme(th => th === "dark" ? "light" : "dark")}
              className={cn("flex h-9 w-9 items-center justify-center rounded-xl border transition-all", t.btn)}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button className={cn("flex h-9 items-center gap-1.5 rounded-xl px-4 text-[13px] font-bold", t.btnPrimary)}>
              <Plus className="h-4 w-4" />
              Add Customer
            </button>
          </div>
        </motion.div>

        {/* ── KPI ROW ───────────────────────────────────────────────────── */}
        <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
          <KpiCard theme={theme} label="Total Customers" value={customers.length} sub="Registered accounts"  icon={Users}      accentClass="bg-blue-500/18"    delay={0}    />
          <KpiCard theme={theme} label="Total Revenue"   value={totalRevenue}    sub="Lifetime value"        icon={TrendingUp} accentClass="bg-emerald-500/18" delay={0.07} prefix="¥" />
          <KpiCard theme={theme} label="Avg Spend"       value={avgSpend}        sub="Per customer"          icon={ShoppingBag}accentClass="bg-violet-500/18"  delay={0.14} prefix="¥" />
          <KpiCard theme={theme} label="Platinum Tier"   value={customers.filter(c=>c.tier==="platinum").length} sub="Top loyalty members" icon={Crown} accentClass="bg-sky-500/18" delay={0.21} />
        </div>

        {/* ── TIER BREAKDOWN STRIP ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {(["platinum","gold","silver","bronze"] as Tier[]).map(tier => {
            const cfg = tierCfg[tier];
            const Icon = cfg.icon;
            const count = customers.filter(c => c.tier === tier).length;
            return (
              <div key={tier} className={cn("flex items-center gap-3 rounded-[18px] border px-4 py-3.5", t.card)}>
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", cfg.bg)}>
                  <Icon className={cn("h-4 w-4", cfg.text)} />
                </div>
                <div>
                  <div className={cn("text-[11px] font-bold uppercase tracking-widest", t.textSubtle)}>{cfg.label}</div>
                  <div className={cn("text-[22px] font-black", cfg.text)}>{count}</div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* ── MAIN TABLE/GRID ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.30 }}
        >
          <div className={cn("rounded-[22px] border overflow-hidden", t.card)}>

            {/* Controls */}
            <div className={cn("px-6 py-5 space-y-4 border-b", t.tableBorder)}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className={cn("text-[17px] font-bold", t.text)}>Customer List</div>
                  <div className={cn("text-[12px] mt-0.5", t.textMuted)}>{filtered.length} customer{filtered.length !== 1 ? "s" : ""} found</div>
                </div>
                {/* View toggle */}
                <div className={cn("flex items-center rounded-xl border overflow-hidden", theme === "dark" ? "bg-white/[0.045] border-white/[0.07]" : "bg-slate-100 border-slate-200")}>
                  {(["table","grid"] as const).map(v => (
                    <button key={v} onClick={() => setViewMode(v)}
                      className={cn("px-4 py-2 text-[11px] font-bold transition-all capitalize", viewMode === v ? t.segActive : t.segInactive)}
                    >{v}</button>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {TIERS.map(tier => (
                    <button key={tier} onClick={() => setTierFilter(tier)}
                      className={cn("rounded-xl border px-3 py-1.5 text-[12px] font-bold transition-all",
                        tierFilter === tier ? t.catActive : t.catInactive
                      )}
                    >{tier}</button>
                  ))}
                </div>
                <div className={cn("w-px self-stretch", t.divider)} />
                <div className="flex flex-wrap gap-1.5">
                  {BRANCHES.map(b => (
                    <button key={b} onClick={() => setBranchFilter(b)}
                      className={cn("rounded-xl border px-3 py-1.5 text-[12px] font-bold transition-all",
                        branchFilter === b ? t.catActive : t.catInactive
                      )}
                    >{b}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── TABLE VIEW ── */}
            <AnimatePresence mode="wait">
              {viewMode === "table" ? (
                <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px]">
                      <thead>
                        <tr className={cn("border-b", t.tableBorder)}>
                          {[
                            { label: "Customer",    field: "name",   sortable: true,  align: "left"   },
                            { label: "Tier",        field: "",       sortable: false, align: "left"   },
                            { label: "Branch",      field: "",       sortable: false, align: "left"   },
                            { label: "Orders",      field: "orders", sortable: true,  align: "center" },
                            { label: "Total Spent", field: "total",  sortable: true,  align: "right"  },
                            { label: "Last Order",  field: "",       sortable: false, align: "left"   },
                            { label: "",            field: "",       sortable: false, align: "center" },
                          ].map((h, i) => (
                            <th key={i}
                              onClick={() => h.sortable && toggleSort(h.field)}
                              className={cn(
                                "px-4 py-3.5 text-[10px] font-black uppercase tracking-widest",
                                h.align === "right" ? "text-right" : h.align === "center" ? "text-center" : "text-left",
                                h.sortable ? "cursor-pointer select-none" : "",
                                t.tableHead
                              )}
                            >
                              {h.label && (
                                <span className="inline-flex items-center gap-1">
                                  {h.label}
                                  {h.sortable && <SortIco field={h.field} sortField={sortField} sortDir={sortDir} theme={theme} />}
                                </span>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <AnimatePresence mode="popLayout">
                        <tbody>
                          {filtered.map((c, i) => {
                            const tier = tierCfg[c.tier as Tier];
                            const TierIcon = tier.icon;
                            return (
                              <motion.tr
                                key={c.id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className={cn("border-b transition-colors cursor-default group", t.tableRow)}
                              >
                                {/* Customer */}
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <Avatar name={c.name} idx={i} />
                                    <div>
                                      <div className={cn("text-[13px] font-bold", t.text)}>{c.name}</div>
                                      <div className={cn("text-[11px] font-mono", t.textSubtle)}>{c.id}</div>
                                    </div>
                                  </div>
                                </td>
                                {/* Tier */}
                                <td className="px-4 py-3.5">
                                  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold", tier.bg, tier.text)}>
                                    <TierIcon className="h-3 w-3" />
                                    {tier.label}
                                  </span>
                                </td>
                                {/* Branch */}
                                <td className="px-4 py-3.5">
                                  <span className={cn("rounded-lg border px-2.5 py-1 text-[11px] font-semibold", t.pill)}>{c.branch}</span>
                                </td>
                                {/* Orders */}
                                <td className="px-4 py-3.5 text-center">
                                  <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-xl text-[12px] font-bold",
                                    theme === "dark" ? "bg-white/[0.07] text-white/70" : "bg-slate-100 text-slate-600"
                                  )}>{c.orders}</span>
                                </td>
                                {/* Total */}
                                <td className="px-4 py-3.5 text-right">
                                  <span className={cn("text-[14px] font-black", t.text)}>{money(c.total)}</span>
                                </td>
                                {/* Last Order */}
                                <td className="px-4 py-3.5">
                                  <div className={cn("flex items-center gap-1.5 text-[12px]", t.textSubtle)}>
                                    <Calendar className="h-3 w-3" />
                                    {c.lastOrder}
                                  </div>
                                </td>
                                {/* Actions */}
                                <td className="px-4 py-3.5 text-center">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className={cn("flex h-8 w-8 items-center justify-center rounded-xl border opacity-0 group-hover:opacity-100 transition-all", t.btn)}>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className={cn("rounded-2xl border min-w-[170px] p-1.5", t.dropMenu)}>
                                      <DropdownMenuItem className={cn("rounded-xl gap-2.5 text-[13px] py-2.5 cursor-pointer", t.dropItem)}>
                                        <Eye className="h-3.5 w-3.5" />View Profile
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className={cn("rounded-xl gap-2.5 text-[13px] py-2.5 cursor-pointer", t.dropItem)}>
                                        <Pencil className="h-3.5 w-3.5" />Edit Customer
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className={cn("rounded-xl gap-2.5 text-[13px] py-2.5 cursor-pointer", t.dropItem)}>
                                        <ShoppingBag className="h-3.5 w-3.5" />View Orders
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator className={cn("my-1", t.divider)} />
                                      <DropdownMenuItem className="rounded-xl gap-2.5 text-[13px] py-2.5 cursor-pointer text-rose-500 hover:bg-rose-500/10 focus:bg-rose-500/10 focus:text-rose-500 hover:text-rose-500">
                                        <Trash2 className="h-3.5 w-3.5" />Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </motion.tr>
                            );
                          })}
                          {filtered.length === 0 && (
                            <tr>
                              <td colSpan={7} className={cn("py-16 text-center", t.textMuted)}>
                                <div className="flex flex-col items-center gap-3">
                                  <Users className="h-10 w-10 opacity-25" />
                                  <div className="text-sm font-semibold">No customers found</div>
                                  <div className={cn("text-[12px]", t.textSubtle)}>Try adjusting your search or filters</div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </AnimatePresence>
                    </table>
                  </div>
                </motion.div>
              ) : (

                /* ── GRID VIEW ── */
                <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                >
                  <AnimatePresence mode="popLayout">
                    {filtered.map((c, i) => {
                      const tier = tierCfg[c.tier as Tier];
                      const TierIcon = tier.icon;
                      return (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ y: -4, scale: 1.02 }}
                          className={cn("relative overflow-hidden rounded-[20px] border p-5 transition-all cursor-default", t.card)}
                        >
                          <div className={cn("absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl opacity-30", tier.bg.replace("/10", "/40"))} />
                          <div className="relative">
                            {/* Top row */}
                            <div className="flex items-start justify-between mb-4">
                              <Avatar name={c.name} size="lg" idx={i} />
                              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold", tier.bg, tier.text)}>
                                <TierIcon className="h-3 w-3" />
                                {tier.label}
                              </span>
                            </div>
                            {/* Name */}
                            <div className={cn("text-[15px] font-bold", t.text)}>{c.name}</div>
                            <div className={cn("text-[11px] font-mono mt-0.5", t.textSubtle)}>{c.id}</div>
                            {/* Branch */}
                            <div className={cn("mt-2 flex items-center gap-1.5 text-[12px]", t.textMuted)}>
                              <MapPin className="h-3 w-3" />
                              {c.branch}
                            </div>
                            {/* Divider */}
                            <div className={cn("my-4 h-px", t.divider)} />
                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className={cn("rounded-xl border px-3 py-2.5", t.statChip)}>
                                <div className={cn("text-[10px] font-bold uppercase tracking-widest", t.textSubtle)}>Orders</div>
                                <div className={cn("text-[18px] font-black mt-0.5", t.text)}>{c.orders}</div>
                              </div>
                              <div className={cn("rounded-xl border px-3 py-2.5", t.statChip)}>
                                <div className={cn("text-[10px] font-bold uppercase tracking-widest", t.textSubtle)}>Spent</div>
                                <div className={cn("text-[16px] font-black mt-0.5", t.text)}>¥{(c.total / 1000).toFixed(0)}k</div>
                              </div>
                            </div>
                            {/* Last order */}
                            <div className={cn("mt-3 flex items-center gap-1.5 text-[11px]", t.textSubtle)}>
                              <Calendar className="h-3 w-3" />
                              Last order: {c.lastOrder}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    {filtered.length === 0 && (
                      <div className={cn("col-span-full py-16 text-center", t.textMuted)}>
                        <div className="flex flex-col items-center gap-3">
                          <Users className="h-10 w-10 opacity-25" />
                          <div className="text-sm font-semibold">No customers found</div>
                        </div>
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className={cn("flex items-center justify-between px-6 py-4 border-t", t.tableBorder)}>
              <div className={cn("text-[12px] font-medium", t.textSubtle)}>
                Showing <span className={cn("font-bold", t.textMuted)}>{filtered.length}</span> of <span className={cn("font-bold", t.textMuted)}>{customers.length}</span> customers
              </div>
              <div className="flex items-center gap-2">
                {["Prev", "1", "2", "Next"].map(p => (
                  <button key={p} className={cn("flex h-8 min-w-[32px] items-center justify-center rounded-xl border px-3 text-[12px] font-bold transition-all",
                    p === "1" ? theme === "dark" ? "bg-white/[0.14] border-white/[0.14] text-white" : "bg-slate-900 border-transparent text-white" : t.btn
                  )}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <div className={cn("flex items-center justify-between text-[11px] font-semibold pb-3", t.textSubtle)}>
          <span>© 2026 BINHLAIG · Customer Module</span>
          <span className="flex items-center gap-1.5"><Zap className="h-3 w-3" />Live · Updated just now</span>
        </div>

      </div>
    </div>
  );
}