"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchTopProducts } from "@/lib/fetch-functions/dashboard";

export function useTopProducts() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.topProducts(),
    queryFn: fetchTopProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes — changes less frequently
  });

  return {
    topProducts: data,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
