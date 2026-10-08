"use client";
import { formatCurrencyAmount, normalizeCurrency } from "@/lib/currency";
import { getCurrencyIdentity, publishCurrencySettings } from "@/components/currency-provider";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Building2,
  Phone,
  MapPin,
  Megaphone,
  Plus,
  Trash2,
  Save,
  ReceiptText,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  PencilLine,
  RefreshCcw,
  Wallet,
  BadgeDollarSign,
  Coins,
} from "lucide-react";
import { FeaturePageGuard } from "@/components/feature-page-guard";

type ReceiptAd = {
  id: number | null;
  tempId: string;
  title: string;
  message: string;
  active: boolean;
};

type CurrencyPosition = "BEFORE" | "AFTER";

type ReceiptSetting = {
  region?: string | null;
  shopName: string;
  address: string;
  phone: string;
  secondPhone: string;
  footerMessage: string;

  currencyCode: string;
  currencySymbol: string;
  currencyDecimalDigits: number;
  currencyPosition: CurrencyPosition;
  taxPercent: number;

  ads: ReceiptAd[];
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Prefer authoritative region; older APIs may provide currency fields only.
function resolveShopCurrency(shop: Record<string, any>, receipt: Record<string, any> = {}) {
  const region = String(shop.region ?? receipt.region ?? "").trim().toUpperCase();
  const currency = normalizeCurrency(shop);
  const bound = region === "JAPAN"
    ? { currencyCode: "JPY", currencySymbol: "¥", currencyDecimalDigits: 0 }
    : region === "MYANMAR"
      ? { currencyCode: "MMK", currencySymbol: "Ks", currencyDecimalDigits: 0 }
      : {};
  return { ...currency, ...bound,
    currencyPosition: shop.currencyPosition === "BEFORE" || shop.currencyPosition === "AFTER"
      ? shop.currencyPosition : currency.currencyPosition,
    region: region || null,
  };
}

function makeTempId() {
  return `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createDefaultSetting(): ReceiptSetting {
  return {
    shopName: "My POS Shop",
    address: "",
    phone: "",
    secondPhone: "",
    footerMessage: "Thank you for shopping with us!",

    currencyCode: "",
    currencySymbol: "",
    currencyDecimalDigits: 0,
    currencyPosition: "AFTER",
    taxPercent: 0,

    ads: [
      {
        id: null,
        tempId: makeTempId(),
        title: "Special Offer",
        message: "Buy 2 items and get 5% discount today!",
        active: true,
      },
    ],
  };
}

function getAccessToken(sessionToken?: string | null) {
  if (sessionToken) return sessionToken;
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("pos_shop_owner_token") ||
    localStorage.getItem("pos_access_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token")
  );
}

function authHeaders(sessionToken?: string | null) {
  const token = getAccessToken(sessionToken);

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {}),
  };
}

function getErrorMessage(status: number) {
  if (status === 401) return "Login token မတွေ့ပါ။ ပြန် login ဝင်ပါ။";
  if (status === 403) return "ဒီ setting ကိုပြင်ခွင့်မရှိပါ။";
  if (status === 404) return "Setting မတွေ့သေးပါ။ အသစ် create လုပ်နိုင်ပါတယ်။";
  return "Server error ဖြစ်နေပါတယ်။ Backend API ကိုစစ်ပါ။";
}

function formatMoney(
  amount: number,
  setting: Pick<
    ReceiptSetting,
    "currencySymbol" | "currencyDecimalDigits" | "currencyPosition"
  >,
) { return formatCurrencyAmount(amount, setting); }

function ReceiptSettingsPageContent() {
  const { data: session, status: authStatus } = useSession();

  const accessToken =
    (session as any)?.accessToken ||
    (session as any)?.access_token ||
    (session as any)?.token ||
    null;

  const [setting, setSetting] = useState<ReceiptSetting>(() =>
    createDefaultSetting(),
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const activeAds = useMemo(
    () => setting.ads.filter((ad) => ad.active && ad.message.trim()),
    [setting.ads],
  );

  useEffect(() => {
    if (authStatus === "loading") return;

    if (authStatus !== "authenticated") {
      setLoading(false);
      setNotice({
        type: "error",
        message: "Login token မတွေ့ပါ။ ပြန် login ဝင်ပါ။",
      });
      return;
    }

    loadAllSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, accessToken]);

  async function readSetting(path: string): Promise<Record<string, any>> {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: authHeaders(accessToken), cache: "no-store",
    });
    if (res.status === 404) return {};
    if (!res.ok) throw new Error(getErrorMessage(res.status));
    const body = await res.json();
    return body?.data && typeof body.data === "object" ? body.data : body;
  }

  async function loadAllSettings() {
    const identity = getCurrencyIdentity();
    try {
      setLoading(true);
      setNotice(null);
      const [receipt, shop] = await Promise.all([
        readSetting("/api/receipt-settings/my-shop"),
        readSetting("/api/shop/settings"),
      ]);
      const currency = resolveShopCurrency(shop, receipt);
      if (identity !== getCurrencyIdentity()) return;
      publishCurrencySettings({ ...shop, ...currency }, identity);
      setSetting(prev => ({
        ...prev, ...currency,
        shopName: receipt.shopName || shop.shopName || prev.shopName,
        address: receipt.address ?? shop.address ?? "",
        phone: receipt.phone ?? shop.phone ?? "",
        secondPhone: receipt.secondPhone ?? "",
        footerMessage: receipt.footerMessage || "Thank you for shopping with us!",
        taxPercent: Number(shop.taxPercent ?? receipt.taxPercent ?? 0),
        ads: Array.isArray(receipt.ads) ? receipt.ads.map((ad: any) => ({
          id: ad.id ?? null, tempId: makeTempId(), title: ad.title || "",
          message: ad.message || "", active: ad.active !== false,
        })) : prev.ads,
      }));
    } catch (err) {
      setNotice({ type: "error", message: err instanceof Error ? err.message : "Setting မဖတ်နိုင်ပါ။" });
    } finally { setLoading(false); }
  }

  async function saveReceiptSetting() {
    if (savingRef.current) return;
    savingRef.current = true;
    const identity = getCurrencyIdentity();
    try {
      setSaving(true);
      setNotice(null);

      if (!setting.shopName.trim()) {
        setNotice({
          type: "error",
          message: "Shop Name ထည့်ပါ။",
        });
        return;
      }

      if (!setting.currencyCode.trim() || !setting.currencySymbol.trim()) {
        throw new Error("Currency Code နှင့် Symbol ထည့်ပါ။");
      }
      if (!Number.isFinite(setting.taxPercent) || setting.taxPercent < 0 || setting.taxPercent > 100) {
        throw new Error("Tax Percent ကို 0 မှ 100 အတွင်း ထည့်ပါ။");
      }
      // Shop settings owns currency and tax; receipt settings owns print metadata.
      await saveShopCurrencyOnly();
      await saveReceiptOnly();
      const latest = await readSetting("/api/shop/settings");
      if (identity !== getCurrencyIdentity()) return;
      publishCurrencySettings({ ...latest, ...resolveShopCurrency(latest) }, identity);

      setNotice({
        type: "success",
        message: "Receipt setting နှင့် Currency setting သိမ်းပြီးပါပြီ။",
      });

      await loadAllSettings();
    } catch (err) {
      console.error(err);
      setNotice({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "သိမ်းလို့မရပါ။ Backend endpoint ကိုစစ်ပါ။",
      });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function saveReceiptOnly() {
    const payload = {
      shopName: setting.shopName.trim(),
      address: setting.address.trim(),
      phone: setting.phone.trim(),
      secondPhone: setting.secondPhone.trim(),
      footerMessage:
        setting.footerMessage.trim() || "Thank you for shopping with us!",
      ads: setting.ads
        .filter((ad) => ad.message.trim())
        .map((ad) => ({
          id: ad.id,
          title: ad.title.trim(),
          message: ad.message.trim(),
          active: ad.active,
        })),
    };

    const res = await fetch(`${API_BASE}/api/receipt-settings/my-shop`, {
      method: "PUT",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.message || error?.detail || getErrorMessage(res.status));
    }
  }

  async function saveShopCurrencyOnly() {
    const currency = resolveShopCurrency(setting);
    const payload = {
      shopName: setting.shopName.trim(),
      address: setting.address.trim(),
      phone: setting.phone.trim(),

      currencyCode: currency.currencyCode.trim().toUpperCase(),
      currencySymbol: currency.currencySymbol.trim(),
      currencyDecimalDigits: currency.currencyDecimalDigits,
      currencyPosition: setting.currencyPosition,
      taxPercent: Number(setting.taxPercent || 0),
    };

    const res = await fetch(`${API_BASE}/api/shop/settings`, {
      method: "PUT",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);
      throw new Error(error?.message || error?.detail || getErrorMessage(res.status));
    }
  }

  function updateField<K extends keyof ReceiptSetting>(
    key: K,
    value: ReceiptSetting[K],
  ) {
    if (key === "currencyCode" || key === "currencySymbol" || key === "currencyDecimalDigits" || key === "region") return;
    setSetting((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function addAd() {
    setSetting((prev) => ({
      ...prev,
      ads: [
        ...prev.ads,
        {
          id: null,
          tempId: makeTempId(),
          title: "",
          message: "",
          active: true,
        },
      ],
    }));
  }

  function updateAd(tempId: string, patch: Partial<ReceiptAd>) {
    setSetting((prev) => ({
      ...prev,
      ads: prev.ads.map((ad) =>
        ad.tempId === tempId ? { ...ad, ...patch } : ad,
      ),
    }));
  }

  function removeAd(tempId: string) {
    setSetting((prev) => ({
      ...prev,
      ads: prev.ads.filter((ad) => ad.tempId !== tempId),
    }));
  }

  const sampleSubtotal = 11700;
  const sampleTax = Math.round(
    (sampleSubtotal * Number(setting.taxPercent || 0)) / 100,
  );
  const sampleDiscount = 500;
  const sampleTotal = sampleSubtotal + sampleTax - sampleDiscount;
  return (
    <main className="min-h-full py-5 text-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
              <ReceiptText className="h-3.5 w-3.5" />
              Receipt Settings
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Receipt & Currency Settings
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Receipt ပေါ်မှာ ပြမယ့် ဆိုင်လိပ်စာ၊ ဖုန်းနံပါတ်၊ currency, tax နဲ့
              promotion message များကို ဒီ page မှာ update လုပ်နိုင်ပါတယ်။
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={loadAllSettings}
              disabled={loading || saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#293750] dark:text-slate-200 dark:hover:bg-[#33435f]"
            >
              <RefreshCcw className="h-4 w-4" />
              Reload
            </button>

            <button
              onClick={saveReceiptSetting}
              disabled={saving || loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Settings
            </button>
          </div>
        </div>

        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`mb-5 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
                notice.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                  : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300"
              }`}
            >
              {notice.type === "success" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              {notice.message}
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#293750]">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading settings...
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#293750] md:p-6"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Shop Information</h2>
                    <p className="text-sm text-blue-500">
                      Receipt header မှာ ပြမယ့် ဆိုင်အချက်အလက်များ
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Label>Shop Name</Label>
                    <div className="relative mt-2">
                      <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={setting.shopName}
                        onChange={(e) =>
                          updateField("shopName", e.target.value)
                        }
                        placeholder="Example: Binhlaing Mini Mart"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#33435f] dark:text-slate-100 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:focus:border-blue-400 dark:focus:bg-[#33435f]"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Main Phone No</Label>
                    <div className="relative mt-2">
                      <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={setting.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        placeholder="09 xxx xxx xxx"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#33435f] dark:text-slate-100 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:focus:border-blue-400 dark:focus:bg-[#33435f]"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Second Phone No</Label>
                    <div className="relative mt-2">
                      <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={setting.secondPhone}
                        onChange={(e) =>
                          updateField("secondPhone", e.target.value)
                        }
                        placeholder="Optional"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#33435f] dark:text-slate-100 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:focus:border-blue-400 dark:focus:bg-[#33435f]"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Shop Address</Label>
                    <div className="relative mt-2">
                      <MapPin className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
                      <textarea
                        value={setting.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        rows={3}
                        placeholder="No, Street, Township, City"
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#33435f] dark:text-slate-100 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:focus:border-blue-400 dark:focus:bg-[#33435f]"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Receipt Footer Message</Label>
                    <div className="relative mt-2">
                      <Sparkles className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
                      <textarea
                        value={setting.footerMessage}
                        onChange={(e) =>
                          updateField("footerMessage", e.target.value)
                        }
                        rows={2}
                        placeholder="Thank you for shopping with us!"
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#33435f] dark:text-slate-100 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:focus:border-blue-400 dark:focus:bg-[#33435f]"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#293750] md:p-6"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">
                      Currency & Tax Setting
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Currency ကို ဆိုင်၏ Region အတိုင်း သတ်မှတ်ထားပါသည်။
                      Tax နှင့် Symbol Position ကို ပြင်နိုင်ပါသည်။
                    </p>
                  </div>
                </div>

                <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-400/20 dark:bg-blue-400/10">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                    {setting.region ? `${setting.region} · ` : ""}{setting.currencyCode || "Currency မသတ်မှတ်ရသေးပါ"}
                    {setting.currencySymbol ? ` · ${setting.currencySymbol}` : ""}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-300">
                    အခြား Currency သုံးရန် ဆိုင်၏ Region ကို ပြောင်းပါ။ ဤနေရာတွင် Currency ကို တိုက်ရိုက်ပြောင်း၍ မရပါ။
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Currency Code</Label>
                    <div className="relative mt-2">
                      <BadgeDollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        readOnly value={setting.currencyCode}
                        placeholder="Shop currency"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#33435f] dark:text-slate-100 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:focus:border-blue-400 dark:focus:bg-[#33435f]"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Currency Symbol</Label>
                    <div className="relative mt-2">
                      <Coins className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        readOnly value={setting.currencySymbol}
                        placeholder="Shop symbol"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#33435f] dark:text-slate-100 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:focus:border-blue-400 dark:focus:bg-[#33435f]"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Decimal Digits</Label>
                    <input
                      readOnly value={setting.currencyDecimalDigits}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#33435f] dark:text-slate-100 px-4 py-3 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <Label>Symbol Position</Label>
                    <select
                      disabled={saving} value={setting.currencyPosition}
                      onChange={(e) =>
                        updateField(
                          "currencyPosition",
                          e.target.value as CurrencyPosition,
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#33435f] dark:text-slate-100 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:focus:border-blue-400 dark:focus:bg-[#33435f]"
                    >
                      <option value="BEFORE">Before amount</option>
                      <option value="AFTER">After amount</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Tax Percent</Label>
                    <div className="relative mt-2">
                      <input
                        type="number"
                        disabled={saving}
                        min={0}
                        max={100}
                        step="0.01"
                        value={setting.taxPercent}
                        onChange={(e) =>
                          updateField("taxPercent", Number(e.target.value))
                        }
                        placeholder="0"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#33435f] dark:text-slate-100 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:focus:border-blue-400 dark:focus:bg-[#33435f]"
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                  Preview:{" "}
                  <span className="font-black">
                    {formatMoney(25000, setting)}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#293750] md:p-6"
              >
                <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">
                        Receipt Advertisement
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Receipt အောက်ပိုင်းမှာ ပြမယ့် promotion ကြော်ငြာများ
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={addAd}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300 dark:hover:bg-blue-400/20"
                  >
                    <Plus className="h-4 w-4" />
                    Add Ad
                  </button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {setting.ads.map((ad, index) => (
                      <motion.div
                        key={ad.tempId}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        className="rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-[#33435f] dark:text-slate-100 p-4"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            <PencilLine className="h-4 w-4 text-blue-500" />
                            Advertisement #{index + 1}
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                              <input
                                type="checkbox"
                                checked={ad.active}
                                onChange={(e) =>
                                  updateAd(ad.tempId, {
                                    active: e.target.checked,
                                  })
                                }
                                className="h-4 w-4 rounded border-slate-300"
                              />
                              Active
                            </label>

                            <button
                              onClick={() => removeAd(ad.tempId)}
                              className="rounded-xl border border-rose-200 bg-white p-2 text-rose-500 transition hover:bg-rose-50 dark:border-rose-400/20 dark:bg-[#293750] dark:text-rose-400 dark:hover:bg-rose-400/10"
                              aria-label="Remove advertisement"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <Label>Title</Label>
                            <input
                              value={ad.title}
                              onChange={(e) =>
                                updateAd(ad.tempId, {
                                  title: e.target.value,
                                })
                              }
                              placeholder="Example: Today Promotion"
                              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#33435f] dark:text-slate-100 text-sm outline-none transition focus:border-blue-500 dark:focus:border-blue-400"
                            />
                          </div>

                          <div>
                            <Label>Message</Label>
                            <input
                              value={ad.message}
                              onChange={(e) =>
                                updateAd(ad.tempId, {
                                  message: e.target.value,
                                })
                              }
                              placeholder="Example: Buy 3 get 1 free"
                              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#33435f] dark:text-slate-100 text-sm outline-none transition focus:border-blue-500 dark:focus:border-blue-400"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {setting.ads.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-white/15">
                      <Megaphone className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                      <p className="font-semibold text-slate-700 dark:text-slate-200">
                        Advertisement မရှိသေးပါ။
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Add Ad ကိုနှိပ်ပြီး receipt promotion စာသား ထည့်ပါ။
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </section>

            <aside className="lg:sticky lg:top-[112px] lg:self-start">
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#293750]"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                    <ReceiptText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Receipt Preview</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Print ထွက်မယ့်ပုံစံကို ကြိုကြည့်နိုင်ပါတယ်။
                    </p>
                  </div>
                </div>

                <div className="mx-auto max-w-sm rounded-[2rem] bg-slate-100 p-4 dark:bg-[#33435f]">
                  <div className="rounded-2xl bg-white p-5 font-mono text-[12px] text-slate-800 shadow-sm">
                    <div className="text-center">
                      <h3 className="text-base font-black uppercase tracking-wide">
                        {setting.shopName || "SHOP NAME"}
                      </h3>

                      {setting.address ? (
                        <p className="mt-2 whitespace-pre-line text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                          {setting.address}
                        </p>
                      ) : (
                        <p className="mt-2 text-[11px] text-slate-400">
                          Shop address will show here
                        </p>
                      )}

                      <div className="mt-2 text-[11px] text-slate-600">
                        {setting.phone || "09 xxx xxx xxx"}
                        {setting.secondPhone ? ` / ${setting.secondPhone}` : ""}
                      </div>
                    </div>

                    <DashedLine />

                    <div className="space-y-2">
                      <PreviewRow
                        name="Coffee"
                        qty="2"
                        price={formatMoney(6000, setting)}
                      />
                      <PreviewRow
                        name="Bread"
                        qty="1"
                        price={formatMoney(2500, setting)}
                      />
                      <PreviewRow
                        name="Milk"
                        qty="1"
                        price={formatMoney(3200, setting)}
                      />
                    </div>

                    <DashedLine />

                    <div className="space-y-1">
                      <PreviewTotal
                        label="Subtotal"
                        value={formatMoney(sampleSubtotal, setting)}
                      />
                      <PreviewTotal
                        label={`Tax (${setting.taxPercent || 0}%)`}
                        value={formatMoney(sampleTax, setting)}
                      />
                      <PreviewTotal
                        label="Discount"
                        value={formatMoney(sampleDiscount, setting)}
                      />
                      <PreviewTotal
                        label="Total"
                        value={formatMoney(sampleTotal, setting)}
                        bold
                      />
                    </div>

                    {activeAds.length > 0 && (
                      <>
                        <DashedLine />

                        <div className="space-y-2">
                          {activeAds.map((ad) => (
                            <div
                              key={ad.tempId}
                              className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-center"
                            >
                              {ad.title && (
                                <p className="font-black uppercase text-orange-700">
                                  {ad.title}
                                </p>
                              )}
                              <p className="mt-1 text-[11px] leading-relaxed text-orange-700">
                                {ad.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <DashedLine />

                    <p className="text-center text-[11px] font-semibold text-slate-600">
                      {setting.footerMessage ||
                        "Thank you for shopping with us!"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ReceiptSettingsPage() {
  return (
    <FeaturePageGuard featureKey="receiptsEnabled">
      <ReceiptSettingsPageContent />
    </FeaturePageGuard>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
      {children}
    </label>
  );
}

function DashedLine() {
  return <div className="my-4 border-t border-dashed border-slate-300" />;
}

function PreviewRow({
  name,
  qty,
  price,
}: {
  name: string;
  qty: string;
  price: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_40px_90px] gap-2">
      <span>{name}</span>
      <span className="text-right">x{qty}</span>
      <span className="text-right">{price}</span>
    </div>
  );
}

function PreviewTotal({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${
        bold ? "text-sm font-black" : "text-[12px]"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
