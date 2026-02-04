"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  fetchUsers,
  fetchUser,
  createUser as createUserFn,
  updateUser as updateUserFn,
  deleteUser as deleteUserFn,
} from "@/lib/fetch-functions/users";
import type { User, UserRole, UserStatus } from "@/types/models";

interface UserWithCount extends Omit<User, "password"> {
  _count: {
    orders: number;
  };
}

interface UseUsersOptions {
  role?: UserRole;
  status?: UserStatus;
}

// ============================================================================
// Users List Hook
// ============================================================================

export function useUsers(options: UseUsersOptions = {}) {
  const queryClient = useQueryClient();

  // Query for users list
  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.users.list(options),
    queryFn: () => fetchUsers(options) as Promise<UserWithCount[]>,
    staleTime: 5 * 60 * 1000, // 5 minutes (critical data, fresher)
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<User> & { password?: string }) =>
      createUserFn(data) as Promise<UserWithCount>,
    onSuccess: () => {
      // Invalidate all users queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> & { password?: string } }) =>
      updateUserFn(id, data) as Promise<UserWithCount>,
    onSuccess: () => {
      // Invalidate all users queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUserFn(id),
    onSuccess: () => {
      // Invalidate all users queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
  });

  const createUser = async (
    data: Partial<User> & { password?: string }
  ): Promise<UserWithCount | null> => {
    try {
      return await createMutation.mutateAsync(data);
    } catch {
      return null;
    }
  };

  const updateUser = async (
    id: string,
    data: Partial<User> & { password?: string }
  ): Promise<UserWithCount | null> => {
    try {
      return await updateMutation.mutateAsync({ id, data });
    } catch {
      return null;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    users,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
    createUser,
    updateUser,
    deleteUser,
    clearError: () => {
      createMutation.reset();
      updateMutation.reset();
      deleteMutation.reset();
    },
  };
}

// ============================================================================
// Single User Hook
// ============================================================================

export function useUser(id: string | null) {
  const query = useQuery({
    queryKey: queryKeys.users.detail(id!),
    queryFn: () => fetchUser(id!) as Promise<UserWithCount>,
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes (critical data, fresher)
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
  };
}
