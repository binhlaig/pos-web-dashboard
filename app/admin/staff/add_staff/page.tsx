


// // "use client";

// // import * as React from "react";
// // import { useSession } from "next-auth/react";
// // import { motion, AnimatePresence } from "framer-motion";
// // import {
// //   ArrowLeft,
// //   Crown,
// //   Key,
// //   Loader2,
// //   Save,
// //   Shield,
// //   Store,
// // } from "lucide-react";

// // /* ─── Types ─────────────────────────────────────────────── */
// // type StaffForm = {
// //   fullName: string;
// //   email: string;
// //   phone: string;
// //   nrc: string;
// //   staffId: number | "";
// //   password: string;
// //   dateOfBirth: string;
// //   shopId: number | null;
// //   role: string;
// //   branch: string;
// //   status: string;
// //   startDate: string;
// //   salary: string;
// //   address: string;
// //   emergencyContact: string;
// //   emergencyPhone: string;
// //   note: string;
// // };

// // type ApiResponse = {
// //   id?: number;
// //   fullName?: string;
// //   email?: string;
// //   message?: string;
// //   imageUrl?: string;
// // };

// // /* ─── Constants ─────────────────────────────────────────── */
// // const roleOptions = [
// //   { value: "admin", label: "Admin", icon: Crown, color: "#FF6B6B", bg: "#FFF0F0" },
// //   { value: "manager", label: "Manager", icon: Shield, color: "#4ECDC4", bg: "#F0FFFE" },
// //   { value: "cashier", label: "Cashier", icon: Key, color: "#FFE66D", bg: "#FFFBF0" },
// //   { value: "stock", label: "Stock", icon: Store, color: "#A8E6CF", bg: "#F0FFF8" },
// // ];

// // const branchOptions = ["Main Branch", "Branch A", "Branch B", "Online Shop"];

// // const statusOptions = [
// //   { value: "active", label: "Active", emoji: "🟢" },
// //   { value: "on_leave", label: "On Leave", emoji: "🟡" },
// //   { value: "inactive", label: "Inactive", emoji: "🔴" },
// // ];

// // const generateStaffId = () => Math.floor(100000 + Math.random() * 900000);

// // const createInitialForm = (shopId: number | null = null): StaffForm => ({
// //   fullName: "",
// //   email: "",
// //   phone: "",
// //   nrc: "",
// //   staffId: generateStaffId(),
// //   password: "",
// //   dateOfBirth: "",
// //   shopId,
// //   role: "cashier",
// //   branch: "Main Branch",
// //   status: "active",
// //   startDate: "",
// //   salary: "",
// //   address: "",
// //   emergencyContact: "",
// //   emergencyPhone: "",
// //   note: "",
// // });

// // const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// // /* ─── Floating bubble decoration ────────────────────────── */
// // const bubbles = [
// //   { size: 90, top: "8%", left: "5%", color: "#FF6B6B33", delay: 0 },
// //   { size: 60, top: "15%", left: "80%", color: "#4ECDC433", delay: 0.5 },
// //   { size: 45, top: "60%", left: "3%", color: "#FFE66D44", delay: 1 },
// //   { size: 70, top: "75%", left: "88%", color: "#A8E6CF44", delay: 0.8 },
// //   { size: 35, top: "40%", left: "92%", color: "#FF6B6B22", delay: 1.4 },
// //   { size: 55, top: "50%", left: "1%", color: "#C3B1E144", delay: 0.3 },
// // ];

// // /* ─── Star burst SVG ────────────────────────────────────── */
// // function StarBurst({
// //   color = "#FFE66D",
// //   size = 24,
// // }: {
// //   color?: string;
// //   size?: number;
// // }) {
// //   return (
// //     <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
// //       <polygon points="12,2 14.4,9.2 22,9.2 16,14 18.4,21.2 12,17 5.6,21.2 8,14 2,9.2 9.6,9.2" />
// //     </svg>
// //   );
// // }

// // /* ─── Main Component ─────────────────────────────────────── */
// // export default function CreateStaffPage() {
// //   const { data: session, status: sessionStatus } = useSession();

// //   const sessionShopId =
// //     typeof (session?.user as any)?.shopId === "number"
// //       ? (session?.user as any)?.shopId
// //       : null;

// //   const [form, setForm] = React.useState<StaffForm>(() =>
// //     createInitialForm(sessionShopId)
// //   );
// //   const [imagePreview, setImagePreview] = React.useState<string>("");
// //   const [imageFile, setImageFile] = React.useState<File | null>(null);
// //   const [loading, setLoading] = React.useState(false);
// //   const [errorMessage, setErrorMessage] = React.useState("");
// //   const [successMessage, setSuccessMessage] = React.useState("");
// //   const [bounceField, setBounceField] = React.useState<string | null>(null);

// //   React.useEffect(() => {
// //     if (sessionShopId != null) {
// //       setForm((prev) => ({
// //         ...prev,
// //         shopId: sessionShopId,
// //       }));
// //     }
// //   }, [sessionShopId]);

// //   React.useEffect(() => {
// //     return () => {
// //       if (imagePreview) URL.revokeObjectURL(imagePreview);
// //     };
// //   }, [imagePreview]);

// //   const update = (key: keyof StaffForm, value: string | number | null) => {
// //     setForm((prev) => ({ ...prev, [key]: value as never }));
// //     setBounceField(key);
// //     setTimeout(() => setBounceField(null), 300);
// //   };

// //   const selectedRole =
// //     roleOptions.find((r) => r.value === form.role) ?? roleOptions[2];

// //   const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
// //     const file = event.target.files?.[0];
// //     if (!file) return;

// //     if (imagePreview) URL.revokeObjectURL(imagePreview);
// //     setImageFile(file);
// //     setImagePreview(URL.createObjectURL(file));
// //   };

// //   const resetForm = () => {
// //     setForm(createInitialForm(sessionShopId));
// //     setImageFile(null);
// //     if (imagePreview) URL.revokeObjectURL(imagePreview);
// //     setImagePreview("");
// //   };

// //   const validateForm = () => {
// //     if (!form.fullName.trim()) return "Full name is required.";
// //     if (!form.email.trim()) return "Email is required.";
// //     if (!form.phone.trim()) return "Phone is required.";
// //     if (!form.staffId) return "Staff ID is required.";
// //     if (!form.password.trim()) return "Password is required.";
// //     if (!form.dateOfBirth.trim()) return "Date of birth is required.";
// //     if (!form.role.trim()) return "Role is required.";
// //     if (!form.branch.trim()) return "Branch is required.";
// //     if (!form.status.trim()) return "Status is required.";
// //     if (!form.shopId) return "Shop ID is missing from session.";
// //     return "";
// //   };

// //   const handleSaveStaff = async () => {
// //     const err = validateForm();
// //     if (err) {
// //       setErrorMessage(err);
// //       setSuccessMessage("");
// //       return;
// //     }

// //     try {
// //       setLoading(true);
// //       setErrorMessage("");
// //       setSuccessMessage("");

// //       const accessToken = (session as any)?.accessToken;

// //       if (!accessToken) {
// //         throw new Error("Login session expired. Please sign in again.");
// //       }

// //       const payload = {
// //         ...form,
// //         shopId: sessionShopId ?? form.shopId,
// //       };

// //       const fd = new FormData();
// //       fd.append(
// //         "data",
// //         new Blob([JSON.stringify(payload)], { type: "application/json" })
// //       );

// //       if (imageFile) {
// //         fd.append("file", imageFile);
// //       }

// //       const res = await fetch(`${API_BASE_URL}/api/staff/with-image`, {
// //         method: "POST",
// //         headers: {
// //           Authorization: `Bearer ${accessToken}`,
// //         },
// //         body: fd,
// //       });

// //       if (!res.ok) {
// //         let msg = "Failed to save staff.";
// //         try {
// //           const d = await res.json();
// //           msg = d.message || JSON.stringify(d);
// //         } catch {
// //           msg = await res.text();
// //         }
// //         throw new Error(msg);
// //       }

// //       const result: ApiResponse = await res.json();
// //       setSuccessMessage(
// //         result.message || `${result.fullName || form.fullName} added! 🎉`
// //       );
// //       resetForm();

// //       setTimeout(() => {
// //         window.location.href = "/admin/staff";
// //       }, 800);
// //     } catch (e) {
// //       setErrorMessage(e instanceof Error ? e.message : "Something went wrong.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div
// //       className="min-h-screen relative overflow-hidden font-['Nunito',_sans-serif]"
// //       style={{
// //         background:
// //           "linear-gradient(135deg, #FFF9C4 0%, #FFE0F0 35%, #E0F4FF 70%, #E8FFE8 100%)",
// //       }}
// //     >
// //       <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');`}</style>

// //       {bubbles.map((b, i) => (
// //         <motion.div
// //           key={i}
// //           className="absolute rounded-full pointer-events-none"
// //           style={{
// //             width: b.size,
// //             height: b.size,
// //             top: b.top,
// //             left: b.left,
// //             background: b.color,
// //             border: "3px solid rgba(0,0,0,0.06)",
// //           }}
// //           animate={{ y: [0, -18, 0], scale: [1, 1.06, 1] }}
// //           transition={{
// //             duration: 4 + i,
// //             delay: b.delay,
// //             repeat: Infinity,
// //             ease: "easeInOut",
// //           }}
// //         />
// //       ))}

// //       {[
// //         { top: "12%", left: "18%", size: 20 },
// //         { top: "22%", left: "75%", size: 16 },
// //         { top: "70%", left: "12%", size: 14 },
// //         { top: "82%", left: "82%", size: 22 },
// //       ].map((s, i) => (
// //         <motion.div
// //           key={i}
// //           className="absolute pointer-events-none"
// //           style={{ top: s.top, left: s.left }}
// //           animate={{ rotate: [0, 180, 360], scale: [1, 1.3, 1] }}
// //           transition={{ duration: 6 + i, repeat: Infinity, ease: "linear" }}
// //         >
// //           <StarBurst
// //             size={s.size}
// //             color={["#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF"][i]}
// //           />
// //         </motion.div>
// //       ))}

// //       <div className="relative mx-auto flex min-h-screen max-w-[1400px] flex-col p-4 gap-4">
// //         <motion.div
// //           initial={{ opacity: 0, y: -30, scale: 0.95 }}
// //           animate={{ opacity: 1, y: 0, scale: 1 }}
// //           transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
// //           className="relative overflow-hidden rounded-[28px] p-5 text-white shadow-xl"
// //           style={{
// //             background: "linear-gradient(135deg, #FF6B6B, #FF8E53, #FFC53D)",
// //             border: "4px solid rgba(255,255,255,0.6)",
// //           }}
// //         >
// //           <div
// //             className="absolute inset-0 opacity-10"
// //             style={{
// //               backgroundImage:
// //                 "radial-gradient(circle, white 2px, transparent 2px)",
// //               backgroundSize: "24px 24px",
// //             }}
// //           />

// //           <div className="relative flex items-center justify-between gap-4">
// //             <div className="flex items-center gap-4">
// //               <motion.div
// //                 animate={{ rotate: [0, -10, 10, -10, 0] }}
// //                 transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
// //                 className="hidden md:flex h-16 w-16 items-center justify-center rounded-[20px] text-3xl shadow-lg"
// //                 style={{
// //                   background: "rgba(255,255,255,0.25)",
// //                   border: "3px solid rgba(255,255,255,0.5)",
// //                 }}
// //               >
// //                 🧑‍💼
// //               </motion.div>

// //               <div>
// //                 <motion.div
// //                   animate={{ scale: [1, 1.05, 1] }}
// //                   transition={{ duration: 2, repeat: Infinity }}
// //                   className="inline-flex items-center gap-2 mb-1 rounded-full px-3 py-1 text-xs font-black"
// //                   style={{
// //                     background: "rgba(255,255,255,0.25)",
// //                     border: "2px solid rgba(255,255,255,0.4)",
// //                   }}
// //                 >
// //                   ✨ Staff Create Page
// //                 </motion.div>
// //                 <h1
// //                   className="text-2xl md:text-4xl font-black drop-shadow-sm"
// //                   style={{ fontFamily: "'Fredoka One', cursive" }}
// //                 >
// //                   Add New Staff Member!
// //                 </h1>
// //                 <p className="mt-1 text-sm text-white/90 font-semibold">
// //                   Fill in the details below and hit Save 🚀
// //                 </p>
// //                 <p className="mt-1 text-xs text-white/80 font-bold">
// //                   Session Shop ID:{" "}
// //                   {sessionStatus === "loading"
// //                     ? "Loading..."
// //                     : sessionShopId ?? "No shop id"}
// //                 </p>
// //               </div>
// //             </div>

// //             <div className="flex shrink-0 gap-2">
// //               <CartoonButton
// //                 onClick={() => window.history.back()}
// //                 variant="ghost"
// //                 icon={<ArrowLeft className="h-4 w-4" />}
// //               >
// //                 Back
// //               </CartoonButton>

// //               <CartoonButton
// //                 onClick={handleSaveStaff}
// //                 disabled={loading || sessionStatus === "loading"}
// //                 icon={
// //                   loading ? (
// //                     <Loader2 className="h-4 w-4 animate-spin" />
// //                   ) : (
// //                     <Save className="h-4 w-4" />
// //                   )
// //                 }
// //                 variant="white"
// //               >
// //                 {loading ? "Saving..." : "Save"}
// //               </CartoonButton>
// //             </div>
// //           </div>
// //         </motion.div>

