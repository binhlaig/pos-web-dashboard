"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { postForm } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import {
  Building2,
  Eye,
  EyeOff,
  Hash,
  Image as ImageIcon,
  ImagePlus,
  LocateFixed,
  MapPinned,
  ShieldCheck,
  Store,
  UploadCloud,
  UserCog,
  UserPlus2,
  CheckCircle2,
  BadgeCheck,
  LockKeyhole,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Wand2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Types ────────────────────────────────────────────────────────────────────

type RegisterResponse = {
  message?: string;
  username: string;
  role: string;
  imageUrl?: string | null;
  shopId?: number | null;
  shopCode?: string | null;
  shopName?: string | null;
  address?: string | null;
  businessType?: string | null;
};

/** Shape returned when checking ID/code conflicts */
type ConflictCheckResponse = {
  shopIdExists: boolean;
  shopCodeExists: boolean;
  suggestedShopId?: number;
  suggestedShopCode?: string;
};

type RoleType = "CASHIER" | "ADMIN";
type BusinessType = "SUPERMARKET" | "RESTAURANT" | "FASHION" | "FRUIT" | "BOTH";

// ─── Field conflict states ─────────────────────────────────────────────────────
type FieldConflict = "idle" | "checking" | "conflict" | "ok";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Local AI generator — pure client-side, zero network call.
 *
 * Shop ID  : random 3-digit integer (100 – 9999)
 * Shop Code: "SHOP-" + random 3-char alphanum suffix, uppercased
 */
function generateShopId(): number {
  return Math.floor(100 + Math.random() * 9900);
}

