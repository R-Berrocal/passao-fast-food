import type { Addition, Category, Product } from "@/types/models";
import { MenuItem } from "./menu-item";

interface CategoryWithProducts extends Category {
  products: Product[];
}

interface MenuSectionProps {
  category: CategoryWithProducts;
  additions: Addition[];
}

export function MenuSection({ category, additions }: MenuSectionProps) {
  return (
    <section id={category.slug} className="scroll-mt-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary md:text-3xl">
          {category.name}
        </h2>
        <div className="mt-2 h-1 w-20 bg-primary" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.products.map((product) => (
          <MenuItem key={product.id} product={product} additions={additions} />
        ))}
      </div>
    </section>
  );
}
