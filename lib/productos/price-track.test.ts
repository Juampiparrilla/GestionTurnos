import { describe, expect, it } from "vitest";
import { precioPorTrack } from "@/lib/productos/price-track";
import type { Producto } from "@/types/producto";

const productoBase: Producto = {
  id: "1",
  organization_id: "org-1",
  nombre: "PRODUCTO TEST",
  codigo: "PRODUCTO-TEST",
  marca_id: null,
  categoria_id: null,
  proveedor_id: null,
  descripcion: null,
  kg: 10,
  unidad_medida: "kg",
  costo: 1000,
  porcentaje_ganancia_cerrada: 30,
  precio_venta_cerrada: 1300,
  precio_manual_cerrada: false,
  porcentaje_ganancia_abierta: 20,
  precio_venta_abierta: 1200,
  precio_manual_abierta: false,
  porcentaje_ganancia_por_mayor: 10,
  precio_venta_por_mayor: 1100,
  precio_manual_por_mayor: false,
  precio_por_kg: 120,
  oferta: false,
  active: true,
  created_by: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

describe("precioPorTrack", () => {
  it("devuelve el precio de bolsa cerrada", () => {
    expect(precioPorTrack(productoBase, "cerrada")).toBe(1300);
  });

  it("devuelve el precio de bolsa abierta", () => {
    expect(precioPorTrack(productoBase, "abierta")).toBe(1200);
  });

  it("devuelve el precio por mayor", () => {
    expect(precioPorTrack(productoBase, "por_mayor")).toBe(1100);
  });
});
