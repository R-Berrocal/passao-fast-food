"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Package, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useOrders } from "@/hooks/use-orders";
import { useAdditions } from "@/hooks/use-additions";
import { fetchOrder } from "@/lib/fetch-functions/orders";
import { formatPrice } from "@/stores/use-cart-store";
import { cn } from "@/lib/utils";
import type { OrderWithItems, Addition } from "@/types/models";

const editOrderSchema = z.object({
  customerName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  customerPhone: z.string().min(7, "Teléfono inválido"),
  customerEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
  adminNotes: z.string().optional(),
  paymentMethod: z.enum(["cash", "card", "transfer", "nequi"]),
});

type EditOrderInput = z.infer<typeof editOrderSchema>;

// ============================================================================
// AdditionsEditDialog
// ============================================================================

function AdditionsEditDialog({
  item,
  allAdditions,
  additionsLoading,
  open,
  onOpenChange,
  onConfirm,
  isSaving,
}: {
  item: OrderWithItems["items"][number] | null;
  allAdditions: Addition[];
  additionsLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (itemId: string, selectedIds: string[]) => void;
  isSaving: boolean;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    item?.additions.map((a) => a.additionId) ?? []
  );

  if (!item) return null;

  const toggleId = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar adiciones — {item.productName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {additionsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : allAdditions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay adiciones disponibles</p>
          ) : (
            <ScrollArea className="max-h-48 overflow-y-auto">
              <div className="space-y-2 pr-2">
                {allAdditions.map((addition) => {
                  const isSelected = selectedIds.includes(addition.id);
                  return (
                    <button
                      key={addition.id}
                      type="button"
                      onClick={() => toggleId(addition.id)}
                      className={cn(
                        "w-full flex items-center justify-between rounded-lg border p-3 text-sm transition-colors",
                        isSelected ? "border-primary bg-primary/10" : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                        <span>{addition.name}</span>
                      </div>
                      <span className="text-muted-foreground">+{formatPrice(addition.price)}</span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(item.id, selectedIds)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// EditOrderPage
// ============================================================================

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [editingItem, setEditingItem] = useState<OrderWithItems["items"][number] | null>(null);
  const [additionsDialogOpen, setAdditionsDialogOpen] = useState(false);
  const [isSavingAdditions, setIsSavingAdditions] = useState(false);
  const [additionsError, setAdditionsError] = useState<string | null>(null);

  const { updateOrder, updateOrderItemAdditions } = useOrders();
  const { additions: allAdditions, isLoading: additionsLoading } = useAdditions({ showAll: false });

  const form = useForm<EditOrderInput>({
    resolver: zodResolver(editOrderSchema),
  });

  useEffect(() => {
    fetchOrder(orderId)
      .then((data) => {
        setOrder(data as unknown as OrderWithItems);
        form.reset({
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail ?? "",
          deliveryAddress: data.deliveryAddress ?? "",
          notes: data.notes ?? "",
          adminNotes: data.adminNotes ?? "",
          paymentMethod: data.paymentMethod as EditOrderInput["paymentMethod"],
        });
      })
      .catch(() => setLoadError("No se pudo cargar la orden"))
      .finally(() => setIsLoading(false));
  }, [orderId, form]);

  const onSubmit = async (data: EditOrderInput) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const updated = await updateOrder(orderId, {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || undefined,
      deliveryAddress: data.deliveryAddress || undefined,
      notes: data.notes || undefined,
      adminNotes: data.adminNotes || undefined,
      paymentMethod: data.paymentMethod,
    });

    if (updated) {
      router.push("/admin/dashboard/orders");
    } else {
      setSubmitError("Error al actualizar la orden. Intenta de nuevo.");
    }

    setIsSubmitting(false);
  };

  const handleSaveAdditions = async (itemId: string, selectedIds: string[]) => {
    setIsSavingAdditions(true);
    setAdditionsError(null);

    const result = await updateOrderItemAdditions(
      orderId,
      itemId,
      selectedIds.map((id) => ({ additionId: id }))
    );

    if (result) {
      setOrder(result);
      setAdditionsDialogOpen(false);
    } else {
      setAdditionsError("Error al guardar las adiciones. Intenta de nuevo.");
    }

    setIsSavingAdditions(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-lg font-semibold">Orden no encontrada</h3>
        <p className="text-muted-foreground">
          La orden que buscas no existe o fue eliminada
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/dashboard/orders">Volver a órdenes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/dashboard/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Editar Orden</h2>
          <p className="text-muted-foreground">
            Modificando orden {order.orderNumber}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nombre *</Label>
                <Input
                  id="customerName"
                  placeholder="Nombre del cliente"
                  {...form.register("customerName")}
                />
                {form.formState.errors.customerName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.customerName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Teléfono *</Label>
                <Input
                  id="customerPhone"
                  placeholder="3001234567"
                  {...form.register("customerPhone")}
                />
                {form.formState.errors.customerPhone && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.customerPhone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="correo@ejemplo.com (opcional)"
                  {...form.register("customerEmail")}
                />
                {form.formState.errors.customerEmail && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.customerEmail.message}
                  </p>
                )}
              </div>

              {order.type === "delivery" && (
                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Dirección de entrega</Label>
                  <Input
                    id="deliveryAddress"
                    placeholder="Dirección completa"
                    {...form.register("deliveryAddress")}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notas del cliente</Label>
                <Textarea
                  id="notes"
                  placeholder="Instrucciones especiales del cliente..."
                  rows={3}
                  {...form.register("notes")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Método de pago *</Label>
                <Select
                  value={form.watch("paymentMethod")}
                  onValueChange={(value) =>
                    form.setValue(
                      "paymentMethod",
                      value as EditOrderInput["paymentMethod"]
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="card">Tarjeta</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                    <SelectItem value="nequi">Nequi</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.paymentMethod && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.paymentMethod.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminNotes">Notas internas</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Notas del personal (no visibles para el cliente)..."
                  rows={4}
                  {...form.register("adminNotes")}
                />
              </div>

              <div className="rounded-md bg-muted p-3 space-y-1">
                <p className="text-sm text-muted-foreground">
                  <strong>Orden:</strong> {order.orderNumber}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Tipo:</strong>{" "}
                  {order.type === "delivery" ? "Domicilio" : "Recoger en tienda"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Fecha:</strong>{" "}
                  {new Date(order.createdAt).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Productos:</strong> {order.items.length}
                </p>
              </div>

              {submitError && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {submitError}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="button" variant="outline" asChild className="flex-1">
                  <Link href="/admin/dashboard/orders">Cancelar</Link>
                </Button>
                <Button
                  type="submit"
                  className="flex-1 cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* Items del Pedido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Items del Pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {additionsError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {additionsError}
            </div>
          )}
          {order.items.map((item, index) => (
            <div key={item.id}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.productName}</p>
                    <span className="text-sm text-muted-foreground">
                      {item.quantity} × {formatPrice(item.unitPrice)}
                    </span>
                    <span className="text-sm font-bold text-primary ml-auto">
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                  {item.additions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {item.additions.map((a) => (
                        <Badge key={a.id} variant="secondary" className="text-xs">
                          {a.additionName} +{formatPrice(a.price)}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Sin adiciones</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingItem(item);
                    setAdditionsDialogOpen(true);
                  }}
                >
                  Editar adiciones
                </Button>
              </div>
            </div>
          ))}

          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.deliveryFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Domicilio</span>
              <span>{formatPrice(order.deliveryFee)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      <AdditionsEditDialog
        key={additionsDialogOpen ? editingItem?.id ?? "new" : "closed"}
        item={editingItem}
        allAdditions={allAdditions}
        additionsLoading={additionsLoading}
        open={additionsDialogOpen}
        onOpenChange={setAdditionsDialogOpen}
        onConfirm={handleSaveAdditions}
        isSaving={isSavingAdditions}
      />
    </div>
  );
}
