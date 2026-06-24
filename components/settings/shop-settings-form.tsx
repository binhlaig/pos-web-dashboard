// "use client";

// import { useMemo, useState, useCallback, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   DndContext,
//   closestCenter,
//   KeyboardSensor,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import type { DragEndEvent } from "@dnd-kit/core";
// import {
//   arrayMove,
//   SortableContext,
//   sortableKeyboardCoordinates,
//   useSortable,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import {
//   ImagePlus,
//   Store,
//   Building2,
//   Phone,
//   Mail,
//   MapPin,
//   Sparkles,
//   Palette,
//   Landmark,
//   Hash,
//   Wand2,
//   Brain,
//   ScanText,
//   RefreshCcw,
//   CheckCircle2,
//   GripVertical,
//   Eye,
//   EyeOff,
//   Zap,
//   Shield,
//   TrendingUp,
//   X,
//   Save,
//   RotateCcw,
//   ChevronUp,
//   ChevronDown,
// } from "lucide-react";

// /* ─── Types ─────────────────────────────────────────── */
// type AiDraft = { receiptHeader: string; slogan: string; businessSummary: string };
// type DisplayField = { id: string; label: string; icon: React.ElementType; visible: boolean };

// /* ─── AI helpers ─────────────────────────────────────── */
// function smartUpper(t: string) { return t.trim().replace(/\s+/g, " ").toUpperCase(); }
// function buildReceiptHeader(n: string, b: string) {
//   const base = smartUpper(n || "My Shop");
//   const br = b.trim() ? ` — ${b.trim().split(" ").slice(0, 2).join(" ").toUpperCase()}` : "";
//   return `${base}${br}`.slice(0, 32);
// }
// function buildSlogan(n: string, b: string) {
//   return `${n.trim() || "Your Shop"}${b.trim() ? ` · ${b.trim()}` : ""} · Quality & Trust`;
// }
// function buildSummary(n: string, b: string, a: string) {
//   return `${n.trim() || "This store"}${b.trim() ? `, ${b.trim()},` : ""} is located in ${a.trim() || "your area"}. Focused on clean branding, reliable service, and a strong POS identity across all customer-facing materials.`;
// }

// /* ─── Inline toast ───────────────────────────────────── */
// function useToast() {
//   const [toasts, setToasts] = useState<{ id: number; msg: string; type?: "success" | "info" }[]>([]);
//   const next = useRef(0);
//   const show = useCallback((msg: string, type: "success" | "info" = "success") => {
//     const id = next.current++;
//     setToasts(p => [...p, { id, msg, type }]);
//     setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
//   }, []);
//   return { toasts, show };
// }

// /* ─── Styles ─────────────────────────────────────────── */
// const css = `
// @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500&family=Fira+Code:wght@400;500&display=swap');

// *{box-sizing:border-box;margin:0;padding:0;}

// :root{
//   --paper:#FAFAF7;
//   --paper2:#F4F3EE;
//   --paper3:#EDECEA;
//   --ink:#1A1915;
//   --ink2:#4A4840;
//   --ink3:#8A867C;
//   --ink4:#B8B4AC;
//   --seam:#E0DDD6;
//   --seam2:#D0CCC4;
//   --rust:#C4562A;
//   --rust-dim:#E8896A;
//   --rust-bg:#FDF0EB;
//   --jade:#2A7C5A;
//   --jade-bg:#EBF5F0;
//   --gold:#B8860B;
//   --gold-bg:#FBF6E8;
//   --r:10px;
//   --r-sm:6px;
//   --r-lg:16px;
// }

// body{
//   font-family:'Jost',sans-serif;
//   background:var(--paper);
//   color:var(--ink);
//   min-height:100vh;
// }

// .root{
//   max-width:1100px;
//   margin:0 auto;
//   padding:48px 28px 80px;
// }

// /* ─ Header ─ */
// .page-head{
//   display:flex;
//   align-items:flex-end;
//   justify-content:space-between;
//   gap:20px;
//   padding-bottom:28px;
//   border-bottom:1.5px solid var(--ink);
//   margin-bottom:36px;
//   flex-wrap:wrap;
// }
// .head-left{}
// .head-rule{
//   font-family:'Fira Code',monospace;
//   font-size:11px;
//   letter-spacing:.15em;
//   color:var(--rust);
//   margin-bottom:10px;
//   display:flex;
//   align-items:center;
//   gap:8px;
// }
// .head-rule::before{content:'';width:28px;height:1px;background:var(--rust);}
// .page-title{
//   font-family:'Cormorant Garamond',serif;
//   font-size:52px;
//   font-weight:500;
//   line-height:1;
//   letter-spacing:-1px;
//   color:var(--ink);
// }
// .page-title em{
//   font-style:italic;
//   color:var(--rust);
// }
// .page-desc{
//   font-size:13px;
//   color:var(--ink3);
//   margin-top:10px;
//   font-weight:300;
//   line-height:1.7;
//   max-width:380px;
// }
// .head-actions{display:flex;gap:10px;align-items:center;}

// /* ─ Buttons ─ */
// .btn{
//   display:inline-flex;
//   align-items:center;
//   gap:7px;
//   padding:9px 18px;
//   border-radius:var(--r-sm);
//   font-family:'Jost',sans-serif;
//   font-size:13px;
//   font-weight:500;
//   cursor:pointer;
//   border:none;
//   letter-spacing:.02em;
//   transition:all .15s;
// }
// .btn-outline{
//   background:transparent;
//   border:1px solid var(--seam2);
//   color:var(--ink2);
// }
// .btn-outline:hover{border-color:var(--ink3);color:var(--ink);background:var(--paper2);}
// .btn-solid{
//   background:var(--ink);
//   color:var(--paper);
// }
// .btn-solid:hover{background:#2D2C28;}
// .btn-solid:disabled{opacity:.45;cursor:wait;}
// .btn-rust{
//   background:var(--rust);
//   color:#fff;
// }
// .btn-rust:hover{background:#A84722;}
// .btn-rust:disabled{opacity:.5;cursor:wait;}
// .btn-sm{padding:6px 13px;font-size:12px;}

// /* ─ Stats row ─ */
// .stats-strip{
//   display:grid;
//   grid-template-columns:repeat(5,1fr);
//   gap:1px;
//   background:var(--seam);
//   border:1px solid var(--seam);
//   border-radius:var(--r);
//   overflow:hidden;
//   margin-bottom:36px;
// }
// @media(max-width:700px){.stats-strip{grid-template-columns:repeat(2,1fr);}}
// .stat-cell{
//   background:var(--paper);
//   padding:18px 16px;
//   position:relative;
//   transition:background .15s;
// }
// .stat-cell:hover{background:var(--paper2);}
// .stat-num{
//   font-family:'Cormorant Garamond',serif;
//   font-size:22px;
//   font-weight:500;
//   color:var(--ink);
//   margin-bottom:4px;
//   line-height:1;
// }
// .stat-label{
//   font-family:'Fira Code',monospace;
//   font-size:10px;
//   letter-spacing:.1em;
//   text-transform:uppercase;
//   color:var(--ink3);
// }
// .stat-dot{
//   position:absolute;
//   top:16px;
//   right:16px;
//   width:7px;
//   height:7px;
//   border-radius:50%;
// }
// .dot-rust{background:var(--rust);}
// .dot-jade{background:var(--jade);}
// .dot-gold{background:var(--gold);}

// /* ─ Layout ─ */
// .two-col{
//   display:grid;
//   grid-template-columns:1.15fr .85fr;
//   gap:20px;
//   align-items:start;
// }
// @media(max-width:820px){.two-col{grid-template-columns:1fr;}}

// .col{display:flex;flex-direction:column;gap:16px;}

// /* ─ Section ─ */
// .section{
//   background:var(--paper);
//   border:1px solid var(--seam);
//   border-radius:var(--r);
//   overflow:hidden;
// }
// .section-head{
//   display:flex;
//   align-items:center;
//   justify-content:space-between;
//   padding:16px 20px;
//   border-bottom:1px solid var(--seam);
//   cursor:pointer;
//   user-select:none;
//   background:var(--paper2);
//   transition:background .15s;
// }
// .section-head:hover{background:var(--paper3);}
// .section-head-left{display:flex;align-items:center;gap:12px;}
// .section-icon{
//   width:34px;height:34px;
//   border-radius:var(--r-sm);
//   background:var(--paper);
//   border:1px solid var(--seam);
//   display:flex;align-items:center;justify-content:center;
//   color:var(--rust);
//   flex-shrink:0;
// }
// .section-title{
//   font-family:'Cormorant Garamond',serif;
//   font-size:18px;
//   font-weight:500;
//   color:var(--ink);
//   line-height:1.1;
// }
// .section-desc{font-size:12px;color:var(--ink3);margin-top:1px;}
// .section-body{padding:20px;}

