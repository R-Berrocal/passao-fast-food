/**
 * Categories fetch functions for server and client-side data fetching
 */

import type { Category, ApiResponse } from "@/types/models";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const PUBLIC_DATA_REVALIDATE = 60; // 1 minute

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/api/categories`, {
    next: { revalidate: PUBLIC_DATA_REVALIDATE },
  });
  const result: ApiResponse<Category[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al cargar categorías");
  }

  return result.data;
}

export async function fetchCategory(id: string): Promise<Category> {
  const response = await fetch(`${API_URL}/api/categories/${id}`, {
    next: { revalidate: PUBLIC_DATA_REVALIDATE },
  });
  const result: ApiResponse<Category> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Categoría no encontrada");
  }

  return result.data;
}
