import { memo } from "react";
import type { Addition, Category, Product } from "@/types/models";
import { MenuItem } from "./menu-item";

interface CategoryWithProducts extends Category {
  products: Product[];
}

interface MenuSectionProps {
  category: CategoryWithProducts;
  additions: Addition[];
}

export const MenuSection = memo(function MenuSection({ category, additions }: MenuSectionProps) {
  return (
    <section id={category.slug} className="scroll-mt-20">
      <div className="mb-8 border-t-2 border-dashed border-primary/30 pt-5">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {category.name}
          </span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {category.products.length}{" "}
            {category.products.length === 1 ? "producto" : "productos"}
          </span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
          {category.name}
        </h2>
      </div>

      <div className="grid gap-x-12 sm:grid-cols-2">
        {category.products.map((product) => (
          <MenuItem
            key={product.id}
            product={product}
            additions={additions}
            allowsAdditions={category.allowsAdditions}
          />
        ))}
      </div>
    </section>
  );
});
