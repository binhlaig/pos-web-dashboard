# Automatic logout investigation and fix

## Evidence and backend contract

Reviewed backend main at commit `95ca2c99ffacbb56d8d802ba7a6a7457ab2d8e50` on 2026-10-28. Backend source is available; no backend changes were necessary. This does not establish the version or configuration currently deployed.

- `auth/JwtService.java`: USER access JWTs contain `sid`, `type=USER`, `accountId`, `shopId`, `shopCode`, `role`, and `sub=<user database id>`. STAFF JWTs contain the same identity fields with `type=STAFF`, `accountId=<staff database id>`, `sub=staff:<shopId>:<staff database id>`, plus informational `staffId` and role. A staff business/login ID is not the database account ID.
- `auth/AuthService.java`: both login paths create a device session, pass its UUID as `sid`, and set an HttpOnly refresh cookie. Refresh reuses the same session UUID and reconstructs the same account/shop identity. Owner and staff are separate account types even when numeric IDs overlap.
- The refresh credential is **opaque random data, not a JWT**. It has no JWT claims. The database session binds it to account type, account ID, shop ID, device ID, and absolute expiry. Device ID itself is installation metadata, not an authentication credential or access-token claim.
- `auth/session/SessionService.java`: refresh rotates a single-use credential under database locks. Replaying a consumed credential revokes the device session. Rotation does not move the session's absolute expiry. Access validation also checks the live session/account/shop, so possession of a signed JWT alone is insufficient.
- `auth/session/SessionCookies.java`: cookie defaults are HttpOnly, Secure, SameSite=Lax, Path=/api/auth; cookie lifetime is remaining absolute session time. Refresh requires an explicitly allowed Origin.
- `application.yml`: default access lifetime is 900000 ms (15 minutes); refresh session is 64800 seconds (18 hours).

Source: https://github.com/Sanlinns/spring_pos_api/tree/95ca2c99ffacbb56d8d802ba7a6a7457ab2d8e50/src/main/java/com/binhlaig/pos/auth

## Supported causes

The current backend source does provide stable `sid` on login and refresh. Therefore a deployed missing-SID contract mismatch cannot be asserted from the supplied logs. The previous frontend converted missing SID and SID mismatch into the same 401/AccessTokenExpired outcome as actual revocation, hiding the distinction. Tests previously provided only SID-bearing token fragments, leaving the real account/shop/staff contract untested.

A separate, definite code path explains automatic signout during refresh outages: NextAuth keeps a temporary failure but withholds an expired access token; `/api/auth/business-type` previously returned 401 for that missing access token; `BusinessAccessGate` interpreted 401 as unauthenticated and called signOut. Server requireUser and several timecard/API clients also equated a missing/expired access token or any API 401 with logout. A server-side refresh rejection could redirect to sign-in while middleware still saw an older valid NextAuth cookie and redirected back, creating a loop.

The old cookie-only browser refresh fallback could rotate a different credential from the one inside NextAuth and did not persist the encrypted NextAuth JWT. Module-local coordination was lost during development reload. Redis preflight/follower read failures could poison a local alias for the entire session even though that worker had sent no upstream refresh POST.

The supplied runtime logs do not identify which of these branches occurred in production. The patch fixes the verified branches and adds safe reason codes so a remaining deployment mismatch is distinguishable.

## Changed behavior and files

