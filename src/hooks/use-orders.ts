"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuthHeaders } from "@/stores/use-auth-store";
import type { Order, OrderStatus } from "@/types/models";
import type { CreateOrderInput } from "@/lib/validations/order";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  additions: {
    id: string;
    additionName: string;
    price: number;
  }[];
}

interface OrderWithItems extends Order {
  items: OrderItem[];
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface UseOrdersOptions {
  status?: OrderStatus;
  type?: "delivery" | "pickup";
  date?: string;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.status) params.set("status", options.status);
      if (options.type) params.set("type", options.type);
      if (options.date) params.set("date", options.date);

      const url = `/api/orders${params.toString() ? `?${params}` : ""}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      const result: ApiResponse<OrderWithItems[]> = await response.json();

      if (result.success && result.data) {
        setOrders(result.data);
      } else {
        setError(result.error || "Error al cargar órdenes");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  }, [options.status, options.type, options.date]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (
    id: string,
    status: OrderStatus,
    adminNotes?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status, adminNotes }),
      });

      const result: ApiResponse<OrderWithItems> = await response.json();

      if (result.success && result.data) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? result.data! : o))
        );
        return true;
      }

      setError(result.error || "Error al actualizar estado");
      return false;
    } catch {
      setError("Error de conexión");
      return false;
    }
  };

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
    updateOrderStatus,
    clearError: () => setError(null),
  };
}

export function useCreateOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (
    data: CreateOrderInput
  ): Promise<OrderWithItems | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<OrderWithItems> = await response.json();

      if (result.success && result.data) {
        return result.data;
      }

      setError(result.error || "Error al crear orden");
      return null;
    } catch {
      setError("Error de conexión");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createOrder,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
