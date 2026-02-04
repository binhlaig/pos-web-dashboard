// // components/header/header.tsx
// "use client";

// import Link from "next/link";
// import { useEffect, useState, useMemo } from "react";
// import { useSession, signOut } from "next-auth/react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuLabel,
// } from "@/components/ui/dropdown-menu";
// import { Separator } from "@/components/ui/separator";
// import { Bell, LogOut, Settings, User2 } from "lucide-react";

// function initialsFrom(name?: string | null) {
//   if (!name) return "U";
//   const parts = name.trim().split(/\s+/);
//   return (
//     (parts[0]?.[0] ?? "U") +
//     (parts.length > 1
//       ? parts[parts.length - 1]?.[0] ?? ""
//       : parts[0]?.[1] ?? "")
//   ).toUpperCase();
// }

// const FILE_BASE = process.env.NEXT_PUBLIC_API_URL;

// /** 🔐 Radix-based user dropdown (CSR-only render) */
// function UserDropdown({
//   name,
//   email,
//   image,
//   onLogout,
// }: {
//   name: string;
//   email?: string;
//   image?: string;
//   onLogout: () => void;
// }) {
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="ghost"
//           className="h-9 px-2"
//           data-slot="dropdown-menu-trigger"
//         >
//           <div className="flex items-center gap-2">
//             <Avatar className="h-8 w-8">
//               <AvatarImage src={image} alt={name} />
//               <AvatarFallback>{initialsFrom(name)}</AvatarFallback>
//             </Avatar>
         
//             <div className="hidden md:flex flex-col leading-tight text-left">
//               <span className="text-sm font-medium line-clamp-1">{name}</span>
//               {email ? (
//                 <span className="text-[11px] text-muted-foreground line-clamp-1">
//                   {email}
//                 </span>
//               ) : null}
//             </div>
//           </div>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end" className="w-56">
//         <DropdownMenuLabel className="text-xs">
//           Signed in as
//           <div className="font-medium text-sm">{name}</div>
//           {email ? <div className="text-muted-foreground">{email}</div> : null}
//         </DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         <DropdownMenuItem asChild>
//           <Link href="/settings/profile" className="flex items-center">
//             <User2 className="mr-2 h-4 w-4" />
//             Profile
//           </Link>
//         </DropdownMenuItem>
//         <DropdownMenuItem asChild>
//           <Link href="/settings" className="flex items-center">
//             <Settings className="mr-2 h-4 w-4" />
//             Settings
//           </Link>
//         </DropdownMenuItem>
//         <DropdownMenuSeparator />
//         <DropdownMenuItem
//           className="text-red-600 focus:text-red-600"
//           onClick={onLogout}
//         >
//           <LogOut className="mr-2 h-4 w-4" />
//           Log out
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }

// export default function Header() {
//   const { data } = useSession();
//   const user = data?.user as any | undefined;

//   const name = user?.name ?? user?.username ?? "Unknown User";
//   const email = user?.email ?? "";
//   const image = user?.image ?? undefined;
//   const role = user?.role ?? "Staff";
//   const employeeId = user?.employeeId ?? user?.id ?? undefined;

//   /** ✅ Mounted guard — Radix ids are generated on client only */
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);

//   function resolveAvatarUrl(avatarUrl?: string | null) {
//     if (!avatarUrl) return undefined;
//     // already absolute?
//     if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;
//     // make absolute from base
//     if (FILE_BASE) return new URL(avatarUrl, FILE_BASE).href;
//     return undefined; // no base → fallback
//   }

//   const userImage = resolveAvatarUrl(user?.image || user?.avatarUrl);

//   // stable logout callback
//   const onLogout = useMemo(() => () => signOut({ callbackUrl: "/login" }), []);

//   return (
//     <header className="w-full sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
//       <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
//         {/* Left: Brand */}
//         <div className="flex items-center gap-3">
//           <Link href="/dashboard" className="font-semibold tracking-tight">
//             🛒 Supermarket Dashboard
//           </Link>
//           <Separator orientation="vertical" className="h-5 hidden sm:block" />
//           <span className="hidden sm:inline text-xs text-muted-foreground">
//             {role}
//             {employeeId ? ` • #${employeeId}` : ""}
//           </span>
//         </div>

