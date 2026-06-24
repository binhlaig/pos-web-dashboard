"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  ImagePlus,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AtSign,
  Camera,
  CheckCircle2,
  XCircle,
  Fingerprint,
  BadgeCheck,
  Clock,
  X,
  Save,
  RotateCcw,
  AlertTriangle,
  Monitor,
  LayoutPanelTop,
} from "lucide-react";

/* ─── Password helpers ───────────────────────────────── */
type Strength = { score: number; label: string; teal: boolean };

function getStrength(pw: string): Strength {
  if (!pw) return { score: 0, label: "", teal: false };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const labels = ["", "Very weak", "Weak", "Fair", "Strong", "Excellent"];
  return { score: s, label: labels[s] ?? "", teal: s >= 4 };
}

const PW_RULES = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

/* ─── Inline toast ───────────────────────────────────── */
type Toast = { id: number; msg: string; type: "ok" | "err" | "info" };

function useToast() {
  const [list, setList] = useState<Toast[]>([]);
  const n = useRef(0);

  const show = useCallback((msg: string, type: Toast["type"] = "ok") => {
    const id = n.current++;
    setList((p) => [...p, { id, msg, type }]);
    setTimeout(() => setList((p) => p.filter((t) => t.id !== id)), 3200);
  }, []);

  return { list, show };
}

/* ─── CSS ────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&family=Lato:wght@300;400;700&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}

:root{
  --bg:#F7F7F5;
  --bg2:#EFEFE9;
  --bg3:#E5E5DF;
  --bg4:#DDDCD3;
  --ink:#16160F;
  --ink2:#3A3A32;
  --ink3:#7A7A6E;
  --ink4:#ADADA0;
  --seam:#D8D8D0;
  --seam2:#C8C8BC;
  --seam3:#BCBCB0;
  --teal:#009E8C;
  --teal-dim:#007A6C;
  --teal-bg:#E6F5F3;
  --teal-border:#B3E0DA;
  --red:#D64045;
  --red-bg:#FDEDEF;
  --amber:#C97B00;
  --amber-bg:#FEF5E4;
  --card:#FFFFFF;
  --shadow-sm:0 10px 28px rgba(22,22,15,.05);
  --shadow-md:0 18px 44px rgba(22,22,15,.08);
  --shadow-lg:0 24px 60px rgba(22,22,15,.12);
  --r:10px;
  --r-sm:6px;
  --r-lg:18px;
}

html,body{
  min-height:100%;
}

body{
  font-family:'Lato',sans-serif;
  background:
    radial-gradient(circle at top left, rgba(0,158,140,.06), transparent 28%),
    linear-gradient(180deg, #FAFAF8 0%, var(--bg) 100%);
  color:var(--ink);
  min-height:100vh;
}

.root{
  width:100%;
  max-width:1460px;
  margin:0 auto;
  padding:52px 30px 96px;
}

@media(min-width:1200px){
  .root{
    padding:58px 38px 110px;
  }
}

@media(min-width:1440px){
  .root{
    max-width:1540px;
    padding:62px 46px 120px;
  }
}

@media(min-width:1680px){
  .root{
    max-width:1640px;
    padding:68px 54px 130px;
  }
}

/* ─ Page header ─ */
.page-head{
  display:grid;
  grid-template-columns:1fr auto;
  align-items:end;
  gap:24px;
  margin-bottom:38px;
  padding-bottom:34px;
  border-bottom:2px solid var(--ink);
}

@media(max-width:700px){
  .page-head{
    grid-template-columns:1fr;
    align-items:start;
  }
}

.eyebrow{
  font-family:'IBM Plex Mono',monospace;
  font-size:10px;
  letter-spacing:.22em;
  text-transform:uppercase;
  color:var(--teal);
  margin-bottom:10px;
  display:flex;
  align-items:center;
  gap:10px;
}

.eyebrow::after{
  content:'';
  flex:1;
  max-width:42px;
  height:1px;
  background:var(--teal);
}

.page-title{
  font-family:'Syne',sans-serif;
  font-size:52px;
  font-weight:800;
  line-height:.92;
  letter-spacing:-2px;
  color:var(--ink);
}

.page-title span{color:var(--teal);}

