

// "use client";

// import * as React from "react";
// import { useSession } from "next-auth/react";
// import {
//   DndContext,
//   DragEndEvent,
//   DragOverEvent,
//   DragOverlay,
//   DragStartEvent,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   useDroppable,
//   useDraggable,
// } from "@dnd-kit/core";
// import { AnimatePresence, motion } from "framer-motion";
// import {
//   GripVertical,
//   Plus,
//   Trash2,
//   Bell,
//   CalendarDays,
//   CheckCircle2,
//   Clock,
//   AlertCircle,
//   TrendingUp,
//   ClipboardList,
//   X,
//   Search,
//   ChevronDown,
//   ChevronUp,
//   ChevronLeft,
//   ChevronRight,
//   Users,
//   Filter,
//   LayoutDashboard,
//   Sparkles,
//   ArrowRight,
//   Sun,
//   Moon,
//   Zap,
//   Loader2,
//   RefreshCw,
//   Briefcase,
//   Mail,
//   Phone,
//   MapPin,
// } from "lucide-react";

// /* ────────────────────────────────────────────────────────────────────────── */
// /* Theme                                                                    */
// /* ────────────────────────────────────────────────────────────────────────── */
// const FontImport = () => (
//   <style>{`
//     @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400;1,9..144,600&display=swap');

//     :root {
//       --bg: #f0f2f8;
//       --bg-dots: rgba(100,116,139,0.06);
//       --bg-2: #e8ebf4;
//       --surface: #ffffff;
//       --surface-2: #f7f8fc;
//       --surface-3: #eef0f7;
//       --surface-hover: #f2f4fb;
//       --border: #e2e6f3;
//       --border-strong: #c8cfe8;
//       --text: #0d1526;
//       --text-2: #2d3a54;
//       --muted: #5e6e8a;
//       --muted-2: #94a3b8;
//       --primary: #3b5bdb;
//       --primary-2: #2f4bc0;
//       --primary-light: #748ffc;
//       --primary-soft: rgba(59,91,219,.10);
//       --primary-border: rgba(59,91,219,.18);
//       --success: #0ca678;
//       --success-soft: rgba(12,166,120,.10);
//       --warning: #e67700;
//       --warning-soft: rgba(230,119,0,.10);
//       --danger: #e03131;
//       --danger-soft: rgba(224,49,49,.10);
//       --violet: #7048e8;
//       --violet-soft: rgba(112,72,232,.10);
//       --cyan: #0c8599;
//       --cyan-soft: rgba(12,133,153,.10);

//       --shadow-xs: 0 1px 3px rgba(13,21,38,.04), 0 1px 2px rgba(13,21,38,.03);
//       --shadow-sm: 0 4px 16px rgba(13,21,38,.06), 0 1px 4px rgba(13,21,38,.04);
//       --shadow-md: 0 8px 32px rgba(13,21,38,.09), 0 2px 8px rgba(13,21,38,.05);
//       --shadow-lg: 0 20px 60px rgba(13,21,38,.14), 0 4px 16px rgba(13,21,38,.07);
//       --shadow-glow: 0 0 0 3px rgba(59,91,219,.12);

//       --radius-sm: 10px;
//       --radius-md: 16px;
//       --radius-lg: 22px;
//       --radius-xl: 28px;

//       --header-bg-start: #0d1b3e;
//       --header-bg-mid: #162352;
//       --header-bg-end: #1a3373;
//       --header-accent: rgba(116,143,252,0.15);

//       --transition: all .2s cubic-bezier(.4,0,.2,1);
//     }

//     [data-theme="dark"] {
//       --bg: #0a0e1a;
//       --bg-dots: rgba(116,143,252,0.07);
//       --bg-2: #0e1322;
//       --surface: #111827;
//       --surface-2: #161d2e;
//       --surface-3: #1c2438;
//       --surface-hover: #1a2236;
//       --border: #1f2c44;
//       --border-strong: #2a3a55;
//       --text: #e8eef8;
//       --text-2: #b8c8e0;
//       --muted: #7a90af;
//       --muted-2: #4a5e7a;
//       --primary: #748ffc;
//       --primary-2: #8fa3ff;
//       --primary-light: #a5b8ff;
//       --primary-soft: rgba(116,143,252,.14);
//       --primary-border: rgba(116,143,252,.22);
//       --success: #20c997;
//       --success-soft: rgba(32,201,151,.12);
//       --warning: #ffa94d;
//       --warning-soft: rgba(255,169,77,.12);
//       --danger: #ff6b6b;
//       --danger-soft: rgba(255,107,107,.12);
//       --violet: #9775fa;
//       --violet-soft: rgba(151,117,250,.12);
//       --cyan: #22d3ee;
//       --cyan-soft: rgba(34,211,238,.12);

//       --shadow-xs: 0 1px 3px rgba(0,0,0,.3), 0 1px 2px rgba(0,0,0,.2);
//       --shadow-sm: 0 4px 16px rgba(0,0,0,.35), 0 1px 4px rgba(0,0,0,.2);
//       --shadow-md: 0 8px 32px rgba(0,0,0,.45), 0 2px 8px rgba(0,0,0,.25);
//       --shadow-lg: 0 20px 60px rgba(0,0,0,.55), 0 4px 16px rgba(0,0,0,.3);
//       --shadow-glow: 0 0 0 3px rgba(116,143,252,.18);

//       --header-bg-start: #050912;
//       --header-bg-mid: #0a1225;
//       --header-bg-end: #0e1a38;
//       --header-accent: rgba(116,143,252,0.12);
//     }

//     *, *::before, *::after {
//       box-sizing: border-box;
//       margin: 0;
//       padding: 0;
//     }

//     html, body {
//       background: var(--bg);
//       color: var(--text);
//       transition: background .3s ease, color .3s ease;
//     }

//     body {
//       background-image: radial-gradient(var(--bg-dots) 1px, transparent 1px);
//       background-size: 24px 24px;
//     }

//     .display-font {
//       font-family: 'Fraunces', Georgia, serif !important;
//     }

//     * {
//       font-family: 'DM Sans', system-ui, sans-serif;
//     }

//     input, select, textarea, button {
//       font-family: 'DM Sans', system-ui, sans-serif;
//     }

//     input:focus, select:focus, textarea:focus {
//       outline: none;
//       border-color: var(--primary);
//       box-shadow: var(--shadow-glow);
//     }

//     ::-webkit-scrollbar { width: 6px; height: 6px; }
//     ::-webkit-scrollbar-track { background: transparent; }
//     ::-webkit-scrollbar-thumb {
//       background: var(--border-strong);
//       border-radius: 999px;
//     }
//     ::-webkit-scrollbar-thumb:hover {
//       background: var(--muted-2);
//     }

//     .surface-card {
//       background: var(--surface);
//       border: 1px solid var(--border);
//       border-radius: var(--radius-lg);
//       box-shadow: var(--shadow-sm);
//       transition: var(--transition);
//     }

//     .surface-card:hover {
//       border-color: var(--border-strong);
//       box-shadow: var(--shadow-md);
//     }

//     .hero-gradient {
//       background: linear-gradient(135deg, var(--header-bg-start) 0%, var(--header-bg-mid) 50%, var(--header-bg-end) 100%);
//     }

//     .hero-shine::before {
//       content: '';
//       position: absolute;
//       inset: 0;
//       background:
//         radial-gradient(ellipse 60% 50% at 20% 30%, rgba(116,143,252,.12) 0%, transparent 60%),
//         radial-gradient(ellipse 40% 40% at 80% 10%, rgba(167,139,250,.08) 0%, transparent 50%);
//       pointer-events: none;
//     }

//     @keyframes fadeUp {
//       from { opacity: 0; transform: translateY(14px); }
//       to   { opacity: 1; transform: translateY(0); }
//     }

//     .fade-up-1 { animation: fadeUp .35s .05s both; }
//     .fade-up-2 { animation: fadeUp .35s .12s both; }
//     .fade-up-3 { animation: fadeUp .35s .20s both; }

//     .theme-toggle {
//       cursor: pointer;
//       transition: var(--transition);
//     }
//     .theme-toggle:hover {
//       transform: rotate(20deg) scale(1.1);
//     }

//     .glass-card {
//       background: rgba(255,255,255,.06);
//       backdrop-filter: blur(16px);
//       -webkit-backdrop-filter: blur(16px);
//       border: 1px solid rgba(255,255,255,.10);
//     }

//     .status-pill {
//       transition: var(--transition);
//     }
//     .status-pill:hover {
//       transform: translateY(-1px);
//       filter: brightness(1.08);
//     }

//     .staff-card-inner {
//       transition: var(--transition);
//     }

//     .task-chip:hover {
//       transform: translateY(-2px);
//       box-shadow: var(--shadow-md) !important;
//     }
//   `}</style>
// );

// /* ────────────────────────────────────────────────────────────────────────── */
// /* Types                                                                    */
// /* ────────────────────────────────────────────────────────────────────────── */
// type TaskStatus = "Pending" | "In Progress" | "Done";
// type TaskPriority = "High" | "Medium" | "Low";
// type AttStatus = "Present" | "Absent" | "Late";

// type Task = {
//   id: string;
//   title: string;
//   description: string;
//   dueDate: string;
//   status: TaskStatus;
//   priority: TaskPriority;
//   subject: string;
//   assignedTo: string | null;
// };

// type Staff = {
//   id: string;
//   staffId: string;
//   name: string;
//   role: string;
//   subject: string;
//   image: string;
//   attendance: AttStatus;
//   email?: string;
//   phone?: string;
//   branch?: string;
// };

// type ApiStaff = {
//   id?: number | string;
//   staffId?: number | string;
//   fullName?: string;
//   name?: string;
//   role?: string;
//   branch?: string;
//   status?: string;
//   email?: string;
//   phone?: string;
//   imageUrl?: string;
// };

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
// const PER_PAGE = 6;

// /* ────────────────────────────────────────────────────────────────────────── */
// /* Mock Tasks                                                                */
// /* ────────────────────────────────────────────────────────────────────────── */
// const TASKS_DATA: Task[] = [
//   { id: "TSK-001", title: "Open counter checklist", description: "Verify register, receipt roll, and opening stock.", dueDate: "09:00 AM", status: "Pending", priority: "High", subject: "Main Branch", assignedTo: null },
//   { id: "TSK-002", title: "Update daily sales note", description: "Prepare short sales summary for manager review.", dueDate: "11:30 AM", status: "Pending", priority: "Medium", subject: "Main Branch", assignedTo: null },
//   { id: "TSK-003", title: "Shelf restock", description: "Refill fast moving items and check labels.", dueDate: "02:00 PM", status: "Pending", priority: "High", subject: "Store", assignedTo: null },
//   { id: "TSK-004", title: "Customer feedback check", description: "Read recent feedback and list action items.", dueDate: "03:30 PM", status: "In Progress", priority: "Medium", subject: "Support", assignedTo: null },
//   { id: "TSK-005", title: "Cash drawer review", description: "Review count differences before closing shift.", dueDate: "05:00 PM", status: "Done", priority: "Low", subject: "Cashier", assignedTo: null },
//   { id: "TSK-006", title: "Clean stock room", description: "Organize cartons and update placement tags.", dueDate: "04:00 PM", status: "Pending", priority: "Low", subject: "Warehouse", assignedTo: null },
// ];

// /* ────────────────────────────────────────────────────────────────────────── */
// /* Helpers                                                                   */
// /* ────────────────────────────────────────────────────────────────────────── */
// const priorityConfig = (p: TaskPriority) => ({
//   High:   { color: "var(--danger)",  bg: "var(--danger-soft)",  border: "rgba(224,49,49,.20)", icon: "●" },
//   Medium: { color: "var(--warning)", bg: "var(--warning-soft)", border: "rgba(230,119,0,.20)", icon: "◐" },
//   Low:    { color: "var(--muted)",   bg: "var(--surface-3)",    border: "var(--border)",        icon: "○" },
// }[p]);

// const attConfig = (s: AttStatus) => ({
//   Present: { color: "var(--success)", bg: "var(--success-soft)", border: "rgba(12,166,120,.20)", dot: "var(--success)" },
//   Late:    { color: "var(--warning)", bg: "var(--warning-soft)", border: "rgba(230,119,0,.20)",  dot: "var(--warning)" },
//   Absent:  { color: "var(--danger)",  bg: "var(--danger-soft)",  border: "rgba(224,49,49,.20)",  dot: "var(--danger)"  },
// }[s]);

