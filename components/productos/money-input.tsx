"use client";

import { Input } from "@/components/ui/input";

// Input de dinero: muestra "$" + separador de miles (formato es-AR) y solo
// deja tipear dígitos -- internamente siempre maneja un número entero de
// pesos, sin decimales (los costos/precios de este negocio son siempre
// montos redondos).
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
  const display = value ? value.toLocaleString("es-AR") : "";

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, "");
    onChange(digits ? Number(digits) : 0);
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
        $
      </span>
      <Input
        id={id}
        inputMode="numeric"
        required={required}
        value={display}
        onChange={handleChange}
        className="pl-6"
      />
    </div>
  );
}
