
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {

      const session = await getServerSession( authOptions);
    if(session){
        return redirect("/")
    }

    return (

        <main className="min-h-dvh">
            {children}
        </main>
    );
}
