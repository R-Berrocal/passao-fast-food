"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  fetchBusinessConfig,
  fetchBusinessHours,
  updateBusinessConfig as updateBusinessConfigFn,
  updateBusinessHours as updateBusinessHoursFn,
} from "@/lib/fetch-functions-business";
import type { BusinessConfig, BusinessHours } from "@/types/models";

// ============================================================================
// Business Config Hook
// ============================================================================

export function useBusinessConfig() {
  const queryClient = useQueryClient();

  // Query for business config
  const { data: config = null, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.business.config(),
    queryFn: fetchBusinessConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes (critical data, fresher)
  });

  // Mutation for updating business config
  const updateConfigMutation = useMutation({
    mutationFn: (data: Partial<BusinessConfig>) => updateBusinessConfigFn(data),
    onSuccess: () => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.business.config() });
    },
  });

  const updateConfig = async (
    data: Partial<BusinessConfig>
  ): Promise<BusinessConfig | null> => {
    try {
      return await updateConfigMutation.mutateAsync(data);
    } catch {
      return null;
    }
  };

  return {
    config,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
    updateConfig,
    clearError: updateConfigMutation.reset,
  };
}

// ============================================================================
// Business Hours Hook
// ============================================================================

export function useBusinessHours() {
  const queryClient = useQueryClient();

  // Query for business hours
  const { data: hours = [], isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.business.hours(),
    queryFn: fetchBusinessHours,
    staleTime: 5 * 60 * 1000, // 5 minutes (critical data, fresher)
  });

  // Mutation for updating business hours
  const updateHoursMutation = useMutation({
    mutationFn: (data: BusinessHours[]) => updateBusinessHoursFn(data),
    onSuccess: () => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.business.hours() });
    },
  });

  const updateHours = async (
    data: BusinessHours[]
  ): Promise<BusinessHours[] | null> => {
    try {
      return await updateHoursMutation.mutateAsync(data);
    } catch {
      return null;
    }
  };

  return {
    hours,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
    updateHours,
    clearError: updateHoursMutation.reset,
  };
}
