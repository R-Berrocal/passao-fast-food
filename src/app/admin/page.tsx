"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Package, TrendingUp, Users, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  mockOrders,
  getStatusColor,
  getStatusText,
  Order,
} from "@/data/orders";
import { formatPrice } from "@/data/menu";

function OrderCard({ order }: { order: Order }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{order.id}</span>
              <Badge
                variant="secondary"
                className={`${getStatusColor(order.status)} text-white`}
              >
                {getStatusText(order.status)}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.customerName} - {order.customerPhone}
            </p>
            {order.address && (
              <p className="text-sm text-muted-foreground">{order.address}</p>
            )}
          </div>
          <div className="text-right">
            <p className="font-semibold text-primary">{formatPrice(order.total)}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(order.createdAt).toLocaleTimeString("es-CO", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span className="text-muted-foreground">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          {order.status === "pending" && (
            <Button size="sm" className="flex-1">
              Preparar
            </Button>
          )}
          {order.status === "preparing" && (
            <Button size="sm" className="flex-1">
              Listo
            </Button>
          )}
          {order.status === "ready" && (
            <Button size="sm" className="flex-1">
              Entregar
            </Button>
          )}
          <Button size="sm" variant="outline">
            Ver detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredOrders =
    activeTab === "all"
      ? mockOrders
      : mockOrders.filter((order) => order.status === activeTab);

  const stats = {
    total: mockOrders.length,
    pending: mockOrders.filter((o) => o.status === "pending").length,
    preparing: mockOrders.filter((o) => o.status === "preparing").length,
    ready: mockOrders.filter((o) => o.status === "ready").length,
    revenue: mockOrders.reduce((acc, o) => acc + o.total, 0),
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="ml-4 text-xl font-bold">Panel de Administración</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Gestión de Productos */}
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <UtensilsCrossed className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Gestión de Productos</h2>
                <p className="text-sm text-muted-foreground">
                  Crear, editar y administrar el menú
                </p>
              </div>
            </div>
            <Button asChild size="lg">
              <Link href="/admin/products">
                Administrar Productos
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Hoy</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En Preparación</p>
                <p className="text-2xl font-bold">{stats.preparing}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ventas Hoy</p>
                <p className="text-2xl font-bold">{formatPrice(stats.revenue)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Todos ({stats.total})</TabsTrigger>
                <TabsTrigger value="pending">
                  Pendientes ({stats.pending})
                </TabsTrigger>
                <TabsTrigger value="preparing">
                  Preparando ({stats.preparing})
                </TabsTrigger>
                <TabsTrigger value="ready">Listos ({stats.ready})</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                <ScrollArea className="h-125">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredOrders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
