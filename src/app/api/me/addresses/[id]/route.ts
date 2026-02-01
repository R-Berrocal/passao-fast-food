import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { updateAddressSchema } from "@/lib/validations/address";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse("Debes iniciar sesión");
    }

    const { id } = await params;

    const address = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!address) {
      return notFoundResponse("Dirección no encontrada");
    }

    return successResponse(address);
  } catch (error) {
    console.error("Get address error:", error);
    return serverErrorResponse();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse("Debes iniciar sesión");
    }

    const { id } = await params;

    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingAddress) {
      return notFoundResponse("Dirección no encontrada");
    }

    const body = await request.json();
    const result = updateAddressSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    // If setting as default, unset other defaults
    if (result.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: result.data,
    });

    return successResponse(address);
  } catch (error) {
    console.error("Update address error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return unauthorizedResponse("Debes iniciar sesión");
    }

    const { id } = await params;

    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingAddress) {
      return notFoundResponse("Dirección no encontrada");
    }

    await prisma.address.delete({
      where: { id },
    });

    // If deleted address was default, set another as default
    if (existingAddress.isDefault) {
      const firstAddress = await prisma.address.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });

      if (firstAddress) {
        await prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return successResponse({ message: "Dirección eliminada" });
  } catch (error) {
    console.error("Delete address error:", error);
    return serverErrorResponse();
  }
}
