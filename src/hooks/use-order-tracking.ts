"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchOrderTracking } from "@/lib/fetch-functions/orders";

export function useOrderTracking(orderNumber: string) {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.orders.tracking(orderNumber),
    queryFn: () => fetchOrderTracking(orderNumber),
    staleTime: 30 * 1000,               // 30 segundos
    refetchInterval: 60 * 1000,         // polling cada 60s
    refetchIntervalInBackground: false,  // solo cuando la pestaña está activa
  });

  return { order: data, isLoading, error, refetch, isFetching };
}
