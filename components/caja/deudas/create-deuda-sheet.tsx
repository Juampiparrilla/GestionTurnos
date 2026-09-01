"use client";

import { useState, useTransition } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput } from "@/components/productos/money-input";
import { PendingOverlay } from "@/components/pending-overlay";
import { uppercaseOnChange } from "@/lib/productos/uppercase-input";
import { showSuccessToast } from "@/lib/toast";
import { hoyISO } from "@/lib/caja/periodos";
import type { CajaDeuda } from "@/types/caja";

export function CreateDeudaSheet({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (deuda: CajaDeuda) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [monto, setMonto] = useState(0);
  const [observacion, setObservacion] = useState("");

  function handleSubmit(formData: FormData) {
    setError(null);

    const payload = {
      fecha: formData.get("fecha"),
      acreedor: formData.get("acreedor"),
      monto,
      observacion,
    };

    startTransition(async () => {
      const res = await fetch("/api/caja/deudas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo crear la deuda.");
        return;
      }

      onCreated(data.deuda);
      onOpenChange(false);
      setMonto(0);
      setObservacion("");
      showSuccessToast("Deuda registrada con éxito");
    });
  }

  return (
    <>
      <PendingOverlay pending={isPending} />
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Registrar deuda</SheetTitle>
          </SheetHeader>
          <form action={handleSubmit} className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" name="fecha" type="date" defaultValue={hoyISO()} max={hoyISO()} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acreedor">A quién se le debe</Label>
              <Input
                id="acreedor"
                name="acreedor"
                maxLength={150}
                placeholder="Ej. JUAN (PRÉSTAMO ALQUILER)"
                onChange={uppercaseOnChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monto">Importe</Label>
              <MoneyInput id="monto" value={monto} onChange={setMonto} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacion">Observación (opcional)</Label>
              <Textarea
                id="observacion"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value.toUpperCase())}
                maxLength={500}
                rows={2}
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <SheetFooter className="px-0">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Registrar deuda"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
