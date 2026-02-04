/**
 * Products fetch functions for server and client-side data fetching
 */

import type { Product, ApiResponse } from "@/types/models";
import { getAuthHeaders } from "@/stores/use-auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const PUBLIC_DATA_REVALIDATE = 60; // 1 minute

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

interface FetchProductsOptions {
  categoryId?: string;
  isActive?: boolean;
  isAvailable?: boolean;
}

export async function fetchProducts(
  options?: FetchProductsOptions
): Promise<Product[]> {
  const params = new URLSearchParams();
  if (options?.categoryId) params.set("categoryId", options.categoryId);
  if (options?.isActive !== undefined)
    params.set("isActive", String(options.isActive));
  if (options?.isAvailable !== undefined)
    params.set("isAvailable", String(options.isAvailable));

  const response = await fetch(`${API_URL}/api/products?${params.toString()}`, {
    next: { revalidate: PUBLIC_DATA_REVALIDATE },
  });
  const result: ApiResponse<Product[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al cargar productos");
  }

  return result.data;
}

export async function fetchProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    next: { revalidate: PUBLIC_DATA_REVALIDATE },
  });
  const result: ApiResponse<Product> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Producto no encontrado");
  }

  return result.data;
}

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const response = await fetch(`${API_URL}/api/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<Product> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al crear producto");
  }

  return result.data;
}

export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<Product> {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<Product> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al actualizar producto");
  }

  return result.data;
}

export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const result: ApiResponse<void> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Error al eliminar producto");
  }
}
