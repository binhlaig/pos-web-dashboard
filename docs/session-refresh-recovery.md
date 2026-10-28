# Session renewal recovery follow-up

This continues the already-modified frontend at commit `1a33241`. The UI text is unchanged.

## Error trace

`components/auth/AuthTokenGuard.tsx` renders **Unable to renew your session right now** when NextAuth returns `RefreshTemporarilyUnavailable`, or when the client session transport fails. The related browser API errors originate in `lib/api.ts` after `getSession()` or the origin-checked POST `/api/auth/refresh`.

The NextAuth JWT callback calls `refreshSpringSession` when Spring access expiry is within 60 seconds, or when an authenticated forced refresh is requested. Helper failures become `RefreshTemporarilyUnavailable` unless refresh was definitively rejected with 401 or session identity mismatched. The session callback withholds expired access tokens. The helper coordinates a single-use backend POST `/api/auth/refresh` through a local promise/alias cache and, on Vercel, Redis. Spring's CORS filter and SessionCookies.requireOrigin run before rotation; AuthService/SessionService rotate under database transaction/locks.

## Verified defects fixed

1. **A failed promise could permanently strand an unused credential.** The helper treated a connection refusal, DNS failure, and an ambiguous post-send timeout identically. It kept the rejected promise until session expiry, so backend recovery did not permit renewal. A regression test using ECONNREFUSED fails against the helper from the start of this turn and passes against the patch. This is a deterministic code reproduction using mocked network responses, not proof of the deployed trigger.
2. **A lost Redis SET acknowledgement could leave an unused pending claim for 18 hours.** The worker never sent an upstream POST but did not retain ownership/cleanup information. Pending records now include a random owner identifier. The worker retains cleanup for its own attempt and releases it through an atomic compare-and-delete EVAL. Cleanup is retried after Redis recovers and cannot delete another worker's result. It is never performed after a potentially consumed POST. Legacy/unknown pending records are not stolen.
3. **Backend URL validation happened too late.** Invalid backend URLs could create pending Redis claims before fetch failed without sending any request. Configuration validation now completes before claiming a credential. Production no longer silently falls back to localhost when the backend URL is missing.
4. **Diagnostics hid the original failure.** They now distinguish original errors from cached failures and record upstream HTTP status separately from the frontend recovery status. Corrupt Redis records are reported as retryable Redis reads rather than permanently cached TypeErrors.

Only failures proven not to have consumed the credential can permit another upstream attempt: configuration failures before dispatch, refused/DNS/connection-establishment failures, and the verified pre-rotation Spring origin/CORS rejection shapes. Generic 403 responses are not sufficient proof. Redirects are not followed, so a consumed request followed by a failed redirected connection cannot be misclassified as an unused credential.

Timeouts after dispatch, resets, HTTP 5xx, malformed successful responses, and other uncertain outcomes remain cached/non-replayable. A follower can re-read Redis after failure; it cannot take over a pending rotation. A successful rotation is still retained locally if publishing it to Redis fails. The Redis credential must permit the EVAL compare-and-delete command in addition to existing GET/SET commands.

## Diagnostics

The server emits a structured `[Session refresh]` event with reason, stage, upstreamStatus, redisStatus, cached, safeToRetry, and optional originalReason/configuration name. Configuration names are logged; values never are. No error messages/stacks, URLs, response bodies, credentials, tokens, cookies, passwords, Redis secrets, or credential hashes are logged by this diagnostic path.

