import type { ApiResponse } from "@/types/models";
import { getAuthHeaders } from "@/stores/use-auth-store";
import { getBaseUrl } from "@/lib/utils";

export interface DashboardStats {
  todaySales: number;
  todayOrdersCount: number;
  cashToday: number;
  digitalToday: number;
  pendingOrdersCount: number;
  preparingOrdersCount: number;
  completedTodayCount: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${getBaseUrl()}/api/dashboard/stats`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });
  const result: ApiResponse<DashboardStats> = await response.json();
  if (!result.success || !result.data) throw new Error(result.error || "Error al cargar estadísticas");
  return result.data;
}

type DayStats = { sales: number; orders: number } | null;

interface WeekendDays {
  thursday: DayStats;
  friday: DayStats;
  saturday: DayStats;
  sunday: DayStats;
}

export interface WeekendTrend {
  lastWeekend: WeekendDays;
  thisWeekend: WeekendDays;
  thisThursday: string;
  lastThursday: string;
}

export interface TopProduct {
  productId: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

export interface TopProductsData {
  products: TopProduct[];
}

export async function fetchWeekendTrend(): Promise<WeekendTrend> {
  const response = await fetch(`${getBaseUrl()}/api/dashboard/weekend-trend`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });
  const result: ApiResponse<WeekendTrend> = await response.json();
  if (!result.success || !result.data) throw new Error(result.error || "Error al cargar tendencia");
  return result.data;
}

export async function fetchTopProducts(): Promise<TopProductsData> {
  const response = await fetch(`${getBaseUrl()}/api/dashboard/top-products`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });
  const result: ApiResponse<TopProductsData> = await response.json();
  if (!result.success || !result.data) throw new Error(result.error || "Error al cargar top productos");
  return result.data;
}