// //         <AnimatePresence>
// //           {errorMessage && (
// //             <motion.div
// //               key="err"
// //               initial={{ opacity: 0, scale: 0.9, y: -10 }}
// //               animate={{ opacity: 1, scale: 1, y: 0 }}
// //               exit={{ opacity: 0, scale: 0.9 }}
// //               className="rounded-[20px] px-5 py-3 text-sm font-bold flex items-center gap-2 shadow-md"
// //               style={{
// //                 background: "#FFF0F0",
// //                 border: "3px solid #FF6B6B",
// //                 color: "#D63031",
// //               }}
// //             >
// //               😱 {errorMessage}
// //             </motion.div>
// //           )}

// //           {successMessage && (
// //             <motion.div
// //               key="ok"
// //               initial={{ opacity: 0, scale: 0.9, y: -10 }}
// //               animate={{ opacity: 1, scale: 1, y: 0 }}
// //               exit={{ opacity: 0, scale: 0.9 }}
// //               className="rounded-[20px] px-5 py-3 text-sm font-bold flex items-center gap-2 shadow-md"
// //               style={{
// //                 background: "#F0FFF4",
// //                 border: "3px solid #00B894",
// //                 color: "#00B894",
// //               }}
// //             >
// //               🎉 {successMessage}
// //             </motion.div>
// //           )}
// //         </AnimatePresence>

// //         <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[1.4fr_0.9fr] ">
// //           <div className="space-y-4">
// //             <BubbleCard
// //               title="Personal Information 👤"
// //               description="Basic identity and contact details."
// //               delay={0.1}
// //             >
// //               <div className="grid gap-3 md:grid-cols-2">
// //                 <CartoonField
// //                   label="Full Name"
// //                   className="md:col-span-2"
// //                   bounce={bounceField === "fullName"}
// //                 >
// //                   <CartoonInput
// //                     icon="👤"
// //                     value={form.fullName}
// //                     onChange={(e) => update("fullName", e.target.value)}
// //                     placeholder="Enter full name"
// //                   />
// //                 </CartoonField>

// //                 <CartoonField label="Email" bounce={bounceField === "email"}>
// //                   <CartoonInput
// //                     icon="📧"
// //                     type="email"
// //                     value={form.email}
// //                     onChange={(e) => update("email", e.target.value)}
// //                     placeholder="staff@company.com"
// //                   />
// //                 </CartoonField>

// //                 <CartoonField label="Phone" bounce={bounceField === "phone"}>
// //                   <CartoonInput
// //                     icon="📞"
// //                     value={form.phone}
// //                     onChange={(e) => update("phone", e.target.value)}
// //                     placeholder="+95 9 xxx xxx xxx"
// //                   />
// //                 </CartoonField>

// //                 <CartoonField label="Staff ID">
// //                   <div className="relative">
// //                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">
// //                       🪪
// //                     </span>
// //                     <input
// //                       readOnly
// //                       value={form.staffId}
// //                       placeholder="Auto generated"
// //                       className="w-full h-11 pl-9 pr-4 rounded-[14px] text-sm font-black bg-amber-50 outline-none cursor-not-allowed"
// //                       style={{ border: "3px solid #FFE66D", color: "#E17055" }}
// //                     />
// //                   </div>
// //                 </CartoonField>

// //                 <CartoonField
// //                   label="Date of Birth"
// //                   bounce={bounceField === "dateOfBirth"}
// //                 >
// //                   <input
// //                     type="date"
// //                     value={form.dateOfBirth}
// //                     onChange={(e) => update("dateOfBirth", e.target.value)}
// //                     className="w-full h-11 px-4 rounded-[14px] text-sm font-semibold bg-white outline-none"
// //                     style={{ border: "3px solid #DDD", color: "#2d3436" }}
// //                   />
// //                 </CartoonField>

// //                 <CartoonField
// //                   label="Password"
// //                   bounce={bounceField === "password"}
// //                 >
// //                   <CartoonInput
// //                     icon="🔒"
// //                     type="password"
// //                     value={form.password}
// //                     onChange={(e) => update("password", e.target.value)}
// //                     placeholder="Enter password"
// //                   />
// //                 </CartoonField>

// //                 <CartoonField label="NRC / ID" bounce={bounceField === "nrc"}>
// //                   <CartoonInput
// //                     icon="📄"
// //                     value={form.nrc}
// //                     onChange={(e) => update("nrc", e.target.value)}
// //                     placeholder="Enter NRC or ID"
// //                   />
// //                 </CartoonField>

// //                 <CartoonField
// //                   label="Address"
// //                   className="md:col-span-2"
// //                   bounce={bounceField === "address"}
// //                 >
// //                   <CartoonInput
// //                     icon="📍"
// //                     value={form.address}
// //                     onChange={(e) => update("address", e.target.value)}
// //                     placeholder="Enter address"
// //                   />
// //                 </CartoonField>
// //               </div>
// //             </BubbleCard>

// //             <BubbleCard
// //               title="Work Information 💼"
// //               description="Assign role, branch, status, and salary."
// //               delay={0.2}
// //               color="#4ECDC4"
// //             >
// //               <div className="grid gap-3 md:grid-cols-2">
// //                 <CartoonField label="Role" className="md:col-span-2">
// //                   <div className="flex flex-wrap gap-2">
// //                     {roleOptions.map((r) => {
// //                       const Icon = r.icon;
// //                       const active = form.role === r.value;

// //                       return (
// //                         <motion.button
// //                           key={r.value}
// //                           type="button"
// //                           onClick={() => update("role", r.value)}
// //                           whileHover={{ scale: 1.08 }}
// //                           whileTap={{ scale: 0.94 }}
// //                           className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black transition-all"
// //                           style={{
// //                             background: active ? r.color : "#F5F5F5",
// //                             color: active ? "#fff" : "#555",
// //                             border: `3px solid ${active ? r.color : "#DDD"}`,
// //                             boxShadow: active ? `0 4px 12px ${r.color}55` : "none",
// //                           }}
// //                         >
// //                           <Icon className="h-4 w-4" />
// //                           {r.label}
// //                           {active && (
// //                             <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
// //                               ✓
// //                             </motion.span>
// //                           )}
// //                         </motion.button>
// //                       );
// //                     })}
// //                   </div>
// //                 </CartoonField>

// //                 <CartoonField label="Branch">
// //                   <select
// //                     value={form.branch}
// //                     onChange={(e) => update("branch", e.target.value)}
// //                     className="w-full h-11 px-4 rounded-[14px] text-sm font-semibold bg-white outline-none appearance-none cursor-pointer"
// //                     style={{ border: "3px solid #DDD" }}
// //                   >
// //                     {branchOptions.map((b) => (
// //                       <option key={b} value={b}>
// //                         {b}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </CartoonField>

// //                 <CartoonField label="Status">
// //                   <div className="flex gap-2">
// //                     {statusOptions.map((s) => {
// //                       const active = form.status === s.value;
// //                       return (
// //                         <motion.button
// //                           key={s.value}
// //                           type="button"
// //                           onClick={() => update("status", s.value)}
// //                           whileHover={{ scale: 1.06 }}
// //                           whileTap={{ scale: 0.94 }}
// //                           className="flex-1 flex items-center justify-center gap-1 py-2 rounded-[14px] text-xs font-black"
// //                           style={{
// //                             background: active
// //                               ? s.value === "active"
// //                                 ? "#00B894"
// //                                 : s.value === "on_leave"
// //                                 ? "#FDCB6E"
// //                                 : "#FF6B6B"
// //                               : "#F5F5F5",
// //                             color: active ? "#fff" : "#888",
// //                             border: `3px solid ${active ? "transparent" : "#DDD"}`,
// //                           }}
// //                         >
// //                           {s.emoji} {s.label}
// //                         </motion.button>
// //                       );
// //                     })}
// //                   </div>
// //                 </CartoonField>

// //                 <CartoonField label="Start Date">
// //                   <input
// //                     type="date"
// //                     value={form.startDate}
// //                     onChange={(e) => update("startDate", e.target.value)}
// //                     className="w-full h-11 px-4 rounded-[14px] text-sm font-semibold bg-white outline-none"
// //                     style={{ border: "3px solid #DDD" }}
// //                   />
// //                 </CartoonField>

// //                 <CartoonField label="Base Salary">
// //                   <CartoonInput
// //                     icon="💰"
// //                     value={form.salary}
// //                     onChange={(e) => update("salary", e.target.value)}
// //                     placeholder="Enter salary"
// //                   />
// //                 </CartoonField>
// //               </div>
// //             </BubbleCard>

// //             <BubbleCard
// //               title="Emergency & Notes 🚨"
// //               description="Emergency contact and extra notes."
// //               delay={0.3}
// //               color="#A8E6CF"
// //             >
// //               <div className="grid gap-3 md:grid-cols-2">
// //                 <CartoonField label="Emergency Contact Name">
// //                   <CartoonInput
// //                     icon="👨‍👩‍👧"
// //                     value={form.emergencyContact}
// //                     onChange={(e) => update("emergencyContact", e.target.value)}
// //                     placeholder="Contact person"
// //                   />
// //                 </CartoonField>

// //                 <CartoonField label="Emergency Phone">
// //                   <CartoonInput
// //                     icon="📱"
// //                     value={form.emergencyPhone}
// //                     onChange={(e) => update("emergencyPhone", e.target.value)}
// //                     placeholder="Phone number"
// //                   />
// //                 </CartoonField>

// //                 <CartoonField label="Notes" className="md:col-span-2">
// //                   <textarea
// //                     value={form.note}
// //                     onChange={(e) => update("note", e.target.value)}
// //                     placeholder="Additional notes... ✏️"
// //                     className="w-full min-h-[80px] px-4 py-3 rounded-[14px] text-sm font-semibold bg-white outline-none resize-none"
// //                     style={{ border: "3px solid #DDD" }}
// //                   />
// //                 </CartoonField>
// //               </div>
// //             </BubbleCard>
// //           </div>

// //           <motion.div
// //             initial={{ opacity: 0, x: 30 }}
// //             animate={{ opacity: 1, x: 0 }}
// //             transition={{ duration: 0.5, delay: 0.25, type: "spring", bounce: 0.3 }}
// //           >
// //             <div
// //               className="sticky top-4 rounded-[28px] overflow-hidden shadow-2xl"
// //               style={{
// //                 background: "white",
// //                 border: "4px solid rgba(0,0,0,0.08)",
// //               }}
// //             >
// //               <div
// //                 className="relative p-4 text-white overflow-hidden"
// //                 style={{
// //                   background: "linear-gradient(135deg, #667eea, #764ba2, #f64f59)",
// //                 }}
// //               >
// //                 <div
// //                   className="absolute inset-0 opacity-15"
// //                   style={{
// //                     backgroundImage:
// //                       "radial-gradient(circle, white 1.5px, transparent 1.5px)",
// //                     backgroundSize: "18px 18px",
// //                   }}
// //                 />
// //                 <div className="relative flex items-center gap-2">
// //                   <motion.span
// //                     animate={{ rotate: [0, 20, -20, 0] }}
// //                     transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
// //                     className="text-2xl"
// //                   >
// //                     👁️
// //                   </motion.span>
// //                   <div>
// //                     <div
// //                       className="font-black text-lg"
// //                       style={{ fontFamily: "'Fredoka One', cursive" }}
// //                     >
// //                       Live Preview
// //                     </div>
// //                     <div className="text-xs text-white/80 font-semibold">
// //                       Quick summary before saving
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>

// //               <div className="p-4 space-y-4">
// //                 <motion.div
// //                   layout
// //                   className="relative rounded-[22px] p-4 text-white overflow-hidden shadow-lg"
// //                   style={{
// //                     background: `linear-gradient(135deg, ${selectedRole.color}, ${selectedRole.color}99, #667eea)`,
// //                   }}
// //                 >
// //                   <div className="absolute -right-4 -top-4 text-6xl opacity-20 select-none">
// //                     {["👑", "🛡️", "🔑", "📦"][roleOptions.findIndex((r) => r.value === form.role)]}
// //                   </div>

// //                   <motion.div layout className="mb-3 relative w-16 h-16">
// //                     {imagePreview ? (
// //                       <img
// //                         src={imagePreview}
// //                         alt="preview"
// //                         className="w-16 h-16 rounded-[18px] object-cover ring-4 ring-white/40 shadow-lg"
// //                       />
// //                     ) : (
// //                       <motion.div
// //                         animate={{ scale: [1, 1.05, 1] }}
// //                         transition={{ duration: 2, repeat: Infinity }}
// //                         className="w-16 h-16 flex items-center justify-center rounded-[18px] text-2xl font-black shadow-lg"
// //                         style={{
// //                           background: "rgba(255,255,255,0.25)",
// //                           border: "3px solid rgba(255,255,255,0.5)",
// //                         }}
// //                       >
// //                         {form.fullName
// //                           ? form.fullName
// //                               .split(" ")
// //                               .map((p) => p[0])
// //                               .join("")
// //                               .slice(0, 2)
// //                               .toUpperCase()
// //                           : "🧑"}
// //                       </motion.div>
// //                     )}

// //                     <div
// //                       className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
// //                       style={{
// //                         background:
// //                           form.status === "active"
// //                             ? "#00B894"
// //                             : form.status === "on_leave"
// //                             ? "#FDCB6E"
// //                             : "#FF6B6B",
// //                       }}
// //                     />
// //                   </motion.div>

// //                   <motion.div
// //                     layout
// //                     className="text-xl font-black"
// //                     style={{ fontFamily: "'Fredoka One', cursive" }}
// //                   >
// //                     {form.fullName || "New Staff ✨"}
// //                   </motion.div>
// //                   <div className="text-sm text-white/80 font-semibold mt-0.5">
// //                     {form.email || "staff@company.com"}
// //                   </div>
// //                 </motion.div>

