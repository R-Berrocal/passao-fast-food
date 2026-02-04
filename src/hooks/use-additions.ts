"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  fetchAdditions,
  fetchAddition,
  createAddition as createAdditionFn,
  updateAddition as updateAdditionFn,
  deleteAddition as deleteAdditionFn,
} from "@/lib/fetch-functions/additions";
import type { Addition } from "@/types/models";

export function useAddition(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.additions.detail(id!),
    queryFn: () => fetchAddition(id!),
    enabled: !!id,
  });

  return {
    addition: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
  };
}

interface UseAdditionsOptions {
  showAll?: boolean;
}

export function useAdditions(options: UseAdditionsOptions = {}) {
  const { showAll = false } = options;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.additions.list({ showAll }),
    queryFn: () => fetchAdditions(showAll),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Addition>) => createAdditionFn(data),
    onMutate: async (newAddition) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.additions.lists() });

      // Snapshot previous value
      const previousAdditions = queryClient.getQueryData<Addition[]>(
        queryKeys.additions.list({ showAll })
      );

      // Optimistically update with temporary ID
      if (previousAdditions) {
        const optimisticAddition: Addition = {
          id: `temp-${Date.now()}`,
          name: newAddition.name || "",
          price: newAddition.price || 0,
          image: newAddition.image || null,
          isActive: newAddition.isActive ?? true,
          displayOrder: newAddition.displayOrder || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Addition;

        queryClient.setQueryData<Addition[]>(
          queryKeys.additions.list({ showAll }),
          [...previousAdditions, optimisticAddition]
        );
      }

      return { previousAdditions };
    },
    onError: (_err, _newAddition, context) => {
      // Rollback on error
      if (context?.previousAdditions) {
        queryClient.setQueryData(
          queryKeys.additions.list({ showAll }),
          context.previousAdditions
        );
      }
    },
    onSuccess: (newAddition) => {
      // Replace temp addition with real one
      const previousAdditions = queryClient.getQueryData<Addition[]>(
        queryKeys.additions.list({ showAll })
      );

      if (previousAdditions) {
        const withoutTemp = previousAdditions.filter(
          (a) => !a.id.startsWith("temp-")
        );
        queryClient.setQueryData<Addition[]>(
          queryKeys.additions.list({ showAll }),
          [...withoutTemp, newAddition]
        );
      }

      // Invalidate all addition queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.additions.lists() });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Addition> }) =>
      updateAdditionFn(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.additions.lists() });
      await queryClient.cancelQueries({
        queryKey: queryKeys.additions.detail(id),
      });

      // Snapshot previous values
      const previousAdditions = queryClient.getQueryData<Addition[]>(
        queryKeys.additions.list({ showAll })
      );
      const previousAddition = queryClient.getQueryData<Addition>(
        queryKeys.additions.detail(id)
      );

      // Optimistically update list
      if (previousAdditions) {
        queryClient.setQueryData<Addition[]>(
          queryKeys.additions.list({ showAll }),
          previousAdditions.map((a) =>
            a.id === id ? { ...a, ...data, updatedAt: new Date() } : a
          )
        );
      }

      // Optimistically update detail
      if (previousAddition) {
        queryClient.setQueryData<Addition>(queryKeys.additions.detail(id), {
          ...previousAddition,
          ...data,
          updatedAt: new Date(),
        });
      }

      return { previousAdditions, previousAddition };
    },
    onError: (_err, { id }, context) => {
      // Rollback on error
      if (context?.previousAdditions) {
        queryClient.setQueryData(
          queryKeys.additions.list({ showAll }),
          context.previousAdditions
        );
      }
      if (context?.previousAddition) {
        queryClient.setQueryData(
          queryKeys.additions.detail(id),
          context.previousAddition
        );
      }
    },
    onSuccess: (updatedAddition) => {
      // Update cache with server response
      queryClient.setQueryData(
        queryKeys.additions.detail(updatedAddition.id),
        updatedAddition
      );

      // Invalidate all lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.additions.lists() });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdditionFn(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.additions.lists() });

      // Snapshot previous value
      const previousAdditions = queryClient.getQueryData<Addition[]>(
        queryKeys.additions.list({ showAll })
      );

      // Optimistically remove from list
      if (previousAdditions) {
        queryClient.setQueryData<Addition[]>(
          queryKeys.additions.list({ showAll }),
          previousAdditions.filter((a) => a.id !== id)
        );
      }

      return { previousAdditions };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousAdditions) {
        queryClient.setQueryData(
          queryKeys.additions.list({ showAll }),
          context.previousAdditions
        );
      }
    },
    onSuccess: (_data, id) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: queryKeys.additions.detail(id) });

      // Invalidate all lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.additions.lists() });
    },
  });

  return {
    additions: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    createAddition: async (data: Partial<Addition>): Promise<Addition | null> => {
      try {
        return await createMutation.mutateAsync(data);
      } catch {
        return null;
      }
    },
    updateAddition: async (
      id: string,
      data: Partial<Addition>
    ): Promise<Addition | null> => {
      try {
        return await updateMutation.mutateAsync({ id, data });
      } catch {
        return null;
      }
    },
    deleteAddition: async (id: string): Promise<boolean> => {
      try {
        await deleteMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    clearError: () => {
      // Clear error by resetting mutations
      createMutation.reset();
      updateMutation.reset();
      deleteMutation.reset();
    },
  };
}
