import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Número de teléfono inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
  role: z.enum(["admin", "staff", "customer"]),
  status: z.enum(["active", "inactive", "banned"]),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().min(10, "Número de teléfono inválido").optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional().or(z.literal("")),
  role: z.enum(["admin", "staff", "customer"]).optional(),
  status: z.enum(["active", "inactive", "banned"]).optional(),
});

export const createAddressSchema = z.object({
  label: z.string().min(1, "La etiqueta es requerida"),
  street: z.string().min(5, "La dirección es requerida"),
  neighborhood: z.string().min(2, "El barrio es requerido"),
  city: z.string().default("Barranquilla"),
  details: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
