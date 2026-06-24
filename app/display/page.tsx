
// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import {
//   Award,
//   ChevronLeft,
//   ChevronRight,
//   Clock,
//   Eye,
//   Flame,
//   Layers,
//   MonitorSmartphone,
//   Moon,
//   Pause,
//   Play,
//   QrCode,
//   Radio,
//   RefreshCcw,
//   Settings2,
//   ShieldCheck,
//   SkipForward,
//   Sliders,
//   Sparkles,
//   Star,
//   Sun,
//   Timer,
//   TrendingUp,
//   Tv2,
//   UtensilsCrossed,
//   Wifi,
//   WifiOff,
//   Zap,
// } from "lucide-react";

// type Cat = "All" | "Chicken" | "Burger" | "Set" | "Drink";
// type Badge = "New" | "Hot" | "Special" | "Best";
// type Effect3D = "orbit" | "flip" | "zDepth" | "carousel" | "warp" | "scatter";

// interface MenuItem {
//   id: number;
//   name: string;
//   nameJp?: string;
//   price: number;
//   category: Exclude<Cat, "All">;
//   badge?: Badge;
//   desc: string;
//   calories?: number | null;
//   emoji: string;
//   featured?: boolean;
//   image?: string;
//   available?: boolean;
//   spicyLevel?: 0 | 1 | 2 | 3;
// }

// interface Promo {
//   id: number;
//   title: string;
//   subtitle: string;
//   tag: string;
//   price?: string;
//   emoji: string;
//   accent: string;
//   gradient: string;
//   image?: string;
// }

// /**
//  * IMPORTANT:
//  * Replace this with your real order page URL.
//  * Demo URL can make the QR look valid but not be useful after scanning.
//  */
// const ORDER_LINK = "https://your-real-order-page.example.com";

// const ORDER_QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=700x700&margin=30&data=${encodeURIComponent(
//   ORDER_LINK
// )}`;

// const PROMOS_INITIAL: Promo[] = [
//   {
//     id: 1,
//     title: "Double Crispy Chicken",
//     subtitle: "Golden fried, twice the crunch — today only",
//     tag: "LIMITED TIME",
//     price: "¥890",
//     emoji: "🍗",
//     accent: "#FF9A3D",
//     gradient: "linear-gradient(135deg, #120b07 0%, #2b170a 36%, #5b2f10 100%)",
//     image:
//       "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1800&auto=format&fit=crop",
//   },
//   {
//     id: 2,
//     title: "Wagyu Smash Burger",
//     subtitle: "Premium Japanese Wagyu with deep smoky finish",
//     tag: "CHEF'S PICK",
//     price: "¥1,280",
//     emoji: "🍔",
//     accent: "#FF5B57",
//     gradient: "linear-gradient(135deg, #140a0b 0%, #2b1013 35%, #5f171f 100%)",
//     image:
//       "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1800&auto=format&fit=crop",
//   },
//   {
//     id: 3,
//     title: "Premium Set Lunch",
//     subtitle: "Main + Side + Drink — fast, rich, complete",
//     tag: "LUNCH SET",
//     price: "¥1,050",
//     emoji: "🍱",
//     accent: "#3FE089",
//     gradient: "linear-gradient(135deg, #07130d 0%, #0e2318 36%, #19442d 100%)",
//     image:
//       "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=1800&auto=format&fit=crop",
//   },
//   {
//     id: 4,
//     title: "Matcha Latte Special",
//     subtitle: "Ceremonial grade matcha with oat milk",
//     tag: "NEW ARRIVAL",
//     price: "¥650",
//     emoji: "🍵",
//     accent: "#55E0B7",
//     gradient: "linear-gradient(135deg, #081312 0%, #0d2421 35%, #15483f 100%)",
//     image:
//       "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=1800&auto=format&fit=crop",
//   },
// ];

// const MENU_ITEMS_INITIAL: MenuItem[] = [
//   {
//     id: 1,
//     name: "Spicy Karaage",
//     nameJp: "スパイシー唐揚げ",
//     price: 680,
//     category: "Chicken",
//     badge: "Hot",
//     desc: "Double-marinated juicy fried chicken, yuzu kosho mayo",
//     calories: 420,
//     emoji: "🍗",
//     featured: true,
//     available: true,
//     spicyLevel: 2,
//     image:
//       "https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=1600&auto=format&fit=crop",
//   },
//   {
//     id: 2,
//     name: "Crispy Tenders",
//     nameJp: "クリスピーテンダー",
//     price: 750,
//     category: "Chicken",
//     badge: "Best",
//     desc: "Panko-crusted strips with house dipping sauce",
//     calories: 390,
//     emoji: "🍖",
//     available: true,
//     spicyLevel: 1,
//     image:
//       "https://images.unsplash.com/photo-1562967916-eb82221dfb92?q=80&w=1600&auto=format&fit=crop",
//   },
//   {
//     id: 3,
//     name: "Butter Garlic Wings",
//     nameJp: "バターガーリックウイング",
//     price: 820,
//     category: "Chicken",
//     desc: "8pc glazed wings, honey soy reduction",
//     calories: 510,
//     emoji: "🍗",
//     available: true,
//     spicyLevel: 1,
//     image:
//       "https://images.unsplash.com/photo-1527477396000-e27163b481c2?q=80&w=1600&auto=format&fit=crop",
//   },
//   {
//     id: 4,
//     name: "Smash Burger",
//     nameJp: "スマッシュバーガー",
//     price: 980,
//     category: "Burger",
//     badge: "New",
//     desc: "Double smashed patty, American cheese, pickles, secret sauce",
//     calories: 650,
//     emoji: "🍔",
//     featured: true,
//     available: true,
//     spicyLevel: 0,
//     image:
//       "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1600&auto=format&fit=crop",
//   },
//   {
//     id: 5,
//     name: "Teriyaki Burger",
//     nameJp: "テリヤキバーガー",
//     price: 880,
//     category: "Burger",
//     badge: "Best",
//     desc: "Teriyaki glaze, cabbage slaw, kewpie mayo",
//     calories: 580,
//     emoji: "🍔",
//     available: true,
//     spicyLevel: 0,
//     image:
//       "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1600&auto=format&fit=crop",
//   },
//   {
//     id: 6,
//     name: "Mushroom Swiss",
//     nameJp: "マッシュルームスイス",
//     price: 960,
//     category: "Burger",
//     desc: "Sautéed mushrooms, Swiss cheese, caramelized onion",
//     calories: 620,
//     emoji: "🍔",
//     available: true,
//     spicyLevel: 0,
//     image:
//       "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=1600&auto=format&fit=crop",
//   },
//   {
//     id: 7,
//     name: "Chicken Set A",
//     nameJp: "チキンセットA",
//     price: 1050,
//     category: "Set",
//     badge: "Special",
//     desc: "Karaage + rice + miso soup + salad",
//     calories: 780,
//     emoji: "🍱",
//     featured: true,
//     available: true,
//     spicyLevel: 1,
//     image:
//       "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1600&auto=format&fit=crop",
//   },
//   {
//     id: 8,
//     name: "Burger Set B",
//     nameJp: "バーガーセットB",
//     price: 1150,
//     category: "Set",
//     desc: "Smash burger + fries + soft drink",
//     calories: 920,
//     emoji: "🍱",
//     available: true,
//     spicyLevel: 0,
//     image:
//       "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop",
//   },
//   {
//     id: 9,
//     name: "Family Feast",
//     nameJp: "ファミリーフィースト",
//     price: 2800,
//     category: "Set",
//     badge: "Hot",
//     desc: "4 items + 4 drinks + dessert — serves 4",
//     calories: null,
//     emoji: "🎉",
//     available: true,
//     spicyLevel: 1,
//     image:
//       "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop",
//   },
//   {
//     id: 10,
//     name: "Matcha Latte",
//     nameJp: "抹茶ラテ",
//     price: 580,
//     category: "Drink",
//     badge: "New",
//     desc: "Ceremonial grade, choice of milk, iced or hot",
//     calories: 180,
//     emoji: "🍵",
//     featured: true,
//     available: true,
//     spicyLevel: 0,
//     image:
//       "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=1600&auto=format&fit=crop",
//   },
//   {
//     id: 11,
//     name: "Yuzu Lemonade",
//     nameJp: "柚子レモネード",
//     price: 480,
//     category: "Drink",
//     desc: "Fresh yuzu, honey, sparkling water",
//     calories: 120,
//     emoji: "🍋",
//     available: true,
//     spicyLevel: 0,
//     image:
//       "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1600&auto=format&fit=crop",
//   },
//   {
//     id: 12,
//     name: "Cold Brew Coffee",
//     nameJp: "コールドブリュー",
//     price: 520,
//     category: "Drink",
//     desc: "18-hour steep, oat milk optional",
//     calories: 15,
//     emoji: "☕",
//     available: true,
//     spicyLevel: 0,
//     image:
//       "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1600&auto=format&fit=crop",
//   },
// ];

// const CATS: Cat[] = ["All", "Chicken", "Burger", "Set", "Drink"];

// const EFFECT_OPTIONS: { id: Effect3D; label: string; desc: string }[] = [
//   { id: "orbit", label: "Orbit", desc: "3D orbit rotation" },
//   { id: "flip", label: "Flip", desc: "Y-axis card flip" },
//   { id: "zDepth", label: "Z-Depth", desc: "Deep Z-axis surge" },
//   { id: "carousel", label: "Carousel", desc: "Curved sweep" },
//   { id: "warp", label: "Warp", desc: "Spacetime distort" },
//   { id: "scatter", label: "Scatter", desc: "Explosive reform" },
// ];

// const TIME_PRESETS = [
//   { ms: 2500, label: "2.5s", speed: "Fast" },
//   { ms: 4000, label: "4s", speed: "Quick" },
//   { ms: 5000, label: "5s", speed: "Normal" },
//   { ms: 7000, label: "7s", speed: "Slow" },
//   { ms: 10000, label: "10s", speed: "Lazy" },
// ];

// const BADGE_CONFIG: Record<
//   Badge,
//   {
//     bg: string;
//     text: string;
//     border: string;
//     icon: React.ElementType;
//     label: string;
//     glow: string;
//   }
// > = {
//   Hot: {
//     bg: "rgba(255,91,87,.14)",
//     text: "#FF9B96",
//     border: "rgba(255,91,87,.34)",
//     icon: Flame,
//     label: "HOT",
//     glow: "rgba(255,91,87,.26)",
//   },
//   New: {
//     bg: "rgba(63,224,137,.12)",
//     text: "#62F0B5",
//     border: "rgba(63,224,137,.32)",
//     icon: Zap,
//     label: "NEW",
//     glow: "rgba(63,224,137,.22)",
//   },
//   Special: {
//     bg: "rgba(198,154,74,.14)",
//     text: "#F0C56C",
//     border: "rgba(198,154,74,.34)",
//     icon: Award,
//     label: "SPECIAL",
//     glow: "rgba(198,154,74,.24)",
//   },
//   Best: {
//     bg: "rgba(78,201,255,.12)",
//     text: "#85E2FF",
//     border: "rgba(78,201,255,.32)",
//     icon: TrendingUp,
//     label: "BEST",
//     glow: "rgba(78,201,255,.20)",
//   },
// };

// const CAT_TINT: Record<string, string> = {
//   Chicken: "rgba(255,154,61,.16)",
//   Burger: "rgba(255,91,87,.16)",
//   Set: "rgba(63,224,137,.14)",
//   Drink: "rgba(78,201,255,.14)",
// };

// const CSS = `
// @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

// *{box-sizing:border-box;margin:0;padding:0}
// html,body{width:100%;height:100%;overflow:hidden;background:#050607}

// :root{
//   --bg:#05070a;
//   --bg2:#0b1118;

//   --panel:rgba(18,24,32,.80);
//   --panel2:rgba(17,23,31,.90);

//   --line:rgba(255,255,255,.10);
//   --line2:rgba(255,255,255,.18);

//   --text:#f8fbff;
//   --muted:#c4cfdb;
//   --soft:#94a3b8;

//   --gold:#f3c872;
//   --blue:#67d7ff;
//   --green:#5ff0b1;
//   --red:#ff7d76;

//   --glass:blur(20px) saturate(145%);
//   --r-lg:30px;
//   --font-display:'Cormorant Garamond', serif;
//   --font-body:'Inter', sans-serif;
//   --font-mono:'Space Mono', monospace;
// }

// .light{
//   --bg:#f3f7fb;
//   --bg2:#e6edf5;

//   --panel:rgba(255,255,255,.84);
//   --panel2:rgba(255,255,255,.94);

//   --line:rgba(15,23,42,.08);
//   --line2:rgba(15,23,42,.16);

//   --text:#0f172a;
//   --muted:#334155;
//   --soft:#64748b;

//   --gold:#b7791f;
//   --blue:#0284c7;
//   --green:#059669;
//   --red:#dc2626;

//   --glass:none;
// }

// body{
//   font-family:var(--font-body);
//   color:var(--text);
//   background:
//     radial-gradient(circle at 14% 18%, rgba(103,215,255,.12), transparent 28%),
//     radial-gradient(circle at 86% 10%, rgba(243,200,114,.12), transparent 30%),
//     radial-gradient(circle at 70% 86%, rgba(95,240,177,.10), transparent 28%),
//     linear-gradient(180deg,var(--bg) 0%,var(--bg2) 100%);
// }

// .page{
//   position:relative;
//   width:100vw;
//   height:100vh;
//   overflow:hidden;
// }

// .page::before{
//   content:"";
//   position:absolute;
//   inset:0;
//   pointer-events:none;
//   background:
//     linear-gradient(180deg,rgba(255,255,255,.02),transparent 24%,transparent 76%,rgba(255,255,255,.012)),
//     repeating-linear-gradient(180deg,rgba(255,255,255,.02) 0 1px,transparent 1px 4px);
//   mix-blend-mode:soft-light;
//   opacity:.24;
//   z-index:0;
// }

// .root{
//   position:relative;
//   z-index:2;
//   width:100%;
//   height:100%;
//   padding:18px;
//   display:grid;
//   grid-template-rows:72px 238px 52px 1fr 46px;
//   gap:12px;
//   overflow:hidden;
// }

// .topbar,.hero-shell,.section-bar,.menu-shell,.footer{position:relative;z-index:2}

// .topbar{
//   display:flex;
//   align-items:center;
//   justify-content:space-between;
//   gap:16px;
// }

// .brand{
//   display:flex;
//   align-items:center;
//   gap:14px;
// }

// .brand-mark{
//   width:54px;
//   height:54px;
//   border-radius:18px;
//   display:flex;
//   align-items:center;
//   justify-content:center;
//   color:var(--gold);
//   border:1px solid rgba(243,200,114,.30);
//   background:
//     linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.02)),
//     rgba(255,255,255,.03);
//   backdrop-filter:var(--glass);
//   box-shadow:
//     0 0 0 1px rgba(255,255,255,.02),
//     0 18px 40px rgba(0,0,0,.24);
// }

// .brand-name{
//   font-family:var(--font-display);
//   font-size:30px;
//   line-height:1;
//   font-weight:700;
//   letter-spacing:.04em;
// }

// .brand-tagline{
//   margin-top:4px;
//   font-family:var(--font-mono);
//   font-size:10px;
//   color:var(--soft);
//   letter-spacing:.16em;
//   text-transform:uppercase;
//   opacity:.95;
// }

// .topbar-right{
//   display:flex;
//   align-items:center;
//   gap:10px;
// }

// .sync-pill,.tag-pill,.icon-btn,.cat-strip{backdrop-filter:var(--glass)}

// .sync-pill{
//   height:38px;
//   padding:0 14px;
//   border-radius:999px;
//   display:flex;
//   align-items:center;
//   gap:8px;
//   border:1px solid var(--line2);
//   background:var(--panel);
//   font-family:var(--font-mono);
//   font-size:10px;
//   letter-spacing:.14em;
//   text-transform:uppercase;
//   color:var(--muted);
// }

// .sync-pill.on{color:var(--green)}
// .sync-pill.off{color:var(--red)}

// .sync-dot{
//   width:7px;
//   height:7px;
//   border-radius:50%;
//   background:currentColor;
//   animation:pulseDot 1.8s ease-in-out infinite;
// }

// @keyframes pulseDot{
//   0%,100%{opacity:1;transform:scale(1)}
//   50%{opacity:.45;transform:scale(.68)}
// }

// .cat-strip{
//   height:42px;
//   padding:4px;
//   display:flex;
//   gap:4px;
//   border-radius:999px;
//   border:1px solid var(--line2);
//   background:var(--panel);
// }

// .cat-btn{
//   height:100%;
//   border:none;
//   background:transparent;
//   color:var(--muted);
//   padding:0 14px;
//   border-radius:999px;
//   font-size:12px;
//   font-weight:700;
//   cursor:pointer;
//   transition:.25s ease;
// }

// .cat-btn:hover{
//   color:var(--text);
//   background:rgba(255,255,255,.05);
// }

// .light .cat-btn:hover{
//   background:rgba(15,23,42,.05);
// }

// .cat-btn.active{
//   color:#fff;
//   background:linear-gradient(135deg, rgba(103,215,255,.95), rgba(243,200,114,.92));
//   box-shadow:inset 0 1px 0 rgba(255,255,255,.18), 0 10px 24px rgba(0,0,0,.10);
// }

// .clock{
//   min-width:104px;
//   text-align:right;
//   font-family:var(--font-display);
//   font-size:36px;
//   color:var(--gold);
//   font-style:italic;
// }

// .icon-btn{
//   width:40px;
//   height:40px;
//   border-radius:14px;
//   border:1px solid var(--line2);
//   background:var(--panel);
//   color:var(--muted);
//   display:flex;
//   align-items:center;
//   justify-content:center;
//   cursor:pointer;
//   transition:.22s ease;
// }

