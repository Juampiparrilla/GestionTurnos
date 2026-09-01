"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

// Input numérico para Kg/cantidad con decimales (ej. 0.5). Un
// <input type="number"> controlado con value={kg || ""} colapsa a vacío
// apenas el número vale 0 -- eso corta la escritura de "0.5" a mitad de
// camino (después del "0" inicial) y solo dejaba completarlo tipeando
// ".5" directo. Acá se guarda el texto tipeado aparte del número, igual
// que en MoneyInput.
export function CantidadInput({
  id,
  value,
  onChange,
  required,
}: {
  id: string;
  value: number;
  onChange: (value: number) => void;
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
      inputMode="decimal"
      required={required}
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}
