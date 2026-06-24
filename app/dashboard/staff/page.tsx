import { Users } from "lucide-react";
import { FeaturePageGuard } from "@/components/feature-page-guard";
import { FeaturePlaceholderPage } from "@/components/feature-placeholder-page";

export default function StaffPage() {
  return (
    <FeaturePageGuard featureKey="staffEnabled">
      <FeaturePlaceholderPage
        title="Staff"
        description="Manage shop owner staff access, roles, and team records from this workspace."
        icon={Users}
      />
    </FeaturePageGuard>
  );
}
