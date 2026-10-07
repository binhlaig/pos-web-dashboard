# Shop region currency implementation

## Repositories inspected

- Backend: `C:/Users/Owner/Desktop/pos_project/backend_spring_boot/spring_pos_api`
- Web: `C:/Users/Owner/Desktop/pos_project/web_dashboard/pos-web-dashboard`
- Desktop frontend: `C:/Users/Owner/Desktop/pos_project/pos_desktop_app`

No applicable project `AGENTS.md` was found in these repositories or their ancestors. Dependency-owned instructions were excluded. Existing user changes, including the web receipt settings page and backend region/timezone work, were retained.

## Findings and behavior

`Shop.region` is an enum with `JAPAN` and `MYANMAR`. Registration supplies that region. Existing migration V33 adds a non-null region with a MYANMAR default for legacy shops and explicitly avoids inferring country from previous timezones. Live database region values were not queried or modified.

Previously, `/api/shop/settings` exposed independently saved currency while `/api/receipt-settings/my-shop` omitted it. Web defaults and desktop persistent currency caches could therefore disagree with the shop region. Web authentication also preferred an old owner-token alias over the current canonical token.

The backend now derives all four currency fields from the validated account's shop, using `RegionCurrency`. Settings GET ignores conflicting persisted currency; settings PUT normalizes conflicting requested fields. Receipt settings return derived currency even when no receipt settings record exists. Owner/staff login and refresh responses and `/api/me/shop` also include the shop region.

- JAPAN: JPY, ¥, zero digits, BEFORE (`¥1,000`).
- MYANMAR: MMK, Ks, zero digits, AFTER (`1,000 Ks`).
- Missing backend region: explicit HTTP 409 rather than a Myanmar fallback.
- Frontend loading, missing or unsupported region: amounts have no currency label until authoritative settings arrive.

Both current-shop providers accept region-derived currency only. Web snapshots reset by authenticated identity and mask old currency during session synchronization. Desktop does not restore persisted currency caches, refreshes on settings/focus/online events, and rejects stale saves/fetches across account switches. Cookie-only settings requests do not share an account-independent response cache. Currency controls retain their layout but are disabled.

Dashboard, products/details, inventory/Out of Stock, register/cart/payment, reports and print consumers were inspected. Their active money displays already used the shared providers/formatters; the central changes propagate to those consumers. Remaining currency literals are supported mappings, disabled preset labels, parsing rules, comments, or denomination data rather than current-shop price labels. Desktop receipt HTML builders were exercised with supplied currency formatters.

## Historical receipts and migrations

Inspected POS receipts and restaurant orders/payments have no persisted currency snapshot fields. No historical rows, prices, stock, totals or exchange rates were changed. Historical receipt, order, reprint and refund displays now use a shared historical formatter: explicit currency snapshots retain their saved currency regardless of current region; records without snapshots show numeric amounts without an inferred currency label. Aggregate current-shop dashboard/report formatting still uses the live provider. New POS receipt printing uses region-derived currency. No historical currency was backfilled, and no new snapshot schema was introduced.

No Flyway migration was added: deriving settings on reads and normalizing them on writes removes the need to rewrite legacy persisted currency values. No existing migration was edited or run against production.

## Files changed by this task

Backend paths relative to `spring_pos_api`:

- `src/main/java/com/binhlaig/pos/shop/RegionCurrency.java` (new)
- `src/main/java/com/binhlaig/pos/shop/ShopSettingsService.java`
- `src/main/java/com/binhlaig/pos/shop/dto/ShopSettingsResponse.java`
- `src/main/java/com/binhlaig/pos/receiptsetting/service/ReceiptSettingService.java`
- `src/main/java/com/binhlaig/pos/receiptsetting/dto/ReceiptSettingResponse.java`
- `src/main/java/com/binhlaig/pos/auth/AuthService.java`
- `src/main/java/com/binhlaig/pos/auth/dto/AuthResponse.java`
- `src/main/java/com/binhlaig/pos/me/MeService.java`
- `src/main/java/com/binhlaig/pos/me/dto/MyShopResponse.java`
- `src/test/java/com/binhlaig/pos/shop/RegionCurrencyTest.java` (new)
- `src/test/java/com/binhlaig/pos/shop/ShopSettingsRegionTest.java` (new)

Web paths:

- `lib/auth.ts`
- `lib/currency.ts`
- `lib/currency-store.ts`
- `lib/settings-api.ts`
- `components/currency-provider.tsx`
- `components/settings/pos-settings-form.tsx`
- `components/settings/receipt-settings-card.tsx`
- `app/dashboard/receipt-settings/page.tsx`
- `app/dashboard/settings/page.tsx`
- `app/dashboard/receipts/page.tsx`
- `app/admin/orders/page.tsx`
- `tests/currency.test.mjs`
- `CURRENCY_REGION_AUDIT.md` (this report)

Desktop paths:

- `lib/currency.ts`
- `lib/settings-api.ts`
- `components/currency-provider.tsx`
- `app/(protected)/settings/shop/page.tsx`
- `app/(protected)/dashboard/receipts/page.tsx`
- `app/(protected)/settings/receipts/page.tsx`
- `app/(protected)/dashboard/restaurant/orders/page.tsx`
- `app/(protected)/settings/refund/page.tsx`
- `tests/currency.test.mjs`

## Verification

- Backend command: `mvnw.cmd test -Dtest=!PosApplicationTests -Dspring.flyway.enabled=false -Dspring.datasource.url=jdbc:postgresql://127.0.0.1:1/currency_test_disabled`
- Backend result: 130 discovered tests, 88 passed, 42 skipped, zero failures/errors. Includes both supported regions, conflicting saved/requested currency and missing-region handling.
- The unguarded `PosApplicationTests` application startup test was excluded to avoid using configured external database infrastructure. Integration/migration tests require an explicitly supplied disposable PostgreSQL database and were skipped.
- Web currency/auth tests: 9 passed.
- Desktop currency/cache/provider/receipt print tests: 15 passed.
- Both frontends: `npx tsc --noEmit` passed.
- Both frontends: final production builds, including TypeScript validation, passed after the historical receipt refinements.

No live browser/shop or physical printer test was performed. Existing build warnings include web workspace-root inference, duplicate Mongoose email index, and Node deprecation notices. No deployment was performed. Deploy the backend settings contract and both frontends together; rebuild/distribute the desktop app as appropriate. Frontends intentionally remain unlabelled if used with an older backend that does not expose region in receipt settings.