// //                 <div className="grid gap-2">
// //                   {[
// //                     { emoji: "🪪", label: "Staff ID", value: String(form.staffId || "—") },
// //                     {
// //                       emoji:
// //                         selectedRole.value === "admin"
// //                           ? "👑"
// //                           : selectedRole.value === "manager"
// //                           ? "🛡️"
// //                           : selectedRole.value === "cashier"
// //                           ? "🔑"
// //                           : "📦",
// //                       label: "Role",
// //                       value: selectedRole.label,
// //                     },
// //                     { emoji: "🏢", label: "Branch", value: form.branch },
// //                     {
// //                       emoji:
// //                         form.status === "active"
// //                           ? "🟢"
// //                           : form.status === "on_leave"
// //                           ? "🟡"
// //                           : "🔴",
// //                       label: "Status",
// //                       value: form.status.replace("_", " "),
// //                     },
// //                     {
// //                       emoji: "🏪",
// //                       label: "Shop ID",
// //                       value: form.shopId ? String(form.shopId) : "Missing from session",
// //                     },
// //                     { emoji: "🎂", label: "Birthday", value: form.dateOfBirth || "Not set" },
// //                     { emoji: "💰", label: "Salary", value: form.salary || "Not set" },
// //                   ].map((item, i) => (
// //                     <motion.div
// //                       key={item.label}
// //                       layout
// //                       initial={{ opacity: 0, x: 10 }}
// //                       animate={{ opacity: 1, x: 0 }}
// //                       transition={{ delay: 0.1 + i * 0.05 }}
// //                       className="flex items-center gap-3 rounded-[14px] p-2.5"
// //                       style={{ background: "#F8F8FC", border: "2.5px solid #EBEBF5" }}
// //                     >
// //                       <span className="text-lg w-7 text-center">{item.emoji}</span>
// //                       <div>
// //                         <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
// //                           {item.label}
// //                         </div>
// //                         <div className="text-sm font-black text-gray-700 capitalize">
// //                           {item.value}
// //                         </div>
// //                       </div>
// //                     </motion.div>
// //                   ))}
// //                 </div>

// //                 <motion.label
// //                   htmlFor="staff-image-upload"
// //                   whileHover={{ scale: 1.02 }}
// //                   whileTap={{ scale: 0.98 }}
// //                   className="block rounded-[18px] p-4 text-center cursor-pointer transition-colors"
// //                   style={{
// //                     border: "3px dashed #C3B1E1",
// //                     background: "#FAF5FF",
// //                   }}
// //                 >
// //                   <motion.div
// //                     animate={{ y: [0, -5, 0] }}
// //                     transition={{ duration: 2, repeat: Infinity }}
// //                   >
// //                     <span className="text-3xl">📸</span>
// //                   </motion.div>
// //                   <div className="mt-1 text-sm font-black text-purple-700">
// //                     Upload Photo
// //                   </div>
// //                   <div className="text-xs text-purple-400 font-semibold">
// //                     Click to browse image
// //                   </div>
// //                   <input
// //                     id="staff-image-upload"
// //                     type="file"
// //                     accept="image/*"
// //                     className="hidden"
// //                     onChange={handleImageChange}
// //                   />
// //                 </motion.label>

// //                 <div className="grid gap-2 pt-1">
// //                   <motion.button
// //                     type="button"
// //                     onClick={() => window.history.back()}
// //                     whileHover={{ scale: 1.03 }}
// //                     whileTap={{ scale: 0.96 }}
// //                     className="w-full h-11 rounded-[16px] text-sm font-black flex items-center justify-center gap-2"
// //                     style={{
// //                       background: "#F5F5F5",
// //                       border: "3px solid #DDD",
// //                       color: "#555",
// //                     }}
// //                   >
// //                     <ArrowLeft className="h-4 w-4" /> Back
// //                   </motion.button>

// //                   <motion.button
// //                     type="button"
// //                     onClick={handleSaveStaff}
// //                     disabled={loading || sessionStatus === "loading"}
// //                     whileHover={{
// //                       scale: loading ? 1 : 1.04,
// //                       rotate: loading ? 0 : [0, -1, 1, 0],
// //                     }}
// //                     whileTap={{ scale: 0.95 }}
// //                     className="w-full h-12 rounded-[16px] text-sm font-black flex items-center justify-center gap-2 text-white shadow-xl relative overflow-hidden disabled:opacity-60"
// //                     style={{
// //                       background:
// //                         "linear-gradient(135deg, #FF6B6B, #FF8E53, #FFC53D)",
// //                       border: "3px solid rgba(255,255,255,0.4)",
// //                     }}
// //                   >
// //                     <div
// //                       className="absolute inset-0 opacity-20"
// //                       style={{
// //                         backgroundImage:
// //                           "radial-gradient(circle, white 1px, transparent 1px)",
// //                         backgroundSize: "12px 12px",
// //                       }}
// //                     />
// //                     <span className="relative flex items-center gap-2">
// //                       {loading ? (
// //                         <Loader2 className="h-4 w-4 animate-spin" />
// //                       ) : (
// //                         "🚀"
// //                       )}
// //                       {loading ? "Saving..." : "Save Staff!"}
// //                     </span>
// //                   </motion.button>
// //                 </div>
// //               </div>
// //             </div>
// //           </motion.div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // /* ─── Sub-components ─────────────────────────────────────── */

// // function BubbleCard({
// //   title,
// //   description,
// //   children,
// //   delay = 0,
// //   color = "#FF6B6B",
// // }: {
// //   title: string;
// //   description: string;
// //   children: React.ReactNode;
// //   delay?: number;
// //   color?: string;
// // }) {
// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 20 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       transition={{ duration: 0.4, delay, type: "spring", bounce: 0.3 }}
// //       className="relative rounded-[24px] overflow-hidden shadow-lg"
// //       style={{
// //         background: "rgba(255,255,255,0.85)",
// //         border: "3.5px solid rgba(255,255,255,0.9)",
// //         backdropFilter: "blur(16px)",
// //       }}
// //     >
// //       <div
// //         className="h-1.5 w-full"
// //         style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
// //       />
// //       <div className="px-5 pt-4 pb-2">
// //         <div
// //           className="text-base font-black text-gray-800"
// //           style={{ fontFamily: "'Fredoka One', cursive" }}
// //         >
// //           {title}
// //         </div>
// //         <div className="text-xs text-gray-400 font-semibold mb-3">
// //           {description}
// //         </div>
// //         {children}
// //       </div>
// //       <div className="h-4" />
// //     </motion.div>
// //   );
// // }

// // function CartoonField({
// //   label,
// //   children,
// //   className = "",
// //   bounce = false,
// // }: {
// //   label: string;
// //   children: React.ReactNode;
// //   className?: string;
// //   bounce?: boolean;
// // }) {
// //   return (
// //     <motion.div
// //       className={`space-y-1.5 ${className}`}
// //       animate={bounce ? { scale: [1, 1.03, 1] } : {}}
// //     >
// //       <label className="text-xs font-black text-gray-500 uppercase tracking-wide">
// //         {label}
// //       </label>
// //       {children}
// //     </motion.div>
// //   );
// // }

// // function CartoonInput({
// //   icon,
// //   className = "",
// //   ...props
// // }: React.InputHTMLAttributes<HTMLInputElement> & { icon: string }) {
// //   return (
// //     <div className="relative">
// //       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base pointer-events-none">
// //         {icon}
// //       </span>
// //       <input
// //         {...props}
// //         className={`w-full h-11 pl-9 pr-4 rounded-[14px] text-sm font-semibold bg-white text-gray-900 outline-none transition-all
// //           focus:ring-0 placeholder:text-gray-300 ${className}`}
// //         style={{ border: "3px solid #E5E5E5", ...((props as any).style || {}) }}
// //         onFocus={(e) => {
// //           e.target.style.border = "3px solid #4ECDC4";
// //           e.target.style.boxShadow = "0 0 0 4px rgba(78,205,196,0.12)";
// //         }}
// //         onBlur={(e) => {
// //           e.target.style.border = "3px solid #E5E5E5";
// //           e.target.style.boxShadow = "none";
// //         }}
// //       />
// //     </div>
// //   );
// // }

// // function CartoonButton({
// //   children,
// //   onClick,
// //   disabled,
// //   icon,
// //   variant = "default",
// // }: {
// //   children: React.ReactNode;
// //   onClick?: () => void;
// //   disabled?: boolean;
// //   icon?: React.ReactNode;
// //   variant?: "default" | "ghost" | "white";
// // }) {
// //   const styles = {
// //     default: {
// //       background: "linear-gradient(135deg,#FF6B6B,#FF8E53)",
// //       color: "white",
// //       border: "3px solid rgba(255,255,255,0.3)",
// //     },
// //     ghost: {
// //       background: "rgba(255,255,255,0.15)",
// //       color: "white",
// //       border: "2px solid rgba(255,255,255,0.4)",
// //     },
// //     white: {
// //       background: "white",
// //       color: "#E17055",
// //       border: "3px solid rgba(255,255,255,0.6)",
// //     },
// //   }[variant];

// //   return (
// //     <motion.button
// //       type="button"
// //       onClick={onClick}
// //       disabled={disabled}
// //       whileHover={{ scale: disabled ? 1 : 1.06 }}
// //       whileTap={{ scale: 0.94 }}
// //       className="h-10 px-4 rounded-[14px] text-sm font-black flex items-center gap-2 shadow-md disabled:opacity-60"
// //       style={styles}
// //     >
// //       {icon} {children}
// //     </motion.button>
// //   );
// // }



















// "use client";

// import * as React from "react";
// import { useSession } from "next-auth/react";
// import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
// import {
//   ArrowLeft,
//   Crown,
//   Key,
//   Loader2,
//   Save,
//   Shield,
//   Store,
//   User,
//   Mail,
//   Phone,
//   Calendar,
//   MapPin,
//   Wallet,
//   FileText,
//   ImagePlus,
//   Sparkles,
//   Moon,
//   SunMedium,
//   Camera,
// } from "lucide-react";

// /* ─── Types ─────────────────────────────────────────────── */
// type StaffForm = {
//   fullName: string;
//   email: string;
//   phone: string;
//   nrc: string;
//   staffId: number | "";
//   password: string;
//   dateOfBirth: string;
//   shopId: number | null;
//   role: string;
//   branch: string;
//   status: string;
//   startDate: string;
//   salary: string;
//   address: string;
//   emergencyContact: string;
//   emergencyPhone: string;
//   note: string;
// };

// type ApiResponse = {
//   id?: number;
//   fullName?: string;
//   email?: string;
//   message?: string;
//   imageUrl?: string;
// };

// /* ─── Constants ─────────────────────────────────────────── */
// const roleOptions = [
//   { value: "admin", label: "Admin", icon: Crown },
//   { value: "manager", label: "Manager", icon: Shield },
//   { value: "cashier", label: "Cashier", icon: Key },
//   { value: "stock", label: "Stock", icon: Store },
// ];

// const branchOptions = ["Main Branch", "Branch A", "Branch B", "Online Shop"];

// const statusOptions = [
//   { value: "active", label: "Active", emoji: "🟢" },
//   { value: "on_leave", label: "On Leave", emoji: "🟡" },
//   { value: "inactive", label: "Inactive", emoji: "🔴" },
// ];

// const generateStaffId = () => Math.floor(100000 + Math.random() * 900000);

// const createInitialForm = (shopId: number | null = null): StaffForm => ({
//   fullName: "",
//   email: "",
//   phone: "",
//   nrc: "",
//   staffId: generateStaffId(),
//   password: "",
//   dateOfBirth: "",
//   shopId,
//   role: "cashier",
//   branch: "Main Branch",
//   status: "active",
//   startDate: "",
//   salary: "",
//   address: "",
//   emergencyContact: "",
//   emergencyPhone: "",
//   note: "",
// });

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// /* ─── Theme helpers ─────────────────────────────────────── */
// function FontImport() {
//   return (
//     <style>{`
//       @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Sans:wght@400;500;700&display=swap');
//       * { font-family: 'DM Sans', sans-serif; }
//       .cormorant { font-family: 'Cormorant Garamond', serif !important; }
//       ::placeholder { color: rgba(122,85,32,0.75); opacity: 1; }
//     `}</style>
//   );
// }

// function glassCard(night:boolean, extra?:React.CSSProperties): React.CSSProperties {
//   return {
//     background: night ? "rgba(10,7,4,0.84)" : "rgba(255,255,255,0.88)",
//     border: `1px solid ${night ? "rgba(200,137,42,0.20)" : "rgba(200,160,80,0.28)"}`,
//     boxShadow: night
//       ? "0 18px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)"
//       : "0 18px 48px rgba(26,18,8,0.08), inset 0 1px 0 rgba(255,255,255,0.7)",
//     backdropFilter: "blur(22px)",
//     ...extra,
//   };
// }

// function inputStyle(night:boolean): React.CSSProperties {
//   return {
//     background: night ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.72)",
//     border: `1.5px solid ${night ? "rgba(200,137,42,0.18)" : "rgba(200,160,80,0.30)"}`,
//     color: night ? "#e8dcc8" : "#2a1e0e",
//     boxShadow: night ? "inset 0 1px 0 rgba(255,255,255,0.03)" : "0 1px 3px rgba(0,0,0,0.04)",
//   };
// }

// function labelClass(night:boolean) {
//   return `text-[10px] uppercase tracking-[0.22em] font-bold ${night ? "text-[#7a5520]" : "text-[#9a7840]"}`;
// }

