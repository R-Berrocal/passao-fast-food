import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItemAddition {
  id: string;
  name: string;
  price: number;
}

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  description?: string | null;
  image: string;
}

export interface CartItem extends CartProduct {
  quantity: number;
  cartItemId: string;
  additions: CartItemAddition[];
  totalPrice: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartProduct, additions?: CartItemAddition[]) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const generateCartItemId = () => `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (item, additions = []) =>
        set((state) => {
          const additionsTotal = additions.reduce((sum, add) => sum + add.price, 0);
          const totalPrice = item.price + additionsTotal;

          const newItem: CartItem = {
            ...item,
            cartItemId: generateCartItemId(),
            quantity: 1,
            additions,
            totalPrice,
          };

          return { items: [...state.items, newItem] };
        }),

      removeItem: (cartItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.cartItemId !== cartItemId),
        })),

      updateQuantity: (cartItemId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.cartItemId !== cartItemId) };
          }
          return {
            items: state.items.map((i) =>
              i.cartItemId === cartItemId ? { ...i, quantity } : i
            ),
          };
        }),

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export const useCartTotal = () =>
  useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.totalPrice * item.quantity, 0)
  );

export const useCartItemCount = () =>
  useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.quantity, 0)
  );

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};
