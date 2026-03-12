"use client";

import { useMemo } from "react";
import { useCategories } from "@/hooks/use-categories";
import { useProducts } from "@/hooks/use-products";
import { useAdditions } from "@/hooks/use-additions";
import { MenuSection } from "./menu-section";
import { Skeleton } from "@/components/ui/skeleton";

export function MenuList() {
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { products, isLoading: productsLoading } = useProducts({
    isActive: true,
    isAvailable: true,
  });
  const { additions, isLoading: additionsLoading } = useAdditions();

  const isLoading = categoriesLoading || productsLoading || additionsLoading;

  const categoriesWithProducts = useMemo(
    () =>
      categories
        .filter((category) => products.some((p) => p.categoryId === category.id))
        .map((category) => ({
          ...category,
          products: products.filter((p) => p.categoryId === category.id),
        })),
    [categories, products]
  );

  if (isLoading) {
    return (
      <section id="menu" className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 border-b border-border pb-8">
            <Skeleton className="mb-2 h-3 w-12" />
            <Skeleton className="h-10 w-52" />
          </div>
          <div className="space-y-16">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="mb-8 border-t-2 border-dashed border-primary/30 pt-5">
                  <Skeleton className="mb-2 h-3 w-20" />
                  <Skeleton className="h-8 w-36" />
                </div>
                <div className="grid gap-x-12 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-14 w-full border-b border-dashed border-border" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 flex items-end justify-between border-b border-border pb-8">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.25em] text-primary">
              Carta
            </p>
            <h2 className="text-4xl font-black tracking-tight md:text-5xl">Nuestro Menú</h2>
          </div>
          <p className="hidden text-sm text-muted-foreground md:block">
            Toca cualquier producto para agregar al pedido
          </p>
        </div>

        <div className="space-y-20">
          {categoriesWithProducts.map((category) => (
            <MenuSection key={category.id} category={category} additions={additions} />
          ))}
        </div>
      </div>
    </section>
  );
}
