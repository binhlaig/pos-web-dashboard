# Current deployment: Redis with the existing backend refresh endpoint

The frontend now always uses `POST /api/auth/refresh` with shared Redis coordination in production. It does not call `/api/auth/refresh/idempotent` or require `X-Refresh-Contract`. No backend change or migration is required for this path. `SESSION_REFRESH_COORDINATION=backend-idempotency` no longer selects an endpoint and can be removed from Vercel.

Configure one complete server-only pair in the Vercel Production environment:

- `SESSION_REDIS_REST_URL` and `SESSION_REDIS_REST_TOKEN`, or
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

A complete SESSION pair takes precedence. Values are trimmed; credentials are never mixed between pairs. Use an HTTPS REST endpoint and a writable token. Missing/invalid configuration fails before upstream rotation; production never falls back to process-local-only coordination. Redeploy after setting variables. Keep the existing `APP_FRONTEND_ORIGIN`, backend URL and stable `NEXTAUTH_SECRET` settings.

Refresh rotation coordination, identity checks, cookie bridging and temporary-failure recovery are preserved. An uncertain refresh outcome is not replayed. An already stranded or revoked session may require a new sign-in; do not clear Redis replay records to force retries. Existing access-token and session lifetimes are unchanged by this frontend fix.

Validation uses mocked network responses, including independent workers sharing a Redis fixture. Production/browser renewal still needs verification after deployment. The historical database-backed implementation below is retained as background only and is NOT the deployment path for this frontend version.

---

# Redis regression and database-backed renewal

## Introducing change and cause

`7ec21f103a4e35722f31a1c9a713bff6399474f2` (`update factory`, October 20, 2026 JST) introduced mandatory Redis coordination on Vercel, automatic server refresh, and refresh credentials inside encrypted NextAuth cookies. Its parent proxied browser refresh cookies directly; NextAuth marked expired access tokens expired rather than renewing them. Absence of a Redis error before this change does not demonstrate reliable 18-hour automatic renewal.

`0222cf6` refined preflight failures. `1a33241` (`update session`, October 28) added identity continuity and recovery/UI changes but retained Redis. `0b0eb91` and `aa3f009` retained it and expanded recovery/diagnostics. The reported `MISSING_CONFIGURATION / SESSION_REDIS_REST_URL_OR_TOKEN` rejects renewal before the backend POST. NextAuth returns `RefreshTemporarilyUnavailable`, producing the reported UI. The introducing helper was executed directly from git with Vercel enabled and no Redis: 503 and zero upstream calls.

The available backend checkout is `C:/Users/Owner/Desktop/pos_project/backend_spring_boot/spring_pos_api`, based on `61b6aa9`. Its existing refresh contract rotates opaque single-use credentials under database locks. Reuse revokes the device session. It had no idempotency/grace support. A process-local promise cannot coordinate Vercel workers/cold starts; short locks cannot recover lost rotation responses. Stale encrypted cookies can outlive several rotations.

## Fix

Frontend changes are confined to the refresh helper and session tests. Vercel without either Redis setting uses `POST /api/auth/refresh/idempotent`. Other deployments can select it with `SESSION_REFRESH_COORDINATION=backend-idempotency`. Existing Redis coordination remains available; partial Redis configuration still fails closed.

Requests carry a deterministic, domain-separated HMAC of the credential using the existing stable `NEXTAUTH_SECRET`. This retry identifier stays server-side. This mode has no frontend result cache: every attempt checks the backend, including stale aliases and forced revocation checks. Timeout, lost response, malformed response and 5xx can retry the same identifier after existing NextAuth backoff.

The backend fix is applied to its checkout. [The accompanying patch](backend-session-idempotency.patch) contains the same changes for review:

- Dedicated endpoint and security allowlist entry. Older workers cannot consume requests through the legacy endpoint. `X-Refresh-Contract: database-idempotency-v1` distinguishes definitive rejection from a generic old-worker 401/404. There is no fallback POST.
- Migration `V56__refresh_request_idempotency.sql` stores a hashed retry identifier with consumed-token records and an encrypted current successor with the device session. AES-GCM uses a domain-separated key derived from the existing backend JWT secret; ciphertext is bound to the session UUID.
- Retry state and rotation commit atomically under existing account/shop database locks. Matching retries return the current successor, even for a cookie several rotations behind. Access tokens remain 15 minutes and absolute session expiry never moves.
- Every retry checks live expiry, revocation, account status, owner/staff identity, shop identity and entitlement. Reuse without the matching identifier still revokes. Legacy clients retain single-use behavior. Login and cookie attributes remain unchanged.

Returning the current successor is needed for stale server-rendered cookies throughout the session; one previous-token grace window would not cover that case. No new cache service or secret is required. Frontend and backend secrets must remain stable across their respective workers; secret rotation requires fresh sessions.

## Validation

- Frontend session tests: 37/37 pass. Production Redis-free path, independent worker instances, identical private identifiers, temporary/lost-response recovery, stale-cookie revocation, generic old-worker 401, plus existing identity, cookie bridge and forced-refresh coverage. Network responses are mocked.
- Backend: 29 `SessionIntegrationTest` and 2 `SessionConfigurationTest` tests pass against a new disposable PostgreSQL 16 database. Tests exercise real Spring security/controller code, migration SQL and database transactions. New cases include four concurrent transactions, lost-response retry, multiple-generation stale aliases, rollback recovery, origin checks, HttpOnly cookie/path, 900-second access lifetime, unchanged absolute expiry, expiry rejection, device revocation, staff isolation and mismatched-identifier replay. Existing application collaborators are mocked by the integration fixture. This is not a deployed browser end-to-end test or a multi-JVM load test.
- `npx tsc --noEmit`: pass.
- Full frontend suite: 83/86 pass. The three failures concern unchanged calendar/factory code: missing CalendarDays mock, missing NavbarDemo mock, and an old middleware callback expectation. The earlier session investigation also records these failures. Unrelated tests were not weakened.
- Frontend/backend `git diff --check`: pass. Backend patch applies cleanly to its recorded base.

## Remaining deployment requirement

Deploy backend migration/code first, then frontend. No Redis/Upstash service is required for this path. Existing PostgreSQL, backend deployment, origin/backend URLs, NextAuth URL/secret, backend JWT secret and secure cookie settings remain required. Keep access lifetime at 900000 ms and session lifetime at 64800 seconds. Frontend-only deployment cannot supply the missing backend contract.

Credentials consumed by legacy rotations have no matching retry record. Sessions already revoked, expired or stranded after lost legacy responses may require fresh sign-in. Do not delete replay history or replay those credentials to bypass checks.

Nothing was pushed or deployed. No production credentials or deployment access were available. Successful Vercel/browser renewal across a real 15-minute boundary and 18-hour session has not been demonstrated. After deployment, validate a test account in two tabs across renewal, stale response ordering, a temporary outage and owner-triggered device revocation. This report supersedes the mandatory-Redis deployment guidance in the earlier session investigation documents.
