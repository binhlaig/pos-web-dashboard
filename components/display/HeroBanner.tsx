// "use client"

// import Image from "next/image"
// import { useEffect, useMemo, useState } from "react"
// import { Badge } from "@/components/ui/badge"

// type Promo = {
//   id: string
//   title: string
//   subtitle?: string
//   priceText?: string
//   badge?: string
//   image: string
// }

// export default function HeroBanner({
//   promos,
//   intervalMs = 4500,
// }: {
//   promos: Promo[]
//   intervalMs?: number
// }) {
//   const safePromos = useMemo(() => promos ?? [], [promos])
//   const [index, setIndex] = useState(0)

//   useEffect(() => {
//     if (safePromos.length <= 1) return
//     const t = setInterval(() => {
//       setIndex((p) => (p + 1) % safePromos.length)
//     }, intervalMs)
//     return () => clearInterval(t)
//   }, [safePromos.length, intervalMs])

//   const p = safePromos[index]
//   if (!p) return null

//   return (
//     <div className="relative h-[38vh] min-h-[280px] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5">
//       <Image
//         src={p.image}
//         alt={p.title}
//         fill
//         className="object-cover"
//         priority
//         sizes="100vw"
//       />
//       <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
//       <div className="absolute inset-0 p-6 md:p-10">
//         <div className="flex h-full flex-col justify-between">
//           <div className="flex items-center gap-2">
//             {p.badge ? (
//               <Badge className="bg-white/15 text-white hover:bg-white/20">
//                 {p.badge}
//               </Badge>
//             ) : null}
//             <span className="text-sm text-white/70">Digital Menu Board</span>
//           </div>

//           <div className="max-w-2xl">
//             <div className="text-4xl font-extrabold tracking-tight text-white md:text-6xl">
//               {p.title}
//             </div>
//             {p.subtitle ? (
//               <div className="mt-2 text-lg text-white/80 md:text-2xl">
//                 {p.subtitle}
//               </div>
//             ) : null}

//             {p.priceText ? (
//               <div className="mt-5 inline-flex items-baseline gap-3 rounded-xl border border-white/10 bg-black/35 px-4 py-3">
//                 <span className="text-sm text-white/70">From</span>
//                 <span className="text-3xl font-black text-white md:text-4xl">
//                   {p.priceText}
//                 </span>
//               </div>
//             ) : null}
//           </div>

//           <div className="flex items-center gap-2">
//             {safePromos.map((_, i) => (
//               <div
//                 key={i}
//                 className={[
//                   "h-1.5 w-10 rounded-full border border-white/20",
//                   i === index ? "bg-white/70" : "bg-white/10",
//                 ].join(" ")}
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }




"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"

type Promo = {
  id: string
  title: string
  subtitle?: string
  priceText?: string
  badge?: string
  image: string
}

export default function HeroBanner({
  promos,
  intervalMs = 4500,
}: {
  promos: Promo[]
  intervalMs?: number
}) {
  const safePromos = useMemo(() => promos ?? [], [promos])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (safePromos.length <= 1) return
    const t = setInterval(() => {
      setIndex((p) => (p + 1) % safePromos.length)
    }, intervalMs)
    return () => clearInterval(t)
  }, [safePromos.length, intervalMs])

  const p = safePromos[index]
  if (!p) return null

  return (
    <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden rounded-3xl border border-border bg-card/60 shadow-sm backdrop-blur-xl">
      <Image
        src={p.image}
        alt={p.title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_60%,rgba(255,255,255,0.10),transparent_50%)]" />
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.55)]" />

      {/* subtle dotted pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:18px_18px]" />

      <div className="absolute inset-0 p-6 md:p-10">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center gap-2">
            {p.badge ? (
              <Badge className="border border-foreground/10 bg-background/70 text-foreground backdrop-blur">
                {p.badge}
              </Badge>
            ) : null}
            <span className="text-sm text-muted-foreground">
              Digital Menu Board
            </span>
          </div>

          <div className="max-w-3xl">
            <div className="text-4xl font-black tracking-tight text-foreground md:text-6xl">
              {p.title}
            </div>
            {p.subtitle ? (
              <div className="mt-2 text-lg text-muted-foreground md:text-2xl">
                {p.subtitle}
              </div>
            ) : null}

            {p.priceText ? (
              <div className="mt-5 inline-flex items-baseline gap-3 rounded-2xl border border-foreground/10 bg-background/70 px-5 py-4 shadow-sm backdrop-blur">
                <span className="text-sm text-muted-foreground">From</span>
                <span className="text-3xl font-black text-foreground md:text-4xl">
                  {p.priceText}
                </span>
              </div>
            ) : null}
          </div>

          {/* progress */}
          <div className="flex items-center gap-2">
            {safePromos.map((_, i) => (
              <div
                key={i}
                className={[
                  "h-1.5 w-12 rounded-full border border-foreground/10",
                  i === index ? "bg-foreground/35" : "bg-foreground/10",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
