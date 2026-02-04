"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  MapPin,
  Store,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Trash2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore, useCartTotal, formatPrice } from "@/stores/use-cart-store";
import { useCustomerStore, useSelectedAddress } from "@/stores/use-customer-store";
import { useBusinessConfig, useBusinessHours } from "@/hooks/use-business";
import { useCreateOrder } from "@/hooks/use-orders";
import { useCustomerLookup } from "@/hooks/use-customer-lookup";
import { type DayOfWeek } from "@/types/models";

const customerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  phone: z
    .string()
    .min(10, "Número de teléfono inválido")
    .regex(/^[0-9+\s-]+$/, "Formato inválido"),
});

const newAddressSchema = z.object({
  address: z.string().min(5, "La dirección es requerida"),
});

type CustomerFormData = z.infer<typeof customerSchema>;
type NewAddressData = z.infer<typeof newAddressSchema>;

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = useCartTotal();

  const { customer, addresses, selectedAddressId, selectAddress } = useCustomerStore();
  const selectedAddress = useSelectedAddress();

  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "nequi" | "daviplata" | "transfer">("cash");
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string } | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [notes, setNotes] = useState("");
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

  const { config, isLoading: configLoading } = useBusinessConfig();
  const { hours } = useBusinessHours();
  const { createOrder, isLoading: orderLoading, error: orderError } = useCreateOrder();
  const { isLooking, lookupOrCreate, createAddress, deleteAddress, clearCustomer } = useCustomerLookup();

  const customerForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", phone: "" },
  });

  const addressForm = useForm<NewAddressData>({
    resolver: zodResolver(newAddressSchema),
    defaultValues: { address: "" },
  });

  // Restore customer data from store on mount
  useEffect(() => {
    if (customer) {
      customerForm.setValue("name", customer.name);
      customerForm.setValue("phone", customer.phone);
    }
  }, []);

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    const h = parseInt(hour, 10);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minute} ${period}`;
  };

  const getDayOfWeek = (): DayOfWeek => {
    const days: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[new Date().getDay()];
  };

  const getTodayHours = () => {
    if (!hours || hours.length === 0) return null;
    const today = getDayOfWeek();
    return hours.find((h) => h.dayOfWeek === today);
  };

  const isBusinessOpen = () => {
    const todayHours = getTodayHours();
    if (!todayHours || !todayHours.isOpen) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMinute] = (todayHours.openTime || "10:00").split(":").map(Number);
    const [closeHour, closeMinute] = (todayHours.closeTime || "22:00").split(":").map(Number);
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;

    return currentTime >= openTime && currentTime < closeTime;
  };

  const getBusinessHoursText = () => {
    const todayHours = getTodayHours();
    if (!todayHours || !todayHours.isOpen) return "Cerrado hoy";
    return `${formatTime(todayHours.openTime || "10:00")} - ${formatTime(todayHours.closeTime || "22:00")}`;
  };

  const getBusinessStatusMessage = () => {
    const todayHours = getTodayHours();
    if (!todayHours || !todayHours.isOpen) {
      return "El negocio está cerrado hoy. Por favor, vuelve otro día.";
    }
    if (!isBusinessOpen()) {
      const openTime = formatTime(todayHours.openTime || "10:00");
      const closeTime = formatTime(todayHours.closeTime || "22:00");
      const now = new Date();
      const currentHour = now.getHours();
      const [openHour] = (todayHours.openTime || "10:00").split(":").map(Number);

      if (currentHour < openHour) {
        return `Abrimos a las ${openTime}. Horario de hoy: ${openTime} - ${closeTime}`;
      } else {
        return `Ya cerramos por hoy. Horario: ${openTime} - ${closeTime}`;
      }
    }
    return null;
  };

  const businessOpen = isBusinessOpen();
  const businessStatusMessage = getBusinessStatusMessage();
  const deliveryCost = orderType === "delivery" ? (config?.deliveryFee || 0) : 0;
  const finalTotal = total + deliveryCost;

  // Handle customer form submission
  const handleCustomerSubmit = useCallback(
    async (data: CustomerFormData) => {
      const normalizedPhone = data.phone.replace(/[\s-]/g, "");
      await lookupOrCreate(normalizedPhone, data.name);
    },
    [lookupOrCreate]
  );

  // Handle new address submission
  const handleAddressSubmit = useCallback(
    async (data: NewAddressData) => {
      if (!customer) return;

      const newAddress = await createAddress(customer.phone, {
        address: data.address,
        isDefault: addresses.length === 0,
      });

      if (newAddress) {
        setShowNewAddressForm(false);
        addressForm.reset();
      }
    },
    [createAddress, customer, addresses.length, addressForm]
  );

  // Handle address deletion
  const handleDeleteAddress = useCallback(
    async (addressId: string) => {
      if (!customer) return;

      setDeletingAddressId(addressId);
      await deleteAddress(customer.phone, addressId);
      setDeletingAddressId(null);
    },
    [deleteAddress, customer]
  );

  // Change customer (clear and reset)
  const handleChangeCustomer = useCallback(() => {
    clearCustomer();
    customerForm.reset();
    setShowNewAddressForm(false);
  }, [clearCustomer, customerForm]);

  const buildWhatsAppMessage = (orderNumber: string) => {
    const lines: string[] = [
      `*NUEVO PEDIDO - ${orderNumber}*`,
      "",
      `*Cliente:* ${customer?.name}`,
      `*Teléfono:* ${customer?.phone}`,
    ];

    lines.push("");
    lines.push(`*Tipo:* ${orderType === "delivery" ? "Domicilio" : "Recoger en local"}`);

    if (orderType === "delivery" && selectedAddress) {
      lines.push(`*Dirección:* ${selectedAddress.address}`);
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

    if (notes) {
      lines.push("");
      lines.push(`*Notas:* ${notes}`);
    }

    lines.push("");
    lines.push("¡Gracias por tu pedido!");

    return lines.join("\n");
  };

  const openWhatsApp = (message: string) => {
    const whatsappNumber = config?.whatsappNumber || "573014483308";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleSubmit = async () => {
    if (!customer) return;

    const orderItems = items.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      additions: item.additions.map((a) => ({ additionId: a.id })),
    }));

    const order = await createOrder({
      customerName: customer.name,
      customerPhone: customer.phone,
      type: orderType,
      deliveryAddress: orderType === "delivery" ? selectedAddress?.address : undefined,
      addressId: orderType === "delivery" ? selectedAddressId || undefined : undefined,
      notes: notes || undefined,
      paymentMethod,
      items: orderItems,
    });

    if (order) {
      const whatsappMessage = buildWhatsAppMessage(order.orderNumber);
      openWhatsApp(whatsappMessage);
      setOrderSuccess({ orderNumber: order.orderNumber });
      clearCart();
      clearCustomer();
    }
  };

  // Check if can submit order
  const canSubmitOrder = () => {
    if (!customer) return false;
    if (orderType === "delivery" && !selectedAddressId) return false;
    if (showNewAddressForm) return false;
    return true;
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
              <p className="mt-2 text-muted-foreground">Tu pedido ha sido recibido exitosamente</p>
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

      {!businessOpen && businessStatusMessage && (
        <div className="bg-amber-500/10 border-b border-amber-500/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-amber-600 dark:text-amber-400">Estamos cerrados</p>
                <p className="text-sm text-amber-600/80 dark:text-amber-400/80">{businessStatusMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Tus Datos</CardTitle>
              </CardHeader>
              <CardContent>
                {!customer ? (
                  <form onSubmit={customerForm.handleSubmit(handleCustomerSubmit)} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre completo *</Label>
                        <Input
                          id="name"
                          placeholder="Tu nombre"
                          {...customerForm.register("name")}
                        />
                        {customerForm.formState.errors.name && (
                          <p className="text-sm text-destructive">
                            {customerForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono *</Label>
                        <Input
                          id="phone"
                          placeholder="3001234567"
                          {...customerForm.register("phone")}
                        />
                        {customerForm.formState.errors.phone && (
                          <p className="text-sm text-destructive">
                            {customerForm.formState.errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button type="submit" className="w-full cursor-pointer" disabled={isLooking}>
                      {isLooking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        "Continuar"
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleChangeCustomer} className="cursor-pointer">
                      Cambiar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Type & Address */}
            {customer && (
              <Card>
                <CardHeader>
                  <CardTitle>Tipo de Entrega</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs
                    value={orderType}
                    onValueChange={(v) => {
                      setOrderType(v as "delivery" | "pickup");
                      if (v === "pickup") {
                        setShowNewAddressForm(false);
                      }
                    }}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="delivery" className="gap-2 cursor-pointer">
                        <MapPin className="h-4 w-4" />
                        Domicilio
                      </TabsTrigger>
                      <TabsTrigger value="pickup" className="gap-2 cursor-pointer">
                        <Store className="h-4 w-4" />
                        Recoger
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="delivery" className="mt-6 space-y-4">
                      {/* Address Selection */}
                      {addresses.length > 0 && !showNewAddressForm && (
                        <div className="space-y-3">
                          <Label>Selecciona una dirección</Label>
                          <RadioGroup value={selectedAddressId || ""} onValueChange={selectAddress}>
                            {addresses.map((addr) => (
                              <div
                                key={addr.id}
                                className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-colors ${
                                  selectedAddressId === addr.id
                                    ? "border-primary bg-primary/5"
                                    : "hover:bg-muted/50"
                                }`}
                                onClick={() => selectAddress(addr.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <RadioGroupItem value={addr.id} id={addr.id} />
                                  <div>
                                    <p className="font-medium">{addr.address}</p>
                                    {addr.isDefault && (
                                      <span className="text-xs text-muted-foreground">Principal</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {selectedAddressId === addr.id && (
                                    <Check className="h-5 w-5 text-primary" />
                                  )}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteAddress(addr.id);
                                    }}
                                    disabled={deletingAddressId === addr.id}
                                  >
                                    {deletingAddressId === addr.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </RadioGroup>

                          <Button
                            type="button"
                            variant="outline"
                            className="w-full cursor-pointer"
                            onClick={() => setShowNewAddressForm(true)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar nueva dirección
                          </Button>
                        </div>
                      )}

                      {/* New Address Form */}
                      {(addresses.length === 0 || showNewAddressForm) && (
                        <form onSubmit={addressForm.handleSubmit(handleAddressSubmit)} className="space-y-4">
                          {addresses.length > 0 && (
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-medium">Nueva dirección</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowNewAddressForm(false)}
                                className="cursor-pointer"
                              >
                                Cancelar
                              </Button>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="address">Dirección completa *</Label>
                            <Input
                              id="address"
                              placeholder="Calle 50 #30-20, Barrio El Prado"
                              {...addressForm.register("address")}
                            />
                            {addressForm.formState.errors.address && (
                              <p className="text-sm text-destructive">
                                {addressForm.formState.errors.address.message}
                              </p>
                            )}
                          </div>

                          <Button type="submit" className="w-full cursor-pointer" disabled={isLooking}>
                            {isLooking ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                              </>
                            ) : (
                              "Guardar dirección"
                            )}
                          </Button>
                        </form>
                      )}
                    </TabsContent>

                    <TabsContent value="pickup" className="mt-6">
                      <Card className="bg-muted">
                        <CardContent className="p-4">
                          <h4 className="font-semibold">Dirección del local</h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {config?.address ? `${config.address}, ${config.city}` : "Barranquilla, Colombia"}
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Horario hoy: {getBusinessHoursText()}
                          </p>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}

            {/* Notes & Payment */}
            {customer && canSubmitOrder() && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Detalles del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Ej: Sin salsas, sin ripio, extra queso..."
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Instrucciones especiales para tu pedido
                      </p>
                    </div>
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
                        <Label htmlFor="cash" className="cursor-pointer">
                          Efectivo al recibir
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nequi" id="nequi" />
                        <Label htmlFor="nequi" className="cursor-pointer">
                          Nequi
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daviplata" id="daviplata" />
                        <Label htmlFor="daviplata" className="cursor-pointer">
                          Daviplata
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="transfer" id="transfer" />
                        <Label htmlFor="transfer" className="cursor-pointer">
                          Transferencia bancaria
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.length === 0 ? (
                  <p className="text-center text-muted-foreground">No hay productos en el carrito</p>
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
                          <span>{deliveryCost > 0 ? formatPrice(deliveryCost) : "Gratis"}</span>
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

                    {!businessOpen && businessStatusMessage && (
                      <div className="rounded-md bg-amber-500/10 border border-amber-500/20 p-3 text-sm">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-amber-600 dark:text-amber-400">Fuera de horario</p>
                            <p className="text-amber-600/80 dark:text-amber-400/80 mt-1">
                              {businessStatusMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full cursor-pointer"
                      size="lg"
                      disabled={
                        items.length === 0 ||
                        orderLoading ||
                        configLoading ||
                        !businessOpen ||
                        !canSubmitOrder()
                      }
                      onClick={handleSubmit}
                    >
                      {orderLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Procesando...
                        </>
                      ) : !businessOpen ? (
                        <>
                          <Clock className="mr-2 h-4 w-4" />
                          Cerrado
                        </>
                      ) : !customer ? (
                        "Ingresa tus datos"
                      ) : orderType === "delivery" && !selectedAddressId ? (
                        "Selecciona una dirección"
                      ) : showNewAddressForm ? (
                        "Guarda la dirección"
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
