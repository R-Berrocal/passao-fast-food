"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCartStore, useCartTotal, formatPrice } from "@/stores/use-cart-store";
import Link from "next/link";

export function Cart() {
  const { items, removeItem, updateQuantity, clearCart, closeCart } = useCartStore();
  const total = useCartTotal();

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <SheetHeader>
          <SheetTitle>Tu Carrito</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <span className="text-4xl">🛒</span>
          </div>
          <p className="text-muted-foreground">Tu carrito está vacío</p>
          <Button variant="outline" asChild onClick={closeCart}>
            <Link href="#menu">Ver Menú</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <SheetHeader>
        <SheetTitle>Tu Carrito ({items.length} productos)</SheetTitle>
      </SheetHeader>

      <ScrollArea className="flex-1 py-4">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.cartItemId} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.name}</p>
                  {item.additions.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      + {item.additions.map((a) => a.name).join(", ")}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-primary font-semibold">
                    {formatPrice(item.totalPrice)}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                  onClick={() => removeItem(item.cartItemId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="font-semibold">
                  {formatPrice(item.totalPrice * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="space-y-4 pt-4 pb-6 px-1">
        <Separator />

        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Total</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>

        <div className="grid gap-3">
          <Button asChild onClick={closeCart}>
            <Link href="/checkout">Finalizar Pedido</Link>
          </Button>
          <Button variant="outline" onClick={clearCart}>
            Vaciar Carrito
          </Button>
        </div>
      </div>
    </div>
  );
}
