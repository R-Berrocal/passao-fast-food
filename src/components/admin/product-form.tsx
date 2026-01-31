"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { menuData } from "@/data/menu";
import { useProductAdminStore } from "@/stores/use-product-admin-store";

interface ProductFormData {
  name: string;
  price: string;
  category: string;
  description: string;
  image: string;
}

interface ProductFormProps {
  onSuccess?: () => void;
}

export function ProductForm({ onSuccess }: ProductFormProps) {
  const { selectedProduct, isEditing, clearSelection } =
    useProductAdminStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
  } = useForm<ProductFormData>({
    defaultValues: {
      name: "",
      price: "",
      category: "",
      description: "",
      image: "",
    },
  });

  const selectedCategory = useWatch({
    control,
    name: "category",
  });

  // Cargar datos del producto seleccionado
  useEffect(() => {
    if (selectedProduct) {
      reset({
        name: selectedProduct.name,
        price: selectedProduct.price.toString(),
        category: selectedProduct.category,
        description: selectedProduct.description || "",
        image: selectedProduct.image,
      });
    } else {
      reset({
        name: "",
        price: "",
        category: "",
        description: "",
        image: "",
      });
    }
  }, [selectedProduct, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (isEditing) {
      console.log("Actualizar producto:", { id: selectedProduct?.id, ...data });
    } else {
      console.log("Crear producto:", data);
    }

    setIsSubmitting(false);
    
    // Limpiar formulario después de crear

    // Llamar callback de éxito para cerrar el dialog
    onSuccess?.();
  };

  const handleCancel = () => {
    clearSelection();
    reset();
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Nombre */}
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del producto *</Label>
        <Input
          id="name"
          placeholder="Ej: Arepa Quesuda"
          {...register("name", { required: true })}
          disabled={isSubmitting}
        />
      </div>

      {/* Precio */}
      <div className="space-y-2">
        <Label htmlFor="price">Precio *</Label>
        <Input
          id="price"
          type="number"
          placeholder="Ej: 6000"
          {...register("price", { required: true })}
          disabled={isSubmitting}
        />
      </div>

      {/* Categoría */}
      <div className="space-y-2">
        <Label htmlFor="category">Categoría *</Label>
        <Select
          value={selectedCategory}
          onValueChange={(value) => setValue("category", value)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {menuData.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          placeholder="Descripción opcional del producto"
          rows={3}
          {...register("description")}
          disabled={isSubmitting}
        />
      </div>

      {/* URL de imagen */}
      <div className="space-y-2">
        <Label htmlFor="image">URL de imagen *</Label>
        <Input
          id="image"
          type="url"
          placeholder="https://..."
          {...register("image", { required: true })}
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          URL de la imagen del producto (Unsplash, etc.)
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          className="flex-1 gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isEditing ? "Actualizando..." : "Creando..."}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEditing ? "Actualizar Producto" : "Crear Producto"}
            </>
          )}
        </Button>

        {isEditing && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
