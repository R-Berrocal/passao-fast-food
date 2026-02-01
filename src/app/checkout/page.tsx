"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, MapPin, Store, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore, useCartTotal, formatPrice } from "@/stores/use-cart-store";
import { useBusinessConfig } from "@/hooks/use-business";
import { useCreateOrder } from "@/hooks/use-orders";

const emailValidation = z
  .string()
  .refine(
    (val) => val === "" || z.string().email().safeParse(val).success,
    { message: "Correo electrónico inválido" }
  );

const deliverySchema = z.object({
  customerName: z.string().min(2, "El nombre es requerido"),
  customerPhone: z.string().min(10, "Número de teléfono inválido"),
  customerEmail: emailValidation,
  deliveryAddress: z.string().min(5, "La dirección es requerida"),
  notes: z.string().optional(),
});

const pickupSchema = z.object({
  customerName: z.string().min(2, "El nombre es requerido"),
  customerPhone: z.string().min(10, "Número de teléfono inválido"),
  customerEmail: emailValidation,
  notes: z.string().optional(),
});

type DeliveryFormData = z.infer<typeof deliverySchema>;
type PickupFormData = z.infer<typeof pickupSchema>;

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = useCartTotal();
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "nequi" | "daviplata" | "transfer">("cash");
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string } | null>(null);

  const { config, isLoading: configLoading } = useBusinessConfig();
  const { createOrder, isLoading: orderLoading, error: orderError } = useCreateOrder();

  const deliveryForm = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      deliveryAddress: "",
      notes: "",
    },
  });

  const pickupForm = useForm<PickupFormData>({
    resolver: zodResolver(pickupSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      notes: "",
    },
  });

  const deliveryCost = orderType === "delivery" ? (config?.deliveryFee || 5000) : 0;
  const finalTotal = total + deliveryCost;

  const buildWhatsAppMessage = (orderNumber: string, formData: DeliveryFormData | PickupFormData) => {
    const lines: string[] = [
      `*NUEVO PEDIDO - ${orderNumber}*`,
      "",
      `*Cliente:* ${formData.customerName}`,
      `*Teléfono:* ${formData.customerPhone}`,
    ];

    if (formData.customerEmail) {
      lines.push(`*Email:* ${formData.customerEmail}`);
    }

    lines.push("");
    lines.push(`*Tipo:* ${orderType === "delivery" ? "Domicilio" : "Recoger en local"}`);

    if (orderType === "delivery" && "deliveryAddress" in formData) {
      lines.push(`*Dirección:* ${formData.deliveryAddress}`);
    }

    lines.push("");
    lines.push("*PRODUCTOS:*");
    lines.push("─".repeat(20));

    items.forEach((item) => {
      lines.push(`• ${item.quantity}x ${item.name} - ${formatPrice(item.totalPrice * item.quantity)}`);
      if (item.additions.length > 0) {
        lines.push(`  + ${item.additions.map((a) => a.name).join(", ")}`);
      }
    });

    lines.push("─".repeat(20));
    lines.push(`*Subtotal:* ${formatPrice(total)}`);

    if (orderType === "delivery") {
      lines.push(`*Domicilio:* ${formatPrice(deliveryCost)}`);
    }

    lines.push(`*TOTAL: ${formatPrice(finalTotal)}*`);
    lines.push("");

    const paymentLabels: Record<string, string> = {
      cash: "Efectivo al recibir",
      nequi: "Nequi",
      daviplata: "Daviplata",
      transfer: "Transferencia bancaria",
    };
    lines.push(`*Método de pago:* ${paymentLabels[paymentMethod]}`);

    if (formData.notes) {
      lines.push("");
      lines.push(`📝 *Notas:* ${formData.notes}`);
    }

    lines.push("");
    lines.push("¡Gracias por tu pedido!");

    return lines.join("\n");
  };

  const openWhatsApp = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/573014483308?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleSubmit = async () => {
    const formData = orderType === "delivery"
      ? deliveryForm.getValues()
      : pickupForm.getValues();

    const isValid = orderType === "delivery"
      ? await deliveryForm.trigger()
      : await pickupForm.trigger();

    if (!isValid) return;

    const orderItems = items.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      additions: item.additions.map((a) => ({ additionId: a.id })),
    }));

    const order = await createOrder({
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail || undefined,
      type: orderType,
      deliveryAddress: orderType === "delivery" ? (formData as DeliveryFormData).deliveryAddress : undefined,
      notes: formData.notes,
      paymentMethod,
      items: orderItems,
    });

    if (order) {
      const whatsappMessage = buildWhatsAppMessage(order.orderNumber, formData);
      openWhatsApp(whatsappMessage);
      setOrderSuccess({ orderNumber: order.orderNumber });
      clearCart();
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto flex h-16 items-center px-4">
            <h1 className="text-xl font-bold">Pedido Confirmado</h1>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          <Card className="mx-auto max-w-md text-center">
            <CardContent className="pt-6">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h2 className="mt-4 text-2xl font-bold">Pedido Realizado</h2>
              <p className="mt-2 text-muted-foreground">
                Tu pedido ha sido recibido exitosamente
              </p>
              <div className="mt-4 rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Número de orden</p>
                <p className="text-2xl font-bold text-primary">{orderSuccess.orderNumber}</p>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {orderType === "delivery"
                  ? "Recibirás tu pedido en la dirección indicada"
                  : "Puedes recoger tu pedido en nuestro local"}
              </p>
              <Button asChild className="mt-6 w-full">
                <Link href="/">Volver al Menú</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="ml-4 text-xl font-bold">Finalizar Pedido</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={orderType}
                  onValueChange={(v) => setOrderType(v as "delivery" | "pickup")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="delivery" className="gap-2">
                      <MapPin className="h-4 w-4" />
                      Domicilio
                    </TabsTrigger>
                    <TabsTrigger value="pickup" className="gap-2">
                      <Store className="h-4 w-4" />
                      Recoger
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="delivery" className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo</Label>
                        <Input
                          id="name"
                          placeholder="Tu nombre"
                          {...deliveryForm.register("customerName")}
                        />
                        {deliveryForm.formState.errors.customerName && (
                          <p className="text-sm text-destructive">
                            {deliveryForm.formState.errors.customerName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          placeholder="3001234567"
                          {...deliveryForm.register("customerPhone")}
                        />
                        {deliveryForm.formState.errors.customerPhone && (
                          <p className="text-sm text-destructive">
                            {deliveryForm.formState.errors.customerPhone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico (opcional)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        {...deliveryForm.register("customerEmail")}
                      />
                      {deliveryForm.formState.errors.customerEmail && (
                        <p className="text-sm text-destructive">
                          {deliveryForm.formState.errors.customerEmail.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        placeholder="Calle, número, barrio"
                        {...deliveryForm.register("deliveryAddress")}
                      />
                      {deliveryForm.formState.errors.deliveryAddress && (
                        <p className="text-sm text-destructive">
                          {deliveryForm.formState.errors.deliveryAddress.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Indicaciones para la entrega, referencias, etc."
                        rows={3}
                        {...deliveryForm.register("notes")}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="pickup" className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="pickup-name">Nombre completo</Label>
                        <Input
                          id="pickup-name"
                          placeholder="Tu nombre"
                          {...pickupForm.register("customerName")}
                        />
                        {pickupForm.formState.errors.customerName && (
                          <p className="text-sm text-destructive">
                            {pickupForm.formState.errors.customerName.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickup-phone">Teléfono</Label>
                        <Input
                          id="pickup-phone"
                          placeholder="3001234567"
                          {...pickupForm.register("customerPhone")}
                        />
                        {pickupForm.formState.errors.customerPhone && (
                          <p className="text-sm text-destructive">
                            {pickupForm.formState.errors.customerPhone.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pickup-email">Correo electrónico (opcional)</Label>
                      <Input
                        id="pickup-email"
                        type="email"
                        placeholder="tu@email.com"
                        {...pickupForm.register("customerEmail")}
                      />
                      {pickupForm.formState.errors.customerEmail && (
                        <p className="text-sm text-destructive">
                          {pickupForm.formState.errors.customerEmail.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pickup-notes">Notas adicionales (opcional)</Label>
                      <Textarea
                        id="pickup-notes"
                        placeholder="Indicaciones especiales"
                        rows={3}
                        {...pickupForm.register("notes")}
                      />
                    </div>

                    <Card className="bg-muted">
                      <CardContent className="p-4">
                        <h4 className="font-semibold">Dirección del local</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {config?.address || "Barranquilla, Colombia"}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Horario: 5:00 PM - 11:00 PM
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Método de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as typeof paymentMethod)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash">Efectivo al recibir</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nequi" id="nequi" />
                    <Label htmlFor="nequi">Nequi</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daviplata" id="daviplata" />
                    <Label htmlFor="daviplata">Daviplata</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer">Transferencia bancaria</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    No hay productos en el carrito
                  </p>
                ) : (
                  <>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.cartItemId} className="text-sm">
                          <div className="flex justify-between">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span>{formatPrice(item.totalPrice * item.quantity)}</span>
                          </div>
                          {item.additions.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              + {item.additions.map((a) => a.name).join(", ")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                      {orderType === "delivery" && (
                        <div className="flex justify-between">
                          <span>Domicilio</span>
                          <span>{formatPrice(deliveryCost)}</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(finalTotal)}</span>
                    </div>

                    {orderError && (
                      <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {orderError}
                      </div>
                    )}

                    <Button
                      className="w-full cursor-pointer"
                      size="lg"
                      disabled={items.length === 0 || orderLoading || configLoading}
                      onClick={handleSubmit}
                    >
                      {orderLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        "Confirmar Pedido"
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
