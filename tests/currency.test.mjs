import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Run the exact TypeScript modules without a bundler or a backend connection.
function load(relative, imports = {}) {
  const source = fs.readFileSync(new URL(relative, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => imports[name], Intl, Number, Promise, Set });
  return exports;
}
const currency = load('../lib/currency.ts');
const { createCurrencyStore } = load('../lib/currency-store.ts', { './currency': currency });
const { DEFAULT_CURRENCY, normalizeCurrency, formatCurrencyAmount: format } = currency;
const usd = { currencyCode: 'USD', currencySymbol: '$', currencyDecimalDigits: '2', currencyPosition: 'BEFORE' };
const jpy = { currencyCode: 'JPY', currencySymbol: '¥', currencyDecimalDigits: 0, currencyPosition: 'BEFORE' };
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };

test('configured symbol, digits and position override currency defaults', () => {
  assert.equal(format(10000), '10,000 Ks');
  assert.equal(format(10000, jpy), '¥ 10,000');
  assert.equal(format(10000, usd), '$ 10,000.00');
  assert.equal(format(10000, { ...usd, currencyPosition: 'AFTER' }), '10,000.00 $');
  assert.equal(format(10000, { ...jpy, currencySymbol: 'custom', currencyDecimalDigits: 2 }), 'custom 10,000.00');
});
test('nullable, string and invalid digits normalize safely', () => {
  for (const digits of [null, undefined, '', 'invalid', -1, 7, 1.5, Infinity]) {
    assert.equal(normalizeCurrency({ currencyDecimalDigits: digits }).currencyDecimalDigits, 0);
    assert.doesNotThrow(() => format(1, { currencyDecimalDigits: digits }));
  }
  assert.equal(normalizeCurrency(usd).currencyDecimalDigits, 2);
  assert.equal(normalizeCurrency({ currencyDecimalDigits: '0' }).currencyDecimalDigits, 0);
  assert.equal(normalizeCurrency({ currencyDecimalDigits: 6 }).currencyDecimalDigits, 6);
  assert.equal(JSON.stringify(normalizeCurrency({ currencyCode: null, currencySymbol: null, currencyPosition: null })), JSON.stringify(DEFAULT_CURRENCY));
});
test('zero, negative and compact chart amounts preserve configuration', () => {
  assert.equal(format(0, usd), '$ 0.00');
  assert.equal(format(-10000, usd), '$ -10,000.00');
  assert.equal(format(-10000), '-10,000 Ks');
  assert.equal(format(10000, usd, true), '$ 10.00K');
  assert.equal(format(10000, DEFAULT_CURRENCY, true), '10K Ks');
  assert.equal(format(-1000000, jpy, true), '¥ -1M');
  assert.equal(format(NaN), '0 Ks');
});
test('one in-flight settings request serves all subscribers', async () => {
  const store = createCurrencyStore(); let calls = 0; let updates = 0;
  const request = deferred();
  const fetchSettings = () => { ++calls; return request.promise; };
  const unsubscribe = store.subscribe(() => ++updates);
  const first = store.refresh('shop-a', true, fetchSettings);
  const second = store.refresh('shop-a', true, fetchSettings, true);
  assert.equal(calls, 1);
  request.resolve(usd); await Promise.all([first, second]);
  assert.equal(format(10, store.snapshot()), '$ 10.00');
  assert.equal(updates, 2); unsubscribe();
});
test('a successful save updates subscribers and defeats an older GET', async () => {
  const store = createCurrencyStore(); const old = deferred();
  const pending = store.refresh('shop-a', true, () => old.promise);
  let updates = 0; store.subscribe(() => ++updates);
  store.publish(usd, 'shop-a');
  old.resolve(jpy); await pending;
  assert.equal(format(10, store.snapshot()), '$ 10.00');
  assert.equal(updates, 1);
});
test('shop/account changes reset immediately and discard stale requests and saves', async () => {
  const store = createCurrencyStore(); const old = deferred(); const current = deferred();
  await store.refresh('shop-a', true, async () => usd);
  const previous = store.refresh('shop-a', true, () => old.promise, true);
  const next = store.refresh('shop-b', true, () => current.promise);
  assert.equal(store.snapshot(), DEFAULT_CURRENCY);
  store.publish(usd, 'shop-a');
  old.resolve(usd); await previous;
  assert.equal(store.snapshot(), DEFAULT_CURRENCY);
  current.resolve(jpy); await next;
  assert.equal(format(10, store.snapshot()), '¥ 10');
  await store.refresh('signed-out', false, async () => usd);
  assert.equal(store.snapshot(), DEFAULT_CURRENCY);
});
test('reload starts with defaults; failed refresh preserves successfully loaded settings', async () => {
  const store = createCurrencyStore();
  await store.refresh('shop-a', true, async () => usd);
  await store.refresh('shop-a', true, async () => { throw Error('offline'); }, true);
  assert.equal(format(10, store.snapshot()), '$ 10.00');
  assert.equal(createCurrencyStore().snapshot(), DEFAULT_CURRENCY);
  await store.refresh('shop-b', true, async () => { throw Error('offline'); });
  assert.equal(store.snapshot(), DEFAULT_CURRENCY);
  await store.refresh('shop-b', true, async () => jpy, true);
  assert.equal(format(10, store.snapshot()), '¥ 10');
});

test('SSR and initial hydration use defaults even if a client store has loaded settings', () => {
  let hydrating = true;
  let effects = 0;
  const provider = load('../components/currency-provider.tsx', {
    react: {
      useMemo: fn => fn(),
      useSyncExternalStore: (_subscribe, snapshot, serverSnapshot) => hydrating ? serverSnapshot() : snapshot(),
      useLayoutEffect: () => { ++effects; },
    },
    'next-auth/react': { useSession: () => ({ data: null, status: 'loading' }) },
    'next/navigation': { usePathname: () => '/dashboard' },
    '@/lib/auth': { getStoredToken: () => { throw Error('storage accessed during render'); } },
    '@/lib/settings-api': {},
    '@/lib/currency': currency,
    '@/lib/currency-store': { createCurrencyStore },
  });
  assert.equal(provider.CurrencyProvider({ children: 'page' }), 'page');
  assert.equal(effects, 1);
  provider.publishCurrencySettings(usd);
  assert.equal(provider.useCurrency().formatSharedMoney(10000), '10,000 Ks');
  hydrating = false;
  assert.equal(provider.useCurrency().formatSharedMoney(10000), '$ 10,000.00');
});
