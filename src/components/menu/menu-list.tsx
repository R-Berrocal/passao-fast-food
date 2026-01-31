import { menuData } from "@/data/menu";
import { MenuSection } from "./menu-section";

export function MenuList() {
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
          {menuData.map((category) => (
            <MenuSection key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}
