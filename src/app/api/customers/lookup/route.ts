import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerLookupSchema } from "@/lib/validations/customer";
import {
  successResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = customerLookupSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const { phone, name } = result.data;

    // Buscar cliente existente por teléfono
    let customer = await prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
      },
    });

    let isNew = false;

    if (customer) {
      // Cliente encontrado - actualizar nombre si es diferente
      if (customer.name !== name) {
        customer = await prisma.user.update({
          where: { phone },
          data: { name },
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
          },
        });
      }
    } else {
      // Crear nuevo cliente
      customer = await prisma.user.create({
        data: {
          name,
          phone,
          role: "customer",
          status: "active",
        },
        select: {
          id: true,
          name: true,
          phone: true,
          role: true,
        },
      });
      isNew = true;
    }

    // Obtener direcciones del cliente
    const addresses = await prisma.address.findMany({
      where: { userId: customer.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return successResponse({
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        isNew,
      },
      addresses,
    });
  } catch (error) {
    console.error("Customer lookup error:", error);
    return serverErrorResponse();
  }
}
