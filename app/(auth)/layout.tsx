import { LoadingScreen } from "@/components/loading-screen";
import {
  Suspense,
  type ReactNode,
} from "react";

function AuthLoading() {
  return <LoadingScreen variant="page" title="Loading..." />;
}

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <main className="min-h-dvh">
        {children}
      </main>
    </Suspense>
  );
}