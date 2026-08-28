"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MoneyInput } from "@/components/productos/money-input";

type Modo = "directo" | "unidades" | "descuento";

function redondear(value: number): number {
  return Math.round(value * 100) / 100;
}

// El costo unitario se puede cargar de tres formas: directo, o calculado
// a partir de otro dato que sí tenemos a mano --
// - "unidades": compramos varias unidades por un total (ej. 3 bolsas por
//   $18.000) y queremos el costo de una sola.
// - "descuento": el proveedor nos pasa el precio de lista final, y a eso
//   se le resta un % de descuento para llegar al costo real.
// Los dos modos son excluyentes entre sí y con la carga directa -- lo
// único que se guarda siempre es el costo unitario resultante.
export function CostoUnitarioField({
  costo,
  onCostoChange,
}: {
  costo: number;
  onCostoChange: (value: number) => void;
}) {
  const [modo, setModo] = useState<Modo>("directo");

  const [cantidad, setCantidad] = useState(1);
  const [costoTotal, setCostoTotal] = useState(0);

  const [precioLista, setPrecioLista] = useState(0);
  const [descuento, setDescuento] = useState(0);
  const [cantidadPaquete, setCantidadPaquete] = useState(1);

  function activarModo(nuevoModo: Modo, activo: boolean) {
    setModo(activo ? nuevoModo : "directo");
  }

  function actualizarUnidades(nuevaCantidad: number, nuevoCostoTotal: number) {
    setCantidad(nuevaCantidad);
    setCostoTotal(nuevoCostoTotal);
    if (nuevaCantidad > 0) {
      onCostoChange(redondear(nuevoCostoTotal / nuevaCantidad));
    }
  }

  // El precio de lista con descuento puede venir de un paquete de varias
  // unidades (ej. una caja de 12 con precio de lista $40.000 y 25% off:
  // $30.000 la caja, $2.500 cada una) -- cantidadPaquete en 1 (default)
  // da el mismo resultado que antes, sin paquete de por medio.
  function actualizarDescuento(nuevoPrecioLista: number, nuevoDescuento: number, nuevaCantidadPaquete: number) {
    setPrecioLista(nuevoPrecioLista);
    setDescuento(nuevoDescuento);
    setCantidadPaquete(nuevaCantidadPaquete);
    if (nuevaCantidadPaquete > 0) {
      onCostoChange(redondear((nuevoPrecioLista * (1 - nuevoDescuento / 100)) / nuevaCantidadPaquete));
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="calcular-unidades" className="text-xs text-muted-foreground">
          Compré varias unidades por un total
        </Label>
        <Switch
          id="calcular-unidades"
          checked={modo === "unidades"}
          onCheckedChange={(checked) => activarModo("unidades", checked)}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="calcular-descuento" className="text-xs text-muted-foreground">
          Precio de lista con descuento
        </Label>
        <Switch
          id="calcular-descuento"
          checked={modo === "descuento"}
          onCheckedChange={(checked) => activarModo("descuento", checked)}
        />
      </div>

      {modo === "unidades" && (
        <div className="space-y-2 rounded-lg border p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="cantidad-unidades">Cantidad</Label>
              <Input
                id="cantidad-unidades"
                type="number"
                step="1"
                min="1"
                value={cantidad || ""}
                onChange={(e) => actualizarUnidades(Number(e.target.value), costoTotal)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="costo-total-unidades">Costo total</Label>
              <MoneyInput
                id="costo-total-unidades"
                value={costoTotal}
                onChange={(value) => actualizarUnidades(cantidad, value)}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Precio de costo unitario: ${costo.toLocaleString("es-AR")}
          </p>
        </div>
      )}

      {modo === "descuento" && (
        <div className="space-y-2 rounded-lg border p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="precio-lista">Precio de lista</Label>
              <MoneyInput
                id="precio-lista"
                value={precioLista}
                onChange={(value) => actualizarDescuento(value, descuento, cantidadPaquete)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="descuento-lista">% de descuento</Label>
              <Input
                id="descuento-lista"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={descuento || ""}
                onChange={(e) => actualizarDescuento(precioLista, Number(e.target.value) || 0, cantidadPaquete)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="cantidad-paquete">
              Ese precio es de un paquete de (dejá 1 si es por unidad)
            </Label>
            <Input
              id="cantidad-paquete"
              type="number"
              step="1"
              min="1"
              value={cantidadPaquete || ""}
              onChange={(e) => actualizarDescuento(precioLista, descuento, Number(e.target.value))}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Precio de costo unitario: ${costo.toLocaleString("es-AR")}
          </p>
        </div>
      )}

      {modo === "directo" && (
        <div className="space-y-2">
          <Label htmlFor="costo">Precio de costo</Label>
          <MoneyInput id="costo" required value={costo} onChange={onCostoChange} />
        </div>
      )}
    </div>
  );
}
