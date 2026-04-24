"use client";

import { memo, useState } from "react";
import type { Addition, Product } from "@/types/models";
import { formatPrice } from "@/stores/use-cart-store";
import { AddToCartDialog } from "./add-to-cart-dialog";
import { Plus } from "lucide-react";

interface MenuItemProps {
  product: Product;
  additions: Addition[];
  allowsAdditions: boolean;
}

export const MenuItem = memo(function MenuItem({ product, additions, allowsAdditions }: MenuItemProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div
        className="group flex cursor-pointer items-center justify-between gap-4 border-b border-dashed border-border py-4 transition-all last:border-0 hover:pl-2"
        onClick={() => setDialogOpen(true)}
      >
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </p>
          {product.description && (
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground line-clamp-1">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="font-mono text-sm font-bold tabular-nums text-primary">
            {formatPrice(product.price)}
          </span>
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-transparent text-muted-foreground transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
            <Plus className="h-3 w-3" />
          </div>
        </div>
      </div>

      <AddToCartDialog
        product={product}
        additions={additions}
        allowsAdditions={allowsAdditions}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
});
