import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getCurrentUser, hashPassword } from "@/lib/auth";
import { updateUserSchema } from "@/lib/validations/user";
import {
  successResponse,
  notFoundResponse,
  unauthorizedResponse,
  validationErrorResponse,
  serverErrorResponse,
  messageResponse,
  errorResponse,
} from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    if (currentUser.role !== "admin" && currentUser.id !== id) {
      return unauthorizedResponse("No tienes permiso para ver este usuario");
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        addresses: true,
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!user) {
      return notFoundResponse("Usuario");
    }

    return successResponse(user);
  } catch (error) {
    console.error("Get user error:", error);
    return serverErrorResponse();
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    const isAdmin = currentUser.role === "admin";
    const isSelf = currentUser.id === id;

    if (!isAdmin && !isSelf) {
      return unauthorizedResponse("No tienes permiso para actualizar este usuario");
    }

    const body = await request.json();
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error.issues[0].message);
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return notFoundResponse("Usuario");
    }

    const { password, role, status, ...otherData } = result.data;

    if (!isAdmin && (role || status)) {
      return unauthorizedResponse("Solo administradores pueden cambiar rol o estado");
    }

    // Check for duplicate email among admin/staff
    if (result.data.email && result.data.email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: result.data.email,
          role: { in: ["admin", "staff"] },
          id: { not: id },
        },
      });
      if (emailExists) {
        return errorResponse("Este email ya está registrado", 409);
      }
    }

    // Check for duplicate phone
    if (result.data.phone && result.data.phone !== existingUser.phone) {
      const phoneExists = await prisma.user.findUnique({
        where: { phone: result.data.phone },
      });
      if (phoneExists) {
        return errorResponse("Este teléfono ya está registrado", 409);
      }
    }

    const updateData: Record<string, unknown> = { ...otherData };

    if (password) {
      updateData.password = await hashPassword(password);
    }

    if (isAdmin) {
      if (role) updateData.role = role;
      if (status) updateData.status = status;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return successResponse(user);
  } catch (error) {
    console.error("Update user error:", error);
    return serverErrorResponse();
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return unauthorizedResponse("Solo administradores pueden eliminar usuarios");
    }

    const { id } = await params;

    if (admin.id === id) {
      return errorResponse("No puedes eliminarte a ti mismo", 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return notFoundResponse("Usuario");
    }

    await prisma.user.delete({
      where: { id },
    });

    return messageResponse("Usuario eliminado correctamente");
  } catch (error) {
    console.error("Delete user error:", error);
    return serverErrorResponse();
  }
}
