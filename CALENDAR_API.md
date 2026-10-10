# Calendar backend integration

Calendar entries are read and saved through same-origin `/api/calendar/entries`
routes. The server obtains `session.accessToken` from the existing NextAuth
configuration; it never forwards the NextAuth cookie/JWT as the backend token.
Spring Boot remains responsible for validated USER / ROLE_ADMIN permissions and
shop isolation.

The proxy follows the receipts proxy's existing backend URL precedence:
`NEXT_PUBLIC_API_BASE_URL`, then `REMOTE_API_BASE_URL`, then
`http://localhost:8080`. A trailing `/api` is supported. Existing NextAuth
configuration and its secret must be configured as usual. No new variables are
required.

Month requests include all 42 grid days, including adjacent months. Week requests
include the displayed Monday through Sunday. Agenda requests cover the selected
calendar month. The upcoming panel adds today through 90 days ahead; the overdue
panel adds the preceding 365 days through yesterday. Panel ranges are combined
with the displayed calendar range so the grid remains populated. Upcoming and
overdue lists apply their own documented bounds and the selected type/status
filters. Counts and exports describe loaded data only, not complete history.

Date/time strings remain shop wall-clock values; UTC audit strings are separate.
Exports contain only loaded entries and are informational backups. There is no
import path. Legacy local entries are neither read, erased, nor uploaded.

Run `npx tsc --noEmit`, `node --test tests/*.test.mjs`, and `npm run build`.
The Calendar tests use realistic contract mocks and a hook harness for the
actual page and sales popover. They do not replace browser or live backend tests.

Manual verification with the running backend:

1. Sign in as a validated permitted account and open `/dashboard/calendar`.
   Inspect month/week/agenda requests and leading/trailing grid dates.
2. Create an entry with blank optional fields; reload and confirm its numeric
   ID and version. Edit it, complete/reopen it, and confirm version increments.
3. Edit the same entry in two sessions. Save one, then save the stale form.
   Confirm 409 preserves its input. Load latest, review all fields, explicitly
   select the latest version, and save again.
4. Stop the backend, attempt a save, and confirm the editor retains values.
   Restore the backend and retry. Double-click Save and verify one mutation.
5. Delete an entry and confirm the version query and empty 204 response.
6. Switch accounts and change dates rapidly; confirm no previous-account entries
   or stale range responses appear. Check denied accounts and expired sessions.
7. At 1194 x 834, check light/dark layout and sidebar icon rail. Hover a sales
   date for five seconds; touch/click should open immediately. Check receipts
   aggregation and shop timezone/currency display.

No push or deployment is part of this change.
