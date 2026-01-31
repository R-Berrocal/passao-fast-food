"use client";

import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  mockOrders,
  getStatusColor,
  getStatusText,
} from "@/data/orders";
import { menuData } from "@/data/menu";
import { mockUsers } from "@/data/users";
import { formatPrice } from "@/data/menu";

const stats = [
  {
    title: "Ventas del Día",
    value: formatPrice(485000),
    change: "+12.5%",
    trend: "up" as const,
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Pedidos Hoy",
    value: "24",
    change: "+8.2%",
    trend: "up" as const,
    icon: ShoppingCart,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Productos Activos",
    value: menuData.reduce((acc, cat) => acc + cat.items.length, 0).toString(),
    change: "+2",
    trend: "up" as const,
    icon: Package,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Clientes Registrados",
    value: mockUsers.filter((u) => u.role === "customer").length.toString(),
    change: "-2.1%",
    trend: "down" as const,
    icon: Users,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

const recentActivity = [
  { type: "order", message: "Nuevo pedido #ORD-005 recibido", time: "Hace 2 min" },
  { type: "user", message: "Nuevo cliente: Pedro Gómez", time: "Hace 15 min" },
  { type: "product", message: "Producto 'Arepa Full' actualizado", time: "Hace 30 min" },
  { type: "order", message: "Pedido #ORD-004 entregado", time: "Hace 1 hora" },
  { type: "order", message: "Pedido #ORD-003 en preparación", time: "Hace 2 horas" },
];

export default function DashboardPage() {
  const pendingOrders = mockOrders.filter((o) => o.status === "pending").length;
  const preparingOrders = mockOrders.filter((o) => o.status === "preparing").length;

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
                <div className={`flex items-center gap-1 text-sm ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {stat.change}
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
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {mockOrders.slice(0, 5).map((order) => (
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
                          <p className="font-medium">{order.id}</p>
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
                ))}
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
                <span className="text-2xl font-bold text-green-500">18</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-52">
                <div className="space-y-4">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Productos Más Vendidos</CardTitle>
          <Button variant="outline" size="sm">
            Ver reporte
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Arepa Full", sales: 45, revenue: 630000 },
              { name: "Patacón Full", sales: 38, revenue: 722000 },
              { name: "Suizo Passao", sales: 32, revenue: 704000 },
              { name: "Perro Especial", sales: 28, revenue: 210000 },
            ].map((product, idx) => (
              <div key={idx} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{product.name}</span>
                  <Badge variant="secondary">#{idx + 1}</Badge>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold">{product.sales}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(product.revenue)} en ventas
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
