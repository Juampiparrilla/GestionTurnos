"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PendingOverlay } from "@/components/pending-overlay";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PriceTrackFields } from "./price-track-fields";
import type { Presentacion } from "@/types/producto";

export function EditPresentacionSheet({
  presentacion,
  open,
  onOpenChange,
}: {
  presentacion: Presentacion;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [kg, setKg] = useState(presentacion.kg);
  const [sku, setSku] = useState(presentacion.sku ?? "");
  const [costo, setCosto] = useState(presentacion.costo);
  const [porcentajeCerrada, setPorcentajeCerrada] = useState(presentacion.porcentaje_ganancia_cerrada);
  const [manualCerrada, setManualCerrada] = useState(presentacion.precio_manual_cerrada);
  const [precioManualCerrada, setPrecioManualCerrada] = useState(presentacion.precio_venta_cerrada);
  const [porcentajeAbierta, setPorcentajeAbierta] = useState(presentacion.porcentaje_ganancia_abierta);
  const [manualAbierta, setManualAbierta] = useState(presentacion.precio_manual_abierta);
  const [precioManualAbierta, setPrecioManualAbierta] = useState(presentacion.precio_venta_abierta);
  const [active, setActive] = useState(presentacion.active);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      kg,
      sku,
      costo,
      porcentajeCerrada,
      manualCerrada,
      precioManualCerrada,
      porcentajeAbierta,
      manualAbierta,
      precioManualAbierta,
      active,
    };

    const res = await fetch(`/api/presentaciones/${presentacion.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar el cambio.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onOpenChange(false);
    router.refresh();
  }

  return (
    <>
      <PendingOverlay pending={isSubmitting} />
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Editar presentación</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="kg">Kg de la bolsa</Label>
                <Input
                  id="kg"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={kg || ""}
                  onChange={(e) => setKg(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU (opcional)</Label>
                <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="costo">Precio de costo</Label>
              <Input
                id="costo"
                type="number"
                step="0.01"
                min="0"
                required
                value={costo || ""}
                onChange={(e) => setCosto(Number(e.target.value))}
              />
            </div>

            <PriceTrackFields
              label="Bolsa cerrada"
              namePrefix="cerrada-edit"
              costo={costo}
              porcentaje={porcentajeCerrada}
              onPorcentajeChange={setPorcentajeCerrada}
              manual={manualCerrada}
              onManualChange={setManualCerrada}
              precioManual={precioManualCerrada}
              onPrecioManualChange={setPrecioManualCerrada}
            />
            <PriceTrackFields
              label="Bolsa abierta (por kg)"
              namePrefix="abierta-edit"
              costo={costo}
              porcentaje={porcentajeAbierta}
              onPorcentajeChange={setPorcentajeAbierta}
              manual={manualAbierta}
              onManualChange={setManualAbierta}
              precioManual={precioManualAbierta}
              onPrecioManualChange={setPrecioManualAbierta}
            />

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="active">Presentación activa</Label>
              <Switch id="active" checked={active} onCheckedChange={setActive} />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <SheetFooter className="px-0">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
