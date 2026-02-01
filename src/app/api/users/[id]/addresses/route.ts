import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { createAddressSchema } from "@/lib/validations/user";
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    if (currentUser.role !== "admin" && currentUser.id !== id) {
      return unauthorizedResponse("No tienes permiso para ver estas direcciones");
    }

    const addresses = await prisma.address.findMany({
      where: { userId: id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return successResponse(addresses);
  } catch (error) {
    console.error("Get addresses error:", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    if (currentUser.role !== "admin" && currentUser.id !== id) {
      return unauthorizedResponse("No tienes permiso para agregar direcciones");
    }

    const userExists = await prisma.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      return notFoundResponse("Usuario");
    }

    const body = await request.json();
    const result = createAddressSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    if (result.data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        ...result.data,
        userId: id,
      },
    });

    return createdResponse(address);
  } catch (error) {
    console.error("Create address error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get("addressId");

    if (!addressId) {
      return validationErrorResponse("El ID de la dirección es requerido");
    }

    const currentUser = await getCurrentUser(request);
    const admin = await requireAdmin(request);

    if (!currentUser && !admin) {
      return unauthorizedResponse();
    }

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      return notFoundResponse("Dirección");
    }

    if (address.userId !== id) {
      return notFoundResponse("Dirección");
    }

    if (!admin && currentUser?.id !== id) {
      return unauthorizedResponse("No tienes permiso para eliminar esta dirección");
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    return successResponse({ message: "Dirección eliminada correctamente" });
  } catch (error) {
    console.error("Delete address error:", error);
    return serverErrorResponse();
  }
}