// /* ─ Fields ─ */
// .field{display:flex;flex-direction:column;gap:6px;}
// .field-label{
//   font-family:'Fira Code',monospace;
//   font-size:10px;
//   letter-spacing:.12em;
//   text-transform:uppercase;
//   color:var(--ink3);
//   display:flex;
//   align-items:center;
//   gap:6px;
// }
// .field-input{
//   background:var(--paper);
//   border:1px solid var(--seam2);
//   border-radius:var(--r-sm);
//   padding:9px 12px;
//   font-family:'Jost',sans-serif;
//   font-size:14px;
//   color:var(--ink);
//   outline:none;
//   transition:border-color .15s, box-shadow .15s;
//   width:100%;
// }
// .field-input:focus{
//   border-color:var(--ink3);
//   box-shadow:0 0 0 3px rgba(26,25,21,.06);
// }
// textarea.field-input{
//   resize:vertical;
//   min-height:88px;
//   line-height:1.6;
//   font-size:13px;
// }

// /* ─ Grid helpers ─ */
// .grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
// .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
// @media(max-width:600px){.grid2,.grid3{grid-template-columns:1fr;}}

// /* ─ Logo upload ─ */
// .logo-zone{
//   display:flex;
//   align-items:center;
//   gap:20px;
//   background:var(--paper2);
//   border:1px solid var(--seam);
//   border-radius:var(--r);
//   padding:20px;
// }
// .logo-thumb{
//   width:72px;height:72px;
//   border-radius:var(--r-sm);
//   border:1px solid var(--seam2);
//   background:var(--paper);
//   display:flex;align-items:center;justify-content:center;
//   overflow:hidden;
//   flex-shrink:0;
//   position:relative;
// }
// .logo-thumb img{width:100%;height:100%;object-fit:cover;}
// .logo-remove{
//   position:absolute;top:3px;right:3px;
//   width:20px;height:20px;
//   border-radius:50%;
//   background:rgba(26,25,21,.7);
//   border:none;cursor:pointer;
//   display:flex;align-items:center;justify-content:center;
//   color:#fff;
// }
// .logo-info{flex:1;}
// .logo-name{font-size:14px;font-weight:500;color:var(--ink);margin-bottom:4px;}
// .logo-hint{font-size:12px;color:var(--ink3);margin-bottom:12px;line-height:1.5;}
// .upload-btn{
//   display:inline-flex;align-items:center;gap:7px;
//   padding:7px 14px;
//   border:1px solid var(--seam2);
//   border-radius:var(--r-sm);
//   background:var(--paper);
//   font-family:'Jost',sans-serif;
//   font-size:12px;font-weight:500;
//   cursor:pointer;color:var(--ink2);
//   transition:all .15s;
// }
// .upload-btn:hover{border-color:var(--ink3);color:var(--ink);}

// /* ─ DnD rows ─ */
// .dnd-hint{
//   display:flex;align-items:center;gap:8px;
//   padding:8px 12px;
//   background:var(--paper2);
//   border:1px dashed var(--seam2);
//   border-radius:var(--r-sm);
//   font-size:11px;color:var(--ink3);
//   margin-bottom:10px;
// }
// .dnd-row{
//   display:flex;align-items:center;gap:10px;
//   padding:10px 12px;
//   background:var(--paper);
//   border:1px solid var(--seam);
//   border-radius:var(--r-sm);
//   transition:all .15s;
//   margin-bottom:6px;
// }
// .dnd-row:hover{border-color:var(--seam2);background:var(--paper2);}
// .dnd-row.dragging{
//   border-color:var(--rust);
//   box-shadow:0 4px 20px rgba(196,86,42,.12);
//   background:var(--rust-bg);
// }
// .dnd-row.hidden{opacity:.45;}
// .drag-grip{
//   color:var(--ink4);cursor:grab;padding:2px;
//   transition:color .15s;
//   background:none;border:none;
// }
// .drag-grip:hover{color:var(--ink3);}
// .dnd-icon{
//   width:28px;height:28px;
//   border-radius:var(--r-sm);
//   background:var(--rust-bg);
//   display:flex;align-items:center;justify-content:center;
//   color:var(--rust);
//   flex-shrink:0;
// }
// .dnd-label{flex:1;font-size:13px;font-weight:500;color:var(--ink2);}
// .eye-btn{
//   padding:4px 6px;border:none;background:none;
//   cursor:pointer;color:var(--ink4);
//   border-radius:4px;
//   transition:all .15s;
// }
// .eye-btn:hover{color:var(--ink2);background:var(--paper3);}
// .dnd-count{
//   font-family:'Fira Code',monospace;
//   font-size:11px;color:var(--ink3);
//   margin-top:8px;
// }

// /* ─ AI panel ─ */
// .ai-mode-bar{
//   display:flex;align-items:center;gap:12px;
//   background:var(--jade-bg);
//   border:1px solid #BEE0D2;
//   border-radius:var(--r-sm);
//   padding:12px 16px;
//   margin-bottom:14px;
// }
// .ai-mode-icon{
//   width:36px;height:36px;
//   border-radius:var(--r-sm);
//   background:#D4EDE4;
//   display:flex;align-items:center;justify-content:center;
//   color:var(--jade);
//   flex-shrink:0;
// }
// .ai-mode-title{font-size:13px;font-weight:500;color:var(--jade);}
// .ai-mode-sub{font-size:11px;color:#5a9a7a;margin-top:1px;}
// .ai-btns{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;}

// .ai-card{
//   background:var(--paper2);
//   border:1px solid var(--seam);
//   border-radius:var(--r-sm);
//   padding:14px 16px;
//   margin-bottom:10px;
// }
// .ai-card-head{
//   display:flex;align-items:center;gap:8px;
//   margin-bottom:8px;
// }
// .ai-card-title{font-size:12px;font-weight:500;color:var(--ink2);}
// .ai-mono{
//   font-family:'Fira Code',monospace;
//   font-size:13px;color:var(--ink);
//   letter-spacing:.03em;
// }
// .ai-italic{
//   font-style:italic;
//   font-family:'Cormorant Garamond',serif;
//   font-size:16px;color:var(--ink2);
//   line-height:1.5;
// }
// .ai-body{font-size:13px;color:var(--ink2);line-height:1.7;}

// /* ─ Receipt preview ─ */
// .receipt{
//   background:var(--paper);
//   border:1px solid var(--seam);
//   border-radius:var(--r);
//   overflow:hidden;
//   font-family:'Fira Code',monospace;
// }
// .receipt-topbar{
//   background:var(--paper2);
//   border-bottom:1px solid var(--seam);
//   padding:10px 16px;
//   display:flex;align-items:center;gap:8px;
// }
// .receipt-dot{width:8px;height:8px;border-radius:50%;background:var(--seam2);}
// .receipt-dot.active{background:var(--rust);}
// .receipt-label{
//   font-family:'Fira Code',monospace;
//   font-size:10px;letter-spacing:.1em;text-transform:uppercase;
//   color:var(--ink3);margin-left:4px;
// }
// .receipt-header{
//   display:flex;align-items:center;gap:14px;
//   padding:16px;
//   border-bottom:1px solid var(--seam);
// }
// .receipt-logo{
//   width:48px;height:48px;
//   border-radius:var(--r-sm);
//   border:1px solid var(--seam);
//   background:var(--paper2);
//   display:flex;align-items:center;justify-content:center;
//   overflow:hidden;flex-shrink:0;
// }
// .receipt-logo img{width:100%;height:100%;object-fit:cover;}
// .receipt-shop{font-size:13px;font-weight:500;color:var(--ink);font-family:'Jost',sans-serif;}
// .receipt-branch{font-size:11px;color:var(--ink3);font-family:'Jost',sans-serif;margin-top:2px;}
// .receipt-row{
//   display:flex;align-items:flex-start;gap:10px;
//   padding:9px 16px;
//   border-bottom:1px solid var(--paper2);
// }
// .receipt-row-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--ink4);margin-bottom:2px;}
// .receipt-row-val{font-size:11px;color:var(--ink2);word-break:break-word;}
// .receipt-footer{
//   text-align:center;
//   padding:14px 16px;
//   font-size:10px;letter-spacing:.15em;text-transform:uppercase;
//   color:var(--ink4);
// }
// .receipt-rule{
//   border:none;border-top:1px dashed var(--seam2);
//   margin-bottom:10px;
// }

// /* ─ Toast ─ */
// .toast-stack{
//   position:fixed;bottom:28px;right:28px;
//   display:flex;flex-direction:column;gap:8px;
//   z-index:1000;
// }
// .toast-item{
//   display:flex;align-items:center;gap:10px;
//   background:var(--ink);
//   color:var(--paper);
//   padding:11px 16px;
//   border-radius:var(--r-sm);
//   font-size:13px;
//   font-family:'Jost',sans-serif;
//   box-shadow:0 4px 20px rgba(26,25,21,.25);
//   border-left:2px solid var(--rust);
// }
// .toast-item.info{border-left-color:var(--gold);}

// /* ─ Progress bar ─ */
// .progress-bar{
//   height:2px;
//   background:var(--seam);
//   border-radius:10px;
//   overflow:hidden;
//   margin-top:8px;
// }
// .progress-fill{
//   height:100%;
//   border-radius:10px;
//   background:var(--rust);
//   transition:width .5s ease;
// }
// `;

