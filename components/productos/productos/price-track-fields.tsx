"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MoneyInput } from "@/components/productos/money-input";

// Un bloque de precio (bolsa cerrada o bolsa abierta): o se carga el % de
// ganancia y el precio se calcula solo, o se fija el precio a mano (el %
// que se ve pasa a ser solo informativo, el servidor lo recalcula al revés
// para mostrarlo consistente -- ver lib/productos/calcular-precio.ts).
export function PriceTrackFields({
  label,
  namePrefix,
  costo,
  porcentaje,
  onPorcentajeChange,
  manual,
  onManualChange,
  precioManual,
  onPrecioManualChange,
  kgPorBolsa,
}: {
  label: string;
  namePrefix: string;
  costo: number;
  porcentaje: number;
  onPorcentajeChange: (value: number) => void;
  manual: boolean;
  onManualChange: (value: boolean) => void;
  precioManual: number;
  onPrecioManualChange: (value: number) => void;
  // Solo para la pista "Bolsa abierta": el costo/precio de esta pista es
  // sobre la bolsa entera (misma base que "Bolsa cerrada"), así que acá se
  // muestra además a cuánto equivale el kg suelto -- lo que realmente se
  // usa al vender por peso. Si se pasa, se agrega esa línea extra.
  kgPorBolsa?: number;
}) {
  const precioCalculado = costo > 0 ? Math.round(costo * (1 + porcentaje / 100) * 100) / 100 : 0;
  const precioFinal = manual ? precioManual : precioCalculado;
  const precioPorKg =
    kgPorBolsa && kgPorBolsa > 0 ? Math.round((precioFinal / kgPorBolsa) * 100) / 100 : null;

  return (
    <fieldset className="flex flex-col gap-3 rounded-lg border border-zinc-300 bg-zinc-100 p-3 dark:border-zinc-700 dark:bg-zinc-800">
      <legend className="px-1 text-sm font-medium">{label}</legend>

      <div className="flex items-center justify-between">
        <Label htmlFor={`${namePrefix}-manual`} className="text-xs text-muted-foreground">
          Fijar precio manualmente
        </Label>
        <Switch id={`${namePrefix}-manual`} checked={manual} onCheckedChange={onManualChange} />
      </div>

      {manual ? (
        <div className="space-y-2">
          <Label htmlFor={`${namePrefix}-precio`}>Precio de venta</Label>
          <MoneyInput
            id={`${namePrefix}-precio`}
            required
            value={precioManual}
            onChange={onPrecioManualChange}
          />
          {precioPorKg !== null && (
            <p className="text-xs text-muted-foreground">Precio por kg: ${precioPorKg.toLocaleString("es-AR")}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor={`${namePrefix}-porcentaje`}>% de ganancia</Label>
          <Input
            id={`${namePrefix}-porcentaje`}
            type="number"
            step="0.01"
            min="0"
            value={porcentaje || ""}
            onChange={(e) => onPorcentajeChange(e.target.value ? Number(e.target.value) : 0)}
          />
          <p className="text-xs text-muted-foreground">
            Precio de venta: ${precioCalculado.toLocaleString("es-AR")}
          </p>
          {precioPorKg !== null && (
            <p className="text-xs text-muted-foreground">Precio por kg: ${precioPorKg.toLocaleString("es-AR")}</p>
          )}
        </div>
      )}
    </fieldset>
  );
}
