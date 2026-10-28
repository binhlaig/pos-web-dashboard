import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createHash, randomUUID } from 'node:crypto';

function load(file, imports = {}, globals = {}) {
  const exports = {};
  const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText, { exports, require: name => name === '@/lib/session-identity' ? identity : imports[name],
    process: { env: {} }, Buffer, Response, Headers, URL, AbortSignal,
    setTimeout, atob, console: { log() {}, error() {} }, ...globals });
  return exports;
}
const claims = { sid: 'session', type: 'USER', accountId: 7, shopId: 3, sub: '7', shopCode: 'SHOP', role: 'ADMIN' };
const jwt = (exp, sid = 'session', overrides = {}) => `header.${Buffer.from(JSON.stringify({ ...claims, exp, sid, ...overrides })).toString('base64url')}.signature`;
const identity = load('lib/session-identity.ts');
const expired = { accessToken: jwt(1), accessTokenExpires: 1, exp: Date.now() / 1000 + 64800 };
function middleware(token) {
  return load('middleware.ts', {
    'next-auth/jwt': { getToken: async () => token },
    'next/server': { NextResponse: { next: () => ({ status: 200 }), redirect: url => ({ status: 307, url: String(url) }) } },
  }).middleware;
}
function request(path) {
  const url = new URL(path, 'https://pos.test');
  url.clone = () => new URL(url);
  return { nextUrl: url, url: String(url) };
}
test('expired Spring token and temporary refresh failure pass protected middleware', async () => {
  for (const error of [undefined, 'RefreshTemporarilyUnavailable']) {
    for (const path of ['/dashboard', '/factory/orders'])
      assert.equal((await middleware({ ...expired, error })(request(path))).status, 200);
  }
});
test('missing, expired NextAuth, and definitively revoked sessions redirect without loops', async () => {
  for (const token of [null, { ...expired, exp: 1 }, { ...expired, error: 'AccessTokenExpired' }]) {
    const run = middleware(token);
    const result = await run(request('/dashboard?tab=1'));
    assert.equal(new URL(result.url).pathname, '/Sign_in');
    assert.equal(new URL(result.url).searchParams.get('next'), '/dashboard?tab=1');
    assert.equal((await run(request(result.url))).status, 200);
  }
});
test('sign-in redirects valid access sessions to an allowed route, never itself or another origin', async () => {
  const run = middleware({ ...expired, accessTokenExpires: Date.now() / 1000 + 900 });
  for (const next of ['/dashboard', '/Sign_in?next=/dashboard', '/sign-in', '/a/../Sign_in', '/\\evil.test']) {
    const result = await run(request(`/Sign_in?next=${encodeURIComponent(next)}`));
    assert.equal(new URL(result.url).origin, 'https://pos.test');
    assert.equal(new URL(result.url).pathname, '/dashboard');
    assert.equal((await run(request(result.url))).status, 200);
  }
});
function refreshSetup(env, fetch) {
  return load('lib/spring-session-refresh.ts', { 'node:crypto': { createHash, randomUUID } }, { process: { env }, fetch });
}
function refreshedResponse() {
  return new Response(JSON.stringify({ token: jwt(Date.now() / 1000 + 900) }), {
    headers: { 'Set-Cookie': 'pos_refresh=rotated; HttpOnly; Max-Age=64800' },
  });
}
test('missing Redis configuration is retryable after repair and still fails closed on Vercel', async () => {
  const env = { VERCEL: '1', REMOTE_API_BASE_URL: 'https://backend.test', APP_FRONTEND_ORIGIN: 'https://pos.test' };
  let posts = 0;
  const service = refreshSetup(env, async url => {
    if (url === 'https://redis.test') return Response.json({ result: 'OK' });
    posts++; return refreshedResponse();
  });
  await assert.rejects(service.refreshSpringSession('credential'), /shared session storage/);
  assert.equal(posts, 0);
  env.SESSION_REDIS_REST_URL = 'https://redis.test';
  env.SESSION_REDIS_REST_TOKEN = 'test-only';
  assert.equal((await service.refreshSpringSession('credential')).refreshToken, 'rotated');
  assert.equal(posts, 1);
});
test('uncertain backend refresh outcome remains cached and never replays the credential', async () => {
  let posts = 0;
  const service = refreshSetup({ APP_FRONTEND_ORIGIN: 'https://pos.test' }, async () => { posts++; throw new Error('timeout'); });
  for (let i = 0; i < 2; i++) await assert.rejects(service.refreshSpringSession('credential'), /unavailable/);
  assert.equal(posts, 1);
});
test('invalid origin and Redis URL fail before claiming a credential and recover after repair', async () => {
  const env = { VERCEL: '1', REMOTE_API_BASE_URL: 'https://backend.test', APP_FRONTEND_ORIGIN: 'invalid',
    SESSION_REDIS_REST_URL: 'http://redis.test', SESSION_REDIS_REST_TOKEN: 'test-only' };
  let claims = 0, posts = 0;
  const service = refreshSetup(env, async url => {
    if (url === 'https://redis.test') { claims++; return Response.json({ result: 'OK' }); }
    posts++; return refreshedResponse();
  });
  await assert.rejects(service.refreshSpringSession('credential'), /origin/);
  env.APP_FRONTEND_ORIGIN = 'https://pos.test';
  await assert.rejects(service.refreshSpringSession('credential'), /HTTPS/);
  assert.equal(claims, 0); assert.equal(posts, 0);
  env.SESSION_REDIS_REST_URL = 'https://redis.test';
  await service.refreshSpringSession('credential');
  assert.equal(posts, 1);
});
function authOptions(refresh) {
  class SessionRefreshError extends Error { constructor(status) { super(); this.status = status; } }
  return { SessionRefreshError, options: load('lib/next-auth.ts', {
    '@/lib/spring-session-refresh': { refreshSpringSession: refresh, SessionRefreshError },
    '@/lib/session-cookie-bridge': { captureRefreshCookie() {}, browserMetadataHeaders: () => ({}), isSessionRefreshRequested: () => false },
    'next-auth/providers/credentials': { default: config => config },
  }).authOptions };
}
test('JWT callback preserves session on temporary failure and marks definitive rejection', async () => {
  let fail;
  const { options, SessionRefreshError } = authOptions(async () => { throw fail; });
  for (const status of [503, 401]) {
    fail = new SessionRefreshError(status);
    const token = await options.callbacks.jwt({ token: { ...expired, refreshCredential: 'credential' } });
    assert.equal(token.error, status === 401 ? 'AccessTokenExpired' : 'RefreshTemporarilyUnavailable');
    assert.equal(token.refreshCredential, status === 401 ? null : 'credential');
    const session = await options.callbacks.session({ session: { user: {} }, token });
    assert.equal(session.error, token.error);
    assert.equal(session.accessToken, null);
  }
});
test('JWT refresh updates access and rotation credential while keeping 18 hour session', async () => {
  const next = jwt(Date.now() / 1000 + 900);
  const { options } = authOptions(async () => ({ data: { token: next }, refreshToken: 'rotated', cookies: [] }));
  const token = await options.callbacks.jwt({ token: { ...expired, refreshCredential: 'old' } });
  assert.equal(token.accessToken, next);
  assert.equal(token.refreshCredential, 'rotated');
  assert.equal(token.error, undefined);
  assert.equal(options.session.maxAge, 64800);
});
test('authenticated request uses refreshed token and retries only once even on another 401', async () => {
  for (const status of [200, 401]) {
    let stored = expired.accessToken, calls = 0, sessions = 0, redirects = 0;
    const next = jwt(Date.now() / 1000 + 900);
    const api = load('lib/api.ts', {
      'next-auth/react': { getSession: async () => { sessions++; return { accessToken: next }; } },
      '@/lib/auth': { getStoredToken: () => stored, saveToken: token => { stored = token; }, clearAuthTokens() {}, redirectToSignIn() { redirects++; } },
    }, { atob, fetch: async (_url, options) => {
      calls++;
      assert.equal(options.headers.get('Authorization'), `Bearer ${calls === 1 ? expired.accessToken : next}`);
      return Response.json({}, { status: calls === 1 ? 401 : status });
    } });
    const result = api.apiRequest('/orders', { auth: true });
    if (status === 401) await assert.rejects(result); else await result;
    assert.equal(calls, 2); assert.equal(sessions, 1); assert.equal(stored, next); assert.equal(redirects, 0);
  }
});
test('temporary refresh failure in browser does not logout or retry request', async () => {
  let calls = 0;
  const api = load('lib/api.ts', {
    'next-auth/react': { getSession: async () => ({ error: 'RefreshTemporarilyUnavailable' }) },
    '@/lib/auth': { getStoredToken: () => expired.accessToken, clearAuthTokens() { assert.fail('logout'); }, redirectToSignIn() { assert.fail('redirect'); } },
  }, { fetch: async () => { calls++; return Response.json({}, { status: 401 }); } });
  await assert.rejects(api.apiRequest('/orders', { auth: true }), /renew session/);
  assert.equal(calls, 1);
});