// /* ─── SortableFieldRow ───────────────────────────────── */
// function SortableFieldRow({
//   field,
//   onToggle,
// }: {
//   field: DisplayField;
//   onToggle: (id: string) => void;
// }) {
//   const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
//     useSortable({ id: field.id });
//   const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined };
//   const Icon = field.icon;
//   return (
//     <div ref={setNodeRef} style={style} className={`dnd-row ${isDragging ? "dragging" : ""} ${!field.visible ? "hidden" : ""}`}>
//       <button className="drag-grip" {...attributes} {...listeners}><GripVertical size={15} /></button>
//       <div className="dnd-icon"><Icon size={13} /></div>
//       <span className="dnd-label">{field.label}</span>
//       <button className="eye-btn" onClick={() => onToggle(field.id)}>
//         {field.visible ? <Eye size={14} /> : <EyeOff size={14} />}
//       </button>
//     </div>
//   );
// }

// /* ─── Collapsible section ────────────────────────────── */
// function Section({
//   icon: Icon,
//   title,
//   desc,
//   children,
//   defaultOpen = true,
// }: {
//   icon: React.ElementType;
//   title: string;
//   desc: string;
//   children: React.ReactNode;
//   defaultOpen?: boolean;
// }) {
//   const [open, setOpen] = useState(defaultOpen);
//   return (
//     <div className="section">
//       <div className="section-head" onClick={() => setOpen(o => !o)}>
//         <div className="section-head-left">
//           <div className="section-icon"><Icon size={15} /></div>
//           <div>
//             <div className="section-title">{title}</div>
//             <div className="section-desc">{desc}</div>
//           </div>
//         </div>
//         {open ? <ChevronUp size={15} color="var(--ink3)" /> : <ChevronDown size={15} color="var(--ink3)" />}
//       </div>
//       <AnimatePresence initial={false}>
//         {open && (
//           <motion.div
//             key="body"
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             transition={{ duration: 0.2, ease: "easeInOut" }}
//             style={{ overflow: "hidden" }}
//           >
//             <div className="section-body">{children}</div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// /* ─── Field ──────────────────────────────────────────── */
// function Field({ label, icon: Icon, children }: { label: string; icon?: React.ElementType; children: React.ReactNode }) {
//   return (
//     <div className="field">
//       <label className="field-label">
//         {Icon && <Icon size={11} color="var(--rust)" />}
//         {label}
//       </label>
//       {children}
//     </div>
//   );
// }

// /* ─── Main ───────────────────────────────────────────── */
// export default function ShopSettingsForm() {
//   const { toasts, show } = useToast();
//   const [saving, setSaving] = useState(false);
//   const [logoPreview, setLogoPreview] = useState<string | null>(null);
//   const [shopName, setShopName] = useState("BINHLAIG Downtown Mart");
//   const [shopCode, setShopCode] = useState("SHOP-0001");
//   const [branch, setBranch] = useState("Tokyo Main Branch");
//   const [phone, setPhone] = useState("+81 90 1234 5678");
//   const [email, setEmail] = useState("shop@binhlaig.com");
//   const [address, setAddress] = useState("12 Sakura Street, Tokyo, Japan");
//   const [receiptName, setReceiptName] = useState("BINHLAIG POS");
//   const [aiDraft, setAiDraft] = useState<AiDraft>({
//     receiptHeader: "BINHLAIG POS",
//     slogan: "Quality & Trust · Better customer experience",
//     businessSummary: "This store focuses on clean branding, reliable service, and a strong POS identity across all customer-facing materials.",
//   });
//   const [aiWorking, setAiWorking] = useState(false);

//   const [displayFields, setDisplayFields] = useState<DisplayField[]>([
//     { id: "shopName", label: "Shop Name", icon: Building2, visible: true },
//     { id: "branch", label: "Branch Name", icon: Landmark, visible: true },
//     { id: "phone", label: "Phone Number", icon: Phone, visible: true },
//     { id: "email", label: "Email", icon: Mail, visible: true },
//     { id: "address", label: "Address", icon: MapPin, visible: true },
//     { id: "receiptHeader", label: "Receipt Header", icon: ScanText, visible: true },
//     { id: "shopCode", label: "Shop Code", icon: Hash, visible: false },
//   ]);

//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
//     useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
//   );

//   const handleDragEnd = (e: DragEndEvent) => {
//     const { active, over } = e;
//     if (over && active.id !== over.id) {
//       setDisplayFields(items => {
//         const oi = items.findIndex(i => i.id === active.id);
//         const ni = items.findIndex(i => i.id === over.id);
//         return arrayMove(items, oi, ni);
//       });
//     }
//   };

//   const toggleVisibility = useCallback((id: string) => {
//     setDisplayFields(p => p.map(f => f.id === id ? { ...f, visible: !f.visible } : f));
//   }, []);

//   const completion = useMemo(() => {
//     const fields = [shopName, shopCode, branch, phone, email, address, receiptName];
//     return Math.round((fields.filter(v => v.trim().length > 0).length / fields.length) * 100);
//   }, [shopName, shopCode, branch, phone, email, address, receiptName]);

//   const handleSave = () => {
//     setSaving(true);
//     setTimeout(() => { setSaving(false); show("Shop settings saved successfully"); }, 900);
//   };

//   const handleReset = () => {
//     setShopName("BINHLAIG Downtown Mart"); setShopCode("SHOP-0001"); setBranch("Tokyo Main Branch");
//     setPhone("+81 90 1234 5678"); setEmail("shop@binhlaig.com");
//     setAddress("12 Sakura Street, Tokyo, Japan"); setReceiptName("BINHLAIG POS");
//     show("Form reset to defaults", "info");
//   };

//   const runAi = () => {
//     setAiWorking(true);
//     setTimeout(() => {
//       setAiDraft({ receiptHeader: buildReceiptHeader(shopName, branch), slogan: buildSlogan(shopName, branch), businessSummary: buildSummary(shopName, branch, address) });
//       setAiWorking(false); show("AI suggestions generated");
//     }, 700);
//   };

//   const fieldValueMap: Record<string, string> = { shopName, branch, phone, email, address, receiptHeader: receiptName, shopCode };

//   return (
//     <>
//       <style>{css}</style>
//       <div className="root">

//         {/* ── Page header ── */}
//         <motion.div className="page-head" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>
//           <div className="head-left">
//             <div className="head-rule">Store Identity</div>
//             <h1 className="page-title">Shop <em>Settings</em></h1>
//             <p className="page-desc">Manage store identity, contact info, branding and receipt layout for customer-facing materials.</p>
//           </div>
//           <div className="head-actions">
//             <button className="btn btn-outline" onClick={handleReset}><RotateCcw size={13} /> Reset</button>
//             <button className="btn btn-solid" onClick={handleSave} disabled={saving}><Save size={13} /> {saving ? "Saving…" : "Save Settings"}</button>
//           </div>
//         </motion.div>

//         {/* ── Stats strip ── */}
//         <motion.div className="stats-strip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .1 }}>
//           <div className="stat-cell">
//             <div className="stat-dot dot-jade" />
//             <div className="stat-num">Configured</div>
//             <div className="stat-label">Store Identity</div>
//           </div>
//           <div className="stat-cell">
//             <div className="stat-dot dot-jade" />
//             <div className="stat-num">2 Channels</div>
//             <div className="stat-label">Contact</div>
//           </div>
//           <div className="stat-cell">
//             <div className="stat-dot" style={{ background: logoPreview ? "var(--jade)" : "var(--gold)" }} />
//             <div className="stat-num">{logoPreview ? "Ready" : "Pending"}</div>
//             <div className="stat-label">Branding</div>
//           </div>
//           <div className="stat-cell">
//             <div className="stat-dot dot-rust" />
//             <div className="stat-num">{completion}%</div>
//             <div className="stat-label">Profile Score</div>
//             <div className="progress-bar"><div className="progress-fill" style={{ width: `${completion}%` }} /></div>
//           </div>
//           <div className="stat-cell">
//             <div className="stat-dot" style={{ background: "var(--rust)" }} />
//             <div className="stat-num">Local</div>
//             <div className="stat-label">AI Mode</div>
//           </div>
//         </motion.div>

//         {/* ── Two col ── */}
//         <div className="two-col">

//           {/* Left */}
//           <div className="col">

//             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }}>
//               <Section icon={Building2} title="Basic Information" desc="Core identity used across POS, invoices and reports.">
//                 <div className="grid2" style={{ marginBottom: 14 }}>
//                   <Field label="Shop Name" icon={Building2}><input className="field-input" value={shopName} onChange={e => setShopName(e.target.value)} /></Field>
//                   <Field label="Shop Code" icon={Hash}><input className="field-input" value={shopCode} onChange={e => setShopCode(e.target.value)} /></Field>
//                 </div>
//                 <Field label="Branch Name" icon={Landmark}><input className="field-input" value={branch} onChange={e => setBranch(e.target.value)} /></Field>
//               </Section>
//             </motion.div>

