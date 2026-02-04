/**
 * Additions fetch functions for server and client-side data fetching
 */

import type { Addition, ApiResponse } from "@/types/models";
import { getAuthHeaders } from "@/stores/use-auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const PUBLIC_DATA_REVALIDATE = 60; // 1 minute

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

export async function fetchAdditions(
  showAll: boolean = false
): Promise<Addition[]> {
  const params = new URLSearchParams();
  if (showAll) params.set("all", "true");

  const response = await fetch(`${API_URL}/api/additions?${params.toString()}`, {
    next: { revalidate: PUBLIC_DATA_REVALIDATE },
  });
  const result: ApiResponse<Addition[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al cargar adiciones");
  }

  return result.data;
}

export async function fetchAddition(id: string): Promise<Addition> {
  const response = await fetch(`${API_URL}/api/additions/${id}`, {
    next: { revalidate: PUBLIC_DATA_REVALIDATE },
  });
  const result: ApiResponse<Addition> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Adición no encontrada");
  }

  return result.data;
}

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

export async function createAddition(data: Partial<Addition>): Promise<Addition> {
  const response = await fetch(`${API_URL}/api/additions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<Addition> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al crear adición");
  }

  return result.data;
}

export async function updateAddition(
  id: string,
  data: Partial<Addition>
): Promise<Addition> {
  const response = await fetch(`${API_URL}/api/additions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<Addition> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al actualizar adición");
  }

  return result.data;
}

export async function deleteAddition(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/additions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const result: ApiResponse<void> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Error al eliminar adición");
  }
}
