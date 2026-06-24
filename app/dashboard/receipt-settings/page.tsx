
"use client";

import { useEffect, useMemo, useState } from "react";
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
  Store,
} from "lucide-react";
import { FeaturePageGuard } from "@/components/feature-page-guard";
import { useRouter } from "next/navigation";

type ReceiptAd = {
  id: number | null;
  tempId: string;
  title: string;
  message: string;
  active: boolean;
};

type CurrencyPosition = "BEFORE" | "AFTER";

type ReceiptSetting = {
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

const CURRENCY_PRESETS = [
  {
    label: "Myanmar Kyat",
    code: "MMK",
    symbol: "Ks",
    decimalDigits: 0,
    position: "BEFORE" as const,
  },
  {
    label: "US Dollar",
    code: "USD",
    symbol: "$",
    decimalDigits: 2,
    position: "BEFORE" as const,
  },
  {
    label: "Japanese Yen",
    code: "JPY",
    symbol: "¥",
    decimalDigits: 0,
    position: "BEFORE" as const,
  },
  {
    label: "Thai Baht",
    code: "THB",
    symbol: "฿",
    decimalDigits: 2,
    position: "BEFORE" as const,
  },
];

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

    currencyCode: "MMK",
    currencySymbol: "Ks",
    currencyDecimalDigits: 0,
    currencyPosition: "BEFORE",
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
    localStorage.getItem("pos_access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token")
  );
}

function authHeaders(sessionToken?: string | null) {
  const token = getAccessToken(sessionToken);

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  >
) {
  const value = Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: setting.currencyDecimalDigits,
    maximumFractionDigits: setting.currencyDecimalDigits,
  });

  if (setting.currencyPosition === "AFTER") {
    return `${value} ${setting.currencySymbol}`;
  }

  return `${setting.currencySymbol} ${value}`;
}

