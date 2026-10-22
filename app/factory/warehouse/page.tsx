"use client";
import * as React from "react";
import { useSession } from "next-auth/react";
import {
  Barcode,
  Warehouse,
  Package,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Link2,
  Wifi,
  WifiOff,
  Loader2,
  History,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  StockError,
  requestJson as api,
  decodePlaces,
  decodeBalances,
  decodeMovements,
  decodeProducts,
  decodeReceiptOptions,
  quantity,
  type Place,
  type Balance,
  type Movement,
  type StockPage,
  type PosProduct,
  type ReceiptOption,
} from "@/lib/factory-stock-api";
import {
  receivingRequest,
  decodeSource,
  photoOf,
} from "@/lib/receiving-api";

type Filters = {
  search: string;
  warehouseId: string;
  locationId: string;
  batch: string;
};
type Result =
  | { key: string; kind: "balances"; data: StockPage<Balance> }
  | { key: string; kind: "history"; data: StockPage<Movement> };
const emptyFilters: Filters = {
  search: "",
  warehouseId: "",
  locationId: "",
  batch: "",
};
const SIZE = 10;
const fieldClass =
  "h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm";
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactElement<{ id?: string }>;
}) {
  const id = React.useId();
  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id} className="text-xs leading-6">
        {label}
      </Label>
      {React.cloneElement(children, { id })}
    </div>
  );
}
function ProductImage({ product, imageUrl, compact = false }: { product: Balance | Movement; imageUrl?: string | null; compact?: boolean }) {
  const src = imageUrl || undefined;
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [src]);
  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted/50 ${compact ? "size-14" : "aspect-square w-full"}`}>
      {src && !failed ? (
        // Native img supports API image hosts without Next.js remotePatterns configuration.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={product.name} loading="lazy" onError={() => setFailed(true)} className={`pointer-events-none absolute inset-0 h-full w-full select-none object-contain transition duration-300 group-hover:scale-105 ${compact ? "p-1" : "p-4"}`} />
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground"><Package className={compact ? "size-6 opacity-40" : "size-14 opacity-40"} />{!compact && <span className="text-xs">ပုံမရှိသေးပါ</span>}</div>
      )}
    </div>
  );
}

function ProductDetail({ product, imageUrl, warehouse, location }: {
  product: Balance | Movement; imageUrl?: string | null; warehouse: string; location: string;
}) {
  const [section, setSection] = React.useState("overview");
  const [fieldPage, setFieldPage] = React.useState(0);
  const fields = Object.entries(product);
  const fieldPages = Math.ceil(fields.length / 4);
  const facts = [
    ["Barcode", product.barcode], ["ဂိုဒေါင်", warehouse],
    ["နေရာ", location], ["Batch", product.batch || "—"],
    ["ပစ္စည်း ID", "itemId" in product ? String(product.itemId) : "—"],
    ["ယူနစ်", product.unit],
  ];
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] sm:gap-5">
      <div className="min-w-0 space-y-3">
        <div className="overflow-hidden rounded-xl border"><ProductImage product={product} imageUrl={imageUrl} /></div>
        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          <p className="text-[11px] leading-6">{"quantity" in product ? "လက်ရှိလက်ကျန်" : "ဝင် / ထွက်ပမာဏ"}</p>
          <p className="break-all text-lg font-bold tabular-nums sm:text-2xl">{quantity("quantity" in product ? product.quantity : product.delta)} <span className="text-xs font-normal">{product.unit}</span></p>
        </div>
      </div>
      <div className="min-w-0 space-y-3">
        <Tabs value={section} onValueChange={setSection}>
          <TabsList className="h-auto w-full flex-wrap">
            <TabsTrigger value="overview" className="min-h-9 text-xs">အကျဉ်းချုပ်</TabsTrigger>
            <TabsTrigger value="all" className="min-h-9 text-xs">အချက်အလက်အားလုံး</TabsTrigger>
          </TabsList>
        </Tabs>
        {section === "overview" ? (
          <>
            <dl className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2">
              {facts.map(([label, value]) => <div key={label} className="min-w-0 rounded-lg bg-muted/50 px-3 py-2"><dt className="text-[10px] leading-5 text-muted-foreground">{label}</dt><dd title={value} className="line-clamp-2 break-all text-xs font-medium leading-6">{value}</dd></div>)}
            </dl>
            {"quantity" in product ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-blue-50 p-2 leading-6 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">မူလအဝင်<p className="break-all font-bold">{product.receivedQuantity == null ? "—" : quantity(product.receivedQuantity)} {product.unit}</p></div>
                <div className="rounded-lg bg-amber-50 p-2 leading-6 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">ရောင်းပြီး<p className="break-all font-bold">{product.soldQuantity == null ? "—" : quantity(product.soldQuantity)} {product.unit}</p></div>
              </div>
            ) : <div className="rounded-lg bg-muted/50 p-2 text-xs leading-6"><p>{product.type === "STOCK_IN" ? "Receiving အဝင်" : "Checkout အထွက်"}</p><Stamp value={product.createdAt} /></div>}
          </>
        ) : (
          <>
            <dl className="space-y-2">
              {fields.slice(fieldPage * 4, fieldPage * 4 + 4).map(([key, value]) => {
                const display = value == null ? "—" : typeof value === "object" ? JSON.stringify(value) : String(value);
                return <div key={key} className="min-w-0 rounded-lg bg-muted/50 px-3 py-2"><dt className="truncate text-[10px] leading-5 text-muted-foreground" title={key}>{key}</dt><dd className="line-clamp-2 break-all text-xs leading-6" title={display}>{display}</dd></div>;
              })}
            </dl>
            <div className="flex items-center justify-between gap-2 text-xs">
              <Button type="button" variant="outline" size="sm" aria-label="ယခင်အချက်အလက်" disabled={fieldPage === 0} onClick={() => setFieldPage((v) => v - 1)}><ChevronLeft className="size-4" /></Button>
              <span>{fieldPage + 1} / {fieldPages}</span>
              <Button type="button" variant="outline" size="sm" aria-label="နောက်အချက်အလက်" disabled={fieldPage + 1 >= fieldPages} onClick={() => setFieldPage((v) => v + 1)}><ChevronRight className="size-4" /></Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stamp({ value }: { value: string }) {
  return <time dateTime={value}>{new Date(value).toLocaleString()}</time>;
}
function useStockEvents(enabled: boolean, refresh: () => void) {
  const [status, setStatus] = React.useState<
    "connecting" | "live" | "retrying" | "paused" | "polling"
  >("connecting");
  React.useEffect(() => {
    if (!enabled) return;
    let feed: EventSource | null = null,
      debounce: ReturnType<typeof setTimeout> | undefined,
      disposed = false;
    const invalidate = () => {
      if (debounce) return;
      debounce = setTimeout(() => {
        debounce = undefined;
        if (!disposed && document.visibilityState !== "hidden") refresh();
      }, 180);
    };
    const close = () => {
      feed?.close();
      feed = null;
      if (debounce) {
        clearTimeout(debounce);
        debounce = undefined;
      }
    };
    const start = () => {
      close();
      if (document.visibilityState === "hidden") {
        setStatus("paused");
        return;
      }
      if (typeof EventSource === "undefined") {
        setStatus("polling");
        return;
      }
      setStatus("connecting");
      const current = new EventSource("/api/factory/stock/events");
      feed = current;
      current.onopen = () => {
        if (!disposed && feed === current) setStatus("live");
      };
      current.addEventListener("refresh", invalidate);
      current.addEventListener("stock-change", invalidate);
      current.onerror = () => {
        if (!disposed && feed === current) {
          setStatus("retrying");
          invalidate();
        }
      };
    };
    const visibility = () => {
      if (document.visibilityState === "hidden") {
        close();
        setStatus("paused");
      } else {
        refresh();
        start();
      }
    };
    const online = () => {
      refresh();
      start();
    };
    const offline = () => {
      close();
      setStatus("retrying");
    };
    const fallback = setInterval(() => {
      if (
        document.visibilityState !== "hidden" &&
        (!feed || feed.readyState !== 1)
      )
        invalidate();
    }, 5000);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    start();
    return () => {
      disposed = true;
      close();
      clearInterval(fallback);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, [enabled, refresh]);
  return status;
}
export default function WarehousePage() {
  const { data, status } = useSession();
  const user = data?.user as
    | {
        id?: string | number;
        username?: string;
        shopId?: string | number;
        shopCode?: string;
      }
    | undefined;
  if (status !== "authenticated" || !user)
    return (
      <p role="status" className="p-6 text-sm">
        {status === "loading" ? "Login session စစ်နေသည်…" : "Login ပြန်ဝင်ပါ။"}
      </p>
    );
  return (
    <StockWorkspace
      key={`${user.id ?? user.username}:${user.shopId ?? user.shopCode}`}
    />
  );
}
function StockWorkspace() {
  const [filters, setFilters] = React.useState<Filters>(emptyFilters),
    [draft, setDraft] = React.useState<Filters>(emptyFilters),
    [tab, setTab] = React.useState<"balances" | "history">("balances"),
    [page, setPage] = React.useState(0),
    [revision, setRevision] = React.useState(0);
  const [result, setResult] = React.useState<Result | null>(null),
    [busy, setBusy] = React.useState(false),
    [error, setError] = React.useState(""),
    [updated, setUpdated] = React.useState(""),
    [authExpired, setAuthExpired] = React.useState(false);
  const [warehouses, setWarehouses] = React.useState<Place[]>([]),
    [locations, setLocations] = React.useState<Place[]>([]),
    [placeError, setPlaceError] = React.useState(""),
    [placeRevision, setPlaceRevision] = React.useState(0),
    [locationBusy, setLocationBusy] = React.useState(false);
  const [locationNames, setLocationNames] = React.useState<
    Record<number, string>
  >({});
  const [mappingOpen, setMappingOpen] = React.useState(false),
    [detail, setDetail] = React.useState<Balance | Movement | null>(null);
  const refresh = React.useCallback(() => setRevision((v) => v + 1), []);
  const connection = useStockEvents(!authExpired, refresh);
  const queryKey = JSON.stringify({ filters, tab, page });
  React.useEffect(() => {
    const c = new AbortController();
    let active = true;
    setBusy(true);
    setError("");
    setResult((r) => (r?.key === queryKey ? r : null));
    const q = new URLSearchParams({
      page: String(page),
      size: String(SIZE),
      search: filters.search,
    });
    if (filters.warehouseId) q.set("warehouseId", filters.warehouseId);
    if (filters.locationId) q.set("locationId", filters.locationId);
    if (filters.batch) q.set("batch", filters.batch);
    void api(`/api/factory/stock/${tab}?${q}`, { signal: c.signal })
      .then((v) => {
        const data =
          tab === "balances" ? decodeBalances(v) : decodeMovements(v);
        if (data.page !== page || data.size !== SIZE)
          throw new StockError("Stock pagination response မမှန်ပါ။", 502);
        const pages = Math.ceil(data.totalElements / SIZE);
        if (page > 0 && page >= pages) {
          if (active) setPage(Math.max(0, pages - 1));
          return;
        }
        if (active) {
          if (tab === "balances")
            setResult({
              key: queryKey,
              kind: "balances",
              data: data as StockPage<Balance>,
            });
          else
            setResult({
              key: queryKey,
              kind: "history",
              data: data as StockPage<Movement>,
            });
          setUpdated(new Date().toISOString());
        }
      })
      .catch((e) => {
        if (active) {
          setError(e instanceof Error ? e.message : "စတော့ရယူမရပါ။");
          if (e instanceof StockError && e.status === 401) setAuthExpired(true);
        }
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
      c.abort();
    };
  }, [filters, tab, page, revision, queryKey]);
  React.useEffect(() => {
    let active = true;
    const c = new AbortController();
    void api("/api/factory/receivings/warehouses", { signal: c.signal })
      .then(decodePlaces)
      .then(async (v) => {
        if (!active) return;
        setWarehouses(v);
        setPlaceError("");
        const results = await Promise.allSettled(
          v.map((w) =>
            api(`/api/factory/receivings/warehouses/${w.id}/locations`, {
              signal: c.signal,
            }).then(decodePlaces),
          ),
        );
        if (!active) return;
        const names: Record<number, string> = {};
        for (const result of results)
          if (result.status === "fulfilled")
            for (const location of result.value)
              names[location.id] = location.name;
        setLocationNames(names);
        if (results.some((r) => r.status === "rejected"))
          setPlaceError(
            "အချို့သိုလှောင်နေရာအမည်များ ရယူမရပါ။ နေရာစာရင်းကို ပြန်တင်ပါ။",
          );
      })
      .catch((e) => {
        if (active) {
          setPlaceError(e instanceof Error ? e.message : "ဂိုဒေါင်စာရင်းမရပါ။");
          if (e instanceof StockError && e.status === 401) setAuthExpired(true);
        }
      });
    return () => {
      active = false;
      c.abort();
    };
  }, [placeRevision]);
  React.useEffect(() => {
    setLocations([]);
    if (!draft.warehouseId) return;
    let active = true;
    const c = new AbortController();
    setLocationBusy(true);
    void api(
      `/api/factory/receivings/warehouses/${draft.warehouseId}/locations`,
      { signal: c.signal },
    )
      .then(decodePlaces)
      .then((v) => {
        if (active) setLocations(v);
      })
      .catch((e) => {
        if (active)
          setPlaceError(e instanceof Error ? e.message : "နေရာစာရင်းမရပါ။");
      })
      .finally(() => {
        if (active) setLocationBusy(false);
      });
    return () => {
      active = false;
      c.abort();
    };
  }, [draft.warehouseId, placeRevision]);
  const current = result?.key === queryKey ? result : null;
  const [receivingPhotos, setReceivingPhotos] = React.useState<Record<string, string | null>>({});
  const [photoError, setPhotoError] = React.useState("");
  const photoBarcodes = JSON.stringify(
    [...new Set([...(current?.data.content.map((row) => row.barcode) ?? []), ...(detail ? [detail.barcode] : [])])].sort(),
  );
  React.useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const barcodes = JSON.parse(photoBarcodes) as string[];
    if (!barcodes.length) return;
    setPhotoError("");
    void Promise.allSettled(barcodes.map(async (barcode) => {
      // Use the same Source decoder and photo resolver as the Receiving page.
      const source = decodeSource(await receivingRequest(
        `/sources?${new URLSearchParams({ barcode })}`,
        { signal: controller.signal },
      ));
      if (source.barcode !== barcode) throw new Error("Receiving barcode မကိုက်ညီပါ။");
      return [barcode, photoOf(source) || null] as const;
    })).then((results) => {
      if (!active) return;
      const photos: Record<string, string | null> = {};
      for (const result of results) {
        if (result.status === "fulfilled") photos[result.value[0]] = result.value[1];
      }
      setReceivingPhotos((previous) => ({ ...previous, ...photos }));
      if (results.some((result) => result.status === "rejected"))
        setPhotoError("အချို့ပစ္စည်းပုံများကို Receiving မှ ရယူမရပါ။ ပြန်တင်ရန် နှိပ်ပြီး စမ်းပါ။");
    });
    return () => { active = false; controller.abort(); };
  }, [photoBarcodes, revision]);
  const total = current?.data.totalElements;
  const totalPages = total === undefined ? 0 : Math.ceil(total / SIZE);
  const warehouseName = (id: number) =>
    warehouses.find((w) => w.id === id)?.name || `Warehouse #${id}`;
  const locationName = (id: number) =>
    locationNames[id] ||
    locations.find((l) => l.id === id)?.name ||
    `Location #${id}`;
  const zeroCount =
    current?.kind === "balances"
      ? current.data.content.filter((r) => BigInt(r.quantity) === BigInt(0))
          .length
      : null;
  const skuCount = current
    ? new Set(current.data.content.map((r) => r.barcode)).size
    : null;
  const connectionText = authExpired
    ? "Login ပြန်ဝင်ရန်"
    : connection === "live"
      ? "တိုက်ရိုက်ချိတ်ဆက်ထား"
      : connection === "paused"
        ? "ယာယီရပ်ထား"
        : connection === "polling"
          ? "၅ စက္ကန့်တစ်ကြိမ် စစ်နေသည်"
          : connection === "retrying"
            ? "ပြန်ချိတ်နေသည် · ၅ စက္ကန့်တစ်ကြိမ် စစ်မည်"
            : "ချိတ်ဆက်နေသည်…";
  return (
    <main
      lang="my"
      className="mx-auto max-w-[1500px] space-y-4 p-3 text-foreground sm:p-5"
      style={{ fontFamily: '"Noto Sans Myanmar", "Myanmar Text", sans-serif' }}
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-muted-foreground">
            BINHLAIG · FACTORY
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-xl font-bold leading-10 sm:text-2xl">
            <Warehouse className="size-6 text-blue-600" />
            ဂိုဒေါင်စတော့စာရင်း
          </h1>
          <p className="text-xs leading-6 text-muted-foreground">
            Receiving အဝင်၊ Checkout အထွက်နှင့် လက်ရှိလက်ကျန်
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={authExpired}
            onClick={() => {
              setPlaceRevision((v) => v + 1);
              refresh();
            }}
          >
            <RefreshCw className={`size-4 ${busy ? "animate-spin" : ""}`} />
            ပြန်တင်ရန်
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={authExpired}
            onClick={() => setMappingOpen(true)}
          >
            <Link2 className="size-4" />
            POS ပစ္စည်းချိတ်ရန်
          </Button>
        </div>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2 text-xs leading-7">
        <span
          className={`flex items-center gap-2 ${connection === "live" && !authExpired ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-300"}`}
        >
          {connection === "live" && !authExpired ? (
            <Wifi className="size-4" />
          ) : (
            <WifiOff className="size-4" />
          )}
          {connectionText}
        </span>
        <span className="text-muted-foreground">
          နောက်ဆုံးရယူချိန် — {updated ? <Stamp value={updated} /> : "—"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          {
            label: "စစ်ထုတ်ထားသော စာရင်းစုစုပေါင်း",
            value: total === undefined ? "—" : total.toLocaleString(),
          },
          {
            label: "ဤစာမျက်နှာရှိ ပစ္စည်းမျိုး",
            value: skuCount === null ? "—" : String(skuCount),
          },
          {
            label: "ဤစာမျက်နှာရှိ စတော့ကုန်စာရင်း",
            value: zeroCount === null ? "—" : String(zeroCount),
          },
          {
            label: "လက်ရှိကြည့်နေသောအပိုင်း",
            value: tab === "balances" ? "လက်ကျန်" : "ဝင် / ထွက်",
          },
        ].map((i) => (
          <Badge key={i.label} variant="outline" className="gap-2 rounded-full border-blue-200 bg-blue-50 px-3 py-2 text-xs font-normal leading-6 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
            {i.label}
            <span className="rounded-full bg-background px-2 font-bold tabular-nums text-foreground">{i.value}</span>
          </Badge>
        ))}
      </div>
      <section aria-label="စတော့ရှာဖွေရန်" className="space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setFilters({
                ...draft,
                search: draft.search.trim(),
                batch: draft.batch.trim(),
              });
              setPage(0);
              refresh();
            }}
            className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_auto]"
          >
            <Field label="ပစ္စည်းအမည် / Barcode">
              <Input
                value={draft.search}
                maxLength={200}
                placeholder="Barcode scan ဖတ်ပါ / ပစ္စည်းအမည်"
                autoComplete="off"
                spellCheck={false}
                onChange={(e) =>
                  setDraft((f) => ({ ...f, search: e.target.value }))
                }
                className="h-11"
              />
            </Field>
            <Field label="Warehouse">
              <select
                className={fieldClass}
                value={draft.warehouseId}
                onChange={(e) =>
                  setDraft((f) => ({
                    ...f,
                    warehouseId: e.target.value,
                    locationId: "",
                  }))
                }
              >
                <option value="">ဂိုဒေါင်အားလုံး</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                    {!w.active ? " (ပိတ်ထားသည်)" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Location / Rack">
              <select
                className={fieldClass}
                value={draft.locationId}
                disabled={!draft.warehouseId || locationBusy}
                onChange={(e) =>
                  setDraft((f) => ({ ...f, locationId: e.target.value }))
                }
              >
                <option value="">
                  {locationBusy ? "ရယူနေသည်…" : "နေရာအားလုံး"}
                </option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                    {!l.active ? " (ပိတ်ထားသည်)" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Batch (အတိအကျ)">
              <Input
                value={draft.batch}
                maxLength={100}
                placeholder="Batch နံပါတ်"
                onChange={(e) =>
                  setDraft((f) => ({ ...f, batch: e.target.value }))
                }
                className="h-11"
              />
            </Field>
            <div className="flex gap-2">
              <Button type="submit" className="min-h-11" disabled={authExpired}>
                <Barcode className="size-4" />
                ရှာရန်
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => {
                  setDraft(emptyFilters);
                  setFilters(emptyFilters);
                  setPage(0);
                  refresh();
                }}
              >
                ရှင်းရန်
              </Button>
            </div>
          </form>
          {placeError && (
            <p role="alert" className="text-xs text-destructive">
              {placeError}
            </p>
          )}
      </section>
      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as typeof tab);
          setPage(0);
        }}
      >
        <TabsList className="h-auto flex-wrap p-1">
          <TabsTrigger value="balances" className="min-h-10 gap-2">
            <Package className="size-4" />
            လက်ကျန်စတော့
          </TabsTrigger>
          <TabsTrigger value="history" className="min-h-10 gap-2">
            <History className="size-4" />
            ဝင် / ထွက်မှတ်တမ်း
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm leading-7 text-destructive"
        >
          <p>
            {error}
            {current
              ? " ပြထားသော data သည် နောက်ဆုံးရယူထားသည့်အခြေအနေ ဖြစ်ပါသည်။"
              : ""}
          </p>
          {!authExpired && (
            <Button variant="outline" onClick={refresh}>
              ပြန်စမ်းရန်
            </Button>
          )}
        </div>
      )}
      {photoError && <p role="status" className="text-xs leading-6 text-amber-700 dark:text-amber-300">{photoError}</p>}
      {busy && (
        <p
          role="status"
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Loader2 className="size-4 animate-spin" />
          Server မှ စတော့စာရင်း ပြန်ယူနေသည်…
        </p>
      )}
      {!busy && !error && current && !current.data.content.length && (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <Package className="mx-auto mb-3 size-10 text-muted-foreground" />
          <p className="text-sm">ဒီစစ်ထုတ်မှုအတွက် စာရင်းမရှိသေးပါ။</p>
          <p className="mt-2 text-xs leading-7 text-muted-foreground">
            စတော့အဝင်ရရန် Receiving ကို အတည်ပြုထားပါ။
          </p>
        </div>
      )}
      {current?.kind === "balances" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:max-w-[1048px]" aria-busy={busy}>
          {current.data.content.map((r) => (
            <button
              type="button"
              key={`${r.itemId}:${r.sourceVersion}:${r.warehouseId}:${r.locationId}:${r.batch}`}
              onClick={() => setDetail(r)}
              aria-label={`${r.name} အသေးစိတ်ကြည့်ရန်`}
              className="group flex w-full max-w-[200px] flex-col gap-2 overflow-hidden rounded-2xl border bg-card p-3 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ProductImage product={r} imageUrl={receivingPhotos[r.barcode]} compact />
              <div className="w-full min-w-0 space-y-2">
                <h2 className="line-clamp-2 min-h-10 break-words text-xs font-semibold leading-5">{r.name}</h2>
                <div className={`flex flex-wrap items-center justify-between gap-1 rounded-lg px-2 py-1 ${BigInt(r.quantity) === BigInt(0) ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300" : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"}`}>
                  <span className="text-xs leading-6">လက်ကျန် stock</span>
                  <strong className="break-all text-sm tabular-nums">{quantity(r.quantity)} <span className="text-xs font-medium">{r.unit}</span></strong>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      {current?.kind === "history" && (
        <div className="grid gap-3 md:grid-cols-2">
          {current.data.content.map((r) => (
            <Card key={r.id} className="gap-0 rounded-2xl py-0 shadow-none">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl ${r.type === "STOCK_IN" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30" : "bg-orange-50 text-orange-700 dark:bg-orange-950/30"}`}
                  >
                    {r.type === "STOCK_IN" ? (
                      <ArrowDownLeft />
                    ) : (
                      <ArrowUpRight />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-sm font-semibold leading-7">
                      {r.name}
                    </h2>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {r.barcode}
                    </p>
                  </div>
                  <strong
                    className={`shrink-0 text-lg tabular-nums ${r.type === "STOCK_IN" ? "text-emerald-700 dark:text-emerald-400" : "text-orange-700 dark:text-orange-400"}`}
                  >
                    {BigInt(r.delta) > BigInt(0) ? "+" : ""}
                    {quantity(r.delta)}{" "}
                    <span className="text-xs">{r.unit}</span>
                  </strong>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs leading-6 text-muted-foreground">
                  <span>
                    {r.type === "STOCK_IN"
                      ? "Receiving အဝင်"
                      : "Checkout အထွက်"}
                  </span>
                  <Stamp value={r.createdAt} />
                  <span>{warehouseName(r.warehouseId)}</span>
                  <span className="break-all">Batch {r.batch}</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setDetail(r)}
                >
                  မှတ်တမ်းအသေးစိတ်
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3 text-xs">
        <p>
          {total === undefined
            ? "—"
            : `${total.toLocaleString()} စာရင်း · စာမျက်နှာ ${totalPages ? page + 1 : 0} / ${totalPages}`}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page === 0 || busy}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="size-4" />
            ရှေ့
          </Button>
          <Button
            variant="outline"
            disabled={!totalPages || page + 1 >= totalPages || busy}
            onClick={() => setPage((p) => p + 1)}
          >
            နောက်
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </footer>
      <p className="text-[11px] leading-7 text-muted-foreground">
        လက်ကျန်သည် Server မှ ရယူထားသော အရေအတွက်ဖြစ်ပါသည်။ ရောင်းပြီးပမာဏကို
        ထပ်မနုတ်ပါ။ ယူနစ်မတူသောပစ္စည်းများကို စုစုပေါင်းတစ်ခုအဖြစ် မပေါင်းထားပါ။
      </p>
      <Dialog
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-4xl gap-3 rounded-2xl p-4 sm:max-w-4xl sm:p-5">
          <DialogHeader>
            <DialogTitle className="line-clamp-2 pr-7 text-base leading-7" title={detail?.name}>{detail?.name || "ပစ္စည်းအသေးစိတ်"}</DialogTitle>
            <DialogDescription>
              ဂိုဒေါင်၊ Batch နှင့် စတော့မှတ်တမ်း
            </DialogDescription>
          </DialogHeader>
          {detail && <ProductDetail key={`${detail.barcode}:${"id" in detail ? detail.id : `${detail.warehouseId}:${detail.locationId}:${detail.batch}`}`} product={detail} imageUrl={receivingPhotos[detail.barcode]} warehouse={warehouseName(detail.warehouseId)} location={locationName(detail.locationId)} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetail(null)}>
              ပိတ်မည်
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {mappingOpen && (
        <MappingDialog
          warehouses={warehouses}
          onClose={() => setMappingOpen(false)}
          onSaved={refresh}
        />
      )}
    </main>
  );
}
function MappingDialog({
  warehouses,
  onClose,
  onSaved,
}: {
  warehouses: Place[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [productSearch, setProductSearch] = React.useState(""),
    [productQuery, setProductQuery] = React.useState(""),
    [products, setProducts] = React.useState<PosProduct[]>([]),
    [productsBusy, setProductsBusy] = React.useState(false),
    [productError, setProductError] = React.useState(""),
    [productRevision, setProductRevision] = React.useState(0),
    [product, setProduct] = React.useState<PosProduct | null>(null);
  const [receiptSearch, setReceiptSearch] = React.useState(""),
    [receiptQuery, setReceiptQuery] = React.useState(""),
    [receiptPage, setReceiptPage] = React.useState(0),
    [receiptPages, setReceiptPages] = React.useState(0),
    [receipts, setReceipts] = React.useState<ReceiptOption[]>([]),
    [receiptsBusy, setReceiptsBusy] = React.useState(false),
    [receiptError, setReceiptError] = React.useState(""),
    [receiptRevision, setReceiptRevision] = React.useState(0),
    [receipt, setReceipt] = React.useState<ReceiptOption | null>(null);
  const [ratio, setRatio] = React.useState("1"),
    [unit, setUnit] = React.useState(""),
    [confirm, setConfirm] = React.useState(false),
    [saving, setSaving] = React.useState(false),
    [saved, setSaved] = React.useState(false),
    [uncertain, setUncertain] = React.useState(false),
    [error, setError] = React.useState("");
  const lock = React.useRef(false),
    mounted = React.useRef(true);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  React.useEffect(() => {
    let active = true;
    const c = new AbortController();
    setProductsBusy(true);
    setProductError("");
    setProducts([]);
    void api(
      `/api/factory/stock/products?${new URLSearchParams({ q: productQuery })}`,
      { signal: c.signal },
    )
      .then(decodeProducts)
      .then((v) => {
        if (active) setProducts(v);
      })
      .catch((e) => {
        if (active)
          setProductError(
            e instanceof Error ? e.message : "POS ပစ္စည်းစာရင်းမရပါ။",
          );
      })
      .finally(() => {
        if (active) setProductsBusy(false);
      });
    return () => {
      active = false;
      c.abort();
    };
  }, [productQuery, productRevision]);
  React.useEffect(() => {
    let active = true;
    const c = new AbortController();
    setReceiptsBusy(true);
    setReceiptError("");
    setReceipts([]);
    const q = new URLSearchParams({
      status: "CONFIRMED",
      page: String(receiptPage),
      size: "6",
    });
    if (receiptQuery) q.set("barcode", receiptQuery);
    void api(`/api/factory/receivings?${q}`, { signal: c.signal })
      .then(decodeReceiptOptions)
      .then((p) => {
        if (p.page !== receiptPage) throw new Error("Receiving page မမှန်ပါ။");
        if (active) {
          setReceipts(p.content);
          setReceiptPages(p.totalPages);
        }
      })
      .catch((e) => {
        if (active)
          setReceiptError(
            e instanceof Error ? e.message : "Receiving စာရင်းမရပါ။",
          );
      })
      .finally(() => {
        if (active) setReceiptsBusy(false);
      });
    return () => {
      active = false;
      c.abort();
    };
  }, [receiptQuery, receiptPage, receiptRevision]);
  function ready() {
    if (!product || !receipt) {
      setError("POS ပစ္စည်းနှင့် အတည်ပြုပြီး Receiving ကို ရွေးပါ။");
      return;
    }
    if (
      !/^(0|[1-9]\d{0,17})(\.\d{1,12})?$/.test(ratio) ||
      BigInt(ratio.replace(".", "")) === BigInt(0)
    ) {
      setError(
        "Stock units per POS sale ကို အပေါင်းကိန်းဖြည့်ပါ။ ဒဿမ 12 နေရာအထိ သုံးနိုင်ပါသည်။",
      );
      return;
    }
    if (!unit.trim() || unit.trim().length > 200) {
      setError("POS ရောင်းယူနစ် 1–200 စာလုံး ဖြည့်ပါ။");
      return;
    }
    setError("");
    setConfirm(true);
  }
  async function save() {
    if (lock.current || !product || !receipt || uncertain || saved) return;
    lock.current = true;
    setSaving(true);
    setConfirm(false);
    setError("");
    try {
      const v = (await api(`/api/factory/stock/mappings/${product.id}`, {
        method: "POST",
        body: JSON.stringify({
          receivingId: receipt.id,
          stockUnitsPerSale: ratio,
          posUnit: unit.trim(),
        }),
      })) as { productId?: number; receivingId?: number };
      if (v?.productId !== product.id || v?.receivingId !== receipt.id)
        throw new StockError(
          "ချိတ်ဆက်ပြီးဖြစ်နိုင်သော်လည်း response ဖတ်မရပါ။",
          502,
          true,
        );
      if (mounted.current) {
        setSaved(true);
        onSaved();
      }
    } catch (e) {
      if (mounted.current) {
        setError(e instanceof Error ? e.message : "ချိတ်ဆက်မရပါ။");
        if (!(e instanceof StockError) || e.uncertain) setUncertain(true);
      }
    } finally {
      lock.current = false;
      if (mounted.current) setSaving(false);
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !saving) onClose();
      }}
    >
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-4xl"
        onEscapeKeyDown={(e) => {
          if (saving) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (saving) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            POS ပစ္စည်းနှင့် Warehouse stock ချိတ်ဆက်ရန်
          </DialogTitle>
          <DialogDescription className="leading-7">
            Checkout အောင်မြင်သောအခါ ရွေးထားသော Receiving ၏ Warehouse / Batch မှ
            စတော့နုတ်ပါမည်။ ချိတ်ပြီးသား POS product ကို ဒီ API ဖြင့်
            ပြန်ပြောင်းမရပါ။
          </DialogDescription>
        </DialogHeader>
        {saved ? (
          <div
            role="status"
            className="space-y-3 rounded-xl bg-emerald-50 p-5 text-sm leading-7 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
          >
            <CheckCircle2 className="size-7" />
            <p>POS product နှင့် Warehouse stock ချိတ်ဆက်ပြီးပါပြီ။</p>
            <p>
              {product?.name} → {receipt?.receivingNumber} / {receipt?.batch}
            </p>
            <p>
              1 {unit} ရောင်းလျှင် {ratio} {receipt?.unit} နုတ်မည်။
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <section className="space-y-3 rounded-xl border p-3">
                <h3 className="text-sm font-semibold">
                  01 · POS ရောင်းကုန်ရွေးရန်
                </h3>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setProductQuery(productSearch.trim());
                    setProduct(null);
                    setProductRevision((v) => v + 1);
                  }}
                >
                  <Input
                    aria-label="POS ပစ္စည်းရှာရန်"
                    value={productSearch}
                    maxLength={200}
                    placeholder="အမည် / Barcode"
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  <Button variant="outline" type="submit" disabled={saving}>
                    ရှာရန်
                  </Button>
                </form>
                {productsBusy && <p className="text-xs">ရယူနေသည်…</p>}
                {productError && (
                  <p role="alert" className="text-xs text-destructive">
                    {productError}
                  </p>
                )}
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {products.slice(0, 50).map((p) => (
                    <Button
                      key={p.id}
                      variant="outline"
                      disabled={saving || uncertain}
                      aria-pressed={product?.id === p.id}
                      className={`h-auto w-full justify-start whitespace-normal p-3 text-left ${product?.id === p.id ? "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-100" : ""}`}
                      onClick={() => setProduct(p)}
                    >
                      <span>
                        <span className="block text-sm leading-7">
                          {p.name}
                        </span>
                        <span className="block break-all font-mono text-[10px] leading-6">
                          ID {p.id} · {p.barcode || p.sku || "—"}
                        </span>
                      </span>
                    </Button>
                  ))}
                </div>
                {!productsBusy && !productError && !products.length && (
                  <p className="text-xs text-muted-foreground">
                    POS ပစ္စည်းမရှိသေးပါ။
                  </p>
                )}
                {products.length > 50 && (
                  <p className="text-xs text-muted-foreground">
                    ပထမ 50 ခုသာ ပြထားပါသည်။ Search ဖြင့် ထပ်စစ်ပါ။
                  </p>
                )}
              </section>
              <section className="space-y-3 rounded-xl border p-3">
                <h3 className="text-sm font-semibold">
                  02 · Receiving / Batch ရွေးရန်
                </h3>
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setReceiptQuery(receiptSearch.trim());
                    setReceiptPage(0);
                    setReceipt(null);
                    setReceiptRevision((v) => v + 1);
                  }}
                >
                  <Input
                    aria-label="Receiving barcode ရှာရန်"
                    value={receiptSearch}
                    maxLength={100}
                    placeholder="FC Barcode"
                    onChange={(e) => setReceiptSearch(e.target.value)}
                  />
                  <Button variant="outline" type="submit" disabled={saving}>
                    ရှာရန်
                  </Button>
                </form>
                {receiptsBusy && <p className="text-xs">ရယူနေသည်…</p>}
                {receiptError && (
                  <p role="alert" className="text-xs text-destructive">
                    {receiptError}
                  </p>
                )}
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {receipts.map((r) => (
                    <Button
                      key={r.id}
                      variant="outline"
                      disabled={saving || uncertain}
                      aria-pressed={receipt?.id === r.id}
                      className={`h-auto w-full justify-start whitespace-normal p-3 text-left ${receipt?.id === r.id ? "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-100" : ""}`}
                      onClick={() => {
                        setReceipt(r);
                        setUnit(r.unit);
                      }}
                    >
                      <span>
                        <span className="block text-sm leading-7">
                          {r.name}
                        </span>
                        <span className="block break-all text-[10px] leading-6">
                          {r.receivingNumber} · {r.batch}
                        </span>
                        <span className="block text-[10px] leading-6 text-muted-foreground">
                          {warehouses.find((w) => w.id === r.warehouseId)
                            ?.name || `Warehouse #${r.warehouseId}`}{" "}
                          · Location #{r.locationId}
                        </span>
                      </span>
                    </Button>
                  ))}
                </div>
                {!receiptsBusy && !receiptError && !receipts.length && (
                  <p className="text-xs text-muted-foreground">
                    အတည်ပြုပြီး Receiving မရှိသေးပါ။
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={saving || receiptsBusy || receiptPage === 0}
                    onClick={() => setReceiptPage((p) => p - 1)}
                  >
                    ရှေ့
                  </Button>
                  <span className="text-[10px]">
                    {receiptPages
                      ? `${receiptPage + 1} / ${receiptPages}`
                      : "—"}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      saving ||
                      receiptsBusy ||
                      !receiptPages ||
                      receiptPage + 1 >= receiptPages
                    }
                    onClick={() => setReceiptPage((p) => p + 1)}
                  >
                    နောက်
                  </Button>
                </div>
              </section>
            </div>
            <div className="grid gap-3 rounded-xl bg-muted/40 p-3 sm:grid-cols-2">
              <Field label="POS ရောင်းယူနစ်">
                <Input
                  value={unit}
                  maxLength={200}
                  disabled={saving || uncertain}
                  placeholder="ဥပမာ — ထုပ် / တွဲ"
                  onChange={(e) => setUnit(e.target.value)}
                />
              </Field>
              <Field label="POS 1 ယူနစ်အတွက် နုတ်မည့် Stock ပမာဏ">
                <Input
                  value={ratio}
                  disabled={saving || uncertain}
                  inputMode="decimal"
                  onChange={(e) => setRatio(e.target.value)}
                />
              </Field>
              <p className="text-xs leading-7 text-muted-foreground sm:col-span-2">
                ဥပမာ POS မှ 1 တွဲရောင်းပြီး stock 6 ထုပ်နုတ်လိုလျှင် ပမာဏ 6
                ထည့်ပါ။ Checkout မှာ ပြောင်းပြီးသော Stock ပမာဏသည်
                အပြည့်ကိန်းဖြစ်ရပါမည်။
              </p>
            </div>
            {(product || receipt) && (
              <p className="rounded-xl border p-3 text-xs leading-7">
                ရွေးထားသည် — {product?.name || "POS မရွေးရသေး"} →{" "}
                {receipt
                  ? `${receipt.receivingNumber} / ${receipt.batch}`
                  : "Receiving မရွေးရသေး"}
              </p>
            )}
          </>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 p-3 text-xs leading-7 text-destructive"
          >
            {error}
          </p>
        )}
        {uncertain && (
          <p className="text-xs leading-7 text-amber-700 dark:text-amber-300">
            ရလဒ်မသေချာသဖြင့် ထပ်ပို့ခြင်း ပိတ်ထားပါသည်။ ဒီ backend တွင် Mapping
            ပြန်ကြည့်သည့် API မပါသေးပါ။
          </p>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" disabled={saving} onClick={onClose}>
            ပိတ်မည်
          </Button>
          {!saved && (
            <Button
              disabled={saving || uncertain || !product || !receipt}
              onClick={ready}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Link2 className="size-4" />
              )}
              ချိတ်ဆက်မည်
            </Button>
          )}
        </DialogFooter>
        <Dialog open={confirm} onOpenChange={setConfirm}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>Stock ချိတ်ဆက်မှု အတည်ပြုရန်</DialogTitle>
              <DialogDescription className="leading-7">
                POS product ကို ဒီ Receiving stock နှင့် ချိတ်ပါမည်။
                ရွေးထားသောပစ္စည်း၊ Batch နှင့် နုတ်မည့်ပမာဏကို စစ်ပါ။
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 rounded-xl bg-muted p-3 text-sm leading-7">
              <p>
                {product?.name} → {receipt?.name}
              </p>
              <p>
                {receipt?.receivingNumber} · Batch {receipt?.batch}
              </p>
              <p>
                POS 1 {unit} = Stock {ratio} {receipt?.unit}
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setConfirm(false)}>
                မလုပ်တော့ပါ
              </Button>
              <Button onClick={() => void save()}>အတည်ပြုချိတ်ဆက်မည်</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
