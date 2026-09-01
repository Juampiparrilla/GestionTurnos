import { describe, expect, it } from "vitest";
import { formatMonto } from "@/lib/caja/formato-moneda";

describe("formatMonto", () => {
  it("formatea con punto de miles y signo $", () => {
    expect(formatMonto(185000)).toBe("$ 185.000");
  });

  it("redondea decimales", () => {
    expect(formatMonto(1250.6)).toBe("$ 1.251");
  });

  it("maneja cero", () => {
    expect(formatMonto(0)).toBe("$ 0");
  });

  it("formatea montos grandes", () => {
    expect(formatMonto(1250000)).toBe("$ 1.250.000");
  });
});
