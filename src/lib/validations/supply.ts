import { z } from "zod";
import { PAYMENT_METHODS } from "./order";

export { PAYMENT_METHODS };
export type { PaymentMethodValue } from "./order";
export { PAYMENT_METHOD_LABELS } from "./order";

export const SUPPLY_CATEGORIES = ["Ingredientes", "Empaques", "Bebidas", "Servicios", "Otros"] as const;
export type SupplyCategory = typeof SUPPLY_CATEGORIES[number];

export const createSupplySchema = z.object({
  description: z.string().min(2, "La descripción es requerida"),
  category: z.enum(SUPPLY_CATEGORIES, { error: () => ({ message: "Categoría inválida" }) }),
  amount: z.number().int().positive("El monto debe ser mayor a 0"),
  date: z.coerce.date(),
  paymentMethod: z.enum(PAYMENT_METHODS, { error: () => ({ message: "Método de pago inválido" }) }),
  notes: z.string().optional(),
});

export type CreateSupplyInput = z.infer<typeof createSupplySchema>;

export const updateSupplySchema = createSupplySchema.partial();
export type UpdateSupplyInput = z.infer<typeof updateSupplySchema>;
