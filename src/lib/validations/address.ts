import { z } from "zod";

export const createAddressSchema = z.object({
  label: z.string().min(1, "La etiqueta es requerida"),
  street: z.string().min(5, "La dirección es requerida"),
  neighborhood: z.string().min(2, "El barrio es requerido"),
  city: z.string().default("Barranquilla"),
  details: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
