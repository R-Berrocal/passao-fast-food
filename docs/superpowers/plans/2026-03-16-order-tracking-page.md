# Order Tracking Page Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear una página pública `/orders/[orderNumber]` donde el cliente puede ver el estado en tiempo real de su orden, con un link enviado automáticamente en el mensaje de WhatsApp al finalizar el checkout.

**Architecture:** Endpoint público `GET /api/orders/track/[orderNumber]` sin auth con select explícito de Prisma. Página SSR con `HydrationBoundary` para primer render inmediato, polling cada 60s en foreground con TanStack Query. La página llama `notFound()` si la orden no existe.

**Tech Stack:** Next.js 16 App Router, TanStack Query, Prisma, shadcn/ui, Tailwind CSS v4 oklch, TypeScript.

---

## File Map

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/types/models.ts` | Modificar | Agregar tipos `OrderTracking` y `OrderTrackingItem` |
| `src/lib/query-keys.ts` | Modificar | Agregar `queryKeys.orders.tracking(orderNumber)` |
| `src/lib/fetch-functions/orders.ts` | Modificar | Agregar `fetchOrderTracking()` |
| `src/hooks/use-order-tracking.ts` | Crear | Hook con polling para cliente |
| `src/app/api/orders/track/[orderNumber]/route.ts` | Crear | GET público, select explícito |
| `src/app/orders/[orderNumber]/page.tsx` | Crear | Server component, SSR prefetch, 404 handler |
| `src/app/orders/[orderNumber]/page-content.tsx` | Crear | Client component con UI completa |
| `src/app/checkout/page.tsx` | Modificar | Agregar link de tracking en mensaje WhatsApp |

---

## Chunk 1: Tipos y Capa de Datos

### Task 1: Agregar tipos `OrderTracking` a `src/types/models.ts`

**Files:**
- Modify: `src/types/models.ts`

- [ ] **Step 1: Agregar interfaces al final de la sección de Orders** (después de la línea `export interface OrderWithItems...`)

```typescript
// Order Tracking (public, limited fields)
export interface OrderTrackingItem {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  additions: { name: string; price: number }[];
}

export interface OrderTracking {
  orderNumber: string;
  status: OrderStatus;
  type: OrderType;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  customerName: string;
  notes: string | null;
  subtotal: number;
  total: number;
  createdAt: string;
  confirmedAt: string | null;
  preparingAt: string | null;
  readyAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  items: OrderTrackingItem[];
}
```

- [ ] **Step 2: Verificar que el archivo compila sin errores**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/types/models.ts
git commit -m "feat: add OrderTracking types for public order tracking"
```

---

### Task 2: Agregar query key de tracking en `src/lib/query-keys.ts`

**Files:**
- Modify: `src/lib/query-keys.ts`

- [ ] **Step 1: Agregar `tracking` dentro del objeto `orders`**

Localizar el bloque `orders:` (línea 58) y agregar la clave al final del objeto:

```typescript
// Antes (último item del objeto orders):
detail: (id: string) => [...queryKeys.orders.details(), id] as const,

// Después:
detail: (id: string) => [...queryKeys.orders.details(), id] as const,
tracking: (orderNumber: string) =>
  [...queryKeys.orders.all(), "tracking", orderNumber] as const,
```

- [ ] **Step 2: Verificar compilación**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/query-keys.ts
git commit -m "feat: add tracking query key for order tracking page"
```

---

### Task 3: Agregar `fetchOrderTracking` en `src/lib/fetch-functions/orders.ts`

**Files:**
- Modify: `src/lib/fetch-functions/orders.ts`

- [ ] **Step 1: Agregar el import de `OrderTracking`** en la línea de imports existente:

```typescript
// Línea 5, cambiar:
import type { Order, OrderWithItems, ApiResponse } from "@/types/models";
// Por:
import type { Order, OrderWithItems, OrderTracking, ApiResponse } from "@/types/models";
```

- [ ] **Step 2: Agregar la función al final de la sección QUERY FUNCTIONS** (después de `fetchOrder`, antes del separador de MUTATION FUNCTIONS):

```typescript
export async function fetchOrderTracking(orderNumber: string): Promise<OrderTracking> {
  const response = await fetch(
    `${getBaseUrl()}/api/orders/track/${encodeURIComponent(orderNumber)}`,
    { cache: "no-store" }
  );
  const result: ApiResponse<OrderTracking> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Orden no encontrada");
  }

  return result.data;
}
```

- [ ] **Step 3: Verificar compilación**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/fetch-functions/orders.ts
git commit -m "feat: add fetchOrderTracking function"
```

