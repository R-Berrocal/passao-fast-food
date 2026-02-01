"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBusinessConfig, useBusinessHours } from "@/hooks/use-business";
import { businessConfigSchema, type BusinessConfigInput } from "@/lib/validations/business";
import type { BusinessHours, DayOfWeek } from "@/types/models";
import { DAY_OF_WEEK_CONFIG } from "@/types/models";

const DAYS_ORDER: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function SettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { config, isLoading: configLoading, updateConfig } = useBusinessConfig();
  const { hours, isLoading: hoursLoading, updateHours } = useBusinessHours();

  const [localHours, setLocalHours] = useState<BusinessHours[]>([]);

  const form = useForm<BusinessConfigInput>({
    resolver: zodResolver(businessConfigSchema),
  });

  useEffect(() => {
    if (config) {
      form.reset({
        name: config.name,
        phone: config.phone,
        email: config.email,
        address: config.address,
        city: config.city,
        logoUrl: config.logoUrl || "",
        slogan: config.slogan,
        whatsappNumber: config.whatsappNumber || "",
        instagramUrl: config.instagramUrl || "",
        facebookUrl: config.facebookUrl || "",
        heroStatArepas: config.heroStatArepas,
        heroStatPerros: config.heroStatPerros,
        heroStatPatacones: config.heroStatPatacones,
        heroStatTotal: config.heroStatTotal,
        deliveryFee: config.deliveryFee,
        minOrderAmount: config.minOrderAmount,
        nequiNumber: config.nequiNumber || "",
        daviplataNumber: config.daviplataNumber || "",
        bankName: config.bankName || "",
        bankAccountNumber: config.bankAccountNumber || "",
        bankAccountType: config.bankAccountType || "",
        bankAccountHolder: config.bankAccountHolder || "",
      });
    }
  }, [config, form]);

  useEffect(() => {
    if (hours.length > 0) {
      setLocalHours(hours);
    }
  }, [hours]);

  const onSubmit = async (data: BusinessConfigInput) => {
    setIsSubmitting(true);
    setSuccessMessage(null);

    const result = await updateConfig(data);

    if (result) {
      setSuccessMessage("Configuración guardada correctamente");
      setTimeout(() => setSuccessMessage(null), 3000);
    }

    setIsSubmitting(false);
  };

  const handleHoursChange = (dayOfWeek: DayOfWeek, field: keyof BusinessHours, value: string | boolean) => {
    setLocalHours((prev) =>
      prev.map((h) =>
        h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
      )
    );
  };

  const saveHours = async () => {
    setIsSavingHours(true);
    setSuccessMessage(null);

    const result = await updateHours(localHours);

    if (result) {
      setSuccessMessage("Horarios guardados correctamente");
      setTimeout(() => setSuccessMessage(null), 3000);
    }

    setIsSavingHours(false);
  };

  if (configLoading || hoursLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configuración del Sitio</h2>
        <p className="text-muted-foreground">
          Administra la información de tu negocio
        </p>
      </div>

      {successMessage && (
        <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-500">
          {successMessage}
        </div>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="general" className="cursor-pointer">General</TabsTrigger>
          <TabsTrigger value="contact" className="cursor-pointer">Contacto</TabsTrigger>
          <TabsTrigger value="hours" className="cursor-pointer">Horarios</TabsTrigger>
          <TabsTrigger value="hero" className="cursor-pointer">Hero</TabsTrigger>
          <TabsTrigger value="payments" className="cursor-pointer">Pagos</TabsTrigger>
        </TabsList>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
                <CardDescription>
                  Datos básicos de tu negocio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Negocio</Label>
                    <Input
                      id="name"
                      placeholder="PASSAO"
                      {...form.register("name")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      placeholder="Barranquilla"
                      {...form.register("city")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    placeholder="Calle 45 #23-12"
                    {...form.register("address")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slogan">Slogan</Label>
                  <Input
                    id="slogan"
                    placeholder="Las mejores arepas, perros y patacones de la ciudad."
                    {...form.register("slogan")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">URL del Logo (opcional)</Label>
                  <Input
                    id="logoUrl"
                    placeholder="https://..."
                    {...form.register("logoUrl")}
                  />
                  {form.watch("logoUrl") && (
                    <div className="mt-2">
                      <img
                        src={form.watch("logoUrl")}
                        alt="Logo preview"
                        className="h-16 w-16 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4 cursor-pointer" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contacto</CardTitle>
                <CardDescription>
                  Información de contacto y redes sociales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      placeholder="+57 300 123 4567"
                      {...form.register("phone")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumber">WhatsApp (sin +)</Label>
                    <Input
                      id="whatsappNumber"
                      placeholder="573001234567"
                      {...form.register("whatsappNumber")}
                    />
                    <p className="text-xs text-muted-foreground">
                      Número completo con código de país, sin espacios ni símbolos
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contacto@passao.com"
                    {...form.register("email")}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="instagramUrl">Instagram URL</Label>
                    <Input
                      id="instagramUrl"
                      placeholder="https://instagram.com/passao"
                      {...form.register("instagramUrl")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebookUrl">Facebook URL</Label>
                    <Input
                      id="facebookUrl"
                      placeholder="https://facebook.com/passao"
                      {...form.register("facebookUrl")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Hero Stats Tab */}
          <TabsContent value="hero" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas del Hero</CardTitle>
                <CardDescription>
                  Números que se muestran en la sección principal de la página
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="heroStatArepas">Tipos de Arepas</Label>
                    <Input
                      id="heroStatArepas"
                      type="number"
                      {...form.register("heroStatArepas", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroStatPerros">Tipos de Perros</Label>
                    <Input
                      id="heroStatPerros"
                      type="number"
                      {...form.register("heroStatPerros", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroStatPatacones">Tipos de Patacones</Label>
                    <Input
                      id="heroStatPatacones"
                      type="number"
                      {...form.register("heroStatPatacones", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroStatTotal">Total Productos</Label>
                    <Input
                      id="heroStatTotal"
                      type="number"
                      {...form.register("heroStatTotal", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración de Delivery</CardTitle>
                <CardDescription>
                  Costos y mínimos para órdenes a domicilio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryFee">Costo de Domicilio (COP)</Label>
                    <Input
                      id="deliveryFee"
                      type="number"
                      placeholder="5000"
                      {...form.register("deliveryFee", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minOrderAmount">Pedido Mínimo (COP)</Label>
                    <Input
                      id="minOrderAmount"
                      type="number"
                      placeholder="15000"
                      {...form.register("minOrderAmount", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nequi / Daviplata</CardTitle>
                <CardDescription>
                  Números para pagos móviles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nequiNumber">Número Nequi</Label>
                    <Input
                      id="nequiNumber"
                      placeholder="3001234567"
                      {...form.register("nequiNumber")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="daviplataNumber">Número Daviplata</Label>
                    <Input
                      id="daviplataNumber"
                      placeholder="3001234567"
                      {...form.register("daviplataNumber")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transferencia Bancaria</CardTitle>
                <CardDescription>
                  Datos de cuenta bancaria
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Banco</Label>
                    <Input
                      id="bankName"
                      placeholder="Bancolombia"
                      {...form.register("bankName")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountType">Tipo de Cuenta</Label>
                    <Input
                      id="bankAccountType"
                      placeholder="Ahorros"
                      {...form.register("bankAccountType")}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber">Número de Cuenta</Label>
                    <Input
                      id="bankAccountNumber"
                      placeholder="123-456789-00"
                      {...form.register("bankAccountNumber")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccountHolder">Titular</Label>
                    <Input
                      id="bankAccountHolder"
                      placeholder="PASSAO SAS"
                      {...form.register("bankAccountHolder")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </form>

        {/* Hours Tab - Outside of form since it has its own save */}
        <TabsContent value="hours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Horario de Atención</CardTitle>
              <CardDescription>
                Configura los días y horarios de apertura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DAYS_ORDER.map((day) => {
                const dayHours = localHours.find((h) => h.dayOfWeek === day);
                if (!dayHours) return null;

                return (
                  <div
                    key={day}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={dayHours.isOpen}
                        onCheckedChange={(checked) =>
                          handleHoursChange(day, "isOpen", checked)
                        }
                      />
                      <span className="w-24 font-medium">
                        {DAY_OF_WEEK_CONFIG[day].text}
                      </span>
                    </div>

                    {dayHours.isOpen && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={dayHours.openTime || "10:00"}
                          onChange={(e) =>
                            handleHoursChange(day, "openTime", e.target.value)
                          }
                          className="w-32"
                        />
                        <span className="text-muted-foreground">a</span>
                        <Input
                          type="time"
                          value={dayHours.closeTime || "22:00"}
                          onChange={(e) =>
                            handleHoursChange(day, "closeTime", e.target.value)
                          }
                          className="w-32"
                        />
                      </div>
                    )}

                    {!dayHours.isOpen && (
                      <span className="text-muted-foreground">Cerrado</span>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveHours} disabled={isSavingHours} className="cursor-pointer">
              {isSavingHours ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Horarios
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
