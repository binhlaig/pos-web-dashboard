

import { ReactNode } from "react";
import { requireUser } from "@/lib/session";
import SyncUser from "@/components/auth/SyncUser";
import { getServerSession } from "next-auth";           // ✅ real session for Provider
import { authOptions } from "@/lib/auth";
import Provider from "@/lib/provider";
import Header from "@/components/header/header";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const session = await getServerSession(authOptions);

  return (
    <Provider session={session}>
      <main className="min-h-dvh">
        <SyncUser user={user} />
        <Header/>
        {children}
      </main>
    </Provider>
  );
}
