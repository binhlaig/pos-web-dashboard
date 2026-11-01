import { LoadingScreen } from "@/components/loading-screen";

import {
  Suspense,
  type ReactNode,
} from "react";

import SyncUser from "@/components/auth/SyncUser";
import AuthTokenGuard from "@/components/auth/AuthTokenGuard";
import AuthTokenSync from "@/components/AuthTokenSync";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BusinessAccessGate } from "@/components/factory/BusinessAccessGate";

function DashboardLoading() {
  return <LoadingScreen variant="page" title="Loading dashboard..." />;
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
          <BusinessAccessGate area="dashboard">
            <DashboardShell>
              {children}
            </DashboardShell>
          </BusinessAccessGate>
        </AuthTokenGuard>
      </main>
    </Suspense>
  );
}