.page-desc{
  font-size:14px;
  color:var(--ink3);
  margin-top:14px;
  font-weight:300;
  line-height:1.8;
  max-width:560px;
}

@media(min-width:1440px){
  .page-title{
    font-size:64px;
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
  padding:10px 20px;
  border-radius:var(--r-sm);
  font-family:'Syne',sans-serif;
  font-size:13px;
  font-weight:600;
  cursor:pointer;
  border:none;
  letter-spacing:.03em;
  transition:all .16s ease;
  text-transform:uppercase;
  white-space:nowrap;
}

.btn:hover{
  transform:translateY(-1px);
}

.btn-ghost{
  background:rgba(255,255,255,.6);
  border:1.5px solid var(--seam2);
  color:var(--ink3);
}

.btn-ghost:hover{
  border-color:var(--ink3);
  color:var(--ink);
  background:var(--bg2);
}

.btn-solid{
  background:var(--ink);
  color:var(--bg);
  box-shadow:var(--shadow-sm);
}

.btn-solid:hover{background:var(--ink2);}
.btn-solid:disabled{opacity:.4;cursor:wait;transform:none;}

.btn-teal{
  background:var(--teal);
  color:#fff;
  box-shadow:0 12px 30px rgba(0,158,140,.18);
}

.btn-teal:hover{background:var(--teal-dim);}
.btn-teal:disabled{opacity:.45;cursor:wait;transform:none;}

.btn-sm{
  min-height:34px;
  padding:7px 14px;
  font-size:11px;
}

/* ─ Save bar ─ */
.save-bar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  background:rgba(255,255,255,.75);
  border:1.5px solid var(--seam);
  border-radius:var(--r);
  padding:14px 18px;
  margin-bottom:34px;
  flex-wrap:wrap;
  box-shadow:var(--shadow-sm);
}

.save-bar-left{
  display:flex;
  align-items:center;
  gap:10px;
  font-family:'IBM Plex Mono',monospace;
  font-size:11px;
  color:var(--ink3);
}

.pulse{
  width:7px;height:7px;
  border-radius:50%;
  background:var(--teal);
  animation:pulse 2s infinite;
}

@keyframes pulse{
  0%,100%{opacity:1;}
  50%{opacity:.25;}
}

.save-bar-right{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
}

/* ─ Stat strip ─ */
.stat-strip{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:1px;
  background:var(--seam);
  border:1.5px solid var(--seam);
  border-radius:var(--r);
  overflow:hidden;
  margin-bottom:34px;
  box-shadow:var(--shadow-sm);
}

@media(max-width:760px){
  .stat-strip{
    grid-template-columns:repeat(2,minmax(0,1fr));
  }
}

@media(max-width:520px){
  .stat-strip{
    grid-template-columns:1fr;
  }
}

.stat-cell{
  background:linear-gradient(180deg, rgba(255,255,255,.92), var(--card));
  padding:20px 22px;
  position:relative;
  overflow:hidden;
  min-height:102px;
}

.stat-cell::before{
  content:'';
  position:absolute;
  top:0;left:0;right:0;
  height:3px;
  background:var(--teal);
  transform:scaleX(0);
  transform-origin:left;
  transition:transform .25s ease;
}

.stat-cell:hover::before{transform:scaleX(1);}
.stat-cell:hover{background:var(--bg);}

.stat-num{
  font-family:'Syne',sans-serif;
  font-size:22px;
  font-weight:700;
  color:var(--ink);
  margin-bottom:5px;
  line-height:1;
}

.stat-lbl{
  font-family:'IBM Plex Mono',monospace;
  font-size:9px;
  letter-spacing:.14em;
  text-transform:uppercase;
  color:var(--ink3);
}

.stat-icon{
  position:absolute;
  top:16px;
  right:16px;
  color:var(--seam2);
}

.stat-icon.active{color:var(--teal);}

@media(min-width:1440px){
  .stat-cell{
    padding:24px 24px;
    min-height:112px;
  }

  .stat-num{
    font-size:26px;
  }
}

/* ─ Layout ─ */
.two-col{
  display:grid;
  grid-template-columns:minmax(0,1.2fr) minmax(360px,.8fr);
  gap:24px;
  align-items:start;
}

