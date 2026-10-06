export const DEFAULT_SHOP_TIMEZONE = "Asia/Yangon";
export const SHOP_TIMEZONES = ["Asia/Yangon", "Asia/Tokyo"] as const;
let timezone = DEFAULT_SHOP_TIMEZONE;
let identity = "";
let generation = 0;
const listeners = new Set<() => void>();
export const getShopTimezone = () => timezone;
export const getTimezoneIdentity = () => identity;
export const subscribeShopTimezone = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
export function setTimezoneIdentity(next: string) {
  if (next === identity) return generation;
  identity = next;
  ++generation;
  timezone = DEFAULT_SHOP_TIMEZONE;
  listeners.forEach(listener => listener());
  return generation;
}
export function publishShopTimezone(value: string | null | undefined, expectedIdentity: string, expectedGeneration?: number) {
  if (identity !== expectedIdentity || (expectedGeneration !== undefined && generation !== expectedGeneration)) return;
  if (!SHOP_TIMEZONES.includes(value as typeof SHOP_TIMEZONES[number])) return;
  ++generation;
  timezone = value!;
  listeners.forEach(listener => listener());
}

export type TimestampValue = string | Date | number | null | undefined;
// Timezone-less historical values cannot safely be treated as instants.
export function parseTimestamp(value: TimestampValue): Date {
  if (value instanceof Date) return new Date(value.getTime());
  if (typeof value === "number") return new Date(value);
  if (!value || !/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)) return new Date(NaN);
  return new Date(value);
}
export function shopDateFormatter(locale?: Intl.LocalesArgument, options: Intl.DateTimeFormatOptions = {}, zone = getShopTimezone()) {
  const formatter = new Intl.DateTimeFormat(locale || "en-GB", { ...options, timeZone: zone || DEFAULT_SHOP_TIMEZONE });
  return {
    format: (value: Date | number = Date.now()) => Number.isNaN(Number(value)) ? "-" : formatter.format(value),
    formatToParts: (value: Date | number = Date.now()) => Number.isNaN(Number(value)) ? [] : formatter.formatToParts(value),
    resolvedOptions: () => formatter.resolvedOptions(),
  };
}
function legacyText(value: TimestampValue, mode: "date" | "time" | "datetime") {
  if (typeof value !== "string") return "-";
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}:\d{2})(?::(\d{2}))?(?:\.\d+)?)?$/.exec(value);
  if (!match) return "-";
  const date = `${match[3]}/${match[2]}/${match[1]}`;
  const time = match[4] ? `${match[4]}:${match[5] || "00"}` : "";
  return `${mode === "time" ? time || "-" : mode === "date" ? date : `${date}${time ? ` ${time}` : ""}`}${time ? " (legacy local time)" : ""}`;
}
function format(value: TimestampValue, zone: string, mode: "date" | "time" | "datetime", options?: Intl.DateTimeFormatOptions, locale?: Intl.LocalesArgument) {
  const date = parseTimestamp(value);
  if (Number.isNaN(date.getTime())) return legacyText(value, mode);
  const dateOptions = { year: "numeric", month: "2-digit", day: "2-digit" } as const;
  const timeOptions = { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" } as const;
  const defaults = mode === "date" ? dateOptions : mode === "time" ? timeOptions : { ...dateOptions, ...timeOptions };
  return shopDateFormatter(locale, options || defaults, zone).format(date).replace(", ", " ");
}
export const formatShopDateTime = (value: TimestampValue, zone = getShopTimezone(), options?: Intl.DateTimeFormatOptions, locale?: Intl.LocalesArgument) => format(value, zone, "datetime", options, locale);
export const formatShopDate = (value: TimestampValue, zone = getShopTimezone(), options?: Intl.DateTimeFormatOptions, locale?: Intl.LocalesArgument) => format(value, zone, "date", options, locale);
export const formatShopTime = (value: TimestampValue, zone = getShopTimezone(), options?: Intl.DateTimeFormatOptions, locale?: Intl.LocalesArgument) => format(value, zone, "time", options, locale);
export function shopDateKey(value: TimestampValue = new Date(), zone = getShopTimezone()) {
  // LocalDate values already describe a calendar date and must not be shifted.
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = parseTimestamp(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = shopDateFormatter("en-GB", {year: "numeric", month: "2-digit", day: "2-digit"}, zone).formatToParts(date);
  const part = (type: string) => parts.find(p => p.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
// A calendar coordinate for existing calendar/chart code. Never persist this surrogate.
export function shopCalendarDate(value: TimestampValue = new Date(), zone = getShopTimezone()) {
  const date = parseTimestamp(value);
  if (Number.isNaN(date.getTime())) {
    // Preserve legacy wall-clock calendar coordinates without assigning them an instant.
    const legacy = typeof value === "string" ? /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?)?$/.exec(value) : null;
    return legacy ? new Date(Date.UTC(Number(legacy[1]), Number(legacy[2])-1, Number(legacy[3]), Number(legacy[4]||0), Number(legacy[5]||0), Number(legacy[6]||0))) : date;
  }
  const parts = shopDateFormatter("en-GB", {year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}, zone).formatToParts(date);
  const part = (type: string) => Number(parts.find(p => p.type === type)?.value || 0);
  return new Date(Date.UTC(part("year"),part("month")-1,part("day"),part("hour"),part("minute"),part("second")));
}
export function shopLocalInput(value: TimestampValue, zone = getShopTimezone()) {
  const date = parseTimestamp(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${shopDateKey(date, zone)}T${formatShopTime(date, zone, {hour:"2-digit",minute:"2-digit",hourCycle:"h23"})}`;
}
export function shopLocalInputToInstant(value: string, zone = getShopTimezone()) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return NaN;
  const target = Date.parse(`${value}:00Z`);
  let candidate = target;
  for (let i=0;i<3;i++) {
    const local = shopLocalInput(new Date(candidate), zone);
    candidate += target - Date.parse(`${local}:00Z`);
  }
  return candidate;
}

export function calendarDateKey(date: Date) {
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,"0")}-${String(date.getUTCDate()).padStart(2,"0")}`;
}