// .icon-btn:hover{
//   color:var(--text);
//   transform:translateY(-1px);
// }

// .hero-shell{
//   display:grid;
//   grid-template-columns:1fr 290px;
//   gap:12px;
//   min-height:0;
// }

// .hero{
//   position:relative;
//   overflow:hidden;
//   border-radius:var(--r-lg);
//   border:1px solid var(--line2);
//   background:var(--panel2);
//   backdrop-filter:var(--glass);
//   box-shadow:
//     inset 0 1px 0 rgba(255,255,255,.05),
//     0 20px 40px rgba(0,0,0,.18);
// }

// .hero-layer{
//   position:absolute;
//   inset:0;
//   background-size:cover;
//   background-position:center;
//   transform:none;
// }

// .hero-overlay{
//   position:absolute;
//   inset:0;
//   background:linear-gradient(
//     90deg,
//     rgba(3,7,12,.52) 0%,
//     rgba(3,7,12,.24) 45%,
//     rgba(3,7,12,.08) 100%
//   );
// }

// .light .hero-overlay{
//   background:linear-gradient(
//     90deg,
//     rgba(255,255,255,.84) 0%,
//     rgba(255,255,255,.54) 45%,
//     rgba(255,255,255,.16) 100%
//   );
// }

// .hero-content{
//   position:relative;
//   z-index:2;
//   height:100%;
//   padding:24px 28px;
//   display:flex;
//   flex-direction:column;
//   justify-content:flex-end;
//   gap:8px;
// }

// .hero-eyebrow{
//   width:fit-content;
//   display:flex;
//   align-items:center;
//   gap:8px;
//   padding:6px 12px;
//   border-radius:999px;
//   border:1px solid rgba(255,255,255,.12);
//   backdrop-filter:blur(12px);
//   font-family:var(--font-mono);
//   font-size:10px;
//   letter-spacing:.16em;
//   text-transform:uppercase;
// }

// .hero-title{
//   font-family:var(--font-display);
//   font-size:52px;
//   line-height:.94;
//   font-weight:700;
//   letter-spacing:-.02em;
//   color:var(--text);
//   text-shadow:0 8px 28px rgba(0,0,0,.22);
// }

// .light .hero-title{
//   text-shadow:none;
// }

// .hero-sub{
//   max-width:540px;
//   font-size:14px;
//   color:var(--muted);
//   line-height:1.55;
//   font-weight:500;
// }

// .hero-price-row{
//   display:flex;
//   align-items:flex-end;
//   gap:12px;
//   margin-top:4px;
// }

// .hero-price{
//   font-family:var(--font-display);
//   font-size:42px;
//   font-style:italic;
//   font-weight:700;
//   color:var(--gold);
// }

// .hero-price-label{
//   font-family:var(--font-mono);
//   font-size:10px;
//   color:var(--soft);
//   text-transform:uppercase;
//   letter-spacing:.14em;
// }

// .hero-dots{
//   position:absolute;
//   left:24px;
//   bottom:20px;
//   display:flex;
//   gap:6px;
//   z-index:4;
// }

// .hero-dot{
//   width:10px;
//   height:4px;
//   border:none;
//   border-radius:999px;
//   background:rgba(255,255,255,.28);
//   transition:.25s ease;
//   cursor:pointer;
// }

// .hero-dot.active{
//   width:30px;
//   background:linear-gradient(90deg,var(--blue),var(--gold));
// }

// .hero-controls{
//   position:absolute;
//   right:20px;
//   bottom:18px;
//   display:flex;
//   gap:8px;
//   z-index:4;
// }

// .hero-nav-btn{
//   width:34px;
//   height:34px;
//   border-radius:999px;
//   border:1px solid rgba(255,255,255,.14);
//   background:rgba(10,14,18,.44);
//   color:rgba(255,255,255,.86);
//   display:flex;
//   align-items:center;
//   justify-content:center;
//   cursor:pointer;
//   backdrop-filter:blur(10px);
// }

// .qr-panel{
//   position:relative;
//   overflow:hidden;
//   border-radius:var(--r-lg);
//   border:1px solid var(--line2);
//   background:var(--panel2);
//   backdrop-filter:var(--glass);
//   padding:16px;
//   display:flex;
//   flex-direction:column;
//   gap:12px;
//   box-shadow:
//     inset 0 1px 0 rgba(255,255,255,.05),
//     0 20px 40px rgba(0,0,0,.14);
// }

// .qr-head{
//   display:flex;
//   align-items:flex-start;
//   justify-content:space-between;
//   gap:10px;
// }

// .qr-title{
//   font-family:var(--font-display);
//   font-size:22px;
//   font-weight:700;
//   color:var(--text);
// }

// .qr-sub{
//   font-family:var(--font-mono);
//   font-size:9px;
//   text-transform:uppercase;
//   color:var(--soft);
//   letter-spacing:.14em;
// }

// .qr-chip{
//   display:flex;
//   align-items:center;
//   gap:6px;
//   padding:7px 10px;
//   border-radius:999px;
//   border:1px solid var(--line2);
//   background:rgba(255,255,255,.05);
//   color:var(--muted);
//   font-family:var(--font-mono);
//   font-size:9px;
//   text-transform:uppercase;
//   letter-spacing:.12em;
//   flex-shrink:0;
// }

// .qr-box{
//   flex:1;
//   min-height:188px;
//   border-radius:22px;
//   border:1px solid var(--line2);
//   display:flex;
//   align-items:center;
//   justify-content:center;
//   background:
//     linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02)),
//     rgba(255,255,255,.03);
//   padding:12px;
// }

// .qr-frame{
//   width:100%;
//   height:100%;
//   display:flex;
//   align-items:center;
//   justify-content:center;
// }

// .qr-box img{
//   width:min(100%, 176px);
//   max-width:176px;
//   height:auto;
//   aspect-ratio:1/1;
//   object-fit:contain;
//   display:block;
//   background:#fff;
//   border-radius:16px;
//   padding:10px;
//   box-shadow:
//     0 10px 30px rgba(0,0,0,.18),
//     0 0 0 1px rgba(0,0,0,.05);
// }

// .qr-link{
//   display:flex;
//   flex-direction:column;
//   gap:4px;
//   padding:10px 12px;
//   border-radius:12px;
//   border:1px solid var(--line);
//   background:rgba(255,255,255,.05);
//   color:var(--text);
//   line-height:1.5;
//   word-break:break-all;
// }

// .qr-link-label{
//   font-family:var(--font-mono);
//   font-size:9px;
//   text-transform:uppercase;
//   letter-spacing:.14em;
//   color:var(--soft);
// }

// .qr-link-value{
//   font-size:12px;
//   font-weight:600;
//   color:var(--text);
// }

// .qr-footer{
//   border-top:1px solid var(--line);
//   padding-top:10px;
//   font-family:var(--font-mono);
//   font-size:9px;
//   text-transform:uppercase;
//   color:var(--soft);
//   line-height:1.7;
//   letter-spacing:.12em;
//   display:flex;
//   flex-direction:column;
//   gap:2px;
// }

// .section-bar{
//   display:flex;
//   align-items:center;
//   justify-content:space-between;
//   gap:12px;
// }

// .section-left{
//   display:flex;
//   align-items:flex-end;
//   gap:12px;
// }

// .section-heading{
//   font-family:var(--font-display);
//   font-size:34px;
//   line-height:1;
//   font-weight:700;
// }

// .section-heading em{
//   color:var(--gold);
//   font-style:normal;
// }

// .section-meta{
//   font-family:var(--font-mono);
//   font-size:10px;
//   color:var(--soft);
//   letter-spacing:.14em;
//   text-transform:uppercase;
// }

// .section-right{
//   display:flex;
//   align-items:center;
//   gap:8px;
// }

// .tag-pill{
//   height:30px;
//   border-radius:999px;
//   padding:0 12px;
//   display:flex;
//   align-items:center;
//   gap:6px;
//   border:1px solid var(--line2);
//   background:var(--panel);
//   color:var(--soft);
//   font-family:var(--font-mono);
//   font-size:10px;
//   text-transform:uppercase;
//   letter-spacing:.12em;
// }

// .menu-shell{
//   position:relative;
//   min-height:0;
//   overflow:hidden;
//   border-radius:32px;
//   perspective:2400px;
// }

// .menu-curved-stage{
//   position:absolute;
//   inset:3% 1.5% 2% 1.5%;
//   border-radius:34px;
//   background:
//     linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.015)),
//     rgba(7,10,14,.48);
//   border:1px solid rgba(255,255,255,.08);
//   backdrop-filter:blur(12px);
//   transform:rotateX(10deg) scale(1.02);
//   box-shadow:
//     inset 0 1px 0 rgba(255,255,255,.04),
//     0 40px 80px rgba(0,0,0,.20);
//   z-index:0;
// }

// .menu-scroll{
//   position:relative;
//   z-index:2;
//   width:100%;
//   height:100%;
//   overflow:hidden;
//   padding:18px;
// }

// .menu-grid-wrap{
//   position:relative;
//   width:100%;
//   height:100%;
//   transform-style:preserve-3d;
//   perspective:2400px;
// }

// .menu-grid{
//   width:100%;
//   height:100%;
//   display:grid;
//   gap:14px;
//   transform-style:preserve-3d;
//   will-change:transform,opacity,filter;
// }

// .menu-grid.fixed-all{
//   grid-template-columns:repeat(4,minmax(0,1fr));
//   grid-template-rows:repeat(3,minmax(0,1fr));
// }

// .menu-grid.scrolling{
//   grid-template-columns:repeat(4,minmax(0,1fr));
//   grid-auto-rows:292px;
//   align-content:start;
//   overflow-y:auto;
//   padding-right:2px;
//   scrollbar-width:none;
// }

// .menu-grid.scrolling::-webkit-scrollbar{display:none}

// .card{
//   position:relative;
//   display:flex;
//   flex-direction:column;
//   overflow:hidden;
//   border-radius:26px;
//   border:1px solid rgba(255,255,255,.10);
//   background:
//     linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.02)),
//     rgba(11,15,20,.74);
//   backdrop-filter:blur(24px) saturate(160%);
//   transform-style:preserve-3d;
//   backface-visibility:hidden;
//   box-shadow:
//     inset 0 1px 0 rgba(255,255,255,.05),
//     0 20px 40px rgba(0,0,0,.24);
//   transition:border-color .3s ease, box-shadow .3s ease, transform .25s ease;
// }

// .card::before{
//   content:"";
//   position:absolute;
//   inset:0;
//   pointer-events:none;
//   background:
//     linear-gradient(135deg, rgba(255,255,255,.12), transparent 28%, transparent 72%, rgba(103,215,255,.08));
//   opacity:0;
//   transition:opacity .3s ease;
//   z-index:4;
// }

// .card:hover::before,.card.hl::before{opacity:1}
// .card:hover,.card.hl{border-color:rgba(255,255,255,.20)}

// .card-shadow{
//   position:absolute;
//   left:12%;
//   right:12%;
//   bottom:-22px;
//   height:28px;
//   border-radius:999px;
//   background:radial-gradient(circle, rgba(0,0,0,.45), rgba(0,0,0,0) 72%);
//   filter:blur(12px);
//   transform:translateZ(-60px);
//   pointer-events:none;
// }

// .card-rim{
//   position:absolute;
//   inset:0;
//   border-radius:inherit;
//   pointer-events:none;
//   border:1px solid rgba(255,255,255,.04);
//   z-index:5;
// }

// .card-image{
//   position:relative;
//   flex:0 0 54%;
//   overflow:hidden;
//   transform:translateZ(28px);
// }

// .card-image img{
//   width:100%;
//   height:100%;
//   object-fit:cover;
//   display:block;
//   transition:transform .7s cubic-bezier(.22,1,.36,1), filter .4s ease;
//   filter:saturate(1.08) contrast(1.04) brightness(.98);
// }

// .card:hover img{
//   transform:scale(1.05);
//   filter:saturate(1.15) contrast(1.06) brightness(1);
// }

// .card-image::before{
//   content:"";
//   position:absolute;
//   inset:0;
//   background:linear-gradient(180deg, transparent 10%, rgba(5,8,12,.16) 45%, rgba(5,8,12,.84) 100%);
//   z-index:1;
// }

// .card-tint{
//   position:absolute;
//   inset:0;
//   z-index:3;
//   mix-blend-mode:screen;
//   opacity:.22;
// }

// .card-beam{
//   position:absolute;
//   top:-10%;
//   left:-24%;
//   width:44%;
//   height:140%;
//   background:linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent);
//   transform:skewX(-16deg);
//   z-index:4;
//   pointer-events:none;
// }

// .card-badge{
//   position:absolute;
//   top:10px;
//   left:10px;
//   z-index:6;
//   display:flex;
//   align-items:center;
//   gap:4px;
//   padding:4px 9px;
//   border-radius:999px;
//   font-family:var(--font-mono);
//   font-size:8px;
//   letter-spacing:.12em;
//   text-transform:uppercase;
//   backdrop-filter:blur(10px);
// }

// .card-featured{
//   position:absolute;
//   top:10px;
//   right:10px;
//   z-index:6;
//   display:flex;
//   align-items:center;
//   gap:4px;
//   padding:4px 9px;
//   border-radius:999px;
//   font-family:var(--font-mono);
//   font-size:8px;
//   letter-spacing:.12em;
//   text-transform:uppercase;
//   color:var(--gold);
//   background:rgba(243,200,114,.14);
//   border:1px solid rgba(243,200,114,.30);
//   backdrop-filter:blur(10px);
// }

// .card-status{
//   position:absolute;
//   right:10px;
//   bottom:10px;
//   z-index:6;
//   padding:4px 9px;
//   border-radius:999px;
//   font-family:var(--font-mono);
//   font-size:8px;
//   letter-spacing:.12em;
//   text-transform:uppercase;
//   background:rgba(95,240,177,.14);
//   border:1px solid rgba(95,240,177,.28);
//   color:var(--green);
//   backdrop-filter:blur(10px);
// }

// .card-status.out{
//   background:rgba(255,125,118,.14);
//   border-color:rgba(255,125,118,.28);
//   color:var(--red);
// }

// .card-price-float{
//   position:absolute;
//   left:12px;
//   bottom:10px;
//   z-index:6;
//   font-family:var(--font-display);
//   font-size:22px;
//   font-style:italic;
//   font-weight:700;
//   color:#fff;
//   text-shadow:0 4px 18px rgba(0,0,0,.55);
// }

// .card-body{
//   flex:1;
//   display:flex;
//   flex-direction:column;
//   gap:4px;
//   padding:13px 14px;
//   position:relative;
//   transform:translateZ(16px);
//   background:
//     linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.015)),
//     rgba(7,10,14,.62);
// }

// .card-name{
//   font-size:15px;
//   font-weight:800;
//   line-height:1.18;
//   color:var(--text);
//   display:-webkit-box;
//   -webkit-line-clamp:1;
//   -webkit-box-orient:vertical;
//   overflow:hidden;
// }

// .card-jp{
//   font-size:11px;
//   color:var(--soft);
//   font-weight:600;
// }

// .card-desc{
//   margin-top:3px;
//   font-size:12px;
//   line-height:1.5;
//   color:var(--muted);
//   display:-webkit-box;
//   -webkit-line-clamp:2;
//   -webkit-box-orient:vertical;
//   overflow:hidden;
//   flex:1;
// }

// .card-footer{
//   margin-top:auto;
//   padding-top:10px;
//   border-top:1px solid rgba(255,255,255,.08);
//   display:flex;
//   align-items:flex-end;
//   justify-content:space-between;
// }

// .card-main-price{
//   font-family:var(--font-display);
//   font-size:24px;
//   font-style:italic;
//   font-weight:700;
//   color:var(--gold);
// }

// .card-meta{
//   display:flex;
//   flex-direction:column;
//   align-items:flex-end;
//   gap:4px;
// }

// .card-cal{
//   font-family:var(--font-mono);
//   font-size:8px;
//   text-transform:uppercase;
//   letter-spacing:.10em;
//   color:var(--soft);
//   display:flex;
//   align-items:center;
//   gap:4px;
// }

// .spice-row{display:flex;gap:4px}

// .spice-pip{
//   width:7px;
//   height:7px;
//   border-radius:50%;
//   background:rgba(255,255,255,.12);
// }

// .spice-pip.on{
//   background:#ff9a3d;
//   box-shadow:0 0 12px rgba(255,154,61,.40);
// }

// .footer{
//   border-radius:18px;
//   border:1px solid var(--line2);
//   background:var(--panel);
//   backdrop-filter:var(--glass);
//   display:flex;
//   align-items:center;
//   justify-content:space-between;
//   padding:0 14px;
// }

// .footer-side{
//   display:flex;
//   align-items:center;
//   gap:8px;
//   font-family:var(--font-mono);
//   font-size:10px;
//   text-transform:uppercase;
//   letter-spacing:.12em;
//   color:var(--soft);
// }

// .footer-div{
//   width:1px;
//   height:18px;
//   background:var(--line2);
// }

// .footer-status.on{color:var(--green)}
// .footer-status.off{color:var(--red)}

// .admin-overlay{
//   position:fixed;
//   right:18px;
//   top:86px;
//   width:430px;
//   max-width:calc(100vw - 36px);
//   max-height:calc(100vh - 110px);
//   overflow-y:auto;
//   border-radius:28px;
//   border:1px solid rgba(255,255,255,.12);
//   background:rgba(8,12,18,.96);
//   backdrop-filter:blur(36px);
//   padding:18px;
//   z-index:20;
//   box-shadow:
//     0 0 0 1px rgba(255,255,255,.04),
//     0 48px 96px rgba(0,0,0,.60);
// }

// .admin-head{
//   display:flex;
//   align-items:center;
//   justify-content:space-between;
//   margin-bottom:16px;
//   padding-bottom:14px;
//   border-bottom:1px solid rgba(255,255,255,.07);
// }

