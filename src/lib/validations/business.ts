import { z } from "zod";

export const businessConfigSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),

  // Branding
  logoUrl: z.string().url().optional().or(z.literal("")),
  slogan: z.string().optional(),

  // Contacto y redes sociales
  whatsappNumber: z.string().optional(),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),

  // Hero statistics
  heroStatArepas: z.number().int().nonnegative().optional(),
  heroStatPerros: z.number().int().nonnegative().optional(),
  heroStatPatacones: z.number().int().nonnegative().optional(),
  heroStatTotal: z.number().int().nonnegative().optional(),

  // Delivery
  deliveryFee: z.number().int().nonnegative().optional(),
  minOrderAmount: z.number().int().nonnegative().optional(),

  // Datos de pago
  nequiNumber: z.string().optional(),
  daviplataNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountType: z.string().optional(),
  bankAccountHolder: z.string().optional(),
});

export const businessHoursSchema = z.object({
  dayOfWeek: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
  isOpen: z.boolean(),
  openTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)").optional().nullable(),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)").optional().nullable(),
});

export const updateBusinessHoursSchema = z.array(businessHoursSchema);

export type BusinessConfigInput = z.infer<typeof businessConfigSchema>;
export type BusinessHoursInput = z.infer<typeof businessHoursSchema>;
