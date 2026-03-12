"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, useCartItemCount, useCartTotal, formatPrice } from "@/stores/use-cart-store";

export function MobileCartBar() {
  const itemCount = useCartItemCount();
  const total = useCartTotal();
  const openCart = useCartStore((state) => state.openCart);

  if (itemCount === 0) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-40">
      <Button className="w-full" size="lg" onClick={openCart}>
        <ShoppingCart className="mr-2 h-4 w-4" />
        Ver carrito ({itemCount} {itemCount === 1 ? "producto" : "productos"}) · {formatPrice(total)}
      </Button>
    </div>
  );
}
