"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { ReceiptText, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  updateReceiptSettings,
  type ReceiptSettings,
} from "@/lib/settings-api";

export function ReceiptSettingsCard({
  initialSettings,
}: {
  initialSettings: ReceiptSettings;
}) {
  const [settings, setSettings] = React.useState<ReceiptSettings>(initialSettings);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => setSettings(initialSettings), [initialSettings]);

  function update(key: keyof ReceiptSettings, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function saveReceiptSettings() {
    try {
      setSaving(true);
      const payload = {
        ...settings,
        taxRatePercent: Number(settings.taxRatePercent || 0),
        currencyDecimalDigits: Number(settings.currencyDecimalDigits || 0),
      };
      const saved = await updateReceiptSettings(payload);
      setSettings((prev) => ({ ...prev, ...saved }));
      toast.success("Receipt settings updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Receipt settings update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="rounded-2xl border-border/70 bg-background/80 shadow-sm backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
            <ReceiptText className="h-5 w-5" />
          </span>
          <div>
            <CardTitle>Receipt & Printer Settings</CardTitle>
            <CardDescription>Receipt header, footer, tax, and currency format.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="receipt-shop-name">Receipt Shop Name</Label>
            <Input id="receipt-shop-name" value={settings.shopName || ""} onChange={(e) => update("shopName", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receipt-phone">Phone</Label>
            <Input id="receipt-phone" value={settings.phone || ""} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receipt-second-phone">Second Phone</Label>
            <Input id="receipt-second-phone" value={settings.secondPhone || ""} onChange={(e) => update("secondPhone", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receipt-tax">Tax Rate Percent</Label>
            <Input id="receipt-tax" type="number" min="0" step="0.01" value={settings.taxRatePercent ?? ""} onChange={(e) => update("taxRatePercent", e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="receipt-address">Address</Label>
            <Textarea id="receipt-address" value={settings.address || ""} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="receipt-footer">Footer Message</Label>
            <Textarea id="receipt-footer" value={settings.footerMessage || ""} onChange={(e) => update("footerMessage", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency-code">Currency Code</Label>
            <Input id="currency-code" value={settings.currencyCode || ""} onChange={(e) => update("currencyCode", e.target.value.toUpperCase())} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency-symbol">Currency Symbol</Label>
            <Input id="currency-symbol" value={settings.currencySymbol || ""} onChange={(e) => update("currencySymbol", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency-digits">Currency Decimal Digits</Label>
            <Input id="currency-digits" type="number" min="0" max="6" value={settings.currencyDecimalDigits ?? ""} onChange={(e) => update("currencyDecimalDigits", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Currency Position</Label>
            <Select value={settings.currencyPosition || "BEFORE"} onValueChange={(value) => update("currencyPosition", value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BEFORE">Before amount</SelectItem>
                <SelectItem value="AFTER">After amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={saveReceiptSettings} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Receipt Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
