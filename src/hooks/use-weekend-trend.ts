"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchWeekendTrend } from "@/lib/fetch-functions/dashboard";

export function useWeekendTrend() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.dashboard.weekendTrend(),
    queryFn: fetchWeekendTrend,
    staleTime: 60 * 1000,
  });

  return {
    trend: data,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}
