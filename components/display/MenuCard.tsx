
// "use client"

// import Image from "next/image"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"

// type Props = {
//   name: string
//   price: number
//   image: string
//   badge?: string
// }

// export default function MenuCard({ name, price, image, badge }: Props) {
//   return (
//     <Card className="group relative overflow-hidden border-border bg-card/70 backdrop-blur-xl">
//       {/* shine */}
//       <div className="pointer-events-none absolute -left-24 -top-24 h-48 w-48 rounded-full bg-foreground/10 blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
//       <div className="pointer-events-none absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-foreground/10 blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

//       <div className="relative aspect-[4/3] w-full">
//         <Image
//           src={image}
//           alt={name}
//           fill
//           className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
//           sizes="(max-width: 1280px) 25vw, 20vw"
//         />
//         {/* overlay */}
//         <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/10 to-transparent" />
//         <div className="absolute inset-0 ring-1 ring-inset ring-foreground/10" />

//         {badge ? (
//           <div className="absolute left-3 top-3">
//             <Badge className="border border-foreground/10 bg-background/70 text-foreground backdrop-blur">
//               {badge}
//             </Badge>
//           </div>
//         ) : null}

//         {/* price pill */}
//         <div className="absolute bottom-3 right-3 rounded-xl border border-foreground/10 bg-background/75 px-3 py-2 text-xl font-black text-foreground shadow-sm backdrop-blur">
//           ¥{price.toLocaleString()}
//         </div>
//       </div>

//       <div className="p-4">
//         <div className="flex items-start justify-between gap-3">
//           <div className="min-w-0">
//             <div className="truncate text-lg font-semibold text-foreground">
//               {name}
//             </div>
//             <div className="mt-1 text-sm text-muted-foreground">
//               Fresh • Fast • Delicious
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* bottom accent line */}
//       <div className="h-1 w-full bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
//     </Card>
//   )
// }






"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Props = {
  name: string
  price: number
  image: string
  badge?: string
}

export default function MenuCard({ name, price, image, badge }: Props) {
  return (
    <Card className="group relative overflow-hidden border-border bg-card/70 backdrop-blur-xl">
      {/* shine */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-48 w-48 rounded-full bg-foreground/10 blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-foreground/10 blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

      <div className="relative aspect-[4/3] w-full">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          sizes="(max-width: 1280px) 25vw, 20vw"
        />
        {/* overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/10 to-transparent" />
        <div className="absolute inset-0 ring-1 ring-inset ring-foreground/10" />

        {badge ? (
          <div className="absolute left-3 top-3">
            <Badge className="border border-foreground/10 bg-background/70 text-foreground backdrop-blur">
              {badge}
            </Badge>
          </div>
        ) : null}

        {/* price pill */}
        <div className="absolute bottom-3 right-3 rounded-xl border border-foreground/10 bg-background/75 px-3 py-2 text-xl font-black text-foreground shadow-sm backdrop-blur">
          ¥{price.toLocaleString()}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-lg font-semibold text-foreground">
              {name}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Fresh • Fast • Delicious
            </div>
          </div>
        </div>
      </div>

      {/* bottom accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
    </Card>
  )
}
