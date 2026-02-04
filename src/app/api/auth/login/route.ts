import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const { email, password } = result.data;

    // Find user by email (admin/staff only - email is not unique anymore)
    const user = await prisma.user.findFirst({
      where: {
        email,
        role: { in: ["admin", "staff"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        password: true,
        role: true,
        status: true,
      },
    });

    if (!user || !user.password) {
      return errorResponse("Email o contraseña incorrectos", 401);
    }

    if (user.status !== "active") {
      return errorResponse("Tu cuenta está desactivada", 403);
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return errorResponse("Email o contraseña incorrectos", 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email || "",
      role: user.role,
    });

    return successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return serverErrorResponse();
  }
}
