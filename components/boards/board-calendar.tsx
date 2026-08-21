"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toPng } from "html-to-image";
import { Download, Loader2, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { AssignmentSheet } from "./assignment-sheet";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { cn } from "@/lib/utils";
import { buildPersonColorMap, type PersonColor } from "@/lib/person-colors";
import { DAY_LABELS_SHORT } from "@/types/assignment";
import type { ShiftAssignment } from "@/types/assignment";
import type { Board, BoardMember, OrgDirectoryEntry } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";
import type { Holiday } from "@/types/holiday";
import type { Sunday } from "@/types/sunday";

type EditingCell = { shift: ShiftConfiguration; day: number };

const NEUTRAL_COLOR: PersonColor = { bg: "bg-muted", text: "text-muted-foreground" };

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

function AssignmentCellContent({
  assignment,
  person,
  colorByPersonId,
}: {
  assignment: ShiftAssignment | undefined;
  person: OrgDirectoryEntry | null | undefined;
  colorByPersonId: Map<string, PersonColor>;
}) {
  if (!assignment || assignment.status === "SIN_ASIGNAR") {
    return <span className="text-muted-foreground">–</span>;
  }
  if (assignment.status === "EMPLEADO") {
    const color = person ? (colorByPersonId.get(person.id) ?? NEUTRAL_COLOR) : NEUTRAL_COLOR;
    return (
      <span
        title={person?.full_name}
        className={`inline-flex size-6 items-center justify-center rounded-full text-[10px] font-semibold sm:size-7 sm:text-xs ${color.bg} ${color.text}`}
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
      className="inline-flex size-6 items-center justify-center rounded-full bg-red-500/15 text-[10px] font-semibold text-red-700 dark:text-red-400 sm:size-7 sm:text-xs"
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
  holidays,
  sundays,
  isAdmin,
}: {
  board: Board;
  shifts: ShiftConfiguration[];
  assignments: ShiftAssignment[];
  members: BoardMember[];
  directory: OrgDirectoryEntry[];
  holidays: Holiday[];
  sundays: Sunday[];
  isAdmin: boolean;
}) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  async function handleDownload() {
    if (!captureRef.current) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const dataUrl = await toPng(captureRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `${board.name.trim().toLowerCase().replace(/\s+/g, "-")}-turnos.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setDownloadError("No se pudo generar la imagen. Intentá de nuevo.");
    } finally {
      setIsDownloading(false);
    }
  }

  const directoryById = new Map(directory.map((d) => [d.id, d]));
  const memberDirectory = members
    .map((m) => directoryById.get(m.user_id))
    .filter((d): d is OrgDirectoryEntry => !!d)
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  const colorByPersonId = buildPersonColorMap(memberDirectory.map((p) => p.id));

  const assignmentsByKey = new Map(
    assignments.map((a) => [`${a.shift_configuration_id}:${a.day_of_week}`, a]),
  );

  const shiftCountByPersonId = new Map<string, number>();
  for (const a of assignments) {
    if (a.status === "EMPLEADO" && a.user_id) {
      shiftCountByPersonId.set(a.user_id, (shiftCountByPersonId.get(a.user_id) ?? 0) + 1);
    }
  }

  const sundayCountByPersonId = new Map<string, number>();
  for (const s of sundays) {
    sundayCountByPersonId.set(s.user_id, (sundayCountByPersonId.get(s.user_id) ?? 0) + 1);
  }

  const holidayCountByPersonId = new Map<string, number>();
  for (const h of holidays) {
    holidayCountByPersonId.set(h.user_id, (holidayCountByPersonId.get(h.user_id) ?? 0) + 1);
  }

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
        <div className="flex items-center gap-2">
          {shifts.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Descargar horario como imagen"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
            </Button>
          )}
          {isAdmin && (
            <Link
              href={`/tableros/${board.id}/configuracion`}
              aria-label="Configurar horario"
              className={buttonVariants({ variant: "outline", size: "icon" })}
            >
              <Settings className="size-4" />
              <LinkPendingSpinner />
            </Link>
          )}
        </div>
      </div>

      {downloadError && (
        <p role="alert" className="text-sm text-destructive">
          {downloadError}
        </p>
      )}

      <div ref={captureRef} className="space-y-4 bg-background p-2">
        {shifts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Este horario todavía no tiene turnos configurados.
          </p>
        ) : (
          <div className="rounded-lg border">
            <table className="w-full table-fixed border-collapse text-xs sm:text-sm">
              <colgroup>
                <col className="w-[24%] sm:w-[20%]" />
                {DAY_LABELS_SHORT.map((label) => (
                  <col key={label} />
                ))}
              </colgroup>
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-1.5 text-left font-medium sm:p-3">Turno</th>
                  {DAY_LABELS_SHORT.map((label) => (
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
                      {DAY_LABELS_SHORT.map((_, dayIndex) => {
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
                                <AssignmentCellContent
                                  assignment={assignment}
                                  person={person}
                                  colorByPersonId={colorByPersonId}
                                />
                              </button>
                            ) : (
                              <AssignmentCellContent
                                assignment={assignment}
                                person={person}
                                colorByPersonId={colorByPersonId}
                              />
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

        {shifts.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {memberDirectory.map((person) => {
              const color = colorByPersonId.get(person.id) ?? NEUTRAL_COLOR;
              return (
                <span key={person.id} className="inline-flex items-center gap-1">
                  <span
                    className={`inline-flex size-5 items-center justify-center rounded-full text-[9px] font-semibold ${color.bg} ${color.text}`}
                  >
                    {initials(person.full_name)}
                  </span>
                  {person.full_name}
                </span>
              );
            })}
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-amber-500/15 text-[9px] font-semibold text-amber-700 dark:text-amber-400">
                F
              </span>
              Feriado
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-red-500/15 text-[9px] font-semibold text-red-700 dark:text-red-400">
                C
              </span>
              Cerrado
            </span>
          </div>
        )}

        <div className="flex gap-2">
          <Link
            href={`/tableros/${board.id}/domingos`}
            className={cn(buttonVariants({ variant: "default" }), "flex-1 gap-1.5")}
          >
            Domingos
            <LinkPendingSpinner />
          </Link>
          <Link
            href={`/tableros/${board.id}/feriados`}
            className={cn(buttonVariants({ variant: "default" }), "flex-1 gap-1.5")}
          >
            Feriados
            <LinkPendingSpinner />
          </Link>
        </div>

        {shifts.length > 0 && memberDirectory.length > 0 && (
          <div className="rounded-lg border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left font-medium">Persona</th>
                  <th className="p-2 text-right font-medium">Turnos</th>
                  <th className="p-2 text-right font-medium">Domingos</th>
                  <th className="p-2 text-right font-medium">Feriados</th>
                </tr>
              </thead>
              <tbody>
                {memberDirectory.map((person) => {
                  const color = colorByPersonId.get(person.id) ?? NEUTRAL_COLOR;
                  const shiftCount = shiftCountByPersonId.get(person.id) ?? 0;
                  const sundayCount = sundayCountByPersonId.get(person.id) ?? 0;
                  const holidayCount = holidayCountByPersonId.get(person.id) ?? 0;
                  return (
                    <tr key={person.id} className="border-b last:border-0">
                      <td className="p-2">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={`inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${color.bg} ${color.text}`}
                          >
                            {initials(person.full_name)}
                          </span>
                          {person.full_name}
                        </span>
                      </td>
                      <td className="p-2 text-right text-muted-foreground">{shiftCount}</td>
                      <td className="p-2 text-right text-muted-foreground">{sundayCount}</td>
                      <td className="p-2 text-right text-muted-foreground">{holidayCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
