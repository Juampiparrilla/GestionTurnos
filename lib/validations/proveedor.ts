import { z } from "zod";

const nombreSchema = z
  .string()
  .trim()
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(100, "El nombre no puede superar los 100 caracteres");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `No puede superar los ${max} caracteres`)
    .optional()
    .or(z.literal(""));

export const createProveedorSchema = z.object({
  nombre: nombreSchema,
  contacto: optionalText(100),
  telefono: optionalText(30),
  email: z.union([z.string().trim().email("Email inválido"), z.literal("")]).optional(),
  notas: optionalText(500),
});

export const updateProveedorSchema = z.object({
  nombre: nombreSchema.optional(),
  contacto: optionalText(100),
  telefono: optionalText(30),
  email: z.union([z.string().trim().email("Email inválido"), z.literal("")]).optional(),
  notas: optionalText(500),
  active: z.boolean().optional(),
});

export const bulkUpdatePorcentajeSchema = z
  .object({
    proveedorId: z.string().uuid("Proveedor inválido"),
    porcentajeCerrada: z.number().min(0).max(1000).nullable(),
    porcentajeAbierta: z.number().min(0).max(1000).nullable(),
    porcentajePorMayor: z.number().min(0).max(1000).nullable(),
  })
  .refine(
    (data) => data.porcentajeCerrada !== null || data.porcentajeAbierta !== null || data.porcentajePorMayor !== null,
    { message: "Cargá al menos un porcentaje para aplicar." },
  );
