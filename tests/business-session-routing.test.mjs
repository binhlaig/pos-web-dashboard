import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
function load(file, imports = {}, globals = {}) {
  const exports = {};
  const source = fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, { exports, require: name => name === '@/components/loading-screen' ? { LoadingScreen: 'LoadingScreen' } : imports[name], URL, URLSearchParams, Response, AbortController, fetch, window: { location: { pathname: '/dashboard/products', search: '?tab=1' } }, process: { env: {} }, ...globals });
  return exports;
}
const routing = load('lib/business-routing.ts');
const access = load('lib/business-access.ts', { './business-routing': routing });
const jsx = require('react/jsx-runtime');
function gateHarness({ area, entry = false, callback = '', businessType = 'FACTORY', status = 'authenticated' } = {}) {
  const states = [], effects = [], redirects = [];
  let index = 0, result = { kind: 'ready', businessType }, logouts = 0;
  const session = { user: { id: '1', businessType: 'FACTORY', business_type: 'FACTORY' }, accessToken: 'valid' };
  const { BusinessAccessGate } = load('components/factory/BusinessAccessGate.tsx', {
    react: { useState: initial => { const i = index++; if (!(i in states)) states[i] = initial; return [states[i], value => { states[i] = typeof value === 'function' ? value(states[i]) : value; }]; }, useEffect: effect => effects.push(effect) },
    'react/jsx-runtime': jsx,
    'next/navigation': { useRouter: () => ({ replace: path => redirects.push(path) }), useSearchParams: () => new URLSearchParams(callback ? { next: callback } : {}) },
    'next-auth/react': { useSession: () => ({ status, data: session, update: async () => session }), signOut: async () => { logouts++; } },
    '@/lib/auth-session': { clearPosSession: () => { logouts++; } }, '@/lib/auth': { clearAuthTokens: () => { logouts++; } },
    '@/lib/business-access': { loadBusinessAccess: async () => result }, '@/lib/business-routing': routing,
  });
  return {
    redirects, get logouts() { return logouts; }, setResult(value) { result = value; },
    render() { index = 0; return BusinessAccessGate({ children: 'PRIVATE_SHELL', area, entry }); },
    async check() { effects.splice(0).at(-1)(); await new Promise(resolve => setImmediate(resolve)); },
  };
}
function containsShell(tree) { return JSON.stringify(tree).includes('PRIVATE_SHELL'); }
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...[tree.props?.children].flat(Infinity).flatMap(nodes)];
}
test('restored FACTORY root and sign-in resolve through entry, including expired access and temporary refresh claims', async () => {
  for (const error of [undefined, 'RefreshTemporarilyUnavailable']) {
    const { middleware } = load('middleware.ts', {
      '@/lib/business-routing': routing, 'next-auth/jwt': { getToken: async () => ({ businessType: 'FACTORY', business_type: 'FACTORY', accessTokenExpires: 1, error }) },
      'next/server': { NextResponse: { next: () => ({ next: true }), redirect: url => ({ url: String(url) }) } },
    });
    for (const path of ['/', '/Sign_in', '/sign-in']) {
      const url = new URL(path, 'https://pos.test'); url.clone = () => new URL(url);
      assert.equal(new URL((await middleware({ url: String(url), nextUrl: url })).url).pathname, '/entry');
    }
  }
  const gate = gateHarness({ entry: true }); gate.render(); await gate.check();
  assert.deepEqual(gate.redirects, ['/factory']);
});
test('restored dashboard blocks shell and redirects FACTORY to factory; shop uses backend despite stale FACTORY claims', async () => {
  for (const type of ['FACTORY', ...routing.SHOP_TYPES]) {
    const gate = gateHarness({ area: 'dashboard', businessType: type });
    assert.equal(containsShell(gate.render()), false); await gate.check();
    assert.equal(containsShell(gate.render()), type !== 'FACTORY');
    assert.deepEqual(gate.redirects, type === 'FACTORY' ? ['/factory'] : []);
  }
});
test('correct-area entry deep links survive; direct correct-area gates do not redirect', async () => {
  for (const [type, area, path] of [['FACTORY', 'factory', '/factory/production?tab=1#list'], ['FASHION', 'dashboard', '/dashboard/products?tab=1']]) {
    const entry = gateHarness({ entry: true, businessType: type, callback: path }); entry.render(); await entry.check(); assert.deepEqual(entry.redirects, [path]);
    const gate = gateHarness({ area, businessType: type }); gate.render(); await gate.check(); assert.equal(containsShell(gate.render()), true); assert.deepEqual(gate.redirects, []);
  }
});
test('unknown and temporary access failures retain session and can recover on retry', async () => {
  for (const kind of ['unknown', 'error']) {
    const gate = gateHarness({ area: 'dashboard' }); gate.setResult({ kind }); gate.render(); await gate.check();
    const failure = gate.render();
    assert.equal(containsShell(failure), false); assert.deepEqual(gate.redirects, []); assert.equal(gate.logouts, 0);
    nodes(failure).find(node => node.type === 'button' && node.props.children === 'Retry').props.onClick();
    gate.setResult({ kind: 'ready', businessType: 'FASHION' }); gate.render(); await gate.check(); assert.equal(containsShell(gate.render()), true);
  }
});
test('entry rejects unsafe and looping callbacks before resolving business area', () => {
  for (const path of ['/', '/entry?next=/entry', '/Sign_in', '/sign-in', '//evil.test', 'https://evil.test', '/factory/../../entry', '/%2ffactory']) assert.equal(routing.businessEntryPath(path), '/entry', path);
  assert.equal(routing.destinationForBusinessType('FACTORY', '/dashboard/products'), '/factory');
  assert.equal(routing.destinationForBusinessType('FASHION', '/factory/production'), '/dashboard');
});
test('missing or revoked session requires sign-in; backend unknown and outages remain distinct', async () => {
  const gate = gateHarness({ area: 'dashboard' }); gate.setResult({ kind: 'unauthenticated' });
  gate.render(); await gate.check();
  assert.deepEqual(gate.redirects, ['/Sign_in?next=%2Fdashboard%2Fproducts%3Ftab%3D1']);
  assert.ok(gate.logouts > 0);
  for (const [status, body, kind] of [[200, { businessType: 'OTHER' }, 'unknown'], [503, {}, 'error'], [401, {}, 'unauthenticated']]) {
    assert.equal((await access.loadBusinessAccess(async () => Response.json(body, { status }))).kind, kind);
  }
});
test('both layouts nest their shell inside backend business gate', () => {
  for (const area of ['dashboard', 'factory']) {
    const Gate = () => null, Shell = () => null;
    const layout = load('app/' + area + '/layout.tsx', {
      react: { Suspense: 'suspense' }, 'react/jsx-runtime': jsx,
      '@/components/factory/BusinessAccessGate': { BusinessAccessGate: Gate },
      '@/components/auth/SyncUser': {}, '@/components/auth/AuthTokenGuard': {}, '@/components/AuthTokenSync': {},
      '@/components/dashboard/dashboard-shell': { DashboardShell: Shell }, '@/components/factory/FactoryShell': { FactoryShell: Shell },
    }).default;
    function find(tree) { if (!tree || typeof tree !== 'object') return; if (tree.type === Gate) return tree; return [tree.props?.children].flat(Infinity).map(find).find(Boolean); }
    const gate = find(layout({ children: 'PAGE' })); assert.ok(gate); assert.equal(gate.props.children.type, Shell);
  }
});
