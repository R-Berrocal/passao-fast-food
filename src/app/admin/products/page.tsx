"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { menuData } from "@/data/menu";
import { useProductAdminStore } from "@/stores/use-product-admin-store";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import { ProductList } from "@/components/admin/product-list";

export default function ProductosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { clearSelection } = useProductAdminStore();

  // Mock de todos los productos
  const allProducts = menuData.flatMap((category) =>
    category.items.map((item) => ({ ...item, categoryName: category.name }))
  );

  // Filtrar productos por búsqueda y categoría
  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Contadores por categoría
  const categoryCounts = menuData.reduce(
    (acc, cat) => {
      acc[cat.id] = cat.items.length;
      return acc;
    },
    { all: allProducts.length } as Record<string, number>
  );

  const handleNewProduct = () => {
    clearSelection();
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between gap-2 px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" asChild className="shrink-0">
              <Link href="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold sm:text-xl">Gestión de Productos</h1>
              <p className="text-sm text-muted-foreground sm:block">
                {allProducts.length} productos registrados
              </p>
            </div>
          </div>
          <Button onClick={handleNewProduct} className="shrink-0 gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Producto</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tabs de categorías */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="w-full flex-wrap h-auto gap-1">
              <TabsTrigger value="all" className="flex-1">
                Todos ({categoryCounts.all})
              </TabsTrigger>
              {menuData.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex-1"
                >
                  {category.name} ({categoryCounts[category.id]})
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeCategory} className="mt-4">
              <ProductList products={filteredProducts} onEdit={() => setDialogOpen(true)} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialog del formulario */}
      <ProductFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
