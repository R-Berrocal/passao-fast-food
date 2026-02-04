"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/use-categories";
import { useProducts } from "@/hooks/use-products";
import { createProductSchema, type CreateProductInput } from "@/lib/validations/product";

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { categories, isLoading: categoriesLoading } = useCategories();
  const { createProduct } = useProducts();

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      image: "",
      categoryId: "",
      isActive: true,
      isAvailable: true,
      displayOrder: 0,
    },
  });

  const onSubmit = async (data: CreateProductInput) => {
    setIsSubmitting(true);
    setError(null);

    const product = await createProduct(data);

    if (product) {
      router.push("/admin/dashboard/products");
    } else {
      setError("Error al crear el producto");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/dashboard/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Nuevo Producto</h2>
          <p className="text-muted-foreground">Crea un nuevo producto para el menú</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del Producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Arepa Especial"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el producto..."
                  rows={3}
                  {...form.register("description")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio (COP) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="15000"
                    {...form.register("price", { valueAsNumber: true })}
                  />
                  {form.formState.errors.price && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.price.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={form.watch("categoryId")}
                    onValueChange={(value) => form.setValue("categoryId", value)}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categoryId && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.categoryId.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Imagen del Producto *</Label>
                <ImageUpload
                  value={form.watch("image")}
                  onChange={(url) => form.setValue("image", url, { shouldValidate: true })}
                  disabled={isSubmitting}
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
                  <Label htmlFor="isActive">Producto Activo</Label>
                  <p className="text-sm text-muted-foreground">
                    El producto aparecerá en el menú
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) => form.setValue("isActive", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isAvailable">Disponible</Label>
                  <p className="text-sm text-muted-foreground">
                    El producto está disponible para ordenar
                  </p>
                </div>
                <Switch
                  id="isAvailable"
                  checked={form.watch("isAvailable")}
                  onCheckedChange={(checked) => form.setValue("isAvailable", checked)}
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="button" variant="outline" asChild className="flex-1">
                  <Link href="/admin/dashboard/products">Cancelar</Link>
                </Button>
                <Button type="submit" className="flex-1 cursor-pointer" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Producto"
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
