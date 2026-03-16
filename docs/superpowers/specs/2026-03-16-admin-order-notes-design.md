---
title: Admin Order Notes (adminNotes) en creación manual de órdenes
date: 2026-03-16
status: approved
---

## Contexto

En `/admin/dashboard/orders/new` el personal puede crear órdenes manualmente para clientes que van al local. Sin embargo, no existe forma de registrar notas especiales de la orden (ej: "sin salsa", "sin cebolla"). El campo `adminNotes` ya existe en el modelo `Order` de Prisma pero no está expuesto en la UI ni en el schema de validación de creación manual.

## Objetivo

Permitir al personal agregar una nota especial al crear una orden manual, usando el campo `adminNotes` del modelo `Order`.

## Decisiones de diseño

- **Scope de la nota**: Por orden completa (no por ítem). Es un caso de borde, no se justifica la complejidad de notas por ítem.
- **UI**: Campo colapsable con `<Collapsible>` de shadcn/ui (Radix UI). El trigger muestra "+ Agregar nota especial". Se ubica entre los campos de cliente/entrega y el selector de método de pago.
- **Campo**: Textarea de 4 filas con contador de caracteres (máx 300). El texto se conserva si el usuario cierra el accordion.
- **Campo en backend**: `adminNotes` (no `notes`). `notes` se reserva para el flujo de checkout del cliente.

## Archivos a modificar

### 1. `src/lib/validations/order.ts`
Agregar `adminNotes` al `createOrderSchema`:
```typescript
adminNotes: z.string().max(300).optional(),
```

### 2. `src/app/api/admin/orders/route.ts`
- Destructurar `adminNotes` del `result.data`
- Pasar `adminNotes: adminNotes || null` al `prisma.order.create`

### 3. `src/app/admin/dashboard/orders/new/page.tsx`
- Agregar `adminNotes?: string` al schema de react-hook-form (Zod)
- Agregar estado local `isNotesOpen` para controlar el `<Collapsible>`
- Renderizar el componente `<Collapsible>` entre los campos de cliente y el método de pago
- Incluir `adminNotes: formValues.adminNotes || undefined` en el payload del submit

## Layout del componente

```
[Datos de cliente / dirección de entrega]
         ↓
┌─────────────────────────────────────┐
│ + Agregar nota especial          ▼  │  ← Collapsible trigger
└─────────────────────────────────────┘
   ↓ (expandido)
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ ej: sin salsa, sin cebolla...   │ │  ← Textarea (4 filas)
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                          0 / 300    │  ← Contador
└─────────────────────────────────────┘
         ↓
[Método de pago]
         ↓
[Registrar Venta]
```

## Flujo de datos

```
UI (react-hook-form) → adminNotes field
       ↓
submit handler → incluye adminNotes en payload
       ↓
createManualOrder(data) → POST /api/admin/orders
       ↓
createManualOrderSchema.safeParse() → valida adminNotes (max 300, opcional)
       ↓
prisma.order.create({ adminNotes: adminNotes || null })
       ↓
Order guardada en DB
```

## Sin cambios necesarios en

- `src/hooks/use-orders.ts` — `createManualOrder` ya pasa el payload completo
- `src/lib/fetch-functions/orders.ts` — `createManualOrder` ya serializa el body completo
- `prisma/schema.prisma` — `adminNotes String?` ya existe
- `src/types/models.ts` — `adminNotes?: string` ya existe en la interfaz `Order`
