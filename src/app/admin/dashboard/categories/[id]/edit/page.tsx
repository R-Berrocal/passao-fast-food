"use client";

import { useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategory, useCategories } from "@/hooks/use-categories";
import {
  updateCategorySchema,
  type UpdateCategoryInput,
} from "@/lib/validations/product";

const ImageUpload = dynamic(
  () => import("@/components/ui/image-upload").then((m) => m.ImageUpload),
  { ssr: false, loading: () => <Skeleton className="h-40 w-full rounded-lg" /> }
);

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function EditCategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const { category, isLoading, error } = useCategory(categoryId);

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
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-lg font-semibold">Categoría no encontrada</h3>
        <p className="text-muted-foreground">
          La categoría que buscas no existe o fue eliminada
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/dashboard/categories">Volver a categorías</Link>
        </Button>
      </div>
    );
  }

  return <EditCategoryForm category={category} />;
}

function EditCategoryForm({
  category,
}: {
  category: NonNullable<ReturnType<typeof useCategory>["category"]>;
}) {
  const router = useRouter();
  const { updateCategory } = useCategories();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slugManuallyEdited = useRef(false);

  const form = useForm<UpdateCategoryInput>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      image: category.image ?? "",
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      allowsAdditions: category.allowsAdditions,
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("name", e.target.value);
    if (!slugManuallyEdited.current) {
      form.setValue("slug", generateSlug(e.target.value));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    slugManuallyEdited.current = true;
    form.setValue("slug", e.target.value);
  };

  const onSubmit = async (data: UpdateCategoryInput) => {
    setIsSubmitting(true);
    setError(null);

    const updated = await updateCategory(category.id, data);

    if (updated) {
      router.push("/admin/dashboard/categories");
    } else {
      setError("Error al actualizar la categoría. Es posible que el slug ya exista.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/dashboard/categories">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Editar Categoría</h2>
          <p className="text-muted-foreground">
            Modifica los detalles de {category.name}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Categoría</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Bebidas"
                  value={form.watch("name")}
                  onChange={handleNameChange}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug *{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    (identificador único en la URL)
                  </span>
                </Label>
                <Input
                  id="slug"
                  placeholder="Ej: bebidas"
                  value={form.watch("slug")}
                  onChange={handleSlugChange}
                />
                {form.formState.errors.slug && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.slug.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe la categoría..."
                  rows={3}
                  {...form.register("description")}
                />
              </div>

              <div className="space-y-2">
                <Label>Imagen (opcional)</Label>
                <ImageUpload
                  value={form.watch("image") ?? ""}
                  onChange={(url) =>
                    form.setValue("image", url, { shouldValidate: true })
                  }
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
                <p className="text-xs text-muted-foreground">
                  Menor número = aparece primero en el menú
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Categoría activa</Label>
                  <p className="text-sm text-muted-foreground">
                    La categoría y sus productos aparecerán en el menú
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={form.watch("isActive") ?? true}
                  onCheckedChange={(checked) =>
                    form.setValue("isActive", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowsAdditions">Permite adiciones</Label>
                  <p className="text-sm text-muted-foreground">
                    Los productos de esta categoría ofrecerán adiciones al
                    agregarlos al carrito
                  </p>
                </div>
                <Switch
                  id="allowsAdditions"
                  checked={form.watch("allowsAdditions") ?? true}
                  onCheckedChange={(checked) =>
                    form.setValue("allowsAdditions", checked)
                  }
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className="flex-1"
                >
                  <Link href="/admin/dashboard/categories">Cancelar</Link>
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
