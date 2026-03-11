"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  fetchOrders,
  updateOrderStatus as updateOrderStatusFn,
  deleteOrder as deleteOrderFn,
  updateOrder as updateOrderFn,
  createOrder as createOrderFn,
  createManualOrder as createManualOrderFn,
} from "@/lib/fetch-functions/orders";
import type { OrderStatus } from "@/types/models";
import type { CreateOrderInput } from "@/lib/validations/order";

interface UseOrdersOptions {
  status?: OrderStatus;
  type?: "delivery" | "pickup";
  date?: string;
}

// ============================================================================
// Main Hook
// ============================================================================

export function useOrders(options: UseOrdersOptions = {}) {
  const queryClient = useQueryClient();

  // Query for orders list
  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.orders.list(options),
    queryFn: () => fetchOrders(options),
    staleTime: 5 * 60 * 1000, // 5 minutes (fresher data for orders)
  });

  // Mutation for updating order status
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      adminNotes,
    }: {
      id: string;
      status: OrderStatus;
      adminNotes?: string;
    }) => {
      return updateOrderStatusFn(id, status, adminNotes);
    },
    onSuccess: () => {
      // Invalidate all orders queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
    },
  });

  // Mutation for deleting an order
  const deleteOrderMutation = useMutation({
    mutationFn: (id: string) => deleteOrderFn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
    },
  });

  const deleteOrder = async (id: string): Promise<boolean> => {
    try {
      await deleteOrderMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  // Mutation for updating order details
  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateOrderFn>[1] }) =>
      updateOrderFn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
    },
  });

  const updateOrder = async (
    id: string,
    data: Parameters<typeof updateOrderFn>[1]
  ): Promise<boolean> => {
    try {
      await updateOrderMutation.mutateAsync({ id, data });
      return true;
    } catch {
      return false;
    }
  };

  const updateOrderStatus = async (
    id: string,
    status: OrderStatus,
    adminNotes?: string
  ): Promise<boolean> => {
    try {
      await updateOrderStatusMutation.mutateAsync({ id, status, adminNotes });
      return true;
    } catch {
      return false;
    }
  };

  return {
    orders,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
    updateOrderStatus,
    deleteOrder,
    updateOrder,
    clearError: () => {}, // No-op for API consistency
  };
}

// ============================================================================
// Create Order Hook
// ============================================================================

export function useCreateOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateOrderInput) => {
      return createOrderFn(data);
    },
    onSuccess: () => {
      // Invalidate all orders queries to include the new order
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
    },
  });

  const createOrder = async (data: CreateOrderInput) => {
    try {
      return await mutation.mutateAsync(data);
    } catch {
      return null;
    }
  };

  return {
    createOrder,
    isLoading: mutation.isPending,
    error: mutation.error ? (mutation.error as Error).message : null,
    clearError: mutation.reset,
  };
}

// ============================================================================
// Create Manual Order Hook (Admin)
// ============================================================================

export function useCreateManualOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: unknown) => {
      return createManualOrderFn(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all() });
    },
  });

  const createManualOrder = async (data: unknown) => {
    try {
      return await mutation.mutateAsync(data);
    } catch {
      return null;
    }
  };

  return {
    createManualOrder,
    isLoading: mutation.isPending,
    error: mutation.error ? (mutation.error as Error).message : null,
    clearError: mutation.reset,
  };
}
