"use client";

import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/use-dashboard";
import { formatPrice } from "@/stores/use-cart-store";
import type { OrderStatus } from "@/types/models";

function getStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    preparing: "bg-orange-500",
    ready: "bg-purple-500",
    delivered: "bg-green-500",
    cancelled: "bg-red-500",
  };
  return colors[status] || "bg-gray-500";
}

function getStatusText(status: OrderStatus): string {
  const texts: Record<OrderStatus, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    preparing: "Preparando",
    ready: "Listo",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };
  return texts[status] || status;
}

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
        <div className="flex items-center justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${bgColor}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="flex items-center gap-1 text-sm text-green-500">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { stats, isLoading } = useDashboardStats();

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
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
              title="Productos Activos"
              value={(stats?.activeProductsCount ?? 0).toString()}
              icon={Package}
              color="text-purple-500"
              bgColor="bg-purple-500/10"
            />
            <StatCard
              title="Clientes Registrados"
              value={(stats?.customerCount ?? 0).toString()}
              icon={Users}
              color="text-orange-500"
              bgColor="bg-orange-500/10"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pedidos Recientes</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/dashboard/orders">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {!stats?.recentOrders.length ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-muted-foreground">No hay pedidos aún</p>
                    </div>
                  ) : (
                    stats.recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{order.orderNumber}</p>
                              <Badge
                                variant="secondary"
                                className={`${getStatusColor(order.status)} text-white text-xs`}
                              >
                                {getStatusText(order.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {order.customerName} • {order.items.length} items
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">
                            {formatPrice(order.total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleTimeString("es-CO", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-yellow-500/10 p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">Pendientes</span>
                    </div>
                    <span className="text-2xl font-bold text-yellow-500">
                      {stats?.pendingOrdersCount ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-blue-500/10 p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">En Preparación</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-500">
                      {stats?.preparingOrdersCount ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-green-500/10 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Completados Hoy</span>
                    </div>
                    <span className="text-2xl font-bold text-green-500">
                      {stats?.completedTodayCount ?? 0}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/dashboard/products/new">
                  <Package className="mr-2 h-4 w-4" />
                  Nuevo Producto
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/dashboard/orders">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Ver Pedidos
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/dashboard/users/new">
                  <Users className="mr-2 h-4 w-4" />
                  Nuevo Usuario
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