---

### Task 4: Crear hook `src/hooks/use-order-tracking.ts`

**Files:**
- Create: `src/hooks/use-order-tracking.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchOrderTracking } from "@/lib/fetch-functions/orders";

export function useOrderTracking(orderNumber: string) {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.orders.tracking(orderNumber),
    queryFn: () => fetchOrderTracking(orderNumber),
    staleTime: 30 * 1000,              // 30 segundos
    refetchInterval: 60 * 1000,        // polling cada 60s
    refetchIntervalInBackground: false, // solo cuando la pestaña está activa
  });

  return { order: data, isLoading, error, refetch, isFetching };
}
```

- [ ] **Step 2: Verificar compilación**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-order-tracking.ts
git commit -m "feat: add useOrderTracking hook with 60s polling"
```

---

## Chunk 2: API Endpoint

### Task 5: Crear `src/app/api/orders/track/[orderNumber]/route.ts`

**Files:**
- Create: `src/app/api/orders/track/[orderNumber]/route.ts`

- [ ] **Step 1: Crear carpetas y archivo**

```bash
mkdir -p src/app/api/orders/track/\[orderNumber\]
```

- [ ] **Step 2: Escribir el handler**

```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true,
        status: true,
        type: true,
        paymentMethod: true,
        paymentStatus: true,
        customerName: true,
        notes: true,
        subtotal: true,
        total: true,
        createdAt: true,
        confirmedAt: true,
        preparingAt: true,
        readyAt: true,
        deliveredAt: true,
        cancelledAt: true,
        items: {
          select: {
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            product: {
              select: { name: true },
            },
            additions: {
              select: {
                addition: {
                  select: { name: true, price: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return notFoundResponse("Orden");
    }

    // Shape the response to match OrderTracking interface
    const tracking = {
      orderNumber: order.orderNumber,
      status: order.status,
      type: order.type,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      customerName: order.customerName,
      notes: order.notes,
      subtotal: order.subtotal,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      confirmedAt: order.confirmedAt?.toISOString() ?? null,
      preparingAt: order.preparingAt?.toISOString() ?? null,
      readyAt: order.readyAt?.toISOString() ?? null,
      deliveredAt: order.deliveredAt?.toISOString() ?? null,
      cancelledAt: order.cancelledAt?.toISOString() ?? null,
      items: order.items.map((item) => ({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        productName: item.product.name,
        additions: item.additions.map((a) => ({
          name: a.addition.name,
          price: a.addition.price,
        })),
      })),
    };

    return successResponse(tracking);
  } catch (error) {
    console.error("Track order error:", error);
    return serverErrorResponse();
  }
}
```

- [ ] **Step 3: Verificar compilación**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Probar el endpoint manualmente**

Con el servidor corriendo (`npm run dev`), abrir en el navegador:
```
http://localhost:3000/api/orders/track/ORD-001
```
- Si la orden existe: debe retornar `{ success: true, data: { orderNumber: "ORD-001", ... } }`
- Si no existe: debe retornar `{ success: false, error: "Orden no encontrado", status: 404 }`

- [ ] **Step 5: Commit**

```bash
git add src/app/api/orders/track/
git commit -m "feat: add public GET /api/orders/track/[orderNumber] endpoint"
```

---

## Chunk 3: UI de la Página

### Task 6: Crear `src/app/orders/[orderNumber]/page-content.tsx`

**Files:**
- Create: `src/app/orders/[orderNumber]/page-content.tsx`

Este es el componente cliente con toda la UI. Contiene: header, timeline, resumen del pedido, notas y botón de actualizar.

- [ ] **Step 1: Crear carpetas**

```bash
mkdir -p "src/app/orders/[orderNumber]"
```

- [ ] **Step 2: Crear el archivo**

```typescript
"use client";

import { useOrderTracking } from "@/hooks/use-order-tracking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, CheckCircle2, Circle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus, OrderTracking } from "@/types/models";
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
} from "@/types/models";
import Link from "next/link";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPrice(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

// ─── Timeline ───────────────────────────────────────────────────────────────

const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Pendiente" },
  { status: "confirmed", label: "Confirmado" },
  { status: "preparing", label: "En preparación" },
  { status: "ready", label: "Listo" },
  { status: "delivered", label: "Entregado" },
];

function getTimestamp(order: OrderTracking, status: OrderStatus): string | null {
  const map: Partial<Record<OrderStatus, string | null>> = {
    pending: order.createdAt,
    confirmed: order.confirmedAt,
    preparing: order.preparingAt,
    ready: order.readyAt,
    delivered: order.deliveredAt,
  };
  return map[status] ?? null;
}

function Timeline({ order }: { order: OrderTracking }) {
  if (order.status === "cancelled") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <XCircle className="h-12 w-12 text-destructive" />
          <p className="text-lg font-semibold text-destructive">Pedido cancelado</p>
          {order.cancelledAt && (
            <p className="text-sm text-muted-foreground">{formatDate(order.cancelledAt)}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  const activeIndex = TIMELINE_STEPS.findIndex((s) => s.status === order.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Estado del pedido</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop: horizontal */}
        <ol className="hidden md:flex items-start gap-0">
          {TIMELINE_STEPS.map((step, i) => {
            const isDone = i < activeIndex;
            const isActive = i === activeIndex;
            const timestamp = getTimestamp(order, step.status);

            return (
              <li key={step.status} className="flex flex-1 flex-col items-center text-center">
                {/* Connector + icon row */}
                <div className="flex w-full items-center">
                  {i > 0 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1",
                        isDone || isActive ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                      isDone
                        ? "border-primary bg-primary text-primary-foreground"
                        : isActive
                        ? "border-primary bg-background text-primary"
                        : "border-muted bg-background text-muted-foreground"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1",
                        isDone ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
                {/* Label + timestamp */}
                <p
                  className={cn(
                    "mt-2 text-xs font-medium",
                    isActive ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                {timestamp && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(timestamp)}
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        {/* Mobile: vertical */}
        <ol className="flex flex-col gap-4 md:hidden">
          {TIMELINE_STEPS.map((step, i) => {
            const isDone = i < activeIndex;
            const isActive = i === activeIndex;
            const timestamp = getTimestamp(order, step.status);

            return (
              <li key={step.status} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2",
                      isDone
                        ? "border-primary bg-primary text-primary-foreground"
                        : isActive
                        ? "border-primary bg-background text-primary"
                        : "border-muted bg-background text-muted-foreground"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Circle className="h-3.5 w-3.5" />
                    )}
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={cn("mt-1 w-0.5 flex-1", isDone ? "bg-primary" : "bg-muted")} />
                  )}
                </div>
                <div className="pb-4">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isActive ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  {timestamp && (
                    <p className="text-xs text-muted-foreground">{formatDate(timestamp)}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function OrderTrackingContent({ orderNumber }: { orderNumber: string }) {
  const { order, isLoading, error, refetch, isFetching } = useOrderTracking(orderNumber);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <XCircle className="h-12 w-12 text-muted-foreground" />
        <div>
          <p className="font-semibold">Orden no encontrada</p>
          <p className="text-sm text-muted-foreground">
            Verifica el número de orden e intenta de nuevo.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Volver al menú</Link>
        </Button>
      </div>
    );
  }

  const paymentMethodLabel = PAYMENT_METHOD_CONFIG[order.paymentMethod].text;
  const paymentStatusConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus];

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Número de orden</p>
              <p className="text-2xl font-bold text-primary">{order.orderNumber}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {order.customerName} · {formatDate(order.createdAt)}
              </p>
            </div>
            <Badge variant="outline">
              {order.type === "delivery" ? "Domicilio" : "Recogida en tienda"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Timeline order={order} />

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumen del pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {order.items.map((item, i) => (
              <li key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {item.quantity}x {item.productName}
                  </span>
                  <span>{formatPrice(item.totalPrice)}</span>
                </div>
                {item.additions.length > 0 && (
                  <ul className="ml-4 space-y-0.5">
                    {item.additions.map((a, j) => (
                      <li key={j} className="flex justify-between text-xs text-muted-foreground">
                        <span>+ {a.name}</span>
                        {a.price > 0 && <span>{formatPrice(a.price)}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <Separator />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pago</span>
            <div className="flex items-center gap-2">
              <span>{paymentMethodLabel}</span>
              <Badge
                className={cn(
                  "text-white text-xs",
                  paymentStatusConfig.color
                )}
              >
                {paymentStatusConfig.text}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer notes */}
      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{order.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Refresh button */}
      <div className="flex flex-col items-center gap-3">
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
          {isFetching ? "Actualizando..." : "Actualizar estado"}
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/">Volver al menú</Link>
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verificar compilación**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add "src/app/orders/[orderNumber]/page-content.tsx"
git commit -m "feat: add OrderTrackingContent client component with timeline UI"
```

---

### Task 7: Crear `src/app/orders/[orderNumber]/page.tsx`

**Files:**
- Create: `src/app/orders/[orderNumber]/page.tsx`

- [ ] **Step 1: Crear el archivo**

```typescript
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { fetchOrderTracking } from "@/lib/fetch-functions/orders";
import { OrderTrackingContent } from "./page-content";

interface Props {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderTrackingPage({ params }: Props) {
  const { orderNumber } = await params;
  const queryClient = getQueryClient();

  try {
    await queryClient.fetchQuery({
      queryKey: queryKeys.orders.tracking(orderNumber),
      queryFn: () => fetchOrderTracking(orderNumber),
    });
  } catch {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrderTrackingContent orderNumber={orderNumber} />
    </HydrationBoundary>
  );
}
```

- [ ] **Step 2: Verificar compilación**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Probar la página manualmente**

Con `npm run dev` corriendo, abrir:
- `http://localhost:3000/orders/ORD-001` (orden existente) → debe mostrar la página con datos
- `http://localhost:3000/orders/ORD-INEXISTENTE` → debe mostrar la página 404 de Next.js

- [ ] **Step 4: Commit**

```bash
git add "src/app/orders/[orderNumber]/page.tsx"
git commit -m "feat: add order tracking page with SSR prefetch and 404 handling"
```

---

## Chunk 4: Integración WhatsApp

### Task 8: Agregar link de tracking en `src/app/checkout/page.tsx`

**Files:**
- Modify: `src/app/checkout/page.tsx`

- [ ] **Step 1: Localizar la función `buildWhatsAppMessage`** (línea 198)

Está en el archivo `src/app/checkout/page.tsx`. La función actualmente termina con:

```typescript
lines.push("¡Gracias por tu pedido!");

return lines.join("\n");
```

- [ ] **Step 2: Agregar el link de tracking antes del `return`**

```typescript
// Cambiar:
lines.push("¡Gracias por tu pedido!");

return lines.join("\n");

// Por:
lines.push("¡Gracias por tu pedido!");
lines.push("");
lines.push("📋 *Sigue el estado de tu pedido aquí:*");
lines.push(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderNumber}`);

return lines.join("\n");
```

- [ ] **Step 3: Verificar que `buildWhatsAppMessage` recibe `orderNumber` como parámetro**

La firma actual ya es `buildWhatsAppMessage(orderNumber: string)` (línea 198), así que el parámetro ya existe.

- [ ] **Step 4: Verificar compilación**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Verificar que `NEXT_PUBLIC_BASE_URL` está definida en `.env`**

Verificar que el archivo `.env` (o `.env.local`) contiene:
```
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
```
Para desarrollo local usar `http://localhost:3000`.

- [ ] **Step 6: Probar el flujo completo manualmente**

1. Ir a `http://localhost:3000`
2. Agregar productos al carrito
3. Ir a checkout y completar el pedido
4. Verificar que el mensaje de WhatsApp incluye el link `http://localhost:3000/orders/ORD-XXX`
5. Abrir el link → debe mostrar la página de tracking con los datos del pedido

- [ ] **Step 7: Commit final**

```bash
git add src/app/checkout/page.tsx
git commit -m "feat: add order tracking link to WhatsApp message on checkout"
```