// const statusConfig = (s: TaskStatus) => ({
//   Done:         { color: "var(--success)", bg: "var(--success-soft)", border: "rgba(12,166,120,.20)" },
//   "In Progress":{ color: "var(--primary)", bg: "var(--primary-soft)", border: "var(--primary-border)" },
//   Pending:      { color: "var(--warning)", bg: "var(--warning-soft)", border: "rgba(230,119,0,.20)" },
// }[s]);

// const subjectPalette: Record<string, { color: string; light: string }> = {
//   "Main Branch": { color: "#3b5bdb", light: "rgba(59,91,219,.14)" },
//   Store:         { color: "#0ca678", light: "rgba(12,166,120,.14)" },
//   Support:       { color: "#7048e8", light: "rgba(112,72,232,.14)" },
//   Cashier:       { color: "#e67700", light: "rgba(230,119,0,.14)" },
//   Warehouse:     { color: "#0c8599", light: "rgba(12,133,153,.14)" },
// };
// const getSubject = (s: string) => subjectPalette[s] ?? { color: "#64748b", light: "rgba(100,116,139,.14)" };

// const inputBase: React.CSSProperties = {
//   width: "100%",
//   height: 42,
//   borderRadius: 12,
//   border: "1px solid var(--border)",
//   background: "var(--surface-2)",
//   color: "var(--text)",
//   padding: "0 12px",
//   fontSize: 13.5,
//   fontWeight: 500,
//   transition: "all .18s ease",
// };

// function mapApiStaffToTaskStaff(staff: ApiStaff): Staff {
//   const name = staff.fullName || staff.name || "Unknown Staff";

//   const image =
//     staff.imageUrl && String(staff.imageUrl).startsWith("http")
//       ? String(staff.imageUrl)
//       : staff.imageUrl
//         ? `${API_BASE_URL}${staff.imageUrl}`
//         : `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}`;

//   const rawStatus = String(staff.status || "active").toLowerCase();
//   let attendance: AttStatus = "Present";
//   if (rawStatus === "inactive") attendance = "Absent";
//   else if (rawStatus === "on_leave") attendance = "Late";

//   return {
//     id: String(staff.id ?? staff.staffId ?? crypto.randomUUID()),
//     staffId: String(staff.staffId ?? staff.id ?? "—"),
//     name,
//     role: staff.role || "Staff",
//     subject: staff.branch || "Main Branch",
//     image,
//     attendance,
//     email: staff.email || "—",
//     phone: staff.phone || "—",
//     branch: staff.branch || "Main Branch",
//   };
// }

// /* ────────────────────────────────────────────────────────────────────────── */
// /* Badge                                                                     */
// /* ────────────────────────────────────────────────────────────────────────── */
// function Badge({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
//   return (
//     <span
//       className="status-pill"
//       style={{
//         fontSize: 10.5,
//         fontWeight: 700,
//         letterSpacing: ".03em",
//         color,
//         background: bg,
//         border: `1px solid ${border}`,
//         borderRadius: 999,
//         padding: "3px 9px",
//         display: "inline-flex",
//         alignItems: "center",
//       }}
//     >
//       {label}
//     </span>
//   );
// }

// /* ────────────────────────────────────────────────────────────────────────── */
// /* Draggable Task Chip                                                       */
// /* ────────────────────────────────────────────────────────────────────────── */
// function DraggableTaskChip({
//   task,
//   allStaff,
//   onDelete,
// }: {
//   task: Task;
//   allStaff: Staff[];
//   onDelete: () => void;
// }) {
//   const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
//     id: task.id,
//     data: { task },
//   });

//   const assignedStaff = allStaff.find((s) => s.id === task.assignedTo) ?? null;
//   const priority = priorityConfig(task.priority);
//   const status = statusConfig(task.status);
//   const subject = getSubject(task.subject);

//   return (
//     <div
//       ref={setNodeRef}
//       className="task-chip"
//       style={{
//         background: "var(--surface)",
//         border: isDragging ? `1px solid var(--primary)` : "1px solid var(--border)",
//         borderLeft: `3px solid ${subject.color}`,
//         borderRadius: 14,
//         padding: "12px 12px 12px 10px",
//         opacity: isDragging ? 0.3 : 1,
//         boxShadow: isDragging ? "var(--shadow-lg)" : "var(--shadow-xs)",
//         transition: "all .18s ease",
//         display: "flex",
//         gap: 8,
//         alignItems: "flex-start",
//         cursor: "default",
//       }}
//     >
//       <button
//         {...listeners}
//         {...attributes}
//         style={{
//           border: "none",
//           background: "transparent",
//           color: "var(--muted-2)",
//           cursor: "grab",
//           paddingTop: 2,
//           flexShrink: 0,
//           display: "flex",
//         }}
//       >
//         <GripVertical size={15} />
//       </button>

//       <div style={{ flex: 1, minWidth: 0 }}>
//         <div
//           style={{
//             display: "flex",
//             alignItems: "flex-start",
//             justifyContent: "space-between",
//             gap: 8,
//             marginBottom: 7,
//           }}
//         >
//           <div style={{ minWidth: 0 }}>
//             <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", lineHeight: 1.35, marginBottom: 3 }}>
//               {task.title}
//             </p>
//             <p
//               style={{
//                 fontSize: 11,
//                 color: "var(--muted)",
//                 lineHeight: 1.5,
//                 display: "-webkit-box",
//                 WebkitLineClamp: 2,
//                 WebkitBoxOrient: "vertical",
//                 overflow: "hidden",
//               }}
//             >
//               {task.description || "No description"}
//             </p>
//           </div>

//           <button
//             onClick={onDelete}
//             style={{
//               width: 26,
//               height: 26,
//               flexShrink: 0,
//               borderRadius: 8,
//               border: "1px solid var(--danger-soft)",
//               background: "var(--danger-soft)",
//               color: "var(--danger)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               transition: "var(--transition)",
//               cursor: "pointer",
//             }}
//           >
//             <Trash2 size={12} />
//           </button>
//         </div>

//         <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
//           <Badge label={`${priority.icon} ${task.priority}`} color={priority.color} bg={priority.bg} border={priority.border} />
//           <Badge label={task.status} color={status.color} bg={status.bg} border={status.border} />
//           <Badge label={task.subject} color={subject.color} bg={subject.light} border={subject.color + "30"} />
//         </div>

//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
//           <div style={{ display: "flex", gap: 5, alignItems: "center", minWidth: 0 }}>
//             {assignedStaff ? (
//               <>
//                 <img
//                   src={assignedStaff.image}
//                   alt={assignedStaff.name}
//                   style={{
//                     width: 18,
//                     height: 18,
//                     borderRadius: "50%",
//                     border: "1.5px solid var(--border)",
//                     background: "var(--surface-2)",
//                     flexShrink: 0,
//                   }}
//                 />
//                 <span
//                   style={{
//                     fontSize: 11,
//                     fontWeight: 600,
//                     color: "var(--text-2)",
//                     whiteSpace: "nowrap",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                     maxWidth: 100,
//                   }}
//                 >
//                   {assignedStaff.name}
//                 </span>
//               </>
//             ) : (
//               <span
//                 style={{
//                   fontSize: 11,
//                   color: "var(--muted)",
//                   fontWeight: 600,
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 4,
//                 }}
//               >
//                 <span
//                   style={{
//                     width: 14,
//                     height: 14,
//                     borderRadius: "50%",
//                     border: "1.5px dashed var(--muted-2)",
//                     display: "inline-block",
//                   }}
//                 />
//                 Unassigned
//               </span>
//             )}
//           </div>

//           <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--muted-2)", flexShrink: 0 }}>
//             ⏱ {task.dueDate}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ────────────────────────────────────────────────────────────────────────── */
// /* Task Ghost                                                                */
// /* ────────────────────────────────────────────────────────────────────────── */
// function TaskGhost({ task, allStaff }: { task: Task; allStaff: Staff[] }) {
//   return (
//     <div style={{ width: 320, transform: "rotate(2deg)" }}>
//       <DraggableTaskChip task={task} allStaff={allStaff} onDelete={() => undefined} />
//     </div>
//   );
// }

// /* ────────────────────────────────────────────────────────────────────────── */
// /* Droppable Staff Card                                                      */
// /* ────────────────────────────────────────────────────────────────────────── */
// function DroppableStaffCard({
//   staff,
//   tasks,
//   isOver,
//   onRemoveTask,
//   onStatusChange,
// }: {
//   staff: Staff;
//   tasks: Task[];
//   isOver: boolean;
//   onRemoveTask: (id: string) => void;
//   onStatusChange: (id: string, s: TaskStatus) => void;
// }) {
//   const { setNodeRef } = useDroppable({ id: `staff-${staff.id}`, data: { staffId: staff.id } });
//   const badge = attConfig(staff.attendance);
//   const [expanded, setExpanded] = React.useState(false);

//   const doneCount = tasks.filter((t) => t.status === "Done").length;
//   const progress = tasks.length === 0 ? 0 : (doneCount / tasks.length) * 100;
//   const roleColor = staff.role.toLowerCase() === "admin" ? "var(--violet)" : "var(--primary)";

//   return (
//     <div
//       ref={setNodeRef}
//       className="staff-card-inner"
//       style={{
//         borderRadius: 18,
//         background: "var(--surface)",
//         border: isOver ? "1.5px solid var(--primary)" : "1px solid var(--border)",
//         boxShadow: isOver ? "var(--shadow-glow), var(--shadow-md)" : "var(--shadow-xs)",
//         overflow: "hidden",
//         transition: "all .18s ease",
//       }}
//     >
//       <div
//         onClick={() => setExpanded((v) => !v)}
//         style={{
//           padding: "14px 14px 12px",
//           cursor: "pointer",
//           display: "flex",
//           alignItems: "center",
//           gap: 12,
//           background: isOver ? "var(--primary-soft)" : "transparent",
//           transition: "background .18s ease",
//         }}
//       >
//         <div style={{ position: "relative", flexShrink: 0 }}>
//           <div
//             style={{
//               width: 46,
//               height: 46,
//               borderRadius: 14,
//               border: "1.5px solid var(--border)",
//               background: "var(--surface-2)",
//               overflow: "hidden",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <img src={staff.image} alt={staff.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//           </div>
//           <span
//             style={{
//               position: "absolute",
//               right: -2,
//               bottom: -2,
//               width: 12,
//               height: 12,
//               borderRadius: "50%",
//               background: badge.dot,
//               border: "2px solid var(--surface)",
//             }}
//           />
//         </div>

//         <div style={{ flex: 1, minWidth: 0 }}>
//           <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 3 }}>
//             <p
//               style={{
//                 fontSize: 13.5,
//                 fontWeight: 700,
//                 color: "var(--text)",
//                 whiteSpace: "nowrap",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 maxWidth: 150,
//               }}
//             >
//               {staff.name}
//             </p>
//             <Badge label={staff.attendance} color={badge.color} bg={badge.bg} border={badge.border} />
//           </div>

//           <p style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 500, marginBottom: 8 }}>
//             <span style={{ color: roleColor, fontWeight: 700 }}>{staff.role}</span>
//             {" · "}
//             {staff.subject}
//             {" · "}
//             <span style={{ color: "var(--muted-2)" }}>{staff.staffId}</span>
//           </p>

//           <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
//             <div style={{ flex: 1, height: 5, borderRadius: 999, background: "var(--surface-3)", overflow: "hidden" }}>
//               <div
//                 style={{
//                   width: `${progress}%`,
//                   height: "100%",
//                   background:
//                     progress === 100
//                       ? "linear-gradient(90deg, var(--success), #34d399)"
//                       : "linear-gradient(90deg, var(--primary), var(--primary-light))",
//                   borderRadius: 999,
//                   transition: "width .4s cubic-bezier(.4,0,.2,1)",
//                 }}
//               />
//             </div>
//             <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", flexShrink: 0 }}>
//               {doneCount}/{tasks.length}
//             </span>
//           </div>
//         </div>

