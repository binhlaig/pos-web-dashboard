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
  vm.runInNewContext(code, { exports, require: name => imports[name], Intl, Number, Promise, Set, Event, window: imports.window, document: imports.document });
  return exports;
}
const currency = load('../lib/currency.ts');
const { createCurrencyStore } = load('../lib/currency-store.ts', { './currency': currency });
const { DEFAULT_CURRENCY, normalizeCurrency, formatCurrencyAmount: format } = currency;

const japan = { region: 'JAPAN', currencyCode: 'MMK', currencySymbol: 'Ks', currencyDecimalDigits: 2, currencyPosition: 'AFTER' };
const myanmar = { region: 'MYANMAR', currencyCode: 'JPY', currencySymbol: '¥', currencyDecimalDigits: 2, currencyPosition: 'BEFORE' };
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };

test('region overrides every legacy currency field without price conversion', () => {
  assert.equal(format(1000, japan), '¥1,000');
  assert.equal(format(1000, myanmar), '1,000 Ks');
  assert.equal(format(1234.5, japan), '¥1,235');
  assert.equal(format(1234.5, myanmar), '1,235 Ks');
  assert.equal(format(-1000, japan), '¥-1,000');
  assert.equal(format(0, myanmar), '0 Ks');
  assert.equal(format(1000000, japan, true), '¥1M');
});
test('missing or unsupported region is never labelled Myanmar', () => {
  for (const region of [null, undefined, '', 'OTHER']) assert.equal(currency.currencyForRegion(region).currencyCode, '');
  assert.equal(format(1000), '1,000');
  assert.equal(format(1000, {region:'OTHER',currencySymbol:'Ks'}), '1,000');
});
test('explicit historical snapshots keep their symbol, precision and position', () => {
  const snapshot={currencyCode:'USD',currencySymbol:'$',currencyDecimalDigits:'2',currencyPosition:'BEFORE'};
  assert.equal(format(1000,snapshot),'$ 1,000.00');
  assert.equal(format(1000,{...snapshot,currencyPosition:'AFTER'}),'1,000.00 $');
  for (const digits of [null,undefined,'bad',-1,7,1.5,Infinity]) assert.doesNotThrow(()=>format(1,{currencyDecimalDigits:digits}));
  assert.equal(format(NaN,japan),'¥0');
  assert.equal(currency.formatHistoricalMoney(1000,{region:'JAPAN'}),'1,000');
  assert.equal(currency.formatHistoricalMoney(1000,{region:'JAPAN',currencyCode:'MMK',currencySymbol:'Ks',currencyDecimalDigits:0,currencyPosition:'AFTER'}),'1,000 Ks');
  assert.equal(currency.formatHistoricalMoney(1000,{currencySnapshot:snapshot}),'$ 1,000.00');
});
test('settings fetch deduplicates subscribers and derives from region',async()=>{
 const store=createCurrencyStore(),request=deferred();let calls=0;
 const fetch=()=>{calls++;return request.promise;};
 const first=store.refresh('shop-a',true,fetch),second=store.refresh('shop-a',true,fetch,true);
 assert.equal(calls,1);request.resolve(japan);await Promise.all([first,second]);
 assert.equal(format(1000,store.snapshot()),'¥1,000');
});
test('shop changes immediately clear currency and reject stale requests and saves',async()=>{
 const store=createCurrencyStore(),old=deferred(),next=deferred();
 await store.refresh('shop-a',true,async()=>japan);
 const previous=store.refresh('shop-a',true,()=>old.promise,true);
 const current=store.refresh('shop-b',true,()=>next.promise);
 assert.equal(store.snapshot(),DEFAULT_CURRENCY);store.publish(japan,'shop-a');
 old.resolve(japan);await previous;assert.equal(store.snapshot(),DEFAULT_CURRENCY);
 next.resolve(myanmar);await current;assert.equal(format(1000,store.snapshot()),'1,000 Ks');
 await store.refresh('signed-out',false,async()=>japan);assert.equal(store.snapshot(),DEFAULT_CURRENCY);
});
test('settings saves defeat stale fetches; region refresh updates same shop',async()=>{
 const store=createCurrencyStore(),old=deferred();
 const pending=store.refresh('shop-a',true,()=>old.promise);
 store.publish(japan,'shop-a');old.resolve(myanmar);await pending;
 assert.equal(format(1000,store.snapshot()),'¥1,000');
 await store.refresh('shop-a',true,async()=>myanmar,true);
 assert.equal(format(1000,store.snapshot()),'1,000 Ks');
});
test('reload and failed new-shop fetch remain neutral; refresh failure retains same-shop currency',async()=>{
 const store=createCurrencyStore();assert.equal(store.snapshot(),DEFAULT_CURRENCY);
 await store.refresh('a',true,async()=>japan);
 await store.refresh('a',true,async()=>{throw Error('offline')},true);
 assert.equal(format(1000,store.snapshot()),'¥1,000');
 await store.refresh('b',true,async()=>{throw Error('offline')});
 assert.equal(store.snapshot(),DEFAULT_CURRENCY);
 await store.refresh('b',true,async()=>({currencySymbol:'Ks',currencyCode:'MMK'}),true);
 assert.equal(store.snapshot(),DEFAULT_CURRENCY);
});

