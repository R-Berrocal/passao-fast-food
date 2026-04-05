# Dashboard Admin — Rediseño — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar secciones de poco valor en el dashboard (pedidos recientes, acciones rápidas, métricas estáticas) con información accionable: desglose efectivo/digital del día, tendencia fin de semana vs fin de semana anterior, y top 5 productos del mes.

**Architecture:** El backend se extiende con dos nuevos route handlers (`/api/dashboard/weekend-trend`, `/api/dashboard/top-products`) y el endpoint de stats existente se actualiza con nuevos campos. El frontend usa nuevos hooks de TanStack Query y renderiza secciones condicionalmente según el rol del usuario (admin ve todo, staff ve solo KPIs básicos y estado de pedidos).

**Tech Stack:** Next.js 16 App Router, Prisma ORM, TanStack Query, Zustand (auth store), Tailwind CSS v4, shadcn/ui

---

## Chunk 1: Backend — Endpoints

### Task 1: Extender `GET /api/dashboard/stats`

**Files:**
- Modify: `src/app/api/dashboard/stats/route.ts`
- Modify: `src/lib/fetch-functions/dashboard.ts`

**Cambios:**
- Agregar `cashToday` y `digitalToday` al response
- Cambiar `pendingOrdersCount` y `preparingOrdersCount` para filtrar solo pedidos de hoy (no globales)
- Eliminar `recentOrders`, `activeProductsCount`, `customerCount` del response (ya no se usan)

- [ ] **Step 1: Actualizar el route handler**

Reemplazar el contenido de `src/app/api/dashboard/stats/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-response";
import { getTodayString, getColombiaDateRange } from "@/lib/date-utils";

export async function GET(request: NextRequest) {
  try {
    const staff = await requireStaff(request);
    if (!staff) return unauthorizedResponse();

    const { startUTC: todayStart, endUTC: todayEnd } = getColombiaDateRange(getTodayString());

    const todayOrders = await prisma.order.findMany({
      where: {
        status: { not: "cancelled" },
        createdAt: { gte: todayStart, lt: todayEnd },
      },
      select: { total: true, status: true, paymentMethod: true },
    });

    const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const cashToday = todayOrders
      .filter((o) => o.paymentMethod === "cash")
      .reduce((sum, o) => sum + o.total, 0);
    const digitalToday = todayOrders
      .filter((o) => o.paymentMethod !== "cash")
      .reduce((sum, o) => sum + o.total, 0);
    const completedTodayCount = todayOrders.filter((o) => o.status === "delivered").length;
    const pendingOrdersCount = todayOrders.filter((o) => o.status === "pending").length;
    const preparingOrdersCount = todayOrders.filter((o) => o.status === "preparing").length;

    return successResponse({
      todaySales,
      todayOrdersCount: todayOrders.length,
      cashToday,
      digitalToday,
      pendingOrdersCount,
      preparingOrdersCount,
      completedTodayCount,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return serverErrorResponse();
  }
}
```

- [ ] **Step 2: Actualizar el tipo `DashboardStats` y la fetch function**

Reemplazar el contenido de `src/lib/fetch-functions/dashboard.ts`:

```typescript
import type { ApiResponse } from "@/types/models";
import { getAuthHeaders } from "@/stores/use-auth-store";
import { getBaseUrl } from "@/lib/utils";

export interface DashboardStats {
  todaySales: number;
  todayOrdersCount: number;
  cashToday: number;
  digitalToday: number;
  pendingOrdersCount: number;
  preparingOrdersCount: number;
  completedTodayCount: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${getBaseUrl()}/api/dashboard/stats`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });
  const result: ApiResponse<DashboardStats> = await response.json();
  if (!result.success || !result.data) throw new Error(result.error || "Error al cargar estadísticas");
  return result.data;
}
```

- [ ] **Step 3: Verificar que el servidor arranca sin errores de TypeScript**

```bash
npm run lint
```

---

### Task 2: Crear `GET /api/dashboard/weekend-trend`

**Files:**
- Create: `src/app/api/dashboard/weekend-trend/route.ts`

**Lógica de fechas:**
- "Este fin de semana" = el bloque Jue–Dom más reciente que incluye hoy
- "Fin de semana anterior" = el bloque Jue–Dom 7 días antes
- Días futuros de este fin de semana → `null`

```
daysSinceThursday = (dayOfWeek + 3) % 7
// Thu(4)→0, Fri(5)→1, Sat(6)→2, Sun(0)→3, Mon(1)→4, Tue(2)→5, Wed(3)→6
thisThursday = today - daysSinceThursday
lastThursday = thisThursday - 7 days
```

- [ ] **Step 1: Crear el route handler**

Crear `src/app/api/dashboard/weekend-trend/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-response";
import { getColombiaDateRange, getTodayString } from "@/lib/date-utils";

