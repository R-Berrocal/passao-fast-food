import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { setupPasswordSchema } from "@/lib/validations/auth";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = setupPasswordSchema.safeParse(body);
    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const { email, password } = result.data;

    const user = await prisma.user.findFirst({
      where: {
        email,
        role: { in: ["admin", "staff"] },
      },
      select: { id: true, password: true, status: true },
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

    const hashed = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return successResponse({ message: "Contraseña establecida correctamente." });
  } catch (error) {
    console.error("Setup password error:", error);
    return serverErrorResponse();
  }
}
