"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateShiftSheet } from "./create-shift-sheet";
import { EditShiftSheet } from "./edit-shift-sheet";
import type { ShiftConfiguration } from "@/types/shift";

function formatShift(shift: ShiftConfiguration) {
  const range = `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)}`;
  return { title: shift.name ?? range, subtitle: shift.name ? range : null };
}

export function ShiftsManagement({
  boardId,
  shifts,
  isAdmin,
}: {
  boardId: string;
  shifts: ShiftConfiguration[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftConfiguration | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const sorted = [...shifts].sort((a, b) => a.sort_order - b.sort_order);

  async function swap(a: ShiftConfiguration, b: ShiftConfiguration) {
    setIsReordering(true);
    await fetch(`/api/boards/${boardId}/shifts/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sort_order: b.sort_order }),
    });
    await fetch(`/api/boards/${boardId}/shifts/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sort_order: a.sort_order }),
    });
    setIsReordering(false);
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
      <h2 className="font-medium">Turnos</h2>

      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? "Todavía no configuraste turnos para este horario."
            : "Este horario todavía no tiene turnos configurados."}
        </p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((shift, index) => {
            const { title, subtitle } = formatShift(shift);
            return (
              <li
                key={shift.id}
                className="flex items-center justify-between rounded-lg border bg-background p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{title}</p>
                    {!shift.active && <Badge variant="outline">Inactivo</Badge>}
                  </div>
                  {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === 0 || isReordering}
                      onClick={() => swap(shift, sorted[index - 1])}
                      aria-label="Mover arriba"
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={index === sorted.length - 1 || isReordering}
                      onClick={() => swap(shift, sorted[index + 1])}
                      aria-label="Mover abajo"
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingShift(shift)}
                      aria-label="Editar turno"
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {isAdmin && (
        <Button type="button" variant="outline" className="w-full" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Agregar turno
        </Button>
      )}

      {isAdmin && (
        <CreateShiftSheet boardId={boardId} open={createOpen} onOpenChange={setCreateOpen} />
      )}

      {editingShift && (
        <EditShiftSheet
          shift={editingShift}
          open
          onOpenChange={(open) => {
            if (!open) setEditingShift(null);
          }}
        />
      )}
    </div>
  );
}
