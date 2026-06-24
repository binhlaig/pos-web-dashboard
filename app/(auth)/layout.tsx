import { ReactNode } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
    return (
        <main className="min-h-dvh">
            {children}
        </main>
    );
}
