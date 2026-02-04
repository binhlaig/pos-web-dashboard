// lib/screen-config.ts
export type ScreenType = "A" | "B" | "C" | "D"

export const screenConfig: Record<
  ScreenType,
  {
    title: string
    showHero: boolean
    categories: ("Chicken" | "Burger" | "Set" | "Drink")[]
  }
> = {
  A: {
    title: "PROMO & CHICKEN",
    showHero: true,
    categories: ["Chicken"],
  },
  B: {
    title: "BURGERS",
    showHero: false,
    categories: ["Burger"],
  },
  C: {
    title: "SET MENU",
    showHero: false,
    categories: ["Set"],
  },
  D: {
    title: "DRINKS",
    showHero: false,
    categories: ["Drink"],
  },
}
