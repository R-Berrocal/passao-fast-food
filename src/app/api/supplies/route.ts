import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { createSupplySchema } from "@/lib/validations/supply";
import {
  successResponse,
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const staff = await requireStaff(request);
    if (!staff) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    const where: Record<string, unknown> = {};
    if (dateParam) {
      where.date = { equals: new Date(dateParam) };
    }

    const supplies = await prisma.supplyPurchase.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return successResponse(supplies);
  } catch (error) {
    console.error("Get supplies error:", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const staff = await requireStaff(request);
    if (!staff) return unauthorizedResponse();

    const body = await request.json();
    const result = createSupplySchema.safeParse(body);
    if (!result.success) return validationErrorResponse(result.error.issues[0].message);

    const supply = await prisma.supplyPurchase.create({ data: result.data });
    return createdResponse(supply);
  } catch (error) {
    console.error("Create supply error:", error);
    return serverErrorResponse();
  }
}
