# Diseño: Automatización de Ventas e Insumos

**Fecha:** 2026-03-10
**Estado:** Aprobado

## Problema

El negocio registra ventas y compras de insumos a mano. Al final del día, la empleada calcula los totales manualmente. La página web aún no está en producción para clientes, por lo que las órdenes deben poder registrarse manualmente desde el admin.

## Solución

1. **Registro de orden rápida** — para ingresar ventas manualmente desde el admin
2. **Insumos del día** — para registrar compras de ingredientes y suministros
3. **Reporte del día** — resumen consolidado con desglose por método de pago

---

## Módulo 1: Registro de Orden Rápida

**Ruta:** `/admin/dashboard/orders/new`

### Flujo

1. Header con botón volver + título "Nueva Venta"
2. Buscador de productos (texto libre) + tabs de filtro por categoría
3. Cuadrícula de productos — cada tarjeta muestra nombre y precio; al tocar agrega al carrito; si ya está en el carrito muestra controles `−` cantidad `+`
4. Panel del carrito con detalle de ítems, subtotal, selector de método de pago y toggle Mostrador/Domicilio
5. Si es Domicilio: aparecen campos nombre, teléfono y dirección del cliente
6. Botón "Registrar Venta" — crea la orden y redirige a `/admin/dashboard/orders`

### Comportamiento responsivo

- **Desktop / tablet horizontal:** layout dos columnas — cuadrícula izquierda, panel carrito fijo derecha
- **Móvil / tablet vertical:** cuadrícula full width, barra sticky inferior con total; al tocarla abre sheet deslizable con el carrito completo

### Decisiones de diseño — API

**Endpoint separado `POST /api/admin/orders`** con `requireStaff`. El `POST /api/orders` permanece sin cambios (sigue público para el checkout de clientes).

**Schema Zod:** `createManualOrderSchema` extiende `createOrderSchema` con dos campos opcionales:
```typescript
const createManualOrderSchema = createOrderSchema.extend({
  status: z.enum(["pending","confirmed","preparing","ready","delivered","cancelled"]).default("delivered"),
  paymentStatus: z.enum(["pending","confirmed","rejected"]).default("confirmed"),
});
```

**Lógica del handler `/api/admin/orders`:** Reutiliza `generateOrderNumber()` (extraída a `src/lib/order-utils.ts` como función compartida), hace el mismo find-or-create del cliente por teléfono (es aceptable tener un User "Mostrador" con `phone = "0000000000"` en la BD como cliente anónimo), valida productos/adiciones y aplica `deliveryFee` desde `BusinessConfig` (mismo comportamiento que el endpoint público).

**Cliente anónimo en mostrador:** Ventas de pickup sin datos del cliente envían `customerName = "Mostrador"` y `customerPhone = "0000000000"` (10 chars — pasa `min(10)`). La API crea o reutiliza el User "Mostrador". Comportamiento intencionado.

**Status y paymentStatus:** Órdenes manuales envían `status: "delivered"` y `paymentStatus: "confirmed"`.

**`deliveryFee`:** Para domicilios manuales, se aplica el `deliveryFee` de `BusinessConfig` igual que en el checkout de clientes. El campo en `Order` no es opcional, solo es 0 para pickup.

**Fetch function:** Agregar `createManualOrder(data)` en `src/lib/fetch-functions/orders.ts`, llama a `/api/admin/orders` con `getAuthHeaders()`.

**Hook:** Agregar `useCreateManualOrder()` en `src/hooks/use-orders.ts`, invalidates `queryKeys.orders.all()` on success.

---

## Módulo 2: Insumos del Día

### Página principal — `/admin/dashboard/supplies`

- Selector de fecha (por defecto hoy, permite consultar días anteriores)
- Lista de compras: descripción, categoría, monto, botón eliminar con dialog de confirmación
- Card resumen al final con total gastado en el día
- Eliminación permanente (sin soft-delete) — decisión consciente para mantener el schema simple

### Formulario — `/admin/dashboard/supplies/new`

Campos:
- **Descripción** (requerido)
- **Categoría** (requerido): selector Ingredientes / Empaques / Bebidas / Servicios / Otros
- **Monto** (requerido): `Int`, COP sin decimales
- **Fecha** (por defecto hoy, editable): `z.coerce.date()` en Zod — convierte string "YYYY-MM-DD" a Date; Prisma lo acepta directamente para `@db.Date`
- **Notas** (opcional)

### Schema nuevo

```prisma
model SupplyPurchase {
  id          String   @id @default(cuid())
  description String
  category    String   // "Ingredientes" | "Empaques" | "Bebidas" | "Servicios" | "Otros"
  amount      Int      // COP sin decimales
  date        DateTime @db.Date
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([date])
  @@map("supply_purchases")
}
```

### API nueva

Rutas en `/api/supplies/*` (consistente con el resto del proyecto: `/api/orders`, `/api/products`, etc., todos con `requireStaff` en GET).

- `GET /api/supplies?date=YYYY-MM-DD` — filtra con `date: { gte: startOfDay, lt: endOfDay }` en UTC (campo `@db.Date` no tiene componente hora — Prisma hace la comparación por fecha completa; el query param se parsea con `new Date(date)` que produce la fecha UTC correcta para campos `Date`)
- `POST /api/supplies` — registra nueva compra
- `DELETE /api/supplies/[id]` — elimina permanentemente

Todos requieren `requireStaff`. Sin paginación (consistente con endpoints existentes).

---

