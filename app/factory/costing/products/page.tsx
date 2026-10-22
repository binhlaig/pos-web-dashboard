"use client";
import {
  CostingBarcode,
  CostingBarcodeSearch,
} from "@/components/factory/costing-barcode";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  ImageIcon,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CostingProductDelete,
  CostingSheetDelete,
} from "@/components/factory/costing-product-delete";
import {
  costingRequest,
  decodeSheet,
  photoUrl,
  type CostingSheet,
  type CostingServerItem,
  type CostingList,
} from "@/lib/costing-api";

const PAGE_SIZE = 6;
const productTypes: Record<string, string> = {
  WEIGHT: "အလေးချိန်",
  BOTTLED_DRINK: "အချိုရည်ဘူး",
  PACKAGED_SNACK: "မုန့်ထုပ်",
  VOLUME: "အရည်ပမာဏ",
  COUNT: "အရေအတွက်",
};

function money(code: string, value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      currencyDisplay: "code",
      maximumFractionDigits: ["JPY", "MMK"].includes(code) ? 0 : 2,
    }).format(value);
  } catch {
    return `${code} ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)}`;
  }
}

function number(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(value)
    : "—";
}

function updatedAt(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return (
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(date) + " UTC"
  );
}

function saleUnit(item: CostingServerItem) {
  const type = item.inputs.productType;
  if (["COUNT", "BOTTLED_DRINK", "PACKAGED_SNACK"].includes(String(type))) {
    return Number(item.inputs.packGrams) === 1
      ? String(item.inputs.unitName || "ခု")
      : "တွဲ";
  }
  return type === "VOLUME" ? "ဘူး" : "ထုပ်";
}

function Photo({
  sheet,
  item,
  slot,
  large = false,
}: {
  sheet: CostingSheet;
  item: CostingServerItem;
  slot: "ORIGINAL" | "PACKAGED";
  large?: boolean;
}) {
  const available =
    slot === "ORIGINAL" ? item.originalImage : item.packagedImage;
  const src = photoUrl(sheet, item, slot);
  const [failed, setFailed] = React.useState("");
  const label =
    slot === "ORIGINAL" ? "မူလဝယ်ယူသောအထုပ်ပုံ" : "ထုပ်ပိုးပြီးပစ္စည်းပုံ";
  return (
    <figure className="min-w-0">
      <div
        className={`flex items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40 ${large ? "h-44 sm:h-56" : "h-24"}`}
      >
        {available && failed !== src ? (
          // Private authenticated images are served through the same-origin BFF.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`${String(item.inputs.product || "ကုန်ပစ္စည်း")} — ${label}`}
            loading="lazy"
            className="h-full w-full object-contain p-1"
            onError={() => setFailed(src)}
          />
        ) : (
          <div className="flex flex-col items-center gap-1 px-2 text-center text-muted-foreground">
            <ImageIcon
              className={large ? "size-8" : "size-5"}
              aria-hidden="true"
            />
            <span className="text-[11px] leading-5">
              {available ? "ပုံဖွင့်မရပါ" : "ပုံမရှိသေးပါ"}
            </span>
          </div>
        )}
      </div>
      <figcaption className="mt-1 text-center text-[11px] leading-5 text-muted-foreground">
        {label}
      </figcaption>
    </figure>
  );
}

