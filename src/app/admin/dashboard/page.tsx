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
import { useOrders } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { useUsers } from "@/hooks/use-users";
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

export default function DashboardPage() {
  const { orders, isLoading: ordersLoading } = useOrders();
  const { products, isLoading: productsLoading } = useProducts();
  const { users, isLoading: usersLoading } = useUsers();

  const isLoading = ordersLoading || productsLoading || usersLoading;

  // Calculate stats from real data
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt) >= todayStart
  );

  const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const preparingOrders = orders.filter((o) => o.status === "preparing").length;
  const completedToday = todayOrders.filter(
    (o) => o.status === "delivered"
  ).length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const customerCount = users.filter((u) => u.role === "customer").length;

  const stats = [
    {
      title: "Ventas del Día",
      value: formatPrice(todaySales),
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Pedidos Hoy",
      value: todayOrders.length.toString(),
      icon: ShoppingCart,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Productos Activos",
      value: activeProducts.toString(),
      icon: Package,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Clientes Registrados",
      value: customerCount.toString(),
      icon: Users,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-96" />
          <div className="space-y-6">
            <Skeleton className="h-52" />
            <Skeleton className="h-52" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-1 text-sm text-green-500">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
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
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      No hay pedidos aún
                    </p>
                  </div>
                ) : (
                  orders.slice(0, 5).map((order) => (
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
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Pedidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-yellow-500/10 p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Pendientes</span>
                </div>
                <span className="text-2xl font-bold text-yellow-500">{pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-blue-500/10 p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">En Preparación</span>
                </div>
                <span className="text-2xl font-bold text-blue-500">{preparingOrders}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-green-500/10 p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Completados Hoy</span>
                </div>
                <span className="text-2xl font-bold text-green-500">{completedToday}</span>
              </div>
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

      {/* Top Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Productos Destacados</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/dashboard/products">Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
                <Package className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  No hay productos aún
                </p>
              </div>
            ) : (
              products.slice(0, 4).map((product, idx) => (
                <div key={product.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium line-clamp-1">{product.name}</span>
                    <Badge variant="secondary">#{idx + 1}</Badge>
                  </div>
                  <div className="mt-2">
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.category?.name || "Sin categoría"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
