import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-response";
import { getTodayString, getColombiaDateRange } from "@/lib/date-utils";

export async function GET(request: NextRequest) {
  try {
    const staff = await requireStaff(request);
    if (!staff) return unauthorizedResponse();

    const { startUTC: todayStart, endUTC: todayEnd } = getColombiaDateRange(getTodayString());

    const todayOrders = await prisma.order.findMany({
      where: {
        status: { not: "cancelled" },
        createdAt: { gte: todayStart, lt: todayEnd },
      },
      select: { total: true, status: true, paymentMethod: true },
    });

    const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const cashToday = todayOrders
      .filter((o) => o.paymentMethod === "cash")
      .reduce((sum, o) => sum + o.total, 0);
    const digitalToday = todayOrders
      .filter((o) => o.paymentMethod !== "cash")
      .reduce((sum, o) => sum + o.total, 0);
    const completedTodayCount = todayOrders.filter((o) => o.status === "delivered").length;
    const pendingOrdersCount = todayOrders.filter((o) => o.status === "pending").length;
    const preparingOrdersCount = todayOrders.filter((o) => o.status === "preparing").length;

    return successResponse({
      todaySales,
      todayOrdersCount: todayOrders.length,
      cashToday,
      digitalToday,
      pendingOrdersCount,
      preparingOrdersCount,
      completedTodayCount,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return serverErrorResponse();
  }
}