test('missing identity is recoverable and mismatched account, shop, type or device is rejected', async () => {
  for (const overrides of [{ sid: undefined }, { accountId: undefined }, { shopId: undefined }, { type: undefined }, { sub: undefined }]) {
    const { options } = authOptions(async () => ({ data: { token: jwt(Date.now()/1000+900, 'session', overrides) }, refreshToken: 'rotated', cookies: [] }));
    const token = await options.callbacks.jwt({ token: { ...expired, refreshCredential: 'old' } });
    assert.equal(token.error, 'RefreshTemporarilyUnavailable');
    assert.equal(token.refreshReason, 'MISSING_IDENTITY_CLAIM');
    assert.equal(token.refreshCredential, 'old');
  }
  for (const overrides of [{ sid: 'different' }, { accountId: 8 }, { shopId: 4 }, { type: 'STAFF' }, { sub: '8' }, { shopCode: 'OTHER' }]) {
    const { options } = authOptions(async () => ({ data: { token: jwt(Date.now()/1000+900, 'session', overrides) }, refreshToken: 'rotated', cookies: [] }));
    const token = await options.callbacks.jwt({ token: { ...expired, refreshCredential: 'old' } });
    assert.equal(token.error, 'AccessTokenExpired');
    assert.equal(token.refreshReason, 'IDENTITY_MISMATCH');
    assert.equal(token.accessToken, null);
  }
});