type DayStats = { sales: number; orders: number } | null;

interface WeekendDays {
  thursday: DayStats;
  friday: DayStats;
  saturday: DayStats;
  sunday: DayStats;
}

async function getDayStats(dateStr: string): Promise<{ sales: number; orders: number }> {
  const { startUTC, endUTC } = getColombiaDateRange(dateStr);
  const orders = await prisma.order.findMany({
    where: {
      status: { not: "cancelled" },
      createdAt: { gte: startUTC, lt: endUTC },
    },
    select: { total: true },
  });
  return {
    sales: orders.reduce((sum, o) => sum + o.total, 0),
    orders: orders.length,
  };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return unauthorizedResponse();

    const todayStr = getTodayString();
    const todayDate = new Date(`${todayStr}T12:00:00`);
    const dayOfWeek = todayDate.getDay(); // 0=Sun ... 6=Sat
    const daysSinceThursday = (dayOfWeek + 3) % 7;

    const thisThursday = addDays(todayStr, -daysSinceThursday);
    const lastThursday = addDays(thisThursday, -7);

    const dayNames = ["thursday", "friday", "saturday", "sunday"] as const;

    // Fetch last weekend (all 4 days, already happened)
    const lastWeekendResults = await Promise.all([
      getDayStats(lastThursday),
      getDayStats(addDays(lastThursday, 1)),
      getDayStats(addDays(lastThursday, 2)),
      getDayStats(addDays(lastThursday, 3)),
    ]);

    const lastWeekend: WeekendDays = {
      thursday: lastWeekendResults[0],
      friday: lastWeekendResults[1],
      saturday: lastWeekendResults[2],
      sunday: lastWeekendResults[3],
    };

    // Fetch this weekend (future days → null)
    const thisWeekendDays = [0, 1, 2, 3].map((offset) => addDays(thisThursday, offset));
    const thisWeekendResults = await Promise.all(
      thisWeekendDays.map((dayStr) =>
        dayStr > todayStr ? Promise.resolve(null) : getDayStats(dayStr)
      )
    );

    const thisWeekend: WeekendDays = {
      thursday: thisWeekendResults[0],
      friday: thisWeekendResults[1],
      saturday: thisWeekendResults[2],
      sunday: thisWeekendResults[3],
    };

    return successResponse({
      lastWeekend,
      thisWeekend,
      thisThursday,
      lastThursday,
    });
  } catch (error) {
    console.error("Weekend trend error:", error);
    return serverErrorResponse();
  }
}
```

- [ ] **Step 2: Verificar lint**

```bash
npm run lint
```

---

### Task 3: Crear `GET /api/dashboard/top-products`

**Files:**
- Create: `src/app/api/dashboard/top-products/route.ts`

**Lógica:**
- Período: histórico general (sin filtro de fecha)
- Agrupar `OrderItem` por `productId` donde el pedido no esté cancelado
- Ordenar por unidades desc, tomar top 5

- [ ] **Step 1: Crear el route handler**

Crear `src/app/api/dashboard/top-products/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return unauthorizedResponse();

    const items = await prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      where: {
        order: {
          status: { not: "cancelled" },
        },
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const products = items.map((item) => ({
      productId: item.productId,
      name: item.productName,
      unitsSold: item._sum.quantity ?? 0,
      revenue: item._sum.totalPrice ?? 0,
    }));

    return successResponse({ products });
  } catch (error) {
    console.error("Top products error:", error);
    return serverErrorResponse();
  }
}
```

- [ ] **Step 2: Verificar lint**

```bash
npm run lint
```

---

## Chunk 2: Frontend — Data Layer

### Task 4: Actualizar query keys y agregar fetch functions + hooks

**Files:**
- Modify: `src/lib/query-keys.ts`
- Modify: `src/lib/fetch-functions/dashboard.ts` (ya modificado en Task 1)
- Modify: `src/hooks/use-dashboard.ts`
- Create: `src/hooks/use-weekend-trend.ts`
- Create: `src/hooks/use-top-products.ts`

- [ ] **Step 1: Agregar claves en `src/lib/query-keys.ts`**

Reemplazar el bloque `dashboard`:

```typescript
  // Dashboard
  dashboard: {
    all: () => ["dashboard"] as const,
    stats: () => [...queryKeys.dashboard.all(), "stats"] as const,
    weekendTrend: () => [...queryKeys.dashboard.all(), "weekend-trend"] as const,
    topProducts: () => [...queryKeys.dashboard.all(), "top-products"] as const,
  },
