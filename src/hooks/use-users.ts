"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuthHeaders } from "@/stores/use-auth-store";
import type { User, UserRole, UserStatus } from "@/types/models";

interface UserWithCount extends Omit<User, "password"> {
  _count: {
    orders: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface UseUsersOptions {
  role?: UserRole;
  status?: UserStatus;
}

export function useUsers(options: UseUsersOptions = {}) {
  const [users, setUsers] = useState<UserWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.role) params.set("role", options.role);
      if (options.status) params.set("status", options.status);

      const url = `/api/users${params.toString() ? `?${params}` : ""}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      const result: ApiResponse<UserWithCount[]> = await response.json();

      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        setError(result.error || "Error al cargar usuarios");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  }, [options.role, options.status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (
    data: Partial<User> & { password?: string }
  ): Promise<UserWithCount | null> => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<UserWithCount> = await response.json();

      if (result.success && result.data) {
        await fetchUsers();
        return result.data;
      }

      setError(result.error || "Error al crear usuario");
      return null;
    } catch {
      setError("Error de conexión");
      return null;
    }
  };

  const updateUser = async (
    id: string,
    data: Partial<User> & { password?: string }
  ): Promise<UserWithCount | null> => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<UserWithCount> = await response.json();

      if (result.success && result.data) {
        await fetchUsers();
        return result.data;
      }

      setError(result.error || "Error al actualizar usuario");
      return null;
    } catch {
      setError("Error de conexión");
      return null;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        return true;
      }

      setError(result.error || "Error al eliminar usuario");
      return false;
    } catch {
      setError("Error de conexión");
      return false;
    }
  };

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    clearError: () => setError(null),
  };
}

export function useUser(id: string | null) {
  const [user, setUser] = useState<UserWithCount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/users/${id}`, {
          headers: getAuthHeaders(),
        });
        const result: ApiResponse<UserWithCount> = await response.json();

        if (result.success && result.data) {
          setUser(result.data);
        } else {
          setError(result.error || "Usuario no encontrado");
        }
      } catch {
        setError("Error de conexión");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  return { user, isLoading, error };
}