// .admin-headleft{
//   display:flex;
//   align-items:center;
//   gap:12px;
// }

// .admin-title-main{
//   font-family:var(--font-display);
//   font-size:26px;
//   font-weight:700;
// }

// .admin-title-sub{
//   font-family:var(--font-mono);
//   font-size:8px;
//   letter-spacing:.14em;
//   text-transform:uppercase;
//   color:var(--soft);
// }

// .admin-section-title{
//   font-family:var(--font-mono);
//   font-size:9px;
//   letter-spacing:.16em;
//   text-transform:uppercase;
//   color:var(--soft);
//   margin-bottom:8px;
//   display:flex;
//   align-items:center;
//   gap:6px;
// }

// .admin-section-title::after{
//   content:"";
//   flex:1;
//   height:1px;
//   background:rgba(255,255,255,.07);
// }

// .admin-body{
//   display:flex;
//   flex-direction:column;
//   gap:14px;
// }

// .admin-card{
//   border-radius:16px;
//   border:1px solid rgba(255,255,255,.08);
//   background:rgba(255,255,255,.03);
//   padding:12px;
// }

// .admin-label{
//   display:flex;
//   justify-content:space-between;
//   gap:8px;
//   margin-bottom:10px;
//   font-family:var(--font-mono);
//   font-size:8px;
//   letter-spacing:.12em;
//   text-transform:uppercase;
//   color:var(--soft);
// }

// .admin-val{color:var(--gold)}
// .admin-val.live{color:var(--green)}

// .admin-status-row{
//   display:flex;
//   justify-content:space-between;
//   padding:8px 12px;
//   border-radius:10px;
//   background:rgba(255,255,255,.025);
//   border:1px solid rgba(255,255,255,.06);
//   font-family:var(--font-mono);
//   font-size:9px;
//   letter-spacing:.12em;
//   text-transform:uppercase;
//   color:var(--soft);
// }

// .admin-select{
//   width:100%;
//   height:38px;
//   border-radius:12px;
//   border:1px solid rgba(255,255,255,.10);
//   background:rgba(255,255,255,.05);
//   color:var(--text);
//   padding:0 10px;
//   outline:none;
//   cursor:pointer;
// }

// .admin-hotkeys{
//   display:flex;
//   gap:8px;
//   align-items:center;
//   flex-wrap:wrap;
//   padding:10px 12px;
//   border-radius:10px;
//   background:rgba(255,255,255,.018);
//   border:1px solid rgba(255,255,255,.05);
//   font-family:var(--font-mono);
//   font-size:9px;
//   letter-spacing:.12em;
//   text-transform:uppercase;
//   color:var(--soft);
// }

// .hk{
//   min-width:22px;
//   height:20px;
//   border-radius:7px;
//   display:inline-flex;
//   align-items:center;
//   justify-content:center;
//   border:1px solid rgba(255,255,255,.14);
//   background:rgba(255,255,255,.06);
//   padding:0 5px;
//   font-size:8px;
// }

// .time-presets{
//   display:grid;
//   grid-template-columns:repeat(5,1fr);
//   gap:6px;
//   margin-bottom:10px;
// }

// .time-preset-btn{
//   height:48px;
//   border-radius:13px;
//   border:1px solid rgba(255,255,255,.08);
//   background:rgba(255,255,255,.04);
//   color:var(--muted);
//   cursor:pointer;
//   font-family:var(--font-mono);
//   font-size:11px;
//   font-weight:700;
//   display:flex;
//   flex-direction:column;
//   align-items:center;
//   justify-content:center;
//   gap:3px;
// }

// .time-preset-btn.active{
//   color:#fff;
//   border-color:rgba(243,200,114,.40);
//   background:linear-gradient(135deg, rgba(243,200,114,.88), rgba(103,215,255,.82));
//   box-shadow:0 10px 24px rgba(0,0,0,.12);
// }

// .time-preset-label{
//   font-size:7px;
//   text-transform:uppercase;
//   opacity:.72;
// }

// .time-ring-wrap{
//   display:flex;
//   align-items:center;
//   justify-content:center;
//   padding:12px 0 10px;
// }

// .time-ring-value{
//   font-family:var(--font-display);
//   font-size:42px;
//   font-style:italic;
//   font-weight:700;
//   color:var(--gold);
//   line-height:1;
//   text-align:center;
// }

// .time-ring-unit{
//   font-family:var(--font-mono);
//   font-size:9px;
//   letter-spacing:.14em;
//   text-transform:uppercase;
//   color:var(--soft);
//   text-align:center;
//   margin-top:3px;
// }

// .time-slider-wrap{
//   position:relative;
//   padding:4px 0;
// }

// .admin-range{
//   -webkit-appearance:none;
//   appearance:none;
//   width:100%;
//   height:8px;
//   border-radius:999px;
//   outline:none;
//   background:rgba(255,255,255,.06);
// }

// .admin-range::-webkit-slider-thumb{
//   -webkit-appearance:none;
//   appearance:none;
//   width:26px;
//   height:26px;
//   border-radius:50%;
//   background:linear-gradient(135deg,var(--gold),var(--blue));
//   border:2px solid rgba(255,255,255,.28);
//   cursor:pointer;
//   margin-top:-9px;
// }

// .slider-track-fill{
//   position:absolute;
//   left:0;
//   top:50%;
//   transform:translateY(-50%);
//   height:8px;
//   border-radius:999px;
//   background:linear-gradient(90deg,var(--gold),var(--blue));
//   pointer-events:none;
//   opacity:.55;
// }

// .slider-ticks{
//   display:flex;
//   justify-content:space-between;
//   padding:5px 2px 0;
//   font-family:var(--font-mono);
//   font-size:8px;
//   color:var(--soft);
// }

// .effect-grid{
//   display:grid;
//   grid-template-columns:repeat(3,1fr);
//   gap:7px;
// }

// .effect-btn{
//   height:58px;
//   border-radius:14px;
//   border:1px solid rgba(255,255,255,.08);
//   background:rgba(255,255,255,.03);
//   color:var(--muted);
//   cursor:pointer;
//   display:flex;
//   flex-direction:column;
//   align-items:center;
//   justify-content:center;
//   gap:4px;
// }

// .effect-btn.active{
//   color:#fff;
//   border-color:rgba(243,200,114,.40);
//   background:linear-gradient(135deg, rgba(243,200,114,.88), rgba(103,215,255,.82));
//   box-shadow:0 10px 24px rgba(0,0,0,.12);
// }

// .effect-btn-label{
//   font-family:var(--font-mono);
//   font-size:10px;
//   font-weight:700;
//   letter-spacing:.10em;
//   text-transform:uppercase;
// }

// .effect-btn-desc{
//   font-family:var(--font-mono);
//   font-size:7px;
//   text-transform:uppercase;
//   opacity:.6;
//   text-align:center;
//   line-height:1.3;
//   padding:0 4px;
// }

// .playback-row{
//   display:flex;
//   align-items:center;
//   gap:8px;
// }

// .playback-btn{
//   flex:1;
//   height:40px;
//   border-radius:12px;
//   border:1px solid rgba(255,255,255,.09);
//   background:rgba(255,255,255,.04);
//   color:var(--muted);
//   cursor:pointer;
//   display:flex;
//   align-items:center;
//   justify-content:center;
//   gap:7px;
//   font-family:var(--font-mono);
//   font-size:10px;
//   text-transform:uppercase;
// }

// .playback-btn.primary{
//   color:#fff;
//   border-color:rgba(243,200,114,.40);
//   background:linear-gradient(135deg, rgba(243,200,114,.88), rgba(103,215,255,.82));
//   box-shadow:0 10px 24px rgba(0,0,0,.12);
// }

// .item-dots-row{
//   display:flex;
//   gap:4px;
//   flex-wrap:wrap;
//   padding:8px 10px;
//   border-radius:12px;
//   background:rgba(255,255,255,.02);
//   border:1px solid rgba(255,255,255,.06);
// }

// .item-dot{
//   min-width:24px;
//   height:24px;
//   border-radius:7px;
//   border:1px solid rgba(255,255,255,.08);
//   background:rgba(255,255,255,.04);
//   color:var(--soft);
//   font-family:var(--font-mono);
//   font-size:8px;
//   cursor:pointer;
//   display:flex;
//   align-items:center;
//   justify-content:center;
//   padding:0 4px;
// }

// .item-dot.active{
//   color:#fff;
//   border-color:rgba(243,200,114,.40);
//   background:linear-gradient(135deg, rgba(243,200,114,.88), rgba(103,215,255,.82));
//   box-shadow:0 10px 24px rgba(0,0,0,.12);
// }

// .highlight-progress-bar{
//   position:absolute;
//   bottom:0;
//   left:0;
//   height:3px;
//   background:linear-gradient(90deg,var(--blue),var(--gold));
//   z-index:10;
// }

// .light .card,
// .light .hero,
// .light .qr-panel,
// .light .sync-pill,
// .light .tag-pill,
// .light .icon-btn,
// .light .cat-strip,
// .light .footer,
// .light .admin-overlay,
// .light .admin-card,
// .light .hero-nav-btn{
//   backdrop-filter:none;
// }

// .light .card{
//   background:#ffffff;
//   border:1px solid rgba(15,23,42,.08);
//   box-shadow:
//     0 12px 30px rgba(15,23,42,.08),
//     0 2px 10px rgba(15,23,42,.04);
// }

// .light .card-body{
//   background:linear-gradient(180deg, rgba(255,255,255,.96), rgba(248,250,252,.96));
// }

// .light .card-footer{
//   border-top:1px solid rgba(15,23,42,.08);
// }

// .light .card-image img{
//   filter:none;
// }

// .light .card:hover img{
//   transform:scale(1.02);
//   filter:none;
// }

// .light .card-tint,
// .light .card-shadow{
//   display:none;
// }

// .light .qr-link{
//   background:#f8fafc;
// }

// .light .admin-overlay{
//   background:rgba(255,255,255,.98);
//   border:1px solid rgba(15,23,42,.10);
//   box-shadow:0 24px 64px rgba(15,23,42,.16);
// }

// .light .admin-card{
//   border:1px solid rgba(15,23,42,.08);
//   background:#f8fafc;
// }

// .light .admin-select{
//   border:1px solid rgba(15,23,42,.12);
//   background:#fff;
// }

// .light .qr-box img{
//   box-shadow:
//     0 10px 24px rgba(15,23,42,.10),
//     0 0 0 1px rgba(15,23,42,.05);
// }

// @media(max-width:1600px){
//   .hero-title{font-size:44px}
// }

// @media(max-width:1280px){
//   .root{grid-template-rows:72px 190px 48px 1fr 42px}
//   .hero-shell{grid-template-columns:1fr 246px}
//   .menu-grid.fixed-all{
//     grid-template-columns:repeat(3,minmax(0,1fr));
//     grid-template-rows:repeat(4,minmax(0,1fr));
//   }
//   .qr-box{min-height:160px}
//   .qr-box img{
//     width:min(100%, 150px);
//     max-width:150px;
//   }
// }
// `;

// const heroVariants = {
//   initial: { opacity: 0 },
//   animate: {
//     opacity: 1,
//     transition: { duration: 0.35, ease: "easeOut" },
//   },
//   exit: {
//     opacity: 0,
//     transition: { duration: 0.2, ease: "easeInOut" },
//   },
// };

// const stageVariants = {
//   enter: (direction: 1 | -1) => ({
//     opacity: 0,
//     rotateY: direction > 0 ? 22 : -22,
//     rotateX: 12,
//     x: direction > 0 ? 180 : -180,
//     scale: 0.9,
//     filter: "blur(12px)",
//   }),
//   center: {
//     opacity: 1,
//     rotateY: 0,
//     rotateX: 0,
//     x: 0,
//     scale: 1,
//     filter: "blur(0px)",
//     transition: {
//       duration: 0.9,
//       ease: [0.22, 1, 0.36, 1],
//       staggerChildren: 0.055,
//       delayChildren: 0.04,
//     },
//   },
//   exit: (direction: 1 | -1) => ({
//     opacity: 0,
//     rotateY: direction > 0 ? -16 : 16,
//     rotateX: -8,
//     x: direction > 0 ? -140 : 140,
//     scale: 0.96,
//     filter: "blur(8px)",
//     transition: {
//       duration: 0.34,
//       ease: [0.4, 0, 1, 1],
//       staggerChildren: 0.025,
//       staggerDirection: -1,
//     },
//   }),
// };

// function getCardVariants(effect: Effect3D) {
//   const map: Record<Effect3D, object> = {
//     orbit: {
//       enter: (d: 1 | -1) => ({
//         opacity: 0,
//         y: 45,
//         rotateX: 38,
//         rotateY: d > 0 ? 50 : -50,
//         rotateZ: d > 0 ? 9 : -9,
//         scale: 0.68,
//         z: -300,
//         filter: "blur(12px) brightness(.35)",
//       }),
//       center: {
//         opacity: 1,
//         y: 0,
//         rotateX: 0,
//         rotateY: 0,
//         rotateZ: 0,
//         scale: 1,
//         z: 0,
//         filter: "blur(0px) brightness(1)",
//         transition: {
//           duration: 0.95,
//           ease: [0.16, 1, 0.3, 1],
//           opacity: { duration: 0.5 },
//         },
//       },
//       exit: (d: 1 | -1) => ({
//         opacity: 0,
//         y: -30,
//         rotateX: -22,
//         rotateY: d > 0 ? -35 : 35,
//         rotateZ: d > 0 ? -7 : 7,
//         scale: 0.82,
//         z: -130,
//         filter: "blur(7px) brightness(.45)",
//         transition: { duration: 0.32, ease: [0.4, 0, 1, 1] },
//       }),
//     },
//     flip: {
//       enter: (d: 1 | -1) => ({
//         opacity: 0,
//         rotateY: d > 0 ? 90 : -90,
//         scale: 0.85,
//         z: -60,
//         filter: "blur(4px)",
//       }),
//       center: {
//         opacity: 1,
//         rotateY: 0,
//         scale: 1,
//         z: 0,
//         filter: "blur(0px)",
//         transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
//       },
//       exit: (d: 1 | -1) => ({
//         opacity: 0,
//         rotateY: d > 0 ? -90 : 90,
//         scale: 0.9,
//         z: -40,
//         filter: "blur(3px)",
//         transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
//       }),
//     },
//     zDepth: {
//       enter: () => ({
//         opacity: 0,
//         scale: 0.25,
//         z: -1400,
//         rotateX: 20,
//         filter: "blur(22px) brightness(.18)",
//       }),
//       center: {
//         opacity: 1,
//         scale: 1,
//         z: 0,
//         rotateX: 0,
//         filter: "blur(0px) brightness(1)",
//         transition: {
//           duration: 1.05,
//           ease: [0.16, 1, 0.3, 1],
//           scale: { duration: 0.85 },
//           opacity: { duration: 0.6 },
//         },
//       },
//       exit: () => ({
//         opacity: 0,
//         scale: 2.4,
//         z: 700,
//         rotateX: -14,
//         filter: "blur(18px) brightness(1.7)",
//         transition: { duration: 0.38, ease: [0.4, 0, 1, 1] },
//       }),
//     },
//     carousel: {
//       enter: (d: 1 | -1) => ({
//         opacity: 0,
//         x: d > 0 ? 340 : -340,
//         rotateY: d > 0 ? 55 : -55,
//         rotateX: 9,
//         scale: 0.75,
//         z: -200,
//         filter: "blur(9px)",
//       }),
//       center: {
//         opacity: 1,
//         x: 0,
//         rotateY: 0,
//         rotateX: 0,
//         scale: 1,
//         z: 0,
//         filter: "blur(0px)",
//         transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
//       },
//       exit: (d: 1 | -1) => ({
//         opacity: 0,
//         x: d > 0 ? -220 : 220,
//         rotateY: d > 0 ? -38 : 38,
//         rotateX: -7,
//         scale: 0.84,
//         z: -90,
//         filter: "blur(5px)",
//         transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
//       }),
//     },
//     warp: {
//       enter: (d: 1 | -1) => ({
//         opacity: 0,
//         scaleX: 0.08,
//         scaleY: 1.5,
//         rotateX: 30,
//         rotateZ: d > 0 ? 14 : -14,
//         z: -450,
//         filter: "blur(16px) saturate(0)",
//       }),
//       center: {
//         opacity: 1,
//         scaleX: 1,
//         scaleY: 1,
//         rotateX: 0,
//         rotateZ: 0,
//         z: 0,
//         filter: "blur(0px) saturate(1)",
//         transition: {
//           duration: 0.92,
//           ease: [0.16, 1, 0.3, 1],
//           scaleX: { duration: 0.62 },
//         },
//       },
//       exit: (d: 1 | -1) => ({
//         opacity: 0,
//         scaleX: 0.1,
//         scaleY: 0.65,
//         rotateX: -20,
//         rotateZ: d > 0 ? -12 : 12,
//         z: -220,
//         filter: "blur(12px) saturate(0)",
//         transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
//       }),
//     },
//     scatter: {
//       enter: () => {
//         const rx = (Math.random() - 0.5) * 320;
//         const ry = (Math.random() - 0.5) * 220;
//         const rz = (Math.random() - 0.5) * 44;
//         const rx2 = (Math.random() - 0.5) * 32;
//         return {
//           opacity: 0,
//           x: rx,
//           y: ry,
//           rotateZ: rz,
//           rotateX: rx2,
//           scale: 0.55 + Math.random() * 0.32,
//           z: -220 - Math.random() * 320,
//           filter: "blur(9px) brightness(.35)",
//         };
//       },
//       center: {
//         opacity: 1,
//         x: 0,
//         y: 0,
//         rotateZ: 0,
//         rotateX: 0,
//         scale: 1,
//         z: 0,
//         filter: "blur(0px) brightness(1)",
//         transition: { duration: 0.92, ease: [0.22, 1, 0.36, 1] },
//       },
//       exit: () => {
//         const rx = (Math.random() - 0.5) * 220;
//         const ry = -110 - Math.random() * 110;
//         return {
//           opacity: 0,
//           x: rx,
//           y: ry,
//           rotateZ: (Math.random() - 0.5) * 32,
//           scale: 0.65,
//           z: -160,
//           filter: "blur(7px) brightness(.45)",
//           transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
//         };
//       },
//     },
//   };

