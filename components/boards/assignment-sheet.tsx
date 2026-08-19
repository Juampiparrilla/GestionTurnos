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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ASSIGNMENT_STATUS_LABEL,
  DAY_LABELS,
  type AssignmentStatus,
  type ShiftAssignment,
} from "@/types/assignment";
import type { OrgDirectoryEntry } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";

export function AssignmentSheet({
  boardId,
  shift,
  dayOfWeek,
  currentAssignment,
  members,
  onOpenChange,
}: {
  boardId: string;
  shift: ShiftConfiguration;
  dayOfWeek: number;
  currentAssignment: ShiftAssignment | null;
  members: OrgDirectoryEntry[];
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<AssignmentStatus>(currentAssignment?.status ?? "EMPLEADO");
  const [userId, setUserId] = useState<string>(currentAssignment?.user_id ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeRange = `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)}`;

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    const res = await fetch(`/api/boards/${boardId}/assignments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shiftConfigurationId: shift.id,
        dayOfWeek,
        status,
        userId: status === "EMPLEADO" ? userId : null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar la asignación.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto w-full max-w-md">
        <SheetHeader>
          <SheetTitle>
            {DAY_LABELS[dayOfWeek]} · {shift.name ? `${shift.name} · ${timeRange}` : timeRange}
          </SheetTitle>
          <SheetDescription>Elegí qué pasa con este turno.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v as AssignmentStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ASSIGNMENT_STATUS_LABEL) as AssignmentStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {ASSIGNMENT_STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {status === "EMPLEADO" && (
            <div className="space-y-2">
              <Label htmlFor="user">Persona</Label>
              <Select value={userId} onValueChange={(v) => setUserId(v ?? "")}>
                <SelectTrigger id="user">
                  <SelectValue placeholder="Elegir persona..." />
                </SelectTrigger>
                <SelectContent>
                  {members.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Este tablero no tiene personas asignadas todavía.
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
          )}

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
            disabled={isSubmitting || (status === "EMPLEADO" && !userId)}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
