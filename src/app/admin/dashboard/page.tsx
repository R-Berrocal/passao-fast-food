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
        <CardTitle>Top 5 Productos del Mes</CardTitle>
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