test('real STAFF subject and account type survive refresh; credentials never enter browser session', async () => {
  const staff = { type: 'STAFF', accountId: 12, sub: 'staff:3:12', staffId: 100, role: 'CASHIER' };
  const next = jwt(Date.now()/1000+900, 'session', staff);
  const { options } = authOptions(async () => ({ data: { token: next }, refreshToken: 'rotated', cookies: [] }));
  const token = await options.callbacks.jwt({ token: { ...expired, accessToken: jwt(1, 'session', staff), refreshCredential: 'old' } });
  assert.equal(token.accessToken, next);
  assert.equal(token.refreshCredential, 'rotated');
  const session = await options.callbacks.session({ session: { user: {} }, token });
  assert.equal(session.accessToken, next);
  assert.equal(session.refreshCredential, undefined);
});

test('missing refresh credential has a separate safe reason code', async () => {
  const service = refreshSetup({}, () => assert.fail('must not POST'));
  await assert.rejects(service.refreshSpringSession(''), error => error.status === 401 && error.reason === 'MISSING_REFRESH_CREDENTIAL');
});

test('overlapping requests share exactly one rotation and stale server cookie follows latest alias', async () => {
  let posts = 0;
  let now = Date.now();
  class Clock extends Date { static now() { return now; } }
  const service = load('lib/spring-session-refresh.ts', { 'node:crypto': { createHash, randomUUID } }, {
    Date: Clock, process: { env: { APP_FRONTEND_ORIGIN: 'https://pos.test' } }, fetch: async () => {
      posts++;
      await new Promise(resolve => setTimeout(resolve, 5));
      return new Response(JSON.stringify({ token: jwt(now/1000+900) }), {
        headers: { 'Set-Cookie': `pos_refresh=rotation-${posts}; Path=/api/auth; HttpOnly; Max-Age=63000` },
      });
    },
  });
  const results = await Promise.all(Array.from({length: 12}, () => service.refreshSpringSession('original')));
  assert.equal(posts, 1);
  assert.ok(results.every(result => result.refreshToken === 'rotation-1'));
  now += 901000;
  const latest = await service.refreshSpringSession('original');
  assert.equal(posts, 2);
  assert.equal(latest.refreshToken, 'rotation-2');
});