//         <div
//           style={{
//             width: 28,
//             height: 28,
//             borderRadius: 10,
//             background: "var(--surface-3)",
//             border: "1px solid var(--border)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             color: "var(--muted)",
//             flexShrink: 0,
//           }}
//         >
//           {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//         </div>
//       </div>

//       {isOver && (
//         <motion.div
//           initial={{ opacity: 0, y: -4 }}
//           animate={{ opacity: 1, y: 0 }}
//           style={{
//             margin: "0 14px 10px",
//             padding: "9px 12px",
//             borderRadius: 12,
//             border: "1.5px dashed var(--primary)",
//             background: "var(--primary-soft)",
//             color: "var(--primary)",
//             fontSize: 12,
//             fontWeight: 700,
//             textAlign: "center",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             gap: 6,
//           }}
//         >
//           <Zap size={13} />
//           Assign to {staff.name}
//         </motion.div>
//       )}

//       <AnimatePresence initial={false}>
//         {expanded && (
//           <motion.div
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             transition={{ duration: 0.22 }}
//             style={{ overflow: "hidden" }}
//           >
//             <div style={{ padding: "0 14px 14px" }}>
//               <div
//                 style={{
//                   background: "var(--surface-2)",
//                   border: "1px solid var(--border)",
//                   borderRadius: 14,
//                   padding: 12,
//                   marginBottom: 12,
//                 }}
//               >
//                 <div style={{ display: "grid", gap: 8 }}>
//                   <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>
//                     <Briefcase size={14} /> {staff.branch || staff.subject}
//                   </div>
//                   <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>
//                     <Mail size={14} /> {staff.email || "—"}
//                   </div>
//                   <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>
//                     <Phone size={14} /> {staff.phone || "—"}
//                   </div>
//                   <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>
//                     <MapPin size={14} /> Staff ID: {staff.staffId}
//                   </div>
//                 </div>
//               </div>

//               <div style={{ display: "grid", gap: 8 }}>
//                 {tasks.length === 0 ? (
//                   <div
//                     style={{
//                       padding: "14px 12px",
//                       borderRadius: 12,
//                       border: "1px dashed var(--border-strong)",
//                       background: "var(--surface-2)",
//                       textAlign: "center",
//                       color: "var(--muted)",
//                       fontSize: 12,
//                       fontWeight: 600,
//                     }}
//                   >
//                     No tasks assigned yet
//                   </div>
//                 ) : (
//                   tasks.map((task) => {
//                     const status = statusConfig(task.status);
//                     return (
//                       <div
//                         key={task.id}
//                         style={{
//                           borderRadius: 12,
//                           border: "1px solid var(--border)",
//                           background: "var(--surface)",
//                           padding: 10,
//                         }}
//                       >
//                         <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
//                           <div style={{ minWidth: 0 }}>
//                             <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)" }}>{task.title}</p>
//                             <p style={{ fontSize: 11, color: "var(--muted)" }}>{task.dueDate}</p>
//                           </div>
//                           <button
//                             onClick={() => onRemoveTask(task.id)}
//                             style={{
//                               width: 24,
//                               height: 24,
//                               borderRadius: 8,
//                               border: "1px solid var(--danger-soft)",
//                               background: "var(--danger-soft)",
//                               color: "var(--danger)",
//                               display: "flex",
//                               alignItems: "center",
//                               justifyContent: "center",
//                               cursor: "pointer",
//                               flexShrink: 0,
//                             }}
//                           >
//                             <X size={12} />
//                           </button>
//                         </div>

//                         <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
//                           <Badge label={task.status} color={status.color} bg={status.bg} border={status.border} />
//                         </div>

//                         <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
//                           {(["Pending", "In Progress", "Done"] as TaskStatus[]).map((next) => (
//                             <button
//                               key={next}
//                               onClick={() => onStatusChange(task.id, next)}
//                               style={{
//                                 borderRadius: 999,
//                                 border: task.status === next ? `1px solid ${status.color}` : "1px solid var(--border)",
//                                 background: task.status === next ? status.bg : "var(--surface-2)",
//                                 color: task.status === next ? status.color : "var(--muted)",
//                                 padding: "5px 9px",
//                                 fontSize: 10.5,
//                                 fontWeight: 700,
//                                 cursor: "pointer",
//                               }}
//                             >
//                               {next}
//                             </button>
//                           ))}
//                         </div>
//                       </div>
//                     );
//                   })
//                 )}
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

// /* ────────────────────────────────────────────────────────────────────────── */
// /* Pagination                                                                */
// /* ────────────────────────────────────────────────────────────────────────── */
// function Pagination({
//   page,
//   total,
//   perPage,
//   onChange,
//   label,
// }: {
//   page: number;
//   total: number;
//   perPage: number;
//   onChange: (page: number) => void;
//   label: string;
// }) {
//   const totalPages = Math.max(1, Math.ceil(total / perPage));

//   return (
//     <div
//       style={{
//         padding: "14px 16px 18px",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         gap: 12,
//         flexWrap: "wrap",
//       }}
//     >
//       <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>
//         {label}
//       </span>

//       <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//         <button
//           onClick={() => onChange(Math.max(1, page - 1))}
//           disabled={page === 1}
//           style={{
//             width: 34,
//             height: 34,
//             borderRadius: 10,
//             border: "1px solid var(--border)",
//             background: "var(--surface)",
//             color: "var(--text)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             opacity: page === 1 ? 0.45 : 1,
//             cursor: "pointer",
//           }}
//         >
//           <ChevronLeft size={15} />
//         </button>

//         <div
//           style={{
//             minWidth: 88,
//             height: 34,
//             borderRadius: 10,
//             border: "1px solid var(--border)",
//             background: "var(--surface-2)",
//             color: "var(--text-2)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             fontSize: 12,
//             fontWeight: 700,
//             padding: "0 12px",
//           }}
//         >
//           Page {page} / {totalPages}
//         </div>

//         <button
//           onClick={() => onChange(Math.min(totalPages, page + 1))}
//           disabled={page === totalPages}
//           style={{
//             width: 34,
//             height: 34,
//             borderRadius: 10,
//             border: "1px solid var(--border)",
//             background: "var(--surface)",
//             color: "var(--text)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             opacity: page === totalPages ? 0.45 : 1,
//             cursor: "pointer",
//           }}
//         >
//           <ChevronRight size={15} />
//         </button>
//       </div>
//     </div>
//   );
// }

// /* ────────────────────────────────────────────────────────────────────────── */
// /* Create Modal                                                              */
// /* ────────────────────────────────────────────────────────────────────────── */
// function CreateModal({
//   open,
//   onClose,
//   onSubmit,
// }: {
//   open: boolean;
//   onClose: () => void;
//   onSubmit: (task: Omit<Task, "id">) => void;
// }) {
//   const [form, setForm] = React.useState<Omit<Task, "id">>({
//     title: "",
//     description: "",
//     dueDate: "",
//     status: "Pending",
//     priority: "Medium",
//     subject: "Main Branch",
//     assignedTo: null,
//   });

//   React.useEffect(() => {
//     if (!open) {
//       setForm({
//         title: "",
//         description: "",
//         dueDate: "",
//         status: "Pending",
//         priority: "Medium",
//         subject: "Main Branch",
//         assignedTo: null,
//       });
//     }
//   }, [open]);

//   if (!open) return null;

//   const submit = () => {
//     if (!form.title.trim()) return;
//     onSubmit({
//       ...form,
//       title: form.title.trim(),
//       description: form.description.trim(),
//       dueDate: form.dueDate || "05:00 PM",
//     });
//     onClose();
//   };

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         style={{
//           position: "fixed",
//           inset: 0,
//           background: "rgba(0,0,0,.35)",
//     backdropFilter: "blur(4px)",
//           zIndex: 60,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           padding: 16,
//         }}
//         onClick={onClose}
//       >
//         <motion.div
//           initial={{ opacity: 0, y: 18, scale: .96 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           exit={{ opacity: 0, y: 18, scale: .96 }}
//           transition={{ duration: .18 }}
//           onClick={(e) => e.stopPropagation()}
//           style={{
//             width: "100%",
//             maxWidth: 520,
//             borderRadius: 24,
//             background: "var(--surface)",
//             border: "1px solid var(--border)",
//             boxShadow: "var(--shadow-lg)",
//             overflow: "hidden",
//           }}
//         >
//           <div
//             style={{
//               padding: "18px 20px",
//               borderBottom: "1px solid var(--border)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//             }}
//           >
//             <div>
//               <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Create Task</h3>
//               <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Add a new task to the task pool</p>
//             </div>

//             <button
//               onClick={onClose}
//               style={{
//                 width: 34,
//                 height: 34,
//                 borderRadius: 10,
//                 border: "1px solid var(--border)",
//                 background: "var(--surface-2)",
//                 color: "var(--text)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 cursor: "pointer",
//               }}
//             >
//               <X size={16} />
//             </button>
//           </div>

//           <div style={{ padding: 20, display: "grid", gap: 12 }}>
//             <input
//               placeholder="Task title"
//               value={form.title}
//               onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
//               style={inputBase}
//             />
//             <textarea
//               placeholder="Description"
//               value={form.description}
//               onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
//               style={{ ...inputBase, minHeight: 96, padding: 12, resize: "vertical" }}
//             />

//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
//               <input
//                 placeholder="Due time (e.g. 03:00 PM)"
//                 value={form.dueDate}
//                 onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
//                 style={inputBase}
//               />
//               <select
//                 value={form.priority}
//                 onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as TaskPriority }))}
//                 style={inputBase}
//               >
//                 <option>High</option>
//                 <option>Medium</option>
//                 <option>Low</option>
//               </select>
//             </div>

//             <input
//               placeholder="Subject / Branch"
//               value={form.subject}
//               onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
//               style={inputBase}
//             />
//           </div>

//           <div
//             style={{
//               padding: 20,
//               borderTop: "1px solid var(--border)",
//               display: "flex",
//               justifyContent: "flex-end",
//               gap: 10,
//             }}
//           >
//             <button
//               onClick={onClose}
//               style={{
//                 height: 42,
//                 padding: "0 16px",
//                 borderRadius: 12,
//                 border: "1px solid var(--border)",
//                 background: "var(--surface-2)",
//                 color: "var(--text)",
//                 fontWeight: 700,
//                 cursor: "pointer",
//               }}
//             >
//               Cancel
//             </button>

//             <button
//               onClick={submit}
//               style={{
//                 height: 42,
//                 padding: "0 16px",
//                 borderRadius: 12,
//                 border: "1px solid var(--primary)",
//                 background: "var(--primary)",
//                 color: "white",
//                 fontWeight: 700,
//                 cursor: "pointer",
//               }}
//             >
//               Create Task
//             </button>
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }

// /* ────────────────────────────────────────────────────────────────────────── */
// /* Main App                                                                  */
// /* ────────────────────────────────────────────────────────────────────────── */
// export default function TasksPage() {
//   const { data: session, status: sessionStatus } = useSession();

//   const [theme, setTheme] = React.useState<"light" | "dark">("light");
//   const [tasks, setTasks] = React.useState<Task[]>(TASKS_DATA);
//   const [staff, setStaff] = React.useState<Staff[]>([]);
//   const [staffLoading, setStaffLoading] = React.useState(true);
//   const [staffError, setStaffError] = React.useState<string | null>(null);
//   const [refreshing, setRefreshing] = React.useState(false);

//   const [poolQuery, setPoolQuery] = React.useState("");
//   const [staffQuery, setStaffQuery] = React.useState("");
//   const [attFilter, setAttFilter] = React.useState<AttStatus | "All">("All");

//   const [createOpen, setCreateOpen] = React.useState(false);
//   const [activeTask, setActiveTask] = React.useState<Task | null>(null);
//   const [overStaffId, setOverStaffId] = React.useState<string | null>(null);
//   const [staffPage, setStaffPage] = React.useState(1);

//   React.useEffect(() => {
//     document.documentElement.setAttribute("data-theme", theme);
//   }, [theme]);

//   const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

//   const fetchStaff = React.useCallback(async (refresh = false) => {
//     try {
//       if (sessionStatus === "loading") return;

//       const accessToken = (session as any)?.accessToken;
//       if (!accessToken) {
//         setStaff([]);
//         setStaffError("Session expired. Please sign in again.");
//         setStaffLoading(false);
//         return;
//       }

//       refresh ? setRefreshing(true) : setStaffLoading(true);
//       setStaffError(null);

//       const res = await fetch(`${API_BASE_URL}/api/staff`, {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//         cache: "no-store",
//       });

//       if (res.status === 401) {
//         throw new Error("Session expired. Please sign in again.");
//       }

//       if (!res.ok) {
//         throw new Error(`Failed to load staff (${res.status})`);
//       }

//       const data = await res.json();
//       setStaff(Array.isArray(data) ? data.map(mapApiStaffToTaskStaff) : []);
//     } catch (e) {
//       setStaff([]);
//       setStaffError(e instanceof Error ? e.message : "Failed to load staff");
//     } finally {
//       setStaffLoading(false);
//       setRefreshing(false);
//     }
//   }, [session, sessionStatus]);

//   React.useEffect(() => {
//     if (sessionStatus === "authenticated") {
//       fetchStaff();
//     } else if (sessionStatus === "unauthenticated") {
//       setStaff([]);
//       setStaffLoading(false);
//       setStaffError("Please sign in again.");
//     }
//   }, [fetchStaff, sessionStatus]);

//   const poolTasks = React.useMemo(() => {
//     const q = poolQuery.trim().toLowerCase();
//     return tasks.filter(
//       (t) =>
//         !t.assignedTo &&
//         (!q ||
//           t.title.toLowerCase().includes(q) ||
//           t.subject.toLowerCase().includes(q) ||
//           t.description.toLowerCase().includes(q))
//     );
//   }, [tasks, poolQuery]);

//   const filteredStaff = React.useMemo(() => {
//     const q = staffQuery.trim().toLowerCase();
//     return staff.filter(
//       (s) =>
//         (attFilter === "All" || s.attendance === attFilter) &&
//         (!q ||
//           s.name.toLowerCase().includes(q) ||
//           s.subject.toLowerCase().includes(q) ||
//           s.staffId.toLowerCase().includes(q) ||
//           s.role.toLowerCase().includes(q) ||
//           (s.email || "").toLowerCase().includes(q) ||
//           (s.phone || "").toLowerCase().includes(q))
//     );
//   }, [staff, staffQuery, attFilter]);

//   const pagedStaff = filteredStaff.slice((staffPage - 1) * PER_PAGE, staffPage * PER_PAGE);

//   React.useEffect(() => {
//     setStaffPage(1);
//   }, [staffQuery, attFilter]);

//   const getStaffTasks = (id: string) => tasks.filter((t) => t.assignedTo === id);

//   const createTask = (task: Omit<Task, "id">) => {
//     setTasks((p) => [{ id: `TSK-${Date.now()}`, ...task }, ...p]);
//   };

//   const deleteTask = (id: string) => {
//     setTasks((p) => p.filter((t) => t.id !== id));
//   };

//   const unassignTask = (id: string) => {
//     setTasks((p) => p.map((t) => (t.id === id ? { ...t, assignedTo: null } : t)));
//   };

//   const updateStatus = (id: string, status: TaskStatus) => {
//     setTasks((p) => p.map((t) => (t.id === id ? { ...t, status } : t)));
//   };

//   const stats = {
//     total: tasks.length,
//     pending: tasks.filter((t) => t.status === "Pending").length,
//     inProgress: tasks.filter((t) => t.status === "In Progress").length,
//     done: tasks.filter((t) => t.status === "Done").length,
//     unassigned: tasks.filter((t) => !t.assignedTo).length,
//     totalStaff: staff.length,
//   };

//   const attStats = {
//     present: staff.filter((s) => s.attendance === "Present").length,
//     late: staff.filter((s) => s.attendance === "Late").length,
//     absent: staff.filter((s) => s.attendance === "Absent").length,
//   };

//   const today = new Date().toLocaleDateString("en-GB", {
//     weekday: "long",
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   });

