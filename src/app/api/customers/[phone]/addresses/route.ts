import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerAddressSchema, phoneSchema } from "@/lib/validations/customer";
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

type RouteContext = {
  params: Promise<{ phone: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { phone } = await context.params;
    const phoneResult = phoneSchema.safeParse(phone);

    if (!phoneResult.success) {
      return validationErrorResponse("Número de teléfono inválido");
    }

    const customer = await prisma.user.findUnique({
      where: { phone: phoneResult.data },
      select: { id: true },
    });

    if (!customer) {
      return notFoundResponse("Cliente");
    }

    const addresses = await prisma.address.findMany({
      where: { userId: customer.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return successResponse(addresses);
  } catch (error) {
    console.error("Get addresses error:", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { phone } = await context.params;
    const phoneResult = phoneSchema.safeParse(phone);

    if (!phoneResult.success) {
      return validationErrorResponse("Número de teléfono inválido");
    }

    const body = await request.json();
    const result = customerAddressSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const customer = await prisma.user.findUnique({
      where: { phone: phoneResult.data },
      select: { id: true },
    });

    if (!customer) {
      return notFoundResponse("Cliente");
    }

    const { address, isDefault } = result.data;

    // Si se marca como default, actualizar las demás
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: customer.id },
        data: { isDefault: false },
      });
    }

    // Verificar si es la primera dirección
    const addressCount = await prisma.address.count({
      where: { userId: customer.id },
    });

    const newAddress = await prisma.address.create({
      data: {
        userId: customer.id,
        address,
        isDefault: isDefault || addressCount === 0, // Primera dirección es default
      },
    });

    return createdResponse(newAddress);
  } catch (error) {
    console.error("Create address error:", error);
    return serverErrorResponse();
  }
}