test('separate Vercel workers reuse Redis rotation, and Redis preflight outages recover', async () => {
  const records = new Map(); let posts = 0, offline = true;
  const env = { VERCEL: '1', REMOTE_API_BASE_URL: 'https://backend.test', APP_FRONTEND_ORIGIN: 'https://pos.test', SESSION_REDIS_REST_URL: 'https://redis.test', SESSION_REDIS_REST_TOKEN: 'test-only' };
  const fetch = async (url, init) => {
    if (url !== 'https://redis.test') { posts++; return refreshedResponse(); }
    if (offline) throw new Error('offline');
    const [command, key, value, mode] = JSON.parse(init.body);
    if (command === 'GET') return Response.json({ result: records.get(key) ?? null });
    if (mode === 'NX' && records.has(key)) return Response.json({ result: null });
    records.set(key, value); return Response.json({ result: 'OK' });
  };
  const first = refreshSetup(env, fetch), second = refreshSetup(env, fetch);
  await assert.rejects(first.refreshSpringSession('shared'));
  assert.equal(posts, 0);
  offline = false;
  const results = await Promise.all([first.refreshSpringSession('shared'), second.refreshSpringSession('shared')]);
  assert.equal(posts, 1);
  assert.ok(results.every(result => result.refreshToken === 'rotated'));
});

test('temporary refresh failure on factory access returns recoverable 503, never logout 401', async () => {
  for (const error of ['RefreshTemporarilyUnavailable', 'SessionMappingError']) {
    const route = load('app/api/auth/business-type/route.ts', {
      'next-auth': { getServerSession: async () => ({ user: {}, accessToken: null, error }) }, '@/lib/next-auth': {},
    });
    const response = await route.GET();
    assert.equal(response.status, 503);
    const business = load('lib/business-access.ts', { './business-routing': {} });
    assert.equal((await business.loadBusinessAccess(async () => response)).kind, 'error');
  }
});

test('expired access cookie permits sign-in page so server-side rejection cannot redirect-loop', async () => {
  for (const error of [undefined, 'RefreshTemporarilyUnavailable', 'AccessTokenExpired']) {
    assert.equal((await middleware({ ...expired, error })(request('/Sign_in?next=/factory/receiving'))).status, 200);
  }
});

test('cookie bridge forwards rotation only to its own response; encrypted NextAuth cookie retains rotation', async () => {
  const { AsyncLocalStorage } = await import('node:async_hooks');
  const { encode, decode } = await import('next-auth/jwt');
  const bridge = load('lib/session-cookie-bridge.ts', { 'node:async_hooks': { AsyncLocalStorage } });
  const { options } = authOptions(async () => ({ data: { token: jwt(Date.now()/1000+900) }, refreshToken: 'rotated', cookies: [] }));
  const token = await options.callbacks.jwt({ token: { ...expired, refreshCredential: 'old' } });
  const secret = 'test-only-cookie-secret';
  const encrypted = await encode({ token, secret, maxAge: options.session.maxAge });
  const persisted = await decode({ token: encrypted, secret });
  assert.equal(persisted.refreshCredential, 'rotated');
  assert.equal(persisted.accessToken, token.accessToken);
  const handler = bridge.withRefreshCookieBridge(async request => {
    bridge.captureRefreshCookie(new Response(null, { headers: { 'Set-Cookie': `pos_refresh=${request.label}; Path=/api/auth; HttpOnly` } }));
    await new Promise(resolve => setTimeout(resolve, 2));
    return new Response(null, { headers: { 'Set-Cookie': `next-auth.session-token=${encrypted}; HttpOnly` } });
  });
  const responses = await Promise.all(['one', 'two'].map(label => handler({ label, headers: new Headers() })));
  responses.forEach((response, i) => {
    const cookies = response.headers.getSetCookie();
    assert.equal(cookies.length, 2);
    assert.ok(cookies.some(value => value.startsWith(`pos_refresh=${i === 0 ? 'one' : 'two'};`)));
    assert.ok(cookies.some(value => value.startsWith('next-auth.session-token=')));
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  });
});

