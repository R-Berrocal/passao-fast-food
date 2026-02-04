"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Addition, Product } from "@/types/models";
import { formatPrice } from "@/stores/use-cart-store";
import { AddToCartDialog } from "./add-to-cart-dialog";

interface MenuItemProps {
  product: Product;
  additions: Addition[];
}

export function MenuItem({ product, additions }: MenuItemProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card
        className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
        onClick={() => setDialogOpen(true)}
      >
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <Button
            size="icon"
            className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setDialogOpen(true);
            }}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
          {product.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
          <p className="mt-2 text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </p>
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
}
