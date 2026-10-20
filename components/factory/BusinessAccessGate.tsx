"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { clearPosSession } from "@/lib/auth-session";
import { clearAuthTokens } from "@/lib/auth";
import { loadBusinessAccess, type BusinessAccess } from "@/lib/business-access";
import { destinationForBusinessType } from "@/lib/business-routing";

export function BusinessAccessGate({ children, entry = false }: { children?: ReactNode; entry?: boolean }) {
  const { status, data: session } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const callback = params.get("next") || params.get("callbackUrl");
  const [attempt, setAttempt] = useState(0);
  const [access, setAccess] = useState<BusinessAccess | null>(null);
  // Bind the result to the current session so an account change cannot flash old content.
  const identity = JSON.stringify([session?.user ?? null, (session as { accessToken?: string } | null)?.accessToken]);
  const [checkedIdentity, setCheckedIdentity] = useState("");
  useEffect(() => {
    if (status === "loading") return;
    let active = true;
    const controller = new AbortController();
    async function check() {
      const result = status === "unauthenticated" ? { kind: "unauthenticated" } as const : await loadBusinessAccess(fetch, controller.signal);
      if (!active) return;
      if (result.kind === "unauthenticated") {
        // Clear the NextAuth cookie as well as local tokens to avoid middleware login loops.
        clearPosSession(); clearAuthTokens();
        await signOut({ redirect: false });
        if (active) router.replace(`/Sign_in?next=${encodeURIComponent(entry ? callback || "/" : window.location.pathname + window.location.search)}`);
        return;
      }
      setCheckedIdentity(identity);
      setAccess(result);
      if (entry && result.kind === "ready") {
        const destination = destinationForBusinessType(result.businessType, callback);
        if (destination) router.replace(destination);
      }
    }
    void check();
    return () => { active = false; controller.abort(); };
  }, [status, identity, attempt, router, entry, callback]);
  function retry() { setAccess(null); setAttempt(value => value + 1); }
  if (status !== "authenticated" || checkedIdentity !== identity || !access || (entry && access.kind === "ready")) {
    return <div className="flex min-h-dvh items-center justify-center bg-background p-6 text-foreground" role="status">Checking business access…</div>;
  }
  if (access.kind === "ready" && access.businessType === "FACTORY") return <>{children}</>;
  const isError = access.kind === "error";
  const unknown = access.kind === "unknown";
  return <section className="flex min-h-dvh items-center justify-center bg-background p-6 text-foreground">
    <div className="w-full max-w-lg rounded-2xl border p-6" role="alert">
      <h1 className="text-xl font-semibold">{isError ? "Access check failed" : unknown ? "Business Type မသိရှိရသေးပါ" : "Access denied"}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{isError ? "Backend ကို ဆက်သွယ်၍ မရပါ။ ပြန်လည်ကြိုးစားပါ။" : unknown ? "Account ၏ Business Type ကို Official / Super Admin ထံ စစ်ဆေးပေးရန် ဆက်သွယ်ပါ။" : "Factory account ဖြင့်သာ ဝင်ရောက်နိုင်ပါသည်။"}</p>
      {(isError || unknown) && <button className="mt-5 rounded-lg border px-4 py-2" onClick={retry}>Retry</button>}
      <button className="ml-3 mt-5 rounded-lg border px-4 py-2" onClick={async () => { clearPosSession(); clearAuthTokens(); await signOut({ callbackUrl: "/Sign_in" }); }}>Sign out</button>
    </div>
  </section>;
}
