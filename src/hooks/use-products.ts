"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "@/stores/use-auth-store";
import { queryKeys } from "@/lib/query-keys";
import type { Product, Category, ApiResponse } from "@/types/models";

interface ProductWithCategory extends Product {
  category: Pick<Category, "id" | "name" | "slug">;
}

interface UseProductsOptions {
  categoryId?: string;
  isActive?: boolean;
  isAvailable?: boolean;
}

// Fetch functions
async function fetchProduct(id: string): Promise<ProductWithCategory> {
  const response = await fetch(`/api/products/${id}`);
  const result: ApiResponse<ProductWithCategory> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Producto no encontrado");
  }

  return result.data;
}

async function fetchProducts(
  options: UseProductsOptions = {}
): Promise<ProductWithCategory[]> {
  const params = new URLSearchParams();
  if (options.categoryId) params.set("categoryId", options.categoryId);
  if (options.isActive !== undefined)
    params.set("isActive", String(options.isActive));
  if (options.isAvailable !== undefined)
    params.set("isAvailable", String(options.isAvailable));

  const url = `/api/products${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url);
  const result: ApiResponse<ProductWithCategory[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al cargar productos");
  }

  return result.data;
}

export function useProduct(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.products.detail(id!),
    queryFn: () => fetchProduct(id!),
    enabled: !!id,
  });

  return {
    product: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
  };
}

export function useProducts(options: UseProductsOptions = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.products.list(options),
    queryFn: () => fetchProducts(options),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (
      data: Partial<Product>
    ): Promise<ProductWithCategory> => {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<ProductWithCategory> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Error al crear producto");
      }

      return result.data;
    },
    onMutate: async (newProduct) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.products.lists() });

      // Snapshot previous value
      const previousProducts = queryClient.getQueryData<ProductWithCategory[]>(
        queryKeys.products.list(options)
      );

      // Optimistically update with temporary ID
      if (previousProducts) {
        const optimisticProduct: ProductWithCategory = {
          id: `temp-${Date.now()}`,
          categoryId: newProduct.categoryId || "",
          name: newProduct.name || "",
          description: newProduct.description,
          price: newProduct.price || 0,
          image: newProduct.image || "",
          isActive: newProduct.isActive ?? true,
          isAvailable: newProduct.isAvailable ?? true,
          displayOrder: newProduct.displayOrder || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: { id: "", name: "", slug: "" }, // Will be replaced with real data
        } as ProductWithCategory;

        queryClient.setQueryData<ProductWithCategory[]>(
          queryKeys.products.list(options),
          [...previousProducts, optimisticProduct]
        );
      }

      return { previousProducts };
    },
    onError: (_err, _newProduct, context) => {
      // Rollback on error
      if (context?.previousProducts) {
        queryClient.setQueryData(
          queryKeys.products.list(options),
          context.previousProducts
        );
      }
    },
    onSuccess: (newProduct) => {
      // Replace temp product with real one
      const previousProducts = queryClient.getQueryData<ProductWithCategory[]>(
        queryKeys.products.list(options)
      );

      if (previousProducts) {
        const withoutTemp = previousProducts.filter(
          (p) => !p.id.startsWith("temp-")
        );
        queryClient.setQueryData<ProductWithCategory[]>(
          queryKeys.products.list(options),
          [...withoutTemp, newProduct]
        );
      }

      // Invalidate all product queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Product>;
    }): Promise<ProductWithCategory> => {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<ProductWithCategory> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "Error al actualizar producto");
      }

      return result.data;
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.products.lists() });
      await queryClient.cancelQueries({
        queryKey: queryKeys.products.detail(id),
      });

      // Snapshot previous values
      const previousProducts = queryClient.getQueryData<ProductWithCategory[]>(
        queryKeys.products.list(options)
      );
      const previousProduct = queryClient.getQueryData<ProductWithCategory>(
        queryKeys.products.detail(id)
      );

      // Optimistically update list
      if (previousProducts) {
        queryClient.setQueryData<ProductWithCategory[]>(
          queryKeys.products.list(options),
          previousProducts.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
          )
        );
      }

      // Optimistically update detail
      if (previousProduct) {
        queryClient.setQueryData<ProductWithCategory>(
          queryKeys.products.detail(id),
          {
            ...previousProduct,
            ...data,
            updatedAt: new Date(),
          }
        );
      }

      return { previousProducts, previousProduct };
    },
    onError: (_err, { id }, context) => {
      // Rollback on error
      if (context?.previousProducts) {
        queryClient.setQueryData(
          queryKeys.products.list(options),
          context.previousProducts
        );
      }
      if (context?.previousProduct) {
        queryClient.setQueryData(
          queryKeys.products.detail(id),
          context.previousProduct
        );
      }
    },
    onSuccess: (updatedProduct) => {
      // Update cache with server response
      queryClient.setQueryData(
        queryKeys.products.detail(updatedProduct.id),
        updatedProduct
      );

      // Invalidate all lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const result: ApiResponse<void> = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Error al eliminar producto");
      }
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.products.lists() });

      // Snapshot previous value
      const previousProducts = queryClient.getQueryData<ProductWithCategory[]>(
        queryKeys.products.list(options)
      );

      // Optimistically remove from list
      if (previousProducts) {
        queryClient.setQueryData<ProductWithCategory[]>(
          queryKeys.products.list(options),
          previousProducts.filter((p) => p.id !== id)
        );
      }

      return { previousProducts };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousProducts) {
        queryClient.setQueryData(
          queryKeys.products.list(options),
          context.previousProducts
        );
      }
    },
    onSuccess: (_data, id) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: queryKeys.products.detail(id) });

      // Invalidate all lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() });
    },
  });

  return {
    products: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    createProduct: async (
      data: Partial<Product>
    ): Promise<ProductWithCategory | null> => {
      try {
        return await createMutation.mutateAsync(data);
      } catch {
        return null;
      }
    },
    updateProduct: async (
      id: string,
      data: Partial<Product>
    ): Promise<ProductWithCategory | null> => {
      try {
        return await updateMutation.mutateAsync({ id, data });
      } catch {
        return null;
      }
    },
    deleteProduct: async (id: string): Promise<boolean> => {
      try {
        await deleteMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    clearError: () => {
      // Clear error by resetting mutations
      createMutation.reset();
      updateMutation.reset();
      deleteMutation.reset();
    },
  };
}
