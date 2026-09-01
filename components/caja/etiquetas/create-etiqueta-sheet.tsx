"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PendingOverlay } from "@/components/pending-overlay";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uppercaseOnChange } from "@/lib/productos/uppercase-input";
import { showSuccessToast } from "@/lib/toast";
import { TIPO_MOVIMIENTO_LABEL, type TipoMovimientoCaja } from "@/types/caja";

export function CreateEtiquetaSheet({
  open,
  onOpenChange,
  tipoInicial,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoInicial?: TipoMovimientoCaja;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tipo, setTipo] = useState<TipoMovimientoCaja>(tipoInicial ?? "ingreso");

  function handleSubmit(formData: FormData) {
    setError(null);

    const payload = {
      nombre: formData.get("nombre"),
      tipo,
    };

    startTransition(async () => {
      const res = await fetch("/api/caja/etiquetas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo crear la etiqueta.");
        return;
      }

      onOpenChange(false);
      showSuccessToast("Etiqueta creada con éxito");
      router.refresh();
    });
  }

  return (
    <>
      <PendingOverlay pending={isPending} />
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Crear etiqueta</SheetTitle>
          </SheetHeader>
          <form action={handleSubmit} className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                maxLength={100}
                placeholder="Ej. VENTA DEL DÍA"
                onChange={uppercaseOnChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo((v as TipoMovimientoCaja) ?? "ingreso")}>
                <SelectTrigger id="tipo" className="w-full">
                  <SelectValue>{(v: TipoMovimientoCaja) => TIPO_MOVIMIENTO_LABEL[v]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingreso">Ingreso</SelectItem>
                  <SelectItem value="egreso">Egreso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <SheetFooter className="px-0">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creando..." : "Crear etiqueta"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
