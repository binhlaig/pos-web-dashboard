import { ClipboardList } from "lucide-react";
import { FeaturePageGuard } from "@/components/feature-page-guard";
import { FeaturePlaceholderPage } from "@/components/feature-placeholder-page";

export default function TasksPage() {
  return (
    <FeaturePageGuard featureKey="tasksEnabled">
      <FeaturePlaceholderPage
        title="Tasks"
        description="Track daily shop tasks, assignments, and operational follow-ups."
        icon={ClipboardList}
      />
    </FeaturePageGuard>
  );
}
