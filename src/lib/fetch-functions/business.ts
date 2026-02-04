/**
 * Business fetch functions for server and client-side data fetching
 */

import type { BusinessConfig, BusinessHours, ApiResponse } from "@/types/models";
import { getAuthHeaders } from "@/stores/use-auth-store";
import { getBaseUrl } from "@/lib/utils";

const PUBLIC_DATA_REVALIDATE = 60; // 1 minute

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

export async function fetchBusinessConfig(): Promise<BusinessConfig> {
  const response = await fetch(`${getBaseUrl()}/api/business/config`, {
    next: { revalidate: PUBLIC_DATA_REVALIDATE }, // Cache with revalidation
  });
  const result: ApiResponse<BusinessConfig> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al cargar configuración");
  }

  return result.data;
}

export async function fetchBusinessHours(): Promise<BusinessHours[]> {
  const response = await fetch(`${getBaseUrl()}/api/business/hours`, {
    next: { revalidate: PUBLIC_DATA_REVALIDATE }, // Cache with revalidation
  });
  const result: ApiResponse<BusinessHours[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al cargar horarios");
  }

  return result.data;
}

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

export async function updateBusinessConfig(
  data: Partial<BusinessConfig>
): Promise<BusinessConfig> {
  const response = await fetch(`${getBaseUrl()}/api/business/config`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<BusinessConfig> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al actualizar configuración");
  }

  return result.data;
}

export async function updateBusinessHours(
  data: BusinessHours[]
): Promise<BusinessHours[]> {
  const response = await fetch(`${getBaseUrl()}/api/business/hours`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<BusinessHours[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al actualizar horarios");
  }

  return result.data;
}
