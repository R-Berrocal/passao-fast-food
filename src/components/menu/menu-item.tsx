"use client";

import { memo, useState } from "react";
import { Card } from "@/components/ui/card";
import type { Addition, Product } from "@/types/models";
import { formatPrice } from "@/stores/use-cart-store";
import { AddToCartDialog } from "./add-to-cart-dialog";

interface MenuItemProps {
  product: Product;
  additions: Addition[];
}

export const MenuItem = memo(function MenuItem({ product, additions }: MenuItemProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card
        className="group cursor-pointer border-l-4 border-l-transparent transition-all duration-200 hover:border-l-primary hover:scale-[1.02] hover:shadow-md"
        onClick={() => setDialogOpen(true)}
      >
        <div className="p-6">
          <h3 className="text-xl font-bold leading-tight text-foreground">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </p>
            <span className="text-xs text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Toca para pedir →
            </span>
          </div>
        </div>
      </Card>

      <AddToCartDialog
        product={product}
        additions={additions}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
});