//   return map[effect] || map.orbit;
// }

// function LiveClock() {
//   const [time, setTime] = useState("");

//   useEffect(() => {
//     const tick = () =>
//       setTime(
//         new Date().toLocaleTimeString("ja-JP", {
//           hour: "2-digit",
//           minute: "2-digit",
//         })
//       );

//     tick();
//     const id = window.setInterval(tick, 1000);
//     return () => window.clearInterval(id);
//   }, []);

//   return <div className="clock">{time}</div>;
// }

// function SpiceRow({ level = 0 }: { level?: number }) {
//   return (
//     <div className="spice-row">
//       {[0, 1, 2].map((i) => (
//         <span key={i} className={`spice-pip ${i < level ? "on" : ""}`} />
//       ))}
//     </div>
//   );
// }

// function HighlightProgressBar({
//   duration,
//   progressKey,
// }: {
//   duration: number;
//   progressKey: number;
// }) {
//   return (
//     <motion.div
//       key={progressKey}
//       className="highlight-progress-bar"
//       initial={{ width: "100%" }}
//       animate={{ width: "0%" }}
//       transition={{ duration: duration / 1000, ease: "linear" }}
//     />
//   );
// }

// function MenuCard({
//   item,
//   highlight,
//   direction,
//   effect,
//   itemChangeMs,
// }: {
//   item: MenuItem;
//   highlight: boolean;
//   direction: 1 | -1;
//   effect: Effect3D;
//   itemChangeMs: number;
// }) {
//   const [progressKey, setProgressKey] = useState(0);
//   const config = item.badge ? BADGE_CONFIG[item.badge] : null;
//   const Icon = config?.icon;
//   const tint = CAT_TINT[item.category] ?? "rgba(213,161,74,.10)";
//   const cardVariants = getCardVariants(effect);
//   const cardRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (highlight) setProgressKey((p) => p + 1);
//   }, [highlight, itemChangeMs]);

//   useEffect(() => {
//     const el = cardRef.current;
//     if (!el) return;

//     const handleMove = (e: MouseEvent) => {
//       const rect = el.getBoundingClientRect();
//       const x = (e.clientX - rect.left) / rect.width - 0.5;
//       const y = (e.clientY - rect.top) / rect.height - 0.5;
//       el.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(20px)`;
//     };

//     const reset = () => {
//       el.style.transform = "";
//     };

//     el.addEventListener("mousemove", handleMove);
//     el.addEventListener("mouseleave", reset);

//     return () => {
//       el.removeEventListener("mousemove", handleMove);
//       el.removeEventListener("mouseleave", reset);
//     };
//   }, []);

//   return (
//     <motion.div
//       ref={cardRef}
//       variants={cardVariants as never}
//       custom={direction}
//       whileHover={{
//         rotateX: -8,
//         rotateY: 10,
//         y: -10,
//         scale: 1.02,
//         transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
//       }}
//       animate={
//         highlight
//           ? {
//               rotateX: -4,
//               rotateY: 6,
//               y: -8,
//               scale: 1.04,
//               boxShadow:
//                 "0 40px 100px rgba(0,0,0,.6),0 0 80px rgba(86,207,255,.18),0 0 0 1px rgba(86,207,255,.18)",
//               transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
//             }
//           : {
//               rotateX: 0,
//               rotateY: 0,
//               y: 0,
//               scale: 1,
//               boxShadow: "0 20px 40px rgba(0,0,0,.24)",
//               transition: { duration: 0.35 },
//             }
//       }
//       className={`card ${highlight ? "hl" : ""}`}
//     >
//       {highlight && (
//         <HighlightProgressBar
//           duration={itemChangeMs}
//           progressKey={progressKey}
//         />
//       )}

//       <div className="card-shadow" />
//       <div className="card-rim" />

//       <div className="card-image">
//         {item.image ? (
//           <img src={item.image} alt={item.name} loading="lazy" />
//         ) : (
//           <div
//             style={{
//               position: "absolute",
//               inset: 0,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: 54,
//               opacity: 0.18,
//             }}
//           >
//             {item.emoji}
//           </div>
//         )}

//         <div className="card-tint" style={{ background: tint }} />

//         {highlight && (
//           <motion.div
//             className="card-beam"
//             initial={{ x: "-20%" }}
//             animate={{ x: "260%" }}
//             transition={{ duration: 2.1, repeat: Infinity, ease: "linear" }}
//           />
//         )}

//         {config && Icon && (
//           <div
//             className="card-badge"
//             style={{
//               background: config.bg,
//               color: config.text,
//               border: `1px solid ${config.border}`,
//               boxShadow: `0 0 16px ${config.glow}`,
//             }}
//           >
//             <Icon size={8} />
//             {config.label}
//           </div>
//         )}

//         {item.featured && (
//           <div className="card-featured">
//             <Star size={8} />
//             Featured
//           </div>
//         )}

//         <div className={`card-status ${item.available === false ? "out" : ""}`}>
//           {item.available === false ? "Sold Out" : "Available"}
//         </div>

//         <div className="card-price-float">¥{item.price.toLocaleString()}</div>
//       </div>

//       <div className="card-body">
//         <div className="card-name">{item.name}</div>
//         {item.nameJp && <div className="card-jp">{item.nameJp}</div>}
//         <div className="card-desc">{item.desc}</div>

//         <div className="card-footer">
//           <div className="card-main-price">¥{item.price.toLocaleString()}</div>
//           <div className="card-meta">
//             {item.calories != null && (
//               <div className="card-cal">
//                 <Flame size={8} />
//                 {item.calories} kcal
//               </div>
//             )}
//             <SpiceRow level={item.spicyLevel} />
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }

// function AdminOverlay({
//   category,
//   setCategory,
//   autoMove,
//   setAutoMove,
//   autoCategory,
//   setAutoCategory,
//   itemChangeMs,
//   setItemChangeMs,
//   effect3d,
//   setEffect3d,
//   highlightIndex,
//   setHighlightIndex,
//   visibleCount,
//   onClose,
//   onSkipNext,
// }: {
//   category: Cat;
//   setCategory: (v: Cat) => void;
//   autoMove: boolean;
//   setAutoMove: React.Dispatch<React.SetStateAction<boolean>>;
//   autoCategory: boolean;
//   setAutoCategory: React.Dispatch<React.SetStateAction<boolean>>;
//   itemChangeMs: number;
//   setItemChangeMs: React.Dispatch<React.SetStateAction<number>>;
//   effect3d: Effect3D;
//   setEffect3d: React.Dispatch<React.SetStateAction<Effect3D>>;
//   highlightIndex: number;
//   setHighlightIndex: React.Dispatch<React.SetStateAction<number>>;
//   visibleCount: number;
//   onClose: () => void;
//   onSkipNext: () => void;
// }) {
//   const sliderFillPct = ((itemChangeMs - 1500) / (12000 - 1500)) * 100;

//   return (
//     <div className="admin-overlay">
//       <div className="admin-head">
//         <div className="admin-headleft">
//           <ShieldCheck size={20} color="var(--gold)" />
//           <div>
//             <div className="admin-title-main">TV Control</div>
//             <div className="admin-title-sub">clean display system</div>
//           </div>
//         </div>
//         <button className="icon-btn" onClick={onClose}>
//           <ChevronRight size={14} />
//         </button>
//       </div>

//       <div className="admin-body">
//         <div className="admin-status-row">
//           <span>
//             Cat: <span style={{ color: "var(--gold)" }}>{category}</span>
//           </span>
//           <span>
//             FX: <span style={{ color: "var(--blue)" }}>{effect3d}</span>
//           </span>
//           <span className={autoMove ? "footer-status on" : "footer-status off"}>
//             {autoMove ? "● Live" : "● Paused"}
//           </span>
//         </div>

//         <div>
//           <div className="admin-section-title">
//             <Play size={10} /> Playback Controls
//           </div>
//           <div className="playback-row">
//             <button
//               className="playback-btn primary"
//               onClick={() => setAutoMove((p) => !p)}
//             >
//               {autoMove ? <Pause size={12} /> : <Play size={12} />}
//               {autoMove ? "Pause" : "Resume"}
//             </button>
//             <button className="playback-btn" onClick={onSkipNext}>
//               <SkipForward size={12} />
//               Skip
//             </button>
//             <button
//               className={`playback-btn ${autoCategory ? "primary" : ""}`}
//               onClick={() => setAutoCategory((p) => !p)}
//             >
//               <RefreshCcw size={12} />
//               Auto Cat
//             </button>
//           </div>
//         </div>

//         <div>
//           <div className="admin-section-title">
//             <Eye size={10} /> Item Focus ({highlightIndex + 1} / {visibleCount})
//           </div>
//           <div className="item-dots-row">
//             {Array.from({ length: visibleCount }).map((_, i) => (
//               <button
//                 key={i}
//                 className={`item-dot ${i === highlightIndex ? "active" : ""}`}
//                 onClick={() => {
//                   setAutoMove(false);
//                   setHighlightIndex(i);
//                 }}
//               >
//                 {i + 1}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div>
//           <div className="admin-section-title">
//             <Timer size={10} /> Item Display Time
//           </div>

//           <div className="admin-card">
//             <div className="admin-label">
//               <span>Change Interval</span>
//               <span className={`admin-val ${autoMove ? "live" : ""}`}>
//                 {(itemChangeMs / 1000).toFixed(1)}s per item
//               </span>
//             </div>

//             <div className="time-ring-wrap">
//               <div>
//                 <div className="time-ring-value">
//                   {(itemChangeMs / 1000).toFixed(1)}
//                 </div>
//                 <div className="time-ring-unit">seconds per item</div>
//               </div>
//             </div>

//             <div className="time-presets">
//               {TIME_PRESETS.map((p) => (
//                 <button
//                   key={p.ms}
//                   className={`time-preset-btn ${
//                     itemChangeMs === p.ms ? "active" : ""
//                   }`}
//                   onClick={() => setItemChangeMs(p.ms)}
//                 >
//                   <span>{p.label}</span>
//                   <span className="time-preset-label">{p.speed}</span>
//                 </button>
//               ))}
//             </div>

//             <div className="time-slider-wrap">
//               <div
//                 className="slider-track-fill"
//                 style={{ width: `calc(${sliderFillPct}% - 13px)` }}
//               />
//               <input
//                 type="range"
//                 className="admin-range"
//                 min={1500}
//                 max={12000}
//                 step={250}
//                 value={itemChangeMs}
//                 onChange={(e) => setItemChangeMs(Number(e.target.value))}
//               />
//             </div>

//             <div className="slider-ticks">
//               <span>1.5s</span>
//               <span>Fast ←——→ Slow</span>
//               <span>12s</span>
//             </div>
//           </div>
//         </div>

//         <div>
//           <div className="admin-section-title">
//             <Layers size={10} /> 3D Transition Effect
//           </div>

//           <div className="effect-grid">
//             {EFFECT_OPTIONS.map((opt) => (
//               <button
//                 key={opt.id}
//                 className={`effect-btn ${effect3d === opt.id ? "active" : ""}`}
//                 onClick={() => setEffect3d(opt.id)}
//               >
//                 <span className="effect-btn-label">{opt.label}</span>
//                 <span className="effect-btn-desc">{opt.desc}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         <div>
//           <div className="admin-section-title">
//             <Sliders size={10} /> Category
//           </div>

