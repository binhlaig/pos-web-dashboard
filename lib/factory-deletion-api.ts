/** Factory deletion endpoints from spring_pos_api FactoryDeletionController (V54/V55). */
export type FactoryDeletionModule = "warehouses" | "locations" | "receivings" | "costings" | "costing-items" | "productions" | "packing-products";
export type PackingIdentity = {
  costingSheetId: number; costingItemId: number; sourceVersion: number;
  warehouseId: number; locationId: number; batch: string;
  productions?: { id: number; version: number }[];
};
export type FactoryDeletePreview = {
  allowed: boolean;
  module?: FactoryDeletionModule;
  id?: number;
  version?: number;
  code?: string;
  message?: string;
  records?: Record<string, unknown>;
  inventory?: unknown;
  identity?: PackingIdentity;
  archiveVersion?: number;
  archived?: boolean;
};
export type FactoryDeleteResult = { deleted?: boolean; module?: FactoryDeletionModule; id?: number; [key: string]: unknown };
export class FactoryDeletionError extends Error {
  constructor(readonly status: number, readonly code: string, readonly details: unknown, message: string) { super(message); this.name = "FactoryDeletionError"; }
}
const base = "/api/factory/deletions";
async function request<T>(path: string, method: "GET" | "POST" | "DELETE", data?: object): Promise<T> {
  const response = await fetch(`${base}/${path}`, {
    method, credentials: "same-origin", cache: "no-store",
    headers: { Accept: "application/json", ...(data ? { "Content-Type": "application/json" } : {}) },
    ...(data ? { body: JSON.stringify(data) } : {}),
    signal: AbortSignal.timeout(30000),
  });
  const value = await response.json().catch(() => null);
  if (!response.ok) throw new FactoryDeletionError(response.status, value?.code || `HTTP_${response.status}`, value?.details, value?.details?.message || value?.message || "Factory operation failed");
  if (!value) throw new FactoryDeletionError(502, "INVALID_RESPONSE", null, "Server response could not be verified");
  return value as T;
}
function packQuery(key: PackingIdentity): string {
  const params = new URLSearchParams({
    costingSheetId: String(key.costingSheetId), sourceVersion: String(key.sourceVersion),
    warehouseId: String(key.warehouseId), locationId: String(key.locationId), batch: key.batch,
  });
  return params.toString();
}
export function previewFactoryDelete(module: FactoryDeletionModule, id: number, key?: PackingIdentity) {
  if (module === "packing-products" && !key) throw new Error("Packing identity required");
  return request<FactoryDeletePreview>(`${module}/${id}/eligibility${key ? `?${packQuery(key)}` : ""}`, "GET");
}
export function executeFactoryDelete(module: FactoryDeletionModule, id: number, version: number, requestId: string, reason: string, key?: PackingIdentity) {
  if (module === "packing-products" && !key) throw new Error("Packing identity required");
  return request<FactoryDeleteResult>(`${module}/${id}`, "DELETE", { version, requestId, reason, ...(key ? { key } : {}) });
}
export function archivePackingProduct(id: number, version: number, key: PackingIdentity, reason: string, restore = false) {
  return request<{ archived: boolean; version?: number }>(`packing-products/${id}/${restore ? "restore" : "archive"}`, "POST", { version, key, reason });
}
export function listArchivedPackingProducts() {
  return request<unknown[]>("packing-products/archives", "GET");
}