test('provider masks old-shop currency during auth sync and hydration', async () => {
  let token = 'a', session = { accessToken: 'a', user: { id: 'a' } }, hydrate = true;
  const requests = [], effects = [], handlers = new Map();
  const provider = load('../components/currency-provider.tsx', {
    react: {
      useMemo: fn => fn(),
      useSyncExternalStore: (_subscribe, snapshot, serverSnapshot) => hydrate ? serverSnapshot() : snapshot(),
      useLayoutEffect: fn => effects.push(fn),
    },
    'next-auth/react': { useSession: () => ({data: session, status:'authenticated'}) },
    'next/navigation': { usePathname: () => '/dashboard' },
    '@/lib/auth': { getStoredToken: () => token },
    '@/lib/settings-api': { getReceiptSettings: () => new Promise(resolve => requests.push(resolve)) },
    '@/lib/currency': currency,
    '@/lib/currency-store': { createCurrencyStore },
    window: { localStorage: { getItem: () => null }, addEventListener: (name,fn) => handlers.set(name,fn), removeEventListener() {}, setInterval() {}, clearInterval() {} },
    document: { addEventListener() {}, removeEventListener() {} },
  });
  assert.equal(provider.CurrencyProvider({children:'page'}),'page');
  effects.pop()(); requests[0](japan); await Promise.resolve(); await Promise.resolve();
  assert.equal(provider.useCurrency().formatSharedMoney(1000),'1,000');
  hydrate=false;
  assert.equal(provider.useCurrency().formatSharedMoney(1000),'¥1,000');
  token='b'; // Same-tab storage change precedes NextAuth synchronization.
  assert.equal(provider.useCurrency().formatSharedMoney(1000),'1,000');
  session={accessToken:'b',user:{id:'b'}};
  provider.CurrencyProvider({children:'page'}); effects.pop()();
  assert.equal(provider.useCurrency().formatSharedMoney(1000),'1,000');
  requests[1](myanmar);await new Promise(resolve => setImmediate(resolve));
  assert.equal(provider.useCurrency().formatSharedMoney(1000),'1,000 Ks');
  handlers.get('pos-shop-settings-updated')();requests[2](japan);await Promise.resolve();await Promise.resolve();
  assert.equal(provider.useCurrency().formatSharedMoney(1000),'¥1,000');
});

test('login replaces token aliases so previous-shop credentials cannot win', () => {
  const makeStorage = () => {
    const data = new Map();
    return {getItem: key => data.get(key) ?? null, setItem: (key,value) => data.set(key,value), removeItem: key => data.delete(key)};
  };
  const localStorage=makeStorage(),sessionStorage=makeStorage();
  localStorage.setItem('pos_shop_owner_token','old-shop');
  sessionStorage.setItem('jwt','old-shop');
  const auth=load('../lib/auth.ts',{window:{localStorage,sessionStorage,dispatchEvent(){}}});
  auth.saveToken('new-shop');
  assert.equal(auth.getStoredToken(),'new-shop');
  assert.equal(localStorage.getItem('pos_shop_owner_token'),null);
  assert.equal(sessionStorage.getItem('jwt'),null);
  auth.clearAuthTokens();assert.equal(auth.getStoredToken(),'');
});
