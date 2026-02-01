"use client";

import { useEffect, useRef } from "react";
import { useAuthStore, getAuthHeaders } from "@/stores/use-auth-store";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { token, logout, setLoading, login } = useAuthStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const verifyToken = async () => {
      const storedToken = useAuthStore.getState().token;

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: getAuthHeaders(),
        });

        const result = await response.json();

        if (result.success && result.data?.user) {
          login(result.data.user, storedToken);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    };

    verifyToken();
  }, [token, logout, setLoading, login]);

  return <>{children}</>;
}