@media(min-width:1440px){
  .two-col{
    grid-template-columns:minmax(0,1.28fr) minmax(400px,.72fr);
    gap:32px;
  }
}

@media(min-width:1680px){
  .two-col{
    grid-template-columns:minmax(0,1.35fr) minmax(430px,.65fr);
    gap:36px;
  }
}

@media(max-width:980px){
  .two-col{
    grid-template-columns:1fr;
  }
}

.col{
  display:flex;
  flex-direction:column;
  gap:18px;
  min-width:0;
}

.right-col .sticky-col{
  position:sticky;
  top:20px;
}

@media(max-width:980px){
  .right-col .sticky-col{
    position:static;
  }
}

/* ─ Card ─ */
.card{
  background:rgba(255,255,255,.86);
  border:1.5px solid var(--seam);
  border-radius:var(--r-lg);
  overflow:hidden;
  box-shadow:var(--shadow-sm);
}

.card-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:18px 22px;
  background:linear-gradient(180deg, #FBFBF9, var(--bg));
  border-bottom:1px solid var(--seam);
}

.card-head-left{
  display:flex;
  align-items:center;
  gap:12px;
}

.card-num{
  font-family:'Syne',sans-serif;
  font-size:12px;
  font-weight:700;
  color:var(--seam2);
  min-width:24px;
  letter-spacing:.05em;
}

.card-title{
  font-family:'Syne',sans-serif;
  font-size:16px;
  font-weight:700;
  color:var(--ink);
  letter-spacing:-.3px;
}

.card-desc{
  font-size:11px;
  color:var(--ink3);
  margin-top:2px;
}

.card-body{
  padding:24px;
}

@media(min-width:1440px){
  .card-head{
    padding:20px 24px;
  }

  .card-title{
    font-size:17px;
  }

  .card-body{
    padding:28px;
  }
}

/* ─ Avatar zone ─ */
.avatar-zone{
  display:flex;
  align-items:flex-end;
  gap:24px;
  margin-bottom:24px;
  padding-bottom:24px;
  border-bottom:1px solid var(--seam);
  flex-wrap:wrap;
}

.avatar-wrap{
  position:relative;
  flex-shrink:0;
}

.avatar-ring{
  width:96px;
  height:96px;
  border-radius:14px;
  border:2px solid var(--seam2);
  background:var(--bg2);
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
}

.avatar-ring img{
  width:100%;
  height:100%;
  object-fit:cover;
}

.avatar-cam{
  position:absolute;
  bottom:-8px;
  right:-8px;
  width:30px;
  height:30px;
  border-radius:50%;
  background:var(--teal);
  border:2px solid var(--card);
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  color:#fff;
  transition:background .15s;
}

.avatar-cam:hover{background:var(--teal-dim);}

.avatar-remove{
  position:absolute;
  top:-8px;
  right:-8px;
  width:22px;
  height:22px;
  border-radius:50%;
  background:var(--red);
  border:2px solid var(--card);
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
  color:#fff;
  border-style:none;
}

.avatar-name{
  font-family:'Syne',sans-serif;
  font-size:22px;
  font-weight:700;
  color:var(--ink);
  margin-bottom:4px;
  letter-spacing:-.5px;
}

.avatar-handle{
  font-family:'IBM Plex Mono',monospace;
  font-size:12px;
  color:var(--teal);
  margin-bottom:12px;
}

@media(min-width:1440px){
  .avatar-ring{
    width:108px;
    height:108px;
  }

  .avatar-name{
    font-size:24px;
  }
}

/* ─ Form fields ─ */
.form-grid{
  display:grid;
  gap:14px;
}

.g2{grid-template-columns:1fr 1fr;}
.g3{grid-template-columns:1fr 1fr 1fr;}

@media(max-width:700px){
  .g2,.g3{
    grid-template-columns:1fr;
  }
}

.field{
  display:flex;
  flex-direction:column;
  gap:6px;
}

.field-label{
  font-family:'IBM Plex Mono',monospace;
  font-size:9px;
  letter-spacing:.16em;
  text-transform:uppercase;
  color:var(--ink3);
  display:flex;
  align-items:center;
  gap:6px;
}

