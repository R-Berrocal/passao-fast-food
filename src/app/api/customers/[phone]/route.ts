import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerUpdateSchema, phoneSchema } from "@/lib/validations/customer";
import {
  successResponse,
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
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!customer) {
      return notFoundResponse("Cliente");
    }

    return successResponse(customer);
  } catch (error) {
    console.error("Get customer error:", error);
    return serverErrorResponse();
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { phone } = await context.params;
    const phoneResult = phoneSchema.safeParse(phone);

    if (!phoneResult.success) {
      return validationErrorResponse("Número de teléfono inválido");
    }

    const body = await request.json();
    const result = customerUpdateSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const existingCustomer = await prisma.user.findUnique({
      where: { phone: phoneResult.data },
    });

    if (!existingCustomer) {
      return notFoundResponse("Cliente");
    }

    const updatedCustomer = await prisma.user.update({
      where: { phone: phoneResult.data },
      data: { name: result.data.name },
      select: {
        id: true,
        name: true,
        phone: true,
      },
    });

    return successResponse(updatedCustomer);
  } catch (error) {
    console.error("Update customer error:", error);
    return serverErrorResponse();
  }
}
