import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { createOrderSchema } from "@/lib/validations/order";
import {
  successResponse,
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
  errorResponse,
} from "@/lib/api-response";

async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const datePrefix = today.toISOString().slice(0, 10).replace(/-/g, "");

  const lastOrder = await prisma.order.findFirst({
    where: {
      orderNumber: {
        startsWith: `ORD-${datePrefix}`,
      },
    },
    orderBy: { orderNumber: "desc" },
  });

  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.split("-").pop() || "0", 10);
    sequence = lastSequence + 1;
  }

  return `ORD-${datePrefix}-${sequence.toString().padStart(3, "0")}`;
}

export async function GET(request: NextRequest) {
  try {
    const staff = await requireStaff(request);
    if (!staff) {
      return unauthorizedResponse("Solo el personal puede ver las órdenes");
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const date = searchParams.get("date");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      where.createdAt = {
        gte: startDate,
        lt: endDate,
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            additions: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = createOrderSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const {
      customerName,
      customerPhone,
      customerEmail,
      type,
      deliveryAddress,
      addressId,
      notes,
      paymentMethod,
      paymentReference,
      items,
    } = result.data;

    if (type === "delivery" && !deliveryAddress && !addressId) {
      return errorResponse("La dirección de entrega es requerida para delivery");
    }

    // Find or create customer by phone
    const normalizedPhone = customerPhone.replace(/[\s-]/g, "");
    let customer = await prisma.user.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!customer) {
      // Create new customer
      customer = await prisma.user.create({
        data: {
          name: customerName,
          phone: normalizedPhone,
          role: "customer",
          status: "active",
        },
      });
    }

    // Validate address if provided
    let finalDeliveryAddress = deliveryAddress;
    let validAddressId: string | undefined;

    if (addressId) {
      const address = await prisma.address.findUnique({
        where: { id: addressId },
      });

      if (address && address.userId === customer.id) {
        validAddressId = address.id;
        // Use saved address if delivery address not provided
        if (!finalDeliveryAddress) {
          finalDeliveryAddress = address.address;
        }
      }
    }

    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true, isAvailable: true },
    });

    if (products.length !== productIds.length) {
      return errorResponse("Algunos productos no están disponibles");
    }

    const allAdditionIds = items.flatMap((item) =>
      item.additions.map((a) => a.additionId)
    );
    const uniqueAdditionIds = [...new Set(allAdditionIds)];

    let additions: { id: string; name: string; price: number }[] = [];
    if (uniqueAdditionIds.length > 0) {
      additions = await prisma.addition.findMany({
        where: { id: { in: uniqueAdditionIds }, isActive: true },
        select: { id: true, name: true, price: true },
      });

      if (additions.length !== uniqueAdditionIds.length) {
        return errorResponse("Algunas adiciones no están disponibles");
      }
    }

    const businessConfig = await prisma.businessConfig.findUnique({
      where: { id: "default" },
    });

    const deliveryFee = type === "delivery" ? (businessConfig?.deliveryFee || 0) : 0;

    let subtotal = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const itemAdditions = item.additions.map((a) => {
        const addition = additions.find((add) => add.id === a.additionId)!;
        return {
          additionId: addition.id,
          additionName: addition.name,
          price: addition.price,
        };
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
        additions: {
          create: itemAdditions,
        },
      };
    });

    const total = subtotal + deliveryFee;

    const orderNumber = await generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: customer.id, // Link to customer
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
        paymentMethod,
        paymentReference: paymentReference || null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            additions: true,
          },
        },
      },
    });

    return createdResponse(order);
  } catch (error) {
    console.error("Create order error:", error);
    return serverErrorResponse();
  }
}
