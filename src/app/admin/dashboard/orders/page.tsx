"use client";

import { useState } from "react";
import {
  Search,
  Eye,
  Clock,
  MapPin,
  Phone,
  User,
  ChefHat,
  Truck,
  CheckCircle2,
  Package,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrders } from "@/hooks/use-orders";
import { formatPrice } from "@/stores/use-cart-store";
import { ORDER_STATUS_CONFIG, type OrderStatus, type OrderWithItems } from "@/types/models";

function StatusIcon({ status }: { status: OrderStatus }) {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "confirmed":
      return <CheckCircle2 className="h-4 w-4" />;
    case "preparing":
      return <ChefHat className="h-4 w-4" />;
    case "ready":
      return <Package className="h-4 w-4" />;
    case "delivered":
      return <Truck className="h-4 w-4" />;
    case "cancelled":
      return <XCircle className="h-4 w-4" />;
  }
}

function OrderCard({
  order,
  onView,
  onStatusChange,
  isUpdating,
}: {
  order: OrderWithItems;
  onView: () => void;
  onStatusChange: (status: OrderStatus) => void;
  isUpdating: boolean;
}) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${statusConfig.color} text-white`}
            >
              <StatusIcon status={order.status} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{order.orderNumber}</span>
                <Badge variant="outline" className="capitalize">
                  {order.type === "delivery" ? "Domicilio" : "Recoger"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleString("es-CO", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className={`${statusConfig.color} text-white`}>
            {statusConfig.text}
          </Badge>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{order.customerName}</span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{order.customerPhone}</span>
          </div>
          {order.deliveryAddress && (
            <div className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{order.deliveryAddress}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="p-4">
          <p className="text-sm font-medium text-muted-foreground">
            {order.items.length} productos
          </p>
          <div className="mt-2 space-y-1">
            {order.items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.productName}
                </span>
                <span className="text-muted-foreground">
                  {formatPrice(item.totalPrice)}
                </span>
              </div>
            ))}
            {order.items.length > 3 && (
              <p className="text-sm text-muted-foreground">
                +{order.items.length - 3} más...
              </p>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-primary">
              {formatPrice(order.total)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onView}>
              <Eye className="mr-2 h-4 w-4" />
              Ver
            </Button>
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <Select
                value={order.status}
                onValueChange={(value) => onStatusChange(value as OrderStatus)}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="preparing">Preparando</SelectItem>
                  <SelectItem value="ready">Listo</SelectItem>
                  <SelectItem value="delivered">Entregado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const { orders, isLoading, updateOrderStatus } = useOrders();

  const orderStats = {
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      activeStatus === "all" || order.status === activeStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdatingOrderId(orderId);
    await updateOrderStatus(orderId, status);
    setUpdatingOrderId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-16" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Órdenes</h2>
          <p className="text-muted-foreground">
            Administra y procesa los pedidos de tus clientes
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendientes</p>
              <p className="text-2xl font-bold">{orderStats.pending}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Preparando</p>
              <p className="text-2xl font-bold">{orderStats.preparing}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Listos</p>
              <p className="text-2xl font-bold">{orderStats.ready}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-500/30 bg-gray-500/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-500">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entregados</p>
              <p className="text-2xl font-bold">{orderStats.delivered}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID o cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs value={activeStatus} onValueChange={setActiveStatus}>
              <TabsList>
                <TabsTrigger value="all">Todos ({orders.length})</TabsTrigger>
                <TabsTrigger value="pending">
                  Pendientes ({orderStats.pending})
                </TabsTrigger>
                <TabsTrigger value="preparing">
                  Preparando ({orderStats.preparing})
                </TabsTrigger>
                <TabsTrigger value="ready">
                  Listos ({orderStats.ready})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid */}
      <ScrollArea className="h-[calc(100vh-420px)]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onView={() => handleViewOrder(order)}
              onStatusChange={(status) => handleStatusChange(order.id, status)}
              isUpdating={updatingOrderId === order.id}
            />
          ))}
        </div>
        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              No se encontraron órdenes
            </h3>
            <p className="text-muted-foreground">
              {orders.length === 0
                ? "No hay órdenes registradas todavía"
                : "Intenta ajustar los filtros de búsqueda"}
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Orden {selectedOrder?.orderNumber}
              {selectedOrder && (
                <Badge
                  variant="secondary"
                  className={`${ORDER_STATUS_CONFIG[selectedOrder.status].color} text-white`}
                >
                  {ORDER_STATUS_CONFIG[selectedOrder.status].text}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Información del Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedOrder.customerPhone}</span>
                  </div>
                  {selectedOrder.deliveryAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <span>{selectedOrder.deliveryAddress}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">
                      {selectedOrder.type === "delivery"
                        ? "Domicilio"
                        : "Recoger en tienda"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Productos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-medium">
                            {item.quantity}
                          </span>
                          <div>
                            <span>{item.productName}</span>
                            {item.additions.length > 0 && (
                              <p className="text-xs text-muted-foreground">
                                + {item.additions.map((a) => a.additionName).join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-medium">
                          {formatPrice(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.deliveryFee > 0 && (
                      <div className="flex justify-between">
                        <span>Domicilio</span>
                        <span>{formatPrice(selectedOrder.deliveryFee)}</span>
                      </div>
                    )}
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatPrice(selectedOrder.total)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {selectedOrder.notes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Notas del cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
