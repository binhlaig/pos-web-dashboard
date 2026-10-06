import { shopLocalInput } from "@/lib/date-time";

export function toLocal(iso: string) { return shopLocalInput(iso); }



  /* API မှာ /auth/users မရရင် fallback တွေပြ */
 export const FALLBACK_EMPLOYEES: Array<{ id: string; name: string; dept?: string }> = [
    { id: "1001", name: "Aung Aung", dept: "Sales" },
    { id: "1002", name: "Su Su", dept: "Cashier" },
    { id: "1003", name: "Ko Ko", dept: "Stock" },
    { id: "2001", name: "Mia", dept: "HR" },
  ];
  