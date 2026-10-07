import type { ReceiptSettings } from "@/lib/settings-api";

export type CurrencySettings = {
  region?: string | null;
  currencyCode: string;
  currencySymbol: string;
  currencyDecimalDigits: number;
  currencyPosition: "BEFORE" | "AFTER";
};

export const DEFAULT_CURRENCY: CurrencySettings = {
  currencyCode: "",
  currencySymbol: "",
  currencyDecimalDigits: 0,
  currencyPosition: "AFTER",
};


export function currencyForRegion(region: unknown): CurrencySettings {
  switch (String(region ?? "").trim().toUpperCase()) {
    case "JAPAN": return { region: "JAPAN", currencyCode: "JPY", currencySymbol: "¥", currencyDecimalDigits: 0, currencyPosition: "BEFORE" };
    case "MYANMAR": return { region: "MYANMAR", currencyCode: "MMK", currencySymbol: "Ks", currencyDecimalDigits: 0, currencyPosition: "AFTER" };
    default: return DEFAULT_CURRENCY;
  }
}

export function normalizeCurrency(settings: Partial<ReceiptSettings> = {}): CurrencySettings {
  if (settings.region !== undefined) return currencyForRegion(settings.region);
  const digits = Number(settings.currencyDecimalDigits ?? 0);
  return {
    currencyCode: settings.currencyCode?.trim() || DEFAULT_CURRENCY.currencyCode,
    currencySymbol: settings.currencySymbol?.trim() || DEFAULT_CURRENCY.currencySymbol,
    currencyDecimalDigits: Number.isInteger(digits) && digits >= 0 && digits <= 6 ? digits : 0,
    currencyPosition: settings.currencyPosition?.trim().toUpperCase() === "BEFORE" ? "BEFORE" : "AFTER",
  };
}

export function formatCurrencyAmount(value: number, settings: Partial<ReceiptSettings> = DEFAULT_CURRENCY, compact = false): string {
  const currency = normalizeCurrency(settings);
  const amount = Number.isFinite(value) ? value : 0;
  const text = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: currency.currencyDecimalDigits,
    maximumFractionDigits: currency.currencyDecimalDigits,
    ...(compact ? { notation: "compact" as const, compactDisplay: "short" as const } : {}),
  }).format(amount);
  if (!currency.currencySymbol) return text;
  return currency.currencyPosition === "BEFORE"
    ? `${currency.currencySymbol}${currency.currencyCode === "JPY" ? "" : " "}${text}`
    : `${text} ${currency.currencySymbol}`;
}

// A historical transaction without a snapshot has unknown currency. Its amount
// must not be relabelled using today's shop region.
export function formatHistoricalMoney(amount?: number | null, receipt?: unknown): string {
  const row = receipt && typeof receipt === "object" ? receipt as Record<string, unknown> : {};
  const nested = row.currencySnapshot ?? row.currency_snapshot;
  const saved = nested && typeof nested === "object" ? nested as Record<string, unknown> : row;
  const code = saved.currencyCode ?? saved.currency_code;
  const symbol = saved.currencySymbol ?? saved.currency_symbol;
  const snapshot = typeof code === "string" && typeof symbol === "string" && code && symbol
    ? normalizeCurrency({ currencyCode: code, currencySymbol: symbol,
        currencyDecimalDigits: Number(saved.currencyDecimalDigits ?? saved.currency_decimal_digits ?? 0),
        currencyPosition: String(saved.currencyPosition ?? saved.currency_position ?? "AFTER") })
    : DEFAULT_CURRENCY;
  return formatCurrencyAmount(amount ?? 0, snapshot);
}
