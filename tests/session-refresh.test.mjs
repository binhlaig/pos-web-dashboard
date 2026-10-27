import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createHash } from 'node:crypto';

function load(file, imports = {}, globals = {}) {
  const exports = {};
  const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText, { exports, require: name => imports[name],
    process: { env: {} }, Buffer, Response, Headers, URL, AbortSignal,
    setTimeout, console: { log() {}, error() {} }, ...globals });
  return exports;
}
const jwt = (exp, sid = 'session') => `header.${Buffer.from(JSON.stringify({ exp, sid })).toString('base64url')}.signature`;
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
test('sign-in redirects expired access sessions to an allowed route, never itself or another origin', async () => {
  const run = middleware(expired);
  for (const next of ['/dashboard', '/Sign_in?next=/dashboard', '/sign-in', '/a/../Sign_in', '/\\evil.test']) {
    const result = await run(request(`/Sign_in?next=${encodeURIComponent(next)}`));
    assert.equal(new URL(result.url).origin, 'https://pos.test');
    assert.equal(new URL(result.url).pathname, '/dashboard');
    assert.equal((await run(request(result.url))).status, 200);
  }
});
function refreshSetup(env, fetch) {
  return load('lib/spring-session-refresh.ts', { 'node:crypto': { createHash } }, { process: { env }, fetch });
}
function refreshedResponse() {
  return new Response(JSON.stringify({ token: jwt(Date.now() / 1000 + 900) }), {
    headers: { 'Set-Cookie': 'pos_refresh=rotated; HttpOnly; Max-Age=64800' },
  });
}
test('missing Redis configuration is retryable after repair and still fails closed on Vercel', async () => {
  const env = { VERCEL: '1', APP_FRONTEND_ORIGIN: 'https://pos.test' };
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
  const env = { VERCEL: '1', APP_FRONTEND_ORIGIN: 'invalid',
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
    '@/lib/session-cookie-bridge': { captureRefreshCookie() {}, browserMetadataHeaders: () => ({}) },
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
