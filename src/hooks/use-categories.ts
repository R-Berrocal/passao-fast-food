"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  fetchCategories,
  fetchCategory,
  createCategory as createCategoryFn,
  updateCategory as updateCategoryFn,
  deleteCategory as deleteCategoryFn,
} from "@/lib/fetch-functions-categories";
import type { Category } from "@/types/models";

interface CategoryWithCount extends Category {
  _count: {
    products: number;
  };
}

export function useCategory(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.categories.detail(id!),
    queryFn: () => fetchCategory(id!) as Promise<CategoryWithCount>,
    enabled: !!id,
  });

  return {
    category: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
  };
}

export function useCategories() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => fetchCategories() as Promise<CategoryWithCount[]>,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Category>) =>
      createCategoryFn(data) as Promise<CategoryWithCount>,
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories.lists() });

      const previousCategories = queryClient.getQueryData<CategoryWithCount[]>(
        queryKeys.categories.list()
      );

      if (previousCategories) {
        const optimisticCategory: CategoryWithCount = {
          id: `temp-${Date.now()}`,
          name: newCategory.name || "",
          slug: newCategory.slug || "",
          description: newCategory.description,
          image: newCategory.image,
          displayOrder: newCategory.displayOrder || 0,
          isActive: newCategory.isActive ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { products: 0 },
        };

        queryClient.setQueryData<CategoryWithCount[]>(
          queryKeys.categories.list(),
          [...previousCategories, optimisticCategory]
        );
      }

      return { previousCategories };
    },
    onError: (_err, _newCategory, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(
          queryKeys.categories.list(),
          context.previousCategories
        );
      }
    },
    onSuccess: (newCategory) => {
      const previousCategories = queryClient.getQueryData<CategoryWithCount[]>(
        queryKeys.categories.list()
      );

      if (previousCategories) {
        const withoutTemp = previousCategories.filter(
          (c) => !c.id.startsWith("temp-")
        );
        queryClient.setQueryData<CategoryWithCount[]>(
          queryKeys.categories.list(),
          [...withoutTemp, newCategory]
        );
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      updateCategoryFn(id, data) as Promise<CategoryWithCount>,
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories.lists() });
      await queryClient.cancelQueries({
        queryKey: queryKeys.categories.detail(id),
      });

      const previousCategories = queryClient.getQueryData<CategoryWithCount[]>(
        queryKeys.categories.list()
      );
      const previousCategory = queryClient.getQueryData<CategoryWithCount>(
        queryKeys.categories.detail(id)
      );

      if (previousCategories) {
        queryClient.setQueryData<CategoryWithCount[]>(
          queryKeys.categories.list(),
          previousCategories.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
          )
        );
      }

      if (previousCategory) {
        queryClient.setQueryData<CategoryWithCount>(
          queryKeys.categories.detail(id),
          { ...previousCategory, ...data, updatedAt: new Date() }
        );
      }

      return { previousCategories, previousCategory };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(
          queryKeys.categories.list(),
          context.previousCategories
        );
      }
      if (context?.previousCategory) {
        queryClient.setQueryData(
          queryKeys.categories.detail(id),
          context.previousCategory
        );
      }
    },
    onSuccess: (updatedCategory) => {
      queryClient.setQueryData(
        queryKeys.categories.detail(updatedCategory.id),
        updatedCategory
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategoryFn(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories.lists() });

      const previousCategories = queryClient.getQueryData<CategoryWithCount[]>(
        queryKeys.categories.list()
      );

      if (previousCategories) {
        queryClient.setQueryData<CategoryWithCount[]>(
          queryKeys.categories.list(),
          previousCategories.filter((c) => c.id !== id)
        );
      }

      return { previousCategories };
    },
    onError: (_err, _id, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(
          queryKeys.categories.list(),
          context.previousCategories
        );
      }
    },
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.categories.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
    },
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    createCategory: async (data: Partial<Category>): Promise<CategoryWithCount | null> => {
      try {
        return await createMutation.mutateAsync(data);
      } catch {
        return null;
      }
    },
    updateCategory: async (
      id: string,
      data: Partial<Category>
    ): Promise<CategoryWithCount | null> => {
      try {
        return await updateMutation.mutateAsync({ id, data });
      } catch {
        return null;
      }
    },
    deleteCategory: async (id: string): Promise<boolean> => {
      try {
        await deleteMutation.mutateAsync(id);
        return true;
      } catch {
        return false;
      }
    },
    clearError: () => {
      createMutation.reset();
      updateMutation.reset();
      deleteMutation.reset();
    },
  };
}
