"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { KeyRound, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMyPassword } from "@/lib/settings-api";

export function SecuritySettingsCard() {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function savePassword() {
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Confirm password does not match.");
      return;
    }

    try {
      setSaving(true);
      await updateMyPassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Password update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="rounded-2xl border-border/70 bg-background/80 shadow-sm backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-rose-500/10 p-2 text-rose-500">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Change your POS account password.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              autoComplete="current-password"
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              autoComplete="new-password"
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              autoComplete="new-password"
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <KeyRound className="h-4 w-4" />
            Use at least 8 characters.
          </p>
          <Button onClick={savePassword} disabled={saving || !currentPassword || !newPassword || !confirmPassword}>
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Change Password"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
