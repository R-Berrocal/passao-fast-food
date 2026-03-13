import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { z } from "zod";
import {
  successResponse,
  notFoundResponse,
  unauthorizedResponse,
  validationErrorResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

type Params = { params: Promise<{ id: string; itemId: string }> };

const updateItemAdditionsSchema = z.object({
  additions: z.array(z.object({ additionId: z.string() })),
});

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const staff = await requireStaff(request);
    if (!staff) {
      return unauthorizedResponse("Solo el personal puede editar items de órdenes");
    }

    const { id: orderId, itemId } = await params;

    const body = await request.json();
    const result = updateItemAdditionsSchema.safeParse(body);
    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const { additions } = result.data;

    // Verify the order item belongs to the order
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: itemId },
    });

    if (!orderItem || orderItem.orderId !== orderId) {
      return notFoundResponse("Item de la orden");
    }

    // Validate additions if any provided
    let additionRecords: { id: string; name: string; price: number }[] = [];
    if (additions.length > 0) {
      const additionIds = additions.map((a) => a.additionId);
      additionRecords = await prisma.addition.findMany({
        where: { id: { in: additionIds }, isActive: true },
        select: { id: true, name: true, price: true },
      });
      if (additionRecords.length !== additionIds.length) {
        return errorResponse("Algunas adiciones no están disponibles");
      }
    }

    // Recalculate item total price
    const additionsTotal = additionRecords.reduce((sum, a) => sum + a.price, 0);
    const newItemTotal = (orderItem.unitPrice + additionsTotal) * orderItem.quantity;

    // Update in transaction
    await prisma.$transaction([
      prisma.orderItemAddition.deleteMany({ where: { orderItemId: itemId } }),
      ...(additionRecords.length > 0
        ? [
            prisma.orderItemAddition.createMany({
              data: additionRecords.map((a) => ({
                orderItemId: itemId,
                additionId: a.id,
                additionName: a.name,
                price: a.price,
              })),
            }),
          ]
        : []),
      prisma.orderItem.update({
        where: { id: itemId },
        data: { totalPrice: newItemTotal },
      }),
    ]);

    // Recalculate order total
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return notFoundResponse("Orden");

    const allItems = await prisma.orderItem.findMany({ where: { orderId } });
    const newSubtotal = allItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const newTotal = newSubtotal + order.deliveryFee;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { subtotal: newSubtotal, total: newTotal },
      include: { items: { include: { additions: true } } },
    });

    return successResponse(updatedOrder);
  } catch (error) {
    console.error("Update order item additions error:", error);
    return serverErrorResponse();
  }
}