test('development module reload reuses pending rotation rather than replaying credential', async () => {
  const sharedGlobal = {}; let posts = 0;
  const globals = { globalThis: sharedGlobal, process: { env: { APP_FRONTEND_ORIGIN: 'https://pos.test' } }, fetch: async () => { posts++; return refreshedResponse(); } };
  const first = load('lib/spring-session-refresh.ts', { 'node:crypto': { createHash, randomUUID } }, globals);
  await first.refreshSpringSession('hot-reload');
  const reloaded = load('lib/spring-session-refresh.ts', { 'node:crypto': { createHash, randomUUID } }, globals);
  assert.equal((await reloaded.refreshSpringSession('hot-reload')).refreshToken, 'rotated');
  assert.equal(posts, 1);
});

test('compatibility refresh route persists NextAuth and bridge cookies and cannot use an unrelated staff cookie', async () => {
  class NextRequest { constructor(url, options) { this.url = String(url); this.headers = options.headers; } }
  let calls = 0;
  const route = load('app/api/auth/refresh/route.ts', {
    'next/server': { NextRequest },
    '@/lib/session-proxy': { proxySessionRequest: () => assert.fail('must use NextAuth credential') },
    'next-auth/jwt': { getToken: async () => ({ refreshCredential: 'owner-credential' }) },
    '@/lib/next-auth': {},
    '@/lib/session-cookie-bridge': { withRefreshCookieBridge: (handler, force) => { assert.equal(force, true); return handler; } },
    'next-auth': { default: () => async (request, context) => {
      calls++;
      assert.equal(new URL(request.url).pathname, '/api/auth/session');
      assert.equal(context.params.nextauth[0], 'session');
      const headers = new Headers();
      headers.append('Set-Cookie', 'next-auth.session-token=encrypted-rotation; HttpOnly');
      headers.append('Set-Cookie', 'pos_refresh=rotation; HttpOnly');
      return Response.json({ accessToken: jwt(Date.now()/1000+900) }, { headers });
    } },
  }, { process: { env: { APP_FRONTEND_ORIGIN: 'https://pos.test' } } });
  const response = await route.POST({ url: 'https://pos.test/api/auth/refresh', headers: new Headers({ Origin: 'https://pos.test' }) });
  assert.equal(response.status, 200);
  assert.equal(response.headers.getSetCookie().length, 2);
  assert.equal(calls, 1);
  assert.equal((await response.json()).refreshCredential, undefined);
  assert.equal((await route.POST({ headers: new Headers({ Origin: 'https://other.test' }) })).status, 403);
  assert.equal(calls, 1);
});

test('backend revocation stays definitive and malformed identity never becomes an accepted session', async () => {
  const rejected = refreshSetup({ APP_FRONTEND_ORIGIN: 'https://pos.test' }, async () => Response.json({}, { status: 401 }));
  await assert.rejects(rejected.refreshSpringSession('revoked'), error => error.status === 401 && error.reason === 'BACKEND_REFRESH_REJECTED');
  const invalid = refreshSetup({ APP_FRONTEND_ORIGIN: 'https://pos.test' }, async () => new Response(JSON.stringify({ token: jwt(Date.now()/1000+900, undefined, { accountId: undefined }) }), { headers: { 'Set-Cookie': 'pos_refresh=rotation; HttpOnly;' } }));
  await assert.rejects(invalid.refreshSpringSession('invalid'), error => error.reason === 'MISSING_IDENTITY_CLAIM' && error.status !== 401);
});

test('authenticated forced refresh detects revocation before access expiry', async () => {
  const errorService = load('lib/spring-session-refresh.ts', { 'node:crypto': { createHash, randomUUID } });
  const options = load('lib/next-auth.ts', {
    '@/lib/session-identity': identity,
    '@/lib/spring-session-refresh': { SessionRefreshError: errorService.SessionRefreshError, refreshSpringSession: async () => { throw new errorService.SessionRefreshError(401, 'revoked'); } },
    '@/lib/session-cookie-bridge': { isSessionRefreshRequested: () => true, captureRefreshCookie() {}, browserMetadataHeaders: () => ({}) },
    'next-auth/providers/credentials': { default: config => config },
  }).authOptions;
  const token = await options.callbacks.jwt({ token: { ...expired, accessTokenExpires: Date.now()/1000+900, accessToken: jwt(Date.now()/1000+900), refreshCredential: 'revoked' } });
  assert.equal(token.error, 'AccessTokenExpired');
  assert.equal(token.refreshReason, 'BACKEND_REFRESH_REJECTED');
  assert.equal(token.refreshCredential, null);
});

