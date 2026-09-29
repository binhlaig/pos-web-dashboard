export type StockAddition = {
  requestId: string;
  operation: "ADD_STOCK";
  quantity: number;
};

export async function readProductResponse(response: Response) {
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { /* plain text error */ }
  if (!response.ok) {
    const message = body?.message || body?.detail || body?.error || text || response.statusText;
    throw new Error(`HTTP ${response.status}: ${message || "Request failed"}`);
  }
  return body?.data ?? body;
}

export function productEditData(form: Record<string, string>, image: File | null) {
  const data = new FormData();
  // Stock is managed exclusively through POST /{id}/stock.
  for (const key of ["sku", "product_name", "product_price", "product_discount", "barcode", "category", "product_type", "note"]) {
    data.append(key, (form[key] ?? "").trim());
  }
  if (image) data.append("image", image);
  return data;
}

export function validateAddition(value: string) {
  const quantity = Number(value || 0);
  if (!Number.isFinite(quantity) || quantity < 0 || quantity > 9999999999.99 ||
      !/^\d+(\.\d{1,2})?$/.test(value || "0")) {
    throw new Error("Stock to add must be non-negative, at most 9999999999.99, with up to 2 decimal places.");
  }
  return quantity;
}

// A single instance serializes submits; session storage preserves an uncertain
// stock operation across navigation/reload without storing authentication data.
export function createProductEditor(url: string, storage: Pick<Storage, "getItem" | "setItem" | "removeItem">, send = fetch) {
  const key = `product-stock-add:${url}`;
  let busy = false;
  function pending(): StockAddition | null {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }
  return {
    pending,
    async save(options: {
      authorization: string; data: FormData; quantity: number;
      onProductSaved: (product: any) => void;
      onStockPending: (request: StockAddition) => void;
      onStockSaved: (product: any) => void;
    }) {
      if (busy) return;
      busy = true;
      let productSaved = false;
      try {
        const headers = { Authorization: options.authorization, Accept: "application/json" };
        const product = await readProductResponse(await send(url, { method: "PUT", headers, body: options.data }));
        productSaved = true;
        options.onProductSaved(product);
        let request = pending();
        if (!request && options.quantity > 0) {
          request = { requestId: `stock_${crypto.randomUUID()}`, operation: "ADD_STOCK", quantity: options.quantity };
          // Persist BEFORE sending. If storage fails, no stock request is sent.
          storage.setItem(key, JSON.stringify(request));
        }
        if (request) {
          options.onStockPending(request);
          const updated = await readProductResponse(await send(`${url}/stock`, {
            method: "POST", headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify(request),
          }));
          storage.removeItem(key);
          options.onStockSaved(updated);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Network request failed";
        throw new Error(`${productSaved ? "Product details saved. Stock addition is not confirmed; retry Save Changes. " : "Product save failed. "}${message}`);
      } finally { busy = false; }
    },
  };
}
