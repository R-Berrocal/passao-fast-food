import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createProductSchema } from "@/lib/validations/product";
import {
  successResponse,
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const isActive = searchParams.get("isActive");
    const isAvailable = searchParams.get("isAvailable");

    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== null) where.isActive = isActive === "true";
    if (isAvailable !== null) where.isAvailable = isAvailable === "true";

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    return successResponse(products);
  } catch (error) {
    console.error("Get products error:", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return unauthorizedResponse("Solo administradores pueden crear productos");
    }

    const body = await request.json();
    const result = createProductSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const product = await prisma.product.create({
      data: result.data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return createdResponse(product);
  } catch (error) {
    console.error("Create product error:", error);
    return serverErrorResponse();
  }
}