//           <div className="admin-card">
//             <div className="admin-label">
//               <span>Manual Select</span>
//               <span className="admin-val">{category}</span>
//             </div>
//             <select
//               className="admin-select"
//               value={category}
//               onChange={(e) => setCategory(e.target.value as Cat)}
//             >
//               {CATS.map((c) => (
//                 <option key={c} value={c}>
//                   {c}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="admin-hotkeys">
//           <span className="hk">A</span>Panel
//           <span className="hk">T</span>Theme
//           <span className="hk">1-5</span>Cat
//           <span className="hk">Space</span>Pause
//           <span className="hk">→</span>Skip
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function DisplayPage() {
//   const [dark, setDark] = useState<boolean>(() => {
//     if (typeof window === "undefined") return true;
//     const saved = window.localStorage.getItem("tv-theme");
//     if (saved === "light") return false;
//     if (saved === "dark") return true;
//     return true;
//   });

//   const [category, setCategory] = useState<Cat>("All");
//   const [promoIndex, setPromoIndex] = useState(0);
//   const [adminOpen, setAdminOpen] = useState(false);
//   const [highlightIndex, setHighlightIndex] = useState(0);
//   const [autoMove, setAutoMove] = useState(true);
//   const [autoCategory, setAutoCategory] = useState(true);
//   const [navDirection, setNavDirection] = useState<1 | -1>(1);
//   const [effect3d, setEffect3d] = useState<Effect3D>("orbit");
//   const [itemChangeMs, setItemChangeMs] = useState<number>(() => {
//     if (typeof window === "undefined") return 5000;
//     const saved = window.localStorage.getItem("tv-item-change-ms");
//     return saved ? Number(saved) : 5000;
//   });

//   const scrollRef = useRef<HTMLDivElement | null>(null);

//   const changeCategory = (next: Cat) => {
//     if (next === category) return;
//     const ci = CATS.indexOf(category);
//     const ni = CATS.indexOf(next);
//     setNavDirection(ni > ci ? 1 : -1);
//     setCategory(next);
//   };

//   const visibleItems = useMemo(() => {
//     const filtered =
//       category === "All"
//         ? MENU_ITEMS_INITIAL
//         : MENU_ITEMS_INITIAL.filter((i) => i.category === category);

//     return category === "All" ? filtered.slice(0, 12) : filtered;
//   }, [category]);

//   const currentPromo = PROMOS_INITIAL[promoIndex];

//   const skipNext = () => {
//     if (!visibleItems.length) return;
//     setHighlightIndex((prev) => (prev + 1) % visibleItems.length);
//   };

//   const prevPromo = () => {
//     setPromoIndex((prev) => (prev - 1 + PROMOS_INITIAL.length) % PROMOS_INITIAL.length);
//   };

//   const nextPromo = () => {
//     setPromoIndex((prev) => (prev + 1) % PROMOS_INITIAL.length);
//   };

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       window.localStorage.setItem("tv-theme", dark ? "dark" : "light");
//     }
//   }, [dark]);

//   useEffect(() => {
//     if (typeof document === "undefined") return;
//     document.body.classList.toggle("light", !dark);
//     document.body.classList.toggle("dark", dark);
//   }, [dark]);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       window.localStorage.setItem("tv-item-change-ms", String(itemChangeMs));
//     }
//   }, [itemChangeMs]);

//   useEffect(() => {
//     if (!visibleItems.length) return;
//     setHighlightIndex((prev) => Math.min(prev, visibleItems.length - 1));
//   }, [visibleItems.length]);

//   useEffect(() => {
//     if (!autoMove || !visibleItems.length) return;
//     const id = window.setInterval(() => {
//       setHighlightIndex((prev) => (prev + 1) % visibleItems.length);
//     }, itemChangeMs);
//     return () => window.clearInterval(id);
//   }, [autoMove, visibleItems.length, itemChangeMs]);

//   useEffect(() => {
//     const id = window.setInterval(() => {
//       setPromoIndex((prev) => (prev + 1) % PROMOS_INITIAL.length);
//     }, 6000);
//     return () => window.clearInterval(id);
//   }, []);

//   useEffect(() => {
//     if (!autoCategory) return;
//     const id = window.setInterval(() => {
//       setCategory((prev) => {
//         const idx = CATS.indexOf(prev);
//         const next = CATS[(idx + 1) % CATS.length];
//         setNavDirection(1);
//         return next;
//       });
//     }, 18000);
//     return () => window.clearInterval(id);
//   }, [autoCategory]);

//   useEffect(() => {
//     const el = scrollRef.current;
//     if (!el) return;

//     if (category !== "All") {
//       const cardHeight = 292 + 14;
//       const targetTop = Math.max(0, highlightIndex * cardHeight - 20);
//       el.scrollTo({ top: targetTop, behavior: "smooth" });
//     } else {
//       el.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   }, [highlightIndex, category]);

//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       const k = e.key.toLowerCase();

//       if (k === "a") setAdminOpen((v) => !v);
//       if (k === "t") setDark((v) => !v);
//       if (e.code === "Space") {
//         e.preventDefault();
//         setAutoMove((v) => !v);
//       }
//       if (e.key === "ArrowRight") skipNext();

//       if (k === "1") changeCategory("All");
//       if (k === "2") changeCategory("Chicken");
//       if (k === "3") changeCategory("Burger");
//       if (k === "4") changeCategory("Set");
//       if (k === "5") changeCategory("Drink");
//     };

//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [category, visibleItems.length]);

//   return (
//     <div className={`page ${dark ? "dark" : "light"}`}>
//       <style>{CSS}</style>

//       <div className="root">
//         <div className="topbar">
//           <div className="brand">
//             <div className="brand-mark">
//               <UtensilsCrossed size={22} />
//             </div>
//             <div>
//               <div className="brand-name">Neo Menu Vision</div>
//               <div className="brand-tagline">premium tv menu showcase</div>
//             </div>
//           </div>

//           <div className="topbar-right">
//             <div className={`sync-pill ${navigator.onLine ? "on" : "off"}`}>
//               <span className="sync-dot" />
//               {navigator.onLine ? (
//                 <>
//                   <Wifi size={12} />
//                   online
//                 </>
//               ) : (
//                 <>
//                   <WifiOff size={12} />
//                   offline
//                 </>
//               )}
//             </div>

//             <div className="cat-strip">
//               {CATS.map((c) => (
//                 <button
//                   key={c}
//                   className={`cat-btn ${category === c ? "active" : ""}`}
//                   onClick={() => changeCategory(c)}
//                 >
//                   {c}
//                 </button>
//               ))}
//             </div>

//             <button className="icon-btn" onClick={() => setDark((v) => !v)}>
//               {dark ? <Sun size={16} /> : <Moon size={16} />}
//             </button>

//             <button className="icon-btn" onClick={() => setAdminOpen(true)}>
//               <Settings2 size={16} />
//             </button>

//             <LiveClock />
//           </div>
//         </div>

//         <div className="hero-shell">
//           <div className="hero">
//             <AnimatePresence mode="wait">
//               <motion.div
//                 key={currentPromo.id}
//                 variants={heroVariants}
//                 initial="initial"
//                 animate="animate"
//                 exit="exit"
//                 style={{ position: "absolute", inset: 0 }}
//               >
//                 <div
//                   className="hero-layer"
//                   style={{
//                     backgroundImage: currentPromo.image
//                       ? `url(${currentPromo.image})`
//                       : "none",
//                     backgroundColor: currentPromo.image ? "transparent" : "#111",
//                   }}
//                 />
//                 <div className="hero-overlay" />

//                 <div className="hero-content">
//                   <div
//                     className="hero-eyebrow"
//                     style={{ color: currentPromo.accent }}
//                   >
//                     <Sparkles size={12} />
//                     {currentPromo.tag}
//                   </div>

//                   <div className="hero-title">{currentPromo.title}</div>
//                   <div className="hero-sub">{currentPromo.subtitle}</div>

//                   <div className="hero-price-row">
//                     <div className="hero-price">{currentPromo.price}</div>
//                     <div className="hero-price-label">
//                       limited showcase offer
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             </AnimatePresence>

//             <div className="hero-dots">
//               {PROMOS_INITIAL.map((promo, index) => (
//                 <button
//                   key={promo.id}
//                   className={`hero-dot ${promoIndex === index ? "active" : ""}`}
//                   onClick={() => setPromoIndex(index)}
//                 />
//               ))}
//             </div>

//             <div className="hero-controls">
//               <button className="hero-nav-btn" onClick={prevPromo}>
//                 <ChevronLeft size={16} />
//               </button>
//               <button className="hero-nav-btn" onClick={nextPromo}>
//                 <ChevronRight size={16} />
//               </button>
//             </div>
//           </div>

//           <div className="qr-panel">
//             <div className="qr-head">
//               <div>
//                 <div className="qr-title">Scan & Order</div>
//                 <div className="qr-sub">mobile order / pickup / table service</div>
//               </div>

//               <div className="qr-chip">
//                 <QrCode size={14} />
//                 Quick Scan
//               </div>
//             </div>

//             <div className="qr-box">
//               <div className="qr-frame">
//                 <img
//                   src={ORDER_QR_URL}
//                   alt="Order QR"
//                   loading="eager"
//                   crossOrigin="anonymous"
//                 />
//               </div>
//             </div>

//             <div className="qr-link">
//               <span className="qr-link-label">order link</span>
//               <span className="qr-link-value">{ORDER_LINK}</span>
//             </div>

//             <div className="qr-footer">
//               <span>Elegant QR card · easy mobile read</span>
//               <span>All code edges kept clear</span>
//             </div>
//           </div>
//         </div>

//         <div className="section-bar">
//           <div className="section-left">
//             <div className="section-heading">
//               {category === "All" ? (
//                 <>
//                   <em>Featured</em> Items
//                 </>
//               ) : (
//                 <>
//                   <em>{category}</em> Menu
//                 </>
//               )}
//             </div>

//             <div className="section-meta">
//               {visibleItems.length} items · {effect3d} 3D mode
//             </div>
//           </div>

//           <div className="section-right">
//             <div className="tag-pill">
//               <Tv2 size={10} />
//               showroom mode
//             </div>
//             <div className="tag-pill">
//               <MonitorSmartphone size={10} />
//               qr ready
//             </div>
//             <div className="tag-pill" style={{ color: "var(--gold)" }}>
//               <Timer size={10} />
//               {(itemChangeMs / 1000).toFixed(1)}s
//             </div>
//           </div>
//         </div>

//         <div className="menu-shell">
//           <div className="menu-curved-stage" />

//           <div className="menu-scroll" ref={scrollRef}>
//             <div className="menu-grid-wrap">
//               <AnimatePresence mode="wait" custom={navDirection}>
//                 <motion.div
//                   key={category}
//                   variants={stageVariants}
//                   custom={navDirection}
//                   initial="enter"
//                   animate="center"
//                   exit="exit"
//                   className={`menu-grid ${
//                     category === "All" ? "fixed-all" : "scrolling"
//                   }`}
//                 >
//                   {visibleItems.map((item, index) => (
//                     <MenuCard
//                       key={`${category}-${item.id}`}
//                       item={item}
//                       highlight={index === highlightIndex}
//                       direction={navDirection}
//                       effect={effect3d}
//                       itemChangeMs={itemChangeMs}
//                     />
//                   ))}
//                 </motion.div>
//               </AnimatePresence>
//             </div>
//           </div>
//         </div>

//         <div className="footer">
//           <div className="footer-side">
//             <Clock size={10} />
//             <span>Neo Menu Vision</span>
//             <div className="footer-div" />
//             <span>Clean TV View</span>
//             <div className="footer-div" />
//             <span style={{ color: "var(--blue)" }}>{effect3d} mode</span>
//           </div>

//           <div className="footer-side">
//             <Radio size={10} />
//             <span className={autoMove ? "footer-status on" : "footer-status off"}>
//               {autoMove ? "Auto Play On" : "Auto Play Off"}
//             </span>
//           </div>
//         </div>
//       </div>

//       <AnimatePresence>
//         {adminOpen && (
//           <motion.div
//             initial={{ opacity: 0, x: 80, scale: 0.96 }}
//             animate={{ opacity: 1, x: 0, scale: 1 }}
//             exit={{ opacity: 0, x: 80, scale: 0.96 }}
//             transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
//             style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
//           >
//             <div style={{ pointerEvents: "auto" }}>
//               <AdminOverlay
//                 category={category}
//                 setCategory={changeCategory}
//                 autoMove={autoMove}
//                 setAutoMove={setAutoMove}
//                 autoCategory={autoCategory}
//                 setAutoCategory={setAutoCategory}
//                 itemChangeMs={itemChangeMs}
//                 setItemChangeMs={setItemChangeMs}
//                 effect3d={effect3d}
//                 setEffect3d={setEffect3d}
//                 highlightIndex={highlightIndex}
//                 setHighlightIndex={setHighlightIndex}
//                 visibleCount={visibleItems.length}
//                 onClose={() => setAdminOpen(false)}
//                 onSkipNext={skipNext}
//               />
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }










"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award, ChevronLeft, ChevronRight, Clock, Eye, Flame, Layers,
  MonitorSmartphone, Moon, Pause, Play, QrCode, Radio, RefreshCcw,
  Settings2, ShieldCheck, SkipForward, Sliders, Sparkles, Star, Sun,
  Timer, TrendingUp, Tv2, UtensilsCrossed, Wifi, WifiOff, Zap,
} from "lucide-react";

/* ── Types ─────────────────────────────────── */
type Cat = "All" | "Chicken" | "Burger" | "Set" | "Drink";
type Badge = "New" | "Hot" | "Special" | "Best";
type Effect3D = "orbit" | "flip" | "zDepth" | "carousel" | "warp" | "scatter";

interface MenuItem {
  id: number; name: string; nameJp?: string; price: number;
  category: Exclude<Cat, "All">; badge?: Badge; desc: string;
  calories?: number | null; emoji: string; featured?: boolean;
  image?: string; available?: boolean; spicyLevel?: 0|1|2|3;
}
interface Promo {
  id: number; title: string; subtitle: string; tag: string;
  price?: string; emoji: string; accent: string; gradient: string; image?: string;
}

