import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function setup({ token = 'Bearer session-token', response = new Response('{"content":[]}', { status: 200 }), base = 'https://backend.test/api/' } = {}) {
  const calls = [];
  let bridged = false;
  const imports = {
    'next/server': { NextResponse: { json: Response.json } },
    'next-auth': { getServerSession: async () => ({ accessToken: token }) },
    '@/lib/next-auth': { authOptions: {} },
    '@/lib/session-cookie-bridge': { withRefreshCookieBridge: handler => { bridged = true; return handler; } },
  };
  const exports = {};
  const source = fs.readFileSync(new URL('../lib/factory-raw-proxy.ts', import.meta.url), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports, require: name => imports[name], Response, Headers, URL, AbortSignal, encodeURIComponent,
    process: { env: { REMOTE_API_BASE_URL: base } },
    fetch: async (...args) => { calls.push(args); return response; },
  });
  const proxy = exports.createFactoryRawProxy('raw-receivings');
  assert.equal(bridged, true);
  return { calls, run: async (suffix = '', method = 'GET', body, headers = {}) => {
    const url = `https://frontend.test/api/factory/raw-receivings${suffix}`;
    const req = new Request(url, { method, body, headers });
    req.nextUrl = new URL(url);
    return proxy(req, { params: Promise.resolve({ path: new URL(url).pathname.split('/').slice(4) }) });
  } };
}

test('forwards pagination and repeated filters with session authentication', async () => {
  const { run, calls } = setup();
  const result = await run('?page=0&size=15&status=DRAFT&status=CONFIRMED');
  assert.equal(result.status, 200);
  assert.equal(calls[0][0], 'https://backend.test/api/factory/raw-receivings?page=0&size=15&status=DRAFT&status=CONFIRMED');
  assert.equal(calls[0][1].headers.get('authorization'), 'Bearer session-token');
  assert.equal(calls[0][1].cache, 'no-store');
});

test('forwards confirm body, idempotency key, and backend validation errors', async () => {
  const { run, calls } = setup({ response: new Response('{"message":"Version conflict"}', { status: 409 }) });
  const body = '{"version":3}';
  const result = await run('/12/confirm', 'POST', body, { origin: 'https://frontend.test', 'content-type': 'application/json', 'idempotency-key': 'receipt-key' });
  assert.equal(calls[0][0], 'https://backend.test/api/factory/raw-receivings/12/confirm');
  assert.equal(new TextDecoder().decode(calls[0][1].body), body);
  assert.equal(calls[0][1].headers.get('idempotency-key'), 'receipt-key');
  assert.equal(result.status, 409);
  assert.deepEqual(await result.json(), { message: 'Version conflict' });
});

test('rejects missing sessions and cross-origin writes without contacting backend', async () => {
  const unauthenticated = setup({ token: null });
  assert.equal((await unauthenticated.run()).status, 401);
  assert.equal(unauthenticated.calls.length, 0);
  const crossOrigin = setup();
  assert.equal((await crossOrigin.run('', 'PUT', '{}', { origin: 'https://other.test' })).status, 403);
  assert.equal(crossOrigin.calls.length, 0);
});

test('preserves empty DELETE responses and normalizes base without /api', async () => {
  const { run, calls } = setup({ base: 'https://backend.test/', response: new Response(null, { status: 204 }) });
  const result = await run('/12?version=3', 'DELETE', undefined, { origin: 'https://frontend.test' });
  assert.equal(calls[0][0], 'https://backend.test/api/factory/raw-receivings/12?version=3');
  assert.equal(result.status, 204);
  assert.equal(await result.text(), '');
});
