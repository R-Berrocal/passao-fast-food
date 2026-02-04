/**
 * Server-side fetch functions for prefetching data in Server Components
 * These functions are used for SSR/ISR with TanStack Query prefetchQuery
 */

import type { Addition, Product, Category, Order, User } from "@/types/models";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ============================================================================
// ADDITIONS
// ============================================================================

export async function fetchAdditions(
  showAll: boolean = false
): Promise<Addition[]> {
  const params = new URLSearchParams();
  if (showAll) params.set("all", "true");

  const response = await fetch(`${API_URL}/api/additions?${params.toString()}`, {
    cache: "no-store",
  });
  const result: ApiResponse<Addition[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al cargar adiciones");
  }

  return result.data;
}

export async function fetchAddition(id: string): Promise<Addition> {
  const response = await fetch(`${API_URL}/api/additions/${id}`, {
    cache: "no-store",
  });
  const result: ApiResponse<Addition> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Adición no encontrada");
  }

  return result.data;
}

// ============================================================================
// PRODUCTS
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
    cache: "no-store",
  });
  const result: ApiResponse<Product[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al cargar productos");
  }

  return result.data;
}

export async function fetchProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    cache: "no-store",
  });
  const result: ApiResponse<Product> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Producto no encontrado");
  }

  return result.data;
}

// ============================================================================
// CATEGORIES
// ============================================================================

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/api/categories`, {
    cache: "no-store",
  });
  const result: ApiResponse<Category[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al cargar categorías");
  }

  return result.data;
}

export async function fetchCategory(id: string): Promise<Category> {
  const response = await fetch(`${API_URL}/api/categories/${id}`, {
    cache: "no-store",
  });
  const result: ApiResponse<Category> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Categoría no encontrada");
  }

  return result.data;
}

// ============================================================================
// ORDERS (require authentication)
// ============================================================================

interface FetchOrdersOptions {
  status?: string;
  type?: string;
  date?: string;
  token?: string; // Bearer token for authentication
}

export async function fetchOrders(options?: FetchOrdersOptions): Promise<Order[]> {
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.type) params.set("type", options.type);
  if (options?.date) params.set("date", options.date);

  const headers: HeadersInit = {};
  if (options?.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_URL}/api/orders?${params.toString()}`, {
    cache: "no-store",
    headers,
  });
  const result: ApiResponse<Order[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al cargar órdenes");
  }

  return result.data;
}

export async function fetchOrder(id: string, token?: string): Promise<Order> {
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/orders/${id}`, {
    cache: "no-store",
    headers,
  });
  const result: ApiResponse<Order> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Orden no encontrada");
  }

  return result.data;
}

// ============================================================================
// USERS (require authentication)
// ============================================================================

interface FetchUsersOptions {
  role?: string;
  status?: string;
  token?: string; // Bearer token for authentication
}

export async function fetchUsers(options?: FetchUsersOptions): Promise<User[]> {
  const params = new URLSearchParams();
  if (options?.role) params.set("role", options.role);
  if (options?.status) params.set("status", options.status);

  const headers: HeadersInit = {};
  if (options?.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_URL}/api/users?${params.toString()}`, {
    cache: "no-store",
    headers,
  });
  const result: ApiResponse<User[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al cargar usuarios");
  }

  return result.data;
}

export async function fetchUser(id: string, token?: string): Promise<User> {
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/users/${id}`, {
    cache: "no-store",
    headers,
  });
  const result: ApiResponse<User> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Usuario no encontrado");
  }

  return result.data;
}
