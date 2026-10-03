import type { ReceiptSettings } from "@/lib/settings-api";

export type CurrencySettings = {
  currencyCode: string;
  currencySymbol: string;
  currencyDecimalDigits: number;
  currencyPosition: "BEFORE" | "AFTER";
};

export const DEFAULT_CURRENCY: CurrencySettings = {
  currencyCode: "MMK",
  currencySymbol: "Ks",
  currencyDecimalDigits: 0,
  currencyPosition: "AFTER",
};

export function normalizeCurrency(settings: Partial<ReceiptSettings> = {}): CurrencySettings {
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
  return currency.currencyPosition === "BEFORE"
    ? `${currency.currencySymbol} ${text}`
    : `${text} ${currency.currencySymbol}`;
}
