# Currency ပြင်ဆင်မှုမှတ်တမ်း

Receipt Settings currency ကို shared provider/store နှင့် formatter တစ်ခုတည်းမှ သုံးထားသည်။ Default သည် MMK / Ks / 0 / AFTER ဖြစ်သည်။ Save အောင်မြင်လျှင် mounted views၊ chart labels/tooltips၊ receipt preview နှင့် printing တို့ update ဖြစ်သည်။ Account/shop identity ပြောင်းလျှင် cache ကို reset လုပ်ပြီး အဟောင်း GET/save response များကို ပယ်ထားသည်။ Fetch failure သည် လက်ရှိဆိုင်၏ အောင်မြင်စွာရထားသော settings ကို မဖျက်ပါ။

Decimal digits ကို 0–6 integer အဖြစ် validate လုပ်ပြီး number/string/null data ကို normalize လုပ်ထားသည်။ Symbol နှင့် BEFORE/AFTER ကို Intl currency defaults ပေါ်မမှီဘဲ သီးသန့်ထားသည်။ Prices၊ calculations၊ stored amounts၊ monetary API payloads နှင့် exchange rates မပြောင်းထားပါ။ Receipt Settings PUT တွင် currency configuration ပါဝင်စေထားသည်။

## ပြောင်းထားသောဖိုင်များ

- `app/admin/analytics/page.tsx`
- `app/admin/inventory/page.tsx`
- `app/admin/orders/page.tsx`
- `app/admin/page.tsx`
- `app/admin/staff/page.tsx`
- `app/admin/time_card/page.tsx`
- `app/api/page.tsx`
- `app/dashboard/inventory/page.tsx`
- `app/dashboard/page.tsx`
- `app/dashboard/product/[id]/edit/page.tsx`
- `app/dashboard/product/[id]/page.tsx`
- `app/dashboard/product/add/page.tsx`
- `app/dashboard/product/barcode/page.tsx`
- `app/dashboard/product/check/page.tsx`
- `app/dashboard/product/page.tsx`
- `app/dashboard/receipt-settings/page.tsx`
- `app/dashboard/receipts/page.tsx`
- `app/dashboard/sale/page.tsx`
- `app/dashboard/sales-analytics/page.tsx`
- `app/dashboard/sales-by-product/page.tsx`
- `app/dashboard/staff/page.tsx`
- `app/dashboard/timecard/page.tsx`
- `app/display/page.tsx`
- `app/timecard/page.tsx`
- `components/Providers.tsx`
- `components/Setction/clock.tsx`
- `components/dashboard/Charts.tsx`
- `components/dashboard/KpiGrids.tsx`
- `components/dashboard/revenue-chart.tsx`
- `components/dashboard/stat-card.tsx`
- `components/dashboard/transaction-table.tsx`
- `components/display/HeroBanner.tsx`
- `components/display/MenuCard.tsx`
- `components/settings/pos-settings-form.tsx`
- `components/settings/receipt-settings-card.tsx`
- `lib/auth-session.ts`
- `lib/auth.ts`
- `lib/backend-api.ts`
- `lib/data/menu-board.ts`
- `components/currency-provider.tsx`
- `lib/currency.ts`
- `lib/currency-store.ts`
- `tests/currency.test.mjs`
- `CURRENCY_CHANGES.md` (ဤမှတ်တမ်း)

## စစ်ဆေးမှု

- `npx tsc --noEmit` — အောင်မြင်သည်။
- `npm run build` — အောင်မြင်သည်; routes 51 ခု static generation ပြီးစီးသည်။ Sandbox spawn EPERM ကြောင့် ခွင့်ပြုထားသော sandbox ပြင်ပ execution သုံးရသည်။
- `node --test tests/currency.test.mjs tests/product-edit.test.mjs` — tests 15 ခု အောင်မြင်သည်။ BEFORE/AFTER၊ nullable/string/invalid digits၊ zero၊ negative၊ compact values၊ settings propagation၊ request deduplication၊ stale GET/save၊ account/shop changes၊ reload၊ failure retention နှင့် SSR/initial hydration snapshot စမ်းသပ်ထားသည်။
- ပြောင်းထားသော TypeScript/TSX files 42 ခုကို AST ဖြင့် parse လုပ်၍ malformed syntax/regex၊ unbalanced JSX နှင့် accidental Markdown escaping စစ်ဆေးရာ error မတွေ့ပါ။ Dashboard trailing-slash regex `.replace(/\/+$/, "")` သည် မှန်ကန်နေသည်။
- `git diff --check` — အောင်မြင်သည်။
- သီးခြား lint မစစ်နိုင်ပါ: package.json တွင် lint script နှင့် ESLint dependency/configuration မရှိပါ။

## ရည်ရွယ်ချက်ရှိရှိ ချန်ထားသော references

- Receipt/POS Settings currency choices၊ currency presets၊ default settings၊ input placeholders နှင့် decimal-option descriptions ရှိ MMK/Ks/JPY/¥/USD စာသားများ။
- Sales analytics ၏ legacy backend monetary text parsing regex များ; display format မဟုတ်ပါ။
- Currency ဆိုင်ရာ icon names နှင့် archived/commented code များကို ထိန်းထားသည်။
- Generic chart components ၏ nonmonetary values၊ percentages၊ stock quantities၊ IDs နှင့် dates ကို ထိန်းထားသည်။ Mixed quantity/price/revenue chart ၏ scaled numeric axis ကို ထိန်းပြီး monetary tooltips တွင် မူလ amount ကို configured currency ဖြင့် ပြသည်။
- Restaurant routes သည် monetary displays မပါသော existing placeholders ဖြစ်၍ မပြောင်းထားပါ။

## ကျန်ရှိသောကန့်သတ်ချက်များ

- Live authenticated backend၊ browser နှင့် physical printer ဖြင့် end-to-end စမ်းသပ်ခြင်း မလုပ်ထားပါ; state/format behavior ကို automated tests ဖြင့် စစ်ထားသည်။
- Build တွင် existing multiple-lockfile/workspace-root warning၊ Mongoose email duplicate-index warning နှင့် Node module.register deprecation warning ကျန်သည်။ Existing product-edit test တွင် package module-type warning ရှိသည်။
