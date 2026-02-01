"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddition, useAdditions } from "@/hooks/use-additions";
import { updateAdditionSchema, type UpdateAdditionInput } from "@/lib/validations/addition";

export default function EditAdditionPage() {
  const router = useRouter();
  const params = useParams();
  const additionId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addition, isLoading: additionLoading, error: additionError } = useAddition(additionId);
  const { updateAddition } = useAdditions();

  const form = useForm<UpdateAdditionInput>({
    resolver: zodResolver(updateAdditionSchema),
  });

  useEffect(() => {
    if (addition) {
      form.reset({
        name: addition.name,
        price: addition.price,
        image: addition.image || "",
        isActive: addition.isActive,
        displayOrder: addition.displayOrder,
      });
    }
  }, [addition, form]);

  const onSubmit = async (data: UpdateAdditionInput) => {
    setIsSubmitting(true);
    setError(null);

    const updated = await updateAddition(additionId, data);

    if (updated) {
      router.push("/admin/dashboard/additions");
    } else {
      setError("Error al actualizar la adición");
    }

    setIsSubmitting(false);
  };

  if (additionLoading) {
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
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (additionError || !addition) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-lg font-semibold">Adición no encontrada</h3>
        <p className="text-muted-foreground">
          La adición que buscas no existe o fue eliminada
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/dashboard/additions">Volver a adiciones</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/dashboard/additions">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Editar Adición</h2>
          <p className="text-muted-foreground">Modifica los detalles de {addition.name}</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Adición</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Queso Extra"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Precio (COP) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="2000"
                  {...form.register("price", { valueAsNumber: true })}
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL de Imagen (opcional)</Label>
                <Input
                  id="image"
                  placeholder="https://images.unsplash.com/..."
                  {...form.register("image")}
                />
                {form.formState.errors.image && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.image.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">Orden de visualización</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  placeholder="0"
                  {...form.register("displayOrder", { valueAsNumber: true })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Adición Activa</Label>
                  <p className="text-sm text-muted-foreground">
                    La adición estará disponible para seleccionar
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) => form.setValue("isActive", checked)}
                />
              </div>

              {form.watch("image") && (
                <div className="space-y-2">
                  <Label>Vista previa</Label>
                  <div className="overflow-hidden rounded-lg border">
                    <img
                      src={form.watch("image")}
                      alt="Vista previa"
                      className="h-48 w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400x300?text=Imagen+no+disponible";
                      }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="button" variant="outline" asChild className="flex-1">
                  <Link href="/admin/dashboard/additions">Cancelar</Link>
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
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
