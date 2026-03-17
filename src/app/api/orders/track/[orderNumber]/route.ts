import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        orderNumber: true,
        status: true,
        type: true,
        paymentMethod: true,
        paymentStatus: true,
        customerName: true,
        notes: true,
        subtotal: true,
        total: true,
        createdAt: true,
        confirmedAt: true,
        preparingAt: true,
        readyAt: true,
        deliveredAt: true,
        cancelledAt: true,
        items: {
          select: {
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            product: {
              select: { name: true },
            },
            additions: {
              select: {
                addition: {
                  select: { name: true, price: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return notFoundResponse("Orden");
    }

    const tracking = {
      orderNumber: order.orderNumber,
      status: order.status,
      type: order.type,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      customerName: order.customerName,
      notes: order.notes,
      subtotal: order.subtotal,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      confirmedAt: order.confirmedAt?.toISOString() ?? null,
      preparingAt: order.preparingAt?.toISOString() ?? null,
      readyAt: order.readyAt?.toISOString() ?? null,
      deliveredAt: order.deliveredAt?.toISOString() ?? null,
      cancelledAt: order.cancelledAt?.toISOString() ?? null,
      items: order.items.map((item) => ({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        productName: item.product.name,
        additions: item.additions.map((a) => ({
          name: a.addition.name,
          price: a.addition.price,
        })),
      })),
    };

    return successResponse(tracking);
  } catch (error) {
    console.error("Track order error:", error);
    return serverErrorResponse();
  }
}
