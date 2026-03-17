"use client";

import { useOrderTracking } from "@/hooks/use-order-tracking";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, CheckCircle2, Circle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus, OrderTracking } from "@/types/models";
import {
  PAYMENT_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
} from "@/types/models";
import Link from "next/link";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPrice(amount: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

// ─── Timeline ───────────────────────────────────────────────────────────────

const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Pendiente" },
  { status: "confirmed", label: "Confirmado" },
  { status: "preparing", label: "En preparación" },
  { status: "ready", label: "Listo" },
  { status: "delivered", label: "Entregado" },
];

function getTimestamp(order: OrderTracking, status: OrderStatus): string | null {
  const map: Partial<Record<OrderStatus, string | null>> = {
    pending: order.createdAt,
    confirmed: order.confirmedAt,
    preparing: order.preparingAt,
    ready: order.readyAt,
    delivered: order.deliveredAt,
  };
  return map[status] ?? null;
}

function Timeline({ order }: { order: OrderTracking }) {
  if (order.status === "cancelled") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
          <XCircle className="h-12 w-12 text-destructive" />
          <p className="text-lg font-semibold text-destructive">Pedido cancelado</p>
          {order.cancelledAt && (
            <p className="text-sm text-muted-foreground">{formatDate(order.cancelledAt)}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  const activeIndex = TIMELINE_STEPS.findIndex((s) => s.status === order.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Estado del pedido</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop: horizontal */}
        <ol className="hidden md:flex items-start gap-0">
          {TIMELINE_STEPS.map((step, i) => {
            const isDone = i < activeIndex;
            const isActive = i === activeIndex;
            const timestamp = getTimestamp(order, step.status);

            return (
              <li key={step.status} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  {i > 0 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1",
                        isDone || isActive ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2",
                      isDone
                        ? "border-primary bg-primary text-primary-foreground"
                        : isActive
                        ? "border-primary bg-background text-primary"
                        : "border-muted bg-background text-muted-foreground"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1",
                        isDone ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
                <p
                  className={cn(
                    "mt-2 text-xs font-medium",
                    isActive
                      ? "text-primary"
                      : isDone
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                {timestamp && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(timestamp)}
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        {/* Mobile: vertical */}
        <ol className="flex flex-col gap-4 md:hidden">
          {TIMELINE_STEPS.map((step, i) => {
            const isDone = i < activeIndex;
            const isActive = i === activeIndex;
            const timestamp = getTimestamp(order, step.status);

            return (
              <li key={step.status} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2",
                      isDone
                        ? "border-primary bg-primary text-primary-foreground"
                        : isActive
                        ? "border-primary bg-background text-primary"
                        : "border-muted bg-background text-muted-foreground"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Circle className="h-3.5 w-3.5" />
                    )}
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div
                      className={cn("mt-1 w-0.5 flex-1", isDone ? "bg-primary" : "bg-muted")}
                    />
                  )}
                </div>
                <div className="pb-4">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isActive
                        ? "text-primary"
                        : isDone
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  {timestamp && (
                    <p className="text-xs text-muted-foreground">{formatDate(timestamp)}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function OrderTrackingContent({ orderNumber }: { orderNumber: string }) {
  const { order, isLoading, error, refetch, isFetching } = useOrderTracking(orderNumber);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <XCircle className="h-12 w-12 text-muted-foreground" />
        <div>
          <p className="font-semibold">Orden no encontrada</p>
          <p className="text-sm text-muted-foreground">
            Verifica el número de orden e intenta de nuevo.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Volver al menú</Link>
        </Button>
      </div>
    );
  }

  const paymentMethodLabel = PAYMENT_METHOD_CONFIG[order.paymentMethod].text;
  const paymentStatusConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus];

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Número de orden</p>
              <p className="text-2xl font-bold text-primary">{order.orderNumber}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {order.customerName} · {formatDate(order.createdAt)}
              </p>
            </div>
            <Badge variant="outline">
              {order.type === "delivery" ? "Domicilio" : "Recogida en tienda"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Timeline order={order} />

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumen del pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3">
            {order.items.map((item, i) => (
              <li key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    {item.quantity}x {item.productName}
                  </span>
                  <span>{formatPrice(item.totalPrice)}</span>
                </div>
                {item.additions.length > 0 && (
                  <ul className="ml-4 space-y-0.5">
                    {item.additions.map((a, j) => (
                      <li
                        key={j}
                        className="flex justify-between text-xs text-muted-foreground"
                      >
                        <span>+ {a.name}</span>
                        {a.price > 0 && <span>{formatPrice(a.price)}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <Separator />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pago</span>
            <div className="flex items-center gap-2">
              <span>{paymentMethodLabel}</span>
              <Badge
                className={cn("text-white text-xs", paymentStatusConfig.color)}
              >
                {paymentStatusConfig.text}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer notes */}
      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{order.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Refresh + back */}
      <div className="flex flex-col items-center gap-3">
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
          {isFetching ? "Actualizando..." : "Actualizar"}
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href="/">Volver al menú</Link>
        </Button>
      </div>
    </div>
  );
}
