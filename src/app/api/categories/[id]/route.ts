import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { updateCategorySchema } from "@/lib/validations/product";
import {
  successResponse,
  notFoundResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
  messageResponse,
  errorResponse,
} from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!category) {
      return notFoundResponse("Categoría");
    }

    return successResponse(category);
  } catch (error) {
    console.error("Get category error:", error);
    return serverErrorResponse();
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return unauthorizedResponse("Solo administradores pueden actualizar categorías");
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateCategorySchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return notFoundResponse("Categoría");
    }

    if (result.data.slug && result.data.slug !== existingCategory.slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: result.data.slug },
      });
      if (slugExists) {
        return errorResponse("Ya existe una categoría con este slug", 409);
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...result.data,
        image: result.data.image || null,
      },
    });

    return successResponse(category);
  } catch (error) {
    console.error("Update category error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return unauthorizedResponse("Solo administradores pueden eliminar categorías");
    }

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return notFoundResponse("Categoría");
    }

    if (category._count.products > 0) {
      return errorResponse(
        "No se puede eliminar una categoría con productos asociados",
        400
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return messageResponse("Categoría eliminada correctamente");
  } catch (error) {
    console.error("Delete category error:", error);
    return serverErrorResponse();
  }
}
