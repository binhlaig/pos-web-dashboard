// // app/(protected)/layout.tsx
// import { ReactNode } from "react";
// import { requireUser } from "@/lib/session";
// import SyncUser from "@/components/auth/SyncUser"; // optional: client preview sync

// export default async function ProtectedLayout({ children }: { children: ReactNode }) {
//   const user = await requireUser(); // no user → redirects to /login
//   return (
//     <main className="min-h-dvh">
//       {/* optional: keep client-side preview of user */}
//       <SyncUser user={user} />
//       {children}
//     </main>
//   );
// }








import { ReactNode } from "react";
import { requireUser } from "@/lib/session";
import SyncUser from "@/components/auth/SyncUser";
import { getServerSession } from "next-auth";           // ✅ real session for Provider
import { authOptions } from "@/lib/auth";
import Provider from "@/lib/provider";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  // Server-side guard (unauth → redirect /login)
  const user = await requireUser();

  // Provider အတွက် full session (expires ပါတဲ့ object) ကို ယူထားပါ
  const session = await getServerSession(authOptions);

  return (
    <Provider session={session}>
      <main className="min-h-dvh">
        {/* optional: client-side sync/preview */}
        <SyncUser user={user} />
        {children}
      </main>
    </Provider>
  );
}
