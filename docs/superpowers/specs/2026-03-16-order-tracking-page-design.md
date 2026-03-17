# Order Tracking Page — Design Spec

**Date:** 2026-03-16
**Status:** Approved

## Overview

Add a public page `/orders/[orderNumber]` where customers can track the status of their order in real time. A link to this page is included in the WhatsApp message sent after checkout.

## Goals

- Give customers visibility into their order status without needing to contact the restaurant
- Send a tracking link via WhatsApp automatically after order creation
- No authentication required — the order number in the URL is sufficient access

## Architecture

### New Files

```
src/app/orders/[orderNumber]/
├── page.tsx              # Server component — SSR prefetch + HydrationBoundary
└── page-content.tsx      # Client component — TanStack Query + polling

src/app/api/orders/track/[orderNumber]/
└── route.ts              # Public GET endpoint, no auth

src/hooks/
└── use-order-tracking.ts # TanStack Query hook with polling

src/lib/fetch-functions/orders.ts    # Add fetchOrderTracking()
src/lib/query-keys.ts                # Add queryKeys.orders.tracking(orderNumber)
```

### Modified Files

```
src/app/checkout/page.tsx   # Add tracking link to WhatsApp message
```

## API Endpoint

### `GET /api/orders/track/[orderNumber]`

- **Access:** Public, no authentication
- **404:** Order not found

**Prisma select (explicit — only what's displayed):**

```typescript
{
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
      product: { select: { name: true } },
      additions: {
        select: {
          addition: { select: { name: true, price: true } }
        }
      }
    }
  }
}
```

**No se expone:** `adminNotes`, `deliveryFee`, `userId`, `customerPhone`, `customerEmail`, `addressId`, `paymentReference`.

## Data Flow & Polling

### Hook `use-order-tracking.ts`

```typescript
{
  queryKey: queryKeys.orders.tracking(orderNumber),
  queryFn: () => fetchOrderTracking(orderNumber),
  staleTime: 30_000,
  refetchInterval: 60_000,
  refetchIntervalInBackground: false
}
```

### SSR Pattern

Página pública → usa SSR prefetch con `HydrationBoundary` para primer render sin loading spinner. Si la orden no existe, el server component llama `notFound()` de Next.js.

## UI Sections

### 1. Header
- Número de orden destacado
- Nombre del cliente
- Fecha de creación
- Badge de tipo: `Domicilio` / `Recogida en tienda`

### 2. Timeline de Estado
Progresión con 5 pasos: **Pendiente → Confirmado → En preparación → Listo → Entregado**

- Horizontal en desktop, vertical en mobile
- Cada paso muestra timestamp cuando fue alcanzado
- Estado activo resaltado con color primario del proyecto (lime/yellow oklch)
- Estado `cancelled` rompe el timeline y muestra estado especial en rojo

### 3. Resumen del Pedido
- Lista de productos: nombre, cantidad, precio unitario, adiciones
- Subtotal y total al final
- Método de pago + badge de estado de pago

### 4. Notas del Cliente
- Solo visible si `notes` no es null

### 5. Botón "Actualizar estado"
- Llama `refetch()` manualmente
- Muestra spinner mientras recarga

### 6. Estado de error / no encontrado
- Mensaje claro si la orden no existe
- Opción de volver al inicio

## WhatsApp Integration

En `checkout/page.tsx`, se agrega al mensaje de WhatsApp existente:

```
📋 *Sigue el estado de tu pedido aquí:*
${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderNumber}
```

La variable `NEXT_PUBLIC_BASE_URL` ya existe en el proyecto y contiene el dominio completo (ej: `https://mi-dominio.com`).

## Security

- No se expone información sensible del cliente (teléfono, email, dirección interna)
- El endpoint es de solo lectura
- El número de orden no es predecible secuencialmente (formato `ORD-XXXX` con padding)
