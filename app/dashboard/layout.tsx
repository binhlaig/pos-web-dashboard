import { ReactNode } from "react";
import SyncUser from "@/components/auth/SyncUser";
import AuthTokenGuard from "@/components/auth/AuthTokenGuard";
import AuthTokenSync from "@/components/AuthTokenSync";
import Header from "@/components/header/header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-dvh">
      <SyncUser />
      <AuthTokenSync />
      {/* <Header /> */}
      <AuthTokenGuard>
        <DashboardShell>
          {children}
        </DashboardShell>
      </AuthTokenGuard>
    </main>
  );
}
