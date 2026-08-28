"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PendingOverlay } from "@/components/pending-overlay";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Proveedor } from "@/types/proveedor";

export function AjustarPorcentajeSheet({
  proveedor,
  open,
  onOpenChange,
}: {
  proveedor: Proveedor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    const cerrada = formData.get("porcentajeCerrada");
    const abierta = formData.get("porcentajeAbierta");

    const payload = {
      porcentajeCerrada: cerrada ? Number(cerrada) : null,
      porcentajeAbierta: abierta ? Number(abierta) : null,
    };

    const res = await fetch(`/api/proveedores/${proveedor.id}/ajustar-porcentaje`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo aplicar el ajuste.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setResult(data.updated as number);
    router.refresh();
  }

  return (
    <>
      <PendingOverlay pending={isSubmitting} />
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Ajustar % de {proveedor.nombre}</SheetTitle>
            <SheetDescription>
              Aplica el nuevo % a todas las presentaciones de este proveedor que no tengan el precio
              fijado manualmente. Dejá un campo vacío para no tocar esa pista.
            </SheetDescription>
          </SheetHeader>
          <form action={handleSubmit} className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="porcentajeCerrada">% ganancia bolsa cerrada</Label>
              <Input id="porcentajeCerrada" name="porcentajeCerrada" type="number" step="0.01" min="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="porcentajeAbierta">% ganancia bolsa abierta</Label>
              <Input id="porcentajeAbierta" name="porcentajeAbierta" type="number" step="0.01" min="0" />
            </div>
            {result !== null && (
              <p className="text-sm text-muted-foreground">
                Se actualizaron {result} {result === 1 ? "presentación" : "presentaciones"}.
              </p>
            )}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <SheetFooter className="px-0">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Aplicando..." : "Aplicar"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
