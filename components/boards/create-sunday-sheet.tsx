"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
import type { OrgDirectoryEntry } from "@/types/board";

export function CreateSundaySheet({
  boardId,
  members,
  open,
  onOpenChange,
}: {
  boardId: string;
  members: OrgDirectoryEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [userId, setUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    const res = await fetch(`/api/boards/${boardId}/sundays`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sundayDate: date, userId }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar el domingo.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setDate("");
    setUserId("");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto w-full max-w-md">
        <SheetHeader>
          <SheetTitle>Asignar domingo</SheetTitle>
          <SheetDescription>Elegí la fecha y quién lo cubre.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          <div className="space-y-2">
            <Label htmlFor="sunday-date">Fecha</Label>
            <Input
              id="sunday-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sunday-user">Persona</Label>
            <Select value={userId} onValueChange={(v) => setUserId(v ?? "")}>
              <SelectTrigger id="sunday-user">
                <SelectValue placeholder="Elegir persona...">
                  {(value: string) =>
                    members.find((m) => m.id === value)?.full_name ?? "Elegir persona..."
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {members.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Este horario no tiene personas asignadas todavía.
                  </div>
                ) : (
                  members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.full_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
        <SheetFooter>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !date || !userId}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
