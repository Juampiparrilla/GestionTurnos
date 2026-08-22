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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Board } from "@/types/board";

export function EditBoardSheet({
  board,
  open,
  onOpenChange,
}: {
  board: Board;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(board.active);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: formData.get("name"),
      description: formData.get("description"),
      active,
    };

    const res = await fetch(`/api/boards/${board.id}`, {
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
          <SheetTitle>Editar horario</SheetTitle>
        </SheetHeader>
        <form action={handleSubmit} className="flex flex-col gap-4 px-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" defaultValue={board.name} maxLength={100} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={board.description ?? ""}
              maxLength={500}
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="active">Horario activo</Label>
              <p className="text-xs text-muted-foreground">
                Un horario inactivo deja de estar disponible para sus miembros.
              </p>
            </div>
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
