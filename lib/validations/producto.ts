import { z } from "zod";

const nombreSchema = z
  .string()
  .trim()
  .min(2, "El nombre debe tener al menos 2 caracteres")
  .max(150, "El nombre no puede superar los 150 caracteres");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `No puede superar los ${max} caracteres`)
    .optional()
    .or(z.literal(""));

const optionalUuid = z.union([z.string().uuid(), z.literal(""), z.null()]).optional();

const porcentajeSchema = z.number().min(0, "No puede ser negativo").max(1000);
const precioSchema = z.number().min(0, "No puede ser negativo");

export const createProductoSchema = z.object({
  nombre: nombreSchema,
  marcaId: optionalUuid,
  categoriaId: optionalUuid,
  proveedorId: optionalUuid,
  descripcion: optionalText(500),
  kg: z.number().positive("Tiene que ser mayor a 0"),
  costo: precioSchema,
  porcentajeCerrada: porcentajeSchema,
  manualCerrada: z.boolean(),
  precioManualCerrada: precioSchema,
  porcentajeAbierta: porcentajeSchema,
  manualAbierta: z.boolean(),
  precioManualAbierta: precioSchema,
  porcentajePorMayor: porcentajeSchema,
  manualPorMayor: z.boolean(),
  precioManualPorMayor: precioSchema,
  oferta: z.boolean(),
});

export const updateProductoSchema = createProductoSchema.extend({
  active: z.boolean().optional(),
});
