"use client";

import { useState, useCallback } from "react";
import { useAuthStore, getAuthHeaders } from "@/stores/use-auth-store";
import type { LoginInput, RegisterInput } from "@/lib/validations/auth";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: "admin" | "staff" | "customer";
  };
  token: string;
}

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, login, logout, updateUser } =
    useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = useCallback(
    async (data: LoginInput): Promise<boolean> => {
      setError(null);
      setIsSubmitting(true);

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result: ApiResponse<AuthResponse> = await response.json();

        if (!result.success || !result.data) {
          setError(result.error || "Error al iniciar sesión");
          return false;
        }

        login(result.data.user, result.data.token);
        return true;
      } catch {
        setError("Error de conexión");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [login]
  );

  const handleRegister = useCallback(
    async (data: RegisterInput): Promise<boolean> => {
      setError(null);
      setIsSubmitting(true);

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result: ApiResponse<AuthResponse> = await response.json();

        if (!result.success || !result.data) {
          setError(result.error || "Error al registrarse");
          return false;
        }

        login(result.data.user, result.data.token);
        return true;
      } catch {
        setError("Error de conexión");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [login]
  );

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch("/api/auth/me", {
        headers: getAuthHeaders(),
      });

      const result: ApiResponse<{ user: AuthResponse["user"] }> =
        await response.json();

      if (result.success && result.data) {
        updateUser(result.data.user);
      } else {
        logout();
      }
    } catch {
      logout();
    }
  }, [token, updateUser, logout]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isSubmitting,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser,
    clearError: () => setError(null),
  };
}