test('client session transport failure cannot clear tokens or redirect the auth guard', async () => {
  const hooks = { useEffect: effect => effect(), useState: initial => [initial, () => {}] };
  const session = { useSession: () => ({ status: 'unauthenticated', data: null, update: async () => null }) };
  const failFetch = async () => { throw new Error('offline'); };
  const sync = load('components/AuthTokenSync.tsx', {
    react: hooks, 'next-auth/react': session,
    '@/lib/auth': { clearAuthTokens: () => assert.fail('must retain tokens'), saveToken() {} },
  }, { fetch: failFetch, AbortController });
  sync.default();
  const guard = load('components/auth/AuthTokenGuard.tsx', {
    react: hooks, 'react/jsx-runtime': { jsx: () => null, jsxs: () => null }, 'next-auth/react': session,
    'next/navigation': { useRouter: () => ({ replace: () => assert.fail('must not redirect') }), usePathname: () => '/factory/receiving', useSearchParams: () => new URLSearchParams() },
  }, { fetch: failFetch, AbortController });
  guard.default({ children: null });
  await new Promise(resolve => setTimeout(resolve, 5));
});

test('pre-connection refusal recovers with the same valid credential after backend availability returns', async () => {
  let attempts = 0;
  const service = refreshSetup({ APP_FRONTEND_ORIGIN: 'https://pos.test' }, async () => {
    if (++attempts === 1) throw new TypeError('fetch failed', { cause: Object.assign(new Error('private connection details'), { code: 'ECONNREFUSED' }) });
    return refreshedResponse();
  });
  await assert.rejects(service.refreshSpringSession('valid-unconsumed'));
  const result = await service.refreshSpringSession('valid-unconsumed');
  assert.equal(result.refreshToken, 'rotated');
  assert.equal(attempts, 2);
});

test('pre-rotation origin rejection recovers after correction; arbitrary 403 remains non-replayable', async () => {
  for (const shape of ['cors', 'controller', 'unknown']) {
    let attempts = 0;
    const service = refreshSetup({ APP_FRONTEND_ORIGIN: 'https://pos.test' }, async () => {
      if (++attempts > 1) return refreshedResponse();
      return shape === 'controller' ? Response.json({ error: 'FORBIDDEN', message: 'An allowed Origin is required', path: '/api/auth/refresh' }, { status: 403 })
        : new Response(shape === 'cors' ? 'Invalid CORS request' : 'generic denial', { status: 403 });
    });
    await assert.rejects(service.refreshSpringSession('credential'));
    if (shape === 'unknown') {
      await assert.rejects(service.refreshSpringSession('credential'), error => error.reason === 'CACHED_REFRESH_FAILURE' && error.upstreamStatus === 403);
      assert.equal(attempts, 1);
    } else {
      assert.equal((await service.refreshSpringSession('credential')).refreshToken, 'rotated');
      assert.equal(attempts, 2);
    }
  }
});

function redisHarness() {
  const records = new Map();
  const env = { VERCEL: '1', REMOTE_API_BASE_URL: 'https://backend.test', APP_FRONTEND_ORIGIN: 'https://pos.test',
    SESSION_REDIS_REST_URL: 'https://redis.test', SESSION_REDIS_REST_TOKEN: 'test-only' };
  let loseAck = false, failCleanup = false, refuse = false, backendPosts = 0;
  const request = async (url, init) => {
    if (url !== 'https://redis.test') {
      backendPosts++;
      if (refuse) { refuse = false; throw new TypeError('fetch failed', { cause: { code: 'ECONNREFUSED' } }); }
      return refreshedResponse();
    }
    const [command, key, value, mode, claim] = JSON.parse(init.body);
    if (command === 'EVAL') {
      if (failCleanup) return Response.json({}, { status: 503 });
      const result = records.get(mode) === claim ? Number(records.delete(mode)) : 0;
      return Response.json({ result });
    }
    if (command === 'GET') return Response.json({ result: records.get(key) ?? null });
    if (mode === 'NX' && records.has(key)) return Response.json({ result: null });
    records.set(key, value);
    if (loseAck) { loseAck = false; throw new Error('Redis acknowledgement lost'); }
    return Response.json({ result: 'OK' });
  };
  return { records, env, request, get posts() { return backendPosts; }, loseNextAck() { loseAck = true; },
    failCleanup(value) { failCleanup = value; }, refuseConnection() { refuse = true; } };
}

