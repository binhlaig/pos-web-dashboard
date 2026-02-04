// data/menu-board.ts
export type Promo = {
    id: string
    title: string
    subtitle?: string
    priceText?: string
    badge?: string
    image: string
  }
  
  export type MenuItem = {
    id: string
    name: string
    price: number
    image: string
    badge?: string
    category: "Chicken" | "Burger" | "Set" | "Drink"
  }
  
  export const promos: Promo[] = [
    {
      id: "p1",
      title: "Zinger Box",
      subtitle: "Limited Time • Free Drink",
      priceText: "¥890",
      badge: "HOT",
      image:
        "https://images.unsplash.com/photo-1606755456206-b25206cde27e?auto=format&fit=crop&w=1600&q=70",
    },
    {
      id: "p2",
      title: "Family Set",
      subtitle: "For 3–4 persons",
      priceText: "¥2,490",
      badge: "BEST",
      image:
        "https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=1600&q=70",
    },
    {
      id: "p3",
      title: "Double Burger",
      subtitle: "Extra cheese included",
      priceText: "¥680",
      badge: "NEW",
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1600&q=70",
    },
  ]
  
  export const menuItems: MenuItem[] = [
    // Chicken
    {
      id: "c1",
      name: "Original Chicken",
      price: 320,
      badge: "Best",
      category: "Chicken",
      image:
        "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1200&q=70",
    },
    {
      id: "c2",
      name: "Spicy Chicken",
      price: 350,
      badge: "Spicy",
      category: "Chicken",
      image:
        "https://images.unsplash.com/photo-1626082926389-6cd097cdc6ec?auto=format&fit=crop&w=1200&q=70",
    },
    {
      id: "c3",
      name: "Chicken Tenders",
      price: 420,
      category: "Chicken",
      image:
        "https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=1200&q=70",
    },
  
    // Burger
    {
      id: "b1",
      name: "Zinger Burger",
      price: 450,
      badge: "Top",
      category: "Burger",
      image:
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=70",
    },
    {
      id: "b2",
      name: "Cheese Burger",
      price: 420,
      category: "Burger",
      image:
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=70",
    },
  
    // Set
    {
      id: "s1",
      name: "Chicken Set (M)",
      price: 890,
      badge: "Value",
      category: "Set",
      image:
        "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=1200&q=70",
    },
    {
      id: "s2",
      name: "Burger Set (M)",
      price: 850,
      category: "Set",
      image:
        "https://images.unsplash.com/photo-1618213837799-25d5552820d3?auto=format&fit=crop&w=1200&q=70",
    },
  
    // Drink
    {
      id: "d1",
      name: "Cola",
      price: 180,
      category: "Drink",
      image:
        "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=1200&q=70",
    },
    {
      id: "d2",
      name: "Iced Coffee",
      price: 220,
      badge: "Cold",
      category: "Drink",
      image:
        "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=70",
    },
  ]
  