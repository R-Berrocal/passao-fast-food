import { z } from "zod";

export const createAdditionSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  price: z.number().int().nonnegative("El precio debe ser un número no negativo"),
  image: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean(),
  displayOrder: z.number().int(),
});

export const updateAdditionSchema = createAdditionSchema.partial();

export type CreateAdditionInput = z.infer<typeof createAdditionSchema>;
export type UpdateAdditionInput = z.infer<typeof updateAdditionSchema>;
