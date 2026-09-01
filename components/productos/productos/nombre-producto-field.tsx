"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Sugerencias de nombres ya cargados mientras se tipea, para evitar
// duplicar un producto con una pequeña diferencia de tipeo. Se hace a
// mano en vez de <datalist> nativo: en varios navegadores móviles tocar
// una sugerencia del datalist no la selecciona de forma confiable.
export function NombreProductoField({
  value,
  onChange,
  nombresExistentes,
  excluir,
}: {
  value: string;
  onChange: (value: string) => void;
  nombresExistentes: string[];
  excluir?: string;
}) {
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const sugerencias = value.trim()
    ? nombresExistentes.filter((n) => n !== excluir && n.includes(value.trim())).slice(0, 6)
    : [];

  function elegir(sugerencia: string) {
    onChange(sugerencia);
    setMostrarSugerencias(false);
  }

  return (
    <div className="relative space-y-2">
      <Label htmlFor="nombre">Nombre</Label>
      <Input
        id="nombre"
        name="nombre"
        maxLength={150}
        placeholder="Ej. ADULTO RAZA PEQUEÑA"
        value={value}
        onChange={(e) => {
          onChange(e.target.value.toUpperCase());
          setMostrarSugerencias(true);
        }}
        onFocus={() => setMostrarSugerencias(true)}
        onBlur={() => setMostrarSugerencias(false)}
        autoComplete="off"
        required
      />
      {mostrarSugerencias && sugerencias.length > 0 && (
        <div className="absolute z-10 w-full rounded-lg border bg-popover p-1 shadow-md">
          {sugerencias.map((s) => (
            <button
              key={s}
              type="button"
              // onMouseDown (no onClick) + preventDefault: evita que el
              // blur del input cierre la lista antes de que se registre
              // el tap sobre la sugerencia -- crítico en touch.
              onMouseDown={(e) => {
                e.preventDefault();
                elegir(s);
              }}
              className="block w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
