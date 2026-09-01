import { describe, expect, it } from "vitest";
import { formatCantidad } from "@/lib/productos/formato-cantidad";

describe("formatCantidad", () => {
  it("muestra kg para productos por Kg", () => {
    expect(formatCantidad(20, "kg")).toBe("20 kg");
  });

  it("muestra un. para productos por Unidad", () => {
    expect(formatCantidad(1, "unidad")).toBe("1 un.");
  });

  it("respeta un decimal en Kg (ej. medio kilo)", () => {
    expect(formatCantidad(0.5, "kg")).toBe("0.5 kg");
  });
});
