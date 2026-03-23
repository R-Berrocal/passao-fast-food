import type { DailyReport, ApiResponse } from "@/types/models";
import { getAuthHeaders } from "@/stores/use-auth-store";
import { getBaseUrl } from "@/lib/utils";

export async function fetchDailyReport(startDate: string, endDate?: string): Promise<DailyReport> {
  const params = new URLSearchParams({ date: startDate });
  if (endDate && endDate !== startDate) params.set("endDate", endDate);
  const response = await fetch(`${getBaseUrl()}/api/reports/daily?${params.toString()}`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });
  const result: ApiResponse<DailyReport> = await response.json();
  if (!result.success || !result.data) throw new Error(result.error || "Error al cargar reporte");
  return result.data;
}
