import type { ApiResponse, OrderWithItems } from "@/types/models";
import { getAuthHeaders } from "@/stores/use-auth-store";
import { getBaseUrl } from "@/lib/utils";

export interface DashboardStats {
  todaySales: number;
  todayOrdersCount: number;
  pendingOrdersCount: number;
  preparingOrdersCount: number;
  completedTodayCount: number;
  activeProductsCount: number;
  customerCount: number;
  recentOrders: OrderWithItems[];
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
