import { z } from "zod";

const nombreSchema = z
  .string()
  .trim()
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(100, "El nombre no puede superar los 100 caracteres");

const tipoSchema = z.enum(["ingreso", "egreso"]);

export const createCajaEtiquetaSchema = z.object({
  nombre: nombreSchema,
  tipo: tipoSchema,
});

export const updateCajaEtiquetaSchema = z.object({
  nombre: nombreSchema.optional(),
  tipo: tipoSchema.optional(),
  active: z.boolean().optional(),
});