## Módulo 3: Reporte del Día

**Ruta:** `/admin/dashboard/reports`

### Layout

- Selector de fecha en el header con navegación ← día anterior / día siguiente →
- Card **Ventas:** total recaudado, # órdenes, desglose efectivo vs digital
- Card **Insumos:** total gastado, # compras
- Card **Balance:** Ventas − Insumos, verde si ≥ 0, rojo si negativo

### Tipo `DailyReport`

Se agrega a `src/types/models.ts`. `PaymentMethod` ya está exportado desde ese mismo archivo.

```typescript
export interface DailyReport {
  date: string; // "YYYY-MM-DD"
  sales: {
    totalOrders: number;
    totalRevenue: number;
    cashRevenue: number;    // paymentMethod === "cash"
    digitalRevenue: number; // paymentMethod IN ("nequi", "daviplata", "transfer")
    byPaymentMethod: {
      method: PaymentMethod;
      count: number;
      total: number;
    }[];
  };
  supplies: {
    totalPurchases: number;
    totalSpent: number;
  };
  balance: number; // totalRevenue - totalSpent
}
```

**"Digital"** = cualquier método que no sea efectivo: `nequi + daviplata + transfer`.

### Manejo de timezone — órdenes

Colombia opera en UTC-5. El campo `createdAt` de Order es `DateTime` (con hora). El filtro de fecha para órdenes usa:

```typescript
const startUTC = new Date(`${date}T05:00:00.000Z`); // medianoche Colombia
const endUTC   = new Date(startUTC.getTime() + 24 * 60 * 60 * 1000);
where: { createdAt: { gte: startUTC, lt: endUTC } }
```

### Manejo de fecha — insumos

El campo `SupplyPurchase.date` es `@db.Date` (solo fecha, sin hora). No requiere rango UTC — Prisma compara directamente la fecha almacenada. El filtro es:

```typescript
where: { date: { equals: new Date(date) } }
```

donde `date` es el string "YYYY-MM-DD" del query param.

### API nueva

`GET /api/reports/daily?date=YYYY-MM-DD` (requiere staff):
- Filtra órdenes `delivered` con `createdAt` en rango UTC-5
- Agrupa por `paymentMethod` para `cashRevenue` / `digitalRevenue`
- Filtra `SupplyPurchase` por `date`
- Retorna `DailyReport`

---

## Navegación

**Sidebar** (`src/app/admin/dashboard/layout.tsx`):

Agregar propiedad `exactMatch?: boolean` a los nav items:
```typescript
const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, exactMatch: true },
  // ... resto sin exactMatch
  { name: "Insumos", href: "/admin/dashboard/supplies", icon: ShoppingBag },
  { name: "Reporte", href: "/admin/dashboard/reports", icon: BarChart3 },
];
```

Lógica de ítem activo:
```typescript
const isActive = item.exactMatch
  ? pathname === item.href
  : pathname.startsWith(item.href);
```

Mismo criterio para el título en el top-bar (replace `=== item.href` con la misma función).

**Página de órdenes:** Agregar botón **"Nueva Venta"** (Link a `/admin/dashboard/orders/new`) en el header.

---

## Archivos a crear

| Archivo | Descripción |
|---|---|
| `src/app/api/admin/orders/route.ts` | POST orden manual (requireStaff, status + paymentStatus) |
| `src/app/api/supplies/route.ts` | GET + POST insumos |
| `src/app/api/supplies/[id]/route.ts` | DELETE insumo |
| `src/app/api/reports/daily/route.ts` | GET reporte diario |
| `src/lib/order-utils.ts` | `generateOrderNumber()` extraída como función compartida |
| `src/lib/validations/supply.ts` | Schema Zod para insumos (z.coerce.date para fecha) |
| `src/lib/fetch-functions/supplies.ts` | Fetch functions insumos |
| `src/lib/fetch-functions/reports.ts` | Fetch functions reportes |
| `src/hooks/use-supplies.ts` | Hook TanStack Query para insumos |
| `src/hooks/use-reports.ts` | Hook TanStack Query para reportes |
| `src/app/admin/dashboard/orders/new/page.tsx` | Formulario orden rápida |
| `src/app/admin/dashboard/supplies/page.tsx` | Lista de insumos |
| `src/app/admin/dashboard/supplies/new/page.tsx` | Formulario nuevo insumo |
| `src/app/admin/dashboard/reports/page.tsx` | Reporte del día |

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `prisma/schema.prisma` | Agregar modelo `SupplyPurchase` |
| `src/types/models.ts` | Agregar `SupplyPurchase` y `DailyReport` |
| `src/lib/validations/order.ts` | Exportar `createOrderSchema` para que pueda ser extendido |
| `src/app/api/orders/route.ts` | Mover `generateOrderNumber()` a `src/lib/order-utils.ts`; importarla desde ahí |
| `src/lib/fetch-functions/orders.ts` | Agregar `createManualOrder()` con auth headers |
| `src/hooks/use-orders.ts` | Agregar `useCreateManualOrder()` |
| `src/lib/query-keys.ts` | Agregar keys para `supplies` y `reports` |
| `src/app/admin/dashboard/layout.tsx` | Nuevos nav items + `exactMatch` + corregir título top-bar |
| `src/app/admin/dashboard/orders/page.tsx` | Botón "Nueva Venta" en header |

---

## Skills a usar en implementación

- **frontend-design** — UI de calidad para formularios y reporte
- **vercel-react-best-practices** — patrones óptimos de Next.js / React
