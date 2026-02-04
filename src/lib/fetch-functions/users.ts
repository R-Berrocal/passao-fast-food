/**
 * Users fetch functions for server and client-side data fetching
 */

import type { User, ApiResponse } from "@/types/models";
import { getAuthHeaders } from "@/stores/use-auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

interface FetchUsersOptions {
  role?: string;
  status?: string;
}

export async function fetchUsers(options?: FetchUsersOptions): Promise<User[]> {
  const params = new URLSearchParams();
  if (options?.role) params.set("role", options.role);
  if (options?.status) params.set("status", options.status);

  const response = await fetch(`${API_URL}/api/users?${params.toString()}`, {
    cache: "no-store", // Users are dynamic, no cache
    headers: getAuthHeaders(),
  });
  const result: ApiResponse<User[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al cargar usuarios");
  }

  return result.data;
}

export async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    cache: "no-store", // Users are dynamic, no cache
    headers: getAuthHeaders(),
  });
  const result: ApiResponse<User> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Usuario no encontrado");
  }

  return result.data;
}

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

export async function createUser(
  data: Partial<User> & { password?: string }
): Promise<User> {
  const response = await fetch(`${API_URL}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<User> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al crear usuario");
  }

  return result.data;
}

export async function updateUser(
  id: string,
  data: Partial<User> & { password?: string }
): Promise<User> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<User> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al actualizar usuario");
  }

  return result.data;
}

export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const result: ApiResponse<void> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Error al eliminar usuario");
  }
}
