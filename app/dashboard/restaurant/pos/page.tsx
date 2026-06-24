import { Utensils } from "lucide-react";
import BackToDashboardButton from "@/components/BackToDashboardButton";
import { FeaturePageGuard } from "@/components/feature-page-guard";
import { FeaturePlaceholderPage } from "@/components/feature-placeholder-page";

export default function RestaurantPosPage() {
  return (
    <FeaturePageGuard featureKey="restaurantPosEnabled">
      <div className="min-h-dvh pt-16 sm:pt-[4.5rem]">
        <BackToDashboardButton compact className="fixed left-4 top-4 z-50" />
        <FeaturePlaceholderPage
          title="Restaurant POS"
          description="Open the restaurant order-taking workspace for dine-in and takeaway service."
          icon={Utensils}
        />
      </div>
    </FeaturePageGuard>
  );
}
