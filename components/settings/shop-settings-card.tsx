"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { LockKeyhole, Save, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateMyShop, type ShopSettings } from "@/lib/settings-api";

function isAdminRole(role?: string | null) {
  return String(role || "").replace(/^ROLE_/i, "").toUpperCase() === "ADMIN";
}

export function ShopSettingsCard({
  initialShop,
  role,
}: {
  initialShop: ShopSettings;
  role?: string | null;
}) {
  const [shop, setShop] = React.useState<ShopSettings>(initialShop);
  const [saving, setSaving] = React.useState(false);
  const canEdit = isAdminRole(role);

  React.useEffect(() => setShop(initialShop), [initialShop]);

  async function saveShop() {
    if (!canEdit) {
      toast.error("Only ADMIN users can edit shop settings.");
      return;
    }

    try {
      setSaving(true);
      const saved = await updateMyShop({
        shopName: shop.shopName,
        address: shop.address,
        phone: shop.phone,
      });
      setShop((prev) => ({ ...prev, ...saved }));
      toast.success("Shop settings updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Shop update failed");
    } finally {
      setSaving(false);
    }
  }

  const editableClass = !canEdit ? "bg-muted/50" : "";

  return (
    <Card className="rounded-2xl border-border/70 bg-background/80 shadow-sm backdrop-blur">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500">
              <Store className="h-5 w-5" />
            </span>
            <div>
              <CardTitle>Shop Settings</CardTitle>
              <CardDescription>Business details shown across the POS.</CardDescription>
            </div>
          </div>
          {!canEdit ? (
            <Badge variant="outline" className="gap-1">
              <LockKeyhole className="h-3 w-3" />
              Read only
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="shop-name">Shop Name</Label>
            <Input
              id="shop-name"
              value={shop.shopName || ""}
              readOnly={!canEdit}
              className={editableClass}
              onChange={(event) => setShop((prev) => ({ ...prev, shopName: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-phone">Phone</Label>
            <Input
              id="shop-phone"
              value={shop.phone || ""}
              readOnly={!canEdit}
              className={editableClass}
              onChange={(event) => setShop((prev) => ({ ...prev, phone: event.target.value }))}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shop-address">Address</Label>
            <Textarea
              id="shop-address"
              value={shop.address || ""}
              readOnly={!canEdit}
              className={editableClass}
              onChange={(event) => setShop((prev) => ({ ...prev, address: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-business-type">Business Type</Label>
            <Input id="shop-business-type" value={shop.businessType || ""} readOnly className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-status">Shop Status</Label>
            <Input id="shop-status" value={shop.shopStatus || ""} readOnly className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shop-plan">Subscription Plan</Label>
            <Input id="shop-plan" value={shop.subscriptionPlan || ""} readOnly className="bg-muted/50" />
          </div>
        </div>

        <Button onClick={saveShop} disabled={!canEdit || saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Shop"}
        </Button>
      </CardContent>
    </Card>
  );
}
