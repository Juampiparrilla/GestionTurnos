"use client";

import { useState, useTransition } from "react";
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
import { uppercaseOnChange } from "@/lib/productos/uppercase-input";
import { showSuccessToast } from "@/lib/toast";
import type { Categoria } from "@/types/categoria";

export function EditCategoriaSheet({
  categoria,
  open,
  onOpenChange,
}: {
  categoria: Categoria;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(categoria.active);

  function handleSubmit(formData: FormData) {
    setError(null);

    const payload = {
      nombre: formData.get("nombre"),
      descripcion: formData.get("descripcion"),
      active,
    };

    startTransition(async () => {
      const res = await fetch(`/api/categorias/${categoria.id}`, {
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
      showSuccessToast("Categoría actualizada con éxito");
      router.refresh();
    });
  }

  return (
    <>
      <PendingOverlay pending={isPending} />
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Editar categoría</SheetTitle>
          </SheetHeader>
          <form action={handleSubmit} className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                defaultValue={categoria.nombre}
                maxLength={100}
                onChange={uppercaseOnChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Input
                id="descripcion"
                name="descripcion"
                defaultValue={categoria.descripcion ?? ""}
                maxLength={500}
                onChange={uppercaseOnChange}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="active">Categoría activa</Label>
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
