"use client";

import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatPrice } from "@/data/menu";
import { useProductAdminStore } from "@/stores/use-product-admin-store";
import type { MenuItem } from "@/data/menu";

interface ProductWithCategory extends MenuItem {
  categoryName: string;
}

interface ProductListProps {
  products: ProductWithCategory[];
  onEdit?: () => void;
}

export function ProductList({ products, onEdit }: ProductListProps) {
  const { selectedProduct, selectProduct } = useProductAdminStore();

  const handleEdit = (product: MenuItem) => {
    selectProduct(product);
    onEdit?.();
  };

  const handleDelete = (productId: string) => {
    console.log("Eliminar producto:", productId);
    // TODO: Lógica de eliminación (solo UI)
  };

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No se encontraron productos</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="space-y-3 pr-4">
        {products.map((product) => {
          const isSelected = selectedProduct?.id === product.id;

          return (
            <Card
              key={product.id}
              className={`transition-all ${
                isSelected
                  ? "ring-2 ring-primary"
                  : "hover:shadow-md hover:border-primary/50"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Imagen */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {product.name}
                        </h3>
                        <Badge variant="secondary" className="mt-1">
                          {product.categoryName}
                        </Badge>
                      </div>
                      <p className="font-bold text-primary whitespace-nowrap">
                        {formatPrice(product.price)}
                      </p>
                    </div>

                    {product.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Acciones */}
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => handleEdit(product)}
                        className="gap-2"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(product.id)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
