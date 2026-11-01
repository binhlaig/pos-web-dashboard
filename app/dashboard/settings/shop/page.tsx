import { LoadingScreen } from "@/components/loading-screen";
import { Suspense } from "react";
import { connection } from "next/server";

import ShopSettingsForm from "@/components/settings/shop-settings-form";

function ShopSettingsLoading() {
  return <LoadingScreen variant="section" title="Loading shop settings..." />;
}

export default async function ShopSettingsPage() {
  await connection();

  return (
    <Suspense fallback={<ShopSettingsLoading />}>
      <ShopSettingsForm />
    </Suspense>
  );
}