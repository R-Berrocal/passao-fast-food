"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProductAdminStore } from "@/stores/use-product-admin-store";
import { ProductForm } from "./product-form";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductFormDialog({ open, onOpenChange }: ProductFormDialogProps) {
  const { isEditing, clearSelection } = useProductAdminStore();

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      clearSelection();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </DialogTitle>
        </DialogHeader>
        <ProductForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