//             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}>
//               <Section icon={Phone} title="Contact Information" desc="Customer-facing and internal communication details.">
//                 <div className="grid2" style={{ marginBottom: 14 }}>
//                   <Field label="Phone" icon={Phone}><input className="field-input" value={phone} onChange={e => setPhone(e.target.value)} /></Field>
//                   <Field label="Email" icon={Mail}><input className="field-input" value={email} onChange={e => setEmail(e.target.value)} /></Field>
//                 </div>
//                 <Field label="Address" icon={MapPin}><textarea className="field-input" value={address} onChange={e => setAddress(e.target.value)} /></Field>
//               </Section>
//             </motion.div>

//             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25 }}>
//               <Section icon={Palette} title="Branding" desc="Logo upload and receipt identity configuration.">
//                 <div className="logo-zone" style={{ marginBottom: 16 }}>
//                   <div className="logo-thumb">
//                     {logoPreview
//                       ? <><img src={logoPreview} alt="logo" /><button className="logo-remove" onClick={() => setLogoPreview(null)}><X size={10} /></button></>
//                       : <Store size={22} color="var(--ink4)" />}
//                   </div>
//                   <div className="logo-info">
//                     <div className="logo-name">Store Logo</div>
//                     <div className="logo-hint">Square PNG or JPG · Min 256×256px<br />Appears on receipts and reports</div>
//                     <label className="upload-btn">
//                       <ImagePlus size={13} /> Upload Logo
//                       <input type="file" style={{ display: "none" }} accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) setLogoPreview(URL.createObjectURL(f)); }} />
//                     </label>
//                   </div>
//                 </div>
//                 <Field label="Receipt Header Name" icon={Sparkles}><input className="field-input" value={receiptName} onChange={e => setReceiptName(e.target.value)} /></Field>
//               </Section>
//             </motion.div>

//             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }}>
//               <Section icon={GripVertical} title="Receipt Field Layout" desc="Drag to reorder · Toggle eye to show/hide.">
//                 <div className="dnd-hint">
//                   <GripVertical size={13} color="var(--ink4)" />
//                   Drag rows to reorder. Eye icon toggles visibility on receipt.
//                 </div>
//                 <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//                   <SortableContext items={displayFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
//                     {displayFields.map(f => (
//                       <SortableFieldRow key={f.id} field={f} onToggle={toggleVisibility} />
//                     ))}
//                   </SortableContext>
//                 </DndContext>
//                 <div className="dnd-count">{displayFields.filter(f => f.visible).length} of {displayFields.length} fields visible</div>
//               </Section>
//             </motion.div>
//           </div>

//           {/* Right */}
//           <div className="col">

//             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}>
//               <Section icon={Brain} title="Local AI Assistant" desc="Smart suggestions from your form data — no external calls.">
//                 <div className="ai-mode-bar">
//                   <div className="ai-mode-icon"><Shield size={15} /></div>
//                   <div>
//                     <div className="ai-mode-title">Privacy-First · Local Only</div>
//                     <div className="ai-mode-sub">All processing happens in your browser</div>
//                   </div>
//                 </div>
//                 <div className="ai-btns">
//                   <button className="btn btn-rust btn-sm" onClick={runAi} disabled={aiWorking}>
//                     {aiWorking
//                       ? <><Zap size={13} style={{ animation: "spin .6s linear infinite" }} /> Generating…</>
//                       : <><Wand2 size={13} /> Generate Suggestions</>}
//                   </button>
//                   <button className="btn btn-outline btn-sm" onClick={() => { setAiDraft({ receiptHeader: buildReceiptHeader(shopName, branch), slogan: buildSlogan(shopName, branch), businessSummary: buildSummary(shopName, branch, address) }); show("Suggestions refreshed", "info"); }}>
//                     <RefreshCcw size={13} /> Refresh
//                   </button>
//                 </div>
//                 <AnimatePresence mode="wait">
//                   <motion.div key={aiDraft.receiptHeader} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .2 }}>
//                     <div className="ai-card">
//                       <div className="ai-card-head"><ScanText size={13} color="var(--rust)" /><span className="ai-card-title">Receipt Header</span></div>
//                       <div className="ai-mono">{aiDraft.receiptHeader}</div>
//                       <button className="btn btn-outline btn-sm" style={{ marginTop: 10 }} onClick={() => { setReceiptName(aiDraft.receiptHeader); show("Receipt header applied"); }}>
//                         <CheckCircle2 size={12} /> Apply
//                       </button>
//                     </div>
//                     <div className="ai-card">
//                       <div className="ai-card-head"><Sparkles size={13} color="var(--rust)" /><span className="ai-card-title">Suggested Slogan</span></div>
//                       <div className="ai-italic">"{aiDraft.slogan}"</div>
//                     </div>
//                     <div className="ai-card">
//                       <div className="ai-card-head"><Brain size={13} color="var(--rust)" /><span className="ai-card-title">Business Summary</span></div>
//                       <div className="ai-body">{aiDraft.businessSummary}</div>
//                     </div>
//                   </motion.div>
//                 </AnimatePresence>
//               </Section>
//             </motion.div>

//             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }}>
//               <Section icon={ScanText} title="Brand Preview" desc="Live receipt preview reflecting your current settings.">
//                 <div className="receipt">
//                   <div className="receipt-topbar">
//                     <div className="receipt-dot active" /><div className="receipt-dot" /><div className="receipt-dot" />
//                     <span className="receipt-label">Receipt Preview</span>
//                   </div>
//                   <div className="receipt-header">
//                     <div className="receipt-logo">
//                       {logoPreview ? <img src={logoPreview} alt="shop" /> : <Store size={20} color="var(--ink4)" />}
//                     </div>
//                     <div>
//                       <div className="receipt-shop">{shopName || "Shop Name"}</div>
//                       <div className="receipt-branch">{branch || "Branch"}</div>
//                     </div>
//                   </div>
//                   {displayFields.filter(f => f.visible).map(f => {
//                     const val = fieldValueMap[f.id];
//                     const Icon = f.icon;
//                     if (!val) return null;
//                     return (
//                       <div className="receipt-row" key={f.id}>
//                         <Icon size={12} color="var(--ink4)" style={{ marginTop: 2, flexShrink: 0 }} />
//                         <div>
//                           <div className="receipt-row-lbl">{f.label}</div>
//                           <div className="receipt-row-val">{val}</div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                   <div className="receipt-footer">
//                     <hr className="receipt-rule" />
//                     Thank you for shopping with us
//                   </div>
//                 </div>
//               </Section>
//             </motion.div>

//           </div>
//         </div>

//         {/* ── Bottom actions ── */}
//         <motion.div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--seam)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .4 }}>
//           <button className="btn btn-outline" onClick={handleReset}><RotateCcw size={13} /> Reset</button>
//           <button className="btn btn-solid" onClick={handleSave} disabled={saving}><Save size={13} /> {saving ? "Saving…" : "Save Shop Settings"}</button>
//         </motion.div>
//       </div>

//       {/* ── Toasts ── */}
//       <div className="toast-stack">
//         <AnimatePresence>
//           {toasts.map(t => (
//             <motion.div key={t.id} className={`toast-item ${t.type === "info" ? "info" : ""}`} initial={{ opacity: 0, y: 16, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: .2 }}>
//               <CheckCircle2 size={14} color={t.type === "info" ? "var(--gold)" : "var(--rust-dim)"} />
//               {t.msg}
//             </motion.div>
//           ))}
//         </AnimatePresence>
//       </div>

//       <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
//     </>
//   );
// }





"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ImagePlus,
  Store,
  Building2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Palette,
  Landmark,
  Hash,
  Wand2,
  Brain,
  ScanText,
  RefreshCcw,
  CheckCircle2,
  GripVertical,
  Eye,
  EyeOff,
  Zap,
  Shield,
  X,
  Save,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  LayoutPanelTop,
  MonitorSmartphone,
  BadgeCheck,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────── */
type AiDraft = {
  receiptHeader: string;
  slogan: string;
  businessSummary: string;
};

type DisplayField = {
  id: string;
  label: string;
  icon: React.ElementType;
  visible: boolean;
};

/* ─── AI helpers ─────────────────────────────────────── */
function smartUpper(t: string) {
  return t.trim().replace(/\s+/g, " ").toUpperCase();
}

function buildReceiptHeader(n: string, b: string) {
  const base = smartUpper(n || "My Shop");
  const br = b.trim()
    ? ` — ${b.trim().split(" ").slice(0, 2).join(" ").toUpperCase()}`
    : "";
  return `${base}${br}`.slice(0, 40);
}

function buildSlogan(n: string, b: string) {
  return `${n.trim() || "Your Shop"}${
    b.trim() ? ` · ${b.trim()}`
    : ""
  } · Quality & Trust`;
}

function buildSummary(n: string, b: string, a: string) {
  return `${n.trim() || "This store"}${
    b.trim() ? `, ${b.trim()},`
    : ""
  } is located in ${
    a.trim() || "your area"
  }. Focused on clean branding, reliable service, and a strong POS identity across all customer-facing materials.`;
}

