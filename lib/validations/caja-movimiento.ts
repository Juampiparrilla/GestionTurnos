import { z } from "zod";

const fechaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

const movimientoObjectSchema = z.object({
  tipo: z.enum(["ingreso", "egreso"]),
  etiquetaId: z.string().uuid("Elegí una etiqueta"),
  monto: z.number().positive("El monto tiene que ser mayor a 0"),
  fecha: fechaSchema,
  boardId: z.string().uuid("Elegí un local"),
  shiftConfigurationId: z.string().uuid().nullable(),
  observacion: z
    .string()
    .trim()
    .max(500, "La observación no puede superar los 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export const createCajaMovimientoSchema = movimientoObjectSchema;

export const updateCajaMovimientoSchema = movimientoObjectSchema.partial();

export const anularCajaMovimientoSchema = z.object({
  motivo: z
    .string()
    .trim()
    .max(500, "El motivo no puede superar los 500 caracteres")
    .optional()
    .or(z.literal("")),
});