const ORDER_LINK = "https://your-real-order-page.example.com";
const ORDER_QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=700x700&margin=30&data=${encodeURIComponent(ORDER_LINK)}`;

/* ── Data ───────────────────────────────────── */
const PROMOS_INITIAL: Promo[] = [
  { id:1, title:"Double Crispy Chicken", subtitle:"Golden fried, twice the crunch — today only", tag:"LIMITED TIME", price:"¥890", emoji:"🍗", accent:"#FF9A3D", gradient:"linear-gradient(135deg,#2b0d00,#7a2e00)", image:"https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=1800&auto=format&fit=crop" },
  { id:2, title:"Wagyu Smash Burger", subtitle:"Premium Japanese Wagyu with deep smoky finish", tag:"CHEF'S PICK", price:"¥1,280", emoji:"🍔", accent:"#FF5B57", gradient:"linear-gradient(135deg,#2b0008,#7a1018)", image:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1800&auto=format&fit=crop" },
  { id:3, title:"Premium Set Lunch", subtitle:"Main + Side + Drink — fast, rich, complete", tag:"LUNCH SET", price:"¥1,050", emoji:"🍱", accent:"#3FE089", gradient:"linear-gradient(135deg,#07130d,#19442d)", image:"https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=1800&auto=format&fit=crop" },
  { id:4, title:"Matcha Latte Special", subtitle:"Ceremonial grade matcha with oat milk", tag:"NEW ARRIVAL", price:"¥650", emoji:"🍵", accent:"#55E0B7", gradient:"linear-gradient(135deg,#081312,#15483f)", image:"https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=1800&auto=format&fit=crop" },
];

const MENU_ITEMS_INITIAL: MenuItem[] = [
  { id:1, name:"Spicy Karaage", nameJp:"スパイシー唐揚げ", price:680, category:"Chicken", badge:"Hot", desc:"Double-marinated juicy fried chicken, yuzu kosho mayo", calories:420, emoji:"🍗", featured:true, available:true, spicyLevel:2, image:"https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=1600&auto=format&fit=crop" },
  { id:2, name:"Crispy Tenders", nameJp:"クリスピーテンダー", price:750, category:"Chicken", badge:"Best", desc:"Panko-crusted strips with house dipping sauce", calories:390, emoji:"🍖", available:true, spicyLevel:1, image:"https://images.unsplash.com/photo-1562967916-eb82221dfb92?q=80&w=1600&auto=format&fit=crop" },
  { id:3, name:"Butter Garlic Wings", nameJp:"バターガーリックウイング", price:820, category:"Chicken", desc:"8pc glazed wings, honey soy reduction", calories:510, emoji:"🍗", available:true, spicyLevel:1, image:"https://images.unsplash.com/photo-1527477396000-e27163b481c2?q=80&w=1600&auto=format&fit=crop" },
  { id:4, name:"Smash Burger", nameJp:"スマッシュバーガー", price:980, category:"Burger", badge:"New", desc:"Double smashed patty, American cheese, pickles, secret sauce", calories:650, emoji:"🍔", featured:true, available:true, spicyLevel:0, image:"https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1600&auto=format&fit=crop" },
  { id:5, name:"Teriyaki Burger", nameJp:"テリヤキバーガー", price:880, category:"Burger", badge:"Best", desc:"Teriyaki glaze, cabbage slaw, kewpie mayo", calories:580, emoji:"🍔", available:true, spicyLevel:0, image:"https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1600&auto=format&fit=crop" },
  { id:6, name:"Mushroom Swiss", nameJp:"マッシュルームスイス", price:960, category:"Burger", desc:"Sautéed mushrooms, Swiss cheese, caramelized onion", calories:620, emoji:"🍔", available:true, spicyLevel:0, image:"https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=1600&auto=format&fit=crop" },
  { id:7, name:"Chicken Set A", nameJp:"チキンセットA", price:1050, category:"Set", badge:"Special", desc:"Karaage + rice + miso soup + salad", calories:780, emoji:"🍱", featured:true, available:true, spicyLevel:1, image:"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1600&auto=format&fit=crop" },
  { id:8, name:"Burger Set B", nameJp:"バーガーセットB", price:1150, category:"Set", desc:"Smash burger + fries + soft drink", calories:920, emoji:"🍱", available:true, spicyLevel:0, image:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop" },
  { id:9, name:"Family Feast", nameJp:"ファミリーフィースト", price:2800, category:"Set", badge:"Hot", desc:"4 items + 4 drinks + dessert — serves 4", calories:null, emoji:"🎉", available:true, spicyLevel:1, image:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop" },
  { id:10, name:"Matcha Latte", nameJp:"抹茶ラテ", price:580, category:"Drink", badge:"New", desc:"Ceremonial grade, choice of milk, iced or hot", calories:180, emoji:"🍵", featured:true, available:true, spicyLevel:0, image:"https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=1600&auto=format&fit=crop" },
  { id:11, name:"Yuzu Lemonade", nameJp:"柚子レモネード", price:480, category:"Drink", desc:"Fresh yuzu, honey, sparkling water", calories:120, emoji:"🍋", available:true, spicyLevel:0, image:"https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1600&auto=format&fit=crop" },
  { id:12, name:"Cold Brew Coffee", nameJp:"コールドブリュー", price:520, category:"Drink", desc:"18-hour steep, oat milk optional", calories:15, emoji:"☕", available:true, spicyLevel:0, image:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1600&auto=format&fit=crop" },
];

const CATS: Cat[] = ["All","Chicken","Burger","Set","Drink"];
const CAT_EMOJI: Record<string,string> = { All:"🍽️", Chicken:"🍗", Burger:"🍔", Set:"🍱", Drink:"🥤" };

const EFFECT_OPTIONS: { id: Effect3D; label: string; desc: string; emoji: string }[] = [
  { id:"orbit",    label:"Orbit",    desc:"3D orbit",    emoji:"🌀" },
  { id:"flip",     label:"Flip",     desc:"Y-axis flip", emoji:"🔄" },
  { id:"zDepth",   label:"Z-Depth",  desc:"Z-axis surge",emoji:"💫" },
  { id:"carousel", label:"Carousel", desc:"Curved sweep",emoji:"🎠" },
  { id:"warp",     label:"Warp",     desc:"Space warp",  emoji:"⚡" },
  { id:"scatter",  label:"Scatter",  desc:"Explode!",    emoji:"💥" },
];

const TIME_PRESETS = [
  { ms:2500, label:"2.5s", speed:"Fast",  emoji:"⚡" },
  { ms:4000, label:"4s",   speed:"Quick", emoji:"🐇" },
  { ms:5000, label:"5s",   speed:"Normal",emoji:"🚶" },
  { ms:7000, label:"7s",   speed:"Slow",  emoji:"🐢" },
  { ms:10000,label:"10s",  speed:"Lazy",  emoji:"😴" },
];

const BADGE_CONFIG: Record<Badge,{ bg:string; text:string; border:string; icon:React.ElementType; label:string; glow:string; emoji:string }> = {
  Hot:     { bg:"rgba(255,107,107,.18)", text:"#FF6B6B", border:"rgba(255,107,107,.4)", icon:Flame,     label:"HOT",     glow:"rgba(255,107,107,.3)",  emoji:"🔥" },
  New:     { bg:"rgba(107,203,119,.15)", text:"#6BCB77", border:"rgba(107,203,119,.35)",icon:Zap,       label:"NEW",     glow:"rgba(107,203,119,.25)", emoji:"✨" },
  Special: { bg:"rgba(255,211,61,.15)",  text:"#FFD93D", border:"rgba(255,211,61,.35)", icon:Award,     label:"SPECIAL", glow:"rgba(255,211,61,.25)",  emoji:"⭐" },
  Best:    { bg:"rgba(78,205,196,.15)",  text:"#4ECDC4", border:"rgba(78,205,196,.35)", icon:TrendingUp, label:"BEST",    glow:"rgba(78,205,196,.25)",  emoji:"🏆" },
};

const CAT_COLOR: Record<string,string> = {
  Chicken:"#FF9A3D", Burger:"#FF6B6B", Set:"#6BCB77", Drink:"#4ECDC4",
};

/* ── CSS ────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');

*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden}

:root{
  --bg1:#0a0f1a;
  --bg2:#060c16;
  --panel:rgba(255,255,255,0.07);
  --panel2:rgba(255,255,255,0.05);
  --border:rgba(255,255,255,0.12);
  --border2:rgba(255,255,255,0.20);
  --text:#ffffff;
  --muted:rgba(255,255,255,0.7);
  --soft:rgba(255,255,255,0.45);
  --gold:#FFD93D;
  --orange:#FF9A3D;
  --pink:#FF6B6B;
  --teal:#4ECDC4;
  --green:#6BCB77;
  --purple:#C77DFF;
  --font-display:'Fredoka One',cursive;
  --font-body:'Nunito',sans-serif;
  --r:20px;
  --r-lg:28px;
}

body{
  font-family:var(--font-body);
  color:var(--text);
  background:var(--bg1);
}

/* Animated background */
body::before{
  content:"";
  position:fixed;
  inset:0;
  pointer-events:none;
  background:
    radial-gradient(circle at 10% 15%, rgba(255,107,107,0.12), transparent 30%),
    radial-gradient(circle at 88% 12%, rgba(255,211,61,0.10), transparent 28%),
    radial-gradient(circle at 75% 88%, rgba(78,205,196,0.10), transparent 28%),
    radial-gradient(circle at 18% 82%, rgba(107,203,119,0.08), transparent 25%),
    linear-gradient(180deg, var(--bg1) 0%, var(--bg2) 100%);
  z-index:0;
}

/* Polka dots overlay */
body::after{
  content:"";
  position:fixed;
  inset:0;
  pointer-events:none;
  background:radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size:28px 28px;
  z-index:0;
}

.page{
  position:relative;
  width:100vw;
  height:100vh;
  overflow:hidden;
  z-index:1;
}

.root{
  position:relative;
  z-index:2;
  width:100%;
  height:100%;
  padding:14px;
  display:grid;
  grid-template-rows:68px 230px 48px 1fr 44px;
  gap:10px;
  overflow:hidden;
}

/* ── TOPBAR ─────────────────────────────── */
.topbar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

.brand{
  display:flex;
  align-items:center;
  gap:12px;
}

.brand-mark{
  width:52px;
  height:52px;
  border-radius:18px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:linear-gradient(135deg, #FF9A3D, #FFD93D);
  border:3px solid rgba(255,255,255,0.4);
  box-shadow:0 8px 24px rgba(255,154,61,0.4);
  animation:wiggle-brand 4s ease-in-out infinite;
}

@keyframes wiggle-brand{
  0%,100%{transform:rotate(-4deg)}
  50%{transform:rotate(4deg)}
}

.brand-name{
  font-family:var(--font-display);
  font-size:26px;
  line-height:1;
  color:var(--text);
  text-shadow:0 4px 12px rgba(255,154,61,0.4);
}

.brand-tagline{
  margin-top:3px;
  font-size:10px;
  color:var(--soft);
  font-weight:700;
  letter-spacing:0.1em;
  text-transform:uppercase;
}

.topbar-right{
  display:flex;
  align-items:center;
  gap:8px;
}

.sync-pill{
  height:36px;
  padding:0 14px;
  border-radius:999px;
  display:flex;
  align-items:center;
  gap:7px;
  border:2.5px solid var(--border2);
  background:var(--panel);
  font-size:11px;
  font-weight:800;
  letter-spacing:0.05em;
  color:var(--muted);
  backdrop-filter:blur(16px);
}

.sync-pill.on{ color:var(--green); border-color:rgba(107,203,119,0.4); }
.sync-pill.off{ color:var(--pink); border-color:rgba(255,107,107,0.4); }

.sync-dot{
  width:8px; height:8px;
  border-radius:50%;
  background:currentColor;
  animation:pulseDot 1.8s ease-in-out infinite;
}

@keyframes pulseDot{
  0%,100%{opacity:1;transform:scale(1)}
  50%{opacity:0.4;transform:scale(0.65)}
}

.cat-strip{
  height:44px;
  padding:5px;
  display:flex;
  gap:4px;
  border-radius:999px;
  border:2.5px solid var(--border2);
  background:var(--panel);
  backdrop-filter:blur(16px);
}

.cat-btn{
  height:100%;
  border:none;
  background:transparent;
  color:var(--muted);
  padding:0 14px;
  border-radius:999px;
  font-size:12px;
  font-weight:900;
  cursor:pointer;
  transition:0.2s ease;
  font-family:var(--font-body);
  display:flex;
  align-items:center;
  gap:5px;
}

.cat-btn:hover{
  color:var(--text);
  background:rgba(255,255,255,0.08);
}

.cat-btn.active{
  color:#fff;
  background:linear-gradient(135deg,#FF9A3D,#FFD93D);
  box-shadow:0 4px 16px rgba(255,154,61,0.45);
}

.clock{
  min-width:100px;
  text-align:right;
  font-family:var(--font-display);
  font-size:32px;
  color:var(--gold);
  text-shadow:0 4px 12px rgba(255,211,61,0.4);
}

.icon-btn{
  width:40px; height:40px;
  border-radius:14px;
  border:2.5px solid var(--border2);
  background:var(--panel);
  color:var(--muted);
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  transition:0.2s ease;
  backdrop-filter:blur(16px);
}

.icon-btn:hover{
  color:var(--text);
  transform:translateY(-2px);
  border-color:rgba(255,154,61,0.5);
  box-shadow:0 6px 16px rgba(255,154,61,0.25);
}

/* ── HERO SHELL ───────────────────────── */
.hero-shell{
  display:grid;
  grid-template-columns:1fr 280px;
  gap:10px;
  min-height:0;
}

.hero{
  position:relative;
  overflow:hidden;
  border-radius:var(--r-lg);
  border:2.5px solid var(--border2);
  background:var(--panel2);
  backdrop-filter:blur(20px);
  box-shadow:0 16px 40px rgba(0,0,0,0.3);
}

.hero-layer{
  position:absolute;
  inset:0;
  background-size:cover;
  background-position:center;
  transition:opacity 0.4s;
}

.hero-overlay{
  position:absolute;
  inset:0;
  background:linear-gradient(90deg, rgba(5,8,15,0.72) 0%, rgba(5,8,15,0.3) 55%, rgba(5,8,15,0.08) 100%);
}

.hero-content{
  position:relative;
  z-index:2;
  height:100%;
  padding:22px 26px;
  display:flex;
  flex-direction:column;
  justify-content:flex-end;
  gap:6px;
}

.hero-eyebrow{
  width:fit-content;
  display:flex;
  align-items:center;
  gap:7px;
  padding:5px 12px;
  border-radius:999px;
  border:2px solid rgba(255,255,255,0.2);
  backdrop-filter:blur(12px);
  background:rgba(255,255,255,0.1);
  font-size:10px;
  font-weight:900;
  letter-spacing:0.14em;
  text-transform:uppercase;
}

.hero-title{
  font-family:var(--font-display);
  font-size:46px;
  line-height:0.95;
  color:var(--text);
  text-shadow:0 8px 28px rgba(0,0,0,0.4);
}

.hero-sub{
  max-width:480px;
  font-size:13px;
  color:rgba(255,255,255,0.85);
  line-height:1.6;
  font-weight:600;
}

.hero-price-row{
  display:flex;
  align-items:flex-end;
  gap:10px;
  margin-top:4px;
}

.hero-price{
  font-family:var(--font-display);
  font-size:44px;
  color:var(--gold);
  text-shadow:0 4px 12px rgba(255,211,61,0.5);
}

.hero-price-label{
  font-size:10px;
  color:rgba(255,255,255,0.55);
  font-weight:700;
  letter-spacing:0.1em;
  text-transform:uppercase;
}

.hero-dots{
  position:absolute;
  left:22px;
  bottom:18px;
  display:flex;
  gap:6px;
  z-index:4;
}

.hero-dot{
  width:10px; height:5px;
  border:none;
  border-radius:999px;
  background:rgba(255,255,255,0.3);
  transition:0.25s ease;
  cursor:pointer;
}

.hero-dot.active{
  width:28px;
  background:linear-gradient(90deg,var(--orange),var(--gold));
  box-shadow:0 2px 8px rgba(255,154,61,0.5);
}

.hero-controls{
  position:absolute;
  right:18px;
  bottom:16px;
  display:flex;
  gap:7px;
  z-index:4;
}

.hero-nav-btn{
  width:36px; height:36px;
  border-radius:999px;
  border:2px solid rgba(255,255,255,0.2);
  background:rgba(10,15,25,0.5);
  color:rgba(255,255,255,0.9);
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  backdrop-filter:blur(10px);
  transition:0.2s ease;
}

.hero-nav-btn:hover{
  background:rgba(255,154,61,0.3);
  border-color:rgba(255,154,61,0.5);
}

/* ── QR PANEL ─────────────────────────── */
.qr-panel{
  position:relative;
  overflow:hidden;
  border-radius:var(--r-lg);
  border:2.5px solid var(--border2);
  background:var(--panel2);
  backdrop-filter:blur(20px);
  padding:14px;
  display:flex;
  flex-direction:column;
  gap:10px;
  box-shadow:0 16px 40px rgba(0,0,0,0.25);
}

/* cartoon corner dots */
.qr-panel::before{
  content:"";
  position:absolute;
  top:10px; right:10px;
  width:16px; height:16px;
  border-radius:50%;
  background:rgba(255,211,61,0.3);
}

.qr-head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:8px;
}

.qr-title{
  font-family:var(--font-display);
  font-size:22px;
  color:var(--text);
}

.qr-sub{
  font-size:9px;
  text-transform:uppercase;
  color:var(--soft);
  font-weight:700;
  letter-spacing:0.12em;
  margin-top:2px;
}

.qr-chip{
  display:flex;
  align-items:center;
  gap:5px;
  padding:6px 10px;
  border-radius:999px;
  border:2px solid var(--border2);
  background:rgba(255,211,61,0.1);
  color:var(--gold);
  font-size:9px;
  font-weight:900;
  text-transform:uppercase;
  letter-spacing:0.1em;
  flex-shrink:0;
}

.qr-box{
  flex:1;
  min-height:180px;
  border-radius:20px;
  border:2.5px solid var(--border2);
  display:flex;
  align-items:center;
  justify-content:center;
  background:rgba(255,255,255,0.04);
  padding:10px;
}

.qr-box img{
  width:min(100%,170px);
  max-width:170px;
  border-radius:14px;
  padding:8px;
  background:#fff;
  box-shadow:0 8px 24px rgba(0,0,0,0.25);
}

.qr-link{
  display:flex;
  flex-direction:column;
  gap:3px;
  padding:9px 11px;
  border-radius:12px;
  border:2px solid var(--border);
  background:rgba(255,255,255,0.04);
}

.qr-link-label{
  font-size:8px;
  text-transform:uppercase;
  letter-spacing:0.12em;
  color:var(--soft);
  font-weight:700;
}

.qr-link-value{
  font-size:11px;
  font-weight:700;
  color:var(--muted);
  word-break:break-all;
}

.qr-footer{
  border-top:1.5px solid var(--border);
  padding-top:8px;
  font-size:9px;
  text-transform:uppercase;
  color:var(--soft);
  line-height:1.7;
  letter-spacing:0.1em;
  font-weight:700;
}

/* ── SECTION BAR ──────────────────────── */
.section-bar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}

.section-left{
  display:flex;
  align-items:flex-end;
  gap:10px;
}

.section-heading{
  font-family:var(--font-display);
  font-size:30px;
  line-height:1;
}

.section-heading em{
  color:var(--gold);
  font-style:normal;
}

.section-meta{
  font-size:10px;
  color:var(--soft);
  font-weight:700;
  letter-spacing:0.1em;
  text-transform:uppercase;
}

.section-right{
  display:flex;
  align-items:center;
  gap:7px;
}

.tag-pill{
  height:30px;
  border-radius:999px;
  padding:0 12px;
  display:flex;
  align-items:center;
  gap:5px;
  border:2px solid var(--border2);
  background:var(--panel);
  color:var(--soft);
  font-size:10px;
  font-weight:800;
  text-transform:uppercase;
  letter-spacing:0.1em;
  backdrop-filter:blur(12px);
}

/* ── MENU SHELL ───────────────────────── */
.menu-shell{
  position:relative;
  min-height:0;
  overflow:hidden;
  border-radius:30px;
  perspective:2400px;
}

.menu-curved-stage{
  position:absolute;
  inset:2% 1% 1.5% 1%;
  border-radius:32px;
  background:rgba(255,255,255,0.025);
  border:2px solid rgba(255,255,255,0.06);
  backdrop-filter:blur(10px);
  transform:rotateX(8deg) scale(1.01);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.03), 0 32px 64px rgba(0,0,0,0.18);
  z-index:0;
}

.menu-scroll{
  position:relative;
  z-index:2;
  width:100%;
  height:100%;
  overflow:hidden;
  padding:16px;
}

.menu-grid-wrap{
  position:relative;
  width:100%;
  height:100%;
  transform-style:preserve-3d;
  perspective:2400px;
}

.menu-grid{
  width:100%;
  height:100%;
  display:grid;
  gap:12px;
  transform-style:preserve-3d;
  will-change:transform,opacity,filter;
}

.menu-grid.fixed-all{
  grid-template-columns:repeat(4,minmax(0,1fr));
  grid-template-rows:repeat(3,minmax(0,1fr));
}

.menu-grid.scrolling{
  grid-template-columns:repeat(4,minmax(0,1fr));
  grid-auto-rows:288px;
  align-content:start;
  overflow-y:auto;
  padding-right:2px;
  scrollbar-width:none;
}

.menu-grid.scrolling::-webkit-scrollbar{display:none}

/* ── CARD ─────────────────────────────── */
.card{
  position:relative;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  border-radius:24px;
  border:2.5px solid rgba(255,255,255,0.1);
  background:rgba(12,16,26,0.8);
  backdrop-filter:blur(24px);
  transform-style:preserve-3d;
  backface-visibility:hidden;
  box-shadow:0 16px 40px rgba(0,0,0,0.3);
  transition:border-color 0.3s ease, box-shadow 0.3s ease;
}

.card::before{
  content:"";
  position:absolute;
  inset:0;
  border-radius:inherit;
  background:linear-gradient(135deg,rgba(255,255,255,0.10),transparent 40%,rgba(255,154,61,0.06));
  opacity:0;
  transition:opacity 0.3s ease;
  z-index:4;
  pointer-events:none;
}

.card:hover::before,.card.hl::before{opacity:1}

.card:hover{
  border-color:rgba(255,211,61,0.4);
  box-shadow:0 24px 60px rgba(0,0,0,0.4), 0 0 30px rgba(255,211,61,0.12);
}

.card.hl{
  border-color:rgba(78,205,196,0.5);
  box-shadow:0 32px 80px rgba(0,0,0,0.5), 0 0 60px rgba(78,205,196,0.18);
}

.card-shadow{
  position:absolute;
  left:12%; right:12%;
  bottom:-20px;
  height:24px;
  border-radius:999px;
  background:radial-gradient(circle,rgba(0,0,0,0.4),rgba(0,0,0,0) 72%);
  filter:blur(10px);
  transform:translateZ(-60px);
  pointer-events:none;
}

.card-rim{
  position:absolute;
  inset:0;
  border-radius:inherit;
  border:1.5px solid rgba(255,255,255,0.04);
  z-index:5;
  pointer-events:none;
}

.card-image{
  position:relative;
  flex:0 0 55%;
  overflow:hidden;
  transform:translateZ(24px);
}

.card-image img{
  width:100%; height:100%;
  object-fit:cover;
  display:block;
  transition:transform 0.7s cubic-bezier(0.22,1,0.36,1);
  filter:saturate(1.08) contrast(1.04);
}

.card:hover img{ transform:scale(1.06); }

.card-image::before{
  content:"";
  position:absolute;
  inset:0;
  background:linear-gradient(180deg, transparent 15%, rgba(5,8,15,0.18) 50%, rgba(5,8,15,0.88) 100%);
  z-index:1;
}

/* cartoon color tint */
.card-tint{
  position:absolute;
  inset:0;
  z-index:2;
  mix-blend-mode:screen;
  opacity:0.18;
}

/* shimmer beam */
.card-beam{
  position:absolute;
  top:-10%; left:-24%;
  width:40%; height:140%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent);
  transform:skewX(-16deg);
  z-index:3;
  pointer-events:none;
}

/* ── CARD BADGES ──────────────────────── */
.card-badge{
  position:absolute;
  top:9px; left:9px;
  z-index:6;
  display:flex;
  align-items:center;
  gap:4px;
  padding:4px 9px;
  border-radius:999px;
  font-size:9px;
  font-weight:900;
  letter-spacing:0.1em;
  text-transform:uppercase;
  backdrop-filter:blur(10px);
  border:1.5px solid;
}

.card-featured{
  position:absolute;
  top:9px; right:9px;
  z-index:6;
  display:flex;
  align-items:center;
  gap:3px;
  padding:4px 8px;
  border-radius:999px;
  font-size:9px;
  font-weight:900;
  letter-spacing:0.1em;
  text-transform:uppercase;
  color:var(--gold);
  background:rgba(255,211,61,0.15);
  border:1.5px solid rgba(255,211,61,0.35);
  backdrop-filter:blur(10px);
}

.card-status{
  position:absolute;
  right:9px; bottom:9px;
  z-index:6;
  padding:3px 8px;
  border-radius:999px;
  font-size:8px;
  font-weight:900;
  letter-spacing:0.1em;
  text-transform:uppercase;
  background:rgba(107,203,119,0.18);
  border:1.5px solid rgba(107,203,119,0.35);
  color:var(--green);
  backdrop-filter:blur(10px);
}

.card-status.out{
  background:rgba(255,107,107,0.18);
  border-color:rgba(255,107,107,0.35);
  color:var(--pink);
}

.card-price-float{
  position:absolute;
  left:11px; bottom:9px;
  z-index:6;
  font-family:var(--font-display);
  font-size:22px;
  color:#fff;
  text-shadow:0 4px 16px rgba(0,0,0,0.6);
}

/* ── CARD BODY ────────────────────────── */
.card-body{
  flex:1;
  display:flex;
  flex-direction:column;
  gap:3px;
  padding:11px 13px;
  position:relative;
  transform:translateZ(14px);
  background:rgba(8,12,22,0.75);
}

.card-name{
  font-size:14px;
  font-weight:900;
  line-height:1.2;
  color:var(--text);
  display:-webkit-box;
  -webkit-line-clamp:1;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

.card-jp{
  font-size:10px;
  color:var(--soft);
  font-weight:700;
}

.card-desc{
  margin-top:2px;
  font-size:11px;
  line-height:1.5;
  color:var(--muted);
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
  flex:1;
  font-weight:600;
}

.card-footer{
  margin-top:auto;
  padding-top:8px;
  border-top:1.5px solid rgba(255,255,255,0.07);
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
}

.card-main-price{
  font-family:var(--font-display);
  font-size:22px;
  color:var(--gold);
  text-shadow:0 2px 8px rgba(255,211,61,0.35);
}

.card-meta{
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  gap:3px;
}

.card-cal{
  font-size:8px;
  font-weight:800;
  text-transform:uppercase;
  letter-spacing:0.08em;
  color:var(--soft);
  display:flex;
  align-items:center;
  gap:3px;
}

.spice-row{display:flex;gap:4px}

.spice-pip{
  width:7px; height:7px;
  border-radius:50%;
  background:rgba(255,255,255,0.12);
}

.spice-pip.on{
  background:var(--orange);
  box-shadow:0 0 10px rgba(255,154,61,0.5);
}

/* Progress bar on highlighted card */
.highlight-progress-bar{
  position:absolute;
  bottom:0; left:0;
  height:4px;
  background:linear-gradient(90deg,var(--teal),var(--gold));
  border-radius:0 4px 0 0;
  z-index:10;
}

/* ── FOOTER ───────────────────────────── */
.footer{
  border-radius:18px;
  border:2.5px solid var(--border2);
  background:var(--panel);
  backdrop-filter:blur(16px);
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 14px;
}

.footer-side{
  display:flex;
  align-items:center;
  gap:8px;
  font-size:10px;
  font-weight:800;
  text-transform:uppercase;
  letter-spacing:0.1em;
  color:var(--soft);
}

.footer-div{
  width:1.5px; height:16px;
  background:var(--border2);
}

.footer-status.on{color:var(--green)}
.footer-status.off{color:var(--pink)}

/* ── ADMIN OVERLAY ────────────────────── */
.admin-overlay{
  position:fixed;
  right:16px; top:82px;
  width:420px;
  max-width:calc(100vw - 32px);
  max-height:calc(100vh - 104px);
  overflow-y:auto;
  border-radius:28px;
  border:2.5px solid var(--border2);
  background:rgba(10,15,26,0.97);
  backdrop-filter:blur(36px);
  padding:18px;
  z-index:20;
  box-shadow:0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.6);
  scrollbar-width:none;
}

.admin-overlay::-webkit-scrollbar{display:none}

.admin-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom:16px;
  padding-bottom:14px;
  border-bottom:2px solid rgba(255,255,255,0.07);
}

.admin-headleft{
  display:flex;
  align-items:center;
  gap:10px;
}

.admin-title-main{
  font-family:var(--font-display);
  font-size:24px;
}

.admin-title-sub{
  font-size:9px;
  letter-spacing:0.12em;
  text-transform:uppercase;
  color:var(--soft);
  font-weight:700;
}

.admin-section-title{
  font-size:9px;
  letter-spacing:0.14em;
  text-transform:uppercase;
  color:var(--soft);
  margin-bottom:8px;
  font-weight:800;
  display:flex;
  align-items:center;
  gap:6px;
}

.admin-section-title::after{
  content:"";
  flex:1;
  height:1.5px;
  background:rgba(255,255,255,0.07);
}

.admin-body{
  display:flex;
  flex-direction:column;
  gap:14px;
}

.admin-card{
  border-radius:16px;
  border:2px solid rgba(255,255,255,0.08);
  background:rgba(255,255,255,0.03);
  padding:12px;
}

.admin-label{
  display:flex;
  justify-content:space-between;
  gap:8px;
  margin-bottom:10px;
  font-size:8px;
  letter-spacing:0.1em;
  text-transform:uppercase;
  color:var(--soft);
  font-weight:800;
}

.admin-val{color:var(--gold)}
.admin-val.live{color:var(--green)}

.admin-status-row{
  display:flex;
  justify-content:space-between;
  padding:8px 12px;
  border-radius:12px;
  background:rgba(255,255,255,0.025);
  border:1.5px solid rgba(255,255,255,0.06);
  font-size:9px;
  letter-spacing:0.1em;
  text-transform:uppercase;
  color:var(--soft);
  font-weight:800;
}

.admin-select{
  width:100%;
  height:40px;
  border-radius:14px;
  border:2px solid rgba(255,255,255,0.10);
  background:rgba(255,255,255,0.05);
  color:var(--text);
  padding:0 12px;
  outline:none;
  cursor:pointer;
  font-family:var(--font-body);
  font-weight:700;
  font-size:13px;
}

.admin-hotkeys{
  display:flex;
  gap:7px;
  align-items:center;
  flex-wrap:wrap;
  padding:10px 12px;
  border-radius:12px;
  background:rgba(255,255,255,0.018);
  border:1.5px solid rgba(255,255,255,0.05);
  font-size:9px;
  letter-spacing:0.1em;
  text-transform:uppercase;
  color:var(--soft);
  font-weight:800;
}

.hk{
  min-width:22px; height:20px;
  border-radius:7px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border:1.5px solid rgba(255,255,255,0.14);
  background:rgba(255,255,255,0.06);
  padding:0 5px;
  font-size:8px;
  font-weight:900;
}

.time-presets{
  display:grid;
  grid-template-columns:repeat(5,1fr);
  gap:5px;
  margin-bottom:10px;
}

.time-preset-btn{
  height:52px;
  border-radius:14px;
  border:2px solid rgba(255,255,255,0.08);
  background:rgba(255,255,255,0.04);
  color:var(--muted);
  cursor:pointer;
  font-size:11px;
  font-weight:900;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:2px;
  font-family:var(--font-body);
}

.time-preset-btn.active{
  color:#fff;
  border-color:rgba(255,154,61,0.5);
  background:linear-gradient(135deg,rgba(255,154,61,0.85),rgba(255,211,61,0.80));
  box-shadow:0 8px 20px rgba(255,154,61,0.3);
}

.time-preset-label{
  font-size:7px;
  text-transform:uppercase;
  opacity:0.7;
  font-weight:700;
}

.time-ring-wrap{
  display:flex;
  align-items:center;
  justify-content:center;
  padding:10px 0 8px;
}

.time-ring-value{
  font-family:var(--font-display);
  font-size:44px;
  color:var(--gold);
  line-height:1;
  text-align:center;
  text-shadow:0 4px 12px rgba(255,211,61,0.4);
}

.time-ring-unit{
  font-size:9px;
  letter-spacing:0.12em;
  text-transform:uppercase;
  color:var(--soft);
  text-align:center;
  margin-top:2px;
  font-weight:800;
}

.time-slider-wrap{
  position:relative;
  padding:4px 0;
}

.admin-range{
  -webkit-appearance:none;
  appearance:none;
  width:100%; height:8px;
  border-radius:999px;
  outline:none;
  background:rgba(255,255,255,0.06);
}

.admin-range::-webkit-slider-thumb{
  -webkit-appearance:none;
  appearance:none;
  width:26px; height:26px;
  border-radius:50%;
  background:linear-gradient(135deg,var(--orange),var(--gold));
  border:2px solid rgba(255,255,255,0.3);
  cursor:pointer;
  margin-top:-9px;
  box-shadow:0 4px 12px rgba(255,154,61,0.4);
}

.slider-track-fill{
  position:absolute;
  left:0; top:50%;
  transform:translateY(-50%);
  height:8px;
  border-radius:999px;
  background:linear-gradient(90deg,var(--orange),var(--gold));
  pointer-events:none;
  opacity:0.6;
}

.slider-ticks{
  display:flex;
  justify-content:space-between;
  padding:5px 2px 0;
  font-size:8px;
  color:var(--soft);
  font-weight:800;
}

.effect-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:6px;
}

.effect-btn{
  height:60px;
  border-radius:14px;
  border:2px solid rgba(255,255,255,0.08);
  background:rgba(255,255,255,0.03);
  color:var(--muted);
  cursor:pointer;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:3px;
  transition:0.2s ease;
  font-family:var(--font-body);
}

.effect-btn:hover{
  border-color:rgba(255,154,61,0.3);
  background:rgba(255,154,61,0.06);
}

.effect-btn.active{
  color:#fff;
  border-color:rgba(255,154,61,0.5);
  background:linear-gradient(135deg,rgba(255,154,61,0.8),rgba(255,211,61,0.75));
  box-shadow:0 8px 20px rgba(255,154,61,0.3);
}

.effect-btn-label{
  font-size:11px;
  font-weight:900;
  letter-spacing:0.08em;
  text-transform:uppercase;
}

.effect-btn-desc{
  font-size:7px;
  text-transform:uppercase;
  opacity:0.65;
  text-align:center;
  line-height:1.3;
  font-weight:700;
}

.playback-row{
  display:flex;
  align-items:center;
  gap:7px;
}

.playback-btn{
  flex:1;
  height:42px;
  border-radius:14px;
  border:2px solid rgba(255,255,255,0.09);
  background:rgba(255,255,255,0.04);
  color:var(--muted);
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  font-size:11px;
  font-weight:900;
  text-transform:uppercase;
  font-family:var(--font-body);
  transition:0.2s ease;
}

.playback-btn:hover{
  border-color:rgba(255,255,255,0.18);
  color:var(--text);
}

.playback-btn.primary{
  color:#fff;
  border-color:rgba(78,205,196,0.5);
  background:linear-gradient(135deg,rgba(78,205,196,0.8),rgba(107,203,119,0.75));
  box-shadow:0 8px 20px rgba(78,205,196,0.3);
}

.item-dots-row{
  display:flex;
  gap:4px;
  flex-wrap:wrap;
  padding:8px;
  border-radius:12px;
  background:rgba(255,255,255,0.02);
  border:1.5px solid rgba(255,255,255,0.06);
}

.item-dot{
  min-width:26px; height:26px;
  border-radius:9px;
  border:1.5px solid rgba(255,255,255,0.08);
  background:rgba(255,255,255,0.04);
  color:var(--soft);
  font-size:9px;
  font-weight:900;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:0 5px;
  font-family:var(--font-body);
  transition:0.15s ease;
}

.item-dot:hover{
  border-color:rgba(255,211,61,0.3);
  background:rgba(255,211,61,0.06);
  color:var(--gold);
}

.item-dot.active{
  color:#fff;
  border-color:rgba(255,211,61,0.5);
  background:linear-gradient(135deg,rgba(255,154,61,0.8),rgba(255,211,61,0.75));
  box-shadow:0 4px 12px rgba(255,154,61,0.3);
}

@media(max-width:1600px){
  .hero-title{font-size:38px}
}

@media(max-width:1280px){
  .root{grid-template-rows:68px 185px 46px 1fr 42px}
  .hero-shell{grid-template-columns:1fr 240px}
  .menu-grid.fixed-all{
    grid-template-columns:repeat(3,minmax(0,1fr));
    grid-template-rows:repeat(4,minmax(0,1fr));
  }
  .qr-box{min-height:155px}
}
`;

