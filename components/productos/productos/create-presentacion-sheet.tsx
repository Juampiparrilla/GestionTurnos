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
import { PriceTrackFields } from "./price-track-fields";

export function CreatePresentacionSheet({
  productoId,
  open,
  onOpenChange,
}: {
  productoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [kg, setKg] = useState(0);
  const [sku, setSku] = useState("");
  const [costo, setCosto] = useState(0);
  const [porcentajeCerrada, setPorcentajeCerrada] = useState(30);
  const [manualCerrada, setManualCerrada] = useState(false);
  const [precioManualCerrada, setPrecioManualCerrada] = useState(0);
  const [porcentajeAbierta, setPorcentajeAbierta] = useState(45);
  const [manualAbierta, setManualAbierta] = useState(false);
  const [precioManualAbierta, setPrecioManualAbierta] = useState(0);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      productoId,
      kg,
      sku,
      costo,
      porcentajeCerrada,
      manualCerrada,
      precioManualCerrada,
      porcentajeAbierta,
      manualAbierta,
      precioManualAbierta,
    };

    const res = await fetch("/api/presentaciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo crear la presentación.");
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
            <SheetTitle>Agregar presentación</SheetTitle>
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
                <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())} />
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
              namePrefix="cerrada"
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
              namePrefix="abierta"
              costo={costo}
              porcentaje={porcentajeAbierta}
              onPorcentajeChange={setPorcentajeAbierta}
              manual={manualAbierta}
              onManualChange={setManualAbierta}
              precioManual={precioManualAbierta}
              onPrecioManualChange={setPrecioManualAbierta}
            />

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <SheetFooter className="px-0">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Agregar presentación"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
