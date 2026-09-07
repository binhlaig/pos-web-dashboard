import { Suspense } from "react";
import { connection } from "next/server";

import ShopSettingsForm from "@/components/settings/shop-settings-form";

function ShopSettingsLoading() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />

        <p className="text-sm text-slate-500">
          Loading shop settings...
        </p>
      </div>
    </div>
  );
}

export default async function ShopSettingsPage() {
  await connection();

  return (
    <Suspense fallback={<ShopSettingsLoading />}>
      <ShopSettingsForm />
    </Suspense>
  );
}