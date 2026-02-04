import { z } from "zod";

export const createAddressSchema = z.object({
  address: z.string().min(5, "La dirección es requerida"),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
