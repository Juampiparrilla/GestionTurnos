import { describe, expect, it } from "vitest";
import {
  bulkUpdateCostoSchema,
  createProductoSchema,
  importProductoRowSchema,
  updateProductoSchema,
} from "@/lib/validations/producto";

const uuid = "11111111-1111-4111-8111-111111111111";

const basePayload = {
  nombre: "PRODUCTO TEST",
  marcaId: uuid,
  categoriaId: uuid,
  proveedorId: uuid,
  descripcion: "",
  kg: 1,
  unidadMedida: "unidad" as const,
  costo: 1000,
  porcentajeCerrada: 30,
  manualCerrada: false,
  precioManualCerrada: 0,
  porcentajeAbierta: 0,
  manualAbierta: false,
  precioManualAbierta: 0,
  porcentajePorMayor: 10,
  manualPorMayor: false,
  precioManualPorMayor: 0,
  oferta: false,
};

// Regresión del bug de RATICIDA: un producto por Unidad quedó guardado con
// 0.55661122 como cantidad. La cantidad de unidades nunca puede ser decimal.
describe("createProductoSchema", () => {
  it("rechaza una cantidad decimal cuando se vende por Unidad", () => {
    const result = createProductoSchema.safeParse({ ...basePayload, unidadMedida: "unidad", kg: 0.5 });
    expect(result.success).toBe(false);
  });

  it("acepta una cantidad entera cuando se vende por Unidad", () => {
    const result = createProductoSchema.safeParse({ ...basePayload, unidadMedida: "unidad", kg: 3 });
    expect(result.success).toBe(true);
  });

  it("acepta una cantidad decimal cuando se vende por Kg", () => {
    const result = createProductoSchema.safeParse({ ...basePayload, unidadMedida: "kg", kg: 0.5 });
    expect(result.success).toBe(true);
  });
});

describe("updateProductoSchema", () => {
  it("rechaza igual una cantidad decimal por Unidad al editar", () => {
    const result = updateProductoSchema.safeParse({
      ...basePayload,
      unidadMedida: "unidad",
      kg: 0.5661122,
      active: true,
    });
    expect(result.success).toBe(false);
  });

  it("acepta una cantidad entera por Unidad al editar", () => {
    const result = updateProductoSchema.safeParse({ ...basePayload, unidadMedida: "unidad", kg: 2, active: true });
    expect(result.success).toBe(true);
  });
});

describe("importProductoRowSchema", () => {
  const importBase = {
    id: "",
    nombre: "PRODUCTO TEST",
    kg: 1,
    unidadMedida: "unidad" as const,
    marca: "MARCA",
    categoria: "CATEGORIA",
    proveedor: "PROVEEDOR",
    costo: 1000,
    porcentajeCerrada: 30,
    porcentajeAbierta: 0,
    porcentajePorMayor: 10,
  };

  it("rechaza una fila por Unidad con cantidad decimal", () => {
    const result = importProductoRowSchema.safeParse({ ...importBase, kg: 0.5 });
    expect(result.success).toBe(false);
  });

  it("acepta una fila por Kg con cantidad decimal", () => {
    const result = importProductoRowSchema.safeParse({ ...importBase, unidadMedida: "kg", kg: 0.5 });
    expect(result.success).toBe(true);
  });
});

describe("bulkUpdateCostoSchema", () => {
  it("rechaza un porcentaje de 0 (no tendría efecto)", () => {
    const result = bulkUpdateCostoSchema.safeParse({ productoIds: [uuid], porcentaje: 0 });
    expect(result.success).toBe(false);
  });

  it("rechaza un porcentaje que dejaría el costo en cero o menos", () => {
    const result = bulkUpdateCostoSchema.safeParse({ productoIds: [uuid], porcentaje: -100 });
    expect(result.success).toBe(false);
  });

  it("rechaza una lista vacía de productos", () => {
    const result = bulkUpdateCostoSchema.safeParse({ productoIds: [], porcentaje: 15 });
    expect(result.success).toBe(false);
  });

  it("acepta un aumento normal", () => {
    const result = bulkUpdateCostoSchema.safeParse({ productoIds: [uuid], porcentaje: 15 });
    expect(result.success).toBe(true);
  });

  it("acepta una baja normal", () => {
    const result = bulkUpdateCostoSchema.safeParse({ productoIds: [uuid], porcentaje: -15 });
    expect(result.success).toBe(true);
  });
});
