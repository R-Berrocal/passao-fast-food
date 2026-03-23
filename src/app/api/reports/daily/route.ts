import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api-response";
import { getColombiaDateRange } from "@/lib/date-utils";
import type { DailyReport } from "@/types/models";

export async function GET(request: NextRequest) {
  try {
    const staff = await requireStaff(request);
    if (!staff) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date") || new Date().toISOString().slice(0, 10);

    const { startUTC, endUTC } = getColombiaDateRange(dateParam);

    // Fetch delivered orders in date range
    const orders = await prisma.order.findMany({
      where: {
        status: { not: "cancelled" },
        createdAt: { gte: startUTC, lt: endUTC },
      },
      select: { total: true, paymentMethod: true },
    });

    // Calculate sales totals
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;

    const paymentMap = new Map<string, { count: number; total: number }>();
    for (const order of orders) {
      const existing = paymentMap.get(order.paymentMethod) || { count: 0, total: 0 };
      paymentMap.set(order.paymentMethod, {
        count: existing.count + 1,
        total: existing.total + order.total,
      });
    }

    const byPaymentMethod = Array.from(paymentMap.entries()).map(([method, data]) => ({
      method: method as DailyReport["sales"]["byPaymentMethod"][number]["method"],
      count: data.count,
      total: data.total,
    }));

    const cashRevenue = paymentMap.get("cash")?.total || 0;
    const digitalRevenue = totalRevenue - cashRevenue;

    // Fetch supply purchases for the date
    const supplies = await prisma.supplyPurchase.findMany({
      where: { date: { equals: new Date(dateParam) } },
      select: { amount: true, paymentMethod: true },
    });

    const totalSpent = supplies.reduce((sum, s) => sum + s.amount, 0);
    const totalPurchases = supplies.length;

    const supplyPaymentMap = new Map<string, { count: number; total: number }>();
    for (const supply of supplies) {
      const existing = supplyPaymentMap.get(supply.paymentMethod) || { count: 0, total: 0 };
      supplyPaymentMap.set(supply.paymentMethod, {
        count: existing.count + 1,
        total: existing.total + supply.amount,
      });
    }

    const suppliesByPaymentMethod = Array.from(supplyPaymentMap.entries()).map(([method, data]) => ({
      method,
      count: data.count,
      total: data.total,
    }));

    const cashSpent = supplyPaymentMap.get("cash")?.total || 0;
    const digitalSpent = totalSpent - cashSpent;

    const report: DailyReport = {
      date: dateParam,
      sales: { totalOrders, totalRevenue, cashRevenue, digitalRevenue, byPaymentMethod },
      supplies: { totalPurchases, totalSpent, cashSpent, digitalSpent, byPaymentMethod: suppliesByPaymentMethod },
      balance: totalRevenue - totalSpent,
    };

    return successResponse(report);
  } catch (error) {
    console.error("Daily report error:", error);
    return serverErrorResponse();
  }
}
