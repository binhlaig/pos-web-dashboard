"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CostingApiError,
  costingRequest,
  sheetRequest,
  textFields,
  numericFields,
  type CostingSheet,
  type CostingServerItem,
} from "@/lib/costing-api";

type Props = {
  sheet: CostingSheet;
  item: CostingServerItem;
  disabled?: boolean;
  unsavedChanges?: boolean;
  onAcquire?: () => boolean;
  onRelease?: () => void;
  onBusyChange?: (busy: boolean) => void;
  onUncertain?: () => void;
  onBeforeNavigate?: () => void;
  onReload: () => void | Promise<void>;
  onDeleted?: () => void;
};

export function CostingProductDelete({
  sheet,
  item,
  disabled = false,
  unsavedChanges = false,
  onAcquire,
  onRelease,
  onBusyChange,
  onUncertain,
  onBeforeNavigate,
  onReload,
  onDeleted,
}: Props) {
  const router = useRouter();
  const inputId = React.useId();
  const [open, setOpen] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [blocked, setBlocked] = React.useState(false);
  const [error, setError] = React.useState("");
  const lock = React.useRef(false);
  const name =
    String(item.inputs.product || "အမည်မဖြည့်ရသေးပါ").trim() || "အမည်မဖြည့်ရသေးပါ";
  const allowed =
    sheet.status === "DRAFT" &&
    sheet.items.some(
      (entry) => entry.id === item.id && entry.clientItemId === item.clientItemId,
    );
  React.useEffect(() => {
    setConfirmation("");
    setError("");
    setBlocked(false);
    setOpen(false);
  }, [sheet, item.id]);
  function changeOpen(next: boolean) {
    if (lock.current) return;
    setOpen(next);
    if (next) setConfirmation("");
  }
  async function remove() {
    if (lock.current || disabled || blocked || !allowed || confirmation.trim() !== name)
      return;
    if (onAcquire && !onAcquire()) return;
    lock.current = true;
    setBusy(true);
    setError("");
    onBusyChange?.(true);
    try {
      // Item deletion uses the existing versioned full-sheet update. Keep every
      // remaining clientItemId and input unchanged; never DELETE the whole sheet.
      const remaining = sheet.items.filter(
        (entry) => entry.clientItemId !== item.clientItemId,
      );
      const payload = {
        title: sheet.title,
        version: sheet.version,
        items: remaining.map((entry) => ({
          clientItemId: entry.clientItemId,
          ...Object.fromEntries(
            [...textFields, ...numericFields].map((key) => [
              key,
              entry.inputs[key] ?? null,
            ]),
          ),
        })),
      };
      const result = await sheetRequest(`/${sheet.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      if (
        result.id !== sheet.id ||
        result.items.some((entry) => entry.clientItemId === item.clientItemId)
      ) {
        throw new CostingApiError(
          "ဖျက်ခြင်းရလဒ် မသေချာပါ။ Server စာရင်းကို ပြန်စစ်ပါ။",
          502,
          true,
        );
      }
      setBlocked(true); // Do not repeat a successful mutation if navigation stalls.
      onBeforeNavigate?.();
      if (onDeleted) {
        setOpen(false);
        onDeleted();
      } else router.replace("/factory/costing/products");
    } catch (reason) {
      if (
        reason instanceof CostingApiError &&
        (reason.status === 409 || reason.uncertain)
      ) {
        setBlocked(true);
        onUncertain?.();
      }
      setError(reason instanceof Error ? reason.message : "ပစ္စည်းဖျက်မရပါ။");
    } finally {
      lock.current = false;
      setBusy(false);
      onRelease?.();
      onBusyChange?.(false);
    }
  }
  if (!allowed) return null;
  return (
    <>
      <Button
        type="button"
        variant="destructive"
        disabled={disabled || busy}
        onClick={() => changeOpen(true)}
        className="h-auto min-h-11 py-2 text-xs leading-6"
      >
        <Trash2 className="mr-2 size-4" />
        ပစ္စည်းဖျက်ရန်
      </Button>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent
          className="max-w-lg rounded-2xl"
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-base leading-8">
              ကုန်ပစ္စည်းကို အပြီးဖျက်မလား။
            </DialogTitle>
            <DialogDescription className="text-sm leading-7">
              ရွေးထားသော ပစ္စည်းနှင့် ၎င်း၏ပုံများကို ဤ costing စာရင်းမှ ဖယ်ရှားပါမည်။
              အခြားပစ္စည်းများကို ဆက်ထိန်းထားပါမည်။
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm leading-7">
              <p className="break-words font-semibold">{name}</p>
              <p className="text-xs text-muted-foreground">
                {sheet.title} · စာရင်း #{sheet.id} / ပစ္စည်း #{item.id}
              </p>
            </div>
            {sheet.items.length === 1 && (
              <p className="rounded-xl bg-amber-50 p-3 text-xs leading-7 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                ဤပစ္စည်းသည် နောက်ဆုံးကျန်သော ပစ္စည်းဖြစ်ပါသည်။ ဖျက်ပြီးလျှင် costing
                စာရင်းအလွတ်ကို ဆက်ထားပါမည်။
              </p>
            )}
            {unsavedChanges && (
              <p className="text-xs leading-7 text-destructive">
                Edit form မှ မသိမ်းရသေးသော ပြင်ဆင်ချက်များကိုလည်း ချန်ထားမည်ဖြစ်ပါသည်။
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor={inputId} className="text-xs leading-7">
                အတည်ပြုရန် အထက်ပါ ပစ္စည်းအမည်ကို ပြန်ရိုက်ပါ
              </Label>
              <Input
                id={inputId}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="off"
                disabled={busy || blocked}
                aria-describedby={`${inputId}-description`}
                className="h-11 text-sm"
              />
              <p
                id={`${inputId}-description`}
                className="text-xs leading-6 text-muted-foreground"
              >
                ဖျက်ပြီးသော ပစ္စည်းကို ဤလုပ်ဆောင်ချက်မှ ပြန်ယူမရပါ။
              </p>
            </div>
            {error && (
              <p role="alert" className="text-xs leading-7 text-destructive">
                {error}
              </p>
            )}
            {blocked && (
              <div className="space-y-2 rounded-xl border border-border p-3">
                <p className="text-xs leading-7 text-muted-foreground">
                  ထပ်မဖျက်မီ Server စာရင်း ပြန်ယူစစ်ဆေးပါ။
                </p>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setOpen(false);
                    void onReload();
                  }}
                  className="h-auto min-h-10 whitespace-normal py-2 text-xs leading-6"
                >
                  <RefreshCw className="mr-2 size-4" />
                  Server စာရင်း ပြန်ယူရန်
                </Button>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => changeOpen(false)}
              className="h-auto min-h-11 py-2 text-xs leading-6"
            >
              မဖျက်တော့ပါ
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={disabled || busy || blocked || confirmation.trim() !== name}
              onClick={() => void remove()}
              className="h-auto min-h-11 py-2 text-xs leading-6"
            >
              {busy ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}
              {busy ? "ဖျက်နေသည်…" : "အပြီးဖျက်မည်"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

type SheetDeleteProps = Pick<
  Props,
  | "sheet"
  | "disabled"
  | "onAcquire"
  | "onRelease"
  | "onBusyChange"
  | "onUncertain"
  | "onReload"
  | "onDeleted"
>;

export function CostingSheetDelete({
  sheet,
  disabled = false,
  onAcquire,
  onRelease,
  onBusyChange,
  onUncertain,
  onReload,
  onDeleted,
}: SheetDeleteProps) {
  const router = useRouter();
  const inputId = React.useId();
  const lock = React.useRef(false);
  const [open, setOpen] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [blocked, setBlocked] = React.useState(false);
  const [error, setError] = React.useState("");
  const name = sheet.title.trim();
  React.useEffect(() => {
    setConfirmation("");
    setError("");
    setBlocked(false);
    setOpen(false);
  }, [sheet]);
  function changeOpen(next: boolean) {
    if (lock.current) return;
    setOpen(next);
    if (next) setConfirmation("");
  }
  async function remove() {
    if (
      lock.current ||
      disabled ||
      blocked ||
      sheet.status !== "DRAFT" ||
      !name ||
      confirmation.trim() !== name
    )
      return;
    if (onAcquire && !onAcquire()) return;
    lock.current = true;
    setBusy(true);
    setError("");
    onBusyChange?.(true);
    try {
      // This endpoint deletes the sheet AND its products/photos. Never use it
      // for a single card; single-product deletion above uses versioned PUT.
      await costingRequest(`/${sheet.id}?version=${sheet.version}`, { method: "DELETE" });
      setBlocked(true);
      setOpen(false);
      if (onDeleted) onDeleted();
      else router.replace("/factory/costing/products");
    } catch (reason) {
      if (
        reason instanceof CostingApiError &&
        (reason.status === 409 || reason.uncertain)
      ) {
        setBlocked(true);
        onUncertain?.();
      }
      setError(reason instanceof Error ? reason.message : "အတွဲဖျက်မရပါ။");
    } finally {
      lock.current = false;
      setBusy(false);
      onRelease?.();
      onBusyChange?.(false);
    }
  }
  if (sheet.status !== "DRAFT") return null;
  return (
    <>
      <Button
        type="button"
        variant="destructive"
        disabled={disabled || busy}
        onClick={() => changeOpen(true)}
        className="h-auto min-h-11 whitespace-normal py-2 text-xs leading-6"
      >
        <Trash2 className="mr-2 size-4" />
        အတွဲတစ်ခုလုံးဖျက်ရန်
      </Button>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent
          className="max-w-lg rounded-2xl"
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-base leading-8">
              ပစ္စည်းအတွဲတစ်ခုလုံးကို ဖျက်မလား။
            </DialogTitle>
            <DialogDescription className="text-sm leading-7">
              ဤ costing စာရင်းနှင့် အတွင်းရှိ ပစ္စည်းအားလုံး၊ ပုံအားလုံးကို ဖျက်ပါမည်။
              အခြားအတွဲများကို မပြောင်းပါ။
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-4">
              <p className="break-words text-sm font-semibold leading-7">{sheet.title}</p>
              <p className="text-xs leading-7 text-muted-foreground">
                စာရင်း #{sheet.id} · ပစ္စည်း {sheet.items.length} မျိုး
              </p>
              <ul className="mt-2 list-disc pl-5 text-xs leading-7">
                {sheet.items.slice(0, 5).map((item) => (
                  <li key={item.id} className="break-words">
                    {String(item.inputs.product || "အမည်မဖြည့်ရသေးပါ")}
                  </li>
                ))}
              </ul>
              {sheet.items.length > 5 && (
                <p className="text-xs leading-7 text-muted-foreground">
                  နှင့် အခြား {sheet.items.length - 5} မျိုး
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={inputId} className="text-xs leading-7">
                အတည်ပြုရန် အထက်ပါ အတွဲအမည်ကို ပြန်ရိုက်ပါ
              </Label>
              <Input
                id={inputId}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="off"
                disabled={busy || blocked}
                className="h-11 text-sm"
                aria-describedby={`${inputId}-description`}
              />
              <p
                id={`${inputId}-description`}
                className="text-xs leading-7 text-destructive"
              >
                အတွဲထဲက ပစ္စည်းအားလုံးကို အပြီးဖျက်မည်ဖြစ်ပြီး ပြန်ယူမရပါ။
              </p>
            </div>
            {error && (
              <p role="alert" className="text-xs leading-7 text-destructive">
                {error}
              </p>
            )}
            {blocked && (
              <div className="space-y-2">
                <p className="text-xs leading-7 text-muted-foreground">
                  ထပ်မဖျက်မီ Server စာရင်းကို ပြန်စစ်ပါ။
                </p>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setOpen(false);
                    void onReload();
                  }}
                  className="h-auto min-h-10 whitespace-normal py-2 text-xs leading-6"
                >
                  <RefreshCw className="mr-2 size-4" />
                  Server စာရင်း ပြန်ယူရန်
                </Button>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => changeOpen(false)}
              className="h-auto min-h-11 py-2 text-xs leading-6"
            >
              မဖျက်တော့ပါ
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={
                disabled || busy || blocked || !name || confirmation.trim() !== name
              }
              onClick={() => void remove()}
              className="h-auto min-h-11 whitespace-normal py-2 text-xs leading-6"
            >
              {busy ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}
              {busy ? "ဖျက်နေသည်…" : "အတွဲအားလုံး အပြီးဖျက်မည်"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
