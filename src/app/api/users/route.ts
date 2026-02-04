import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { createUserSchema } from "@/lib/validations/user";
import {
  successResponse,
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
  errorResponse,
} from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return unauthorizedResponse("Solo administradores pueden ver usuarios");
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(users);
  } catch (error) {
    console.error("Get users error:", error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return unauthorizedResponse("Solo administradores pueden crear usuarios");
    }

    const body = await request.json();
    const result = createUserSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const { name, email, phone, password, role, status } = result.data;

    // Check for duplicate phone
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      return errorResponse("Este teléfono ya está registrado", 409);
    }

    // Check for duplicate email among admin/staff
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email,
          role: { in: ["admin", "staff"] },
        },
      });

      if (existingEmail) {
        return errorResponse("Este email ya está registrado", 409);
      }
    }

    const hashedPassword = password ? await hashPassword(password) : null;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        status,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return createdResponse(user);
  } catch (error) {
    console.error("Create user error:", error);
    return serverErrorResponse();
  }
}
