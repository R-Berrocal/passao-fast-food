import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api-response";

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
