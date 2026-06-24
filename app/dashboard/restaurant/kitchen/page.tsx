import { Soup } from "lucide-react";
import BackToDashboardButton from "@/components/BackToDashboardButton";
import { FeaturePageGuard } from "@/components/feature-page-guard";
import { FeaturePlaceholderPage } from "@/components/feature-placeholder-page";

export default function RestaurantKitchenPage() {
  return (
    <FeaturePageGuard featureKey="restaurantKitchenEnabled">
      <div className="min-h-dvh pt-16 sm:pt-[4.5rem]">
        <BackToDashboardButton compact className="fixed left-4 top-4 z-50" />
        <FeaturePlaceholderPage
          title="Restaurant Kitchen"
          description="Monitor kitchen tickets, preparation status, and order flow."
          icon={Soup}
        />
      </div>
    </FeaturePageGuard>
  );
}
