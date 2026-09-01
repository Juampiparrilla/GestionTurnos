"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

// Input numérico para Kg/cantidad. Por Kg admite decimales (ej. 0.5) -- un
// <input type="number"> controlado con value={kg || ""} colapsa a vacío
// apenas el número vale 0, cortando la escritura de "0.5" a mitad de camino
// (después del "0" inicial). Acá se guarda el texto tipeado aparte del
// número, igual que en MoneyInput.
// Por Unidad (soloEnteros) no admite coma/punto -- no existe "0.5 unidades".
export function CantidadInput({
  id,
  value,
  onChange,
  soloEnteros,
  required,
}: {
  id: string;
  value: number;
  onChange: (value: number) => void;
  soloEnteros?: boolean;
  required?: boolean;
}) {
  const [text, setText] = useState(() => (value ? String(value) : ""));
  const ultimoEmitido = useRef(value);

  useEffect(() => {
    if (value !== ultimoEmitido.current) {
      setText(value ? String(value) : "");
      ultimoEmitido.current = value;
    }
  }, [value]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (soloEnteros) {
      const soloDigitos = event.target.value.replace(/\D/g, "");
      const parsed = soloDigitos === "" ? 0 : Number(soloDigitos);

      setText(soloDigitos);
      ultimoEmitido.current = parsed;
      onChange(parsed);
      return;
    }

    const limpio = event.target.value.replace(/[^\d.,]/g, "");
    let normalizado = "";
    let tieneSeparador = false;
    for (const char of limpio) {
      if (char === "." || char === ",") {
        if (tieneSeparador) continue;
        tieneSeparador = true;
        normalizado += ".";
      } else {
        normalizado += char;
      }
    }

    const parsed = normalizado === "" || normalizado === "." ? 0 : Number(normalizado);
    const final = Number.isNaN(parsed) ? 0 : parsed;

    setText(normalizado);
    ultimoEmitido.current = final;
    onChange(final);
  }

  function handleBlur() {
    setText(value ? String(value) : "");
  }

  return (
    <Input
      id={id}
      inputMode={soloEnteros ? "numeric" : "decimal"}
      required={required}
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}