// function textMain(night:boolean) {
//   return night ? "#e8dcc8" : "#1a1208";
// }

// function textMuted(night:boolean) {
//   return night ? "#8a7150" : "#8a7252";
// }

// /* ─── Premium Lantern ───────────────────────────────────── */
// function PremiumLantern({ size = 80, night = true }: { size?: number; night?: boolean }) {
//   const h = size * 1.72;
//   const w = size;

//   return (
//     <svg width={w} height={h} viewBox="0 0 80 138" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <defs>
//         <radialGradient id={`fg1-${size}-${night}`} cx="50%" cy="55%" r="48%">
//           <stop offset="0%" stopColor="#fff9e0" stopOpacity="1" />
//           <stop offset="22%" stopColor="#fcd34d" stopOpacity="0.92" />
//           <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.55" />
//           <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
//         </radialGradient>
//         <linearGradient id={`bodyN-${size}-${night}`} x1="0" y1="0" x2="1" y2="0">
//           <stop offset="0%" stopColor="#0a0703" />
//           <stop offset="28%" stopColor="#150e05" />
//           <stop offset="52%" stopColor="#1c1208" />
//           <stop offset="100%" stopColor="#0c0803" />
//         </linearGradient>
//         <linearGradient id={`bodyD-${size}-${night}`} x1="0" y1="0" x2="1" y2="0">
//           <stop offset="0%" stopColor="#e8d9b8" />
//           <stop offset="30%" stopColor="#f5edd8" />
//           <stop offset="55%" stopColor="#faf4e8" />
//           <stop offset="100%" stopColor="#e0cfa8" />
//         </linearGradient>
//         <linearGradient id={`metalG-${size}-${night}`} x1="0" y1="0" x2="0" y2="1">
//           <stop offset="0%" stopColor="#d4a352" />
//           <stop offset="40%" stopColor="#b8841e" />
//           <stop offset="70%" stopColor="#9a6b14" />
//           <stop offset="100%" stopColor="#7a5210" />
//         </linearGradient>
//         <radialGradient id={`outerGlow-${size}-${night}`} cx="50%" cy="50%" r="50%">
//           <stop offset="0%" stopColor="#fcd34d" stopOpacity="0.18" />
//           <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.06" />
//           <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
//         </radialGradient>
//         <clipPath id={`bodyClip-${size}-${night}`}>
//           <path d="M14 32 Q10 64 10 78 Q10 98 14 108 L66 108 Q70 98 70 78 Q70 64 66 32 Z" />
//         </clipPath>
//       </defs>

//       <line x1="40" y1="0" x2="40" y2="14" stroke={night ? "#c8892a" : "#9a6b14"} strokeWidth="2" strokeLinecap="round" />
//       <circle cx="40" cy="2" r="2.5" fill={night ? "#d4a352" : "#b07820"} />
//       <ellipse cx="40" cy="18" rx="20" ry="5" fill={`url(#metalG-${size}-${night})`} />
//       <path d="M20 18 L24 30 L56 30 L60 18 Z" fill={`url(#metalG-${size}-${night})`} />
//       <rect x="22" y="28" width="36" height="4" rx="2" fill={`url(#metalG-${size}-${night})`} />

//       {night && <ellipse cx="40" cy="72" rx="36" ry="44" fill={`url(#outerGlow-${size}-${night})`} />}

//       <path d="M14 32 Q10 64 10 78 Q10 98 14 108 L22 108 L22 32 Z" fill={night ? "#0d0904" : "#d0bc90"} />
//       <path d="M66 32 Q70 64 70 78 Q70 98 66 108 L58 108 L58 32 Z" fill={night ? "#100a04" : "#c8b488"} />
//       <path d="M22 32 Q20 64 20 78 Q20 98 22 108 L58 108 Q60 98 60 78 Q60 64 58 32 Z" fill={night ? `url(#bodyN-${size}-${night})` : `url(#bodyD-${size}-${night})`} />

//       {night ? (
//         <g clipPath={`url(#bodyClip-${size}-${night})`}>
//           <motion.ellipse
//             cx="40" cy="70" rx="10" ry="16"
//             fill="#f59e0b" opacity="0.22"
//             animate={{ ry: [16, 19, 14, 18, 16], cx: [40, 39.2, 40.6, 39.6, 40] }}
//             transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
//           />
//           <motion.ellipse
//             cx="40" cy="71" rx="7" ry="12"
//             fill="#fbbf24" opacity="0.55"
//             animate={{ ry: [12, 14.5, 10.5, 13.5, 12] }}
//             transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
//           />
//           <motion.ellipse
//             cx="40" cy="72" rx="4" ry="7.5"
//             fill="#fde68a" opacity="0.85"
//             animate={{ ry: [7.5, 9, 6.5, 8.5, 7.5] }}
//             transition={{ duration: 0.85, repeat: Infinity, ease: "easeInOut" }}
//           />
//           <path d="M22 32 Q20 64 20 78 Q20 98 22 108 L58 108 Q60 98 60 78 Q60 64 58 32 Z" fill={`url(#fg1-${size}-${night})`} opacity="0.55" />
//         </g>
//       ) : (
//         <motion.g animate={{ opacity: [0.6, 0.85, 0.62], scale: [0.97, 1.03, 0.98] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}>
//           <ellipse cx="40" cy="70" rx="10" ry="14" fill="#fff4d0" opacity="0.5" />
//           <ellipse cx="40" cy="71" rx="6" ry="9" fill="#ffe9a0" opacity="0.45" />
//           <ellipse cx="40" cy="72" rx="3" ry="5" fill="#fffdf5" opacity="0.7" />
//         </motion.g>
//       )}

//       <rect x="22" y="108" width="36" height="4" rx="2" fill={`url(#metalG-${size}-${night})`} />
//       <path d="M24 112 L20 122 L60 122 L56 112 Z" fill={`url(#metalG-${size}-${night})`} />
//       <ellipse cx="40" cy="122" rx="20" ry="4.5" fill={`url(#metalG-${size}-${night})`} />
//       <line x1="40" y1="126" x2="40" y2="135" stroke={night ? "#c8892a" : "#9a6b14"} strokeWidth="1.8" strokeLinecap="round" />
//       <motion.ellipse
//         cx="40" cy="137" rx="3.5" ry="2.2"
//         fill={night ? "#d4a352" : "#b07820"}
//         animate={{ ry: [2.2, 3, 1.8, 2.5, 2.2] }}
//         transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
//       />
//     </svg>
//   );
// }

// function TiltLantern({ night, size = 88 }: { night: boolean; size?: number }) {
//   const mouseX = useMotionValue(0);
//   const mouseY = useMotionValue(0);
//   const rotateX = useSpring(useTransform(mouseY, [-100, 100], [8, -8]), { stiffness: 60, damping: 18 });
//   const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-10, 10]), { stiffness: 60, damping: 18 });

//   function handleMouse(e: React.MouseEvent<HTMLDivElement>) {
//     const rect = e.currentTarget.getBoundingClientRect();
//     mouseX.set(e.clientX - rect.left - rect.width / 2);
//     mouseY.set(e.clientY - rect.top - rect.height / 2);
//   }

//   return (
//     <motion.div
//       onMouseMove={handleMouse}
//       onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
//       style={{ perspective: 600, display: "inline-block" }}
//       animate={{ y: [0, -14, 0] }}
//       transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
//     >
//       <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
//         <PremiumLantern size={size} night={night} />
//       </motion.div>
//     </motion.div>
//   );
// }

// function AmbientParticles({ night }: { night: boolean }) {
//   const dots = React.useMemo(() =>
//     Array.from({ length: 36 }).map((_, i) => ({
//       id: i,
//       x: `${(i * 29 + 11) % 98}%`,
//       y: `${(i * 43 + 17) % 95}%`,
//       size: 1 + (i % 4) * 0.8,
//       dur: 2.2 + (i % 5) * 0.8,
//       delay: (i * 0.18) % 5,
//       color: night
//         ? ["#e0e7ff", "#fef3c7", "#ddd6fe", "#ffffff", "#fde68a"][i % 5]
//         : ["rgba(200,137,42,0.3)", "rgba(245,158,11,0.2)", "rgba(180,120,30,0.25)"][i % 3],
//     })), [night]);

//   return (
//     <div className="pointer-events-none fixed inset-0 overflow-hidden">
//       {dots.map(p => (
//         <motion.div
//           key={p.id}
//           className="absolute rounded-full"
//           style={{ left: p.x, top: p.y, width: p.size, height: p.size, background: p.color }}
//           animate={{ opacity: [0.05, 0.85, 0.05], scale: [0.6, 1.5, 0.6] }}
//           transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
//         />
//       ))}
//     </div>
//   );
// }

// /* ─── Inputs ────────────────────────────────────────────── */
// function PremiumField({
//   label,
//   children,
//   night,
//   className = "",
// }:{
//   label:string;
//   children:React.ReactNode;
//   night:boolean;
//   className?:string;
// }) {
//   return (
//     <div className={`space-y-2 ${className}`}>
//       <label className={labelClass(night)}>{label}</label>
//       {children}
//     </div>
//   );
// }

// function PremiumInput({
//   icon,
//   night,
//   className = "",
//   style,
//   ...props
// }: React.InputHTMLAttributes<HTMLInputElement> & {
//   icon?: React.ReactNode;
//   night:boolean;
// }) {
//   return (
//     <div className="relative">
//       {icon && (
//         <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{color:night?"#7a5520":"#9a7840"}}>
//           {icon}
//         </span>
//       )}
//       <input
//         {...props}
//         className={`h-12 w-full rounded-[16px] pr-4 text-sm outline-none ${icon ? "pl-10" : "px-4"} ${className}`}
//         style={{ ...inputStyle(night), ...(style || {}) }}
//       />
//     </div>
//   );
// }

// /* ─── Buttons ───────────────────────────────────────────── */
// function PremiumButton({
//   children,
//   onClick,
//   disabled,
//   icon,
//   variant = "default",
//   night,
// }:{
//   children:React.ReactNode;
//   onClick?:()=>void;
//   disabled?:boolean;
//   icon?:React.ReactNode;
//   variant?:"default"|"ghost";
//   night:boolean;
// }) {
//   const styles =
//     variant === "default"
//       ? {
//           background: "linear-gradient(135deg,#a07020,#d4a352)",
//           color: "#140d05",
//           border: "1px solid rgba(212,163,82,0.65)",
//           boxShadow: "0 12px 28px rgba(200,137,42,0.18)",
//         }
//       : {
//           ...inputStyle(night),
//           color: night ? "#c9b18a" : "#7b6039",
//           border: `1px solid ${night ? "rgba(200,137,42,0.14)" : "rgba(200,160,80,0.20)"}`,
//         };

//   return (
//     <motion.button
//       type="button"
//       onClick={onClick}
//       disabled={disabled}
//       whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -1 }}
//       whileTap={{ scale: disabled ? 1 : 0.97 }}
//       className="flex h-11 items-center justify-center gap-2 rounded-full px-4 text-[12px] font-bold disabled:opacity-60"
//       style={styles}
//     >
//       {icon}
//       {children}
//     </motion.button>
//   );
// }

// /* ─── Main Component ────────────────────────────────────── */
// export default function CreateStaffPage() {
//   const { data: session, status: sessionStatus } = useSession();

//   const sessionShopId =
//     typeof (session?.user as any)?.shopId === "number"
//       ? (session?.user as any)?.shopId
//       : null;

//   const [form, setForm] = React.useState<StaffForm>(() => createInitialForm(sessionShopId));
//   const [imagePreview, setImagePreview] = React.useState<string>("");
//   const [imageFile, setImageFile] = React.useState<File | null>(null);
//   const [loading, setLoading] = React.useState(false);
//   const [errorMessage, setErrorMessage] = React.useState("");
//   const [successMessage, setSuccessMessage] = React.useState("");
//   const [night, setNight] = React.useState(true);

//   React.useEffect(() => {
//     if (sessionShopId != null) {
//       setForm((prev) => ({ ...prev, shopId: sessionShopId }));
//     }
//   }, [sessionShopId]);

//   React.useEffect(() => {
//     const saved = localStorage.getItem("premium-addstaff-theme");
//     if (saved) setNight(saved === "night");
//   }, []);

//   React.useEffect(() => {
//     localStorage.setItem("premium-addstaff-theme", night ? "night" : "day");
//   }, [night]);

//   React.useEffect(() => {
//     return () => {
//       if (imagePreview) URL.revokeObjectURL(imagePreview);
//     };
//   }, [imagePreview]);

//   const update = (key: keyof StaffForm, value: string | number | null) => {
//     setForm((prev) => ({ ...prev, [key]: value as never }));
//   };

//   const selectedRole =
//     roleOptions.find((r) => r.value === form.role) ?? roleOptions[2];

//   const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     if (imagePreview) URL.revokeObjectURL(imagePreview);
//     setImageFile(file);
//     setImagePreview(URL.createObjectURL(file));
//   };

//   const resetForm = () => {
//     setForm(createInitialForm(sessionShopId));
//     setImageFile(null);
//     if (imagePreview) URL.revokeObjectURL(imagePreview);
//     setImagePreview("");
//   };

//   const validateForm = () => {
//     if (!form.fullName.trim()) return "Full name is required.";
//     if (!form.email.trim()) return "Email is required.";
//     if (!form.phone.trim()) return "Phone is required.";
//     if (!form.staffId) return "Staff ID is required.";
//     if (!form.password.trim()) return "Password is required.";
//     if (!form.dateOfBirth.trim()) return "Date of birth is required.";
//     if (!form.role.trim()) return "Role is required.";
//     if (!form.branch.trim()) return "Branch is required.";
//     if (!form.status.trim()) return "Status is required.";
//     if (!form.shopId) return "Shop ID is missing from session.";
//     return "";
//   };

