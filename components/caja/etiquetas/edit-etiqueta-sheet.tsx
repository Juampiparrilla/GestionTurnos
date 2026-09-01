"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PendingOverlay } from "@/components/pending-overlay";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uppercaseOnChange } from "@/lib/productos/uppercase-input";
import { showSuccessToast } from "@/lib/toast";
import { TIPO_MOVIMIENTO_LABEL, type CajaEtiqueta, type TipoMovimientoCaja } from "@/types/caja";

export function EditEtiquetaSheet({
  etiqueta,
  enUso,
  open,
  onOpenChange,
}: {
  etiqueta: CajaEtiqueta;
  enUso: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tipo, setTipo] = useState<TipoMovimientoCaja>(etiqueta.tipo);
  const [active, setActive] = useState(etiqueta.active);

  function handleSubmit(formData: FormData) {
    setError(null);

    const payload = {
      nombre: formData.get("nombre"),
      tipo,
      active,
    };

    startTransition(async () => {
      const res = await fetch(`/api/caja/etiquetas/${etiqueta.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar el cambio.");
        return;
      }

      onOpenChange(false);
      showSuccessToast("Etiqueta actualizada con éxito");
      router.refresh();
    });
  }

  return (
    <>
      <PendingOverlay pending={isPending} />
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Editar etiqueta</SheetTitle>
          </SheetHeader>
          <form action={handleSubmit} className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                defaultValue={etiqueta.nombre}
                maxLength={100}
                onChange={uppercaseOnChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={tipo}
                onValueChange={(v) => setTipo((v as TipoMovimientoCaja) ?? etiqueta.tipo)}
                disabled={enUso}
              >
                <SelectTrigger id="tipo" className="w-full">
                  <SelectValue>{(v: TipoMovimientoCaja) => TIPO_MOVIMIENTO_LABEL[v]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingreso">Ingreso</SelectItem>
                  <SelectItem value="egreso">Egreso</SelectItem>
                </SelectContent>
              </Select>
              {enUso && (
                <p className="text-xs text-muted-foreground">
                  Esta etiqueta ya tiene movimientos cargados: no se puede cambiar el tipo. Creá otra etiqueta si
                  necesitás el otro tipo.
                </p>
              )}
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="active">Etiqueta activa</Label>
              <Switch id="active" checked={active} onCheckedChange={setActive} />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <SheetFooter className="px-0">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
