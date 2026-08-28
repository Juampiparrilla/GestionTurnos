import { z } from "zod";

const nombreSchema = z
  .string()
  .trim()
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(100, "El nombre no puede superar los 100 caracteres");

export const createMarcaSchema = z.object({
  nombre: nombreSchema,
});

export const updateMarcaSchema = z.object({
  nombre: nombreSchema.optional(),
  active: z.boolean().optional(),
});
