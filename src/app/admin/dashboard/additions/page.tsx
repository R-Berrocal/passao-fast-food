"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  CirclePlus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdditions } from "@/hooks/use-additions";
import { formatPrice } from "@/stores/use-cart-store";
import type { Addition } from "@/types/models";

function AdditionCard({
  addition,
  onDelete,
}: {
  addition: Addition;
  onDelete: () => void;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-32">
        {addition.image ? (
          <img
            src={addition.image}
            alt={addition.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <CirclePlus className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {!addition.isActive && (
          <Badge variant="destructive" className="absolute left-2 top-2">
            Inactivo
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold">{addition.name}</h3>
            <p className="mt-1 text-lg font-bold text-primary">
              {formatPrice(addition.price)}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/dashboard/additions/${addition.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdditionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAddition, setSelectedAddition] = useState<Addition | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { additions, isLoading, deleteAddition } = useAdditions({ showAll: true });

  const filteredAdditions = additions.filter((addition) =>
    addition.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (addition: Addition) => {
    setSelectedAddition(addition);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAddition) return;
    setIsDeleting(true);
    const success = await deleteAddition(selectedAddition.id);
    setIsDeleting(false);
    if (success) {
      setIsDeleteDialogOpen(false);
      setSelectedAddition(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Adiciones</h2>
          <p className="text-muted-foreground">
            Administra los extras que los clientes pueden agregar a sus pedidos
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/dashboard/additions/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Adición
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar adiciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Additions Grid */}
      <ScrollArea className="h-[calc(100vh-320px)]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAdditions.map((addition) => (
            <AdditionCard
              key={addition.id}
              addition={addition}
              onDelete={() => handleDelete(addition)}
            />
          ))}
        </div>
        {filteredAdditions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CirclePlus className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              No se encontraron adiciones
            </h3>
            <p className="text-muted-foreground">
              {additions.length === 0
                ? "Crea tu primera adición para comenzar"
                : "Intenta ajustar los filtros de búsqueda"}
            </p>
          </div>
        )}
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar Adición</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar &quot;{selectedAddition?.name}&quot;?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
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
