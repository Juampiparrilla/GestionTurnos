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
// - "descuento": el proveedor nos pasa el precio de lista final de ESE
//   producto, y a eso se le resta un % de descuento -- no tiene nada que
//   ver con paquetes ni cantidades, es solo precio × (1 - %).
//
// "¿Viene en un paquete de varias?" es un concepto aparte, exclusivo de
// productos por Unidad (ej. una caja de 12 sachets): no depende de qué
// toggle de arriba esté activo, aparece solo por elegir "Se vende por:
// Unidad". Si está activo, divide el resultado de CUALQUIERA de los dos
// modos de cálculo (no solo "descuento"). Para productos por Kg no
// existe -- ahí "Compré varias unidades por un total" pide su propia
// cantidad, igual que siempre.
export function CostoUnitarioField({
  costo,
  onCostoChange,
  unidadMedida,
}: {
  costo: number;
  onCostoChange: (value: number) => void;
  unidadMedida: "kg" | "unidad";
}) {
  const [modo, setModo] = useState<Modo>("directo");

  const [cantidadKg, setCantidadKg] = useState(1);
  const [costoTotal, setCostoTotal] = useState(0);

  const [precioLista, setPrecioLista] = useState(0);
  const [descuento, setDescuento] = useState(0);

  const [cantidadPaquete, setCantidadPaquete] = useState(1);
  const [costoDirecto, setCostoDirecto] = useState(costo);

  function activarModo(nuevoModo: Modo, activo: boolean) {
    setModo(activo ? nuevoModo : "directo");
  }

  function actualizarDirecto(valor: number, paquete: number) {
    setCostoDirecto(valor);
    const divisor = unidadMedida === "unidad" ? paquete : 1;
    onCostoChange(divisor > 0 ? redondear(valor / divisor) : valor);
  }

  function actualizarUnidadesKg(nuevaCantidad: number, nuevoCostoTotal: number) {
    setCantidadKg(nuevaCantidad);
    setCostoTotal(nuevoCostoTotal);
    if (nuevaCantidad > 0) {
      onCostoChange(redondear(nuevoCostoTotal / nuevaCantidad));
    }
  }

  function actualizarUnidadesConPaquete(nuevoCostoTotal: number, paquete: number) {
    setCostoTotal(nuevoCostoTotal);
    if (paquete > 0) {
      onCostoChange(redondear(nuevoCostoTotal / paquete));
    }
  }

  function actualizarDescuento(nuevoPrecioLista: number, nuevoDescuento: number, paquete: number) {
    setPrecioLista(nuevoPrecioLista);
    setDescuento(nuevoDescuento);
    const base = redondear(nuevoPrecioLista * (1 - nuevoDescuento / 100));
    onCostoChange(unidadMedida === "unidad" && paquete > 0 ? redondear(base / paquete) : base);
  }

  function actualizarPaquete(nuevoPaquete: number) {
    setCantidadPaquete(nuevoPaquete);
    if (modo === "unidades") {
      actualizarUnidadesConPaquete(costoTotal, nuevoPaquete);
    } else if (modo === "descuento") {
      actualizarDescuento(precioLista, descuento, nuevoPaquete);
    } else {
      actualizarDirecto(costoDirecto, nuevoPaquete);
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

      {unidadMedida === "unidad" && (
        <div className="space-y-1">
          <Label htmlFor="cantidad-paquete">¿Compraste un paquete de varias? (dejá 1 si no)</Label>
          <Input
            id="cantidad-paquete"
            type="number"
            step="1"
            min="1"
            value={cantidadPaquete || ""}
            onChange={(e) => actualizarPaquete(Number(e.target.value))}
          />
        </div>
      )}

      {modo === "unidades" && (
        <div className="space-y-2 rounded-lg border p-3">
          {unidadMedida === "kg" ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cantidad-unidades">Cantidad</Label>
                <Input
                  id="cantidad-unidades"
                  type="number"
                  step="1"
                  min="1"
                  value={cantidadKg || ""}
                  onChange={(e) => actualizarUnidadesKg(Number(e.target.value), costoTotal)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="costo-total-unidades">Costo total</Label>
                <MoneyInput
                  id="costo-total-unidades"
                  value={costoTotal}
                  onChange={(value) => actualizarUnidadesKg(cantidadKg, value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <Label htmlFor="costo-total-unidades">Costo total del paquete</Label>
              <MoneyInput
                id="costo-total-unidades"
                value={costoTotal}
                onChange={(value) => actualizarUnidadesConPaquete(value, cantidadPaquete)}
              />
            </div>
          )}
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
          <p className="text-xs text-muted-foreground">
            Precio de costo unitario: ${costo.toLocaleString("es-AR")}
          </p>
        </div>
      )}

      {modo === "directo" && (
        <div className="space-y-2">
          <Label htmlFor="costo">
            {unidadMedida === "unidad" && cantidadPaquete > 1 ? "Precio de costo del paquete" : "Precio de costo"}
          </Label>
          <MoneyInput
            id="costo"
            required
            value={costoDirecto}
            onChange={(value) => actualizarDirecto(value, cantidadPaquete)}
          />
          {unidadMedida === "unidad" && cantidadPaquete > 1 && (
            <p className="text-xs text-muted-foreground">
              Precio de costo unitario: ${costo.toLocaleString("es-AR")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
