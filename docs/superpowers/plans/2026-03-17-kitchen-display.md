# Kitchen Display Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a read-only fullscreen kitchen display at `/kitchen` optimized for a wall-mounted tablet showing today's active orders (pending/confirmed/preparing).

**Architecture:** Two new files (`page.tsx` + `page-content.tsx`) following the client-only admin pattern. A dedicated `/api/kitchen/orders` route (no auth — internal display) hits Prisma directly and returns only active orders for today. A `useKitchenOrders` hook wraps TanStack Query with 60s auto-refresh.

**Tech Stack:** Next.js App Router, React 19, TanStack Query, Prisma, Tailwind CSS v4, lucide-react

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/app/api/kitchen/orders/route.ts` | Create | Returns today's pending/confirmed/preparing orders — no auth |
| `src/hooks/use-kitchen-orders.ts` | Create | TanStack Query hook with 60s auto-refresh |
| `src/app/kitchen/page.tsx` | Create | Route entry point, client-only wrapper |
| `src/app/kitchen/page-content.tsx` | Create | Full kitchen UI: top bar, live clock, order cards |

---

## Chunk 1: API route

### Task 1: Create `/api/kitchen/orders` route

**Files:**
- Create: `src/app/api/kitchen/orders/route.ts`

This route does NOT require auth — it's a read-only display for an internal tablet. It queries Prisma directly for today's active orders using the same Colombia timezone offset used elsewhere in the codebase (`T05:00:00.000Z` pattern from `date-utils.ts`).

- [ ] Create the file:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";

const ACTIVE_STATUSES = ["pending", "confirmed", "preparing"] as const;

export async function GET() {
  try {
    // Get today's date range in Colombia timezone (UTC-5)
    // Mirrors getColombiaDateRange() from @/lib/date-utils
    const todayStr = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Bogota",
    });
    const startUTC = new Date(`${todayStr}T05:00:00.000Z`);
    const endUTC = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: {
        status: { in: ACTIVE_STATUSES },
        createdAt: { gte: startUTC, lt: endUTC },
      },
      include: {
        items: {
          include: {
            additions: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return successResponse(orders);
  } catch (error) {
    console.error("[kitchen/orders] Error:", error);
    return serverErrorResponse();
  }
}
```

- [ ] Verify the file is saved at the correct path.

---

## Chunk 2: TanStack Query hook

### Task 2: Create `useKitchenOrders` hook

**Files:**
- Create: `src/hooks/use-kitchen-orders.ts`

- [ ] Create the file:

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import type { OrderWithItems } from "@/types/models";
import type { ApiResponse } from "@/lib/api-response";

async function fetchKitchenOrders(): Promise<OrderWithItems[]> {
  const response = await fetch("/api/kitchen/orders", { cache: "no-store" });
  const result: ApiResponse<OrderWithItems[]> = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al cargar pedidos de cocina");
  }
  return result.data;
}