```

- [ ] **Step 2: Agregar tipos e interfaces de fetch en `src/lib/fetch-functions/dashboard.ts`**

Agregar al final del archivo (después de `fetchDashboardStats`):

```typescript
type DayStats = { sales: number; orders: number } | null;

interface WeekendDays {
  thursday: DayStats;
  friday: DayStats;
  saturday: DayStats;
  sunday: DayStats;
}

export interface WeekendTrend {
  lastWeekend: WeekendDays;
  thisWeekend: WeekendDays;
  thisThursday: string;
  lastThursday: string;
}

export interface TopProduct {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface TopProductsData {
  products: TopProduct[];
}

export async function fetchWeekendTrend(): Promise<WeekendTrend> {
  const response = await fetch(`${getBaseUrl()}/api/dashboard/weekend-trend`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });
  const result: ApiResponse<WeekendTrend> = await response.json();
  if (!result.success || !result.data) throw new Error(result.error || "Error al cargar tendencia");
  return result.data;
}

export async function fetchTopProducts(): Promise<TopProductsData> {
  const response = await fetch(`${getBaseUrl()}/api/dashboard/top-products`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });
  const result: ApiResponse<TopProductsData> = await response.json();
  if (!result.success || !result.data) throw new Error(result.error || "Error al cargar top productos");
  return result.data;
}
```

- [ ] **Step 3: Crear `src/hooks/use-weekend-trend.ts`**

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchWeekendTrend } from "@/lib/fetch-functions/dashboard";

export function useWeekendTrend() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.weekendTrend(),
    queryFn: fetchWeekendTrend,
    staleTime: 60 * 1000,
  });

  return {
    trend: data,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
```

- [ ] **Step 4: Crear `src/hooks/use-top-products.ts`**

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchTopProducts } from "@/lib/fetch-functions/dashboard";

