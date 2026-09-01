"use client";

import { useState, useTransition } from "react";
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
import { showSuccessToast } from "@/lib/toast";
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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<number | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    setResult(null);

    const cerrada = formData.get("porcentajeCerrada");
    const abierta = formData.get("porcentajeAbierta");
    const porMayor = formData.get("porcentajePorMayor");

    const payload = {
      porcentajeCerrada: cerrada ? Number(cerrada) : null,
      porcentajeAbierta: abierta ? Number(abierta) : null,
      porcentajePorMayor: porMayor ? Number(porMayor) : null,
    };

    startTransition(async () => {
      const res = await fetch(`/api/proveedores/${proveedor.id}/ajustar-porcentaje`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo aplicar el ajuste.");
        return;
      }

      setResult(data.updated as number);
      showSuccessToast(`Se actualizaron ${data.updated} ${data.updated === 1 ? "presentación" : "presentaciones"}`);
      router.refresh();
    });
  }

  return (
    <>
      <PendingOverlay pending={isPending} />
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
            <div className="space-y-2">
              <Label htmlFor="porcentajePorMayor">% ganancia por mayor</Label>
              <Input id="porcentajePorMayor" name="porcentajePorMayor" type="number" step="0.01" min="0" />
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
              <Button type="submit" disabled={isPending}>
                {isPending ? "Aplicando..." : "Aplicar"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
