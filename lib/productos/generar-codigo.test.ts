import { describe, expect, it } from "vitest";
import { generarCodigoBase, generarCodigoConSufijo } from "@/lib/productos/generar-codigo";

describe("generarCodigoBase", () => {
  it("arma un código en mayúsculas con guiones a partir del nombre", () => {
    expect(generarCodigoBase("Alimento Perro Adulto")).toBe("ALIMENTO-PERRO-ADULTO");
  });

  it("saca acentos y caracteres que no son letras o números", () => {
    expect(generarCodigoBase("Ración Canina (25kg) - Óptima")).toBe("RACION-CANINA-25KG-OPTIMA");
  });

  it("no explota con un nombre sin ningún caracter alfanumérico", () => {
    expect(generarCodigoBase("---")).toBe("PRODUCTO");
  });

  it("recorta a 40 caracteres", () => {
    const nombreLargo = "Alimento balanceado super premium para perros adultos de raza grande";
    expect(generarCodigoBase(nombreLargo).length).toBeLessThanOrEqual(40);
  });
});

describe("generarCodigoConSufijo", () => {
  it("devuelve la base tal cual en el primer intento", () => {
    expect(generarCodigoConSufijo("ALIMENTO", 0)).toBe("ALIMENTO");
  });

  it("agrega un sufijo numérico a partir del segundo intento", () => {
    expect(generarCodigoConSufijo("ALIMENTO", 1)).toBe("ALIMENTO-2");
    expect(generarCodigoConSufijo("ALIMENTO", 2)).toBe("ALIMENTO-3");
  });
});