/* ─── Inline toast ───────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState<
    { id: number; msg: string; type?: "success" | "info" }[]
  >([]);
  const next = useRef(0);

  const show = useCallback(
    (msg: string, type: "success" | "info" = "success") => {
      const id = next.current++;
      setToasts((p) => [...p, { id, msg, type }]);
      setTimeout(() => {
        setToasts((p) => p.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  return { toasts, show };
}

/* ─── Styles ─────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600&family=Fira+Code:wght@400;500&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}

:root{
  --paper:#FAFAF7;
  --paper2:#F4F3EE;
  --paper3:#EDECEA;
  --paper4:#E7E3DA;
  --ink:#1A1915;
  --ink2:#4A4840;
  --ink3:#8A867C;
  --ink4:#B8B4AC;
  --seam:#E0DDD6;
  --seam2:#D0CCC4;
  --seam3:#C8C2B7;
  --rust:#C4562A;
  --rust-dim:#E8896A;
  --rust-bg:#FDF0EB;
  --jade:#2A7C5A;
  --jade-bg:#EBF5F0;
  --gold:#B8860B;
  --gold-bg:#FBF6E8;
  --shadow-sm:0 10px 30px rgba(26,25,21,.05);
  --shadow-md:0 16px 48px rgba(26,25,21,.08);
  --shadow-lg:0 22px 60px rgba(26,25,21,.12);
  --r:12px;
  --r-sm:8px;
  --r-lg:18px;
  --container:1440px;
}

html, body{
  min-height:100%;
}

body{
  font-family:'Jost',sans-serif;
  background:
    radial-gradient(circle at top left, rgba(196,86,42,.05), transparent 28%),
    linear-gradient(180deg, #FCFCF9 0%, var(--paper) 100%);
  color:var(--ink);
  min-height:100vh;
}

/* ─ Root ─ */
.root{
  width:100%;
  max-width:var(--container);
  margin:0 auto;
  padding:44px 28px 88px;
}

@media (min-width: 1200px){
  .root{
    padding:52px 36px 96px;
  }
}

@media (min-width: 1440px){
  .root{
    max-width:1500px;
    padding:56px 44px 110px;
  }
}

@media (min-width: 1680px){
  .root{
    max-width:1640px;
    padding:62px 54px 120px;
  }
}

/* ─ Header ─ */
.page-head{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:24px;
  padding-bottom:30px;
  border-bottom:1.5px solid var(--ink);
  margin-bottom:30px;
  flex-wrap:wrap;
}

.head-left{
  max-width:760px;
}

.head-rule{
  font-family:'Fira Code',monospace;
  font-size:11px;
  letter-spacing:.18em;
  color:var(--rust);
  margin-bottom:12px;
  display:flex;
  align-items:center;
  gap:8px;
  text-transform:uppercase;
}

.head-rule::before{
  content:'';
  width:34px;
  height:1px;
  background:var(--rust);
}

.page-title{
  font-family:'Cormorant Garamond',serif;
  font-size:54px;
  font-weight:500;
  line-height:.95;
  letter-spacing:-1.2px;
  color:var(--ink);
}

.page-title em{
  font-style:italic;
  color:var(--rust);
}

.page-desc{
  font-size:14px;
  color:var(--ink3);
  margin-top:12px;
  font-weight:300;
  line-height:1.8;
  max-width:580px;
}

.head-actions{
  display:flex;
  gap:10px;
  align-items:center;
  flex-wrap:wrap;
}

@media (min-width: 1440px){
  .page-head{
    margin-bottom:34px;
    padding-bottom:34px;
  }

  .page-title{
    font-size:68px;
  }

  .page-desc{
    font-size:15px;
    max-width:640px;
  }
}

/* ─ Buttons ─ */
.btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  min-height:42px;
  padding:10px 18px;
  border-radius:var(--r-sm);
  font-family:'Jost',sans-serif;
  font-size:13px;
  font-weight:500;
  cursor:pointer;
  border:none;
  letter-spacing:.02em;
  transition:all .18s ease;
  white-space:nowrap;
}

.btn:hover{
  transform:translateY(-1px);
}

.btn-outline{
  background:rgba(255,255,255,.45);
  border:1px solid var(--seam2);
  color:var(--ink2);
}

.btn-outline:hover{
  border-color:var(--ink3);
  color:var(--ink);
  background:var(--paper2);
}

.btn-solid{
  background:var(--ink);
  color:var(--paper);
  box-shadow:var(--shadow-sm);
}

.btn-solid:hover{
  background:#2D2C28;
}

.btn-solid:disabled{
  opacity:.45;
  cursor:wait;
  transform:none;
}

.btn-rust{
  background:var(--rust);
  color:#fff;
  box-shadow:0 10px 26px rgba(196,86,42,.18);
}

.btn-rust:hover{
  background:#A84722;
}

.btn-rust:disabled{
  opacity:.5;
  cursor:wait;
  transform:none;
}

.btn-sm{
  min-height:34px;
  padding:7px 13px;
  font-size:12px;
}

/* ─ Overview strip ─ */
.stats-strip{
  display:grid;
  grid-template-columns:repeat(5,minmax(0,1fr));
  gap:1px;
  background:var(--seam);
  border:1px solid var(--seam);
  border-radius:var(--r);
  overflow:hidden;
  margin-bottom:32px;
  box-shadow:var(--shadow-sm);
}

.stat-cell{
  background:linear-gradient(180deg, rgba(255,255,255,.65), var(--paper));
  padding:18px 16px 16px;
  position:relative;
  transition:background .15s ease, transform .15s ease;
  min-height:98px;
}

.stat-cell:hover{
  background:var(--paper2);
}

.stat-num{
  font-family:'Cormorant Garamond',serif;
  font-size:24px;
  font-weight:500;
  color:var(--ink);
  margin-bottom:4px;
  line-height:1;
}

.stat-label{
  font-family:'Fira Code',monospace;
  font-size:10px;
  letter-spacing:.12em;
  text-transform:uppercase;
  color:var(--ink3);
}

.stat-dot{
  position:absolute;
  top:16px;
  right:16px;
  width:8px;
  height:8px;
  border-radius:50%;
}

.dot-rust{background:var(--rust);}
.dot-jade{background:var(--jade);}
.dot-gold{background:var(--gold);}

@media (max-width: 900px){
  .stats-strip{
    grid-template-columns:repeat(2,minmax(0,1fr));
  }
}

@media (max-width: 560px){
  .stats-strip{
    grid-template-columns:1fr;
  }
}

@media (min-width: 1440px){
  .stats-strip{
    margin-bottom:38px;
  }

  .stat-cell{
    padding:22px 20px 18px;
    min-height:110px;
  }

  .stat-num{
    font-size:28px;
  }
}

/* ─ Top workspace ─ */
.workspace{
  display:grid;
  grid-template-columns:minmax(0, 1.18fr) minmax(360px, .82fr);
  gap:24px;
  align-items:start;
}

@media (min-width: 1440px){
  .workspace{
    grid-template-columns:minmax(0, 1.28fr) minmax(400px, .72fr);
    gap:32px;
  }
}

@media (min-width: 1680px){
  .workspace{
    grid-template-columns:minmax(0, 1.36fr) minmax(430px, .64fr);
    gap:36px;
  }
}

@media (max-width: 980px){
  .workspace{
    grid-template-columns:1fr;
  }
}

.col{
  display:flex;
  flex-direction:column;
  gap:18px;
  min-width:0;
}

.right-col{
  position:relative;
}

@media (min-width: 1100px){
  .right-col .sticky-stack{
    position:sticky;
    top:20px;
  }
}

/* ─ Section ─ */
.section{
  background:rgba(255,255,255,.52);
  border:1px solid var(--seam);
  border-radius:var(--r);
  overflow:hidden;
  box-shadow:var(--shadow-sm);
  backdrop-filter: blur(8px);
}

.section-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:16px 20px;
  border-bottom:1px solid var(--seam);
  cursor:pointer;
  user-select:none;
  background:linear-gradient(180deg, var(--paper2), #F1EFE8);
  transition:background .15s ease;
}

.section-head:hover{
  background:var(--paper3);
}

.section-head-left{
  display:flex;
  align-items:center;
  gap:12px;
  min-width:0;
}