/* ── Animation Variants ─────────────────── */
const heroVariants = {
  initial:{opacity:0},
  animate:{opacity:1,transition:{duration:0.35,ease:"easeOut" as const}},
  exit:{opacity:0,transition:{duration:0.2}},
};

const stageVariants = {
  enter:(d:1|-1)=>({
    opacity:0, rotateY:d>0?20:-20, rotateX:10, x:d>0?160:-160, scale:0.91, filter:"blur(10px)",
  }),
  center:{
    opacity:1, rotateY:0, rotateX:0, x:0, scale:1, filter:"blur(0px)",
    transition:{duration:0.85,ease:[0.22,1,0.36,1] as [number,number,number,number],staggerChildren:0.05,delayChildren:0.03},
  },
  exit:(d:1|-1)=>({
    opacity:0, rotateY:d>0?-14:14, rotateX:-7, x:d>0?-120:120, scale:0.97, filter:"blur(7px)",
    transition:{duration:0.3,ease:[0.4,0,1,1] as [number,number,number,number],staggerChildren:0.02,staggerDirection:-1},
  }),
};

function getCardVariants(effect:Effect3D){
  const map:Record<Effect3D,object>={
    orbit:{
      enter:(d:1|-1)=>({opacity:0,y:42,rotateX:36,rotateY:d>0?48:-48,rotateZ:d>0?8:-8,scale:0.66,z:-280,filter:"blur(12px) brightness(.32)"}),
      center:{opacity:1,y:0,rotateX:0,rotateY:0,rotateZ:0,scale:1,z:0,filter:"blur(0px) brightness(1)",transition:{duration:0.9,ease:[0.16,1,0.3,1],opacity:{duration:0.5}}},
      exit:(d:1|-1)=>({opacity:0,y:-28,rotateX:-20,rotateY:d>0?-32:32,scale:0.83,z:-110,filter:"blur(6px) brightness(.44)",transition:{duration:0.3,ease:[0.4,0,1,1]}}),
    },
    flip:{
      enter:(d:1|-1)=>({opacity:0,rotateY:d>0?90:-90,scale:0.84,z:-50,filter:"blur(4px)"}),
      center:{opacity:1,rotateY:0,scale:1,z:0,filter:"blur(0px)",transition:{duration:0.65,ease:[0.22,1,0.36,1]}},
      exit:(d:1|-1)=>({opacity:0,rotateY:d>0?-90:90,scale:0.9,filter:"blur(3px)",transition:{duration:0.26,ease:[0.4,0,1,1]}}),
    },
    zDepth:{
      enter:()=>({opacity:0,scale:0.22,z:-1200,rotateX:18,filter:"blur(20px) brightness(.18)"}),
      center:{opacity:1,scale:1,z:0,rotateX:0,filter:"blur(0px) brightness(1)",transition:{duration:1.0,ease:[0.16,1,0.3,1],opacity:{duration:0.55}}},
      exit:()=>({opacity:0,scale:2.3,z:650,rotateX:-12,filter:"blur(16px) brightness(1.6)",transition:{duration:0.35,ease:[0.4,0,1,1]}}),
    },
    carousel:{
      enter:(d:1|-1)=>({opacity:0,x:d>0?320:-320,rotateY:d>0?52:-52,rotateX:8,scale:0.74,z:-180,filter:"blur(8px)"}),
      center:{opacity:1,x:0,rotateY:0,rotateX:0,scale:1,z:0,filter:"blur(0px)",transition:{duration:0.8,ease:[0.22,1,0.36,1]}},
      exit:(d:1|-1)=>({opacity:0,x:d>0?-200:200,rotateY:d>0?-36:36,scale:0.85,z:-80,filter:"blur(4px)",transition:{duration:0.28,ease:[0.4,0,1,1]}}),
    },
    warp:{
      enter:(d:1|-1)=>({opacity:0,scaleX:0.08,scaleY:1.4,rotateX:28,rotateZ:d>0?13:-13,z:-400,filter:"blur(14px) saturate(0)"}),
      center:{opacity:1,scaleX:1,scaleY:1,rotateX:0,rotateZ:0,z:0,filter:"blur(0px) saturate(1)",transition:{duration:0.88,ease:[0.16,1,0.3,1],scaleX:{duration:0.6}}},
      exit:(d:1|-1)=>({opacity:0,scaleX:0.1,scaleY:0.6,rotateX:-18,rotateZ:d>0?-11:11,z:-200,filter:"blur(11px) saturate(0)",transition:{duration:0.28,ease:[0.4,0,1,1]}}),
    },
    scatter:{
      enter:()=>{
        const rx=(Math.random()-0.5)*300, ry=(Math.random()-0.5)*200, rz=(Math.random()-0.5)*40;
        return {opacity:0,x:rx,y:ry,rotateZ:rz,rotateX:(Math.random()-0.5)*30,scale:0.5+Math.random()*0.3,z:-200-Math.random()*300,filter:"blur(8px) brightness(.32)"};
      },
      center:{opacity:1,x:0,y:0,rotateZ:0,rotateX:0,scale:1,z:0,filter:"blur(0px) brightness(1)",transition:{duration:0.88,ease:[0.22,1,0.36,1]}},
      exit:()=>({opacity:0,x:(Math.random()-0.5)*200,y:-100-Math.random()*100,rotateZ:(Math.random()-0.5)*30,scale:0.62,z:-140,filter:"blur(6px) brightness(.42)",transition:{duration:0.26,ease:[0.4,0,1,1]}}),
    },
  };
  return map[effect]||map.orbit;
}

/* ── Sub-components ─────────────────────── */
function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"}));
    tick();
    const id = window.setInterval(tick,1000);
    return ()=>window.clearInterval(id);
  }, []);
  return <div className="clock">{time}</div>;
}

function SpiceRow({ level=0 }:{level?:number}) {
  return (
    <div className="spice-row">
      {[0,1,2].map(i=><span key={i} className={`spice-pip ${i<level?"on":""}`}/>)}
    </div>
  );
}

function HighlightProgressBar({duration,progressKey}:{duration:number;progressKey:number}) {
  return (
    <motion.div key={progressKey} className="highlight-progress-bar"
      initial={{width:"100%"}} animate={{width:"0%"}}
      transition={{duration:duration/1000,ease:"linear"}}/>
  );
}

