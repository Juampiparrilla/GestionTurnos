"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { AssignmentSheet } from "./assignment-sheet";
import { DAY_LABELS_MINI } from "@/types/assignment";
import type { ShiftAssignment } from "@/types/assignment";
import type { Board, BoardMember, OrgDirectoryEntry } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";

type EditingCell = { shift: ShiftConfiguration; day: number };

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

function AssignmentCellContent({
  assignment,
  person,
}: {
  assignment: ShiftAssignment | undefined;
  person: OrgDirectoryEntry | null | undefined;
}) {
  if (!assignment) {
    return <span className="text-muted-foreground">–</span>;
  }
  if (assignment.status === "EMPLEADO") {
    return (
      <span
        title={person?.full_name}
        className="inline-flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary sm:size-7 sm:text-xs"
      >
        {person ? initials(person.full_name) : "?"}
      </span>
    );
  }
  if (assignment.status === "FERIADO") {
    return (
      <span
        title="Feriado"
        className="inline-flex size-6 items-center justify-center rounded-full bg-amber-500/15 text-[10px] font-semibold text-amber-700 dark:text-amber-400 sm:size-7 sm:text-xs"
      >
        F
      </span>
    );
  }
  return (
    <span
      title="Cerrado"
      className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground sm:size-7 sm:text-xs"
    >
      C
    </span>
  );
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
        <div className="rounded-lg border">
          <table className="w-full table-fixed border-collapse text-xs sm:text-sm">
            <colgroup>
              <col className="w-[30%] sm:w-[22%]" />
              {DAY_LABELS_MINI.map((label) => (
                <col key={label} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-1.5 text-left font-medium sm:p-3">Turno</th>
                {DAY_LABELS_MINI.map((label) => (
                  <th key={label} className="p-1 text-center font-medium sm:p-3">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => {
                const timeRange = `${shift.start_time.slice(0, 5)}-${shift.end_time.slice(0, 5)}`;
                return (
                  <tr key={shift.id} className="border-b last:border-0">
                    <td className="p-1.5 align-top sm:p-3">
                      <p className="truncate font-medium">{shift.name ?? timeRange}</p>
                      {shift.name && (
                        <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
                          {timeRange}
                        </p>
                      )}
                    </td>
                    {DAY_LABELS_MINI.map((_, dayIndex) => {
                      const assignment = assignmentsByKey.get(`${shift.id}:${dayIndex}`);
                      const person = assignment?.user_id
                        ? directoryById.get(assignment.user_id)
                        : null;
                      return (
                        <td key={dayIndex} className="p-1 text-center align-middle sm:p-3">
                          {isAdmin ? (
                            <button
                              type="button"
                              onClick={() => setEditingCell({ shift, day: dayIndex })}
                              className="inline-flex rounded-md p-0.5 transition-colors hover:bg-muted/50"
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
