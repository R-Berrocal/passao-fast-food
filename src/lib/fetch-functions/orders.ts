/**
 * Orders fetch functions for server and client-side data fetching
 */

import type { Order, OrderWithItems, ApiResponse } from "@/types/models";
import { getAuthHeaders } from "@/stores/use-auth-store";
import { getBaseUrl } from "@/lib/utils";


// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

interface FetchOrdersOptions {
  status?: string;
  type?: string;
  date?: string;
}

export async function fetchOrders(options?: FetchOrdersOptions): Promise<OrderWithItems[]> {
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.type) params.set("type", options.type);
  if (options?.date) params.set("date", options.date);

  const response = await fetch(`${getBaseUrl()}/api/orders?${params.toString()}`, {
    cache: "no-store", // Orders are dynamic, no cache
    headers: getAuthHeaders(),
  });
  const result: ApiResponse<OrderWithItems[]> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al cargar órdenes");
  }

  return result.data;
}

export async function fetchOrder(id: string): Promise<Order> {
  const response = await fetch(`${getBaseUrl()}/api/orders/${id}`, {
    cache: "no-store", // Orders are dynamic, no cache
    headers: getAuthHeaders(),
  });
  const result: ApiResponse<Order> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Orden no encontrada");
  }

  return result.data;
}

// ============================================================================
// MUTATION FUNCTIONS
// ============================================================================

export async function updateOrderStatus(
  id: string,
  status: string,
  adminNotes?: string
): Promise<Order> {
  const response = await fetch(`${getBaseUrl()}/api/orders/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status, adminNotes }),
  });

  const result: ApiResponse<Order> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al actualizar estado");
  }

  return result.data;
}

export async function createOrder(data: unknown): Promise<Order> {
  const response = await fetch(`${getBaseUrl()}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<Order> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al crear orden");
  }

  return result.data;
}

export async function deleteOrder(id: string): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/api/orders/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  const result: ApiResponse<unknown> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Error al eliminar la orden");
  }
}

export async function updateOrder(
  id: string,
  data: {
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    deliveryAddress?: string;
    notes?: string;
    adminNotes?: string;
    paymentMethod?: string;
    paymentStatus?: string;
  }
): Promise<Order> {
  const response = await fetch(`${getBaseUrl()}/api/orders/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<Order> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al actualizar la orden");
  }

  return result.data;
}

export async function updateOrderItemAdditions(
  orderId: string,
  itemId: string,
  additions: { additionId: string }[]
): Promise<OrderWithItems> {
  const response = await fetch(
    `${getBaseUrl()}/api/orders/${orderId}/items/${itemId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ additions }),
    }
  );

  const result: ApiResponse<OrderWithItems> = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al actualizar adiciones del item");
  }

  return result.data;
}

export async function createManualOrder(data: unknown): Promise<Order> {
  const response = await fetch(`${getBaseUrl()}/api/admin/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<Order> = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al crear orden");
  }
  return result.data;
}