function MenuCard({item,highlight,direction,effect,itemChangeMs}:
  {item:MenuItem;highlight:boolean;direction:1|-1;effect:Effect3D;itemChangeMs:number}) {
  const [progressKey,setProgressKey] = useState(0);
  const config = item.badge ? BADGE_CONFIG[item.badge] : null;
  const Icon = config?.icon;
  const catColor = CAT_COLOR[item.category] ?? "#FFD93D";
  const cardVariants = getCardVariants(effect);
  const cardRef = useRef<HTMLDivElement|null>(null);

  useEffect(()=>{ if(highlight) setProgressKey(p=>p+1); },[highlight,itemChangeMs]);

  useEffect(()=>{
    const el=cardRef.current; if(!el) return;
    const handleMove=(e:MouseEvent)=>{
      const r=el.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-0.5;
      const y=(e.clientY-r.top)/r.height-0.5;
      el.style.transform=`rotateY(${x*13}deg) rotateX(${-y*13}deg) translateZ(18px)`;
    };
    const reset=()=>{ el.style.transform=""; };
    el.addEventListener("mousemove",handleMove);
    el.addEventListener("mouseleave",reset);
    return ()=>{ el.removeEventListener("mousemove",handleMove); el.removeEventListener("mouseleave",reset); };
  },[]);

  return (
    <motion.div ref={cardRef} variants={cardVariants as never} custom={direction}
      whileHover={{rotateX:-7,rotateY:9,y:-9,scale:1.02,transition:{duration:0.25,ease:[0.22,1,0.36,1]}}}
      animate={highlight?{rotateX:-4,rotateY:5,y:-7,scale:1.035,boxShadow:"0 36px 90px rgba(0,0,0,.55),0 0 70px rgba(78,205,196,.2)",transition:{duration:0.4,ease:[0.22,1,0.36,1]}}:{rotateX:0,rotateY:0,y:0,scale:1,boxShadow:"0 16px 40px rgba(0,0,0,.28)",transition:{duration:0.32}}}
      className={`card ${highlight?"hl":""}`}>

      {highlight&&<HighlightProgressBar duration={itemChangeMs} progressKey={progressKey}/>}
      <div className="card-shadow"/>
      <div className="card-rim"/>

      <div className="card-image">
        {item.image ? <img src={item.image} alt={item.name} loading="lazy"/>
          : <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:52,opacity:0.16}}>{item.emoji}</div>}
        <div className="card-tint" style={{background:catColor}}/>
        {highlight&&<motion.div className="card-beam" initial={{x:"-20%"}} animate={{x:"260%"}} transition={{duration:2,repeat:Infinity,ease:"linear"}}/>}

        {config&&Icon&&(
          <div className="card-badge" style={{background:config.bg,color:config.text,borderColor:config.border,boxShadow:`0 0 14px ${config.glow}`}}>
            {config.emoji} <Icon size={8}/> {config.label}
          </div>
        )}
        {item.featured&&<div className="card-featured"><Star size={8}/> ⭐ Featured</div>}
        <div className={`card-status ${item.available===false?"out":""}`}>
          {item.available===false?"😔 Sold Out":"✅ Available"}
        </div>
        <div className="card-price-float">¥{item.price.toLocaleString()}</div>
      </div>

      <div className="card-body">
        <div className="card-name">{item.emoji} {item.name}</div>
        {item.nameJp&&<div className="card-jp">{item.nameJp}</div>}
        <div className="card-desc">{item.desc}</div>
        <div className="card-footer">
          <div className="card-main-price">¥{item.price.toLocaleString()}</div>
          <div className="card-meta">
            {item.calories!=null&&<div className="card-cal"><Flame size={8}/>{item.calories} kcal</div>}
            <SpiceRow level={item.spicyLevel}/>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Admin Overlay ──────────────────────── */
function AdminOverlay({category,setCategory,autoMove,setAutoMove,autoCategory,setAutoCategory,itemChangeMs,setItemChangeMs,effect3d,setEffect3d,highlightIndex,setHighlightIndex,visibleCount,onClose,onSkipNext}:
  {category:Cat;setCategory:(v:Cat)=>void;autoMove:boolean;setAutoMove:React.Dispatch<React.SetStateAction<boolean>>;
   autoCategory:boolean;setAutoCategory:React.Dispatch<React.SetStateAction<boolean>>;itemChangeMs:number;
   setItemChangeMs:React.Dispatch<React.SetStateAction<number>>;effect3d:Effect3D;
   setEffect3d:React.Dispatch<React.SetStateAction<Effect3D>>;highlightIndex:number;
   setHighlightIndex:React.Dispatch<React.SetStateAction<number>>;visibleCount:number;
   onClose:()=>void;onSkipNext:()=>void}) {
  const fillPct=((itemChangeMs-1500)/(12000-1500))*100;
  return(
    <div className="admin-overlay">
      <div className="admin-head">
        <div className="admin-headleft">
          <motion.div animate={{rotate:[0,15,-15,0]}} transition={{duration:2,repeat:Infinity}}>
            <ShieldCheck size={20} color="var(--gold)"/>
          </motion.div>
          <div>
            <div className="admin-title-main">🎛️ TV Control</div>
            <div className="admin-title-sub">cartoon display system</div>
          </div>
        </div>
        <button className="icon-btn" onClick={onClose}><ChevronRight size={14}/></button>
      </div>
      <div className="admin-body">
        <div className="admin-status-row">
          <span>Cat: <span style={{color:"var(--gold)"}}>{CAT_EMOJI[category]} {category}</span></span>
          <span>FX: <span style={{color:"var(--teal)"}}>{effect3d}</span></span>
          <span className={autoMove?"footer-status on":"footer-status off"}>{autoMove?"● Live":"● Paused"}</span>
        </div>
        <div>
          <div className="admin-section-title"><Play size={10}/> Playback</div>
          <div className="playback-row">
            <button className="playback-btn primary" onClick={()=>setAutoMove(p=>!p)}>
              {autoMove?<Pause size={12}/>:<Play size={12}/>} {autoMove?"Pause":"Resume"}
            </button>
            <button className="playback-btn" onClick={onSkipNext}><SkipForward size={12}/> Skip</button>
            <button className={`playback-btn ${autoCategory?"primary":""}`} onClick={()=>setAutoCategory(p=>!p)}>
              <RefreshCcw size={12}/> Auto
            </button>
          </div>
        </div>
        <div>
          <div className="admin-section-title"><Eye size={10}/> Focus ({highlightIndex+1}/{visibleCount})</div>
          <div className="item-dots-row">
            {Array.from({length:visibleCount}).map((_,i)=>(
              <button key={i} className={`item-dot ${i===highlightIndex?"active":""}`}
                onClick={()=>{setAutoMove(false);setHighlightIndex(i);}}>
                {i+1}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="admin-section-title"><Timer size={10}/> Display Time</div>
          <div className="admin-card">
            <div className="admin-label"><span>Interval</span><span className={`admin-val ${autoMove?"live":""}`}>{(itemChangeMs/1000).toFixed(1)}s per item</span></div>
            <div className="time-ring-wrap"><div><div className="time-ring-value">{(itemChangeMs/1000).toFixed(1)}</div><div className="time-ring-unit">seconds per item</div></div></div>
            <div className="time-presets">
              {TIME_PRESETS.map(p=>(
                <button key={p.ms} className={`time-preset-btn ${itemChangeMs===p.ms?"active":""}`} onClick={()=>setItemChangeMs(p.ms)}>
                  <span>{p.emoji} {p.label}</span><span className="time-preset-label">{p.speed}</span>
                </button>
              ))}
            </div>
            <div className="time-slider-wrap">
              <div className="slider-track-fill" style={{width:`calc(${fillPct}% - 13px)`}}/>
              <input type="range" className="admin-range" min={1500} max={12000} step={250} value={itemChangeMs} onChange={e=>setItemChangeMs(Number(e.target.value))}/>
            </div>
            <div className="slider-ticks"><span>1.5s</span><span>Fast ←——→ Slow</span><span>12s</span></div>
          </div>
        </div>
        <div>
          <div className="admin-section-title"><Layers size={10}/> 3D Effect</div>
          <div className="effect-grid">
            {EFFECT_OPTIONS.map(opt=>(
              <button key={opt.id} className={`effect-btn ${effect3d===opt.id?"active":""}`} onClick={()=>setEffect3d(opt.id)}>
                <span style={{fontSize:16}}>{opt.emoji}</span>
                <span className="effect-btn-label">{opt.label}</span>
                <span className="effect-btn-desc">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="admin-section-title"><Sliders size={10}/> Category</div>
          <div className="admin-card">
            <div className="admin-label"><span>Manual Select</span><span className="admin-val">{CAT_EMOJI[category]} {category}</span></div>
            <select className="admin-select" value={category} onChange={e=>setCategory(e.target.value as Cat)}>
              {CATS.map(c=><option key={c} value={c}>{CAT_EMOJI[c]} {c}</option>)}
            </select>
          </div>
        </div>
        <div className="admin-hotkeys">
          <span className="hk">A</span>Panel
          <span className="hk">T</span>Theme
          <span className="hk">1-5</span>Cat
          <span className="hk">Space</span>Pause
          <span className="hk">→</span>Skip
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN DISPLAY PAGE
════════════════════════════════════════ */
export default function DisplayPage() {
  const [category,setCategory] = useState<Cat>("All");
  const [promoIndex,setPromoIndex] = useState(0);
  const [adminOpen,setAdminOpen] = useState(false);
  const [highlightIndex,setHighlightIndex] = useState(0);
  const [autoMove,setAutoMove] = useState(true);
  const [autoCategory,setAutoCategory] = useState(true);
  const [navDirection,setNavDirection] = useState<1|-1>(1);
  const [effect3d,setEffect3d] = useState<Effect3D>("orbit");
  const [itemChangeMs,setItemChangeMs] = useState<number>(()=>{
    if(typeof window==="undefined") return 5000;
    return Number(window.localStorage.getItem("tv-item-ms")||5000);
  });

  const scrollRef = useRef<HTMLDivElement|null>(null);

  const changeCategory=(next:Cat)=>{
    if(next===category) return;
    const ci=CATS.indexOf(category), ni=CATS.indexOf(next);
    setNavDirection(ni>ci?1:-1);
    setCategory(next);
  };

  const visibleItems = useMemo(()=>{
    const f = category==="All" ? MENU_ITEMS_INITIAL : MENU_ITEMS_INITIAL.filter(i=>i.category===category);
    return category==="All" ? f.slice(0,12) : f;
  },[category]);

  const currentPromo = PROMOS_INITIAL[promoIndex];

  const skipNext=()=>{
    if(!visibleItems.length) return;
    setHighlightIndex(p=>(p+1)%visibleItems.length);
  };

  useEffect(()=>{ window.localStorage.setItem("tv-item-ms",String(itemChangeMs)); },[itemChangeMs]);
  useEffect(()=>{ if(!visibleItems.length) return; setHighlightIndex(p=>Math.min(p,visibleItems.length-1)); },[visibleItems.length]);

  useEffect(()=>{
    if(!autoMove||!visibleItems.length) return;
    const id=window.setInterval(()=>setHighlightIndex(p=>(p+1)%visibleItems.length),itemChangeMs);
    return ()=>window.clearInterval(id);
  },[autoMove,visibleItems.length,itemChangeMs]);

  useEffect(()=>{
    const id=window.setInterval(()=>setPromoIndex(p=>(p+1)%PROMOS_INITIAL.length),6000);
    return ()=>window.clearInterval(id);
  },[]);

  useEffect(()=>{
    if(!autoCategory) return;
    const id=window.setInterval(()=>{
      setCategory(prev=>{ const i=CATS.indexOf(prev); const n=CATS[(i+1)%CATS.length]; setNavDirection(1); return n; });
    },18000);
    return ()=>window.clearInterval(id);
  },[autoCategory]);

  useEffect(()=>{
    const el=scrollRef.current; if(!el) return;
    if(category!=="All"){ el.scrollTo({top:Math.max(0,highlightIndex*(288+12)-20),behavior:"smooth"}); }
    else { el.scrollTo({top:0,behavior:"smooth"}); }
  },[highlightIndex,category]);

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      const k=e.key.toLowerCase();
      if(k==="a") setAdminOpen(v=>!v);
      if(e.code==="Space"){ e.preventDefault(); setAutoMove(v=>!v); }
      if(e.key==="ArrowRight") skipNext();
      if(k==="1") changeCategory("All");
      if(k==="2") changeCategory("Chicken");
      if(k==="3") changeCategory("Burger");
      if(k==="4") changeCategory("Set");
      if(k==="5") changeCategory("Drink");
    };
    window.addEventListener("keydown",onKey);
    return ()=>window.removeEventListener("keydown",onKey);
  },[category,visibleItems.length]);

  return (
    <div className="page">
      <style>{CSS}</style>

      <div className="root">
        {/* ── TOPBAR ── */}
        <div className="topbar">
          <div className="brand">
            <div className="brand-mark">
              <UtensilsCrossed size={22} color="#fff"/>
            </div>
            <div>
              <div className="brand-name">🍽️ Neo Menu Vision</div>
              <div className="brand-tagline">cartoon tv menu showcase ✨</div>
            </div>
          </div>
          <div className="topbar-right">
            <div className={`sync-pill ${typeof navigator!=="undefined"&&navigator.onLine?"on":"off"}`}>
              <span className="sync-dot"/>
              {typeof navigator!=="undefined"&&navigator.onLine ? <><Wifi size={12}/>🟢 Online</> : <><WifiOff size={12}/>🔴 Offline</>}
            </div>
            <div className="cat-strip">
              {CATS.map(c=>(
                <button key={c} className={`cat-btn ${category===c?"active":""}`} onClick={()=>changeCategory(c)}>
                  {CAT_EMOJI[c]} {c}
                </button>
              ))}
            </div>
            <button className="icon-btn" onClick={()=>setAdminOpen(v=>!v)}>
              <Settings2 size={16}/>
            </button>
            <LiveClock/>
          </div>
        </div>

        {/* ── HERO SHELL ── */}
        <div className="hero-shell">
          <div className="hero">
            <AnimatePresence mode="wait">
              <motion.div key={currentPromo.id} variants={heroVariants} initial="initial" animate="animate" exit="exit"
                style={{position:"absolute",inset:0}}>
                <div className="hero-layer" style={{backgroundImage:currentPromo.image?`url(${currentPromo.image})`:"none",backgroundColor:currentPromo.image?"transparent":"#111"}}/>
                <div className="hero-overlay"/>
                <div className="hero-content">
                  <div className="hero-eyebrow" style={{color:currentPromo.accent}}>
                    <Sparkles size={12}/> {currentPromo.tag}
                  </div>
                  <div className="hero-title">{currentPromo.emoji} {currentPromo.title}</div>
                  <div className="hero-sub">{currentPromo.subtitle}</div>
                  <div className="hero-price-row">
                    <div className="hero-price">{currentPromo.price}</div>
                    <div className="hero-price-label">limited showcase offer 🎉</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="hero-dots">
              {PROMOS_INITIAL.map((p,i)=>(
                <button key={p.id} className={`hero-dot ${promoIndex===i?"active":""}`} onClick={()=>setPromoIndex(i)}/>
              ))}
            </div>
            <div className="hero-controls">
              <button className="hero-nav-btn" onClick={()=>setPromoIndex(p=>(p-1+PROMOS_INITIAL.length)%PROMOS_INITIAL.length)}><ChevronLeft size={16}/></button>
              <button className="hero-nav-btn" onClick={()=>setPromoIndex(p=>(p+1)%PROMOS_INITIAL.length)}><ChevronRight size={16}/></button>
            </div>
          </div>

          {/* QR Panel */}
          <div className="qr-panel">
            <div className="qr-head">
              <div>
                <div className="qr-title">📱 Scan & Order</div>
                <div className="qr-sub">mobile · pickup · table service</div>
              </div>
              <div className="qr-chip"><QrCode size={13}/> Scan Me!</div>
            </div>
            <div className="qr-box">
              <img src={ORDER_QR_URL} alt="Order QR" loading="eager" crossOrigin="anonymous"/>
            </div>
            <div className="qr-link">
              <span className="qr-link-label">🔗 order link</span>
              <span className="qr-link-value">{ORDER_LINK}</span>
            </div>
            <div className="qr-footer">
              <span>✨ Scan to order instantly</span>
              <span>All devices supported 📱</span>
            </div>
          </div>
        </div>

        {/* ── SECTION BAR ── */}
        <div className="section-bar">
          <div className="section-left">
            <div className="section-heading">
              {category==="All"?<><em>⭐ Featured</em> Items</>:<><em>{CAT_EMOJI[category]} {category}</em> Menu</>}
            </div>
            <div className="section-meta">{visibleItems.length} items · {effect3d} 3D mode</div>
          </div>
          <div className="section-right">
            <div className="tag-pill"><Tv2 size={10}/>📺 showroom mode</div>
            <div className="tag-pill"><MonitorSmartphone size={10}/>📱 qr ready</div>
            <div className="tag-pill" style={{color:"var(--gold)"}}><Timer size={10}/>{(itemChangeMs/1000).toFixed(1)}s ⏱️</div>
          </div>
        </div>

        {/* ── MENU SHELL ── */}
        <div className="menu-shell">
          <div className="menu-curved-stage"/>
          <div className="menu-scroll" ref={scrollRef}>
            <div className="menu-grid-wrap">
              <AnimatePresence mode="wait" custom={navDirection}>
                <motion.div key={category} variants={stageVariants} custom={navDirection}
                  initial="enter" animate="center" exit="exit"
                  className={`menu-grid ${category==="All"?"fixed-all":"scrolling"}`}>
                  {visibleItems.map((item,i)=>(
                    <MenuCard key={`${category}-${item.id}`} item={item}
                      highlight={i===highlightIndex} direction={navDirection}
                      effect={effect3d} itemChangeMs={itemChangeMs}/>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="footer">
          <div className="footer-side">
            <Clock size={10}/>
            <span>🍽️ Neo Menu Vision</span>
            <div className="footer-div"/>
            <span>Cartoon TV Display</span>
            <div className="footer-div"/>
            <span style={{color:"var(--teal)"}}>💫 {effect3d} mode</span>
          </div>
          <div className="footer-side">
            <Radio size={10}/>
            <span className={autoMove?"footer-status on":"footer-status off"}>
              {autoMove?"🟢 Auto Play On":"🔴 Auto Play Off"}
            </span>
          </div>
        </div>
      </div>

      {/* ── ADMIN OVERLAY ── */}
      <AnimatePresence>
        {adminOpen&&(
          <motion.div initial={{opacity:0,x:80,scale:0.96}} animate={{opacity:1,x:0,scale:1}} exit={{opacity:0,x:80,scale:0.96}}
            transition={{duration:0.24,ease:[0.22,1,0.36,1]}}
            style={{position:"fixed",inset:0,pointerEvents:"none"}}>
            <div style={{pointerEvents:"auto"}}>
              <AdminOverlay
                category={category} setCategory={changeCategory}
                autoMove={autoMove} setAutoMove={setAutoMove}
                autoCategory={autoCategory} setAutoCategory={setAutoCategory}
                itemChangeMs={itemChangeMs} setItemChangeMs={setItemChangeMs}
                effect3d={effect3d} setEffect3d={setEffect3d}
                highlightIndex={highlightIndex} setHighlightIndex={setHighlightIndex}
                visibleCount={visibleItems.length}
                onClose={()=>setAdminOpen(false)}
                onSkipNext={skipNext}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}