"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrders } from "@/hooks/use-orders";
import { fetchOrder } from "@/lib/fetch-functions/orders";
import type { OrderWithItems } from "@/types/models";

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

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { updateOrder } = useOrders();

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
    </div>
  );
}