//   const onDragStart = (e: DragStartEvent) => {
//     setActiveTask(e.active.data.current?.task ?? null);
//   };

//   const onDragOver = (e: DragOverEvent) => {
//     const id = e.over?.id ? String(e.over.id) : null;
//     setOverStaffId(id?.startsWith("staff-") ? id.replace("staff-", "") : null);
//   };

//   const onDragEnd = (e: DragEndEvent) => {
//     setActiveTask(null);
//     setOverStaffId(null);

//     const { active, over } = e;
//     if (!over) return;

//     const taskId = String(active.id);
//     const overId = String(over.id);

//     if (overId.startsWith("staff-")) {
//       const targetStaffId = overId.replace("staff-", "");
//       setTasks((p) =>
//         p.map((t) =>
//           t.id === taskId
//             ? { ...t, assignedTo: targetStaffId, status: "Pending" }
//             : t
//         )
//       );
//     }
//   };

//   const statCards = [
//     { label: "Total Tasks", value: stats.total, icon: <ClipboardList size={17} />, color: "var(--primary)", bg: "var(--primary-soft)" },
//     { label: "Pending", value: stats.pending, icon: <Clock size={17} />, color: "var(--warning)", bg: "var(--warning-soft)" },
//     { label: "In Progress", value: stats.inProgress, icon: <TrendingUp size={17} />, color: "var(--cyan)", bg: "var(--cyan-soft)" },
//     { label: "Completed", value: stats.done, icon: <CheckCircle2 size={17} />, color: "var(--success)", bg: "var(--success-soft)" },
//     { label: "Unassigned", value: stats.unassigned, icon: <AlertCircle size={17} />, color: "var(--danger)", bg: "var(--danger-soft)" },
//     { label: "Staff", value: stats.totalStaff, icon: <Users size={17} />, color: "var(--violet)", bg: "var(--violet-soft)" },
//   ];

//   return (
//     <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
//       <FontImport />

//       <header className="hero-gradient hero-shine" style={{ position: "relative", overflow: "hidden" }}>
//         <div style={{ maxWidth: 1440, margin: "0 auto", padding: "24px 20px 22px", position: "relative", zIndex: 1 }}>
//           <div
//             className="glass-card"
//             style={{
//               borderRadius: 28,
//               padding: "18px 18px 16px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               gap: 16,
//               flexWrap: "wrap",
//             }}
//           >
//             <div className="fade-up-1">
//               <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
//                 <div
//                   style={{
//                     width: 44,
//                     height: 44,
//                     borderRadius: 16,
//                     background: "rgba(255,255,255,.12)",
//                     border: "1px solid rgba(255,255,255,.16)",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     color: "white",
//                   }}
//                 >
//                   <LayoutDashboard size={20} />
//                 </div>
//                 <div>
//                   <p style={{ fontSize: 12, color: "rgba(255,255,255,.75)", fontWeight: 700, letterSpacing: ".04em" }}>
//                     TEAM WORKSPACE
//                   </p>
//                   <h1 className="display-font" style={{ fontSize: 28, color: "white", fontWeight: 700, lineHeight: 1.1 }}>
//                     Staff Tasks Dashboard
//                   </h1>
//                 </div>
//               </div>

//               <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
//                 <span
//                   style={{
//                     display: "inline-flex",
//                     alignItems: "center",
//                     gap: 8,
//                     padding: "7px 12px",
//                     borderRadius: 999,
//                     background: "rgba(255,255,255,.10)",
//                     border: "1px solid rgba(255,255,255,.14)",
//                     color: "white",
//                     fontSize: 12.5,
//                     fontWeight: 700,
//                   }}
//                 >
//                   <CalendarDays size={14} />
//                   {today}
//                 </span>

//                 <span
//                   style={{
//                     display: "inline-flex",
//                     alignItems: "center",
//                     gap: 8,
//                     padding: "7px 12px",
//                     borderRadius: 999,
//                     background: "rgba(255,255,255,.10)",
//                     border: "1px solid rgba(255,255,255,.14)",
//                     color: "white",
//                     fontSize: 12.5,
//                     fontWeight: 700,
//                   }}
//                 >
//                   <Bell size={14} />
//                   {stats.pending} pending
//                 </span>

//                 <span
//                   style={{
//                     display: "inline-flex",
//                     alignItems: "center",
//                     gap: 8,
//                     padding: "7px 12px",
//                     borderRadius: 999,
//                     background: "rgba(255,255,255,.10)",
//                     border: "1px solid rgba(255,255,255,.14)",
//                     color: "white",
//                     fontSize: 12.5,
//                     fontWeight: 700,
//                   }}
//                 >
//                   <Sparkles size={14} />
//                   {stats.totalStaff} staff connected
//                 </span>
//               </div>
//             </div>

//             <div className="fade-up-2" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
//               <button
//                 className="theme-toggle"
//                 onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
//                 style={{
//                   width: 42,
//                   height: 42,
//                   borderRadius: 14,
//                   border: "1px solid rgba(255,255,255,.16)",
//                   background: "rgba(255,255,255,.08)",
//                   color: "white",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
//               </button>

//               <button
//                 onClick={() => fetchStaff(true)}
//                 style={{
//                   height: 42,
//                   padding: "0 14px",
//                   borderRadius: 14,
//                   border: "1px solid rgba(255,255,255,.16)",
//                   background: "rgba(255,255,255,.08)",
//                   color: "white",
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: 8,
//                   fontWeight: 700,
//                   cursor: "pointer",
//                 }}
//               >
//                 {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
//                 Refresh Staff
//               </button>

//               <button
//                 onClick={() => setCreateOpen(true)}
//                 style={{
//                   height: 42,
//                   padding: "0 14px",
//                   borderRadius: 14,
//                   border: "1px solid rgba(255,255,255,.16)",
//                   background: "white",
//                   color: "var(--primary)",
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: 8,
//                   fontWeight: 800,
//                   cursor: "pointer",
//                 }}
//               >
//                 <Plus size={16} />
//                 New Task
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main style={{ maxWidth: 1440, margin: "0 auto", padding: "18px 20px 28px" }}>
//         {sessionStatus === "loading" && (
//           <div
//             style={{
//               borderRadius: 20,
//               padding: "14px 16px",
//               fontSize: 13,
//               display: "flex",
//               alignItems: "center",
//               gap: 10,
//               background: "var(--surface)",
//               color: "var(--text-2)",
//               fontWeight: 700,
//               border: "1px solid var(--border)",
//               marginBottom: 14,
//             }}
//           >
//             <Loader2 className="animate-spin" size={16} />
//             Checking session...
//           </div>
//         )}

//         {staffLoading && (
//           <div
//             style={{
//               borderRadius: 20,
//               padding: "14px 16px",
//               fontSize: 13,
//               display: "flex",
//               alignItems: "center",
//               gap: 10,
//               background: "var(--surface)",
//               color: "var(--text-2)",
//               fontWeight: 700,
//               border: "1px solid var(--border)",
//               marginBottom: 14,
//             }}
//           >
//             <Loader2 className="animate-spin" size={16} />
//             Loading staff...
//           </div>
//         )}

//         {staffError && (
//           <div
//             style={{
//               borderRadius: 20,
//               padding: "14px 16px",
//               fontSize: 13,
//               background: "var(--danger-soft)",
//               border: "1px solid rgba(224,49,49,.20)",
//               color: "var(--danger)",
//               fontWeight: 700,
//               marginBottom: 14,
//             }}
//           >
//             {staffError}
//           </div>
//         )}

//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
//             gap: 12,
//             marginBottom: 18,
//           }}
//         >
//           {statCards.map((card) => (
//             <div
//               key={card.label}
//               className="surface-card"
//               style={{
//                 padding: 16,
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 12,
//                 minWidth: 0,
//               }}
//             >
//               <div
//                 style={{
//                   width: 42,
//                   height: 42,
//                   borderRadius: 14,
//                   background: card.bg,
//                   color: card.color,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   flexShrink: 0,
//                 }}
//               >
//                 {card.icon}
//               </div>

//               <div style={{ minWidth: 0 }}>
//                 <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>{card.label}</p>
//                 <p style={{ fontSize: 22, color: "var(--text)", fontWeight: 800, lineHeight: 1.1 }}>{card.value}</p>
//               </div>
//             </div>
//           ))}
//         </div>

//         <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
//           <div style={{ display: "grid", gridTemplateColumns: "380px minmax(0,1fr)", gap: 16, alignItems: "start" }}>
//             <aside className="surface-card" style={{ overflow: "hidden" }}>
//               <div
//                 style={{
//                   padding: 16,
//                   borderBottom: "1px solid var(--border)",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   gap: 12,
//                 }}
//               >
//                 <div>
//                   <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Task Pool</h2>
//                   <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
//                     Drag any task onto a staff card
//                   </p>
//                 </div>

