import {
  Suspense,
  type ReactNode,
} from "react";

function AuthLoading() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading...
        </p>
      </div>
    </main>
  );
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