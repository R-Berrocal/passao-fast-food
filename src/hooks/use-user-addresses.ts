"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuthHeaders } from "@/stores/use-auth-store";
import type { Address } from "@/types/models";
import type { CreateAddressInput, UpdateAddressInput } from "@/lib/validations/address";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useUserAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/me/addresses", {
        headers: getAuthHeaders(),
      });
      const result: ApiResponse<Address[]> = await response.json();

      if (result.success && result.data) {
        setAddresses(result.data);
      } else {
        // User might not be authenticated
        setAddresses([]);
      }
    } catch {
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const createAddress = async (
    data: CreateAddressInput
  ): Promise<Address | null> => {
    try {
      const response = await fetch("/api/me/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<Address> = await response.json();

      if (result.success && result.data) {
        // If new address is default, update others
        if (result.data.isDefault) {
          setAddresses((prev) =>
            prev.map((a) => ({ ...a, isDefault: false }))
          );
        }
        setAddresses((prev) => [result.data!, ...prev]);
        return result.data;
      }

      setError(result.error || "Error al crear dirección");
      return null;
    } catch {
      setError("Error de conexión");
      return null;
    }
  };

  const updateAddress = async (
    id: string,
    data: UpdateAddressInput
  ): Promise<Address | null> => {
    try {
      const response = await fetch(`/api/me/addresses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<Address> = await response.json();

      if (result.success && result.data) {
        setAddresses((prev) =>
          prev.map((a) => {
            if (a.id === id) return result.data!;
            // If updated address is now default, unset others
            if (result.data!.isDefault && a.isDefault) {
              return { ...a, isDefault: false };
            }
            return a;
          })
        );
        return result.data;
      }

      setError(result.error || "Error al actualizar dirección");
      return null;
    } catch {
      setError("Error de conexión");
      return null;
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/me/addresses/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        return true;
      }

      setError(result.error || "Error al eliminar dirección");
      return false;
    } catch {
      setError("Error de conexión");
      return false;
    }
  };

  const getDefaultAddress = (): Address | undefined => {
    return addresses.find((a) => a.isDefault) || addresses[0];
  };

  return {
    addresses,
    isLoading,
    error,
    refetch: fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    getDefaultAddress,
    clearError: () => setError(null),
  };
}
