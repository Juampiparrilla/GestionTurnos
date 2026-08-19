"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { AssignmentSheet } from "./assignment-sheet";
import { DAY_LABELS, DAY_LABELS_SHORT, todayDayOfWeek } from "@/types/assignment";
import type { ShiftAssignment } from "@/types/assignment";
import type { Board, BoardMember, OrgDirectoryEntry } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";

export function BoardCalendar({
  board,
  shifts,
  assignments,
  members,
  directory,
  isAdmin,
}: {
  board: Board;
  shifts: ShiftConfiguration[];
  assignments: ShiftAssignment[];
  members: BoardMember[];
  directory: OrgDirectoryEntry[];
  isAdmin: boolean;
}) {
  const [selectedDay, setSelectedDay] = useState(todayDayOfWeek());
  const [editingShift, setEditingShift] = useState<ShiftConfiguration | null>(null);

  const directoryById = new Map(directory.map((d) => [d.id, d]));
  const memberDirectory = members
    .map((m) => directoryById.get(m.user_id))
    .filter((d): d is OrgDirectoryEntry => !!d);

  const assignmentsByKey = new Map(
    assignments.map((a) => [`${a.shift_configuration_id}:${a.day_of_week}`, a]),
  );

  const shiftsForDay = shifts;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{board.name}</h1>
            {!board.active && <Badge variant="outline">Inactivo</Badge>}
          </div>
          {board.description && (
            <p className="text-sm text-muted-foreground">{board.description}</p>
          )}
        </div>
        {isAdmin && (
          <Link
            href={`/tableros/${board.id}/configuracion`}
            aria-label="Configurar tablero"
            className={buttonVariants({ variant: "outline", size: "icon" })}
          >
            <Settings className="size-4" />
          </Link>
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {DAY_LABELS_SHORT.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setSelectedDay(index)}
            className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              selectedDay === index
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <h2 className="font-medium">{DAY_LABELS[selectedDay]}</h2>

      {shiftsForDay.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Este tablero todavía no tiene turnos configurados.
        </p>
      ) : (
        <div className="grid gap-3">
          {shiftsForDay.map((shift) => {
            const assignment = assignmentsByKey.get(`${shift.id}:${selectedDay}`);
            const person = assignment?.user_id ? directoryById.get(assignment.user_id) : null;
            const timeRange = `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)}`;

            return (
              <button
                key={shift.id}
                type="button"
                disabled={!isAdmin}
                onClick={() => setEditingShift(shift)}
                className="rounded-lg border bg-background p-4 text-left shadow-sm transition-colors enabled:hover:bg-muted/50"
              >
                <p className="text-sm text-muted-foreground">
                  {shift.name ? `${shift.name} · ${timeRange}` : timeRange}
                </p>
                <div className="mt-1">
                  {!assignment && (
                    <span className="text-sm text-muted-foreground">Sin asignar</span>
                  )}
                  {assignment?.status === "EMPLEADO" && (
                    <p className="font-medium">👤 {person?.full_name ?? "Usuario"}</p>
                  )}
                  {assignment?.status === "FERIADO" && (
                    <Badge variant="secondary">Feriado</Badge>
                  )}
                  {assignment?.status === "CERRADO" && (
                    <Badge variant="outline">Cerrado</Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {editingShift && (
        <AssignmentSheet
          boardId={board.id}
          shift={editingShift}
          dayOfWeek={selectedDay}
          currentAssignment={assignmentsByKey.get(`${editingShift.id}:${selectedDay}`) ?? null}
          members={memberDirectory}
          onOpenChange={(open) => {
            if (!open) setEditingShift(null);
          }}
        />
      )}
    </div>
  );
}