//   const handleSaveStaff = async () => {
//     const err = validateForm();
//     if (err) {
//       setErrorMessage(err);
//       setSuccessMessage("");
//       return;
//     }

//     try {
//       setLoading(true);
//       setErrorMessage("");
//       setSuccessMessage("");

//       const accessToken = (session as any)?.accessToken;
//       if (!accessToken) {
//         throw new Error("Login session expired. Please sign in again.");
//       }

//       const payload = {
//         ...form,
//         shopId: sessionShopId ?? form.shopId,
//       };

//       const fd = new FormData();
//       fd.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
//       if (imageFile) fd.append("file", imageFile);

//       const res = await fetch(`${API_BASE_URL}/api/staff/with-image`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${accessToken}` },
//         body: fd,
//       });

//       if (!res.ok) {
//         let msg = "Failed to save staff.";
//         try {
//           const d = await res.json();
//           msg = d.message || JSON.stringify(d);
//         } catch {
//           msg = await res.text();
//         }
//         throw new Error(msg);
//       }

//       const result: ApiResponse = await res.json();
//       setSuccessMessage(result.message || `${result.fullName || form.fullName} added successfully.`);
//       resetForm();

//       setTimeout(() => {
//         window.location.href = "/admin/staff";
//       }, 800);
//     } catch (e) {
//       setErrorMessage(e instanceof Error ? e.message : "Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const bg = night
//     ? "linear-gradient(155deg, #060409 0%, #0c0a12 38%, #100802 68%, #080510 100%)"
//     : "linear-gradient(155deg, #f7f2ea 0%, #faf6f0 45%, #f2ece0 100%)";

//   return (
//     <>
//       <FontImport />
//       <div className="relative min-h-screen overflow-hidden" style={{ background: bg, transition: "background 0.8s ease" }}>
//         <AmbientParticles night={night} />

//         <div className="pointer-events-none absolute inset-0">
//           <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl" style={{ background: night ? "rgba(251,191,36,0.08)" : "rgba(245,158,11,0.06)" }} />
//           <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full blur-3xl" style={{ background: night ? "rgba(217,119,6,0.09)" : "rgba(180,120,30,0.05)" }} />
//         </div>

//         <AnimatePresence>
//           {errorMessage && (
//             <motion.div
//               key="err"
//               initial={{ opacity: 0, y: -14, scale: 0.96 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: -14, scale: 0.96 }}
//               className="fixed left-1/2 top-5 z-[80] -translate-x-1/2 rounded-full px-5 py-2.5 text-[13px] font-bold"
//               style={{
//                 background: night ? "rgba(60,10,10,0.55)" : "#fff1f2",
//                 border: night ? "1px solid rgba(200,50,50,0.25)" : "1px solid #fecdd3",
//                 color: night ? "#f87171" : "#dc2626",
//                 backdropFilter: "blur(14px)",
//               }}
//             >
//               {errorMessage}
//             </motion.div>
//           )}

//           {successMessage && (
//             <motion.div
//               key="ok"
//               initial={{ opacity: 0, y: -14, scale: 0.96 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: -14, scale: 0.96 }}
//               className="fixed left-1/2 top-5 z-[80] -translate-x-1/2 rounded-full px-5 py-2.5 text-[13px] font-bold"
//               style={{
//                 background: night ? "rgba(10,40,22,0.60)" : "#ecfdf5",
//                 border: night ? "1px solid rgba(16,185,129,0.25)" : "1px solid #bbf7d0",
//                 color: night ? "#6ee7b7" : "#059669",
//                 backdropFilter: "blur(14px)",
//               }}
//             >
//               {successMessage}
//             </motion.div>
//           )}
//         </AnimatePresence>

//         <div className="relative z-10 mx-auto max-w-[1450px] px-4 py-6 md:px-6">
//           <div className="mb-6 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="h-1.5 w-1.5 rounded-full bg-[#c8892a]" />
//               <span className={labelClass(night)}>CUTEPOS · STAFF CREATE</span>
//             </div>

//             <motion.button
//               type="button"
//               onClick={() => setNight((p) => !p)}
//               whileHover={{ scale: 1.04, y: -1 }}
//               whileTap={{ scale: 0.96 }}
//               className="flex items-center gap-3 rounded-full px-4 py-2"
//               style={glassCard(night)}
//             >
//               <PremiumLantern size={18} night={night} />
//               <span className="text-[9px] font-bold tracking-[0.2em]" style={{ color: night ? "#c8892a" : "#9a7040" }}>
//                 {night ? "NIGHT" : "DAY"}
//               </span>
//               {night ? <Moon className="h-3.5 w-3.5" style={{color:"#c8892a"}} /> : <SunMedium className="h-3.5 w-3.5" style={{color:"#9a7040"}} />}
//             </motion.button>
//           </div>

//           <motion.div
//             initial={{ opacity: 0, y: 22 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-6 overflow-hidden rounded-[30px] p-6"
//             style={glassCard(night)}
//           >
//             <div className="absolute left-0 right-0 top-0 h-[2px]" style={{ background:"linear-gradient(90deg, transparent, #c8892a, transparent)" }} />
//             <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
//               <div className="flex items-center gap-5">
//                 <div className="hidden md:block">
//                   <TiltLantern night={night} size={74} />
//                 </div>
//                 <div>
//                   <div className={labelClass(night)}>{night ? "NIGHT SHIFT CREATE" : "MORNING STAFF CREATE"}</div>
//                   <h1 className={`cormorant mt-2 text-4xl font-light leading-none md:text-5xl`} style={{ color: textMain(night) }}>
//                     Add New Staff Member
//                   </h1>
//                   <p className="mt-3 max-w-2xl text-[12.5px] leading-7" style={{ color: textMuted(night) }}>
//                     Fill staff profile details, upload an image, and save with the same premium lantern style used across your dashboard.
//                   </p>
//                   <p className="mt-2 text-[11px] font-bold" style={{ color: textMuted(night) }}>
//                     Session Shop ID: {sessionStatus === "loading" ? "Loading..." : sessionShopId ?? "No shop id"}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex flex-wrap items-center justify-end gap-2">
//                 <PremiumButton
//                   onClick={() => window.history.back()}
//                   icon={<ArrowLeft className="h-4 w-4" />}
//                   variant="ghost"
//                   night={night}
//                 >
//                   Back
//                 </PremiumButton>

//                 <PremiumButton
//                   onClick={handleSaveStaff}
//                   disabled={loading || sessionStatus === "loading"}
//                   icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
//                   night={night}
//                 >
//                   {loading ? "Saving..." : "Save Staff"}
//                 </PremiumButton>
//               </div>
//             </div>
//           </motion.div>

//           <div className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
//             <div className="space-y-5">
//               <SectionCard
//                 title="Personal Information"
//                 subtitle="Basic identity and contact details."
//                 night={night}
//               >
//                 <div className="grid gap-4 md:grid-cols-2">
//                   <PremiumField label="Full Name" night={night} className="md:col-span-2">
//                     <PremiumInput
//                       icon={<User className="h-4 w-4" />}
//                       night={night}
//                       value={form.fullName}
//                       onChange={(e) => update("fullName", e.target.value)}
//                       placeholder="Enter full name"
//                     />
//                   </PremiumField>

//                   <PremiumField label="Email" night={night}>
//                     <PremiumInput
//                       icon={<Mail className="h-4 w-4" />}
//                       type="email"
//                       night={night}
//                       value={form.email}
//                       onChange={(e) => update("email", e.target.value)}
//                       placeholder="staff@company.com"
//                     />
//                   </PremiumField>

//                   <PremiumField label="Phone" night={night}>
//                     <PremiumInput
//                       icon={<Phone className="h-4 w-4" />}
//                       night={night}
//                       value={form.phone}
//                       onChange={(e) => update("phone", e.target.value)}
//                       placeholder="+95 9 xxx xxx xxx"
//                     />
//                   </PremiumField>

//                   <PremiumField label="Staff ID" night={night}>
//                     <PremiumInput
//                       icon={<FileText className="h-4 w-4" />}
//                       readOnly
//                       night={night}
//                       value={String(form.staffId || "")}
//                       placeholder="Auto generated"
//                       style={{ opacity: 0.9 }}
//                     />
//                   </PremiumField>

//                   <PremiumField label="Date of Birth" night={night}>
//                     <PremiumInput
//                       type="date"
//                       icon={<Calendar className="h-4 w-4" />}
//                       night={night}
//                       value={form.dateOfBirth}
//                       onChange={(e) => update("dateOfBirth", e.target.value)}
//                     />
//                   </PremiumField>

//                   <PremiumField label="Password" night={night}>
//                     <PremiumInput
//                       icon={<Key className="h-4 w-4" />}
//                       type="password"
//                       night={night}
//                       value={form.password}
//                       onChange={(e) => update("password", e.target.value)}
//                       placeholder="Enter password"
//                     />
//                   </PremiumField>

//                   <PremiumField label="NRC / ID" night={night}>
//                     <PremiumInput
//                       icon={<FileText className="h-4 w-4" />}
//                       night={night}
//                       value={form.nrc}
//                       onChange={(e) => update("nrc", e.target.value)}
//                       placeholder="Enter NRC or ID"
//                     />
//                   </PremiumField>

//                   <PremiumField label="Address" night={night} className="md:col-span-2">
//                     <PremiumInput
//                       icon={<MapPin className="h-4 w-4" />}
//                       night={night}
//                       value={form.address}
//                       onChange={(e) => update("address", e.target.value)}
//                       placeholder="Enter address"
//                     />
//                   </PremiumField>
//                 </div>
//               </SectionCard>

//               <SectionCard
//                 title="Work Information"
//                 subtitle="Assign role, branch, status, and salary."
//                 night={night}
//               >
//                 <div className="grid gap-4 md:grid-cols-2">
//                   <PremiumField label="Role" night={night} className="md:col-span-2">
//                     <div className="flex flex-wrap gap-2">
//                       {roleOptions.map((r) => {
//                         const Icon = r.icon;
//                         const active = form.role === r.value;

//                         return (
//                           <motion.button
//                             key={r.value}
//                             type="button"
//                             onClick={() => update("role", r.value)}
//                             whileHover={{ scale: 1.03, y: -1 }}
//                             whileTap={{ scale: 0.97 }}
//                             className="flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold"
//                             style={{
//                               background: active
//                                 ? "linear-gradient(135deg,#a07020,#d4a352)"
//                                 : (night ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.72)"),
//                               color: active ? "#140d05" : (night ? "#c9b18a" : "#6e5432"),
//                               border: `1px solid ${active ? "rgba(212,163,82,0.65)" : (night ? "rgba(200,137,42,0.14)" : "rgba(200,160,80,0.20)")}`,
//                             }}
//                           >
//                             <Icon className="h-4 w-4" />
//                             {r.label}
//                           </motion.button>
//                         );
//                       })}
//                     </div>
//                   </PremiumField>

//                   <PremiumField label="Branch" night={night}>
//                     <select
//                       value={form.branch}
//                       onChange={(e) => update("branch", e.target.value)}
//                       className="h-12 w-full rounded-[16px] px-4 text-sm outline-none"
//                       style={inputStyle(night)}
//                     >
//                       {branchOptions.map((b) => (
//                         <option key={b} value={b}>{b}</option>
//                       ))}
//                     </select>
//                   </PremiumField>

//                   <PremiumField label="Status" night={night}>
//                     <div className="flex gap-2">
//                       {statusOptions.map((s) => {
//                         const active = form.status === s.value;
//                         return (
//                           <motion.button
//                             key={s.value}
//                             type="button"
//                             onClick={() => update("status", s.value)}
//                             whileHover={{ scale: 1.03 }}
//                             whileTap={{ scale: 0.97 }}
//                             className="flex-1 rounded-[16px] px-3 py-2.5 text-[11px] font-bold"
//                             style={{
//                               background: active
//                                 ? "linear-gradient(135deg,#a07020,#d4a352)"
//                                 : (night ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.72)"),
//                               color: active ? "#140d05" : (night ? "#c9b18a" : "#6e5432"),
//                               border: `1px solid ${active ? "rgba(212,163,82,0.65)" : (night ? "rgba(200,137,42,0.14)" : "rgba(200,160,80,0.20)")}`,
//                             }}
//                           >
//                             {s.emoji} {s.label}
//                           </motion.button>
//                         );
//                       })}
//                     </div>
//                   </PremiumField>

//                   <PremiumField label="Start Date" night={night}>
//                     <PremiumInput
//                       type="date"
//                       icon={<Calendar className="h-4 w-4" />}
//                       night={night}
//                       value={form.startDate}
//                       onChange={(e) => update("startDate", e.target.value)}
//                     />
//                   </PremiumField>

//                   <PremiumField label="Base Salary" night={night}>
//                     <PremiumInput
//                       icon={<Wallet className="h-4 w-4" />}
//                       night={night}
//                       value={form.salary}
//                       onChange={(e) => update("salary", e.target.value)}
//                       placeholder="Enter salary"
//                     />
//                   </PremiumField>
//                 </div>
//               </SectionCard>

//               <SectionCard
//                 title="Emergency & Notes"
//                 subtitle="Emergency contact and extra notes."
//                 night={night}
//               >
//                 <div className="grid gap-4 md:grid-cols-2">
//                   <PremiumField label="Emergency Contact Name" night={night}>
//                     <PremiumInput
//                       icon={<User className="h-4 w-4" />}
//                       night={night}
//                       value={form.emergencyContact}
//                       onChange={(e) => update("emergencyContact", e.target.value)}
//                       placeholder="Contact person"
//                     />
//                   </PremiumField>