.field-input{
  background:linear-gradient(180deg, #FCFCFB, var(--bg));
  border:1.5px solid var(--seam);
  border-radius:var(--r-sm);
  min-height:46px;
  padding:11px 14px;
  font-family:'Lato',sans-serif;
  font-size:14px;
  color:var(--ink);
  outline:none;
  transition:border-color .15s,box-shadow .15s,background .15s;
  width:100%;
}

.field-input:hover{
  border-color:var(--seam3);
}

.field-input:focus{
  border-color:var(--teal);
  box-shadow:0 0 0 4px rgba(0,158,140,.1);
  background:var(--card);
}

.field-pw{
  position:relative;
}

.field-pw .field-input{
  padding-right:42px;
}

.pw-eye{
  position:absolute;
  right:12px;
  top:50%;
  transform:translateY(-50%);
  background:none;
  border:none;
  cursor:pointer;
  color:var(--ink3);
  display:flex;
  align-items:center;
  transition:color .15s;
  padding:2px;
}

.pw-eye:hover{
  color:var(--ink);
}

@media(min-width:1440px){
  .field-input{
    min-height:48px;
    font-size:15px;
    padding:12px 15px;
  }
}

/* ─ Strength bar ─ */
.strength-wrap{
  margin-top:14px;
  padding-top:16px;
  border-top:1px solid var(--seam);
}

.strength-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  margin-bottom:8px;
  flex-wrap:wrap;
}

.strength-title{
  font-family:'IBM Plex Mono',monospace;
  font-size:9px;
  letter-spacing:.14em;
  text-transform:uppercase;
  color:var(--ink3);
}

.strength-label{
  font-family:'IBM Plex Mono',monospace;
  font-size:11px;
  font-weight:500;
}

.strength-bars{
  display:flex;
  gap:4px;
  margin-bottom:12px;
}

.bar-seg{
  height:5px;
  flex:1;
  border-radius:3px;
  background:var(--seam);
  overflow:hidden;
}

.bar-fill{
  height:100%;
  border-radius:3px;
  transition:width .3s ease;
}

.rules-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:7px 16px;
}

@media(max-width:640px){
  .rules-grid{
    grid-template-columns:1fr;
  }
}

.rule-row{
  display:flex;
  align-items:center;
  gap:6px;
  font-size:11px;
  color:var(--ink3);
  transition:color .15s;
}

.rule-row.ok{
  color:var(--teal);
}

/* ─ Match pill ─ */
.match-pill{
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:7px 13px;
  border-radius:var(--r-sm);
  font-family:'IBM Plex Mono',monospace;
  font-size:11px;
  border:1.5px solid;
  font-weight:500;
}

.match-ok{
  background:var(--teal-bg);
  border-color:var(--teal-border);
  color:var(--teal-dim);
}

.match-err{
  background:var(--red-bg);
  border-color:#F5C0C2;
  color:var(--red);
}

/* ─ Profile preview ─ */
.preview-card{
  background:rgba(255,255,255,.9);
  border:1.5px solid var(--seam);
  border-radius:var(--r-lg);
  overflow:hidden;
  box-shadow:var(--shadow-sm);
}

.preview-banner{
  height:86px;
  background:var(--ink);
  position:relative;
  overflow:hidden;
}

.preview-banner-grid{
  position:absolute;
  inset:0;
  background-image:
    linear-gradient(rgba(0,158,140,.3) 1px,transparent 1px),
    linear-gradient(90deg,rgba(0,158,140,.3) 1px,transparent 1px);
  background-size:16px 16px;
}

.preview-banner-teal{
  position:absolute;
  bottom:0;
  left:0;
  right:0;
  height:3px;
  background:var(--teal);
}

.preview-body{
  padding:0 22px 22px;
}

.preview-avatar{
  margin-top:-28px;
  margin-bottom:14px;
  width:56px;
  height:56px;
  border-radius:10px;
  border:3px solid var(--card);
  background:var(--bg2);
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
}

.preview-avatar img{
  width:100%;
  height:100%;
  object-fit:cover;
}

.preview-name{
  font-family:'Syne',sans-serif;
  font-size:18px;
  font-weight:700;
  color:var(--ink);
  letter-spacing:-.4px;
  margin-bottom:3px;
}

