# Reports Date Range Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add date range support to the admin reports page, keeping today as the default single-day view.

**Architecture:** Extend the existing `/api/reports/daily` endpoint with an optional `endDate` param — when present, the orders and supplies queries widen their date bounds in a single DB query each. The UI replaces the single date state with `startDate`/`endDate`, renders a shadcn Calendar range picker inside a Popover, and shows navigation arrows only in single-day mode.

**Tech Stack:** Next.js 16 App Router, Prisma, TanStack Query, shadcn/ui (Calendar, Popover), react-day-picker

---

## Chunk 1: Dependencies + Query Layer

### Task 1: Install Calendar and Popover shadcn components

**Files:**
- Create: `src/components/ui/calendar.tsx`
- Create: `src/components/ui/popover.tsx`

- [ ] **Step 1: Install components via shadcn CLI**

Run from project root:
```bash
npx shadcn@latest add calendar popover
```
Expected: creates `src/components/ui/calendar.tsx` and `src/components/ui/popover.tsx`, adds `react-day-picker` to `package.json`.

- [ ] **Step 2: Verify files exist**
```bash
ls src/components/ui/calendar.tsx src/components/ui/popover.tsx
```

---

### Task 2: Update query key

**Files:**
- Modify: `src/lib/query-keys.ts:98`

- [ ] **Step 1: Update `reports.daily` to accept optional `endDate`**

Replace:
```typescript
daily: (date: string) => [...queryKeys.reports.all(), "daily", date] as const,
```
With:
```typescript
daily: (startDate: string, endDate?: string) => [...queryKeys.reports.all(), "daily", startDate, endDate] as const,
```

---

### Task 3: Update fetch function

**Files:**
- Modify: `src/lib/fetch-functions/reports.ts`

- [ ] **Step 1: Add `endDate` param, append to URL only when it differs from `startDate`**

Replace entire file:
```typescript
import type { DailyReport, ApiResponse } from "@/types/models";
import { getAuthHeaders } from "@/stores/use-auth-store";
import { getBaseUrl } from "@/lib/utils";

export async function fetchDailyReport(startDate: string, endDate?: string): Promise<DailyReport> {
  const params = new URLSearchParams({ date: startDate });
  if (endDate && endDate !== startDate) params.set("endDate", endDate);
  const response = await fetch(`${getBaseUrl()}/api/reports/daily?${params.toString()}`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });
  const result: ApiResponse<DailyReport> = await response.json();
  if (!result.success || !result.data) throw new Error(result.error || "Error al cargar reporte");
  return result.data;
}
```

---

### Task 4: Update hook

**Files:**
- Modify: `src/hooks/use-reports.ts`

- [ ] **Step 1: Update hook to accept `startDate` and `endDate`**

Replace entire file:
```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchDailyReport } from "@/lib/fetch-functions/reports";

export function useDailyReport(startDate: string, endDate: string) {
  const rangeEndDate = endDate !== startDate ? endDate : undefined;

  const {
    data: report,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.reports.daily(startDate, rangeEndDate),
    queryFn: () => fetchDailyReport(startDate, rangeEndDate),
    staleTime: 2 * 60 * 1000,
    enabled: !!startDate,
  });

  return {
    report,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}
```

---

## Chunk 2: API

### Task 5: Extend the daily report API

**Files:**
- Modify: `src/app/api/reports/daily/route.ts`

- [ ] **Step 1: Read `endDate` param and widen both DB queries**

