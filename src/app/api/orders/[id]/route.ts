import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff, getCurrentUser } from "@/lib/auth";
import {
  successResponse,
  notFoundResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            additions: true,
            product: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: true,
      },
    });

    if (!order) {
      return notFoundResponse("Orden");
    }

    const currentUser = await getCurrentUser(request);
    const isStaff = currentUser?.role === "admin" || currentUser?.role === "staff";
    const isOwner = order.userId && currentUser?.id === order.userId;

    if (!isStaff && !isOwner) {
      return unauthorizedResponse("No tienes permiso para ver esta orden");
    }

    return successResponse(order);
  } catch (error) {
    console.error("Get order error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const staff = await requireStaff(request);
    if (!staff) {
      return unauthorizedResponse("Solo el personal puede eliminar órdenes");
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return notFoundResponse("Orden");
    }

    await prisma.order.delete({
      where: { id },
    });

    return successResponse({ message: "Orden eliminada correctamente" });
  } catch (error) {
    console.error("Delete order error:", error);
    return serverErrorResponse();
  }
}
