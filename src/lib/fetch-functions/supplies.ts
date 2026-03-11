import type { SupplyPurchase, ApiResponse } from "@/types/models";
import { getAuthHeaders } from "@/stores/use-auth-store";
import { getBaseUrl } from "@/lib/utils";
import type { CreateSupplyInput } from "@/lib/validations/supply";

export async function fetchSupplies(date?: string): Promise<SupplyPurchase[]> {
  const params = date ? `?date=${date}` : "";
  const response = await fetch(`${getBaseUrl()}/api/supplies${params}`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });
  const result: ApiResponse<SupplyPurchase[]> = await response.json();
  if (!result.success || !result.data) throw new Error(result.error || "Error al cargar insumos");
  return result.data;
}

export async function createSupply(data: CreateSupplyInput): Promise<SupplyPurchase> {
  const response = await fetch(`${getBaseUrl()}/api/supplies`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(data),
  });
  const result: ApiResponse<SupplyPurchase> = await response.json();
  if (!result.success || !result.data) throw new Error(result.error || "Error al crear compra");
  return result.data;
}

export async function deleteSupply(id: string): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/api/supplies/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const result: ApiResponse<unknown> = await response.json();
  if (!result.success) throw new Error(result.error || "Error al eliminar compra");
}