//                   <PremiumField label="Emergency Phone" night={night}>
//                     <PremiumInput
//                       icon={<Phone className="h-4 w-4" />}
//                       night={night}
//                       value={form.emergencyPhone}
//                       onChange={(e) => update("emergencyPhone", e.target.value)}
//                       placeholder="Phone number"
//                     />
//                   </PremiumField>

//                   <PremiumField label="Notes" night={night} className="md:col-span-2">
//                     <textarea
//                       value={form.note}
//                       onChange={(e) => update("note", e.target.value)}
//                       placeholder="Additional notes..."
//                       className="min-h-[110px] w-full rounded-[16px] px-4 py-3 text-sm outline-none resize-none"
//                       style={inputStyle(night)}
//                     />
//                   </PremiumField>
//                 </div>
//               </SectionCard>
//             </div>

//             <motion.div
//               initial={{ opacity: 0, x: 26 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.45 }}
//             >
//               <div className="sticky top-5 overflow-hidden rounded-[28px]" style={glassCard(night)}>
//                 <div className="border-b px-5 py-4" style={{borderColor:night ? "rgba(200,137,42,0.10)" : "rgba(200,160,80,0.15)"}}>
//                   <div className="flex items-center gap-3">
//                     <div className="hidden sm:block"><PremiumLantern size={28} night={night} /></div>
//                     <div>
//                       <div className={labelClass(night)}>Live Preview</div>
//                       <div className="cormorant text-[28px] leading-none font-light" style={{color:textMain(night)}}>
//                         Staff Summary
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-4 p-5">
//                   <motion.div
//                     layout
//                     className="overflow-hidden rounded-[24px] p-5"
//                     style={{
//                       background: night
//                         ? "linear-gradient(135deg, rgba(38,22,6,0.95), rgba(90,55,15,0.92), rgba(165,112,32,0.72))"
//                         : "linear-gradient(135deg, rgba(245,237,216,0.95), rgba(232,217,184,0.92), rgba(212,163,82,0.85))",
//                       border: `1px solid ${night ? "rgba(212,163,82,0.25)" : "rgba(200,160,80,0.25)"}`,
//                     }}
//                   >
//                     <div className="mb-4 flex items-center justify-between">
//                       <div
//                         className="rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.18em]"
//                         style={{
//                           background: night ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.55)",
//                           color: night ? "#fef3c7" : "#6e5432"
//                         }}
//                       >
//                         {selectedRole.label.toUpperCase()}
//                       </div>
//                       <Sparkles className="h-4 w-4" style={{color:night ? "#fde68a" : "#8a6e48"}} />
//                     </div>

//                     <div className="mb-4 flex items-center gap-4">
//                       <div className="relative">
//                         {imagePreview ? (
//                           <img
//                             src={imagePreview}
//                             alt="preview"
//                             className="h-20 w-20 rounded-full object-cover"
//                             style={{border:"2px solid rgba(255,255,255,0.45)"}}
//                           />
//                         ) : (
//                           <div
//                             className="flex h-20 w-20 items-center justify-center rounded-full text-xl font-bold"
//                             style={{
//                               background: "rgba(255,255,255,0.18)",
//                               border: "2px solid rgba(255,255,255,0.32)",
//                               color: night ? "#fff7e5" : "#5c4526"
//                             }}
//                           >
//                             {form.fullName
//                               ? form.fullName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
//                               : "NS"}
//                           </div>
//                         )}

//                         <div
//                           className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2"
//                           style={{
//                             background:
//                               form.status === "active"
//                                 ? "#10b981"
//                                 : form.status === "on_leave"
//                                 ? "#f59e0b"
//                                 : "#ef4444",
//                             borderColor: night ? "#2a1b08" : "#fff",
//                           }}
//                         />
//                       </div>

//                       <div className="min-w-0">
//                         <div className="cormorant truncate text-[30px] leading-none font-light" style={{color:night ? "#fff7e5" : "#2a1e0e"}}>
//                           {form.fullName || "New Staff"}
//                         </div>
//                         <div className="mt-1 truncate text-[12px] font-medium" style={{color:night ? "rgba(255,247,229,0.78)" : "#6e5432"}}>
//                           {form.email || "staff@company.com"}
//                         </div>
//                         <div className="mt-2 flex flex-wrap gap-2">
//                           <MiniPreviewBadge text={`ID ${form.staffId || "—"}`} night={night} />
//                           <MiniPreviewBadge text={form.branch} night={night} />
//                         </div>
//                       </div>
//                     </div>
//                   </motion.div>

//                   <div className="grid gap-2">
//                     {[
//                       { icon: FileText, label: "Staff ID", value: String(form.staffId || "—") },
//                       { icon: Store, label: "Shop ID", value: form.shopId ? String(form.shopId) : "Missing from session" },
//                       { icon: Calendar, label: "Birthday", value: form.dateOfBirth || "Not set" },
//                       { icon: Wallet, label: "Salary", value: form.salary || "Not set" },
//                       { icon: Phone, label: "Phone", value: form.phone || "Not set" },
//                       { icon: Mail, label: "Email", value: form.email || "Not set" },
//                     ].map((item, i) => (
//                       <motion.div
//                         key={item.label}
//                         layout
//                         initial={{ opacity: 0, x: 8 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: i * 0.04 }}
//                         className="rounded-[16px] p-3"
//                         style={inputStyle(night)}
//                       >
//                         <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em]" style={{color:textMuted(night)}}>
//                           <item.icon className="h-3.5 w-3.5" /> {item.label}
//                         </div>
//                         <div className="text-[13px] font-bold" style={{color:textMain(night)}}>
//                           {item.value}
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>

//                   <motion.label
//                     htmlFor="staff-image-upload"
//                     whileHover={{ scale: 1.01 }}
//                     whileTap={{ scale: 0.99 }}
//                     className="block cursor-pointer rounded-[20px] p-4 text-center"
//                     style={{
//                       ...inputStyle(night),
//                       borderStyle: "dashed",
//                     }}
//                   >
//                     <div className="mb-2 flex justify-center">
//                       <ImagePlus className="h-7 w-7" style={{color:night?"#c8892a":"#9a7040"}} />
//                     </div>
//                     <div className="text-[12px] font-bold" style={{color:textMain(night)}}>Upload Staff Photo</div>
//                     <div className="mt-1 text-[11px]" style={{color:textMuted(night)}}>Click to browse image</div>
//                     <input
//                       id="staff-image-upload"
//                       type="file"
//                       accept="image/*"
//                       className="hidden"
//                       onChange={handleImageChange}
//                     />
//                   </motion.label>

//                   <div className="grid gap-2 pt-1">
//                     <PremiumButton
//                       onClick={() => window.history.back()}
//                       icon={<ArrowLeft className="h-4 w-4" />}
//                       variant="ghost"
//                       night={night}
//                     >
//                       Back
//                     </PremiumButton>

//                     <PremiumButton
//                       onClick={handleSaveStaff}
//                       disabled={loading || sessionStatus === "loading"}
//                       icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
//                       night={night}
//                     >
//                       {loading ? "Saving..." : "Save Staff"}
//                     </PremiumButton>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// /* ─── Small helpers ─────────────────────────────────────── */
// function SectionCard({
//   title,
//   subtitle,
//   children,
//   night,
// }:{
//   title:string;
//   subtitle:string;
//   children:React.ReactNode;
//   night:boolean;
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 18 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="overflow-hidden rounded-[26px]"
//       style={glassCard(night)}
//     >
//       <div className="h-[2px] w-full" style={{ background:"linear-gradient(90deg, transparent, #c8892a, transparent)" }} />
//       <div className="px-5 pb-5 pt-4">
//         <div className={labelClass(night)}>{title}</div>
//         <div className="cormorant mt-1 text-[30px] leading-none font-light" style={{color:textMain(night)}}>{title}</div>
//         <div className="mt-2 text-[12px]" style={{color:textMuted(night)}}>{subtitle}</div>
//         <div className="mt-4">{children}</div>
//       </div>
//     </motion.div>
//   );
// }

// function MiniPreviewBadge({ text, night }: { text:string; night:boolean }) {
//   return (
//     <span
//       className="rounded-full px-2.5 py-1 text-[10px] font-bold"
//       style={{
//         background: night ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.55)",
//         color: night ? "#fff7e5" : "#6e5432",
//         border: `1px solid ${night ? "rgba(255,255,255,0.12)" : "rgba(200,160,80,0.25)"}`,
//       }}
//     >
//       {text}
//     </span>
//   );
// }



























"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Crown,
  Key,
  Loader2,
  Save,
  Shield,
  Store,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Wallet,
  FileText,
  ImagePlus,
  Camera,
} from "lucide-react";
import { getLimitErrorMessage } from "@/lib/api-limit-error";

/* ─── Types ─────────────────────────────────────────────── */
type StaffForm = {
  fullName: string;
  email: string;
  phone: string;
  nrc: string;
  staffId: number | "";
  password: string;
  dateOfBirth: string;
  shopId: number | null;
  role: string;
  branch: string;
  status: string;
  startDate: string;
  salary: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  note: string;
};

type ApiResponse = {
  id?: number;
  fullName?: string;
  email?: string;
  message?: string;
  imageUrl?: string;
};

/* ─── Constants ─────────────────────────────────────────── */
const roleOptions = [
  { value: "admin", label: "Admin", icon: Crown, color: "#d97706" },
  { value: "manager", label: "Manager", icon: Shield, color: "#c8892a" },
  { value: "cashier", label: "Cashier", icon: Key, color: "#eab308" },
  { value: "stock", label: "Stock", icon: Store, color: "#b45309" },
];

const branchOptions = ["Main Branch", "Branch A", "Branch B", "Online Shop"];

const statusOptions = [
  { value: "active", label: "Active", emoji: "🟢", color: "#10b981" },
  { value: "on_leave", label: "On Leave", emoji: "🟡", color: "#f59e0b" },
  { value: "inactive", label: "Inactive", emoji: "🔴", color: "#ef4444" },
];

const generateStaffId = () => Math.floor(100000 + Math.random() * 900000);

