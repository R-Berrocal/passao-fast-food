import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyIdentitySchema } from "@/lib/validations/auth";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = verifyIdentitySchema.safeParse(body);
    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const { email } = result.data;

    const user = await prisma.user.findFirst({
      where: {
        email,
        role: { in: ["admin", "staff"] },
      },
      select: { password: true, status: true },
    });

    if (!user) {
      return errorResponse("No se encontró una cuenta con ese email.", 400);
    }

    if (user.password !== null) {
      return errorResponse("Esta cuenta ya tiene contraseña configurada.", 400);
    }

    if (user.status !== "active") {
      return errorResponse("Tu cuenta no está activa. Contacta al administrador.", 403);
    }

    return successResponse({ verified: true });
  } catch (error) {
    console.error("Setup password verify error:", error);
    return serverErrorResponse();
  }
}
