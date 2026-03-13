"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchDashboardStats } from "@/lib/fetch-functions/dashboard";

export function useDashboardStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: fetchDashboardStats,
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    stats: data,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
