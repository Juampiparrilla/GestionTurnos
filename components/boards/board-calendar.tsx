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

type EditingCell = { shift: ShiftConfiguration; day: number };

function AssignmentCellContent({
  assignment,
  person,
}: {
  assignment: ShiftAssignment | undefined;
  person: OrgDirectoryEntry | null | undefined;
}) {
  if (!assignment) {
    return <span className="text-muted-foreground">—</span>;
  }
  if (assignment.status === "EMPLEADO") {
    return <span className="font-medium">👤 {person?.full_name ?? "Usuario"}</span>;
  }
  if (assignment.status === "FERIADO") {
    return <Badge variant="secondary">Feriado</Badge>;
  }
  return <Badge variant="outline">Cerrado</Badge>;
}

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
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);

  const directoryById = new Map(directory.map((d) => [d.id, d]));
  const memberDirectory = members
    .map((m) => directoryById.get(m.user_id))
    .filter((d): d is OrgDirectoryEntry => !!d);

  const assignmentsByKey = new Map(
    assignments.map((a) => [`${a.shift_configuration_id}:${a.day_of_week}`, a]),
  );

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

      {shifts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Este tablero todavía no tiene turnos configurados.
        </p>
      ) : (
        <>
          {/* Mobile: selector de día + tarjetas del día seleccionado */}
          <div className="space-y-3 md:hidden">
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

            <div className="grid gap-3">
              {shifts.map((shift) => {
                const assignment = assignmentsByKey.get(`${shift.id}:${selectedDay}`);
                const person = assignment?.user_id
                  ? directoryById.get(assignment.user_id)
                  : null;
                const timeRange = `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)}`;

                return (
                  <button
                    key={shift.id}
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => setEditingCell({ shift, day: selectedDay })}
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
          </div>

          {/* Desktop: grilla completa, turnos x días */}
          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Turno</th>
                  {DAY_LABELS_SHORT.map((label) => (
                    <th key={label} className="p-3 text-left font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => {
                  const timeRange = `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)}`;
                  return (
                    <tr key={shift.id} className="border-b last:border-0">
                      <td className="p-3 align-top">
                        <p className="font-medium">{shift.name ?? timeRange}</p>
                        {shift.name && (
                          <p className="text-xs text-muted-foreground">{timeRange}</p>
                        )}
                      </td>
                      {DAY_LABELS_SHORT.map((_, dayIndex) => {
                        const assignment = assignmentsByKey.get(`${shift.id}:${dayIndex}`);
                        const person = assignment?.user_id
                          ? directoryById.get(assignment.user_id)
                          : null;
                        return (
                          <td key={dayIndex} className="p-3 align-top">
                            {isAdmin ? (
                              <button
                                type="button"
                                onClick={() => setEditingCell({ shift, day: dayIndex })}
                                className="rounded-md px-2 py-1 text-left transition-colors hover:bg-muted/50"
                              >
                                <AssignmentCellContent assignment={assignment} person={person} />
                              </button>
                            ) : (
                              <AssignmentCellContent assignment={assignment} person={person} />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editingCell && (
        <AssignmentSheet
          boardId={board.id}
          shift={editingCell.shift}
          dayOfWeek={editingCell.day}
          currentAssignment={
            assignmentsByKey.get(`${editingCell.shift.id}:${editingCell.day}`) ?? null
          }
          members={memberDirectory}
          onOpenChange={(open) => {
            if (!open) setEditingCell(null);
          }}
        />
      )}
    </div>
  );
}
