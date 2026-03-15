import { prisma } from "@/lib/prisma";
import { getTodayString } from "./date-utils";

export async function generateOrderNumber(): Promise<string> {
  const today = getTodayString();
  const datePrefix = today.replace(/-/g, "");

  const lastOrder = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: `ORD-${datePrefix}` } },
    orderBy: { orderNumber: "desc" },
  });

  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split("-").pop() || "0", 10);
    sequence = lastSequence + 1;
  }

  return `ORD-${datePrefix}-${sequence.toString().padStart(3, "0")}`;
}
