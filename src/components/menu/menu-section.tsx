import { MenuCategory } from "@/data/menu";
import { MenuItem } from "./menu-item";

interface MenuSectionProps {
  category: MenuCategory;
}

export function MenuSection({ category }: MenuSectionProps) {
  return (
    <section id={category.id} className="scroll-mt-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary md:text-3xl">
          {category.name}
        </h2>
        <div className="mt-2 h-1 w-20 bg-primary" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.items.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
