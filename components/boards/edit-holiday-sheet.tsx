"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { OrgDirectoryEntry } from "@/types/board";
import type { Holiday } from "@/types/holiday";

export function EditHolidaySheet({
  boardId,
  holiday,
  members,
  onOpenChange,
}: {
  boardId: string;
  holiday: Holiday;
  members: OrgDirectoryEntry[];
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [date, setDate] = useState(holiday.holiday_date);
  const [userId, setUserId] = useState(holiday.user_id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    const res = await fetch(`/api/boards/${boardId}/holidays/${holiday.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ holidayDate: date, userId }),
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

  async function handleDelete() {
    setIsDeleting(true);

    const res = await fetch(`/api/boards/${boardId}/holidays/${holiday.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "No se pudo eliminar el feriado.");
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      return;
    }

    setIsDeleting(false);
    setDeleteConfirmOpen(false);
    onOpenChange(false);
    router.refresh();
  }

  return (
    <>
      <Sheet open onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="mx-auto w-full max-w-md">
          <SheetHeader>
            <SheetTitle>Editar feriado</SheetTitle>
            <SheetDescription>Cambiá la fecha o la persona asignada.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="edit-holiday-date">Fecha</Label>
              <Input
                id="edit-holiday-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-holiday-user">Persona</Label>
              <Select value={userId} onValueChange={(v) => v && setUserId(v)}>
                <SelectTrigger id="edit-holiday-user">
                  <SelectValue>
                    {(value: string) =>
                      members.find((m) => m.id === value)?.full_name ?? "Elegir persona..."
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <SheetFooter className="flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={isSubmitting || isDeleting}
            >
              <Trash2 className="size-4" />
              Eliminar
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting || isDeleting || !date || !userId}
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este feriado?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
