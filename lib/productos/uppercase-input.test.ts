import { describe, expect, it } from "vitest";
import type { ChangeEvent } from "react";
import { uppercaseOnChange } from "@/lib/productos/uppercase-input";

function fakeEvent(value: string): ChangeEvent<HTMLInputElement> {
  return { target: { value } } as ChangeEvent<HTMLInputElement>;
}

describe("uppercaseOnChange", () => {
  it("convierte el valor tipeado a mayúsculas", () => {
    const event = fakeEvent("coco rallado");
    uppercaseOnChange(event);
    expect(event.target.value).toBe("COCO RALLADO");
  });

  it("respeta acentos y ñ", () => {
    const event = fakeEvent("ración canina");
    uppercaseOnChange(event);
    expect(event.target.value).toBe("RACIÓN CANINA");
  });
});