.preview-handle{
  font-family:'IBM Plex Mono',monospace;
  font-size:11px;
  color:var(--teal);
  margin-bottom:14px;
}

.preview-email{
  display:inline-flex;
  align-items:center;
  gap:6px;
  background:var(--bg);
  border:1px solid var(--seam);
  border-radius:var(--r-sm);
  padding:6px 10px;
  font-size:11px;
  color:var(--ink2);
  font-family:'IBM Plex Mono',monospace;
  margin-bottom:16px;
  word-break:break-all;
}

.preview-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
}

.preview-cell{
  background:var(--bg);
  border:1px solid var(--seam);
  border-radius:var(--r-sm);
  padding:11px 12px;
}

.preview-cell-label{
  font-family:'IBM Plex Mono',monospace;
  font-size:9px;
  letter-spacing:.12em;
  text-transform:uppercase;
  color:var(--ink3);
  margin-bottom:4px;
}

.preview-cell-val{
  font-family:'Syne',sans-serif;
  font-size:14px;
  font-weight:700;
  color:var(--ink);
}

.preview-cell-val.online{
  color:var(--teal);
  display:flex;
  align-items:center;
  gap:5px;
}

.online-dot{
  width:6px;
  height:6px;
  border-radius:50%;
  background:var(--teal);
  animation:pulse 2s infinite;
}

@media(max-width:520px){
  .preview-grid{
    grid-template-columns:1fr;
  }
}

@media(min-width:1440px){
  .preview-banner{
    height:98px;
  }

  .preview-avatar{
    width:62px;
    height:62px;
    margin-top:-30px;
  }

  .preview-name{
    font-size:20px;
  }
}

/* ─ Tips ─ */
.section-mini-title{
  margin-bottom:8px;
  font-family:'IBM Plex Mono',monospace;
  font-size:9px;
  letter-spacing:.16em;
  text-transform:uppercase;
  color:var(--ink3);
}

.tip-list{
  display:flex;
  flex-direction:column;
  gap:8px;
}

.tip-row{
  display:flex;
  align-items:flex-start;
  gap:10px;
  padding:12px 14px;
  background:rgba(255,255,255,.72);
  border:1px solid var(--seam);
  border-radius:var(--r-sm);
  font-size:12px;
  color:var(--ink2);
  line-height:1.6;
  transition:border-color .15s,background .15s;
}

.tip-row:hover{
  border-color:var(--seam2);
  background:var(--card);
}

.tip-icon{
  color:var(--teal);
  flex-shrink:0;
  margin-top:2px;
}

/* ─ Right side meta card ─ */
.meta-card{
  background:rgba(255,255,255,.78);
  border:1.5px solid var(--seam);
  border-radius:var(--r-lg);
  padding:16px 18px;
  box-shadow:var(--shadow-sm);
}

.meta-grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:10px;
}

@media(max-width:520px){
  .meta-grid{
    grid-template-columns:1fr;
  }
}

.meta-box{
  background:var(--bg);
  border:1px solid var(--seam);
  border-radius:var(--r-sm);
  padding:12px;
}

.meta-box-label{
  font-family:'IBM Plex Mono',monospace;
  font-size:9px;
  letter-spacing:.12em;
  text-transform:uppercase;
  color:var(--ink3);
  margin-bottom:5px;
}

.meta-box-val{
  font-family:'Syne',sans-serif;
  font-size:14px;
  font-weight:700;
  color:var(--ink);
}

/* ─ Toast ─ */
.toast-stack{
  position:fixed;
  bottom:24px;
  right:24px;
  display:flex;
  flex-direction:column;
  gap:8px;
  z-index:999;
  pointer-events:none;
}

.toast-item{
  display:flex;
  align-items:center;
  gap:10px;
  background:var(--ink);
  color:#F7F7F5;
  padding:11px 16px;
  border-radius:var(--r-sm);
  font-family:'IBM Plex Mono',monospace;
  font-size:12px;
  min-width:240px;
  box-shadow:0 4px 24px rgba(22,22,15,.25);
}

.toast-item.err{border-left:2px solid var(--red);}
.toast-item.ok{border-left:2px solid var(--teal);}
.toast-item.info{border-left:2px solid var(--amber);}

