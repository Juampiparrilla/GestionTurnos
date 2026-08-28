"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MoneyInput } from "@/components/productos/money-input";

// Cuando el costo viene de comprar varias unidades por un total (ej. 3
// bolsas por $18.000), este campo calcula el costo unitario en vez de
// obligar a hacer la cuenta a mano -- lo que se guarda siempre es el
// costo unitario, cantidad/costo total son solo para el cálculo.
export function CostoUnitarioField({
  costo,
  onCostoChange,
}: {
  costo: number;
  onCostoChange: (value: number) => void;
}) {
  const [calcular, setCalcular] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [costoTotal, setCostoTotal] = useState(0);

  function actualizar(nuevaCantidad: number, nuevoCostoTotal: number) {
    setCantidad(nuevaCantidad);
    setCostoTotal(nuevoCostoTotal);
    if (nuevaCantidad > 0) {
      onCostoChange(Math.round((nuevoCostoTotal / nuevaCantidad) * 100) / 100);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="calcular-costo" className="text-xs text-muted-foreground">
          Compré varias unidades por un total
        </Label>
        <Switch id="calcular-costo" checked={calcular} onCheckedChange={setCalcular} />
      </div>

      {calcular ? (
        <div className="space-y-2 rounded-lg border p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="cantidad-unidades">Cantidad</Label>
              <Input
                id="cantidad-unidades"
                type="number"
                step="1"
                min="1"
                value={cantidad}
                onChange={(e) => actualizar(Number(e.target.value) || 1, costoTotal)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="costo-total-unidades">Costo total</Label>
              <MoneyInput
                id="costo-total-unidades"
                value={costoTotal}
                onChange={(value) => actualizar(cantidad, value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Precio de costo unitario: ${costo.toLocaleString("es-AR")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="costo">Precio de costo</Label>
          <MoneyInput id="costo" required value={costo} onChange={onCostoChange} />
        </div>
      )}
    </div>
  );
}
