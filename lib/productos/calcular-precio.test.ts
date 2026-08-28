import { describe, expect, it } from "vitest";
import { calcularPrecioVenta } from "@/lib/productos/calcular-precio";

describe("calcularPrecioVenta", () => {
  it("calcula el precio a partir del costo y el porcentaje cuando no es manual", () => {
    const result = calcularPrecioVenta({ costo: 10000, porcentaje: 30, manual: false, precioManual: 0 });
    expect(result).toEqual({ precio: 13000, porcentaje: 30 });
  });

  it("redondea a dos decimales", () => {
    const result = calcularPrecioVenta({ costo: 10000, porcentaje: 45, manual: false, precioManual: 0 });
    expect(result.precio).toBe(14500);
  });

  it("usa el precio manual tal cual y back-calcula el porcentaje equivalente", () => {
    const result = calcularPrecioVenta({ costo: 10000, porcentaje: 30, manual: true, precioManual: 14500 });
    expect(result).toEqual({ precio: 14500, porcentaje: 45 });
  });

  it("no explota con costo 0 en modo manual (evita división por cero)", () => {
    const result = calcularPrecioVenta({ costo: 0, porcentaje: 30, manual: true, precioManual: 500 });
    expect(result).toEqual({ precio: 500, porcentaje: 0 });
  });
});
