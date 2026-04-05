# Dashboard Admin — Rediseño

**Fecha:** 2026-04-05
**Estado:** Aprobado

## Contexto

El dashboard actual muestra "Pedidos recientes" y "Acciones rápidas" que el operador no usa. Las métricas de "Productos activos" y "Clientes registrados" son estáticas y no aportan al monitoreo diario. El negocio opera jueves a domingo (~16 días al mes).

## Objetivo

Reemplazar las secciones de poco valor con información accionable: cuánto se ha vendido hoy (con desglose de pago), cómo va este fin de semana vs el anterior, y qué productos lideran las ventas del mes.

## Diseño

### Secciones visibles para todos (admin + staff)

**Fila KPIs — 4 tarjetas:**
| Tarjeta | Dato |
|---------|------|
| Ventas del día | Total de pedidos no cancelados de hoy |
| Pedidos hoy | Conteo de pedidos no cancelados de hoy |
| Efectivo hoy | Suma de pedidos con paymentMethod `cash` de hoy |
| Digital hoy | Suma de pedidos con paymentMethod digital de hoy (Nequi, Daviplata, transferencia) |

**Estado de pedidos — 3 indicadores (filtrados al día de hoy):**
- Pendientes hoy
- En preparación hoy
- Completados hoy

### Secciones visibles solo para admin

**Tendencia fin de semana (tabla comparativa):**
- Columnas: Jueves · Viernes · Sábado · Domingo
- Filas: Fin de semana anterior | Fin de semana actual
- Cada celda muestra: ventas y cantidad de pedidos
- Días futuros de la semana actual muestran `—`
- Permite comparar si el fin de semana actual va mejor o peor que el anterior

**Top 5 productos (histórico general):**
- Período: todos los pedidos históricos (sin filtro de fecha)
- Métrica: unidades vendidas (suma de `OrderItem.quantity`, excluyendo pedidos cancelados)
- Columnas: posición, nombre del producto, unidades vendidas, ingresos generados

### Eliminado
- Sección "Pedidos recientes"
- Sección "Acciones rápidas"
- KPI "Productos activos"
- KPI "Clientes registrados"

## Control de acceso

- Rol `staff`: ve KPIs (ventas, pedidos, efectivo, digital) y estado de pedidos
- Rol `admin`: ve todo lo anterior + tendencia semanal + top 5 productos
- La lógica se implementa en el frontend usando el rol del usuario autenticado (`useAuthStore`)
- Las secciones admin-only simplemente no se renderizan para staff (no requieren endpoints separados)

## Cambios de API

### Endpoint existente `GET /api/dashboard/stats`

Agregar al response:
- `cashToday`: suma ventas efectivo hoy
- `digitalToday`: suma ventas digital hoy
- Cambiar `pendingOrders` y `preparingOrders` para filtrar al día de hoy (actualmente son globales)

### Nuevo endpoint `GET /api/dashboard/weekend-trend`

Response:
```json
{
  "lastWeekend": {
    "thursday": { "sales": 180000, "orders": 12 },
    "friday": { "sales": 250000, "orders": 18 },
    "saturday": { "sales": 320000, "orders": 24 },
    "sunday": { "sales": 290000, "orders": 21 }
  },
  "thisWeekend": {
    "thursday": { "sales": 210000, "orders": 14 },
    "friday": { "sales": 195000, "orders": 13 },
    "saturday": null,
    "sunday": null
  }
}
```
- `null` indica que el día aún no ha llegado esta semana
- Solo visible/llamado por admin

### Nuevo endpoint `GET /api/dashboard/top-products`

Response:
```json
{
  "products": [
    { "id": "...", "name": "Hamburguesa Clásica", "unitsSold": 38, "revenue": 570000 },
    ...
  ],
  "period": { "from": "2026-04-01", "to": "2026-04-30" }
}
```
- Sin filtro de fecha (histórico general)
- Excluye pedidos cancelados
- Limita a 5 resultados
- Solo visible/llamado por admin

## Hooks de TanStack Query

- `useDashboardStats()` — ya existe, se extiende con nuevos campos
- `useDashboardWeekendTrend()` — nuevo hook para tendencia
- `useTopProducts()` — nuevo hook para top productos

## Estructura de archivos afectados

```
src/app/api/dashboard/
  stats/route.ts              ← modificar
  weekend-trend/route.ts      ← nuevo
  top-products/route.ts       ← nuevo

src/hooks/
  use-dashboard.ts            ← modificar (agregar nuevos campos)
  use-weekend-trend.ts        ← nuevo
  use-top-products.ts         ← nuevo

src/lib/query-keys.ts         ← agregar claves para nuevos endpoints
src/app/admin/dashboard/
  page.tsx                    ← modificar layout
  page-content.tsx            ← modificar (o crear si no existe)
```