function ReceiptSettingsPageContent() {
  const { data: session, status: authStatus } = useSession();

  const accessToken =
    (session as any)?.accessToken ||
    (session as any)?.access_token ||
    (session as any)?.token ||
    null;

  const [setting, setSetting] = useState<ReceiptSetting>(() =>
    createDefaultSetting()
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const activeAds = useMemo(
    () => setting.ads.filter((ad) => ad.active && ad.message.trim()),
    [setting.ads]
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

  async function loadAllSettings() {
    try {
      setLoading(true);
      setNotice(null);

      await Promise.all([loadReceiptSettingOnly(), loadShopCurrencyOnly()]);
    } catch (err) {
      console.error(err);
      setNotice({
        type: "error",
        message:
          err instanceof Error ? err.message : "Setting မဖတ်နိုင်ပါ။",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadReceiptSettingOnly() {
    const res = await fetch(`${API_BASE}/api/receipt-settings/my-shop`, {
      method: "GET",
      headers: authHeaders(accessToken),
      cache: "no-store",
    });

    if (res.status === 404) {
      return;
    }

    if (!res.ok) {
      throw new Error(getErrorMessage(res.status));
    }

    const data = await res.json();

    setSetting((prev) => ({
      ...prev,
      shopName: data.shopName || prev.shopName || "My POS Shop",
      address: data.address || "",
      phone: data.phone || "",
      secondPhone: data.secondPhone || "",
      footerMessage: data.footerMessage || "Thank you for shopping with us!",
      ads:
        Array.isArray(data.ads) && data.ads.length > 0
          ? data.ads.map((ad: any) => ({
            id: ad.id ?? null,
            tempId: makeTempId(),
            title: ad.title || "",
            message: ad.message || "",
            active: ad.active !== false,
          }))
          : prev.ads,
    }));
  }

  async function loadShopCurrencyOnly() {
    const res = await fetch(`${API_BASE}/api/shop/settings`, {
      method: "GET",
      headers: authHeaders(accessToken),
      cache: "no-store",
    });

    if (res.status === 404) {
      return;
    }

    if (!res.ok) {
      throw new Error(getErrorMessage(res.status));
    }

    const data = await res.json();

    setSetting((prev) => ({
      ...prev,

      shopName: data.shopName || prev.shopName,
      address: data.address || prev.address,
      phone: data.phone || prev.phone,

      currencyCode: data.currencyCode || "MMK",
      currencySymbol: data.currencySymbol || "Ks",
      currencyDecimalDigits:
        typeof data.currencyDecimalDigits === "number"
          ? data.currencyDecimalDigits
          : 0,
      currencyPosition:
        data.currencyPosition === "AFTER" ? "AFTER" : "BEFORE",
      taxPercent: Number(data.taxPercent ?? 0),
    }));
  }

  async function saveReceiptSetting() {
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

      await Promise.all([saveReceiptOnly(), saveShopCurrencyOnly()]);

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
      throw new Error(getErrorMessage(res.status));
    }
  }

  async function saveShopCurrencyOnly() {
    const payload = {
      shopName: setting.shopName.trim(),
      address: setting.address.trim(),
      phone: setting.phone.trim(),

      currencyCode: setting.currencyCode.trim().toUpperCase(),
      currencySymbol: setting.currencySymbol.trim(),
      currencyDecimalDigits: Number(setting.currencyDecimalDigits || 0),
      currencyPosition: setting.currencyPosition,
      taxPercent: Number(setting.taxPercent || 0),
    };

    const res = await fetch(`${API_BASE}/api/shop/settings`, {
      method: "PUT",
      headers: authHeaders(accessToken),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(getErrorMessage(res.status));
    }
  }

  function updateField<K extends keyof ReceiptSetting>(
    key: K,
    value: ReceiptSetting[K]
  ) {
    setSetting((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function applyCurrencyPreset(preset: (typeof CURRENCY_PRESETS)[number]) {
    setSetting((prev) => ({
      ...prev,
      currencyCode: preset.code,
      currencySymbol: preset.symbol,
      currencyDecimalDigits: preset.decimalDigits,
      currencyPosition: preset.position,
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
        ad.tempId === tempId ? { ...ad, ...patch } : ad
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
  const sampleTax = Math.round((sampleSubtotal * Number(setting.taxPercent || 0)) / 100);
  const sampleDiscount = 500;
  const sampleTotal = sampleSubtotal + sampleTax - sampleDiscount;
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 p-4 text-slate-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>

            <div>
              <div className="">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
                  <ReceiptText className="h-4 w-4" />
                  Receipt Settings
                </div>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 "

                >
                  <Store className="h-4 w-4" />
                  Dashboard
                </button>

              </div>



            </div>


            <h1 className="text-2xl font-bold tracking-tight md:text-4xl">
              Receipt ဆိုင်အချက်အလက်၊ Currency & ကြော်ငြာစာသားများ
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
              Receipt ပေါ်မှာ ပြမယ့် ဆိုင်လိပ်စာ၊ ဖုန်းနံပါတ်၊ currency,
              tax နဲ့ promotion message များကို ဒီ page မှာ update လုပ်နိုင်ပါတယ်။
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={loadAllSettings}
              disabled={loading || saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" />
              Reload
            </button>

            <button
              onClick={saveReceiptSetting}
              disabled={saving || loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
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
              className={`mb-5 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
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
          <div className="flex min-h-[400px] items-center justify-center rounded-3xl border bg-white">
            <div className="flex items-center gap-3 text-slate-500">
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
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-800 text-white">
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
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
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
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
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
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Shop Address</Label>
                    <div className="relative mt-2">
                      <MapPin className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-slate-400" />
                      <textarea
                        value={setting.address}
                        onChange={(e) =>
                          updateField("address", e.target.value)
                        }
                        rows={3}
                        placeholder="No, Street, Township, City"
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
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
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 }}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                    <Wallet className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Currency & Tax Setting</h2>
                    <p className="text-sm text-slate-500">
                      Owner စိတ်ကြိုက် currency, symbol, decimal နဲ့ tax ကိုပြောင်းနိုင်ပါတယ်။
                    </p>
                  </div>
                </div>

                <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {CURRENCY_PRESETS.map((preset) => {
                    const active = setting.currencyCode === preset.code;

                    return (
                      <button
                        key={preset.code}
                        type="button"
                        onClick={() => applyCurrencyPreset(preset)}
                        className={`rounded-2xl border p-4 text-left transition ${active
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                          }`}
                      >
                        <p className="font-bold">{preset.label}</p>
                        <p className="mt-1 text-sm opacity-80">
                          {preset.symbol} / {preset.code}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Currency Code</Label>
                    <div className="relative mt-2">
                      <BadgeDollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={setting.currencyCode}
                        onChange={(e) =>
                          updateField(
                            "currencyCode",
                            e.target.value.toUpperCase()
                          )
                        }
                        placeholder="MMK"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Currency Symbol</Label>
                    <div className="relative mt-2">
                      <Coins className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={setting.currencySymbol}
                        onChange={(e) =>
                          updateField("currencySymbol", e.target.value)
                        }
                        placeholder="Ks"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Decimal Digits</Label>
                    <select
                      value={setting.currencyDecimalDigits}
                      onChange={(e) =>
                        updateField(
                          "currencyDecimalDigits",
                          Number(e.target.value)
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
                    >
                      <option value={0}>0 - MMK / JPY</option>
                      <option value={1}>1</option>
                      <option value={2}>2 - USD / THB</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                    </select>
                  </div>

                  <div>
                    <Label>Symbol Position</Label>
                    <select
                      value={setting.currencyPosition}
                      onChange={(e) =>
                        updateField(
                          "currencyPosition",
                          e.target.value as CurrencyPosition
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
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
                        min={0}
                        step="0.01"
                        value={setting.taxPercent}
                        onChange={(e) =>
                          updateField("taxPercent", Number(e.target.value))
                        }
                        placeholder="0"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-slate-900 focus:bg-white"
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
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
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
              >
                <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">
                        Receipt Advertisement
                      </h2>
                      <p className="text-sm text-slate-500">
                        Receipt အောက်ပိုင်းမှာ ပြမယ့် promotion ကြော်ငြာများ
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={addAd}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
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
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <PencilLine className="h-4 w-4 text-orange-500" />
                            Advertisement #{index + 1}
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-500">
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
                              className="rounded-xl border border-rose-200 bg-white p-2 text-rose-500 transition hover:bg-rose-50"
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
                              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
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
                              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {setting.ads.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center">
                      <Megaphone className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                      <p className="font-semibold text-slate-700">
                        Advertisement မရှိသေးပါ။
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Add Ad ကိုနှိပ်ပြီး receipt promotion စာသား ထည့်ပါ။
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </section>

            <aside className="lg:sticky lg:top-8 lg:self-start">
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                    <ReceiptText className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Receipt Preview</h2>
                    <p className="text-sm text-slate-500">
                      Print ထွက်မယ့်ပုံစံကို ကြိုကြည့်နိုင်ပါတယ်။
                    </p>
                  </div>
                </div>

                <div className="mx-auto max-w-sm rounded-[2rem] bg-slate-100 p-4">
                  <div className="rounded-2xl bg-white p-5 font-mono text-[12px] text-slate-800 shadow-sm">
                    <div className="text-center">
                      <h3 className="text-base font-black uppercase tracking-wide">
                        {setting.shopName || "SHOP NAME"}
                      </h3>

                      {setting.address ? (
                        <p className="mt-2 whitespace-pre-line text-[11px] leading-relaxed text-slate-500">
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
    <label className="text-sm font-semibold text-slate-700">{children}</label>
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
      className={`flex items-center justify-between ${bold ? "text-sm font-black" : "text-[12px]"
        }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
