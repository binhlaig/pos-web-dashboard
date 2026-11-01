import { LoadingScreen } from "@/components/loading-screen";

import {
  Suspense,
  type ReactNode,
} from "react";

import SyncUser from "@/components/auth/SyncUser";
import AuthTokenGuard from "@/components/auth/AuthTokenGuard";
import AuthTokenSync from "@/components/AuthTokenSync";
import { FactoryShell } from "@/components/factory/FactoryShell";
import { BusinessAccessGate } from "@/components/factory/BusinessAccessGate";


function DashboardLoading() {
  return <LoadingScreen variant="page" title="Loading factory dashboard..." />;
}

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <main className="min-h-dvh">
        <SyncUser />

        <AuthTokenSync />

        <AuthTokenGuard>
          <BusinessAccessGate>
            <FactoryShell>
              {children}
            </FactoryShell>
          </BusinessAccessGate>
        </AuthTokenGuard>
      </main>
    </Suspense>
  );
}
