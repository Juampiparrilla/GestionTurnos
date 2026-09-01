"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

function formatMonto(value: number) {
  return value ? value.toLocaleString("es-AR", { maximumFractionDigits: 2 }) : "";
}

function formatEntero(digitos: string) {
  return digitos ? Number(digitos).toLocaleString("es-AR") : "";
}

// Input de dinero: muestra "$" + formato es-AR (punto de miles, coma
// decimal). Se guarda el texto tipeado aparte del valor numérico -- si se
// reformateara en cada tecla, la coma decimal desaparecería del input antes
// de poder escribir los decimales (ej. al tipear "1253," se perdería la
// coma apenas se reformatea a "1.253").
export function MoneyInput({
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
  const [text, setText] = useState(() => formatMonto(value));
  const ultimoEmitido = useRef(value);

  useEffect(() => {
    if (value !== ultimoEmitido.current) {
      setText(formatMonto(value));
      ultimoEmitido.current = value;
    }
  }, [value]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const soloValidos = event.target.value.replace(/[^\d,]/g, "");
    const primeraComa = soloValidos.indexOf(",");
    const tieneComa = primeraComa !== -1;
    const enteroDigitos = tieneComa ? soloValidos.slice(0, primeraComa) : soloValidos;
    const decimales = tieneComa ? soloValidos.slice(primeraComa + 1).replace(/,/g, "").slice(0, 2) : "";

    // El entero se reformatea con el punto de miles en cada tecla (como
    // antes de admitir decimales); la parte decimal se deja tal cual se
    // tipea para no perder la coma a mitad de camino.
    const normalizado = tieneComa ? `${formatEntero(enteroDigitos)},${decimales}` : formatEntero(enteroDigitos);

    const comoNumero = `${enteroDigitos || "0"}.${decimales || "0"}`;
    const parsed = Number(comoNumero);
    const final = Number.isNaN(parsed) ? 0 : parsed;

    setText(normalizado);
    ultimoEmitido.current = final;
    onChange(final);
  }

  function handleBlur() {
    setText(formatMonto(value));
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
        $
      </span>
      <Input
        id={id}
        inputMode="decimal"
        required={required}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        className="pl-6"
      />
    </div>
  );
}
