import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api-response";
import { getColombiaDateRange, getTodayString } from "@/lib/date-utils";

type DayStats = { sales: number; orders: number } | null;

interface WeekendDays {
  thursday: DayStats;
  friday: DayStats;
  saturday: DayStats;
  sunday: DayStats;
}

async function getDayStats(dateStr: string): Promise<{ sales: number; orders: number }> {
  const { startUTC, endUTC } = getColombiaDateRange(dateStr);
  const orders = await prisma.order.findMany({
    where: {
      status: { not: "cancelled" },
      createdAt: { gte: startUTC, lt: endUTC },
    },
    select: { total: true },
  });
  return {
    sales: orders.reduce((sum, o) => sum + o.total, 0),
    orders: orders.length,
  };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) return unauthorizedResponse();

    const todayStr = getTodayString();
    const todayDate = new Date(`${todayStr}T12:00:00`);
    const dayOfWeek = todayDate.getDay(); // 0=Sun ... 6=Sat
    const daysSinceThursday = (dayOfWeek + 3) % 7;

    const thisThursday = addDays(todayStr, -daysSinceThursday);
    const lastThursday = addDays(thisThursday, -7);

    // Fetch last weekend (all 4 days, already happened)
    const lastWeekendResults = await Promise.all([
      getDayStats(lastThursday),
      getDayStats(addDays(lastThursday, 1)),
      getDayStats(addDays(lastThursday, 2)),
      getDayStats(addDays(lastThursday, 3)),
    ]);

    const lastWeekend: WeekendDays = {
      thursday: lastWeekendResults[0],
      friday: lastWeekendResults[1],
      saturday: lastWeekendResults[2],
      sunday: lastWeekendResults[3],
    };

    // Fetch this weekend (future days → null)
    const thisWeekendDays = [0, 1, 2, 3].map((offset) => addDays(thisThursday, offset));
    const thisWeekendResults = await Promise.all(
      thisWeekendDays.map((dayStr) =>
        dayStr > todayStr ? Promise.resolve(null) : getDayStats(dayStr)
      )
    );

    const thisWeekend: WeekendDays = {
      thursday: thisWeekendResults[0],
      friday: thisWeekendResults[1],
      saturday: thisWeekendResults[2],
      sunday: thisWeekendResults[3],
    };

    return successResponse({
      lastWeekend,
      thisWeekend,
      thisThursday,
      lastThursday,
    });
  } catch (error) {
    console.error("Weekend trend error:", error);
    return serverErrorResponse();
  }
}
