import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { updateAdditionSchema } from "@/lib/validations/addition";
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

    const addition = await prisma.addition.findUnique({
      where: { id },
    });

    if (!addition) {
      return notFoundResponse("Adición");
    }

    return successResponse(addition);
  } catch (error) {
    console.error("Get addition error:", error);
    return serverErrorResponse();
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return unauthorizedResponse("Solo administradores pueden actualizar adiciones");
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateAdditionSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const existingAddition = await prisma.addition.findUnique({
      where: { id },
    });

    if (!existingAddition) {
      return notFoundResponse("Adición");
    }

    const addition = await prisma.addition.update({
      where: { id },
      data: {
        ...result.data,
        image: result.data.image || null,
      },
    });

    return successResponse(addition);
  } catch (error) {
    console.error("Update addition error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return unauthorizedResponse("Solo administradores pueden eliminar adiciones");
    }

    const { id } = await params;

    const existingAddition = await prisma.addition.findUnique({
      where: { id },
    });

    if (!existingAddition) {
      return notFoundResponse("Adición");
    }

    await prisma.addition.delete({
      where: { id },
    });

    return messageResponse("Adición eliminada correctamente");
  } catch (error) {
    console.error("Delete addition error:", error);
    return serverErrorResponse();
  }
}