function Metric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-muted/45 p-3">
      <dt className="text-xs leading-6 text-muted-foreground">{label}</dt>
      <dd
        className={`mt-1 break-words text-sm font-semibold tabular-nums ${highlight ? "text-blue-600 dark:text-blue-400" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function SheetProducts({
  sheet,
  deleting,
  acquire,
  release,
  reload,
}: {
  sheet: CostingSheet;
  deleting: boolean;
  acquire: () => boolean;
  release: () => void;
  reload: () => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const sorted = [...sheet.items].sort(
    (a, b) => a.displayOrder - b.displayOrder || a.id - b.id,
  );
  const visible = expanded ? sorted : sorted.slice(0, 4);
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/20 p-5">
        <div className="min-w-0">
          <h2 className="break-words font-semibold leading-8">{sheet.title}</h2>
          <p className="text-xs leading-6 text-muted-foreground">
            စာရင်း #{sheet.id} · ပစ္စည်း {number(sheet.items.length)} မျိုး ·{" "}
            {sheet.currencyCode} · {updatedAt(sheet.updatedAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CostingSheetDelete
            sheet={sheet}
            disabled={deleting}
            onAcquire={acquire}
            onRelease={release}
            onReload={reload}
            onDeleted={reload}
          />
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs leading-6 ${sheet.status === "FINALIZED" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"}`}
          >
            {sheet.status === "FINALIZED" ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <ClipboardList className="size-3.5" />
            )}
            {sheet.status === "FINALIZED" ? "အတည်ပြုပြီး" : "မူကြမ်း"}
          </span>
        </div>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
        {visible.map((item) => {
          const ready = item.calculation.ready;
          const v = item.calculation.values;
          return (
            <article
              key={item.id}
              className="flex min-w-0 flex-col rounded-xl border border-border p-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <Photo sheet={sheet} item={item} slot="ORIGINAL" />
                <Photo sheet={sheet} item={item} slot="PACKAGED" />
              </div>
              <div className="my-3 flex-1">
                <h3 className="break-words text-sm font-semibold leading-7">
                  {String(item.inputs.product || "အမည်မဖြည့်ရသေးပါ")}
                </h3>
                <p className="text-xs leading-6 text-muted-foreground">
                  {productTypes[String(item.inputs.productType)] ||
                    String(item.inputs.productType || "—")}
                </p>
              </div>
              <CostingBarcode sheetId={sheet.id} itemId={item.id} />
              {ready ? (
                <dl className="space-y-2 text-xs leading-6">
                  <div className="flex flex-wrap justify-between gap-1">
                    <dt className="text-muted-foreground">
                      တစ်{saleUnit(item)} ကုန်ကျစရိတ်
                    </dt>
                    <dd className="font-medium tabular-nums">
                      {money(sheet.currencyCode, v.costPerUnit)}
                    </dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-1">
                    <dt className="text-muted-foreground">
                      တစ်{saleUnit(item)} ရောင်းဈေး
                    </dt>
                    <dd className="font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                      {money(sheet.currencyCode, v.price)}
                    </dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-1">
                    <dt className="text-muted-foreground">
                      တွက်ချက် ထုတ်ယူနစ်
                    </dt>
                    <dd>
                      {number(v.saleUnits)} {saleUnit(item)}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="rounded-lg bg-amber-50 p-2 text-xs leading-6 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  တွက်ချက်မှု မပြည့်စုံသေးပါ
                </p>
              )}
              <Button
                asChild
                variant="outline"
                className="mt-4 h-auto min-h-10 py-2 text-xs leading-6"
              >
                <Link href={`/factory/costing/products/${sheet.id}/${item.id}`}>
                  အသေးစိတ်ကြည့်ရန် <ArrowRight className="ml-1 size-3.5" />
                </Link>
              </Button>
              {sheet.status === "FINALIZED" && ready && (
                <Button asChild className="mt-2 min-h-10 w-full bg-blue-600 text-white hover:bg-blue-700">
                  <Link href={`/factory/receiving/raw?sheetId=${sheet.id}&itemId=${item.id}`}>
                    <Package className="mr-2 size-4" /> Raw Receiving ပြုလုပ်ရန်
                  </Link>
                </Button>
              )}
              <div className="mt-2 [&>button]:w-full">
                <CostingProductDelete
                  sheet={sheet}
                  item={item}
                  disabled={deleting}
                  onAcquire={acquire}
                  onRelease={release}
                  onReload={reload}
                  onDeleted={reload}
                />
              </div>
            </article>
          );
        })}
        {!sheet.items.length && (
          <p className="p-3 text-sm text-muted-foreground">
            ဤစာရင်းတွင် ပစ္စည်း မရှိသေးပါ။
          </p>
        )}
      </div>
      {sorted.length > 4 && (
        <div className="border-t border-border px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            className="h-auto min-h-10 whitespace-normal py-2 text-xs leading-6"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            {expanded ? (
              <ChevronUp className="mr-2 size-4" />
            ) : (
              <ChevronDown className="mr-2 size-4" />
            )}
            {expanded
              ? "အကျဉ်းပြန်ပြရန်"
              : `ဤစာရင်းရှိ ပစ္စည်း ${number(sorted.length)} မျိုးလုံး ပြရန်`}
          </Button>
        </div>
      )}
    </section>
  );
}

