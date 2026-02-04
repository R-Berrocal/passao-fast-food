import { useState, useCallback } from "react";
import { useCustomerStore } from "@/stores/use-customer-store";
import type { Address, CheckoutCustomer } from "@/types/models";

interface LookupResponse {
  customer: CheckoutCustomer;
  addresses: Address[];
}

interface AddressInput {
  address: string;
  isDefault?: boolean;
}

export function useCustomerLookup() {
  const [isLooking, setIsLooking] = useState(false);
  const { setCustomer, setAddresses, addAddress, removeAddress, setError, clear } = useCustomerStore();

  const lookupOrCreate = useCallback(
    async (phone: string, name: string): Promise<LookupResponse | null> => {
      setIsLooking(true);
      setError(null);

      try {
        const response = await fetch("/api/customers/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, name }),
        });

        const data = await response.json();

        if (!data.success) {
          setError(data.error || "Error al buscar cliente");
          return null;
        }

        const result = data.data as LookupResponse;

        setCustomer(result.customer);
        setAddresses(result.addresses);

        return result;
      } catch (error) {
        console.error("Customer lookup error:", error);
        setError("Error de conexión");
        return null;
      } finally {
        setIsLooking(false);
      }
    },
    [setCustomer, setAddresses, setError]
  );

  const createAddress = useCallback(
    async (phone: string, addressInput: AddressInput): Promise<Address | null> => {
      try {
        const response = await fetch(`/api/customers/${encodeURIComponent(phone)}/addresses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressInput),
        });

        const data = await response.json();

        if (data.success && data.data) {
          addAddress(data.data);
          return data.data;
        }

        return null;
      } catch (error) {
        console.error("Create address error:", error);
        return null;
      }
    },
    [addAddress]
  );

  const deleteAddress = useCallback(
    async (phone: string, addressId: string): Promise<boolean> => {
      try {
        const response = await fetch(
          `/api/customers/${encodeURIComponent(phone)}/addresses/${addressId}`,
          { method: "DELETE" }
        );

        const data = await response.json();

        if (data.success) {
          removeAddress(addressId);
          return true;
        }

        return false;
      } catch (error) {
        console.error("Delete address error:", error);
        return false;
      }
    },
    [removeAddress]
  );

  const clearCustomer = useCallback(() => {
    clear();
  }, [clear]);

  return {
    isLooking,
    lookupOrCreate,
    createAddress,
    deleteAddress,
    clearCustomer,
  };
}
