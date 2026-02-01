import { z } from "zod";

const orderItemAdditionSchema = z.object({
  additionId: z.string().min(1),
});

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive("La cantidad debe ser al menos 1"),
  additions: z.array(orderItemAdditionSchema).default([]),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(2, "El nombre es requerido"),
  customerPhone: z.string().min(10, "Número de teléfono inválido"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  type: z.enum(["delivery", "pickup"]),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["cash", "nequi", "daviplata", "transfer"]),
  paymentReference: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "Debe agregar al menos un producto"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"]),
  adminNotes: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