Replace entire file:
```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api-response";
import { getColombiaDateRange } from "@/lib/date-utils";
import type { DailyReport } from "@/types/models";

export async function GET(request: NextRequest) {
  try {
    const staff = await requireStaff(request);
    if (!staff) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const endDateParam = searchParams.get("endDate") || dateParam;

    // Use start of dateParam → end of endDateParam (single query covers full range)
    const { startUTC } = getColombiaDateRange(dateParam);
    const { endUTC } = getColombiaDateRange(endDateParam);

    // Fetch orders in date range
    const orders = await prisma.order.findMany({
      where: {
        status: { not: "cancelled" },
        createdAt: { gte: startUTC, lt: endUTC },
      },
      select: { total: true, paymentMethod: true },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;

    const paymentMap = new Map<string, { count: number; total: number }>();
    for (const order of orders) {
      const existing = paymentMap.get(order.paymentMethod) || { count: 0, total: 0 };
      paymentMap.set(order.paymentMethod, {
        count: existing.count + 1,
        total: existing.total + order.total,
      });
    }

    const byPaymentMethod = Array.from(paymentMap.entries()).map(([method, data]) => ({
      method: method as DailyReport["sales"]["byPaymentMethod"][number]["method"],
      count: data.count,
      total: data.total,
    }));

    const cashRevenue = paymentMap.get("cash")?.total || 0;
    const digitalRevenue = totalRevenue - cashRevenue;

    // Fetch supply purchases in date range (DATE field — no timezone conversion needed)
    const supplies = await prisma.supplyPurchase.findMany({
      where: {
        date: {
          gte: new Date(dateParam),
          lte: new Date(endDateParam),
        },
      },
      select: { amount: true, paymentMethod: true },
    });

    const totalSpent = supplies.reduce((sum, s) => sum + s.amount, 0);
    const totalPurchases = supplies.length;

    const supplyPaymentMap = new Map<string, { count: number; total: number }>();
    for (const supply of supplies) {
      const existing = supplyPaymentMap.get(supply.paymentMethod) || { count: 0, total: 0 };
      supplyPaymentMap.set(supply.paymentMethod, {
        count: existing.count + 1,
        total: existing.total + supply.amount,
      });
    }

    const suppliesByPaymentMethod = Array.from(supplyPaymentMap.entries()).map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total,
    }));

    const cashSpent = supplyPaymentMap.get("cash")?.total || 0;
    const digitalSpent = totalSpent - cashSpent;

    const report: DailyReport = {
      date: dateParam,
      sales: { totalOrders, totalRevenue, cashRevenue, digitalRevenue, byPaymentMethod },
      supplies: { totalPurchases, totalSpent, cashSpent, digitalSpent, byPaymentMethod: suppliesByPaymentMethod },
      balance: totalRevenue - totalSpent,
    };

    return successResponse(report);
  } catch (error) {
    console.error("Daily report error:", error);
    return serverErrorResponse();
  }
}
```

---

## Chunk 3: UI

### Task 6: Add date helpers to date-utils

**Files:**
- Modify: `src/lib/date-utils.ts`

- [ ] **Step 1: Append `formatRangeLabel` and `dateToString` helpers**

Append to the end of `src/lib/date-utils.ts`:
```typescript
/**
 * Formats a date range as a short human-readable label in Spanish.
 * Single day → uses formatDateLabel. Range → "20 mar – 23 mar 2026"
 */
export function formatRangeLabel(startDate: string, endDate: string): string {
  if (startDate === endDate) return formatDateLabel(startDate);
  const start = new Date(startDate + "T12:00:00").toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });
  const end = new Date(endDate + "T12:00:00").toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${start} – ${end}`;
}

/**
 * Converts a Date object to a YYYY-MM-DD string in Colombia timezone.
 */
export function dateToString(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}
```

---

### Task 7: Update reports page

**Files:**
- Modify: `src/app/admin/dashboard/reports/page.tsx`

- [ ] **Step 1: Replace entire page content**

Replace entire file:
```typescript
"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  Scale,
  Banknote,
  Smartphone,
  RefreshCw,
  CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDailyReport } from "@/hooks/use-reports";
import { formatPrice } from "@/stores/use-cart-store";
import { getTodayString, formatRangeLabel, dateToString } from "@/lib/date-utils";
import { PAYMENT_METHOD_LABELS } from "@/lib/validations/order";

