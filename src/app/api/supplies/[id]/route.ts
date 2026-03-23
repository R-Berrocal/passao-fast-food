import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
  errorResponse,
} from "@/lib/api-response";
import { updateSupplySchema } from "@/lib/validations/supply";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await requireStaff(request);
    if (!staff) return unauthorizedResponse();

    const { id } = await params;
    const existing = await prisma.supplyPurchase.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Compra de insumo");

    const body = await request.json();
    const parsed = updateSupplySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0].message, 400);
    }

    const updated = await prisma.supplyPurchase.update({
      where: { id },
      data: parsed.data,
    });
    return successResponse(updated);
  } catch (error) {
    console.error("Update supply error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const staff = await requireStaff(request);
    if (!staff) return unauthorizedResponse();

    const { id } = await params;
    const existing = await prisma.supplyPurchase.findUnique({ where: { id } });
    if (!existing) return notFoundResponse("Compra de insumo");

    await prisma.supplyPurchase.delete({ where: { id } });
    return successResponse({ id });
  } catch (error) {
    console.error("Delete supply error:", error);
    return serverErrorResponse();
  }
}
