"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
}) {
  const precioCalculado = costo > 0 ? Math.round(costo * (1 + porcentaje / 100) * 100) / 100 : 0;

  return (
    <fieldset className="flex flex-col gap-3 rounded-lg border p-3">
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
          <Input
            id={`${namePrefix}-precio`}
            type="number"
            step="0.01"
            min="0"
            required
            value={precioManual || ""}
            onChange={(e) => onPrecioManualChange(Number(e.target.value))}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor={`${namePrefix}-porcentaje`}>% de ganancia</Label>
          <Input
            id={`${namePrefix}-porcentaje`}
            type="number"
            step="0.01"
            min="0"
            required
            value={porcentaje || ""}
            onChange={(e) => onPorcentajeChange(Number(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">
            Precio de venta: ${precioCalculado.toLocaleString("es-AR")}
          </p>
        </div>
      )}
    </fieldset>
  );
}
