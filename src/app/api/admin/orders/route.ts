import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { createOrderSchema } from "@/lib/validations/order";
import { generateOrderNumber } from "@/lib/order-utils";
import { z } from "zod";
import {
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
  errorResponse,
} from "@/lib/api-response";

const createManualOrderSchema = createOrderSchema.extend({
  status: z
    .enum(["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"])
    .default("delivered"),
  paymentStatus: z.enum(["pending", "confirmed", "rejected"]).default("confirmed"),
});

export async function POST(request: NextRequest) {
  try {
    const staff = await requireStaff(request);
    if (!staff) return unauthorizedResponse("Solo el personal puede crear órdenes manuales");

    const body = await request.json();
    const result = createManualOrderSchema.safeParse(body);
    if (!result.success) return validationErrorResponse(result.error.issues[0].message);

    const {
      customerName,
      customerPhone,
      customerEmail,
      type,
      deliveryAddress,
      addressId,
      notes,
      adminNotes,
      paymentMethod,
      paymentReference,
      items,
      status,
      paymentStatus,
    } = result.data;

    if (type === "delivery" && !deliveryAddress && !addressId) {
      return errorResponse("La dirección de entrega es requerida para delivery");
    }

    const normalizedPhone = customerPhone.replace(/[\s-]/g, "");
    let customer = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
    if (!customer) {
      customer = await prisma.user.create({
        data: { name: customerName, phone: normalizedPhone, role: "customer", status: "active" },
      });
    }

    let finalDeliveryAddress = deliveryAddress;
    let validAddressId: string | undefined;
    if (addressId) {
      const address = await prisma.address.findUnique({ where: { id: addressId } });
      if (address && address.userId === customer.id) {
        validAddressId = address.id;
        if (!finalDeliveryAddress) finalDeliveryAddress = address.address;
      }
    }

    const productIds = items.map((item) => item.productId);
    const uniqueProductIds = [...new Set(productIds)];
    const products = await prisma.product.findMany({
      where: { id: { in: uniqueProductIds }, isActive: true, isAvailable: true },
    });

    if (products.length !== uniqueProductIds.length) {
      return errorResponse("Algunos productos no están disponibles");
    }


    const allAdditionIds = items.flatMap((item) => item.additions.map((a) => a.additionId));
    const uniqueAdditionIds = [...new Set(allAdditionIds)];
    let additions: { id: string; name: string; price: number }[] = [];
    if (uniqueAdditionIds.length > 0) {
      additions = await prisma.addition.findMany({
        where: { id: { in: uniqueAdditionIds }, isActive: true },
        select: { id: true, name: true, price: true },
      });
      if (additions.length !== uniqueAdditionIds.length)
        return errorResponse("Algunas adiciones no están disponibles");
    }

    const businessConfig = await prisma.businessConfig.findUnique({ where: { id: "default" } });
    const deliveryFee = type === "delivery" ? businessConfig?.deliveryFee || 0 : 0;

    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const itemAdditions = item.additions.map((a) => {
        const addition = additions.find((add) => add.id === a.additionId)!;
        return { additionId: addition.id, additionName: addition.name, price: addition.price };
      });
      const additionsTotal = itemAdditions.reduce((sum, a) => sum + a.price, 0);
      const itemTotal = (product.price + additionsTotal) * item.quantity;
      subtotal += itemTotal;
      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
        additions: { create: itemAdditions },
      };
    });

    const total = subtotal + deliveryFee;
    const orderNumber = await generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: customer.id,
        customerName,
        customerPhone: normalizedPhone,
        customerEmail: customerEmail || null,
        type,
        addressId: validAddressId || null,
        deliveryAddress: type === "delivery" ? finalDeliveryAddress : null,
        subtotal,
        deliveryFee,
        total,
        notes: notes || null,
        adminNotes: adminNotes || null,
        paymentMethod,
        paymentReference: paymentReference || null,
        status,
        paymentStatus,
        items: { create: orderItems },
      },
      include: { items: { include: { additions: true } } },
    });

    return createdResponse(order);
  } catch (error) {
    console.error("Create manual order error:", error);
    return serverErrorResponse();
  }
}