//                 <button
//                   onClick={() => setCreateOpen(true)}
//                   style={{
//                     width: 36,
//                     height: 36,
//                     borderRadius: 12,
//                     border: "1px solid var(--border)",
//                     background: "var(--surface-2)",
//                     color: "var(--primary)",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     cursor: "pointer",
//                     flexShrink: 0,
//                   }}
//                 >
//                   <Plus size={16} />
//                 </button>
//               </div>

//               <div style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
//                 <div style={{ position: "relative" }}>
//                   <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }} />
//                   <input
//                     value={poolQuery}
//                     onChange={(e) => setPoolQuery(e.target.value)}
//                     placeholder="Search tasks..."
//                     style={{ ...inputBase, paddingLeft: 36 }}
//                   />
//                 </div>
//               </div>

//               <div style={{ padding: 14, display: "grid", gap: 10, maxHeight: "calc(100vh - 330px)", overflow: "auto" }}>
//                 {poolTasks.length === 0 ? (
//                   <div
//                     style={{
//                       borderRadius: 16,
//                       border: "1.5px dashed var(--border-strong)",
//                       background: "var(--surface-2)",
//                       padding: "28px 16px",
//                       textAlign: "center",
//                     }}
//                   >
//                     <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
//                     <p style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
//                       No tasks in pool
//                     </p>
//                     <p style={{ fontSize: 12, color: "var(--muted)" }}>
//                       Create a task or unassign one from staff
//                     </p>
//                   </div>
//                 ) : (
//                   poolTasks.map((task) => (
//                     <DraggableTaskChip
//                       key={task.id}
//                       task={task}
//                       allStaff={staff}
//                       onDelete={() => deleteTask(task.id)}
//                     />
//                   ))
//                 )}
//               </div>
//             </aside>

//             <section className="surface-card" style={{ overflow: "hidden" }}>
//               <div
//                 style={{
//                   padding: "16px 16px 14px",
//                   borderBottom: "1px solid var(--border)",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   gap: 14,
//                   flexWrap: "wrap",
//                 }}
//               >
//                 <div>
//                   <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
//                     <div
//                       style={{
//                         width: 38,
//                         height: 38,
//                         borderRadius: 14,
//                         background: "var(--primary-soft)",
//                         color: "var(--primary)",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                       }}
//                     >
//                       <Users size={18} />
//                     </div>
//                     <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Task Assignment Board</h2>
//                   </div>

//                   <div
//                     style={{
//                       display: "flex",
//                       gap: 7,
//                       alignItems: "center",
//                       padding: "6px 12px",
//                       borderRadius: 999,
//                       background: "var(--surface-2)",
//                       border: "1px solid var(--border)",
//                       color: "var(--muted)",
//                       fontSize: 11.5,
//                       fontWeight: 700,
//                       width: "fit-content",
//                     }}
//                   >
//                     Drag task from left
//                     <ArrowRight size={13} style={{ color: "var(--primary)" }} />
//                     Drop on staff card
//                   </div>
//                 </div>

//                 <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
//                   <div style={{ position: "relative", minWidth: 240 }}>
//                     <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }} />
//                     <input
//                       value={staffQuery}
//                       onChange={(e) => setStaffQuery(e.target.value)}
//                       placeholder="Search staff..."
//                       style={{ ...inputBase, paddingLeft: 36 }}
//                     />
//                   </div>

//                   <div style={{ position: "relative", minWidth: 170 }}>
//                     <Filter size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }} />
//                     <select
//                       value={attFilter}
//                       onChange={(e) => setAttFilter(e.target.value as AttStatus | "All")}
//                       style={{ ...inputBase, paddingLeft: 36 }}
//                     >
//                       <option value="All">All attendance</option>
//                       <option value="Present">Present</option>
//                       <option value="Late">Late</option>
//                       <option value="Absent">Absent</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               <div
//                 style={{
//                   padding: "12px 16px",
//                   borderBottom: "1px solid var(--border)",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: 8,
//                   flexWrap: "wrap",
//                 }}
//               >
//                 <Badge label={`Present ${attStats.present}`} color="var(--success)" bg="var(--success-soft)" border="rgba(12,166,120,.20)" />
//                 <Badge label={`Late ${attStats.late}`} color="var(--warning)" bg="var(--warning-soft)" border="rgba(230,119,0,.20)" />
//                 <Badge label={`Absent ${attStats.absent}`} color="var(--danger)" bg="var(--danger-soft)" border="rgba(224,49,49,.20)" />
//               </div>

//               <div style={{ padding: 14 }}>
//                 {staffLoading ? (
//                   <div
//                     style={{
//                       borderRadius: 16,
//                       border: "1.5px dashed var(--border-strong)",
//                       background: "var(--surface-2)",
//                       padding: "36px 16px",
//                       textAlign: "center",
//                       fontSize: 14,
//                       fontWeight: 700,
//                       color: "var(--muted)",
//                     }}
//                   >
//                     Loading staff...
//                   </div>
//                 ) : staffError ? (
//                   <div
//                     style={{
//                       borderRadius: 16,
//                       border: "1px solid rgba(224,49,49,.20)",
//                       background: "var(--danger-soft)",
//                       padding: "16px",
//                       textAlign: "center",
//                       fontSize: 13,
//                       fontWeight: 700,
//                       color: "var(--danger)",
//                     }}
//                   >
//                     {staffError}
//                   </div>
//                 ) : filteredStaff.length === 0 ? (
//                   <div
//                     style={{
//                       borderRadius: 16,
//                       border: "1.5px dashed var(--border-strong)",
//                       background: "var(--surface-2)",
//                       padding: "36px 16px",
//                       textAlign: "center",
//                     }}
//                   >
//                     <div style={{ fontSize: 28, marginBottom: 8 }}>🔎</div>
//                     <p style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
//                       No staff found
//                     </p>
//                     <p style={{ fontSize: 12, color: "var(--muted)" }}>
//                       Try changing the search or attendance filter.
//                     </p>
//                   </div>
//                 ) : (
//                   <AnimatePresence mode="wait">
//                     <motion.div
//                       key={`${staffPage}-${staffQuery}-${attFilter}`}
//                       initial={{ opacity: 0, y: 8 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       exit={{ opacity: 0, y: -8 }}
//                       transition={{ duration: 0.2 }}
//                       style={{
//                         display: "grid",
//                         gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))",
//                         gap: 12,
//                       }}
//                     >
//                       {pagedStaff.map((member) => (
//                         <DroppableStaffCard
//                           key={member.id}
//                           staff={member}
//                           tasks={getStaffTasks(member.id)}
//                           isOver={overStaffId === member.id}
//                           onRemoveTask={unassignTask}
//                           onStatusChange={updateStatus}
//                         />
//                       ))}
//                     </motion.div>
//                   </AnimatePresence>
//                 )}
//               </div>

//               <Pagination
//                 page={staffPage}
//                 total={filteredStaff.length}
//                 perPage={PER_PAGE}
//                 onChange={setStaffPage}
//                 label={`${filteredStaff.length} staff`}
//               />
//             </section>
//           </div>

//           <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
//             {activeTask && <TaskGhost task={activeTask} allStaff={staff} />}
//           </DragOverlay>
//         </DndContext>
//       </main>

//       <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={createTask} />
//     </div>
//   );
// }




























"use client";

import * as React from "react";
import { useSession, signOut } from "next-auth/react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import {
  GripVertical,
  Plus,
  Trash2,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ClipboardList,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Users,
  Filter,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Zap,
  Loader2,
  RefreshCw,
  Briefcase,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────── */
