# Reports Date Range — Design Spec

**Date:** 2026-03-23

## Overview

Add date range support to the admin reports page. By default, the report shows today's data. Users can select a custom range via a single date range picker — no explicit mode switch.

## API (`/api/reports/daily`)

- Add optional `endDate` query param (`YYYY-MM-DD`)
- If `endDate` is absent (or equals `date`): behavior identical to current
- If `endDate` is present:
  - Orders query: `createdAt >= start_of_date (UTC) AND createdAt < end_of_endDate (UTC)` — single query using `getColombiaDateRange` for both bounds
  - Supplies query: `date >= date AND date <= endDate` — single query
  - Aggregation logic (group by payment method, calculate balance) stays the same, operates on the full result set
- Response type: same `DailyReport` structure, no changes to types

## Hook (`use-reports.ts`)

- Signature: `useDailyReport(startDate: string, endDate: string)`
- Query key: `queryKeys.reports.daily(startDate, endDate)`
- Sends `endDate` only when it differs from `startDate`

## Query Keys (`query-keys.ts`)

- Update `reports.daily` to accept optional second param: `daily: (date: string, endDate?: string) => [...]`

## UI (`reports/page.tsx`)

**State:**
- Replace `selectedDate: string` with `startDate: string` + `endDate: string`
- Both initialize to `getTodayString()`

**Date picker:**
- `Calendar` (shadcn/ui) in `mode="range"` inside a `Popover`
- Trigger shows: single day → "lunes, 23 de marzo"; range → "20 mar – 23 mar"

**Navigation arrows:**
- Render only when `startDate === endDate`
- On navigate: update both `startDate` and `endDate` to the target day
