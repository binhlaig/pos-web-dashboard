"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SaveBar({
  dirty = true,
  saving = false,
  onReset,
  onSave,
}: {
  dirty?: boolean;
  saving?: boolean;
  onReset?: () => void;
  onSave?: () => void;
}) {
  return (
    <div className="sticky top-4 z-20 mb-4 flex items-center justify-between rounded-2xl border bg-background/95 p-3 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <Badge variant={dirty ? "secondary" : "outline"}>
          {dirty ? "Unsaved changes" : "Saved"}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Review and save your updates
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onReset} disabled={saving}>
          Reset
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}