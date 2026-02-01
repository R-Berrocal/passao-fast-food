import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { UserRole } from "@/types/models";

const JWT_SECRET = process.env.JWT_SECRET || "passao-fast-food-secret-key";
const JWT_EXPIRES_IN = "7d";

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
    },
  });

  if (!user || user.status !== "active") return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role as UserRole,
  };
}

export async function requireAuth(request: NextRequest): Promise<AuthUser | null> {
  return getCurrentUser(request);
}

export async function requireAdmin(request: NextRequest): Promise<AuthUser | null> {
  const user = await getCurrentUser(request);
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function requireStaff(request: NextRequest): Promise<AuthUser | null> {
  const user = await getCurrentUser(request);
  if (!user || (user.role !== "admin" && user.role !== "staff")) return null;
  return user;
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === "admin";
}

export function isStaff(user: AuthUser | null): boolean {
  return user?.role === "admin" || user?.role === "staff";
}
