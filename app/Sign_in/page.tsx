import { LoadingScreen } from "@/components/loading-screen";
import { Suspense } from "react";
import LoginPage from "../(auth)/sign-in/page";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <LoadingScreen title="Loading sign in..." />
      }
    >
      <LoginPage />
    </Suspense>
  );
}
