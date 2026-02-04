import { z } from "zod";

// Schema para normalizar teléfonos colombianos
export const phoneSchema = z
  .string()
  .min(10, "Número de teléfono inválido")
  .max(15, "Número de teléfono inválido")
  .regex(/^[0-9+\s-]+$/, "Formato de teléfono inválido")
  .transform((val) => val.replace(/[\s-]/g, "")); // Eliminar espacios y guiones

// Schema para búsqueda/creación de cliente por teléfono y nombre
export const customerLookupSchema = z.object({
  phone: phoneSchema,
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

// Schema para actualizar datos del cliente
export const customerUpdateSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

// Schema para crear nueva dirección (simplificado)
export const customerAddressSchema = z.object({
  address: z.string().min(5, "La dirección es requerida"),
  isDefault: z.boolean().default(false),
});

export type CustomerLookupInput = z.infer<typeof customerLookupSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
export type CustomerAddressInput = z.infer<typeof customerAddressSchema>;
