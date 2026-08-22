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

export function CreateShiftSheet({
  boardId,
  open,
  onOpenChange,
}: {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: formData.get("name"),
      start_time: formData.get("start_time"),
      end_time: formData.get("end_time"),
    };

    const res = await fetch(`/api/boards/${boardId}/shifts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo crear el turno.");
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
          <SheetTitle>Agregar turno</SheetTitle>
          <SheetDescription>
            El nombre es opcional — si lo dejás vacío, se muestra solo el horario.
          </SheetDescription>
        </SheetHeader>
        <form action={handleSubmit} className="flex flex-col gap-4 px-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre (opcional)</Label>
            <Input id="name" name="name" maxLength={50} placeholder="Ej. Mañana" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Hora de inicio</Label>
              <Input id="start_time" name="start_time" type="time" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">Hora de fin</Label>
              <Input id="end_time" name="end_time" type="time" required />
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <SheetFooter className="px-0">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Agregar turno"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
      </Sheet>
    </>
  );
}
