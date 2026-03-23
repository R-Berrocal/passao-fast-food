"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  fetchSupplies,
  createSupply as createSupplyFn,
  updateSupply as updateSupplyFn,
  deleteSupply as deleteSupplyFn,
} from "@/lib/fetch-functions/supplies";
import type { CreateSupplyInput, UpdateSupplyInput } from "@/lib/validations/supply";

export function useSupplies(date?: string) {
  const queryClient = useQueryClient();

  const {
    data: supplies = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.supplies.list(date),
    queryFn: () => fetchSupplies(date),
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSupplyInput) => createSupplyFn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.supplies.all(),
        refetchType: "all",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupplyInput }) =>
      updateSupplyFn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.supplies.all() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSupplyFn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.supplies.all() });
    },
  });

  const createSupply = async (data: CreateSupplyInput) => {
    try {
      return await createMutation.mutateAsync(data);
    } catch {
      return null;
    }
  };

  const updateSupply = async (id: string, data: UpdateSupplyInput) => {
    try {
      return await updateMutation.mutateAsync({ id, data });
    } catch {
      return null;
    }
  };

  const deleteSupply = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    supplies,
    isLoading,
    error: error ? (error as Error).message : null,
    createSupply,
    updateSupply,
    deleteSupply,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
