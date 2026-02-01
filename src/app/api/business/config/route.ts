import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { businessConfigSchema } from "@/lib/validations/business";
import {
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function GET() {
  try {
    let config = await prisma.businessConfig.findUnique({
      where: { id: "default" },
    });

    if (!config) {
      config = await prisma.businessConfig.create({
        data: { id: "default" },
      });
    }

    return successResponse(config);
  } catch (error) {
    console.error("Get business config error:", error);
    return serverErrorResponse();
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return unauthorizedResponse("Solo administradores pueden actualizar la configuración");
    }

    const body = await request.json();
    const result = businessConfigSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const config = await prisma.businessConfig.upsert({
      where: { id: "default" },
      update: result.data,
      create: {
        id: "default",
        ...result.data,
      },
    });

    return successResponse(config);
  } catch (error) {
    console.error("Update business config error:", error);
    return serverErrorResponse();
  }
}