.section-icon{
  width:36px;
  height:36px;
  border-radius:var(--r-sm);
  background:linear-gradient(180deg, #fff, var(--paper));
  border:1px solid var(--seam);
  display:flex;
  align-items:center;
  justify-content:center;
  color:var(--rust);
  flex-shrink:0;
}

.section-title{
  font-family:'Cormorant Garamond',serif;
  font-size:20px;
  font-weight:500;
  color:var(--ink);
  line-height:1.1;
}

.section-desc{
  font-size:12px;
  color:var(--ink3);
  margin-top:2px;
}

.section-body{
  padding:22px;
}

@media (min-width: 1440px){
  .section-head{
    padding:18px 22px;
  }

  .section-title{
    font-size:22px;
  }

  .section-desc{
    font-size:12.5px;
  }

  .section-body{
    padding:26px;
  }
}

/* ─ Fields ─ */
.field{
  display:flex;
  flex-direction:column;
  gap:7px;
}

.field-label{
  font-family:'Fira Code',monospace;
  font-size:10px;
  letter-spacing:.13em;
  text-transform:uppercase;
  color:var(--ink3);
  display:flex;
  align-items:center;
  gap:6px;
}

.field-input{
  background:rgba(255,255,255,.72);
  border:1px solid var(--seam2);
  border-radius:var(--r-sm);
  min-height:44px;
  padding:11px 14px;
  font-family:'Jost',sans-serif;
  font-size:14px;
  color:var(--ink);
  outline:none;
  transition:border-color .15s ease, box-shadow .15s ease, background .15s ease;
  width:100%;
}

.field-input:hover{
  border-color:var(--seam3);
}

.field-input:focus{
  background:#fff;
  border-color:var(--ink3);
  box-shadow:0 0 0 4px rgba(26,25,21,.06);
}

textarea.field-input{
  resize:vertical;
  min-height:110px;
  line-height:1.7;
  font-size:13px;
}

@media (min-width: 1440px){
  .field-input{
    min-height:48px;
    padding:12px 15px;
    font-size:15px;
  }

  textarea.field-input{
    font-size:14px;
    min-height:120px;
  }
}

/* ─ Grid helpers ─ */
.grid2{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px;
}

.grid3{
  display:grid;
  grid-template-columns:1fr 1fr 1fr;
  gap:14px;
}

@media(max-width:700px){
  .grid2,.grid3{
    grid-template-columns:1fr;
  }
}

/* ─ Logo upload ─ */
.logo-zone{
  display:flex;
  align-items:center;
  gap:20px;
  background:linear-gradient(180deg, var(--paper2), #F7F5F0);
  border:1px solid var(--seam);
  border-radius:var(--r);
  padding:20px;
}

.logo-thumb{
  width:84px;
  height:84px;
  border-radius:12px;
  border:1px solid var(--seam2);
  background:linear-gradient(180deg, #fff, var(--paper));
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  flex-shrink:0;
  position:relative;
}

.logo-thumb img{
  width:100%;
  height:100%;
  object-fit:cover;
}

.logo-remove{
  position:absolute;
  top:4px;
  right:4px;
  width:22px;
  height:22px;
  border-radius:50%;
  background:rgba(26,25,21,.72);
  border:none;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#fff;
}

.logo-info{
  flex:1;
  min-width:0;
}

.logo-name{
  font-size:15px;
  font-weight:600;
  color:var(--ink);
  margin-bottom:4px;
}

.logo-hint{
  font-size:12px;
  color:var(--ink3);
  margin-bottom:12px;
  line-height:1.6;
}

.upload-btn{
  display:inline-flex;
  align-items:center;
  gap:7px;
  padding:8px 14px;
  border:1px solid var(--seam2);
  border-radius:var(--r-sm);
  background:rgba(255,255,255,.78);
  font-family:'Jost',sans-serif;
  font-size:12px;
  font-weight:500;
  cursor:pointer;
  color:var(--ink2);
  transition:all .15s ease;
}

.upload-btn:hover{
  border-color:var(--ink3);
  color:var(--ink);
  background:#fff;
}

@media(max-width:560px){
  .logo-zone{
    flex-direction:column;
    align-items:flex-start;
  }
}

/* ─ DnD rows ─ */
.dnd-hint{
  display:flex;
  align-items:center;
  gap:8px;
  padding:10px 12px;
  background:var(--paper2);
  border:1px dashed var(--seam2);
  border-radius:var(--r-sm);
  font-size:11px;
  color:var(--ink3);
  margin-bottom:12px;
}

.dnd-row{
  display:flex;
  align-items:center;
  gap:10px;
  padding:11px 12px;
  background:rgba(255,255,255,.68);
  border:1px solid var(--seam);
  border-radius:var(--r-sm);
  transition:all .15s ease;
  margin-bottom:8px;
}

.dnd-row:hover{
  border-color:var(--seam2);
  background:var(--paper2);
}

.dnd-row.dragging{
  border-color:var(--rust);
  box-shadow:0 8px 28px rgba(196,86,42,.14);
  background:var(--rust-bg);
}

.dnd-row.hidden{
  opacity:.48;
}

.drag-grip{
  color:var(--ink4);
  cursor:grab;
  padding:2px;
  transition:color .15s;
  background:none;
  border:none;
}

.drag-grip:hover{
  color:var(--ink3);
}

.dnd-icon{
  width:30px;
  height:30px;
  border-radius:var(--r-sm);
  background:var(--rust-bg);
  display:flex;
  align-items:center;
  justify-content:center;
  color:var(--rust);
  flex-shrink:0;
}

.dnd-label{
  flex:1;
  font-size:13px;
  font-weight:500;
  color:var(--ink2);
}

.eye-btn{
  padding:4px 6px;
  border:none;
  background:none;
  cursor:pointer;
  color:var(--ink4);
  border-radius:4px;
  transition:all .15s;
}

.eye-btn:hover{
  color:var(--ink2);
  background:var(--paper3);
}

.dnd-count{
  font-family:'Fira Code',monospace;
  font-size:11px;
  color:var(--ink3);
  margin-top:10px;
}

/* ─ AI panel ─ */
.ai-mode-bar{
  display:flex;
  align-items:center;
  gap:12px;
  background:linear-gradient(180deg, var(--jade-bg), #E7F3EE);
  border:1px solid #BEE0D2;
  border-radius:var(--r-sm);
  padding:14px 16px;
  margin-bottom:14px;
}

.ai-mode-icon{
  width:38px;
  height:38px;
  border-radius:var(--r-sm);
  background:#D4EDE4;
  display:flex;
  align-items:center;
  justify-content:center;
  color:var(--jade);
  flex-shrink:0;
}

.ai-mode-title{
  font-size:13px;
  font-weight:600;
  color:var(--jade);
}

.ai-mode-sub{
  font-size:11px;
  color:#5a9a7a;
  margin-top:1px;
}

.ai-btns{
  display:flex;
  gap:8px;
  margin-bottom:14px;
  flex-wrap:wrap;
}

.ai-card{
  background:linear-gradient(180deg, rgba(255,255,255,.75), var(--paper2));
  border:1px solid var(--seam);
  border-radius:var(--r-sm);
  padding:14px 16px;
  margin-bottom:10px;
}

.ai-card-head{
  display:flex;
  align-items:center;
  gap:8px;
  margin-bottom:8px;
}

.ai-card-title{
  font-size:12px;
  font-weight:600;
  color:var(--ink2);
}

.ai-mono{
  font-family:'Fira Code',monospace;
  font-size:13px;
  color:var(--ink);
  letter-spacing:.03em;
  line-height:1.7;
  word-break:break-word;
}

.ai-italic{
  font-style:italic;
  font-family:'Cormorant Garamond',serif;
  font-size:18px;
  color:var(--ink2);
  line-height:1.5;
}

.ai-body{
  font-size:13px;
  color:var(--ink2);
  line-height:1.8;
}

/* ─ Receipt preview ─ */
.receipt{
  background:linear-gradient(180deg, #fff, var(--paper));
  border:1px solid var(--seam);
  border-radius:var(--r);
  overflow:hidden;
  font-family:'Fira Code',monospace;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.8);
}

.receipt-topbar{
  background:var(--paper2);
  border-bottom:1px solid var(--seam);
  padding:11px 16px;
  display:flex;
  align-items:center;
  gap:8px;
}

.receipt-dot{
  width:8px;
  height:8px;
  border-radius:50%;
  background:var(--seam2);
}

.receipt-dot.active{
  background:var(--rust);
}

.receipt-label{
  font-family:'Fira Code',monospace;
  font-size:10px;
  letter-spacing:.1em;
  text-transform:uppercase;
  color:var(--ink3);
  margin-left:4px;
}

.receipt-header{
  display:flex;
  align-items:center;
  gap:14px;
  padding:18px 16px;
  border-bottom:1px solid var(--seam);
}

.receipt-logo{
  width:54px;
  height:54px;
  border-radius:var(--r-sm);
  border:1px solid var(--seam);
  background:var(--paper2);
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  flex-shrink:0;
}

.receipt-logo img{
  width:100%;
  height:100%;
  object-fit:cover;
}

.receipt-shop{
  font-size:14px;
  font-weight:600;
  color:var(--ink);
  font-family:'Jost',sans-serif;
}

.receipt-branch{
  font-size:11px;
  color:var(--ink3);
  font-family:'Jost',sans-serif;
  margin-top:3px;
}

.receipt-row{
  display:flex;
  align-items:flex-start;
  gap:10px;
  padding:11px 16px;
  border-bottom:1px solid var(--paper2);
}

.receipt-row-lbl{
  font-size:10px;
  text-transform:uppercase;
  letter-spacing:.1em;
  color:var(--ink4);
  margin-bottom:3px;
}

.receipt-row-val{
  font-size:11px;
  color:var(--ink2);
  word-break:break-word;
  line-height:1.7;
}

.receipt-footer{
  text-align:center;
  padding:16px;
  font-size:10px;
  letter-spacing:.15em;
  text-transform:uppercase;
  color:var(--ink4);
}

.receipt-rule{
  border:none;
  border-top:1px dashed var(--seam2);
  margin-bottom:12px;
}

@media (min-width:1440px){
  .receipt-header{
    padding:20px 18px;
  }

  .receipt-logo{
    width:60px;
    height:60px;
  }

  .receipt-shop{
    font-size:15px;
  }

  .receipt-branch{
    font-size:12px;
  }

  .receipt-row{
    padding:12px 18px;
  }

  .receipt-row-val{
    font-size:12px;
  }
}

/* ─ Footer actions ─ */
.footer-actions{
  display:flex;
  justify-content:flex-end;
  gap:10px;
  margin-top:30px;
  padding-top:22px;
  border-top:1px solid var(--seam);
  flex-wrap:wrap;
}

/* ─ Toast ─ */
.toast-stack{
  position:fixed;
  bottom:28px;
  right:28px;
  display:flex;
  flex-direction:column;
  gap:8px;
  z-index:1000;
}

.toast-item{
  display:flex;
  align-items:center;
  gap:10px;
  background:var(--ink);
  color:var(--paper);
  padding:11px 16px;
  border-radius:var(--r-sm);
  font-size:13px;
  font-family:'Jost',sans-serif;
  box-shadow:0 8px 24px rgba(26,25,21,.24);
  border-left:2px solid var(--rust);
}

.toast-item.info{
  border-left-color:var(--gold);
}

@media(max-width:640px){
  .toast-stack{
    left:16px;
    right:16px;
    bottom:16px;
  }

  .toast-item{
    width:100%;
  }
}

/* ─ Progress bar ─ */
.progress-bar{
  height:3px;
  background:var(--seam);
  border-radius:10px;
  overflow:hidden;
  margin-top:8px;
}

.progress-fill{
  height:100%;
  border-radius:10px;
  background:var(--rust);
  transition:width .5s ease;
}
`;

/* ─── SortableFieldRow ───────────────────────────────── */
function SortableFieldRow({
  field,
  onToggle,
}: {
  field: DisplayField;
  onToggle: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const Icon = field.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`dnd-row ${isDragging ? "dragging" : ""} ${
        !field.visible ? "hidden" : ""
      }`}
    >
      <button className="drag-grip" {...attributes} {...listeners}>
        <GripVertical size={15} />
      </button>

      <div className="dnd-icon">
        <Icon size={13} />
      </div>

      <span className="dnd-label">{field.label}</span>

      <button className="eye-btn" onClick={() => onToggle(field.id)}>
        {field.visible ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
    </div>
  );
}

/* ─── Collapsible section ────────────────────────────── */
function Section({
  icon: Icon,
  title,
  desc,
  children,
  defaultOpen = true,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="section">
      <div className="section-head" onClick={() => setOpen((o) => !o)}>
        <div className="section-head-left">
          <div className="section-icon">
            <Icon size={15} />
          </div>
          <div>
            <div className="section-title">{title}</div>
            <div className="section-desc">{desc}</div>
          </div>
        </div>

        {open ? (
          <ChevronUp size={15} color="var(--ink3)" />
        ) : (
          <ChevronDown size={15} color="var(--ink3)" />
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="section-body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Field ──────────────────────────────────────────── */
function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label className="field-label">
        {Icon && <Icon size={11} color="var(--rust)" />}
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────── */
export default function ShopSettingsForm() {
  const { toasts, show } = useToast();

  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [shopName, setShopName] = useState("BINHLAIG Downtown Mart");
  const [shopCode, setShopCode] = useState("SHOP-0001");
  const [branch, setBranch] = useState("Tokyo Main Branch");
  const [phone, setPhone] = useState("+81 90 1234 5678");
  const [email, setEmail] = useState("shop@binhlaig.com");
  const [address, setAddress] = useState("12 Sakura Street, Tokyo, Japan");
  const [receiptName, setReceiptName] = useState("BINHLAIG POS");

  const [aiDraft, setAiDraft] = useState<AiDraft>({
    receiptHeader: "BINHLAIG POS",
    slogan: "Quality & Trust · Better customer experience",
    businessSummary:
      "This store focuses on clean branding, reliable service, and a strong POS identity across all customer-facing materials.",
  });

  const [aiWorking, setAiWorking] = useState(false);

  const [displayFields, setDisplayFields] = useState<DisplayField[]>([
    { id: "shopName", label: "Shop Name", icon: Building2, visible: true },
    { id: "branch", label: "Branch Name", icon: Landmark, visible: true },
    { id: "phone", label: "Phone Number", icon: Phone, visible: true },
    { id: "email", label: "Email", icon: Mail, visible: true },
    { id: "address", label: "Address", icon: MapPin, visible: true },
    {
      id: "receiptHeader",
      label: "Receipt Header",
      icon: ScanText,
      visible: true,
    },
    { id: "shopCode", label: "Shop Code", icon: Hash, visible: false },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (over && active.id !== over.id) {
      setDisplayFields((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleVisibility = useCallback((id: string) => {
    setDisplayFields((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, visible: !f.visible } : f
      )
    );
  }, []);

  const completion = useMemo(() => {
    const fields = [
      shopName,
      shopCode,
      branch,
      phone,
      email,
      address,
      receiptName,
    ];
    return Math.round(
      (fields.filter((v) => v.trim().length > 0).length / fields.length) * 100
    );
  }, [shopName, shopCode, branch, phone, email, address, receiptName]);

  const visibleFieldCount = useMemo(
    () => displayFields.filter((f) => f.visible).length,
    [displayFields]
  );

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      show("Shop settings saved successfully");
    }, 900);
  };

  const handleReset = () => {
    setShopName("BINHLAIG Downtown Mart");
    setShopCode("SHOP-0001");
    setBranch("Tokyo Main Branch");
    setPhone("+81 90 1234 5678");
    setEmail("shop@binhlaig.com");
    setAddress("12 Sakura Street, Tokyo, Japan");
    setReceiptName("BINHLAIG POS");
    setLogoPreview(null);
    setDisplayFields([
      { id: "shopName", label: "Shop Name", icon: Building2, visible: true },
      { id: "branch", label: "Branch Name", icon: Landmark, visible: true },
      { id: "phone", label: "Phone Number", icon: Phone, visible: true },
      { id: "email", label: "Email", icon: Mail, visible: true },
      { id: "address", label: "Address", icon: MapPin, visible: true },
      {
        id: "receiptHeader",
        label: "Receipt Header",
        icon: ScanText,
        visible: true,
      },
      { id: "shopCode", label: "Shop Code", icon: Hash, visible: false },
    ]);
    show("Form reset to defaults", "info");
  };

  const runAi = () => {
    setAiWorking(true);
    setTimeout(() => {
      setAiDraft({
        receiptHeader: buildReceiptHeader(shopName, branch),
        slogan: buildSlogan(shopName, branch),
        businessSummary: buildSummary(shopName, branch, address),
      });
      setAiWorking(false);
      show("AI suggestions generated");
    }, 700);
  };

  const fieldValueMap: Record<string, string> = {
    shopName,
    branch,
    phone,
    email,
    address,
    receiptHeader: receiptName,
    shopCode,
  };

  return (
    <>
      <style>{css}</style>

      <div className="root">
        {/* ── Page header ── */}
        <motion.div
          className="page-head"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="head-left">
            <div className="head-rule">Store Identity</div>
            <h1 className="page-title">
              Shop <em>Settings</em>
            </h1>
            <p className="page-desc">
              Manage store identity, contact information, branding, receipt
              layout and local AI suggestions with a layout optimized for
              larger desktop displays.
            </p>
          </div>

          <div className="head-actions">
            <button className="btn btn-outline" onClick={handleReset}>
              <RotateCcw size={13} />
              Reset
            </button>
            <button
              className="btn btn-solid"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={13} />
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </motion.div>

        {/* ── Stats strip ── */}
        <motion.div
          className="stats-strip"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-cell">
            <div className="stat-dot dot-jade" />
            <div className="stat-num">Configured</div>
            <div className="stat-label">Store Identity</div>
          </div>

          <div className="stat-cell">
            <div className="stat-dot dot-jade" />
            <div className="stat-num">2 Channels</div>
            <div className="stat-label">Contact</div>
          </div>

          <div className="stat-cell">
            <div
              className="stat-dot"
              style={{
                background: logoPreview ? "var(--jade)" : "var(--gold)",
              }}
            />
            <div className="stat-num">{logoPreview ? "Ready" : "Pending"}</div>
            <div className="stat-label">Branding</div>
          </div>

          <div className="stat-cell">
            <div className="stat-dot dot-rust" />
            <div className="stat-num">{completion}%</div>
            <div className="stat-label">Profile Score</div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          <div className="stat-cell">
            <div className="stat-dot" style={{ background: "var(--rust)" }} />
            <div className="stat-num">Local</div>
            <div className="stat-label">AI Mode</div>
          </div>
        </motion.div>

        {/* ── Workspace ── */}
        <div className="workspace">
          {/* Left */}
          <div className="col">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Section
                icon={Building2}
                title="Basic Information"
                desc="Core identity used across POS, invoices and reports."
              >
                <div className="grid2" style={{ marginBottom: 14 }}>
                  <Field label="Shop Name" icon={Building2}>
                    <input
                      className="field-input"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                    />
                  </Field>

                  <Field label="Shop Code" icon={Hash}>
                    <input
                      className="field-input"
                      value={shopCode}
                      onChange={(e) => setShopCode(e.target.value)}
                    />
                  </Field>
                </div>

                <Field label="Branch Name" icon={Landmark}>
                  <input
                    className="field-input"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  />
                </Field>
              </Section>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Section
                icon={Phone}
                title="Contact Information"
                desc="Customer-facing and internal communication details."
              >
                <div className="grid2" style={{ marginBottom: 14 }}>
                  <Field label="Phone" icon={Phone}>
                    <input
                      className="field-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Field>

                  <Field label="Email" icon={Mail}>
                    <input
                      className="field-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                </div>

                <Field label="Address" icon={MapPin}>
                  <textarea
                    className="field-input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </Field>
              </Section>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Section
                icon={Palette}
                title="Branding"
                desc="Logo upload and receipt identity configuration."
              >
                <div className="logo-zone" style={{ marginBottom: 16 }}>
                  <div className="logo-thumb">
                    {logoPreview ? (
                      <>
                        <img src={logoPreview} alt="logo" />
                        <button
                          className="logo-remove"
                          onClick={() => setLogoPreview(null)}
                        >
                          <X size={10} />
                        </button>
                      </>
                    ) : (
                      <Store size={24} color="var(--ink4)" />
                    )}
                  </div>

                  <div className="logo-info">
                    <div className="logo-name">Store Logo</div>
                    <div className="logo-hint">
                      Square PNG or JPG · Min 256×256px
                      <br />
                      Appears on receipts, exports and reports
                    </div>

                    <label className="upload-btn">
                      <ImagePlus size={13} />
                      Upload Logo
                      <input
                        type="file"
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setLogoPreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <Field label="Receipt Header Name" icon={Sparkles}>
                  <input
                    className="field-input"
                    value={receiptName}
                    onChange={(e) => setReceiptName(e.target.value)}
                  />
                </Field>
              </Section>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Section
                icon={GripVertical}
                title="Receipt Field Layout"
                desc="Drag to reorder and toggle visibility for receipt preview."
              >
                <div className="dnd-hint">
                  <GripVertical size={13} color="var(--ink4)" />
                  Drag rows to reorder. Eye icon toggles visibility on receipt.
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={displayFields.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {displayFields.map((f) => (
                      <SortableFieldRow
                        key={f.id}
                        field={f}
                        onToggle={toggleVisibility}
                      />
                    ))}
                  </SortableContext>
                </DndContext>

                <div className="dnd-count">
                  {visibleFieldCount} of {displayFields.length} fields visible
                </div>
              </Section>
            </motion.div>
          </div>

          {/* Right */}
          <div className="col right-col">
            <div className="sticky-stack">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Section
                  icon={Brain}
                  title="Local AI Assistant"
                  desc="Smart suggestions from your form data — no external calls."
                >
                  <div className="ai-mode-bar">
                    <div className="ai-mode-icon">
                      <Shield size={15} />
                    </div>
                    <div>
                      <div className="ai-mode-title">
                        Privacy-First · Local Only
                      </div>
                      <div className="ai-mode-sub">
                        All processing happens in your browser
                      </div>
                    </div>
                  </div>

                  <div className="ai-btns">
                    <button
                      className="btn btn-rust btn-sm"
                      onClick={runAi}
                      disabled={aiWorking}
                    >
                      {aiWorking ? (
                        <>
                          <Zap
                            size={13}
                            style={{ animation: "spin .6s linear infinite" }}
                          />
                          Generating…
                        </>
                      ) : (
                        <>
                          <Wand2 size={13} />
                          Generate Suggestions
                        </>
                      )}
                    </button>

                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setAiDraft({
                          receiptHeader: buildReceiptHeader(shopName, branch),
                          slogan: buildSlogan(shopName, branch),
                          businessSummary: buildSummary(
                            shopName,
                            branch,
                            address
                          ),
                        });
                        show("Suggestions refreshed", "info");
                      }}
                    >
                      <RefreshCcw size={13} />
                      Refresh
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={aiDraft.receiptHeader}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="ai-card">
                        <div className="ai-card-head">
                          <ScanText size={13} color="var(--rust)" />
                          <span className="ai-card-title">Receipt Header</span>
                        </div>

                        <div className="ai-mono">{aiDraft.receiptHeader}</div>

                        <button
                          className="btn btn-outline btn-sm"
                          style={{ marginTop: 10 }}
                          onClick={() => {
                            setReceiptName(aiDraft.receiptHeader);
                            show("Receipt header applied");
                          }}
                        >
                          <CheckCircle2 size={12} />
                          Apply
                        </button>
                      </div>

                      <div className="ai-card">
                        <div className="ai-card-head">
                          <Sparkles size={13} color="var(--rust)" />
                          <span className="ai-card-title">
                            Suggested Slogan
                          </span>
                        </div>
                        <div className="ai-italic">"{aiDraft.slogan}"</div>
                      </div>

                      <div className="ai-card">
                        <div className="ai-card-head">
                          <Brain size={13} color="var(--rust)" />
                          <span className="ai-card-title">
                            Business Summary
                          </span>
                        </div>
                        <div className="ai-body">{aiDraft.businessSummary}</div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </Section>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ marginTop: 18 }}
              >
                <Section
                  icon={ScanText}
                  title="Brand Preview"
                  desc="Live receipt preview reflecting your current settings."
                >
                  <div className="receipt">
                    <div className="receipt-topbar">
                      <div className="receipt-dot active" />
                      <div className="receipt-dot" />
                      <div className="receipt-dot" />
                      <span className="receipt-label">Receipt Preview</span>
                    </div>

                    <div className="receipt-header">
                      <div className="receipt-logo">
                        {logoPreview ? (
                          <img src={logoPreview} alt="shop" />
                        ) : (
                          <Store size={20} color="var(--ink4)" />
                        )}
                      </div>

                      <div>
                        <div className="receipt-shop">
                          {shopName || "Shop Name"}
                        </div>
                        <div className="receipt-branch">
                          {branch || "Branch"}
                        </div>
                      </div>
                    </div>

                    {displayFields
                      .filter((f) => f.visible)
                      .map((f) => {
                        const val = fieldValueMap[f.id];
                        const Icon = f.icon;
                        if (!val) return null;

                        return (
                          <div className="receipt-row" key={f.id}>
                            <Icon
                              size={12}
                              color="var(--ink4)"
                              style={{ marginTop: 2, flexShrink: 0 }}
                            />
                            <div>
                              <div className="receipt-row-lbl">{f.label}</div>
                              <div className="receipt-row-val">{val}</div>
                            </div>
                          </div>
                        );
                      })}

                    <div className="receipt-footer">
                      <hr className="receipt-rule" />
                      Thank you for shopping with us
                    </div>
                  </div>
                </Section>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34 }}
                style={{ marginTop: 18 }}
              >
                <Section
                  icon={LayoutPanelTop}
                  title="Desktop Readiness"
                  desc="Quick status overview for wide-screen presentation."
                  defaultOpen={true}
                >
                  <div className="grid3">
                    <div className="ai-card" style={{ marginBottom: 0 }}>
                      <div className="ai-card-head">
                        <MonitorSmartphone size={13} color="var(--rust)" />
                        <span className="ai-card-title">Display</span>
                      </div>
                      <div className="ai-body">
                        Optimized for laptop and 15-inch desktop widths.
                      </div>
                    </div>

                    <div className="ai-card" style={{ marginBottom: 0 }}>
                      <div className="ai-card-head">
                        <BadgeCheck size={13} color="var(--rust)" />
                        <span className="ai-card-title">Profile</span>
                      </div>
                      <div className="ai-body">
                        {completion}% completed with {visibleFieldCount} visible
                        receipt fields.
                      </div>
                    </div>

                    <div className="ai-card" style={{ marginBottom: 0 }}>
                      <div className="ai-card-head">
                        <Shield size={13} color="var(--rust)" />
                        <span className="ai-card-title">Mode</span>
                      </div>
                      <div className="ai-body">
                        Local suggestions only. No external AI request used.
                      </div>
                    </div>
                  </div>
                </Section>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Bottom actions ── */}
        <motion.div
          className="footer-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button className="btn btn-outline" onClick={handleReset}>
            <RotateCcw size={13} />
            Reset
          </button>
          <button
            className="btn btn-solid"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={13} />
            {saving ? "Saving…" : "Save Shop Settings"}
          </button>
        </motion.div>
      </div>

      {/* ── Toasts ── */}
      <div className="toast-stack">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className={`toast-item ${t.type === "info" ? "info" : ""}`}
              initial={{ opacity: 0, y: 16, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <CheckCircle2
                size={14}
                color={
                  t.type === "info" ? "var(--gold)" : "var(--rust-dim)"
                }
              />
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes spin{
          from{transform:rotate(0)}
          to{transform:rotate(360deg)}
        }
      `}</style>
    </>
  );
}