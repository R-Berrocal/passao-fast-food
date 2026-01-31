import { create } from "zustand";
import { MenuItem } from "@/data/menu";

interface ProductAdminState {
  selectedProduct: MenuItem | null;
  isEditing: boolean;
  selectProduct: (product: MenuItem) => void;
  clearSelection: () => void;
}

export const useProductAdminStore = create<ProductAdminState>((set) => ({
  selectedProduct: null,
  isEditing: false,

  selectProduct: (product) =>
    set({
      selectedProduct: product,
      isEditing: true,
    }),

  clearSelection: () =>
    set({
      selectedProduct: null,
      isEditing: false,
    }),
}));
