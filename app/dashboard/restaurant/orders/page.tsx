import { Receipt } from "lucide-react";
import { FeaturePageGuard } from "@/components/feature-page-guard";
import { FeaturePlaceholderPage } from "@/components/feature-placeholder-page";

export default function RestaurantOrdersPage() {
  return (
    <FeaturePageGuard featureKey="restaurantOrdersEnabled">
      <FeaturePlaceholderPage
        title="Restaurant Orders"
        description="Review restaurant order history, active tickets, and service totals."
        icon={Receipt}
      />
    </FeaturePageGuard>
  );
}
