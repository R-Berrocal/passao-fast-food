"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuthHeaders } from "@/stores/use-auth-store";
import type { Category } from "@/types/models";

interface CategoryWithCount extends Category {
  _count: {
    products: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/categories");
      const result: ApiResponse<CategoryWithCount[]> = await response.json();

      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        setError(result.error || "Error al cargar categorías");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (
    data: Partial<Category>
  ): Promise<Category | null> => {
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<Category> = await response.json();

      if (result.success && result.data) {
        await fetchCategories();
        return result.data;
      }

      setError(result.error || "Error al crear categoría");
      return null;
    } catch {
      setError("Error de conexión");
      return null;
    }
  };

  const updateCategory = async (
    id: string,
    data: Partial<Category>
  ): Promise<Category | null> => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<Category> = await response.json();

      if (result.success && result.data) {
        await fetchCategories();
        return result.data;
      }

      setError(result.error || "Error al actualizar categoría");
      return null;
    } catch {
      setError("Error de conexión");
      return null;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        return true;
      }

      setError(result.error || "Error al eliminar categoría");
      return false;
    } catch {
      setError("Error de conexión");
      return false;
    }
  };

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError: () => setError(null),
  };
}