| Reason | Meaning |
| --- | --- |
| MISSING_REFRESH_CREDENTIAL | No server refresh credential; sign-in required |
| BACKEND_REFRESH_REJECTED | Upstream 401 or 403; upstreamStatus identifies which. Confirmed 401 requires sign-in; verified origin 403 is recoverable |
| MISSING_IDENTITY_CLAIM | Required claim absent; no identity-less session is accepted |
| IDENTITY_MISMATCH | Session/account/shop/type/subject mismatch; rejected |
| MISSING_CONFIGURATION | Origin, backend URL, or required shared Redis settings missing/invalid; configuration identifies the setting |
| REDIS_FAILURE | Redis network/HTTP/response/record failure; redisStatus records HTTP status when available |
| NETWORK_TIMEOUT | Backend timeout; remains non-replayable unless connection establishment is proven not completed |
| NETWORK_FAILURE | Other backend connection failure; only proven pre-connect failures can retry |
| INVALID_REFRESH_RESPONSE | Missing/invalid JWT or rotated HttpOnly cookie, or invalid expiry |
| BACKEND_REFRESH_FAILURE | Other upstream HTTP failure; upstreamStatus preserves the real status |
| CACHED_REFRESH_FAILURE | A previous failed attempt or unknown pending record; originalReason retains the available cause |

NextAuth propagates safe reason/status metadata into its session response, and the compatibility refresh route/proxy return that metadata. No refresh credential enters the public session.

## Backend evidence and limits

Reviewed backend source at `95ca2c99ffacbb56d8d802ba7a6a7457ab2d8e50`, also confirmed in the local backend worktree. Login and refresh access JWTs have stable sid, type USER/STAFF, accountId, shopId, shopCode and account-specific sub; STAFF sub is staff:<shopId>:<database staff id>. The refresh cookie is an opaque random single-use credential. The database session binds it to account, shop, device and absolute expiry. Cookie defaults are pos_refresh, HttpOnly, Secure, SameSite=Lax, Path=/api/auth. Refresh reissues the same session identity and uses remaining session lifetime.

Real HTTP probes against the configured local backend, with **no login or refresh credentials**, verified:

- GET /actuator/health: 200.
- POST /api/auth/refresh with the configured allowed Origin and no credential: 401, UNAUTHORIZED, clearing refresh cookie.
- POST /api/auth/refresh with a disallowed Origin and no credential: 403, exact Spring CORS rejection before controller processing, no rotation cookie.

These probes do not validate a successful authenticated refresh, a 15-minute boundary, or Vercel. The Vercel environment/logs are unavailable in this workspace. Missing shared Redis configuration on Vercel is a known preflight blocker in this code, **not a verified deployment finding**. No production root trigger is asserted without its safe reason/status event. No backend code was changed and no backend test suite was run.

Account/shop/staff/owner/device continuity checks remain enabled. Access lifetime remains 15 minutes; refresh session remains the intended absolute 18 hours. The error UI, logout checks and business features were not replaced or disabled.

## Changed files and checks

- lib/spring-session-refresh.ts: safe retry classification, owned Redis cleanup, earlier configuration validation, explicit cached-failure metadata and diagnostics.
- lib/next-auth.ts: original reason/upstream status logging and safe session metadata; existing definitive rejection behavior retained.
- lib/session-proxy.ts and app/api/auth/refresh/route.ts: preserve safe reason/status metadata.
- tests/session-refresh.test.mjs: recovery, lost acknowledgement, failed cleanup, ownership, corrupt-record repair, original/cached diagnostics, credential-safe logs, and full helper-to-JWT callback backoff/recovery regressions. Existing assertions remain.

Focused tests: 32/32 pass. Type checking: pass. Full suite: 71/74 pass, with the same three pre-existing calendar/factory failures documented in session-refresh-fix.md. Production build: pass (68 pages generated). git diff --check: pass.

Deployment still requires an HTTPS SESSION_REDIS_REST_URL and SESSION_REDIS_REST_TOKEN shared across Vercel workers, plus the existing origin/backend/NextAuth configuration. No secret values were changed. A new sign-in may be needed for credentials stranded by an old unknown-outcome Redis pending record; clearing that record or replaying its credential is unsafe without evidence of non-consumption. Fresh attempts benefit from the new owned-cleanup mechanism. No deployment or push was performed.
