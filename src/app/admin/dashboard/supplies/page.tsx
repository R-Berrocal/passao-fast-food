"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, ChevronLeft, ChevronRight, ShoppingBag, Loader2, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSupplies } from "@/hooks/use-supplies";
import { formatPrice } from "@/stores/use-cart-store";
import { getTodayString, formatDateLabel } from "@/lib/date-utils";
import type { SupplyPurchase } from "@/types/models";

const CATEGORY_COLORS: Record<string, string> = {
  Ingredientes: "bg-green-500/10 text-green-500 border-green-500/20",
  Empaques: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Bebidas: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Servicios: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Otros: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function SuppliesPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [deleteTarget, setDeleteTarget] = useState<SupplyPurchase | null>(null);
  const { supplies, isLoading, deleteSupply, isDeleting } = useSupplies(selectedDate);

  const totalSpent = supplies.reduce((sum, s) => sum + s.amount, 0);

  const navigateDate = (direction: -1 | 1) => {
    const date = new Date(selectedDate + "T12:00:00");
    date.setDate(date.getDate() + direction);
    setSelectedDate(date.toISOString().slice(0, 10));
  };

  const isToday = selectedDate === getTodayString();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteSupply(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Insumos</h2>
          <p className="text-muted-foreground">Registro de compras de insumos por día</p>
        </div>
        <Button asChild>
          <Link href="/admin/dashboard/supplies/new">
            <Plus className="mr-2 h-4 w-4" />
            Registrar Compra
          </Link>
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

      {/* Summary Card */}
      <Card className="border-orange-500/30 bg-orange-500/5">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total gastado en insumos</p>
            <p className="text-2xl font-bold">{formatPrice(totalSpent)}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-muted-foreground">Compras registradas</p>
            <p className="text-2xl font-bold">{supplies.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Compras del día</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : supplies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <PackageOpen className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="font-semibold">Sin compras registradas</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No hay compras de insumos para este día
              </p>
              {isToday && (
                <Button asChild className="mt-4" variant="outline">
                  <Link href="/admin/dashboard/supplies/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar primera compra
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {supplies.map((supply, idx) => (
                <div key={supply.id}>
                  {idx > 0 && <Separator />}
                  <div className="flex items-center gap-3 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{supply.description}</p>
                      {supply.notes && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {supply.notes}
                        </p>
                      )}
                      <Badge
                        variant="outline"
                        className={`mt-1 text-xs ${CATEGORY_COLORS[supply.category] || CATEGORY_COLORS.Otros}`}
                      >
                        {supply.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">{formatPrice(supply.amount)}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(supply)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar compra?</DialogTitle>
            <DialogDescription>
              Se eliminará &ldquo;<strong>{deleteTarget?.description}</strong>&rdquo; por{" "}
              {deleteTarget ? formatPrice(deleteTarget.amount) : ""}. Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
