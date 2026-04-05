import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return unauthorizedResponse();

    const items = await prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      where: {
        order: {
          status: { not: "cancelled" },
        },
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    const products = items.map((item) => ({
      productId: item.productId,
      name: item.productName,
      unitsSold: item._sum.quantity ?? 0,
      revenue: item._sum.totalPrice ?? 0,
    }));

    return successResponse({ products });
  } catch (error) {
    console.error("Top products error:", error);
    return serverErrorResponse();
  }
}
