import { Table2 } from "lucide-react";
import BackToDashboardButton from "@/components/BackToDashboardButton";
import { FeaturePageGuard } from "@/components/feature-page-guard";
import { FeaturePlaceholderPage } from "@/components/feature-placeholder-page";

export default function RestaurantTablesPage() {
  return (
    <FeaturePageGuard featureKey="restaurantTablesEnabled">
      <div className="min-h-dvh pt-16 sm:pt-[4.5rem]">
        <BackToDashboardButton compact className="fixed left-4 top-4 z-50" />
        <FeaturePlaceholderPage
          title="Restaurant Tables"
          description="Manage table layout, occupancy, and table-order status."
          icon={Table2}
        />
      </div>
    </FeaturePageGuard>
  );
}
