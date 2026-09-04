"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { formatMonto } from "@/lib/caja/formato-moneda";

function formatEntero(digitos: string) {
  return digitos ? Number(digitos).toLocaleString("es-AR") : "";
}

// Extrae los términos con signo de la expresión cruda, ej. "5000+3000-1500"
// -> ["5000", "+3000", "-1500"].
function extraerTerminos(raw: string): string[] {
  return raw.match(/[+-]?\d+/g) ?? [];
}

function calcularTotal(raw: string): number {
  return extraerTerminos(raw).reduce((acc, t) => acc + Number(t), 0);
}

// Reconstruye la expresión formateando cada número con separador de miles,
// preservando los signos +/- tal cual los escribió el usuario.
function formatearVisual(raw: string): string {
  let resultado = "";
  let i = 0;
  while (i < raw.length) {
    const char = raw[i];
    if (char === "+" || char === "-") {
      resultado += char;
      i++;
      continue;
    }
    let numero = "";
    while (i < raw.length && /\d/.test(raw[i])) {
      numero += raw[i];
      i++;
    }
    resultado += formatEntero(numero);
  }
  return resultado;
}

// Importe de Caja: además de tipear un número, se puede escribir una suma
// de varias ventas separadas por "+" (o restar con "-"), ej. "5000+3000+1500"
// -- para cargar el total del día sin necesitar una calculadora aparte. Solo
// se admiten dígitos, "+" y "-"; el resultado nunca puede ser negativo.
export function MontoSumaInput({
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
  const [raw, setRaw] = useState(() => (value ? String(value) : ""));
  const ultimoEmitido = useRef(value);

  useEffect(() => {
    if (value !== ultimoEmitido.current) {
      setRaw(value ? String(value) : "");
      ultimoEmitido.current = value;
    }
  }, [value]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    let nuevoRaw = event.target.value.replace(/[^\d+-]/g, "");
    // Colapsa signos repetidos ("5000+-3000" -> "5000-3000") y saca un "+"
    // suelto al principio (no suma nada estar ahí).
    nuevoRaw = nuevoRaw.replace(/[+-]{2,}/g, (m) => m.slice(-1)).replace(/^\+/, "");

    setRaw(nuevoRaw);
    const total = Math.max(0, calcularTotal(nuevoRaw));
    ultimoEmitido.current = total;
    onChange(total);
  }

  const terminos = extraerTerminos(raw);
  const total = calcularTotal(raw);

  return (
    <div className="space-y-1">
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
          $
        </span>
        <Input
          id={id}
          inputMode="tel"
          required={required}
          value={formatearVisual(raw)}
          onChange={handleChange}
          placeholder="Ej. 5000+3000"
          className="pl-6"
        />
      </div>
      {terminos.length > 1 && <p className="text-xs text-muted-foreground">Total: {formatMonto(total)}</p>}
    </div>
  );
}
