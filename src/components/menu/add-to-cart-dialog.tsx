"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCartStore, CartItemAddition, formatPrice } from "@/stores/use-cart-store";
import { cn } from "@/lib/utils";
import type { Addition, Product } from "@/types/models";

interface AddToCartDialogProps {
  product: Product | null;
  additions: Addition[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToCartDialog({ product, additions, open, onOpenChange }: AddToCartDialogProps) {
  const [selectedAdditions, setSelectedAdditions] = useState<CartItemAddition[]>([]);
  const addItem = useCartStore((state) => state.addItem);

  if (!product) return null;

  const toggleAddition = (addition: { id: string; name: string; price: number }) => {
    setSelectedAdditions((prev) => {
      const exists = prev.find((a) => a.id === addition.id);
      if (exists) {
        return prev.filter((a) => a.id !== addition.id);
      }
      return [...prev, { id: addition.id, name: addition.name, price: addition.price }];
    });
  };

  const additionsTotal = selectedAdditions.reduce((sum, add) => sum + add.price, 0);
  const totalPrice = product.price + additionsTotal;

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image,
      },
      selectedAdditions
    );
    setSelectedAdditions([]);
    onOpenChange(false);
    // openCart();
  };

  const handleClose = () => {
    setSelectedAdditions([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.name}</DialogTitle>
          {product.description && (
            <p className="text-sm text-muted-foreground">{product.description}</p>
          )}
        </DialogHeader>

        <div className="py-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Precio base</span>
            <span className="font-semibold">{formatPrice(product.price)}</span>
          </div>
        </div>

        <Separator />

        <div className="py-2">
          <h4 className="mb-3 font-semibold">Adiciones (opcional)</h4>
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-2">
              {additions.map((addition) => {
                const isSelected = selectedAdditions.some((a) => a.id === addition.id);
                return (
                  <button
                    key={addition.id}
                    onClick={() => toggleAddition(addition)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <span className={cn(isSelected && "font-medium")}>
                        {addition.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      +{formatPrice(addition.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        <div className="flex items-center justify-between py-2">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-xl font-bold text-primary">{formatPrice(totalPrice)}</span>
        </div>

        {selectedAdditions.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Adiciones: {selectedAdditions.map((a) => a.name).join(", ")}
          </div>
        )}

        <DialogFooter className="flex-col-reverse sm:flex-row gap-3 pt-4">
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button onClick={handleAddToCart} className="w-full sm:w-auto gap-2 cursor-pointer">
            <Plus className="h-4 w-4" />
            Agregar al carrito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
