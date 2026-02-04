
export function toLocal(iso: string) {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const da = pad(d.getDate());
    const h = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${y}-${m}-${da}T${h}:${mi}`;
  }



  /* API မှာ /auth/users မရရင် fallback တွေပြ */
 export const FALLBACK_EMPLOYEES: Array<{ id: string; name: string; dept?: string }> = [
    { id: "1001", name: "Aung Aung", dept: "Sales" },
    { id: "1002", name: "Su Su", dept: "Cashier" },
    { id: "1003", name: "Ko Ko", dept: "Stock" },
    { id: "2001", name: "Mia", dept: "HR" },
  ];
  