export function useTopProducts() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.topProducts(),
    queryFn: fetchTopProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes — changes less frequently
  });

  return {
    topProducts: data,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
```

- [ ] **Step 5: Verificar lint**

```bash
npm run lint
```

---

## Chunk 3: Frontend — Dashboard Page

### Task 5: Rediseñar `src/app/admin/dashboard/page.tsx`

**Files:**
- Modify: `src/app/admin/dashboard/page.tsx`

**Estructura nueva:**
1. Fila KPIs (4 tarjetas): Ventas del día, Pedidos hoy, Efectivo hoy, Digital hoy
2. Estado de pedidos (3 indicadores filtrados a hoy): Pendientes, En preparación, Completados
3. [Solo admin] Tendencia fin de semana — tabla comparativa
4. [Solo admin] Top 5 productos del mes

**Control de acceso:** Usar `isAdmin()` de `@/stores/use-auth-store` para mostrar u ocultar secciones admin.

- [ ] **Step 1: Reemplazar el contenido de `src/app/admin/dashboard/page.tsx`**

```typescript
"use client";

import {
  Banknote,
  ShoppingCart,
  DollarSign,
  Smartphone,
  Clock,
  TrendingUp,
  CheckCircle2,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { useWeekendTrend } from "@/hooks/use-weekend-trend";
import { useTopProducts } from "@/hooks/use-top-products";
import { formatPrice } from "@/stores/use-cart-store";
import { isAdmin } from "@/stores/use-auth-store";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const DAY_LABELS = {
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
} as const;

type WeekendDay = keyof typeof DAY_LABELS;

function WeekendTrendSection() {
  const { trend, isLoading } = useWeekendTrend();

  if (isLoading) return <Skeleton className="h-48 w-full" />;
  if (!trend) return null;

  const days: WeekendDay[] = ["thursday", "friday", "saturday", "sunday"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia del Fin de Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left font-medium text-muted-foreground"></th>
                {days.map((day) => (
                  <th key={day} className="py-2 px-3 text-center font-medium">
                    {DAY_LABELS[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Last weekend */}
              <tr className="border-b">
                <td className="py-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                  Semana anterior
                </td>
                {days.map((day) => {
                  const d = trend.lastWeekend[day];
                  return (
                    <td key={day} className="py-3 px-3 text-center">
                      {d ? (
                        <div>
                          <p className="font-semibold">{formatPrice(d.sales)}</p>
                          <p className="text-xs text-muted-foreground">{d.orders} ped.</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
              {/* This weekend */}
              <tr>
                <td className="py-3 text-sm font-semibold whitespace-nowrap">
                  Este fin de semana
                </td>
                {days.map((day) => {
                  const d = trend.thisWeekend[day];
                  return (
                    <td key={day} className="py-3 px-3 text-center">
                      {d ? (
                        <div>
                          <p className="font-bold text-primary">{formatPrice(d.sales)}</p>
                          <p className="text-xs text-muted-foreground">{d.orders} ped.</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function TopProductsSection() {
  const { topProducts, isLoading } = useTopProducts();

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (!topProducts) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Productos</CardTitle>
      </CardHeader>
      <CardContent>
        {topProducts.products.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay ventas este mes aún
          </p>
        ) : (
          <div className="space-y-3">
            {topProducts.products.map((product, index) => (
              <div
                key={product.productId}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {index === 0 ? (
                      <Trophy className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.unitsSold} unidades
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-sm">{formatPrice(product.revenue)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { stats, isLoading } = useDashboardStats();
  const admin = isAdmin();

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        ) : (
          <>
            <StatCard
              title="Ventas del Día"
              value={formatPrice(stats?.todaySales ?? 0)}
              icon={DollarSign}
              color="text-green-500"
              bgColor="bg-green-500/10"
            />
            <StatCard
              title="Pedidos Hoy"
              value={(stats?.todayOrdersCount ?? 0).toString()}
              icon={ShoppingCart}
              color="text-blue-500"
              bgColor="bg-blue-500/10"
            />
            <StatCard
              title="Efectivo Hoy"
              value={formatPrice(stats?.cashToday ?? 0)}
              icon={Banknote}
              color="text-yellow-500"
              bgColor="bg-yellow-500/10"
            />
            <StatCard
              title="Digital Hoy"
              value={formatPrice(stats?.digitalToday ?? 0)}
              icon={Smartphone}
              color="text-purple-500"
              bgColor="bg-purple-500/10"
            />
          </>
        )}
      </div>

      {/* Order Status */}
      <div className="grid gap-4 sm:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-lg border bg-yellow-500/10 p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Pendientes hoy</span>
              </div>
              <span className="text-2xl font-bold text-yellow-500">
                {stats?.pendingOrdersCount ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-blue-500/10 p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <span className="font-medium">En preparación</span>
              </div>
              <span className="text-2xl font-bold text-blue-500">
                {stats?.preparingOrdersCount ?? 0}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-green-500/10 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-medium">Completados hoy</span>
              </div>
              <span className="text-2xl font-bold text-green-500">
                {stats?.completedTodayCount ?? 0}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Admin-only sections */}
      {admin && (
        <div className="grid gap-6 lg:grid-cols-2">
          <WeekendTrendSection />
          <TopProductsSection />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verificar lint y que el servidor arranca**

```bash
npm run lint
npm run dev
```

Abrir `http://localhost:3000/admin/dashboard` y verificar:
- Con usuario admin: se ven los 4 KPIs, estado de pedidos (3 indicadores), tendencia y top productos
- Con usuario staff: se ven los 4 KPIs y estado de pedidos, sin tendencia ni top productos
- Skeleton loaders aparecen durante la carga
- Días futuros en la tendencia muestran `—`
- Si no hay productos vendidos este mes, la sección muestra el mensaje vacío

---

## Notas de implementación

- `isAdmin()` de `use-auth-store` es una función standalone (no hook), se puede llamar directamente en el render
- El endpoint `/api/dashboard/weekend-trend` usa `requireAdmin` — si un staff lo llama, devuelve 401 (las secciones admin no se renderizan para staff, por lo que nunca se hará esa llamada)
- Los tres indicadores de estado ahora son filtrados al día de hoy, coherentes con el resto del dashboard
- `groupBy` de Prisma requiere que la relación `order` esté incluida en el `where` — el modelo `OrderItem` tiene `order` como relación, lo que es soportado por Prisma
