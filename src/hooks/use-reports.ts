"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { fetchDailyReport } from "@/lib/fetch-functions/reports";

export function useDailyReport(startDate: string, endDate: string) {
  const rangeEndDate = endDate !== startDate ? endDate : undefined;

  const {
    data: report,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.reports.daily(startDate, rangeEndDate),
    queryFn: () => fetchDailyReport(startDate, rangeEndDate),
    staleTime: 2 * 60 * 1000,
    enabled: !!startDate,
  });

  return {
    report,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}
