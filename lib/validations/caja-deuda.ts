import { z } from "zod";

const fechaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

const acreedorSchema = z
  .string()
  .trim()
  .min(2, "Tiene que tener al menos 2 caracteres")
  .max(150, "No puede superar los 150 caracteres");

const observacionSchema = z
  .string()
  .trim()
  .max(500, "La observación no puede superar los 500 caracteres")
  .optional()
  .or(z.literal(""));

const deudaObjectSchema = z.object({
  fecha: fechaSchema,
  acreedor: acreedorSchema,
  monto: z.number().positive("El monto tiene que ser mayor a 0"),
  observacion: observacionSchema,
});

export const createCajaDeudaSchema = deudaObjectSchema;

export const updateCajaDeudaSchema = deudaObjectSchema.partial();

export const anularCajaDeudaSchema = z.object({
  motivo: z
    .string()
    .trim()
    .max(500, "El motivo no puede superar los 500 caracteres")
    .optional()
    .or(z.literal("")),
});
