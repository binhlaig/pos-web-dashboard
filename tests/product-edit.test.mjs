import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProductEditor, productEditData, validateAddition, readProductResponse } from '../lib/product-edit.ts';

const ok = () => Response.json({ remainingStock: 15 });
function storage() {
  const values = new Map();
  return { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k) };
}
function options(quantity = 0) {
  return { authorization: 'Bearer test-only', quantity,
    data: productEditData({ sku: 'SKU', product_name: 'Name', product_price: '20', product_quantity_amount: '10', note: '' }, null),
    onProductSaved() {}, onStockPending() {}, onStockSaved() {} };
}

test('details-only PUT omits stock, preserves multipart boundary and clears optional text', async () => {
  const calls = [];
  await createProductEditor('/api/products/1', storage(), async (url, init) => { calls.push({ url, ...init }); return ok(); }).save(options());
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, 'PUT');
  assert.equal(calls[0].headers.Authorization, 'Bearer test-only');
  assert.equal(calls[0].headers['Content-Type'], undefined);
  assert.equal(calls[0].body.has('product_quantity_amount'), false);
  assert.equal(calls[0].body.get('note'), '');
});

test('double submit sends one PUT and one ADD_STOCK delta', async () => {
  const calls = [];
  const editor = createProductEditor('/api/products/1', storage(), async (url, init) => { calls.push({ url, ...init }); return ok(); });
  await Promise.all([editor.save(options(5)), editor.save(options(5))]);
  assert.equal(calls.length, 2);
  assert.equal(calls[1].url, '/api/products/1/stock');
  assert.equal(calls[1].method, 'POST');
  assert.equal(calls[1].headers['Content-Type'], 'application/json');
  const body = JSON.parse(calls[1].body);
  assert.equal(body.operation, 'ADD_STOCK');
  assert.equal(body.quantity, 5);
  assert.match(body.requestId, /^[A-Za-z0-9_-]{1,100}$/);
  assert.equal(editor.pending(), null);
});

test('lost stock response, reload and retry reuse identical payload; next addition gets new ID', async () => {
  const store = storage(), requests = [], applied = new Set();
  let remaining = 10, loseResponse = true;
  const send = async (url, init) => {
    if (init.method === 'PUT') return ok();
    const body = JSON.parse(init.body);
    requests.push(body);
    if (!applied.has(body.requestId)) { remaining += body.quantity; applied.add(body.requestId); }
    if (loseResponse) { loseResponse = false; throw new TypeError('Failed to fetch'); }
    return Response.json({ remainingStock: remaining });
  };
  const editor = createProductEditor('/api/products/1', store, send);
  await assert.rejects(editor.save(options(5)), /Product details saved.*retry Save Changes.*Failed to fetch/);
  const restored = createProductEditor('/api/products/1', store, send);
  assert.equal(restored.pending().quantity, 5);
  await restored.save(options(999)); // Pending intent wins, even if input changes.
  assert.deepEqual(requests[0], requests[1]);
  assert.equal(remaining, 15);
  await restored.save(options(5));
  assert.notEqual(requests[1].requestId, requests[2].requestId);
  assert.equal(remaining, 20);
});

test('failed metadata PUT never sends stock and exposes HTTP status/message', async () => {
  let calls = 0;
  const editor = createProductEditor('/api/products/1', storage(), async () => {
    calls++; return Response.json({ message: 'Session expired' }, { status: 401 });
  });
  await assert.rejects(editor.save(options(5)), /HTTP 401: Session expired/);
  assert.equal(calls, 1);
  assert.equal(editor.pending(), null);
});

test('stock server error preserves request and reports partial save', async () => {
  const editor = createProductEditor('/api/products/1', storage(), async (url, init) =>
    init.method === 'PUT' ? ok() : Response.json({ message: 'Unavailable' }, { status: 503 }));
  await assert.rejects(editor.save(options(5)), /Product details saved.*HTTP 503: Unavailable/);
  assert.equal(editor.pending().quantity, 5);
});

test('stock cannot be sent if persistence fails', async () => {
  let calls = 0;
  const store = storage();
  store.setItem = () => { throw new Error('Storage unavailable'); };
  const editor = createProductEditor('/api/products/1', store, async () => { calls++; return ok(); });
  await assert.rejects(editor.save(options(5)), /Storage unavailable/);
  assert.equal(calls, 1);
});

test('quantity validation and plain text/empty/problem detail errors', async () => {
  for (const value of ['-1', 'NaN', 'Infinity', '1.001', '10000000000']) assert.throws(() => validateAddition(value));
  assert.equal(validateAddition('2.50'), 2.5);
  assert.equal(validateAddition(''), 0);
  await assert.rejects(readProductResponse(new Response('Forbidden', { status: 403 })), /HTTP 403: Forbidden/);
  await assert.rejects(readProductResponse(new Response('', { status: 500 })), /HTTP 500: Request failed/);
  await assert.rejects(readProductResponse(Response.json({ detail: 'Conflict' }, { status: 409 })), /HTTP 409: Conflict/);
});
