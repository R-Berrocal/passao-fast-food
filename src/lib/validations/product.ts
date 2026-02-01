import { z } from "zod";

export const createProductSchema = z.object({
  categoryId: z.string().min(1, "La categoría es requerida"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  price: z.number().int().positive("El precio debe ser un número positivo"),
  image: z.string().url("URL de imagen inválida"),
  isActive: z.boolean(),
  isAvailable: z.boolean(),
  displayOrder: z.number().int(),
});

export const updateProductSchema = z.object({
  categoryId: z.string().min(1, "La categoría es requerida").optional(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  description: z.string().optional(),
  price: z.number().int().positive("El precio debe ser un número positivo").optional(),
  image: z.string().url("URL de imagen inválida").optional(),
  isActive: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  slug: z.string().min(2, "El slug debe tener al menos 2 caracteres"),
  description: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  displayOrder: z.number().int(),
  isActive: z.boolean(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