export default function ReportsPage() {
  const today = getTodayString();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { report, isLoading, error, refetch } = useDailyReport(startDate, endDate);

  const isSingleDay = startDate === endDate;
  const isToday = isSingleDay && startDate === today;
  const isRangeMode = !isSingleDay;

  const navigateDate = (direction: -1 | 1) => {
    const date = new Date(startDate + "T12:00:00");
    date.setDate(date.getDate() + direction);
    const newDate = date.toISOString().slice(0, 10);
    setStartDate(newDate);
    setEndDate(newDate);
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    if (!range?.from) return;
    const newStart = dateToString(range.from);
    const newEnd = range.to ? dateToString(range.to) : newStart;
    setStartDate(newStart);
    setEndDate(newEnd);
    if (range.to) setCalendarOpen(false);
  };

  const rangeValue: DateRange = {
    from: new Date(startDate + "T12:00:00"),
    to: new Date(endDate + "T12:00:00"),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reportes</h2>
          <p className="text-muted-foreground">Resumen de ventas e insumos</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Date Navigator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2">
            {isSingleDay && (
              <Button variant="outline" size="icon" onClick={() => navigateDate(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            <div className="flex flex-1 justify-center">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-1">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold capitalize">
                        {formatRangeLabel(startDate, endDate)}
                      </span>
                    </div>
                    {isToday && <Badge variant="secondary">Hoy</Badge>}
                    {isRangeMode && (
                      <Badge variant="outline" className="text-xs">
                        Rango personalizado
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="range"
                    selected={rangeValue}
                    onSelect={handleRangeSelect}
                    toDate={new Date(today + "T12:00:00")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {isSingleDay && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate(1)}
                disabled={isToday}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          Error al cargar el reporte: {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : report ? (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Sales Card */}
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-green-500">
                <TrendingUp className="h-5 w-5" />
                Ventas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold">{formatPrice(report.sales.totalRevenue)}</p>
                <p className="text-sm text-muted-foreground">
                  {report.sales.totalOrders} órdenes
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    <span>Efectivo</span>
                  </div>
                  <span className="font-semibold">{formatPrice(report.sales.cashRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span>Digital</span>
                  </div>
                  <span className="font-semibold">{formatPrice(report.sales.digitalRevenue)}</span>
                </div>
              </div>
              {report.sales.byPaymentMethod.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      Detalle
                    </p>
                    {report.sales.byPaymentMethod.map(({ method, count, total }) => (
                      <div key={method} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {PAYMENT_METHOD_LABELS[method as keyof typeof PAYMENT_METHOD_LABELS] || method} ({count})
                        </span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Supplies Card */}
          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-orange-500">
                <ShoppingBag className="h-5 w-5" />
                Insumos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-3xl font-bold">{formatPrice(report.supplies.totalSpent)}</p>
                <p className="text-sm text-muted-foreground">
                  {report.supplies.totalPurchases} compras
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                    <span>Efectivo</span>
                  </div>
                  <span className="font-semibold">{formatPrice(report.supplies.cashSpent)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span>Digital</span>
                  </div>
                  <span className="font-semibold">{formatPrice(report.supplies.digitalSpent)}</span>
                </div>
              </div>
              {report.supplies.byPaymentMethod.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                      Detalle
                    </p>
                    {report.supplies.byPaymentMethod.map(({ method, count, total }) => (
                      <div key={method} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {PAYMENT_METHOD_LABELS[method as keyof typeof PAYMENT_METHOD_LABELS] || method} ({count})
                        </span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Balance Card */}
          <Card
            className={
              report.balance >= 0
                ? "border-primary/30 bg-primary/5"
                : "border-destructive/30 bg-destructive/5"
            }
          >
            <CardHeader className="pb-2">
              <CardTitle
                className={`flex items-center gap-2 ${
                  report.balance >= 0 ? "text-primary" : "text-destructive"
                }`}
              >
                <Scale className="h-5 w-5" />
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p
                  className={`text-3xl font-bold ${
                    report.balance >= 0 ? "text-primary" : "text-destructive"
                  }`}
                >
                  {formatPrice(Math.abs(report.balance))}
                </p>
                <p className="text-sm text-muted-foreground">
                  {report.balance >= 0
                    ? isRangeMode
                      ? "Ganancia bruta del período"
                      : "Ganancia bruta del día"
                    : isRangeMode
                      ? "Pérdida del período"
                      : "Pérdida del día"}
                </p>
              </div>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ventas</span>
                  <span className="font-medium text-green-500">
                    +{formatPrice(report.sales.totalRevenue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Insumos</span>
                  <span className="font-medium text-orange-500">
                    −{formatPrice(report.supplies.totalSpent)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Verify the dev server compiles cleanly**

Run: `npm run dev`
Expected: No TypeScript errors. Page loads showing today's report. Clicking the date label opens a calendar popover. Selecting a single date closes the popover and shows that day's report with navigation arrows. Selecting a range closes the popover, hides arrows, shows "Rango personalizado" badge, and the cards show aggregated totals.
