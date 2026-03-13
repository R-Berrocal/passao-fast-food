import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const staff = await requireStaff(request);
    if (!staff) return unauthorizedResponse();

    // Colombia is UTC-5: midnight Colombia = 05:00 UTC
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
    const todayStart = new Date(`${today}T05:00:00.000Z`);
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const [todayOrders, pendingCount, preparingCount, recentOrders, activeProductsCount, customerCount] =
      await Promise.all([
        // Today's orders for sales/count/completed stats (no cancelled)
        prisma.order.findMany({
          where: {
            status: { not: "cancelled" },
            createdAt: { gte: todayStart, lt: todayEnd },
          },
          select: { total: true, status: true },
        }),
        // All pending orders count
        prisma.order.count({ where: { status: "pending" } }),
        // All preparing orders count
        prisma.order.count({ where: { status: "preparing" } }),
        // 5 most recent orders for display
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            items: {
              include: { additions: true },
            },
          },
        }),
        // Active products count
        prisma.product.count({ where: { isActive: true } }),
        // Customer count
        prisma.user.count({ where: { role: "customer" } }),
      ]);

    const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const completedToday = todayOrders.filter((o) => o.status === "delivered").length;

    return successResponse({
      todaySales,
      todayOrdersCount: todayOrders.length,
      pendingOrdersCount: pendingCount,
      preparingOrdersCount: preparingCount,
      completedTodayCount: completedToday,
      activeProductsCount,
      customerCount,
      recentOrders,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return serverErrorResponse();
  }
}
