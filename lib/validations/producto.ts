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

const requiredUuid = z.string().uuid("Elegí una opción");

const porcentajeSchema = z.number().min(0, "No puede ser negativo").max(1000);
const precioSchema = z.number().min(0, "No puede ser negativo");
const unidadMedidaSchema = z.enum(["kg", "unidad"]);

export const createProductoSchema = z.object({
  nombre: nombreSchema,
  marcaId: requiredUuid,
  categoriaId: requiredUuid,
  proveedorId: requiredUuid,
  descripcion: optionalText(500),
  kg: z.number().positive("Tiene que ser mayor a 0"),
  unidadMedida: unidadMedidaSchema,
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

const nombreEntidadSchema = z
  .string()
  .trim()
  .min(1, "No puede estar vacío")
  .max(100, "No puede superar los 100 caracteres");

// Fila cruda de la planilla de importación: a diferencia de
// createProductoSchema, marca/categoría/proveedor llegan como texto (se
// resuelven por nombre contra la base, no como uuid) y no admite precio
// manual/oferta/descripción -- no forman parte de las columnas de la
// plantilla.
export const importProductoRowSchema = z.object({
  nombre: nombreSchema,
  kg: z.number().positive("Tiene que ser mayor a 0"),
  unidadMedida: unidadMedidaSchema,
  marca: nombreEntidadSchema,
  categoria: nombreEntidadSchema,
  proveedor: nombreEntidadSchema,
  costo: precioSchema,
  porcentajeCerrada: porcentajeSchema,
  porcentajeAbierta: porcentajeSchema,
  porcentajePorMayor: porcentajeSchema,
});
