"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchDailyReport } from "@/lib/fetch-functions/reports";

export function useDailyReport(date: string) {
  const {
    data: report,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.reports.daily(date),
    queryFn: () => fetchDailyReport(date),
    staleTime: 2 * 60 * 1000,
    enabled: !!date,
  });

  return {
    report,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}
