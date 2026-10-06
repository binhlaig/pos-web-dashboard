"use client";

import { useState } from "react";
import { updateMyShop } from "@/lib/settings-api";
import { getTimezoneIdentity, publishShopTimezone } from "@/lib/date-time";
import { useShopTimezone } from "@/components/shop-timezone-provider";

export function ShopTimezoneSettings({ canEdit }: { canEdit: boolean }) {
  const timezone = useShopTimezone();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function save(value: string) {
    const identity = getTimezoneIdentity();
    setSaving(true); setError("");
    try {
      const shop = await updateMyShop({ timezone: value });
      publishShopTimezone(shop.timezone, identity);
      window.dispatchEvent(new Event("pos-shop-timezone-change"));
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to save timezone"); }
    finally { setSaving(false); }
  }
  return <div className="rounded-2xl border bg-card p-5 my-5">
    <label htmlFor="shop-timezone" className="block font-semibold mb-2">Shop timezone</label>
    <select id="shop-timezone" value={timezone} disabled={!canEdit || saving} onChange={event => void save(event.target.value)} className="rounded-lg border bg-background p-2">
      <option value="Asia/Yangon">Myanmar (Asia/Yangon)</option>
      <option value="Asia/Tokyo">Japan (Asia/Tokyo)</option>
    </select>
    {saving && <p className="text-sm mt-2">Saving…</p>}
    {error && <p role="alert" className="text-sm text-red-600 mt-2">{error}</p>}
  </div>;
}
