// import { ReactNode } from "react";
// import SyncUser from "@/components/auth/SyncUser";
// import AuthTokenGuard from "@/components/auth/AuthTokenGuard";
// import AuthTokenSync from "@/components/AuthTokenSync";
// import Header from "@/components/header/header";
// import { DashboardShell } from "@/components/dashboard/dashboard-shell";

// export default async function ProtectedLayout({ children }: { children: ReactNode }) {
//   return (
//     <main className="min-h-dvh">
//       <SyncUser />
//       <AuthTokenSync />
//       {/* <Header /> */}
//       <AuthTokenGuard>
//         <DashboardShell>
//           {children}
//         </DashboardShell>
//       </AuthTokenGuard>
//     </main>
//   );
// }



import {
  Suspense,
  type ReactNode,
} from "react";

import SyncUser from "@/components/auth/SyncUser";
import AuthTokenGuard from "@/components/auth/AuthTokenGuard";
import AuthTokenSync from "@/components/AuthTokenSync";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

function DashboardLoading() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading dashboard...
        </p>
      </div>
    </main>
  );
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
          <DashboardShell>
            {children}
          </DashboardShell>
        </AuthTokenGuard>
      </main>
    </Suspense>
  );
}