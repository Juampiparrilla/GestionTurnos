import { describe, expect, it } from "vitest";
import { rangoDeMes, resolverRangoPeriodo } from "@/lib/caja/periodos";

// Miércoles 2026-09-16, para tener un "este mes" con días de sobra.
const HOY = new Date(2026, 8, 16);

describe("resolverRangoPeriodo", () => {
  it("hoy: mismo día en desde y hasta", () => {
    expect(resolverRangoPeriodo("hoy", HOY)).toEqual({ desde: "2026-09-16", hasta: "2026-09-16" });
  });

  it("ayer: el día anterior", () => {
    expect(resolverRangoPeriodo("ayer", HOY)).toEqual({ desde: "2026-09-15", hasta: "2026-09-15" });
  });

  it("ultimos_7: incluye hoy y los 6 días previos", () => {
    expect(resolverRangoPeriodo("ultimos_7", HOY)).toEqual({ desde: "2026-09-10", hasta: "2026-09-16" });
  });

  it("ultimos_30: incluye hoy y los 29 días previos", () => {
    expect(resolverRangoPeriodo("ultimos_30", HOY)).toEqual({ desde: "2026-08-18", hasta: "2026-09-16" });
  });

  it("este_mes: del día 1 hasta hoy", () => {
    expect(resolverRangoPeriodo("este_mes", HOY)).toEqual({ desde: "2026-09-01", hasta: "2026-09-16" });
  });

  it("mes_anterior: mes calendario completo anterior", () => {
    expect(resolverRangoPeriodo("mes_anterior", HOY)).toEqual({ desde: "2026-08-01", hasta: "2026-08-31" });
  });

  it("mes_anterior cruza de año en enero", () => {
    const enero = new Date(2026, 0, 10);
    expect(resolverRangoPeriodo("mes_anterior", enero)).toEqual({ desde: "2025-12-01", hasta: "2025-12-31" });
  });

  it("mes_elegido: mes calendario completo (enero)", () => {
    expect(resolverRangoPeriodo("mes_elegido", HOY, undefined, { year: 2026, month: 1 })).toEqual({
      desde: "2026-01-01",
      hasta: "2026-01-31",
    });
  });

  it("mes_elegido: febrero de año bisiesto y no bisiesto", () => {
    expect(rangoDeMes({ year: 2024, month: 2 }).hasta).toBe("2024-02-29");
    expect(rangoDeMes({ year: 2026, month: 2 }).hasta).toBe("2026-02-28");
  });

  it("mes_elegido: diciembre termina el 31 sin pasarse de año", () => {
    expect(rangoDeMes({ year: 2025, month: 12 })).toEqual({ desde: "2025-12-01", hasta: "2025-12-31" });
  });

  it("mes_elegido sin mes: tira error", () => {
    expect(() => resolverRangoPeriodo("mes_elegido", HOY)).toThrow();
  });

  it("personalizado: devuelve el rango recibido tal cual", () => {
    const rango = { desde: "2026-01-01", hasta: "2026-01-15" };
    expect(resolverRangoPeriodo("personalizado", HOY, rango)).toEqual(rango);
  });

  it("personalizado sin rango: tira error", () => {
    expect(() => resolverRangoPeriodo("personalizado", HOY)).toThrow();
  });
});
