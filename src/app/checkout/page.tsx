"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore, useCartTotal } from "@/stores/use-cart-store";
import { formatPrice } from "@/data/menu";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const total = useCartTotal();
  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");

  const deliveryCost = orderType === "delivery" ? 5000 : 0;
  const finalTotal = total + deliveryCost;

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
                        <Input id="name" placeholder="Tu nombre" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" placeholder="300 123 4567" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input id="address" placeholder="Calle, número, barrio" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas adicionales</Label>
                      <Textarea
                        id="notes"
                        placeholder="Indicaciones para la entrega, referencias, etc."
                        rows={3}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="pickup" className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="pickup-name">Nombre completo</Label>
                        <Input id="pickup-name" placeholder="Tu nombre" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickup-phone">Teléfono</Label>
                        <Input id="pickup-phone" placeholder="300 123 4567" />
                      </div>
                    </div>

                    <Card className="bg-muted">
                      <CardContent className="p-4">
                        <h4 className="font-semibold">Dirección del local</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Barranquilla, Colombia
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
                <RadioGroup defaultValue="cash">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash">Efectivo al recibir</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="transfer" id="transfer" />
                    <Label htmlFor="transfer">Transferencia Nequi/Daviplata</Label>
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

                    <Button className="w-full" size="lg" disabled={items.length === 0}>
                      Confirmar Pedido
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
