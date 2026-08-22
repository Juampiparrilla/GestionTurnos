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
import { Textarea } from "@/components/ui/textarea";

export function CreateBoardSheet({
  open,
  onOpenChange,
}: {
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
      description: formData.get("description"),
    };

    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo crear el horario.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onOpenChange(false);
    router.push(`/tableros/${data.id}/configuracion`);
  }

  return (
    <>
      <PendingOverlay pending={isSubmitting} />
      <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Crear horario</SheetTitle>
          <SheetDescription>
            Representa un local o unidad de trabajo. Después vas a poder asignar
            personas y configurar sus turnos.
          </SheetDescription>
        </SheetHeader>
        <form action={handleSubmit} className="flex flex-col gap-4 px-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" maxLength={100} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea id="description" name="description" maxLength={500} rows={3} />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <SheetFooter className="px-0">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear horario"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
      </Sheet>
    </>
  );
}
