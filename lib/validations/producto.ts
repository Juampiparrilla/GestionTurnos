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

const productoObjectSchema = z.object({
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

// "Cantidad de unidades" nunca puede ser decimal (no existe "0.5
// unidades") -- por Kg sí, ahí "kg" es un peso. Se valida acá además de en
// el input porque un producto viejo pudo quedar con un decimal guardado de
// cuando se vendía por Kg.
function cantidadEnteraSiEsUnidad(data: { unidadMedida: "kg" | "unidad"; kg: number }) {
  return data.unidadMedida !== "unidad" || Number.isInteger(data.kg);
}

const mensajeCantidadEntera = {
  message: "La cantidad de unidades tiene que ser un número entero.",
  path: ["kg"] as PropertyKey[],
};

export const createProductoSchema = productoObjectSchema.refine(cantidadEnteraSiEsUnidad, mensajeCantidadEntera);

export const updateProductoSchema = productoObjectSchema
  .extend({ active: z.boolean().optional() })
  .refine(cantidadEnteraSiEsUnidad, mensajeCantidadEntera);

const nombreEntidadSchema = z
  .string()
  .trim()
  .min(1, "No puede estar vacío")
  .max(100, "No puede superar los 100 caracteres");

// Ajuste masivo de costo sobre un conjunto de productos ya filtrado en la
// pantalla (no por proveedor como el otro ajuste masivo): el % se aplica
// sobre el costo actual de cada producto, no sobre el % de ganancia.
export const bulkUpdateCostoSchema = z.object({
  productoIds: z.array(z.string().uuid()).min(1, "Elegí al menos un producto."),
  porcentaje: z
    .number()
    .gt(-100, "El porcentaje no puede bajar el costo a cero o menos.")
    .max(1000, "Porcentaje demasiado alto.")
    .refine((v) => v !== 0, "Ingresá un porcentaje distinto de 0."),
});

// Fila cruda de la planilla de importación: a diferencia de
// createProductoSchema, marca/categoría/proveedor llegan como texto (se
// resuelven por nombre contra la base, no como uuid) y no admite precio
// manual/oferta/descripción -- no forman parte de las columnas de la
// plantilla. `id` vacío = crear producto nuevo; con valor = actualizar
// ese producto puntual (columna "ID" de la planilla, se completa sola al
// descargar el catálogo actual, no la carga el usuario).
export const importProductoRowSchema = z
  .object({
    id: z.union([z.string().uuid(), z.literal("")]).optional(),
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
  })
  .refine(cantidadEnteraSiEsUnidad, mensajeCantidadEntera);
