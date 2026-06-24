import { Suspense } from "react";
import LoginPage from "../(auth)/sign-in/page";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
          Loading sign in...
        </div>
      }
    >
      <LoginPage />
    </Suspense>
  );
}