test('lost Redis SET acknowledgement releases only its owned unused pending claim before safe recovery', async () => {
  const state = redisHarness(); state.loseNextAck();
  const service = refreshSetup(state.env, state.request);
  await assert.rejects(service.refreshSpringSession('credential'), error => error.reason === 'REDIS_FAILURE');
  assert.equal(state.posts, 0);
  assert.equal([...state.records.values()].map(value => JSON.parse(value))[0].state, 'pending');
  const result = await service.refreshSpringSession('credential');
  assert.equal(result.refreshToken, 'rotated');
  assert.equal(state.posts, 1);
});

test('Redis cleanup outage after proven non-consumption recovers without stranding the pending record', async () => {
  const state = redisHarness(); state.refuseConnection(); state.failCleanup(true);
  const service = refreshSetup(state.env, state.request);
  await assert.rejects(service.refreshSpringSession('credential'), error => error.reason === 'NETWORK_FAILURE');
  assert.equal(state.posts, 1);
  await assert.rejects(service.refreshSpringSession('credential'), error => error.reason === 'REDIS_FAILURE' && error.redisStatus === 503);
  assert.equal(state.posts, 1);
  state.failCleanup(false);
  assert.equal((await service.refreshSpringSession('credential')).refreshToken, 'rotated');
  assert.equal(state.posts, 2);
});

test('backend URL configuration is validated before creating any Vercel pending claim', async () => {
  const state = redisHarness(); state.env.REMOTE_API_BASE_URL = 'invalid';
  const service = refreshSetup(state.env, state.request);
  await assert.rejects(service.refreshSpringSession('credential'), error => error.reason === 'MISSING_CONFIGURATION');
  assert.equal(state.records.size, 0); assert.equal(state.posts, 0);
  state.env.REMOTE_API_BASE_URL = 'https://backend.test';
  assert.equal((await service.refreshSpringSession('credential')).refreshToken, 'rotated');
});

test('timeout and malformed success are diagnosed and cached without replaying an uncertain rotation', async () => {
  for (const kind of ['timeout', 'invalid-response', 'http503']) {
    let posts = 0; const logs = [];
    const service = load('lib/spring-session-refresh.ts', { 'node:crypto': { createHash, randomUUID } }, {
      process: { env: { APP_FRONTEND_ORIGIN: 'https://pos.test' } }, console: { error: (...values) => logs.push(values) },
      fetch: async () => {
        posts++;
        if (kind === 'timeout') throw Object.assign(new Error('DO-NOT-LOG-THIS'), { name: 'TimeoutError' });
        return kind === 'http503' ? new Response('DO-NOT-LOG-THIS', { status: 503 }) : Response.json({ token: 'DO-NOT-LOG-THIS' });
      },
    });
    const reason = kind === 'timeout' ? 'NETWORK_TIMEOUT' : kind === 'http503' ? 'BACKEND_REFRESH_FAILURE' : 'INVALID_REFRESH_RESPONSE';
    await assert.rejects(service.refreshSpringSession('PRIVATE-CREDENTIAL'), error => error.reason === reason);
    await assert.rejects(service.refreshSpringSession('PRIVATE-CREDENTIAL'), error => error.reason === 'CACHED_REFRESH_FAILURE' && error.originalReason === reason && error.cached);
    assert.equal(posts, 1);
    assert.ok(!JSON.stringify(logs).includes('DO-NOT-LOG-THIS'));
    assert.ok(!JSON.stringify(logs).includes('PRIVATE-CREDENTIAL'));
    assert.equal(logs[0][1].upstreamStatus, kind === 'timeout' ? null : kind === 'http503' ? 503 : 200);
  }
});

