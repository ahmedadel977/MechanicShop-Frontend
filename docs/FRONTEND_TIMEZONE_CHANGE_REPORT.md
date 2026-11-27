# Frontend Timezone Change Report — Dashboard Date Range

**Date:** 2026-11-27
**Repository:** `https://github.com/ahmedadel977/MechanicShop-Frontend` (`master`)
**Report location:** `docs/FRONTEND_TIMEZONE_CHANGE_REPORT.md`

## 1. Summary

The Dashboard previously sent a bare Cairo calendar date (`?date=YYYY-MM-DD`) to
`GET /api/v1.0/dashboard/stats`. The backend interpreted that date as UTC midnight, so
work orders were bucketed under the wrong calendar day. The frontend now owns the
`Africa/Cairo` → UTC conversion and sends an explicit UTC range:

```
GET /api/v1.0/dashboard/stats?fromUtc=2026-11-26T22:00:00Z&toUtc=2026-11-27T22:00:00Z
```

The wire parameter names are exactly `fromUtc` and `toUtc`, matching the backend
`[FromQuery(Name = "fromUtc")]` / `[FromQuery(Name = "toUtc")]` bindings. Values are
ISO-8601 UTC instants ending in `Z`; the backend applies inclusive start / exclusive end
semantics.

## 2. Files changed

| File | Change |
|---|---|
| `src/timezone.ts` | New Cairo/UTC utilities using native `Intl.DateTimeFormat` with explicit `timeZone: 'Africa/Cairo'`; no browser-local timezone is used implicitly and no dependency was added. |
| `src/timezone.test.ts` | New unit tests for winter/DST day boundaries, UTC → Cairo date/time helpers, and Cairo local → UTC conversion. |
| `src/api.ts` | `dashboardApi.stats(fromUtc, toUtc)` sends `{ params: { fromUtc, toUtc } }`; schedule default header fixed to `Africa/Cairo`. |
| `src/hooks.ts` | `useDashboardStats(date)` calls `getCairoUtcDayRange(date)` and passes the UTC range to the API. |
| `src/App.tsx` | Cairo explicit timezone for displayed timestamps/date chips; `datetime-local` values derived from UTC in Cairo time; create/reschedule submissions converted back to UTC; schedule page displays `BUSINESS_TIMEZONE`. |
| `src/api.test.ts` | Endpoint coverage now supplies the Cairo-derived UTC range instead of `date`. |
| `docs/API_ENDPOINTS.md` | Dashboard endpoint request updated to `fromUtc` / `toUtc`. |
| `docs/FRONTEND_TIMEZONE_CHANGE_REPORT.md` | This report. |

## 3. Timezone rules implemented

- Business timezone is fixed to `Africa/Cairo` (`BUSINESS_TIMEZONE`).
- `getCairoUtcDayRange('2026-11-27')` → `2026-11-26T22:00:00Z` / `2026-11-27T22:00:00Z` (UTC+2, winter).
- `getCairoUtcDayRange('2026-07-15')` → `2026-07-14T21:00:00Z` / `2026-07-15T21:00:00Z` (UTC+3, DST).
- `getCairoUtcDayRange('2026-01-15')` → `2026-01-14T22:00:00Z` / `2026-01-15T22:00:00Z` (UTC+2).
- UTC timestamps are rendered in Cairo with an explicit `Intl.DateTimeFormat` timezone.
- Cairo wall-clock values from `datetime-local` inputs are converted back to UTC before being sent.
- Database/API storage remains UTC; no implicit `resolvedOptions().timeZone` or
  `toLocaleString()` without an explicit Cairo timezone remains in the dashboard flow.

## 4. Tests

Added (`src/timezone.test.ts`):

- Selected Cairo day → UTC boundaries for standard time and DST.
- Explicit business timezone constant.
- UTC midnight → Cairo date `2026-11-27` and time `00:00`.
- Cairo `datetime-local` → UTC ISO round trip.

Updated (`src/api.test.ts`):

- Dashboard API coverage now calls `dashboardApi.stats(statsRange.fromUtc, statsRange.toUtc)`
  from `getCairoUtcDayRange('2026-11-26')`.

**Execution status:** tests were written but **not executed in this environment** because no
Node.js / npm / pnpm / bun / vitest runtime is available. Backend integration tests covering
the same boundaries were executed successfully in the backend repository.

## 5. Integration contract

- Frontend request: `params: { fromUtc, toUtc }`.
- Backend binding: `[FromQuery(Name = "fromUtc")]` and `[FromQuery(Name = "toUtc")]`.
- Backend query record: `GetWorkorderStatsQuery(DateTimeOffset FromUtc, DateTimeOffset ToUtc)`.
- Backend filter: `x.StartAtUtc >= request.FromUtc && x.StartAtUtc < request.ToUtc`.
- Cairo midnight is included; the next Cairo midnight is excluded.
