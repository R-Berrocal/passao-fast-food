# Payment Status Display & Update — Admin Orders Dashboard

**Date:** 2026-03-16
**Status:** Approved

## Summary

The `paymentStatus` field (`pending | confirmed | rejected`) already exists in the database and types but is not visible in the admin orders UI. This spec covers displaying it in the OrderCard and allowing staff to change it via a popover.

## Design Decisions

- **Display location:** Same line as payment method — `Nequi · [Pendiente ▾]`
- **Interaction:** Click the payment status badge to open a shadcn Popover with the 3 options
- **Editability:** Only for active orders (`pending`, `confirmed`, `preparing`, `ready`). Delivered and cancelled orders show a static badge.
- **API approach:** Extend the existing `PATCH /api/orders/[id]` endpoint — add `paymentStatus` to its validation schema

## Files to Modify

| File | Change |
|------|--------|
| `src/app/api/orders/[id]/route.ts` | Add `paymentStatus` to PATCH validation schema |
| `src/lib/fetch-functions/orders.ts` | Add `updatePaymentStatus(id, status)` function |
| `src/hooks/use-orders.ts` | Add `updatePaymentStatus` mutation with query invalidation |
| `src/app/admin/dashboard/orders/page.tsx` | Add payment status badge + popover to OrderCard |

## Behavior Details

- Badge uses existing `PAYMENT_STATUS_CONFIG` (colors + Spanish labels already defined)
- Popover renders 3 options as buttons; selecting one calls mutation and closes popover
- No database migrations required — field already exists in schema
- No new pages or routes — pure UI + hook extension