test('cleanup cannot delete another worker result; old pending records are never stolen', async () => {
  const state = redisHarness(); state.loseNextAck();
  const service = refreshSetup(state.env, state.request);
  await assert.rejects(service.refreshSpringSession('credential'));
  const key = [...state.records.keys()][0];
  const done = JSON.stringify({ state: 'done', result: { data: { token: jwt(Date.now()/1000+900) }, refreshToken: 'other-result', cookies: [] } });
  state.records.set(key, done);
  assert.equal((await service.refreshSpringSession('credential')).refreshToken, 'other-result');
  assert.equal(state.records.get(key), done);
  assert.equal(state.posts, 0);

  const pendingState = redisHarness();
  let now = Date.now(); class Clock extends Date { static now() { return now; } }
  const hash = createHash('sha256').update('uncertain').digest('hex');
  const pending = JSON.stringify({ state: 'pending' }); // Legacy worker: outcome unknown.
  pendingState.records.set(`pos:refresh:v1:${hash}`, pending);
  const follower = load('lib/spring-session-refresh.ts', { 'node:crypto': { createHash, randomUUID } }, {
    Date: Clock, process: { env: pendingState.env }, fetch: pendingState.request,
    setTimeout: resolve => { now += 10001; resolve(); },
  });
  for (let i = 0; i < 2; i++) await assert.rejects(follower.refreshSpringSession('uncertain'), error => error.reason === 'CACHED_REFRESH_FAILURE' && error.originalReason === 'REFRESH_OUTCOME_UNKNOWN');
  assert.equal(pendingState.posts, 0);
  assert.equal(pendingState.records.get(`pos:refresh:v1:${hash}`), pending);
});

test('JWT callback renews the same session after a proven pre-connect failure and its retry backoff', async () => {
  let now = Date.now(), attempts = 0;
  class Clock extends Date { static now() { return now; } }
  const env = { APP_FRONTEND_ORIGIN: 'https://pos.test' };
  const service = load('lib/spring-session-refresh.ts', { 'node:crypto': { createHash, randomUUID } }, {
    Date: Clock, process: { env }, fetch: async () => {
      if (++attempts === 1) throw new TypeError('fetch failed', { cause: { code: 'ECONNREFUSED' } });
      return refreshedResponse();
    },
  });
  const { authOptions: options } = load('lib/next-auth.ts', {
    '@/lib/spring-session-refresh': service,
    '@/lib/session-cookie-bridge': { captureRefreshCookie() {}, browserMetadataHeaders: () => ({}), isSessionRefreshRequested: () => false },
    'next-auth/providers/credentials': { default: config => config },
  }, { Date: Clock });
  let token = await options.callbacks.jwt({ token: { ...expired, refreshCredential: 'valid-credential' } });
  assert.equal(token.error, 'RefreshTemporarilyUnavailable');
  assert.equal(token.refreshReason, 'NETWORK_FAILURE');
  assert.equal(token.refreshCredential, 'valid-credential');
  token = await options.callbacks.jwt({ token });
  assert.equal(attempts, 1); // Respect the existing backoff.
  now += 16000;
  token = await options.callbacks.jwt({ token });
  assert.equal(token.error, undefined);
  assert.equal(token.refreshCredential, 'rotated');
  assert.equal(attempts, 2);
  assert.equal(identity.sessionIdentity(token.accessToken), identity.sessionIdentity(expired.accessToken));
  const session = await options.callbacks.session({ session: { user: {} }, token });
  assert.equal(session.accessToken, token.accessToken);
  assert.equal(session.refreshReason, null);
  assert.equal(session.refreshCredential, undefined);
});

test('invalid Redis records are re-read after repair without caching a permanent failed promise or posting upstream', async () => {
  for (const corrupt of ['null', '{}', '{"state":"done","result":null}']) {
    const state = redisHarness();
    const key = `pos:refresh:v1:${createHash('sha256').update('credential').digest('hex')}`;
    state.records.set(key, corrupt);
    const service = refreshSetup(state.env, state.request);
    await assert.rejects(service.refreshSpringSession('credential'), error => error.reason === 'REDIS_FAILURE');
    state.records.set(key, JSON.stringify({ state: 'done', result: { data: { token: jwt(Date.now()/1000+900) }, refreshToken: 'rotated', cookies: [] } }));
    assert.equal((await service.refreshSpringSession('credential')).refreshToken, 'rotated');
    assert.equal(state.posts, 0);
  }
});
