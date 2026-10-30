"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { archivePackingProduct, executeFactoryDelete, previewFactoryDelete, type FactoryDeletePreview, type FactoryDeletionModule, type PackingIdentity } from "@/lib/factory-deletion-api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: FactoryDeletionModule;
  id: number;
  label: string;
  packingKey?: PackingIdentity;
  onChanged: () => void | Promise<void>;
};

/** The server re-checks eligibility inside DELETE. This UI never assumes a preview grants permission. */
export function FactoryDeleteDialog({ open, onOpenChange, module, id, label, packingKey, onChanged }: Props) {
  const [preview, setPreview] = React.useState<FactoryDeletePreview | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [error, setError] = React.useState("");
  const guard = React.useRef(false);
  const requestId = React.useRef<string | null>(null);
  const cancelled = React.useRef(false);
  const keyFingerprint = JSON.stringify(packingKey ?? null);

  React.useEffect(() => {
    cancelled.current = false;
    if (!open) { setPreview(null); setReason(""); setConfirmation(""); setError(""); requestId.current = null; return; }
    let active = true;
    setLoading(true); setPreview(null); setError(""); setConfirmation(""); requestId.current = null;
    void previewFactoryDelete(module, id, packingKey).then(value => { if (active) setPreview(value); })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : "ဖျက်ခွင့် စစ်ဆေးမရပါ။"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  // The serialized identity changes only when the selected product changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, module, id, keyFingerprint]);

  async function runDelete() {
    if (guard.current || !preview?.allowed || confirmation !== "DELETE" || loading) return;
    guard.current = true; setBusy(true); setError("");
    // Reuse the same request ID for retry after an uncertain response.
    requestId.current ??= crypto.randomUUID();
    try {
      const version = preview.version;
      if (version === undefined) throw new Error("Server version မရပါ။ Refresh ပြန်လုပ်ပါ။");
      const identity = module === "packing-products" ? (preview.identity || packingKey) : undefined;
      if (module === "packing-products" && (!identity?.productions?.length || !identity.productions.every(p => Number.isSafeInteger(p.version)))) throw new Error("Production version မပြည့်စုံပါ။ Preview ပြန်ဖွင့်ပါ။");
      const result = await executeFactoryDelete(module, id, version, requestId.current, reason.trim(), identity);
      if (result.deleted !== true) throw new Error("Server delete response ကို အတည်မပြုနိုင်ပါ။ စာရင်းပြန်စစ်ပါ။");
      await onChanged(); onOpenChange(false);
    } catch (e) { setError(e instanceof Error ? e.message : "ဖျက်၍မရပါ။"); }
    finally { guard.current = false; setBusy(false); }
  }

  async function runArchive() {
    if (guard.current || module !== "packing-products" || !preview || !packingKey || !reason.trim()) return;
    guard.current = true; setBusy(true); setError("");
    try {
      await archivePackingProduct(id, preview.archiveVersion ?? 0, preview.identity ?? packingKey, reason.trim());
      await onChanged(); onOpenChange(false);
    } catch (e) { setError(e instanceof Error ? e.message : "Archive မလုပ်နိုင်ပါ။"); }
    finally { guard.current = false; setBusy(false); }
  }

  return <Dialog open={open} onOpenChange={v => { if (!busy) onOpenChange(v); }}>
    <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
      <DialogHeader><DialogTitle>ပစ္စည်းဖျက်ရန် စစ်ဆေးခြင်း</DialogTitle>
        <DialogDescription>{label} — Backend က Stock နဲ့ ဆက်စပ်မှတ်တမ်းတွေကို စစ်ဆေးပြီးမှ ဖျက်ခွင့်ပေးပါမယ်။</DialogDescription>
      </DialogHeader>
      {loading && <p className="text-sm">ဖျက်ခွင့် စစ်ဆေးနေပါသည်…</p>}
      {preview && <div className="space-y-2 rounded-lg border p-3 text-sm">
        <p className={preview.allowed ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}>{preview.allowed ? "Hard Delete ခွင့်ပြုထားသည်" : `Hard Delete ခွင့်မပြုပါ: ${preview.code ?? "ဆက်စပ်မှတ်တမ်းရှိသည်"}`}</p>
        {preview.message && <p>{preview.message}</p>}
        {preview.allowed && preview.inventory != null && <details><summary>Stock ပြောင်းလဲမှုများ</summary><pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify(preview.inventory, null, 2)}</pre></details>}
        {preview.allowed && preview.records != null && <details><summary>ဖျက်မည့်မှတ်တမ်းများ</summary><pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify(preview.records, null, 2)}</pre></details>}
      </div>}
      <label className="block space-y-2 text-sm">အကြောင်းပြချက်
        <textarea value={reason} onChange={e => setReason(e.target.value.slice(0, 1000))} rows={2} placeholder="ဘာကြောင့် ဖျက်/Archive လုပ်ချင်သလဲ" className="w-full rounded-md border bg-background p-2" disabled={busy} />
      </label>
      {preview?.allowed && <label className="block space-y-2 text-sm">အပြီးဖျက်ရန် `DELETE` ရိုက်ထည့်ပါ
        <input className="w-full rounded-md border bg-background p-2" value={confirmation} onChange={e => setConfirmation(e.target.value)} disabled={busy} autoComplete="off" />
      </label>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>မလုပ်တော့ပါ</Button>
        {module === "packing-products" && preview && !preview.archived && <Button variant="outline" disabled={busy || !reason.trim()} onClick={() => void runArchive()}>Archive</Button>}
        <Button variant="destructive" disabled={!preview?.allowed || confirmation !== "DELETE" || busy} onClick={() => void runDelete()}>{busy ? "လုပ်ဆောင်နေသည်…" : "အပြီးဖျက်မည်"}</Button>
      </div>
    </DialogContent>
  </Dialog>;
}
