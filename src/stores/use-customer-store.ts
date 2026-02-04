import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address, CheckoutCustomer } from "@/types/models";

interface CustomerState {
  customer: CheckoutCustomer | null;
  addresses: Address[];
  selectedAddressId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCustomer: (customer: CheckoutCustomer | null) => void;
  setAddresses: (addresses: Address[]) => void;
  addAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  selectAddress: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      customer: null,
      addresses: [],
      selectedAddressId: null,
      isLoading: false,
      error: null,

      setCustomer: (customer) => set({ customer }),

      setAddresses: (addresses) => {
        // Auto-select default address
        const defaultAddress = addresses.find((a) => a.isDefault);
        set({
          addresses,
          selectedAddressId: defaultAddress?.id || addresses[0]?.id || null,
        });
      },

      addAddress: (address) =>
        set((state) => ({
          addresses: [address, ...state.addresses],
          selectedAddressId: address.id, // Select newly added address
        })),

      removeAddress: (id) =>
        set((state) => {
          const newAddresses = state.addresses.filter((a) => a.id !== id);
          const wasSelected = state.selectedAddressId === id;
          return {
            addresses: newAddresses,
            selectedAddressId: wasSelected
              ? newAddresses[0]?.id || null
              : state.selectedAddressId,
          };
        }),

      selectAddress: (id) => set({ selectedAddressId: id }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clear: () =>
        set({
          customer: null,
          addresses: [],
          selectedAddressId: null,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "customer-storage",
      partialize: (state) => ({
        customer: state.customer,
        addresses: state.addresses,
        selectedAddressId: state.selectedAddressId,
      }),
    }
  )
);

// Helper hook to get selected address
export const useSelectedAddress = () =>
  useCustomerStore((state) => {
    if (!state.selectedAddressId) return null;
    return state.addresses.find((a) => a.id === state.selectedAddressId) || null;
  });

// Helper to mask phone number (301****789)
export const maskPhone = (phone: string): string => {
  if (phone.length < 7) return phone;
  const start = phone.slice(0, 3);
  const end = phone.slice(-3);
  return `${start}****${end}`;
};
