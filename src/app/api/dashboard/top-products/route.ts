import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-response";
import { getTodayString } from "@/lib/date-utils";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return unauthorizedResponse();

    // Start and end of current month in Colombia timezone (UTC-5)
    const todayStr = getTodayString(); // "YYYY-MM-DD"
    const [year, month] = todayStr.split("-").map(Number);

    // Colombia midnight = 05:00 UTC
    const monthStart = new Date(`${year}-${String(month).padStart(2, "0")}-01T05:00:00.000Z`);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const monthEnd = new Date(`${nextYear}-${String(nextMonth).padStart(2, "0")}-01T05:00:00.000Z`);

    const items = await prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      where: {
        order: {
          status: { not: "cancelled" },
          createdAt: { gte: monthStart, lt: monthEnd },
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

    return successResponse({
      products,
      period: {
        from: `${year}-${String(month).padStart(2, "0")}-01`,
        to: todayStr,
      },
    });
  } catch (error) {
    console.error("Top products error:", error);
    return serverErrorResponse();
  }
}