- `lib/session-identity.ts`, `lib/next-auth.ts`: validate required SID, account type, account ID, subject, shop ID/code and their continuity. Validate the previous login identity before consuming a refresh credential. Missing identity is a recoverable contract error; mismatched identity is rejected. No fallback accepts identity-less tokens. Credentials stay out of the public session.
- `lib/spring-session-refresh.ts`: preserve single-flight aliases across module reloads and shared Redis coordination across workers. Redis preflight and follower reads can recover without replaying upstream POSTs. Retain locally successful rotation if Redis publication fails. Unknown upstream outcomes remain blocked; they are never retried blindly. Standalone refresh responses also require the full identity contract.
- `lib/session-cookie-bridge.ts`, `app/api/auth/refresh/route.ts`, `lib/session-proxy.ts`: retain request-local cookie capture across module reloads, persist both rotated cookies for NextAuth refresh requests, and preserve standalone staff refresh support. Forced refresh is enabled only inside the origin-checked refresh handler, using the encrypted server credential. It does not trust browser-supplied identity. The existing `[...nextauth]` handler remains wrapped in the bridge.
- `lib/api.ts`, `lib/backend-api.ts`, `lib/timecard/api.ts`, `app/timecard/api.ts`: coordinate session renewal, verify identity, and retry an explicit API authentication rejection at most once. A fresh-token 401 does not erase the global session. The forced refresh path detects genuine revocation even before access expiry. Network failures and uncertain refresh POSTs are not replayed.
- `app/api/auth/business-type/route.ts`, `lib/session.ts`: temporary refresh failures remain recoverable instead of masquerading as unauthenticated sessions. Authenticated identity may render the protected shell; expired bearer credentials are still withheld from API calls.
- `components/Providers.tsx`, `components/AuthTokenSync.tsx`, `components/auth/AuthTokenGuard.tsx`, `components/auth/SyncUser.tsx`, `components/factory/BusinessAccessGate.tsx`: poll the session every minute and on focus, present a retry state, and avoid restoring stale browser credentials from user synchronization. Confirm client-side unauthenticated states against the server before clearing tokens or redirecting, so session transport failures remain recoverable.
- `middleware.ts`: allow sign-in to render when access is expired or session recovery is pending, avoiding stale-cookie redirect loops. Protected routes still reject definitively revoked/expired NextAuth sessions.
- `app/timecard/page.tsx`, `app/dashboard/timecard/page.tsx`, `app/admin/time_card/page.tsx`, `lib/device-session-login.ts`: missing access credentials during recovery do not trigger automatic logout or falsely report definitive expiry.
- `tests/session-refresh.test.mjs`: real USER/STAFF claim fixtures, identity violations, temporary/definitive failure, stale server-cookie alias advancement, concurrent callers/workers, Redis repair, hot reload, encrypted NextAuth serialization, isolated bridge cookies, forced revocation checks, and redirect-loop coverage.

The sign-in page, header/profile logout effects, and factory gate still sign out on definitive AccessTokenExpired. Explicit user logout behavior is unchanged. The access lifetime was not extended.

Safe diagnostic codes: `MISSING_REFRESH_CREDENTIAL`, `BACKEND_REFRESH_REJECTED`, `MISSING_IDENTITY_CLAIM`, `IDENTITY_MISMATCH`, `TEMPORARY_REFRESH_FAILURE`. Logs include reason/stage only, never credentials, cookies, raw upstream bodies, or Redis secrets.

## Validation and limits

- `node --test --test-isolation=none tests/session-refresh.test.mjs`: 23/23 pass.
- `npx tsc --noEmit`: pass.
- Production build: pass (final result also reported in the task response).
- Full suite: 62/65 pass; three existing failures reproduced using the original HEAD middleware/business-type source: missing CalendarDays mock in calendar test, missing NavbarDemo mock in factory drawer test, and factory test expecting /entry although existing middleware routes directly to the callback/dashboard. These unrelated tests/assertions were not weakened or changed.
- Backend code was unchanged, so backend tests were not run.
- No live account, production Redis, deployment, or browser/backend end-to-end session was exercised. The passing tests and build do not establish that production is resolved. Validate with a test account across the 15-minute boundary, two tabs, server navigation, revocation and a temporary outage; verify both Set-Cookie headers without copying their values into logs.

## Deployment requirements

No new environment variable names and no backend deployment are required if the deployed backend matches the reviewed contract.

Existing required settings: stable `NEXTAUTH_SECRET`; correct NextAuth URL; `APP_FRONTEND_ORIGIN` matching the browser origin and the backend allowed-origin list; `REMOTE_API_BASE_URL` (or existing public base fallback). For Vercel/multiple workers, configure the shared `SESSION_REDIS_REST_URL` HTTPS endpoint and `SESSION_REDIS_REST_TOKEN`, consistently across workers. `SESSION_REQUIRE_SHARED_STORE=true` enforces the same policy outside Vercel. Do not use a local-only cache for multiple production workers.

Keep backend defaults `APP_JWT_EXPIRATION_MS=900000` and `APP_SESSION_REFRESH_TTL_SECONDS=64800`, with browser-compatible Secure/SameSite cookie settings. The patch does not change these values.

Existing conforming sessions can continue. A new sign-in is needed for a session already revoked by replay, already signed out, expired after 18 hours, or created with a legacy identity-less access token. If a refresh POST outcome was lost and no worker retained/published its rotated credentials, the UI stays recoverable but safe automatic recovery is impossible without backend idempotency/grace; the user may need to sign in again. We deliberately do not resend the consumed credential.

No deployment or push to main was performed.
