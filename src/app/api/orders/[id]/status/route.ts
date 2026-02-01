import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { updateOrderStatusSchema } from "@/lib/validations/order";
import {
  successResponse,
  notFoundResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-response";
import type { OrderStatus } from "@/types/models";

type Params = { params: Promise<{ id: string }> };

const STATUS_TIMESTAMP_MAP: Record<OrderStatus, string | null> = {
  pending: null,
  confirmed: "confirmedAt",
  preparing: "preparingAt",
  ready: "readyAt",
  delivered: "deliveredAt",
  cancelled: "cancelledAt",
};

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const staff = await requireStaff(request);
    if (!staff) {
      return unauthorizedResponse("Solo el personal puede actualizar el estado de órdenes");
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateOrderStatusSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const { status, adminNotes } = result.data;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return notFoundResponse("Orden");
    }

    const updateData: Record<string, unknown> = { status };

    const timestampField = STATUS_TIMESTAMP_MAP[status];
    if (timestampField) {
      updateData[timestampField] = new Date();
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            additions: true,
          },
        },
      },
    });

    return successResponse(order);
  } catch (error) {
    console.error("Update order status error:", error);
    return serverErrorResponse();
  }
}
