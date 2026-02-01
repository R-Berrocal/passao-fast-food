"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuthHeaders } from "@/stores/use-auth-store";
import type { Addition } from "@/types/models";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useAdditions() {
  const [additions, setAdditions] = useState<Addition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdditions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/additions");
      const result: ApiResponse<Addition[]> = await response.json();

      if (result.success && result.data) {
        setAdditions(result.data);
      } else {
        setError(result.error || "Error al cargar adiciones");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdditions();
  }, [fetchAdditions]);

  const createAddition = async (
    data: Partial<Addition>
  ): Promise<Addition | null> => {
    try {
      const response = await fetch("/api/additions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<Addition> = await response.json();

      if (result.success && result.data) {
        setAdditions((prev) => [...prev, result.data!]);
        return result.data;
      }

      setError(result.error || "Error al crear adición");
      return null;
    } catch {
      setError("Error de conexión");
      return null;
    }
  };

  const updateAddition = async (
    id: string,
    data: Partial<Addition>
  ): Promise<Addition | null> => {
    try {
      const response = await fetch(`/api/additions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<Addition> = await response.json();

      if (result.success && result.data) {
        setAdditions((prev) =>
          prev.map((a) => (a.id === id ? result.data! : a))
        );
        return result.data;
      }

      setError(result.error || "Error al actualizar adición");
      return null;
    } catch {
      setError("Error de conexión");
      return null;
    }
  };

  const deleteAddition = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/additions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        setAdditions((prev) => prev.filter((a) => a.id !== id));
        return true;
      }

      setError(result.error || "Error al eliminar adición");
      return false;
    } catch {
      setError("Error de conexión");
      return false;
    }
  };

  return {
    additions,
    isLoading,
    error,
    refetch: fetchAdditions,
    createAddition,
    updateAddition,
    deleteAddition,
    clearError: () => setError(null),
  };
}
