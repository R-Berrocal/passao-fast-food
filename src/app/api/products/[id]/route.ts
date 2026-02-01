import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { updateProductSchema } from "@/lib/validations/product";
import {
  successResponse,
  notFoundResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
  messageResponse,
} from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
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

    if (!product) {
      return notFoundResponse("Producto");
    }

    return successResponse(product);
  } catch (error) {
    console.error("Get product error:", error);
    return serverErrorResponse();
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return unauthorizedResponse("Solo administradores pueden actualizar productos");
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateProductSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return notFoundResponse("Producto");
    }

    const product = await prisma.product.update({
      where: { id },
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

    return successResponse(product);
  } catch (error) {
    console.error("Update product error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return unauthorizedResponse("Solo administradores pueden eliminar productos");
    }

    const { id } = await params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return notFoundResponse("Producto");
    }

    await prisma.product.delete({
      where: { id },
    });

    return messageResponse("Producto eliminado correctamente");
  } catch (error) {
    console.error("Delete product error:", error);
    return serverErrorResponse();
  }
}
