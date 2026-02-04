// // 

// "use client"

// import { useSearchParams } from "next/navigation"
// import HeroBanner from "@/components/display/HeroBanner"
// import MenuCard from "@/components/display/MenuCard"
// import { screenConfig, ScreenType } from "@/lib/screen-config"
// import { menuItems, promos } from "@/lib/data/menu-board"

// export default function DisplayPage() {
//   const searchParams = useSearchParams()
//   const screen = (searchParams.get("screen") || "A") as ScreenType

//   const config = screenConfig[screen] ?? screenConfig.A

//   const filteredItems = menuItems.filter((item) =>
//     config.categories.includes(item.category)
//   )

//   return (
//     <div className="min-h-screen bg-[#070A12] text-white">
//       <div className="mx-auto max-w-[1600px] px-6 py-6">
//         {/* Header */}
//         <div className="mb-4 flex items-center justify-between">
//           <div>
//             <div className="text-3xl font-extrabold tracking-tight">
//               {config.title}
//             </div>
//             <div className="text-sm text-white/60">
//               Screen {screen} • Digital Menu Board
//             </div>
//           </div>

//           <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm">
//             TV SCREEN {screen}
//           </div>
//         </div>

//         {/* Hero Banner (Screen A only) */}
//         {config.showHero && (
//           <div className="mb-6">
//             <HeroBanner promos={promos} />
//           </div>
//         )}

//         {/* Menu Grid */}
//         <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
//           {filteredItems.map((item) => (
//             <MenuCard
//               key={item.id}
//               name={item.name}
//               price={item.price}
//               image={item.image}
//               badge={item.badge}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }





"use client"

import { Key, useMemo, useState } from "react"
import HeroBanner from "@/components/display/HeroBanner"
import MenuCard from "@/components/display/MenuCard"
import ThemeToggle from "@/components/display/ThemeToggle"
import { promos, menuItems } from "@/lib/data/menu-board"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Cat = "All" | "Chicken" | "Burger" | "Set" | "Drink"

export default function DisplayPage() {
  const [cat, setCat] = useState<Cat>("All")

  const filtered = useMemo(() => {
    if (cat === "All") return menuItems
    return menuItems.filter((x) => x.category === cat)
  }, [cat])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* premium background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-foreground/10 blur-3xl opacity-70" />
        <div className="absolute -right-40 top-16 h-[32rem] w-[32rem] rounded-full bg-foreground/10 blur-3xl opacity-70" />
        <div className="absolute left-1/3 -bottom-40 h-[34rem] w-[34rem] rounded-full bg-foreground/10 blur-3xl opacity-60" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.65)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.65)_1px,transparent_1px)] [background-size:64px_64px]" />
      </div>

      <div className="relative mx-auto max-w-[1700px] px-6 py-6">
        {/* glass header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-background/70 px-5 py-4 shadow-sm backdrop-blur-xl">
          <div className="min-w-0">
            <div className="text-2xl font-black tracking-tight md:text-3xl">
              Supermarket POS • Menu Display
            </div>
            <div className="mt-1 text-sm text-muted-foreground md:text-base">
              Premium signage UI • Dark/Light • TV Ready
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Tabs value={cat} onValueChange={(v) => setCat(v as Cat)}>
              <TabsList className="border border-border bg-background/70 backdrop-blur">
                <TabsTrigger value="All">All</TabsTrigger>
                <TabsTrigger value="Chicken">Chicken</TabsTrigger>
                <TabsTrigger value="Burger">Burger</TabsTrigger>
                <TabsTrigger value="Set">Set</TabsTrigger>
                <TabsTrigger value="Drink">Drink</TabsTrigger>
              </TabsList>
            </Tabs>

            <ThemeToggle />
          </div>
        </div>

        <HeroBanner promos={promos} intervalMs={4500} />

        {/* section bar */}
        <div className="mt-7 mb-4 flex items-end justify-between gap-3">
          <div>
            <div className="text-xl font-bold">
              {cat === "All" ? "Featured Items" : `${cat} Menu`}
            </div>
            <div className="text-sm text-muted-foreground">
              {filtered.length} items • Updated live (demo)
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground shadow-sm backdrop-blur">
            Tip: TV fullscreen (F11) + Kiosk mode
          </div>
        </div>

        {/* grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
          {filtered.map((it: { id: Key | null | undefined; name: string; price: number; image: string; badge: string | undefined }) => (
            <MenuCard
              key={it.id}
              name={it.name}
              price={it.price}
              image={it.image}
              badge={it.badge}
            />
          ))}
        </div>

        {/* footer */}
        <div className="mt-7 rounded-3xl border border-border bg-background/70 px-5 py-4 text-sm text-muted-foreground shadow-sm backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>© Menu Board • Next.js + shadcn/ui</span>
            <span>Mode: Dark/Light • Smooth & readable on TV</span>
          </div>
        </div>
      </div>
    </div>
  )
}
