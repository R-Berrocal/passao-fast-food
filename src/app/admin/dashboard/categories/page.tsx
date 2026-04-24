"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  PackageX,
  Loader2,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCategories } from "@/hooks/use-categories";
import { useAuthStore } from "@/stores/use-auth-store";
import type { Category } from "@/types/models";

interface CategoryWithCount extends Category {
  _count: { products: number };
}

function CategoryRow({
  category,
  isAdmin,
  onDelete,
}: {
  category: CategoryWithCount;
  isAdmin: boolean;
  onDelete: () => void;
}) {
  return (
    <Card className="border-l-4 border-l-transparent transition-all duration-200 hover:border-l-primary hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Tag className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{category.name}</h3>
                <span className="text-xs text-muted-foreground font-mono">
                  /{category.slug}
                </span>
                {!category.isActive && (
                  <Badge variant="destructive">Inactiva</Badge>
                )}
                {!category.allowsAdditions && (
                  <Badge variant="secondary">Sin adiciones</Badge>
                )}
              </div>
              {category.description && (
                <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block">
              {category._count?.products}{" "}
              {category._count?.products === 1 ? "producto" : "productos"}
            </span>

            {isAdmin && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" asChild className="cursor-pointer">
                  <Link href={`/admin/dashboard/categories/${category.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  disabled={category._count?.products > 0}
                  title={
                    category._count?.products > 0
                      ? "No se puede eliminar una categoría con productos"
                      : "Eliminar categoría"
                  }
                  className="text-destructive hover:text-destructive cursor-pointer disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CategoriesPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryWithCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { categories, isLoading, deleteCategory } = useCategories();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const handleDeleteClick = (category: CategoryWithCount) => {
    setSelectedCategory(category);
    setDeleteError(null);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategory) return;
    setIsDeleting(true);
    setDeleteError(null);
    const success = await deleteCategory(selectedCategory.id);
    setIsDeleting(false);
    if (success) {
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    } else {
      setDeleteError("No se pudo eliminar la categoría. Verifica que no tenga productos asociados.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Categorías</h2>
          <p className="text-muted-foreground">
            Organiza los productos del menú por categorías
          </p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/admin/dashboard/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Link>
          </Button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <PackageX className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No hay categorías</h3>
          <p className="text-muted-foreground">
            Crea tu primera categoría para organizar el menú
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {(categories as CategoryWithCount[]).map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              isAdmin={isAdmin}
              onDelete={() => handleDeleteClick(category)}
            />
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar Categoría</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar &quot;
              {selectedCategory?.name}&quot;? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {deleteError}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
