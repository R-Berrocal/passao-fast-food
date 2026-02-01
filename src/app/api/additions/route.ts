import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAdditionSchema } from "@/lib/validations/addition";
import {
  successResponse,
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";

    const additions = await prisma.addition.findMany({
      where: showAll ? {} : { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });

    return successResponse(additions);
  } catch (error) {
    console.error("Get additions error:", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return unauthorizedResponse("Solo administradores pueden crear adiciones");
    }

    const body = await request.json();
    const result = createAdditionSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const addition = await prisma.addition.create({
      data: {
        ...result.data,
        image: result.data.image || null,
      },
    });

    return createdResponse(addition);
  } catch (error) {
    console.error("Create addition error:", error);
    return serverErrorResponse();
  }
}
