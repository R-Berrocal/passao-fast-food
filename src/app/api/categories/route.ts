import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createCategorySchema } from "@/lib/validations/product";
import {
  successResponse,
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
  errorResponse,
} from "@/lib/api-response";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return successResponse(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return unauthorizedResponse("Solo administradores pueden crear categorías");
    }

    const body = await request.json();
    const result = createCategorySchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const existingCategory = await prisma.category.findUnique({
      where: { slug: result.data.slug },
    });

    if (existingCategory) {
      return errorResponse("Ya existe una categoría con este slug", 409);
    }

    const category = await prisma.category.create({
      data: {
        ...result.data,
        image: result.data.image || null,
      },
    });

    return createdResponse(category);
  } catch (error) {
    console.error("Create category error:", error);
    return serverErrorResponse();
  }
}