export default function CostingProductsPage() {
  const [filters, setFilters] = React.useState({
    page: 0,
    search: "",
    status: "",
  });
  const [search, setSearch] = React.useState("");
  const [data, setData] = React.useState<CostingList | null>(null);
  const [busy, setBusy] = React.useState(true);
  const [error, setError] = React.useState("");
  const [revision, setRevision] = React.useState(0);
  const sequence = React.useRef(0);
  const mutation = React.useRef(false);
  const [deleting, setDeleting] = React.useState(false);
  function acquire() {
    if (mutation.current || busy) return false;
    mutation.current = true;
    setDeleting(true);
    return true;
  }
  function release() {
    mutation.current = false;
    setDeleting(false);
  }
  function reload() {
    setRevision((value) => value + 1);
  }

  React.useEffect(() => {
    const controller = new AbortController();
    const current = ++sequence.current;
    setBusy(true);
    setError("");
    setData(null);
    const query = new URLSearchParams({
      page: String(filters.page),
      size: String(PAGE_SIZE),
      search: filters.search,
    });
    if (filters.status) query.set("status", filters.status);
    void costingRequest(`?${query}`, { signal: controller.signal })
      .then((value) => {
        if (current !== sequence.current) return;
        const result = value as CostingList;
        if (
          !result ||
          !Array.isArray(result.content) ||
          !Number.isSafeInteger(result.totalPages) ||
          result.totalPages < 0 ||
          !Number.isSafeInteger(result.totalElements) ||
          result.totalElements < 0 ||
          result.number !== filters.page
        ) {
          throw new Error("Server စာရင်း response မမှန်ပါ။ ပြန်စမ်းပါ။");
        }
        if (filters.page > 0 && filters.page >= result.totalPages) {
          setFilters((previous) => ({
            ...previous,
            page: Math.max(0, result.totalPages - 1),
          }));
          return;
        }
        setData({ ...result, content: result.content.map(decodeSheet) });
      })
      .catch((reason) => {
        if (current === sequence.current && !controller.signal.aborted)
          setError(reason instanceof Error ? reason.message : "စာရင်းရယူမရပါ။");
      })
      .finally(() => {
        if (current === sequence.current) setBusy(false);
      });
    return () => {
      sequence.current++;
      controller.abort();
    };
  }, [filters, revision]);

  const count =
    data?.content.reduce((sum, sheet) => sum + sheet.items.length, 0) ?? 0;
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 text-foreground sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/factory/costing"
            className="mb-3 inline-flex min-h-10 items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Costing သို့ ပြန်သွားရန်
          </Link>
          <h1 className="flex items-center gap-3 text-xl font-semibold leading-9 sm:text-2xl">
            <Package className="size-6 shrink-0 text-blue-600" />
            Costing ကုန်ပစ္စည်းများ
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            Server မှာ သိမ်းထားသော ပစ္စည်းများကို costing စာရင်းအလိုက် ကြည့်ပါ။
            ပုံနှင့် တွက်ချက်မှုရလဒ်ကို အသေးစိတ် ဖွင့်ကြည့်နိုင်ပါသည်။
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={busy || deleting}
            onClick={() => setRevision((value) => value + 1)}
            className="h-auto min-h-11 py-2 leading-6"
          >
            <RefreshCw
              className={`mr-2 size-4 ${busy ? "animate-spin" : ""}`}
            />
            ပြန်တင်ရန်
          </Button>
          <Button asChild className="h-auto min-h-11 py-2 leading-6">
            <Link href="/factory/costing">
              <Plus className="mr-2 size-4" />
              Costing ဖွင့်ရန်
            </Link>
          </Button>
        </div>
      </header>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Metric
          label="ရှာဖွေမှုနှင့် ကိုက်ညီသော စာရင်းစုစုပေါင်း"
          value={data ? number(data.totalElements) : "—"}
        />
        <Metric
          label="ဤစာမျက်နှာတွင် ပါသော ပစ္စည်းမျိုး"
          value={data ? number(count) : "—"}
          highlight
        />
        <Metric
          label="ဤစာမျက်နှာရှိ အတည်ပြုပြီး စာရင်း"
          value={
            data
              ? number(
                  data.content.filter((sheet) => sheet.status === "FINALIZED")
                    .length,
                )
              : "—"
          }
        />
      </dl>
      <CostingBarcodeSearch />
      <form
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          if (mutation.current) return;
          setFilters((previous) => ({
            ...previous,
            search: search.trim(),
            page: 0,
          }));
        }}
      >
        <div className="min-w-0 flex-1">
          <label
            htmlFor="costing-sheet-search"
            className="mb-2 block text-xs leading-6 font-medium"
          >
            Costing စာရင်းအမည်ဖြင့် ရှာရန်
          </label>
          <Input
            id="costing-sheet-search"
            value={search}
            maxLength={200}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ဥပမာ — အောက်တိုဘာ ထုတ်လုပ်မှု"
            className="h-11"
          />
        </div>
        <div>
          <label
            htmlFor="costing-status"
            className="mb-2 block text-xs leading-6 font-medium"
          >
            အခြေအနေ
          </label>
          <select
            disabled={deleting}
            id="costing-status"
            value={filters.status}
            onChange={(event) =>
              setFilters((previous) => ({
                ...previous,
                status: event.target.value,
                page: 0,
              }))
            }
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-40"
          >
            <option value="">အားလုံး</option>
            <option value="DRAFT">မူကြမ်း</option>
            <option value="FINALIZED">အတည်ပြုပြီး</option>
          </select>
        </div>
        <Button type="submit" disabled={deleting} className="h-11">
          <Search className="mr-2 size-4" />
          ရှာရန်
        </Button>
      </form>
      <p className="text-xs leading-6 text-muted-foreground">
        ပစ္စည်းများကို costing အကြိမ်အလိုက် ခွဲပြထားပါသည်။ Browser
        ထဲတွင်သာရှိပြီး Server မသိမ်းရသေးသော မူကြမ်းများ မပါဝင်ပါ။
      </p>
      <div aria-busy={busy} className="space-y-5">
        {busy ? (
          <div
            role="status"
            className="flex min-h-52 items-center justify-center gap-3 rounded-2xl border border-dashed border-border text-sm text-muted-foreground"
          >
            <Loader2 className="size-5 animate-spin" />
            ပစ္စည်းစာရင်း ရယူနေပါသည်…
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-1 size-5 shrink-0 text-destructive" />
              <p className="text-sm leading-7">{error}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => setRevision((value) => value + 1)}
            >
              ပြန်စမ်းရန်
            </Button>
          </div>
        ) : data?.content.length ? (
          data.content.map((sheet) => (
            <SheetProducts
              key={`${sheet.id}:${sheet.version}`}
              sheet={sheet}
              deleting={deleting}
              acquire={acquire}
              release={release}
              reload={reload}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border py-14 text-center">
            <Package className="mx-auto mb-3 size-10 text-muted-foreground" />
            <h2 className="font-semibold">Costing စာရင်း မတွေ့ပါ</h2>
            <p className="mt-2 px-4 text-sm leading-7 text-muted-foreground">
              ရှာဖွေမှုကို ပြောင်းပါ သို့မဟုတ် Costing page တွင် စာရင်းကို
              Server သို့ သိမ်းပါ။
            </p>
          </div>
        )}
      </div>
      {data && data.totalPages > 0 && (
        <nav
          aria-label="Costing စာရင်း စာမျက်နှာများ"
          className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"
        >
          <p role="status" className="text-xs leading-6 text-muted-foreground">
            စာမျက်နှာ {data.number + 1} / {data.totalPages} · တစ်မျက်နှာလျှင်
            costing စာရင်း {PAGE_SIZE} ခုအထိ
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy || deleting || filters.page === 0}
              onClick={() =>
                setFilters((previous) => ({
                  ...previous,
                  page: previous.page - 1,
                }))
              }
            >
              <ArrowLeft className="mr-2 size-4" />
              ယခင်
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy || deleting || filters.page + 1 >= data.totalPages}
              onClick={() =>
                setFilters((previous) => ({
                  ...previous,
                  page: previous.page + 1,
                }))
              }
            >
              နောက်
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </nav>
      )}
    </main>
  );
}