const createInitialForm = (shopId: number | null = null): StaffForm => ({
  fullName: "",
  email: "",
  phone: "",
  nrc: "",
  staffId: generateStaffId(),
  password: "",
  dateOfBirth: "",
  shopId,
  role: "cashier",
  branch: "Main Branch",
  status: "active",
  startDate: "",
  salary: "",
  address: "",
  emergencyContact: "",
  emergencyPhone: "",
  note: "",
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const STORAGE_KEY = "add-staff-lantern-theme-v1";

/* ─── Theme / Typography ───────────────────────────────── */
function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;700&display=swap');
      * { font-family: 'DM Sans', sans-serif; }
      .serif { font-family: 'DM Serif Display', serif !important; }
      ::placeholder { color: rgba(122,85,32,0.75); opacity: 1; }
    `}</style>
  );
}

function glassCard(night:boolean, extra?:React.CSSProperties): React.CSSProperties {
  return {
    background: night ? "rgba(14,10,6,0.84)" : "rgba(255,255,255,0.90)",
    border: `1px solid ${night ? "rgba(200,137,42,0.18)" : "rgba(216,203,184,0.55)"}`,
    boxShadow: night
      ? "0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(200,137,42,0.07)"
      : "0 24px 64px rgba(26,21,16,0.10)",
    backdropFilter: "blur(24px)",
    ...extra,
  };
}

function premiumInputStyle(night:boolean): React.CSSProperties {
  return {
    background: night ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.72)",
    border: `1.5px solid ${night ? "rgba(46,32,16,1)" : "rgba(216,203,184,1)"}`,
    color: night ? "#e8dcc8" : "#1a1510",
    boxShadow: "none",
  };
}

function sectionTitle(night:boolean) {
  return night ? "text-[#7a5520]" : "text-[#8a7a65]";
}

/* ─── Lantern Components ───────────────────────────────── */
function LanternMark({ size = 48, glow = false }: { size?: number; glow?: boolean }) {
  const h = size * 1.5;
  const isNight = glow;

  return (
    <svg width={size} height={h} viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="addStaffLanternCoreNight" cx="50%" cy="48%" r="50%">
          <stop offset="0%" stopColor="#fff7d6" stopOpacity="0.95" />
          <stop offset="28%" stopColor="#fbbf24" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="addStaffLanternBodyDay" x1="6" y1="11" x2="26" y2="37" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fffaf1" />
          <stop offset="45%" stopColor="#f5e7cf" />
          <stop offset="100%" stopColor="#ecd5ae" />
        </linearGradient>

        <linearGradient id="addStaffLanternMetalDay" x1="8" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c58a3c" />
          <stop offset="50%" stopColor="#a96b28" />
          <stop offset="100%" stopColor="#8a551d" />
        </linearGradient>

        <radialGradient id="addStaffLanternGlassDay" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#fffdf7" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#f6ead4" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#e8d0a4" stopOpacity="0.1" />
        </radialGradient>
      </defs>

      <line x1="16" y1="0" x2="16" y2="6" stroke={isNight ? "#d6ae67" : "#9d6a2b"} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="8" y="6" width="16" height="5" rx="2" fill={isNight ? "#b07840" : "url(#addStaffLanternMetalDay)"} stroke={isNight ? "#d4a060" : "#7b4a18"} strokeWidth="0.8" />
      <rect x="6" y="11" width="20" height="26" rx="3" fill={isNight ? "#0e0908" : "url(#addStaffLanternBodyDay)"} stroke={isNight ? "#9d6220" : "#a66b27"} strokeWidth="1" />

      {isNight ? (
        <rect x="6" y="11" width="20" height="26" rx="3" fill="url(#addStaffLanternCoreNight)" />
      ) : (
        <rect x="6" y="11" width="20" height="26" rx="3" fill="url(#addStaffLanternGlassDay)" />
      )}

      {[11, 16, 21].map((x) => (
        <line
          key={x}
          x1={x}
          y1="11"
          x2={x}
          y2="37"
          stroke={isNight ? "#6b3e10" : "#b47b34"}
          strokeWidth="1"
          opacity="0.95"
        />
      ))}

      {isNight && (
        <g>
          <motion.ellipse
            cx="16"
            cy="26"
            rx="4"
            ry="6"
            fill="#f59e0b"
            opacity="0.68"
            animate={{ ry: [6, 7.1, 5.2, 6.7, 6], cx: [16, 15.5, 16.4, 15.8, 16] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.ellipse
            cx="16"
            cy="27"
            rx="2.5"
            ry="4.2"
            fill="#fde68a"
            animate={{ ry: [4.2, 5, 3.6, 4.6, 4.2], cx: [16, 16.3, 15.7, 16.1, 16] }}
            transition={{ duration: 0.95, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.ellipse
            cx="16"
            cy="27.5"
            rx="1.3"
            ry="2.2"
            fill="white"
            opacity="0.85"
            animate={{ ry: [2.2, 2.7, 1.9, 2.4, 2.2] }}
            transition={{ duration: 0.75, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>
      )}

      {!isNight && (
        <motion.g
          animate={{ opacity: [0.78, 1, 0.82], scale: [0.98, 1.02, 0.99] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ellipse cx="16" cy="25" rx="5.2" ry="7.4" fill="#fff4cf" opacity="0.72" />
          <ellipse cx="16" cy="25.5" rx="3.2" ry="5" fill="#ffe29a" opacity="0.56" />
          <ellipse cx="16" cy="26" rx="1.6" ry="2.8" fill="#fffdf7" opacity="0.9" />
        </motion.g>
      )}

      <rect x="8" y="37" width="16" height="5" rx="2" fill={isNight ? "#b07840" : "url(#addStaffLanternMetalDay)"} stroke={isNight ? "#d4a060" : "#7b4a18"} strokeWidth="0.8" />
      <line x1="16" y1="42" x2="16" y2="47" stroke={isNight ? "#d4804a" : "#8f5b24"} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="47" r="1.5" fill={isNight ? "#d4804a" : "#8f5b24"} />
    </svg>
  );
}

function LanternToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ y: -2, scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      className="relative flex flex-col items-center focus:outline-none"
      style={{ width: 58 }}
      aria-label={dark ? "Switch to day mode" : "Switch to night mode"}
    >
      <AnimatePresence>
        {dark ? (
          <motion.div
            key="night-glow"
            initial={{ opacity: 0, scale: 0.35 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.35 }}
            transition={{ duration: 0.45 }}
            className="pointer-events-none absolute"
            style={{
              width: 76,
              height: 76,
              top: -6,
              left: "50%",
              transform: "translateX(-50%)",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, rgba(251,191,36,0.52) 0%, rgba(245,158,11,0.18) 52%, transparent 76%)",
              filter: "blur(9px)",
            }}
          />
        ) : (
          <motion.div
            key="day-halo"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none absolute"
            style={{
              width: 70,
              height: 70,
              top: -4,
              left: "50%",
              transform: "translateX(-50%)",
              borderRadius: "50%",
              background:
                "radial-gradient(ellipse at center, rgba(255,233,180,0.55) 0%, rgba(245,190,95,0.18) 55%, transparent 78%)",
              filter: "blur(10px)",
            }}
          />
        )}
      </AnimatePresence>

      <LanternMark size={34} glow={dark} />

      <span
        style={{
          marginTop: 5,
          fontSize: 7,
          fontWeight: 700,
          letterSpacing: "0.2em",
          color: dark ? "#c8892a" : "#9a6c2a",
          transition: "color 0.4s",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {dark ? "NIGHT" : "DAY"}
      </span>
    </motion.button>
  );
}

/* ─── Particles ─────────────────────────────────────────── */
function NightParticles() {
  const particles = React.useMemo(
    () =>
      Array.from({ length: 34 }).map((_, i) => ({
        id: i,
        x: `${(i * 31 + 7) % 100}%`,
        y: `${(i * 47 + 13) % 100}%`,
        size: 1.5 + (i % 3) * 1,
        dur: 2.5 + (i % 4) * 0.7,
        delay: (i * 0.21) % 4,
        color: ["#e0e7ff", "#fef3c7", "#ddd6fe", "#ffffff", "#fde68a"][i % 5],
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size, background: p.color }}
          animate={{ opacity: [0.08, 0.9, 0.08], scale: [0.7, 1.4, 0.7] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function DayParticles() {
  const motes = React.useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        x: `${(i * 23 + 8) % 96}%`,
        y: `${(i * 41 + 11) % 90}%`,
        size: 60 + (i % 4) * 30,
        dur: 6 + (i % 3) * 2,
        delay: i * 0.5,
        color: [
          "rgba(200,137,42,0.06)",
          "rgba(245,158,11,0.05)",
          "rgba(251,191,36,0.04)",
          "rgba(210,160,60,0.06)",
        ][i % 4],
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {motes.map((m) => (
        <motion.div
          key={m.id}
          className="absolute rounded-full"
          style={{
            left: m.x,
            top: m.y,
            width: m.size,
            height: m.size,
            background: m.color,
            filter: "blur(24px)",
          }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: m.dur, repeat: Infinity, delay: m.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ─── Form helpers ──────────────────────────────────────── */
function PremiumField({
  label,
  children,
  night,
  className = "",
}:{
  label:string;
  children:React.ReactNode;
  night:boolean;
  className?:string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className={`text-[10px] uppercase tracking-[0.22em] font-bold ${sectionTitle(night)}`}>
        {label}
      </label>
      {children}
    </div>
  );
}

function PremiumInput({
  icon,
  night,
  className = "",
  style,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  night:boolean;
}) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{color:night?"#7a5520":"#8a7a65"}}>
          {icon}
        </span>
      )}
      <input
        {...props}
        className={`h-12 w-full rounded-[16px] pr-4 text-sm outline-none ${icon ? "pl-10" : "px-4"} ${className}`}
        style={{ ...premiumInputStyle(night), ...(style || {}) }}
      />
    </div>
  );
}

function PremiumButton({
  children,
  onClick,
  disabled,
  icon,
  variant = "default",
  night,
}:{
  children:React.ReactNode;
  onClick?:()=>void;
  disabled?:boolean;
  icon?:React.ReactNode;
  variant?:"default"|"ghost";
  night:boolean;
}) {
  const styles =
    variant === "default"
      ? {
          background: "linear-gradient(135deg,#a07020,#d4a352)",
          color: "#140d05",
          border: "1px solid rgba(212,163,82,0.65)",
          boxShadow: "0 12px 28px rgba(200,137,42,0.18)",
        }
      : {
          ...premiumInputStyle(night),
          color: night ? "#bca98f" : "#7d6f60",
          border: `1px solid ${night ? "rgba(255,255,255,0.05)" : "rgba(216,203,184,0.7)"}`,
        };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className="flex h-11 items-center justify-center gap-2 rounded-full px-4 text-[12px] font-bold disabled:opacity-60"
      style={styles}
    >
      {icon}
      {children}
    </motion.button>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  night,
}:{
  title:string;
  subtitle:string;
  children:React.ReactNode;
  night:boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[26px]"
      style={glassCard(night)}
    >
      <div className="h-[2px] w-full" style={{ background:"linear-gradient(90deg, transparent, #c8892a, transparent)" }} />
      <div className="px-5 pb-5 pt-4">
        <div className={`text-[10px] uppercase tracking-[0.22em] font-bold ${sectionTitle(night)}`}>{title}</div>
        <div className={`serif mt-1 text-[30px] leading-none ${night ? "text-[#e8dcc8]" : "text-[#1a1510]"}`}>{title}</div>
        <div className="mt-2 text-[12px]" style={{color:night?"#6d5d4b":"#8e7f6e"}}>{subtitle}</div>
        <div className="mt-4">{children}</div>
      </div>
    </motion.div>
  );
}

function MiniPreviewBadge({ text, night }: { text:string; night:boolean }) {
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[10px] font-bold"
      style={{
        background: night ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.55)",
        color: night ? "#fff7e5" : "#6e5432",
        border: `1px solid ${night ? "rgba(255,255,255,0.12)" : "rgba(216,203,184,0.7)"}`,
      }}
    >
      {text}
    </span>
  );
}

/* ─── Main Component ────────────────────────────────────── */
export default function CreateStaffPage() {
  const { data: session, status: sessionStatus } = useSession();

  const sessionShopId =
    typeof (session?.user as any)?.shopId === "number"
      ? (session?.user as any)?.shopId
      : null;

  const [form, setForm] = React.useState<StaffForm>(() => createInitialForm(sessionShopId));
  const [imagePreview, setImagePreview] = React.useState<string>("");
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [night, setNight] = React.useState(true);

  React.useEffect(() => {
    if (sessionShopId != null) {
      setForm((prev) => ({ ...prev, shopId: sessionShopId }));
    }
  }, [sessionShopId]);

  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setNight(saved === "night");
  }, []);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, night ? "night" : "day");
  }, [night]);

  React.useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const update = (key: keyof StaffForm, value: string | number | null) => {
    setForm((prev) => ({ ...prev, [key]: value as never }));
  };

  const selectedRole = roleOptions.find((r) => r.value === form.role) ?? roleOptions[2];
  const selectedStatus = statusOptions.find((s) => s.value === form.status) ?? statusOptions[0];

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setForm(createInitialForm(sessionShopId));
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
  };

  const validateForm = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.phone.trim()) return "Phone is required.";
    if (!form.staffId) return "Staff ID is required.";
    if (!form.password.trim()) return "Password is required.";
    if (!form.dateOfBirth.trim()) return "Date of birth is required.";
    if (!form.role.trim()) return "Role is required.";
    if (!form.branch.trim()) return "Branch is required.";
    if (!form.status.trim()) return "Status is required.";
    if (!form.shopId) return "Shop ID is missing from session.";
    return "";
  };

  const handleSaveStaff = async () => {
    const err = validateForm();
    if (err) {
      setErrorMessage(err);
      setSuccessMessage("");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const accessToken = (session as any)?.accessToken;
      if (!accessToken) {
        throw new Error("Login session expired. Please sign in again.");
      }

      const payload = {
        ...form,
        shopId: sessionShopId ?? form.shopId,
      };

      const fd = new FormData();
      fd.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (imageFile) fd.append("file", imageFile);

      const res = await fetch(`${API_BASE_URL}/api/staff/with-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: fd,
      });

      if (!res.ok) {
        let msg = "Failed to save staff.";
        try {
          const d = await res.json();
          msg = d.message || JSON.stringify(d);
        } catch {
          msg = await res.text();
        }
        throw new Error(msg);
      }

      const result: ApiResponse = await res.json();
      setSuccessMessage(result.message || `${result.fullName || form.fullName} added successfully.`);
      resetForm();

      setTimeout(() => {
        window.location.href = "/admin/staff";
      }, 800);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setErrorMessage(getLimitErrorMessage(msg) || msg);
    } finally {
      setLoading(false);
    }
  };

  const bg = night
    ? "linear-gradient(160deg, #05060d 0%, #0d0b18 42%, #120a02 100%)"
    : "linear-gradient(160deg, #f6f1e9 0%, #fbf7f1 50%, #f0ebe3 100%)";

  return (
    <>
      <FontImport />
      <div
        className="relative min-h-screen overflow-hidden transition-all duration-700"
        style={{ background: bg }}
      >
        <AnimatePresence mode="wait">
          {night ? <NightParticles key="night" /> : <DayParticles key="day" />}
        </AnimatePresence>

        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute right-[-120px] top-[-100px] h-[320px] w-[320px] rounded-full blur-3xl"
            style={{
              background: night ? "rgba(251,191,36,0.10)" : "rgba(245,158,11,0.08)",
            }}
          />
          <div
            className="absolute bottom-[-120px] left-[-80px] h-[280px] w-[280px] rounded-full blur-3xl"
            style={{
              background: night ? "rgba(217,119,6,0.10)" : "rgba(200,137,42,0.07)",
            }}
          />
        </div>

        <AnimatePresence>
          {errorMessage && (
            <motion.div
              key="err"
              initial={{ opacity: 0, y: -14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.96 }}
              className="fixed left-1/2 top-5 z-[80] -translate-x-1/2 rounded-full px-5 py-2.5 text-[13px] font-bold"
              style={{
                background: night ? "rgba(60,10,10,0.6)" : "#fff1f2",
                border: night ? "1px solid rgba(200,50,50,0.3)" : "1px solid #fecdd3",
                color: night ? "#f87171" : "#dc2626",
                backdropFilter: "blur(14px)",
              }}
            >
              {errorMessage}
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              key="ok"
              initial={{ opacity: 0, y: -14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.96 }}
              className="fixed left-1/2 top-5 z-[80] -translate-x-1/2 rounded-full px-5 py-2.5 text-[13px] font-bold"
              style={{
                background: night ? "rgba(10,40,22,0.60)" : "#ecfdf5",
                border: night ? "1px solid rgba(16,185,129,0.25)" : "1px solid #bbf7d0",
                color: night ? "#6ee7b7" : "#059669",
                backdropFilter: "blur(14px)",
              }}
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 mx-auto max-w-[1450px] px-4 py-6 md:px-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full" style={{ background: "#c8892a" }} />
              <span className={`text-[10px] uppercase tracking-[0.24em] font-bold ${sectionTitle(night)}`}>
                CUTEPOS · STAFF CREATE
              </span>
            </div>

            <div className="flex items-center">
              <LanternToggle dark={night} onToggle={() => setNight((p) => !p)} />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 overflow-hidden rounded-[30px] p-6"
            style={glassCard(night)}
          >
            <div className="absolute left-0 right-0 top-0 h-[2px]" style={{ background:"linear-gradient(90deg, transparent, #c8892a, transparent)" }} />
            <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="flex items-center gap-5">
                <div className="hidden md:block">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <LanternMark size={76} glow={night} />
                  </motion.div>
                </div>
                <div>
                  <div className={`text-[10px] uppercase tracking-[0.24em] font-bold ${sectionTitle(night)}`}>
                    {night ? "NIGHT SHIFT CREATE" : "GOOD MORNING"}
                  </div>
                  <h1 className={`serif mt-2 text-4xl leading-none md:text-5xl ${night ? "text-[#e8dcc8]" : "text-[#1a1510]"}`}>
                    Add New Staff Member
                  </h1>
                  <p className="mt-3 max-w-2xl text-[12.5px] leading-7" style={{color:night?"#6d5d4b":"#8e7f6e"}}>
                    Create a new staff profile with the same merged lantern design language used in the staff dashboard.
                  </p>
                  <p className="mt-2 text-[11px] font-bold" style={{ color: night ? "#8a7a65" : "#8e7f6e" }}>
                    Session Shop ID: {sessionStatus === "loading" ? "Loading..." : sessionShopId ?? "No shop id"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <PremiumButton
                  onClick={() => window.history.back()}
                  icon={<ArrowLeft className="h-4 w-4" />}
                  variant="ghost"
                  night={night}
                >
                  Back
                </PremiumButton>

                <PremiumButton
                  onClick={handleSaveStaff}
                  disabled={loading || sessionStatus === "loading"}
                  icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  night={night}
                >
                  {loading ? "Saving..." : "Save Staff"}
                </PremiumButton>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-5">
              <SectionCard
                title="Personal Information"
                subtitle="Basic identity and contact details."
                night={night}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <PremiumField label="Full Name" night={night} className="md:col-span-2">
                    <PremiumInput
                      icon={<User className="h-4 w-4" />}
                      night={night}
                      value={form.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                      placeholder="Enter full name"
                    />
                  </PremiumField>

                  <PremiumField label="Email" night={night}>
                    <PremiumInput
                      icon={<Mail className="h-4 w-4" />}
                      type="email"
                      night={night}
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="staff@company.com"
                    />
                  </PremiumField>

                  <PremiumField label="Phone" night={night}>
                    <PremiumInput
                      icon={<Phone className="h-4 w-4" />}
                      night={night}
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="+95 9 xxx xxx xxx"
                    />
                  </PremiumField>

                  <PremiumField label="Staff ID" night={night}>
                    <PremiumInput
                      icon={<FileText className="h-4 w-4" />}
                      readOnly
                      night={night}
                      value={String(form.staffId || "")}
                      placeholder="Auto generated"
                      style={{ opacity: 0.9 }}
                    />
                  </PremiumField>

                  <PremiumField label="Date of Birth" night={night}>
                    <PremiumInput
                      type="date"
                      icon={<Calendar className="h-4 w-4" />}
                      night={night}
                      value={form.dateOfBirth}
                      onChange={(e) => update("dateOfBirth", e.target.value)}
                    />
                  </PremiumField>

                  <PremiumField label="Password" night={night}>
                    <PremiumInput
                      icon={<Key className="h-4 w-4" />}
                      type="password"
                      night={night}
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      placeholder="Enter password"
                    />
                  </PremiumField>

                  <PremiumField label="NRC / ID" night={night}>
                    <PremiumInput
                      icon={<FileText className="h-4 w-4" />}
                      night={night}
                      value={form.nrc}
                      onChange={(e) => update("nrc", e.target.value)}
                      placeholder="Enter NRC or ID"
                    />
                  </PremiumField>

                  <PremiumField label="Address" night={night} className="md:col-span-2">
                    <PremiumInput
                      icon={<MapPin className="h-4 w-4" />}
                      night={night}
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      placeholder="Enter address"
                    />
                  </PremiumField>
                </div>
              </SectionCard>

              <SectionCard
                title="Work Information"
                subtitle="Assign role, branch, status, and salary."
                night={night}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <PremiumField label="Role" night={night} className="md:col-span-2">
                    <div className="flex flex-wrap gap-2">
                      {roleOptions.map((r) => {
                        const Icon = r.icon;
                        const active = form.role === r.value;

                        return (
                          <motion.button
                            key={r.value}
                            type="button"
                            onClick={() => update("role", r.value)}
                            whileHover={{ scale: 1.03, y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold"
                            style={{
                              background: active
                                ? "linear-gradient(135deg,#a07020,#d4a352)"
                                : (night ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.72)"),
                              color: active ? "#140d05" : (night ? "#bca98f" : "#7d6f60"),
                              border: `1px solid ${active ? "rgba(212,163,82,0.65)" : (night ? "rgba(255,255,255,0.05)" : "rgba(216,203,184,0.7)")}`,
                            }}
                          >
                            <Icon className="h-4 w-4" />
                            {r.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </PremiumField>

                  <PremiumField label="Branch" night={night}>
                    <select
                      value={form.branch}
                      onChange={(e) => update("branch", e.target.value)}
                      className="h-12 w-full rounded-[16px] px-4 text-sm outline-none"
                      style={premiumInputStyle(night)}
                    >
                      {branchOptions.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </PremiumField>

                  <PremiumField label="Status" night={night}>
                    <div className="flex gap-2">
                      {statusOptions.map((s) => {
                        const active = form.status === s.value;
                        return (
                          <motion.button
                            key={s.value}
                            type="button"
                            onClick={() => update("status", s.value)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex-1 rounded-[16px] px-3 py-2.5 text-[11px] font-bold"
                            style={{
                              background: active
                                ? "linear-gradient(135deg,#a07020,#d4a352)"
                                : (night ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.72)"),
                              color: active ? "#140d05" : (night ? "#bca98f" : "#7d6f60"),
                              border: `1px solid ${active ? "rgba(212,163,82,0.65)" : (night ? "rgba(255,255,255,0.05)" : "rgba(216,203,184,0.7)")}`,
                            }}
                          >
                            {s.emoji} {s.label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </PremiumField>

                  <PremiumField label="Start Date" night={night}>
                    <PremiumInput
                      type="date"
                      icon={<Calendar className="h-4 w-4" />}
                      night={night}
                      value={form.startDate}
                      onChange={(e) => update("startDate", e.target.value)}
                    />
                  </PremiumField>

                  <PremiumField label="Base Salary" night={night}>
                    <PremiumInput
                      icon={<Wallet className="h-4 w-4" />}
                      night={night}
                      value={form.salary}
                      onChange={(e) => update("salary", e.target.value)}
                      placeholder="Enter salary"
                    />
                  </PremiumField>
                </div>
              </SectionCard>

              <SectionCard
                title="Emergency & Notes"
                subtitle="Emergency contact and extra notes."
                night={night}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <PremiumField label="Emergency Contact Name" night={night}>
                    <PremiumInput
                      icon={<User className="h-4 w-4" />}
                      night={night}
                      value={form.emergencyContact}
                      onChange={(e) => update("emergencyContact", e.target.value)}
                      placeholder="Contact person"
                    />
                  </PremiumField>

                  <PremiumField label="Emergency Phone" night={night}>
                    <PremiumInput
                      icon={<Phone className="h-4 w-4" />}
                      night={night}
                      value={form.emergencyPhone}
                      onChange={(e) => update("emergencyPhone", e.target.value)}
                      placeholder="Phone number"
                    />
                  </PremiumField>

                  <PremiumField label="Notes" night={night} className="md:col-span-2">
                    <textarea
                      value={form.note}
                      onChange={(e) => update("note", e.target.value)}
                      placeholder="Additional notes..."
                      className="min-h-[110px] w-full rounded-[16px] px-4 py-3 text-sm outline-none resize-none"
                      style={premiumInputStyle(night)}
                    />
                  </PremiumField>
                </div>
              </SectionCard>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 26 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className="sticky top-5 overflow-hidden rounded-[28px]" style={glassCard(night)}>
                <div className="border-b px-5 py-4" style={{borderColor:night ? "rgba(255,255,255,0.05)" : "rgba(216,203,184,0.7)"}}>
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block"><LanternMark size={28} glow={night} /></div>
                    <div>
                      <div className={`text-[10px] uppercase tracking-[0.22em] font-bold ${sectionTitle(night)}`}>Live Preview</div>
                      <div className={`serif text-[28px] leading-none ${night ? "text-[#e8dcc8]" : "text-[#1a1510]"}`}>
                        Staff Summary
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <motion.div
                    layout
                    className="overflow-hidden rounded-[24px] p-5"
                    style={{
                      background: night
                        ? "linear-gradient(135deg, rgba(38,22,6,0.95), rgba(90,55,15,0.92), rgba(165,112,32,0.72))"
                        : "linear-gradient(135deg, rgba(245,237,216,0.95), rgba(232,217,184,0.92), rgba(212,163,82,0.85))",
                      border: `1px solid ${night ? "rgba(212,163,82,0.25)" : "rgba(216,203,184,0.7)"}`,
                    }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div
                        className="rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.18em]"
                        style={{
                          background: night ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.55)",
                          color: night ? "#fef3c7" : "#6e5432"
                        }}
                      >
                        {selectedRole.label.toUpperCase()}
                      </div>
                      <div
                        className="rounded-full px-3 py-1 text-[10px] font-bold"
                        style={{
                          background: `${selectedStatus.color}22`,
                          color: night ? "#fff7e5" : "#6e5432",
                          border: `1px solid ${selectedStatus.color}66`,
                        }}
                      >
                        {selectedStatus.label}
                      </div>
                    </div>

                    <div className="mb-4 flex items-center gap-4">
                      <div className="relative">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="preview"
                            className="h-20 w-20 rounded-full object-cover"
                            style={{border:"2px solid rgba(255,255,255,0.45)"}}
                          />
                        ) : (
                          <div
                            className="flex h-20 w-20 items-center justify-center rounded-full text-xl font-bold"
                            style={{
                              background: "rgba(255,255,255,0.18)",
                              border: "2px solid rgba(255,255,255,0.32)",
                              color: night ? "#fff7e5" : "#5c4526"
                            }}
                          >
                            {form.fullName
                              ? form.fullName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
                              : "NS"}
                          </div>
                        )}

                        <div
                          className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2"
                          style={{
                            background: selectedStatus.color,
                            borderColor: night ? "#2a1b08" : "#fff",
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className={`serif truncate text-[30px] leading-none ${night ? "text-[#fff7e5]" : "text-[#2a1e0e]"}`}>
                          {form.fullName || "New Staff"}
                        </div>
                        <div className="mt-1 truncate text-[12px] font-medium" style={{color:night ? "rgba(255,247,229,0.78)" : "#6e5432"}}>
                          {form.email || "staff@company.com"}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <MiniPreviewBadge text={`ID ${form.staffId || "—"}`} night={night} />
                          <MiniPreviewBadge text={form.branch} night={night} />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="grid gap-2">
                    {[
                      { icon: FileText, label: "Staff ID", value: String(form.staffId || "—") },
                      { icon: Store, label: "Shop ID", value: form.shopId ? String(form.shopId) : "Missing from session" },
                      { icon: Calendar, label: "Birthday", value: form.dateOfBirth || "Not set" },
                      { icon: Wallet, label: "Salary", value: form.salary || "Not set" },
                      { icon: Phone, label: "Phone", value: form.phone || "Not set" },
                      { icon: Mail, label: "Email", value: form.email || "Not set" },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        layout
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="rounded-[16px] p-3"
                        style={premiumInputStyle(night)}
                      >
                        <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em]" style={{color:night?"#8a7a65":"#8e7f6e"}}>
                          <item.icon className="h-3.5 w-3.5" /> {item.label}
                        </div>
                        <div className={`text-[13px] font-bold ${night ? "text-[#e8dcc8]" : "text-[#1a1510]"}`}>
                          {item.value}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.label
                    htmlFor="staff-image-upload"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="block cursor-pointer rounded-[20px] p-4 text-center"
                    style={{
                      ...premiumInputStyle(night),
                      borderStyle: "dashed",
                    }}
                  >
                    <div className="mb-2 flex justify-center">
                      <ImagePlus className="h-7 w-7" style={{color:night?"#c8892a":"#9a6c2a"}} />
                    </div>
                    <div className={`text-[12px] font-bold ${night ? "text-[#e8dcc8]" : "text-[#1a1510]"}`}>Upload Staff Photo</div>
                    <div className="mt-1 text-[11px]" style={{color:night?"#8a7a65":"#8e7f6e"}}>Click to browse image</div>
                    <input
                      id="staff-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </motion.label>

                  <div className="grid gap-2 pt-1">
                    <PremiumButton
                      onClick={() => window.history.back()}
                      icon={<ArrowLeft className="h-4 w-4" />}
                      variant="ghost"
                      night={night}
                    >
                      Back
                    </PremiumButton>

                    <PremiumButton
                      onClick={handleSaveStaff}
                      disabled={loading || sessionStatus === "loading"}
                      icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      night={night}
                    >
                      {loading ? "Saving..." : "Save Staff"}
                    </PremiumButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
