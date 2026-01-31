"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Clock,
  MapPin,
  Phone,
  User,
  ChefHat,
  Truck,
  CheckCircle2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
import {
  mockOrders,
  getStatusColor,
  getStatusText,
  Order,
} from "@/data/orders";
import { formatPrice } from "@/data/menu";

const orderStats = {
  pending: mockOrders.filter((o) => o.status === "pending").length,
  preparing: mockOrders.filter((o) => o.status === "preparing").length,
  ready: mockOrders.filter((o) => o.status === "ready").length,
  delivered: mockOrders.filter((o) => o.status === "delivered").length,
};

function StatusIcon({ status }: { status: Order["status"] }) {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "preparing":
      return <ChefHat className="h-4 w-4" />;
    case "ready":
      return <Package className="h-4 w-4" />;
    case "delivered":
      return <CheckCircle2 className="h-4 w-4" />;
  }
}

function OrderCard({
  order,
  onView,
}: {
  order: Order;
  onView: () => void;
}) {
  const getNextAction = () => {
    switch (order.status) {
      case "pending":
        return { label: "Preparar", variant: "default" as const };
      case "preparing":
        return { label: "Listo", variant: "default" as const };
      case "ready":
        return { label: "Entregar", variant: "default" as const };
      default:
        return null;
    }
  };

  const action = getNextAction();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${getStatusColor(order.status)}`}
            >
              <StatusIcon status={order.status} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{order.id}</span>
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
          <Badge
            variant="secondary"
            className={`${getStatusColor(order.status)} text-white`}
          >
            {getStatusText(order.status)}
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
          {order.address && (
            <div className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{order.address}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="p-4">
          <p className="text-sm font-medium text-muted-foreground">
            {order.items.length} productos
          </p>
          <div className="mt-2 space-y-1">
            {order.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span className="text-muted-foreground">
                  {formatPrice(item.price * item.quantity)}
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
            {action && (
              <Button size="sm">
                {action.label}
              </Button>
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      activeStatus === "all" || order.status === activeStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

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
                <TabsTrigger value="all">
                  Todos ({mockOrders.length})
                </TabsTrigger>
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
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Orden {selectedOrder?.id}
              {selectedOrder && (
                <Badge
                  variant="secondary"
                  className={`${getStatusColor(selectedOrder.status)} text-white`}
                >
                  {getStatusText(selectedOrder.status)}
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
                  {selectedOrder.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <span>{selectedOrder.address}</span>
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
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded bg-muted text-xs font-medium">
                            {item.quantity}
                          </span>
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatPrice(selectedOrder.total)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Select defaultValue={selectedOrder.status}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="preparing">Preparando</SelectItem>
                    <SelectItem value="ready">Listo</SelectItem>
                    <SelectItem value="delivered">Entregado</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="flex-1">Actualizar Estado</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