/* Theme                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */
const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400;1,9..144,600&display=swap');

    :root {
      --bg: #f0f2f8;
      --bg-dots: rgba(100,116,139,0.06);
      --bg-2: #e8ebf4;
      --surface: #ffffff;
      --surface-2: #f7f8fc;
      --surface-3: #eef0f7;
      --surface-hover: #f2f4fb;
      --border: #e2e6f3;
      --border-strong: #c8cfe8;
      --text: #0d1526;
      --text-2: #2d3a54;
      --muted: #5e6e8a;
      --muted-2: #94a3b8;
      --primary: #3b5bdb;
      --primary-2: #2f4bc0;
      --primary-light: #748ffc;
      --primary-soft: rgba(59,91,219,.10);
      --primary-border: rgba(59,91,219,.18);
      --success: #0ca678;
      --success-soft: rgba(12,166,120,.10);
      --warning: #e67700;
      --warning-soft: rgba(230,119,0,.10);
      --danger: #e03131;
      --danger-soft: rgba(224,49,49,.10);
      --violet: #7048e8;
      --violet-soft: rgba(112,72,232,.10);
      --cyan: #0c8599;
      --cyan-soft: rgba(12,133,153,.10);

      --shadow-xs: 0 1px 3px rgba(13,21,38,.04), 0 1px 2px rgba(13,21,38,.03);
      --shadow-sm: 0 4px 16px rgba(13,21,38,.06), 0 1px 4px rgba(13,21,38,.04);
      --shadow-md: 0 8px 32px rgba(13,21,38,.09), 0 2px 8px rgba(13,21,38,.05);
      --shadow-lg: 0 20px 60px rgba(13,21,38,.14), 0 4px 16px rgba(13,21,38,.07);
      --shadow-glow: 0 0 0 3px rgba(59,91,219,.12);

      --radius-sm: 10px;
      --radius-md: 16px;
      --radius-lg: 22px;
      --radius-xl: 28px;

      --header-bg-start: #0d1b3e;
      --header-bg-mid: #162352;
      --header-bg-end: #1a3373;
      --header-accent: rgba(116,143,252,0.15);

      --transition: all .2s cubic-bezier(.4,0,.2,1);
    }

    [data-theme="dark"] {
      --bg: #0a0e1a;
      --bg-dots: rgba(116,143,252,0.07);
      --bg-2: #0e1322;
      --surface: #111827;
      --surface-2: #161d2e;
      --surface-3: #1c2438;
      --surface-hover: #1a2236;
      --border: #1f2c44;
      --border-strong: #2a3a55;
      --text: #e8eef8;
      --text-2: #b8c8e0;
      --muted: #7a90af;
      --muted-2: #4a5e7a;
      --primary: #748ffc;
      --primary-2: #8fa3ff;
      --primary-light: #a5b8ff;
      --primary-soft: rgba(116,143,252,.14);
      --primary-border: rgba(116,143,252,.22);
      --success: #20c997;
      --success-soft: rgba(32,201,151,.12);
      --warning: #ffa94d;
      --warning-soft: rgba(255,169,77,.12);
      --danger: #ff6b6b;
      --danger-soft: rgba(255,107,107,.12);
      --violet: #9775fa;
      --violet-soft: rgba(151,117,250,.12);
      --cyan: #22d3ee;
      --cyan-soft: rgba(34,211,238,.12);

      --shadow-xs: 0 1px 3px rgba(0,0,0,.3), 0 1px 2px rgba(0,0,0,.2);
      --shadow-sm: 0 4px 16px rgba(0,0,0,.35), 0 1px 4px rgba(0,0,0,.2);
      --shadow-md: 0 8px 32px rgba(0,0,0,.45), 0 2px 8px rgba(0,0,0,.25);
      --shadow-lg: 0 20px 60px rgba(0,0,0,.55), 0 4px 16px rgba(0,0,0,.3);
      --shadow-glow: 0 0 0 3px rgba(116,143,252,.18);

      --header-bg-start: #050912;
      --header-bg-mid: #0a1225;
      --header-bg-end: #0e1a38;
      --header-accent: rgba(116,143,252,0.12);
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      background: var(--bg);
      color: var(--text);
      transition: background .3s ease, color .3s ease;
    }

    body {
      background-image: radial-gradient(var(--bg-dots) 1px, transparent 1px);
      background-size: 24px 24px;
    }

    .display-font {
      font-family: 'Fraunces', Georgia, serif !important;
    }

    * {
      font-family: 'DM Sans', system-ui, sans-serif;
    }

    input, select, textarea, button {
      font-family: 'DM Sans', system-ui, sans-serif;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: var(--shadow-glow);
    }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background: var(--border-strong);
      border-radius: 999px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--muted-2);
    }

    .surface-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      transition: var(--transition);
    }

    .surface-card:hover {
      border-color: var(--border-strong);
      box-shadow: var(--shadow-md);
    }

    .hero-gradient {
      background: linear-gradient(135deg, var(--header-bg-start) 0%, var(--header-bg-mid) 50%, var(--header-bg-end) 100%);
    }

    .hero-shine::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 60% 50% at 20% 30%, rgba(116,143,252,.12) 0%, transparent 60%),
        radial-gradient(ellipse 40% 40% at 80% 10%, rgba(167,139,250,.08) 0%, transparent 50%);
      pointer-events: none;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .fade-up-1 { animation: fadeUp .35s .05s both; }
    .fade-up-2 { animation: fadeUp .35s .12s both; }
    .fade-up-3 { animation: fadeUp .35s .20s both; }

    .theme-toggle {
      cursor: pointer;
      transition: var(--transition);
    }
    .theme-toggle:hover {
      transform: rotate(20deg) scale(1.1);
    }

    .glass-card {
      background: rgba(255,255,255,.06);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,.10);
    }

    .status-pill {
      transition: var(--transition);
    }
    .status-pill:hover {
      transform: translateY(-1px);
      filter: brightness(1.08);
    }

    .staff-card-inner {
      transition: var(--transition);
    }

    .task-chip:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md) !important;
    }
  `}</style>
);

/* ────────────────────────────────────────────────────────────────────────── */
/* Types                                                                    */
/* ────────────────────────────────────────────────────────────────────────── */
type TaskStatus = "Pending" | "In Progress" | "Done";
type TaskPriority = "High" | "Medium" | "Low";
type AttStatus = "Present" | "Absent" | "Late";

type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  subject: string;
  assignedTo: string | null;
};

type Staff = {
  id: string;
  staffId: string;
  name: string;
  role: string;
  subject: string;
  image: string;
  attendance: AttStatus;
  email?: string;
  phone?: string;
  branch?: string;
};

type ApiStaff = {
  id?: number | string;
  staffId?: number | string;
  fullName?: string;
  name?: string;
  role?: string;
  branch?: string;
  status?: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
};

type ApiTask = {
  id?: number | string;
  title?: string;
  description?: string;
  dueDate?: string;
  status?: string;
  priority?: string;
  subject?: string;
  assignedTo?: number | string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const PER_PAGE = 6;

/* ────────────────────────────────────────────────────────────────────────── */
/* Helpers                                                                   */
/* ────────────────────────────────────────────────────────────────────────── */
const priorityConfig = (p: TaskPriority) => ({
  High:   { color: "var(--danger)",  bg: "var(--danger-soft)",  border: "rgba(224,49,49,.20)", icon: "●" },
  Medium: { color: "var(--warning)", bg: "var(--warning-soft)", border: "rgba(230,119,0,.20)", icon: "◐" },
  Low:    { color: "var(--muted)",   bg: "var(--surface-3)",    border: "var(--border)",        icon: "○" },
}[p]);

const attConfig = (s: AttStatus) => ({
  Present: { color: "var(--success)", bg: "var(--success-soft)", border: "rgba(12,166,120,.20)", dot: "var(--success)" },
  Late:    { color: "var(--warning)", bg: "var(--warning-soft)", border: "rgba(230,119,0,.20)",  dot: "var(--warning)" },
  Absent:  { color: "var(--danger)",  bg: "var(--danger-soft)",  border: "rgba(224,49,49,.20)",  dot: "var(--danger)"  },
}[s]);

const statusConfig = (s: TaskStatus) => ({
  Done:         { color: "var(--success)", bg: "var(--success-soft)", border: "rgba(12,166,120,.20)" },
  "In Progress":{ color: "var(--primary)", bg: "var(--primary-soft)", border: "var(--primary-border)" },
  Pending:      { color: "var(--warning)", bg: "var(--warning-soft)", border: "rgba(230,119,0,.20)" },
}[s]);

const subjectPalette: Record<string, { color: string; light: string }> = {
  "Main Branch": { color: "#3b5bdb", light: "rgba(59,91,219,.14)" },
  Store:         { color: "#0ca678", light: "rgba(12,166,120,.14)" },
  Support:       { color: "#7048e8", light: "rgba(112,72,232,.14)" },
  Cashier:       { color: "#e67700", light: "rgba(230,119,0,.14)" },
  Warehouse:     { color: "#0c8599", light: "rgba(12,133,153,.14)" },
};
const getSubject = (s: string) => subjectPalette[s] ?? { color: "#64748b", light: "rgba(100,116,139,.14)" };

const inputBase: React.CSSProperties = {
  width: "100%",
  height: 42,
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--surface-2)",
  color: "var(--text)",
  padding: "0 12px",
  fontSize: 13.5,
  fontWeight: 500,
  transition: "all .18s ease",
};

function normalizeTaskStatus(value?: string): TaskStatus {
  const v = String(value || "Pending").trim().toLowerCase();
  if (v === "done") return "Done";
  if (v === "in progress" || v === "in_progress") return "In Progress";
  return "Pending";
}

function normalizeTaskPriority(value?: string): TaskPriority {
  const v = String(value || "Medium").trim().toLowerCase();
  if (v === "high") return "High";
  if (v === "low") return "Low";
  return "Medium";
}

function mapApiTaskToTask(task: ApiTask): Task {
  return {
    id: String(task.id ?? crypto.randomUUID()),
    title: task.title || "Untitled Task",
    description: task.description || "",
    dueDate: task.dueDate || "05:00 PM",
    status: normalizeTaskStatus(task.status),
    priority: normalizeTaskPriority(task.priority),
    subject: task.subject || "Main Branch",
    assignedTo: task.assignedTo != null ? String(task.assignedTo) : null,
  };
}

function mapApiStaffToTaskStaff(staff: ApiStaff): Staff {
  const name = staff.fullName || staff.name || "Unknown Staff";

  const image =
    staff.imageUrl && String(staff.imageUrl).startsWith("http")
      ? String(staff.imageUrl)
      : staff.imageUrl
        ? `${API_BASE_URL}${staff.imageUrl}`
        : `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}`;

  const rawStatus = String(staff.status || "active").toLowerCase();
  let attendance: AttStatus = "Present";
  if (rawStatus === "inactive") attendance = "Absent";
  else if (rawStatus === "on_leave") attendance = "Late";

  return {
    id: String(staff.id ?? staff.staffId ?? crypto.randomUUID()),
    staffId: String(staff.staffId ?? staff.id ?? "—"),
    name,
    role: staff.role || "Staff",
    subject: staff.branch || "Main Branch",
    image,
    attendance,
    email: staff.email || "—",
    phone: staff.phone || "—",
    branch: staff.branch || "Main Branch",
  };
}

async function parseError(res: Response, fallback: string) {
  try {
    const text = await res.text();
    return text || fallback;
  } catch {
    return fallback;
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Badge                                                                     */
/* ────────────────────────────────────────────────────────────────────────── */
function Badge({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
  return (
    <span
      className="status-pill"
      style={{
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: ".03em",
        color,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 999,
        padding: "3px 9px",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {label}
    </span>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Draggable Task Chip                                                       */
/* ────────────────────────────────────────────────────────────────────────── */
function DraggableTaskChip({
  task,
  allStaff,
  onDelete,
  actionLoading,
}: {
  task: Task;
  allStaff: Staff[];
  onDelete: () => void;
  actionLoading?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const assignedStaff = allStaff.find((s) => s.id === task.assignedTo) ?? null;
  const priority = priorityConfig(task.priority);
  const status = statusConfig(task.status);
  const subject = getSubject(task.subject);

  return (
    <div
      ref={setNodeRef}
      className="task-chip"
      style={{
        background: "var(--surface)",
        border: isDragging ? `1px solid var(--primary)` : "1px solid var(--border)",
        borderLeft: `3px solid ${subject.color}`,
        borderRadius: 14,
        padding: "12px 12px 12px 10px",
        opacity: isDragging ? 0.3 : actionLoading ? 0.7 : 1,
        boxShadow: isDragging ? "var(--shadow-lg)" : "var(--shadow-xs)",
        transition: "all .18s ease",
        display: "flex",
        gap: 8,
        alignItems: "flex-start",
        cursor: "default",
      }}
    >
      <button
        {...listeners}
        {...attributes}
        disabled={actionLoading}
        style={{
          border: "none",
          background: "transparent",
          color: "var(--muted-2)",
          cursor: actionLoading ? "not-allowed" : "grab",
          paddingTop: 2,
          flexShrink: 0,
          display: "flex",
        }}
      >
        <GripVertical size={15} />
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 7,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", lineHeight: 1.35, marginBottom: 3 }}>
              {task.title}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "var(--muted)",
                lineHeight: 1.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {task.description || "No description"}
            </p>
          </div>

          <button
            onClick={onDelete}
            disabled={actionLoading}
            style={{
              width: 26,
              height: 26,
              flexShrink: 0,
              borderRadius: 8,
              border: "1px solid var(--danger-soft)",
              background: "var(--danger-soft)",
              color: "var(--danger)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "var(--transition)",
              cursor: actionLoading ? "not-allowed" : "pointer",
              opacity: actionLoading ? 0.65 : 1,
            }}
          >
            {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
          </button>
        </div>

        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
          <Badge label={`${priority.icon} ${task.priority}`} color={priority.color} bg={priority.bg} border={priority.border} />
          <Badge label={task.status} color={status.color} bg={status.bg} border={status.border} />
          <Badge label={task.subject} color={subject.color} bg={subject.light} border={subject.color + "30"} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 5, alignItems: "center", minWidth: 0 }}>
            {assignedStaff ? (
              <>
                <img
                  src={assignedStaff.image}
                  alt={assignedStaff.name}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: "1.5px solid var(--border)",
                    background: "var(--surface-2)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-2)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 100,
                  }}
                >
                  {assignedStaff.name}
                </span>
              </>
            ) : (
              <span
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "1.5px dashed var(--muted-2)",
                    display: "inline-block",
                  }}
                />
                Unassigned
              </span>
            )}
          </div>

          <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--muted-2)", flexShrink: 0 }}>
            ⏱ {task.dueDate}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Task Ghost                                                                */
/* ────────────────────────────────────────────────────────────────────────── */
function TaskGhost({ task, allStaff }: { task: Task; allStaff: Staff[] }) {
  return (
    <div style={{ width: 320, transform: "rotate(2deg)" }}>
      <DraggableTaskChip task={task} allStaff={allStaff} onDelete={() => undefined} />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Droppable Staff Card                                                      */
/* ────────────────────────────────────────────────────────────────────────── */
function DroppableStaffCard({
  staff,
  tasks,
  isOver,
  onRemoveTask,
  onStatusChange,
  actionTaskId,
}: {
  staff: Staff;
  tasks: Task[];
  isOver: boolean;
  onRemoveTask: (id: string) => void;
  onStatusChange: (id: string, s: TaskStatus) => void;
  actionTaskId: string | null;
}) {
  const { setNodeRef } = useDroppable({ id: `staff-${staff.id}`, data: { staffId: staff.id } });
  const badge = attConfig(staff.attendance);
  const [expanded, setExpanded] = React.useState(false);

  const doneCount = tasks.filter((t) => t.status === "Done").length;
  const progress = tasks.length === 0 ? 0 : (doneCount / tasks.length) * 100;
  const roleColor = staff.role.toLowerCase() === "admin" ? "var(--violet)" : "var(--primary)";

  return (
    <div
      ref={setNodeRef}
      className="staff-card-inner"
      style={{
        borderRadius: 18,
        background: "var(--surface)",
        border: isOver ? "1.5px solid var(--primary)" : "1px solid var(--border)",
        boxShadow: isOver ? "var(--shadow-glow), var(--shadow-md)" : "var(--shadow-xs)",
        overflow: "hidden",
        transition: "all .18s ease",
      }}
    >
      <div
        onClick={() => setExpanded((v) => !v)}
        style={{
          padding: "14px 14px 12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: isOver ? "var(--primary-soft)" : "transparent",
          transition: "background .18s ease",
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              border: "1.5px solid var(--border)",
              background: "var(--surface-2)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img src={staff.image} alt={staff.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <span
            style={{
              position: "absolute",
              right: -2,
              bottom: -2,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: badge.dot,
              border: "2px solid var(--surface)",
            }}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 3 }}>
            <p
              style={{
                fontSize: 13.5,
                fontWeight: 700,
                color: "var(--text)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 150,
              }}
            >
              {staff.name}
            </p>
            <Badge label={staff.attendance} color={badge.color} bg={badge.bg} border={badge.border} />
          </div>

          <p style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 500, marginBottom: 8 }}>
            <span style={{ color: roleColor, fontWeight: 700 }}>{staff.role}</span>
            {" · "}
            {staff.subject}
            {" · "}
            <span style={{ color: "var(--muted-2)" }}>{staff.staffId}</span>
          </p>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1, height: 5, borderRadius: 999, background: "var(--surface-3)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background:
                    progress === 100
                      ? "linear-gradient(90deg, var(--success), #34d399)"
                      : "linear-gradient(90deg, var(--primary), var(--primary-light))",
                  borderRadius: 999,
                  transition: "width .4s cubic-bezier(.4,0,.2,1)",
                }}
              />
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", flexShrink: 0 }}>
              {doneCount}/{tasks.length}
            </span>
          </div>
        </div>

        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 10,
            background: "var(--surface-3)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted)",
            flexShrink: 0,
          }}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {isOver && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            margin: "0 14px 10px",
            padding: "9px 12px",
            borderRadius: 12,
            border: "1.5px dashed var(--primary)",
            background: "var(--primary-soft)",
            color: "var(--primary)",
            fontSize: 12,
            fontWeight: 700,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Zap size={13} />
          Assign to {staff.name}
        </motion.div>
      )}

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 14px 14px" }}>
              <div
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>
                    <Briefcase size={14} /> {staff.branch || staff.subject}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>
                    <Mail size={14} /> {staff.email || "—"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>
                    <Phone size={14} /> {staff.phone || "—"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>
                    <MapPin size={14} /> Staff ID: {staff.staffId}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {tasks.length === 0 ? (
                  <div
                    style={{
                      padding: "14px 12px",
                      borderRadius: 12,
                      border: "1px dashed var(--border-strong)",
                      background: "var(--surface-2)",
                      textAlign: "center",
                      color: "var(--muted)",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    No tasks assigned yet
                  </div>
                ) : (
                  tasks.map((task) => {
                    const status = statusConfig(task.status);
                    const isBusy = actionTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        style={{
                          borderRadius: 12,
                          border: "1px solid var(--border)",
                          background: "var(--surface)",
                          padding: 10,
                          opacity: isBusy ? 0.7 : 1,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)" }}>{task.title}</p>
                            <p style={{ fontSize: 11, color: "var(--muted)" }}>{task.dueDate}</p>
                          </div>
                          <button
                            onClick={() => onRemoveTask(task.id)}
                            disabled={isBusy}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 8,
                              border: "1px solid var(--danger-soft)",
                              background: "var(--danger-soft)",
                              color: "var(--danger)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: isBusy ? "not-allowed" : "pointer",
                              flexShrink: 0,
                            }}
                          >
                            {isBusy ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                          </button>
                        </div>

                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                          <Badge label={task.status} color={status.color} bg={status.bg} border={status.border} />
                        </div>

                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {(["Pending", "In Progress", "Done"] as TaskStatus[]).map((next) => (
                            <button
                              key={next}
                              onClick={() => onStatusChange(task.id, next)}
                              disabled={isBusy}
                              style={{
                                borderRadius: 999,
                                border: task.status === next ? `1px solid ${status.color}` : "1px solid var(--border)",
                                background: task.status === next ? status.bg : "var(--surface-2)",
                                color: task.status === next ? status.color : "var(--muted)",
                                padding: "5px 9px",
                                fontSize: 10.5,
                                fontWeight: 700,
                                cursor: isBusy ? "not-allowed" : "pointer",
                              }}
                            >
                              {next}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Pagination                                                                */
/* ────────────────────────────────────────────────────────────────────────── */
function Pagination({
  page,
  total,
  perPage,
  onChange,
  label,
}: {
  page: number;
  total: number;
  perPage: number;
  onChange: (page: number) => void;
  label: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div
      style={{
        padding: "14px 16px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>
        {label}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: page === 1 ? 0.45 : 1,
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={15} />
        </button>

        <div
          style={{
            minWidth: 88,
            height: 34,
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--surface-2)",
            color: "var(--text-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            padding: "0 12px",
          }}
        >
          Page {page} / {totalPages}
        </div>

        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: page === totalPages ? 0.45 : 1,
            cursor: "pointer",
          }}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Create Modal                                                              */
/* ────────────────────────────────────────────────────────────────────────── */
function CreateModal({
  open,
  onClose,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, "id">) => Promise<void> | void;
  submitting: boolean;
}) {
  const [form, setForm] = React.useState<Omit<Task, "id">>({
    title: "",
    description: "",
    dueDate: "",
    status: "Pending",
    priority: "Medium",
    subject: "Main Branch",
    assignedTo: null,
  });

  React.useEffect(() => {
    if (!open) {
      setForm({
        title: "",
        description: "",
        dueDate: "",
        status: "Pending",
        priority: "Medium",
        subject: "Main Branch",
        assignedTo: null,
      });
    }
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    if (!form.title.trim() || submitting) return;
    await onSubmit({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate || "05:00 PM",
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.35)",
          backdropFilter: "blur(4px)",
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
        onClick={submitting ? undefined : onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 18, scale: .96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: .96 }}
          transition={{ duration: .18 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: 520,
            borderRadius: 24,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Create Task</h3>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Add a new task to the task pool</p>
            </div>

            <button
              onClick={onClose}
              disabled={submitting}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                color: "var(--text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: 20, display: "grid", gap: 12 }}>
            <input
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              style={inputBase}
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              style={{ ...inputBase, minHeight: 96, padding: 12, resize: "vertical" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                placeholder="Due time (e.g. 03:00 PM)"
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                style={inputBase}
              />
              <select
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as TaskPriority }))}
                style={inputBase}
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <input
              placeholder="Subject / Branch"
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              style={inputBase}
            />
          </div>

          <div
            style={{
              padding: 20,
              borderTop: "1px solid var(--border)",
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <button
              onClick={onClose}
              disabled={submitting}
              style={{
                height: 42,
                padding: "0 16px",
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                color: "var(--text)",
                fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>

            <button
              onClick={submit}
              disabled={submitting}
              style={{
                height: 42,
                padding: "0 16px",
                borderRadius: 12,
                border: "1px solid var(--primary)",
                background: "var(--primary)",
                color: "white",
                fontWeight: 700,
                cursor: submitting ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Create Task
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Main App                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */
export default function TasksPage() {
  const { data: session, status: sessionStatus } = useSession();

  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [tasksLoading, setTasksLoading] = React.useState(true);
  const [staffLoading, setStaffLoading] = React.useState(true);
  const [pageError, setPageError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [creatingTask, setCreatingTask] = React.useState(false);
  const [actionTaskId, setActionTaskId] = React.useState<string | null>(null);

  const [poolQuery, setPoolQuery] = React.useState("");
  const [staffQuery, setStaffQuery] = React.useState("");
  const [attFilter, setAttFilter] = React.useState<AttStatus | "All">("All");

  const [createOpen, setCreateOpen] = React.useState(false);
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  const [overStaffId, setOverStaffId] = React.useState<string | null>(null);
  const [staffPage, setStaffPage] = React.useState(1);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const accessToken = (session as any)?.accessToken as string | undefined;

  const handleUnauthorized = React.useCallback(async () => {
    setPageError("Session expired. Please sign in again.");
    await signOut({ callbackUrl: "/sign_in" });
  }, []);

  const fetchTasks = React.useCallback(async () => {
    if (!accessToken) {
      setTasks([]);
      setTasksLoading(false);
      return;
    }

    try {
      setTasksLoading(true);
      setPageError(null);

      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      if (res.status === 401) {
        await handleUnauthorized();
        return;
      }

      if (!res.ok) {
        throw new Error(await parseError(res, `Failed to load tasks (${res.status})`));
      }

      const data = await res.json();
      setTasks(Array.isArray(data) ? data.map(mapApiTaskToTask) : []);
    } catch (e) {
      setTasks([]);
      setPageError(e instanceof Error ? e.message : "Failed to load tasks");
    } finally {
      setTasksLoading(false);
    }
  }, [accessToken, handleUnauthorized]);

  const fetchStaff = React.useCallback(async (refresh = false) => {
    try {
      if (sessionStatus === "loading") return;

      if (!accessToken) {
        setStaff([]);
        setPageError("Session expired. Please sign in again.");
        setStaffLoading(false);
        return;
      }

      refresh ? setRefreshing(true) : setStaffLoading(true);
      setPageError(null);

      const res = await fetch(`${API_BASE_URL}/api/staff`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      if (res.status === 401) {
        await handleUnauthorized();
        return;
      }

      if (!res.ok) {
        throw new Error(await parseError(res, `Failed to load staff (${res.status})`));
      }

      const data = await res.json();
      setStaff(Array.isArray(data) ? data.map(mapApiStaffToTaskStaff) : []);
    } catch (e) {
      setStaff([]);
      setPageError(e instanceof Error ? e.message : "Failed to load staff");
    } finally {
      setStaffLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, sessionStatus, handleUnauthorized]);

  const reloadAll = React.useCallback(async () => {
    setPageError(null);
    await Promise.all([fetchTasks(), fetchStaff(true)]);
  }, [fetchTasks, fetchStaff]);

  React.useEffect(() => {
    if (sessionStatus === "authenticated" && accessToken) {
      setPageError(null);
      fetchTasks();
      fetchStaff();
    } else if (sessionStatus === "unauthenticated") {
      setTasks([]);
      setStaff([]);
      setTasksLoading(false);
      setStaffLoading(false);
      setPageError("Please sign in again.");
    }
  }, [sessionStatus, accessToken, fetchTasks, fetchStaff]);

  const poolTasks = React.useMemo(() => {
    const q = poolQuery.trim().toLowerCase();
    return tasks.filter(
      (t) =>
        !t.assignedTo &&
        (!q ||
          t.title.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q))
    );
  }, [tasks, poolQuery]);

  const filteredStaff = React.useMemo(() => {
    const q = staffQuery.trim().toLowerCase();
    return staff.filter(
      (s) =>
        (attFilter === "All" || s.attendance === attFilter) &&
        (!q ||
          s.name.toLowerCase().includes(q) ||
          s.subject.toLowerCase().includes(q) ||
          s.staffId.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q) ||
          (s.email || "").toLowerCase().includes(q) ||
          (s.phone || "").toLowerCase().includes(q))
    );
  }, [staff, staffQuery, attFilter]);

  const pagedStaff = filteredStaff.slice((staffPage - 1) * PER_PAGE, staffPage * PER_PAGE);

  React.useEffect(() => {
    setStaffPage(1);
  }, [staffQuery, attFilter]);

  const getStaffTasks = (id: string) => tasks.filter((t) => t.assignedTo === id);

  const createTask = async (task: Omit<Task, "id">) => {
    if (!accessToken) {
      await handleUnauthorized();
      return;
    }

    try {
      setCreatingTask(true);
      setPageError(null);

      const res = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          status: task.status,
          priority: task.priority,
          subject: task.subject,
          assignedTo: task.assignedTo ? Number(task.assignedTo) : null,
        }),
      });

      if (res.status === 401) {
        await handleUnauthorized();
        return;
      }

      if (!res.ok) {
        throw new Error(await parseError(res, "Failed to create task"));
      }

      setCreateOpen(false);
      await fetchTasks();
    } catch (e) {
      setPageError(e instanceof Error ? e.message : "Failed to create task");
    } finally {
      setCreatingTask(false);
    }
  };

  const deleteTask = async (id: string) => {
    if (!accessToken) {
      await handleUnauthorized();
      return;
    }

    try {
      setActionTaskId(id);
      setPageError(null);

      const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.status === 401) {
        await handleUnauthorized();
        return;
      }

      if (!res.ok) {
        throw new Error(await parseError(res, "Failed to delete task"));
      }

      await fetchTasks();
    } catch (e) {
      setPageError(e instanceof Error ? e.message : "Failed to delete task");
    } finally {
      setActionTaskId(null);
    }
  };

  const unassignTask = async (id: string) => {
    if (!accessToken) {
      await handleUnauthorized();
      return;
    }

    try {
      setActionTaskId(id);
      setPageError(null);

      const res = await fetch(`${API_BASE_URL}/api/tasks/${id}/unassign`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.status === 401) {
        await handleUnauthorized();
        return;
      }

      if (!res.ok) {
        throw new Error(await parseError(res, "Failed to unassign task"));
      }

      await fetchTasks();
    } catch (e) {
      setPageError(e instanceof Error ? e.message : "Failed to unassign task");
    } finally {
      setActionTaskId(null);
    }
  };

  const updateStatus = async (id: string, status: TaskStatus) => {
    if (!accessToken) {
      await handleUnauthorized();
      return;
    }

    try {
      setActionTaskId(id);
      setPageError(null);

      const res = await fetch(`${API_BASE_URL}/api/tasks/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.status === 401) {
        await handleUnauthorized();
        return;
      }

      if (!res.ok) {
        throw new Error(await parseError(res, "Failed to update task status"));
      }

      await fetchTasks();
    } catch (e) {
      setPageError(e instanceof Error ? e.message : "Failed to update task status");
    } finally {
      setActionTaskId(null);
    }
  };

  const assignTask = async (taskId: string, staffId: string) => {
    if (!accessToken) {
      await handleUnauthorized();
      return;
    }

    try {
      setActionTaskId(taskId);
      setPageError(null);

      const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/assign/${staffId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.status === 401) {
        await handleUnauthorized();
        return;
      }

      if (!res.ok) {
        throw new Error(await parseError(res, "Failed to assign task"));
      }

      await fetchTasks();
    } catch (e) {
      setPageError(e instanceof Error ? e.message : "Failed to assign task");
    } finally {
      setActionTaskId(null);
    }
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    done: tasks.filter((t) => t.status === "Done").length,
    unassigned: tasks.filter((t) => !t.assignedTo).length,
    totalStaff: staff.length,
  };

  const attStats = {
    present: staff.filter((s) => s.attendance === "Present").length,
    late: staff.filter((s) => s.attendance === "Late").length,
    absent: staff.filter((s) => s.attendance === "Absent").length,
  };

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const onDragStart = (e: DragStartEvent) => {
    setActiveTask(e.active.data.current?.task ?? null);
  };

  const onDragOver = (e: DragOverEvent) => {
    const id = e.over?.id ? String(e.over.id) : null;
    setOverStaffId(id?.startsWith("staff-") ? id.replace("staff-", "") : null);
  };

  const onDragEnd = async (e: DragEndEvent) => {
    setActiveTask(null);
    setOverStaffId(null);

    const { active, over } = e;
    if (!over) return;

    const taskId = String(active.id);
    const overId = String(over.id);

    if (overId.startsWith("staff-")) {
      const targetStaffId = overId.replace("staff-", "");
      await assignTask(taskId, targetStaffId);
    }
  };

  const statCards = [
    { label: "Total Tasks", value: stats.total, icon: <ClipboardList size={17} />, color: "var(--primary)", bg: "var(--primary-soft)" },
    { label: "Pending", value: stats.pending, icon: <Clock size={17} />, color: "var(--warning)", bg: "var(--warning-soft)" },
    { label: "In Progress", value: stats.inProgress, icon: <TrendingUp size={17} />, color: "var(--cyan)", bg: "var(--cyan-soft)" },
    { label: "Completed", value: stats.done, icon: <CheckCircle2 size={17} />, color: "var(--success)", bg: "var(--success-soft)" },
    { label: "Unassigned", value: stats.unassigned, icon: <AlertCircle size={17} />, color: "var(--danger)", bg: "var(--danger-soft)" },
    { label: "Staff", value: stats.totalStaff, icon: <Users size={17} />, color: "var(--violet)", bg: "var(--violet-soft)" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <FontImport />

      <header className="hero-gradient hero-shine" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "24px 20px 22px", position: "relative", zIndex: 1 }}>
          <div
            className="glass-card"
            style={{
              borderRadius: 28,
              padding: "18px 18px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div className="fade-up-1">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 16,
                    background: "rgba(255,255,255,.12)",
                    border: "1px solid rgba(255,255,255,.16)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <LayoutDashboard size={20} />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.75)", fontWeight: 700, letterSpacing: ".04em" }}>
                    TEAM WORKSPACE
                  </p>
                  <h1 className="display-font" style={{ fontSize: 28, color: "white", fontWeight: 700, lineHeight: 1.1 }}>
                    Staff Tasks Dashboard
                  </h1>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,.10)",
                    border: "1px solid rgba(255,255,255,.14)",
                    color: "white",
                    fontSize: 12.5,
                    fontWeight: 700,
                  }}
                >
                  <CalendarDays size={14} />
                  {today}
                </span>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,.10)",
                    border: "1px solid rgba(255,255,255,.14)",
                    color: "white",
                    fontSize: 12.5,
                    fontWeight: 700,
                  }}
                >
                  <Bell size={14} />
                  {stats.pending} pending
                </span>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,.10)",
                    border: "1px solid rgba(255,255,255,.14)",
                    color: "white",
                    fontSize: 12.5,
                    fontWeight: 700,
                  }}
                >
                  <Sparkles size={14} />
                  {stats.totalStaff} staff connected
                </span>
              </div>
            </div>

            <div className="fade-up-2" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <button
                className="theme-toggle"
                onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,.16)",
                  background: "rgba(255,255,255,.08)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
              </button>

              <button
                onClick={reloadAll}
                style={{
                  height: 42,
                  padding: "0 14px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,.16)",
                  background: "rgba(255,255,255,.08)",
                  color: "white",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                Refresh
              </button>

              <button
                onClick={() => setCreateOpen(true)}
                style={{
                  height: 42,
                  padding: "0 14px",
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,.16)",
                  background: "white",
                  color: "var(--primary)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                <Plus size={16} />
                New Task
              </button>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1440, margin: "0 auto", padding: "18px 20px 28px" }}>
        {sessionStatus === "loading" && (
          <div
            style={{
              borderRadius: 20,
              padding: "14px 16px",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--surface)",
              color: "var(--text-2)",
              fontWeight: 700,
              border: "1px solid var(--border)",
              marginBottom: 14,
            }}
          >
            <Loader2 className="animate-spin" size={16} />
            Checking session...
          </div>
        )}

        {(tasksLoading || staffLoading) && (
          <div
            style={{
              borderRadius: 20,
              padding: "14px 16px",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--surface)",
              color: "var(--text-2)",
              fontWeight: 700,
              border: "1px solid var(--border)",
              marginBottom: 14,
            }}
          >
            <Loader2 className="animate-spin" size={16} />
            Loading data...
          </div>
        )}

        {pageError && (
          <div
            style={{
              borderRadius: 20,
              padding: "14px 16px",
              fontSize: 13,
              background: "var(--danger-soft)",
              border: "1px solid rgba(224,49,49,.20)",
              color: "var(--danger)",
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            {pageError}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
            gap: 12,
            marginBottom: 18,
          }}
        >
          {statCards.map((card) => (
            <div
              key={card.label}
              className="surface-card"
              style={{
                padding: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: card.bg,
                  color: card.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </div>

              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>{card.label}</p>
                <p style={{ fontSize: 22, color: "var(--text)", fontWeight: 800, lineHeight: 1.1 }}>{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
          <div style={{ display: "grid", gridTemplateColumns: "380px minmax(0,1fr)", gap: 16, alignItems: "start" }}>
            <aside className="surface-card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  padding: 16,
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Task Pool</h2>
                  <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                    Drag any task onto a staff card
                  </p>
                </div>

                <button
                  onClick={() => setCreateOpen(true)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>

              <div style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
                <div style={{ position: "relative" }}>
                  <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }} />
                  <input
                    value={poolQuery}
                    onChange={(e) => setPoolQuery(e.target.value)}
                    placeholder="Search tasks..."
                    style={{ ...inputBase, paddingLeft: 36 }}
                  />
                </div>
              </div>

              <div style={{ padding: 14, display: "grid", gap: 10, maxHeight: "calc(100vh - 330px)", overflow: "auto" }}>
                {poolTasks.length === 0 ? (
                  <div
                    style={{
                      borderRadius: 16,
                      border: "1.5px dashed var(--border-strong)",
                      background: "var(--surface-2)",
                      padding: "28px 16px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
                      No tasks in pool
                    </p>
                    <p style={{ fontSize: 12, color: "var(--muted)" }}>
                      Create a task or unassign one from staff
                    </p>
                  </div>
                ) : (
                  poolTasks.map((task) => (
                    <DraggableTaskChip
                      key={task.id}
                      task={task}
                      allStaff={staff}
                      onDelete={() => deleteTask(task.id)}
                      actionLoading={actionTaskId === task.id}
                    />
                  ))
                )}
              </div>
            </aside>

            <section className="surface-card" style={{ overflow: "hidden" }}>
              <div
                style={{
                  padding: "16px 16px 14px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 14,
                        background: "var(--primary-soft)",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Users size={18} />
                    </div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Task Assignment Board</h2>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 7,
                      alignItems: "center",
                      padding: "6px 12px",
                      borderRadius: 999,
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      color: "var(--muted)",
                      fontSize: 11.5,
                      fontWeight: 700,
                      width: "fit-content",
                    }}
                  >
                    Drag task from left
                    <ArrowRight size={13} style={{ color: "var(--primary)" }} />
                    Drop on staff card
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ position: "relative", minWidth: 240 }}>
                    <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }} />
                    <input
                      value={staffQuery}
                      onChange={(e) => setStaffQuery(e.target.value)}
                      placeholder="Search staff..."
                      style={{ ...inputBase, paddingLeft: 36 }}
                    />
                  </div>

                  <div style={{ position: "relative", minWidth: 170 }}>
                    <Filter size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted-2)" }} />
                    <select
                      value={attFilter}
                      onChange={(e) => setAttFilter(e.target.value as AttStatus | "All")}
                      style={{ ...inputBase, paddingLeft: 36 }}
                    >
                      <option value="All">All attendance</option>
                      <option value="Present">Present</option>
                      <option value="Late">Late</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Badge label={`Present ${attStats.present}`} color="var(--success)" bg="var(--success-soft)" border="rgba(12,166,120,.20)" />
                <Badge label={`Late ${attStats.late}`} color="var(--warning)" bg="var(--warning-soft)" border="rgba(230,119,0,.20)" />
                <Badge label={`Absent ${attStats.absent}`} color="var(--danger)" bg="var(--danger-soft)" border="rgba(224,49,49,.20)" />
              </div>

              <div style={{ padding: 14 }}>
                {staffLoading ? (
                  <div
                    style={{
                      borderRadius: 16,
                      border: "1.5px dashed var(--border-strong)",
                      background: "var(--surface-2)",
                      padding: "36px 16px",
                      textAlign: "center",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--muted)",
                    }}
                  >
                    Loading staff...
                  </div>
                ) : filteredStaff.length === 0 ? (
                  <div
                    style={{
                      borderRadius: 16,
                      border: "1.5px dashed var(--border-strong)",
                      background: "var(--surface-2)",
                      padding: "36px 16px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🔎</div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
                      No staff found
                    </p>
                    <p style={{ fontSize: 12, color: "var(--muted)" }}>
                      Try changing the search or attendance filter.
                    </p>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${staffPage}-${staffQuery}-${attFilter}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))",
                        gap: 12,
                      }}
                    >
                      {pagedStaff.map((member) => (
                        <DroppableStaffCard
                          key={member.id}
                          staff={member}
                          tasks={getStaffTasks(member.id)}
                          isOver={overStaffId === member.id}
                          onRemoveTask={unassignTask}
                          onStatusChange={updateStatus}
                          actionTaskId={actionTaskId}
                        />
                      ))}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              <Pagination
                page={staffPage}
                total={filteredStaff.length}
                perPage={PER_PAGE}
                onChange={setStaffPage}
                label={`${filteredStaff.length} staff`}
              />
            </section>
          </div>

          <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
            {activeTask && <TaskGhost task={activeTask} allStaff={staff} />}
          </DragOverlay>
        </DndContext>
      </main>

      <CreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={createTask}
        submitting={creatingTask}
      />
    </div>
  );
}