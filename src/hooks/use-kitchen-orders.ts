"use client";

import { useQuery } from "@tanstack/react-query";
import type { OrderWithItems, ApiResponse } from "@/types/models";

async function fetchKitchenOrders(): Promise<OrderWithItems[]> {
  const response = await fetch("/api/kitchen/orders", { cache: "no-store" });
  const result: ApiResponse<OrderWithItems[]> = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error || "Error al cargar pedidos de cocina");
  }
  return result.data;
}

export function useKitchenOrders() {
  const query = useQuery({
    queryKey: ["kitchen", "orders"],
    queryFn: fetchKitchenOrders,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
  });

  return {
    orders: query.data ?? [],
    isLoading: query.isLoading,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}