export function useKitchenOrders() {
  const query = useQuery({
    queryKey: ["kitchen", "orders"],
    queryFn: fetchKitchenOrders,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
  });

  return {
    orders: query.data ?? [],
    isLoading: query.isLoading,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}
```

---

## Chunk 3: Kitchen page

### Task 3: Create `src/app/kitchen/page.tsx`

**Files:**
- Create: `src/app/kitchen/page.tsx`

Simple client-only wrapper — same pattern as admin dashboard pages.

- [ ] Create the file:

```typescript
import { KitchenPageContent } from "./page-content";

export default function KitchenPage() {
  return <KitchenPageContent />;
}
```

---

### Task 4: Create `src/app/kitchen/page-content.tsx`

**Files:**
- Create: `src/app/kitchen/page-content.tsx`

This is the full UI. Key decisions:
- Forced dark theme via explicit bg/text colors — does **not** depend on next-themes
- Live clock updates every second via `setInterval` (this is a timer, not prop-driven state reset — the `useEffect` restriction in CLAUDE.md does not apply here)
- `getElapsedMinutes` computed on each render — accurate enough given 60s refresh cycle
- Orders older than 20 minutes get a red ring + red elapsed time

- [ ] Create the file:

```typescript
"use client";

import { useState, useEffect } from "react";
import { ChefHat, Clock, Package, Truck } from "lucide-react";
import { useKitchenOrders } from "@/hooks/use-kitchen-orders";
import type { OrderWithItems } from "@/types/models";

// ─── Constants ────────────────────────────────────────────────────────────────

const LATE_THRESHOLD_MINUTES = 20;

const STATUS_BORDER: Record<string, string> = {
  pending: "border-l-amber-400",
  confirmed: "border-l-blue-400",
  preparing: "border-l-green-400",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "PENDIENTE",
  confirmed: "CONFIRMADO",
  preparing: "PREPARANDO",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getElapsedMinutes(createdAt: Date | string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000);
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Bogota",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ElapsedBadge({ createdAt }: { createdAt: Date | string }) {
  const minutes = getElapsedMinutes(createdAt);
  const isLate = minutes >= LATE_THRESHOLD_MINUTES;
  return (
    <span
      className={`flex items-center gap-1.5 text-xl font-semibold tabular-nums ${
        isLate ? "text-red-400" : "text-zinc-400"
      }`}
    >
      <Clock className={`w-5 h-5 ${isLate ? "text-red-400" : "text-zinc-500"}`} />
      {minutes < 1 ? "Ahora" : `hace ${minutes} min`}
    </span>
  );
}

function TypeBadge({ type }: { type: "delivery" | "pickup" }) {
  if (type === "pickup") {
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-base font-bold">
        <Package className="w-4 h-4" />
        PARA LLEVAR
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-base font-bold">
      <Truck className="w-4 h-4" />
      DOMICILIO
    </span>
  );
}

function OrderCard({ order }: { order: OrderWithItems }) {
  const isLate = getElapsedMinutes(order.createdAt) >= LATE_THRESHOLD_MINUTES;
  const borderClass = STATUS_BORDER[order.status] ?? "border-l-zinc-500";

  return (
    <div
      className={`border-l-8 rounded-xl bg-zinc-800 p-6 ${borderClass} ${
        isLate ? "ring-2 ring-red-500" : ""
      }`}
    >
      {/* Card header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <span className="text-4xl font-black text-white tracking-tight">
          {order.orderNumber}
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <ElapsedBadge createdAt={order.createdAt} />
          <TypeBadge type={order.type} />
          <span className="px-3 py-1 rounded-lg bg-zinc-700 text-zinc-300 text-sm font-bold tracking-wide">
            {STATUS_LABEL[order.status] ?? order.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        {order.items.map((item) => (
          <div key={item.id}>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-amber-400 min-w-[2.5rem]">
                {item.quantity}×
              </span>
              <span className="text-3xl font-bold text-white leading-tight">
                {item.productName}
              </span>
            </div>
            {item.additions.length > 0 && (
              <div className="ml-14 mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                {item.additions.map((add) => (
                  <span key={add.id} className="text-xl text-zinc-300">
                    + {add.additionName}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Customer notes */}
      {order.notes && (
        <>
          <div className="my-4 border-t border-zinc-700" />
          <p className="text-xl text-amber-300 italic">📝 {order.notes}</p>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-5">
      <ChefHat className="w-20 h-20 text-zinc-700" />
      <p className="text-3xl text-zinc-500 font-semibold">
        No hay pedidos pendientes
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <p className="text-2xl text-zinc-500 animate-pulse">Cargando pedidos…</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function KitchenPageContent() {
  const [now, setNow] = useState(() => new Date());
  const { orders, isLoading, dataUpdatedAt } = useKitchenOrders();

  // Live clock — safe useEffect for timer (not prop-driven state reset)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(timer);
  }, []);

  const secondsSinceRefresh = Math.floor(
    (Date.now() - (dataUpdatedAt ?? Date.now())) / 1_000
  );

  return (
    // Forced dark — explicit colors, no dependency on next-themes
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChefHat className="w-9 h-9 text-amber-400" />
          <span className="text-2xl font-black tracking-widest text-amber-400">
            COCINA
          </span>
        </div>

        <span className="text-5xl font-mono font-black tabular-nums text-white">
          {formatClock(now)}
        </span>

        <span className="text-sm text-zinc-500 tabular-nums">
          Actualizado hace {secondsSinceRefresh}s
        </span>
      </header>

      {/* Orders list */}
      <main className="flex-1 p-6 space-y-4 overflow-y-auto">
        {isLoading ? (
          <LoadingState />
        ) : orders.length === 0 ? (
          <EmptyState />
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </main>
    </div>
  );
}
```

- [ ] Verify the file is saved correctly.

---

## Chunk 4: Verify & smoke test

### Task 5: Manual verification checklist

- [ ] Run `npm run dev` and navigate to `http://localhost:3000/kitchen`
- [ ] Confirm the page loads without errors in dark mode
- [ ] Confirm the clock updates every second in the top bar
- [ ] Confirm the "Actualizado hace Xs" counter increments
- [ ] Create a test order from checkout or admin dashboard — confirm it appears on `/kitchen`
- [ ] Advance that order to `ready` from admin dashboard — confirm it disappears from `/kitchen`
- [ ] Check the API directly: `GET /api/kitchen/orders` returns JSON with `success: true`
- [ ] Verify that an order older than 20 minutes (if any exist) shows red ring + red elapsed time
- [ ] Run `npm run lint` — fix any type errors before considering done
