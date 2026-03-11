import type { DailyReport, ApiResponse } from "@/types/models";
import { getAuthHeaders } from "@/stores/use-auth-store";
import { getBaseUrl } from "@/lib/utils";

export async function fetchDailyReport(date: string): Promise<DailyReport> {
  const response = await fetch(`${getBaseUrl()}/api/reports/daily?date=${date}`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });
  const result: ApiResponse<DailyReport> = await response.json();
  if (!result.success || !result.data) throw new Error(result.error || "Error al cargar reporte");
  return result.data;
}
