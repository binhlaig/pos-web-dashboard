import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const source = fs.readFileSync(new URL("../lib/date-time.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2020}}).outputText;
const dt = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);

test("same UTC instant displays in Japan and Myanmar", () => {
  assert.equal(dt.formatShopDateTime("2026-10-06T00:00:00Z", "Asia/Tokyo"), "06/10/2026 09:00:00");
  assert.equal(dt.formatShopDateTime("2026-10-06T00:00:00Z", "Asia/Yangon"), "06/10/2026 06:30:00");
});
test("shop working dates differ near UTC midnight", () => {
  assert.equal(dt.shopDateKey("2026-10-05T16:30:00Z", "Asia/Tokyo"), "2026-10-06");
  assert.equal(dt.shopDateKey("2026-10-05T16:30:00Z", "Asia/Yangon"), "2026-10-05");
});
test("date-only and unproven legacy values are never shifted", () => {
  assert.equal(dt.formatShopDate("2026-10-06", "Asia/Yangon"), "06/10/2026");
  assert.equal(dt.formatShopDateTime("2026-10-06T09:00:00", "Asia/Yangon"), "06/10/2026 09:00:00 (legacy local time)");
  assert.ok(Number.isNaN(dt.parseTimestamp("2026-10-06T09:00:00").getTime()));
  assert.equal(dt.formatShopDateTime(null, "Asia/Tokyo"), "-");
  assert.equal(dt.formatShopDateTime("invalid", "Asia/Tokyo"), "-");
});
test("local timecard editing converts through the shop zone", () => {
  assert.equal(new Date(dt.shopLocalInputToInstant("2026-10-06T09:00", "Asia/Tokyo")).toISOString(), "2026-10-06T00:00:00.000Z");
  assert.equal(new Date(dt.shopLocalInputToInstant("2026-10-06T06:30", "Asia/Yangon")).toISOString(), "2026-10-06T00:00:00.000Z");
});
test("switching authenticated shop rejects stale responses and resets timezone", () => {
  const generation = dt.setTimezoneIdentity("owner-one");
  dt.publishShopTimezone("Asia/Tokyo", "owner-one", generation);
  assert.equal(dt.getShopTimezone(), "Asia/Tokyo");
  dt.setTimezoneIdentity("owner-two");
  dt.publishShopTimezone("Asia/Tokyo", "owner-one", generation);
  assert.equal(dt.getShopTimezone(), "Asia/Yangon");
  dt.publishShopTimezone("UTC", "owner-two");
  assert.equal(dt.getShopTimezone(), "Asia/Yangon");
});

test("calendar grouping is independent of browser timezone and DST", () => {
  const previous = process.env.TZ;
  try {
    for (const browserZone of ["UTC", "Asia/Tokyo", "America/New_York", "America/Los_Angeles"]) {
      process.env.TZ = browserZone;
      const japan = dt.shopCalendarDate("2026-03-07T17:30:00Z", "Asia/Tokyo");
      assert.equal(dt.calendarDateKey(japan), "2026-03-08");
      assert.equal(japan.getUTCHours(), 2);
      assert.equal(japan.getUTCMinutes(), 30);
      assert.equal(dt.formatShopDateTime("2026-10-06T00:00:00Z", "Asia/Yangon"), "06/10/2026 06:30:00");
      const legacy = dt.shopCalendarDate("2026-10-06T09:00:00", "Asia/Yangon");
      assert.equal(dt.calendarDateKey(legacy), "2026-10-06");
      assert.equal(legacy.getUTCHours(), 9);
    }
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});
