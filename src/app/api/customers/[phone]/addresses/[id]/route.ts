import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { phoneSchema } from "@/lib/validations/customer";
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
  errorResponse,
} from "@/lib/api-response";

type RouteContext = {
  params: Promise<{ phone: string; id: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { phone, id } = await context.params;
    const phoneResult = phoneSchema.safeParse(phone);

    if (!phoneResult.success) {
      return validationErrorResponse("Número de teléfono inválido");
    }

    const customer = await prisma.user.findUnique({
      where: { phone: phoneResult.data },
      select: { id: true },
    });

    if (!customer) {
      return notFoundResponse("Cliente");
    }

    // Verificar que la dirección pertenece al cliente
    const address = await prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      return notFoundResponse("Dirección");
    }

    if (address.userId !== customer.id) {
      return errorResponse("No tienes permiso para eliminar esta dirección", 403);
    }

    // Eliminar la dirección
    await prisma.address.delete({
      where: { id },
    });

    // Si era la dirección por defecto, establecer otra como default
    if (address.isDefault) {
      const firstAddress = await prisma.address.findFirst({
        where: { userId: customer.id },
        orderBy: { createdAt: "desc" },
      });

      if (firstAddress) {
        await prisma.address.update({
          where: { id: firstAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("Delete address error:", error);
    return serverErrorResponse();
  }
}
