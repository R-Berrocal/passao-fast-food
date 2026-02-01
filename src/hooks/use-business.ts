"use client";

import { useState, useEffect, useCallback } from "react";
import { getAuthHeaders } from "@/stores/use-auth-store";
import type { BusinessConfig, BusinessHours } from "@/types/models";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useBusinessConfig() {
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/business/config");
      const result: ApiResponse<BusinessConfig> = await response.json();

      if (result.success && result.data) {
        setConfig(result.data);
      } else {
        setError(result.error || "Error al cargar configuración");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = async (
    data: Partial<BusinessConfig>
  ): Promise<BusinessConfig | null> => {
    try {
      const response = await fetch("/api/business/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<BusinessConfig> = await response.json();

      if (result.success && result.data) {
        setConfig(result.data);
        return result.data;
      }

      setError(result.error || "Error al actualizar configuración");
      return null;
    } catch {
      setError("Error de conexión");
      return null;
    }
  };

  return {
    config,
    isLoading,
    error,
    refetch: fetchConfig,
    updateConfig,
    clearError: () => setError(null),
  };
}

export function useBusinessHours() {
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHours = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/business/hours");
      const result: ApiResponse<BusinessHours[]> = await response.json();

      if (result.success && result.data) {
        setHours(result.data);
      } else {
        setError(result.error || "Error al cargar horarios");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHours();
  }, [fetchHours]);

  const updateHours = async (
    data: BusinessHours[]
  ): Promise<BusinessHours[] | null> => {
    try {
      const response = await fetch("/api/business/hours", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<BusinessHours[]> = await response.json();

      if (result.success && result.data) {
        setHours(result.data);
        return result.data;
      }

      setError(result.error || "Error al actualizar horarios");
      return null;
    } catch {
      setError("Error de conexión");
      return null;
    }
  };

  return {
    hours,
    isLoading,
    error,
    refetch: fetchHours,
    updateHours,
    clearError: () => setError(null),
  };
}