function generateShopCode(seed?: string): string {
  const alphanum = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 3; i++) {
    suffix += alphanum[Math.floor(Math.random() * alphanum.length)];
  }
  const prefix = seed ? seed.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "S") : "SHP";
  return `${prefix}-${suffix}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Account fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleType>("CASHIER");
  const [businessType, setBusinessType] = useState<BusinessType>("SUPERMARKET");

  // Shop fields
  const [shopId, setShopId] = useState("");
  const [shopCode, setShopCode] = useState("");
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");

  // Conflict states
  const [shopIdConflict, setShopIdConflict] = useState<FieldConflict>("idle");
  const [shopCodeConflict, setShopCodeConflict] = useState<FieldConflict>("idle");
  const [suggestedId, setSuggestedId] = useState<number | null>(null);
  const [suggestedCode, setSuggestedCode] = useState<string | null>(null);

  // Image
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form state
  const [msg, setMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatingId, setGeneratingId] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);

  // ── Image preview ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!image) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  // ── Password strength ────────────────────────────────────────────────────────
  const pwScore = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 20;
    if (/\d/.test(password)) score += 20;
    if (/[^\w\s]/.test(password)) score += 15;
    return Math.min(100, score);
  }, [password]);

  const pwLabel = pwScore < 40 ? "Weak" : pwScore < 70 ? "Good" : "Strong";

  const roleDescription = useMemo(() => (
    role === "ADMIN"
      ? "Full access to products, user management, and configuration."
      : "Operational access for daily cashier and sales tasks."
  ), [role]);

  const businessTypeDescription = useMemo(() => {
    if (businessType === "RESTAURANT") {
      return "Restaurant workspace: table order, menu, kitchen, restaurant POS.";
    }
    if (businessType === "FASHION") {
      return "Fashion workspace: size, color, variant barcode, and fashion stock POS.";
    }
    if (businessType === "FRUIT") {
      return "Fruit workspace: weight/unit sale, expiry, and waste stock POS.";
    }
    if (businessType === "BOTH") {
      return "Multi workspace: supermarket, restaurant, fashion, and fruit modules are available.";
    }
    return "Supermarket workspace: product, barcode, receipt, supermarket POS.";
  }, [businessType]);

  // ── Conflict check (debounced) ───────────────────────────────────────────────
  /**
   * Calls the backend to verify whether the given shopId or shopCode already
   * exists in the database.  If they do, the server returns suggested
   * alternatives via `suggestedShopId` / `suggestedShopCode`.
   *
   * Endpoint (example): GET /backend/api/shops/check?shopId=101&shopCode=SHP-A3K
   */
  const checkConflicts = useCallback(
    async (id: string, code: string) => {
      if (!id && !code) return;

      const parsedId = Number(id);
      const hasId = id && !Number.isNaN(parsedId) && parsedId > 0;
      const hasCode = code.trim().length > 0;

      if (!hasId && !hasCode) return;

      if (hasId) setShopIdConflict("checking");
      if (hasCode) setShopCodeConflict("checking");

      try {
        const params = new URLSearchParams();
        if (hasId) params.set("shopId", String(parsedId));
        if (hasCode) params.set("shopCode", code.trim().toUpperCase());

        const res = await fetch(`/backend/api/shops/check?${params.toString()}`);
        if (!res.ok) throw new Error("Check failed");

        const data: ConflictCheckResponse = await res.json();

        if (hasId) {
          setShopIdConflict(data.shopIdExists ? "conflict" : "ok");
          setSuggestedId(data.shopIdExists ? (data.suggestedShopId ?? null) : null);
        }
        if (hasCode) {
          setShopCodeConflict(data.shopCodeExists ? "conflict" : "ok");
          setSuggestedCode(data.shopCodeExists ? (data.suggestedShopCode ?? null) : null);
        }
      } catch {
        // Silently reset on network error — do not block the form
        if (hasId) setShopIdConflict("idle");
        if (hasCode) setShopCodeConflict("idle");
      }
    },
    []
  );

  // Debounce conflict checks whenever shopId or shopCode changes
  useEffect(() => {
    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    checkTimeoutRef.current = setTimeout(() => {
      checkConflicts(shopId, shopCode);
    }, 600);
    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, [shopId, shopCode, checkConflicts]);

  // ── AI Generators ────────────────────────────────────────────────────────────

  const handleGenerateId = async () => {
    setGeneratingId(true);
    // Simulate brief "thinking" animation
    await new Promise(r => setTimeout(r, 320));
    const newId = generateShopId();
    setShopId(String(newId));
    setShopIdConflict("idle");
    setSuggestedId(null);
    setGeneratingId(false);
    toast.success("Shop ID generated", { icon: "✨" });
  };

  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    await new Promise(r => setTimeout(r, 320));
    const seed = shopName || "SHP";
    const newCode = generateShopCode(seed);
    setShopCode(newCode);
    setShopCodeConflict("idle");
    setSuggestedCode(null);
    setGeneratingCode(false);
    toast.success("Shop Code generated", { icon: "✨" });
  };

  // Apply server-suggested alternatives
  const applyConflictSuggestion = (field: "id" | "code") => {
    if (field === "id" && suggestedId !== null) {
      setShopId(String(suggestedId));
      setShopIdConflict("idle");
      setSuggestedId(null);
      toast.success(`Shop ID updated to ${suggestedId}`);
    }
    if (field === "code" && suggestedCode !== null) {
      setShopCode(suggestedCode);
      setShopCodeConflict("idle");
      setSuggestedCode(null);
      toast.success(`Shop Code updated to ${suggestedCode}`);
    }
  };

  // Regenerate locally and re-check
  const regenAndCheck = async (field: "id" | "code") => {
    if (field === "id") {
      await handleGenerateId();
    } else {
      await handleGenerateCode();
    }
  };

  // ── Image handlers ───────────────────────────────────────────────────────────
  const handleFileSelect = (files: FileList | null) => {
    if (!files || !files[0]) return;
    const f = files[0];
    if (!f.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (f.size > 3 * 1024 * 1024) { toast.error("Image too large (max 3MB)"); return; }
    setImage(f);
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Form reset ───────────────────────────────────────────────────────────────
  const clearForm = () => {
    setUsername(""); setPassword(""); setRole("CASHIER"); setBusinessType("SUPERMARKET");
    setShopId(""); setShopCode(""); setShopName(""); setAddress("");
    setShopIdConflict("idle"); setShopCodeConflict("idle");
    setSuggestedId(null); setSuggestedCode(null);
    setMsg("");
    removeImage();
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const validateForm = () => {
    if (!username.trim()) { toast.error("Username is required"); return false; }
    if (username.trim().length < 3) { toast.error("Username must be at least 3 characters"); return false; }
    if (!password || password.length < 8) { toast.error("Password must be at least 8 characters"); return false; }

    const parsedShopId = Number(shopId);
    if (!shopId || Number.isNaN(parsedShopId) || parsedShopId <= 0) { toast.error("Valid shop ID is required"); return false; }
    if (!shopCode.trim()) { toast.error("Shop code is required"); return false; }
    if (!shopName.trim()) { toast.error("Shop name is required"); return false; }
    if (!address.trim()) { toast.error("Address is required"); return false; }

    if (shopIdConflict === "conflict") {
      toast.error("Shop ID already exists. Use the suggested ID or generate a new one.");
      return false;
    }
    if (shopCodeConflict === "conflict") {
      toast.error("Shop Code already exists. Use the suggested code or generate a new one.");
      return false;
    }

    return true;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!validateForm()) return;

    setSubmitting(true);
    setMsg("");
    const toastId = toast.loading("Creating account...");

    try {
      const form = new FormData();
      form.append("username", username.trim());
      form.append("password", password);
      form.append("role", role);
      form.append("businessType", businessType);
      form.append("business_type", businessType);
      form.append("shopId", shopId);
      form.append("shopCode", shopCode.trim().toUpperCase());
      form.append("shopName", shopName.trim());
      form.append("address", address.trim());
      if (image) form.append("image", image);

      const data = await postForm<RegisterResponse>("/backend/api/auth/register", form, false);

      // ── If backend returns conflict on ID or Code, auto-switch ─────────────
      // Some backends return HTTP 409 with body; others return 200 with flags.
      // Adjust this block to match your API contract.
      if ((data as any)?.conflictShopId) {
        const newId = (data as any).suggestedShopId ?? generateShopId();
        setShopId(String(newId));
        setShopIdConflict("conflict");
        setSuggestedId(newId);
        toast.error(`Shop ID conflict — switched to ${newId}. Please re-submit.`, { id: toastId });
        setSubmitting(false);
        return;
      }
      if ((data as any)?.conflictShopCode) {
        const newCode = (data as any).suggestedShopCode ?? generateShopCode(shopName);
        setShopCode(newCode);
        setShopCodeConflict("conflict");
        setSuggestedCode(newCode);
        toast.error(`Shop Code conflict — switched to ${newCode}. Please re-submit.`, { id: toastId });
        setSubmitting(false);
        return;
      }

      const text = data?.message
        ? `${data.message} — ${data.username} (${data.role}) · ${data.businessType ?? businessType}`
        : `Registered as ${data.username} (${data.role}) · ${data.businessType ?? businessType}`;

      toast.success(text, { id: toastId });
      clearForm();
      setMsg(text);
    } catch (err) {
      console.error("❌ Register error:", err);

      // Handle HTTP 409 conflict thrown by the API wrapper
      const errMsg = err instanceof Error ? err.message : String(err);

      // Try to parse conflict payload embedded in error message
      if (errMsg.includes("shopId") && errMsg.toLowerCase().includes("exist")) {
        const newId = generateShopId();
        setShopId(String(newId));
        setShopIdConflict("conflict");
        setSuggestedId(newId);
        toast.error(`Shop ID already exists — try ID ${newId}`, { id: toastId });
      } else if (errMsg.includes("shopCode") && errMsg.toLowerCase().includes("exist")) {
        const newCode = generateShopCode(shopName);
        setShopCode(newCode);
        setShopCodeConflict("conflict");
        setSuggestedCode(newCode);
        toast.error(`Shop Code already exists — try ${newCode}`, { id: toastId });
      } else {
        setMsg(errMsg);
        toast.error(errMsg, { id: toastId });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Conflict banner helper ───────────────────────────────────────────────────
  const ConflictBanner = ({
    field,
    suggested,
  }: {
    field: "id" | "code";
    suggested: number | string | null;
  }) => (
    <AnimatePresence>
      {suggested !== null && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
        >
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Already in use. Suggested:{" "}
            <span className="font-semibold">{String(suggested)}</span>
          </span>
          <div className="flex gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-6 rounded-lg border-amber-300 px-2 py-0 text-xs text-amber-700 hover:bg-amber-100 dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-500/20"
              onClick={() => applyConflictSuggestion(field)}
            >
              Use this
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-6 rounded-lg px-2 py-0 text-xs text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-500/20"
              onClick={() => regenAndCheck(field)}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Regen
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ── Field status icon ────────────────────────────────────────────────────────
  const FieldStatus = ({ state }: { state: FieldConflict }) => {
    if (state === "checking") return <Loader2 className="h-4 w-4 animate-spin text-slate-400" />;
    if (state === "conflict") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    if (state === "ok") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    return null;
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <div className="relative min-h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.10),_transparent_28%)] bg-slate-50 px-4 py-8 dark:bg-[#0A0F1C] md:px-6 lg:px-8">
        <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl items-center gap-6 lg:grid-cols-[1.05fr_1fr]">

          {/* ── Left panel (info) ── */}
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35 }}
            className="hidden lg:block"
          >
            <div className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/85 p-8 shadow-[0_20px_80px_-30px_rgba(15,23,42,0.25)] backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.06),transparent_32%,rgba(16,185,129,0.06))]" />
              <div className="relative">
                <div className="mb-8 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white dark:bg-cyan-500">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-slate-900 dark:text-white">BINHLAIG POS</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Register staff and shop securely</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Badge className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300">
                    Production-ready account setup
                  </Badge>
                  <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-slate-950 dark:text-white">
                    Create a secure account for each shop type
                  </h1>
                  <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
                    Set up account credentials, define shop identity, and choose whether this shop uses Supermarket, Restaurant, Fashion, Fruit, or multiple POS modules.
                  </p>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  {[
                    { icon: ShieldCheck, color: "blue", title: "Secure onboarding", desc: "Password quality checks, role selection, and structured form sections for safer setup." },
                    { icon: Building2, color: "emerald", title: "Shop identity ready", desc: "Register with shop ID, code, name, and address for clearer branch management." },
                    { icon: Wand2, color: "violet", title: "AI auto-generate", desc: "One-click AI generation for Shop ID and Code with live duplicate detection." },
                    { icon: BadgeCheck, color: "amber", title: "Conflict resolution", desc: "If ID or Code already exists, get instant suggestions and switch with one click." },
                  ].map(({ icon: Icon, color, title, desc }) => (
                    <div key={title} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-${color}-500/10 text-${color}-600 dark:text-${color}-300`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 rounded-3xl border border-slate-200/80 bg-white/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-white dark:bg-cyan-500">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-slate-900 dark:text-white">Recommended workflow</h4>
                      <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                        <li>• Click ✨ to auto-generate Shop ID and Code</li>
                        <li>• System checks duplicates in real-time (600ms debounce)</li>
                        <li>• If conflict found, accept suggestion or regenerate</li>
                        <li>• Fill shop name + address, then submit</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Right panel (form) ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full"
          >
            <Card className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-[0_20px_80px_-30px_rgba(15,23,42,0.30)] backdrop-blur dark:border-white/10 dark:bg-[#0F172A]/80">
              <div className="border-b border-slate-200/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.96))] px-6 py-6 dark:border-white/10 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15">
                    <UserPlus2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-white">Create account</h2>
                    <p className="mt-1 text-sm text-slate-300">Register a new user with complete shop information.</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 sm:p-8">
                <form onSubmit={onSubmit} className="space-y-8" noValidate>

                  {/* ── Account section ── */}
                  <section className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white dark:bg-cyan-500">
                        <LockKeyhole className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Account information</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Set credentials and choose the user role.</p>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          placeholder="e.g. aung_ko"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          autoComplete="username"
                          required
                          className="h-11 rounded-xl"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label>Role</Label>
                        <Select value={role} onValueChange={(v) => setRole(v as RoleType)}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CASHIER">CASHIER</SelectItem>
                            <SelectItem value="ADMIN">ADMIN</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">{roleDescription}</p>
                      </div>

                      <div className="grid gap-2 md:col-span-2">
                        <Label>Shop Business Type</Label>
                        <Select
                          value={businessType}
                          onValueChange={(v) => setBusinessType(v as BusinessType)}
                        >
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUPERMARKET">SUPERMARKET</SelectItem>
                            <SelectItem value="RESTAURANT">RESTAURANT</SelectItem>
                            <SelectItem value="FASHION">FASHION</SelectItem>
                            <SelectItem value="FRUIT">FRUIT</SelectItem>
                            <SelectItem value="BOTH">BOTH / MULTI</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                          {businessTypeDescription}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Badge
                          variant={pwScore >= 70 ? "default" : "secondary"}
                          className={cn(
                            "rounded-full px-2.5 py-0.5",
                            pwScore >= 70 && "bg-emerald-600 text-white hover:bg-emerald-600"
                          )}
                        >
                          {pwLabel}
                        </Badge>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="At least 8 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password"
                          minLength={8}
                          required
                          className="h-11 rounded-xl pr-12"
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2 rounded-xl"
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <Progress value={pwScore} className="h-1.5" />
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Use upper/lowercase, numbers, and symbols
                        </span>
                        <span>Minimum 8 characters</span>
                      </div>
                    </div>
                  </section>

                  <Separator />

                  {/* ── Shop section ── */}
                  <section className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white dark:bg-cyan-500">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Shop information</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Add full branch details. Use{" "}
                          <span className="inline-flex items-center gap-0.5 font-medium text-violet-600 dark:text-violet-400">
                            <Sparkles className="h-3 w-3" /> Auto-generate
                          </span>{" "}
                          for unique ID &amp; Code.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      {/* Shop ID */}
                      <div className="grid gap-2">
                        <Label htmlFor="shopId" className="flex items-center gap-2">
                          <Store className="h-4 w-4" />
                          Shop ID
                        </Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              id="shopId"
                              type="number"
                              min={1}
                              placeholder="e.g. 1042"
                              value={shopId}
                              onChange={(e) => { setShopId(e.target.value); setShopIdConflict("idle"); setSuggestedId(null); }}
                              required
                              className={cn(
                                "h-11 rounded-xl pr-9",
                                shopIdConflict === "conflict" && "border-amber-400 focus-visible:ring-amber-400",
                                shopIdConflict === "ok" && "border-emerald-400 focus-visible:ring-emerald-400"
                              )}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2">
                              <FieldStatus state={shopIdConflict} />
                            </span>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-11 w-11 shrink-0 rounded-xl"
                                onClick={handleGenerateId}
                                disabled={generatingId}
                              >
                                {generatingId
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <Sparkles className="h-4 w-4 text-violet-500" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">AI generate Shop ID</TooltipContent>
                          </Tooltip>
                        </div>
                        <ConflictBanner field="id" suggested={suggestedId} />
                      </div>

                      {/* Shop Code */}
                      <div className="grid gap-2">
                        <Label htmlFor="shopCode" className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Shop Code
                        </Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              id="shopCode"
                              placeholder="e.g. SHP-A3K"
                              value={shopCode}
                              onChange={(e) => { setShopCode(e.target.value.toUpperCase()); setShopCodeConflict("idle"); setSuggestedCode(null); }}
                              required
                              className={cn(
                                "h-11 rounded-xl pr-9",
                                shopCodeConflict === "conflict" && "border-amber-400 focus-visible:ring-amber-400",
                                shopCodeConflict === "ok" && "border-emerald-400 focus-visible:ring-emerald-400"
                              )}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2">
                              <FieldStatus state={shopCodeConflict} />
                            </span>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-11 w-11 shrink-0 rounded-xl"
                                onClick={handleGenerateCode}
                                disabled={generatingCode}
                              >
                                {generatingCode
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <Sparkles className="h-4 w-4 text-violet-500" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">AI generate Shop Code</TooltipContent>
                          </Tooltip>
                        </div>
                        <ConflictBanner field="code" suggested={suggestedCode} />
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="shopName" className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Shop Name
                        </Label>
                        <Input
                          id="shopName"
                          placeholder="e.g. BINHLAIG Downtown Mart"
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          required
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="address" className="flex items-center gap-2">
                          <MapPinned className="h-4 w-4" />
                          Address
                        </Label>
                        <Input
                          id="address"
                          placeholder="e.g. 12 Sakura Street, Tokyo"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                          className="h-11 rounded-xl"
                        />
                      </div>
                    </div>
                  </section>

                  <Separator />

                  {/* ── Image section ── */}
                  <section className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white dark:bg-cyan-500">
                        <LocateFixed className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Profile image</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Optional avatar for the registered user.</p>
                      </div>
                    </div>

                    <div
                      className="group relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-5 transition-colors hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); handleFileSelect(e.dataTransfer.files); }}
                    >
                      {!image ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
                          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-white/[0.08] dark:ring-white/10">
                            <UploadCloud className="h-6 w-6 text-slate-700 dark:text-slate-200" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Drag &amp; drop image here</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, WEBP up to 3MB</p>
                          </div>
                          <Button type="button" variant="outline" className="rounded-xl" onClick={() => fileRef.current?.click()}>
                            <ImagePlus className="mr-2 h-4 w-4" />
                            Choose file
                          </Button>
                          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleFileSelect(e.target.files)} />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-4">
                            {previewUrl
                              ? <img src={previewUrl} alt="avatar preview" className="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-white/10" />
                              : <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-300"><ImageIcon className="h-6 w-6" /></div>
                            }
                            <div>
                              <p className="max-w-[220px] truncate text-sm font-medium text-slate-800 dark:text-slate-100">{image.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{(image.size / 1024).toFixed(0)} KB</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" className="rounded-xl" onClick={() => fileRef.current?.click()}>Change</Button>
                            <Button type="button" variant="secondary" className="rounded-xl" onClick={removeImage}>Remove</Button>
                          </div>
                          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleFileSelect(e.target.files)} />
                        </div>
                      )}
                    </div>
                  </section>

                  <Separator />

                  {/* ── Submit ── */}
                  <section className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        type="submit"
                        disabled={submitting || shopIdConflict === "conflict" || shopCodeConflict === "conflict"}
                        className="h-11 flex-1 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
                      >
                        {submitting ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>
                        ) : "Create account"}
                      </Button>
                      <Button type="button" variant="outline" disabled={submitting} className="h-11 rounded-xl" onClick={clearForm}>Reset</Button>
                    </div>

                    {msg && (
                      <div className={cn(
                        "rounded-2xl px-4 py-3 text-sm",
                        msg.toLowerCase().includes("fail") || msg.toLowerCase().includes("error")
                          ? "border border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
                          : "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                      )}>
                        {msg}
                      </div>
                    )}
                  </section>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
}