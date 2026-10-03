"use client";
import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Printer, X } from "lucide-react";
import { code128SvgDataUri } from "@/lib/code128";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
type Role = "admin" | "manager" | "cashier" | "stock";
type StaffMember = { name: string; role: Role; branch: string; phone: string; status: string; img: string; staffId: string; };
const roleCfg: Record<Role, { label: string }> = { admin: {label:"Admin"}, manager: {label:"Manager"}, cashier: {label:"Cashier"}, stock: {label:"Stock"} };
function Avatar({src, name, className}: {src: string; name: string; className?: string}) {
  const [failed, setFailed] = React.useState(false);
  if (!src || failed) return <div className={className} style={{display:"flex",alignItems:"center",justifyContent:"center",background:"#e8dfce",fontWeight:700}}>{name.slice(0,2).toUpperCase()}</div>;
  return <img src={src} alt={name} className={className} onError={() => setFailed(true)} />;
}
function getStaffPageToken(session: any) {
  if (session?.accessToken) return String(session.accessToken);

  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("admin_access_token") ||
    localStorage.getItem("super_admin_token") ||
    localStorage.getItem("pos_shop_owner_token") ||
    localStorage.getItem("pos_access_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    ""
  );
}


export default function StaffMemberPrintPage() {
  return <React.Suspense fallback={<p className="p-6">Loading…</p>}><MemberCardPageContent /></React.Suspense>;
}
function MemberCardPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const {data: session, status} = useSession();
  const id = params.get("staffId")?.trim() || "";
  const [member, setMember] = React.useState<StaffMember | null>(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    if (status === "loading") return;
    const controller = new AbortController();
    setMember(null); setError(""); setLoading(true);
    const load = async () => {
      try {
        if (!id) throw new Error("Staff page မှ staff တစ်ယောက် ရွေးပါ။");
        const token = getStaffPageToken(session).replace(/^Bearer\s+/i, "");
        if (!token) throw new Error("Login ပြန်ဝင်ပါ။");
        const response = await fetch(`${API_BASE_URL}/api/staff/by-staff-id/${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, cache: "no-store", signal: controller.signal,
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body?.message || `Staff load failed (${response.status})`);
        const staff = body?.staff ?? body?.data ?? body;
        const staffId = String(staff?.staffId ?? staff?.staff_id ?? "");
        if (!staffId || staffId !== id) throw new Error("Staff ID မမှန်ပါ။");
        const role = String(staff.role || "cashier").toLowerCase() as Role;
        const image = String(staff.imageUrl ?? staff.image_url ?? staff.imagePath ?? staff.image_path ?? "");
        if (!controller.signal.aborted) setMember({
          staffId, name: staff.fullName ?? staff.full_name ?? staff.name ?? "Staff",
          role: role in roleCfg ? role : "cashier", branch: staff.branch || "Main Branch", phone: staff.phone || "",
          status: String(staff.status ?? (staff.active === true ? "active" : "unknown")).toLowerCase(),
          img: image ? (/^https?:\/\//i.test(image) ? image : `${API_BASE_URL}/${image.replace(/^\/+/, "")}`) : "",
        });
      } catch (e) {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Unable to load staff.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    };
    void load();
    return () => controller.abort();
  }, [id, session, status]);
  return <main>
    <button type="button" onClick={() => router.push("/dashboard/staff")} className="m-4 rounded-xl border px-4 py-2">← Staff Page</button>
    {loading ? <p className="p-6">Loading staff…</p> : error ? <p role="alert" className="p-6 text-red-500">{error}</p> : member && <StaffMemberCardDialog member={member} onClose={() => router.push("/dashboard/staff")} />}
  </main>;
}

function StaffMemberCardDialog({ member, onClose }: { member: StaffMember; onClose: () => void }) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [design, setDesign] = React.useState<"photo" | "no-photo">("photo");
  const closeRef = React.useRef<HTMLButtonElement>(null);
  const [printError, setPrintError] = React.useState("");
  const [printing, setPrinting] = React.useState(false);
  const staffCode = String(member.staffId ?? "").trim();
  const barcode = React.useMemo(() => {
    try { return staffCode ? code128SvgDataUri(staffCode) : ""; } catch { return ""; }
  }, [staffCode]);
  React.useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [onClose]);
  const printCard = async () => {
    if (!cardRef.current || !barcode || printing) return;
    setPrintError("");
    const popup = window.open("", "_blank", "width=720,height=600");
    if (!popup) { setPrintError("Print window ကို browser က ပိတ်ထားပါတယ်။ Pop-ups ကို Allow လုပ်ပါ။"); return; }
    setPrinting(true);
    try {
      popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Staff Member Card</title><style>
        @page { size: A4; margin: 12mm; }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Arial, sans-serif; }
        .staff-member-card { break-inside: avoid; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        img { display: block; }
      </style></head><body></body></html>`);
      popup.document.close();
      popup.document.body.appendChild(cardRef.current.cloneNode(true));
      const photo = popup.document.querySelector("[data-staff-photo] > *") as HTMLElement | null;
      if (photo) { photo.style.width = "100%"; photo.style.height = "100%"; photo.style.objectFit = "cover"; }
      await Promise.all(Array.from(popup.document.images).map((img) => new Promise<void>((resolve) => {
        if (img.complete) { resolve(); return; }
        const timer = window.setTimeout(resolve, 8000);
        img.onload = () => { window.clearTimeout(timer); resolve(); };
        img.onerror = () => { window.clearTimeout(timer); resolve(); };
      })));
      await popup.document.fonts.ready;
      popup.focus();
      popup.print();
    } catch { setPrintError("Print မဖွင့်နိုင်ပါ။ ပြန်စမ်းပါ။"); }
    finally { setPrinting(false); }
  };
  return (
    <div className="flex min-h-[80dvh] items-center justify-center p-3">
      <div aria-labelledby="member-card-title" className="my-auto w-full max-w-lg rounded-3xl border border-border bg-card p-4 text-card-foreground sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="member-card-title" className="text-lg font-bold">Staff Member Card</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close member card" className="rounded-xl p-2"><X className="h-5 w-5" /></button>
        </div>
        <div role="group" aria-label="Card design" className="mb-4 grid grid-cols-2 gap-3">
          {(["photo", "no-photo"] as const).map((option) => (
            <button key={option} type="button" aria-pressed={design === option} disabled={printing} onClick={() => setDesign(option)} className={`rounded-2xl border-2 p-3 text-left transition ${design === option ? "border-amber-500 bg-amber-500/10" : "border-border bg-background"}`}>
              <span className="block font-bold">{option === "photo" ? "Design 1 · ဓာတ်ပုံပါ" : "Design 2 · ဓာတ်ပုံမပါ"}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{option === "photo" ? "Photo + Staff Information" : "Name + Staff Information"}</span>
            </button>
          ))}
        </div>
        <div className="overflow-x-auto rounded-xl bg-slate-100 p-3">
          <div ref={cardRef} className="staff-member-card" style={{ width: "85.6mm", height: "54mm", boxSizing: "border-box", border: "0.3mm solid #b8a179", borderRadius: "3mm", background: design === "photo" ? "#fffdf8" : "#f8fbff", color: "#211b12", padding: "3mm", overflow: "hidden", fontFamily: "Arial, sans-serif", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "0.3mm solid #ddceb8", paddingBottom: "1.5mm", fontSize: "9pt", fontWeight: 700 }}>
              <span>STAFF MEMBER CARD</span><span style={{ fontSize: "7pt", color: member.status === "active" ? "#167345" : "#a6382a" }}>{member.status.toUpperCase()}</span>
            </div>
            <div style={{ display: "flex", gap: "3mm", height: "20mm", paddingTop: "2mm" }}>
              {design === "photo" && <div data-staff-photo style={{ width: "16mm", height: "18mm", flexShrink: 0, borderRadius: "2mm", overflow: "hidden", background: "#e8dfce" }}><Avatar src={member.img} name={member.name} className="h-full w-full object-cover" /></div>}
              <div style={{ minWidth: 0, flex: 1, fontSize: "8pt", lineHeight: 1.4 }}>
                <div style={{ fontWeight: 700, fontSize: design === "photo" ? "11pt" : "14pt", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.name}</div>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{roleCfg[member.role].label} · {member.branch}</div>
                <div>Staff ID: <strong>{staffCode}</strong></div>
                <div style={{ fontSize: "7pt", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.phone || ""}</div>
              </div>
            </div>
            <div style={{ marginTop: "2mm", background: "#fff", padding: "1mm 3mm", textAlign: "center" }}>
              {barcode ? <img src={barcode} alt={`Staff ID barcode ${staffCode}`} style={{ width: "100%", height: "11mm", objectFit: "contain" }} /> : <div style={{ fontSize: "8pt" }}>Barcode ထုတ်၍မရပါ။ Staff ID ကို စစ်ပါ။</div>}
              <div style={{ fontSize: "8pt", letterSpacing: "0.4mm", color: "#000" }}>{staffCode}</div>
            </div>
          </div>
        </div>
        {design === "photo" && !member.img && <p className="mt-3 text-sm text-amber-600">ဒီ staff မှာ photo မရှိသေးပါ။ Initials ပြပါမယ်။ Photo မပါချင်ရင် Design 2 ကိုရွေးပါ။</p>}
        <p className="mt-3 text-sm text-muted-foreground">85.6 × 54 mm ကတ်အရွယ်အစား။ Print scale ကို 100% / Actual size ရွေးပြီး Headers / Footers ပိတ်ပါ။</p>
        <p className="mt-2 text-xs text-muted-foreground">Barcode မှာ Staff ID အစစ်ပါပါတယ်။ POS scanner မှာ ဖတ်နိုင်ပြီး active staff စစ်ဆေးမှုကို ဆက်လက်လုပ်ပါမယ်။</p>
        {printError && <p role="alert" className="mt-3 text-sm text-red-500">{printError}</p>}
        <button type="button" disabled={!barcode || printing} onClick={() => void printCard()} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-600 font-bold text-white disabled:opacity-50"><Printer className="h-5 w-5" />{printing ? "Preparing…" : design === "photo" ? "Print · ဓာတ်ပုံပါ" : "Print · ဓာတ်ပုံမပါ"}</button>
      </div>
    </div>
  );
}