@media(max-width:640px){
  .toast-stack{
    left:16px;
    right:16px;
    bottom:16px;
  }

  .toast-item{
    min-width:unset;
    width:100%;
  }
}

/* ─ Pw update actions ─ */
.pw-actions{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-top:18px;
  padding-top:18px;
  border-top:1px solid var(--seam);
  flex-wrap:wrap;
  gap:12px;
}

/* ─ Bottom actions ─ */
.bottom-actions{
  display:flex;
  justify-content:flex-end;
  gap:10px;
  margin-top:30px;
  padding-top:22px;
  border-top:1.5px solid var(--seam);
  flex-wrap:wrap;
}
`;

/* ─── PasswordInput ──────────────────────────────────── */
function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        <Lock size={10} color="var(--teal)" />
        {label}
      </label>
      <div className="field-pw">
        <input
          id={id}
          className="field-input"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
        />
        <button className="pw-eye" type="button" onClick={() => setShow((p) => !p)}>
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

/* ─── Card wrapper ───────────────────────────────────── */
function Card({
  num,
  title,
  desc,
  children,
  delay = 0,
}: {
  num: string;
  title: string;
  desc: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <div className="card-head">
        <div className="card-head-left">
          <span className="card-num">{num}</span>
          <div>
            <div className="card-title">{title}</div>
            <div className="card-desc">{desc}</div>
          </div>
        </div>
      </div>
      <div className="card-body">{children}</div>
    </motion.div>
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
        {Icon && <Icon size={10} color="var(--teal)" />}
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─── Strength bar color ─────────────────────────────── */
function strengthColor(score: number) {
  if (score <= 1) return "var(--red)";
  if (score === 2) return "#E07B00";
  if (score === 3) return "var(--amber)";
  return "var(--teal)";
}

/* ─── Main ───────────────────────────────────────────── */
export default function ProfileSettingsForm() {
  const { list: toasts, show } = useToast();

  const [saving, setSaving] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Shop Admin");
  const [username, setUsername] = useState("shop");
  const [email, setEmail] = useState("shop@example.com");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const strength = useMemo(() => getStrength(newPw), [newPw]);
  const match = newPw.length > 0 && newPw === confirmPw;

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      show("Profile settings saved");
    }, 900);
  };

  const handleReset = () => {
    setDisplayName("Shop Admin");
    setUsername("shop");
    setEmail("shop@example.com");
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setAvatarSrc(null);
    show("Form reset to defaults", "info");
  };

  const handlePwUpdate = () => {
    if (!currentPw) return show("Enter your current password", "err");
    if (strength.score < 3) return show("Choose a stronger password", "err");
    if (!match) return show("Passwords do not match", "err");

    setPwSaving(true);
    setTimeout(() => {
      setPwSaving(false);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      show("Password updated successfully");
    }, 900);
  };

  const setAvatar = (file: File | undefined) => {
    if (file) setAvatarSrc(URL.createObjectURL(file));
  };

  return (
    <>
      <style>{css}</style>

      <div className="root">
        {/* ── Header ── */}
        <motion.div
          className="page-head"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <div className="eyebrow">Account Settings</div>
            <h1 className="page-title">
              Profile<span>.</span>
            </h1>
            <p className="page-desc">
              Manage your identity, avatar and account security with a desktop
              layout optimized for 15-inch screens and larger workspaces.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="btn btn-ghost" onClick={handleReset}>
              <RotateCcw size={13} />
              Reset
            </button>
            <button className="btn btn-solid" onClick={handleSave} disabled={saving}>
              <Save size={13} />
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </motion.div>

        {/* ── Save bar ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="save-bar">
            <div className="save-bar-left">
              <div className="pulse" />
              Unsaved changes — review before saving
            </div>
            <div className="save-bar-right">
              <button className="btn btn-ghost btn-sm" onClick={handleReset}>
                <RotateCcw size={12} />
                Reset
              </button>
              <button className="btn btn-solid btn-sm" onClick={handleSave} disabled={saving}>
                <Save size={12} />
                {saving ? "Saving…" : "Save Settings"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <motion.div
          className="stat-strip"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {[
            { num: "Admin", lbl: "Account Role", icon: BadgeCheck, active: true },
            { num: "Active", lbl: "Status", icon: ShieldCheck, active: true },
            {
              num: currentPw || newPw ? "Editing" : "Protected",
              lbl: "Security",
              icon: Fingerprint,
              active: !!(currentPw || newPw),
            },
            { num: "Today", lbl: "Last Updated", icon: Clock, active: false },
          ].map(({ num, lbl, icon: Icon, active }) => (
            <div className="stat-cell" key={lbl}>
              <div className={`stat-icon ${active ? "active" : ""}`}>
                <Icon size={18} />
              </div>
              <div className="stat-num">{num}</div>
              <div className="stat-lbl">{lbl}</div>
            </div>
          ))}
        </motion.div>

        {/* ── Two column ── */}
        <div className="two-col">
          {/* Left */}
          <div className="col">
            <Card
              num="01"
              title="Profile Information"
              desc="Public-facing name and contact details."
              delay={0.18}
            >
              <div className="avatar-zone">
                <div className="avatar-wrap">
                  <div className="avatar-ring">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="avatar" />
                    ) : (
                      <User size={34} color="var(--seam2)" />
                    )}
                  </div>

                  <label className="avatar-cam">
                    <Camera size={13} />
                    <input
                      type="file"
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={(e) => setAvatar(e.target.files?.[0])}
                    />
                  </label>

                  {avatarSrc && (
                    <button className="avatar-remove" onClick={() => setAvatarSrc(null)}>
                      <X size={10} />
                    </button>
                  )}
                </div>

                <div>
                  <div className="avatar-name">{displayName || "Your Name"}</div>
                  <div className="avatar-handle">@{username || "username"}</div>
                  <label className="btn btn-ghost btn-sm" style={{ cursor: "pointer" }}>
                    <ImagePlus size={12} />
                    Change Photo
                    <input
                      type="file"
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={(e) => setAvatar(e.target.files?.[0])}
                    />
                  </label>
                </div>
              </div>

              <div className="form-grid g2" style={{ marginBottom: 14 }}>
                <Field label="Display Name" icon={User}>
                  <input
                    className="field-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </Field>

                <Field label="Username" icon={AtSign}>
                  <input
                    className="field-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Email Address" icon={Mail}>
                <input
                  className="field-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
            </Card>

            <Card
              num="02"
              title="Change Password"
              desc="Use a strong unique password and update it regularly."
              delay={0.24}
            >
              <div className="form-grid g3">
                <PasswordInput
                  id="cur-pw"
                  label="Current Password"
                  value={currentPw}
                  onChange={setCurrentPw}
                  autoComplete="current-password"
                />
                <PasswordInput
                  id="new-pw"
                  label="New Password"
                  value={newPw}
                  onChange={setNewPw}
                  autoComplete="new-password"
                />
                <PasswordInput
                  id="conf-pw"
                  label="Confirm Password"
                  value={confirmPw}
                  onChange={setConfirmPw}
                  autoComplete="new-password"
                />
              </div>

              <AnimatePresence>
                {newPw.length > 0 && (
                  <motion.div
                    className="strength-wrap"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="strength-row">
                      <span className="strength-title">Password strength</span>
                      <span
                        className="strength-label"
                        style={{ color: strengthColor(strength.score) }}
                      >
                        {strength.label}
                      </span>
                    </div>

                    <div className="strength-bars">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div className="bar-seg" key={i}>
                          <motion.div
                            className="bar-fill"
                            style={{ background: strengthColor(strength.score) }}
                            initial={{ width: "0%" }}
                            animate={{ width: i <= strength.score ? "100%" : "0%" }}
                            transition={{ delay: i * 0.04, duration: 0.25 }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="rules-grid">
                      {PW_RULES.map((rule) => {
                        const ok = rule.test(newPw);
                        return (
                          <div key={rule.label} className={`rule-row ${ok ? "ok" : ""}`}>
                            {ok ? (
                              <CheckCircle2 size={12} color="var(--teal)" />
                            ) : (
                              <XCircle size={12} color="var(--seam2)" />
                            )}
                            {rule.label}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pw-actions">
                <div>
                  <AnimatePresence>
                    {confirmPw.length > 0 && (
                      <motion.div
                        className={`match-pill ${match ? "match-ok" : "match-err"}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {match ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {match ? "Passwords match" : "Passwords do not match"}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button className="btn btn-teal" onClick={handlePwUpdate} disabled={pwSaving}>
                  <ShieldCheck size={14} />
                  {pwSaving ? "Updating…" : "Update Password"}
                </button>
              </div>
            </Card>
          </div>

          {/* Right */}
          <div className="col right-col">
            <div className="sticky-col">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
              >
                <div className="section-mini-title">Live Preview</div>
                <div className="preview-card">
                  <div className="preview-banner">
                    <div className="preview-banner-grid" />
                    <div className="preview-banner-teal" />
                  </div>

                  <div className="preview-body">
                    <div className="preview-avatar">
                      {avatarSrc ? (
                        <img src={avatarSrc} alt="preview" />
                      ) : (
                        <User size={22} color="var(--ink4)" />
                      )}
                    </div>

                    <div className="preview-name">{displayName || "Your Name"}</div>
                    <div className="preview-handle">@{username || "username"}</div>

                    <div className="preview-email">
                      <Mail size={11} color="var(--ink3)" />
                      {email || "—"}
                    </div>

                    <div className="preview-grid">
                      <div className="preview-cell">
                        <div className="preview-cell-label">Role</div>
                        <div className="preview-cell-val">Admin</div>
                      </div>

                      <div className="preview-cell">
                        <div className="preview-cell-label">Status</div>
                        <div className="preview-cell-val online">
                          <div className="online-dot" />
                          Active
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.33 }}
                style={{ marginTop: 18 }}
              >
                <div className="section-mini-title">Desktop Summary</div>
                <div className="meta-card">
                  <div className="meta-grid">
                    <div className="meta-box">
                      <div className="meta-box-label">Layout</div>
                      <div className="meta-box-val">15-inch Ready</div>
                    </div>
                    <div className="meta-box">
                      <div className="meta-box-label">Preview</div>
                      <div className="meta-box-val">Sticky Panel</div>
                    </div>
                    <div className="meta-box">
                      <div className="meta-box-label">Mode</div>
                      <div className="meta-box-val">Profile Edit</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                style={{ marginTop: 18 }}
              >
                <div className="section-mini-title">Security Tips</div>
                <div className="tip-list">
                  {[
                    "Use a unique password not shared with other accounts.",
                    "Enable two-factor authentication when available.",
                    "Log out from shared or public devices after each session.",
                    "Review active sessions and revoke unknown ones.",
                  ].map((tip, i) => (
                    <motion.div
                      key={tip}
                      className="tip-row"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.06 }}
                    >
                      <ShieldCheck size={13} className="tip-icon" />
                      {tip}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48 }}
                style={{ marginTop: 18 }}
              >
                <div
                  style={{
                    background: "var(--red-bg)",
                    border: "1.5px solid #F5C0C2",
                    borderRadius: "var(--r)",
                    padding: "16px 18px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <AlertTriangle
                    size={16}
                    color="var(--red)"
                    style={{ marginTop: 1, flexShrink: 0 }}
                  />
                  <div>
                    <div
                      style={{
                        fontFamily: "'Syne',sans-serif",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--red)",
                        marginBottom: 3,
                      }}
                    >
                      Danger Zone
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#9A2A2E",
                        lineHeight: 1.6,
                      }}
                    >
                      Account deletion and data wipe are irreversible. Contact
                      your system administrator for these actions.
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Bottom actions ── */}
        <motion.div
          className="bottom-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button className="btn btn-ghost" onClick={handleReset}>
            <RotateCcw size={13} />
            Reset
          </button>
          <button className="btn btn-solid" onClick={handleSave} disabled={saving}>
            <Save size={13} />
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </motion.div>
      </div>

      {/* ── Toasts ── */}
      <div className="toast-stack">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              className={`toast-item ${t.type}`}
              initial={{ opacity: 0, y: 14, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {t.type === "ok" && <CheckCircle2 size={13} color="var(--teal)" />}
              {t.type === "err" && <XCircle size={13} color="var(--red)" />}
              {t.type === "info" && <AlertTriangle size={13} color="var(--amber)" />}
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}