"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MenuItem as MenuItemType, formatPrice } from "@/data/menu";
import { AddToCartDialog } from "./add-to-cart-dialog";

interface MenuItemProps {
  item: MenuItemType;
}

export function MenuItem({ item }: MenuItemProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card
        className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
        onClick={() => setDialogOpen(true)}
      >
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <Button
            size="icon"
            className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
            onClick={(e) => {
              e.stopPropagation();
              setDialogOpen(true);
            }}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
          {item.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}
          <p className="mt-2 text-lg font-bold text-primary">
            {formatPrice(item.price)}
          </p>
        </div>
      </Card>

      <AddToCartDialog
        item={item}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
