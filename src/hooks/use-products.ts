"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuthHeaders } from "@/stores/use-auth-store";
import type { Product, Category } from "@/types/models";

interface ProductWithCategory extends Product {
  category: Pick<Category, "id" | "name" | "slug">;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface UseProductsOptions {
  categoryId?: string;
  isActive?: boolean;
  isAvailable?: boolean;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.categoryId) params.set("categoryId", options.categoryId);
      if (options.isActive !== undefined) params.set("isActive", String(options.isActive));
      if (options.isAvailable !== undefined) params.set("isAvailable", String(options.isAvailable));

      const url = `/api/products${params.toString() ? `?${params}` : ""}`;
      const response = await fetch(url);
      const result: ApiResponse<ProductWithCategory[]> = await response.json();

      if (result.success && result.data) {
        setProducts(result.data);
      } else {
        setError(result.error || "Error al cargar productos");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  }, [options.categoryId, options.isActive, options.isAvailable]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (data: Partial<Product>): Promise<ProductWithCategory | null> => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<ProductWithCategory> = await response.json();

      if (result.success && result.data) {
        setProducts((prev) => [...prev, result.data!]);
        return result.data;
      }

      setError(result.error || "Error al crear producto");
      return null;
    } catch {
      setError("Error de conexión");
      return null;
    }
  };

  const updateProduct = async (
    id: string,
    data: Partial<Product>
  ): Promise<ProductWithCategory | null> => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<ProductWithCategory> = await response.json();

      if (result.success && result.data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? result.data! : p))
        );
        return result.data;
      }

      setError(result.error || "Error al actualizar producto");
      return null;
    } catch {
      setError("Error de conexión");
      return null;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        return true;
      }

      setError(result.error || "Error al eliminar producto");
      return false;
    } catch {
      setError("Error de conexión");
      return false;
    }
  };

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    clearError: () => setError(null),
  };
}

export function useProduct(id: string | null) {
  const [product, setProduct] = useState<ProductWithCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setProduct(null);
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/${id}`);
        const result: ApiResponse<ProductWithCategory> = await response.json();

        if (result.success && result.data) {
          setProduct(result.data);
        } else {
          setError(result.error || "Producto no encontrado");
        }
      } catch {
        setError("Error de conexión");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, isLoading, error };
}