//         {/* Right: Actions */}
//         <div className="flex items-center gap-2">
//           <Button
//             size="icon"
//             variant="ghost"
//             className="h-9 w-9"
//             aria-label="Notifications"
//           >
//             <Bell className="h-5 w-5" />
//           </Button>

//           {/* 🚫 SSR: show deterministic skeleton
//               ✅ CSR (mounted): render Radix Dropdown (prevents id mismatch) */}
//           {user ? (
//             mounted ? (
//               <UserDropdown
//                 name={name}
//                 email={email}
//                 image={image}
//                 onLogout={onLogout}
//               />
//             ) : (
//               <div
//                 aria-hidden
//                 className="h-9 w-[180px] rounded-md bg-muted/60 animate-pulse"
//               />
//             )
//           ) : (
//             <Button asChild size="sm">
//               <Link href="/login">Sign in</Link>
//             </Button>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }





// components/header/header.tsx
"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Bell, LogOut, Settings, User2 } from "lucide-react";
import { ModeToggle } from "../dark-mode";

function initialsFrom(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? "U") +
    (parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : parts[0]?.[1] ?? "")
  ).toUpperCase();
}

// Base URL where /uploads/* is served (e.g. http://localhost:8000 or https://api.example.com)
const FILE_BASE = process.env.NEXT_PUBLIC_API_URL;

/** 🔐 Radix-based user dropdown (CSR-only render) */
function UserDropdown({
  name,
  email,
  image, // <-- now expects a fully resolved absolute URL (or undefined)
  onLogout,
}: {
  name: string;
  email?: string;
  image?: string;
  onLogout: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 px-2" data-slot="dropdown-menu-trigger">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 overflow-hidden">
              {image ? (
                <AvatarImage
                  src={image}
                  alt={name || "user avatar"}
                  onError={(e) => {
                    // hide broken image so fallback shows
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : null}
              <AvatarFallback>{initialsFrom(name)}</AvatarFallback>
            </Avatar>

            <div className="hidden md:flex flex-col leading-tight text-left">
              <span className="text-sm font-medium line-clamp-1">{name}</span>
              {email ? (
                <span className="text-[11px] text-muted-foreground line-clamp-1">
                  {email}
                </span>
              ) : null}
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs">
          Signed in as
          <div className="font-medium text-sm">{name}</div>
          {email ? <div className="text-muted-foreground">{email}</div> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings/profile" className="flex items-center">
            <User2 className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header() {
  const { data } = useSession();
  const user = data?.user as any | undefined;

  const name = user?.name ?? user?.username ?? "Unknown User";
  const email = user?.email ?? "";
  const role = user?.role ?? "Staff";
  const employeeId = user?.employeeId ?? user?.id ?? undefined;

  /** ✅ Mounted guard — Radix ids are generated on client only */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  function resolveAvatarUrl(avatarUrl?: string | null) {
    if (!avatarUrl) return undefined;
    // already absolute?
    if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;
    // make absolute from base
    if (FILE_BASE) return new URL(avatarUrl, FILE_BASE).href;
    return undefined; // no base → fallback to initials
  }

  // resolve relative like "/uploads/users/xxx.jpeg" -> "https://api.example.com/uploads/users/xxx.jpeg"
  const userImage = resolveAvatarUrl(user?.image || user?.avatarUrl);

  // stable logout callback
  const onLogout = useMemo(() => () => signOut({ callbackUrl: "/login" }), []);

  return (
    <header className="w-full sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="font-semibold tracking-tight">
            🛒 Supermarket Dashboard
          </Link>
          <Separator orientation="vertical" className="h-5 hidden sm:block" />
          <span className="hidden sm:inline text-xs text-muted-foreground">
            {role}
            {employeeId ? ` • #${employeeId}` : ""}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <div>
            <ModeToggle/>
          </div>
          <Button size="icon" variant="ghost" className="h-9 w-9" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>

          {user ? (
            mounted ? (
              // ⬇️ pass the RESOLVED URL
              <UserDropdown name={name} email={email} image={userImage} onLogout={onLogout} />
            ) : (
              <div aria-hidden className="h-9 w-[180px] rounded-md bg-muted/60 animate-pulse" />
            )
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

