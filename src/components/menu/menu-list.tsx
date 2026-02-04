"use client";

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

  if (isLoading) {
    return (
      <section id="menu" className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Nuestro Menú</h2>
            <p className="mt-2 text-muted-foreground">
              Descubre todos nuestros deliciosos productos
            </p>
          </div>
          <div className="space-y-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-6">
                <Skeleton className="h-10 w-32" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-64 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const categoriesWithProducts = categories
    .filter((category) => products.some((p) => p.categoryId === category.id))
    .map((category) => ({
      ...category,
      products: products.filter((p) => p.categoryId === category.id),
    }));

  return (
    <section id="menu" className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Nuestro Menú</h2>
          <p className="mt-2 text-muted-foreground">
            Descubre todos nuestros deliciosos productos
          </p>
        </div>

        <div className="space-y-16">
          {categoriesWithProducts.map((category) => (
            <MenuSection key={category.id} category={category} additions={additions} />
          ))}
        </div>
      </div>
    </section>
  );
}
