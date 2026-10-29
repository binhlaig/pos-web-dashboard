# Packing order deletion

`DELETE /api/factory/orders/{id}` requires the existing authenticated USER/ADMIN Factory owner session. Shop ownership comes only from the validated principal.

Request: `Content-Type: application/json`, body `{"version":0}`. The frontend gateway is `/api/factory/packing-gateway/orders/{id}` and additionally requires same-origin writes. No idempotency header is required for DELETE.

Success: HTTP 200, `{"id":"<uuid>","deleted":true,"version":1}`. Only unreferenced DRAFT orders qualify. The original order, document, number, client draft identity and idempotency rows remain. The deletion timestamp and authenticated user ID are recorded. No inventory or reservation quantity is modified.

An exact repeat with the original pre-delete version returns the same tombstone. A different version returns 409 `STALE_VERSION`, including currentVersion. This makes a lost-response retry safe without letting an old request affect a changed order.

Errors:

- 400: malformed UUID, missing/nonintegral/negative version or invalid JSON.
- 401: missing or invalid authenticated account session.
- 403: authenticated account lacks Factory owner permissions.
- 404: missing order or order belonging to another shop. Deleted orders also return 404 on normal GET/update/transition and create replay.
- 409 `STALE_VERSION`: reopen the latest server order before making a new decision.
- 409 `INVALID_STATUS`: CONFIRMED orders must use the existing cancellation workflow; CANCELLED history is retained.
- 409 `ORDER_REFERENCED`: reservation history (including released reservations), dispatch history (all statuses), fulfillment or dispatch movements require retention.
- 409 `CLIENT_DRAFT_CONFLICT` / `IDEMPOTENCY_CONFLICT`: conflicting historical identity or retry payload.

V52 adds deletion audit fields, a live-history index, reference checks and live-parent guards. V47/V48 and other existing migrations remain unchanged. All existing identity, confirmed snapshot, cancellation and physical deletion guards remain. Deleted rows cannot be edited or restored. Unique order numbers/client identities and cached command records are not recycled. Create replay with the original key or client identity cannot restore a deleted order.

The browser persists the exact DELETE request before sending. An unverified response, network error or 5xx retains the active draft and pending command. Only a verified tombstone clears the active server selection and retry record, then refreshes the list. Definitive errors keep the draft; stale-version conflicts block another deletion until reopening. Historical browser import records are preserved and their server identities remain protected against recreation.

Validation:

- Backend: PackingControllerTest, PackingDeletePermissionTest, PackingDeletePostgresTest, DispatchControllerTest and DispatchMigrationPostgresTest: 21 passed, none skipped. PostgreSQL 16 disposable costing_test database; transactions, locks and real Flyway migrations exercised.
- Frontend: `node --test tests/packing-delete.test.mjs tests/factory-raw-proxy.test.mjs`: 11 passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed (existing workspace-root and Mongoose index warnings).
- Broader `tests/factory.test.mjs`: 6 passed, 2 failed in untouched factory shell NavbarDemo mocking and middleware callback expectations.
- Responsive styles: existing full-width/34rem drawer, wrapping action rows and bounded dialog. Actual desktop/iPad 1194x834 browser visual verification remains outstanding; no browser automation is installed.

Changed frontend files:

- app/api/factory/packing-gateway/[...path]/route.ts
- app/factory/packing/page.tsx
- tests/packing-delete.test.mjs
- docs/packing-order-delete.md

Changed backend files:

- src/main/java/com/binhlaig/pos/factory/packing/PackingController.java
- src/main/java/com/binhlaig/pos/factory/packing/PackingService.java
- src/main/resources/db/migration/V52__factory_packing_order_soft_delete.sql
- src/test/java/com/binhlaig/pos/factory/packing/PackingControllerTest.java
- src/test/java/com/binhlaig/pos/factory/packing/PackingDeletePermissionTest.java
- src/test/java/com/binhlaig/pos/factory/packing/PackingDeletePostgresTest.java
- docs/packing-order-delete.md

No deployment or merge was performed.
