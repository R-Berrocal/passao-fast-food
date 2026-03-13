"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  Scale,
  Banknote,
  Smartphone,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useDailyReport } from "@/hooks/use-reports";
import { formatPrice } from "@/stores/use-cart-store";

function getTodayString() {
  // Use Colombia timezone (UTC-5) so the date doesn't roll over at 7 PM local time
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}

function formatDateLabel(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Efectivo",
  nequi: "Nequi",
  daviplata: "Daviplata",
  transfer: "Transferencia",
};

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const { report, isLoading, error, refetch } = useDailyReport(selectedDate);

  const isToday = selectedDate === getTodayString();

  const navigateDate = (direction: -1 | 1) => {
    const date = new Date(selectedDate + "T12:00:00");
    date.setDate(date.getDate() + direction);
    setSelectedDate(date.toISOString().slice(0, 10));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reporte del Día</h2>
          <p className="text-muted-foreground">Resumen de ventas e insumos</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Date Navigator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={() => navigateDate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <p className="font-semibold capitalize">{formatDateLabel(selectedDate)}</p>
              {isToday && (
                <Badge variant="secondary" className="mt-1">
                  Hoy
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateDate(1)}
              disabled={isToday}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          Error al cargar el reporte: {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : report ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Sales Card */}
            <Card className="border-green-500/30 bg-green-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <TrendingUp className="h-5 w-5" />
                  Ventas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold">{formatPrice(report.sales.totalRevenue)}</p>
                  <p className="text-sm text-muted-foreground">
                    {report.sales.totalOrders} órdenes
                  </p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      <span>Efectivo</span>
                    </div>
                    <span className="font-semibold">{formatPrice(report.sales.cashRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <span>Digital</span>
                    </div>
                    <span className="font-semibold">
                      {formatPrice(report.sales.digitalRevenue)}
                    </span>
                  </div>
                </div>
                {report.sales.byPaymentMethod.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        Detalle
                      </p>
                      {report.sales.byPaymentMethod.map(({ method, count, total }) => (
                        <div key={method} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {PAYMENT_LABELS[method] || method} ({count})
                          </span>
                          <span>{formatPrice(total)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Supplies Card */}
            <Card className="border-orange-500/30 bg-orange-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-orange-500">
                  <ShoppingBag className="h-5 w-5" />
                  Insumos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold">{formatPrice(report.supplies.totalSpent)}</p>
                  <p className="text-sm text-muted-foreground">
                    {report.supplies.totalPurchases} compras
                  </p>
                </div>
                {report.supplies.totalPurchases === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    Sin compras registradas este día
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Balance Card */}
            <Card
              className={
                report.balance >= 0
                  ? "border-primary/30 bg-primary/5"
                  : "border-destructive/30 bg-destructive/5"
              }
            >
              <CardHeader className="pb-2">
                <CardTitle
                  className={`flex items-center gap-2 ${
                    report.balance >= 0 ? "text-primary" : "text-destructive"
                  }`}
                >
                  <Scale className="h-5 w-5" />
                  Balance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p
                    className={`text-3xl font-bold ${
                      report.balance >= 0 ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {formatPrice(Math.abs(report.balance))}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {report.balance >= 0 ? "Ganancia bruta del día" : "Pérdida del día"}
                  </p>
                </div>
                <Separator />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ventas</span>
                    <span className="font-medium text-green-500">
                      +{formatPrice(report.sales.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Insumos</span>
                    <span className="font-medium text-orange-500">
                      −{formatPrice(report.supplies.totalSpent)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
