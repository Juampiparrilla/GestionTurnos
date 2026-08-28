import { z } from "zod";

const nombreSchema = z
  .string()
  .trim()
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(100, "El nombre no puede superar los 100 caracteres");

const descripcionSchema = z
  .string()
  .trim()
  .max(500, "La descripción no puede superar los 500 caracteres")
  .optional()
  .or(z.literal(""));

export const createCategoriaSchema = z.object({
  nombre: nombreSchema,
  descripcion: descripcionSchema,
});

export const updateCategoriaSchema = z.object({
  nombre: nombreSchema.optional(),
  descripcion: descripcionSchema,
  active: z.boolean().optional(),
});
