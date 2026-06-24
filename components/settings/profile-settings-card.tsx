"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Camera, Save, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPosUser, savePosSession } from "@/lib/auth-session";
import {
  updateMyProfile,
  uploadMyAvatar,
  type ProfileSettings,
} from "@/lib/settings-api";

function pickAvatar(data: ProfileSettings) {
  return data.avatarUrl || data.imageUrl || "";
}

export function ProfileSettingsCard({
  initialProfile,
}: {
  initialProfile: ProfileSettings;
}) {
  const [profile, setProfile] = React.useState<ProfileSettings>(initialProfile);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => setProfile(initialProfile), [initialProfile]);

  const initials = String(profile.username || "U").slice(0, 2).toUpperCase();

  async function saveProfile() {
    try {
      setSaving(true);
      const saved = await updateMyProfile({ username: profile.username });
      const next = { ...profile, ...saved };
      setProfile(next);
      const currentUser = getPosUser();
      savePosSession({
        accessToken: localStorage.getItem("pos_access_token"),
        user: {
          ...currentUser,
          username: next.username || currentUser?.username,
          name: next.username || currentUser?.name,
          role: next.role || currentUser?.role,
          shopCode: next.shopCode || currentUser?.shopCode,
          image: pickAvatar(next) || currentUser?.image,
          imageUrl: pickAvatar(next) || currentUser?.imageUrl,
        },
      });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile update failed");
    } finally {
      setSaving(false);
    }
  }

  async function onAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("avatar", file);
      const saved = await uploadMyAvatar(fd);
      const next = { ...profile, ...saved };
      setProfile(next);
      const currentUser = getPosUser();
      savePosSession({
        accessToken: localStorage.getItem("pos_access_token"),
        user: {
          ...currentUser,
          image: pickAvatar(next) || currentUser?.image,
          imageUrl: pickAvatar(next) || currentUser?.imageUrl,
        },
      });
      toast.success("Avatar uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Avatar upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <Card className="rounded-2xl border-border/70 bg-background/80 shadow-sm backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-primary/10 p-2 text-primary">
            <UserRound className="h-5 w-5" />
          </span>
          <div>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Your POS account identity.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20 border">
            <AvatarImage src={pickAvatar(profile)} alt={profile.username || "User avatar"} />
            <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Camera className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Avatar"}
            </Button>
            <p className="text-xs text-muted-foreground">PNG, JPG, or WebP works best.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-username">Username</Label>
            <Input
              id="profile-username"
              value={profile.username || ""}
              onChange={(event) => setProfile((prev) => ({ ...prev, username: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-role">Role</Label>
            <Input id="profile-role" value={profile.role || ""} readOnly className="bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-shop-code">Shop Code</Label>
            <Input id="profile-shop-code" value={profile.shopCode || ""} readOnly className="bg-muted/50" />
          </div>
        </div>

        <Button onClick={saveProfile} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </CardContent>
    </Card>
  );
}
