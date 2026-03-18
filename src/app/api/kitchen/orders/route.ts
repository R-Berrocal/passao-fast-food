import { prisma } from "@/lib/prisma";
import { successResponse, serverErrorResponse } from "@/lib/api-response";
import { OrderStatus } from "@/generated/prisma/enums";
import { getColombiaDateRange, getTodayString } from "@/lib/date-utils";

const ACTIVE_STATUSES: OrderStatus[] = [
  OrderStatus.pending,
  OrderStatus.confirmed,
  OrderStatus.preparing,
];

export async function GET() {
  try {
    // Get today's date range in Colombia timezone (UTC-5)
    // Mirrors getColombiaDateRange() from @/lib/date-utils
    const todayStr = getTodayString();
    const { startUTC, endUTC } = getColombiaDateRange(todayStr);

    const orders = await prisma.order.findMany({
      where: {
        status: { in: ACTIVE_STATUSES },
        createdAt: { gte: startUTC, lt: endUTC },
      },
      include: {
        items: {
          include: {
            additions: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return successResponse(orders);
  } catch (error) {
    console.error("[kitchen/orders] Error:", error);
    return serverErrorResponse();
  }
}
